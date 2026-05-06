---
phase: 01-foundation
reviewed: 2026-05-06T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - package.json
  - .nvmrc
  - tsconfig.json
  - .gitignore
  - lib/types.ts
  - lib/portfolio-data.ts
  - lib/api.ts
  - lib/routes.ts
  - app/layout.tsx
  - app/page.tsx
  - app/components/homepage.tsx
  - app/components/homepage.test.tsx
  - next.config.ts
  - scripts/check-placeholders.mjs
  - eslint.config.mjs
  - knip.json
  - .github/workflows/ci.yml
findings:
  blocking: 1
  high: 1
  medium: 1
  low: 1
  info: 3
  total: 7
status: blocking_found
---

# Phase 1: Foundation — Code Review Report

**Reviewed:** 2026-05-06
**Depth:** standard
**Files Reviewed:** 17 (14 source + 3 config)
**Status:** BLOCKING FOUND

## Summary

Phase 1 establishes the data model, toolchain, and CI pipeline that every subsequent phase builds on. The implementation is largely solid: all locked decisions from the context document are respected — the atomic `fallback-data.ts` deletion, no leak strings (`beck@example.com`, `Product Studio`), correct `||` (not `??`) in `metadataBase`, ROUTE-01 `slug: null` / `pathname: "/"` for the about route, `engines.node: "22.x"` pin, all 5 security headers + `x-built-with`, correct `npm ci` and `actions/checkout@v4` / `actions/setup-node@v4` with `.nvmrc` cache, job named `verify`, no `--no-exit-code` on knip, and `ignoreDependencies` covering `next-themes` and `cmdk`.

One **blocking defect** will cause every CI build to fail on the first PR: the `NEXT_PUBLIC_SITE_URL=https://example.com` env var injected for the CI build step conflicts with the postbuild grep that flags `/example\.com/i`. One **high-severity** issue makes `eslint.config.mjs` fragile — it directly imports three packages that are not declared in `package.json` devDependencies, surviving only as undocumented transitive deps of `eslint-config-next`. Fix these two before declaring Phase 1 complete.

---

## BLOCKING Issues

### B-01: CI build will always fail — `example.com` env var trips INFRA-05 grep

**File:** `.github/workflows/ci.yml:54`

**Issue:** The CI build step sets `NEXT_PUBLIC_SITE_URL: https://example.com` to give `metadataBase` a stable origin during the build. Because `NEXT_PUBLIC_` variables are inlined into the compiled output, the string `example.com` appears literally inside `.next/server/*.js`. The postbuild gate (`scripts/check-placeholders.mjs`) scans `.next/server/` and matches pattern `/example\.com/i`, calling `process.exit(1)`. Every CI run that reaches the Build step will fail.

The fix is to either remove the env var (the `|| "http://localhost:3000"` fallback in `app/layout.tsx` does not match any forbidden pattern) or substitute a non-forbidden placeholder URL.

**Fix:**
```yaml
# Option A — remove the env var entirely (localhost:3000 fallback is safe for the grep)
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_BASE_URL: ""

# Option B — use a CI-neutral placeholder that does not contain "example.com"
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: https://portfolio.local
          NEXT_PUBLIC_API_BASE_URL: ""
```

---

## HIGH Issues

### H-01: `eslint.config.mjs` directly imports undeclared transitive packages

**File:** `eslint.config.mjs:3-5`

**Issue:** The flat-config file imports three packages as top-level ES module imports:

```js
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
```

None of these are listed in `package.json` `devDependencies`. They are present in `node_modules/` today only because `eslint-config-next@15.5.15` pulls them in as transitive dependencies. However:

1. `npm ci` (used in CI) only installs what the lockfile demands. If the lockfile is regenerated after an `eslint-config-next` update that hoists these packages differently, the imports will silently break.
2. Knip suppresses the complaint via `ignoreDependencies`, masking the gap.
3. Any developer running `npm install --omit=optional` or a clean install on a differently-resolved lockfile may not get these packages at a compatible location.

The correct fix is to add the three packages as explicit `devDependencies` so they are first-class, pinned entries in the lockfile.

**Fix — add to `package.json` devDependencies:**
```json
"@typescript-eslint/eslint-plugin": "8.59.2",
"@typescript-eslint/parser": "8.59.2",
"@next/eslint-plugin-next": "15.5.15"
```
(Pin to the exact versions already resolved transitively to avoid version skew. Run `npm install` after editing to update the lockfile.)

---

## MEDIUM Issues

### M-01: CI triggers on `push` to `main`, not PR-only (deviates from D-01)

**File:** `.github/workflows/ci.yml:6-7`

**Issue:** Decision D-01 specifies "PR-only — workflow file at `.github/workflows/ci.yml`. Runs on every PR. No push-to-main duplicate runs (avoids 2× CI minutes)." The current file has:

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

Direct pushes to `main` (e.g. squash-merges via GitHub UI, emergency hotfixes) will trigger a second CI run after the PR run has already passed, burning CI minutes on already-verified commits. The `concurrency` group prevents parallel runs on the same SHA but does not prevent the post-merge push run from executing sequentially after the PR run.

**Fix:**
```yaml
on:
  pull_request:
    branches: [main]
```

---

## LOW Issues

### L-01: `ariaLabel` for about route is `"About"` — context doc specifies `"About me"`

**File:** `lib/routes.ts:31`

**Issue:** The Phase 1 context document states:

> `ariaLabel` (e.g. `'About me'` per A11Y-04 plain-noun requirement)

The implemented value is `"About"` — a single word. While this is still a plain noun, it is less descriptive than the specified example and diverges from the pattern used for other routes (e.g. `"Contact information"`, `"Tech stack"`, `"Shipped apps"` — all multi-word noun phrases). When Phase 2 wires the sidebar `<button>` elements using these values, screen readers will announce just "About" with no indication it is the primary about/bio view.

**Fix:**
```ts
{
  slug: null,
  pathname: "/",
  label: "about.md",
  ariaLabel: "About me",   // was: "About"
  description: "About — Sr. Software Engineer; bio, highlights, contact"
},
```

---

## INFO

### I-01: `check-placeholders.mjs` has a redundant `process.exit(0)` on the success path

**File:** `scripts/check-placeholders.mjs:58`

**Issue:** Node.js exits with code 0 by default when the script completes normally. The explicit `process.exit(0)` call is harmless but unnecessary. Cosmetic only.

### I-02: CI knip step uses `npx knip` rather than `npm run knip`

**File:** `.github/workflows/ci.yml:44`

**Issue:** The `package.json` `scripts` block has a `"knip": "knip"` entry, but the CI step calls `npx knip` directly, bypassing the script. Both resolve to the same local binary since `knip` is a direct `devDependency`, so there is no functional difference today. The inconsistency is cosmetic, but using `npm run knip` in CI would be consistent with how lint, typecheck, test, and build are invoked (all use `npm run`).

### I-03: `themeScript` in `app/layout.tsx` will be superseded by `next-themes` in Phase 2

**File:** `app/layout.tsx:20-29`

**Issue:** The inline `themeScript` reads `localStorage` and sets `data-theme` to prevent flash-of-unstyled-theme. Per the Phase 1 context and CLAUDE.md architecture notes, Phase 2 introduces `ThemeProvider` from `next-themes`, which manages its own blocking script. The current script and Phase 2's ThemeProvider will both write to `data-theme` / `data-theme` with potentially different key conventions (`portfolio-theme` vs `next-themes`' default `theme`). This is expected bridge-state for Phase 1 and will be resolved atomically in Phase 2's first commit when `homepage.tsx` / `theme-toggle.tsx` are deleted.

No action needed in Phase 1 — flagged so Phase 2 implementor cleans both the script and the `STORAGE_KEY` convention in the same commit.

---

## Checklist Against Focus Areas

| Focus area | Result |
|---|---|
| `lib/fallback-data.ts` truly gone, no surviving imports | PASS — `git grep fallback-data lib/ app/` returns empty |
| D-10 leak strings (`beck@example.com`, `Product Studio`) | PASS — no matches in `lib/` or `app/` |
| Pitfall D — `metadataBase` uses `||` not `??` | PASS — `app/layout.tsx:6` uses `||` with comment explaining why |
| ROUTE-01 — first route slug `null`, pathname `/` | PASS — `lib/routes.ts:27-32` |
| D-04 — `engines.node: "22.x"` literal | PASS — `package.json:6` |
| Security headers — 5 standard + `x-built-with`, no `x-portfolio-source` | PASS — `next.config.ts` has all 5 per D-14 + `x-built-with` per D-13; `x-portfolio-source` correctly absent |
| `check-placeholders.mjs` — catches all 5 patterns, `process.exit(1)` on hit | PASS — patterns match spec; `process.exit(1)` on `hits.length > 0` |
| CI uses `npm ci`, `actions/checkout@v4`, `actions/setup-node@v4`, `.nvmrc`, `cache: npm` | PASS |
| CI job named `verify`, steps in order lint→typecheck→test→knip→build | PASS |
| No `--no-exit-code` on knip | PASS |
| `knip.json` `ignoreDependencies: ["next-themes", "cmdk"]` | PASS (also ignores ESLint transitive packages — see H-01) |
| `getJson<T>(path, fallback)` signature preserved | PASS — `lib/api.ts:25` identical signature |
| No Tailwind / CSS-in-JS / SWR / TanStack creeping in | PASS — `package.json` clean |
| `lib/portfolio-data.ts` and `lib/fallback-data.ts` in same commit (D-17) | PASS — commit `7cb8d43` is atomic |
| `NEXT_PUBLIC_SITE_URL=https://example.com` in CI | **FAIL — B-01 (see above)** |
| `eslint.config.mjs` undeclared direct deps | **FAIL — H-01 (see above)** |

---

_Reviewed: 2026-05-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
