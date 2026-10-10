# Outreach drafts — 2026-09-05

Copy-paste ready. Edit the [bracketed] bits before sending.

---

## 1. Show HN — Resolvr

**Title (≤80 chars):**
Show HN: Resolvr – self-hosted AI support agent on local Ollama, zero per-token cost

**URL:** https://github.com/rohitguta2432/resolvr

**First comment (post immediately after submitting):**

Hi HN — I built Resolvr because every "AI support agent" I evaluated for client work sent ticket text to a cloud LLM, which was a non-starter for EU/regulated teams.

Resolvr runs the whole pipeline on local Ollama (qwen2.5:14b): classify the ticket → retrieve KB articles via RAG → decide resolve-vs-escalate behind a safety gate → draft the reply. No ticket text leaves your server by default; the cloud-API tier is opt-in.

The part I'd most like feedback on is the safety gate: security/legal/abuse/refund tickets always escalate regardless of retrieval confidence, weak KB matches escalate with context attached, and a pytest suite enforces 100% must-escalate recall + ≥90% action accuracy before any change ships. That eval-gated design is my answer to "but won't it hallucinate?" — low-confidence cases go to a human instead of being sent.

Stack and setup are in the README — four steps from zero to a running agent. Happy to answer anything about the RAG tuning, the eval suite, or running 14B-class models for this workload.

**Timing tip:** Tue–Thu, 8–10am ET. Reply to every comment in the first 2 hours.

---

## 2. Show HN — TableTalk

**Title (≤80 chars):**
Show HN: TableTalk – QR dine-in ordering with on-device voice search, no app

**URL:** https://mytabletalk.in/

**First comment:**

Hi HN — most restaurant QR "menus" are static PDFs: no search, no cart, no ordering. TableTalk is the version I wanted as a customer: scan the table QR, the live menu opens in the browser (photos, prices, descriptions), search by typing or speaking, order from the table tagged with your table number. No app install, no login, no payment wall — you ask for the bill through the app when done.

Technical bit I enjoyed: voice search is keyless and on-device via the Web Speech API — tap the mic, say the dish, it becomes a live menu filter. No speech-service account, no audio leaves the phone. Stack is Next.js/React/Tailwind.

It's live in [N] cafes right now [adjust/remove]. Curious how HN would handle the offline/flaky-wifi case in a busy restaurant — that's been the hardest real-world problem so far.

---

## 3. Podcast pitch — AI engineering shows

*(Targets: Latent Space, The Pragmatic Engineer podcast, Software Engineering Daily, AI Engineering Podcast — personalize line 1 per show.)*

**Subject:** Forward-deployed AI engineering — what actually survives contact with production

Hi [Name],

[One line referencing a specific recent episode.]

I'm Rohit Raj, an AI consultant working forward-deployed: embedded with client teams shipping agents, MCP integrations, and LLM features to production, with eval suites proving they work. 10+ years shipping production systems.

Three topics I can go deep on, with running code rather than slideware:

1. **Eval-gated agent deployment** — my open-source support agent (Resolvr) won't ship a change unless a pytest suite shows 100% must-escalate recall on security/legal tickets. What that discipline looks like in client work.
2. **Local-first inference in production** — running qwen2.5-14B on client infra for privacy-bound workloads: where it's genuinely enough, where it isn't, real latency/cost numbers.
3. **MCP in the enterprise** — what integrating Model Context Protocol into existing systems actually takes vs. the demo.

Everything is public: rohitraj.tech/agents/resolvr has the architecture, github.com/rohitguta2432/resolvr the code. Happy to share specific war stories on a call first if useful.

Best,
Rohit
rohitraj.tech

---

## 4. Newsletter guest-post pitch

*(Targets: dev-focused newsletters that take contributed deep-dives — e.g. Console.dev interviews, InfoQ, DZone, The New Stack contributed posts.)*

**Subject:** Contributed deep-dive: an eval-gated, self-hosted AI support agent (with code)

Hi [Name],

I'd like to contribute a technical deep-dive: **"An AI support agent that's not allowed to guess: RAG + a confidence-thresholded safety gate, self-hosted on Ollama."**

The angle: everyone asks "won't the agent hallucinate?" — the honest answer is an architecture question, not a model question. The piece walks the four-stage pipeline (classify → RAG retrieve → gated decide → draft), the eval suite that enforces 100% must-escalate recall before ship, and the real numbers from running a 14B model instead of a cloud API. All code is open source, so readers can run every example.

~1,800 words, original to you, code snippets included. I'm an AI consultant (forward-deployed engineer) — bio and prior writing at rohitraj.tech/notes.

Interested? I can send a full draft within a week.

Best,
Rohit

---

## 5. Directory checklist (30 min each, needs your account)

- [ ] Clutch.co — consultant profile, category "AI Development"
- [ ] GoodFirms — same
- [ ] DesignRush — "AI Companies" listing
- [ ] MCP registries: modelcontextprotocol servers list (PR), mcp.so, PulseMCP — list your MCP integrations
- [ ] Google Business Profile (if serving India clients regionally)
