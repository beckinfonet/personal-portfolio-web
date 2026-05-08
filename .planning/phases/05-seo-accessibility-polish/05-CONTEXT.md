# Phase 5: SEO + Accessibility Polish - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 ships the cross-cutting polish that audits production fitness — **dynamic OG images, JSON-LD `Person` schema, favicon set, four-hue × two-theme contrast compliance, comprehensive `prefers-reduced-motion` pass, and engineer easter eggs (console signature + view-source comment)**. Plus the explicit Phase 4 → Phase 5 carry-forward: lift the 3-row socials block (email + github + linkedin) inline onto `/about` beneath the lead paragraph (recruiter discoverability fix per Plan 04-05 Gate 9).

**Phase 5 owns these requirements (per ROADMAP.md):** SEO-01, SEO-02, SEO-03, SEO-04, A11Y-03, A11Y-07, DEV-01, DEV-02, DEV-03.

**In-scope deliverables (locked):**
- `app/opengraph-image.tsx` (root) + 7 per-route `opengraph-image.tsx` files generating pure-text matrix-accent OG cards via `next/og` `ImageResponse` (SEO-03)
- Twitter card metadata `summary_large_image` on root `metadata` (SEO-01); per-route OG inherits
- JSON-LD `Person` schema rendered in root layout `<head>` with the available fields today; description/image/address join Phase 6 (SEO-02)
- `app/icon.tsx` (`>_` glyph), `app/apple-icon.tsx` (180×180 rasterization of the same glyph), `app/manifest.ts` (minimal scope), per-scheme `theme-color` (SEO-04)
- Comprehensive `prefers-reduced-motion: reduce` block in `app/globals.css` — global animation reset + retained targeted rules (A11Y-03)
- `@axe-core/playwright` 8-combination contrast audit (4 hues × 2 themes) + per-hue chroma overrides where failing (A11Y-07)
- `console.log` ASCII signature client island (DEV-01) + 6-line view-source HTML comment in `<head>` (DEV-02)
- DEV-03 verification only — `x-built-with` already lives in `next.config.ts` (Phase 1); `x-portfolio-source` ships Phase 7 with the final public URL
- Inline socials mini-contact-card in `about-view.tsx` immediately after the lead paragraph (Phase 4 → Phase 5 carry-forward)

**Out of scope (Phase 6 or 7, do NOT touch):**
- Real bio / projects / writing / shipped / experience / location content — Phase 6 (CONTENT-01..07)
- Real resume PDF — Phase 6 (CONTENT-05)
- `x-portfolio-source` HTTP header value — Phase 7 (needs production URL)
- Production deploy / Lighthouse / Search Console submission / 5-second recruiter test on production — Phase 7 (DEPLOY-01..07)
- Backend cutover — Phase 6 (BACKEND-01..04)
- Per-hue OG image variants — explicitly v2 (SEO-V2-02)
- 3rd-social pick (Mastodon vs Bluesky vs X) — Phase 6 content decision; Phase 5 JSON-LD `sameAs` filter handles it once filled

</domain>

<decisions>
## Implementation Decisions

### Dynamic OG Images (SEO-03)

- **D-01: Pure-text card layout.** Every OG card uses one template — no per-route hand-design. Top: `Bakytbek Tatibekov — Sr. Software Engineer` (large, JetBrains Mono 600). Bottom: `~/portfolio/<route.label>` (smaller, muted) with a small matrix-accent block to the left as the brand mark. Background panel color matches the dark-theme `--bg` token (concrete hex inlined into the `ImageResponse` style — `next/og` does not consume CSS variables). No prompt-line cursor, no chrome, no faux-screenshot frame — these increase `next/og` layout risk for marginal recruiter-side win.

- **D-02: Matrix-only accent for v1.** Single PNG per route (matrix hue = 145). Per-hue × 7-route variants (28 total) explicitly deferred to v2 per SEO-V2-02. Recruiter unfurls always show the brand-default accent regardless of the user's accent setting.

- **D-03: Dark background only.** The default theme is dark per PROJECT.md / Phase 2 D-07; Slack/LinkedIn/iMessage unfurls render identically to most engineers visiting the site. Single rendering pipeline; one PNG per route.

- **D-04: Per-route copy template.** Every route's OG renders the same two-line layout with `route.label` substituted from `lib/routes.ts` — `about.md`, `projects/`, `stack.json`, `experience.log`, `writing/`, `contact.sh`, `shipped.app`. Single source of truth; per-view drift impossible.

- **D-05: File convention — `opengraph-image.tsx` per route.** Root `app/opengraph-image.tsx` for the homepage default; one in each `app/(terminal)/<view>/` directory for per-view variants. Each exports a default async function returning `ImageResponse`. JetBrains Mono passed in `fonts` array. Default 1200×630 dimensions (Next.js / OG protocol default — no custom sizing).

### Twitter Card (SEO-01)

- **D-06: Twitter card on root `metadata` only.** `metadata.twitter = { card: "summary_large_image", title: <root title>, description: <root description> }`. Per-route OG inherits via Next.js metadata composition. No per-route Twitter override.

- **D-07: `twitter:creator` / `twitter:site` deferred to Phase 6.** Depends on the 3rd-social pick (Mastodon vs Bluesky vs X). If X is not picked as the 3rd social, these fields stay omitted (they're optional) — Twitter card still functions because the image + title + description are inherited from OG.

### JSON-LD Person Schema (SEO-02)

- **D-08: Ship Phase 5 with available fields.** Render `{ "@context": "https://schema.org", "@type": "Person", "name": <PROFILE.name>, "jobTitle": <PROFILE.role>, "url": <NEXT_PUBLIC_SITE_URL>, "sameAs": <filtered PROFILE.socials URLs>, "email": <PROFILE.email> }` as a `<script type="application/ld+json">` in root `app/layout.tsx` `<head>`. Conservative against the research warning ("don't ship with stale data") — TODO-marked fields are simply omitted, not stubbed. Google caches what we ship; we ship only what's true. Phase 6 enriches with `description`, `image`, `address` once content lands.

- **D-09: `sameAs` auto-filter.** Helper in `lib/json-ld.ts` iterates `PROFILE.socials`, includes any entry whose `url` matches `/^https?:\/\//` (excludes `TODO:` sentinels). When Phase 6 fills LinkedIn URL + the 3rd-social pick, those entries auto-join `sameAs` with no code edit.

- **D-10: Include `email` in JSON-LD.** Already public on `/contact` and powers the mailto link — including it in JSON-LD strengthens the recruiter-discoverability signal Google's Knowledge Panel exposes. Negligible incremental scraper exposure (email already in plain HTML).

- **D-11: Single render, root layout.** JSON-LD `<script>` lives in `app/layout.tsx` (Server Component) — emitted on every route. Schema.org `Person` is a site-level claim, not a route-level one. Implementation: a small `<JsonLdPerson />` RSC component returning `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />`.

### Favicon Set (SEO-04)

- **D-12: `app/icon.tsx` generates a `>_` glyph.** Universal terminal-prompt signal; reads at 16px; matches the breadcrumb-hint kbd pattern already in the UI. Implementation: `next/og` `ImageResponse` rendering the two-character `>_` in JetBrains Mono on a panel-color background with matrix-accent foreground. Default 32×32.

- **D-13: `app/apple-icon.tsx` rasterizes the same glyph at 180×180.** Same `next/og` `ImageResponse` pattern as `app/icon.tsx`, sized `{ width: 180, height: 180 }`. One source of visual truth — no drift between favicon and apple-touch icon.

- **D-14: `app/manifest.ts` ships minimal.** Returns `{ name: "Bakytbek Tatibekov — Sr. Software Engineer", short_name: "bakytbek.dev", icons: [...], theme_color: <dark --bg hex>, background_color: <dark --bg hex>, display: "browser" }`. No service worker, no install prompt, no `start_url` push toward standalone mode. Satisfies SEO-04 letter without PWA infra.

- **D-15: `theme-color` matches `--bg` per scheme.** `metadata.themeColor = [{ media: "(prefers-color-scheme: dark)", color: <dark bg hex> }, { media: "(prefers-color-scheme: light)", color: <light bg hex> }]`. Mobile browser chrome blends with the shell — invisible top-bar boundary on first paint. Concrete hex pulled from `app/globals.css` `--bg` tokens (planner reads and inlines verbatim; do NOT re-derive).

### Reduced-Motion Pass (A11Y-03)

- **D-16: Belt-and-suspenders global reset.** Add to the existing `@media (prefers-reduced-motion: reduce)` block in `app/globals.css`:
  ```css
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  ```
  Catches every keyframe + transition automatically — including any future Phase 6/7 additions. Effectively removes motion site-wide for users who request it.

- **D-17: Keep existing targeted rules.** The Phase 2 + Phase 4 targeted rules (`.cursor`, `.content-block`, `.breadcrumb-hint`, `.drawer-sheet`, `.drawer-backdrop`, `[cmdk-dialog]`) stay — they're now redundant with D-16's reset but document intent inline. Removal would obscure why those particular elements were called out historically.

- **D-18: Cursor stays visible (no blink).** Current implementation `animation: none` on `.cursor` keeps the 8×14px accent block rendered without flicker; this is the friendly behavior for vestibular triggers. The spec wording "dampens cursor blink" is interpreted as "remove the blink animation" (consistent with the global reset above). The cursor remains as a static visual marker.

- **D-19: "Boot fade" = the existing `slideIn` on `.content-block`.** The spec mentions "stops boot fade" — this refers to the 0.25s `slideIn` micro-animation each view body plays once on mount (Phase 2 D-22 / SHELL-08). Already covered by the existing reduced-motion block; no new boot animation exists.

### Contrast Audit (A11Y-07) — Claude's Discretion at Planning

- **D-20: `@axe-core/playwright` as devDependency, 8-combination matrix.** Install in `devDependencies` only (does not violate the prod-deps lock). Test matrix iterates `accent ∈ {145, 75, 200, 340}` × `theme ∈ {dark, light}` = 8 combinations × 7 routes = 56 audit cells. Failure threshold: any axe `serious`/`critical` finding fails the build.

- **D-21: Tooling specifics (CI vs local-only) — planner picks.** User did NOT select this area for live discussion. Planner makes the call based on:
  - Phase 1 already runs `lint + typecheck + test + knip + build` in CI per INFRA-03 — adding axe-core is a natural extension.
  - Trade-off: CI catches future regressions but adds ~30s per PR; local-only is faster iteration but no regression net.
  - Default if planner is uncertain: CI (catches regressions; aligns with existing CI gate philosophy).

- **D-22: Per-hue chroma/lightness override remediation strategy.** Apply overrides ONLY to combinations that fail axe (conservative). Predicted failure: amber-on-light (Pitfall 8 — `oklch(0.5 0.16 60)` may not hit 4.5:1 against `--bg` light). Remediation lives in `app/globals.css` as `[data-theme="light"] { --warn: oklch(<adjusted L> <adjusted C> 75); }` (or similar token-scoped override). Do NOT proactively tune passing combinations — preserves brand consistency with the handoff palette.

- **D-23: Large-text 3:1 carve-outs allowed.** WCAG 2.1 AA distinguishes ≥4.5:1 body text from ≥3:1 large text (≥18pt or ≥14pt bold). axe-core respects this distinction; Phase 5 does not need a special pass. Headlines (24px+) only need 3:1.

### Console Signature (DEV-01)

- **D-24: ASCII name + invitation + contact.** JetBrains-style ASCII rendering of "BAKYTBEK" (or initials "BT") in matrix accent, then plain lines:
  ```
  Like the site? Source at github.com/beckinfonet
  Available for hire — beckprograms@gmail.com
  ```
  CSS-styled in matrix accent via `console.log("%c<art>%c<lines>", "color: #16a34a; font-family: monospace;", "color: inherit; font-family: monospace;")`. Tone: engineer-to-engineer; lowercase plain text below the art.

- **D-25: useEffect in a tiny client island.** New `app/components/shell/console-signature.tsx` — `'use client'`, ~15 lines. `useEffect(() => { console.log(...); }, [])` runs once on mount. Mounted in `app/(terminal)/layout.tsx` as a sibling to `<CommandPalette />`. Returns `null` (no DOM). Does NOT bloat any existing island; runs after hydration so no SSR mismatch.

- **D-26: Respect `prefers-reduced-motion`?** No — console output is text-only, no animation. The signature fires regardless of reduced-motion preference. (If future iterations add console "animations" via timed `console.log` chains, revisit.)

### View-Source HTML Comment (DEV-02)

- **D-27: 6-line lowercase letter, distinct from console.** Draft (planner can refine words; structure locked):
  ```html
  <!--
    hello, you found the source.
    i build with: typescript, react, nextjs, swift, aws.
    open to: senior engineering roles, ai/agentic systems, mobile.
    reach: beckprograms@gmail.com
    github: beckinfonet
    thanks for looking. — bakytbek
  -->
  ```
  Lowercase = terminal voice (matches `~/portfolio — bakytbek@dev — zsh` path label). Differs from console signature (which is on-screen ASCII art) by being a written letter — the tonal contrast is the easter egg's character per FEATURES.md research.

- **D-28: Inject in root `app/layout.tsx`.** Server Component renders the comment as a string just inside `<head>` via a tiny `<HeadComment />` RSC that returns `dangerouslySetInnerHTML` with the comment HTML, OR — simpler — via Next.js's `head.tsx` if applicable, OR by literal JSX `{/* @ts-expect-error literal HTML comment */}` patterns. Planner picks cleanest approach; the comment must appear in raw `view-source:` output but NOT be visible in DevTools Elements panel (it's a comment node, so this is automatic).

### Custom HTTP Headers (DEV-03)

- **D-29: `x-built-with: nextjs-15-react-19` already shipped.** Phase 1 D-13 (revised) added it to `next.config.ts` `headers()`. No code change in Phase 5. Verification only: `curl -I http://localhost:3000` returns the header.

- **D-30: `x-portfolio-source` deferred to Phase 7.** Per Phase 1 D-13 (revised) — value depends on the public deploy URL (`x-portfolio-source: github.com/beckinfonet/portfolio-web` or similar). Phase 7 sets this when production URL is finalized. Phase 5 verifies the slot exists in `next.config.ts` `engineerHeaders` array; the value can be added during Phase 7.

### Phase 4 Carry-Forward — Inline Socials on /about

- **D-31: Insert mini contact-card after the bio paragraph.** `app/components/views/about-view.tsx` gains a new `<AboutSocials />` block immediately after the lead paragraph (`<p class="bio">`), before the highlights/stat-cards row. Recruiter scan path: name → bio → contact options → highlights/CTA. Resolves the explicit Plan 04-05 Gate 9 friction (recruiter took 8–10s to find contact info on mobile because hamburger was not discoverable).

- **D-32: Always visible at every viewport.** No `@media` gating. Belt-and-suspenders against recruiter friction at desktop too — Phase 4 verdict was PASS but the 8–10s friction was measured at mobile only; desktop friction is unmeasured, safer to fix both. Doesn't conflict with the existing CTA row's ghost socials (those stay; the inline block is a more prominent format earlier in the reading order).

- **D-33: Mini contact-card visual.** Borrows the existing `app/components/views/contact-view.tsx` row pattern: 80–90px LABEL column (uppercase muted) + accent-link rows. Three rows:
  - `EMAIL` → `<a href="mailto:beckprograms@gmail.com">beckprograms@gmail.com</a>`
  - `GITHUB` → `<ExternalLink href="https://github.com/beckinfonet">github.com/beckinfonet</ExternalLink>`
  - `LINKEDIN` → `<ExternalLink href={LINKEDIN_URL}>linkedin.com/in/...</ExternalLink>` (or label-only if URL is TODO at build — see D-34)
  Reuses contact-view CSS classes (`.contact-card`, `.contact-row`) or adds a thin `.about-socials-card` variant if the contact-view layout doesn't compose cleanly. Planner picks.

- **D-34: Data source — hard 3-tuple with TODO guard.** Pin the 3 rows in code: `PROFILE.email` + filter `PROFILE.socials` for entries with `label === "GitHub"` and `label === "LinkedIn"`. Build-time guard: if a URL is the `TODO:` sentinel, render the LABEL row with the URL as muted plain text (no `<a>` tag). The INFRA-05 prebuild grep already catches `TODO` strings and fails the build — so by the time the production build succeeds, all 3 URLs are real. Phase 5 ships against the current state; if LinkedIn URL is filled in Phase 6 first, the row upgrades to a link with no code change.

### Wave Sequencing — Claude's Discretion at Planning

- **D-35: Suggested wave grouping** (planner can refine):
  - **Wave 1 (parallel, no deps):**
    - 1a: SEO files — `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts`, root `app/opengraph-image.tsx`, 7 per-route `opengraph-image.tsx` files
    - 1b: Twitter card metadata addition to `app/layout.tsx`
    - 1c: globals.css reduced-motion global reset (single CSS append)
    - 1d: about-view inline socials block + ExternalLink wiring
  - **Wave 2 (sequential, depends on lib/json-ld.ts existing):**
    - 2a: `lib/json-ld.ts` helper (sameAs filter + Person schema builder)
    - 2b: `<JsonLdPerson />` RSC + mount in `app/layout.tsx`
    - 2c: View-source HTML comment injection in `app/layout.tsx`
  - **Wave 3 (sequential):**
    - 3a: `<ConsoleSignature />` client island + mount in `(terminal)/layout.tsx`
  - **Wave 4 (sequential, depends on all visual changes complete):**
    - 4a: `@axe-core/playwright` install (devDep) + 8-combination test runner
    - 4b: Run audit; per-hue chroma overrides applied to `app/globals.css` for any failing combinations (predicted: amber-on-light)
    - 4c: Re-run audit; iterate until 8/8 pass
  - **Wave 5 (manual gate):** `curl -I` verification for `x-built-with`; visual check of OG cards via Slack unfurl preview or Twitter card validator; `view-source:` check for HTML comment; OS reduce-motion toggle test on each route

  Total: ~6–8 plans depending on how fine-grained planner splits Wave 1.

### Claude's Discretion (HOW choices left to planner)

- OG card font weight, exact tracking, accent block size — planner picks within JetBrains Mono families
- HTML comment placement order within `<head>` — typically just after `<meta charSet>` for max view-source visibility
- ConsoleSignature ASCII art exact bytes — initials "BT" vs full "BAKYTBEK" vs prompt-line styled — planner authors and the user reviews on first run
- `<JsonLdPerson />` file location — `lib/json-ld.ts` (helper) + `app/components/shell/json-ld-person.tsx` (RSC) is the cleanest split
- INFRA-05 grep includes `TODO` — Phase 5 must NOT introduce new `TODO:` strings outside `lib/portfolio-data.ts` (carry-forward from Phase 1 D-10 / Phase 3)
- `@axe-core/playwright` test file location — `tests/contrast.spec.ts` or `e2e/axe.spec.ts` — planner picks; Phase 5 introduces the first Playwright tests in this project (Vitest is jsdom only)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked decisions

- `.planning/PROJECT.md` — Vision, constraints (no Tailwind, pure CSS + custom properties), out-of-scope list (no Konami easter egg, no analytics in v1, no tweaks panel), default theme = dark, default accent = matrix (145), dual-audience non-negotiables (recruiter + engineer)
- `.planning/REQUIREMENTS.md` — **Phase 5 owns:** SEO-01..04, A11Y-03, A11Y-07, DEV-01..03. Read the requirement bodies, not just the IDs.
- `.planning/ROADMAP.md` §"Phase 5: SEO + Accessibility Polish" — Goal, depends-on Phase 4, 5 success criteria
- `CLAUDE.md` — Pure CSS only; no new prod deps beyond `next-themes` + `cmdk` (Phase 1 lock); persistent shell never unmounts; plain-noun `aria-label`s; brownfield delete-and-replace in same commit; 5-second recruiter test as a real exit criterion

### Research convergence (settled, do not re-debate)

- `.planning/research/SUMMARY.md` §"Phase 5: SEO + Accessibility Polish" — OG image strategy (`opengraph-image.tsx` + JetBrains Mono in `fonts`); JSON-LD requires real bio/socials (coordinated with Phase 6 here via D-08 auto-filter); console.log + view-source comment; predicted axe failures
- `.planning/research/FEATURES.md` §"Distinctive features" rows for OG, JSON-LD, console signature, view-source comment, custom HTTP headers — and §"Anti-patterns" row explicitly rejecting Konami; §"Anti-patterns" landmines (JSON-LD with stale data; per-hue OG variants premature in v1)
- `.planning/research/PITFALLS.md` Pitfall 8 — amber-on-light contrast failure prediction; per-hue chroma override remediation pattern (D-22)
- `.planning/research/PITFALLS.md` Pitfall 10 — JetBrains Mono CLS prevention via `adjustFontFallback` (already wired Phase 2; OG `ImageResponse` uses the same font)

### Codebase intel (snapshot at 2026-05-07 / Phase 4 complete)

- `.planning/codebase/STACK.md` — `next-themes@^0.4.6`, `cmdk@^1.1.1`, `next/font/google` JetBrains Mono. No new prod deps Phase 5; `@axe-core/playwright` is devDep only.
- `.planning/codebase/CONVENTIONS.md` — kebab-case files, PascalCase components, `@/` alias, RSC default with `"use client"` only when needed, UPPERCASE module-level constants
- `.planning/codebase/CONCERNS.md` — Inline-script CSP nuance still deferred (Phase 1 D-15); Phase 5 introduces 1 new inline script (JSON-LD `<script type="application/ld+json">`) which is JSON not JS — same CSP class as the AccentBootstrapScript and themed equivalently
- `.planning/codebase/TESTING.md` — Vitest + jsdom; Phase 5 introduces the first Playwright tests (`@axe-core/playwright` runner)
- `.planning/STATE.md` — Phase 4 complete (verdict PASS); Gate 9 friction documented as Phase 5 → Phase 5 carry-forward (D-31..34)

### Prior phase carry-forwards (locked decisions in effect)

- `.planning/phases/01-foundation/01-CONTEXT.md` — D-10 (`TODO:` marker convention — Phase 5 must NOT introduce new TODO strings outside portfolio-data.ts); D-13 revised (`x-built-with` shipped, `x-portfolio-source` deferred to Phase 7); D-15 (CSP nonce work deferred — Phase 5 inline scripts ship without nonce, same as themed)
- `.planning/phases/02-shell/02-CONTEXT.md` — D-07 (`ThemeProvider` config), D-08 (two pre-paint scripts pattern — JSON-LD is a third inline script, follow same `dangerouslySetInnerHTML` model); D-15 (`PROFILE.socials` is the source-of-truth for `sameAs` filter); JetBrains Mono `--font-mono` available for OG `ImageResponse` `fonts`
- `.planning/phases/03-views/03-CONTEXT.md` — D-08 (`<ExternalLink>` primitive — D-33 inline socials reuse it for github + linkedin); D-16 (per-route `metadata.title` + `description` + `alternates.canonical` already shipped — Phase 5 layers OG/Twitter on top)
- `.planning/phases/04-mobile-responsive/04-CONTEXT.md` — D-12/13 (STATUS rehoming pattern — D-31 mirrors the model with always-visible vs media-gated); D-15 (print stylesheet — Phase 5 reduced-motion reset must NOT conflict with `@media print` rules); explicit Phase 4 → Phase 5 carry-forward in `<deferred>` table

### Existing source-of-truth files (Phase 5 reads, edits, or wraps)

- `next.config.ts` — Phase 1 wired `securityHeaders` + `engineerHeaders` arrays. Phase 5: verify `x-built-with` lands; do NOT add `x-portfolio-source` value (Phase 7).
- `app/layout.tsx` — Server Component. Phase 5 mounts `<JsonLdPerson />` RSC + adds `metadata.twitter` + `metadata.themeColor` + injects 6-line HTML comment in `<head>`.
- `app/(terminal)/layout.tsx` — Phase 5 mounts `<ConsoleSignature />` client island as sibling to `<CommandPalette />` and `<ExplorerDrawer />`.
- `app/globals.css` — Phase 5 appends global `prefers-reduced-motion` reset rule + may add per-hue light-theme `--warn` (or other token) overrides if axe-core fails amber-on-light.
- `app/components/views/about-view.tsx` — Phase 5 adds `<AboutSocials />` mini contact-card immediately after the bio paragraph.
- `app/components/views/contact-view.tsx` — Phase 5 reads its row pattern as the visual reference for D-33; does NOT modify.
- `app/components/primitives/external-link.tsx` — Phase 5 reuses for github/linkedin rows in D-33.
- `lib/portfolio-data.ts` — Phase 5 reads `PROFILE.name`, `PROFILE.role`, `PROFILE.email`, `PROFILE.socials`. Does NOT modify (content lives in Phase 6).
- `lib/routes.ts` — Phase 5 reads `route.label` for OG image per-route copy template. Does NOT modify.

### Design reference (canonical for visual ambiguity)

- `design_handoff_terminal_portfolio/README.md` §"Metadata" (line 218) — recommends setting `metadata.title`, `description`, `openGraph` with name + role + default OG image
- `design_handoff_terminal_portfolio/app.jsx` — line 463 (resume CTA pattern, reused by D-33), 441–468 (contact-view card layout — D-33 visual reference)
- Handoff README does NOT include explicit OG image visual spec, JSON-LD, favicon design, or easter egg content. Phase 5 OG/favicon/easter egg visuals are first-principles design constrained by handoff aesthetic (oklch tokens, JetBrains Mono, `>_`/`$` glyph language, lowercase terminal voice).

### External docs (referenced — read on demand)

- [Next.js opengraph-image and twitter-image metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image) — `opengraph-image.tsx` file convention, `ImageResponse` API, `fonts` parameter
- [Next.js icon and apple-icon metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons) — `app/icon.tsx`, `app/apple-icon.tsx`, default sizes, route segment vs root mounting
- [Next.js manifest.ts](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest) — `MetadataRoute.Manifest` type
- [Schema.org Person](https://schema.org/Person) — full Person schema field reference; required vs optional
- [Google's Structured Data Person guidance](https://developers.google.com/search/docs/appearance/structured-data/person) — Knowledge Panel eligibility
- [@axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright) — install, basic spec, WCAG 2.1 AA configuration
- [WCAG 2.3.3 — Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) — `prefers-reduced-motion` requirements
- [WCAG 1.4.3 — Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — 4.5:1 body / 3:1 large-text rules
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — `reduce` value behavior
- [Bryan Braun — Several Ways to Hide Easter Eggs on your Website](https://www.bryanbraun.com/2018/04/01/several-ways-to-hide-easter-eggs-on-your-website/) — DEV-01/02 pattern reference (per FEATURES.md)
- [DEV.to — Add ASCII Art to console.log](https://dev.to/deadlybyte/easter-egg-hunt-anyone-add-ascii-art-to-the-console-log-4emg) — DEV-01 pattern reference (per FEATURES.md)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`app/globals.css` `--bg`, `--bg-raised`, `--accent`, `--warn` tokens** — `theme-color` meta values (D-15) and OG image background (D-01) read from these. Per-hue chroma overrides (D-22) write back into these same tokens scoped to `[data-theme="light"] { ... }` or similar.
- **`lib/portfolio-data.ts` `PROFILE`** — JSON-LD (D-08), inline socials block (D-34), console signature (D-24), HTML comment (D-27) all read `name`, `role`, `email`, `socials` from this single source.
- **`lib/routes.ts` `ROUTES`** — OG per-route copy template (D-04) reads `route.label`. Single source of truth.
- **`app/components/primitives/external-link.tsx`** — Phase 3 RSC primitive. D-33 inline socials reuse for github + linkedin rows (`target="_blank"`, `rel="noopener noreferrer"`, trailing `↗` glyph).
- **`app/components/views/contact-view.tsx`** — visual reference for D-33's mini contact-card. Reuse `.contact-card` / `.contact-row` CSS classes if they compose cleanly under `<AboutSocials />`; otherwise add a thin `.about-socials-card` variant.
- **`app/components/shell/accent-bootstrap-script.tsx`** — Phase 2 inline-script pattern (`dangerouslySetInnerHTML`). D-11 JSON-LD render reuses the same model. D-28 HTML comment injection follows a parallel pattern in the Server Component.
- **`next.config.ts` `engineerHeaders` array** — Phase 1 already adds `x-built-with`. D-30 confirms slot exists; Phase 7 fills `x-portfolio-source`.
- **JetBrains Mono via `next/font/google`** — `app/layout.tsx` exposes `--font-mono`. OG `ImageResponse` reads the font file directly (D-05 — `fonts: [{ name: "JetBrains Mono", data: <fetched buffer>, weight: 600 }]`); `next/og` does not consume CSS variables.
- **`@media (prefers-reduced-motion: reduce)` block in globals.css (line 152)** — D-16 appends a global reset to this existing block; D-17 keeps the existing targeted rules.

### Established Patterns

- **RSC default; `"use client"` only at the leaf** — Phase 5 client island count: 1 new (`<ConsoleSignature />`). All SEO-related code (`opengraph-image.tsx`, `<JsonLdPerson />`, `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts`) is RSC.
- **Pure CSS + CSS custom properties in `app/globals.css`** — Phase 5 adds the reduced-motion global reset + any per-hue contrast overrides only.
- **Native fetch / `next: { revalidate }` for data** — Phase 5 fetches nothing.
- **UPPERCASE module-level constants** — Phase 5 may add `PERSON_SCHEMA` (in `lib/json-ld.ts`) or keep the schema computed from PROFILE inside the component. Planner picks.
- **`dangerouslySetInnerHTML` for inline `<script>` content** — Phase 2 AccentBootstrapScript pattern; D-11 JSON-LD reuses; D-28 HTML comment uses a parallel approach.
- **No Tailwind / CSS modules / CSS-in-JS** — locked. Phase 5 OG `ImageResponse` styles use inline `style={{...}}` JSX (this is the only place in the codebase where inline styles are mandated, because `next/og` does not consume external CSS).

### Integration Points

- **`app/icon.tsx`** — NEW. Default export async function returning `ImageResponse`. Renders `>_` glyph at default 32×32.
- **`app/apple-icon.tsx`** — NEW. Same pattern as `app/icon.tsx`, sized 180×180.
- **`app/manifest.ts`** — NEW. Default export function returning `MetadataRoute.Manifest`.
- **`app/opengraph-image.tsx`** (root) + 7 per-route variants — NEW. Default export async function returning `ImageResponse` with the pure-text card layout from D-01.
- **`app/layout.tsx`** — UPDATED. Adds `metadata.twitter`, `metadata.themeColor`, mounts `<JsonLdPerson />`, injects 6-line HTML comment in `<head>`.
- **`app/(terminal)/layout.tsx`** — UPDATED. Mounts `<ConsoleSignature />` client island as sibling to `<CommandPalette />` and `<ExplorerDrawer />`.
- **`app/components/shell/console-signature.tsx`** — NEW client island (`'use client'`). useEffect-based `console.log` invocation. Returns `null`.
- **`app/components/shell/json-ld-person.tsx`** — NEW RSC. Reads `lib/json-ld.ts` builder, emits `<script type="application/ld+json">`.
- **`lib/json-ld.ts`** — NEW. Helper: `buildPersonSchema(profile, siteUrl): PersonSchema` + `filterValidUrls(socials): string[]`.
- **`app/components/views/about-view.tsx`** — UPDATED. Adds `<AboutSocials />` block immediately after the bio paragraph, before the highlights/stat-cards row.
- **`app/components/views/about-socials.tsx`** (or inline in about-view) — NEW. RSC. Renders the 3-row mini contact-card.
- **`app/globals.css`** — UPDATED. Appends global `prefers-reduced-motion: reduce` reset rule (D-16); may add per-hue contrast overrides (D-22).
- **`package.json`** — UPDATED. Adds `@axe-core/playwright` + `playwright` to `devDependencies`. Adds `test:contrast` (or similar) script that runs the Playwright axe spec.
- **`tests/contrast.spec.ts`** (or similar) — NEW. Playwright spec iterating 4 hues × 2 themes × 7 routes; runs axe-core; fails on `serious`/`critical`.

</code_context>

<specifics>
## Specific Ideas

- **OG card layout mockup (D-01):** Two-line, top-half/bottom-half split. Top half centered: `Bakytbek Tatibekov` (60px JetBrains Mono 700) on line 1, `// Sr. Software Engineer` (28px 500, muted) on line 2. Bottom-left aligned: small matrix-accent block (8×24px) + space + `~/portfolio/<route.label>` (32px 500, accent). Background: dark `--bg` panel hex (e.g. `#0c0d0e`). 1200×630.
- **Favicon `>_` rendering (D-12):** JetBrains Mono 700, 24px, matrix-accent (`#22c55e` sRGB fallback or `oklch(0.78 0.18 145)` if `next/og` supports oklch in `ImageResponse` — verify at planning), padded 4px on a 32×32 panel-color background. The `>` and `_` are tight together to read as a single glyph at 16px.
- **JSON-LD draft (D-08):**
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Bakytbek Tatibekov",
    "jobTitle": "Sr. Software Engineer",
    "url": "https://bakytbek.dev",
    "email": "beckprograms@gmail.com",
    "sameAs": [
      "https://github.com/beckinfonet"
    ]
  }
  ```
  When LinkedIn URL fills in Phase 6, `sameAs` auto-extends. When 3rd-social pick lands, ditto.
- **Console signature draft (D-24):**
  ```
  ██████╗  █████╗ ██╗  ██╗██╗   ██╗████████╗██████╗ ███████╗██╗  ██╗
  ██╔══██╗██╔══██╗██║ ██╔╝╚██╗ ██╔╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
  ██████╔╝███████║█████╔╝  ╚████╔╝    ██║   ██████╔╝█████╗  █████╔╝
  ██╔══██╗██╔══██║██╔═██╗   ╚██╔╝     ██║   ██╔══██╗██╔══╝  ██╔═██╗
  ██████╔╝██║  ██║██║  ██╗   ██║      ██║   ██████╔╝███████╗██║  ██╗
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝

  Like the site? Source at github.com/beckinfonet
  Available for hire — beckprograms@gmail.com
  ```
  Or initials-only "BT" if the full name is too wide (terminal width concerns). Planner picks at implementation.
- **HTML comment draft (D-27):** Locked structure, draft wording (planner can refine line 2's tech list as it evolves):
  ```html
  <!--
    hello, you found the source.
    i build with: typescript, react, nextjs, swift, aws.
    open to: senior engineering roles, ai/agentic systems, mobile.
    reach: beckprograms@gmail.com
    github: beckinfonet
    thanks for looking. — bakytbek
  -->
  ```
- **AboutSocials block visual (D-31..34):** Renders below bio, above highlights. Three rows max-width 480px. CSS: `border-top: 1px solid var(--border); padding-top: 16px; margin-top: 24px;` to separate from bio. Each row: `display: grid; grid-template-columns: 80px 1fr; gap: 12px;`. LABEL column uppercase 11px muted. Link column accent 13px.
- **Reduced-motion reset wording (D-16):** Append inside the existing `@media (prefers-reduced-motion: reduce) { ... }` block at globals.css line 152:
  ```css
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  ```
  Existing targeted rules stay below for clarity.
- **`theme-color` exact hex values (D-15):** Read from `app/globals.css` `--bg` tokens at planning. Current dark `--bg` ≈ `#0c0d0e`; current light `--bg` ≈ `#fafaf9`. Inline literally in `metadata.themeColor` array; do NOT re-derive via JS.
- **Twitter card implementation (D-06):** Add to root `metadata` in `app/layout.tsx`:
  ```ts
  twitter: {
    card: "summary_large_image",
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
  }
  ```
  Image is inherited from `opengraph-image.tsx` automatically by Next.js metadata composition.
- **Contrast remediation pattern (D-22):** If amber-on-light fails, add to globals.css inside `[data-theme="light"]`:
  ```css
  [data-theme="light"][style*="--accent-hue: 75"] {
    --warn: oklch(0.42 0.18 75);  /* lower L, higher C — bumps contrast */
  }
  ```
  Or scope to specific UI roles only (e.g., `.btn-warn`, prompt-line `$` mark) rather than the whole `--warn` token, if global reduces brand consistency too far. Planner audits first; remediates only what fails.

</specifics>

<deferred>
## Deferred Ideas

- **Per-hue OG image variants (4 hues × 7 routes = 28 OGs)** — explicitly v2 per SEO-V2-02. Phase 5 ships matrix-only.
- **`twitter:creator` / `twitter:site` handle** — Phase 6 with the 3rd-social pick (Mastodon vs Bluesky vs X). If X is not picked, these fields stay omitted permanently.
- **JSON-LD `description`, `image`, `address` fields** — Phase 6 with content (CONTENT-01 bio, CONTENT-05 resume, profile photo if added).
- **`x-portfolio-source` HTTP header value** — Phase 7 (DEV-03 final) — needs production deploy URL.
- **PWA installable manifest (`display: 'standalone'` + service worker)** — out of scope; portfolio doesn't need offline or home-screen-install affordances. v3 candidate if portfolio-as-a-business-card pattern shifts.
- **`?` cheatsheet view inside palette + `g`+letter vim navigation** — v1.x (PALETTE-V2-01 / PALETTE-V2-02), unrelated to Phase 5.
- **`hire-me.txt` 8th view** — v3 (VIEW-V3-01); only relevant during active job search cycles.
- **Vercel Analytics + custom events** — Phase 7 (DEPLOY-06 covers `resume_download`); Phase 5 ships nothing analytics-related.
- **CSP nonce work for inline scripts (JSON-LD, AccentBootstrap, ConsoleSignature)** — Phase 1 D-15 deferred; Phase 5 inline scripts ship without nonce. Revisit if a future security audit requires it.
- **3rd-social pick (Mastodon vs Bluesky vs X)** — Phase 6 content decision; Phase 5 JSON-LD `sameAs` filter (D-09) auto-handles whatever lands.
- **Real bio content for `description`** — Phase 6 (CONTENT-01).
- **Dynamic per-route Twitter card overrides** — not needed; per-route OG inherits via Next.js metadata composition. Phase 5 ships root-level Twitter card only.
- **Contrast audit tooling area** — user did NOT select for live discussion in present_gray_areas. Captured under D-20..D-23 as planner-discretion decisions; revisit during plan-phase if planner wants user input on CI-vs-local choice or remediation aggressiveness.
- **Console signature ASCII art exact bytes** — initials "BT" vs full "BAKYTBEK" — left to planner authoring + first-run review. Tone, content, and style are locked in D-24.

### Reviewed Todos (not folded)

None — `gsd-tools todo match-phase 5` returned 0 pending todos at discuss time.

</deferred>

---

*Phase: 05-seo-accessibility-polish*
*Context gathered: 2026-05-07*
