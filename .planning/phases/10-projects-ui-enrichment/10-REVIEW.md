---
phase: 10-projects-ui-enrichment
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - app/(terminal)/projects/page.tsx
  - app/components/project-row.test.tsx
  - app/components/project-row.tsx
  - app/components/views/projects-view.tsx
  - app/globals.css
  - lib/project-stats.test.ts
  - lib/project-stats.ts
  - tests/contrast.spec.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-05-21T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 10 adds the `/projects` stat strip and expandable "Tech highlights"
panel: a pure `lib/project-stats.ts` formatter module, a `ProjectRow` client
disclosure island, the `ProjectsView` RSC body, supporting CSS, and tests
(unit + component + a Playwright contrast cell extension).

The client/server boundary discipline is sound — `project-stats.ts` is genuinely
pure and `ProjectRow` correctly avoids importing `lib/github.ts`. Test coverage
is thorough for the happy paths. No security vulnerabilities were found.

However, several date/number-handling paths are not defended against malformed
or non-numeric input. None are exploitable, but they produce visibly broken UI
(`"undefined 2026"`, unstable sort order) rather than failing gracefully — and
the disk-cache fallback in `lib/github.ts` can supply exactly such malformed
data without re-validation. These are correctness defects worth fixing before
ship.

## Warnings

### WR-01: `monthYear` renders `"undefined"` for an unparseable ISO date

**File:** `lib/project-stats.ts:141-144`
**Issue:** `monthYear` does `MONTH_NAMES[d.getUTCMonth()]`. If `iso` is not a
valid date string, `new Date(iso)` is an Invalid Date and `getUTCMonth()`
returns `NaN`; `MONTH_NAMES[NaN]` is `undefined`, and `getUTCFullYear()` returns
`NaN`. The result is `"undefined NaN"`, which flows verbatim into
`buildPanelModel`'s `durationLine` (`"In development since undefined NaN — ..."`).
This is not purely theoretical: `getRepoStats` returns disk-cached `RepoStat`
objects (`lib/github.ts:120-129`, `169`, `189`, `204`) parsed straight from JSON
with no schema validation, so a stale or corrupted `github-stats.json` can carry
a malformed `createdAt`/`pushedAt` into this module. `formatDuration` already
guards its negative/sub-month case but not the NaN case (`months` would be
`NaN`, `NaN < 1` is `false`, so it falls through and prints `"NaNmo"` or
`"NaNy NaNmo"`).
**Fix:** Guard for an invalid date in the date helpers and degrade to a stable
placeholder, e.g.:
```ts
export function monthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "unknown";
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
```
Apply the same `Number.isNaN(d.getTime())` guard at the top of `formatDuration`
and `relativeTime` (returning `"0mo"` / `"unknown"` respectively).

### WR-02: `ProjectsView` sort comparator returns `NaN` for non-numeric `year`

**File:** `app/components/views/projects-view.tsx:31-33`
**Issue:** `(a, b) => Number(b.project.year) - Number(a.project.year)`. `Project.year`
is typed as `string` (`lib/types.ts`) and the type comment only says "Year string
(e.g. "2024")" — there is no guarantee the backend or fallback data always
supplies a clean 4-digit numeric string. If any `year` is empty, `"TBD"`, or
otherwise non-numeric, `Number(...)` yields `NaN` and the comparator returns
`NaN`. A comparator that returns `NaN` produces implementation-defined,
effectively unsorted output for the affected rows — the "sorted by year desc"
subhead would then be a lie. The unit/component tests never exercise a
non-numeric year so this is uncaught.
**Fix:** Coerce defensively and treat unparseable years as lowest priority:
```ts
const yearNum = (y: string) => {
  const n = Number.parseInt(y, 10);
  return Number.isNaN(n) ? -Infinity : n;
};
const sorted = [...rows].sort(
  (a, b) => yearNum(b.project.year) - yearNum(a.project.year)
);
```

### WR-03: "Tech highlights" panel renders an empty shell when stats exist but have no surviving languages

**File:** `lib/project-stats.ts:176-194`, `app/components/project-row.tsx:88-106`
**Issue:** `buildPanelModel` returns a non-null `PanelModel` whenever `stats` is
non-null. If `stats.languages` is `{}` (a real GitHub case — a repo with no
detected languages, or one where every language fell below the 1% floor),
`topLanguages` returns `[]`, so `breakdown` is `[]` and `otherPct` is `0`.
`ProjectRow` then renders the `<h3>Tech highlights</h3>` heading and an empty
`<ul>` with no `<li>` children and no "other" line — a heading labelling
nothing. The `commitCount` and duration lines still render, so the block is not
fully empty, but the "Tech highlights" heading over a blank list is a visible
quality defect.
**Fix:** Either omit the heading when `breakdown.length === 0 && otherPct === 0`,
or render an explicit fallback line (e.g. "Language data unavailable"). Decide
at the component level in `project-row.tsx`:
```tsx
{panel.breakdown.length > 0 && (
  <>
    <h3 className="projects-panel-heading">Tech highlights</h3>
    <ul className="projects-panel-breakdown">{/* ... */}</ul>
  </>
)}
```

### WR-04: `combineStats` `pushedAt` cast can produce `undefined` reaching `relativeTime`

**File:** `lib/github.ts:213-225` (consumed by `lib/project-stats.ts:192`)
**Issue:** Out of the explicit review scope but directly upstream of the Phase 10
formatter. `combineStats` does `stats.map((s) => s.pushedAt).sort().at(-1) as string`.
The `as string` cast suppresses the fact that `.at(-1)` is `string | undefined`.
`combineStats` is only called when `stats.length > 0` (`getRepoStats:258`) so in
practice it is defined — but the `as` assertion means a future refactor that
weakens that invariant would silently pass `undefined` into
`relativeTime(new Date(undefined))` → Invalid Date → `"NaN ... ago"` (see WR-01).
**Fix:** Replace the cast with a real fallback, e.g.
`pushedAt: stats.map((s) => s.pushedAt).sort().at(-1) ?? stats[0].pushedAt`,
so the type is honestly `string` without an assertion.

## Info

### IN-01: `relativeTime` 30-day month approximation drifts near year boundaries

**File:** `lib/project-stats.ts:124-135`
**Issue:** `months = Math.floor(days / 30)` over-counts months — 360 days maps to
`12 months` and 365 days to `12` as well, but a true 11.9-month gap (say 357
days) yields `11 months` while the calendar would call it ~11.7 months. The
"N months ago" / "N year ago" label can be off by a month near boundaries. This
is documented approximate behavior, not a bug, but worth noting if precision
matters for the recruiter-facing "last active" line.
**Fix:** Optional. Acceptable as-is for a relative-time label; if tighter
accuracy is wanted, compute months via UTC year/month arithmetic as
`formatDuration` does.

### IN-02: `ProjectRow` keys `tech` chips by value — duplicate tech names will collide

**File:** `app/components/project-row.tsx:67-69`
**Issue:** `tech.map((t) => <TechChip key={t}>{t}</TechChip>)`. If a project's
`tech` array contains a duplicate string (data-entry mistake), React emits a
duplicate-key warning and may mis-reconcile. Low risk since `tech` is curated
data, but a defensive `key={\`${t}-${i}\`}` removes the failure mode entirely.
**Fix:** `tech.map((t, i) => <TechChip key={`${t}-${i}`}>{t}</TechChip>)`.

### IN-03: `ProjectsView` keys rows by `project.name` — non-unique names break reconciliation

**File:** `app/components/views/projects-view.tsx:43`
**Issue:** `key={project.name}`. Two projects sharing a name would produce
duplicate keys. Unlikely with curated data, but `name` is not a guaranteed
unique identifier. If `Project` ever gains a stable id/slug, prefer it; until
then a composite `key={\`${project.name}-${project.year}\`}` is safer.
**Fix:** Use a composite key, or add a stable id to the `Project` type.

---

_Reviewed: 2026-05-21T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
