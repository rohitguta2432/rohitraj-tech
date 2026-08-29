# Spec: FDE Consultant Pivot — rohitraj.tech

Status: approved (conversation 2026-08-29)
Owner: Rohit Raj

## 1. Intent

rohitraj.tech's single job: **make a company that needs AI shipped find Rohit, trust him, and reach out** — a client-acquisition machine for AI consulting work. Every page decision passes one test: *"does this help a company decide to hire me?"*

Explicitly NOT the site's job anymore: selling products to developers, dev-audience tutorials as an end in themselves, resume hosting.

## 2. Positioning

- Self-label everywhere: **"AI Consultant · Forward Deployed Engineer"** (FDE).
- **Never** self-label "freelancer". Evidence: freelancer = task-taker perception, lowest trust/rate tier; consultant = expertise tier; FDE = "actually ships in your environment" — kills the slide-deck-consultant objection.
- SEO nuance: identity ≠ keywords. Pages may still *target* "freelance forward deployed engineer" searches (comparison/informational framing) without Rohit wearing the label.
- Existing "Founding Engineer for Hire" homepage block is repositioned to the new label; founding-engineer service pages remain (they already earn GSC impressions) but link into the new cluster.

## 3. Hard constraints (from owner)

1. Contact = **contact form + mailto only**. No Calendly/booking tool.
2. **No pricing anywhere** — no numbers, no ranges. `Service.costRange` (schema-required) gets non-numeric copy, e.g. "Scoped per engagement — ask."
3. Case studies allowed, **but the fintech project is anonymized**: describe as "an India fintech-education platform" — never name it or link it.
4. UI rule (standing): Next.js App Router + DesignSync tokens; match existing component/CSS idiom.
5. `hunt` outbound skill: **out of scope** — owner declined changes.

## 4. Evidence base (research 2026-08-29)

- FDE job postings grew ~800% in 2025; fractional AI engineers billed $6k–18k/month (market context only — do not publish rates).
- SERPs for "hire forward deployed engineer" = staffing agencies (Uplers, WorkGenius, 8allocate, KORE1); **no individual owns the niche**. Solo site webmcp.pro ranks for MCP consulting; indie guide pages rank for "fractional AI engineer" — cluster is winnable.
- GSC (90d): near-zero clicks; hiring-intent queries already reach the site with zero targeting ("hire bolt.new developers" pos ~15, "hire replit developer") — purpose-built buyer pages will capture more.
- Service leads short-term come from LinkedIn case-study posts + existing outreach; SEO is the compounding layer (3–6 months to rank).

## 5. Keyword map

### Tier 1 — money pages (commercial intent)

| Keyword | Winnability | Target page |
|---|---|---|
| fractional forward deployed engineer | highest (unowned) | /services/forward-deployed-engineer |
| freelance forward deployed engineer | high (job boards only) | /services/forward-deployed-engineer |
| hire forward deployed engineer (AI) | medium | /services/forward-deployed-engineer |
| MCP integration consultant / hire MCP expert | high | /services/mcp-integration-consultant |
| fractional AI engineer (India/remote) | high | /services/fractional-ai-engineer |
| Claude Code consultant | highest (near-empty) | /services/fractional-ai-engineer (section) or dedicated post |

### Tier 2 — cluster posts (feed money pages via internal links)

- what does a forward deployed engineer do
- forward deployed engineer vs solutions engineer
- fractional AI engineer cost 2026 (discuss market, publish no own rates)
- how to hire a forward deployed engineer
- why AI pilots never reach production
- custom MCP server cost / MCP server development for enterprise
- freelance FDE vs fractional consultant — which does your company need

### Tier 3 — proof content

Case-study posts with real metrics: anonymized fintech-education platform deployment, dispatchr, agent eval pipelines.

## 6. Page architecture

1. **`/[locale]/hire`** — NEW dedicated money page. H1 "AI Consultant · Forward Deployed Engineer". Sections: outcomes-first intro → 3 case studies (anonymized fintech, dispatchr, agents suite) → 2 engagement models (fractional retainer 2 days/week · fixed-scope pilot — no prices) → stack (Claude, MCP, agents, evals) → FAQ → contact CTA (form/mailto). JSON-LD: Person + ProfessionalService + FAQPage.
2. **`/services/forward-deployed-engineer`**, **`/services/mcp-integration-consultant`**, **`/services/fractional-ai-engineer`** — 3 new entries in `src/data/services.ts` (existing data-driven route renders them).
3. **HireBlock reposition** — homepage block copy: founding-engineer framing → AI Consultant · FDE framing; CTA points to `/hire`.
4. **AuthorBio component** — every `/notes/[slug]` post ends with bio box ("Rohit Raj — AI Consultant · Forward Deployed Engineer") + `/hire` link. Sitewide footer gains a "Hire me" link.
5. **Internal-linking rule** — Tier-2 posts link to `/hire` + their matching service page.

## 7. Skill retargets (automation, in order)

1. **daily-seo-content**: (a) 2 of ~6 weekly slots → Tier-2 consulting cluster, worked through week by week from the baked-in list above; (b) every generated post includes AuthorBio + `/hire` CTA; (c) cluster posts auto-link to money pages; (d) topic picker gains buyer-intent mode alongside trend mode.
2. **linkedin-post**: new client-proof mode — problem → what was deployed → before/after metrics → one-line CTA; audience founders/CTOs. (LinkedIn = #1 near-term client channel per research.)
3. **x-post-daily**: ~2 posts/week become consulting-proof posts (case metrics, deployment lessons); rest unchanged.
4. **hunt**: NO CHANGES (owner decision).

## 8. Off-site (drafts only; owner submits)

Profile copy for: Go Fractional (AI engineer), MentorCruise (MCP consultant), Upwork FDE category. These marketplaces already own page-1 SERPs — listing there = immediate presence while own pages climb.

## 9. Success metrics

- GSC: impressions on Tier-1/Tier-2 queries (baseline today: 0), buyer-query positions.
- `/hire` + service-page visits.
- Contact-form/mailto submissions mentioning consulting.
- LinkedIn inbound DMs from client-proof posts.

## 10. Out of scope

- Pricing publication in any form.
- Product listings (ClauseGuard/Meshcraft) — separate initiative, not this pivot.
- hunt pipeline changes.
- Naming the fintech client.
