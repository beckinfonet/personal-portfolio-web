---
phase: 07-deploy-verification
plan: 01
subsystem: infra
tags: [deploy, vercel, env-var, canonical-url, headers, seo]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "DEV-03 baseline (x-built-with header shipped with x-portfolio-source slot deferred for production URL)"
  - phase: 06-backend-content-population
    provides: "Production cutover precedent (FE 2610cae) — two-commit audit-trail pattern for production redeploys"
provides:
  - "Production canonical URL flipped to https://www.tatibekov.com (D-01) via NEXT_PUBLIC_SITE_URL env var inlined at build time"
  - "metadataBase fallback updated to production URL (app/layout.tsx) — Phase 1 D-Pitfall D preserved (still `||` not `??`)"
  - "x-portfolio-source header slot removed from next.config.ts (D-04, closes Phase 5 D-30 as RESOLVED-as-dropped)"
  - "DEV-03 requirement status updated to PASS-with-deviation in REQUIREMENTS.md (bullet + traceability table)"
  - "Vercel env-var evidence screenshot committed at .planning/phases/07-deploy-verification/vercel/env-var-set.png"
  - "Empty-commit redeploy trigger ready on worktree branch (orchestrator merges + pushes for actual Vercel redeploy)"
  - "Curl evidence template scaffolded at .planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt (PENDING — orchestrator runs the actual curls post-redeploy)"
affects: [07-02-analytics-pull-forward-decision, 07-03-lighthouse-audit, 07-04-search-console, all-subsequent-wave-2-plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Vercel env-var manual UI step → screenshot evidence → executor-committed audit artifact (no Vercel CLI available)"
    - "Two-commit redeploy: source-code commit + empty-commit redeploy trigger (parity with Phase 6 FE 2610cae)"
    - "Worktree-mode adaptation: executor commits redeploy trigger on isolated branch, orchestrator handles main-branch push"

key-files:
  created:
    - ".planning/phases/07-deploy-verification/vercel/env-var-set.png — Vercel Production env-var panel screenshot (manual UI step evidence)"
    - ".planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt — PENDING template; orchestrator fills after Vercel redeploy completes"
    - ".planning/phases/07-deploy-verification/07-01-SUMMARY.md — this file"
  modified:
    - "app/layout.tsx — metadataBase siteUrl fallback flipped to https://www.tatibekov.com (line 13)"
    - "next.config.ts — engineerHeaders collapsed to single-element array (x-portfolio-source comment removed at line 12)"
    - ".env.example — appended 2 comment lines hinting production Vercel scope (now 4 lines total)"
    - ".planning/REQUIREMENTS.md — DEV-03 status flipped to PASS-with-deviation (line 118 bullet + line 279 traceability row)"

key-decisions:
  - "D-04 closure: Phase 5 D-30 deferred x-portfolio-source slot → Phase 7 D-04 drops it entirely (repo is private; pointing engineers at inaccessible GitHub URL adds no value, signals private repo existence needlessly). Status: RESOLVED-as-dropped (not RESOLVED-as-filled)."
  - "Worktree-mode push deferral: plan's Task 4 instructed `git push origin main`, but the executor is in an isolated worktree (cannot push to main). Adapted: executor commits empty-redeploy trigger on the worktree branch; orchestrator merges into main and the user pushes from the main checkout (single atomic action). Audit-trail intact — both commits ship to origin/main together."
  - "Task 5 curl verification deferred to post-merge: Vercel only redeploys on pushes to the production branch. Running curls from the worktree before push would record stale evidence (pre-redeploy bundle). Evidence template scaffolded with PENDING marker; orchestrator runs the verification after Vercel reaches Ready state (~60-90s post-push)."

patterns-established:
  - "Build-time env-var requires redeploy: NEXT_PUBLIC_* values are inlined into the client JS bundle at build time (RESEARCH.md Pitfall 5). Setting the value in Vercel's UI alone does not propagate — an empty-commit (or any new commit on main) is required to trigger a rebuild."
  - "Worktree-mode deploy plans: any future production-cutover plan run in worktree mode must split push responsibilities — executor handles commits on the isolated branch, orchestrator + user handle the merge + push to main. Curl verification against production must happen AFTER the merge + push."

requirements-completed: []  # DEPLOY-01 stays [ ] until plan 07-09 close-out per plan frontmatter; DEV-03 traceability row updated to PASS-with-deviation but NOT a Phase 7 completion (Phase 5 ownership).

# Metrics
duration: ~3 min (continuation agent only — original Task 1 human-action gate not counted)
completed: 2026-05-14
---

# Phase 7 Plan 01: Canonical URL Flip + Redeploy Summary

**Production canonical URL flipped to https://www.tatibekov.com via Vercel env var (NEXT_PUBLIC_SITE_URL) + matching metadataBase fallback in app/layout.tsx; x-portfolio-source header slot dropped per D-04 (closes Ph5 D-30 as RESOLVED-as-dropped); two-commit audit-trail (source + empty-redeploy) ready for orchestrator-driven push to main.**

## Performance

- **Duration:** ~3 min (continuation agent; original Task 1 human-action gate happened in user's calendar time, not measured)
- **Started:** 2026-05-14T03:06:51Z (continuation agent spawned)
- **Completed:** 2026-05-14T03:10:00Z (this commit)
- **Tasks:** 5 (Task 1 closed via screenshot commit; Tasks 2+3 single combined commit; Task 4 empty-commit; Task 5 evidence-template scaffold)
- **Files modified:** 4 source-code files (app/layout.tsx, next.config.ts, .env.example, .planning/REQUIREMENTS.md) + 3 evidence artifacts (env-var-set.png, deploy-01-curl-evidence.txt, SUMMARY.md)

## Accomplishments

- Vercel NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com confirmed set with Production scope only (user-performed UI action; evidence screenshot committed)
- Source-code deltas landed in a single 4-file commit per brownfield-discipline rule (delete + replacement state ship together): metadataBase fallback flipped, x-portfolio-source slot dropped, .env.example hint added, REQUIREMENTS.md DEV-03 status updated
- Phase 1 D-Pitfall D preserved: `siteUrl` constant still uses `||` (logical OR) not `??` (nullish coalescing) so empty-string env vars fall through to the production URL instead of producing `new URL("")` TypeError
- Empty-commit redeploy trigger created on worktree branch; orchestrator will merge and the user will push from main checkout (parity with Phase 6 cutover FE 2610cae two-commit audit-trail pattern)
- Curl-verification evidence template scaffolded with PENDING header so the orchestrator (or user) has a known-good script to run + record results into post-redeploy

## Task Commits

Each task was committed atomically on the worktree branch (`worktree-agent-adc2fe06eef37d98a`):

1. **Task 1 (closure): Vercel env-var screenshot** — `f9d8706` (chore)
   - Subject: `chore(07-01): commit Vercel env-var evidence screenshot (DEPLOY-01 Task 1)`
   - Files: `.planning/phases/07-deploy-verification/vercel/env-var-set.png` (2218x340 PNG, 67377 bytes)
   - Manual UI action — Vercel env-var management has no CLI surface in this workflow

2. **Tasks 2+3 (combined): Source-code deltas + REQUIREMENTS.md status update** — `4ad46cd` (chore)
   - Subject: `chore(07): canonicalize site URL to www.tatibekov.com + drop x-portfolio-source slot (DEPLOY-01, D-02/D-04, closes Ph5 D-30)`
   - Files (4): `app/layout.tsx`, `next.config.ts`, `.env.example`, `.planning/REQUIREMENTS.md`
   - Diff stat: 5 insertions, 4 deletions
   - Lint exit 0; typecheck exit 0

3. **Task 4: Empty-commit redeploy trigger** — `a84beb5` (chore, empty)
   - Subject: `chore(07): redeploy with NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com (DEPLOY-01)`
   - Zero file changes; commit object exists solely to trigger Vercel rebuild after merge + push

4. **Task 5 (scaffold): Curl evidence template** — committed with this SUMMARY (see "Plan metadata" below)

**Plan metadata:** [this commit, hash recorded post-commit] (docs(07-01): complete canonical URL flip + redeploy plan)

_Note: Tasks 2 + 3 land in a single commit per brownfield-discipline rule (delete + replacement state ship together) — see plan §`<task type="auto">Task 3`._

## Files Created/Modified

### Created
- `.planning/phases/07-deploy-verification/vercel/env-var-set.png` — Vercel Production env-var panel screenshot (manual UI step evidence)
- `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` — PENDING template; orchestrator fills after Vercel redeploy completes
- `.planning/phases/07-deploy-verification/07-01-SUMMARY.md` — this file

### Modified
- `app/layout.tsx` — `siteUrl` fallback string flipped from `"http://localhost:3000"` to `"https://www.tatibekov.com"` on line 13; `||` operator preserved (Phase 1 D-Pitfall D); two-line comment above siteUrl preserved verbatim; `metadataBase: new URL(siteUrl)` unchanged
- `next.config.ts` — `engineerHeaders` array's deferral comment (`// x-portfolio-source deferred to Phase 7 per D-13 (revised)...`) deleted at line 12; array collapses to single-element with `{ key: "x-built-with", value: "nextjs-15-react-19" }`; `securityHeaders` untouched; `headers()` function shape untouched
- `.env.example` — appended two comment lines at end: `# In production (Vercel Project Settings -> Environment Variables -> Production scope):` and `# NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com`; dev value on line 2 kept active and uncommented; final file is exactly 4 lines + trailing newline
- `.planning/REQUIREMENTS.md` — DEV-03 bullet (line 118) deferral clause replaced with `PASS-with-deviation` note + Ph7 D-04 reference; DEV-03 traceability table row (line 279) status updated to match

## Decisions Made

### D-04 closure: x-portfolio-source slot RESOLVED-as-dropped
Phase 5 deferred the slot to Phase 7 (D-30: "needs production deploy URL"). Phase 7 CONTEXT.md D-04 instead drops the slot entirely. Rationale: the repo is private; pointing engineers at an inaccessible GitHub URL via `x-portfolio-source` would add no diagnostic value and would unnecessarily signal "private repo exists" to anyone running `curl -I`. The DEV-03 requirement is reclassified from "Complete (deferred)" to "PASS-with-deviation" — only `x-built-with` ships as an engineer-visible header. This closes Phase 5 D-30 as RESOLVED-as-dropped (NOT RESOLVED-as-filled).

### Worktree-mode push deferral
The plan's Task 4 instructed `git push origin main` to land the source-code commit and trigger Vercel's redeploy. The continuation executor runs in an isolated git worktree (path `.claude/worktrees/agent-adc2fe06eef37d98a/`) that cannot push to main directly. Adapted approach: the executor commits all artifacts (Task 1 screenshot, Task 2+3 source deltas, Task 4 empty redeploy trigger) on the worktree branch (`worktree-agent-adc2fe06eef37d98a`); the orchestrator merges this branch into main, and the user pushes from the main checkout. This preserves the two-commit audit trail (source-code commit + empty redeploy commit, parity with Phase 6 cutover FE 2610cae) while honoring worktree-mode isolation.

### Task 5 curl verification deferred to post-merge
Vercel only redeploys on pushes to the production branch (main). The worktree branch is not on origin/main, so running curls against https://www.tatibekov.com from the worktree before the orchestrator's push would record stale evidence (pre-redeploy bundle still serving `metadataBase` resolved to `http://localhost:3000` and `x-portfolio-source`-bearing responses). The evidence file `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` is scaffolded with a `# PENDING: run after Vercel redeploy completes` header and pre-written curl commands; the orchestrator (or user) executes the curls and replaces the PENDING marker with real output after the Vercel Deployments tab shows the latest deployment as "Ready" (typically ~60-90s post-push).

## Deviations from Plan

### Plan execution adaptations (worktree-mode operational deltas, NOT scope changes)

**1. [Operational adaptation] Worktree-mode push deferral — Task 4 push split between executor and orchestrator**
- **Found during:** Task 4 (Vercel redeploy trigger)
- **Issue:** Plan's Task 4 step `git push origin main` cannot execute from an isolated worktree branch; the worktree-agent branch is not the production branch
- **Adaptation:** Executor commits the empty-redeploy trigger on the worktree branch (`a84beb5`); orchestrator merges the branch into main and the user pushes from the main checkout. Two-commit audit-trail (source + empty redeploy) is preserved on origin/main once orchestrator completes the merge.
- **Files modified:** None additional — the deviation is in the merge/push handoff sequence, not the commit content
- **Verification:** Both commits (4ad46cd, a84beb5) are visible in `git log` on the worktree branch; orchestrator will land them on main
- **Committed in:** N/A (operational, not source-code) — documented here so the orchestrator and Phase 7 close-out plan 07-09 can audit the cutover sequence

**2. [Operational adaptation] Task 5 curl verification deferred to post-merge**
- **Found during:** Task 5 (production verification)
- **Issue:** Plan's Task 5 assumed the executor runs on main and Vercel has redeployed by the time Task 5 begins. In worktree mode, Vercel will not redeploy until after the orchestrator merges + the user pushes — so curl evidence captured now would reflect the pre-redeploy bundle (stale)
- **Adaptation:** Executor scaffolds `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` with `# PENDING: run after Vercel redeploy completes` header + the full curl command set; orchestrator (or user) executes the curls after Vercel reaches Ready state and replaces the PENDING marker with real output
- **Files modified:** `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` (created; status PENDING)
- **Verification:** File exists at the expected path; contains all 5 verification steps from plan Task 5 §action verbatim; ready for the orchestrator's post-redeploy fill-in
- **Committed in:** This SUMMARY's final commit (Task 5 scaffold + SUMMARY ship together)

### Auto-fixed Issues

None — no Rule 1/2/3 deviations required. The plan was operationally adapted for worktree mode but its source-code prescriptions executed verbatim.

---

**Total deviations:** 2 operational adaptations (worktree-mode push split + Task 5 verification deferral); 0 auto-fixed bugs/security/blocking issues.
**Impact on plan:** Source-code changes match the plan exactly (4 files, surgical edits per `<task type="auto">Task 2`). Operational adaptations are mechanical consequences of worktree-mode execution — no scope creep, no behavior changes, audit trail preserved.

## Issues Encountered

### Edit/Write tool path resolution (transient workflow issue)
The Edit and Write tools resolved relative-style paths to the main checkout (`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/...`) rather than the worktree path (`.claude/worktrees/agent-adc2fe06eef37d98a/...`). All four file edits initially landed in the main checkout's working tree.

**Resolution:** Detected via `md5` comparison between worktree and main copies; copied the edited files from main into the worktree using `cp`, then ran `git checkout --` on each main-checkout path to restore main to clean. Net effect: all source-code edits ended up in the worktree (where they belong), main checkout returned to clean state, no commits accidentally landed on main.

This is not a code defect — it's a workflow note for future worktree-mode executors. The orchestrator's force-removal of the worktree at agent return is safe because all edits are committed to the worktree branch before this SUMMARY's commit.

## User Setup Required

**Already performed by the user before this continuation agent ran** (Task 1 human-action gate):
- Vercel Project Settings → Environment Variables → Production scope: `NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com` (evidence screenshot at `.planning/phases/07-deploy-verification/vercel/env-var-set.png`)

**Required after this SUMMARY commits** (orchestrator + user, not this executor):
1. Orchestrator merges worktree branch `worktree-agent-adc2fe06eef37d98a` into main
2. User pushes main to origin (single push lands both `4ad46cd` source-code commit + `a84beb5` empty-redeploy trigger)
3. User waits ~60-90s for Vercel Deployments tab to show the latest deployment as "Ready"
4. Orchestrator (or user) runs the curl commands documented in `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` against `https://www.tatibekov.com` and replaces the PENDING marker with real captured output

If any curl check fails (non-200 status, sitemap missing `<loc>` entries, `x-built-with` header absent, `x-portfolio-source` still present): halt and investigate before declaring DEPLOY-01 ready.

## Next Phase Readiness

### Ready for Wave 2
- All source-code prerequisites for analytics decision (plan 07-02) are met; the production cutover URL is final
- DEV-03 traceability row updated — Phase 5 close-out is clean

### Blockers for orchestrator + user
1. Worktree branch must be merged + pushed before Task 5 curl verification can run against production
2. Vercel deploy must reach "Ready" state before the curl evidence file can be filled in
3. Once `deploy-01-curl-evidence.txt` has real output (not PENDING), DEPLOY-01's automated gates are green and Wave 2 plans can begin

### Worktree-mode note for subsequent Phase 7 executors
Plans 07-03 onward (Lighthouse, GSC, OG/Twitter, npm audit, knip) all require production to be live and the canonical URL to be correct. They MUST run AFTER this plan's two commits are merged + pushed to main AND Vercel reaches Ready state. If a subsequent worktree-mode plan needs to verify production state, it should check `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` is no longer in PENDING state before proceeding.

## Self-Check: PASSED

Verification of every claim in this SUMMARY:

- File `.planning/phases/07-deploy-verification/vercel/env-var-set.png` exists in worktree: FOUND
- File `.planning/phases/07-deploy-verification/deploy-01-curl-evidence.txt` exists in worktree: FOUND
- Commit `f9d8706` (Task 1 screenshot): FOUND on worktree branch
- Commit `4ad46cd` (Task 2+3 source-code commit, 4 files): FOUND on worktree branch
- Commit `a84beb5` (Task 4 empty redeploy trigger): FOUND on worktree branch
- `app/layout.tsx` line 13 contains `https://www.tatibekov.com`: VERIFIED
- `next.config.ts` does NOT contain `x-portfolio-source`: VERIFIED
- `next.config.ts` contains `x-built-with`: VERIFIED
- `.env.example` has 4 lines and contains `# NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com`: VERIFIED
- `.planning/REQUIREMENTS.md` line 118 contains `PASS-with-deviation`: VERIFIED
- `.planning/REQUIREMENTS.md` line 279 contains `dropped Ph7 D-04`: VERIFIED
- `npm run lint` exit 0: VERIFIED
- `npm run typecheck` exit 0: VERIFIED
- Main checkout (`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/`) NOT modified by this executor: VERIFIED (only `.claude/` worktrees-dir and the user's screenshot remain untracked at main, which were already present before this agent ran)

---
*Phase: 07-deploy-verification*
*Completed: 2026-05-14*
