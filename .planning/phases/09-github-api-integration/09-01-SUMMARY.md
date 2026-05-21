---
phase: 09-github-api-integration
plan: 01
subsystem: api
tags: [github-rest-api, fetch, isr, disk-cache, vitest, server-only]

# Dependency graph
requires:
  - phase: 08-project-schema-extension
    provides: "Project.repoUrls?: string[] — the input array getRepoStats consumes"
provides:
  - "lib/github.ts — getRepoStats(repoUrls): Promise<GitHubRepoStats | null> server-only data module"
  - "lib/types.ts GitHubRepoStats interface — { createdAt, pushedAt, languages, commitCount }"
  - "Per-repo GitHub REST fetch with conditional GITHUB_TOKEN bearer auth + daily ISR"
  - "Link-header rel=last commit-count parser"
  - "Per-repo disk-cache outage fallback at .next/cache/github-stats.json"
affects: [10-projects-ui-enrichment, 11-deploy-smoke-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional bearer-auth header construction (ghHeaders) — first request-header builder in the repo"
    - "Promise.allSettled per-item parallel fetch + combine — per-repo isolation so one failure never poisons siblings"
    - "Link-header rel=last parsing for total commit count"
    - "node:fs/promises disk cache as a failure-only outage fallback (orthogonal to Next.js ISR)"
    - "vi.mock(node:fs/promises) + vi.stubGlobal(fetch) — first fetch-stubbing test in the suite"

key-files:
  created:
    - "lib/github.ts — getRepoStats + private fetch/parse/combine/disk-cache helpers"
    - "lib/github.test.ts — 21 Vitest unit tests across GH-01/03/04/05/06/08/09/10"
  modified:
    - "lib/types.ts — appended the GitHubRepoStats interface near Project"

key-decisions:
  - "Disk-cache layer shipped in the Task 2 commit (not Task 3) because the Task 2 null-path tests required node:fs/promises mocking and a working failure path to assert against"
  - "Tests mock node:fs/promises (in-memory diskStore) rather than touching the real .next/cache — prevents cross-test pollution and keeps the suite hermetic"
  - "Inlined the literal next: { revalidate: 86400 } instead of a named constant to satisfy the locked acceptance-criteria grep + must_haves key_links pattern"

patterns-established:
  - "Server-only data module: lib/github.ts reads process.env.GITHUB_TOKEN with no NEXT_PUBLIC_ prefix; never imported by a client island"
  - "Silent-fallback discipline: every fetch/parse/disk op returns null on failure; dev-level console.warn gated on NODE_ENV !== production"
  - "fetch-stubbing test convention: vi.stubGlobal(fetch) with inline Response fixtures + vi.mock(node:fs/promises) for disk-cache isolation"

requirements-completed: [GH-01, GH-02, GH-03, GH-04, GH-05, GH-06, GH-07, GH-08, GH-09, GH-10]

# Metrics
duration: 5min
completed: 2026-05-21
---

# Phase 9 Plan 01: GitHub API Integration Summary

**`lib/github.ts` server-only data module — fetches and combines live GitHub repo stats across a project's `repoUrls` with native `fetch`, conditional `GITHUB_TOKEN` bearer auth, daily ISR, a per-repo disk-cache outage fallback, and 21 Vitest unit tests. Zero new dependencies.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-21T16:07:00Z
- **Completed:** 2026-05-21T16:12:00Z
- **Tasks:** 3
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- `getRepoStats(repoUrls)` combines stats across every repo — sums `commitCount`, merges `languages` byte maps, takes earliest `createdAt` / latest `pushedAt`; returns `null` (never throws) when every repo fails or input is empty.
- `parseRepoUrl` / `parseRepoUrls` — tolerant `https://github.com/{owner}/{repo}` parse with a `github.com` host allow-list, a `/^[\w.-]+$/` SSRF path-injection guard, lowercase normalization, and dedupe (resolves the Phase 8 IN-03 casing inconsistency).
- Conditional `GITHUB_TOKEN` bearer auth with an unauthenticated fallback + one dev warning; Link-header `rel="last"` commit-count parser; rate-limit headers logged on 403/429.
- Per-repo disk-cache outage fallback at `.next/cache/github-stats.json`, keyed by lowercase `owner/repo`, every disk op failure-tolerant.
- 21 Vitest unit tests covering URL parsing, auth, endpoints, Link-header parse, combine, null paths, and disk fallback; full suite 193 → 214 green; `tsc`, `lint`, and `npm run build` (incl. INFRA-05 postbuild grep) all clean.

## Task Commits

Each task was committed atomically (TDD: RED folded into the same commit as GREEN since the new test file imports from `lib/github.ts` and cannot run until the module exists):

1. **Task 1: Export GitHubRepoStats type + scaffold lib/github.ts URL parsing** - `7e0fe66` (feat)
2. **Task 2: Implement per-repo fetch, auth, Link-header parse, and combine** - `1976163` (feat)
3. **Task 3: Finalize disk-cache outage fallback coverage** - `61bbe49` (test)

## Files Created/Modified
- `lib/github.ts` (created) - Server-only module: `getRepoStats` public helper + private `parseRepoUrl`/`parseRepoUrls`/`ghHeaders`/`commitCountFromLink`/`fetchRepoStats`/`combineStats`/`readDiskCache`/`writeDiskCacheEntry` helpers.
- `lib/github.test.ts` (created) - 21 Vitest unit tests; mocks `node:fs/promises` for disk-cache isolation and stubs `globalThis.fetch` with inline `Response` fixtures.
- `lib/types.ts` (modified) - Appended the `GitHubRepoStats` interface near `Project` with the exact GH-07 shape.

## Decisions Made
- **Disk-cache layer landed in the Task 2 commit, not Task 3.** Task 2's null-path tests assert that a 5xx / network-error / 403 repo yields `null` — but that path runs through `fetchRepoStats`'s disk-cache fallback (`readDiskCache()[key] ?? null`). Implementing the disk-cache helpers was a prerequisite for the Task 2 tests to be meaningful, so they shipped together. Task 3 then added the dedicated `disk fallback` test block that exercises the success-write + cache-hit-fallback paths. The plan's `done` criteria for all three tasks are satisfied.
- **Tests mock `node:fs/promises`** with an in-memory `diskStore` object rather than touching the real `.next/cache/`. Without this, `writeDiskCacheEntry` from one passing test pollutes the disk cache read by a later null-path test, causing false failures. The mock keeps the suite hermetic and lets the disk-fallback tests seed `diskStore` directly.
- **Inlined `next: { revalidate: 86400 }`** as a literal instead of a `REVALIDATE_SECONDS` constant — the plan's acceptance criteria and the `must_haves.key_links` pattern both grep for the literal `revalidate:\s*86400`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] node:fs/promises mock added in Task 2 (plan scheduled it for Task 3)**
- **Found during:** Task 2 (per-repo fetch / null-path tests)
- **Issue:** Task 2's null-path tests (`returns null when every repo 5xx`, `network-errors`, `403`) failed because `fetchRepoStats`'s failure path reads the *real* `.next/cache/github-stats.json`, which earlier passing tests in the same run had populated with an `owner/repo` entry — so the "failed" repo found a stale cache hit and returned a non-null object.
- **Fix:** Added `vi.mock("node:fs/promises", ...)` with an in-memory `diskStore` (reset in `beforeEach`) at the top of `lib/github.test.ts`. The mock needed a `default` export because `node:fs/promises` ships one. This is the same mock the plan scheduled for Task 3 — pulling it forward was required for Task 2's tests to pass.
- **Files modified:** lib/github.test.ts
- **Verification:** All 17 Task 2 tests green; all 21 tests green after Task 3.
- **Committed in:** `1976163` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed tsc tuple-type errors on the test fetch-mock signature**
- **Found during:** Task 2 (auth / endpoints test assertions)
- **Issue:** `vi.fn(async (url: string) => ...)` infers a single-element argument tuple, so `fetchMock.mock.calls[0][1]` (the `RequestInit` arg) failed `tsc` with TS2493 ("no element at index 1") + TS2532.
- **Fix:** Widened the mock signature to `(url: string, _init?: RequestInit)` and added non-null assertions (`calls[0][1]!`) at the three init-arg assertion sites.
- **Files modified:** lib/github.test.ts
- **Verification:** `npx tsc --noEmit` exits 0.
- **Committed in:** `1976163` (Task 2 commit)

**3. [Rule 1 - Bug] Inlined the revalidate literal to satisfy the locked verification grep**
- **Found during:** Task 2 (acceptance-criteria check)
- **Issue:** Initial implementation used a `REVALIDATE_SECONDS = 86400` named constant; the plan's acceptance criterion `grep -q "revalidate: 86400"` and the `must_haves.key_links` pattern both require the literal in source.
- **Fix:** Removed the constant and inlined `next: { revalidate: 86400 }` with a `// GH-05` comment.
- **Files modified:** lib/github.ts
- **Verification:** `grep -q "revalidate: 86400" lib/github.ts` succeeds; tests still green.
- **Committed in:** `1976163` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking test-isolation, 2 bug-class — type errors + verification-contract alignment)
**Impact on plan:** All three were necessary for correctness or to satisfy the plan's own locked verification contract. No scope creep — the only structural shift is that the disk-cache mock (planned for Task 3) shipped in the Task 2 commit because Task 2's tests depended on it.

## Issues Encountered
- `npx vitest run -t` cannot be passed multiple `-t` flags in one invocation (it crashes the CAC arg parser). Ran the full single-file suite instead — faster anyway.

## Threat Surface Scan
No new security surface beyond the plan's `<threat_model>`. The module is server-only, reads `GITHUB_TOKEN` with no `NEXT_PUBLIC_` prefix (T-9-01 mitigated), host-allow-lists `github.com` + regex-guards owner/repo (T-9-02), uses the sanitized lowercase `owner/repo` as a flat JSON map key (T-9-03), logs only rate-limit headers never the token (T-9-04), wraps every op to return `null` (T-9-05), and swallows every disk write (T-9-06). No `threat_flag` raised.

## TDD Gate Compliance
This plan's tasks carry `tdd="true"`. The new test file imports `getRepoStats` from `lib/github.ts`, so a standalone RED commit (test-only, no module) would be a transform error rather than a clean test failure. RED was verified locally (the test run errored on the missing import before `lib/github.ts` was created) and GREEN folded into each task's `feat`/`test` commit. The git log shows `feat → feat → test` across the three tasks; behavior was test-first within each task.

## User Setup Required
None for Phase 9. `GITHUB_TOKEN` is read by `lib/github.ts` but is optional — the module works unauthenticated (60/hr). It is provisioned into Vercel Production in Phase 11 (DEPLOY-V11). Local devs may add a read-only PAT to `.env.local` if desired; unit tests stub `fetch` and never hit the network.

## Next Phase Readiness
- `getRepoStats()` and the `GitHubRepoStats` type are ready for Phase 10's `/projects` stat strip and project-detail "Tech highlights" panel. Callers pass `project.repoUrls ?? []`; a `null` return is the "render nothing" signal.
- No blockers. Phase 10 must keep `lib/github.ts` server-only (RSC-only consumption) — the module's server-only contract is set here; Phase 10 verifies the consumer side.

## Self-Check: PASSED

- `lib/github.ts` — FOUND
- `lib/github.test.ts` — FOUND
- `lib/types.ts` GitHubRepoStats — FOUND
- Commit `7e0fe66` — FOUND
- Commit `1976163` — FOUND
- Commit `61bbe49` — FOUND

---
*Phase: 09-github-api-integration*
*Completed: 2026-05-21*
