# Phase 2: Shell - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 ships the persistent terminal shell that the seven views (Phase 3) plug into:

- `app/(terminal)/layout.tsx` — route-group layout that never unmounts on navigation between sibling routes (per ARCHITECTURE.md Pattern 1)
- `app/layout.tsx` evolved into the providers root — `ThemeProvider` (next-themes), `AccentBootstrapScript` (inline pre-paint), `ShellStateProvider` (Context + `useReducer`), JetBrains Mono via `next/font/google` (`--font-mono`); stays a Server Component (per Pitfall 9 / SHELL-02)
- `app/globals.css` extended with the full oklch token palette (dark + light), `--accent-hue` driving every accent token via `oklch(L C var(--accent-hue))`, `@supports (color: oklch(0 0 0))` sRGB fallbacks for every accent token (THEME-03/04)
- Four client islands only: `TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`. Everything else stays RSC.
- `cmdk@^1.1.1`-based ⌘K palette with ≥16 verbs (full taxonomy locked below in D-01..D-05), focus-trap, focus-restoration on Esc, `aria-live` result-count region (PALETTE-01..04)
- Sidebar fed from `lib/routes.ts` (already locked in Phase 1) — active state from `useSelectedLayoutSegment()`, plain-noun `aria-label` on every row, `aria-current="page"` on active row
- `app/sitemap.ts` rewritten to map over `ROUTES` (ROUTE-04)
- `app/not-found.tsx` terminal-styled 404 rendering inside the shell (ROUTE-05)
- Seven thin route stubs at `app/(terminal)/page.tsx`, `app/(terminal)/projects/page.tsx`, …, `app/(terminal)/shipped/page.tsx` — minimal RSCs returning a `$ <command>` prompt and a placeholder body so palette navigation actually resolves (Phase 3 fills the view bodies; see D-12)
- Brownfield deletions in the **same commit** as the shell skeleton lands: `app/components/homepage.tsx`, `app/components/homepage.test.tsx`, `app/components/theme-toggle.tsx`, plus the existing `themeScript` block in `app/layout.tsx` (D-15)
- Vitest coverage for shell, palette, theme + accent (TEST-02/03/04)

**Mobile boundary:** Phase 2 ships the ⌘K trigger button in the top bar at every viewport (per SHELL-03 + Risk 3) and a centered 520px modal palette. The mobile bottom-sheet palette variant + sidebar bottom-sheet drawer are **Phase 4** — Phase 2 sets up the structure they wrap (D-09).

</domain>

<decisions>
## Implementation Decisions

### Command Palette — Verb Taxonomy & Layout

- **D-01:** **Verb naming convention for the seven route entries: `Open <file-label>`.** Labels match the sidebar exactly (`Open about.md`, `Open projects/`, `Open stack.json`, `Open experience.log`, `Open writing/`, `Open contact.sh`, `Open shipped.app`). Preserves the IDE/file metaphor inside the palette. Recruiter discoverability is handled by the alias index (D-04), not by changing labels.

- **D-02:** **Palette layout: flat list, no group headings.** Single `Command.List` from cmdk with all verbs in one stream. Matches cmdk default and the handoff prototype. Type-to-filter does the disambiguation; aliases (D-04) make the filter forgiving.

- **D-03:** **Accent hue exposed as four explicit `Set accent: <hue>` verbs** — `Set accent: matrix`, `Set accent: amber`, `Set accent: cyan`, `Set accent: magenta`. Type-filterable per hue (`amber` finds exactly that), discoverable, and the verb count benefits — see D-05. **No** "Cycle accent hue" verb. **No** sub-page. **No** top-bar swatches, no sidebar swatches — the palette is the entire user-facing accent UI (D-06).

- **D-04:** **Alias index strategy.** Every palette item carries a `keywords: string[]` array (cmdk's `Command.Item` accepts `keywords` for filter matching). Initial alias seeds (planner can refine):
  | Verb | Aliases |
  |---|---|
  | Open about.md | about, home, bio, who, name, intro |
  | Open projects/ | work, builds, code, projects |
  | Open stack.json | tech, skills, languages, tools, stack |
  | Open experience.log | cv, history, jobs, work, experience |
  | Open writing/ | blog, posts, articles, writing |
  | Open contact.sh | contact, reach, email, social |
  | Open shipped.app | apps, mobile, ios, android, store, shipped |
  | Download resume.pdf | cv, resume, pdf, download |
  | Toggle theme | dark, light, mode, theme |
  | Set accent: matrix | green, default, accent |
  | Set accent: amber | yellow, warm, accent |
  | Set accent: cyan | blue, teal, accent |
  | Set accent: magenta | pink, purple, accent |
  | Open GitHub | gh, github, code |
  | Open LinkedIn | linkedin, professional |
  | Open <third social> | (developer chooses one of Mastodon / Bluesky / X at planning) |
  | Copy email | mail, @, address, email |
  | Copy GitHub URL | github, gh, link |
  | Share this view | copy url, link, share |

  Aliases live alongside verb definitions in a `lib/palette-verbs.ts` (or inline in `command-palette.tsx`); planner picks the file boundary.

- **D-05:** **Final verb count: ~19 (≥16 per PALETTE-02).** Composition: 7 routes + 1 download + 1 toggle theme + 4 set-accent + 3 socials (GitHub, LinkedIn, +1 of {Mastodon, Bluesky, X}) + 1 copy email + 1 copy GitHub URL + 1 share view = 19. Comfortably over the ≥16 floor. Third social pick deferred to planning.

### Accent Picker UI

- **D-06:** **Palette-only — no extra UI.** The four `Set accent: <hue>` verbs from D-03 are the entire user-facing accent picker. No top-bar swatches, no sidebar STATUS swatches, no dedicated accent button. Rationale: keeps top-bar room for the persistent resume button (Risk 3 / SHELL-03 — non-negotiable on every viewport), zero extra responsive surface to test, and the engineer audience discovers via ⌘K naturally. Recruiter audience never needs to change accent — the default (matrix=145) is the brand choice.

### Theme System Wiring

- **D-07:** **`ThemeProvider` config:** `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem` (respects `prefers-color-scheme` on first load when no stored value), `disableTransitionOnChange` enabled (prevents transition flash during light↔dark swap). next-themes owns the theme axis; **never** add accent hues as themes (per ARCHITECTURE.md Anti-Pattern 3).

- **D-08:** **Two pre-paint scripts in `<head>`** — next-themes injects its own theme script automatically (writes `data-theme` attribute on `<html>`); a separate `AccentBootstrapScript` Server Component emits an inline script that reads `localStorage["portfolio-accent"]` (defaulting to `"145"`) and calls `document.documentElement.style.setProperty('--accent-hue', hue)` synchronously before paint. Both scripts run blockingly before `<body>` (per ARCHITECTURE.md Pattern 2 / Risk 1). The existing `themeScript` block in `app/layout.tsx` (which reads `portfolio-theme` — wrong key for next-themes) is **deleted** in the same commit the new providers land — see D-15.

- **D-09:** **localStorage keys:** `theme` (next-themes default — do **not** override) and `portfolio-accent` (custom). Two keys, deliberately separate concerns. Comment in both the inline script and `ShellStateProvider` referencing each other.

### Mobile Palette Scope

- **D-10:** **Phase 2 ships the desktop centered modal at every viewport.** ⌘K trigger button exists in the top bar at all viewports (per SHELL-03). On mobile, tapping/⌘K opens the centered 520px modal — works, just not ideal. **Phase 4 wraps it** with `@media (max-width: 960px)` bottom-sheet styling and a drawer transition (PALETTE-05 stays mapped to Phase 4 in REQUIREMENTS.md). Rationale: keeps Phase 4 mobile-holistic so the sidebar drawer + palette bottom-sheet ship together; smaller Phase 2 test surface; doesn't break the `cmdk` JSX shape.

### Shell Composition & RSC Boundaries

- **D-11:** **Four client islands only.** `TopBar` (`"use client"`), `Sidebar` (`"use client"`), `CommandPalette` (`"use client"`), `LiveClock` (`"use client"` — extracted as its own component so its 30s `setInterval` doesn't bloat the TopBar bundle). Everything else is RSC. `app/layout.tsx`, `app/(terminal)/layout.tsx`, all view stubs (D-12), and `app/components/primitives/*` — all RSC. `Breadcrumb` is **also** a client island because it depends on `usePathname()` (per ARCHITECTURE.md Anti-Pattern 6) — that makes it five total islands; the additional one is a tiny ~20-line component.

### Route Stubs

- **D-12:** **Phase 2 ships seven thin route stubs.** Every route resolves to a `page.tsx` so palette navigation actually works (success criterion 4 says "⌘K opens each of 7 views" — that requires URL resolution). Each stub is a minimal RSC: `<PromptLine cmd="<command from D-13>" />` + a `<p>` saying `// view body lands in Phase 3`. No data fetching, no view components. ROUTE-01 (per-view routes exist) effectively lands in Phase 2 via stubs; ROUTE-02 (unique metadata per route) lands in Phase 3 with the view bodies.
  - Each stub still exports a minimal `metadata` (`{ title: "<file-label> — Bakytbek Tatibekov" }`) so the curl/Vitest test for unique titles already passes for placeholder content. Phase 3 enriches these with `description` / `alternates.canonical` / OG metadata.

- **D-13:** **Stub prompt copy** (Phase 3 may evolve these per view):
  - `/` (about.md): `$ cat about.md`
  - `/projects`: `$ ls -la projects/`
  - `/stack`: `$ cat stack.json | jq`
  - `/experience`: `$ git log --oneline --decorate experience.log`
  - `/writing`: `$ ls writing/ && cat *.md`
  - `/contact`: `$ ./contact.sh --whoami`
  - `/shipped`: `$ ls -la shipped/`

### Live Clock & Status Block

- **D-14:** **LiveClock format: 24h `HH:MM`, user's local time.** Updates every 30 seconds (per handoff). `aria-hidden="true"` per A11Y-06. Isolated client component so it doesn't pull anything else into the client bundle. Hydration-mismatch prevention: render `--:--` server-side; replace with real time after `useEffect` fires (avoids mismatch warning + drift between SSR + client clocks).

- **D-15:** **Sidebar STATUS block defaults:**
  - `● Available for hire` — static, accent dot. v1 ships this on (developer is in active job-search mode per the design intent).
  - `uptime: <Yy DDDd>` — computed at render from a `CAREER_START_DATE` constant in `lib/portfolio-data.ts` (e.g. `"2018-01-01"` — actual value developer-supplied at planning). Rendered via a tiny RSC helper `formatUptime(start, now)` in `lib/uptime.ts`. Computed at build (RSC), not in the client — no `setInterval` for uptime; the daily-resolution drift is acceptable.
  - `tz: <abbreviation> (flex)` — computed via `Intl.DateTimeFormat().resolvedOptions().timeZone` once at module load, formatted to a short label (e.g. `"Asia/Almaty"` → `"GMT+5"`). Falls back to the handoff string `"GMT+5 (flex)"` if the env doesn't resolve. Computed in the Sidebar client island on first render — accuracy doesn't need to track DST.

### Brownfield Deletions

- **D-16:** **Deletions in the same commit as the shell skeleton lands** (per CLAUDE.md brownfield discipline + Phase 1 D-17):
  - `app/components/homepage.tsx`
  - `app/components/homepage.test.tsx`
  - `app/components/theme-toggle.tsx`
  - The `themeScript` literal block + its `<script dangerouslySetInnerHTML>` mount in the existing `app/layout.tsx` (replaced by next-themes' built-in script + the new `AccentBootstrapScript`)
  - The existing root `app/page.tsx` (replaced by `app/(terminal)/page.tsx` — the route-group `(terminal)` makes `/` resolve through the new layout instead)
  Knip CI gate (Phase 1 D-03) will catch any orphan that slips through.

### 404 Handling

- **D-17:** **`app/not-found.tsx` lives at the root** (Next.js convention) but **renders inside the (terminal) shell** by importing the same shell composition. Copy: `$ ls -la <pathname>` followed by `ls: cannot access '<pathname>': No such file or directory` and a list of all 7 routes (sourced from `lib/routes.ts`). Returns HTTP 404 (Next.js does this automatically for `not-found.tsx`; `curl -I` verification per Phase 2 success criterion 5). The `<pathname>` value comes from `headers()` `x-invoke-path` or a client-side `usePathname()` fallback; planner picks the cleanest approach.

### Test Strategy

- **D-18:** **TEST-02 (shell):** `TopBar` renders all required affordances (traffic-lights, path label, ⌘K trigger, theme toggle, LiveClock placeholder, persistent resume button). `Sidebar` renders 7 rows from `lib/routes.ts`, each with the correct `aria-label`. Active state derives from a mocked `useSelectedLayoutSegment()` — assert `aria-current="page"` on the right row.

- **D-19:** **TEST-03 (palette):** Render the shell with the palette mounted; assert closed by default. Fire `⌘K` keydown → palette opens, focus trapped inside. Type `"contact"` → assert filtered list shows `Open contact.sh` + `Copy email` (alias match). Press `Esc` → palette closes, focus returns to the trigger button. Verify `aria-live` region announces result count.

- **D-20:** **TEST-04 (theme + accent):** Mock `localStorage`. Assert the inline `AccentBootstrapScript` renders the correct IIFE source string (presence-and-content assertion on the `<script>` HTML). Mount the shell with `localStorage["portfolio-accent"] = "75"`; assert `document.documentElement.style.getPropertyValue('--accent-hue')` equals `"75"` after first effect runs. Toggle theme → assert `data-theme` attribute swaps + `localStorage["theme"]` updates. No SSR-flash test in jsdom (no real first paint to measure); flash verification is the manual Slow-3G DevTools recording captured in Phase 2 verification.

### Wave Sequencing (Claude's Discretion at Planning)

- **D-21:** **Suggested wave grouping** (planner can refine):
  - Wave 1: `globals.css` token expansion (oklch palette + `--accent-hue` + sRGB fallbacks)
  - Wave 2: Root providers (`app/layout.tsx` rewrite — JetBrains Mono via `next/font/google`, `ThemeProvider`, `AccentBootstrapScript`, `ShellStateProvider`); brownfield deletions land here in same commit (D-16)
  - Wave 3: Shell layout (`app/(terminal)/layout.tsx`) + 5 client islands (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb`) + primitives (`prompt-line.tsx`)
  - Wave 4: 7 thin route stubs + `app/sitemap.ts` rewrite + `app/not-found.tsx`
  - Wave 5: Vitest TEST-02/03/04 specs
  Wave 1 and Wave 2 are sequential because the providers depend on the tokens. Waves 3–5 may parallelize.

### Claude's Discretion

- **TopBar narrow-viewport precedence:** Resume button + theme toggle + ⌘K trigger stay visible at every viewport. Traffic-light dots and path label are first-to-compress (hide path label below ~600px; dots below ~480px). LiveClock can hide below ~480px.
- **Inline-script CSP nuance:** Phase 2 ships the inline scripts as `<script dangerouslySetInnerHTML>` (not nonce-driven). CSP nonce work stays deferred per Phase 1 D-15.
- **Boot animation:** the handoff "boot animation: breadcrumb hint fades in after 350ms" is included as a single `slideIn` on first mount; subsequent navigations skip it (`useState(true)` initial flag flipped after first paint). `prefers-reduced-motion` block disables it (per A11Y-03 — though A11Y-03 itself is Phase 5 scope; Phase 2 ships the `prefers-reduced-motion` block for `slideIn` + cursor blink as a defensive baseline).
- **Cursor-blink primitive:** lives in `app/components/primitives/prompt-line.tsx` so views and the breadcrumb hint share the same `<span class="cursor">` block. 1s `steps(2)` infinite, 8×14px accent block (per SHELL-09).
- **`<ExternalLink>` shared component:** SEO-05 maps to Phase 3 in REQUIREMENTS.md, but the palette opens external socials via `window.open(url, "_blank")`. Phase 2 calls those with `noopener,noreferrer` directly (`window.open(url, "_blank", "noopener,noreferrer")`) — the `<ExternalLink>` JSX component itself ships with views in Phase 3.
- **Palette item action plumbing:** verbs that navigate use `next/navigation` `useRouter().push(pathname)`; verbs that download use a synthetic `<a download>` click; verbs that copy use `navigator.clipboard.writeText` with an `aria-live` toast region (or just the existing result-count region) for confirmation. Specifics decided at planning.
- **`ShellStateProvider` API:** `usePalette()` returns `{open, setOpen, toggle}`; `useAccent()` returns `{hue, setHue}` and writes through to `--accent-hue` + `localStorage["portfolio-accent"]`. Implementation detail.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked decisions

- `.planning/PROJECT.md` — Project vision, constraints (no Tailwind, no SWR, no framework swap), out-of-scope list (no tweaks panel, no REPL, etc.)
- `.planning/REQUIREMENTS.md` — 89 v1 requirements; **Phase 2 owns:** SHELL-01..09, THEME-01..06, ROUTE-04, ROUTE-05, PALETTE-01..04, A11Y-01, A11Y-02, A11Y-04, A11Y-05, A11Y-06, A11Y-08, TEST-02, TEST-03, TEST-04. (PALETTE-05 / mobile bottom-sheet stays mapped to Phase 4 per D-10.)
- `.planning/ROADMAP.md` §"Phase 2: Shell" — Goal, depends-on, requirements list, 5 success criteria
- `CLAUDE.md` — Project working conventions: pure CSS + custom properties only, exactly two new prod deps total (`next-themes@^0.4.6`, `cmdk@^1.1.1`), persistent shell at `app/(terminal)/layout.tsx`, RSC root layout, `useSelectedLayoutSegment()` for active state, brownfield delete-and-replace in same commit, plain-noun `aria-label`s, mobile redistribution rather than `display: none`, 5-second recruiter test as a real exit criterion

### Research convergence (settled, do not re-debate)

- `.planning/research/SUMMARY.md` — Convergent decisions table; Phase 2 §"Phase 2: Shell" delivery list and "must avoid" list; Risk 1 (SSR flash for theme + accent), Risk 2 (client-component boundary collapse), Risk 3 (recruiter usability)
- `.planning/research/STACK.md` — Version pins (`cmdk >= 1.0.3`, `next-themes >= 0.4.x` for React 19 / Next 15.5)
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (route-group persistent shell), Pattern 2 (two-script SSR-flash-free theme + accent — sketches the inline script verbatim), Pattern 3 (per-route data fetching, layout fetches nothing), Pattern 4 (`useSelectedLayoutSegment` for active state), Pattern 5 (sitemap derived from route registry), Anti-Patterns 1–6
- `.planning/research/PITFALLS.md` — Pitfall 3 (theme/accent SSR flash), Pitfall 4 (resume CTA only in sidebar), Pitfall 5 (extension-only `aria-label`), Pitfall 6 (no mobile palette equivalent — note D-10 defers mobile-sheet to Phase 4 explicitly), Pitfall 7 (sidebar `display: none`), Pitfall 9 (RSC boundary collapse), Pitfall 10 (font-loading CLS)
- `.planning/research/FEATURES.md` — Table-stakes feature map; ⌘K verb taxonomy threshold (≥15)

### Codebase intel (snapshot at 2026-05-06 / Phase 1 complete)

- `.planning/codebase/STACK.md` — Existing stack baseline; Phase 1 upgraded `next` to `^15.5.x` and added `next-themes@^0.4.6` + `cmdk@^1.1.1`
- `.planning/codebase/ARCHITECTURE.md` / `.planning/codebase/STRUCTURE.md` — Directory layout, naming conventions
- `.planning/codebase/CONVENTIONS.md` — Existing patterns to preserve (kebab-case files, PascalCase components, `@/` alias, RSC default with `"use client"` only when needed)
- `.planning/codebase/CONCERNS.md` — `metadataBase` (Phase 1 fixed), security headers (Phase 1 D-14), inline-script CSP nuance (deferred per Phase 1 D-15)
- `.planning/codebase/TESTING.md` — Vitest jsdom setup; tests will expand here (TEST-02/03/04)
- `.planning/STATE.md` — Phase 1 complete; Phase 2 enters as the next active phase

### Phase 1 carry-forwards (locked decisions in effect)

- `.planning/phases/01-foundation/01-CONTEXT.md` — D-04 (Node 22.x engines pin), D-10 (`TODO:` marker convention — INFRA-05 grep includes `TODO`), D-13/14 (custom + standard headers in `next.config.ts`), D-15 (CSP deferred — Phase 2 inline scripts ship without nonce), D-17 (homepage adapted in Phase 1, deletion in Phase 2 first commit)
- `.planning/phases/01-foundation/01-PATTERNS.md` — UPPERCASE module-level dataset constants, `@/` alias imports, kebab-case filenames, RSC default

### Lock files / sources of truth from Phase 1

- `lib/routes.ts` — 7-entry typed `ROUTES as const` array. Imported by Sidebar, CommandPalette, `app/sitemap.ts`. Adding an 8th view = single-file edit.
- `lib/types.ts` — Profile, Project, Social, Experience, Writing, ShippedApp, StackCategory. Sidebar STATUS uses Profile; Palette uses Profile.socials.
- `lib/portfolio-data.ts` — Real identity, email (`beckprograms@gmail.com`), GitHub URL, LinkedIn URL (TODO), socials list. Phase 2 uses `PROFILE.socials` to build palette social verbs (D-04).
- `lib/api.ts` — `getJson<T>(path, fallback)` ISR + silent-fallback pattern preserved.
- `app/layout.tsx` (existing) — has `metadataBase` + a stub `themeScript`; Phase 2 deletes the stub script + replaces with next-themes + AccentBootstrapScript per D-08/D-15.

### Design reference (canonical for visual ambiguity)

- `design_handoff_terminal_portfolio/README.md` — High-fidelity design spec; recommends `next-themes` + `cmdk`; defines exact color tokens, typography scale, spacing scale, radii, motion. Phase 2 follows this pixel-faithfully per CLAUDE.md.
- `design_handoff_terminal_portfolio/app.jsx` — 605-line React prototype. **Canonical for any visual ambiguity** per CLAUDE.md. Specific Phase 2 reads: lines 67–82 (palette state), 240–272 (palette CSS shape), 273–286 (palette items — terminal-friendly verb structure mirrored in D-04), 554–580 (palette JSX), throughout for prompt-line + cursor-block + sidebar styling.
- `design_handoff_terminal_portfolio/screenshots/` — 8 PNGs across light/dark + palette + every view; pixel reference for spacing/colors/affordance placement.

### External docs (referenced — read on demand)

- [Next.js Layout API](https://nextjs.org/docs/app/api-reference/file-conventions/layout) — layout state preservation, no `usePathname` in layouts
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — `(folder)` syntax
- [Next.js `not-found.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) — HTTP 404 contract
- [next-themes README](https://github.com/pacocoursey/next-themes) — `attribute`, `enableSystem`, `disableTransitionOnChange`
- [cmdk on npm](https://www.npmjs.com/package/cmdk) — `Command.Item` `keywords`, `Command.List`, focus-trap, `Dialog.Title`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/routes.ts`** — already exports the 7-entry typed `ROUTES` array with `slug` / `pathname` / `label` / `ariaLabel` / `description` per route. Sidebar maps over it for file rows; CommandPalette maps over it for the 7 `Open <file-label>` verbs (D-01); `app/sitemap.ts` maps over it (ROUTE-04). Adding palette aliases is a sibling step — see D-04 for whether aliases live alongside `ROUTES` or in `lib/palette-verbs.ts`.
- **`lib/portfolio-data.ts` `PROFILE.socials`** — palette generates social verbs from this array, so the 3rd-social pick (Mastodon vs Bluesky vs X) is **data-only** at planning time, not code.
- **`lib/api.ts` `getJson<T>` helper** — preserved unchanged in Phase 2. Phase 2 doesn't call it (shell fetches nothing per Anti-Pattern 4); Phase 3 wires per-route `page.tsx` to it.
- **`app/layout.tsx` `metadataBase`** — Phase 1 added it. Phase 2 keeps it; just rewrites the body (providers + scripts + JetBrains Mono setup).
- **`app/sitemap.ts`** — currently hardcoded to `/`. Phase 2 rewrites to `ROUTES.map((r) => ({ url: \`${baseUrl}${r.pathname}\`, ... }))`.
- **`app/globals.css`** — token slot to extend. Phase 2 adds the full oklch palette + `--accent-hue` + `[data-theme="light"]` + `@supports` fallbacks. Pure CSS only (per CLAUDE.md).
- **`vitest.config.ts` jsdom setup** — TEST-02/03/04 reuses it. May need `@testing-library/user-event` for ⌘K keydown — Phase 1 didn't install it; Phase 2 plan should note the dev-dep add (low-cost, well within Phase 2 scope).

### Established Patterns

- **RSC default; `"use client"` only at the leaf** — locked by CLAUDE.md and PATTERNS.md. Phase 2's five client islands (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb`) carry `"use client"` at the file top; nothing else does.
- **Pure CSS + CSS custom properties in `app/globals.css`** — Phase 2 owns the token system extension. No CSS-in-JS, no CSS modules.
- **Native `fetch` + `next: { revalidate: 300 }`** — preserved; Phase 2's stubs don't fetch.
- **Kebab-case filenames; PascalCase exported components; `@/lib/...` imports** — preserved.
- **UPPERCASE module-level constants** — `ROUTES` (existing), `PROFILE` / `PROJECTS` / etc. (existing). New: `PALETTE_VERBS` (if a separate file is used per D-04), `CAREER_START_DATE` (D-15).

### Integration Points

- **`app/layout.tsx`** — rewritten body. Keeps `metadata` export (incl. `metadataBase`). Replaces `themeScript` with next-themes + `AccentBootstrapScript`. Wraps `children` with `ThemeProvider` then `ShellStateProvider`. Adds JetBrains Mono via `next/font/google` (returns `--font-mono` CSS variable applied via `className={jetbrainsMono.variable}` on `<html>` or `<body>`).
- **`app/(terminal)/layout.tsx`** — new file. Server Component. Imports the 5 client islands. Composes `<TopBar />`, `<div class="terminal-body"><Sidebar />{children}</div>`, `<CommandPalette />`. Receives `{ children }` from per-route `page.tsx`.
- **`app/(terminal)/page.tsx`** + 6 sibling route stubs (D-12) — minimal RSCs returning `<PromptLine cmd="..." />` + placeholder body. Each exports `metadata: { title: "<file-label> — Bakytbek Tatibekov" }`.
- **`app/components/shell/`** — new directory. 5 client islands + `theme-bootstrap-script.tsx` (RSC) + `breadcrumb.tsx` (client).
- **`app/components/primitives/prompt-line.tsx`** — new file. Tiny RSC. Renders `<div class="prompt-line"><span class="muted">$</span> <span class="cmd">{cmd}</span><span class="cursor" /></div>`.
- **`app/sitemap.ts`** — rewritten to map `ROUTES` (per ROUTE-04 / Pattern 5). Replaces the existing single-`/` entry.
- **`app/not-found.tsx`** — new file. Renders inside the terminal shell composition. Returns 404 implicitly via Next.js convention.
- **`package.json`** — may add `@testing-library/user-event` (devDependency) if TEST-03 needs ⌘K keydown simulation. Decided at planning.

</code_context>

<specifics>
## Specific Ideas

- **Palette alias index** — D-04 sketches the alias arrays. The planner can either: (a) inline the alias arrays in `command-palette.tsx`, (b) extract a `lib/palette-verbs.ts` module, or (c) extend `ROUTES` entries in `lib/routes.ts` with an optional `aliases?: readonly string[]`. Preference: (b) — keeps `lib/routes.ts` minimal and makes the verb file self-contained; non-route verbs (toggle theme, copy email) need a home anyway. Locked at planning.
- **Default theme: dark; default accent: matrix (145)** — per handoff, Phase 1 plans, and PROJECT.md.
- **Resume button label & icon** — `↓ resume.pdf` per handoff. `<a download="Bakytbek_Tatibekov_Resume.pdf" href={PROFILE.resumeUrl}>↓ resume.pdf</a>`. Inline `<a>` element rather than `<button>` so download semantics work; but `aria-label="Download resume"` for screen readers (file extension is decoration).
- **Theme toggle visual** — `☼ light` / `☾ dark` (handoff). Live label reflects what theme will become if clicked (engineer-mental-model standard).
- **TopBar path label** — `~/portfolio — bakytbek@dev — zsh` (handoff verbatim).
- **Footer copy** — `© <year> <name> · built with React · v1.0.0` per SHELL-07. `<year>` computed from `new Date().getFullYear()` in the (RSC) shell layout.
- **Verb count headroom** — D-05 lands at 19 with 3 socials. PALETTE-02 needs ≥16; we're +3 over the floor. If the developer decides to add a 2nd Mastodon-equivalent (so 4 socials), count goes to 20 — still fine.
- **Third social pick** — defer to planning; depends on developer's actual public profiles. If no third social exists yet, ship with 2 (GitHub + LinkedIn) and accept that PALETTE-02 says "≥3 socials" — minimum is met because total verb count stays at 18, still ≥16. Document as a CONTENT decision in `lib/portfolio-data.ts`.

</specifics>

<deferred>
## Deferred Ideas

- **Mobile palette bottom-sheet styling + mobile trigger** — Phase 4 (PALETTE-05). Phase 2 ships the desktop modal at every viewport; Phase 4 wraps with `@media (max-width: 960px)` rules, swaps the mount position to a bottom-sheet, and adds the touch-ergonomics for ≥44×44px targets per MOBILE-02. (Locked via D-10.)
- **Sidebar bottom-sheet drawer + STATUS rehoming + 240px collapse** — Phase 4 (MOBILE-01..04). Phase 2 ships the 240px desktop sidebar; mobile work is one redistribution event in Phase 4.
- **Per-view metadata enrichment** — Phase 3 (ROUTE-02). Phase 2 stub pages export only `{ title }`; Phase 3 adds `description`, `alternates.canonical`, OG metadata.
- **`<ExternalLink>` shared component** — Phase 3 (SEO-05). Phase 2 calls `window.open(url, "_blank", "noopener,noreferrer")` directly from palette social verbs.
- **OG images, JSON-LD, favicon set, Twitter card** — Phase 5 (SEO-01..04).
- **`@axe-core/playwright` 8-combination contrast audit** — Phase 5 (A11Y-07). Phase 2 ships the `@supports` sRGB fallbacks (THEME-04) and the `@media (prefers-reduced-motion)` defensive baseline, but the actual audit + per-hue chroma overrides happen in Phase 5.
- **Per-project anchors (`/projects#name`)** — v1.x (PALETTE-V2-01 / SEO-V2-01).
- **`?` cheatsheet inside palette + `g`+letter vim navigation** — v1.x (PALETTE-V2-01 / 02).
- **CSP nonce work for inline scripts** — Phase 1 D-15 deferred. Phase 2 inline scripts ship as `<script dangerouslySetInnerHTML>` for now.
- **Console signature easter egg + view-source HTML comment + `x-portfolio-source` header** — Phase 5 (DEV-01/02) and Phase 7 (DEV-03 final URL).
- **`prefers-reduced-motion` full pass** — Phase 5 (A11Y-03). Phase 2 ships the `@media (prefers-reduced-motion: reduce)` block for `slideIn` + cursor-blink as a defensive baseline (cheap; ~5 lines), but the comprehensive audit (boot-fade, theme-toggle micro-animation, all keyframes) happens in Phase 5.
- **Skip-link + `:focus-visible` outline pass** — A11Y-01 / A11Y-02 are technically Phase 2 requirements per REQUIREMENTS.md. Captured here as a reminder, not deferred. They ship in Phase 2.

### Reviewed Todos (not folded)

None — no pending todos in `.planning/todos/` matched Phase 2 scope.

</deferred>

---

*Phase: 02-shell*
*Context gathered: 2026-05-06*
