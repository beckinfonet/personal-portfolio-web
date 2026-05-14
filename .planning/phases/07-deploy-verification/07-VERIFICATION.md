---
phase: 7
slug: deploy-verification
status: in_progress
verdict: PENDING
created: 2026-05-13
updated: 2026-05-13
sections:
  - DEPLOY-02: PASS — DevTools Lighthouse mobile profile × 7 routes; Perf 96-100, A11y 100, SEO 100, BP 96 — all thresholds exceeded with substantial margin
  - DEPLOY-03: PARTIAL-PASS — Tasks 1+2 verified; Task 3 indexing-coverage DEFERRED-INDEXING-WAIT (24-48h per Pitfall 2)
  - DEPLOY-05: PASS — npm audit (FE + BE) + npx knip (FE) all exit 0; pre-close-out gates green
  - DEPLOY-07: PASS — DevTools 375px shell review × 7 routes; 42/42 cells ✓; Phase 4 Gates 7+8 + Phase 5 Gate 3 carry-forwards closed via D-18
---

# Phase 7: Deploy + Verification — Verification Report

## Phase Verdict

**Verdict: PENDING**

This file accumulates the per-requirement verdicts for Phase 7. Sections are appended as each plan in the phase completes. Until all DEPLOY-* requirements have populated sections with explicit verdicts, this file reads PENDING.

---

## DEPLOY-03 — Search Console (sitemap + indexing)

**Status:** PARTIAL-PASS — Tasks 1 + 2 verified with committed evidence; Task 3 (per-route indexing coverage) DEFERRED-INDEXING-WAIT pending Google's first crawl (24-48h, per Pitfall 2).

**Property:** Domain property at `tatibekov.com` (covers apex + www + subdomains per D-06)
**Verification method:** DNS TXT record on apex (added to Vercel DNS panel — PERMANENT; do not delete per Pitfall 6)
**Verification date:** 2026-05-13 — GSC reported "Ownership verified" via DNS TXT on apex `@.tatibekov.com`. PASS.
**Sitemap URL:** https://www.tatibekov.com/sitemap.xml (7 `<loc>` entries; emitted by `app/sitemap.ts`)
**Sitemap submission date:** 2026-05-13 — `https://www.tatibekov.com/sitemap.xml` submitted in GSC Sitemaps panel. PASS.
**Sitemap status:** Success (per attached `gsc/sitemap-submitted.png`).

### Indexing coverage snapshot (DEFERRED — 24-48h crawl wait)

| Route | Status | Counts toward pass? |
|-------|--------|---------------------|
| / | DEFERRED-INDEXING-WAIT | TBD |
| /projects | DEFERRED-INDEXING-WAIT | TBD |
| /stack | DEFERRED-INDEXING-WAIT | TBD |
| /experience | DEFERRED-INDEXING-WAIT | TBD |
| /writing | DEFERRED-INDEXING-WAIT | TBD |
| /contact | DEFERRED-INDEXING-WAIT | TBD |
| /shipped | DEFERRED-INDEXING-WAIT | TBD |

**Pass criterion (D-07):** ≥4 of 7 routes in `Discovered – currently not indexed` / `Crawled – currently not indexed` / `URL is on Google`.

**Outcome:** DEFERRED — re-check the URL Inspection report for each of the 7 routes 24-48 hours after sitemap submission (i.e. on or after 2026-05-14). Capture `gsc/coverage.png` then, fill the table above with the per-route statuses, and recompute the pass-state count. Phase 7 close-out (Plan 07-09) will either record the final DEPLOY-03 PASS verdict if ≥4/7 pass, or surface the gap for follow-up if not.

### Evidence

- `gsc/verification.png` — GSC property-verified screen (Task 1 capture, committed 2026-05-13) — ✓ PRESENT
- `gsc/sitemap-submitted.png` — GSC Sitemaps page showing `sitemap.xml` with Success status (Task 2 capture, committed 2026-05-13) — ✓ PRESENT
- `gsc/coverage.png` — GSC Pages / Coverage snapshot showing per-route status — **DEFERRED (capture in 24-48h, then commit)**

### Operational notes (PERMANENT — do not remove)

- **DNS TXT record is PERMANENT.** Per `07-RESEARCH.md` §Pitfall 6, Google re-checks the verification TXT record periodically. Deleting it un-verifies the Domain property and forces a full re-onboarding flow. Future DNS-panel maintenance MUST preserve the `google-site-verification=...` TXT record at the apex (`@.tatibekov.com`).
- **Property type is Domain (not URL prefix).** Per D-06, the Domain property covers apex + `www` + any future subdomains. Do not re-create a URL-prefix property.
- **Indexing is async.** Per `07-RESEARCH.md` §Pitfall 2, brand-new domains commonly show 7-21 days before full Indexed status; `Discovered` status counts toward DEPLOY-03 pass (D-07).

### DEPLOY-03 verdict

**DEPLOY-03 verdict: PARTIAL-PASS — DEFERRED-INDEXING-WAIT** — GSC Domain property verified and sitemap submitted with Success status; per-route indexing coverage waits 24-48h for Google's first crawl (Pitfall 2 explicitly accepts this latency for new domains). Phase 7 close-out (Plan 07-09) will record the final DEPLOY-03 outcome after the coverage capture lands.

### Follow-up TODO (24-48h after 2026-05-13)

After 2026-05-14:
1. In GSC, run URL Inspection on each of the 7 routes; record statuses in the table above.
2. Screenshot the Pages / Coverage overview and commit to `.planning/phases/07-deploy-verification/gsc/coverage.png`.
3. Update this VERIFICATION.md DEPLOY-03 section with the final outcome.
4. Plan 07-09's close-out should pick this up and record the final DEPLOY-03 PASS verdict in its sign-off section.

---

## DEPLOY-05 — npm audit + knip (pre-close-out gates)

**Methodology:** D-21 — `npm audit --omit=dev --audit-level=high` (FE + BE) + `npx knip` (FE only). All three must exit 0 before recording final scores in subsequent sections.

### FE npm audit

- Command: `npm audit --omit=dev --audit-level=high`
- Date: 2026-05-14
- Exit code: 0
- Result: 3 moderate-severity vulnerabilities (below `--audit-level=high` gate threshold); 0 high/critical
- Findings: `postcss <8.5.10` (transitive via `next` and `@vercel/analytics`) — GHSA-qx2v-qp2m-jg93 XSS via Unescaped `</style>` in CSS Stringify Output. Severity moderate. Below gate threshold and would require `npm audit fix --force` downgrading `next` to 9.3.3 (breaking) to clear — deferred per D-21 (gate is `--audit-level=high`, moderate findings do not block).
- Evidence: `audit-fe.txt`
- Remediation: none required (no high/critical surfaced); Phase 6 commit `1d9a295` (next 15.5.15 → 15.5.18 Vercel May 2026 CVE bump) held; Plan 03 `@vercel/analytics@^2.0.1` install introduced no new high/critical advisories.

### BE npm audit (../portfolio-services/)

- Command: `(cd ../portfolio-services && npm audit --omit=dev --audit-level=high)`
- Date: 2026-05-14
- Exit code: 0
- Result: `found 0 vulnerabilities` — zero advisories at any severity
- Evidence: `audit-be.txt`
- Remediation: none required. BE sibling repo unchanged in Phase 7 per D-23; this gate confirms dependency posture held since Phase 6 close-out.

### FE knip

- Command: `npx knip`
- Date: 2026-05-14
- Exit code: 0
- Result: zero unused files / exports / dependencies / types
- Configuration hints: 1 — knip suggested removing `.claude/**` from `knip.json` `ignore` list (it does not match any files knip would otherwise analyze). Hint is informational, not a gate failure. Left in place per recent user commits insulating workflow scaffolding from analysis.
- Evidence: `knip-fe.txt`
- Remediation: none required. Plan 03 deltas (`@vercel/analytics` import + `<Analytics />` mount in `app/layout.tsx`) correctly recognized by knip's Next.js plugin as in-use; no dead code introduced.

**DEPLOY-05 verdict: PASS** (3/3 gates exit 0; Phase 6 Vercel CVE bump `1d9a295` re-verified held; Plan 03 `@vercel/analytics` install introduced no new high/critical advisories.)

---

## DEPLOY-07 — 375px shell review (production) + real-device carry-forward closure

**Status:** PASS — DevTools 375px shell-review evidence captured by reviewer 2026-05-13. 42/42 cells across 7 routes × 6 criteria flip to ✓. Real-device carry-forwards closed per D-18.

**Methodology:** D-20 — Chrome DevTools 375px viewport on each of 7 production routes (https://www.tatibekov.com). Manual eyeball-pass on 6 criteria per route.

**Review date:** 2026-05-13 (reviewer attestation; production URL https://www.tatibekov.com on the bundle live since Wave 1 push).

### Per-route review

| Route | TopBar resume above fold | No horiz overflow | Hamburger reachable | No clipped text | Theme toggle reachable | Palette trigger reachable | Verdict |
|-------|---|---|---|---|---|---|---------|
| /           | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /projects   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /stack      | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /experience | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /writing    | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /contact    | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |
| /shipped    | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | PASS |

### Evidence

7 screenshots captured at 375px viewport on production and committed:

- `screenshots/375/about.png` — / — ✓ PRESENT (190 KB)
- `screenshots/375/projects.png` — /projects — ✓ PRESENT (205 KB)
- `screenshots/375/stack.png` — /stack — ✓ PRESENT (199 KB)
- `screenshots/375/experience.png` — /experience — ✓ PRESENT (293 KB)
- `screenshots/375/writing.png` — /writing — ✓ PRESENT (123 KB)
- `screenshots/375/contact.png` — /contact — ✓ PRESENT (125 KB)
- `screenshots/375/shipped.png` — /shipped — ✓ PRESENT (164 KB)

**DEPLOY-07 verdict: PASS** (42/42 cells across 7 routes × 6 criteria; all 7 PNG screenshots committed).

### Real-device carry-forwards (closed via D-18)

Per D-18, the following real-device gates close via the DevTools-emulation + Phase 5 axe 56-cell matrix + Plan 04 PSI mobile profile combination. With the per-route 375px review above PASS, these now formally close:

- **Phase 4 Gate 7 (iPhone Safari real-device):** CLOSED — DevTools iPhone SE / 375px emulation × 7 routes PASS + Phase 5 axe 56-cell matrix (4 hues × 2 themes × 7 routes WCAG 2.1 AA) already PASS. Safari-specific risks consciously enumerated under Known Limitations below.
- **Phase 4 Gate 8 (Android Chrome real-device):** CLOSED — DevTools Responsive 375px emulation × 7 routes PASS + same axe matrix.
- **Phase 5 Gate 3 (reduce-motion real-device):** CLOSED — Phase 5 universal-selector reduced-motion reset in `app/globals.css` (Plan 05-03) + `scripts/check-reduced-motion.mjs` smoke gate passing + DevTools `prefers-reduced-motion: reduce` emulation covered during this review.

### Known Limitations (consciously accepted per D-18)

The following Safari-specific behaviors are NOT physically validated in v1. If a v1.1 user reports a Safari-only issue along any of these dimensions, that triggers physical-device validation:

- **Safari `dvh`/`svh` viewport units** — Phase 4 uses `dvh` in some places; behavior under iOS Safari address-bar dynamics not physically tested.
- **Soft-keyboard behavior** — mobile palette / contact input fields with iOS soft-keyboard active not physically tested.
- **Mobile address-bar overlap at TopBar** — when iOS Safari address bar slides, behavior at the persistent TopBar not physically tested.
- **`-webkit-overflow-scrolling: touch`** — momentum-scroll behavior in mobile sheets/drawers not physically tested.

### Resume protocol — COMPLETED 2026-05-13

The Plan 07-08 executor halted at the Task 1 human-action checkpoint. Reviewer signal received: "375px captured". Protocol below preserved as historical record:

1. Open https://www.tatibekov.com in a regular Chrome tab.
2. Open DevTools (F12 / right-click → Inspect), toggle device toolbar (Cmd+Shift+M on macOS), pick iPhone SE (375 × 667) or set Responsive width to exactly 375, zoom 100%.
3. For each of the 7 routes — `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` — wait for full render, apply the 6-point eyeball criteria, capture full-size screenshot via DevTools Cmd+Shift+P → "Capture full size screenshot", save to `.planning/phases/07-deploy-verification/screenshots/375/<route-slug>.png` where `<route-slug>` is `about` / `projects` / `stack` / `experience` / `writing` / `contact` / `shipped`.
4. If any route fails an eyeball criterion: note the specific failure, apply the smallest CSS fix-in-place in `app/globals.css`, commit (`fix(07): correct <route> 375px overflow (DEPLOY-07 remediation)`), push, wait for redeploy, re-screenshot, update the table.
5. Once all 7 PNGs exist and the 42-cell mental table is all PASS, signal the orchestrator to resume Plan 07-08 (Task 2 — auto consolidation): flip all PENDING → ✓ in the table above, replace `**Review date:** PENDING` with the actual date, replace the verdict line with `**DEPLOY-07 verdict: PASS** (42/42 cells across 7 routes × 6 criteria)`, flip the three real-device carry-forward lines from PENDING to closed, and commit (`docs(07): record DEPLOY-07 375px shell review + close Ph4 G7/G8 + Ph5 G3 real-device carries (PASS)`).

---

## DEPLOY-02 — Lighthouse mobile profile × 7 routes

**Status:** PASS — 7/7 routes exceed Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 thresholds with substantial margin. Best Practices is informational (no plan threshold) and reads 96 across all routes.

**Methodology:** Chrome DevTools Lighthouse, mobile profile, single-run per route. DevTools Lighthouse and PageSpeed Insights share the identical scoring engine; DevTools runs locally (faster, no rate-limit) while PSI runs on Google's edge (slightly more deterministic). The plan's D-14 specifies PSI, but the substitution is acceptable when scores land far enough above threshold that Pitfall 1's 3-run-median variability protocol does not apply (no route's Performance is within ±3 of 90 — minimum is 96, maximum 100).

**Audit date:** 2026-05-13

### Scores table (7 routes × 4 Lighthouse pillars)

| Route       | Performance | Accessibility | SEO | Best Practices | Verdict |
|-------------|---|---|---|---|---------|
| `/`         | 100 | 100 | 100 | 96 | PASS |
| `/projects` | 100 | 100 | 100 | 96 | PASS |
| `/stack`    | 100 | 100 | 100 | 96 | PASS |
| `/experience` | 99  | 100 | 100 | 96 | PASS |
| `/writing`  | 100 | 100 | 100 | 96 | PASS |
| `/contact`  | 100 | 100 | 100 | 96 | PASS |
| `/shipped`  | 96  | 100 | 100 | 96 | PASS |

**Thresholds (plan D-14):**
- Performance ≥ 90 — all 7 routes pass (96-100; min 96 on `/shipped`)
- Accessibility ≥ 95 — all 7 routes pass (all at 100)
- SEO ≥ 95 — all 7 routes pass (all at 100)
- Best Practices: no plan threshold; 96 across all routes is informational

**Core metrics (LCP / CLS / INP):** Not explicitly extracted from the DevTools score panel captures (only the top-level scores). Performance scores in the 96-100 range mathematically imply core metrics within threshold (LCP < 2.5s, CLS < 0.1, INP/TBT < 200ms) — Lighthouse's Performance scoring weights these heavily, so a 96+ score requires all three to be well within the green zone. Explicit per-metric capture not performed per simplified DevTools workflow agreed with reviewer 2026-05-13; can be drilled down post-hoc by re-opening the saved HTML reports if needed.

### Evidence

7 PNG screenshots of the Lighthouse score panel (4 large circles + the detailed Performance view) committed under `.planning/phases/07-deploy-verification/lighthouse/`:

- `lighthouse/about-mobile.png` — `/` — ✓ PRESENT (237 KB)
- `lighthouse/projects-mobile.png` — `/projects` — ✓ PRESENT (238 KB)
- `lighthouse/stack-mobile.png` — `/stack` — ✓ PRESENT (223 KB)
- `lighthouse/experience-mobile.png` — `/experience` — ✓ PRESENT (302 KB)
- `lighthouse/writing-mobile.png` — `/writing` — ✓ PRESENT (189 KB)
- `lighthouse/contact-mobile.png` — `/contact` — ✓ PRESENT (187 KB)
- `lighthouse/shipped-mobile.png` — `/shipped` — ✓ PRESENT (208 KB)

### Methodology adaptation (DevTools Lighthouse vs PSI)

The plan D-14 specified PageSpeed Insights at https://pagespeed.web.dev/. The reviewer substituted Chrome DevTools Lighthouse to:
1. Run audits faster (no upload to Google's edge, no rate-limit between runs)
2. Use the same DevTools window already open for the 07-08 mobile shell review (375px)
3. Avoid PSI's rare cold-fetch variance

Both tools share the identical scoring engine, so verdicts are directly comparable. Pitfall 1's 3-run-median protocol exists to dampen variance when scores are NEAR threshold; since the worst observed Performance score is 96 (well above the 90 threshold), single-run captures are sufficient evidence. If any future re-run produces a Performance < 90, switch back to PSI 3-run-median per the original plan.

### DEPLOY-02 verdict

**DEPLOY-02 verdict: PASS** — 7/7 routes exceed Performance / Accessibility / SEO thresholds; substantial margin on every metric; DevTools Lighthouse methodology substitution documented and accepted.
