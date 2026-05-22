---
phase: 11-deploy-smoke-verification
plan: 02
subsystem: deploy-verification
tags: [deploy, smoke-test, github-token, isr, verification]
requires:
  - 11-PROVISIONING-GUIDE.md (Plan 01 — owner provisioning runbook)
  - 11-SMOKE-VERIFICATION.md (Plan 01 — verification scaffold)
  - lib/github.ts (Phase 9 — GITHUB_TOKEN consumer, daily ISR)
provides:
  - GITHUB_TOKEN live in Vercel Production scope
  - production deploy of the v1.1 GitHub-stats feature on https://www.tatibekov.com
  - completed 11-SMOKE-VERIFICATION.md with all observed evidence
affects:
  - Phase 11 complete — milestone v1.1 production cutover done
tech-stack:
  added: []
  patterns:
    - human-in-the-loop checkpoints — owner performs GitHub/Vercel auth steps
    - surgical data backfill over full re-seed when seed files have drifted
key-files:
  created:
    - .planning/phases/11-deploy-smoke-verification/11-02-SUMMARY.md
  modified:
    - .planning/phases/11-deploy-smoke-verification/11-SMOKE-VERIFICATION.md
  deleted: []
decisions:
  - D-01/D-02/D-03 — GITHUB_TOKEN provisioned as a fine-grained read-only PAT via
    the Vercel dashboard Production scope; presence confirmed
  - D-06/D-07 — smoke test recorded as Markdown; all 4 cards show real stats
  - D-08 — daily ISR confirmed via back-to-back rate-limit probes
metrics:
  duration: ~human-paced (3 checkpoints)
  tasks: 3
  files: 1
  completed: 2026-05-22
---

# Phase 11 Plan 02: Deploy + Smoke Verification Summary

The human-in-the-loop production cutover for the v1.1 GitHub-stats feature. The
owner provisioned `GITHUB_TOKEN` in the Vercel Production scope, the deploy went
live on https://www.tatibekov.com, and the live `/projects` page was smoke-tested
and confirmed to hold daily-ISR caching. All evidence is recorded in
`11-SMOKE-VERIFICATION.md`.

## What Shipped

### Task 1 — GITHUB_TOKEN provisioned (commit `6cd4d15`)

- Owner created a GitHub fine-grained PAT (read-only, public-repo metadata scope
  only — D-01) and added it as `GITHUB_TOKEN` in the Vercel dashboard, Production
  scope (D-02).
- Presence confirmed via the Vercel dashboard Environment Variables list —
  `GITHUB_TOKEN` tagged `Sensitive`, `Production` (D-03). Key name and scope
  recorded; the token value was never written to any file.

### Task 2 — production deploy + smoke test (commits `b7160e3`, `03f10b3`)

- Deploy triggered by pushing `main` to origin (68 commits, `3db7080..6cd4d15`);
  Vercel git-integration auto-deployed. `/projects` returns HTTP 200.
- Smoke test: all 4 production project cards render a real `gh:` stat strip —
  Validation Ledger (285 commits · Swift · 1mo), Looper (18 · TS/Shell · 1mo),
  MoveIn: Real Estate (874 · TS/JS · 3mo), CarEx (426 · TS/JS · 4mo). `curl`
  evidence captured (4 `gh-token` strip spans in the production HTML).

### Task 3 — daily ISR confirmed

- Back-to-back GitHub `rate.remaining` probes around a `/projects` load both
  returned `4998` — no decrement, proving the page served from the daily ISR
  cache (`revalidate: 86400`) and made zero per-request GitHub API calls (D-08).
- The `4998` value sits in the authenticated 5,000/hr bucket, corroborating that
  production is using the provisioned token.

## Deviations from Plan

### Production blocker found and resolved (cross-repo)

The first smoke-test attempt showed **no strips on any card**. Systematic
investigation found the root cause was **not** a portfolio-web defect: the
production backend `GET /api/projects` returned all 4 projects without the
`repoUrls` field, so `app/(terminal)/projects/page.tsx` never called
`getRepoStats` and every card correctly degraded to no strip (LIST-07). The
production Railway MongoDB had never been re-seeded after Phase 8 added
`repoUrls`.

A full `npm run seed` was deliberately rejected — the backend seed files have
drifted behind hand-edited production data (`profile` highlights/shortName) and
renamed apps, so a full seed would have clobbered real values. Instead a
surgical, projects-only backfill script was written —
`portfolio-services/scripts/backfill-project-repourls.mjs` — which `$set`s only
`repoUrls` on the 4 project documents by name, touching no other field or
collection. The owner ran it against the production database; all 4 cards then
rendered. This backfill lives in the sibling `portfolio-services` repo (a paired
cross-repo action) and is not committed by this plan.

## Authentication Gates

All 3 tasks were human-action / human-verify checkpoints by design — creating
the GitHub PAT, adding it in the Vercel dashboard, triggering the deploy, and
observing the live page require GitHub/Vercel auth Claude does not hold. The
owner performed each; Claude composed the commands and recorded the evidence.

## Verification

- `GET /api/projects` (production backend) now serves `repoUrls` on all 4 projects.
- `curl https://www.tatibekov.com/projects` shows 4 `gh-token` strip spans with
  commit counts 285 / 18 / 874 / 426.
- Back-to-back `rate.remaining` probes both returned `4998` (ISR cache HIT).
- `11-SMOKE-VERIFICATION.md` is complete; no token value appears in any committed file.

## Self-Check: PASSED

- 11-SMOKE-VERIFICATION.md complete (all sections filled, overall verdict PASS) — CONFIRMED
- GITHUB_TOKEN present in Vercel Production scope — CONFIRMED (dashboard)
- All 4 /projects cards show real GitHub stats — CONFIRMED (live + curl)
- Daily ISR confirmed (4998 == 4998) — CONFIRMED
- No secret token value in any committed file — CONFIRMED
- Commits 6cd4d15, b7160e3, 03f10b3 — FOUND
