# Codebase Concerns

**Analysis Date:** 2026-05-06

## Summary

The repo is a small Next.js 15 / React 19 App Router portfolio (10 source files, ~405 LOC). It has a clean shape, baseline SEO scaffolding (`robots.ts`, `sitemap.ts`), graceful API fallbacks, and one smoke test. However, several items would block a true production launch — most notably a **critical npm advisory in `next@15.3.2`**, a **placeholder `resume.pdf` shipping as a download**, several **fallback values containing demo data presented as real**, and **gaps in SEO, accessibility, error handling, and test coverage**.

Checks performed:
- Read every file in `app/` and `lib/` plus root configs (`next.config.ts`, `tsconfig.json`, `.eslintrc.json`, `vitest.config.ts`, `vitest.setup.ts`, `package.json`, `.gitignore`, `README.md`).
- Searched for `TODO|FIXME|HACK|XXX` across `app/` and `lib/` (no matches).
- Searched for `any`, `console.*` usage (no matches).
- Searched for `next/image` usage (no matches).
- Searched for client-component boundaries (`use client`) — only `theme-toggle.tsx`.
- Searched for metadata extensions (`metadataBase`, `icons`, `manifest`, `alternates`) — none configured.
- Ran `npm outdated` and `npm audit --omit=dev`.
- Inspected `public/resume.pdf` (50-byte placeholder, not a real PDF).
- Listed `app/` for missing route conventions (`error.tsx`, `loading.tsx`, `not-found.tsx`, `/blog/[slug]/page.tsx`).

---

## Tech Debt

**Placeholder resume served as a download:**
- Issue: `public/resume.pdf` is a 50-byte ASCII text file containing `Placeholder resume file. Replace with actual PDF.` (verified via `file` and `wc -c`). The homepage exposes a public download link to it.
- Files: `public/resume.pdf`, `app/components/homepage.tsx:58-60`
- Impact: Recruiters click "Download Resume" and receive a broken file. This is the single most damaging UX defect for a recruiter-facing portfolio.
- Severity: **High**
- Fix approach: Replace `public/resume.pdf` with a real PDF; consider serving via a versioned filename (e.g. `resume-2026-05.pdf`) with a stable rewrite, plus `Content-Disposition` headers for predictable filename when downloaded.

**Fallback data leaks demo content into production renders:**
- Issue: `lib/fallback-data.ts` contains placeholders that will render verbatim if the API is unreachable or unconfigured: `email: "beck@example.com"` (line 8), social `href: "https://github.com/"` and `"https://www.linkedin.com/"` (lines 11-12), `appStoreUrl: "https://apps.apple.com/"` and `googlePlayUrl: "https://play.google.com/store"` (lines 39-40), company `"Product Studio"` (line 27).
- Files: `lib/fallback-data.ts:8-13,27,39-40`, surfaced by `app/page.tsx:11-17` → `app/components/homepage.tsx:39-52,98-107`
- Impact: With no API configured (the README admits the API URL "defaults to `http://localhost:8080` if unset"), `getJson` swallows errors and renders `example.com` emails and store-front home pages as portfolio links. SEO will index this content.
- Severity: **High**
- Fix approach: Either (a) hardcode real values in fallback data and treat the API as an optional enhancement, or (b) make the fetch failures observable (log + 500) instead of silently rendering placeholders, or (c) gate fallback usage on `process.env.NODE_ENV !== "production"`.

**Empty `next.config.ts`:**
- Issue: `const nextConfig: NextConfig = {};` — no `images.remotePatterns`, no `headers()` for security, no `redirects`/`rewrites`, no `output` mode.
- Files: `next.config.ts:1-5`
- Impact: Cannot use `next/image` for any external host; missing security headers (CSP, HSTS, X-Frame-Options); no production hardening.
- Severity: **Medium**
- Fix approach: Add a `headers()` function with at least `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, and a Content-Security-Policy. Add `images.remotePatterns` once external images are needed.

**Theme persistence pre-hydration script silently catches all errors:**
- Issue: `app/layout.tsx:15-24` injects an inline `<script dangerouslySetInnerHTML>` wrapped in `try {} catch {}`. Errors are swallowed; the catch block is empty.
- Files: `app/layout.tsx:15-24`
- Impact: Real failures (e.g., `localStorage` quota or SecurityError) are invisible. Inline scripts also conflict with strict CSP.
- Severity: **Low**
- Fix approach: Acceptable pattern for FOUC prevention, but pair with a CSP nonce (`headers()` in `next.config.ts`) and consider Next 15's `unstable_after` or a server-side cookie-based theme to drop the inline script entirely.

---

## Known Bugs

**Blog "Read more" links point to non-existent routes:**
- Symptoms: Clicking any blog preview link navigates to `/blog/<slug>` and 404s.
- Files: `app/components/homepage.tsx:90` renders `<a href={`/blog/${post.slug}`}>Read more</a>`; no `app/blog/` directory exists (verified `ls app/`).
- Trigger: Any user clicking "Read more" on the homepage.
- Workaround: None — the feature is wired up but the destination is missing.
- Severity: **High**
- Fix approach: Either build `app/blog/[slug]/page.tsx` (preferred — README claims "Blog preview" as a feature) or remove the `<a>` and render only excerpts until the route exists.

**Theme toggle initial render mismatch / flash:**
- Symptoms: `ThemeToggle` initializes `useState<"light">` then reads `localStorage` in `useEffect`. The button label may briefly read "Switch to Dark" even when dark theme is active (set by the inline script in `layout.tsx`).
- Files: `app/components/theme-toggle.tsx:11-21`, `app/layout.tsx:15-24`
- Trigger: Page load when stored theme is `"dark"`.
- Workaround: None.
- Severity: **Low**
- Fix approach: Read `document.documentElement.getAttribute("data-theme")` synchronously in a `useLayoutEffect`, or expose the resolved theme through a server-readable cookie so SSR matches the client.

---

## Security Considerations

**Critical npm advisory on `next@15.3.2`:**
- Risk: `npm audit` reports 1 critical + 1 moderate vulnerability. Next.js 15.3.2 is affected by RCE via React flight protocol (GHSA-9qr9-h5gf-34mp), SSRF via middleware redirect handling (GHSA-4342-x723-ch2f), Server Actions source code exposure (GHSA-w37m-7fhw-fmv9), HTTP request smuggling in rewrites (GHSA-ggv3-7p47-pfv8), cache poisoning via missing Vary header, and several DoS issues. `postcss` (transitive) has a moderate XSS advisory.
- Files: `package.json:13` (`"next": "15.3.2"`), `package-lock.json`
- Current mitigation: None. The app is at 15.3.2; latest is 15.5.15 (patch line) / 16.2.4 (current major).
- Recommendations: Run `npm audit fix --force` to upgrade to `next@15.5.15`, or pin to the latest 15.x and re-run `npm audit`. If staying on 15.x long-term, set up Dependabot/Renovate.
- Severity: **High**

**Inline `<script dangerouslySetInnerHTML>` blocks strict CSP:**
- Risk: The theme-init inline script in `app/layout.tsx:34` cannot be allowed by a strict CSP without `'unsafe-inline'` or a per-request nonce. Today there is no CSP at all.
- Files: `app/layout.tsx:15-34`, `next.config.ts:1-5`
- Current mitigation: None.
- Recommendations: Add `Content-Security-Policy` via `headers()` in `next.config.ts`. Use a nonce-based CSP and inject the same nonce into the theme script, or move theme detection to a cookie + server render.
- Severity: **Medium**

**External links open with `target="_blank"` and `rel="noreferrer"` only:**
- Risk: Missing `rel="noopener"` is partially mitigated by `noreferrer` (modern browsers treat it as noopener), but explicit `noopener noreferrer` is the recommended hardening, especially since `app.appStoreUrl`, `app.googlePlayUrl`, and `social.href` come from a remote API.
- Files: `app/components/homepage.tsx:44,47,103`
- Current mitigation: `rel="noreferrer"` present.
- Recommendations: Use `rel="noopener noreferrer"`. Validate / allowlist URL schemes before rendering — currently any `javascript:` URL returned by the API would render as-is (no protocol check in `lib/api.ts`).
- Severity: **Medium**

**No URL/scheme validation on API-supplied `href` / `appStoreUrl` / `googlePlayUrl` / `email`:**
- Risk: `lib/api.ts:12-22` performs no schema validation. A compromised or misconfigured API could inject `javascript:` URLs (XSS) or arbitrary HTML-meaningful content into mailto links.
- Files: `lib/api.ts:12-22`, `app/components/homepage.tsx:44,47,90,98,103`
- Current mitigation: React escapes text content, but `href` attributes are passed through.
- Recommendations: Validate API responses with `zod` or hand-written guards; in particular, assert `url.protocol === "https:"` for app store / social links.
- Severity: **Medium**

**`.env.local` not explicitly gitignored beyond root pattern:**
- Risk: `.gitignore` only lists `.env.local`. Other common patterns (`.env.development.local`, `.env.production.local`, `.env`) are not covered.
- Files: `.gitignore:3`
- Current mitigation: Only `NEXT_PUBLIC_*` variables are used today (intentionally public).
- Recommendations: Expand to `.env*.local` and `.env` to prevent future leakage if a non-public secret is added.
- Severity: **Low**

---

## Performance Bottlenecks

**No `next/image` usage anywhere:**
- Problem: Codebase imports zero images today, but any future logo/avatar/screenshot will be served via raw `<img>` tags unless conventions are set now.
- Files: All of `app/components/*` (verified — no `next/image` import).
- Cause: No design assets imported yet.
- Improvement path: Establish a rule in `CONVENTIONS.md` that all imagery must use `next/image`. Configure `images.remotePatterns` in `next.config.ts` if any images come from the API.
- Severity: **Low**

**Five sequential blocking `fetch` calls on the home page:**
- Problem: `app/page.tsx:11-17` awaits `Promise.all` of five API calls. While parallelized, all five must complete (or time out via `fetch`'s default ~30s) before the first byte of HTML is sent. There is no streaming via `Suspense`, no per-call timeout, and a slow API would block the entire homepage.
- Files: `app/page.tsx:10-17`, `lib/api.ts:12-22`
- Cause: Server component awaits all data before render.
- Improvement path: Wrap each section in its own `<Suspense fallback>` and stream via React 19 server components. Add an `AbortController` with a 2-3s timeout in `getJson` so a slow API gracefully falls back instead of blocking TTFB.
- Severity: **Medium**

**Heavy Inter font fallback chain without subset/preload:**
- Problem: `globals.css:25` declares `font-family: Inter, system-ui, ...` but Inter is never imported via `next/font` and not present in `public/`. Browsers fall back to `system-ui` immediately — fine — but if the intent was to use Inter, there is no preload, no font-display, and no subset.
- Files: `app/globals.css:25`
- Cause: Font declared but never delivered.
- Improvement path: Either remove `Inter` from the stack or import it via `next/font/google` in `app/layout.tsx` for self-hosted, optimized loading.
- Severity: **Low**

---

## Accessibility Gaps

**No skip-to-content link:**
- Issue: WCAG 2.4.1 — keyboard users cannot bypass the topbar / theme toggle.
- Files: `app/components/homepage.tsx:14-18`
- Impact: Keyboard / screen-reader users tab through the toggle on every page.
- Severity: **Low**
- Fix approach: Add a visually-hidden `<a href="#hero-heading">Skip to content</a>` as the first focusable element.

**Theme toggle button lacks `aria-pressed` / `aria-label`:**
- Issue: The toggle communicates state only via visible text. It has no `aria-pressed` attribute and no `aria-label` describing it as a theme switcher.
- Files: `app/components/theme-toggle.tsx:30-32`
- Impact: Screen readers announce only the literal label text; toggle semantics are lost.
- Severity: **Low**
- Fix approach: Add `aria-pressed={theme === "dark"}` and `aria-label="Toggle dark mode"`.

**Color contrast not audited for `--muted` on `--bg`:**
- Issue: Light theme uses `--muted: #475569` on `--bg: #f8fafc`. Contrast ratio ≈ 7.5:1 (passes), but combinations like `--muted` on `--card` (#fff) at small text need verification, especially for the dark theme `--muted: #94a3b8` on `--card: #0f172a`.
- Files: `app/globals.css:1-17,73-75`
- Impact: Potential WCAG AA failures.
- Severity: **Low**
- Fix approach: Run an automated contrast check (Lighthouse / axe) and adjust tokens.

**`aria-labelledby` used but topbar has no landmark:**
- Issue: All sections are properly labelled via `aria-labelledby`, but the topbar (`app/components/homepage.tsx:15-18`) is a `<header>` without a `role`/`aria-label` — this can collide with `<main>`'s implicit landmark when assistive tech enumerates regions.
- Files: `app/components/homepage.tsx:15-18`
- Impact: Minor screen-reader navigation noise.
- Severity: **Low**
- Fix approach: Either move the `<header>` outside `<main>` or add `aria-label="Site header"`.

---

## SEO Gaps

**`metadataBase` not set — Open Graph / canonical URLs render relative:**
- Issue: `app/layout.tsx:4-13` defines `openGraph` but no `metadataBase`. Next.js will warn at build time and OG image / URL resolution will be unreliable.
- Files: `app/layout.tsx:4-13`
- Impact: Social previews break; canonical URLs are missing.
- Severity: **Medium**
- Fix approach: Add `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")` to root metadata.

**No Open Graph image:**
- Issue: `openGraph` block declares title/description/type but no `images`. There is no `app/opengraph-image.{png,jpg,tsx}` and no `app/twitter-image.*`.
- Files: `app/layout.tsx:8-12`, `public/` (no OG image present)
- Impact: LinkedIn / Twitter / Slack share cards render plain text — bad first impression for recruiters.
- Severity: **Medium**
- Fix approach: Add `app/opengraph-image.tsx` using Next's image generation, sized 1200x630.

**No favicon / `app/icon.*` / web manifest:**
- Issue: `public/` contains only `resume.pdf`. There is no `favicon.ico`, no `app/icon.png`, no `app/apple-icon.png`, no `manifest.json`.
- Files: `public/` listing, `app/` listing
- Impact: Default Next.js favicon shows; no PWA install metadata.
- Severity: **Medium**
- Fix approach: Add `app/icon.png` (32x32+) and `app/apple-icon.png` (180x180); optionally add `app/manifest.ts`.

**No `twitter` metadata block:**
- Issue: `app/layout.tsx` has `openGraph` but no `twitter` block, so Twitter cards fall back to OG (acceptable) but `summary_large_image` is not requested.
- Files: `app/layout.tsx:4-13`
- Severity: **Low**
- Fix approach: Add `twitter: { card: "summary_large_image", ... }`.

**No JSON-LD structured data:**
- Issue: Recruiter-facing portfolios benefit greatly from `Person` / `JobPosting` / `WebSite` JSON-LD for Google rich results. None present.
- Files: `app/layout.tsx`, `app/page.tsx`
- Impact: Misses rich-result eligibility (sitelinks, knowledge panel hints).
- Severity: **Low**
- Fix approach: Add a `<script type="application/ld+json">` block with `Person` schema in `app/page.tsx`.

**`sitemap.ts` only lists the homepage:**
- Issue: `app/sitemap.ts:5-11` returns a single URL. Once `/blog/[slug]` exists, it must be enumerated.
- Files: `app/sitemap.ts:5-11`
- Severity: **Low** (today), **Medium** once blog routes ship
- Fix approach: Iterate posts via `getPosts()` inside `sitemap()` and emit per-slug entries.

**`<html lang="en">` is hardcoded but no `dir`:**
- Issue: Acceptable today (English LTR), but explicitly setting `dir="ltr"` is a small wins for assistive tech.
- Files: `app/layout.tsx:32`
- Severity: **Low**

---

## Fragile Areas

**Silent error swallowing in `getJson`:**
- Files: `lib/api.ts:12-22`
- Why fragile: Any network error, JSON parse error, or non-2xx response collapses to fallback data with zero observability. There is no `console.error`, no telemetry, no `Sentry`. A broken API is invisible.
- Safe modification: Add structured logging behind an env flag, or surface a hidden HTML comment in non-prod builds. Consider `console.error` with the path that failed.
- Test coverage: No tests for `getJson` failure paths.
- Severity: **Medium**

**No revalidation strategy beyond a 300s blanket TTL:**
- Files: `lib/api.ts:14-15`
- Why fragile: Every endpoint shares `revalidate: 300`. Profile updates take 5 minutes to surface; blog posts the same. There is no on-demand `revalidateTag` / `revalidatePath` integration with the upstream API.
- Safe modification: Per-endpoint revalidation values; tag-based revalidation (`{ next: { tags: ["posts"] } }`) and a webhook-driven `app/api/revalidate/route.ts`.
- Severity: **Low**

**Theme inlined as data attribute on `<html>` without React state:**
- Files: `app/layout.tsx:15-24`, `app/components/theme-toggle.tsx:7-9`
- Why fragile: Two independent code paths (the inline script and the React component) mutate `document.documentElement[data-theme]`. Drift is easy if either changes.
- Safe modification: Centralize via a single `lib/theme.ts` shared module or move to a cookie-based theme.
- Severity: **Low**

---

## Test Coverage Gaps

**Single smoke test only:**
- What's not tested: `lib/api.ts` (success and failure paths), `ThemeToggle` interaction (toggling, persistence, localStorage SecurityError), `robots.ts`, `sitemap.ts`, fallback rendering when API returns malformed shapes, accessibility (no axe-core integration).
- Files: only `app/components/homepage.test.tsx` exists (verified via `find`)
- Risk: Refactoring `lib/api.ts` or the theme system will silently break behavior. The existing test only asserts the presence of section headings using fallback data — it does not exercise the API layer.
- Priority: **Medium**
- Fix approach: Add tests for `getJson<T>` (mock `fetch` for ok/non-ok/throws), a `ThemeToggle` interaction test (`userEvent.click`), a `getPosts(limit)` URL-shape test, and integrate `vitest-axe` for accessibility regression.

**No E2E / Playwright tests:**
- What's not tested: Real browser rendering, full page navigation, dark-mode flash, resume download.
- Files: no `playwright.config.*` or `e2e/` directory.
- Risk: SSR/hydration mismatches, font loading regressions, broken `/resume.pdf` download — all invisible to unit tests.
- Priority: **Low** (smoke + Lighthouse may suffice for a portfolio).
- Fix approach: Add Playwright with one happy-path test per route.

**No CI pipeline:**
- What's not tested in CI: Lint, type-check, unit tests, and `next build` are not enforced on PRs.
- Files: no `.github/workflows/` directory (verified).
- Risk: Broken builds reach `main` undetected.
- Priority: **Medium**
- Fix approach: Add `.github/workflows/ci.yml` running `npm run lint`, `tsc --noEmit`, `npm test`, `npm run build` on PRs.

---

## Missing Critical Features

**No `app/error.tsx` / `app/not-found.tsx` / `app/loading.tsx`:**
- Problem: Next.js App Router supports per-segment error and loading boundaries. None exist (verified via `find`).
- Blocks: Unhandled exceptions render Next's default 500 page. 404s from broken `/blog/<slug>` links render Next's default 404. There is no skeleton during streaming.
- Severity: **Medium**
- Fix approach: Create `app/error.tsx`, `app/not-found.tsx`, and per-route `loading.tsx` files.

**No `/blog/[slug]` route despite homepage linking to it:**
- Problem: See "Known Bugs". The blog preview promises content that does not exist.
- Severity: **High** (UX) — already covered above.

**No analytics / observability:**
- Problem: No Vercel Analytics, no Plausible, no Sentry, no PostHog. Cannot answer "did anyone download my resume?" or "did the API fall back?".
- Files: `package.json` (no analytics deps), `app/layout.tsx` (no script tags).
- Severity: **Low**
- Fix approach: Add `@vercel/analytics` (1 line) and `@vercel/speed-insights` for free; wire `Sentry` for error tracking.

---

## Dependencies at Risk

**`eslint@8.57.0` is end-of-life:**
- Risk: ESLint 8 reached EOL in October 2024. Stuck on legacy `.eslintrc.json` config (current code uses the legacy format, see `.eslintrc.json:1-3`); ESLint 9+ moved to flat `eslint.config.js`.
- Impact: No security or rule fixes from upstream; future plugins drop ESLint 8 support.
- Migration plan: Upgrade to ESLint 9 (or 10), migrate `.eslintrc.json` to `eslint.config.js`, bump `eslint-config-next` accordingly.
- Severity: **Medium**

**`next@15.3.2` lags by 12+ patch versions on the 15.x line:**
- Risk: Critical advisories (see Security). Latest 15.x patch is 15.5.15; current major is 16.2.4.
- Impact: Security exposure plus missing bugfixes.
- Migration plan: `npm install next@^15.5` to consume 15.x patches, then plan a Next 16 migration.
- Severity: **High**

**Many dev deps drift behind latest majors:**
- Risk: `@types/node` 22 → 25, `@vitejs/plugin-react` 4 → 6, `vitest` 3 → 4, `jsdom` 26 → 29, `typescript` 5.8 → 6.0. Not urgent but accumulating.
- Impact: Future upgrades become large, painful jumps.
- Migration plan: Stagger upgrades; bump TypeScript and Vitest first since they affect DX.
- Severity: **Low**

**No lockfile-based reproducibility check:**
- Risk: `package-lock.json` is committed (good) but no `npm ci` step in CI / pre-commit.
- Severity: **Low**
- Fix approach: Use `npm ci` in CI workflows.

---

## Other Observations

**Tracked `.DS_Store` candidates:**
- `.DS_Store` exists at the repo root and is not in `.gitignore`. Currently shows as untracked (per `git status`) but should be globally ignored.
- Files: `.gitignore:1-5`
- Severity: **Low**
- Fix approach: Add `.DS_Store` to `.gitignore`.

**`design_handoff_terminal_portfolio/` shipped in repo:**
- A 168KB design handoff folder (with `app.jsx`, `data.js`, screenshots) is committed but not referenced by the build. Increases repo size and confuses future readers about which is the source of truth.
- Files: `design_handoff_terminal_portfolio/`
- Severity: **Low**
- Fix approach: Move to a separate `/design/` repo or add to `.gitignore` if not intended for distribution.

**`tsconfig.json` `target: "ES2017"` is overly conservative:**
- Files: `tsconfig.json:3`
- Why: Next 15 / React 19 require modern Node and modern browsers. ES2017 forces unnecessary down-leveling of `async/await` patterns at the type-checker level.
- Severity: **Low**
- Fix approach: Bump to `ES2022`.

---

*Concerns audit: 2026-05-06*
