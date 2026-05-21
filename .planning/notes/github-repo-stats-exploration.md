---
title: GitHub repo stats enrichment — exploration decisions
date: 2026-05-21
context: /gsd-explore session held while awaiting next milestone scoping
---

# GitHub repo stats enrichment — exploration decisions

Captured during a `/gsd-explore` session on 2026-05-21. Documents the
decisions made and alternatives considered for a future `projects/` view
enrichment feature.

## The ask

Pull repo metadata from GitHub — language, dev duration, commit count,
maybe coverage — and surface it on the portfolio under each project to
signal tech stack and project maturity.

## Decisions

### Signal mix: all three, balanced

Picked over single-signal alternatives.

| Considered | Picked? | Reasoning |
|------------|---------|-----------|
| "Real, mature projects" only | No | Misses the stack-signal that recruiters care about. |
| "I work across this stack" only | No | Doesn't differentiate from a resume bullet list. |
| "I write quality code" only | No | Requires non-GitHub-native data; high friction for v1. |
| **All three, balanced strip** | **Yes** | Forces editorial discipline; covers scan + deeper inspection. |

### Coverage: dropped from v1

Picked over the alternatives.

| Considered | Picked? | Reasoning |
|------------|---------|-----------|
| Hand-author per project | No | Possible but feels dishonest if the number is arbitrary. |
| Codecov per repo | No | Requires setup on every repo; ongoing maintenance burden. |
| Swap to a different quality signal | No | "Open issues count" / "last active" can fold into the maturity signal instead. |
| **Drop quality signal for v1** | **Yes** | Ship the three free GitHub-native signals; revisit if real visitors ask. |

### Placement: lean strip on cards + detail panel on routes

Picked over single-surface options.

| Considered | Picked? | Reasoning |
|------------|---------|-----------|
| Card strip only | No | Caps the depth a curious engineer can reach. |
| Detail panel only | No | Hidden one click away from the 5-second scan. |
| **Both surfaces** | **Yes** | Card strip drives scan; detail panel rewards interest. Dual audience matches CLAUDE.md non-negotiables. |
| Strip only on projects with repos | Partial | "Both" already implies graceful degradation when no repo. |

### Freshness: daily revalidate (86400s)

Picked over alternatives.

| Considered | Picked? | Reasoning |
|------------|---------|-----------|
| Hourly | No | Overkill for portfolio cadence. |
| **Daily revalidate** | **Yes** | Fresh enough; matches existing `lib/api.ts` pattern; ~7 calls/day per build. |
| Build-time only | No | Stats freeze between deploys — bad signal for "active" claim. |
| Static fallback + weekly refresh | No | More complexity; daily already covers the freshness floor. |

## Stack fit

Matches existing architecture without friction:

- Native `fetch` + `next: { revalidate }` — already the project's convention
  (CLAUDE.md, `.planning/research/ARCHITECTURE.md`).
- Server component fetch — preserves persistent shell purity.
- No new prod deps required. (`@octokit/rest` is **not** worth pulling in
  for this surface — three endpoints, simple JSON; native `fetch` suffices.)
- `GITHUB_TOKEN` env var needed for 5,000 req/hr ceiling. Read-only
  public-repo scope. Add to deploy env when feature ships.

## Implementation shape (sketch)

```ts
// lib/github.ts
export interface GitHubRepoStats {
  commits: number;
  languages: Array<{ name: string; bytes: number }>;
  createdAt: string;   // ISO
  pushedAt: string;    // ISO
  developmentMonths: number;
}

export async function fetchRepoStats(
  owner: string,
  repo: string,
): Promise<GitHubRepoStats | null> {
  // native fetch with next: { revalidate: 86400 }
  // GITHUB_TOKEN bearer
  // returns null on 404 / private / network error (same fallback shape as lib/api.ts)
}
```

Component sketch:

- `<ProjectStatStrip stats={stats} />` — RSC, renders the lean card row.
- `<ProjectTechHighlights stats={stats} />` — RSC, renders the detail panel.
- Both render `null` if `stats` is null (graceful degradation).

## Open before planning

- Whether the existing Project schema's `link` field is always a GitHub
  repo URL or is polymorphic — captured as a research question.
- Mobile design pass on the lean strip at 480px (3 short tokens + `·`
  separators should fit, but visual confirmation needed).

## Related

- [[github-repo-stats]] — the seed that will activate this work.
