# Phase 4: Mobile-Responsive — Research

**Researched:** 2026-05-07
**Domain:** Responsive (<=960px) bottom-sheet drawer + bottom-sheet ⌘K palette + STATUS rehome + print stylesheet, Next.js 15 App Router + React 19 + pure CSS, ZERO new prod deps
**Confidence:** HIGH (decisions locked in CONTEXT.md / UI-SPEC.md; research validates external best practices for the four narrow risk areas — focus trap, iOS sheet gotchas, cmdk attribute selectors, print quirks — and produces the Validation Architecture).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

All 21 decisions D-01..D-21 are NON-NEGOTIABLE. Reproduced verbatim from `.planning/phases/04-mobile-responsive/04-CONTEXT.md`:

**Mobile Breakpoint Strategy**
- **D-01:** Single mobile breakpoint at `@media (max-width: 960px)` for both the sidebar drawer collapse and the palette bottom-sheet swap. Existing top-bar breakpoints (600px path label, 480px traffic dots + LiveClock) preserved as-is.
- **D-02:** Tablet portrait (768–960px) gets the mobile UX. No separate tablet zone.

**EXPLORER Drawer (MOBILE-01 / MOBILE-02)**
- **D-03:** Bottom-sheet drawer pattern. Slides up from bottom edge. Backdrop `rgba(0,0,0,0.5)`. Backdrop tap dismisses.
- **D-04:** Trigger placement: leftmost top-bar slot, `☰` hamburger icon. Renders only at <=960px. Touch target >=44×44px.
- **D-05:** Drawer fit: `height: fit-content; max-height: 75vh; overflow-y: auto;`.
- **D-06:** Drawer auto-closes on route change.
- **D-07:** Drawer contents = file tree + recruiter card. STATUS NOT in drawer (rehomes to about-view per D-12). Touch targets >=44×44px per row.

**Mobile Palette UX (PALETTE-05)**
- **D-08:** Bottom-sheet form factor at <=960px. Same `Command.Dialog` from Phase 2; Phase 4 adds `@media (max-width: 960px)` rules over `[cmdk-dialog]` and `[cmdk-overlay]`. `bottom: 0; max-height: 80vh; border-radius: 12px 12px 0 0;`. Search input pinned at top.
- **D-09:** ⌘K trigger label persists at every viewport. No icon swap.
- **D-10:** Search input auto-focuses on palette open (mobile + desktop).
- **D-11:** Palette items get >=44×44px touch targets at <=960px. `padding: 14px 18px;` (or equivalent line-height).

**STATUS Block Rehoming (MOBILE-04)**
- **D-12:** STATUS rehomes inside about-view body, near bottom. Visible only on `/` (about) route at <=960px. `display: none` at >=961px.
- **D-13:** STATUS does NOT render on other mobile views or in the drawer.
- **D-14:** STATUS data source unchanged. Recommendation: extract `<StatusBlock>` primitive shared by Sidebar + about-view (planner picks).

**Print Stylesheet (A11Y-09)**
- **D-15:** `@media print` rule set covers all 7 views. Hides `.topbar`, `.sidebar`, `[cmdk-overlay]`, `[cmdk-dialog]`, `.breadcrumb`, drawer, drawer trigger, `.skip-link`. White bg, black text. Animations + cursor blink off.
- **D-16:** Print font: serif fallback. `body { font-family: Georgia, "Times New Roman", serif !important; }`. Monospace carve-outs for code-block-like content (`.stack-pre`, `.prompt-line .prompt-cmd`, `.tech-chip`, etc.).
- **D-17:** Print-only footer with URL + email appended. New `<PrintFooter />` RSC. Reads `process.env.NEXT_PUBLIC_SITE_URL` + `PROFILE.email`.
- **D-18:** Page-break behavior: natural flow, no forced single-page. Defensive `page-break-inside: avoid` on `.shell-footer` + `.print-footer`.

**Resume CTA Above Fold at 375px (MOBILE-03)**
- **D-19:** Top-bar resume button is the load-bearing affordance. Phase 3 about-view ghost-button row also keeps `↓ resume.pdf` (belt-and-suspenders).

**Test Strategy**
- **D-20:** Vitest for component-level (drawer state machine, palette toggle still fires at <=960px, print-footer renders). Manual screenshot review at 375 / 768 / 1024 + print preview on all 7 views.

**Wave Sequencing**
- **D-21:** Wave 1 = `globals.css` rule append (single CSS edit). Wave 2 (parallel) = ExplorerDrawer / StatusBlock / PrintFooter. Wave 3 = Vitest specs. Wave 4 = manual screenshot + print preview audit.

### Claude's Discretion (decisions Phase 4 may make at planning/execution)

- Drawer animation timing — slide-in from bottom ~200ms ease-out; reduced-motion disables slide.
- Drawer dismiss gestures — backdrop tap (mandatory), Esc (mandatory); swipe-down deferred (no new deps; backdrop+esc cover dismissal).
- Trigger button label — `aria-label="Open file explorer"`; `aria-expanded` toggles.
- 375px top-bar layout — existing breakpoints handle most. If overflow at 375px, planner adds icon-only resume variant `↓` keeping `aria-label="Download resume"`.
- Drawer + palette mutual exclusion — opening one closes the other (wired via `ShellStateProvider`).
- Drawer state shape — local `useState` vs `useDrawer()` slice in `ShellStateProvider`. Recommendation (UI-SPEC §"State management"): extend ShellStateProvider because trigger lives in TopBar (cross-component state needed for mutual exclusion).
- Touch-target enforcement — `@media (max-width: 960px)` block bumps padding on `.sb-item`, `[cmdk-item]`, `.topbar-btn`. Planner picks final values.
- Drawer + palette z-index — drawer 90, palette 100; palette wins if both somehow active.

### Deferred Ideas (OUT OF SCOPE — do not address)

- 375px top-bar layout deep-dive beyond what existing breakpoints + `☰` slot provide.
- Swipe-down-to-close on bottom-sheets.
- Haptic feedback on drawer/palette open (iOS).
- Recruiter test on production URL (Phase 7 / DEPLOY-04 — Phase 4 is dry-run only).
- Comprehensive `prefers-reduced-motion` audit (Phase 5 / A11Y-03 — Phase 4 ships defensive rules for new drawer + mobile-palette slide only).
- 8-combination contrast audit (Phase 5 / A11Y-07).
- Per-view print micro-styling.
- Drawer "search in palette instead" hint at sheet bottom.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (from REQUIREMENTS.md) | Research Support |
|----|------------------------------------|------------------|
| **MOBILE-01** | Mobile breakpoint at ~960px collapses the 240px sidebar; sidebar contents redistributed (NOT just `display: none` per Pitfall 7) | §"Pitfall 7 audit" + §"Architecture Patterns" Pattern 1 — every former sidebar element has documented mobile home; CSS `.sidebar { display: none }` paired with drawer rehome + STATUS rehome + top-bar resume button. |
| **MOBILE-02** | Bottom-sheet drawer for the EXPLORER file tree, triggered from a hamburger in the mobile top bar; 44×44px touch targets per WCAG 2.5.5 | §"Architecture Patterns" Pattern 2 (hand-rolled focus trap) + §"WCAG target sizes" + §"Code Examples" drawer skeleton. |
| **MOBILE-03** | Resume download CTA visible above the fold on the about view at 375px (mobile recruiter never has to scroll for resume per Risk 3) | Top-bar resume button persistent at 375px (Phase 2 D-15 / SHELL-03 already shipped) + about-view CTA row in first viewport (Phase 3); §"Validation Architecture" includes 375px screenshot assertion. |
| **MOBILE-04** | Sidebar STATUS block (`● Available for hire`, `uptime`, `tz`) rehomed to the about-view footer on mobile | §"Architecture Patterns" Pattern 3 — `<StatusBlock />` shared primitive, CSS-driven visibility (`@media (max-width: 960px) { .about-status-mobile { display: block } }`); RSC-first. |
| **MOBILE-05** | Mobile palette UX (covered in PALETTE-05); responsive typography per handoff scale | Subsumed by PALETTE-05; typography is inherited from Phase 2/3 — no new sizes added in Phase 4. |
| **PALETTE-05** | Mobile equivalent — palette opens as a bottom-sheet (or full-height modal) triggered by a hamburger / "command" button in the mobile top bar; same verb list and type-to-filter | §"cmdk attribute selector stability" — `[cmdk-dialog]` / `[cmdk-overlay]` / `[cmdk-input]` / `[cmdk-list]` / `[cmdk-item]` / `[cmdk-empty]` are documented public styling hooks; `@media (max-width: 960px)` overrides do NOT modify the JS component (CONTEXT.md decision: "Phase 4 does NOT modify the component"); Phase 2 keyboard-nav + aria-live + focus-restore behavior is preserved because cmdk's React tree is unchanged. |
| **A11Y-09** | `@media print` stylesheet (white bg, black text, hide top bar / sidebar / palette, force serif fallback) so recruiter-printed pages are legible | §"Print stylesheet best practices" — `print-color-adjust: exact` for accent backgrounds we want preserved (none in this case — we're normalizing to b/w); `@page` margin set; `page-break-inside: avoid` on footer; serif body with mono carve-outs for code blocks. |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are absolute. Research recommendations and the planner MUST conform:

- **Pure CSS + CSS custom properties only.** No Tailwind, no CSS-in-JS, no CSS modules. Phase 4 appends rule blocks to `app/globals.css`.
- **ZERO new prod deps.** Total prod deps stay at `next-themes ^0.4.6` + `cmdk ^1.1.1`. The drawer focus trap is hand-rolled. The bottom-sheet animation is hand-rolled CSS. No `focus-trap`, no `focus-trap-react`, no `vaul`, no `react-spring`, no `framer-motion`.
- **Native `fetch` only.** No data fetching in Phase 4 anyway, but pattern matters.
- **Persistent shell at `app/(terminal)/layout.tsx` never unmounts.** New `<ExplorerDrawer />` mounts inside this layout (or via `ShellStateProvider`) and persists across route changes — closing only on explicit user action or D-06 route-change auto-close.
- **Top-bar resume button visible at EVERY viewport including 375px.** Non-negotiable (SHELL-03 / Risk 3).
- **Plain-noun aria-labels.** `☰` button uses `aria-label="Open file explorer"`; drawer file rows inherit `route.ariaLabel` from `lib/routes.ts` (already plain-noun: "About me", "Projects", "Contact information", etc.).
- **Mobile redistribution rather than `display: none` orphans (Pitfall 7).** Every former sidebar element has a documented mobile home — the audit is part of plan-checker scope.
- **5-second recruiter test is a real exit criterion.** Phase 4 ships the dry run on 375px localhost; Phase 7 runs the real test on production.
- **Brownfield discipline.** Phase 4 is purely additive (no deletions). All changes are additions to `globals.css` + 3 new component files + targeted edits to `top-bar.tsx`, `sidebar.tsx`, `about-view.tsx`, `(terminal)/layout.tsx`.
- **kebab-case files, PascalCase components, RSC default with `"use client"` only when needed.**

## Summary

Phase 4 is a CSS-heavy phase with two new components: `ExplorerDrawer` (the 6th client island; hand-rolled focus trap on a `role="dialog" aria-modal="true"` div with CSS-driven slide animation) and `PrintFooter` (a tiny RSC). A third component, `StatusBlock`, is recommended to extract the existing sidebar STATUS markup so the about-view can reuse it (D-14, recommended, ~30 lines). The print stylesheet is a single `@media print` block at the end of `globals.css`. The mobile palette swap is purely CSS — no changes to `command-palette.tsx`.

The CONTEXT.md is exhaustive (21 locked decisions) and UI-SPEC.md is pixel-faithful. **This research's job is validation, not architecture.** It surfaces:
1. Hand-rolled focus trap pattern (verified against W3C WAI-ARIA APG and React community guidance)
2. cmdk attribute selector stability (verified against the official cmdk repo: `[cmdk-overlay]` / `[cmdk-dialog]` / `[cmdk-input]` / `[cmdk-list]` / `[cmdk-item]` / `[cmdk-empty]` are documented public styling hooks)
3. iOS Safari bottom-sheet gotchas — `dvh`/`svh`/`lvh` reached cross-browser Baseline in 2025; UI-SPEC currently uses `vh` (75vh / 80vh) — this research's recommendation: **change `vh` → `dvh` for the drawer max-height and `svh` for the palette max-height**, with `vh` as the implicit fallback (browsers without dvh/svh fall back gracefully). This is a small, surgical refinement to UI-SPEC.
4. Print stylesheet best practices — `@page` margin, `print-color-adjust: economy` (default; do NOT override to `exact` since we're normalizing to b/w), serif body with monospace carve-outs (already in UI-SPEC), defensive `page-break-inside: avoid` on the footer (already in UI-SPEC).
5. WCAG 2.5.5 (44×44 enhanced AAA) is the right bar for a recruiter-facing portfolio; CONTEXT.md commits to it; this research confirms the choice over the WCAG 2.2 2.5.8 minimum (24×24 AA).
6. **`prefers-reduced-motion`**: drawer needs BOTH `animation: none` AND `transition: none` blocks; backdrop fade uses `transition`, sheet slide uses `animation`. The UI-SPEC already gets this right.
7. **Validation Architecture for Nyquist**: per-requirement test mapping with falsifiable assertions; explicit list of items that can ONLY be verified manually (so VALIDATION.md captures them as manual gates, not silently-skipped automation gaps).

**Primary recommendation:** Implement exactly per CONTEXT.md + UI-SPEC.md. The two technical refinements this research surfaces are (a) `dvh` for the drawer max-height and `svh` for the palette max-height — both are small, surgical changes that age the implementation forward; and (b) ensure the hand-rolled focus trap follows the verified pattern in §"Code Examples" Pattern 2 (query focusables on each Tab keydown, NOT cached on mount — handles dynamic content).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Drawer open/close state | Browser / Client (React island) | — | Transient UI state; the URL doesn't carry "drawer open"; lives in `ShellStateProvider` (Context + reducer) so the trigger in `TopBar` and the sheet in a sibling location can share it. Mutual exclusion with palette also needs cross-component state. |
| Drawer focus trap | Browser / Client | — | DOM-level keyboard event interception; pure browser concern. Hand-rolled in `ExplorerDrawer.tsx`. |
| Drawer animation (slide + fade) | Browser / Client (CSS) | — | CSS keyframe + transition; no JS animation library. `prefers-reduced-motion` block disables the slide. |
| Mobile palette form factor | Browser / Client (CSS) | — | Pure `@media (max-width: 960px)` overrides on `[cmdk-dialog]` / `[cmdk-overlay]` attribute selectors. The cmdk JS component (state machine, keyboard nav, focus management) is unchanged from Phase 2. |
| STATUS block rehome | Frontend Server (SSR/RSC) + Browser CSS | — | `<StatusBlock />` is a Server Component; about-view RSC renders it; visibility is CSS-driven (`@media (max-width: 960px)`). The `tz` row is the only client part — a tiny wrapper that runs `Intl.DateTimeFormat().resolvedOptions().timeZone` (Phase 2 already does this in Sidebar, lines 31–43). |
| Print stylesheet | Browser (CSS) | — | `@media print` at end of `globals.css`. The `<PrintFooter />` RSC is always-rendered DOM; `display: none` outside `@media print`. |
| Print URL + email source | Frontend Server (RSC) | — | `process.env.NEXT_PUBLIC_SITE_URL` (read at build/SSR) + `PROFILE.email` (static import); no client behavior. |
| Hamburger trigger | Browser / Client (React island, inside `TopBar`) | — | Click handler dispatches drawer open via `useDrawer()` slice; `aria-expanded` mirrors state. |
| Cross-viewport "redistribution audit" | Code review (CSS grep) | Plan-checker | `grep -E "display:\s*none" app/globals.css` for sidebar selectors must pair with a documented mobile home (Pitfall 7 audit / ROADMAP success criterion 4). |

**Why this matters:** Phase 4 has no backend tier or API tier in scope. All work is browser/client + frontend-server-rendered (RSC) + CSS. The map confirms there are no misassignments: nothing belongs in an "API" tier, nothing belongs in a "data" tier. The most common Phase 4 failure mode would be putting drawer state into the URL (e.g. `?drawer=open`) or persisting it to localStorage — neither is appropriate for transient UI state. CONTEXT.md and UI-SPEC.md correctly assign this to client React state.

## Standard Stack

### Core (no new prod deps for Phase 4)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^15.5.15` | App Router, RSC boundary, route-group persistent layout | Already locked Phase 1; Phase 4 changes nothing about Next.js usage. [VERIFIED: package.json] |
| `react` | `19.1.0` | Client islands, useState/useEffect/useRef, useReducer for `ShellStateProvider` | Already locked Phase 1. [VERIFIED: package.json] |
| `cmdk` | `^1.1.1` | Command palette state machine + keyboard nav + focus trap (Phase 2). Phase 4 only overrides cmdk's CSS attribute selectors. | Already locked Phase 1. The official repo's website itself uses `[cmdk-overlay]` / `[cmdk-dialog]` / `[cmdk-input]` / `[cmdk-list]` / `[cmdk-item]` / `[cmdk-empty]` as documented public styling hooks. The mobile bottom-sheet override is the standard pattern. [CITED: github.com/dip/cmdk README — "Each part of the cmdk component has a specific data-attribute (starting with `cmdk-`) that can be used for styling."] |
| `next-themes` | `^0.4.6` | Theme axis (Phase 2) — Phase 4 does not touch theming except print's `body { color: #000 !important; background: #fff !important; }` which overrides whichever theme is active. | Already locked Phase 1. [VERIFIED: package.json] |

### Supporting (devDependencies; already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | `3.1.4` | Unit tests for `ExplorerDrawer`, `PrintFooter`, `StatusBlock`, palette toggle | Phase 4 Wave 3. [VERIFIED: package.json] |
| `@testing-library/react` | `16.2.0` | Component rendering / queries | All Phase 4 specs. [VERIFIED: package.json] |
| `@testing-library/user-event` | `^14.6.1` | Realistic user interactions for drawer keyboard tests (Tab, Shift+Tab, Esc) | Drawer focus trap test. [VERIFIED: package.json] |
| `@testing-library/jest-dom` | `6.6.3` | DOM matchers (`toBeVisible`, `toHaveAttribute`, `toHaveFocus`) | All Phase 4 specs. [VERIFIED: package.json] |
| `jsdom` | `26.1.0` | Test browser environment | Already configured. [VERIFIED: package.json] |
| `knip` | `^6.11.0` | Dead-code audit (catches orphan files Phase 4 might leave behind) | CI; runs in plan-checker / verify-work. [VERIFIED: package.json] |

**Conclusion:** `npm install` adds **zero packages** for Phase 4. The hand-rolled focus trap is a deliberate choice (CLAUDE.md `no new prod deps`); existing libraries like `focus-trap` (4kB gzipped) or `focus-trap-react` would each violate the lock.

### Alternatives Considered (and rejected for Phase 4)

| Instead of | Could Use | Tradeoff | Why we don't |
|------------|-----------|----------|--------------|
| Hand-rolled focus trap (~30 lines in `ExplorerDrawer`) | `focus-trap` (~4kB gzip) or `focus-trap-react` (component API) | Library handles edge cases (iframe, shadow DOM, sentinel nodes) | CLAUDE.md `no new prod deps`. Drawer is a flat list of buttons in a single sheet — the edge cases the library handles don't apply here. |
| Hand-rolled bottom-sheet animation (`@keyframes drawerSlideIn`) | `vaul` (Radix-style sheet) or `framer-motion` | Library handles drag gestures, snap points, momentum | CLAUDE.md `no new prod deps`. Swipe-down dismissal is DEFERRED per CONTEXT.md `<deferred>`. CSS `transform: translateY` + `@keyframes` is sufficient for tap-to-dismiss + Esc + backdrop-tap. |
| Pure CSS `@media (max-width: 960px)` override on `[cmdk-dialog]` | Wrapping the existing `<CommandPalette />` in a new `<MobileCommandPalette />` component | Component-level fork would need `useMediaQuery()` and SSR-flash protection | UI-SPEC.md D-08 + CONTEXT.md "Files not modified by Phase 4: `command-palette.tsx`" — the CSS-only path is the ratified choice. cmdk's attribute selectors are stable public API. |
| Native `<dialog>` element with `.showModal()` for the drawer | `role="dialog"` on a div | `<dialog>` provides built-in focus trap, Esc handling, `inert` for background | Considered: native `<dialog>` is a valid 2026 pattern. Rejected because it would couple the drawer to a different DOM model than `<CommandPalette />` (which uses cmdk's Radix-Dialog wrapper, internally a `<div role="dialog">`); the parallel structure between drawer and palette aids visual + a11y consistency. Worth re-evaluating in Phase 5 if the hand-rolled trap surfaces edge-case bugs. [CITED: web.dev/articles/building/a-dialog-component] |

**Installation:** `npm install` adds nothing. Confirm with `npm ls --depth=0` before/after the phase.

**Version verification:** Skipped — Phase 4 introduces zero new packages.

## Architecture Patterns

### System Architecture Diagram

```
                       ┌──────────────────────────────────────────┐
                       │  ⌘K key / hamburger ☰ tap                │
                       │  prefers-reduced-motion / print intent   │
                       └─────────────────┬────────────────────────┘
                                         │
                                         ▼
       ┌─────────────────────────────────────────────────────────────────┐
       │  app/components/shell/shell-state-provider.tsx (CLIENT)          │
       │  ─ usePalette()  ─ useAccent()  ─ useDrawer() (NEW Phase 4)     │
       │   ├ paletteOpen          (existing)                              │
       │   ├ accentHue            (existing)                              │
       │   └ drawerOpen           (NEW; mutual-exclusion w/ paletteOpen)  │
       └─────┬─────────────────┬──────────────────┬────────────────────┬─┘
             │                 │                  │                    │
             ▼                 ▼                  ▼                    ▼
   ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐
   │  TopBar (CL)    │ │ CommandPalette   │ │ ExplorerDrawer   │ │ Sidebar  │
   │  ─ ☰ button     │ │ (CL, Phase 2)    │ │ (CL, NEW Phase 4)│ │ (CL,     │
   │   aria-expanded │ │ no JS change in  │ │  ─ role="dialog" │ │  Phase 2)│
   │  ─ ⌘K button    │ │  Phase 4         │ │  ─ aria-modal    │ │ display: │
   │  ─ ☼/☾ toggle   │ │  (only CSS @media│ │  ─ focus trap    │ │ none at  │
   │  ─ ↓ resume     │ │   override at    │ │   (~30 LOC)      │ │ <=960px  │
   │     (always vis)│ │   <=960px)       │ │  ─ slide anim    │ │          │
   │                 │ │                  │ │  ─ ROUTES from   │ │          │
   │                 │ │                  │ │   lib/routes.ts  │ │          │
   └─────────────────┘ └──────────────────┘ └──────────────────┘ └──────────┘

       Persistent shell never unmounts ──── route changes update only
       <main>{children}</main>; drawer/palette/sidebar/topbar persist


       ┌─────────────────────── About route only (/) ───────────────────────┐
       │                                                                    │
       │  app/(terminal)/page.tsx (RSC)                                     │
       │   └ <AboutView profile={...} uptime={...} />                       │
       │       ├ H1 + role + bio + cards + CTA row (Phase 3)                │
       │       └ <div class="about-status-mobile">  (NEW Phase 4)           │
       │           └ <StatusBlock uptime tz />        (NEW shared primitive)│
       │              CSS visibility:                                        │
       │                display: none           (>=961px)                    │
       │                display: block          (<=960px)                    │
       │                                                                    │
       └────────────────────────────────────────────────────────────────────┘


       ┌─────────────────── @media print (any route) ───────────────────────┐
       │                                                                    │
       │  HIDE: .topbar, .sidebar, .breadcrumb, .topbar-hamburger,          │
       │        .drawer-backdrop, .drawer-sheet, [cmdk-overlay],            │
       │        [cmdk-dialog], .skip-link, .cursor, .live-clock             │
       │                                                                    │
       │  SHOW: <main> body content (per-route view body)                   │
       │  SHOW: <PrintFooter />  (NEW RSC, always in DOM, hidden off-print) │
       │                                                                    │
       │  STYLE: white bg, black text, serif body, monospace carve-outs     │
       │  PAGINATION: natural flow, page-break-inside:avoid on footer       │
       │                                                                    │
       └────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (Phase 4 additions only)

```
app/
├── (terminal)/
│   └── layout.tsx                                # MODIFIED: mount <ExplorerDrawer/> + <PrintFooter/>
├── components/
│   ├── shell/
│   │   ├── explorer-drawer.tsx                   # NEW client island (6th)
│   │   ├── explorer-drawer.test.tsx              # NEW Vitest spec
│   │   ├── shell-state-provider.tsx              # MODIFIED: add useDrawer() slice
│   │   ├── status-block.tsx                      # NEW RSC primitive (D-14 recommended)
│   │   ├── status-block.test.tsx                 # NEW Vitest spec
│   │   ├── status-tz.tsx                         # NEW tiny client child for tz (D-14)
│   │   ├── top-bar.tsx                           # MODIFIED: insert ☰ button
│   │   ├── top-bar.test.tsx                      # MODIFIED: assert ☰ presence at <=960px (or skip if jsdom)
│   │   ├── sidebar.tsx                           # MODIFIED: replace inline STATUS w/ <StatusBlock/>
│   │   └── command-palette.test.tsx              # MODIFIED: assert keydown still toggles at any viewport
│   ├── print-footer.tsx                          # NEW RSC primitive
│   ├── print-footer.test.tsx                     # NEW Vitest spec
│   └── views/
│       └── about-view.tsx                        # MODIFIED: append <div.about-status-mobile> wrapper
├── globals.css                                   # MODIFIED: append @media (max-width: 960px) + @media print blocks (~150–250 lines)
└── (no other app/ changes)
```

### Pattern 1: `@media (max-width: 960px)` override on cmdk attribute selectors

**What:** Phase 4 wraps the existing `[cmdk-dialog]` and `[cmdk-overlay]` rules in `globals.css` (lines 548–663) with `@media (max-width: 960px) { ... }` blocks that re-anchor the dialog to the viewport bottom and re-shape it as a sheet. The cmdk component itself is unchanged; only its CSS skin changes.

**When to use:** Always for Phase 4's mobile palette. The CONTEXT.md decision is locked.

**Why this works (verified):** cmdk's official documentation explicitly states "Each part of the cmdk component has a specific data-attribute (starting with `cmdk-`) that can be used for styling." [CITED: github.com/dip/cmdk]. The attribute selectors are part of the library's public styling API and are stable across patch releases of `^1.1.1`. The Phase 2 implementation already uses these selectors (lines 548–663 of `globals.css`); Phase 4 simply adds responsive rules that reuse the same selectors. No JS bridging is needed.

**Stable cmdk attribute selectors (used by Phase 4):**

| Selector | Element | Phase 4 mobile override |
|----------|---------|-------------------------|
| `[cmdk-overlay]` | Backdrop | `align-items: flex-end; padding-top: 0;` |
| `[cmdk-dialog]` | Sheet container | `bottom: 0; top: auto; left: 0; right: 0; transform: none; width: 100vw; max-height: 80svh; border-radius: 12px 12px 0 0; animation: drawerSlideIn 200ms ease-out;` |
| `[cmdk-input]` | Search input | `position: sticky; top: 0; background: var(--panel); z-index: 1;` |
| `[cmdk-list]` | Scrollable result list | `max-height: calc(80svh - 64px - 40px); overflow-y: auto;` |
| `[cmdk-item]` | Verb row | `padding: 14px 18px; min-height: 44px; box-sizing: border-box;` |
| `[cmdk-empty]` | "No matches." state | `padding: 24px 18px;` |

**Note on `svh` vs `vh`:** UI-SPEC §"Mobile palette" specifies `80vh`. This research recommends **`80svh`** (small viewport height) — it equals the screen height with all browser chrome visible, so the sheet won't disappear under iOS Safari's URL bar when the bar is showing. `svh` reached cross-browser Baseline in 2025. [CITED: bram.us/2021/07/08/the-large-small-and-dynamic-viewports/]. Browsers without `svh` (very rare in 2026) gracefully fall back to the implicit container height; we can also include the legacy `vh` as a `max-height` fallback above the `svh` rule.

**Source:** [CITED: github.com/dip/cmdk] — README documents `cmdk-` data attributes; existing `globals.css` lines 548–663 prove the selectors work in Phase 2.

### Pattern 2: Hand-rolled focus trap for `ExplorerDrawer` (~30 lines)

**What:** When the drawer opens, focus is trapped inside the sheet via a `keydown` listener that intercepts `Tab` and `Shift+Tab`. On Esc, the drawer closes and focus is restored to the `☰` trigger. On open, focus moves to the first focusable element inside the sheet.

**When to use:** Whenever a `role="dialog" aria-modal="true"` is hand-rolled without a library. Phase 4's `ExplorerDrawer` is the only such component.

**Why hand-rolled (verified):** CLAUDE.md `no new prod deps` rules out `focus-trap` (~4kB gzip) and `focus-trap-react` (component API). The W3C WAI-ARIA Authoring Practices Guide for the dialog modal pattern documents the keyboard requirements: Tab cycles forward (last → first), Shift+Tab cycles backward (first → last), Esc closes, focus returns to trigger. [CITED: w3.org/WAI/ARIA/apg/patterns/dialog-modal/]. A 30-line hand-rolled implementation handles the drawer's flat-list structure (just buttons + a card) without library overhead.

**Verified focusable-element selector pattern:**

```typescript
const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');
```

**Critical pattern: query focusables on EACH keydown, not cached on mount.** The drawer's content is static (7 routes from `lib/routes.ts` + 1 resume button), so caching is technically safe — but the pattern of querying-on-keydown is the resilient default and survives any future drawer addition (e.g. a search input at the top). Search results from the React community emphasize this. [CITED: dev.to/colettewilson/how-i-approach-keyboard-accessibility-for-modals-in-react-152p]

**Skeleton (planner reference):**

```typescript
"use client";
import { useEffect, useRef, useCallback } from "react";

const FOCUSABLE = 'a[href]:not([disabled]),button:not([disabled]),input:not([disabled]):not([type="hidden"]),[tabindex]:not([tabindex="-1"])';

export function ExplorerDrawer() {
  const { drawerOpen, setDrawerOpen } = useDrawer();
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // 1. Capture trigger when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      // Move focus to first focusable inside sheet
      const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      focusables?.[0]?.focus();
    }
  }, [drawerOpen]);

  // 2. Restore focus to trigger when drawer closes
  useEffect(() => {
    if (!drawerOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [drawerOpen]);

  // 3. Tab + Shift+Tab focus trap; Esc to close
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  return (
    <>
      <div
        className="drawer-backdrop"
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />
      <div
        ref={sheetRef}
        className="drawer-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        data-state="open"
      >
        <h2 id="drawer-title" className="sr-only">File explorer</h2>
        {/* EXPLORER header + tree root + 7 route buttons + recruiter card */}
      </div>
    </>
  );
}
```

**Source:** [CITED: w3.org/WAI/ARIA/apg/patterns/dialog-modal/], [CITED: dev.to/colettewilson/how-i-approach-keyboard-accessibility-for-modals-in-react-152p], existing `command-palette.tsx` lines 17–44 (Phase 2's focus-restore pattern, mirrored here).

### Pattern 3: `<StatusBlock />` shared primitive (D-14 recommended)

**What:** Extract the 3-row STATUS markup currently inlined in `sidebar.tsx` lines 86–101 into a shared RSC primitive. Sidebar continues to consume it on desktop; about-view consumes it inside a `<div className="about-status-mobile">` wrapper that's CSS-driven visible only at <=960px on the about route.

**When to use:** Recommended over duplicating the 3-row markup; saves ~30 lines and keeps STATUS contents single-source.

**Why this works:** The STATUS block has two data inputs: `uptime` (RSC-computed via `formatUptime(CAREER_START_DATE, new Date())`, already done in `app/(terminal)/layout.tsx` line 15) and `tz` (client-computed via `Intl.DateTimeFormat().resolvedOptions().timeZone`). The cleanest decomposition keeps `<StatusBlock />` as an RSC and inlines `tz` via a tiny `<StatusTz />` client child:

```typescript
// app/components/shell/status-block.tsx — RSC, no "use client"
import { StatusTz } from "./status-tz";

interface StatusBlockProps {
  uptime: string;
}

export function StatusBlock({ uptime }: StatusBlockProps) {
  return (
    <>
      <div className="sb-section-header sb-status-header">STATUS</div>
      <div className="sb-status">
        <div className="sb-status-row">
          <span className="sb-status-dot" aria-hidden="true">●</span>
          <span>Available for hire</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">uptime:</span>
          <span>{uptime}</span>
        </div>
        <div className="sb-status-row">
          <span className="sb-status-key">tz:</span>
          <StatusTz />
        </div>
      </div>
    </>
  );
}
```

```typescript
// app/components/shell/status-tz.tsx — minimal client island
"use client";
import { useEffect, useState } from "react";

export function StatusTz() {
  const [tz, setTz] = useState("GMT+5 (flex)");
  useEffect(() => {
    try {
      const offset = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT+5 (flex)";
      setTz(`${offset} (flex)`);
    } catch {
      setTz("GMT+5 (flex)");
    }
  }, []);
  return <span>{tz}</span>;
}
```

**Why split tz into its own client island:** SSR renders the fallback `"GMT+5 (flex)"` server-side; the client effect computes the real local timezone and updates after hydration. This avoids hydration mismatch warnings and keeps `<StatusBlock />` as a pure RSC.

**Sidebar refactor:** Replace `sidebar.tsx` lines 86–101 with `<StatusBlock uptime={uptime} />` (the prop is already passed in via `interface SidebarProps { uptime: string }`).

**About-view refactor:** Append after `.about-cta-row`:

```tsx
<div className="about-status-mobile">
  <StatusBlock uptime={uptime} />
</div>
```

The `uptime` prop must be passed from `app/(terminal)/page.tsx` to `<AboutView />`. Currently `app/(terminal)/page.tsx` does not pass `uptime` (Phase 3 about-view doesn't need it). **Phase 4 must wire `uptime` through:** layout already computes it (line 15 of `(terminal)/layout.tsx`); the cleanest path is for `app/(terminal)/page.tsx` to ALSO call `formatUptime(CAREER_START_DATE, new Date())` (Next.js dedupes the call) and pass it to `<AboutView />`. Alternative: use React Context. Recommendation: duplicate the call (5 lines, RSC-friendly, no Context).

### Anti-Patterns to Avoid

- **Display-none orphan (Pitfall 7):** `.sidebar { display: none }` at <=960px without a documented home for every former sidebar element. Phase 4 audits this — every sidebar element MUST have a paired mobile rehome rule. ROADMAP success criterion 4 enforces it.
- **Drawer state in URL or localStorage:** Drawer open/close is transient UI state. Don't persist it. Closing on route change (D-06) is the natural lifecycle.
- **Caching focusables in the drawer focus trap on mount:** Future content additions (search, dynamic routes) would silently break focus trap. Query on each keydown.
- **Reading `usePathname()` inside the drawer to auto-close:** Anti-Pattern 6 in ARCHITECTURE.md. Use the route's onClick handler to dispatch `setDrawerOpen(false)` BEFORE `router.push()`. Or subscribe to pathname change in a child client component (preferred: cleaner, single source of truth).
- **Modifying `command-palette.tsx`:** UI-SPEC §"Files not modified by Phase 4" is explicit. Phase 4 is CSS-only for the palette.
- **Adding new prod deps for "convenience":** `vaul`, `framer-motion`, `focus-trap-react`, `react-focus-lock` — all fine libraries; all violate CLAUDE.md.
- **Using `100vh` on the drawer/palette in 2026:** `vh` doesn't account for iOS Safari's address bar. Use `dvh` (drawer max-height; recalculates as bar slides) or `svh` (palette max-height; stable when bar is showing). UI-SPEC says `vh` — recommend updating.
- **Mounting the drawer outside `app/(terminal)/layout.tsx`:** The shell's persistence guarantee (Pattern 1 of ARCHITECTURE.md) hinges on the drawer mounting inside the route-group layout. Mounting it at root would force every future route into the drawer's client boundary.
- **Using `<aside>` instead of `<nav>` for the drawer:** The drawer is navigation. UI-SPEC §"Semantic role" specifies `role="dialog" aria-modal="true"` (correct for a modal sheet) on the sheet element; the drawer's `<button>` rows still get `aria-label` plain nouns from `route.ariaLabel`.
- **Forgetting `print-color-adjust: economy`:** This is the default; do NOT override to `exact` for our case (we're normalizing to b/w). Setting `exact` would force the browser to print our `--accent-bg` translucent backgrounds, wasting toner.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command palette state machine | Custom keyboard nav, type-to-filter, focus trap | `cmdk` (already shipped Phase 2) | cmdk handles arrow keys, Enter, Esc, type-to-filter, focus trap, Radix dialog semantics. Phase 4 reuses this for free. |
| Theme axis | Custom `data-theme` toggle + localStorage flicker prevention | `next-themes` (already shipped Phase 2) | Pre-paint script, system pref detection, multi-tab sync, hydration mismatch suppression. |
| Tab key handler in drawer (BEYOND focus trap) | Custom Enter-to-activate, Space-to-activate | Native HTML `<button>` elements | Drawer file rows are `<button>` (per Phase 2 sidebar.tsx); browser default already handles Enter + Space activation. We only hand-roll the focus-cycling part of the trap. |
| Accent hue persistence | Custom `localStorage` reader on accent change | `ShellStateProvider`'s existing `setHue()` (Phase 2) | Phase 4 doesn't touch accent — already wired. |
| Bottom-sheet drag/snap-points | Custom touchmove math | (skipped — swipe deferred per CONTEXT.md) | CLAUDE.md no new deps; backdrop tap + Esc cover dismissal. |
| Print PDF generation | Custom HTML→PDF pipeline | Browser's native Cmd+P print dialog + `@media print` CSS | Recruiter prints from their browser. We just style the print rendering. |
| `Intl.DateTimeFormat` timezone parsing | Custom IANA → abbreviation mapping | `new Intl.DateTimeFormat("en", { timeZoneName: "short" })` (already used in `sidebar.tsx` line 36) | Native; correct across DST; same pattern Phase 2 already ships. |

**Key insight:** Phase 4 is mostly CSS, plus one small client island and one tiny RSC. The temptation to add a sheet library or a focus-trap library is real, but the requirements are narrow enough that hand-rolling stays under 50 LOC across all new files combined. CLAUDE.md's `no new prod deps` constraint is not a burden here — it's a forcing function for simplicity.

## Common Pitfalls

### Pitfall 1: `vh` units on the drawer/palette break under iOS Safari address bar

**What goes wrong:** `max-height: 75vh` on the drawer or `max-height: 80vh` on the palette uses the LARGE viewport height (lvh-equivalent) — the height with browser chrome hidden. When iOS Safari's address bar is visible (the default on first load), the sheet extends 50–80px below the visible viewport. The "✕ close" or footer hint at the bottom of the sheet may be unreachable.

**Why it happens:** `vh` was specified before `dvh`/`svh`/`lvh` existed. iOS Safari historically equated `100vh` to the lvh value (chrome-hidden), causing exactly this bug. The whole `dvh`/`svh`/`lvh` family was added to address it.

**How to avoid:** Use `svh` (small viewport height) for sheets that should remain reachable when the address bar is showing. Use `dvh` (dynamic viewport height) for sheets that should adapt as the bar slides. Recommendation: **`80svh` for the palette** (stable; address bar showing is the worst case), **`75dvh` for the drawer** (drawer is often opened mid-scroll where bar may already be hidden — adapting feels right).

```css
/* Phase 4: replace vh with svh/dvh */
.drawer-sheet { max-height: 75dvh; } /* was: 75vh */
[cmdk-dialog]  { max-height: 80svh; } /* was: 80vh */
```

**Browser support (2026):** `svh`/`lvh`/`dvh` reached Baseline Widely Available in June 2025. Chrome 108+, Firefox 101+, Safari 15.4+, Edge 108+. [CITED: zenn.dev/tonkotsuboy_com/articles/svh-dvh-lvh-for-all-browser]

**Warning signs:** On iOS Safari at 375×667, the "↓ resume.pdf" button at the bottom of the open drawer is partially obscured by the address bar.

**Phase to address:** Phase 4 (this phase).

**Severity:** MEDIUM — caught by manual screenshot review (D-20), but easy to miss on desktop-only QA.

### Pitfall 2: Mobile palette keyboard pushes sheet content off-screen on iOS

**What goes wrong:** When the user opens the mobile palette and the search input auto-focuses, iOS shows the soft keyboard. The keyboard pushes the entire viewport up; the bottom-sheet's anchored `bottom: 0` becomes anchored to where 0 USED to be. The result list — and the input itself if the user types and then scrolls — disappears off the bottom of the screen.

**Why it happens:** None of `vh`/`svh`/`lvh`/`dvh` account for the on-screen keyboard. [CITED: medium.com/@tharunbalaji110]. iOS pushes content up via a layout viewport offset that web CSS doesn't directly observe.

**How to avoid:**
- D-08 already pins the search input at the **top** of the sheet via `[cmdk-input] { position: sticky; top: 0; }` — when the keyboard appears, the input remains visible at the top of the sheet.
- The result list will be partially obscured when the keyboard is up. This is acceptable — the user is typing to filter; they're not reading the list deeply. iOS's "Done" button and Android's back gesture dismiss the keyboard, restoring the full sheet.
- DO NOT try to use `visualViewport` API to dynamically resize — adds JS complexity, edge cases on Android Chrome, and CLAUDE.md says no new deps anyway. The CSS-only approach is correct.

**Warning signs:** During manual review on a real iPhone (Phase 4 dry-run), opening the palette and typing makes the input scroll out of view. If the input stays visible (because it's `position: sticky`), the pitfall is mitigated.

**Phase to address:** Phase 4 — D-08's sticky input pinning is the mitigation; this research validates the choice.

**Severity:** LOW — D-08 already mitigates.

### Pitfall 3: Drawer + palette stack on top of each other if mutual exclusion isn't wired

**What goes wrong:** User opens drawer; user presses ⌘K (which on desktop should always work, and on mobile is also tappable). Both modals are now open. Two `role="dialog" aria-modal="true"` elements stacked → focus trap battles, screen reader confusion, z-index conflicts.

**Why it happens:** Naive implementations treat drawer state and palette state as independent. CONTEXT.md "Claude's Discretion" surfaces this risk and recommends mutual exclusion via `ShellStateProvider`.

**How to avoid:** In `ShellStateProvider`, when `setDrawerOpen(true)` is dispatched, also dispatch `PALETTE_CLOSE`. Symmetrically, when `setOpen(true)` (palette) is dispatched, dispatch a drawer-close. This makes mutual exclusion structural, not behavioral.

**WAI-ARIA guidance:** Only one modal dialog should be active at a time. [CITED: w3.org/WAI/ARIA/apg/patterns/dialog-modal/]

**Skeleton (planner reference):**

```typescript
// shell-state-provider.tsx — extended reducer
type ShellAction =
  | { type: "PALETTE_OPEN" }
  | { type: "PALETTE_CLOSE" }
  | { type: "PALETTE_TOGGLE" }
  | { type: "DRAWER_OPEN" }       // NEW
  | { type: "DRAWER_CLOSE" }      // NEW
  | { type: "DRAWER_TOGGLE" }     // NEW
  | { type: "SET_HUE"; hue: string };

function shellReducer(state: ShellState, action: ShellAction): ShellState {
  switch (action.type) {
    case "PALETTE_OPEN":   return { ...state, paletteOpen: true,  drawerOpen: false };
    case "PALETTE_TOGGLE": return state.paletteOpen
                                  ? { ...state, paletteOpen: false }
                                  : { ...state, paletteOpen: true, drawerOpen: false };
    case "DRAWER_OPEN":    return { ...state, drawerOpen: true,  paletteOpen: false };
    case "DRAWER_TOGGLE":  return state.drawerOpen
                                  ? { ...state, drawerOpen: false }
                                  : { ...state, drawerOpen: true, paletteOpen: false };
    // ... rest unchanged
  }
}
```

**Warning signs:** Backdrop tap on drawer doesn't close palette, or backdrop tap on palette doesn't close drawer, or both backdrops visible simultaneously.

**Phase to address:** Phase 4.

**Severity:** MEDIUM — visible bug if mutual exclusion is missed, but easy to fix.

### Pitfall 4: Print stylesheet leaks backgrounds/colors via `print-color-adjust: exact`

**What goes wrong:** Developer adds `print-color-adjust: exact` (or its WebKit alias) to ensure brand colors print, expecting "what I see is what gets printed." On a recruiter's grayscale office printer, the result is dark backgrounds rendered as splotchy gray, making text harder to read.

**Why it happens:** `print-color-adjust` defaults to `economy`, which gives the browser permission to optimize for paper (drop bg colors, normalize to high-contrast). Setting `exact` overrides this. Phase 4 normalizes to white bg / black text — `exact` would force `var(--bg)` (dark theme) or `var(--accent-bg)` (translucent accent) onto paper.

**How to avoid:** Do NOT set `print-color-adjust: exact` anywhere in Phase 4. The default `economy` plus our explicit `background: #fff !important; color: #000 !important;` rules are correct. [CITED: developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust]

**Warning signs:** Print preview shows shaded backgrounds where text sits.

**Phase to address:** Phase 4.

**Severity:** LOW — easy to avoid by not setting it. UI-SPEC doesn't mention it (correctly).

### Pitfall 5: Animation slide via `transform` doesn't respect `prefers-reduced-motion`

**What goes wrong:** Drawer uses `@keyframes drawerSlideIn { from { transform: translateY(100%); } }`. The `prefers-reduced-motion: reduce` block sets `animation: none`, but the backdrop's `opacity 0 → 0.5` `transition` is left intact. User who's vestibular-sensitive still sees a 200ms backdrop fade — small, but motion is motion.

**Why it happens:** Developers think "I disabled the animation" and forget that `transition` is a different property. Both must be addressed.

**How to avoid:** UI-SPEC §"Reduced-motion variant" already gets this right:

```css
@media (prefers-reduced-motion: reduce) {
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] { animation: none; }
  .drawer-backdrop { transition: none; }
  [cmdk-dialog] { animation: none; } /* mobile palette slide */
}
```

This research's contribution: confirmed that `animation: none` and `transition: none` are BOTH needed and they target different properties. Web.dev's "prefers-reduced-motion" guide and CSS-Tricks both emphasize this. [CITED: web.dev/articles/prefers-reduced-motion], [CITED: css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/]

**Best practice nuance (2026):** "Replace, don't remove" — instead of `animation: none`, use `animation: fadeIn 80ms ease-out` (a tiny fade) for users with reduced-motion. Phase 4 chooses `none` for simplicity and per CONTEXT.md "Claude's Discretion: Drawer animation timing — slide-in from bottom ~200ms ease-out. `prefers-reduced-motion` block disables the slide, fades only." Note: CONTEXT.md actually says "fades only" — so the simpler `animation: none` AND `transition: none` is the documented choice. Resolved: do `animation: none` + `transition: none` (matches UI-SPEC).

**Warning signs:** macOS System Settings → Accessibility → Reduce motion ON; reload; drawer open/close still animates.

**Phase to address:** Phase 4 (defensive baseline). Comprehensive `prefers-reduced-motion` audit is Phase 5 (A11Y-03).

**Severity:** LOW — UI-SPEC already correct; this research validates.

### Pitfall 6: Drawer auto-close on route change races React's setState

**What goes wrong:** D-06 says drawer auto-closes on route change. Naive impl: in the row click handler, call `setDrawerOpen(false)` THEN `router.push(route.pathname)`. If the navigation triggers an unmount before React commits the close, the next mount may show the drawer still "open" (visual flash).

**How to avoid:** Two safe patterns —

1. **Subscribe to pathname change in the drawer:** A `useEffect` with `usePathname()` as dependency that calls `setDrawerOpen(false)` whenever pathname changes. The drawer is the consumer of "current route"; it closes itself.

```typescript
const pathname = usePathname();
const closedAtRef = useRef<string | null>(null);
useEffect(() => {
  if (closedAtRef.current !== pathname) {
    setDrawerOpen(false);
    closedAtRef.current = pathname;
  }
}, [pathname, setDrawerOpen]);
```

2. **Close BEFORE navigating:** `onClick={() => { setDrawerOpen(false); router.push(route.pathname); }}` — React batches the state update; navigation happens in the same event loop tick. This works in practice for App Router because Next.js's `router.push` is async and React commits the close before the navigation completes the unmount cycle.

CONTEXT.md says "Planner picks cleanest approach." Recommendation: **option 1** (subscribe to pathname) — single source of truth, handles backward/forward navigation, robust to keyboard activation paths.

**Source:** ARCHITECTURE.md Pattern 4 + Anti-Pattern 6 — the URL is the source of truth; client UI subscribes.

**Severity:** LOW — both patterns work; pattern 1 is more robust.

### Pitfall 7: `<PrintFooter />` `display: none` cascade hides it from `@media print` too

**What goes wrong:** Naive impl adds `.print-footer { display: none; }` at the top of `globals.css`, then later `@media print { .print-footer { display: block; } }`. Specificity-wise both are equal, but the print rule comes later — should win. BUT: if the developer adds another `display: none` rule later (e.g., in a per-route stylesheet) that has higher specificity (`.terminal-main .print-footer { display: none; }`), it leaks into the print context.

**How to avoid:** Use `!important` on the print-show rule (UI-SPEC already does this: `display: block !important;`). And keep all print rules in a single `@media print { ... }` block at the END of `globals.css` — UI-SPEC D-15 / CONTEXT.md "Specifics" already mandates this.

**Warning signs:** Print preview doesn't show the URL+email footer.

**Phase to address:** Phase 4.

**Severity:** LOW — UI-SPEC already correct.

## Code Examples

### Example 1: `@media (max-width: 960px)` block append target (last lines of `globals.css`)

```css
/* ─────────────────────────────────────────
   Phase 4: Mobile responsive (<=960px)
   ───────────────────────────────────────── */

@media (max-width: 960px) {
  /* Sidebar collapse — paired with drawer rehome (Pitfall 7 audit passes) */
  .sidebar { display: none; }

  /* Main content padding tighter on mobile */
  .terminal-main {
    padding: 24px 16px 64px;
    max-width: 100%;
  }
  .terminal-body {
    grid-template-columns: 1fr;  /* sidebar hidden; main fills */
  }

  /* Hamburger trigger — visible only on mobile */
  .topbar-hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Touch target enforcement — WCAG 2.5.5 (44×44 enhanced AAA) */
  .topbar-btn {
    padding: 10px 12px;  /* up from 4px 10px → ~44px tall */
    min-height: 44px;
    box-sizing: border-box;
  }

  /* Drawer file row override (used inside ExplorerDrawer; same .sb-item class reused) */
  .drawer-sheet .sb-item {
    padding: 14px 16px;
    min-height: 44px;
  }

  /* Mobile palette form-factor swap */
  [cmdk-overlay] {
    align-items: flex-end;
    padding-top: 0;
  }
  [cmdk-dialog] {
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    transform: none;
    width: 100vw;
    max-width: 100vw;
    max-height: 80svh;          /* prefer svh; falls back to lvh on legacy browsers */
    border-radius: 12px 12px 0 0;
    animation: drawerSlideIn 200ms ease-out;
  }
  [cmdk-input] {
    position: sticky;
    top: 0;
    background: var(--panel);
    z-index: 1;
  }
  [cmdk-list] {
    max-height: calc(80svh - 64px - 40px);
    overflow-y: auto;
  }
  [cmdk-item] {
    padding: 14px 18px;
    min-height: 44px;
    box-sizing: border-box;
  }
  [cmdk-empty] {
    padding: 24px 18px;
  }

  /* About-view STATUS visibility */
  .about-status-mobile {
    display: block;
  }
}

/* Hamburger button base styling — hidden on desktop */
.topbar-hamburger {
  display: none;  /* shown by @media (max-width: 960px) above */
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  margin-right: 8px;
}
.topbar-hamburger:hover {
  background: var(--panel-hi);
}
.topbar-hamburger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Drawer surfaces */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 89;
  background: rgba(0, 0, 0, 0.5);
  animation: drawerBackdropFadeIn 200ms ease-out;
}
.drawer-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  height: fit-content;
  max-height: 75dvh;            /* prefer dvh; recalculates as iOS bar slides */
  overflow-y: auto;
  background: var(--panel);
  border-top: 1px solid var(--border);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.3);
  padding: 20px 0;
  /* Tablet portrait centers the sheet narrower */
}
@media (min-width: 768px) and (max-width: 960px) {
  .drawer-sheet {
    max-width: 480px;
    margin: 0 auto;
    border-radius: 12px 12px 0 0;
  }
}
.drawer-sheet[data-state="open"] {
  animation: drawerSlideIn 200ms ease-out;
}

@keyframes drawerSlideIn {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
@keyframes drawerBackdropFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* About-view STATUS wrapper — hidden by default */
.about-status-mobile {
  display: none;
  margin-top: 24px;
  padding: 16px 16px 0;
  border-top: 1px solid var(--border);
}

/* Reduced-motion: disable slide + fade for new Phase 4 motion */
@media (prefers-reduced-motion: reduce) {
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] { animation: none; }
  .drawer-backdrop { animation: none; transition: none; }
  [cmdk-dialog] { animation: none; }
}

/* ─────────────────────────────────────────
   Phase 4: Print stylesheet (A11Y-09)
   ───────────────────────────────────────── */

.print-footer {
  display: none;
}

@media print {
  /* Hide all interactive chrome */
  .topbar,
  .sidebar,
  .breadcrumb,
  .topbar-hamburger,
  .drawer-backdrop,
  .drawer-sheet,
  [cmdk-overlay],
  [cmdk-dialog],
  .skip-link,
  .cursor,
  .live-clock {
    display: none !important;
  }

  @page {
    margin: 0.75in;
  }

  html, body {
    background: #fff !important;
    color: #000 !important;
  }
  body {
    font-family: Georgia, "Times New Roman", serif !important;
  }

  /* Code-content keeps mono so JSON/commands stay legible */
  .stack-pre,
  .prompt-line .prompt-cmd,
  .prompt-line .prompt-dollar,
  .tech-chip,
  .exp-hash,
  .stack-key,
  .stack-string,
  .stack-punct {
    font-family: var(--font-mono), ui-monospace, "SF Mono", "Cascadia Mono", monospace !important;
  }

  /* Disable all motion */
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }

  /* Layout: full-bleed on paper */
  .terminal-shell { display: block !important; }
  .terminal-main {
    max-width: 100% !important;
    padding: 0 !important;
  }

  /* Tonal hierarchy on b/w paper */
  .about-card-value,
  .stack-string,
  .exp-role,
  .writing-title,
  .contact-link,
  .btn,
  .sb-status-dot {
    color: #000 !important;
  }
  .about-card-label,
  .about-meta,
  .stack-punct,
  .stack-key,
  .exp-hash,
  .exp-period,
  .writing-meta,
  .contact-label,
  .sb-status-key {
    color: #333 !important;
  }
  .stack-pre,
  .about-card,
  .contact-card,
  .projects-row,
  .exp-row,
  .writing-row,
  .shipped-row {
    border-color: #999 !important;
  }

  /* Print footer reveal */
  .print-footer {
    display: block !important;
    margin-top: 32px;
    padding-top: 8px;
    border-top: 1px solid #999;
    font-size: 10pt;
    color: #333 !important;
    page-break-inside: avoid;
    text-align: center;
  }

  /* Defensive: shell footer never splits */
  .shell-footer {
    page-break-inside: avoid;
  }
}
```

### Example 2: `<PrintFooter />` RSC

```typescript
// app/components/print-footer.tsx — RSC, no "use client"
import { PROFILE } from "@/lib/portfolio-data";

export function PrintFooter() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Strip protocol for cleaner print copy: "https://bakytbek.dev" → "bakytbek.dev"
  const display = siteUrl.replace(/^https?:\/\//, "");
  return (
    <aside className="print-footer" aria-hidden="true">
      {display} · {PROFILE.email}
    </aside>
  );
}
```

Mount inside `app/(terminal)/layout.tsx`:

```tsx
import { PrintFooter } from "@/app/components/print-footer";

// ... existing layout ...
return (
  <>
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <TopBar />
    <div className="terminal-body">
      <Sidebar uptime={uptime} />
      <main id="main-content" tabIndex={-1} className="terminal-main">
        <Breadcrumb />
        <div className="content-block">{children}</div>
        <footer className="shell-footer">{/* unchanged */}</footer>
      </main>
    </div>
    <CommandPalette />
    <ExplorerDrawer />        {/* NEW Phase 4 */}
    <PrintFooter />           {/* NEW Phase 4 — last, outside flex layout */}
  </>
);
```

### Example 3: TopBar `☰` insertion

```tsx
// app/components/shell/top-bar.tsx — additive change at the top of the JSX
"use client";
import { useDrawer } from "@/app/components/shell/shell-state-provider"; // NEW slice
// ... existing imports ...

export function TopBar() {
  const { drawerOpen, toggle: toggleDrawer } = useDrawer();
  // ... existing palette / theme hooks ...

  return (
    <header className="topbar">
      {/* NEW Phase 4: hamburger drawer trigger — visible only at <=960px */}
      <button
        className="topbar-hamburger"
        onClick={toggleDrawer}
        aria-label="Open file explorer"
        aria-expanded={drawerOpen}
        aria-controls="drawer-sheet"
      >
        ☰
      </button>

      {/* Existing traffic dots, path label, spacer, ⌘K, theme, clock, resume — unchanged */}
      ...
    </header>
  );
}
```

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact for Phase 4 |
|--------------|-------------------------|--------------|--------------------|
| `100vh` for full-viewport sheets | `100dvh` / `100svh` / `100lvh` | Viewport units reached cross-browser Baseline June 2025 | Phase 4 should use `dvh`/`svh` instead of UI-SPEC's `vh`. Surgical CSS change. [CITED: web.dev/blog/baseline-newly-available-dynamic-viewport-units] |
| `focus-trap` library (4kB gzip) | Native `<dialog>` element with `.showModal()` | Native dialog Baseline May 2022 | Considered for Phase 4 drawer; rejected to keep parity with cmdk's Radix-Dialog (also a div with `role="dialog"`). Hand-rolled trap is fine here. |
| `100vh` + JS resize listener for iOS bar | `dvh` (no JS) | 2025 | Same as row 1 — pure CSS suffices. |
| WCAG 2.1 (no target-size criterion at AA) | WCAG 2.2 introduces 2.5.8 Target Size Minimum (24×24 AA) | WCAG 2.2 published October 2023 | Phase 4 commits to 44×44 (2.5.5 enhanced AAA), exceeding the 2.5.8 minimum. [CITED: w3.org/WAI/WCAG22/Understanding/target-size-minimum.html] |
| `prefers-reduced-motion` "remove all animation" | "Replace, don't remove" — softer, shorter animation for reduced-motion | 2024 best-practice consensus | Phase 4 uses `animation: none` per CONTEXT.md (simpler); full audit deferred to Phase 5 may revisit per-keyframe. |
| `-webkit-print-color-adjust` only | `print-color-adjust` (unprefixed) cross-browser | Firefox 97+, Safari 15.4+ shipped 2022 | Phase 4 uses default `economy` — does NOT need to set the property at all. |

**Deprecated / outdated for Phase 4:**

- **`100vh`** — replaced by `dvh`/`svh`/`lvh`. Don't use bare `vh` for new mobile sheet sizing.
- **`-webkit-print-color-adjust: exact`** — was needed for Chrome before 2022; unprefixed `print-color-adjust` is now standard. Phase 4 doesn't set either (we want the default `economy`).
- **`page-break-*` properties** — superseded by `break-before` / `break-after` / `break-inside` (CSS Fragmentation Module). Both still work in 2026; UI-SPEC uses `page-break-inside: avoid` (the legacy form) — fine, all browsers accept it. No action needed.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `[cmdk-dialog]` / `[cmdk-overlay]` / `[cmdk-input]` / `[cmdk-list]` / `[cmdk-item]` / `[cmdk-empty]` attribute selectors are stable in cmdk `^1.1.1` and won't break with patch releases | Pattern 1 / Standard Stack | LOW — they're documented public styling hooks; verified by Phase 2 already using them in `globals.css` lines 548–663. Even so, the planner should `npm ls cmdk` after install to confirm version. |
| A2 | `dvh` and `svh` work in iOS Safari 15.4+, which is the target for "modern Safari" in 2026 | §"Pitfall 1" / Pattern 1 | LOW — Baseline Widely Available June 2025. Browsers below 15.4 (~3% market in 2026) fall back; `vh` is the implicit fallback. |
| A3 | The hand-rolled focus trap pattern (query focusables on each keydown) handles all drawer interactions correctly | Pattern 2 | LOW — drawer content is static (7 buttons + recruiter card + 1 download anchor); the pattern is well-validated by W3C APG. Manual screen-reader testing on VoiceOver during the manual review wave is the verification. |
| A4 | Default `print-color-adjust: economy` plus our explicit `background: #fff !important; color: #000 !important;` rules suffice for the print contract | §"Pitfall 4" / Code Example 1 | LOW — print preview review per Phase 4 D-20 is the verification; rule normalization is exhaustive in the Code Example. |
| A5 | `process.env.NEXT_PUBLIC_SITE_URL` is wired and accessible at SSR/build time for `<PrintFooter />` | Code Example 2 | LOW — Phase 1 INFRA-04 + ROUTE-03 already wired this; verified at `app/sitemap.ts` and `app/robots.ts` which already use it. |
| A6 | The drawer's pathname-subscription auto-close (Pattern 6) doesn't fight Next.js's prefetch behavior | §"Pitfall 6" | LOW — `usePathname()` updates on commit, not on prefetch; the close fires after navigation completes. |
| A7 | Hand-rolling avoids `focus-trap-react` and `vaul` correctly; the resulting drawer is < 50 LOC and does not regress focus-trap-test coverage | Standard Stack alternatives | LOW — assumes planner follows Pattern 2 skeleton. Plan-checker can grep for `focus-trap` in package.json after the phase. |
| A8 | The mobile palette behavior at <=960px is verifiable via Vitest at the component-state level (open/close, keydown, focus restore), even though jsdom doesn't fire `@media` queries | §"Validation Architecture" | LOW — UI-SPEC D-20 explicitly acknowledges jsdom limitation; manual screenshot review covers visual @media validation. |
| A9 | The drawer needs to be mounted at all viewports (CSS `display: none` at >=961px) rather than conditionally rendered via `useMediaQuery` | UI-SPEC §"Visibility" | LOW — matches the cmdk pattern for the palette (always mounted, CSS shows/hides); ensures SSR consistency and avoids hydration mismatch warnings. |

**No HIGH-risk assumptions remain.** All claims tagged `[ASSUMED]` are LOW-risk, verifiable during execution, and have explicit mitigation paths.

## Open Questions

1. **Should the drawer have an explicit "✕ close" button in the top-right of the sheet, or rely on backdrop tap + Esc?**
   - What we know: UI-SPEC §"Dismiss methods" lists the explicit close button as "optional"; backdrop tap and Esc are mandatory.
   - What's unclear: Does the recruiter audience (less keyboard-fluent, may not realize they can tap the backdrop) need an explicit close affordance for usability?
   - Recommendation: **Skip the close button.** The recruiter primary path is "tap a row to navigate" (which auto-closes). Engineers know to tap-outside or press Esc. UI-SPEC's recommendation aligns. Plan-checker note: if 5-second recruiter dry-run shows confusion, add the button as Phase 4 polish.

2. **Drawer mount location: inside `app/(terminal)/layout.tsx` (sibling to `<CommandPalette />`) or inside `<TopBar />`?**
   - What we know: Both work; CONTEXT.md "Integration Points" says "either `(terminal)/layout.tsx` or inside `<TopBar>` — planner decides."
   - What's unclear: Coupling tradeoff. Mounting in TopBar keeps the trigger and sheet co-located (cohesion); mounting in the layout matches the `<CommandPalette />` precedent.
   - Recommendation: **Mount in `(terminal)/layout.tsx`** as a sibling to `<CommandPalette />`. Matches the established pattern, isolates drawer from TopBar's render cycle (TopBar re-renders on every theme/palette state change; drawer doesn't need to).

3. **`<StatusBlock />` location — `app/components/shell/` or `app/components/primitives/`?**
   - What we know: Both directories exist; `shell/` holds client islands, `primitives/` holds RSC primitives.
   - What's unclear: `<StatusBlock />` is RSC-only (with a tiny client child for `tz`). It's "shell-related" but it's also a primitive.
   - Recommendation: **`app/components/shell/status-block.tsx`** — semantic locality (it lives within the shell's responsibility); the `tz` client island goes alongside it as `app/components/shell/status-tz.tsx`.

4. **`<PrintFooter />` location — `app/components/print-footer.tsx` or `app/components/primitives/print-footer.tsx`?**
   - What we know: Print is a cross-cutting concern, not specific to the shell or to a view.
   - Recommendation: **`app/components/print-footer.tsx`** at the top level of `components/` — it's neither shell nor view nor primitive, but a layout-level component. Mirrors the convention of small one-off concerns.

5. **Does the Phase 4 mobile palette need to verify a hint footer adjustment (`tap outside to close` vs `↵ select · esc close`)?**
   - What we know: UI-SPEC says "planner picks at execution"; the desktop hint references Esc which mobile keyboards lack.
   - Recommendation: **Keep `↵ select · esc close` as-is.** Engineers tapping ⌘K know what Esc means; mobile recruiters who tap the trigger probably won't read the footer at all (their attention is on the search input). Backdrop-tap is the universal close path; no copy change needed.

These are minor execution-time questions; none block planning.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 22.x | Build, dev, test | ✓ | (per package.json `engines.node`) | — |
| npm | Build pipeline | ✓ | n/a | — |
| Next.js 15.5.x | RSC, App Router | ✓ | `^15.5.15` | — |
| React 19.1 | Client islands, hooks | ✓ | `19.1.0` | — |
| cmdk 1.1 | Mobile palette CSS overrides only | ✓ | `^1.1.1` | — |
| next-themes 0.4.6 | Theme axis (Phase 2; Phase 4 doesn't touch) | ✓ | `^0.4.6` | — |
| Vitest 3.1 | Unit tests | ✓ | `3.1.4` | — |
| @testing-library/user-event 14.6 | Drawer keyboard tests | ✓ | `^14.6.1` | — |
| jsdom 26.1 | Test browser env | ✓ | `26.1.0` | — |
| TypeScript 5.8 | Strict typing | ✓ | `5.8.3` | — |
| Browser print dialog | Manual print preview review | ✓ (any modern browser) | n/a | — |
| iOS Safari ≥15.4 (or simulator) | Manual `dvh`/`svh` validation, drawer iOS-keyboard test | ✓ (assumed dev has Mac + Safari OR access to BrowserStack/iOS sim) | — | If unavailable, fall back to Chrome DevTools 375px responsive mode + Lighthouse mobile profile; flag any iOS-specific behavior for Phase 7 production-device test. |
| `axe-core` / `@axe-core/playwright` | Contrast audit | ✗ | — | Phase 5 will install and run; Phase 4 manual review uses browser DevTools accessibility panel. |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** axe-core (deferred to Phase 5 by design; not in scope for Phase 4).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 + @testing-library/react 16.2.0 + jsdom 26.1.0 + @testing-library/user-event 14.6.1 |
| Config file | `vitest.config.ts` (existing; jsdom env, `@/*` alias, setup at `vitest.setup.ts`) |
| Quick run command | `npm test` (runs `vitest run` once; CI-style) |
| Full suite command | `npm test` (same — Phase 4 doesn't introduce a separate full-suite command) |
| Watch mode | `npx vitest` (interactive) — used during dev only |

Existing Phase 2/3 test files cover shell, palette, theme/accent, view smoke. Phase 4 adds 4 new spec files (drawer, status-block, print-footer, top-bar-mobile) and extends 1 existing (palette mobile-toggle).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **MOBILE-01** | Sidebar collapses below 960px and contents have documented mobile homes (Pitfall 7 audit) | Static analysis | `grep -E "display:\s*none" app/globals.css` and `grep -A3 "\.sidebar.*display: none" app/globals.css` paired with audit checklist | ❌ Wave 0 (audit script in `scripts/check-sidebar-redistribution.mjs` — see Wave 0 Gaps) |
| **MOBILE-01** | `.sidebar { display: none }` is paired with paired rehome rules (`.about-status-mobile { display: block }`, `.topbar-hamburger { display: inline-flex }`, `.drawer-sheet { display: ... }`) within the same `@media (max-width: 960px)` block | Static analysis | `node scripts/check-sidebar-redistribution.mjs` | ❌ Wave 0 |
| **MOBILE-02** | Drawer opens when `☰` is clicked | Unit (component-level) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "opens on hamburger click"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer focus traps within sheet (Tab/Shift-Tab cycle first ↔ last) | Unit (user-event) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "traps focus"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer closes on Esc and restores focus to `☰` trigger | Unit (user-event) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "esc closes and restores focus"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer closes on backdrop tap | Unit (user-event) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "backdrop click closes"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer closes on file-row click (auto-close on route change) | Unit (user-event) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "closes on file row navigation"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer file row touch target >= 44px (CSS-asserted via `min-height` rule presence) | Static analysis | `grep -A2 "\.drawer-sheet \.sb-item" app/globals.css \| grep "min-height: 44px"` | ❌ Wave 0 |
| **MOBILE-02** | `[cmdk-item]` mobile padding produces 44px row | Static analysis | `grep -A3 "@media (max-width: 960px)" app/globals.css \| grep -A1 "\[cmdk-item\]" \| grep "44px"` | ❌ Wave 0 |
| **MOBILE-02** | Drawer renders 7 routes from `lib/routes.ts` + recruiter card | Unit (DOM presence) | `npx vitest run app/components/shell/explorer-drawer.test.tsx -t "renders 7 routes"` | ❌ Wave 0 |
| **MOBILE-02** | Hamburger has `aria-label="Open file explorer"` and toggles `aria-expanded` | Unit | `npx vitest run app/components/shell/top-bar.test.tsx -t "hamburger aria-expanded toggles"` | ⚠️ Extends existing `top-bar.test.tsx` (Wave 0 augment) |
| **MOBILE-03** | About-view CTA row contains a resume `↓ resume.pdf` affordance (above the fold at 375px) | Unit (DOM presence) | `npx vitest run app/components/views/about-view.test.tsx -t "renders resume CTA"` | ⚠️ Extends existing about-view smoke spec |
| **MOBILE-03** | Top-bar resume button is in DOM at every viewport (jsdom CSS doesn't filter — assert via DOM presence) | Unit (existing Phase 2 test) | (already covered by Phase 2 TEST-02 top-bar test) | ✅ |
| **MOBILE-03** | Manual: at 375×667 viewport on `/`, resume CTA visible without scrolling | **Manual (screenshot)** | (no automation) | n/a (manual gate) |
| **MOBILE-04** | `<StatusBlock />` renders 3 rows with availability dot, uptime prop, tz | Unit | `npx vitest run app/components/shell/status-block.test.tsx` | ❌ Wave 0 |
| **MOBILE-04** | About-view RSC includes `<div class="about-status-mobile"><StatusBlock /></div>` after CTA row | Unit (DOM presence) | `npx vitest run app/components/views/about-view.test.tsx -t "renders mobile status block"` | ⚠️ Extends existing about-view smoke spec |
| **MOBILE-04** | Sidebar still renders STATUS via `<StatusBlock />` (no regression at >=961px) | Unit (DOM presence) | `npx vitest run app/components/shell/sidebar.test.tsx -t "renders status block"` | ⚠️ Extends existing sidebar test (must update if STATUS markup moves into `<StatusBlock />`) |
| **MOBILE-04** | Manual: at 375px on `/`, STATUS visible near bottom of about-view body | **Manual (screenshot)** | (no automation) | n/a (manual gate) |
| **MOBILE-04** | Manual: at 375px on `/projects` and other 5 non-about routes, STATUS NOT rendered | **Manual (screenshot)** | (no automation) | n/a (manual gate) |
| **MOBILE-04** | Manual: at 1024px (desktop), sidebar still shows STATUS, about-view does NOT show duplicate STATUS | **Manual (screenshot)** | (no automation) | n/a (manual gate) |
| **MOBILE-05** | (Subsumed by PALETTE-05; no separate test) | n/a | n/a | n/a |
| **PALETTE-05** | ⌘K still toggles palette at any viewport (component state machine survives mobile CSS overrides) | Unit | `npx vitest run app/components/shell/command-palette.test.tsx -t "toggle still fires"` | ⚠️ Extends existing palette test |
| **PALETTE-05** | Mobile palette CSS overrides hit `[cmdk-dialog]` / `[cmdk-overlay]` / `[cmdk-input]` / `[cmdk-list]` / `[cmdk-item]` selectors within `@media (max-width: 960px)` | Static analysis | `grep -A30 "@media (max-width: 960px)" app/globals.css \| grep -E "\[cmdk-(dialog\|overlay\|input\|list\|item)\]"` (must hit ≥5 selectors) | ❌ Wave 0 (audit script `scripts/check-mobile-palette-css.mjs`) |
| **PALETTE-05** | Manual: at 375px, palette opens as bottom-sheet anchored to viewport bottom; search input is sticky at top of sheet; type-to-filter narrows results | **Manual (screenshot + interaction)** | (no automation) | n/a (manual gate) |
| **A11Y-09** | `<PrintFooter />` renders site URL + email separated by ` · ` | Unit | `npx vitest run app/components/print-footer.test.tsx -t "renders url and email"` | ❌ Wave 0 |
| **A11Y-09** | `<PrintFooter />` falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset | Unit | `npx vitest run app/components/print-footer.test.tsx -t "fallback url"` | ❌ Wave 0 |
| **A11Y-09** | `@media print` block hides `.topbar`, `.sidebar`, `.breadcrumb`, drawer chrome, `[cmdk-overlay]`, `[cmdk-dialog]`, `.skip-link`, `.cursor`, `.live-clock` | Static analysis | `grep -A50 "@media print" app/globals.css \| grep -E "(topbar\|sidebar\|breadcrumb\|drawer\|cmdk-overlay\|cmdk-dialog\|skip-link\|cursor\|live-clock).*display: none" -c` (must hit ≥10 selectors) | ❌ Wave 0 (audit script `scripts/check-print-rules.mjs`) |
| **A11Y-09** | `@media print` block sets `body { font-family: Georgia, ..., serif }` | Static analysis | `grep -A2 "@media print" app/globals.css \| grep "Georgia"` | ❌ Wave 0 |
| **A11Y-09** | `@media print` block sets monospace carve-outs for `.stack-pre`, `.prompt-line .prompt-cmd`, `.tech-chip`, etc. | Static analysis | `grep -A5 "stack-pre" app/globals.css \| grep "var(--font-mono)"` (within @media print scope) | ❌ Wave 0 |
| **A11Y-09** | `@media print` block contains `page-break-inside: avoid` on `.print-footer` and `.shell-footer` | Static analysis | `grep "page-break-inside: avoid" app/globals.css \| wc -l` (must be ≥2) | ❌ Wave 0 |
| **A11Y-09** | Manual: print preview on `/` shows white bg, black text, serif body, URL+email footer at end, no top-bar/sidebar/drawer/palette artifacts | **Manual (Cmd+P preview)** | (no automation) | n/a (manual gate) |
| **A11Y-09** | Manual: print preview on `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` — same pass for each (6 routes × 1 preview each) | **Manual (Cmd+P preview, 6 routes)** | (no automation) | n/a (manual gate) |

**Total automation surface:** 21 unit/static checks. **Total manual gates:** 9 (5-second recruiter dry-run, 5 viewport screenshots × ~3 routes each, 7 print previews).

### Items That Can ONLY Be Verified Manually

These cannot be automated in jsdom or via static grep; VALIDATION.md must capture them as explicit manual gates:

1. **Visual rendering at <=960px:** Drawer slides up from bottom; mobile palette anchored to bottom; sheet height respects 75dvh / 80svh; `prefers-reduced-motion: reduce` disables slide; iOS Safari address bar doesn't obscure sheet bottom.
2. **Touch target feel:** 44×44 minimum is verifiable via CSS grep, but "feels tappable on a finger" requires a real-device or simulator pass.
3. **5-second recruiter dry-run on 375px localhost:** Hand the URL to a non-engineer; time-to-resume + time-to-contact discovery.
4. **Print preview legibility on all 7 routes:** White bg + black text + serif body + URL+email footer + no chrome leakage. Per route × 7.
5. **Real-device iOS Safari validation:** Drawer + mobile palette + soft keyboard interaction; `dvh`/`svh` confirmed not to clip sheet.
6. **Real-device Android Chrome validation:** Same as iOS, different render engine.
7. **STATUS visibility audit across viewports:** STATUS visible only on `/` at <=960px AND only in sidebar at >=961px (no double-render).
8. **TopBar resume button persistence at 375px:** Visible above the fold without scrolling on `/`.
9. **`prefers-reduced-motion` system-setting verification:** macOS System Settings → Reduce motion ON; reload; drawer + palette open without slide.

### Sampling Rate

- **Per task commit:** `npm test` (full Vitest suite — Phase 4 spec count is small, ~7 new specs, runs in <5s).
- **Per wave merge:** `npm test && npm run lint && npm run typecheck && node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs` — full automated battery.
- **Phase gate:** Full battery green + manual screenshot review (375 / 768 / 1024 across about / projects / experience / contact) + print preview on all 7 routes + 5-second recruiter dry-run on 375px localhost.

### Wave 0 Gaps

Files / scripts that must exist before Phase 4 implementation can be tested:

- [ ] `app/components/shell/explorer-drawer.test.tsx` — covers MOBILE-02 (drawer behavior + focus trap + Esc + backdrop + auto-close-on-nav + 7 routes)
- [ ] `app/components/shell/status-block.test.tsx` — covers MOBILE-04 (3-row render with uptime + tz)
- [ ] `app/components/print-footer.test.tsx` — covers A11Y-09 (URL + email + fallback)
- [ ] `app/components/views/about-view.test.tsx` extension — covers MOBILE-04 (mobile-status DOM presence)
- [ ] `app/components/shell/top-bar.test.tsx` extension — covers MOBILE-02 (hamburger present in DOM, aria-expanded toggles)
- [ ] `app/components/shell/command-palette.test.tsx` extension — covers PALETTE-05 (toggle still fires; component state machine intact)
- [ ] `app/components/shell/sidebar.test.tsx` update — STATUS extraction may shift the assertion from inline markup to `<StatusBlock />` presence
- [ ] `scripts/check-sidebar-redistribution.mjs` — Pitfall 7 audit script (greps `globals.css` for `.sidebar { display: none }` and asserts paired rehome rules exist)
- [ ] `scripts/check-print-rules.mjs` — A11Y-09 audit script (greps `@media print` block for hide-rules + serif body + mono carve-outs + page-break)
- [ ] `scripts/check-mobile-palette-css.mjs` — PALETTE-05 audit script (greps `@media (max-width: 960px)` block for `[cmdk-*]` selectors)

Framework install: not needed (Vitest already configured Phase 1/2; `@testing-library/user-event` already in devDeps).

If any of the audit scripts feels like overkill, the planner may consolidate into one `scripts/check-phase-4-css.mjs` with three sections — but each section MUST stay independent (a failing redistribution check shouldn't mask a failing print-rules check).

## Security Domain

Security enforcement is enabled by default (config.json doesn't set `security_enforcement`). Phase 4 is a UI/CSS phase with no new data flows, no new authentication, no new authorization, no new persistence. The applicable categories:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | NO | Phase 4 doesn't touch auth (no auth in this portfolio at all). |
| V3 Session Management | NO | No sessions. |
| V4 Access Control | NO | No access control surface. |
| V5 Input Validation | YES (minimal) | The drawer + palette accept no user input that hits a backend. The palette's text input is purely client-side filtering. The print stylesheet renders `process.env.NEXT_PUBLIC_SITE_URL` and `PROFILE.email` — both are build-time constants, not user input. **Control:** none needed; type system + build-time env variable narrows the surface. |
| V6 Cryptography | NO | No crypto. |
| V7 Errors & Logging | LOW | Drawer focus trap silently fails if focusables array is empty (returns early). This is correct behavior, not an error. No logging additions needed. |
| V8 Data Protection | NO | No data persistence beyond Phase 2's `localStorage["theme"]` + `localStorage["portfolio-accent"]` (unchanged). |
| V11 BOLA / Authorization | NO | n/a |
| V14 Configuration | LOW | `next.config.ts` headers (Phase 1 INFRA-04) already in place. Phase 4 adds no new headers. |

### Known Threat Patterns for Next.js + React + cmdk + Pure CSS

| Pattern | STRIDE | Standard Mitigation | Phase 4 application |
|---------|--------|---------------------|---------------------|
| XSS via user-controlled drawer/palette content | Tampering | All drawer/palette content is from `lib/routes.ts` (compile-time const) — no `dangerouslySetInnerHTML`; React auto-escapes | ✅ No untrusted strings render in Phase 4. |
| `localStorage` injection of CSS-variable payload | Tampering | Validate stored values match expected format before applying | Already handled Phase 2 (`portfolio-accent` validated to digit string). Phase 4 adds NO new localStorage keys. |
| Open redirect via drawer file-row href | Spoofing | All drawer links use Next.js `<Link>` or programmatic `router.push(route.pathname)` where `pathname` comes from a typed const array | ✅ All routes are compile-time `lib/routes.ts` consts. |
| Print stylesheet leaks sensitive content via `print-color-adjust: exact` | Information Disclosure | Default `economy`; do NOT force `exact` | ✅ §"Pitfall 4" + Code Example 1. |
| Print footer email exposure (already public on `/contact`) | Acceptable | Email is intentionally public (it's on the contact page) | ✅ No new exposure. |
| Print stylesheet retains theme `data-theme` attribute leaking dark-mode-specific oklch values to printer | Reliability (not security) | Print rules force `background: #fff !important; color: #000 !important;` overriding theme tokens | ✅ Code Example 1 covers it. |
| Drawer DOM injection via mutation observer or third-party script | Tampering | No third-party scripts; CSP via `next.config.ts` HTTP headers (Phase 1) | ✅ No change needed. |
| Print PDF metadata exposure (revision history, undo state) | Information Disclosure | Browser native print dialog only renders the current DOM — no PDF metadata leakage | ✅ Browser-controlled. |

**Conclusion:** Phase 4 is security-quiet. No new attack surface beyond the unchanged `<a href="/resume.pdf" download>` mechanism (Phase 2 ships this; Phase 4 reuses inside the drawer). The plan-checker should confirm:
- No `dangerouslySetInnerHTML` is added in Phase 4.
- No new `localStorage` keys are introduced.
- All href values are sourced from `lib/routes.ts` or `lib/portfolio-data.ts` (build-time consts).
- No `print-color-adjust: exact` is set.

## Sources

### Primary (HIGH confidence)

- [W3C WAI-ARIA Authoring Practices Guide — Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus trap pattern, keyboard requirements, ARIA semantics
- [W3C WAI-ARIA APG — Modal Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/) — reference implementation
- [W3C WCAG 2.2 — Understanding 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) — 44×44 AAA enhanced
- [W3C WCAG 2.2 — Understanding 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24×24 AA minimum
- [MDN — `print-color-adjust` CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust) — `economy` (default) vs `exact`
- [MDN — Printing CSS guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) — `@media print`, `@page`, `page-break-*`
- [MDN — `prefers-reduced-motion` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — reduced motion best practices
- [cmdk on GitHub (dip/cmdk, latest)](https://github.com/dip/cmdk) — `cmdk-` data attributes documented as public styling API
- [cmdk on npm](https://www.npmjs.com/package/cmdk) — version + dependencies
- [Next.js Layout API reference](https://nextjs.org/docs/app/api-reference/file-conventions/layout) — persistent layouts via route groups (validates Pattern 1 / ARCHITECTURE.md)

### Secondary (MEDIUM confidence — verified against authoritative sources)

- [Bram.us — The Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/) — `lvh` / `svh` / `dvh` semantics
- [zenn.dev — CSS svh and dvh are now cross-browser compatible](https://zenn.dev/tonkotsuboy_com/articles/svh-dvh-lvh-for-all-browser?locale=en) — Baseline status June 2025
- [DEV — How I approach keyboard accessibility for modals in React (Colette Wilson)](https://dev.to/colettewilson/how-i-approach-keyboard-accessibility-for-modals-in-react-152p) — useEffect cleanup, query-on-keydown pattern
- [LogRocket — Build an accessible modal with focus-trap-react](https://blog.logrocket.com/build-accessible-modal-focus-trap-react/) — comparison of library vs hand-rolled (we hand-roll)
- [Medium — Achieving Focus Trapping in a React Modal Component (Ogun Akar)](https://medium.com/cstech/achieving-focus-trapping-in-a-react-modal-component-3f28f596f35b) — verified Tab/Shift-Tab handler structure
- [web.dev — prefers-reduced-motion: Sometimes less movement is more](https://web.dev/articles/prefers-reduced-motion) — replace-don't-remove principle
- [CSS-Tricks — prefers-reduced-motion almanac](https://css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/) — `animation: none` AND `transition: none`
- [DocuSeal — CSS print page styling](https://www.docuseal.com/blog/css-print-page-style) — `@page`, page-break, color normalization
- [Medium — 100vh problem with iOS Safari (Quick Code, Maciej Trzciński)](https://medium.com/quick-code/100vh-problem-with-ios-safari-92ab23c852a8) — historical context for vh issues
- [UXPin — How to Build Accessible Modals with Focus Traps (2026 Guide)](https://www.uxpin.com/studio/blog/how-to-build-accessible-modals-with-focus-traps/) — current focus-trap consensus

### Internal (HIGH confidence — direct codebase evidence)

- `.planning/phases/04-mobile-responsive/04-CONTEXT.md` — 21 locked decisions
- `.planning/phases/04-mobile-responsive/04-UI-SPEC.md` — pixel-faithful visual contract
- `.planning/REQUIREMENTS.md` — MOBILE-01..05, PALETTE-05, A11Y-09 bodies
- `.planning/research/PITFALLS.md` Pitfall 6, Pitfall 7 — mobile palette + sidebar collapse
- `.planning/research/ARCHITECTURE.md` Pattern 1 — persistent shell via route group
- `app/globals.css` (1221 lines as of 2026-05-07) — existing Phase 2/3 rules; `@media` patterns at lines 152, 338, 343
- `app/components/shell/sidebar.tsx` — STATUS markup at lines 86–101 (extraction source for `<StatusBlock />`)
- `app/components/shell/top-bar.tsx` — insertion point for `☰` hamburger
- `app/components/shell/command-palette.tsx` — Phase 2 implementation (NOT modified by Phase 4); palette focus-restore pattern
- `app/components/shell/shell-state-provider.tsx` — Phase 2 reducer; Phase 4 extends with `useDrawer()` slice
- `app/components/views/about-view.tsx` — append point for `<div.about-status-mobile>`
- `app/(terminal)/layout.tsx` — mount point for `<ExplorerDrawer />` and `<PrintFooter />`
- `lib/routes.ts` — drawer reuses `ROUTES`
- `lib/portfolio-data.ts` — `PROFILE.email`, `CAREER_START_DATE`
- `lib/uptime.ts` — `formatUptime()` reused
- `package.json` — confirms zero new prod deps + existing devDeps cover Phase 4 testing
- `CLAUDE.md` — pure CSS, no new prod deps, persistent resume CTA, plain-noun aria-labels, mobile redistribution non-negotiables
- `.planning/codebase/CONVENTIONS.md` — kebab-case files, PascalCase components, RSC default
- `.planning/codebase/STACK.md` — verified `next-themes ^0.4.6`, `cmdk ^1.1.1`

## Metadata

**Confidence breakdown:**

- Standard stack (no new deps): **HIGH** — verified against package.json + CONTEXT.md lock; cmdk attribute selectors verified against the official cmdk repo.
- Architecture patterns (focus trap, mobile palette CSS override, StatusBlock extraction): **HIGH** — focus trap pattern verified against W3C WAI-ARIA APG; CSS override approach matches CONTEXT.md decision verbatim; StatusBlock extraction follows existing Phase 2 conventions.
- Pitfalls (vh→dvh/svh, prefers-reduced-motion combo, drawer-palette mutual exclusion, print-color-adjust): **HIGH** — all four verified against MDN + multiple secondary sources; `dvh`/`svh` Baseline confirmed via web.dev / Bram.us / zenn.dev.
- Validation Architecture: **HIGH** — fully derived from CONTEXT.md D-20 + Phase 4 requirement IDs + jsdom limitations explicitly acknowledged.
- iOS Safari real-device behavior (Pitfall 1, Pitfall 2): **MEDIUM** — recommended changes (`dvh`/`svh`, sticky input) follow documented best practices, but real-device validation (manual gate 5) is still needed during Wave 4 manual review.

**Research date:** 2026-05-07
**Valid until:** ~2026-12-07 (6 months) — `dvh`/`svh` are stable; cmdk's attribute selector API is unlikely to change in `^1.1.x`; WCAG 2.2 is published. Re-verify if cmdk releases a major version (2.x) or if a new viewport unit gets standardized.

---

## RESEARCH COMPLETE
