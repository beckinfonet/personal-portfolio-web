---
phase: 11-deploy-smoke-verification
plan: 01
subsystem: deploy-docs
tags: [docs, deploy, env, provisioning, github-token]
requires:
  - lib/github.ts (Phase 9 — GITHUB_TOKEN consumer)
  - Project.repoUrls schema (Phase 8)
  - /projects strip + Tech-highlights panel (Phase 10)
provides:
  - README env/deploy docs inlining all three env vars with GITHUB_TOKEN
  - 11-PROVISIONING-GUIDE.md — owner-facing GitHub PAT + Vercel dashboard steps
  - 11-SMOKE-VERIFICATION.md — ready-to-fill smoke + ISR verification scaffold
affects:
  - Plan 02 (deploy + smoke test) — unblocked by this plan
tech-stack:
  added: []
  patterns:
    - brownfield discipline — README rewrite + .env.example removal in one commit
key-files:
  created:
    - .planning/phases/11-deploy-smoke-verification/11-PROVISIONING-GUIDE.md
    - .planning/phases/11-deploy-smoke-verification/11-SMOKE-VERIFICATION.md
  modified:
    - README.md
  deleted:
    - .env.example
decisions:
  - D-04 — env/deploy docs live in README.md, no separate docs/DEPLOY.md
  - D-05 — .env.example removed; README cp instruction replaced with inline list
metrics:
  duration: ~6m
  tasks: 2
  files: 4
  completed: 2026-05-22
---

# Phase 11 Plan 01: Deploy Docs + Provisioning Scaffold Summary

Rewrote the README `## Environment` and `## Deploy` sections to inline all three
env vars (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `GITHUB_TOKEN`)
with purpose/scope/absence-consequence, removed the tracked `.env.example` in the
same commit, verified the local quality gates green, and authored the owner
provisioning guide plus the smoke-verification scaffold that Plan 02 fills in.

## What Shipped

### Task 1 — README rewrite + `.env.example` removal (commit `c81bc5f`)

- `## Environment` no longer contains `cp .env.example .env.local` or any
  `.env.example` reference. It now lists the three env vars with a purpose line
  and an absence-consequence line each.
- `GITHUB_TOKEN` documented as a **server-only** secret (no `NEXT_PUBLIC_`
  prefix) requiring a fine-grained, read-only, public-repo-metadata PAT, with a
  pointer to the provisioning guide.
- `## Deploy` rewritten — the Vercel bullet now references Production-scope env
  vars and the provisioning guide instead of `.env.example`.
- `.env.example` removed via `git rm` in the **same commit** (D-05, brownfield
  discipline — README and deletion never split).

### Task 2 — quality gates + provisioning/verification docs (commit `ab8ba3c`)

- Local quality gates verified, all exit 0:
  - `npm run lint` → exit 0
  - `npm test` → exit 0 (255 tests across 33 files passing)
  - `npm run build` → exit 0; `postbuild` `check-placeholders.mjs` printed
    `✓ INFRA-05: .next/server/ clean`; `prebuild` resume PDF/DOCX gates passed.
- `11-PROVISIONING-GUIDE.md` (113 lines) — owner step-by-step for creating a
  fine-grained read-only public-repo-metadata PAT (D-01), adding `GITHUB_TOKEN`
  via the Vercel dashboard Production scope (D-02), and confirming with
  `vercel env ls` (D-03). States explicitly the token value lives only in the
  Vercel Production scope and the owner's local `.env.local`, never the repo.
- `11-SMOKE-VERIFICATION.md` (122 lines) — scaffold with empty result slots for
  `vercel env ls` key-presence confirmation, the deploy, a project-card stats
  table (commit count + languages + duration, naming the likely-public
  mobile-app repos per D-07), and the back-to-back `curl` rate-limit ISR check
  using a `<TOKEN>` placeholder (D-08).

## Deviations from Plan

### Process Note (not a code deviation)

- **Task 1 commit assembled in two git operations.** The initial `git add
  README.md .env.example` aborted on the `.env.example` pathspec (already staged
  for deletion by the earlier `git rm`), so the first commit captured only the
  `.env.example` deletion. This was immediately corrected with `git commit
  --amend` to add the README rewrite, producing a single commit (`c81bc5f`)
  containing both changes — satisfying D-05 brownfield discipline (README
  rewrite + `.env.example` deletion in one commit). The amend corrected an
  incomplete in-progress commit; no published work was modified.

No code-behavior deviations. No Rule 1/2/3 auto-fixes were needed — this plan is
documentation and verification only.

## Authentication Gates

None encountered. The GitHub/Vercel dashboard auth that Claude cannot perform is
deferred to the owner by design — `11-PROVISIONING-GUIDE.md` is the artifact
that hands off those steps. Plan 02 carries the deploy + smoke test.

## Known Stubs

`11-SMOKE-VERIFICATION.md` is an intentional scaffold with `_<fill in>_` result
slots — by design, per D-06. Plan 02 populates it after the owner provisions
`GITHUB_TOKEN` and the production deploy runs. This is the planned hand-off, not
an unresolved stub.

## Verification

- `grep` confirms `README.md` contains `GITHUB_TOKEN` and contains neither
  `.env.example` nor `cp .env.example`.
- `git ls-files --error-unmatch .env.example` confirms `.env.example` is no
  longer tracked.
- `npm run lint`, `npm test`, `npm run build` (with prebuild + postbuild) all
  exit 0.
- Both phase-directory documents exist (provisioning 113 lines ≥ 30 required;
  smoke 122 lines ≥ 25 required) with the required sections and no secret value.

## Self-Check: PASSED

- README.md modified — FOUND
- .env.example untracked — CONFIRMED (`git ls-files` does not list it)
- 11-PROVISIONING-GUIDE.md — FOUND
- 11-SMOKE-VERIFICATION.md — FOUND
- Commit c81bc5f — FOUND
- Commit ab8ba3c — FOUND
