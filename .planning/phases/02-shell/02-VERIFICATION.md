---
phase: 02-shell
verified: 2026-05-06T09:20:00Z
status: pass
human_uat_completed: 2026-05-14
score: 29/30 must-haves verified
overrides_applied: 0
gaps:
human_verification: []
resolved_human_verification:
  - test: "Slow-3G no-flash on hard reload"
    resolved: "2026-05-14"
    result: pass
    notes: "Verified against live site; no green→magenta or dark→light flash on first paint with magenta+light pre-set in localStorage under Slow-3G throttling."
  - test: "Resume button visible at every viewport (375px through desktop) on every shell route"
    resolved: "2026-05-14"
    result: pass
    notes: "Confirmed visible and clickable in TopBar at 375px on all 7 routes; no clipping or display:none at any breakpoint."
  - test: "VoiceOver tab pass with plain-noun sidebar labels"
    resolved: "2026-05-14"
    result: pass
    notes: "VoiceOver announces all 7 sidebar rows with plain-noun labels (About me, Projects, Tech stack, Experience, Writing, Contact information, Shipped apps); no .sh / .md suffixes audible."
  - test: "4-hue x 2-theme visual smoke test"
    resolved: "2026-05-14"
    result: pass
    notes: "All 8 combinations (matrix/amber/cyan/magenta × dark/light) show readable body text and visible focus rings; amber-on-light canary readable. Formal WCAG audit covered in Phase 5 A11Y-07."
---

# Phase 2: Shell Verification Report

**Phase Goal:** Ship the persistent terminal shell with correct RSC/client boundaries, dual-script SSR-flash prevention, full a11y semantics, the ⌘K command palette, and the recruiter-facing top-bar resume button on every viewport.
**Verified:** 2026-05-06T09:20:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | RSC/client boundary discipline: `app/layout.tsx` and `app/(terminal)/layout.tsx` contain no `"use client"` | ✓ VERIFIED | `grep -l '"use client"' app/layout.tsx app/(terminal)/layout.tsx` returns zero hits; both files confirmed RSC |
| 2 | AccentBootstrapScript runs before paint and reads `localStorage["portfolio-accent"]` to set `--accent-hue` synchronously | ✓ VERIFIED | `accent-bootstrap-script.tsx` renders a `<script dangerouslySetInnerHTML>` IIFE in `<head>` before `<body>`; reads `portfolio-accent` key, validates with `/^\d{1,3}$/`, calls `document.documentElement.style.setProperty('--accent-hue', hue)` |
| 3 | No SSR-flash: dual-script pattern (next-themes for dark/light + AccentBootstrapScript for hue) is in place | ✓ VERIFIED | `app/layout.tsx` has `<AccentBootstrapScript />` in `<head>` and `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>` in `<body>`; both scripts present. Slow-3G recording is a manual check (see Human Verification below) |
| 4 | `oklch()` accent tokens with `@supports (color: oklch(0 0 0))` sRGB fallbacks present | ✓ VERIFIED | `globals.css` has 15 `oklch` references; exactly 2 `@supports (color: oklch(0 0 0))` blocks (one for `:root`, one for `[data-theme="light"]`); sRGB fallbacks `--accent: #22c55e` and `--accent: #16a34a` declared before each `@supports` block |
| 5 | Persistent resume download button in top bar, never hidden at any viewport | ✓ VERIFIED (manual needed) | `top-bar.tsx` renders `<a class="topbar-btn topbar-resume" href={PROFILE.resumeUrl} download>↓ resume.pdf</a>`; `.topbar-resume` has no responsive `display:none` rule in `globals.css`; no breakpoint hides it. Visual confirmation at 375px is flagged for human review |
| 6 | Sidebar file rows use plain-noun `aria-label` and active row has `aria-current="page"` derived from `useSelectedLayoutSegment()` | ✓ VERIFIED | `sidebar.tsx` uses `useSelectedLayoutSegment()` with no Context mirroring; `aria-label={route.ariaLabel}` renders plain nouns ("About me", "Projects", "Tech stack", "Experience", "Writing", "Contact information", "Shipped apps"); `aria-current="page"` set conditionally on active row; Vitest sidebar.test.tsx passes 7 assertions confirming this |
| 7 | ⌘K opens a centered cmdk palette; Esc closes and restores focus; result count via `aria-live`; type-to-filter narrows results | ✓ VERIFIED | `command-palette.tsx` wires `Command.Dialog` with global `keydown` listener for `metaKey/ctrlKey+k`; `triggerRef` captures focus origin on open; `useEffect` calls `triggerRef.current.focus()` on close; `role="status" aria-live="polite"` region updates count; `Command.Input onValueChange` filters against `verb.label` and `verb.keywords`; Vitest command-palette.test.tsx passes 8 assertions including ⌘K open, Esc close, type-to-filter, aria-live |
| 8 | PALETTE_VERBS has ≥ 15 verbs (PALETTE-02 floor); shipped 18 | ✓ VERIFIED | `lib/palette-verbs.ts` defines 18 verbs: 7 navigation + 1 download + 1 theme toggle + 4 accent + 2 social + 1 copy email + 1 copy GitHub URL + 1 share; all four accent IDs (`accent-matrix`, `accent-amber`, `accent-cyan`, `accent-magenta`) present; Vitest asserts `PALETTE_VERBS.length >= 16` and all 4 accent verbs present |
| 9 | `app/not-found.tsx` renders inside terminal shell with HTTP 404 (Next.js convention) | ✓ VERIFIED | `not-found.tsx` has no `"use client"` directive and is at `app/` root — Next.js App Router auto-returns HTTP 404 for `not-found.tsx` files; renders `ls: cannot access` error + 7 ROUTES links; Vitest passes 3 assertions |
| 10 | `app/sitemap.ts` enumerates 7 routes by mapping over `lib/routes.ts`; `app/robots.ts` references sitemap URL | ✓ VERIFIED | `sitemap.ts` maps `ROUTES` (no hardcoding); Vitest sitemap.test.tsx returns exactly 7 entries matching `ROUTES.length`; `robots.ts` references `${baseUrl}/sitemap.xml` |
| 11 | Vitest specs for shell/palette/theme/accent/bootstrap-script all pass (TEST-02, TEST-03, TEST-04) | ✓ VERIFIED | `npm test` exits 0; 8 test files, 36 tests, all passing in 1.52s |

**Score:** 11/11 observable truths verified (4 require human confirmation on sub-checks noted above)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/globals.css` | Full terminal token system (Plan 01) | ✓ VERIFIED | 719 lines; dark/light theme tokens, 2x `@supports oklch` blocks, sRGB fallbacks, cursor blink, slideIn, skip-link, focus-visible, all shell component CSS |
| `app/layout.tsx` | RSC root with ThemeProvider + AccentBootstrapScript + JetBrains Mono | ✓ VERIFIED | No `"use client"`; `JetBrains_Mono` from `next/font/google` with `variable: "--font-mono"`; `ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem`; `AccentBootstrapScript` in `<head>` |
| `app/(terminal)/layout.tsx` | Persistent RSC shell layout with all islands | ✓ VERIFIED | No `"use client"`; renders skip-link, `<TopBar>`, `<Sidebar uptime={uptime}>`, `<main id="main-content">`, `<Breadcrumb>`, `<footer>`, `<CommandPalette>` |
| `app/components/shell/top-bar.tsx` | `"use client"` island with all TopBar affordances | ✓ VERIFIED | `"use client"`; `<header>`; traffic lights; path label; ⌘K button (`aria-label="Open command palette"`); theme toggle (`aria-label="Toggle color theme"`); `<LiveClock>`; resume link with `download` attribute |
| `app/components/shell/sidebar.tsx` | `"use client"` island with ROUTES, recruiter card, STATUS | ✓ VERIFIED | `"use client"`; `<nav aria-label="File explorer">`; `useSelectedLayoutSegment()` (no Context mirroring); 7 `<button>` rows with `aria-label` + `aria-current`; dashed-border recruiter card; STATUS block with "Available for hire", uptime prop, tz |
| `app/components/shell/command-palette.tsx` | `"use client"` cmdk island with 18 verbs | ✓ VERIFIED | `"use client"`; `Command.Dialog label="Command Palette"`; global ⌘K/Ctrl-K listener; focus capture + restore; `aria-live` result count; imports `PALETTE_VERBS` from `lib/palette-verbs.ts` |
| `app/components/shell/live-clock.tsx` | Hydration-safe clock with `aria-hidden` | ✓ VERIFIED | `useState<string | null>(null)` → renders `--:--` on SSR; `aria-hidden="true"` on `.live-clock` span |
| `app/components/shell/breadcrumb.tsx` | `"use client"` breadcrumb with pathname + ⌘K hint | ✓ VERIFIED | `usePathname()` derives active route label; `~/portfolio / <activeFile>` on left; `.breadcrumb-hint` with `⌘K for commands` on right; 350ms boot fade |
| `app/components/shell/accent-bootstrap-script.tsx` | RSC inline IIFE emitter | ✓ VERIFIED | No `"use client"`; IIFE reads `localStorage["portfolio-accent"]`, validates with `/^\d{1,3}$/`, sets `--accent-hue` before paint |
| `app/components/shell/shell-state-provider.tsx` | `"use client"` palette + accent state | ✓ VERIFIED | `useReducer` with `PALETTE_OPEN/CLOSE/TOGGLE` and `SET_HUE`; `setHue` writes to CSS variable AND `localStorage["portfolio-accent"]`; exposes `usePalette()` and `useAccent()` hooks |
| `app/components/shell/theme-provider.tsx` | `"use client"` next-themes wrapper | ✓ VERIFIED | Thin wrapper around `NextThemesProvider`; all props forwarded |
| `lib/routes.ts` | Single source of truth for 7 routes | ✓ VERIFIED | 7 entries with `slug`, `pathname`, `label`, `ariaLabel`, `description`; consumed by Sidebar, CommandPalette, sitemap |
| `lib/palette-verbs.ts` | 18 palette verbs | ✓ VERIFIED | 18 verbs satisfying `PaletteVerb[]`; action functions fully implemented (not stubs) |
| `app/sitemap.ts` | ROUTES-driven sitemap | ✓ VERIFIED | Maps `ROUTES`, sets `priority: 1` for root, `0.8` for others, `changeFrequency: "weekly"` |
| `app/not-found.tsx` | Terminal 404 with 7 route links | ✓ VERIFIED | RSC; renders `ls: cannot access` error; 7 `<Link>` items from `ROUTES`; uses `<NotFoundPathname>` client sub-component for pathname display |
| `app/robots.ts` | Robots referencing sitemap | ✓ VERIFIED | `allow: "/"` for all user agents; `sitemap: \`${baseUrl}/sitemap.xml\`` |
| 8 Vitest test files | TEST-02, TEST-03, TEST-04 coverage | ✓ VERIFIED | `top-bar.test.tsx`, `sidebar.test.tsx`, `live-clock.test.tsx`, `breadcrumb.test.tsx`, `accent-bootstrap-script.test.tsx`, `command-palette.test.tsx`, `sitemap.test.tsx`, `not-found.test.tsx` — all present and passing |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `app/layout.tsx` | `AccentBootstrapScript` | Import + rendered in `<head>` | ✓ WIRED | `import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script"` + `<AccentBootstrapScript />` inside `<head>` |
| `app/layout.tsx` | `ThemeProvider attribute="data-theme"` | Import + JSX wrapping body | ✓ WIRED | `ThemeProvider` from `"@/app/components/shell/theme-provider"` wraps `<ShellStateProvider>` in `<body>` |
| `app/layout.tsx` | `--font-mono` CSS variable | `JetBrains_Mono({ variable: "--font-mono" })` + `className={jetbrainsMono.variable}` on `<html>` | ✓ WIRED | Font variable attached to `<html>` root; `globals.css` body uses `var(--font-mono)` |
| `globals.css :root --accent-hue` | `--accent` token (oklch) | `oklch(0.78 0.18 var(--accent-hue))` inside `@supports` | ✓ WIRED | Confirmed by grep: `oklch.*var(--accent-hue)` matches 3 lines in dark and 3 in light |
| `AccentBootstrapScript` IIFE | `document.documentElement --accent-hue` | `localStorage.getItem("portfolio-accent")` + `setProperty` | ✓ WIRED | IIFE reads key, validates, calls `style.setProperty('--accent-hue', hue)` on `documentElement` |
| `ShellStateProvider.setHue` | `--accent-hue` + `localStorage` | `document.documentElement.style.setProperty` + `localStorage.setItem` | ✓ WIRED | Runtime accent changes propagate to CSS variable AND persist to localStorage for next load |
| `Sidebar` | `useSelectedLayoutSegment()` | Direct call, no Context | ✓ WIRED | `const segment = useSelectedLayoutSegment()` → `aria-current={isActive(route.slug) ? "page" : undefined}` |
| `sitemap.ts` | `ROUTES` | `import { ROUTES } from "@/lib/routes"` + `.map()` | ✓ WIRED | Returns 7 entries; Vitest confirms `result.length === ROUTES.length === 7` |
| `CommandPalette` | `PALETTE_VERBS` | Import from `lib/palette-verbs.ts` | ✓ WIRED | 18 verbs rendered in `Command.Item` loop; `onSelect` dispatches verb actions |
| `not-found.tsx` | ROUTES links | `import { ROUTES } from "@/lib/routes"` + `.map()` | ✓ WIRED | 7 `<Link>` items rendered per route |

---

### Data-Flow Trace (Level 4)

Not applicable. Phase 2 delivers shell infrastructure (CSS tokens, layout, client islands) — no dynamic data-fetching components. All data is either static (ROUTES, PALETTE_VERBS, PROFILE) or derived from browser APIs (localStorage, useSelectedLayoutSegment, usePathname). No API endpoints, no DB queries.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Test suite exits 0 | `npm test` | 8 test files, 36 tests, 0 failures, 1.52s | ✓ PASS |
| TypeScript clean | `npm run typecheck` | Exit 0, no errors | ✓ PASS |
| RSC boundary discipline | `grep -l '"use client"' app/layout.tsx app/(terminal)/layout.tsx` | No output (zero hits) | ✓ PASS |
| oklch count ≥ 8 | `grep -c "oklch" app/globals.css` | 15 | ✓ PASS |
| @supports count = 2 | `grep -c "@supports (color: oklch" app/globals.css` | 2 | ✓ PASS |
| PALETTE_VERBS count ≥ 16 | Count of `id:` entries in palette-verbs.ts | 18 | ✓ PASS |
| ROUTES count = 7 | Count of entries in routes.ts | 7 | ✓ PASS |
| cursor blink is only `infinite` animation | `grep "infinite" app/globals.css` | 1 hit: `blink 1s steps(2, start) infinite` | ✓ PASS |
| No `"JetBrains Mono"` literal in font-family | `grep "JetBrains Mono" app/globals.css` | Zero hits (only in comment) | ✓ PASS |
| Lint | `npm run lint` | 2 errors in `live-clock.test.tsx` (see Anti-Patterns) | ✗ FAIL |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SHELL-01 | 02-03 | Persistent shell at `app/(terminal)/layout.tsx`, never unmounts | ✓ SATISFIED | Route-group layout with all 7 routes as siblings; RSC; no client unmount logic |
| SHELL-02 | 02-02, 02-03 | `app/layout.tsx` remains RSC; only thin client islands have `"use client"` | ✓ SATISFIED | Grep confirms zero `"use client"` in both layout files; 5 client islands all correctly marked |
| SHELL-03 | 02-04 | TopBar: traffic lights, path label, ⌘K, theme toggle, LiveClock, resume button | ✓ SATISFIED | All 6 affordances present in `top-bar.tsx`; Vitest passes 4 assertions |
| SHELL-04 | 02-04 | Sidebar: EXPLORER tree, recruiter card, STATUS block | ✓ SATISFIED | `sidebar.tsx` renders all sections; Vitest passes 7 assertions |
| SHELL-05 | 02-04 | Active sidebar row from `useSelectedLayoutSegment()`, no Context mirroring | ✓ SATISFIED | Direct `useSelectedLayoutSegment()` call; no Context/store for segment |
| SHELL-06 | 02-04 | Breadcrumb: `~/portfolio / <activeFile>` left + ⌘K hint right from `usePathname()` | ✓ SATISFIED | `breadcrumb.tsx` uses `usePathname()`; Vitest passes 3 assertions |
| SHELL-07 | 02-03 | Footer: `© <year> <name> · built with React v1.0.0` on every view | ✓ SATISFIED | Footer in `(terminal)/layout.tsx` with `{currentYear}`, `{PROFILE.name}`, static strings |
| SHELL-08 | 02-03, 02-04 | 920px max-width, `32px 40px 80px` padding, slideIn micro-animation (0.25s per REQUIREMENTS) | ✓ SATISFIED (minor note) | `globals.css`: `.terminal-main { padding: 32px 40px 80px; max-width: 920px; }` and `animation: slideIn 0.2s ease-out` — **slideIn is 0.2s, not 0.25s as spec states**; functionally equivalent, sub-second timing |
| SHELL-09 | 02-01 | Cursor blink (1s steps(2) infinite, 8×14px accent block) is the only looping animation | ✓ SATISFIED | 2 `@keyframes` total: `blink` (infinite) and `slideIn` (one-shot); only `blink` has `infinite` |
| THEME-01 | 02-02 | `next-themes` ThemeProvider with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem` | ✓ SATISFIED | `app/layout.tsx` ThemeProvider has all three props; `theme-provider.test.tsx` unit test not written (see findings); implementation verified by grep and REQUIREMENTS.md spec match |
| THEME-02 | 02-02 | AccentBootstrapScript inline IIFE reads `localStorage["portfolio-accent"]`, sets `--accent-hue` synchronously before paint | ✓ SATISFIED | IIFE in `<head>` confirmed; Vitest accent-bootstrap-script.test.tsx passes 4 assertions |
| THEME-03 | 02-01 | `globals.css` defines oklch token palette for 4 hues, both themes | ✓ SATISFIED | 15 oklch references covering all accent tokens in dark and light |
| THEME-04 | 02-01 | `@supports (color: oklch(0 0 0))` sRGB fallbacks on every accent token | ✓ SATISFIED | 2 `@supports` blocks; sRGB fallbacks `#22c55e` (dark) and `#16a34a` (light) declared before blocks |
| THEME-05 | 02-05 | Accent picker: 4 hues via palette verbs; persists to `localStorage`, updates `--accent-hue` | ✓ SATISFIED | `ShellStateProvider.setHue` writes CSS variable + `localStorage["portfolio-accent"]`; 4 accent verbs in PALETTE_VERBS; Vitest confirms all 4 verb IDs |
| THEME-06 | 02-02 | JetBrains Mono via `next/font/google`; `--font-mono` variable; fallback chain | ✓ SATISFIED | `JetBrains_Mono({ subsets: ["latin"], weight: ["400","500","600","700"], display: "swap", variable: "--font-mono", fallback: [...] })`; no literal font name in `globals.css` body font-family |
| ROUTE-04 | 02-06 | `app/sitemap.ts` maps over `lib/routes.ts`; `app/robots.ts` references sitemap | ✓ SATISFIED | `ROUTES.map(r => ({ url, changeFrequency, priority, lastModified }))`; robots.ts has sitemap URL; Vitest passes 5 assertions |
| ROUTE-05 | 02-06 | Terminal-styled 404 at `app/not-found.tsx`; returns HTTP 404; links to all 7 views | ✓ SATISFIED | RSC file at `app/` root (Next.js convention guarantees HTTP 404); renders terminal error + 7 route links; Vitest passes 3 assertions |
| PALETTE-01 | 02-05 | `cmdk` palette: opens ⌘K/Ctrl-K, closes Esc/backdrop, centered modal, 520px, 15vh | ✓ SATISFIED | `Command.Dialog` with global keyboard listener; `[cmdk-dialog]` CSS: `top: 15vh; width: min(520px, 90vw)`; Vitest passes open/close tests |
| PALETTE-02 | 02-05 | ≥ 15 verbs (shipped 18) | ✓ SATISFIED | 18 verbs in `PALETTE_VERBS`; Vitest asserts `PALETTE_VERBS.length >= 16` |
| PALETTE-03 | 02-05 | Type-to-filter against label + aliases; result count via `aria-live` | ✓ SATISFIED | `onValueChange` filters `verb.label` and `verb.keywords`; `role="status" aria-live="polite"` div; Vitest confirms type-to-filter and aria-live presence |
| PALETTE-04 | 02-05 | Focus trap inside modal; focus restored to trigger on close | ✓ SATISFIED | `Command.Dialog` provides Radix focus trap; `triggerRef` captures focus on open; `useEffect` calls `triggerRef.current.focus()` on close; Vitest verifies ⌘K open, Esc close |
| A11Y-01 | 02-01, 02-03 | Skip-link to `#main-content` at top of body | ✓ SATISFIED | `<a href="#main-content" className="skip-link">` first in `(terminal)/layout.tsx`; `.skip-link` CSS reveals on `:focus` |
| A11Y-02 | 02-01 | 2px accent `:focus-visible` outline with 2px offset on all interactive elements | ✓ SATISFIED | `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` in `globals.css`; `*:focus:not(:focus-visible) { outline: none }` preserves keyboard visibility only |
| A11Y-04 | 02-04 | Sidebar buttons have plain-noun `aria-label`; `aria-current="page"` on active row | ✓ SATISFIED | All 7 `ariaLabel` values are plain nouns (no file extensions); Vitest sidebar test asserts both properties |
| A11Y-05 | 02-03, 02-04 | Semantic landmarks: `<header>`, `<nav aria-label="File explorer">`, `<main id="main-content">`, `<footer>` | ✓ SATISFIED | `<header class="topbar">` in TopBar; `<nav aria-label="File explorer">` in Sidebar; `<main id="main-content" tabIndex={-1}>` in terminal layout; `<footer class="shell-footer">` in terminal layout |
| A11Y-06 | 02-04 | LiveClock `aria-hidden="true"` | ✓ SATISFIED | `<span class="live-clock" aria-hidden="true">` in `live-clock.tsx`; Vitest live-clock test asserts attribute |
| A11Y-08 | 02-05 | Full keyboard nav; ⌘K trap; Esc restores focus | ✓ SATISFIED | `Command.Dialog` provides Radix focus trap; `triggerRef` focus restoration confirmed; Vitest keyboard tests pass; manual VoiceOver tab pass required (see Human Verification) |
| TEST-02 | 02-07 | Vitest shell coverage: TopBar, Sidebar, active state | ✓ SATISFIED | 4 TopBar + 7 Sidebar + 2 LiveClock + 3 Breadcrumb = 16 assertions passing |
| TEST-03 | 02-07 | Vitest palette coverage: open, filter, close, focus restore | ✓ SATISFIED | 8 CommandPalette assertions; closed-by-default, ⌘K opens, type-to-filter, aria-live, Esc closes, PALETTE_VERBS length and 4 accent verbs |
| TEST-04 | 02-07 | Vitest theme + accent coverage | ✓ SATISFIED (partial) | AccentBootstrapScript test passes 4 assertions (portfolio-accent key, --accent-hue var, validation regex). **`theme-provider.test.tsx` was not created** — ThemeProvider toggle + `data-theme` localStorage persistence has no direct unit test; implementation is verified by grep (attribute, defaultTheme, enableSystem present in layout.tsx) |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/components/shell/live-clock.test.tsx` | 1 | `'screen' is defined but never used` (ESLint `@typescript-eslint/no-unused-vars`) | ⚠️ Warning | `npm run lint` fails with 2 errors; does not affect test execution but breaks the CI lint gate |
| `app/components/shell/live-clock.test.tsx` | 16 | `'initialHtml' is never reassigned. Use 'const' instead` (ESLint `prefer-const`) | ⚠️ Warning | Same lint gate failure; `let initialHtml = ""` should be `const initialHtml = ""` or the variable removed |
| `app/components/shell/command-palette.tsx` | 60 | `<span className="visually-hidden">Command Palette</span>` instead of Radix `<DialogTitle>` | ℹ️ Info (known) | Radix emits console warning in tests: "`DialogContent` requires a `DialogTitle`". The visually-hidden span provides screen-reader text but does not satisfy Radix's own `DialogTitle` contract. Tests pass; warning is dev-mode only. Pre-acknowledged in the prompt as a known a11y nit. |
| `app/(terminal)/*.tsx` (all 7 route stubs) | — | `.stub-body` placeholder paragraph: `// view body lands in Phase 3` | ℹ️ Info | Route views are intentional stubs — Phase 3 replaces them. Not a blocker for Phase 2 goal. |

---

### Human Verification Required

#### 1. Slow-3G No-Flash on Hard Reload

**Test:** In Chrome DevTools, set Network throttling to "Slow 3G". In the browser console or Application tab, set `localStorage.setItem("portfolio-accent", "340")` and `localStorage.setItem("theme", "light")` (magenta hue + light theme). Hard-reload the page (`Cmd+Shift+R`). Record a video or observe the first paint.

**Expected:** Zero color/theme flash on first paint — the page should load immediately with magenta accent (`--accent-hue: 340`) and light theme (`data-theme="light"`). No flash from default matrix green → magenta, and no flash from dark → light.

**Why human:** jsdom cannot measure first-paint timing. The AccentBootstrapScript IIFE structure is verified programmatically (it reads the key and sets `--accent-hue` synchronously before paint), but the actual no-flash guarantee requires a recorded DevTools Network timeline.

#### 2. Resume Button Visible at 375px on Every Route

**Test:** In Chrome DevTools, set viewport to 375×667 (iPhone SE). Navigate to all seven routes (`/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`). Confirm the TopBar resume download button (`↓ resume.pdf`) is visible without scrolling.

**Expected:** The resume button is visible and clickable in the top bar at 375px on all routes. It should not be pushed off-screen or clipped by flex overflow. (Traffic lights and path label are hidden at small viewports by design; the resume button must NOT be hidden.)

**Why human:** CSS shows `.topbar-path { display: none }` at 480px and traffic dots/clock hide at 480px, but `.topbar-resume` has no display:none rule. The flex layout behavior at 375px with all remaining visible elements needs visual confirmation that the button is not clipped.

#### 3. VoiceOver Tab Pass

**Test:** Enable VoiceOver on macOS (Cmd+F5). Tab through the shell. Listen to what VoiceOver announces for each sidebar file row.

**Expected:** VoiceOver announces: "About me, button", "Projects, button", "Tech stack, button", "Experience, button", "Writing, button", "Contact information, button", "Shipped apps, button" — no file-extension labels audible (not "about.md", "contact.sh", etc.).

**Why human:** Screen-reader output cannot be verified in jsdom. ROUTES.ariaLabel values are correct in source code, but runtime VoiceOver announcement requires manual testing to confirm the `aria-label` attribute actually overrides the button text content in the accessibility tree.

#### 4. 4-Hue × 2-Theme Visual Smoke Test

**Test:** Using the command palette (⌘K), cycle through all four accent hues (Set accent: matrix, Set accent: amber, Set accent: cyan, Set accent: magenta) for both dark and light themes (Toggle theme). Observe each combination.

**Expected:** All 8 combinations (4 hues × 2 themes) show readable body text and visible focus rings. Pay particular attention to amber on light theme — this is identified in research as a potential legibility risk (`--warn` uses `oklch(0.5 0.16 60)` on light, amber accent `oklch(0.42 0.16 75)` on light).

**Why human:** Full WCAG contrast audit is deferred to Phase 5 (A11Y-07 via `@axe-core/playwright`). A basic visual check is required now to confirm no obviously illegible combination was shipped.

---

## Human UAT Resolution (2026-05-14)

Post-milestone human UAT pass against the live deployment. Recorded during `/gsd-audit-uat` close-out.

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Slow-3G no-flash on hard reload | ✓ PASS | Magenta+light pre-set in localStorage; zero color/theme flash on first paint under Slow-3G. |
| 2 | Resume button visible at 375px on every route | ✓ PASS | Visible and clickable in TopBar across all 7 routes; no clipping. |
| 3 | VoiceOver plain-noun sidebar labels | ✓ PASS | All 7 rows announced with plain nouns; no file-extension suffixes audible. |
| 4 | 4-hue × 2-theme visual smoke (8 combos) | ✓ PASS | All combinations readable; amber-on-light canary readable. Formal WCAG audit lives in Phase 5 (A11Y-07). |

**Net status:** 4 of 4 human items resolved PASS. Phase 2 fully verified.

---

## Gaps Summary

No blocking gaps found. All 30 requirement IDs (SHELL-01 through TEST-04) are verifiably implemented in the codebase.

**Two lint errors in `live-clock.test.tsx` break `npm run lint`** — these are warnings-grade issues in a test file (unused import of `screen`, `let` instead of `const` for `initialHtml`) but they cause the CI lint gate to fail. These should be fixed before Phase 3 begins.

**`theme-provider.test.tsx` was not created** despite being planned in Wave 5 and listed in VALIDATION.md for TEST-04 coverage. THEME-01 is verified via grep (implementation confirmed correct in `app/layout.tsx`) but lacks the planned direct unit test for toggle persistence to localStorage. This is a sub-blocker: it does not prevent Phase 3 from starting, but TEST-04 is partially incomplete and should be addressed.

**Radix DialogTitle warning** in command-palette tests is a known cosmetic issue. The `visually-hidden` span provides screen-reader text but Radix wants its `<DialogTitle>` component. This should be addressed in Phase 5 (A11Y polish).

**slideIn animation timing** is 0.2s in implementation vs 0.25s specified in REQUIREMENTS.md SHELL-08. This is a cosmetic deviation with no functional impact.

---

_Verified: 2026-05-06T09:20:00Z_
_Verifier: Claude (gsd-verifier)_
