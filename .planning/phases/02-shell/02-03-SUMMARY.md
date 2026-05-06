---
phase: 02-shell
plan: 03
subsystem: shell-layout
tags: [rsc, layout, palette-verbs, uptime, primitives, stubs]
dependency_graph:
  requires: [02-02]
  provides: [app/(terminal)/layout.tsx, lib/palette-verbs.ts, lib/uptime.ts, PromptLine]
  affects: [02-04, 02-05]
tech_stack:
  added: []
  patterns:
    - RSC route-group persistent shell layout with no "use client"
    - typed const PALETTE_VERBS satisfies readonly PaletteVerb[] (same shape as ROUTES)
    - pure-function RSC uptime helper computed at build time (no client setInterval)
    - stub client islands with matching prop signatures for typecheck pass
key_files:
  created:
    - app/(terminal)/layout.tsx
    - app/components/primitives/prompt-line.tsx
    - lib/palette-verbs.ts
    - lib/uptime.ts
    - app/components/shell/top-bar.tsx
    - app/components/shell/sidebar.tsx
    - app/components/shell/command-palette.tsx
    - app/components/shell/breadcrumb.tsx
    - app/components/shell/live-clock.tsx
  modified:
    - lib/portfolio-data.ts
    - app/globals.css
decisions:
  - Shipped 18 PALETTE_VERBS (not 19) — third social slot reserved; PROFILE.socials has only GitHub + LinkedIn; 18 ≥ 16 satisfies PALETTE-02; comment in palette-verbs.ts notes Phase 6 content pass
  - Sidebar stub accepts uptime prop matching the full Plan 04 signature; void uptime suppresses unused-var warning
  - void usage in sidebar stub preferred over underscore prefix to match project strict TypeScript
metrics:
  duration: "~15 min"
  completed: "2026-05-06"
  tasks_completed: 2
  files_changed: 11
---

# Phase 2 Plan 03: RSC Shell Layout + Primitives + Palette Verbs Summary

**One-liner:** RSC `(terminal)` route-group layout with skip-link, 5 client island stubs, `PromptLine` RSC primitive, 18-verb `PALETTE_VERBS` typed const, and `formatUptime` helper.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | lib/uptime.ts + CAREER_START_DATE + lib/palette-verbs.ts | fac26c6 | lib/uptime.ts, lib/portfolio-data.ts, lib/palette-verbs.ts |
| 2 | RSC shell layout + PromptLine + 5 island stubs + CSS | 10d0892 | app/(terminal)/layout.tsx, primitives/prompt-line.tsx, 5 stubs, globals.css |

## What Was Built

### lib/uptime.ts
Pure function `formatUptime(startDate: Date, now: Date): string` returning `"Yy DDDd"` format (e.g. `"8y 125d"`). Called at render time in the RSC layout — no client-side interval needed.

### lib/portfolio-data.ts
Added `CAREER_START_DATE = new Date("2018-01-01")` constant before `PROFILE`. Placeholder date — developer updates in Phase 6 content pass.

### lib/palette-verbs.ts
18-verb `PALETTE_VERBS` typed const array:
- 7 open-* navigation verbs
- download-resume, toggle-theme
- 4 set-accent verbs (matrix/145, amber/75, cyan/200, magenta/340)
- open-github, open-linkedin
- copy-email, copy-github-url, share-view

All social verbs use `window.open(url, "_blank", "noopener,noreferrer")` (T-2-05 mitigation). URLs sourced from `PROFILE.socials` to stay in sync with `lib/portfolio-data.ts`.

### app/(terminal)/layout.tsx
RSC route-group layout (no `"use client"`) composing:
- Skip-link `<a href="#main-content">` (A11Y-01)
- `<TopBar />` stub
- `.terminal-body` grid: `<Sidebar uptime={uptime} />` + `<main id="main-content">`
- `<Breadcrumb />` stub inside main
- `.content-block` wrapping `{children}`
- Footer: `© {year} Bakytbek Tatibekov · built with React · v1.0.0` (SHELL-07)
- `<CommandPalette />` stub outside terminal-body

### app/components/primitives/prompt-line.tsx
RSC primitive rendering `.prompt-line > .prompt-dollar + .prompt-cmd + .cursor[aria-hidden]`. CSS already in globals.css from Plan 01.

### Shell island stubs (5 files)
Minimal `"use client"` stubs with correct prop signatures so `app/(terminal)/layout.tsx` typechecks. Plan 04 replaces TopBar/Sidebar/Breadcrumb/LiveClock; Plan 05 replaces CommandPalette.

### app/globals.css additions
- `.terminal-body`: `display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 38px)`
- `.terminal-main`: `padding: 32px 40px 80px; max-width: 920px`
- `.content-block`: `animation: slideIn 0.2s ease-out`
- `.shell-footer`: flex row with gap 8px, font-size 12px, color var(--muted)

## Deviations from Plan

### Auto-applied: 18 verbs instead of 19

**Found during:** Task 1
**Issue:** Plan listed `open-social-3` (third social) as the 19th verb. `PROFILE.socials` only has GitHub and LinkedIn — no third social exists. The plan's `<important_notes>` section explicitly says: "ship with 2 socials (GitHub + LinkedIn) and add a comment in PALETTE_VERBS noting the 3rd social slot is reserved."
**Fix:** Shipped 18 verbs. Added a comment block in `lib/palette-verbs.ts` above `PALETTE_VERBS` explaining the reserved slot and how to add it (add to PROFILE.socials + add `open-social-3` entry in Phase 6).
**Impact:** PALETTE-02 requires ≥16 verbs. 18 satisfies the requirement. No functional regression.

## Requirements Satisfied

| Requirement | Status |
|-------------|--------|
| SHELL-01 (persistent shell layout) | Satisfied — `app/(terminal)/layout.tsx` is RSC, never unmounts |
| SHELL-07 (footer copy) | Satisfied — `© {year} Bakytbek Tatibekov · built with React · v1.0.0` |
| SHELL-08 (skip-link) | Satisfied — `<a href="#main-content" class="skip-link">` in layout |
| A11Y-01 (skip-link) | Satisfied — skip-link present, CSS shows on focus |
| A11Y-05 (landmark regions) | Partial — `<main id="main-content">` present; `<nav>` in Sidebar stub (Plan 04 completes) |
| PALETTE-01 (⌘K palette) | Partial — PALETTE_VERBS data layer done; CommandPalette implementation in Plan 05 |
| PALETTE-02 (≥16 verbs) | Satisfied — 18 verbs in PALETTE_VERBS |

## Known Stubs

| Stub | File | Reason |
|------|------|--------|
| TopBar returns null | app/components/shell/top-bar.tsx | Plan 04 (Wave 3b) full implementation |
| Sidebar returns null | app/components/shell/sidebar.tsx | Plan 04 (Wave 3b) full implementation |
| CommandPalette returns null | app/components/shell/command-palette.tsx | Plan 05 (Wave 3c) full implementation |
| Breadcrumb returns null | app/components/shell/breadcrumb.tsx | Plan 04 (Wave 3b) full implementation |
| LiveClock returns null | app/components/shell/live-clock.tsx | Plan 04 (Wave 3b) full implementation |

These stubs are intentional — they exist to allow `app/(terminal)/layout.tsx` to typecheck before the full implementations land in Plans 04 and 05.

## Self-Check: PASSED

Files created/exist:
- [x] app/(terminal)/layout.tsx
- [x] app/components/primitives/prompt-line.tsx
- [x] lib/palette-verbs.ts
- [x] lib/uptime.ts
- [x] lib/portfolio-data.ts (CAREER_START_DATE added)
- [x] app/components/shell/top-bar.tsx
- [x] app/components/shell/sidebar.tsx
- [x] app/components/shell/command-palette.tsx
- [x] app/components/shell/breadcrumb.tsx
- [x] app/components/shell/live-clock.tsx

Commits verified:
- [x] fac26c6 — feat(02-03): add lib/uptime.ts, CAREER_START_DATE, and lib/palette-verbs.ts
- [x] 10d0892 — feat(02-03): RSC shell layout, PromptLine primitive, and 5 island stubs

`npm run typecheck`: PASS (0 errors)
