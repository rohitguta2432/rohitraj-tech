"use client";

import { useState } from "react";
import { CHAINS, CHAIN_KEYS, type ChainKey } from "@/lib/chainlens/chains";
import type { Report, VerdictLevel } from "@/lib/chainlens/report";
import type { Severity } from "@/lib/chainlens/types";

const SEV_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SAMPLES: { label: string; address: string; chain: ChainKey }[] = [
    { label: "USDC · Ethereum", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", chain: "ethereum" },
    { label: "USDC · Base", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", chain: "base" },
    { label: "Uniswap router", address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", chain: "ethereum" },
    { label: "Flagged phishing contract", address: "0x4c7234fCeCD89FF3299FdE1b50C2Cb20B55F000c", chain: "ethereum" },
    { label: "EthDev multisig (2015)", address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe", chain: "ethereum" },
];

function gradeTone(level: VerdictLevel): string {
    if (level === "clear") return "ok";
    if (level === "caution") return "warn";
    return "bad";
}

export default function ChainlensDemo() {
    const [address, setAddress] = useState(SAMPLES[0].address);
    const [chain, setChain] = useState<ChainKey>(SAMPLES[0].chain);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function scan() {
        if (loading || !address.trim()) return;
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const res = await fetch("/api/agents/chainlens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address: address.trim(), chain }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Scan error (${res.status})`);
            setReport(data.report as Report);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function loadSample(s: (typeof SAMPLES)[number]) {
        setAddress(s.address);
        setChain(s.chain);
        setReport(null);
        setError(null);
    }

    return (
        <div className="agentlab-demo">
            <div className="agentlab-bar">
                <span className="agentlab-dot" aria-hidden="true" />
                <span className="agentlab-bar-title">Chainlens · live on-chain scan</span>
                <span className="agentlab-bar-note">real chain data · no API key · no wallet connection</span>
            </div>

            <div className="agentlab-chips">
                {SAMPLES.map((s) => (
                    <button
                        key={s.label}
                        type="button"
                        className={`agentlab-chip${s.address === address && s.chain === chain ? " agentlab-chip--active" : ""}`}
                        onClick={() => loadSample(s)}
                        disabled={loading}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <label className="agentlab-field-label" htmlFor="cl-address">
                Wallet or contract address, or an ENS name
            </label>
            <div className="cl-row">
                <input
                    id="cl-address"
                    className="agentlab-textarea agentlab-textarea--code cl-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") scan();
                    }}
                    placeholder="0x… or name.eth"
                    spellCheck={false}
                    autoComplete="off"
                    disabled={loading}
                />
                <select
                    className="agentlab-textarea cl-select"
                    aria-label="Chain"
                    value={chain}
                    onChange={(e) => setChain(e.target.value as ChainKey)}
                    disabled={loading}
                >
                    {CHAIN_KEYS.map((k) => (
                        <option key={k} value={k}>
                            {CHAINS[k].name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="agentlab-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={scan} disabled={loading || !address.trim()}>
                    {loading ? "Scanning chain data…" : "Scan address"}
                </button>
                {loading && <span className="cl-hint">Reading history, approvals and contract state — usually 3–15 s.</span>}
            </div>

            {error && <p className="agentlab-error">{error}</p>}

            <div aria-live="polite">
                {report && (
                    <div className="scan-result">
                        <div className="scan-summary">
                            <span className={`scan-grade scan-grade--${gradeTone(report.verdict.level)}`}>{report.grade}</span>
                            <div>
                                <p className="cl-verdict">{report.verdict.headline}</p>
                                <p className="cl-subject">
                                    {report.subject.label} on {report.subject.chainName}
                                    {report.subject.name ? ` · ${report.subject.name}` : ""} ·{" "}
                                    <a href={report.subject.explorerUrl} target="_blank" rel="noopener noreferrer">
                                        view on explorer ↗
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="scan-counts">
                            {SEV_ORDER.map((s) =>
                                report.counts[s] > 0 ? (
                                    <span key={s} className={`sev-pill sev-pill--${s}`}>
                                        {report.counts[s]} {s}
                                    </span>
                                ) : null,
                            )}
                            {report.findings.length === 0 && <span className="sev-pill sev-pill--ok">No findings</span>}
                        </div>
                        <p className="cl-summary">{report.verdict.summary}</p>

                        <ul className="scan-findings">
                            {report.findings.map((f) => (
                                <li key={f.id} className="scan-finding">
                                    <div className="scan-finding-head">
                                        <span className={`sev-pill sev-pill--${f.severity}`}>{f.severity}</span>
                                        <strong className="scan-finding-title">{f.title}</strong>
                                        <code className="scan-finding-id">{f.id}</code>
                                    </div>
                                    <p className="scan-finding-evidence">{f.detail}</p>
                                    {f.evidence.length > 0 && (
                                        <ul className="cl-evidence">
                                            {f.evidence.slice(0, 6).map((e, i) => (
                                                <li key={i}>
                                                    <span className="cl-evidence-label">{e.label}</span>{" "}
                                                    {e.href ? (
                                                        <a href={e.href} target="_blank" rel="noopener noreferrer">
                                                            {e.value}
                                                        </a>
                                                    ) : (
                                                        <span>{e.value}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <p className="scan-finding-fix">
                                        <strong>Fix:</strong> {f.remediation}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <details className="cl-coverage">
                            <summary>What Chainlens checked</summary>
                            <ul>
                                {report.coverage.map((c) => (
                                    <li key={c}>{c}</li>
                                ))}
                                {report.gaps.map((g) => (
                                    <li key={g} className="cl-gap">
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </details>
                        <p className="agentlab-disclaimer">{report.disclaimer}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
