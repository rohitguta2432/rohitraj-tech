// Synced from github.com/rohitguta2432/chainlens (src/index.ts) — edit there, then run scripts/sync-to-site.sh.
// Public API.
//
//   const report = await scan("0xA0b8…eB48", "ethereum");
//
// or, for full control / offline evals:
//
//   const snapshot = await collect(input, chain);   // network
//   const findings = analyze(snapshot);            // pure
//   const report = buildReport(snapshot, findings);

import type { ChainKey } from "./chains";
import { collect, type CollectOptions } from "./collect";
import { buildReport, type Report } from "./report";

export async function scan(input: string, chain: ChainKey = "ethereum", opts: CollectOptions = {}): Promise<Report> {
    return buildReport(await collect(input, chain, opts));
}

export { collect, InputError, type CollectOptions } from "./collect";
export { analyze } from "./analyze";
export { buildReport, type Report, type VerdictLevel } from "./report";
export { grade, riskScore, countBySeverity } from "./score";
export { CHAINS, CHAIN_KEYS, isChainKey, type ChainKey, type ChainConfig } from "./chains";
export type * from "./types";
