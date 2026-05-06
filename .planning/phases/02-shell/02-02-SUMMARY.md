---
phase: 02-shell
plan: 02
subsystem: shell-providers
tags: [providers, theme, accent, layout, rsc, brownfield-deletion, test-infra]
dependency_graph:
  requires: [02-01]
  provides: [ThemeProvider, AccentBootstrapScript, ShellStateProvider, RSC-root-layout]
  affects: [app/layout.tsx, app/components/shell/]
tech_stack:
  added: [next-themes (ThemeProvider wrapper), JetBrains Mono (next/font/google), @testing-library/user-event]
  patterns: [RSC root layout, pre-paint IIFE inline script, useReducer Context, dual-axis theme+accent]
key_files:
  created:
    - app/components/shell/theme-provider.tsx
    - app/components/shell/accent-bootstrap-script.tsx
    - app/components/shell/shell-state-provider.tsx
  modified:
    - app/layout.tsx
    - package.json
    - vitest.setup.ts
    - vitest.config.ts
  deleted:
    - app/components/homepage.tsx
    - app/components/homepage.test.tsx
    - app/components/theme-toggle.tsx
    - app/page.tsx
decisions:
  - "suppressHydrationWarning on <html> required by next-themes — do not remove"
  - "AccentBootstrapScript in <head> (not <body>) so it runs before first paint"
  - "siteUrl uses || not ?? (empty-string env var protection, Phase 1 D-Pitfall D)"
  - "passWithNoTests: true added to vitest.config.ts — no test files until Plan 04 lands them"
  - "localStorage key 'portfolio-accent' for hue (separate from 'theme' which next-themes owns)"
metrics:
  duration: ~15m
  completed: "2026-05-06"
  tasks_completed: 2
  files_created: 3
  files_modified: 4
  files_deleted: 4
requirements_addressed: [SHELL-02, THEME-01, THEME-02, THEME-06, TEST-04]
---

# Phase 02 Plan 02: Shell Providers + RSC Root Layout Summary

**One-liner:** RSC root layout with JetBrains Mono + next-themes ThemeProvider + pre-paint AccentBootstrapScript IIFE + ShellStateProvider Context, deleting all brownfield components in same commit.

## What Was Built

### Task 1 — Shell Provider Components (commit `493c15c`)

Three new files in `app/components/shell/`:

**`theme-provider.tsx`** — Thin `"use client"` wrapper around `next-themes` `ThemeProvider`. Props forwarded from call site in `app/layout.tsx`: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`.

**`accent-bootstrap-script.tsx`** — RSC (no `"use client"`) that emits an inline IIFE into `<head>` before first paint. The IIFE reads `localStorage["portfolio-accent"]`, validates with `/^\d{1,3}$/` regex AND numeric range check (`+raw >= 0 && +raw < 360`), then calls `document.documentElement.style.setProperty("--accent-hue", hue)`. Falls back to `"145"` (matrix green) on invalid value or localStorage unavailability.

**`shell-state-provider.tsx`** — `"use client"` React Context using `useReducer` for two state axes:
- `paletteOpen` — command palette visibility (`PALETTE_OPEN/CLOSE/TOGGLE` actions)
- `accentHue` — current accent hue string (`SET_HUE` action)

Exports two named hooks: `usePalette()` (returns `{ open, setOpen, toggle }`) and `useAccent()` (returns `{ hue, setHue }`). `setHue` writes through to both `--accent-hue` CSS variable and `localStorage["portfolio-accent"]`.

### Task 2 — Layout Rewrite + Brownfield Deletions + Test Infra (commit `56e6e1a`)

**`app/layout.tsx`** — Fully rewritten as RSC (no `"use client"`):
- JetBrains Mono loaded via `next/font/google` with weights 400/500/600/700, display swap, `--font-mono` variable
- `suppressHydrationWarning` on `<html>` (required by next-themes)
- `AccentBootstrapScript` in `<head>` for pre-paint hue injection
- `ThemeProvider` wrapping `<body>` content
- `ShellStateProvider` wrapping children inside ThemeProvider
- Metadata updated to terminal portfolio title/description (D-16 paired update)
- Old `themeScript` const and `<script dangerouslySetInnerHTML>` deleted

**Brownfield deletions** (same commit, per D-16 / CLAUDE.md paired-deletion rule):
- `app/components/homepage.tsx` — replaced by `app/(terminal)/page.tsx` in Plan 06
- `app/components/homepage.test.tsx` — was the only test file; new specs land in Plan 04
- `app/components/theme-toggle.tsx` — replaced by TopBar theme button (Plan 03)
- `app/page.tsx` — replaced by `app/(terminal)/page.tsx` in Plan 06

**Test infrastructure:**
- `@testing-library/user-event ^14.6.1` added to `devDependencies`
- `vitest.setup.ts` — `beforeEach(() => localStorage.clear())` added for `"theme"` / `"portfolio-accent"` key isolation between tests
- `vitest.config.ts` — `passWithNoTests: true` added (deviation, see below)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added `passWithNoTests: true` to vitest.config.ts**
- **Found during:** Task 2 verification (`npm test`)
- **Issue:** After deleting `homepage.test.tsx` (the only test file), `vitest run` exited with code 1 and message "No test files found, exiting with code 1". The plan specifies `npm test` must exit 0, and the deletion is required by the plan's own brownfield discipline. No test files exist until Plan 04 creates the shell component specs.
- **Fix:** Added `passWithNoTests: true` to `vitest.config.ts` test options.
- **Files modified:** `vitest.config.ts`
- **Commit:** `56e6e1a` (included in same brownfield atomic commit)

**2. [Rule 1 - Bug] Cleared stale `.next/types/` cache before typecheck**
- **Found during:** Task 2 verification (`npm run typecheck`)
- **Issue:** `.next/types/app/page.ts` still referenced the deleted `app/page.tsx`, causing TS2307 errors on typecheck. This is a stale Next.js build cache from a prior `next build` or `next dev` run.
- **Fix:** Deleted `.next/` directory before running typecheck. Not committed (`.next` is gitignored).
- **Files modified:** None (cache deletion only)
- **Commit:** n/a

## Security Notes (Threat Model T-2-02)

The AccentBootstrapScript IIFE applies two layers of validation before calling `setProperty`:
1. Regex `/^\d{1,3}$/` — ensures only 1-3 digit strings pass
2. Range check `+raw >= 0 && +raw < 360` — ensures hue is a valid CSS hue angle

No user-controlled value reaches `dangerouslySetInnerHTML` — the script string is a hard-coded module-level constant. (T-2-03 accepted per plan threat model.)

## Known Stubs

None. All files created in this plan are fully wired. `app/page.tsx` deletion leaves `/` returning 404 until Plan 06 lands `app/(terminal)/page.tsx` — this is intentional and documented in the plan.

## Self-Check: PASSED

Files exist:
- `app/components/shell/theme-provider.tsx` — FOUND
- `app/components/shell/accent-bootstrap-script.tsx` — FOUND
- `app/components/shell/shell-state-provider.tsx` — FOUND
- `app/layout.tsx` — FOUND (RSC, no `"use client"` directive)

Files deleted:
- `app/components/homepage.tsx` — deleted correctly
- `app/components/homepage.test.tsx` — deleted correctly
- `app/components/theme-toggle.tsx` — deleted correctly
- `app/page.tsx` — deleted correctly

Commits:
- `493c15c` — Task 1 shell provider components
- `56e6e1a` — Task 2 layout rewrite + brownfield deletions + test infra
