import Link from "next/link";
import type { HomeDictionary, Locale } from "@/lib/i18n";

interface HireBlockProps {
    dict: HomeDictionary;
    locale: Locale;
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

export default function HireBlock({ dict, locale }: HireBlockProps) {
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
                    <div>
                        <Link href={`/${locale}/hire`} className="btn btn-primary">
                            {hire.cta}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
