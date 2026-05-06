# Project Research Summary

**Project:** Terminal Portfolio — `portfolio-web` milestone
**Domain:** Next.js 15 App Router personal portfolio with terminal/IDE aesthetic
**Researched:** 2026-05-06
**Confidence:** HIGH (all four researchers worked from primary sources: official Next.js docs, npm package registries, live terminal portfolio post-mortems, WCAG/CWV specs, and direct codebase inspection)

---

## Executive Summary

This is a brownfield UI redesign of an existing Next.js 15 / React 19 / TypeScript portfolio — not a greenfield build. The base stack is locked; the milestone adds exactly two production dependencies (`next-themes@^0.4.6` and `cmdk@^1.1.1`) and restructures the app around a persistent terminal shell backed by seven per-view App Router routes. The design handoff is high-fidelity and settled; all four researchers treat it as the canonical reference. The research answers **how** to build it safely, not what to build.

The dominant risk is the dual-audience constraint. Engineers parse `experience.log` as navigation; recruiters read it as a broken filename and bounce. Every architectural and feature decision must be evaluated against both audiences simultaneously. The top-bar resume button, plain-noun `aria-label` on sidebar file rows, and a mobile-first bottom-sheet replacing the sidebar are non-negotiable constraints — not polish. They belong in the shell phase, before any view content ships.

The second dominant risk is the brownfield migration. The existing `homepage.tsx`, `homepage.test.tsx`, `lib/fallback-data.ts`, and `theme-toggle.tsx` must be deleted and replaced in the same PRs that add their replacements — never just deleted. The silent `getJson` error handler means API/type drift between `portfolio-web` and the sibling `portfolio-services` backend will be invisible until production. The foundation phase must upgrade `next@15.3.2` to `^15.5` (security advisories), establish Knip in CI to catch orphans, and lock the terminal data model in `lib/types.ts` before any view work begins.

---

## Convergent Decisions

All four researchers agree on the following without qualification. These are settled — do not re-open during phase planning.

| Decision | Converged Resolution |
|----------|---------------------|
| Theme management | `next-themes@^0.4.6` — replaces hand-rolled `theme-toggle.tsx`; handles SSR flash, OS preference, localStorage persistence |
| Command palette | `cmdk@^1.1.1` — focus trap, keyboard nav, ARIA, type-to-filter; do not build from scratch |
| Font loading | `next/font/google` (built into Next.js, no new dep) — JetBrains Mono weights 400/500/600/700, CSS variable `--font-mono`, monospace fallback chain |
| Animation | Pure CSS `@keyframes` in `globals.css` — no Framer Motion; three animations total (~20 lines); `prefers-reduced-motion` block required |
| Accent hue system | Single `--accent-hue` CSS custom property set by a pre-paint inline script; all derived tokens are `oklch(L C var(--accent-hue))`; next-themes does NOT manage this axis |
| State management | `ThemeProvider` (next-themes) + `ShellStateProvider` (React Context, ~40 LOC) — no Zustand; `{theme, accentHue, paletteOpen}` do not need a state library |
| Data fetching | Native `fetch` + `next: { revalidate: 300 }` + typed fallback from `lib/portfolio-data.ts` — no SWR, no TanStack Query |
| Routing | `app/(terminal)/` route group — 7 per-view sibling routes share a persistent shell layout that never unmounts on navigation |
| Active-view state | `useSelectedLayoutSegment()` in Sidebar client component — never mirror active route into Context or Zustand; URL is the state |
| Route registry | `lib/routes.ts` single source of truth — Sidebar, CommandPalette, and `app/sitemap.ts` all import from it |
| Type sharing with backend | Hand-mirrored interfaces in `lib/types.ts` for v1; Zod codegen deferred |
| Styling | Pure CSS + CSS custom properties (`app/globals.css`) — no Tailwind, no CSS modules, no CSS-in-JS |
| Anti-features (never ship) | Real REPL/xterm.js shell, typing animation on content, CRT scanlines as default, ambient sound, Konami code, visitor counter, multiple themes beyond light/dark + 4 accent hues, AI chatbot, login-gated areas |

**One contradiction resolved:** FEATURES.md lists `?` cheatsheet and `g`+letter vim nav as P2 (v1.x). ARCHITECTURE.md and PITFALLS.md do not address them. Resolution: defer both to v1.x per FEATURES.md. The palette verb taxonomy must be finalized in v1 before the cheatsheet can be built — this sequencing is correct.

---

## Stack Additions

Full version rationale is in `.planning/research/STACK.md`.

**Install (one command):**
```
npm install next-themes@^0.4.6 cmdk@^1.1.1
```

**Add nothing else in v1:**

| Candidate | Verdict | Reason |
|-----------|---------|--------|
| `lucide-react` | Defer post-v1 | Unicode glyphs render fine on modern browsers; add only if QA on Windows/older Android fails |
| `framer-motion` / `motion` | Never in v1 | Three CSS animations; ~50KB gzip is not justified |
| `@radix-ui/react-dialog` | Never | `cmdk` wraps Radix internally; adding separately duplicates deps |
| `swr` / `@tanstack/react-query` | Never | All data is server-side RSC; no client cache to manage |
| `zustand` / `jotai` | Never | Three UI flags do not need a state library |
| `chroma-js` / `colord` | Never | Hue swap is one CSS variable; no JS color math needed |
| `tailwindcss` | Never | Token-driven runtime palette cannot be expressed cleanly in Tailwind |

**Version pins that matter:**
- `cmdk` must be `>=1.0.3` — earlier versions had a `use-sync-external-store` shim conflict with React 19/Next 15
- `next-themes` must be `>=0.4.x` — only this line officially declares `react ^19` peer support
- `next` should be upgraded from `15.3.2` to `^15.5` in the foundation phase (tracked security advisories)

---

## Cross-Cutting Risks

These five pitfalls shape multiple phases and must drive done criteria. Full detail in `.planning/research/PITFALLS.md`.

### Risk 1: SSR flash for theme AND accent (Pitfall 3)

`next-themes` prevents theme flash via its own pre-hydration script. It does NOT manage the accent hue. A second inline script in `app/layout.tsx` must read `localStorage["portfolio-accent"]` and call `document.documentElement.style.setProperty('--accent-hue', hue)` synchronously before paint. Without this, every returning visitor sees a one-frame green flash before their saved accent applies. Must be built in the shell phase — cannot be retrofitted without re-testing every view and all 8 hue/theme combinations.

**Done signal:** Slow-3G DevTools recording shows no color flash on reload with stored magenta (H=340) preference.

### Risk 2: Client-component boundary collapse (Pitfall 9)

A single misplaced `"use client"` at the root layout or top-level shell component forces every nested page into the client bundle, evaporating RSC benefits and costing Lighthouse 20-40 points. The correct structure: `app/layout.tsx` stays a Server Component; each interactive shell element (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`) is its own thin client island. Views are RSC by default.

**Done signal:** `npm run build` shows shared shell First Load JS < 50KB gzipped; per-view delta < 10KB.

### Risk 3: Recruiter usability collapse (Pitfalls 4 + 5 + 7)

Three pitfalls share a root cause — the terminal metaphor deprioritizes the recruiter audience:
- Resume CTA only in the sidebar (hidden on mobile) — fix: persistent top-bar resume button on every viewport
- Sidebar labels are `contact.sh` / `experience.log` only — fix: `aria-label` always includes the plain noun; `<title>` per route uses plain noun ("Contact — Bakytbek Tatibekov")
- Mobile sidebar collapses to `display: none` with no replacement — fix: bottom-sheet drawer for file tree; recruiter card rehomed to top-bar; STATUS block to about-view footer

**Done signal:** 5-second recruiter hand-off test (non-engineer, timed to resume download) passes on desktop AND 375px mobile.

### Risk 4: SEO regression from route proliferation (Pitfalls 1 + 2)

Splitting from 1 URL to 7 creates three silent failure modes: (a) child routes inherit root `metadata` with no unique title/description, (b) `sitemap.ts` stays hardcoded to `/`, (c) `metadataBase` is already missing from the codebase (CONCERNS.md). The `lib/routes.ts` registry resolves (b). Adding `metadataBase` and per-route `metadata` exports during route scaffolding resolves (a) and (c).

**Done signal:** `grep -l "export const metadata" app/*/page.tsx | wc -l` equals 7; build log shows zero `metadataBase` warnings; LinkedIn unfurl on all 7 routes renders correct branded OG image.

### Risk 5: Brownfield orphan code and type drift (Pitfalls 11 + 12)

The migration deletes `homepage.tsx`, `homepage.test.tsx`, `fallback-data.ts`, `theme-toggle.tsx`. The silent `getJson` error handler makes schema drift between `lib/types.ts` and `portfolio-services` invisible until production — where it renders as stale fallback data, not an error. Existing placeholder content (`beck@example.com`, `Product Studio`) must be replaced with real values before deploy.

**Done signal:** `npx knip` returns zero unused files/exports; `grep -r "example.com\|lorem\|placeholder\|TODO" .next/server/` returns nothing after build.

---

## Phase-Ordering Implications

The ARCHITECTURE.md build-order dependency graph and the PITFALLS.md phase mapping converge on this structure. Re-ordering any phase requires a documented rationale.

### Phase 1: Foundation

**Rationale:** Nothing is buildable until the base is clean. Security advisories on `next@15.3.2`, no CI, placeholder data, and orphan code will conflict with the new structure. This phase has no visual output but blocks everything else.

**Delivers:**
- `next` upgraded to `^15.5` (security advisories)
- `next-themes@^0.4.6` and `cmdk@^1.1.1` installed
- CI: GitHub Actions running `lint + typecheck + test + knip + build` on PRs
- `lib/types.ts` terminal data model locked (canonical type source)
- `lib/portfolio-data.ts` created with real values; `lib/fallback-data.ts` deleted
- `lib/routes.ts` route registry (7 routes as `const` array)
- `homepage.tsx` + `homepage.test.tsx` deleted in same commit that creates shell skeleton; replacement shell test added in same PR
- `metadataBase` added to root `app/layout.tsx` metadata
- `NEXT_PUBLIC_SITE_URL` set in Vercel and `.env.local`

**Avoids:** Pitfall 11 (orphan code), Pitfall 12 (placeholder content), Pitfall 1 (missing metadataBase), `next` security advisories

**Research flag:** Standard patterns — no phase research needed.

---

### Phase 2: Shell

**Rationale:** The shell is the load-bearing structure. Every architectural mistake here costs seven views' worth of rework. RSC/client boundaries, dual-script SSR flash prevention, recruiter-facing top-bar elements, and the command palette must all be settled here.

**Delivers:**
- `app/(terminal)/layout.tsx` persistent shell with correct RSC/client boundaries
- `app/layout.tsx`: `ThemeProvider`, `AccentBootstrapScript` (inline pre-paint script for `--accent-hue`), `ShellStateProvider`, JetBrains Mono via `next/font/google` (`--font-mono` variable, monospace fallback chain)
- `app/globals.css` oklch token system with `--accent-hue` and `@supports` sRGB fallbacks
- `TopBar` (client): path label, ⌘K button, **persistent resume download button**, theme toggle, `<LiveClock>` (isolated component)
- `Sidebar` (client): file tree from `lib/routes.ts`, `useSelectedLayoutSegment()` for active state, `aria-label` with plain noun on every row, recruiter card
- `CommandPalette` (client): `cmdk`, ≥15 verbs, focus restoration on Esc, `Dialog.Title`, result-count `aria-live` region
- `Breadcrumb` (client): `usePathname()`-driven
- `app/sitemap.ts` iterating `lib/routes.ts`
- Stub `app/(terminal)/page.tsx` (about view) to validate end-to-end pattern
- `app/not-found.tsx` terminal-styled 404

**Must avoid:**
- `"use client"` on `app/layout.tsx` or the top-level shell file (Pitfall 9)
- Accent hue managed by `next-themes` (ARCHITECTURE.md Anti-Pattern 3)
- `usePathname()` called inside the layout itself (ARCHITECTURE.md Anti-Pattern 6)
- Resume CTA only in the sidebar (Pitfall 4)
- File-extension strings as the only accessible name on sidebar buttons (Pitfall 5)

**Verification gate:** Slow-3G recording shows no theme/accent flash; shell bundle < 50KB gzipped; VoiceOver tab through sidebar announces plain nouns; `⌘K → Esc` restores focus to trigger.

**Research flag:** Standard patterns for RSC boundary design and next-themes integration. No additional research needed.

---

### Phase 3: Views

**Rationale:** Build the about view first as a single vertical slice to validate the full shell-to-view data flow (RSC fetch → props → view component → primitives) before scaling to six more views.

**Delivers (first slice — about view):**
- `app/(terminal)/page.tsx` with real `metadata` export (unique title, description, canonical)
- `app/components/views/about-view.tsx` (RSC)
- `app/components/primitives/prompt-line.tsx`, `tech-chip.tsx`, `kbd.tsx`

**Delivers (remaining six views):**
- `projects/page.tsx` + `ProjectsView` — `getProjects()` via `lib/api.ts`
- `stack/page.tsx` + `StackView` — JSON display with copy button
- `experience/page.tsx` + `ExperienceView`
- `writing/page.tsx` + `WritingView`
- `contact/page.tsx` + `ContactView` — `mailto:` link, copyable email, `rel="noopener noreferrer"` on all external links
- `shipped/page.tsx` + `ShippedAppsView` — real App Store / Play Store deep links required

**Per view, required:** unique `metadata` export; external links with `rel="noopener noreferrer"`; `aria-current="page"` on active sidebar file.

**Must avoid:** Pitfall 1 (every view must have its own `metadata` export — enforced by CI uniqueness test).

**Research flag:** Standard patterns. No phase research needed.

---

### Phase 4: Mobile-Responsive

**Rationale:** The sidebar's desktop structure does not translate to mobile — every sidebar element needs an explicit mobile home. PITFALLS.md is emphatic that deferring mobile is one of the most expensive shortcuts on this project. This phase runs after views are built so responsive layout can be validated against real content.

**Delivers:**
- Bottom-sheet drawer for file tree navigation (≥44px touch targets)
- Mobile about-view hero with resume download CTA above the fold at 375px
- STATUS block rehomed to about-view footer
- `cmdk` mobile equivalent or hamburger-triggered bottom-sheet with same verb list
- Responsive typography per handoff

**Must avoid:** Pitfall 7 (sidebar `display: none` with no replacement); Pitfall 6 (no mobile palette equivalent).

**Done signal:** 375px viewport screenshot shows every shell element accessible; 5-second recruiter test passes on mobile.

**Research flag:** Standard patterns. Handoff specifies ~960px breakpoint and bottom-sheet pattern. No research needed.

---

### Phase 5: SEO + Accessibility Polish

**Rationale:** Audit all 8 hue/theme contrast combinations before content is written. Finding a contrast failure after copy is written is cheaper now than after deploy.

**Delivers:**
- Dynamic OG image per route via `opengraph-image.tsx` + `next/og` `ImageResponse` (JetBrains Mono as font)
- Twitter card metadata; favicon set (`app/icon.tsx`, `app/apple-icon.png`, `app/manifest.ts`, `theme-color`)
- JSON-LD `Person` schema (requires real bio/socials — coordinate with Phase 6 content)
- OKLCH contrast audit: 4 hues × 2 themes = 8 axe-core runs; per-hue chroma override where needed
- `@supports (color: oklch(0 0 0))` sRGB fallbacks on all accent tokens
- `@media print` stylesheet (white bg, black text, hide shell chrome)
- `@media (prefers-reduced-motion: reduce)` block
- Skip-link to `#main-content`; visible `:focus-visible` rings on all interactive elements
- Semantic landmarks: `<nav aria-label="File explorer">`, `<main>`, `<header>`, `<footer>`
- Custom HTTP response headers in `next.config.ts`
- Console.log signature + view-source HTML comment

**Must avoid:** Pitfall 8 (contrast failures at non-default hues); OKLCH without `@supports` fallback.

**Research flag:** Standard patterns. Amber (H=75) on light theme is the predicted WCAG failure — flag this as a potential rework loop back to `globals.css` token values.

---

### Phase 6: Content Population

**Rationale:** Real content is the PROJECT.md definition of done. This phase runs last because it is human work that cannot be parallelized with code. Write against the final layout, not a moving target.

**Delivers:**
- Final bio, highlights, socials in `lib/portfolio-data.ts` — all real values, zero placeholders
- Full project list, real writing posts, real shipped apps with App Store / Play Store URLs
- Real resume PDF (`Bakytbek_Tatibekov_Resume.pdf`, < 250KB, correct PDF metadata)
- `portfolio-services/` backend: `/api/projects` + adjusted shapes matching `lib/types.ts`
- `prebuild` script: greps `.next/server/` for `lorem`, `example.com`, `placeholder`, `TODO`; fails build on hit

**Backend note:** `portfolio-services/` work is parallelizable with Phases 3–5 since `lib/portfolio-data.ts` fallbacks unblock frontend. Deploy backend first; then toggle frontend to live API.

**Done signal:** `npm run build && grep -r "lorem\|example.com\|placeholder\|TODO" .next/server/` returns nothing; `file public/resume.pdf` confirms real PDF.

**Research flag:** No research needed — this is content authoring.

---

### Phase 7: Deploy + Verification

**Rationale:** Explicit phase ensures the "looks done but isn't" checklist runs against production (not localhost), CWV are measured on real network conditions, and Search Console confirms all 7 routes are indexed.

**Delivers:**
- Production Vercel deployment with `NEXT_PUBLIC_SITE_URL` set
- Lighthouse: LCP < 2.5s mobile, CLS < 0.1, INP < 200ms, Performance > 90
- Search Console: sitemap submitted, 7 routes indexed
- `npm audit` zero high/critical
- `npx knip` zero unused files/exports
- 5-second recruiter hand-off test on production URL, desktop and mobile
- Vercel Analytics enabled (resume download event)

**Research flag:** Standard deployment verification. No research needed.

---

### Phase Ordering Rationale

The dependency chain that makes re-ordering expensive:

```
Foundation (types, routes registry, CI, metadataBase)
    └─► Shell (layout, theme/accent scripts, palette, top-bar resume button)
            └─► Views first slice (validates full pattern end-to-end)
                    └─► Views remaining (parallelizable by view)
                            └─► Mobile-Responsive (layout validated against real views)
                                    └─► SEO/A11y Polish (audited against real layout)
                                            └─► Content Population (written against final layout)
                                                    └─► Deploy + Verification

Backend (portfolio-services/) ─► parallelizable with Phases 3–6
```

Key forcing functions:
- `lib/types.ts` must exist before any view component can be written
- Shell RSC/client boundaries must be correct before views are added — refactoring after costs 7× more
- SSR flash prevention must be in the shell phase — cannot be retrofitted without re-testing all views and hue/theme combos
- Mobile is a full redistribution of sidebar contents, not just CSS breakpoints — must be a dedicated phase

---

## Open Questions to Resolve Before Planning

1. **Palette verb count and exact copy:** FEATURES.md says "≥15 verbs" but does not enumerate all 15. The full verb list (including copy for `$ cat resume.pdf`, `copy email`, `share this view`, `cycle accent hue`, `?`) must be defined in the shell phase spec — the `?` cheatsheet depends on this list being finalized.

2. **Writing posts at v1:** PROJECT.md requires "real writing posts" but does not specify how many. Does v1 ship with zero posts (empty state), existing posts migrated from wherever they live, or new posts written? Content phase scoping depends on this answer.

3. **`shipped.app` app list:** Real App Store / Play Store URLs must exist before the shipped view can be declared done. Confirm the app list and URLs before Phase 3 view work begins.

4. **CI tooling:** CONCERNS.md documents that no CI exists. Foundation phase assumes GitHub Actions. If the developer wants to defer CI, document the manual alternative (Knip + orphan grep before each merge) explicitly in the phase spec.

5. **Accent contrast overrides:** The specific per-hue chroma/lightness overrides needed to pass WCAG at all 8 hue/theme combinations are not pre-computed — they require the axe-core audit in Phase 5. Flag Phase 5 as having a potential rework loop into `globals.css`.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Two new deps verified against npm latest; React 19 peer deps confirmed; compatibility issues documented and resolved in current versions |
| Features | HIGH | Table stakes grounded in WCAG 2.1, 2026 CWV thresholds, and surveyed real terminal portfolios; anti-features backed by HN feedback patterns |
| Architecture | HIGH | Route-group layout behavior verified against Next.js official docs; next-themes verified against its README; sitemap convention verified |
| Pitfalls | HIGH (SEO/SSR/font/brownfield), MEDIUM (recruiter UX) | Recruiter UX claims synthesized from one strong post-mortem plus general UX literature — valid but not multi-sourced |

**Overall confidence: HIGH**

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — full version rationale and compatibility matrix
- `.planning/research/FEATURES.md` — full table stakes / differentiators / anti-features / competitor analysis
- `.planning/research/ARCHITECTURE.md` — full component map, patterns, data flow, build order
- `.planning/research/PITFALLS.md` — 12 pitfalls with phase mapping and "looks done but isn't" checklist
- `.planning/PROJECT.md` — constraints, decisions, out-of-scope definitions
- [Next.js Layout API reference](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
- [Next.js Route Groups reference](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [next-themes README](https://github.com/pacocoursey/next-themes)
- [cmdk npm page](https://www.npmjs.com/package/cmdk) — v1.1.1 React 19 compatibility confirmed

### Secondary (MEDIUM confidence)
- [DEV — Why I Ditched Terminal UIs for Recruiters](https://dev.to/zenoguy/why-i-ditched-terminal-uis-for-recruiters-57p7) — primary recruiter UX post-mortem
- [CSS-Tricks — FART](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/) — SSR flash prevention patterns
- [LogRocket — OKLCH in CSS](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes) — gamut clipping evidence
- [LogRocket — RSC performance pitfalls](https://blog.logrocket.com/react-server-components-performance-mistakes) — client boundary collapse evidence
- [Show HN threads on terminal portfolios](https://news.ycombinator.com/item?id=47205127) — anti-feature evidence

---

*Research completed: 2026-05-06*
*Ready for roadmap: yes*
