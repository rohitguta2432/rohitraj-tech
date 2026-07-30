import type { BlogPost } from '@/types/blog';

export const aiDevWeek2026W31: BlogPost = {
  slug: 'ai-dev-week-2026-31',
  title:
    'This Week in AI Dev: Agent Skills Went GA, Then the Benchmark Landed (Week 31 of 2026)',
  date: '2026-07-30',
  excerpt:
    'Week 31 of 2026 shipped one story twice. GitHub made agent skills and MCP generally available in Copilot code review, Google added hooks to Gemini Managed Agents — and on the same day, a benchmark showed the best model follows a written policy document just 36.2% of the time, while a self-propagating worm walked through Copilot for Word. Plus what Kimi K3 really costs to run locally (594 GB floor) and the 250B sleeper release you can actually serve.',
  readingTime: '7 min read',
  keywords: [
    'ai dev tools this week',
    'copilot code review agent skills',
    'gemini managed agents hooks',
    'handbook.md benchmark agents',
    'copilot for word prompt injection worm',
    'kimi k3 gguf local vram',
    'solar-open2-250b upstage',
    'ai dev week 31 2026',
  ],
  relatedProject: 'myFinancial',
  coverImage: {
    src: '/images/notes/ai-dev-week-2026-31-cover.jpg',
    alt: 'Glowing neural lattice sealed inside a translucent faceted shell illustrating AI agent skills and governance in week 31 of 2026',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `**Week 31** (July 24–30, 2026): **GitHub** made agent skills and MCP **generally available** in Copilot code review on **July 29** — drop a \`SKILL.md\` in \`.github/skills/\`. **Google** added \`pre_tool_execution\` hooks to Gemini Managed Agents on **July 28**. The same week, the **HANDBOOK.md benchmark** (arXiv 2607.25398) found the best of **30 model configs** passes only **36.2%** of policy-compliance tasks, and a **self-propagating worm** was disclosed in **Copilot for Word** after **144 days** with no robust fix. Skip the model-availability changelogs.`,
    },
    {
      heading: 'Why This Week the Releases and the Research Are One Story',
      content: `By [Rohit Raj](/en/about) — Founding Engineer · 10+ yrs MVP shipping · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

Two vendors shipped the same idea within 24 hours: you govern an agent by writing a file. GitHub put \`SKILL.md\` on every pull request; Google put an agent config in \`.agents/\`. On July 28, a 65-task benchmark found agents mostly don't obey long written policies, and a researcher published a worm that rides inside Word documents because a model can't separate instructions from content.

Here's the detail nobody headlined: **both vendors already know.** Google's marquee feature isn't a better prompt, it's *hooks* — code that runs before a tool call. GitHub's headline constraint is that every MCP call in code review is **read-only**. Two independent teams shipped prose-based configuration and, in the same release, wrapped it in deterministic guardrails.`,
    },
    {
      heading: 'Week 31 at a Glance',
      content: `| Drop | Signal | Verdict |
|------|--------|---------|
| **Copilot code review: skills + MCP GA** | Jul 29, Pro→Enterprise, read-only MCP | Encode your most-repeated comment |
| **Gemini Managed Agents hooks** | Jul 28, still preview | Enforce rules here, not in prompts |
| **HANDBOOK.md benchmark** | Best 36.2%, most <25% | Read before trusting any rules file |
| **Copilot for Word worm** | 144-day disclosure, no fix | Treat inbound docs as untrusted |
| **Skills as distribution** | +1,421★ / +616★ in 24h | Use them, verify behaviour |
| **Kimi K3 GGUF ladder** | 594 GB → 1.56 TB | "Local" means a server |
| **Solar-Open2-250B** | 250B total, 15B active, SWE-Bench 70.4 | The one you can serve |`,
    },
    {
      heading: 'Copilot Code Review Runs Your Skills Now — Should You Write One?',
      content: `**What:** On **July 29, 2026**, GitHub moved agent skills and MCP server connections in Copilot code review to **general availability** for **Pro, Pro+, Business, and Enterprise**. Add a \`SKILL.md\` under \`.github/skills\` and Copilot can invoke internal tools and org standards mid-review, with GitHub and Playwright MCP on by default.

**Why it matters:** Your review standards stop being a wiki page nobody opens and start executing on every PR. The constraint worth reading twice: MCP tool calls in code review are **read-only**. A reviewer that reads your service catalog but can't write to it is a deliberate blast-radius decision — and, given the benchmark two items down, the right one.

**Source:** [GitHub Changelog, July 29, 2026](https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available)

**Quick take:** Encode the comment your team leaves most often, then measure whether it stops recurring.`,
    },
    {
      heading: 'Gemini Managed Agents Added Hooks — the Deterministic Escape Hatch',
      content: `**What:** On **July 28, 2026**, Google expanded Managed Agents in the Gemini API with **environment hooks** — a \`.agents/hooks.json\` declaring \`pre_tool_execution\` and \`post_tool_execution\` events. It also made \`gemini-3.6-flash\` the default, added a budget cap via \`agent_config.max_total_tokens\`, and opened **free-tier projects**. Agent id: \`antigravity-preview-05-2026\` — note the *preview*, this is not GA.

**Why it matters:** Hooks are the quiet admission that prompt text isn't a control plane. A \`pre_tool_execution\` hook is ordinary code: it sees the call before it fires and can reject it, however the model was talked into making it. With \`max_total_tokens\` you get the two guarantees prose can't — this agent will not call that tool, and will not spend past this line.

**Source:** [Google, Gemini API Managed Agents (July 28, 2026)](https://blog.google/innovation-and-ai/technology/developers-tools/expanding-managed-agents-gemini-api-3-6-flash-hooks/)

**Quick take:** Move every rule you truly need enforced out of the system prompt into a hook.`,
    },
    {
      heading: 'Can a 100-Page Policy Document Actually Govern an Agent?',
      content: `**What:** **HANDBOOK.md: A Benchmark for Long-Context Agentic Instruction Following** ([arXiv 2607.25398](https://arxiv.org/abs/2607.25398), submitted **July 28, 2026**) drops an agent into a simulated workplace and asks whether it follows the company handbook. **65 tasks** across five domains (finance, medical billing, insurance, logistics, HR) at **ten fictional companies**, procedures spanning **20 to 124 pages**, graded by **824 programmatic criteria**. Rules are perturbed per task so nothing can be memorised.

Across **30 model configurations**, the best passed **36.2%** under strict grading. Most frontier models scored **below 25%**. Two failure patterns recur: agents **yield to in-environment requests that contradict standing policy**, and they **lose rule details over time**.

**Why it matters:** This is the empirical floor under \`CLAUDE.md\`, \`AGENTS.md\`, and every \`SKILL.md\` GitHub shipped the next day. A file followed roughly a third of the time is documentation, not enforcement — and compliance decays as context fills.

**Source:** [arXiv 2607.25398](https://arxiv.org/abs/2607.25398) — Panavas, Minus, Monton, Ray, Garre, Mehta, Chen

**Quick take:** Keep writing instruction files; 36.2% beats zero. Just stop calling them guardrails.`,
    },
    {
      heading: 'A Self-Propagating Worm Walked Through Copilot for Word',
      content: `**What:** On **July 28, 2026**, Håkon Måløy published a working document-borne worm against **Microsoft Copilot for Word**. Instructions hidden as white-text-on-white get processed as user requests. Stage one alters the document — changing financial figures, say — while silently copying the attack instructions into the *output* in the same concealed formatting. Stage two is the worm: that internally-created, trusted document re-triggers the attack whenever it's next used as source material.

Tested against **GPT-5.5 and GPT-5.6**. Coordinated with MSRC from **March 6 to July 28 — 144 days**, across **two fix attempts and a model upgrade**, with **no robust mitigation** at publication.

**Why it matters:** Prompt injection stops being a demo when it self-replicates through documents your colleagues wrote — and the cause is architectural: "the attacker-controlled tokens are already influencing the computation."

**Source:** [Context Collapse Part 3 — enklypesalt.com](https://enklypesalt.com/posts/context-collapse-part3-ai-worming-through-word/)

**Quick take:** Your untrusted set now includes documents your own org generated from untrusted input.`,
    },
    {
      heading: 'Agent Skills Quietly Became a Distribution Channel',
      content: `**What:** Two skills repos topped GitHub trending this week. **[book-to-skill](https://github.com/virgiliojr94/book-to-skill)** — turn a technical book PDF into a Claude Code skill — gained **1,421 stars in 24 hours** to reach **12,986** (MIT, created May 1 2026). It splits a book into a ~4K-token \`SKILL.md\` plus on-demand chapter files, claiming **24–51× fewer tokens** than full-book context at about **$1 per book**. **[superpowers](https://github.com/obra/superpowers)** by Jesse Vincent added **616 stars** in a day to sit at **263,414** (MIT) — 14+ workflow skills running across Claude Code, Codex, Cursor, and Gemini CLI.

**Why it matters:** The packaging war is over and markdown won: a skill is portable across a dozen agents and, as of July 29, executable inside GitHub code review.

**Quick take:** Install them, they're useful — while holding both facts at once: this is the file format the benchmark says gets followed about a third of the time.`,
    },
    {
      heading: 'What Does It Actually Cost to Run Kimi K3 Locally?',
      content: `**What:** We covered [the Kimi K3 release in Week 30](/en/notes/ai-dev-week-2026-30); this week the follow-up got answered. Official spec from [Moonshot's card](https://huggingface.co/moonshotai/Kimi-K3): **2.8T total parameters, 104B activated**, 896 experts with 16 per token, **1,048,576-token context**. (Several threads called it "A50B" — the official card says 104B.) The [Unsloth GGUF ladder](https://huggingface.co/unsloth/Kimi-K3-GGUF) runs **594 GB** at UD-IQ1_S up to **1.56 TB** at 8-bit. Home-lab reports landed near **4 tokens/sec**. Separately, llama.cpp merged **MTP speculative decoding for GLM-5.2** ([PR #25980](https://github.com/ggml-org/llama.cpp/pull/25980), **July 29**), alongside a PSA that it now loads MTP tensors by default even when MTP is disabled.

**Why it matters:** "Open weights" and "runnable" are different claims — the floor to touch this model at all is **594 GB**, at 1-bit, at reading speed.

**Quick take:** Unless you have server-class RAM, K3 is an API model that happens to be open.`,
    },
    {
      heading: 'Solar-Open2-250B Is the Sleeper You Can Actually Serve',
      content: `**What:** Upstage's **[Solar-Open2-250B](https://huggingface.co/upstage/Solar-Open2-250B)** is **250B total but only 15B active per token** — a hybrid-attention MoE with **321 experts** across 48 layers, a **1M-token context**, trained on ~**12 trillion tokens** using **2 million B200 GPU-hours**. Reported: **MMLU-Pro 86.2**, **GPQA-Diamond 86.3**, **SWE-Bench Verified 70.4**, **LiveCodeBench 92.4**.

**Why it matters:** Put it next to the item above: K3 needs 594 GB before it says a word; Solar-Open2 activates 15B per token — a serving profile a real company can budget for.

**One caveat:** it ships under the **Upstage Solar License**, not Apache-2.0 or MIT, with derivative-model obligations.

**Quick take:** Benchmark this before the trillion-parameter headliners, then read the licence.`,
    },
    {
      heading: "What I'm Shipping With This Week",
      content: `The HANDBOOK.md paper handed me an eval target for something I already had running. Earlier this month I built **[Agent Autopsy](https://github.com/rohitguta2432/agent-autopsy)** — paste a dead agent's transcript, get the cause of death. It classifies five failure signatures deterministically in under a second: \`DEATH_LOOP\`, \`ERROR_BLINDNESS\`, \`GHOST_TOOL\`, \`FLATLINE\`, and \`CONTEXT_BLOAT\`. It's new and small; the point is that agent failures are silent — the run returns 200 OK and the result is quietly wrong.

The benchmark gave me a number for one of them. Its second failure mode — agents "losing rule details over time" — is exactly what I call \`CONTEXT_BLOAT\`, now measured at below 25% compliance for most frontier models.

The failure mode I'd worry about: a forensic tool tells you what went wrong *after* it did. The honest lesson of Week 31 is that post-hoc diagnosis isn't the win — Google's \`pre_tool_execution\` hook is, because it stops the call before it happens. So the next thing I'm wiring is the boring half: expressing the top two signatures as hooks that fire *before* a tool call. Detection is the prototype; prevention is the product — the same order of operations I bring to every [6-week MVP build](/en/services/6-week-mvp).`,
    },
    {
      heading: 'Skip These',
      content: `**Model-availability changelogs.** [Claude Opus 5 arrived in GitHub Copilot](https://github.blog/changelog/2026-07-24-claude-opus-5-is-now-available-in-github-copilot) on July 24, Grok 4.5 shortly after. Both real, neither a decision — you'll pick a model from your own evals, not a changelog.

**Chasing trillion-parameter models as "local" infrastructure.** Keep **594 GB** in your head — the *smallest* Kimi K3 quantization, at 1-bit, near 4 tokens/sec. If a post says a 2.8T model is runnable at home, check what "home" means in that sentence.`,
    },
    {
      heading: 'Building on Any of This and Hitting Walls?',
      content: `Week 31's lesson: the industry shipped markdown-as-policy to millions of developers the same week it published evidence that markdown-as-policy is about a third reliable — and hedged with hooks and read-only scopes rather than better prose. If you're wiring agents into anything touching money, customer data, or production writes, that gap is your integration work.

That's what I do: AI-heavy MVPs shipped in six weeks with evals, permission boundaries, and cost caps built in from day one. Start with the [6-week MVP plan](/en/services/6-week-mvp) or [hire a founding engineer](/en/services/hire-founding-engineer-india) who has debugged these failures on his own infrastructure.`,
    },
  ],
  cta: {
    text: 'Ship Your AI MVP in 6 Weeks',
    href: '/en/services/6-week-mvp',
  },
};
