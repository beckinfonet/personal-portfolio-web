---
phase: 08-project-schema-extension
reviewed: 2026-05-21T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - ../portfolio-services/src/models/Project.ts
  - ../portfolio-services/src/types/content.ts
  - ../portfolio-services/src/seed/projects.json
  - ../portfolio-services/src/seed/placeholders.ts
  - ../portfolio-services/tests/app.test.ts
  - ../portfolio-services/docs/api-contract.md
  - lib/types.ts
  - lib/portfolio-data.ts
  - lib/portfolio-data.test.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 8 adds an optional, additive `repoUrls?: string[]` field to the `Project`
type across the sibling backend (`../portfolio-services/`) and this frontend
repo, and reconciles two project seed/fallback artifacts from a stale 3-entry
list to 4 live entries.

The schema-extension mechanics are sound: the field is genuinely optional on
both the Mongoose schema (no `required`, no `default`) and the TypeScript types,
the JSDoc/comments are thorough and accurate, and `tests/app.test.ts` /
`portfolio-data.test.ts` both grew correct presence + shape assertions. The
frontend `PROJECTS` constant and backend `projects.json` were verified
content-identical (the D-14 mirror invariant holds).

No correctness or security defects were found. The findings below concern
contract-drift risk, a stale fallback artifact, and data-quality inconsistencies
introduced by the seed reconciliation.

## Warnings

### WR-01: Backend `placeholderProjects` not reconciled — drifted from real seed

**File:** `../portfolio-services/src/seed/placeholders.ts:71-82`
**Issue:** The reconciliation updated the real seed (`projects.json`, 4 live
entries) and the frontend fallback (`lib/portfolio-data.ts` `PROJECTS`, 4 live
entries), but the backend's own fallback `placeholderProjects` was only given
the new `repoUrls` field — its *content* was left as the stale single
"Terminal Portfolio" entry. The phase brief explicitly scopes "reconciliation of
two project seed/fallback artifacts from a stale 3-entry list to 4 live
entries"; `placeholderProjects` is a third project artifact that now disagrees
with the other two. If the backend serves `placeholderProjects` when Mongo is
unseeded, `/api/projects` returns a single fictional project ("Terminal
Portfolio") that no longer exists in the real dataset — a recruiter hitting the
site during a DB outage sees stale, wrong content.
**Fix:** Either reconcile `placeholderProjects` to the same 4 live entries as
`projects.json`/`PROJECTS`, or — if the divergence is intentional (placeholder
is a deliberately minimal "DB unseeded" sentinel, as `placeholderApps` is) —
add a one-line comment stating that intent, matching the `placeholderApps`
precedent at line 56 (`'Fallback when Mongo is unseeded. Real apps live in
src/seed/apps.json.'`). Right now the reader cannot tell whether the staleness
is a bug or a decision.

### WR-02: `repoUrls` added to type contract but no controller-side projection guarantee

**File:** `../portfolio-services/docs/api-contract.md:152` / `tests/app.test.ts:178-186`
**Issue:** The API contract and tests now require `repoUrls` to round-trip
through `GET /api/projects` (test line 177 asserts at least one entry carries a
non-empty `repoUrls`). This only holds if the `getProjects` controller does not
use an explicit field projection / `.select()` that would silently drop the new
field. The controller itself (`src/controllers/*` / `src/routes/*`) is not in
the phase-8 file set, so this review cannot confirm the field actually reaches
the response. If the controller projects an explicit allow-list of fields
(a common pattern to strip `_id`/`__v`), `repoUrls` will be omitted and the new
test at line 177 will fail against a seeded DB — or worse, pass only because the
test also accepts a 503.
**Fix:** Verify the `getProjects` controller returns the full document (e.g.
`.lean()` with `_id`/`__v` removed via transform, not an explicit field
allow-list). If it uses an allow-list projection, add `repoUrls` to it in this
same phase. Confirm test line 177 was observed passing against a seeded DB, not
only against the 503 branch.

### WR-03: `repoUrls` HTTPS/format validation lives only in tests — no schema or runtime guard

**File:** `../portfolio-services/src/models/Project.ts:12-15`
**Issue:** The comment states "No ... schema regex — matches the `link`
precedent (HTTPS/format checks live in tests)." Tests validate seed data, not
arbitrary writes. With `strict: 'throw'` the schema rejects unknown keys but
performs zero content validation on `repoUrls`: a write with
`repoUrls: ['javascript:alert(1)']`, `['ftp://...']`, or `['not-a-url']` is
accepted and persisted. Phase 9 will fetch GitHub stats by iterating these URLs;
an un-validated, non-HTTPS or non-github.com value flows straight into that
fetch (SSRF / malformed-request surface). This is acceptable *today* because all
endpoints are public read-only with no write path (api-contract.md line 6:
"Admin/auth deferred to Phase 7"), so the only writer is the trusted seed
script — hence Warning, not Blocker. But the "matches the `link` precedent"
justification is weak: `link` is rendered as an anchor href, whereas `repoUrls`
is destined to be a *fetch target*, which is a materially higher-risk sink.
**Fix:** Before Phase 9 consumes `repoUrls` in a fetch, add validation at the
consumption point (allow-list `https://github.com/<owner>/<repo>` shape) or a
schema-level `match`/validator. At minimum, add a note to the Phase 9 plan that
`repoUrls` entries are untrusted-shaped and must be validated before being used
as fetch targets — do not let the "validated in tests" comment imply runtime
safety.

## Info

### IN-01: `CarEx` project `link` is a bare profile URL, not the project

**File:** `lib/portfolio-data.ts:110` / `../portfolio-services/src/seed/projects.json:39`
**Issue:** `CarEx`'s `link` is `https://github.com/beckinfonet` — the owner's
profile root, not the project's live site or repo. The `repoUrls` for the same
entry correctly point at `.../CarEx` and `.../carEx-services`. The `link` field
is documented as "External link to live site / repo / case study"
(`lib/types.ts:78`); a profile root satisfies none of those. A recruiter
clicking through lands on a generic GitHub profile, not the project. This
predates phase 8 (it was the old "GSD Workflow" entry's link, carried over) but
the reconciliation was the moment to fix it.
**Fix:** Point `CarEx.link` at the project's primary repo
(`https://github.com/beckinfonet/CarEx`) or its live marketplace URL, in both
`projects.json` and `lib/portfolio-data.ts` (keep them byte-identical per D-14).

### IN-02: CarEx and MoveIn appear in both `PROJECTS` and `SHIPPED` with inconsistent `link` treatment

**File:** `lib/portfolio-data.ts:93-112` (PROJECTS) vs `174-196` (SHIPPED)
**Issue:** `CarEx` and `MoveIn` are now entries in both the `PROJECTS` list and
the `SHIPPED` apps list. Within `PROJECTS`, `MoveIn: Real Estate`'s `link` is an
App Store URL (`https://apps.apple.com/.../id6758697464`) while `CarEx`'s `link`
is a GitHub profile URL — two conceptually identical "shipped mobile app"
entries are linked in two different ways. The naming also drifts: `MoveIn: Real
Estate` in `PROJECTS` vs `MoveIn` in `SHIPPED`; `CarEx` matches. This is a
data-consistency smell, not a bug, but it will read as sloppy on the rendered
views where both lists are visible.
**Fix:** Decide one convention for app-backed projects (e.g. `link` always
points to the live store listing or always to the canonical repo) and apply it
uniformly; align the display names across `PROJECTS` and `SHIPPED`.

### IN-03: `repoUrls` repository-name casing is inconsistent

**File:** `lib/portfolio-data.ts:91,101,111` / `../portfolio-services/src/seed/projects.json:20,30,40`
**Issue:** `repoUrls` entries mix casing styles for the same author's repos:
`LooperMobile`, `jaytap-mobile`, `JayTap-services`, `CarEx`, `carEx-services`.
GitHub repo paths are case-insensitive for resolution but case-sensitive in the
API responses and canonical redirects. Phase 9's GitHub-stats fetch may key
caches or dedupe by URL string; mixed casing for what should be a canonical
identifier risks duplicate cache entries or mismatched lookups.
**Fix:** Normalize each `repoUrls` entry to the exact casing GitHub returns as
canonical for that repo (verify against the live GitHub URL). Apply in both the
backend `projects.json` and frontend `PROJECTS` to preserve the D-14 mirror.

### IN-04: New backend test relies only on seed data — no negative-shape coverage

**File:** `../portfolio-services/tests/app.test.ts:170-186`
**Issue:** The phase-8 test additions assert that *seeded* `repoUrls` values are
well-formed HTTPS strings, and that at least one entry carries a non-empty
array. There is no test that the schema *rejects* a malformed `repoUrls` write
(non-string elements, non-array value) or that an entry omitting `repoUrls`
still serializes cleanly (the "Absence" branch at line 178-179 is only exercised
if a seed entry happens to omit it — currently all 4 seed entries include it, so
the `p.repoUrls === undefined` branch is dead in practice). Coverage of the
"optional" half of the contract is therefore notional.
**Fix:** Either add one seed entry that omits `repoUrls` (exercising the
absence branch genuinely), or accept that absence is untested and note it.
Optionally add a model-level unit test that a non-string-array `repoUrls` is
rejected, to lock the schema's typed-array guarantee.

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
