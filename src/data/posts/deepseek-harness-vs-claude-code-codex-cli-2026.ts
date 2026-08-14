import type { BlogPost } from '@/types/blog';

export const deepseekHarnessVsClaudeCodeCodexCli2026: BlogPost = {
  slug: 'deepseek-harness-vs-claude-code-codex-cli-2026',
  title:
    'DeepSeek Harness vs Claude Code vs Codex CLI: The v0.1 Developer Preview, Honestly — 2026',
  date: '2026-08-14',
  excerpt:
    'DeepSeek open-sourced its agent harness on August 13, 2026 under MIT — 572 points on Hacker News in a day. Every page currently ranking for "DeepSeek Harness vs Claude Code" describes a different, older product. Here is what v0.1 actually ships: the Cordis plugin kernel, the real cordis.yml keys, 53 built-in tools, and the one config default that decides whether it touches your repo.',
  readingTime: '14 min read',
  keywords: [
    'deepseek harness vs claude code',
    'deepseek harness',
    'deepseek dsh agent harness',
    'cordis plugin kernel',
    'open source coding agent 2026',
    'codex cli alternative',
    'model agnostic agent harness',
  ],
  relatedProject: 'rohitrajTech',
  coverImage: {
    src: '/images/notes/deepseek-harness-vs-claude-code-codex-cli-2026-cover.jpg',
    alt: 'Constellation of glowing teal and violet modular nodes illustrating DeepSeek Harness plugin agent architecture',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `**[DeepSeek Harness](https://deepseek.com/harness/en/)** (\`dsh\`) entered **v0.1 developer preview on August 13, 2026** under the **MIT** license — **572 points and 247 comments on Hacker News** inside 24 hours. It is an agent harness, not a model: a **Cordis**-based kernel where models, tools, sandboxes, storage, loops and even the UI are swappable plugins, with an **append-only session log** of everything the model saw. Run it today with \`npx @deepseek-ai/dsh web\` (Web UI on port **3080**). Skip it for production this month: the preview explicitly warns of **compatibility-breaking changes**.`,
    },
    {
      heading:
        'DeepSeek Open-Sourced the Harness, Not Just the Weights. That Is the Actual Story',
      content: `By [Rohit Raj](/en/about) — Founding Engineer · 10+ yrs MVP shipping · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

On **August 13, 2026**, DeepSeek published the [DeepSeek Harness developer preview](https://deepseek.com/harness/en/) and put the source on [GitHub under MIT](https://github.com/deepseek-ai/deepseek-harness). Within a day it was at **572 points across 247 comments** on [Hacker News](https://news.ycombinator.com/item?id=49285244) and sitting top-of-day on r/LocalLLaMA. This landed the same week as V4-Pro — which I covered in [this week's roundup](/en/notes/ai-dev-week-2026-33) — but the harness is the more interesting half of the drop.

Here is why. Every serious lab now ships a coding agent, and every one of them is a closed vertical: Claude Code is Anthropic's loop around Anthropic's models, Codex CLI is OpenAI's loop around OpenAI's. DeepSeek open-sourced **the loop itself**. The tagline is "Everything is a Plugin," and unusually for a tagline, it survives contact with the source: the architecture docs state there is no privileged core, and extensions mount as sibling plugins whose effects unwind on unload.

One thing to flag before you read further, because it is the reason this post exists. I checked the pages currently ranking for "DeepSeek Harness vs Claude Code" and **none of them are about this product**. The top comparison guide (published 2026-05-06) reviews *DeepSeek-TUI v0.8.8*. Another (2026-05-19) reviews something else entirely and prints an install command — \`npm install -g freebuff\` — that does not exist. A third (2026-07-16) covers *DeepSeek Reasonix* from May. All three predate the August 13 launch by months. So take the numbers below from the primary sources they are linked to, not from the review-farm layer that has already grown over this release.`,
    },
    {
      heading: 'What Actually Shipped on August 13, 2026?',
      content: `\`dsh\` is a TypeScript/Node agent harness in the same category as Claude Code, Codex CLI or OpenHands — it inspects repositories, edits files, runs shell commands, searches the web, keeps plans, delegates to subagents and enforces approval policy. What differs is that all of that is assembled from plugins at boot rather than compiled in.

Concretely, per the [official preview page](https://deepseek.com/harness/en/) and the [repo docs](https://github.com/deepseek-ai/deepseek-harness):

- **A pluggable everything.** The [config catalog](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/config-catalog.md) documents roughly **80 plugins** covering models, tools, skills, sessions, sandboxes, storage, agent loops, scheduling and the UI.
- **The Cordis kernel.** Cordis v4 provides dependency injection, typed events and reversible effects. It ships with an accompanying paper, *Cordis: A Meta-Framework of Spatiotemporal Composability*.
- **An append-only session log.** System prompts, reasoning, tool calls and results, subagent scheduling and every context injection are recorded. The docs put it bluntly: **model-visible means logged** — anything reaching the model must be reconstructible from the log.
- **53 built-in tools** in the [tool catalog](https://raw.githubusercontent.com/deepseek-ai/deepseek-harness/master/docs/tool-catalog.md), including \`bash\`, \`pwsh\`, \`edit\`, \`glob\`, \`grep\`, \`lsp\`, \`subagent\`, \`workflow\`, \`web_fetch\`, persistent \`terminal_*\` sessions, and the \`cordis_*\` family covered below.
- **Four runtime modes** — Standard, Code, Minimal and Creator — plus a Trajectory view that replays a run by event source.
- **Two profiles on one base.** \`dsh-base\` carries model adapters, tools and persistence; \`dsh-web-app\` or \`dsh-headless\` extends it. Config composes in layers: bundles in profile order, then profile patches, then home patches, then CLI overlays.

Quickstart is one command, and it is genuinely one command:

\`\`\`bash
# Web UI, served at http://127.0.0.1:3080
npx @deepseek-ai/dsh web
\`\`\`

From source, if you want to write plugins against it:

\`\`\`bash
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
\`\`\``,
    },
    {
      heading: 'How Does the Cordis Plugin Kernel Actually Work?',
      content: `Configuration lives in **\`cordis.yml\`**, and it is the deployment axis for the whole system — you wire plugins and set their options there rather than editing harness source. A realistic slice, with the documented defaults:

\`\`\`yaml
plugins:
  llm-deepseek:
    apiKeyEnv: DEEPSEEK_API_KEY
    baseURL: https://api.deepseek.com
    thinking: enabled           # enabled | disabled
    reasoningEffort: high       # off | high | max
    maxTokens: 256000           # default output cap
    defaultContextWindow: 1000000

  session-persistence-jsonl:
    root: ./.sessions
    packChunks: true
    compression: zstd

  sandbox-policy:
    mode: workspace-write       # default is read-only
    workspaceRoot: /workspace

  permission-presets:
    defaultPreset: workspace-write
\`\`\`

Two numbers there are worth pausing on: **\`maxTokens\` defaults to 256,000** and **\`defaultContextWindow\` to 1,000,000**. Those are DeepSeek-shaped defaults, and they tell you the harness assumes long-horizon runs rather than chat turns.

Underneath, the runtime is an event pipeline. A *turn* contains zero or more *steps*, and a step is one model request plus its tools. The documented flow:

\`\`\`text
turn/start
  assemble prompt sections + tool schemas
  -> agent/pre-step          [reject | enter(messages)]
     step/start
     append user/message
     derive model history
     agent/request -> llm/stream -> assistant/* -> tool/call*
     tools/pre-execute -> tools/execute -> tools/post-execute -> tool/result*
     step/end
  -> agent/turn-stopping
turn/end
\`\`\`

\`turn/*\`, \`step/*\`, \`user/message\`, \`assistant/*\` and \`tool/*\` are durable and land in the log; the rest are live extension points. Plugins attach at those seams — a **Service Definition** declares an interface, a **Service Provider** implements it, a **Consumer** uses it — and the docs make a specific claim about the payoff: one provider swap can redirect filesystem, subprocess and LSP execution to remote infrastructure **with no forking**. Core services hang off typed context keys: \`ctx.sessions\`, \`ctx.tools\`, \`ctx.agents\`, \`ctx.agentLoop\`, \`ctx.llm\`, \`ctx.systemPrompt\`.

The part nobody has written about yet is the \`cordis_*\` tool family. The agent itself gets \`cordis_define\`, \`cordis_run\`, \`cordis_stop\` and \`cordis_undefine\` — it can author an immutable plugin package mid-session, activate it, and tear it down, with \`cordis_inspect_query\` for read-only introspection of live services and events. That is a running agent extending its own runtime without a restart. It is opt-in, and the docs are appropriately nervous about it: executing dynamic package code **reaches the real runtime**, and dynamic client packages raise an approval request before activation.`,
    },
    {
      heading: 'Where Does DeepSeek Harness Beat Claude Code and Codex CLI?',
      content: `Three places, and they are narrower than the launch-day enthusiasm suggests.

**1. Auditability, as an architectural property rather than a feature.** The single most-praised thing in the HN thread was the append-only log. Because "model-visible means logged" is a design invariant — new model-visible inputs require new session-event entries — you can reconstruct exactly what the model saw on any turn, then fork, resume, search or replay from the same stream. Compare that to the direction the rest of the industry moved this year: encrypted reasoning traces. I wrote up [the trace-stealing paper in this week's roundup](/en/notes/ai-dev-week-2026-33), where researchers recovered **367 PII items and 182 credentials** from 315,320 encrypted reasoning blocks. A harness whose log is plaintext-by-design and yours-by-default is a genuinely different posture, and if you work anywhere with an audit function, it is the strongest argument in this whole release.

**2. Swapping a capability without forking.** If you have ever needed Claude Code or Codex CLI to run its subprocesses somewhere other than the local machine, you know the options are a wrapper or a fork. The seam model here is the actual alternative: implement the service provider, list it in \`cordis.yml\`, leave the harness untouched. Whether it holds up under real load at v0.1 is unproven — but it is the correct shape.

**3. Cost per long run.** DeepSeek's V4 models are post-trained on this harness specifically and priced far below the US frontier tier — see the V4-Pro figures in [the week-33 roundup](/en/notes/ai-dev-week-2026-33). For a multi-hour refactor where you are burning tokens on repository traversal rather than on hard reasoning, that gap compounds.

The counter-signal is worth stating in the same breath: on absolute output quality, the comparisons circulating this week still put Claude Code ahead, and the HN consensus is that DeepSeek's edge is **speed-per-dollar**, not ceiling.`,
    },
    {
      heading:
        'DeepSeek Harness vs Claude Code vs Codex CLI: The Comparison Table',
      content: `| | **DeepSeek Harness (dsh) v0.1** | **Claude Code** | **Codex CLI** |
|---|---|---|---|
| License | **MIT**, source on GitHub | Proprietary | Open source |
| Released | **2026-08-13** (dev preview) | GA, iterated through 2026 | GA |
| Runtime | TypeScript / Node | Node | Node |
| Architecture | **Plugin kernel (Cordis v4)**, ~80 plugins, no privileged core | Vertically integrated | Vertically integrated |
| Model strategy | Model is a plugin; optimised for DeepSeek V4, OpenAI-compatible endpoints via the Pi-AI provider | Anthropic models | OpenAI models |
| Built-in tools | **53** documented | Curated set + MCP | Curated set + MCP |
| Session log | **Append-only, plaintext, local** — fork / resume / search / replay | Managed transcript | Managed transcript |
| Runtime self-extension | **Yes** — \`cordis_define\` / \`cordis_run\` (opt-in, approval-gated) | No | No |
| Default sandbox | **\`read-only\`** (fail-safe) | Permission prompts | Permission prompts |
| Config surface | \`cordis.yml\`, layered overlays | CLI flags + settings | CLI flags + settings |
| UI | Web UI on **:3080** + headless profile | Terminal | Terminal |
| Production ready | **No** — breaking changes expected | Yes | Yes |
| Vendor accountability | Community / DeepSeek, preview | First-party enterprise | First-party enterprise |

The honest read of that table: \`dsh\` wins the architecture column and loses the maturity column, and at v0.1 the maturity column is the one that decides what you install on a client machine.`,
    },
    {
      heading: 'Should You Skip It This Week?',
      content: `For anything production-facing — yes, skip it, and the project agrees with me. The preview states plainly that it is iterating rapidly and that **there will be compatibility-breaking changes**. That is not boilerplate; it is a scoping instruction.

The specific objections from the 247-comment HN thread are worth repeating because they are the ones a week of use will surface:

- **Plugin fatigue.** The most common criticism, and the most historically-grounded: plugin-heavy ecosystems fragment, accumulate abandoned packages, and shift maintenance burden onto users. "Everything is a plugin" is an architectural bet that a large ecosystem will show up. At v0.1 there is no ecosystem — there is DeepSeek.
- **The README does not sell it.** Multiple commenters found the bare-bones README plus an abstract composability paper made the concrete advantage over existing tools hard to identify. Fair. The value is real but it is buried in \`docs/\`, not on the landing page.
- **Documentation gaps.** Chinese-language docs are reportedly missing in places, and the UI plugin list is unsorted — a small thing that becomes a real thing at 80 plugins.
- **Model lock-in, softened but present.** The harness is model-agnostic in principle and DeepSeek V4 in practice: V4 is post-trained on this harness, and other models get generic tool-calling **without that native optimisation**. "Model is a plugin" is true; "all models are equal plugins" is not.

There is also a governance question one commenter raised that has no answer yet: MIT today is not a guarantee of MIT at v1.0. Worth watching, not worth panicking about.

Where it *is* a good use of a Friday: evaluating harness architecture, prototyping a capability swap you cannot do on a closed agent, or any workflow where a plaintext, replayable audit trail is the requirement rather than a nice-to-have.`,
    },
    {
      heading: 'How Would I Ship This in Production?',
      content: `I have not run \`dsh\` against a client repository, and at v0.1 I would not — so treat this as the wiring I would insist on before it touched one, drawn from the config surface rather than from war stories.

**Leave the sandbox default alone for as long as possible.** \`sandbox-policy.mode\` defaults to **\`read-only\`**, with \`workspace-write\` as an explicit opt-in and \`workspaceRoot\` defaulting to \`process.cwd()\`. That default is the single best decision in the config catalog, and the flip to \`workspace-write\` is the moment the tool stops being an inspector. Pin \`workspaceRoot\` explicitly — do not inherit whatever directory the process happened to start in — and pair it with a \`permission-presets\` entry using \`approval: ask\`.

**Point it at your own endpoint on day one.** The Pi-AI provider (\`@deepseek-ai/dsh-llm-pi-ai\`) supports OpenAI-compatible endpoints with per-route \`baseURL\` and API-key environment variables. If your code cannot legally leave a boundary, that route config is the control point, and testing it should come before testing anything else. Note the credential model throughout is \`apiKeyEnv\` — a **variable name**, not a key — so nothing lands in \`cordis.yml\`. Keep it that way.

**Treat \`.sessions/\` as regulated data.** With \`session-persistence-jsonl\` writing zstd-compressed JSONL to \`./.sessions\` by default, and "model-visible means logged" as an invariant, that directory contains every file the agent read. The property that makes the audit story good makes the directory sensitive. Add it to \`.gitignore\` before the first run, not after, and decide its retention like you would decide log retention.

**Here is the failure mode I would actually worry about**, and it is not any of the above. It is \`cordis_define\` plus a long \`/autonomous\`-style run. An agent that can author and hot-load plugins into its own runtime has a mutation surface that your review process has never seen: the thing you audited at turn 10 is not necessarily the thing running at turn 400. The approval gate helps only while a human is watching it. On the [MyFinancial](/en/services/fintech-app-development) side of my work, an agent that can silently redefine its own tool surface mid-run is not something I would sign off on, however good the log is — because the log tells you what happened, and by then it has happened. Keep dynamic Cordis off for unattended runs. Turn it on when you are sitting in front of it, which is also when it is genuinely fun.

**What I would build with it:** a repo-audit agent that runs read-only, never gets \`workspace-write\` at all, and exports its session log as the deliverable. Most audit tooling gives you conclusions you have to trust. This one hands over the full reasoning trace as a replayable artifact — that is a product, and the harness gives it to you nearly for free.`,
    },
    {
      heading: 'DeepSeek Harness FAQ',
      content: `**Is DeepSeek Harness free?**
The harness is **MIT licensed** and free to run — \`npx @deepseek-ai/dsh web\` costs nothing. Inference is separate: you supply a key through \`apiKeyEnv\` (default \`DEEPSEEK_API_KEY\`) and pay your provider per token. There is no subscription tier, because there is no hosted product — you are running the loop yourself.

**Can I use it with models other than DeepSeek?**
Yes, with a caveat that matters. The Pi-AI provider (\`@deepseek-ai/dsh-llm-pi-ai\`) handles OpenAI-compatible and multi-protocol endpoints via route-based config, each route carrying its own \`baseURL\` and API-key environment variable. But DeepSeek's V4 series is **post-trained on this harness specifically**; other models get generic tool-calling without that native optimisation. Model-agnostic, DeepSeek-optimised.

**Does it send my code to DeepSeek?**
Only if you point it there. \`llm-deepseek.baseURL\` defaults to \`https://api.deepseek.com\`, so out of the box, yes — prompt context reaches DeepSeek's API like any hosted model. Repoint \`baseURL\`, or use a Pi-AI route to your own endpoint, and it does not. The session log itself is **local** — \`session-persistence-jsonl\` writes to \`./.sessions\` on your disk.

**Is this a drop-in Claude Code replacement?**
No, and it is not presented as one. v0.1 is a developer preview that warns of compatibility-breaking changes, with no first-party vendor accountability behind it. Claude Code remains the safer default for client work; \`dsh\` is the better choice when you need to swap a capability the closed agents will not let you touch.

**What do I need to run it?**
Node.js and one command. The Web UI serves on **http://127.0.0.1:3080** by default. For plugin development, clone the repo and use \`pnpm install\` / \`pnpm run build\` / \`pnpm dsh web\`. Configuration is a single \`cordis.yml\`, layered as bundles then profile patches then home patches then CLI overlays.

**How does it compare to Cursor?**
Different category. Cursor is an IDE with a model behind it; \`dsh\` is a headless-or-web agent runtime with no editor opinion. The overlap is "an agent edits your files"; the difference is that Cursor owns the interface and \`dsh\` treats the UI itself as a swappable plugin.`,
    },
    {
      heading: 'Building With Agent Tooling That Changes Every Fortnight?',
      content: `The pattern behind this release is the one worth internalising, more than the release itself: the agent loop is becoming infrastructure, and infrastructure gets swapped. Committing your product to one vendor's closed loop in 2026 is a bet with a short half-life.

That is most of what I do — wiring AI capability into products so that the model, the harness and the provider are all replaceable, and so the integration survives the next fortnight's launch. If you are shipping something in that space:

- **[6-week MVP](/en/services/6-week-mvp)** — idea to production in six weeks, agent integration included, without the five bugs the README does not warn you about.
- **[Hire a founding engineer](/en/services/hire-founding-engineer-india)** — for teams that need someone who has already made these calls on real repos.

Either way: install \`dsh\` this weekend, keep it read-only, and read the session log. That is where the actual product is.`,
    },
  ],
  cta: {
    text: 'Ship your AI integration in 6 weeks',
    href: '/en/services/6-week-mvp',
  },
};
