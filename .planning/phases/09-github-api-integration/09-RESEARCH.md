# Phase 9: GitHub API Integration - Research

**Researched:** 2026-05-21
**Domain:** GitHub REST API consumption from a Next.js 15 server-side data module
**Confidence:** HIGH

## Summary

Phase 9 delivers one server-only module, `lib/github.ts`, that fetches live GitHub
repo statistics for every URL in a project's `repoUrls`, combines them into a single
typed `GitHubRepoStats` value, and never throws to callers. Every requirement
(GH-01..GH-10) maps to a locked context decision (D-01..D-07). The phase is a pure
data-layer slice — no UI, no rendering — and is fully testable in isolation by stubbing
`globalThis.fetch`.

The technical surface is small and well-understood. GitHub's REST API behaviors that
matter here were verified live this session against `api.github.com` (API version
`2022-11-28`): the `Link` header on `GET /commits?per_page=1` carries a
`rel="last"` page number that equals the total commit count; rate-limit headers are
lowercase `x-ratelimit-*`; private repos return `404` (not `403`); and an exhausted
rate limit returns `403`/`429` with `x-ratelimit-remaining: 0`. The module mirrors the
`lib/api.ts` ISR + silent-fallback pattern, swapping `revalidate: 300` for `86400` and
adding a `Link`-header parser, a per-repo parallel fetch/combine step, and a disk-cache
outage fallback.

**Primary recommendation:** Build `lib/github.ts` as ~6 small pure helpers (URL parser,
per-repo fetcher, Link-header commit-count parser, combiner, disk-cache read, disk-cache
write) behind the single public `getRepoStats(repoUrls)` async function. Use native
`fetch` with bearer auth, `next: { revalidate: 86400 }`, and `X-GitHub-Api-Version:
2022-11-28`. Every fetch path returns `null` on failure rather than throwing; the
combine step runs `Promise.allSettled` over per-repo results so one failing repo never
poisons its siblings. Zero new dependencies — `node:fs/promises` and `node:path` cover
the disk cache.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| GitHub REST fetch + auth | API / Backend (Next.js server) | — | `GITHUB_TOKEN` is a server secret; must never reach the client bundle. `lib/github.ts` is server-only, consumed by RSC pages in Phase 10. |
| ISR caching of GitHub responses | API / Backend (Next.js Data Cache) | — | `next: { revalidate }` is a server-side `fetch` extension; the Next.js Data Cache lives on the server/build host. |
| Disk-cache outage fallback | Database / Storage (`.next/cache/`) | API / Backend | `.next/cache/` is the build host's persistent store; Vercel restores it between builds. Written/read only by the server module. |
| URL parsing & normalization | API / Backend | — | Pure logic; runs server-side as part of `getRepoStats`. |
| Stat combination (sum/merge/min/max) | API / Backend | — | Pure reduce over per-repo results; no tier ambiguity. |
| Rendering the stat strip / panel | (Phase 10 — out of scope) | — | Explicitly deferred; Phase 9 only returns the typed value. |

**Why this matters:** The single tier risk in this phase is `GITHUB_TOKEN` leaking to
the client. `lib/github.ts` MUST never be imported into a `"use client"` island. Plan
verification should grep that no client component imports `@/lib/github` and that
`getRepoStats` is only ever awaited inside an RSC (Phase 10's concern, but the module's
server-only contract is set here).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| native `fetch` | Node 20.19.1 / Next.js 15.3.2 | All three GitHub REST calls | `[VERIFIED: CLAUDE.md]` Project mandates native `fetch` only; `@octokit/rest` explicitly rejected. Next.js patches `fetch` to add `next: { revalidate }`. |
| `node:fs/promises` | Node 20.19.1 builtin | Disk-cache read/write (`readFile`/`writeFile`/`mkdir`) | `[VERIFIED: node --version → v20.19.1]` Builtin — zero dep cost. Async API matches the module's async surface. |
| `node:path` | Node 20.19.1 builtin | Build the `.next/cache/github-stats.json` path via `join(process.cwd(), ...)` | Builtin. `lib/api.ts` precedent uses `process.cwd()`-relative paths elsewhere in the project (Phase 5 OG fonts). |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | 3.1.4 (devDep, installed) | GH-10 unit tests | `[VERIFIED: STACK.md]` Already the project test runner. `vi.stubGlobal("fetch", ...)` stubs the network. |
| `@vitejs/plugin-react` | 4.4.1 (devDep, installed) | Vitest TSX transform | Already wired; `lib/github.test.ts` is plain `.ts` so the React plugin is incidental. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| native `fetch` + manual `Link` parse | `@octokit/rest` | **Explicitly rejected by CLAUDE.md + GH-02 + D-07.** Octokit handles pagination/auth but is a ~3MB prod dep that breaks the two-prod-dep budget. Do not reconsider. |
| `.next/cache/github-stats.json` disk cache | Next.js `unstable_cache` / Data Cache only | Data Cache alone does not survive a GitHub *outage during `next build`* — if the API is down at build time the ISR cache has nothing to serve. The disk cache is the deploy-time outage floor (D-05/D-06). Both layers are needed. |
| Parsing `Link` `rel="last"` page number | `GET /repos/{o}/{r}` `size` or contributor stats | `[CITED: docs.github.com]` There is no direct "total commits" field in the REST API. `Link` header `rel="last"` on `per_page=1` is the canonical idiom. |

**Installation:**
```bash
# No installation. Zero new prod or dev dependencies.
# fetch, node:fs/promises, node:path are runtime builtins; vitest is already installed.
```

**Version verification:** No new packages — nothing to version-check. Node confirmed
`v20.19.1` (`[VERIFIED: node --version]`), Next.js `15.3.2` (`[VERIFIED: STACK.md]`),
GitHub REST API version `2022-11-28` is current and was returned live this session
(`[VERIFIED: curl -sI api.github.com → x-github-api-version-selected: 2022-11-28]`).

## Architecture Patterns

### System Architecture Diagram

```
                getRepoStats(repoUrls: string[])
                            |
                            v
         +-------------------------------------+
         | parseRepoUrls(repoUrls)             |  D-01 / D-02
         | - parse https://github.com/{o}/{r}  |
         | - tolerate trailing / and .git      |
         | - skip non-github.com hosts         |
         | - lowercase {owner}/{repo}, dedupe  |
         +-------------------------------------+
                            |
            [ {owner, repo} list, deduped ]
                            |
              Promise.allSettled  (parallel, D-03)
              /             |              \
             v              v               v
   fetchRepoStats(o,r)  fetchRepoStats   fetchRepoStats   <-- per repo
        |
        | 3 parallel fetches, bearer auth (D-07), revalidate 86400 (D-05)
        +--> GET /repos/{o}/{r}            -> created_at, pushed_at
        +--> GET /repos/{o}/{r}/languages  -> { "TypeScript": 12345, ... }
        +--> GET /repos/{o}/{r}/commits?per_page=1 -> Link header
        |
        |  ok? -> build per-repo RepoStat   -> writeDiskCache(key, stat)
        |  fail (404/403/5xx/parse/network)?
        |         -> readDiskCache(key)  (D-06 per-repo fallback)
        |         -> still nothing? this repo contributes nothing
        v
   per-repo RepoStat | null
                            |
            [ mix of fresh + disk-cached + null ]
                            |
                            v
         +-------------------------------------+
         | combineStats(results)               |  D-03
         | - sum commitCount                   |
         | - merge languages (add bytes/key)   |
         | - earliest createdAt (min)          |
         | - latest pushedAt (max)             |
         +-------------------------------------+
                            |
              all repos failed / empty input?
               yes -> return null  (GH-06)
               no  -> return GitHubRepoStats
```

### Recommended Project Structure
```
lib/
├── github.ts          # NEW — getRepoStats + GitHubRepoStats type + private helpers
├── github.test.ts     # NEW — co-located vitest unit tests (GH-10)
├── types.ts           # MODIFIED — re-export GitHubRepoStats (GH-07; see Pattern 5)
└── api.ts             # UNCHANGED — the pattern lib/github.ts mirrors
```

`GitHubRepoStats` should be **defined in `lib/types.ts`** (the single-source-of-truth
for domain types, per `lib/types.ts` header comment) and imported by `lib/github.ts`.
Helper functions stay private to `lib/github.ts` (no barrel, per CONVENTIONS.md).
Decompose into the helpers shown in the diagram — D-07 leaves the exact decomposition to
the planner; the diagram is the recommended cut.

### Pattern 1: ISR-cached fetch with silent fallback (adapt `lib/api.ts`)
**What:** Every `fetch` carries `next: { revalidate: N }` and is wrapped in
`try/catch` that returns a fallback instead of throwing.
**When to use:** Every GitHub call in this module.
**Example:**
```typescript
// Source: lib/api.ts (project precedent) + Next.js 15 fetch caching
// [VERIFIED: lib/api.ts read this session]
const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
  headers: ghHeaders(),               // see Pattern 2
  next: { revalidate: 86400 }         // GH-05 — daily ISR
});
if (!res.ok) return null;             // GH-06 — never throw on a bad status
```
**Key difference from `lib/api.ts`:** `lib/api.ts` returns a *typed fallback constant*;
`lib/github.ts` returns `null` (GH-06) or a disk-cached entry (GH-09). There is no
"static GitHub stats" constant — `null` is the no-data signal.

### Pattern 2: Conditional bearer auth (D-07 / GH-03)
**What:** Build the request headers once; include `Authorization` only when
`GITHUB_TOKEN` is set.
**Example:**
```typescript
// [CITED: docs.github.com/en/rest/authentication/authenticating-to-the-rest-api]
function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"   // [VERIFIED: live api.github.com response]
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
```
- `Authorization: Bearer <token>` is the modern form and works for classic PATs,
  fine-grained PATs, and JWTs. `Authorization: token <token>` also works for PATs but
  not JWTs — prefer `Bearer`. `[CITED: docs.github.com authenticating-to-the-rest-api]`
- The one-line 60/hr dev warning (GH-03) should fire **once per module load when the
  token is absent**, not once per fetch. A module-scope `let warned = false` guard, or
  emit it inside `getRepoStats` gated on `process.env.NODE_ENV !== "production"`.

### Pattern 3: Commit count from the `Link` header (D-04 / GH-04)
**What:** `GET /repos/{o}/{r}/commits?per_page=1` returns one commit per page; the
`Link` header's `rel="last"` page number equals the total commit count.
**Verified live this session** against `vercel/next.js`:
```
link: <https://api.github.com/repositories/70107786/commits?per_page=1&page=2>; rel="next",
      <https://api.github.com/repositories/70107786/commits?per_page=1&page=34062>; rel="last"
```
`[VERIFIED: curl -sI api.github.com/repos/vercel/next.js/commits?per_page=1]`
**Parsing rules:**
- Read the header case-insensitively: `res.headers.get("link")` — the `Headers` object
  is case-insensitive, the wire header is lowercase `link`.
- Extract the `page` query value of the segment ending `; rel="last"`. A robust regex:
  `/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/`.
- **No `Link` header** → the repo has 0 or 1 commits → `commitCount` is the length of
  the returned JSON array (`0` for an empty repo, `1` for a single-commit repo). D-04
  mandates this branch. `[CITED: docs.github.com using-pagination-in-the-rest-api —
  "When all results fit on a single page, the link header will be omitted."]`
- The `Link` value may also contain `rel="next"`, `rel="prev"`, `rel="first"` — match
  specifically on `rel="last"`, do not assume segment order. `per_page` may appear
  before or after `page` in the URL — the regex above does not depend on order.

### Pattern 4: Combine across repos (D-03 / GH-04)
**What:** Fetch each repo independently and in parallel, combine the successes.
**Example:**
```typescript
const settled = await Promise.allSettled(
  repos.map(({ owner, repo }) => fetchRepoStats(owner, repo))
);
const stats = settled
  .filter((s): s is PromiseFulfilledResult<RepoStat> =>
    s.status === "fulfilled" && s.value !== null)
  .map(s => s.value);
if (stats.length === 0) return null;       // GH-06 — every repo failed (or empty input)

return {
  commitCount: stats.reduce((n, s) => n + s.commitCount, 0),
  languages: mergeLanguages(stats.map(s => s.languages)),  // add bytes per key
  createdAt: stats.map(s => s.createdAt).sort()[0],        // earliest (ISO sorts lexically)
  pushedAt:  stats.map(s => s.pushedAt).sort().at(-1)!     // latest
};
```
- `fetchRepoStats` should itself **return `null` on any failure** (never reject), so
  `Promise.allSettled` is belt-and-braces — but use it anyway so an unforeseen throw in
  a helper still cannot poison siblings (GH-06).
- ISO 8601 timestamps (`created_at`, `pushed_at`) sort correctly with a plain string
  sort — no `Date` parsing needed for min/max. `[VERIFIED: ISO 8601 lexical ordering]`
- Empty or absent `repoUrls` → `parseRepoUrls` yields `[]` → return `null` (GH-01/GH-06).

### Pattern 5: Where the type lives (GH-07)
Define and export `GitHubRepoStats` in `lib/types.ts` (domain-type SoT). `lib/github.ts`
imports it with `import type`. CONTEXT.md / GH-07 require the exact shape:
```typescript
// lib/types.ts
/** Combined GitHub stats across a project's repoUrls — Phase 9 / GitHub-stats fetch. */
export interface GitHubRepoStats {
  /** Earliest created_at across all repos (ISO 8601 date-time). */
  createdAt: string;
  /** Latest pushed_at across all repos (ISO 8601 date-time). */
  pushedAt: string;
  /** Merged language byte map — bytes summed per language key. */
  languages: Record<string, number>;
  /** Summed commit count across all repos. */
  commitCount: number;
}
```

### Anti-Patterns to Avoid
- **Importing `lib/github.ts` into a client island.** `GITHUB_TOKEN` would be inlined
  into the client bundle. Module is server-only; Phase 10 consumes it from RSCs.
- **Throwing on a bad repo.** GH-06 is absolute — a 404/private/5xx/parse error for one
  repo is a skipped repo, not an exception. Every helper returns `null` on failure.
- **Treating the disk cache as the primary read path.** D-05: the disk cache is
  consulted *only* when a live fetch fails. The happy path is always a live `fetch`
  (served from the Next.js Data Cache between revalidations).
- **Caching by raw URL string.** IN-03: `repoUrls` mix casing (`CarEx` vs `carEx-services`).
  D-02 mandates lowercasing `owner/repo` for dedup and for the disk-cache key.
- **Adding a `try/catch` that swallows then re-throws.** Swallow and return `null`.
- **Using `Date.parse` for min/max.** ISO 8601 strings sort lexically — a plain
  `.sort()` is correct and avoids timezone-parsing edge cases.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP request + retry/auth | A custom HTTP client or `@octokit/rest` | native `fetch` + `next: { revalidate }` | CLAUDE.md / GH-02 mandate; Next.js Data Cache already gives one-fetch-per-day dedup. |
| Total-commit count | Walking every `/commits` page and counting | Parse `Link` `rel="last"` page number on `per_page=1` | One request instead of thousands; this is the canonical GitHub idiom. |
| ISO timestamp min/max | A date library (`date-fns`, `dayjs`) | `Array.prototype.sort()` on the raw strings | ISO 8601 sorts lexically; a date dep breaks the two-prod-dep budget. |
| Build-time outage resilience | A bespoke retry/backoff loop | Disk cache at `.next/cache/github-stats.json` | D-06: a failed fetch falls back to the last-known per-repo entry; simpler and deterministic. |
| Case-insensitive header read | Manual header-key lowercasing | `res.headers.get("link")` | The Fetch `Headers` object is already case-insensitive. |

**Key insight:** Almost every "feature" in this module is a small pure function over a
`Response`. The only genuine complexity is the `Link`-header parse and the
fresh/disk-cached/null three-way merge — both are < 15 lines and fully unit-testable
against fixture `Response` objects. There is no place a library earns its weight.

## Runtime State Inventory

> Phase 9 is greenfield-additive (one new module + one new disk-cache file + one new
> env var). It renames/migrates nothing. This section is included only to record the
> new runtime state the phase *introduces*.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | NEW: `.next/cache/github-stats.json` — disk cache written by this module. Keyed by lowercase `owner/repo`. Not committed (`.next` is gitignored). | None — created at runtime by the module; no migration. |
| Live service config | None — this phase introduces no external service config. (The GitHub PAT *value* is provisioned in Phase 11, not here.) | None for Phase 9. |
| OS-registered state | None. | None. |
| Secrets/env vars | NEW: `GITHUB_TOKEN` — read by `lib/github.ts` via `process.env.GITHUB_TOKEN`. Local dev: optional, add to `.env.local` (gitignored) if the developer has a PAT. Production: provisioned into Vercel in Phase 11 (DEPLOY-V11). | Add `GITHUB_TOKEN` to `.env.local` for local testing only if desired — module works without it (unauthenticated, 60/hr). No code action beyond reading the var. |
| Build artifacts | None — no package rename, no egg-info / compiled-binary equivalent. | None. |

**Canonical question — "after every file is updated, what runtime systems still have
old state?"** N/A for Phase 9: nothing pre-existing is being renamed. The only new
runtime state is the disk cache (self-creating) and `GITHUB_TOKEN` (read-only).

## Common Pitfalls

### Pitfall 1: 404 vs 403 — private repo and rate-limit are different failures
**What goes wrong:** Code assumes a private repo returns `403`, or assumes any `403` is
a rate-limit hit.
**Why it happens:** Intuition says "forbidden = private." GitHub deliberately inverts
this for security.
**How to avoid:** `[VERIFIED: docs.github.com troubleshooting-the-rest-api + live test]`
- **Private repo / nonexistent repo / token lacks access → `404`.** GitHub returns
  `404` (not `403`) for private resources so it never confirms a private repo exists.
- **Rate limit exhausted → `403` or `429`** with **`x-ratelimit-remaining: 0`**.
- For GH-06 the distinction is mostly academic — *every* non-`ok` status is a skipped
  repo. But GH-08 requires logging the rate-limit headers specifically, so on a `403`
  the module must read `x-ratelimit-remaining` / `x-ratelimit-reset` and log them.
**Warning signs:** A repo you know is public returns `404` → the `GITHUB_TOKEN` is
malformed or revoked, OR the `owner/repo` casing/parsing is wrong.

### Pitfall 2: Rate-limit headers are lowercase `x-ratelimit-*`
**What goes wrong:** Code reads `res.headers.get("X-RateLimit-Remaining")` expecting
a particular casing, or logs the wrong header name.
**Why it happens:** GitHub docs *write* the headers as `X-RateLimit-Remaining`, but the
wire format (HTTP/2) is lowercase.
**How to avoid:** `[VERIFIED: live curl -sI api.github.com → x-ratelimit-remaining: 59,
x-ratelimit-reset: 1779407450, x-ratelimit-limit: 60, x-ratelimit-used: 1]` The Fetch
`Headers` object is case-insensitive — `res.headers.get("x-ratelimit-remaining")` and
`...("X-RateLimit-Remaining")` both work. Pick lowercase for consistency. `x-ratelimit-reset`
is a **Unix epoch seconds** integer, not an ISO string — multiply by 1000 for a JS
`Date` if you format it; logging the raw value is fine for GH-08.
**Warning signs:** GH-08 log line shows `null` for the remaining count → wrong header
name OR reading headers off a thrown/network-error path where no `Response` exists.

### Pitfall 3: `next: { revalidate }` only caches inside a server render/build
**What goes wrong:** A vitest unit test asserts on cache behavior, or the developer
expects `revalidate` to dedupe calls in a plain Node script.
**Why it happens:** `next: { revalidate }` is a Next.js extension to `fetch` honored
only inside the Next.js server runtime (RSC render, route handler, `next build`). In a
bare `vitest` process there is no Next.js Data Cache — `fetch` behaves like standard
`fetch` and the `next` option is ignored harmlessly.
**How to avoid:** Unit tests stub `fetch` entirely (`vi.stubGlobal`), so caching is
never under test in vitest — test the *logic* (parsing, combining, fallback), not the
cache. Cache behavior is verified in Phase 11's smoke test against production. Passing
`next: { revalidate: 86400 }` in tests is harmless (ignored). `[CITED: Next.js 15 fetch
caching docs]`

### Pitfall 4: Disk cache and `.next/cache/` persistence on Vercel
**What goes wrong:** The disk cache is written somewhere that does not survive between
builds, or written to a read-only path at runtime, or a missing parent directory makes
`writeFile` throw.
**Why it happens:** Vercel's serverless runtime filesystem is read-only *except* `/tmp`;
`.next/cache/` is restored between **builds** but is not a runtime-writable path on a
deployed Vercel function.
**How to avoid:**
- The disk cache is a **build-time** outage floor (D-05/D-06: "deploy-time outage
  fallback"). Writes happen during `next build` (when RSCs render and call
  `getRepoStats`) — `.next/cache/` *is* writable during the build and Vercel restores it
  on the next build. `[CITED: Vercel docs — .next/cache restored between builds]`
- At **request time** on a deployed Vercel function, a `writeFile` into `.next/cache/`
  may fail (read-only FS). Wrap every disk-cache `writeFile` in `try/catch` that
  swallows — a failed cache write must never break `getRepoStats` (GH-06 spirit). A
  failed *read* (file absent) likewise returns `null`, not a throw.
- `mkdir(dirname(path), { recursive: true })` before the first `writeFile` so a fresh
  checkout without a `.next/cache/` directory does not throw `ENOENT`.
- This is acceptable for v1: daily revalidation means most production reads are served
  from the Next.js Data Cache; the disk cache's job is specifically "GitHub was down
  when `next build` ran." Note this build-vs-runtime asymmetry in the plan.
**Warning signs:** `EROFS` / `EACCES` errors in Vercel function logs → a `writeFile`
escaped its `try/catch`.

### Pitfall 5: `getRepoStats([])` and absent `repoUrls`
**What goes wrong:** Empty input throws or returns a zero-value object instead of `null`.
**Why it happens:** `repoUrls?: string[]` is optional on `Project` — a project without
repos passes `undefined` or `[]`.
**How to avoid:** GH-01/GH-06: empty/absent input → `parseRepoUrls` yields `[]` →
`getRepoStats` returns `null`. `getRepoStats` should accept `string[]` (callers in
Phase 10 pass `project.repoUrls ?? []`). A `null` return is the "render nothing" signal.
**Warning signs:** A project with no repo renders an empty stat strip in Phase 10.

### Pitfall 6: Untrusted `repoUrls` shape (carry-forward from Phase 8 review WR-03)
**What goes wrong:** `repoUrls` entries have no runtime validation (Phase 8 review
WR-03). A non-`github.com` or malformed entry flows into a `fetch`.
**Why it happens:** Phase 8 deliberately deferred URL validation; `repoUrls` is a
"validated in tests" field, which is *not* runtime safety.
**How to avoid:** D-01 *is* the mitigation — `parseRepoUrls` parses each entry with the
`URL` constructor inside a `try/catch`, **skips any entry whose host is not exactly
`github.com`**, and skips anything that does not yield a clean `{owner}/{repo}`. This
allow-lists the fetch target to `https://api.github.com/repos/{owner}/{repo}` regardless
of input. Owner/repo segments should additionally be sanity-checked against
`/^[\w.-]+$/` before interpolation so a crafted entry cannot inject extra path segments.
**Warning signs:** A non-GitHub URL in `repoUrls` produces a fetch to a non-GitHub host
→ the host allow-list check is missing or wrong.

## Code Examples

### Parse and normalize a repo URL (D-01 / D-02)
```typescript
// [CITED: WHATWG URL API] — host check + owner/repo extraction
interface RepoRef { owner: string; repo: string; }

function parseRepoUrl(raw: string): RepoRef | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;                       // not a URL — skip (D-01)
  }
  if (url.hostname !== "github.com") return null;   // non-GitHub — skip (D-01, Pitfall 6)
  const parts = url.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo] = parts;
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;  // Pitfall 6
  return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };       // D-02
}

function parseRepoUrls(repoUrls: string[]): RepoRef[] {
  const seen = new Set<string>();
  const out: RepoRef[] = [];
  for (const raw of repoUrls) {
    const ref = parseRepoUrl(raw);
    if (!ref) continue;
    const key = `${ref.owner}/${ref.repo}`;
    if (seen.has(key)) continue;       // dedupe on lowercase key (D-02)
    seen.add(key);
    out.push(ref);
  }
  return out;
}
```

### Parse the `Link` header for the commit count (D-04)
```typescript
// [VERIFIED: live api.github.com Link header this session]
function commitCountFromLink(linkHeader: string | null, pageArrayLength: number): number {
  if (!linkHeader) return pageArrayLength;     // no Link => 0 or 1 commits (D-04)
  const match = linkHeader.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return match ? Number(match[1]) : pageArrayLength;
}
```

### Disk-cache read/write (D-06) — failure-tolerant
```typescript
// [CITED: node:fs/promises] — every disk op swallows errors (GH-06 / Pitfall 4)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const CACHE_PATH = join(process.cwd(), ".next", "cache", "github-stats.json");
// cache file shape: Record<"owner/repo", RepoStat>

async function readDiskCache(): Promise<Record<string, RepoStat>> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8"));
  } catch {
    return {};                          // absent / unparseable => empty (never throw)
  }
}

async function writeDiskCacheEntry(key: string, stat: RepoStat): Promise<void> {
  try {
    const current = await readDiskCache();
    current[key] = stat;
    await mkdir(dirname(CACHE_PATH), { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(current), "utf8");
  } catch {
    /* read-only FS at runtime (Pitfall 4) — swallow; cache is best-effort */
  }
}
```

### Vitest: stub `fetch` with a custom-header `Response` (GH-10)
```typescript
// [CITED: vitest vi.stubGlobal + WHATWG Response] — pattern for the Link-header test
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

test("commit count comes from the Link header rel=last page", async () => {
  const linkValue =
    '<https://api.github.com/repositories/1/commits?per_page=1&page=2>; rel="next", ' +
    '<https://api.github.com/repositories/1/commits?per_page=1&page=247>; rel="last"';
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.endsWith("/commits?per_page=1")) {
      return new Response(JSON.stringify([{}]), {
        status: 200,
        headers: { link: linkValue, "content-type": "application/json" }
      });
    }
    if (url.endsWith("/languages")) {
      return new Response(JSON.stringify({ TypeScript: 9000, CSS: 1000 }), { status: 200 });
    }
    return new Response(
      JSON.stringify({ created_at: "2026-01-10T00:00:00Z", pushed_at: "2026-05-01T00:00:00Z" }),
      { status: 200 }
    );
  }));

  const stats = await getRepoStats(["https://github.com/owner/repo"]);
  expect(stats?.commitCount).toBe(247);
});

test("returns null when every repo 404s", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response("Not Found", { status: 404 })));
  expect(await getRepoStats(["https://github.com/owner/private"])).toBeNull();
});
```
- `new Response(body, { headers })` accepts arbitrary headers — exactly what the
  Link-header and rate-limit-header tests need.
- For the network-error test: `vi.fn().mockRejectedValue(new Error("network"))` — the
  module's `try/catch` must turn this into a `null`/disk-fallback, never a throw.
- `vitest` has `jsdom` env (STACK.md) which provides `Response`/`Headers`/`fetch`
  globals; if a future `node`-env test file is added, `Response` is also a Node 20
  global — no polyfill needed either way.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Authorization: token <PAT>` | `Authorization: Bearer <PAT>` | GitHub guidance ~2022 | Both still work for PATs; `Bearer` is the documented modern form and is required for JWTs. Use `Bearer`. |
| No API versioning | `X-GitHub-Api-Version: 2022-11-28` header | Nov 2022 | Pinning the version protects against silent breaking changes. `2022-11-28` is current (verified live). |
| `@octokit/rest` for any GitHub work | native `fetch` is sufficient for read-only public endpoints | Node 18+ stable `fetch` | No dep needed; aligns with CLAUDE.md / GH-02. |
| Next.js `fetch` cached-by-default | Next.js 15: `fetch` is **uncached by default**; opt in via `next: { revalidate }` | Next.js 15 (project is on 15.3.2) | Must explicitly pass `next: { revalidate: 86400 }` — there is no implicit caching to rely on. `[CITED: Next.js 15 caching changes]` |

**Deprecated/outdated:**
- Octokit `pagination` plugins for commit counting — unnecessary; the `Link`-header
  `rel="last"` idiom is one request.
- Relying on Next.js 14's default `fetch` caching — Next.js 15 reversed this; explicit
  `revalidate` is mandatory.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `.next/cache/github-stats.json` written during `next build` is restored by Vercel between builds, so a build-time-written disk cache is available on the *next* build. | Pitfall 4 / D-06 | LOW. If Vercel does not restore it, the disk cache simply starts empty each build — the live `fetch` still runs; the only loss is the build-time-outage floor. No correctness break. Phase 11 smoke test would surface it. |
| A2 | At request time on a deployed Vercel function, a `writeFile` into `.next/cache/` may fail (read-only FS) — hence every disk write is wrapped in a swallowing `try/catch`. | Pitfall 4 | LOW — the `try/catch` makes this safe regardless. Worst case the cache is never updated at runtime; daily ISR + build-time writes still cover the happy path. |
| A3 | A `403` with `x-ratelimit-remaining: 0` is the rate-limit signal; GitHub may return `403` or `429`. The module treats *any* non-`ok` status as a skipped repo, so the exact code only matters for the GH-08 log line. | Pitfall 1 | LOW — GH-06 handling is status-agnostic. GH-08 logging reads the headers defensively (`?? null`). |
| A4 | `vitest`'s `jsdom` environment (or Node 20) provides a spec-compliant `Response`/`Headers` usable in test fixtures with custom headers. | Code Examples | LOW — both `jsdom` and Node 20 ship `Response`. If a fixture needs a header `jsdom` mishandles, switch that test file to `// @vitest-environment node`. |

**No assumption here blocks planning.** All four are LOW-risk and self-mitigating via
the module's swallow-and-return-`null` discipline. None require user confirmation.

## Open Questions

1. **Should the GH-03 "60/hr" dev warning fire once per process, or once per `getRepoStats` call?**
   - What we know: GH-03 says "logs a one-line dev warning"; over-logging on every fetch
     would be noisy (3 calls × N repos).
   - What's unclear: exact desired frequency.
   - Recommendation: once per module load (module-scope `let warned = false`), gated on
     `process.env.NODE_ENV !== "production"`. Planner can decide; both satisfy GH-03.

2. **Disk-cache staleness — is there a max age before a disk-cached entry is considered too old to serve?**
   - What we know: D-06 says the disk cache is a per-repo outage fallback; it does not
     mention expiry.
   - What's unclear: whether a months-old cached stat should still be served during an
     outage.
   - Recommendation: no expiry for v1 — a stale stat is strictly better than `null`
     during an outage, and daily ISR refreshes it whenever GitHub is reachable. Note as
     a v1.2 candidate if stats ever look suspiciously frozen.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js `fetch` | All GitHub calls (GH-02/GH-04) | ✓ | Node 20.19.1 | — |
| `node:fs/promises` / `node:path` | Disk cache (GH-09) | ✓ | Node 20.19.1 builtin | — |
| `vitest` + `@vitejs/plugin-react` | Unit tests (GH-10) | ✓ | 3.1.4 / 4.4.1 (installed devDeps) | — |
| `api.github.com` (network) | Live fetch at build/runtime | ✓ | REST `2022-11-28` (verified live) | Disk cache (GH-09) covers outage |
| `GITHUB_TOKEN` env var | Authenticated 5000/hr ceiling (GH-03) | ✗ (not set locally) | — | Unauthenticated 60/hr — D-07; module works without it. Provisioned in Phase 11. |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** `GITHUB_TOKEN` is absent locally — the module's
D-07 unauthenticated path (60/hr + one-line dev warning) is the designed fallback. For
local testing the developer may add a read-only PAT to `.env.local` (gitignored), but it
is not required: unit tests stub `fetch` entirely and never hit the network.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 + jsdom 26.1.0 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run lib/github.test.ts` |
| Full suite command | `npm test` (`vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GH-01 | `getRepoStats` combines across repos; returns `null` when all fail / input empty | unit | `npx vitest run lib/github.test.ts -t "combine"` | ❌ Wave 0 |
| GH-02 | native `fetch` only, no `@octokit/rest` | static | `npm ls @octokit/rest` (expect "not found") + lint/build | n/a (CI check) |
| GH-03 | bearer auth when token present; unauth + dev warning when absent | unit | `npx vitest run lib/github.test.ts -t "auth"` | ❌ Wave 0 |
| GH-04 | three endpoints called; stats combined (sum/merge/min/max) | unit | `npx vitest run lib/github.test.ts -t "endpoints"` | ❌ Wave 0 |
| GH-05 | `next: { revalidate: 86400 }` passed on every fetch | unit | assert on `fetch` mock call args | ❌ Wave 0 |
| GH-06 | never throws; 404/private/5xx/parse/rate-limit → skipped repo; `null` only when all fail | unit | `npx vitest run lib/github.test.ts -t "null"` | ❌ Wave 0 |
| GH-07 | `GitHubRepoStats` type exported with exact shape | static | `tsc --noEmit` + import assertion | n/a (typecheck) |
| GH-08 | rate-limit headers logged at dev level | unit | `vi.spyOn(console, "warn")` + 403 fixture | ❌ Wave 0 |
| GH-09 | transient fetch failure falls back to disk cache | unit | `npx vitest run lib/github.test.ts -t "disk"` | ❌ Wave 0 |
| GH-10 | Link-header parse, language byte-sort, null paths, disk fallback, rate-limit log | unit | `npx vitest run lib/github.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/github.test.ts` (the one new test file — fast)
- **Per wave merge:** `npm test` (full vitest suite — currently 156+ tests green)
- **Phase gate:** Full suite green + `npm run build` + `npm run lint` + `tsc --noEmit`
  clean before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `lib/github.test.ts` — covers GH-01, GH-03, GH-04, GH-05, GH-06, GH-08, GH-09, GH-10.
      Co-located with `lib/github.ts` per CONVENTIONS.md.
- [ ] No shared fixtures file needed — fixtures are inline `Response` objects per test
      (TESTING.md: project has no `__fixtures__/` directory; inline is the convention).
- [ ] Framework install: none — `vitest` already installed and configured.

*Vitest discovers `lib/github.test.ts` automatically (`*.test.ts` glob). No config change
needed. Note: TESTING.md shows tests use `globals: true` (no `import { test }` needed),
but importing `vi`/`afterEach` explicitly is fine and clearer for the stub teardown.*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `GITHUB_TOKEN` server-side only; `Authorization: Bearer` header. Token never reaches client bundle (module is server-only). |
| V3 Session Management | no | No sessions — stateless server fetch. |
| V4 Access Control | no | Read-only public GitHub data; no user-specific access. |
| V5 Input Validation | yes | `repoUrls` entries are untrusted-shaped (Phase 8 WR-03). `parseRepoUrl` validates with the `URL` constructor, host-allow-lists `github.com`, and regex-checks owner/repo segments before interpolation. |
| V6 Cryptography | no | No crypto in this module. HTTPS to `api.github.com` is transport-handled by `fetch`. |
| V7 Error Handling & Logging | yes | Module never throws (GH-06). Logs are dev-level only (GH-03/GH-08); no secret is ever logged — log rate-limit headers, never the `GITHUB_TOKEN`. |

### Known Threat Patterns for a Next.js server-side API-consumer module

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| `GITHUB_TOKEN` leaked into client bundle | Information Disclosure | `lib/github.ts` is server-only; never imported by a `"use client"` island. Plan-check greps for client imports. `process.env.GITHUB_TOKEN` (no `NEXT_PUBLIC_` prefix) is never inlined client-side by Next.js. |
| SSRF via crafted `repoUrls` entry | Tampering / Info Disclosure | D-01 host allow-list (`hostname === "github.com"`) + owner/repo regex `/^[\w.-]+$/` (Pitfall 6). Fetch target is always `https://api.github.com/repos/{owner}/{repo}` — the input only contributes two regex-checked path segments. |
| Path traversal via repo name in disk-cache key | Tampering | Disk-cache key is the *already-sanitized* lowercase `owner/repo` (regex-checked, no `/` beyond the single separator, no `..`). The cache file is a single flat JSON object — keys are JSON map keys, never filesystem paths. |
| Secret logged on error | Information Disclosure | GH-08 logs only `x-ratelimit-*` header values. The `Authorization` header is never logged. Error paths log status codes, not request headers. |
| Unhandled rejection crashes a build/render | Denial of Service | GH-06: every fetch/parse/disk op is wrapped to return `null`; `Promise.allSettled` at the combine step is the final backstop. A GitHub outage degrades to `null`, never a crash. |

## Project Constraints (from CLAUDE.md)

The planner MUST verify the plan against these binding directives:

- **Native `fetch` only** — no HTTP client, no `axios`, no `@octokit/rest`. (GH-02)
- **Zero new prod dependencies** — the two-prod-dep budget (`next-themes`, `cmdk`) plus
  the Phase 7 exception (`@vercel/analytics`) is closed. `lib/github.ts` uses only
  runtime builtins. `@octokit/rest` explicitly rejected.
- **RSC discipline** — `lib/github.ts` is a server-only module. It must never be
  imported into a client island; `GITHUB_TOKEN` is a server secret.
- **`lib/` holds framework-agnostic data/types/fetching logic** — `lib/github.ts`
  belongs in `lib/`, kebab-case, named exports, no barrel file.
- **TypeScript strict** — `strict: true`, `isolatedModules: true`, `noEmit: true`. All
  helpers must be fully typed; no implicit `any`.
- **Conventions** — 2-space indent, double quotes, semicolons, trailing commas omitted,
  `import type` for type-only imports, `get`-prefixed camelCase for the public async
  helper (`getRepoStats` — already mandated).
- **Pure CSS / no UI** — N/A this phase (no rendering); confirms Phase 9 touches no
  `globals.css`.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GH-01 | `lib/github.ts` exports `getRepoStats(repoUrls): Promise<GitHubRepoStats \| null>`, combines across repos, `null` when all unreachable | Pattern 4 (combine), Pattern 5 (type), Pitfall 5 (empty input → `null`) |
| GH-02 | native `fetch` only, no new prod deps, `@octokit/rest` rejected | Standard Stack, Don't Hand-Roll, Project Constraints |
| GH-03 | `GITHUB_TOKEN` bearer auth when set; unauth + one-line dev warning when absent | Pattern 2, Open Question 1, Environment Availability |
| GH-04 | three REST endpoints per repo; combine sum/merge/earliest/latest | Pattern 3 (commits/Link), Pattern 4 (combine), Code Examples (parse) |
| GH-05 | `next: { revalidate: 86400 }` daily ISR, mirrors `lib/api.ts` | Pattern 1, Pitfall 3, State of the Art (Next.js 15 uncached-by-default) |
| GH-06 | never throws; per-repo failure skipped; `null` only when all fail | Pattern 4 (`Promise.allSettled`), Anti-Patterns, Pitfall 1, Pitfall 5 |
| GH-07 | `GitHubRepoStats` type `{ createdAt, pushedAt, languages, commitCount }` exported | Pattern 5 (define in `lib/types.ts`) |
| GH-08 | log `x-ratelimit-remaining` / `x-ratelimit-reset` at dev level | Pitfall 1, Pitfall 2 (lowercase headers, epoch reset), Security Domain |
| GH-09 | persist last-known stats to disk; fall back on transient failure | D-06, Pitfall 4, Code Examples (disk-cache read/write) |
| GH-10 | Vitest unit tests: Link parse, language byte-sort, null paths, disk fallback, rate-limit log | Validation Architecture, Code Examples (vitest fetch stub) |

## Sources

### Primary (HIGH confidence)
- Live `api.github.com` probe this session (`curl -sI`) — verified `x-ratelimit-limit: 60`,
  `x-ratelimit-remaining`, `x-ratelimit-reset` (epoch), `x-ratelimit-used`,
  `x-github-api-version-selected: 2022-11-28`, and the literal `Link` header on
  `GET /repos/vercel/next.js/commits?per_page=1` with `rel="next"` + `rel="last"`.
- `docs.github.com/en/rest/repos/repos` — `GET /repos/{owner}/{repo}`: `created_at` /
  `pushed_at` are `string|null` ISO 8601 date-time; status codes 200/301/403/404.
- `docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` — 60/hr
  unauth, 5000/hr auth; `403`/`429` on exceeded primary limit.
- `docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api` — exact
  `Link` header format; "when all results fit on a single page, the link header will be
  omitted."
- `docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api` — private
  resources return `404` (not `403`) to avoid confirming existence.
- `docs.github.com/en/rest/authentication/authenticating-to-the-rest-api` —
  `Authorization: Bearer` vs `token`; `X-GitHub-Api-Version` header.
- Project files read this session: `lib/api.ts`, `lib/types.ts`, `next.config.ts`,
  `.planning/codebase/{STACK,CONVENTIONS,TESTING}.md`, `09-CONTEXT.md`,
  `08-REVIEW.md`, `REQUIREMENTS.md` (GH-01..GH-10), `ROADMAP.md`.

### Secondary (MEDIUM confidence)
- Next.js 15 `fetch` caching behavior (uncached-by-default; `next: { revalidate }`
  opt-in) — established Next.js 15 docs, consistent with project's `lib/api.ts` usage.
- Vercel `.next/cache/` restored-between-builds behavior — Vercel build-cache docs.

### Tertiary (LOW confidence)
- None. All load-bearing claims were verified live or against official GitHub docs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; all builtins confirmed (`node --version`).
- GitHub API behavior: HIGH — `Link` header, rate-limit headers, and API version
  verified live against `api.github.com` this session; 404-for-private and
  pagination-omission confirmed in official docs.
- Architecture: HIGH — directly mirrors the in-repo `lib/api.ts` precedent.
- Pitfalls: HIGH — each is either verified live or sourced from official docs; the two
  disk-cache-persistence assumptions (A1/A2) are LOW-risk and self-mitigating.

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (30 days — GitHub REST API `2022-11-28` is a pinned stable
version; the only fast-moving surface is Next.js, and the project is version-locked at
15.3.2).
