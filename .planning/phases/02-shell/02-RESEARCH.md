# Phase 2: Shell — Research

**Researched:** 2026-05-06
**Domain:** Next.js 15.5 App Router persistent terminal shell — RSC/client island composition, dual-script SSR-flash prevention (next-themes + accent), cmdk command palette, JetBrains Mono via next/font, oklch token system, Vitest jsdom coverage
**Confidence:** HIGH (all stack/architecture decisions are project-level convergent and locked in CONTEXT.md; verification focused on the high-value implementation details — cmdk keywords filter behavior, next-themes v0.4.6 API, next/font/google config, Radix Dialog.Title requirement, Next.js 15.5 layout/route-group behavior)

## Summary

Phase 2 ships the load-bearing terminal shell: a route-group persistent layout (`app/(terminal)/layout.tsx`) that never unmounts on sibling navigation, an RSC root layout (`app/layout.tsx`) hosting two pre-paint scripts (next-themes' built-in injection + a custom `AccentBootstrapScript` for `--accent-hue`), JetBrains Mono via `next/font/google` exported as `--font-mono`, the full oklch token palette in `app/globals.css` with `@supports` sRGB fallbacks, five client islands (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb`), seven thin RSC route stubs so palette navigation resolves, `app/sitemap.ts` rewritten to iterate `lib/routes.ts`, terminal-styled `app/not-found.tsx`, and Vitest coverage for shell + palette + theme/accent. Brownfield deletions (`homepage.tsx`, `homepage.test.tsx`, `theme-toggle.tsx`, the existing stub `themeScript` in `app/layout.tsx`, the existing `app/page.tsx`) ship in the same commit as their replacements.

Most architectural decisions are already locked at the project level (`research/SUMMARY.md`, `research/ARCHITECTURE.md`) and at the phase level (`02-CONTEXT.md` D-01..D-21). Research value here is concentrated in the implementation details where the planner needs precise guidance: exact `next/font/google` config to avoid CLS Pitfall 10, exact `AccentBootstrapScript` IIFE shape, Radix `Dialog.Title` accessibility requirement that cmdk inherits, `Command.Item` `keywords` filter behavior (substring match on `value + ' ' + keywords.join(' ')`), and the Vitest jsdom approach for `⌘K` keydown simulation.

**Primary recommendation:** Plan five waves matching D-21: (1) globals.css token expansion, (2) root providers + brownfield deletions in one commit, (3) shell layout + 5 client islands + primitives, (4) 7 route stubs + sitemap + 404, (5) Vitest specs. Use `@testing-library/user-event@14.6.1` for `⌘K` keydown simulation in TEST-03. Honor every CLAUDE.md constraint — pure CSS only, exactly the two installed prod deps, RSC-default discipline.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Command Palette — Verb Taxonomy & Layout (D-01..D-05):**
- D-01: Verb naming convention: `Open <file-label>` matching sidebar exactly (`Open about.md`, `Open projects/`, `Open stack.json`, `Open experience.log`, `Open writing/`, `Open contact.sh`, `Open shipped.app`)
- D-02: Flat list, no group headings — single `Command.List` from cmdk
- D-03: Accent hue via four explicit verbs `Set accent: matrix|amber|cyan|magenta`. NO cycle verb, NO sub-page, NO swatches
- D-04: Every palette item carries `keywords: string[]` for alias filtering. Aliases live in `lib/palette-verbs.ts` (planner's preference per Specifics §; alternative: inline in `command-palette.tsx`). Seeds locked in CONTEXT.md table
- D-05: Final verb count ~19 (≥16 floor): 7 routes + 1 download + 1 toggle theme + 4 set-accent + 3 socials + 1 copy email + 1 copy GitHub URL + 1 share view

**Accent Picker UI (D-06):** Palette-only — NO top-bar swatches, NO sidebar STATUS swatches, NO dedicated accent button.

**Theme System Wiring (D-07..D-09):**
- D-07: `ThemeProvider` config: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`
- D-08: Two pre-paint scripts in `<head>` — next-themes injects automatically; separate `AccentBootstrapScript` (RSC) emits inline IIFE reading `localStorage["portfolio-accent"]` (default `"145"`) → `documentElement.style.setProperty('--accent-hue', hue)`. Existing stub `themeScript` block in `app/layout.tsx` deleted in same commit
- D-09: localStorage keys `theme` (next-themes default — do NOT override) and `portfolio-accent` (custom)

**Mobile Palette Scope (D-10):** Phase 2 ships desktop centered modal at every viewport. ⌘K trigger button visible at every viewport. Phase 4 wraps with `@media (max-width: 960px)` bottom-sheet styling.

**Shell Composition & RSC Boundaries (D-11):** Five client islands: `TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb` (the additional one beyond the originally planned 4 — depends on `usePathname()`). Everything else RSC.

**Route Stubs (D-12, D-13):** Phase 2 ships seven thin route stubs. Each is minimal RSC: `<PromptLine cmd="<command>" />` + `<p>// view body lands in Phase 3</p>`. Each exports `metadata: { title: "<file-label> — Bakytbek Tatibekov" }`. Stub prompts:
- `/` (about.md): `$ cat about.md`
- `/projects`: `$ ls -la projects/`
- `/stack`: `$ cat stack.json | jq`
- `/experience`: `$ git log --oneline --decorate experience.log`
- `/writing`: `$ ls writing/ && cat *.md`
- `/contact`: `$ ./contact.sh --whoami`
- `/shipped`: `$ ls -la shipped/`

**Live Clock & Status Block (D-14, D-15):**
- D-14: LiveClock format 24h `HH:MM` user local, 30s interval, `aria-hidden="true"`. Hydration-mismatch prevention: render `--:--` server-side; replace after `useEffect` fires
- D-15: Sidebar STATUS defaults — `● Available for hire` (static), `uptime: <Yy DDDd>` from `CAREER_START_DATE` constant in `lib/portfolio-data.ts` via `formatUptime(start, now)` helper in `lib/uptime.ts` (RSC computation), `tz: <abbreviation> (flex)` via `Intl.DateTimeFormat().resolvedOptions().timeZone` in Sidebar client island

**Brownfield Deletions (D-16):** Same-commit deletions:
- `app/components/homepage.tsx`
- `app/components/homepage.test.tsx`
- `app/components/theme-toggle.tsx`
- `themeScript` literal block + `<script dangerouslySetInnerHTML>` in existing `app/layout.tsx`
- Existing root `app/page.tsx` (replaced by `app/(terminal)/page.tsx`)

**404 Handling (D-17):** `app/not-found.tsx` lives at root, renders inside terminal shell. Copy: `$ ls -la <pathname>` + `ls: cannot access '<pathname>': No such file or directory` + list of all 7 routes. HTTP 404 automatic via Next.js convention.

**Test Strategy (D-18..D-20):**
- D-18 TEST-02 shell: TopBar affordances, Sidebar 7 rows from `lib/routes.ts` with correct `aria-label`, mocked `useSelectedLayoutSegment()` → `aria-current="page"`
- D-19 TEST-03 palette: closed-by-default, `⌘K` keydown opens, focus trapped, type `"contact"` filters to `Open contact.sh` + `Copy email`, `Esc` restores focus to trigger, `aria-live` announces count
- D-20 TEST-04 theme + accent: presence-and-content assertion on `AccentBootstrapScript` IIFE source string; mount with `localStorage["portfolio-accent"] = "75"` → assert `--accent-hue` is `"75"` after first effect; theme toggle swaps `data-theme` + writes `localStorage["theme"]`. NO SSR-flash test in jsdom.

**Wave Sequencing (D-21):** Wave 1: globals.css. Wave 2: root providers + brownfield deletions (sequential after Wave 1). Wave 3: shell layout + 5 client islands + primitives. Wave 4: 7 stubs + sitemap + 404. Wave 5: Vitest specs. Waves 3–5 may parallelize.

### Claude's Discretion

- **TopBar narrow-viewport precedence:** Resume + theme toggle + ⌘K trigger stay visible at every viewport. Path label hides below ~600px. Traffic-light dots hide below ~480px. LiveClock hides below ~480px.
- **Inline-script CSP nuance:** Phase 2 ships inline scripts as `<script dangerouslySetInnerHTML>` (no nonce). CSP nonce work stays deferred per Phase 1 D-15.
- **Boot animation:** `slideIn` on first mount only; subsequent navigations skip (`useState(true)` flag). `prefers-reduced-motion` block disables it.
- **Cursor-blink primitive:** `app/components/primitives/prompt-line.tsx`. 1s `steps(2)` infinite, 8×14px accent block.
- **`<ExternalLink>` shared component:** Phase 3 (SEO-05). Phase 2 calls `window.open(url, "_blank", "noopener,noreferrer")` directly from palette social verbs.
- **Palette item action plumbing:** navigate verbs use `useRouter().push(pathname)`; download verbs use synthetic `<a download>` click; copy verbs use `navigator.clipboard.writeText` with `aria-live` toast (or reuse result-count region).
- **`ShellStateProvider` API:** `usePalette()` → `{open, setOpen, toggle}`; `useAccent()` → `{hue, setHue}` (writes through to `--accent-hue` + `localStorage["portfolio-accent"]`).

### Deferred Ideas (OUT OF SCOPE for Phase 2)

- Mobile palette bottom-sheet styling + mobile trigger — Phase 4 (PALETTE-05 + MOBILE-02)
- Sidebar bottom-sheet drawer + STATUS rehoming + 240px collapse — Phase 4 (MOBILE-01..04)
- Per-view metadata enrichment (description, alternates.canonical, OG) — Phase 3 (ROUTE-02)
- `<ExternalLink>` shared component — Phase 3 (SEO-05)
- OG images, JSON-LD, favicon set, Twitter card — Phase 5 (SEO-01..04)
- `@axe-core/playwright` 8-combination contrast audit — Phase 5 (A11Y-07). Phase 2 ships `@supports` fallbacks (THEME-04) but NOT the audit
- Per-project anchors (`/projects#name`) — v1.x
- `?` cheatsheet in palette + `g`+letter vim nav — v1.x
- CSP nonce work for inline scripts — deferred per Phase 1 D-15
- Console signature, view-source comment, `x-portfolio-source` header — Phase 5 / Phase 7 (DEV-01..03)
- Full `prefers-reduced-motion` audit — Phase 5 (A11Y-03). Phase 2 ships defensive baseline only

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | Persistent terminal shell at `app/(terminal)/layout.tsx` | Pattern 1 (route-group); Anti-Pattern 1 (don't put shell in root layout) |
| SHELL-02 | `app/layout.tsx` Server Component; only client islands carry `"use client"` | Pitfall 9 (RSC boundary collapse); Pattern 1 |
| SHELL-03 | Top bar: traffic lights + path label + ⌘K btn + theme toggle + LiveClock + persistent resume button | Risk 3 (recruiter usability); D-06 (palette-only accent), Discretion (TopBar narrow-viewport precedence) |
| SHELL-04 | 240px sidebar: file tree + dashed recruiter card + STATUS block | D-15 (STATUS defaults); Pattern 4 (active state from URL) |
| SHELL-05 | Active sidebar from `useSelectedLayoutSegment()` — never mirrored | Anti-Pattern 2; Pattern 4 |
| SHELL-06 | Breadcrumb row: `~/portfolio / <activeFile>` + `press ⌘K for commands` hint | Anti-Pattern 6 (Breadcrumb is its own client island, not in layout) |
| SHELL-07 | Footer: `© <year> <name> · built with React · v1.0.0` | Specifics §; computed from `new Date().getFullYear()` in RSC layout |
| SHELL-08 | 920px max-width main; `32px 40px 80px` padding; each view begins with `$ <command>` + `slideIn` | Discretion (boot animation); CSS animations — pure CSS per CLAUDE.md |
| SHELL-09 | Cursor blink (1s `steps(2)` infinite, 8×14px accent block) — only loop in app | Discretion (cursor-blink primitive); `app/components/primitives/prompt-line.tsx` |
| THEME-01 | next-themes ThemeProvider with `attribute="data-theme"`; respects `prefers-color-scheme` first load; default dark | D-07; verified via next-themes v0.4.6 API |
| THEME-02 | Independent inline pre-paint script for `--accent-hue` from `localStorage["portfolio-accent"]` | D-08; Pattern 2; Risk 1 |
| THEME-03 | Full oklch token palette derived from `--accent-hue` in `app/globals.css` (matrix=145, amber=75, cyan=200, magenta=340) for both themes | design_handoff app.jsx lines 26–60 (verbatim source of truth) |
| THEME-04 | `@supports (color: oklch(0 0 0))` sRGB fallbacks on every accent token | Pitfall 8; Pattern 2 example |
| THEME-05 | User-facing accent picker exposes 4 hues; persists; updates `--accent-hue` without reload | D-03 (palette-only via 4 explicit verbs); D-06 |
| THEME-06 | JetBrains Mono via `next/font/google` (weights 400/500/600/700, `display:'swap'`, `--font-mono`, monospace fallback chain) | Pitfall 10; verified Next.js 16.2 next/font docs |
| ROUTE-04 | `app/sitemap.ts` enumerates 7 routes via `ROUTES.map`; `lastModified` build time | Pattern 5; existing lib/routes.ts |
| ROUTE-05 | Terminal-styled 404 at `app/not-found.tsx` rendering inside shell; HTTP 404 (curl -I) | D-17; Next.js not-found convention auto-returns 404 |
| PALETTE-01 | cmdk single client island; opens ⌘K/Ctrl-K; closes Esc/backdrop; modal centered 520px max-width 15vh | Stack §cmdk; D-10 |
| PALETTE-02 | ≥16 verbs (we ship 19) | D-05 |
| PALETTE-03 | Type-to-filter against label + aliases; result count via `aria-live` | cmdk `keywords` substring match (verified); D-04 |
| PALETTE-04 | Focus trap; restore focus on close; cmdk `Dialog.Title` | Pitfall 6; Radix Dialog.Title required (verified) |
| A11Y-01 | Skip-link to `#main-content` revealed on `:focus` at top of `<body>` | Defer §"Skip-link" — captured for Phase 2 |
| A11Y-02 | 2px accent `:focus-visible` outline + 2px offset on every interactive element | Defer §; CLAUDE.md (no killing default outlines without replacement) |
| A11Y-04 | Sidebar buttons real `<button>` with plain-noun `aria-label`; `aria-current="page"` on active | lib/routes.ts ariaLabel field; Pattern 4 |
| A11Y-05 | Semantic landmarks: `<header>`, `<nav aria-label="File explorer">`, `<main id="main-content">`, `<footer>` | A11Y standard pattern; Risk 3 |
| A11Y-06 | LiveClock `aria-hidden="true"` | D-14 |
| A11Y-08 | Full keyboard nav top-bar → palette → theme → sidebar → main → footer; ⌘K trap; Esc restores | Pitfall 6; sidebar/main focus boundary needs `tabIndex` discipline |
| TEST-02 | Vitest shell coverage | D-18 |
| TEST-03 | Vitest palette coverage | D-19; user-event@14 needed |
| TEST-04 | Vitest theme + accent coverage | D-20 |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| HTML document, fonts, providers, pre-paint scripts | Frontend Server (RSC root layout) | — | Only the root layout owns `<html>`/`<body>`; pre-paint scripts must be SSR-emitted into `<head>` to run before paint |
| Persistent terminal chrome (TopBar/Sidebar/Breadcrumb/CommandPalette/footer) | Frontend Server (RSC route-group layout) | Browser (5 client islands) | Layout itself is RSC and never re-renders on navigation; interactive parts hydrate as thin client islands |
| Active route detection | Browser (Sidebar client island) | — | `useSelectedLayoutSegment()`/`usePathname()` are client-only; URL is the source of truth (not state) |
| Theme attribute (`data-theme`) | Browser (next-themes ThemeProvider + auto-injected pre-paint script) | Frontend Server (initial HTML carries `suppressHydrationWarning`) | next-themes owns the theme axis end-to-end; SSR HTML stays neutral, pre-paint script writes attribute, hydration matches |
| Accent hue (`--accent-hue` CSS variable) | Browser (AccentBootstrapScript inline IIFE + ShellStateProvider effect) | — | next-themes does NOT manage CSS variables; custom inline script owns the pre-paint write, ShellStateProvider owns subsequent updates |
| Command palette (cmdk) | Browser (CommandPalette client island) | — | Keyboard listener, focus trap, type-to-filter are all client behavior |
| LiveClock | Browser (isolated client island) | — | `setInterval` belongs in its own island so 30s tick doesn't bloat TopBar bundle (Pitfall 9 corollary) |
| Sitemap | Frontend Server (Next.js sitemap.ts convention) | — | Built-in `MetadataRoute.Sitemap` default-export pattern; iterated from lib/routes.ts |
| 404 | Frontend Server (`app/not-found.tsx`) | Browser (renders inside client-island shell) | Next.js auto-returns HTTP 404; rendering inside the terminal shell composition uses the same client islands |
| 7 route stubs | Frontend Server (RSC pages) | — | RSC by default; `metadata: { title }` exported per stub; no data fetching in Phase 2 |

## Standard Stack

### Core (production deps — already installed in Phase 1; do NOT add others per CLAUDE.md)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^15.5.15` | App Router framework — RSC, route groups, sitemap, not-found, next/font | Already installed Phase 1; verified npm latest is 16.2.4 but project pins 15.5.x per CLAUDE.md (no framework swap) [VERIFIED: npm view next version → 16.2.4; package.json pin → ^15.5.15] |
| `react` / `react-dom` | `19.1.0` | Concurrent React with `useSyncExternalStore`, RSC | Locked Phase 1 |
| `next-themes` | `^0.4.6` | Theme axis management with auto-injected pre-paint script, OS preference, localStorage | Verified npm latest 0.4.6 (modified 2025-03-11); peer deps include `react ^19`. Documented automatic pre-paint script injection. [VERIFIED: npm view next-themes version → 0.4.6] [CITED: github.com/pacocoursey/next-themes README via WebFetch] |
| `cmdk` | `^1.1.1` | Command palette with focus trap, type-to-filter, ARIA, Radix Dialog | Verified npm latest 1.1.1; peer deps `react: ^18 \|\| ^19`. [VERIFIED: npm view cmdk version → 1.1.1, peerDependencies] |

### Built-in (no install needed)

| Capability | Tool | Why Standard |
|------------|------|--------------|
| Self-hosted JetBrains Mono | `next/font/google` | Built into Next.js 15+; auto-self-hosts at build, no runtime CDN, generates size-adjusted fallback metrics for CLS [CITED: nextjs.org/docs/app/api-reference/components/font] |
| App Router routing | `app/(terminal)/` route group | `(folder)` excludes from URL; layout inside wraps siblings without remounting on navigation [CITED: Next.js 16.2 layout API docs verified during architecture research] |
| Sitemap | `app/sitemap.ts` default export `MetadataRoute.Sitemap` | Native convention; no `next-sitemap` dep needed [CITED: research/ARCHITECTURE.md Pattern 5] |
| 404 | `app/not-found.tsx` | Auto-returns HTTP 404 [CITED: Next.js not-found.tsx file convention] |

### Dev Dependencies to Add (Phase 2)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@testing-library/user-event` | `^14.6.1` | High-fidelity keyboard simulation for `⌘K`/`Esc` keydowns in TEST-03 | `fireEvent.keyDown` works for simple cases but `userEvent.keyboard('{Meta>}k{/Meta}')` correctly fires the modifier sequence cmdk listens for. user-event 14 is async by default and integrates cleanly with Vitest jsdom + RTL 16. [VERIFIED: npm view @testing-library/user-event version → 14.6.1] |

**Installation:**
```bash
npm install --save-dev @testing-library/user-event@^14.6.1
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@testing-library/user-event` | `fireEvent.keyDown` | Works for `Escape` and simple keys; struggles with `metaKey`/`ctrlKey` modifiers reliably and doesn't simulate the full keydown→keyup sequence. user-event is the higher-fidelity standard. |
| Inline aliases in `command-palette.tsx` | `lib/palette-verbs.ts` (preferred per Specifics §) | Inline keeps verb code colocated; extracted module keeps `command-palette.tsx` lean and lets non-route verbs (toggle theme, copy email, set accent) live with route verbs in one taxonomy. Locked at planning per CONTEXT.md. |
| `lazy(() => import('...'))` for `CommandPalette` | Static import in shell layout | Lazy-mount saves ~30KB on cold first paint but adds a hydration boundary the first time `⌘K` is pressed. For Phase 2 (where palette is the primary discoverability surface for engineers), prefer static mount; revisit if shell-bundle target (<50KB shared) is missed. |

### Version Verification

```
npm view next version          → 16.2.4 (latest); project pins 15.5.x
npm view next-themes version   → 0.4.6 (modified 2025-03-11)
npm view cmdk version          → 1.1.1 (modified 2025-03-14, peer react ^18 || ^19)
npm view @testing-library/user-event version → 14.6.1
```

## Architecture Patterns

### System Architecture Diagram

```
[GET /<route>]
       │
       ▼
[app/layout.tsx]  RSC root
   │
   ├── <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
   │     │
   │     ├── <head>
   │     │     ├── <AccentBootstrapScript />  ← inline IIFE: localStorage[portfolio-accent] → --accent-hue
   │     │     └── (next-themes auto-injects its own theme script before paint)
   │     │
   │     └── <body>
   │           └── <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
   │                 └── <ShellStateProvider>            ← Context: {paletteOpen, accentHue, ...}
   │                       └── {children}                ← from app/(terminal)/layout.tsx
   │
       ▼
[app/(terminal)/layout.tsx]  RSC route-group layout (NEVER unmounts on sibling nav)
   │
   ├── <a href="#main-content" className="skip-link">Skip to main content</a>   ← A11Y-01
   │
   ├── <TopBar />                              client island
   │     ├── traffic lights + path label
   │     ├── ⌘K trigger button → ShellStateProvider.setPaletteOpen(true)
   │     ├── theme toggle (☼/☾)               useTheme() from next-themes
   │     ├── <LiveClock />                     own client island; setInterval 30s; aria-hidden
   │     └── persistent resume button         <a download> on every viewport
   │
   ├── <Breadcrumb />                          client island; usePathname()
   │
   ├── <div class="terminal-body">
   │     ├── <Sidebar />                       client island
   │     │     ├── <nav aria-label="File explorer"> with 7 rows from ROUTES
   │     │     │     ↳ each <button aria-label={route.ariaLabel}> uses ROUTES[i].ariaLabel
   │     │     │     ↳ active row aria-current="page" via useSelectedLayoutSegment()
   │     │     ├── recruiter resume card (dashed border)
   │     │     └── STATUS block (Available/uptime/tz)
   │     │
   │     └── <main id="main-content">
   │           ├── <PromptLine cmd="..." />    primitive (RSC)
   │           ├── {children}                  ← from app/(terminal)/<route>/page.tsx (RSC stubs in Phase 2)
   │           └── <footer>© year name · built with React · v1.0.0</footer>
   │
   └── <CommandPalette />                      client island (mounted once)
         ├── global keydown listener (⌘K/Ctrl-K toggle, Esc close)
         ├── focus trap via cmdk
         ├── <Command.Dialog>
         │     ├── <VisuallyHidden><Dialog.Title>Command Palette</Dialog.Title></VisuallyHidden>
         │     ├── <Command.Input value={query} />
         │     ├── <div role="status" aria-live="polite">{count} results</div>
         │     └── <Command.List>
         │           └── 19 <Command.Item value={...} keywords={[...aliases]} onSelect={action} />
         └── on close: triggerRef.current?.focus()  (Pitfall 6)
```

Data flow paths:
1. **Cold reload of `/projects` with `localStorage["portfolio-accent"] = "340"` (magenta) + `theme = "light"`:** SSR HTML → `<head>` runs both pre-paint scripts blockingly → `<html data-theme="light" style="--accent-hue:340">` → CSS resolves accent tokens → first paint already correct → React hydrates → no flash.
2. **`⌘K` press:** browser keydown → `CommandPalette` listener → `setPaletteOpen(true)` → modal mounts → focus trapped → user types → cmdk filter `extendValue = value + ' ' + keywords.join(' ')` substring-matches query → list re-renders → `aria-live` region announces count → user picks `Open contact.sh` → action fires `router.push("/contact")` → palette closes → focus restored to trigger button.
3. **Accent change via `Set accent: amber`:** action calls `setHue("75")` from `useAccent()` → ShellStateProvider writes `documentElement.style.setProperty('--accent-hue', '75')` AND `localStorage["portfolio-accent"] = "75"` → all `oklch(L C var(--accent-hue))` rules recompute live → no React re-render of view tree.

### Recommended Project Structure

```
app/
├── layout.tsx                                   # RSC root: <html>, fonts, providers, pre-paint scripts
├── globals.css                                  # oklch tokens, --accent-hue, sRGB @supports fallbacks, animations
├── robots.ts                                    # unchanged from Phase 1
├── sitemap.ts                                   # REWRITTEN: maps over ROUTES from lib/routes.ts
├── not-found.tsx                                # NEW: terminal-styled 404 inside shell
├── (terminal)/                                  # NEW: route group (not in URL)
│   ├── layout.tsx                               # RSC: terminal chrome composition
│   ├── page.tsx                                 # / — about stub
│   ├── projects/page.tsx                        # /projects — stub
│   ├── stack/page.tsx                           # /stack — stub
│   ├── experience/page.tsx                      # /experience — stub
│   ├── writing/page.tsx                         # /writing — stub
│   ├── contact/page.tsx                         # /contact — stub
│   └── shipped/page.tsx                         # /shipped — stub
└── components/
    ├── shell/                                   # All terminal-shell pieces
    │   ├── theme-provider.tsx                   # client wrapper for next-themes ThemeProvider
    │   ├── shell-state-provider.tsx             # client; Context+useReducer for palette/accent
    │   ├── accent-bootstrap-script.tsx          # RSC; emits inline pre-paint IIFE
    │   ├── top-bar.tsx                          # client
    │   ├── sidebar.tsx                          # client
    │   ├── command-palette.tsx                  # client
    │   ├── live-clock.tsx                       # client (own island, own setInterval)
    │   └── breadcrumb.tsx                       # client (usePathname)
    └── primitives/
        └── prompt-line.tsx                      # RSC; <span class="cursor"/> + cmd text

lib/
├── routes.ts                                    # EXISTING: 7-entry typed const array
├── types.ts                                     # EXISTING
├── portfolio-data.ts                            # EXISTING: + add CAREER_START_DATE constant (D-15)
├── palette-verbs.ts                             # NEW: ~19 verb defs with keywords[] (D-04 preference (b))
├── uptime.ts                                    # NEW: formatUptime(start, now) helper (D-15)
└── api.ts                                       # EXISTING; not called by Phase 2

DELETED in Wave 2 (same commit as their replacements):
- app/components/homepage.tsx
- app/components/homepage.test.tsx
- app/components/theme-toggle.tsx
- app/page.tsx (replaced by app/(terminal)/page.tsx)
- (in app/layout.tsx: themeScript const + <script dangerouslySetInnerHTML> mount)
```

### Pattern 1: Two-Script SSR-Flash-Free Theme + Accent

**What:** next-themes auto-injects its own pre-paint script that writes `data-theme` on `<html>`. We add a second tiny inline IIFE that reads `localStorage["portfolio-accent"]` and writes `--accent-hue` as inline style on `documentElement`. CSS in globals.css derives every accent token from `oklch(L C var(--accent-hue))` plus `@supports` sRGB fallbacks.

**When to use:** Always for this project. THEME-01 + THEME-02 + THEME-04 all flow through this pattern.

**Example:**

```tsx
// app/components/shell/accent-bootstrap-script.tsx
// SOURCE: research/ARCHITECTURE.md Pattern 2; refined per D-08

const ACCENT_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('portfolio-accent');
    var hue = (raw && /^\\d{1,3}$/.test(raw) && +raw >= 0 && +raw < 360) ? raw : '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) { /* localStorage unavailable; default --accent-hue from CSS applies */ }
})();
`;

export function AccentBootstrapScript() {
  // RSC — emits SSR HTML with inline script in <head>; runs blockingly before <body>
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
```

```tsx
// app/layout.tsx — RSC, no "use client" (Pitfall 9)
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/shell/theme-provider";
import { ShellStateProvider } from "@/app/components/shell/shell-state-provider";
import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
  // adjustFontFallback defaults to true for next/font/google → automatic size-adjust metrics
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const metadata: Metadata = { metadataBase: new URL(siteUrl), /* ... */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <AccentBootstrapScript />
        {/* next-themes auto-injects its theme script — do NOT add a manual one */}
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Critical details:**
- `suppressHydrationWarning` on `<html>` is REQUIRED by next-themes — without it, every page logs a hydration warning because the pre-paint script mutates `data-theme` before React mounts. [CITED: next-themes README via WebFetch]
- The two scripts run independently — order does not matter (theme attribute and accent CSS variable target different things).
- The validation regex `^\d{1,3}$` + range check on the accent hue is a security defense per Pitfall §"localStorage stores accent hue without validation" in PITFALLS.md.
- DO NOT add `nonce` to either script — Phase 1 D-15 deferred CSP nonce; current scripts ship without it.

### Pattern 2: cmdk Command.Dialog with Aliases and Accessibility

**What:** Use `Command.Dialog` (cmdk wraps Radix Dialog), provide a `Dialog.Title` (visually hidden), set each `Command.Item` with `value` (matches the visible label) and `keywords` array (aliases), implement `aria-live` region for filtered count, and restore focus to the trigger element on close.

**Filter behavior** [CITED: github.com/pacocoursey/cmdk via WebFetch]:
- Default `shouldFilter` is `true`
- Internal extends value: `extendValue = value + ' ' + keywords.join(' ')`
- Match is **substring** (`extendValue.toLowerCase().includes(search.toLowerCase())`) — NOT prefix, NOT fuzzy
- Disable with `shouldFilter={false}` to implement custom logic (not needed for Phase 2)

**Implication for D-04 aliases:** Substring match means `mail` matches both `Copy email` (label contains "mail" via `email`) AND `Copy email` keyword `mail` — both resolve via the same path. Single-character queries (`g` for github) match labels containing `g` broadly; mitigate with longer keywords (`gh`, `github`) seeded in CONTEXT.md D-04 table.

**Example:**

```tsx
// app/components/shell/command-palette.tsx
"use client";

import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog"; // cmdk re-exports its own Dialog wrapper; alternatively use Command.Dialog
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePalette } from "@/app/components/shell/shell-state-provider";
import { PALETTE_VERBS } from "@/lib/palette-verbs";

export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const router = useRouter();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [count, setCount] = useState(PALETTE_VERBS.length);

  // global ⌘K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        setOpen((p) => !p);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // restore focus on close
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command Palette">
      {/* visually hidden Dialog.Title — Radix accessibility requirement (verified) */}
      <span className="visually-hidden" id="cmdk-title">Command Palette</span>
      {/* cmdk's Command.Dialog auto-wires aria-labelledby; if it doesn't, set role="dialog" aria-labelledby="cmdk-title" */}

      <Command.Input
        placeholder="Type a command…"
        onValueChange={(v) => {
          // cmdk filters internally; query the rendered count after filter
          // (alternatively: maintain count via Command.Empty and counting list children)
        }}
      />

      <div role="status" aria-live="polite" className="visually-hidden">
        {count} {count === 1 ? "result" : "results"}
      </div>

      <Command.List>
        <Command.Empty>No matches.</Command.Empty>
        {PALETTE_VERBS.map((verb) => (
          <Command.Item
            key={verb.id}
            value={verb.label}
            keywords={verb.keywords}
            onSelect={() => {
              verb.action({ router, setOpen });
              setOpen(false);
            }}
          >
            <span className="verb-icon">{verb.icon}</span>
            <span>{verb.label}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}
```

**Critical details:**
- **Radix `Dialog.Title` is required** — omitting it generates a console error in dev (Radix logs `DialogTitle requires a Title for the component`). cmdk's `Command.Dialog` wraps Radix Dialog and inherits this requirement. [VERIFIED: Radix Dialog docs via WebFetch + Pitfall 6 cmdk issue #393]
- Visually hide it with a `.visually-hidden` CSS utility (clip + position absolute) OR import `@radix-ui/react-visually-hidden` (not necessary — cmdk's transitive Radix tree provides it but adds zero new prod deps if we use a custom CSS class).
- `triggerRef` MUST be captured BEFORE `setOpen(true)` (capture `document.activeElement`); restoring focus AFTER close requires the ref to point to a still-mounted element.
- For the `aria-live` count: easiest path is to track filtered count via `Command.List`'s render result. Alternative: use cmdk's `Command.Empty` to detect empty state and a side ref to count visible items. The CONTEXT.md D-19 test only asserts the region exists and announces a count — exact instrumentation is planner's discretion.

### Pattern 3: JetBrains Mono via next/font/google with CSS Variable

**What:** Single `JetBrains_Mono({...})` call with all 4 weights, `display: 'swap'`, explicit monospace `fallback` chain, exported as CSS variable `--font-mono`. Apply `jetbrainsMono.variable` className to `<html>` so the variable is in scope for `globals.css`. In CSS, set `font-family: var(--font-mono)` (NEVER the literal string `"JetBrains Mono"`) per Pitfall 10.

**`adjustFontFallback` default behavior** [CITED: nextjs.org/docs/app/api-reference/components/font]: For `next/font/google` it defaults to `true`, which automatically computes `size-adjust`/`ascent-override` metrics on the fallback font to match JetBrains Mono's metrics. Layout stays stable during font swap → CLS < 0.1 [Pitfall 10 mitigation]. **Do NOT pass `adjustFontFallback: 'Times New Roman'`** — that's the `next/font/local` API; it's a no-op on `next/font/google` and may produce a TS error.

**Example** (already shown in Pattern 1 above; reproduced here for emphasis):

```ts
// app/layout.tsx — single import, single call
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
});
```

```css
/* app/globals.css */
:root {
  font-family: var(--font-mono);  /* Pitfall 10: variable, not string literal */
}
```

```tsx
// <html> — apply className from font.variable so var(--font-mono) resolves
<html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
```

**Verification:** Build, then DevTools → Rendering → "Local fonts disabled" → reload. Layout must not shift visibly. Lighthouse CLS audit < 0.1.

### Pattern 4: oklch Token Palette with --accent-hue Indirection and sRGB Fallbacks

**What:** All accent tokens derive from a single `--accent-hue` CSS custom property; `oklch(L C var(--accent-hue))` produces the live color. Wrap in `@supports (color: oklch(0 0 0))` with sRGB hex fallbacks for browsers that don't support oklch (mostly older mobile Safari and in-app webviews per Pitfall 8).

**Source of truth:** `design_handoff_terminal_portfolio/app.jsx` lines 26–60 give the exact L/C values per theme. Reproduce verbatim:

```css
/* app/globals.css */

/* Default (dark) — applies before any data-theme attr resolves */
:root {
  --accent-hue: 145; /* matrix; AccentBootstrapScript overrides before paint */
  color-scheme: dark light; /* avoid form-control flash */

  /* Neutral tokens (dark default) */
  --bg: #0a0c0b;
  --bg-raised: #101312;
  --panel: #0d100f;
  --panel-hi: #151918;
  --border: #1c2120;
  --border-hi: #2a302e;
  --text: #d8d6cf;
  --text-hi: #ebe9e2;
  --muted: #6a7370;
  --muted-hi: #8a938f;

  /* sRGB fallback (matrix at chroma=0.18, L=0.78 ≈ #4ade80) */
  --accent: #4ade80;
  --accent-dim: #16632a;
  --accent-bg: rgba(74, 222, 128, 0.08);
  --warn: #f5b431;
  --red: #f54e49;
  --blue: #59b1f0;
}

@supports (color: oklch(0 0 0)) {
  :root {
    --accent: oklch(0.78 0.18 var(--accent-hue));
    --accent-dim: oklch(0.45 0.12 var(--accent-hue));
    --accent-bg: oklch(0.78 0.18 var(--accent-hue) / 0.08);
    --warn: oklch(0.78 0.16 75);
    --red: oklch(0.7 0.18 25);
    --blue: oklch(0.72 0.14 230);
  }
}

/* Light theme overrides */
html[data-theme="light"] {
  --bg: #f4f2ea;
  --bg-raised: #fbf9f1;
  --panel: #ffffff;
  --panel-hi: #f4f2ea;
  --border: #d8d4c4;
  --border-hi: #bdb8a5;
  --text: #1a1f1d;
  --text-hi: #0a0c0b;
  --muted: #6a7370;
  --muted-hi: #3a4340;
  color-scheme: light dark;

  /* sRGB fallback (matrix-on-light at L=0.42, C=0.16 ≈ #1f5a35) */
  --accent: #1f5a35;
  --accent-dim: #4a7a5a;
  --accent-bg: rgba(31, 90, 53, 0.08);
}

@supports (color: oklch(0 0 0)) {
  html[data-theme="light"] {
    --accent: oklch(0.42 0.16 var(--accent-hue));
    --accent-dim: oklch(0.55 0.13 var(--accent-hue));
    --accent-bg: oklch(0.42 0.16 var(--accent-hue) / 0.08);
    --warn: oklch(0.5 0.16 60);
    --red: oklch(0.5 0.18 25);
    --blue: oklch(0.5 0.16 230);
  }
}
```

**Critical details:**
- The sRGB fallback values are HARDCODED to the **matrix (default)** hue — they will NOT track `--accent-hue` swaps for non-oklch browsers. This is the v1 tradeoff; per Pitfall 8 ~7% of users on older mobile Safari see matrix-only. Fully dynamic sRGB fallbacks would require JS (chroma-js or hand-computed lookup table per hue × theme — out of scope per CLAUDE.md "no new prod deps").
- The `@supports` query MUST appear AFTER the fallback declarations — cascade order matters.
- The `[ASSUMED]` sRGB hex values above are reasonable approximations; final values should be eye-checked at design QA. Alternative: pre-compute via `oklch.click` and pin in source. Flag this in Open Questions.

### Pattern 5: Hydration-Safe LiveClock

**What:** Render placeholder `--:--` server-side, swap to real `HH:MM` after `useEffect` fires client-side. Avoids hydration mismatch (server clock ≠ client clock) and avoids drift between SSR render time and client paint time.

```tsx
// app/components/shell/live-clock.tsx
"use client";
import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="live-clock" aria-hidden="true">
      {time ?? "--:--"}
    </span>
  );
}
```

### Anti-Patterns to Avoid

- **`"use client"` on `app/layout.tsx` or `app/(terminal)/layout.tsx`** (Pitfall 9 / SHELL-02): cascades client bundle to every page. Verify with `grep -l "^\"use client\"" app/layout.tsx app/(terminal)/layout.tsx` returns zero hits before commit.
- **Mirroring active route into Context/Zustand** (Anti-Pattern 2 / SHELL-05): URL is the source of truth. `useSelectedLayoutSegment()` only.
- **Letting next-themes "manage" accent hues** (Anti-Pattern 3): combinatorial explosion of selectors. next-themes is for the discrete light/dark axis only; accent is a separate CSS variable axis.
- **`usePathname()` inside `app/(terminal)/layout.tsx`** (Anti-Pattern 6): layout doesn't re-render on navigation → stale value. Always extract into a child client component (e.g., `Breadcrumb`).
- **Fetching data in the shell layout** (Anti-Pattern 4): blocks navigation. Phase 2 shell fetches nothing — STATUS uses constants + `Intl` only.
- **Importing `JetBrains_Mono` per weight** (Pitfall 10): single-call array form; quadruples font payload otherwise.
- **String `font-family: "JetBrains Mono"`** (Pitfall 10): bypasses next/font CSS variable injection. Always `var(--font-mono)`.
- **Omitting `Dialog.Title`** (Pitfall 6 / Radix req): Radix throws a console error; visually hide it via CSS utility.
- **Mounting two theme scripts manually** (D-08): next-themes auto-injects its own; only `AccentBootstrapScript` is added. The existing `themeScript` in `app/layout.tsx` is DELETED in Wave 2 (D-16).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Light/dark theme axis | Custom `useTheme` + localStorage + pre-paint script (the existing `theme-toggle.tsx` pattern) | `next-themes@^0.4.6` — already installed | Solves SSR-flash, OS-pref detection, hydration-warning suppression, multi-tab sync, transition-flash damping in one package. Net code reduction. |
| Command palette | Custom `<dialog>` + manual focus trap + manual filter | `cmdk@^1.1.1` — already installed | Focus trap, keyboard nav (arrow/enter/esc), type-to-filter, ARIA roles, IME composition handling are all non-trivial. ~6KB gzipped. |
| Font self-hosting | `<link rel="preconnect" />` + `@font-face` | `next/font/google` — built into Next.js | Auto-self-hosts at build, generates size-adjusted fallback metrics → CLS < 0.1 automatically (Pitfall 10 mitigation). |
| Sitemap generation | Hand-edited XML or hardcoded URL list | `app/sitemap.ts` default export iterating `lib/routes.ts` | Native Next.js convention; type-safe; one-line addition for view #8. Don't add `next-sitemap`. |
| 404 HTTP status | `redirect('/')` or custom 200-status error page | `app/not-found.tsx` (Next.js convention) | Auto-returns HTTP 404 (success criterion 5 verifiable via curl -I). |
| Focus trap | Hand-rolled `tabindex` cycling | cmdk's built-in trap (uses Radix internals) | Already inside cmdk; double-implementation conflicts. |
| Result count announcement | Custom polite-region polyfill | `<div role="status" aria-live="polite">` | Native ARIA; SR-tested pattern. |
| Theme transition flash damping | Custom CSS `transition: none` toggle | `disableTransitionOnChange` on next-themes ThemeProvider | One prop; covers the entire DOM. |
| Accent hue computation | JS color library (chroma-js, colord) | One CSS custom property + `oklch(L C var(--accent-hue))` | No JS color math needed; pure CSS swap. |
| State store | Zustand for `{paletteOpen, accentHue}` | React Context + useReducer (`ShellStateProvider`) | Three values; Context is sufficient. CLAUDE.md bars new deps. |
| URL → active state | Manual `pathname` → store sync in `<Link>` `onClick` handlers | `useSelectedLayoutSegment()` from `next/navigation` | URL is the state. No desync risk on back/forward or shared URLs. |

**Key insight:** Phase 1 already settled the dependency budget — exactly two new prod deps (`next-themes`, `cmdk`), both installed. Every Phase 2 task either uses these two, uses something built into Next.js, or hand-rolls in pure CSS / pure RSC. Adding another prod dep requires revisiting `research/STACK.md` and is not a Phase 2 decision.

## Common Pitfalls

These specialize the project-level pitfalls in `research/PITFALLS.md` for Phase 2 implementation.

### Pitfall 1: Accent flash on first paint with stored non-default hue (Phase 2 specialization of project Pitfall 3)

**What goes wrong:** User loads with `localStorage["portfolio-accent"] = "340"` (magenta). Server renders with default `--accent-hue: 145` (matrix green). For one frame, the page is green. Then the React tree hydrates and our effect writes `--accent-hue = "340"`, flipping to magenta. The flash defeats the entire SSR-flash mitigation strategy.

**Why it happens:** The `AccentBootstrapScript` was placed in `<body>` instead of `<head>`, OR was placed AFTER children, OR was inadvertently moved into a client component.

**How to avoid:**
- The `<AccentBootstrapScript />` MUST be inside `<head>` and emitted by an RSC.
- Verify in DevTools Network → Slow 3G → hard reload → first paint frame matches stored accent.
- Test programmatically by injecting into JSDOM — confirm `documentElement.style.getPropertyValue('--accent-hue')` matches `localStorage` value AFTER the script has executed but BEFORE React hydrates (D-20 test specifies this exact assertion).

**Warning signs:** Slow-3G recording shows green→magenta flash; `<head>` does NOT contain the inline script in `view-source:`.

### Pitfall 2: Hydration mismatch warnings from `<html>` mutation by next-themes (Phase 2 specialization of cmdk integration)

**What goes wrong:** next-themes' pre-paint script writes `data-theme` on `<html>` before hydration. React notices the SSR HTML doesn't match (`<html>` vs `<html data-theme="dark">`) and logs a warning every page load.

**Why it happens:** Missing `suppressHydrationWarning` on `<html>`.

**How to avoid:**
- Add `suppressHydrationWarning` directly on `<html>` in `app/layout.tsx`. This is REQUIRED by next-themes (verified via README WebFetch).
- DO NOT mirror it onto child elements — the warning suppression is scoped to `<html>` itself.
- DO NOT use `dynamic({ ssr: false })` on the shell — that defeats per-route SEO (each route would lose its server-rendered metadata).

**Warning signs:** Console: `Warning: Prop 'data-theme' did not match. Server: '' Client: 'dark'`.

### Pitfall 3: Sidebar/main keyboard focus boundary swallows tab order (A11Y-08)

**What goes wrong:** A11Y-08 specifies tab order: top-bar → palette button → theme toggle → sidebar files → main content → footer. Naive implementation makes the sidebar a `<nav>` with 7 `<button>`s — fine. But when the user tabs out of the last sidebar button, focus jumps to the LAST item in `<main>` (e.g., a footer link) instead of the first (the prompt-line link or first interactive element). This is because no `tabIndex={-1}` `id="main-content"` anchor exists at the top of `<main>`.

**Why it happens:**
- Skip-link target (`<a href="#main-content">`) needs a focusable element at `#main-content` to receive focus when activated.
- Adding `tabIndex={-1}` to `<main id="main-content">` makes it programmatically focusable but skips it in normal tab order — exactly what we want.

**How to avoid:**
- `<main id="main-content" tabIndex={-1}>` in the shell layout.
- Skip-link: `<a href="#main-content" className="skip-link">Skip to main content</a>` at the very top of `<body>` (or shell layout root).
- `.skip-link` CSS uses `position: absolute; top: -40px; left: 0;` and `:focus { top: 0; }` to reveal on focus per A11Y-01.
- Verify with VoiceOver Cmd+F5 + Tab: the skip-link should appear, activating it should jump focus into main.

**Warning signs:** Tab order goes top-bar → ⌘K → theme → sidebar files → footer (skipping main); skip-link is invisible AND not announced.

### Pitfall 4: cmdk `Command.Item` `value` collision causing wrong filter behavior (Phase 2 specialization of cmdk integration)

**What goes wrong:** D-04 has two verbs that share a substring: `Open contact.sh` and `Copy email`. Both have `email` in their alias keywords. Default cmdk match is **substring** on `value + ' ' + keywords.join(' ')`. If `value` is just the icon glyph (`↗`) instead of the label, filter has no label text to match against — only keywords. If two items have identical `value`, cmdk treats them as the same item and dedupes.

**Why it happens:**
- Setting `value={verb.icon}` instead of `value={verb.label}` (or a stable verb id).
- Setting all four `Set accent: ...` items with `value="set-accent"` (same value → dedupe).

**How to avoid:**
- Always set `value` to the visible label (`Open contact.sh`) — cmdk uses `value` for both filter AND identity.
- Aliases go in `keywords: string[]`, NEVER in `value`.
- Test by typing `email` and asserting BOTH `Open contact.sh` AND `Copy email` appear (D-19 covers this).

**Warning signs:** Typing `set` shows only one accent item; typing `accent` shows zero; duplicate items rendered visually.

### Pitfall 5: `app/(terminal)/page.tsx` and `app/page.tsx` both exist, route resolution ambiguous (Brownfield Pitfall 11 specialization)

**What goes wrong:** D-16 lists `app/page.tsx` for deletion. If a planner's task accidentally adds the new `app/(terminal)/page.tsx` BEFORE deleting the old `app/page.tsx`, Next.js sees two files claiming `/`. Next.js 15+ throws a build error: `You cannot have two parallel pages that resolve to the same path`.

**Why it happens:** Forgetting D-16 in the same wave/commit as the route-group page creation.

**How to avoid:**
- In Wave 2 (the brownfield-deletion wave per D-21), `app/page.tsx` is deleted in the SAME commit that introduces `app/layout.tsx` rewrite. The route-group `(terminal)` page comes in Wave 4 — but verify it doesn't land before `app/page.tsx` is gone.
- Build check: `npm run build` between waves; the build error is loud (it's not silent).
- Knip CI gate (Phase 1 D-03) does NOT catch parallel-page errors — only orphans. Rely on `npm run build` here.

**Warning signs:** Build error: `You cannot have two parallel pages that resolve to the same path. Please check /page and /(terminal)/page.`

### Pitfall 6: TopBar shrinks resume button below tap target on narrow viewports

**What goes wrong:** Discretion §"TopBar narrow-viewport precedence" hides path label below 600px and traffic-lights below 480px. The persistent resume button must NEVER hide. But naive flexbox shrinking can compress the resume `<a>` below 44×44px, failing WCAG 2.5.5 touch target on phones (Risk 3 / SHELL-03).

**Why it happens:** No explicit `min-width` or `min-height` on the resume button; flex children all shrink proportionally.

**How to avoid:**
- `min-height: 44px` on the resume button at every breakpoint.
- `flex-shrink: 0` on resume button (and ⌘K trigger, theme toggle) so they don't shrink when path label and traffic-lights compete for space.
- 375px screenshot review at the end of Wave 3 catches this.

**Warning signs:** 375px screenshot shows a thin sliver of "↓ resume.pdf" or the button overlapping the theme toggle.

### Pitfall 7: Vitest jsdom doesn't support `localStorage` `securityerror` paths (TEST-04 nuance)

**What goes wrong:** `AccentBootstrapScript` IIFE has a `try/catch` for browsers that disable localStorage (Safari private mode). TEST-04 wants to verify the catch path. JSDOM's localStorage works fine in tests by default, so the catch never fires. Stubbing `localStorage` to throw requires `vi.stubGlobal('localStorage', { getItem: () => { throw new Error() } })` AND running the IIFE source string against that stubbed env (not just importing the component).

**How to avoid:**
- D-20's primary assertion is **presence-and-content**: `expect(scriptEl.innerHTML).toContain('portfolio-accent')`. This doesn't require executing the IIFE.
- For dynamic assertion (`localStorage["portfolio-accent"] = "75"` → `--accent-hue` is `"75"`), set localStorage BEFORE rendering, then render, then assert `documentElement.style.getPropertyValue('--accent-hue')`. JSDOM runs `<script>` tags emitted via `dangerouslySetInnerHTML` synchronously during render.
- Skip the catch-path test in jsdom — it's a defense for production, not a behavioral guarantee testable here. Document as a trade-off in the test file.

**Warning signs:** Test runs `--accent-hue` assertion and gets `""` (script didn't execute) — usually means the script tag was rendered into a detached DOM node.

### Pitfall 8: `aria-live` polite region announces stale count when filter clears too fast

**What goes wrong:** User types `con` (filters to 1 result), then deletes back to empty (full 19 results). If the announce region debounces or re-renders out of order, a screen reader can announce `1 result` AFTER the list has reverted to 19 items.

**How to avoid:**
- Bind the live-region text directly to the rendered count (no debounce, no animation delay).
- VoiceOver naturally throttles announcements — don't fight it.
- D-19 test asserts the region exists with correct text at a stable filter state, NOT during transitions.

**Warning signs:** SR audit reveals "1 result" being announced when 19 are shown.

## Runtime State Inventory

This is a refactor + rebuild phase that touches an existing live codebase. The grep-and-replace audit catches files; this section catches what files don't.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases or persistent stores in `portfolio-web` (data lives in `lib/portfolio-data.ts` static seed + sibling backend) | None |
| Live service config | None — Vercel deployment is config-as-code in `next.config.ts`; no manual dashboard state lives in the deploy that depends on Phase 2 string changes | None |
| OS-registered state | None — no Task Scheduler, launchd, systemd, pm2, etc. for a Next.js portfolio | None |
| Secrets / env vars | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL` (existing, Phase 1) — Phase 2 does NOT change names. `localStorage` keys: existing `portfolio-theme` (legacy, deleted by D-08 along with the stub script) — no migration path needed because `next-themes` writes its own `theme` key on first toggle and the legacy script is the only thing that ever read `portfolio-theme` | Verify no other reader of `portfolio-theme` exists: `git grep -n "portfolio-theme" -- app lib` should return zero hits after deletion. `localStorage["portfolio-theme"]` left behind in user browsers is harmless — no code reads it and it's a few bytes. Document in the deletion commit message. |
| Build artifacts | None — Next.js build outputs are gitignored `.next/` and rebuilt every deploy | None |

**The canonical question — answered:** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?*

→ Returning users have stale `localStorage["portfolio-theme"]` keys with `"light"` or `"dark"` strings from the Phase 0 implementation. After Phase 2 ships, that key is orphan. next-themes will read its own `theme` key (default storageKey) and apply system pref on first load (because no `theme` value exists yet for that user). Net effect: returning users will get OS preference on their first post-deploy load, then their next-themes choice persists thereafter. **This is acceptable** — equivalent to a fresh first-visit for that one transition. Document in Phase 2 release note.

## Code Examples

Verified patterns from official sources (Pattern 1–5 above contain the canonical snippets). Two additional patterns specific to test/CI:

### Vitest TEST-03: ⌘K keydown simulation with user-event 14

```tsx
// app/components/shell/command-palette.test.tsx
// SOURCE: testing-library.com/docs/user-event/keyboard

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./command-palette";
// import any required providers (ShellStateProvider) and wrap render

test("opens on ⌘K, closes on Esc, restores focus", async () => {
  const user = userEvent.setup();
  render(
    <ShellStateProvider>
      <button data-testid="trigger">⌘K</button>
      <CommandPalette />
    </ShellStateProvider>
  );

  // focus the trigger so triggerRef captures it
  await user.click(screen.getByTestId("trigger"));

  // ⌘K → palette opens
  await user.keyboard("{Meta>}k{/Meta}");
  expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();

  // type "contact" → list shows Open contact.sh + Copy email (alias hit)
  await user.keyboard("contact");
  expect(screen.getByRole("option", { name: /open contact\.sh/i })).toBeInTheDocument();
  // alias-driven: "Copy email" should also appear because keywords include "contact" or shared substring

  // Esc → closes
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByTestId("trigger")).toHaveFocus();
});
```

**Note:** Verify exact role queries against cmdk's actual rendered ARIA — Command.Dialog may use `role="dialog"` or rely on Radix's. If queries fail, fall back to `screen.getByLabelText("Command Palette")`.

### TEST-04: AccentBootstrapScript content + dynamic effect

```tsx
// app/components/shell/accent-bootstrap-script.test.tsx
import { render } from "@testing-library/react";
import { AccentBootstrapScript } from "./accent-bootstrap-script";

test("emits inline script reading portfolio-accent", () => {
  const { container } = render(<AccentBootstrapScript />);
  const script = container.querySelector("script");
  expect(script?.innerHTML).toContain("portfolio-accent");
  expect(script?.innerHTML).toContain("--accent-hue");
});

test("script applies stored hue to documentElement", () => {
  localStorage.setItem("portfolio-accent", "75");
  // Render the script into the actual document head so JSDOM executes it
  const wrap = document.createElement("div");
  document.body.appendChild(wrap);
  // ... render and assert
  expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("75");
});
```

### Build-output verification (Validation Architecture)

```bash
# Pitfall 9 / SHELL-02: no "use client" in root or shell layout
grep -l '^"use client"' app/layout.tsx app/(terminal)/layout.tsx
# Expected: zero hits

# Bundle size — shared shell First Load JS < 50KB gzipped (success criterion 1)
npm run build | grep -A 20 "Route" | grep "First Load JS"

# 404 returns HTTP 404 (success criterion 5)
curl -I http://localhost:3000/this-route-does-not-exist | head -1
# Expected: HTTP/1.1 404 Not Found

# Sitemap iterates ROUTES (ROUTE-04)
curl http://localhost:3000/sitemap.xml | grep -c '<loc>'
# Expected: 7

# Knip clean (orphan check)
npm run knip
# Expected: zero unused files / exports
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useTheme` + manual localStorage + manual flash script | next-themes ThemeProvider + auto-injected script | next-themes 0.4.x adopted React 19 peer dep (Mar 2025) | Drop hand-rolled theme code; gain SSR-flash prevention, OS-pref detection, multi-tab sync |
| cmdk 1.0.0–1.0.2 with use-sync-external-store shim | cmdk 1.1.0+ uses React's built-in `useSyncExternalStore` | cmdk 1.1.0 (Jan 2025) | No shim → no React 19/Next 15 conflict; smaller bundle |
| Hardcoded sitemap.ts URLs | sitemap default export iterating route registry | research-level convergence; lib/routes.ts established Phase 1 | Adding view #8 = one-line edit |
| Tailwind / CSS-in-JS for theme | Pure CSS custom properties + `oklch(L C var(--hue))` | oklch reached Baseline (Safari 15.4+, Chrome 111+) | Runtime hue swap with one `setProperty` call; no JS color math |
| Per-route metadata implicit from layout | Per-route `metadata` export | Next.js App Router metadata convention (15.x) | Each route ships unique `<title>`; SEO parity preserved |
| Hand-rolled focus trap for modal | cmdk built-in (Radix Dialog under the hood) | cmdk 1.0+ | Free; SR-tested; IME-composition-safe |
| `next/font` per-weight imports | Single call array | next/font docs canonical pattern | 4× smaller font payload; one place to update weights |

**Deprecated/outdated:**
- `lib/fallback-data.ts` — deleted Phase 1; replaced by `lib/portfolio-data.ts`.
- `app/components/theme-toggle.tsx` — deleted Phase 2 Wave 2; replaced by next-themes-driven theme button inside TopBar.
- `app/components/homepage.tsx` + `homepage.test.tsx` — deleted Phase 2 Wave 2; replaced by 7 view stubs + Vitest shell coverage.

## Project Constraints (from CLAUDE.md)

The planner MUST verify each task respects these constraints from `./CLAUDE.md`:

| Constraint | Verification |
|------------|-------------|
| Next.js 15 App Router + React 19 + TypeScript strict — no framework swap | `npm view next version` is 16.2.4 but project pins ^15.5.x; Phase 2 does NOT bump this |
| Pure CSS + CSS custom properties — NO Tailwind, NO CSS-in-JS, NO CSS modules | All styling lives in `app/globals.css`; no `*.module.css`, no `tailwind.config`, no `styled-components`, no `emotion`. `grep -r "tailwind\|styled-components\|emotion\|module.css" app/` returns nothing |
| Two new prod deps total — `next-themes@^0.4.6` + `cmdk@^1.1.1`; no others | Phase 1 installed both. Phase 2 ONLY adds `@testing-library/user-event` as devDependency. `package.json` `dependencies` block must NOT grow |
| Native `fetch` + `next: { revalidate }` — no SWR, no TanStack Query | Phase 2 doesn't fetch anything. Phase 3 will use `lib/api.ts` `getJson<T>` unchanged |
| Persistent shell at `app/(terminal)/layout.tsx` — never unmounts | SHELL-01 |
| `app/layout.tsx` is RSC — only thin client islands carry `"use client"` | SHELL-02 + Pitfall 9 |
| Active view from `useSelectedLayoutSegment()` — never mirrored | SHELL-05 |
| Theme via next-themes; **accent is a separate axis** managed by inline pre-paint script | THEME-01/02; D-08 |
| `lib/routes.ts` is single source of truth — Sidebar, CommandPalette, sitemap import from it | Already established Phase 1 |
| Brownfield: deletions in same commit as replacements | D-16 (Wave 2 commit) |
| Backend type changes ship as paired commits | N/A for Phase 2 (no backend changes this phase) |
| Persistent resume button visible at every viewport | SHELL-03 / Risk 3 — non-negotiable |
| Sidebar `aria-label` includes plain noun | A11Y-04 + lib/routes.ts ariaLabel field |
| Mobile sidebar redistributes (NOT `display:none` with no replacement) | Phase 4 owns; Phase 2 leaves desktop sidebar at 240px |
| 5-second recruiter test is a real exit criterion | Phase 7 final; Phase 2 sets up the mechanism (top-bar resume button) |

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 + @testing-library/react 16.2.0 + @testing-library/jest-dom 6.6.3 + jsdom 26.1.0 |
| Config file | `vitest.config.ts` (existing) — environment jsdom, globals true, setup `vitest.setup.ts` |
| Quick run command | `npm test` (single file watch: `npx vitest <pattern>`) |
| Full suite command | `npm test` (runs `vitest run`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SHELL-01 | Route group never unmounts on sibling nav | manual | DevTools React profiler — confirm shell `id` stable across `/` → `/projects` | manual only |
| SHELL-02 | RSC root + shell layouts (no `"use client"`) | grep | `grep -l '^"use client"' app/layout.tsx app/(terminal)/layout.tsx` returns zero | post-build script (add to package.json scripts) |
| SHELL-03 | TopBar affordances | unit (Vitest) | `npx vitest top-bar.test.tsx` | ❌ Wave 5 — `app/components/shell/top-bar.test.tsx` |
| SHELL-04 | Sidebar 7 rows + recruiter card + STATUS | unit | `npx vitest sidebar.test.tsx` | ❌ Wave 5 — `app/components/shell/sidebar.test.tsx` |
| SHELL-05 | Active sidebar from `useSelectedLayoutSegment()` | unit | mock segment, assert `aria-current="page"` on right row | covered in `sidebar.test.tsx` |
| SHELL-06 | Breadcrumb renders pathname | unit | `npx vitest breadcrumb.test.tsx` | ❌ Wave 5 |
| SHELL-07 | Footer renders correctly | unit | inline in shell-layout test | covered in `terminal-layout.test.tsx` (optional) |
| SHELL-08 | 920px max-width main + slideIn | manual + visual | screenshot review at desktop and 600px | manual |
| SHELL-09 | Cursor blink only loop | grep + manual | `grep -c "@keyframes" app/globals.css` should be ≤3 (slideIn, blink, optional fade); manual reduced-motion test | manual |
| THEME-01 | next-themes `attribute="data-theme"`, defaultTheme dark | unit | `npx vitest theme-provider.test.tsx` — toggle theme, assert `data-theme` attr swaps + localStorage written | ❌ Wave 5 — `app/components/shell/theme-provider.test.tsx` |
| THEME-02 | AccentBootstrapScript inline IIFE | unit | `npx vitest accent-bootstrap-script.test.tsx` — presence + content + dynamic effect | ❌ Wave 5 — `app/components/shell/accent-bootstrap-script.test.tsx` |
| THEME-03 | oklch tokens in globals.css | grep | `grep -c "oklch" app/globals.css` ≥ 6 (4 accent tokens × 2 themes minimum) | grep, post-build |
| THEME-04 | `@supports (color: oklch(0 0 0))` fallbacks | grep | `grep -c "@supports (color: oklch" app/globals.css` ≥ 2 | grep |
| THEME-05 | Accent picker via 4 palette verbs | unit | covered in `command-palette.test.tsx` (D-19) — assert verbs exist + onSelect updates --accent-hue | covered |
| THEME-06 | JetBrains Mono via next/font/google | grep + visual | `grep -c "JetBrains_Mono" app/layout.tsx` = 1; `grep "var(--font-mono)" app/globals.css`; manual CLS check | grep |
| ROUTE-04 | sitemap iterates ROUTES | unit | `npx vitest sitemap.test.tsx` — call default export, assert length = ROUTES.length, urls match | ❌ Wave 5 — `app/sitemap.test.tsx` |
| ROUTE-05 | not-found returns 404 inside shell | curl + unit | `curl -I http://localhost:3000/nope` returns 404; unit test asserts NotFound renders 7 route links | ❌ Wave 5 — `app/not-found.test.tsx` + curl in dev verification |
| PALETTE-01 | cmdk modal opens ⌘K, closes Esc | unit | `npx vitest command-palette.test.tsx` (D-19) | ❌ Wave 5 |
| PALETTE-02 | ≥16 verbs (we have 19) | unit | assert PALETTE_VERBS.length ≥ 16 | covered |
| PALETTE-03 | Type-to-filter + aria-live count | unit | type "contact" → assert filtered list + aria-live region with count | covered |
| PALETTE-04 | Focus trap + restore on close | unit | render trigger + palette, focus trigger, ⌘K, Esc, assert `triggerRef === document.activeElement` | covered |
| A11Y-01 | Skip-link to #main-content | unit | render shell layout, assert `<a href="#main-content">` is first focusable | unit (covered in shell-layout test) |
| A11Y-02 | 2px focus-visible outline | grep + manual | `grep ":focus-visible" app/globals.css` ≥ 1; manual VO tab-through | manual + grep |
| A11Y-04 | Sidebar `<button>` with plain-noun aria-label + aria-current | unit | covered in `sidebar.test.tsx` | covered |
| A11Y-05 | Semantic landmarks | unit | assert `<header>`, `<nav aria-label="File explorer">`, `<main id="main-content">`, `<footer>` exist | covered in shell-layout test |
| A11Y-06 | LiveClock aria-hidden | unit | `npx vitest live-clock.test.tsx` — assert `aria-hidden="true"` | ❌ Wave 5 |
| A11Y-08 | Keyboard nav + ⌘K trap + Esc restore | manual + unit | manual VO tab pass; unit: D-19 covers focus restore | manual + covered |
| TEST-02 | Vitest shell coverage | meta | `npx vitest run` — all D-18 tests pass | runs as part of `npm test` |
| TEST-03 | Vitest palette coverage | meta | all D-19 tests pass | runs as part of `npm test` |
| TEST-04 | Vitest theme + accent coverage | meta | all D-20 tests pass | runs as part of `npm test` |

### Sampling Rate

- **Per task commit:** `npm test` (single-pass; jsdom + RTL is fast — full Phase 2 suite should run in <5s) + `npm run lint` + `npm run typecheck`
- **Per wave merge:** `npm test && npm run lint && npm run typecheck && npm run knip && npm run build` (matches CI 5-step gate from Phase 1 D-03)
- **Phase gate:** Full suite green + manual Slow-3G no-flash recording + manual VoiceOver tab pass + manual 375px screenshot before `/gsd-verify-work`

### Wave 0 Gaps

(per CONTEXT.md D-21 wave structure, "Wave 0" is conceptual — these are test-infra bootstraps that the planner may schedule into Wave 5 OR earlier as a Wave 0 prerequisite.)

- [ ] `package.json` devDependency: add `@testing-library/user-event@^14.6.1` for ⌘K/Esc keyboard simulation
- [ ] `vitest.setup.ts` — verify it imports `@testing-library/jest-dom/vitest` (it does, per existing file). No further setup needed unless we add a global localStorage reset between tests (recommended): `beforeEach(() => localStorage.clear())` in setup.
- [ ] `app/components/shell/top-bar.test.tsx` — covers SHELL-03 (renders all required affordances)
- [ ] `app/components/shell/sidebar.test.tsx` — covers SHELL-04, SHELL-05, A11Y-04
- [ ] `app/components/shell/command-palette.test.tsx` — covers PALETTE-01..04, THEME-05
- [ ] `app/components/shell/theme-provider.test.tsx` — covers THEME-01 (toggle theme + localStorage)
- [ ] `app/components/shell/accent-bootstrap-script.test.tsx` — covers THEME-02
- [ ] `app/components/shell/live-clock.test.tsx` — covers A11Y-06 + hydration-safe placeholder
- [ ] `app/sitemap.test.tsx` — covers ROUTE-04
- [ ] `app/not-found.test.tsx` — covers ROUTE-05 (rendering; HTTP 404 verified separately via curl)
- [ ] Optional: `app/(terminal)/layout.test.tsx` — covers A11Y-01, A11Y-05, SHELL-07

**Manual checks (no automated jsdom equivalent):**
- Slow-3G no-flash recording (success criterion 2) — DevTools Network → Slow 3G → set localStorage `portfolio-accent=340` and `theme=light` → hard reload → record video → no green/dark flash
- 375px screenshot review (Risk 3) — DevTools device frame → reload each route → resume button visible above fold
- VoiceOver tab pass (A11Y-04, A11Y-08) — Cmd+F5 → Tab through shell → confirm plain nouns on sidebar + focus restoration on palette close
- Bundle size assertion (success criterion 1) — `npm run build` output: shared shell First Load JS column < 50KB

## Environment Availability

Phase 2 is a code/config change phase — all tooling is in `package.json` already.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 22.x | All build/test commands | Required by `engines` field | 22.x | None (build fails on lower) |
| `next` | App Router runtime | ✓ | ^15.5.15 | None |
| `next-themes` | THEME-01 | ✓ | ^0.4.6 | None |
| `cmdk` | PALETTE-01..04 | ✓ | ^1.1.1 | None |
| `@testing-library/user-event` | TEST-03 ⌘K simulation | ✗ | — | `fireEvent.keyDown` (lower-fidelity); install user-event 14.6.1 |
| Vitest jsdom + RTL | TEST-02..04 | ✓ | 3.1.4 / 16.2.0 | None |
| Knip | CI orphan check | ✓ | ^6.11.0 (Phase 1 D-03) | None |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**
- `@testing-library/user-event@^14.6.1` — fallback `fireEvent.keyDown` works for `Escape` but `metaKey/ctrlKey` modifier sequence is more reliable with user-event. Recommend install (~30KB devDependency).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | sRGB hex fallback values for accent tokens (`#4ade80` for matrix dark, `#1f5a35` for matrix light) are reasonable approximations of `oklch(0.78 0.18 145)` and `oklch(0.42 0.16 145)` | Pattern 4 (oklch tokens) | Visual regression on ~7% of users (older mobile Safari without oklch). Mitigation: eye-check at design QA; Phase 5 axe-core audit catches contrast failures. Low risk because matrix is the default — non-default hue users on non-oklch browsers see matrix-only, which is acceptable v1 tradeoff per Pitfall 8 |
| A2 | cmdk `Command.Dialog` actually renders a Radix Dialog under the hood (per cmdk source + community sources) and inherits the Radix `DialogTitle` requirement | Pattern 2 (cmdk integration), Pitfall 6 | If cmdk uses a different dialog primitive, the visually-hidden Title pattern is unnecessary but harmless. Verify by reading cmdk source during Wave 3 implementation. Low risk — Pitfall 6 has documented this from multiple sources |
| A3 | `disableTransitionOnChange` on next-themes ThemeProvider correctly suppresses CSS transition flash during light↔dark swap | Pattern 1, D-07 | If it doesn't fully suppress, theme toggle has a brief 100–300ms transition flash. Mitigation: visual QA. Low risk — this is the canonical next-themes pattern, well-documented |
| A4 | Vitest jsdom executes inline `<script>` tags emitted via `dangerouslySetInnerHTML` synchronously during render, allowing TEST-04 to assert `--accent-hue` is set after first render | Pitfall 7 | If JSDOM defers script execution, the dynamic test fails. Mitigation: D-20's primary assertion (presence-and-content) doesn't depend on execution; the dynamic effect test can fall back to manually invoking the IIFE source via `eval()` or `new Function()`. Medium risk |
| A5 | The `keywords` filter behavior in cmdk 1.1.1 is substring match on `value + ' ' + keywords.join(' ')` (per WebFetch of pacocoursey/cmdk README) | Pattern 2, D-04 alias rationale | If filter is fuzzy or prefix-only, single-character queries (e.g., `g`) match too many or too few items. Mitigation: D-19 test pins behavior; aliases are seeded with substrings users actually type (`gh`, `github`, `mail`). Low risk — verified via README excerpt |
| A6 | Phase 2 ships seven `metadata: { title }` exports per route stub satisfying ROUTE-02's "unique title" CI test (Phase 3 enriches these with description / canonical / OG) | D-12 | If Phase 3 changes the title format, the CI uniqueness test still passes (titles remain unique strings). Low risk — title format is internal |
| A7 | Adding `tabIndex={-1}` to `<main id="main-content">` is the canonical pattern for skip-link target focus and does NOT pollute normal Tab order | Pitfall 3 | If browsers exhibit edge-case focus behavior, may need `tabIndex={0}` or a separate sentinel. Low risk — well-established A11Y pattern |
| A8 | The existing `localStorage["portfolio-theme"]` key from Phase 0 is harmless after Phase 2 deletes its only reader (the legacy `themeScript`); next-themes uses its own `theme` key (default storageKey) | Runtime State Inventory | If next-themes were configured with `storageKey="portfolio-theme"` (it's not in our config), there'd be a one-time migration. Low risk — D-09 explicitly says don't override storageKey |
| A9 | A `[ASSUMED]` weight payload of 4 weights × 1 subset (`latin`) for JetBrains Mono fits within reasonable mobile budget (Pitfall 10 doesn't quantify; community wisdom: ~30–50KB self-hosted) | Pattern 3 / THEME-06 | If too heavy on 3G, Lighthouse Performance drops. Mitigation: Phase 7 Lighthouse audit catches; weights can be trimmed if needed. Low risk — handoff explicitly specifies 400/500/600/700 |

**If a planner sees an `[ASSUMED]` claim that affects a critical path, surface it in the plan-check pass.**

## Open Questions

These are for the planner to resolve at task-design time, NOT for the user. The user already settled the architectural questions in CONTEXT.md.

1. **Where does the alias index live: `lib/palette-verbs.ts` (preferred) vs inline in `command-palette.tsx`?**
   - What we know: D-04 says planner picks. Specifics § says "(b) — keeps `lib/routes.ts` minimal and makes the verb file self-contained."
   - Recommendation: `lib/palette-verbs.ts`. Exports `PALETTE_VERBS: PaletteVerb[]` and a `PaletteVerb` type. Action functions accept `{router, setOpen, setHue, ...}` context object so the verbs file has zero React imports.

2. **Third social pick — Mastodon, Bluesky, or X?**
   - What we know: D-04, D-05, Specifics §"Third social pick" — defer to planning; depends on developer's actual public profiles. If none exists, ship with 2 socials (still ≥16 floor met).
   - Recommendation: Ask the developer at planning. If unanswered, ship 2 (GitHub + LinkedIn) and document a CONTENT decision in `lib/portfolio-data.ts`. PALETTE-02 floor is met (18 verbs).

3. **`CAREER_START_DATE` actual value (D-15 uptime)**
   - What we know: CONTEXT.md says "actual value developer-supplied at planning"; example is `"2018-01-01"`.
   - Recommendation: Ask developer at planning. If unanswered, use `"2018-01-01"` as a placeholder and flag for Phase 6 content pass — uptime can be edited any time without code change.

4. **Result-count instrumentation in cmdk palette**
   - What we know: D-19 / PALETTE-03 require an `aria-live` region announcing count. cmdk doesn't expose a `count` callback directly.
   - Recommendation: Use `Command.List` ref + `MutationObserver`, OR maintain query state externally and filter `PALETTE_VERBS` ourselves with `shouldFilter={false}`, OR count visible `Command.Item` elements via `useEffect` after each render. Planner picks. The "filter externally" route gives most control and lets us reuse the same filter logic in the test.

5. **`<main id="main-content">` placement: in route-group layout vs in each page stub?**
   - What we know: A11Y-01 + A11Y-05 both want `<main id="main-content">` once at the right scope. Per Anti-Pattern 4, layout fetches nothing — `<main>` lives in the route-group layout, not duplicated per stub.
   - Recommendation: `<main>` lives in `app/(terminal)/layout.tsx`; each page stub returns a fragment of children inside `<main>`. Skip-link in same file points to `#main-content`.

6. **How to capture `triggerRef` for focus restoration when ⌘K opens via keyboard (no click event)?**
   - What we know: The keydown listener fires when focus is anywhere. `document.activeElement` at the moment of keydown is the right answer.
   - Recommendation: In the keydown handler, capture `triggerRef.current = document.activeElement as HTMLElement` BEFORE calling `setOpen(true)`. On close, focus that element. If `activeElement` is `<body>` (rare), default to the ⌘K trigger button via a fallback ref.

7. **Does Phase 2 ship the boot-fade animation (Discretion §)?**
   - What we know: Discretion says yes, single `slideIn` on first mount. `prefers-reduced-motion` block disables it.
   - Recommendation: Yes — pure CSS; ~5 lines. Use a `useState(true)` flag flipped after first render to skip on subsequent navigations. Minimal scope.

8. **CSS skip-link styling specifics (A11Y-01)**
   - What we know: Reveal on `:focus`. No specific design tokens given.
   - Recommendation: Match design system — `position: absolute; top: -40px; left: 8px; padding: 8px 12px; background: var(--accent); color: var(--bg); z-index: 9999;` and `:focus { top: 8px; }`. Planner finalizes.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/02-shell/02-CONTEXT.md` — 21 locked decisions D-01..D-21 (UPSTREAM)
- `.planning/research/SUMMARY.md` — convergent decisions table; Phase 2 delivery list; Risks 1–5
- `.planning/research/ARCHITECTURE.md` — Patterns 1–5 (route-group, two-script SSR-flash, per-route fetch, useSelectedLayoutSegment, sitemap from registry); Anti-Patterns 1–6
- `.planning/research/PITFALLS.md` — Pitfalls 3 (FART), 4–7 (recruiter UX), 8 (oklch contrast), 9 (RSC boundary), 10 (font CLS), 11 (orphan code)
- `.planning/research/STACK.md` — version pins, peer-dep matrix, "what NOT to use" list
- `.planning/REQUIREMENTS.md` — SHELL-01..09, THEME-01..06, ROUTE-04..05, PALETTE-01..04, A11Y-01..08, TEST-02..04 specifications
- `.planning/codebase/TESTING.md` — Vitest 3.1.4 + RTL 16.2 + jsdom 26.1 setup verified
- `.planning/codebase/CONVENTIONS.md` — RSC default, kebab-case, PascalCase, `@/` alias, UPPERCASE constants
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 carry-forwards (Node 22.x, CSP deferred, custom headers)
- `lib/routes.ts` (existing, Phase 1) — 7-entry typed const array with `slug`/`pathname`/`label`/`ariaLabel`/`description`
- `app/layout.tsx` (existing) — `metadataBase` already correctly set (Phase 1); stub `themeScript` to be deleted
- `package.json` — `next@^15.5.15`, `react@19.1.0`, `next-themes@^0.4.6`, `cmdk@^1.1.1`, Vitest 3.1.4 all installed
- `design_handoff_terminal_portfolio/app.jsx` lines 26–60 (palette tokens), 67–82 (palette state), 273–286 (palette items), 554–580 (palette JSX) — canonical for visual ambiguity
- [Next.js 16.2 next/font/google reference](https://nextjs.org/docs/app/api-reference/components/font) — verified `weight` array form, `display`, `variable`, `fallback`, `adjustFontFallback` semantics; canonical CSS-variable pattern
- npm registry verifications (2026-05-06):
  - `next@16.2.4` (latest), project pins `^15.5.15`
  - `next-themes@0.4.6` (latest, 2025-03-11)
  - `cmdk@1.1.1` (latest, 2025-03-14, peer `react ^18 || ^19`)
  - `@testing-library/user-event@14.6.1` (latest)

### Secondary (MEDIUM confidence — verified via WebFetch from project-trusted sources)

- [github.com/pacocoursey/next-themes README](https://github.com/pacocoursey/next-themes) — verified ThemeProvider API (`attribute`, `defaultTheme`, `enableSystem`, `disableTransitionOnChange`, `storageKey`, `nonce`, `scriptProps`); verified automatic pre-paint script injection; verified `suppressHydrationWarning` requirement on `<html>` for App Router
- [github.com/pacocoursey/cmdk README](https://github.com/pacocoursey/cmdk) — verified `keywords` prop on `Command.Item` acts as alias; verified default filter is substring on `value + ' ' + keywords.join(' ')`; verified `shouldFilter={false}` opt-out for custom logic
- [Radix UI Dialog docs](https://www.radix-ui.com/primitives/docs/components/dialog) — verified `Dialog.Title` is required for accessibility; verified `<VisuallyHidden asChild>` pattern for hiding the title

### Tertiary (LOW confidence — flagged in Assumptions Log)

- A1: sRGB hex fallback values are eyeball-derived approximations of the oklch values from the design handoff. Final values should be eye-checked at design QA OR pre-computed via `oklch.click` and pinned.
- A2: cmdk → Radix Dialog inheritance is documented in PITFALLS.md issue #393 reference but not directly verified in this research session against cmdk 1.1.1 source.
- A4: JSDOM synchronous execution of inline `<script>` tags via `dangerouslySetInnerHTML` is established React + JSDOM behavior but should be confirmed during Wave 5 test authoring; fallback (manual `eval()` of the IIFE source string in the test) is documented.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all four prod deps already installed (Phase 1) and verified against npm registry; `@testing-library/user-event` install verified
- Architecture: HIGH — five locked patterns all from project-level research; route group, two-script SSR-flash, per-route fetch, useSelectedLayoutSegment, sitemap-from-registry are all canonical Next.js patterns
- Pitfalls: HIGH (RSC boundary, font CLS, oklch contrast, theme/accent flash, orphan code) — all verified across multiple sources; MEDIUM (cmdk filter behavior pinned by single README excerpt — D-19 test serves as additional verification at execution time)
- Validation: HIGH — Vitest infrastructure exists and is documented; only addition is `@testing-library/user-event`
- Open questions: All planner-resolvable; none block research → plan handoff

**Research date:** 2026-05-06
**Valid until:** 2026-06-05 (30 days for Next.js 15.x ecosystem; cmdk and next-themes are slow-moving)

---

*Phase 2 — Shell research*
*Researched: 2026-05-06*
*Ready for: `/gsd-plan-phase 2`*
