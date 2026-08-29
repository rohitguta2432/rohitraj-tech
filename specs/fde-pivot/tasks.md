# Tasks: FDE Consultant Pivot

Ordered. Each task independently verifiable. See [spec.md](./spec.md) + [plan.md](./plan.md).

## Phase 1 — money pages + sitewide CTA

- [x] 1.1 Read `src/data/services.ts` existing entry shape end-to-end; note how `costRange`/`cta`/`faqs` render in `src/app/[locale]/services/[slug]/page.tsx`
- [x] 1.2 Add `forward-deployed-engineer` service entry (no pricing; FAQ ≥4 questions)
- [x] 1.3 Add `mcp-integration-consultant` service entry
- [x] 1.4 Add `fractional-ai-engineer` service entry (Claude Code consulting section)
- [x] 1.5 Create `src/app/[locale]/hire/page.tsx` (+ opengraph image) with case studies (fintech anonymized), engagement models, FAQ, JSON-LD (Person/ProfessionalService/FAQPage), contact-form + mailto CTA
- [x] 1.6 Reposition `HireBlock` copy + all locale dicts → "AI Consultant · Forward Deployed Engineer", CTA → `/hire`
- [x] 1.7 New `AuthorBio` component; mount in notes `[slug]` template; "Hire me" link in `Footer`
- [x] 1.8 Verify `/hire` + new services in `sitemap.ts` output
- [x] 1.9 Typecheck + build green locally
- [x] 1.10 Commit (exclude pre-existing untracked files), push via PAT flow, deploy, verify live: `/hire`, one new service page, one note shows AuthorBio, JSON-LD validates

## Phase 2 — daily-seo-content skill

- [x] 2.1 Read current SKILL.md + scripts; map topic-selection + template steps
- [x] 2.2 Add buyer-intent mode with Tier-2 queue + done-tracking state
- [x] 2.3 Rotation: 2 fixed weekly slots use cluster mode
- [x] 2.4 Cluster-post template: `/hire` CTA paragraph + internal links to money pages; no-pricing guard
- [ ] 2.5 Dry-run one cluster post end-to-end (typecheck/build/deploy); confirm links + bio render

## Phase 3 — linkedin-post skill

- [x] 3.1 Add client-proof mode (problem → deployed → metrics → CTA); fintech anonymization rule
- [ ] 3.2 Generate one sample post for owner review

## Phase 4 — x-post-daily skill

- [x] 4.1 Add consulting-proof post type, 2 fixed days/week; 280 gate intact
- [ ] 4.2 Generate one sample post for owner review

## Phase 5 — marketplace drafts

- [x] 5.1 Write `marketplace-profiles.md` (Go Fractional, MentorCruise MCP, Upwork FDE) — owner submits

## Acceptance (whole pivot)

- [ ] Site self-describes as "AI Consultant · Forward Deployed Engineer" everywhere; word "freelancer" absent as self-label
- [ ] Zero pricing numbers site-wide (grep for `$`, `₹`, `/month`, `/mo` in new copy)
- [ ] Fintech project never named in new content
- [ ] Every note ends with AuthorBio → `/hire`
- [ ] GSC monitored for Tier-1/2 impressions in following weeks
