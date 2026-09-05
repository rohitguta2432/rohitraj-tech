import type { CSSProperties } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Testimonials from "@/components/Testimonials";
import { getDictionary } from "@/lib/i18n";
import { createPageMetadata, SITE_CONFIG } from "@/lib/seo-config";

export async function generateMetadata() {
    return createPageMetadata(
        "Hire an AI Consultant · Forward Deployed Engineer | Rohit Raj",
        "Hire an AI consultant who works as a forward deployed engineer — embedded in your team, shipping agents, MCP integrations, and LLM features to production. Fractional retainer or fixed-scope pilot. India-based, remote worldwide.",
        "/hire",
        { translated: false }
    );
}

const CASE_STUDIES = [
    {
        title: "Fintech education platform (India)",
        problem:
            "A regulated-space fintech education company needed its content and product engineering to run without a full-time team.",
        built:
            "Production Next.js platform on AWS with an autonomous daily content pipeline — an AI agent researches, writes, typechecks, and deploys a new article every day — plus a financial-diagnostic product and admin tooling.",
        outcome:
            "The platform publishes daily with zero manual effort, and new product features ship weekly alongside it. Operated continuously in production.",
        tags: ["Next.js", "AWS", "AI Agents", "Automation"],
    },
    {
        title: "AI dispatcher for field services",
        problem:
            "Field-service operations lose jobs to slow, manual scheduling — dispatch decisions need to happen in seconds, correctly.",
        built:
            "A vertical AI dispatch agent that triages incoming jobs, matches technicians, and drafts customer communication — gated by an evaluation suite that must pass before any response ships.",
        outcome:
            "Dispatch decisions that previously required a human coordinator are handled end-to-end by the agent, with evals as the safety net.",
        tags: ["AI Agents", "Claude API", "Evals"],
    },
    {
        title: "Autonomous engineering pipeline",
        problem:
            "AI-written code is only useful if it survives review — most agent coding tools stop at 'generated', not 'merged'.",
        built:
            "An autonomous pipeline that takes a requirement through spec, implementation, self-review, and tests in an isolated git worktree — plus a self-evolving agent that grows a reusable skill library from each task.",
        outcome:
            "Requirements go in, reviewed and tested branches come out — demonstrating the agent architecture patterns I deploy for clients.",
        tags: ["Claude Code", "AI Agents", "MCP", "CI"],
    },
];

const FAQS = [
    {
        question: "What does a forward deployed engineer do that a normal consultant doesn't?",
        answer:
            "A traditional consultant hands you recommendations; you still need someone to build them. A forward deployed engineer embeds in your team — your Slack, your repo, your standups — finds where AI creates value, and personally builds the system to production. One accountable person from 'where should AI help?' to 'it is live and monitored'.",
    },
    {
        question: "How do engagements work?",
        answer:
            "Two models. Fractional: fixed days each week (typically two) on an ongoing retainer — suited to a continuing AI backlog. Fixed-scope pilot: one defined outcome shipped to production — suited to proving value before committing. Both start with a free 30-minute scoping call, NDA first if you prefer.",
    },
    {
        question: "What do you actually build?",
        answer:
            "AI agents that do real work (triage, dispatch, research, content operations), MCP servers that connect agents to your internal systems safely, RAG and LLM features inside existing products, and Claude Code workflows that make your own engineers faster. Everything ships with an evaluation suite — systems prove they work before users meet them.",
    },
    {
        question: "Where are you based and who do you work with?",
        answer:
            "Bengaluru, India — working remote-first with companies worldwide. US and EU clients get real daily timezone overlap plus written async updates. Contracts and IP assignment are structured for international engagements; you own the code and the repo from day one.",
    },
];

function personSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": SITE_CONFIG.personId,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        email: `mailto:${SITE_CONFIG.author.email}`,
        jobTitle: "AI Consultant · Forward Deployed Engineer",
        knowsAbout: [
            "AI Agents",
            "Model Context Protocol (MCP)",
            "Claude API",
            "RAG",
            "LLM Evaluation",
            "Full-Stack Engineering",
        ],
        sameAs: [
            `https://github.com/${SITE_CONFIG.author.github}`,
            `https://twitter.com/${SITE_CONFIG.author.twitter.replace("@", "")}`,
        ],
    };
}

function professionalServiceSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: "Rohit Raj — AI Consulting & Forward Deployed Engineering",
        url: `${SITE_CONFIG.url}/hire`,
        description:
            "AI consulting delivered forward-deployed: embedded senior engineering that ships agents, MCP integrations, and LLM features to production.",
        provider: {
            "@type": "Person",
            "@id": SITE_CONFIG.personId,
            name: SITE_CONFIG.name,
        },
        areaServed: { "@type": "Place", name: "Worldwide" },
        serviceType: [
            "Forward Deployed Engineering",
            "AI Consulting",
            "MCP Integration",
            "Fractional AI Engineering",
        ],
    };
}

function faqSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
    };
}

const sectionHeading: CSSProperties = {
    color: "var(--text-primary)",
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "1rem",
};

const card: CSSProperties = {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "1.5rem",
};

export default async function HirePage() {
    const dict = await getDictionary();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema()) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }}
            />
            <Header dict={dict.common} />
            <main id="main">
                <section>
                    <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem" }}>
                        {/* Hero */}
                        <div style={{ marginTop: "2rem" }}>
                            <span style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                AI Consultant · Forward Deployed Engineer
                            </span>
                            <h1 style={{ color: "var(--text-primary)", fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2, margin: "0.75rem 0" }}>
                                I embed with your team and ship AI to production.
                            </h1>
                            <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", lineHeight: 1.6 }}>
                                Not slide-deck consulting. Not an agency handoff. One senior engineer inside
                                your Slack and your repo — building agents, MCP integrations, and LLM features
                                until they run in production with evals proving it.
                            </p>
                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                <Link
                                    href={`/contact`}
                                    className="btn btn-primary"
                                    style={{ display: "inline-block", padding: "0.875rem 2rem", fontSize: "1.05rem", fontWeight: 600, borderRadius: "8px", textDecoration: "none" }}
                                >
                                    Book a Scoping Call
                                </Link>
                                <a
                                    href={`mailto:${SITE_CONFIG.author.email}?subject=AI%20consulting%20enquiry`}
                                    className="btn"
                                    style={{ display: "inline-block", padding: "0.875rem 2rem", fontSize: "1.05rem", fontWeight: 600, borderRadius: "8px", textDecoration: "none", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                >
                                    Email Directly
                                </a>
                            </div>
                        </div>

                        {/* Outcomes */}
                        <div style={{ marginTop: "3rem" }}>
                            <h2 style={sectionHeading}>What you get</h2>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {[
                                    "AI agents doing real work — triage, dispatch, research, operations — not chatbot demos",
                                    "MCP servers connecting agents to your internal systems, with security boundaries designed first",
                                    "LLM features shipped inside your existing product, in your stack, in your repo",
                                    "Evaluation suites on everything — systems prove they work before users meet them",
                                    "Your engineers upskilled on Claude Code and agentic workflows along the way",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        style={{ color: "var(--text-secondary)", lineHeight: 1.7, padding: "0.5rem 0", borderBottom: "1px solid var(--border)", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
                                    >
                                        <span style={{ color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>&#10003;</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Engagement models */}
                        <div style={{ marginTop: "3rem" }}>
                            <h2 style={sectionHeading}>Two ways to engage</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                                <div style={card}>
                                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                        Fractional retainer
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                                        Fixed days each week — typically two — embedded with your team on an
                                        ongoing AI backlog. Senior delivery without the full-time salary.
                                    </p>
                                </div>
                                <div style={card}>
                                    <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                        Fixed-scope pilot
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                                        One defined outcome — an agent, an MCP integration, an LLM feature —
                                        shipped to production with evals. Proof before commitment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Case studies */}
                        <div style={{ marginTop: "3rem" }}>
                            <h2 style={sectionHeading}>Recent work</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {CASE_STUDIES.map((cs) => (
                                    <div key={cs.title} style={card}>
                                        <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.75rem" }}>
                                            {cs.title}
                                        </div>
                                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
                                            <strong style={{ color: "var(--text-primary)" }}>Problem:</strong> {cs.problem}
                                        </p>
                                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 0.5rem" }}>
                                            <strong style={{ color: "var(--text-primary)" }}>Built:</strong> {cs.built}
                                        </p>
                                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 0.75rem" }}>
                                            <strong style={{ color: "var(--text-primary)" }}>Outcome:</strong> {cs.outcome}
                                        </p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                            {cs.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="tag"
                                                    style={{ background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.8rem" }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services links */}
                        <div style={{ marginTop: "3rem" }}>
                            <h2 style={sectionHeading}>Specialised engagements</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {[
                                    { slug: "forward-deployed-engineer", label: "Hire a Forward Deployed Engineer (AI)" },
                                    { slug: "fractional-forward-deployed-engineer", label: "Fractional Forward Deployed Engineer" },
                                    { slug: "mcp-integration-consultant", label: "MCP Integration Consultant" },
                                    { slug: "claude-code-consultant", label: "Claude Code Consultant" },
                                    { slug: "fractional-ai-engineer", label: "Fractional AI Engineer" },
                                ].map((s) => (
                                    <Link
                                        key={s.slug}
                                        href={`/services/${s.slug}`}
                                        style={{ ...card, padding: "1.25rem", textDecoration: "none", display: "block", color: "var(--text-primary)", fontWeight: 600 }}
                                    >
                                        {s.label} &rarr;
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* FAQ */}
                        <div style={{ marginTop: "3rem" }}>
                            <h2 style={sectionHeading}>Frequently Asked Questions</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {FAQS.map((faq, i) => (
                                    <div key={i}>
                                        <h3 style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                                            {faq.question}
                                        </h3>
                                        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div style={{ marginTop: "3rem" }}>
                            <Testimonials limit={2} />
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: "3rem", marginBottom: "3rem", textAlign: "center" }}>
                            <Link
                                href={`/contact`}
                                className="btn btn-primary"
                                style={{ display: "inline-block", padding: "0.875rem 2rem", fontSize: "1.1rem", fontWeight: 600, borderRadius: "8px", textDecoration: "none" }}
                            >
                                Book a Scoping Call
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer dict={dict.common} />
        </>
    );
}
