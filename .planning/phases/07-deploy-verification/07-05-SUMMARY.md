---
phase: 07-deploy-verification
plan: 05
subsystem: search-console-onboarding
tags:
  - search-console
  - dns-txt
  - sitemap
  - manual-attestation
  - evidence-capture
  - checkpoint
status: PARTIAL-PASS (Tasks 1+2 verified; Task 3 DEFERRED-INDEXING-WAIT 24-48h per Pitfall 2)
verdict: PARTIAL-PASS — final indexing-coverage outcome deferred to Plan 07-09 close-out
updated: 2026-05-13
dependency_graph:
  requires:
    - "07-01 (production redeploy + www.tatibekov.com canonical URLs in sitemap)"
    - "07-02 (gsc/ evidence directory created)"
  provides:
    - "DEPLOY-03 evidence scaffolding (07-VERIFICATION.md DEPLOY-03 section with PENDING markers awaiting human-supplied evidence)"
  affects:
    - ".planning/phases/07-deploy-verification/07-VERIFICATION.md"
tech_stack:
  added: []
  patterns:
    - "evidence-capture: scaffold-with-PENDING-then-fill (3 screenshots + per-route status table)"
    - "checkpoint:human-action — combined enumeration of all DNS+GSC+screenshot steps"
key_files:
  created:
    - .planning/phases/07-deploy-verification/07-VERIFICATION.md (DEPLOY-03 PENDING scaffold)
    - .planning/phases/07-deploy-verification/07-05-SUMMARY.md
  modified: []
decisions:
  - "Combined the three plan-level checkpoint:human-action tasks (DNS TXT, sitemap submit, coverage capture) into ONE consolidated checkpoint return — the user must complete all three before the orchestrator can resume Plan 07-05 Task 4 (the only auto task)."
  - "Scaffolded 07-VERIFICATION.md DEPLOY-03 section with PENDING markers rather than waiting until after human evidence — preserves task-4 append-or-create defensiveness and gives the user a concrete file to inspect during/after the manual flow."
metrics:
  duration: "~3 minutes scaffold + user manual GSC work (verification + sitemap submission); coverage capture deferred 24-48h"
  completed: PARTIAL
  tasks_completed_autonomously: 1 of 4 (scaffold)
  tasks_completed_by_user_action: 2 of 3 (verification + sitemap submission)
  tasks_deferred: 1 of 3 (coverage capture — DEFERRED-INDEXING-WAIT)
human_evidence_recorded:
  - "gsc/verification.png (115KB; GSC Domain property verified via DNS TXT on apex 2026-05-13)"
  - "gsc/sitemap-submitted.png (168KB; https://www.tatibekov.com/sitemap.xml submitted with Success status 2026-05-13)"
  - "gsc/coverage.png — DEFERRED 24-48h (capture on or after 2026-05-14 then commit)"
follow_up:
  - "After 2026-05-14: run URL Inspection on each of 7 routes in GSC; capture gsc/coverage.png; update 07-VERIFICATION.md DEPLOY-03 table with per-route statuses; record final outcome."
  - "Plan 07-09 close-out picks up the deferred coverage capture and records the final DEPLOY-03 verdict."
---

# Phase 07 Plan 05: Google Search Console Onboarding Summary

## One-liner

Scaffolded DEPLOY-03 evidence template in `07-VERIFICATION.md`; halted at consolidated human-action checkpoint enumerating DNS TXT verification, sitemap submission, and indexing-coverage snapshot — three screenshots and a 7-row route-status table are still PENDING and require human work in the GSC + Vercel UIs.

## What This Plan Does

Plan 07-05 onboards Google Search Console (GSC) for `tatibekov.com`:

1. Creates a **Domain property** at `tatibekov.com` (D-06: covers apex + `www` + subdomains; cleaner than a URL-prefix property).
2. Verifies ownership via a **DNS TXT record** added to the Vercel DNS panel on the apex.
3. Submits `https://www.tatibekov.com/sitemap.xml` in the GSC Sitemaps section (D-07).
4. Captures per-route indexing-coverage snapshot; pass threshold is ≥4 of 7 routes in `Discovered / Crawled / Indexed` (D-07; per Pitfall 2, brand-new domains commonly show all 7 in `Discovered` within minutes of submission).

The plan is **non-autonomous by design** — GSC has no API surface in scope (D-06), the Vercel DNS panel is also UI-driven, and three pieces of evidence are screenshots that only the human can capture. The executor's role is limited to:

- Verifying the `gsc/` evidence directory exists (created in Plan 07-02) — confirmed present with `.gitkeep`.
- Verifying the sitemap URL is canonical — confirmed `https://www.tatibekov.com/sitemap.xml` per plan + D-07.
- Scaffolding the DEPLOY-03 section of `07-VERIFICATION.md` with PENDING markers — done.
- Halting at a consolidated `checkpoint:human-action` enumerating every manual step.

## Executor Actions Completed

| Step | Action | Status |
|------|--------|--------|
| 0 | Worktree HEAD assertion + base check (`08165db1`) | PASS |
| 1 | Read 07-05-PLAN.md, 07-VALIDATION.md, PROJECT.md, CLAUDE.md | DONE |
| 2 | Verify `gsc/` evidence directory exists | PASS (present, contains `.gitkeep`) |
| 3 | Confirm sitemap URL canonical (`https://www.tatibekov.com/sitemap.xml`) | PASS |
| 4 | Create `07-VERIFICATION.md` with DEPLOY-03 section scaffolded (PENDING markers for verification date, sitemap date, per-route status, three screenshots) | DONE |
| 5 | Halt at checkpoint:human-action and return structured enumeration of all manual UI steps | DONE (this SUMMARY accompanies the checkpoint return) |

## Tasks NOT Completed (Awaiting Human Action)

| Task | Type | Awaiting |
|------|------|---------|
| Task 1 | checkpoint:human-action | Create GSC Domain property → copy DNS TXT → add to Vercel DNS @ apex → click Verify → screenshot `gsc/verification.png` |
| Task 2 | checkpoint:human-action | Submit `https://www.tatibekov.com/sitemap.xml` in GSC → wait for Success status (Discovered URLs: 7) → screenshot `gsc/sitemap-submitted.png` |
| Task 3 | checkpoint:human-action | URL-Inspect each of 7 routes in GSC → count routes in `Discovered/Crawled/Indexed` → confirm ≥4 of 7 → screenshot `gsc/coverage.png` + capture per-route status notes |
| Task 4 | auto (gated) | Fill in PENDING markers in `07-VERIFICATION.md` (verification date, sitemap date, 7-row route status table, outcome count, final verdict) and commit alongside the three PNGs |

Task 4 cannot run until all three screenshots exist under `gsc/` and the user has supplied the verification date, sitemap-submission date, coverage-capture date, and per-route statuses.

## Required Resume Signals (from the user)

After completing the manual UI flow, the orchestrator should resume with the following payload so a follow-up executor can finalize Task 4 without re-asking:

1. **Verification date** (`YYYY-MM-DD` when GSC reported "Ownership verified").
2. **Sitemap-submission date** (`YYYY-MM-DD` when "Submit" was clicked in GSC Sitemaps).
3. **Coverage-capture date** (`YYYY-MM-DD` when URL Inspection sweep was run).
4. **Per-route status** for all 7 routes — one of:
   - `Discovered – currently not indexed` (counts toward pass)
   - `Crawled – currently not indexed` (counts toward pass)
   - `URL is on Google` (counts toward pass)
   - `URL is not on Google` / "Page is not indexed" / "Excluded" (does NOT count toward pass)
5. **Three PNG files committed under `gsc/`**: `verification.png`, `sitemap-submitted.png`, `coverage.png`.
6. **First 4 chars of the GSC verification TXT token** (e.g. `AbCd…`) — to record in the eventual DEPLOY-03 PASS commit message (do NOT paste the full token; SUMMARY masks the rest per the plan's output spec).
7. **Status of the OLD URL-prefix GSC property** (if one ever existed for `https://www.tatibekov.com/`): kept / deleted. Per the plan, it should be deleted after Domain property verification succeeds.

## Deviations from Plan

### None — plan executed exactly as written

The plan explicitly designates Tasks 1/2/3 as `checkpoint:human-action` with `gate="blocking"` and no automated alternative; halting at the consolidated checkpoint and emitting the PENDING scaffold matches the plan's intent. The plan's `<action>` block for each manual task reads: *"this is a manual human action with no CLI/API surface in scope. The executor agent halts here; the user performs the steps and signals resume."*

Per the parallel-execution prompt directive, the three checkpoints have been combined into one consolidated checkpoint return to avoid three round-trips with the orchestrator while the user is in front of the GSC + Vercel UIs.

### Authentication / external-account gates

The user must be:
1. Signed into the **Google account** that will permanently own the GSC property (treat as a one-time decision — Google account ownership transfers are painful later).
2. Signed into the **Vercel account** with DNS-edit permission on `tatibekov.com`.

Neither is an auth error the executor can resolve programmatically — both are out-of-band human prerequisites.

## CLAUDE.md / Constraint Compliance

| Constraint | Status |
|------------|--------|
| No Tailwind / no CSS modules / no CSS-in-JS introduced | PASS (no source code changed) |
| No new prod dependencies | PASS (no `package.json` changes) |
| No `git clean` / no destructive resets in worktree | PASS |
| STATE.md / ROADMAP.md untouched (orchestrator owns) | PASS |
| Worktree-only writes (no main-checkout leakage) | PASS — `md5` confirmed `07-VERIFICATION.md` exists only under the worktree path |
| Stack constraints (Next.js 15 / React 19 / pure CSS) | N/A (docs-only plan) |

## Threat Surface Scan

Plan 07-05 modifies only documentation under `.planning/phases/07-deploy-verification/`. No new network endpoints, auth surface, or trust-boundary changes are introduced. The plan's `<threat_model>` enumerates four threats (T-07-18..T-07-21); the only `mitigate` dispositions (T-07-18 DNS TXT deletion, T-07-20 spoofed sitemap submission) are mitigated through:

- **T-07-18 mitigation:** The "PERMANENT; do not delete per Pitfall 6" warning appears in three places in the scaffolded DEPLOY-03 section under `### Operational notes (PERMANENT — do not remove)`. Future maintainers reading this section before touching DNS will see the warning inline.
- **T-07-20 mitigation:** Sitemap submission is gated by GSC property ownership; Task 1's DNS TXT verification establishes that gate before Task 2 can submit. The scaffold's flow ordering preserves the gate.

No new threat surface introduced — omit `## Threat Flags` section.

## Known Stubs

The DEPLOY-03 section contains **intentional `PENDING` markers** (verification date, sitemap date, per-route status, outcome count, three screenshot paths). These are gated stubs explicitly tied to the human-action checkpoint and resolved by Plan 07-05 Task 4 (the auto-mode consolidation task). They are NOT carry-forward placeholders — they exist for exactly one reason and will be filled in the same plan that introduced them.

Once Task 4 runs (after human evidence), the file should contain **zero `PENDING` strings** in the DEPLOY-03 section.

## TDD Gate Compliance

N/A — plan type is `execute`, not `tdd`. No RED/GREEN/REFACTOR gates required.

## Self-Check

Verification commands:

```bash
test -f .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q '^## DEPLOY-03 — Search Console' .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q 'Domain property at `tatibekov.com`' .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q 'gsc/verification.png' .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q 'gsc/sitemap-submitted.png' .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q 'gsc/coverage.png' .planning/phases/07-deploy-verification/07-VERIFICATION.md
grep -q '\*\*DEPLOY-03 verdict: PENDING\*\*' .planning/phases/07-deploy-verification/07-VERIFICATION.md
test -d .planning/phases/07-deploy-verification/gsc
```

## Self-Check: PASSED

- `07-VERIFICATION.md` exists at the worktree path; md5 confirmed distinct from main checkout (which does not contain the file).
- DEPLOY-03 section header present.
- `Domain property at tatibekov.com` string present (D-06 attestation).
- All three screenshot paths referenced (verification, sitemap-submitted, coverage).
- Final verdict line reads `**DEPLOY-03 verdict: PENDING**` — correctly reflects checkpoint-gated state.
- `gsc/` evidence directory exists (carried from Plan 07-02 via `.gitkeep`).

Self-check exit conditions all green; no `MISSING:` entries.

## Hand-off to Orchestrator

This plan ends at a **checkpoint:human-action** — see the structured checkpoint return in the executor message. STATE.md and ROADMAP.md are intentionally **not** updated; the orchestrator owns those writes after the user's manual evidence is collected and a continuation executor consolidates Task 4.
