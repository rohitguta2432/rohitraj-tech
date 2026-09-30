// Synced from github.com/rohitguta2432/chainlens (src/blockscout.ts) — edit there, then run scripts/sync-to-site.sh.
// Blockscout REST API v2 + metadata-registry client, normalised into Chainlens
// types. Raw responses are loosely typed JSON, so every read goes through the
// small accessors below instead of trusting shapes.

import { CHAINS, type ChainKey } from "./chains";
import { getJson, mapLimit, type RequestOptions } from "./http";
import type { Party, Tag, TokenRef, TransferLite, TxLite } from "./types";
import { decodeApprovalCall } from "./abi";

type Json = Record<string, unknown>;

const obj = (v: unknown): Json | null => (v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const num = (v: unknown): number | null => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
};

function toTags(raw: unknown): Tag[] {
    const meta = obj(raw);
    return arr(meta?.tags)
        .map(obj)
        .filter((t): t is Json => !!t)
        .map((t) => ({ slug: str(t.slug) ?? "", name: str(t.name) ?? "", type: str(t.tagType) ?? "" }))
        .filter((t) => t.slug || t.name);
}

export function toParty(raw: unknown): Party | null {
    const r = obj(raw);
    const address = str(r?.hash);
    if (!r || !address) return null;
    const publicTag = arr(r.public_tags).map(obj).find(Boolean);
    const name = str(r.name) ?? str(publicTag?.display_name) ?? str(r.ens_domain_name);
    return {
        address,
        isContract: r.is_contract === true,
        isVerified: r.is_verified === true,
        isScam: r.is_scam === true || r.reputation === "scam",
        name: name ? name.replace(/\s+/g, " ").trim() || null : null,
        tags: toTags(r.metadata),
    };
}

function toToken(raw: unknown): TokenRef | null {
    const t = obj(raw);
    const address = str(t?.address_hash) ?? str(t?.address);
    if (!t || !address) return null;
    return {
        address,
        symbol: str(t.symbol),
        name: str(t.name),
        type: str(t.type) ?? "unknown",
        isScam: t.reputation === "scam" || t.is_scam === true,
    };
}

export class Blockscout {
    readonly api: string;

    constructor(
        readonly chain: ChainKey,
        private readonly opts: RequestOptions = {},
    ) {
        this.api = CHAINS[chain].api;
    }

    private get<T = Json>(path: string): Promise<T> {
        return getJson<T>(`${this.api}${path}`, this.opts);
    }

    address(addr: string): Promise<Json> {
        return this.get(`/addresses/${addr}`);
    }

    async counters(addr: string): Promise<{ transactions: number; tokenTransfers: number }> {
        const c = await this.get(`/addresses/${addr}/counters`);
        return { transactions: num(c.transactions_count) ?? 0, tokenTransfers: num(c.token_transfers_count) ?? 0 };
    }

    /** Outgoing transactions, newest first, following Blockscout's keyset pagination. */
    async outgoingTransactions(addr: string, pages: number): Promise<TxLite[]> {
        const out: TxLite[] = [];
        let params: Json | null = { filter: "from" };
        for (let p = 0; p < pages && params; p++) {
            const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
            const page = await this.get(`/addresses/${addr}/transactions?${qs}`);
            for (const item of arr(page.items)) {
                const tx = this.toTx(item);
                if (tx) out.push(tx);
            }
            const next = obj(page.next_page_params);
            params = next ? { ...next, filter: "from" } : null;
        }
        return out;
    }

    private toTx(raw: unknown): TxLite | null {
        const t = obj(raw);
        const hash = str(t?.hash);
        if (!t || !hash) return null;
        const input = str(t.raw_input);
        const to = toParty(t.to);
        const selector = input && input.length >= 10 ? input.slice(0, 10).toLowerCase() : null;
        const tx: TxLite = {
            hash,
            timestamp: str(t.timestamp) ?? "",
            status: t.status === "error" || t.result === "error" ? "error" : "ok",
            method: str(t.method),
            selector,
            value: str(t.value) ?? "0",
            to,
        };
        if (to && tx.status === "ok") {
            const approval = decodeApprovalCall(to.address, input);
            if (approval) tx.approval = approval;
        }
        return tx;
    }

    async tokenTransfers(addr: string, direction: "to" | "from"): Promise<TransferLite[]> {
        const page = await this.get(`/addresses/${addr}/token-transfers?filter=${direction}`);
        const out: TransferLite[] = [];
        for (const item of arr(page.items)) {
            const t = obj(item);
            const from = toParty(t?.from);
            const to = toParty(t?.to);
            const token = toToken(t?.token);
            const total = obj(t?.total);
            if (!t || !from || !to || !token) continue;
            out.push({
                txHash: str(t.transaction_hash) ?? "",
                timestamp: str(t.timestamp) ?? "",
                from,
                to,
                token,
                value: str(total?.value),
                decimals: num(total?.decimals),
            });
        }
        return out;
    }

    smartContract(addr: string): Promise<Json> {
        return this.get(`/smart-contracts/${addr}`);
    }

    async txInfo(hash: string): Promise<{ timestamp: string | null; from: string | null }> {
        const t = await this.get(`/transactions/${hash}`);
        return { timestamp: str(t.timestamp), from: str(obj(t.from)?.hash) };
    }

    async topHolders(token: string): Promise<{ party: Party; value: string }[]> {
        const page = await this.get(`/tokens/${token}/holders`);
        return arr(page.items)
            .map(obj)
            .map((h) => ({ party: toParty(h?.address), value: str(h?.value) }))
            .filter((h): h is { party: Party; value: string } => !!h.party && !!h.value)
            .slice(0, 10);
    }

    /** Resolve an ENS / Basename via Blockscout search. */
    async resolveName(name: string): Promise<string | null> {
        const res = await this.get(`/search?q=${encodeURIComponent(name)}`);
        for (const item of arr(res.items)) {
            const i = obj(item);
            const info = obj(i?.ens_info);
            if (i?.type === "ens_domain" && str(info?.name)?.toLowerCase() === name.toLowerCase()) {
                return str(i.address_hash) ?? str(info?.address_hash);
            }
        }
        return null;
    }
}

export { obj, arr, str, num };

const METADATA_API = "https://metadata.services.blockscout.com/api/v1/metadata";

/**
 * Registry tags for many addresses in one request per 50 — this is where
 * "Phish / Hack" and "Fake_Phishing…" labels live even when the address
 * endpoint omits them.
 */
export async function fetchTags(
    chain: ChainKey,
    addresses: string[],
    opts: RequestOptions = {},
): Promise<Map<string, Tag[]>> {
    const unique = [...new Set(addresses.map((a) => a.toLowerCase()))];
    const chunks: string[][] = [];
    for (let i = 0; i < unique.length; i += 50) chunks.push(unique.slice(i, i + 50));
    const result = new Map<string, Tag[]>();
    await mapLimit(chunks, 3, async (chunk) => {
        const res = await getJson<Json>(`${METADATA_API}?addresses=${chunk.join(",")}&chainId=${CHAINS[chain].id}`, opts);
        const byAddr = obj(res.addresses) ?? {};
        for (const [addr, meta] of Object.entries(byAddr)) {
            result.set(addr.toLowerCase(), toTags(meta));
        }
    });
    return result;
}

/** Merge registry tags into a party (dedupe by slug). */
export function withTags(p: Party, tags: Map<string, Tag[]>): Party {
    const extra = tags.get(p.address.toLowerCase());
    if (!extra?.length) return p;
    const seen = new Set(p.tags.map((t) => t.slug));
    return { ...p, tags: [...p.tags, ...extra.filter((t) => !seen.has(t.slug))] };
}
