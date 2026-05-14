# Terminal Portfolio

## What This Is

A personal portfolio site for Bakytbek Tatibekov (Sr. Software Engineer) reskinned as a high-fidelity terminal/IDE interface — file-tree sidebar, six switchable content views (about, projects, stack, experience, writing, contact) plus a 7th `shipped.app` view for shipped mobile apps, ⌘K command palette, light/dark themes, and a hue-swappable accent. The frontend is a Next.js 15 / React 19 app at `portfolio-web/`; content is served by an existing API at the sibling repo `portfolio-services/` with a static fallback embedded in the frontend.

## Core Value

A distinctive personal portfolio that signals engineering craft through a terminal/IDE aesthetic — without making non-technical recruiters work to find the resume and contact info.

## Requirements

### Validated

<!-- Inferred from existing portfolio-web/ codebase + shipped in v1.0 milestone. -->

**Pre-v1.0 (existing foundations):**
- ✓ Next.js 15 App Router scaffolding with TypeScript strict mode — existing
- ✓ ISR-cached API integration with graceful static fallback (`lib/api.ts`) — existing
- ✓ SEO baseline: `app/robots.ts`, `app/sitemap.ts`, Next.js metadata API — existing
- ✓ Vitest + Testing Library + jsdom test setup — existing
- ✓ Vercel-deployable with `npm run build` / `npm run start` — existing
- ✓ ESLint via `next/core-web-vitals` — existing (migrated to flat config in v1.0)

**Shipped in v1.0 (2026-05-14):**
- ✓ Terminal shell UI: sticky top bar + 240px sidebar + 920px main column — v1.0 Phase 2
- ✓ All 7 views with handoff-fidelity styling (`about.md`, `projects/`, `stack.json`, `experience.log`, `writing/`, `contact.sh`, `shipped.app`) — v1.0 Phase 3
- ✓ Per-view App Router routes sharing the terminal shell layout; each route shareable + indexable — v1.0 Phase 3
- ✓ ⌘K / Ctrl-K command palette with 18 verbs, type-to-filter, focus trap, aria-live result count — v1.0 Phase 2
- ✓ Light + dark themes with `data-theme` attribute, OS-preference detection, localStorage persistence, dual-script SSR-flash prevention — v1.0 Phase 2
- ✓ Hue-swappable accent (matrix / amber / cyan / magenta) persisted to localStorage; pre-paint IIFE — v1.0 Phase 2
- ✓ Fully responsive: bottom-sheet drawer + touch palette + sidebar rehome below ~960px + print stylesheet — v1.0 Phase 4
- ✓ Backend cutover: `/api/projects` greenfield + 5 endpoint reshapes; deployed on Railway production — v1.0 Phase 6
- ✓ Static seed data in `lib/portfolio-data.ts` (typed; byte-mirrors backend seed per D-14) — v1.0 Phase 6
- ✓ Real resume PDF (58440 bytes, Title+Author metadata via pdf-lib) + companion DOCX, build-pipeline magic-byte gates — v1.0 Phase 6
- ✓ All real content populated; INFRA-05 grep clean on every build — v1.0 Phase 6
- ✓ Recruiter discoverability target (desktop + DevTools emulated mobile): TopBar resume + /about contact rehome — v1.0 Phase 4 + Phase 5 (⚠ physical recruiter test deferred to v1.1 — see Active)
- ✓ Vitest coverage: 161 tests across shell, palette, theme, accent, all 7 views, JSON-LD, console signature, mobile audits — v1.0 Phases 2/3/4/5
- ✓ Deployed to https://www.tatibekov.com with full sitemap, JSON-LD Person, GSC verified, 8 next/og OG images — v1.0 Phase 5 + Phase 7

### Active

<!-- v1.1 hypotheses populate here when /gsd-new-milestone runs. v1.0 carry-forwards listed in STATE.md Deferred Items. -->

- [ ] Recruiter discoverability — physical-subject validation: DEPLOY-04 5-second recruiter hand-off test (non-engineer subject on desktop + 375px mobile) deferred from v1.0. Dual-audience claim (Phase 7 ROADMAP SC4) currently rests on DevTools emulation + self-simulation only.

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

**Current codebase state (portfolio-web/) — post-v1.0:**
- Next.js 15.5.x, React 19, TypeScript 5.x strict (engines.node "22.x")
- Persistent terminal shell at `app/(terminal)/layout.tsx` (RSC) with 7 sibling routes; legacy `app/components/homepage.tsx` + `lib/fallback-data.ts` deleted in same commit as replacements
- 8 client islands: TopBar, Sidebar, CommandPalette, LiveClock, Breadcrumb, ShellStateProvider, ThemeProvider, ExplorerDrawer, ConsoleSignature (4 of these are inside `(terminal)/layout.tsx`'s tree)
- `lib/routes.ts` is single source of truth for 7 routes; consumed by Sidebar, CommandPalette, `app/sitemap.ts`, `app/not-found.tsx`
- `lib/api.ts` ISR-chokepoint pattern preserved; 6 fetchers + getJson<T>(path, fallback) with `next: { revalidate: 300 }` and static fallback to `lib/portfolio-data.ts`
- Pure CSS in `app/globals.css` (~2300 lines); oklch token palette with `@supports` sRGB fallbacks; CSS custom properties (`--accent-hue`, `--accent-2*` series, theme tokens)
- 161 Vitest tests across shell/palette/theme/accent/views/json-ld/console-signature; Playwright axe-core matrix (56 cells: 4 hues × 2 themes × 7 routes) WCAG 2.1 AA
- ESLint 9 flat config (`eslint.config.mjs`); Knip orphan detection; INFRA-05 postbuild placeholder grep; 3 mobile audit scripts
- 3 prod deps: `next-themes@^0.4.6`, `cmdk@^1.1.1`, `@vercel/analytics@^2.0.1`
- LOC: ~7,100 across `app/` + `lib/` (TS/TSX/CSS/MJS)

**Sibling backend (portfolio-services/) — post-v1.0:**
- Lives at `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/`
- Deployed at https://personal-portfolio-services-production.up.railway.app (Express + Mongoose, NODE_ENV=production)
- 7 v1 API endpoints live: `/api/profile`, `/api/projects` (greenfield in Phase 6), `/api/stack` (renamed from `/api/skills`), `/api/experience`, `/api/apps`, `/api/posts`, `/api/health`
- All endpoint shapes byte-mirror FE `lib/types.ts` (D-14 discipline; `strict: 'throw'` Mongoose schemas enforce drift)
- Mongo seeded with real content: profile=1 / projects=3 / stack=4 / experience=3 / apps=2 (CarEx + MoveIn) / posts=1

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
| Full handoff scope in v1 (all 6 designed views + 7th `shipped.app` view + ⌘K palette + accent hue swap + light/dark) | Handoff is high-fidelity and settled; splitting would create churn and an awkward "half-terminal" interim release | ✓ Good — shipped v1.0 |
| Add 7th view `shipped.app` for mobile apps | Existing site has a Mobile Apps section that the handoff omits; mobile work is part of this developer's identity and shouldn't be lost in the redesign | ✓ Good — shipped v1.0 |
| Backend in scope at sibling `portfolio-services/` — add `/api/projects`, adjust shapes | Terminal data model needs a projects endpoint and shape changes; user owns the backend and is willing to evolve it in the same milestone | ✓ Good — shipped v1.0 |
| Per-view App Router routes (one route per terminal view, terminal shell as shared layout) instead of single-page hash/query routing | Existing SEO baseline shouldn't regress; per-view routes are shareable, indexable, and integrate naturally with the existing sitemap | ✓ Good — shipped v1.0 |
| Skip the tweaks panel entirely in production | Handoff explicitly marks it as a design tool, not a public feature | ✓ Good — shipped v1.0 |
| Fully responsive (first-class mobile), not desktop-only | Recruiter audience commitment — cannot tell a recruiter on a phone "best viewed on desktop" | ✓ Good — shipped v1.0 |
| Replace `app/components/homepage.tsx` and delete `homepage.test.tsx`; do not preserve old homepage at a legacy route | This is a redesign, not an A/B; old surface is being retired | ✓ Good — shipped v1.0 |
| "Done" = deployed + all real content populated (no placeholders) | User-defined; the practical definition that matters to portfolio purpose | ✓ Good — shipped v1.0 |
| Use `next-themes` for theme management and `cmdk` for the command palette (per handoff recommendation) | Both are mature, well-fit primitives; building from scratch wastes effort on solved problems (focus management, persistence, SSR flash avoidance) | ✓ Good — shipped v1.0 |
| Continue with pure CSS + CSS variables; no styling-framework swap | Handoff is token-driven and dynamic-palette-based — CSS custom properties are the idiomatic fit; introducing Tailwind mid-redesign is unrelated scope | ✓ Good — shipped v1.0 |
| Keep API integration model (not static-only); static fallback in `lib/portfolio-data.ts` for offline / API-down scenarios | Preserves dynamic-content option for projects/writing/shipped apps without sacrificing resilience | ✓ Good — shipped v1.0 |

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

### Phase 7 evolution (2026-05-14)

- **Third prod dep allowlisted (D-08, D-09):** `@vercel/analytics@^2.0.1` added for `resume_download` event tracking (DEPLOY-06). Total v1 prod deps: 3 (`next-themes`, `cmdk`, `@vercel/analytics`). Same "no new prod deps" rule applies going forward; CLAUDE.md Stack constraints updated with the Phase 7 exception note.
- **`x-portfolio-source` HTTP header DROPPED (D-04):** The slot was Phase 5 D-30 `DEFERRED-PHASE-7`. Phase 7 resolved-as-dropped because the repo is private — pointing engineers at an inaccessible GitHub URL adds no signal and needlessly signals private-repo existence. DEV-03 status: `PASS-with-deviation` — only `x-built-with` ships in production. If repo goes public in v1.1, this decision flips and the header gets re-added.
- **Real-device carry-forwards closed via DevTools emulation (D-18):** Phase 4 Gates 7+8 (iPhone Safari + Android Chrome) and Phase 5 Gate 3 (reduce-motion real-device) closed via Chrome DevTools emulation at 375px × 7 routes + Phase 5 56-cell axe matrix (4 hues × 2 themes × 7 routes WCAG 2.1 AA) + Plan 04 PageSpeed Insights mobile profile. **Consciously-accepted limitations (NOT physically validated in v1):** Safari `dvh`/`svh` viewport units, soft-keyboard behavior in palette / contact inputs, mobile address-bar overlap at TopBar, `-webkit-overflow-scrolling: touch` momentum scrolling. A v1.1 user report along any of these dimensions triggers physical-device validation.
- **Canonical site URL = https://www.tatibekov.com (D-01):** `NEXT_PUBLIC_SITE_URL` set in Vercel Production env scope and inlined into the client bundle at build time; apex `tatibekov.com` 307s to www; Vercel-hostname alias `personal-portfolio-web-orcin.vercel.app` remains a Production alias and de-duplicates via canonical URLs from `app/sitemap.ts` (no explicit noindex required).
- **GSC Domain property at `tatibekov.com` (D-06, D-07):** DNS TXT verification (**PERMANENT** — must not be removed; Google re-checks periodically and deletion un-verifies the property); `sitemap.xml` submitted with Success status. Per-route indexing coverage DEFERRED-INDEXING-WAIT 24-48h after sitemap submission (per Pitfall 2, brand-new domains commonly show 7-21 days before full Indexed status; `Discovered` status counts toward DEPLOY-03 pass per D-07).
- **Phase 7 verdict — PARTIAL-PASS-WITH-DEFERRALS:** No code defects; deferred items are attestation gates (recruiter subject not recruited in-window; indexing async; analytics dashboard verification needs clean incognito test). v1 milestone is shippable in this state; the deferred items get follow-up TODOs against the canonical 07-VERIFICATION.md sign-off.

### v1.0 milestone close (2026-05-14)

- **Milestone shipped.** 7 phases / 58 plans / 106 tasks / 324 commits / ~7,100 LOC (app + lib). Production live at https://www.tatibekov.com. Backend live on Railway.
- **Requirements:** All 89 v1 requirements verified at phase level (`milestones/v1.0-REQUIREMENTS.md`). Pre-v1.0 foundations + v1.0-shipped items moved into Validated above.
- **Human UAT close-out:** Phase 1 VERIFICATION 2 of 3 PASS + 1 deferred (branch protection); Phase 2 VERIFICATION 4 of 4 PASS; Phase 7 VERIFICATION 3 of 3 deferred-to-v1.1 attestation gates (DEPLOY-03 indexing-coverage 24-48h crawl, DEPLOY-04 5-second recruiter test, DEPLOY-06 Vercel Analytics ingestion event). All 4 deferred items captured in STATE.md `## Deferred Items` table for v1.1 pickup.
- **Pre-close artifact audit:** Run via `gsd-sdk query audit-open`; all items cleared (UAT files marked `status: complete`, VERIFICATION marked `status: pass-with-deferrals`, quick-task `260514-d7m` SUMMARY.md recognized).
- **All v1.0 phase Key Decisions confirmed ✓ Good** — table reflects shipped reality.
- **Carry-forwards into v1.1 active:** Physical recruiter test for DEPLOY-04 (Active). Operational deferrals (branch protection, indexing snapshot, analytics event retest) live in STATE.md Deferred Items.

---
*Last updated: 2026-05-14 after v1.0 milestone close — `/gsd-complete-milestone v1.0`. Next: `/gsd-new-milestone` to scope v1.1.*
