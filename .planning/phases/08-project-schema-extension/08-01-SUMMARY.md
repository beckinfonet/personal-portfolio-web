---
phase: 08-project-schema-extension
plan: 01
subsystem: api
tags: [typescript, mongoose, schema, jest, vitest, paired-commit, github]

# Dependency graph
requires:
  - phase: 06-backend-content
    provides: Project Mongoose model + ProjectDto + getProjects controller + projects.json seed + PROJECTS fallback (D-14 byte-mirror discipline)
provides:
  - "Optional repoUrls?: string[] field on the Project type across backend (Mongoose model + ProjectDto) and frontend (lib/types.ts interface)"
  - "Reconciled 4-entry project content (Validation Ledger, Looper, MoveIn: Real Estate, CarEx) in both projects.json seed and lib/portfolio-data.ts PROJECTS, byte-mirrored, with repoUrls populated"
  - "Backend Jest + frontend vitest assertions covering repoUrls presence/absence and HTTPS shape"
affects: [09-github-api-integration, 10-projects-ui-enrichment, 11-deploy-smoke-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Optional additive schema field — [String] array with no required/default/regex, matching the link precedent; strict:'throw' preserved"
    - "Paired BE+FE commit, BE-first, one-direction-current SHA citation (BE cites pending-FE placeholder, never amended; FE cites BE SHA verbatim)"

key-files:
  created: []
  modified:
    - portfolio-services/src/models/Project.ts
    - portfolio-services/src/types/content.ts
    - portfolio-services/src/seed/projects.json
    - portfolio-services/src/seed/placeholders.ts
    - portfolio-services/tests/app.test.ts
    - portfolio-services/docs/api-contract.md
    - lib/types.ts
    - lib/portfolio-data.ts
    - lib/portfolio-data.test.ts

key-decisions:
  - "repoUrls is a plural list (string[]) per D-01, superseding the singular repoUrl wording in SCHEMA-01/02/03 and ROADMAP Phase 8 SC2"
  - "No Mongoose match/regex validator on repoUrls — matches the link precedent; HTTPS-shape checks live in Jest + vitest only (Claude's-Discretion / D-Claude)"
  - "placeholderProjects (503-warming fallback) carries a shape-valid repoUrls (its own link wrapped in an array) for shape symmetry with the seed (Claude's-Discretion)"
  - "Jest SCHEMA-05 assertion uses the targeted form (at-least-one-entry-has-repoUrls) over a per-entry type guard — catches an empty-seed regression"
  - "link values left exactly as the live API serves them (D-05); pushing repoUrls into production Mongo deferred to Phase 11"

patterns-established:
  - "Optional additive Mongoose field: { type: [String] } with no required/default, strict:'throw' kept — additive optional fields are known fields and do not bypass strict mode"
  - "Paired-SHA cross-reference recorded durably in SUMMARY.md as portfolio-services <BE-SHA> <-> portfolio-web <FE-SHA>"

requirements-completed: [SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06, SCHEMA-07]

# Metrics
duration: 6min
completed: 2026-05-21
---

# Phase 8 Plan 01: Project Schema Extension Summary

**Optional `repoUrls?: string[]` field added to the `Project` type across backend Mongoose model + DTO and frontend interface, with both the `projects.json` seed and `lib/portfolio-data.ts` PROJECTS reconciled from the stale 3-entry list to the 4 live production projects (each carrying `repoUrls`), shipped as one paired BE+FE commit.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-21T22:27:00Z
- **Completed:** 2026-05-21T22:32:49Z
- **Tasks:** 2
- **Files modified:** 9 (6 backend, 3 frontend)

## Accomplishments

- Backend `Project` Mongoose schema + `ProjectDto` carry optional `repoUrls: [String]` / `repoUrls?: string[]` — `strict: 'throw'` preserved (SCHEMA-01, SCHEMA-02).
- Frontend `lib/types.ts` `Project` interface exports `repoUrls?: string[]` with JSDoc distinguishing it from the polymorphic `link` field (SCHEMA-03, D-07).
- `portfolio-services/src/seed/projects.json` and `lib/portfolio-data.ts` PROJECTS both reconciled from the stale 3 entries (Terminal Portfolio / Portfolio Services / GSD Workflow) to the 4 live projects (Validation Ledger, Looper, MoveIn: Real Estate, CarEx), `repoUrls` populated per D-04/D-06, and verified byte-identical — D-14 mirror restored (SCHEMA-04).
- Backend Jest `/api/projects` spec + frontend vitest PROJECTS block extended with `repoUrls` presence/absence + HTTPS-shape assertions (SCHEMA-05, SCHEMA-06).
- Shipped as one paired BE+FE commit with cross-referenced SHAs (SCHEMA-07).

## Task Commits

Each task was committed atomically, one per repo:

1. **Task 1: Backend — add optional repoUrls, reconcile seed, extend Jest spec** — `portfolio-services 7c9aa25` (feat)
2. **Task 2: Frontend — add Project.repoUrls with JSDoc, byte-mirror PROJECTS, extend vitest** — `portfolio-web b1c8b1b` (feat)

**Paired-SHA cross-reference (SCHEMA-07, durable record):**

`portfolio-services 7c9aa25 <-> portfolio-web b1c8b1b`

The BE commit body cites a pending-FE-SHA placeholder (one-direction-current per Wave 1 Rule-1) and was **not** amended after the FE commit landed. The FE commit body cites the BE SHA `7c9aa25` verbatim.

## Files Created/Modified

**Backend (`portfolio-services/`):**
- `src/models/Project.ts` — added optional `repoUrls: { type: [String] }` after `link`; no `required`, no `default`, no regex; `strict: 'throw'` unchanged.
- `src/types/content.ts` — added `repoUrls?: string[]` to `ProjectDto`.
- `src/seed/projects.json` — replaced the stale 3-entry array with the 4 live projects (verbatim `name`/`year`/`status`/`summary`/`tech`/`role`/`link` from the live `GET /api/projects`), `repoUrls` added per D-04.
- `src/seed/placeholders.ts` — added a shape-valid `repoUrls` to the 1-entry `placeholderProjects`.
- `tests/app.test.ts` — extended the `/api/projects` spec: at-least-one entry has a non-empty `repoUrls` string[], any present `repoUrls` element matches `/^https?:\/\//`.
- `docs/api-contract.md` — added `repoUrls?: string[]` to the `interface Project` block plus a Phase 8 optional/additive note.

**Frontend (`portfolio-web/`):**
- `lib/types.ts` — added `repoUrls?: string[]` to the `Project` interface with JSDoc (GitHub-stats fetch purpose + distinction from `link`).
- `lib/portfolio-data.ts` — replaced the stale 3-entry `PROJECTS` with the 4 reconciled entries, byte-mirroring `projects.json`; updated the D-14 mirror comment.
- `lib/portfolio-data.test.ts` — added two tests: every present `repoUrls` is a string[] of HTTPS URLs, and at least one entry has a non-empty `repoUrls`.

## Decisions Made

- **D-01 (plural shape):** `repoUrls?: string[]` not `repoUrl?: string`. The plan's own frontmatter and CONTEXT.md note this supersedes the singular wording in SCHEMA-01/02/03 and ROADMAP Phase 8 SC2 — a roadmap/requirements text sync to plural remains a deferred documentation task (per CONTEXT.md `<deferred>`).
- **No schema regex on `repoUrls`** (Claude's-Discretion) — matches the `link` precedent; HTTPS-shape validation lives in Jest + vitest only.
- **`placeholderProjects` carries `repoUrls`** (Claude's-Discretion) — used the entry's own `link` wrapped in a single-element array for shape symmetry with the seed.
- **Jest targeted assertion** (Claude's-Discretion) — `at least one entry has a non-empty repoUrls` rather than a per-entry type guard, to catch an empty-seed regression.
- **Production Mongo not touched** — Phase 8 updates committed code/seed only; pushing `repoUrls` into the live database is deferred to Phase 11.

## Deviations from Plan

None - plan executed exactly as written. All acceptance criteria met on the first pass; tsc + Jest + vitest + build all green without any auto-fixes.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The `GITHUB_TOKEN` env var noted in PROJECT.md is a Phase 9/11 deploy concern, not Phase 8.

## Next Phase Readiness

- The `repoUrls` contract is defined on both sides — Phase 9 (`lib/github.ts`) can now compile against `Project.repoUrls` and fetch GitHub stats for every URL in the array (combining per D-02).
- D-14 byte-mirror discipline is restored; both committed project artifacts now match production's 4-entry list.
- **Deferred:** pushing `repoUrls` into production Mongo (Phase 11 re-seed/deploy); roadmap/requirements text sync from singular `repoUrl` to plural `repoUrls` (documentation-consistency pass before Phase 9 planning).

## Self-Check: PASSED

- Backend commit `7c9aa25` — FOUND in `portfolio-services` git log.
- Frontend commit `b1c8b1b` — FOUND in `portfolio-web` git log.
- All 9 modified files exist and carry the `repoUrls` changes.
- Backend `tsc --noEmit` exit 0; Jest projects spec exit 0.
- Frontend `tsc --noEmit` exit 0; `npm test -- lib/portfolio-data.test.ts` 34/34 passed; `npm run build` exit 0 with INFRA-05 postbuild grep clean.
- PROJECTS byte-mirrors projects.json (verified via JSON deep-equal).

---
*Phase: 08-project-schema-extension*
*Completed: 2026-05-21*
