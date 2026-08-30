import type { BlogPost } from '@/types/blog';

export const aiDevWeek2026W35: BlogPost = {
  slug: 'ai-dev-week-2026-35',
  title:
    "This Week in AI Dev: The Price War Reaches Anthropic's Flagship (Week 35 of 2026)",
  date: '2026-08-25',
  excerpt:
    "Anthropic's priciest model took 8.0% of its own customers' spend in July while Opus 4.8 took 28.0%. OpenAI extended a discount to November. A 22.4 GB quant claims Opus-class coding. Week 35 is the week the AI price war stopped being a headline and started being a routing decision.",
  readingTime: '7 min read',
  keywords: [
    'ai model price war august 2026',
    'ai dev tools this week',
    'gpt-5.6 sol pricing',
    'glm-5.3 open weights',
    'tiel-coder 35b a3b',
    'best local coding model august 2026',
    'xiaomi ai cube specs',
    'ai dev week 35 2026',
  ],
  relatedProject: 'myFinancial',
  coverImage: {
    src: '/images/notes/ai-dev-week-2026-35-cover.jpg',
    alt: 'Descending cascade of glowing liquid-metal spheres illustrating the collapsing cost of frontier AI in 2026',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `Ramp data from **70,000 companies** shows Anthropic's most expensive model, **Fable 5**, took just **8.0%** of July spend on Anthropic tools — while the cheaper **Opus 4.8** took **28.0%**. **OpenAI** is holding **GPT-5.6 Sol** promotional pricing (**$4/$20** per 1M) through **November 21, 2026**. **GLM-5.3** tops open-source Terminal-Bench 3.0 at **28.3** but its weights are still unreleased. A **22.4 GB** community quant claims Opus 4.6 parity. And **Xiaomi** showed a **1.22 TB/s**, 160 GB local-inference box.`,
    },
    {
      heading: 'Why Every Drop This Week Points the Same Direction',
      content: `By [Rohit Raj](/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

Six unrelated things happened this week — a spend dataset, a pricing-page footnote, a withheld weights release, a community quant, a leaderboard position, and a chip announcement. They are the same story told six times.

For two years the default assumption was that the most capable model wins the budget. This week produced the first hard number against it: inside Anthropic's own customer base, the flagship lost to its cheaper sibling by more than 3 to 1. That is a purchasing result, not a benchmark result — the thing benchmarks are supposed to predict and increasingly don't. If the expensive model is no longer the default, **choosing** a model per call becomes an architectural decision you own rather than a vendor default you inherit.`,
    },
    {
      heading: 'Week 35 at a Glance',
      content: `| Drop | Date | The number that matters | Verdict |
|------|------|------------------------|---------|
| **Ramp/FT spend data** | Aug 23 | Fable 5 at 8.0% vs Opus 4.8 at 28.0% | Re-run your own cost-per-task math |
| **GPT-5.6 Sol promo pricing** | Live now | $4/$20 per 1M, through Nov 21 | Lock benchmarks in before it lapses |
| **GLM-5.3 weights** | Aug 14 launch | Terminal-Bench 3.0: 4.6 → 28.3 | Wait — weights are not out yet |
| **Tiel-Coder-35B-A3B** | Aug 23 | 22.4 GB at UD-Q4_K_XL, MIT | Pull it if you have 24 GB |
| **Qwen3.8-27B on code arena** | Aug 25 | 9th overall; Gemma 4 31B is 80th | Already the local default |
| **Xiaomi AI Cube** | Aug 24 | 1.22 TB/s, 160 GB, 330 tok/s, 150 W | Prototype — watch, don't budget |`,
    },
    {
      heading: "Did Anthropic's Most Expensive Model Actually Fail?",
      content: `**What:** The Financial Times reported on **August 23, 2026** that spending on Anthropic's top-tier **Fable 5** never surpassed roughly **11%** of overall spend on Anthropic's tools. Simon Willison pulled the underlying **Ramp** breakdown — data from **70,000** Ramp-card-using companies — and the July 2026 split is starker: **Opus 4.8 at 28.0%**, **Sonnet 4.6 at 8.3%**, **Fable 5 at 8.0%**, **Opus 4.6 at 6.9%**.

**Why it matters:** "Failed" is the wrong word — 8.0% of a very large number is a real business. The signal is the **ranking**. Customers already sold on Anthropic put three-and-a-half times more money into a cheaper model than into the best one available to them. Buyers stopped asking which model is smartest and started asking whether the marginal intelligence clears the marginal cost.

**Source:** [Simon Willison, Aug 23](https://simonwillison.net/2026/Aug/23/anthropics-best-ai-model-struggles-to-attract-users-as-cheaper-t/) · [HN thread, 774 points](https://news.ycombinator.com/item?id=49411102)

**Quick take:** If you defaulted to the top tier a year ago and never revisited it, this is your prompt to measure. Most workloads do not need it.`,
    },
    {
      heading: "How Long Does GPT-5.6 Sol's Discount Actually Last?",
      content: `**What:** OpenAI's pricing docs now carry an explicit line: *"GPT-5.6 Sol's promotional pricing is available at least through November 21, 2026."* The cut is **20%**, and current short-context rates are **$4.00 per 1M input**, **$0.40 cached input**, **$5.00 cache writes**, and **$20.00 per 1M output**. Long-context doubles most of that: **$8.00 / $0.80 / $10.00 / $30.00**.

**Why it matters:** The sibling tiers are the real story. **GPT-5.6 Terra** runs **$2.00/$12.00** and **GPT-5.6 Luna** runs **$0.20/$1.20** — a **20×** input spread inside one model family, before you compare vendors at all. Cached input at **$0.40** also rewards prefix stability: a fixed system prompt plus a long tool schema is cheap to reuse and expensive to regenerate.

**Source:** [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) · [HN thread, 316 points](https://news.ycombinator.com/item?id=49421074)

**Quick take:** Treat the Nov 21 date as a real deadline. Benchmark Sol against Terra on your workload now, so the decision is data when the price moves.`,
    },
    {
      heading: 'Is GLM-5.3 Actually Open Weights Yet?',
      content: `**What:** No — and this is the item most roundups are getting wrong. **GLM-5.3** launched via API on **August 14, 2026** from Zhipu AI (Z.ai) at **$1.40 in / $4.40 out** per 1M, the same price as GLM-5.2. It scores **28.3 on Terminal-Bench 3.0**, up from **4.6** — a **6.2×** jump and first place among open-source models — plus **84.5%** on CyberGym. Early testing puts it near **$0.60 per task**.

**Why it matters:** Zhipu committed to publishing weights roughly two weeks after launch, which lands around **August 28, 2026**. The stated reason for the delay is safety hardening around the model's strength on vulnerability-finding work. As of this morning the **zai-org** Hugging Face organisation still lists **GLM-5.2** as its newest published model — GLM-5.3 (roughly **750B** params) is not there. So every "GLM-5.3 open-weight beats Anthropic for 1/5 the cost" headline you saw this week is describing a model you cannot yet download. The API number is real; the self-hosting number is a promise.

**Source:** [Nathan Lambert on GLM-5.3, Aug 14](https://www.interconnects.ai/p/glm-53-how-chinese-labs-keep-stride) · [zai-org on Hugging Face](https://huggingface.co/zai-org) — latest published model there is still **GLM-5.2**

**Quick take:** Test it on the API today. Do not put self-hosted GLM-5.3 in an architecture diagram until the weights actually land.`,
    },
    {
      heading: 'Can a 22 GB Quant Really Match Opus 4.6?',
      content: `**What:** **Tiel-Coder-35B-A3B** appeared on Hugging Face on **August 23, 2026** — an **MIT-licensed** fine-tune of \`ornith-ai/Ornith-1.5-35B-A3B\`, a **35B** mixture-of-experts model activating **8 of 256 experts** per token. The **UD-Q4_K_XL** quant is **22.4 GB**; the range runs from **12.3 GB** (UD-Q2_K_XL) to **38.5 GB** (UD-Q8_K_XL). Card numbers: **12 of 25** on SWE-bench-Live, **67.2** on Claw-Eval multi-turn, **73.7** on MMLU-Pro.

**Why it matters:** The interesting part is the **shape**, not the score. The author's framing: Qwen3.8-27B is strong but slow, and a 35B-A3B MoE gives comparable fixes at far higher throughput because only ~3B params activate per token. They also built a code-weighted imatrix for the quantization and a chat template tuned for agentic loops — quant engineering, not just training.

**Source:** [Tiel-Coder-35B-A3B-GGUF](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF) · [MLX build](https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-MLX-oQ4e)

**Quick take:** Worth pulling on 24 GB. Treat "matches Opus 4.6 medium" as one person's benchmark on their codebases until reproduced — 12/25 on SWE-bench-Live is good, not frontier.`,
    },
    {
      heading: 'Qwen3.8-27B Lands 9th on Code Arena — Gemma 4 31B Is 80th',
      content: `**What:** An r/LocalLLaMA thread today put **Qwen3.8-27B** in **9th** position on code arena, with **Gemma 4 31B** — a **larger** model — sitting at **80th**. Qwen3.8-27B is also the **#1 trending model on Hugging Face** right now with **12,547 likes**, and the trending page is currently five separate Qwen3.8-27B repackagings deep.

**Why it matters:** A dense **27B** under **Apache 2.0** placing top-10 against paid frontier entries is the clearest data point yet that the capability gap closed at the small end. I walked the full 24 GB build — quant selection, \`llama-server\` flags, router wiring — in [yesterday's deep-dive on running Qwen3.8-27B as a local coding agent](/notes/qwen3-8-27b-local-coding-agent-claude-code-2026). Parameter-count-equals-quality is done: Gemma 4 31B is 15% **larger** and 71 places worse.

**Source:** [Qwen/Qwen3.8-27B on Hugging Face](https://huggingface.co/Qwen/Qwen3.8-27B)

**Quick take:** If you run exactly one local model, this is still it. Tiel-Coder is the speed alternative, not the replacement.`,
    },
    {
      heading: "Xiaomi's AI Cube Puts 160 GB Behind 1.22 TB/s",
      content: `**What:** At its Xuanjie chip briefing on **August 24, 2026**, Xiaomi showed an **AI Cube** prototype — a three-chip mini-PC for local inference. **Xuanjie O3**: 3nm, **24 billion** transistors, 10-core all-big-core CPU to **4.35 GHz**, 16-core G2-Ultra NX GPU. **Xuanjie O100**: a 6nm AI accelerator using wafer-on-wafer 3D stacking for **28,672** effective data lines. **Xuanjie D100**: 3nm automotive-grade, supporting **160 GB** unified memory and models to **200B** params. System totals: **1.22 TB/s** near-memory bandwidth, **150 W** sustained, **330 tokens/sec**, demoed on a 120B-plus-3B configuration.

**Why it matters:** 1.22 TB/s at 150 W is Mac Studio M5 Ultra territory in a box aimed squarely at the NVIDIA GB10 segment. If local models are now good enough to matter, the bottleneck moves to memory bandwidth per watt per dollar — and that market just got a third serious entrant.

**Source:** [Gizmochina, Aug 24](https://www.gizmochina.com/2026/08/24/xiaomi-announces-ai-cube-mini-pc-with-xring-o3-o100-and-d100-to-run-llms-locally/) · [r/LocalLLaMA discussion](https://www.reddit.com/r/LocalLLaMA/comments/1vwvghi/xiaomi_ai_cube_announced_with_12tbs_memory/)

**Quick take:** No price, no date, engineering sample. Watch it; do not put it in a 2026 budget.`,
    },
    {
      heading: "What I'm Shipping With This Week",
      content: `I already run an Ornith model locally for small always-on jobs, so Tiel-Coder being an **Ornith-1.5-35B-A3B** fine-tune makes it the cheapest experiment on this list for me — the **MLX oQ4e** build drops into an Apple-Silicon stack I have already tuned.

The test I care about is not a benchmark: does the 35B-A3B answer **fast enough** that I stop context-switching while it works? Qwen3.8-27B is more accurate and slow enough that I tab away, which costs more than the accuracy gains. Roughly 3B active params should invert that.

The failure mode I expect, and the one no model card will tell you: MoE models under aggressive quantization degrade unevenly. A 22.4 GB Q4 that holds up on Python refactors can fall apart on a language thinly represented in the imatrix calibration set. So the plan is a small fixed suite of my own past commits, re-run against both models, before either goes near client work. That suite — not a leaderboard screenshot — is what justifies a routing table on a client [MVP build](/services/6-week-mvp).`,
    },
    {
      heading: 'Skip These',
      content: `**\`freestylefly/awesome-gpt-image-2\`** — **2,449 stars in a single day**, top of GitHub trending. It is a link list. Star velocity on curated-link repos measures submission timing, not whether anything was built.

**"Coding expertise is going to collapse from AI reliance"** (**502 points** on Hacker News) — a well-written version of an argument that has run monthly since 2023. No experiment, no dataset, nothing to do differently on Monday. The six items above each change a decision; this one changes a mood.`,
    },
    {
      heading: 'The Routing Table Is the Deliverable',
      content: `Week 35's through-line: model choice moved from a purchasing decision made once to an engineering decision made per call. Anthropic's own customers already made that shift with their wallets, and the tooling to act on it — cheap tiers 20× apart in one family, MIT quants that fit on a desk, hardware built for them — all landed in the same seven days.

Most teams I talk to still route everything to one expensive endpoint because that was correct in 2024 and nobody re-measured. Usually a two-day fix against a large recurring line item.

If you are building with any of this and hitting the wall between "the benchmark looked fine" and "it fails on our data," that gap is most of what I do — [see how the 6-week MVP works](/services/6-week-mvp), or [hire a founding engineer](/services/hire-founding-engineer-india) if you need someone inside the team.

Previously: [Models Day, stolen reasoning, and a $16,000 GPU](/notes/ai-dev-week-2026-33).`,
    },
  ],
  cta: {
    text: 'Ship an AI-integration MVP in 6 weeks',
    href: '/services/6-week-mvp',
  },
};
