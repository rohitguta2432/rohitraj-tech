import type { BlogPost } from '@/types/blog';

export const rtxPro5500Blackwell84gbLocalLlm2026: BlogPost = {
  slug: 'rtx-pro-5500-blackwell-84gb-local-llm-2026',
  title:
    'NVIDIA RTX PRO 5500 Blackwell: What Actually Fits in 84GB for Local LLMs (2026)',
  date: '2026-09-15',
  excerpt:
    'NVIDIA quietly listed the RTX PRO 5500 Blackwell: 21,760 CUDA cores, 84GB of ECC GDDR7, 600W, no price yet. The news sites stopped at the spec sheet. Here is the question that matters if you run models locally: what actually fits in 84GB, what still does not, and when a used A100 or the API is the smarter buy.',
  readingTime: '11 min read',
  keywords: [
    'rtx pro 5500 blackwell',
    'rtx pro 5500 84gb',
    'rtx pro 5500 local llm',
    'rtx pro 5500 vs rtx 5090',
    '84gb gpu llm inference',
    'rtx pro 5500 specs',
    'nvidia rtx pro 5500 vram',
  ],
  coverImage: {
    src: '/images/notes/rtx-pro-5500-blackwell-84gb-local-llm-2026-cover.jpg',
    alt: 'Massive glowing GPU die radiating memory lanes illustrating RTX PRO 5500 Blackwell 84GB local LLM capacity',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `NVIDIA quietly listed the **RTX PRO 5500 Blackwell Workstation Edition** around **September 12, 2026**: **21,760 CUDA cores** (the same GB202 count as a GeForce RTX 5090), **84GB of ECC GDDR7**, and a **600W** board power limit — with **no price or ship date announced**. For local LLM work, 84GB means a **70B model at FP8 fits on one card** with room for context, and ~120B-class MoE models fit at 4-bit — workloads that previously forced a 96GB RTX PRO 6000, a used 80GB A100, or a two-card split. Skip it if your daily driver is a 27B — a 32GB RTX 5090 already does that for far less money and 25% less power.`,
    },
    {
      heading:
        'RTX PRO 5500 Blackwell: What NVIDIA Actually Listed on September 12, 2026',
      content: `By [Rohit Raj](/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

NVIDIA did not hold an event for this one. Around **September 12, 2026** the [RTX PRO 5500 Blackwell product page](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5500/) appeared across NVIDIA's regional sites, [PNY listed the board](https://www.pny.com/nvidia-rtx-pro-5500-blackwell), and by September 14 [TechPowerUp](https://www.techpowerup.com/352678/nvidia-unveils-rtx-pro-5500-blackwell-workstation-gpu-with-84-gb-gddr7-memory), [VideoCardz](https://videocardz.com/newz/nvidia-introduces-rtx-pro-5500-blackwell-with-84gb-gddr7-and-600w-power-limit), and an r/LocalLLaMA top-of-day thread had picked it up.

The spec that matters is the memory: **84GB of ECC GDDR7** on a workstation card. That is 2.6x the 32GB on a GeForce RTX 5090, and it slots the card into a gap NVIDIA had left open — between the consumer flagship and the **96GB RTX PRO 6000 Blackwell** that anchors the pro line.

Every hardware site ran the same story: core count, memory size, power limit, "no price yet." Fair enough — that is the news. But if you build with local models, the spec sheet is not the question. The question is: **which models that did not fit on one card yesterday fit on one card now?** That arithmetic is what this post is about.`,
    },
    {
      heading: 'The Confirmed Specs — and the Two Numbers That Matter',
      content: `What NVIDIA's page and the launch coverage confirm:

| Spec | RTX PRO 5500 Blackwell |
|---|---|
| CUDA cores | 21,760 (GB202 die) |
| Memory | 84GB ECC GDDR7 |
| Board power | 600W |
| Cooling | Air- or liquid-cooled options |
| Form factor | Workstation Edition (also positioned for IT-managed racks) |
| Price / ship date | Not announced as of September 15, 2026 |

Source: [NVIDIA product page](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-5500/), [TechPowerUp](https://www.techpowerup.com/352678/nvidia-unveils-rtx-pro-5500-blackwell-workstation-gpu-with-84-gb-gddr7-memory).

Two numbers do all the work here:

**21,760 CUDA cores** — identical count to the consumer RTX 5090. NVIDIA is not selling you more compute than the gaming flagship; single-stream inference speed will land in the same neighborhood, because decode throughput on transformer inference is dominated by memory bandwidth, not core count.

**84GB** — this is the actual product. LLM inference is a memory-capacity game first and a bandwidth game second. Capacity decides *whether* a model runs at all; everything else decides how fast. 84GB moves the "runs at all" line past the two most common local model classes that 32GB cards lock you out of: dense 70B at FP8, and the ~120B-class sparse MoE checkpoints.`,
    },
    {
      heading: 'What Actually Fits in 84GB (the Sizing Math)',
      content: `The estimate that gets you within a gigabyte or two: **weights ≈ parameters × bytes per parameter**, then leave headroom for KV cache and activations — call it 8-12GB for real agent workloads with long context.

| Model class | Quant | Weights | Fits in 84GB? | Fits in 32GB (RTX 5090)? |
|---|---|---|---|---|
| Qwen3.8-27B | FP8 | ~27GB | Yes, with ~50GB spare | Barely — thin KV headroom |
| Dense 70B (Llama-class) | FP8 | ~70GB | **Yes — the headline win** | No |
| Dense 70B | Q4_K_M (~4.7 bpw) | ~41GB | Yes, huge context headroom | No |
| gpt-oss-120b (MoE) | MXFP4 | ~63GB | **Yes, single card** | No |
| ~120B dense | 4-bit | ~71GB | Yes, tight | No |
| DeepSeek V4.1 Flash | FP8 | 510GB checkpoint | No — not close | No |

Three rows worth reading twice:

**Dense 70B at FP8 on one card** is the practical unlock. On 32GB you run 70B only at aggressive ~3-bit quants with degraded quality, or you split across two cards and eat the complexity. At FP8 — the quant level where quality loss is close to free — the weights are ~70GB, leaving ~14GB for KV cache. That is a full-quality 70B coding or reasoning model, resident, on one board.

**gpt-oss-120b at MXFP4 is ~63GB** — it was built to fit an 80GB-class accelerator, which until now meant a data-center H100/A100 or the 96GB RTX PRO 6000. The 5500 becomes the cheapest new-silicon single-card home for it, with ~21GB left over for context.

**The bottom row is the reality check.** The current frontier of open weights — [DeepSeek V4.1 Flash's 510GB checkpoint](/notes/deepseek-v4-1-flash-hardware-requirements-2026) — does not care about your 84GB. The self-hosting floor there is an 8-GPU node. No workstation card changes that; I ran that math in [yesterday's post](/notes/deepseek-v4-1-flash-hardware-requirements-2026).`,
    },
    {
      heading: 'RTX PRO 5500 vs RTX 5090 vs RTX PRO 6000 vs Used A100',
      content: `The four cards a local-LLM builder would actually cross-shop in late 2026:

| | RTX 5090 | **RTX PRO 5500 Blackwell** | RTX PRO 6000 Blackwell | A100 80GB (used) |
|---|---|---|---|---|
| VRAM | 32GB GDDR7 | **84GB ECC GDDR7** | 96GB ECC GDDR7 | 80GB HBM2e |
| CUDA cores | 21,760 | **21,760** | 24,064 | 6,912 (Ampere) |
| Board power | 575W | **600W** | 600W | 300W (SXM/PCIe) |
| Biggest single-card dense model (FP8) | ~27B | **~70B** | ~90B | ~70B |
| ECC | No | **Yes** | Yes | Yes |
| Warranty / driver tier | Consumer | **Pro** | Pro | None (secondhand) |
| Price | Known, consumer | **Unannounced** | Known, very high | Falling, no support |

How to read it: the 5500 is NVIDIA closing the gap that used A100s were filling. An 80GB A100 has been the budget path to single-card 70B inference — no warranty, Ampere-generation compute, but the capacity. The 5500 offers more memory, current-generation Blackwell compute, ECC, and a warranty. Whether it kills the used-A100 play depends entirely on the price NVIDIA has not announced — and pricing quietly-listed pro cards high is NVIDIA's habit.

Against its own sibling: the RTX PRO 6000's extra 12GB and ~10% more cores matter at the margin (90B-class dense at FP8), but if the 5500 lands meaningfully cheaper, it becomes the default pro-card recommendation for LLM work, because almost nothing you would run locally lives in the 84-96GB gap.`,
    },
    {
      heading: 'Where It Actually Shines: Three Workflows',
      content: `**1. A resident 70B coding agent.** A 70B-class model at FP8 with 14GB of KV headroom is enough for a serious local coding assistant on a [Claude Code-style agent loop](/notes/qwen3-8-27b-local-coding-agent-claude-code-2026) — resident weights, no cold loads, no per-token API meter, and your code never leaves the box. This is the single most requested local-AI setup among the founders I work with, and until now it required either quality-degrading quants or a two-card rig.

**2. LoRA fine-tuning on 70B without a cloud bill.** QLoRA on a 4-bit 70B base (~41GB weights) leaves ~40GB for optimizer state, activations, and batch — single-card fine-tuning of a 70B on your own data becomes a desk job. On 32GB cards this workflow tops out around 27B-32B bases.

**3. Multi-model serving for a small team.** 84GB holds a 27B generalist (FP8, ~27GB) plus a 32B coder (4-bit, ~19GB) plus embedding and reranker models simultaneously, with KV room for concurrent users. One IT-managed box — NVIDIA's own positioning for this card is centralized workstation racks — serving a 5-15 person team's entire local-AI stack.`,
    },
    {
      heading: 'When to Skip It',
      content: `**Your daily model is ≤32B.** A 27B at FP8 is ~27GB — an RTX 5090 already runs it, at consumer pricing and 575W. Buying 84GB to run 27B models is buying empty VRAM.

**600W is a real constraint.** This is a 600W board. With a workstation CPU, drives, and fans you are speccing a 1000W+ PSU and dealing with the heat of a small space heater under your desk. The liquid-cooled variant exists for a reason. Budget the electricity too: at 8 hours a day of loaded inference, 600W is roughly 1,750 kWh a year.

**The price is unannounced — and that is information.** NVIDIA quietly listing a pro card with no MSRP usually precedes a number aimed at procurement departments, not enthusiasts. If the 5500 lands near RTX PRO 6000 territory, the used-A100 or dual-5090 math wins for most individuals.

**Frontier open weights still will not fit.** If the goal is running [DeepSeek V4.1 Flash-class models](/notes/deepseek-v4-1-flash-hardware-requirements-2026), no single card ships that. The honest alternatives remain cache-hit API pricing or multi-GPU nodes — 84GB moves the line, it does not remove it.`,
    },
    {
      heading: "How I'd Ship This in Production",
      content: `If a client dropped a 5500-equipped box on my desk tomorrow, the wiring that turns it from a benchmark toy into infrastructure:

**Serve with vLLM or SGLang, not a desktop app.** Continuous batching and paged KV cache are what make 84GB serve a team instead of one chat window. Pin the model at FP8, cap \`max-model-len\` to what your KV budget actually supports, and expose an OpenAI-compatible endpoint so every internal tool speaks to it unchanged.

**Put a gateway in front on day one.** Auth, per-user rate limits, request logging, and a fallback route to a cloud API for overflow or downtime. Local-first does not mean local-only; the box will reboot for driver updates eventually, and your team's tooling should not notice.

**Watch the two failure modes 84GB invites.** First, KV creep: agent workloads with 100k+ contexts quietly eat the headroom and trigger preemption storms — set \`gpu-memory-utilization\` conservatively (0.90, not 0.97). Second, thermal throttling on the air-cooled variant under sustained batch load — log \`nvidia-smi\` clocks for the first week before trusting your latency numbers.

**Measure against the API before committing the workload.** One card, ~600W, and a five-figure invoice buys a fixed capacity. The break-even against per-token pricing depends on your actual daily token volume — run two weeks of production traffic through both and let the meter decide. Half my consulting engagements that start as "help us self-host" end as "help us hybrid" once that number is on a whiteboard.`,
    },
    {
      heading: 'FAQ',
      content: `**Q: Can the RTX PRO 5500 Blackwell run a 70B LLM on a single card?**
Yes — that is its headline capability for local AI. A dense 70B at FP8 needs ~70GB for weights, which fits in 84GB with ~14GB left for KV cache and activations. On 32GB consumer cards the same model requires aggressive ~3-bit quantization or a two-card split.

**Q: What is the RTX PRO 5500 Blackwell's price?**
Unannounced as of September 15, 2026. NVIDIA listed the card quietly with no MSRP and no ship date; PNY's product page is live without pricing. Historically, quietly-listed pro cards land at procurement-tier prices.

**Q: Is the RTX PRO 5500 faster than an RTX 5090 for LLM inference?**
Roughly comparable per stream, not dramatically faster — both carry 21,760 CUDA cores on the GB202 die, and decode speed is memory-bandwidth-bound. The 5500's advantage is capacity: it runs model sizes and batch/context configurations the 5090's 32GB cannot hold at all.

**Q: RTX PRO 5500 vs used A100 80GB — which for local LLMs?**
The 5500 wins on memory (84 vs 80GB), compute generation (Blackwell vs Ampere), ECC-with-warranty, and driver support; the used A100 wins on price today and 300W power draw. Until NVIDIA announces the 5500's price, the A100 remains the budget answer and the 5500 the supported one.

**Q: Does 84GB let me run DeepSeek V4.1 Flash locally?**
No. The V4.1 Flash checkpoint is 510GB — the self-hosting floor is a multi-GPU node regardless of this card. See the full memory breakdown in [DeepSeek V4.1 Flash Hardware Requirements](/notes/deepseek-v4-1-flash-hardware-requirements-2026).`,
    },
    {
      heading: 'Sizing a Local-AI Box for Your Team?',
      content: `The spec sheet is the easy part. The decisions that bite are quant level vs quality, KV budget vs context length, one big card vs two consumer cards, and self-host vs API at your actual token volume — the arithmetic above, applied to your workload.

That is the work I do as a hands-on consultant: I have shipped local and hybrid LLM inference for teams that could not send data to an API, and [29 production AI products](/projects) overall. If you are speccing hardware for a local coding agent, a fine-tune pipeline, or a team inference box, I will size it against your real traffic before you spend five figures on silicon — [book a call](/hire), or start with a [6-week MVP](/services/6-week-mvp) if the model choice is still open. For agent-stack rollouts on top of that box, see [Claude Code team rollouts](/services/claude-code-consultant). If the box has to live inside your own network and someone has to sit with your team until it actually serves production traffic, that engagement is a [forward deployed engineer](/services/forward-deployed-engineer) — available [fractionally](/services/fractional-forward-deployed-engineer) when you do not need a full-time hire.`,
    },
  ],
  cta: {
    text: 'Size your local-AI build with me',
    href: '/hire',
  },
};
