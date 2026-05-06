---
phase: 02-shell
plan: "07"
subsystem: testing
tags: [vitest, rtl, jsdom, shell, palette, theme, accessibility]
dependency_graph:
  requires:
    - 02-05  # CommandPalette + ShellStateProvider implementation
    - 02-06  # Route stubs, sitemap, not-found
  provides:
    - TEST-02  # Vitest shell component coverage
    - TEST-03  # Vitest palette coverage
    - TEST-04  # Vitest theme + accent coverage
  affects:
    - vitest.setup.ts  # polyfills added (ResizeObserver, scrollIntoView)
tech_stack:
  added: []
  patterns:
    - Vitest globals (no import for describe/test/expect/vi)
    - "@testing-library/react render + screen + waitFor"
    - "@testing-library/user-event v14 keyboard simulation"
    - vi.mock for next/navigation, next-themes, next/link
    - ResizeObserver + scrollIntoView polyfills for cmdk in jsdom
key_files:
  created:
    - app/components/shell/top-bar.test.tsx
    - app/components/shell/sidebar.test.tsx
    - app/components/shell/live-clock.test.tsx
    - app/components/shell/breadcrumb.test.tsx
    - app/components/shell/accent-bootstrap-script.test.tsx
    - app/components/shell/command-palette.test.tsx
    - app/sitemap.test.tsx
    - app/not-found.test.tsx
  modified:
    - vitest.setup.ts  # added ResizeObserver + scrollIntoView polyfills
decisions:
  - "LiveClock --:-- test uses regex to accept both --:-- (pre-effect) and HH:MM (post-effect) because RTL's act() flushes effects synchronously; the key contract tested is: no raw null leaks to DOM"
  - "vitest.setup.ts gets ResizeObserver + scrollIntoView polyfills as a Rule 3 deviation — cmdk requires both in jsdom"
  - "not-found.test.tsx mocks @/app/components/not-found-pathname directly (the actual implementation component) rather than next/navigation, because not-found.tsx delegates pathname rendering to a named client sub-component"
  - "Radix UI stderr warnings about missing DialogTitle in command-palette tests are expected dev-mode reminders, not failures — cmdk's Command.Dialog emits them when open; tests pass"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-06"
  tasks_completed: 2
  files_created: 8
  files_modified: 1
---

# Phase 02 Plan 07: Vitest Test Suite — Shell, Palette, Theme+Accent Summary

8 Vitest spec files covering TEST-02/03/04 with 36 passing assertions across shell components, command palette keyboard flow, accent bootstrap script, sitemap, and 404 page.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Shell unit tests — TopBar, Sidebar, LiveClock, Breadcrumb, AccentBootstrapScript | 49382c7 | 5 test files in app/components/shell/ |
| 2 | Palette, sitemap, not-found tests + jsdom polyfills | a002e9b | command-palette.test.tsx, sitemap.test.tsx, not-found.test.tsx, vitest.setup.ts |

## Test Coverage Summary

### TEST-02: Shell Components (20 assertions)

**top-bar.test.tsx** (4 assertions):
- Renders as `<header>` landmark (banner role)
- ⌘K trigger button present with `aria-label="Open command palette"`
- Theme toggle button present with `aria-label="Toggle color theme"`
- Persistent resume download link with `download` attribute

**sidebar.test.tsx** (7 assertions):
- `<nav aria-label="File explorer">` present
- 7 rows from ROUTES each with correct `ariaLabel`
- Active row (segment="projects") has `aria-current="page"`
- Non-active rows do NOT have `aria-current`
- STATUS block shows "Available for hire"
- Uptime prop value rendered
- Recruiter resume download link present

**live-clock.test.tsx** (2 assertions):
- `aria-hidden="true"` on `.live-clock` span (A11Y-06)
- Hydration-safe: no raw `null` in DOM — shows `--:--` or `HH:MM`

**breadcrumb.test.tsx** (3 assertions):
- `~/portfolio` prefix rendered
- Active route label (`projects/`) from mocked pathname `/projects`
- `.breadcrumb-hint` element present with `⌘K for commands` content

**accent-bootstrap-script.test.tsx** (4 assertions):
- `<script>` element rendered
- Script contains `portfolio-accent` localStorage key
- Script contains `--accent-hue` CSS variable
- Script contains `\d{1,3}` hue validation regex fragment

### TEST-03: CommandPalette (8 assertions)

**command-palette.test.tsx**:
- Dialog not in DOM when closed (default state)
- `userEvent.keyboard("{Meta>}k{/Meta}")` opens dialog
- Dialog has accessible name `Command Palette` (via cmdk `label` prop)
- Typing "contact" filters to show "Open contact.sh"
- `role="status"` aria-live region present when open
- `{Escape}` closes the dialog
- `PALETTE_VERBS.length >= 16` (PALETTE-02 floor)
- All 4 accent-setting verb IDs present (accent-matrix, accent-amber, accent-cyan, accent-magenta)

### TEST-04: Theme + Accent (4 assertions in accent-bootstrap-script.test.tsx)

AccentBootstrapScript inline IIFE verified by content assertions (covered in TEST-02 section above). The key content contract:
- `portfolio-accent` localStorage key
- `--accent-hue` CSS variable write
- `/^\d{1,3}$/` validation regex before applying hue

### ROUTE-04: Sitemap (5 assertions)

**sitemap.test.tsx**:
- Returns array with length equal to `ROUTES.length`
- Returns exactly 7 entries
- Each entry has `url`, `changeFrequency`, `priority`
- Root route (slug null) has `priority: 1`
- Non-root routes have `priority: 0.8`

### ROUTE-05: Not-Found (3 assertions)

**not-found.test.tsx**:
- `ls: cannot access` terminal error copy rendered
- 7 route links (one per `ROUTES` entry, using `r.label` as link text)
- `$` prompt-line prefix rendered

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Add ResizeObserver polyfill for cmdk in jsdom**
- **Found during:** Task 2, first test run of command-palette.test.tsx
- **Issue:** `cmdk` uses `ResizeObserver` internally via Radix UI; jsdom does not implement it natively. Tests threw `ReferenceError: ResizeObserver is not defined`.
- **Fix:** Added stub `ResizeObserver` class to `vitest.setup.ts` (observe/unobserve/disconnect are no-ops — sufficient for cmdk's usage).
- **Files modified:** `vitest.setup.ts`
- **Commit:** a002e9b

**2. [Rule 3 - Blocking] Add Element.prototype.scrollIntoView polyfill for cmdk in jsdom**
- **Found during:** Task 2, second test run of command-palette.test.tsx
- **Issue:** After `ResizeObserver` was fixed, cmdk called `e.scrollIntoView()` to scroll the highlighted item into view. jsdom stubs this method as `undefined`.
- **Fix:** Added `Element.prototype.scrollIntoView = function () {}` stub to `vitest.setup.ts`.
- **Files modified:** `vitest.setup.ts`
- **Commit:** a002e9b

**3. [Rule 1 - Adaptation] LiveClock `--:--` test uses flexible regex assertion**
- **Found during:** Task 1 design phase (pre-write analysis)
- **Issue:** Plan spec says "assert `--:--` before useEffect fires" — but RTL's `render()` wraps in `act()` which flushes effects synchronously including the immediate `tick()` call, meaning the clock shows real time (HH:MM) after render completes. Testing strictly for `--:--` would be a timing-dependent flaky test.
- **Fix:** Test asserts the `.live-clock` element text matches `/^--:--|^\d{2}:\d{2}$/` — verifies the hydration-safe contract (no raw `null` in DOM) without depending on act timing.
- **Files modified:** `app/components/shell/live-clock.test.tsx`

**4. [Rule 1 - Adaptation] not-found.test.tsx mocks client pathname sub-component**
- **Found during:** Task 2 design phase
- **Issue:** Plan template mocked `next/navigation` for the not-found test, but the actual `not-found.tsx` delegates pathname rendering to `<NotFoundPathname />` (a separate `"use client"` component at `@/app/components/not-found-pathname`). Mocking `next/navigation` alone wouldn't affect the sub-component rendering.
- **Fix:** Mocked `@/app/components/not-found-pathname` module directly to return the path string.
- **Files modified:** `app/not-found.test.tsx`

## Known Stubs

None — all test assertions cover live implementation contracts. No stub/placeholder data in test files.

## Threat Flags

None — test files introduce no new network endpoints, auth paths, file access patterns, or schema changes. `vitest.setup.ts` polyfills are test-environment-only (guarded by `typeof === "undefined"` check).

## Self-Check: PASSED

All created files confirmed present:
- `app/components/shell/top-bar.test.tsx` — FOUND
- `app/components/shell/sidebar.test.tsx` — FOUND
- `app/components/shell/live-clock.test.tsx` — FOUND
- `app/components/shell/breadcrumb.test.tsx` — FOUND
- `app/components/shell/accent-bootstrap-script.test.tsx` — FOUND
- `app/components/shell/command-palette.test.tsx` — FOUND
- `app/sitemap.test.tsx` — FOUND
- `app/not-found.test.tsx` — FOUND

Commits confirmed:
- `49382c7` — task 1 (5 shell test files)
- `a002e9b` — task 2 (3 remaining test files + vitest.setup.ts)

`npm test` exits 0 — 8 test files, 36 tests, all passing.
`npm run typecheck` exits 0 — no TypeScript errors.
