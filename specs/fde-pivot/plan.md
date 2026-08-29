# Plan: FDE Consultant Pivot — technical approach

Companion to [spec.md](./spec.md). Maps spec to this codebase.

## Codebase facts (verified 2026-08-29)

- Repo: `/Users/rohitraj/Documents/rohitraj-tech` → `github.com/rohitguta2432/rohitraj-tech` (push via `GH_PAT_ROHITGUTA2432` embedded-URL flow; active `gh` account is different — do not switch).
- Next 16.1.6, App Router, i18n via `src/app/[locale]/…` + `HomeDictionary`/`Locale` from `@/lib/i18n`.
- Blog: 142 posts as TS modules in `src/data/posts/*.ts`, registered in `src/data/blog-posts.ts`, zod type `src/types/blog.ts`, rendered at `/[locale]/notes/[slug]` (`src/app/[locale]/notes/[slug]/page.tsx`). Summaries generated into `src/data/blog-summaries.generated.ts`.
- Services: zod schema `src/types/service.ts` (`costRange` is a REQUIRED string), data `src/data/services.ts` (existing slugs incl. `hire-founding-engineer-india`, `hire-fractional-cto-india`), rendered at `/[locale]/services/[slug]`.
- Homepage hire section: `src/components/HireBlock.tsx` (has `FALLBACK` copy; real copy likely in i18n dicts — update both).
- SEO infra: `src/app/sitemap.ts`, `src/app/feed.xml`, `src/app/llms-full.txt`, `src/lib/seo-config.ts`.
- Deploy: Vercel CLI flow used by daily-seo-content skill (reuse its exact steps; verify remote before push).
- Working tree has unrelated untracked files (`src/components/AIProjects.tsx`, tests, `scripts/__pycache__`) — leave untouched, never commit them with pivot work.

## Phase 1 — money pages + sitewide CTA

1. **`src/data/services.ts`**: add 3 entries validated by `serviceSchema`:
   - `forward-deployed-engineer` — title/meta target "hire forward deployed engineer", "fractional/freelance FDE"; FAQ seeds FAQPage schema; `costRange: "Scoped per engagement — ask."` (constraint: no numbers anywhere).
   - `mcp-integration-consultant`
   - `fractional-ai-engineer` (include Claude Code consulting section)
   - `portfolioSlugs`: reuse existing project slugs (dispatchr, agents); NO fintech name.
2. **`src/app/[locale]/hire/page.tsx`**: new route. Server component assembling: intro (outcomes), case studies (3 — fintech anonymized), engagement models (no prices), stack, FAQ, contact CTA reusing existing `/contact` form + `mailto:`. JSON-LD `<script type="application/ld+json">`: Person, ProfessionalService, FAQPage. Add opengraph-image following siblings' pattern.
3. **`src/components/HireBlock.tsx` + i18n dicts**: reposition copy to "AI Consultant · Forward Deployed Engineer"; CTA → `/hire`. Update every locale dictionary that carries `hire.*` keys (find via grep for current heading string).
4. **`src/components/AuthorBio.tsx`** (new): compact bio + `/hire` link; mount at bottom of `src/app/[locale]/notes/[slug]/page.tsx`; add "Hire me" link to `Footer.tsx` nav.
5. **SEO plumbing**: confirm `sitemap.ts` picks up services/notes dynamically (it should — verify); ensure `/hire` added; `llms-full.txt` + `feed.xml` untouched unless they enumerate routes manually.
6. **Verify**: `npx tsc --noEmit` (or repo's typecheck script), `npm run build`, zod validation runs at import. Deploy per daily-seo-content pipeline. Post-deploy: fetch live `/hire`, one service page, one note (bio present), validate JSON-LD with a schema checker.

## Phase 2 — daily-seo-content skill

File: `~/.claude/skills/daily-seo-content/SKILL.md` (+ any scripts it carries).

1. Add **buyer-intent topic mode**: baked-in Tier-2 keyword queue from spec §5; state file tracks which cluster topics are done.
2. Rotation rule: 2 of 6 weekly slots (pick fixed days, e.g. Tue + Sat) use cluster mode; others stay trend mode.
3. Post template additions (ALL posts): AuthorBio presence is automatic once Phase 1 mounts it in the notes template — skill only needs the `/hire` CTA paragraph + internal links for cluster posts (link `/hire` + matching service page).
4. Guard: skill must not add pricing numbers to cluster posts.

## Phase 3 — linkedin-post skill

File: `~/.claude/skills/linkedin-post/SKILL.md`.

- Add **client-proof mode** (trigger: "client proof" / weekly cadence note): structure problem → what I deployed → before/after metrics → one-line CTA ("I take 1–2 fractional FDE engagements — link in profile"). Audience founders/CTOs; keep simple-English + example-led rules from memory. Fintech references stay anonymized.

## Phase 4 — x-post-daily skill

File: `~/.claude/skills/x-post-daily/SKILL.md`.

- Add consulting-proof post type, ~2/week (e.g. Wed + Sun): one deployment lesson or metric + link to `/hire` or a cluster post. 280-char gate unchanged.

## Phase 5 — marketplace profile drafts

- `specs/fde-pivot/marketplace-profiles.md`: ready-to-paste copy for Go Fractional, MentorCruise (MCP), Upwork FDE category. Owner submits manually (accounts/consent are his).

## Risks

- `costRange` rendered UI may prefix with "Cost:" — check the services template renders the non-numeric string sanely.
- i18n: missing dict keys fall back to `FALLBACK` in HireBlock but service/hire pages must handle non-EN locales (mirror existing pages' pattern).
- 142 existing posts: AuthorBio mounts via template — zero per-post edits; do NOT batch-edit post files.
- Commit hygiene: pivot commits exclude the pre-existing untracked files.
