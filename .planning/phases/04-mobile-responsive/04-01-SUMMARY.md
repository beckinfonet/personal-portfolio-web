---
phase: 04-mobile-responsive
plan: 01
subsystem: ui
tags: [css, mobile, print, audit-scripts, drawer, palette, a11y, phase-4]

# Dependency graph
requires:
  - phase: 02-shell
    provides: persistent shell layout, [cmdk-dialog] / [cmdk-overlay] selectors, .sidebar / .topbar / .skip-link / .cursor / .live-clock classes, prefers-reduced-motion baseline at globals.css line 152
  - phase: 03-views
    provides: about-view DOM, .about-card / .stack-* / .exp-* / .writing-* / .contact-* / .shipped-row* selectors, .stack-pre / .prompt-line code-block primitives
provides:
  - "@media (max-width: 960px) block at end of globals.css with sidebar hide, drawer styles, palette bottom-sheet overrides, hamburger trigger, about-status-mobile rehome, 44px touch targets"
  - "@media print block at end of globals.css: hide chrome, white bg + black text + Georgia serif body, mono carve-outs, page-break safety, per-token color normalization"
  - "@keyframes drawerSlideIn (translateY 100% to 0, 200ms ease-out) shared by drawer + mobile palette"
  - "Extended prefers-reduced-motion block (line 152) with drawer/backdrop/cmdk-dialog animation overrides"
  - "Six new CSS classes for Wave 2 components: .drawer-sheet, .drawer-backdrop, .drawer-file-row, .drawer-close-btn, .topbar-hamburger, .about-status-mobile, .print-footer"
  - "Three audit scripts (check-sidebar-redistribution.mjs, check-print-rules.mjs, check-mobile-palette-css.mjs) enforcing Pitfall 7 / A11Y-09 / PALETTE-05 invariants"
  - "check:mobile npm script chaining all three audits"
affects: [04-02 explorer-drawer-island, 04-03 status-block-and-about-mobile, 04-04 print-footer-rsc, 04-05 mobile-tests-and-verification, future Phase 5 a11y, future Phase 7 deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "End-of-globals.css mobile + print rule appendage (single-file pure CSS — no Tailwind, no CSS modules)"
    - "Audit script pattern: readFileSync globals.css, scope regex via match() to a specific @media block, exit 1 on missing invariant with itemized FAIL labels"
    - "Reduced-motion block extension (in-place rule add to existing block at line 152)"

key-files:
  created:
    - scripts/check-sidebar-redistribution.mjs
    - scripts/check-print-rules.mjs
    - scripts/check-mobile-palette-css.mjs
  modified:
    - app/globals.css
    - package.json

key-decisions:
  - "Do NOT add print-color-adjust:exact (threat T-04-01 mitigation — default 'economy' keeps printer from rendering theme-specific oklch values)"
  - "Single mobile breakpoint at 960px for sidebar collapse + palette bottom-sheet swap + STATUS rehome (D-01 — preserves Phase 2 internal top-bar breakpoints at 600/480 unchanged)"
  - "Drawer slide-in 200ms ease-out keyframes shared with mobile palette (one keyframe def, two consumers)"
  - "Mono carve-outs in print stylesheet (.stack-pre, .prompt-cmd, .prompt-dollar, .tech-chip, .exp-hash, .stack-{key,string,punct}) so JSON/commands stay legible on paper"
  - "Per-token color normalization in print uses #000 / #333 / #999 — preserves tonal hierarchy on b/w printers without printing theme colors"

patterns-established:
  - "audit-script: readFileSync of single CSS source, regex.test() per check, exit 0 clean / 1 violation with FAIL labels — analog to scripts/check-placeholders.mjs"
  - "print-stylesheet: single @media print block at end-of-file with comma-separated hide selectors + scoped font-family overrides + scoped color/border normalization"
  - "mobile-rehome: every sidebar display:none paired with a documented mobile home (drawer, about-view-status, top-bar resume), enforced by check-sidebar-redistribution.mjs"

requirements-completed: [MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-05, PALETTE-05, A11Y-09]

# Metrics
duration: 4min 23s
completed: 2026-05-07
---

# Phase 4 Plan 01: Mobile + Print CSS Foundation + Audit Scripts Summary

**Foundational CSS for Phase 4 mobile redistribution and print stylesheet appended to globals.css — drawer styles, palette bottom-sheet overrides, sidebar hide paired with documented rehomes, 44px touch targets, Georgia serif print body, mono carve-outs, page-break safety — plus three CI audit scripts enforcing the invariants going forward.**

## Performance

- **Duration:** 4m 23s
- **Started:** 2026-05-07T16:45:23Z
- **Completed:** 2026-05-07T16:49:46Z
- **Tasks:** 3
- **Files modified:** 5 (1 CSS + 3 new scripts + 1 package.json)
- **globals.css line delta:** +279 lines (1221 → 1500)

## Accomplishments

- Wave 1 CSS foundation in place: every Wave 2 component (ExplorerDrawer, StatusBlock, PrintFooter) now has selectors to render into.
- Mobile @media block (max-width: 960px) lays down sidebar hide, drawer styles, hamburger trigger, palette bottom-sheet overrides, about-status-mobile rehome, and 44px touch targets in a single edit.
- Print @media block (A11Y-09) hides screen chrome, forces white-on-black with Georgia serif body, keeps mono on code-like content, normalizes colors to #000/#333/#999, adds page-break safety on .shell-footer + .print-footer, and explicitly omits print-color-adjust:exact (security mitigation).
- Three audit scripts ship as CI guards: sidebar redistribution (Pitfall 7 / MOBILE-01), print rules (A11Y-09), mobile palette CSS (PALETTE-05). All three pass against post-Task-2 globals.css. `npm run check:mobile` chains them with && so any regression surfaces as a non-zero exit.
- prefers-reduced-motion baseline at line 152 extended in-place with drawer + cmdk-dialog animation overrides — single block, not duplicated.

## Task Commits

Each task was committed atomically (single-repo, no sub_repos configured):

1. **Task 1: Append @media (max-width: 960px) block + extend prefers-reduced-motion** — `e388eb1` (feat)
2. **Task 2: Append @media print block + .print-footer + per-token color normalization** — `05db5f5` (feat)
3. **Task 3: Create three audit scripts + wire check:mobile npm script** — `e3fe0b7` (feat)

**Plan metadata commit:** pending (final docs commit will include this SUMMARY + STATE + ROADMAP updates).

## Files Created/Modified

- `app/globals.css` — Appended +279 lines: a single @media (max-width: 960px) block with sidebar hide, drawer + backdrop + close-btn rules, hamburger styling, about-status-mobile show/hide, terminal-main mobile padding, [cmdk-overlay/dialog/input/list/item/empty] bottom-sheet overrides, drawer file-row 44px touch padding; @keyframes drawerSlideIn shared with mobile palette; a single @media print block hiding 11 screen-chrome selectors, forcing white bg + black text + Georgia serif body with mono carve-outs, normalizing 16+ tokens to #000/#333/#999, page-break-inside:avoid on .shell-footer + .print-footer; .print-footer default display:none + print display:block !important rules; in-place extension of the existing prefers-reduced-motion block at line 152 with Phase 4 animation overrides.
- `scripts/check-sidebar-redistribution.mjs` — NEW. Pitfall 7 / MOBILE-01 audit: asserts .sidebar display:none paired with .drawer-sheet + .drawer-backdrop + .about-status-mobile + .topbar-hamburger classes present in globals.css. Exits 0 on clean, 1 with FAIL labels on regression.
- `scripts/check-print-rules.mjs` — NEW. A11Y-09 audit: scopes checks to the @media print block via regex match(), asserts Georgia font-family, var(--font-mono) carve-outs, .topbar/.sidebar display:none, .print-footer reference, page-break-inside:avoid, white bg, black text. Adds a global file-level check that print-color-adjust:exact does NOT appear (threat T-04-01).
- `scripts/check-mobile-palette-css.mjs` — NEW. PALETTE-05 audit: scopes checks to the @media (max-width: 960px) block, asserts [cmdk-dialog/overlay/input] overrides, [cmdk-item] 14px touch padding, bottom-sheet border-radius, max-height 80vh.
- `package.json` — Added `"check:mobile": "node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs"` after the existing `knip` line. Not chained into postbuild yet (Wave 4 manual review plan owns that).

## Decisions Made

None beyond the plan as written. All three tasks executed exactly per `<action>` blocks. Decisions inherited from 04-CONTEXT.md (D-01..D-21) and 04-UI-SPEC.md were honored verbatim — single 960px breakpoint, drawer + cmdk-dialog share keyframes, no print-color-adjust:exact, 44×44px touch targets via padding 14px on cmdk-item / drawer file rows.

## Deviations from Plan

None - plan executed exactly as written.

The PreToolUse:Edit reminder hook fired three times (once per Edit/Write to a file the harness perceived as "not yet read" because the conversation context did not surface a Read marker for that exact path); each time, the underlying edit had already succeeded — verified by post-hook grep + npm runs. No content was lost or rewritten as a result of the hook reminders.

## Issues Encountered

None during planned work. Lint, build, and full Vitest suite (18 files, 67 tests) all green at end of execution.

## User Setup Required

None - no external service configuration required. All work is local CSS + Node ESM scripts; no env vars added; no third-party services touched.

## Next Phase Readiness

Wave 1 complete. Wave 2 (parallel: 04-02 ExplorerDrawer client island + ☰ trigger; 04-03 StatusBlock primitive + about-view mobile mount; 04-04 PrintFooter RSC) is now unblocked — all three Wave 2 plans render INTO selectors that exist in globals.css:

- `04-02` renders `.drawer-sheet`, `.drawer-backdrop`, `.drawer-file-row`, `.drawer-close-btn`, `.topbar-hamburger` — all defined.
- `04-03` renders inside `.about-status-mobile` wrapper — defined with `display: none` default and `display: block` mobile override.
- `04-04` renders inside `.print-footer` wrapper — defined with `display: none` default and `display: block !important` print override + page-break-inside:avoid.

When each Wave 2 plan ships, the corresponding audit script will continue to pass (because they audit CSS, not component output); when Wave 4 manual review runs, the three audit scripts feed into the verification command as the automated gate behind the cross-viewport screenshot review.

ROADMAP Phase 4 success criterion 4 (sidebar redistribution audit) and criterion 5 (print preview chrome hidden + serif body) are now CSS-anchored and CI-enforceable.

## Self-Check: PASSED

**Files exist:**
- FOUND: app/globals.css (+279 lines, 1500 total)
- FOUND: scripts/check-sidebar-redistribution.mjs
- FOUND: scripts/check-print-rules.mjs
- FOUND: scripts/check-mobile-palette-css.mjs
- FOUND: package.json (check:mobile script added)

**Commits exist (verified via `git log --oneline`):**
- FOUND: e388eb1 — feat(04-01): add Phase 4 mobile @media block + drawer + reduced-motion to globals.css
- FOUND: 05db5f5 — feat(04-01): add @media print stylesheet to globals.css (A11Y-09)
- FOUND: e3fe0b7 — feat(04-01): add three Phase 4 mobile/print CSS audit scripts + check:mobile npm script

**Audit scripts pass:** `npm run check:mobile` exits 0 with all three audits passing.

**Build + tests pass:** `npm run lint` clean; `npm run build` succeeds (postbuild check-placeholders.mjs also passes); `npm test` shows 18 files / 67 tests passing.

---
*Phase: 04-mobile-responsive*
*Completed: 2026-05-07*
