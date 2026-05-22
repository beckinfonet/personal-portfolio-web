---
phase: 10-projects-ui-enrichment
plan: 02
subsystem: projects-ui
tags: [client-island, disclosure, rsc-parallel-fetch, github-stats, css]
requires:
  - "lib/project-stats.ts — buildStripModel / buildPanelModel + StripModel/PanelModel (Plan 10-01)"
  - "lib/github.ts — getRepoStats (Phase 9)"
  - "app/components/primitives/external-link.tsx — ExternalLink (Phase 3)"
provides:
  - "app/components/project-row.tsx — ProjectRow client island: expand/collapse disclosure with gh: strip + Tech highlights panel"
  - "/projects view renders a gh:-prefixed stat strip per repo-backed card and an inline expandable Tech highlights panel"
affects:
  - "Plan 11 (deploy + smoke verification) verifies the /projects strip + panel against the production GitHub data path"
tech-stack:
  added: []
  patterns:
    - "Thin 'use client' disclosure island — useState(open) + useId() panel id, button/aria-expanded/aria-controls, panel is a SIBLING of the trigger (no nested anchors)"
    - "RSC parallel data resolve — Promise.all over .map(getRepoStats), never sequential await"
    - "Independent per-row toggle state — multiple panels open at once (not a single-open accordion)"
key-files:
  created:
    - "app/components/project-row.tsx"
    - "app/components/project-row.test.tsx"
  modified:
    - "app/components/views/projects-view.tsx"
    - "app/(terminal)/projects/page.tsx"
    - "app/globals.css"
decisions:
  - "Dropped the planned `index` prop from ProjectRow — D-12 replaced the `NN.` numeral with the [+]/[-] toggle glyph, so the index was dead code that tripped ESLint no-unused-vars. Removed from props, call site, and test baseProps."
metrics:
  duration: "~3m"
  completed: "2026-05-22"
  tasks: 3
  files: 5
  commits: 6
  tests-added: 6
---

# Phase 10 Plan 02: Projects Stat Strip + Tech Highlights Panel Summary

Wired the Phase 9 GitHub data layer into `/projects`: the RSC page resolves `getRepoStats()` for every project in parallel, builds strip + panel view-models with Plan 01's pure helpers, and renders them through a new `ProjectRow` client island that turns each project row from an external `<a>` into an expand/collapse disclosure.

## What Was Built

**`app/components/project-row.tsx`** — a thin `"use client"` disclosure island. Holds `useState(open)` + `useId()` panel id; each row owns its own state so multiple panels open independently (D-04). Renders an `<li>` with the untouched 3-column `.projects-row` grid: index column shows `[+]`/`[-]` (D-12 expand cue), column 2 is a real `<button type="button">` carrying `aria-expanded` / `aria-controls` / `aria-label="${name}: ${summary}"` (D-02), column 3 is the verbatim meta block outside the button. The server-rendered `gh:` strip renders inside the button below the chip row, only when `strip` is non-null (LIST-07). The panel `<div>` is a SIBLING of the trigger (no nested anchors — D-05) with `id={panelId}` + `hidden={!open}`; the Tech highlights block (heading, breakdown, duration line, last-active line, prominent commit stat) renders only when `panel` is non-null (DETAIL-07/D-03). Both CTAs (`View on GitHub →` when `repoUrl` present, `Visit project →` always) live inside the panel via `ExternalLink`. Zero `lib/github.ts` / `node:` imports (T-10-03).

**`app/components/project-row.test.tsx`** — 6 branch tests: strip present/null, all-languages-rendered (D-13 layout/wrap contract), panel expand toggles `aria-expanded`, panel present (Tech highlights + commit stat + `View on GitHub` href) and panel null (no heading, `Visit project` CTA retained).

**`app/(terminal)/projects/page.tsx`** — preserves the `metadata` export, `ROUTES[1]`, and `PromptLine`. After `getProjects()`, resolves stats via `Promise.all(projects.map(p => p.repoUrls?.length ? getRepoStats(p.repoUrls) : Promise.resolve(null)))` (Pitfall 1 — never sequential), builds `{ project, strip, panel }` rows with `buildStripModel` / `buildPanelModel`, passes them to `<ProjectsView rows={...} />`.

**`app/components/views/projects-view.tsx`** — RSC view; `ProjectsViewProps` now takes `rows: { project; strip; panel }[]`. Preserves the empty-state early return and the `.projects-subhead` count line; sorts rows by `project.year` desc so strip/panel travel with each project; renders `<ProjectRow>` per row with `repoUrl={project.repoUrls?.[0] ?? null}` (the original untransformed string — Pitfall 5).

**`app/globals.css`** — appended `.projects-row-trigger` (native-button reset), `.projects-row-stats` (flex + flex-wrap, 12px/`--muted` — D-12), `.gh-token` (`--accent` — D-11), `.projects-tech-panel` (`--panel` surface), `.projects-panel-heading/-breakdown/-line`, `.projects-commit-stat` (15px/600/`--accent` — DETAIL-05), `.projects-panel-cta-row` — all inside the existing `.projects-*` block, no new top-level section (LIST-08/D-10), no new custom properties.

## Task Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 (RED) | failing ProjectRow branch tests | `c3e939e` | project-row.test.tsx |
| 1 (GREEN) | implement ProjectRow island | `f54e70c` | project-row.tsx, project-row.test.tsx |
| 2 | wire ProjectRow into RSC view + page | `e4eadc9` | projects/page.tsx, projects-view.tsx, project-row.tsx, project-row.test.tsx |
| 2 (fix) | reword comment so for-await grep is clean | `6b7a695` | projects/page.tsx |
| 3 | style strip + Tech highlights panel | `274d071` | globals.css |

## TDD Gate Compliance

Task 1 was `tdd="true"`. RED gate: `test(10-02): add failing branch tests…` (`c3e939e`) — verified failing (test file failed to collect on the unresolved `./project-row` import). GREEN gate: `feat(10-02): implement ProjectRow disclosure island` (`f54e70c`) — all 6 tests pass. REFACTOR: not needed.

## Verification

- `npx vitest run app/components/project-row.test.tsx` — 6/6 green.
- `npx vitest run "app/(terminal)/projects/page.test.tsx"` — 3/3 green (metadata.title + `ls -la projects/` smoke tests unchanged).
- `npm test` — full Vitest suite 255/255 green (was 249; +6 new ProjectRow tests, no regressions).
- `npx tsc --noEmit` — exit 0, TypeScript strict clean.
- `npm run lint` — ESLint clean.
- `npm run build` — production build + INFRA-05 postbuild placeholder grep clean.
- `grep -E 'from "(node:|@/lib/github)' app/components/project-row.tsx` — no matches (T-10-03 client/server boundary intact).
- `grep -c "for.*await\|for await" app/(terminal)/projects/page.tsx` — 0 (no sequential await loop).
- `grep -c "stack-view" app/globals.css` — 1 (unchanged, no new CSS section).
- `grep -cE "^\s*--[a-z]" app/globals.css` — 56 (unchanged, no new custom properties).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Dropped the planned `index` prop from ProjectRow**
- **Found during:** Task 2 (`npm run lint`).
- **Issue:** Plan Task 1 specified `index: number` in `ProjectRowProps` and Task 2 passes the post-sort index. But D-12 replaced the `NN.` index numeral with the `[+]`/`[-]` toggle glyph, so `index` is never read in the markup — `@typescript-eslint/no-unused-vars` failed lint on it.
- **Fix:** Removed `index` from `ProjectRowProps`, the destructure, the `ProjectsView` call site, and the test `baseProps`. The `.map((..., i) =>)` index parameter was also removed from `ProjectsView`. No behavior change — the index numeral was already superseded by the toggle glyph in the plan's own design.
- **Files modified:** `project-row.tsx`, `projects-view.tsx`, `project-row.test.tsx`
- **Commit:** `e4eadc9`

### Notes (no auto-fix — self-correction)

**2. Page comment substring tripped its own acceptance grep.**
- **Found during:** Task 2 post-commit verification.
- **Detail:** The plan's acceptance criterion `grep -c "for.*await\|for await" page.tsx` must return 0. The implementation uses `Promise.all` correctly (no sequential loop), but a code comment contained the literal phrase `for...await loop`, matching `for.*await`. Reworded the comment to "never sequential awaiting" — preserves intent, grep now returns 0. Same self-correction class as prior phases' comment rewordings (Plan 05-02 service-worker comment, Plan 05-03 themeColor comment).
- **Commit:** `6b7a695`

### Test-locator adjustment (no production-code change)

**3. Panel commit-stat test scoped to `.projects-commit-stat`.**
- **Found during:** Task 1 GREEN verification.
- **Detail:** The strip renders `<span>{commitCount} commits</span>` and the panel renders `.projects-commit-stat` with the same `247 commits` text. `screen.getByText("247 commits")` matched both. Scoped the panel assertion to `container.querySelector(".projects-commit-stat")` — asserts the DETAIL-05 prominent stat specifically. No production-code change; the dual rendering (quiet strip stat + prominent panel stat) is intentional per UI-SPEC.

## Authentication Gates

None.

## Known Stubs

None — `ProjectRow` is a complete island; the strip and panel render fully from the props the RSC page resolves. Cards with empty/absent `repoUrls` or null stats render no strip and a minimal panel (summary + `Visit project` CTA) — that is the intended degraded state (LIST-07/DETAIL-07/D-03), not a stub.

## Threat Flags

None — all surface in this plan is covered by the plan's `<threat_model>`. The client/server boundary (T-10-03) is grep-verified clean; both CTAs reuse `ExternalLink` (T-10-04 `rel=noopener noreferrer`); GitHub-supplied strings render as JSX text nodes with no `dangerouslySetInnerHTML` (T-10-05).

## Self-Check: PASSED

- FOUND: app/components/project-row.tsx
- FOUND: app/components/project-row.test.tsx
- FOUND: app/components/views/projects-view.tsx (modified)
- FOUND: app/(terminal)/projects/page.tsx (modified)
- FOUND: app/globals.css (modified)
- FOUND commit: c3e939e (test 10-02 RED)
- FOUND commit: f54e70c (feat 10-02 GREEN)
- FOUND commit: e4eadc9 (feat 10-02 wire-in)
- FOUND commit: 6b7a695 (style 10-02 comment fix)
- FOUND commit: 274d071 (feat 10-02 CSS)
