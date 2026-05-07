---
phase: 03-views
plan: 12
subsystem: testing
tags: [test, vitest, metadata, cross-view, set-deduplication, ROUTE-02, TEST-05, phase-3]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plans 03-05..03-11 — every page.tsx exports a static `metadata: Metadata` with title (template-literal off ROUTES[i].label, preserving the LOCKED Phase 2 D-12 string), description (sourced from ROUTES[i].description), and alternates.canonical (ROUTES[i].pathname). Plan 03-13 cleared the inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title strings (7 unique). D-17 forbids generateMetadata for v1 — every metadata is a static export, so plain ES imports work without mocking."
  - phase: 01-foundation
    provides: "lib/routes.ts ROUTES — 7-entry as const tuple driving the canonical-pathname assertion (single source of truth). vitest.config.ts globals: true + jsdom environment + jest-dom matchers (no per-test imports needed)."

provides:
  - "Cross-view metadata audit at app/(terminal)/views.test.tsx — single Vitest spec with 4 assertions: title set-deduplication (size === 7), non-empty description per view, alternates.canonical equals route pathname per view, drift guard (VIEWS.length === ROUTES.length === 7)."
  - "Load-bearing mitigation for RESEARCH §Pitfall 1 (per-route metadata uniqueness) — closes the gap where per-view smoke specs (plans 05–11) each only assert their own LOCKED title and cannot detect a drift where two views collide on the same title."
  - "ROUTE-02 / Phase-3 success-criterion guard satisfied: `Vitest set-deduplication test passes` is now an automated assertion, not a manual review item."
  - "T-03-19 (title-collision regression) and T-03-20 (route-additions audit gap) threats mitigated: any future commit that drifts two titles to the same value, or that grows ROUTES to 8 entries without updating this spec, fails CI loudly."

affects:
  - "Phase 5 (SEO-01..04) — when Phase 5 introduces dynamic metadata for OG / JSON-LD / Twitter cards, this spec remains valid as long as static title/description/canonical exports stay primary; if Phase 5 swaps to generateMetadata, this spec must migrate to await the metadata function (D-17 currently forbids that drift)."
  - "Phase 6 (CONTENT-01..05) — content fills do not touch metadata exports; this spec stays green through content authoring."
  - "Future v3 — adding an 8th route (e.g. hire-me.txt per VIEW-V3-01) trips the drift guard at VIEWS.length !== ROUTES.length, forcing the author to add the import + entry here. Designed-in friction; T-03-20 mitigation."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cross-view metadata audit via static ES imports — every page module's `metadata` is a plain JS export (D-17), so the test imports them directly with no mocking and assertions evaluate at compile-time module-resolution."
    - "Set-deduplication idiom: `expect(new Set(titles).size).toBe(VIEWS.length)` is the canonical RESEARCH §Pitfall 1 mitigation; collisions surface as a single diff (size shrinks) rather than a per-pair comparison."
    - "Drift guard: `expect(VIEWS.length).toBe(ROUTES.length)` plus an explicit `toBe(7)` anchor — adding an 8th route fails the audit before the audit can silently miss it."
    - "Custom assertion message via the second argument to `expect(...)` — `expect(predicate, 'message').toBe(true)` surfaces which route failed the per-view loop without per-route describe blocks."
    - "Continued globals: true convention (vitest.config.ts line 14) — zero `from \"vitest\"` imports in this file, matching every other spec in the repo."

key-files:
  created:
    - "app/(terminal)/views.test.tsx — 49-line cross-view metadata audit. Statically imports `metadata` from all 7 page modules, builds a typed VIEWS tuple paired with ROUTES entries, runs 4 assertions inside a single describe block."
  modified: []

key-decisions:
  - "Built 4 assertions (not just the plan's stated 3) by including the planner-recommended drift guard from `<action>` block — `VIEWS.length === ROUTES.length` plus an anchor on `ROUTES.length === 7`. The drift guard is the T-03-20 mitigation cited in the plan's threat model and is explicitly prescribed in the action block (lines 159–162); treating it as required, not optional."
  - "Per-route loop uses `for (const { route, metadata } of VIEWS)` rather than a per-route describe block — keeps the test count bounded at 4 (matches plan's acceptance criterion `4 passing tests`) while still surfacing the failing route via the custom assertion message argument (`expected metadata.description on ${route.pathname}`)."
  - "Zero mocking — confirmed via the test passing on first run that `metadata` exports are pure static objects with no transitive client-island imports. Per-view smoke specs (plans 05–11) needed `vi.mock(\"next/navigation\", ...)` only because they `await PageComponent()` (which transitively loads view components); this audit only touches the metadata exports, which are RSC-safe and runtime-pure."

patterns-established:
  - "Cross-view audits live at the route-group root (app/(terminal)/views.test.tsx) — sibling to the route-group layout and per-view page directories. Future cross-view audits (e.g. shared-prompt-line presence, per-view CSS class budget) follow the same naming + location convention."
  - "Audit specs use a typed VIEWS tuple (`as const`) pairing each ROUTES entry with its metadata import — readable, refactor-safe, and the iteration order matches the locked sidebar / palette / sitemap order."
  - "Static metadata exports + globals: true vitest = no boilerplate audits — 4 assertions, 49 lines, 2ms runtime."

requirements-completed: [ROUTE-02, TEST-05]

# Metrics
duration: 6m
completed: 2026-05-07
---

# Phase 3 Plan 12: Cross-View Metadata Audit Summary

**Single Vitest spec at `app/(terminal)/views.test.tsx` audits all 7 page modules for title uniqueness, non-empty descriptions, and route-matched canonical pathnames — closing RESEARCH §Pitfall 1 and the ROUTE-02 success criterion in 49 lines, 4 assertions, 2 ms runtime.**

## Performance

- **Duration:** ~6 min (executor wall time, includes worktree-bug recovery)
- **Started:** 2026-05-07T00:30:00Z
- **Completed:** 2026-05-07T00:35:12Z
- **Tasks:** 1 / 1
- **Files created:** 1 (`app/(terminal)/views.test.tsx`)
- **Files modified:** 0

## Accomplishments

- Cross-view metadata audit live: 4 passing tests in 2 ms runtime — load-bearing for ROUTE-02 / Phase-3 success-criterion `Vitest set-deduplication test passes`.
- Title set-deduplication assertion (`new Set(titles).size === 7`) closes RESEARCH §Pitfall 1 mitigation. Per-view smoke specs (plans 05–11) each assert their own LOCKED title; only this cross-view spec catches a regression where two views drift to the same title (T-03-19 mitigation).
- Description-and-canonical assertions enforce the Wave 3 metadata-enrichment guarantees from plans 03-05..03-11: every view exports a non-empty `description` and an `alternates.canonical` matching its route pathname.
- Drift guard (`VIEWS.length === ROUTES.length === 7`) catches future routing additions that forget to update this audit (T-03-20 mitigation).
- All gates green: `npm test` 67/67 passing across 18 files (was 63/63 across 17 — 4 new tests cleanly added), `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with all 12 pages prerendered as static, postbuild INFRA-05 placeholder check clean.
- Zero mocking — confirmed at runtime that the static `metadata` exports are pure JS objects with no transitive client-side hook imports; the audit imports them directly without `vi.mock("next/navigation", ...)` (per-view smoke specs need that mock because they `await PageComponent()`; this audit does not).

## Task Commits

Each task was committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create cross-view metadata-uniqueness spec** — `49fcd8d` (test)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/(terminal)/views.test.tsx` (created, +49) — Cross-view audit. Statically imports `metadata` from all 7 page modules (`./page` for about plus 6 sibling routes). Builds a typed `VIEWS` tuple via `as const`, pairing each ROUTES entry with its metadata. 4 assertions inside a single `describe("Cross-view metadata audit (TEST-05 / ROUTE-02)", ...)`:
  1. `all 7 view metadata.title strings are unique` — `expect(new Set(titles).size).toBe(7)`.
  2. `every view exports a non-empty metadata.description` — for-of loop with custom assertion message identifying the failing route.
  3. `every view exports alternates.canonical equal to its route pathname` — for-of loop checking `metadata.alternates?.canonical === route.pathname`.
  4. `count of audited views equals ROUTES length (drift guard)` — `expect(VIEWS.length).toBe(ROUTES.length)` + anchor `expect(ROUTES.length).toBe(7)`.

## Decisions Made

- **Implemented the planner-recommended 4th assertion (drift guard).** The plan's `<objective>` lists 3 assertions; the `<action>` block prescribes 4 (with the explicit drift guard at lines 159–162) and the `<threat_model>` cites T-03-20 as a mitigation pinned to the drift guard. Treated 4 assertions as the required spec, not optional. The acceptance criterion `npm test ... exits 0 with 4 passing tests` and the verification block grep `VIEWS.length` confirm.
- **For-of loops over per-route describe blocks.** Using one `describe` with 4 nested `test` blocks (plus per-route loops inside two of them) keeps the test count bounded at the planned 4 while still identifying which route fails via the custom assertion message argument (`expect(predicate, message).toBe(true)`). Per-route describe blocks would inflate the count to 14+ and complicate the acceptance criterion.
- **No `vi.mock("next/navigation", ...)` defensive stub.** Per-view smoke specs need it because they `await PageComponent()` (which transitively renders view components). This audit only touches the static `metadata` exports, which never reach navigation hooks. Confirmed at runtime: the spec passed without the mock; adding it would be ceremonial cargo-culted code.
- **Typed `VIEWS` tuple via `as const`.** Pairs each ROUTES entry with its metadata in a stable, readable iteration order. Refactor-safe: TypeScript narrows the tuple shape so a future rename of `ROUTES[i].pathname` propagates as a typecheck error here, not a runtime test surprise.

## Deviations from Plan

None — Task 1 executed exactly as written in `03-12-PLAN.md`. The plan's `<action>` block prescribed the file content verbatim; I copied it 1:1, then ran the documented verification chain (grep checks, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`). All checks green on first attempt.

No Rule 1 / Rule 2 / Rule 3 auto-fixes triggered. The 7 enriched page modules from plans 03-05..03-11 already shipped the metadata shape this spec audits, and the assertions found nothing to flag.

## Issues Encountered

**Worktree-vs-parent Write-tool path bug (recovered cleanly).**

The Write tool's absolute-path resolution misrouted the new `app/(terminal)/views.test.tsx` into the parent repo path (`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/app/(terminal)/views.test.tsx`) instead of the worktree path (`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.claude/worktrees/agent-a45fe4539e738dff1/app/(terminal)/views.test.tsx`). This is the same bug noted in 03-05, 03-08, 03-10, and 03-11 SUMMARYs; the worktree_branch_check protocol explicitly warned about it and prescribed the recovery.

Recovery: `mv` the file from the parent repo path into the worktree path, then verified parent `git status --short` returned to its expected baseline (`?? .claude/`, `?? design_handoff_terminal_portfolio/` only). Worktree `git status --short` then showed the expected `?? app/(terminal)/views.test.tsx`. Commit landed cleanly on the worktree branch (`49fcd8d`).

No content was lost; the file's bytes were moved, not copied. The bug is in the Write tool's path resolution under nested-worktree contexts and is unrelated to plan content.

## User Setup Required

None — pure test addition. No environment variables, no external services, no manual config.

## Next Phase Readiness

- **Phase 3 plan-list complete pending Plan 13.** Plan 03-12 was the last Wave-5 deliverable; the only remaining planned plan is 03-13 (build-gate cleanup), which is already complete (its absence from this plan's `requires` is intentional — 03-13 was scheduled as foundational maintenance, not a Wave dependency).
- **Phase 4 (mobile redistribution) unblocked.** This audit is read-only over the 7 page modules; no source-code changes; no impact on the per-view component shape Phase 4 will redistribute.
- **Phase 5 (SEO-01..04) — partial alignment.** When Phase 5 introduces JSON-LD / OG / Twitter card metadata, those ride alongside the static `title/description/canonical` exports this spec audits. The audit stays valid as long as the static exports remain primary; if Phase 5 migrates any route to `generateMetadata`, this spec needs a parallel migration to await the function. D-17 currently forbids that drift; flagged here for Phase-5 planning.
- **Future v3 — `hire-me.txt` (VIEW-V3-01).** Adding an 8th `ROUTES` entry will fail the `VIEWS.length === ROUTES.length` drift guard. The author must add a corresponding `import { metadata as hireMeMeta } from "./hire-me/page";` plus a `VIEWS` tuple entry. Designed-in friction is the T-03-20 mitigation.

## Threat Mitigation Verification

- **T-03-19 (metadata title-collision regression on the 7 page modules):** mitigated. `new Set(titles).size === 7` audits all 7 LOCKED titles in a single assertion. If two routes drift to the same title literal, the set shrinks below 7 and the test fails loudly. Per-view smoke specs (plans 05–11) cannot detect this regression because each only knows about its own LOCKED title; only this cross-view spec audits the full set. Test runs in 2 ms, so CI cost is effectively zero.
- **T-03-20 (route additions without metadata audit — silent audit-gap regression):** mitigated. `expect(VIEWS.length).toBe(ROUTES.length)` plus the anchor `expect(ROUTES.length).toBe(7)` guarantees that any future change adding an 8th route to `ROUTES` fails this spec until the author adds the corresponding `import { metadata as ... } from "./.../page"` and a `VIEWS` tuple entry. Two-clause assertion (length-match + length-anchor) catches both halves of the drift: someone adds a route but not the audit (length-match fails) AND someone removes a route silently (length-anchor fails).

## Self-Check: PASSED

- `app/(terminal)/views.test.tsx` — FOUND in worktree
- Commit `49fcd8d` (`test(03-12): add cross-view metadata audit spec (4 assertions)`) — FOUND in `git log`
- `npm test -- 'app/(terminal)/views.test.tsx'` — 4/4 passing
- `npm test` (full suite) — 67/67 passing across 18 files (no regressions)
- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — clean, all 12 pages prerendered, INFRA-05 postbuild check clean
- Parent repo `git -C /.../portfolio-web status --short` — only `?? .claude/` and `?? design_handoff_terminal_portfolio/` (no leaked files)

---
*Phase: 03-views*
*Completed: 2026-05-07*
