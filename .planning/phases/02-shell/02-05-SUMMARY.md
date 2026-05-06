---
phase: 02-shell
plan: 05
subsystem: shell
tags: [command-palette, cmdk, a11y, keyboard, accent]
dependency_graph:
  requires: [02-03, 02-04]
  provides: [CommandPalette-full, palette-css]
  affects: [app/globals.css, app/components/shell/command-palette.tsx]
tech_stack:
  added: []
  patterns: [cmdk Command.Dialog, Radix Dialog focus trap, aria-live polite, triggerRef focus restore]
key_files:
  created: []
  modified:
    - app/components/shell/command-palette.tsx
    - app/globals.css
decisions:
  - "Inline result count computed by filtering PALETTE_VERBS client-side on onValueChange; matches cmdk's own filter logic (substring on label+keywords) so count stays in sync"
  - "Used e.key.toLowerCase() === 'k' for ⌘K handler to handle both cases uniformly"
  - "triggerRef captured only on open (not on close toggle) so Esc path also restores focus correctly via the open→false effect"
  - "Count resets to PALETTE_VERBS.length when palette re-opens to avoid stale filter state"
metrics:
  duration: ~8 minutes
  completed: "2026-05-06T16:01:36Z"
  tasks_completed: 1
  files_modified: 2
---

# Phase 2 Plan 05: CommandPalette Full Implementation Summary

Full cmdk-driven CommandPalette replacing the 3-line stub — 18 verbs, focus trap, aria-live result count, accent picker, palette CSS.

## What Was Built

**`app/components/shell/command-palette.tsx`** — Full client island replacing the stub:

- `Command.Dialog` from cmdk (Radix Dialog base) with `open`, `onOpenChange`, `label="Command Palette"`
- Global `keydown` listener for `⌘K` / `Ctrl+K` — toggles palette, captures `triggerRef.current = document.activeElement` before opening
- Focus restoration: `useEffect` on `open` change restores focus to `triggerRef.current` when palette closes (Radix Dialog handles Esc natively via `onOpenChange`)
- `aria-live="polite"` + `role="status"` region announcing dynamic result count (computed client-side on `onValueChange` by substring-matching label + keywords)
- `<span className="visually-hidden">Command Palette</span>` for belt-and-suspenders a11y (cmdk `label` prop is the primary accessible name)
- 18 `Command.Item` elements from `PALETTE_VERBS` — `value={verb.label}`, `keywords={verb.keywords}` — each `onSelect` calls `verb.action({ router, setOpen, setTheme, resolvedTheme, setHue })`
- Four accent verbs call `setHue("145"|"75"|"200"|"340")` via `useAccent()` from `shell-state-provider.tsx`
- Footer with keyboard hints (`↵`, `↑↓`, `esc`)

**`app/globals.css`** — Palette CSS section appended:

- `[cmdk-overlay]` — fixed backdrop, rgba(0,0,0,0.5), z-index 100
- `[cmdk-dialog]` — fixed, top 15vh, centered via `left:50% + translateX(-50%)`, `width: min(520px, 90vw)`, z-index 101
- `[cmdk-input]` — full-width, transparent bg, 14px, border-bottom separator
- `[cmdk-list]` — max-height 320px, overflow-y auto, overscroll contain
- `[cmdk-item]` — 10px/18px padding, flex row with icon + label; `[aria-selected="true"]` uses `var(--accent-bg)` / `var(--accent)` / accent border-left
- `[cmdk-empty]` — centered, muted text
- `.palette-footer` — keyboard hint bar with `kbd` styled elements

## Verification Results

All criteria met:

- `"use client"` directive present
- `Command.Dialog` with open/onOpenChange/label props
- All 18 `PALETTE_VERBS` rendered as `Command.Item` with value=label and keywords=aliases
- `aria-live="polite"` + `role="status"` region with dynamic count
- `triggerRef.current = document.activeElement` captured before open
- `visually-hidden` span for accessible name
- `verb.action({ router, setOpen, setTheme, resolvedTheme, setHue })` call site
- `[cmdk-dialog]`, `[cmdk-overlay]`, `[cmdk-item]`, `[cmdk-list]` CSS rules in globals.css
- `npm run typecheck` — exits 0
- `npm test` — exits 0 (no test files yet; spec suite ships in Plan 07)

## Commits

| Hash | Description |
|------|-------------|
| 3098541 | feat(02-05): full cmdk CommandPalette — 18 verbs, focus trap, aria-live, palette CSS |

## Deviations from Plan

None — plan executed exactly as written.

The plan noted the count was an optional progressive enhancement (D-19 TEST-03 only checks the region exists). The implementation goes further and computes the actual filtered count on `onValueChange` by mirroring cmdk's substring logic against `verb.label` + `verb.keywords`. This is a Rule 2 improvement (correctness) — the region is meaningless if it always says "18 results".

## Known Stubs

None. All 18 verbs have fully wired `action` implementations in `lib/palette-verbs.ts` (Plan 03 output).

## Threat Flags

No new security surface introduced. Threat model items T-2-09 and T-2-10 are satisfied:

- T-2-09: `Command.Input` value is used only for client-side list filtering — never reaches router or network
- T-2-10: `window.open` calls use `"noopener,noreferrer"` (in `lib/palette-verbs.ts`); URLs are hard-coded constants from `PROFILE.socials`
