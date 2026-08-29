import type { BlogPost } from '@/types/blog';

export const cloudflareComputerVsSandboxAgentGuide2026: BlogPost = {
  slug: 'cloudflare-computer-vs-sandbox-agent-guide-2026',
  title:
    'Cloudflare Computer vs Cloudflare Sandbox: Which Agent Runtime Should You Actually Use? (2026)',
  date: '2026-08-07',
  excerpt:
    "Cloudflare shipped @cloudflare/computer on August 3 and it hit #1 on GitHub trending with 2,802 stars in a day — four months after Sandboxes went GA. Cloudflare's own docs never compare the two, so here's the decision table, working wrangler.jsonc code, and the preview-status caveat the launch coverage buries.",
  readingTime: '13 min read',
  keywords: [
    'cloudflare computer vs sandbox',
    'cloudflare computer',
    'ai agent sandbox cloudflare workers',
    'cloudflare durable object filesystem',
    'cloudflare agent runtime 2026',
    'e2b alternative 2026',
    'ai agent code execution',
  ],
  relatedProject: 'rohitrajTech',
  coverImage: {
    src: '/images/notes/cloudflare-computer-vs-sandbox-agent-guide-2026-cover.jpg',
    alt: 'Glowing crystalline chip with branching filaments illustrating Cloudflare Computer agent runtime vs Sandbox',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `**[@cloudflare/computer](https://github.com/cloudflare/computer)** shipped **August 3, 2026** (npm **v0.1.1**, MIT, [4,992 GitHub stars](https://github.com/cloudflare/computer), #1 on GitHub trending with **+2,802 stars in 24 hours**). It is a SQLite-backed virtual filesystem that lives *inside* a Durable Object, with three pluggable execution backends — full Linux container, just-bash Dynamic Worker, or isolated ECMAScript module. Use it when your agent needs a cheap persistent filesystem and only occasionally needs real Linux. Use **[@cloudflare/sandbox](https://developers.cloudflare.com/agents/tools/sandbox/)** (GA since **April 13, 2026**) when you need a real Linux box every time. Skip Computer for production today — it ships marked **PREVIEW ONLY, "NOT suitable for production use."**`,
    },
    {
      heading:
        'Cloudflare Shipped Two Agent Runtimes in Four Months. Nobody Told You Which One to Pick',
      content: `By [Rohit Raj](/en/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

On **August 3, 2026** Cloudflare published a blog post titled *"Your agent needs a computer, not a container"* and open-sourced [\`@cloudflare/computer\`](https://github.com/cloudflare/computer) alongside it. Four days later the repo is at **4,992 stars and 250 forks**, sitting at **#1 on GitHub trending after gaining 2,802 stars in a single day**. Two days after that, Cloudflare launched **[Cloudflare OS](https://blog.cloudflare.com/cloudflare-os/)**, an open-source agent workspace for enterprises, which took the front page of Hacker News at **648 points and 321 comments**.

Here is the problem that generated this post. Cloudflare already *has* an agent code-execution product. **Cloudflare Sandboxes went generally available on April 13, 2026**, built on Cloudflare Containers, with a mature SDK (**v0.8.9**), PTY support, persistent Python/JS interpreters, and concurrency limits in the thousands. So a developer who reads the August 3 announcement lands on a fork in the road: there are now two Cloudflare packages that both give an agent a filesystem and a shell, and they solve different problems.

I checked whether the docs resolve this. They don't. **Cloudflare's Sandbox documentation page contains zero mentions of \`@cloudflare/computer\`.** The two best third-party pages ranking for this question — [Nerd Level Tech's August 4 analysis](https://nerdleveltech.com/cloudflare-computer-agent-runtime-isolates-containers) (~3,200 words) and [Developers Digest's five-vendor comparison](https://www.developersdigest.tech/blog/ai-agent-code-sandbox-comparison-2026) (~4,500 words) — between them contain **zero code blocks**, and the second one was published July 1, four weeks *before* \`@cloudflare/computer\` first appeared on npm.

So this post is the decision guide: what actually shipped, the code to run it, the table that tells you which one to pick, and the honest reason most of you should wait.`,
    },
    {
      heading: 'What Is @cloudflare/computer, and What Actually Shipped on August 3?',
      content: `Strip away the launch framing and \`@cloudflare/computer\` is one concrete thing: **a persistent virtual filesystem, backed by SQLite, that lives inside a Durable Object** — plus a runtime that can execute code against that filesystem in three different places.

The npm history tells you exactly how new this is:

| Version | Published |
|---|---|
| \`0.0.0\` | 2026-07-29 |
| \`0.1.0-alpha.1\` | 2026-07-30 |
| \`0.1.0\` | 2026-08-03 |
| \`0.1.1\` | 2026-08-03 13:01 UTC |

The [announcement blog post](https://blog.cloudflare.com/cloudflare-computer/) went live at 13:15 UTC the same day, with a matching [developer changelog entry](https://developers.cloudflare.com/changelog/post/2026-08-03-cloudflare-computer/). The repo itself was created **2026-06-05** and was last pushed **2026-08-06**. It is MIT-licensed TypeScript with **22 open issues**. Its runtime dependencies are small and revealing: \`acorn ^8.17.0\` (JS parsing), \`capnweb ^0.8.0\` (Cloudflare's object-capability RPC), and \`just-bash ^3.0.1\` (a shell implemented in JavaScript).

That third dependency is the whole trick. **Three execution backends** are selectable through \`workspace.runtime\`:

- **Container backend** — a Cloudflare Container running the \`computerd\` daemon, giving you a full Linux userland. The workspace appears inside it as a FUSE mount.
- **Worker shell backend** — shell commands translated into JavaScript by \`just-bash\` and run in a Dynamic Worker. No container, no cold-start container cost. Requires a Worker Loader binding and is flagged experimental.
- **Worker JavaScript backend** — isolated ECMAScript modules with durable relative imports and a durable \`node:fs/promises\`. Also Worker Loader, also experimental.

The package ships **seven entrypoints** (\`@cloudflare/computer\`, \`/backends/container\`, \`/backends/worker-shell\`, \`/backends/worker-javascript\`, \`/git\`, \`/artifacts\`, \`/tools\`), so a project that only uses the container backend tree-shakes the \`just-bash\` payload away entirely. There is a sibling package, \`@cloudflare/computer-rpc\`, holding the wire types shared with the in-container service, and a separate \`@cloudflare/think\` package that provides the actual agent loop — Computer is deliberately not an agent framework.`,
    },
    {
      heading: 'Why Is a Container the Wrong Primitive for an AI Agent?',
      content: `Cloudflare's argument is an arithmetic one, not an aesthetic one, and it is worth taking seriously because it is the reason the isolate backends exist at all.

The claim: there is nowhere near enough compute across all the hyperscalers combined to give every user's agent its own container, and that will not scale to hundreds of millions — then billions — of concurrent agents. A container is sized for a *service*: a long-lived process with a userland, a package manager, and a memory floor measured in hundreds of megabytes. An agent session is not that. It is bursty, mostly idle, and the overwhelming majority of what it does is **read a file, write a file, grep a directory, run one command**.

None of those four operations need Linux. They need a filesystem and somewhere to run a shell. So Computer inverts the default: the agent harness runs in the isolate inside a Durable Object, the filesystem lives in that Durable Object's SQLite storage, and the container becomes a *tool* the runtime reaches for only when something genuinely requires native binaries. Cloudflare reports that the model is good at making that call itself and falling back to containers only when needed.

This is a different bet from the one every other sandbox vendor made. E2B runs Firecracker microVMs and advertises **~1 second resume**; Daytona runs persistent containers at **sub-90 ms creation**; Modal claims sub-second scheduling ([figures via Developers Digest, July 2026](https://www.developersdigest.tech/blog/ai-agent-code-sandbox-comparison-2026)). All three are optimizing the *container* path — faster boots, faster resume, cheaper idle. Cloudflare's bet is that for agent workloads you should be avoiding that path most of the time, and that **two of Computer's three backends** therefore run no container at all. The interesting engineering is in making the non-container path feel identical.

Whether that bet pays off is unproven. But note that it is the same structural bet Cloudflare made with Workers against Lambda in 2018, and that one worked.`,
    },
    {
      heading: 'Hands-On: Giving a Durable Object a Filesystem in About 20 Lines',
      content: `This is the part no competing article has. Here is the minimum viable Computer workspace — no container, filesystem only.

Install:

\`\`\`sh
npm install @cloudflare/computer
\`\`\`

The Worker. \`withWorkspace\` mixes the filesystem into any Durable Object class, and \`getWorkspace\` hands you a disposable handle:

\`\`\`ts
import { withWorkspace, getWorkspace } from "@cloudflare/computer";
import { DurableObject } from "cloudflare:workers";

export class Agent extends withWorkspace(
  class extends DurableObject<Env> {},
  (self) => ({ storage: self.ctx.storage }),
) {}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.Agent.idFromName("user-123");
    using ws = await getWorkspace(env.Agent.get(id));

    await ws.fs.writeFile("/notes.md", "- [ ] ship it\\n");
    const notes = await ws.fs.readFile("/notes.md", "utf8");

    return new Response(notes);
  },
} satisfies ExportedHandler<Env>;
\`\`\`

The critical config detail is that the Durable Object class **must** be registered under \`new_sqlite_classes\` — the virtual filesystem is SQLite, so a non-SQLite Durable Object simply cannot host a workspace:

\`\`\`jsonc
{
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "Agent", "class_name": "Agent" }]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["Agent"] }
  ]
}
\`\`\`

The \`fs\` surface is deliberately Node-shaped — \`readFile\`, \`writeFile\`, \`mkdir\`, \`readdir\`, \`rm\`, and a first-class \`grep\`. Everything is async, every path is absolute, and every operation survives a Durable Object restart. The \`runtime\` surface is \`exec\`, \`getExec\`, \`killExec\`, \`disposeExec\` — \`exec\` returns a handle you can stream from or await via \`.result()\`.

Adding real Linux means adding a container whose image runs \`computerd\` as PID 1, mounting the same workspace over FUSE:

\`\`\`dockerfile
FROM ghcr.io/cloudflare/computer-computerd-linux-x64:0.1.0-alpha.1 AS computerd
FROM debian:stable-slim

RUN apt-get update \\
 && apt-get install -y --no-install-recommends fuse3 libfuse2t64 ca-certificates \\
 && rm -rf /var/lib/apt/lists/*

COPY --from=computerd /usr/local/bin/computerd /usr/local/bin/computerd

ENV PORT=8080
ENV MOUNT_POINT=/workspace
ENV FUSE_MOUNT=auto
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/computerd"]
\`\`\`

\`FUSE_MOUNT=auto\` is the detail worth knowing: it uses the kernel FUSE backend when \`/dev/fuse\` is reachable (which it is on Cloudflare Containers) and silently falls back to a userspace shim otherwise — which is what \`wrangler dev\` gets. One image works locally and in production.`,
    },
    {
      heading: 'Cloudflare Computer vs Sandbox vs E2B: The Decision Table',
      content: `The table Cloudflare's own documentation declines to publish. Third-party numbers in the last column are from [Developers Digest's July 2026 comparison](https://www.developersdigest.tech/blog/ai-agent-code-sandbox-comparison-2026), not from my own benchmarks.

| | **@cloudflare/computer** | **@cloudflare/sandbox** | **E2B / Daytona** |
|---|---|---|---|
| Status | Preview (v0.1.1, 2026-08-03) | **GA** (2026-04-13, SDK 0.8.9) | GA |
| Production-ready | **No** — "NOT suitable for production" | Yes | Yes |
| Primitive | SQLite VFS in a Durable Object | Container per Durable Object | Firecracker microVM / container |
| Default execution | Isolate (just-bash), container on demand | Container, always | microVM / container, always |
| Filesystem persistence | Durable across DO restarts, native | Container-lifecycle + snapshots | Session-scoped (E2B) / persistent (Daytona) |
| Storage ceiling | **~10 GB** (shared with DO storage) | Container disk | Plan-dependent |
| Startup cost | Near-zero for the isolate path | Container start | ~1 s resume (E2B) / sub-90 ms create (Daytona) |
| Max session | Bound by DO lifecycle | ~10 min default idle timeout | 24 h Pro (E2B) / unlimited (Daytona) |
| Concurrency | Durable Object limits | 15,000 lite / 6,000 basic / 1,000+ larger | Plan-dependent |
| Pricing shape | Workers + DO + Containers | Active CPU, from ~$5/mo base | ~$150/mo base (E2B) |
| GPU | No | No | No |
| License | **MIT, self-hostable logic** | Proprietary platform | Proprietary (E2B core is open) |

Two numbers from the Sandboxes GA post put the container path in perspective: cloning axios and running \`npm install\` inside a Sandbox takes **about 30 seconds**, while restoring that same state from a snapshot takes **about 2 seconds**. That gap is exactly the cost Computer's isolate-first design is trying to avoid paying in the first place.`,
    },
    {
      heading: 'When Should You Reach for Computer Instead of Sandbox?',
      content: `Three workloads where the isolate-first design is a genuine win, and one where it is not.

**1. Long-lived agents that are mostly idle.** A support agent, a research agent, a repo-watching agent — something that wakes up a few times an hour, reads and writes some files, and goes back to sleep. With Sandbox you are paying for container lifecycle on every wake. With Computer the filesystem is *already there* in Durable Object storage and the wake is an isolate cold start. This is the case Computer was designed for and it is not close.

**2. Fan-out across many users.** One workspace per user, thousands of users, each tiny. Durable Objects are built for exactly this addressing pattern — \`idFromName("user-123")\` and you have that user's filesystem. Doing the same with a container per user is where Cloudflare's scaling argument stops being theoretical and starts being your invoice.

**3. Document and artifact pipelines.** The repo's own tutorial is the archetype: an agent fetches a recipe, writes markdown on the host side, then runs \`pandoc\` in the container to produce a PDF, and publishes it to R2. Both halves touch one filesystem. Note the detail in that tutorial's Dockerfile — they chose \`typst\` as the PDF engine specifically because it is **a single 30 MB binary**, where a LaTeX install would have cost several hundred megabytes of image. That is the design pressure of this model showing up in practice: keep the container thin, because you want to reach for it rarely.

**Where it is not the answer:** anything that installs a large dependency tree. Container access goes through FUSE, and the docs are explicit that heavy I/O — large \`node_modules\` installs, big tarball extractions — takes a measurable hit versus a native filesystem. If your agent's core loop is "clone a repo and npm install," you want Sandbox, and you want its snapshots.`,
    },
    {
      heading: 'When to Skip It (For Now)',
      content: `The honest part, which most of the launch-week coverage soft-pedals.

**It says preview, and it means it.** Every README in the repository opens with the same block: **PREVIEW ONLY**, APIs are unstable, the design is subject to change, suitable for experiments and prototypes, and **"NOT suitable for production use at this time."** The \`docs/\` directory carries an additional warning that the specification there is forward-looking — read it for intent, not as a description of what the code does today. Two of the three execution backends (worker-shell and worker-javascript) additionally require a Worker Loader binding behind an experimental flag.

**There are no releases.** The GitHub repo has **zero tagged releases** and 22 open issues, and the entire published version history spans **July 29 to August 3** — six days. The container image referenced in the official Dockerfile example is still tagged \`0.1.0-alpha.1\`. There is no deprecation policy to rely on because there is nothing yet to deprecate.

**The 10 GB ceiling is a real design constraint, not a quota you raise.** The workspace shares storage with the Durable Object, and the container-side filesystem is held in memory. The docs tell you plainly to aim for agent-scale workspaces, not full monorepos. If your agent needs to check out a large repository, this is the wrong primitive and no amount of tuning changes that.

**Skip it entirely if** you are shipping to production this quarter, you need a support commitment, your workload is container-bound anyway, or you need GPUs — which neither Cloudflare product offers. Use Sandboxes, which have been GA since April, and revisit Computer when it tags a 1.0.`,
    },
    {
      heading: 'How I Would Actually Ship This',
      content: `I run autonomous agents in the browser on [this site](/en/agents), and the piece that consistently costs the most engineering time is not the model call — it is state. Where does the agent's scratch work live, what survives a restart, and what happens when two sessions touch the same thing. That is exactly the seam Computer is aiming at, which is why I read the whole repo rather than the press release.

Given that, here is the wiring I would insist on before this went anywhere near a client's stack — none of which is in the README.

**Put the abstraction boundary in your own code, not theirs.** With an API explicitly marked unstable, I would define a narrow internal interface — \`read\`, \`write\`, \`list\`, \`exec\` — and implement it twice: once over Computer, once over Sandbox. That is maybe 150 lines. It means the day v0.2 breaks a signature you change one adapter, and it means you can A/B the isolate path against the container path on real traffic instead of trusting anyone's blog post, including this one.

**The failure mode I would actually worry about is silent backend drift.** The runtime decides whether a command runs in \`just-bash\` or in a real container. \`just-bash\` is a shell reimplemented in JavaScript — a fine one, but not bash. The bug you get is not a crash; it is a command that behaves *subtly differently* depending on which backend serviced it, in a system where the caller is a non-deterministic model. I would log the chosen backend on every \`exec\` from day one, and I would keep a small conformance suite of shell invocations asserted to produce identical output on both paths. Without that, you will eventually debug an agent failure that only reproduces one time in five.

**Treat the 10 GB cap as a hard architectural boundary.** Enforce a per-workspace quota in your own adapter well below it, and push anything durable to R2. A workspace that hits the ceiling takes the Durable Object with it.

**And keep the agent loop separate.** Cloudflare split \`@cloudflare/think\` from \`@cloudflare/computer\` for a reason. Whatever you use to drive the model, do not let it fuse to your storage layer — the same discipline I argued for when the [MCP spec went stateless](/en/notes/mcp-stateless-spec-migration-guide-2026), and the same reason [portable agent memory](/en/notes/tencentdb-agent-memory-team-hub-review-2026) beats framework-native memory every time.`,
    },
    {
      heading: 'The Bottom Line',
      content: `**Cloudflare Sandbox** is the answer today: GA since April 13, 2026, thousands of concurrent instances, snapshots, Active CPU pricing. **Cloudflare Computer** is the more interesting long-term bet — an agent filesystem that costs nearly nothing when idle and reaches for Linux only when it has to — and it is a preview with no tagged release and six days of version history. Prototype on Computer this month. Ship on Sandbox this quarter.

If you are wiring agent infrastructure into a product right now and would rather not spend three weeks discovering the FUSE overhead and the backend-drift bug yourself, that is the kind of integration work I do. I build AI-integrated MVPs end to end in six weeks — [see how the 6-week MVP sprint works](/en/services/6-week-mvp) — or embed directly with your team as a [founding engineer](/en/services/hire-founding-engineer-india) to get the agent layer right the first time.

**Sources:** [Cloudflare blog — "Your agent needs a computer, not a container" (2026-08-03)](https://blog.cloudflare.com/cloudflare-computer/) · [Cloudflare developer changelog (2026-08-03)](https://developers.cloudflare.com/changelog/post/2026-08-03-cloudflare-computer/) · [github.com/cloudflare/computer](https://github.com/cloudflare/computer) · [Sandboxes GA announcement (2026-04-13)](https://blog.cloudflare.com/sandbox-ga/) · [Cloudflare Agents — Sandbox docs](https://developers.cloudflare.com/agents/tools/sandbox/) · [Cloudflare OS launch (2026-08-05)](https://blog.cloudflare.com/cloudflare-os/)`,
    },
  ],
  cta: {
    text: 'Ship your agent stack in 6 weeks',
    href: '/en/services/6-week-mvp',
  },
};
