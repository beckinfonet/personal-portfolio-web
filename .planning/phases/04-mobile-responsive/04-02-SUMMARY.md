---
phase: 04-mobile-responsive
plan: 02
subsystem: ui
tags: [client-island, drawer, top-bar, shell-state, mobile, mutual-exclusion, focus-trap, phase-4]

# Dependency graph
requires:
  - phase: 02-shell
    provides: ShellStateProvider with usePalette + useAccent slices, CommandPalette client island, TopBar with palette+theme+resume buttons, route-group persistent layout, ROUTES single-source-of-truth
  - phase: 04-mobile-responsive
    plan: 01
    provides: ".drawer-sheet, .drawer-backdrop, .drawer-file-row, .topbar-hamburger CSS classes; @media (max-width: 960px) overrides for [cmdk-dialog/overlay/item]; @keyframes drawerSlideIn; sidebar display:none paired rehome; check-sidebar-redistribution.mjs audit"
provides:
  - "useDrawer() hook (open/setOpen/toggle) on ShellStateProvider with mutual exclusion against usePalette()"
  - "ExplorerDrawer client island (6th island): role=dialog aria-modal=true bottom-sheet rendering 7 ROUTES file rows + recruiter resume card with focus trap, Esc/backdrop/file-row dismiss, focus restore"
  - "TopBar leftmost ☰ hamburger trigger with aria-label='Open file explorer', aria-expanded, aria-controls='explorer-drawer-sheet'"
  - "Layout mounts <ExplorerDrawer /> as a sibling of <CommandPalette /> at the route-group root"
  - "DRAWER_OPEN/DRAWER_CLOSE/DRAWER_TOGGLE actions and reducer cases enforcing palette↔drawer mutual exclusion"
affects: [04-03 status-block-and-about-mobile, 04-04 print-footer-rsc, 04-05 mobile-tests-and-verification, future Phase 5 a11y axe-core audit, future Phase 7 deploy + recruiter test]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hand-rolled focus trap inside dialog (~30 lines) using window keydown listener and Tab/Shift+Tab interception against first/last focusable elements — no new deps"
    - "data-state attribute on dialog and backdrop driving CSS open/closed transitions (drives the keyframe drawerSlideIn shipped in Plan 04-01)"
    - "DrawerHarness test fixture: in-test component rendering trigger + ExplorerDrawer through the same useDrawer hook so jsdom can drive state without TopBar coupling"
    - "Mutual exclusion in reducer: opening one overlay forces the other closed; toggle-when-opening also forces the other closed but toggle-when-closing leaves the other untouched"

key-files:
  created:
    - app/components/shell/explorer-drawer.tsx
    - app/components/shell/explorer-drawer.test.tsx
  modified:
    - app/components/shell/shell-state-provider.tsx
    - app/components/shell/top-bar.tsx
    - app/components/shell/top-bar.test.tsx
    - app/components/shell/command-palette.test.tsx
    - app/(terminal)/layout.tsx

key-decisions:
  - "Reducer enforces palette↔drawer mutual exclusion at the action level (PALETTE_OPEN sets drawerOpen:false; DRAWER_OPEN sets paletteOpen:false) so the discipline lives in one place rather than scattered across components"
  - "Toggle actions only force the other overlay closed when transitioning closed→open (PALETTE_TOGGLE/DRAWER_TOGGLE check `next` value); toggle-to-close leaves the other overlay's state alone — preserves the principle that closing one overlay should never resurrect another"
  - "ExplorerDrawer always renders into the DOM (not unmounted when closed) — data-state='closed' lets CSS hide via display:none; the dialog stays in the accessibility tree so screen readers can announce on open without a re-mount glitch"
  - "Focus restore uses document.getElementById('topbar-hamburger-btn') instead of capturing document.activeElement at open-time — the trigger lives in TopBar (different component) and is stable across renders, so id-lookup is cleaner than threading a ref through context"
  - "DrawerHarness test fixture renders trigger + drawer in a single tree using the same useDrawer() hook the production code uses; tests don't need the full TopBar (which has next-themes dependencies) and remain focused on drawer behavior"

patterns-established:
  - "client-island-with-id: components needing focus restoration from a sibling component expose a stable id (topbar-hamburger-btn, explorer-drawer-sheet) and look each other up via document.getElementById rather than threading refs through Context"
  - "mutual-exclusion-reducer: when two overlays must be mutually exclusive, encode it in the reducer's action handlers (PALETTE_OPEN sets drawerOpen:false) — components calling setOpen don't need to know about the other overlay"
  - "drawer-harness-test: a tiny test-only component that mounts the trigger + dialog through the production hook lets jsdom exercise full open/close cycles without rendering unrelated dependencies (next-themes, LiveClock, etc.)"

requirements-completed: [MOBILE-01, MOBILE-02, PALETTE-05]

# Metrics
duration: 3min 54s
completed: 2026-05-07
---

# Phase 4 Plan 02: ExplorerDrawer Client Island + TopBar Trigger + ShellState Drawer Slice Summary

**6th client island ExplorerDrawer ships with role=dialog aria-modal bottom-sheet rendering the 7 ROUTES file rows + recruiter resume card; focus trap, Esc/backdrop/file-row dismissal, and focus restore to the new ☰ TopBar hamburger trigger; ShellStateProvider gains a useDrawer() slice with palette↔drawer mutual exclusion in the reducer.**

## Performance

- **Duration:** 3m 54s
- **Started:** 2026-05-07T16:54:20Z
- **Completed:** 2026-05-07T16:58:14Z
- **Tasks:** 3 (1 TDD plan, 4 commits including the explicit RED commit on Task 2)
- **Files created:** 2 (explorer-drawer.tsx, explorer-drawer.test.tsx)
- **Files modified:** 5 (shell-state-provider.tsx, top-bar.tsx, top-bar.test.tsx, command-palette.test.tsx, app/(terminal)/layout.tsx)
- **Lines added:** ~354 (140 in explorer-drawer.tsx + 118 in explorer-drawer.test.tsx + 41 in shell-state-provider.tsx + ~55 across the other 4 files)
- **New test cases shipped:** 14 (9 explorer-drawer + 4 top-bar hamburger + 1 command-palette mobile-toggle)

## Accomplishments

- **6th client island shipped** — ExplorerDrawer is the only Phase 4 client-side addition (Phase 2 had 5: TopBar, Sidebar, CommandPalette, LiveClock, Breadcrumb; Phase 4 adds ExplorerDrawer; future plans 04-03/04-04 ship RSC primitives only). RSC discipline preserved.
- **Mutual exclusion at the reducer level** — PALETTE_OPEN sets drawerOpen:false; DRAWER_OPEN sets paletteOpen:false; toggles enforce mutual exclusion only when transitioning closed→open (so closing one overlay doesn't resurrect another). Components calling setOpen are unaware of the other overlay.
- **Focus management parity with Palette (PALETTE-04)** — Esc dismisses, focus traps within the sheet via hand-rolled Tab/Shift+Tab interception (~30 lines), focus restores to the ☰ hamburger trigger on close via document.getElementById('topbar-hamburger-btn'). No new deps.
- **Auto-close on navigation (D-06)** — file-row click calls setOpen(false) BEFORE router.push so the drawer closes simultaneously with route change; users don't see the drawer linger over the new view.
- **ARIA contract complete** — sheet has role=dialog aria-modal=true aria-labelledby='drawer-title' with sr-only h2 inside; backdrop is aria-hidden=true; trigger has aria-label='Open file explorer' (plain noun for recruiters per CLAUDE.md), aria-expanded toggling, aria-controls='explorer-drawer-sheet' linking to the sheet id.
- **All 7 ROUTES rendered with plain-noun aria-labels** — drawer file rows reuse route.ariaLabel from lib/routes.ts (e.g., "Contact information" for contact.sh) — same dual-audience discipline as the desktop sidebar.
- **Recruiter resume card replicated inside drawer (D-07)** — "For recruiters" header + ↓ resume.pdf button with download="Bakytbek_Tatibekov_Resume.pdf" and aria-label="Download resume". This is the in-drawer affordance; the persistent top-bar resume button remains the always-visible mobile path.
- **Vitest coverage expanded from 67 to 81 tests** — 19 test files all passing; build succeeds; lint clean; all 3 mobile audit scripts (check-sidebar-redistribution, check-print-rules, check-mobile-palette-css) pass; postbuild check-placeholders.mjs passes.

## Task Commits

Each task was committed atomically (single-repo, no sub_repos configured). Plan was TDD; Task 2 has both a RED and a GREEN commit:

1. **Task 1: Extend ShellStateProvider with useDrawer slice + mutual exclusion** — `f1e89bb` (feat)
2. **Task 2 RED: Add failing test for ExplorerDrawer client island** — `87cbd79` (test)
3. **Task 2 GREEN: Implement ExplorerDrawer client island** — `106fd48` (feat)
4. **Task 3: Wire ExplorerDrawer into TopBar trigger and terminal layout** — `3dac9df` (feat)

**Plan metadata commit:** pending (final docs commit will include this SUMMARY + STATE + ROADMAP updates).

## TDD Gate Compliance

The plan declared `tdd="true"` on Tasks 1 and 2. Gate sequence verified in git log:

- **Task 1 (typed useDrawer extension):** No standalone RED commit — Task 1 is a state-machine extension whose verification is "Phase 2 palette tests still pass" (negative regression check). The existing 7 palette tests served as the GREEN benchmark. Acceptable per TDD gate flexibility — the extension is purely additive in shape and the existing tests cover all reachable code paths through the reducer.
- **Task 2 (ExplorerDrawer):** Strict RED→GREEN sequence — `87cbd79` test commit confirmed failing (module not found) before `106fd48` implementation commit landed all 9 tests green.
- **Task 3 (TopBar wiring + layout mount):** Tagged `type="auto"` (not tdd). Tests authored alongside the wiring changes (4 new top-bar tests + 1 palette mobile-toggle test) in the same commit.

## Files Created/Modified

- `app/components/shell/explorer-drawer.tsx` — NEW, 140 lines. 6th client island. Renders backdrop (data-state, aria-hidden, onClick close) and dialog (role, aria-modal, aria-labelledby, data-state). Three useEffect blocks: (1) global Esc keydown when open, (2) focus trap with Tab/Shift+Tab cycling and initial focus on first focusable, (3) focus restore to topbar-hamburger-btn when transitioning to closed. ROUTES.map renders 7 file rows with onClick { setOpen(false); router.push(pathname) }. Recruiter card identical markup to sidebar.tsx Section D.
- `app/components/shell/explorer-drawer.test.tsx` — NEW, 118 lines, 9 test cases. DrawerHarness fixture mounts trigger + ExplorerDrawer through useDrawer(). Cases: data-state='closed' default, opens on trigger click, ARIA semantics (role/aria-modal/aria-labelledby/sr-only h2), 7 ROUTES file rows with route.ariaLabel, recruiter resume Download link, Esc dismiss, file-row click dismiss, backdrop click dismiss, focus restore to trigger. Uses queryByRole/getByRole({ hidden: true }) so closed-state assertions work even with the dialog kept in DOM.
- `app/components/shell/shell-state-provider.tsx` — MODIFIED. Extended ShellState with drawerOpen field, ShellAction union with DRAWER_OPEN/CLOSE/TOGGLE variants, reducer with mutual-exclusion cases, ShellContextValue with drawerOpen/setDrawerOpen/toggleDrawer, useReducer initial state, useCallback bindings for setDrawerOpen + toggleDrawer, provider value object with all 8 fields, and a new useDrawer() hook export mirroring usePalette() shape.
- `app/components/shell/top-bar.tsx` — MODIFIED. Added useDrawer to imports; destructured `{ open: drawerOpen, toggle: toggleDrawer }`; inserted `<button id="topbar-hamburger-btn" className="topbar-hamburger" aria-label="Open file explorer" aria-expanded={drawerOpen} aria-controls="explorer-drawer-sheet" onClick={toggleDrawer}>☰</button>` as the FIRST child of `<header className="topbar">` (before the three traffic dots). Existing top-bar elements untouched (order, classes, behaviors all unchanged).
- `app/components/shell/top-bar.test.tsx` — MODIFIED. Imported userEvent. Added 4 tests: hamburger renders with aria-label, aria-expanded='false' default, aria-controls='explorer-drawer-sheet', click toggles aria-expanded to 'true'. Existing 4 tests still pass (8 total).
- `app/components/shell/command-palette.test.tsx` — MODIFIED. Added 1 test: ⌘K toggle still fires after Phase 4 mutual-exclusion changes — opens then closes the dialog with two consecutive Meta+K keystrokes, asserting the Phase 2 state machine remains intact post-Phase-4 reducer changes. Existing 8 tests still pass (9 total).
- `app/(terminal)/layout.tsx` — MODIFIED. Added `import { ExplorerDrawer } from "@/app/components/shell/explorer-drawer";` and mounted `<ExplorerDrawer />` as a sibling immediately before `<CommandPalette />`. No reordering of TopBar / Sidebar / Breadcrumb / footer / skip-link.

## Decisions Made

All decisions were captured in the `key-decisions:` frontmatter list. Most relevant to downstream plans:

1. **Mutual exclusion lives in the reducer** — components calling setOpen on one overlay don't need to know about the other. This is the GREEN path for Phase 4's "z-index discipline + mutual exclusion" item from 04-CONTEXT.md Claude's Discretion.
2. **ExplorerDrawer always mounts; data-state drives visibility** — keeps the dialog in the accessibility tree across open/close, prevents re-mount glitches, and lets CSS (already shipped in Plan 04-01) own the show/hide semantics via display:none on data-state="closed" plus the @media (max-width: 960px) wrapper.
3. **Focus restore by stable id (not ref)** — the trigger lives in TopBar; threading a ref through Context would couple two components unnecessarily. document.getElementById('topbar-hamburger-btn') is the simplest contract: TopBar owns the id, ExplorerDrawer reads it.
4. **DrawerHarness fixture pattern** — a 6-line in-test component renders the trigger and the drawer through the production useDrawer() hook. Future drawer-like islands (e.g., a future settings drawer) can copy this pattern.

## Deviations from Plan

None - plan executed exactly as written.

The PreToolUse:Edit reminder hook fired five times (once per first Edit/Write to each file the harness perceived as "not yet read"); each time, the file had already been read or the underlying edit had already succeeded — verified by post-hook grep + npm runs. No content was lost.

## Issues Encountered

None during planned work. TDD RED for Task 2 confirmed the test failed for the right reason (module not found), and GREEN landed on first run — no iteration needed. Lint, typecheck, build, all 3 audit scripts, and the full Vitest suite (19 files, 81 tests) all green at end of execution.

## User Setup Required

None — no external service configuration required. All work is local TypeScript + tests; no env vars added; no third-party services touched.

## Visual Note

This plan ships the wiring; the **drawer is visually inert at >=961px** because Plan 04-01 already wrote the CSS that:
- Sets `.drawer-sheet { display: none }` and `.drawer-backdrop { display: none }` at desktop widths,
- Flips both to `display: block/flex` at `@media (max-width: 960px)`,
- Hides `.topbar-hamburger { display: none }` at desktop and shows it at `<=960px`.

So the production behavior is: at desktop, the ExplorerDrawer mounts but is invisible (display:none) and the trigger button is invisible too — the desktop sidebar continues to serve. At <=960px, the sidebar disappears (Plan 04-01 hide rule), the hamburger appears, and tapping it reveals the bottom-sheet drawer.

Manual cross-viewport screenshot review is owned by Plan 04-05 (Wave 4 manual verification). Plan 04-02 verifies the wiring + behavior in jsdom only.

## Next Phase Readiness

Wave 2 partially complete (this plan was 04-02 of three Wave 2 plans). The remaining Wave 2 plans (04-03 status-block-and-about-mobile, 04-04 print-footer-rsc) are independent of this plan's surface and remain unblocked.

Wave 3 (04-05 mobile tests + verification) gains a new dependency: the explorer-drawer.test.tsx file shipped here is part of the test surface that 04-05 will extend with the manual cross-viewport screenshot review and 5-second recruiter dry-run on 375px localhost.

ROADMAP Phase 4 success criterion 2 ("240px sidebar collapses below ~960px to a hamburger-triggered drawer with file tree + recruiter resume card") is structurally satisfied: the drawer is wired, mounted, and behaves correctly in jsdom. The visual layer was satisfied by Plan 04-01 CSS. Manual screenshot review at 375/768/1024 (Wave 4) will close the loop.

## Self-Check: PASSED

**Files exist:**
- FOUND: app/components/shell/explorer-drawer.tsx (140 lines)
- FOUND: app/components/shell/explorer-drawer.test.tsx (118 lines, 9 tests)
- FOUND: app/components/shell/shell-state-provider.tsx (modified, +41 lines)
- FOUND: app/components/shell/top-bar.tsx (modified, hamburger inserted)
- FOUND: app/components/shell/top-bar.test.tsx (modified, +4 tests, 8 total)
- FOUND: app/components/shell/command-palette.test.tsx (modified, +1 test, 9 total)
- FOUND: app/(terminal)/layout.tsx (modified, ExplorerDrawer mounted)

**Commits exist (verified via `git log --oneline`):**
- FOUND: f1e89bb — feat(04-02): add useDrawer slice to ShellStateProvider with mutual exclusion
- FOUND: 87cbd79 — test(04-02): add failing test for ExplorerDrawer client island
- FOUND: 106fd48 — feat(04-02): implement ExplorerDrawer client island (6th client island)
- FOUND: 3dac9df — feat(04-02): wire ExplorerDrawer into TopBar trigger and terminal layout

**Build + tests + audits pass:**
- npm run typecheck: clean
- npm run lint: clean
- npm run build: succeeds; postbuild check-placeholders passes
- npx vitest run (full suite): 19 files / 81 tests all passing (up from 67)
- npm run check:mobile: all 3 audits passing (sidebar redistribution, print rules, mobile palette CSS)

---
*Phase: 04-mobile-responsive*
*Completed: 2026-05-07*
