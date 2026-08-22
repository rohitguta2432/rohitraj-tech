// Landing page AI project summaries.
// Standalone data — intentionally different shape from Project type in @/types/project.
// Uses 'title' (not 'name'), 'solution' (not 'solves'). Status 'live' means
// shipped/runnable; 'development' means work-in-progress. Not part of Project status enum.

export interface AIProjectSummary {
    title: string;
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
];
