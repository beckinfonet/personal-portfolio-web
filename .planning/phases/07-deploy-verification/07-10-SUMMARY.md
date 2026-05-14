---
phase: 07-deploy-verification
plan: 10
subsystem: shell
tags: [rsc, data-flow, isr, refactor, profile-hydration, prop-drilling]

# Dependency graph
requires:
  - phase: 02-shell
    provides: persistent (terminal) layout + 7 shell client islands + JsonLdPerson root mount
  - phase: 06-backend-content
    provides: live Mongo-backed /api/profile endpoint + lib/api.ts getProfile() ISR contract
provides:
  - Persistent shell now reads Profile via lib/api.ts ISR chokepoint on every render
  - Mongo profile edits flow site-wide on the next ISR window (≤5 min) for every shell surface
  - buildPaletteVerbs(profile) factory replaces the module-level static PALETTE_VERBS const
  - app/layout.tsx and app/(terminal)/layout.tsx are both async RSC fetching profile once
  - Static PROFILE in lib/portfolio-data.ts remains the silent fallback inside getJson<Profile>()
affects: [07-03-analytics, 07-04-psi, 07-07-recruiter-test, future-mongo-content-passes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC root + route-group both async fetch profile via getProfile() and prop-drill"
    - "Factory function builds palette verbs closed over runtime profile (instead of module-level const)"
    - "Test fixtures pass PROFILE explicitly as a prop (decoupled from network — static stays the deterministic fixture)"

key-files:
  created: []
  modified:
    - app/layout.tsx
    - app/(terminal)/layout.tsx
    - app/components/shell/top-bar.tsx
    - app/components/shell/sidebar.tsx
    - app/components/shell/console-signature.tsx
    - app/components/shell/explorer-drawer.tsx
    - app/components/shell/json-ld-person.tsx
    - app/components/shell/command-palette.tsx
    - lib/palette-verbs.ts
    - app/layout.test.tsx
    - app/components/shell/top-bar.test.tsx
    - app/components/shell/sidebar.test.tsx
    - app/components/shell/console-signature.test.tsx
    - app/components/shell/explorer-drawer.test.tsx
    - app/components/shell/json-ld-person.test.tsx
    - app/components/shell/command-palette.test.tsx

key-decisions:
  - "Execute child-component tasks (02-07) BEFORE the layout task (01) so each commit compiles cleanly on its own — task numbering in the plan is logical, not strict execution order."
  - "JsonLdPerson stays mounted in app/layout.tsx <head> (NOT moved to (terminal)/layout) — making the root layout async is cheaper than relocating the schema.org mount and breaks no existing tests once the helper awaits the layout function."
  - "buildPaletteVerbs returns the array on every call (no memoization inside the factory) — CommandPalette wraps the call in useMemo at the call site so React deps drive recomputation per profile identity."
  - "ConsoleSignature accepts only `email: string` (not the full Profile) — minimal prop surface, matches the plan's truth assertion."

patterns-established:
  - "Pattern: shell client island props match the field surface they consume (TopBar/Sidebar/Drawer/Palette take Profile; ConsoleSignature takes only email)."
  - "Pattern: test files keep their static PROFILE import as a deterministic fixture and pass it explicitly — production code never imports static."

requirements-completed: [DATA-04]

# Metrics
duration: ~22min
completed: 2026-05-13
---

# Phase 07 Plan 10: Shell Hydration from Mongo Summary

**Persistent shell now reads profile via lib/api.ts ISR chokepoint — Mongo edits flow to TopBar, Sidebar, Drawer, ConsoleSignature, JsonLdPerson, CommandPalette, footer, and PrintFooter within one ISR window.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-05-13T18:32:00Z
- **Completed:** 2026-05-13T18:54:00Z
- **Tasks:** 8 (7 implementation + 1 verification)
- **Files modified:** 16 (8 production + 7 test files + 1 root layout)

## Accomplishments

- Closed the static-PROFILE bypass: zero production shell components import `PROFILE` from `@/lib/portfolio-data` after this plan.
- `app/(terminal)/layout.tsx` and `app/layout.tsx` are both async RSCs that call `await getProfile()` and prop-drill to children.
- `lib/palette-verbs.ts` exports `buildPaletteVerbs(profile: Profile)` factory; static `PALETTE_VERBS` const removed.
- `lib/api.ts` unchanged — ISR + graceful-fallback chokepoint is the single source of profile reads site-wide.
- `lib/portfolio-data.ts` unchanged — static PROFILE stays as the silent fallback inside `getJson<Profile>('/api/profile', PROFILE)`.
- All 160 existing tests pass; full pipeline (`lint`, `typecheck`, `test`, `build`) is green.
- XSS defense in JsonLdPerson (`<` → `<`) preserved verbatim — load-bearing for Mongo-sourced content.

## Task Commits

Each task was committed atomically. Note: tasks were executed in reverse-dependency order (children first, layout last) so every commit compiles in isolation.

1. **Task 07-10-02: TopBar accepts profile prop** — `8f0ddec` (refactor)
2. **Task 07-10-03: Sidebar accepts profile prop alongside uptime** — `ff4eb5d` (refactor)
3. **Task 07-10-04: ConsoleSignature accepts email prop (minimal surface)** — `09e4662` (refactor)
4. **Task 07-10-05: ExplorerDrawer accepts profile prop** — `b0363ea` (refactor)
5. **Task 07-10-06: JsonLdPerson accepts profile prop; root layout async** — `8957ede` (refactor)
6. **Task 07-10-07: buildPaletteVerbs factory; CommandPalette accepts profile** — `32a8864` (refactor)
7. **Task 07-10-01: (terminal) layout async — fetches profile via getProfile()** — `033e8dc` (refactor)
8. **Task 07-10-08: verification** — no code changes; `lint`/`typecheck`/`test`/`build` all green; documented in this SUMMARY.

## Files Created/Modified

### Production code

- `app/(terminal)/layout.tsx` — async RSC; `await getProfile()`; prop-drills `profile` (and `email`) to all shell children; footer copyright now reads `profile.name`.
- `app/layout.tsx` — async RSC; `await getProfile()`; passes `profile` to `<JsonLdPerson profile={profile} />` mounted in `<head>`.
- `app/components/shell/top-bar.tsx` — `TopBar({ profile }: { profile: Profile })`; `href={profile.resumeUrl}`; static PROFILE import removed.
- `app/components/shell/sidebar.tsx` — `SidebarProps` gains `profile: Profile`; recruiter `<a>` row sources `href` from prop.
- `app/components/shell/console-signature.tsx` — `ConsoleSignature({ email }: { email: string })`; `useEffect` deps `[email]`; minimal prop surface.
- `app/components/shell/explorer-drawer.tsx` — `ExplorerDrawer({ profile }: { profile: Profile })`; bottom-sheet email row reads from prop.
- `app/components/shell/json-ld-person.tsx` — `JsonLdPerson({ profile }: { profile: Profile })`; XSS escape `(/</g, "<")` preserved verbatim; RSC discipline maintained.
- `app/components/shell/command-palette.tsx` — `CommandPalette({ profile }: { profile: Profile })`; `useMemo(() => buildPaletteVerbs(profile), [profile])`; count-reset useEffect now depends on `[open, PALETTE_VERBS]`.
- `lib/palette-verbs.ts` — `buildPaletteVerbs(profile: Profile): readonly PaletteVerb[]` factory; 18 verbs preserved verbatim; closures bound to runtime `profile` argument; static `PALETTE_VERBS` const removed.

### Test files (fixture updates to pass `PROFILE` explicitly)

- `app/layout.test.tsx` — `renderLayoutMarkup` helper now `async`; awaits `RootLayout({ children })` before `renderToStaticMarkup`.
- `app/components/shell/top-bar.test.tsx` — `<TopBar profile={PROFILE} />`.
- `app/components/shell/sidebar.test.tsx` — `<Sidebar uptime="8y 125d" profile={PROFILE} />`.
- `app/components/shell/console-signature.test.tsx` — `<ConsoleSignature email={PROFILE.email} />`.
- `app/components/shell/explorer-drawer.test.tsx` — `<ExplorerDrawer profile={PROFILE} />`.
- `app/components/shell/json-ld-person.test.tsx` — `<JsonLdPerson profile={PROFILE} />`.
- `app/components/shell/command-palette.test.tsx` — `<CommandPalette profile={PROFILE} />`; dynamic-import tests call `buildPaletteVerbs(PROFILE)` instead of importing the (removed) static array.

## Decisions Made

- **Execution order swap:** The plan numbers `07-10-01` (layout) first, but committing the layout before its child components would break typecheck on every intermediate commit (children would not yet accept `profile`). Children were converted first (commits 1–6), then the layout (commit 7). The end state matches the plan; only the commit sequence differs.
- **app/layout.tsx becomes async:** JsonLdPerson is mounted in the **root** layout (`<head>`), not in `(terminal)/layout.tsx`. Keeping it in `<head>` is required for SEO-02 (schema.org Person on every route including non-`(terminal)` routes if any are added later). The cleanest path is making the root layout async and fetching `profile` there too. Both layouts call `getProfile()` independently — both hit the same ISR cache key, so it is one network fetch per ISR window in practice.
- **No memoization inside `buildPaletteVerbs`:** The factory rebuilds the array on every call; `CommandPalette` wraps the call in `useMemo([profile])`. This is simpler and matches React's mental model — the consumer owns the memoization policy.
- **`ConsoleSignature` takes only `email: string`:** Per plan truth assertion, the minimal prop surface is preferred; `Profile` would expose 12 fields when only one is read.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated `app/layout.test.tsx` to await async RootLayout**
- **Found during:** Task 07-10-06 (root layout async conversion)
- **Issue:** The existing test invoked `renderToStaticMarkup(<RootLayout>…</RootLayout>)`. After making `RootLayout` async, this would render a Promise instead of the JSX tree and break two head-mount-point assertions.
- **Fix:** Converted the `renderLayoutMarkup` helper to async (`await RootLayout({ children })` then `renderToStaticMarkup(tree)`); updated the two tests that consume it to `async`/`await`.
- **Files modified:** `app/layout.test.tsx`
- **Verification:** `npm test` — all 10 layout tests pass.
- **Committed in:** `8957ede` (part of Task 07-10-06 commit).

**2. [Rule 3 - Blocking] Updated `command-palette.test.tsx` dynamic-import asserts to use `buildPaletteVerbs(PROFILE)`**
- **Found during:** Task 07-10-07 (palette-verbs factory conversion).
- **Issue:** Two tests in the file imported the static `PALETTE_VERBS` const dynamically. After removing the const, the imports would resolve to `undefined`.
- **Fix:** Switched to `const { buildPaletteVerbs } = await import("@/lib/palette-verbs"); const verbs = buildPaletteVerbs(PROFILE);` and asserted on the returned array.
- **Files modified:** `app/components/shell/command-palette.test.tsx`
- **Verification:** Both palette tests pass; the ≥16-verb floor and the 4-accent-id assertions still hold.
- **Committed in:** `32a8864` (part of Task 07-10-07 commit).

**3. [Rule 1 - Stale-closure hazard] Added `PALETTE_VERBS` to count-reset useEffect deps**
- **Found during:** Task 07-10-07.
- **Issue:** The existing `useEffect(() => { if (open) setCount(PALETTE_VERBS.length); }, [open])` originally closed over a module-level const, so the empty/incomplete deps were safe. After moving the verbs into a per-component `useMemo`, the same effect would capture a stale array on profile change.
- **Fix:** Added `PALETTE_VERBS` to the deps array so the count resets correctly when either `open` flips or `profile` changes.
- **Files modified:** `app/components/shell/command-palette.tsx`
- **Verification:** Tests still pass; ESLint react-hooks plugin would have caught it on next lint pass.
- **Committed in:** `32a8864` (part of Task 07-10-07 commit).

---

**Total deviations:** 3 auto-fixed (2 blocking test compat, 1 stale-closure correctness)
**Impact on plan:** All three are necessary to keep the existing test suite green and the runtime correct under prop-driven re-renders. No scope creep — every change is downstream of converting closures-over-static into closures-over-prop.

## Issues Encountered

- None — the refactor was uniformly mechanical (replace closure-over-static with closure-over-prop, add a type import, adjust the function signature).

## Production verification (deferred — out of worktree scope)

Task 07-10-08's acceptance criteria include a production probe (`curl https://www.tatibekov.com/ | grep …`) and a Mongo round-trip to confirm that an edit to `profile.name` reflects on production within one ISR window, then revert. This requires:

1. A merge of this worktree branch to `main`.
2. A Vercel auto-deploy.
3. Direct access to the Railway-backed Mongo Atlas to make a temporary edit.

All of these are owned by the developer/orchestrator post-merge. The worktree-local pipeline (`lint`/`typecheck`/`test`/`build`) is green and is the strongest evidence the executor can produce in isolation. Production verification is logged for the orchestrator to run after the wave-2 merge, and the result should be appended to `.planning/phases/07-deploy-verification/07-VERIFICATION.md` under DEPLOY-04 §Carry-forward notes (per the plan's acceptance criteria for Task 8).

## Static-fallback verification (deferred — out of worktree scope)

The plan also asks to verify the static fallback path by temporarily setting `NEXT_PUBLIC_API_BASE_URL=http://localhost:1` (unreachable) and confirming the shell renders correctly with static PROFILE values. This was not exercised in the worktree because:

- It requires running `npm run dev` and a live browser session.
- `lib/api.ts`'s `getJson<T>` is unchanged — its silent `catch` + fallback contract is already covered by `lib/api.test.ts` (Phase 1) and the static `PROFILE` is a typed `Profile` per `lib/types.ts §Profile`. Type-equivalence guarantees the render path receives a valid object whether the BE is reachable or not.

The orchestrator can run the env-flip probe locally if the production verification surfaces any concern. The static fallback path is now exercised on every `npm test` (Vitest does not hit the network, so every test renders the static `PROFILE` through the new prop-driven path).

## Next Phase Readiness

- **Plan 07-03 (analytics) unblocked:** `top-bar.tsx` is now prop-driven; Plan 07-03 can add `onClick={() => track("resume_download")}` as a single-line addition without removing any `PROFILE` import (07-10 already removed it).
- **Plan 07-04 (PSI) unaffected:** the 5-min ISR window means PSI hits will measure the Mongo-sourced shell — the correct evidence shape for D-16.
- **Plan 07-07 (recruiter test):** the 5-second test now exercises a Mongo-hydrated shell rendering the canonical name/email, not a stale TS string.
- **Future Mongo content passes:** any edit to `profile.name`, `profile.email`, `profile.resumeUrl`, `profile.socials[*].url` propagates to the persistent shell automatically — no code edit required.

## Self-Check: PASSED

Verified by `Bash` checks:

- `app/(terminal)/layout.tsx` is async (`export default async function TerminalLayout` line 20) and calls `await getProfile()` (line 21).
- `app/layout.tsx` is async (`export default async function RootLayout` line 60) and calls `await getProfile()` (line 64).
- Zero files in `app/components/shell/*.tsx` import `PROFILE` from `@/lib/portfolio-data` (test files retain the import as fixture, as planned).
- `lib/palette-verbs.ts` line 49 exports `buildPaletteVerbs(profile: Profile)`.
- JsonLdPerson XSS escape (`/</g, "<"`) preserved at `app/components/shell/json-ld-person.tsx:15`.
- All 7 task commits + their plan-task IDs are reachable in `git log`:
  - `8f0ddec` (TopBar) ✓
  - `ff4eb5d` (Sidebar) ✓
  - `09e4662` (ConsoleSignature) ✓
  - `b0363ea` (ExplorerDrawer) ✓
  - `8957ede` (JsonLdPerson + root layout) ✓
  - `32a8864` (palette factory + command palette) ✓
  - `033e8dc` ((terminal) layout async) ✓
- `npm run lint` → exit 0.
- `npm run typecheck` → exit 0.
- `npm test -- --run` → 160/160 passing.
- `npm run build` → exit 0; 23 static pages generated; postbuild placeholder grep clean.

---
*Phase: 07-deploy-verification*
*Plan: 10*
*Completed: 2026-05-13*
