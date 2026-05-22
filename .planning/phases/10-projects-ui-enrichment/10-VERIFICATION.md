---
phase: 10-projects-ui-enrichment
verified: 2026-05-22T00:30:00Z
status: human_needed
score: 17/18
overrides_applied: 0
human_verification:
  - test: "Open /projects at 480px viewport width in a browser"
    expected: "The gh: stat strip under each repo-backed card wraps gracefully to a second line with no horizontal scroll; all 1-3 language labels remain visible"
    why_human: "CSS flex-wrap behavior at narrow widths cannot be verified without a rendered browser; Playwright contrast tests run at default viewport, not 480px"
---

# Phase 10: Projects UI Enrichment — Verification Report

**Phase Goal:** `/projects` route surfaces a lean stat strip per card and each project's detail page renders a "Tech highlights" panel — both backed by `lib/github.ts`, both gracefully omitted when stats are null

**Verified:** 2026-05-22T00:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every repo-backed project card on /projects renders a one-line gh:-prefixed strip | VERIFIED | `project-row.tsx` line 71-81: strip rendered only when `strip` is non-null; `gh:` token in `.gh-token` span; test branch "renders the gh: token and formatted strip text when strip prop is present" passes |
| 2 | Cards with empty/absent repoUrls or null stats render no strip, no placeholder | VERIFIED | `buildStripModel(null)` returns null (line 157 `lib/project-stats.ts`); `project-row.tsx` gated by `{strip && (...)}` (line 71); test branch "renders no .projects-row-stats element when strip prop is null" passes |
| 3 | "Tech highlights" panel is an inline accordion expand — no new /projects/[slug] route | VERIFIED | `ls app/(terminal)/projects/` shows only `opengraph-image.tsx`, `page.test.tsx`, `page.tsx` — no `[slug]` subdirectory. Panel rendered as `<div id={panelId} hidden={!open}>` sibling of trigger button in `project-row.tsx` |
| 4 | Each project row is a button disclosure toggle with independent state | VERIFIED | `project-row.tsx` line 47-81: `useState(false)` per instance, `<button type="button" aria-expanded={open} aria-controls={panelId} aria-label={...}>` — each row owns its own state |
| 5 | Multiple panels can be open at once (not a single-open accordion) | VERIFIED | Each `ProjectRow` holds its own `useState(false)` — no shared accordion state anywhere; D-04 satisfied |
| 6 | Project with null stats expands to a minimal panel (Visit project CTA, no Tech highlights) | VERIFIED | `project-row.tsx` line 88-117: panel container always renders; `{panel && (...)}` gates the Tech highlights block; CTA row always includes `Visit project →` via `ExternalLink href={link}`; test "with panel null, expanded panel renders no Tech highlights heading but keeps the Visit project CTA" passes |
| 7 | Strip source marker is a monospace gh: text token, not an SVG | VERIFIED | `project-row.tsx` line 73: `<span className="gh-token">gh:</span>`; CSS `.projects-row-stats .gh-token { color: var(--accent); }` |
| 8 | Strip wraps via CSS flex-wrap at narrow widths — no JS truncation | VERIFIED | `app/globals.css` line 1084-1088: `.projects-row-stats { display: flex; flex-wrap: wrap; gap: 4px; line-height: 1.5; }`. No JS truncation logic in `project-row.tsx` |
| 9 | Mobile readability at 480px — no horizontal scroll | UNCERTAIN | CSS `flex-wrap` is defined; no explicit 480px media query override removes it. Behavior needs human visual confirmation at 480px viewport |
| 10 | Tech highlights panel: full language breakdown (top 5 + other), duration, last-active, commit count, View on GitHub CTA | VERIFIED | `project-row.tsx` lines 91-105: `<h3>Tech highlights</h3>`, breakdown list with `{b.name} {b.pct}%`, `otherPct > 0` guard, `durationLine`, `lastActive`, `.projects-commit-stat` span, `<ExternalLink href={repoUrl}>View on GitHub →</ExternalLink>` |
| 11 | Panel omits cleanly when stats unavailable | VERIFIED | `buildPanelModel(null)` returns null (line 180 `lib/project-stats.ts`); `{panel && (...)}` gates entire Tech highlights block; panel `<div>` container still renders (D-03) |
| 12 | New CSS lives inside existing .projects-* block — no new top-level section, no new tokens | VERIFIED | `app/globals.css` line 1064-1139: new selectors appended inside existing block, before `/* Phase 3 — stack-view */` at line 1141. `grep -c "stack-view" globals.css` = 1 (unchanged). 56 custom property definitions (unchanged per SUMMARY) |
| 13 | lib/project-stats.ts: pure module with zero node:/github imports | VERIFIED | `grep -E "from \"(node:|.*github)" lib/project-stats.ts` returns no output. Only import: `import type { GitHubRepoStats } from "./types"` |
| 14 | project-row.tsx: zero lib/github.ts or node: imports | VERIFIED | `grep -n "from.*node:\|from.*@/lib/github\|from.*lib/github" project-row.tsx` returns no output |
| 15 | RSC page resolves stats via Promise.all, never sequential await loop | VERIFIED | `app/(terminal)/projects/page.tsx` line 24: `await Promise.all(projects.map(...))`. `grep -c "for.*await\|for await" page.tsx` = 0 |
| 16 | WCAG 2.1 AA contrast passes for strip + panel under all 4 hues x 2 themes | VERIFIED | `tests/contrast.spec.ts` extends the 56-cell matrix with panel-visible path (lines 63-68): clicks `.projects-row-trigger` and asserts `.projects-tech-panel` is visible before `AxeBuilder.analyze()`. SUMMARY reports 56/56 cells green in 40.6s. Commit `35ef1b3` verified in git log |
| 17 | All Vitest tests pass: 255/255 including 33 project-stats + 6 ProjectRow tests | VERIFIED | `npm test` output: `Test Files 33 passed (33)`, `Tests 255 passed (255)` |
| 18 | buildStripModel/buildPanelModel return null for null stats | VERIFIED | `lib/project-stats.ts` line 157: `if (!stats) return null;` in `buildStripModel`; line 180: `if (!stats) return null;` in `buildPanelModel`. Both verified by 33 unit tests |

**Score:** 17/18 truths verified (1 UNCERTAIN pending human visual check at 480px)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/project-stats.ts` | Pure formatter module: topLanguages, formatDuration, relativeTime, monthYear, buildStripModel, buildPanelModel + StripModel/PanelModel types + LANG_ABBREV | VERIFIED | 195 lines; exports all required symbols; single import `type { GitHubRepoStats } from "./types"` |
| `lib/project-stats.test.ts` | 33 unit tests covering all pure helper branches with injected now | VERIFIED | 300 lines; 6 describe blocks (one per export); all dates injected as literal `new Date(...)`; 33/33 green |
| `app/components/project-row.tsx` | Thin "use client" disclosure island — expand toggle state, trigger button, strip, panel | VERIFIED | 121 lines; `"use client"` on line 1; named export `ProjectRow`; `useState` + `useId`; button with aria-expanded/controls/label; strip gated by `{strip && ...}`; panel gated by `hidden={!open}` + `{panel && ...}` |
| `app/components/project-row.test.tsx` | 6 branch tests: strip present/null, all-languages, panel expand, panel present/null | VERIFIED | 116 lines; 3 describe blocks; 6 tests covering all acceptance criteria branches; 6/6 green |
| `app/components/views/projects-view.tsx` | RSC view mapping enriched rows to ProjectRow islands | VERIFIED | Accepts `rows: { project; strip; panel }[]`; no "use client"; empty-state guard; year-desc sort; renders `<ProjectRow>` per row with `repoUrl={project.repoUrls?.[0] ?? null}` |
| `app/(terminal)/projects/page.tsx` | RSC page resolving getRepoStats per project in parallel | VERIFIED | `Promise.all` over `.map(getRepoStats)`; `buildStripModel` + `buildPanelModel` calls; passes enriched rows to `<ProjectsView>` |
| `app/globals.css` | Projects strip + panel CSS selectors inside existing .projects-* block | VERIFIED | Lines 1068-1139: `.projects-row-trigger`, `.projects-row-stats`, `.gh-token`, `.projects-tech-panel`, `.projects-commit-stat`, `.projects-panel-cta-row` etc. No new top-level section divider |
| `tests/contrast.spec.ts` | 56-cell axe matrix with panel-visible path for /projects | VERIFIED | Lines 63-68: route-gated `page.locator(".projects-row-trigger").first().click()` + `toBeVisible()` canary before `analyze()` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `app/(terminal)/projects/page.tsx` | `lib/github.ts` | `getRepoStats` in Promise.all | WIRED | Line 5: `import { getRepoStats } from "@/lib/github"`, line 26: `getRepoStats(p.repoUrls)` |
| `app/(terminal)/projects/page.tsx` | `lib/project-stats.ts` | `buildStripModel` / `buildPanelModel` | WIRED | Line 6: imports both; lines 32-33: called per project with stats |
| `app/components/views/projects-view.tsx` | `app/components/project-row.tsx` | `<ProjectRow` per row | WIRED | Line 10: `import { ProjectRow }`, line 42: `<ProjectRow key={project.name} ...>` with all props including `strip` and `panel` |
| `lib/project-stats.ts` | `lib/types.ts` | `import type { GitHubRepoStats }` | WIRED | Line 22: `import type { GitHubRepoStats } from "./types"` |
| `tests/contrast.spec.ts` | `app/components/project-row.tsx` | `page.click(".projects-row-trigger")` expands panel before axe | WIRED | Line 64: `await page.locator(".projects-row-trigger").first().click()` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `project-row.tsx` | `strip: StripModel \| null` | `buildStripModel(stats[i])` in `page.tsx`; stats from `getRepoStats(p.repoUrls)` | Yes — `getRepoStats` calls GitHub REST API; `buildStripModel` transforms to view-model | FLOWING |
| `project-row.tsx` | `panel: PanelModel \| null` | `buildPanelModel(stats[i])` in `page.tsx` | Yes — same data path as strip | FLOWING |
| `project-row.tsx` | `repoUrl` | `project.repoUrls?.[0] ?? null` from portfolio data | Yes — sourced from `lib/portfolio-data.ts` curated data | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| project-stats unit tests | `npx vitest run lib/project-stats.test.ts` | 33/33 green, 5ms | PASS |
| ProjectRow component tests | `npx vitest run app/components/project-row.test.tsx` | 6/6 green, 73ms | PASS |
| Projects page smoke tests | `npx vitest run "app/(terminal)/projects/page.test.tsx"` | 3/3 green (rate-limit logged but gracefully handled) | PASS |
| Full test suite | `npm test` | 255/255 green | PASS |
| TypeScript strict | `npx tsc --noEmit` | exit 0 (no output) | PASS |
| ESLint | `npm run lint` | exit 0 (no output) | PASS |
| Production build | `npm run build` | exit 0; INFRA-05 postbuild clean | PASS |
| No sequential await loop | `grep -c "for.*await\|for await" page.tsx` | 0 | PASS |
| No node:/github imports in project-stats | `grep -E "from \"(node:\|.*github)" lib/project-stats.ts` | no output | PASS |
| No node:/github imports in project-row | `grep -n "from.*node:\|from.*@/lib/github" project-row.tsx` | no output | PASS |
| No new CSS top-level section | `grep -c "stack-view" app/globals.css` | 1 (unchanged) | PASS |

---

### Probe Execution

Step 7c: SKIPPED — no conventional `scripts/*/tests/probe-*.sh` probes declared for Phase 10. Behavioral spot-checks above cover equivalent verification.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| LIST-01 | 10-02 | Compact one-line stat strip on /projects | SATISFIED | `project-row.tsx` strip div rendered when `strip` is non-null |
| LIST-02 | 10-01, 10-02 | Strip format: `<commits> commits · <langs> · <duration>` | SATISFIED | `project-row.tsx` lines 74-78; `buildStripModel` provides commitCount/languages/duration |
| LIST-03 | 10-01 | Top 1-3 languages by byte count with abbreviations | SATISFIED | `topLanguages(stats.languages, 3)` + `LANG_ABBREV` map in `lib/project-stats.ts` |
| LIST-04 | 10-01 | Duration from created_at to today: Nmo / Ny Nmo | SATISFIED | `formatDuration` in `lib/project-stats.ts` — verified by 5 unit tests |
| LIST-05 | 10-02 | Strip prefixed with gh: text token | SATISFIED | `<span className="gh-token">gh:</span>` in `project-row.tsx` line 73 |
| LIST-06 | 10-02 | Mobile 480px: strip wraps gracefully, no horizontal scroll | SATISFIED (needs human visual confirmation) | `flex-wrap: wrap` on `.projects-row-stats`; D-12 supersedes truncation wording |
| LIST-07 | 10-01, 10-02 | Cards with empty repoUrls or null stats render unchanged | SATISFIED | `buildStripModel(null)` returns null; `{strip && ...}` gates strip rendering |
| LIST-08 | 10-02 | Strip integrates with existing .projects-row CSS — no new top-level section | SATISFIED | New selectors appended inside existing block, `stack-view` count unchanged |
| LIST-09 | 10-02 | Vitest covers strip rendering, null stats, layout/wrap contract | SATISFIED | 6 ProjectRow tests + 33 project-stats tests covering all branches; D-13 retargets truncation to layout/wrap |
| DETAIL-01 | 10-02 | "Tech highlights" panel on each project's detail (inline accordion) | SATISFIED | `<div id={panelId} hidden={!open}>` with Tech highlights content in `project-row.tsx` |
| DETAIL-02 | 10-01, 10-02 | Full language byte-breakdown with percentages (top 5 + other) | SATISFIED | `buildPanelModel` returns `breakdown` (top 5, full names, rounded pct) + `otherPct`; rendered in panel |
| DETAIL-03 | 10-01, 10-02 | Dev duration: "In development since Jan 2026 — 4mo" | SATISFIED | `buildPanelModel` sets `durationLine`; rendered in `project-row.tsx` line 100 |
| DETAIL-04 | 10-01, 10-02 | Relative last-active: "Last active 3 days ago" | SATISFIED | `buildPanelModel` sets `lastActive` via `relativeTime`; rendered in `project-row.tsx` line 101 |
| DETAIL-05 | 10-02 | Commit count as prominent stat | SATISFIED | `.projects-commit-stat` span (15px/600/`--accent`) in `project-row.tsx` line 102-104 |
| DETAIL-06 | 10-02 | "View on GitHub →" CTA with target=_blank rel=noopener noreferrer | SATISFIED | `<ExternalLink href={repoUrl} showGlyph={false}>View on GitHub →</ExternalLink>`; ExternalLink primitive bakes in `target="_blank" rel="noopener noreferrer"` |
| DETAIL-07 | 10-01, 10-02 | Projects with no stats omit panel cleanly | SATISFIED | `buildPanelModel(null)` returns null; `{panel && ...}` gates Tech highlights block; panel container still renders minimal panel (D-03) |
| DETAIL-08 | 10-03 | WCAG 2.1 AA contrast under all 4 hues × 2 themes | SATISFIED | `tests/contrast.spec.ts` extended with panel-visible path; 56/56 cells green per SUMMARY; commit `35ef1b3` verified in git log |
| DETAIL-09 | 10-02 | Vitest covers panel rendering branches (present and null) | SATISFIED | `project-row.test.tsx` "with panel present" and "with panel null" branches; 6/6 green |

All 18 Phase 10 requirements (LIST-01 through LIST-09, DETAIL-01 through DETAIL-09) are SATISFIED. DEPLOY-V11-01 through DEPLOY-V11-05 are correctly mapped to Phase 11 (not Phase 10).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No debt markers (TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER) found in any of the 5 phase-modified files |

No anti-patterns found in `lib/project-stats.ts`, `lib/project-stats.test.ts`, `app/components/project-row.tsx`, `app/components/project-row.test.tsx`, `app/components/views/projects-view.tsx`, `app/(terminal)/projects/page.tsx`, `app/globals.css`, or `tests/contrast.spec.ts`.

---

### Human Verification Required

#### 1. Mobile strip wrap at 480px viewport

**Test:** Open `/projects` in a browser, resize to 480px width (or use DevTools device simulation). Inspect a project card that has GitHub stats (stat strip visible).

**Expected:** The `gh:` strip wraps to a second line with no horizontal scroll. All 1-3 language labels are visible. The card does not overflow its container horizontally.

**Why human:** CSS `flex-wrap: wrap` is defined on `.projects-row-stats` (verified). The effect at 480px viewport cannot be programmatically confirmed without a headless browser run at that viewport size. The Playwright contrast tests run at default viewport (1280px), not 480px.

---

### Deferred Items

No deferred items. All 18 Phase 10 requirements are implemented in this phase. DEPLOY-V11-01 through V11-05 are correctly scoped to Phase 11.

---

### Gaps Summary

No blocking gaps. The one UNCERTAIN item (LIST-06 mobile visual behavior at 480px) is a human visual confirmation of CSS `flex-wrap` behavior. The underlying CSS rule (`flex-wrap: wrap` on `.projects-row-stats`) is present and verified. The only outstanding check is a browser-visual confirmation.

**Architectural note on ROADMAP SC2 wording ("detail page"):** The ROADMAP describes "each project's detail page" — D-01 (documented in `10-CONTEXT.md` before planning) changed this from a separate `/projects/[slug]` route to an inline accordion expansion. The 10-02-PLAN.md `must_haves` explicitly lists "D-01: the Tech highlights panel is delivered as an inline accordion-style expand — no new /projects/[slug] route is created" as a must-have truth. No `/projects/[slug]` route directory exists in the codebase. This is an accepted architectural deviation pre-dating plan execution; the inline panel fully satisfies the DETAIL-* requirements.

---

_Verified: 2026-05-22T00:30:00Z_
_Verifier: Claude (gsd-verifier)_
