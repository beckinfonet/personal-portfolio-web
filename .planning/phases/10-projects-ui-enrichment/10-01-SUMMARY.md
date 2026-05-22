---
phase: 10-projects-ui-enrichment
plan: 01
subsystem: projects-ui
tags: [pure-formatters, view-models, github-stats, tdd]
requires:
  - "lib/types.ts GitHubRepoStats interface (Phase 9)"
provides:
  - "lib/project-stats.ts — pure formatter module: topLanguages, formatDuration, relativeTime, monthYear, buildStripModel, buildPanelModel + StripModel/PanelModel types + LANG_ABBREV map"
  - "StripModel / PanelModel output contracts for Plan 10-02 project-row.tsx"
affects:
  - "Plan 10-02 (project-row.tsx) implements against these fixed, verified view-models"
tech-stack:
  added: []
  patterns:
    - "Pure formatter module mirroring lib/experience-duration.ts (JSDoc header, now-injection seam, UTC date methods, branch-structured return)"
    - "Server-and-client-safe module — zero node:/React/github imports keeps Plan 02's client island off the GITHUB_TOKEN surface"
key-files:
  created:
    - "lib/project-stats.ts"
    - "lib/project-stats.test.ts"
  modified: []
decisions:
  - "LANG_ABBREV seeded with TypeScript/JavaScript/Python only (D-06) — short languages (Swift, CSS, HTML, Shell, Go) intentionally absent and render verbatim"
  - "Percentages computed from raw total before the <1% floor; surviving pct may not sum to 100 — intentional per Pitfall 6, no re-normalization"
metrics:
  duration: "~3m"
  completed: "2026-05-22"
  tasks: 2
  files: 2
  commits: 2
  tests-added: 33
---

# Phase 10 Plan 01: project-stats Pure Formatter Module Summary

Pure, dependency-free formatter module that converts a `GitHubRepoStats` object into the collapsed-strip and expanded-panel view-models the Phase 10 projects UI renders — shipped with 33 exhaustive co-located unit tests, ahead of any consumer.

## What Was Built

`lib/project-stats.ts` — a pure module (no I/O, no React, no `node:` imports; the only import is `import type { GitHubRepoStats } from "./types"`) exporting:

- `topLanguages(languages, limit)` — top-N languages by byte count with the <1% floor applied (D-08 / D-09); returns `[]` on a 0-byte total.
- `formatDuration(createdAtISO, now?)` — `Nmo` under a year, `Ny Nmo` at a year or above; negative / sub-month ranges guarded to `"0mo"`. UTC methods.
- `relativeTime(iso, now?)` — `today` / `N day(s) ago` / `N month(s) ago` / `N year(s) ago`.
- `monthYear(iso)` — short month name + 4-digit year, e.g. `"Jan 2026"`, UTC-stable.
- `buildStripModel(stats, now?)` — `StripModel | null`; `null` on null stats (LIST-07). Top-3 languages abbreviated via `LANG_ABBREV` or rendered verbatim (D-06).
- `buildPanelModel(stats, now?)` — `PanelModel | null`; `null` on null stats (DETAIL-07). Top-5 breakdown with FULL GitHub names (D-07), `otherPct` absorbing ranks 6+, a `durationLine`, and a `lastActive` line.
- `StripModel` / `PanelModel` interfaces and the `LANG_ABBREV` map.

`lib/project-stats.test.ts` — 33 unit tests, one `describe` per export, every date-dependent assertion injecting a literal `new Date(...)`.

## Task Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | RED — failing tests for all pure helpers | `ae4059a` | lib/project-stats.test.ts |
| 2 | GREEN — implement lib/project-stats.ts | `7ac0676` | lib/project-stats.ts |

## TDD Gate Compliance

- RED gate: `test(10-01): add failing tests…` (`ae4059a`) — verified failing on the unresolved `./project-stats` import before implementation.
- GREEN gate: `feat(10-01): implement project-stats…` (`7ac0676`) — all 33 tests pass.
- REFACTOR: not needed — the implementation mirrors the `lib/experience-duration.ts` analog cleanly with no post-GREEN cleanup.

## Verification

- `npx vitest run lib/project-stats.test.ts` — 33/33 green.
- `npx tsc --noEmit` — exit 0, TypeScript strict clean.
- `grep -E 'from "(node:|.*github)' lib/project-stats.ts` — no matches (T-10-01 boundary integrity for Plan 02).
- `npm test` — full Vitest suite 249/249 green (was 216; +33 new, no regressions).

## Deviations from Plan

### Notes (no auto-fixes required)

**1. RED-state grep pattern did not literally match the Vite error string.**
- **Found during:** Task 1 verification.
- **Detail:** The plan's `<verify>` automated check greps for `"Cannot find module|Failed to load"`. Vitest/Vite emits the module-missing error as `Failed to resolve import "./project-stats" from "lib/project-stats.test.ts". Does the file exist?`. This is the same semantic RED state the plan's acceptance criteria require ("fails because `./project-stats` cannot be resolved — module not yet created").
- **Action:** Confirmed RED by inspecting the Vitest output directly — the test file failed to collect because the `./project-stats` import could not be resolved. No code change; the plan's intent (RED before GREEN) was satisfied. Documented here so the verifier does not flag the grep-pattern mismatch.

No structural deviations. No Rule 1/2/3 auto-fixes were needed — the plan's reference implementation in 10-RESEARCH.md already incorporated every pattern (UTC methods, now-injection, <1% floor, Pitfall 6 no-re-normalization).

## Authentication Gates

None.

## Known Stubs

None — `lib/project-stats.ts` is a complete, fully-tested pure module. `LANG_ABBREV` ships with three curated entries (`TypeScript`, `JavaScript`, `Python`); per D-06 this is intentional and correct — any language absent from the map renders its full GitHub name verbatim, so the map needs no further entries to be functionally complete.

## Self-Check: PASSED

- FOUND: lib/project-stats.ts
- FOUND: lib/project-stats.test.ts
- FOUND commit: ae4059a (test 10-01)
- FOUND commit: 7ac0676 (feat 10-01)
