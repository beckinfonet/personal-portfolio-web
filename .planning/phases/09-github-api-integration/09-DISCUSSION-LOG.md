# Phase 9: GitHub API Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 9-GitHub API Integration
**Areas discussed:** URL parsing & normalization, Combine semantics, Caching, Auth & rate limits
**Mode:** `--auto` — every question auto-resolved to its recommended default.

---

## URL parsing & normalization

| Option | Description | Selected |
|--------|-------------|----------|
| Strict parse, tolerate `.git` + trailing slash, skip non-GitHub hosts | Parser never throws; non-GitHub entries contribute nothing | ✓ |
| Assume all `repoUrls` are canonical `github.com/{o}/{r}` | Simpler, but throws on any malformed/non-GitHub entry | |

**User's choice:** Recommended default (D-01).
**Notes:** `[auto]` URL parsing — Q: "How defensive should the repo-URL parser be?" → Selected: "Tolerant parse, skip non-GitHub hosts" (recommended default).

| Option | Description | Selected |
|--------|-------------|----------|
| Lowercase-normalize `owner/repo` for keys + dedup | Resolves Phase 8 IN-03 casing inconsistency | ✓ |
| Preserve `repoUrls` casing verbatim | Risks duplicate cache entries / dedup misses | |

**User's choice:** Recommended default (D-02).
**Notes:** `[auto]` URL normalization — Q: "How to handle the mixed casing in `repoUrls` (LooperMobile, jaytap-mobile, CarEx)?" → Selected: "Lowercase-normalize for cache keys and dedup" (recommended default; closes Phase 8 code-review IN-03).

---

## Combine semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Per-repo independent fetch, combine successes, null only if all fail | Sum commits, merge language bytes, earliest created / latest pushed | ✓ |
| All-or-nothing — null if any repo fails | Simpler but loses data when one repo of two is private | |

**User's choice:** Recommended default (D-03).
**Notes:** `[auto]` Combine semantics — Q: "When some repos in `repoUrls` fail, combine partial results or return null?" → Selected: "Combine the successes; null only when every repo fails" (recommended default; satisfies GH-06).

| Option | Description | Selected |
|--------|-------------|----------|
| `Link` header `rel="last"` page number, fallback to array length | Standard GitHub commit-count technique | ✓ |
| Paginate through all commits | Correct but expensive — defeats `per_page=1` | |

**User's choice:** Recommended default (D-04).
**Notes:** `[auto]` Commit count — Q: "How to derive commit count from `/commits?per_page=1`?" → Selected: "Parse `Link` header `rel=last`, fallback to returned-array length" (recommended default).

---

## Caching

| Option | Description | Selected |
|--------|-------------|----------|
| Two layers — ISR `revalidate` for live reads, disk cache for outage fallback only | Layers are orthogonal; disk consulted only on fetch failure | ✓ |
| Disk cache as primary read path | Stale-by-default; defeats the daily ISR cadence | |

**User's choice:** Recommended default (D-05).
**Notes:** `[auto]` Caching layers — Q: "How do the ISR cache (GH-05) and disk cache (GH-09) relate?" → Selected: "Orthogonal — ISR for live reads, disk strictly an outage fallback" (recommended default).

| Option | Description | Selected |
|--------|-------------|----------|
| Per-repo disk cache at `.next/cache/github-stats.json`, keyed by `owner/repo` | One failing repo falls back independently; Vercel restores `.next/cache/` | ✓ |
| Per-project cache keyed by the full `repoUrls` list | Coarser — a single repo change invalidates the whole project entry | |

**User's choice:** Recommended default (D-06).
**Notes:** `[auto]` Disk-cache granularity — Q: "Cache per-repo or per-project, and where on disk?" → Selected: "Per-repo, `.next/cache/github-stats.json`" (recommended default; GH-09 example path).

---

## Auth & rate limits

| Option | Description | Selected |
|--------|-------------|----------|
| Bearer `GITHUB_TOKEN` when present, unauthenticated + dev warning when absent; 403 rate-limit → skip-and-fallback | Satisfies GH-03 + GH-08 | ✓ |
| Require `GITHUB_TOKEN`, fail hard when absent | Breaks local dev / preview builds without a token | |

**User's choice:** Recommended default (D-07).
**Notes:** `[auto]` Auth & rate limits — Q: "Token handling and rate-limit behavior?" → Selected: "Optional token with unauthenticated fallback; rate-limited repo treated as a failed fetch" (recommended default).

---

## Claude's Discretion

- Internal helper decomposition of `lib/github.ts` (URL parser, per-repo
  fetcher, Link-header parser, combiner, disk-cache I/O) — left to
  planner/researcher; only the public surface and D-01..D-07 are locked.
- The phase-researcher verifies live GitHub REST API specifics (Link-header
  format, `/languages` shape, rate-limit header names) before planning.

## Deferred Ideas

- Test-coverage / CI-status / quality-rigor signals — not GitHub-native; the
  seed defers reconsideration to v1.2.
