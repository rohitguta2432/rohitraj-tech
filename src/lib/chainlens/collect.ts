// Synced from github.com/rohitguta2432/chainlens (src/collect.ts) — edit there, then run scripts/sync-to-site.sh.
// collect(): all network I/O lives here. It resolves the input, pulls history,
// labels and verified source from Blockscout, reads live state (allowances,
// proxy admin slots, owner(), EIP-7702 delegation) over JSON-RPC, and returns a
// plain-JSON Snapshot. Optional steps that fail are recorded in `gaps` and the
// scan continues — a partial, honest report beats no report.

import { CHAINS, type ChainKey } from "./chains";
import { Blockscout, arr, fetchTags, num, obj, str, toParty, withTags } from "./blockscout";
import { HttpError, mapLimit, type RequestOptions } from "./http";
import { ethCall, getCode, getStorageAt, rpcBatch } from "./rpc";
import { guardedFunctions, scanFlags } from "./source";
import {
    BURN_ADDRESSES,
    PERMIT2,
    SELECTORS,
    SLOTS,
    UNLIMITED_FLOOR,
    decodeAddress,
    decodeString,
    decodeUint,
    delegationTarget,
    encodeCall,
    hasContractCode,
    isAddress,
    sameAddress,
    slotToAddress,
} from "./abi";
import type {
    ApprovalState,
    ContractInfo,
    DecodedApproval,
    Party,
    Snapshot,
    SourceFlags,
    Tag,
    TxLite,
    WalletData,
} from "./types";

export class InputError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InputError";
    }
}

export interface CollectOptions {
    /** Pages of 50 outgoing transactions to scan (default 2 → the latest 100). */
    txPages?: number;
    /** Hard budget for the whole scan in ms (default 25 000). */
    budgetMs?: number;
    /** Per-request timeout in ms (default 8 000). */
    timeoutMs?: number;
    signal?: AbortSignal;
}

const NAME_RE = /^([a-z0-9-]+\.)+eth$/i;
const MAX_APPROVALS = 25;
const MAX_SPENDER_LOOKUPS = 12;
const MAX_AGE_LOOKUPS = 6;

function blankParty(address: string): Party {
    return { address, isContract: false, isVerified: false, isScam: false, name: null, tags: [] };
}

function errMsg(e: unknown): string {
    if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) return "timed out";
    return e instanceof Error ? e.message : String(e);
}

async function resolveInput(input: string, chain: ChainKey, req: RequestOptions): Promise<string> {
    if (isAddress(input)) return input;
    if (!NAME_RE.test(input)) throw new InputError("Enter a 0x… address (40 hex characters) or an ENS name like name.eth");
    // Basenames resolve on Base; everything else on Ethereum mainnet.
    const order: ChainKey[] = chain === "ethereum" ? ["ethereum"] : [chain, "ethereum"];
    for (const c of order) {
        const hit = await new Blockscout(c, req).resolveName(input).catch(() => null);
        if (hit) return hit;
    }
    throw new InputError(`Could not resolve ${input} to an address`);
}

export async function collect(input: string, chain: ChainKey, opts: CollectOptions = {}): Promise<Snapshot> {
    const budget = AbortSignal.timeout(opts.budgetMs ?? 25_000);
    const signal = opts.signal ? AbortSignal.any([opts.signal, budget]) : budget;
    const req: RequestOptions = { timeoutMs: opts.timeoutMs ?? 8_000, signal };
    const cfg = CHAINS[chain];
    const bs = new Blockscout(chain, req);
    const gaps: string[] = [];
    const trimmed = input.trim();

    const address = await resolveInput(trimmed, chain, req);

    const [infoRaw, counters, codeRes] = await Promise.all([
        bs.address(address).catch((e) => {
            if (e instanceof HttpError && e.status === 404) return null;
            throw e;
        }),
        bs.counters(address).catch(() => ({ transactions: 0, tokenTransfers: 0 })),
        rpcBatch(cfg, [getCode(address)], req).catch(() => [null]),
    ]);

    const code = codeRes[0];
    const self = toParty(infoRaw) ?? blankParty(address);
    const delegate = delegationTarget(code);
    const isContract = code !== null ? hasContractCode(code) : self.isContract;
    if (code === null) gaps.push("Could not read bytecode over RPC; relied on the explorer's contract flag.");
    if (!infoRaw) gaps.push(`No activity found for this address on ${cfg.name}.`);

    const snapshot: Snapshot = {
        version: 1,
        chain,
        input: trimmed,
        address: self.address,
        fetchedAt: new Date().toISOString(),
        kind: isContract ? "contract" : "wallet",
        self: { ...self, isContract },
        counters,
        delegation: null,
        wallet: null,
        contract: null,
        gaps,
    };

    if (isContract) {
        snapshot.contract = await collectContract(bs, chain, self.address, infoRaw, req, gaps);
    } else {
        const [wallet, delegateRaw] = await Promise.all([
            collectWallet(bs, chain, self.address, opts, req, gaps),
            delegate ? bs.address(delegate).catch(() => null) : Promise.resolve(null),
        ]);
        snapshot.wallet = wallet;
        if (delegate) snapshot.delegation = { address: delegate, party: toParty(delegateRaw) ?? blankParty(delegate) };
    }

    await applyRegistryTags(snapshot, req);
    return snapshot;
}

// --- wallet ------------------------------------------------------------------

function approvalKey(a: DecodedApproval): string {
    const group = a.kind === "erc20-increase" ? "erc20" : a.kind;
    return `${group}:${a.token.toLowerCase()}:${a.spender.toLowerCase()}`;
}

async function collectWallet(
    bs: Blockscout,
    chain: ChainKey,
    owner: string,
    opts: CollectOptions,
    req: RequestOptions,
    gaps: string[],
): Promise<WalletData> {
    const cfg = CHAINS[chain];
    const pages = Math.min(Math.max(opts.txPages ?? 2, 1), 6);

    const [txs, inbound, outbound] = await Promise.all([
        bs.outgoingTransactions(owner, pages).catch((e) => {
            gaps.push(`Could not load transactions (${errMsg(e)}).`);
            return [] as TxLite[];
        }),
        bs.tokenTransfers(owner, "to").catch((e) => {
            gaps.push(`Could not load incoming token transfers (${errMsg(e)}).`);
            return [];
        }),
        bs.tokenTransfers(owner, "from").catch((e) => {
            gaps.push(`Could not load outgoing token transfers (${errMsg(e)}).`);
            return [];
        }),
    ]);

    // Latest approval per (token, spender). txs are newest-first.
    const latest = new Map<string, { approval: DecodedApproval; tx: TxLite }>();
    for (const tx of txs) {
        if (!tx.approval) continue;
        const key = approvalKey(tx.approval);
        if (!latest.has(key)) latest.set(key, { approval: tx.approval, tx });
    }
    const candidates = [...latest.values()].slice(0, MAX_APPROVALS);
    if (latest.size > MAX_APPROVALS) gaps.push(`Checked the ${MAX_APPROVALS} most recent approvals of ${latest.size} found.`);

    // Live state: allowance / isApprovedForAll / Permit2 allowance, plus token metadata.
    const tokenAddrs = [
        ...new Set(candidates.filter((c) => c.approval.kind !== "operator").map((c) => c.approval.token.toLowerCase())),
    ];
    const calls = [
        ...candidates.map(({ approval: a }) =>
            a.kind === "operator"
                ? ethCall(a.token, encodeCall(SELECTORS.isApprovedForAll, owner, a.spender))
                : a.kind === "permit2"
                  ? ethCall(PERMIT2, encodeCall(SELECTORS.permit2Allowance, owner, a.token, a.spender))
                  : ethCall(a.token, encodeCall(SELECTORS.allowance, owner, a.spender)),
        ),
        ...tokenAddrs.flatMap((t) => [ethCall(t, SELECTORS.symbol), ethCall(t, SELECTORS.decimals), ethCall(t, SELECTORS.totalSupply)]),
    ];

    // Unverified contracts this wallet called → creation time and deployer (fresh-contract check).
    const unverified = [
        ...new Map(
            txs.filter((t) => t.to?.isContract && !t.to.isVerified && t.selector).map((t) => [t.to!.address.toLowerCase(), t.to!.address]),
        ).values(),
    ].slice(0, MAX_AGE_LOOKUPS);
    const spenderAddrs = [...new Set(candidates.map((c) => c.approval.spender.toLowerCase()))].slice(0, MAX_SPENDER_LOOKUPS);

    let rpcOk = true;
    const [live, spenderRaw, ages] = await Promise.all([
        calls.length
            ? rpcBatch(cfg, calls, req).catch((e) => {
                  rpcOk = false;
                  gaps.push(`Could not read live allowances over RPC (${errMsg(e)}); approvals shown as last granted.`);
                  return new Array<string | null>(calls.length).fill(null);
              })
            : Promise.resolve([] as (string | null)[]),
        mapLimit(spenderAddrs, 6, (s) => bs.address(s)),
        mapLimit(unverified, 6, async (c) => {
            const raw = await bs.address(c);
            const hash = str(raw.creation_transaction_hash) ?? str(raw.creation_tx_hash);
            const creator = str(raw.creator_address_hash);
            const tx = hash ? await bs.txInfo(hash) : { timestamp: null, from: null };
            return { createdAt: tx.timestamp, deployedBySelf: sameAddress(creator, owner) || sameAddress(tx.from, owner) };
        }),
    ]);

    const tokenMeta = new Map<string, { symbol: string | null; decimals: number | null; totalSupply: string | null }>();
    tokenAddrs.forEach((t, i) => {
        const base = candidates.length + i * 3;
        const dec = decodeUint(live[base + 1]);
        const supply = decodeUint(live[base + 2]);
        tokenMeta.set(t, {
            symbol: decodeString(live[base]),
            decimals: dec !== null && dec <= BigInt(36) ? Number(dec) : null,
            totalSupply: supply !== null ? supply.toString() : null,
        });
    });

    const spenders = new Map<string, Party>();
    spenderAddrs.forEach((s, i) => spenders.set(s, toParty(spenderRaw[i]) ?? blankParty(s)));

    const nowSec = Math.floor(Date.now() / 1000);
    const approvals: ApprovalState[] = [];
    candidates.forEach(({ approval: a, tx }, i) => {
        const ret = live[i] ?? null;
        const meta = tokenMeta.get(a.token.toLowerCase()) ?? { symbol: null, decimals: null, totalSupply: null };
        let current: bigint | null;
        let expiration: number | undefined;
        if (a.kind === "operator") {
            current = decodeUint(ret);
        } else if (a.kind === "permit2") {
            current = decodeUint(ret, 0);
            const exp = decodeUint(ret, 1);
            expiration = exp !== null ? Number(exp) : a.expiration;
            if (current !== null && expiration !== undefined && expiration < nowSec) current = BigInt(0); // expired
        } else {
            current = decodeUint(ret);
            // approve(address,uint256) is also ERC-721's single-token approve: no allowance(), no decimals().
            // Those clear on transfer and can't drain a wallet, so they're skipped.
            if (rpcOk && current === null && meta.decimals === null) return;
        }
        const granted = a.amount !== null ? BigInt(a.amount) : null;
        const effective = current ?? granted;
        const supply = meta.totalSupply !== null ? BigInt(meta.totalSupply) : null;
        const unlimited =
            a.kind !== "operator" &&
            effective !== null &&
            (effective >= UNLIMITED_FLOOR || (supply !== null && supply > BigInt(0) && effective >= supply));
        approvals.push({
            kind: a.kind,
            token: { address: a.token, ...meta },
            spender: spenders.get(a.spender.toLowerCase()) ?? blankParty(a.spender),
            grantedAt: tx.timestamp,
            txHash: tx.hash,
            current: current !== null ? current.toString() : a.kind === "operator" ? (a.approved ? "1" : "0") : a.amount,
            unlimited,
            ...(expiration !== undefined ? { expiration } : {}),
        });
    });

    const contractAges: Record<string, string | null> = {};
    const ownContracts: string[] = [];
    unverified.forEach((c, i) => {
        const k = c.toLowerCase();
        contractAges[k] = ages[i]?.createdAt ?? null;
        if (ages[i]?.deployedBySelf) ownContracts.push(k);
    });

    return { txs, approvals, inbound, outbound, contractAges, ownContracts };
}

// --- contract ----------------------------------------------------------------

function abiWriteFunctions(abi: unknown): string[] {
    const names = new Set<string>();
    for (const item of arr(abi)) {
        const f = obj(item);
        if (!f || f.type !== "function") continue;
        const mut = str(f.stateMutability);
        const readOnly = mut === "view" || mut === "pure" || f.constant === true;
        const name = str(f.name);
        if (!readOnly && name) names.add(name);
    }
    return [...names];
}

function allSource(sc: Record<string, unknown> | null): string {
    if (!sc) return "";
    return [str(sc.source_code) ?? "", ...arr(sc.additional_sources).map((s) => str(obj(s)?.source_code) ?? "")].join("\n");
}

/** ABI write functions + which of them the source guards + risky opcodes. */
function codeFacts(sc: Record<string, unknown> | null): {
    writeFunctions: string[];
    guardedFunctions: string[];
    sourceFlags: SourceFlags;
} {
    const writeFunctions = abiWriteFunctions(sc?.abi);
    const src = allSource(sc);
    const writable = new Set(writeFunctions);
    return {
        writeFunctions,
        guardedFunctions: guardedFunctions(src).filter((f) => writable.has(f)),
        sourceFlags: src ? scanFlags(src) : { selfdestruct: false, delegatecall: false },
    };
}

async function collectContract(
    bs: Blockscout,
    chain: ChainKey,
    address: string,
    infoRaw: Record<string, unknown> | null,
    req: RequestOptions,
    gaps: string[],
): Promise<ContractInfo> {
    const cfg = CHAINS[chain];
    const info = infoRaw ?? {};
    const isVerified = info.is_verified === true;
    const proxyType = str(info.proxy_type);
    const implRaw = arr(info.implementations).map(obj).find(Boolean) ?? null;
    const implAddr = str(implRaw?.address_hash) ?? str(implRaw?.address);
    const creationHash = str(info.creation_transaction_hash) ?? str(info.creation_tx_hash);
    const creatorAddr = str(info.creator_address_hash);
    const tokenRaw = obj(info.token);
    const tokenType = str(tokenRaw?.type);

    const [sc, implInfo, created, creatorRaw, slots, holders] = await Promise.all([
        isVerified ? bs.smartContract(address).catch(() => null) : Promise.resolve(null),
        implAddr ? bs.address(implAddr).catch(() => null) : Promise.resolve(null),
        creationHash ? bs.txInfo(creationHash).catch(() => null) : Promise.resolve(null),
        creatorAddr ? bs.address(creatorAddr).catch(() => null) : Promise.resolve(null),
        rpcBatch(
            cfg,
            [getStorageAt(address, SLOTS.eip1967Admin), getStorageAt(address, SLOTS.zosAdmin), ethCall(address, SELECTORS.owner)],
            req,
        ).catch((e) => {
            gaps.push(`Could not read proxy admin / owner over RPC (${errMsg(e)}).`);
            return [null, null, null];
        }),
        tokenType === "ERC-20" ? bs.topHolders(address).catch(() => null) : Promise.resolve(null),
    ]);
    if (isVerified && !sc) gaps.push("Verified source could not be loaded; admin-function checks skipped.");

    const implVerified = obj(implInfo)?.is_verified === true;
    const adminAddr = slotToAddress(slots[0]) ?? slotToAddress(slots[1]);
    const ownerAddr = decodeAddress(slots[2]);
    const renounced = !!ownerAddr && BURN_ADDRESSES.has(ownerAddr.toLowerCase());
    const controllers = [adminAddr, ownerAddr && !renounced ? ownerAddr : null].filter((a): a is string => !!a);

    // Implementation source, and who the admin / owner are (explorer view gives labels + contract flag).
    const [implSc, controllerRaw] = await Promise.all([
        implAddr && implVerified ? bs.smartContract(implAddr).catch(() => null) : Promise.resolve(null),
        mapLimit(controllers, 4, (a) => bs.address(a)),
    ]);
    const controllerParty = (a: string | null): Party | null => {
        if (!a) return null;
        const i = controllers.findIndex((c) => sameAddress(c, a));
        return i >= 0 ? toParty(controllerRaw[i]) : null;
    };
    // Explorer's is_contract can lag; fall back to bytecode when it's missing.
    const unresolved = controllers.filter((a) => !controllerParty(a));
    const codes = unresolved.length ? await rpcBatch(cfg, unresolved.map(getCode), req).catch(() => []) : [];
    const kindOf = (a: string): "eoa" | "contract" | null => {
        const p = controllerParty(a);
        if (p) return p.isContract ? "contract" : "eoa";
        const c = codes[unresolved.findIndex((u) => sameAddress(u, a))];
        return c === undefined || c === null ? null : hasContractCode(c) ? "contract" : "eoa";
    };
    const adminKind = adminAddr ? kindOf(adminAddr) : null;
    const ownerKind = ownerAddr && !renounced ? kindOf(ownerAddr) : null;

    return {
        isVerified,
        name: str(obj(sc)?.name) ?? str(info.name),
        language: str(obj(sc)?.language),
        compiler: str(obj(sc)?.compiler_version),
        ...codeFacts(obj(sc)),
        proxyType,
        implementation: implAddr
            ? {
                  address: implAddr,
                  name: str(implRaw?.name) ?? str(obj(implSc)?.name),
                  isVerified: implVerified,
                  ...codeFacts(obj(implSc)),
              }
            : null,
        admin:
            adminAddr && adminKind
                ? { address: controllerParty(adminAddr)?.address ?? adminAddr, kind: adminKind, party: controllerParty(adminAddr) }
                : null,
        owner: ownerAddr
            ? renounced
                ? { address: ownerAddr, kind: "renounced", party: null }
                : ownerKind
                  ? { address: controllerParty(ownerAddr)?.address ?? ownerAddr, kind: ownerKind, party: controllerParty(ownerAddr) }
                  : null
            : null,
        createdAt: created?.timestamp ?? null,
        creator: creatorAddr ? (toParty(creatorRaw) ?? blankParty(creatorAddr)) : null,
        token: tokenRaw
            ? {
                  type: tokenType ?? "unknown",
                  symbol: str(tokenRaw.symbol),
                  name: str(tokenRaw.name),
                  holders: num(tokenRaw.holders_count ?? tokenRaw.holders),
                  totalSupply: str(tokenRaw.total_supply),
                  decimals: num(tokenRaw.decimals),
                  topHolders: holders ?? [],
              }
            : null,
    };
}

// --- registry tags -------------------------------------------------------------

/** One batched registry lookup for every party in the snapshot, merged in place. */
async function applyRegistryTags(s: Snapshot, req: RequestOptions): Promise<void> {
    const parties: Party[] = [s.self];
    if (s.delegation?.party) parties.push(s.delegation.party);
    if (s.wallet) {
        for (const t of s.wallet.txs) if (t.to) parties.push(t.to);
        for (const a of s.wallet.approvals) parties.push(a.spender);
        for (const t of [...s.wallet.inbound, ...s.wallet.outbound]) parties.push(t.from, t.to);
    }
    if (s.contract) {
        const c = s.contract;
        for (const p of [c.creator, c.admin?.party, c.owner?.party]) if (p) parties.push(p);
        for (const h of c.token?.topHolders ?? []) parties.push(h.party);
    }
    const addrs = [...new Set(parties.map((p) => p.address.toLowerCase()))].slice(0, 200);
    let tags: Map<string, Tag[]>;
    try {
        tags = await fetchTags(s.chain, addrs, req);
    } catch (e) {
        s.gaps.push(`Tag registry lookup failed (${errMsg(e)}); scam labels limited to explorer flags.`);
        return;
    }
    const t = (p: Party) => withTags(p, tags);
    s.self = t(s.self);
    if (s.delegation?.party) s.delegation.party = t(s.delegation.party);
    if (s.wallet) {
        for (const tx of s.wallet.txs) if (tx.to) tx.to = t(tx.to);
        for (const a of s.wallet.approvals) a.spender = t(a.spender);
        for (const tr of [...s.wallet.inbound, ...s.wallet.outbound]) {
            tr.from = t(tr.from);
            tr.to = t(tr.to);
        }
    }
    if (s.contract) {
        const c = s.contract;
        if (c.creator) c.creator = t(c.creator);
        if (c.admin?.party) c.admin.party = t(c.admin.party);
        if (c.owner?.party) c.owner.party = t(c.owner.party);
        if (c.token) c.token.topHolders = c.token.topHolders.map((h) => ({ ...h, party: t(h.party) }));
    }
}
