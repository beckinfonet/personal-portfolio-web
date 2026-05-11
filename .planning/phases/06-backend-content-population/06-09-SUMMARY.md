---
phase: 06-backend-content-population
plan: 09
subsystem: backend-deploy
tags: [phase-6, wave-9, deploy, railway, vercel, mongo-seed, cutover, paired-commit, recruiter-gate, phase-close-out]

requires:
  - phase: 06-08
    provides: Real resume PDF + DOCX shipped (canonical filenames at /Bakytbek_Tatibekov_Resume.{pdf,docx}); CarEx + MoveIn real apps swapped into FE SHIPPED + BE seed/apps.json; D-17 highlights[1].value reconciled to 2 (Case A); all 7 v1 BE endpoints wired in code (BE c4e8870); FE production-shaped at d8650a8; portfolio-services origin/main still at 235887b scaffold (8 commits behind local HEAD — pushed during this wave)
provides:
  - portfolio-services production deployment on Railway at https://personal-portfolio-services-production.up.railway.app (Express service + managed Mongo plugin, NODE_ENV=production, PORT=8080 manually set per Railway domain-generation quirk)
  - portfolio-services origin/main advanced 235887b → c4e8870 (8 commits ahead: Waves 0-8 of Phase 6 — first time Railway sees the real BE code)
  - Production Mongo seeded via `npm run seed` (Railway CLI from local machine) — 6 collections populated: profile=1 (beckprograms@gmail.com), projects=3 (Terminal Portfolio + Portfolio Services + GSD Workflow), stack=4 (languages + frameworks + cloud + ai), experience=3, apps=2 (CarEx + MoveIn), posts=1 (RSC Discipline)
  - portfolio-web production deployment on Vercel at https://personal-portfolio-web-orcin.vercel.app — NEXT_PUBLIC_API_BASE_URL set in Production scope to the Railway URL; redeploy completed; all 7 RSC views render real backend content (no static-fallback leakage)
  - portfolio-services/README.md + Deployment section (Railway URL + database notes + smoke-gate command + contract link)
  - .planning/STATE.md updated to Phase 6 closed; completed_phases 5→6; completed_plans 47→48; percent 98→100
  - .planning/ROADMAP.md Phase 6 entry marked `- [x]` with completion date + 06-09 plan row marked complete
  - .planning/REQUIREMENTS.md BACKEND-03 + BACKEND-04 flipped Pending → Complete (the only two outstanding Phase 6 requirements after Wave 8)
  - Pre-cutover security bump landed in orchestrator-injected scope (NOT part of plan tasks): next 15.5.15 → 15.5.18 on the same minor (Vercel deploy dashboard surfaced "Vulnerable version of Next.js detected" warning; backport-line patch resolves it; commit 1d9a295)
affects:
  - phase-7 (Deploy + Verification — production URL is now live and ready for Lighthouse / Search Console / recruiter 5-second test; resume PDF + DOCX dual-format both reachable via production)

tech-stack:
  added: []
  patterns:
    - "Two-repo deploy sequence: BE first (Railway auto-rebuilds on push), seed against prod Mongo via Railway CLI, smoke-gate against the production URL (D-11 readiness check), THEN flip FE env var and redeploy. Without the smoke-gate gate, a wrong NEXT_PUBLIC_API_BASE_URL value or unreachable BE collection would surface only in the FE eyeball gate — much later, harder to triage."
    - "NEXT_PUBLIC_* env vars inline at build time on Vercel (Pitfall 7). Setting the value in dashboard alone is a no-op without a redeploy. Confirmed end-to-end: after redeploy, /shipped serves CarEx + MoveIn (BE shape) rather than the FE static-fallback shape; only achievable if Vercel's build inlined the new URL."
    - "Pre-cutover security audit pass: orchestrator caught Vercel's 'Vulnerable version of Next.js' warning BEFORE entering Plan 06-09. Backport-line patch (next@15.5.18 from `npm view next dist-tags`.backport) preferred over latest-line jump (next@16.2.6) to keep cutover scope minimal — major-version upgrade is a separate evaluation. Establishes the pattern: deploy-blocker security warnings get resolved as a same-session pre-task fix, NOT deferred to Phase 7."

key-files:
  created:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.planning/phases/06-backend-content-population/06-09-SUMMARY.md
  modified:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.planning/STATE.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.planning/ROADMAP.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.planning/REQUIREMENTS.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/package.json
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/package-lock.json
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/README.md
  deleted: []

key-decisions:
  - "Task 2 (conditional env.ts patch) SKIPPED. Developer pasted the literal mongodb:// connection string into Railway's existing MONGO_URI service env var (overwriting the dev-time localhost default). The plan's defensive fallback chain (MONGO_URI → MONGO_URL → DATABASE_URL) was not needed because Railway is now injecting the correct variable name. RESEARCH Assumption A2 disposition: literal-string set, not reference-variable; equivalent outcome, zero code change. env.ts unchanged on this wave."
  - "Pre-cutover security bump (next 15.5.15 → 15.5.18) injected ahead of plan Task 1. Not in plan scope, but Vercel dashboard surfaced a CVE warning that would have either blocked the deploy or surfaced to recruiters. Patch bump on the same minor (npm view next dist-tags.backport → 15.5.18) chosen over latest-line (16.2.6) to keep cutover scope tight. Verified locally: lint clean / 160-160 vitest / build green / INFRA-05 grep clean / bundle size unchanged at 102 kB First Load JS. Committed standalone as 1d9a295 + pushed to origin/main before entering plan Tasks. Auto-triggered Vercel rebuild with the patched Next.js."
  - "portfolio-services push 235887b → c4e8870 (8 commits) was THE blocking deploy gap. Railway auto-deploys from GitHub main; without the push, Railway was serving the original scaffold (only /api/health + /api/profile + old-shape /api/experience + /api/apps + /api/posts; no /api/projects, no /api/stack — those came in Wave 1 + Wave 7). Discovery method: probe /api/projects → 404 + /api/stack → 404 after Task 1's reachability test. Fix: `cd ../portfolio-services && git push origin main`; Railway auto-redeployed in ~60s; re-probe confirmed all 7 routes register with the new DTO shapes."
  - "Mongo seeded via Railway CLI (locally invoked, run from developer's machine using Railway-injected MONGO_URI) — Option A from plan Task 3's three options. Option B (Railway dashboard 'Run command') and Option C (mongosh paste) not used. Counts verified by re-probing each endpoint and counting array length (profile=1 singleton, projects=3, stack=4, experience=3, apps=2, posts=1) — all within plan must_haves (profile=1 exact, projects>=3, stack>=1, experience>=1, apps∈{2,3}, posts=1)."
  - "D-11 smoke gate (PROD_API_URL=https://<railway-url> npm run smoke) ran from local portfolio-services working tree against the production URL — `✓ check-backend: all 7 endpoints green` with exit code 0. This is the canonical D-11 readiness check before flipping the Vercel env var; running it AFTER the seed but BEFORE the env-flip prevents wrong-URL or unseeded-collection issues from leaking into the FE redeploy step."
  - "Vercel NEXT_PUBLIC_API_BASE_URL set in Production scope (Preview scope intentionally NOT included — preview deploys can continue to hit local backend or the static fallback during ongoing development). Value: https://personal-portfolio-services-production.up.railway.app (no trailing slash — lib/api.ts appends '/api/<endpoint>' itself). Redeploy confirmed via remote sanity check: GET https://personal-portfolio-web-orcin.vercel.app/shipped HTML contains 'CarEx' + 'MoveIn' (BE-sourced) and NOT 'Demo App' / 'placeholder' (FE static-fallback shape)."
  - "Single paired-commit pair following established Wave 2-8 convention. BE commit (README.md Deployment section) cites '<pending FE SHA — recorded in 06-09-SUMMARY.md, one-direction-current per Wave 1 Rule-1>'; FE commit (4 .planning/ files + 06-09-SUMMARY.md) cites BE SHA verbatim. BE will NOT be amended. Durable cross-reference recorded in this SUMMARY's metrics section."
  - "Plan Task 2 condition matrix resolved: developer chose 'literal mongodb:// connection string' path → Task 2 skipped; tasks executed in order 1 (Railway provision), 3 (seed), 4 (smoke gate), 5 (Vercel env-flip), 6 (eyeball — APPROVED with no caveats), 7 (close-out). 6/7 plan tasks executed + 1 skipped per condition; orchestrator-injected security bump (NOT counted as a plan task; tracked separately above)."
  - "Phase 6 close-out verdict: PASS. 12/12 phase requirements shipped (BACKEND-01 through BACKEND-04, CONTENT-01 through CONTENT-08). All 7 production routes render real backend content. Resume PDF + DOCX dual-format both reachable on production. Recruiter 5-second test deferred to Phase 7 manual verification (production URL is now live and ready for that gate). No carry-forward items."

metrics:
  duration: "~90 min total wall-clock (mostly human dashboard work: ~60 min Railway provision + Mongo plugin + env vars + first deploy + domain generation; ~15 min seed + smoke-gate triage + BE push wait for Railway redeploy; ~10 min Vercel env-flip + redeploy; ~5 min eyeball pass). Agent-side time ~6 min (security bump + probes + sanity checks + Task 7 docs writes + paired commits)."
  tasks: "6/7 executed (1 + 3 + 4 + 5 + 6 + 7), 1 skipped per condition (Task 2 env.ts patch — not needed because developer set literal MONGO_URI); 1 orchestrator-injected security bump out-of-plan-scope"
  commits_in_portfolio_services: "1 (BE README.md Deployment section; cites <pending FE SHA — recorded in 06-09-SUMMARY.md, one-direction-current per Wave 1 Rule-1>)"
  commits_in_portfolio_web: "2 (1d9a295 security bump pre-Task-1 + this wave's close-out commit citing BE SHA verbatim)"
  paired_commit_pair: "BE <pending — see commit log after BE README commit lands> ↔ FE <pending — see commit log after FE close-out commit lands>"
  vitest_count: "160 passed (unchanged from end of Wave 8 — no FE source code changed; security bump was deps-only)"
  jest_count: "8 passed (unchanged from end of Wave 8 — no BE source code changed; only README.md modified)"
  build: "npm run build → 23/23 static pages, postbuild INFRA-05 grep clean, 102 kB First Load JS"
  smoke_gate_output: |
    > portfolio-services@1.0.0 smoke
    > node scripts/check-backend.mjs

    ✓ /api/health
    ✓ /api/profile
    ✓ /api/projects
    ✓ /api/stack
    ✓ /api/experience
    ✓ /api/apps
    ✓ /api/posts

    ✓ check-backend: all 7 endpoints green
    exit 0
  collection_counts:
    profile: 1
    projects: 3
    stack: 4
    experience: 3
    apps: 2
    posts: 1
  requirements_satisfied: [BACKEND-03, BACKEND-04]
  phase_requirements_total: 12
  phase_requirements_complete: 12
---

# Plan 06-09 — Phase 6 Wave 9 (Final): Production Deploy Cutover

## What shipped

**Production backend live on Railway:**
- URL: `https://personal-portfolio-services-production.up.railway.app`
- Express service + managed MongoDB plugin (same Railway project)
- Service env: `MONGO_URI` = literal mongodb:// connection string from the plugin; `NODE_ENV` = `production`; `PORT` = `8080` (manually set per Railway's domain-generation quirk — Railway's "Generate Domain" feature wouldn't expose the service until a PORT value was set explicitly; functionally identical to the default 4000 since Railway's proxy forwards to whichever port the app binds)
- Deploys from GitHub `beckinfonet/personal-portfolio-services` main branch; auto-rebuild on push
- All 7 v1 endpoints reachable: `/api/health`, `/api/profile`, `/api/projects`, `/api/stack`, `/api/experience`, `/api/apps`, `/api/posts`

**Mongo seeded with real content (via Railway CLI from local machine):**
- 1 profile (Bakytbek Tatibekov, `beckprograms@gmail.com`, real bio, `12+ years engineering`/`2 apps shipped`/`OSS` highlights)
- 3 projects (Terminal Portfolio 2026 shipped + Portfolio Services 2026 shipped + GSD Workflow 2025 active)
- 4 stack categories (languages: TS/Python/Swift; frameworks: Next/React/RN; cloud: AWS; ai: LangChain/agentic)
- 3 experience entries (Independent 2022–present + Confidential 2019–2022 + Confidential earlier)
- 2 shipped apps (CarEx iOS+Android + MoveIn iOS+Android, both with real App Store + Play Store URLs)
- 1 post (RSC Discipline: Keeping the Persistent Shell Pure)

**Production frontend live on Vercel:**
- URL: `https://personal-portfolio-web-orcin.vercel.app`
- `NEXT_PUBLIC_API_BASE_URL` = Railway production URL (Production scope only; Preview scope deliberately unset for ongoing dev work)
- Redeploy completed AFTER env var was saved (Pitfall 7 — without a redeploy, the NEXT_PUBLIC_* var is dead weight; verified by remote curl of /shipped finding "CarEx" + "MoveIn" in the HTML, which is BE-sourced shape not FE static-fallback shape)
- All 7 routes render real backend content; resume PDF (`Bakytbek_Tatibekov_Resume.pdf`, 58440 bytes, application/pdf, content-disposition with the correct filename) downloads from `/` top-bar
- Print preview of `/` shows PrintFooter with resume CTA + email + GitHub URL (Phase 4 contract preserved through Phase 6 data-only changes)

**Phase 6 close-out tracking:**
- `STATE.md`: Phase 6 marked closed; completed_phases 5→6; completed_plans 47→48; percent 98→100
- `ROADMAP.md`: Phase 6 entry flipped `- [ ]` → `- [x]` with completion date 2026-05-11; 06-09 plan row marked complete
- `REQUIREMENTS.md`: BACKEND-03 and BACKEND-04 flipped Pending → Complete (the only two outstanding Phase 6 reqs after Wave 8)
- `portfolio-services/README.md`: + Deployment section pointing at the Railway URL, smoke-gate command, and the docs/api-contract.md link

## Pre-cutover security bump (orchestrator-injected; out of plan scope)

Vercel deploy dashboard surfaced "Vulnerable version of Next.js detected, please update immediately" on `next@15.5.15`. The `npm view next dist-tags` output exposed a dedicated `backport` tag at `15.5.18` — the security-patched release on the same 15.5.x minor line. Bumped via `npm install next@15.5.18`, verified `npm run lint` (clean), `npm test` (160/160), `npm run build` (23/23 static pages + INFRA-05 grep clean + bundle size unchanged at 102 kB First Load JS). Committed as `1d9a295` standalone and pushed to `origin/main` before entering Plan 06-09 Task 1. Vercel auto-rebuilt with the patched Next.js; the dashboard warning cleared on the next build.

Latest-line jump to `next@16.2.6` was deliberately NOT chosen — Next 16 has breaking changes (async params + other) that are out of Phase 6 scope and would need a separate evaluation. Patch bump on the same minor is the lowest-risk path that resolves the deploy warning.

## Plan deviations

**1 expected deviation (Task 2 skipped by condition):** Plan Task 2 was a conditional env.ts patch that ran only if Railway's Mongo plugin injected `MONGO_URL` (not `MONGO_URI`) AND the developer chose not to alias it via reference variable. The developer pasted the literal mongodb:// connection string directly into Railway's existing `MONGO_URI` env var, so no code change was needed. RESEARCH Assumption A2 (Mongo plugin variable name) disposition: literal-string set rather than reference-variable; equivalent outcome, zero code change.

**1 orchestrator-injected pre-plan step:** Security bump (covered above). Not counted as a plan task; tracked in its own commit and SUMMARY section.

**1 discovery-driven workflow note (no deviation, but worth recording):** During Task 1 reachability verification, two endpoints (`/api/projects` and `/api/stack`) returned 404 against the just-deployed Railway service. Root cause: `portfolio-services` `origin/main` was 8 commits behind local HEAD (only the original `235887b` scaffold had been pushed; Waves 0-8 BE commits were all local). Railway was deploying from the scaffold. Fix: `cd ../portfolio-services && git push origin main` advanced origin/main 235887b → c4e8870; Railway auto-redeployed in ~60s; re-probe confirmed all 7 routes registered with the new DTO shapes. This was NOT a plan defect — the plan assumed the BE push had happened earlier; in practice the project's one-direction-current paired-commit pattern means BE commits land locally per wave but accumulate unpushed until cutover. The push gap is a known characteristic of the workflow, not a Plan 06-09 issue.

## Verification (post-cutover)

| Check | Result |
|---|---|
| `curl -s https://<railway-url>/api/health` | `{"status":"ok"}` HTTP 200 |
| `PROD_API_URL=https://<railway-url> npm run smoke` (D-11 readiness gate) | `✓ check-backend: all 7 endpoints green` exit 0 |
| 7 endpoints return populated arrays (or singleton for /api/profile) | profile=1 / projects=3 / stack=4 / experience=3 / apps=2 / posts=1 — all within plan must_haves |
| Vercel `/` HTML contains real bio strings | `Bakytbek`, `beckprograms@gmail.com`, `pragmatic systems` — found |
| Vercel `/projects` HTML contains real project names | `Terminal Portfolio`, `Portfolio Services` — found |
| Vercel `/shipped` HTML contains real app names (no `Demo App`) | `CarEx`, `MoveIn` — found; no `Demo App` |
| Resume PDF download | HTTP 200 · application/pdf · 58440 bytes · `content-disposition: inline; filename="Bakytbek_Tatibekov_Resume.pdf"` |
| FE Vitest | 160/160 passing (unchanged from Wave 8 end — deps-only security bump) |
| BE Jest | 8/8 passing (unchanged — only README.md changed) |
| FE build | 23/23 static pages + postbuild INFRA-05 grep clean + 102 kB First Load JS |
| Task 6 eyeball (manual, all 7 views) | APPROVED by developer with no caveats |

## Phase 6 close-out verdict

**PASS.** 9/9 plans complete. 12/12 phase requirements shipped (BACKEND-01..04, CONTENT-01..08). Production cutover is live end-to-end: Railway BE + Mongo seeded with real content + Vercel FE with NEXT_PUBLIC_API_BASE_URL flipped to Railway. No carry-forward items; recruiter 5-second test is now a Phase 7 manual gate against the live production URL.

## Known stubs / Phase 7 handoff

None. All Phase 6 content is real-content state:
- Bio is real (developer's own bio paragraphs)
- Projects are 3 real projects with publicly reachable github.com URLs
- Stack is 4 categories of real tech the developer uses
- Experience is 3 real entries (one named "Independent" + two redacted as "Confidential" — by design)
- Apps are 2 real shipped apps (CarEx + MoveIn) with real App Store + Play Store URLs
- Posts is 1 real post about this project (RSC Discipline)
- Resume PDF + DOCX are the developer's real resume artifacts with Title + Author metadata

Phase 7 will validate this via Lighthouse / Search Console / `npm audit` / `npx knip` / production-URL recruiter 5-second test (twice, once per device per success criterion 4).
