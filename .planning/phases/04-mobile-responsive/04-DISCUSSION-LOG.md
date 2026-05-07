# Phase 4: Mobile-Responsive - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 04-mobile-responsive
**Areas discussed:** Sidebar drawer pattern, Mobile palette UX, STATUS rehoming + print stylesheet
**Areas surfaced but deferred:** 375px top-bar layout

---

## Gray Area Selection

**Question:** Which gray areas do you want to discuss for Phase 4 (Mobile-Responsive)?

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar drawer pattern | Bottom-sheet vs left-edge slide-in for the EXPLORER file tree on mobile (MOBILE-01/02) | ✓ |
| Mobile palette UX | PALETTE-05 form factor (bottom-sheet vs full-height modal vs centered) + breakpoint + trigger | ✓ |
| 375px top-bar layout | What persists / compresses when 5+ controls fight for space at 375px | |
| STATUS rehoming + print stylesheet | Where STATUS lands on mobile (MOBILE-04) + print stylesheet scope (A11Y-09) | ✓ |

**User's choice:** Sidebar drawer pattern, Mobile palette UX, STATUS rehoming + print stylesheet
**Notes:** 375px top-bar layout deferred — existing breakpoints (600px path-label, 480px traffic-dots + LiveClock) plus the new ☰ slot were judged sufficient; planner can audit at implementation if overflow surfaces.

---

## Sidebar drawer pattern

### Q1: Which drawer pattern for the EXPLORER file tree on mobile?

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom-sheet (Recommended) | Slides up from bottom edge. Thumb-reachable, PWA-feel, Pitfall 7's explicit recommendation | ✓ |
| Left-edge slide-in | Conventional hamburger nav, large tap zone, but worse one-handed ergonomics on tall phones | |
| Full-screen modal | Maximum space; heavy-handed for 7 routes, loses backdrop context | |

**User's choice:** Bottom-sheet (Recommended)

### Q2: Where does the drawer trigger live in the mobile top-bar, and what icon?

| Option | Description | Selected |
|--------|-------------|----------|
| Leftmost slot, ☰ icon (Recommended) | Replaces the path-label slot already hidden at <=600px; universally recruiter-readable | ✓ |
| Leftmost slot, file-tree icon (▸ or ») | Stays in terminal voice; recruiters may not connect it to a nav menu | |
| Right zone, next to ⌘K | Groups interactive controls; right zone already crowded at 375px | |

**User's choice:** Leftmost slot, ☰ icon (Recommended)

### Q3: How much vertical space does the drawer occupy when open?

| Option | Description | Selected |
|--------|-------------|----------|
| Fit-content, max ~75vh (Recommended) | Sheet sizes to content, caps at 75vh, internal scroll if exceeded | ✓ |
| Fixed height ~60vh | Predictable; feels artificial when content is short | |
| Full height (100vh, edge-to-edge) | Maximum room; loses bottom-sheet feel | |

**User's choice:** Fit-content, max ~75vh (Recommended)

### Q4: Does the drawer auto-close on route change, or stay open?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-close on route change (Recommended) | Standard mobile-nav behavior; matches iOS/Android conventions | ✓ |
| Stay open until explicit dismiss | Browse multiple files without re-opening; risks user confusion about navigation | |

**User's choice:** Auto-close on route change (Recommended)

---

## Mobile palette UX

### Q1: What form factor for the palette on mobile?

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom-sheet, ~80vh (Recommended) | Matches drawer pattern; consistent mobile-overlay mental model; keyboard appears below sheet | ✓ |
| Full-height modal (edge-to-edge) | Maximum room for results; loses backdrop dismissal cue | |
| Centered modal, mobile-sized | Reuse Phase 2 modal CSS; failure case Pitfall 6 warns against | |

**User's choice:** Bottom-sheet, ~80vh (Recommended)

### Q2: At what viewport width does the mobile palette UX kick in?

| Option | Description | Selected |
|--------|-------------|----------|
| <= 960px (Recommended) | Single mobile-mode boundary across drawer + palette; matches sidebar collapse | ✓ |
| <= 768px | More conservative; awkward 768–960 zone with two breakpoints | |
| <= 600px | Phones only; tablet-portrait inconsistency | |

**User's choice:** <= 960px (Recommended)

### Q3: What does the palette trigger button look like on mobile?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep ⌘K label at every viewport (Recommended) | Phase 2 D-10 already locks this; zero new responsive surface | ✓ |
| Swap to search icon (⌕ or ⛲) below 600px | Saves 12–16px in cramped top-bar; loses brand consistency | |
| "⌘K" desktop, "menu" text below 600px | Plain word for recruiters; adds a third trigger pattern alongside ☰ | |

**User's choice:** Keep ⌘K label at every viewport (Recommended)

### Q4: When the palette opens on mobile, does the search input auto-focus?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-focus (Recommended) | Type-to-filter is the primary use mode; matches desktop default | ✓ |
| No auto-focus, tap to open keyboard | Cleaner visual list for recruiters scrolling; one extra tap for engineers | |

**User's choice:** Auto-focus (Recommended)

---

## STATUS rehoming + print stylesheet

### Q1: Where exactly does the STATUS block land on mobile?

| Option | Description | Selected |
|--------|-------------|----------|
| Inside about-view body, near bottom (Recommended) | Matches MOBILE-04's "about-view footer" wording; visible only on /about <=960px | ✓ |
| Absorbed into the global shell-footer | Visible on every mobile route; expands scope beyond MOBILE-04 wording | |
| Inside the bottom-sheet drawer | Pitfall 7: STATUS belongs on a real page, not behind another overlay | |

**User's choice:** Inside about-view body, near bottom (Recommended)

### Q2: Mobile STATUS visual — identical to desktop, or condensed?

| Option | Description | Selected |
|--------|-------------|----------|
| Identical 3-row block (Recommended) | Reuses .sb-status / .sb-status-row CSS; zero new visual to design | ✓ |
| Condensed one-liner | Saves vertical space; introduces a second STATUS visual | |

**User's choice:** Identical 3-row block (Recommended)

### Q3: Which views are intentionally print-friendly?

| Option | Description | Selected |
|--------|-------------|----------|
| All 7 views (Recommended) | Single rule set; recruiter prints whatever they see; A11Y-09 says "every view legible on paper" | ✓ |
| About view only | One-purpose print: "recruiter prints the resume page"; recruiter on /experience expects to print what's on screen | |

**User's choice:** All 7 views (Recommended)

### Q4: Print stylesheet extras — URL/contact footer + font?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, URL footer + serif fallback (Recommended) | URL+email footer; Georgia/Times serif; A11Y-09 explicitly says serif fallback | ✓ |
| URL footer, keep monospace font | Keeps terminal voice on paper; risks legibility on cheap printers | |
| No extras, minimal hide-shell rule | Smallest stylesheet; PDF saved with no link back | |

**User's choice:** Yes, URL footer + serif fallback (Recommended)

---

## Claude's Discretion

Captured in CONTEXT.md `<decisions>` D-21 and trailing bullet list. Includes drawer animation timing, dismiss gestures, drawer/palette mutual exclusion (z-index discipline), 375px top-bar layout audit (deferred area), and touch-target enforcement padding values.

## Deferred Ideas

| Item | Phase / Disposition |
|------|---------------------|
| 375px top-bar layout deep-dive | Gray area not selected; existing breakpoints + ☰ slot judged sufficient |
| Swipe-down-to-close on bottom-sheets | Nice-to-have; planner decides cost/benefit (no new deps) |
| Haptic feedback on drawer/palette open | Deferred — `navigator.vibrate` unreliable on iOS |
| Recruiter test on 375px production URL | Phase 7 (DEPLOY-04) |
| `prefers-reduced-motion` comprehensive audit | Phase 5 (A11Y-03) |
| 8-combination contrast audit | Phase 5 (A11Y-07) |
| Per-view print micro-styling | Reviewed in print-preview audit; tracked if needed for v1.x |
| Drawer "search in palette" hint inside the bottom-sheet | UX nice-to-have, not requirement |

---

*Phase: 04-mobile-responsive*
*Discussion logged: 2026-05-07*
