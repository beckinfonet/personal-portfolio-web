---
phase: 04-mobile-responsive
plan: 03
subsystem: ui
tags: [primitive, rsc, status-block, about-view, sidebar-refactor, dry, phase-4]

# Dependency graph
requires:
  - phase: 02-shell
    provides: Sidebar STATUS markup at lines 86-101, tz IIFE computation at lines 31-43, .sb-section-header / .sb-status / .sb-status-row / .sb-status-dot / .sb-status-key CSS classes, ROUTES single-source-of-truth, AboutView RSC view body, about-view CTA row with `↓ resume.pdf` affordance
  - phase: 04-mobile-responsive
    plan: 01
    provides: ".about-status-mobile CSS class with default display:none and @media (max-width: 960px) display:block override, paired sidebar display:none rule, check-sidebar-redistribution.mjs Pitfall 7 audit"
provides:
  - "<StatusBlock /> shared RSC primitive — 3-row STATUS block (availability dot, uptime, tz) consumed by both desktop Sidebar and mobile AboutView"
  - "<StatusTz /> tiny client leaf computing tz via Intl.DateTimeFormat with GMT+5 fallback — isolates the only client-required logic so StatusBlock stays RSC"
  - "AboutView mobile STATUS rehome — <div class='about-status-mobile'><StatusBlock uptime={uptime} /></div> appended after the CTA row inside .content-block; visibility CSS-controlled by Plan 04-01"
  - "AboutView accepts { profile, uptime } props (uptime: string added)"
  - "App about page computes uptime via formatUptime(CAREER_START_DATE, new Date()) and threads it through AboutView"
  - "Sidebar refactored from inline STATUS markup to <StatusBlock uptime={uptime} /> (DRY win — D-14)"
  - "About-view unit test file (5 cases) covering H1 + MOBILE-03 resume CTA + MOBILE-04 about-status-mobile DOM presence + StatusBlock 'Available for hire' text + uptime verbatim"
  - "StatusBlock unit test file (6 cases) covering STATUS header + availability row + uptime prop + uptime/tz key labels + tz row non-empty smoke"
affects: [04-04 print-footer-rsc, 04-05 mobile-tests-and-verification, future Phase 5 a11y axe-core audit, future Phase 6 content fill, future Phase 7 deploy + recruiter test on 375px]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC-primitive with isolated client leaf: parent stays Server Component while a tiny <StatusTz /> client child handles the only browser-required computation (Intl.DateTimeFormat). Lets the primitive be consumed by both client (Sidebar) and server (AboutView) callers without RSC boundary violations."
    - "Shared-primitive extraction (D-14 DRY): inline STATUS markup at sidebar.tsx lines 86-101 + tz IIFE at lines 31-43 collapse into a single one-line <StatusBlock /> consumer call; about-view.tsx renders the same primitive inside an .about-status-mobile wrapper for mobile rehome — single source of truth for the STATUS visual, prevents drift between desktop and mobile"
    - "TDD strict RED→GREEN on both new test files (status-block.test.tsx, about-view.test.tsx) — confirmed RED before implementing; GREEN landed in a single iteration each"

key-files:
  created:
    - app/components/shell/status-block.tsx
    - app/components/shell/status-tz.tsx
    - app/components/shell/status-block.test.tsx
    - app/components/views/about-view.test.tsx
  modified:
    - app/components/shell/sidebar.tsx
    - app/components/shell/sidebar.test.tsx
    - app/components/views/about-view.tsx
    - app/(terminal)/page.tsx

key-decisions:
  - "StatusBlock stays RSC; tz computation isolates into a 3-line <StatusTz /> client leaf that StatusBlock embeds — preserves the RSC-first discipline (SHELL-02) while enabling RSC-side consumption from about-view"
  - "Sidebar continues to render the same STATUS DOM (no behavioral change at >=961px); the refactor is purely structural — extract markup + delete tz IIFE — so Phase 2 sidebar tests pass unchanged. One additive test ('STATUS header renders via <StatusBlock />') locks the integration."
  - "AboutView gains a single new prop `uptime: string` (no other changes to its props or render order); the new mobile STATUS wrapper is the last child of .content-block, after the existing CTA row — preserves Phase 3 layout sequence and reading order"
  - "About route page (app/(terminal)/page.tsx) computes uptime via formatUptime(CAREER_START_DATE, new Date()) at request time — same call shape used by the persistent shell layout for desktop sidebar, no new build-time / cache contract introduced"
  - "Tests use PROFILE from lib/portfolio-data.ts directly rather than a synthetic fixture — same data the production code path consumes, no separate test-only seed needed"

patterns-established:
  - "rsc-primitive-with-client-leaf: when an RSC primitive needs one piece of browser-only data (Intl, Date.now, navigator.x), isolate that single computation in a tiny client leaf component the parent embeds — keeps the parent RSC-consumable from server views while the leaf handles the client work"
  - "extract-mobile-shared-primitive: when a piece of UI rehomes to a different surface on mobile (D-12/D-14), extract it as a shared component first, refactor both consumers to use it, then add the new mount with a CSS-controlled visibility wrapper — no duplication, no drift between desktop and mobile renders"

requirements-completed: [MOBILE-03, MOBILE-04]

# Metrics
duration: 3m 29s
completed: 2026-05-07
---

# Phase 4 Plan 03: StatusBlock RSC Primitive + AboutView Mobile STATUS Rehome Summary

**Shared `<StatusBlock />` RSC primitive extracted (with `<StatusTz />` client leaf for Intl tz lookup) and consumed by both desktop Sidebar (replacing 16 lines of inline STATUS markup + 13 lines of tz IIFE) and mobile AboutView (new `<div class="about-status-mobile">` wrapper, CSS-controlled by Plan 04-01) — one source of truth for the 3-row STATUS visual across the desktop sidebar home and the about-view mobile rehome (D-14 DRY win). MOBILE-03 (resume CTA above-the-fold) and MOBILE-04 (STATUS rehome) unit gates close.**

## Performance

- **Duration:** 3m 29s
- **Started:** 2026-05-07T17:03:18Z
- **Completed:** 2026-05-07T17:06:47Z
- **Tasks:** 3 (Tasks 1 + 3 are TDD; 5 commits including 2 explicit RED commits)
- **Files created:** 4 (status-block.tsx, status-tz.tsx, status-block.test.tsx, about-view.test.tsx)
- **Files modified:** 4 (sidebar.tsx, sidebar.test.tsx, about-view.tsx, app/(terminal)/page.tsx)
- **Lines: net delta**
  - status-block.tsx: +29 (new RSC primitive)
  - status-tz.tsx: +21 (new client leaf)
  - status-block.test.tsx: +39 (6 cases)
  - about-view.test.tsx: +36 (5 cases)
  - sidebar.tsx: -28 net (105 → 77 lines; STATUS markup + tz IIFE removed; one-line StatusBlock consumer added)
  - sidebar.test.tsx: +5 (1 added STATUS header assertion)
  - about-view.tsx: +11 net (uptime prop + StatusBlock import + mobile wrapper)
  - app/(terminal)/page.tsx: +3 net (formatUptime + CAREER_START_DATE imports + uptime computation + prop pass)
- **New test cases shipped:** 12 (6 status-block + 5 about-view + 1 sidebar STATUS header lock)
- **Total vitest suite:** 21 files / 93 tests (up from 19 / 81)

## Accomplishments

- **Shared STATUS primitive shipped (D-14 DRY win)** — `<StatusBlock />` is RSC and accepts only `{ uptime: string }`. The `tz` value (the only browser-required computation) lives in a 3-line `<StatusTz />` client leaf that StatusBlock embeds in its third row. Result: Sidebar (a client component) and AboutView (an RSC) consume the exact same primitive without RSC boundary violations.
- **Sidebar lean** — `app/components/shell/sidebar.tsx` shrinks from 105 to 77 lines (-28 net). The 16-line inline STATUS block markup at lines 86-101 collapses to a single `<StatusBlock uptime={uptime} />` render; the 13-line tz IIFE at lines 31-43 disappears entirely (logic now lives in StatusTz). Phase 2 desktop behavior preserved exactly — same DOM, same CSS classes, same uptime prop contract.
- **Mobile STATUS rehome shipped (MOBILE-04)** — `app/components/views/about-view.tsx` accepts a new `uptime: string` prop and renders `<div class="about-status-mobile"><StatusBlock uptime={uptime} /></div>` as the LAST child of `.content-block`, after the existing CTA row. Plan 04-01 globals.css CSS controls visibility (display:none default; display:block at `@media (max-width: 960px)`) so the block is invisible on desktop and surfaces only on `/` at <=960px — exactly the recruiter-trust signal placement specified in 04-CONTEXT.md D-12/D-13.
- **MOBILE-03 unit gate closed** — about-view.test.tsx Task 3 case 2 asserts `screen.getByRole("link", { name: /download resume/i })` is in the rendered DOM with a `download` attribute. The about-view CTA row already contained the `↓ resume.pdf` ghost-button affordance from Phase 3 (MOBILE-03 above-the-fold belt); Plan 04-03 just locks it into the unit test surface so a regression would fail CI.
- **About route page wires uptime** — `app/(terminal)/page.tsx` now imports `formatUptime` + `CAREER_START_DATE` and computes `const uptime = formatUptime(CAREER_START_DATE, new Date());` at request time, threading it into `<AboutView profile={profile} uptime={uptime} />`. Same call shape used by the persistent shell layout for the desktop sidebar — no new build-time / cache contract introduced.
- **TDD strict RED→GREEN on both new test files** — status-block.test.tsx confirmed RED with "Failed to resolve import './status-block'" before any implementation; about-view.test.tsx confirmed RED with 3 of 5 cases failing (about-status-mobile selector missing, "Available for hire" missing, "8y 125d" missing). Both moved to GREEN in a single iteration each.
- **Whole vitest suite green from 81 → 93 tests; build clean; lint clean; typecheck clean; check:mobile audits all pass** — no regressions in any Phase 1/2/3 or 04-01/04-02 test surface.

## Task Commits

Each task was committed atomically (single-repo, no sub_repos configured). Plan was TDD on Tasks 1 + 3 (each has both a RED and a GREEN commit); Task 2 was a structural refactor with one combined commit:

1. **Task 1 RED: Add failing test for StatusBlock RSC primitive** — `e57b4fa` (test)
2. **Task 1 GREEN: Implement StatusBlock RSC primitive + StatusTz client leaf** — `d7b172c` (feat)
3. **Task 2: Refactor Sidebar to consume StatusBlock primitive (+ test assertion)** — `1443b95` (refactor)
4. **Task 3 RED: Add failing tests for AboutView mobile STATUS rehome** — `f24d043` (test)
5. **Task 3 GREEN: Rehome STATUS block to AboutView mobile + wire uptime through about page** — `d757a77` (feat)

**Plan metadata commit:** pending (final docs commit will include this SUMMARY + STATE + ROADMAP updates).

## TDD Gate Compliance

The plan declared `tdd="true"` on Tasks 1 and 3. Gate sequence verified in git log:

- **Task 1 (StatusBlock + StatusTz):** Strict RED→GREEN sequence — `e57b4fa` test commit confirmed failing (module not found) before `d7b172c` implementation commit landed all 6 tests green.
- **Task 2 (Sidebar refactor):** Tagged `type="auto"` (not tdd). Refactor + 1 additive test assertion shipped in a single commit; existing 7 sidebar tests confirm no regression.
- **Task 3 (AboutView mobile STATUS):** Strict RED→GREEN sequence — `f24d043` test commit confirmed failing (3 of 5 cases red — H1 + resume CTA already passed against existing AboutView per MOBILE-03 above-the-fold belt) before `d757a77` implementation commit landed all 5 tests green.

## Files Created/Modified

- `app/components/shell/status-block.tsx` — NEW. RSC primitive (no "use client"). Accepts `{ uptime: string }`. Renders 3-row STATUS block: availability dot + "Available for hire", uptime row, tz row (delegated to `<StatusTz />`). Reuses Phase 2 CSS classes verbatim (.sb-section-header, .sb-status-header, .sb-status, .sb-status-row, .sb-status-dot, .sb-status-key). Header comment documents the dual-consumer contract (Sidebar client + AboutView RSC) and the RSC-first rationale.
- `app/components/shell/status-tz.tsx` — NEW. Tiny client leaf ("use client" directive on line 1). 21 lines total. Computes `tz` via the same Intl.DateTimeFormat IIFE that lived in sidebar.tsx lines 31-43, with try/catch fallback to "GMT+5 (flex)". Renders `<span>{tz}</span>` for embedding in StatusBlock's third row.
- `app/components/shell/status-block.test.tsx` — NEW. 6 unit cases: STATUS section header renders, "Available for hire" availability row renders, uptime prop renders verbatim ("8y 125d"), uptime: key label renders, tz: key label renders, tz row has non-empty content (smoke assertion via `.sb-status-row` querySelectorAll → tzRow.textContent length > "tz:".length).
- `app/components/views/about-view.test.tsx` — NEW. 5 unit cases: H1 with profile name renders, resume download CTA renders with `download` attribute (MOBILE-03 unit gate), `.about-status-mobile` wrapper present in DOM (MOBILE-04 unit gate — CSS visibility is jsdom-blind so we assert DOM presence only), "Available for hire" text appears via embedded StatusBlock, uptime prop ("8y 125d") renders verbatim. Uses `PROFILE` from `lib/portfolio-data.ts` directly (the same data the production code path consumes).
- `app/components/shell/sidebar.tsx` — MODIFIED. Added `import { StatusBlock } from "@/app/components/shell/status-block";` after existing imports. Removed local `tz` IIFE (former lines 31-43). Replaced inline 16-line STATUS markup (former lines 86-101) with single `<StatusBlock uptime={uptime} />` line. Net: -28 lines (105 → 77). Behavior preserved at desktop (same DOM, same CSS, same uptime prop contract). Sections A-D unchanged.
- `app/components/shell/sidebar.test.tsx` — MODIFIED. Added 1 test at the end of the existing `describe("Sidebar", ...)` block locking the StatusBlock integration: `expect(screen.getByText("STATUS")).toBeInTheDocument();`. Existing 7 tests untouched and still passing (8 total).
- `app/components/views/about-view.tsx` — MODIFIED. Added `import { StatusBlock } from "@/app/components/shell/status-block";`. Extended `AboutViewProps` with `uptime: string`. Updated function signature to `({ profile, uptime })`. Appended `<div className="about-status-mobile"><StatusBlock uptime={uptime} /></div>` as the last child of `.content-block`, after the existing CTA row. Comment documents the CSS visibility contract from Plan 04-01 (display:none default; display:block at <=960px) and the D-12/D-13 decision references. Existing children (H1, role, meta, paragraphs, cards, CTA row) unchanged.
- `app/(terminal)/page.tsx` — MODIFIED. Added `import { CAREER_START_DATE } from "@/lib/portfolio-data";` and `import { formatUptime } from "@/lib/uptime";`. Updated `AboutPage` to compute `const uptime = formatUptime(CAREER_START_DATE, new Date());` after the existing `getProfile()` await, and threaded it through `<AboutView profile={profile} uptime={uptime} />`. PromptLine + metadata exports + ROUTES[0] derivation unchanged.

## Decisions Made

All decisions captured in the `key-decisions:` frontmatter list. Most relevant downstream:

1. **`<StatusBlock />` stays RSC; `<StatusTz />` is the tiny client leaf** — preserves RSC-first discipline (SHELL-02) while letting Sidebar (client) and AboutView (RSC) both consume the primitive cleanly. The boundary is enforced by Next.js — if StatusBlock accidentally became a client component, `npm run build` would fail when AboutView (RSC) imports it. Build gate covers it (T-04-09 mitigated per the plan's threat register).
2. **Sidebar refactor is structural-only** — DOM/CSS/uptime contract preserved exactly at desktop. The 7 Phase 2 sidebar tests pass unchanged because rendered DOM text ("STATUS", "Available for hire", uptime value) is identical. One additive assertion locks the StatusBlock integration.
3. **AboutView gains exactly one new prop** — `uptime: string`. No other changes to props, render order, or existing children. The mobile STATUS wrapper is the LAST child of `.content-block` after the existing CTA row, preserving Phase 3 reading order.
4. **About page uses request-time `new Date()`** — same call shape the persistent shell layout uses. No build-time caching contract introduced; daily uptime drift is acceptable per Phase 2 D-15.

## Deviations from Plan

None - plan executed exactly as written.

The PreToolUse:Edit reminder hook fired six times (once per first Edit/Write to each file the harness perceived as "not yet read"); each time, the file had already been read in this session and the underlying edit had already succeeded — verified by post-hook grep + npm runs. No content was lost.

## Issues Encountered

None during planned work. Both TDD RED gates confirmed failing for the right reasons (Task 1: module not found; Task 3: 3 of 5 cases red because uptime prop and StatusBlock not yet wired). Both GREEN gates landed on first run — no iteration needed. Lint, typecheck, build, postbuild placeholder check, all 3 mobile audit scripts (sidebar redistribution, print rules, mobile palette CSS), and the full Vitest suite (21 files, 93 tests) all green at end of execution.

## User Setup Required

None — no external service configuration required. All work is local TypeScript + tests; no env vars added; no third-party services touched; no new prod deps.

## Visual Note

This plan ships the wiring; the **mobile STATUS block is visually inert at >=961px** because Plan 04-01 already wrote the CSS that:
- Sets `.about-status-mobile { display: none }` at desktop widths,
- Flips it to `display: block` at `@media (max-width: 960px)`.

So the production behavior is: at desktop, AboutView renders the StatusBlock inside the `.about-status-mobile` wrapper but it's invisible (display:none). At <=960px, it surfaces as the last block of the about-view body, providing the recruiter-trust "● Available for hire" signal exactly where mobile recruiters land (`/`).

Manual cross-viewport screenshot review is owned by Plan 04-05 (Wave 4 manual verification). Plan 04-03 verifies the wiring + behavior + DOM presence in jsdom only.

## Next Phase Readiness

Wave 2 progress: this plan was 04-03 of three Wave 2 plans. Plan 04-04 (print-footer-rsc) remains independent of this plan's surface and unblocked. With 04-03 complete, Wave 2 is 2 of 3 done; only 04-04 remains before Wave 3 (mobile tests + verification) gate.

Wave 3 (04-05 mobile tests + verification) gains a new dependency: the about-view.test.tsx file shipped here is part of the test surface that 04-05 will extend with the manual cross-viewport screenshot review and 5-second recruiter dry-run on 375px localhost.

ROADMAP Phase 4 success criterion 2 ("STATUS block rehomed to about-view footer on mobile") is structurally satisfied at the component level: the wrapper exists in the DOM at every viewport and the StatusBlock primitive renders inside it. The visual layer (display:block at <=960px, display:none at >=961px) was satisfied by Plan 04-01 CSS. Manual screenshot review at 375/768/1024 (Wave 4) will close the loop.

The DRY win (D-14) prevents future drift between desktop and mobile STATUS renders — any future change to the 3-row block (e.g., a new row added in Phase 6 content fill, or an availability state change) flows through one component and reaches both surfaces simultaneously.

## Self-Check: PASSED

**Files exist:**
- FOUND: app/components/shell/status-block.tsx (29 lines)
- FOUND: app/components/shell/status-tz.tsx (21 lines)
- FOUND: app/components/shell/status-block.test.tsx (39 lines, 6 tests)
- FOUND: app/components/views/about-view.test.tsx (36 lines, 5 tests)
- FOUND: app/components/shell/sidebar.tsx (modified, 77 lines — down from 105)
- FOUND: app/components/shell/sidebar.test.tsx (modified, +1 assertion, 8 total)
- FOUND: app/components/views/about-view.tsx (modified, uptime prop + .about-status-mobile wrapper)
- FOUND: app/(terminal)/page.tsx (modified, uptime computation + prop pass)

**Commits exist (verified via `git log --oneline`):**
- FOUND: e57b4fa — test(04-03): add failing test for StatusBlock RSC primitive
- FOUND: d7b172c — feat(04-03): implement StatusBlock RSC primitive + StatusTz client leaf
- FOUND: 1443b95 — refactor(04-03): consume StatusBlock primitive in Sidebar
- FOUND: f24d043 — test(04-03): add failing tests for AboutView mobile STATUS rehome
- FOUND: d757a77 — feat(04-03): rehome STATUS block to AboutView mobile + wire uptime through about page

**Build + tests + audits pass:**
- npm run typecheck: clean
- npm run lint: clean
- npm run build: succeeds; postbuild check-placeholders.mjs passes
- npx vitest run (full suite): 21 files / 93 tests all passing (up from 19 / 81)
- npm run check:mobile: all 3 audits passing (sidebar redistribution / Pitfall 7 / MOBILE-01, print rules / A11Y-09, mobile palette CSS / PALETTE-05)

---
*Phase: 04-mobile-responsive*
*Completed: 2026-05-07*
