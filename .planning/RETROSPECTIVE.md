# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 — GitHub Repo Stats Enrichment

**Shipped:** 2026-05-22
**Phases:** 4 | **Plans:** 7 | **Tasks:** 10

### What Was Built
- `Project.repoUrls?: string[]` schema field across backend Mongoose model + DTO and frontend types, shipped as a paired BE+FE commit.
- `lib/github.ts` — a server-only GitHub data module: native `fetch`, conditional `GITHUB_TOKEN` bearer auth, daily ISR, per-repo disk-cache outage fallback, never-throws contract, 21 unit tests, zero new dependencies.
- `/projects` UI enrichment — a `gh:` stat strip per card and an expandable "Tech highlights" panel, both gracefully omitted when stats are null.
- Production cutover to https://www.tatibekov.com with `GITHUB_TOKEN` provisioned in Vercel; all 4 cards verified showing real stats; daily ISR confirmed.

### What Worked
- The never-throws / graceful-degradation contract on `lib/github.ts` meant a missing data field degraded cleanly (no strip) instead of crashing — the production blocker showed as "no strips" rather than a 500.
- Systematic debugging on the "no strips" smoke-test failure found the real root cause (stale production DB) in one pass instead of guessing at frontend code.
- Choosing a surgical projects-only backfill over a full `npm run seed` avoided clobbering hand-edited production data — the diff-before-write check caught that the seed files had drifted.
- The smoke-test phase (Phase 11) did real end-to-end production verification, which caught a data-layer gap that all the unit tests and the build passed straight through.

### What Was Inefficient
- The production MongoDB was never re-seeded after Phase 8 added `repoUrls`, so the gap stayed invisible until the Phase 11 smoke test — three phases after the schema change. A schema-to-data deploy step belonged in Phase 8 or 9, not discovered at cutover.
- Phase 10's "480px mobile strip wrap" verification was left as an unresolved `human_needed` item that surfaced again at milestone close — human-verify items should be closed when raised, not deferred silently.
- The backend seed files (`profile.json`, `apps.json`) have drifted behind hand-edited production values, making the standard `npm run seed` unsafe to run — discovered only because re-seeding was needed.

### Patterns Established
- Paired BE+FE commits with cross-referenced SHAs for schema changes spanning both repos.
- Surgical data backfill scripts (raw collection `$set`, dry-run default) over full re-seeds when seed files have drifted from production.
- Production smoke test as a real exit gate — observe the live page, not just green CI.

### Key Lessons
1. A schema field is not "shipped" until the production datastore actually carries it — adding a field to the model + seed file is not the same as the production DB having it. Re-seed (or migrate) production as part of the schema phase.
2. Seed files drift. Diff seed-vs-production before running any seeder; treat a full re-seed as destructive once a DB has had manual edits.
3. Close `human_needed` verification items when they are raised — a deferred visual check resurfaces as a milestone-close blocker.

### Cost Observations
- Model mix: Opus for research/planning/execution, Sonnet for plan-checking and verification (per the project's quality profile).
- Notable: the milestone shipped in ~1 calendar day (2026-05-21 → 2026-05-22); the longest single step was diagnosing the production data blocker, not writing code.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 7 | 58 | Initial build — full terminal-portfolio MVP |
| v1.1 | 4 | 7 | Feature increment; smoke-test phase caught a production data gap |

### Cumulative Quality

| Milestone | Tests | Zero-Dep Additions |
|-----------|-------|-------------------|
| v1.0 | 161 | — |
| v1.1 | 255 | `lib/github.ts` (native fetch, no `@octokit/rest`) |

### Top Lessons (Verified Across Milestones)

1. Production verification against the live deployment catches what build + unit tests miss (v1.0 Phase 7 deferrals; v1.1 Phase 11 data blocker).
2. Keep the prod dependency count flat — native `fetch` covered the GitHub integration with zero new deps, consistent with the v1.0 stack discipline.
