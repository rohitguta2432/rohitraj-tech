# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (flat config, next/core-web-vitals + next/typescript)
npm start        # Serve production build
```

No test runner is configured yet.

## Architecture

This is a Next.js 16 App Router portfolio site for Rohit Raj (rohitraj.tech), using React 19, Tailwind CSS 4, and TypeScript.

### Routing

The site is English-only at bare paths — pages live directly under `src/app/` (`/about`, `/notes/[slug]`, …). There is no middleware. The former locale-prefixed URLs (`/en/*`, `/hi/*`, `/fr/*`, `/de/*`, `/ar/*`) are 301-redirected to the bare path via `redirects()` in `next.config.ts` — do not reintroduce a `[locale]` segment or locale detection; it was removed deliberately to consolidate SEO signals on one URL per page.

Copy still lives in dictionaries: JSON files in `content/en/` with four namespaces (`common`, `home`, `pages`, `meta`), loaded via `getDictionary()` in `src/lib/i18n.ts` and passed as props to components.

### Layout hierarchy

- `src/app/layout.tsx` — root layout, loads fonts (Big Shoulders, Chivo, JetBrains Mono), injects JSON-LD schemas, sets metadata defaults
- `src/app/global-error.tsx` — fatal-error boundary that renders its own `<html>`; `src/app/error.tsx` is the in-layout boundary

### Data layer

All content data is hardcoded in `src/data/`:
- `projects.ts` — AI project definitions
- `blog-posts.ts` — engineering notes (~3K lines, monolithic)
- `services.ts` — freelance service offerings

### Key modules

- `src/lib/supabase.ts` — Supabase client for email subscriptions (has hardcoded fallback credentials)
- `src/lib/seo-config.ts` — centralized SEO metadata, JSON-LD schema generators (Person, Service, BlogPosting, FAQ, Breadcrumb, SoftwareApplication)
- `src/lib/i18n.ts` — dictionary types and the `getDictionary()` loader (English-only)

### Styling

Tailwind CSS 4 via `@tailwindcss/postcss` plugin. CSS custom properties defined in `src/app/globals.css` (light theme only — no dark mode overrides exist for core variables). Many components use inline `style` objects instead of Tailwind classes.

### Path alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Security headers

Configured in `next.config.ts`: HSTS, X-Frame-Options DENY, CSP-adjacent headers applied to all routes.

## Landing page sections (in render order)

Header > Hero > HireBlock > WorkIndex > WritingIndex > ProcessTimeline > Testimonials > FAQ > ClosingCta > Footer — all in `src/components/`. Most receive dictionary props for i18n.

The ground is a vermilion cloth case (`--cloth`, `--cloth-weave` in `globals.css`): every page's `<main>` is one white ledger page bound into it, stitched along its long edges, with the header and footer printed on the cloth. Narrow pages size their page with `sheet-narrow` (project detail), `sheet-column` (services, hire) or `sheet-notes`; the home page uses `main.stage` with a `.sheet` between the film and the closing call, which sit on the cloth. Page titles share one poster rule (`.page-title`, `.headline` and friends) in the display face; text on the cloth uses `--on-brand` / `--on-cloth-muted`.

The brand marks live in `src/components/brand/`: `DepartureLogo` (`Flaps.tsx`, the header's split-flap board reading BLR → the visitor's airport from their timezone, rolling once per browser session), `ProofMark` (beside the WorkIndex heading: one ray per entry in `src/data/projects.ts`, as long as its tech stack, with a flap readout naming the product under the sweep), `Stickers.tsx` (holographic die-cut stickers — `StickerSheet` in the footer, `EdgeStickers` across inner pages' long edges, hidden on the home page and below 1100px) and `HoloLight` (one pointer listener in the root layout that moves the foil's light through `--holo-x`, `--holo-y`, `--holo-a`). All of them respect reduced motion. The burst and the "N running" counts derive from `projects.ts`, so add products there rather than editing the marks.

`src/components/brand/share.tsx` draws the same marks for the image routes, at build time: the icons (`src/app/icon.tsx` at 32/192/512 and `apple-icon.tsx` — the 32px tab icon samples 12 rays, since 34 fuse into a disc at that size; `favicon.ico` is that 32px render plus a 16px downsample, so regenerate it if the mark changes) and the 1200×630 share cards (`opengraph-image.tsx` at the root, `/hire`, `/about`, `/contact` and every project, whose card lights its own ray). Satori reads TTF, not woff2, so `src/app/fonts/big-shoulders-800.ttf` and `chivo-400.ttf` are static cuts kept for it. Keep these routes on the Node runtime and static (project cards export `generateStaticParams`). Next attaches a page's own card only when that page's metadata names no images, so pass `ownCard: true` to `createPageMetadata` on any page that has an `opengraph-image` file; every other page falls back to the root card.

`/repos` and `/reliability/*` were removed on 2026-10-24 (zero search impressions in 90 days) and 301 to `/projects` and `/services/forward-deployed-engineer` in `next.config.ts`; don't recreate them.

`Testimonials` (also on `/hire` and every `/services/*` page) renders nothing while `src/data/testimonials.ts` is empty. Add only real client quotes published with the client's permission — never placeholder or invented ones.

The Hero plays Megacity Awakening, a live WebGL film, behind its server-rendered copy. `HeroFilm` (client) wraps the hero, shows `public/images/megacity/poster.webp` first, and dynamically imports `src/components/megacity/engine.ts` (three.js, pinned to 0.160.0) only after page load — so three.js never enters the page's first bundle. Keep any new import of the engine dynamic; `timeline.ts` is the three-free module for shared timeline constants.
