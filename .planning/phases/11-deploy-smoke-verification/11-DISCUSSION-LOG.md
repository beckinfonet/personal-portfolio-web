# Phase 11: Deploy + Smoke Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 11-deploy-smoke-verification
**Areas discussed:** Token setup, Deploy notes, Smoke artifact, ISR check

---

## Token setup

| Option | Description | Selected |
|--------|-------------|----------|
| Fine-grained PAT, dashboard | Fine-grained PAT (read-only, public-repo metadata), added via Vercel dashboard | ✓ |
| Classic PAT, dashboard | Classic PAT with public_repo scope, added via Vercel dashboard | |
| Vercel CLI (vercel env add) | Token added via `vercel env add` run locally | |
| Ship with no token | Deploy without token, accept 60 req/hr ceiling | |

**User's choice:** Fine-grained PAT, dashboard
**Notes:** Least-privilege token; provisioning step is owner-performed (Claude documents).

---

## Deploy notes

| Option | Description | Selected |
|--------|-------------|----------|
| Extend README + .env.example | Add GITHUB_TOKEN to README '## Deploy' and .env.example | |
| Dedicated docs/DEPLOY.md | New deploy runbook file | |
| Both | Pointer in README + fuller docs/DEPLOY.md | |

**User's choice:** Free-text — README only; remove `.env.example` from the repo.
**Notes:** Owner does not want `.env.example` extended — it holds no values and
raises false-positive warnings, so it should be `git rm`'d. Env documentation
consolidates into README. README's existing `cp .env.example .env.local`
instruction must be rewritten since the file is being removed.

---

## Smoke artifact

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown verification doc | Text-only verification .md with curl output + observations | ✓ |
| Markdown + screenshot | Verification doc plus a screenshot of the live card | |
| Screenshot only | Just a screenshot | |

**User's choice:** Markdown verification doc
**Notes:** Lives in the phase directory; captures which card showed real stats
and the curl evidence.

---

## ISR check

| Option | Description | Selected |
|--------|-------------|----------|
| Back-to-back curl, rate-limit headers | Two curls; confirm X-RateLimit-Remaining does not decrement | ✓ |
| Vercel function/cache logs | Inspect Vercel logs for cache HIT | |
| Both | Curl primary, logs cross-check | |

**User's choice:** Back-to-back curl, rate-limit headers
**Notes:** No Vercel dashboard log access needed.

---

## Claude's Discretion

- Exact `curl` invocations and rate-limit-header capture for the ISR check.
- Deploy trigger mechanism (Vercel git auto-deploy vs. manual `vercel --prod`).
- Verification-document file name and structure.
- Quality-gate run ordering relative to deploy.

## Deferred Ideas

None — discussion stayed within phase scope.

Roadmap-hygiene flag (not deferred work): ROADMAP.md shows Phase 9 as "Not
started" though it is effectively complete (`lib/github.ts` exists, Phase 10
shipped). Worth a checkbox/table correction, non-blocking.
