import type { BlogPost } from '@/types/blog';

export const deepseekDsparkSpeculativeDecodingLlamacpp2026: BlogPost = {
  slug: 'deepseek-dspark-speculative-decoding-llamacpp-2026',
  title:
    'DeepSeek DSpark in llama.cpp: How to Get 2x Local Inference on V4-Flash-0731 (2026)',
  date: '2026-08-03',
  excerpt:
    "llama.cpp merged DeepSeek V4 DSpark support on August 2, 2026 — the docs still say Qwen3-only. Here are the actual flags, the measured 39.95 to 79.93 tokens/sec jump, why the config with the higher acceptance rate is the slower one, and the RAM you need before any of it matters.",
  readingTime: '12 min read',
  keywords: [
    'deepseek dspark speculative decoding',
    'dspark llama.cpp',
    'deepseek v4 flash 0731',
    'llama.cpp speculative decoding guide',
    'spec-type draft-dspark',
    'deepseek v4 flash vram requirements',
    'local llm speculative decoding 2026',
  ],
  relatedProject: 'myFinancial',
  coverImage: {
    src: '/images/notes/deepseek-dspark-speculative-decoding-llamacpp-2026-cover.jpg',
    alt: 'Swarm of luminous particles surging ahead of a dense glowing core illustrating DSpark speculative decoding for local LLM inference',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `**llama.cpp merged DeepSeek V4 DSpark support on August 2, 2026** ([PR #25784](https://github.com/ggml-org/llama.cpp/pull/25784), merge commit \`596a579\`) — three days after DeepSeek shipped [V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) under MIT. On the maintainer's own benchmark, DSpark cut wall time from **102.15s to 55.95s (1.83x)**, and one user measured **39.95 to 79.93 tokens/sec**. The flags are \`--spec-type draft-dspark --spec-draft-n-max 5 --fit off\`. Skip it if you have under ~110 GB of combined RAM plus VRAM — the smallest usable quant is 103 GB before the draft model.`,
    },
    {
      heading: 'llama.cpp Just Got 2x Faster on DeepSeek V4 — and the Docs Have Not Caught Up',
      content: `By [Rohit Raj](/en/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

On **August 2, 2026**, maintainer \`am17an\` merged [PR #25784, "DeepseekV4 MTP + DSpark"](https://github.com/ggml-org/llama.cpp/pull/25784) into llama.cpp master. It landed exactly two days after DeepSeek released **DeepSeek-V4-Flash-0731** — a 284B-parameter mixture-of-experts model with **13B active parameters per token** and a **1M-token context window**, published under the **MIT license** ([release coverage](https://www.marktechpost.com/2026/07/31/deepseek-upgrades-deepseek-v4-flash-0731-with-major-agentic-and-coding-gains/)).

The capability that changed is speculative decoding. The 0731 checkpoint ships with a **DSpark drafter module attached to the weights** — you do not train anything, you do not pick a smaller sibling model to act as the draft. It is in the box. And as of two days ago, llama.cpp can use it.

Here is why the timing matters and why you probably have not read this anywhere else: llama.cpp's own [\`docs/speculative.md\`](https://github.com/ggml-org/llama.cpp/blob/master/docs/speculative.md) still states *"Currently only drafts with a Qwen3 backbone are supported."* That was true on July 28. It stopped being true on August 2. Every DSpark guide currently ranking on Google was published in June or early July — before either merge — so they all document the vLLM and SGLang paths and none of them carry a working llama.cpp invocation. That gap is what this post fills.`,
    },
    {
      heading: 'What Is DSpark, and How Is It Different From MTP?',
      content: `Speculative decoding solves one specific bottleneck: **generating one token requires a full forward pass through the model, and a full forward pass on a 284B MoE is memory-bandwidth-bound, not compute-bound**. You are paying to stream weights, and you get exactly one token for it. Speculative decoding has a cheap *drafter* guess several tokens ahead, then has the big model verify all of them in a single pass. Guesses that survive verification are free.

The methods differ in *how* they guess.

**MTP (Multi-Token Prediction)** bolts extra prediction heads onto the main model. Each head predicts one future position. They are independent — head 3 does not know what head 2 chose. In llama.cpp this is \`--spec-type draft-mtp\`.

**DFlash** uses a block-diffusion draft model that emits an entire block per forward pass instead of one token at a time.

**DSpark** — released June 27, 2026 by DeepSeek with PKU as *"Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation"* — extends DFlash. Per the llama.cpp docs, the draft *"still emits a whole block per forward pass, but each block position's logits are biased by a low-rank term keyed on the previous token, chained in-graph across the block."*

In plain terms: DFlash guesses five tokens that do not know about each other. DSpark guesses five tokens where **each one gets a nudge based on what the previous one turned out to be** — recovering left-to-right signal without paying for five separate draft passes. That is the whole trick, and it is why acceptance improves without the drafter getting slower.

One critical detail for the 0731 checkpoint: **it ships DSpark only.** MTP was in earlier V4 checkpoints. If you are on 0731 and reaching for \`--spec-type draft-mtp\`, you are reaching for a head that is not there.`,
    },
    {
      heading: 'What Actually Shipped: The Five-Week Timeline',
      content: `Four separate releases stacked up here, and conflating them is how people end up with the wrong flags.

| Date (2026) | What shipped | Where |
|---|---|---|
| Jun 27 | DSpark method + DeepSpec training repo published | DeepSeek / PKU |
| Jul 28 | \`--spec-type draft-dspark\` merged into llama.cpp — **Qwen3 backbones only** | [PR #25173](https://github.com/ggml-org/llama.cpp/pull/25173) by \`wjinxu\` |
| Jul 31 | DeepSeek-V4-Flash-0731 released, MIT, DSpark module attached | [Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) |
| **Aug 2** | **DeepSeek V4 added as a DSpark target** | [PR #25784](https://github.com/ggml-org/llama.cpp/pull/25784) by \`am17an\` |

PR #25173 is the one every existing article is implicitly describing, and its numbers are the ones that got quoted everywhere: on **Qwen3-8B bf16, DSpark hit 1.88x overall decode speedup**, beat the already-merged DFlash on **all 11 benchmark categories** (1.21x overall), and reached **4.06x on GSM8K**.

That GSM8K figure is where the "400% faster" headlines came from. Treat it as a ceiling, not a forecast — GSM8K output is arithmetic-heavy and unusually predictable, which is exactly the condition speculative decoding likes best. Your prose and your code generation will not look like GSM8K.

The model itself is a genuine jump on agentic work, which is the reason to bother running it locally at all. **Terminal Bench 2.1 went from 61.8 on the V4-Flash preview to 82.7 on 0731**; NL2Repo from 39.4 to 54.2; DeepSWE from 7.3 to 54.4. It also beats V4-Pro-Preview (72.1 / 38.5 / 12.8) on all three despite a far smaller activated parameter count. Elsewhere: Cybergym 76.7, Toolathlon-Verified 70.3.

(One housekeeping note: published total-parameter figures for this checkpoint vary slightly between listings — 284B is the widely reported number, some model listings show closer to 304B. The **13B active per token** figure is consistent everywhere, and active params are what govern your generation speed.)`,
    },
    {
      heading: 'How Do You Enable DSpark in llama.cpp?',
      content: `You need llama.cpp built from master at or after merge commit \`596a579\` (August 2, 2026). Nothing older has the DeepSeek V4 target.

\`\`\`bash
# 1. Build from master — the merge is newer than any tagged release
git clone https://github.com/ggml-org/llama.cpp && cd llama.cpp
cmake -B build -DGGML_CUDA=ON
cmake --build build --config Release -j

# 2. Pull the target model (3-bit is the smallest usable quant)
huggingface-cli download unsloth/DeepSeek-V4-Flash-0731-GGUF \\
    --include "UD-IQ3_XXS/*" --local-dir ./models

# 3. Serve with DSpark speculative decoding
./build/bin/llama-server \\
    --model ./models/UD-IQ3_XXS/DeepSeek-V4-Flash-0731-UD-IQ3_XXS-00001-of-00003.gguf \\
    --model-draft ./models/DeepSeek-V4-Flash-0731-DSpark-draft.gguf \\
    --spec-type draft-dspark \\
    --spec-draft-n-max 5 \\
    --fit off \\
    --ctx-size 32768 \\
    --temp 1.0 --top-p 1.0 --min-p 0.0 \\
    -fa on --jinja
\`\`\`

Four flags do the work, and three of them have a gotcha:

- **\`--spec-type draft-dspark\`** — selects the method. llama.cpp exposes 11 \`--spec-type\` values; \`draft-dspark\`, \`draft-dflash\`, \`draft-eagle3\` and \`draft-mtp\` are the model-backed ones, the rest are n-gram heuristics.
- **\`--spec-draft-n-max 5\`** — draft block size. The default is **3**, and the value is **clamped to the draft model's trained block size**. For the V4 DSpark drafter that is 5; the published Qwen3 drafters are \`block7\`, which is why every Qwen3 example you will find online says \`7\`. Copying \`7\` here silently gets you 5.
- **\`--fit off\`** — required. Multiple users on the PR thread report DSpark failing without it. This is not in the docs.
- **\`-fa on\`** — flash attention, effectively mandatory at this model size.

If you are building for a **multi-GPU** rig, PR commenters also report needing to raise \`GGML_SCHED_MAX_SPLIT_INPUTS\` at compile time. On single-GPU or unified-memory Macs you can ignore it.

Serving on vLLM instead? DSpark needs **vLLM 0.25.0** minimum (ROCm support landed in 0.26.0) and the config is JSON rather than flags — \`--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'\` alongside \`--tokenizer-mode deepseek_v4\` and \`--kv-cache-dtype fp8\` ([vLLM recipe](https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash)).`,
    },
    {
      heading: 'Why the Config With the Higher Acceptance Rate Is the Slower One',
      content: `This is the part that will save you an afternoon, and I have not seen it written down anywhere.

The PR benchmarks report both methods on the same hardware and same target model:

| Config | Flag | Aggregate acceptance rate | Wall time | Speedup |
|---|---|---|---|---|
| No speculation | — | — | 102.15s | 1.00x |
| MTP | \`--spec-draft-n-max 2\` | **0.6509** | 66.9s | 1.53x |
| DSpark | \`--spec-draft-n-max 5\` | **0.4642** | **55.95s** | **1.83x** |

MTP accepts **65%** of its drafted tokens. DSpark accepts **46%**. And DSpark is decisively faster.

If you tune on acceptance rate — which is the metric every speculative-decoding dashboard puts front and center — you will pick MTP and lose 20% of your throughput.

The resolution is that **acceptance rate is a ratio, not a throughput. What you actually care about is accepted tokens per verification pass**, and that is acceptance rate multiplied by block size:

- MTP: \`2 x 0.6509\` = **1.30 tokens** per verify pass
- DSpark: \`5 x 0.4642\` = **2.32 tokens** per verify pass

DSpark produces roughly **1.8x more usable tokens per expensive forward pass**, which lines up with the observed 1.83x wall-clock speedup almost exactly. A separate user on the same thread measured the end-to-end effect as **39.95 tokens/sec baseline to 79.93 tokens/sec with DSpark** — a clean 2.0x.

Practical rule: when you compare speculative configs, **always multiply acceptance rate by \`--spec-draft-n-max\` before you compare anything**. A drafter that guesses more aggressively and is wrong more often can still win, and usually does.

There is a knob for the opposite direction too — \`--spec-draft-conf-min P\` truncates a drafted block at the first position whose predicted acceptance falls below \`P\` (default 0, disabled). Raising it trades raw block size for fewer wasted verifications. Worth testing at high concurrency, not worth touching for single-user local inference.`,
    },
    {
      heading: 'How Much VRAM Do You Need for DeepSeek V4 Flash 0731?',
      content: `None of the above matters if the weights do not fit. This is a 284B model, and the honest answer is that it is a **server-class or workstation-class model**, not a gaming-GPU model.

From the [Unsloth quantization docs](https://unsloth.ai/docs/models/deepseek-v4):

| Quantization | File size | Minimum combined RAM + VRAM |
|---|---|---|
| 1-bit | — | 92 GB |
| 2-bit | — | 102 GB |
| **3-bit (UD-IQ3_XXS)** | **103 GB** | **110–135 GB** |
| 4-bit (UD-Q4_K_XL) | 155.1 GB | 162 GB |
| Q8_K_XL (near-lossless) | 161.9 GB | 169 GB |

Three things people get wrong here:

1. **The draft model is additional.** Every table above is the target model only. The DSpark drafter is small relative to a 284B target, but it is not free, and it occupies memory for the entire session. Budget headroom above the numbers in that table, not exactly the numbers in that table.
2. **KV cache at 1M context is not optional overhead — it is the dominant term.** The 1,048,576-token context is a headline feature; actually filling it will cost you more memory than the weight delta between 3-bit and 4-bit. Start at \`--ctx-size 32768\` and grow it deliberately.
3. **Combined RAM plus VRAM is the real constraint on llama.cpp**, not VRAM alone — offload works. A 128 GB unified-memory Mac Studio or a 2x RTX 6000-class box with plenty of system RAM are both viable at 3-bit. A 24 GB consumer card is not, at any quant.

Sampling settings that matter: DeepSeek recommends **temperature 1.0 and top-p 1.0**, dropping top-p to **0.95 for agentic use**. Do not port your Llama sampler settings over — this model is calibrated differently and will degrade noticeably at low temperature.

The 0731 checkpoint also introduces **three reasoning effort levels** — \`low\`, \`high\`, and \`max\` — and allows up to **384K output tokens** at the high and max settings. Higher effort means more generated reasoning tokens, which means speculative decoding matters *more*, not less, since you are paying for a much longer generation.`,
    },
    {
      heading: 'DSpark vs MTP vs DFlash vs EAGLE-3: Which Should You Actually Use?',
      content: `llama.cpp now supports four model-backed speculative methods plus a family of n-gram heuristics. Choosing between them is mostly a question of what ships with your target model.

| | DSpark | MTP | DFlash | EAGLE-3 | n-gram (\`ngram-mod\`) |
|---|---|---|---|---|---|
| Flag | \`draft-dspark\` | \`draft-mtp\` | \`draft-dflash\` | \`draft-eagle3\` | \`ngram-mod\` |
| Needs a separate draft file | Yes | No (heads in model) | Yes | Yes | No |
| Drafts per forward pass | Whole block (5–7) | 1 per head | Whole block | 1 | Block from cache |
| Cross-position conditioning | **Yes** (Markov head) | No | No | Sequential | N/A |
| Available on V4-Flash-0731 | **Yes** | No | No | No | Yes |
| Measured on V4 target | **1.83x** | 1.53x (older ckpt) | — | — | Varies |
| Setup cost | Download drafter | Zero | Download + convert | Download + convert | Zero |

For **DeepSeek-V4-Flash-0731 specifically the decision is already made**: DSpark is the only model-backed option in the box, it is merged, and it is the fastest of the two configs anyone has benchmarked on this target.

For **Qwen3 targets**, DSpark is also the current best — PR #25173 showed it beating the merged DFlash on 11 of 11 categories. Use \`--spec-draft-n-max 7\` there, since the published drafters are \`block7\`.

For **anything else**, \`--spec-default\` (which enables \`ngram-mod\`) costs nothing and needs no extra download. The docs note that **MoE models require long drafts** while dense models can run with reduced \`--spec-ngram-mod-n-min\` and \`--spec-ngram-mod-n-max\` — a detail worth honoring if you are on a dense model and wondering why n-gram speculation is not helping.`,
    },
    {
      heading: 'When to Skip All of This: The API Break-Even Math',
      content: `I would not run this locally for most workloads, and the arithmetic is not close.

DeepSeek's own API prices V4-Flash at **$0.14 per million input tokens on a cache miss**, **$0.0028 per million on a cache hit**, and **$0.28 per million output tokens**, with a **2,500 concurrency limit**. That cache-hit price is a 50x discount, and it lands on exactly the workload shape that agentic tools produce — long stable system prompts and repeated context.

Set that against local: you need **110 GB minimum** of combined memory for a 3-bit quant that is measurably worse than the served checkpoint, plus the electricity, plus the hours you will spend on \`--fit off\`-class problems that no error message explains.

At $0.28 per million output tokens, **$50 buys you roughly 178 million output tokens**. Against a workstation that clears $110 GB of memory, you are looking at years of API usage before hardware breaks even on cost alone.

**Run it locally when the reason is not cost:**

- **Data cannot leave your network.** This is the real one. Healthcare, legal, financial, defense — an MIT-licensed 284B model you can audit and air-gap is a genuinely different product from an API endpoint, and no price comparison applies.
- **You need determinism across time.** An API model can be updated underneath you. A GGUF on your disk cannot.
- **Your workload is bursty and long.** 384K output tokens at max effort, run overnight, on hardware you already own.
- **You are studying the model, not using it.** Logit access, sampler experiments, drafter swaps.

**Skip it if** you are under 110 GB of memory, if your workload is spiky and low-volume, or if you are chasing throughput on a budget — the API at $0.28 per million output is cheaper than almost anything you can build.`,
    },
    {
      heading: 'How I Would Ship This in Production',
      content: `The failure mode I would actually plan for is not speed. It is that **speculative decoding changes your latency distribution, not just your latency**.

Acceptance rate is content-dependent. Boilerplate, structured JSON and repetitive code accept at a high rate and fly. Novel prose, unusual identifiers and genuinely hard reasoning accept at a low rate and fall back toward baseline speed. So your p50 improves by close to 2x and your **p99 barely moves**. If you have an SLO written against p99 latency, DSpark will look like it did nothing, and someone will conclude the feature is broken. Instrument accepted-tokens-per-verify-pass per request from day one, not just tokens per second — otherwise you cannot tell "speculation is off" from "this prompt is just hard."

Three more things I would wire before calling it production:

**1. Pin the commit, not the branch.** This landed on master on August 2 and there is no tagged release containing it as I write this. Pin \`596a579\` in your Dockerfile. A build that silently follows master will one day rebuild against a refactor of exactly this code path, and the failure will look like a model problem.

**2. Health-check the speculation path separately.** \`--fit off\` being required is an undocumented, empirically discovered constraint. A config change six months from now that drops that flag will not crash — it will quietly cost you half your throughput. Assert on the acceptance-rate metric in your smoke test, not just on HTTP 200.

**3. Keep the API as a live fallback, not a disaster-recovery plan.** The pattern I have used on client work is a router that sends bulk and cacheable traffic to the API where the cache-hit price is $0.0028 per million, and sends only the must-stay-local traffic to the local box. That is also how I would approach it on [an MVP build](/en/services/6-week-mvp): local inference is a compliance feature, and treating it as a cost optimization is how projects end up with a $15,000 workstation running at 4% utilization.

The thing I would genuinely build with this: a **repo-wide refactoring agent** that runs overnight. Terminal Bench 2.1 at 82.7 and DeepSWE at 54.4 mean the model is credible at multi-step tool use, the 1M context means an entire mid-size repo fits in one window, and 384K output tokens at max effort means it can actually write the diffs. At API prices that is a rounding error; the reason to run it locally is that most companies will not send their whole codebase to an inference provider. That is the workload where all three of this model's properties line up at once — and DSpark is what makes an overnight run finish before morning.`,
    },
    {
      heading: 'Get This Wired Into Your Stack Without the Undocumented Flags',
      content: `Speculative decoding is a rare free lunch — same weights, same outputs, roughly half the wall time — but the gap between "merged in master" and "running reliably in your stack" is measured in undocumented flags, pinned commits and metrics nobody told you to collect.

If you are building a product on local or hybrid inference and you would rather not spend two weeks discovering \`--fit off\` yourself, that is the kind of integration work I do. I ship [production MVPs in 6 weeks](/en/services/6-week-mvp), including the AI-integration layer — routing, fallbacks, cost controls and the observability that tells you when your speculation path quietly turned itself off.

For teams that need that capability in-house rather than as a one-off build, I also work as a [founding engineer](/en/services/hire-founding-engineer-india) — same work, embedded in your team, with the runbooks left behind.`,
    },
  ],
  cta: {
    text: 'Ship your AI integration in 6 weeks',
    href: '/en/services/6-week-mvp',
  },
};
