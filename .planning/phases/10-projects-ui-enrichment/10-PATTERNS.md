# Phase 10: Projects UI Enrichment - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 7 (3 new, 4 modified)
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Status | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `lib/project-stats.ts` | NEW | utility (pure formatters) | transform | `lib/experience-duration.ts` | exact |
| `lib/project-stats.test.ts` | NEW | test (unit) | transform | `lib/experience-duration.test.ts` | exact |
| `app/components/project-row.tsx` | NEW | component (client island) | event-driven (disclosure toggle) | `app/components/shell/live-clock.tsx` | role-match |
| `app/components/project-row.test.tsx` | NEW | test (component) | event-driven | `app/(terminal)/projects/page.test.tsx` | role-match (only RTL analog) |
| `app/components/views/projects-view.tsx` | MODIFIED | component (RSC view) | request-response | itself (current version) | exact (self) |
| `app/(terminal)/projects/page.tsx` | MODIFIED | route (RSC page) | request-response + parallel fetch | itself + `lib/github.ts` consumer | exact (self) |
| `app/globals.css` (`.projects-*` block) | MODIFIED | config (stylesheet) | n/a | existing `.projects-*` block lines 994-1062 | exact (self) |
| `tests/contrast.spec.ts` | MODIFIED | test (e2e axe) | request-response | itself (current matrix) | exact (self) |

## Pattern Assignments

### `lib/project-stats.ts` (utility, transform)

**Analog:** `lib/experience-duration.ts` — the established pure-formatter module pattern: a leading JSDoc block documenting accepted shapes, return contract, and the deterministic `now?: Date` injection seam, followed by small named pure functions with zero I/O and zero React/`node:` imports.

**Module docblock + pure-function pattern** (`lib/experience-duration.ts` lines 1-22, 56-98):
```typescript
/**
 * Parse a period string into a "Ny Nmo" duration label.
 * ...
 * Pure function: takes optional `now` for deterministic testing.
 * Used by app/components/views/experience-view.tsx (spec §3).
 */
export function computeDurationLabel(period: string, now?: Date): string | null {
  if (!period || typeof period !== "string") return null;
  // ...
  const reference = now ?? new Date();
  // ...
  if (years === 0 && months === 0) return null;
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}
```

**Copy from this analog:**
- The `now?: Date` (or `now = new Date()`) injection parameter on every date-dependent export — `formatDuration`, `relativeTime`, `monthYear`, `buildStripModel`, `buildPanelModel`. This is what makes the helpers deterministically testable (see `experience-duration.test.ts` injecting `new Date("2025-06-15")`).
- The `${years}y ${months}mo` / `${months}mo` formatting branch structure — Phase 10's `formatDuration` produces the same `4mo` / `1y 2mo` shapes (LIST-04). The RESEARCH.md `formatDuration` example already mirrors this.
- The `// Used by app/components/...` trailer comment naming the consumer.

**Type import convention** — pull `GitHubRepoStats` from `./types` only (relative import, no path alias inside `lib/`, matching `lib/github.ts` line 12 `import type { GitHubRepoStats } from "./types";`). Do NOT import `lib/github.ts` (it pulls `node:fs/promises` — see Anti-Patterns).

**Note — UTC vs local:** `experience-duration.ts` deliberately uses `getUTCFullYear()`/`getUTCMonth()` (lines 73-76) so an ISO-string `now` resolves deterministically regardless of runtime timezone. `project-stats.ts` consumes ISO 8601 timestamps from `GitHubRepoStats` (`createdAt`, `pushedAt`); apply the same UTC discipline in `formatDuration` / `monthYear` / `relativeTime` to keep tests timezone-stable.

---

### `lib/project-stats.test.ts` (test, unit)

**Analog:** `lib/experience-duration.test.ts` — co-located `*.test.ts` next to the module under test, exhaustive branch coverage with injected `now`.

**Test file structure** (`lib/experience-duration.test.ts` lines 1-13):
```typescript
import { describe, test, expect } from "vitest";
import { computeDurationLabel } from "./experience-duration";

describe("computeDurationLabel", () => {
  test("year-only range with present uses today via injected now", () => {
    expect(computeDurationLabel("2023 - present", new Date("2025-06-15"))).toBe("2y 5mo");
  });
  // ... boundary cases: 11-month boundary, exact-year boundary, garbage input → null
```

**Copy from this analog:**
- Explicit `import { describe, test, expect } from "vitest"` (project does not rely on `globals: true` for `lib/` tests even though vitest config provides it — match the analog).
- One `describe` per exported function; one `test` per branch.
- Inject a fixed `new Date(...)` for every time-dependent assertion — never call the real clock.
- Cover the boundary cases explicitly: <1% language floor drop (D-08/D-09), sub-month duration guard, `relativeTime` day/month/year boundaries, `topLanguages` with `total === 0`, `buildStripModel`/`buildPanelModel` returning `null` on `null` input (LIST-07/DETAIL-07).

---

### `app/components/project-row.tsx` (component, client island — disclosure)

**Analog:** `app/components/shell/live-clock.tsx` — the canonical thin `"use client"` island in this codebase: `"use client"` on line 1, a single React hook, minimal markup, no data-module imports.

**Thin client island shape** (`app/components/shell/live-clock.tsx` lines 1-25):
```typescript
"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);
  // ... hook ...
  return (
    <span className="live-clock" aria-hidden="true">
      {time ?? "--:--"}
    </span>
  );
}
```

**Copy from this analog:**
- `"use client"` directive on line 1, then the React import (`import { useId, useState } from "react"` for the disclosure island).
- Keep the island minimal — `useState(false)` for `expanded` only. No Context, no Zustand (D-04 mandates independent per-row toggles; CLAUDE.md "derive, never mirror").
- Named export (`export function ProjectRow`), not default.

**Disclosure markup contract** — synthesize from RESEARCH.md Pattern 2 + UI-SPEC Interaction Contract:
```typescript
// strip + panel arrive as already-built server-rendered React nodes (props/children).
// The island NEVER imports lib/github.ts or lib/project-stats.ts data builders.
<button
  type="button"
  className="projects-row-trigger"
  aria-expanded={open}
  aria-controls={panelId}            // panelId from useId()
  aria-label={`${name}: ${summary}`} // preserve plain-noun recruiter-legible label
  onClick={() => setOpen((v) => !v)}
>
  {/* row body: index glyph [+]/[-], name, summary, chips, strip */}
</button>
<div id={panelId} hidden={!open}>{panel}</div>
```

**Header-comment convention** — `projects-view.tsx` opens with a comment manifest of the CSS classes it uses (lines 1-5). Mirror that: list new `.projects-row-trigger` / `.projects-row-stats` / `.projects-tech-panel` classes in a top comment.

**aria-label primitive precedent** — the current row passes `aria-label` through `ExternalLink` (`projects-view.tsx` line 38: `aria-label={`${p.name}: ${p.summary} (opens in new tab)`}`). The new `<button>` keeps the `${name}: ${summary}` shape but drops `(opens in new tab)` since the trigger no longer navigates.

**Anti-pattern (binding):** Never import `lib/github.ts` into this file — it imports `node:fs/promises` (`lib/github.ts` lines 13-14) and would break the client build / leak `GITHUB_TOKEN`. The island receives plain serializable props (strip text, panel data) computed in the RSC layer.

---

### `app/components/project-row.test.tsx` (test, component)

**Analog:** `app/(terminal)/projects/page.test.tsx` — the only existing React Testing Library test in the codebase. Note: relies on vitest `globals` (uses `vi`, `describe`, `test` without import) and jsdom env from `vitest.config.ts`.

**RTL test structure** (`app/(terminal)/projects/page.test.tsx` lines 1-15):
```typescript
import { render, screen } from "@testing-library/react";
import ProjectsPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "projects"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects"
}));

describe("ProjectsPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await ProjectsPage();
    render(ui);
    expect(screen.getByText("ls -la projects/")).toBeInTheDocument();
  });
});
```

**Copy from this analog:**
- `import { render, screen } from "@testing-library/react"` (and add `fireEvent`/`userEvent` for the click-to-expand assertion — not used by the analog but required for the toggle branch).
- Rely on vitest globals (`describe`/`test`/`expect`/`vi`) — no explicit vitest import, matching this analog (note this differs from the `lib/` test convention above; component tests follow the page-test analog).
- `vi.mock("next/navigation", ...)` only if a child transitively touches navigation — `ProjectRow` itself does not, so this mock is likely unnecessary for the island test.

**Branch coverage required** (from RESEARCH Test Map): strip renders with `gh:` token when strip prop present (LIST-01/05); no strip when strip prop is `null` (LIST-07); panel hidden initially, revealed after click, `aria-expanded` flips (DETAIL-01); panel omits Tech-highlights block but still renders minimal panel + CTA when panel prop is `null` (DETAIL-07/D-03); strip renders all selected languages and container is wrap-enabled (LIST-06/09 retargeted per D-13 — assert layout contract, NOT truncation).

---

### `app/components/views/projects-view.tsx` (component, RSC view — MODIFIED)

**Analog:** itself (current version, lines 1-63). The modification preserves the RSC-body pattern and delegates interactivity to the new child island.

**Current RSC-view pattern to preserve** (lines 1-13):
```typescript
// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.projects-subhead, .projects-list, .projects-row, ...) defined
//   in app/globals.css.
import type { Project } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";
import { TechChip } from "@/app/components/primitives/tech-chip";
```

**Copy / preserve from current file:**
- The `// NO "use client"` header comment + CSS-class manifest comment — keep it, append the new classes. The view body STAYS an RSC; only the per-row `ProjectRow` child carries `"use client"` (UI-SPEC Component Inventory).
- The `@/lib/...` and `@/app/components/...` path-alias import style.
- The empty-state early return (lines 16-22): `total 0 · (no projects committed yet)` — unchanged (UI-SPEC copy contract).
- The `[...projects].sort((a, b) => Number(b.year) - Number(a.year))` year-desc sort (line 24) — preserve; the strip/panel props must travel alongside their project through the sort.
- The `<ul className="projects-list"> / <li key={p.name}>` list scaffold (lines 31-33).

**Change:** replace the `<ExternalLink className="projects-row">` row (lines 34-57) with `<ProjectRow ...>`. `TechChip` rendering of `p.tech` (lines 47-49) moves inside `ProjectRow` (passed as children/chips prop) — `TechChip` itself is reused unchanged. The right-meta column (year/status/role, lines 52-56) is preserved verbatim inside the new row markup.

---

### `app/(terminal)/projects/page.tsx` (route, RSC page — MODIFIED)

**Analog:** itself (current version, lines 1-24) for the RSC-page scaffold; `lib/github.ts` `getRepoStats()` (lines 233-260) for the data surface being consumed.

**Current RSC-page scaffold to preserve** (lines 1-24):
```typescript
// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { ProjectsView } from "@/app/components/views/projects-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView projects={projects} />
    </>
  );
}
```

**Copy / preserve from current file:**
- The `// NO "use client"` header, the `metadata` export, `const route = ROUTES[1]` route-source-of-truth pattern (CLAUDE.md `lib/routes.ts` rule).
- `async function ProjectsPage()` + `await getProjects()` from `lib/api.ts`.
- The `<PromptLine cmd="ls -la projects/" />` line — unchanged (`page.test.tsx` asserts this exact string).

**Parallel-fetch pattern to ADD** — mirror `lib/github.ts`'s own internal `Promise.all` / `Promise.allSettled` discipline (`lib/github.ts` lines 160-164, 248-256) at the page level:
```typescript
// after: const projects = await getProjects();
const stats = await Promise.all(
  projects.map((p) =>
    p.repoUrls?.length ? getRepoStats(p.repoUrls) : Promise.resolve(null)
  )
);
// compute strip/panel view-models with pure helpers from lib/project-stats.ts
```

**Binding constraints from the analog (`lib/github.ts`):**
- `getRepoStats(repoUrls: string[]): Promise<GitHubRepoStats | null>` — never throws, returns `null` on total failure or empty `repoUrls` (lines 233-237, 258). Page code does not need try/catch around it.
- `getRepoStats` is server-only (`lib/github.ts` docblock lines 1-11) — calling it in this RSC page is the correct and only valid tier.
- Use `Promise.all` (not a `for...await` loop) so one slow repo never serializes the page (RESEARCH Pitfall 1).
- The `View on GitHub →` CTA href = `project.repoUrls[0]` (original string) — `GitHubRepoStats` carries NO URL (`lib/types.ts` lines 88-98); pass `repoUrls[0]` straight through (RESEARCH Pitfall 5).

---

### `app/globals.css` — `.projects-*` block (config — MODIFIED)

**Analog:** the existing `.projects-*` block, `app/globals.css` lines 994-1062, plus the responsive block at lines 1785-1800.

**Existing tokens to reuse** (lines 994-1062):
```css
.projects-row {
  display: grid;
  grid-template-columns: 32px 1fr 110px;   /* D-10: untouched */
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.projects-row-index   { font-size: 12px; color: var(--muted); }   /* strip reuses 12px/--muted tier */
.projects-row-name    { font-size: 15px; font-weight: 600; color: var(--accent); }
.projects-row-summary { font-size: 13px; color: var(--text); line-height: 1.5; margin-top: 4px; }
.projects-row-chips   { margin-top: 8px; }   /* strip sits directly below, reuse 8px margin */
```

**Copy / extend (binding — LIST-08 / D-10):**
- APPEND new selectors (`.projects-row-trigger`, `.projects-row-stats`, `.gh-token`, `.projects-tech-panel`, etc.) inside this same block — do NOT create a new top-level CSS section (the file uses `/* ─── Phase N — ... ─── */` section dividers; do not add one).
- Strip = `font-size: 12px; color: var(--muted)` — match `.projects-row-index` (line 1021-1024). `margin-top: 8px` — match `.projects-row-chips` (line 1040).
- Strip container gets `display: flex; flex-wrap: wrap; gap: 4px` — pure-CSS wrap, no JS (D-12). RESEARCH.md Code Examples gives the exact `.projects-row-stats` rule.
- The 3-column grid `32px / 1fr / 110px` (line 1008) is untouched (D-10). The `[+]/[-]` glyph reuses the existing `32px` index column.
- `.gh-token` = `color: var(--accent)` (D-11 — themeable source marker).
- Print block (lines 1795-1800): if the panel needs print treatment, extend the existing `.projects-row` print rule rather than adding a new one.

**Available CSS variables** (from `:root` / `[data-theme="light"]`): `--bg`, `--panel`, `--accent`, `--accent-bg`, `--muted`, `--muted-hi`, `--border`, `--border-hi`, `--warn`, `--text`. No new tokens (UI-SPEC Color contract).

---

### `tests/contrast.spec.ts` (test, e2e axe — MODIFIED)

**Analog:** itself (current 56-cell matrix, lines 1-84).

**Current matrix structure** (lines 21-55):
```typescript
const HUES = [145, 75, 200, 340] as const;   // matrix, amber, cyan, magenta
const THEMES = ["dark", "light"] as const;
for (const theme of THEMES) {
  for (const hue of HUES) {
    for (const route of ROUTES) {
      test(`contrast: theme=${theme} accent=${hue} route=${route.pathname}`, async ({ page }) => {
        await page.addInitScript(/* seed localStorage before paint */);
        await page.goto(route.pathname);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2aa", "wcag21aa"]).analyze();
        // filter color-contrast violations, assert []
```

**Copy / extend (DETAIL-08):**
- Preserve the 4 hues × 2 themes × routes loop, the pre-paint localStorage seed, and the `data-theme` canary assertion (Pitfall 10) — all unchanged.
- The strip is server-rendered and visible on `/projects` → axe scans it automatically once Phase 10 ships. No structural change needed for the strip.
- The **panel** is `hidden` by default; axe skips `hidden`/`display:none` content (RESEARCH Pitfall 4). ADD a panel-visible path: before `analyze()` on the `/projects` route, `await page.locator(".projects-row-trigger").first().click()` to expand one row, OR add a companion spec. The coverage (panel selectors scanned across 4×2) is non-negotiable; the mechanism is the planner's call (RESEARCH Open Question 1).
- Known tight pair to verify explicitly: `--muted` at 12px on `--bg` under amber-on-light (`hue=75`, `theme=light`).

## Shared Patterns

### Pure-formatter module pattern
**Source:** `lib/experience-duration.ts` (whole file)
**Apply to:** `lib/project-stats.ts`
Leading JSDoc documenting shapes + return contract; small named pure exports; `now?: Date` injection seam on every date-dependent function; UTC date methods for timezone-stable output; zero I/O, zero React, zero `node:` imports; types from `./types`.

### Thin `"use client"` island pattern
**Source:** `app/components/shell/live-clock.tsx` (whole file)
**Apply to:** `app/components/project-row.tsx`
`"use client"` line 1; one React hook (`useState`); minimal markup; named export; no data-module imports; no Context/global store. The island receives already-computed serializable props from the RSC parent.

### RSC discipline — derive, never mirror; data fetched server-side
**Source:** `app/components/views/projects-view.tsx` header comment + `app/(terminal)/projects/page.tsx`
**Apply to:** `projects-view.tsx`, `projects/page.tsx`
View bodies and pages stay RSC (`// NO "use client"` header); only the leaf interactive island carries the directive. `getRepoStats()` runs in the page RSC; results flow down as plain props. CSS-class manifest comment at the top of each component file.

### Path-alias import convention
**Source:** `app/(terminal)/projects/page.tsx` lines 2-6, `projects-view.tsx` lines 7-9
**Apply to:** all `app/` files
`@/lib/...` and `@/app/components/...` aliases in `app/`; relative `./types` imports inside `lib/`.

### External-link safety primitive
**Source:** `app/components/primitives/external-link.tsx` (whole file)
**Apply to:** the panel's `View on GitHub →` and `Visit project →` CTAs
Reuse `ExternalLink` verbatim — `target="_blank" rel="noopener noreferrer"` baked in (SEO-05). Never hand-roll an `<a>`. Pass `showGlyph` per the design (the copy contract specifies a literal `→` so `showGlyph={false}` is likely correct). Both CTAs live inside the panel, never inside the trigger `<button>` (no nested interactive — RESEARCH Pitfall 3).

### Co-located test pattern
**Source:** `lib/experience-duration.test.ts` (unit) / `app/(terminal)/projects/page.test.tsx` (component)
**Apply to:** `lib/project-stats.test.ts`, `app/components/project-row.test.tsx`
`lib/` tests: explicit `import { describe, test, expect } from "vitest"`, inject fixed `now`. Component tests: `import { render, screen } from "@testing-library/react"`, rely on vitest globals (`vi`/`describe`/`test`). One `describe` per unit, one `test` per branch.

## No Analog Found

None. Every Phase 10 file has a strong analog in the codebase:
- Pure helpers → `lib/experience-duration.ts` (near-identical role, even the same `Ny Nmo` duration format).
- Client island → `lib/`... `app/components/shell/live-clock.tsx`.
- RSC view / page → the files themselves (modifications).
- Component test → `app/(terminal)/projects/page.test.tsx` (only RTL test in the repo, but a valid structural analog; the project has no prior co-located component test for a `components/` file, so `project-row.test.tsx` extends this pattern into a new location).

## Metadata

**Analog search scope:** `app/components/`, `app/components/views/`, `app/components/shell/`, `app/components/primitives/`, `app/(terminal)/projects/`, `lib/`, `tests/`, `app/globals.css`.
**Files scanned:** ~15 (projects-view, projects/page, projects/page.test, live-clock, external-link, tech-chip, experience-duration + its test, github.ts, types.ts, contrast.spec.ts, globals.css `.projects-*` + responsive blocks).
**Pattern extraction date:** 2026-05-21
</content>
</invoke>
