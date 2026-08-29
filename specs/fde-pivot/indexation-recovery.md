# Indexation recovery — diagnosis + actions (2026-08-29)

## Symptom

Sitemap: 192 submitted, **0 indexed**. 28d: 0 clicks, 154 impressions. Daily posts shipped
into a non-indexing site since ~June (caught by `gsc_gate.py`, added 2026-08-29).

## Diagnosis (URL Inspection API, evidence-based)

| URL | Verdict |
|---|---|
| `/en` (homepage) | **Submitted and indexed** ✓ (last crawl 2026-08-22) |
| `/en/notes` hub | Discovered — currently not indexed |
| `/en/notes/<post>` | Discovered — currently not indexed |
| `/en/services/hire-founding-engineer-india` | Crawled 2026-05-13 — currently not indexed |
| `/en/about` | URL unknown to Google |
| `/de/notes/<post>` | URL unknown to Google |

**Not a manual-action pattern** (homepage indexed, impressions nonzero). This is algorithmic
quality suppression: Google reads the sitemap daily (lastDownloaded current) but declines to
crawl/index the corpus.

**Root-cause sequence (from page-level GSC data):**
1. Site originally published every page in 5 locales with English bodies (~700 near-dup URLs).
2. Google indexed many under NON-EN URLs — top performers were `/ar/...` (285 imp),
   `/de/...` (58+101 imp) etc. The EN sitemap URLs stayed unindexed → "indexed=0".
3. A prior fix (correct long-term) put `noindex + canonical→/en` on non-EN pages — which
   de-indexed the only URLs that were ranking. EN equivalents were never re-crawled because
   the duplication phase had already tanked Google's crawl appetite for the domain.
4. Net: rankings the site had → gone; EN corpus → still ignored. clicks=0.

## Actions taken (2026-08-29, all machine-side levers)

1. **Google Indexing API pings** (SA `~/.config/gsc/indexing-sa.json`, quota 200/day):
   - 9 priority pages: `/en`, `/en/hire`, `/en/about`, `/en/notes`, `/en/services`,
     3 new consulting service pages, `/en/projects`.
   - 61 EN equivalents of every path that earned ≥5 impressions in any locale (90d) —
     the formerly-ranking content Google already judged useful.
2. **Sitemap resubmitted** via Sitemaps API (197 URLs, EN-only, verified live: `/en/about`
   + `/en/hire` present, hreflang only on the 8 translated routes).
3. **IndexNow** batch (existing `scripts/submit-seo.sh`, key verified live): money pages +
   top posts → api.indexnow.org + Bing + Yandex, all HTTP 200. Covers Bing/DuckDuckGo/
   ChatGPT-search discovery while Google recovers.
4. Confirmed live hygiene: non-EN pages serve `noindex,follow` + canonical→`/en`;
   robots.txt clean; no locale links in body HTML; `llms-full.txt` + feed present.

## What only the owner can do (blocking items)

1. **GSC UI → Security & Manual Actions → Manual Actions** — 2-minute check. API cannot
   read this. If a manual action exists, everything else waits on a reconsideration request.
2. **2–3 real external links** to deep pages (not just homepage). Cheapest real options:
   GitHub profile README + each public repo README → `rohitraj.tech/en/hire`; LinkedIn
   featured link; one HN "Show HN"/IndieHackers post linking a strong technical post.
   External links are what restarts crawl appetite — pings alone are a nudge, not a reason.

## Monitoring + decision points

- `gsc_gate.py` runs first in every daily-seo-content invocation (Step 0-pre) — daily check
  built in. Manual check: `python3 ~/.claude/skills/daily-seo-content/gsc_gate.py`.
- **T+1 week:** re-run URL Inspection on the 7 sample URLs. Expect `/en/hire` + pinged posts
  to move to "Crawled". If nothing moved AND Manual Actions is clean → escalate to pruning.
- **Pruning plan (only if needed):** ~80 posts have zero impressions ever in any locale.
  410 (or merge into hubs) the bottom half to raise the indexed:submitted ratio — Google
  re-evaluates thin-corpus domains faster when the corpus shrinks. Owner call; destructive.
- **Do NOT ship daily posts** while the gate says BROKEN (volume worsens scaled-content
  signals). Consulting cluster posts wait too.
