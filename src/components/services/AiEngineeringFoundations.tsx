import Link from "next/link";
import { SITE_CONFIG } from "@/lib/seo-config";

// Rich body for /services/ai-engineering-foundations, rendered by
// src/app/services/[slug]/page.tsx between "What You Get" and "Tech Stack".
// Model names, prices, effort levels and Spec Kit commands were checked
// against the vendors' docs on LAST_VERIFIED — re-check before editing them.

const LAST_VERIFIED = "29 September 2026";

// YouTube video ID of the Spec Kit demo. Empty until the recording is
// published; the section then shows the chapter list and a demo CTA instead.
const DEMO_VIDEO_ID = "";
const DEMO_VIDEO_UPLOAD_DATE = ""; // ISO date, required for VideoObject schema once the ID is set

const h2Style = { color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" } as const;
const h3Style = { color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 600, margin: "1.75rem 0 0.75rem" } as const;
const pStyle = { color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 1rem" } as const;
const sectionStyle = { marginTop: "3rem" } as const;
const cardStyle = {
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "1.25rem",
} as const;
const codeStyle = {
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    fontSize: "0.85em",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "0.05rem 0.35rem",
} as const;
const preStyle = {
    ...cardStyle,
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    fontSize: "0.8rem",
    lineHeight: 1.6,
    color: "var(--text-primary)",
    overflowX: "auto",
    whiteSpace: "pre",
    margin: "0 0 1rem",
} as const;
const thStyle = {
    textAlign: "left",
    padding: "0.6rem 0.75rem",
    borderBottom: "2px solid var(--border)",
    color: "var(--text-primary)",
    fontWeight: 600,
    whiteSpace: "nowrap",
} as const;
const tdStyle = {
    padding: "0.6rem 0.75rem",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-secondary)",
    verticalAlign: "top",
    lineHeight: 1.55,
} as const;

function Code({ children }: { children: React.ReactNode }) {
    return <code style={codeStyle}>{children}</code>;
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
    return (
        <div style={{ overflowX: "auto", margin: "0 0 1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", minWidth: "560px" }}>
                <thead>
                    <tr>
                        {head.map((h) => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} style={tdStyle}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const DEMO_CHAPTERS = [
    ["0:00", "Install Spec Kit and run specify init --here in an existing repo"],
    ["1:00", "/speckit-constitution — the project's non-negotiables"],
    ["2:00", "/speckit-specify and /speckit-clarify on a real backlog ticket"],
    ["3:30", "/speckit-plan with Opus at high effort, /speckit-tasks"],
    ["5:00", "/speckit-implement on Sonnet at medium effort"],
    ["6:30", "/speckit-converge, review the diff, open the PR"],
];

const SPEC_FLOW = [
    ["/speckit-constitution", "Once per project", "Principles every later step is checked against: testing rules, security rules, architecture constraints."],
    ["/speckit-specify", "Every feature", "The what and the why: user stories and acceptance criteria. No tech stack here."],
    ["/speckit-clarify", "Quality gate", "The agent asks up to five targeted questions and writes the answers back into spec.md."],
    ["/speckit-plan", "Every feature", "The how: stack, architecture and constraints become plan.md and supporting design files."],
    ["/speckit-checklist", "Quality gate", "“Unit tests for requirements” — checks the spec is complete and unambiguous before work is split."],
    ["/speckit-tasks", "Every feature", "A dependency-ordered tasks.md: setup, foundations, one phase per user story, polish."],
    ["/speckit-analyze", "Quality gate", "Read-only consistency check across spec, plan and tasks before any code is written."],
    ["/speckit-implement", "Every feature", "Executes tasks.md phase by phase, respecting dependencies and parallel markers."],
    ["/speckit-converge", "Every feature", "Compares the code with the spec; appends missing tasks. Repeat implement → converge until Converged."],
];

const FOLDER_TREE = `your-repo/
├── AGENTS.md                         ← shared instructions every agent reads
├── CLAUDE.md                         ← Claude Code project memory (Copilot reads it too)
├── .specify/                         ← Spec Kit
│   ├── memory/constitution.md        ← project principles, written once
│   ├── templates/  scripts/
│   └── feature.json                  ← which feature is active
├── specs/
│   └── 001-export-audit-report/      ← one folder per feature
│       ├── spec.md                   ← what & why
│       ├── plan.md                   ← how (+ research, data model, contracts)
│       ├── tasks.md                  ← ordered work items
│       └── checklists/requirements.md
├── .claude/                          ← Claude Code
│   ├── skills/speckit-*/SKILL.md     ← Spec Kit skills (specify init --integration claude)
│   ├── agents/  commands/
│   └── settings.json                 ← permissions, hooks, per-model effort
├── .github/                          ← GitHub Copilot
│   ├── copilot-instructions.md       ← repo-wide instructions
│   ├── instructions/cpp.instructions.md   ← path-specific, applyTo: "src/**/*.cpp"
│   └── skills/speckit-*/SKILL.md     ← Spec Kit skills (specify init --integration copilot)
└── .kiro/                            ← Kiro
    ├── specs/export-audit-report/
    │   ├── requirements.md           ← user stories + EARS acceptance criteria
    │   ├── design.md
    │   └── tasks.md
    └── steering/                     ← Kiro's equivalent of instruction files`;

export function AiEngineeringFoundationsSchema() {
    if (!DEMO_VIDEO_ID || !DEMO_VIDEO_UPLOAD_DATE) return null;
    const video = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: "Spec-driven development demo: Spec Kit from spec to pull request",
        description: "A real feature taken from a one-line ticket to a reviewed pull request with Spec Kit, choosing the Claude model and effort level at each step.",
        thumbnailUrl: `https://i.ytimg.com/vi/${DEMO_VIDEO_ID}/hqdefault.jpg`,
        uploadDate: DEMO_VIDEO_UPLOAD_DATE,
        embedUrl: `https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}`,
        publisher: { "@type": "Person", name: SITE_CONFIG.name, url: SITE_CONFIG.url },
    };
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(video) }}
        />
    );
}

export default function AiEngineeringFoundations() {
    return (
        <>
            {/* Where this fits */}
            <div style={sectionStyle}>
                <h2 style={h2Style}>Where This Fits</h2>
                <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
                    {[
                        ["1", "Foundations", "This programme. The team learns specs, model and effort choice, context files and review habits.", null],
                        ["2", "Measure & roll out", "Team-wide tool setup, guardrails and a productivity baseline.", "/services/claude-code-consultant"],
                        ["3", "Build", "AI systems shipped inside your product by an embedded engineer.", "/services/fractional-ai-engineer"],
                    ].map(([n, title, text, href]) => (
                        <li key={n} style={{ ...cardStyle, display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.2 }}>{n}</span>
                            <div>
                                <div style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {href ? <Link href={href} style={{ color: "inherit" }}>{title} &rarr;</Link> : title}
                                </div>
                                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{text}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {/* Demo video */}
            <div style={sectionStyle} id="demo">
                <h2 style={h2Style}>Demo: One Ticket, Spec to Pull Request</h2>
                <p style={pStyle}>
                    A real feature taken from a one-line ticket to a reviewed pull request with Spec Kit — and the model and
                    effort level chosen at each step, with the reason.
                </p>
                {DEMO_VIDEO_ID ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", marginBottom: "1rem" }}>
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_ID}`}
                            title="Spec Kit demo: spec to pull request"
                            loading="lazy"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                    </div>
                ) : (
                    <p style={{ ...pStyle, fontSize: "0.9rem" }}>
                        Recording in progress — until it is up, the same walkthrough runs live on your own codebase in the{" "}
                        <Link href="/contact" style={{ color: "var(--accent)" }}>free half-day demo</Link>.
                    </p>
                )}
                <ol style={{ ...cardStyle, listStyle: "none", margin: 0 }}>
                    {DEMO_CHAPTERS.map(([t, label]) => (
                        <li key={t} style={{ display: "flex", gap: "0.75rem", padding: "0.3rem 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                            <span style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", color: "var(--accent)", minWidth: "2.5rem" }}>{t}</span>
                            {label}
                        </li>
                    ))}
                </ol>
            </div>

            {/* Specs from zero */}
            <div style={sectionStyle} id="specs">
                <h2 style={h2Style}>Spec-Driven Development, From Zero</h2>
                <p style={pStyle}>
                    Most teams use AI coding tools by typing a one-line request into chat. That works for a small edit and falls apart
                    for a feature: the agent guesses the requirements, picks its own architecture, and nobody can review the result
                    against anything. Spec-driven development fixes the order of work — <strong>what and why</strong> first,
                    then <strong>how</strong>, then <strong>tasks</strong>, then code — and keeps each step in a file that humans review
                    and the agent implements against.
                </p>

                <h3 style={h3Style}>The Spec Kit flow</h3>
                <p style={pStyle}>
                    Install once: <Code>uv tool install specify-cli</Code>, then, inside an existing repo,{" "}
                    <Code>specify init --here --integration claude</Code> (or <Code>copilot</Code>). The steps run inside the agent&apos;s chat, not the terminal. Copilot and Claude Code both
                    invoke them as <Code>/speckit-specify</Code> and so on; Spec Kit&apos;s docs write the same steps as{" "}
                    <Code>/speckit.specify</Code>.
                </p>
                <Table
                    head={["Step", "When", "What it produces"]}
                    rows={SPEC_FLOW.map(([cmd, when, what]) => [<Code key={cmd}>{cmd}</Code>, when, what])}
                />
                <p style={{ ...pStyle, fontSize: "0.9rem" }}>
                    Small features take the short path: specify → plan → tasks → implement → converge. Production features add the
                    three quality gates (clarify, checklist, analyze).
                </p>

                <h3 style={h3Style}>Kiro specs, for teams on Kiro</h3>
                <p style={pStyle}>
                    Kiro builds the same idea into the IDE. Each spec lives in <Code>.kiro/specs/&lt;feature&gt;/</Code> as{" "}
                    <Code>requirements.md</Code> (or <Code>bugfix.md</Code>), <Code>design.md</Code> and <Code>tasks.md</Code>.
                    Acceptance criteria use EARS notation, which keeps them testable:
                </p>
                <pre style={preStyle}>{`WHEN an auditor exports a report for a closed period
THE SYSTEM SHALL produce a PDF signed with the firm's certificate
AND record the export in the audit log with user, time and checksum.`}</pre>

                <h3 style={h3Style}>What a good spec contains</h3>
                <Table
                    head={["Weak spec", "Strong spec"]}
                    rows={[
                        ["“Add export to reports.”", "User story, who needs it and why, and 3–6 acceptance criteria a tester can check."],
                        ["Mixes UI details, database choice and goals in one paragraph.", "Spec says what and why; the stack and architecture go in the plan."],
                        ["Silent on errors, permissions and limits.", "Names edge cases: empty data, no permission, large files, time-outs."],
                        ["No link to existing rules.", "Inherits the constitution: test coverage, security and performance rules."],
                    ]}
                />
            </div>

            {/* Folder structure */}
            <div style={sectionStyle} id="folder-structure">
                <h2 style={h2Style}>The Folder Structure That Gives Every Tool Context</h2>
                <p style={pStyle}>
                    Output quality depends less on the model than on what the model knows about your repo. These files are how you
                    tell it — once, in version control, for every engineer and every tool.
                </p>
                <pre style={preStyle}>{FOLDER_TREE}</pre>
                <p style={{ ...pStyle, fontSize: "0.9rem" }}>
                    Copilot reads <Code>.github/copilot-instructions.md</Code>, path-specific{" "}
                    <Code>.github/instructions/*.instructions.md</Code> files, the nearest <Code>AGENTS.md</Code>, and a root{" "}
                    <Code>CLAUDE.md</Code>. Keep shared rules in <Code>AGENTS.md</Code> so a team using several tools maintains one
                    source of truth.
                </p>
            </div>

            {/* Model and effort */}
            <div style={sectionStyle} id="model-effort">
                <h2 style={h2Style}>Which Model and Which Effort, for Which Task</h2>
                <p style={pStyle}>
                    Two dials matter. The <strong>model</strong> sets the ceiling on capability and the price per token. The{" "}
                    <strong>effort level</strong> sets how many tokens the model spends thinking, calling tools and writing — on
                    Anthropic&apos;s current models, effort is the main control for depth and cost. The expensive mistake is running
                    everything at one setting.
                </p>

                <h3 style={h3Style}>Claude Code</h3>
                <p style={pStyle}>
                    Switch model with <Code>/model opus</Code>, <Code>/model sonnet</Code>, <Code>/model haiku</Code> or{" "}
                    <Code>/model fable</Code>; set effort with <Code>/effort high</Code> or <Code>claude --effort xhigh</Code>. The{" "}
                    <Code>opusplan</Code> alias plans with Opus and implements with Sonnet — a good default for spec-driven work.
                    Per-model effort can be pinned in <Code>.claude/settings.json</Code> under <Code>modelSettings</Code>, and a skill
                    or subagent can set its own <Code>effort</Code> in frontmatter.
                </p>
                <Table
                    head={["Task", "Model", "Effort", "Why"]}
                    rows={[
                        ["Constitution, spec, clarify", "Opus 5.5", "high", "Wrong requirements waste days; this is where depth pays."],
                        ["Plan and task breakdown", "Opus 5.5 (or opusplan)", "high", "Architecture choices and task ordering need reasoning."],
                        ["Implement a well-specified task", "Sonnet 5.5", "medium", "The spec already carries the thinking; speed matters more."],
                        ["Implement a hard or long task", "Sonnet 5.5 or Opus 5.5", "high", "Raise effort before switching model."],
                        ["Hard C++ bug, legacy module, cross-cutting refactor", "Fable 5.1 or Opus 5.5", "high → xhigh", "Long reasoning chains across unfamiliar code."],
                        ["Autonomous runs over ~30 minutes", "Opus 5.5 or Fable 5.1", "xhigh", "Anthropic's documented use case for xhigh."],
                        ["Code review of AI-written changes", "Opus 5.5", "high", "A reviewer should be at least as capable as the author."],
                        ["Small edits, summaries, ticket triage, subagents", "Haiku 4.5 or Sonnet 5.5", "— / low", "Fastest and cheapest; Haiku has no effort setting."],
                    ]}
                />

                <h3 style={h3Style}>GitHub Copilot</h3>
                <p style={pStyle}>
                    Choose the model in the chat input&apos;s model picker; for reasoning models, the arrow next to the model name opens
                    a <strong>Thinking Effort</strong> menu (None, Low, Medium, High). <strong>Auto</strong> lets Copilot route by task
                    complexity — fine for everyday chat, but pin the model for spec and review work so results are repeatable. The
                    same Claude models are available in Copilot alongside OpenAI&apos;s GPT and Codex models, Gemini and others;
                    which ones you see depends on your plan and your organisation&apos;s policy.
                </p>
                <Table
                    head={["Task", "Model in Copilot", "Thinking effort"]}
                    rows={[
                        ["Spec, plan, architecture questions", "Claude Opus 5.5 or a top GPT model", "High"],
                        ["Agent-mode implementation from tasks.md", "Claude Sonnet 5.5 or a Codex model", "Medium"],
                        ["Inline completions and quick chat", "Auto or a fast model (Haiku 4.5, a mini model)", "Low / None"],
                        ["Reviewing a pull request", "Claude Opus 5.5 or equivalent", "High"],
                    ]}
                />
                <p style={{ ...pStyle, fontSize: "0.9rem" }}>
                    Larger models use more of a Copilot plan&apos;s premium allowance, so the routing above is also a budget decision.
                </p>

                <h3 style={h3Style}>Effort levels explained</h3>
                <Table
                    head={["Level", "Use it for", "Trade-off"]}
                    rows={[
                        [<Code key="l">low</Code>, "Simple, well-defined tasks; subagents; chat.", "Fastest and cheapest; may under-think hard problems."],
                        [<Code key="m">medium</Code>, "Well-specified agentic coding. Default on Opus 5.5 and in Claude Code on Sonnet 5.5.", "The balance point for most implementation."],
                        [<Code key="h">high</Code>, "Complex reasoning, difficult coding, specs and plans. API default on most models.", "Spends what the task needs."],
                        [<Code key="x">xhigh</Code>, "Long-running agentic work, roughly 30+ minutes.", "Meaningfully more tokens than high."],
                        [<Code key="mx">max</Code>, "Frontier problems only.", "Often large cost for small gains; can overthink."],
                    ]}
                />
                <p style={{ ...pStyle, fontSize: "0.9rem" }}>
                    Rule of thumb: raise effort before switching to a bigger model, and lower it only where you have checked that
                    quality holds.
                </p>
            </div>

            {/* Tokens */}
            <div style={sectionStyle} id="tokens">
                <h2 style={h2Style}>Tokens and Cost, the Basics</h2>
                <ul style={{ ...pStyle, paddingLeft: "1.25rem" }}>
                    <li><strong>Token:</strong> the unit models read and bill in. On Claude&apos;s current tokenizer, 1M tokens is roughly 555,000 words.</li>
                    <li><strong>Context window:</strong> how much the model can hold at once — 1M tokens on Fable 5.1, Opus 5.5 and Sonnet 5.5; 200K on Haiku 4.5. Bigger is not free: every token in context is billed on every turn.</li>
                    <li><strong>Input vs output:</strong> output costs five times input on current Claude models, and thinking counts as output. That is why effort level moves the bill.</li>
                    <li><strong>Prompt caching:</strong> repeated context (instruction files, the spec, unchanged code) is read from cache at a fraction of the input price — 10% on most models, 5% on Opus 5.5, 2.5% on Fable 5.1.</li>
                    <li><strong>Batch:</strong> non-urgent jobs through the Batch API are 50% off.</li>
                </ul>

                <h3 style={h3Style}>Current Claude models</h3>
                <Table
                    head={["Model", "Best for", "Input / output per 1M tokens", "Context", "Default effort"]}
                    rows={[
                        ["Claude Fable 5.1", "Hardest reasoning, long agentic runs", "$10 / $50", "1M", "high"],
                        ["Claude Opus 5.5", "Specs, plans, agentic coding, review", "$4 / $20", "1M", "medium"],
                        ["Claude Sonnet 5.5", "Everyday implementation", "$2 / $10", "1M", "high (medium in Claude Code)"],
                        ["Claude Haiku 4.5", "Fast, cheap, high-volume", "$1 / $5", "200K", "not supported"],
                    ]}
                />
                <p style={{ ...pStyle, fontSize: "0.85rem" }}>
                    API list prices, last verified {LAST_VERIFIED} against{" "}
                    <a href="https://platform.claude.com/docs/en/about-claude/models/overview" rel="noopener" target="_blank" style={{ color: "var(--accent)" }}>
                        Anthropic&apos;s models overview
                    </a>
                    . Seat-based plans (Claude Team and Enterprise, Copilot) bill differently; the relative costs still hold.
                </p>

                <h3 style={h3Style}>Worked example: one feature, two ways</h3>
                <p style={pStyle}>
                    A mid-sized feature: about 150K input and 40K output tokens for spec, plan and tasks, then about 2M input (80%
                    cached) and 150K output for implementation.
                </p>
                <Table
                    head={["Approach", "Spec + plan", "Implementation", "Total"]}
                    rows={[
                        ["Everything on Fable 5.1", "$3.50", "$11.90", "≈ $15.40"],
                        ["Opus 5.5 plans, Sonnet 5.5 implements", "$1.40", "$2.62", "≈ $4.02"],
                    ]}
                />
                <p style={{ ...pStyle, fontSize: "0.85rem" }}>
                    Illustrative list-price arithmetic that ignores cache-write surcharges. The point is the ratio: routing by task cuts
                    the bill by roughly 4× with no loss where it matters. Across a team of 50 shipping a few features a week, that
                    difference is a budget line.
                </p>
            </div>

            {/* Tracks */}
            <div style={sectionStyle} id="tracks">
                <h2 style={h2Style}>Tracks by Function</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                    {[
                        ["Development", "Spec Kit on real tickets; C++ track for legacy-code comprehension, test generation and build-failure triage; Node/React track for agentic implementation and AI-assisted review."],
                        ["QA", "Acceptance criteria to test cases, test automation authoring, defect triage and de-duplication — with specs as the single source of truth."],
                        ["Support", "Answers grounded in product docs and past tickets, ticket summaries, log analysis, and cleaner escalations to engineering."],
                    ].map(([title, text]) => (
                        <div key={title} style={cardStyle}>
                            <div style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.4rem" }}>{title}</div>
                            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>{text}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Formats */}
            <div style={sectionStyle} id="formats">
                <h2 style={h2Style}>Formats</h2>
                <Table
                    head={["Format", "Length", "Outcome"]}
                    rows={[
                        ["Demo session", "Half day", "One ticket from your backlog taken spec-to-PR live; model and effort choices explained."],
                        ["Team programme", "2 weeks", "Workshops per track, context files in your main repos, playbook, templates, skills check, named champions."],
                        ["Programme + measurement", "2 weeks + rollout", "Foundations first, then a productivity baseline and pilots via the Claude Code rollout engagement."],
                    ]}
                />
            </div>
        </>
    );
}
