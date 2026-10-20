import Link from "next/link";
import type { HomeDictionary } from "@/lib/i18n";

interface HireBlockProps {
    dict: HomeDictionary;
}

const FALLBACK: NonNullable<HomeDictionary["hire"]> = {
    eyebrow: "AI Consultant · Forward Deployed Engineer",
    heading: "An AI consultant who embeds with your team — and ships to production.",
    intro:
        "Most companies don't need another AI strategy deck. They need one senior engineer inside their Slack and their repo who finds where AI creates value and builds it — agents, MCP integrations, LLM features — until it runs in production with evals proving it. That is forward deployed engineering, and it is how I work.",
    points: [
        "AI Consultant · Forward Deployed Engineer — based in Bengaluru, India, working with companies worldwide.",
        "Embedded delivery: your repo, your standups, your infrastructure — from day one.",
        "Agents, MCP servers, and LLM features shipped with evaluation suites, not vibes.",
        "Fractional retainer (2 days/week) or fixed-scope pilot — you own the code and IP throughout.",
    ],
    cta: "Book a free 30-min scoping call",
};

export default function HireBlock({ dict }: HireBlockProps) {
    const hire = dict.hire ?? FALLBACK;

    return (
        <section
            className="reliability-section"
            aria-labelledby="hire-heading"
            id="founding-engineer-for-hire"
        >
            <div className="container">
                <div className="reliability-header">
                    <span className="reliability-label">{hire.eyebrow}</span>
                    <h2 id="hire-heading" className="reliability-heading">
                        {hire.heading}
                    </h2>
                </div>

                <div style={{ maxWidth: 720, textAlign: "left" }}>
                    <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--text-secondary)", marginBottom: 24 }}>
                        {hire.intro}
                    </p>
                    <ul style={{ textAlign: "left", display: "block", padding: 0, listStyle: "none", margin: "0 0 32px" }}>
                        {hire.points.map((point) => (
                            <li
                                key={point}
                                style={{
                                    padding: "8px 0 8px 28px",
                                    position: "relative",
                                    fontSize: 16,
                                    lineHeight: 1.55,
                                    color: "var(--text-primary)",
                                }}
                            >
                                <span style={{ position: "absolute", left: 0, color: "var(--accent)", fontWeight: 700 }}>→</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                    <nav
                        aria-label="Choose an AI engineering engagement"
                        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: 32 }}
                    >
                        {[
                            { href: "/services/forward-deployed-engineer", label: "Hire a Forward Deployed Engineer", detail: "An embedded engineer to scope, build and deploy a system inside your team." },
                            { href: "/services/fractional-ai-engineer", label: "Freelance AI Engineer", detail: "Hands-on AI architecture, agents and RAG delivery for your product backlog." },
                            { href: "/services/mcp-integration-consultant", label: "MCP Integration Consultant", detail: "Connect an existing agent to approved APIs and data, with access checks and a documented handover." },
                            { href: "/notes/what-does-a-forward-deployed-engineer-do-2026", label: "What is a Forward Deployed Engineer?", detail: "Understand the role, responsibilities and the engagement options before hiring." },
                        ].map((option) => (
                            <Link key={option.href} href={option.href} style={{ display: "block", padding: "1.1rem", border: "1px solid var(--border)", borderRadius: 12, textDecoration: "none" }}>
                                <span style={{ display: "block", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{option.label} &rarr;</span>
                                <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-secondary)" }}>{option.detail}</span>
                            </Link>
                        ))}
                    </nav>
                    <div>
                        <Link href={`/hire`} className="btn btn-primary">
                            {hire.cta}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
