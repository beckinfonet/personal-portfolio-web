---
phase: 05-seo-accessibility-polish
plan: 05
subsystem: seo + dev-easter-egg

tags: [seo, json-ld, schema-org, easter-egg, inline-script, xss-defense, rsc, view-source]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-01 Wave 0 — lib/json-ld.test.ts + app/components/shell/json-ld-person.test.tsx scaffolds + scripts/check-head-comment.mjs fail-loud smoke + next/font/google mock in vitest.setup.ts"
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-03 Wave 1B — app/layout.tsx with twitter metadata + separate viewport export (settles <head> shape so Plan 05-05 can add 2 children without merge conflicts)"
  - phase: 02-shell
    provides: "AccentBootstrapScript pattern (RSC inline-script via dangerouslySetInnerHTML) — JsonLdPerson + HeadComment use the same model"
provides:
  - "lib/json-ld.ts: pure helper module — exports PersonSchema (interface), buildPersonSchema(profile, siteUrl), filterValidUrls(profile). 10 vitest assertions covering filter (4) + builder (6). XSS escape deferred to JSX emitter (separation of concerns)."
  - "app/components/shell/json-ld-person.tsx: RSC inline JSON-LD emitter — <script type='application/ld+json'> with sanitized payload (T-05-16 mitigation: JSON.stringify(...).replace(/</g, '\\\\u003c')). 6 vitest assertions including the 'innerHTML must NOT match /</' XSS invariant."
  - "app/components/shell/head-comment.tsx: RSC view-source: easter egg — <noscript dangerouslySetInnerHTML> emits a 6-line lowercase letter (DEV-02 / D-27). scripts/check-head-comment.mjs flips FAIL→PASS (3rd of 4 fail-loud scripts to flip)."
  - "app/layout.tsx <head>: HeadComment + JsonLdPerson mounted as siblings to AccentBootstrapScript. 2 new layout.test.tsx assertions verify mount points via renderToStaticMarkup (10 total: 8 from Plan 05-03 + 2 new)."
affects: [05-08]

# Tech tracking
tech-stack:
  added:
    - "react-dom/server.renderToStaticMarkup — used in app/layout.test.tsx to serialize the RootLayout JSX tree to an HTML string (RTL refuses to mount <html> into a <div> container; SSR-string is the standard workaround)"
  patterns:
    - "Pattern: lib helper as pure transform — lib/json-ld.ts exports two named functions + one type interface, no side effects, no env access (siteUrl passed as arg). Mirrors lib/uptime.ts shape."
    - "Pattern: RSC inline-script via dangerouslySetInnerHTML — JsonLdPerson + HeadComment both extend the AccentBootstrapScript precedent. The host element changes (<script type='application/ld+json'> for JSON-LD, <noscript> for HTML comment) but the dangerouslySetInnerHTML model is identical."
    - "Pattern: XSS defense via /</ → \\u003c replacement — JSON.stringify does NOT escape <; without the replacement, an attacker-controlled string in PROFILE could inject '</script>' and break out of the JSON-LD container. Two-layer defense: source-level grep + vitest 'innerHTML.not.toMatch(/</) assertion."
    - "Pattern: Wave 0 fail-loud → Wave 2 flips green — scripts/check-head-comment.mjs is the 3rd of 4 fail-loud smoke scripts to flip green this phase (after check-og-files in Plan 05-02 and check-reduced-motion in Plan 05-03). Only check-headers remains, but it already passes (Phase 1 wired x-built-with)."
    - "Pattern: Test-via-renderToStaticMarkup when the JSX root is <html> — RTL render() refuses to mount <html> into its default <div> container ('In HTML, <html> cannot be a child of <div>'). renderToStaticMarkup serializes the tree to a string; assertions become regex matches over the serialized HTML. Same contract — '<JsonLdPerson /> + <HeadComment /> are mounted in <head>' — different inspection surface."

key-files:
  created:
    - "lib/json-ld.ts (47 lines — PersonSchema interface + buildPersonSchema(profile, siteUrl) + filterValidUrls(profile); pure helpers, no side effects)"
    - "app/components/shell/json-ld-person.tsx (22 lines — RSC inline JSON-LD emitter with /</ → \\u003c XSS escape; reads PROFILE + buildPersonSchema)"
    - "app/components/shell/head-comment.tsx (21 lines — RSC <noscript> host emitting the 6-line lowercase letter via dangerouslySetInnerHTML)"
  modified:
    - "lib/json-ld.test.ts (+121/-4 — replaced Wave 0 sentinel with 10 real assertions: 4 filterValidUrls + 6 buildPersonSchema; fixtureProfile + social helpers)"
    - "app/components/shell/json-ld-person.test.tsx (+49/-6 — replaced Wave 0 sentinel with 6 real assertions: <script> element / type=application/ld+json / valid JSON / @type Person + @context schema.org / D-08 keys / XSS-escape invariant)"
    - "app/layout.tsx (+5 lines — 2 imports, 2 JSX children + 2 comment lines inside the existing <head> block)"
    - "app/layout.test.tsx (+34 lines — 1 import (renderToStaticMarkup), 1 default import (RootLayout), 1 new describe block with 2 assertions covering JsonLdPerson + HeadComment mount points)"

key-decisions:
  - "Test approach for layout.tsx mount points uses renderToStaticMarkup (NOT @testing-library/react render). RTL refuses to mount <html> into its default <div> container (warning: 'In HTML, <html> cannot be a child of <div>') and produces null queries against <head> children. renderToStaticMarkup serializes the JSX tree to an HTML string; same contract verified with regex over the string — '<head>...<script type=\"application/ld+json\">...</head>' and '<head>...<noscript>...</head>' patterns plus 'hello, you found the source' substring. Logged as Rule 3 self-correction (the plan's <action> block specified RTL render(<RootLayout>) without anticipating this jsdom constraint)."
  - "lib/json-ld.ts emits the schema unsanitized; the < → \\u003c XSS escape lives ONLY in the JSX emitter (json-ld-person.tsx). Separation of concerns: the lib helper produces a typed object; the emitter handles HTML-escaping for inline-script safety. Rationale (per plan §<action>): if the lib pre-sanitized, callers who serialize for non-script contexts (future API endpoints, structured logs) would get over-escaped output. The current call site is the only one that needs the escape; the lib stays pure."
  - "filterValidUrls regex is /^https?:\\/\\// (case-sensitive). lowercase 'todo:' sentinels get filtered as a side effect of failing the http(s) prefix check; the function does not look for 'todo' or 'TODO' explicitly — that would couple the schema builder to placeholder semantics. The build-level INFRA-05 grep enforces no-uppercase-TODO; this filter just guarantees only valid http(s) URLs reach sameAs."
  - "Combined Task 4 layout.tsx production edit + layout.test.tsx test extension into a single GREEN commit (4aacb60). The plan's Task 4 <action> intentionally does NOT mark itself tdd='true', but I followed the same RED→GREEN pattern: extended the test first (8 passed + 2 RED), then added the mounts (8 + 2 GREEN). The RED state was visible in the build log only — not committed separately — because Task 4 is type='auto' (not type='auto' tdd='true'). Standard for non-TDD tasks; the commit message documents the test-then-implement sequence."

patterns-established:
  - "Pattern: renderToStaticMarkup for layout-level <head>/<body> shape assertions — first instance lives in app/layout.test.tsx; precedent for any future layout test that needs to verify children of <html>/<head>/<body> without RTL's <div>-container constraint."
  - "Pattern: Two-layer XSS defense for inline JSON-LD — source-level grep (`grep -q 'replace(/</g, \"\\\\\\\\u003c\")'`) verifies the escape exists; vitest assertion `expect(script.innerHTML).not.toMatch(/</)` verifies the escape works at render time. Both must be green for T-05-16 to be considered mitigated."

requirements-completed: [SEO-02, DEV-02]

# Metrics
duration: 4m 49s
completed: 2026-05-10
---

# Phase 5 Plan 05: Wave 2 — Person JSON-LD + HTML head comment + mounts in app/layout.tsx Summary

**3 new RSC files (lib/json-ld.ts pure helper + JsonLdPerson script emitter + HeadComment <noscript> host) plus 2 modified files (app/layout.tsx mounts both in <head>; app/layout.test.tsx adds 2 mount-point assertions via renderToStaticMarkup) — ships SEO-02 (schema.org Person on every route) and DEV-02 (6-line lowercase view-source: letter). XSS-safe inline JSON-LD with two-layer defense (source-grep + vitest `not.toMatch(/</)` invariant). 16 new vitest assertions across 3 files; total 26/129 green (was 26/113).**

## Performance

- **Duration:** ~4m 49s
- **Started:** 2026-05-10T16:33:06Z
- **Completed:** 2026-05-10T16:37:55Z
- **Tasks:** 4 (Tasks 1+2 TDD with explicit RED commits; Task 3 + Task 4 autonomous)
- **Files created:** 3 (lib/json-ld.ts, app/components/shell/json-ld-person.tsx, app/components/shell/head-comment.tsx)
- **Files modified:** 4 (lib/json-ld.test.ts, app/components/shell/json-ld-person.test.tsx, app/layout.tsx, app/layout.test.tsx)

## Accomplishments

- **lib/json-ld.ts** — pure helper module ships with 3 exports: `PersonSchema` (interface), `buildPersonSchema(profile, siteUrl)` (D-08 builder), `filterValidUrls(profile)` (D-09 sameAs filter). No side effects, no environment access (siteUrl passed as arg). XSS escape deliberately deferred to the JSX emitter (separation of concerns: builder produces typed object; emitter handles HTML-escaping).
- **lib/json-ld.test.ts** — 10 assertions: 4 cover `filterValidUrls` (http(s) include, exclude non-http(s) protocols including mailto:/javascript:/ftp:, empty array, lowercase 'todo:' sentinel filter); 6 cover `buildPersonSchema` (@context schema.org, @type Person, name verbatim, role→jobTitle, email passthrough, siteUrl arg→schema.url, sameAs is filterValidUrls result).
- **app/components/shell/json-ld-person.tsx** — RSC inline-script emitter (parallels AccentBootstrapScript pattern). Reads PROFILE + buildPersonSchema, applies the critical `JSON.stringify(...).replace(/</g, '\\u003c')` XSS escape (Pitfall 6), emits `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }}>`. Same `||` env-var pattern as `app/layout.tsx` siteUrl (logical OR — empty-string env vars bypass `??`).
- **app/components/shell/json-ld-person.test.tsx** — 6 assertions: renders `<script>` element / `type='application/ld+json'` / `innerHTML` is valid JSON (parseable) / parsed payload has `@type=Person` + `@context=schema.org` / parsed payload has D-08 keys (name, jobTitle, url, email, sameAs[]) / **innerHTML must NOT match /</** (T-05-16 XSS-escape invariant).
- **app/components/shell/head-comment.tsx** — RSC `<noscript dangerouslySetInnerHTML>` host emits the 6 canonical lowercase lines (D-27): `hello, you found the source.` / `i build with: typescript, react, nextjs, swift, aws.` / `open to: senior engineering roles, ai/agentic systems, mobile.` / `reach: beckprograms@gmail.com` / `github: beckinfonet` / `thanks for looking. — bakytbek`. Typographic em-dash `—` (NOT `--`) before `bakytbek`. All-lowercase prose (Pitfall 9 — INFRA-05 grep is case-sensitive on `/TODO/`).
- **app/layout.tsx** — 2 imports added (HeadComment, JsonLdPerson, alphabetically clustered with AccentBootstrapScript). 2 JSX children added inside the existing `<head>` block, with explanatory comments. Order locked: AccentBootstrapScript (must run before paint) → HeadComment (cosmetic, no execution) → JsonLdPerson (data, search-engine consumption only).
- **app/layout.test.tsx** — 1 new `describe` block with 2 assertions covering the `<head>` mount points. Test approach uses `renderToStaticMarkup` from `react-dom/server` (NOT `@testing-library/react render`) because RTL refuses to mount `<html>` into a `<div>` container — Rule 3 fix documented under "Deviations".
- **scripts/check-head-comment.mjs** — flips from FAIL (intentional fail-loud since Plan 05-01 Wave 0) to PASS. 3rd of 4 fail-loud smoke scripts to flip green this phase.
- All gates green: vitest 26/129 (was 26/113 — added 16 new assertions across 3 files); `npm run build` exits 0 with 24 static pages including `/icon`, `/manifest.webmanifest`, 8 OG cards; `npm run lint` clean; `npx tsc --noEmit` clean; `npm run check:mobile` clean (3 audit scripts unaffected); postbuild `scripts/check-placeholders.mjs` reports `INFRA-05: .next/server/ clean`.

## Task Commits

Each task committed atomically; Tasks 1 + 2 followed the TDD RED → GREEN sequence (`tdd="true"` on the plan); Tasks 3 + 4 were `type="auto"` (no separate RED commit, but Task 4 followed test-then-implement internally).

1. **Task 1 RED: failing buildPersonSchema + filterValidUrls assertions** — `4dfd9f8` (test)
2. **Task 1 GREEN: lib/json-ld.ts pure helpers** — `c07702b` (feat)
3. **Task 2 RED: failing JsonLdPerson script-emission + XSS-escape assertions** — `e5298c1` (test)
4. **Task 2 GREEN: JsonLdPerson RSC** — `c7eb4d2` (feat)
5. **Task 3: HeadComment RSC for view-source: easter egg** — `c5bebe0` (feat)
6. **Task 4: mount HeadComment + JsonLdPerson in app/layout.tsx <head>** — `4aacb60` (feat)

## Files Created/Modified

**Created:**

- `lib/json-ld.ts` — 47 lines. Exports `PersonSchema` interface (`@context: 'https://schema.org'` + `@type: 'Person'` + name/jobTitle/url/email + sameAs string[]), `buildPersonSchema(profile, siteUrl): PersonSchema`, `filterValidUrls(profile): string[]` (regex `/^https?:\/\//`). No `"use client"`, no env access, no side effects.
- `app/components/shell/json-ld-person.tsx` — 22 lines. RSC. Reads `PROFILE` from `lib/portfolio-data` and `buildPersonSchema` from `lib/json-ld`. Applies `JSON.stringify(schema).replace(/</g, "\\u003c")` (XSS escape). Emits `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }}>`.
- `app/components/shell/head-comment.tsx` — 21 lines. RSC. Module-level `HEAD_COMMENT` constant holds the literal `<!-- ... -->` 6-line letter. Emits `<noscript dangerouslySetInnerHTML={{ __html: HEAD_COMMENT }} />`.

**Modified:**

- `lib/json-ld.test.ts` — replaced 8-line Wave 0 sentinel with 121-line real test suite. Two `describe` blocks (`filterValidUrls` + `buildPersonSchema`); `fixtureProfile` + `social` helpers for hermetic test data. Net: +121/-4.
- `app/components/shell/json-ld-person.test.tsx` — replaced 10-line Wave 0 sentinel with 49-line real test suite. Single `describe` block, 6 assertions including the XSS-escape invariant. Net: +49/-6.
- `app/layout.tsx` — added 2 imports + 2 JSX children + 2 comment lines inside the existing `<head>` block. Net: +5.
- `app/layout.test.tsx` — added 1 import (`renderToStaticMarkup`), 1 default import (`RootLayout`), 1 new `describe` block with 2 assertions. Net: +34.

## Decisions Made

- **Test approach for layout.tsx mount points uses `renderToStaticMarkup` (NOT RTL render).** Initial implementation followed the plan's `<action>` block verbatim — `render(<RootLayout>...</RootLayout>)` from `@testing-library/react` and `container.querySelector('script[type="application/ld+json"]')`. Both new tests failed with `expected null not to be null`, with stderr `In HTML, <html> cannot be a child of <div>. This will cause a hydration error.` RTL's default container is a `<div>`, and React refuses to mount `<html>` into it; the children of `<head>` never appear in the queried DOM. Switched to `renderToStaticMarkup` from `react-dom/server`: serializes the JSX tree to an HTML string; assertions become regex matches (`/<head>[\s\S]*<script type="application\/ld\+json"[\s\S]*<\/head>/` + `/<head>[\s\S]*<noscript>[\s\S]*<\/head>/` + `expect(html).toContain("hello, you found the source")`). Same contract verified — JsonLdPerson + HeadComment ARE inside `<head>` — different inspection surface (string vs DOM). Logged as Rule 3 self-correction below.
- **lib/json-ld.ts emits unsanitized schema; the XSS escape lives ONLY in the JSX emitter.** The plan calls this out explicitly (`<action>` block: "DO NOT apply the `<` → `<` escape here (responsibility belongs to the JSX emitter in Task 2)"). Rationale: separation of concerns. If the lib pre-sanitized, callers who serialize for non-script contexts (future API endpoints, structured logs) would get over-escaped output (`<` in JSON payloads where it isn't needed). The current single call site (json-ld-person.tsx) applies the escape; the lib stays pure.
- **`filterValidUrls` regex is `/^https?:\/\//` (no special-cased TODO/sentinel string).** The function tests for valid http(s) prefix; lowercase `todo:` sentinels get filtered as a side effect of failing the prefix check. Coupling the schema builder to placeholder semantics ("treat any string starting with `todo:` as invalid") would create a leaky abstraction; the build-level INFRA-05 grep already enforces no-uppercase-TODO. The filter just guarantees only valid http(s) URLs reach `sameAs`.
- **Combined Task 4 layout.tsx + layout.test.tsx into a single commit (`4aacb60`).** Task 4 is `type="auto"` (not `tdd="true"`), so no separate RED commit was required. Internally I followed the same test-then-implement pattern: extended the test first (8 pass + 2 RED with the renderToStaticMarkup approach already wired), then added the layout.tsx mounts (8 + 2 GREEN). The commit message documents this sequence; the RED→GREEN flow for Task 4 is implicit in the diff but not in the git log. Standard for non-TDD tasks.
- **Order of `<head>` children: AccentBootstrap → HeadComment → JsonLdPerson.** Plan's `<action>` block is order-independent for HeadComment and JsonLdPerson (per RESEARCH Pattern 4 wisdom), but explicit ordering documents intent: AccentBootstrap MUST run before paint (sets `--accent-hue` on `<html>`); HeadComment is cosmetic (`<noscript>` is inert); JsonLdPerson is search-engine data (no execution). Inline JSX comments lock the rationale.
- **Preserved the plan's `<` → `<` literal-source-byte convention.** The escape sequence in source is `replace(/</g, "\\u003c")` — backslash-u-zero-zero-three-c, which renders as the 6-character JSON escape sequence `<` in the emitted `<script>` content. Browsers parse `<` as the JSON escape for `<` (0x3C), so the literal `<` character never appears in the script body — search engines that JSON.parse the content see `<` (correct), but the HTML parser scanning for `</script>` never finds an early-close. Verified by both the source-level grep and the vitest `not.toMatch(/</)` assertion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test approach for `<head>` mount points uses `renderToStaticMarkup` instead of RTL `render`**

- **Found during:** Task 4 GREEN verification (initial vitest run after wiring the layout.tsx mounts produced 2 failures: both new mount-point assertions returned null queries, with stderr `In HTML, <html> cannot be a child of <div>. This will cause a hydration error.`).
- **Issue:** The plan's Task 4 `<action>` block specified `render(<RootLayout>...</RootLayout>)` from `@testing-library/react`, then `container.querySelector('script[type="application/ld+json"]')`. RTL's default container is a `<div>`; React refuses to mount `<html>` into a non-document parent and silently strips the `<head>` children from the queryable container. The plan's example code is technically syntactically valid — but the assertion path it specifies cannot pass under jsdom + RTL when the component-under-test is a RootLayout that returns `<html>...</html>`.
- **Fix:** Imported `renderToStaticMarkup` from `react-dom/server`; serialized the JSX tree to an HTML string via `renderToStaticMarkup(<RootLayout>...</RootLayout>)`; replaced the DOM-query assertions with regex matches over the string (`/<head>[\s\S]*<script type="application\/ld\+json"[\s\S]*<\/head>/` + `/<head>[\s\S]*<noscript>[\s\S]*<\/head>/` + `expect(html).toContain("hello, you found the source")`). Same contract verified — both components ARE inside `<head>` — different inspection surface (SSR string vs DOM).
- **Files modified:** `app/layout.test.tsx` (test-implementation only; no production code change). The `RootLayout` default-import + `renderToStaticMarkup` named-import joined the existing `metadata, viewport` named-import block.
- **Verification:** All 10 layout.test.tsx assertions pass after the fix. Inline comment in the test documents the rationale ("RTL refuses to mount that into a <div> container").
- **Committed in:** `4aacb60` (Task 4 GREEN; the test-approach change landed in the same commit as the production code because they form one logical unit — the test contract is "<JsonLdPerson /> + <HeadComment /> mounted in <head>" regardless of inspection mechanism).

---

**Total deviations:** 1 auto-fixed (1 Rule 3 self-correction inside Task 4; the plan's example code did not anticipate jsdom + RTL's `<div>`-container constraint when rendering a `<html>`-rooted layout).

**Impact on plan:** None on contract. The contract is "<head> contains <JsonLdPerson /> + <HeadComment />" — verified equivalently via SSR string regex. Same self-correction class as Plan 05-03's viewport-comment rewording (plan's example violated its own acceptance criteria) and Plan 05-04's test-locator scoping fix (plan's tests didn't account for aria-label collision). Plan author intent was preserved — only the inspection mechanism changed.

## Issues Encountered

- **None blocking.** All gates green on the first iteration after the test-approach self-correction. Build, vitest, lint, typecheck, smoke scripts, check:mobile, and postbuild placeholder grep all pass.

## Threat Flags

None — this plan operates entirely within the threat surface analyzed in 05-05-PLAN.md `<threat_model>`:

- **T-05-16 (Tampering / Elevation of Privilege — JSON-LD <script> tag breakout):** MITIGATED via two-layer defense. Source-level grep `grep -q 'replace(/</g, "\\\\u003c")' app/components/shell/json-ld-person.tsx` returns 0 (escape is in source). Render-time vitest assertion `expect(script.innerHTML).not.toMatch(/</)` is green (escape works on the rendered output). Both layers required for the threat to be considered mitigated.
- **T-05-17 (Information Disclosure — sameAs leaking sentinel URLs):** MITIGATED. `filterValidUrls` regex `/^https?:\/\//` excludes any non-http(s) URL; tested with mailto:, javascript:, ftp:, lowercase 'todo:' fixtures across 4 vitest assertions.
- **T-05-18 (Spoofing — CSP class for new inline `<script>`):** ACCEPT (per plan / D-15). Phase 5 inline JSON-LD ships under the same CSP discipline as the existing AccentBootstrapScript (no nonce). Future security audit re-evaluates.
- **T-05-19 (Information Disclosure — Email harvesting via JSON-LD email field):** ACCEPT (per plan / D-10). Email is already public on `/contact` + AboutSocials (Plan 05-04); Knowledge Panel signal value > marginal harvester exposure.
- **T-05-20 (Repudiation — HeadComment <noscript> cross-browser preservation):** PARTIALLY MITIGATED at source level (scripts/check-head-comment.mjs flips PASS — the 6-line letter is in source); cross-browser view-source: visibility verified by Plan 05-08 manual gate.

No new public route surface, no new auth paths, no new schema changes at trust boundaries. The new RSCs read from existing `lib/portfolio-data.ts` PROFILE constants + a build-time env var (NEXT_PUBLIC_SITE_URL); no runtime user input flows through them.

## Authentication Gates

None. No external service auth, no API keys, no environment variables introduced beyond the existing NEXT_PUBLIC_SITE_URL fallback (defaults to http://localhost:3000). The components read from in-tree static data (PROFILE) + build-time env; no user setup required.

## User Setup Required

None — the JSON-LD + HTML comment are fully self-contained. Recruiters and search-engine crawlers visiting any route will see the schema.org Person payload in `<script type="application/ld+json">`; engineers viewing the source will see the 6-line letter inside `<noscript>` in `<head>`. The OS theme + accent-hue toggles are unaffected by this plan; `<head>` semantics are additive only.

Plan 05-08 will run a manual gate to verify (a) the 6-line letter appears in `view-source:http://localhost:3000` in Chrome AND Firefox (RESEARCH Assumption A1 verification), and (b) `curl -s http://localhost:3000 | grep -c "hello, you found the source"` returns 1. That gate is queued; this plan ships the source-level guarantees.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `lib/json-ld.ts` (created — 47 lines, pure helpers + PersonSchema interface)
- FOUND: `lib/json-ld.test.ts` (modified — 121 lines, 10 real assertions across 2 describe blocks)
- FOUND: `app/components/shell/json-ld-person.tsx` (created — 22 lines, RSC inline-script emitter with XSS escape)
- FOUND: `app/components/shell/json-ld-person.test.tsx` (modified — 49 lines, 6 real assertions including XSS-escape invariant)
- FOUND: `app/components/shell/head-comment.tsx` (created — 21 lines, RSC <noscript> host with 6-line lowercase letter)
- FOUND: `app/layout.tsx` (modified — 2 imports + 2 JSX children inside <head>)
- FOUND: `app/layout.test.tsx` (modified — 1 new describe block with 2 mount-point assertions via renderToStaticMarkup)

Verified commits exist:

- FOUND: `4dfd9f8` test(05-05): add failing buildPersonSchema + filterValidUrls assertions
- FOUND: `c07702b` feat(05-05): add buildPersonSchema + filterValidUrls pure helpers
- FOUND: `e5298c1` test(05-05): add failing JsonLdPerson script-emission + XSS-escape assertions
- FOUND: `c7eb4d2` feat(05-05): add JsonLdPerson RSC inline JSON-LD emitter (SEO-02)
- FOUND: `c5bebe0` feat(05-05): add HeadComment RSC for view-source: easter egg (DEV-02)
- FOUND: `4aacb60` feat(05-05): mount HeadComment + JsonLdPerson in app/layout.tsx <head>

Verified gates:

- `npm test` — 26 files / 129 tests passing (was 26/113 — added 16 new: 10 lib/json-ld + 6 json-ld-person + 2 layout mount; 0 net change in json-ld-person sentinel since it was sentinel→6 real)
- `npm run build` — exits 0; 24 static pages render including /icon /manifest.webmanifest 8 OG cards; postbuild `scripts/check-placeholders.mjs` reports clean
- `npm run lint` — exits 0
- `npx tsc --noEmit` — exits 0
- `npm run check:mobile` — exits 0 (3 audit scripts: sidebar-redistribution + print-rules + mobile-palette unaffected)
- `node scripts/check-head-comment.mjs` — exits 0 (Wave 0 fail-loud script flips green; 3rd of 4 to flip)
- `! grep -E '\bTODO\b' lib/json-ld.ts lib/json-ld.test.ts app/components/shell/json-ld-person.tsx app/components/shell/head-comment.tsx` — no uppercase TODO in any new file
- `grep -q 'replace(/</g, "\\\\u003c")' app/components/shell/json-ld-person.tsx` — XSS escape source-byte present
- `grep -q '<HeadComment />' app/layout.tsx` + `grep -q '<JsonLdPerson />' app/layout.tsx` — both mounts wired in <head>
- vitest `expect(script.innerHTML).not.toMatch(/</)` assertion green (T-05-16 render-time invariant)

## TDD Gate Compliance

Plans 05-05 Task 1 + Task 2 both declared `tdd="true"` and followed the RED → GREEN sequence:

- **Task 1 RED gate:** commit `4dfd9f8` (`test(05-05): add failing buildPersonSchema...`) added 10 assertions; all 10 failed at vitest collection time because `lib/json-ld.ts` did not exist (`Failed to resolve import "./json-ld"`).
- **Task 1 GREEN gate:** commit `c07702b` (`feat(05-05): add buildPersonSchema...`) added the lib helper; all 10 assertions passed.
- **Task 2 RED gate:** commit `e5298c1` (`test(05-05): add failing JsonLdPerson...`) added 6 assertions; all 6 failed at vitest collection time because `app/components/shell/json-ld-person.tsx` did not exist (`Failed to resolve import "./json-ld-person"`).
- **Task 2 GREEN gate:** commit `c7eb4d2` (`feat(05-05): add JsonLdPerson RSC...`) added the RSC; all 6 assertions passed.
- **REFACTOR gate:** N/A for both tasks — minimal helper / minimal RSC; no cleanup needed.

Tasks 3 + 4 were `type="auto"` (no `tdd="true"` flag); no RED commit was required. Task 4 internally followed the test-then-implement sequence (the layout.test.tsx extension was visible in the working tree as RED before the layout.tsx mounts shipped), but committed as a single GREEN unit — standard for non-TDD tasks.

Gate sequence is intact for both TDD tasks; no warning needed.

## Next Phase Readiness

Wave 2 plans 05-04 + 05-05 are now both complete. Plan 05-06 (Wave 3 — `<ConsoleSignature />` client island + mount in `app/(terminal)/layout.tsx`) is the next sequential task. Its dependencies are unaffected by this plan:

- `app/components/shell/console-signature.tsx` (NEW in 05-06) — independent of `app/layout.tsx` (mounts in `app/(terminal)/layout.tsx`, not the root)
- `app/components/shell/console-signature.test.tsx` (Wave 0 scaffold — extended in 05-06; Pitfall 8 forbids mounting in root `app/layout.tsx`)
- `app/(terminal)/layout.tsx` (UPDATED in 05-06) — orthogonal to this plan's `app/layout.tsx` edits

The lib/json-ld.ts + JsonLdPerson + HeadComment + mount surface ships without touching any of Plan 05-06's lane. No blockers for Wave 3.

After Plan 05-06, Wave 4 (Plan 05-07 — axe-core 8-hue × 2-theme contrast audit) is the next sequential task, followed by Plan 05-08 (Wave 5 — manual gates: view-source verification, OS reduce-motion toggle, recruiter scan path on mobile). Plan 05-08 is where this plan's source-level guarantees (HeadComment in source) get cross-browser verification (Chrome + Firefox view-source:).

---
*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
