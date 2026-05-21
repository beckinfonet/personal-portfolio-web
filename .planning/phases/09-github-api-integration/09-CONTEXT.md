# Phase 9: GitHub API Integration - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

> Captured in `--auto` mode — every gray area below was auto-resolved to its
> recommended default. Review and edit before planning if any default is wrong.

<domain>
## Phase Boundary

Phase 9 delivers one new server-side module: `lib/github.ts`. It fetches live
GitHub repo statistics for every URL in a project's `repoUrls`, combines them
into a single typed `GitHubRepoStats` value, and never throws to its callers.
It exports `getRepoStats(repoUrls: string[]): Promise<GitHubRepoStats | null>`
and the `GitHubRepoStats` type. Daily ISR cache, `GITHUB_TOKEN` auth with an
unauthenticated fallback, a disk-cache outage fallback, and vitest unit
coverage are all in scope.

**Not in this phase:** any UI or rendering (the stat strip and the detail
"Tech highlights" panel are Phase 10); the `repoUrls` schema field itself
(shipped in Phase 8); `GITHUB_TOKEN` provisioning in Vercel Production
(Phase 11). Phase 9 is a pure data-layer module, testable in isolation
against fixtures.

</domain>

<decisions>
## Implementation Decisions

### URL parsing & normalization
- **D-01:** Parse each `repoUrls` entry as `https://github.com/{owner}/{repo}`,
  tolerating a trailing slash and an optional `.git` suffix. Any entry whose
  host is not `github.com` is skipped — it contributes nothing to the combined
  stats (recommended default; `repoUrls` are all GitHub URLs today, but the
  parser must not throw on a non-GitHub entry).
- **D-02:** Normalize `{owner}/{repo}` to lowercase for de-duplication and for
  disk-cache keys. GitHub's REST path is case-insensitive, so the lowercase
  form is also used for the API call. This resolves the IN-03 casing-
  inconsistency finding from the Phase 8 code review (`repoUrls` entries mix
  `LooperMobile`, `jaytap-mobile`, `CarEx`, `carEx-services`).

### Combine semantics
- **D-03:** Fetch each repo in `repoUrls` independently and in parallel, then
  combine the successes — sum `commitCount`, merge `languages` byte maps (add
  bytes per language key), take the earliest `created_at` and the latest
  `pushed_at`. A repo that fails (404 / private / 5xx / rate-limit / parse
  error) contributes nothing. `getRepoStats` returns `null` only when every
  repo fails or `repoUrls` is empty/absent (GH-06).
- **D-04:** Commit count comes from `GET /repos/{o}/{r}/commits?per_page=1` —
  parse the `Link` header's `rel="last"` page number. When no `Link` header is
  present (the repo has 0 or 1 commits), `commitCount` is the length of the
  returned array.

### Caching
- **D-05:** Two orthogonal cache layers. Live fetches use
  `next: { revalidate: 86400 }` (daily ISR — mirrors `lib/api.ts`, GH-05). The
  disk cache is strictly a deploy-time outage fallback — consulted only when a
  live fetch fails, never as the primary read path.
- **D-06:** The disk cache lives at `.next/cache/github-stats.json` (GH-09's
  example path; Vercel restores `.next/cache/` between builds). Granularity is
  per-repo, keyed by the normalized lowercase `owner/repo` — so one failing
  repo falls back to its own last-known entry while sibling repos still fetch
  fresh. The combine step (D-03) runs over the resulting mix of fresh and
  disk-cached per-repo stats. Successful fetches write their entry back to the
  cache file.

### Auth & rate limits
- **D-07:** When `GITHUB_TOKEN` (read-only public-repo scope) is present, send
  it as a bearer `Authorization` header on every request. When absent, fall
  back to unauthenticated requests and emit one dev-level warning about the
  60/hr ceiling (GH-03). On a `403` with `X-RateLimit-Remaining: 0`, treat the
  repo as a failed fetch (→ disk fallback per D-06) and log the
  `X-RateLimit-Remaining` / `X-RateLimit-Reset` headers at dev level (GH-08).

### Claude's Discretion
- The internal helper decomposition of `lib/github.ts` (URL parser, per-repo
  fetcher, Link-header parser, combiner, disk-cache reader/writer) is left to
  the planner/researcher — only the public surface (`getRepoStats`,
  `GitHubRepoStats`) and decisions D-01..D-07 are locked.
- The phase-researcher should verify current GitHub REST API specifics against
  live docs before planning: the exact `Link`-header format, the `/languages`
  response shape, and the precise rate-limit header names/casing.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope (binding)
- `.planning/ROADMAP.md` — "Phase 9: GitHub API Integration" section: phase
  goal + 4 success criteria
- `.planning/REQUIREMENTS.md` — GH-01 through GH-10, the binding requirement
  list (every implementation decision above traces to one of these)
- `.planning/seeds/github-repo-stats.md` — design rationale, the three v1
  recruiter signals, and the explicitly-dropped v1 signals (test coverage /
  CI status)

### Patterns to mirror
- `lib/api.ts` — the ISR-cached `fetch` + silent-fallback pattern that
  `lib/github.ts` adapts (GH-05); note `next: { revalidate }` usage
- `lib/types.ts` — where `GitHubRepoStats` is exported (GH-07); also defines
  `Project.repoUrls?: string[]`, the input to `getRepoStats`
- `.planning/phases/08-project-schema-extension/08-REVIEW.md` — WR-03 (no
  runtime URL validation on `repoUrls`) and IN-03 (repo-name casing
  inconsistency) — Phase 8 code-review findings that Phase 9 must handle
  (D-01, D-02)

### Project rules
- `CLAUDE.md` — stack constraints: native `fetch` only, no new prod deps
  (`@octokit/rest` explicitly rejected), RSC discipline, two-prod-dep budget

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/api.ts` `getJson<T>` — the template for an ISR-cached `fetch` wrapped in
  a try/catch silent fallback. `lib/github.ts` adapts it: a per-repo fetch
  loop, `Link`-header parsing, and a disk-cache fallback layer on top.
- vitest with co-located `*.test.ts` files (e.g. `lib/portfolio-data.test.ts`)
  — the test harness for GH-10; fixtures can stub `fetch` responses.

### Established Patterns
- Every `fetch` carries `next: { revalidate: N }` — `lib/api.ts` uses 300s;
  `lib/github.ts` uses 86400s (GH-05).
- Server-only data modules: `lib/github.ts` is consumed by RSC project pages
  in Phase 10 — it must never be imported into a client island.

### Integration Points
- Input: `Project.repoUrls?: string[]` (shipped in Phase 8).
- Output: `getRepoStats()` is consumed by Phase 10's `/projects` stat strip and
  the project-detail "Tech highlights" panel.
- New env var `GITHUB_TOKEN` — read by this module, provisioned into Vercel
  Production in Phase 11 (DEPLOY-V11).

</code_context>

<specifics>
## Specific Ideas

- The Phase 10 stat-strip format target (from the seed) is
  `247 commits · TS / CSS · 4mo` — this informs the `GitHubRepoStats` shape
  (`commitCount`, `languages`, `createdAt`) but the rendering itself is Phase 10.
- v1 deliberately surfaces only three signals (real/mature, stack breadth,
  active) — test-coverage and CI-status signals are out of scope per the seed.

</specifics>

<deferred>
## Deferred Ideas

- Test-coverage / CI-status / quality-rigor signals — not GitHub-native; the
  seed defers reconsideration to v1.2.

</deferred>

---

*Phase: 9-GitHub API Integration*
*Context gathered: 2026-05-21*
