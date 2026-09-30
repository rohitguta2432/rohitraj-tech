// Synced from github.com/rohitguta2432/chainlens (src/report.ts) — edit there, then run scripts/sync-to-site.sh.
// report(): turn findings into a plain-English verdict. Deterministic templates,
// no LLM — the wording is fixed so it can be tested, and it never calls
// anything "safe": the strongest verdict is "no red flags in what we checked".

import { CHAINS, addressUrl, type ChainKey } from "./chains";
import { shortAddress } from "./abi";
import { analyze } from "./analyze";
import { countBySeverity, grade, riskScore } from "./score";
import { displayName } from "./tags";
import type { Finding, Severity, Snapshot } from "./types";

/** Findings about who controls a contract rather than signs of a scam. */
const CONTROL_IDS = new Set(["upgradeable", "admin-powers", "holder-concentration"]);

export type VerdictLevel = "danger" | "warning" | "caution" | "clear";

export interface Report {
    subject: {
        address: string;
        input: string;
        chain: ChainKey;
        chainName: string;
        kind: "wallet" | "contract";
        label: string;
        name: string | null;
        explorerUrl: string;
    };
    grade: string;
    score: number;
    verdict: { level: VerdictLevel; headline: string; summary: string };
    counts: Record<Severity, number>;
    coverage: string[];
    findings: Finding[];
    gaps: string[];
    fetchedAt: string;
    disclaimer: string;
}

function subjectLabel(s: Snapshot): string {
    if (s.kind === "wallet") return s.delegation ? "Smart-account wallet (EIP-7702)" : "Wallet";
    const c = s.contract;
    if (c?.proxyType === "master_copy" || /safe/i.test(c?.name ?? "")) return "Multisig (Safe)";
    if (c?.token?.type) return `${c.token.type} token contract`;
    return "Contract";
}

function coverage(s: Snapshot): string[] {
    const lines: string[] = [];
    if (s.wallet) {
        const w = s.wallet;
        lines.push(`${w.txs.length} most recent outgoing transactions of ${s.counters.transactions.toLocaleString("en-US")}`);
        lines.push(`${w.approvals.length} token approvals decoded and re-checked live`);
        lines.push(`${w.inbound.length + w.outbound.length} recent token transfers screened for poisoning and scam tokens`);
        const parties = new Set(w.txs.filter((t) => t.to).map((t) => t.to!.address.toLowerCase()));
        lines.push(`${parties.size} counterparties checked against the scam-tag registry`);
    }
    if (s.contract) {
        const c = s.contract;
        lines.push(c.isVerified ? `Verified source: ${c.name ?? "unnamed"} (${c.compiler ?? "compiler n/a"})` : "No verified source");
        if (c.proxyType) lines.push(`Proxy (${c.proxyType}) → ${c.implementation ? shortAddress(c.implementation.address) : "unknown implementation"}`);
        const guarded = c.implementation?.isVerified ? c.implementation.guardedFunctions : c.guardedFunctions;
        const writes = c.implementation?.isVerified ? c.implementation.writeFunctions : c.writeFunctions;
        if (writes.length) lines.push(`${writes.length} state-changing functions, ${guarded.length} behind access control`);
        lines.push(`${s.counters.transactions.toLocaleString("en-US")} transactions${c.token?.holders != null ? ` · ${c.token.holders.toLocaleString("en-US")} holders` : ""}`);
    }
    return lines;
}

function verdict(s: Snapshot, findings: Finding[]): Report["verdict"] {
    const counts = countBySeverity(findings);
    const subject = s.kind === "wallet" ? "wallet" : "contract";
    const tail = " This is an automated first pass over public data, not an audit.";
    const serious = findings.filter((f) => f.severity !== "low");
    const onlyControl = serious.length > 0 && serious.every((f) => CONTROL_IDS.has(f.id));

    if (counts.critical) {
        const first = findings.find((f) => f.severity === "critical")!;
        return {
            level: "danger",
            headline: `Danger — ${first.title.charAt(0).toLowerCase()}${first.title.slice(1)}`,
            summary: `${counts.critical} critical issue${counts.critical > 1 ? "s" : ""} need${counts.critical > 1 ? "" : "s"} action now.${tail}`,
        };
    }
    if (onlyControl) {
        return {
            level: counts.high ? "warning" : "caution",
            headline: "No scam signals — but this contract is centrally controlled",
            summary: `Nothing here looks malicious. The risk is trust: ${serious.map((f) => f.title.toLowerCase()).join("; ")}.${tail}`,
        };
    }
    if (counts.high) {
        const first = findings.find((f) => f.severity === "high")!;
        return {
            level: "warning",
            headline: `High risk — ${first.title.charAt(0).toLowerCase()}${first.title.slice(1)}`,
            summary: `${counts.high} high-severity issue${counts.high > 1 ? "s" : ""} on this ${subject}; review them before trusting it with funds.${tail}`,
        };
    }
    if (counts.medium) {
        return {
            level: "caution",
            headline: "Some things to review",
            summary: `No critical or high-severity issues, but ${counts.medium} worth a look.${tail}`,
        };
    }
    return {
        level: "clear",
        headline: "No red flags in what Chainlens checked",
        summary: `${counts.low ? `Only ${counts.low} minor note${counts.low > 1 ? "s" : ""}. ` : ""}That's not a guarantee of safety — new risks can appear at any time.${tail}`,
    };
}

export function buildReport(s: Snapshot, findings: Finding[] = analyze(s)): Report {
    return {
        subject: {
            address: s.address,
            input: s.input,
            chain: s.chain,
            chainName: CHAINS[s.chain].name,
            kind: s.kind,
            label: subjectLabel(s),
            name: displayName(s.self),
            explorerUrl: addressUrl(s.chain, s.address),
        },
        grade: grade(findings),
        score: riskScore(findings),
        verdict: verdict(s, findings),
        counts: countBySeverity(findings),
        coverage: coverage(s),
        findings,
        gaps: s.gaps,
        fetchedAt: s.fetchedAt,
        disclaimer:
            "Chainlens reads public on-chain data and community labels. It can miss threats and can't see off-chain signatures (e.g. Permit). Not financial or security advice.",
    };
}
