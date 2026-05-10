---
phase: 05-seo-accessibility-polish
plan: 02
subsystem: seo
tags: [seo, opengraph, favicon, manifest, next-og, satori, jetbrains-mono, image-response]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-01 Wave 0 — JetBrains Mono Bold + Medium TTFs in assets/, scripts/check-og-files.mjs scaffold (fail-loud until this plan ships)"
  - phase: 02-shell
    provides: "lib/routes.ts ROUTES array — read-only single source of truth for per-route OG label substitution"
  - phase: 01-foundation
    provides: "app/sitemap.ts + app/robots.ts (file-convention RSC stylistic precedent)"
provides:
  - "32x32 favicon rendered as next/og ImageResponse from app/icon.tsx (the `>_` glyph)"
  - "180x180 apple-touch icon from app/apple-icon.tsx (one visual source with the favicon)"
  - "Web App Manifest at app/manifest.ts — minimal D-14 shape with display: browser, theme_color = #0a0c0b, icons:[] (Next.js auto-includes app/icon + app/apple-icon)"
  - "8 opengraph-image.tsx files (root + 7 routes) rendering 1200x630 PNG cards via next/og"
  - "Each OG card substitutes route.label from lib/routes.ts: about.md, projects/, stack.json, experience.log, writing/, contact.sh, shipped.app"
  - "scripts/check-og-files.mjs flips green (was fail-loud after Plan 05-01); SEO-03 + SEO-04 source-level smoke gates green"
affects: [05-03, 05-08]

# Tech tracking
tech-stack:
  added:
    - "next/og ImageResponse runtime — first use in repo (Pattern 1/2/3 from RESEARCH §Architecture Patterns)"
    - "node:fs/promises readFile for build-time font binary loading from assets/ (Pitfall 4)"
  patterns:
    - "Pattern: next/og ImageResponse RSC files — inline hex constants only (Pitfall 1: Satori doesn't resolve var(--*)); display:flex on every container (Pitfall 2: Satori only supports flex|block|none)"
    - "Pattern: Font-buffer load — readFile(join(process.cwd(), 'assets/JetBrainsMono-{Bold,Medium}.ttf')) inside the default async export (assets/ vs public/ separation enforces T-05-05)"
    - "Pattern: Per-route OG via N separate files (clarity > DRY in v1) — 8 sibling opengraph-image.tsx files, each with its own ROUTE_LABEL constant. RESEARCH Open Question 1 disposition."
    - "Pattern: Favicon + apple-touch share one visual source (D-13) — same JSX shape, only size + fontSize differ between app/icon.tsx (32px) and app/apple-icon.tsx (180px)"
    - "Pattern: Web App Manifest minimal shape — icons:[] empty (Pitfall 12: Next.js auto-includes from app/icon.tsx + app/apple-icon.tsx); display:browser locked (D-14, T-05-09)"

key-files:
  created:
    - "app/icon.tsx (32x32 favicon — `>_` glyph in matrix accent on panel bg)"
    - "app/apple-icon.tsx (180x180 apple-touch icon — same glyph, scaled fontSize 96)"
    - "app/manifest.ts (Web App Manifest, MetadataRoute.Manifest)"
    - "app/opengraph-image.tsx (root OG — about.md label)"
    - "app/(terminal)/opengraph-image.tsx (route group OG — about.md label)"
    - "app/(terminal)/projects/opengraph-image.tsx (projects/ label)"
    - "app/(terminal)/stack/opengraph-image.tsx (stack.json label)"
    - "app/(terminal)/experience/opengraph-image.tsx (experience.log label)"
    - "app/(terminal)/writing/opengraph-image.tsx (writing/ label)"
    - "app/(terminal)/contact/opengraph-image.tsx (contact.sh label)"
    - "app/(terminal)/shipped/opengraph-image.tsx (shipped.app label)"
  modified: []

key-decisions:
  - "8 sibling OG files (not a shared helper) — clarity over DRY in v1 per RESEARCH Open Question 1; per-route diff is one ROUTE_LABEL constant + one alt suffix. Consolidation is a v1.1 candidate if the template diverges per route."
  - "Root opengraph-image.tsx and route-group (terminal)/opengraph-image.tsx both render about.md — root is the homepage default; route-group covers the about route (`/`) explicitly. Next.js metadata composition picks the most-specific match; both are intentionally identical (D-01 simplicity)."
  - "Edited the manifest.ts top-comment from `no service worker` to `no offline runtime` to avoid a regex-self-match against `! grep -q 'service.worker'` in the verify block. Intent unchanged (no PWA, no SW); the comment is now non-self-referential."
  - "All 11 RSC files use inline-style props with hardcoded hex constants. This is the only place in the codebase where inline styles are mandated, because next/og's Satori runtime does not consume external CSS or CSS variables."

patterns-established:
  - "Pattern: First next/og use in repo — sets the model Plan 05-03 (viewport.themeColor) and any future image-response files inherit (font binaries from assets/, inline hex, display:flex everywhere)."
  - "Pattern: Wave 0 fail-loud → Wave 1+ flips green — scripts/check-og-files.mjs was scaffolded in Plan 05-01 to fail until this plan shipped; no script edits needed for it to flip green. Same model will apply to scripts/check-reduced-motion.mjs (Plan 05-03), scripts/check-head-comment.mjs (Plan 05-05)."

requirements-completed: [SEO-03, SEO-04]

# Metrics
duration: 4m
completed: 2026-05-10
---

# Phase 5 Plan 02: Wave 1 Branch A — OG Cards, Favicon Set, Manifest Summary

**8 next/og opengraph-image.tsx files (root + 7 routes) rendering 1200x630 PNG cards from JetBrains Mono Bold/Medium TTFs, plus 32x32 favicon + 180x180 apple-touch icon sharing one `>_` glyph source, plus a minimal Web App Manifest with display:browser locked.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-10T16:04:24Z
- **Completed:** 2026-05-10T16:07:57Z
- **Tasks:** 3 (all autonomous)
- **Files created:** 11 (8 OG + 1 favicon + 1 apple-icon + 1 manifest)
- **Files modified:** 0

## Accomplishments

- All 11 next/og file-convention RSCs ship: app/icon.tsx, app/apple-icon.tsx, app/manifest.ts, root app/opengraph-image.tsx, and 7 per-route variants under app/(terminal)/<view>/opengraph-image.tsx.
- `scripts/check-og-files.mjs` flips from FAIL (intentional fail-loud since Plan 05-01) to PASS — the Wave 0 contract holds.
- `npm run build` exits 0 with all OG / icon / manifest endpoints emitted as static routes (`/icon`, `/apple-icon`, `/manifest.webmanifest`, `/opengraph-image`, plus 7 per-route hashed OG image routes). 23 static pages built in total.
- Every container in every OG/icon file uses `display: "flex"` (Pitfall 2 — Satori requirement). Zero `var(--*)` (Pitfall 1) or `display: "grid"` regressions.
- All 11 files load JetBrains Mono via `readFile(join(process.cwd(), "assets/JetBrainsMono-{Bold,Medium}.ttf"))` — never via `next/font/google`. T-05-05 (font binaries off public surface) intact.
- Vitest stays at 26 files / 101 tests green; TypeScript clean (`npx tsc --noEmit` exits 0); INFRA-05 postbuild placeholder grep stays clean.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create app/icon.tsx + app/apple-icon.tsx (favicon glyph)** — `2e4f5de` (feat)
2. **Task 2: Create app/manifest.ts (Web App Manifest)** — `b784f5c` (feat)
3. **Task 3: Create 8 opengraph-image.tsx files** — `7bc39c6` (feat)

## Files Created/Modified

**Created (11):**

- `app/icon.tsx` — 32x32 favicon. ImageResponse renders `>_` in JetBrains Mono Bold (700, 18px) on `#0d100f` panel with `#22c55e` matrix accent.
- `app/apple-icon.tsx` — 180x180 apple-touch icon. Same JSX shape; `fontSize: 96`. One visual source with app/icon.tsx (D-13).
- `app/manifest.ts` — Minimal MetadataRoute.Manifest. `display: "browser"`, `theme_color: "#0a0c0b"`, `background_color: "#0a0c0b"`, `icons: []` (Next.js auto-includes from app/icon.tsx + app/apple-icon.tsx per Pitfall 12).
- `app/opengraph-image.tsx` — Root OG, 1200x630, route label `about.md`. Renders the pure-text card layout from D-01: top-half name (60/700) + role (28/500 muted), bottom 8x24 matrix block + path (32/500 accent).
- `app/(terminal)/opengraph-image.tsx` — Route-group OG, identical content to root (about route landing).
- `app/(terminal)/projects/opengraph-image.tsx` — `projects/` label.
- `app/(terminal)/stack/opengraph-image.tsx` — `stack.json` label.
- `app/(terminal)/experience/opengraph-image.tsx` — `experience.log` label.
- `app/(terminal)/writing/opengraph-image.tsx` — `writing/` label.
- `app/(terminal)/contact/opengraph-image.tsx` — `contact.sh` label.
- `app/(terminal)/shipped/opengraph-image.tsx` — `shipped.app` label.

**Modified:** None — file ownership was exclusive per the plan's parallel-safety contract with Plan 05-03 (which owns app/layout.tsx, app/globals.css, app/layout.test.tsx) and Plan 05-04 (about-view socials).

## Decisions Made

- **8 sibling OG files (not a shared helper).** RESEARCH Open Question 1 recommended duplication for v1 clarity; per-route diff is one `ROUTE_LABEL` constant + one `alt` suffix. Consolidation is a v1.1 candidate if the template starts to diverge by route. The current cost is ~75 lines × 8 = ~600 lines; the saving from a helper would be marginal at the cost of obfuscating the file-convention contract.
- **Root + route-group OGs both render `about.md`.** Next.js metadata composition matches the most-specific OG file at request time; the root OG handles homepage default, the route-group OG handles the about route (`/`) explicitly. Both rendering the same content is intentional (D-01 simplicity) — viewers landing on either path see the identical card.
- **Favicon + apple-touch icon share one visual source.** Both files load `assets/JetBrainsMono-Bold.ttf`, render `{">_"}` on `#0d100f`, accent `#22c55e`. Only `size`, `fontSize`, and the comment header differ. D-13 is enforced by file-level convention rather than a shared helper (per RESEARCH Pattern 2).
- **Comment edit in manifest.ts to avoid a self-referential regex match.** The plan's `<verify>` block included `! grep -q 'service.worker'` to ensure no service-worker code shipped, but my initial top-comment said "no service worker" — `service.worker` matched as `service<any-char>worker`. Replaced the prose with "no offline runtime"; intent unchanged, regex match resolved. (This is a Rule-3-class blocking-fix-of-my-own-text rather than a real deviation; logging for transparency.)

## Deviations from Plan

None — plan executed exactly as written. The only adjustment was a self-correction: my initial top-comment in manifest.ts contained the literal substring "service worker" which would have matched the verify block's `! grep -q 'service.worker'` check. Edited the comment to "no offline runtime" before committing. The plan's intent (no PWA push, no SW) is preserved; this was a wording fix, not a contract change.

## Issues Encountered

- None. All three tasks compiled, type-checked, tested, and built on the first attempt. The only iteration was the manifest.ts comment-rewording noted above.

## Threat Flags

None — this plan operates entirely within the threat surface analyzed in 05-02-PLAN.md `<threat_model>`:

- T-05-05 (font binary disclosure): MITIGATED. All 11 files load TTFs via `readFile(join(process.cwd(), "assets/..."))` — no `public/JetBrainsMono*` references. `grep -RE 'public/JetBrainsMono' app/ → 0 lines`.
- T-05-06 (Satori CSS-subset misuse): MITIGATED. Every container in every file passed `! grep -q 'display: "grid"'` and `! grep -q 'var(--'`. Verified 8 OG files + 2 icon files in the per-file loop.
- T-05-07 (Manifest icons[] auto-population): ACCEPTED. `icons: []` empty per Pitfall 12; Next.js auto-includes from app/icon.tsx + app/apple-icon.tsx. The shipped icons display a generated `>_` glyph, no PII.
- T-05-08 (OG render-time visual fidelity): ACCEPTED — manual gate deferred to Plan 05-08 (Slack/LinkedIn unfurl) or Phase 7 production check.
- T-05-09 (Display mode standalone push): MITIGATED. `! grep -q 'standalone' app/manifest.ts` returns 0; `display: "browser"` locked.

No new public route surface, no new auth paths, no new schema changes. The OG / icon / manifest endpoints are static-rendered build-time outputs — no runtime user input flows through them.

## User Setup Required

None — no external service configuration required. The OG card content is fully deterministic from `lib/routes.ts` `ROUTES.label` + the inline name/role strings.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `app/icon.tsx`
- FOUND: `app/apple-icon.tsx`
- FOUND: `app/manifest.ts`
- FOUND: `app/opengraph-image.tsx`
- FOUND: `app/(terminal)/opengraph-image.tsx`
- FOUND: `app/(terminal)/projects/opengraph-image.tsx`
- FOUND: `app/(terminal)/stack/opengraph-image.tsx`
- FOUND: `app/(terminal)/experience/opengraph-image.tsx`
- FOUND: `app/(terminal)/writing/opengraph-image.tsx`
- FOUND: `app/(terminal)/contact/opengraph-image.tsx`
- FOUND: `app/(terminal)/shipped/opengraph-image.tsx`

Verified commits exist:

- FOUND: `2e4f5de` feat(05-02): add favicon + apple-touch icon as next/og ImageResponse
- FOUND: `b784f5c` feat(05-02): add minimal Web App Manifest at app/manifest.ts
- FOUND: `7bc39c6` feat(05-02): add 8 per-route opengraph-image cards (SEO-03)

Verified gates:

- `node scripts/check-og-files.mjs` exits 0 (8/8 OG files present)
- `npx tsc --noEmit` exits 0 (TypeScript clean across 11 new files)
- `npm test` returns 26 files / 101 tests green (no regressions)
- `npm run build` exits 0 (23 static pages, all OG/icon/manifest endpoints emitted)
- `grep -RE 'var\(--' app/icon.tsx app/apple-icon.tsx 'app/(terminal)/'**/opengraph-image.tsx` returns 0 (Pitfall 1 clean)
- `grep -RE 'display:\s*"grid"' app/icon.tsx app/apple-icon.tsx 'app/(terminal)/'**/opengraph-image.tsx` returns 0 (Pitfall 2 clean)
- `grep -RE 'next/font/google' app/icon.tsx app/apple-icon.tsx app/opengraph-image.tsx 'app/(terminal)/'**/opengraph-image.tsx` returns 0 (Pitfall 4 clean)

## Next Phase Readiness

Wave 1 Branch A complete. Plan 05-03 (Wave 1 Branch B — Twitter card metadata + viewport.themeColor + reduced-motion CSS reset) can begin immediately and operates on disjoint files (app/layout.tsx, app/globals.css, app/layout.test.tsx). No coordination needed.

Plan 05-04 (Wave 2 — about-socials carry-forward) is also unblocked by this completion (its dependencies are existing Phase 3 components, not Wave 1 outputs).

Plan 05-08 (Wave 5 — manual OG/Slack/LinkedIn unfurl visual gate) inherits the source-level confidence from this plan: the 8 PNG endpoints render at build time with deterministic content; the only remaining check is third-party scraper visual fidelity (gated to Phase 7 production unless reviewer requests an ngrok-tunnel local check).

No blockers for Wave 1 Branch B or Wave 2.

---
*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
