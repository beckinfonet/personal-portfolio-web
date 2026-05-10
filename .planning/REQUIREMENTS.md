# Requirements: Terminal Portfolio

**Defined:** 2026-05-06
**Core Value:** A distinctive personal portfolio that signals engineering craft through a terminal/IDE aesthetic — without making non-technical recruiters work to find the resume and contact info.

## v1 Requirements

Requirements for the terminal-redesign milestone. Each maps to a roadmap phase.

### Foundation (INFRA, DATA)

- [ ] **INFRA-01**: `next` upgraded from `15.3.2` to `^15.5.x` (resolves tracked security advisories surfaced in `.planning/codebase/CONCERNS.md`)
- [ ] **INFRA-02**: `next-themes@^0.4.6` and `cmdk@^1.1.1` installed (verified React 19 / Next 15 compatible per STACK.md)
- [ ] **INFRA-03**: GitHub Actions CI runs `lint + typecheck + test + knip + build` on every PR (Knip catches orphan files/exports introduced by the migration)
- [ ] **INFRA-04**: `next.config.ts` declares custom HTTP headers (e.g. `x-portfolio-source`, `x-built-with`) for engineer-discoverable metadata
- [ ] **INFRA-05**: `prebuild` script greps the build output for placeholder strings (`lorem`, `example.com`, `placeholder`, `TODO`) and fails the build on any hit
- [ ] **DATA-01**: `lib/types.ts` rewritten to the terminal data model (`Profile`, `Project`, `Social`, `Experience`, `Writing`, `ShippedApp`, `StackCategory`); becomes the single source of truth shared with the sibling backend
- [ ] **DATA-02**: `lib/portfolio-data.ts` created with the full typed dataset used as the static fallback (real values, no placeholders)
- [ ] **DATA-03**: `lib/fallback-data.ts` and the legacy `lib/types.ts` shape deleted in the same commit that introduces their replacements (no orphan code per Pitfall 11)
- [ ] **DATA-04**: `lib/api.ts` adapted to fetch the new shape from `portfolio-services/`; existing `getJson` ISR + graceful-fallback pattern preserved (per STACK.md)
- [ ] **DATA-05**: `lib/routes.ts` route registry exports a typed `const` array consumed by `Sidebar`, `CommandPalette`, and `app/sitemap.ts` (single source of truth)

### Shell (SHELL, THEME)

- [ ] **SHELL-01**: Persistent terminal shell at `app/(terminal)/layout.tsx` (route group) — never unmounts on navigation between the 7 sibling routes
- [ ] **SHELL-02**: `app/layout.tsx` remains a Server Component; only thin client islands (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`) carry `"use client"` (per Pitfall 9 — RSC boundary discipline)
- [ ] **SHELL-03**: Top bar renders three macOS-style traffic-light dots, the path label `~/portfolio — bakytbek@dev — zsh`, a ⌘K trigger button, a theme toggle, a live HH:MM clock, and a **persistent resume download button visible on every viewport** (per Risk 3 — recruiter usability)
- [ ] **SHELL-04**: 240px sidebar renders the EXPLORER file tree from `lib/routes.ts`, the dashed-border "for recruiters" resume card, and the STATUS block (`● Available for hire`, `uptime`, `tz`)
- [ ] **SHELL-05**: Active sidebar file is derived from `useSelectedLayoutSegment()` — never mirrored into Context or a store (per ARCHITECTURE.md anti-pattern); active file shows accent text, accent background tint, and 2px left border
- [ ] **SHELL-06**: Breadcrumb row renders `~/portfolio / <activeFile>` left and `press ⌘K for commands` hint right; pulled from `usePathname()` in a client component
- [ ] **SHELL-07**: Footer renders `© <year> <name>  ·  built with React  v1.0.0` on every view
- [ ] **SHELL-08**: 920px max-width main content column with `32px 40px 80px` padding; each view begins with a `$ <command>` prompt line + `slideIn` micro-animation (single 0.25s play)
- [ ] **SHELL-09**: Cursor blink (1s `steps(2)` infinite, 8×14px accent block) is the only looping animation in the entire app
- [ ] **THEME-01**: `next-themes` `ThemeProvider` mounted in root layout with `attribute="data-theme"`; respects `prefers-color-scheme` on first load when no stored value; default theme = dark (per handoff)
- [ ] **THEME-02**: Accent hue managed by an independent inline pre-paint script in `app/layout.tsx` that reads `localStorage["portfolio-accent"]` and sets `document.documentElement.style.setProperty('--accent-hue', hue)` synchronously before paint (per Risk 1 — `next-themes` does NOT manage CSS variables)
- [ ] **THEME-03**: `app/globals.css` defines the full oklch token palette derived from `--accent-hue` (matrix=145, amber=75, cyan=200, magenta=340) for both light and dark themes
- [ ] **THEME-04**: `@supports (color: oklch(0 0 0))` sRGB fallbacks present on every accent token (per Pitfall 8)
- [ ] **THEME-05**: User-facing accent picker UI exposes the four hues (matrix, amber, cyan, magenta); selection persists to `localStorage` and updates `--accent-hue` without a page reload or layout thrash
- [ ] **THEME-06**: JetBrains Mono loaded via `next/font/google` (weights 400/500/600/700, `display: 'swap'`, `--font-mono` CSS variable, monospace fallback chain `ui-monospace, "SF Mono", "Cascadia Mono", monospace` with `adjustFontFallback` to keep CLS < 0.1 per Pitfall 10)

### Routing & SEO (ROUTE, SEO)

- [ ] **ROUTE-01**: Seven per-view App Router routes exist under the terminal-shell layout: `/` (about), `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`
- [ ] **ROUTE-02**: Each `page.tsx` exports a unique `metadata` object (or `generateMetadata`) with route-specific `title`, `description`, and `alternates.canonical` (per Risk 4)
- [ ] **ROUTE-03**: `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")` set on root `app/layout.tsx` metadata (resolves the existing `metadataBase` warning surfaced in CONCERNS.md)
- [ ] **ROUTE-04**: `app/sitemap.ts` enumerates all 7 routes by mapping over `lib/routes.ts` (no hardcoding); `app/robots.ts` references the sitemap URL; `lastModified` set to build time
- [ ] **ROUTE-05**: Terminal-styled 404 page at `app/not-found.tsx` rendering inside the terminal shell (`$ cat /var/log/portfolio.log | grep "$pathname"` style) with links to all 7 views; returns HTTP 404 (verified with `curl -I`)
- [x] **SEO-01**: Twitter card metadata (`twitter: { card: "summary_large_image", ... }`) on root metadata; per-route OG inherits
- [ ] **SEO-02**: JSON-LD `Person` schema (`<script type="application/ld+json">`) in root layout with `@type: Person`, `jobTitle`, `url`, `sameAs: [github, linkedin, ...]`
- [x] **SEO-03**: Dynamic OG image per route via `opengraph-image.tsx` + `next/og` `ImageResponse`; pure-text design with name + role + active "file name" + accent block; JetBrains Mono passed as `fonts` to `ImageResponse`
- [x] **SEO-04**: Favicon set: `app/icon.tsx` (generated terminal-prompt glyph), `app/apple-icon.png`, `app/manifest.ts`, and `<meta name="theme-color">` per scheme
- [ ] **SEO-05**: External links use a shared `<ExternalLink>` component that sets `target="_blank"` and `rel="noopener noreferrer"`
- [ ] **SEO-06**: Per-project anchors (`/projects#project-name`) — deferred to v1.x per FEATURES.md prioritization (anchors will churn during initial content writing)

### Views (VIEW)

Each view is RSC by default; client behavior lives in shell-level islands.

- [ ] **VIEW-01**: `about.md` view at `/` — H1 name (26px/700), `// Sr. Software Engineer` subline in accent, two-paragraph bio (max 68ch), 3 stat cards (`7+ Years shipping`, `AWS Cloud-native`, `AI Agentic systems`) in a 480px row, CTA row with primary `↓ resume.pdf` + ghost social buttons (lowercased + trailing slash)
- [ ] **VIEW-02**: `projects/` view at `/projects` — `$ ls -la projects/` prompt, `total N · sorted by year desc` subhead, 3-column grid (`32px 1fr 110px`) per project: index, name+summary+tech chips, year+status+role
- [ ] **VIEW-03**: `stack.json` view at `/stack` — `$ cat stack.json | jq` prompt, syntax-highlighted JSON inside `<pre>` card (punctuation muted, keys warn-yellow, string values accent), top-right copy-JSON button
- [ ] **VIEW-04**: `experience.log` view at `/experience` — `$ git log --oneline --decorate experience.log` prompt, each row: 7-char hex hash (warn), role (accent/600), `@ company` (muted), period right-aligned (muted/12px), summary below (max 64ch)
- [ ] **VIEW-05**: `writing/` view at `/writing` — `$ ls writing/ && cat *.md` prompt, per post: `<DATE UPPERCASED · READTIME>` micro-meta, `› <title>` (16px/600/accent), excerpt (13px/max 64ch); v1 ships zero or N posts (decision in CONTENT-04)
- [ ] **VIEW-06**: `contact.sh` view at `/contact` — `$ ./contact.sh --whoami` prompt, lead paragraph, card (max-width 480px) with 90px label column + accent link rows, footer CTAs (resume + `github ↗`); email is a `mailto:` link with copyable plain-text address
- [ ] **VIEW-07**: `shipped.app` view at `/shipped` — 7th view (added beyond handoff); per app: name, platforms, real App Store / Play Store deep links, role, year; App Store / Play Store badges as inline SVG; copyable share URLs
- [ ] **VIEW-08**: Shared primitives extracted: `app/components/primitives/prompt-line.tsx` (the `$ <command>` line), `tech-chip.tsx`, `kbd.tsx` — used across views; per Pitfall 9 these stay RSC-friendly (no `"use client"`)

### Command Palette (PALETTE)

- [ ] **PALETTE-01**: `cmdk` mounted as a single `CommandPalette` client island available globally; opens on ⌘K / Ctrl-K, closes on Esc / backdrop click; modal centered, 520px max-width, mounted at `15vh`
- [ ] **PALETTE-02**: Verb taxonomy of **at least 15 verbs** (per FEATURES.md differentiator threshold): open each of the 7 views (7), download resume (1), toggle theme (1), open each social (≥3), copy email (1), copy GitHub profile URL (1), share this view / copy current URL (1), cycle accent hue (1) — total ≥16
- [ ] **PALETTE-03**: Type-to-filter against item label and aliases (e.g. `mail` matches `copy email`); result count exposed via `aria-live` region
- [ ] **PALETTE-04**: Focus trap inside the modal; on close, focus restored to the element that opened it (per Pitfall 6); palette uses `cmdk`'s built-in `Dialog.Title`
- [x] **PALETTE-05**: Mobile equivalent — palette opens as a bottom-sheet (or full-height modal) triggered by a hamburger / "command" button in the mobile top bar; same verb list and type-to-filter (per Pitfall 6 + Pitfall 7) — shipped in Phase 4 Plan 01 (CSS bottom-sheet overrides) + Plan 04-02 (state-machine intact under mutual exclusion; component-level mobile-toggle test added)

### Accessibility (A11Y)

- [ ] **A11Y-01**: Skip-link to `#main-content` revealed on `:focus` at the top of `<body>` (WCAG 2.4.1)
- [ ] **A11Y-02**: All interactive elements (sidebar buttons, palette items, palette trigger, theme toggle, accent picker, links) show a 2px accent `:focus-visible` outline with 2px offset; default outlines never killed without replacement
- [x] **A11Y-03**: `@media (prefers-reduced-motion: reduce)` block disables `slideIn`, dampens cursor blink, and stops boot-fade animations (WCAG 2.3.3)
- [ ] **A11Y-04**: Sidebar file rows are real `<button>` elements with `aria-label` that includes a plain-noun label (e.g. `aria-label="Contact information"` on `contact.sh`); `aria-current="page"` on the active row (per Risk 3 — recruiter usability)
- [ ] **A11Y-05**: Semantic landmarks: `<header>` for top bar, `<nav aria-label="File explorer">` for sidebar, `<main id="main-content">` for content, `<footer>` for credits
- [ ] **A11Y-06**: Live clock has `aria-hidden="true"` (decoration; no SR announcement every 30s)
- [ ] **A11Y-07**: Color contrast meets WCAG 2.1 AA: ≥ 4.5:1 for body, ≥ 3:1 for large text, audited across 4 hues × 2 themes = 8 combinations using `@axe-core/playwright`; per-hue chroma overrides applied where needed (amber on light theme is the predicted failure per Pitfall 8)
- [ ] **A11Y-08**: Full keyboard nav: tab order top-bar → palette button → theme toggle → sidebar files → main content → footer; ⌘K trap; Esc restores focus
- [x] **A11Y-09**: `@media print` stylesheet (white bg, black text, hide top bar / sidebar / palette, force serif fallback) so recruiter-printed pages are legible — shipped in Phase 4 Plan 01 (globals.css @media print block + check-print-rules.mjs CI gate)

### Responsive (MOBILE)

- [x] **MOBILE-01**: Mobile breakpoint at ~960px collapses the 240px sidebar; sidebar contents redistributed (NOT just `display: none` per Pitfall 7) — shipped in Phase 4 Plan 01 (CSS sidebar hide + paired drawer/about-status-mobile rehomes) + Plan 04-02 (ExplorerDrawer client island wired to TopBar trigger)
- [x] **MOBILE-02**: Bottom-sheet drawer for the EXPLORER file tree, triggered from a hamburger in the mobile top bar; 44×44px touch targets per WCAG 2.5.5 — shipped in Phase 4 Plan 04-02 (ExplorerDrawer with role=dialog aria-modal sheet rendering 7 ROUTES file rows + recruiter resume card; 44px padding from Plan 04-01 CSS)
- [x] **MOBILE-03**: Resume download CTA visible above the fold on the about view at 375px (mobile recruiter never has to scroll for resume per Risk 3) — unit-locked in Phase 4 Plan 04-03 (about-view.test.tsx asserts `<a download>` with aria-label "Download resume" renders); above-the-fold visual gate owned by Wave 4 manual review (04-05)
- [x] **MOBILE-04**: Sidebar STATUS block (`● Available for hire`, `uptime`, `tz`) rehomed to the about-view footer on mobile — shipped in Phase 4 Plan 04-03 (`<StatusBlock />` shared RSC primitive + `<StatusTz />` client leaf; AboutView renders `<div class="about-status-mobile"><StatusBlock /></div>` after CTA row; visibility via Plan 04-01 CSS — display:none default, display:block at <=960px)
- [x] **MOBILE-05**: Mobile palette UX (covered in PALETTE-05); responsive typography per handoff scale (4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 64 / 80px) — closed in Phase 4 Plan 04-05 manual verification (Phase 4 Verdict PASS); mobile palette UX validated at Gate 3 (375 / 768 bottom-sheet behavior PASS) and the responsive typography scale was confirmed via the cross-viewport screenshot review at 375 / 768 / 1024 + per-route print preview on all 7 routes

### Backend Coordination (BACKEND)

- [ ] **BACKEND-01**: New `/api/projects` endpoint added in sibling `portfolio-services/` returning `Project[]` matching the frontend `lib/types.ts` Project shape
- [ ] **BACKEND-02**: Existing `/api/profile`, `/api/skills`, `/api/experience`, `/api/apps`, `/api/posts` endpoint shapes adjusted to match the terminal data model (keys + nested structures aligned with `lib/types.ts`)
- [ ] **BACKEND-03**: API contract documented at `portfolio-services/docs/api-contract.md`; frontend and backend type changes ship in paired commits referencing each other (per ARCHITECTURE.md hand-mirror strategy)
- [ ] **BACKEND-04**: Sibling backend deployed before frontend cuts over to live API; static fallback in `lib/portfolio-data.ts` covers the gap until backend is live

### Content Population (CONTENT)

- [ ] **CONTENT-01**: Real bio (short + long), highlights, role string, location, email, social handles populated in `lib/portfolio-data.ts`
- [ ] **CONTENT-02**: Real project list populated (≥ 3 projects with name, year, status, summary, tech, role, link) — final v1 set
- [ ] **CONTENT-03**: Real `shipped.app` data populated with valid App Store + Google Play URLs (deep links resolved on tap from mobile)
- [ ] **CONTENT-04**: Writing posts populated — v1 ships **at least one real post**; "zero posts / coming soon" state acceptable only if explicitly chosen during the content phase
- [ ] **CONTENT-05**: Real `Bakytbek_Tatibekov_Resume.pdf` placed in `public/resume.pdf` (file size < 250KB, embedded font subset, internal `Title` / `Author` PDF metadata set)
- [ ] **CONTENT-06**: Final stack categories + entries populated for the `stack.json` view
- [ ] **CONTENT-07**: Final experience.log entries populated (role, company, period, summary)
- [ ] **CONTENT-08**: All placeholder strings (`example.com`, `Product Studio`, `lorem`, `TODO`, `placeholder`) verifiably absent from the production build (enforced by INFRA-05 prebuild script)

### Engineer Easter Eggs (DEV)

- [ ] **DEV-01**: `console.log` signature on first paint — JetBrains-style ASCII art name + "Like the site? Source at github.com/..." + email; mounted via `useEffect` in root layout
- [ ] **DEV-02**: 6-line HTML comment greeting in `<head>` for `view-source:` viewers (different message from console — e.g. job preferences, "want to talk?")
- [ ] **DEV-03**: Custom HTTP response headers (`x-portfolio-source`, `x-built-with: nextjs-15-react-19`) declared in `next.config.ts` `headers()` (covered by INFRA-04 — DEV-03 is the content/copy decision)

### Testing (TEST)

- [ ] **TEST-01**: `app/components/homepage.tsx` and `app/components/homepage.test.tsx` deleted in the same commit that introduces their replacement shell skeleton (no orphan code per Pitfall 11)
- [ ] **TEST-02**: Vitest coverage for the terminal shell — `TopBar` renders all required affordances, `Sidebar` renders all 7 routes from `lib/routes.ts`, active state derives from URL
- [ ] **TEST-03**: Vitest coverage for the command palette — opens on ⌘K, closes on Esc, filters items, restores focus on close
- [ ] **TEST-04**: Vitest coverage for theme + accent — toggle persists to localStorage, accent picker updates `--accent-hue` and persists, no SSR flash assertion (mock localStorage to verify pre-paint script)
- [ ] **TEST-05**: One smoke test per view (renders, has unique `<title>`, has prompt-line)

### Deploy & Verification (DEPLOY)

- [ ] **DEPLOY-01**: Production deploy on Vercel with `NEXT_PUBLIC_SITE_URL` set to the production origin
- [ ] **DEPLOY-02**: Lighthouse on the production URL: LCP < 2.5s mobile, CLS < 0.1, INP < 200ms, Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
- [ ] **DEPLOY-03**: Search Console — sitemap submitted, all 7 routes indexed
- [ ] **DEPLOY-04**: 5-second recruiter hand-off test passes on production URL — non-engineer can find resume + contact in under 5 seconds, on both desktop and 375px mobile (per Risk 3)
- [ ] **DEPLOY-05**: `npm audit` reports zero high/critical advisories; `npx knip` reports zero unused files/exports
- [ ] **DEPLOY-06**: Vercel Analytics enabled for resume-download event tracking (one event, validates Risk 3 prevention worked)
- [ ] **DEPLOY-07**: All shell elements verified at 375px mobile viewport (manual screenshot review — every shell element accessible, no overflow)

## v2 Requirements

Deferred to a follow-up release. Tracked but not in this milestone's roadmap.

### Palette Power-User

- **PALETTE-V2-01**: `?` cheatsheet view inside palette (defer until v1 verb taxonomy is finalized)
- **PALETTE-V2-02**: `g`+letter vim navigation (`g a`=about, `g p`=projects, `g s`=stack, `g e`=experience, `g w`=writing, `g c`=contact, `g h`=shipped) with 1s timeout and `document.activeElement` guard

### SEO Long-Tail

- **SEO-V2-01**: Per-project anchors in `/projects` and corresponding sitemap entries (defer until project list is stable)
- **SEO-V2-02**: Per-accent-hue OG image variants (defer; matrix-only is fine for v1)

### Engagement Signals

- **CONTENT-V2-01**: Live "currently building" / "currently reading" line in sidebar STATUS (defer until first content pass exposes maintenance willingness)
- **VIEW-V2-01**: `stack.json` tab-to-copy button on the `<pre>` card (defer; trivial follow-up if observed in palette analytics)

### Analytics

- **ANALY-V2-01**: Vercel Analytics + custom event for theme/accent changes and palette opens (DEPLOY-06 covers resume download only in v1)

### Job-Search Mode

- **VIEW-V3-01**: `hire-me.txt` 8th view with 3-paragraph "what I'm looking for" pitch — only relevant during active job search; add when actively interviewing, remove between cycles

### Future Content Pipeline

- **CONTENT-V3-01**: CMS / MDX-based writing pipeline (defer; only relevant if writing cadence increases beyond IDE-edit-and-PR comfort)

## Out of Scope

Explicitly excluded for the v1 milestone. Documented to prevent scope creep and re-debate. Inherits all PROJECT.md `Out of Scope` items; this list adds research-derived anti-features.

| Feature | Reason |
|---------|--------|
| Tweaks panel (live theme/font/scanline picker) | Inherited from PROJECT.md — handoff explicitly marks it as a design tool, not a public feature |
| Real interactive REPL / xterm.js shell | Two competing mental models (file-tree IDE + CLI); recruiters cannot use it; doubles test surface; HN feedback consistently splits engineers vs hiring managers |
| Typing animation on view body content | Delays LCP; annoying on every view switch; hostile to `prefers-reduced-motion` and screen readers |
| CRT scanlines / phosphor glow as default | Tanks legibility; vestibular trigger; explicitly out per PROJECT.md tweaks-panel exclusion |
| Background ambient sound (mechanical keyboard clack) | Recruiter embarrassment risk; autoplay audio is browser-blocked anyway; accessibility nightmare |
| Konami code easter egg | Discoverability is zero; replaced by console signature + view-source comment + HTTP header (broader reach, lower maintenance) |
| Visitor counter | Real counts need analytics infra (deferred); fake counts are dishonest; low numbers signal failure |
| "Now hiring" giant top-bar banner | `● Available for hire` in sidebar is enough; redundant placement; stale embarrassment when not hunting |
| Multiple themes beyond light/dark + 4 accent hues | Combinatorial test surface (4 × N × 7); token system already gives full hue control |
| In-app blog post editing UI / CMS | PROJECT.md out of scope; ship posts via PR |
| AI chatbot ("Ask the portfolio anything") | Cost per session; hallucination liability for bio facts; recruiter trust loss |
| Comments on writing posts | Out of brand; PROJECT.md out of scope |
| Login / authenticated areas / "private" projects gate | Recruiter completion rate ~0%; describe NDA work in plain text instead |
| Loading spinners between view switches | Adds latency for no value; views are static markup; the 0.25s slideIn is the only acknowledgment |
| Custom right-click context menu | Hijacks browser primitives engineers explicitly want (View Source, Inspect); mobile has no right-click |
| Disabled text selection / right-click "to protect content" | Universally user-hostile; portfolio content is meant to be copied (email, GitHub URL, project descriptions) |
| Auto-playing GIFs of project demos | Bandwidth on mobile; conflicts with `prefers-reduced-motion`; doesn't fit typography-first aesthetic |
| Multi-language / i18n | Inherited from PROJECT.md — single-audience portfolio |
| Contact form with backend submission | Inherited from PROJECT.md — `contact.sh` exposes social/email links only |
| E-commerce, paid services, lead-gen funnels | Inherited from PROJECT.md — this is a portfolio, not a sales site |
| Direct port of handoff `app.jsx` / `tweaks-panel.jsx` | Handoff is a design reference, not source code; rebuild idiomatically |

## Traceability

Phase mapping populated by `gsd-roadmapper` on 2026-05-06.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| SHELL-01 | Phase 2 | Pending |
| SHELL-02 | Phase 2 | Pending |
| SHELL-03 | Phase 2 | Pending |
| SHELL-04 | Phase 2 | Pending |
| SHELL-05 | Phase 2 | Pending |
| SHELL-06 | Phase 2 | Pending |
| SHELL-07 | Phase 2 | Pending |
| SHELL-08 | Phase 2 | Pending |
| SHELL-09 | Phase 2 | Pending |
| THEME-01 | Phase 2 | Pending |
| THEME-02 | Phase 2 | Pending |
| THEME-03 | Phase 2 | Pending |
| THEME-04 | Phase 2 | Pending |
| THEME-05 | Phase 2 | Pending |
| THEME-06 | Phase 2 | Pending |
| ROUTE-01 | Phase 3 | Pending |
| ROUTE-02 | Phase 3 | Pending |
| ROUTE-03 | Phase 1 | Pending |
| ROUTE-04 | Phase 2 | Pending |
| ROUTE-05 | Phase 2 | Pending |
| SEO-01 | Phase 5 | Complete (05-03) |
| SEO-02 | Phase 5 | Pending |
| SEO-03 | Phase 5 | Complete (05-02) |
| SEO-04 | Phase 5 | Complete (05-02 + 05-03) |
| SEO-05 | Phase 3 | Pending |
| VIEW-01 | Phase 3 | Pending |
| VIEW-02 | Phase 3 | Pending |
| VIEW-03 | Phase 3 | Pending |
| VIEW-04 | Phase 3 | Pending |
| VIEW-05 | Phase 3 | Pending |
| VIEW-06 | Phase 3 | Pending |
| VIEW-07 | Phase 3 | Pending |
| VIEW-08 | Phase 3 | Pending |
| PALETTE-01 | Phase 2 | Pending |
| PALETTE-02 | Phase 2 | Pending |
| PALETTE-03 | Phase 2 | Pending |
| PALETTE-04 | Phase 2 | Pending |
| PALETTE-05 | Phase 4 | Complete (04-01 + 04-02) |
| A11Y-01 | Phase 2 | Pending |
| A11Y-02 | Phase 2 | Pending |
| A11Y-03 | Phase 5 | Complete (05-03) |
| A11Y-04 | Phase 2 | Pending |
| A11Y-05 | Phase 2 | Pending |
| A11Y-06 | Phase 2 | Pending |
| A11Y-07 | Phase 5 | Pending |
| A11Y-08 | Phase 2 | Pending |
| A11Y-09 | Phase 4 | Complete (04-01) |
| MOBILE-01 | Phase 4 | Complete (04-01 + 04-02) |
| MOBILE-02 | Phase 4 | Complete (04-02) |
| MOBILE-03 | Phase 4 | Complete (04-03) |
| MOBILE-04 | Phase 4 | Complete (04-03) |
| MOBILE-05 | Phase 4 | Complete (04-05) |
| BACKEND-01 | Phase 6 | Pending |
| BACKEND-02 | Phase 6 | Pending |
| BACKEND-03 | Phase 6 | Pending |
| BACKEND-04 | Phase 6 | Pending |
| CONTENT-01 | Phase 6 | Pending |
| CONTENT-02 | Phase 6 | Pending |
| CONTENT-03 | Phase 6 | Pending |
| CONTENT-04 | Phase 6 | Pending |
| CONTENT-05 | Phase 6 | Pending |
| CONTENT-06 | Phase 6 | Pending |
| CONTENT-07 | Phase 6 | Pending |
| CONTENT-08 | Phase 6 | Pending |
| DEV-01 | Phase 5 | Pending |
| DEV-02 | Phase 5 | Pending |
| DEV-03 | Phase 5 | Pending |
| TEST-01 | Phase 1 | Pending |
| TEST-02 | Phase 2 | Pending |
| TEST-03 | Phase 2 | Pending |
| TEST-04 | Phase 2 | Pending |
| TEST-05 | Phase 3 | Pending |
| DEPLOY-01 | Phase 7 | Pending |
| DEPLOY-02 | Phase 7 | Pending |
| DEPLOY-03 | Phase 7 | Pending |
| DEPLOY-04 | Phase 7 | Pending |
| DEPLOY-05 | Phase 7 | Pending |
| DEPLOY-06 | Phase 7 | Pending |
| DEPLOY-07 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 89 total (traceability table)
- Mapped to phases: 89 / 89 ✓
- Unmapped: 0
- Per-phase distribution:
  - Phase 1 (Foundation): 12 requirements
  - Phase 2 (Shell): 29 requirements
  - Phase 3 (Views): 12 requirements
  - Phase 4 (Mobile-Responsive): 7 requirements
  - Phase 5 (SEO + A11y Polish): 9 requirements
  - Phase 6 (Backend + Content): 12 requirements
  - Phase 7 (Deploy + Verification): 7 requirements
- Note: SEO-06 listed in v1 narrative is explicitly deferred to v1.x and excluded from the v1 traceability table; the requirements summary count of "88" in earlier drafts has been corrected to 89 to match the table entries.

---
*Requirements defined: 2026-05-06*
*Last updated: 2026-05-06 — traceability populated by gsd-roadmapper*
