# Stack Research

**Domain:** Next.js 15 / React 19 / TypeScript portfolio — terminal/IDE redesign add-ons
**Researched:** 2026-05-06
**Confidence:** HIGH (primary additions verified against npm latest + maintainer release notes; auxiliary recommendations rated individually below)

> **Brownfield scope.** The base stack (Next.js 15.3.2, React 19.1.0, TypeScript 5.8.3 strict, Vitest 3.1.4, pure CSS in `app/globals.css`) is locked by `.planning/codebase/STACK.md` and `PROJECT.md` constraints. This file recommends only the *new* dependencies needed for the terminal redesign milestone, plus posture decisions for things that should stay native.

## Recommended Stack

### Core Additions (production deps)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| `next-themes` | `^0.4.6` (latest, 2025-03-11) | Light/dark theme management with `data-theme` attribute, OS-preference detection, localStorage persistence, no SSR flash | Hand-off explicitly recommends it; peer deps now declare `react ^19` and `react-dom ^19` so it drops into the existing React 19.1 codebase cleanly. Replaces existing hand-rolled `app/components/theme-toggle.tsx` and gives focus-management + flash-prevention for free. The `attribute="data-theme"` API matches the hand-off's `[data-theme="dark"]` CSS-variable block 1:1. | HIGH |
| `cmdk` | `^1.1.1` (latest, 2025-03-14) | ⌘K command palette: open each view, download résumé, toggle theme, open each social, type-to-filter | Hand-off explicitly recommends it; React-19/Next-15 compatibility was fixed in `1.0.3` (use-sync-external-store shim) and `1.1.0` removes the shim entirely in favor of React's built-in `useSyncExternalStore`. Peer deps now declare `react ^18 \|\| ^19 \|\| ^19.0.0-rc`. Built-in focus trap, keyboard nav, ARIA, and filtering — exactly the four behaviors the milestone needs. | HIGH |

### Font Loading (no new dep)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| `next/font/google` (built into Next.js 15.3.2) — `import { JetBrains_Mono } from "next/font/google"` in `app/layout.tsx`, exported as a CSS variable, applied on `<html className={jetbrainsMono.variable}>` | Self-host JetBrains Mono (weights 400/500/600/700) per hand-off typography spec, with zero CLS and no runtime fetch | No new package needed — `next/font` is part of Next.js. Hand-off explicitly says "Use `next/font/google` for self-hosting." Subset to `latin` and load only the four weights actually used to keep the font payload tight on mobile. | HIGH |

### Optional — Real Icons (defer past v1 unless Unicode renders inconsistently)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `lucide-react` | `^1.14.0` (latest, 2026-04-29; the `lucide-react` line cut a stable `1.0.0` from the previous `0.x` versioning in late 2025) | Replace Unicode glyphs (`▾▸◆≡↓↗↵●`) with crisp SVG icons (`FolderIcon`, `FileTextIcon`, `DownloadIcon`, `TerminalIcon`) | **DO NOT add in v1.** Hand-off says "All glyphs are Unicode … If you prefer real icons, swap in `lucide-react`." Unicode renders fine on macOS / iOS / modern Android; the icons get the design across the line faster. Add only if QA on Windows or older Android shows glyph fallback ugliness — and even then, scope to a single icon-mapping module. Tree-shakable per-import (`import { FolderIcon } from "lucide-react"`), so cost is bounded if it's added later. | MEDIUM (recommendation), HIGH (compatibility — peer dep is `react ^16.5.1 \|\| ^17 \|\| ^18 \|\| ^19`) |

### Animation — Native CSS (no new dep)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| Pure CSS `@keyframes` + `animation` declarations in `app/globals.css`, plus `prefers-reduced-motion` media query | View `slideIn` (0.25s `opacity 0 → 1`, `translateY 2px → 0`), prompt cursor blink (`1s steps(2) infinite` on an 8×14px accent block), boot-time breadcrumb fade-in (`350ms` delay) | Every motion in the hand-off is short, single-property, deterministic, and unconditional — there is **no orchestration, no gesture, no layout animation, no exit animation**. Framer Motion / `motion` (12.38.0) would add ~50 KB gzipped to the client bundle for animations that compile to ~20 lines of CSS. Stays consistent with the project constraint "continue with pure CSS + CSS variables." Respect `prefers-reduced-motion` by zeroing animation duration in a media query. | HIGH |

### Accent Hue Swap — Pure CSS Custom Properties (no new dep)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| Single `--accent-h` CSS custom property on `<html>` (e.g. `145`, `75`, `200`, `340`) consumed by all accent tokens declared as `oklch(L C var(--accent-h))`. A small client-side `AccentProvider` reads/writes `localStorage["accent"]` and sets the inline style on the document element. | Hand-off specifies four accent presets (matrix 145, amber 75, cyan 200, magenta 340) that derive every accent variant (`--accent`, `--accent-dim`, `--accent-bg`, `--warn`) from one hue value | Modern browsers (Safari 15.4+, Chrome 111+, Firefox 113+) all support `oklch()` natively, and CSS custom properties can be swapped at runtime in O(1) without touching any component. Token shape becomes `--accent: oklch(0.78 0.18 var(--accent-h));` — the `--accent-h` value is the only thing that changes. No JS color library (chroma-js, colord) needed. The `AccentProvider` is ~40 lines of TypeScript on top of `next-themes`'s pattern. | HIGH |

### API Client — Keep Native `fetch` (no new dep)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| Continue with the existing `lib/api.ts` pattern: native `fetch` + `next: { revalidate: 300 }` for ISR + `try/catch` fallback to `lib/portfolio-data.ts` (renamed from `lib/fallback-data.ts` per hand-off) | Server-side data fetching for the six content endpoints (`/api/profile`, `/api/skills`, `/api/experience`, `/api/apps`, `/api/posts`, new `/api/projects`) | The portfolio renders content **on the server** in App Router server components. SWR and React Query are client-side cache layers — they would add bundle weight without fixing any problem the existing setup has. The five-minute ISR window plus static fallback already gives "stale-while-revalidate" behavior at the CDN level. The only client-side state in this app is `{ theme, accent, paletteOpen }`, which is local UI state, not server cache. **Do not introduce SWR or React Query.** | HIGH |

### State Management — React Context, no Zustand (no new dep)

| Approach | Purpose | Why Recommended | Confidence |
|----------|---------|-----------------|------------|
| Two small Context providers: `ThemeProvider` (from `next-themes`) and a sibling `AccentProvider` (~40 LOC) for the hue token. Command-palette open state is local to the `<CommandPalette />` component. | Manage `{ theme, accent, paletteOpen }` — the only client-side state in the redesign | Hand-off says "React Context (or Zustand)." Context is sufficient: three booleans/strings, no cross-component derived state, no perf-sensitive subscribers. Zustand would be over-engineering for this surface area, and adding it would contradict the "no new state library" notable absence in the existing stack. | HIGH |

### Development Tools (no changes)

| Tool | Purpose | Notes |
|------|---------|-------|
| `vitest` 3.1.4 + `@testing-library/react` 16.2.0 + `jsdom` 26.1.0 (existing) | Test the terminal shell, view switching, ⌘K palette, theme toggle, accent picker | Already in place. Add `userEvent` (`@testing-library/user-event`) for keyboard-driven palette tests if not already implicitly available; verify before adding. |
| `eslint` 8.57.0 + `eslint-config-next` 15.3.2 (existing) | Lint | Already in place. No new plugins needed for these additions. |
| `typescript` 5.8.3 strict (existing) | Types | Both `next-themes` and `cmdk` ship their own types — no `@types/*` packages needed. |

## Installation

```bash
npm install next-themes@^0.4.6 cmdk@^1.1.1
```

That's it. **One line, two packages.** No new dev dependencies, no icon library in v1, no animation library, no data-fetching library, no state library, no styling framework. Everything else either already exists in the codebase or is built into Next.js 15.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `next-themes` 0.4.6 | Hand-rolled theme provider (the existing `app/components/theme-toggle.tsx` pattern) | Never for this milestone. The existing implementation lacks SSR-flash prevention and OS-preference detection on first load — both are explicit requirements. Replacing it with `next-themes` is a net code reduction. |
| `cmdk` 1.1.1 | `react-cmdk` (different package, by Albin Groen) | Don't. `react-cmdk` is heavier, more opinionated about styling, and not what the hand-off references. `cmdk` (by Paco Coursey, used by Vercel, Linear, Raycast docs) is the unstyled primitive the hand-off recommends. |
| `cmdk` 1.1.1 | Build the palette from scratch with a `<dialog>` element | Tempting because the visual is simple — but focus trap, type-ahead filter, ARIA roles, keyboard navigation, and IME-composition handling are all non-trivial to get right. cmdk is ~6 KB gzipped and solves all four. |
| Pure CSS animations | `motion` (formerly `framer-motion`) 12.38.0 | Add **only** if a future milestone introduces gesture-driven UI, layout-animation transitions, or shared-element transitions. None of the v1 motion specs justify it. |
| Native `fetch` + ISR | SWR 2.4.1 | Add **only** if the app shifts to client-side data fetching (e.g. real-time dashboards, user-authenticated content). Static portfolio content does not justify a client cache layer. |
| Native `fetch` + ISR | TanStack Query 5.100.9 | Same answer as SWR, with stronger reason — TanStack Query's value (mutations, invalidation, optimistic updates) is irrelevant to a read-only portfolio. |
| Unicode glyphs | `lucide-react` 1.14.0 | Add only if QA on Windows / older Android shows ugly Unicode fallback rendering. Defer past v1. |
| React Context for `{theme, accent}` | Zustand | Add only if a later milestone introduces multi-component derived UI state (e.g. drag-to-reorder, multi-pane editor). Three flags do not justify it. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `tailwindcss` | Hand-off palette is **token-driven with runtime hue swap** — `oklch(L C var(--accent-h))` cannot be expressed cleanly in Tailwind without `@layer`/arbitrary-value gymnastics, and Tailwind's purge step doesn't help for runtime-derived values. Project constraint also explicitly bars it: "Continue with pure CSS + CSS custom properties. No Tailwind, no CSS modules introduction." | Pure CSS in `app/globals.css` with CSS custom properties as already established. |
| `styled-components` / `emotion` | Adds runtime CSS-in-JS overhead, conflicts with React Server Components (extra config to make them work in App Router), and the design system is already CSS-variable-driven. | Pure CSS in `app/globals.css`. |
| `@radix-ui/react-dialog` (just for the palette modal) | `cmdk` is built **on top of** the same Radix primitives internally and gives you the dialog + listbox + filter logic in one package. Adding Radix Dialog separately would duplicate dependencies. | `cmdk`'s `<Command.Dialog>` (or `<Command>` inside your own `<dialog>` if you want full DOM control). |
| `react-icons` | Aggregates ~30 icon packs; tree-shaking is unreliable and bundle bloat is real. | If icons are needed, `lucide-react` (single design system, per-import tree-shaking). Otherwise stay on Unicode. |
| `axios` | Adds ~13 KB for capabilities native `fetch` already covers. The existing `lib/api.ts` already uses `fetch` with Next.js's ISR-aware second argument. | Native `fetch` with `next: { revalidate }`. |
| `framer-motion` / `motion` (in v1) | Hand-off motion is three CSS animations totaling ~20 lines. ~50 KB gzipped to skip writing those is not worth it. | CSS `@keyframes` + `animation`. |
| `chroma-js` / `colord` / any JS color library | Hand-off palette is `oklch()`-based and runtime hue swap is a single CSS variable change. There is no scenario in v1 where palette math needs to happen in JS. | CSS `oklch(L C var(--accent-h))` with one custom property. |
| `zustand` / `jotai` / `recoil` | The total client-side state in this app is `{ theme, accent, paletteOpen }`. Three values do not need a state library. | React Context (one provider for theme/accent, local state for palette open/close). |
| `swr` / `@tanstack/react-query` | All content is fetched server-side in server components with ISR. There is no client-side cache to manage. | Native `fetch` + `next: { revalidate: 300 }` — already the established pattern. |
| `next-themes` 0.3.x (older line) | Pre-React-19 peer dependency; `0.3.x` did not officially declare React 19 support and will trigger npm peer warnings. | `next-themes` 0.4.6 (current latest, peer deps include `react ^19`). |
| `cmdk` 1.0.0–1.0.2 | Had `use-sync-external-store` shim that conflicted with React 19 / Next 15 (tracked in shadcn-ui/ui#6601). Fixed in 1.0.3, fully resolved in 1.1.0 by switching to React's built-in `useSyncExternalStore`. | `cmdk` 1.1.1 (current latest). |

## Stack Patterns by Variant

**If `next-themes` SSR flash still appears after standard setup:**
- Add `suppressHydrationWarning` on `<html>` in `app/layout.tsx` (per the package's official Next.js App Router guide)
- Set `ThemeProvider` props: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `storageKey="theme"`
- Render the theme-toggle button only after `useEffect` has run (`mounted` flag) so server HTML doesn't include a stale icon
- Do NOT use `next/dynamic({ ssr: false })` on the whole shell — that would defeat the per-view SEO requirement

**If a recruiter-mode (no-⌘K) accessibility issue surfaces on mobile:**
- The ⌘K palette is a desktop convenience; mobile already has the bottom-sheet file switcher and the visible "↓ resume.pdf" button per hand-off
- Render the ⌘K trigger button only when `(min-width: 960px)` matches, OR keep it visible but render an alternate touch trigger
- `cmdk`'s API supports both — no library swap needed

**If accent-hue palette needs more than 4 presets later:**
- The CSS variable approach is open-ended: any integer 0–360 is valid for `--accent-h`. Adding presets is a one-line `<option>` change in the picker, no token rewrite required.

## Version Compatibility

| Package | Verified Against | Notes |
|---------|------------------|-------|
| `next-themes@0.4.6` | `next@15.3.2`, `react@19.1.0`, `react-dom@19.1.0` | Peer deps: `react: ^16.8 \|\| ^17 \|\| ^18 \|\| ^19 \|\| ^19.0.0-rc`. App Router compatible — use `attribute="data-theme"` per hand-off. |
| `cmdk@1.1.1` | `next@15.3.2`, `react@19.1.0`, `react-dom@19.1.0` | Peer deps: `react: ^18 \|\| ^19 \|\| ^19.0.0-rc`. React-19 / Next-15 compatibility resolved in 1.0.3+ and reinforced in 1.1.0. **Do not pin below 1.0.3.** |
| `lucide-react@1.14.0` (if added later) | `react@19.1.0` | Peer deps: `react: ^16.5.1 \|\| ^17 \|\| ^18 \|\| ^19`. Note: the `lucide-react` package transitioned from `0.x` to `1.0.0` stable in late 2025 — treat anything below `1.0.0` as legacy. |

## Sources

- [next-themes on npm](https://www.npmjs.com/package/next-themes) — verified version 0.4.6 (latest, modified 2025-03-11) and React 19 peer dependency (HIGH)
- [pacocoursey/next-themes on GitHub](https://github.com/pacocoursey/next-themes) — verified `attribute="data-theme"` API and `suppressHydrationWarning` Next.js App Router pattern (HIGH)
- [cmdk on npm](https://www.npmjs.com/package/cmdk) — verified version 1.1.1 (latest, modified 2025-03-14) and React 18/19 peer dependency (HIGH)
- [cmdk releases on GitHub](https://github.com/pacocoursey/cmdk/releases) — verified that 1.0.3 fixed the `use-sync-external-store` shim for Next.js 15 / React 19 RC, and 1.1.0 removed the shim entirely in favor of React's built-in `useSyncExternalStore` (HIGH)
- [shadcn-ui/ui#6601](https://github.com/shadcn-ui/ui/issues/6601) — context for the React 19 / cmdk friction that has since been resolved (MEDIUM, used only to confirm the historical issue is closed in current cmdk)
- [lucide-react on npm](https://www.npmjs.com/package/lucide-react) — verified version 1.14.0 (latest, modified 2026-04-29) and React 19 compatibility (HIGH)
- [Next.js docs — `next/font/google`](https://nextjs.org/docs/app/api-reference/components/font) — verified that `next/font/google` is built into Next.js 15 with no extra install (HIGH)
- `.planning/PROJECT.md` — project constraints (no Tailwind, no CSS modules, keep API model, defer tweaks panel) (HIGH)
- `.planning/codebase/STACK.md` — existing dependency snapshot (HIGH)
- `design_handoff_terminal_portfolio/README.md` — hand-off library recommendations and design tokens (HIGH)

---
*Stack research for: terminal/IDE portfolio add-ons on Next.js 15 / React 19*
*Researched: 2026-05-06*
