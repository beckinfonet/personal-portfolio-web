---
phase: 03-views
plan: 06
subsystem: ui
tags: [view, projects, vertical-slice, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-01 ExternalLink + TechChip primitives. Plan 03-04 view CSS (.projects-subhead, .projects-list, .projects-row, .projects-row-index, .projects-row-name, .projects-row-summary, .projects-row-chips, .projects-row-meta, .projects-row-year, .projects-row-status, .projects-row-role, .empty-state). Plan 03-05 validated the page→view→smoke-test template (about-view vertical slice). Plan 03-13 cleared the inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title for the projects route ('projects/ — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('ls -la projects/'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getProjects returns Promise<Project[]>, falls back to PROJECTS = [] seed when backend unreachable). lib/types.ts Project shape. lib/routes.ts ROUTES[1] (description, pathname) — single source of truth for metadata description + canonical."

provides:
  - "ProjectsView RSC at app/components/views/projects-view.tsx — receives Project[] prop; renders the LOCKED D-03 empty-state line when length === 0; otherwise renders subhead `total {N} · sorted by year desc` + 32px/1fr/110px grid per project (index + name + summary + tech chips + year/status/role)."
  - "Async page wrapper at app/(terminal)/projects/page.tsx — fetches Project[] via getProjects(), composes <PromptLine cmd='ls -la projects/' /> + <ProjectsView projects={projects} />, exports enriched static metadata (title preserved + description + alternates.canonical)."
  - "TEST-05 smoke spec at app/(terminal)/projects/page.test.tsx — three assertions: render-without-throw, locked-title export, locked-prompt-text in body."
  - "Confirmation that the Plan 03-05 vertical-slice template scales to additional Wave 4 views without modification."

affects:
  - "03-12 (cross-view title-uniqueness test) — projects/ metadata now matches the contract (template literal off ROUTES[i].label + description: route.description + alternates.canonical: route.pathname) the cross-view test enforces."
  - "Phase 5 (SEO-01..04) — extends the per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-02) — fills lib/portfolio-data.ts PROJECTS array with real entries; ProjectsView renders the populated branch with no view edits expected (sort + grid + chips + meta all already wired)."
  - "Phase 7 (recruiter 5-second test) — projects view becomes navigable; sidebar projects/ row resolves to a real view body now (not the Phase 2 stub paragraph)."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC view receiving typed array prop; page fetches data via lib/api silent-fallback, view receives props (ARCHITECTURE.md Pattern 1 + Pattern 3)."
    - "Empty-state branch as single-line early return with LOCKED D-03 string (no improvisation, no conditional metadata)."
    - "Non-mutating sort via spread: `[...projects].sort((a, b) => Number(b.year) - Number(a.year))` — year is a string parsed to number for desc ordering."
    - "Row-as-link via <ExternalLink showGlyph={false}> — entire row is the click target, glyph suppressed because the row is large enough that ↗ would be visual noise."
    - "TechChip iteration uses the tech string itself as React key (unique within the array)."
    - "Per-row aria-label `${name}: ${summary} (opens in new tab)` per UI-SPEC ARIA convention (announces external destination + summary to SR users)."
    - "Static metadata: Metadata via template-literal off ROUTES[1].label so the LOCKED Phase 2 D-12 title is single-sourced."
    - "Smoke test pattern: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is the locked string, (3) body contains the locked prompt-line text."

key-files:
  created:
    - "app/components/views/projects-view.tsx — RSC view (63 lines). Empty branch + populated branch with subhead, <ul>/<li> list, ExternalLink row wrap, TechChip iteration, right-aligned meta column."
    - "app/(terminal)/projects/page.test.tsx — TEST-05 smoke spec (26 lines). 3 assertions; uses globals: true (no vitest import); next/navigation mock with /projects pathname."
  modified:
    - "app/(terminal)/projects/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (24 lines). Imports getProjects + ROUTES + ProjectsView; metadata gains description + alternates.canonical; body composes <PromptLine /> + <ProjectsView />; orphan <p className=\"stub-body\"> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[1].label — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single (any future relabel of ROUTES[1].label cascades to the title automatically). Smoke test asserts the runtime-evaluated literal."
  - "Row-as-link with showGlyph={false} — the row's grid-template + accent name + summary + chips already telegraphs interactivity; an additional trailing ↗ glyph would crowd the right-column 110px meta block. The ExternalLink primitive still bakes target=_blank + rel=noopener noreferrer (SEO-05 / T-03-19 / T-03-21 mitigations)."
  - "React key on each project <li> = p.name (not array index). Project names are unique within PROJECTS (developer-controlled seed); using the name as key gives stable reconciler keys across reorderings (sort by year desc could shuffle indices) without falling back to the index-key anti-pattern."
  - "React key on each TechChip = the tech string itself. Tech labels within a single Project.tech array are unique (no project lists 'TypeScript' twice); the string IS the natural id."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-02, VIEW-08, SEO-05, TEST-05]

# Metrics
duration: 2m
completed: 2026-05-07
---

# Phase 3 Plan 06: Projects View Vertical Slice Summary

**Projects-view vertical slice landed — RSC view component + async page wrapper with enriched metadata + TEST-05 smoke spec — replicating the Plan 03-05 template against the 32px/1fr/110px grid layout, LOCKED D-03 empty-state copy, and SEO-05-compliant row-as-link wrapping via `<ExternalLink showGlyph={false}>`.**

## Performance

- **Duration:** ~2 min (executor wall time, no recovery overhead)
- **Started:** 2026-05-07T00:21:18Z
- **Completed:** 2026-05-07T00:23:22Z
- **Tasks:** 2 / 2
- **Files created:** 2 (`app/components/views/projects-view.tsx`, `app/(terminal)/projects/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/projects/page.tsx`)

## Accomplishments

- New RSC component `ProjectsView` rendering the V1 projects-view layout per UI-SPEC §V2:
  - **Empty branch** (live v1 path — `PROJECTS = []`): single 13px/muted line with the LOCKED D-03 string `total 0 · (no projects committed yet)` wrapped in `.content-block`. No grid, no rows, no chips render.
  - **Populated branch:** subhead `total {N} · sorted by year desc`; `<ul class="projects-list">` of `<li>` rows; each row is a single `<ExternalLink class="projects-row" showGlyph={false}>` containing index `01.`/`02.`/… + name (accent 15/600) + summary (13/text) + tech chips (`<TechChip key={t}>`) + right-aligned year/status/role meta column.
  - **Sort:** `[...projects].sort((a, b) => Number(b.year) - Number(a.year))` — non-mutating spread, year string cast to number for desc ordering.
- Projects page (`app/(terminal)/projects/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getProjects()`, composes `<PromptLine cmd="ls -la projects/" />` + `<ProjectsView projects={projects} />`. The Phase 2 stub `<p className="stub-body">// view body lands in Phase 3</p>` removed in the same commit (CLAUDE.md brownfield delete-and-replace discipline).
- Static `metadata: Metadata` enriched with `description: route.description` (sourced from `ROUTES[1].description = "Projects — engineering work, sorted by year"`) and `alternates: { canonical: "/projects" }`. The LOCKED Phase 2 title `"projects/ — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec passes 3 assertions: (1) `ProjectsPage()` renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `ls -la projects/` prompt text. Defensive `next/navigation` mock with `useSelectedLayoutSegment(() => "projects")` and `usePathname(() => "/projects")`.
- SEO-05 enforced: every external link in `projects-view.tsx` flows through `<ExternalLink>` (which bakes `target="_blank" rel="noopener noreferrer"`); zero raw `target="_blank"` in either view or page (T-03-19 / T-03-21 mitigation). `grep -rE 'target="_blank"' 'app/(terminal)/projects/' app/components/views/projects-view.tsx` returns 0 hits.
- All gates green: `npm test` 48/48 passing across 12 files, `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with all 12 pages prerendered as static (the `/projects` route now shows `Revalidate 5m / Expire 1y` in the build report — confirms async-RSC fetch wired correctly), postbuild INFRA-05 placeholder check clean.

## Task Commits

Each task was committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create ProjectsView RSC component** — `0381cb2` (feat)
2. **Task 2: Rewrite projects page wrapper to async RSC + add TEST-05 smoke spec** — `323391a` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/projects-view.tsx` (created, +63) — RSC view; reads `Project[]` prop; if `length === 0` returns `.content-block` wrapping the LOCKED D-03 empty-state line; otherwise sorts non-mutating year desc, renders `.projects-subhead` + `<ul class="projects-list">` of `<li>` rows. Each row = `<ExternalLink href={p.link} showGlyph={false} className="projects-row" aria-label={...}>` containing 32px index span + 1fr middle column (name + summary + chips) + 110px meta column (year + status + role).
- `app/(terminal)/projects/page.tsx` (modified, +12 / -4) — Phase 2 stub replaced with async RSC; imports `getProjects`, `ROUTES`, `ProjectsView`, `PromptLine`; `const route = ROUTES[1]` pins to projects; static metadata gains `description` + `alternates`; body composes the prompt-line + view; orphan `<p className="stub-body">` removed.
- `app/(terminal)/projects/page.test.tsx` (created, +26) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); mocks `next/navigation` with projects segment + pathname; awaits `ProjectsPage()` and renders the result. Three assertions per TEST-05 D-18.

## Decisions Made

- **Static metadata title built via template literal off `ROUTES[1].label`.** Mirrors the Plan 03-05 about-view pattern. Preserves the LOCKED Phase 2 D-12 string AND single-sources the file label — any future relabel of `ROUTES[1].label` cascades to the title automatically. The smoke test's `expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov")` confirms the literal evaluates correctly at module-load time.
- **Row-as-link uses `<ExternalLink showGlyph={false}>` (Option A from UI-SPEC §V2 row paragraph).** The plan's `must_haves.key_links` spec was explicit. The 32px/1fr/110px grid + accent name + summary + chips already telegraphs interactivity; a trailing `↗` glyph would crowd the 110px right column. The `ExternalLink` primitive still bakes `target="_blank"` and `rel="noopener noreferrer"` (T-03-19 + T-03-21 mitigations satisfied without the visual cost).
- **React key per `<li>` is `p.name` (not array index).** `Project.name` is unique within `PROJECTS` (developer-controlled seed in `lib/portfolio-data.ts`); using the name gives stable reconciler keys across the year-desc sort (sort could shuffle indices) without the index-key anti-pattern.
- **React key per `<TechChip>` is the tech string itself.** Tech labels within a single `Project.tech` array are unique (no project lists "TypeScript" twice); the string is the natural id and keeps the JSX terse (`<TechChip key={t}>{t}</TechChip>`).

## Deviations from Plan

None — both tasks executed exactly as written in `03-06-PLAN.md`. No Rule 1/2/3 auto-fixes triggered; the plan was fully prescriptive (dependencies 03-01, 03-04, 03-05, 03-13 had pre-shipped every primitive, CSS class, build gate, and template the view needed).

## Issues Encountered

**Worktree base mismatch at executor start (recovered cleanly).**

`git rev-parse HEAD` returned `41b62b3` (the original "feat: build SEO-focused portfolio frontend" base) at executor start, not the expected `379eddb` Wave 3 tracking commit. The expected base WAS reachable in the object store (`git cat-file -e` succeeded), so the worktree branch had simply not been advanced from the original base. Recovery: `git reset --hard 379eddbfac7721c325adad81f9573de70e34526e` per the `<worktree_branch_check>` protocol. Working tree was already clean (`git status --short` returned nothing). Both task commits then landed cleanly on top of the expected base. No upstream work was lost; nothing was clobbered.

**Acceptance-criterion grep vs. project-convention comment (documented, no change — same pattern as Plan 03-05).**

Task 1's acceptance criterion `grep -c '"use client"' app/components/views/projects-view.tsx | grep -qx 0` literally returns `1` because the file's first line is the project-convention comment `// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)` — the same comment used in `app/not-found.tsx`, `app/components/primitives/prompt-line.tsx`, `app/components/primitives/external-link.tsx`, `app/components/views/about-view.tsx`. The plan's `<action>` block prescribes that comment verbatim. The acceptance criterion's intent — "no actual `'use client'` directive at the top of the file" — is satisfied: `grep -nE '^"use client";?\s*$' app/components/views/projects-view.tsx` returns nothing. Same literal-vs-intent gap Plan 03-05 documented; carrying the same explanation forward.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives + CSS. No environment variables, no external services, no manual config. The view ships against the `PROJECTS = []` seed (the live v1 state) so the empty branch is what renders today; Phase 6 will populate `PROJECTS` and the populated branch will render with no view edits.

## Next Phase Readiness

- **Wave 4 sibling plans (03-07..03-11) remain unblocked.** This plan's two-task shape (view RSC + page rewrite-with-test) is a one-to-one drop-in template for the 5 remaining views; the Wave 4 parallelization remains valid.
- **Plan 03-12 (cross-view metadata + title-uniqueness test) gains another conforming entry.** Projects metadata now matches the contract (`title: \`${route.label} — Bakytbek Tatibekov\`` + `description: route.description` + `alternates: { canonical: route.pathname }`); the cross-view `Set(allTitles).size === 7` assertion will see the projects entry shaped correctly.
- **Phase 4 (mobile redistribution) unaffected.** No desktop-only patterns introduced; the 32/1fr/110 grid is already configured in `app/globals.css` to collapse cleanly on narrow viewports per Plan 03-04's responsive baseline.
- **Phase 6 (CONTENT-02) unblocked.** ProjectsView renders `[...projects].sort(...)` against the typed `Project[]` shape — Phase 6 swaps the empty array in `lib/portfolio-data.ts` with real entries and the populated branch renders verbatim, no view edits required.
- **Phase 7 (recruiter 5-second test) gains a real route.** Sidebar `projects/` no longer resolves to the Phase 2 stub paragraph; clicking it navigates to a real view body. (For v1 today this is the empty-state line; once Phase 6 fills `PROJECTS` the recruiter sees real engineering work.)

## Threat Mitigation Verification

- **T-03-19 (reverse tabnabbing on projects-row link):** mitigated. `grep -c 'target="_blank"' app/components/views/projects-view.tsx` returns `0`; the row link routes through `<ExternalLink>` which bakes `target="_blank" rel="noopener noreferrer"` (confirmed in `app/components/primitives/external-link.tsx` line 28).
- **T-03-20 (URL injection in `Project.link`):** mitigated by typing (`Project.link: string` in `lib/types.ts`) and by the v1 source being `lib/portfolio-data.ts` `PROJECTS = []` (developer-controlled empty array). Phase 6 / BACKEND-04 will add zod URL/scheme validation at the api boundary.
- **T-03-21 (referrer leak to repos):** mitigated. `noreferrer` baked into `<ExternalLink>` — confirmed in `app/components/primitives/external-link.tsx` line 28.

## Self-Check: PASSED

- `app/components/views/projects-view.tsx` — FOUND
- `app/(terminal)/projects/page.tsx` — FOUND (modified)
- `app/(terminal)/projects/page.test.tsx` — FOUND
- Commit `0381cb2` (`feat(03-06): add ProjectsView RSC component`) — FOUND in `git log`
- Commit `323391a` (`feat(03-06): rewrite projects page wrapper to async RSC + add TEST-05 smoke spec`) — FOUND in `git log`

---
*Phase: 03-views*
*Completed: 2026-05-07*
