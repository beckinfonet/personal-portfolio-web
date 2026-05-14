---
phase: 260514-hu9-mobile-top-bar-hamburger-label-safe-area
plan: 01
subsystem: shell/top-bar
tags: [mobile, a11y, safe-area, top-bar, hamburger]
requires: []
provides:
  - Mobile hamburger trigger now shows visible "☰ menu" label
  - Mobile top-bar reserves env(safe-area-inset-top) padding
  - Mobile top-bar uses min-height: 38px (no clipping under notch)
affects:
  - app/components/shell/top-bar.tsx
  - app/components/shell/top-bar.test.tsx
  - app/globals.css
tech-stack:
  added: []
  patterns:
    - CSS env(safe-area-inset-top) gated under @media (max-width: 960px)
    - min-height override pattern (preserves sticky base rule)
key-files:
  created: []
  modified:
    - app/components/shell/top-bar.tsx
    - app/components/shell/top-bar.test.tsx
    - app/globals.css
decisions:
  - "Atomic single-commit change: hamburger label + safe-area padding ship together because they share the 'mobile top-bar polish' concern."
  - "Use min-height: 38px (not height: 38px) at <=960px so safe-area top padding can grow the row instead of clipping it."
  - "Visible 'menu' text added without altering aria-label — preserves a11y test contract (all existing tests pass unchanged)."
metrics:
  completed: 2026-05-14
  duration_minutes: ~10
  files_modified: 3
  lines_added: 21
  lines_removed: 1
  tests_added: 1
  tests_passing: 183
---

# Quick 260514-hu9: Mobile Top-Bar Hamburger Label & Safe-Area Padding — Summary

One-liner: Phone users now see "☰ menu" on the hamburger trigger (still aria-labelled "Open file explorer"), and the topbar sits below the iOS/Android notch via `padding-top: max(16px, env(safe-area-inset-top))` with `min-height: 38px` replacing the fixed desktop height.

## What changed

### 1. `app/components/shell/top-bar.tsx` (line 26)

Hamburger button visible content changed from `☰` to `☰ menu`. All other attributes — `id="topbar-hamburger-btn"`, `className="topbar-hamburger"`, `aria-label="Open file explorer"`, `aria-expanded`, `aria-controls="explorer-drawer-sheet"`, `onClick={toggleDrawer}` — are unchanged. Net diff: 1 line.

### 2. `app/components/shell/top-bar.test.tsx` (after the existing `renders hamburger button with correct aria-label` test, around line 50)

Added one new test (7 lines):

```ts
test("hamburger button renders visible '☰ menu' label for discoverability", () => {
  render(<TopBar profile={PROFILE} />, { wrapper: Providers });
  const btn = screen.getByRole("button", { name: /open file explorer/i });
  expect(btn).toHaveTextContent(/menu/i);
  expect(btn.textContent).toContain("☰");
});
```

All 9 prior top-bar tests still pass — none modified.

### 3. `app/globals.css` (inside the existing `@media (max-width: 960px)` block at line 1556, immediately after `.topbar-hamburger` and before `.drawer-sheet`)

Added a new `.topbar` override (13 lines including comment):

```css
/* Mobile safe-area + breathing room: the desktop 38px fixed height clips
   the row under the iOS/Android status bar. Switch to min-height and pad
   top using the safe-area inset (fallback 16px). Sticky behavior from the
   base .topbar rule is preserved. */
.topbar {
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: 10px;
  padding-left: 16px;
  padding-right: 16px;
  height: auto;
  min-height: 38px;
}
```

No new media query block was created; the rule lives inside the existing 960px block. The base `.topbar` at line 275 still supplies `position: sticky`, `top: 0`, `z-index: 20`, `background`, and `border-bottom`.

## Verification results

### Grep sanity (plan spec)

```
$ grep -n "☰ menu" app/components/shell/top-bar.tsx
26:        ☰ menu
$ grep -n "safe-area-inset-top" app/globals.css
1587:    padding-top: max(16px, env(safe-area-inset-top));
```

Both return exactly one match — matches plan expectations.

### `npm test`

Full project suite passes when the sibling-agent worktree clone is excluded from vitest's glob (see Deferred Issues below). Direct invocation:

```
$ npx vitest run --exclude="**/node_modules/**" --exclude="**/.next/**" --exclude="tests/**" --exclude="**/.claude/**"
Test Files  28 passed (28)
     Tests  183 passed (183)
```

`app/components/shell/top-bar.test.tsx` reports `(9 tests) 100ms` — all green, including the new "menu" label assertion.

### `npm run build`

```
✓ Compiled successfully in 2.1s
✓ Generating static pages (23/23)
✓ INFRA-05: .next/server/ clean (no forbidden strings)
```

Production build passes including the INFRA-05 placeholder grep prebuild check.

### `npm run lint`

`npm run lint` produces zero errors on the three files modified by this plan (verified by running `npx eslint` directly against `top-bar.tsx`, `top-bar.test.tsx`, `globals.css`). See Deferred Issues for one unrelated pre-existing lint warning.

## Deviations from Plan

None — plan executed exactly as written. All three edits match the planner's exact spec (visible text, new test placement, CSS override placement, property values).

## Deferred Issues (out of plan scope)

The lint and test runs surfaced one pre-existing infrastructure issue caused by a sibling agent's worktree clone left behind in `.claude/worktrees/agent-a6d20eb13f4a7d667/`. This bleed-through is outside this plan's three target files and outside the SCOPE BOUNDARY rule — flagging for project hygiene only.

| Symptom | Location | Why it's out of scope |
| --- | --- | --- |
| `npm run lint` reports `triple-slash-reference` error on `next-env.d.ts` | `.claude/worktrees/agent-a6d20eb13f4a7d667/next-env.d.ts` (untracked, auto-generated by Next.js inside a stale worktree) | The project eslint config (line 35 of `eslint.config.mjs`) ignores `next-env.d.ts` only at the project root, not nested under `.claude/worktrees/`. Recommended hygiene: add `.claude/**` to `globalIgnores` (deferred — out of plan scope). |
| `npm test` reports 8 failures in `.claude/worktrees/agent-a6d20eb13f4a7d667/app/components/shell/top-bar.test.tsx` | Sibling agent's worktree clone | `vitest.config.ts` exclude list (line 18) does not exclude `.claude/worktrees/**`, so test discovery walks into the clone, where `@/` module resolution differs and `ShellStateProvider` context is missing. The duplicate file's failures are NOT caused by this plan's changes. Recommended hygiene: add `**/.claude/**` to vitest exclude list (deferred). |

Neither issue is reachable by edits to the three plan-target files. Both pre-existed at the base commit `8bf10ab` (verified — `.claude/` is fully untracked and never appeared in git history).

## Commits

| # | Type | Subject | Hash | Files |
| --- | --- | --- | --- | --- |
| 1 | feat | `feat(260514-hu9): mobile top-bar hamburger label and safe-area top padding` | `441eb3f` | `app/components/shell/top-bar.tsx`, `app/components/shell/top-bar.test.tsx`, `app/globals.css` |

## Self-Check: PASSED

- `app/components/shell/top-bar.tsx` — modified, change verified at line 26 ("☰ menu")
- `app/components/shell/top-bar.test.tsx` — modified, new test verified by 9-test pass count
- `app/globals.css` — modified, override verified at line 1587 (safe-area-inset-top)
- Commit `441eb3f` — FOUND in `git log` (HEAD)
- Atomic single commit — confirmed by `git diff --stat` (3 files, +21 / -1)
