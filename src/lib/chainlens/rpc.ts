// Synced from github.com/rohitguta2432/chainlens (src/rpc.ts) — edit there, then run scripts/sync-to-site.sh.
// Batched JSON-RPC over public nodes. One HTTP round-trip per chunk of calls;
// individual call failures come back as null instead of failing the batch.

import type { ChainConfig } from "./chains";
import { postJson, type RequestOptions } from "./http";

export interface RpcCall {
    method: string;
    params: unknown[];
}

interface RpcResponse {
    id?: unknown;
    result?: unknown;
    error?: unknown;
}

const CHUNK = 20;

export const ethCall = (to: string, data: string): RpcCall => ({ method: "eth_call", params: [{ to, data }, "latest"] });
export const getCode = (address: string): RpcCall => ({ method: "eth_getCode", params: [address, "latest"] });
export const getStorageAt = (address: string, slot: string): RpcCall => ({
    method: "eth_getStorageAt",
    params: [address, slot, "latest"],
});

async function sendChunk(url: string, calls: RpcCall[], opts: RequestOptions): Promise<(string | null)[]> {
    const body = calls.map((c, id) => ({ jsonrpc: "2.0", id, method: c.method, params: c.params }));
    const data = await postJson<RpcResponse[] | RpcResponse>(url, body, opts);
    if (!Array.isArray(data)) throw new Error(`${new URL(url).host} does not support batch requests`);
    const out: (string | null)[] = new Array(calls.length).fill(null);
    for (const r of data) {
        if (typeof r.id === "number" && r.id >= 0 && r.id < calls.length && typeof r.result === "string") {
            out[r.id] = r.result;
        }
    }
    return out;
}

/** Execute calls against the chain's RPC endpoints, falling back in order. */
export async function rpcBatch(chain: ChainConfig, calls: RpcCall[], opts: RequestOptions = {}): Promise<(string | null)[]> {
    if (calls.length === 0) return [];
    const results: (string | null)[] = [];
    for (let i = 0; i < calls.length; i += CHUNK) {
        const chunk = calls.slice(i, i + CHUNK);
        let done: (string | null)[] | null = null;
        let lastError: unknown;
        for (const url of chain.rpc) {
            try {
                done = await sendChunk(url, chunk, opts);
                break;
            } catch (e) {
                lastError = e;
            }
        }
        if (!done) throw lastError instanceof Error ? lastError : new Error("all RPC endpoints failed");
        results.push(...done);
    }
    return results;
}
