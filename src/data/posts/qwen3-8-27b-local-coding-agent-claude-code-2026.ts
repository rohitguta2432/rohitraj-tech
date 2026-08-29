import type { BlogPost } from '@/types/blog';

export const qwen3827bLocalCodingAgentClaudeCode2026: BlogPost = {
  slug: 'qwen3-8-27b-local-coding-agent-claude-code-2026',
  title:
    'Qwen3.8-27B as Your Local Coding Agent: 24GB Setup, Quant Pick, and Claude Code Wiring (2026)',
  date: '2026-08-24',
  excerpt:
    'Qwen3.8-27B is the first Apache-2.0 model that scores 61.7 on SWE-bench Pro and still fits on one 24GB GPU. Here is the working-developer build: which of the 790 GGUF quants to actually download (with KL-divergence data), the llama-server flags that matter, wiring it into Qwen Code natively and Claude Code through a router, the cost math against a cloud agent subscription, and the context-window ceiling nobody puts in the headline.',
  readingTime: '14 min read',
  keywords: [
    'qwen3.8-27b local coding agent',
    'qwen3.8 27b claude code',
    'qwen3.8-27b gguf which quant',
    'run qwen3.8 27b locally',
    'qwen3.8-27b vram requirements',
    'local llm coding agent 2026',
    'qwen3.8-27b vs claude code',
  ],
  coverImage: {
    src: '/images/notes/qwen3-8-27b-local-coding-agent-claude-code-2026-cover.jpg',
    alt: 'Glowing silicon chip with a neural lattice rising from it illustrating the Qwen3.8-27B local coding agent setup',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `**Qwen3.8-27B** (released **August 14, 2026**, **Apache 2.0**) is a dense 27B model that scores **61.7 on SWE-bench Pro** and **73.0 on Terminal-Bench 2.1** — and its Q4 GGUF runs on a single **24GB GPU** at **72–95 tokens/sec**. Wire it to **Qwen Code** natively or to **Claude Code** through an Anthropic-to-OpenAI router, and you have a $0-per-token coding agent. Download **unsloth UD-Q4_K_XL (17.92GB)** on 24GB cards, **AtomicChat IQ3_S (13.8GB)** on 16GB. Skip it if your work needs 100K+ context per task — the KV cache, not the weights, is the real ceiling.`,
    },
    {
      heading:
        'Qwen3.8-27B as a Local Coding Agent: What Changed on August 14',
      content: `By [Rohit Raj](/en/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

The interesting number on the [Qwen3.8-27B model card](https://huggingface.co/Qwen/Qwen3.8-27B) is not the benchmark headline. It is the intersection of three facts that have never been true of one model at the same time: **61.7 on SWE-bench Pro**, a **17.92GB** 4-bit file, and an **Apache 2.0** license. Agentic-coding scores in that range belonged to cloud models you rent per token; models that fit a single consumer GPU used to top out as autocomplete. Alibaba's Qwen team released the model on **August 14, 2026**, and ten days later it sits at **#1 trending on Hugging Face** with **790 quantized derivatives** already published.

The community reaction tells you where the value is. On r/LocalLLaMA, the top posts of the past days are not demos — they are [quantization comparisons](https://www.reddit.com/r/LocalLLaMA/comments/1vwh3u7/we_quantized_qwen_38_27b_and_compared_the_quants/) and a plain [thank-you thread](https://www.reddit.com/r/LocalLLaMA/comments/1vwowbu/qwen_38_27b_just_wanted_to_say_thanks_to_y/). People are not asking whether to run it. They are asking **which file to download and what to plug it into**.

That second question is the one this post answers end to end. The setup guides published since launch stop at "it runs" — a chat window and a benchmark table. A coding *agent* is a different deployment: it needs an OpenAI-compatible server, a harness that can edit files and run tests, sampling settings tuned for tool calls rather than prose, and enough KV-cache headroom that the session does not fall over at the exact moment the agent finally understands your repo. I have run local models inside agent harnesses since [VibeThinker-3B](/en/notes/vibethinker-3b-tiny-reasoning-model-guide-2026), and the gap between "runs locally" and "works as an agent" is where every local setup actually fails.`,
    },
    {
      heading: 'What Qwen3.8-27B Actually Ships',
      content: `The spec sheet, from the [official model card](https://huggingface.co/Qwen/Qwen3.8-27B):

- **Dense 27B** — not a MoE. Every parameter is active on every token, which is why the quality-per-gigabyte is so high after quantization. Compare [DeepSeek V4-Flash's 284B/13B-active MoE](/en/notes/deepseek-v4-flash-vision-exp-api-guide-2026): brilliant per-dollar over an API, hopeless on a consumer card.
- **Hybrid attention** — 64 layers arranged as 16 blocks of \`3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)\`. Only a quarter of the layers carry full attention, which cuts KV-cache growth to roughly **256KB per token** — the design decision that makes long agent sessions feasible at all.
- **262,144-token native context**, extensible to 1M with YaRN.
- **Flexible thinking control** via a \`reasoning_effort\` parameter — you can dial reasoning depth per request, which matters when an agent makes forty tool calls and you do not want a thinking block on each one.
- **Native vision** with a separate ~0.93GB projector file — optional for a coding agent, useful if you want it reading screenshots of broken UI.
- **Benchmarks**: 61.7 SWE-bench Pro, 73.0 Terminal-Bench 2.1, 90.3 LiveCodeBench v6, 89.2 GPQA Diamond, 84.3 OSWorld.

Two honest caveats on those numbers. First, they are the Qwen team's own runs at full precision with tuned harnesses — your Q4 quant driving a generic agent will land lower. Second, Terminal-Bench 73.0 is impressive *for the weight class*; frontier cloud models score in the high 80s, as I covered in the [Week 33 roundup](/en/notes/ai-dev-week-2026-33). The claim worth testing is not "frontier at home." It is "good enough that the marginal token is free."`,
    },
    {
      heading: 'Which Qwen3.8-27B GGUF Should You Actually Download?',
      content: `There are **790 quantized versions** on Hugging Face and at least four serious publishers — unsloth, lmstudio-community, ggml-org, and AtomicChat. They are not interchangeable, and for once we have real data instead of vibes: AtomicChat's founder [KL-divergence-tested 36 quant files](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/65) on 4× RTX 5090 against an 88GB BF16 logits reference (context 4096, 87 held-out chunks).

The findings that should drive your download:

| Your VRAM | Download | Size | Evidence |
|---|---|---|---|
| 24GB (RTX 3090/4090) | unsloth **UD-Q4_K_XL** | 17.92GB | Best context headroom at Q4 quality; Ollama's default \`q4_K_M\` (18GB) is equivalent quality, less headroom |
| 16GB | AtomicChat **AD-IQ3_S** | 13.8GB | **92.4% top-1 agreement** with BF16; unsloth's Q3_K_M at similar size measured **0.0484 KLD vs 0.0325** — publisher choice matters most in this band |
| 32GB+ | lmstudio-community **Q6_K** | 22.4GB | Above 25GB "all publishers agree within noise" — buy fidelity, not brand |
| Under 12GB | unsloth UD 2-bit — but reconsider | ~9–11GB | Quality "degrades fast below 10GB": IQ1_M (8.5GB) drops to **76.3% top-1**. For an agent that edits your code, that is too much drift |

The meta-lesson from the data: in the 12–21GB band the *publisher's* quantization recipe moves quality as much as the quant level itself, and above 25GB nobody's recipe matters. Nobody's launch-week guide tells you that, because it is only visible when someone pays for the comparison run.

One more number before you pick small: the weights are only half the budget. At ~256KB per token of KV cache, a 32K-token agent session adds **~8GB** on top of the model file, and the full 262K context would add **~67GB** — more than the weights themselves. Size your quant so the *context* fits, not just the file.`,
    },
    {
      heading: 'What Hardware Do You Actually Need?',
      content: `The honest budget line by tier, combining the file sizes above with the ~256KB-per-token KV cost:

**24GB GPU (RTX 3090 / 4090) — the sweet spot.** UD-Q4_K_XL (17.92GB) plus a 16K session (~4GB KV) fits fully resident with room for the OS. Push to 32K by quantizing the KV cache (\`--cache-type-k q8_0 --cache-type-v q8_0\` roughly halves it) or by spilling cache to system RAM with \`--no-kv-offload\` — at a latency cost you will feel on long prompts. A used 3090 at ~$700 remains the best price-per-agent-hour in 2026; the 4090 buys you **85–95 tokens/sec** versus the 3090's ~60s.

**16GB GPU (4060 Ti 16GB, 4080, A4000).** This is AD-IQ3_S territory (13.8GB, 92.4% top-1). It works — the KLD data says Q3 done well is closer to Q4 than its reputation — but you are down to ~2GB of headroom, so run 8–16K context and keep sessions file-scoped. Do not run Q4 partially offloaded to CPU; a fully-resident Q3 beats a split Q4 on both speed and consistency.

**Apple Silicon.** Unified memory changes the math: a 36GB M-series Mac holds Q4 plus generous context, and a 48GB machine runs Q6_K comfortably. Expect roughly 25–40 tokens/sec on M3/M4-class chips via llama.cpp's Metal backend or the MLX builds — half a 4090, still faster than you read diffs. The r/LocalLLaMA consensus matches what I see on my own 24GB MacBook: quality is identical, throughput is the tax, and for an agent that spends half its wall-clock running your test suite anyway, the tax is tolerable.

**System RAM matters too**: 32GB minimum if you use \`--no-kv-offload\`, and budget ~1GB extra for the vision projector (\`--mmproj\`, 0.93GB) if you load it. Below 16GB VRAM with no unified memory, stop — rent the capability instead. The comparison table below prices that path.`,
    },
    {
      heading: 'How Do You Wire It Into Qwen Code — and Into Claude Code?',
      content: `The stack is three layers: llama-server exposing an OpenAI-compatible API, a coding harness pointed at it, and sampling settings tuned for tool calls.

**Layer 1 — serve it.** Grab the GGUF from the table above and run [llama.cpp](https://github.com/ggml-org/llama.cpp)'s server (I covered llama.cpp's agent-relevant speedups in the [dspark speculative-decoding post](/en/notes/deepseek-dspark-speculative-decoding-llamacpp-2026)):

\`\`\`bash
llama-server -m Qwen3.8-27B-UD-Q4_K_XL.gguf \\
  --ctx-size 32768 --flash-attn \\
  --temp 0.7 --port 8080 --api-key localkey
# 32K ctx ≈ 8GB KV on top of the 17.92GB weights — fits 24GB
# with --no-kv-offload spilling cache to system RAM if tight.
# Ollama shortcut instead: ollama run qwen3.8 (q4_K_M, 18GB)
\`\`\`

**Layer 2a — Qwen Code (native path).** Qwen's own CLI harness speaks OpenAI-compatible endpoints directly:

\`\`\`bash
npm i -g @qwen-code/qwen-code
export OPENAI_BASE_URL=http://localhost:8080/v1
export OPENAI_API_KEY=localkey
export OPENAI_MODEL=qwen3.8-27b
qwen
\`\`\`

**Layer 2b — Claude Code (the path the launch guides skip).** Claude Code speaks the Anthropic Messages API, not OpenAI's — so it needs a translation layer. The community-standard bridge is [claude-code-router](https://github.com/musistudio/claude-code-router), which accepts Anthropic-format requests and forwards them to any OpenAI-compatible backend:

\`\`\`bash
npm i -g @musistudio/claude-code-router
# ~/.claude-code-router/config.json →
#   providers: [{ name: "local", api_base_url:
#     "http://localhost:8080/v1", models: ["qwen3.8-27b"] }]
ccr code   # launches Claude Code against the local model
\`\`\`

You keep Claude Code's harness — its file editing, permissions model, and skills — while the tokens are generated on your GPU. Expect rough edges: tool-call formats differ between model families, and long agentic chains are where the translation leaks. My honest recommendation is Qwen Code or OpenCode for daily local work, and the router path when your muscle memory and CLAUDE.md investment live in Claude Code.

**Layer 3 — sampling.** The model card says temperature 1.0 with thinking, 0.7 without. For agent work, run cooler: kingy.ai's lab settled on **0.2** for edit–test–repair loops, and my experience with local agents agrees — you want boring, deterministic tool calls, not creative ones. Set \`reasoning_effort\` low for routine calls and raise it only for planning steps.`,
    },
    {
      heading: 'Can a 27B Local Model Actually Replace a Cloud Coding Agent?',
      content: `For a specific, large slice of daily work — yes, and the economics are not close.

**Where it already wins.** Bounded, repo-local tasks: writing tests against existing patterns, mechanical refactors, wiring a new endpoint that mirrors an old one, commit-message and PR-description drafting, code review pre-passes. At **72–77 tokens/sec** (measured on AD-Q4_K_M) to **85–95 tokens/sec** on an RTX 4090, throughput is not the bottleneck — and the marginal cost of the 50th agent run of the day is a few watt-hours. This is also the only architecture where **the code never leaves the machine**: for client codebases under NDA — most of my consulting work — "local" is not a preference, it is a contract term.

**The cost math.** A cloud coding-agent subscription runs $20–$200/month, and heavy API-metered agent use clears $500/month easily. A used RTX 3090 costs ~$700; at 10 hours of agent time a week, the card pays for itself in months, then generates tokens at roughly the cost of ~350W of electricity — about **$0.05/hour** at typical rates. The cloud model is still smarter per request. It is not 100× smarter, and 100× is the price gap on heavy usage.

**Where the ceiling is.** Three places. Cross-cutting changes across a large codebase, where SWE-bench Pro's 61.7 versus a frontier model's 70s translates into real failed patches. Long-horizon sessions — on a 24GB card you realistically run 16–32K context, and an agent that has read fifteen files has already spent it; the cloud agent holding 200K context simply remembers things yours has evicted. And the [Hacker News thread "Why your local LLM feels dumber than it is"](https://forum.level1techs.com/t/why-your-local-llm-feels-dumber-than-it-is/253917) (417 points this week) is right about the cause: most disappointment with local models is misconfiguration — wrong chat template, truncated context, over-aggressive quant — not the weights. Budget an evening for tuning before you judge the model.`,
    },
    {
      heading: 'Qwen3.8-27B Local vs Claude Code Cloud vs API-Metered: The Comparison',
      content: `| | Qwen3.8-27B local | Claude Code (cloud sub) | DeepSeek V4-Flash API |
|---|---|---|---|
| Marginal cost/token | ~$0 (electricity) | Subscription-capped | $0.007–$0.66 per 1M |
| Agentic quality | SWE-bench Pro 61.7 (FP16 harness) | Frontier tier | Mid-high tier |
| Usable context in practice | 16–32K on 24GB VRAM | 200K+ | 1M |
| Privacy | Code never leaves machine | Vendor processes code | Vendor processes code |
| Works offline | Yes | No | No |
| Rate limits | None | Weekly caps | Provider throttles |
| Setup cost | 24GB GPU (~$700 used 3090) + an evening | Zero | Zero |
| License | Apache 2.0, yours forever | Terms of service | Terms of service |

The takeaway is not "one column wins." It is that the columns fail on different axes, which is exactly what makes a routing strategy work — the pattern I keep landing on in production, covered next.`,
    },
    {
      heading: 'Why Does It Feel Dumber Than the Benchmarks? The Misconfiguration Checklist',
      content: `That [417-point Hacker News thread](https://forum.level1techs.com/t/why-your-local-llm-feels-dumber-than-it-is/253917) exists because the same five mistakes keep shaving 20 benchmark points off local deployments. Before you conclude the model is overhyped, check these in order:

1. **Wrong chat template.** Qwen3.8 ships its template in the GGUF metadata; old llama.cpp builds and some UIs override it with a generic ChatML variant, which silently breaks tool-call formatting — the single worst failure for an agent. Use a llama.cpp build from after the model's release and do not pass a manual \`--chat-template\`.
2. **Silent context truncation.** Ollama defaults to a small context window regardless of what the model supports; when an agent's 20K-token session gets truncated to fit, it "forgets" files it just read and looks broken. Set \`num_ctx\` explicitly (or the \`OLLAMA_CONTEXT_LENGTH\` env) to match your planned session size.
3. **Thinking mode mismatched with sampling.** The card is explicit: temperature **1.0 with thinking, 0.7 without** — and agent harnesses want cooler still. Running thinking mode at 0.2 produces truncated, circular reasoning; running tool calls at 1.0 produces creative JSON. Pick one mode per lane and set its temperature.
4. **Over-quantized for the job.** If you grabbed the smallest file that fits, revisit the KLD table above — below 10GB the top-1 agreement falls off a cliff, and coding is the workload least tolerant of token drift.
5. **Missing \`--flash-attn\` or misloaded projector.** Both fail quiet: the first costs you memory and speed, the second makes vision requests return confident nonsense instead of an error.

Twenty minutes of checking beats a week of "local models are not there yet." They are — misconfigured ones are not.`,
    },
    {
      heading: 'When to Skip It — or Wait',
      content: `**Skip the local-agent build entirely if** your daily work is architecture-level changes across big codebases: the context ceiling plus the quality gap compounds, and you will spend more time re-prompting than the subscription costs. **Skip it if you don't own 16GB+ of VRAM** — below that you are in the IQ1/IQ2 band where the quant data shows 76.3% top-1 agreement, and an agent that mis-tokenizes one identifier in twenty will quietly corrupt edits. Renting a cloud GPU to run an open model usually costs more per useful token than just paying an API.

**Wait if you are on the fence about hardware.** Launch-week quants are already on their second revision — the [HF discussion](https://huggingface.co/Qwen/Qwen3.8-27B/discussions/65) shows publishers actively re-cutting files — and llama.cpp lands Qwen3.8-specific optimizations weekly. The setup that takes an evening today will take an hour in a month, and speculative decoding for this architecture (the 1.8× pattern I measured with [dspark on DeepSeek](/en/notes/deepseek-dspark-speculative-decoding-llamacpp-2026)) has not shipped yet.

And do not adopt it *because a benchmark table beat a frontier model*. Vendor-run comparisons that show a 27B "beating Opus on 15 of 19 tests" measure tuned harnesses at full precision against black-box APIs. The honest local-vs-cloud gap on real agent work is visible within your first hour of use. Trust that hour.`,
    },
    {
      heading: "How I'd Ship This in Production",
      content: `Here is the build I would actually run — and partly already do, since the failure modes are the same ones I hit shipping [agent harnesses for client MVPs](/en/services/6-week-mvp).

**Route by task, not by loyalty.** llama-server and every cloud provider speak the same OpenAI-compatible dialect, so put a router in front (LiteLLM, or claude-code-router's provider list) with three lanes: local Qwen3.8-27B for bounded repo tasks and anything NDA-bound, a cheap API lane for long-context work, a frontier lane for planning and gnarly debugging. The agent harness does not change; only the base URL does. My rule of thumb after two weeks: ~70% of agent invocations are bounded enough for the local lane.

**Pin everything.** The launch-week ecosystem churns daily. Pin the GGUF file by SHA256, pin the llama.cpp build, pin the harness version. A coding agent that silently changed models overnight is a debugging session you cannot win — model drift looks exactly like your own bad prompt.

**Treat the KV cache as the capacity plan.** Weights are a one-time cost; context is per-session. Start sessions at 16K, monitor llama-server's slot metrics, and teach the agent to work in file-scoped chunks rather than repo-wide reads. This is the discipline cloud subscriptions let you skip — and the first thing that breaks local setups.

**Keep the failure mode I'd worry about in view:** local models fail *quietly*. A cloud agent that hits a rate limit stops; a Q3 quant that drifts just keeps emitting plausible-looking edits. Wire the same guardrails you would for a junior dev — tests must pass before commit, diffs reviewed, no force pushes. The [security posture I wrote about for agent runtimes](/en/notes/prime-agent-rlm-continual-harness-guide-2026) applies double when the model is also unattended and free.

The one-line verdict: Qwen3.8-27B is the first open-weights model where the local coding agent is a rational default rather than a hobby. The moat cloud agents keep is context length and frontier reasoning — rent those by the task, own the rest.`,
    },
    {
      heading: 'Need This Wired Into a Real Product?',
      content: `Standing up llama-server is the easy weekend. The hard part is what comes after: routing between local and cloud lanes without doubling latency, sandboxing an agent that edits production code, and the five failure modes the README does not warn about. That is the work I do for a living — AI-integrated MVPs shipped in six weeks, including the agent plumbing, on [a fixed scope and price](/en/services/6-week-mvp). If you want the local-first stack designed into your product from day one rather than bolted on, [hire a founding engineer](/en/services/hire-founding-engineer-india) who has already burned his hands on the sharp edges.`,
    },
  ],
  cta: {
    text: 'Ship your AI MVP in 6 weeks',
    href: '/en/services/6-week-mvp',
  },
};
