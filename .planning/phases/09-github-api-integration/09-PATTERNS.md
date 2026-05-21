# Phase 9: GitHub API Integration - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 3 (2 new, 1 modified)
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `lib/github.ts` (NEW) | service / data module | request-response (fetch) + file-I/O (disk cache) | `lib/api.ts` | role-match (fetch+ISR+silent-fallback); file-I/O has partial analog in `lib/portfolio-data.test.ts` `node:fs` usage |
| `lib/github.test.ts` (NEW) | test | unit (stubbed fetch) | `lib/experience-duration.test.ts` (pure-logic structure) + `lib/portfolio-data.test.ts` (`node:fs`, `describe` blocks) | role-match — no existing test stubs `fetch`, so combine the two analogs + TESTING.md "Error / Fallback Testing" snippet |
| `lib/types.ts` (MODIFIED) | model / type SoT | n/a (type-only) | self — extend the existing interface file | exact (append a new `interface`, same file) |

**Notes on match quality:**
- No exact analog exists for `lib/github.ts` — it is the first module combining
  `fetch` + `Link`-header parsing + `node:fs/promises` disk I/O. `lib/api.ts`
  covers the fetch+ISR+silent-fallback half; the disk-cache half has no in-repo
  precedent and should follow RESEARCH.md Code Examples (which the planner must
  treat as authoritative for that half).
- No existing test stubs `fetch`. The planner should follow the TESTING.md
  "Error / Fallback Testing" guidance (`vi.stubGlobal("fetch", ...)`) plus the
  RESEARCH.md vitest examples — both are concrete and verified.

## Pattern Assignments

### `lib/github.ts` (service, request-response + file-I/O)

**Primary analog:** `lib/api.ts` (full file, 59 lines — read this session)

**Imports pattern** — `lib/api.ts:1-16` shows the convention; `lib/github.ts`
will differ (it imports a type from `./types` and Node builtins, no data
constants):
```typescript
// lib/api.ts:9-16 — type-only import block, alphabetized, import type
import type {
  Profile,
  Project,
  Experience,
  Writing,
  ShippedApp,
  StackCategory
} from "./types";
```
For `lib/github.ts` adapt to:
```typescript
import type { GitHubRepoStats } from "./types";   // import type — CONVENTIONS.md
import { readFile, writeFile, mkdir } from "node:fs/promises";  // RESEARCH Code Examples
import { join, dirname } from "node:path";
```
- Relative import (`./types`) for the sibling — CONVENTIONS.md: relative for
  siblings, `@/` only across directory boundaries.
- `import type` for the type-only import — mandatory under `isolatedModules`.

**ISR-cached fetch + silent fallback pattern** — `lib/api.ts:20-35` (the
`getJson<T>` template `lib/github.ts` adapts):
```typescript
/**
 * ISR-cached fetch with silent fallback. Existing pattern preserved per DATA-04.
 */
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 300 }
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
```
**How `lib/github.ts` adapts it (per RESEARCH Pattern 1):**
- `revalidate: 300` → `revalidate: 86400` (daily ISR, GH-05).
- The fallback is no longer a typed data constant — on failure return `null`
  (GH-06) or a disk-cached per-repo entry (GH-09). There is no "static GitHub
  stats" constant; `null` is the no-data signal.
- The `try { ... } catch { return fallback }` *shape* is preserved exactly —
  swallow, never re-throw (CONVENTIONS.md "Error Handling" + RESEARCH
  Anti-Patterns).

**Env-var read pattern** — `lib/api.ts:18`:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
```
`lib/github.ts` reads `process.env.GITHUB_TOKEN` — but note the difference:
`GITHUB_TOKEN` has **no `NEXT_PUBLIC_` prefix** (server-only secret, must not
reach the client bundle) and is **optional** (D-07 unauthenticated fallback —
do not supply a default value; branch on presence). See RESEARCH Pattern 2 for
the `ghHeaders()` conditional-bearer helper.

**JSDoc-block pattern** — `lib/api.ts:20-24` and `lib/uptime.ts:1-7` both carry
a leading `/** ... */` block on the exported function. CONVENTIONS.md says the
codebase has "essentially no inline comments" — but `lib/api.ts` and
`lib/types.ts` *do* use doc blocks on exported surfaces. Match that: a JSDoc
block on `getRepoStats` and on the `GitHubRepoStats` interface; keep helper
internals comment-light.

**Code style** (CONVENTIONS.md, binding):
- 2-space indent, double quotes, semicolons always, **trailing commas omitted**
  in multi-line literals.
- Named exports only; **no default export**, **no barrel file**.
- `get`-prefixed camelCase for the public async helper (`getRepoStats`);
  plain camelCase for private helpers.

**Disk-cache file-I/O pattern** — NO in-repo analog. The closest the codebase
gets to `node:fs` is in a *test* file: `lib/portfolio-data.test.ts:2-3` imports
`existsSync, statSync, readFileSync` from `node:fs` and `join` from `node:path`,
and `lib/portfolio-data.test.ts:289` builds a path with
`join(process.cwd(), "public")`. For the *module's* disk cache, follow
RESEARCH.md "Disk-cache read/write" Code Example verbatim — `readDiskCache` /
`writeDiskCacheEntry` each wrapped in a swallowing `try/catch`, `CACHE_PATH =
join(process.cwd(), ".next", "cache", "github-stats.json")`, `mkdir(...,
{ recursive: true })` before write.

---

### `lib/github.test.ts` (test, unit — stubbed fetch)

**Analog A (test-file structure & assertions):** `lib/experience-duration.test.ts`
(full file, 64 lines — read this session) and `lib/portfolio-data.test.ts`
(read this session).

**Imports pattern** — `lib/experience-duration.test.ts:1-2`:
```typescript
import { describe, test, expect } from "vitest";
import { computeDurationLabel } from "./experience-duration";
```
Note: TESTING.md says `globals: true` makes `test`/`expect`/`describe` available
without import, but the newer `lib/*.test.ts` files **do import them explicitly**
(`lib/experience-duration.test.ts:1`, `lib/portfolio-data.test.ts:1`). Follow
the explicit-import convention — and additionally import `vi` and `afterEach`
for the fetch-stub teardown (RESEARCH note: "importing `vi`/`afterEach`
explicitly is fine and clearer").

**`describe`-grouping pattern** — `lib/portfolio-data.test.ts:15`, `:30`, `:73`
group tests by area with a `describe(...)` block per concern:
```typescript
describe("portfolio-data shape", () => {
  test("PROFILE has non-empty name", () => { ... });
});
```
`lib/github.test.ts` should group by requirement: `describe("getRepoStats — URL
parsing")`, `describe("getRepoStats — Link-header commit count")`,
`describe("getRepoStats — combine")`, `describe("getRepoStats — null paths")`,
`describe("getRepoStats — auth")`, `describe("getRepoStats — disk fallback")`,
`describe("getRepoStats — rate-limit log")` — one per GH-01/03/04/06/08/09/10.

**Pure-input/output assertion style** — `lib/experience-duration.test.ts:5-7`,
`:37-39`:
```typescript
test("year-only range with present uses today via injected now", () => {
  expect(computeDurationLabel("2023 - present", new Date("2025-06-15"))).toBe("2y 5mo");
});
test("garbage input returns null", () => {
  expect(computeDurationLabel("garbage")).toBeNull();
});
```
Sentence-style test names describing behavior; `.toBe(...)` / `.toBeNull()` /
`.toBeTruthy()`. The `"garbage input returns null"` and `"empty input returns
null"` tests are the exact precedent for GH-06's `null`-on-failure assertions.

**`node:fs` + `process.cwd()` in tests** — `lib/portfolio-data.test.ts:2-3`,
`:289`, `:296-303`:
```typescript
import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
const PUBLIC_DIR = join(process.cwd(), "public");
```
Precedent for any disk-cache test that needs to write/read a fixture cache file
under a temp path or assert on `.next/cache/`.

**Analog B (fetch-stub mechanics):** NO in-repo test stubs `fetch`. TESTING.md
"Common Patterns (For Future Tests)" lines 192-200 give the project-sanctioned
shape:
```typescript
import { vi } from "vitest";
test("returns fallback when fetch fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  const result = await getProfile();
  expect(result).toEqual(fallbackProfile);
});
```
Combine this with RESEARCH.md "Vitest: stub `fetch` with a custom-header
`Response`" Code Example (lines 473-507) — that example is verified and covers
the `Link`-header fixture, the 404→`null` path, and `afterEach(() =>
vi.unstubAllGlobals())` teardown. For GH-08, use
`vi.spyOn(console, "warn")` against a `403` + `x-ratelimit-remaining: 0`
fixture.

**No shared fixtures file** — RESEARCH Wave 0 Gaps + TESTING.md "Fixtures":
the project has no `__fixtures__/` directory; fixtures are inline `Response`
objects per test. Do not create a fixtures module.

---

### `lib/types.ts` (model — append `GitHubRepoStats`)

**Analog:** the file itself (148 lines — read this session).

**Interface + JSDoc pattern** — `lib/types.ts:9-15`, `:63-86`. Every interface
carries a leading `/** ... */` summary, and every field a `/** ... */` doc
comment:
```typescript
/** A single accent-block stat card on the about view (e.g. "7+ Years shipping"). */
export interface Highlight {
  /** Large accent-colored value text, 22px/700. e.g. "7+", "AWS", "AI". */
  value: string;
  /** Muted 11px label below the value. e.g. "Years shipping". */
  label: string;
}
```
**Append `GitHubRepoStats` in this exact style** (shape mandated by GH-07 /
RESEARCH Pattern 5):
```typescript
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
- Place it near `Project` (`lib/types.ts:64-86`) — it is conceptually the
  fetched companion to `Project.repoUrls?: string[]` (defined `lib/types.ts:85`).
- `export interface` (PascalCase) — matches every other type in the file.
- Trailing commas omitted; 2-space indent; double quotes.

---

## Shared Patterns

### Silent-fallback error handling (never throw)
**Source:** `lib/api.ts:25-35` (`getJson` try/catch) + CONVENTIONS.md "Error
Handling" (lines 124-138).
**Apply to:** Every fetch, parse, and disk-I/O path in `lib/github.ts`.
```typescript
// lib/api.ts:25-35 — the canonical shape: try → return fallback on !ok → catch → return fallback
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 300 } });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
```
Adaptation rule: the project precedent *swallows and returns a fallback* — it
never re-throws and there is no central logger (CONVENTIONS.md "Logging": no
`console.*` in source). Phase 9 deviates only in that GH-03/GH-08 require
**dev-level** `console.warn` logging — gate every such log on
`process.env.NODE_ENV !== "production"` so production stays log-silent and the
"swallow, return null" discipline is preserved.

### `next: { revalidate }` on every fetch
**Source:** `lib/api.ts:27-29`.
**Apply to:** All three GitHub REST calls in `lib/github.ts`.
```typescript
const response = await fetch(`${baseUrl}${path}`, {
  next: { revalidate: 300 }   // lib/github.ts uses 86400 (GH-05)
});
```
Every fetch in the codebase carries `next: { revalidate: N }` — `lib/api.ts`
uses `300`, `lib/github.ts` uses `86400`. No bare `fetch` calls.

### Server-only env-var read
**Source:** `lib/api.ts:18` — `process.env.X || default`.
**Apply to:** `GITHUB_TOKEN` read in `lib/github.ts`.
Difference from the analog: `GITHUB_TOKEN` is **not `NEXT_PUBLIC_`-prefixed**
(server secret) and is **optional** — branch on `if (token)` rather than
supplying a `|| default`. RESEARCH Security Domain: the absence of the
`NEXT_PUBLIC_` prefix is what keeps Next.js from inlining it client-side.

### Test conventions
**Source:** `lib/experience-duration.test.ts:1` + `lib/portfolio-data.test.ts:1`.
**Apply to:** `lib/github.test.ts`.
- Explicit `import { describe, test, expect } from "vitest"` (newer files do
  this despite `globals: true`).
- `describe(...)` block per concern; sentence-style `test(...)` names.
- No `beforeEach`; add `afterEach(() => vi.unstubAllGlobals())` only because the
  fetch stub needs teardown (RESEARCH Code Examples).
- Inline `Response` fixtures — no `__fixtures__/` directory (TESTING.md).

## No Analog Found

Patterns with no in-repo precedent — planner should use RESEARCH.md as the
authoritative source for these:

| Concern | Role | Data Flow | Reason | Authoritative Source |
|---------|------|-----------|--------|----------------------|
| Disk-cache read/write (`.next/cache/github-stats.json`) | service | file-I/O | No source module uses `node:fs/promises`; only test files use sync `node:fs` | RESEARCH "Disk-cache read/write" Code Example + Pitfall 4 |
| `Link`-header parsing for commit count | service | request-response | No HTTP-header parsing exists anywhere in the codebase | RESEARCH Pattern 3 + "Parse the Link header" Code Example |
| `Promise.allSettled` per-repo parallel combine | service | request-response | `app/page.tsx` uses `Promise.all` (not `allSettled`) for data loading — partial precedent only | RESEARCH Pattern 4 |
| Stubbing `globalThis.fetch` in a test | test | unit | No existing test mocks `fetch`; `vi` is unused across the suite | TESTING.md lines 192-200 + RESEARCH "Vitest: stub fetch" Code Example |
| Conditional bearer-auth header construction | service | request-response | No request-header construction exists in the codebase | RESEARCH Pattern 2 (`ghHeaders()`) |

## Metadata

**Analog search scope:** `lib/` (all 11 files enumerated), `.planning/codebase/`
(CONVENTIONS.md, TESTING.md).
**Files read this session:** `lib/api.ts`, `lib/types.ts`,
`lib/portfolio-data.test.ts`, `lib/experience-duration.test.ts`, `lib/uptime.ts`,
`.planning/codebase/CONVENTIONS.md`, `.planning/codebase/TESTING.md`, plus the
two upstream inputs (`09-CONTEXT.md`, `09-RESEARCH.md`) and `CLAUDE.md`.
**Skills directories:** none (`.claude/skills/`, `.agents/skills/` absent).
**Pattern extraction date:** 2026-05-21
</content>
</invoke>
