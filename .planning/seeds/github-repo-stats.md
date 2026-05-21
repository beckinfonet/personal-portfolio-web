---
title: GitHub repo stats enrichment in projects/
trigger_condition: When next milestone (v1.1+) scoping begins and feature candidates are being reviewed.
planted_date: 2026-05-21
source: /gsd-explore session 2026-05-21
---

# GitHub repo stats enrichment in projects/

## Idea

Pull live metadata from GitHub for each project that has a public repo, render
it as a compact stat strip on the projects list view and as a richer "tech
highlights" panel on each project's detail page. Goal: communicate three
recruiter-facing signals at the 5-second scan and at the deeper click.

## Trigger

Promote to a phase when:

- Milestone v1.0 is fully closed (it is — 2026-05-14).
- Next milestone is being scoped and a frontend enrichment slice fits.
- The "is `link` polymorphic?" research question (see
  `.planning/research/questions.md`) has been resolved — that determines
  whether this is FE-only or paired FE+BE work.

## v1 scope (decided 2026-05-21)

Three signals, balanced:

| Signal | Source | Field |
|--------|--------|-------|
| "Real, mature projects" | GitHub `GET /repos/{owner}/{repo}` | `created_at` → "in development X months"; commit count via `GET /repos/.../commits?per_page=1` + Link header |
| "I work across this stack" | GitHub `GET /repos/{owner}/{repo}/languages` | Byte-breakdown → top 1–3 languages |
| "Active project" | GitHub `GET /repos/{owner}/{repo}` | `pushed_at` → "last active X days ago" (detail panel only) |

**Explicitly dropped from v1:** test coverage, CI status, quality-rigor
signals. Reason: not GitHub-native; would require Codecov/Coveralls per repo
or hand-authoring. Reconsider in v1.2 if visitors actually ask about it.

## Placement

- **Projects list view** — Lean stat strip under each card. Format:
  `247 commits · TS / CSS · 4mo`. Visible at the 5-second-scan moment.
- **Project detail page** — Richer "Tech highlights" block: full language
  byte-breakdown, dev-duration with date range, last-active timestamp,
  commit count. Rewards deeper interest.
- **Projects without a public repo** — Card omits the strip silently
  (no "private" label, no degraded layout). Detail page omits the panel.

## Data flow

- `lib/github.ts` — new module, mirrors the `lib/api.ts` pattern: native
  `fetch` + `next: { revalidate: 86400 }` (daily). Returns typed
  `GitHubRepoStats | null`. Null when repo is missing, private, or the
  fetch fails — page renders the same as a "no repo" project.
- Authentication via `GITHUB_TOKEN` env var (5,000 req/hr authenticated vs.
  60/hr unauthenticated). Token is read-only public-repo scope.
- Daily revalidate matches portfolio update cadence; ~7 projects × 1
  call/day = trivial API cost.

## Stack constraints respected

- No new prod deps (uses native `fetch`).
- Server component fetch — fits the persistent shell architecture.
- Renders inside the existing projects routes; no route group changes.
- Mobile: lean strip must remain readable at the 480px breakpoint — design
  pass needed (3 short tokens separated by `·` should be fine).

## Open questions before promotion

See `.planning/research/questions.md` — particularly the `link` field
polymorphism question. If `link` is polymorphic (sometimes live site,
sometimes repo), an additional `repoUrl?: string` field on the Project
schema is needed — paired FE+BE commit per CLAUDE.md brownfield discipline.

## Related

- [[github-repo-stats-exploration]] — full design rationale and rejected
  alternatives from the exploration session.
