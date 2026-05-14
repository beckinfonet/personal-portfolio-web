---
status: complete
phase: 02-shell
source: ["02-VERIFICATION.md"]
started: 2026-05-06T09:22:00Z
updated: 2026-05-14
closed: 2026-05-14
close_reason: "Milestone v1.0 close — 4 PASS"
---

## Current Test

[closed — all 4 scenarios passed at milestone v1.0 close]

## Tests

### 1. Slow-3G no-flash recording (success criterion 2)
expected: Set `localStorage["portfolio-accent"]="340"` (magenta) and `localStorage["theme"]="light"` in DevTools Application tab; throttle Network to Slow 3G; hard-reload http://localhost:3000/. The first paint should already be light theme + magenta accent — zero green or dark flash. Verify by recording the reload and reviewing frame-by-frame.
result: pass
resolved: 2026-05-14
notes: Verified against live site; no green→magenta or dark→light flash on first paint with magenta+light pre-set in localStorage under Slow-3G throttling.

### 2. Resume button visibility at 375px (SHELL-03 / Risk 3)
expected: DevTools device frame iPhone SE (375×667) on each of the 7 routes (`/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`). The `↓ resume.pdf` button in the top bar must be visible without scrolling and must be clickable (no overlap with traffic-light dots, theme toggle, or ⌘K trigger; width budget allows responsive hiding of decorations only — resume + ⌘K + theme always visible).
result: pass
resolved: 2026-05-14
notes: Confirmed visible and clickable in TopBar at 375px on all 7 routes; no clipping or display:none at any breakpoint.

### 3. VoiceOver tab pass (A11Y-04 / A11Y-08)
expected: macOS VoiceOver (Cmd+F5). Tab through the shell on the about route. Sidebar rows must announce **plain nouns** ("About me", "Projects", "Tech stack", "Experience", "Writing", "Contact information", "Shipped apps") — NOT file-extension labels ("about.md", "projects/", "contact.sh", etc.). Active row should announce "current page". Pressing ⌘K opens the palette and traps focus inside it; pressing Esc closes the palette and returns focus to the ⌘K trigger button. Skip-link to `#main-content` must be reachable as the first focusable element on Tab.
result: pass
resolved: 2026-05-14
notes: VoiceOver announces all 7 sidebar rows with plain-noun labels (no file-extension suffixes audible); active row announces "current page". ⌘K focus trap + Esc focus restoration confirmed; skip-link reachable as first Tab target.

### 4. 4-hue × 2-theme smoke test (THEME-03 / THEME-04)
expected: Manually exercise each accent hue × theme combination (8 total via `Set accent: matrix/amber/cyan/magenta` palette verbs and theme toggle). Body text must remain legible; focus rings visible; STATUS dot visible; sidebar active-row tint visible. Predicted risk: **amber on light theme** may have low contrast — flag for Phase 5 axe-core audit if borderline. This is a smoke check, not the WCAG audit (Phase 5 / A11Y-07 owns that).
result: pass
resolved: 2026-05-14
notes: All 8 combinations show readable body text and visible focus rings; amber-on-light canary readable. Formal WCAG audit lives in Phase 5 A11Y-07 (covered).

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None — all four scenarios resolved PASS at milestone v1.0 close.
