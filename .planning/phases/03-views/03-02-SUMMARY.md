---
phase: 03-views
plan: 02
subsystem: ui
tags: [primitives, client-island, copy-button, react-19, vitest, testing-library]

# Dependency graph
requires:
  - phase: 02-shell
    provides: ".sr-only utility class in app/globals.css; client-island file-shape pattern (live-clock.tsx)"
  - phase: 03-views
    provides: "03-01 primitive directory + RSC PromptLine sibling"
provides:
  - "CopyButton client island at app/components/primitives/copy-button.tsx — Phase 3's only new client surface"
  - "Stable component API used by stack-view (Plan 03-05), contact-view (Plan 03-09), shipped-view (Plan 03-08)"
  - "Vitest pattern for stubbing navigator.clipboard.writeText with Object.defineProperty (jsdom 26)"
affects: [03-04, 03-05, 03-08, 03-09]

# Tech tracking
tech-stack:
  added: []  # No new prod deps; only existing react/react-dom + testing-library
  patterns:
    - "Client-island scope: 'use client' first line, named export, useRef-tracked timer with useEffect cleanup"
    - "Polite SR announcement via role='status' + aria-live='polite' inside .sr-only span on the button"
    - "Silent-catch on permissioned browser APIs (no console.error per CONVENTIONS zero-console rule)"
    - "Test stub for getter-only navigator props via Object.defineProperty (jsdom 26 compat)"

key-files:
  created:
    - "app/components/primitives/copy-button.tsx (75 lines, 1 default export: CopyButton)"
    - "app/components/primitives/copy-button.test.tsx (75 lines, 4 passing tests)"
  modified: []

key-decisions:
  - "API locked per CONTEXT D-05: { value, idleLabel? = '⧉ copy', copiedLabel? = 'copied ✓', ariaLabel (required), className? }"
  - "1500ms revert duration locked per CONTEXT D-06; tracked via useRef so re-clicks reset cleanly"
  - "Failure mode is silent (T-03-07): no toast, no console — UI signals failure implicitly by not flipping to copied"
  - "Test mock pattern uses Object.defineProperty rather than Object.assign because jsdom 26 defines navigator.clipboard as a getter-only property"
  - "Async click tests use fireEvent + waitFor instead of userEvent.click because userEvent's internal setTimeout(0) does not interleave cleanly with an async click handler awaiting clipboard.writeText in this React 19 + Vitest 3 + jsdom 26 stack"

patterns-established:
  - "Phase 3 client-island budget: exactly one (Pitfall 9 / SHELL-02). All three view callsites compose this same component with className overrides for view-specific paint"
  - "copy-button--confirmed class is toggled on the button so Plan 03-04 can paint accent-colored confirmation text purely via CSS"
  - "Vitest tests stubbing navigator.* properties must use Object.defineProperty(..., { configurable: true, writable: true }) — jsdom 26 makes them getter-only"

requirements-completed: [VIEW-08, VIEW-03, VIEW-06, VIEW-07]

# Metrics
duration: ~3 min
completed: 2026-05-06
---

# Phase 3 Plan 02: CopyButton Primitive Summary

**Phase 3's sole new client island: a generic `<CopyButton>` writing to navigator.clipboard with inline label-swap, polite SR announcement, and 1500ms revert — three views (stack/contact/shipped) will compose this one surface.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-06T19:49:50Z
- **Completed:** 2026-05-06T19:52:04Z
- **Tasks:** 2 (both `auto`/`tdd=true`)
- **Files created:** 2

## Accomplishments

- Shipped `CopyButton` as the only client island Phase 3 introduces (per Pitfall 9 / SHELL-02 budget)
- Locked the prop API used by three downstream view plans: `value`, `idleLabel?` (`"⧉ copy"`), `copiedLabel?` (`"copied ✓"`), `ariaLabel` (required, plain-noun), `className?`
- Established polite SR announcement: `role="status" aria-live="polite"` inside `.sr-only` span — empty in idle state, `"Copied to clipboard"` in confirmed state
- Defensive `useRef`-tracked timer cleared on every re-click and on unmount via `useEffect` cleanup (mitigates T-03-06 rapid-click leak)
- 4 passing unit tests cover: idle render with caller `aria-label`; click → `writeText` with `value`; label swap to `"copied ✓"` and revert after 1500ms; aria-live region transition empty → `"Copied to clipboard"`

## Task Commits

1. **Task 1: Create CopyButton client island** — `5a8c58e` (feat)
2. **Task 2: Add CopyButton unit test (click → label swap)** — `313bb70` (test)

_TDD note: Plan structured Task 1 as the implementation and Task 2 as the unit test. Task 2 verification iterated twice on the test file (Object.defineProperty for jsdom 26, then fireEvent+waitFor for the React 19 + Vitest 3 + async-handler interaction); both iterations were squashed into the single Task 2 commit prior to commit creation._

## Files Created/Modified

- `app/components/primitives/copy-button.tsx` — Phase 3's sole client island; `"use client"` first line; exports `CopyButton`; 75 lines.
- `app/components/primitives/copy-button.test.tsx` — Vitest + React Testing Library suite (4 tests); 75 lines.

## Decisions Made

- **API uses required `ariaLabel`** rather than deriving from `value`. Forces every callsite to supply a plain-noun screen-reader label per the project's dual-audience non-negotiables (e.g. `"Copy stack JSON"` not `"Copy {entire JSON dump}"`).
- **`copy-button--confirmed` class** is toggled on the `<button>` element (rather than inner span) so Plan 03-04's CSS can paint the entire button accent-colored on confirmation with one selector.
- **Silent catch on clipboard write failure** instead of fallback toast UI. Aligns with CONVENTIONS zero-console rule (T-03-07) and the v1 scope explicitly excluding a toast component. Failure surfaces implicitly: the label simply does not flip.
- **Microtask flush via `waitFor` / `act` in tests.** The plan's literal `userEvent.click + advanceTimers` wiring did not flush the async clipboard write microtask cleanly under React 19 + Vitest 3 + jsdom 26. Switched to `fireEvent.click` + `waitFor` for assertion-after-async, and wrapped `fireEvent.click` in `act` for the fake-timer test. All assertions and behavior coverage from the plan's `<behavior>` block remain identical.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Stub `navigator.clipboard` via `Object.defineProperty` instead of `Object.assign`**

- **Found during:** Task 2 (initial test run)
- **Issue:** The plan's `<action>` literally specified `Object.assign(navigator, { clipboard: { writeText } })`. jsdom 26 defines `navigator.clipboard` as a getter-only property; the assignment throws `TypeError: Cannot set property clipboard of #<Navigator> which has only a getter`.
- **Fix:** Replaced with `Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true })`. Same intent, same per-test mock pattern, but compatible with jsdom 26.
- **Files modified:** `app/components/primitives/copy-button.test.tsx`
- **Verification:** All 4 tests now pass. Acceptance criterion `grep -q 'navigator.clipboard.writeText\|writeText'` still satisfied (the mock variable `writeText` is referenced).
- **Committed in:** `313bb70` (Task 2 commit)

**2. [Rule 3 — Blocking] Use `fireEvent` + `waitFor` for async-click tests instead of literal `userEvent.click + advanceTimers`**

- **Found during:** Task 2 (second test run; tests 2/3/4 failed/timed-out after Rule 3 fix #1 unblocked the stub)
- **Issue:** With `userEvent.setup()` from `@testing-library/user-event@14.6` on React 19 + Vitest 3 + jsdom 26, `await user.click(...)` returned before the React state update from the async handler's `await navigator.clipboard.writeText(...)` had flushed, so `expect(writeText).toHaveBeenCalledWith(...)` saw 0 calls. The fake-timer test using `advanceTimers: vi.advanceTimersByTime` hung past the 5000ms test timeout (userEvent's internal `setTimeout(0)` did not interleave with the user-fake-timers advance).
- **Fix:** Switched async assertions to `fireEvent.click(...)` + `await waitFor(() => expect(...))`. For the fake-timer test, wrapped `fireEvent.click` and `vi.advanceTimersByTime(1500)` in `act(async () => { ... })`. All four behavioral assertions from the plan's `<behavior>` block remain unchanged. Removed the now-unused `userEvent` import.
- **Files modified:** `app/components/primitives/copy-button.test.tsx`
- **Verification:** `npm test -- copy-button.test.tsx` exits 0, all 4 tests pass in ~62ms. Full project test suite still green: 42/42 across 10 files.
- **Committed in:** `313bb70` (Task 2 commit, alongside fix #1)

---

**Total deviations:** 2 auto-fixed (both Rule 3 / blocking)
**Impact on plan:** Both fixes preserve every behavioral assertion the plan demanded — only the stubbing/eventing mechanics changed to match the actual installed versions of jsdom and userEvent. Component file (`copy-button.tsx`) was implemented byte-for-byte as the plan's `<action>` block specified. No scope creep, no new dependencies introduced (constraint: only `next-themes` + `cmdk` allowed).

## Issues Encountered

- jsdom 26 `navigator.clipboard` getter-only behavior (resolved via Rule 3 deviation #1).
- userEvent v14 + async clipboard handler not awaiting state flush in React 19 / Vitest 3 (resolved via Rule 3 deviation #2).

## Verification Commands

```bash
# Component constraints
test -f app/components/primitives/copy-button.tsx
head -1 app/components/primitives/copy-button.tsx                     # → "use client";
grep -c 'navigator\.clipboard\.writeText' app/components/primitives/copy-button.tsx  # 1
grep -c 'aria-live="polite"' app/components/primitives/copy-button.tsx               # 1
grep -c 'role="status"' app/components/primitives/copy-button.tsx                    # 1
grep -q 'type="button"' app/components/primitives/copy-button.tsx
grep -q '1500' app/components/primitives/copy-button.tsx
grep -q 'export function CopyButton' app/components/primitives/copy-button.tsx

# Tests
npm test -- copy-button.test.tsx                                       # 4 passed
npm test                                                                # 42 passed (full suite)

# Project gates
npm run typecheck                                                      # exit 0
npm run lint                                                           # exit 0
```

## Exported API Surface

```ts
// app/components/primitives/copy-button.tsx
export function CopyButton(props: {
  value: string;            // string written to clipboard on click
  idleLabel?: string;       // default: "⧉ copy"
  copiedLabel?: string;     // default: "copied ✓"
  ariaLabel: string;        // REQUIRED — plain-noun SR label
  className?: string;       // optional view-specific class composition
}): JSX.Element;
```

Three downstream callsites (Wave 4) will compose this component:

| Plan | Callsite | `value` source | `ariaLabel` |
|------|----------|----------------|-------------|
| 03-05 | `<StackView>` | `JSON.stringify(STACK, null, 2)` | `"Copy stack JSON"` |
| 03-09 | `<ContactView>` | `PROFILE.email` | `"Copy email address"` |
| 03-08 | `<ShippedView>` (per app) | `app.appStoreUrl` | `"Copy {appName} App Store URL"` |

## Next Phase Readiness

- CopyButton API frozen for Wave 2/4 view consumers; downstream plans 03-05 / 03-08 / 03-09 can import without further coordination.
- Plan 03-04 (`view-css.css`) will paint `.copy-button`, `.copy-button--confirmed`, and the three view-prefix variants with the existing `.sr-only` utility already covering the live-region positioning.
- No blockers. No new dependencies introduced (constraint upheld: only `next-themes` + `cmdk` in prod deps).

## Self-Check: PASSED

- `app/components/primitives/copy-button.tsx` — FOUND
- `app/components/primitives/copy-button.test.tsx` — FOUND
- Commit `5a8c58e` (Task 1) — FOUND
- Commit `313bb70` (Task 2) — FOUND
- All Task 1 acceptance grep checks — PASS (counts: navigator=1, aria-live=1, role=status=1; type=button, 1500, export — all present)
- Task 2 acceptance: `from "vitest"` import absent — CONFIRMED; clipboard mock present — CONFIRMED
- `npm test -- copy-button.test.tsx` — 4/4 passing
- `npm test` (full suite) — 42/42 passing
- `npm run typecheck` — exit 0
- `npm run lint` — exit 0

---
*Phase: 03-views*
*Plan: 02*
*Completed: 2026-05-06*
