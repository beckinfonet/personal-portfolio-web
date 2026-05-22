# Phase 11: Deploy + Smoke Verification - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 11 is the production cutover for the v1.1 GitHub-stats feature. The
schema (`Project.repoUrls`, Phase 8), the data module (`lib/github.ts`,
Phase 9), and the `/projects` strip + Tech-highlights panel (Phase 10) are all
built and merged. This phase makes them live and proves them in production:

1. Provision the `GITHUB_TOKEN` secret in Vercel Production scope.
2. Document the `GITHUB_TOKEN` requirement, scope, and absence consequence.
3. Run the local quality gates green with the new module integrated.
4. Deploy, then smoke-test the live `https://www.tatibekov.com/projects` page.
5. Confirm daily-ISR revalidate holds (no per-request GitHub call).

**Not in this phase:** any new feature code — schema, `lib/github.ts`, and the
UI surfaces are done. No new prod deps. No route-group or framework changes.
This is provisioning, documentation, and verification only.

**Human-in-the-loop:** Several steps need the owner's hands because they
require Vercel/GitHub auth that Claude does not hold — creating the GitHub PAT,
adding it in the Vercel dashboard, and observing the live production page.
Claude documents the exact steps and runs everything scriptable.

</domain>

<decisions>
## Implementation Decisions

### Token provisioning (DEPLOY-V11-01)
- **D-01:** `GITHUB_TOKEN` is a **fine-grained Personal Access Token** —
  read-only, public-repo metadata scope only (no write, no private access).
  Minimum surface that still lifts the rate-limit ceiling from 60/hr to
  5000/hr.
- **D-02:** The token is added via the **Vercel dashboard** (Project Settings →
  Environment Variables → Production scope), not the CLI. The plan must produce
  a precise step-by-step the owner follows; Claude cannot perform this step.
- **D-03:** Presence is confirmed after provisioning via `vercel env ls` (or
  the dashboard) — the verification artifact records that confirmation.

### Deploy notes home (DEPLOY-V11-02)
- **D-04:** Deploy/env documentation lives in **`README.md`** — the existing
  `## Environment` and `## Deploy` sections are rewritten to inline every env
  var (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, and the new
  `GITHUB_TOKEN`) with its purpose, scope, and the consequence of absence
  (GitHub stats degrade gracefully to the unauthenticated 60/hr ceiling). No
  separate `docs/DEPLOY.md`.
- **D-05:** **`.env.example` is removed from the repo** (`git rm .env.example`,
  it is currently tracked). Reason given by the owner: it holds no real values
  and is raising false-positive warnings. Consequence the plan MUST handle:
  the current README `## Environment` section instructs `cp .env.example
  .env.local` — that instruction breaks once the file is gone, so the README
  rewrite in D-04 must replace it with an explicit inline list of vars to set
  in `.env.local`.

### Smoke-test artifact (DEPLOY-V11-04)
- **D-06:** The smoke test is recorded as a **Markdown verification document**
  inside `.planning/phases/11-deploy-smoke-verification/`. It captures: which
  production project card showed real GitHub stats (commit count + language(s)
  + duration), the observed values, and the `curl` evidence. Text-only — no
  screenshot required.
- **D-07:** Smoke-test target: at least **one** card must show real stats.
  Several portfolio `repoUrls` point at `*-services` / `*-agentic` repos that
  may be private — private repos degrade to no-strip by design, which is
  acceptable. The owner should confirm which repos are public so the plan
  knows a non-null card is reachable; the mobile-app repos
  (`validation-ledger-mobile`, `LooperMobile`, `jaytap-mobile`, `CarEx`) are
  the most likely public candidates.

### ISR confirmation (DEPLOY-V11-05)
- **D-08:** Daily-ISR is confirmed by **back-to-back `curl` of `/projects`**
  within the 86400s window, observing that GitHub's `X-RateLimit-Remaining`
  header does **not** decrement between the two fetches — proving the second
  request served cached data with no per-request GitHub API call. No Vercel
  dashboard log inspection required.

### Claude's Discretion
- The exact `curl` invocation(s) and how rate-limit headers are surfaced for
  the D-08 check — the module already logs `X-RateLimit-Remaining` /
  `X-RateLimit-Reset` at dev level; the planner decides how to capture them.
- Deploy trigger mechanism (Vercel git integration auto-deploy on push to
  `main` vs. manual `vercel --prod`) — discover and follow the project's
  existing Vercel setup.
- Verification-document file name and exact structure within the phase
  directory.
- Ordering of the quality-gate run (`build` / `lint` / `test` / postbuild
  placeholder grep) relative to the deploy.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` § "Phase 11: Deploy + Smoke Verification" — phase
  goal and the 4 success criteria.
- `.planning/REQUIREMENTS.md` lines 65–69 — DEPLOY-V11-01..05 requirement text.
- `.planning/PROJECT.md` — project overview, stack constraints, deploy target
  (`https://www.tatibekov.com`, Vercel-hosted).

### Feature under verification
- `lib/github.ts` — the data module being taken live; defines `GITHUB_TOKEN`
  conditional bearer auth, daily ISR (`revalidate: 86400`), the disk-cache
  fallback at `.next/cache/github-stats.json`, and the `X-RateLimit-*` dev
  logging used for the D-08 ISR check.
- `.planning/phases/10-projects-ui-enrichment/10-CONTEXT.md` — the `/projects`
  strip + Tech-highlights panel decisions (graceful-degradation contract that
  the smoke test exercises).

### Build gates
- `scripts/check-placeholders.mjs` — the INFRA-05 `postbuild` placeholder grep
  that must exit 0 (DEPLOY-V11-03).
- `package.json` `scripts` — `prebuild` (`check-resume-pdf` + `check-resume-docx`),
  `postbuild` (`check-placeholders`), plus `build` / `lint` / `test`.

### Files to edit
- `README.md` § `## Environment` and `## Deploy` — rewritten per D-04/D-05.
- `.env.example` — removed per D-05.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/github.ts` already implements everything needed at runtime — token
  auth, daily ISR, disk-cache outage fallback, rate-limit header logging.
  Phase 11 adds **no module code**; it only provisions the secret and verifies
  observable behaviour.
- `lib/api.ts` ISR + silent-fallback pattern is the precedent `lib/github.ts`
  mirrors — useful context for understanding cache behaviour during the smoke
  test.

### Established Patterns
- Quality gates are wired into npm lifecycle: `prebuild` and `postbuild` run
  automatically around `npm run build`. DEPLOY-V11-03's "postbuild placeholder
  grep" is `scripts/check-placeholders.mjs`, invoked by `postbuild`.
- Env vars: `.gitignore` excludes `.env`, `.env.local`, `.env*.local`;
  `.env.example` is the only tracked env file (and is being removed).
- All 4 projects carry `repoUrls` in both `lib/portfolio-data.ts` (static
  fallback) and `../portfolio-services/src/seed/projects.json` — the FE/BE
  byte-mirror discipline from Phase 8 is intact.

### Integration Points
- Production env: Vercel Project Settings → Environment Variables → Production
  scope. `NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com` is already documented
  as a Production var; `GITHUB_TOKEN` joins it.
- The disk cache (`.next/cache/github-stats.json`) lives inside Vercel's
  build/ISR cache — relevant if a GitHub outage coincides with a deploy.

</code_context>

<specifics>
## Specific Ideas

- Owner explicitly wants `.env.example` gone from GitHub — it has no values and
  triggers false-positive warnings (likely a secret-scanner / env-detection
  false positive). This is a deliberate repo-hygiene change folded into the
  deploy phase, not scope creep — it is part of "document the env-var
  requirement correctly."
- Fine-grained PAT preferred over classic PAT for least-privilege.
- Verification is text-first (Markdown + `curl` evidence) — no screenshots
  expected.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

**Note (not a deferred idea, a roadmap-hygiene flag):** `.planning/ROADMAP.md`'s
phase list and progress table show Phase 9 as "Not started", but `lib/github.ts`
exists, `09-01-PLAN.md` is checked, and Phase 10 (which depends on 9) is
complete. Phase 9 is effectively done — the checkbox/table is stale. Worth
correcting during planning or a roadmap touch-up, but it does not block Phase 11.

</deferred>

---

*Phase: 11-deploy-smoke-verification*
*Context gathered: 2026-05-22*
