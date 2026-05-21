---
phase: 08-project-schema-extension
verified: 2026-05-21T15:40:00Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification: []
---

# Phase 8: Project Schema Extension Verification Report

**Phase Goal:** Backend and frontend agree on a new optional `Project.repoUrls?: string[]` field — the contract that every later v1.1 phase compiles against.
**Verified:** 2026-05-21T15:40:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Backend Mongoose Project model accepts optional repoUrls string array without violating strict:'throw' | VERIFIED | `Project.ts` line 15: `repoUrls: { type: [String] }` — no `required`, no `default`; line 17: `{ timestamps: true, strict: 'throw' }` unchanged |
| 2 | Backend ProjectDto type carries optional repoUrls?: string[] field | VERIFIED | `content.ts` line 69: `repoUrls?: string[];` with comment "Phase 8 (SCHEMA-02): optional public GitHub repo URLs for v1.1 stats" |
| 3 | Frontend lib/types.ts Project interface exports repoUrls?: string[] with JSDoc distinguishing it from link | VERIFIED | `lib/types.ts` lines 79-85: multi-line JSDoc names GitHub-stats fetch purpose and explicitly distinguishes from the polymorphic `link` field; `repoUrls?: string[]` at line 85 |
| 4 | projects.json holds 4 live projects with repoUrls populated per D-04/D-06 counts | VERIFIED | `projects.json`: 4 entries — Validation Ledger (1 URL), Looper (2 URLs), MoveIn: Real Estate (2 URLs), CarEx (2 URLs) — exactly matches D-04/D-06 spec; no stale entries remain |
| 5 | lib/portfolio-data.ts PROJECTS byte-mirrors projects.json for all 4 entries including repoUrls | VERIFIED | Field order identical (name, year, status, summary, tech, role, link, repoUrls); all 4 project names, values, and repoUrls values match; D-14 comment updated at line 70-72 |
| 6 | Phase 8 leaves every project's existing polymorphic link value exactly as the live API serves it (D-05) | VERIFIED | `link` values unchanged: Validation Ledger → github/validation-ledger-mobile, Looper → github/looper-agentic, MoveIn → apps.apple.com App Store, CarEx → github.com/beckinfonet |
| 7 | Backend Jest spec asserts repoUrls presence/absence in the /api/projects response shape | VERIFIED | `tests/app.test.ts` lines 174-186: asserts at least one entry has non-empty repoUrls string[]; asserts any present repoUrls element matches `/^https?:\/\//`; _id leakage check at line 168 |
| 8 | Frontend vitest asserts repoUrls is a string[] of HTTPS URLs on every PROJECTS entry where present | VERIFIED | `lib/portfolio-data.test.ts` lines 249-266: two new tests — per-entry shape check (string[], HTTPS pattern) and at-least-one-non-empty guard; 34/34 tests pass |
| 9 | The change ships as one paired BE+FE commit with cross-referenced SHAs | VERIFIED | BE commit `7c9aa25` cites "pending FE SHA" placeholder (one-direction-current); FE commit `b1c8b1b` cites "portfolio-services BE commit 7c9aa25" verbatim; SUMMARY.md records `portfolio-services 7c9aa25 <-> portfolio-web b1c8b1b` |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `portfolio-services/src/models/Project.ts` | Optional repoUrls [String] field on Mongoose schema | VERIFIED | Line 15: `repoUrls: { type: [String] }` — no required, no default, no regex |
| `portfolio-services/src/types/content.ts` | repoUrls?: string[] on ProjectDto | VERIFIED | Line 69: `repoUrls?: string[]` with Phase 8 comment |
| `portfolio-services/src/seed/projects.json` | 4 reconciled live projects with repoUrls | VERIFIED | 4 entries confirmed; all carry repoUrls per D-04 |
| `lib/types.ts` | Project.repoUrls?: string[] with JSDoc | VERIFIED | Lines 79-85: JSDoc present, mentions GitHub-stats + link distinction |
| `lib/portfolio-data.ts` | PROJECTS const reconciled to 4 entries with repoUrls | VERIFIED | Lines 69-113: 4 entries, byte-mirrors projects.json |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/portfolio-data.ts PROJECTS` | `portfolio-services/src/seed/projects.json` | D-14 byte-identical content mirror | VERIFIED | Same 4 entries, same field order, same repoUrls values, same link values |
| `portfolio-services/src/models/Project.ts` | `portfolio-services/tests/app.test.ts` | /api/projects shape spec asserts repoUrls | VERIFIED | Test lines 174-186 assert presence (at-least-one) and HTTPS shape for any present repoUrls |

### Data-Flow Trace (Level 4)

Not applicable for Phase 8. No rendering or dynamic data-flow code is introduced — Phase 8 is a schema/type/seed contract change only. Phase 9 is the first consumer of `repoUrls` in a fetch context.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| FE vitest: repoUrls assertions pass | `npm test -- lib/portfolio-data.test.ts` | 34/34 tests passed | PASS |
| FE tsc: no type errors | `npx tsc --noEmit` | exit 0 (no output) | PASS |
| FE build: INFRA-05 postbuild grep clean | `npm run build` | "INFRA-05: .next/server/ clean (no forbidden strings)" | PASS |
| BE tsc: no type errors | `cd ../portfolio-services && npx tsc --noEmit` | exit 0 (no output) | PASS |

### Probe Execution

No probes declared in PLAN. No conventional `scripts/*/tests/probe-*.sh` files discovered. Step 7c: SKIPPED (no probe scripts).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SCHEMA-01 | 08-01-PLAN.md | Backend Mongoose Project model gains optional repoUrls?: string[] with strict:'throw' preserved | SATISFIED | `Project.ts` line 15 + line 17 confirmed |
| SCHEMA-02 | 08-01-PLAN.md | Backend ProjectDto extended with repoUrls?: string[] | SATISFIED | `content.ts` line 69 confirmed |
| SCHEMA-03 | 08-01-PLAN.md | Frontend lib/types.ts Project gains repoUrls?: string[] with JSDoc clarifying role | SATISFIED | `lib/types.ts` lines 79-85 confirmed |
| SCHEMA-04 | 08-01-PLAN.md | projects.json and lib/portfolio-data.ts byte-mirror each other with repoUrls for 4 entries | SATISFIED | Both files verified field-for-field; D-14 invariant restored |
| SCHEMA-05 | 08-01-PLAN.md | Backend Jest test covers presence/absence of repoUrls in /api/projects shape | SATISFIED | `tests/app.test.ts` lines 174-186 confirmed |
| SCHEMA-06 | 08-01-PLAN.md | Frontend vitest assertions verify repoUrls field on every PROJECTS entry where present | SATISFIED | `lib/portfolio-data.test.ts` lines 249-266 confirmed; tests pass |
| SCHEMA-07 | 08-01-PLAN.md | Schema change ships as paired FE+BE commit per CLAUDE.md brownfield discipline | SATISFIED | BE `7c9aa25` and FE `b1c8b1b` cross-reference confirmed; SUMMARY.md records durable pair |

All 7 SCHEMA-* requirements satisfied. No orphaned requirements (GH-*, LIST-*, DETAIL-*, DEPLOY-V11-* all map to Phases 9-11).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No TBD/FIXME/XXX markers, no placeholder strings, no empty implementations found in phase-8-modified files |

No debt markers. INFRA-05 postbuild grep confirmed clean. The `repoUrls: []` default pattern on Mongoose `[String]` arrays was checked — `repoUrls` has no `default` property, so no empty-array default is registered.

---

### Code Review Warnings (from 08-REVIEW.md — advisory, not blockers)

The code review (0 Blocker, 3 Warning, 4 Info) pre-dates this verification. Per the verification brief, warnings are advisory and do not fail the phase goal. Recorded for completeness:

- **WR-01** (Warning): `placeholderProjects` content left as stale "Terminal Portfolio" entry — not reconciled to 4 live entries. The plan scoped this as "shape-valid entry for shape symmetry" (Claude's-Discretion); the reviewer flags the divergence from `projects.json`/`PROJECTS` as a recruiter-visible data quality risk during DB outage. Actionable before Phase 11 deploy.
- **WR-02** (Warning): No verification that `getProjects` controller does not use an explicit field projection that would silently drop `repoUrls`. The Phase 8 Jest spec tests the 503 branch (DB not ready), so the at-least-one assertion may never execute against a seeded DB in CI. Actionable if the controller uses an allow-list projection.
- **WR-03** (Warning): No Mongoose schema-level URL validation on `repoUrls` — deliberate per Claude's-Discretion, matching the `link` precedent. Risk escalates in Phase 9 when `repoUrls` values become fetch targets. Phase 9 plan must add an allow-list or validation guard at the consumption point.
- **IN-01** (Info): CarEx `link` is `https://github.com/beckinfonet` (owner profile root, not a project link). Pre-Phase-8 data quality issue; D-05 scopes Phase 8 to not touch `link` values.
- **IN-02** (Info): CarEx and MoveIn appear in both PROJECTS and SHIPPED with inconsistent naming (`MoveIn: Real Estate` vs `MoveIn`) and link conventions.
- **IN-03** (Info): `repoUrls` casing inconsistency — `LooperMobile`, `jaytap-mobile`, `JayTap-services`, `CarEx`, `carEx-services`. GitHub is case-insensitive for resolution but case-sensitive in API responses. Phase 9 cache keying may be affected.
- **IN-04** (Info): The "absence" branch of the SCHEMA-05 Jest test is dead code in practice — all 4 seed entries carry `repoUrls`, so `p.repoUrls === undefined` is never exercised.

---

### Human Verification Required

None. Phase 8 delivers no UI changes and no external service integration. All observable truths are verifiable from the codebase.

---

### Gaps Summary

No gaps. All 9 must-have truths are VERIFIED against the actual codebase. Both tsc invocations exit 0, vitest passes 34/34, the production build exits 0 with INFRA-05 clean, and the paired-commit cross-reference is confirmed in both commit messages and SUMMARY.md.

The three code review warnings (WR-01, WR-02, WR-03) are pre-recorded advisory items that do not block the phase goal. WR-03 is the highest-priority carry-forward: Phase 9 plan must add `repoUrls` validation at the `lib/github.ts` fetch boundary.

---

_Verified: 2026-05-21T15:40:00Z_
_Verifier: Claude (gsd-verifier)_
