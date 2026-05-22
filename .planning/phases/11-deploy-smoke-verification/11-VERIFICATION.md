---
phase: 11-deploy-smoke-verification
verified: 2026-05-22T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 11: Deploy + Smoke Verification — Verification Report

**Phase Goal:** Production cutover with `GITHUB_TOKEN` configured, deploy notes documented, real stats observable on https://www.tatibekov.com/projects, and daily-ISR behaviour confirmed.
**Verified:** 2026-05-22
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                         | Status     | Evidence                                                                                                              |
|----|-----------------------------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------|
| 1  | DEPLOY-V11-01: `GITHUB_TOKEN` provisioned in Vercel Production scope                         | VERIFIED   | `11-SMOKE-VERIFICATION.md` §1 records key name + `Sensitive, Production` tag; no token value in any file            |
| 2  | DEPLOY-V11-02: README documents `GITHUB_TOKEN` requirement, scope, and absence consequence    | VERIFIED   | `README.md` lines 39–53: purpose, fine-grained PAT scope, server-only, absence consequence; no `.env.example` refs  |
| 3  | DEPLOY-V11-03: Quality gates (lint, test, build + prebuild/postbuild) all exit 0              | VERIFIED   | 11-01-SUMMARY records 255 tests/33 files, `INFRA-05` postbuild clean; commit `ab8ba3c`                               |
| 4  | DEPLOY-V11-04: At least one production `/projects` card shows real GitHub stats               | VERIFIED   | `11-SMOKE-VERIFICATION.md` §3 records all 4 cards (285/18/874/426 commits) + `curl` HTML evidence                    |
| 5  | DEPLOY-V11-05: Daily ISR confirmed — back-to-back rate-limit probes show no decrement         | VERIFIED   | `11-SMOKE-VERIFICATION.md` §4 records two `rate.remaining` = `4998`; no decrement across `/projects` load            |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact                                                                  | Expected                                                          | Status     | Details                                                                       |
|---------------------------------------------------------------------------|-------------------------------------------------------------------|------------|-------------------------------------------------------------------------------|
| `README.md`                                                               | `## Environment` and `## Deploy` inline all three env vars        | VERIFIED   | Contains `GITHUB_TOKEN` (lines 39, 76); no `.env.example` reference anywhere |
| `.env.example`                                                            | Removed from git tracking                                         | VERIFIED   | `git ls-files` returns empty; file not on disk; deleted in commit `c81bc5f`   |
| `11-PROVISIONING-GUIDE.md`                                                | Owner-facing PAT + Vercel dashboard steps; min 30 lines           | VERIFIED   | 113 lines; covers fine-grained PAT (D-01), Vercel dashboard (D-02), `vercel env ls` (D-03), explicit "must never write token to repo" |
| `11-SMOKE-VERIFICATION.md`                                                | Completed smoke + ISR record with observed values; min 25 lines   | VERIFIED   | 174 lines; all result slots filled; overall PASS verdict; §3 includes `curl` HTML evidence |

---

### Key Link Verification

| From                                 | To                          | Via                                               | Status   | Details                                                                                      |
|--------------------------------------|-----------------------------|---------------------------------------------------|----------|----------------------------------------------------------------------------------------------|
| `README.md ## Environment`           | `.env.local` setup          | Inline var list replacing `cp .env.example`       | VERIFIED | `GITHUB_TOKEN`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL` all present with purpose lines |
| Vercel Production env                | `lib/github.ts` bearer auth | `GITHUB_TOKEN` read at build/ISR time             | VERIFIED | Smoke doc confirms `rate.remaining = 4998` (authenticated 5000/hr bucket, not 60/hr)        |
| `https://www.tatibekov.com/projects` | GitHub REST API             | `lib/github.ts getRepoStats` with daily revalidate| VERIFIED | `curl` evidence shows 4 `gh-token` strip spans in production HTML; ISR confirmed non-decrement |

---

### Data-Flow Trace (Level 4)

Not applicable to this phase. Phase 11 is provisioning + documentation + verification only — no application source code was added. Phases 9 and 10 built and verified the data-flow path (`lib/github.ts` → `/projects` page). This phase proves that path operates correctly in production via the smoke-verification document.

---

### Behavioral Spot-Checks

| Behavior                                        | Command                                                           | Result                                          | Status |
|-------------------------------------------------|-------------------------------------------------------------------|-------------------------------------------------|--------|
| README contains `GITHUB_TOKEN`, no `.env.example` | `grep 'GITHUB_TOKEN' README.md && ! grep '.env.example' README.md` | `GITHUB_TOKEN` found; `.env.example` absent    | PASS   |
| `.env.example` not tracked                      | `git ls-files .env.example` (empty output)                        | Empty — not tracked; file not on disk           | PASS   |
| Commit `c81bc5f` contains both changes atomically | `git show c81bc5f --name-status`                                  | `D .env.example` + `M README.md` in same commit | PASS   |
| All documented commit hashes exist              | `git cat-file -e` for c81bc5f, ab8ba3c, 6cd4d15, b7160e3, 03f10b3 | All 5 hashes: EXISTS                           | PASS   |
| No token values in committed files              | `grep -rn 'ghp_\|github_pat_'` across phase dir + README          | NO TOKEN VALUES FOUND                           | PASS   |
| No debt markers (TBD/FIXME/XXX)                 | `grep -rn 'TBD\|FIXME\|XXX'` across phase dir + README            | NONE FOUND                                      | PASS   |

---

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes declared or applicable for this provisioning + documentation phase. The smoke-verification document (`11-SMOKE-VERIFICATION.md`) is the phase's authoritative verification record — it was executed by the repo owner at human-in-the-loop checkpoints, as designed.

---

### Requirements Coverage

| Requirement    | Source Plan | Description                                                                                    | Status    | Evidence                                                                                     |
|----------------|-------------|------------------------------------------------------------------------------------------------|-----------|----------------------------------------------------------------------------------------------|
| DEPLOY-V11-01  | Plan 02     | `GITHUB_TOKEN` env var added to Vercel Production scope (read-only public-repo scope)          | SATISFIED | `11-SMOKE-VERIFICATION.md` §1: key name `GITHUB_TOKEN`, `Sensitive`, `Production` — confirmed 2026-05-22 |
| DEPLOY-V11-02  | Plan 01     | README/deploy notes document `GITHUB_TOKEN` requirement, scope, and absence consequence        | SATISFIED | `README.md` § `## Environment` lines 39–53 and `## Deploy` lines 73–80                      |
| DEPLOY-V11-03  | Plan 01     | `npm run build`, `npm run lint`, `npm test`, INFRA-05 postbuild all green                     | SATISFIED | 11-01-SUMMARY: all exit 0; 255 tests/33 files; `✓ INFRA-05: .next/server/ clean`            |
| DEPLOY-V11-04  | Plan 02     | At least one production project card shows real GitHub stats (smoke test `/projects`)          | SATISFIED | `11-SMOKE-VERIFICATION.md` §3: all 4 cards verified; `curl` text evidence; blocker resolved |
| DEPLOY-V11-05  | Plan 02     | Daily ISR confirmed via second-load timing (no per-request GitHub call)                        | SATISFIED | `11-SMOKE-VERIFICATION.md` §4: `rate.remaining` 4998 == 4998 across `/projects` reload      |

All 5 DEPLOY-V11-01..05 requirements are satisfied. No orphaned requirements — REQUIREMENTS.md maps exactly these 5 IDs to Phase 11, and both plans together claim all 5 (Plan 01: 02, 03; Plan 02: 01, 04, 05).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | No debt markers, no placeholder text, no leaked token values in any phase artifact or README |

---

### Human Verification Required

None. The three human-in-the-loop checkpoints (token provisioning, deploy observation, rate-limit probes) are runtime/external facts that required the repo owner's GitHub/Vercel credentials. They were performed by the owner and recorded with concrete observed evidence in `11-SMOKE-VERIFICATION.md`:

- GITHUB_TOKEN presence: Vercel dashboard row captured (key name + scope only)
- Production deploy: commit `6cd4d15` deployed, `/projects` returns HTTP 200
- Real stats: curl output shows 4 `gh-token` strip spans with specific commit counts
- ISR confirmation: two `rate.remaining = 4998` probes recorded with interpretation

No further human verification is outstanding.

---

### Production Blocker Note (Resolved)

A blocker surfaced during the smoke test: the production Railway MongoDB had never been re-seeded after Phase 8 added the `repoUrls` field, so `GET /api/projects` returned all 4 projects without `repoUrls`, causing every card to degrade to no strip (correct graceful-degradation behaviour per LIST-07). This was NOT a portfolio-web defect.

The fix was a surgical backfill (`portfolio-services/scripts/backfill-project-repourls.mjs`) that `$set` only `repoUrls` on the 4 project documents by name, touching no other field. A full `npm run seed` was correctly rejected (seed files have drifted behind hand-edited production values). The backfill lives in the sibling `portfolio-services` repo. After the backfill, all 4 cards rendered real stats. This is documented in `11-SMOKE-VERIFICATION.md` §3 and the 11-02-SUMMARY.

---

### Gaps Summary

No gaps. All 5 must-haves are verified. The phase goal is fully achieved.

---

_Verified: 2026-05-22_
_Verifier: Claude (gsd-verifier)_
