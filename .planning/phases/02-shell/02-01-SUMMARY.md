---
phase: 02-shell
plan: "01"
subsystem: css-tokens
tags: [css, design-tokens, oklch, accessibility, animations]
dependency_graph:
  requires: []
  provides: [app/globals.css]
  affects: [all Phase 2 shell components, AccentBootstrapScript, TopBar, Sidebar, CommandPalette]
tech_stack:
  added: []
  patterns: [CSS custom properties, oklch color space, @supports progressive enhancement, focus-visible, skip-link, CSS keyframes]
key_files:
  created: []
  modified:
    - app/globals.css
key_decisions:
  - sRGB fallbacks declared before @supports oklch blocks in both :root and [data-theme="light"] so cascade order is correct
  - --accent-hue: 145 default in :root; runtime overridden by AccentBootstrapScript before paint
  - body font-family uses var(--font-mono) variable (no literal "JetBrains Mono") — matches next/font/google variable name
  - cursor blink uses steps(2, start) 1s infinite on 8x14px accent block
  - prefers-reduced-motion targets .cursor, .content-block, .breadcrumb-hint class names
metrics:
  duration: "68 seconds"
  completed: "2026-05-06T15:44:23Z"
  tasks_completed: 1
  files_changed: 1
requirements_satisfied: [SHELL-09, THEME-03, THEME-04, A11Y-02]
---

# Phase 2 Plan 01: globals.css Terminal Token System Summary

Complete rewrite of `app/globals.css` with dark/light theme tokens, oklch-driven dynamic accent hue, sRGB progressive-enhancement fallbacks, animation keyframes, skip-link, and focus-visible outline — the CSS foundation for all Phase 2 shell components.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite app/globals.css with full terminal token system | 6d146a5 | app/globals.css (180 insertions, 43 deletions) |

## What Was Built

`app/globals.css` (212 lines) replaces the Phase 1 stub (76 lines) with:

- **Dark theme `:root` tokens** — `--bg`, `--bg-raised`, `--panel`, `--panel-hi`, `--border`, `--border-hi`, `--text`, `--text-hi`, `--muted`, `--muted-hi`, plus sRGB accent fallbacks `--accent: #22c55e`, `--accent-dim`, `--accent-bg`, `--warn`, `--red`, `--blue`
- **Light theme `[data-theme="light"]` tokens** — parallel token set with light-appropriate neutral values and sRGB accent fallbacks `--accent: #16a34a`
- **`@supports (color: oklch(0 0 0))` blocks** — one for `:root`, one for `[data-theme="light"]`; each overrides the three accent tokens with `oklch(L C var(--accent-hue))` expressions
- **`--accent-hue: 145`** default in `:root` (matrix green); `AccentBootstrapScript` overrides this before paint via inline script
- **Body baseline** — `font-family: var(--font-mono), ui-monospace, "SF Mono", "Cascadia Mono", monospace`; 14px / 1.6 line-height
- **Focus-visible** — `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` + `*:focus:not(:focus-visible) { outline: none }` (A11Y-02)
- **Skip-link** — `.skip-link { position: absolute; top: -100% }` revealed at `top: 16px` on `:focus` (A11Y-01)
- **Keyframes** — `@keyframes blink { 50% { opacity: 0 } }` and `@keyframes slideIn { from opacity:0 translateY(2px) to opacity:1 none }`
- **`prefers-reduced-motion: reduce`** — disables `.cursor`, `.content-block` animations; sets `.breadcrumb-hint` transition to none
- **Cursor primitive** — `.cursor` 8×14px accent block with `blink 1s steps(2, start) infinite`
- **Prompt-line CSS** — `.prompt-line`, `.prompt-dollar`, `.prompt-cmd` classes
- **Utility classes** — `.visually-hidden` and `.sr-only` for accessible dialog titles

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. This is a pure CSS token file; no data flows to UI. All tokens are consumed by later Phase 2 component tasks.

## Threat Flags

None. Static CSS file; no network endpoints, no user input, no secrets.

## Self-Check

Files exist:
- `app/globals.css` — FOUND (212 lines, ≥120 minimum)

Commits exist:
- `6d146a5` — FOUND

Verification results:
- `grep -c "oklch" app/globals.css` → 15 (≥8 required) PASS
- `grep -c "@supports (color: oklch" app/globals.css` → 2 (exactly 2 required) PASS
- `:focus-visible` rule — FOUND
- `@keyframes blink` — FOUND
- `@keyframes slideIn` — FOUND
- `var(--font-mono)` in font-family — FOUND
- `.skip-link` with `top: -100%` and `.skip-link:focus { top: 16px }` — FOUND
- `prefers-reduced-motion: reduce` block — FOUND
- `--accent-hue: 145` in `:root` — FOUND
- sRGB fallback `--accent: #22c55e` in `:root` before @supports block — FOUND
- sRGB fallback `--accent: #16a34a` in `[data-theme="light"]` before @supports block — FOUND
- `JetBrains Mono` literal in font-family — NOT FOUND (only in comment) PASS
- `npm run typecheck` — exit 0 PASS
- `npm run lint` — exit 0 PASS

## Self-Check: PASSED
