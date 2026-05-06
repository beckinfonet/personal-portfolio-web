# Phase 1: Foundation - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the clean, secure base for the terminal-portfolio redesign:

- `next` upgraded from `15.3.2` to `^15.5.x` (resolves tracked security advisories)
- New deps installed: `next-themes@^0.4.6` and `cmdk@^1.1.1` — no other production deps in v1
- `lib/types.ts` rewritten to the terminal data model (`Profile`, `Project`, `Social`, `Experience`, `Writing`, `ShippedApp`, `StackCategory`) — single source of truth shared with the sibling backend
- `lib/portfolio-data.ts` created with the typed dataset used as the static fallback
- `lib/routes.ts` route registry — typed `const` array consumed by Sidebar, CommandPalette, and `app/sitemap.ts`
- `lib/api.ts` adapted to the new shape (preserves existing `getJson` ISR + graceful-fallback pattern)
- `lib/fallback-data.ts` deleted in the same commit that introduces `lib/portfolio-data.ts` (no orphan code)
- `next.config.ts` declares engineer-discoverable headers + standard security headers
- `prebuild` script greps the build output for placeholder strings and fails the build on any hit
- `metadataBase` added to root `app/layout.tsx` metadata (resolves the existing build warning)
- GitHub Actions CI runs `lint + typecheck + test + knip + build` on every PR with hard-fail on Knip findings
- Phase 1 has **no visual output** — Shell ships in Phase 2

**Brownfield discipline:** `app/components/homepage.tsx`, `homepage.test.tsx`, `lib/fallback-data.ts`, and `app/components/theme-toggle.tsx` are deleted in the **same commit** that introduces their replacements. The shell skeleton replacement lands in Phase 2 — Phase 1 leaves the existing homepage intact and stages the route group + dependencies + types so Phase 2's first commit can perform the deletion-and-replacement together.

</domain>

<decisions>
## Implementation Decisions

### CI Tooling (INFRA-03)

- **D-01:** GitHub Actions, PR-only — workflow file at `.github/workflows/ci.yml`. Runs on every PR. No push-to-main duplicate runs (avoids 2× CI minutes; PRs are the gate).
- **D-02:** CI checks pipeline (in order): `lint` → `typecheck (tsc --noEmit)` → `test (vitest run)` → `knip` → `build (next build)`. All must pass for merge.
- **D-03:** **Knip hard-fails CI on any orphan finding.** No allowlist. This is the brownfield discipline guard from Pitfall 11 — orphan code must be deleted, not accumulated.
- **D-04:** Pin Node 22 LTS via `.nvmrc` (Node version file at repo root) AND `engines.node: ">=22"` in `package.json`. CI uses `actions/setup-node@v4` with `node-version-file: .nvmrc`. Reproducible across machines.
- **D-05:** Use `npm ci` in CI (not `npm install`) — enforces lockfile reproducibility and rejects out-of-sync `package-lock.json`.
- **D-06:** Branch protection on `main`: require CI green to merge, 0 reviewers required (solo developer; reviewer requirement would be performative). Phase 1 ships the workflow file and documents the branch protection setting; the developer configures the protection rule in GitHub UI after the first PR lands.

### DATA-02 Content Strategy

- **D-07:** **"Real-where-trivial, TBD-where-not"** approach for `lib/portfolio-data.ts` in Phase 1. This is NOT a Phase 6 content pull-forward — Phase 6 still owns bio/projects/writing/shipped/experience authoring.
- **D-08:** **Real now in `lib/portfolio-data.ts`:**
  - Identity: real name (`Bakytbek Tatibekov`), real role string (`Sr. Software Engineer`), real location (city/country)
  - Socials: real GitHub URL, real LinkedIn URL, plus any other public profiles the developer wants live (Mastodon, Bluesky, X — developer's call at planning time)
  - Contact: real email address (replaces the `beck@example.com` leak flagged in CONCERNS.md)
  - Stack categories: real list (languages, frameworks, cloud, AI categories)
- **D-09:** **TBD now (Phase 6 fills):**
  - Bio paragraphs (short + long)
  - Project list (full project entries — name/year/status/summary/tech/role/link)
  - Writing posts
  - Shipped apps (App Store + Play Store URLs)
  - Experience log entries (role/company/period/summary)
- **D-10:** **TBD marker convention:** every field awaiting Phase 6 content uses the prefix `TODO:` (e.g. `summary: "TODO: project summary"`, `bio: { short: "TODO: short bio", long: "TODO: long bio" }`). This is **self-enforcing** — INFRA-05 prebuild grep includes `TODO`, so any deploy attempted before Phase 6 fills the markers fails the build.
- **D-11:** **INFRA-05 grep list (full):** `lorem | example.com | placeholder | TODO | Product Studio`. Matches roadmap success-criterion-5 word for word, plus `Product Studio` (the specific demo company name flagged in CONCERNS.md as a known leak).
  - The grep runs against `.next/server/` after `next build` and exits non-zero on any hit
  - Implementation: `prebuild` script in `package.json` invoked before `build`; or a `postbuild` script that greps `.next/server/` (postbuild semantics are clearer — grep what's actually shipping)
  - Decision on prebuild-vs-postbuild ordering deferred to planning (Claude's discretion)

### INFRA-04 Hardening Scope

- **D-12:** **Engineer headers + standard security headers** in `next.config.ts` `headers()`. Engineer headers serve DEV-03 (easter egg discoverability); security headers close the CONCERNS.md gaps.
- **D-13:** **Engineer headers (DEV-03):**
  - `x-portfolio-source: <github-repo-url>` — lets `curl -I` viewers find the source
  - `x-built-with: nextjs-15-react-19`
- **D-14:** **Standard security headers (CONCERNS.md mitigations):**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (deny-list of sensors the portfolio never needs)
- **D-15:** **CSP deferred** — Content-Security-Policy is NOT in Phase 1 scope. The accent boot script (Risk 1, Pitfall 3) is inline `<script dangerouslySetInnerHTML>` in `app/layout.tsx`; a strict CSP requires a nonce-based approach (middleware injects nonce into `<script nonce={...}>` and the response header). This is bigger than Phase 1's "clean foundation" boundary. Captured as deferred idea — revisit after Shell + Views land or in a v2 hardening milestone.
- **D-16:** **URL/scheme validation on API-supplied `href`s deferred to Phase 6.** In Phase 1, all rendered URLs come from the developer-controlled `lib/portfolio-data.ts`, so the `javascript:`-injection risk in CONCERNS.md is dormant. Phase 6 (when the sibling backend cuts over) is the natural place to add the guard in `lib/api.ts` — single chokepoint, every consumer safe by construction. Phase 6 plan must include this; flagged in deferred ideas.

### Claude's Discretion

- **Homepage deletion timing** — TEST-01 and DATA-03 require deletion in the same commit as the replacement. Phase 1 stages the new structure (route group `app/(terminal)/`, `lib/types.ts` rewrite, `lib/portfolio-data.ts`, `lib/routes.ts`, `lib/api.ts` adaptation) but does **not** delete `homepage.tsx` / `homepage.test.tsx` / `theme-toggle.tsx` / `fallback-data.ts` until Phase 2's first commit ships the shell skeleton. Phase 1's last commit and Phase 2's first commit are paired by design — the deletion-and-replacement happens together.
  - **Special case for `lib/fallback-data.ts`:** this one IS deleted in Phase 1 alongside the introduction of `lib/portfolio-data.ts` (its direct replacement) and the `lib/api.ts` adaptation that imports from the new module. No orphan crossing the Phase 1/2 boundary.
- **Dev tooling hygiene** — Phase 1 also folds in low-cost cleanups flagged in CONCERNS.md:
  - `tsconfig.json` `target` bumped from `ES2017` → `ES2022` (Next 15 / React 19 require modern runtimes anyway)
  - `.gitignore` widened: add `.env*.local`, `.env`, `.DS_Store`
  - `eslint@8.57` → ESLint 9 + flat config (`eslint.config.mjs`) IF compatible with `eslint-config-next` for Next 15.5 — research during planning may downgrade this to "stay on 8.57 for v1, migrate post-launch" if the flat-config peer is unstable. Otherwise migrate.
  - The handoff folder `design_handoff_terminal_portfolio/` is referenced documentation — leave in repo (per CLAUDE.md it's the canonical visual reference); add `.DS_Store` ignore but not the folder itself.
- **`lib/types.ts` field shapes** — research locks the type names; exact field shapes (e.g. `Project.tech: string[]` vs `Project.tech: TechChip[]`, `ShippedApp.platforms: ('ios'|'android')[]` enum) decided during planning based on view rendering needs (handoff `app.jsx` is the visual reference per CLAUDE.md).
- **`lib/routes.ts` registry shape** — minimum fields: `slug` (e.g. `'about'`), `pathname` (e.g. `'/'`), `label` (e.g. `'about.md'`), `ariaLabel` (e.g. `'About me'` per A11Y-04 plain-noun requirement). Order in the array is the sidebar render order. Other fields (`description`, `metadataTitle`) added if planning surfaces a need.
- **CI workflow specifics** — exact `actions/checkout` version, npm cache key strategy, parallelization of lint/typecheck/test, build artifact upload — all left to planning.
- **Resume PDF** — `public/resume.pdf` 50-byte placeholder remains in Phase 1 (real PDF lands in Phase 6 / CONTENT-05). Phase 1 doesn't ship anything that links to `/resume.pdf` — the new top-bar resume button is a Phase 2 affordance, so the placeholder cannot leak to a recruiter in Phase 1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked decisions

- `.planning/PROJECT.md` — Project vision, key decisions, constraints (`Tech stack: Stay on Next.js / React 19 / TypeScript strict / Vitest`), out-of-scope list
- `.planning/REQUIREMENTS.md` — 89 v1 requirements; **Phase 1 owns:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, ROUTE-03, TEST-01
- `.planning/ROADMAP.md` §"Phase 1: Foundation" — Goal, depends-on, requirements list, 5 success criteria
- `CLAUDE.md` — Project working conventions, stack constraints (no Tailwind, no SWR, etc.), brownfield discipline rules

### Research convergence (settled, do not re-debate)

- `.planning/research/SUMMARY.md` — Convergent decisions table (theme/palette/font/animation/state/data-fetching/routing all locked); Phase 1 delivers section §"Phase 1: Foundation"; open questions §"Open Questions to Resolve Before Planning" (Q4 = CI choice, now answered as D-01..D-06)
- `.planning/research/STACK.md` — Version pins, compatibility matrix (`cmdk >= 1.0.3`, `next-themes >= 0.4.x` for React 19), full dep rationale
- `.planning/research/ARCHITECTURE.md` — Anti-patterns to avoid (1: usePathname in layout, 3: next-themes managing accent, 6: mirroring URL into Context), single-source-of-truth principles for `lib/routes.ts`, `lib/types.ts`
- `.planning/research/PITFALLS.md` — Pitfall 11 (orphan code from delete-without-replace), Pitfall 12 (placeholder content shipping)
- `.planning/research/FEATURES.md` — Table-stakes features map; Phase 1 establishes data model that downstream features rely on

### Codebase intel (existing state at 2026-05-06)

- `.planning/codebase/STACK.md` — Current versions (`next@15.3.2`, ESLint 8.57, TypeScript 5.8.3, Vitest 3.1.4); Node 22.15.17 dev target; what's NOT installed
- `.planning/codebase/STRUCTURE.md` — Directory layout, naming conventions (kebab-case files, PascalCase components, `@/` alias), where to add new code
- `.planning/codebase/CONCERNS.md` — **Critical:** flags `next@15.3.2` advisories (drives INFRA-01); `beck@example.com` and `Product Studio` leaks in `lib/fallback-data.ts` (drives DATA-02 grep list); empty `next.config.ts` and security header gaps (drives INFRA-04); ESLint 8 EOL; tsconfig `target: ES2017` overly conservative
- `.planning/codebase/CONVENTIONS.md` — Existing patterns to preserve in the rewrite
- `.planning/codebase/INTEGRATIONS.md` — `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8080`; `NEXT_PUBLIC_SITE_URL` used by sitemap/robots; current `getJson` silent-fallback pattern (preserve in DATA-04)
- `.planning/codebase/TESTING.md` — Vitest setup, current single smoke test, jsdom configuration
- `.planning/STATE.md` — Current position, open questions list (Q4 = CI choice resolved here)

### Design reference (canonical for visual ambiguity)

- `design_handoff_terminal_portfolio/README.md` — High-fidelity design spec, library recommendations (`next-themes`, `cmdk`)
- `design_handoff_terminal_portfolio/app.jsx` — 605-line React prototype; canonical for any visual ambiguity per CLAUDE.md. Phase 1 doesn't render anything visual but `lib/types.ts` field shapes will be informed by what the views render in Phase 3 — read this when designing the data model.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/api.ts` `getJson<T>(path, fallback)` helper** — preserve the ISR + silent-fallback pattern for v1 (per STACK.md §"Data fetching"). DATA-04 adapts the consumers, not the helper itself. Future Phase 6 work may add observability around the silent catch.
- **`lib/types.ts` skeleton** — current types (`Profile`, `Skill`, `Experience`, `MobileApp`, `BlogPost`) are renamed/restructured to the terminal data model (`Profile`, `Project`, `Social`, `Experience`, `Writing`, `ShippedApp`, `StackCategory`). The file path stays; the contents are rewritten.
- **`app/sitemap.ts` and `app/robots.ts`** — keep the file conventions; `sitemap.ts` will iterate `lib/routes.ts` once that exists (covered in Phase 2 / ROUTE-04, but Phase 1 must export the registry).
- **`tsconfig.json` strict mode + `@/` alias** — keep as-is; bump `target` to ES2022.
- **`vitest.config.ts` jsdom + `@/` alias + setup file** — keep as-is; tests will be added in Phase 2 onward.
- **`next-env.d.ts`** — Next.js managed; do not edit.
- **`.env.example`** — keeps two existing variables (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`); Phase 1 reaffirms these are the only env vars needed.

### Established Patterns

- **Pure CSS + CSS custom properties in `app/globals.css`** — Phase 1 doesn't touch `globals.css` content (Phase 2 owns the oklch token system) but the file stays. No CSS framework introduced.
- **Server Components by default; client components carry `"use client"` at top** — Phase 1 doesn't add new components but the route group `app/(terminal)/` will be staged. The pattern is enforced by Phase 2's RSC discipline (Pitfall 9).
- **Native `fetch` with `next: { revalidate: 300 }`** — preserved in DATA-04.
- **Kebab-case filenames; PascalCase exported components; `@/lib/...` imports** — preserved.

### Integration Points

- **`package.json` scripts** — Phase 1 adds `prebuild` (or `postbuild`) script for INFRA-05 grep, adds `knip` script (`knip` or `npx knip`), keeps existing `dev`/`build`/`start`/`lint`/`test`. May add `typecheck` script (`tsc --noEmit`) for CI clarity.
- **`next.config.ts` headers() function** — Phase 1 introduces this (currently the file is empty `{}`). Headers list per D-13/D-14.
- **`.github/workflows/ci.yml`** — new file. Runs on `pull_request`. Steps: checkout → setup-node (with `.nvmrc`) → `npm ci` → lint → typecheck → test → knip → build.
- **`lib/routes.ts`** — new file. Exports `const routes = [...] as const` so `routes[number]` gives a literal type for downstream consumers (Sidebar, CommandPalette, sitemap).
- **`lib/portfolio-data.ts`** — new file. Replaces `lib/fallback-data.ts`. Imports types from `lib/types.ts`.
- **`app/layout.tsx`** — Phase 1 adds `metadataBase` (ROUTE-03) but does NOT yet add the `ThemeProvider` / accent boot script (Phase 2 / SHELL + THEME).
- **Sibling repo `portfolio-services/`** — out of scope for Phase 1 work, but the new `lib/types.ts` shape becomes the contract for Phase 6 / BACKEND-02. Document the contract in `lib/types.ts` JSDoc so future backend work has a clear target.

</code_context>

<specifics>
## Specific Ideas

- **TBD marker grammar:** prefer `TODO:` (uppercase, with colon) consistently across `lib/portfolio-data.ts`. The colon is what makes it a marker rather than a word — `getJson` and `lib/api.ts` doc comments can use lowercase `todo` in prose without tripping the grep, since the grep will be case-sensitive on `TODO`.
  - Decision on case-sensitivity flag for the grep is Claude's discretion at planning time.
- **CI workflow trigger:** `pull_request` on all branches into `main`. Do NOT add `workflow_dispatch` until needed.
- **`npm ci` in CI, `npm install` locally** — keep developer ergonomics local while CI enforces lockfile reproducibility.
- **`knip` configuration:** start with the default `knip.json` or `package.json#knip` config. Tune thresholds only if false positives appear (e.g. shadcn-ui style "intentional barrel exports" — none apply to this repo today).
- **Engine pin specifics:** `engines.node: ">=22"` (not `"22.x"`) — allows minor + patch upgrades without `package.json` churn but rejects Node < 22.

</specifics>

<deferred>
## Deferred Ideas

- **CSP (Content-Security-Policy)** — requires a nonce-based strategy threaded through the Phase 2 inline accent boot script. Phase 2 owns the script; CSP work happens after Shell ships, likely as a v2 hardening milestone. Capture as a future-phase concern, not Phase 1.
- **URL/scheme validation on API-supplied hrefs (`javascript:` injection risk per CONCERNS.md)** — deferred to Phase 6 / BACKEND-04 alongside backend cutover. Phase 6 plan must include adding a guard in `lib/api.ts` (single chokepoint).
- **CSP-Report-Only header** — could land alongside D-14 security headers without a nonce, if observability of would-be-blocked content is wanted. Currently deferred to keep Phase 1 focused; revisit at end of Phase 2 if developer wants pre-emptive CSP signal.
- **Dependabot / Renovate** — flagged in CONCERNS.md for ongoing dep hygiene. Not in Phase 1; revisit after Phase 7 deploy.
- **Sentry / observability** — flagged in CONCERNS.md. Out of scope for v1 entirely; v1 has no telemetry per PROJECT.md.
- **Per-endpoint revalidation tags** — `lib/api.ts` uses a blanket `revalidate: 300`. Per-endpoint values + `revalidateTag` integration deferred (FEATURES.md / future content pipeline territory).
- **ESLint 9 flat-config migration** — folded into Phase 1 hygiene (Claude's discretion) IF compatible with `eslint-config-next`@15.5 peer; may downgrade to "stay on 8.57 for v1" during planning research. Either way, the dev-tooling-hygiene scope decision is captured.
- **Real `public/resume.pdf`** — Phase 6 / CONTENT-05. Phase 1 leaves the placeholder in place because nothing in Phase 1 links to `/resume.pdf` (the persistent top-bar resume button is a Phase 2 affordance).
- **Vercel Analytics, `resume_download` event** — Phase 7 / DEPLOY-06.
- **Splitting the GitHub Actions workflow into multiple jobs** (lint+typecheck parallel with test, build last) — performance optimization deferred; single-job sequential is fine for Phase 1's tiny codebase.
- **`prefers-reduced-motion`, skip-link, contrast audits** — Phases 4/5; not Phase 1.

### Reviewed Todos (not folded)

None — no pending todos in `.planning/todos/` matched Phase 1 scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-05-06*
