# Phase 10: Projects UI Enrichment - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 10 surfaces the GitHub repo stats produced by Phase 9's `lib/github.ts`
(`getRepoStats(repoUrls) → GitHubRepoStats | null`) inside the existing
`/projects` route. Two render surfaces:

1. **Stat strip** — a compact one-line `<commits> commits · <lang…> · <duration>`
   strip in each project card's collapsed state (LIST-01..09).
2. **Tech highlights panel** — a richer expandable panel per project showing the
   full language byte-breakdown, dev-duration, last-active timestamp, prominent
   commit count, and a GitHub CTA (DETAIL-01..09).

Both degrade gracefully: a project with empty/absent `repoUrls`, or with null
combined stats, shows no strip and no Tech highlights block.

**Not in this phase:** the `lib/github.ts` data module itself (Phase 9, done);
the `repoUrls` schema field (Phase 8, done); `GITHUB_TOKEN` provisioning in
Vercel + deploy smoke test (Phase 11). No new prod deps, no route-group
changes, no framework swap.

</domain>

<decisions>
## Implementation Decisions

### Detail panel placement — inline row-expand
- **D-01:** No project-detail route exists today (`/projects` is a flat list of
  7 routes; each row is a single `ExternalLink` `<a>` to `project.link`). The
  "Tech highlights" panel is delivered as an **inline expand** of the existing
  project row — an accordion-style disclosure. No new `/projects/[slug]` route
  is created. The DETAIL-* "detail page" is the expanded state of the card.
- **D-02:** **Row click expands** the panel. The project row stops being an
  external anchor and becomes a toggle control (button / `aria-expanded`
  disclosure). The external `project.link` moves *into* the expanded panel as a
  CTA. This also resolves the nested-anchor problem: with the row no longer an
  `<a>`, the `gh:` strip token, the "View on GitHub →" CTA (DETAIL-06), and the
  "Visit project" CTA all sit freely without illegal anchor nesting.
- **D-03:** **Every project is expandable.** A project with no `repoUrls` /
  null stats expands to a *minimal panel* — project summary + a "Visit project"
  CTA (the moved `project.link`) — with the Tech highlights block omitted
  entirely (satisfies DETAIL-07: the panel renders, only the stats block is
  omitted). A repo-backed project expands to the full Tech highlights panel
  plus both CTAs.
- **D-04:** **Independent toggles** — each row expands/collapses on its own; a
  visitor may open multiple panels at once to compare projects. Not a
  single-open accordion.

### Card link structure
- **D-05:** Resolved by D-02. The collapsed row carries the `gh:`-prefixed stat
  strip; all links live inside the expanded panel. No nested `<a>`.

### Language labels
- **D-06:** Abbreviate strip languages via a **curated name→abbrev map**
  (`TypeScript→TS`, `JavaScript→JS`, etc., aligned with `lib/types.ts` `Stack`
  category conventions where applicable). Any language **not** in the map
  renders its **full GitHub name** verbatim — no clipping, no guessed
  abbreviations.
- **D-07:** Abbreviations are a **strip-only** space-saving device. The detail
  panel's byte-breakdown (DETAIL-02) uses **full GitHub language names** with
  percentages (e.g. `TypeScript 68%`).
- **D-08:** The strip shows the **top 3 languages by byte count, dropping any
  language under 1%** of total bytes. A near-single-language repo therefore
  shows just 1 language — which is correct.
- **D-09:** The **<1% floor applies to the detail panel too** — drop sub-1%
  languages before computing the top-5 + "other" breakdown. Consequence:
  displayed percentages may not sum to exactly 100%. (Planner: decide whether
  to re-normalize over the surviving languages or show raw shares; either is
  acceptable as long as it is consistent and the "other" bucket absorbs
  ranks 6+.)

### Strip placement & source marker
- **D-10:** The stat strip renders **inside the card's body (`1fr`) column,
  directly below the existing `.projects-row-chips` tech-chip row**. The
  3-column grid (`32px / 1fr / 110px`) and the right meta column
  (year/status/role) are untouched. Reuse `app/globals.css` tokens; no new
  top-level CSS section (LIST-08).
- **D-11:** The LIST-05 source marker is a **monospace `gh:` text token**, not
  an octocat SVG. No new asset; themeable via CSS color across the 4 hues × 2
  themes; matches the terminal/IDE aesthetic.

### Mobile strip behavior — DEVIATION from requirement wording
- **D-12:** On narrow screens the strip **wraps via CSS `flex-wrap`** — it does
  NOT truncate the language list. All 1-3 languages remain visible; the strip
  flows to a second line at the 480px breakpoint. No JS measurement, no
  truncation logic. Satisfies LIST-06's "wraps gracefully" branch and SC-3
  (no horizontal scroll at 480px).
- **D-13:** **Requirement-wording deviation — planner must note this.** LIST-09
  and Success Criterion 5 name a Vitest "strip mobile-truncation branch."
  Because D-12 chooses pure-CSS wrap (no truncation code path), that test is
  **retargeted**: instead of asserting truncation logic, the Vitest covers the
  strip's *rendering / layout contract* — strip renders all selected languages,
  the container is wrap-enabled. LIST-06 / LIST-09 / SC-3 / SC-5 wording should
  be updated to reflect "wrap" rather than "truncate to top-1." The plan-checker
  / verifier should not fail the phase for the absent truncation branch.

### Claude's Discretion
- The exact membership of the curated language abbreviation map — derive it
  from the languages actually present across the portfolio's `repoUrls`
  projects; the rule (D-06) matters more than an exhaustive list.
- How `getRepoStats()` is invoked for N projects (parallel fetch in the
  `/projects` RSC page vs. per-card streaming/Suspense) — an implementation
  choice for the researcher/planner, constrained only by: server-only module,
  must not block on a single slow repo unnecessarily, daily ISR already handled
  inside `lib/github.ts`.
- The expand affordance's exact markup and keyboard/a11y treatment (disclosure
  button, `aria-expanded`, `aria-controls`, focus handling) — planner decides,
  must meet WCAG 2.1 AA (DETAIL-08) and keep the existing per-row `aria-label`
  intent.
- Whether the collapsed row needs a visible expand cue (chevron / `[+]`) is a
  visual-polish call for the planner / `/gsd-ui-phase` contract; D-02 only locks
  that the *row body* is the trigger.
- `created_at→today` duration formatting and relative last-active formatting —
  formats are already specified by LIST-04 / DETAIL-03 / DETAIL-04; helper
  decomposition is the planner's call.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope (binding)
- `.planning/ROADMAP.md` — "Phase 10: Projects UI Enrichment" section: phase
  goal + 5 success criteria. NOTE: SC-3 and SC-5 reference strip
  "truncation" — superseded by D-12/D-13 (CSS wrap).
- `.planning/REQUIREMENTS.md` — LIST-01..09 and DETAIL-01..09, the 18 binding
  requirements. LIST-06 / LIST-09 truncation wording is amended by D-12/D-13.
- `.planning/seeds/github-repo-stats.md` — design rationale: the strip format
  target (`247 commits · TS / CSS · 4mo`), the three recruiter signals, the
  list-vs-detail placement intent, and the explicitly-dropped v1 signals.

### Upstream phase (the data layer this phase consumes)
- `.planning/phases/09-github-api-integration/09-CONTEXT.md` — locks the
  `getRepoStats(repoUrls): Promise<GitHubRepoStats | null>` surface and the
  `GitHubRepoStats` shape (`createdAt`, `pushedAt`, `languages`, `commitCount`);
  null = render unchanged; module is server-only.

### Patterns to mirror
- `lib/types.ts` — `Project` interface (incl. `repoUrls?: string[]`) and the
  `GitHubRepoStats` interface; `Stack` / `StackCategory` for abbrev conventions.
- `app/components/views/projects-view.tsx` — the current RSC list view to be
  enriched; `.projects-row` markup + the inline CSS-class manifest comment.
- `app/(terminal)/projects/page.tsx` — the RSC route that calls `getProjects()`;
  where `getRepoStats()` per-project calls integrate.
- `app/components/primitives/external-link.tsx` — the `ExternalLink` primitive
  reused for the DETAIL-06 "View on GitHub →" CTA (`target=_blank
  rel=noopener noreferrer`, per SEO-05).
- `app/components/primitives/tech-chip.tsx` — existing `TechChip`; strip sits
  directly below the chip row it renders.
- `app/globals.css` lines ~994-1062 (`.projects-*` block) and the ~1795 mobile
  block — strip CSS reuses these tokens (LIST-08).

### Project rules
- `CLAUDE.md` — pure CSS + custom properties (no Tailwind/CSS-in-JS/modules),
  no new prod deps, RSC discipline (only thin client islands carry
  `"use client"`), `lib/routes.ts` as the route source of truth, dual-audience
  non-negotiables.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ProjectsView` (`app/components/views/projects-view.tsx`) — currently an RSC
  rendering each project as one `ExternalLink` row. Phase 10 reworks the row:
  the body becomes an expand toggle and gains the strip + expandable panel.
- `ExternalLink` primitive — reused verbatim for the in-panel "View on
  GitHub →" and "Visit project" CTAs.
- `TechChip` primitive — unchanged; the strip renders just below the chip row.
- `.projects-*` CSS block in `app/globals.css` — strip + panel styling extend
  this block with existing tokens; no new top-level CSS section.
- Vitest with co-located `*.test.tsx` (`app/(terminal)/projects/page.test.tsx`
  already exists) — the harness for LIST-09 / DETAIL-09.

### Established Patterns
- RSC view bodies carry NO `"use client"` (see the header comment in
  `projects-view.tsx`). The row's expand/collapse is interactive state →
  **a new thin client island is required** for the expandable row (the
  collapsed strip itself can stay server-rendered; the toggle + panel
  visibility is client). This is the one architectural change in the phase.
- `getRepoStats()` is server-only — it is called in the RSC layer
  (`projects/page.tsx`), and its already-computed result (strip text, panel
  data) is passed as props down into the client row island. The client island
  never imports `lib/github.ts`.
- The 56-cell axe contrast matrix from v1.0 Phase 5 — DETAIL-08 extends it with
  the new strip + panel selectors across 4 hues × 2 themes.

### Integration Points
- Input: `Project.repoUrls?: string[]` (Phase 8) → `getRepoStats()` (Phase 9).
- `projects/page.tsx` fetches projects via `getProjects()` and must now also
  resolve per-project `GitHubRepoStats | null`, then hand strip + panel data to
  `ProjectsView`.
- Output surface consumed downstream by Phase 11's production smoke test
  (a live `/projects` card must show real stats).

</code_context>

<specifics>
## Specific Ideas

- Strip format target (from the seed, binding via LIST-02):
  `247 commits · TS / CSS · 4mo`, prefixed with the `gh:` token (D-11).
- Detail panel content (DETAIL-02..06): full byte-breakdown with percentages
  (top 5 + "other", post-<1%-floor), `In development since Jan 2026 — 4mo`
  duration line, `Last active 3 days ago` relative timestamp, a prominent
  commit-count stat, and a "View on GitHub →" CTA.
- The expand interaction is framed as "list = 5-second scan, expanded panel =
  rewards the deeper click" — per the seed's placement rationale.

</specifics>

<deferred>
## Deferred Ideas

- Per-project deep-linkable detail URLs (`/projects/[slug]`) — explicitly NOT
  built this phase (D-01 chose inline expand). If a shareable per-project URL
  is wanted later, that is its own phase (new route, `generateStaticParams`,
  OG image, breadcrumb nav).
- Test-coverage / CI-status / quality-rigor signals — already deferred to v1.2
  by Phase 9's context and the seed; not GitHub-native.

None other — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-projects-ui-enrichment*
*Context gathered: 2026-05-21*
