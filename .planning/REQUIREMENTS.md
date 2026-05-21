# Requirements: Terminal Portfolio — v1.1 GitHub Repo Stats Enrichment

**Defined:** 2026-05-21
**Core Value:** A distinctive personal portfolio that signals engineering craft through a terminal/IDE aesthetic — without making non-technical recruiters work to find the resume and contact info.

**Milestone goal:** Surface live GitHub repo metadata on the projects view to signal stack depth and project maturity to dual audiences — lean strip at the 5-second scan, richer panel for deeper interest.

**v1.0 milestone REQ-IDs** were `AUTH-* / SHELL-* / CONTENT-* / BACKEND-* / DEPLOY-*` etc. v1.1 introduces a new `GH-*` category (GitHub) and a `SCHEMA-*` category (Project schema extension) to keep traceability scoped to this milestone.

---

## v1.1 Requirements

Requirements for the v1.1 release. Each maps to a roadmap phase.

### Project schema (paired FE+BE)

- [ ] **SCHEMA-01**: Backend Mongoose `Project` model gains optional `repoUrl?: string` field with `strict: 'throw'` preserved
- [ ] **SCHEMA-02**: Backend `ProjectDto` type extended with `repoUrl?: string` matching the model
- [ ] **SCHEMA-03**: Frontend `lib/types.ts` `Project` interface gains `repoUrl?: string` with JSDoc clarifying its role ("Repo URL for GitHub stats fetch; distinct from polymorphic `link` field")
- [ ] **SCHEMA-04**: Backend seed JSON (`portfolio-services/src/seed/projects.json`) and frontend static fallback (`lib/portfolio-data.ts`) byte-mirror each other with the new `repoUrl` field populated for the 3 existing project entries (D-14 discipline preserved)
- [ ] **SCHEMA-05**: Backend Jest test covers presence/absence of `repoUrl` in `/api/projects` response shape
- [ ] **SCHEMA-06**: Frontend vitest assertions verify the `repoUrl` field appears on every PROJECTS entry where present
- [ ] **SCHEMA-07**: Schema change ships as paired FE+BE commit per CLAUDE.md brownfield discipline (cross-reference recorded in commit message)

### GitHub API integration (`lib/github.ts`)

- [ ] **GH-01**: New `lib/github.ts` module exports `getRepoStats(repoUrl: string): Promise<GitHubRepoStats | null>`
- [ ] **GH-02**: Module uses native `fetch` only; no new prod dependencies (`@octokit/rest` explicitly rejected)
- [ ] **GH-03**: Module authenticates via `GITHUB_TOKEN` env var when present; falls back to unauthenticated requests when absent (logs a one-line dev warning about reduced 60/hr ceiling)
- [ ] **GH-04**: Module calls three GitHub REST endpoints: `GET /repos/{owner}/{repo}` (created_at + pushed_at), `GET /repos/{owner}/{repo}/languages` (byte breakdown), `GET /repos/{owner}/{repo}/commits?per_page=1` (commit count via Link header)
- [ ] **GH-05**: Module uses `next: { revalidate: 86400 }` for daily ISR cache, matching `lib/api.ts` pattern
- [ ] **GH-06**: Module returns `null` on missing/private repo, fetch failure, rate-limit hit, or parse error — never throws an exception to its callers
- [ ] **GH-07**: New `GitHubRepoStats` type exported with shape `{ createdAt: string, pushedAt: string, languages: Record<string, number>, commitCount: number }`
- [ ] **GH-08**: Module logs remaining rate-limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) at dev log level so we can observe ceiling consumption
- [ ] **GH-09**: Module persists last-known stats to disk between builds so a transient GitHub outage during deploy does not break the build (e.g. `.next/cache/github-stats.json` or equivalent; falls back to disk cache when fetch fails)
- [ ] **GH-10**: Vitest unit tests cover the parser logic, Link-header commit-count extraction, null-fallback paths, and disk-cache fallback

### Projects-list stat strip

- [ ] **LIST-01**: Compact one-line stat strip rendered under each project card on `/projects`
- [ ] **LIST-02**: Strip format follows `<commits> commits · <lang1> [/ <lang2>] [/ <lang3>] · <duration>` (e.g. `247 commits · TS / CSS · 4mo`)
- [ ] **LIST-03**: Top 1-3 languages selected by byte count from `/languages` response; abbreviations match `lib/types.ts` `Stack` category conventions where applicable (e.g. `TypeScript` → `TS`)
- [ ] **LIST-04**: Duration computed from `created_at` to today; formatted in months for under a year (`4mo`) and years+months above (`1y 2mo`)
- [ ] **LIST-05**: Strip is prefixed with a small monospace GitHub octocat-style glyph (or text token like `gh:`) to signal source
- [ ] **LIST-06**: Mobile readability validated at 480px breakpoint; strip wraps gracefully or truncates the language list to top-1 if width-constrained
- [ ] **LIST-07**: Project cards with no `repoUrl` set, or with `repoUrl` set but stats returned `null`, render unchanged — no strip, no placeholder, no "private" label
- [ ] **LIST-08**: Strip visual integrates with existing `.projects-row` styling; reuses tokens from `app/globals.css` without introducing new top-level CSS sections
- [ ] **LIST-09**: Vitest covers rendering with stats present, rendering with null stats, and the mobile-truncation branch

### Project-detail Tech highlights panel

- [ ] **DETAIL-01**: New "Tech highlights" panel rendered on each project's detail page when stats are available
- [ ] **DETAIL-02**: Panel shows full language byte-breakdown with percentages (top 5 + "other" if >5 languages)
- [ ] **DETAIL-03**: Dev duration shown with date range (e.g. `In development since Jan 2026 — 4mo`)
- [ ] **DETAIL-04**: Last-active timestamp formatted relative (e.g. `Last active 3 days ago`, `Last active 2 months ago`)
- [ ] **DETAIL-05**: Commit count displayed as a prominent stat
- [ ] **DETAIL-06**: Panel includes a "View on GitHub →" CTA linking to the `repoUrl` with `target=_blank rel=noopener noreferrer` per SEO-05 pattern (uses existing `ExternalLink` primitive)
- [ ] **DETAIL-07**: Projects without `repoUrl` or with null stats omit the panel cleanly — no degraded layout, no placeholder
- [ ] **DETAIL-08**: Panel meets WCAG 2.1 AA color-contrast under all 4 accent hues × 2 themes (extension of existing Phase 5 56-cell axe matrix)
- [ ] **DETAIL-09**: Vitest covers the panel rendering branches

### Deploy readiness

- [ ] **DEPLOY-V11-01**: `GITHUB_TOKEN` env var added to Vercel Production scope (read-only public-repo scope)
- [ ] **DEPLOY-V11-02**: README or deploy notes document the `GITHUB_TOKEN` requirement, the scope it needs, and the consequence of its absence
- [ ] **DEPLOY-V11-03**: Existing `npm run build`, `npm run lint`, `npm test`, INFRA-05 postbuild placeholder grep all green with new module integrated
- [ ] **DEPLOY-V11-04**: At least one production-served project card shows real GitHub stats post-deploy (smoke test against https://www.tatibekov.com/projects)
- [ ] **DEPLOY-V11-05**: Daily ISR revalidate confirmed via second-load timing (no per-request GitHub call)

## Future Requirements (not in v1.1)

Acknowledged but not in current roadmap.

### GitHub stats — deferred signals

- **GH-FUTURE-01**: Code coverage badge per project (requires per-repo Codecov / Coveralls setup)
- **GH-FUTURE-02**: CI status indicator per project (requires per-repo GitHub Actions workflow)
- **GH-FUTURE-03**: Open issues count signal
- **GH-FUTURE-04**: Private-repo support via authenticated token scope expansion

### v1.0 operational carry-forwards (tracked separately in STATE.md Deferred Items, not v1.1 scope)

- Branch protection on `main` (Phase 1 carry-forward)
- DEPLOY-03 GSC indexing coverage snapshot (Phase 7 carry-forward)
- DEPLOY-04 5-second recruiter hand-off test with non-engineer subject (Phase 7 carry-forward)
- DEPLOY-06 Vercel Analytics ingestion event clean retest (Phase 7 carry-forward)

## Out of Scope

Explicitly excluded for v1.1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Code coverage signal | Not GitHub-native; requires per-repo Codecov/Coveralls setup with ongoing maintenance burden — out of proportion to v1 signal value (per seed file decision matrix) |
| CI status indicator | Same reasoning as coverage; not GitHub-native enough to justify v1 inclusion |
| Open issues count signal | Folded into "last active" / activity story implicitly; explicit issues count can mislead (high-churn open-source repo vs. lean shipping cadence) |
| `@octokit/rest` or any GitHub-client library | Three simple JSON endpoints; the dep would consume the prod-dep budget while offering nothing native fetch can't do |
| Private-repo support in v1.1 | Requires expanded token scope and reveals private metadata to the public-facing portfolio — out of brand |
| Per-request GitHub API calls (no caching) | Would blow through the 5,000/hr authenticated ceiling on traffic; daily ISR is intentional and matches `lib/api.ts` pattern |
| Repurposing `Project.link` as repo-only | Q1 resolution: `link` is documented as polymorphic ("live site / repo / case study"); repurposing breaks the contract for projects linking to live sites or writeups |
| Hourly or build-time-only refresh | Hourly = overkill for portfolio cadence; build-time = freezes "active" claim between deploys. Daily strikes the right balance. |
| Visual redesign of the `/projects` view | Strip and panel must integrate with existing `.projects-row` styling; broader visual rework is out of scope |
| Sortable / filterable project list driven by stats | Adds UI surface beyond the seed v1 scope; revisit if visitors actually use it |

## Traceability

Filled by roadmapper. Initially empty.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | TBD | Pending |
| SCHEMA-02 | TBD | Pending |
| SCHEMA-03 | TBD | Pending |
| SCHEMA-04 | TBD | Pending |
| SCHEMA-05 | TBD | Pending |
| SCHEMA-06 | TBD | Pending |
| SCHEMA-07 | TBD | Pending |
| GH-01 | TBD | Pending |
| GH-02 | TBD | Pending |
| GH-03 | TBD | Pending |
| GH-04 | TBD | Pending |
| GH-05 | TBD | Pending |
| GH-06 | TBD | Pending |
| GH-07 | TBD | Pending |
| GH-08 | TBD | Pending |
| GH-09 | TBD | Pending |
| GH-10 | TBD | Pending |
| LIST-01 | TBD | Pending |
| LIST-02 | TBD | Pending |
| LIST-03 | TBD | Pending |
| LIST-04 | TBD | Pending |
| LIST-05 | TBD | Pending |
| LIST-06 | TBD | Pending |
| LIST-07 | TBD | Pending |
| LIST-08 | TBD | Pending |
| LIST-09 | TBD | Pending |
| DETAIL-01 | TBD | Pending |
| DETAIL-02 | TBD | Pending |
| DETAIL-03 | TBD | Pending |
| DETAIL-04 | TBD | Pending |
| DETAIL-05 | TBD | Pending |
| DETAIL-06 | TBD | Pending |
| DETAIL-07 | TBD | Pending |
| DETAIL-08 | TBD | Pending |
| DETAIL-09 | TBD | Pending |
| DEPLOY-V11-01 | TBD | Pending |
| DEPLOY-V11-02 | TBD | Pending |
| DEPLOY-V11-03 | TBD | Pending |
| DEPLOY-V11-04 | TBD | Pending |
| DEPLOY-V11-05 | TBD | Pending |

**Coverage:**
- v1.1 requirements: 40 total
- Mapped to phases: 0 (roadmapper pending)
- Unmapped: 40 ⚠ — will resolve at roadmap creation

---
*Requirements defined: 2026-05-21*
*Last updated: 2026-05-21 after `/gsd-new-milestone` v1.1 initial definition*
