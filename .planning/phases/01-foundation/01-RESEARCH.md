---
phase: 01-foundation
name: Foundation
type: research
date: 2026-05-06
sources_count: 28
---

# Phase 1: Foundation — Research

**Researched:** 2026-05-06
**Domain:** Next.js 15 App Router brownfield foundation upgrade (deps + types + routes + CI + headers)
**Confidence:** HIGH (verified registry versions, official Next.js + Knip + Vercel docs, codebase inspection; one CONTEXT decision needs revisiting — see Open Decisions §9)

## Summary

Phase 1 is purely infrastructural — no UI ships. Twelve requirements (`INFRA-01..05`, `DATA-01..05`, `ROUTE-03`, `TEST-01`) lock the data model, route registry, dependency baseline, security headers, CI pipeline, and brownfield deletion discipline that every subsequent phase depends on. Research confirmed that `next-themes@^0.4.6`, `cmdk@^1.1.1`, `next@^15.5` (target: `15.5.15`), and `eslint-config-next@^15.5.x` are all current at the npm registry, peer-dep-compatible with React 19, and that ESLint 9 flat config is the official path forward — `next-lint` is deprecated in 15.5 and removed in 16. Knip 6.11.0 is zero-config-compatible with this stack and exits non-zero on findings, satisfying D-03 directly.

Three open items from CONTEXT.md `<decisions>` that needed research-grade answers were resolved with concrete commands, config snippets, and version pins: postbuild grep semantics (postbuild — grep what actually shipped), ESLint 9 flat-config migration (migrate now — `eslint-config-next@15.5` advertises `eslint ^9` peer support), and the `lib/types.ts`/`lib/routes.ts` field shapes (locked from `design_handoff_terminal_portfolio/app.jsx` view-rendering needs).

**One critical finding contradicts CONTEXT.md D-04:** Vercel rejects `engines.node: ">=22"` with `Error: Found invalid Node.js Version`. The supported format is the major-version shorthand `"22.x"`. Phase 1 should pin `"22.x"` to keep options clean for the Phase 7 deploy. See Open Decisions §9.

**Primary recommendation:** Lock the dep upgrades and CI scaffolding first (INFRA-01..03 + ROUTE-03), then write `lib/types.ts` → `lib/portfolio-data.ts` → `lib/api.ts` → `lib/routes.ts` as a single typed-data atomic commit, then INFRA-04/05 headers + grep, then delete `lib/fallback-data.ts` in the same commit that introduces `lib/portfolio-data.ts`. Defer all four other deletions (`homepage.tsx`, `homepage.test.tsx`, `theme-toggle.tsx`) to Phase 2's first commit per D-decisions §"Claude's Discretion".

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CI Tooling (INFRA-03):**
- **D-01:** GitHub Actions, PR-only — workflow file at `.github/workflows/ci.yml`. Runs on every PR. No push-to-main duplicate runs.
- **D-02:** CI checks pipeline (in order): `lint` → `typecheck (tsc --noEmit)` → `test (vitest run)` → `knip` → `build (next build)`. All must pass for merge.
- **D-03:** Knip hard-fails CI on any orphan finding. No allowlist.
- **D-04:** Pin Node 22 LTS via `.nvmrc` AND `engines.node: ">=22"` in `package.json`. CI uses `actions/setup-node@v4` with `node-version-file: .nvmrc`. ⚠️ See Open Decisions §9 — `>=22` is rejected by Vercel; recommend `22.x`.
- **D-05:** Use `npm ci` in CI (not `npm install`).
- **D-06:** Branch protection on `main`: require CI green to merge, 0 reviewers required. Phase 1 ships the workflow; developer configures protection in GitHub UI after first PR lands.

**DATA-02 Content Strategy:**
- **D-07:** "Real-where-trivial, TBD-where-not" approach for `lib/portfolio-data.ts`. NOT a Phase 6 content pull-forward.
- **D-08:** Real now: name (`Bakytbek Tatibekov`), role (`Sr. Software Engineer`), location, GitHub URL, LinkedIn URL, additional public profiles (developer's call), real email, real stack categories.
- **D-09:** TBD now (Phase 6 fills): bio (short + long), project list, writing posts, shipped apps, experience entries.
- **D-10:** TBD marker convention: `TODO:` (uppercase, with colon). Self-enforcing — INFRA-05 grep includes `TODO`.
- **D-11:** INFRA-05 grep list: `lorem | example.com | placeholder | TODO | Product Studio`. Greps `.next/server/`, exits non-zero on hit. Prebuild-vs-postbuild ordering deferred to planning (resolved in Open Decisions §1 below).

**INFRA-04 Hardening Scope:**
- **D-12:** Engineer headers + standard security headers in `next.config.ts` `headers()`.
- **D-13:** Engineer headers (DEV-03): `x-portfolio-source: <github-repo-url>`, `x-built-with: nextjs-15-react-19`.
- **D-14:** Standard security headers: HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **D-15:** CSP deferred — out of Phase 1 scope.
- **D-16:** URL/scheme validation on API-supplied hrefs deferred to Phase 6.

### Claude's Discretion

- **Homepage deletion timing:** Phase 1 stages new structure but does NOT delete `homepage.tsx` / `homepage.test.tsx` / `theme-toggle.tsx` until Phase 2's first commit. **Special case:** `lib/fallback-data.ts` IS deleted in Phase 1 alongside introduction of `lib/portfolio-data.ts`.
- **Dev tooling hygiene:** `tsconfig.json` `target` ES2017 → ES2022; `.gitignore` widened to `.env*.local`, `.env`, `.DS_Store`; ESLint 9 flat-config migration if compatible (resolved YES — see Open Decisions §2).
- **`lib/types.ts` field shapes:** Decided during planning based on view-rendering needs (resolved in Open Decisions §4).
- **`lib/routes.ts` registry shape:** Minimum fields `slug`, `pathname`, `label`, `ariaLabel`. 7 routes, sidebar render order = array order. (Resolved in Open Decisions §5.)
- **CI workflow specifics:** Action versions, cache key strategy, parallelization, build artifact upload — left to planning (resolved in CI Workflow Spec section below).
- **Resume PDF:** 50-byte placeholder remains in Phase 1. Real PDF lands in Phase 6 / CONTENT-05.

### Deferred Ideas (OUT OF SCOPE)

- **CSP (Content-Security-Policy)** — requires nonce-based strategy threaded through Phase 2 inline accent boot script. Revisit after Shell ships.
- **URL/scheme validation on API-supplied hrefs** — Phase 6 / BACKEND-04 alongside backend cutover.
- **CSP-Report-Only header** — could land alongside D-14 without nonce; deferred for focus.
- **Dependabot / Renovate** — flagged in CONCERNS.md; revisit after Phase 7 deploy.
- **Sentry / observability** — out of v1 scope per PROJECT.md.
- **Per-endpoint revalidation tags** — `lib/api.ts` keeps blanket `revalidate: 300`.
- **Real `public/resume.pdf`** — Phase 6 / CONTENT-05.
- **Vercel Analytics, `resume_download` event** — Phase 7 / DEPLOY-06.
- **Splitting GitHub Actions into multiple jobs** — single-job sequential is fine for tiny codebase.
- **`prefers-reduced-motion`, skip-link, contrast audits** — Phases 4/5; not Phase 1.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | `next` upgraded `15.3.2` → `^15.5.x` (security advisories) | Open Decisions §7 — target `15.5.15`; codemod `npx @next/codemod@latest upgrade latest` available; safe for App Router |
| INFRA-02 | `next-themes@^0.4.6` and `cmdk@^1.1.1` installed (React 19 verified) | Open Decisions §8 — npm registry confirms both versions latest; React 19 in peer-deps; one-line install |
| INFRA-03 | GitHub Actions CI: lint+typecheck+test+knip+build, fail on Knip orphans | Open Decisions §3 + §6 — Knip exits non-zero by default; full ci.yml draft in CI Workflow Spec section |
| INFRA-04 | `next.config.ts` security + engineer-discoverable headers | Code Examples section — full `headers()` config with all D-13/D-14 headers |
| INFRA-05 | Build greps `.next/server/` for placeholders, fails on hit | Open Decisions §1 — postbuild semantics correct; full script in Code Examples |
| DATA-01 | `lib/types.ts` rewritten to terminal data model (7 interfaces) | Open Decisions §4 — concrete shapes derived from `app.jsx` view rendering |
| DATA-02 | `lib/portfolio-data.ts` typed, real-where-trivial / TBD-where-not | D-07..D-10; field shapes from §4 |
| DATA-03 | Delete `lib/fallback-data.ts` in same commit as `lib/portfolio-data.ts` | Brownfield discipline (Pitfall 11); CONTEXT special case |
| DATA-04 | `lib/api.ts` adapted; `getJson` ISR + fallback preserved | Code Examples — adapter pattern, `getProjects` added |
| DATA-05 | `lib/routes.ts` typed `const` array — 7 entries | Open Decisions §5 — exact 7-route shape with paths, labels, aria-labels |
| ROUTE-03 | `metadataBase` added to root `app/layout.tsx` | Code Examples — `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")` |
| TEST-01 | `homepage.test.tsx` deletion paired with Phase 2 replacement | NOT in Phase 1 — Phase 2's first commit pairs deletion with `terminal-shell.test.tsx` |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Type definitions (`lib/types.ts`) | Library (framework-agnostic) | — | Pure TypeScript shared between RSC fetchers and seed data; no runtime |
| Static seed data (`lib/portfolio-data.ts`) | Library | — | Imported by `lib/api.ts` fallback path; never touched by routes directly |
| Route registry (`lib/routes.ts`) | Library | — | Single source consumed by Sidebar (client), CommandPalette (client), `app/sitemap.ts` (server) |
| API client (`lib/api.ts`) | API/Backend (server-side fetch) | Library | RSC server-fetch with `next: { revalidate: 300 }`; never invoked client-side |
| HTTP response headers (security + engineer) | API/Backend (Next.js server runtime) | — | Set in `next.config.ts` `headers()`; applied by Vercel edge to every response |
| Build-output placeholder check (postbuild grep) | Build pipeline (npm script) | — | Runs after `next build` produces `.next/server/`; orthogonal to runtime |
| CI pipeline (GitHub Actions) | DevOps / external | — | Lives in `.github/workflows/`; gates merge to `main`; not in app runtime |
| `metadataBase` (root layout) | Frontend Server (SSR metadata) | — | Server-rendered `<head>` resolution for canonical/OG URLs |

## Standard Stack

### Core (production deps after Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^15.5` (target: `15.5.15`) | Framework — App Router, RSC, ISR, metadata, sitemap | Resolves CONCERNS.md security advisories on 15.3.2; latest 15.x is `15.5.15` (verified via `npm view next dist-tags --json`); next major (`16.x`) explicitly out of scope per PROJECT.md "stay on Next.js 15" [VERIFIED: npm registry 2026-05-06] |
| `react` | `19.1.0` (unchanged) | UI library | Already installed; no upgrade needed [VERIFIED: package.json] |
| `react-dom` | `19.1.0` (unchanged) | React renderer | Already installed; no upgrade needed [VERIFIED: package.json] |
| `next-themes` | `^0.4.6` (latest) | Theme management; `data-theme` attribute, OS preference, localStorage, SSR-flash-free | Peer deps `react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19` confirmed via `npm view next-themes peerDependencies` — React 19 supported [VERIFIED: npm registry 2026-05-06] |
| `cmdk` | `^1.1.1` (latest) | Command palette primitive — focus trap, type-to-filter, ARIA | Peer deps `react ^18 \|\| ^19 \|\| ^19.0.0-rc` confirmed [VERIFIED: npm registry 2026-05-06]; React 19 use-sync-external-store conflict fixed in 1.0.3+ [CITED: STACK.md §"What NOT to Use"] |

### Dev dependencies (Phase 1 changes)

| Library | Action | Version | Purpose |
|---------|--------|---------|---------|
| `eslint` | Upgrade | `^9.0.0` (latest: `10.3.0`; pin `^9.0.0` for ecosystem stability) | EOL on 8.57; flat-config migration target [VERIFIED: npm registry] |
| `eslint-config-next` | Upgrade | `^15.5.15` | Tracks `next` major; declares `eslint ^7.23 \|\| ^8 \|\| ^9` peer — flat-config compatible [VERIFIED: `npm view eslint-config-next@^15.5 peerDependencies`] |
| `knip` | Add | `^6.11.0` (latest) | Orphan-file/unused-export detector for INFRA-03 / D-03; zero-config on Next 15 + Vitest [VERIFIED: knip.dev/reference/plugins/next 2026-05-06] |
| `@vitest/coverage-v8` | Defer (NOT in Phase 1) | — | No coverage requirement until Phase 5 audit |
| `eslint-config-prettier` | Defer | — | No Prettier in repo today; not blocking |

### Versions explicitly NOT pinned

| Library | Why deferred to later phase |
|---------|------------------------------|
| `@vercel/analytics` | Phase 7 / DEPLOY-06 only |
| `@axe-core/playwright` | Phase 5 a11y audit only |
| `lucide-react` | Defer past v1 — Unicode glyphs sufficient (per STACK.md) |
| `zod` | Phase 6 / BACKEND-04 — URL/scheme validation on API responses |

### Installation (single command for new deps)

```bash
# Production deps (Phase 1 introduction; NOT used until Phase 2)
npm install next-themes@^0.4.6 cmdk@^1.1.1

# Upgrade Next + ESLint stack
npm install next@^15.5.15
npm install --save-dev eslint@^9 eslint-config-next@^15.5.15 knip@^6

# Optional: Next codemod can do the upgrade interactively
npx @next/codemod@latest upgrade latest
```

**Lockfile hygiene:** Run `npm install` (not `npm ci`) locally to regenerate `package-lock.json`; commit the lockfile alongside `package.json`. CI uses `npm ci` per D-05 — any out-of-sync lockfile fails the install step.

## Architecture Patterns

### System Architecture Diagram

```
                        ┌──────────────────────────────────────────┐
                        │ Phase 1 Foundation — what exists after   │
                        └──────────────────────────────────────────┘

  Developer Local                           CI (GitHub Actions on PR)
  ─────────────                             ─────────────────────────
  npm install                               actions/checkout@v4
        │                                          │
        ▼                                          ▼
  package.json (engines:22.x)              actions/setup-node@v4
  package-lock.json (committed)            (node-version-file: .nvmrc)
        │                                          │
        ▼                                          ▼
  npm run dev → localhost:3000             npm ci (lockfile-strict)
                                                    │
                                                    ▼
                                           lint → typecheck → test → knip → build
                                                    │
                                                    ▼ (any fail → block merge)
                                           ✓ Branch protection allows merge

  Build pipeline (developer or CI)
  ────────────────────────────────
  npm run build
        │
        ▼
  next build  ──→  emits .next/server/, .next/static/
        │
        ▼  (postbuild script chains)
  scripts/check-placeholders.mjs
        │
        ▼  (greps .next/server/ for `lorem|example.com|placeholder|TODO|Product Studio`)
  exit 0 (clean) ────────────────────► Vercel deploys
  exit 1 (hit found) ─────────────────► build fails, no deploy

  Runtime (per-request, per-route)
  ────────────────────────────────
  Browser request /any-route
        │
        ▼
  Next.js server (Vercel edge)
        │
        ▼
  next.config.ts headers()  ──→  HSTS, X-Content-Type-Options, Referrer-Policy,
                                 X-Frame-Options, Permissions-Policy,
                                 x-portfolio-source, x-built-with
        │
        ▼
  app/layout.tsx (RSC, has metadataBase)
        │
        ▼  (for routes that fetch)
  lib/api.ts → fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/...`, { next: { revalidate: 300 } })
        │                                       │
        ▼ (success)                             ▼ (failure: silent catch)
  Live API data ───────────────────────► lib/portfolio-data.ts (typed seed/fallback)
        │                                       │
        └──────────► RSC renders ◄──────────────┘
```

### Recommended Project Structure (post-Phase 1 state)

```
portfolio-web/
├── .github/
│   └── workflows/
│       └── ci.yml                          # NEW — Phase 1
├── .nvmrc                                  # NEW — pins Node 22 LTS
├── .gitignore                              # WIDENED — adds .env*, .env, .DS_Store
├── .eslintrc.json                          # DELETED — replaced by eslint.config.mjs
├── eslint.config.mjs                       # NEW — flat config
├── next.config.ts                          # UPDATED — headers() with security + engineer
├── package.json                            # UPDATED — deps, scripts (postbuild, knip, typecheck)
├── package-lock.json                       # REGENERATED — dep upgrades
├── tsconfig.json                           # UPDATED — target: ES2022
├── scripts/
│   └── check-placeholders.mjs              # NEW — INFRA-05 grep script
├── app/
│   ├── layout.tsx                          # UPDATED — adds metadataBase only (no shell yet)
│   ├── page.tsx                            # UNCHANGED in Phase 1 (still old homepage)
│   ├── globals.css                         # UNCHANGED in Phase 1 (Phase 2 owns)
│   ├── robots.ts                           # UNCHANGED
│   ├── sitemap.ts                          # UNCHANGED in Phase 1 (Phase 2 / ROUTE-04 iterates routes)
│   └── components/
│       ├── homepage.tsx                    # UNCHANGED in Phase 1 (Phase 2 deletes)
│       ├── homepage.test.tsx               # UNCHANGED in Phase 1 (Phase 2 deletes)
│       └── theme-toggle.tsx                # UNCHANGED in Phase 1 (Phase 2 deletes)
├── lib/
│   ├── types.ts                            # REWRITTEN — terminal data model
│   ├── portfolio-data.ts                   # NEW — typed seed (real-where-trivial / TODO)
│   ├── fallback-data.ts                    # DELETED — paired with portfolio-data introduction
│   ├── routes.ts                           # NEW — 7-route typed const
│   └── api.ts                              # ADAPTED — new shape, getProjects added, getJson preserved
└── public/
    └── resume.pdf                          # UNCHANGED (50-byte placeholder remains; Phase 6 replaces)
```

### Pattern 1: Postbuild grep (NOT prebuild) for INFRA-05

**What:** A `postbuild` script in `package.json` runs after `next build` produces `.next/server/`, greps for forbidden strings, exits non-zero on hit.

**When to use:** Always — for any "what actually shipped?" check. Prebuild semantics are wrong here because there is no build output yet to inspect.

**Example:** See Code Examples §1.

### Pattern 2: ESLint 9 flat config with `eslint-config-next`

**What:** Replace `.eslintrc.json` with `eslint.config.mjs` using `defineConfig` from `eslint/config` and the flat-config export from `eslint-config-next/core-web-vitals`.

**When to use:** Now — `next lint` is deprecated in 15.5 and removed in 16; flat config is the official path forward.

**Example:** See Code Examples §3.

### Pattern 3: Hand-mirrored types (`lib/types.ts`)

**What:** Plain TypeScript interfaces describing the API response shape. Single developer owns frontend + sibling backend, so manual sync via paired commits is the lowest-cost approach for v1. (`zod` codegen deferred per ARCHITECTURE.md §"Backend Contract & Type Sharing".)

**When to use:** Until the API surface grows beyond ~10 endpoints or a third consumer (e.g. mobile app) appears.

**Example:** See Code Examples §5.

### Pattern 4: Single registry → three consumers (`lib/routes.ts`)

**What:** Define routes once as a typed `const` array; Sidebar, CommandPalette, and `app/sitemap.ts` all import from it. Adding a route is a one-line change.

**When to use:** Always for this project. Anti-Pattern 5 in ARCHITECTURE.md is "hand-maintaining sitemap entries."

**Example:** See Code Examples §6.

### Anti-Patterns to Avoid

- **Skipping the postbuild grep "because we'll add real content soon":** The grep IS the discipline. INFRA-05 is what enforces D-10's TODO marker convention as a build gate.
- **Deleting `homepage.tsx` in Phase 1:** Brownfield discipline says delete-with-replace in same commit. Phase 2 ships the replacement; Phase 1 only deletes `fallback-data.ts` because it has a same-phase replacement (`portfolio-data.ts`).
- **Bumping `next` to `16.x`:** Out of scope per PROJECT.md "stay on Next.js 15"; 16 deprecates `next lint` removal and changes `next/image` defaults — would invalidate prior research.
- **Adding `zod` to `lib/api.ts` in Phase 1:** Deferred to Phase 6 per D-16; the placeholder API risk surface in Phase 1 is dormant (data comes from developer-controlled `portfolio-data.ts`).
- **Pinning `engines.node: ">=22"`:** Vercel rejects this format with `Error: Found invalid Node.js Version`. Use `"22.x"` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme management (data-theme attr, SSR-flash, OS pref, localStorage) | Custom theme provider | `next-themes@^0.4.6` (Phase 2) | Phase 1 installs it; Phase 2 wires it |
| Command palette (focus trap, type-to-filter, ARIA, keyboard nav) | Custom modal + dialog logic | `cmdk@^1.1.1` (Phase 2) | Phase 1 installs it; Phase 2 wires it |
| Orphan file detection (find unused exports/files in TypeScript project) | Hand-rolled `find` + `grep` | `knip@^6` | Zero-config Next.js + Vitest support; non-zero exit by default |
| Lockfile-strict CI installs | `npm install` | `npm ci` (D-05) | Native — fails on out-of-sync `package-lock.json` |
| Node version selection in CI | Hardcoded version string in workflow | `actions/setup-node@v4` `node-version-file: .nvmrc` | Single source of truth; matches local dev |
| Postbuild artifact verification | Inline shell in package.json | Dedicated Node script (`scripts/check-placeholders.mjs`) | Cross-platform (Windows dev), exit code clarity, easy to test |
| `metadataBase` resolution | Manually constructing canonical URLs in every page | Set once in root `app/layout.tsx` | Next.js metadata API handles inheritance; per-route `alternates.canonical` becomes "/relative" |

**Key insight:** Phase 1 is a "bring in the standard tools and configure them correctly" phase. The hand-rolled inline theme script in current `app/layout.tsx` is being replaced wholesale by `next-themes` in Phase 2; Phase 1 just stages the dependency.

## Runtime State Inventory

This is a brownfield refactor (deletions + restructuring). The grep audit alone is insufficient — these runtime systems may carry stale state past the file deletions:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | None — repo has no embedded database, ChromaDB collection, Mem0 store, or Redis. | None. Verified by `lib/api.ts` reading remote API only. |
| **Live service config** | None at Phase 1 boundary — Vercel project not yet deployed (`README.md` says Vercel is target but no production URL exists). | None. Phase 7 will configure `NEXT_PUBLIC_SITE_URL` in Vercel project env when deploy lands. |
| **OS-registered state** | None — no Windows Task Scheduler tasks, no pm2 processes, no launchd plists, no systemd unit names registered for this project. | None. |
| **Secrets and env vars** | `.env.example` declares `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL` only. Both are public (`NEXT_PUBLIC_` prefix). No secrets. The Phase 1 changes do NOT rename either. | None for Phase 1. `.gitignore` widens to `.env*.local`, `.env` defensively (per D-discretion §"Dev tooling hygiene") — code does not read these new keys yet. |
| **Build artifacts / installed packages** | `.next/` is gitignored and re-emitted on every build. `node_modules/` regenerates from lockfile. **One concern:** dep upgrades (`next`, `eslint`, etc.) require `package-lock.json` regeneration; an existing `node_modules/` from the old lockfile must be wiped. | Run `rm -rf node_modules .next && npm install` after `package.json` updates to ensure a clean install. CI's `npm ci` then verifies reproducibility from the new lockfile. |

**Localstorage keys (browser-side state — relevant for Phase 2, not Phase 1):**
- `portfolio-theme` — read by current inline script in `app/layout.tsx`. Phase 1 leaves this alone (script still present, still functional). Phase 2 replaces with `next-themes` default `theme` key OR keeps `portfolio-theme` via `storageKey` prop — Phase 2 plan decides. **No Phase 1 action required.**
- `portfolio-accent` — does not exist yet (Phase 2 introduces).

**Documented for the planner:** Phase 1 introduces no new runtime state. The atomic dep upgrade is the only "wipe and reinstall" action.

## Common Pitfalls

### Pitfall A: Lockfile drift on dep upgrade

**What goes wrong:** Bumping `next`, `eslint`, `eslint-config-next`, plus adding `next-themes`, `cmdk`, `knip` requires `package-lock.json` regeneration. If the developer commits `package.json` without updating the lockfile, CI's `npm ci` fails on the first run.
**Why it happens:** `npm install` regenerates the lockfile but a tired developer might `git add package.json` only.
**How to avoid:** After every dep change: `rm -rf node_modules && npm install` then `git add package.json package-lock.json`. The CI `npm ci` step is what catches this; merge can't proceed without lockfile sync.
**Warning signs:** CI step `npm ci` log shows `EUSAGE: Missing: <pkg>@<ver> from lock file` — re-run `npm install` locally.

### Pitfall B: Knip false positives blocking PRs day 1

**What goes wrong:** Knip runs zero-config but may flag `next-themes` or `cmdk` as unused (Phase 1 installs them but doesn't use them — Phase 2 wires them up). CI hard-fails on the first PR after Phase 1 ships.
**Why it happens:** D-03 says hard-fail on any orphan; the deps are intentionally installed-not-yet-used.
**How to avoid:** Add `next-themes` and `cmdk` to `knip.json` `ignoreDependencies` list explicitly with a comment ("Used in Phase 2 — see roadmap"). Plan to remove the entries in the Phase 2 commit that imports them.
**Warning signs:** First PR's CI log shows "unused dependencies: next-themes, cmdk."

### Pitfall C: Vercel rejecting `engines.node: ">=22"`

**What goes wrong:** Vercel build returns `Error: Found invalid Node.js Version: ">=22"`. Per `[CITED: vercel.com/docs/.../node-js-versions]` and Vercel community thread, the engines field must use `"22.x"` major-version shorthand — not open-ended ranges.
**Why it happens:** D-04 in CONTEXT.md (`<specifics>`) specifies `>=22` based on a misreading of npm semver semantics; this is correct for npm but Vercel applies its own validator.
**How to avoid:** Use `"engines": { "node": "22.x" }`. Combined with `.nvmrc` containing `22.15.0` or `22` (whichever LTS minor is current), local dev and Vercel align.
**Warning signs:** Vercel deploy fails at "Configuring Node.js Version" step with an `engines` validation error.

### Pitfall D: `metadataBase` warning persisting after Phase 1

**What goes wrong:** Adding `metadataBase: new URL(...)` to `app/layout.tsx` resolves the build warning, but only if the URL string has a trailing slash and a valid scheme. `process.env.NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` — but `new URL()` requires that string to be a fully-qualified URL with scheme. Empty-string env vars cause `Invalid URL` runtime errors.
**Why it happens:** `NEXT_PUBLIC_SITE_URL=` (empty) bypasses the nullish coalescing `??` because empty string is not nullish.
**How to avoid:** Use `process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"` (logical OR — falls back on empty string) instead of `??`. Or validate at module load.
**Warning signs:** `npm run build` log shows `TypeError: Invalid URL` instead of the expected zero `metadataBase` warnings.

### Pitfall E: Inline theme script + flat-config ESLint conflict

**What goes wrong:** `eslint-config-next` includes `@next/next/inline-script-id` which warns on `<script dangerouslySetInnerHTML>` without an `id`. The current inline theme script in `app/layout.tsx:34` lacks one. After ESLint 9 migration, this lint warning may surface as an error (D-02 chains lint as a hard CI fail).
**Why it happens:** The rule applies to `next/script` specifically, not raw `<script>`, but the rule message is easy to misread.
**How to avoid:** Verify the rule scope (`@next/next/inline-script-id` checks `<Script>` from `next/script`, not raw `<script>`). The current pattern is fine. If a stricter rule fires, add an `id` attribute to the script.
**Warning signs:** First post-migration `npm run lint` shows a complaint about the theme bootstrap script.

### Pitfall F: `lib/fallback-data.ts` deletion before `lib/api.ts` imports updated

**What goes wrong:** The brownfield discipline rule says delete-with-replace in same commit. If `lib/fallback-data.ts` is deleted but `lib/api.ts` still imports `fallbackProfile`, etc., TypeScript compilation fails — and the failure may be invisible if ordering is wrong.
**Why it happens:** The atomic operation is: write `lib/types.ts` (new shapes), write `lib/portfolio-data.ts`, update `lib/api.ts` imports, delete `lib/fallback-data.ts` — in one commit. Any partial state breaks compilation.
**How to avoid:** Sequence the planning task as a single multi-file change. Don't split across commits. Run `tsc --noEmit` locally before committing.
**Warning signs:** `Cannot find module './fallback-data'` in any compilation output.

## Code Examples

### §1 — INFRA-05 postbuild placeholder grep

**Decision:** `postbuild` (not `prebuild`). Reasoning: prebuild runs before `next build` produces output, so there is nothing to grep. Postbuild greps the actual emitted server bundles in `.next/server/`, which is what reaches production.

**File:** `scripts/check-placeholders.mjs` (NEW)

```js
#!/usr/bin/env node
// scripts/check-placeholders.mjs
// Postbuild gate: fails build if .next/server/ contains forbidden strings.
// Implements INFRA-05 / D-11.
//
// Forbidden strings (case-sensitive — TODO is the marker, "todo" in prose passes):
//   lorem
//   example.com
//   placeholder
//   TODO
//   Product Studio
//
// Exits 0 on clean, 1 on any hit.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const BUILD_DIR = ".next/server";
const FORBIDDEN = [
  /lorem/i,            // case-insensitive on lorem (covers "Lorem ipsum")
  /example\.com/i,     // case-insensitive on placeholder domain
  /placeholder/i,
  /TODO/,              // CASE-SENSITIVE — D-10 grammar (uppercase + ":" makes it a marker)
  /Product Studio/,    // CASE-SENSITIVE — exact demo company name from CONCERNS.md
];
const SCAN_EXTENSIONS = new Set([".js", ".html", ".json", ".rsc", ".txt"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (SCAN_EXTENSIONS.has(extname(p))) yield p;
  }
}

const hits = [];
for (const file of walk(BUILD_DIR)) {
  const contents = readFileSync(file, "utf8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(contents)) {
      hits.push({ file, pattern: pattern.source });
    }
  }
}

if (hits.length > 0) {
  console.error("\n✗ INFRA-05: Forbidden strings found in build output:\n");
  for (const { file, pattern } of hits) {
    console.error(`  ${file}: matched /${pattern}/`);
  }
  console.error(`\nFAIL: ${hits.length} hit(s) across ${BUILD_DIR}/`);
  process.exit(1);
}

console.log(`✓ INFRA-05: ${BUILD_DIR}/ clean (no forbidden strings)`);
process.exit(0);
```

**File:** `package.json` (script wiring)

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postbuild": "node scripts/check-placeholders.mjs",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "knip": "knip"
  }
}
```

**Why postbuild and not prebuild:**
1. `prebuild` runs before `next build` — there is no `.next/server/` to grep.
2. A separate "build the bundle, check it, then publish" model is canonical (postbuild is exactly this hook).
3. `npm run build` chains `prebuild → build → postbuild` automatically — no extra invocation needed.
4. Failed `postbuild` = failed `npm run build` = failed CI = no Vercel deploy. The chain is intact.

**Case sensitivity note (D-10 grammar):** `TODO` and `Product Studio` are case-sensitive (developers write `todo` in prose comments without tripping the grep). `lorem`, `example.com`, `placeholder` are case-insensitive (these are clearly placeholder-y in any case).

### §2 — INFRA-04 `next.config.ts` headers

**File:** `next.config.ts` (UPDATED)

```ts
// next.config.ts
import type { NextConfig } from "next";

// GitHub repo URL — update if the repo moves
const PORTFOLIO_SOURCE = "https://github.com/beckinfonet/portfolio-web";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const engineerHeaders = [
  { key: "x-portfolio-source", value: PORTFOLIO_SOURCE },
  { key: "x-built-with", value: "nextjs-15-react-19" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...engineerHeaders],
      },
    ];
  },
};

export default nextConfig;
```

**Source:** D-13/D-14 verbatim; HSTS preload format per Mozilla Observatory recommendation; `Permissions-Policy` deny-list pattern per [CITED: developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy].

### §3 — ESLint 9 flat-config migration

**File:** `eslint.config.mjs` (NEW — replaces `.eslintrc.json`)

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "design_handoff_terminal_portfolio/**", // referenced documentation only — not source
  ]),
]);
```

**Source:** [CITED: nextjs.org/docs/app/api-reference/config/eslint] (Next 15.5+ recommended pattern, verified 2026-05-06).

**Migration steps:**
1. `rm .eslintrc.json`
2. Create `eslint.config.mjs` (above)
3. Update `package.json` scripts: `"lint": "eslint ."` (replaces `eslint . --ext .ts,.tsx` — flat config infers extensions from `files` patterns in `eslint-config-next`)
4. `npm run lint` to verify zero new errors

**`design_handoff_terminal_portfolio/` is added to globalIgnores** because it contains JSX prototypes (`app.jsx`, `tweaks-panel.jsx`) that are NOT source code (per CLAUDE.md and codebase/STRUCTURE.md). Without ignoring, ESLint will fail on those files.

### §4 — Knip configuration

**File:** `knip.json` (NEW) — start with the explicit minimum; tune false positives as they appear.

```json
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "ignoreDependencies": [
    "next-themes",
    "cmdk"
  ],
  "ignore": [
    "design_handoff_terminal_portfolio/**",
    "scripts/**"
  ]
}
```

**Why these entries:**
- `ignoreDependencies: ["next-themes", "cmdk"]` — Phase 1 installs these but they are not imported until Phase 2's shell work. Without this entry, Knip would hard-fail CI per D-03. Comment in the file: "Remove these entries when Phase 2 imports them."
- `ignore: ["design_handoff_terminal_portfolio/**"]` — design references, not source code; CLAUDE.md says "leave in repo, don't import."
- `ignore: ["scripts/**"]` — `scripts/check-placeholders.mjs` is invoked via package.json `postbuild`, but Knip doesn't auto-detect package.json `scripts` references for non-bin files; ignoring scripts/ is safer than fighting Knip's discovery.

**CI invocation:** plain `knip` exits non-zero on any finding by default — no `--no-exit-code`, no `--reporter` needed. [CITED: knip.dev/guides/using-knip-in-ci, 2026-05-06]

**Reference for entry-point auto-detection:** Knip's Next.js plugin auto-detects `app/**/page`, `layout`, `route`, `template`, `error`, `not-found`, `loading`, `manifest`, `robots`, `sitemap`, `icon`, `apple-icon`, `opengraph-image`, `twitter-image`, plus `next.config.{js,ts,cjs,mjs}` and `middleware.{js,ts}`. Vitest plugin auto-detects `**/*.{test,spec}.{ts,tsx}`. Zero additional `entry` config needed for this repo. [CITED: knip.dev/reference/plugins/next, 2026-05-06]

### §5 — `lib/types.ts` rewrite

**Source of truth for field shapes:** `design_handoff_terminal_portfolio/app.jsx` (605 lines) view rendering — what each view actually reads from `data`. Verified by reading lines 287–470 of the prototype.

**File:** `lib/types.ts` (REWRITTEN)

```ts
/**
 * Terminal Portfolio domain types — single source of truth shared with sibling
 * portfolio-services backend (per ARCHITECTURE.md hand-mirrored discipline).
 *
 * Field shapes are derived from design_handoff_terminal_portfolio/app.jsx.
 * Backend changes ship as paired commits per CLAUDE.md Brownfield discipline.
 */

/** A single accent-block stat card on the about view (e.g. "7+ Years shipping"). */
export interface Highlight {
  /** Large accent-colored value text, 22px/700. e.g. "7+", "AWS", "AI". */
  value: string;
  /** Muted 11px label below the value. e.g. "Years shipping". */
  label: string;
}

/** Bio paragraphs split for short blurbs vs. full about-view body. */
export interface Bio {
  /** One-line short bio for SEO meta-description and JSON-LD `description` field. */
  short: string;
  /** Two-paragraph long bio rendered on about view (max 68ch). */
  long: string[];
}

/** A social/contact link rendered in palette + about + contact views. */
export interface Social {
  /** Display label, e.g. "GitHub", "LinkedIn", "Mastodon". Renders lowercased + "/" suffix in about. */
  label: string;
  /** Short handle for contact view, e.g. "@bakytbek". */
  handle: string;
  /** Full external URL, https only (validated in Phase 6 / BACKEND-04). */
  url: string;
  /** Discriminator for contact-view label column ordering / icons. */
  kind: "github" | "linkedin" | "mastodon" | "bluesky" | "x" | "email" | "other";
}

/** Top-level `Profile` — the about/contact-view payload. */
export interface Profile {
  /** Full name, e.g. "Bakytbek Tatibekov". */
  name: string;
  /** Short name for breadcrumb / palette, e.g. "Bakytbek". */
  shortName: string;
  /** Two-letter initials for avatar fallback, e.g. "BT". */
  initials: string;
  /** Job title rendered in `// Sr. Software Engineer` accent subline. */
  role: string;
  /** Plain location string, e.g. "Almaty, Kazakhstan" or "Remote (UTC+5)". */
  location: string;
  /** Real email address; rendered as mailto + copyable plain text. */
  email: string;
  /** Path to the resume PDF; defaults to "/resume.pdf". */
  resumeUrl: string;
  /** Short and long bio. */
  bio: Bio;
  /** Highlight stat cards for about view (3 entries expected). */
  highlights: Highlight[];
  /** Ordered social links (sidebar-render order). */
  socials: Social[];
}

/** A single `projects/` view entry. */
export interface Project {
  /** Project name, accent 15px/600. */
  name: string;
  /** Year string (e.g. "2024", "2023"). Sorted desc by view. */
  year: string;
  /** Status string (e.g. "shipped", "active", "archived"). Renders warn-yellow. */
  status: string;
  /** 1-2 line summary, 13px body. */
  summary: string;
  /** Tech chips list. e.g. ["TypeScript", "Next.js", "AWS"]. */
  tech: string[];
  /** Role on project, e.g. "lead", "ic". Right-column muted text. */
  role: string;
  /** External link to live site / repo / case study. https only. */
  link: string;
}

/** A single `experience.log` view entry. */
export interface Experience {
  /** Company name, muted "@ company" rendering. */
  company: string;
  /** Job title, accent 600. */
  role: string;
  /** Period string, e.g. "2022 – present", "2019 – 2022". Right-aligned muted 12px. */
  period: string;
  /** Summary text, max 64ch. */
  summary: string;
}

/** A single `writing/` view post. */
export interface Writing {
  /** Post title, accent 16px/600. Prefixed with "›". */
  title: string;
  /** Date string for micro-meta line, e.g. "April 2026". Uppercased on render. */
  date: string;
  /** Read-time string, e.g. "5 min read". Joined with date by " · ". */
  readTime: string;
  /** Excerpt, 13px body, max 64ch. */
  excerpt: string;
  /** External link to full post. https only. */
  link: string;
  /** URL slug for sitemap entries (Phase 6 — initial v1 may have empty list). */
  slug: string;
}

/** A single `shipped.app` view entry — the 7th view (added beyond handoff). */
export interface ShippedApp {
  /** App name, accent 600. */
  name: string;
  /** Platforms list — limited to two for v1. */
  platforms: ReadonlyArray<"ios" | "android">;
  /** App Store URL (https://apps.apple.com/...) — required if platforms includes "ios". */
  appStoreUrl?: string;
  /** Google Play URL (https://play.google.com/...) — required if platforms includes "android". */
  googlePlayUrl?: string;
  /** Role on app, e.g. "lead", "co-creator". */
  role: string;
  /** Year shipped or year of major release. */
  year: string;
  /** Short summary line. */
  summary?: string;
}

/** A category in `stack.json` view — rendered as `"key": ["item1", "item2"]`. */
export interface StackCategory {
  /** Category name, e.g. "languages", "frameworks", "cloud", "ai". Renders warn-yellow string. */
  category: string;
  /** Items list, e.g. ["TypeScript", "Python"]. Renders accent string array. */
  items: string[];
}
```

**Design-driven shape decisions (derived from `app.jsx`):**

1. **`Project.tech: string[]`** — not `TechChip[]`. The chip is a presentation primitive (`<span style={S.chip}>`); the data is just strings. Verified at `app.jsx:340`: `{p.tech.map(t => <span key={t} style={S.chip}>{t}</span>)}`.
2. **`ShippedApp.platforms: ('ios'|'android')[]`** — discriminated union, both URLs optional with conditional requirement. The view will need both URLs present iff that platform is listed; runtime validation deferred to Phase 6.
3. **`Social.kind` enum** — added so contact view can render the correct label uppercase column ordering and provide an icon hint. Not present in the prototype because `app.jsx` hardcodes social order; the type-level discriminator pays for itself in Phase 3 view rendering.
4. **`StackCategory.items: string[]`** with a `category` discriminator — the prototype renders `Object.entries(data.stack)` as `Record<string, string[]>` (keyed object). The frontend type is converted to an ordered array of `{ category, items }` pairs because:
   - Object key order is technically deterministic in modern JS but explicit ordering by array index is clearer.
   - It allows the backend (`portfolio-services`) to send the categories in a controlled order without relying on JSON object semantics.
   - The view code becomes `data.stack.map(({ category, items }) => ...)` which is identical to `Object.entries` ergonomically.
5. **`Bio.long: string[]`** — paragraph array, not a single string. Verified at `app.jsx:299`: `{data.bio.long.map((p, i) => <p key={i} style={S.para}>{p}</p>)}`.
6. **`Highlight.value` and `.label`** as separate fields — verified at `app.jsx:300-306`. Big text is `value`, small text is `label`. No "icon" field needed (handoff has none).
7. **`Writing.slug`** included for Phase 6 dynamic-route option but the v1 view may render `link` only without dynamic routing. Forward-compatible.

### §6 — `lib/portfolio-data.ts` (real-where-trivial / TBD-where-not)

**File:** `lib/portfolio-data.ts` (NEW — replaces `lib/fallback-data.ts`)

```ts
import type {
  Profile,
  Project,
  Experience,
  Writing,
  ShippedApp,
  StackCategory,
} from "./types";

/**
 * Static seed/fallback data for the terminal portfolio.
 *
 * Strategy: real-where-trivial, "TODO:" markers where Phase 6 fills.
 * INFRA-05 postbuild grep includes "TODO" — any deploy attempted before
 * Phase 6 fills the markers fails the build (D-10).
 *
 * Real now (per D-08):
 *   - identity, location, email, real GitHub/LinkedIn URLs, stack categories.
 *
 * TBD now (per D-09 — Phase 6 fills):
 *   - bio, highlights, projects, writing, shippedApps, experience.
 */

export const PROFILE: Profile = {
  name: "Bakytbek Tatibekov",
  shortName: "Bakytbek",
  initials: "BT",
  role: "Sr. Software Engineer",
  location: "TODO: location string",                     // D-09 — confirm city/country/UTC offset
  email: "TODO: real email",                             // D-09 — replaces beck@example.com leak
  resumeUrl: "/resume.pdf",
  bio: {
    short: "TODO: short bio (one line, SEO meta-description)",
    long: ["TODO: bio paragraph 1", "TODO: bio paragraph 2"],
  },
  highlights: [
    { value: "TODO", label: "TODO: stat label 1" },
    { value: "TODO", label: "TODO: stat label 2" },
    { value: "TODO", label: "TODO: stat label 3" },
  ],
  socials: [
    { label: "GitHub",   handle: "TODO: handle", url: "TODO: real github url",   kind: "github"   },
    { label: "LinkedIn", handle: "TODO: handle", url: "TODO: real linkedin url", kind: "linkedin" },
    // Additional public profiles (Mastodon, Bluesky, X) are developer's call at planning time per D-08.
  ],
};

export const PROJECTS: Project[] = [
  // Phase 6 fills with ≥3 real entries.
  // Empty array is acceptable shape-wise; postbuild grep does NOT fire on empty arrays.
];

export const EXPERIENCE: Experience[] = [
  // Phase 6 fills.
];

export const WRITING: Writing[] = [
  // Phase 6 fills (or v1 ships with empty array + "coming soon" UI per CONTENT-04).
];

export const SHIPPED: ShippedApp[] = [
  // Phase 6 fills with real App Store / Play Store URLs.
];

export const STACK: StackCategory[] = [
  // Real list per D-08:
  { category: "languages",  items: ["TypeScript", "Python", "Swift"] },
  { category: "frameworks", items: ["Next.js", "React", "React Native"] },
  { category: "cloud",      items: ["AWS"] },
  { category: "ai",         items: ["LangChain", "agentic systems"] },
  // Developer confirms exact list during Phase 1 planning.
];
```

**Critical detail (D-10 self-enforcement):** Every `TODO:` string is a build gate. If a developer runs `npm run build && npm start` before filling these in, the postbuild grep fails. If they bypass the postbuild somehow (`next build` directly), the TODO strings still leak into `.next/server/` and would be detected by any second `npm run build` with the postbuild script. This is the design intent of D-10.

**For empty arrays:** The postbuild grep only catches strings, not array shapes. Empty arrays render as zero entries in their respective views — which is acceptable per CONTENT-04 (empty writing/projects state is allowed for v1 if explicitly chosen). Phase 6 fills with real content.

### §7 — `lib/api.ts` adaptation

**File:** `lib/api.ts` (UPDATED — preserves `getJson` ISR + silent fallback)

```ts
import {
  PROFILE,
  PROJECTS,
  EXPERIENCE,
  WRITING,
  SHIPPED,
  STACK,
} from "./portfolio-data";
import type {
  Profile,
  Project,
  Experience,
  Writing,
  ShippedApp,
  StackCategory,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

/**
 * ISR-cached fetch with silent fallback. Existing pattern preserved per DATA-04.
 * Phase 6 / BACKEND-04 will add zod schema validation and URL/scheme guards.
 */
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getProfile(): Promise<Profile> {
  return getJson<Profile>("/api/profile", PROFILE);
}

export async function getProjects(): Promise<Project[]> {
  return getJson<Project[]>("/api/projects", PROJECTS);
}

export async function getExperience(): Promise<Experience[]> {
  return getJson<Experience[]>("/api/experience", EXPERIENCE);
}

export async function getWriting(): Promise<Writing[]> {
  return getJson<Writing[]>("/api/posts", WRITING);
}

export async function getShipped(): Promise<ShippedApp[]> {
  return getJson<ShippedApp[]>("/api/apps", SHIPPED);
}

export async function getStack(): Promise<StackCategory[]> {
  return getJson<StackCategory[]>("/api/stack", STACK);
}
```

**Migration notes:**
- Old `getSkills` (`Skill[]`) → new `getStack` (`StackCategory[]`). Backend endpoint may or may not be renamed in Phase 6 — frontend type is the contract.
- Old `getApps` (`MobileApp[]`) → new `getShipped` (`ShippedApp[]`). Same as above.
- Old `getPosts(limit)` → new `getWriting()`. Limit removed; sibling backend can decide pagination later.
- New `getProjects()` added (BACKEND-01 in Phase 6 will provide `/api/projects`).
- `getJson<T>()` helper signature unchanged.

### §8 — `lib/routes.ts` registry (DATA-05 / ROUTE-03 prep)

**File:** `lib/routes.ts` (NEW)

```ts
/**
 * Single source of truth for terminal-shell routes.
 * Consumed by:
 *   - app/components/shell/sidebar.tsx (Phase 2)
 *   - app/components/shell/command-palette.tsx (Phase 2)
 *   - app/sitemap.ts (Phase 2 — ROUTE-04 iterates)
 *
 * Order in this array is the sidebar render order.
 *
 * Adding an 8th view (e.g. hire-me.txt) is a one-line change here.
 */

export interface Route {
  /** Route segment (matches Next.js folder name). null for index `/`. */
  readonly slug: string | null;
  /** Pathname including leading slash. Always starts with "/". */
  readonly pathname: string;
  /** Visible sidebar label (file metaphor). */
  readonly label: string;
  /** Plain-noun ARIA label for screen readers (per Pitfall 5 / A11Y-04). */
  readonly ariaLabel: string;
  /** Short description for OG meta + palette tooltip. */
  readonly description: string;
}

export const ROUTES = [
  {
    slug: null,
    pathname: "/",
    label: "about.md",
    ariaLabel: "About",
    description: "About — Sr. Software Engineer; bio, highlights, contact",
  },
  {
    slug: "projects",
    pathname: "/projects",
    label: "projects/",
    ariaLabel: "Projects",
    description: "Projects — engineering work, sorted by year",
  },
  {
    slug: "stack",
    pathname: "/stack",
    label: "stack.json",
    ariaLabel: "Tech stack",
    description: "Tech stack — languages, frameworks, cloud, AI",
  },
  {
    slug: "experience",
    pathname: "/experience",
    label: "experience.log",
    ariaLabel: "Experience",
    description: "Experience — roles, companies, periods, highlights",
  },
  {
    slug: "writing",
    pathname: "/writing",
    label: "writing/",
    ariaLabel: "Writing",
    description: "Writing — technical posts and notes",
  },
  {
    slug: "contact",
    pathname: "/contact",
    label: "contact.sh",
    ariaLabel: "Contact information",
    description: "Contact — email, GitHub, LinkedIn, social profiles",
  },
  {
    slug: "shipped",
    pathname: "/shipped",
    label: "shipped.app",
    ariaLabel: "Shipped apps",
    description: "Shipped apps — App Store and Google Play releases",
  },
] as const satisfies readonly Route[];

/** Type alias for narrowed segment values used by useSelectedLayoutSegment. */
export type RouteSegment = (typeof ROUTES)[number]["slug"];
```

**The 7th route confirmed:** `shipped.app` at `/shipped`. The handoff originally specified 6 views; the project requirements explicitly add a 7th `shipped.app` view (per ROADMAP.md "added beyond handoff" and PROJECT.md key decisions). The 7 routes are: about, projects, stack, experience, writing, contact, shipped. **About maps to `/` (index), not `/about`** — per ROUTE-01 in REQUIREMENTS.md: `/` (about), `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`.

### §9 — Root `app/layout.tsx` `metadataBase` (ROUTE-03)

**File:** `app/layout.tsx` (UPDATED — `metadataBase` added; everything else unchanged in Phase 1)

```tsx
import type { Metadata } from "next";
import "./globals.css";

// Use logical OR (||) not nullish coalescing (??) — empty string is not nullish
// but is an invalid URL input. (See Pitfall D.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  // ROUTE-03: resolves the existing build warning.
  metadataBase: new URL(siteUrl),
  title: "Beck Maldin | Mobile & Full-Stack Engineer",  // Phase 2 will rewrite to "Bakytbek Tatibekov — Sr. Software Engineer"
  description:
    "Recruiter-friendly portfolio featuring mobile apps, experience timeline, skills, and technical writing.",
  openGraph: {
    title: "Beck Maldin Portfolio",
    description: "Mobile and full-stack engineering portfolio.",
    type: "website",
  },
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("portfolio-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
```

**Phase 1 boundary on `app/layout.tsx`:** ONLY `metadataBase` is added. The inline theme script, the title/description, openGraph block, ThemeProvider wiring — all stay as-is until Phase 2 (which deletes/rewrites the layout for the persistent shell). This keeps Phase 1 mechanical and safe.

## State of the Art

| Old approach (in current codebase) | Current approach | When changed | Impact for Phase 1 |
|--------------|------------------|--------------|--------|
| `next@15.3.2` with critical advisories | `next@^15.5.15` | 15.5.0 (Aug 2025) | INFRA-01; security fix |
| `.eslintrc.json` legacy config | `eslint.config.mjs` flat config | ESLint 9 (Apr 2024); Next 15.5 official path Aug 2025 | D-discretion; D-02 lint step |
| `next lint` build command | `next build` runs lint inline (15.5); explicit `eslint .` script (15.5+) | Next 15.5 deprecates `next lint`; Next 16 removes it | Use `eslint .` script directly (covered by §3) |
| `ESLint 8` (EOL Oct 2024) | `ESLint 9` LTS | 9.0.0 release | Update; flat config required |
| `tsconfig.json target: ES2017` | `target: ES2022` | Modern Node + browsers | D-discretion bump |
| `lib/fallback-data.ts` with leaks (`beck@example.com`, `Product Studio`) | `lib/portfolio-data.ts` real-where-trivial + TODO markers | Phase 1 introduces | DATA-02/03 |
| `Skill`, `MobileApp`, `BlogPost` interfaces | `StackCategory`, `ShippedApp`, `Writing` | Phase 1 rewrite | DATA-01 |
| Single-route sitemap | 7-entry sitemap from `lib/routes.ts` | Phase 2 / ROUTE-04 (Phase 1 only exports the registry) | DATA-05 |

**Deprecated/outdated (NOT in this Phase 1 codebase to flag for cleanup):**
- ESLint 8 (EOL): Phase 1 migrates to 9.
- `next/legacyBehavior`: Not used in this codebase, but flag for any future Phase 2 work — Next 16 will remove it.
- `next/amp`: Not used; Next 16 will remove. Safe.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Real GitHub URL is `https://github.com/beckinfonet/portfolio-web` | INFRA-04 `next.config.ts` `x-portfolio-source` value | If wrong, `curl -I` returns a header pointing to a non-existent or wrong repo. Easy fix in Phase 1 planning — confirm with developer at planning time. |
| A2 | The 7 routes in REQUIREMENTS.md ROUTE-01 are: `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` (about → `/`, NOT `/about`) | `lib/routes.ts` shape (§5/§8) | This is `[CITED: REQUIREMENTS.md ROUTE-01]` not assumed — but worth surfacing because some terminal portfolios use `/about` as a sibling. Source-truth confirms `/`. |
| A3 | The 7 v1 stack categories are: `languages`, `frameworks`, `cloud`, `ai`. Only items lists are TBD. | `lib/portfolio-data.ts` (§6) `STACK` | If wrong, Phase 6 reorganizes categories. Low risk — exact taxonomy is `D-08` real-now territory but the developer confirms specific items at planning time. |
| A4 | Empty arrays for `PROJECTS`, `EXPERIENCE`, `WRITING`, `SHIPPED` are acceptable shape-wise for Phase 1 (postbuild grep doesn't fire on empty arrays). | `lib/portfolio-data.ts` (§6) | If a downstream consumer (Phase 2 sidebar?) errors on empty `PROJECTS`, the workaround is a single-element array with all `TODO:` strings. Low risk. |
| A5 | `Permissions-Policy: camera=(), microphone=(), geolocation=()` syntax is correct for the deny-list semantic. | INFRA-04 (§2 Code Examples) | Spec evolved; modern syntax uses `()` empty allowlist for "deny all origins." Verified against MDN 2026. Low risk. |
| A6 | `eslint-config-next@^15.5.x` works with the simplified `globalIgnores` defaults shown. | ESLint config (§3) | Next docs as of 2026-05-06 show this exact pattern. Low risk. |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions (RESOLVED)

1. **Real email address and GitHub repo URL for `next.config.ts` `x-portfolio-source`.** **RESOLVED 2026-05-06:** moot. Developer chose to defer the `x-portfolio-source` header to Phase 7 (D-13 revision in CONTEXT.md). Phase 1 ships only `x-built-with: nextjs-15-react-19`. The real email lands in `lib/portfolio-data.ts` per D-08 (Plan 02). No header URL needed in Phase 1.

2. **Exact Node 22 LTS minor version for `.nvmrc`.** **RESOLVED 2026-05-06:** `.nvmrc` content = `22` (major-only); `engines.node` = `"22.x"` (D-04 revised — Vercel rejects `>=22`). Both resolve to the latest 22.x patch at install time, so security patches flow without `package.json` churn. Locked in Plan 01.

3. **Should `app/layout.tsx` defer `metadataBase` change to Phase 2?** **RESOLVED 2026-05-06:** No — `metadataBase` is added in Phase 1 per ROUTE-03 (Plan 03). Title/description rewrite is deferred to Phase 2 (paired with shell + ThemeProvider + accent boot script). Phase 1 touches `app/layout.tsx` for the single `metadataBase` line only; no other metadata edits.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local dev + CI | ✓ (local: v20.19.1; CI uses .nvmrc) | 22.x target | None — Phase 1 install-time check via CI `npm ci` |
| npm | Package manager | ✓ | bundled with Node | None |
| Git | Version control + CI checkout | ✓ | system | None |
| Network access to npm registry | Install + CI | ✓ (verified `npm view next version` 2026-05-06 returns `16.2.4`) | — | None |
| GitHub Actions runner | CI | ✓ (no .github/workflows yet — Phase 1 creates) | ubuntu-latest | None — D-01 selects GitHub Actions |
| Vercel deployment | Phase 7 | Not yet deployed | — | None — Phase 7 owns |

**Missing dependencies with no fallback:** None blocking Phase 1.

**Missing dependencies with fallback:**
- `.github/workflows/ci.yml`: Will be created in Phase 1 (per D-01).
- `.nvmrc`: Will be created in Phase 1.
- Branch protection rules on `main`: Configured in GitHub UI by developer after first PR lands (per D-06). Not Phase 1 code; flag for developer at end of Phase 1.

**Local Node version mismatch:** Local dev shows `v20.19.1` but D-04 pins Node 22 LTS. This is fine for Phase 1 — the `.nvmrc` will tell the developer to switch via `nvm use`. Phase 1 verification step: `node --version` matches `.nvmrc` content before running `npm install`.

## Dependencies & Versions

### Production deps (after Phase 1 install)

| Package | Version | Constraint | Verified |
|---------|---------|-----------|----------|
| `next` | `15.5.15` | `^15.5.x` | npm view 2026-05-06; latest 15.5 patch line |
| `react` | `19.1.0` | (unchanged) | package.json |
| `react-dom` | `19.1.0` | (unchanged) | package.json |
| `next-themes` | `0.4.6` | `^0.4.6` | npm view 2026-05-06; React 19 peer-dep confirmed |
| `cmdk` | `1.1.1` | `^1.1.1` | npm view 2026-05-06; React 19 peer-dep confirmed |

### Dev deps (after Phase 1 install)

| Package | Version | Action | Verified |
|---------|---------|--------|----------|
| `eslint` | `^9.0.0` | UPGRADE from 8.57.0 | latest 10.3.0; pin `^9` for stability with `eslint-config-next` |
| `eslint-config-next` | `^15.5.15` | UPGRADE | peer-deps `eslint ^7.23 \|\| ^8 \|\| ^9` |
| `knip` | `^6.11.0` | ADD | latest |
| `typescript` | `5.8.3` | (unchanged) | strict-mode pre-existing |
| `vitest` | `3.1.4` | (unchanged) | tests preserved |
| `@vitejs/plugin-react` | `4.4.1` | (unchanged) | |
| `jsdom` | `26.1.0` | (unchanged) | |
| `@testing-library/react` | `16.2.0` | (unchanged) | |
| `@testing-library/jest-dom` | `6.6.3` | (unchanged) | |
| `@types/node` | `22.15.17` | (unchanged — already aligned with Node 22) | |
| `@types/react` | `19.1.3` | (unchanged) | |
| `@types/react-dom` | `19.1.3` | (unchanged) | |

### Peer-dep matrix (verified 2026-05-06 via `npm view <pkg> peerDependencies`)

| Package | React | React-DOM | ESLint | TypeScript |
|---------|-------|-----------|--------|------------|
| `next-themes@0.4.6` | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | `^16.8 \|\| ^17 \|\| ^18 \|\| ^19` | n/a | n/a |
| `cmdk@1.1.1` | `^18 \|\| ^19 \|\| ^19.0.0-rc` | `^18 \|\| ^19 \|\| ^19.0.0-rc` | n/a | n/a |
| `eslint-config-next@15.5.15` | n/a | n/a | `^7.23.0 \|\| ^8.0.0 \|\| ^9.0.0` | `>=3.3.1` |
| `knip@6.11.0` | n/a | n/a | n/a | (peer not listed by knip; uses bundled compiler) |

**No peer-dep warnings expected.** Verify with `npm install --dry-run` after package.json updates.

### Lockfile considerations

- `package-lock.json` (lockfile v3) regenerates on `npm install` after `package.json` changes.
- D-05 says CI uses `npm ci` — strictly verifies lockfile against package.json. Out-of-sync = CI fail.
- Commit `package.json` AND `package-lock.json` together every dep change. Never commit one without the other.
- Initial Phase 1 dep upgrade is the largest lockfile delta the project will ever take. Expect a several-thousand-line lockfile diff. This is normal and reviewable as a "deps upgrade" commit.

## CI Workflow Spec

**File:** `.github/workflows/ci.yml` (NEW — Phase 1)

```yaml
name: CI

on:
  pull_request:
    branches: [main]

# Cancel in-flight runs of the same PR when new commits push (saves CI minutes)
concurrency:
  group: ci-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies (lockfile-strict)
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm test

      - name: Knip — fail on orphan files / unused exports
        run: npx knip

      - name: Build
        run: npm run build
        env:
          # Provide a stable site URL so metadataBase resolves cleanly during build
          NEXT_PUBLIC_SITE_URL: https://example.com
          # Backend is not required during CI build — getJson silently falls back to portfolio-data.ts
          NEXT_PUBLIC_API_BASE_URL: ""
```

### Action versions (verified)

- `actions/checkout@v4` — current stable (v4 is the maintained line; v5 not yet released as of 2026-05-06).
- `actions/setup-node@v4` — current stable; supports `node-version-file` + `cache: npm`.

### Cache strategy

- `actions/setup-node@v4` `cache: npm` automatically caches `~/.npm` keyed on `package-lock.json` hash. No additional `actions/cache` step needed.
- First run is slow (cold cache); subsequent PRs reuse the cache → npm install ~10s.

### Single-job sequential vs. parallel jobs

- **Decision: single-job sequential** for Phase 1.
  - Codebase is tiny (~10 source files); split-job overhead exceeds parallelization gain.
  - Sequential is simpler to read and debug.
  - Roadmap §"Open Questions" confirms parallelization is deferred.
- If CI runtime ever exceeds 5 min: split into `lint+typecheck` (parallel) + `test+knip+build` (sequential, depends on first).

### Build artifact upload

- **Decision: skip for Phase 1 v1.** Vercel builds independently from Git push; CI does not deploy.
- If `next build` artifact is ever needed for Lighthouse/etc., add a final step `actions/upload-artifact@v4` with `path: .next/`.

### `NEXT_PUBLIC_SITE_URL` in build env

- The `next build` step needs a valid URL for `metadataBase` resolution.
- Use `https://example.com` — passes URL validation, doesn't leak real production URL into PR runs.
- The actual Vercel production URL is set in Vercel project settings (not in CI).

### Branch protection (configured by developer post-Phase 1)

Per D-06: after the first PR lands and CI runs successfully, the developer manually configures GitHub branch protection for `main`:
- Require a pull request before merging
- Require status checks to pass before merging → select `verify` (the CI job name)
- Require branches to be up to date before merging
- 0 reviewers required
- Restrict who can push to matching branches: developer only

This is not in Phase 1 code; document in Phase 1 task completion notes.

## Validation Architecture

> Phase 1 validates via shell commands (no UI to test). Vitest config preserved per TEST-01; new tests deferred to Phase 2.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 |
| Config file | `vitest.config.ts` (preserved) |
| Quick run command | `npm test` (= `vitest run`) |
| Full suite command | `npm test` (no separate slow suite in Phase 1) |

### Phase Requirements → Validation Map

Phase 1 has no new behavior to test. Each requirement maps to a verification command — most are shell checks, not unit tests. The Phase 2 plan introduces `terminal-shell.test.tsx`, `command-palette.test.tsx`, etc.

| REQ ID | Behavior | Validation Type | Automated Command | Test File Exists? |
|--------|----------|-----------------|-------------------|-------------------|
| INFRA-01 | `next` upgraded; advisories resolved | shell | `npm audit --omit=dev \| grep -E "high\|critical" \|\| echo OK` | n/a — runtime check |
| INFRA-01 | `next` resolves to `^15.5.x` | shell | `npm ls next` | n/a |
| INFRA-02 | `next-themes`, `cmdk` installed at expected versions, no peer warnings | shell | `npm ls next-themes cmdk 2>&1 \| grep -E "ERR\|WARN" \|\| echo OK` | n/a |
| INFRA-03 | CI runs lint/typecheck/test/knip/build on every PR | shell + GitHub | `cat .github/workflows/ci.yml` (file exists, has all 5 steps); first PR's check status `success` | n/a |
| INFRA-03 | Knip hard-fails on orphan finding | shell | `git checkout -b /tmp-orphan-test; touch lib/orphan.ts; npm run knip; echo $?` (must be non-zero) | n/a — manual audit |
| INFRA-04 | Security + engineer headers present on response | shell | `npm run dev &; sleep 3; curl -I http://localhost:3000/ \| grep -E "Strict-Transport-Security\|X-Content-Type-Options\|x-portfolio-source\|x-built-with"; kill %1` | n/a |
| INFRA-05 | postbuild grep fails build on placeholder hit | shell | `echo "TODO: leak" >> lib/portfolio-data.ts; npm run build; echo $?` (must be non-zero); revert | n/a |
| INFRA-05 | postbuild grep passes on clean build | shell | `npm run build` (exit 0; postbuild log shows "✓ INFRA-05: clean") | n/a |
| DATA-01 | `lib/types.ts` exports 7 expected interfaces | shell | `grep -E "^export (interface\|type)" lib/types.ts \| wc -l` (≥ 7) | n/a |
| DATA-01 | TypeScript strict compiles with new shapes | shell | `npm run typecheck` (exit 0) | n/a |
| DATA-02 | `lib/portfolio-data.ts` exists and exports typed dataset | shell | `test -f lib/portfolio-data.ts && grep -E "^export const (PROFILE\|PROJECTS\|EXPERIENCE\|WRITING\|SHIPPED\|STACK)" lib/portfolio-data.ts` | n/a |
| DATA-03 | `lib/fallback-data.ts` deleted | shell | `! test -f lib/fallback-data.ts && ! grep -r "fallback-data" lib/ app/` | n/a |
| DATA-04 | `lib/api.ts` adapted; `getJson` preserved | shell | `grep "function getJson" lib/api.ts && grep -E "getProfile\|getProjects\|getExperience\|getWriting\|getShipped\|getStack" lib/api.ts` | n/a |
| DATA-05 | `lib/routes.ts` exports 7-entry typed const | shell | `grep -c "pathname:" lib/routes.ts` (= 7) | n/a |
| ROUTE-03 | `metadataBase` set; build has zero `metadataBase` warnings | shell | `npm run build 2>&1 \| grep -i "metadataBase" \|\| echo OK` (no warnings) | n/a |
| TEST-01 | `homepage.test.tsx` deletion paired with replacement | n/a — Phase 2 owns | (verified in Phase 2 plan) | n/a in Phase 1 |
| **(general)** | All success criteria pass | shell | `git grep -E "homepage\.(tsx\|test\.tsx)\|fallback-data" -- app/ lib/` (only Phase 2 will return zero hits; Phase 1 only zero for fallback-data) | n/a |

### Sampling Rate

- **Per task commit:** Run `npm run typecheck` (fastest gate; catches type drift on shape changes).
- **Per wave merge:** Run full `npm run lint && npm run typecheck && npm test && npx knip && npm run build` locally before pushing PR.
- **Phase gate:** Full CI green on PR + manual `curl -I` verification of headers + manual `npm audit` zero high/critical.

### Wave 0 Gaps

**For Phase 1, Wave 0 = none.** Phase 1 introduces no new test files (per TEST-01 — `homepage.test.tsx` stays put until Phase 2 deletes-with-replacement).

The single existing test (`app/components/homepage.test.tsx`) continues to pass through Phase 1 because the homepage is untouched in Phase 1. **CRITICAL:** the test imports from `lib/fallback-data.ts` — which Phase 1 deletes. Either:

- **(A)** Leave `lib/fallback-data.ts` in place until Phase 2 deletes the homepage (and its test) — but then DATA-03 doesn't ship in Phase 1.
- **(B)** Update `homepage.test.tsx` to import from `lib/portfolio-data.ts` and adapt the fixture shape (one-time fixture rewrite). The test continues to pass; Phase 2 deletes both as planned.
- **(C)** Update `homepage.tsx` to use the new `lib/types.ts` shapes too — but this is much more invasive.

**Recommendation: Option B.** The fixture rewrite is small (5 import-renames + adapt to new field names). The test still asserts "5 headings exist" — the data plumbing change doesn't affect that assertion. Phase 1 plan must include this.

**Plan task ordering for safe Phase 1:**
1. Write new `lib/types.ts`
2. Write new `lib/portfolio-data.ts` (with TODO markers)
3. Update `lib/api.ts` (adapt to new shapes)
4. Update `homepage.test.tsx` to import from `lib/portfolio-data.ts` + new types (homepage.tsx itself may need a *minimal* shim — research flag)
5. Delete `lib/fallback-data.ts`
6. Verify: `npm test` green; `npm run typecheck` green
7. Commit (DATA-01 + DATA-02 + DATA-03 + DATA-04 atomic)

**Research flag:** Step 4 above may require `homepage.tsx` itself to be adapted to the new `Profile` / `Project` shapes. The current homepage takes `profile: Profile, skills: Skill[], experience: Experience[], apps: MobileApp[], posts: BlogPost[]` — the new shapes are renamed (`Skill` → `StackCategory`; `MobileApp` → `ShippedApp`; `BlogPost` → `Writing`) and reshaped. The homepage compiles only if either:
- Phase 1 also touches `homepage.tsx` to adapt to new shapes, OR
- Phase 1 keeps temporary "bridging" type aliases in `lib/types.ts` that match the old shapes

**Recommendation: Add a temporary `lib/legacy-types.ts` adapter** — kept for ONE phase, deleted in Phase 2 alongside the homepage. Aliases `Skill = StackCategory`-ish bridging. This is messy but clean. Alternatively: bite the bullet and adapt `homepage.tsx` minimally to the new shapes since both paths require touching it. **Preferred: minimal homepage.tsx adapter** (single PR, no legacy file). Confirm with developer at planning intake.

## Open Decisions Resolved

The 10 numbered items in the orchestrator's `<additional_context>` block — answered concretely:

### §1. prebuild vs postbuild for INFRA-05 grep

**Resolution: postbuild.**

- **prebuild semantics:** runs before `next build` — `.next/server/` doesn't exist yet, so the grep would scan nothing.
- **postbuild semantics:** runs after `next build` — greps the actually-emitted bundles in `.next/server/`.
- **package.json wiring:** `"postbuild": "node scripts/check-placeholders.mjs"`. npm automatically chains `prebuild → build → postbuild` when `npm run build` is invoked. Failed postbuild = failed `npm run build` = failed CI = no Vercel deploy.
- **Script signature:** Node ESM script (`.mjs`). Uses `node:fs` and `node:path` from the standard library. Cross-platform (Mac/Linux/Windows).
- **Case sensitivity:** `lorem`, `example.com`, `placeholder` are case-insensitive (clearly placeholder in any case). `TODO` and `Product Studio` are case-sensitive (allows lowercase `todo` in prose comments and `product studio` in non-leak contexts).
- **Exit semantics:** `process.exit(0)` clean, `process.exit(1)` on any hit.
- **Full code:** see Code Examples §1.

[VERIFIED: npm-scripts hook semantics — npm docs 2026; postbuild auto-chains]

### §2. ESLint 9 flat-config migration

**Resolution: migrate now (do NOT stay on 8.57).**

- `eslint-config-next@^15.5.x` peer-deps `eslint ^7.23 \|\| ^8 \|\| ^9` — **flat-config compatible** [VERIFIED: `npm view eslint-config-next@^15.5 peerDependencies` 2026-05-06].
- Next.js 15.5 official docs explicitly recommend flat config (`eslint.config.mjs`) as the path forward [CITED: nextjs.org/docs/app/api-reference/config/eslint, 2026-05-06].
- `next lint` is **deprecated** in 15.5 and **removed in Next.js 16**. Future-proofing requires flat config.
- Migration is mechanical: delete `.eslintrc.json`, create `eslint.config.mjs` (per Code Examples §3), update `package.json` script `"lint": "eslint ."`.
- ESLint version bump 8.57 → ^9 is required (latest is 10.3.0; pin `^9` for ecosystem stability — many ESLint plugins lag major upgrades).
- No "stay on 8.57 for v1" fallback needed.

### §3. Knip default config

**Resolution: zero-config + minimal `knip.json`. Hard-fail CI per D-03.**

- Knip's Next.js plugin auto-detects all relevant entry points: `app/**/page`, `layout`, `route`, `template`, `error`, `not-found`, `loading`, `manifest`, `robots`, `sitemap`, `icon`, `apple-icon`, `opengraph-image`, `twitter-image`, plus `next.config.{js,ts,cjs,mjs}` and `middleware.{js,ts}` [CITED: knip.dev/reference/plugins/next, 2026-05-06]. **Zero `entry` config needed.**
- Knip's Vitest plugin auto-detects `**/*.{test,spec}.{ts,tsx}` [CITED: knip.dev/reference/plugins/next].
- **Likely false positives** for this repo on day 1:
  - `next-themes` and `cmdk`: Phase 1 installs them but they're only imported in Phase 2. **Fix:** `ignoreDependencies: ["next-themes", "cmdk"]` in `knip.json` with comment to remove during Phase 2 commit.
  - `design_handoff_terminal_portfolio/`: Standalone JSX prototypes that aren't imported. **Fix:** `ignore: ["design_handoff_terminal_portfolio/**"]`.
  - `scripts/check-placeholders.mjs`: Invoked via package.json script but Knip may not auto-detect package.json `scripts` references for non-bin files. **Fix:** `ignore: ["scripts/**"]`.
- **CI command:** plain `npx knip` (or `npm run knip` if scripted). Default exit code is 0 on clean / 1 on findings — no flag needed [CITED: knip.dev/guides/using-knip-in-ci]. The `--no-exit-code` flag exists for debugging but should NOT be used in CI per D-03.
- **Knip 6.x stability:** Latest is 6.11.0 (2026); a v5.80.x regression caused false-positives on Next.js Pages Router monorepos in late 2025 [CITED: github.com/webpro-nl/knip/issues/1466] but this repo is App Router on a single package, so the regression doesn't apply.

### §4. `lib/types.ts` exact field shapes

**Resolution: 7 interfaces matching `app.jsx` view-rendering needs.**

See Code Examples §5. Key decisions:

- **`Project.tech: string[]`** — strings, not chip objects. The chip is presentation; data is text.
- **`ShippedApp.platforms: ('ios' | 'android')[]`** — discriminated tuple-of-literals, optional URLs conditional on platforms.
- **`Social.kind` enum** — added discriminator for label/icon dispatch in views.
- **`StackCategory` ordered array** (not `Record<string, string[]>`) — explicit ordering control + cleaner backend contract.
- **`Bio.long: string[]`** — paragraph array, matches `data.bio.long.map(...)` rendering.
- **All URLs are string-typed** in Phase 1; URL/scheme validation deferred to Phase 6 / BACKEND-04.

### §5. `lib/routes.ts` registry shape

**Resolution: 7-entry `Route[]` const with `slug | pathname | label | ariaLabel | description`.**

See Code Examples §8. The 7th route is `shipped` at `/shipped`. About maps to `/` (NOT `/about`) per ROUTE-01 in REQUIREMENTS.md. The 7 routes in sidebar render order:
1. `about.md` → `/`
2. `projects/` → `/projects`
3. `stack.json` → `/stack`
4. `experience.log` → `/experience`
5. `writing/` → `/writing`
6. `contact.sh` → `/contact`
7. `shipped.app` → `/shipped`

The `description` field is added (beyond CONTEXT.md minimums) because Phase 5 / SEO-03 dynamic OG images and Phase 2 / PALETTE-02 palette tooltips both consume it. Adding it now is one line; retrofitting in Phase 5 means touching `lib/routes.ts` from Phase 5 plan code.

### §6. CI workflow specifics

**Resolution: see CI Workflow Spec section above.**

- `actions/checkout@v4` (latest stable) with `fetch-depth: 1`.
- `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: npm`.
- Single-job sequential pipeline (5 steps after install).
- `concurrency` group cancels stale runs to save minutes.
- `npm ci` (D-05) for lockfile-strict install.
- `NEXT_PUBLIC_SITE_URL=https://example.com` in build env so `metadataBase` resolves.
- Skip build artifact upload for v1.

### §7. Next 15.3.2 → 15.5.x upgrade risk surface

**Resolution: target `next@15.5.15`. Low risk for this codebase.**

[CITED: nextjs.org/blog/next-15-5, 2026-05-06]. Changes between 15.3.2 → 15.5.15:

- **Stable Node.js middleware runtime** — this codebase has no middleware; not relevant.
- **Typed Routes (now stable behind `typedRoutes` flag)** — opt-in via `next.config.ts`. **Phase 1 does NOT enable** — too aggressive a refactor for the foundation phase. Phase 2 may revisit.
- **Route export validation (Turbopack)** — only fires under `next build --turbopack`. Phase 1 keeps webpack default. Not relevant.
- **Route Props Helpers** (`PageProps`, `LayoutProps`, `RouteContext`) — globally available in 15.5. Useful for Phase 3 view typing but not Phase 1.
- **`next typegen` command** — useful for CI typecheck step but optional. Phase 1 uses plain `tsc --noEmit` which works fine.
- **`next lint` deprecation** — addressed by ESLint 9 flat-config migration (§2).
- **Deprecation warnings for Next 16:** `legacyBehavior` on `<Link>` (not used here), AMP (not used), `next/image` `quality` defaults (not relevant — no images yet), `next/image` localPatterns query strings (not used). **All zero impact for Phase 1.**

**No codemods required for this repo.** The optional `npx @next/codemod@latest upgrade latest` can run safely if desired.

**Safe target: `^15.5.15`** in `package.json` (resolves to latest 15.5.x patch). Not `^15.5.0` because patches up to 15.5.15 ship security fixes.

### §8. `next-themes` + `cmdk` peer-dep verification under React 19

**Resolution: both verified compatible. No SSR hydration issues for Phase 1 (deferred to Phase 2 wiring).**

- `next-themes@0.4.6` peer-deps `react ^16.8 || ^17 || ^18 || ^19`, `react-dom ^16.8 || ^17 || ^18 || ^19` [VERIFIED: `npm view next-themes peerDependencies` 2026-05-06]. React 19 is supported.
- `cmdk@1.1.1` peer-deps `react ^18 || ^19 || ^19.0.0-rc`, `react-dom ^18 || ^19 || ^19.0.0-rc` [VERIFIED: `npm view cmdk peerDependencies` 2026-05-06].
- `cmdk@1.1.0+` removed the `use-sync-external-store` shim that conflicted with React 19/Next 15 [CITED: STACK.md §"Version Compatibility"]; 1.1.1 is the recommended pin.
- **`next-themes` known SSR hydration considerations under React 19** [CITED: github.com/pacocoursey/next-themes README, 2026-05-06]:
  - Always set `suppressHydrationWarning` on `<html>`.
  - Recommended provider props: `attribute="data-theme"`, `defaultTheme="dark"` (per handoff), `enableSystem={true}`, `storageKey="theme"`.
  - Theme-dependent UI must be gated by a `mounted` boolean to avoid hydration mismatch.
  - **For Phase 1: NONE OF THIS APPLIES.** `next-themes` is installed but not wired in Phase 1. Phase 2 owns the wiring. The peer-dep install is the only Phase 1 action.

**Phase 1 verification:** `npm install next-themes@^0.4.6 cmdk@^1.1.1` produces zero peer-dep warnings (per success-criterion-2 of ROADMAP.md Phase 1).

### §9. Node engines pin semantics — `>=22` vs `22.x`

**⚠️ CRITICAL FINDING: D-04 must be revised.**

CONTEXT.md `<specifics>` says: `engines.node: ">=22"` (not `"22.x"`).
**This contradicts Vercel's documented behavior.**

- [VERIFIED: vercel.com/docs/functions/runtimes/node-js/node-js-versions, 2026-05-06]: Vercel's accepted version range formats are `24.x` `^24.0.0` `>=20.0.0`, `22.x` `^22.0.0`, `20.x` `^20.0.0`. The example with `>=20.0.0` is shown as resolving to **the latest 24.x version** (not 20!) — meaning Vercel reads `>=` as a forward-compatible range that matches whatever major is current. This is dangerous.
- [CITED: Vercel community thread "Is the CLI expected to disallow Node 22?", 2026]: Users report that `>=22.7.0` style returns `Error: Found invalid Node.js Version`. The community answer is to use `"22.x"` major-only.
- [VERIFIED: Vercel docs warning] : "Avoid greater-than ranges like `>14.x` or `>=14` because this matches semver major versions of Node.js once available which contains breaking changes."

**Resolution: Use `"engines": { "node": "22.x" }` in `package.json`.**

Combined with `.nvmrc` containing `22` (or `22.15.0` for stricter pinning), local dev and Vercel build runtime align. The `22.x` range matches all minor and patch versions on the 22 LTS line — Vercel automatically applies security patches.

**Action for the Phase 1 plan:** revisit D-04 with the developer. Original text:
> "Pin Node 22 LTS via `.nvmrc` (Node version file at repo root) AND `engines.node: ">=22"` in `package.json`."

**Recommended replacement:**
> "Pin Node 22 LTS via `.nvmrc` AND `engines.node: "22.x"` in `package.json`. Vercel rejects `>=22` style; `22.x` is the supported major-only shorthand."

This is the single point in this research where CONTEXT.md needs revision before planning proceeds.

### §10. Validation Architecture for Nyquist

See Validation Architecture section above. Each Phase 1 outcome maps to a verifiable command. Test/check matrix is shell-only (no new Vitest tests in Phase 1; existing `homepage.test.tsx` passes through with the `lib/portfolio-data.ts` import update from §"Wave 0 Gaps").

## Project Constraints (from CLAUDE.md)

Extracted from `./CLAUDE.md`:

| Directive | Phase 1 implication |
|-----------|---------------------|
| **Stack constraints (do not violate):** Next.js 15 App Router + React 19 + TypeScript strict, no framework swap | Phase 1 stays on Next 15 (15.5.x); does NOT bump to Next 16 |
| **Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules)** | Phase 1 doesn't touch CSS at all (Phase 2 owns `globals.css`) |
| **Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1`** | Phase 1 installs exactly these two; no others without revisiting STACK.md |
| **Native `fetch` + `next: { revalidate }`** | DATA-04 preserves this; no SWR / TanStack Query introduced |
| **Persistent shell at `app/(terminal)/layout.tsx` (route group); never unmounts on view switching** | Phase 2 implements; Phase 1 does NOT scaffold the route group yet (per Roadmap §"Phase 1 has no visual output") |
| **`app/layout.tsx` is a Server Component — only thin client islands carry `"use client"`** | Phase 1 adds `metadataBase` only — preserves Server Component status |
| **Active view derived from `useSelectedLayoutSegment()` — never mirror into Context** | Phase 2 implements; Phase 1 only exports the registry |
| **Theme uses `next-themes`; accent hue is a separate axis with inline pre-paint script** | Phase 2 implements; Phase 1 only installs the dep |
| **`lib/routes.ts` is single source of truth for 7 routes** | Phase 1 introduces (per DATA-05) |
| **Brownfield discipline: deletions in same commit as replacements** | Phase 1 deletes `lib/fallback-data.ts` only — paired with `lib/portfolio-data.ts` introduction. Other deletions deferred to Phase 2 |
| **Backend type changes ship as paired commits (frontend `lib/types.ts` + sibling endpoint)** | DATA-01 establishes the new contract; sibling backend updated in Phase 6 |
| **Persistent resume download button visible in top bar at every viewport** | Phase 2 owns; not Phase 1 |
| **5-second recruiter test is a real exit criterion** | Phase 7 / DEPLOY-04; informs Phase 1 only via `Profile.email` and `Profile.resumeUrl` data shapes |
| **YOLO mode + quality model profile** | Project meta — no Phase 1 action |
| **Build commands:** `npm run dev / build / lint / test` | D-13 (additional `prebuild` removed; `postbuild`, `typecheck`, `knip` added per CI Workflow Spec) |

**No CLAUDE.md directives are violated by this research.** Phase 1 stays strictly within infrastructure scope; the visual constraints apply to Phase 2+.

## Security Domain

`security_enforcement` is implicit (key absent in `.planning/config.json` — defaults enabled).

### Applicable ASVS categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | Portfolio is fully public; no login |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No protected routes |
| V5 Input Validation | partial | Phase 6 / BACKEND-04 adds zod validation on API responses (`url.protocol === "https:"`); Phase 1 boundary is dormant (data is developer-controlled) |
| V6 Cryptography | no | No crypto operations in Phase 1 |
| V8 Data Protection | yes | `Strict-Transport-Security` (HSTS) header in INFRA-04 ensures TLS-only transport |
| V11 Business Logic | no | No business logic in Phase 1 |
| V12 Files and Resources | partial | `Content-Disposition` for resume.pdf is Phase 7 / DEPLOY scope per CONCERNS.md "Resume download served from public path with no integrity check" |
| V13 Configuration | yes | `next.config.ts` headers are deny-by-default (`Permissions-Policy: camera=(), ...`) per OWASP secure headers; `X-Frame-Options: DENY` prevents clickjacking |
| V14 Build/Deploy | yes | `npm ci` enforces lockfile reproducibility; `npm audit` enforces zero high/critical advisories at deploy gate |

### Known threat patterns for Next.js 15 + React 19 + Vercel

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stale Next.js with known advisories (RCE, SSRF, source-code-exposure) | E (elevation), I (info disclosure) | `next@^15.5.15` upgrade — INFRA-01 |
| Inline `<script dangerouslySetInnerHTML>` blocks strict CSP | T (tampering — XSS injection if upstream compromised) | Phase 2 wires nonce-based CSP after shell ships (deferred per D-15) |
| External link `target="_blank"` without `rel="noopener noreferrer"` | T | Phase 2 / SEO-05 — shared `<ExternalLink>` component (deferred from Phase 1) |
| API-supplied URL with `javascript:` scheme | T (XSS) | Phase 6 / BACKEND-04 zod validation (deferred per D-16) |
| Cache poisoning via missing `Vary` header on Next ISR | T | Resolved by Next 15.5 patch line (INFRA-01 covers) |
| Clickjacking via iframe embed | T | `X-Frame-Options: DENY` in INFRA-04 |
| MIME-sniffing attacks | T | `X-Content-Type-Options: nosniff` in INFRA-04 |
| Sensor API access (camera, microphone, geolocation) by malicious script | T | `Permissions-Policy` deny-list in INFRA-04 |
| Referer leakage to external services | I | `Referrer-Policy: strict-origin-when-cross-origin` in INFRA-04 |
| Forced HTTP downgrade attack | T | `Strict-Transport-Security` HSTS in INFRA-04 |

**Phase 1 closes the open security headers gap (CONCERNS.md "Empty `next.config.ts`") and the Next.js advisories gap. CSP and zod URL validation are explicitly deferred to later phases per CONTEXT.md decisions.**

## References

### Primary (HIGH confidence — official sources, registry, codebase)

- [Next.js 15.5 release blog](https://nextjs.org/blog/next-15-5) — `next lint` deprecation, ESLint flat config recommendation, deprecation warnings for Next 16 (verified 2026-05-06)
- [Next.js ESLint config reference](https://nextjs.org/docs/app/api-reference/config/eslint) — flat-config setup, `defineConfig` + `globalIgnores` pattern (verified 2026-05-06)
- [Vercel Node.js versions docs](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) — `engines.node` semantics, `22.x` shorthand (verified 2026-05-06)
- [Knip Next.js plugin reference](https://knip.dev/reference/plugins/next) — auto-detected entry points
- [Knip CI usage guide](https://knip.dev/guides/using-knip-in-ci) — exit code semantics, `--no-exit-code` flag
- [Vercel community thread on engines.node](https://community.vercel.com/t/is-the-cli-expected-to-disallow-node-22/911) — `>=22` rejection evidence
- [next-themes README](https://github.com/pacocoursey/next-themes) — `suppressHydrationWarning`, ThemeProvider props, hydration patterns
- npm registry queries 2026-05-06: `npm view next dist-tags`, `npm view next versions`, `npm view next-themes peerDependencies`, `npm view cmdk peerDependencies`, `npm view eslint-config-next@^15.5 peerDependencies`, `npm view knip version`
- `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `lib/api.ts`, `lib/types.ts`, `lib/fallback-data.ts`, `vitest.config.ts`, `.eslintrc.json`, `.gitignore`, `.env.example` — direct codebase inspection
- `.planning/PROJECT.md` — project constraints, key decisions, out-of-scope
- `.planning/REQUIREMENTS.md` — 89 v1 requirements with phase mapping
- `.planning/ROADMAP.md` §"Phase 1: Foundation" — 5 success criteria
- `.planning/STATE.md` — current position
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked decisions D-01..D-16
- `.planning/research/SUMMARY.md` — convergent decisions
- `.planning/research/STACK.md` — version pins, peer-dep matrix
- `.planning/research/ARCHITECTURE.md` — anti-patterns, hand-mirrored type contract
- `.planning/research/PITFALLS.md` — Pitfalls 11 (orphan code) + 12 (placeholder content)
- `.planning/research/FEATURES.md` — table-stakes, anti-features
- `.planning/codebase/STACK.md`, `STRUCTURE.md`, `CONCERNS.md`, `CONVENTIONS.md`, `INTEGRATIONS.md`, `TESTING.md` — codebase intelligence
- `design_handoff_terminal_portfolio/README.md` — handoff design spec
- `design_handoff_terminal_portfolio/app.jsx` (605 lines) — view-rendering field shapes (`Profile`, `Project`, `ShippedApp`, `Writing`, `Experience`, `StackCategory` derived directly from prototype)
- `CLAUDE.md` — project working conventions, brownfield discipline

### Secondary (MEDIUM confidence — corroborating sources)

- [GitHub issue webpro-nl/knip#1466 — Knip 5.80.2 false positives on Nx Next monorepo](https://github.com/webpro-nl/knip/issues/1466) — verifies that Knip 6 line is stable for App Router single-package repos
- [MDN Permissions-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy) — modern syntax for deny-list

### Tertiary (LOW confidence — flagged for validation)

- None. All claims in this research are tagged VERIFIED or CITED with primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry queries 2026-05-06 confirm versions and peer deps; React 19 / Next 15.5 compatibility unambiguous.
- Architecture: HIGH — postbuild semantics, ESLint 9 flat-config migration path, Knip CI behavior all verified against official docs.
- Pitfalls: HIGH — Vercel `engines.node` rejection of `>=22` verified against multiple sources; lockfile drift, knip false positives are well-known patterns in CI workflows.
- Open Decisions: HIGH (9 of 10) / MEDIUM (one — A1 GitHub repo URL) — only the developer's exact GitHub URL needs confirmation at planning intake.

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (30 days for stable foundation; revisit if Next 16 launches breaking changes that affect 15.5.x maintenance)

## RESEARCH COMPLETE

**Phase:** 1 - Foundation
**Confidence:** HIGH

### Key Findings

- **One CONTEXT.md decision needs revision:** D-04 specifies `engines.node: ">=22"` but Vercel rejects this format with `Error: Found invalid Node.js Version`. Use `"22.x"` instead. Flag for developer at Phase 1 planning intake.
- **ESLint 9 flat-config migration: GO.** `eslint-config-next@^15.5.x` peer-deps confirm compatibility; Next 15.5 official docs recommend it; `next lint` is deprecated in 15.5 and removed in 16. Migration is mechanical (delete `.eslintrc.json`, create `eslint.config.mjs`).
- **INFRA-05 grep: postbuild (not prebuild).** Prebuild semantics are wrong — `.next/server/` doesn't exist before `next build`. Full Node.mjs script provided in Code Examples §1, with case-sensitive `TODO`/`Product Studio` and case-insensitive `lorem`/`example.com`/`placeholder`.
- **`lib/types.ts` shapes are derived from `app.jsx` view rendering** — not invented. Seven interfaces (`Profile`, `Project`, `Social`, `Experience`, `Writing`, `ShippedApp`, `StackCategory`) plus two helpers (`Highlight`, `Bio`). All field decisions cited to specific `app.jsx` lines.
- **The 7 routes are confirmed** as `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` (about → `/`, NOT `/about`) per ROUTE-01. The 7th is `shipped.app`. `lib/routes.ts` shape includes `description` field beyond CONTEXT.md minimum so Phase 5 OG and Phase 2 palette can consume it without retrofit.
- **Knip 6.11.0 zero-config-compatible.** Plain `npx knip` exits non-zero on findings — satisfies D-03. Two ignores needed at Phase 1 boundary: `next-themes` and `cmdk` (installed-not-yet-used) plus `design_handoff_terminal_portfolio/` directory.
- **Wave 0 gap identified:** Existing `homepage.test.tsx` imports from `lib/fallback-data.ts` which Phase 1 deletes. Plan must update the test (and likely `homepage.tsx` itself, with a minimal shape adapter) in the same atomic commit as the data refactor — OR keep `homepage.tsx` intact via a temporary `lib/legacy-types.ts` bridge file. Recommend: minimal adapter, no bridge file. Confirm at planning intake.
- **CI workflow ready to ship:** Full `.github/workflows/ci.yml` drafted with `actions/checkout@v4`, `actions/setup-node@v4` (with `node-version-file: .nvmrc` and `cache: npm`), single sequential job, concurrency-cancellation on stale runs, and `NEXT_PUBLIC_SITE_URL=https://example.com` for the build step's `metadataBase` resolution.

### File Created

`.planning/phases/01-foundation/01-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | npm registry verified 2026-05-06; React 19 peer-deps confirmed for both new prod deps |
| Architecture | HIGH | Knip plugin behavior, ESLint flat-config path, postbuild semantics all verified against official docs |
| Pitfalls | HIGH | Vercel `engines.node` rejection backed by multiple sources; lockfile/knip-false-positive risks well-understood |
| Validation | HIGH | All 12 phase requirements have a concrete shell command; `npm test`/`npm audit`/`npm ls` all map cleanly |
| Open Decisions | HIGH (9/10) | One assumption (developer's GitHub URL) needs single-line confirmation at planning intake |

### Open Questions

1. **Real GitHub repo URL** for `next.config.ts` `x-portfolio-source` header value — A1 in Assumptions Log. One-line confirmation at planning intake.
2. **D-04 revision approval** — Vercel rejects `>=22`; recommend `22.x`. Surface to developer in planning intake.
3. **Wave 0 ordering: minimal `homepage.tsx` shape adapter vs. temporary `lib/legacy-types.ts` bridge** — recommend the former; confirm at planning intake.

### Ready for Planning

Research complete. Planner can now create PLAN.md files for Phase 1 with concrete commands, version pins, file paths, and a documented ordering for the brownfield-safe atomic data-shape commit (write new types → write portfolio-data → update api.ts → update homepage.test.tsx → delete fallback-data.ts in one commit).
