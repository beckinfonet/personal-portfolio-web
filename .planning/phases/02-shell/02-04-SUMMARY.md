---
phase: 02-shell
plan: 04
subsystem: shell-islands
tags: [client-islands, topbar, sidebar, live-clock, breadcrumb, css, a11y]
dependency_graph:
  requires: [02-03]
  provides: [shell-client-islands, topbar, sidebar, live-clock, breadcrumb]
  affects: [app/(terminal)/layout.tsx, app/globals.css]
tech_stack:
  added: []
  patterns: [useSelectedLayoutSegment, usePathname, useTheme, usePalette, setInterval-cleanup, hydration-safe-null-state, 350ms-bootDone-fade]
key_files:
  created: []
  modified:
    - app/components/shell/top-bar.tsx
    - app/components/shell/sidebar.tsx
    - app/components/shell/live-clock.tsx
    - app/components/shell/breadcrumb.tsx
    - app/globals.css
decisions:
  - "LiveClock initial state is null (not empty string) so server renders --:-- via ?? fallback — prevents hydration mismatch"
  - "Sidebar tz computed via Intl.DateTimeFormat().formatToParts() to extract short timezone name; falls back to GMT+5 (flex)"
  - "topbar-resume uses flex-shrink:0 on .topbar-btn base class — never compresses regardless of viewport"
  - "Sidebar uses useRouter().push() for navigation — keeps button semantics without wrapping in <a>"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-06"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 5
---

# Phase 02 Plan 04: Shell Client Islands Summary

**One-liner:** Four stub client islands replaced with full implementations — TopBar (traffic lights + ⌘K + theme toggle + persistent resume CTA), Sidebar (7 ROUTES + dashed recruiter card + STATUS block), LiveClock (hydration-safe --:--), and Breadcrumb (usePathname + 350ms boot fade).

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | TopBar + LiveClock client islands | 91f85ab | top-bar.tsx, live-clock.tsx, globals.css (TopBar/LiveClock CSS) |
| 2 | Sidebar + Breadcrumb client islands | e32aec0 | sidebar.tsx, breadcrumb.tsx, globals.css (Sidebar/Breadcrumb CSS) |

---

## What Was Built

### TopBar (`app/components/shell/top-bar.tsx`)
- `<header>` landmark wrapping all content (A11Y-05)
- Three traffic-light dots (11px, `#ff5f57 / #febc2e / #28c840`), all `aria-hidden="true"`
- Path label `~/portfolio — bakytbek@dev — zsh` (hides below 600px)
- Spacer (`flex: 1`) pushing right zone to the right
- `⌘K` trigger button (`aria-label="Open command palette"`) → `usePalette().toggle()`
- Theme toggle button (`aria-label="Toggle color theme"`) → `useTheme().setTheme()`; label shows what you'll switch TO (`☼ light` when dark, `☾ dark` when light)
- `<LiveClock />` component (hides below 480px)
- Persistent resume `<a>` (`aria-label="Download resume"`, `download="Bakytbek_Tatibekov_Resume.pdf"`) — `flex-shrink: 0`, never hidden

### LiveClock (`app/components/shell/live-clock.tsx`)
- `useState<string | null>(null)` — server renders `null`, `??` operator shows `--:--`, no hydration mismatch
- `useEffect` fires on mount: sets time immediately, then every 30 seconds via `setInterval`
- `aria-hidden="true"` on the `<span>` (A11Y-06)
- Cleans up interval on unmount

### Sidebar (`app/components/shell/sidebar.tsx`)
- `<nav aria-label="File explorer">` landmark (A11Y-05)
- Section A: `EXPLORER` header (11px, uppercase, `--muted`)
- Section B: `▾ portfolio/` tree root (caret in `--warn`)
- Section C: 7 `<button>` rows from `ROUTES`, each with `aria-label={route.ariaLabel}` and `aria-current="page"` on the active row — active state derived from `useSelectedLayoutSegment()` (`null` === index route)
- Section D: Dashed recruiter card (`border: 1px dashed var(--border)`) with `↓ resume.pdf` download button styled with `background: var(--accent)`
- Section E: STATUS block — `● Available for hire` (dot in `--accent`), `uptime: {uptime}` (prop from RSC layout), `tz: {tz}` (computed via `Intl.DateTimeFormat().formatToParts()` with `GMT+5 (flex)` fallback)
- Icon map: `about.md → ◆`, `projects/ → ▸`, `stack.json → {}`, `experience.log → ≡`, `writing/ → ▸`, `contact.sh → $`, `shipped.app → ▸`

### Breadcrumb (`app/components/shell/breadcrumb.tsx`)
- `usePathname()` derives active route; falls back to `ROUTES[0]` if no match
- `bootDone` flag: `false` initially, set to `true` via `setTimeout(() => ..., 350)` in `useEffect`
- Path display: `~/portfolio / <activeRoute.label>` — active label in `--text` (brighter than muted)
- `⌘K` hint: opacity `0 → 1` transition (`0.5s ease`) triggers when `bootDone` becomes true; `aria-hidden="true"`; `<kbd>` styled with border + background

### CSS additions to `app/globals.css`
- `.topbar`, `.topbar-path`, `.topbar-spacer`, `.topbar-btn`, `.topbar-resume`, `.topbar-cmd-key`
- `.traffic-dot`, `.traffic-dot--red/yellow/green`
- `.live-clock`
- Responsive: `@media (max-width: 600px) { .topbar-path: display none }` and `@media (max-width: 480px) { .traffic-dot, .live-clock: display none }`
- `.sidebar`, `.sb-section-header`, `.sb-tree-root`, `.sb-tree-caret`, `.sb-item`, `.sb-item--active`, `.sb-icon`, `.sb-download`, `.sb-download-btn`, `.sb-status-*`
- `.breadcrumb`, `.breadcrumb-path/sep/active/hint`, `.breadcrumb-hint--visible`

---

## Deviations from Plan

None — plan executed exactly as written. Both tasks followed the plan JSX and CSS patterns verbatim.

---

## Known Stubs

None. All four components are fully wired:
- TopBar: uses `PROFILE.resumeUrl`, `usePalette`, `useTheme`, renders `<LiveClock />`
- Sidebar: uses `ROUTES`, `PROFILE.resumeUrl`, `useSelectedLayoutSegment`, computes tz from `Intl`; receives `uptime` prop from RSC layout
- LiveClock: real time from `new Date()` after mount
- Breadcrumb: real pathname from `usePathname()`

---

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced. Router pushes use only values from `ROUTES[].pathname` (developer-controlled constants). `Intl.DateTimeFormat` reads from browser API only, no user input flows in.

---

## Self-Check

### Files exist:
- `app/components/shell/top-bar.tsx` — FOUND
- `app/components/shell/sidebar.tsx` — FOUND
- `app/components/shell/live-clock.tsx` — FOUND
- `app/components/shell/breadcrumb.tsx` — FOUND

### Commits exist:
- `91f85ab` — feat(02-04): implement TopBar and LiveClock client islands — FOUND
- `e32aec0` — feat(02-04): implement Sidebar and Breadcrumb client islands — FOUND

## Self-Check: PASSED
