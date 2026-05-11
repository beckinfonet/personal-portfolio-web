# Terminal Portfolio

## What This Is

A personal portfolio site for Bakytbek Tatibekov (Sr. Software Engineer) reskinned as a high-fidelity terminal/IDE interface — file-tree sidebar, six switchable content views (about, projects, stack, experience, writing, contact) plus a 7th `shipped.app` view for shipped mobile apps, ⌘K command palette, light/dark themes, and a hue-swappable accent. The frontend is a Next.js 15 / React 19 app at `portfolio-web/`; content is served by an existing API at the sibling repo `portfolio-services/` with a static fallback embedded in the frontend.

## Core Value

A distinctive personal portfolio that signals engineering craft through a terminal/IDE aesthetic — without making non-technical recruiters work to find the resume and contact info.

## Requirements

### Validated

<!-- Inferred from existing portfolio-web/ codebase. These are the proven foundations the redesign builds on. -->

- ✓ Next.js 15 App Router scaffolding with TypeScript strict mode — existing
- ✓ ISR-cached API integration with graceful static fallback (`lib/api.ts`) — existing
- ✓ SEO baseline: `app/robots.ts`, `app/sitemap.ts`, Next.js metadata API — existing
- ✓ Light/dark theme toggle with persistence (will be replaced but pattern proven) — existing
- ✓ Vitest + Testing Library + jsdom test setup — existing
- ✓ Vercel-deployable with `npm run build` / `npm run start` — existing
- ✓ ESLint via `next/core-web-vitals` — existing

### Active

<!-- v1 hypotheses for the terminal redesign milestone. Validated when shipped. -->

- [ ] Terminal shell UI: sticky top bar (traffic-light dots, path label, ⌘K button, theme toggle, live HH:MM clock) + 240px sidebar (file tree, "for recruiters" resume card, status block) + 920px main column
- [ ] All 7 views rendered with handoff-fidelity styling: `about.md`, `projects/`, `stack.json`, `experience.log`, `writing/`, `contact.sh`, `shipped.app`
- [ ] Per-view App Router routes (`/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`) sharing the terminal shell layout — every view has a shareable URL and a sitemap entry
- [ ] ⌘K / Ctrl-K command palette: open each view, download resume, toggle theme, open each social, type-to-filter
- [ ] Light + dark themes with `data-theme` attribute, OS-preference detection on first load, localStorage persistence, no SSR flash
- [ ] Hue-swappable accent (matrix / amber / cyan / magenta) as a real user setting persisted to localStorage
- [ ] Fully responsive: bottom-sheet or hamburger file switcher below ~960px, touch-friendly ⌘K replacement, optimized typography for phones
- [x] Backend: add `/api/projects` endpoint and adjust existing endpoints' shapes to match the terminal data model in `portfolio-services/` — Validated in Phase 6 (Wave 7 projects greenfield + Waves 2-6 reshapes; all 7 v1 endpoints live on Railway production: https://personal-portfolio-services-production.up.railway.app)
- [ ] Static seed data in `lib/portfolio-data.ts` (typed) used as fallback when API is unreachable, matching the new shape
- [x] Real resume PDF in `public/resume.pdf` (downloads as `Bakytbek_Tatibekov_Resume.pdf`) — Validated in Phase 6 Wave 8 (canonical filename, 58440 bytes, Title + Author metadata via pdf-lib; companion DOCX shipped at orchestrator extension 1; build-pipeline gates wired into npm run prebuild)
- [ ] Recruiter discoverability: resume button + contact link findable in <5 seconds on a fresh visit, on both desktop and mobile
- [x] All real content populated — no placeholder text in shipped views (final bio, full project list, real writing posts, real shipped apps) — Validated in Phase 6 (Mongo seeded against production Railway with real content: profile=1 / projects=3 / stack=4 / experience=3 / apps=2 CarEx+MoveIn / posts=1; INFRA-05 grep clean on every build via postbuild script)
- [ ] Vitest coverage for the terminal shell, view switching, ⌘K palette, theme toggle, and accent picker (replacing the deleted `homepage.test.tsx`)
- [ ] Deployed to production URL with full sitemap

### Out of Scope

<!-- Explicit boundaries with reasoning. Prevents re-adding without revisiting the rationale. -->

- **Tweaks panel** (live theme/font/scanline picker from the handoff bundle) — design tool only, handoff explicitly says "do NOT ship to production site"
- **Multi-language / i18n** — single-audience portfolio; the cost of i18n outweighs the reach
- **CMS or admin dashboard for content updates** — static TS + sibling API already cover content lifecycle
- **Contact form with backend submission** — `contact.sh` view exposes social/email links only; no inbound form, no message storage
- **Comments / reactions on writing posts** — out of brand for a terminal portfolio; adds infra without value
- **Analytics / tracking pixels in v1** — defer until after launch when there's traffic worth measuring
- **E-commerce, paid services, lead-gen funnels** — this is a portfolio, not a sales site
- **Direct port of the handoff `app.jsx` / `tweaks-panel.jsx`** — handoff is a design reference, not source code; rebuild idiomatically inside Next.js

## Context

**Existing codebase state (portfolio-web/):**
- Next.js 15.3.2, React 19.1.0, TypeScript 5.8.3
- Single-page recruiter-friendly homepage at `app/page.tsx` rendering `app/components/homepage.tsx`
- Theme toggle at `app/components/theme-toggle.tsx` (will be replaced by the terminal-shell theme/accent system)
- API client at `lib/api.ts` with five endpoints (`/api/profile`, `/api/skills`, `/api/experience`, `/api/apps`, `/api/posts`); fallback data in `lib/fallback-data.ts`; types in `lib/types.ts`
- Single Vitest smoke test at `app/components/homepage.test.tsx` — to be deleted with the old homepage
- No CSS framework: pure CSS in `app/globals.css`. The redesign will continue with CSS variables (no Tailwind / no CSS modules switch)
- Detailed codebase intelligence in `.planning/codebase/` (7 docs, mapped 2026-05-06)

**Sibling backend (portfolio-services/):**
- Lives at `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/`
- Owned by the same developer; in scope for this milestone
- Currently exposes the five `/api/*` endpoints listed above; needs `/api/projects` added and existing shapes adjusted to match the terminal data model

**Design handoff (`design_handoff_terminal_portfolio/`):**
- High-fidelity React/HTML prototype: `app.jsx` (605 lines), `data.js`, `tweaks-panel.jsx`, `index.html`, screenshots, README
- Settled colors (oklch tokens, hue-driven palette generation), typography (JetBrains Mono via `next/font/google`), spacing scale, radii, motion
- README recommends `next-themes` (theme attribute) and `cmdk` (command palette) as the supporting libraries
- Default theme: dark; default accent hue: 145 (matrix green)
- Treat `app.jsx` as the canonical reference for any ambiguity in the README

**Audience:**
- Primary: engineering peers and tech-savvy hiring managers — the terminal aesthetic is the hook
- Secondary but non-negotiable: recruiters — the resume button and contact link must be obvious to someone who has never opened a terminal in their life

## Constraints

- **Tech stack**: Stay on Next.js App Router + React 19 + TypeScript strict + Vitest. No framework swap. — Existing investment, working setup, redesign is a UI/data effort not a re-platforming
- **Styling**: Continue with pure CSS + CSS custom properties (`app/globals.css`). No Tailwind, no CSS modules introduction. — Handoff palette is token-driven (oklch with hue swap); CSS variables are the natural fit; no need to take on a styling framework dependency
- **Single repo per concern**: Frontend changes in `portfolio-web/`, backend changes in sibling `portfolio-services/`. Each has its own git history. — Both already exist separately; don't merge them
- **SEO parity**: The redesign must not regress the existing SEO baseline. Per-view routes ship with sitemap entries from day one. — Existing site already invests in `robots.ts` + `sitemap.ts` + metadata; terminal aesthetic shouldn't cost discoverability
- **Recruiter usability floor**: Resume + contact discoverable in <5 seconds on first visit, desktop or mobile. — Audience commitment; the visual gimmick can't undermine the practical purpose
- **No content placeholders in production**: "Done" requires real bio, real project list, real writing posts, real shipped apps, real resume PDF. — User-defined definition of done
- **Hosting**: Vercel remains the deploy target. — Already configured per `README.md`; no reason to switch

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full handoff scope in v1 (all 6 designed views + 7th `shipped.app` view + ⌘K palette + accent hue swap + light/dark) | Handoff is high-fidelity and settled; splitting would create churn and an awkward "half-terminal" interim release | — Pending |
| Add 7th view `shipped.app` for mobile apps | Existing site has a Mobile Apps section that the handoff omits; mobile work is part of this developer's identity and shouldn't be lost in the redesign | — Pending |
| Backend in scope at sibling `portfolio-services/` — add `/api/projects`, adjust shapes | Terminal data model needs a projects endpoint and shape changes; user owns the backend and is willing to evolve it in the same milestone | — Pending |
| Per-view App Router routes (one route per terminal view, terminal shell as shared layout) instead of single-page hash/query routing | Existing SEO baseline shouldn't regress; per-view routes are shareable, indexable, and integrate naturally with the existing sitemap | — Pending |
| Skip the tweaks panel entirely in production | Handoff explicitly marks it as a design tool, not a public feature | — Pending |
| Fully responsive (first-class mobile), not desktop-only | Recruiter audience commitment — cannot tell a recruiter on a phone "best viewed on desktop" | — Pending |
| Replace `app/components/homepage.tsx` and delete `homepage.test.tsx`; do not preserve old homepage at a legacy route | This is a redesign, not an A/B; old surface is being retired | — Pending |
| "Done" = deployed + all real content populated (no placeholders) | User-defined; the practical definition that matters to portfolio purpose | — Pending |
| Use `next-themes` for theme management and `cmdk` for the command palette (per handoff recommendation) | Both are mature, well-fit primitives; building from scratch wastes effort on solved problems (focus management, persistence, SSR flash avoidance) | — Pending |
| Continue with pure CSS + CSS variables; no styling-framework swap | Handoff is token-driven and dynamic-palette-based — CSS custom properties are the idiomatic fit; introducing Tailwind mid-redesign is unrelated scope | — Pending |
| Keep API integration model (not static-only); static fallback in `lib/portfolio-data.ts` for offline / API-down scenarios | Preserves dynamic-content option for projects/writing/shipped apps without sacrificing resilience | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-11 after Phase 6 (Backend + Content Population) — verdict PASS, 12/12 requirements shipped, production cutover live end-to-end (Railway BE + Vercel FE). Phases 1-6 of 7 complete in milestone v1.0; Phase 7 (Deploy + Verification) is the final phase — production-URL Lighthouse, Search Console, npm audit, npx knip, and the 5-second recruiter test on both desktop and 375px mobile.*
