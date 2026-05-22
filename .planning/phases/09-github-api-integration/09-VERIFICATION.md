---
phase: 09-github-api-integration
verified: 2026-05-21T03:05:00Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 9/9
  gaps_closed:
    - "WR-01 — getRepoStats could throw when GitHub's /languages endpoint returned an HTTP 200 with a non-object body (null/array/scalar). combineStats called Object.entries on it outside any try/catch in getRepoStats, breaching GH-06 'never throws to callers'."
  gaps_remaining: []
  regressions: []
  note: "WR-01 resolved in commit 88a826f. fetchRepoStats now validates the parsed /languages body — a null, non-object, or array body is treated as a fetch failure and routed through the same disk-cache fallback every other repo failure uses, so combineStats can never receive a non-object. Two new tests added (non-object 200 → null; malformed-languages 200 → disk-cache fallback). Suite grew 21 → 23 (single-file) and 214 → 216 (full). The sole prior human_needed item is now closed by automated evidence; human_verification list is empty."
human_verification: []
---

# Phase 9: GitHub API Integration Verification Report

**Phase Goal:** `lib/github.ts` module fetches three GitHub REST endpoints per repo, combines stats across a project's `repoUrls`, returns typed `GitHubRepoStats | null` with daily ISR cache, token auth, disk-cache fallback, and never throws to callers.
**Verified:** 2026-05-21T03:05:00Z
**Status:** passed
**Re-verification:** Yes — after WR-01 gap closure (commit 88a826f)

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `getRepoStats(repoUrls)` returns a combined `GitHubRepoStats` when at least one repo succeeds (sums commits, merges languages, earliest `createdAt`, latest `pushedAt`) | VERIFIED | `combineStats` at lib/github.ts:213-226; "combine" describe block (byte-merge across two repos, single-repo) passes; full file 23/23 green |
| 2 | `getRepoStats` returns null (never throws) when every repo fails or `repoUrls` is empty/absent | VERIFIED | `Promise.allSettled` at lib/github.ts:248; null guard at line 258; "null paths" block covers 404, 5xx, network error, non-object-200 languages; all pass. WR-01 path now closed — see WR-01 section below |
| 3 | `repoUrls` entries are parsed tolerating trailing slash and `.git` suffix; non-github.com host is skipped; owner/repo is lowercased for dedup and disk-cache keys | VERIFIED | `parseRepoUrl` at lib/github.ts:41-54; hostname check line 48; `.git` strip line 49; lowercase line 53; `parseRepoUrls` Set-dedupe lines 60-72; "URL parsing" + "dedupes case-variant" tests pass |
| 4 | With `GITHUB_TOKEN` set, every fetch carries bearer Authorization; without it, unauthenticated requests + one dev warning | VERIFIED | `ghHeaders()` at lib/github.ts:78-86; `warned` guard at lines 239-246; "auth" block asserts header presence/absence; full suite emits the no-token warning once (observed in test stderr) |
| 5 | Commit count derived from Link-header `rel="last"` page number, falling back to array length | VERIFIED | `commitCountFromLink` at lib/github.ts:93-100; regex `rel="last"` at line 98; "Link-header commit count" block covers rel=last → 247, no-Link → 1, empty → 0 |
| 6 | Live fetches carry `next: { revalidate: 86400 }` for daily ISR; disk cache is a separate failure-only fallback | VERIFIED | Literal `next: { revalidate: 86400 }` at line 158; "endpoints" test asserts `call[1]!.next` equals `{ revalidate: 86400 }` on every call; disk cache consulted only on the failure path (lines 169, 189, 204) |
| 7 | Per-repo fetch failure falls back to last-known disk-cache entry; successful fetches write back to `.next/cache/github-stats.json` | VERIFIED | `readDiskCache`/`writeDiskCacheEntry` at lib/github.ts:120-141; `CACHE_PATH` line 117; wired at lines 169, 189, 201, 204; "disk fallback" block covers write-on-success, 5xx-fallback, fresh+cached mix, no-entry-→-null, malformed-languages-→-disk |
| 8 | Rate-limit headers (`x-ratelimit-remaining`/`x-ratelimit-reset`) logged at dev level on 403/429; rate-limited repo treated as failed | VERIFIED | `logRateLimit` at lib/github.ts:103-110; invoked at line 168 on 403/429; "logs rate-limit headers on a 403" test passes with a `console.warn` spy asserting both header values logged |
| 9 | Vitest covers Link-header parsing, language byte-merge, null-fallback paths, disk-cache fallback, rate-limit log | VERIFIED | 23 tests across 7 describe blocks: URL parsing, auth, endpoints, Link-header, combine, null paths, disk fallback; `npx vitest run lib/github.test.ts` — 23/23 green |

**Score: 9/9 truths verified**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/types.ts` | Exports `GitHubRepoStats` interface with exact GH-07 shape | VERIFIED | Lines 88-98: `createdAt: string`, `pushedAt: string`, `languages: Record<string, number>`, `commitCount: number` — all four fields present with per-field JSDoc |
| `lib/github.ts` | Exports `getRepoStats`, private helpers, min 120 lines | VERIFIED | 260 lines; exports only `getRepoStats`; private helpers `parseRepoUrl`, `parseRepoUrls`, `ghHeaders`, `commitCountFromLink`, `logRateLimit`, `readDiskCache`, `writeDiskCacheEntry`, `fetchRepoStats`, `combineStats` |
| `lib/github.test.ts` | Vitest coverage for GH-01/03/04/05/06/08/09/10, min 120 lines | VERIFIED | 408 lines; 23 tests; 7 describe blocks; `vi.mock("node:fs/promises")` + `vi.stubGlobal("fetch")` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/github.ts` | `lib/types.ts` | `import type { GitHubRepoStats }` | WIRED | Line 12: `import type { GitHubRepoStats } from "./types"` — exact pattern match |
| `lib/github.ts` | `api.github.com` | `native fetch` with `next: { revalidate: 86400 }` | WIRED | Line 158: literal `next: { revalidate: 86400 }` in `init`; no `revalidate: 300` anywhere in file |
| `lib/github.ts` | `.next/cache/github-stats.json` | `node:fs/promises` `readFile`/`writeFile` | WIRED | Line 117: `CACHE_PATH = join(process.cwd(), ".next", "cache", "github-stats.json")`; line 122: `readFile(CACHE_PATH, "utf8")`; line 137: `writeFile(CACHE_PATH, ...)` |

---

## Data-Flow Trace (Level 4)

Not applicable — `lib/github.ts` is a data-fetch module, not a UI rendering component. The data it returns is consumed by Phase 10 (not yet built). The module itself is the data source being verified; its upstream (the GitHub REST API) is exercised through stubbed `fetch` fixtures in all 23 tests.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All github unit tests pass | `npx vitest run lib/github.test.ts` | 23 passed (23) in 15ms | PASS |
| WR-01 — non-object 200 languages body never throws | `vitest run` test "returns null (never throws) when the languages endpoint returns a non-object 200 body" | passes — `getRepoStats` returns `null` | PASS |
| WR-01 — malformed-languages 200 falls back to disk cache | `vitest run` test "a malformed-languages 200 response falls back to the disk-cache entry" | passes — combined result uses the seeded disk entry | PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | exit 0, no output | PASS |
| ESLint clean | `npm run lint` | exit 0, no errors | PASS |
| No `@octokit/rest` installed | `npm ls @octokit/rest` | `(empty)` | PASS |
| Full suite no regression | `npm test` | 216 passed (216), 31 test files | PASS |

---

## Probe Execution

No probes declared in PLAN or SUMMARY. Step 7c: SKIPPED (no probe scripts for this phase).

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| GH-01 | 09-01-PLAN.md | `getRepoStats(repoUrls: string[]): Promise<GitHubRepoStats \| null>` combining stats across repos | SATISFIED | lib/github.ts:233-260; signature exact; `combineStats` performs sum/merge/min/max |
| GH-02 | 09-01-PLAN.md | Native `fetch` only; no new prod dependencies | SATISFIED | `npm ls @octokit/rest` → `(empty)`; `lib/github.ts` imports only `node:fs/promises`, `node:path`, and `./types` |
| GH-03 | 09-01-PLAN.md | `GITHUB_TOKEN` bearer auth when set; unauthenticated fallback + one dev warning | SATISFIED | `ghHeaders()` lines 83-84; `warned` gate lines 239-246; `NODE_ENV !== "production"` guard; "auth" tests pass |
| GH-04 | 09-01-PLAN.md | Three endpoints per repo: `/repos/{o}/{r}`, `/languages`, `/commits?per_page=1`; combine sum/merge/min/max | SATISFIED | Lines 160-164: all three fetches; `combineStats` lines 213-226 |
| GH-05 | 09-01-PLAN.md | `next: { revalidate: 86400 }` daily ISR cache | SATISFIED | Line 158: literal `next: { revalidate: 86400 }`; "endpoints" test asserts it on every call |
| GH-06 | 09-01-PLAN.md | Never throws to callers; missing/private/failed repo contributes nothing; null only when every repo fails | SATISFIED | `fetchRepoStats` body wrapped in try/catch (lines 154-205); `Promise.allSettled` line 248; null guard line 258. **WR-01 closed** — malformed-200 `/languages` body validated at lines 184-190 before reaching `combineStats`; "non-object 200 body" test confirms no throw |
| GH-07 | 09-01-PLAN.md | `GitHubRepoStats` type exported: `{ createdAt, pushedAt, languages, commitCount }` | SATISFIED | lib/types.ts:88-98; exact GH-07 shape with per-field JSDoc |
| GH-08 | 09-01-PLAN.md | Log `x-ratelimit-remaining`/`x-ratelimit-reset` at dev level on rate limit | SATISFIED | `logRateLimit` lines 103-110; lowercase header names per Pitfall 2; "logs rate-limit headers on a 403" test passes |
| GH-09 | 09-01-PLAN.md | Disk-cache outage fallback at `.next/cache/github-stats.json` | SATISFIED | `CACHE_PATH` line 117; `readDiskCache`/`writeDiskCacheEntry`; wired into every `fetchRepoStats` failure path including the new WR-01 guard |
| GH-10 | 09-01-PLAN.md | Vitest covers parser, Link-header, null-fallback, disk-cache fallback | SATISFIED | 23 tests; all 7 describe blocks green covering URL parsing, Link-header, null paths, disk fallback |

**Note on GH-10 / REQUIREMENTS.md:** REQUIREMENTS.md lists GH-01 through GH-10 (ten IDs); PLAN frontmatter claims all ten. GH-10 reads "Vitest unit tests cover the parser logic, Link-header commit-count extraction, null-fallback paths, and disk-cache fallback." The test file covers all four areas. All ten IDs are accounted for, no orphans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/github.ts` | 195 | `languagesJson as Record<string, number>` cast | Info | The cast is now preceded by a runtime structural guard at lines 184-190 (`null` / non-object / array → fetch-failure fallback). The cast only executes once the body is confirmed to be a non-null, non-array object. WR-01 is closed; this is no longer a robustness gap. |
| `lib/github.ts` | 223-224 | `combineStats` uses default `Array.sort()` with no comparator for ISO timestamps | Info | Correct for valid ISO 8601 Z-suffix strings (lexical sort is order-preserving for that format). The WR-01 guard ensures only well-formed `RepoStat` objects reach `combineStats`, so no `undefined` can enter the timestamp arrays. |

No `TBD`, `FIXME`, or `XXX` markers found in any Phase 9 file. Debt-marker gate: PASS.

---

## WR-01 Closure: GH-06 "Never Throws" Now Guaranteed

**Prior gap (from the initial human_needed verification):**

`fetchRepoStats` consumed the `/languages` response with an unchecked `as Record<string, number>` cast. A GitHub HTTP 200 response with a non-object body (`null`, an array, or a scalar) would pass through, leaving `stat.languages` as a non-object. That stat flowed through `Promise.allSettled` into `combineStats`, whose `Object.entries(stat.languages)` call runs **outside any try/catch in `getRepoStats`** — throwing a `TypeError` to the caller and breaching GH-06.

**Fix verified in commit 88a826f (`lib/github.ts:177-190`):**

```ts
const languagesJson = (await langRes.json()) as unknown;
const commits = (await commitsRes.json()) as unknown[];

// GH-06 — a HTTP 200 with a non-object `languages` body (GitHub breaking
// its own API contract) would otherwise reach `Object.entries` in
// combineStats, which runs outside any try/catch and would throw to the
// caller. Treat a structurally-invalid body as a fetch failure.
if (
  languagesJson === null ||
  typeof languagesJson !== "object" ||
  Array.isArray(languagesJson)
) {
  return (await readDiskCache())[key] ?? null;
}
```

The `/languages` body is now parsed as `unknown` and validated before the `as Record<string, number>` cast. A `null`, non-object, or array body short-circuits to `(await readDiskCache())[key] ?? null` — the **same disk-cache fallback path every other repo failure uses** (non-ok status at line 169, thrown error at line 204). `combineStats` can therefore only ever receive a confirmed non-null, non-array object, so `Object.entries` cannot throw and `getRepoStats` cannot throw to the caller.

**Test coverage verified in `lib/github.test.ts`:**

1. **`lib/github.test.ts:242-263`** — "returns null (never throws) when the languages endpoint returns a non-object 200 body": stubs `/languages` to return `new Response("null", { status: 200 })` with valid repo + commits responses, asserts `getRepoStats(...)` resolves to `null` (no throw).
2. **`lib/github.test.ts:366-397`** — "a malformed-languages 200 response falls back to the disk-cache entry": seeds `diskStore["owner/repo"]` with a known `RepoStat`, stubs `/languages` to return `"null"` at status 200, asserts the combined result uses the seeded disk entry (`languages: { TypeScript: 999 }`, `commitCount: 123`) — confirming the malformed body routes through the disk-cache fallback rather than throwing or producing a hollow result.

Both tests pass. `npx vitest run lib/github.test.ts` reports 23/23 green; `npm test` reports 216/216 across 31 files. The WR-01 path is genuinely closed by code inspection and passing automated tests.

---

## Human Verification Required

None. The sole prior human-judgment item (WR-01) has been resolved by a code fix with dedicated test coverage. All 9 observable truths and all 10 GH requirement IDs are verified by direct code inspection and passing automated tests. No item remains that requires human testing.

---

## Gaps Summary

No gaps. The single open item from the prior verification (WR-01 — GH-06 "never throws" under a malformed-200 `/languages` response) is closed: `fetchRepoStats` validates the parsed `/languages` body and treats a structurally-invalid body as a fetch failure, routing it through the existing disk-cache fallback so `combineStats` never receives a non-object. Two new tests lock the behavior. All quality gates pass — `tsc --noEmit` clean, `npm run lint` clean, `@octokit/rest` absent, 23/23 single-file tests, 216/216 full suite. Phase 9 goal is fully achieved.

---

_Verified: 2026-05-21T03:05:00Z_
_Verifier: Claude (gsd-verifier)_
