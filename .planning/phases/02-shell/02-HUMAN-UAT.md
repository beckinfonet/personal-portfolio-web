---
status: partial
phase: 02-shell
source: ["02-VERIFICATION.md"]
started: 2026-05-06T09:22:00Z
updated: 2026-05-06T09:22:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Slow-3G no-flash recording (success criterion 2)
expected: Set `localStorage["portfolio-accent"]="340"` (magenta) and `localStorage["theme"]="light"` in DevTools Application tab; throttle Network to Slow 3G; hard-reload http://localhost:3000/. The first paint should already be light theme + magenta accent — zero green or dark flash. Verify by recording the reload and reviewing frame-by-frame.
result: [pending]

### 2. Resume button visibility at 375px (SHELL-03 / Risk 3)
expected: DevTools device frame iPhone SE (375×667) on each of the 7 routes (`/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`). The `↓ resume.pdf` button in the top bar must be visible without scrolling and must be clickable (no overlap with traffic-light dots, theme toggle, or ⌘K trigger; width budget allows responsive hiding of decorations only — resume + ⌘K + theme always visible).
result: [pending]

### 3. VoiceOver tab pass (A11Y-04 / A11Y-08)
expected: macOS VoiceOver (Cmd+F5). Tab through the shell on the about route. Sidebar rows must announce **plain nouns** ("About me", "Projects", "Tech stack", "Experience", "Writing", "Contact information", "Shipped apps") — NOT file-extension labels ("about.md", "projects/", "contact.sh", etc.). Active row should announce "current page". Pressing ⌘K opens the palette and traps focus inside it; pressing Esc closes the palette and returns focus to the ⌘K trigger button. Skip-link to `#main-content` must be reachable as the first focusable element on Tab.
result: [pending]

### 4. 4-hue × 2-theme smoke test (THEME-03 / THEME-04)
expected: Manually exercise each accent hue × theme combination (8 total via `Set accent: matrix/amber/cyan/magenta` palette verbs and theme toggle). Body text must remain legible; focus rings visible; STATUS dot visible; sidebar active-row tint visible. Predicted risk: **amber on light theme** may have low contrast — flag for Phase 5 axe-core audit if borderline. This is a smoke check, not the WCAG audit (Phase 5 / A11Y-07 owns that).
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

None recorded yet — all four items are pending real-device or local-dev testing the user has not yet performed.
