---
phase: 10-projects-ui-enrichment
plan: 03
subsystem: a11y-testing
tags: [playwright, axe-core, wcag, contrast, disclosure-panel]
requires:
  - "tests/contrast.spec.ts — Phase 5 56-cell axe matrix (4 hues × 2 themes × 7 routes)"
  - "app/components/project-row.tsx — .projects-row-trigger / .projects-tech-panel selectors (Plan 10-02)"
provides:
  - "tests/contrast.spec.ts — panel-visible path: expands the first /projects Tech highlights panel before axe analyze()"
affects:
  - "Plan 11 (deploy + smoke verification) — DETAIL-08 contrast coverage now genuinely attests the strip + panel selectors"
tech-stack:
  added: []
  patterns:
    - "Route-gated interaction before axe analyze() — expand a `hidden` disclosure panel so axe scans its selectors (axe skips hidden / display:none content)"
    - "toBeVisible() canary against a silent hidden-panel false pass — the test fails loudly at the expansion step rather than producing a green-but-unscanned cell"
key-files:
  created: []
  modified:
    - "tests/contrast.spec.ts"
decisions:
  - "Panel-expansion step gated to route.pathname === \"/projects\" and placed AFTER the Pitfall 10 data-theme canary, BEFORE AxeBuilder.analyze() — preserves the 4×2×7 loop, the pre-paint addInitScript seed, and the canary ordering unchanged."
metrics:
  duration: "~2m"
  completed: "2026-05-22"
  tasks: 1
  files: 1
  commits: 1
  tests-added: 0
---

# Phase 10 Plan 03: Contrast Matrix Panel Coverage Summary

Extended the Phase 5 56-cell axe contrast matrix so the new Phase 10 `/projects` surfaces are actually scanned. The collapsed `gh:` stat strip is server-rendered and visible, so axe already scanned it. The expanded Tech highlights panel ships with `hidden` until its row is expanded — axe skips `hidden` / `display:none` content, so without an expansion step the matrix would stay green while silently never checking the panel colors. This plan closes that DETAIL-08 false-pass gap.

## What Was Built

**`tests/contrast.spec.ts`** — added one route-gated conditional block inside the existing `THEMES × HUES × ROUTES` triple loop, placed after the Pitfall 10 `data-theme` canary assertion and before `new AxeBuilder(...).analyze()`. When `route.pathname === "/projects"`, the block clicks `.projects-row-trigger` (the first project's disclosure button) and then asserts `.projects-tech-panel` is visible. A leading comment explains why the step exists (axe skips `hidden` content — Pitfall 4 / DETAIL-08). Everything structural is preserved unchanged: the `HUES = [145, 75, 200, 340]` × `THEMES = ["dark","light"]` × `ROUTES` loop, the pre-paint `addInitScript` localStorage seed, the `data-theme` canary, the `AxeBuilder` WCAG tags, and the color-contrast violation filter + `expect([]).toEqual([])` assertion.

The `.projects-tech-panel` minimal panel renders even without live GitHub stats (the panel `<div>` is unconditional; only the Tech highlights block inside it is `panel`-gated), so the `toBeVisible()` canary holds regardless of whether `GITHUB_TOKEN` is present at test time — confirmed by the local run where the Vitest GitHub fetch hit a rate limit yet the panel still expanded.

## Task Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add panel-visible path so the contrast matrix scans the Tech highlights panel | `35ef1b3` | tests/contrast.spec.ts |

## Verification

- `npx playwright test tests/contrast.spec.ts` — 56/56 cells green in 40.6s, including the amber-on-light (`accent=75`, `theme=light`) `/projects` cell with the panel expanded.
- `npm test` — full Vitest suite 255/255 green (test-only change, no regressions).
- `npm run build` — production build + INFRA-05 postbuild placeholder grep clean.

## Deviations from Plan

None — plan executed exactly as written. The single task's acceptance criteria were all met without auto-fix.

## Authentication Gates

None. The Vitest run logged a benign GitHub rate-limit message (`x-ratelimit-remaining: 0`) during `projects/page.test.tsx`; `lib/github.ts` degrades gracefully to a null-stats path, the page renders, and all 255 tests still pass. The contrast matrix runs against the production build and does not depend on live GitHub data — the panel expands and `.projects-tech-panel` is visible whether or not stats resolve.

## Known Stubs

None — `tests/contrast.spec.ts` is a complete verification artifact. No production code was modified.

## Threat Flags

None — this plan modifies only `tests/contrast.spec.ts`. No production code, no runtime surface, no new dependency. Threat T-10-07 (silent DETAIL-08 false pass) is now mitigated by the `toBeVisible()` canary, exactly as the plan's `<threat_model>` specified; T-10-08 (test-only change, no production threat) holds.

## Self-Check: PASSED

- FOUND: tests/contrast.spec.ts (modified)
- FOUND commit: 35ef1b3 (test 10-03 panel-visible path)
