# Roadmap: Terminal Portfolio

## Overview

Brownfield redesign of an existing Next.js 15 / React 19 portfolio into a high-fidelity terminal/IDE shell with seven per-view App Router routes, light/dark themes, four hue-swappable accents, a ⌘K command palette, full mobile responsiveness, and matching backend shape changes in the sibling `portfolio-services/` repo. The journey starts with a clean foundation (deps upgraded, types locked, orphans deleted, CI in place), then builds the load-bearing terminal shell — the one phase where every architectural mistake costs 7× rework. Once the shell lands with correct RSC/client boundaries, dual-script SSR-flash prevention, the persistent top-bar resume button, and plain-noun aria-labels for recruiters, the seven views fill in around it. Mobile redistribution, contrast/SEO/easter-egg polish, real content + backend cutover, and a production verification phase follow in sequence. The dual-audience constraint (engineers + recruiters) and the brownfield discipline of "delete and replace in the same phase" thread through every phase.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Upgrade Next, install deps, lock terminal data model, route registry, CI, delete orphan code
- [x] **Phase 2: Shell** - Persistent terminal shell with theme/accent system, command palette, sitemap, 404 (4 human-UAT items pending)
- [x] **Phase 3: Views** - Seven per-view routes with metadata, primitives, RSC content rendering (2026-05-06)
- [x] **Phase 4: Mobile-Responsive** - Bottom-sheet nav, mobile palette, sidebar redistribution, print styles (2026-05-07 — verdict PASS with Phase 5 + Phase 7 carry-forwards)
- [ ] **Phase 5: SEO + Accessibility Polish** - OG images, JSON-LD, contrast audit, reduced-motion, easter eggs
- [ ] **Phase 6: Backend + Content Population** - Sibling backend endpoints, real bio/projects/posts/resume PDF
- [ ] **Phase 7: Deploy + Verification** - Production deploy, Lighthouse, Search Console, recruiter test, audits

## Phase Details

### Phase 1: Foundation
**Goal**: Establish a clean, secure base — upgraded Next, terminal data model locked, route registry in place, CI catching orphans, all legacy homepage/fallback code deleted in lockstep with replacements
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, ROUTE-03, TEST-01
**Success Criteria** (what must be TRUE):
  1. `npm audit` reports zero high/critical advisories on `next` (advisories from `15.3.2` resolved by upgrade to `^15.5.x`)
  2. `npm ls next-themes cmdk` resolves to versions `^0.4.6` and `^1.1.1` respectively with zero peer-dep warnings under React 19
  3. GitHub Actions PR check runs `lint + typecheck + test + knip + build` and fails on any unused export or file
  4. `git grep -E "homepage\.(tsx|test\.tsx)|fallback-data" -- app/ lib/` returns zero hits; `lib/portfolio-data.ts` exports a typed dataset matching the new `lib/types.ts` Profile/Project/Social/Experience/Writing/ShippedApp/StackCategory shapes; `lib/routes.ts` exports a 7-entry `const` array
  5. `npm run build` log shows zero `metadataBase` warnings; `prebuild` script greps the build output for `lorem|example.com|placeholder|TODO` and exits non-zero on any hit
**Plans:** 6 plans
- [x] 01-01-PLAN.md — Wave 1: Upgrade deps (next ^15.5.15, next-themes, cmdk), pin Node 22.x, bump tsconfig ES2022, widen .gitignore
- [x] 01-02-PLAN.md — Wave 2: Atomic data refactor — rewrite lib/types.ts, create lib/portfolio-data.ts, adapt lib/api.ts + homepage.tsx + homepage.test.tsx, delete lib/fallback-data.ts (one commit, D-17)
- [x] 01-03-PLAN.md — Wave 2: Create lib/routes.ts (7-entry typed registry) and add metadataBase to app/layout.tsx (using `||` per Pitfall D)
- [x] 01-04-PLAN.md — Wave 3: next.config.ts headers — 5 security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) + x-built-with engineer header
- [x] 01-05-PLAN.md — Wave 3: scripts/check-placeholders.mjs postbuild grep + package.json postbuild + typecheck script entries (D-10 self-enforcement)
- [x] 01-06-PLAN.md — Wave 4: ESLint 9 flat config (eslint.config.mjs) + delete .eslintrc.json, knip.json with ignores, .github/workflows/ci.yml (5-step PR pipeline), package.json knip script

### Phase 2: Shell
**Goal**: Ship the persistent terminal shell with correct RSC/client boundaries, dual-script SSR-flash prevention, full a11y semantics, the ⌘K command palette, and the recruiter-facing top-bar resume button on every viewport
**Depends on**: Phase 1
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07, SHELL-08, SHELL-09, THEME-01, THEME-02, THEME-03, THEME-04, THEME-05, THEME-06, ROUTE-04, ROUTE-05, PALETTE-01, PALETTE-02, PALETTE-03, PALETTE-04, A11Y-01, A11Y-02, A11Y-04, A11Y-05, A11Y-06, A11Y-08, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `npm run build` shows shared shell First Load JS < 50KB gzipped and per-view delta < 10KB; `grep -l "^\"use client\"" app/layout.tsx app/(terminal)/layout.tsx` returns zero hits (RSC discipline preserved)
  2. Slow-3G DevTools recording on hard reload with stored `portfolio-accent=340` (magenta) and `theme=light` shows zero color/theme flash on first paint; `oklch()` tokens carry `@supports` sRGB fallbacks for all four accent hues
  3. Persistent resume download button is visible and clickable in the top bar at every viewport (375px through desktop) on every shell-rendered route; sidebar file rows expose plain-noun `aria-label`s (e.g. `aria-label="Contact information"` on `contact.sh`); active row carries `aria-current="page"` derived from `useSelectedLayoutSegment()`
  4. `⌘K` opens a centered `cmdk` palette with ≥15 verbs (open each of 7 views, download resume, toggle theme, open ≥3 socials, copy email, copy GitHub URL, share view, cycle accent); `Esc` closes and restores focus to the trigger button; result count is announced via an `aria-live` region; type-to-filter narrows results
  5. `curl -I http://localhost:3000/this-route-does-not-exist` returns HTTP 404 served by `app/not-found.tsx` rendering inside the terminal shell; `curl http://localhost:3000/sitemap.xml | grep -c "<loc>"` equals 7 (sitemap iterates `lib/routes.ts`); Vitest specs for shell, palette, theme/accent, and accent-bootstrap-script all pass
**Plans:** 7 plans
- [x] 02-01-PLAN.md — Wave 1: app/globals.css full terminal token rewrite (oklch palette, --accent-hue, @supports sRGB fallbacks, keyframes, focus-visible, skip-link)
- [x] 02-02-PLAN.md — Wave 2: Root providers (ThemeProvider, AccentBootstrapScript, ShellStateProvider) + app/layout.tsx rewrite with JetBrains Mono + brownfield deletions + @testing-library/user-event devDep + localStorage.clear in vitest.setup.ts
- [x] 02-03-PLAN.md — Wave 3a: Shell layout (app/(terminal)/layout.tsx) + PromptLine primitive + lib/uptime.ts + lib/palette-verbs.ts (18 verbs) + CAREER_START_DATE in portfolio-data
- [ ] 02-04-PLAN.md — Wave 3b: Client islands — TopBar + LiveClock + Sidebar + Breadcrumb (full implementations replacing stubs)
- [ ] 02-05-PLAN.md — Wave 3c: CommandPalette full implementation (cmdk Command.Dialog, 19 verbs, aria-live, focus management)
- [x] 02-06-PLAN.md — Wave 4: 7 thin route stubs + app/sitemap.ts rewrite + app/not-found.tsx
- [x] 02-07-PLAN.md — Wave 5: Vitest TEST-02/03/04 specs (8 spec files covering shell, palette, theme/accent)
**UI hint**: yes

### Phase 3: Views
**Goal**: Render all seven views (`/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`) as RSCs inside the shell, each with unique metadata, shared primitives, and external-link safety — providing shareable URLs for every terminal "file"
**Depends on**: Phase 2
**Requirements**: ROUTE-01, ROUTE-02, VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, VIEW-07, VIEW-08, SEO-05, TEST-05
**Success Criteria** (what must be TRUE):
  1. All seven routes render with the prompt-line + view body inside the persistent shell; `grep -l "export const metadata\|generateMetadata" app/(terminal)/**/page.tsx | wc -l` equals 7 and each route's `metadata.title` is unique (Vitest set-deduplication test passes)
  2. Each view exposes its handoff-fidelity affordances — about: stat cards + resume CTA + ghost socials; projects: 3-col grid; stack: copy-JSON button; experience: hex-hash decorated rows; writing: post list with date/readtime micro-meta; contact: copyable email + `mailto:`; shipped: real App Store / Play Store deep links
  3. View components in `app/components/views/` carry no `"use client"` directive (RSCs); shared primitives `prompt-line.tsx`, `tech-chip.tsx`, `kbd.tsx` are imported by views and are RSC-friendly
  4. `grep -rE "target=\"_blank\"" app/components/views/` shows every match paired with `rel="noopener noreferrer"` (via the shared `<ExternalLink>` component)
  5. One Vitest smoke test per view passes: each view renders, exports a unique `<title>`, and contains a `$ <command>` prompt line
**Plans:** 13 plans
- [x] 03-01-PLAN.md — Wave 1: ExternalLink, TechChip, Kbd RSC primitives
- [x] 03-02-PLAN.md — Wave 1: CopyButton client island + unit test
- [x] 03-03-PLAN.md — Wave 1: StoreBadge primitive + official Apple/Google badge SVGs
- [x] 03-13-PLAN.md — Wave 1: Inherited build-gate fix (clear TODO seeds + tighten placeholder regex)
- [x] 03-04-PLAN.md — Wave 2: Append all view + primitive CSS to app/globals.css (no new tokens)
- [x] 03-05-PLAN.md — Wave 3: About view RSC + page wrapper + smoke spec (establishes pattern)
- [x] 03-06-PLAN.md — Wave 4: Projects view (tech chips + year/status grid)
- [x] 03-07-PLAN.md — Wave 4: Stack view (hand-rolled JSON syntax highlighter + CopyButton)
- [x] 03-08-PLAN.md — Wave 4: Experience view (hex-hash decorated rows)
- [x] 03-09-PLAN.md — Wave 4: Writing view (defensive Date.parse sort)
- [x] 03-10-PLAN.md — Wave 4: Contact view (mailto + CopyButton + ghost github CTA)
- [x] 03-11-PLAN.md — Wave 4: Shipped view (StoreBadge per-platform + per-app CopyButton)
- [x] 03-12-PLAN.md — Wave 5: Cross-view metadata test (title uniqueness + canonical pathname audit)
**UI hint**: yes
**Verification**: passed 10/10 (2026-05-06) — VIEW-08 closed via Kbd primitive wired into shell

### Phase 4: Mobile-Responsive
**Goal**: Redistribute every sidebar element to a viable mobile home (not `display: none`), ship a touch-equivalent for the ⌘K palette, keep the resume CTA above the fold at 375px, and ship a print stylesheet for recruiters who print
**Depends on**: Phase 3
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-04, MOBILE-05, PALETTE-05, A11Y-09
**Success Criteria** (what must be TRUE):
  1. At 375px viewport on the about route, the resume download CTA is visible above the fold without scrolling (manual screenshot review)
  2. The 240px sidebar collapses below ~960px into: a hamburger-triggered bottom-sheet drawer for the file tree (≥44×44px touch targets), with the STATUS block rehomed to the about-view footer and the recruiter resume card surfaced via the persistent top-bar button
  3. A mobile equivalent of the command palette opens as a bottom-sheet (or full-height modal) from the mobile top bar, exposing the same verb list and type-to-filter behavior as the desktop ⌘K
  4. `grep -E "display:\s*none" app/globals.css` for sidebar selectors is paired with a corresponding mobile-home rule for every former sidebar element (no orphan CSS hides)
  5. Print preview (browser print dialog) renders white background, black text, hidden top-bar/sidebar/palette, and a serif-fallback body — every view legible on paper
**Plans:** 5 plans
- [x] 04-01-PLAN.md — Wave 1: Append @media (max-width: 960px) + @media print + drawer/hamburger/about-status-mobile rules to app/globals.css; ship 3 audit scripts (sidebar redistribution, print rules, mobile palette CSS) + check:mobile npm script
- [x] 04-02-PLAN.md — Wave 2: ExplorerDrawer client island (6th) + ☰ hamburger trigger in TopBar + useDrawer() slice in ShellStateProvider with palette mutual exclusion + drawer/top-bar/palette test extensions; mount drawer in (terminal)/layout
- [x] 04-03-PLAN.md — Wave 2: Extract <StatusBlock /> RSC primitive + <StatusTz /> client leaf; refactor Sidebar to consume; append mobile STATUS render to AboutView; wire uptime via about page; ship status-block.test + about-view.test + sidebar.test update
- [x] 04-04-PLAN.md — Wave 2: <PrintFooter /> RSC primitive (URL · email) + mount in (terminal)/layout with NEXT_PUBLIC_SITE_URL fallback + co-located test
- [x] 04-05-PLAN.md — Wave 3 (manual): Cross-viewport screenshot review (375 / 768 / 1024) + print preview on all 7 views + recruiter dry-run on 375px localhost; populated 04-VERIFICATION.md (verdict PASS, 7 gates PASS / 2 DEFERRED-PHASE-7)
**UI hint**: yes

### Phase 5: SEO + Accessibility Polish
**Goal**: Lock down dynamic OG images, JSON-LD, favicons, four-hue × two-theme contrast compliance, reduced-motion handling, custom HTTP headers, and engineer easter eggs — the cross-cutting polish that audits production fitness
**Depends on**: Phase 4
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, A11Y-03, A11Y-07, DEV-01, DEV-02, DEV-03
**Success Criteria** (what must be TRUE):
  1. Each route has a route-specific OG image generated by `opengraph-image.tsx` + `next/og` `ImageResponse` (JetBrains Mono passed in `fonts`); LinkedIn / Slack unfurl preview on all seven routes renders the branded image with correct title; Twitter card `summary_large_image` metadata is on root metadata
  2. JSON-LD `Person` schema is present in root `<head>` with real `jobTitle`, `url`, and `sameAs` socials; favicon set complete (`app/icon.tsx` generated terminal-prompt glyph, `apple-icon.png`, `manifest.ts`, per-scheme `theme-color`)
  3. `@axe-core/playwright` runs against all 4 hues × 2 themes = 8 combinations, all passing WCAG 2.1 AA (≥4.5:1 body, ≥3:1 large text); per-hue chroma overrides applied where needed (amber-on-light is the predicted failure)
  4. `@media (prefers-reduced-motion: reduce)` block disables `slideIn`, dampens cursor blink, and stops boot fade — verified by enabling Reduce Motion in OS settings and reloading
  5. `curl -I <localhost-url>` shows `x-portfolio-source` and `x-built-with: nextjs-15-react-19` headers; opening DevTools console on first paint shows the JetBrains-style ASCII signature with email + GitHub URL; `view-source:` shows a 6-line HTML comment greeting in `<head>`
**Plans:** 8 plans
- [x] 05-01-PLAN.md — Wave 0: Devdeps (@axe-core/playwright + playwright + @playwright/test + chromium binary), JetBrains Mono TTFs (with OFL-1.1 license) committed to assets/, playwright.config.ts, 4 Vitest test scaffolds, 4 smoke-script scaffolds, test:contrast script (3 Rule-3 deviations: added @playwright/test devdep, excluded tests/ from vitest, mocked next/font/google)
- [x] 05-02-PLAN.md — Wave 1 Branch A: 8 OG image cards (root + 7 routes via next/og ImageResponse, JetBrains Mono via readFile from assets/, inline hex per Pitfall 1, display:flex per Pitfall 2) + app/icon.tsx + app/apple-icon.tsx (>_ glyph, one visual source) + app/manifest.ts (minimal, display:browser, icons:[] per Pitfall 12). 11 files created, scripts/check-og-files.mjs flips green, npm run build emits 23 static pages.
- [x] 05-03-PLAN.md — Wave 1: app/layout.tsx adds metadata.twitter (summary_large_image) + SEPARATE viewport export with themeColor per-scheme array (Pitfall 3 — corrects CONTEXT.md D-15's deprecated location); globals.css universal-selector reduced-motion reset (0.01ms per Pitfall 7); 8 layout.test.tsx assertions
- [x] 05-04-PLAN.md — Wave 1: AboutSocials RSC inline mini-contact card (Phase 4 → 5 carry-forward) — 3 rows (EMAIL/GITHUB/LINKEDIN) inserted after bio paragraphs, before highlights; reuses ExternalLink + .contact-row; TODO-guard via /^https?:\/\// regex; 5 new about-view.test.tsx assertions
- [ ] 05-05-PLAN.md — Wave 2: lib/json-ld.ts (buildPersonSchema + filterValidUrls) with 10 unit tests; JsonLdPerson RSC with XSS escape (`<` → `\u003c` per Pitfall 6); HeadComment RSC (`<noscript dangerouslySetInnerHTML>` 6-line lowercase letter per Pattern 9); both mounted in app/layout.tsx <head>
- [ ] 05-06-PLAN.md — Wave 3: ConsoleSignature client island ('use client', useEffect once on mount, %c-styled "BT" ASCII art + 2 plain lines, returns null); mounted in (terminal)/layout.tsx sibling to CommandPalette (NEVER in app/layout.tsx — Pitfall 8)
- [ ] 05-07-PLAN.md — Wave 4: 4-hue × 2-theme × 7-route axe matrix in tests/contrast.spec.ts (56 cells, addInitScript localStorage seeding + data-theme canary per Pitfall 10); 1 human checkpoint authorizing remediation strategy; conditional per-hue chroma overrides in globals.css (D-22 conservative — predicted: amber-on-light)
- [ ] 05-08-PLAN.md — Wave 5 (manual): 4 manual gates — DEV-03 curl x-built-with on all 7 routes, DEV-02 view-source HTML comment in Chrome+Firefox (Assumption A1), A11Y-03 macOS Reduce Motion OS toggle, optional SEO-03c Slack/LinkedIn unfurl via ngrok; populate 05-VERIFICATION.md
**UI hint**: yes

### Phase 6: Backend + Content Population
**Goal**: Cut over to real content — sibling backend exposes the new `/api/projects` and adjusted shapes; `lib/portfolio-data.ts` carries the final bio/projects/writing/shipped apps; real resume PDF in place; zero placeholder strings reachable in the build
**Depends on**: Phase 5
**Requirements**: BACKEND-01, BACKEND-02, BACKEND-03, BACKEND-04, CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06, CONTENT-07, CONTENT-08
**Success Criteria** (what must be TRUE):
  1. Sibling `portfolio-services/` exposes `/api/projects` returning `Project[]` matching `lib/types.ts`; existing `/api/profile`, `/api/skills`, `/api/experience`, `/api/apps`, `/api/posts` endpoint shapes match the terminal data model; contract documented at `portfolio-services/docs/api-contract.md`
  2. Backend deployed before frontend cuts over to live API — frontend with `NEXT_PUBLIC_API_BASE_URL` pointing at production backend renders all seven views identically to the static fallback rendering
  3. `lib/portfolio-data.ts` carries real bio (short + long), highlights, role, location, email, socials, ≥3 real projects, real writing posts (or explicit "coming soon" empty state per CONTENT-04 decision), real shipped apps with valid App Store + Play Store URLs, real stack categories, real experience entries
  4. `public/resume.pdf` is the real `Bakytbek_Tatibekov_Resume.pdf` — `file public/resume.pdf` confirms PDF; `wc -c` reports < 250KB; `pdfinfo` shows `Title` and `Author` metadata set
  5. `npm run build && grep -rE "lorem|example\.com|placeholder|TODO|Product Studio" .next/server/` returns nothing (INFRA-05 prebuild script enforces this on every build)
**Plans**: TBD

### Phase 7: Deploy + Verification
**Goal**: Production cutover with full Lighthouse / Search Console / recruiter-test verification — the explicit "looks done but isn't" checklist run against the live URL, not localhost
**Depends on**: Phase 6
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, DEPLOY-07
**Success Criteria** (what must be TRUE):
  1. Production Vercel deploy is live with `NEXT_PUBLIC_SITE_URL` set to the production origin; all seven routes return HTTP 200 and render correctly
  2. Lighthouse on the production URL (mobile profile) reports LCP < 2.5s, CLS < 0.1, INP < 200ms, Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
  3. Search Console shows the sitemap submitted and all seven routes indexed (or "Discovered" status pending crawl); `npm audit` reports zero high/critical advisories; `npx knip` reports zero unused files/exports
  4. 5-second recruiter hand-off test passes on the production URL on both desktop and 375px mobile — a non-engineer finds resume + contact in under 5 seconds, twice (once per device)
  5. Vercel Analytics is enabled and a `resume_download` custom event fires on the resume button click; manual 375px screenshot review confirms every shell element is accessible with no overflow
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

**Parallelization opportunities (per config.json `parallelization: true`):**
- Within Phase 3, the six remaining views (after the about-view first slice) are parallelizable since they share primitives but render independently
- Phase 6 backend work (`portfolio-services/`) can begin in parallel with Phase 3 onward — frontend renders against `lib/portfolio-data.ts` fallbacks until backend cutover; deploy backend first
- Phase 5 OG image generation, contrast audit, and easter eggs are independent workstreams within the phase

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 6/6 | Complete | 2026-05-06 |
| 2. Shell | 7/7 | Complete | 2026-05-06 |
| 3. Views | 0/TBD | Not started | - |
| 4. Mobile-Responsive | 5/5 | Complete | 2026-05-07 |
| 5. SEO + Accessibility Polish | 4/8 | In progress | - |
| 6. Backend + Content Population | 0/TBD | Not started | - |
| 7. Deploy + Verification | 0/TBD | Not started | - |
