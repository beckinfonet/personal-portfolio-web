# Phase 4: Mobile-Responsive - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 redistributes the desktop sidebar metaphor to a mobile experience that holds up under the 5-second recruiter test on a 375px phone. Specifically:

- **Mobile breakpoint at <=960px** collapses the 240px desktop sidebar; all sidebar content gets an explicit mobile home (NOT `display: none` per Pitfall 7)
- **Bottom-sheet EXPLORER drawer** triggered by a `☰` hamburger placed in the leftmost top-bar slot (the path-label slot, already hidden <=600px); contains the 7 file rows + recruiter "↓ resume.pdf" card; auto-closes on route change
- **Bottom-sheet ⌘K palette** wraps the existing Phase 2 centered modal with `@media (max-width: 960px)` rules — same verb list, same type-to-filter, search input pinned at top of sheet, auto-focus on open
- **STATUS block (`● Available for hire`, `uptime`, `tz`) rehomed inside the about-view body, near bottom** — visible only on the about route at <=960px (matches desktop sidebar visibility model)
- **Top-bar resume button stays visible at every viewport** including 375px (Phase 2 D-15 / SHELL-03 / Risk 3 — non-negotiable)
- **Resume CTA on the about route is above the fold at 375px** (MOBILE-03)
- **Print stylesheet (`@media print`) covers all 7 views** — hides top-bar / sidebar / drawer / palette / breadcrumb, white bg / black text, serif fallback (Georgia, Times), URL+email footer appended, animations off

**Phase 4 owns these requirements (per ROADMAP.md):** MOBILE-01, MOBILE-02, MOBILE-03, MOBILE-04, MOBILE-05, PALETTE-05, A11Y-09.

**Out of scope this phase (carrying forward, do NOT touch):**
- Shell layout, top-bar composition, palette verb list, theme/accent system — locked Phase 2
- View bodies + per-view metadata + smoke tests — locked Phase 3
- OG images, JSON-LD, favicon, full `prefers-reduced-motion` audit, axe-core 8-combination contrast audit — Phase 5
- Real bio/projects/writing/shipped/experience/contact content — Phase 6
- Deploy, Lighthouse, recruiter test on production URL — Phase 7

</domain>

<decisions>
## Implementation Decisions

### Mobile Breakpoint Strategy

- **D-01: Single mobile breakpoint at `@media (max-width: 960px)`** for both the sidebar drawer collapse and the palette bottom-sheet swap. Aligns with ROADMAP success criterion 2 ("collapses below ~960px") and Pitfall 7's threshold. Existing top-bar breakpoints (`max-width: 600px` for path label, `max-width: 480px` for traffic dots + LiveClock) are preserved as-is — they predate this phase and serve a different concern (top-bar internal compression). Result: at >=961px nothing changes from Phase 2/3; at <=960px everything mobile flips on at once.

- **D-02: Tablet portrait (768–960px) gets the mobile UX.** No separate tablet zone. Tablet portrait users see the bottom-sheet drawer + bottom-sheet palette; tablet landscape (>960px) keeps the desktop layout. Single breakpoint = one mode boundary to test, not three.

### EXPLORER Drawer (MOBILE-01 / MOBILE-02)

- **D-03: Bottom-sheet drawer pattern.** Slides up from the bottom edge. Thumb-reachable on phones (one-handed use), matches the mobile palette pattern (D-08), aligns with Pitfall 7's explicit recommendation. Backdrop `rgba(0,0,0,0.5)` dims top of screen; backdrop tap dismisses.

- **D-04: Trigger placement: leftmost top-bar slot, `☰` hamburger icon.** Replaces the path-label slot (already `display: none` at <=600px per existing globals.css line 338). Universally recruiter-readable — no terminal-jargon barrier. Renders only at <=960px; >960px shows the path label as today. Touch target >=44×44px (WCAG 2.5.5).

- **D-05: Drawer fit: `height: fit-content; max-height: 75vh; overflow-y: auto;`.** 7 file rows + recruiter resume card fit comfortably in ~500–600px; the cap prevents overflow on small phones. Internal scroll if STATUS or future additions push past 75vh. Backdrop visible above sheet so user retains spatial context.

- **D-06: Drawer auto-closes on route change.** Tap a file row → `router.push(pathname)` → drawer state set to closed. Standard mobile-nav pattern. Implementation: subscribe to pathname change in the drawer client island OR call `setOpen(false)` inside the row click handler before/after `router.push`. Planner picks cleanest approach.

- **D-07: Drawer contents = file tree + recruiter card.** Same 7 file rows + the "For recruiters / ↓ resume.pdf" card from the desktop sidebar (`Sidebar` component sections B–D in current `app/components/shell/sidebar.tsx`). STATUS block (section E) is **NOT** in the drawer — it rehomes to the about-view body per D-12. Touch targets per row >=44×44px (current desktop is `padding: 6px 16px` font-size 12px — too small for fingers; planner adds a mobile-only override).

### Mobile Palette UX (PALETTE-05)

- **D-08: Bottom-sheet form factor at <=960px.** Same `Command.Dialog` from Phase 2 (D-10) — Phase 4 wraps `[cmdk-dialog]` and `[cmdk-overlay]` with `@media (max-width: 960px)` rules that re-anchor it to `bottom: 0; top: auto; left: 0; right: 0; transform: none; width: 100vw; max-height: 80vh; border-radius: 12px 12px 0 0;`. Search input pinned at top of sheet; result list scrolls below. Keyboard appears below sheet so sheet stays usable. ~80vh leaves a hint of backdrop above.

- **D-09: ⌘K trigger label persists at every viewport.** The top-bar "⌘K" button keeps its label on mobile — Phase 2 D-10 locked it in the top-bar at every viewport, and engineers recognize it instantly while recruiters tap it as an unknown-but-obvious affordance. No icon swap, no responsive label change. Zero new responsive surface.

- **D-10: Search input auto-focuses on palette open (mobile + desktop).** Matches `cmdk` desktop default; type-to-filter is the primary use mode for engineers. Recruiters who want to scroll the verb list can dismiss the keyboard (iOS Done button, Android back gesture). Maximizes utility for the higher-intent user; loss of keyboard-screen-real-estate is acceptable.

- **D-11: Palette items get >=44×44px touch targets at <=960px.** Current `[cmdk-item]` is `padding: 10px 18px` font-size 13px (~36px tall). Planner adds `@media (max-width: 960px) { [cmdk-item] { padding: 14px 18px; } }` (or equivalent line-height bump) to reach 44px. Same approach for drawer file rows (D-07).

### STATUS Block Rehoming (MOBILE-04)

- **D-12: STATUS rehomes inside the about-view body, near bottom.** Renders as part of `app/components/views/about-view.tsx` (RSC) — appended after the bio/socials block, before the route boundary. Visible only on the about route, only at <=960px (`@media (max-width: 960px) { .about-status-mobile { display: block; } }`; `display: none` at >=961px). Desktop continues to show STATUS in the sidebar; mobile users land it on the about page. Same 3-row block visual as desktop (`● Available for hire`, `uptime: <Yy DDDd>`, `tz: <abbr> (flex)`) — reuses `.sb-status` / `.sb-status-row` CSS or introduces a thin `.about-status-mobile` variant.

- **D-13: STATUS does NOT render on other mobile views or in the drawer.** Recruiter usage pattern is "land on /about, scan for resume + contact". STATUS is a recruiter-trust signal (`Available for hire`) — placing it on the route they're most likely to land on suffices. Not rehomed into `.shell-footer` (would replicate on every route) and not rendered inside the drawer (Pitfall 7: STATUS belongs on a real page, not behind another overlay).

- **D-14: STATUS data source unchanged.** `uptime` still computed in the RSC `app/(terminal)/layout.tsx` via `formatUptime(CAREER_START_DATE, new Date())` (Phase 2 D-15), passed down. About-view RSC reads `CAREER_START_DATE` directly OR receives `uptime` as a prop from a small client wrapper. `tz` is computed client-side via `Intl.DateTimeFormat()` (same logic as `Sidebar` lines 31–43). Planner picks: extract `<StatusBlock>` primitive shared by Sidebar + about-view, or duplicate the 3-row markup. Preference: extract — DRY wins, ~30 lines.

### Print Stylesheet (A11Y-09)

- **D-15: `@media print` rule set covers all 7 views.** Single rule block in `app/globals.css`. Hides: `.topbar`, `.sidebar`, `[cmdk-overlay]`, `[cmdk-dialog]`, `.breadcrumb`, the new EXPLORER drawer + its trigger, `.skip-link`. White background (`background: #fff !important;`), black text (`color: #000 !important;`). Animations and cursor-blink: `animation: none !important;` on `*`. Recruiter prints whatever they're looking at — about/projects/experience are all viable print targets.

- **D-16: Print font: serif fallback.** `body { font-family: Georgia, "Times New Roman", serif !important; }` inside `@media print`. Mono on paper looks like a code dump and is harder to read on cheap printers — A11Y-09 explicitly says "force serif fallback". Code-block-like content (e.g. `.stack-pre`, `.prompt-line .cmd`) keeps a monospace family scoped to those selectors so JSON / commands stay legible.

- **D-17: Print-only footer with URL + email appended at end of `.terminal-main` body.** Implementation: an RSC `<PrintFooter />` component rendered (always) inside `app/(terminal)/layout.tsx`, with `display: none` outside `@media print`. Content: `{site URL} · {PROFILE.email}` — recruiter who saves a PDF can get back to the site. Reads `process.env.NEXT_PUBLIC_SITE_URL` (already wired Phase 1 / ROUTE-03) with `localhost` fallback.

- **D-18: Page-break behavior: natural flow, no forced single-page.** No `page-break-inside: avoid;` on view bodies. Long views (e.g. populated experience.log when Phase 6 lands) print across multiple pages. Trying to force one-page output loses content silently. Defensive `page-break-inside: avoid` on `.shell-footer` + `<PrintFooter />` so the URL+email line never splits.

### Resume CTA Above the Fold at 375px (MOBILE-03)

- **D-19: Top-bar resume button is the load-bearing affordance.** Persistent at 375px per Phase 2 / SHELL-03. Validation: at 375px viewport on `/`, the topbar's `↓ resume.pdf` button is visible without scrolling AND a manual screenshot review confirms the about-view's first content block also surfaces a resume affordance (the existing about-view ghost-button row already includes `↓ resume.pdf` per Phase 3 about-view layout — keep it). Belt-and-suspenders: top-bar button + about-view CTA both above fold.

### Test Strategy

- **D-20: TEST scope additions for Phase 4 are mostly visual + manual.** Vitest unit tests are limited because @media queries don't fire in jsdom. Concrete additions:
  - `drawer.test.tsx` — drawer client island opens on `☰` click, closes on file-row click, focus traps within, Esc dismisses, focus restores to trigger.
  - `palette.test.tsx` (extend existing TEST-03) — assert keydown still toggles at <=960px (component-level, not visual); existing aria-live + filter tests cover the rest.
  - **Manual screenshot review** at 375px / 768px / 1024px viewports for: top-bar resume above fold (about route), drawer open + closed states, palette bottom-sheet open, STATUS visible only on about <=960px, print preview on all 7 views.
  - **Print preview review** via browser print dialog (Cmd+P) on each view; assert no overflowing dark backgrounds, no top-bar/sidebar/drawer/palette artifacts, URL footer renders.

### Wave Sequencing (Claude's Discretion at Planning)

- **D-21: Suggested wave grouping** (planner can refine):
  - **Wave 1:** `app/globals.css` mobile + print rule additions (single CSS file edit — drawer styles, palette `@media (max-width: 960px)` overrides, about-view STATUS visibility, print rules)
  - **Wave 2 (parallel):**
    - 2a: `Drawer` client island (new `app/components/shell/explorer-drawer.tsx`) + `☰` trigger added to TopBar
    - 2b: `<StatusBlock />` shared primitive extracted (or duplicated into about-view); `Sidebar` updated to use it; `about-view.tsx` adds the mobile-only render
    - 2c: `<PrintFooter />` RSC component; `app/(terminal)/layout.tsx` mounts it
  - **Wave 3:** Vitest specs (drawer test, palette mobile-toggle assertion)
  - **Wave 4 (manual):** Cross-viewport screenshot review + print preview on all 7 views; recruiter-test dry run on 375px (recruiter test for production URL is Phase 7)

### Claude's Discretion

- **Drawer animation timing:** slide-in from bottom with ~200ms ease-out. `prefers-reduced-motion` block (already established Phase 2) disables the slide, fades only.
- **Drawer dismiss gestures:** backdrop tap = close (mandatory); swipe-down-to-close is nice-to-have, planner decides cost/benefit (`pointer-events` + `touchmove` math vs. a small library — but no new deps per CLAUDE.md, so swipe is hand-rolled or skipped).
- **Trigger button label for screen readers:** `aria-label="Open file explorer"` on the `☰` button; `aria-expanded` toggles with state.
- **375px top-bar layout (gray area we deferred):** existing breakpoints handle most of it. At 375px the top-bar order is: `☰` (hamburger) · `⌘K` · `☼/☾ theme` · `↓ resume.pdf`. Path label hidden (<=600px), traffic dots hidden (<=480px), LiveClock hidden (<=480px). Resume button can compress to icon-only `↓` if needed at <=375px while keeping `aria-label="Download resume"` — planner audits and decides at implementation.
- **Drawer + palette z-index discipline:** drawer overlay `z-index: 90`; palette overlay `z-index: 100` (existing); palette opens above drawer if both somehow active. They should be mutually exclusive (opening one closes the other — wire via `ShellStateProvider`).
- **Mobile sidebar CSS strategy:** `@media (max-width: 960px) { .sidebar { display: none; } }` IS allowed because it's paired with the drawer rehome (D-03..D-07) — not the failure mode Pitfall 7 warns against. `grep -E "display:\s*none" app/globals.css` audit (per ROADMAP success criterion 4) verifies every hidden sidebar selector has a corresponding mobile-home rule.
- **Touch-target enforcement:** `@media (max-width: 960px)` block bumps padding on `.sb-item`, `[cmdk-item]`, `.topbar-btn` to reach >=44×44px. Planner picks final padding values.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked decisions

- `.planning/PROJECT.md` — Vision, constraints (no Tailwind, pure CSS + custom properties), out-of-scope list, dual-audience non-negotiables (recruiter + engineer)
- `.planning/REQUIREMENTS.md` — **Phase 4 owns:** MOBILE-01..05, PALETTE-05, A11Y-09. Read these requirement bodies, not just the IDs.
- `.planning/ROADMAP.md` §"Phase 4: Mobile-Responsive" — Goal, 5 success criteria, depends-on Phase 3
- `CLAUDE.md` — Pure CSS only; no new prod deps beyond `next-themes` + `cmdk` (Phase 1 lock); persistent shell layout never unmounts (Phase 2 lock); plain-noun `aria-label`s; mobile redistribution rather than `display: none`; 5-second recruiter test as a real exit criterion

### Research convergence (settled, do not re-debate)

- `.planning/research/SUMMARY.md` §"Phase 4: Mobile-Responsive" — Mobile delivery list, must-avoid list (Pitfalls 6 + 7), done signal (375px every-element-accessible + recruiter test)
- `.planning/research/PITFALLS.md` Pitfall 6 — ⌘K accessibility traps; mobile-inert palette; explicit recommendation: hide ⌘K trigger and replace with bottom-sheet on mobile (Phase 4 honors this in spirit by keeping the trigger AND adding the bottom-sheet behind it — D-08/D-09)
- `.planning/research/PITFALLS.md` Pitfall 7 — Sidebar `display: none` with no replacement; explicit per-element rehome plan; 44×44px touch targets; mobile-first redesign principle
- `.planning/research/ARCHITECTURE.md` Pattern 1 — route-group persistent shell preserved across viewports (drawer client island plugs into the existing shell, doesn't replace it)

### Codebase intel (snapshot at 2026-05-06 / Phase 3 complete)

- `.planning/codebase/STACK.md` — `next-themes@^0.4.6`, `cmdk@^1.1.1`; no new dependencies for Phase 4
- `.planning/codebase/CONVENTIONS.md` — kebab-case files, PascalCase components, `@/` alias, RSC default with `"use client"` only when needed
- `.planning/codebase/STRUCTURE.md` — `app/components/shell/` for client islands; `app/components/primitives/` for RSC primitives

### Phase carry-forwards (locked decisions in effect)

- `.planning/phases/02-shell/02-CONTEXT.md` — **D-10** (Phase 2 ships desktop centered modal at every viewport; Phase 4 wraps with mobile bottom-sheet); **D-15** (STATUS block contents: `● Available for hire` / `uptime: <Yy DDDd>` / `tz: <abbr> (flex)`); **D-09** (localStorage keys: `theme`, `portfolio-accent`); **D-11** (5 client islands locked — Phase 4 adds a 6th: `ExplorerDrawer`); **D-21 Wave 1** (`globals.css` is the token+CSS slot to extend; pure CSS only)
- `.planning/phases/02-shell/02-UI-SPEC.md` — Visual contract for top-bar, sidebar, palette; Phase 4 must not regress these at >=961px
- `.planning/phases/03-views/03-CONTEXT.md` — D-08 (`<ExternalLink>` primitive — Phase 4 print stylesheet should preserve external-link signals on print); D-12..D-15 (shipped-view layout — Phase 4 print preview must verify these print legibly)

### Existing source-of-truth files (Phase 4 reads, edits, or wraps)

- `app/globals.css` — Phase 4 appends mobile + print rule blocks (single file edit; ~150–250 new lines)
- `app/components/shell/top-bar.tsx` — Phase 4 adds the `☰` drawer trigger (leftmost slot)
- `app/components/shell/sidebar.tsx` — Phase 4 may extract `<StatusBlock />` primitive (D-14) so about-view can reuse it
- `app/components/shell/command-palette.tsx` — Phase 4 does NOT modify the component; only `[cmdk-dialog]` / `[cmdk-overlay]` CSS gets `@media` overrides
- `app/components/shell/shell-state-provider.tsx` — Phase 4 may add a `useDrawer()` slice (open/close state) alongside `usePalette()` and `useAccent()`; or use a local `useState` if drawer state doesn't need to be shared with palette/topbar buttons (planner decides)
- `app/components/views/about-view.tsx` — Phase 4 adds the mobile-only STATUS block render
- `app/(terminal)/layout.tsx` — Phase 4 mounts a new `<PrintFooter />` RSC; new `<ExplorerDrawer />` client island either mounts here or inside `<TopBar>` (planner decides)
- `lib/uptime.ts`, `lib/portfolio-data.ts` (`CAREER_START_DATE`) — STATUS data sources, unchanged

### Design reference (canonical for visual ambiguity)

- `design_handoff_terminal_portfolio/README.md` — Desktop-first design spec; **does not include explicit mobile/responsive guidance**. Phase 4 mobile UX is partly first-principles design constrained by handoff aesthetic (oklch tokens, JetBrains Mono, prompt-line + cursor-block). Refer to typography scale + spacing scale for drawer/sheet padding values.
- `design_handoff_terminal_portfolio/app.jsx` — Desktop reference; lines 240–272 (palette CSS shape — Phase 4 wraps these), 504+ (sidebar `<aside>` — Phase 4 hides this <=960px and reroutes contents to drawer + about-view)

### External docs (referenced — read on demand)

- [cmdk on npm](https://www.npmjs.com/package/cmdk) — `Command.Dialog` styling: `[cmdk-dialog]` and `[cmdk-overlay]` attribute selectors are the Phase 4 mobile override hooks
- [WCAG 2.5.5 — Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 44×44 CSS pixel minimum for touch targets
- [MDN @media print](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features) — print media query reference for A11Y-09
- [Next.js Layout API](https://nextjs.org/docs/app/api-reference/file-conventions/layout) — Phase 4 adds `<PrintFooter />` mount inside the route-group layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`app/components/shell/sidebar.tsx`** — STATUS block markup (lines 87–101) and `tz` computation (lines 31–43) extract cleanly into a shared `<StatusBlock />` primitive. Sidebar continues to use it on desktop; about-view RSC consumes it on mobile (D-14).
- **`app/components/shell/shell-state-provider.tsx`** — already provides `usePalette()` and `useAccent()`; adding `useDrawer()` alongside is a small extension (5–15 lines). Or use local `useState` in `<ExplorerDrawer />` if no other component needs to control it.
- **`app/components/primitives/prompt-line.tsx`** + cursor-blink CSS — already has `prefers-reduced-motion` block (Phase 2 defensive baseline). Print stylesheet should explicitly hide `.cursor` and disable any remaining animations.
- **`app/globals.css`** — single CSS file, pure CSS, token-driven (`var(--accent)`, `var(--panel)`, etc.). Phase 4 appends mobile + print rule blocks at the end (or grouped with related desktop rules — planner chooses for readability).
- **`lib/uptime.ts`** + **`CAREER_START_DATE`** in `lib/portfolio-data.ts` — STATUS data unchanged; about-view consumes them via the same path the layout uses.
- **`PROFILE.email`** + `process.env.NEXT_PUBLIC_SITE_URL` — print footer data sources, both already wired.

### Established Patterns

- **5 client islands** (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb`) — Phase 4 adds a **6th**: `ExplorerDrawer`. `<PrintFooter />` is RSC (no interactivity needed). All other Phase 4 work is CSS additions in `globals.css`.
- **`@media` queries appended in `globals.css`** — existing examples at lines 152 (`prefers-reduced-motion`), 338 (`max-width: 600px`), 343 (`max-width: 480px`). Phase 4 follows the same pattern with `max-width: 960px` and `@media print` blocks.
- **Pure CSS only — no Tailwind, no CSS modules** — locked CLAUDE.md / Phase 1.
- **Native fetch / `next: { revalidate }` for data** — Phase 4 fetches nothing.

### Integration Points

- **`app/components/shell/top-bar.tsx`** — gains a leading `<button class="topbar-hamburger" aria-label="Open file explorer">☰</button>` rendered only at <=960px (CSS show/hide). Click handler toggles drawer state.
- **`app/(terminal)/layout.tsx`** — gains `<ExplorerDrawer />` mount (sibling to `<CommandPalette />`) and `<PrintFooter />` mount (inside `.terminal-main` after `.shell-footer`, or as a sibling — planner picks).
- **`app/components/shell/explorer-drawer.tsx`** — NEW client island. Renders the same 7 file rows from `lib/routes.ts` + the recruiter "↓ resume.pdf" card. Mounts a `<dialog>` or a custom backdrop+sheet.
- **`app/components/views/about-view.tsx`** — gains a mobile-only `<StatusBlock />` render near the bottom (CSS show/hide via `@media (max-width: 960px)`).
- **`app/components/shell/sidebar.tsx`** — extracts STATUS markup into `<StatusBlock />` (or about-view duplicates it; planner picks). Sidebar itself gets `display: none` at <=960px (paired rehome rules per Pitfall 7 audit).
- **`app/components/print-footer.tsx`** (or inline in shell layout) — NEW RSC component. Renders site URL + email; visible only via `@media print` rules.
- **`vitest.config.ts`** + setup — Phase 4 doesn't add deps; existing `@testing-library/user-event` (Phase 2) covers drawer keyboard interactions.

</code_context>

<specifics>
## Specific Ideas

- **Bottom-sheet visual:** matches the palette mobile bottom-sheet (D-08) — `border-radius: 12px 12px 0 0`, slides up from bottom, ~200ms ease-out, backdrop `rgba(0,0,0,0.5)` (same as palette overlay).
- **Hamburger icon:** Unicode `☰` (U+2630). Keeps the project's "no SVG icon library" stance (Phase 1 / Phase 2 use Unicode glyphs everywhere — `▾`, `●`, `◆`, `↓`, `↗`, etc.).
- **Drawer file-row visual:** identical to the desktop sidebar rows (`.sb-item` with the route icon + label) but with `padding: 14px 16px` instead of `6px 16px` to reach 44px touch target. Same active-row treatment (border-left accent).
- **Recruiter card inside drawer:** identical to desktop (`For recruiters` label + `↓ resume.pdf` button). The drawer is where mobile recruiters see the explicit "for recruiters" frame; the top-bar resume button is the always-visible fallback.
- **STATUS on about-view:** same 3-row visual as the desktop sidebar block. Heading "STATUS" rendered above the rows (matches sidebar). Indented or separated from the bio with a subtle `border-top: 1px solid var(--border); padding-top: 16px;`.
- **Print footer copy:** `{site URL} · {email}` separated by middle-dot, monospace small-caps optional. Example: `bakytbek.dev · beckprograms@gmail.com`.
- **Print stylesheet placement:** End of `app/globals.css` so it's the last rule block — easier to find, easier to audit. Wrap entire phase-4 print rules in a single `@media print { ... }` block, not scattered.

</specifics>

<deferred>
## Deferred Ideas

- **375px top-bar layout deep-dive** — gray area surfaced but not selected for discussion. Existing breakpoints (path label @ 600, traffic dots + LiveClock @ 480) plus the new `☰` slot suffice. If implementation reveals top-bar overflow at 375px, planner adds an icon-only resume variant (`↓` only, keeping `aria-label="Download resume"`); decision noted in Claude's Discretion (D-21).
- **Swipe-down-to-close on bottom-sheets** — nice-to-have. Hand-rolled (no new deps per CLAUDE.md). Backdrop tap + Esc key already cover dismissal — swipe is sugar. Planner decides cost/benefit during implementation.
- **Haptic feedback on drawer/palette open (iOS)** — `navigator.vibrate` is unreliable on iOS Safari; deferred unless a recruiter test specifically calls it out.
- **Recruiter test on 375px production URL** — Phase 7 (DEPLOY-04). Phase 4 does a dry-run during manual review; the real test runs against the production deploy.
- **`prefers-reduced-motion` comprehensive audit** — Phase 5 (A11Y-03). Phase 4 ships defensive `prefers-reduced-motion` rules for the new drawer slide animation only; the full pass over every keyframe is Phase 5.
- **8-combination contrast audit (4 hues × 2 themes)** — Phase 5 (A11Y-07). Mobile drawer + bottom-sheet palette must pass; per-hue chroma overrides may surface as Phase 5 rework into `globals.css`.
- **Per-view print micro-styling** (e.g. `stack.json` syntax-highlighter staying mono on print, `experience.log` with print-friendly hex-hash decoration) — Phase 4 ships the universal rules (D-15..D-18); per-view tuning reviewed in print-preview audit and tracked here if needed for v1.x.
- **Drawer "search in palette instead" hint at the bottom of the bottom-sheet** — UX nice-to-have, not requirement.

### Reviewed Todos (not folded)

None — no pending todos in `.planning/todos/` matched Phase 4 scope.

</deferred>

---

*Phase: 04-mobile-responsive*
*Context gathered: 2026-05-07*
