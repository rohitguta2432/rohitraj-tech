import type { BlogPost } from '@/types/blog';

export const deepseekV4FlashVisionExpApiGuide2026: BlogPost = {
  slug: 'deepseek-v4-flash-vision-exp-api-guide-2026',
  title:
    'DeepSeek-V4-Flash-Vision-Exp API Guide: Limits, Pricing, and the 800px Trap (2026)',
  date: '2026-08-23',
  excerpt:
    'DeepSeek put image input on its V4-Flash API on August 21, 2026 as deepseek-v4-flash-vision-exp: 284B/13B-active MoE, 1M context, every image capped at 384 tokens at plain V4-Flash rates. Here is the working-developer read — the three ways to send an image, the limits that return 400, the 800×800 downscale that quietly breaks dense OCR, a cost table against Gemini 3.7 Flash and Qwen3.8-Max, and how I would wire it behind a router so the cheap path never becomes the only path.',
  readingTime: '13 min read',
  keywords: [
    'deepseek-v4-flash-vision-exp',
    'deepseek v4 flash vision api',
    'deepseek vision api image input',
    'deepseek v4 flash vision pricing',
    'deepseek vision api limits',
    'deepseek vision vs gemini 3.7 flash',
    'cheapest vision api for agents 2026',
  ],
  relatedProject: 'vaani',
  coverImage: {
    src: '/images/notes/deepseek-v4-flash-vision-exp-api-guide-2026-cover.jpg',
    alt: 'Crystalline lens of glowing particles focusing light illustrating the DeepSeek-V4-Flash-Vision-Exp multimodal API',
  },
  sections: [
    {
      heading: 'TL;DR',
      content: `Every image sent to **\`deepseek-v4-flash-vision-exp\`** costs **at most 384 input tokens** — at the off-peak V4-Flash rate of **$0.22 per 1M**, roughly **$0.000085 per image**, or **11,800 images per dollar**. Live on the API since **August 21, 2026**, it is an experimental vision version of V4-Flash-0731 (**284B / 13B active** MoE, **1M context**) that DeepSeek says matches V4-Flash on text and lands "close to Opus 4.8" on multimodal agent benchmarks. Use it for high-volume screenshot, chart, and document triage inside agents. Skip it — or tile first — for small text, because images are downscaled to about **800×800** before tokenization.`,
    },
    {
      heading:
        'DeepSeek-V4-Flash-Vision-Exp: What the Cheapest Vision API of 2026 Actually Does',
      content: `By [Rohit Raj](/about) — AI Consultant · Forward Deployed Engineer · [LinkedIn](https://www.linkedin.com/in/rohitraj2/)

On **August 21, 2026**, DeepSeek published a short [release note](https://api-docs.deepseek.com/news/news260821/) and a [vision guide](https://api-docs.deepseek.com/guides/vision/) announcing that image input is live on the API Platform under a new model id, \`deepseek-v4-flash-vision-exp\`. The [Hacker News thread](https://news.ycombinator.com/item?id=49386163) hit **494 points and 153 comments** the same day. That is a lot of attention for what is, on paper, a flag flip: same endpoint, same SDKs, same price, plus an image block in the message.

The reason developers care is the price shape, not the model card. DeepSeek bills an image at **up to 384 tokens**, full stop, at ordinary V4-Flash text rates. There is no separate image price, no per-image fee, no tile multiplier. For anyone running an agent that looks at a lot of screenshots — browser agents, QA bots, document intake, support tools that receive WhatsApp photos — that changes the unit economics enough to redesign the pipeline around it.

I covered the [first V4 vision launch in June](/notes/deepseek-v4-vision-cheapest-multimodal-api-2026), when image understanding appeared in chat.deepseek.com and the API in a looser form. This post is about the August release specifically: the named model, the documented limits, what the HN crowd found when they actually tested it, and the one resolution constraint that decides whether it works for your use case.`,
    },
    {
      heading: "What's New in the August 21 Release?",
      content: `Here is what DeepSeek's [release note](https://api-docs.deepseek.com/news/news260821/), the [vision guide](https://api-docs.deepseek.com/guides/vision/), and the [OpenRouter listing](https://openrouter.ai/deepseek/deepseek-v4-flash-vision-exp) actually specify:

- **Model id:** \`deepseek-v4-flash-vision-exp\`. It is described as an experimental, vision-enabled version of **DeepSeek-V4-Flash-0731**. The \`-exp\` suffix is a real warning: the docs call it experimental and make no stability promise.
- **Architecture:** sparse mixture-of-experts, **284B total parameters, 13B active**. Same base as V4-Flash, so text quality — agents, reasoning, world knowledge — is claimed to be unchanged.
- **Context:** **1,048,576 tokens** input; OpenRouter lists **384,000** max completion tokens.
- **Three API surfaces:** OpenAI-style **Chat Completions**, the **Responses** API, and an Anthropic-compatible **Messages** endpoint at \`https://api.deepseek.com/anthropic\`. Tool calling (\`tools\`, \`tool_choice\`) and JSON output via \`response_format\` are supported.
- **Three image transports:** base64 data URL inline, public HTTP(S) URL, or a \`file_id\` from the new **Files API** — which is live and currently **free**.
- **Formats:** JPEG, PNG, GIF, WebP, detected from file bytes rather than extension.
- **Token cost:** images are resized to roughly **800×800** and tokenized at **up to 384 tokens each**; very small images (below about 384×384) are scaled up.
- **Benchmarks:** DeepSeek's chart shows gains over V4-Flash across MMMU, OCRBench, DocVQA, ChartQA and MathVista, and positions the model "close to Opus 4.8" on multimodal **agent** tasks. The official note does not print the numbers; third-party transcriptions of the launch chart cite **Terminal-Bench 2.1 at 83.9**. Treat those as unofficial until DeepSeek publishes a table.
- **Harness support:** [DeepSeek Harness](/notes/deepseek-harness-vs-claude-code-codex-cli-2026) **0.1.1** shipped the same day with native support, so \`dsh\` can now look at screenshots mid-task.
- **Pricing:** identical to V4-Flash after the **August 16, 2026** rate update — **$0.007** cache-hit input, **$0.22** cache-miss input, **$0.66** output per 1M tokens off-peak; **double** (**$0.014 / $0.44 / $1.32**) during peak windows **01:00–04:00 and 06:00–10:00 UTC**.

What is **not** in the release: open weights. DeepSeek has released weights for every major V4 model so far and the HN thread assumes this one follows, but as of August 23 nothing has appeared on Hugging Face. If your architecture depends on self-hosting, that is still a bet.`,
    },
    {
      heading: 'How Do You Send an Image to deepseek-v4-flash-vision-exp?',
      content: `If you already call DeepSeek through the OpenAI SDK, the only change is that \`content\` becomes an array of blocks instead of a string. The smallest working example, straight from the [vision guide](https://api-docs.deepseek.com/guides/vision/):

\`\`\`python
import base64
from openai import OpenAI

client = OpenAI(api_key="<DEEPSEEK_API_KEY>", base_url="https://api.deepseek.com")

with open("invoice.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Extract vendor, invoice number, total and due date as JSON."},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}", "detail": "high"}},
        ],
    }],
    response_format={"type": "json_object"},
)
print(resp.choices[0].message.content)
\`\`\`

The other two transports swap only the image block:

- **Public URL:** \`{"type": "image_url", "image_url": {"url": "https://example.com/chart.png"}}\`. The URL must be under **8,192 characters**, the file under **32 MiB**, and DeepSeek's fetch must finish inside **60 seconds** — so do not point it at a slow presigned S3 link from a cold region.
- **Files API:** upload once with the files endpoint, then reference \`{"type": "file", "file_id": "file-api-…"}\`. This lifts the per-image cap to **64 MiB** and the per-request total to **200 MiB**, and it is the right choice when the same image is reused across turns — a multi-step agent re-reading a dashboard screenshot, for example.

The \`detail\` field matters more here than on other providers. \`low\` downsizes to **512×512**, \`high\` and \`original\` keep the source dimensions through the resize pipeline, \`auto\` lets the server pick. Because the token cap is 384 regardless, \`low\` does not save much money — it mostly saves latency. For anything with text in it, send \`high\`.

If your agent stack speaks the Anthropic Messages format, point \`ANTHROPIC_BASE_URL\` at \`https://api.deepseek.com/anthropic\` and send the standard \`{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": …}}\` block. That is how DeepSeek Harness 0.1.1 talks to it, and it means a Claude-Code-shaped tool can be retargeted without rewriting message construction.`,
    },
    {
      heading: 'Which Limits Actually Return a 400?',
      content: `The [vision guide](https://api-docs.deepseek.com/guides/vision/) documents the constraints as a table, and every one of them is a production failure waiting to happen at 2 a.m.:

| Constraint | Value |
|---|---|
| Max single image, base64 or URL | **32 MiB** |
| Max single image, Files API | **64 MiB** |
| Max request body (inline base64) | **48 MiB** |
| Max images per request | **600** |
| Max total image bytes per request | **64 MiB** inline · **200 MiB** via Files API |
| Max pixel dimension | **8,192 px** per side · **4,096 px** when ≥ 15 images |
| URL length / fetch timeout | **8,192 chars** · **60 s** |

And the rules that are easy to miss because they live in prose:

**Why does my request return a 400 error?**
Three usual causes. First, images are accepted **only in \`user\` messages** — put one in a \`system\` or \`assistant\` turn and the API rejects the whole request. Second, image content inside **tool outputs is not yet supported**, which matters for agents whose browser tool returns a screenshot: you have to re-inject it as a user turn. Third, you sent an image to \`deepseek-v4-flash\` or \`deepseek-v4-pro\` — **only the \`-vision-exp\` model accepts images**; every other model id returns 400.

**What is the exact model name?**
\`deepseek-v4-flash-vision-exp\`, lowercase, with the hyphens. There is no \`deepseek-v4-pro-vision\` yet.

**Is it priced like V4-Flash?**
Yes — same three rates, same cache-hit discount, same peak-hour doubling. An image is just 384 tokens of input on the bill.

**Can it generate images?**
No. This is image **understanding** only. Anything that needs image output still goes to a diffusion model or a dedicated image API.

**Does base64 count toward the 1M context?**
The raw bytes do not — the **tokenized** image does, at up to 384 tokens. A request with 600 images is at most ~230k image tokens, which still leaves room in a 1M window. The 48 MiB body cap will bite before the context cap does.`,
    },
    {
      heading: 'Where Does This Model Actually Shine?',
      content: `Three workflows where the 384-token pricing changes the answer from "too expensive to do at scale" to "just do it on every message":

**1. Screenshot-driven agents.** A browser or desktop agent that screenshots after every action generates hundreds of images per task. At ~$0.000085 per image, a 300-step run costs **under three cents** in image tokens. That is why DeepSeek Harness added support on day one: it can afford to **look** after each tool call rather than trusting the DOM dump. The same math applies to QA bots that diff a staging page every deploy.

**2. Chart and dashboard reading inside a text agent.** Grafana panels, Metabase charts, Stripe dashboards, a CFO's Excel chart pasted into Slack — these are low-text, high-shape images where the 800×800 downscale loses nothing. ChartQA is one of the benchmarks DeepSeek highlights, and in practice "what is the trend in this chart and which series crossed in Q2" is a task it handles at a fraction of the frontier-model price.

**3. First-pass triage of inbound photos.** This is the one I care about. At [Vaani](/agents), the WhatsApp agent I build for Indian SMEs, a large share of inbound messages are photos — a product shelf, a handwritten order, a scanned invoice, a screenshot of a competitor's price list. Today those route to a frontier vision model for everything, which is the single biggest line item. With this model, the first pass — **what kind of image is this, is it legible, does it need the expensive model** — costs effectively nothing, and only the subset that needs dense OCR escalates. That routing alone can cut vision spend by an order of magnitude without touching accuracy on the hard cases.

The common thread: the model is best where you need **many cheap looks**, not **one perfect look**.`,
    },
    {
      heading: 'How Does DeepSeek Vision Compare to Gemini 3.7 Flash and Qwen3.8-Max?',
      content: `Prices are per 1M tokens, off-peak for DeepSeek, as listed on each vendor's pricing page or OpenRouter in the week of August 17–23, 2026.

| | **deepseek-v4-flash-vision-exp** | **Gemini 3.7 Flash** | **Qwen3.8-Max** | **Claude Opus 4.8** |
|---|---|---|---|---|
| Released | Aug 21, 2026 (experimental) | Aug 13, 2026 | Aug 3, 2026 | earlier 2026 |
| Params | 284B / 13B active MoE | undisclosed | 2.4T / 95B active MoE | undisclosed |
| Context | 1,048,576 | 1M | 1M | 1M |
| Text input | **$0.22** ($0.007 cached) | $0.75 | API via Alibaba Cloud | premium tier |
| Image input | **same as text, ≤ 384 tok/image** | **$0.375** per 1M image tokens, doubles Jan 1, 2027 | same as text, video supported | per-token, ~870 tokens for an 800×800 image |
| Output | **$0.66** | $3.75 | — | premium tier |
| Max image resolution used | ~800×800 after resize | native, higher | native, strong detection | native |
| Video input | no | yes | yes | no |
| Open weights | not yet (expected) | no | open weights Aug 12, 2026 (incl. 27B dense) | no |
| Best at | cheap bulk looks, agent loops | dense OCR, video, Google ecosystem | object detection, counting | hardest visual reasoning |

Two things the table hides. First, Gemini's image price is a **separate** meter, and its image tokenization is not capped the way DeepSeek's is, so a high-resolution page costs several times more than 384 tokens. Second, Qwen3.8 is the only one of the four where you can take the weights home, which is the right answer if your constraint is data residency rather than cost — the [Qwen3.8-27B dense release](https://blog.roboflow.com/qwen3-8-max/) runs on a single workstation GPU and is currently the strongest open VLM at object detection.

If you want the full price-per-task rather than price-per-token, the [June post](/notes/deepseek-v4-vision-cheapest-multimodal-api-2026) has the KV-cache comparison (roughly **90 entries per image for DeepSeek vs ~870 for Claude and ~1,100 for Gemini**); the 384-token cap is the August version of the same idea.`,
    },
    {
      heading: 'When Should You Skip It? The 800×800 Trap',
      content: `The single most-upvoted complaint in the [HN thread](https://news.ycombinator.com/item?id=49386163) was not about intelligence — it was about resolution. Because every image is resized to roughly 800×800 before tokenization, a full A4 invoice, a dense PDF page, a schematic, or a 4K screenshot of an IDE loses most of its small text before the model ever sees it. One commenter's summary: the resolution "kills a lot of use cases" for OCR. Expect a printed GST invoice to come back with the line items intact and the 8-point footer with the bank details garbled — the same 800×800 budget that makes the model cheap is what eats small type.

The informal tests people posted are worth reading as a calibration, not a verdict:

- **Reading an analog clock:** one user got **9/10** correct across repeated runs; another got a wrong answer (5:10 for 8:09) on the first try. Fine-grained angular detail is at the edge of what survives the resize.
- **Landmark identification:** **6/12** correct versus **11/12** for ByteDance's Seed 2.1 Turbo in the same user's test. World-knowledge-by-image is not its strength.
- **Hallucinated tools:** the previous V4-Flash-0731 build "frequently assumed it has vision" and invented image-analysis tools when it had none. The vision build fixes the cause, but if you run both models behind one router, make sure the text model never receives an image block.

So skip it, or keep a fallback, when:

1. **You need small text.** Anything under roughly 10 pt on a full-page scan. Either tile the page (see below) or send it to Gemini 3.7 Flash, which is still only $0.375 per 1M image tokens.
2. **You need stability guarantees.** It is \`-exp\`. DeepSeek has renamed and retired experimental ids before. Pin the id in config, not in code, and monitor for deprecation notices on the [change log](https://api-docs.deepseek.com/updates/).
3. **You need images in tool results.** Not supported yet. If your agent framework hands screenshots back as tool output, you need a shim that re-emits them as a user turn.
4. **You need open weights or non-Chinese data residency today.** Neither is available for this model right now. Qwen3.8 covers the first; a hyperscaler-hosted model covers the second.
5. **You are on peak-hour traffic from Europe.** The 06:00–10:00 UTC doubling hits the European morning. It is still cheap, but your cost model should use $0.44, not $0.22, for that window.`,
    },
    {
      heading: 'How I Would Ship This in Production',
      content: `The design that falls out of the constraints above is a **router with a tiling step**, not a single model call. Here is the version I would put in front of Vaani's image intake, in the order the request moves through it:

**1. Classify cheap, always.** Every inbound image goes to \`deepseek-v4-flash-vision-exp\` first with \`detail: "high"\` and a strict JSON schema: \`{kind, has_dense_text, legible, language, needs_escalation}\`. This costs 384 tokens plus the prompt — about **$0.0001** with a cached system prompt — and it runs on every message, no exceptions.

**2. Tile when the classifier says dense.** If \`has_dense_text\` is true and the source is larger than 800 px on the long side, split it into a 2×2 grid of overlapping crops (10% overlap so a line straddling the cut appears in both) and send all four in **one request**. Four images is still only **~1,536 tokens** — about **$0.00034** — and each crop now gets its own 800×800 budget, which is effectively 1600×1600 of usable resolution. Ask for per-tile extraction and merge on the text side. For most invoices and forms this is enough; for a 300-DPI legal page it is not, and you go to step 3.

**3. Escalate the residue.** Anything the tiled pass marks as still illegible, or anything the classifier tagged as a schematic, handwriting in a regional script, or a photo where world knowledge matters, routes to a second provider. I would use Gemini 3.7 Flash as the default escalation because its image meter is still cheap and it handles dense pages natively, with a frontier model as a manual-review fallback only.

**4. Use the Files API for multi-turn.** If the agent will look at the same image again — to answer a follow-up, to verify an extraction — upload it once and pass \`file_id\` on every subsequent turn. It is free, it lifts the size cap to 64 MiB, and it keeps your request bodies small so you never hit the 48 MiB inline ceiling.

**5. Handle the 400s explicitly.** Wrap the call with a pre-flight that rejects images in non-user roles, checks byte size against the 32 MiB / 48 MiB caps, counts images (≤ 600) and checks pixel dimensions (≤ 8,192, or ≤ 4,096 when sending 15 or more). A validation error on your side is a log line; a 400 from the API is a retry storm if your queue does not distinguish it from a transient failure.

**6. Pin, meter, and watch.** Put the model id in config with a feature flag to swap to the text model plus a vision fallback if DeepSeek retires \`-exp\`. Meter image tokens separately from text tokens so you can see the cost split. Log the peak/off-peak window on every call — a 2× swing that depends on UTC hour will otherwise look like a bug in your billing dashboard.

The failure mode I would worry about most is not the model being wrong. It is the model being **confidently** right about a downscaled image — reading a "7" that was an "1" in the footer — and the pipeline having no signal that resolution was lost. That is why the classifier's \`legible\` field is the most important byte in the whole design: it is the one place the system admits it could not see.`,
    },
    {
      heading: 'Building Vision Into an Agent and Hitting the Resolution Wall?',
      content: `This release is a good example of the pattern I keep seeing in 2026 AI tooling: the cheap path is genuinely cheap, the docs are thin, and the thing that decides whether it works in production — here, a 384-token cap and an 800-pixel resize — is one sentence nobody reads until the invoices come back wrong. The engineering is in the router, the tiling, and the escalation policy, not in the API call.

That is the work I do — wiring models like this into products so the cheap model handles 90% of traffic, the expensive one handles the 10% that needs it, and the integration survives the next rename. If you are building something that has to look at images at scale:

- **[6-week MVP](/services/6-week-mvp)** — idea to production in six weeks, vision intake and fallback routing included, without the five bugs the README does not warn you about.
- **[Hire a founding engineer](/services/hire-founding-engineer-india)** — for teams that need someone who has already shipped the router, not just read the docs.

Either way: send it a screenshot this week, then send it a full-page scan, and compare. The difference between those two results is the whole story of this model.`,
    },
  ],
  cta: {
    text: 'Ship your vision pipeline in 6 weeks',
    href: '/services/6-week-mvp',
  },
};
