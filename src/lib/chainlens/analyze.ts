// Synced from github.com/rohitguta2432/chainlens (src/analyze.ts) — edit there, then run scripts/sync-to-site.sh.
// analyze(): pure functions from a Snapshot to Findings. No I/O, no clock
// (ages are measured against snapshot.fetchedAt), so a recorded snapshot
// always produces the same report — that's what the eval suite relies on.

import { addressUrl, txUrl } from "./chains";
import { formatUnits, isLookalike, sameAddress, shortAddress } from "./abi";
import { displayName, isScamToken, partyThreat } from "./tags";
import type { ApprovalState, ContractInfo, Evidence, Finding, Party, Severity, Snapshot, WalletData } from "./types";
import { SEVERITIES } from "./types";

const DAY_MS = 86_400_000;

function label(p: Party): string {
    const n = displayName(p);
    return n ? `${n} (${shortAddress(p.address)})` : p.address;
}

function date(iso: string): string {
    return iso ? iso.slice(0, 10) : "unknown date";
}

function partyEv(s: Snapshot, name: string, p: Party): Evidence {
    return { label: name, value: label(p), href: addressUrl(s.chain, p.address) };
}

function plural(n: number, one: string, many = one + "s"): string {
    return `${n} ${n === 1 ? one : many}`;
}

// --- shared --------------------------------------------------------------------

function flaggedSelf(s: Snapshot): Finding[] {
    const t = partyThreat(s.self);
    if (!t.flagged) return [];
    return [
        {
            id: "flagged-address",
            severity: "critical",
            title: `This ${s.kind === "contract" ? "contract" : "address"} is flagged as malicious`,
            detail: `It is ${t.reasons.join(", ")}. Addresses carrying these labels have been reported for phishing, theft or scams.`,
            evidence: [partyEv(s, "Address", s.self), ...t.reasons.map((r) => ({ label: "Signal", value: r }))],
            remediation:
                "Do not send funds to it or approve it to spend anything. If you already did, revoke its approvals and move assets to a fresh wallet.",
        },
    ];
}

// --- wallet --------------------------------------------------------------------

function isActive(a: ApprovalState): boolean {
    return a.current === null || BigInt(a.current) > BigInt(0);
}

function approvalAmount(a: ApprovalState): string {
    if (a.kind === "operator") return "every NFT in the collection";
    const sym = a.token.symbol ?? "tokens";
    if (a.unlimited) return `unlimited ${sym}`;
    return `${formatUnits(a.current, a.token.decimals)} ${sym}`;
}

function approvalEv(s: Snapshot, a: ApprovalState): Evidence {
    const via = a.kind === "permit2" ? " via Permit2" : "";
    const tokenName = a.token.symbol ?? shortAddress(a.token.address);
    return {
        label: `${tokenName} → ${label(a.spender)}`,
        value: `${approvalAmount(a)}${via} · granted ${date(a.grantedAt)}`,
        href: txUrl(s.chain, a.txHash),
    };
}

const REVOKE =
    "Revoke it (for example at revoke.cash, or with the explorer's token-approval checker). Revoking costs a little gas and removes the spender's access immediately.";

function approvalFindings(s: Snapshot, w: WalletData): Finding[] {
    const active = w.approvals.filter(isActive);
    const toFlagged: ApprovalState[] = [];
    const toEoa: ApprovalState[] = [];
    const toUnverified: ApprovalState[] = [];
    const broad: ApprovalState[] = [];

    for (const a of active) {
        if (partyThreat(a.spender).flagged) toFlagged.push(a);
        else if (!a.spender.isContract) toEoa.push(a);
        else if (!a.spender.isVerified) toUnverified.push(a);
        else if (a.unlimited || a.kind === "operator") broad.push(a);
    }

    const out: Finding[] = [];
    if (toFlagged.length) {
        out.push({
            id: "approval-to-flagged",
            severity: "critical",
            title: `${plural(toFlagged.length, "live approval")} to a flagged address`,
            detail:
                "An address tagged for phishing or theft can still move these tokens out of your wallet — no further signature needed. This is exactly how wallet drainers work.",
            evidence: toFlagged.map((a) => approvalEv(s, a)),
            remediation: `${REVOKE} Do it now, from a device you trust.`,
        });
    }
    if (toEoa.length) {
        out.push({
            id: "approval-to-eoa",
            severity: "high",
            title: `${plural(toEoa.length, "approval")} to a personal wallet, not a contract`,
            detail:
                "Legitimate apps ask you to approve their smart contracts. An approval to a plain wallet address lets whoever holds that key spend your tokens directly — a classic phishing pattern.",
            evidence: toEoa.map((a) => approvalEv(s, a)),
            remediation: `${REVOKE} Unless you knowingly approved a person you trust, treat it as hostile.`,
        });
    }
    if (toUnverified.length) {
        const severe = toUnverified.some((a) => a.unlimited || a.kind === "operator");
        out.push({
            id: "approval-to-unverified",
            severity: severe ? "high" : "medium",
            title: `${plural(toUnverified.length, "approval")} to unverified contracts`,
            detail:
                "These spenders haven't published their source code, so nobody can check what they do with your tokens. Most drainer contracts are unverified.",
            evidence: toUnverified.map((a) => approvalEv(s, a)),
            remediation: REVOKE,
        });
    }
    if (broad.length) {
        const unnamed = broad.filter((a) => !displayName(a.spender));
        out.push({
            id: "unlimited-approval",
            severity: unnamed.length ? "medium" : "low",
            title: `${plural(broad.length, "unlimited approval")} still active`,
            detail:
                "Common with DeFi apps, but each one is standing permission: if that contract is ever exploited or upgraded maliciously, your full balance of the token is exposed.",
            evidence: broad.map((a) => approvalEv(s, a)),
            remediation: "Revoke the ones you no longer use, and prefer exact-amount approvals for one-off interactions.",
        });
    }
    return out;
}

function flaggedCounterparties(s: Snapshot, w: WalletData): Finding[] {
    const hits: Evidence[] = [];
    let movedValue = false;
    const seen = new Set<string>();
    for (const tx of w.txs) {
        if (!tx.to || !partyThreat(tx.to).flagged || seen.has(tx.hash)) continue;
        seen.add(tx.hash);
        if (BigInt(tx.value) > BigInt(0) || tx.approval) movedValue = true;
        hits.push({
            label: `${tx.method ?? "transfer"} → ${label(tx.to)}`,
            value: `${partyThreat(tx.to).reasons[0]} · ${date(tx.timestamp)}`,
            href: txUrl(s.chain, tx.hash),
        });
    }
    const initiated = new Set(w.txs.map((t) => t.hash.toLowerCase()));
    for (const tr of w.outbound) {
        if (!partyThreat(tr.to).flagged || seen.has(tr.txHash) || !initiated.has(tr.txHash.toLowerCase())) continue;
        seen.add(tr.txHash);
        movedValue = true;
        hits.push({
            label: `sent ${tr.token.symbol ?? "tokens"} → ${label(tr.to)}`,
            value: `${partyThreat(tr.to).reasons[0]} · ${date(tr.timestamp)}`,
            href: txUrl(s.chain, tr.txHash),
        });
    }
    if (!hits.length) return [];
    return [
        {
            id: "interacted-with-flagged",
            severity: movedValue ? "critical" : "high",
            title: `Transacted with ${plural(hits.length, "flagged address", "flagged addresses")}`,
            detail: movedValue
                ? "This wallet sent funds or granted access to addresses labelled for phishing or theft."
                : "This wallet called addresses labelled for phishing or theft.",
            evidence: hits.slice(0, 8),
            remediation:
                "Check for approvals those addresses still hold and revoke them. If you signed anything you didn't understand, move remaining assets to a new wallet.",
        },
    ];
}

/**
 * Address poisoning: attackers grind vanity addresses matching the first and
 * last characters of someone you pay, then plant them in your history
 * (zero-value transferFrom or fake-token "dust") hoping you copy the wrong one.
 */
function poisoning(s: Snapshot, w: WalletData): Finding[] {
    const initiated = new Set(w.txs.map((t) => t.hash.toLowerCase()));

    // Who this wallet genuinely paid, and when first.
    const paid = new Map<string, { party: Party; first: string; hash: string }>();
    const notePaid = (p: Party, ts: string, hash: string) => {
        if (sameAddress(p.address, s.address)) return;
        const k = p.address.toLowerCase();
        const cur = paid.get(k);
        if (!cur || ts < cur.first) paid.set(k, { party: p, first: ts, hash });
    };
    for (const t of w.txs) if (t.to && !t.to.isContract && BigInt(t.value) > BigInt(0)) notePaid(t.to, t.timestamp, t.hash);
    for (const tr of w.outbound) {
        if (initiated.has(tr.txHash.toLowerCase()) && tr.value !== "0") notePaid(tr.to, tr.timestamp, tr.txHash);
    }

    const out: Finding[] = [];
    const paidList = [...paid.values()];

    // Critical: two different recipients that look alike — one of them was likely planted.
    const pairs: Evidence[] = [];
    for (let i = 0; i < paidList.length; i++) {
        for (let j = i + 1; j < paidList.length; j++) {
            const [a, b] = paidList[i].first <= paidList[j].first ? [paidList[i], paidList[j]] : [paidList[j], paidList[i]];
            if (!isLookalike(a.party.address, b.party.address)) continue;
            pairs.push(
                { label: "Paid first", value: `${a.party.address} · ${date(a.first)}`, href: txUrl(s.chain, a.hash) },
                { label: "Lookalike paid later", value: `${b.party.address} · ${date(b.first)}`, href: txUrl(s.chain, b.hash) },
            );
        }
    }
    if (pairs.length) {
        out.push({
            id: "poisoned-payment",
            severity: "critical",
            title: "Funds sent to a lookalike address",
            detail:
                "This wallet paid two different addresses that share the same first and last characters. The odds of that by chance are about 1 in 4 billion — one of them was almost certainly planted by an address-poisoning attacker.",
            evidence: pairs.slice(0, 6),
            remediation:
                "Confirm with the recipient which address is real. Never copy addresses from your transaction history; use an address book or verify every character.",
        });
    }

    // High: lookalikes planted in the history but not (yet) paid.
    const planted = new Map<string, Evidence>();
    const consider = (suspect: Party, hash: string, ts: string, how: string) => {
        const k = suspect.address.toLowerCase();
        if (paid.has(k) || planted.has(k) || sameAddress(suspect.address, s.address)) return;
        const victim = paidList.find((p) => isLookalike(p.party.address, suspect.address));
        if (!victim) return;
        planted.set(k, {
            label: `${how} · ${date(ts)}`,
            value: `${suspect.address} imitates ${victim.party.address}`,
            href: txUrl(s.chain, hash),
        });
    };
    for (const tr of w.inbound) consider(tr.from, tr.txHash, tr.timestamp, `${tr.token.symbol ?? "token"} received from lookalike`);
    for (const tr of w.outbound) {
        if (!initiated.has(tr.txHash.toLowerCase())) {
            consider(tr.to, tr.txHash, tr.timestamp, `${tr.value === "0" ? "zero-value " : ""}${tr.token.symbol ?? "token"} transfer you didn't send`);
        }
    }
    if (planted.size) {
        out.push({
            id: "address-poisoning",
            severity: "high",
            title: `Address-poisoning attempt${planted.size > 1 ? "s" : ""} in this wallet's history`,
            detail:
                "Someone created addresses that mimic the start and end of addresses this wallet pays, and planted them in its history so they appear in 'recent' lists.",
            evidence: [...planted.values()].slice(0, 6),
            remediation:
                "Don't copy recipients from transaction history. Double-check the full address (not just the first and last characters) before every transfer.",
        });
    }
    return out;
}

function unverifiedInteractions(s: Snapshot, w: WalletData): Finding[] {
    const own = new Set(w.ownContracts);
    const byContract = new Map<string, { party: Party; calls: number; first: string; last: string; exposed: boolean }>();
    for (const t of w.txs) {
        if (!t.to || !t.to.isContract || t.to.isVerified || !t.selector || t.status !== "ok") continue;
        if (partyThreat(t.to).flagged) continue; // reported as critical elsewhere
        // The wallet's own deployments and registry-labelled infrastructure (e.g. the
        // Deterministic Deployer) are unverified by nature, not a warning sign.
        if (own.has(t.to.address.toLowerCase()) || displayName(t.to)) continue;
        const k = t.to.address.toLowerCase();
        const sentValue = BigInt(t.value) > BigInt(0);
        const cur = byContract.get(k);
        if (cur) {
            cur.calls++;
            cur.exposed ||= sentValue;
            if (t.timestamp < cur.first) cur.first = t.timestamp;
            if (t.timestamp > cur.last) cur.last = t.timestamp;
        } else byContract.set(k, { party: t.to, calls: 1, first: t.timestamp, last: t.timestamp, exposed: sentValue });
    }
    // Granting a contract an approval exposes funds as much as sending them.
    for (const a of w.approvals) {
        const c = byContract.get(a.spender.address.toLowerCase());
        if (c) c.exposed = true;
    }

    const out: Finding[] = [];
    const fresh: Evidence[] = [];
    let freshExposed = false;
    for (const [k, c] of [...byContract]) {
        const created = w.contractAges[k];
        if (!created || !c.first) continue;
        const ageDays = (Date.parse(c.first) - Date.parse(created)) / DAY_MS;
        if (ageDays >= 0 && ageDays < 7) {
            byContract.delete(k); // reported once, in the fresh-contract finding
            freshExposed ||= c.exposed;
            fresh.push({
                label: label(c.party),
                value: `called ${ageDays < 1 ? "less than a day" : plural(Math.floor(ageDays), "day")} after it was deployed${c.exposed ? " · you sent it funds or an approval" : ""}`,
                href: addressUrl(s.chain, c.party.address),
            });
        }
    }
    if (fresh.length) {
        out.push({
            id: "fresh-unverified-contract",
            severity: freshExposed ? "high" : "medium",
            title: `Called ${plural(fresh.length, "brand-new unverified contract")}`,
            detail: freshExposed
                ? "This wallet sent value to, or approved, a contract that was days old and had no published source — the typical profile of a drainer or rug-pull."
                : "Drainers and rug-pulls usually deploy days before an attack and never publish source. No funds or approvals went to these, which lowers the risk.",
            evidence: fresh,
            remediation: freshExposed
                ? "Revoke any approvals to these contracts now and be wary of the site that led you there."
                : "Be wary of the site that sent you to these contracts; don't approve them.",
        });
    }
    if (byContract.size) {
        const list = [...byContract.values()].sort((a, b) => b.calls - a.calls);
        out.push({
            id: "unverified-interaction",
            severity: "medium",
            title: `Interacted with ${plural(byContract.size, "unverified contract")}`,
            detail:
                "Their source code isn't published, so what they did with your transaction can't be checked. Plenty are harmless (bots, new protocols), but most malicious contracts are unverified too.",
            evidence: list.slice(0, 5).map((c) => ({
                label: label(c.party),
                value: `${plural(c.calls, "call")} · last ${date(c.last)}`,
                href: addressUrl(s.chain, c.party.address),
            })),
            remediation: "Only interact with contracts you can verify; check any approvals you granted to them.",
        });
    }
    return out;
}

function scamAirdrops(s: Snapshot, w: WalletData): Finding[] {
    const tokens = new Map<string, Evidence>();
    for (const tr of w.inbound) {
        if (!isScamToken(tr.token)) continue;
        const k = tr.token.address.toLowerCase();
        if (!tokens.has(k)) {
            tokens.set(k, {
                label: tr.token.symbol ?? "token",
                value: `${tr.token.name ?? "unnamed"} · ${date(tr.timestamp)}`,
                href: addressUrl(s.chain, tr.token.address),
            });
        }
    }
    if (!tokens.size) return [];
    return [
        {
            id: "scam-token-airdrops",
            severity: "low",
            title: `Received ${plural(tokens.size, "scam token")}`,
            detail:
                "Unsolicited tokens whose name advertises a website or a 'claim' are bait: the site asks you to connect and sign, then drains the wallet. Receiving them is harmless; interacting isn't.",
            evidence: [...tokens.values()].slice(0, 5),
            remediation: "Ignore or hide them. Don't visit the sites they name and don't try to sell or claim them.",
        },
    ];
}

function delegation(s: Snapshot): Finding[] {
    const d = s.delegation;
    if (!d) return [];
    const p = d.party;
    const threat = partyThreat(p);
    if (threat.flagged || !p || !p.isVerified) {
        return [
            {
                id: "eip7702-delegation",
                severity: "critical",
                title: threat.flagged ? "Account delegated to a flagged contract" : "Account delegated to unverified code",
                detail:
                    "Through EIP-7702 this wallet has handed control of its account to another contract's code, which runs on every call to the account. Delegating to malicious 'sweeper' code is how many post-Pectra drains happened.",
                evidence: [
                    { label: "Delegate", value: p ? label(p) : d.address, href: addressUrl(s.chain, d.address) },
                    ...threat.reasons.map((r) => ({ label: "Signal", value: r })),
                ],
                remediation:
                    "If you didn't deliberately upgrade to a smart account, move assets to a new wallet — clearing the delegation needs the same compromised key.",
            },
        ];
    }
    return [
        {
            id: "eip7702-delegation",
            severity: "low",
            title: "Account uses an EIP-7702 smart-account delegation",
            detail: `This wallet runs the verified contract ${label(p)} as its account code. That's expected if you upgraded to a smart account on purpose.`,
            evidence: [{ label: "Delegate", value: label(p), href: addressUrl(s.chain, p.address) }],
            remediation: "Make sure you recognise this delegation. If you don't, treat the wallet as compromised.",
        },
    ];
}

// --- contract ------------------------------------------------------------------

interface PowerRule {
    key: string;
    label: string;
    re: RegExp;
    dangerous: boolean;
}

const POWERS: PowerRule[] = [
    { key: "mint", label: "mint new supply", re: /^(mint\w*|issue|configureMinter|increaseSupply)$/i, dangerous: true },
    { key: "blacklist", label: "freeze or blacklist individual addresses", re: /(black|block|deny)list|freeze|setBots?|addBots?|blockAccount|setBlocked/i, dangerous: true },
    { key: "fees", label: "change transfer fees or taxes", re: /^(set|update|change)\w*(fee|tax)\w*$/i, dangerous: true },
    { key: "limits", label: "restrict trading (limits or an on/off switch)", re: /^(setMax(Tx|Wallet|Transaction)\w*|enableTrading|openTrading|setTrading\w*|setSwapEnabled|setLimits\w*)$/i, dangerous: true },
    { key: "pause", label: "pause all transfers", re: /^(pause|unpause|setPaused|togglePause|emergencyPause)$/i, dangerous: false },
    { key: "rescue", label: "pull out tokens the contract holds", re: /^(rescue\w*|sweep\w*|recover(ERC20|Token|Tokens|ETH|Eth)\w*|withdrawStuck\w*|emergencyWithdraw\w*)$/i, dangerous: false },
];

function powersOf(c: ContractInfo): { rule: PowerRule; fns: string[] }[] {
    const fns = c.implementation?.isVerified ? c.implementation.guardedFunctions : c.guardedFunctions;
    return POWERS.map((rule) => ({ rule, fns: fns.filter((f) => rule.re.test(f)) })).filter((p) => p.fns.length > 0);
}

function isSafeProxy(c: ContractInfo): boolean {
    return c.proxyType === "master_copy" || /(^|\W)(gnosis)?safe(proxy)?\b/i.test(c.name ?? "");
}

function contractFindings(s: Snapshot, c: ContractInfo): Finding[] {
    const out: Finding[] = [];
    const self = s.self;

    const creatorThreat = partyThreat(c.creator);
    if (c.creator && creatorThreat.flagged) {
        out.push({
            id: "creator-flagged",
            severity: "critical",
            title: "Deployed by a flagged address",
            detail: `The deployer is ${creatorThreat.reasons.join(", ")}. Scammers reuse deployer wallets across rug-pulls and drainer contracts.`,
            evidence: [partyEv(s, "Deployer", c.creator)],
            remediation: "Avoid interacting with this contract.",
        });
    }

    if (!c.isVerified) {
        // A labelled contract with a year-plus track record (e.g. an old multisig) is a
        // different risk from a fresh, anonymous one.
        const ageDays = c.createdAt ? (Date.parse(s.fetchedAt) - Date.parse(c.createdAt)) / DAY_MS : 0;
        const established = !!displayName(self) && ageDays > 365 && !partyThreat(self).flagged;
        out.push({
            id: "unverified-source",
            severity: established ? "medium" : "high",
            title: "Source code is not verified",
            detail: established
                ? `Only its bytecode is public, so its behaviour can't be read. It is labelled "${displayName(self)}" and has existed since ${date(c.createdAt ?? "")}, which makes a fresh scam unlikely — but it's still unauditable.`
                : "Nobody can read what this contract does — only its bytecode is public. Drainers and honeypot tokens are almost always unverified.",
            evidence: [partyEv(s, "Contract", self), ...(c.createdAt ? [{ label: "Created", value: date(c.createdAt) }] : [])],
            remediation: established
                ? "Interact only through the project's official interface, and ask them to verify the source."
                : "Don't approve it or send it funds unless its developers publish and verify the source.",
        });
    }

    const proxy = c.proxyType && c.proxyType !== "eip7702" && !isSafeProxy(c);
    if (proxy) {
        if (c.implementation && !c.implementation.isVerified) {
            out.push({
                id: "unverified-implementation",
                severity: "critical",
                title: "Proxy points to unverified code",
                detail:
                    "This is a proxy: the code that actually runs lives in another contract, and that contract's source isn't published. What you'd be interacting with is a black box.",
                evidence: [{ label: "Implementation", value: c.implementation.address, href: addressUrl(s.chain, c.implementation.address) }],
                remediation: "Avoid it until the implementation is verified.",
            });
        }
        const adminEv: Evidence[] = [{ label: "Proxy type", value: c.proxyType ?? "proxy" }];
        if (c.implementation) {
            adminEv.push({
                label: "Implementation",
                value: `${c.implementation.name ?? "unnamed"} (${shortAddress(c.implementation.address)})`,
                href: addressUrl(s.chain, c.implementation.address),
            });
        }
        if (c.admin) {
            adminEv.push({
                label: "Upgrade admin",
                value: `${c.admin.party ? label(c.admin.party) : c.admin.address} · ${c.admin.kind === "eoa" ? "single-key account (EOA)" : "contract"}`,
                href: addressUrl(s.chain, c.admin.address),
            });
        }
        out.push({
            id: "upgradeable",
            severity: c.admin?.kind === "eoa" ? "high" : "medium",
            title: c.admin?.kind === "eoa" ? "Upgradeable by a single private key" : "Upgradeable contract",
            detail:
                c.admin?.kind === "eoa"
                    ? "Whoever holds one key can swap this contract's code at any time — including for code that moves users' tokens. No on-chain multisig or timelock stands in the way."
                    : c.admin
                      ? "Its code can be replaced by the admin contract (usually a multisig, timelock or ProxyAdmin). Safety depends on who controls that admin."
                      : "Its code can be replaced; the upgrade right sits with the implementation's owner or roles.",
            evidence: adminEv,
            remediation: "Check who controls upgrades (multisig? timelock?) before trusting it with large balances.",
        });
    }

    const powers = powersOf(c);
    if (powers.length) {
        const dangerous = powers.some((p) => p.rule.dangerous);
        const owner = c.owner;
        const severity: Severity =
            owner?.kind === "renounced" ? "low" : dangerous && owner?.kind === "eoa" ? "high" : "medium";
        const can = powers.map((p) => p.rule.label);
        const ownerText =
            owner?.kind === "renounced"
                ? "Ownership has been renounced, which neutralises owner-only functions (role-based ones may still work)."
                : owner?.kind === "eoa"
                  ? "On-chain, the owner is a single-key account (EOA) — the key may be split off-chain (MPC), but nothing on-chain enforces that."
                  : owner?.kind === "contract"
                    ? "The owner is a contract (often a multisig or timelock)."
                    : "";
        const evidence: Evidence[] = powers.map((p) => ({ label: p.rule.label, value: p.fns.slice(0, 4).join(", ") }));
        if (owner) {
            evidence.push({
                label: "owner()",
                value: `${owner.party ? label(owner.party) : owner.address} · ${owner.kind === "eoa" ? "EOA" : owner.kind}`,
                href: addressUrl(s.chain, owner.address),
            });
        }
        out.push({
            id: "admin-powers",
            severity,
            title: "Privileged roles can override holders",
            detail: `Privileged accounts can ${can.join("; ")}. ${ownerText} That's normal for regulated stablecoins and some protocols, but it means trusting whoever holds those keys.`.trim(),
            evidence,
            remediation: "Know who holds these roles before holding or accepting this token in size.",
        });
    }

    if (c.createdAt) {
        const ageDays = (Date.parse(s.fetchedAt) - Date.parse(c.createdAt)) / DAY_MS;
        if (ageDays >= 0 && ageDays < 30) {
            const veryNew = ageDays < 7;
            out.push({
                id: "new-contract",
                severity: veryNew ? (c.isVerified ? "medium" : "high") : c.isVerified ? "low" : "medium",
                title: `Deployed ${ageDays < 1 ? "less than a day" : plural(Math.floor(ageDays), "day")} ago`,
                detail:
                    "New contracts have no track record. Most scam tokens and drainers live for days, not months.",
                evidence: [{ label: "Created", value: date(c.createdAt) }, ...(c.creator ? [partyEv(s, "Deployer", c.creator)] : [])],
                remediation: "Wait for a track record, an audit or a verified team before trusting it.",
            });
        }
    }

    const holders = c.token?.holders ?? null;
    if ((holders !== null && holders < 50) || (!c.token && s.counters.transactions < 25)) {
        out.push({
            id: "little-history",
            severity: "low",
            title: "Very little on-chain history",
            detail: `Only ${holders !== null ? plural(holders, "holder") : plural(s.counters.transactions, "transaction")} so far — too little activity to judge it by.`,
            evidence: [{ label: "Activity", value: `${s.counters.transactions} txs · ${holders ?? "n/a"} holders` }],
            remediation: "Treat it as unproven.",
        });
    }

    const token = c.token;
    if (token && token.totalSupply && token.topHolders.length) {
        const supply = BigInt(token.totalSupply);
        const top = token.topHolders.find(
            (h) => !h.party.isContract && !/^0x0{40}$|^0x0{36}dead$/i.test(h.party.address),
        );
        if (top && supply > BigInt(0)) {
            const pct = Number((BigInt(top.value) * BigInt(10000)) / supply) / 100;
            if (pct > 20) {
                out.push({
                    id: "holder-concentration",
                    severity: pct > 50 ? "high" : "medium",
                    title: `One wallet holds ${pct.toFixed(1)}% of the supply`,
                    detail:
                        "A single private wallet controls a large share of the token, and can crash the price by selling it — the typical rug-pull setup.",
                    evidence: [partyEv(s, "Top holder", top.party), { label: "Share", value: `${pct.toFixed(2)}%` }],
                    remediation: "Check whether that holder is a known team, exchange or vesting wallet before buying.",
                });
            }
        }
    }

    const flags = c.implementation?.isVerified ? c.implementation.sourceFlags : c.sourceFlags;
    if (flags.selfdestruct) {
        out.push({
            id: "can-self-destruct",
            severity: "low",
            title: "Contains selfdestruct",
            detail:
                "Since the Dencun upgrade (EIP-6780) selfdestruct can no longer wipe an existing contract, but it can still force-send the contract's ETH elsewhere.",
            evidence: [partyEv(s, "Contract", self)],
            remediation: "Check who can trigger it.",
        });
    }
    if (flags.delegatecall && !proxy) {
        out.push({
            id: "arbitrary-delegatecall",
            severity: "low",
            title: "Executes external code via delegatecall",
            detail:
                "It can run another contract's code with its own storage and balance. Standard for routers and multicall helpers; dangerous if the target can be chosen by an untrusted caller.",
            evidence: [partyEv(s, "Contract", self)],
            remediation: "Review which addresses it delegates to.",
        });
    }
    return out;
}

// --- entry point -----------------------------------------------------------------

export function analyze(s: Snapshot): Finding[] {
    const findings: Finding[] = [...flaggedSelf(s)];
    if (s.wallet) {
        findings.push(
            ...delegation(s),
            ...approvalFindings(s, s.wallet),
            ...flaggedCounterparties(s, s.wallet),
            ...poisoning(s, s.wallet),
            ...unverifiedInteractions(s, s.wallet),
            ...scamAirdrops(s, s.wallet),
        );
    }
    if (s.contract) findings.push(...contractFindings(s, s.contract));
    return findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));
}

