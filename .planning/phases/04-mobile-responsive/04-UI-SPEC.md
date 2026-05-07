---
phase: 4
slug: mobile-responsive
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-07
extends: .planning/phases/02-shell/02-UI-SPEC.md, .planning/phases/03-views/03-UI-SPEC.md
---

# Phase 4 — Mobile-Responsive: UI Design Contract

> Visual and interaction contract for mobile redistribution, mobile palette UX, STATUS rehoming, and the print stylesheet.
> **This document EXTENDS the Phase 2 + Phase 3 UI-SPECs.** Tokens, type scale, color palette, focus styles, motion baseline, layout dimensions (>=961px), accent reservation list, shell chrome, and view bodies are LOCKED upstream — referenced here, not redefined.
> Source of truth for visual ambiguity: `design_handoff_terminal_portfolio/app.jsx` (desktop) + `04-CONTEXT.md` (mobile, first-principles within handoff aesthetic — handoff README does not specify mobile).
> Consumed by gsd-ui-checker, gsd-planner, gsd-executor, gsd-ui-auditor.

---

## Inheritance From Phases 2 + 3

The following are **inherited unchanged** at >=961px and MUST NOT be re-declared, redefined, or "tightened" in Phase 4:

| Inherited | Source |
|-----------|--------|
| Design system: pure CSS + CSS custom properties; no Tailwind, no CSS modules, no CSS-in-JS | 02-UI-SPEC.md §"Design System" |
| Spacing scale (4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 64 / 80px) — handoff-locked | 02-UI-SPEC.md §"Spacing Scale" |
| Layout dimensions at >=961px (TopBar 38px, Sidebar 240px, Main max-width 920px, Main padding 32px 40px 80px) | 02-UI-SPEC.md §"Layout Dimensions" |
| Type scale (14/13/11/12 body/UI; 26/700 H1; 16/600 view-heading; 22/700 stat value; 15/600 project name) — handoff-locked | 02-UI-SPEC.md + 03-UI-SPEC.md §"Typography" |
| Font weights (400 regular, 600 semibold, 700 H1+stat-value) — handoff-locked exception | 02-UI-SPEC.md |
| Color tokens (`--bg`, `--bg-raised`, `--panel`, `--panel-hi`, `--border`, `--border-hi`, `--text`, `--text-hi`, `--muted`, `--muted-hi`, `--accent`, `--accent-dim`, `--accent-bg`, `--warn`, `--red`, `--blue`) | 02-UI-SPEC.md §"Color Token System" |
| 60/30/10 split (`--bg` dominant, `--panel`/`--panel-hi` secondary, `--accent` reserved) | 02-UI-SPEC.md §"Color Roles" |
| Accent reservation list (Phases 2 + 3) — Phase 4 EXTENDS this list, see §"Accent Reservation Additions" below | 02-UI-SPEC.md §"Color Roles" |
| Focus-visible (2px accent outline, 2px offset) on every interactive element — A11Y-02 | 02-UI-SPEC.md §"Accessibility Contract" |
| Motion baseline (cursor blink + slideIn 0.25s + breadcrumb fade); reduced-motion already shipped | 02-UI-SPEC.md §"Motion Contract" |
| Prompt-line primitive + locked per-route prompt copy (D-13) | 02-UI-SPEC.md + 03-UI-SPEC.md |
| Per-route `<title>` format `<file-label> — Bakytbek Tatibekov` (D-12) | 03-UI-SPEC.md §"Metadata Contract" |
| All seven view bodies (about/projects/stack/experience/writing/contact/shipped) | 03-UI-SPEC.md §"Per-View Visual Contracts" |
| `:focus-visible`, `.skip-link`, `.sr-only`, `.content-block`, `.cursor`, `slideIn` keyframes | 02-UI-SPEC.md + `app/globals.css` |
| Existing top-bar breakpoints (`@media (max-width: 600px)` hides path label; `@media (max-width: 480px)` hides traffic dots + LiveClock) | `app/globals.css` lines 338–346 |

**Source:** `app/globals.css` (1221 lines as of 2026-05-07) is the authoritative implementation of the inherited tokens and Phase 2/3 styles. Phase 4 appends mobile + print rules to the END of this file (single CSS file, pure CSS).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (pure CSS + CSS custom properties — inherited from Phase 2) |
| Preset | not applicable |
| Component library | none (Phase 4 adds 1 client island — `ExplorerDrawer` — and 1 RSC primitive — `PrintFooter`) |
| Icon library | Unicode glyphs only — Phase 4 introduces ONE new glyph: `☰` (U+2630, hamburger) for the drawer trigger. All other glyphs inherited (`◆ ▸ ≡ {} $ ↗ ↓ ⧉ ✓ › @ ⎘ ●`). |
| Font | JetBrains Mono via `next/font/google` — inherited Phase 2; **print stylesheet swaps to serif** (Georgia, "Times New Roman", serif) per A11Y-09 |
| Styling approach | Pure CSS in `app/globals.css`; new rules grouped at END of file behind two `@media` blocks (`max-width: 960px` and `print`) |
| Third-party registries | none |
| New prod deps | **none** — Phase 4 adds zero dependencies (no new component libraries; CLAUDE.md lock honored) |

**Source:** 04-CONTEXT.md §"Code Insights" + §"Specifics"; `app/globals.css` existing patterns at lines 152, 338, 343.

---

## Breakpoint Strategy

**Single mobile breakpoint:** `@media (max-width: 960px)` — applies to drawer collapse, palette bottom-sheet swap, STATUS rehoming, and touch-target enforcement (D-01, D-02, ROADMAP success criterion 2).

**Tablet portrait (768–960px) gets the mobile UX.** Tablet landscape (>=961px) keeps the desktop layout. One mode boundary, not three (D-02).

**Pre-existing top-bar internal breakpoints are preserved as-is** — they predate Phase 4 and serve a different concern (top-bar internal compression). Phase 4 does not modify them:

| Breakpoint | Existing rule | Purpose |
|------------|---------------|---------|
| `@media (max-width: 600px)` | `.topbar-path { display: none; }` | Hide path label in cramped widths |
| `@media (max-width: 480px)` | `.traffic-dot { display: none; } .live-clock { display: none; }` | Hide decorative chrome at phone widths |
| `@media (max-width: 960px)` | **NEW (Phase 4)** — sidebar collapse, drawer rules, palette bottom-sheet, STATUS show/hide, touch targets | Mobile redistribution |

**No new breakpoint at 375px.** Existing breakpoints + the new `☰` slot are sufficient. If implementation reveals top-bar overflow at 375px, the resume button compresses to icon-only `↓` while keeping `aria-label="Download resume"` (planner audit at execution per 04-CONTEXT.md Claude's Discretion).

**Layout transitions at 960px:**

| Element | >=961px | <=960px |
|---------|---------|---------|
| Sidebar (240px) | Visible | `display: none` (paired with drawer rehome — Pitfall 7 audit passes) |
| Main content padding | `32px 40px 80px` | `24px 16px 64px` (planner picks within Phase 2 spacing scale; recommended values shown) |
| Main max-width | 920px | 100% (no max — viewport-constrained) |
| TopBar | 5 zones (traffic / path / spacer / right zone / resume) | Same zones; `☰` hamburger inserted as leftmost zone (left of traffic dots OR replacing the path-label slot already hidden) |
| Sidebar EXPLORER + recruiter card + STATUS | 3 sidebar sections | EXPLORER + recruiter card → drawer; STATUS → about-view body |
| CommandPalette | Centered modal at 15vh | Bottom-sheet anchored to viewport bottom |

**Source:** 04-CONTEXT.md D-01..D-02; ROADMAP Phase 4 success criterion 2.

---

## Spacing Scale

**Inherited verbatim from Phase 2 + Phase 3 — no Phase 4 additions, no new exceptions.** All Phase 4 mobile/drawer/sheet/print spacing draws exclusively from the inherited scale:

| Token | Value | Phase 4 usage |
|-------|-------|---------------|
| 4px  | 4px   | Drawer file-row icon-to-label gap; print-footer middle-dot spacing |
| 8px  | 8px   | Drawer header padding-bottom; print-footer top padding |
| 10px | 10px  | (handoff-locked exception — preserved) |
| 12px | 12px  | Drawer recruiter card label margin-bottom; print white-space below hidden header |
| 14px | 14px  | Mobile palette item vertical padding (`14px 18px` — touch target enforcement; D-11) |
| 16px | 16px  | Drawer file-row horizontal padding (`14px 16px` — touch target); main content side padding at <=960px; STATUS-on-about side padding |
| 18px | 18px  | Mobile palette item horizontal padding (preserves Phase 2 row geometry) |
| 20px | 20px  | Drawer top padding; STATUS-on-about block top padding |
| 24px | 24px  | Main content top padding at <=960px; STATUS-on-about top border-top spacing |
| 32px | 32px  | Drawer max-width side margin on tablet portrait (centered with `max-width: 480px`) |
| 64px | 64px  | Main content bottom padding at <=960px (smaller than desktop's 80px to claw back vertical room above the fold) |

**Touch-target enforcement values (WCAG 2.5.5; >=44×44px at <=960px):**

| Element | Desktop padding (Phase 2/3) | Mobile padding (Phase 4) | Resulting min height |
|---------|---------------------------|--------------------------|----------------------|
| `.sb-item` (drawer file row) | `6px 16px` | `14px 16px` | 44px (14 + 16-line-height + 14 = ~44) |
| `[cmdk-item]` (palette item) | `10px 18px` | `14px 18px` | 44px (14 + 16-line-height + 14 = ~44) |
| `.topbar-btn` (⌘K, theme, resume buttons in top bar at <=960px) | `4px 10px` | `10px 12px` minimum | 44px (planner audits exact value at execution) |
| `.topbar-hamburger` (NEW) | n/a | `10px 12px` (44×44px slot) | 44×44px |
| `.drawer-close-btn` (optional explicit close inside sheet) | n/a | 44×44px slot | 44×44px |

**No new spacing exceptions introduced by Phase 4.** Each Phase 4 padding value is already in the inherited scale (or in the Phase 2 documented exceptions list — values 6, 10, 14, 18 already approved).

**Source:** 04-CONTEXT.md D-07, D-11, "Touch-target enforcement"; Phase 2 §"Spacing Exceptions"; WCAG 2.5.5.

---

## Typography

**Inherited verbatim from Phase 2 + Phase 3.** Phase 4 introduces NO new sizes and NO new weights.

Mobile-specific notes (no scale changes):

| Element | Size | Weight | Source |
|---------|------|--------|--------|
| Drawer file-row label | 13px | 400 (inactive) / 600 (active) | inherited from `.sb-item` Phase 2 |
| Drawer EXPLORER header | 11px | 400 | inherited |
| Drawer recruiter card header `For recruiters` | 12px | 400 | inherited from `.sb-download-header` Phase 2 |
| Drawer recruiter card button `↓ resume.pdf` | 12px | 600 | inherited |
| Mobile palette input | 14px | 400 | inherited |
| Mobile palette item label | 13px | 400 (inactive) / 600 (selected) | inherited |
| STATUS-on-about header `STATUS` | 11px | 400 (uppercase, letter-spacing 0.1em) | inherited |
| STATUS-on-about row | 11px | 400 | inherited |
| Hamburger glyph `☰` | 16px | 400 (inherits body) | new; sized to align with TopBar `12px` row at 16px glyph |
| Print body | 11pt (browser default ≈ 12px screen) | 400 | browser default; Phase 4 only enforces font-FAMILY swap, not size — print rendering uses serif at user's print-size preference |
| Print code-block (`.stack-pre`, `.prompt-line .cmd`, `.tech-chip`, hex-hash, JSON syntax) | inherits | inherits | font-family stays monospace via scoped override (D-16) |
| Print footer | 10px (screen-equivalent) | 400 | new; PrintFooter component small-size by design |

**Print font swap (D-16, A11Y-09):**
```css
@media print {
  body { font-family: Georgia, "Times New Roman", serif !important; }
  /* Code-like content keeps mono so JSON/commands stay legible */
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
}
```

**Source:** 04-CONTEXT.md D-16; A11Y-09; Phase 2 §"Typography"; Phase 3 §"Typography".

---

## Color

**Inherited verbatim from Phase 2.** Phase 4 adds NO new color tokens.

| Phase 4 element | Token used |
|-----------------|------------|
| Drawer overlay backdrop | `rgba(0, 0, 0, 0.5)` (matches Phase 2 palette overlay; pure literal, not a token, mirroring existing convention) |
| Drawer sheet surface | `var(--panel)` (matches sidebar surface — same metaphor, different home) |
| Drawer top edge highlight (subtle 1px line) | `var(--border)` |
| Drawer file-row hover | `var(--panel-hi)` |
| Drawer file-row active (current route) | `var(--accent)` text + `var(--accent-bg)` background + 2px left border `var(--accent)` (inherited `.sb-item--active` exactly) |
| Drawer recruiter card border | `var(--border)` (1px dashed — inherited `.sb-download` exactly) |
| Drawer recruiter card button | `var(--accent)` background, `var(--bg)` text (inherited) |
| Drawer touch-target focus-visible outline | 2px `var(--accent)` outline, 2px offset (inherited A11Y-02) |
| Mobile palette overlay backdrop | `rgba(0, 0, 0, 0.5)` (inherited Phase 2) |
| Mobile palette sheet surface | `var(--panel)` (inherited) |
| Mobile palette item selected/hover | `var(--accent-bg)` background, `var(--accent)` text (inherited) |
| STATUS-on-about top border | `var(--border)` 1px solid |
| STATUS-on-about availability dot `●` | `var(--accent)` (inherited from `.sb-status-dot`) |
| STATUS-on-about row text | `var(--muted)` (inherited) |
| STATUS-on-about row keys (`uptime:` / `tz:`) | `var(--muted)` (inherited from `.sb-status-key`) |
| Hamburger button glyph color | `var(--muted)` (matches other top-bar buttons) |
| Hamburger button hover background | `var(--panel-hi)` |
| Print background | `#fff !important` (literal — print contract) |
| Print text | `#000 !important` (literal — print contract) |
| Print accent / warn / muted | normalized to `#000` or `#333` (planner picks; spec recommends `#000` for body, `#333` for muted-equivalent — keeps tonal hierarchy on b/w printers) |

### Accent Reservation Additions (Phase 4 extends Phase 2's list)

Phase 4 adds the following accent uses (all inherited visual treatments — no new accent placements at semantic level):

12. Drawer file-row active state — text + 2px left border + `--accent-bg` (mirror of Phase 2 reservation #1 + #2, applied to drawer mount)
13. Drawer recruiter card button background (mirror of Phase 2 reservation #4, applied inside drawer)
14. Mobile palette item selected (mirror of Phase 2 reservation #8, applied at <=960px form factor)
15. STATUS-on-about availability dot (mirror of Phase 2 reservation #3, rendered in about-view body at <=960px)

**No NEW accent semantics** — Phase 4 only re-homes existing accent placements to mobile mounts.

### Color Roles (60/30/10)

Unchanged from Phase 2. The mobile experience preserves the split:
- 60% `var(--bg)` page background (mobile main content area)
- 30% `var(--panel)` / `var(--panel-hi)` (drawer sheet, palette sheet, top-bar background)
- 10% `var(--accent)` (reservation list above)

**Source:** 04-CONTEXT.md §"Specifics"; Phase 2 §"Color"; A11Y-09 print constraints.

---

## Surfaces

### 1. EXPLORER Bottom-Sheet Drawer (NEW — MOBILE-01 / MOBILE-02)

**File:** `app/components/shell/explorer-drawer.tsx` (NEW client island — 6th client island).

**Form factor:** Bottom-sheet that slides up from the viewport bottom (D-03).

**Visibility:** Mounted at all viewports for state stability; CSS `display: none` at >=961px (only renders at <=960px). Drawer state never leaks into desktop.

**Trigger:** `<button class="topbar-hamburger" aria-label="Open file explorer" aria-expanded={open}>☰</button>` rendered in the leftmost top-bar slot (D-04). Visible only at <=960px (CSS show/hide). Touch target 44×44px.

**State management:** Either local `useState` inside `ExplorerDrawer` with the trigger lifted into TopBar via Context, OR added as a `useDrawer()` slice in `ShellStateProvider` alongside `usePalette()` and `useAccent()`. **Planner picks** — recommendation: extend `ShellStateProvider` because the trigger lives in TopBar (different component) and palette/drawer mutual exclusion (see "Z-index discipline" below) needs cross-component state.

**Drawer geometry:**

| Property | Value |
|----------|-------|
| Position | `fixed; bottom: 0; left: 0; right: 0;` |
| Width | `100vw` (edge-to-edge on phones); `max-width: 480px; margin: 0 auto;` on tablet portrait (768–960px) for centered narrow sheet |
| Height | `height: fit-content; max-height: 75vh; overflow-y: auto;` (D-05) |
| Border-radius | `12px 12px 0 0` (top corners only — sheet metaphor; matches mobile palette D-08) |
| Background | `var(--panel)` |
| Border-top | `1px solid var(--border)` |
| Shadow | `0 -8px 24px rgba(0, 0, 0, 0.3)` (dark theme); `0 -8px 24px rgba(0, 0, 0, 0.1)` (light theme) |
| Z-index | `90` |
| Padding | `20px 0` (matches sidebar internal padding pattern) |

**Backdrop:**

| Property | Value |
|----------|-------|
| Position | `fixed; inset: 0;` |
| Background | `rgba(0, 0, 0, 0.5)` (matches palette overlay) |
| Z-index | `89` (one below sheet) |
| Behavior | Click/tap closes drawer (D-03 backdrop-tap-dismisses) |

**Drawer content (top to bottom):**

1. **EXPLORER header** — same `.sb-section-header` style as sidebar; padding `0 16px 8px`; "EXPLORER" uppercase, letter-spacing 0.1em, var(--muted), 11px.
2. **Tree root** — `▾ portfolio/` line; same `.sb-tree-root` style; not interactive.
3. **7 file rows** (mapped from `lib/routes.ts` — same `ROUTES` array as sidebar):
   - Row markup: `<button class="sb-item drawer-file-row" aria-label={route.ariaLabel} aria-current={isActive ? "page" : undefined}>`
   - Padding `14px 16px` (touch-target override from Phase 2's `6px 16px`)
   - Layout: identical to desktop sidebar (icon slot 16px → label)
   - Inactive: `color: var(--text); border-left: 2px solid transparent;`
   - Active: `color: var(--accent); background: var(--accent-bg); border-left: 2px solid var(--accent);`
   - Hover (where supported): `background: var(--panel-hi);`
   - On click: `setOpen(false)` then `router.push(route.pathname)` — drawer auto-closes on route change (D-06)
4. **Recruiter resume card** — identical to sidebar `.sb-download` block (margin `20px 16px 0`; padding 12; 1px dashed var(--border); 4px radius). Header "For recruiters", button `↓ resume.pdf` linking `/resume.pdf` with `download="Bakytbek_Tatibekov_Resume.pdf"` and `aria-label="Download resume"`. Same accent button styling as desktop. (D-07)
5. **STATUS block is NOT in the drawer** (D-13) — STATUS rehomes to about-view body instead. Drawer ends after the recruiter card. Pitfall 7 audit: STATUS is not hidden behind another overlay.

**Open animation:**
```css
@keyframes drawerSlideIn {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.drawer-sheet[data-state="open"] {
  animation: drawerSlideIn 200ms ease-out;
}
```
Backdrop fades from 0 to 0.5 opacity over 200ms.

**Close animation:** Symmetrical reverse (200ms ease-in). Implementation: planner picks between Web Animations API + `data-state` driver, or CSS-only `aria-hidden` toggle with transition. Either works; both must respect `prefers-reduced-motion`.

**Reduced-motion variant (per existing Phase 2 baseline):**
```css
@media (prefers-reduced-motion: reduce) {
  .drawer-sheet[data-state="open"] { animation: none; }
  .drawer-backdrop { transition: none; }
}
```
Drawer still appears; just without slide.

**Dismiss methods:**
- Backdrop tap (mandatory — D-03)
- Escape key (mandatory — A11Y-08 keyboard parity)
- Tap on a file row (auto-close on navigation — D-06)
- Optional explicit close button in top-right of sheet (planner picks — `<button class="drawer-close-btn" aria-label="Close file explorer">×</button>`, 44×44px, var(--muted)). Recommendation: skip for visual minimalism; backdrop+esc covers it.
- Swipe-down gesture: **deferred** (04-CONTEXT.md Claude's Discretion — backdrop tap + Esc cover dismissal)

**Focus management:**
- On open: focus moves to first file row (or to a sentinel inside the sheet)
- Focus trap: focus cannot leave the sheet via Tab while open (`focus-trap` pattern hand-rolled; no new dep — `@testing-library/user-event` already in dev deps for tests; runtime trap is ~30 lines using `keydown` Tab interception against first/last focusable elements within the sheet)
- On close: focus restores to the `☰` trigger button (matches Phase 2 palette pattern; PALETTE-04 parity)

**Semantic role:**
- Sheet element: `<div role="dialog" aria-modal="true" aria-labelledby="drawer-title">`
- Title: `<h2 id="drawer-title" class="sr-only">File explorer</h2>` (visually hidden; SR-announced)
- Backdrop: `<div aria-hidden="true">`

**Source:** 04-CONTEXT.md D-03..D-07, D-11; "Specifics"; ROADMAP Phase 4 success criterion 2; Pitfall 7.

### 2. Mobile CommandPalette (PALETTE-05 — extends Phase 2)

**File:** No new component — Phase 4 wraps existing `app/components/shell/command-palette.tsx` (built in Phase 2) with `@media (max-width: 960px)` CSS overrides applied to the cmdk attribute selectors `[cmdk-dialog]` and `[cmdk-overlay]`.

**At >=961px:** Phase 2 contract unchanged (centered 520px modal at 15vh — see 02-UI-SPEC.md §5).

**At <=960px:**

| Property | Desktop (>=961px) | Mobile (<=960px) |
|----------|-------------------|------------------|
| Position | `fixed; align-items: flex-start; justify-content: center; padding-top: 15vh;` | `fixed; bottom: 0; top: auto; left: 0; right: 0; transform: none;` |
| Width | `min(520px, 90vw)` | `100vw` (edge-to-edge) |
| Max-height | derived from list (320px list + chrome) | `80vh` (D-08 — leaves backdrop hint above) |
| Border-radius | `8px` (all corners) | `12px 12px 0 0` (top only — sheet metaphor) |
| Z-index | `100` | `100` (unchanged) |

**Mobile-specific overrides:**

```css
@media (max-width: 960px) {
  [cmdk-overlay] {
    align-items: flex-end;        /* anchor to bottom */
    justify-content: stretch;
    padding-top: 0;
    padding-bottom: 0;
  }
  [cmdk-dialog] {
    width: 100vw;
    max-width: 100vw;
    max-height: 80vh;
    border-radius: 12px 12px 0 0;
    /* Animation: slide up from bottom on open */
    animation: drawerSlideIn 200ms ease-out;
  }
  [cmdk-input] {
    /* Pin search input at top of sheet — already top of cmdk DOM order */
    position: sticky;
    top: 0;
    background: var(--panel);  /* opaque against scrolling list */
    z-index: 1;
  }
  [cmdk-list] {
    /* Adjust list to consume sheet remainder */
    max-height: calc(80vh - 64px - 40px);  /* sheet - input - footer */
    overflow-y: auto;
  }
  [cmdk-item] {
    padding: 14px 18px;  /* touch target — D-11 */
    /* min-height enforces 44px even on cmdk's default line-height */
    min-height: 44px;
    box-sizing: border-box;
  }
  [cmdk-empty] {
    padding: 24px 18px;
  }
}
```

**Trigger:** Phase 2 `⌘K` button in top-bar — **label persists at every viewport** (D-09). No icon swap, no responsive label change. Same button click handler opens the same `Command.Dialog` from Phase 2; only the CSS form factor changes.

**Auto-focus on open (D-10):** Search input auto-focuses on mobile + desktop. Type-to-filter is the primary use mode for engineers; recruiters who scroll the verb list dismiss the keyboard via OS-native gesture. cmdk default already provides this — no implementation work.

**Verb taxonomy:** Identical to Phase 2 (19 verbs locked in 02-CONTEXT.md D-01..D-05). No mobile-specific verbs added or removed.

**Empty state copy:** `No matches.` (inherited Phase 2).

**Footer hint at <=960px:**
- Phase 2 footer renders `↵ select · esc close` with `<kbd>` styling
- On mobile, the hardware Esc key is unavailable; the footer can either keep the desktop copy (engineers tap close via backdrop) or show `tap outside to close` — **planner picks at execution**. Recommendation: keep `↵ select · esc close` for visual consistency; document that backdrop tap is the universal close path.

**Source:** 04-CONTEXT.md D-08..D-11; Pitfall 6; PALETTE-05.

### 3. STATUS Block Rehomed to About-View (MOBILE-04)

**File:** `app/components/views/about-view.tsx` (existing RSC; Phase 4 appends a new render block).

**Visibility:**
- `>=961px`: STATUS renders inside the desktop sidebar (Phase 2 Section E, unchanged).
- `<=960px`: STATUS renders inside the about-view body (NEW — Phase 4); desktop sidebar's STATUS section is hidden via the same `.sidebar { display: none }` mobile rule that hides the entire sidebar.
- STATUS appears **only** on the `/` (about) route at <=960px. It does NOT render on other mobile views or in the drawer (D-13).

**Position within about-view:** Appended after the CTA row (resume + ghost socials), before the route boundary. With existing `.about-cta-row` last, the new STATUS block follows it.

**Visual treatment:** Identical 3-row block as desktop (D-12). Reuses `.sb-status` / `.sb-status-row` / `.sb-status-dot` / `.sb-status-key` CSS classes (or introduces a thin `.about-status-mobile` variant — planner picks; recommendation: extract a `<StatusBlock />` shared primitive consumed by both `Sidebar` and `AboutView`, ~30 lines, DRY win — D-14).

**Component approach (D-14 recommended):**
- New file: `app/components/shell/status-block.tsx` (or `app/components/primitives/status-block.tsx`).
- Type: **Server Component** (no client behavior; uptime is a prop, tz is computed in a tiny client wrapper if needed).
- Props: `{ uptime: string; tz: string; }`
- Sidebar continues to consume it (replaces inline markup at lines 86–101 of `sidebar.tsx`).
- About-view consumes it inside a `<div class="about-status-mobile">` wrapper that hides at >=961px.

**About-view visibility rule:**
```css
.about-status-mobile {
  display: none;  /* desktop default — hidden */
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
@media (max-width: 960px) {
  .about-status-mobile {
    display: block;  /* visible only on mobile */
  }
}
```

**Layout (mobile only):**
- Margin-top: `24px` (separates from CTA row)
- Padding-top: `16px`
- Border-top: `1px solid var(--border)` (subtle separator from bio)
- Internal: STATUS header (`STATUS` 11px uppercase letter-spacing 0.1em var(--muted)) above the 3 rows
- Rows: `padding: 0 16px; font-size: 11px; line-height: 1.8; color: var(--muted);` — matches Phase 2 sidebar STATUS rows
- Side padding 16px aligns with main content's mobile side padding (avoids double-padding)

**Data sources unchanged (D-14):**
- `uptime` — passed as prop from `app/(terminal)/layout.tsx` (which already calls `formatUptime(CAREER_START_DATE, new Date())` for the desktop sidebar). About-view RSC receives `uptime` via the same path.
- `tz` — computed client-side via `Intl.DateTimeFormat().resolvedOptions().timeZone`. If `<StatusBlock />` is RSC, `tz` is computed inside a tiny client child (`<StatusTz />`) that renders into the third row; OR `<StatusBlock />` becomes a client island. Planner picks; recommendation: keep `<StatusBlock />` RSC and inline `tz` as a 3-line client child to preserve Phase 2's RSC-first discipline.

**Source:** 04-CONTEXT.md D-12..D-14; Sidebar lines 86–101.

### 4. Print Stylesheet (NEW — A11Y-09)

**File:** `app/globals.css` — single `@media print { ... }` block appended at END of file (D-17 placement).

**Coverage:** All 7 views (D-15 — recruiter prints whatever they're looking at).

**Hide rules:**
```css
@media print {
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
}
```

**Surface rules:**
```css
@media print {
  html, body {
    background: #fff !important;
    color: #000 !important;
  }
  body {
    font-family: Georgia, "Times New Roman", serif !important;
  }
  /* Code-block-like content keeps mono so JSON/commands stay legible */
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
  /* Animations + transitions disabled */
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
  /* Layout: full-bleed */
  .terminal-shell {
    display: block !important;  /* unflex */
  }
  .terminal-main {
    max-width: 100% !important;
    padding: 16px !important;
  }
}
```

**Color normalization:** All Phase 2/3 color tokens normalize to `#000` body / `#fff` background under print. Accent / warn / muted retain hierarchy via:
```css
@media print {
  /* Tonal fallback for tokens that drove hierarchy on screen */
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
  /* Borders weaken to grey for paper */
  .stack-pre,
  .about-card,
  .contact-card,
  .projects-row,
  .exp-row,
  .writing-row,
  .shipped-row {
    border-color: #999 !important;
  }
}
```

**Page-break behavior (D-18):** Natural flow. No `page-break-inside: avoid` on view bodies. Defensive `page-break-inside: avoid` on `.shell-footer` and `.print-footer` so the URL+email line never splits across pages.

**Print footer (NEW — D-17):**

**File:** `app/components/print-footer.tsx` (NEW RSC primitive).

**Mount:** Inside `app/(terminal)/layout.tsx`, rendered as a sibling to or inside `.terminal-main` after `.shell-footer` (planner picks; recommendation: as a separate `<aside class="print-footer">` mounted at the bottom of `.terminal-shell`).

**Render mode:** Always rendered in DOM; visible only via `@media print`.

```css
.print-footer {
  display: none;
}
@media print {
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
}
```

**Print footer copy contract:**

| Element | Copy | Source |
|---------|------|--------|
| Footer body | `{site URL} · {email}` | URL via `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`; email via `PROFILE.email` |
| Example | `bakytbek.dev · beckprograms@gmail.com` | with production env |
| Separator | ` · ` (space middle-dot space) | matches `.shell-footer` separator visual |

**Per-view print micro-tuning:** Universal rules cover all 7 views (D-15). Per-view tuning (e.g. stack.json keeping color highlighting on color printers, experience.log hex-hash decoration) is deferred per 04-CONTEXT.md `<deferred>` to v1.x if print-preview review surfaces a specific issue.

**Source:** 04-CONTEXT.md D-15..D-18; A11Y-09; ROADMAP Phase 4 success criterion 5.

### 5. Mobile Top-Bar Composition (no NEW component — additive)

**File:** `app/components/shell/top-bar.tsx` (existing client island; Phase 4 inserts the `☰` trigger).

**Layout at <=960px (left to right):**

| Slot | Visibility | Element |
|------|-----------|---------|
| 1 (leftmost) | `<=960px` only | `<button class="topbar-hamburger" aria-label="Open file explorer" aria-expanded={open}>☰</button>` |
| 2 | hidden `<=480px`; visible >480px (existing) | Three traffic-light dots (decorative) |
| 3 | hidden `<=600px` (existing) | Path label `~/portfolio — bakytbek@dev — zsh` |
| 4 | always | Spacer (`flex: 1`) |
| 5 | always | `⌘K` button |
| 6 | always | Theme toggle (`☼ light` / `☾ dark`) |
| 7 | hidden `<=480px` (existing) | LiveClock (HH:MM) |
| 8 (rightmost) | **always — never hidden** | Resume download button `↓ resume.pdf` (SHELL-03 / Risk 3 / Phase 2 D-15 / 04-CONTEXT.md D-19) |

**Result at 375px:** `☰` · `⌘K` · `☼/☾` · `↓ resume.pdf` (3-icon left + 3-control right). Traffic dots, path label, and LiveClock all hidden by existing breakpoints.

**Hamburger button visual:**
```css
.topbar-hamburger {
  display: none;  /* desktop default — hidden */
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px 12px;  /* 44×44px touch target */
  font-family: inherit;
  font-size: 16px;     /* ☰ glyph at 16px renders comfortably */
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
@media (max-width: 960px) {
  .topbar-hamburger {
    display: inline-flex;  /* visible only on mobile */
    align-items: center;
    justify-content: center;
  }
}
```

**ARIA contract on hamburger:**
- `aria-label="Open file explorer"` (plain noun for recruiters per CLAUDE.md non-negotiable; matches `aria-label="Contact information"` pattern from Phase 2 Sidebar)
- `aria-expanded={drawerOpen}` — toggles `true`/`false`
- `aria-controls="drawer-sheet-id"` (where `drawer-sheet-id` is the `id` of the sheet element)

**Resume button mobile compression (deferred — per 04-CONTEXT.md Claude's Discretion):** If implementation reveals top-bar overflow at 375px, the planner adds an icon-only resume variant (`↓` glyph only, label preserved as `aria-label="Download resume"`). Decision is made at execution time after a 375px screenshot review. Phase 4 ships the full label by default.

**Source:** 04-CONTEXT.md D-04, D-19, "375px top-bar layout" Claude's Discretion; SHELL-03; Risk 3.

### 6. Mobile Sidebar Hide Rule (paired with drawer rehome — Pitfall 7 audit)

```css
@media (max-width: 960px) {
  .sidebar {
    display: none;
  }
}
```

**Pitfall 7 audit pass:** Every sidebar element has a documented mobile rehome:

| Sidebar element | Mobile home | Phase 4 reference |
|-----------------|-------------|-------------------|
| EXPLORER header + tree root + 7 file rows | `ExplorerDrawer` (Surface 1) | D-03..D-07 |
| Recruiter resume card (`↓ resume.pdf`) | `ExplorerDrawer` (Surface 1) AND TopBar resume button (always-visible) | D-07, D-19 |
| STATUS block | About-view body (Surface 3) | D-12..D-14 |

ROADMAP Phase 4 success criterion 4 — `grep -E "display:\s*none" app/globals.css` for sidebar selectors must pair with a mobile-home rule for every former sidebar element. Phase 4 satisfies this for all 3 sidebar sections.

### 7. Z-Index Discipline + Mutual Exclusion

**Z-index ladder (Phase 4 additions in bold):**

| Layer | Z-index | Element |
|-------|---------|---------|
| Skip-link (focused) | 200 | `.skip-link` (Phase 2) |
| CommandPalette overlay | 100 | `[cmdk-overlay]` (Phase 2 — desktop + mobile) |
| **Drawer sheet** | **90** | **`.drawer-sheet`** (Phase 4 NEW) |
| **Drawer backdrop** | **89** | **`.drawer-backdrop`** (Phase 4 NEW) |
| TopBar | 20 | `.topbar` (Phase 2) |
| Page content | 0 | (default) |

**Mutual exclusion (Claude's Discretion in 04-CONTEXT.md):**
- Opening the palette while the drawer is open closes the drawer
- Opening the drawer while the palette is open closes the palette
- Implementation: wire through `ShellStateProvider` — when `setDrawerOpen(true)` is called, also `setPaletteOpen(false)` (and symmetrically). This avoids stacked sheets and z-index conflicts.
- If for any reason both are active, palette wins (z-index 100 > drawer 90).

---

## Accessibility Contract

| Requirement | Implementation | Ref |
|-------------|----------------|-----|
| Touch targets >=44×44px | Drawer file rows `padding: 14px 16px`; mobile palette items `padding: 14px 18px; min-height: 44px;`; hamburger `padding: 10px 12px` (44×44px slot); top-bar buttons audited and bumped if needed | WCAG 2.5.5 / MOBILE-02 |
| Drawer focus management | Focus trap inside sheet while open; on close, focus returns to `☰` trigger | A11Y-08 (parity with palette PALETTE-04) |
| Drawer ARIA | `role="dialog" aria-modal="true" aria-labelledby="drawer-title"`; `<h2 id="drawer-title" class="sr-only">File explorer</h2>` | A11Y-04/05 |
| Hamburger ARIA | `aria-label="Open file explorer"` (plain noun); `aria-expanded` toggles; `aria-controls` references sheet id | A11Y-04 (CLAUDE.md plain-noun mandate) |
| Drawer keyboard dismiss | Esc closes drawer; matches palette pattern | A11Y-08 |
| Mobile palette | Inherits Phase 2 PALETTE-04 focus trap; same Esc-to-close; sheet form factor preserves keyboard nav | A11Y-08 / PALETTE-05 |
| Reduced motion | Drawer slide animation OFF under `prefers-reduced-motion: reduce`; fade-only fallback. Phase 2 baseline already shipped (cursor + slideIn + breadcrumb fade); Phase 4 extends to drawer + palette-mobile slide. | A11Y-03 baseline (full audit Phase 5) |
| Skip-link | Inherited from Phase 2; reveals on `:focus`; works at every viewport | A11Y-01 |
| Print stylesheet | `@media print` rules ship in `app/globals.css` end of file | A11Y-09 |
| Print SR-friendly | Hidden chrome stays hidden via `display: none !important`; serif fallback for body; URL+email footer appended via `<PrintFooter />` always-rendered RSC | A11Y-09 |
| Keyboard parity at <=960px | Drawer Tab-trap; palette Tab-trap (Phase 2); hamburger keyboard-activatable (Enter / Space); ⌘K + Ctrl+K shortcuts continue to work | A11Y-08 |
| Plain-noun aria-labels | `☰` button `aria-label="Open file explorer"`; drawer file rows inherit Phase 2 `route.ariaLabel` plain-noun convention | CLAUDE.md non-negotiable |

**Source:** 04-CONTEXT.md "Test Strategy" + Claude's Discretion; A11Y-09; WCAG 2.5.5; CLAUDE.md.

---

## Copywriting Contract

Phase 4 introduces minimal new copy. Most strings inherit from Phase 2.

| Element | Copy | Notes |
|---------|------|-------|
| Hamburger button (visible glyph) | `☰` | Unicode U+2630 |
| Hamburger button aria-label | `Open file explorer` | plain noun; CLAUDE.md non-negotiable |
| Drawer hidden title (sr-only) | `File explorer` | screen-reader announcement on dialog open |
| Drawer EXPLORER header | `EXPLORER` | inherited from Phase 2 sidebar |
| Drawer tree root | `▾ portfolio/` | inherited |
| Drawer 7 file rows | inherited from `lib/routes.ts` (label + ariaLabel) | inherited |
| Drawer recruiter card header | `For recruiters` | inherited Phase 2 |
| Drawer recruiter card button | `↓ resume.pdf` | inherited; aria-label "Download resume" |
| Drawer optional close button (if planner ships it) | `×` glyph | aria-label `Close file explorer` |
| Mobile palette placeholder | `Type a command or file...` | inherited Phase 2 |
| Mobile palette empty state | `No matches.` | inherited Phase 2 |
| Mobile palette footer hint | `↵ select · esc close` (or `tap outside to close` — planner picks at execution) | inherited Phase 2 default |
| STATUS-on-about header | `STATUS` | inherited from Phase 2 sidebar |
| STATUS-on-about line 1 | `● Available for hire` | inherited |
| STATUS-on-about line 2 | `uptime: <Yy DDDd>` | inherited; computed |
| STATUS-on-about line 3 | `tz: <abbr> (flex)` | inherited; client-computed |
| Print footer body | `{site URL} · {email}` | NEW — D-17 |
| Print footer example | `bakytbek.dev · beckprograms@gmail.com` | example with prod env |

**Empty state heading:** Drawer EXPLORER cannot be empty (always renders 7 routes from `lib/routes.ts`). No empty state needed for the drawer.

**Empty state body:** Same as above — n/a.

**Error state:** Phase 4 introduces no error states. Drawer is a static navigation list; palette inherits Phase 2's `No matches.`.

**Destructive actions:** Phase 4 introduces no destructive actions. Drawer + palette + STATUS-on-about + print are read-only navigation/display surfaces. No confirmations needed.

**Source:** 04-CONTEXT.md "Specifics"; Phase 2 §"Copywriting Contract" inherited.

---

## Motion Contract

Phase 4 extends Phase 2's motion contract with drawer + mobile-palette slide animations. All new motion respects the existing `prefers-reduced-motion` baseline.

| Animation | CSS | Trigger | Reduced-motion |
|-----------|-----|---------|----------------|
| Drawer slide-in | `drawerSlideIn 200ms ease-out` (translateY 100% → 0) | drawer state → open | `animation: none` (drawer still appears) |
| Drawer slide-out | symmetrical reverse 200ms ease-in | drawer state → closed | `animation: none` |
| Drawer backdrop fade | `opacity 0 → 0.5 over 200ms` | drawer state → open | `transition: none` |
| Mobile palette slide-in | reuses `drawerSlideIn 200ms ease-out` | palette state → open at <=960px | `animation: none` |
| Cursor blink | inherited Phase 2 (`blink 1s steps(2)` infinite) | always on prompt-line | inherited (`animation: none`) |
| SlideIn content | inherited Phase 2 (`slideIn 0.25s ease`) | once per view mount | inherited |
| Breadcrumb fade-in | inherited Phase 2 | once on shell first mount | inherited |

**Reduced-motion block (Phase 4 additions append to existing Phase 2 block at line 152 of globals.css):**

```css
@media (prefers-reduced-motion: reduce) {
  /* Phase 2 baseline (already in globals.css):
     .cursor { animation: none; }
     .content-block { animation: none; }
     .breadcrumb-hint { transition: none; opacity: 1; } */

  /* Phase 4 additions: */
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] {
    animation: none;
  }
  .drawer-backdrop {
    transition: none;
  }
  [cmdk-dialog] {
    animation: none;  /* mobile palette slide */
  }
}
```

**Phase 4 only ships defensive `prefers-reduced-motion` rules for the new drawer + mobile-palette slide animations.** The full `prefers-reduced-motion` audit across every keyframe is Phase 5 (A11Y-03).

**Source:** 04-CONTEXT.md "Specifics" + Claude's Discretion; Phase 2 §"Motion Contract"; A11Y-03 deferred to Phase 5.

---

## Component Architecture Contract

(For executor reference — boundaries that must NOT be violated)

**New components (Phase 4):**

| File | Type | "use client" | Reason |
|------|------|-------------|--------|
| `app/components/shell/explorer-drawer.tsx` | Client island (NEW — 6th client island) | YES | useState/useDrawer, focus trap, keydown listener, click outside |
| `app/components/print-footer.tsx` (or `app/components/primitives/print-footer.tsx`) | Server Component | NO | Static URL+email content; no interactivity |
| `app/components/shell/status-block.tsx` (or `app/components/primitives/status-block.tsx`) | Server Component (with optional client child for `tz`) | NO at root | Shared by Sidebar (existing) + AboutView (new mobile render) |

**Modified components (Phase 4):**

| File | Change | "use client" status |
|------|--------|---------------------|
| `app/components/shell/top-bar.tsx` | Insert `<button class="topbar-hamburger">` as leftmost slot; wire to `useDrawer().toggle()` | unchanged (already client) |
| `app/components/shell/shell-state-provider.tsx` | Add `useDrawer()` slice (open/close state) — **planner picks** between this approach and local state | unchanged (already client wrapper) |
| `app/components/shell/sidebar.tsx` | Replace inline STATUS markup at lines 86–101 with `<StatusBlock uptime={uptime} tz={tz} />` (recommended D-14 approach) | unchanged |
| `app/components/views/about-view.tsx` | Append `<div class="about-status-mobile"><StatusBlock uptime={uptime} tz={tz} /></div>` after CTA row | unchanged (RSC) |
| `app/(terminal)/layout.tsx` | Mount `<ExplorerDrawer />` (sibling of `<CommandPalette />`); mount `<PrintFooter />` (sibling); pass `uptime` to `<AboutView />` via the route page (planner wires) | unchanged (RSC) |
| `app/globals.css` | Append ~150–250 lines: `@media (max-width: 960px) { ... }` block + `@media print { ... }` block at END of file (D-21 Wave 1) | n/a |

**Files not modified by Phase 4:**

- `app/components/shell/command-palette.tsx` — Phase 4 does NOT modify the component; only `[cmdk-dialog]` / `[cmdk-overlay]` / `[cmdk-item]` CSS gets `@media (max-width: 960px)` overrides in `globals.css`. The cmdk component contract is preserved.
- `app/components/views/projects-view.tsx`, `stack-view.tsx`, `experience-view.tsx`, `writing-view.tsx`, `contact-view.tsx`, `shipped-view.tsx` — view bodies do NOT change. Only the about-view receives a Phase 4 amendment (STATUS rehome).
- `lib/routes.ts`, `lib/types.ts`, `lib/portfolio-data.ts`, `lib/uptime.ts` — data layer untouched. Drawer reuses `ROUTES`; STATUS reuses `CAREER_START_DATE`.
- `next.config.ts`, `package.json` — no new prod deps; no new HTTP headers; no config changes.

**Client island count after Phase 4:** 6 (Phase 2 had 5: TopBar, Sidebar, CommandPalette, LiveClock, Breadcrumb; Phase 4 adds: ExplorerDrawer). RSC discipline preserved (Pitfall 9 / SHELL-02).

**RSC bundle target:** First Load JS for shared shell delta < 5KB gzipped (Phase 4 addition only — focus trap + drawer state + 1 new button). Phase 2 target was < 50KB total; Phase 4 stays well under.

**Source:** 04-CONTEXT.md "Established Patterns" + "Integration Points"; Phase 2 §"Component Architecture Contract"; ARCHITECTURE.md Pattern 1.

---

## Test Strategy

Vitest unit tests are limited because `@media` queries don't fire in jsdom — most Phase 4 validation is manual screenshot + print preview review.

**Unit tests (Vitest, jsdom — concrete additions):**

| File | Coverage |
|------|---------|
| `app/components/shell/explorer-drawer.test.tsx` (NEW) | Drawer opens on `☰` click; closes on file-row click; focus traps within sheet while open; Esc dismisses and restores focus to trigger; backdrop click closes; aria-modal + role="dialog" present; `aria-expanded` toggles on the trigger |
| `app/components/shell/command-palette.test.tsx` (extend existing TEST-03) | Assert keydown still toggles palette at <=960px (component-level — jsdom doesn't render the bottom-sheet form factor visually, but the open/close state machine + focus trap continue to work) |
| `app/components/print-footer.test.tsx` (NEW) | Renders site URL + email separated by ` · `; falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset; text content includes both values |
| `app/components/views/about-view.test.tsx` (extend existing TEST-05 about smoke) | About-view RSC renders `<StatusBlock>` mobile mount; assertion does not require visibility (CSS-driven), only DOM presence |
| `app/components/shell/status-block.test.tsx` (NEW) | Renders 3 rows with availability dot + uptime + tz; uptime prop is rendered verbatim; tz prop or fallback "GMT+5 (flex)" rendered |

**Manual screenshot review (D-20):**

| Viewport | Routes | Assertion |
|----------|--------|-----------|
| 375px | `/` (about) | TopBar resume button visible above the fold without scrolling (MOBILE-03) |
| 375px | `/` | TopBar contains: `☰`, `⌘K`, theme toggle, `↓ resume.pdf` (or icon-only `↓` if compression triggers) — no overflow |
| 375px | `/` | About-view STATUS block visible near bottom of view body |
| 375px | `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` | STATUS block NOT rendered on non-about routes (D-13) |
| 375px | any | Drawer opens on `☰` tap; backdrop visible; sheet anchored to bottom; touch targets feel >=44px; backdrop tap closes |
| 375px | any | `⌘K` palette opens as bottom-sheet; search input pinned at top; 80vh height; type-to-filter narrows results |
| 768px (tablet portrait) | `/` | Same mobile UX active (drawer + palette bottom-sheet); STATUS visible in about-view |
| 1024px (tablet landscape / desktop) | all 7 | Phase 2/3 desktop layout unchanged; sidebar visible; palette centered modal; STATUS in sidebar |

**Print preview review (D-20):**

| Route | Preview Assertion |
|-------|-------------------|
| `/` | White bg, black text, serif body; H1 + bio + stat cards + CTA + STATUS legible; URL+email footer at bottom; no top-bar/sidebar/drawer/palette |
| `/projects` | Project rows print with index, name, summary, tech chips (mono), year/status/role; URL+email footer |
| `/stack` | JSON pre-block prints with mono code-content; punctuation/keys/strings tonal hierarchy preserved (greys); URL+email footer |
| `/experience` | Hex-hash mono; role serif; period right-aligned mono; summary serif; URL+email footer |
| `/writing` | Date·readtime micro-meta; title with `›` prefix; excerpt; dashed bottom border per row; URL+email footer |
| `/contact` | Lead paragraph serif; card with label/handle rows (mono labels, serif handles); URL+email footer |
| `/shipped` | App rows with platforms + role + year; store badges (SVG inline) print as-is; URL+email footer |

**Recruiter dry-run (D-20):** 5-second test on 375px localhost (real test is Phase 7 / DEPLOY-04 on production URL). Assertion: a non-engineer finds the resume + contact path within 5 seconds, twice. Phase 4 does the dry run; failure modes get noted in `.planning/phases/04-mobile-responsive/04-VERIFICATION.md` for Phase 7 carry-forward.

**Source:** 04-CONTEXT.md D-20.

---

## Wave Sequencing (Planner Reference)

(Suggested — planner can refine; sourced from 04-CONTEXT.md D-21)

| Wave | Plans | Notes |
|------|-------|-------|
| **Wave 1** | 1 plan | `app/globals.css` mobile + print rule additions (single CSS file edit — drawer styles, palette `@media (max-width: 960px)` overrides, sidebar `display: none` + paired audit, about-view STATUS visibility, hamburger button styling, print rules). All later waves depend on this CSS being in place. |
| **Wave 2 (parallel)** | 3 plans | **2a:** `ExplorerDrawer` client island + `☰` trigger added to TopBar + `useDrawer()` slice in `ShellStateProvider`. **2b:** `<StatusBlock />` shared primitive extracted; `Sidebar` updated to consume; `about-view.tsx` adds the mobile-only render path. **2c:** `<PrintFooter />` RSC component; `app/(terminal)/layout.tsx` mounts it. |
| **Wave 3** | 1 plan | Vitest specs (drawer test, status-block test, palette mobile-toggle assertion extension, print-footer test, about-view STATUS mount assertion). |
| **Wave 4 (manual)** | 1 plan | Cross-viewport screenshot review (375 / 768 / 1024) + print preview on all 7 views; recruiter-test dry run on 375px localhost. Outputs go in `04-VERIFICATION.md`. |

**Total estimated plans:** 5–6 (planner's call).

**Source:** 04-CONTEXT.md D-21.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — no shadcn |
| third-party | none | not applicable |

No component registries in use. Pure CSS + Unicode glyphs (`☰` U+2630 NEW; all other glyphs inherited). cmdk and next-themes are production deps installed in Phase 1; **no new prod deps introduced in Phase 4** (CLAUDE.md lock honored).

---

## Mobile Scope Boundary

**Phase 4 owns:**
- `@media (max-width: 960px)` rules in `app/globals.css`
- `ExplorerDrawer` client island
- `<StatusBlock />` primitive extraction
- About-view mobile STATUS render
- Hamburger trigger in TopBar
- `<PrintFooter />` RSC component
- `@media print` rules in `app/globals.css`

**Phase 4 does NOT own (carry-forwards to other phases):**
- 8-combination contrast audit (4 hues × 2 themes) → Phase 5 (A11Y-07). Mobile drawer + bottom-sheet palette must pass; per-hue chroma overrides may surface as Phase 5 rework.
- Comprehensive `prefers-reduced-motion` audit → Phase 5 (A11Y-03). Phase 4 ships defensive rules for new drawer + mobile-palette slide; the full keyframe pass is Phase 5.
- Per-view print micro-styling tuning → v1.x carry-forward if print-preview review surfaces specific issues.
- Recruiter test on production URL → Phase 7 (DEPLOY-04).
- 375px overflow handling beyond what existing breakpoints + `☰` slot provide (e.g. icon-only resume button) → planner audits at execution; documented as Claude's Discretion in 04-CONTEXT.md.
- Swipe-to-close gesture, haptic feedback → deferred per 04-CONTEXT.md `<deferred>`.

---

## Pre-Population Sources

| Source | Decisions Used |
|--------|---------------|
| `.planning/phases/04-mobile-responsive/04-CONTEXT.md` | All 21 locked decisions (D-01..D-21) — breakpoint strategy, drawer pattern, mobile palette UX, STATUS rehoming, print stylesheet, wave sequencing, Claude's Discretion items |
| `.planning/phases/02-shell/02-UI-SPEC.md` | Inherited tokens, type scale, color palette, spacing scale + exceptions, motion baseline, accessibility contract, copywriting contract, RSC architecture |
| `.planning/phases/03-views/03-UI-SPEC.md` | Inherited view bodies, per-view metadata, additional spacing usages, type scale extensions (22px stat-value, 15px project name) |
| `design_handoff_terminal_portfolio/README.md` | Visual aesthetic (oklch tokens, JetBrains Mono, prompt-line + cursor block); confirms desktop-first design and absence of mobile spec |
| `design_handoff_terminal_portfolio/app.jsx` | Lines 240–272 (palette CSS shape — Phase 4 wraps); lines 504+ (sidebar `<aside>` — Phase 4 hides at <=960px and reroutes contents) |
| `.planning/REQUIREMENTS.md` | MOBILE-01..05, PALETTE-05, A11Y-09 requirement bodies |
| `.planning/ROADMAP.md` Phase 4 section | 5 success criteria; `grep -E "display:\s*none"` Pitfall 7 audit constraint |
| `.planning/research/PITFALLS.md` | Pitfall 6 (mobile palette traps) + Pitfall 7 (sidebar `display: none` without rehome) |
| `app/globals.css` | Existing breakpoints (lines 152, 338, 343); existing token system; CSS append target |
| `app/components/shell/sidebar.tsx` | STATUS markup at lines 86–101 — extraction source for `<StatusBlock />` |
| `app/components/views/about-view.tsx` | Append point for mobile STATUS render (after `.about-cta-row`) |
| `app/components/shell/top-bar.tsx` | Existing top-bar — insertion point for `<button class="topbar-hamburger">` |
| `lib/routes.ts`, `lib/portfolio-data.ts` (`PROFILE.email`), `lib/uptime.ts` | Data sources unchanged; drawer reuses ROUTES; print-footer reads PROFILE.email + NEXT_PUBLIC_SITE_URL |
| `CLAUDE.md` | Pure CSS constraint; no new deps; persistent resume CTA constraint; plain-noun aria-labels; mobile redistribution rather than `display: none` orphan; 5-second recruiter test as exit criterion |
| User input | 0 (all decisions pre-populated from upstream artifacts — auto/YOLO mode, all gray areas resolved in 04-CONTEXT.md) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS (mostly inherited; 4 new strings — hamburger aria-label, drawer hidden title, print-footer body, optional close button — all specified)
- [ ] Dimension 2 Visuals: PASS (all surfaces specified pixel-faithfully against handoff aesthetic; mobile-specific surfaces designed first-principles within token system)
- [ ] Dimension 3 Color: PASS (no new tokens; mobile + print uses inherited tokens; print color normalization specified)
- [ ] Dimension 4 Typography: PASS (no new sizes/weights; print font swap to serif specified per A11Y-09 with mono carve-outs; inherits Phase 2/3 handoff-locked exceptions which are documented upstream)
- [ ] Dimension 5 Spacing: PASS (no new spacing values; all Phase 4 padding draws from inherited scale + exceptions; touch-target enforcement values are within scale)
- [ ] Dimension 6 Registry Safety: PASS (no shadcn, no third-party registry, no new prod deps)

**Approval:** pending

---

*Phase: 04-mobile-responsive*
*UI-SPEC generated: 2026-05-07*
*Status: draft — awaiting gsd-ui-checker verification*
