# Roadmap: Terminal Portfolio

## Overview

Brownfield redesign of an existing Next.js 15 / React 19 portfolio into a high-fidelity terminal/IDE shell with seven per-view App Router routes, light/dark themes, four hue-swappable accents, a âK command palette, full mobile responsiveness, and matching backend shape changes in the sibling `portfolio-services/` repo.

## Milestones

- â **v1.0 Terminal Portfolio MVP** â Phases 1â7 (shipped 2026-05-14, see [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md))
- ð§ **v1.1 GitHub Repo Stats Enrichment** â Phases 8â11 (planned 2026-05-21)

## Phases

<details>
<summary>â v1.0 Terminal Portfolio MVP (Phases 1â7) â SHIPPED 2026-05-14</summary>

- [x] Phase 1: Foundation (6/6 plans) â completed 2026-05-06
- [x] Phase 2: Shell (7/7 plans) â completed 2026-05-06
- [x] Phase 3: Views (13/13 plans) â completed 2026-05-06
- [x] Phase 4: Mobile-Responsive (5/5 plans) â completed 2026-05-07
- [x] Phase 5: SEO + Accessibility Polish (8/8 plans) â completed 2026-05-11
- [x] Phase 6: Backend + Content Population (9/9 plans) â completed 2026-05-11
- [x] Phase 7: Deploy + Verification (10/10 plans) â completed 2026-05-14

Full milestone detail (phase goals, success criteria, plan list) archived at [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

</details>

### ð§ v1.1 GitHub Repo Stats Enrichment (Phases 8â11)

- [x] **Phase 8: Project Schema Extension** â Add optional `repoUrls?: string[]` to Project across backend + frontend in a paired FE+BE commit
- [ ] **Phase 9: GitHub API Integration** â New `lib/github.ts` module with native fetch, daily ISR cache, token auth, disk-cache fallback, and unit tests
- [ ] **Phase 10: Projects UI Enrichment** â Compact stat strip on `/projects` cards + "Tech highlights" panel on project-detail with graceful degradation
- [ ] **Phase 11: Deploy + Smoke Verification** â `GITHUB_TOKEN` in Vercel Production, deploy notes documented, smoke test against live `/projects`, ISR-cache behaviour confirmed

## Phase Details

### Phase 8: Project Schema Extension
**Goal**: Backend and frontend agree on a new optional `Project.repoUrls?: string[]` field â the contract that every later v1.1 phase compiles against
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06, SCHEMA-07
**Paired-repo phase**: Yes â modifies both `portfolio-web/` and sibling `portfolio-services/` in coordinated commits per CLAUDE.md brownfield discipline (precedent: v1.0 Phase 6 paired waves). SCHEMA-07 requires the cross-reference to be recorded in the commit message of both repos.
**Success Criteria** (what must be TRUE):
  1. `GET /api/projects` on a re-seeded backend returns 4 projects, each with a `repoUrls` field populated (array of HTTPS GitHub URLs), no `_id` / `__v` leakage â verified by backend Jest spec covering presence/absence shape
  2. `lib/types.ts` `Project` interface exports `repoUrls?: string[]` with JSDoc documenting its purpose ("Public GitHub repo URLs for the GitHub-stats fetch â Phase 9 combines stats across all entries; distinct from the polymorphic `link` field"); `npm run build` + `tsc --noEmit` clean
  3. `lib/portfolio-data.ts` static fallback byte-mirrors `portfolio-services/src/seed/projects.json` for all four project entries including the new `repoUrls` field (D-14 discipline preserved); FE vitest asserts the field appears on every PROJECTS entry where present
  4. Schema change ships as a single paired commit pair (one BE SHA + one FE SHA cross-referenced in both commit messages); Mongoose `strict: 'throw'` invariant preserved on the Project model
**Plans**: 1 plan
- [x] 08-01-PLAN.md â Add optional repoUrls?: string[] to Project (BE model/DTO + FE interface), reconcile seed + fallback to the 4 live projects, paired BE+FE commit

### Phase 9: GitHub API Integration
**Goal**: `lib/github.ts` module fetches three GitHub REST endpoints per repo, combines stats across a project's `repoUrls`, returns typed `GitHubRepoStats | null` with daily ISR cache, token auth, disk-cache fallback, and never throws to callers
**Depends on**: Phase 8
**Requirements**: GH-01, GH-02, GH-03, GH-04, GH-05, GH-06, GH-07, GH-08, GH-09, GH-10
**Success Criteria** (what must be TRUE):
  1. `lib/github.ts` exports `getRepoStats(repoUrls: string[]): Promise<GitHubRepoStats | null>` (combines stats across every repo in the list â sums commits, merges languages, earliest `createdAt`, latest `pushedAt`) and the `GitHubRepoStats` type (shape: `{ createdAt, pushedAt, languages, commitCount }`); module uses native `fetch` only, with zero new prod dependencies (`npm ls @octokit/rest` returns nothing)
  2. With `GITHUB_TOKEN` set, the module calls `/repos/{o}/{r}`, `/repos/{o}/{r}/languages`, and `/repos/{o}/{r}/commits?per_page=1` with bearer auth and `next: { revalidate: 86400 }`; without the token, it falls back to unauthenticated requests and logs a one-line dev warning about the 60/hr ceiling
  3. The module returns `null` (never throws) on 404 / private repo / 5xx / rate-limit / parse error; on transient fetch failure it falls back to last-known stats persisted to a disk cache (e.g. `.next/cache/github-stats.json`) so a GitHub outage at deploy time does not break the build
  4. Vitest unit tests cover: Link-header commit-count parsing, language byte-sort, null-fallback paths (404, 5xx, network error), disk-cache fallback, and the rate-limit-header log; remaining-rate-limit headers (`X-RateLimit-Remaining`, `X-RateLimit-Reset`) are surfaced at dev log level
**Plans**: 1 plan
- [x] 09-01-PLAN.md — Build `lib/github.ts` (`getRepoStats` + `GitHubRepoStats` type) with native-fetch ISR, conditional bearer auth, Link-header commit counting, per-repo disk-cache outage fallback, and full Vitest coverage

### Phase 10: Projects UI Enrichment
**Goal**: `/projects` route surfaces a lean stat strip per card and each project's detail page renders a "Tech highlights" panel â both backed by `lib/github.ts`, both gracefully omitted when stats are null
**Depends on**: Phase 9
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, LIST-09, DETAIL-01, DETAIL-02, DETAIL-03, DETAIL-04, DETAIL-05, DETAIL-06, DETAIL-07, DETAIL-08, DETAIL-09
**Success Criteria** (what must be TRUE):
  1. Every project card on `/projects` that has a non-empty `repoUrls` AND non-null (combined) stats renders a one-line strip under the card formatted `<commits> commits Â· <lang1>[ / <lang2>][ / <lang3>] Â· <duration>` (e.g. `247 commits Â· TS / CSS Â· 4mo`), prefixed with a `gh:` (or octocat) source token; cards with empty/absent `repoUrls` or with null stats render unchanged (no strip, no placeholder, no "private" label)
  2. Each project's detail page renders a "Tech highlights" panel showing full language byte-breakdown with percentages (top 5 + "other"), date-range dev duration (`In development since Jan 2026 â 4mo`), relative last-active timestamp, prominent commit count, and a "View on GitHub â" CTA using the existing `ExternalLink` primitive with `target=_blank rel=noopener noreferrer` per SEO-05; panel omits cleanly when stats are unavailable
  3. Mobile readability validated at 480px: strip wraps gracefully via CSS `flex-wrap` (D-12 supersedes the "truncate to top-1" wording — no JS truncation), no horizontal scroll on the projects card row
  4. Detail-panel accessibility passes WCAG 2.1 AA color-contrast under all 4 accent hues Ã 2 themes (extension of v1.0 Phase 5 56-cell axe matrix â new panel selectors added to the contrast spec)
  5. Vitest covers strip rendering with stats present, strip rendering with null stats, the strip layout/wrap contract (retargeted from "truncation" per D-13), and the detail-panel rendering branches (present and null); strip integrates with existing `.projects-row` styling without introducing new top-level CSS sections (reuses tokens from `app/globals.css`)
**Plans**: 3 plans
- [x] 10-01-PLAN.md — Build `lib/project-stats.ts` pure formatters (`buildStripModel` / `buildPanelModel` + helpers) with exhaustive Vitest coverage (TDD)
- [x] 10-02-PLAN.md — Wire GitHub stats into `/projects`: new `ProjectRow` client-island disclosure, RSC parallel-fetch in `page.tsx`, strip + Tech highlights panel, `.projects-*` CSS extension
- [ ] 10-03-PLAN.md — Extend `tests/contrast.spec.ts` with a panel-visible path so the strip + panel selectors are scanned under all 4 hues × 2 themes (DETAIL-08)

### Phase 11: Deploy + Smoke Verification
**Goal**: Production cutover with `GITHUB_TOKEN` configured, deploy notes documented, real stats observable on https://www.tatibekov.com/projects, and daily-ISR behaviour confirmed
**Depends on**: Phase 10
**Requirements**: DEPLOY-V11-01, DEPLOY-V11-02, DEPLOY-V11-03, DEPLOY-V11-04, DEPLOY-V11-05
**Success Criteria** (what must be TRUE):
  1. `GITHUB_TOKEN` is configured in Vercel Production scope (read-only public-repo scope) and confirmed present via `vercel env ls` or equivalent; README / deploy notes document the variable, the required scope, and the consequence of its absence (graceful degradation to unauthenticated 60/hr ceiling)
  2. `npm run build`, `npm run lint`, `npm test`, and the INFRA-05 postbuild placeholder grep all exit 0 with the new `lib/github.ts` module + strip + panel integrated
  3. At least one production-served project card on https://www.tatibekov.com/projects shows real GitHub stats post-deploy (commit count + language(s) + duration visible to a visitor) â smoke test recorded in a verification artifact
  4. Daily ISR revalidate is confirmed: a second `curl` of `/projects` within the 86400s window does not produce a per-request GitHub API call (verified by observing `X-RateLimit-Remaining` not decrementing between back-to-back fetches, or by `next: { revalidate }` cache HIT in Vercel logs)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 8 â 9 â 10 â 11

**Parallelization opportunities (per config.json `parallelization: true`):**
- Phase 8 schema work must complete before Phases 9/10 can compile against the new `repoUrls` field; no in-phase parallelism (single paired commit)
- Phase 9 module work is testable in isolation against fixtures; no dependency on Phase 10
- Phase 10 is internally sequential by wave: Plan 01 (pure helpers) defines the model contract, Plan 02 (island + RSC wiring + CSS) consumes it, Plan 03 (contrast matrix) verifies the rendered panel. Each wave depends on the prior.
- Phase 11 verification is sequential and post-deploy only

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 8. Project Schema Extension | 1/1 | Complete | 2026-05-21 |
| 9. GitHub API Integration | 0/TBD | Not started | - |
| 10. Projects UI Enrichment | 2/3 | In Progress|  |
| 11. Deploy + Smoke Verification | 0/TBD | Not started | - |
