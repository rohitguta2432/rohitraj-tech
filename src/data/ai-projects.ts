// Landing page AI project summaries.
// Standalone data — intentionally different shape from Project type in @/types/project.
// Uses 'title' (not 'name'), 'solution' (not 'solves'). Status 'live' means
// shipped/runnable; 'development' means work-in-progress. Not part of Project status enum.

export interface AIProjectSummary {
    title: string;
    /** Matches a slug in @/data/projects so the landing card can deep-link to /projects/<slug>. */
    slug: string;
    problem: string;
    solution: string;
    techStack: string[];
    aiApproach: string;
    repoUrl: string;
    liveUrl?: string;
    status: 'live' | 'development' | 'production' | 'active';
    image?: string;
    metrics?: { label: string; value: string }[];
}

export const aiProjectSummaries: AIProjectSummary[] = [
    {
        title: "MyFinancial — Personal Financial Advisor",
        slug: "myfinancial",
        problem: "Financial planning in India is fragmented across banks, insurance, and tax documents. Most tools require sharing sensitive data with third parties.",
        solution: "Privacy-first PWA that consolidates financial data locally via a 6-step wizard — Profile, Income, Assets, Liabilities, Insurance, Tax — with real-time advisory metrics like Financial Runway and Savings Rate.",
        techStack: ["React 19", "Vite 7", "Tailwind CSS 4", "Zustand", "Dexie (IndexedDB)", "Spring Boot 3.x", "Java 21", "PostgreSQL"],
        aiApproach: "Rule-based advisory engine for Indian financial instruments (PPF, EPF, NPS). Old vs. New Tax regime comparison. Coverage gap analysis for insurance. No cloud dependency — all computation runs locally.",
        repoUrl: "https://github.com/rohitguta2432/myFinance",
        liveUrl: "https://myfinancial.in/",
        status: "live",
        image: "/images/projects/myfinancial.png",
        metrics: [
            { label: "Data privacy", value: "100% on-device" },
            { label: "Wizard completion", value: "6 steps · ~4 min" },
            { label: "Tax regimes covered", value: "Old + New" },
        ],
    },
    {
        title: "PropCheck — AI Property Trust Score for India",
        slug: "propcheck",
        problem: "Indian property buyers lose lakhs to fraudulent listings on Magicbricks, 99acres, Housing.com, and NoBroker. Fake RERA numbers, recycled stock photos, and inflated pricing slip past buyers because no neutral tool exists to verify a listing in seconds.",
        solution: "Paste any listing URL — the AI engine scrapes the page (with an LLM parsing fallback when sites are SPA or rate-limited), cross-checks 8 trust signals against Karnataka RERA, a locality price index, and a perceptual-image database, and returns a 0–100 Trust Score with explainable red flags in 30 seconds.",
        techStack: ["Next.js 14", "Tailwind CSS", "FastAPI 0.115", "Python 3.12", "PostgreSQL 16", "SQLAlchemy 2", "httpx", "BeautifulSoup4", "imagehash", "OpenRouter (Gemma 4 31B)", "Chrome MV3"],
        aiApproach: "8-signal trust engine — listing age, price-vs-locality delta, duplicate count, RERA registration check, image reverse-search via perceptual hashing, builder complaints, owner-name match, suspicious patterns. Gemma 4 31B via OpenRouter free tier kicks in as LLM parsing fallback when scrapers fail.",
        repoUrl: "https://github.com/rohitguta2432/propTech",
        liveUrl: "https://propcheck.rohitraj.tech/",
        status: "live",
        image: "/images/projects/propcheck.png",
        metrics: [
            { label: "Trust score", value: "0–100 in 30s" },
            { label: "Signals checked", value: "8 per listing" },
            { label: "API endpoint", value: "api.rohitraj.tech" },
        ],
    },
    {
        title: "StellarMIND — Chat-to-SQL with pgvector",
        slug: "stellarmind",
        problem: "Business users need to query databases without knowing SQL. Existing tools lack context-aware query generation and safety guarantees.",
        solution: "Spring Boot MCP server that converts natural language questions into read-only SQL using LLM with retrieval-augmented context from pgvector.",
        techStack: ["Spring Boot", "Spring AI", "PostgreSQL", "pgvector", "MCP Protocol", "OpenAI"],
        aiApproach: "RAG-based SQL generation: schema knowledge stored as embeddings in pgvector, retrieved as context for LLM. Strict read-only enforcement (only SELECT/WITH).",
        repoUrl: "https://github.com/rohitguta2432/spring-ai-mcp-server",
        status: "live",
        image: "/images/projects/stellarmind.png",
        metrics: [
            { label: "Query latency p95", value: "<1.2s" },
            { label: "SQL safety", value: "100% read-only" },
            { label: "Schema embeddings", value: "pgvector" },
        ],
    },
    {
        title: "MicroItinerary — AI Travel Planner",
        slug: "microitinerary",
        problem: "Travel apps optimize for proximity and ratings. They don't consider human energy levels, group dynamics, or budget constraints intelligently.",
        solution: "AI-powered PWA that generates personalized annual travel itineraries with intelligent destination suggestions, cost estimation in INR, and Splitwise-style expense splitting.",
        techStack: ["React 18", "Vite", "Spring Boot 3.2.2", "Java 21", "PostgreSQL 16", "Redis", "OpenAI GPT-4"],
        aiApproach: "GPT-4 for destination recommendations based on season, budget, and preferences. AI-generated cost breakdowns for hotels, food, transport, and activities.",
        repoUrl: "https://github.com/rohitguta2432/MicroItinerary",
        status: "live",
        metrics: [
            { label: "Build time", value: "6 weeks" },
            { label: "GPT-4 cost / itinerary", value: "<$0.08" },
            { label: "PWA Lighthouse", value: "94/100" },
        ],
    },
    {
        title: "Agent Autopsy — Forensic Debugger for Failed AI Agent Runs",
        slug: "agent-autopsy",
        problem: "Most AI agent failures are silent — the run completes, the status code is green, and the result is still wrong. Observability platforms show you the trace, but never the cause of death.",
        solution: "Paste a dead agent's transcript (JSON, JSONL, or raw logs) and get an instant forensic report that names the failure signature — death loop, error blindness, ghost tool, flatline, or context bloat — plus a local-LLM pathologist's note for deeper root cause. 100% local; nothing leaves your machine.",
        techStack: ["Next.js 16", "TypeScript", "App Router", "Ollama (qwen3:14b)", "Vitest"],
        aiApproach: "Deterministic heuristics fire in under a second to classify five failure signatures — DEATH_LOOP, ERROR_BLINDNESS, GHOST_TOOL, FLATLINE, CONTEXT_BLOAT. When a local Ollama model is running, qwen3:14b adds a pathologist's note with a deeper root-cause read — fully local, no trace ever leaves the machine.",
        repoUrl: "https://github.com/rohitguta2432/agent-autopsy",
        status: "active",
        image: "/images/projects/agent-autopsy-poster.jpg",
        metrics: [
            { label: "Failure signatures", value: "5 classified" },
            { label: "Verdict", value: "<1s, then LLM" },
            { label: "Privacy", value: "100% local" },
        ],
    },
    {
        title: "tinyvoice — Fine-Tune a Model in Your Own Voice in an Afternoon",
        slug: "tinyvoice",
        problem: "Training your own language model sounds like a PhD job that needs a GPU cluster, so most developers never try. The tooling looks intimidating from the outside.",
        solution: "A 0.5B-parameter model fine-tuned to write in my voice — trained in about three minutes on a laptop, on 28 of my own posts, with no GPU and no cloud. A side-by-side web UI streams the stock model against the tuned one so you can see exactly what fine-tuning changes.",
        techStack: ["MLX", "Qwen2.5-0.5B (4-bit LoRA)", "Python", "FastAPI", "Server-Sent Events"],
        aiApproach: "MLX LoRA fine-tune of Qwen2.5-0.5B-Instruct-4bit on 26 train / 2 valid chat pairs built from my own published posts — 400 steps, roughly three minutes on Apple silicon. FastAPI serves both the stock and tuned models over SSE. The honest lesson baked into the demo: the model learns style, not facts — voice transfers in an afternoon, truth does not.",
        repoUrl: "https://github.com/rohitguta2432/tinyvoice",
        status: "active",
        image: "/images/projects/tinyvoice-poster.jpg",
        metrics: [
            { label: "Train time", value: "~3 min · no GPU" },
            { label: "Model", value: "0.5B · 4-bit LoRA" },
            { label: "Trained on", value: "28 of my posts" },
        ],
    },
    {
        title: "snap3d — One Photo In, an Editable 3D Model Out",
        slug: "snap3d",
        problem: "A photo shows you one side of an object; the other five sides are a guess. Turning a single 2D image into a usable 3D model normally needs a photogrammetry rig or hours of manual modeling.",
        solution: "Drop one photo and Claude Fable 5 infers depth and hidden geometry, then rebuilds the object as a parametric scene of named parts rendered live in Three.js. Because every part is named, you keep editing in plain English — 'make the wheels huge', 'paint it neon green' — and export to .obj for Blender or Unity.",
        techStack: ["Claude Fable 5", "Three.js", "Node.js (zero-dep stdlib)", "JavaScript"],
        aiApproach: "Claude Fable 5 is treated as a data engine: from a single photo it emits a strict-JSON scene of ~25 named primitives. Three.js draws them; plain-English remix requests go back to Fable 5, which re-edits only the named parts you mention. A ~100-line zero-dependency Node stdlib server bridges to the API or a local claude CLI.",
        repoUrl: "https://github.com/rohitguta2432/snap3d",
        status: "active",
        image: "/images/projects/snap3d-poster.jpg",
        metrics: [
            { label: "Input", value: "1 photo → 3D" },
            { label: "Scene", value: "~25 named parts" },
            { label: "Dependencies", value: "zero (stdlib)" },
        ],
    },
    {
        title: "Agentic OS — Force-Directed Map of a 387-Skill Claude Code Setup",
        slug: "agentic-os",
        problem: "An agent setup grows one plugin at a time until it has hundreds of skills, and nobody can see what it actually contains — which overlap, which clusters are overweight, which were hand-written versus pulled in by a plugin.",
        solution: "Renders every skill in a Claude Code install as a star in a searchable force-directed galaxy — 387 skills across 34 clusters, 67 hand-made and 320 from plugins. Search, filter by cluster, click any node for its front-matter. Hand-made skills wear a white ring, so authored capability is visually separable from installed capability.",
        techStack: ["Next.js 16", "React 19", "react-force-graph-2d", "framer-motion", "Tailwind CSS 4"],
        aiApproach: "A generator script walks the local personal and plugin skill trees, parses each SKILL.md front-matter, and writes a committed snapshot. The graph API reshapes that snapshot into nodes, links, categories, and stats at build time — so a deployed build ships the map without ever reading a machine-local directory.",
        repoUrl: "https://github.com/rohitguta2432/agentic-os",
        status: "active",
        image: "/images/projects/agentic-os-poster.jpg",
        metrics: [
            { label: "Skills mapped", value: "387 · 34 clusters" },
            { label: "Hand-made", value: "67 of 387" },
            { label: "Render", value: "canvas force sim" },
        ],
    },
    {
        title: "claude-autodev — Autonomous 8-Stage Dev Pipeline for Claude Code",
        slug: "claude-autodev",
        problem: "Agentic coding tools stop at a diff. Nothing forces a spec to exist before implementation, nothing blocks a run that never wrote a test, and nothing catches a stage that quietly produced no artifact — so failures surface as a plausible-looking PR nobody can trust.",
        solution: "One-line requirement plus a git repo in; a reviewed, tested PR out. Eight gated stages — spec, analyze, implement, verify, push, review, test, deploy — each a fresh headless Claude Code session that only advances once it produces the artifact the next stage needs, all inside an isolated git worktree with a live mission-control dashboard.",
        techStack: ["Node.js 22+", "SQLite", "HTTP + SSE", "git worktrees", "Claude Code CLI"],
        aiApproach: "Every stage is a separate headless claude -p session with no shared context — the reviewer has never seen the plan, the builder has never seen the acceptance criteria. Advancement is gated on real artifacts, not model self-reports: spec files non-empty, checklists ticked, verify PASS, review APPROVE, test command exit 0. Bounded retries, then park BLOCKED with a written diagnosis.",
        repoUrl: "https://github.com/rohitguta2432/claude-autodev",
        status: "active",
        image: "/images/projects/claude-autodev-poster.jpg",
        metrics: [
            { label: "Pipeline", value: "8 gated stages" },
            { label: "Selftest", value: "~30s · no quota" },
            { label: "CI", value: "3 OS · Node 22+24" },
        ],
    },
    {
        title: "KisanSathi — Six AI Farm Experts, Keyless and Local",
        slug: "kisansathi",
        problem: "Farmer-facing AI tools die at the API-key step, answer in English, and hand back generic advice with no live numbers behind it. A smallholder asking when to sell or how to treat yellowing wheat leaves gets a paragraph, not a decision.",
        solution: "Ask one question in Hindi, Hinglish, English, or a regional language. A router agent picks the right specialist from six, pulls the live data its domain needs — real 7-day weather, real mandi prices — and streams back a short, practical answer in the farmer's own language. Zero API keys.",
        techStack: ["FastAPI", "Python 3.11", "Next.js 16", "Ollama (qwen3:14b)", "Open-Meteo", "Agmarknet"],
        aiApproach: "One fast router LLM call classifies agent, language, place, and commodity; the chosen specialist fetches live data and streams a grounded answer. Keyless by default — Ollama locally so nothing leaves the machine, Open-Meteo for forecasts, data.gov.in for daily mandi prices — with mandi lookups degrading from state+commodity to commodity to latest records.",
        repoUrl: "https://github.com/rohitguta2432/kisansathi",
        status: "active",
        image: "/images/projects/kisansathi-poster.jpg",
        metrics: [
            { label: "Agents", value: "6 specialists" },
            { label: "API keys needed", value: "zero" },
            { label: "Live data", value: "weather + mandi" },
        ],
    },
    {
        title: "MarginChef — AI Agent That Finds a Restaurant's Margin Leaks",
        slug: "marginchef",
        problem: "Restaurants run on 3-5% net margins while food costs are up roughly 35% since 2019, and most owners never see per-dish economics. The leaks hide inside a POS export nobody reads.",
        solution: "Point it at four CSVs from any POS or supplier sheet. It costs every plate against live ingredient prices, runs five leak detectors, sorts the menu into Stars, Plowhorses, Puzzles, and Dogs, and returns concrete reprice suggestions plus a five-move action plan ranked by money at stake — all on a local model, numbers never leaving the machine.",
        techStack: ["Python 3.10+", "rich", "Ollama (qwen3:14b)", "pytest"],
        aiApproach: "Deterministic economics first, LLM second. Five rule-based detectors quantify each leak in money terms — high food cost, price lag, bleeding bestseller, dead weight, kitchen waste — and each dish keeps only its biggest leak so the monthly total stays honest. A local model writes the ranked action plan on top of those numbers, falling back to rule-based advice when no model is running.",
        repoUrl: "https://github.com/rohitguta2432/marginchef",
        status: "active",
        image: "/images/projects/marginchef-poster.jpg",
        metrics: [
            { label: "Input", value: "4 CSVs" },
            { label: "Leak detectors", value: "5 · money-ranked" },
            { label: "Cloud calls", value: "zero" },
        ],
    },
    {
        title: "Quorum — Deep-Research Agent Swarm with a Shared GraphRAG Brain",
        slug: "quorum",
        problem: "Most AI research tools are one model in a loop — no second opinion, and vanilla vector RAG fumbles exactly the multi-hop questions that need relationships rather than similar-looking paragraphs.",
        solution: "A Planner splits the question, several Researchers work in parallel, a Critic hunts gaps, and a Synthesizer writes the grounded answer — all coordinating through one shared knowledge graph they build live. The UI shows agents lighting up and the graph blooming node by node.",
        techStack: ["Python 3.12", "FastAPI", "SSE", "NetworkX", "React", "Vite"],
        aiApproach: "Agents coordinate through a GraphRAG store, not by passing text blobs. Merge-on-write normalizes entity names so two researchers who find the same thing converge on one node, and retrieval is graph-aware — embed, take top-k nodes, expand to neighbours, hand the subgraph to the Synthesizer.",
        repoUrl: "https://github.com/rohitguta2432/quorum",
        status: "active",
        image: "/images/projects/quorum-poster.jpg",
        metrics: [
            { label: "Swarm", value: "4 agent roles" },
            { label: "Coordination", value: "shared graph" },
            { label: "Demo mode", value: "zero config" },
        ],
    },
    {
        title: "RegexForge — Plain English to a Regex You Can Trust",
        slug: "regexforge",
        problem: "Regex is hard because you can never be sure the pattern does what you think. Research names trust, test coverage, and cross-language portability as the real pains — and most AI regex generators print a pattern and wish you luck.",
        solution: "Describe it in English and get the regex plus the evidence: live match highlighting, auto-generated positive and negative test cases that pass or fail against the pattern in real time, a token-by-token breakdown, and one-click export to six languages. Fully local.",
        techStack: ["Next.js", "React", "framer-motion", "Ollama (qwen2.5:14b)"],
        aiApproach: "The model drafts the pattern; the app proves it. Generated counter-examples run live against the candidate, so a too-loose regex is caught the moment it matches something it should not — the LLM is never the last word. Any OpenAI-compatible endpoint works, defaulting to local Ollama.",
        repoUrl: "https://github.com/rohitguta2432/regexforge",
        status: "active",
        image: "/images/projects/regexforge-poster.jpg",
        metrics: [
            { label: "Export targets", value: "6 languages" },
            { label: "Validation", value: "auto test cases" },
            { label: "Privacy", value: "100% local" },
        ],
    },
    {
        title: "Skillet — Any Docs Page Into an Installable Agent Skill",
        slug: "skillet",
        problem: "Agent skills are the fastest way to teach a coding agent a new tool, but writing a good SKILL.md by hand means reading the docs yourself and distilling them into triggers, usage, recipes, and gotchas. Most people never get past the reading.",
        solution: "Paste a docs URL or drop a PDF and get a complete, ready-to-install SKILL.md streamed live — frontmatter with trigger phrases, core usage, recipes, gotchas. Download it into the skills directory and the agent knows the tool. No API keys, no cloud, no cost.",
        techStack: ["Next.js", "React", "Ollama (qwen3:14b)", "Python", "pypdf"],
        aiApproach: "Server-side fetch strips a docs page to readable text and PDFs route through a one-file pypdf backend; a local Ollama model then writes the full SKILL.md streamed token by token. Without the optional PDF backend, URL mode still works and PDF requests fail with a clear message rather than silently.",
        repoUrl: "https://github.com/rohitguta2432/skillet",
        status: "active",
        image: "/images/projects/skillet-poster.jpg",
        metrics: [
            { label: "Input", value: "docs URL or PDF" },
            { label: "Output", value: "installable SKILL.md" },
            { label: "API keys", value: "zero" },
        ],
    },
    {
        title: "prompt-ocean — Type a Sea, Watch It Exist",
        slug: "prompt-ocean",
        problem: "Let an LLM write shader code or scene state directly and one hallucination breaks the render — which is why most text-to-3D demos snap between presets instead of responding continuously.",
        solution: "Describe the water in plain words and the ocean morphs into it in real time. The AI turns the phrase into physical wave parameters that a Gerstner-wave shader renders on the GPU, with sky, sun, and stars reacting to the same prompt. Works with no API key out of the box.",
        techStack: ["Next.js", "TypeScript", "Three.js", "GLSL", "Ollama (llama3.2)"],
        aiApproach: "The LLM never writes code — it emits about twelve clamped numbers against a published parameter contract, validated before they reach the renderer, so a hallucinating model cannot break the frame. Without Ollama, a zero-dependency rules engine composes the same parameters, so it runs keyless.",
        repoUrl: "https://github.com/rohitguta2432/prompt-ocean",
        status: "active",
        image: "/images/projects/prompt-ocean-poster.jpg",
        metrics: [
            { label: "Shader", value: "7 Gerstner waves" },
            { label: "LLM output", value: "~12 clamped numbers" },
            { label: "Runs keyless", value: "rules fallback" },
        ],
    },
];
