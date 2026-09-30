// Synced from github.com/rohitguta2432/chainlens (src/score.ts) — edit there, then run scripts/sync-to-site.sh.
// Grade A–F from severity-weighted findings (same scale as MCPGuard).

import { SEVERITIES, type Finding, type Severity } from "./types";

const WEIGHTS: Record<Severity, number> = { critical: 10, high: 5, medium: 2, low: 1 };

const THRESHOLDS: [number, string][] = [
    [1, "A"],
    [5, "B"],
    [12, "C"],
    [25, "D"],
    [40, "E"],
];

export function riskScore(findings: Finding[]): number {
    return findings.reduce((acc, f) => acc + WEIGHTS[f.severity], 0);
}

export function grade(findings: Finding[]): string {
    // Any critical finding caps the grade at E; score decides the rest.
    const score = riskScore(findings);
    const hasCritical = findings.some((f) => f.severity === "critical");
    for (const [max, g] of THRESHOLDS) {
        if (score <= max && !(hasCritical && g < "E")) return g;
    }
    return "F";
}

export function countBySeverity(findings: Finding[]): Record<Severity, number> {
    const out = { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>;
    for (const f of findings) if (SEVERITIES.includes(f.severity)) out[f.severity]++;
    return out;
}
