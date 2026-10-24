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

const ENGAGEMENTS = [
    { href: "/services/forward-deployed-engineer", label: "Hire a Forward Deployed Engineer", detail: "An embedded engineer to scope, build and deploy a system inside your team." },
    { href: "/services/fractional-ai-engineer", label: "Freelance AI Engineer", detail: "Hands-on AI architecture, agents and RAG delivery for your product backlog." },
    { href: "/services/mcp-integration-consultant", label: "MCP Integration Consultant", detail: "Connect an existing agent to approved APIs and data, with access checks and a documented handover." },
    { href: "/notes/what-does-a-forward-deployed-engineer-do-2026", label: "What is a Forward Deployed Engineer?", detail: "Understand the role, responsibilities and the engagement options before hiring." },
];

/**
 * The forward-deployed-engineer pitch, set as a signed engagement letter.
 *
 * A pitch that promises "you own the code and IP" reads truer as terms than as
 * marketing bullets, so the section borrows the document: a recital for the
 * intro, numbered clauses for the points, a signature and a vermilion rubber
 * stamp, and the engagement options as tear-off tickets on a schedule. The
 * copy and every link are unchanged; only the setting is.
 */
export default function HireBlock({ dict }: HireBlockProps) {
    const hire = dict.hire ?? FALLBACK;

    return (
        <section className="terms" aria-labelledby="hire-heading" id="founding-engineer-for-hire">
            <div className="container terms-grid">
                <article className="terms-sheet">
                    <div className="terms-band" aria-hidden="true" />
                    <div className="terms-meta">
                        <span>Terms of engagement</span>
                        <span>Bengaluru ⇄ worldwide</span>
                    </div>
                    <p className="terms-parties">
                        Between <strong>your team</strong> and <strong>Rohit Raj</strong>, {hire.eyebrow}
                    </p>

                    <h2 id="hire-heading" className="terms-h2">
                        {hire.heading}
                    </h2>

                    <p className="terms-label">Whereas</p>
                    <p className="terms-recital">{hire.intro}</p>

                    <p className="terms-label">It is agreed</p>
                    <ol className="terms-clauses">
                        {hire.points.map((point) => (
                            <li key={point}>{point}</li>
                        ))}
                    </ol>

                    <div className="terms-signoff">
                        <span className="terms-label">Signed</span>
                        <svg className="terms-signature" viewBox="0 0 176 60" aria-hidden="true">
                            <path
                                pathLength={1}
                                d="M4 46 C 14 10, 30 6, 26 34 C 24 50, 10 52, 14 38 C 20 22, 40 28, 44 40 C 48 52, 56 30, 62 26 C 68 22, 66 44, 72 42 C 80 40, 82 18, 90 20 C 98 22, 92 46, 100 44 C 108 42, 112 28, 120 30 C 128 32, 124 46, 134 44 C 146 42, 156 38, 172 34"
                            />
                        </svg>
                        <span className="terms-signer">Rohit Raj</span>
                    </div>

                    <svg className="terms-stamp" viewBox="0 0 200 200" aria-hidden="true">
                        <defs>
                            {/* Speckles knocked out of the ink, so the stamp reads as pressed rather than printed. */}
                            <filter id="terms-ink" x="-10%" y="-10%" width="120%" height="120%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
                                <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.6" result="speckle" />
                                <feComposite in="SourceGraphic" in2="speckle" operator="in" />
                            </filter>
                            <path id="terms-ring" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0" />
                        </defs>
                        <g filter="url(#terms-ink)">
                            <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="6" />
                            <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="2.2" />
                            <circle cx="100" cy="100" r="55" fill="none" stroke="currentColor" strokeWidth="2.2" />
                            <text className="terms-stamp-ring" fill="currentColor">
                                <textPath href="#terms-ring">FORWARD DEPLOYED · SHIPS TO PRODUCTION ·</textPath>
                            </text>
                            <text className="terms-stamp-core" x="100" y="108" textAnchor="middle" fill="currentColor">
                                FDE
                            </text>
                            <text className="terms-stamp-sub" x="100" y="130" textAnchor="middle" fill="currentColor">
                                BLR · 2026
                            </text>
                        </g>
                    </svg>
                </article>

                <div className="terms-side">
                    <p className="terms-label">Schedule A · Pick an engagement</p>
                    <nav className="terms-tickets" aria-label="Choose an AI engineering engagement">
                        {ENGAGEMENTS.map((option, i) => (
                            <Link key={option.href} href={option.href} className="terms-ticket">
                                <span className="terms-ticket-stub" aria-hidden="true">
                                    A{i + 1}
                                </span>
                                <span className="terms-ticket-body">
                                    <span className="terms-ticket-label">{option.label}</span>
                                    <span className="terms-ticket-detail">{option.detail}</span>
                                </span>
                                <span className="terms-ticket-arrow" aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <p className="terms-label terms-sign-label">Sign here</p>
                    <Link href={`/hire`} className="terms-sign">
                        <span className="terms-sign-x" aria-hidden="true">
                            ×
                        </span>
                        <span>{hire.cta}</span>
                        <span className="terms-sign-arrow" aria-hidden="true">
                            →
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
