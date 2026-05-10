---
phase: 05-seo-accessibility-polish
plan: 06
subsystem: dev-easter-egg / client-island

tags: [easter-egg, dev-experience, client-island, useeffect, console-log, dev-01]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-01 Wave 0 — app/components/shell/console-signature.test.tsx scaffold (sentinel-only) seeded for extension here"
  - phase: 02-shell
    provides: "LiveClock pattern (client island with 'use client' + useEffect on mount) — exact analog for ConsoleSignature minus useState"
  - phase: 02-shell
    provides: "app/(terminal)/layout.tsx mount-point convention — sibling-of-CommandPalette pattern (Pitfall 8: never root layout)"
provides:
  - "app/components/shell/console-signature.tsx: 7th client island. 'use client' + useEffect-on-mount calls console.log once with %c-styled ASCII art (BT initials) + 2 plain lines (github invitation + email invitation reading PROFILE.email). Returns null (no DOM). 6 vitest assertions verify call-count + content + arg-count + null DOM."
  - "app/(terminal)/layout.tsx: <ConsoleSignature /> mounted as sibling between <CommandPalette /> and <PrintFooter />. Inline comment documents Pitfall 8 (never in app/layout.tsx — would collapse RSC tree)."
affects: [05-07, 05-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern: tiny client island with side-effect-only useEffect — ConsoleSignature drops useState (no DOM render) and returns null instead of a span. LiveClock is the closest precedent (also 'use client' + useEffect-on-mount), but LiveClock renders text from state. ConsoleSignature is purely a side-effect island. Establishes a narrower 'event-driven null-render' subpattern for any future easter-egg / analytics / instrumentation islands."
    - "Pattern: %c console-styling with two-style fallback — first %c colors the ASCII art matrix-accent (#16a34a sRGB hex; not var(--accent) — DevTools console doesn't consume CSS variables); second %c falls back to color: inherit so the 2 plain lines render in the user's default console color across light/dark DevTools themes. Single console.log call (not 3 separate calls) — RESEARCH 'Don't Hand-Roll' guidance: multiple logs would clutter DevTools."
    - "Pattern: inline ASCII art module-level constant — ASCII_ART, ART_STYLE, TEXT_STYLE all UPPERCASE module constants per CONVENTIONS.md / PATTERNS.md §C. Initials 'BT' chosen (6 rows × ~17 cols) over full 'BAKYTBEK' (6 rows × ~65 cols) for cross-environment legibility — full art wraps in narrow terminals + mobile DevTools."
    - "Pattern: pitfall-8 boundary preservation — ConsoleSignature mounted in (terminal)/layout.tsx (also RSC) keeps the client boundary local. The island has no children (returns null), so the RSC subtree stays RSC. Mounting in app/layout.tsx would force the entire app to client and spike First Load JS by ~50-200KB. Acceptance criteria explicitly check `! grep -q '<ConsoleSignature />' app/layout.tsx`."

key-files:
  created:
    - "app/components/shell/console-signature.tsx (39 lines — 'use client' island; ASCII_ART + ART_STYLE + TEXT_STYLE constants; useEffect-on-mount fires single console.log; returns null)"
  modified:
    - "app/components/shell/console-signature.test.tsx (replaced 8-line Wave 0 sentinel with 49-line real test suite — 6 assertions covering call-count + ASCII art + github line + email line + arg-count + null DOM via vi.spyOn(console, 'log'))"
    - "app/(terminal)/layout.tsx (+5 lines — 1 import alphabetically clustered between CommandPalette + ExplorerDrawer; 3 lines of JSX + comment for the mount between <CommandPalette /> and <PrintFooter />)"

key-decisions:
  - "ASCII art uses 'BT' initials (6 rows × ~17 cols) instead of full 'BAKYTBEK' (6 rows × ~65 cols). Per CONTEXT D-24 + RESEARCH Open Question + UI-SPEC §'Console signature copy': planner authors v1; first-run review can swap to full name. Initials are unambiguously distinctive (they match PROFILE.initials) and read cleanly in narrow terminals + mobile Chrome DevTools — full art wraps and becomes unreadable. v1 ships initials; first-run user feedback drives any swap."
  - "console.log fires exactly once via useEffect with [] deps — no module-level didLog idempotency guard. Plan IMPORTANT_CONSTRAINTS suggested a guard to defend against React StrictMode double-mount in dev, but: (a) jsdom in vitest does not wrap in StrictMode (asserted via toHaveBeenCalledTimes(1) — passes), (b) production hydration runs effects once per mount, (c) StrictMode double-fire in DEV is by design (T-05-23 ACCEPT disposition in plan threat model). Adding the guard would couple the component to React internals + complicate testing for zero production benefit. The threat model accepts the dev-mode double-fire."
  - "Single combined Edit for the (terminal)/layout.tsx mount point — both the import and the JSX placement landed in one git commit (Task 2 GREEN). Plan's Task 2 is type='auto' (not tdd), so no separate RED commit was required. Build + typecheck + full vitest verification ran after the combined Edit; all green on first run."
  - "Em-dash (—) NOT double-hyphen (--) before \${PROFILE.email}. Required by UI-SPEC §'Console signature copy' voice; verified by visual inspection of the source file. The ASCII em-dash byte sequence (E2 80 94) is preserved through React's JSX template literal."

patterns-established:
  - "Pattern: side-effect-only client island with null render — ConsoleSignature is the first island in the project that exists purely for side effects (no DOM, no state, no props). Establishes the canonical shape: 'use client' + useEffect(() => { ... }, []) + return null. Future analytics/instrumentation islands (Phase 7 DEPLOY-06 resume_download tracking?) can copy this shape directly."

requirements-completed: [DEV-01]

# Metrics
duration: 2m 8s
completed: 2026-05-10
---

# Phase 5 Plan 06: Wave 3 — ConsoleSignature client island + mount in (terminal)/layout Summary

**1 new client island (`app/components/shell/console-signature.tsx`, 39 lines) + 1 modified test scaffold (sentinel → 6 real assertions) + 1 modified layout (3-line mount in (terminal)/layout.tsx) — ships DEV-01 (engineer-discoverable easter egg fires once on first paint via DevTools console). 7th client island in the project; mounted as sibling between `<CommandPalette />` and `<PrintFooter />` — NEVER in `app/layout.tsx` (Pitfall 8: would collapse the entire RSC tree to client). Vitest now 134/134 (was 129; +5 net since the scaffold sentinel was replaced with 6 real assertions).**

## Performance

- **Duration:** ~2m 8s
- **Started:** 2026-05-10T16:45:46Z
- **Completed:** 2026-05-10T16:47:54Z
- **Tasks:** 2 (Task 1 TDD with explicit RED commit; Task 2 autonomous)
- **Files created:** 1 (app/components/shell/console-signature.tsx)
- **Files modified:** 2 (app/components/shell/console-signature.test.tsx, app/(terminal)/layout.tsx)

## Accomplishments

- **app/components/shell/console-signature.tsx** — 7th client island. `"use client";` + `useEffect(() => { console.log(...); }, [])` fires once on first paint after hydration. Module-level `ASCII_ART` (BT initials, 6 rows × ~17 cols of `█╗╔╝═║` box-drawing chars), `ART_STYLE` (`color: #16a34a; font-family: monospace;` — matrix-accent sRGB hex; CSS variables don't work in DevTools console), `TEXT_STYLE` (`color: inherit; font-family: monospace;` — falls back to user's default console color across light/dark DevTools themes). Single `console.log` call with template-literal message + 2 style strings. Returns `null` — no DOM contribution; pure side-effect island. Reads `PROFILE.email` from `lib/portfolio-data.ts` so any Phase 6 email update auto-propagates without touching this file.
- **app/components/shell/console-signature.test.tsx** — replaced 8-line Wave 0 sentinel with 49-line real test suite. 1 `describe` block + 6 assertions. `vi.spyOn(console, "log").mockImplementation(() => {})` in `beforeEach` (silent capture so test output stays clean); `mockRestore()` in `afterEach`. Assertions: (1) `toHaveBeenCalledTimes(1)` — single fire on mount; (2) first arg matches `/[╔╗╝╚═║╠╬]/` — at least one box-drawing char (proves ASCII art reached the log); (3) first arg contains `"Like the site? Source at github.com/beckinfonet"` (verbatim string match); (4) first arg contains `"Available for hire"` AND `PROFILE.email` (two separate `toContain` to keep error messages targeted); (5) `mock.calls[0].length >= 2` — at least one %c style arg follows the message; (6) `container.firstChild === null` — no DOM rendered.
- **app/(terminal)/layout.tsx** — `<ConsoleSignature />` mounted as sibling between `<CommandPalette />` and `<PrintFooter />`. New import alphabetically clustered between `CommandPalette` and `ExplorerDrawer`. Inline JSX comment locks Pitfall 8: "MUST be in (terminal)/layout — NOT in app/layout (Pitfall 8 — would collapse RSC tree)." Mount sequence is now: skip-link → TopBar → terminal-body → ExplorerDrawer → CommandPalette → ConsoleSignature → PrintFooter.
- **DEV-01 requirement shipped** — engineers opening DevTools console on any route see the BT-initials ASCII art (matrix accent) followed by 2 plain-color invitation lines. Single fire per hydration; persists across SPA navigation because the (terminal)/layout never unmounts.
- All gates green: vitest 26/134 (was 26/129 — added 6 new assertions; -1 sentinel removed = +5 net); `npm run build` exits 0 with 24 static pages still rendering; `npm run lint` clean; `npx tsc --noEmit` clean. No deviations from plan.

## Task Commits

Each task committed atomically; Task 1 followed the TDD RED → GREEN sequence (`tdd="true"` on the plan); Task 2 was `type="auto"` (no separate RED commit, but build + vitest + lint verification ran after the combined Edit).

1. **Task 1 RED: failing ConsoleSignature DEV-01 assertions** — `b8da728` (test)
2. **Task 1 GREEN: ConsoleSignature client island** — `f63c0dc` (feat)
3. **Task 2: mount ConsoleSignature in (terminal)/layout** — `b090001` (feat)

## Files Created/Modified

**Created:**

- `app/components/shell/console-signature.tsx` — 39 lines. `"use client";` + `import { useEffect } from "react";` + `import { PROFILE } from "@/lib/portfolio-data";`. UPPERCASE module-level constants: `ASCII_ART` (template literal with 6 rows of box-drawing chars; preceded + followed by newlines so the log entry has clean leading/trailing whitespace), `ART_STYLE` (`color: #16a34a; font-family: monospace;`), `TEXT_STYLE` (`color: inherit; font-family: monospace;`). Component: `useEffect(() => { console.log(\`%c\${ASCII_ART}%c\\nLike the site? Source at github.com/beckinfonet\\nAvailable for hire — \${PROFILE.email}\`, ART_STYLE, TEXT_STYLE); }, []);` followed by `return null;`.

**Modified:**

- `app/components/shell/console-signature.test.tsx` — replaced 8-line Wave 0 sentinel with 49-line real test suite. Net: +49/-8 (replaced 1 placeholder assertion with 6 real assertions; net +5 tests).
- `app/(terminal)/layout.tsx` — added 1 import (`ConsoleSignature`, alphabetically clustered with `CommandPalette` + `ExplorerDrawer`) + 3 JSX lines (comment + `<ConsoleSignature />` + blank). Net: +5.

## Decisions Made

- **ASCII art = "BT" initials, not full "BAKYTBEK".** Per CONTEXT D-24 + RESEARCH Open Question 1 + UI-SPEC §"Console signature copy": "planner authors v1; first-run review can swap to full name." Initials are 6 rows × ~17 cols and read cleanly in narrow terminals + mobile Chrome DevTools. Full art is 6 rows × ~65 cols and wraps in many environments — unreadable in mobile DevTools especially. Initials match `PROFILE.initials` for consistency. v1 ships initials; first-run user feedback drives any swap.
- **No module-level idempotency guard (`let didLog = false`).** Plan IMPORTANT_CONSTRAINTS suggested a guard to defend against React 19 StrictMode double-mount in DEV. Skipped because: (a) the threat model (T-05-23) explicitly ACCEPTS the StrictMode double-fire — it's by design in DEV to catch impurity; (b) jsdom in vitest does not wrap in StrictMode, so `toHaveBeenCalledTimes(1)` passes without a guard; (c) production hydration runs effects once per mount; (d) adding the guard would couple the component to React internals and complicate testing for zero production benefit. The dev-mode double-fire is intentional (per React 19 docs); the test asserts the production-relevant invariant.
- **Single combined Edit for Task 2's import + JSX mount.** Task 2 is `type="auto"` (not `tdd="true"`), so no separate RED commit was required. Both the import (alphabetically between `CommandPalette` and `ExplorerDrawer`) and the JSX (between `<CommandPalette />` and `<PrintFooter />`) landed in one logical Edit; `npm run build` + `npx tsc --noEmit` + `npm test` all green on first run after the combined Edit. Single commit per task is the standard for non-TDD tasks.
- **Em-dash `—` (UTF-8 E2 80 94), not double-hyphen `--`, before `${PROFILE.email}`.** Required by UI-SPEC §"Console signature copy" voice. Preserved through the JSX template literal byte-for-byte; verified by visual inspection of the source file. Same em-dash convention as Plan 05-05's HeadComment 6th line ("thanks for looking. — bakytbek").
- **ART_STYLE color is `#16a34a` (sRGB hex), not `oklch(0.78 0.18 145)` or `var(--accent)`.** The DevTools console parses CSS color values from `%c` style strings using the browser's CSS parser, which DOES support oklch in modern Chrome 111+ / Firefox 113+ / Safari 16.4+. But: (a) the older the user's browser, the more likely oklch fails silently and the art renders un-styled; (b) inlining sRGB hex matches the same mitigation pattern Plan 05-02 used for OG `ImageResponse` (Pitfall 1: "no CSS variables in Satori"; analogous applies to console's CSS parser surface). #16a34a is the matrix-accent sRGB equivalent (hue 145, ~oklch 0.65); reads clearly on both light and dark DevTools themes.
- **Order of (terminal)/layout children: ExplorerDrawer → CommandPalette → ConsoleSignature → PrintFooter.** Plan's Task 2 `<action>` block is explicit: ConsoleSignature inserts BETWEEN `<CommandPalette />` and `<PrintFooter />`. ConsoleSignature returns null so DOM order doesn't affect rendering, but the ordering documents intent: chrome-overlay islands first (Drawer + Palette), then side-effect island (Signature), then print-only island (PrintFooter at the end because @media print places it via margin-top: 32px).

## Deviations from Plan

None — plan executed exactly as written. The plan's `<action>` block specified:
- ASCII_ART = "BT" initials (planner pre-locked the choice in the action block; matches CONTEXT D-24 + RESEARCH Open Question disposition)
- ART_STYLE / TEXT_STYLE inline values
- 6 vitest assertions (not 5, not 7 — exact count specified)
- Mount between `<CommandPalette />` and `<PrintFooter />` with the inline Pitfall 8 comment

All shipped verbatim; no Rule 1-4 deviations triggered. No auth gates. No build/test failures requiring auto-fix.

## Issues Encountered

- **None blocking.** All gates green on the first iteration. Build, vitest (RED → GREEN as expected for Task 1), lint, typecheck all pass without rework.

## Threat Flags

None — this plan operates entirely within the threat surface analyzed in 05-06-PLAN.md `<threat_model>`:

- **T-05-21 (Denial of Service — RSC tree collapse via root-layout client mount):** MITIGATED. Acceptance criteria check `! grep -q '<ConsoleSignature />' app/layout.tsx` returns clean (verified during Task 2). Mount is in (terminal)/layout.tsx exclusively. The pattern is documented inline in the (terminal)/layout JSX for future maintainers.
- **T-05-22 (Information Disclosure — Console output content):** ACCEPT (per plan / D-24). All content (email, GitHub URL) is already public via /contact + /about (Plan 05-04 AboutSocials). The signature is intentionally engineer-discoverable per DEV-01.
- **T-05-23 (Repudiation — useEffect double-fire under React 19 StrictMode):** ACCEPT (per plan). Vitest assertion `toHaveBeenCalledTimes(1)` runs in jsdom without StrictMode wrapping (matches existing LiveClock test pattern); production hydration runs effects once. DEV-mode double-fire is intentional per React 19 docs.

No new public route surface, no new auth paths, no new schema changes at trust boundaries. The new island reads from existing `lib/portfolio-data.ts` PROFILE constant; no runtime user input flows through it.

## Authentication Gates

None. No external service auth, no API keys, no environment variables introduced. The component is fully self-contained — reads PROFILE.email from in-tree static data and fires console.log on hydration.

## User Setup Required

None — the console signature is fully self-contained. Engineers opening DevTools console on any portfolio route will see the BT-initials ASCII art followed by the github + email invitation lines, styled in matrix-accent green for the art and inherit-color for the plain text. Plan 05-08 will run a manual cross-browser gate to verify the signature renders consistently in Chrome + Firefox + Safari DevTools.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `app/components/shell/console-signature.tsx` (created — 39 lines, 'use client' island with ASCII art + console.log on mount + return null)
- FOUND: `app/components/shell/console-signature.test.tsx` (modified — 49 lines, 6 real assertions via vi.spyOn(console, 'log'))
- FOUND: `app/(terminal)/layout.tsx` (modified — +5 lines for import + JSX mount with Pitfall 8 inline comment)

Verified commits exist:

- FOUND: `b8da728` test(05-06): add failing ConsoleSignature DEV-01 assertions
- FOUND: `f63c0dc` feat(05-06): add ConsoleSignature client island (DEV-01)
- FOUND: `b090001` feat(05-06): mount ConsoleSignature in (terminal)/layout (DEV-01)

Verified gates:

- `npm test` — 26 files / 134 tests passing (was 26/129; +5 net since scaffold sentinel was replaced with 6 real assertions)
- `npm run build` — exits 0; 24 static pages render; postbuild `scripts/check-placeholders.mjs` reports clean
- `npm run lint` — exits 0
- `npx tsc --noEmit` — exits 0
- `grep -q '<ConsoleSignature />' 'app/(terminal)/layout.tsx'` — returns 0 (mounted in correct layout)
- `! grep -q '<ConsoleSignature />' app/layout.tsx` — returns 0 (NOT mounted in root — Pitfall 8 enforced)
- `grep -q '"use client"' app/components/shell/console-signature.tsx` — returns 0 (client island banner present)
- `grep -q 'return null' app/components/shell/console-signature.tsx` — returns 0 (Pattern 8 — no DOM contribution)
- `grep -q 'PROFILE\.email' app/components/shell/console-signature.tsx` — returns 0 (single-source-of-truth read)
- `! grep -E '\bTODO\b' app/components/shell/console-signature.tsx app/components/shell/console-signature.test.tsx` — no uppercase TODO in any new/modified file

## TDD Gate Compliance

Plan 05-06 Task 1 declared `tdd="true"` and followed the RED → GREEN sequence:

- **Task 1 RED gate:** commit `b8da728` (`test(05-06): add failing ConsoleSignature DEV-01 assertions`) replaced the Wave 0 sentinel with 6 real assertions. Vitest collection failed with `Failed to resolve import "./console-signature"` — RED state captured in commit history.
- **Task 1 GREEN gate:** commit `f63c0dc` (`feat(05-06): add ConsoleSignature client island`) added the island; all 6 assertions passed.
- **REFACTOR gate:** N/A — minimal island (39 lines); no cleanup needed.

Task 2 was `type="auto"` (no `tdd="true"` flag); no RED commit was required. Single GREEN commit (`b090001`) ships the import + JSX mount + Pitfall 8 comment together. Standard for non-TDD tasks.

Gate sequence is intact for the TDD task; no warning needed.

## Next Phase Readiness

Wave 3 is now complete. Plan 05-07 (Wave 4 — `@axe-core/playwright` 8-hue × 2-theme contrast audit, 56 cells = 4 hues × 2 themes × 7 routes) is the next sequential task. Its dependencies are unaffected by this plan:

- ConsoleSignature mounts into the persistent (terminal)/layout but renders no DOM and contributes no visible color — it cannot affect axe-core's `color-contrast` rule. The audit operates on rendered DOM; ConsoleSignature's output is in DevTools console only.
- All visual changes (OG images Plan 05-02, viewport themeColor + reduced-motion Plan 05-03, AboutSocials Plan 05-04, JSON-LD + HeadComment Plan 05-05) are now shipped — the contrast audit can proceed against the final visual state.

Plan 05-08 (Wave 5 — manual gates) will cross-browser verify the console signature renders consistently in Chrome + Firefox + Safari DevTools as part of its manual checklist (paired with the view-source: HeadComment check from Plan 05-05). That gate is queued; this plan ships the source-level guarantees.

---
*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
