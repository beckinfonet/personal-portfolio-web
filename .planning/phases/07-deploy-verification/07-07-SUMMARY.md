---
phase: 07-deploy-verification
plan: "07"
subsystem: recruiter-test-and-unfurl
status: PARTIAL
verdict: PARTIAL — LinkedIn unfurl PASS (Ph5 SEO-03c closes); Slack unfurl NEUTRAL (workspace setting; not a metadata defect); 5-second recruiter test DEFERRED-RECRUITER-PENDING for v1.1
completed_date: 2026-05-13
one_liner: "DEPLOY-04 partial — LinkedIn unfurl validates OG pipeline (closes Ph5 SEO-03c carry-forward); Slack rendered as plain-text (workspace-level neutral, LinkedIn confirms metadata is correct); recruiter test deferred"
tags:
  - deploy-04
  - recruiter-test
  - unfurl-preview
  - linkedin
  - slack
  - phase-5-carry-forward-closure
  - deferred
  - manual-attestation
requirements:
  - DEPLOY-04 (PARTIAL — unfurl PASS for LinkedIn / NEUTRAL for Slack; recruiter test DEFERRED)
  - SEO-03c-Ph5-carry-forward (CLOSED via LinkedIn unfurl pass; Slack documented as workspace-level neutral)
dependency_graph:
  requires:
    - "07-01 (production deploy live with OG metadata routable)"
    - "07-04 (Lighthouse mobile profile PASS confirms page-level performance for recruiter-test usability proxy)"
  provides:
    - "DEPLOY-04 PARTIAL evidence (07-VERIFICATION.md DEPLOY-04 section + 2 unfurl PNGs)"
    - "Phase 5 SEO-03c carry-forward closure (LinkedIn unfurl validates OG pipeline)"
  affects:
    - ".planning/phases/07-deploy-verification/07-VERIFICATION.md"
    - ".planning/phases/07-deploy-verification/unfurl/"
---

# Phase 7 Plan 07: Recruiter Test + Unfurl Previews Summary

## Outcome

**Part A — 5-second recruiter test (D-19):** DEFERRED-RECRUITER-PENDING. Reviewer chose to ship v1 without recruiting a non-engineer for the stopwatch test; gate moves to v1.1 follow-up. The persistent TopBar resume button + sidebar recruiter card + AboutSocials CTA + palette `download_resume` verb implementations are all in place per Phase 2-5 work; the recruiter test would CONFIRM the design works for non-engineers in practice but is not a code-level blocker.

**Part B — Slack + LinkedIn unfurl previews (Ph5 SEO-03c carry-forward):**
- **LinkedIn unfurl: PASS ✓** — Post Inspector renders the Phase 5 `app/opengraph-image.tsx` card with title `Bakytbek Tatibekov — Sr. Software Engineer` + domain `tatibekov.com`. Phase 5 SEO-03c carry-forward closes.
- **Slack unfurl: NEUTRAL ⚠** — link rendered as plain text only; no OG card. LinkedIn rendering proves the OG/Twitter metadata is functional, so this is a Slack-workspace-level outcome (workspace preview settings, slackbot link-warming, or DM-context preview-disabled). Not a code defect on FE side.

## Evidence

| Path | Size | Verdict |
|------|------|---------|
| `.planning/phases/07-deploy-verification/unfurl/linkedin.png` | 175 KB | LinkedIn PASS — full OG card visible |
| `.planning/phases/07-deploy-verification/unfurl/slack.png` | 34 KB | Slack NEUTRAL — plain-text only, no OG card |

## Deviations from Plan

**1. Recruiter test DEFERRED.** Plan Task 1 requires a non-engineer running both desktop + 375px mobile per D-19. Reviewer opted to defer; documented as DEPLOY-04 PARTIAL with v1.1 follow-up. The dual-audience claim has not been physically validated with a non-engineer subject in v1.

**2. Slack unfurl NEUTRAL (not PASS, not FAIL).** Slack's plain-text rendering on a DM-to-self is not a code defect — same OG metadata renders perfectly via LinkedIn Post Inspector. Recorded as NEUTRAL with workspace-level explanation rather than FAIL (which would imply a metadata bug) or PASS (which would imply the unfurl rendered correctly in Slack).

## Self-Check

- [x] LinkedIn unfurl captured and verified (OG image + title + domain)
- [x] Slack unfurl captured (link-only, no card — documented as workspace-level NEUTRAL)
- [x] DEPLOY-04 section appended to 07-VERIFICATION.md (does not touch DEPLOY-02/03/05/07)
- [x] DEPLOY-04 verdict: PARTIAL — explicit
- [x] Phase 5 SEO-03c carry-forward marked as closed (LinkedIn pass is sufficient)
- [x] Recruiter test DEFERRED with explicit v1.1 follow-up TODO
- [x] No code-level remediation needed
- [x] No modifications to STATE.md or ROADMAP.md

## Follow-up TODOs (v1.1)

1. **Recruiter test (D-19):** recruit one non-engineer, run desktop-then-mobile protocol on their devices, record per-device time-to-resume + time-to-contact + path narrative. Pass = under 5s on all 4 metrics. Flip DEPLOY-04 Part A from DEFERRED to PASS.
2. **Slack unfurl re-test (optional):** if v1.1 reports Slack unfurl issues, check workspace preview settings → "Show preview / Show inline images and animated GIFs"; verify Slackbot can reach the production URL via `curl -A "Slackbot-LinkExpanding 1.0"`.

## Verdict

**Plan 07-07: PARTIAL** — Part B (unfurls) executed with LinkedIn PASS + Slack NEUTRAL; Part A (recruiter test) DEFERRED-RECRUITER-PENDING. DEPLOY-04 verdict: PARTIAL. Phase 7 close-out (Plan 07-09) will surface both deferrals in the final phase verdict.
