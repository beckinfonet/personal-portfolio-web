---
phase: 7
slug: deploy-verification
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: `07-RESEARCH.md` §Validation Architecture (gates grouped by category).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x (unit) + Node smoke scripts (`scripts/check-*.mjs`) + manual evidence-capture |
| **Config file** | `vitest.config.ts`, `package.json` (scripts), `next.config.ts` (prebuild gates) |
| **Quick run command** | `npm run lint && npm test -- --run` |
| **Full suite command** | `npm run build` (runs INFRA-05 prebuild grep + resume-PDF + resume-DOCX gates + typecheck + unit tests + Next build) |
| **Estimated runtime** | ~60 seconds local; ~3 min CI |

---

## Sampling Rate

- **After every task commit:** `npm run lint` (1-2s) — fast feedback on import/type drift
- **After every plan wave:** `npm run build` (~60s) — full prebuild gate + typecheck + bundle
- **Before `/gsd-verify-work`:** Full suite must be green AND `scripts/check-backend.mjs` exits 0 AND production redeploy confirmed live
- **Max feedback latency:** 60 seconds for the automated tier; evidence-capture and manual-attestation tiers run once at phase close-out

---

## Per-Task Verification Map

> Plans will be assigned post-planner; this table seeds the verification contract per requirement. Planner SHOULD copy this map per task and fill `Plan` + `Task ID` + `Wave` columns.

| Requirement | Validation Tier | Gate | Automated Command / Evidence Pointer | Status |
|-------------|----------------|------|--------------------------------------|--------|
| DEPLOY-01 | automated | `app/sitemap.ts` emits `www.tatibekov.com` URLs after redeploy | `curl -s https://www.tatibekov.com/sitemap.xml \| grep -c "www.tatibekov.com"` ≥ 7 | ⬜ pending |
| DEPLOY-01 | evidence-capture | All 7 routes return HTTP 200 on production | `scripts/check-production-routes.mjs` (new; iterates `lib/routes.ts`, asserts 200 + non-empty body) | ⬜ pending |
| DEPLOY-01 | automated | `app/layout.tsx` `metadataBase` reads `NEXT_PUBLIC_SITE_URL` | Source assertion: `grep -q "metadataBase.*NEXT_PUBLIC_SITE_URL" app/layout.tsx` | ⬜ pending |
| DEPLOY-02 | evidence-capture | PSI mobile scores per route (median of 3 runs) | `lighthouse/<route>-mobile.png` × 7 + `07-VERIFICATION.md` 7×6 table | ⬜ pending |
| DEPLOY-02 | manual-attestation | Threshold-miss fix-in-place loop closes all 42 cells | All cells PASS in 7×6 table in `07-VERIFICATION.md` | ⬜ pending |
| DEPLOY-03 | evidence-capture | GSC Domain property verified at `tatibekov.com` via DNS TXT | `gsc/verification.png` screenshot | ⬜ pending |
| DEPLOY-03 | evidence-capture | Sitemap submitted in GSC | `gsc/sitemap-submitted.png` screenshot | ⬜ pending |
| DEPLOY-03 | evidence-capture | ≥4 of 7 routes Discovered/Crawled/Indexed | `gsc/coverage.png` + table in `07-VERIFICATION.md` | ⬜ pending |
| DEPLOY-05 | automated | `npm audit --omit=dev --audit-level=high` exits 0 | `npm audit --omit=dev --audit-level=high` (FE) + same in `../portfolio-services/` (BE) | ⬜ pending |
| DEPLOY-05 | automated | `npx knip` exits 0 (zero unused files/exports) | `npx knip` (FE only — BE has separate posture) | ⬜ pending |
| DEPLOY-04 | manual-attestation | 5-second recruiter test — desktop + 375px mobile | Recorded in `07-VERIFICATION.md` DEPLOY-04 section (name, time-to-resume, time-to-contact, path narrative); pass = both under 5s | ⬜ pending |
| DEPLOY-04 | evidence-capture | Slack/LinkedIn unfurl preview (folded carry-forward from Phase 5 SEO-03c) | `unfurl/slack.png` + `unfurl/linkedin.png` | ⬜ pending |
| DEPLOY-06 | automated | `@vercel/analytics` installed; `<Analytics />` mounted in `app/layout.tsx` | Source assertions: `package.json` contains `@vercel/analytics`; `app/layout.tsx` imports `Analytics from "@vercel/analytics/next"` and renders `<Analytics />` | ⬜ pending |
| DEPLOY-06 | automated | `track("resume_download")` fires from TopBar resume button onClick | Source assertion: `top-bar.tsx` (or path) contains `track("resume_download")` and onClick on the resume `<a>` | ⬜ pending |
| DEPLOY-06 | evidence-capture | Vercel Analytics dashboard shows ≥1 `resume_download` event after manual click | `analytics/resume-download-event.png` screenshot | ⬜ pending |
| DEPLOY-07 | evidence-capture | 375px DevTools screenshot per route on production | `screenshots/375/<route>.png` × 7 | ⬜ pending |
| DEPLOY-07 | manual-attestation | Manual eyeball confirms shell elements accessible, no overflow | `07-VERIFICATION.md` DEPLOY-07 row per route with PASS/FAIL verdict | ⬜ pending |
| DEV-03 (carry) | automated | `x-portfolio-source` removed from `next.config.ts`; `x-built-with` retained | Source assertions: `! grep -q "x-portfolio-source" next.config.ts` AND `grep -q "x-built-with" next.config.ts` | ⬜ pending |
| Carry (BE smoke) | automated | `scripts/check-backend.mjs` against Railway BE exits 0 | `node scripts/check-backend.mjs` exit code | ⬜ pending |
| Real-device carry (Ph4 G7/G8 + Ph5 G3) | manual-attestation | Closed via DevTools emulation + 56/56 axe + PSI mobile | `07-VERIFICATION.md` Known Limitations section explicitly accepts Safari `dvh/svh` + soft-keyboard + address-bar overlap | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/check-production-routes.mjs` — new smoke script iterating `lib/routes.ts` against `process.env.NEXT_PUBLIC_SITE_URL` (or arg), asserting 200 + non-empty HTML. Wires into close-out gate.
- [ ] Evidence directories created at phase start: `.planning/phases/07-deploy-verification/lighthouse/`, `screenshots/375/`, `gsc/`, `unfurl/`, `analytics/`.
- [ ] `@vercel/analytics` installed (Wave 1 of analytics plan) — required for DEPLOY-06 automated source assertions.

*Existing infrastructure (Vitest, INFRA-05 grep, resume-PDF/DOCX gates, `scripts/check-backend.mjs`) already covers the remaining automated gates.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PSI mobile-profile scores per route | DEPLOY-02 | Lighthouse runs out-of-process against a live URL; PSI dashboard is the canonical evidence surface (D-14) | For each route in `lib/routes.ts`: open `https://pagespeed.web.dev/?url=https://www.tatibekov.com/<route>` → click Analyze → run 3× → record median per metric → screenshot dashboard. Save to `lighthouse/<route>-mobile.png`. Record in 7×6 scores table. |
| GSC verification + sitemap submission + indexing status | DEPLOY-03 | Search Console is an external SaaS UI; no API in scope (D-06, D-07) | Create Domain property at `tatibekov.com` → copy DNS TXT → add to Vercel DNS → verify (screenshot) → submit `https://www.tatibekov.com/sitemap.xml` (screenshot) → after 7-21 days re-check coverage (screenshot). |
| 5-second recruiter test | DEPLOY-04 | Behavioral, requires a real human non-engineer (D-19) | One non-engineer runs desktop first on their laptop, then 375px mobile on their phone, both against `www.tatibekov.com`. Time-to-resume + time-to-contact under 5s each. Record name, times, path narrative in `07-VERIFICATION.md`. |
| Slack/LinkedIn unfurl preview (carry-forward) | DEPLOY-04 | Requires posting to actual Slack/LinkedIn for OG card rendering | Send `https://www.tatibekov.com` to a private Slack channel + LinkedIn DM. Screenshot both unfurls. Save to `unfurl/`. |
| 375px shell review per route | DEPLOY-07 | Visual judgment on real production HTML/CSS (D-20) | Chrome DevTools 375px viewport on each of 7 routes on `www.tatibekov.com`. Screenshot. Eyeball: TopBar resume button visible above fold, no horizontal overflow, hamburger trigger accessible, no clipped text, theme + accent picker reachable. |
| Real-device carry-forwards (Ph4 G7/G8 + Ph5 G3) | DEPLOY-04 close-out | D-18 consciously accepts DevTools emulation as the closure surface | Document the Known Limitations section explicitly: Safari `dvh/svh`, soft-keyboard behavior in palette, address-bar overlap at TopBar, `-webkit-overflow-scrolling` are NOT physically validated. |
| Vercel Analytics dashboard event verification | DEPLOY-06 | External SaaS dashboard; verifies the event actually transmitted (not just that the code calls track()) | After production redeploy + manual resume-button click, open Vercel Project → Analytics → Events tab. Confirm `resume_download` row with count ≥ 1. Screenshot. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify, evidence-capture pointer, or Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (note: many Phase 7 tasks are evidence-only by nature — see Manual-Only table)
- [ ] Wave 0 covers all MISSING references (`scripts/check-production-routes.mjs`, evidence directories, `@vercel/analytics` install)
- [ ] No watch-mode flags (CI gates must exit deterministically)
- [ ] Feedback latency < 60s for automated tier
- [ ] `nyquist_compliant: true` set in frontmatter after planner integrates this map

**Approval:** pending
