---
phase: 05-seo-accessibility-polish
plan: 07
subsystem: accessibility
tags: [accessibility, contrast, axe-core, playwright, oklch, wcag-2.1-aa, matrix-audit]

# Dependency graph
requires:
  - phase: 02-shell
    provides: AccentBootstrapScript inline-style writes `--accent-hue` on <html>; next-themes sets `data-theme="dark"|"light"`; globals.css :root + [data-theme="light"] token blocks; @supports oklch sRGB fallbacks
  - phase: 05-seo-accessibility-polish
    provides: 05-01 (Playwright + @axe-core/playwright devdeps; tests/contrast.spec.ts scaffold; test:contrast npm script); 05-02 (OG images + favicon + manifest visual surfaces axe can crawl); 05-03 (universal-selector reduced-motion reset in globals.css — load-bearing for this plan's reducedMotion infrastructure fix); 05-04 (AboutSocials mini-card surfaces on /about); 05-05 (JSON-LD <script> + view-source <noscript> letter); 05-06 (ConsoleSignature client island)
provides:
  - Real 4×2×7 = 56-cell axe color-contrast matrix passing at WCAG 2.1 AA
  - Theme-scoped --muted / --accent-dim / amber-on-light overrides preserving the handoff palette
  - playwright.config.ts switched to build+start + reducedMotion: reduce for deterministic axe runs
  - 05-07-AXE-RUN-1.md (pre-remediation evidence) + 05-07-AXE-RUN-2.md (post-remediation pass)
affects: [05-08 verification gates; future visual changes to muted text or accent-dim surfaces]

# Tech tracking
tech-stack:
  added: []   # No new dependencies; @axe-core/playwright and playwright already on devdeps from 05-01
  patterns:
    - "Theme-scoped CSS variable overrides: [data-theme=\"dark\"] {...} and [data-theme=\"light\"] {...} blocks at end-of-file inside @supports (color: oklch) — preserves brownfield :root + [data-theme=\"light\"] token blocks at lines 7-82, never mutates them"
    - "Hue-scoped per-cell override via [data-theme=\"<theme>\"][style*=\"--accent-hue: <hue>\"] attribute selector matching AccentBootstrapScript's inline-style write — gives D-22 conservative remediation without new HTML attributes"
    - "Playwright contextOptions.reducedMotion = 'reduce' to fire the Plan 05-03 universal-selector animation reset for deterministic contrast audits — also semantically correct (audit targets steady-state paint)"
    - "Matrix-test infrastructure: build+start (not dev) for compile determinism; Pitfall 10 data-theme canary BEFORE axe in every cell"

key-files:
  created:
    - .planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-1.md
    - .planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-2.md
    - .planning/phases/05-seo-accessibility-polish/05-07-SUMMARY.md
  modified:
    - tests/contrast.spec.ts  (Task 1 — 4×2×7 axe matrix with Pitfall 10 canary)
    - playwright.config.ts    (Task 4 — build+start + reducedMotion)
    - app/globals.css         (Task 4 — 3 theme-scoped override blocks)

key-decisions:
  - "Outcome C remediation strategy (orchestrator-approved at the human-verify checkpoint): build+start infrastructure swap + global --muted bump + global --accent-dim bump + pre-emptive amber-on-light scoped override"
  - "Theme-scoping ([data-theme=\"dark\"]/[data-theme=\"light\"]) — NOT :root — for all overrides; specificity collision between :root and [data-theme=\"light\"] (both (0,1,0)) means an unscoped :root override at end-of-file wins source-order and bleeds into light theme (Iteration c → d discovery)"
  - "Light-theme companion muted bump (oklch(0.46 0.005 175)) added in Run 3 → Run 4 iteration after the dark-theme bump exposed a hue-INDEPENDENT light-theme failure that Run 1 could not see (Run 1's amber-on-light cells canary-timed-out before axe could exercise them)"
  - "Playwright reducedMotion: reduce required for axe to see the FINAL paint state — without it, .content-block slideIn animation is mid-flight (opacity ~0.14) when axe runs and composites foreground colors against the parent opacity, producing impossibly-dark false-positive failures"
  - "build+start (not dev) for the test infrastructure — Next.js dev mode's lazy per-route compile (~2–10s) overruns the 5s data-theme canary timeout in 54/56 cells"
  - "All overrides preserve the existing :root and [data-theme=\"light\"] token blocks at globals.css lines 39-82 (the canonical handoff palette) — Outcome C scope-broadens to theme-scoped, NOT global, per D-22 conservatism"
  - "Pre-emptive amber-on-light override applied even though the amber cells never produced a failure (they were below the threshold after the muted fix) — D-22 says scope narrowly to failing cells, but the predicted Pitfall 5 is a known fragility, and the override has zero blast radius beyond `[data-theme=\"light\"][style*=\"--accent-hue: 75\"]`"

patterns-established:
  - "Pattern: contrast-matrix iteration with single canary — when a 56-cell test fails 28/28 along one axis, that's a global cause (cascade leak, infrastructure issue, or sweeping token gap). Read the failure-color pattern across cells before reaching for per-cell remediation"
  - "Pattern: @supports gated theme-scoped override blocks at end-of-file — preserves the canonical token blocks at the top of the file while letting late-arriving WCAG remediation live next to its audit-trail comment"
  - "Pattern: Pitfall 10 canary (data-theme assertion BEFORE axe) is the load-bearing test sanity check — it caught the dev-server compile lag in Run 1 (54 cells timed out instead of producing 54 false-pass results) and the cascade leak in Run 3"

requirements-completed: [A11Y-07]

# Metrics
duration: ~23 min agent-side (Task 1 + Task 2: ~10 min; Task 4 + iteration loops: ~13 min; checkpoint wall-clock pause not counted)
completed: 2026-05-10
---

# Phase 5 Plan 07: 4×2×7 Axe Contrast Matrix Summary

**56-cell axe color-contrast matrix (4 accent hues × 2 themes × 7 routes) passing WCAG 2.1 AA on all cells via three theme-scoped oklch overrides plus a Playwright reducedMotion + build+start infrastructure swap; preserves the canonical Phase 2 token palette.**

## Performance

- **Duration:** ~23 min agent-side (Task 1 + Task 2 + checkpoint return: ~10 min; Task 4 + 4 remediation iterations + finalization: ~13 min; the ~7-hour human-verify checkpoint wall-clock pause is not counted)
- **Started:** 2026-05-10T16:54:54Z (Task 1 commit `0418724`)
- **Completed:** 2026-05-10T17:23:27Z (Run 2 audit trail commit `7fed0fd`); plan-metadata commit follows
- **Tasks:** 4 (1 + 2 autonomous, 3 checkpoint, 4 with 4 internal remediation iterations)
- **Files modified:** 3 production files (`tests/contrast.spec.ts`, `playwright.config.ts`, `app/globals.css`); 3 planning files (RUN-1, RUN-2, SUMMARY)

## Accomplishments

- **All 56 cells pass** the axe `color-contrast` rule under both `wcag2aa` and `wcag21aa` tag filters (Run 2 final: 56 passed, 0 failed in 33.3s on 1 worker).
- **Pitfall 10 canary observably effective.** In Run 1 it correctly diagnosed dev-server compile lag (54 cells failed canary cleanly, NOT axe — preventing 54 false-pass results). Throughout iterations it kept catching cascade misconfigurations before axe could mislead.
- **D-22 conservative remediation preserved.** Three CSS overrides total; all theme-scoped (`[data-theme="dark"]`, `[data-theme="light"]`, `[data-theme="light"][style*="--accent-hue: 75"]`). The existing `:root` block (line 7-37) and `[data-theme="light"]` block (line 50-71) plus their `@supports` companion blocks (lines 39-48, 73-82) — the canonical Phase 2 handoff palette — are untouched.
- **Pre-emptive amber-on-light override committed** (commit `62aa039`) — the predicted Pitfall 5 failure that Run 1 couldn't exercise (amber cells canary-timed-out before axe ran) is now defended against by a scoped override that has zero blast radius beyond `[data-theme="light"]` + `--accent-hue: 75`.
- **No regressions:** `npm test` (Vitest) still 134/134 green; `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean.

## Task Commits

Each task / iteration was committed atomically:

1. **Task 1: Rewrite tests/contrast.spec.ts as 4×2×7 axe matrix** — `0418724` (test)
2. **Task 2: Run matrix and capture failures (Run 1)** — `dbfacc6` (docs — pre-remediation audit trail; orchestrator brought back outcome-c authorization)
3. **Task 3: Human-verify checkpoint** — no commit (orchestrator return only)
4. **Task 4: Apply per-hue chroma overrides and re-run matrix (4 iterations to green):**
   - `9a2f7af` (test) — switch contrast matrix to build+start for deterministic compile
   - `113b6e7` (feat) — bump --muted and --accent-dim L on dark theme (initial :root scope; later re-scoped)
   - `62aa039` (feat) — scope amber-on-light --warn override (Pitfall 5)
   - `56dad99` (fix — Rule 3) — emulate reduced-motion so axe sees final paint
   - `0034e21` (fix — Rule 3) — nest reducedMotion under contextOptions per Playwright types
   - `ed573cd` (fix — Rule 1) — scope dark-theme token bumps to [data-theme="dark"]
   - `76df6fa` (fix — Rule 2) — bump light-theme --muted L down to clear 4.5:1
   - `7fed0fd` (docs) — capture post-remediation axe matrix Run 2 (56/56 pass)

**Plan metadata:** _final commit covers this SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md_

## Files Created/Modified

- `tests/contrast.spec.ts` — 4 hues × 2 themes × 7 routes = 56 axe cells with addInitScript localStorage seeding (theme + portfolio-accent) and Pitfall 10 `data-theme` canary BEFORE every axe run
- `playwright.config.ts` — `webServer.command: "npm run build && npm run start"` (was `npm run dev`); `webServer.timeout: 120_000` (was 60_000); `use.contextOptions.reducedMotion: "reduce"` (new)
- `app/globals.css` — appended `@supports (color: oklch(0 0 0))` block at end of file with three theme-scoped overrides: `[data-theme="dark"] --muted oklch(0.62 0.005 175)`, `[data-theme="dark"] --accent-dim oklch(0.70 0.12 var(--accent-hue))`, `[data-theme="light"] --muted oklch(0.46 0.005 175)`; plus `[data-theme="light"][style*="--accent-hue: 75"] --warn oklch(0.42 0.18 75)` as a top-level rule
- `.planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-1.md` — pre-remediation Run 1 audit trail (created in Task 2)
- `.planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-2.md` — post-remediation Run 2 audit trail with all 4 iterations + final 56/56 pass detail

## Decisions Made

- **Outcome C remediation strategy adopted at the human-verify checkpoint** — the orchestrator authorized: build+start infrastructure swap + global --muted bump + global --accent-dim bump + pre-emptive amber-on-light scoped override. All four were applied.
- **Theme-scoped overrides, not :root** — discovered during Iteration (c→d) that `:root` at end-of-file wins source-order against `[data-theme="light"]` because they share specificity (0,1,0). All overrides are now scoped to `[data-theme="dark"]` or `[data-theme="light"]` accordingly.
- **Light-theme companion --muted bump** — Run 3 surfaced a hue-INDEPENDENT light-theme failure (`#6a7370` muted on `#f4f2ea` bg at 4.35:1, need 4.5:1) that Run 1 could not see because the 8 amber-on-light cells canary-timed-out. Lowered L on light theme `--muted` to `oklch(0.46 0.005 175)`.
- **Pre-emptive amber-on-light --warn override applied** even though no amber cell produced a failure once muted was fixed. D-22 says scope narrowly to FAILING cells; the override has zero blast radius and defends against the known Pitfall 5 fragility, so it ships.
- **reducedMotion is a contrast-audit semantic primitive, not just a test infra hack** — the design must pass contrast at the STEADY-STATE paint, which reduced-motion users always see. Setting `contextOptions.reducedMotion: "reduce"` aligns the test with the WCAG 2.1 AA evaluation surface.

## Deviations from Plan

### Auto-fixed Issues

The plan's Task 4 specified a single override append + a single re-run. The actual execution required four iterations to reach 56/56 green because Run 1 only produced data for 2/56 cells (the rest canary-timed-out), leaving the remediation surface partially visible. Each iteration is its own auto-fix:

**1. [Rule 3 — Blocking] reduced-motion emulation for axe**
- **Found during:** Task 4 Iteration (b) — Run 2 with build+start
- **Issue:** 56/56 cells failed with axe reporting impossibly-dark foreground colors (e.g. `oklch(0.62 0.005 175)` rendered as `#343736`). Cause: `.content-block` `slideIn` animation (200ms opacity 0→1) was mid-flight when axe ran against the now-fast pre-compiled pages; axe composites foreground with parent opacity ~0.14 and reports the darkened composite.
- **Fix:** Added `use.contextOptions.reducedMotion: "reduce"` to playwright.config.ts to fire the Plan 05-03 universal-selector animation reset (animation-duration: 0.01ms).
- **Files modified:** playwright.config.ts
- **Verification:** Iteration (c) confirmed axe now sees `oklch(0.62 0.005 175)` rendered as `#838786` (correct), and 28/28 dark cells pass.
- **Committed in:** `56dad99`, `0034e21` (the second commit nests `reducedMotion` under `contextOptions` because it lives on BrowserContextOptions, not the top-level PlaywrightTestOptions in @playwright/test@1.59.1)

**2. [Rule 1 — Bug] specificity collision with `:root` override**
- **Found during:** Task 4 Iteration (c) — Run 2 with reduced-motion
- **Issue:** 28/56 cells passed (all dark), 28/28 light cells failed. Cause: my override block declared `:root { --muted: oklch(0.62 0.005 175); }` (Outcome C said "global bumps"); but `:root` and `[data-theme="light"]` share specificity (0,1,0). At end-of-file, my `:root` won source-order over the earlier `[data-theme="light"]` block and overrode light theme's `--muted #6a7370` → `oklch(0.62 0.005 175)`. The bumped value is brighter than `#6a7370` on a dark bg (correct), but BRIGHTER on a light bg makes contrast WORSE — light theme dropped from 4.64:1 → 3.24:1.
- **Fix:** Scoped the override to `[data-theme="dark"]` instead of `:root`. Same specificity now matches `[data-theme="light"]`; the dark-scoped block only matches dark theme; light theme falls through to its own untouched values.
- **Files modified:** app/globals.css
- **Verification:** Iteration (d) confirmed all 28 dark cells still pass; light theme `--muted` reverts to `#6a7370` (verified via Playwright `getComputedStyle().getPropertyValue("--muted")`).
- **Committed in:** `ed573cd`

**3. [Rule 2 — Missing Critical] light-theme companion --muted bump**
- **Found during:** Task 4 Iteration (d) — Run 3 (28 dark pass, 28 light fail)
- **Issue:** All 28 light cells failed identically: `--muted: #6a7370` on `--bg: #f4f2ea` at 4.35:1 (need 4.5:1). The handoff palette puts `--muted` at the exact same sRGB value (#6a7370) for both themes; the failure is hue-INDEPENDENT and equally affects all 4 accent hues on light theme. This was not visible in Run 1 because the 8 amber-on-light cells canary-timed-out before axe could exercise them — so the broader light-theme muted-on-light-bg failure was hidden.
- **Fix:** Added `@supports :root [data-theme="light"] { --muted: oklch(0.46 0.005 175); }` — same hue/chroma, LOWER L (darker text on lighter bg). Light theme `--muted` now ≈ #5c625f at ~5.0:1 on `#f4f2ea`.
- **Files modified:** app/globals.css
- **Verification:** Iteration (e) confirmed 56/56 cells pass; lint/typecheck/build/vitest all green.
- **Committed in:** `76df6fa`

**4. [Rule 3 — Blocking] build+start instead of dev (orchestrator-authorized in resume instructions)**
- **Found during:** Task 4 Step A (resumption from checkpoint)
- **Issue:** Run 1 documented that dev mode's lazy per-route compile (~2–10s) overran the 5s `data-theme` canary timeout in 54/56 cells. The orchestrator's resume instructions explicitly authorized swapping to build+start as Step A of the remediation.
- **Fix:** Changed `webServer.command` to `npm run build && npm run start` and bumped `timeout` to 120_000ms.
- **Files modified:** playwright.config.ts
- **Verification:** Iteration (a→b) confirmed all 56 cells now produce real axe results within the canary timeout.
- **Committed in:** `9a2f7af`

---

**Total deviations:** 4 auto-fixed (2 Rule-3 blocking infra fixes, 1 Rule-1 cascade bug, 1 Rule-2 missing critical light-theme remediation)
**Impact on plan:** All four auto-fixes were necessary to reach 56/56 green. Deviations 1 and 4 are infrastructure (the plan correctly authorized build+start; reduced-motion was a discovered necessity). Deviations 2 and 3 are CSS remediation steps within Outcome C's scope (the plan correctly said "if Run 2 reveals new failures, iterate"). No scope creep — every deviation was inside the Outcome C umbrella.

## Issues Encountered

- **Iteration loop took 4 internal runs instead of the planned 1.** Each iteration cleanly diagnosed the next blocker (Run 1 documented dev-server lag; Iteration (b) surfaced animation timing; Iteration (c) surfaced cascade specificity; Iteration (d) surfaced the light-theme companion failure that Run 1 couldn't see). The Pitfall 10 canary + axe's explicit color/ratio reporting kept each iteration's signal clean and actionable.
- **Specificity collision with `:root` overrides.** The fix is now load-bearing project knowledge: any late-arriving CSS variable override in `app/globals.css` MUST be scoped to `[data-theme="dark"]` or `[data-theme="light"]` to avoid bleed-through. The canonical `:root` block at the top of the file is the ONLY place that should use `:root` selectors for variables, and only for base values both themes inherit unless overridden.

## User Setup Required

None — no external service configuration required. The contrast matrix runs locally via `npm run test:contrast`; CI integration (if added later) needs only the existing `@axe-core/playwright` + `@playwright/test` devdeps plus a `playwright install chromium` step (already documented for Plan 05-01).

## Next Phase Readiness

- A11Y-07 requirement is closed; Phase 5 plan counter advances to 7/8.
- Plan 05-08 (Wave 5 manual gates) can now run. The remaining manual gates are: DEV-03 curl `x-built-with` on all 7 routes, DEV-02 view-source HTML comment in Chrome+Firefox, A11Y-03 macOS Reduce Motion OS toggle, optional SEO-03c Slack/LinkedIn unfurl via ngrok.
- No blockers carried forward.

## TDD Gate Compliance

This plan is `type: execute` (not `type: tdd`). No RED/GREEN gates required. Task 1 happened to commit as a `test(...)` commit because it was a pure test-spec rewrite; Task 4's remediation commits are `feat(...)` (CSS palette additions) and `fix(...)` (auto-fixed deviations), which is the expected commit-type pattern for an execute-type plan.

## Self-Check: PASSED

- [x] `tests/contrast.spec.ts` (4×2×7 spec) — FOUND
- [x] `playwright.config.ts` (build+start + reducedMotion) — FOUND
- [x] `app/globals.css` (3 theme-scoped overrides) — FOUND
- [x] `.planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-1.md` — FOUND
- [x] `.planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-2.md` — FOUND
- [x] Commit `0418724` (Task 1 test rewrite) — FOUND in `git log`
- [x] Commit `dbfacc6` (Run 1 audit trail) — FOUND in `git log`
- [x] Commit `9a2f7af` (build+start) — FOUND in `git log`
- [x] Commit `113b6e7` (initial dark token bump) — FOUND in `git log`
- [x] Commit `62aa039` (amber-on-light scoped override) — FOUND in `git log`
- [x] Commit `56dad99` (reducedMotion fix) — FOUND in `git log`
- [x] Commit `0034e21` (contextOptions nesting fix) — FOUND in `git log`
- [x] Commit `ed573cd` (specificity scope fix) — FOUND in `git log`
- [x] Commit `76df6fa` (light-theme muted bump) — FOUND in `git log`
- [x] Commit `7fed0fd` (Run 2 audit trail) — FOUND in `git log`

---

*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
