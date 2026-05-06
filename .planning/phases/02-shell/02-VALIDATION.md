---
phase: 2
slug: shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `02-RESEARCH.md` §"Validation Architecture" and the 29 Phase 2 requirement IDs.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 + @testing-library/react 16.2.0 + @testing-library/jest-dom 6.6.3 + jsdom 26.1.0 |
| **Config file** | `vitest.config.ts` (existing — environment jsdom, globals true, setup `vitest.setup.ts`) |
| **Quick run command** | `npm test` (full suite — Phase 2 jsdom + RTL run completes <5s) |
| **Full suite command** | `npm test` (runs `vitest run`) |
| **Estimated runtime** | ~5 seconds for Phase 2 specs; ~10 seconds full repo |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (full Vitest suite — fast enough for per-task feedback)
- **After every plan wave:** Run `npm test && npm run lint && npm run typecheck && npm run knip && npm run build` (matches the CI 5-step gate locked in Phase 1 D-03)
- **Before `/gsd-verify-work`:** Full suite green + manual Slow-3G no-flash recording + manual VoiceOver tab pass + manual 375px screenshot
- **Max feedback latency:** ~5 seconds (Vitest single-pass)

---

## Per-Task Verification Map

Maps every Phase 2 requirement ID to a concrete verification method. Tests authored in Wave 5 unless noted; grep/build checks execute as part of CI.

| Req ID | Behavior | Wave | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|
| SHELL-01 | Route group never unmounts on sibling nav | — | manual | DevTools React profiler — confirm shell `id` stable across `/` → `/projects` | manual only | ⬜ pending |
| SHELL-02 | RSC root + shell layouts (no `"use client"`) | 2 | grep | `grep -l '^"use client"' app/layout.tsx 'app/(terminal)/layout.tsx'` returns zero | post-build script (add to `package.json` scripts) | ⬜ pending |
| SHELL-03 | TopBar affordances | 5 | unit | `npx vitest top-bar.test.tsx` | ❌ W5 — `app/components/shell/top-bar.test.tsx` | ⬜ pending |
| SHELL-04 | Sidebar 7 rows + recruiter card + STATUS | 5 | unit | `npx vitest sidebar.test.tsx` | ❌ W5 — `app/components/shell/sidebar.test.tsx` | ⬜ pending |
| SHELL-05 | Active sidebar derived from `useSelectedLayoutSegment()` | 5 | unit | mock segment, assert `aria-current="page"` on right row | covered in `sidebar.test.tsx` | ⬜ pending |
| SHELL-06 | Breadcrumb renders pathname | 5 | unit | `npx vitest breadcrumb.test.tsx` | ❌ W5 — `app/components/shell/breadcrumb.test.tsx` | ⬜ pending |
| SHELL-07 | Footer renders correctly | 5 | unit | inline assertion in shell-layout test | covered in `terminal-layout.test.tsx` (optional) | ⬜ pending |
| SHELL-08 | 920px max-width main + slideIn | — | manual + visual | screenshot review at desktop and 600px | manual only | ⬜ pending |
| SHELL-09 | Cursor blink only loop in v1 | 1 + 5 | grep + manual | `grep -c "@keyframes" app/globals.css` ≤ 3 (slideIn, blink, optional fade); manual reduced-motion test | grep + manual | ⬜ pending |
| THEME-01 | next-themes `attribute="data-theme"`, defaultTheme dark | 5 | unit | `npx vitest theme-provider.test.tsx` — toggle, assert `data-theme` attr swaps + localStorage["theme"] written | ❌ W5 — `app/components/shell/theme-provider.test.tsx` | ⬜ pending |
| THEME-02 | AccentBootstrapScript inline IIFE | 5 | unit | `npx vitest accent-bootstrap-script.test.tsx` — IIFE presence + content + dynamic effect on `--accent-hue` | ❌ W5 — `app/components/shell/accent-bootstrap-script.test.tsx` | ⬜ pending |
| THEME-03 | oklch tokens in `app/globals.css` | 1 | grep | `grep -c "oklch" app/globals.css` ≥ 6 (4 accent tokens × 2 themes minimum) | grep, post-build | ⬜ pending |
| THEME-04 | `@supports (color: oklch(0 0 0))` fallbacks | 1 | grep | `grep -c "@supports (color: oklch" app/globals.css` ≥ 2 | grep | ⬜ pending |
| THEME-05 | Accent picker via 4 palette verbs | 5 | unit | covered in `command-palette.test.tsx` — assert 4 `Set accent: <hue>` verbs exist + `onSelect` updates `--accent-hue` | covered | ⬜ pending |
| THEME-06 | JetBrains Mono via `next/font/google` | 2 | grep + visual | `grep -c "JetBrains_Mono" app/layout.tsx` = 1; `grep "var(--font-mono)" app/globals.css`; manual CLS check post-build | grep | ⬜ pending |
| ROUTE-04 | sitemap iterates `ROUTES` | 4 + 5 | unit | `npx vitest sitemap.test.tsx` — call default export, assert length = `ROUTES.length`, URLs match | ❌ W5 — `app/sitemap.test.tsx` | ⬜ pending |
| ROUTE-05 | not-found returns 404 inside shell | 4 + 5 | curl + unit | `curl -I http://localhost:3000/nope` returns 404; unit test asserts `NotFound` renders 7 route links | ❌ W5 — `app/not-found.test.tsx` + dev curl | ⬜ pending |
| PALETTE-01 | cmdk modal opens ⌘K, closes Esc | 5 | unit | `npx vitest command-palette.test.tsx` — keyboard flow with `@testing-library/user-event` | ❌ W5 — `app/components/shell/command-palette.test.tsx` | ⬜ pending |
| PALETTE-02 | ≥16 verbs (Phase 2 ships ~19) | 5 | unit | assert `PALETTE_VERBS.length` ≥ 16 | covered in `command-palette.test.tsx` | ⬜ pending |
| PALETTE-03 | Type-to-filter + `aria-live` result count | 5 | unit | type "contact" → assert filtered list + `aria-live` region with count | covered | ⬜ pending |
| PALETTE-04 | Focus trap + restore on close | 5 | unit | render trigger + palette, focus trigger, ⌘K, Esc, assert `triggerRef === document.activeElement` | covered | ⬜ pending |
| A11Y-01 | Skip-link to `#main-content` | 5 | unit | render shell layout, assert `<a href="#main-content">` is first focusable element | covered in shell-layout test | ⬜ pending |
| A11Y-02 | 2px accent `:focus-visible` outline | 1 + manual | grep + manual | `grep ":focus-visible" app/globals.css` ≥ 1; manual VoiceOver tab-through | manual + grep | ⬜ pending |
| A11Y-04 | Sidebar `<button>` with plain-noun aria-label + aria-current | 5 | unit | covered in `sidebar.test.tsx` | covered | ⬜ pending |
| A11Y-05 | Semantic landmarks | 5 | unit | assert `<header>`, `<nav aria-label="File explorer">`, `<main id="main-content">`, `<footer>` all exist | covered in shell-layout test | ⬜ pending |
| A11Y-06 | LiveClock `aria-hidden="true"` | 5 | unit | `npx vitest live-clock.test.tsx` — assert `aria-hidden="true"` attribute | ❌ W5 — `app/components/shell/live-clock.test.tsx` | ⬜ pending |
| A11Y-08 | Full keyboard nav + ⌘K trap + Esc restore | 5 + manual | manual + unit | manual VO tab pass; unit covered in `command-palette.test.tsx` | manual + covered | ⬜ pending |
| TEST-02 | Vitest shell coverage | 5 | meta | `npx vitest run` — all SHELL/A11Y unit tests pass | runs as part of `npm test` | ⬜ pending |
| TEST-03 | Vitest palette coverage | 5 | meta | all `command-palette.test.tsx` cases pass | runs as part of `npm test` | ⬜ pending |
| TEST-04 | Vitest theme + accent coverage | 5 | meta | all `theme-provider.test.tsx` + `accent-bootstrap-script.test.tsx` cases pass | runs as part of `npm test` | ⬜ pending |

*Status legend: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test-infrastructure bootstraps. Per CONTEXT.md D-21, Phase 2 has no formal "Wave 0" — these prerequisites attach to Wave 5 (test wave) or earlier where appropriate.

- [ ] `package.json` devDependency: add `@testing-library/user-event@^14.6.1` for `⌘K`/`Esc` keyboard simulation (jsdom `fireEvent.keyDown` is unreliable for `metaKey` per RESEARCH §Code Examples)
- [ ] `vitest.setup.ts` — already imports `@testing-library/jest-dom/vitest`; **add** `beforeEach(() => localStorage.clear())` to prevent cross-test contamination of `theme` / `portfolio-accent` keys
- [ ] `app/components/shell/top-bar.test.tsx` — covers SHELL-03
- [ ] `app/components/shell/sidebar.test.tsx` — covers SHELL-04, SHELL-05, A11Y-04
- [ ] `app/components/shell/command-palette.test.tsx` — covers PALETTE-01..04, THEME-05, A11Y-08
- [ ] `app/components/shell/theme-provider.test.tsx` — covers THEME-01
- [ ] `app/components/shell/accent-bootstrap-script.test.tsx` — covers THEME-02
- [ ] `app/components/shell/live-clock.test.tsx` — covers A11Y-06 + hydration-safe placeholder
- [ ] `app/sitemap.test.tsx` — covers ROUTE-04
- [ ] `app/not-found.test.tsx` — covers ROUTE-05 (rendering; HTTP 404 via dev curl)
- [ ] Optional: `app/(terminal)/layout.test.tsx` — covers A11Y-01, A11Y-05, SHELL-07

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|---|---|---|---|
| Slow-3G no-flash on hard reload | THEME-01, THEME-02 (success criterion 2) | jsdom can't measure first-paint timing | DevTools Network → Slow 3G; set `localStorage["portfolio-accent"]="340"` and `localStorage["theme"]="light"`; hard reload; record video — confirm zero green/dark flash on first paint |
| Bundle size < 50KB gzipped (shared shell First Load JS) | success criterion 1 | Build-output inspection | `npm run build` and check the per-route table — shared First Load JS column < 50KB; per-view delta < 10KB |
| Resume button visible above fold at 375px | SHELL-03 (Risk 3) | Visual layout check | DevTools device frame 375×667; reload each route; assert resume button is in the top-bar without scroll |
| VoiceOver tab pass (plain nouns) | A11Y-04, A11Y-08 | Screen-reader rendering not testable in jsdom | Cmd+F5; Tab through shell; assert sidebar rows announce plain nouns (e.g. "Contact information"), not file extensions |
| Reduced-motion respect | SHELL-09, A11Y-03 (defensive baseline only — full audit Phase 5) | OS preference toggling | macOS System Settings → Accessibility → Reduce Motion ON; reload; assert `slideIn` and cursor blink are dampened or stopped |
| 4-hue × 2-theme color smoke test | THEME-03, THEME-04 | Visual contrast spot-check (full WCAG audit deferred to Phase 5 / A11Y-07) | Manually swap each accent + theme; assert no obvious illegibility on body text or focus rings |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0/Wave 5 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (grep + unit coverage achieves this)
- [ ] Wave 0/5 covers all `❌` MISSING references in the test map
- [ ] No watch-mode flags in any test command
- [ ] Feedback latency < 10s (Vitest full suite)
- [ ] `nyquist_compliant: true` set in frontmatter once Wave 5 specs land
- [ ] Manual-only checks have explicit instructions (above)

**Approval:** pending (planner authors specs in Wave 5; auditor flips `nyquist_compliant: true` once specs exist and `npm test` is green)
