---
phase: 07-deploy-verification
reviewed: 2026-05-13T00:00:00Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - .env.example
  - CLAUDE.md
  - app/(terminal)/layout.tsx
  - app/components/shell/command-palette.test.tsx
  - app/components/shell/command-palette.tsx
  - app/components/shell/console-signature.test.tsx
  - app/components/shell/console-signature.tsx
  - app/components/shell/explorer-drawer.test.tsx
  - app/components/shell/explorer-drawer.tsx
  - app/components/shell/json-ld-person.test.tsx
  - app/components/shell/json-ld-person.tsx
  - app/components/shell/sidebar.test.tsx
  - app/components/shell/sidebar.tsx
  - app/components/shell/top-bar.test.tsx
  - app/components/shell/top-bar.tsx
  - app/layout.test.tsx
  - app/layout.tsx
  - knip.json
  - lib/json-ld.ts
  - lib/palette-verbs.ts
  - lib/portfolio-data.test.ts
  - lib/portfolio-data.ts
  - next.config.ts
  - package.json
  - scripts/check-production-routes.mjs
findings:
  critical: 0
  warning: 2
  info: 5
  total: 7
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-05-13
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

Phase 7 ships four cohesive workstreams across 25 source files: canonical-URL flip + header slot drop (07-01), production smoke gate script (07-02), Vercel Analytics + `track('resume_download')` (07-03), and the shell-hydrates-from-Mongo prop-refactor (07-10). The RSC discipline is preserved correctly across both async layouts — `getProfile()` is called once per layout and prop-drilled into seven client islands; no `"use client"` directive crept into either `app/layout.tsx` or `app/(terminal)/layout.tsx`.

**No critical issues found.** The XSS escape in `JsonLdPerson` survives the prop-source change (still `.replace(/</g, "\\u003c")` after the live profile lands), `target="_blank"` link openers continue to pass `noopener,noreferrer`, and the `track('resume_download')` call is correctly fire-and-forget — it does not call `preventDefault()` or otherwise block the anchor's native download behavior (D-12 honored).

The 2 warnings are correctness/robustness concerns around the new smoke script (`HEAD` may return 405 on some Next routes, and 3xx redirects are currently silently passed). The 5 info items cover prop-drilling style, dead-default arguments, and a duplicated tree-of-truth for sidebar icons that pre-dates Phase 7 but now spans two files prop-refactored in the same commit.

`getProfile()` is invoked in both `app/layout.tsx` and `app/(terminal)/layout.tsx`. With Next 15's request-deduped fetch + ISR `revalidate: 300`, this is one network call per ISR window — not a duplication bug, but called out as Info for future readers.

## Warnings

### WR-01: Smoke script may produce false negatives via HEAD verb and silent 3xx-treated-as-pass

**File:** `scripts/check-production-routes.mjs:16-21`

**Issue:** The smoke gate uses `fetch(BASE + path, { method: "HEAD", redirect: "manual" })` and treats every status `<400` as a pass. Two issues:

1. **HEAD-method blind spot:** Next.js App Router rendering paths support `HEAD` for `GET` routes, but some upstreams (Vercel edge, custom middleware, redirects to `/` from `/index`) can return `405 Method Not Allowed` for HEAD even when GET is healthy. A misconfigured route would falsely **fail** the gate after a redeploy, blocking releases.
2. **Silent 3xx-pass:** With `redirect: "manual"`, any 301/302/308 is `< 400` and is logged as "✓". A misconfigured canonical-host redirect loop (e.g. `https://tatibekov.com` → `https://www.tatibekov.com` → `https://tatibekov.com`) would never trip the gate, even though end users would see infinite-redirect errors.

This is a release-gate script — false negatives erode trust; false positives ship broken sites. The current logic biases toward false positives.

**Fix:** Switch to `GET` (the bytes are small for a portfolio) and assert `200`-only on success, with a warn-and-pass treatment for 3xx so canonical hops still surface:

```js
for (const path of ROUTES) {
  try {
    const res = await fetch(BASE + path, { redirect: "manual" });
    if (res.status >= 400) {
      failures.push(`${path}: HTTP ${res.status}`);
      continue;
    }
    if (res.status >= 300) {
      const location = res.headers.get("location") ?? "(none)";
      console.warn(`⚠ ${path} → ${res.status} → ${location} (redirect)`);
      continue;
    }
    console.log(`✓ ${path} → ${res.status}`);
  } catch (err) {
    failures.push(`${path}: ${err.message}`);
  }
}
```

If HEAD is desired for cost, gate on `res.status === 200 || res.status === 405` and re-issue GET on 405 to disambiguate.

---

### WR-02: Smoke script has no per-request timeout — a hung route hangs the gate indefinitely

**File:** `scripts/check-production-routes.mjs:14-25`

**Issue:** `fetch(BASE + path, ...)` has no `AbortController`/`signal` and no timeout. If `NEXT_PUBLIC_SITE_URL` points to an unreachable host, or a route stalls mid-stream (cold start on Vercel Pro), the script blocks forever — the loop is sequential, so one bad route stalls all 7. CI runners eventually kill it on global timeout, but the failure mode is "no output" rather than "✗ <path>: timeout", which makes diagnosis harder.

This matters most for `npm run check:prod` against a freshly redeployed site (cold function start).

**Fix:** Add a 10-second per-request abort:

```js
const TIMEOUT_MS = 10_000;
for (const path of ROUTES) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, { method: "HEAD", redirect: "manual", signal: ctrl.signal });
    // ... existing handling
  } catch (err) {
    failures.push(`${path}: ${err.name === "AbortError" ? `timeout after ${TIMEOUT_MS}ms` : err.message}`);
  } finally {
    clearTimeout(timer);
  }
}
```

## Info

### IN-01: `getProfile()` is called in two layouts — document the dedupe contract

**File:** `app/layout.tsx:65`, `app/(terminal)/layout.tsx:21`

**Issue:** Plan 07-10 wires `getProfile()` into both layouts. Next 15 dedupes identical `fetch()` calls within the same request, and `getJson()` uses `next: { revalidate: 300 }`, so this is fine — but a casual reader sees "two awaits = two round trips". The comment in `app/(terminal)/layout.tsx` already calls out `lib/api.ts is the chokepoint`; consider explicitly adding "fetch is deduped within a request by Next 15 — calling getProfile() in both layouts is one network call".

**Fix:** Add a single line to the existing header comment on `app/(terminal)/layout.tsx`:

```ts
// Note: getProfile() is also called in app/layout.tsx. Next 15's fetch dedupe + ISR
// (revalidate: 300) collapses both calls to a single upstream request per ISR window.
```

No code change required; documentation-only.

---

### IN-02: Sidebar and ExplorerDrawer duplicate `ROUTE_ICONS` verbatim

**File:** `app/components/shell/sidebar.tsx:15-23`, `app/components/shell/explorer-drawer.tsx:10-18`

**Issue:** The `ROUTE_ICONS` record is duplicated byte-for-byte across the desktop sidebar and the mobile drawer. The duplication pre-dates Phase 7, but both files were touched in the prop-refactor commit, and now both pass `profile` while still drifting independently on the icon map. If an 8th view is added (the routes.ts comment explicitly anticipates this), the icon must be added in two places — easy to miss.

**Fix:** Hoist `ROUTE_ICONS` to `lib/routes.ts` alongside `ROUTES`, or to a sibling `app/components/shell/route-icons.ts`. Both consumers import the same constant. Defer if outside Phase 7 scope.

---

### IN-03: `JsonLdPerson` ships `siteUrl` from `process.env` at module init, not per-render

**File:** `app/components/shell/json-ld-person.tsx:11`

**Issue:** `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";` is evaluated once at module load. With Next 15's `NEXT_PUBLIC_*` inlining at build time this is fine — the same value would be baked in. But this fallback diverges from `app/layout.tsx:14` which falls back to `https://www.tatibekov.com` (the canonical production URL flipped in plan 07-01). If anyone follows the breadcrumb from `app/layout.tsx` expecting the same fallback chain, the discrepancy could mislead.

The `"http://localhost:3000"` fallback in `JsonLdPerson` only matters in dev (where the env var is set) and during unit tests (where the value lands in JSON-LD `url`). It's not a correctness bug — but consistency with the root-layout fallback is a one-token change.

**Fix:** Align the fallback with `app/layout.tsx`:

```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com";
```

Note: This will change the JSON-LD `url` field in `lib/json-ld.test.ts` snapshot tests if any assert on the exact URL. Check `lib/json-ld.test.ts` before applying.

---

### IN-04: `package.json` engines pins `"node": "22.x"` but no `packageManager` field

**File:** `package.json:5-7`

**Issue:** The `engines.node` pin is good (matches Vercel's Node 22 LTS), but there's no `packageManager` field. The Phase 7 DEPLOY-05 audit mentions `--legacy-peer-deps` was needed for install; pinning a specific package manager version (e.g. `"packageManager": "npm@10.9.0"`) makes the install reproducible across CI/local/contributor environments and is recommended by Corepack.

This is Info — not a Phase 7 blocker. Deferable.

**Fix:**

```json
"engines": { "node": "22.x" },
"packageManager": "npm@10.9.0",
```

Pick the npm version your developer already runs (`npm --version`).

---

### IN-05: `knip.json` has no trailing newline (POSIX text file convention)

**File:** `knip.json:13` (no newline at end-of-file)

**Issue:** The diff shows `\ No newline at end of file` for `knip.json`. Minor style issue; most tools tolerate it, but some POSIX utilities (`wc -l`, `cat`, `git diff` on next change) handle no-final-newline files awkwardly. The repo's other JSON config files (e.g. `package.json`, `tsconfig.json`) terminate with a newline.

**Fix:** Add a trailing newline:

```json
  ]
}
```

(End the file with `\n` after the closing brace.)

---

_Reviewed: 2026-05-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
