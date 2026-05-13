# Phase 7: Deploy + Verification — Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 9 (8 modify + 1 new script)
**Analogs found:** 9 / 9

This phase is verification + single-line instrumentation. Every modified file already exists in the repo with a well-formed pattern; the deltas are surgical (1–3 lines per file). The single NEW file (`scripts/check-production-routes.mjs`) has multiple sibling analogs to copy from.

## File Classification

| Modified / New File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `next.config.ts` | config | build-time | (self — Phase 1 baseline) | exact (1-line delete in-file) |
| `app/layout.tsx` | layout/RSC root | request-response (server-render) | (self — Phase 1+5 baseline) | exact (2-line mount + URL update) |
| `app/components/shell/top-bar.tsx` | component (client island) | event-driven (DOM click) | (self — Phase 2 SHELL) | exact (1 import + 1 onClick prop) |
| `app/sitemap.ts` | route (Next metadata) | build-time / on-demand | `app/robots.ts` | exact (sibling pattern, same env var) |
| `app/robots.ts` | route (Next metadata) | build-time / on-demand | `app/sitemap.ts` | exact (sibling pattern, same env var) |
| `.env.example` | config | build-time | (self — Phase 1 baseline) | exact (comment-style hint) |
| `CLAUDE.md` | docs | n/a | (self) | exact (2-line allowlist addition) |
| `package.json` | manifest | build-time | (self — Phase 1+6 baseline) | exact (1 dep add, optional script) |
| `scripts/check-production-routes.mjs` | smoke-script gate (NEW) | request-response (HTTP HEAD/GET batch) | `../portfolio-services/scripts/check-backend.mjs` | exact (Phase 6 D-11 sibling) |

All "smoke-script-as-gate" files in the FE repo share the same skeleton (`check-placeholders.mjs`, `check-resume-pdf.mjs`, `check-resume-docx.mjs`); the *closest* analog for the new file is the BE sibling `check-backend.mjs` because both batch-fetch a list of URLs against a `process.env.*_URL` base and assert HTTP 200 + JSON shape.

---

## Pattern Assignments

### `next.config.ts` (config, build-time) — MODIFY

**Analog:** itself (current Phase 1 baseline, file is 27 lines, no other config file to imitate).

**Current state** (lines 11–14):
```ts
const engineerHeaders = [
  // x-portfolio-source deferred to Phase 7 per D-13 (revised) — set when public deploy URL finalized.
  { key: "x-built-with", value: "nextjs-15-react-19" }
];
```

**Delta to apply (D-04):**
- Delete line 12 (the deferral comment) entirely.
- `engineerHeaders` collapses to a single-element array with `x-built-with` only.

**Convention to preserve:**
- Import style: `import type { NextConfig } from "next";` (already present)
- Both `securityHeaders` (lines 3–9) and `engineerHeaders` are spread into the single matcher `{ source: "/:path*", headers: [...securityHeaders, ...engineerHeaders] }`. Do NOT add a new matcher; just shrink the array.
- Keep `export default nextConfig;` (line 27) unchanged.

**Risk:** None. This is a pure deletion. The Phase 5 D-30 carry status flips from DEFERRED-PHASE-7 to RESOLVED-as-dropped in REQUIREMENTS.md (separate doc touch).

---

### `app/layout.tsx` (layout/RSC root, request-response) — MODIFY

**Analog:** itself (current Phase 1+5 baseline, 84 lines).

**Current state — `metadataBase` resolution** (lines 10–12):
```ts
// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (Phase 1 D-Pitfall D — do not change.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
```

Used at line 24 in the metadata export:
```ts
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // ...
};
```

**Delta 1 (D-02 — update fallback to canonical production URL):**

Change line 12 fallback string:
```ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com";
```

**Pitfall to preserve (Phase 1 D-Pitfall D, line 10–11 comment):** Keep `||`, NOT `??`. Empty-string env vars must fall through to the production URL, not produce `new URL("")` → `TypeError [ERR_INVALID_URL]`.

**Current state — body render** (lines 72–81):
```tsx
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
```

**Delta 2 (D-08 — mount `<Analytics />`):**

Add import after line 8 (in the existing import cluster):
```ts
import { Analytics } from "@vercel/analytics/next";
```

Inject `<Analytics />` as the last child of `<body>`, AFTER `</ThemeProvider>` (RESEARCH.md Pattern 1 + Phase 7 Code Examples lines 671–688):
```tsx
<body>
  <ThemeProvider
    attribute="data-theme"
    defaultTheme="dark"
    enableSystem
    disableTransitionOnChange
  >
    <ShellStateProvider>{children}</ShellStateProvider>
  </ThemeProvider>
  <Analytics />
</body>
```

**Convention to preserve:**
- File stays RSC — NO `"use client"` directive (comment at line 53 forbids it). `<Analytics />` is a thin client component *internally* per package — safe to nest under RSC without making the parent client.
- Import path is `@vercel/analytics/next` (App-Router-aware), NOT `@vercel/analytics/react` (CRA-style, misses client-side navigations). RESEARCH.md Pitfall 4.
- Place `<Analytics />` OUTSIDE `<ThemeProvider>` so theme-change re-renders don't churn the Analytics tree.
- Preserve `suppressHydrationWarning` on `<html>` (line 61) — required by `next-themes`.
- Preserve all three head children (`<AccentBootstrapScript />`, `<HeadComment />`, `<JsonLdPerson />`).

**Risk:** Mount position is Claude's Discretion (top-of-`<body>` vs after providers). RESEARCH.md recommends after providers, last child of `<body>` — keeps `<head>` clean and matches Vercel docs canonical example.

---

### `app/components/shell/top-bar.tsx` (component, event-driven) — MODIFY

**Path correction:** The phase brief said `app/components/top-bar.tsx`. The actual current path is **`app/components/shell/top-bar.tsx`** (Phase 2 SHELL placed it under the `shell/` subfolder alongside `sidebar.tsx`, `command-palette.tsx`, `live-clock.tsx`, etc.). The test file is at `app/components/shell/top-bar.test.tsx`.

**Analog:** itself (existing 70-line client island).

**Current state — imports** (lines 1–6):
```tsx
"use client";

import { useTheme } from "next-themes";
import { usePalette, useDrawer } from "@/app/components/shell/shell-state-provider";
import { LiveClock } from "@/app/components/shell/live-clock";
import { PROFILE } from "@/lib/portfolio-data";
```

**Current state — resume button** (lines 59–67):
```tsx
{/* Persistent resume download — NEVER hidden at any viewport (SHELL-03 / Risk 3) */}
<a
  className="topbar-btn topbar-resume"
  href={PROFILE.resumeUrl}
  download="Bakytbek_Tatibekov_Resume.pdf"
  aria-label="Download resume"
>
  ↓ resume.pdf
</a>
```

**Delta 1 (D-12 — add `track` import):**

Insert after line 3 (after `useTheme` import, before app-internal imports — preserves "framework → external → internal" import order):
```tsx
import { track } from "@vercel/analytics";
```

Note: Import from **bare `@vercel/analytics`**, NOT `@vercel/analytics/next`. The `/next` entry point exports `<Analytics />` only; `track` lives at the root entry. RESEARCH.md Pitfall 4.

**Delta 2 (D-12 — add `onClick` to resume `<a>`):**

```tsx
<a
  className="topbar-btn topbar-resume"
  href={PROFILE.resumeUrl}
  download="Bakytbek_Tatibekov_Resume.pdf"
  aria-label="Download resume"
  onClick={() => track("resume_download")}
>
  ↓ resume.pdf
</a>
```

**Conventions to preserve:**
- DO NOT call `preventDefault()` inside the onClick — RESEARCH.md anti-pattern. The SDK uses `navigator.sendBeacon` (`fetch keepalive` fallback) which is built for fire-and-forget pre-navigation; preventing default would block the download.
- DO NOT add `track()` to the other resume surfaces (palette `download_resume` verb, `/about` AboutSocials CTA, sidebar recruiter card) — D-10 explicitly scopes the event to TopBar ONLY.
- DO NOT change `aria-label`, `download` attribute, `className`, or `href` — dual-audience constraint requires the resume button to keep identical semantics across viewports.
- Bare event name `"resume_download"` with no second-arg properties (D-11). Do not add viewport/theme/accent props.

**Risk:**
- `top-bar.test.tsx` exists and may already snapshot/assert against the `<a>` element. Verify the test passes after the onClick addition (it should — the addition is non-breaking) and add a new assertion for the `track` call only if the planner has decided to test analytics behavior (not in DEPLOY-06's strict scope; recommend skip).
- `track` is a no-op in dev (RESEARCH.md Pitfall 3) — verification must happen on the production URL, not localhost.

---

### `app/sitemap.ts` (route, build-time) — VERIFY ONLY (no code change expected)

**Current state** (entire 13-line file):
```ts
import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ROUTES.map((r) => ({
    url: `${baseUrl}${r.pathname}`,
    changeFrequency: "weekly" as const,
    priority: r.slug === null ? 1 : 0.8,
    lastModified: new Date()
  }));
}
```

**Pattern (already correct):**
- Reads `NEXT_PUBLIC_SITE_URL` at server-eval time
- Iterates `ROUTES` from `lib/routes.ts` (single source of truth — 7 entries)
- Returns 7 `MetadataRoute.Sitemap` entries

**Risk / Inconsistency NOTE:** This file uses `??` (nullish coalescing) while `app/layout.tsx:12` uses `||` (logical OR) with a Pitfall-D comment forbidding `??`. The semantic is *very slightly* different: `??` lets an empty-string env var through (yielding `${"" + r.pathname}` → `<loc>/projects</loc>` etc., which is malformed XML). The Phase 1 D-Pitfall-D comment applies here too. **Planner's call:** either (a) align sitemap+robots to `||` for consistency (low-risk 1-char change), or (b) accept the asymmetry as-is (Phase 7 scope says "verify, no change expected" — D-02). The phase brief and CONTEXT D-02 both say "verify"; if Vercel always sets `NEXT_PUBLIC_SITE_URL` to a non-empty value in Production, this is moot. **Recommend: flag in PLAN as a tiny optional consistency fix, default-skip.**

**Verification command** (RESEARCH.md lines 423–429):
```bash
curl -s https://www.tatibekov.com/sitemap.xml | grep -c '<loc>'
# Expected: 7
curl -s https://www.tatibekov.com/sitemap.xml | head -20
# Expected: <loc>https://www.tatibekov.com/...</loc>
```

---

### `app/robots.ts` (route, build-time) — VERIFY ONLY (no code change expected)

**Current state** (entire 15-line file):
```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
```

**Pattern (already correct):**
- Same env var read as `app/sitemap.ts`
- Single `userAgent: "*"` rule with `allow: "/"`
- Sitemap pointer concatenates `${baseUrl}/sitemap.xml`

**Same `??` vs `||` inconsistency** as `app/sitemap.ts` — see note above. Same disposition (default-skip).

**Verification:**
```bash
curl -s https://www.tatibekov.com/robots.txt
# Expected:
# User-Agent: *
# Allow: /
# Sitemap: https://www.tatibekov.com/sitemap.xml
```

**Risk re: D-01:** The Vercel-hostname alias `personal-portfolio-web-orcin.vercel.app` will serve the same robots.txt with the SAME `sitemap: https://www.tatibekov.com/sitemap.xml` pointer (because `metadataBase`/`NEXT_PUBLIC_SITE_URL` is build-time inlined — it doesn't vary by request hostname). This is correct per D-01 ("let Google de-duplicate via canonical URLs"); the alias's robots.txt pointing at www is precisely the de-dup signal.

---

### `.env.example` (config, build-time) — MODIFY

**Current state** (2-line file):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Pattern observed:** Bare `KEY=value` pairs, one per line, no comments, no shell quoting. Newline-delimited; no trailing newline marker.

**Delta (D-03):** Add a comment-style hint showing the production value. Keep dev value as the *active* (non-commented) line so `npm run dev` continues to work without local env modification.

**Recommended shape** (matches the spec: "update `.env.example` to show production value as comment-style hint, NOT the active value"):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# In production (Vercel Project Settings → Environment Variables → Production scope):
# NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com
```

**Convention to preserve:** No shell-quoting (`"..."` etc.). Comment lines prefixed with `# ` (space after `#`). Active values stay uncommented and pointing at localhost.

**Risk:** None. This file is documentation-only; it doesn't get sourced by anything except developer reading.

---

### `CLAUDE.md` (docs, n/a) — MODIFY

**Current state** (lines 20, 23):
```markdown
**Stack constraints (do not violate):**
- Next.js 15 App Router + React 19 + TypeScript strict (no framework swap)
- Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules)
- Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1` — do not introduce others without revisiting `.planning/research/STACK.md`
- Native `fetch` + `next: { revalidate }` for data — no SWR, no TanStack Query
```

**Delta (D-09):** Update line 23 to acknowledge the documented Phase 7 exception. Two formulations work; pick the one with smaller diff.

**Option A — replace the line, preserving the "do not introduce others" guardrail:**
```markdown
- Three prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1`, `@vercel/analytics@^2.0.1` — do not introduce others without revisiting `.planning/research/STACK.md`. Phase 7 added `@vercel/analytics` for `resume_download` event tracking (DEPLOY-06); this is the third and final v1 prod dep.
```

**Option B — keep the original line, append a second bullet:**
```markdown
- Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1` — do not introduce others without revisiting `.planning/research/STACK.md`
- Phase 7 exception: `@vercel/analytics@^2.0.1` added for `resume_download` event tracking (DEPLOY-06). Third and final v1 prod dep — same "no new prod deps" rule applies going forward.
```

**Convention to preserve:** Bullet style (`- `), backtick package names with `@^x.y.z` versions, "no jargon" prose, link to `.planning/research/STACK.md` retained.

**Risk:** None. Documentation-only edit; planner picks A or B based on visual diff preference. Recommend Option B (smaller intent-preserving diff).

---

### `package.json` (manifest, build-time) — MODIFY

**Current state — `dependencies`** (lines 21–27):
```json
"dependencies": {
  "cmdk": "^1.1.1",
  "next": "^15.5.18",
  "next-themes": "^0.4.6",
  "react": "19.1.0",
  "react-dom": "19.1.0"
},
```

**Delta 1 (required — D-08):** Add `@vercel/analytics`. Alphabetical insertion before `cmdk`:
```json
"dependencies": {
  "@vercel/analytics": "^2.0.1",
  "cmdk": "^1.1.1",
  "next": "^15.5.18",
  "next-themes": "^0.4.6",
  "react": "19.1.0",
  "react-dom": "19.1.0"
},
```

**Run** (preserves existing lockfile shape; do not hand-edit `package-lock.json`):
```bash
npm install @vercel/analytics@^2.0.1
```

**Current state — `scripts`** (lines 8–20):
```json
"scripts": {
  "dev": "next dev",
  "prebuild": "node scripts/check-resume-pdf.mjs && node scripts/check-resume-docx.mjs",
  "build": "next build",
  "postbuild": "node scripts/check-placeholders.mjs",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "typecheck": "tsc --noEmit",
  "knip": "knip",
  "check:mobile": "node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs",
  "test:contrast": "playwright test"
},
```

**Delta 2 (optional — D-21 / Claude's Discretion):** Add a named `audit:high` script for the close-out gate so the gate command is canonical (matches RESEARCH.md Pattern 6 line 493 recommendation). Add after `"knip"`:
```json
"audit:high": "npm audit --omit=dev --audit-level=high",
```

**Convention to preserve:**
- Chained scripts use `&&` (see existing `prebuild`, `check:mobile`).
- Scripts named with `:` namespacing when grouped (`check:mobile`, `test:contrast`).
- No trailing commas (it's JSON, not JSONC).
- Keep alphabetical-ish ordering by intent: build pipeline (`prebuild`, `build`, `postbuild`, `start`), then tooling (`lint`, `test`, `typecheck`, `knip`, `audit:high`), then specialty checks (`check:mobile`, `test:contrast`).

**Risk:**
- Verify `@vercel/analytics@2.0.1` peer-deps resolve against React 19.1.0 + Next 15.5.18 (RESEARCH.md confirms compat). If npm complains, the install command may need `--legacy-peer-deps` (do NOT add — investigate first).
- `npm install` will regenerate `package-lock.json`; commit both `package.json` and `package-lock.json` in the same wave as the `<Analytics />` mount (brownfield discipline: dep add + usage land together).

---

### `scripts/check-production-routes.mjs` (smoke-script gate, request-response) — NEW

**Closest analog:** `../portfolio-services/scripts/check-backend.mjs` (Phase 6 D-11 sibling pattern). Same shape — batch-fetch a list of URLs against a `process.env.*_URL` base, assert HTTP 200, log per-route status, exit 1 on any miss with a final summary line.

**Secondary analogs (FE repo skeleton):** `scripts/check-resume-pdf.mjs`, `scripts/check-resume-docx.mjs`, `scripts/check-placeholders.mjs` — share the shebang + comment header + `failures[]` accumulator + final exit pattern.

**BE sibling pattern excerpt (lines 1–6, 19–43 of `check-backend.mjs`):**
```js
#!/usr/bin/env node
// scripts/check-backend.mjs — D-11 readiness gate.
// Hit 7 endpoints against $PROD_API_URL; assert HTTP 200 + JSON shape + no placeholders.
// Exit 0 on full pass, 1 on any miss.

const BASE = process.env.PROD_API_URL ?? 'http://localhost:8080';

// ... ENDPOINTS array elided ...

const fails = [];
for (const e of ENDPOINTS) {
  try {
    const res = await fetch(`${BASE}${e.path}`);
    const txt = await res.text();
    if (res.status !== 200) { fails.push(`${e.path}: HTTP ${res.status}`); continue; }
    // ... shape + content-type + forbidden-string checks elided ...
    console.log(`✓ ${e.path}`);
  } catch (err) {
    fails.push(`${e.path}: ${err.message}`);
  }
}

if (fails.length > 0) {
  console.error(`\n✗ check-backend: ${fails.length} failure(s):`);
  for (const f of fails) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`\n✓ check-backend: all ${ENDPOINTS.length} endpoints green`);
```

**Adapted for Phase 7 (template the planner can use directly):**
```js
#!/usr/bin/env node
// scripts/check-production-routes.mjs — DEPLOY-01 readiness gate.
// Hit all 7 routes against $NEXT_PUBLIC_SITE_URL; assert HTTP 200.
// Exit 0 on full pass, 1 on any miss.
// Iterates ROUTES from lib/routes.ts (single source of truth — Phase 2 ROUTE-04 model).

import { ROUTES } from "../lib/routes.ts";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const fails = [];
for (const r of ROUTES) {
  const url = `${BASE}${r.pathname}`;
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "manual" });
    // Accept 200 OK or 3xx (apex → www redirect). Refuse 4xx/5xx.
    if (res.status >= 400) {
      fails.push(`${r.pathname}: HTTP ${res.status}`);
      continue;
    }
    console.log(`✓ ${r.pathname} → ${res.status}`);
  } catch (err) {
    fails.push(`${r.pathname}: ${err.message}`);
  }
}

if (fails.length > 0) {
  console.error(`\n✗ check-production-routes: ${fails.length} failure(s):`);
  for (const f of fails) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`\n✓ check-production-routes: all ${ROUTES.length} routes green on ${BASE}`);
```

**Conventions to preserve from sibling scripts:**
- **Shebang:** `#!/usr/bin/env node` (every FE/BE `.mjs` gate has this; line 1 of every example).
- **Header comment block:** 2–4 lines describing what the gate enforces, which requirement ID, and exit-code semantics (see `check-placeholders.mjs:1–16`, `check-resume-pdf.mjs:1–7`, `check-backend.mjs:1–4`).
- **ESM `.mjs` extension** (NOT `.ts`) — these scripts run via raw `node` outside the Next.js build pipeline. RESEARCH-suggested format. **`.mjs` files cannot import `.ts` directly without a loader** — see "Risk" below.
- **`process.env.VAR ?? "fallback"`** pattern (BE script line 6 uses `??`; FE `check-placeholders.mjs` uses string literals). Either works in ESM Node; pick `??` for consistency with the BE sibling.
- **`failures` or `fails` array accumulator**, then a final `if (fails.length > 0) { ...; process.exit(1); } console.log(...); process.exit(0);` pattern. Every FE smoke-gate uses this. Do NOT throw exceptions; use `process.exit(1)` with a sorted human-readable failure list.
- **Per-success `console.log("✓ ...")`, per-failure push then summary `console.error("✗ ...")`.** Symbol convention (`✓` / `✗`) is consistent across all 7 FE smoke-gates and the BE one.
- **Top-level `await`** is fine — `.mjs` ESM enables it (BE script line 22 uses it directly in a for-loop).

**Risk — `.mjs` cannot import `.ts` files directly:**
The template above imports `ROUTES` from `../lib/routes.ts`. Raw `node` (without `tsx` / `ts-node` / a loader flag) **will reject `.ts` import in `.mjs`**. Two ways to resolve:
1. **Hard-code 7 paths inline** (simplest; copies the BE pattern of an inline `ENDPOINTS` array). Lose single-source-of-truth on routes; gain zero-dep simplicity. Acceptable because `lib/routes.ts` rarely changes.
2. **Run via `npx tsx scripts/check-production-routes.mjs`** to use `tsx` (devDep — would be a new dep; do NOT add).
3. **Convert script to `.ts` and run via `tsx`** — same dep problem.

**Recommended (planner's call):** Option 1 — hard-code the 7 pathnames inline. Add a comment `// Mirrors lib/routes.ts — keep in sync if ROUTES changes.` per the BE-script precedent of inlining endpoints. If lib/routes.ts ever expands beyond 7, the next phase's plan adds the new path here too. This matches the BE pattern of `ENDPOINTS = [...]` inline.

**Alternate option (cleaner — same approach as `check-placeholders.mjs`):** Generate the list at build-time. Skip; over-engineered for Phase 7.

**Where to invoke:** Run manually post-redeploy (NOT wired into `prebuild`/`postbuild` — those run on local builds, not against production). Either invoke via `NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com node scripts/check-production-routes.mjs` from the dev shell, or wire as `npm run check:prod` if the planner decides it should be a named script. Recommend the named script for evidence-trail consistency.

**Optional sibling:** `scripts/check-canonical-url.mjs` (Claude's Discretion) — asserts `process.env.NEXT_PUBLIC_SITE_URL` is set to non-localhost. If included, follow the same skeleton: shebang, header comment, `if (!url || url.includes("localhost")) { process.exit(1); }`, exit 0 otherwise. Wire into `prebuild` to catch accidental missing env var in CI/Vercel builds. RESEARCH.md treats this as deferred / v1.1; recommend skip unless the planner specifically wants it.

---

## Shared Patterns

### Smoke-script-as-gate skeleton

**Source files** (all in `scripts/`): `check-placeholders.mjs`, `check-resume-pdf.mjs`, `check-resume-docx.mjs`, plus BE sibling `../portfolio-services/scripts/check-backend.mjs`.

**Apply to:** `scripts/check-production-routes.mjs` (NEW), optional `scripts/check-canonical-url.mjs`.

**Canonical skeleton (compositing the common elements):**
```js
#!/usr/bin/env node
// scripts/<name>.mjs — <REQUIREMENT-ID> readiness gate.
// <one-line description of what this enforces>
// Exit 0 on full pass, 1 on any miss.

import { /* node builtins or relative ESM */ } from "node:...";

const <CONFIG> = process.env.<VAR> ?? "<fallback>";

const failures = [];
// ... checks; push string messages on failure, console.log("✓ ...") on success ...

if (failures.length > 0) {
  console.error(`\n✗ <NAME>: <SUMMARY> failed:\n`);
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ <NAME>: <success summary>`);
process.exit(0);
```

### Env-var fallback pattern (`||` vs `??`)

**Apply to:** Any file reading `NEXT_PUBLIC_*` env vars at module-eval time.

**Phase 1 D-Pitfall D rule (from `app/layout.tsx:10–11` comment):**
- Use `||` (logical OR) — empty-string and undefined both fall through to the fallback.
- Do NOT use `??` (nullish coalescing) — empty-string passes through, producing `new URL("")` → runtime `Invalid URL` error.

**Files currently using `||`** (correct): `app/layout.tsx:12`.
**Files currently using `??`** (inconsistent but functional in practice if env var is always set): `app/sitemap.ts:5`, `app/robots.ts:4`.

**Phase 7 disposition:** Not in scope to fix (D-02 says "verify, no change expected"). Planner may add a single optional consistency-fix sub-plan; default-skip.

### Event-firing client island

**Source:** `app/components/shell/top-bar.tsx` (the file being modified — its existing `onClick={toggle}` and `onClick={() => setTheme(...)}` handlers at lines 23, 42, 50 are the *intra-file* pattern).

**Apply to:** The new `onClick={() => track("resume_download")}` on the resume `<a>`. Same shape: arrow function returning the side-effect call directly, no `preventDefault()`, no `useCallback` wrapping, no event-object argument.

### Header response config

**Source:** `next.config.ts` (existing pattern). All HTTP response headers (security + engineer) are declared as flat `{ key, value }` object arrays and spread into a single `{ source: "/:path*", headers: [...] }` matcher.

**Apply to:** Anywhere headers need adding/removing. In Phase 7: a single deletion (the deferred comment + slot). No new matcher; no path-specific overrides; one global rule for everything.

### Single source of truth — `lib/routes.ts`

**Source:** `lib/routes.ts` (7-entry `ROUTES` array, `as const satisfies readonly Route[]`).

**Apply to:** Anything iterating routes — sidebar, command palette, `app/sitemap.ts`, the new `scripts/check-production-routes.mjs`. The new smoke gate cannot import `.ts` from `.mjs` cleanly (see Risk above), so it inlines the 7 pathnames with a comment back-pointer to `lib/routes.ts` — the BE script's `ENDPOINTS` pattern, transferred.

---

## No Analog Found

All 9 files have analogs (8 are self-modifying with intra-file patterns; 1 NEW file has 4 sibling analogs). The closest gap is in:

| Sub-task | Why no analog | Mitigation |
|----------|---------------|------------|
| `<Analytics />` mount in RSC layout | First analytics integration in the repo (INTEGRATIONS.md confirms) | RESEARCH.md Pattern 1 + Vercel docs Code Examples are the canonical reference (lines 671–688) |
| `track()` import + onClick wiring | First custom event tracking in the repo | RESEARCH.md Pattern 2 + Code Examples (lines 691–715) — single-line delta on an existing onClick-pattern element |
| Production-URL smoke gate | New surface (Phase 6 had BE-side `check-backend.mjs` but no FE-route variant) | BE sibling is exact analog modulo `.ts` import gotcha |
| `npm audit` / `npx knip` close-out gates | No prior named npm script (DEPLOY-05 is the first formalization) | RESEARCH.md Pattern 6 + 7 are CLI-only — no in-file pattern needed; either add named script (recommended) or invoke ad-hoc |

External-tool verifications (PageSpeed Insights × 7, Google Search Console DNS TXT + sitemap submission, 5-second recruiter test, 375px shell screenshot review) produce evidence files (PNGs + VERIFICATION.md rows) but no source-code changes — no pattern map needed.

---

## Metadata

**Analog search scope:** `app/`, `lib/`, `scripts/`, `../portfolio-services/scripts/`, `next.config.ts`, `package.json`, `.env.example`, `CLAUDE.md`.
**Files scanned (read into context):** `next.config.ts`, `app/layout.tsx`, `app/components/shell/top-bar.tsx`, `app/sitemap.ts`, `app/robots.ts`, `.env.example`, `lib/routes.ts`, `package.json`, `scripts/check-placeholders.mjs`, `scripts/check-resume-pdf.mjs`, `scripts/check-resume-docx.mjs`, `../portfolio-services/scripts/check-backend.mjs`. CLAUDE.md (Stack constraints section only, lines 20–23) via grep. Phase 7 CONTEXT.md (full) + RESEARCH.md (lines 1–749) read in full or in targeted ranges.
**Pattern extraction date:** 2026-05-13.
