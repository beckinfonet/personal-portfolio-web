# Phase 8: Project Schema Extension - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend and frontend agree on a new optional repo-links field on `Project` —
the contract gate every later v1.1 phase compiles against. Phase 8 delivers:

1. **Content reconciliation** — the committed seed/fallback project list is
   stale. `lib/portfolio-data.ts` `PROJECTS` and
   `portfolio-services/src/seed/projects.json` both still hold the old 3
   entries (Terminal Portfolio / Portfolio Services / GSD Workflow), while
   production Mongo serves a different, current set of **4** projects. Phase 8
   reconciles both committed artifacts to the 4 live entries, restoring D-14
   byte-mirror discipline.
2. **Schema field** — adds an optional repo-links field to the backend
   Mongoose `Project` model, `ProjectDto`, and frontend `lib/types.ts`
   `Project` interface.
3. **Field population** — populates the new field on all 4 project entries in
   the reconciled seed + fallback.

Ships as a paired FE+BE commit per CLAUDE.md brownfield discipline.

</domain>

<decisions>
## Implementation Decisions

### Field shape — list, not single string
- **D-01:** The new field is a **list of repo URLs**, not a single string.
  Field name: `repoUrls?: string[]` (optional, omitted when a project has no
  public repo). This **supersedes** the `repoUrl?: string` (singular) wording
  in SCHEMA-01/02/03 and ROADMAP Phase 8 SC2 — the requirements/roadmap text
  is now stale and should be synced to plural.
  **Why:** A project can span multiple public repos (Looper = mobile app +
  agentic-services backend). A single URL would tell only part of the story.
- **D-02 [informational]:** Phase 9 fetches stats for **every** URL in a project's `repoUrls`
  and **combines** them: total commit count summed across repos, language
  byte-breakdowns merged, earliest `created_at` for dev duration, latest
  `pushed_at` for last-active. Phase 10 renders the combined figures.
  **Why:** Direct consequence of D-01 — a multi-repo project shows one
  aggregate stat strip / panel, not one per repo.
- **D-03 [informational]:** This ripples into Phases 9 and 10. Their ROADMAP entries currently
  assume one repo per project (`getRepoStats(repoUrl: string)`, "each project
  that has a `repoUrl`"). Those entries — and the SCHEMA-*/GH-*/LIST-*/DETAIL-*
  requirement wording that says `repoUrl` singular — must be updated to the
  plural list shape. Flagged for a roadmap/requirements sync (see Deferred).

### Content — the 4 live projects + their repo URLs
- **D-04:** Canonical project content for the reconciled seed/fallback is the
  **live `GET /api/projects` response** (Railway production), not the stale
  committed seed. The 4 entries, with their existing polymorphic `link` value
  and the new `repoUrls`:

  | # | name | live `link` | `repoUrls` (new) |
  |---|------|-------------|------------------|
  | 1 | Validation Ledger | `https://github.com/beckinfonet/validation-ledger-mobile` | `["https://github.com/beckinfonet/validation-ledger-mobile"]` |
  | 2 | Looper | `https://github.com/beckinfonet/looper-agentic` | `["https://github.com/beckinfonet/LooperMobile", "https://github.com/beckinfonet/looper-agentic"]` |
  | 3 | MoveIn: Real Estate | `https://apps.apple.com/us/app/movein-real-estate/id6758697464` | `["https://github.com/beckinfonet/jaytap-mobile", "https://github.com/beckinfonet/JayTap-services"]` |
  | 4 | CarEx | `https://github.com/beckinfonet` | `["https://github.com/beckinfonet/CarEx", "https://github.com/beckinfonet/carEx-services"]` |

  Full `summary`/`tech`/`year`/`status`/`role` for each entry come verbatim
  from the live API response — the executor should fetch it fresh, not
  hand-copy from this table.
- **D-05:** `link` polymorphism is now concretely visible in real data and
  confirmed correct (Q1 resolution 2026-05-21): MoveIn's `link` is an App
  Store URL, CarEx's `link` is the org page — neither is a repo. `repoUrls`
  is the dedicated, separate field for GitHub-stats fetching. `link` is left
  exactly as the live data has it; Phase 8 does not touch `link` values.
- **D-06:** Each of the 4 projects now has **two** repo URLs in `repoUrls`
  (a mobile app repo + a services/backend repo) except Validation Ledger,
  which has one. Repo visibility is not assumed — some may be private.
  **Private/unreachable repos are simply skipped, not fetched** (the v1.1
  design intent — private-repo support is explicitly out of scope per
  PROJECT.md). Phase 9 fetches each URL in `repoUrls`, gets `null` for any
  private/missing repo (GitHub returns 404 to the public read-only token),
  and **combines only the repos that returned data**. A project's card/panel
  shows no stats *only* when **all** of its `repoUrls` are private/unreachable
  (LIST-07 / DETAIL-07 graceful degradation — no "private" label, no broken
  layout). Phase 11 smoke test against production confirms which repos
  actually surface stats.

### JSDoc / field documentation
- **D-07:** The `lib/types.ts` `Project.repoUrls?` field carries JSDoc
  documenting its purpose and its distinction from `link`. Adapt SCHEMA-03's
  prescribed copy to the plural shape, e.g.: *"Public GitHub repo URLs for the
  v1.1 GitHub-stats fetch (Phase 9 combines stats across all entries).
  Distinct from the polymorphic `link` field, which may point at a live site,
  App Store page, or case study."*

### Claude's Discretion
- **Schema-level URL validation:** No Mongoose `match`/regex validator on
  `repoUrls` — matches the existing `Project.link` precedent (no schema regex;
  HTTPS/format checks live in tests, and Phase 9's parser returns null for
  non-GitHub URLs). Planner/executor's call to keep the schema minimal.
- **Backend `placeholderProjects` (503-warming fallback):** Planner decides
  whether the 1-entry placeholder also carries `repoUrls` for shape symmetry.
  Low-stakes — the 503 fallback only needs a shape-valid entry.
- **Backend Jest assertion depth (SCHEMA-05):** Cover both presence and
  absence of `repoUrls` in the `/api/projects` response shape; planner picks
  between a minimal per-entry type guard and a targeted "at least one seeded
  entry has `repoUrls` populated" assertion. The targeted form is preferred —
  it catches an empty-seed regression.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements & roadmap
- `.planning/REQUIREMENTS.md` — SCHEMA-01..07 (note: `repoUrl` singular wording
  is superseded by D-01 — treat as `repoUrls?: string[]`)
- `.planning/ROADMAP.md` §"Phase 8: Project Schema Extension" — goal + 4
  success criteria (SC2 `repoUrl?: string` wording superseded by D-01)

### Project decisions & discipline
- `CLAUDE.md` §"Brownfield discipline" — paired FE+BE commit rule;
  §"Stack constraints" — no new prod deps
- `.planning/PROJECT.md` §"Key Decisions" — the three v1.1 GitHub-stats rows
  (separate `repoUrl` field, native `fetch`, daily ISR) + §"v1.1 milestone
  start (2026-05-21)" Q1 resolution
- `.planning/seeds/github-repo-stats.md` — v1.1 feature origin; v1 signal scope

### Paired-repo precedent (v1.0 Phase 6)
- `.planning/STATE.md` §"Performance Metrics" / §"Accumulated Context" — the
  Wave-1 "one-direction-current" paired-SHA citation pattern (BE commit cites a
  pending-FE-SHA placeholder, FE commit cites the BE SHA verbatim, BE never
  amended, durable cross-reference recorded in the plan's SUMMARY.md)

### Files this phase touches
- Frontend: `lib/types.ts` (`Project` interface), `lib/portfolio-data.ts`
  (`PROJECTS` const), `lib/portfolio-data.test.ts` (vitest assertions)
- Backend: `portfolio-services/src/types/content.ts` (`ProjectDto`),
  `portfolio-services/src/models/Project.ts` (Mongoose schema),
  `portfolio-services/src/seed/projects.json`,
  `portfolio-services/src/seed/placeholders.ts` (`placeholderProjects`),
  `portfolio-services/tests/app.test.ts` (`/api/projects` shape spec),
  `portfolio-services/docs/api-contract.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getProjects` controller (`contentController.ts:131`) — already strips
  Mongoose-injected fields (`_id`/`__v`/timestamps) per entry; adding an
  optional field needs no controller change, the destructure-and-strip
  pass-through carries `repoUrls` automatically.
- `lib/api.ts` `getJson<T>` — ISR fetch + silent fallback; `getProjects()`
  returns `Project[]` and falls back to `PROJECTS`. No change needed for an
  additive optional field; it flows through generically.
- `lib/portfolio-data.test.ts` §"PROJECTS content (Wave 07)" — existing vitest
  block (length / 7-field / unique-name assertions) is the natural home for
  the new `repoUrls` assertions (SCHEMA-06).
- `portfolio-services/tests/app.test.ts:151` — existing `/api/projects` shape
  spec; extend it for SCHEMA-05 rather than adding a new file.

### Established Patterns
- **D-14 byte-mirror:** `lib/portfolio-data.ts` `PROJECTS` and
  `portfolio-services/src/seed/projects.json` must hold byte-identical content.
  Currently **broken** (both stale vs. production) — Phase 8 restores it.
- **`strict: 'throw'`** on the Mongoose `Project` schema must be preserved; an
  optional field is additive and does not conflict with strict mode.
- **Paired FE+BE commit, BE-first, one-direction-current SHA citation** —
  established across all v1.0 Phase 6 waves. BE commit body cites a
  pending-FE-SHA placeholder; FE commit cites the BE SHA verbatim; BE is not
  amended; the durable cross-reference is recorded in the plan SUMMARY.md.
- Mongoose array field syntax precedent: `tech: { type: [String], ... }` on
  the same `Project` model — `repoUrls` follows the same `[String]` form,
  optional (no `required`).

### Integration Points
- The new `repoUrls` field is purely additive — no view, route, or render
  code consumes it in Phase 8. Phase 9 (`lib/github.ts`) is the first consumer.
- Production Mongo currently holds the 4 live projects **without** `repoUrls`.
  Phase 8 only adds the field to code/seed/types; pushing `repoUrls` into the
  production database is a re-seed/deploy concern for Phase 11 (or a separate
  operational task) — out of Phase 8 scope.

</code_context>

<specifics>
## Specific Ideas

- Live `GET /api/projects` is the source of truth for project content — the
  executor should `curl` it (Railway:
  `https://personal-portfolio-services-production.up.railway.app/api/projects`)
  to get verbatim `summary`/`tech`/`year`/`status`/`role` rather than copying
  from this document.
- Looper combined-repo decision is deliberate and user-confirmed: both
  `LooperMobile` and `looper-agentic` belong in its `repoUrls`.

</specifics>

<deferred>
## Deferred Ideas

- **Roadmap/requirements sync to plural `repoUrls`:** D-01/D-02/D-03 change the
  field from `repoUrl?: string` to `repoUrls?: string[]`. ROADMAP.md Phase 8
  SC2, Phase 9 (`getRepoStats` signature, GH-01/GH-04 wording), Phase 10
  (LIST-07 / DETAIL-06 "`repoUrl`" references), and REQUIREMENTS.md SCHEMA-*
  text should be updated to the list shape before Phase 9 planning. This is a
  documentation-consistency task, not new scope — recommend a quick edit pass
  after Phase 8 plan approval.
- **Pushing `repoUrls` into production Mongo:** Phase 8 only updates committed
  code/seed. Getting the new field onto the live database (re-seed or manual
  doc update) is a Phase 11 deploy concern.

</deferred>

---

*Phase: 8-Project Schema Extension*
*Context gathered: 2026-05-21*
