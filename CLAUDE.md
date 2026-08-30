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
- `github.ts` — GitHub repo metadata

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

Header > Hero > AIProjects > ReliabilitySection > Testimonials > Footer — all in `src/components/`. Each receives dictionary props for i18n.
