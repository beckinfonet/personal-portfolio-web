# Pitfalls Research

**Domain:** Terminal/IDE-themed personal portfolio (Next.js 15 App Router + React 19 + TypeScript), dual audience (engineers + recruiters), per-view routes, full responsive, sibling-repo backend
**Researched:** 2026-05-06
**Confidence:** HIGH for SEO, theme/SSR, font, and brownfield pitfalls (verified against Next.js docs and community post-mortems); MEDIUM for recruiter-usability claims (synthesized from one strong post-mortem plus general UX literature)

---

## Critical Pitfalls

### Pitfall 1: SEO regression — losing per-route metadata when migrating from a single-page homepage to a route-segmented App Router app

**What goes wrong:**
The current `app/page.tsx` carries a single `metadata` export inherited from `app/layout.tsx` and ships exactly one URL in the sitemap. When the redesign splits content into `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`, developers commonly leave per-route `metadata`/`generateMetadata` unset and let every route inherit the root layout's title. The result: Google sees seven pages with the *same* title, *same* description, *same* canonical (or no canonical at all if `metadataBase` was forgotten), and the existing single-page SEO baseline regresses on every new URL.

**Why it happens:**
- App Router metadata inheritance is convenient but silent — there is no warning when a child segment lacks its own `metadata` export.
- Developers treat the new routes as "internal navigation" rather than as discrete indexable surfaces (the terminal UX framing reinforces this — they feel like "tabs in an IDE", not pages on a website).
- `metadataBase` is already missing in the existing codebase (per `CONCERNS.md` — Open Graph URLs render relative). Splitting routes amplifies that bug across seven URLs instead of one.

**How to avoid:**
- Add `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")` to the **root** `app/layout.tsx` before any new route is added.
- Each `app/<view>/page.tsx` exports its own `metadata` with: unique `title`, unique `description` (150–160 chars), `alternates: { canonical: "/<view>" }`, and a route-appropriate `openGraph.url`.
- For `/writing/[slug]` (if dynamic), use `generateMetadata` and `generateStaticParams` — never let a dynamic segment fall through to layout metadata.
- Add a CI check or Vitest snapshot that asserts each route's `metadata.title` is unique (string set deduplication test).

**Warning signs:**
- `grep -r "export const metadata" app/` returns fewer hits than route files.
- `grep -r "alternates" app/` returns zero hits.
- Build log warning: `metadataBase property in metadata export is not set...`
- Lighthouse SEO audit flags duplicate `<title>` across pages.

**Phase to address:** Shell phase — add `metadataBase` and per-route `metadata` exports as part of route scaffolding, *before* any view content is migrated. This is cheaper as a convention enforced from the first route than retrofitted across seven.

**Severity:** **HIGH** — direct regression of an explicitly non-negotiable constraint ("SEO parity" in PROJECT.md).

---

### Pitfall 2: Sitemap drift — `app/sitemap.ts` keeps returning only `/` after new routes ship

**What goes wrong:**
The existing `app/sitemap.ts` returns a hardcoded one-URL array. New per-view routes (`/projects`, `/stack`, etc.) ship without sitemap entries. Google discovers them via internal links eventually, but the sitemap-stated truth (1 URL) contradicts the actual surface area (7+ URLs), which Search Console flags as "Discovered – currently not indexed" or "Submitted URL not selected as canonical." Worse, dynamic `/writing/[slug]` routes never get added at all.

**Why it happens:**
- `sitemap.ts` is a "set it once and forget it" file — nobody opens it during a UI redesign.
- `CONCERNS.md` already notes the sitemap-only-homepage gap; the redesign multiplies the routes but the sitemap update is easy to skip when chasing visual fidelity.
- Static `MetadataRoute.Sitemap` arrays don't fail the build when stale.

**How to avoid:**
- Rewrite `app/sitemap.ts` to **enumerate every view route from a single source of truth** (e.g. a `VIEWS` constant in `lib/views.ts` that the sidebar, command palette, sitemap, and route definitions all consume).
- For `/writing/[slug]`, fetch posts in `sitemap()` (re-using the same `getPosts()` from `lib/api.ts`) and emit one entry per slug — exactly the pattern documented in the Next.js sitemap reference.
- Add a Vitest test asserting `sitemap().length >= VIEWS.length`.

**Warning signs:**
- `wc -l app/sitemap.ts` shows fewer lines than the number of views.
- `curl https://<site>/sitemap.xml | grep -c "<loc>"` returns 1.
- Search Console "Pages" report shows new routes as "Crawled – currently not indexed".

**Phase to address:** Shell phase — when adding routes, update sitemap in the same PR. Add the writing-slug iteration in the writing-content phase.

**Severity:** **HIGH** — SEO regression with delayed (weeks) detection in production.

---

### Pitfall 3: SSR theme/accent flash (FART — Flash of inAccurate coloR Theme)

**What goes wrong:**
The handoff specifies dark default + four accent hues (matrix/amber/cyan/magenta) persisted to localStorage. Naive implementations render the server HTML with the *default* theme + accent, then a `useEffect` reads localStorage on mount and overwrites `data-theme` and `--accent`. Users with stored preferences see a 100–300ms flash of the wrong theme/accent on every page load. On mobile (slower JS execution), the flash is worse — and on per-route navigations using the App Router, it can repeat.

**Why it happens:**
- `useTheme()` from `next-themes` returns `undefined` on the server; reading localStorage requires the client to be mounted, which is too late to prevent paint.
- The current codebase (per `CONCERNS.md`) already has a `try {} catch {}` inline pre-hydration script for theme — the redesign must preserve that pattern *and* extend it for the accent hue, which `next-themes` does not handle out of the box.
- Accent hue is a *second* axis beyond theme — even projects that get theme right often forget the accent has the same race condition.

**How to avoid:**
- Use `next-themes` with `attribute="data-theme"` and `defaultTheme="dark"` and `enableSystem` — `next-themes` injects its own pre-hydration script that runs before paint.
- For the accent hue (which `next-themes` does not manage), inline a *second* tiny pre-hydration script in `app/layout.tsx`:
  ```tsx
  <script dangerouslySetInnerHTML={{ __html: `
    try {
      var h = localStorage.getItem('accent-hue');
      if (h) document.documentElement.style.setProperty('--accent-hue', h);
    } catch (e) {}
  `}} />
  ```
- Drive ALL accent-derived CSS variables off `--accent-hue` via `oklch(L C var(--accent-hue))` — never store individual derived colors in localStorage; store only the hue scalar.
- Add `suppressHydrationWarning` on `<html>` (required by `next-themes`).
- Set `color-scheme: dark light` on `:root` so even before scripts run, browser chrome (scrollbars, form controls) doesn't flash white.

**Warning signs:**
- Slow-3G throttled DevTools recording shows a colored flash on first paint.
- `data-theme` attribute is absent in the SSR HTML response (`curl <url> | grep data-theme` returns nothing).
- `--accent` resolves to the default hue in the first frame of a Performance recording.
- Visual regression: opening the site with stored `accent: 340` (magenta) shows green for one frame before flipping.

**Phase to address:** Shell phase — theme/accent system is foundational; everything else paints on top of it. Cannot be retrofitted without re-testing every view.

**Severity:** **HIGH** — visible defect on every page load for any user with stored preferences (i.e. every returning visitor); destroys the polish that the terminal aesthetic is selling.

---

### Pitfall 4: Recruiter usability collapse — terminal aesthetic that requires interaction to discover the resume

**What goes wrong:**
Engineers love the file-tree sidebar; recruiters skim. The post-mortem from a developer who shipped a terminal portfolio and then ditched it ("a blinking cursor asking them to type `help` already lost half the room") is the canonical warning: terminal UIs treat the visitor as a participant, but recruiters want to *recognize*, not interact. Specific failure modes seen in this design:
- The **resume button is in the sidebar**, which on mobile collapses behind a hamburger and on desktop sits below the fold of a small laptop screen.
- The **command palette** (⌘K) is the discovery surface for "download resume" — but recruiters don't know ⌘K exists.
- View switching uses **file metaphors** (`about.md`, `contact.sh`) that engineers parse instantly but recruiters read as "weird filenames, not navigation."
- The whole UI **looks like a terminal**, which a recruiter on a phone might bounce from in <3 seconds because it doesn't look like a portfolio.

**Why it happens:**
- The aesthetic is the hook; the developer enjoys it; the recruiter audience is downstream and harder to dogfood.
- "Recruiter discoverability: <5 seconds" is an explicit project requirement, but easy to deprioritize when the visual fidelity is the visible work.
- The sidebar resume card and STATUS block (per the handoff) are well-designed *for desktop engineers* — they evaporate on mobile.

**How to avoid:**
- **Top-bar resume button:** add a persistent "↓ Resume" button to the sticky top bar (not just the sidebar). Visible on every viewport, every route, without collapse.
- **Plain-language fallback labels:** alongside `about.md`, render visible (or `aria-label`) "About" so screen readers and skim-readers see the noun.
- **Mobile resume CTA above the fold:** on viewports <960px, the about-view hero must include a resume download button *and* a contact link in the first viewport — do not rely on the bottom-sheet file switcher for either.
- **Recruiter-friendly meta description**: `<meta name="description">` should say "Sr. Software Engineer portfolio of Bakytbek Tatibekov — projects, experience, resume" — not a terminal pun. Search snippet is the recruiter's first impression.
- **Five-second test, twice**: once on desktop, once on a phone. Hand the URL to a non-engineer; time how long until they find the resume. Hard-fail if >5s.

**Warning signs:**
- Resume button is *only* visible inside the sidebar.
- "Resume" or "CV" string does not appear in the top bar JSX on any viewport.
- Mobile viewport (375px) screenshot of the homepage does not show a resume CTA.
- Search Console / `<title>` reads "~/portfolio — bakytbek@dev — zsh" instead of "Bakytbek Tatibekov — Sr. Software Engineer".

**Phase to address:** Shell phase (top-bar resume button), Mobile-responsive phase (mobile-CTA placement), Content phase (recruiter-friendly metadata strings).

**Severity:** **HIGH** — direct violation of the "Recruiter usability floor" constraint in PROJECT.md (non-negotiable).

---

### Pitfall 5: Recruiter-blind labels — "contact.sh" and "stack.json" as the only navigation labels

**What goes wrong:**
The sidebar file rows are the *only* labels for major sections. A recruiter looking for "Experience" sees `experience.log`; looking for "Contact" sees `contact.sh`. They scan, don't recognize the noun, and assume the page doesn't have what they need. They bounce.

**Why it happens:**
- Faithful translation of the handoff (which is explicitly "high fidelity, recreate pixel-faithfully").
- Engineers parse the extension as decorative; recruiters parse the whole filename as the label.
- The audience asymmetry is invisible to the engineer building it (they're not the audience that will struggle).

**How to avoid:**
- Sidebar `<button>` `aria-label` always includes the plain noun: `<button aria-label="Contact">contact.sh</button>`. Screen readers announce "Contact"; the visible text remains the file metaphor.
- Browser tab `<title>` per route uses the plain noun: `"Contact — Bakytbek Tatibekov"`, not `"contact.sh"`.
- Breadcrumb (above the main column) shows both: `~/portfolio / contact.sh` *and* a small subhead "Contact" — handles both audiences.
- For mobile bottom-sheet/hamburger: render plain nouns ("About", "Projects", "Contact") with file icons, not extensions. Mobile is where recruiters dominate.

**Warning signs:**
- `grep -r "aria-label" app/components/sidebar*` returns no plain-noun strings.
- Mobile nav drawer renders `.sh` / `.md` / `.json` extensions as primary labels.
- `app/contact/page.tsx` has `metadata.title: "contact.sh"`.

**Phase to address:** Shell phase (a11y labels), Mobile-responsive phase (drawer copy), Content phase (per-route titles).

**Severity:** **HIGH** — same audience constraint as Pitfall 4; this is the specific code-level symptom.

---

### Pitfall 6: ⌘K command palette accessibility traps — focus loss, no SR announcement, mobile inert

**What goes wrong:**
A naive `cmdk` integration ships with three latent failures:
1. **Focus is not restored** to the trigger button when the palette closes (Esc/backdrop click). Keyboard users land at the document root and must re-tab through the entire shell.
2. **Result count is not announced** to screen readers as the user types — the live region is missing or has wrong `aria-live` polarity. Filtering looks like nothing happens.
3. **No mobile equivalent** ships. ⌘K is desktop-only; touch users have zero way to access "download resume", "open contact", "toggle theme" via the palette. The discovery surface evaporates on mobile.

Additionally, `cmdk`'s underlying Radix Dialog requires a `DialogTitle` for accessibility — a known issue (#393 in `dip/cmdk`) that ships warnings if missed.

**Why it happens:**
- `cmdk` provides excellent default keyboard behavior (arrow nav, enter, esc) but focus *restoration* is the consumer's job.
- Live-region ARIA for filtered results is easy to forget — the input feels responsive without it, but only sighted users get feedback.
- Mobile is treated as "the palette just doesn't open" rather than "the palette is replaced by a navigation drawer."

**How to avoid:**
- Store the trigger element in a ref before opening; on close, call `triggerRef.current?.focus()`.
- Wrap the results region in `<div role="status" aria-live="polite">` showing visible-or-SR-only text like "12 results"; update on filter changes.
- Always set `<Dialog.Title>` (visually hidden if the design doesn't show one): `"Command Palette"`.
- On `<768px`: hide the ⌘K trigger, show a hamburger that opens a bottom-sheet with the *same* item list (using `cmdk` programmatically or a separate sheet component) — recruiters on mobile must reach the resume and contact via touch.
- Test with VoiceOver (macOS Cmd+F5) and the iOS Safari bottom-sheet to confirm focus and announcements work.

**Warning signs:**
- After Esc-closing the palette, `document.activeElement === document.body`.
- Inspector shows no `aria-live` region in the palette DOM.
- Mobile viewport: no visible button anywhere triggers any palette/menu.
- Console warning: `DialogTitle` is missing.

**Phase to address:** Shell phase (palette wiring + a11y), Mobile-responsive phase (mobile equivalent).

**Severity:** **HIGH** for a11y compliance; **MEDIUM** for recruiter UX (most won't use the palette, but mobile equivalent is non-negotiable).

---

### Pitfall 7: Mobile collapse — desktop sidebar metaphor that doesn't translate

**What goes wrong:**
The handoff is desktop-first: 240px fixed sidebar + 920px main + sticky top bar. Below ~960px the sidebar must go *somewhere*. Common failures:
- Sidebar gets `display: none` and the file-tree navigation simply vanishes — users on mobile have *no* way to switch views except by typing URLs.
- Sidebar becomes a horizontally-scrolling row that wraps awkwardly under the top bar.
- The bottom-sheet/hamburger ships, but the resume-download row, the STATUS block, and the recruiter card all live in the sidebar and don't get re-homed — they just disappear on mobile, exactly where recruiter usage is highest.
- Top bar shrinks to traffic-light dots only (cute, but the ⌘K button and theme toggle become inaccessible).

**Why it happens:**
- Designers prototype on desktop; the responsive collapse is an afterthought.
- The terminal metaphor doesn't have a natural mobile analog (real terminals don't run on phones).
- "Fully responsive (first-class mobile)" is in PROJECT.md but easy to defer until the desktop UI is "done."

**How to avoid:**
- Audit *every* element of the sidebar (file tree, recruiter card, STATUS block) and design an explicit mobile home for each before declaring the sidebar collapsible:
  - File tree → bottom-sheet drawer, opened by hamburger in top bar.
  - Recruiter resume card → top bar persistent button (also fixes Pitfall 4).
  - STATUS block → footer of the about view (not lost, just relocated).
- Mobile breakpoint is **not** "hide sidebar" — it's "redistribute sidebar contents." Write a CSS comment listing where each element migrates.
- Touch targets ≥44×44px on mobile (Apple HIG); sidebar file rows at desktop's 6×16px padding are too small for fingers.
- Build *mobile-first* for the redesign: write the 375px layout first, expand to 960px+. Reverses the easy-to-defer-mobile failure mode.

**Warning signs:**
- 375px viewport screenshot has nowhere to access /projects, /experience, etc.
- Sidebar CSS uses `@media (max-width: 960px) { .sidebar { display: none } }` with no replacement.
- Resume button only renders inside `.sidebar` selector.
- Manual touch test: tappable area for file rows is <44px square.

**Phase to address:** Mobile-responsive phase (dedicated phase). Should be one of the earliest phases, not the last — retrofitting mobile after desktop ships always costs more.

**Severity:** **HIGH** — direct constraint violation; primary recruiter audience uses mobile.

---

### Pitfall 8: Hue-swap accent contrast collapse — oklch chroma at certain hues fails WCAG

**What goes wrong:**
The handoff uses `oklch(0.78 0.18 H)` with H ∈ {145, 75, 200, 340} on dark backgrounds. OKLCH locks perceptual lightness, but **chroma availability differs by hue** — at H=200 (cyan) and H=340 (magenta), the displayable gamut at C=0.18 is narrower than at H=145 (green). Two failure modes:
1. **Out-of-gamut clipping**: the browser silently clips to sRGB, and the perceived contrast against `--bg: #0a0c0b` differs from the intended ~7:1 down to ~5:1 or worse.
2. **Light-theme accent**: `oklch(0.42 0.16 H)` on `--bg: #f4f2ea` — at H=75 (amber) the accent text on cream background may drop below 4.5:1 for body text. WCAG fails specifically on *amber light theme* before any other combination.

Additionally: ~7% of users are on browsers without OKLCH support (older mobile Safari, in-app webviews) and will see *no* color at all if there's no fallback.

**Why it happens:**
- OKLCH is marketed as "perceptually uniform" — developers treat L,C,H as fully independent and forget gamut clipping.
- Contrast checking is done at H=145 (the default) and assumed to hold for all hues.
- `@supports` fallbacks are not added because "OKLCH has 93% support" feels sufficient in 2026.

**How to avoid:**
- Run automated contrast checks (axe, Lighthouse, or `oklch.click` contrast tool) at *every* hue × theme combination = 4 hues × 2 themes = 8 audits. Lock in tokens that pass WCAG AA (4.5:1 body, 3:1 UI) at all 8.
- Where a hue fails contrast, allow per-hue chroma override: `--accent-chroma: 0.18` default, but `[data-accent="amber"][data-theme="light"] { --accent-chroma: 0.20 }` (boost C) or shift the L value.
- Add sRGB fallback via `@supports`:
  ```css
  --accent: #4ade80; /* sRGB fallback */
  @supports (color: oklch(0 0 0)) {
    --accent: oklch(0.78 0.18 var(--accent-hue));
  }
  ```
- Document the contrast ratios in a design-token comment block so future hue additions follow the same audit.

**Warning signs:**
- Lighthouse accessibility audit flags low-contrast text only on certain accent hues.
- Manual axe-core run with each accent setting reveals contrast failures.
- Browser DevTools "Compute" panel shows the resolved accent color clipped (Safari shows "out of gamut" badge).
- Older Safari (iOS 15.3 and below) renders accent as transparent or black.

**Phase to address:** Shell phase (token system + fallbacks), Theme/accent phase (per-hue contrast verification).

**Severity:** **MEDIUM-HIGH** — a11y compliance + 7% of users see no color; Lighthouse SEO score is also affected.

---

### Pitfall 9: Client-component bloat from a shell that wraps every route

**What goes wrong:**
The terminal shell (top bar + sidebar + ⌘K palette + theme/accent toggles + live clock) is interactive — naive implementation makes the *root* `app/layout.tsx` or its single shell component a `"use client"` boundary. That boundary then **forces every nested page (about, projects, stack, etc.) into the client bundle**, even though the views themselves are pure server-rendered content. Hydration cost balloons, the React-Server-Components benefit evaporates, and Lighthouse Performance drops by 20–40 points.

**Why it happens:**
- React Server Components require deliberate *client/server boundary* design — easy to get wrong when porting from a JSX prototype where everything is client-side.
- `cmdk`, `next-themes`, and the live clock are all client-only — convenient to hoist them to the top, fatal for performance.
- A single `"use client"` at the wrong level cascades through the whole tree.

**How to avoid:**
- Keep `app/layout.tsx` as a **Server Component**.
- Build a thin client-component wrapper *only* for the interactive parts: `<ClientShell>` containing `<TopBarClient>`, `<SidebarClient>`, `<CommandPaletteClient>`. Pass server-rendered children through as `children` props, not as imports.
- Pattern: `<ClientShell>{children}</ClientShell>` where `children` is the per-route server-rendered view. The shell hydrates; the views don't.
- The clock is its own tiny client component (`<LiveClock />`); the theme toggle is its own (`<ThemeToggle />`). Don't make the sidebar one giant client component because *one* button in it is interactive.
- Audit with `npm run build` — look at the "First Load JS" per route. Target: shared shell <50kB gzipped; per-view delta <10kB.

**Warning signs:**
- `grep -r "^\"use client\"" app/layout.tsx` returns a hit.
- `grep -rn "use client" app/components/` shows the directive on the top-level shell file.
- Build output shows every route with the same large First Load JS (means everything client-rendered).
- Lighthouse Performance < 80 with TBT (Total Blocking Time) > 300ms.

**Phase to address:** Shell phase — boundary design must be settled before content fills in. Refactoring boundaries after content is shipped requires re-testing every view.

**Severity:** **HIGH** — directly affects Core Web Vitals (LCP, INP) which Google Search now uses for ranking; affects every page.

---

### Pitfall 10: JetBrains Mono CLS — fallback font metric mismatch causing layout shift

**What goes wrong:**
JetBrains Mono via `next/font/google` self-hosts, applies `font-display: swap`, and *should* generate a size-adjusted fallback. But three things commonly go wrong on terminal portfolios:
1. **Fallback chain misconfigured**: the `fallback` array in `next/font/google` is omitted or set to `["sans-serif"]` (proportional) — when JetBrains Mono is loading, the page renders in a proportional system font, and the entire monospace-aligned layout (file tree, JSON view, experience log with hex hashes) reflows when the mono font swaps in. Massive CLS spike.
2. **Multiple weight import**: importing weights `400/500/600/700` as separate `next/font` calls ships 4× the font payload (~80kB extra over wire).
3. **Variable name collision**: defining `--font-mono` and never using it as the body font — `font-family` in `globals.css` references "JetBrains Mono" by string, which bypasses next/font's CSS-variable injection and breaks self-hosting optimization.

**Why it happens:**
- `next/font/google` "just works" for proportional fonts; the monospace fallback story is less documented.
- Developers import weights individually to "get TypeScript autocomplete" on each weight, missing the single-call array form.
- The CSS variable pattern `var(--font-mono)` is the correct pattern but easy to forget when copying CSS from the handoff.

**How to avoid:**
- Single `next/font/google` call with all weights and explicit monospace fallback:
  ```ts
  const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    display: 'swap',
    fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    adjustFontFallback: 'Times New Roman' // Next will compute size-adjust automatically; verify with Lighthouse
  });
  ```
- In `globals.css`: `font-family: var(--font-mono);` — use the CSS variable, never the font name as a string.
- After build, manually verify with DevTools "Rendering > Local fonts disabled" that the fallback chain holds the layout (no CLS).
- Add `<html lang="en" className={jetbrainsMono.variable}>` in `app/layout.tsx`.

**Warning signs:**
- DevTools Performance recording shows layout shift cluster ~200–500ms after first paint.
- Lighthouse "Avoid layout shifts" audit flags `<body>` as the shifting element.
- `grep -r "font-family" app/globals.css` shows literal `"JetBrains Mono"` instead of `var(--font-mono)`.
- Network tab shows >4 font file downloads for JetBrains Mono.

**Phase to address:** Shell phase (font wiring is layout-level), Performance-audit phase (CLS verification before launch).

**Severity:** **MEDIUM-HIGH** — CLS is a Core Web Vital; mono font portfolios are extra sensitive because every character is a character-grid alignment.

---

### Pitfall 11: Brownfield orphan code — `homepage.tsx`, `homepage.test.tsx`, fallback data fields drift from new shape

**What goes wrong:**
The plan deletes `app/components/homepage.tsx` and `app/components/homepage.test.tsx`, replaces them with view components, and reshapes `lib/portfolio-data.ts` to match the terminal data model. The risks:
- `homepage.tsx` gets deleted but `theme-toggle.tsx` (still used? maybe replaced?) is left as an orphan, or worse, both old and new theme components coexist and drift.
- `lib/fallback-data.ts` (per `CONCERNS.md`, contains demo placeholders like `beck@example.com`) is renamed to `portfolio-data.ts` but old import paths still resolve, and old shape fields are still exported. Code uses *both*.
- `lib/types.ts` evolves to the new shape but the sibling `portfolio-services/` backend still returns the old shape — front-end fallback works in dev (uses `portfolio-data.ts`), production breaks (API returns `Profile` with old field names, types are incompatible at runtime, errors are swallowed by `getJson`'s silent catch).
- `app/components/homepage.test.tsx` is deleted but no equivalent test for the new shell is added — coverage silently regresses to zero meaningful tests.

**Why it happens:**
- Brownfield migrations are deceptive — files look gone (`git rm`) but their data model lingers in imports, types, and consumer code.
- The silent `getJson` error handler (per `CONCERNS.md`) makes API/type drift invisible until production.
- The two-repo split (frontend + sibling backend) means schema changes happen in two places that aren't atomically coupled.

**How to avoid:**
- Use `knip` or `find-unused-exports` in CI: any unused export, file, or dependency fails the build. Run before merging the deletion PR.
- Add `zod` schemas for the new API response shape; validate `getJson` results at the boundary; throw on shape mismatch (turns silent drift into loud failures during dev).
- Coordinate the schema change as a single milestone artifact: write the TypeScript shape (`lib/types.ts`) + the zod schema + the sibling-backend response shape *first*, then update both the frontend and `portfolio-services/` to match in lockstep.
- Replace `homepage.test.tsx` immediately, in the same PR that deletes it, with `terminal-shell.test.tsx` covering view switching, palette open/close, and theme toggle. Otherwise coverage just disappears.
- After deletion, run `git grep -r "homepage" .` and `git grep -r "fallback-data"` to confirm no stragglers.

**Warning signs:**
- `npm run build` succeeds but Knip reports unused files/exports.
- Type errors on `npm run typecheck` for properties that exist in fallback data but not in API response (or vice versa).
- `lib/api.ts` still imports `fallback-data` after `portfolio-data.ts` exists — two sources of truth.
- Test count drops between PRs ("we deleted 1 test, added 0").
- `homepage.tsx` is deleted but `theme-toggle.tsx` is still imported by something (or no longer imported and just sitting orphaned).

**Phase to address:** Cleanup phase (final phase before deploy) **plus** discipline within every phase: each PR that deletes an old surface adds a new one, never just deletes.

**Severity:** **HIGH** — risk of silent production failures (API drift swallowed by error handler) and lost test coverage (no Vitest coverage means refactor regressions go unnoticed).

---

### Pitfall 12: Placeholder content shipping to production — bio TODOs, "lorem ipsum", `beck@example.com`, fake project entries

**What goes wrong:**
PROJECT.md hard-requires "no content placeholders in production" — but the existing `lib/fallback-data.ts` already contains `beck@example.com`, `https://github.com/`, `Product Studio` (per `CONCERNS.md`). The redesign expands the data model (adds `projects`, `shipped apps`, `writing`), and the easy path is to ship placeholder objects ("Project Alpha", "Lorem ipsum summary") into seed data and then forget. Worse: the placeholder text gets indexed by Google before the real content lands.

**Why it happens:**
- Velocity preference — placeholder data unblocks UI work; real content writing is a separate task.
- The "static fallback" pattern means placeholder data ships *as production fallback* and renders whenever the API is unreachable.
- No automated check distinguishes "valid string" from "lorem ipsum string."

**How to avoid:**
- Two-tier fallback strategy:
  - In `lib/portfolio-data.ts` (real seed data): only ever-real values. `email` must be the actual email, never `example.com`.
  - In `lib/fixtures.ts` (test-only data): obviously-fake values used by Vitest, never imported by production code.
- Add a build-time check (Node script in `package.json` `prebuild`) that greps the build output for forbidden strings: `lorem`, `ipsum`, `placeholder`, `example.com`, `TODO`, `FIXME`, `Project Alpha`. Fail build on hit.
- Add a Vitest test that imports `PORTFOLIO_DATA` and asserts each `string` field passes plausibility checks (no "example", no `todo`, valid email regex on `email`, valid URL regex on social `url`s).
- In the API client, treat fallback usage as a *visible* warning in non-production: render a small banner "DEV: API unreachable, using fallback data." So the developer cannot accidentally ship the fallback as real.

**Warning signs:**
- `grep -ri "lorem\|ipsum\|placeholder\|example.com\|TODO" app/ lib/` returns hits.
- Sitemap entries for `/writing/foo-bar-baz` slugs that don't correspond to real posts.
- Resume PDF in `public/` is <500kB or text-readable (placeholder, per existing bug).
- Open Graph image is the Next.js default favicon.

**Phase to address:** Content phase (real data population) **plus** verification in deploy phase (build-time grep check + manual review of every shipped string). This is *also* an explicit milestone "definition of done" requirement.

**Severity:** **HIGH** — explicitly hard-blocks the user's definition of "done"; placeholder content is the single most damaging bug for a recruiter-facing portfolio (per `CONCERNS.md` analysis of the existing `resume.pdf` issue).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip per-route `metadata` exports, rely on layout fallback | Faster route scaffolding | SEO regression on every new route; duplicate `<title>` across 7 pages; recovery requires touching every route file | Never — add metadata when adding the route |
| Hoist `"use client"` to the layout to enable a single interaction | One-line palette wiring | Forces every page into client bundle; LCP/INP regress; Lighthouse drops 20–40 points | Never — always create a thin client wrapper instead |
| Hardcode hue contrast for the default H=145 only | Saves 7 contrast audits | Fails WCAG on 3 of 4 hues; fails light-theme amber for sure; a11y violation lands silently | Never — audit all 8 combinations |
| Ship without `metadataBase` set | Build doesn't fail | OG previews break on LinkedIn/Slack/Twitter; recruiters share broken cards; canonicals are relative | Only in localhost-only branches |
| Use the API silent-fallback pattern unchanged | Keeps existing resilience | Backend schema drift goes undetected; placeholders render as real content; no observability | Only with zod validation + visible dev banner |
| Defer mobile until desktop is "done" | Faster visual progress in dev | Mobile redesign-after-the-fact always ships poorly; recruiter audience is on phones | Never — mobile-first or mobile-parallel |
| Skip `aria-label` on file-extension labels | Pixel-perfect to handoff | Recruiters and screen readers can't parse navigation; a11y audit fails; bounces increase | Never — file labels are decorative, plain nouns are required for SR |
| Skip the mobile palette equivalent ("⌘K is desktop-only") | Saves a sheet component | Touch users can't access resume/contact/theme — every recruiter on a phone | Never — touch parity is non-negotiable |
| Ship without Knip / `find-unused-exports` in CI | Saves 30 min CI setup | Orphan files accumulate (`homepage.tsx`, `fallback-data.ts`, old theme code); brownfield migration leaks | Only if a manual audit checklist enforces deletion in every PR |
| Single weight import for JetBrains Mono | Slightly faster initial CSS | Either ships fewer weights than design needs (visual regression) or ships heavier-than-needed font payload | Never — explicit weight array in single import |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `next-themes` | Using `useTheme()` at the layout level for SSR-rendered styling — returns `undefined` server-side, causes hydration mismatch | Read theme only in client components; render theme-dependent UI gated by a `mounted` boolean; rely on `next-themes`'s pre-hydration script for `data-theme` |
| `cmdk` | Forgetting `Dialog.Title` (Radix dialog requirement); not restoring focus on close | Always include hidden `<Dialog.Title>Command Palette</Dialog.Title>`; store trigger ref, restore on close |
| `next/font/google` (JetBrains Mono) | String `font-family: "JetBrains Mono"` in CSS bypasses next/font CSS variables | Use `var(--font-mono)` in CSS; expose variable via `font.variable` on `<html>` |
| Sibling `portfolio-services/` backend | Frontend type changes ship before backend ships matching response shape; silent `getJson` catch hides the runtime mismatch | Coordinate schema changes via shared zod schema or OpenAPI spec; deploy backend changes *first*, frontend second; validate with zod at boundary |
| `app/sitemap.ts` | Hardcoded route list drifts from actual routes added | Drive sitemap from a single `VIEWS` constant also consumed by sidebar/palette/route definitions |
| Vercel deployment | `NEXT_PUBLIC_SITE_URL` not set → `metadataBase` falls back to `localhost:3000` in production OG cards | Set `NEXT_PUBLIC_SITE_URL` in Vercel project env (production *and* preview); assert on it in CI |
| `localStorage` for theme + accent | Two separate keys, two separate scripts, two race conditions | Use `next-themes` for theme; one tiny inline script for accent hue; document both in `app/layout.tsx` with comments |
| Browser print stylesheet (recruiter prints resume page) | Terminal aesthetic is illegible when printed | Add `@media print { :root { --bg: white; --text: black; ... } }` minimal print stylesheet; or just link to PDF |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Shell as one big client component | First Load JS >150kB on every route; TBT >300ms | Split shell into thin client islands wrapping server children | Immediately on launch — Lighthouse < 80 on day 1 |
| JetBrains Mono CLS from missing fallback | CLS > 0.1 on first load; visible text-jump | Explicit monospace fallback array + `var(--font-mono)` + `adjustFontFallback` | Slow connections (3G), first-time visitors |
| Live clock causing 1Hz re-render of entire shell | Profiler shows shell re-rendering every second; battery drain on mobile | Isolate `<LiveClock>` as its own component using `setInterval` + local state; never lift clock state to shell | Mobile devices, long sessions |
| `cmdk` mounted on every page (even when closed) | ~30kB JS shipped to every page; hydration cost | Lazy-mount palette via `dynamic(() => import('./palette'), { ssr: false })`; only hydrate on first ⌘K press | Mobile / slow networks |
| Five blocking `fetch` calls in `app/page.tsx` (existing pattern, per `CONCERNS.md`) | TTFB blocked on slowest API call (or 30s timeout) | Wrap each section in `<Suspense>` + per-call `AbortController` with 2-3s timeout | Any time backend is slow or down |
| Sitemap fetches all writing posts without revalidation | Build time grows linearly with post count | Cache the writing post list with `next: { revalidate: 3600 }` in the sitemap fetch | At scale (hundreds of posts) |
| Accent hue change re-renders entire React tree | UI feels janky on hue swap | Drive accent via CSS custom property update only — `document.documentElement.style.setProperty('--accent-hue', H)` — no React state push | Visible on every accent toggle |
| `next/image` not used for avatar/screenshots | Large images blow LCP budget | Establish convention now: any image goes through `next/image` with explicit width/height | First time a project screenshot is added |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Inline pre-hydration script blocks strict CSP (existing issue, per `CONCERNS.md`) | Cannot adopt CSP without `'unsafe-inline'`; XSS protection weakened | Use nonce-based CSP via `headers()` in `next.config.ts`; inject same nonce into theme/accent inline scripts; or move to cookie-based theme detection |
| API-supplied URLs (social `href`, app store URLs) rendered without scheme validation (existing) | API compromise could inject `javascript:` URLs (XSS) | zod schemas with `.url().startsWith("https://")` for all external URLs in `lib/api.ts` |
| `dangerouslySetInnerHTML` for theme script with empty catch (existing) | Real failures invisible (localStorage SecurityError, quota) | Pair inline script with structured logging in non-prod; consider `unstable_after` server-side fallback in Next 15+ |
| External links missing `rel="noopener"` (existing pattern uses `rel="noreferrer"` only) | Window-opener attack surface on `target="_blank"` | Always `rel="noopener noreferrer"` on every external anchor; add ESLint rule `react/jsx-no-target-blank` |
| Resume download served from public path with no integrity check | Cached/CDN-poisoned resume could replace legitimate file | Version filename (`resume-2026-05.pdf`); set `Content-Disposition: attachment; filename="Bakytbek_Tatibekov_Resume.pdf"` via `headers()` |
| `localStorage` stores accent hue without validation | Crafted localStorage value could inject CSS via `setProperty('--accent-hue', payload)` | Validate the read value matches `^\d{1,3}$` and is in [0, 360); discard otherwise |
| `next@15.3.2` carries critical advisories (existing, per `CONCERNS.md`) | Known RCE, SSRF, source code exposure, cache poisoning | **Upgrade to `next@^15.5.15` as part of the foundation phase, before adding new code on a vulnerable base** |
| Sibling backend allows `/api/*` from any origin | CORS open allows attacker to embed your portfolio's data on their site | Restrict CORS in `portfolio-services/` to portfolio's deploy domain; treat the API as semi-private |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Filename labels (`contact.sh`, `about.md`) as primary navigation copy | Recruiters scan, don't recognize, bounce | Plain-noun `aria-label` + plain-noun `<title>`; visible filename remains for engineers |
| Resume CTA buried in sidebar | Recruiters miss it on mobile and small laptops | Persistent top-bar resume button on every viewport |
| ⌘K is the only way to download resume / open contact | Touch users have no equivalent | Mobile hamburger / bottom-sheet exposes same actions |
| Animated cursor + boot animation + "uptime: 7y 184d" feels gimmicky to recruiters | Recruiters assume the site is non-serious | Keep animations under 250ms; "uptime" is fine as easter egg if resume is already prominent |
| Light theme is an afterthought (default = dark) | Some recruiters force light mode in OS; dark may strain eyes during long workday review | Test light theme as rigorously as dark; ensure light + amber doesn't fail contrast |
| `prefers-reduced-motion` ignored | Vestibular-disorder users get nauseated by slide-in animations | Wrap all animations in `@media (prefers-reduced-motion: no-preference) { ... }` |
| Live clock displays wrong timezone vs. visitor's | "tz: GMT+5" + a clock that doesn't match the recruiter's local time looks broken | Either show the developer's clock with explicit "(GMT+5)" label, or show visitor's local time — never ambiguous |
| Breadcrumb says `~/portfolio / contact.sh` only | Recruiters don't parse it as navigation | Add a plain-noun subhead under the breadcrumb (or in `<title>`) |
| 404 page is a Next.js default | When recruiter mistypes URL or follows stale link, they see a generic Next.js 404 — looks broken | Custom `app/not-found.tsx` styled as terminal `command not found` *with* a link back to home and to resume |
| Shipping with no analytics | "Did the resume actually get downloaded?" is unanswerable | Add Vercel Analytics + a custom event on resume download; defer Sentry as v2 |

---

## "Looks Done But Isn't" Checklist

- [ ] **Per-view routes:** Often missing per-route `metadata` (unique title, description, canonical). Verify: `grep -l "export const metadata\|generateMetadata" app/*/page.tsx | wc -l` equals route count.
- [ ] **Sitemap:** Often missing new routes. Verify: `curl localhost:3000/sitemap.xml | grep -c "<loc>"` matches view count + writing slug count.
- [ ] **Theme persistence:** Often flashes wrong theme on first load. Verify: open DevTools Network → Slow 3G → hard reload; record video; no flash.
- [ ] **Accent persistence:** Often flashes default green even when stored value is magenta. Verify: set accent to magenta, reload, check first-paint frame.
- [ ] **Resume button on mobile:** Often only in the desktop sidebar. Verify: 375px viewport screenshot shows resume CTA above the fold.
- [ ] **⌘K mobile equivalent:** Often missing. Verify: 375px viewport has a visible hamburger or sheet trigger that opens the same item list.
- [ ] **Screen-reader labels:** File-extension labels often the only accessible name. Verify: Run axe-core; tab through sidebar with VoiceOver; each item announces a plain noun.
- [ ] **Focus restoration on palette close:** Often broken. Verify: Press ⌘K, Esc; confirm focus returns to the trigger button (visible focus ring).
- [ ] **Hue × theme contrast:** Often only default-hue tested. Verify: 4 hues × 2 themes = 8 axe-core runs; all pass WCAG AA.
- [ ] **OKLCH fallback:** Often missing. Verify: Test in iOS Safari 15.x or use BrowserStack to confirm sRGB fallback renders accent color.
- [ ] **JetBrains Mono CLS:** Often >0.1 from missing fallback metric. Verify: Lighthouse CLS audit < 0.1; DevTools "Disable local fonts" still preserves layout.
- [ ] **`metadataBase`:** Often missing → relative OG URLs. Verify: Build log has zero `metadataBase` warnings; LinkedIn URL preview shows real image.
- [ ] **Open Graph image:** Often the Next.js default. Verify: `curl -I <url> | grep og:image`; image is 1200×630 and brand-appropriate.
- [ ] **Real resume PDF:** Often still the placeholder (per existing `CONCERNS.md`). Verify: `file public/resume.pdf` reports "PDF document"; `wc -c public/resume.pdf` > 50000.
- [ ] **No demo data in production:** Verify: `npm run build && grep -r "example.com\|lorem\|placeholder\|TODO" .next/server/` returns nothing.
- [ ] **Print stylesheet:** Often forgotten. Verify: Print preview is legible; resume URL or QR code visible.
- [ ] **Old `homepage.tsx` / `homepage.test.tsx` / `fallback-data.ts` deleted:** Verify: `git log --diff-filter=D --name-only | grep homepage` shows the deletion; `find app lib -name "homepage*" -o -name "fallback-data*"` returns nothing.
- [ ] **Knip clean:** Verify: `npx knip` returns 0 unused files / 0 unused exports.
- [ ] **CI on PRs:** Per `CONCERNS.md`, no CI exists. Verify: `.github/workflows/ci.yml` runs `lint + typecheck + test + build` before merge.
- [ ] **`prefers-reduced-motion` honored:** Verify: macOS System Settings → Accessibility → Reduce motion ON, reload; animations are disabled.
- [ ] **Backend schema in lockstep:** Verify: `portfolio-services/` `/api/projects` returns shape matching frontend `lib/types.ts`; integration test passes against real backend, not just fallback.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Per-route metadata missing after launch | LOW | Add `metadata` exports per route in one PR; verify Search Console crawl picks up new titles within ~2 weeks |
| Sitemap missing new routes | LOW | Update `app/sitemap.ts`, redeploy, resubmit sitemap in Search Console |
| Theme flash | MEDIUM | Re-implement with `next-themes` + accent inline script; touches `app/layout.tsx` and accent picker; re-test all 8 hue×theme combos |
| Recruiter discovery failure (no top-bar resume) | LOW | Add top-bar resume button; ship in next deploy; observe analytics for resume-download lift |
| Mobile sidebar collapse | MEDIUM | Mobile-first redesign of nav drawer + bottom sheet; touches every interactive element in the shell |
| ⌘K accessibility (focus not restored, no live region) | LOW | Add ref-based focus restore + `<Dialog.Title>` + `aria-live`; covered by one targeted PR |
| Accent contrast failure on certain hues | LOW | Per-hue chroma overrides via CSS; or remove failing hues from picker (matrix + cyan only) |
| OKLCH unsupported in user's browser | LOW | Add `@supports` sRGB fallback to all `oklch()` calls in CSS |
| Client component bloat | HIGH | Refactor shell into server component + thin client islands; touches every component; re-test all routes |
| JetBrains Mono CLS | LOW | Fix `next/font/google` config in `app/layout.tsx`; one file change |
| Brownfield orphan code drift | MEDIUM | Add Knip to CI; delete orphans; add zod validation to `lib/api.ts`; multi-PR cleanup |
| Placeholder content shipped to production | MEDIUM | Hot-fix real strings into `lib/portfolio-data.ts`; redeploy; submit sitemap re-crawl; pray Google didn't index the placeholder pages |
| `next@15.3.2` advisories | LOW | `npm install next@^15.5`; re-run `npm audit`; redeploy |

---

## Pitfall-to-Phase Mapping

The phases below are research-suggested; the roadmap will finalize them. Mapping uses suggested phase names: **Foundation** (deps + CI + cleanup baseline), **Shell** (terminal layout + theme/accent + palette + routes), **Views** (per-view content rendering), **Mobile-Responsive** (touch + breakpoint adaptation), **Content** (real data + resume PDF + writing posts), **Backend-Sync** (sibling API endpoints + shape coordination), **Polish-Audit** (a11y + Lighthouse + SEO verification), **Deploy** (production cutover).

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Per-route metadata regression | Shell | Vitest test asserting unique `metadata.title` across routes; build log zero `metadataBase` warnings |
| 2. Sitemap drift | Shell + Content (writing slugs) | `curl /sitemap.xml | grep -c <loc>` >= view count |
| 3. SSR theme/accent flash | Shell | Slow-3G video recording shows no flash on reload with stored prefs |
| 4. Recruiter usability collapse | Shell (top-bar resume) + Mobile-Responsive (mobile placement) | 5-second hand-off test on desktop + mobile, twice |
| 5. Recruiter-blind labels | Shell (a11y labels) + Content (per-route titles) | axe-core run; manual VoiceOver tab through sidebar |
| 6. ⌘K accessibility traps | Shell (palette wiring) + Mobile-Responsive (mobile equivalent) | Focus ring lands on trigger after Esc; SR announces result count; mobile hamburger opens equivalent menu |
| 7. Mobile collapse | Mobile-Responsive (dedicated phase, mobile-first) | 375px viewport screenshot has every shell element accessible |
| 8. OKLCH contrast failure | Shell (token system + fallbacks) + Polish-Audit (per-hue verification) | 8 axe-core runs (4 hues × 2 themes) all pass; sRGB fallback verified in iOS Safari 15 |
| 9. Client component bloat | Shell (boundary design) | Build output: shared shell <50kB gzipped; per-view delta <10kB; Lighthouse Performance > 90 |
| 10. JetBrains Mono CLS | Shell (font wiring) + Polish-Audit (CLS verification) | Lighthouse CLS < 0.1; DevTools "Disable local fonts" preserves layout |
| 11. Brownfield orphan code | Foundation (Knip + CI) + every phase (delete + replace in same PR) | `npx knip` returns 0; `git grep homepage` returns 0 hits after Shell phase |
| 12. Placeholder content shipped | Content (real data) + Polish-Audit + Deploy (build-time grep check) | `npm run build && grep -r "lorem\|example.com\|placeholder" .next/` returns nothing; manual review of every shipped string |

---

## Sources

**Authoritative (HIGH confidence):**
- [Next.js docs — generateMetadata API reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js docs — sitemap.xml file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js docs — App Router migration guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Next.js docs — react-hydration-error message](https://nextjs.org/docs/messages/react-hydration-error)
- [Next.js docs — generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [next-themes — official README on flash prevention](https://github.com/pacocoursey/next-themes)
- [Next.js Components: Font (next/font reference)](https://nextjs.org/docs/pages/api-reference/components/font)
- [Vercel — Custom fonts without compromise using Next.js and next/font](https://vercel.com/blog/nextjs-next-font)
- [cmdk — Fast, unstyled command menu React component (official)](https://github.com/pacocoursey/cmdk)
- [cmdk Issue #393 — DialogTitle missing accessibility warning](https://github.com/dip/cmdk/issues/393)

**Verified secondary (MEDIUM confidence):**
- [DEV: Why I Ditched Terminal UIs for Recruiters — post-mortem](https://dev.to/zenoguy/why-i-ditched-terminal-uis-for-recruiters-57p7) — primary recruiter UX evidence
- [Maxime Heckel — Fixing the dark mode flash issue on server rendered websites](https://blog.maximeheckel.com/posts/switching-off-the-lights-part-2-fixing-dark-mode-flashing-on-servered-rendered-website/)
- [CSS-Tricks — Flash of inAccurate coloR Theme (FART)](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/)
- [DebugBear — Fixing Layout Shifts Caused by Web Fonts](https://www.debugbear.com/blog/web-font-layout-shift)
- [LogRocket — 6 React Server Component performance pitfalls in Next.js](https://blog.logrocket.com/react-server-components-performance-mistakes)
- [LogRocket — OKLCH in CSS: Consistent, accessible color palettes](https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes)
- [oklch.click — OKLCH Browser Support in 2025: Better Than You Think](https://oklch.click/blog/oklch-browser-compatibility-2025)
- [Knip — Declutter your JavaScript & TypeScript projects](https://knip.dev/)
- [Mike Bifulco — Migrate from next-sitemap to App Directory's sitemap](https://mikebifulco.com/posts/migrate-from-next-sitemap-to-app-directory-sitemap)
- [InBuild — How to Add SEO to a Next.js App: The Complete 2026 Checklist](https://www.inbuild.io/blog/how-to-add-seo-nextjs)
- [DEV — Next.js 15 App Router SEO Comprehensive Checklist](https://dev.to/simplr_sh/nextjs-15-app-router-seo-comprehensive-checklist-3d3f)
- [Medium — Eliminating Theme Flicker and Hydration Issues in Next.js](https://medium.com/@ajayrajthakur111/eliminating-theme-flicker-and-hydration-issues-in-next-js-3acbae58faa8)
- [Medium — Command Palette UX Patterns #1 (Alicja Suska)](https://medium.com/design-bootcamp/command-palette-ux-patterns-1-d6b6e68f30c1)

**Internal context (HIGH confidence — direct evidence from this codebase):**
- `.planning/codebase/CONCERNS.md` — existing tech debt, security advisories, missing OG image, placeholder resume, silent `getJson` fallback, missing CI
- `.planning/PROJECT.md` — explicit constraints: SEO parity, recruiter usability floor (<5s), no placeholder content, full responsive
- `design_handoff_terminal_portfolio/README.md` — handoff explicitly recommends `next-themes` + `cmdk`; flags theme SSR caveat; documents oklch tokens with hue-driven palette

---

*Pitfalls research for: terminal/IDE-themed Next.js 15 portfolio with dual audience and per-view routes*
*Researched: 2026-05-06*
