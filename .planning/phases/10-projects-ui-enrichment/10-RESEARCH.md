# Phase 10: Projects UI Enrichment - Research

**Researched:** 2026-05-21
**Domain:** Next.js 15 RSC data composition + thin client island (disclosure UI) + pure-CSS layout
**Confidence:** HIGH

## Summary

Phase 10 is a **pure frontend integration phase** with zero new dependencies, zero
backend changes, and one well-bounded architectural change: the `/projects` row
stops being an external `<a>` and becomes a disclosure (accordion) control backed
by a new thin client island. All data-layer work was completed in Phase 9 —
`lib/github.ts` already ships a verified, never-throwing `getRepoStats(repoUrls)`
returning `GitHubRepoStats | null`. This phase consumes that output and renders
two surfaces: a collapsed-row **stat strip** (LIST-01..09) and an expanded
**Tech highlights panel** (DETAIL-01..09).

The work is almost entirely about three things: (1) calling `getRepoStats()` once
per project in the RSC layer (`projects/page.tsx`) and threading the *computed*
result into the view, (2) writing pure functions that format `GitHubRepoStats`
into strip text and panel data (top-N language selection, duration math, relative
time), and (3) building one new `"use client"` island for the expand/collapse
toggle. The collapsed strip and the panel markup are server-rendered; only the
panel's *visibility* is client-controlled. No `lib/github.ts` import ever crosses
into the client island.

Risk is low and well-understood. The biggest pitfalls are (a) the RSC must `await`
N `getRepoStats()` calls in parallel without one slow repo serializing the page,
(b) the existing per-row `aria-label` and nested-anchor structure must be reworked
correctly when the row becomes a `<button>`, and (c) the contrast matrix
(`tests/contrast.spec.ts`) must be extended for the new selectors across 4 hues ×
2 themes. CONTEXT.md's D-12/D-13 already resolve the one requirement-wording
conflict (CSS `flex-wrap` instead of JS truncation).

**Primary recommendation:** Resolve all `getRepoStats()` calls in `projects/page.tsx`
with a single `Promise.all` over the projects array, compute strip + panel view-models
with pure helpers in a new `lib/project-stats.ts` (server-or-client-safe, no I/O),
pass plain serializable props to `ProjectsView`, and isolate the expand state in one
new `ProjectRow` client island. Test the pure helpers exhaustively and the components
at their rendering branches.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fetch GitHub stats per project | API/Backend (RSC server) | — | `getRepoStats()` is server-only; `GITHUB_TOKEN` is a server secret. Runs in `projects/page.tsx`. |
| Format strip text + panel view-model | API/Backend (RSC server) | Could run client-side, but kept server-side | Pure functions with no I/O; computed in RSC so the client island receives plain serializable props. Keeps the island tiny. |
| Render collapsed stat strip | Frontend Server (RSC) | — | Static markup; no interactivity. Server-rendered inside the row. |
| Render Tech highlights panel markup | Frontend Server (RSC) | — | Static markup; only its *visibility* is client-controlled. |
| Expand/collapse toggle state | Browser/Client | — | `aria-expanded` + panel show/hide is interactive state → one new `"use client"` island. |
| Mobile strip wrap | CDN/Static (CSS) | — | Pure CSS `flex-wrap` at the 960px (or new 480px) breakpoint. No JS. |

**Key tier note:** `getRepoStats()` MUST stay in the RSC layer. The client island
receives only the *already-computed* strip string and panel data object as props —
it never imports `lib/github.ts` (which would leak `GITHUB_TOKEN` into the client
bundle and break the build, since `node:fs` is server-only).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x (installed) | App Router, RSC, ISR | Already the project framework — no swap (CLAUDE.md) `[VERIFIED: package.json]` |
| react | 19.x (installed) | `useState` for the disclosure island | Already the project framework `[VERIFIED: package.json]` |
| typescript | strict (installed) | Type safety on view-models | Project convention `[VERIFIED: tsconfig]` |

**No new production dependencies.** Phase 10 ships entirely with installed tooling.
CLAUDE.md caps prod deps at three (`next-themes`, `cmdk`, `@vercel/analytics`) — all
already present, none needed here. `[CITED: CLAUDE.md]`

### Supporting (test only — all already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | installed | Unit + component tests (LIST-09, DETAIL-09) | All Phase 10 tests `[VERIFIED: vitest.config.ts]` |
| @testing-library/react | installed | Render `ProjectsView` / `ProjectRow` | Component branch tests `[VERIFIED: existing *.test.tsx]` |
| @axe-core/playwright | installed | Contrast matrix (DETAIL-08) | Extend `tests/contrast.spec.ts` `[VERIFIED: tests/contrast.spec.ts]` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<details>/<summary>` native disclosure | Custom `<button aria-expanded>` | Native `<details>` is appealing (zero JS) but: (a) animating open/close is awkward, (b) styling `<summary>` cross-browser is fiddly, (c) the row already has complex grid children. A `<button>` island with `aria-expanded`/`aria-controls` is the more controllable choice and matches the UI-SPEC's explicit contract. `[ASSUMED]` — planner may still pick `<details>` if it prefers zero-JS; both meet WCAG. |
| Per-card `<Suspense>` streaming | One `Promise.all` in the page RSC | Streaming would let fast cards paint before slow repos resolve, but adds Suspense-boundary complexity for ~4 projects. `Promise.all` is simpler and the daily ISR cache means cold-fetch latency is rare. CONTEXT.md leaves this to Claude's discretion. |

**Installation:** None.

**Version verification:** No packages to verify — zero new deps. Node v20.19.1
confirmed installed `[VERIFIED: node --version]`.

## Architecture Patterns

### System Architecture Diagram

```
                      daily ISR cache (revalidate: 86400)
                                   │
   GitHub REST API ◄───────────────┤
   (3 endpoints/repo)              │
                                   ▼
  projects/page.tsx (RSC) ─── getProjects() ──► Project[]
        │                                          │
        │   for each project with repoUrls:        │
        └── Promise.all([ getRepoStats(p.repoUrls) … ])  ──► (GitHubRepoStats | null)[]
                                   │
                                   ▼
              lib/project-stats.ts  (pure, no I/O)
                ├─ buildStripModel(stats)  ──► StripModel | null
                └─ buildPanelModel(stats)  ──► PanelModel | null
                                   │
                                   ▼   plain serializable props
                       <ProjectsView projects + stripModels + panelModels />
                                   │
                ┌──────────────────┴───────────────────┐
                ▼                                       ▼
   <ProjectRow> (CLIENT ISLAND)              server-rendered children:
   - owns useState(expanded)                  - stat strip markup (StripModel)
   - <button aria-expanded aria-controls>     - Tech highlights panel markup
   - shows/hides the panel                      (PanelModel) — passed as children
```

**Data flow trace (primary use case):** A recruiter loads `/projects` → the RSC page
fetches projects and, in parallel, GitHub stats for every project with `repoUrls` →
pure helpers convert raw stats into a strip string and a panel view-model →
`ProjectsView` renders each row with a server-rendered strip; the `ProjectRow` client
island wraps the row body in a `<button>` and conditionally reveals the
server-rendered panel on click.

### Recommended Project Structure
```
app/(terminal)/projects/
  page.tsx              # MODIFIED — also resolves getRepoStats() per project
app/components/views/
  projects-view.tsx     # MODIFIED — RSC; maps projects → ProjectRow islands
app/components/
  project-row.tsx       # NEW — "use client" disclosure island (expand toggle)
lib/
  project-stats.ts      # NEW — pure formatters: strip model + panel model + lang map
  project-stats.test.ts # NEW — exhaustive unit tests for the pure helpers
app/components/views/
  projects-view.test.tsx OR project-row.test.tsx  # NEW — component branch tests
app/globals.css         # MODIFIED — extend the .projects-* block (no new section)
tests/contrast.spec.ts  # MODIFIED — add new strip/panel selectors to the matrix
```

### Pattern 1: Resolve async data in the RSC, pass plain props to the island
**What:** All `getRepoStats()` calls (and all formatting) happen server-side in the
page RSC. The client island receives only JSON-serializable props.
**When to use:** Always, here — it is the one correct boundary.
**Example:**
```typescript
// Source: app/(terminal)/projects/page.tsx pattern + lib/api.ts ISR pattern
// projects/page.tsx (RSC — no "use client")
export default async function ProjectsPage() {
  const projects = await getProjects();
  // parallel — one slow repo never serializes the page
  const stats = await Promise.all(
    projects.map((p) =>
      p.repoUrls?.length ? getRepoStats(p.repoUrls) : Promise.resolve(null)
    )
  );
  const enriched = projects.map((p, i) => ({
    project: p,
    strip: buildStripModel(stats[i]),   // StripModel | null  — pure
    panel: buildPanelModel(stats[i]),   // PanelModel | null  — pure
  }));
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView rows={enriched} />
    </>
  );
}
```

### Pattern 2: Thin client island owns ONLY the toggle state
**What:** The `"use client"` boundary is as small as possible. The island holds
`useState` for `expanded`, renders the `<button>`, and conditionally shows the panel
which is passed in as `children` (server-rendered).
**When to use:** The expand/collapse row — the single architectural change this phase.
**Example:**
```typescript
// Source: app/components/live-clock.tsx (existing thin-island pattern)
"use client";
import { useId, useState } from "react";

export function ProjectRow({
  index, name, summary, chips, strip, panel,
}: ProjectRowProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li>
      <div className="projects-row">
        <span className="projects-row-index">{open ? "[-]" : "[+]"}</span>
        <button
          type="button"
          className="projects-row-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${name}: ${summary}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="projects-row-name">{name}</div>
          <div className="projects-row-summary">{summary}</div>
          <div className="projects-row-chips">{chips}</div>
          {strip /* server-rendered strip markup */}
        </button>
        <div className="projects-row-meta">{/* year/status/role */}</div>
      </div>
      <div id={panelId} hidden={!open}>
        {panel /* server-rendered Tech highlights panel */}
      </div>
    </li>
  );
}
```
*Note:* `panel` and `strip` are passed as already-built React nodes (children) from the
RSC parent — the island never builds them, never imports `lib/github.ts`.

### Pattern 3: Pure view-model helpers (`lib/project-stats.ts`)
**What:** All formatting logic — top-N language selection with the <1% floor,
abbreviation mapping, duration math, relative-time math, percentage breakdown — lives
in pure functions with no I/O, no React, no `node:` imports. Server-and-client-safe.
**Why:** Exhaustively unit-testable (LIST-09 / DETAIL-09), reusable by both strip and
panel, and keeps components declarative.
**Example:**
```typescript
// Source: derived from GitHubRepoStats shape in lib/types.ts
// lib/project-stats.ts — pure, no imports beyond ./types

const LANG_ABBREV: Record<string, string> = {
  TypeScript: "TS", JavaScript: "JS", Python: "Py",
  // D-06: derive membership from languages actually present across repoUrls.
  // Any language NOT in this map renders its full GitHub name verbatim.
};

/** Top-N languages by byte count, dropping any under 1% of total (D-08/D-09). */
export function topLanguages(
  languages: Record<string, number>,
  limit: number
): { name: string; bytes: number; pct: number }[] {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / total) * 100 }))
    .filter((l) => l.pct >= 1)            // <1% floor
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}

/** "4mo" under a year, "1y 2mo" above (LIST-04). createdAt → today. */
export function formatDuration(createdAtISO: string, now = new Date()): string {
  const start = new Date(createdAtISO);
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (months < 1) months = 0; // guard sub-month repos — show "0mo" or "<1mo"
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return years > 0 ? `${years}y ${rem}mo` : `${months}mo`;
}
```

### Anti-Patterns to Avoid
- **Importing `lib/github.ts` into `project-row.tsx`:** Leaks `GITHUB_TOKEN` and
  `node:fs` into the client bundle — breaks the build. The island gets *props*, never
  the data module.
- **Mirroring expand state into Context/Zustand:** D-04 mandates independent per-row
  toggles. Local `useState` per island is correct. No global store. `[CITED: CLAUDE.md — derive, never mirror]`
- **Sequential `await getRepoStats()` in a loop:** Serializes the page on the slowest
  repo. Use `Promise.all`.
- **Nested anchors:** The old row was an `<a>`. The new row is a `<button>` (trigger);
  all external links (`View on GitHub →`, `Visit project →`) live *inside the panel*.
  Never put an `<a>` inside the trigger `<button>` (invalid HTML). `[CITED: 10-CONTEXT.md D-02/D-05]`
- **New top-level CSS section:** LIST-08 + D-10 forbid it. Extend the existing
  `.projects-*` block in `app/globals.css` (lines ~990-1062). `[CITED: 10-UI-SPEC.md]`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GitHub data fetch | Any fetch/parse logic | `getRepoStats()` from `lib/github.ts` (Phase 9) | Already verified, ISR-cached, never-throws, disk-cache fallback. Re-deriving it is out of scope. |
| External link with `rel`/`target` | Hand-written `<a target=_blank>` | `ExternalLink` primitive | Already bakes in `target=_blank rel=noopener noreferrer` (SEO-05). Both panel CTAs reuse it. `[VERIFIED: external-link.tsx]` |
| Tech chip rendering | New chip markup | `TechChip` primitive | Strip sits directly below the existing chip row; chip rendering unchanged. `[VERIFIED: tech-chip.tsx]` |
| Mobile strip layout | JS width measurement / truncation | CSS `flex-wrap` | D-12: no JS measurement. Pure CSS wrap at the breakpoint. `[CITED: 10-CONTEXT.md D-12]` |
| Relative-time / duration | A date library (`date-fns`, `dayjs`) | ~15 lines of pure date math | Adding a date lib violates the no-new-prod-deps rule. The two formats needed (`4mo` / `1y 2mo`, `3 days ago`) are trivial arithmetic. |
| Reduced-motion handling | Per-component motion guards | Existing global `*` animation reset | Phase 5 already ships a `prefers-reduced-motion` universal reset. A no-animation instant toggle is acceptable. `[CITED: 10-UI-SPEC.md]` |

**Key insight:** Phase 10 is *consumption*, not *construction*. The data layer, the
link primitive, the chip primitive, the reduced-motion reset, and the contrast harness
all already exist. The only genuinely new code is one client island plus pure
formatter functions — everything else is composition.

## Common Pitfalls

### Pitfall 1: Serializing the page on one slow repo
**What goes wrong:** `await getRepoStats()` inside a `.map()` or `for` loop makes the
RSC wait for repo N before starting repo N+1.
**Why it happens:** Natural-looking `for...of` with `await` is sequential.
**How to avoid:** `Promise.all(projects.map(p => getRepoStats(p.repoUrls)))`. CONTEXT.md
explicitly flags "must not block on a single slow repo unnecessarily."
**Warning signs:** `/projects` cold load time scales linearly with project count.

### Pitfall 2: Client island accidentally pulls in `lib/github.ts`
**What goes wrong:** If `project-row.tsx` imports anything that transitively reaches
`lib/github.ts` (which imports `node:fs/promises`, `node:path`), the build fails or
the token leaks.
**Why it happens:** A shared type or helper file that also re-exports the data module.
**How to avoid:** Keep `lib/project-stats.ts` import-free of `node:` and `lib/github.ts`.
Types come from `lib/types.ts` (already pure). The island receives plain props.
**Warning signs:** `npm run build` errors about `node:fs` in a client component, or
First Load JS spikes.

### Pitfall 3: Nested-anchor / button-in-button invalid HTML
**What goes wrong:** Putting the `View on GitHub →` `<a>` inside the trigger `<button>`,
or leaving the row as an `<a>` while adding a `<button>` inside it.
**Why it happens:** The old row WAS an `<a>`; the rework is easy to do halfway.
**How to avoid:** D-02 — the row body becomes a `<button>` trigger; **all** links move
into the *panel*, which is a sibling of the trigger, not a descendant.
**Warning signs:** React hydration warnings; `npm run lint` / a11y linter flags;
nested-interactive axe violation.

### Pitfall 4: Contrast matrix not extended → silent DETAIL-08 gap
**What goes wrong:** New strip/panel selectors ship without being added to
`tests/contrast.spec.ts`; the 56-cell matrix passes but never checks the new colors.
**Why it happens:** The Playwright matrix iterates routes, not selectors — axe scans
the whole page, so new selectors ARE scanned automatically *if they render on
`/projects`*. The real risk is the **panel** colors: the panel is `hidden` by default,
and axe does not evaluate `hidden`/`display:none` content.
**How to avoid:** For the contrast run, the panel must be made visible (e.g. a test
hook or a separate spec that expands a row before `analyze()`), OR render the panel
markup in a non-hidden state for at least one card during the matrix run. `--muted` at
12px on `--bg` is the known-tight pair (Phase 5) — verify the strip explicitly.
**Warning signs:** Matrix stays at 56 cells green but a manual check shows a low-contrast
strip under amber-on-light.

### Pitfall 5: `getRepoStats()` returns combined stats — `repoUrls` order matters for the CTA
**What goes wrong:** DETAIL-06 says the `View on GitHub →` CTA links to `repoUrls[0]`,
but `getRepoStats()` *combines* all repos and `lib/github.ts` *dedupes and lowercases*
internally. The CTA must link to the **original** `repoUrls[0]` string from the
`Project`, not anything derived from the stats object (the stats object has no URL).
**Why it happens:** Assuming the stats object carries a canonical repo URL — it does
not (`GitHubRepoStats` = `{ createdAt, pushedAt, languages, commitCount }` only).
**How to avoid:** Pass `project.repoUrls[0]` straight through as the CTA href.
**Warning signs:** CTA href is `undefined` or points at a lowercased/normalized URL.

### Pitfall 6: Percentages not summing to 100 after the <1% floor
**What goes wrong:** D-09 drops sub-1% languages, so displayed percentages may sum to
e.g. 97%. Naive code that asserts a 100% sum, or an "other" bucket computed as
`100 - sum(top5)`, will be inconsistent.
**Why it happens:** Two valid approaches (re-normalize over survivors vs. raw shares)
and the "other" bucket spans ranks 6+.
**How to avoid:** Pick one approach explicitly (CONTEXT.md D-09 says either is fine if
consistent). Recommended: compute `pct` from raw total, drop <1%, take top 5, and let
"other" = sum of surviving ranks 6+ (so other can itself be <1% and still show, or be
omitted if zero). Document the choice.
**Warning signs:** A test asserting `sum === 100`.

### Pitfall 7: Empty/null state must render *nothing* — not a placeholder
**What goes wrong:** Adding a "stats unavailable" or "private repo" label for projects
with null stats.
**Why it happens:** Designer instinct to fill empty space.
**How to avoid:** LIST-07 / DETAIL-07 / D-03 / UI-SPEC are explicit: a project with
empty/absent `repoUrls` or null stats shows **no strip and omits the Tech highlights
block entirely**. The row still *expands* (D-03 — every project is expandable) to a
minimal panel (summary + "Visit project →" CTA), but no stats block, no placeholder.
**Warning signs:** Any "unavailable" copy in the rendered output.

## Runtime State Inventory

Not applicable — Phase 10 is a greenfield UI feature (new components, new CSS, new
tests). No rename, no refactor, no migration, no stored state to update.

## Code Examples

### Building the strip model (LIST-02..05, D-06/D-08/D-11)
```typescript
// Source: derived from GitHubRepoStats (lib/types.ts) + 10-CONTEXT.md D-06/D-08
export interface StripModel {
  commitCount: number;
  languages: string[];   // 1-3 abbreviated names, >=1% floor applied
  duration: string;      // "4mo" / "1y 2mo"
}

export function buildStripModel(
  stats: GitHubRepoStats | null,
  now = new Date()
): StripModel | null {
  if (!stats) return null;                       // LIST-07 — render nothing
  const langs = topLanguages(stats.languages, 3) // D-08 top 3, <1% floor
    .map((l) => LANG_ABBREV[l.name] ?? l.name);   // D-06 abbrev or full name
  return {
    commitCount: stats.commitCount,
    languages: langs,
    duration: formatDuration(stats.createdAt, now),
  };
}
// Rendered: `gh: ${commitCount} commits · ${languages.join(" / ")} · ${duration}`
```

### Building the panel model (DETAIL-02..05, D-07/D-09)
```typescript
// Source: derived from GitHubRepoStats + 10-CONTEXT.md D-07/D-09 + 10-UI-SPEC.md
export interface PanelModel {
  commitCount: number;
  breakdown: { name: string; pct: number }[];  // full GitHub names, top 5
  otherPct: number;                            // sum of ranks 6+ (post-floor)
  durationLine: string;   // "In development since Jan 2026 — 4mo"
  lastActive: string;     // "Last active 3 days ago"
}

export function buildPanelModel(
  stats: GitHubRepoStats | null,
  now = new Date()
): PanelModel | null {
  if (!stats) return null;                       // DETAIL-07 — omit the block
  const surviving = topLanguages(stats.languages, Infinity); // <1% floor applied
  const top5 = surviving.slice(0, 5);            // full names — D-07
  const otherPct = surviving.slice(5).reduce((a, l) => a + l.pct, 0);
  return {
    commitCount: stats.commitCount,
    breakdown: top5.map((l) => ({ name: l.name, pct: Math.round(l.pct) })),
    otherPct: Math.round(otherPct),
    durationLine: `In development since ${monthYear(stats.createdAt)} — ${
      formatDuration(stats.createdAt, now)
    }`,
    lastActive: `Last active ${relativeTime(stats.pushedAt, now)}`,
  };
}
```

### Relative-time formatter (DETAIL-04)
```typescript
// Source: pure date math — no date library (no-new-prod-deps rule)
export function relativeTime(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
```

### Strip CSS — extends the existing `.projects-*` block (LIST-08, D-10)
```css
/* Source: app/globals.css .projects-* block (lines ~990-1062) — APPEND here,
   no new top-level section. Reuses existing --muted / --accent / 12px tier. */
.projects-row-stats {
  font-size: 12px;            /* matches .projects-row-index tier */
  color: var(--muted);
  margin-top: 8px;            /* same as .projects-row-chips margin */
  display: flex;
  flex-wrap: wrap;            /* D-12 — wraps at narrow widths, no JS */
  gap: 4px;
  line-height: 1.5;
}
.projects-row-stats .gh-token {
  color: var(--accent);       /* D-11 — themeable source marker */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Project row = single external `<a>` to `project.link` | Row = `<button>` disclosure; links move into the expanded panel | This phase (D-01/D-02) | Resolves the nested-anchor problem; enables the strip + panel without illegal markup |
| Pages App Router data fetching | RSC `async` page + `Promise.all` for parallel data | Established (Next 15 App Router) | Phase 10 follows the existing `projects/page.tsx` RSC pattern |

**Deprecated/outdated:**
- None relevant. The stack is current and locked by CLAUDE.md.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `<button aria-expanded>` is preferred over native `<details>/<summary>` for the disclosure | Alternatives Considered / Pattern 2 | Low — both meet WCAG 2.1 AA. UI-SPEC's interaction contract describes a `<button aria-expanded>`, so this aligns; planner may still choose `<details>`. |
| A2 | A new 480px media query block is acceptable for the strip wrap, OR the existing 960px block suffices | Mobile section | Low — D-12 says "wraps at the 480px breakpoint." Codebase currently has only a 960px project breakpoint; `flex-wrap` works at any width regardless. The 480px figure is a *validation target*, not necessarily a new media query. SC-3 just requires no horizontal scroll at 480px. |
| A3 | The contrast matrix must expand a row (or render the panel un-hidden) to scan panel colors | Pitfall 4 | Medium — if the panel stays `hidden` during the axe run, DETAIL-08 is silently unverified for panel selectors. Planner must add a panel-visible path to the matrix. |
| A4 | `repoUrls[0]` (original casing) is the correct `View on GitHub →` href | Pitfall 5 | Low — DETAIL-06 names `repoUrls[0]` explicitly; `GitHubRepoStats` carries no URL, so this is the only source. |

## Open Questions

1. **Does the contrast matrix need to expand a panel to verify DETAIL-08?**
   - What we know: `tests/contrast.spec.ts` runs axe per route; axe skips `hidden`
     content. The panel is `hidden` by default.
   - What's unclear: Whether to (a) add `page.click()` on a row before `analyze()`,
     (b) add a dedicated panel-expanded spec, or (c) render one card's panel open by
     default during the matrix run.
   - Recommendation: Add a panel-expansion step to the matrix (or a small companion
     spec) so all new panel selectors are scanned across 4 hues × 2 themes. Planner
     decides the mechanism; the *coverage* is non-negotiable for DETAIL-08.

2. **Where do the strip + panel models get computed — page RSC or view RSC?**
   - What we know: Both `projects/page.tsx` and `projects-view.tsx` are RSC; either
     can call the pure helpers.
   - What's unclear: Cleanest seam.
   - Recommendation: Compute in `page.tsx` alongside the `getRepoStats()` calls (data
     and formatting co-located), pass plain `rows` props to `ProjectsView`. Keeps
     `ProjectsView` a thin mapper.

3. **Curated abbreviation map membership (D-06, Claude's discretion).**
   - What we know: Portfolio repos use Swift, NodeJS, TypeScript, Fastify, Express,
     MongoDB, React Native, JavaScript, CSS, etc. (from `lib/portfolio-data.ts`
     `repoUrls`). GitHub's `/languages` returns *language* names, not framework names.
   - What's unclear: Exact map entries.
   - Recommendation: Map the high-frequency long names GitHub actually returns —
     `TypeScript→TS`, `JavaScript→JS`, `Python→Py`. Languages like `Swift`, `CSS`,
     `HTML`, `Shell` are already short — render verbatim. The *rule* (D-06: not-in-map
     → full name) matters more than exhaustiveness.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + test | ✓ | v20.19.1 | — |
| Vitest | LIST-09 / DETAIL-09 tests | ✓ | installed | — |
| @testing-library/react | Component tests | ✓ | installed | — |
| @axe-core/playwright | DETAIL-08 contrast matrix | ✓ | installed | — |
| GitHub API / `GITHUB_TOKEN` | Live stats at runtime | n/a for this phase | — | `getRepoStats()` returns `null` → strip/panel cleanly omitted (LIST-07/DETAIL-07). `GITHUB_TOKEN` provisioning is Phase 11. |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** `GITHUB_TOKEN` is intentionally absent until
Phase 11 — Phase 10 develops and tests against `getRepoStats()` returning data or
`null`; the null-path is itself a required tested branch. No blocker.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (jsdom env) + @testing-library/react |
| Config file | `vitest.config.ts` (jsdom, globals, `tests/` excluded — Playwright owns it) |
| Quick run command | `npx vitest run lib/project-stats.test.ts` |
| Full suite command | `npm test` (i.e. `vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIST-02/03/04 | `buildStripModel` formats commits/langs/duration | unit | `npx vitest run lib/project-stats.test.ts` | ❌ Wave 0 |
| LIST-03/08 (D-08) | `topLanguages` applies <1% floor + top-3 | unit | `npx vitest run lib/project-stats.test.ts` | ❌ Wave 0 |
| LIST-04 | `formatDuration` months vs years+months | unit | `npx vitest run lib/project-stats.test.ts` | ❌ Wave 0 |
| LIST-01/05 | Strip renders with stats present (`gh:` token) | component | `npx vitest run app/components/project-row.test.tsx` | ❌ Wave 0 |
| LIST-07 | Null stats → no strip rendered | component | `npx vitest run app/components/project-row.test.tsx` | ❌ Wave 0 |
| LIST-06/09 (D-13) | Strip renders all selected langs; container is wrap-enabled (retargeted from "truncation") | component | `npx vitest run app/components/project-row.test.tsx` | ❌ Wave 0 |
| DETAIL-02 | `buildPanelModel` breakdown top-5 + other, <1% floor | unit | `npx vitest run lib/project-stats.test.ts` | ❌ Wave 0 |
| DETAIL-03/04 | `monthYear` / `relativeTime` formatting | unit | `npx vitest run lib/project-stats.test.ts` | ❌ Wave 0 |
| DETAIL-01/05/06 | Panel renders heading, commit stat, GitHub CTA | component | `npx vitest run app/components/project-row.test.tsx` | ❌ Wave 0 |
| DETAIL-07 | Null stats → panel omits Tech-highlights block, minimal panel still expands | component | `npx vitest run app/components/project-row.test.tsx` | ❌ Wave 0 |
| DETAIL-08 | New selectors pass WCAG 2.1 AA, 4 hues × 2 themes | e2e (axe) | `npx playwright test tests/contrast.spec.ts` | ⚠️ exists — needs panel-visible path added |
| LIST-01..09 / DETAIL-01..09 | `/projects` page renders without throwing | smoke | `npx vitest run "app/(terminal)/projects/page.test.tsx"` | ✅ exists — extend |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/project-stats.test.ts` (pure helpers — fast)
- **Per wave merge:** `npm test` (full Vitest) + `npm run lint` + `npm run typecheck`
- **Phase gate:** `npm test` green + `npx playwright test tests/contrast.spec.ts`
  green (DETAIL-08) + `npm run build` (incl. INFRA-05 postbuild grep) before
  `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `lib/project-stats.ts` — pure helpers (does not exist)
- [ ] `lib/project-stats.test.ts` — unit tests for all pure helpers
- [ ] `app/components/project-row.tsx` — new client island (does not exist)
- [ ] `app/components/project-row.test.tsx` — component branch tests
- [ ] `tests/contrast.spec.ts` — modify: add a panel-visible path so DETAIL-08
      actually scans the panel selectors (currently scans visible page only)
- [ ] Framework install: none — Vitest + Playwright + axe all installed

## Security Domain

`security_enforcement` is not set to `false` in `.planning/config.json`, so this
section is included. Phase 10 is a read-only display feature with a narrow surface.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface. `GITHUB_TOKEN` is a server secret consumed by Phase 9's `lib/github.ts` — never reaches this phase's code. |
| V3 Session Management | no | No sessions. |
| V4 Access Control | no | Public read-only page. |
| V5 Input Validation | yes (low) | GitHub data is rendered as text into JSX — React auto-escapes. Language names and counts come from the GitHub API via Phase 9 (already validates owner/repo via `/^[\w.-]+$/`). No `dangerouslySetInnerHTML`. |
| V6 Cryptography | no | No crypto. |
| V14 Configuration | yes (low) | The client island must NOT import `lib/github.ts` — verified by build (`node:fs` in a client component fails the build). Keeps `GITHUB_TOKEN` server-side. |

### Known Threat Patterns for {Next.js RSC + client island}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Server secret (`GITHUB_TOKEN`) leaking into client bundle | Information Disclosure | Client island receives plain props only; never imports `lib/github.ts`. Build fails if `node:` modules cross the boundary (Pitfall 2). |
| XSS via GitHub-supplied strings (language names) | Tampering / Injection | Render via JSX text nodes — React escapes by default. No `dangerouslySetInnerHTML`. |
| `View on GitHub →` / `Visit project →` reverse-tabnabbing | Tampering | `ExternalLink` primitive bakes in `rel="noopener noreferrer"` (SEO-05). Reuse it verbatim — do not hand-roll `<a>`. |
| `javascript:` URL in `repoUrls[0]` / `project.link` | Tampering | `lib/github.ts` already rejects non-`github.com` hosts for stats. For the CTA href, `repoUrls` is curated portfolio data (`lib/portfolio-data.ts`), all `https://github.com/...`. INFRA-05 prebuild grep guards placeholders. Low residual risk. |

## Sources

### Primary (HIGH confidence)
- `lib/github.ts` — verified actual `getRepoStats()` shape, return type, null
  behavior, combined-stats logic (read in full this session)
- `lib/types.ts` — verified `GitHubRepoStats` = `{ createdAt, pushedAt, languages,
  commitCount }` and `Project.repoUrls?: string[]`
- `app/components/views/projects-view.tsx` — verified current RSC row markup
- `app/(terminal)/projects/page.tsx` — verified current RSC data-fetch pattern
- `app/components/primitives/external-link.tsx` — verified `target=_blank
  rel=noopener noreferrer` baked in
- `app/components/live-clock.tsx` — verified existing thin client-island pattern
- `app/globals.css` lines ~990-1062 — verified `.projects-*` block + tokens
- `tests/contrast.spec.ts` — verified 56-cell matrix structure (4 hues × 2 themes ×
  7 routes)
- `vitest.config.ts`, `package.json` — verified test framework + scripts
- `.planning/phases/10-projects-ui-enrichment/10-CONTEXT.md` and `10-UI-SPEC.md` —
  binding decisions D-01..D-13 and the UI design contract
- `.planning/REQUIREMENTS.md` — LIST-01..09, DETAIL-01..09

### Secondary (MEDIUM confidence)
- None — all findings verified directly against the codebase.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; all tooling verified installed.
- Architecture: HIGH — the RSC→island boundary and `getRepoStats()` shape verified
  against actual source; the one new island mirrors an existing pattern (`LiveClock`).
- Pitfalls: HIGH — derived from verified code (nested-anchor, `node:fs` boundary,
  combined-stats shape) and explicit CONTEXT/UI-SPEC decisions.
- Validation: HIGH — Vitest + Playwright + axe all installed and in use; the one gap
  (panel-visible path in the contrast matrix) is identified explicitly.

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (stable — internal codebase, no fast-moving external deps)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIST-01 | One-line stat strip under each project card | Pattern 1/2; strip is server-rendered markup inside `ProjectRow`'s trigger |
| LIST-02 | Strip format `<commits> commits · <lang…> · <duration>` | `buildStripModel` + render template (Code Examples) |
| LIST-03 | Top 1-3 langs by byte count; abbreviations | `topLanguages` + `LANG_ABBREV` map (D-06); curated map membership = Open Question 3 |
| LIST-04 | Duration `created_at`→today, `4mo` / `1y 2mo` | `formatDuration` pure helper (Code Examples) |
| LIST-05 | `gh:` source marker prefix | `.gh-token` span colored `var(--accent)` (D-11) |
| LIST-06 | Mobile readability at 480px | CSS `flex-wrap` (D-12); no JS — see Mobile note in Assumptions A2 |
| LIST-07 | Empty/null `repoUrls` → render unchanged, no strip | `buildStripModel` returns `null`; Pitfall 7 |
| LIST-08 | Reuse `.projects-row` tokens, no new CSS section | Strip CSS appends to existing `.projects-*` block (Code Examples) |
| LIST-09 | Vitest: stats present, null stats, mobile branch | Retargeted per D-13 — see Validation Architecture; component tests |
| DETAIL-01 | "Tech highlights" panel when stats available | Server-rendered panel markup, visibility client-controlled |
| DETAIL-02 | Full byte-breakdown, percentages, top 5 + other | `buildPanelModel` + `topLanguages` (Code Examples); Pitfall 6 |
| DETAIL-03 | Dev duration with date range | `buildPanelModel.durationLine` + `monthYear` helper |
| DETAIL-04 | Relative last-active timestamp | `relativeTime` pure helper (Code Examples) |
| DETAIL-05 | Prominent commit count stat | `PanelModel.commitCount`; 15px/600 emphasis tier per UI-SPEC |
| DETAIL-06 | "View on GitHub →" CTA via `ExternalLink` | Reuse `ExternalLink`; href = `project.repoUrls[0]` (Pitfall 5) |
| DETAIL-07 | Null stats → omit panel block cleanly | `buildPanelModel` returns `null`; minimal panel still expands (D-03); Pitfall 7 |
| DETAIL-08 | WCAG 2.1 AA contrast, 4 hues × 2 themes | Extend `tests/contrast.spec.ts`; Pitfall 4 + Open Question 1 |
| DETAIL-09 | Vitest covers panel rendering branches | Component tests — see Validation Architecture |
</phase_requirements>
