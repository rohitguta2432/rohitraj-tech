import type { Project } from '@/types/project';
export type { Project } from '@/types/project';

export const projects: Project[] = [
    {
        slug: "myfinancial",
        name: "MyFinancial — Personal Financial Advisor",
        problem: "Financial planning in India is fragmented across banks, insurance, and tax documents. Most tools require sharing sensitive data with third parties.",
        solves: "Privacy-first PWA that consolidates financial data locally via a 6-step wizard — Profile, Income, Assets, Liabilities, Insurance, Tax — with real-time advisory metrics like Financial Runway and Savings Rate.",
        techStack: ["React 19", "Vite 7", "Tailwind CSS 4", "Zustand", "Dexie (IndexedDB)", "Spring Boot 3.x", "Java 21", "PostgreSQL"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/myFinance",
        liveUrl: "https://myfinancial.in/",
        aiApproach: "Rule-based advisory engine for Indian financial instruments (PPF, EPF, NPS). Old vs. New Tax regime comparison. Coverage gap analysis for insurance. No cloud dependency — all computation runs locally.",
        image: "/images/projects/myfinancial.png",
        images: [
            { src: "/images/projects/myfinancial-1.png", caption: "Landing Page — Fix Your Finances Early" },
            { src: "/images/projects/myfinancial-2.png", caption: "Step 1 — Personal Profile & Demographics" },
            { src: "/images/projects/myfinancial-3.png", caption: "Profile Filled — Employment & Residency" },
            { src: "/images/projects/myfinancial-4.png", caption: "Risk Profile — Asset Allocation Result" },
        ],
        details: {
            businessImpact: "Indians manage finances across 5-10 different platforms. No single tool consolidates bank accounts, insurance, tax, and investments — while keeping data private. MyFinancial solves this with zero cloud dependency.",
            approach: [
                "React 19 + Vite 7 PWA frontend with Tailwind CSS 4 glassmorphism design",
                "Dexie (IndexedDB) for privacy-first local data storage — no sensitive data leaves the browser",
                "Zustand for lightweight state management across the 6-step wizard",
                "Spring Boot 3.x + Java 21 backend with PostgreSQL for optional cloud sync",
                "Color-coded wizard steps with contextual financial health indicators"
            ],
            decisions: [
                "LocalStorage/IndexedDB over cloud storage — privacy is a core value proposition",
                "Rule-based engine over AI/ML — deterministic financial calculations are more trustworthy",
                "India-specific instruments (PPF, EPF, NPS, Gold) over generic global templates",
                "PWA over native app — broader reach, works offline, single codebase"
            ],
            currentStatus: "Live in production at https://myfinancial.in/. Full 6-step wizard shipped: Profile, Income, Assets, Liabilities, Insurance, and Tax. Wealth Dashboard with Net Worth scorecard and Financial Runway live.",
            roadmap: [
                "Add goal-based financial planning (retirement, education, home)",
                "Implement mutual fund portfolio analysis",
                "Add PDF report generation for financial health summary"
            ],
            improvements: [
                "Could add optional encrypted cloud backup for cross-device sync",
                "Consider adding AI-powered investment recommendations"
            ]
        }
    },
    {
        slug: "propcheck",
        name: "PropCheck — AI Property Trust Score for India",
        problem: "Indian property buyers lose lakhs to fraudulent listings on Magicbricks, 99acres, Housing.com, and NoBroker. Fake RERA numbers, recycled stock photos, and inflated pricing slip past buyers because no neutral tool exists to verify a listing in seconds.",
        solves: "Paste any listing URL — the AI engine extracts the page (with an LLM parsing fallback when scrapers hit SPAs or rate-limit walls), cross-checks 8 trust signals against Karnataka RERA, a locality price index, and a perceptual-image database, and returns a 0–100 Trust Score with explainable red flags in 30 seconds. Free for buyers. API tier for lenders.",
        techStack: ["Next.js 14", "React 18", "Tailwind CSS", "FastAPI 0.115", "Python 3.12", "Pydantic 2.9", "PostgreSQL 16", "SQLAlchemy 2", "Alembic", "httpx", "BeautifulSoup4", "imagehash", "Pillow", "OpenRouter (Gemma 4 31B)", "slowapi", "Chrome MV3"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/propTech",
        liveUrl: "https://propcheck.rohitraj.tech/",
        aiApproach: "8-signal trust engine — listing age, price-vs-locality delta, duplicate count, RERA registration check, image reverse-search via perceptual hashing, builder complaints, owner-name match, suspicious patterns. LLM parsing fallback (Gemma 4 31B via OpenRouter free tier) kicks in when scrapers fail on SPAs or rate-limit walls. Read-only — no listing data is sold, no broker commissions are taken.",
        image: "/images/projects/propcheck.png",
        images: [
            { src: "/images/projects/propcheck-1.png", caption: "Landing — Don't get scammed on your next property" },
            { src: "/images/projects/propcheck-2.png", caption: "How it works — 8 signals, 30-second Trust Score" },
            { src: "/images/projects/propcheck-3.png", caption: "For lenders — AI home-loan diligence in one API call" },
        ],
        details: {
            businessImpact: "Housing.com's own survey says 65% of buyers can't trust listings. Banks and NBFCs spend ₹2,000–5,000 and 3–7 days on property due-diligence per home loan file. PropCheck closes both gaps with one neutral AI engine — free for buyers, API-priced for lenders.",
            approach: [
                "Next.js 14 App Router frontend with Tailwind for the consumer landing, /how-it-works, and /for-lenders pages",
                "FastAPI 0.115 + Pydantic 2.9 backend exposing /v1/check, /v1/feedback, /healthz endpoints — OpenAPI auto-generated at /docs",
                "PostgreSQL 16 + SQLAlchemy 2 + Alembic migrations for listing checks, feedback, and the locality price index",
                "httpx + BeautifulSoup4 + lxml scrape pipeline with Gemma 4 31B (OpenRouter free) as LLM parsing fallback when sites are SPA or rate-limited",
                "imagehash + Pillow for perceptual-hash reverse-search against a known stock-photo and recycled-listing dataset",
                "slowapi for IP-level rate limiting; structlog for structured request logs",
                "Chrome MV3 extension surfaces the Trust Score directly on Magicbricks/99acres/Housing/NoBroker product pages",
                "Vercel hosts both the Next.js frontend (propcheck.rohitraj.tech) and the FastAPI backend (api.rohitraj.tech) as serverless"
            ],
            decisions: [
                "Free forever for buyers, paid API for lenders — neutrality is the moat; if we monetized buyers we'd be just another portal",
                "LLM parsing fallback over heavier headless scrapers — Gemma 4 31B on OpenRouter free tier kept the bundle and the bill at zero",
                "8 explicit signals over a black-box ML score — Indian buyers and lenders both want explainable red flags they can act on",
                "Karnataka RERA first (Bangalore launch May 2026), expand state-by-state — RERA APIs and formats differ per state",
                "Chrome extension as a wedge — buyers already browse listings on the portals; meet them on the page they're already on"
            ],
            currentStatus: "Live in production at https://propcheck.rohitraj.tech/. FastAPI backend live at https://api.rohitraj.tech/ with /v1/check + /v1/feedback shipping. LLM parsing fallback verified live (Gemma 4 31B). Chrome MV3 extension built (phase 8). Day 14 calibration on real Magicbricks/99acres URLs revealed SPA + rate-limit walls — calibration deltas in active tuning.",
            roadmap: [
                "Tune calibration deltas on real-world URLs from day-14 report",
                "Harden scraper for SPA + rate-limit walls (Browserbase / residential proxy fallback)",
                "Expand RERA coverage from Karnataka to Maharashtra, Telangana, and Tamil Nadu",
                "Ship Chrome extension to the Web Store after MV3 review",
                "Onboard first lender to the /v1/check API for home-loan diligence"
            ],
            improvements: [
                "Could add a community-sourced scam-listing reporting flow with signed feedback",
                "Consider WhatsApp delivery of Trust Scores for users who paste links there (currently parked per commit 553c334)"
            ]
        }
    },
    {
        slug: "stellarmind",
        name: "StellarMIND — Chat-to-SQL with RAG",
        problem: "Business users need to query databases without knowing SQL. Existing tools lack context-aware query generation and safety guarantees.",
        solves: "Spring Boot MCP server that converts natural language questions into read-only SQL using LLM with retrieval-augmented context from pgvector.",
        techStack: ["Spring Boot", "Spring AI", "PostgreSQL", "pgvector", "MCP Protocol", "OpenAI"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/spring-ai-mcp-server",
        aiApproach: "RAG-based SQL generation — schema knowledge stored as embeddings in pgvector, retrieved as context for LLM. Strict read-only enforcement (only SELECT/WITH).",
        image: "/images/projects/stellarmind.png",
        details: {
            businessImpact: "Data democratization requires non-technical users to access insights without engineering bottlenecks. Raw LLM-to-SQL is unreliable. RAG with schema context fixes this.",
            approach: [
                "Spring Boot MCP server with Tool interface for executeDataQuery",
                "pgvector for storing schema knowledge chunks and embeddings",
                "Spring AI for LLM integration (provider-agnostic — works with OpenAI, Anthropic, etc.)",
                "Chain-of-Thought (CoT) web interface for query debugging and transparency",
                "Read-only SQL enforcement via query parsing (only SELECT, WITH allowed)"
            ],
            decisions: [
                "Read-only restriction limits use cases but ensures database safety",
                "pgvector requires PostgreSQL — not database-agnostic, but worth the trade-off",
                "MCP transport (stdio) over HTTP for better AI assistant integration",
                "Separate stellarmind-server and stellarmind-client for modularity"
            ],
            currentStatus: "Core query flow working. CoT UI functional. Newman test suite passing.",
            roadmap: [
                "Add support for streaming responses",
                "Implement query history and favorites",
                "Add schema auto-discovery"
            ],
            improvements: [
                "Could add query result visualization",
                "Consider supporting multiple database connections"
            ]
        }
    },
    {
        slug: "clinicai",
        name: "ClinicAI — WhatsApp AI Clinic Assistant",
        problem: "India has 12 lakh+ small clinics running on phone calls and paper diaries. Patients call multiple times to confirm, double bookings happen daily, and revenue leaks through manual invoicing.",
        solves: "WhatsApp-first AI assistant that handles appointment booking, reminders, and patient management for small clinics — in Hindi and English. No app downloads needed.",
        techStack: ["Spring Boot 3.5", "Java 21", "PostgreSQL 16", "Redis 7", "Twilio WhatsApp API", "Flyway", "Docker"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/clinicai",
        aiApproach: "Rule-based Hinglish intent classifier (Sprint 0) with planned LLM upgrade. Understands appointment booking, cancellation, and status queries in mixed Hindi-English.",
        image: "/images/projects/clinicai.png",
        images: [
            { src: "/images/projects/clinicai-1.png", caption: "WhatsApp Booking Flow — Hinglish Conversation" },
        ],
        details: {
            businessImpact: "500M+ Indians use WhatsApp daily. A clinic bot eliminates phone-tag, prevents double bookings, and automates follow-ups — directly on the platform patients already use. Zero training required.",
            approach: [
                "Spring Boot 3.5 + Java 21 backend with Flyway migrations (9 migration scripts)",
                "Twilio WhatsApp API for bi-directional messaging with Hindi templates",
                "Rule-based intent classifier parsing Hinglish queries (booking, cancellation, status)",
                "PostgreSQL 16 with JSONB for flexible clinic services and working hours",
                "Redis 7 for session management and conversation state caching",
                "Docker Compose for local development (PostgreSQL + Redis)"
            ],
            decisions: [
                "WhatsApp over custom app — zero friction adoption for Tier 2/3 clinics",
                "Twilio over Gupshup — better developer experience, official WhatsApp Business API",
                "Rule-based NLP first, LLM later — ship fast, iterate with real user data",
                "Hinglish support from day one — reflects actual patient communication patterns",
                "JSONB for services/hours — clinics have wildly different schedules and offerings"
            ],
            currentStatus: "Sprint 0 complete — backend scaffold, database schema, WhatsApp webhook, appointment slot engine, demo clinic seeded. All APIs verified.",
            roadmap: [
                "LLM-powered intent classification replacing rule-based system",
                "Patient registration and medical history tracking",
                "GST-compliant invoice generation",
                "Automated appointment reminders via WhatsApp",
                "Multi-clinic support with clinic onboarding flow"
            ],
            improvements: [
                "Add voice message transcription for patients who prefer speaking",
                "Consider regional language support beyond Hindi (Marathi, Tamil, Telugu)"
            ]
        }
    },
    {
        slug: "microitinerary",
        name: "MicroItinerary — AI Travel Planner",
        problem: "Travel apps optimize for proximity and ratings. They don't consider human energy levels, group dynamics, or intelligent budget allocation.",
        solves: "AI-powered PWA that generates personalized annual travel itineraries with intelligent destination suggestions, cost estimation in INR, and Splitwise-style expense splitting.",
        techStack: ["Spring Boot 3.2.2", "Java 21", "React 18", "Vite", "PostgreSQL 16", "Redis", "OpenAI GPT-4"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/MicroItinerary",
        aiApproach: "GPT-4 for destination recommendations based on season, budget, and group preferences. AI-generated cost breakdowns for hotels, food, transport, and activities.",
        image: "/images/projects/microitinerary-1.png",
        images: [
            { src: "/images/projects/microitinerary-1.png", caption: "Dashboard - Annual Trip Calendar" },
            { src: "/images/projects/microitinerary-2.png", caption: "AI Trip Planning - Where Next?" },
            { src: "/images/projects/microitinerary-3.png", caption: "Expense Tracking & Splitting" },
            { src: "/images/projects/microitinerary-4.png", caption: "AI Recommended Destinations" },
            { src: "/images/projects/microitinerary-5.png", caption: "Finalize Trip Details" },
            { src: "/images/projects/microitinerary-6.png", caption: "Journey Scheduled Confirmation" },
        ],
        details: {
            businessImpact: "Trip planning is tedious and error-prone. Most apps just list options — they don't understand your constraints. This uses AI to actually solve the planning problem.",
            approach: [
                "Spring Boot 3.2.2 + Java 21 backend with Flyway migrations",
                "React 18 + Vite PWA frontend with offline support via IndexedDB",
                "OpenAI GPT-4 integration for intelligent destination and cost suggestions",
                "Redis caching to reduce API costs and improve response times",
                "Google OAuth 2.0 + JWT for secure authentication"
            ],
            decisions: [
                "PWA over native app — broader reach, single codebase, works offline",
                "OpenAI API adds latency and cost, but rule-based alternatives lack quality",
                "Expense splitting algorithm prioritizes simplicity over Splitwise feature-parity",
                "PostgreSQL 16 for relational data with potential for vector search later"
            ],
            currentStatus: "Backend API functional. Frontend PWA with offline sync working. AI suggestions integrated.",
            roadmap: [
                "Add calendar view for annual planning",
                "Implement real-time expense tracking",
                "Add collaborative trip editing"
            ],
            improvements: [
                "Could add caching layer for repeated AI queries",
                "Consider fine-tuning a smaller model for cost estimation"
            ]
        }
    },
    {
        slug: "sanatanapp",
        name: "SanatanApp — Hindu Devotional App",
        problem: "Devotional users in India juggle 5+ separate apps for Chalisa, Gita, Aarti, Ramayan, and Mahabharat. Most are ad-heavy, poorly designed, and lack multi-language support.",
        solves: "All-in-one Android app to read and listen to Ramayan, Mahabharat, Hanuman Chalisa, Bhagavad Gita, and Aartis — in Hindi, English, Sanskrit, Tamil, and Telugu. No login, no backend, no ads during prayers.",
        techStack: ["React Native", "Expo SDK 52+", "expo-av", "expo-sqlite", "react-i18next", "React Navigation", "AdMob"],
        status: "active",
        repoUrl: "https://play.google.com/store/apps/details?id=com.sanatandevotional.app",
        aiApproach: "No AI — pure content-first architecture. Bundled JSON texts for offline access, streamed audio from public domain sources (Archive.org). SQLite for bookmarks, favorites, and streak tracking.",
        image: "/images/projects/sanatanapp.png",
        details: {
            businessImpact: "500M+ Hindus use smartphones daily for devotion. Existing apps are fragmented and ad-heavy. SanatanApp consolidates all devotional content into one premium, private, offline-capable experience.",
            approach: [
                "React Native + Expo SDK 52+ for cross-platform Android build",
                "Bundled JSON content for Hanuman Chalisa (40 verses), Bhagavad Gita (18 chapters, 700 verses), and 5+ Aartis",
                "expo-av for streaming audio from public domain sources (Ramcharitmanas katha, Mahabharat parvas)",
                "expo-sqlite for local bookmarks, favorites, reading progress, and daily sadhana streak tracking",
                "react-i18next for 5-language support (Hindi, English, Sanskrit, Tamil, Telugu)",
                "Bottom-tab navigation with Home, Library, Player, and Settings screens"
            ],
            decisions: [
                "No backend — all data on-device for privacy and offline capability",
                "JSON-bundled texts over API fetching — keeps APK small (~15MB) and works without internet",
                "Audio streaming over bundling — keeps APK size down, leverages free public domain recordings",
                "AdMob banners only on Home/Library — never during audio playback or verse reading",
                "Devanagari-first typography with Noto Sans Devanagari in saffron color for authentic feel"
            ],
            currentStatus: "Design spec and implementation plan complete. Core screens designed: Home, Library/Collection, Verse Reader, Audio Player, Settings. Content architecture finalized.",
            roadmap: [
                "Complete React Native scaffold with Expo SDK 52+",
                "Bundle Hanuman Chalisa and Bhagavad Gita Chapter 1 JSON content",
                "Implement Verse Reader screen with Hindi/English toggle",
                "Add audio streaming with expo-av for Ramcharitmanas",
                "Daily sadhana tracker with streak counter",
                "Play Store release"
            ],
            improvements: [
                "Add offline audio downloads for devotees without reliable internet",
                "Consider iOS build once Android is validated",
                "Add push notification reminders for morning verse and evening aarti"
            ]
        }
    },
    {
        slug: "synflow",
        name: "SynFlow — Enterprise Intelligence Platform",
        problem: "Private deal networks rely on manual introductions and spreadsheets. Matching the right profile to the right deal is slow, subjective, and misses opportunities.",
        solves: "Full-stack intelligence platform that matches deals to profiles using rule-based scoring across industry, expertise, and geography — with AI-powered profile extraction from LinkedIn and website text.",
        techStack: ["Spring Boot 3.4", "Java 21", "Next.js 14", "TypeScript", "PostgreSQL 16", "Redis 7", "OpenAI GPT-4o", "Tailwind CSS", "D3.js"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/synflow",
        aiApproach: "GPT-4o extracts structured profiles from unstructured LinkedIn/website text. Rule-based scoring algorithm matches deals to profiles by industry, expertise, and geography. AES-256 encryption for sensitive fields.",
        image: "/images/projects/synflow.png",
        details: {
            businessImpact: "Deal networks lose millions in missed connections because matching is manual. SynFlow automates profile-to-deal matching with scoring algorithms, reducing time-to-introduction from days to seconds.",
            approach: [
                "Spring Boot 3.4 + Java 21 REST API with JWT authentication and Spring Security",
                "Next.js 14 App Router frontend with TypeScript, React Query, and React Hook Form",
                "PostgreSQL 16 for relational data with Flyway migrations",
                "Redis 7 for session caching and rate limiting",
                "OpenAI GPT-4o integration for AI-powered profile generation from raw text",
                "D3.js and Recharts for dashboard visualizations and analytics",
                "AES-256 encryption for sensitive profile and deal data"
            ],
            decisions: [
                "Rule-based scoring over pure ML — explainable matches matter more than black-box predictions in deal networks",
                "REAL and SHADOW profile types — supports both verified and anonymous introductions",
                "Next.js 14 over SPA — better SEO for public-facing profile pages, server components for performance",
                "AES-256 field-level encryption — sensitive deal data encrypted at rest, not just in transit"
            ],
            currentStatus: "Full-stack application functional. Profile management, deal tracking, intelligence matching, AI profile generator, dashboard, and admin panel all working.",
            roadmap: [
                "Add real-time notifications for new deal matches",
                "Implement graph-based relationship mapping between profiles",
                "Add deal pipeline analytics with conversion tracking"
            ],
            improvements: [
                "Could add vector search for semantic profile matching",
                "Consider adding email digest for weekly match summaries"
            ]
        }
    },
    {
        slug: "finbaby",
        name: "FinBaby (Jama) — Personal Finance Tracker",
        problem: "Indian middle-class families track expenses across UPI apps, bank statements, and paper notebooks. No single tool auto-imports bank SMS, categorizes spending, and provides actionable savings advice — without cloud dependency.",
        solves: "Android app that reads bank SMS messages, auto-categorizes transactions, provides 50/30/20 budgeting, smart saving tips, and beautiful reports — all stored locally on the device.",
        techStack: ["Kotlin", "Jetpack Compose", "Material 3", "Room", "Hilt", "WorkManager", "Vico Charts", "DataStore"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/finbaby",
        aiApproach: "Rule-based SMS parser with bank sender mapping for 50+ Indian banks. Keyword-based category auto-suggestion (e.g., 'Swiggy' → Food). Smart tips engine analyzes spending patterns to generate personalized saving suggestions.",
        image: "/images/projects/finbaby.png",
        details: {
            businessImpact: "Indians transact heavily via UPI but track expenses manually if at all. FinBaby auto-imports bank SMS, removing the biggest friction — data entry. 50/30/20 budgeting makes financial planning accessible to first-time earners.",
            approach: [
                "Kotlin + Jetpack Compose with Material 3 for modern Android UI",
                "Room database for local SQLite storage of all transactions",
                "Hilt for dependency injection across the entire app",
                "SMS reader with bank sender mapping for 50+ Indian banks (SBI, HDFC, ICICI, etc.)",
                "WorkManager for background tasks — daily reminders, recurring transactions, budget alerts",
                "Vico charts library for donut charts, daily bar charts, and monthly trend visualizations",
                "DataStore Preferences for settings and user preferences"
            ],
            decisions: [
                "Fully offline — no cloud, no sign-up, no bank linking. Privacy is non-negotiable",
                "SMS auto-import over manual entry — solves the biggest adoption killer (data entry fatigue)",
                "50/30/20 budgeting over complex categories — simplicity drives adoption for first-time budgeters",
                "JSON backup/restore over cloud sync — users own their data completely",
                "Biometric lock — finance data is sensitive, security without friction"
            ],
            currentStatus: "Core app functional — SMS auto-import, manual entry, budgeting, reports, smart tips, search, CSV export, backup/restore, biometric lock, and daily reminders all implemented.",
            roadmap: [
                "Add recurring transaction templates for rent, EMIs, subscriptions",
                "Implement investment tracking (mutual funds, FDs, PPF)",
                "Add family mode with shared budgets between partners"
            ],
            improvements: [
                "Could add ML-based category prediction as SMS patterns grow",
                "Consider adding UPI transaction parsing from notification access"
            ]
        }
    },
    {
        slug: "retailos",
        name: "RetailOS — Multi-Tenant Retail SaaS",
        problem: "Indian kirana stores and small retailers use paper registers or basic billing software with no inventory tracking, no GST compliance, and no offline support. Enterprise POS systems are too expensive and complex.",
        solves: "India-first multi-tenant retail SaaS platform with billing, inventory, GST invoicing, khata (credit ledger), offline sync, and analytics — all in one platform with complete tenant isolation.",
        techStack: ["Spring Boot 3.4.3", "Java 21", "PostgreSQL 16", "Redis 7", "MinIO", "Flyway", "Docker"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/retailos",
        aiApproach: "No AI — pure domain-driven architecture. 12-module Maven monorepo with tenant isolation at every layer. Offline sync with conflict resolution for unreliable internet scenarios common in Tier 2/3 India.",
        image: "/images/projects/retailos.png",
        details: {
            businessImpact: "India's retail sector is 90% unorganized. Small retailers need affordable, GST-compliant software that works offline. RetailOS delivers enterprise features at SME pricing with multi-tenant architecture enabling infinite scale.",
            approach: [
                "Spring Boot 3.4.3 + Java 21 with Maven multi-module architecture (12 modules)",
                "PostgreSQL 16 with row-level tenant isolation and Flyway migrations",
                "Redis 7 for session management, caching, and rate limiting",
                "MinIO (S3-compatible) for file storage — product images, invoices, KYC documents",
                "Dedicated modules: auth, tenant, KYC, inventory, billing, invoicing, khata, file, sync, analytics, admin, audit",
                "Offline sync module with queue-based conflict resolution",
                "DPDP consent management in KYC module for regulatory compliance"
            ],
            decisions: [
                "Multi-module monorepo over microservices — faster development, simpler deployment for early stage",
                "Row-level tenant isolation over schema-per-tenant — scales to thousands of tenants without DB overhead",
                "MinIO over AWS S3 — self-hosted for cost control, S3-compatible for future migration",
                "Khata module as first-class citizen — credit ledger is how 70% of Indian retail actually works",
                "Offline sync with conflict resolution — internet is unreliable in target markets"
            ],
            currentStatus: "Full platform scaffold with 12 modules. Auth with JWT + OTP, tenant management, inventory CRUD, billing/POS, GST invoice generation, khata ledger, file uploads, and audit trail all functional.",
            roadmap: [
                "Add barcode scanning for inventory management",
                "Implement multi-warehouse stock transfers",
                "Add WhatsApp invoice sharing for customers",
                "Build React Native mobile POS app"
            ],
            improvements: [
                "Could add AI-powered demand forecasting for inventory optimization",
                "Consider adding payment gateway integration for digital payments"
            ]
        }
    },
    {
        slug: "triphive",
        name: "TripHive — Offline-First Collaborative Trip Planner",
        problem: "Group trip planning is fragmented across WhatsApp, Google Docs, Maps, Splitwise, and email. Nothing talks to each other, and every app breaks the moment you lose WiFi — exactly when you need it most.",
        solves: "One offline-first app that combines collaborative itineraries, interactive offline maps, expense splitting, group polls, and packing lists — anyone can join with just a link, no login required.",
        techStack: ["React Native", "Expo", "TypeScript", "WatermelonDB", "PowerSync", "MapLibre GL", "Supabase", "Firebase"],
        status: "active",
        aiApproach: "No AI — architecture-first approach. WatermelonDB for offline-first local storage with PowerSync for transparent background syncing. MapLibre GL + Protomaps for downloadable offline map tiles.",
        image: "/images/projects/triphive.png",
        details: {
            businessImpact: "Group travelers currently juggle 5+ tools. TripHive replaces all of them with one offline-capable app. The 'join with a link, no login' model removes the biggest adoption barrier for group apps.",
            approach: [
                "React Native + Expo + TypeScript for cross-platform mobile development",
                "WatermelonDB for offline-first local database with lazy loading",
                "PowerSync for delta-based background sync when connectivity returns",
                "MapLibre GL + Protomaps for interactive maps with downloadable offline tiles",
                "Supabase for backend (Auth, Postgres, Realtime, Storage) — zero custom backend code",
                "Firebase Cloud Messaging for push notifications",
                "RevenueCat for freemium subscription management"
            ],
            decisions: [
                "Offline-first over online-first — trips happen in airports, foreign countries, and rural areas with no WiFi",
                "WatermelonDB over Realm — better React Native integration, true lazy loading, SQLite under the hood",
                "Supabase over custom backend — ship faster, Realtime subscriptions built-in, generous free tier",
                "No login to join — share a link, friends see the plan instantly. Removes the #1 group adoption killer",
                "MapLibre over Google Maps — offline tile downloads, no per-request API costs"
            ],
            currentStatus: "Complete product spec with 10 specification documents, 25 UI screen designs, technical architecture, monetization strategy, and week-by-week development roadmap finalized.",
            roadmap: [
                "Implement core React Native scaffold with Expo",
                "Build offline-first itinerary CRUD with WatermelonDB",
                "Add MapLibre integration with offline tile downloads",
                "Implement expense splitting with real-time sync",
                "Launch beta on Google Play Store"
            ],
            improvements: [
                "Could add AI-powered itinerary suggestions based on destination and group preferences",
                "Consider adding flight/hotel price tracking integration"
            ]
        }
    },
    {
        slug: "scamrakshak",
        name: "ScamRakshak — On-Device AI Scam Detector",
        problem: "Indians lose thousands of crores annually to digital scams via WhatsApp, SMS, and social media. Existing solutions require internet, collect user data, or lack Indian language support.",
        solves: "Fully offline Android app that analyzes suspicious messages, screenshots, URLs, and UPI IDs using a 3-tier on-device AI engine — with bilingual explanations in Hindi and English. Zero data collection, zero internet required.",
        techStack: ["Kotlin", "Jetpack Compose", "Material 3", "Hilt", "Room", "ML Kit GenAI (Gemma 4)", "LiteRT", "CameraX"],
        status: "active",
        aiApproach: "3-tier inference engine: Tier 1 — ML Kit GenAI with Gemma 4 on-device LLM for deep analysis. Tier 2 — LiteRT (TFLite successor) for lightweight scam classification. Tier 3 — Rule-based regex engine as universal fallback. All inference runs on-device with zero network calls.",
        image: "/images/projects/scamrakshak.png",
        details: {
            businessImpact: "Digital scams cost Indians ₹1,750+ crore annually. Victims are often non-technical users who can't evaluate suspicious messages. ScamRakshak gives instant risk scores with Hindi explanations — no internet, no data sharing, no technical knowledge required.",
            approach: [
                "Kotlin + Jetpack Compose with Material 3 for modern Android UI",
                "3-tier AI inference: ML Kit Gemma 4 → LiteRT → Rule-based regex (graceful degradation)",
                "Room database for scam pattern storage and scan history",
                "CameraX for screenshot capture and OCR-based text extraction",
                "Hilt for dependency injection across the entire app",
                "Bilingual output (Hindi + English) for every scam analysis",
                "Zero network permissions — the app physically cannot send data anywhere"
            ],
            decisions: [
                "3-tier fallback over single model — ensures every device gets protection regardless of hardware",
                "On-device only over cloud AI — privacy is the core promise, not a feature",
                "Hindi-first over English-only — target users communicate primarily in Hindi and Hinglish",
                "UPI ID analysis included — UPI scams are the fastest-growing fraud vector in India",
                "Zero permissions model — builds trust with privacy-conscious users"
            ],
            currentStatus: "Architecture finalized with 3-tier AI inference engine. Kotlin scaffold with Jetpack Compose, Room, Hilt, and CameraX integration. Rule-based regex engine (Tier 3) operational as universal fallback.",
            roadmap: [
                "Integrate ML Kit GenAI with Gemma 4 for on-device LLM analysis",
                "Add screenshot OCR pipeline with CameraX",
                "Implement URL safety checker with pattern matching",
                "Add UPI ID verification against known scam databases",
                "Launch on Google Play Store"
            ],
            improvements: [
                "Could add community-sourced scam pattern updates via signed JSON bundles",
                "Consider adding regional language support beyond Hindi (Tamil, Telugu, Marathi)"
            ]
        }
    },
    {
        slug: "paisaguard",
        name: "PaisaGuard — Family Budget Survival App",
        problem: "Middle-class families worldwide track expenses inconsistently — UPI apps show transactions but don't enforce budgets. No tool combines expense tracking, grocery budgeting, bill calendars, debt management, and family splitting in one offline app.",
        solves: "Privacy-first, fully offline Android app with 8 financial modules: expense tracking, grocery budget mode, bill calendar, emergency fund tracker, debt snowball, affordability calculator, family expense splitting, and auto-generated monthly reports.",
        techStack: ["Kotlin", "Jetpack Compose", "Material 3", "Room", "Hilt", "WorkManager", "DataStore"],
        status: "active",
        aiApproach: "No AI — rule-based financial engines. Debt snowball algorithm for optimal payoff ordering. Smart category auto-suggestion from keywords. Budget health indicators with color-coded alerts (green/orange/red).",
        image: "/images/projects/paisaguard.png",
        details: {
            businessImpact: "Middle-class families need financial discipline tools, not investment advice. PaisaGuard focuses on the fundamentals — tracking, budgeting, and debt elimination — with a grocery shopping mode that no competitor offers.",
            approach: [
                "Kotlin + Jetpack Compose with Material 3 for modern Android UI",
                "Room database for all financial data — expenses, bills, debts, emergency fund",
                "8 core modules: expense tracking, grocery budget, bill calendar, emergency fund, debt snowball, affordability calculator, family splitting, monthly reports",
                "WorkManager for bill reminders, budget alerts, and monthly report generation",
                "Hilt for dependency injection across all modules",
                "Numpad-style amount input for sub-5-second expense logging",
                "DataStore Preferences for settings and family member profiles"
            ],
            decisions: [
                "Fully offline — no backend, no sign-up, no bank linking. Privacy is non-negotiable",
                "8 modules in one app over separate tools — families need one financial command center",
                "Grocery shopping mode as differentiator — real-time budget tracker with checklist during shopping",
                "Debt snowball over avalanche — psychologically more motivating for target users",
                "Family splitting built-in — 'who spent' toggle on every expense, not a separate Splitwise-like flow"
            ],
            currentStatus: "Complete product specification with 8 user stories, acceptance scenarios, data models, UI design system, and development plan finalized. Core scaffold with Room, Hilt, and Navigation Compose in place.",
            roadmap: [
                "Implement dashboard with monthly balance and quick stats grid",
                "Build expense logging with sub-5-second target",
                "Add grocery shopping mode with live budget bar",
                "Implement bill calendar with reminder notifications",
                "Add debt snowball tracker with payoff timeline",
                "Launch on Google Play Store"
            ],
            improvements: [
                "Could add receipt scanning with on-device OCR for automatic expense entry",
                "Consider adding export to Excel for users who want spreadsheet analysis"
            ]
        }
    },
    {
        slug: "rohitraj-site",
        name: "rohitraj.tech",
        problem: "Engineering work is often invisible. Portfolios show polished results but not the thinking behind them.",
        solves: "A living project directory that documents problems, trade-offs, and architectural decisions in real-time.",
        techStack: ["Next.js 16", "React 19", "TypeScript", "AWS Amplify"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/rohitraj-tech",
        details: {
            businessImpact: "Hiring decisions are made based on visible artifacts. A traditional portfolio shows what you built, but not how you think. This site exposes the engineering process itself.",
            approach: [
                "Next.js 16 with App Router for optimal performance",
                "Minimal design language inspired by documentation sites",
                "GitHub-backed content sourced from actual repositories",
                "Static generation with AWS Amplify deployment"
            ],
            decisions: [
                "Documentation-first aesthetic over flashy portfolio style",
                "Vanilla CSS for full control, minimal dependencies",
                "Content structured as data for easy updates",
                "Focus on AI projects only — no tutorials or clones"
            ],
            currentStatus: "Live at rohitraj.tech with AI projects, Notes, and Repos sections.",
            roadmap: [
                "Add technical blog/notes with MDX",
                "Implement RSS feed",
                "Add search functionality"
            ],
            improvements: [
                "Could add dark mode toggle",
                "Consider adding project demos/recordings"
            ]
        }
    },
    {
        slug: "agent-autopsy",
        name: "Agent Autopsy — Forensic Debugger for Failed AI Agent Runs",
        problem: "Most AI agent failures are silent — the run completes, the status code is green, and the result is still wrong. Observability platforms show you the trace, but never the cause of death.",
        solves: "Paste a dead agent's transcript (JSON, JSONL, or raw logs) and get an instant forensic report that names the failure signature — death loop, error blindness, ghost tool, flatline, or context bloat — plus a local-LLM pathologist's note for deeper root cause. 100% local; nothing leaves your machine.",
        techStack: ["Next.js 16", "TypeScript", "App Router", "Ollama (qwen3:14b)", "Vitest"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/agent-autopsy",
        aiApproach: "Deterministic heuristics fire in under a second to classify five failure signatures — DEATH_LOOP, ERROR_BLINDNESS, GHOST_TOOL, FLATLINE, CONTEXT_BLOAT. When a local Ollama model is running, qwen3:14b adds a pathologist's note with a deeper root-cause read — fully local, no trace ever leaves the machine.",
        image: "/images/projects/agent-autopsy-poster.jpg",
        videoUrl: "/videos/agent-autopsy.mp4",
        details: {
            businessImpact: "Teams ship agents that fail silently and only hear about it from angry users. Agent Autopsy turns an opaque transcript into a one-line cause of death, so engineers stop guessing and start fixing — without shipping private traces to a third-party SaaS.",
            approach: [
                "Next.js 16 App Router app with the forensic engine in lib/autopsy.ts",
                "scan + diagnose API routes: heuristic classifier first, optional LLM pass second",
                "Five explicit failure signatures detected from transcript structure, not vibes",
                "Optional local Ollama (qwen3:14b) pathologist's note for root cause",
                "6 Vitest tests covering the signature classifier"
            ],
            decisions: [
                "Heuristics-first for an instant verdict — the LLM is an optional deepening, not the critical path",
                "Local LLM over cloud — agent traces are sensitive and stay on the machine",
                "Five named signatures over a black-box score — engineers want a cause they can act on",
                "Zero runtime dependencies in the engine — rebuilt from a v1 single-file prototype with no shortcuts"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/agent-autopsy. Heuristic verdicts plus optional local qwen3:14b diagnosis working; 6 Vitest tests passing. The 15-second demo diagnoses the app's own sample corpse on camera.",
            roadmap: [
                "Add more failure signatures (silent truncation, tool-arg drift)",
                "Framework adapters to import LangChain / CrewAI transcripts directly",
                "Shareable report links for team triage"
            ],
            improvements: [
                "A hosted demo with a bundled small model so no local setup is needed",
                "Batch autopsy mode to run inside CI on every failed agent run"
            ]
        }
    },
    {
        slug: "tinyvoice",
        name: "tinyvoice — Fine-Tune a Model in Your Own Voice in an Afternoon",
        problem: "Training your own language model sounds like a PhD job that needs a GPU cluster, so most developers never try. The tooling looks intimidating from the outside.",
        solves: "A 0.5B-parameter model fine-tuned to write in my voice — trained in about three minutes on a laptop, on 28 of my own posts, with no GPU and no cloud. A side-by-side web UI streams the stock model against the tuned one so you can see exactly what fine-tuning changes.",
        techStack: ["MLX", "Qwen2.5-0.5B (4-bit LoRA)", "Python", "FastAPI", "Server-Sent Events"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/tinyvoice",
        aiApproach: "MLX LoRA fine-tune of Qwen2.5-0.5B-Instruct-4bit on 26 train / 2 valid chat pairs built from my own published posts — 400 steps, roughly three minutes on Apple silicon. FastAPI serves both the stock and tuned models over SSE. The honest lesson baked into the demo: the model learns style, not facts — voice transfers in an afternoon, truth does not.",
        image: "/images/projects/tinyvoice-poster.jpg",
        videoUrl: "/videos/tinyvoice.mp4",
        details: {
            businessImpact: "Fine-tuning is treated as inaccessible, so teams default to prompt-stuffing forever. tinyvoice is a working proof that small-model LoRA on-device is minutes and a laptop — a replicable recipe for anyone who wants a model in their own style.",
            approach: [
                "Dataset script pairs each published post's one-line brief with its final copy (26 train / 2 valid)",
                "MLX LoRA on Qwen2.5-0.5B-Instruct-4bit, 400 steps, ~3 minutes on Apple silicon",
                "FastAPI streams stock and tuned models side by side over Server-Sent Events",
                "Single-HTML compare UI — same topic in, two voices out",
                "Fixed an MLX streaming bug: inference state is thread-local, so all MLX work runs on one thread"
            ],
            decisions: [
                "0.5B 4-bit over a large model — the whole point is that it runs on a laptop",
                "LoRA over full fine-tune — minutes, not hours, and a tiny adapter to ship",
                "On-device MLX over cloud training — no keys, no bill, no data leaving the Mac",
                "Side-by-side UI over a metrics table — the difference should be visible, not described"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/tinyvoice. The trained adapter is committed so the repo runs as-is; the stock-vs-tuned duel is verified live in the browser in the demo.",
            roadmap: [
                "Swap in a larger base model to test whether knowledge (not just style) transfers",
                "Feed the full post corpus as it grows",
                "One-command train-and-serve script"
            ],
            improvements: [
                "Dataset de-duplication and augmentation for a cleaner signal",
                "A quantitative voice-match score to measure the tuning objectively"
            ]
        }
    },
    {
        slug: "snap3d",
        name: "snap3d — One Photo In, an Editable 3D Model Out",
        problem: "A photo shows you one side of an object; the other five sides are a guess. Turning a single 2D image into a usable 3D model normally needs a photogrammetry rig or hours of manual modeling.",
        solves: "Drop one photo and Claude Fable 5 infers depth and hidden geometry, then rebuilds the object as a parametric scene of named parts rendered live in Three.js. Because every part is named, you keep editing in plain English — 'make the wheels huge', 'paint it neon green' — and export to .obj for Blender or Unity.",
        techStack: ["Claude Fable 5", "Three.js", "Node.js (zero-dep stdlib)", "JavaScript"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/snap3d",
        aiApproach: "Claude Fable 5 is treated as a data engine: from a single photo it emits a strict-JSON scene of ~25 named primitives. Three.js draws them; plain-English remix requests go back to Fable 5, which re-edits only the named parts you mention. A ~100-line zero-dependency Node stdlib server bridges to the API or a local claude CLI.",
        image: "/images/projects/snap3d-poster.jpg",
        videoUrl: "/videos/snap3d.mp4",
        details: {
            businessImpact: "Photo-to-3D tools stop at a static mesh. snap3d's semantic, named-part scene lets non-experts edit 3D with words instead of a modeling suite — lowering the skill floor for prototyping, product mockups, and asset creation.",
            approach: [
                "Single photo → Claude Fable 5 → strict-JSON scene of named primitives",
                "Three.js viewer with per-part scale and color sliders",
                "Plain-English remix re-edits only the named parts you reference",
                "One-click .obj export for Blender, Unity, or any render engine",
                "~100-line zero-dependency Node stdlib server; API key or local claude CLI"
            ],
            decisions: [
                "Treat model output as data — a strict JSON contract makes 3D just another API response",
                "Semantic named parts over an opaque mesh — that is what makes word-based editing possible",
                "Zero npm dependencies — the server is Node stdlib only",
                "Three.js for live in-browser rendering over a heavy engine"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/snap3d. Verified real run: sample photo → 25 named parts; remix 'bigger wheels + neon green' applied live and re-rendered in the demo.",
            roadmap: [
                "Texture inference alongside geometry",
                "More primitive types for organic shapes",
                "glTF export and batch photo → scene"
            ],
            improvements: [
                "Cache Fable 5 scenes to make remix instant",
                "Confidence hints on inferred hidden geometry so users know what is guessed"
            ]
        }
    },
    {
        slug: "agentic-os",
        name: "Agentic OS — Force-Directed Map of a 387-Skill Claude Code Setup",
        problem: "An agent setup grows one plugin at a time until it has hundreds of skills, and nobody can see what it actually contains. There is no view of which skills overlap, which clusters are overweight, or which ones were hand-written versus pulled in by a marketplace plugin.",
        solves: "Renders every skill in a Claude Code install as a star in a searchable force-directed galaxy — 387 skills across 34 clusters, 67 hand-made and 320 from plugins. Search, filter by cluster, and click any node to read its front-matter. Hand-made skills wear a white ring so authored capability is visually separable from installed capability.",
        techStack: ["Next.js 16", "React 19", "TypeScript", "react-force-graph-2d", "framer-motion", "Tailwind CSS 4"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/agentic-os",
        aiApproach: "A generator script walks the local personal skills directory and every installed plugin skill, reads each SKILL.md front-matter, and writes a committed snapshot at data/skills.json. The /api/graph route reshapes that snapshot into nodes, links, categories, and stats at build time — so a deployed build ships the map without ever needing to read a machine-local skills directory.",
        image: "/images/projects/agentic-os-poster.jpg",
        videoUrl: "/videos/agentic-os.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "Teams adopting agent tooling install skills and plugins faster than they can audit them, then wonder why the agent picks the wrong one. Agentic OS turns an invisible capability surface into a picture you can point at in a review — what exists, what clusters together, and what nobody wrote on purpose.",
            approach: [
                "Next.js 16 App Router client shell with search, cluster filters, detail panel, and colour map",
                "Canvas force simulation via react-force-graph-2d handling physics, render, and camera",
                "generate-skills.mjs walks personal and plugin skills, parses SKILL.md front-matter, writes data/skills.json",
                "api/graph route reshapes the snapshot into nodes plus links at build time",
                "framer-motion for panel and overlay motion"
            ],
            decisions: [
                "Commit the snapshot rather than scan at runtime — a deployed build cannot read a local skills directory",
                "Canvas over SVG — 387 nodes with live physics would stall a DOM-based renderer",
                "White ring for hand-made skills — the authored-versus-installed split is the one distinction worth encoding visually",
                "Cluster colours over per-skill colours so 34 categories stay readable at a glance"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/agentic-os. Full galaxy renders from a committed 387-skill snapshot with search, cluster filtering, and a per-skill detail panel; npm run skills rebuilds the snapshot from any machine.",
            roadmap: [
                "Diff mode to compare two skill snapshots over time",
                "Overlap detection to flag skills with near-identical trigger descriptions",
                "Usage weighting so frequently-invoked skills render larger"
            ],
            improvements: [
                "A hosted demo seeded with a public sample snapshot so visitors need no local setup",
                "Export the current view as a shareable static image for reviews and posts"
            ]
        }
    },
    {
        slug: "claude-autodev",
        name: "claude-autodev — Autonomous 8-Stage Dev Pipeline for Claude Code",
        problem: "Agentic coding tools stop at a diff. Nothing forces a spec to exist before implementation, nothing blocks a run that never wrote a test, and nothing catches a stage that quietly produced no artifact — so failures surface as a plausible-looking PR nobody can trust.",
        solves: "Give it a one-line requirement and a git repo. Eight gated stages — spec, analyze, implement, verify, push, review, test, deploy — each a fresh headless Claude Code session that only advances once it produces the artifact the next stage needs. Work happens in an isolated git worktree; you watch on a live mission-control dashboard and get a PR. Point the daemon at an issue tracker and issues become merged, deployed code.",
        techStack: ["Node.js 22+", "ESM", "SQLite", "HTTP + Server-Sent Events", "git worktrees", "Claude Code CLI", "gh CLI", "node:test"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/claude-autodev",
        aiApproach: "Every stage is a separate headless claude -p session with no shared context — the reviewer has never seen the plan, the builder has never seen the acceptance criteria. Advancement is gated on a real artifact check, not a model self-report: spec files non-empty, every checklist box ticked, verify.json PASS, review.json APPROVE, test command exit 0. A runner retries a failed stage a bounded number of times, then parks the run BLOCKED with a written diagnosis. A SQLite registry plus per-run events.jsonl is the source of truth; the dashboard reads both, and run correctness never depends on the server being up.",
        image: "/images/projects/claude-autodev-poster.jpg",
        videoUrl: "/videos/claude-autodev.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "The gap between an AI-written diff and shippable software is spec, review, and test discipline — exactly the parts teams skip when the agent looks confident. claude-autodev makes those parts mandatory gates, so an unattended run either produces a reviewed, tested PR or stops with a diagnosis instead of a false green.",
            approach: [
                "Eight stages, each a fresh headless claude -p session with zero shared context between them",
                "Artifact gates per stage — no artifact, no advance",
                "Isolated git worktree per run so concurrent runs never collide",
                "SQLite registry plus per-run events.jsonl as source of truth; HTTP+SSE server drives the dashboard read-only",
                "Bounded retries with self-fix, then park BLOCKED with a written diagnosis",
                "Daemon mode turns tracker issues into runs and issue labels into the queue"
            ],
            decisions: [
                "No shared context between stages — an independent reviewer is worth more than a cheaper one",
                "Gate on artifacts, not on the model saying it finished",
                "Worktree isolation over branch switching so a stuck run never blocks the main checkout",
                "Server is a viewer, not a dependency — the pipeline completes with the dashboard closed",
                "Deploy stage is opt-in; merging and shipping should never be an accident"
            ],
            currentStatus: "Public and open source (MIT) at v0.2.0. Test suite runs on Linux, macOS, and Windows across Node 22 and 24 in CI on every push. Ships autodev selftest, which drives a fixture repo through all seven stages in about 30 seconds without spending model quota, and autodev doctor for preflight checks with a fix per failure.",
            roadmap: [
                "Multi-repo runs so one requirement can span services",
                "Pluggable review policies per repository",
                "Cost and duration budgets per run with hard stop"
            ],
            improvements: [
                "Hosted dashboard mode for teams watching several runs at once",
                "Richer holdout scenario authoring so the test gate is harder to game"
            ]
        }
    },
    {
        slug: "kisansathi",
        name: "KisanSathi — Six AI Farm Experts, Keyless and Local",
        problem: "Farmer-facing AI tools die at the API-key step, answer in English, and hand back generic advice with no live numbers behind it. A smallholder asking when to sell or how to treat yellowing wheat leaves gets a paragraph, not a decision.",
        solves: "Ask one question in Hindi, Hinglish, English, or a regional language — typed or spoken. A router agent picks the right specialist from six, pulls live data its domain needs — real 7-day weather, real mandi prices — and streams back a short, practical answer in the farmer's own language, with a सुनें button that reads it aloud. Runs with zero API keys on a local model.",
        techStack: ["FastAPI", "Python 3.11", "Pydantic 2", "httpx", "Next.js 16", "React 19", "Tailwind CSS 4", "Ollama (qwen3:14b)", "Web Speech API", "Open-Meteo", "Agmarknet via data.gov.in", "pytest"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/kisansathi",
        aiApproach: "One fast router LLM call classifies the question into agent, language, place, and commodity. The chosen specialist — crop advisor, pest and disease, weather and irrigation, mandi price analyst, govt schemes, or soil health — fetches the live data its domain needs and streams a grounded answer token by token. Keyless by default: Ollama locally so nothing leaves the machine, Open-Meteo for forecasts, and the data.gov.in public sample key for daily mandi prices, with an optional Anthropic provider for a hosted model. Mandi lookups degrade gracefully from state plus commodity, to commodity, to latest records. Implements the AgroAskAI multi-agent framework as working open source. Voice runs the same keyless way: browser SpeechRecognition (hi-IN) turns speech into the question, and speechSynthesis reads the answer back, picking a Hindi voice for Devanagari answers — no speech API account, no audio pipeline to host.",
        image: "/images/projects/kisansathi-poster.jpg",
        videoUrl: "/videos/kisansathi.mp4",
        updated: "2026-08-30",
        details: {
            businessImpact: "India has more smallholder farmers than any advisory service can staff, and the ones who need advice most are furthest from a key, a card, or reliable bandwidth. A keyless multi-agent assistant that answers in Hindi with today's mandi price is deployable on a village kiosk, not just a demo laptop.",
            approach: [
                "Router agent classifies agent, language, place, and commodity in a single fast LLM call",
                "Six specialist agents defined declaratively in a registry — key, name, emoji, system prompt, optional tools",
                "Live tools per domain: Open-Meteo 7-day forecast, Agmarknet daily prices via data.gov.in",
                "FastAPI backend streams answers; Next.js 16 UI shows the pipeline live — expert picked, language detected, tokens arriving",
                "Adding an agent is one registry entry; router, API, and UI pick it up automatically",
                "Voice in, voice out: mic button transcribes hi-IN speech and auto-submits; every answer gets a read-aloud button, chunked by sentence so long answers don't cut off",
                "pytest with async mode for the router and tool layer"
            ],
            decisions: [
                "Keyless by default — most farmer-facing tools die at the API-key step, so that step had to go",
                "Local Ollama over a hosted model so answers work offline-ish and no farmer data leaves the machine",
                "Router plus specialists over one big prompt — domain tools only load where they belong",
                "Answer in the language asked, not English with a translation toggle",
                "State honest limits in the UI: LLM advice can be wrong, and pesticide doses or big selling calls should be confirmed at the local Krishi Vigyan Kendra"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/kisansathi. All six agents live with the router, streaming UI, voice input and read-aloud answers, and both live data tools working keyless; pytest suite green. Built to be forked — translate it, add crops, add agents, put it on a village kiosk.",
            roadmap: [
                                "More crops and region-specific pest libraries",
                "Offline mandi price cache for intermittent connectivity"
            ],
            improvements: [
                "A hosted instance with a small bundled model so no Ollama install is required",
                "Wider mandi coverage by falling back across neighbouring districts"
            ]
        }
    },
    {
        slug: "marginchef",
        name: "MarginChef — AI Agent That Finds a Restaurant's Margin Leaks",
        problem: "Restaurants run on 3-5% net margins while food costs are up roughly 35% since 2019, and most owners never see per-dish economics. The leaks — a bestseller that bleeds, a price that never moved when its ingredients did — hide inside a POS export nobody reads.",
        solves: "Point it at four CSVs exported from any POS or supplier sheet. It costs every plate against live ingredient prices, runs five leak detectors, sorts the menu into Stars, Plowhorses, Puzzles, and Dogs, and returns concrete reprice suggestions plus a five-move action plan ranked by money at stake. Keyless — runs on a local model, and the numbers never leave the machine.",
        techStack: ["Python 3.10+", "rich", "Ollama (qwen3:14b)", "pytest", "CLI"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/marginchef",
        aiApproach: "Deterministic economics first, LLM second. Five rule-based detectors quantify each leak in money terms — high food cost, price lag where plate cost rose at least 5% in 30 days with no menu move, bleeding bestseller, dead weight, and kitchen waste — and each dish keeps only its biggest leak so overlapping detectors never double-count the monthly total. A local Ollama model then writes the ranked action plan on top of those numbers; if Ollama is down it silently falls back to rule-based advice, so the agent always answers.",
        image: "/images/projects/marginchef-poster.jpg",
        videoUrl: "/videos/marginchef.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "An independent restaurant losing two points of margin to unrepriced dishes is losing real money every month it goes unnoticed. MarginChef converts a POS export into a ranked list of fixes with a rupee or dollar figure attached to each — the difference between knowing food costs are up and knowing which three dishes to reprice on Monday.",
            approach: [
                "Plate costing: recipe times current ingredient prices gives true cost per dish",
                "Five leak detectors, each with an explicit monthly impact formula in leaks.py",
                "Menu engineering quadrants from popularity against margin",
                "Reprice suggestions snapped to .49 or .99 price points, capped at +15%, with projected monthly gain",
                "Local LLM writes a five-move action plan ranked by money at stake, with rule-based fallback",
                "CLI with analyze, report (shareable HTML), prices, and ask subcommands"
            ],
            decisions: [
                "One leak per dish — overlapping detectors share a root cause, so the monthly total stays honest",
                "Keyless local LLM over a cloud API; a restaurant's cost sheet is not third-party data",
                "Rule-based fallback so a missing Ollama degrades the answer instead of breaking the tool",
                "Cap reprices at +15% and snap to familiar price points — advice a kitchen will actually run",
                "Plain CSVs as the interface so any POS export works without an integration"
            ],
            currentStatus: "Public and open source (MIT) at v0.2.0, installable with pip install -e . and runnable against the bundled sample_data in one command. All five detectors, menu quadrants, reprice suggestions, HTML report, and the ask subcommand ship working; pytest suite green.",
            roadmap: [
                "Direct POS connectors so the CSV step disappears",
                "Multi-period trend view to catch slow cost drift",
                "Supplier substitution suggestions for the worst-offending ingredients"
            ],
            improvements: [
                "Currency and tax handling for multi-region kitchens",
                "A small web UI for owners who will not open a terminal"
            ]
        }
    },
    {
        slug: "quorum",
        name: "Quorum — Deep-Research Agent Swarm with a Shared GraphRAG Brain",
        problem: "Most AI research tools are one model in a loop. It cannot hold a multi-hop question together, it has no second opinion, and vanilla vector RAG fumbles exactly the questions that need relationships rather than similar-looking paragraphs.",
        solves: "Ask a hard question and a swarm answers it together — a Planner splits it, several Researchers work in parallel, a Critic hunts gaps, a Synthesizer writes the grounded answer. They coordinate through one shared knowledge graph they build live, and the UI shows agents lighting up and the graph blooming node by node.",
        techStack: ["Python 3.12", "FastAPI", "Server-Sent Events", "NetworkX", "fastembed", "React", "Vite", "react-force-graph-2d", "zustand", "framer-motion", "Anthropic API", "Ollama (qwen3:14b)"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/quorum",
        aiApproach: "Agents coordinate through a GraphRAG store rather than by passing blobs of text. Merge-on-write normalizes entity names so two researchers who discover the same thing converge on one node. Retrieval is graph-aware — embed the query, take the top-k nodes, expand to their neighbours, hand the subgraph to the Synthesizer — which is what lets the swarm answer multi-hop questions. Every agent action is an event streamed over SSE, so the interface is a live view of the run. Runs deterministic with zero config for demos, or against Anthropic or a local Ollama model for real research.",
        image: "/images/projects/quorum-poster.jpg",
        videoUrl: "/videos/quorum.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "Research questions that matter are multi-hop, and a single-model loop answers them confidently and wrongly. A swarm with an explicit Critic and a shared graph makes the reasoning inspectable — you can see which entity connected to which, and which agent found it.",
            approach: [
                "Orchestrator emits events; Planner, N Researchers, Critic, and Synthesizer run against a shared graph",
                "GraphRAG store on NetworkX plus embeddings, with merge-on-write entity normalization",
                "Graph-aware retrieval: top-k nodes, neighbour expansion, subgraph to the Synthesizer",
                "FastAPI backend streams every agent action over SSE",
                "React and Vite frontend renders the live force graph and the agent roster",
                "Deterministic demo mode runs with zero config and no keys"
            ],
            decisions: [
                "Shared graph over message passing — the graph is the coordination substrate, not a side effect",
                "Merge-on-write so duplicate discoveries converge instead of forking the answer",
                "An explicit Critic agent, because a swarm without one just agrees with itself faster",
                "Stream everything as events so the UI is a view of the run, not a summary of it",
                "Deterministic demo mode so the project can be tried and filmed without an API key"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/quorum. Full swarm, GraphRAG store, and live streaming UI working; runs zero-config in deterministic demo mode and against Anthropic or local Ollama for real research. Design notes in docs/DESIGN.md.",
            roadmap: [
                "Persist graphs across sessions so research compounds",
                "Source-level provenance on every edge",
                "Configurable swarm shape — researcher count and critic strictness per question"
            ],
            improvements: [
                "Better embeddings by default rather than as an optional install",
                "Export the built graph to standard formats for downstream tools"
            ]
        }
    },
    {
        slug: "regexforge",
        name: "RegexForge — Plain English to a Regex You Can Trust",
        problem: "Regex is not hard because the syntax is exotic. It is hard because you can never be sure the pattern does what you think — research on regex use names trust, test coverage, and cross-language portability as the real pains. Most AI regex generators print a pattern and wish you luck.",
        solves: "Describe the pattern in plain English and get a regex plus the evidence to trust it: live match highlighting as you type, auto-generated positive and negative test cases that pass or fail against the pattern in real time, a token-by-token breakdown, and one-click export to six languages. Runs fully local on your own LLM.",
        techStack: ["Next.js", "React", "framer-motion", "Ollama (qwen2.5:14b)", "OpenAI-compatible API"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/regexforge",
        aiApproach: "The model drafts the pattern; the app proves it. Auto-generated positive and negative examples run live against the candidate regex, so a too-loose pattern is caught the moment it matches something it should not — the LLM is never the last word. Talks to any OpenAI-compatible chat endpoint, defaulting to a local Ollama model so no text and no API key leave the machine, with hosted providers a pure env-var swap.",
        image: "/images/projects/regexforge-poster.jpg",
        videoUrl: "/videos/regexforge.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "A wrong regex in a validator or a log parser fails quietly and in production. Shipping the pattern together with generated counter-examples turns a guess into something a reviewer can check in seconds.",
            approach: [
                "Plain-English prompt to candidate pattern via any OpenAI-compatible endpoint",
                "Live tester highlights matches in pasted text as you type",
                "Auto-generated positive and negative test cases evaluated continuously against the pattern",
                "Token-by-token breakdown explaining every part of the expression",
                "Export to JavaScript, Python, Go, Java, PHP, and Rust",
                "Local-first config via Ollama; hosted providers are an env-var change"
            ],
            decisions: [
                "Prove, do not assert — generated counter-examples are the product, the pattern is the easy part",
                "Negative cases as first-class as positive ones, since too-loose regexes are the common failure",
                "Local LLM by default; sample text in a regex tester is often production data",
                "Six-language export because half of regex users worry a pattern behaves differently across runtimes",
                "OpenAI-compatible interface rather than a provider SDK, so any endpoint works unchanged"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/regexforge. Generation, live tester, auto test cases, token breakdown, and six-language export all working; runs free and fully local against Ollama.",
            roadmap: [
                "Per-flavour validation so an exported pattern is checked against that language's engine",
                "Catastrophic-backtracking warnings on risky patterns",
                "Save and share a forged pattern with its test suite"
            ],
            improvements: [
                "A hosted try-it instance for people without a local model",
                "Import an existing regex and generate tests for it rather than starting from English"
            ]
        }
    },
    {
        slug: "skillet",
        name: "Skillet — Turn Any Docs Page Into an Installable Claude Code Skill",
        problem: "Agent skills are the fastest way to teach a coding agent a new tool, but writing a good SKILL.md by hand means reading the documentation yourself and distilling it into trigger phrases, usage, recipes, and gotchas. Most people never get past the reading.",
        solves: "Paste a docs URL or drop a PDF and get a complete, ready-to-install SKILL.md streamed live — frontmatter with trigger phrases, core usage, recipes, and gotchas. Download it into the skills directory and the agent knows the tool. Runs entirely on a local model: no API keys, no cloud, no cost.",
        techStack: ["Next.js", "React", "Ollama (qwen3:14b)", "Python", "pypdf", "uv"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/skillet",
        aiApproach: "Server-side fetch strips a docs page to readable text; PDFs route through a single-file Python backend using pypdf for extraction. A local Ollama model then writes the full SKILL.md — frontmatter, trigger phrases, usage, recipes, gotchas — streamed token by token to the page. Any Ollama chat model works: smaller models cook faster, bigger ones write better skills. Without the optional PDF backend, URL mode still works and PDF requests fail with a clear message rather than silently.",
        image: "/images/projects/skillet-poster.jpg",
        videoUrl: "/videos/skillet.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "Every tool a team adopts is a skill nobody has time to write, so agents keep using tools badly. Skillet makes the distillation step a paste-and-download, which is the difference between a team having three good skills and thirty.",
            approach: [
                "Server-side fetch and readability strip for docs URLs",
                "Optional one-file Python backend on port 4655 extracts PDFs via pypdf, run with uv",
                "Local Ollama model writes the complete SKILL.md, streamed live to the page",
                "Output lands as a downloadable file ready to drop into the skills directory",
                "Model, Ollama URL, and PDF backend all configurable by env var"
            ],
            decisions: [
                "Local model over a hosted one — no key, no cost, no docs leaving the machine",
                "PDF support as an optional backend so the common URL path needs no Python at all",
                "Stream the skill as it is written; watching it form is how you catch a bad one early",
                "Emit the real SKILL.md format rather than a summary, so the output is installable, not advisory"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/skillet. URL mode works with Node alone; PDF mode works with the optional uv-run Python backend. Streams a complete SKILL.md from any docs page against a local qwen3:14b.",
            roadmap: [
                "Batch mode to cook a whole documentation site into a skill set",
                "Skill linting against the format spec before download",
                "Direct install into the local skills directory from the browser"
            ],
            improvements: [
                "Cache fetched docs so iterating on a skill does not refetch",
                "Let the user edit the draft in place before downloading"
            ]
        }
    },
    {
        slug: "ladle",
        name: "Ladle — Open-Source Prep Forecasting and Food-Cost Leak Detection",
        problem: "Restaurants throw away 4-10% of the food they buy before it reaches a plate, and most owners find out at month end from a food-cost percentage that moved the wrong way, with no idea which ingredient did it. The tools that solve this sit behind a per-location subscription, a sales call, and your data on someone else's servers.",
        solves: "Self-hosted answers to the three questions that matter every morning — how much to prep, what to order, and where food cost is leaking. Point it at any POS export: it ingests sales, trains per-item forecasts, explodes recipes, and compares theoretical against actual usage, priced in your currency. Runs on a laptop or a small VPS. No cloud, no per-site fee, no LLM required.",
        techStack: ["Python 3.11-3.13", "FastAPI", "Next.js 15", "CLI", "CSV / Square / Toast adapters", "Apache-2.0"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/ladle",
        aiApproach: "No LLM in the critical path — per-item statistical demand forecasting with a safety margin, then a deterministic four-step loop: ingest sales, forecast demand, explode recipes, compare theoretical versus actual usage. Leaks surface as a ranked board priced in the operator's currency. The bundled demo dataset ships 120 days of sales for a fictional cafe with two planted leaks, so the detection is verifiable rather than asserted.",
        image: "/images/projects/ladle-poster.jpg",
        videoUrl: "/videos/ladle.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "Nory, Winnow, Leanpath, MarketMan, and Tenzo solve this problem for restaurants that can afford a per-location subscription. Ladle is the open-source alternative for the ones that cannot — the same three morning answers, self-hosted, with the data staying on the operator's own machine.",
            approach: [
                "Four-step core loop: ingest sales, forecast demand, explode recipes, compare theoretical versus actual",
                "Per-item demand forecast with a safety margin drives the prep sheet",
                "Purchase order computed as forecast times recipes minus stock on hand",
                "Leak board prices theoretical-versus-actual usage variance per ingredient",
                "CLI (prep, order, leaks) and a FastAPI server behind a Next.js 15 dashboard",
                "POS adapters start at CSV so any export works today"
            ],
            decisions: [
                "No LLM required — forecasting and variance are statistics, and an operator should not need a GPU to prep",
                "Self-hosted and Apache-2.0 so a single site can run it for the cost of a small VPS",
                "CSV adapter first; every POS can export CSV, and named integrations can follow",
                "Ship a demo dataset with planted leaks so the detector proves itself in one command",
                "CLI and dashboard over the same core, so a kitchen can live in the terminal or the browser"
            ],
            currentStatus: "Public and open source (Apache-2.0) at github.com/rohitguta2432/ladle, installable via pip. CI green across Python 3.11, 3.12, and 3.13. ladle demo ingests a bundled 120-day dataset and surfaces both planted leaks at the top of the board; prep, order, leaks, API, and dashboard all working.",
            roadmap: [
                "Square and Toast POS adapters beyond CSV",
                "Multi-site rollups for small groups",
                "Waste logging so measured waste feeds the same variance board"
            ],
            improvements: [
                "Seasonality and event handling in the forecaster",
                "One-command deploy recipe for a small VPS"
            ]
        }
    },
    {
        slug: "casita",
        name: "Casita — Design Your Home in 3D in the Browser",
        problem: "Home design tools want an install, a login, or a CAD background. Someone who just wants to see whether a sofa fits has no fast way to lay out a room and look at it.",
        solves: "Drag rooms and furniture onto a live blueprint and watch the home come together in a real 3D scene — 18 pieces, click-to-place on a snapping grid, drag to move, recolor in a click, snapshot to PNG, and record a 15-second orbit video of the result. No install, no login, no backend, nothing leaves the browser.",
        techStack: ["Next.js 15", "React", "react-three-fiber 9", "Three.js", "zustand", "MediaRecorder API"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/casita",
        aiApproach: "No AI — this one is deliberately a rendering and interaction problem. Every furniture piece is a handful of boxes and cylinders in a readable source file, scenes save to localStorage so nothing leaves the machine, and the 15-second orbit clip is recorded client-side with the native MediaRecorder API rather than a server.",
        image: "/images/projects/casita-poster.jpg",
        videoUrl: "/videos/casita.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "The useful version of home design for most people is not CAD — it is five minutes of moving a sofa around before buying it. Casita is that, with a zero-friction path from opening a tab to a shareable orbit video.",
            approach: [
                "18 furniture and structure pieces — walls, doors, windows, sofas, beds, kitchens, plants, lamps",
                "Click-to-place and drag-to-move on a snapping grid, with keyboard rotate, duplicate, and delete",
                "Auto-tour instantly furnishes a demo apartment and orbits it",
                "Client-side 15-second orbit recording via MediaRecorder, downloaded as webm",
                "Save and load to localStorage; zero backend, zero tracking",
                "Every piece is roughly ten lines of primitives, so the catalog is genuinely extensible"
            ],
            decisions: [
                "No backend and no login — the friction was the product problem, not the rendering",
                "Primitives over imported models so the repo ships no assets and stays readable",
                "localStorage over accounts; a room layout is not worth a signup",
                "Written to be read — the 3D engine is a handful of small files, usable as a react-three-fiber tutorial",
                "MediaRecorder for capture so sharing a design needs no server-side render farm"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/casita. Full catalog, placement, recolor, auto-tour, snapshot, save/load, and in-browser 15-second video recording all working. Runs with npm install and npm run dev on Node 18+.",
            roadmap: [
                "Measurement readouts and real-world room dimensions",
                "Import a floor plan image as a tracing underlay",
                "Shareable scene links without an account"
            ],
            improvements: [
                "Mobile touch controls for placement and orbit",
                "A larger catalog contributed through the ten-line piece format"
            ]
        }
    },
    {
        slug: "voxelforge",
        name: "VoxelForge — A Voxel Sandbox Engine Built Properly",
        problem: "Voxel sandboxes are the demo everyone builds with a coding agent right now, and almost all of them are a throwaway single HTML file that hitches on chunk generation, ships a texture pack, and cannot be read or extended.",
        solves: "A full voxel engine as a structured multi-module TypeScript app — chunked infinite terrain streamed around the camera on a per-frame budget, biomes from layered noise, caves and depth-scaled ore veins, culled-face meshing, a procedural texture atlas painted at boot, first-person movement with swept AABB collision, exact-voxel break and place, and a day-night cycle.",
        techStack: ["TypeScript", "Three.js", "Vite", "simplex-noise"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/voxelforge",
        aiApproach: "No runtime AI — the interesting work is graphics and systems engineering. Terrain comes from seeded simplex noise with temperature and moisture fields driving biomes; chunk generation runs on a per-frame budget so streaming never hitches; only faces adjacent to air get triangles, with opaque and translucent water meshed separately per chunk; block targeting uses an exact Amanatides-Woo voxel DDA raycast. A cinematic demo mode flies a deterministic camera path and performs scripted world edits, which is how the demo video is recorded unattended.",
        image: "/images/projects/voxelforge-poster.jpg",
        videoUrl: "/videos/voxelforge.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "This is the reference answer to a question a lot of engineers are asking right now — what the agent-built demo looks like when it is built as real software instead of a one-file toy. Every subsystem is separated, named, and readable.",
            approach: [
                "16x64x16 chunks streamed around the camera with a per-frame generation budget",
                "Biomes — plains, forest, desert, snowy mountains — from layered simplex temperature and moisture fields",
                "3D noise cave carving plus coal, iron, and gold veins that richen with depth",
                "Culled-face meshing with separate opaque and translucent water geometry per chunk",
                "Procedural 16x16 texture atlas painted to a canvas at boot — the repo ships zero image assets",
                "First-person controller with pointer lock, sprint, fly toggle, and swept AABB collision",
                "Amanatides-Woo DDA raycast for exact block targeting, plus an 8-slot hotbar",
                "Deterministic cinematic demo mode for unattended capture"
            ],
            decisions: [
                "Multi-module TypeScript over a single HTML file — the whole point was to do the structured version",
                "Per-frame generation budget so terrain streaming never costs a dropped frame",
                "Procedural textures so the repo has no asset pipeline and no licensing question",
                "Culled-face meshing over greedy meshing — simpler to read, fast enough at this chunk size",
                "Exact DDA raycast rather than sphere-casting, because block targeting has to feel precise"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/voxelforge. Terrain, biomes, caves, ores, meshing, procedural atlas, movement, collision, break and place, hotbar, and day-night cycle all working. Runs with npm install and npm run dev; append ?demo=1 for the cinematic flyover.",
            roadmap: [
                "Greedy meshing for large flat surfaces",
                "Web worker chunk generation to free the main thread entirely",
                "Persistence so world edits survive a reload"
            ],
            improvements: [
                "Ambient occlusion on chunk vertices for depth readability",
                "Structure generation beyond trees — villages, ruins"
            ]
        }
    },
    {
        slug: "prompt-ocean",
        name: "prompt-ocean — Type a Sea, Watch It Exist",
        problem: "Generative interfaces usually hand a model the wheel and hope. Let an LLM write shader code or scene state directly and one hallucination breaks the render — which is why most text-to-3D demos snap between presets instead of responding continuously.",
        solves: "Describe the water in plain words — a raging midnight storm, a glassy tropical dawn — and the ocean morphs into it in real time. An AI turns the phrase into physical wave parameters that a Gerstner-wave shader renders on the GPU, and sky, sun, and stars react to the same prompt. Works with no API key out of the box.",
        techStack: ["Next.js", "TypeScript", "Three.js", "GLSL", "Ollama (llama3.2)"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/prompt-ocean",
        aiApproach: "The LLM never writes code — it emits roughly twelve clamped numbers against a published parameter contract, and every value is validated before it reaches the renderer, so a hallucinating model cannot break the frame. With Ollama running, a real model interprets the phrase; without it, a zero-dependency rules engine composes the same parameters from regex, so the demo works with no key and no install. Anything that can emit that JSON can drive the ocean, which makes the model swappable by design.",
        image: "/images/projects/prompt-ocean-poster.jpg",
        videoUrl: "/videos/prompt-ocean.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "A clean demonstration of the pattern generative interfaces should use: let the model choose parameters inside a validated contract, and let deterministic code own the rendering. The result degrades to a rules engine instead of failing, which is what makes it shippable.",
            approach: [
                "Seven summed Gerstner (trochoidal) waves in a vertex shader — horizontal crest displacement gives storm seas their heaving shape",
                "Deep-water dispersion relation so long waves physically outrun short ones",
                "Finite-difference normals, fresnel plus Blinn specular, crest foam, and subsurface glow in the fragment shader",
                "Prompt goes to a local LLM if present, else a regex rules engine — both emit the same clamped parameter JSON",
                "Every parameter validated and clamped before it reaches the renderer",
                "Sky, sun, and stars driven per-frame from the same parameters with no React re-renders",
                "Prompts morph the ocean continuously rather than snapping between presets"
            ],
            decisions: [
                "Model emits numbers, never code — the blast radius of a bad generation is a strange-looking sea, not a broken page",
                "Publish the parameter contract so any model or service can drive the renderer",
                "Rules-engine fallback so the project runs with zero keys and zero setup",
                "Gerstner over sine waves; sine waves cannot make a storm look like a storm",
                "Drive the atmosphere outside React so prompt changes never cost a re-render"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/prompt-ocean. Shader, morphing parameter interpolation, atmosphere response, LLM interpretation, and the rules-engine fallback all working. Runs with npm install and npm run dev, no API key required.",
            roadmap: [
                "Shareable permalinks that encode a sea's parameters",
                "Buoyant objects riding the wave field",
                "Wider parameter contract — swell direction, wind fetch"
            ],
            improvements: [
                "Level-of-detail on the wave mesh for low-end GPUs",
                "A parameter inspector so viewers can see what the prompt produced"
            ]
        }
    },
    {
        slug: "hexapod-sim",
        name: "HEXAPOD — Inverse Kinematics and Gait Simulator",
        problem: "Hexapod gait and leg IK are usually explained with equations and a video, or hidden inside a robotics library. Neither lets you feel what changing duty factor or step height actually does to a walking robot.",
        solves: "A hexapod walking-robot simulator in the browser where the inverse kinematics and gait engine are written from scratch — no robotics libraries — using the same math that drives a real 18-servo hexapod. Switch between tripod, ripple, and wave gaits and drag speed, stride, step height, body height, and stance width sliders while it walks.",
        techStack: ["Next.js", "React Three Fiber", "Three.js", "JavaScript"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/hexapod-simulator",
        aiApproach: "No AI — pure kinematics. Analytic 3-DOF leg IK solves coxa yaw with atan2 and treats femur and tibia as a planar two-link problem via the law of cosines, six legs at 60 fps. The gait engine expresses tripod, ripple, and wave as phase offsets plus a per-leg duty factor; during stance each foot moves backward in the body frame at exactly body velocity, so feet never slide on the ground. Swing is a smoothstep return with a sinusoidal lift. Correctness is checked by an IK-to-FK round-trip self-test in the test suite.",
        image: "/images/projects/hexapod-sim-poster.jpg",
        videoUrl: "/videos/hexapod-sim.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "A working reference implementation of legged-robot IK and gait sequencing that runs in a tab. Useful for anyone building an actual hexapod, and a far better teaching artifact than a diagram because the parameters are live.",
            approach: [
                "Analytic 3-DOF leg IK — atan2 for coxa yaw, law of cosines for the femur-tibia planar two-link",
                "Six legs solved per frame at 60 fps with no solver iteration",
                "Gait engine as phase offsets plus per-leg duty factor — tripod, ripple, wave",
                "Stance feet move backward in the body frame at exactly body velocity, eliminating foot slip",
                "Swing trajectory as smoothstep forward return with sinusoidal lift",
                "IK-to-FK round-trip self-check in the test suite",
                "Live sliders for speed, stride, step height, body height, and stance width"
            ],
            decisions: [
                "Write the IK and gait math from scratch rather than pull a robotics library — the math is the project",
                "Analytic IK over an iterative solver so six legs at 60 fps is trivial rather than tight",
                "No foot slip as a hard constraint; it is the difference between a simulation and an animation",
                "Browser over a native sim so the thing can simply be linked",
                "UI and concept credit to Dilum Sanjaya's simulator, with the IK, gait math, and implementation written independently"
            ],
            currentStatus: "Public and open source at github.com/rohitguta2432/hexapod-simulator. All three gaits, the full parameter set, and the IK-to-FK verification test working. Runs with npm install and npm run dev.",
            roadmap: [
                "Body pose control — translate and rotate the chassis over planted feet",
                "Uneven terrain with per-leg ground adaptation",
                "Export a gait to servo angle sequences for real hardware"
            ],
            improvements: [
                "Turning gaits, not just straight-line locomotion",
                "A plot of per-leg phase so the duty factor is visible as well as felt"
            ]
        }
    },
    {
        slug: "avatar-sync",
        name: "avatar-sync — Real-Time Face and Hand Tracking in One HTML File",
        problem: "Face and hand tracking demos come wrapped in a build step, a server, and usually an API key — which puts a wall in front of anyone who just wants to see what the models actually output before building on them.",
        solves: "One HTML file, served statically, gives live on-device tracking: 478 face landmarks drawn on your face, an emotion readout, head pose in degrees, five expression meters, both hands as 21-point skeletons with open/closed detection, and a record button that captures a 10-second annotated clip. No server, no API keys, no install.",
        techStack: ["MediaPipe Tasks Vision", "JavaScript", "Canvas", "MediaRecorder API"],
        status: "active",
        repoUrl: "https://github.com/rohitguta2432/avatar-sync",
        aiApproach: "Two pre-trained MediaPipe models download into the browser on first load — FaceLandmarker for 478 points, 52 expression blendshapes, and a head transform, and HandLandmarker for 21 points per hand with handedness. Everything runs on-device; nothing leaves the machine. The app is a requestAnimationFrame loop that draws the camera frame, runs both models, and annotates a canvas. The readouts are deliberately honest: the smile percentage is literally the model's mouthSmileLeft score, the emotion label is a one-line threshold check, and open-versus-closed hands are plain geometry — a hand is open when three or more fingertips sit farther from the wrist than their middle joints.",
        image: "/images/projects/avatar-sync-poster.jpg",
        videoUrl: "/videos/avatar-sync.mp4",
        updated: "2026-08-26",
        details: {
            businessImpact: "A zero-setup base for VTuber puppeteering, gesture-controlled interfaces, and attention or drowsiness experiments — the part everyone rebuilds, already working and readable in a single file.",
            approach: [
                "FaceLandmarker gives 478 points, 52 blendshapes, and a head transform matrix",
                "HandLandmarker gives 21 points per hand plus left/right handedness",
                "A requestAnimationFrame loop draws the frame, runs both models, and annotates a canvas",
                "Expression meters read blendshape scores directly — blink, brow, smile, mouth-open, pucker",
                "Head pose reported as yaw, pitch, and roll in degrees",
                "Open/closed hand detection from fingertip-versus-knuckle distance to the wrist",
                "MediaRecorder captures a 10-second webm of the annotated canvas"
            ],
            decisions: [
                "One HTML file, no build step — the demo's value is how fast you can run it",
                "On-device models over a cloud vision API; a camera feed is not third-party data",
                "Show raw model scores rather than an invented confidence, so the numbers mean something",
                "Threshold-based emotion labels, stated plainly as thresholds, not sold as emotion AI",
                "Geometry for hand state instead of a second classifier — it is a few lines and it is explainable"
            ],
            currentStatus: "Public and open source (MIT) at github.com/rohitguta2432/avatar-sync. Face, hands, emotion, pose, expression meters, and recording all working. Serve the directory with any static file server over localhost or https and allow the camera.",
            roadmap: [
                "Sample rig binding so blendshapes drive a VRM or Live2D avatar directly",
                "Gesture event API for downstream UI control",
                "Per-frame data export for offline analysis"
            ],
            improvements: [
                "Frame-rate and inference-time readout for the tracking loop",
                "Graceful degradation on devices where one of the two models will not load"
            ]
        }
    },
    {
        slug: "tabletalk",
        name: "TableTalk — Scan, Order, Eat: QR Ordering for Dine-In",
        problem: "Dine-in ordering still means flagging a waiter, squinting at a laminated menu with no photos, and repeating your order across the noise. The QR menus most restaurants adopted are static PDFs — no search, no cart, no way to actually order from them.",
        solves: "Scan the QR pasted on your table and the restaurant's live menu opens on your phone — every dish with a photo, price, and description. Search it by typing or speaking, add dishes in one tap, adjust quantities, and place the order right from the table, tagged with your table number. No app install, no login, no payment wall — you ask for the bill through the app when you're done.",
        techStack: ["Next.js", "React", "Tailwind CSS", "Web Speech API"],
        status: "active",
        liveUrl: "https://mytabletalk.in/",
        aiApproach: "Voice search runs keyless in the browser — tap the mic in the search bar, say the dish, and on-device speech recognition (Web Speech API) turns it into a live menu filter. No speech service account, no audio leaves the phone.",
        image: "/images/projects/tabletalk-poster.jpg",
        videoUrl: "/videos/tabletalk.mp4",
        updated: "2026-08-30",
        details: {
            businessImpact: "Small cafes can't staff enough waiters at peak, and the static QR-PDF menus they settled for kill upsell — no photos, no bestsellers, no \"complete your meal with\" moment. TableTalk is built multi-tenant (every guest page is \"Powered by tabletalk\"), so one deployment serves many restaurants, each with its own menu and per-table QR codes.",
            approach: [
                "Per-table QR encodes the table number; the session carries it from the greeting badge through checkout so the kitchen knows where the order goes",
                "Live menu with categories, photos, prices, serving sizes, and a bestsellers rail — running with a real South Indian cafe menu (10 categories, 70+ dishes) as the demo tenant",
                "Instant search with typed input or one-tap voice input via browser speech recognition",
                "One-tap add with inline quantity steppers; a sticky cart bar keeps item count and total visible while browsing",
                "Floating Menu button opens a category jump-sheet with per-category item counts — no endless scrolling",
                "Checkout with a \"Complete your meal with\" upsell rail, bill summary, and ordering without payment — the bill is requested through the app after the meal",
                "Mobile-first Next.js + Tailwind UI tuned for the phone that just scanned the QR"
            ],
            decisions: [
                "Order first, pay later — matching how dine-in actually works in India instead of forcing prepayment like delivery apps",
                "No app install and no login — the QR is the whole onboarding; any friction and the table goes back to waving at a waiter",
                "Voice search over voice ordering — a constrained speech-to-filter task is reliable today; free-form voice ordering is not",
                "Multi-tenant from day one rather than a single restaurant's site — the platform is the product",
                "Photos on every dish — menus sell with pictures, and static QR PDFs throw that away"
            ],
            currentStatus: "Live at https://mytabletalk.in/ with the full guest flow — menu, search, voice search, cart, category jump-sheet, and checkout — running on the Kaaram Cafe demo menu. Kitchen-side order intake is the piece being wired up next.",
            roadmap: [
                "Kitchen/counter view of incoming orders by table",
                "Bill request and UPI payment from the table",
                "Restaurant onboarding flow — menu upload and per-table QR generation",
                "Order status back to the guest (received, preparing, on the way)"
            ],
            improvements: [
                "Offline-tolerant cart so a flaky cafe connection doesn't drop items",
                "Regional-language menu and voice search for non-English diners"
            ]
        }
    },
];

export const repos = [
    {
        name: "MicroItinerary",
        description: "AI Travel Planner — Spring Boot + React PWA with OpenAI integration",
        modules: ["backend", "web", "docker-compose.yml"],
        url: "https://github.com/rohitguta2432/MicroItinerary"
    },
    {
        name: "propTech",
        description: "PropCheck — AI property trust score for India. FastAPI + Next.js 14 + Gemma 4 31B (OpenRouter) + Chrome MV3",
        modules: ["backend", "web", "extension", "specs"],
        url: "https://github.com/rohitguta2432/propTech"
    },
    {
        name: "spring-ai-mcp-server",
        description: "StellarMIND — Chat-to-SQL with pgvector RAG and MCP protocol",
        modules: ["stellarmind-server", "stellarmind-client", "postman"],
        url: "https://github.com/rohitguta2432/spring-ai-mcp-server"
    },
    {
        name: "myFinance",
        description: "MyFinancial — Privacy-first financial planning PWA for India",
        modules: ["src", "backend", "specs"],
        url: "https://github.com/rohitguta2432/myFinance"
    },
    {
        name: "backendscale",
        description: "This site (rohitraj.tech) — personal engineering directory",
        modules: ["src/app", "src/components", "src/data"],
        url: "https://github.com/rohitguta2432/rohitraj-tech"
    },
    {
        name: "clinicai",
        description: "ClinicAI — WhatsApp AI clinic assistant with Spring Boot + Twilio",
        modules: ["backend", "docker-compose.yml"],
        url: "https://github.com/rohitguta2432/clinicai"
    },
    {
        name: "synflow",
        description: "SynFlow — Enterprise intelligence and deal matching with Spring Boot + Next.js + GPT-4o",
        modules: ["synflow-api", "synflow-web", "docker-compose.yml"],
        url: "https://github.com/rohitguta2432/synflow"
    },
    {
        name: "finbaby",
        description: "FinBaby (Jama) — Android finance tracker with SMS auto-import, Kotlin + Jetpack Compose",
        modules: ["app/src/main/java/com/finbaby/app"],
        url: "https://github.com/rohitguta2432/finbaby"
    },
    {
        name: "retailos",
        description: "RetailOS — Multi-tenant retail SaaS with 12-module Spring Boot monorepo",
        modules: ["retailos-auth", "retailos-tenant", "retailos-inventory", "retailos-billing", "retailos-invoice", "retailos-khata"],
        url: "https://github.com/rohitguta2432/retailos"
    },
    {
        name: "agent-autopsy",
        description: "Agent Autopsy — forensic debugger for failed AI agent runs. Next.js 16 + local Ollama (qwen3:14b), five failure signatures, 100% local",
        modules: ["lib", "app/api/scan", "app/api/diagnose", "tests"],
        url: "https://github.com/rohitguta2432/agent-autopsy"
    },
    {
        name: "tinyvoice",
        description: "tinyvoice — fine-tune a 0.5B model in your own voice in an afternoon. MLX LoRA on Qwen2.5-0.5B + FastAPI side-by-side compare UI",
        modules: ["data", "adapters", "server"],
        url: "https://github.com/rohitguta2432/tinyvoice"
    },
    {
        name: "snap3d",
        description: "snap3d — one photo to an editable 3D model via Claude Fable 5 + Three.js. Named parts, plain-English remix, zero-dep Node server",
        modules: ["server.js", "public"],
        url: "https://github.com/rohitguta2432/snap3d"
    },
    {
        name: "agentic-os",
        description: "Agentic OS — force-directed map of 387 Claude Code skills across 34 clusters. Next.js 16 + canvas force graph, snapshot generated from local SKILL.md front-matter",
        modules: ["app", "components", "data/skills.json", "scripts"],
        url: "https://github.com/rohitguta2432/agentic-os"
    },
    {
        name: "claude-autodev",
        description: "Autonomous 8-stage dev pipeline for Claude Code — artifact-gated stages in an isolated git worktree with a live SSE mission-control dashboard. CI on Linux/macOS/Windows, Node 22 + 24",
        modules: ["bin", "src", "public", "skill"],
        url: "https://github.com/rohitguta2432/claude-autodev"
    },
    {
        name: "kisansathi",
        description: "KisanSathi — six-agent AI farm advisor in Hindi and regional languages. FastAPI + Next.js 16, keyless: local Ollama, Open-Meteo forecasts, Agmarknet mandi prices",
        modules: ["backend", "frontend"],
        url: "https://github.com/rohitguta2432/kisansathi"
    },
    {
        name: "marginchef",
        description: "MarginChef — CLI agent that finds restaurant margin leaks from 4 CSVs. Plate costing, 5 leak detectors, menu quadrants, reprice suggestions, local-LLM action plan",
        modules: ["marginchef", "sample_data", "tests"],
        url: "https://github.com/rohitguta2432/marginchef"
    },
    {
        name: "quorum",
        description: "Quorum — deep-research agent swarm with a shared GraphRAG brain. Planner/Researchers/Critic/Synthesizer coordinating through a live knowledge graph, FastAPI + SSE + React force graph",
        modules: ["backend", "frontend", "docs"],
        url: "https://github.com/rohitguta2432/quorum"
    },
    {
        name: "regexforge",
        description: "RegexForge — plain English to a regex you can trust. Live match highlighting, auto-generated positive/negative test cases, 6-language export, runs fully local on Ollama",
        modules: ["app", "components", "lib"],
        url: "https://github.com/rohitguta2432/regexforge"
    },
    {
        name: "skillet",
        description: "Skillet — paste a docs URL or PDF, get an installable Claude Code SKILL.md. Local Ollama writes it, streamed live; optional one-file Python/pypdf backend",
        modules: ["app", "backend", "lib"],
        url: "https://github.com/rohitguta2432/skillet"
    },
    {
        name: "ladle",
        description: "Ladle — open-source prep forecasting and food-cost leak detection for restaurants. Python CLI + FastAPI + Next.js 15 dashboard, self-hosted, no LLM required",
        modules: ["ladle", "web", "data"],
        url: "https://github.com/rohitguta2432/ladle"
    },
    {
        name: "prompt-ocean",
        description: "prompt-ocean — describe a sea in words, an AI emits clamped wave parameters and a 7-wave Gerstner GPU shader morphs the ocean into it. Zero-key rules-engine fallback",
        modules: ["app", "components", "lib"],
        url: "https://github.com/rohitguta2432/prompt-ocean"
    },
    {
        name: "voxelforge",
        description: "VoxelForge — voxel sandbox engine in TypeScript + Three.js. Chunked infinite terrain, biomes, caves, ores, culled-face meshing, procedural atlas, day-night cycle",
        modules: ["src/world", "src/player", "demo"],
        url: "https://github.com/rohitguta2432/voxelforge"
    },
    {
        name: "casita",
        description: "Casita — 3D home design in the browser. react-three-fiber, 18 primitive-built pieces, snapping grid, in-browser MediaRecorder orbit video, zero backend",
        modules: ["src/pieces.jsx", "app", "media"],
        url: "https://github.com/rohitguta2432/casita"
    },
    {
        name: "hexapod-simulator",
        description: "HEXAPOD — hexapod IK and gait simulator. Analytic 3-DOF leg IK and tripod/ripple/wave gait engine written from scratch, verified by an IK-to-FK round-trip test",
        modules: ["lib/hexapod.js", "app", "videos"],
        url: "https://github.com/rohitguta2432/hexapod-simulator"
    },
    {
        name: "avatar-sync",
        description: "avatar-sync — real-time face + hand tracking in one HTML file. 478 face landmarks, blendshape expression meters, head pose, 21-point hands, on-device MediaPipe",
        modules: ["index.html", "demo.gif"],
        url: "https://github.com/rohitguta2432/avatar-sync"
    }
];

export const notes = [
    {
        slug: "rag-for-sql",
        title: "Using RAG for SQL Generation",
        date: "2026-01-28",
        excerpt: "How pgvector embeddings improve LLM-to-SQL accuracy by providing schema context."
    },
    {
        slug: "spring-boot-mcp",
        title: "Building an MCP Server with Spring Boot",
        date: "2026-01-20",
        excerpt: "Implementing the Model Context Protocol for AI assistant tool integration."
    },
    {
        slug: "pwa-offline-sync",
        title: "Offline-First PWA Patterns",
        date: "2026-01-15",
        excerpt: "Service workers, IndexedDB, and background sync for MicroItinerary."
    }
];
