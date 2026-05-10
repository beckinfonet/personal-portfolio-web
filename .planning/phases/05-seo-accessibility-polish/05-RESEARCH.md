# Phase 5: SEO + Accessibility Polish — Research

**Researched:** 2026-05-10
**Domain:** Next.js 15.5 metadata files (`opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`, `manifest.ts`), JSON-LD `Person` schema, `@axe-core/playwright` 4-hue × 2-theme contrast matrix, comprehensive `prefers-reduced-motion` reset, engineer easter eggs (console + view-source comment), HTTP header verification.
**Confidence:** HIGH — all critical claims verified against `/vercel/next.js` Context7 docs, the official `@axe-core/playwright` README, schema.org/Person, the live codebase (post-Phase 4), and the existing CONTEXT.md decisions. Two `[ASSUMED]` claims are flagged in §Assumptions Log for planner attention; one corrects a deprecated API mentioned in CONTEXT.md (themeColor location).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Dynamic OG images (SEO-03):**
- D-01 — Pure-text card layout (no chrome, no faux screenshot): top half = name + role, bottom half = `~/portfolio/<route.label>` + matrix-accent block. Background = dark `--bg` hex (inlined; `next/og` does not consume CSS variables).
- D-02 — Matrix-only accent for v1 (single PNG per route, hue=145). Per-hue × per-route variants explicitly v2 (SEO-V2-02).
- D-03 — Dark background only.
- D-04 — Per-route copy template substitutes `route.label` from `lib/routes.ts`.
- D-05 — File convention: root `app/opengraph-image.tsx` + one in each `app/(terminal)/<view>/` directory; default 1200×630 dimensions; JetBrains Mono passed in `fonts` array.

**Twitter card (SEO-01):**
- D-06 — Twitter card on root `metadata` only; `card: "summary_large_image"`. Per-route OG image inherits via metadata composition. No per-route Twitter override.
- D-07 — `twitter:creator`/`twitter:site` deferred to Phase 6 (depends on 3rd-social pick).

**JSON-LD `Person` (SEO-02):**
- D-08 — Ship Phase 5 with available fields only: `@context`, `@type: "Person"`, `name`, `jobTitle`, `url`, `email`, `sameAs` (filtered). TODO-marked fields omitted, never stubbed.
- D-09 — `sameAs` auto-filter helper iterates `PROFILE.socials`, includes any URL matching `^https?://`. When Phase 6 fills LinkedIn / 3rd-social, those entries auto-join with no code edit.
- D-10 — Include `email` in JSON-LD (already public on `/contact`; strengthens recruiter Knowledge Panel signal).
- D-11 — Single render in `app/layout.tsx` `<head>`; small `<JsonLdPerson />` RSC; uses `dangerouslySetInnerHTML`.

**Favicon set (SEO-04):**
- D-12 — `app/icon.tsx` generates `>_` glyph via `ImageResponse` (32×32 default).
- D-13 — `app/apple-icon.tsx` rasterizes the same glyph at 180×180 — one source of visual truth.
- D-14 — `app/manifest.ts` minimal: `name`, `short_name: "bakytbek.dev"`, `icons[]`, `theme_color`, `background_color`, `display: "browser"`. No service worker, no install prompt.
- D-15 — `theme-color` matches `--bg` per scheme; concrete hex pulled from `app/globals.css` `--bg` tokens (planner inlines verbatim). **NOTE:** CONTEXT.md says `metadata.themeColor = [...]` — this is the deprecated location; the verified Next.js 14+/15.5 location is the `viewport` export. See §Common Pitfalls Pitfall 3 and §State of the Art for the correction.

**Reduced motion (A11Y-03):**
- D-16 — Belt-and-suspenders global reset: `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }` inside the existing `@media (prefers-reduced-motion: reduce)` block.
- D-17 — Keep existing targeted rules (Phase 2 + Phase 4) for documenting intent.
- D-18 — Cursor stays visible (no blink); existing `animation: none` on `.cursor` is correct interpretation of "dampens cursor blink."
- D-19 — "Boot fade" = the existing 0.25s `slideIn` on `.content-block` (already in scope).

**Contrast audit (A11Y-07) — planner discretion at D-20..D-23:**
- D-20 — `@axe-core/playwright` as devDependency. Matrix: 4 hues × 2 themes = 8 combinations × 7 routes = 56 cells. Failure threshold: any axe `serious`/`critical` finding fails the build.
- D-21 — CI vs local-only is planner's call. Default if uncertain: CI (catches regressions, aligns with INFRA-03 philosophy).
- D-22 — Per-hue chroma override remediation applies ONLY to combinations that fail (conservative; predicted failure: amber-on-light).
- D-23 — Large-text 3:1 carve-outs allowed; axe-core respects WCAG 2.1 AA distinction.

**Console signature (DEV-01):**
- D-24 — JetBrains-style ASCII (full "BAKYTBEK" or initials "BT" — planner picks at first run) + 2 plain lines: `Like the site? Source at github.com/beckinfonet` and `Available for hire — beckprograms@gmail.com`.
- D-25 — Tiny client island `app/components/shell/console-signature.tsx`; `useEffect(() => console.log(...), [])` once on mount; mounted in `app/(terminal)/layout.tsx` as sibling to `<CommandPalette />`. Returns `null`.
- D-26 — Does NOT respect `prefers-reduced-motion` (text-only, no animation).

**View-source HTML comment (DEV-02):**
- D-27 — 6-line lowercase letter (locked structure; draft wording in CONTEXT.md). Tonal contrast vs console signature is the easter egg's character.
- D-28 — Inject in root `app/layout.tsx`'s `<head>`; planner picks cleanest implementation (parallels Phase 2 AccentBootstrapScript pattern).

**Custom HTTP headers (DEV-03):**
- D-29 — `x-built-with: nextjs-15-react-19` already shipped in `next.config.ts` (Phase 1). Verify only.
- D-30 — `x-portfolio-source` deferred to Phase 7 (depends on production deploy URL).

**Phase 4 → Phase 5 carry-forward (inline socials):**
- D-31 — Insert mini `<AboutSocials />` block after lead paragraph, before highlights row.
- D-32 — Always visible (no `@media` gating).
- D-33 — Mini contact-card visual: 80–90px LABEL column + accent-link rows; reuse contact-view CSS or thin variant.
- D-34 — Hard 3-tuple (EMAIL / GITHUB / LINKEDIN) with TODO guard: if URL is `TODO:` sentinel, render LABEL row with muted plain text (no `<a>`).

**Wave sequencing (D-35) — planner refines.**

### Claude's Discretion

- OG card font weight, exact tracking, accent block size — planner picks within JetBrains Mono families.
- HTML comment placement order within `<head>` — typically just after `<meta charSet>` for max view-source visibility.
- ConsoleSignature ASCII art exact bytes — initials "BT" vs full "BAKYTBEK" — planner authors and user reviews on first run.
- `<JsonLdPerson />` file location — `lib/json-ld.ts` (helper) + `app/components/shell/json-ld-person.tsx` (RSC) is the cleanest split.
- `@axe-core/playwright` test file location — `tests/contrast.spec.ts` or `e2e/axe.spec.ts` — planner picks; Phase 5 introduces the first Playwright tests in this project.
- Contrast audit CI-vs-local choice (D-21).

### Deferred Ideas (OUT OF SCOPE)

- Per-hue OG image variants (4 × 7 = 28 PNGs) — v2 (SEO-V2-02).
- `twitter:creator` / `twitter:site` handle — Phase 6.
- JSON-LD `description`, `image`, `address` fields — Phase 6.
- `x-portfolio-source` HTTP header value — Phase 7.
- PWA installable manifest (`display: 'standalone'` + service worker) — out of scope.
- Real bio content for `description` — Phase 6.
- `?` cheatsheet, `g`+letter vim nav — v1.x.
- `hire-me.txt` 8th view — v3.
- Vercel Analytics + custom events — Phase 7.
- CSP nonce work for inline scripts — Phase 1 D-15 deferred.
- 3rd-social pick (Mastodon vs Bluesky vs X) — Phase 6.
- Real resume PDF — Phase 6.
- Backend cutover — Phase 6.
- Production deploy / Lighthouse / Search Console / 5-second recruiter test on production — Phase 7.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **SEO-01** | Twitter card metadata `summary_large_image` on root metadata; per-route OG inherits. | §Standard Stack (`metadata.twitter`); §Code Examples §"Twitter card on root metadata"; §Architecture Patterns Pattern 4. |
| **SEO-02** | JSON-LD `Person` schema in root `<head>` with `@type`, `jobTitle`, `url`, `sameAs`. | §Standard Stack (`<JsonLdPerson />` RSC); §Code Examples §"JSON-LD Person schema"; §Common Pitfalls Pitfall 6 (XSS escape `<` → `<`); §Architecture Patterns Pattern 5. |
| **SEO-03** | Dynamic OG image per route via `opengraph-image.tsx` + `next/og` `ImageResponse`; JetBrains Mono in `fonts`. | §Standard Stack (`next/og`); §Code Examples §"Per-route OG card"; §Common Pitfalls Pitfalls 1, 2, 4 (Satori CSS limits, CSS variables don't resolve in `next/og` runtime, font load via `readFile`); §Don't Hand-Roll (don't roll your own SVG/canvas — use `ImageResponse`). |
| **SEO-04** | Favicon set: `app/icon.tsx` (`>_` glyph), `app/apple-icon.tsx`, `app/manifest.ts`, per-scheme `theme-color`. | §Standard Stack (file conventions); §Common Pitfalls Pitfall 3 (`themeColor` belongs in `viewport` export, NOT `metadata` — overrides CONTEXT.md D-15's deprecated location); §Code Examples §"Icon glyph", §"Manifest", §"Viewport themeColor". |
| **A11Y-03** | `prefers-reduced-motion: reduce` disables `slideIn`, dampens cursor blink, stops boot fade. | §Standard Stack (pure CSS append); §Code Examples §"Reduced-motion global reset"; §Common Pitfalls Pitfall 7 (`0.01ms` not `0ms` — some browsers treat 0 as null); §Architecture Patterns Pattern 6. |
| **A11Y-07** | `@axe-core/playwright` audit at 4 hues × 2 themes; per-hue chroma overrides where failing. | §Standard Stack (`@axe-core/playwright@^4.11.3`, `playwright@^1.59.1`); §Code Examples §"Contrast spec scaffolding"; §Common Pitfalls Pitfall 5 (amber light-theme failure prediction); §Architecture Patterns Pattern 7 (matrix iteration via cookie/URL param). |
| **DEV-01** | Console signature ASCII + email + GitHub URL on first paint. | §Standard Stack (`<ConsoleSignature />` client island); §Code Examples §"Console signature"; §Common Pitfalls Pitfall 8 (don't put it in root layout — RSC; client island only); §Architecture Patterns Pattern 8. |
| **DEV-02** | 6-line HTML comment in `<head>` for view-source. | §Standard Stack (`<HeadComment />` RSC via `dangerouslySetInnerHTML`); §Code Examples §"HTML head comment"; §Common Pitfalls Pitfall 9 (lowercase content avoids `/TODO/` placeholder grep). |
| **DEV-03** | `x-built-with` and `x-portfolio-source` headers verified via `curl -I`. | §State of the Art (already shipped Phase 1); §Code Examples §"Header verification"; verification-only — no code change Phase 5. |
</phase_requirements>

## Summary

Phase 5 is the cross-cutting polish phase: every deliverable is a small file (typically 20–80 LOC each), but the surface is wide (10–13 new files, 3 modified). The primary research findings:

1. **`next/og` `ImageResponse` is the right tool, but Satori (its layout engine) has hard CSS constraints the planner must encode in tasks** — `display` is `flex|block|none` only (no grid), CSS variables don't resolve at the `next/og` runtime layer (even though Satori upstream supports them, the Next.js wrapper doesn't reliably propagate them), and `oklch()` is unreliable in Satori today. Inline hex values and explicit `display: 'flex'` on every container. JetBrains Mono is loaded via `node:fs.readFile` against the woff2/ttf binary (NOT the `--font-mono` CSS variable; NOT the `next/font/google` import — those are runtime-bound). The font binary lives in `node_modules/.pnpm/...` after `next/font/google` install, which is fragile — the Vercel-blessed pattern is to fetch from a stable URL or commit a copy under `assets/`.

2. **`metadata.themeColor` is deprecated in Next.js 14+** in favor of a separate `viewport` export. CONTEXT.md D-15 specifies the deprecated location. The planner must use `export const viewport: Viewport = { themeColor: [...] }` — not `metadata.themeColor`. This is the single most important correction this research surfaces.

3. **JSON-LD has a documented XSS gotcha**: `JSON.stringify(jsonLd).replace(/</g, '\\u003c')` is the official Next.js pattern. Without the `<` → `<` replacement, an attacker-controlled string in `PROFILE` could close the `<script>` tag early and inject arbitrary HTML. PROFILE is dev-controlled today, but the lib/json-ld.ts helper should encode this defense by default — Phase 6 adds `description` and `image` fields and the discipline must be in place before then.

4. **`@axe-core/playwright@4.11.3` + `playwright@1.59.1`** are the current stable versions. Both are devDependencies only — zero impact on production bundle. The matrix execution problem (set `data-theme="light|dark"` AND `--accent-hue=145|75|200|340` programmatically) is solvable via Playwright's `page.addInitScript()` to seed `localStorage["theme"]` and `localStorage["portfolio-accent"]` before the page loads — the existing AccentBootstrapScript reads these synchronously on every navigation. URL-param-based switching is NOT viable because the codebase doesn't read URL params for theme/accent.

5. **The reduced-motion belt-and-suspenders pattern is canonical** but `0.01ms` (not `0ms`) is required because some browsers treat `0` as falsy/null and skip the override. The existing `@media print` block in `app/globals.css` already uses `*, *::before, *::after { animation: none !important; transition: none !important; }` — the reduced-motion variant uses durations to allow finishing-state styles to apply.

6. **The DEV-01 `<ConsoleSignature />` MUST be a client island** — the entire premise (`useEffect` after hydration) requires `'use client'`. CONTEXT.md D-25 already specifies this correctly.

7. **DEV-02 HTML comment placement** is best handled by emitting a small RSC inside `<head>` that uses `dangerouslySetInnerHTML` to place a literal HTML comment. JSX cannot natively render HTML comments. Phase 2's `<AccentBootstrapScript />` is the established precedent in this codebase.

8. **Contrast prediction**: The amber-on-light combination is `oklch(0.5 0.16 60)` against `oklch(0.42 0.16 var(--accent-hue))` (where `--accent-hue=75`). The independent contrast checker confirms low-chroma amber against cream backgrounds frequently fails 4.5:1. The planner should NOT pre-tune; run axe first, remediate only what fails.

**Primary recommendation:** Sequence the phase as 4 waves (matching CONTEXT.md D-35): (1) all the file-convention SEO files in parallel (root + 7 OG routes, icon, apple-icon, manifest, viewport themeColor, AboutSocials, globals.css reduced-motion append); (2) JSON-LD helper + RSC + HTML comment in root layout; (3) ConsoleSignature client island in terminal layout; (4) `@axe-core/playwright` install + matrix runner + remediation iteration. Wave 5 is manual verification (curl headers, view-source, Reduce Motion OS toggle).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| OG image rendering (8 files) | Frontend Server (RSC, `app/opengraph-image.tsx` + 7 nested) | Build (cached at build time per file convention) | `next/og` `ImageResponse` runs in the Edge or Node runtime at request time by default; Next 15.5 caches the output. RSC by default — no client code involved. |
| Favicon / apple-icon / manifest | Frontend Server (RSC file conventions) | Build (statically optimized) | `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts` are all RSC file conventions; Next.js statically optimizes them. |
| `theme-color` per scheme | Frontend Server (`viewport` export in `app/layout.tsx`) | — | The `viewport` export is the authoritative place in Next 14+/15.5; emits `<meta name="theme-color">` tags into `<head>`. |
| JSON-LD `<script>` injection | Frontend Server (`<JsonLdPerson />` RSC in root `<head>`) | — | RSC emits a `<script type="application/ld+json">` tag with sanitized payload. No client code. |
| HTML comment in `<head>` | Frontend Server (`<HeadComment />` RSC in `app/layout.tsx`) | — | `dangerouslySetInnerHTML` on a tiny RSC component; same model as Phase 2 AccentBootstrapScript. |
| Console signature | Browser / Client (`<ConsoleSignature />` client island in `app/(terminal)/layout.tsx`) | — | `useEffect`-based `console.log` requires hydration; cannot run in RSC. Mount sibling to existing `<CommandPalette />`. |
| Custom HTTP headers | Frontend Server (`next.config.ts` `headers()`) | — | Already shipped in Phase 1; Phase 5 is verification-only. |
| Reduced-motion global reset | Browser / Client (CSS in `app/globals.css`) | — | Pure CSS append to existing `@media (prefers-reduced-motion: reduce)` block. Browser executes. |
| Contrast audit (devDep only) | Build / CI tooling (Playwright spec) | — | `@axe-core/playwright` runs in `next dev` against the local dev server; Playwright drives a headless Chromium; axe-core injects into the page and reports violations. Zero production impact. |
| Inline `<AboutSocials />` (Phase 4 carry-forward) | Frontend Server (RSC view component) | — | Same tier as `<AboutView />`; pure RSC; no client behavior needed. Reuses `<ExternalLink>` RSC primitive. |

## Standard Stack

### Core (no new prod deps — all built into Next.js 15.5)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/og` | 15.5.x (built-in) | `ImageResponse` for `opengraph-image.tsx` + `icon.tsx` + `apple-icon.tsx` | Official Next.js metadata file convention; emits PNG via Satori (HTML/CSS → SVG → PNG). [VERIFIED: /vercel/next.js Context7 — `app-icons.mdx` and `opengraph-image.mdx`] |
| `next` `Metadata` API | 15.5.x (built-in) | Root `metadata.twitter`, `metadata.alternates`, `metadataBase` (already wired Phase 1) | App Router's idiomatic metadata composition; per-route OG image inherits via the `opengraph-image.tsx` file convention. [VERIFIED: codebase `app/layout.tsx:21-31`] |
| `next` `Viewport` API | 15.5.x (built-in) | `viewport.themeColor` per-scheme array (CORRECTS CONTEXT.md D-15 deprecated location) | Next.js 14+ moved `themeColor` from `metadata` to `viewport` to align with the Web App Manifest spec. [VERIFIED: /vercel/next.js Context7 — `generate-viewport.mdx`] |
| `next` `MetadataRoute.Manifest` | 15.5.x (built-in) | `app/manifest.ts` typed manifest output | Official type for `manifest.ts` file convention. [VERIFIED: /vercel/next.js Context7 — `manifest.mdx`] |
| Pure CSS in `app/globals.css` | n/a | `@media (prefers-reduced-motion: reduce)` global reset; per-hue chroma overrides if axe fails | Extends existing block at line 152; no new files. [VERIFIED: codebase `app/globals.css:152-162`] |

### Supporting (devDependencies only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@axe-core/playwright` | `^4.11.3` | AxeBuilder accessibility runner integration with Playwright | A11Y-07 contrast matrix. [VERIFIED: `npm view @axe-core/playwright version` 2026-05-10 → 4.11.3] |
| `playwright` | `^1.59.1` | Headless browser driver | A11Y-07 spec runtime. [VERIFIED: `npm view playwright version` 2026-05-10 → 1.59.1] |
| `axe-core` | `^4.10.x` (peer-bundled inside `@axe-core/playwright`) | Underlying accessibility engine | Bundled — do not install separately. [VERIFIED: official `@axe-core/playwright` package bundles axe-core] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/og` `ImageResponse` for OG images | Hand-rolled SVG → PNG via `sharp` or `puppeteer` | Massive complexity, headless Chromium dependency, doesn't auto-cache, no metadata file convention integration. Don't. |
| `viewport.themeColor` array | Manual `<meta name="theme-color">` in `<head>` | Manual is fine but loses the per-scheme media-query support that `viewport.themeColor` array gives for free. The Next 15.5 way emits both `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="...">` and the light variant automatically. |
| `app/manifest.ts` | Static `public/manifest.json` | Static is also valid but `manifest.ts` integrates with TypeScript (`MetadataRoute.Manifest`) and Next.js can compose it with the icons from `app/icon.tsx`. |
| `@axe-core/playwright` | Lighthouse CI / Pa11y / `jest-axe` | Lighthouse CI is heavier, runs more checks (slower), and is Phase 7 territory anyway (DEPLOY-02). `jest-axe` is jsdom-only — cannot test real browser rendering of oklch tokens. Pa11y is older and less maintained. |
| `dangerouslySetInnerHTML` for JSON-LD | `next/script` with `type="application/ld+json"` | `next/script` is for executable JS optimization (loading priorities, deferral). JSON-LD is structured data, not code — native `<script>` is the right tool per Next.js official guidance. [CITED: nextjs.org/docs/app/guides/json-ld] |
| `serialize-javascript` for JSON-LD | `JSON.stringify(...).replace(/</g, '\\u003c')` | The 2-line replace is what Next.js docs recommend. `serialize-javascript` is a 280KB transitive dep — overkill for one schema. |

**Installation (devDeps only):**
```bash
npm install --save-dev @axe-core/playwright@^4.11.3 playwright@^1.59.1
npx playwright install chromium  # one-time browser binary fetch
```

**Version verification (2026-05-10):**
- `@axe-core/playwright`: 4.11.3 [VERIFIED: `npm view @axe-core/playwright version`]
- `playwright`: 1.59.1 [VERIFIED: `npm view playwright version`]
- `next`: 15.5.15 currently locked in `package.json` [VERIFIED: codebase `package.json:21`]

## Architecture Patterns

### System Architecture Diagram

```
                                Phase 5 file/data flow
                                ─────────────────────

[Build / Request time]
     │
     ├─► app/opengraph-image.tsx (root)
     │       └─► next/og ImageResponse
     │              └─► reads: ROUTES[0].label, JetBrains Mono font binary
     │              └─► emits: PNG (1200×630, dark bg, accent block, name + role + path)
     │
     ├─► app/(terminal)/<view>/opengraph-image.tsx × 7
     │       └─► same template, route.label substituted
     │
     ├─► app/icon.tsx (32×32 ">_" glyph)
     ├─► app/apple-icon.tsx (180×180 same glyph)
     ├─► app/manifest.ts (name + icons + theme_color + background_color)
     │       └─► reads: PROFILE.name, --bg dark hex
     │
     └─► next.config.ts headers() (verification only — already shipped Phase 1)

[RSC render — root layout]
     │
     ├─► app/layout.tsx
     │       ├─► metadata: { twitter: { card: "summary_large_image", ... } }
     │       ├─► viewport: { themeColor: [{media:"(prefers-color-scheme:dark)",color:"#0a0c0b"}, ...] }
     │       ├─► <head>
     │       │     ├─► <AccentBootstrapScript /> (Phase 2 — unchanged)
     │       │     ├─► <HeadComment />          (Phase 5 NEW — view-source greeting)
     │       │     └─► <JsonLdPerson />          (Phase 5 NEW — Person schema)
     │       │            └─► reads: PROFILE.name, role, email, socials
     │       │            └─► uses: lib/json-ld.ts (filterValidUrls + buildPersonSchema)
     │       └─► <body><ThemeProvider>...children...</ThemeProvider></body>
     │
[RSC render — terminal route group layout]
     │
     ├─► app/(terminal)/layout.tsx
     │       ├─► <TopBar /> ... <Sidebar /> ... <main /> ... <ExplorerDrawer /> ...
     │       ├─► <CommandPalette />
     │       ├─► <ConsoleSignature />            (Phase 5 NEW — client island, useEffect → console.log)
     │       └─► <PrintFooter />
     │
[RSC render — about route]
     │
     ├─► app/(terminal)/page.tsx
     │       └─► <AboutView profile={profile} uptime={uptime} />
     │              ├─► <h1>{profile.name}</h1>
     │              ├─► <div className="about-role">// {profile.role}</div>
     │              ├─► <p className="about-para">...</p>
     │              ├─► <AboutSocials profile={profile} />  (Phase 5 NEW — Phase 4 carry-forward)
     │              │       └─► EMAIL row, GITHUB row, LINKEDIN row (TODO-guarded)
     │              ├─► <div className="about-cards">...</div>  (highlights)
     │              ├─► <div className="about-cta-row">...</div>  (resume + ghost socials)
     │              └─► <div className="about-status-mobile"><StatusBlock /></div>

[Browser]
     │
     ├─► CSS executes globals.css — including Phase 5 reduced-motion global reset
     ├─► <ConsoleSignature /> hydrates → useEffect fires → console.log(banner)
     └─► <head> contains: HTML comment, JSON-LD <script>, OG meta tags, theme-color metas, icon links

[Test infra]
     │
     └─► tests/contrast.spec.ts (Phase 5 NEW)
            └─► Playwright opens http://localhost:3000/<route>
                  └─► page.addInitScript: localStorage.setItem("theme", THEME); localStorage.setItem("portfolio-accent", HUE)
                  └─► AxeBuilder({page}).withTags(['wcag2aa']).analyze()
                  └─► assert violations.filter(v => v.id === 'color-contrast') has length 0
                  └─► matrix: 4 hues × 2 themes × 7 routes = 56 cells
```

### Component Responsibilities

| File | Tier | Type | Purpose |
|------|------|------|---------|
| `app/opengraph-image.tsx` | RSC | NEW | Root OG image (homepage); 1200×630 PNG via `ImageResponse`. |
| `app/(terminal)/<view>/opengraph-image.tsx` | RSC | NEW × 7 | Per-route OG variants. Each substitutes `route.label` from `ROUTES[i]`. |
| `app/icon.tsx` | RSC | NEW | 32×32 `>_` glyph favicon. |
| `app/apple-icon.tsx` | RSC | NEW | 180×180 rasterization of the same glyph. |
| `app/manifest.ts` | RSC | NEW | Web App Manifest (minimal: name, short_name, icons, colors, display: browser). |
| `app/layout.tsx` | RSC | UPDATED | Add `metadata.twitter`, separate `viewport` export with `themeColor`, mount `<JsonLdPerson />` and `<HeadComment />` in `<head>`. |
| `app/(terminal)/layout.tsx` | RSC | UPDATED | Mount `<ConsoleSignature />` as sibling to `<CommandPalette />` and `<ExplorerDrawer />`. |
| `app/components/shell/json-ld-person.tsx` | RSC | NEW | Emits `<script type="application/ld+json">` with sanitized payload from `lib/json-ld.ts`. |
| `app/components/shell/head-comment.tsx` | RSC | NEW | Emits a 6-line HTML comment via `dangerouslySetInnerHTML`. (May be inlined in `app/layout.tsx`; planner picks.) |
| `app/components/shell/console-signature.tsx` | Client | NEW | `'use client'`; `useEffect(() => console.log(...), [])`; returns `null`. |
| `app/components/views/about-view.tsx` | RSC | UPDATED | Add `<AboutSocials />` block after lead paragraph. |
| `app/components/views/about-socials.tsx` | RSC | NEW | 3-row mini contact-card (EMAIL / GITHUB / LINKEDIN) with TODO guard. |
| `lib/json-ld.ts` | lib | NEW | `buildPersonSchema(profile, siteUrl): PersonSchema`; `filterValidUrls(socials): string[]`. |
| `app/globals.css` | CSS | UPDATED | Append global `prefers-reduced-motion: reduce` reset; possibly add per-hue chroma overrides post-axe-audit. |
| `tests/contrast.spec.ts` | test | NEW | Playwright spec iterating 4 hues × 2 themes × 7 routes via AxeBuilder. |
| `playwright.config.ts` | config | NEW | Playwright runtime config (baseURL, projects, webServer for `next dev`). |
| `package.json` | config | UPDATED | Add `@axe-core/playwright` + `playwright` to `devDependencies`; add `test:contrast` script. |
| `next.config.ts` | config | unchanged | Phase 5 only verifies `x-built-with` header; no edits. |

### Recommended Project Structure

```
app/
├── opengraph-image.tsx           # NEW (root OG, default homepage)
├── icon.tsx                      # NEW (favicon)
├── apple-icon.tsx                # NEW (180×180)
├── manifest.ts                   # NEW
├── layout.tsx                    # UPDATED (twitter, viewport.themeColor, JsonLdPerson, HeadComment)
├── globals.css                   # UPDATED (reduced-motion reset; possibly per-hue overrides)
├── (terminal)/
│   ├── layout.tsx                # UPDATED (mount ConsoleSignature)
│   ├── opengraph-image.tsx       # NEW (about route OG)
│   ├── projects/opengraph-image.tsx  # NEW
│   ├── stack/opengraph-image.tsx     # NEW
│   ├── experience/opengraph-image.tsx  # NEW
│   ├── writing/opengraph-image.tsx     # NEW
│   ├── contact/opengraph-image.tsx     # NEW
│   └── shipped/opengraph-image.tsx     # NEW
└── components/
    ├── shell/
    │   ├── json-ld-person.tsx    # NEW (RSC)
    │   ├── head-comment.tsx      # NEW (RSC) — or inlined in layout
    │   └── console-signature.tsx # NEW (client island)
    └── views/
        ├── about-view.tsx        # UPDATED (insert <AboutSocials />)
        └── about-socials.tsx     # NEW (RSC mini contact-card)

lib/
└── json-ld.ts                    # NEW (helper)

assets/                           # NEW directory (recommended for OG font binary)
└── JetBrainsMono-Bold.ttf        # NEW (committed font binary for ImageResponse fonts[] — OR use fetch from googlefonts CSS API at build time; planner picks)

tests/                            # NEW directory
└── contrast.spec.ts              # NEW

playwright.config.ts              # NEW
```

### Pattern 1: `next/og` `ImageResponse` for Per-Route OG Images

**What:** Each `opengraph-image.tsx` exports `alt`, `size`, `contentType`, and a default async function that returns `new ImageResponse(<JSX>, { ...size, fonts: [...] })`. Next.js generates the PNG at build or request time and emits the appropriate `<meta property="og:image" ...>` tags into the route's `<head>` automatically. Per-route variants are handled by the file convention — each route directory gets its own `opengraph-image.tsx`.

**When to use:** Every route that should produce a unique social-share unfurl. CONTEXT.md D-04 specifies one per route, with `route.label` substituted.

**Example:**
```tsx
// app/(terminal)/projects/opengraph-image.tsx
// Source: /vercel/next.js Context7 — opengraph-image.mdx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ROUTES } from "@/lib/routes";

export const alt = "Bakytbek Tatibekov — Sr. Software Engineer (projects/)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const route = ROUTES[1]; // projects

// Inline hex — Satori does NOT consume CSS variables in next/og runtime
const BG_DARK = "#0a0c0b";       // matches --bg dark token
const PANEL = "#0d100f";          // matches --panel
const TEXT_HI = "#ebe9e2";        // matches --text-hi
const MUTED = "#8a938f";          // matches --muted-hi
const ACCENT_MATRIX = "#22c55e";  // sRGB fallback for matrix accent (oklch(0.78 0.18 145) → ~#22c55e)

export default async function Image() {
  const fontBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Bold.ttf")
  );
  const fontMediumBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Medium.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG_DARK,
          display: "flex",            // REQUIRED — Satori only supports flex/block/none
          flexDirection: "column",
          padding: "80px",
          fontFamily: "JetBrains Mono",
        }}
      >
        {/* Top half — name + role */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 60, fontWeight: 700, color: TEXT_HI }}>
            Bakytbek Tatibekov
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: MUTED, marginTop: 12 }}>
            // Sr. Software Engineer
          </div>
        </div>

        {/* Bottom — accent block + path */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 8, height: 24, background: ACCENT_MATRIX }} />
          <div style={{ fontSize: 32, fontWeight: 500, color: ACCENT_MATRIX }}>
            ~/portfolio/{route.label}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "JetBrains Mono", data: fontBuffer, weight: 700, style: "normal" },
        { name: "JetBrains Mono", data: fontMediumBuffer, weight: 500, style: "normal" },
      ],
    }
  );
}
```

### Pattern 2: `app/icon.tsx` — Generated Favicon Glyph

**What:** Next.js file convention; same `ImageResponse` machinery as OG, but smaller dimensions. Returns a 32×32 PNG by default.

**Example:**
```tsx
// app/icon.tsx
// Source: /vercel/next.js Context7 — app-icons.mdx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PANEL = "#0d100f";
const ACCENT_MATRIX = "#22c55e";

export default async function Icon() {
  const fontBuffer = await readFile(
    join(process.cwd(), "assets/JetBrainsMono-Bold.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PANEL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT_MATRIX,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "JetBrains Mono",
          letterSpacing: "-0.05em",  // tighten ">_" so it reads as one glyph
        }}
      >
        {">_"}
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "JetBrains Mono", data: fontBuffer, weight: 700, style: "normal" }],
    }
  );
}
```

`apple-icon.tsx` is identical except `size = { width: 180, height: 180 }` and `fontSize` scaled to ~96px.

### Pattern 3: `app/manifest.ts` — Minimal Web App Manifest

**Example:**
```ts
// app/manifest.ts
// Source: /vercel/next.js Context7 — manifest.mdx
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bakytbek Tatibekov — Sr. Software Engineer",
    short_name: "bakytbek.dev",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
    start_url: "/",
    display: "browser",       // CONTEXT.md D-14 — NOT standalone (no PWA install push)
    background_color: "#0a0c0b",  // dark --bg
    theme_color: "#0a0c0b",       // dark --bg
    icons: [
      // app/icon.tsx and app/apple-icon.tsx are auto-included by Next.js when their files exist
      // Manifest icons[] is for additional sizes if needed; can be empty in v1
    ],
  };
}
```

### Pattern 4: Twitter Card on Root Metadata + Per-Scheme `theme-color` via `viewport`

**What:** Twitter card metadata adds to the existing `metadata` object in `app/layout.tsx`. **`themeColor` MUST live in a separate `viewport` export** (Next.js 14+/15.5 — the `metadata.themeColor` location CONTEXT.md D-15 specifies is deprecated).

**Example:**
```tsx
// app/layout.tsx — partial diff
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bakytbek Tatibekov — Sr. Software Engineer",
  description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
  openGraph: {
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
    type: "website",
  },
  // PHASE 5 ADDITIONS
  twitter: {
    card: "summary_large_image",
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
  },
};

// PHASE 5 NEW — separate viewport export (CORRECT location in Next 14+/15.5)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ea" },
  ],
};
```

### Pattern 5: JSON-LD `Person` via RSC + `dangerouslySetInnerHTML`

**What:** Server Component emits a `<script type="application/ld+json">` tag in `<head>` with the schema payload. CRITICAL: escape `<` to `<` to prevent script-tag-breakout XSS.

**Example:**
```ts
// lib/json-ld.ts
// Source: nextjs.org/docs/app/guides/json-ld + schema.org/Person
import type { Profile } from "@/lib/types";

export interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  jobTitle: string;
  url: string;
  email: string;
  sameAs: string[];
}

export function filterValidUrls(profile: Profile): string[] {
  return profile.socials
    .map((s) => s.url)
    .filter((url) => /^https?:\/\//.test(url));
}

export function buildPersonSchema(profile: Profile, siteUrl: string): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteUrl,
    email: profile.email,
    sameAs: filterValidUrls(profile),
  };
}
```

```tsx
// app/components/shell/json-ld-person.tsx
// NO "use client" — RSC inline script emitter (parallels Phase 2 AccentBootstrapScript)
import { PROFILE } from "@/lib/portfolio-data";
import { buildPersonSchema } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function JsonLdPerson() {
  const schema = buildPersonSchema(PROFILE, siteUrl);
  // CRITICAL: replace `<` with `<` to prevent script-tag breakout XSS
  // (per Next.js official JSON-LD guidance)
  const json = JSON.stringify(schema).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

Mount in `app/layout.tsx` `<head>`:
```tsx
<head>
  <AccentBootstrapScript />
  <HeadComment />
  <JsonLdPerson />
</head>
```

### Pattern 6: Reduced-Motion Global Reset (Append to Existing Block)

**What:** Append the universal-selector reset to the existing `@media (prefers-reduced-motion: reduce)` block at `app/globals.css:152`. Use `0.01ms` not `0ms` — some browsers treat `0` as falsy and skip the override; `0.01ms` is effectively instantaneous but bypasses the falsy-coercion bug.

**Example:**
```css
/* app/globals.css — diff */
@media (prefers-reduced-motion: reduce) {
  /* PHASE 5 D-16 — global belt-and-suspenders reset */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Existing targeted rules — kept for documenting intent (Phase 2 + Phase 4) */
  .cursor { animation: none; }
  .content-block { animation: none; }
  .breadcrumb-hint { transition: none; opacity: 1; }
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] { animation: none; }
  .drawer-backdrop { transition: none; }
  [cmdk-dialog] { animation: none; }
}
```

### Pattern 7: `@axe-core/playwright` Matrix Audit (4 hues × 2 themes × 7 routes)

**What:** Playwright spec iterates the matrix; for each cell, seed `localStorage` via `page.addInitScript()` (so the existing `AccentBootstrapScript` reads the right value before paint), navigate to the route, run AxeBuilder filtered to color-contrast tags, and assert violations array is empty.

**Example:**
```ts
// tests/contrast.spec.ts
// Source: github.com/dequelabs/axe-core-npm + playwright.dev/docs/accessibility-testing
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "@/lib/routes";

const HUES = [145, 75, 200, 340] as const;  // matrix, amber, cyan, magenta
const THEMES = ["dark", "light"] as const;

for (const theme of THEMES) {
  for (const hue of HUES) {
    for (const route of ROUTES) {
      test(`contrast: theme=${theme} accent=${hue} route=${route.pathname}`, async ({ page }) => {
        // Seed localStorage BEFORE first paint so AccentBootstrapScript + next-themes
        // pick up the values synchronously
        await page.addInitScript(
          ([t, h]) => {
            try {
              window.localStorage.setItem("theme", t);
              window.localStorage.setItem("portfolio-accent", String(h));
            } catch {
              /* ignore */
            }
          },
          [theme, hue]
        );

        await page.goto(route.pathname);

        // Verify the seed actually applied (sanity check — guards against silent
        // localStorage failures or AccentBootstrapScript regressions)
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2aa", "wcag21aa"])
          .analyze();

        const contrastViolations = results.violations.filter(
          (v) => v.id === "color-contrast"
        );

        // Print violations for debugging (axe gives readable nodes/impact)
        if (contrastViolations.length > 0) {
          console.error(
            `Contrast failures @ ${theme}/${hue}/${route.pathname}:`,
            contrastViolations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
            }))
          );
        }

        expect(contrastViolations).toEqual([]);
      });
    }
  }
}
```

```ts
// playwright.config.ts
// Source: playwright.dev/docs/test-configuration
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,         // 56 cells × ~500ms axe each ≈ 30s sequential; parallel adds dev-server thrash
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

```json
// package.json — diff
{
  "scripts": {
    "test:contrast": "playwright test"
  }
}
```

### Pattern 8: Console Signature — Tiny Client Island

**Example:**
```tsx
// app/components/shell/console-signature.tsx
"use client";
import { useEffect } from "react";
import { PROFILE } from "@/lib/portfolio-data";

const ASCII_ART = `
██████╗ ████████╗
██╔══██╗╚══██╔══╝
██████╔╝   ██║
██╔══██╗   ██║
██████╔╝   ██║
╚═════╝    ╚═╝
`;

const ART_STYLE = "color: #22c55e; font-family: monospace;";
const TEXT_STYLE = "color: inherit; font-family: monospace;";

export function ConsoleSignature() {
  useEffect(() => {
    // Single console.log with %c styling — works in Chrome, Firefox, Safari
    console.log(
      `%c${ASCII_ART}%c\nLike the site? Source at github.com/beckinfonet\nAvailable for hire — ${PROFILE.email}`,
      ART_STYLE,
      TEXT_STYLE
    );
  }, []);
  return null;
}
```

Mount in `app/(terminal)/layout.tsx`:
```tsx
import { ConsoleSignature } from "@/app/components/shell/console-signature";
// ...
<ConsoleSignature />
<CommandPalette />
<PrintFooter ... />
```

### Pattern 9: HTML Comment in `<head>` via RSC `dangerouslySetInnerHTML`

**What:** JSX cannot natively render HTML comments. The Phase 2 precedent (`<AccentBootstrapScript />`) uses `dangerouslySetInnerHTML` on a `<script>` element. For an HTML comment, the same technique applies but on a Fragment-like wrapper.

**Implementation note:** React strips literal `<!--` from JSX. Two viable approaches:

**Option A (recommended):** Inline the comment string directly in `app/layout.tsx`'s `<head>` via `dangerouslySetInnerHTML` on a wrapper. Cleanest, no extra component:

```tsx
// app/layout.tsx — partial
const HEAD_COMMENT_HTML = `<!--
  hello, you found the source.
  i build with: typescript, react, nextjs, swift, aws.
  open to: senior engineering roles, ai/agentic systems, mobile.
  reach: beckprograms@gmail.com
  github: beckinfonet
  thanks for looking. — bakytbek
-->`;

// Inside RootLayout:
<head>
  {/* HTML comment in <head> — easter egg for view-source viewers (DEV-02) */}
  <script
    // Empty script-as-host for the comment; the script tag itself is benign
    // OR use a different approach: emit via a tiny helper that returns React.createElement
    // ...
  />
</head>
```

**Option B (recommended pattern actually):** Use a small RSC that returns nothing-but-comment via `dangerouslySetInnerHTML`. The trick is to wrap in a Fragment/element React renders, then inject the literal comment:

```tsx
// app/components/shell/head-comment.tsx
// NO "use client" — RSC; emits a literal HTML comment into <head>
const HEAD_COMMENT = `<!--
  hello, you found the source.
  i build with: typescript, react, nextjs, swift, aws.
  open to: senior engineering roles, ai/agentic systems, mobile.
  reach: beckprograms@gmail.com
  github: beckinfonet
  thanks for looking. — bakytbek
-->`;

// React doesn't natively render HTML comments. The workaround: emit via a host
// element that React lets us inject raw HTML into. <noscript>'s contents are
// inert and pass through to view-source unchanged.
export function HeadComment() {
  return <noscript dangerouslySetInnerHTML={{ __html: HEAD_COMMENT }} />;
}
```

**[ASSUMED]** that `<noscript>` rendering preserves the HTML comment in raw `view-source:` output across modern browsers. This is the standard pattern but the planner should verify with `curl http://localhost:3000 | grep "hello, you found"` during execution. Alternative: render it via a script that does nothing but holds the comment — `<script type="text/html-comment" dangerouslySetInnerHTML={{ __html: HEAD_COMMENT }} />` (the unknown MIME type makes the script inert but the contents appear in source).

The final implementation choice is planner discretion at execution time — both approaches put the comment in raw HTML. Verify by `view-source:` lookup post-implementation.

### Pattern 10: Inline `<AboutSocials />` Mini Contact-Card (Phase 4 Carry-Forward)

**What:** Pure RSC component reusing `<ExternalLink>` primitive and the existing `.contact-card` / `.contact-row` CSS classes from `contact-view.tsx`. Three rows: EMAIL (mailto), GITHUB (ExternalLink), LINKEDIN (ExternalLink or muted plain text if URL is `TODO:` sentinel).

**Example:**
```tsx
// app/components/views/about-socials.tsx
// NO "use client" — RSC pure presentation
import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";

interface AboutSocialsProps {
  profile: Profile;
}

function isRealUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export function AboutSocials({ profile }: AboutSocialsProps) {
  const github = profile.socials.find((s) => s.kind === "github");
  const linkedin = profile.socials.find((s) => s.kind === "linkedin");

  return (
    <div className="about-socials-card" role="group" aria-label="Quick contact">
      <div className="contact-row">
        <span className="contact-label">EMAIL</span>
        <a
          href={`mailto:${profile.email}`}
          aria-label={`Send email to ${profile.email}`}
        >
          {profile.email}
        </a>
        <span />
      </div>

      {github && (
        <div className="contact-row">
          <span className="contact-label">GITHUB</span>
          {isRealUrl(github.url) ? (
            <ExternalLink href={github.url} aria-label="Open GitHub (opens in new tab)">
              {github.handle}
            </ExternalLink>
          ) : (
            <span className="contact-muted">{github.handle}</span>
          )}
          <span />
        </div>
      )}

      {linkedin && (
        <div className="contact-row">
          <span className="contact-label">LINKEDIN</span>
          {isRealUrl(linkedin.url) ? (
            <ExternalLink href={linkedin.url} aria-label="Open LinkedIn (opens in new tab)">
              {linkedin.handle}
            </ExternalLink>
          ) : (
            <span className="contact-muted">{linkedin.handle}</span>
          )}
          <span />
        </div>
      )}
    </div>
  );
}
```

**CSS additions to `app/globals.css`:**
```css
/* Phase 5 — inline socials block on /about (Phase 4 carry-forward) */
.about-socials-card {
  max-width: 480px;
  margin: 16px 0 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0;
}
.contact-muted {
  font-size: 13px;
  color: var(--muted);
}
```

Insert in `about-view.tsx` between the bio paragraphs and `.about-cards`:
```tsx
{profile.bio.long.map((para, i) => (
  <p key={i} className="about-para">{para}</p>
))}

<AboutSocials profile={profile} />   {/* PHASE 5 NEW */}

<div className="about-cards">...</div>
```

### Anti-Patterns to Avoid

- **`metadata.themeColor`** — deprecated in Next.js 14+. Use `viewport.themeColor`. CONTEXT.md D-15's reference is wrong; planner must NOT follow it literally.
- **CSS variables (`var(--bg)`) inside `ImageResponse` JSX `style={{}}`** — Satori's variable resolution in `next/og` is unreliable; inline hex literals are the safe path.
- **`display: 'grid'` inside `ImageResponse` JSX** — Satori does not support grid; use flex.
- **Forgetting `display: 'flex'` on container divs in `ImageResponse`** — Satori requires explicit `display` on every container; defaults differ from browser.
- **Loading JetBrains Mono for `ImageResponse` via `next/font/google` import** — that emits a CSS variable for browser rendering; `ImageResponse.fonts[]` needs a raw font binary (`ArrayBuffer`). Use `node:fs/promises.readFile` against an asset committed to `assets/`.
- **JSON-LD without `<` → `<` escape** — official Next.js docs flag this as XSS-vulnerable; the lib/json-ld.ts helper must encode the defense.
- **`<ConsoleSignature />` in root `app/layout.tsx`** — would force the entire root tree into client-side rendering. Must mount in `(terminal)/layout.tsx` (already a route group) or as a leaf.
- **Adding `next/og` to `dependencies`** — it's already part of `next` 15.5.x; `import { ImageResponse } from "next/og"` works without extra installs.
- **`@axe-core/playwright` in `dependencies`** — devDep only; no production bundle impact.
- **Pre-tuning per-hue chroma overrides without running axe first** — CONTEXT.md D-22 is conservative. Run the audit, fix only what fails, preserve handoff palette where possible.
- **`0ms` instead of `0.01ms` in reduced-motion reset** — some browsers treat 0 as falsy; the override silently fails.
- **Touching `next.config.ts` for DEV-03** — already shipped Phase 1 (D-29); verify only with `curl -I`.
- **Introducing literal `TODO` strings in any new file** — `scripts/check-placeholders.mjs` greps `/TODO/` (case-sensitive) on every build (`postbuild`). HTML comment uses lowercase, console signature uses lowercase — both safe by current draft. Verify before committing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OG image rasterization | Hand-rolled SVG-to-PNG via headless Chrome / `sharp` | `next/og` `ImageResponse` | Built-in to Next 15.5; auto-cached; integrates with `opengraph-image.tsx` file convention; no headless Chromium dep. |
| Web App Manifest schema | Hand-write `public/manifest.json` | `app/manifest.ts` returning `MetadataRoute.Manifest` | TypeScript types catch malformed manifest at build; Next.js auto-includes icons from `app/icon.tsx`; cleaner. |
| Per-scheme `theme-color` HTML | Hardcode `<meta name="theme-color" media="(prefers-color-scheme: ...)">` in `<head>` | `viewport.themeColor: [{media, color}, ...]` | Next.js emits both metas correctly; one source of truth; no hand-mirrored HTML. |
| `Person` schema TypeScript types | Hand-write the interface | `schema-dts` package OR a small `lib/json-ld.ts` interface | `schema-dts` is heavier than needed for one schema; CONTEXT.md D-08's field set is small enough for a hand-written interface. Don't pull in `schema-dts` for v1. |
| Accessibility contrast checking | Manually compute oklch vs hex contrast ratios | `@axe-core/playwright` | axe-core handles WCAG 2.1 algorithms (relative luminance, large-text rule), supports modern color spaces, returns standardized violation objects with node selectors. |
| Browser test driver | Selenium / Puppeteer / hand-rolled Chrome DevTools Protocol | `playwright` | First-class `emulateMedia({ reducedMotion })`, `addInitScript()` for localStorage seeding, `webServer` config that boots `next dev` automatically. |
| HTML comment injection | Server-side template hack with regex | RSC + `<noscript dangerouslySetInnerHTML>` (Pattern 9) | Standard React pattern; survives view-source verbatim; no build-step gymnastics. |
| Console.log styling | Multiple `console.log` calls | Single `console.log("%c...%c...", style1, style2)` | One DevTools entry; cross-browser styled output (Chrome, Firefox, Safari all support `%c`). |
| Font loading for OG | Self-host JetBrains Mono via custom CDN | Commit `JetBrainsMono-{Bold,Medium}.ttf` under `assets/` (or fetch from Google Fonts CSS API at build time) | Predictable, no network at request time. The `next/font/google` import in `app/layout.tsx` does NOT expose font binary paths reliably — committing the binary is the resilient pattern. |

**Key insight:** Phase 5 is a "polish" phase by name but is heavy on file-convention scaffolding. Every standard pattern has been settled by Next.js or the schema.org / WCAG / Web App Manifest specs. Don't invent — execute.

## Common Pitfalls

### Pitfall 1: `next/og` does NOT consume CSS variables — Satori limitation

**What goes wrong:** Planner writes `style={{ background: "var(--bg)" }}` in `opengraph-image.tsx`. Generated PNG has `background: rgb(0,0,0)` (black) or fails. Recruiter unfurl shows a broken card.

**Why it happens:** `next/og`'s Satori layout engine doesn't reliably resolve CSS variables in the limited renderer environment. Even though Satori's upstream docs claim variable support, the Next.js `ImageResponse` wrapper has historically lost them.

**How to avoid:** Inline hex literals. Read `--bg` dark hex from `app/globals.css:14` (`#0a0c0b`) and inline. Document the dependency: "OG hex inlined from `app/globals.css` `--bg` token; update both if palette changes."

**Warning signs:** OG image renders all-black or all-white background; or specific accent doesn't appear.

### Pitfall 2: Satori only supports `display: flex|block|none` — no grid

**What goes wrong:** Planner writes `style={{ display: "grid", gridTemplateColumns: "..." }}`. ImageResponse throws or layout collapses to default flow.

**Why it happens:** Satori's layout engine is a Flexbox subset (modeled after React Native's Yoga); `display: grid` is unsupported.

**How to avoid:** Use flex with `flexDirection`, `gap`, `justifyContent`, `alignItems`. Set `display: 'flex'` explicitly on every container — Satori's defaults differ from the browser's.

**Warning signs:** OG image elements stack vertically when you wanted grid columns; alignment is off.

### Pitfall 3: `metadata.themeColor` is deprecated in Next.js 14+ — must use `viewport` export

**What goes wrong:** Planner follows CONTEXT.md D-15 literally, sets `metadata.themeColor = [...]`. Next.js logs a deprecation warning at build; the meta tags may still emit but in a future version they will not.

**Why it happens:** Next.js 14.0 released the `metadata-to-viewport-export` codemod that splits `themeColor`, `viewport`, and a few other fields into a dedicated `viewport` export. The intent is to align metadata composition with the W3C viewport specification.

**How to avoid:** Use `export const viewport: Viewport = { themeColor: [...] }` in `app/layout.tsx`. This RESEARCH.md's Pattern 4 has the corrected example. Treat CONTEXT.md D-15 as semantically correct (per-scheme theme-color via media-query array) but syntactically wrong (location).

**Warning signs:** `npm run build` log contains `themeColor in metadata is deprecated` or similar.

[VERIFIED: /vercel/next.js Context7 — `generate-viewport.mdx`]

### Pitfall 4: `next/font/google` does not expose font binary paths

**What goes wrong:** Planner tries `import { JetBrainsMono } from "next/font/google"` inside `opengraph-image.tsx` and passes the resulting font object to `ImageResponse.fonts[]`. Either fails to resolve the binary or pulls a stale cached version.

**Why it happens:** `next/font/google` produces a CSS-variable wrapper for browser font loading; the underlying `.woff2` is fetched at build time, but Next.js does not expose a stable path to that file in user code.

**How to avoid:** Commit `JetBrainsMono-Bold.ttf` and `JetBrainsMono-Medium.ttf` to `assets/` (project root, NOT `public/` which would expose them externally). Load via `await readFile(join(process.cwd(), "assets/JetBrainsMono-Bold.ttf"))`. The TTF format is preferred over WOFF2 for Satori (faster parsing per Vercel guidance). Download from [JetBrains Mono GitHub](https://github.com/JetBrains/JetBrainsMono/releases) and commit.

**Warning signs:** OG image renders text in fallback sans-serif; JetBrains Mono character forms missing.

### Pitfall 5: amber-on-light contrast failure (predicted)

**What goes wrong:** axe-core fails on `--warn` token at `[data-theme="light"]` with accent hue 75. Specifically: `oklch(0.5 0.16 60)` body text on `--bg: #f4f2ea` background drops below 4.5:1.

**Why it happens:** `app/globals.css:78` defines `--warn: oklch(0.5 0.16 60)` for light theme — light cream background reduces contrast for amber-tones. The hue 60 (yellow) and chroma 0.16 land near WCAG's failure threshold for body text on light backgrounds.

**How to avoid:** Run axe FIRST (CONTEXT.md D-22 conservatism). If amber-light fails, scope an override: `[data-theme="light"][data-accent="75"] { --warn: oklch(0.42 0.18 60); }` (lower lightness + higher chroma — bumps contrast). Or scope to specific UI roles only (`.btn-warn`, prompt-line `$` mark) to preserve brand consistency.

**Warning signs:** axe `serious` violations on `.json-key`, `.experience-hash`, `.projects-row-status`, `.shipped-row-status`, `.sb-tree-caret` selectors at light theme + amber.

[CITED: .planning/research/PITFALLS.md Pitfall 8 — predicted at research time, line 234-247]

### Pitfall 6: JSON-LD XSS via unescaped `<`

**What goes wrong:** `<script>JSON.stringify(schema)</script>` — if any field contains `</script>` (or `<` followed by anything that closes the tag), the browser parses the attack as HTML and the rest of the page becomes attacker-controlled markup.

**Why it happens:** `JSON.stringify` does NOT escape `<`. While `PROFILE` is dev-controlled today, Phase 6 adds bio fields that may eventually flow from the backend or a CMS.

**How to avoid:** `JSON.stringify(schema).replace(/</g, "\\u003c")`. Encode the discipline in `lib/json-ld.ts` so future contributors don't bypass it.

[VERIFIED: nextjs.org/docs/app/guides/json-ld — official Next.js JSON-LD pattern]

### Pitfall 7: `0ms` reduced-motion override silently fails in some browsers

**What goes wrong:** `animation-duration: 0ms !important` skipped because some browser implementations treat `0ms` as null/unset. Animation still plays at original duration.

**Why it happens:** The CSS spec is unambiguous (`0` is a valid time value), but browser quirks have historically made `0` behave inconsistently when paired with `!important` overrides.

**How to avoid:** Use `0.01ms` — effectively instantaneous, bypasses the falsy-coercion bug.

[CITED: CSS-Tricks "No Motion Isn't Always prefers-reduced-motion" — `0.01ms` is canonical]

### Pitfall 8: `<ConsoleSignature />` in root layout collapses RSC tree

**What goes wrong:** Planner mounts `<ConsoleSignature />` in `app/layout.tsx`. Because it carries `'use client'`, the Server Component → Client Component boundary moves up to root, and ALL nested routes ship as client components. First Load JS spikes ~50-200KB; Lighthouse Performance drops 20-40 points.

**Why it happens:** The React Server Components boundary rule: a Server Component can render a Client Component child, but if the Client Component is the rendering parent, every descendant becomes client too. Root layout has special status — putting client there poisons the entire app.

**How to avoid:** Mount in `app/(terminal)/layout.tsx` instead — also a Server Component, but at a deeper position so the boundary is local. CONTEXT.md D-25 already specifies this correctly. Sibling to existing `<CommandPalette />` (which is also `'use client'`).

[VERIFIED: codebase `app/(terminal)/layout.tsx:7-11` — pattern of importing client islands here]

### Pitfall 9: `TODO` in any new code fails the postbuild placeholder grep

**What goes wrong:** Phase 5 file contains the literal string `TODO` (e.g., `// TODO: refine ASCII art`). `npm run build`'s `postbuild` step (`scripts/check-placeholders.mjs:25 — /TODO/`) fails; CI breaks; commit cannot ship.

**Why it happens:** Phase 1 D-10 / INFRA-05 enforces no `TODO` strings in build output (case-sensitive). Phase 5 introduces ~10 new files; any one of them with `TODO` in a comment or a string literal kills the build.

**How to avoid:** Use lowercase `todo` in prose. Use other markers (`FIXME`, `XXX`, `LATER`) sparingly — none of those are in the regex but the spirit of the rule is don't leave unfinished work in shipped code. The console signature MUST NOT contain `TODO` and the HTML comment is already lowercase per draft. AboutSocials TODO-guard logic uses the URL pattern `^https?://` — never embeds the literal string `TODO`.

**Warning signs:** `npm run build` fails with `INFRA-05: Forbidden strings found in build output: ... matched /TODO/`.

[VERIFIED: codebase `scripts/check-placeholders.mjs:25-26`]

### Pitfall 10: Playwright spec runs but `data-theme` doesn't apply

**What goes wrong:** Spec sets `localStorage["theme"]` via `addInitScript()`, navigates, but the rendered page still shows `data-theme="dark"` regardless. axe results are the same for every "theme" cell.

**Why it happens:** `next-themes` has its own pre-paint script that may race with Playwright's `addInitScript()`, OR the `theme` localStorage key name is wrong. `next-themes` defaults to a key named `theme` but check `app/layout.tsx`'s `ThemeProvider` props — if `storageKey` is set, the key differs.

**How to avoid:** (a) Verify the `next-themes` storage key by inspection — `app/layout.tsx:50-54` shows `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>` — no custom `storageKey`, so the default `"theme"` is correct. (b) Add the sanity assertion `await expect(page.locator("html")).toHaveAttribute("data-theme", theme)` — the spec catches the failure mode before running axe.

**Warning signs:** All matrix cells produce identical axe results.

### Pitfall 11: OG image build-time cost — 8 file generations

**What goes wrong:** `next build` runtime jumps because Next.js must execute every `opengraph-image.tsx` to produce the cached PNG output. With 8 OG variants (root + 7 routes), build time grows.

**Why it happens:** Each `ImageResponse` call invokes Satori (HTML → SVG → PNG), font loading, and image encoding. Per file: ~200-800ms.

**How to avoid:** Accept the cost (~3-6s additional build time). All 8 OG cards reuse the same template and font binary — the per-route variant is one string substitution. The font binary is loaded once per file but cached by Node's `readFile`. If build time becomes a CI concern, the remediation (NOT for v1) is converting the variants to a shared helper that takes `route: Route` and returns `ImageResponse`. v1 ships with 8 separate files for clarity.

**Warning signs:** `npm run build` log shows ~5s additional time; first run is slowest, subsequent runs faster (Next.js caches OG output unless content changes).

### Pitfall 12: Manifest icons[] array conflicts with auto-included `app/icon.tsx`

**What goes wrong:** Planner writes `manifest.ts` with explicit `icons: [{ src: "/icon", sizes: "32x32" }]`. Next.js also auto-includes `app/icon.tsx`. Duplicate entries; some browsers misorder.

**Why it happens:** Next.js's File-Convention behavior: `app/icon.tsx` and `app/apple-icon.tsx` are auto-discovered and emit their own `<link rel="icon">` tags PLUS get auto-listed in the manifest's `icons[]` array. Manual `icons[]` entries duplicate what Next.js would emit anyway.

**How to avoid:** Leave `manifest.ts` `icons[]` as `[]` (empty array) in v1 — Next.js handles the auto-inclusion. If a specific manifest icon size is needed for Android home-screen install (192×192, 512×512), add additional `app/icon.tsx` files (Next.js supports multiple `app/icon[N].tsx` files with different `size` exports). v1 doesn't push install — minimal manifest is the goal.

[VERIFIED: /vercel/next.js Context7 — `manifest.mdx`]

## Code Examples

Full snippets are inline in §Architecture Patterns. Cross-reference:

| Need | See |
|------|-----|
| Per-route OG card layout | Pattern 1 |
| Favicon `>_` glyph | Pattern 2 |
| Web App Manifest | Pattern 3 |
| Twitter card + viewport.themeColor | Pattern 4 |
| JSON-LD `Person` helper + RSC | Pattern 5 |
| Reduced-motion global reset | Pattern 6 |
| `@axe-core/playwright` matrix spec | Pattern 7 |
| ConsoleSignature client island | Pattern 8 |
| HTML comment in `<head>` | Pattern 9 |
| `<AboutSocials />` mini contact-card | Pattern 10 |

### Header verification (DEV-03, manual gate)

```bash
# After npm run dev:
curl -sI http://localhost:3000/ | grep -i "x-built-with"
# Expected: x-built-with: nextjs-15-react-19

# x-portfolio-source intentionally absent — Phase 7 deferred (CONTEXT.md D-30)
curl -sI http://localhost:3000/ | grep -i "x-portfolio-source"
# Expected: empty result (header not yet shipped)
```

### Local OG verification

```bash
# After npm run dev:
curl http://localhost:3000/opengraph-image -o /tmp/og-root.png
file /tmp/og-root.png
# Expected: PNG image data, 1200 x 630, ...

curl http://localhost:3000/projects/opengraph-image -o /tmp/og-projects.png
# etc. for each route
```

For Slack / LinkedIn unfurl preview before deploy: localhost is not publicly reachable, so use a tunnel (`ngrok http 3000`) and paste the public URL into:
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Slack Link Unfurl: paste in any Slack channel
- X Card Validator: https://cards-dev.twitter.com/validator (deprecated but functional)

OR defer this to Phase 7 production (DEPLOY-02 / Lighthouse covers OG presence; the unfurl visual fidelity is a manual production check).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `metadata.themeColor` array | `viewport.themeColor` array (`viewport` export) | Next.js 14.0 (2023) | Codemod available: `npx @next/codemod@latest metadata-to-viewport-export .`. Codebase doesn't currently set `themeColor` anywhere, so Phase 5 introduces it cleanly in the new location. |
| `_document.tsx` for `<head>` HTML comments | Root `app/layout.tsx` `<head>` with `<noscript dangerouslySetInnerHTML>` | Next.js 13 App Router (2022) | `_document.tsx` is gone; no Pages Router escape hatch. The `<noscript>` pattern from Pattern 9 is the canonical workaround. |
| Static `public/og-image.png` | `app/opengraph-image.tsx` file convention with `next/og` | Next.js 13.3 (April 2023) | File convention is the modern standard; per-route variants come for free. |
| `metadata.icons.icon = "/favicon.ico"` | `app/icon.tsx` ImageResponse | Next.js 13.3 | Generated icons via JSX; no PNG handcrafting required. |
| `<script>` for executable + JSON-LD | Native `<script type="application/ld+json">` for data; `next/script` for JS | Always — but Next.js 15.5 docs explicitly clarify `next/script` is for executable code only | JSON-LD is structured data — use a plain `<script>` with `dangerouslySetInnerHTML`. |
| `axe-core` jsdom integration | `@axe-core/playwright` real-browser integration | Tooling shift (~2023) | jsdom can't render oklch tokens correctly; Playwright drives real Chromium; matches what Slack/LinkedIn/users actually see. |
| `metadata.themeColor` + `metadata.viewport` together | `metadata` (everything else) + `viewport` (themeColor, viewport, colorScheme) | Next.js 14.0 | The `viewport` export is the single source of truth for browser-chrome-affecting metadata. |

**Deprecated/outdated (do not use):**
- `next/legacy/image` — Phase 5 doesn't touch images, but worth flagging that Next.js still ships the legacy image component for migrations; new code uses `next/image`.
- Pages Router metadata API (`Head` from `next/head`) — App Router uses `metadata`/`generateMetadata` exports.
- `next-pwa` — for v1's "browser display mode, no service worker" manifest, no PWA framework needed. v3 may revisit.
- `react-helmet` / `react-helmet-async` — not used in this codebase; App Router metadata API replaces.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `<noscript dangerouslySetInnerHTML>` preserves the literal HTML comment in raw `view-source:` output across Chrome/Firefox/Safari. | Pattern 9 / DEV-02 | The HTML comment may render visibly in DevTools Elements panel (it shouldn't) or fail to appear in view-source. **Mitigation:** Planner verifies post-implementation via `curl http://localhost:3000 \| grep "hello, you found"` before declaring DEV-02 done. If `<noscript>` doesn't preserve, fall back to a plain inert `<script type="text/x-html-comment" dangerouslySetInnerHTML>` — same effect, different MIME. |
| A2 | The `next/font/google` JetBrains Mono import in `app/layout.tsx` does NOT expose a stable file path that `opengraph-image.tsx` can use, so committing the TTF binary to `assets/` is required. | Pitfall 4, Standard Stack §Supporting | If the planner discovers a stable path (e.g., via `path.resolve(require.resolve("next/font/google"), ...)`), the asset commit is unnecessary, saving ~150KB of repo weight. **Mitigation:** Try the stable-path approach first during execution; fall back to `assets/` commit if it doesn't resolve cleanly. The `assets/` approach is the documented Vercel pattern and is safest. |

**Two assumed claims; both have explicit mitigations.** All other facts in this research are tagged `[VERIFIED]` (Context7, codebase, npm registry) or `[CITED]` (official docs URL). No `[ASSUMED]` claims affect locked CONTEXT.md decisions — both are implementation-detail fallbacks the planner can verify during execution.

## Open Questions

1. **Should the four per-route OG variants share a helper to deduplicate the template?**
   - What we know: 8 OG files all share ~80% of the JSX (background, font, accent block, name, role).
   - What's unclear: Whether Next.js's per-file caching is per-file or per-helper. If per-file, sharing helps maintainability without losing build performance.
   - Recommendation: Ship 8 separate files in v1 (matches CONTEXT.md D-05 file convention literally; 8 files × ~50 LOC each is manageable). If maintenance friction emerges, extract a `lib/og-card.tsx` helper in v1.x. Don't optimize prematurely.

2. **Should `lib/json-ld.ts` use `schema-dts` for typed schemas?**
   - What we know: `schema-dts` is a community package providing TypeScript types for all schema.org types.
   - What's unclear: Whether v1 benefits from the heavyweight types or a hand-written `interface PersonSchema` is sufficient.
   - Recommendation: Hand-written interface in v1 (5 fields; CONTEXT.md D-08 locks the field set). `schema-dts` is overkill for one schema. Revisit if Phase 6 expands JSON-LD to multiple schema types (e.g., `WebSite`, `BreadcrumbList`).

3. **CI vs local-only for `@axe-core/playwright` (CONTEXT.md D-21)?**
   - What we know: Phase 1 INFRA-03 already runs `lint + typecheck + test + knip + build` on every PR (~60s).
   - What's unclear: Whether ~30s additional axe-core runtime is acceptable for the CI feedback latency.
   - Recommendation: CI integration. The 30s cost is amortized against the regression-prevention value (any future CSS edit could break a hue/theme combination silently). Add `npm run test:contrast` as a CI step matching CONTEXT.md D-21's default. Document the manual `npm run test:contrast` invocation for local iteration.

4. **OG image cache strategy — request-time vs build-time generation?**
   - What we know: `opengraph-image.tsx` defaults to dynamic generation; `next build` precompiles when route content is fully static.
   - What's unclear: Whether the `route.label` substitution counts as "static" and triggers build-time precompile.
   - Recommendation: Check `npm run build` output; if `opengraph-image` routes show `(Static)`, no further action. If `(Dynamic)`, accept the request-time cost — Next.js caches OG outputs internally and serves with cache headers. Phase 7 verifies CDN caching at production.

5. **Should the AboutSocials block be under `lib/portfolio-data.ts` discipline (CONTEXT.md D-34) or hardcoded?**
   - What we know: D-34 says "Pin the 3 rows in code: `PROFILE.email` + filter `PROFILE.socials`."
   - What's unclear: Whether to import the 3-tuple from PROFILE directly (planner reads PROFILE.socials.find(s => s.kind === "github") at render) or pre-compute in lib.
   - Recommendation: Inline filter in `<AboutSocials />` (Pattern 10's example). Three lookups by `kind` are O(1) over a 2-element array. No abstraction needed; PROFILE shape will not change in Phase 5.

## Environment Availability

Phase 5 introduces external dependencies that need verification on the dev machine:

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All Next.js operations | ✓ (engines.node="22.x" in package.json) | 22.x | — |
| npm | Package install | ✓ | bundled with Node | — |
| `next` | OG image generation, metadata files | ✓ | 15.5.15 [VERIFIED: `package.json:21`] | — |
| Playwright Chromium binary | Contrast audit | needs `npx playwright install chromium` (~150MB, one-time) | depends on `playwright@^1.59.1` | None — install is required to run audit. CI must include this step. |
| Internet access | Initial Playwright/axe-core install + Chromium binary fetch + JetBrains Mono TTF download (one-time) | ✓ (assumed dev environment) | n/a | None for setup; once binaries are in node_modules and assets/ committed, offline-capable. |
| JetBrains Mono TTF binaries | OG image font loading | ✗ (not in repo today) | needs to be downloaded from github.com/JetBrains/JetBrainsMono/releases | Fallback: fetch from `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700` and parse the URL out of the CSS at build time. Net more complex; recommend committing the TTFs. |
| `curl` | DEV-03 manual header verification | ✓ (macOS default) | n/a | Use Postman / Insomnia / DevTools Network panel — same data. |

**Missing dependencies with no fallback:**
- None. Playwright Chromium fetch is an explicit setup step every contributor runs.

**Missing dependencies with fallback:**
- JetBrains Mono TTFs not in repo — recommended remediation: download once and commit to `assets/`. Alternative: build-time fetch from Google Fonts CSS API (more complex, network-dependent).

## Validation Architecture

`workflow.nyquist_validation` is `true` per `.planning/config.json`. Section is REQUIRED.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 (existing — jsdom unit/component tests) + Playwright 1.59.x (NEW — real-browser tests) |
| Config file | `vitest.config.ts` (existing); `playwright.config.ts` (NEW — Wave 0) |
| Quick run command | `npm test` (Vitest); `npm run test:contrast` (Playwright contrast spec only) |
| Full suite command | `npm test && npm run test:contrast && npm run check:mobile && npm run lint && npm run typecheck && npm run knip && npm run build` |
| Phase gate | All checks green before `/gsd-verify-work` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **SEO-01** | Twitter card metadata `summary_large_image` on root `metadata` | unit (Vitest) | `npx vitest run app/layout.test.tsx -t "twitter"` (NEW spec) | ❌ Wave 0 |
| **SEO-02a** | JSON-LD `<script type="application/ld+json">` rendered in `<head>` with `@type: Person` | unit (Vitest) | `npx vitest run app/components/shell/json-ld-person.test.tsx` (NEW) | ❌ Wave 0 |
| **SEO-02b** | `lib/json-ld.ts` `filterValidUrls` excludes `TODO:` and includes `https?://` URLs | unit (Vitest) | `npx vitest run lib/json-ld.test.ts` (NEW) | ❌ Wave 0 |
| **SEO-02c** | `<` characters in JSON-LD payload are escaped to `<` | unit (Vitest) | `npx vitest run app/components/shell/json-ld-person.test.tsx -t "escapes"` | ❌ Wave 0 |
| **SEO-03a** | Each route has an `opengraph-image.tsx` file | smoke (Bash glob check) | `bash -c 'ls app/opengraph-image.tsx app/(terminal)/{projects,stack,experience,writing,contact,shipped}/opengraph-image.tsx app/(terminal)/opengraph-image.tsx 2>/dev/null \| wc -l'` (expects 8) | ❌ Wave 0 (script — script:check-og-files.mjs) |
| **SEO-03b** | OG endpoints respond with PNG content-type at expected URLs | integration (Playwright) | `npm run test:contrast` (extend with smoke spec OR add separate `tests/og.spec.ts`) | ❌ Wave 0 |
| **SEO-03c** | Slack/LinkedIn unfurl visual fidelity | manual (CONTEXT.md `manualgate`) | Manual: post a tunneled URL to Slack, observe unfurl. Defer-to-prod acceptable (Phase 7 covers final). | manual gate |
| **SEO-04a** | `app/icon.tsx`, `app/apple-icon.tsx`, `app/manifest.ts` exist and respond | smoke | `curl -sI http://localhost:3000/icon http://localhost:3000/apple-icon http://localhost:3000/manifest.webmanifest` | manual gate (or scripts/check-favicons.mjs) |
| **SEO-04b** | `viewport.themeColor` emits per-scheme `<meta name="theme-color">` tags | unit (Vitest) | `npx vitest run app/layout.test.tsx -t "themeColor"` | ❌ Wave 0 |
| **A11Y-03** | `prefers-reduced-motion` global reset present in `globals.css` | smoke (script) | `node scripts/check-reduced-motion.mjs` (NEW — greps for the universal-selector reset block) | ❌ Wave 0 |
| **A11Y-03 manual** | OS Reduce Motion toggle disables animations site-wide | manual gate | Tester enables Reduce Motion in macOS System Settings → Accessibility, reloads each route, observes no `slideIn`, no cursor blink, no drawer slide animation. | manual gate |
| **A11Y-07** | All 4 hues × 2 themes × 7 routes pass axe color-contrast (WCAG 2.1 AA) | integration (Playwright) | `npm run test:contrast` | ❌ Wave 0 (`tests/contrast.spec.ts` + `playwright.config.ts`) |
| **DEV-01** | `<ConsoleSignature />` mounts and logs once on first paint | unit (Vitest + @testing-library/react) | `npx vitest run app/components/shell/console-signature.test.tsx -t "logs"` | ❌ Wave 0 |
| **DEV-02** | 6-line HTML comment present in raw `view-source` output | smoke (script) | `node scripts/check-head-comment.mjs` (NEW — `curl localhost:3000 \| grep -c "hello, you found"` ) | ❌ Wave 0 |
| **DEV-03** | `x-built-with` header present on every route | smoke (script) | `node scripts/check-headers.mjs` (NEW) — alternatively manual `curl -I` | manual gate (or new script) |
| **Phase 4 carry-forward** | `<AboutSocials />` renders 3 rows on `/about` | unit (Vitest extends existing about-view.test.tsx) | `npx vitest run app/components/views/about-view.test.tsx -t "socials"` | ✅ (extend existing file) |

### Sampling Rate

- **Per task commit:** `npm test` (Vitest only — fast, ~5s).
- **Per wave merge:** `npm test && npm run check:mobile` for non-axe waves; full suite (`npm test && npm run test:contrast && npm run check:mobile && npm run lint && npm run typecheck && npm run knip && npm run build`) at end of Wave 4.
- **Phase gate:** Full suite green before `/gsd-verify-work`. Manual gates documented in §Phase Requirements (reduce-motion OS toggle test, header curl, view-source curl, optional unfurl preview).

### Wave 0 Gaps

- [ ] `tests/contrast.spec.ts` — covers A11Y-07 (4 hues × 2 themes × 7 routes matrix)
- [ ] `playwright.config.ts` — Playwright runtime config; `webServer` boots `next dev`
- [ ] `app/components/shell/json-ld-person.test.tsx` — covers SEO-02a, SEO-02c
- [ ] `lib/json-ld.test.ts` — covers SEO-02b
- [ ] `app/components/shell/console-signature.test.tsx` — covers DEV-01
- [ ] `app/layout.test.tsx` — covers SEO-01 (twitter), SEO-04b (viewport.themeColor)
- [ ] `scripts/check-og-files.mjs` — smoke: 8 OG files exist
- [ ] `scripts/check-reduced-motion.mjs` — smoke: globals.css has the universal-selector reset
- [ ] `scripts/check-head-comment.mjs` — smoke: HTML comment in `view-source`
- [ ] `scripts/check-headers.mjs` — smoke: x-built-with header present (DEV-03)
- [ ] Framework install: `npm install --save-dev @axe-core/playwright@^4.11.3 playwright@^1.59.1 && npx playwright install chromium`
- [ ] Asset addition: `assets/JetBrainsMono-Bold.ttf` and `assets/JetBrainsMono-Medium.ttf` (~150KB total) — see Pitfall 4
- [ ] Extend `app/components/views/about-view.test.tsx` — covers Phase 4 carry-forward (AboutSocials block renders 3 rows)
- [ ] `package.json` script addition: `"test:contrast": "playwright test"`

## Sources

### Primary (HIGH confidence)

- **`/vercel/next.js` Context7** — Topics fetched: `opengraph-image ImageResponse fonts JetBrains` (Pattern 1, Pitfall 4); `icon apple-icon manifest themeColor MetadataRoute` (Patterns 2, 3, 4; Pitfall 12); `themeColor metadata viewport per-scheme dark light media` (Pattern 4, Pitfall 3 — confirmed `viewport` export is current); `ImageResponse satori CSS limitations` (Pitfalls 1, 2; supported props list).
- **[Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)** — version 16.2.6, lastUpdated 2026-05-07. Verified the `JSON.stringify(jsonLd).replace(/</g, '\\u003c')` pattern. Pattern 5, Pitfall 6.
- **[Schema.org Person](https://schema.org/Person)** — All Person properties optional; `sameAs` accepts URLs of authoritative reference pages; canonical for the Phase 5 schema.
- **[github.com/dequelabs/axe-core-npm Playwright README](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md)** — Verified AxeBuilder API (`.withTags`, `.disableRules`, `.analyze`); confirmed `wcag2aa` tag covers color-contrast scope.
- **npm registry** — `npm view @axe-core/playwright version` → 4.11.3 (2026-05-10); `npm view playwright version` → 1.59.1 (2026-05-10); `npm view @axe-core/playwright peerDependencies` → `{ "playwright-core": ">= 1.0.0" }`.
- **Codebase inspection** — `app/globals.css` (oklch tokens, reduced-motion existing block at line 152, current --bg dark hex `#0a0c0b` and light hex `#f4f2ea`), `app/layout.tsx` (metadata wiring, ThemeProvider config, no custom storageKey), `app/(terminal)/layout.tsx` (mount points), `lib/portfolio-data.ts` (PROFILE shape and current values), `lib/routes.ts` (7-entry registry), `next.config.ts` (engineerHeaders array including `x-built-with`), `scripts/check-placeholders.mjs` (TODO/regex grep behavior).

### Secondary (MEDIUM confidence — verified with primary sources)

- **[npm @axe-core/playwright](https://www.npmjs.com/package/@axe-core/playwright)** — Confirmed via WebSearch + GitHub README cross-reference; Pattern 7 spec scaffolding.
- **[Vercel Satori GitHub](https://github.com/vercel/satori)** — CSS support claims; the WebSearch result matched the upstream README. Pitfall 2.
- **[Playwright Accessibility Testing Docs](https://playwright.dev/docs/accessibility-testing)** — `page.emulateMedia({ reducedMotion: "reduce" })` API and `addInitScript` pattern. Pattern 7.
- **[CSS-Tricks — No Motion Isn't Always prefers-reduced-motion](https://css-tricks.com/nuking-motion-with-prefers-reduced-motion/)** — `0.01ms` rationale (Pitfall 7) and belt-and-suspenders pattern guidance.
- **[Adobe Design — Animation that fails safely (March 2026)](https://medium.com/@Adobe_Design/animation-that-fails-safely-defensive-design-for-motion-sensitive-users-de3c779f476d)** — 2026 nuance on reduced-motion as "reduce, not break" — informs CONTEXT.md D-18 cursor-stays-visible decision.

### Tertiary (LOW confidence — flagged for validation)

- **[trypeek.app/blog/oklch-explained](https://trypeek.app/blog/oklch-explained-what-it-is-why-tailwind-v4-uses-it-how-to-convert)** — General oklch explanation; used as background context only, not as load-bearing source.
- **[12amagency.com — Knowledge Panel guide](https://12amagency.com/blog/google-knowledge-panel-for-person/)** — sameAs guidance; informs CONTEXT.md D-09 auto-filter rationale but the filter pattern itself is a project decision.
- **WebSearch general 2026 SEO results** — no contradictions surfaced; all consistent with primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `next/og`, `MetadataRoute.Manifest`, `@axe-core/playwright` all verified via Context7 + npm registry; CONTEXT.md decisions align with the documented APIs.
- Architecture: HIGH — Component map traced through actual codebase files (`app/layout.tsx`, `(terminal)/layout.tsx`, `about-view.tsx`); RSC/client boundaries match Phase 2-4 precedent.
- Pitfalls: HIGH — Two corrections (`viewport.themeColor` location, `<noscript>` HTML comment trick) verified against authoritative sources; amber-on-light failure prediction grounded in Phase 5 research SUMMARY.md and Pitfall 8.
- Validation: HIGH — Vitest is jsdom-existing (proven through Phase 2-4); Playwright config pattern is canonical; all gaps enumerated in Wave 0 list.

**Research date:** 2026-05-10
**Valid until:** 2026-06-10 (30 days for stable Next.js 15.5 + Playwright 1.59.x stack; revisit if Next.js 16.x lands or `@axe-core/playwright` 5.x ships).

## Project Constraints (from CLAUDE.md)

| Directive | Phase 5 Compliance |
|-----------|-------------------|
| Next.js 15 App Router + React 19 + TypeScript strict (no framework swap) | ✓ All Phase 5 work uses `Metadata`/`Viewport` exports, RSC, `next/og` — built into the locked stack. |
| Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules) | ✓ All Phase 5 CSS is appended to `app/globals.css`. The `ImageResponse` JSX uses inline `style={{}}` because Satori does not consume external CSS — this is the documented exception, not a violation. |
| Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1` — do not add others without revisiting | ✓ Phase 5 adds ZERO production dependencies. `@axe-core/playwright` and `playwright` are devDependencies. |
| Native `fetch` + `next: { revalidate }` for data — no SWR, no TanStack Query | ✓ Phase 5 fetches no runtime data. |
| Persistent shell at `app/(terminal)/layout.tsx`; never unmounts on view switching | ✓ `<ConsoleSignature />` mounts inside the persistent shell. |
| `app/layout.tsx` is a Server Component; only thin client islands carry `"use client"` | ✓ Only ONE new client island (`<ConsoleSignature />`). All other Phase 5 components are RSC. |
| `lib/routes.ts` is the single source of truth for the 7 routes | ✓ Per-route OG variants substitute `route.label` from `ROUTES[i]`. |
| Theme uses `next-themes`; accent hue is a separate axis managed by an inline pre-paint script | ✓ Phase 5 doesn't touch theme/accent runtime; the contrast audit seeds `localStorage` to test combinations. |
| Brownfield: delete-then-replace in same commit; never just delete | ✓ Phase 5 only adds; no deletions. |
| Backend type changes ship as paired commits | n/a — Phase 5 makes no backend changes. |
| Persistent resume download button visible at every viewport | ✓ Phase 5 doesn't touch top bar; `<AboutSocials />` is additive in /about. |
| Sidebar file rows have plain-noun `aria-label` | ✓ Already shipped Phase 2; Phase 5 doesn't touch sidebar. |
| Mobile sidebar redistributes to bottom-sheet drawer + top-bar | ✓ Already shipped Phase 4; Phase 5 doesn't touch mobile redistribution. |
| 5-second recruiter test is a real exit criterion | ✓ Phase 5's AboutSocials carry-forward directly addresses recruiter discoverability friction (Plan 04-05 Gate 9). |
| `npm run build` will fail if INFRA-05 prebuild grep finds placeholders | ✓ Phase 5 must NOT introduce literal `TODO` strings (Pitfall 9). HTML comment + console signature drafts are lowercase — both safe. |

---

*Phase 5 Research authored by `gsd-phase-researcher` 2026-05-10. Ready for `gsd-planner` consumption.*
