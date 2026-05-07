---
phase: 03-views
plan: 11
subsystem: ui
tags: [view, shipped, store-badge, copy-button, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-01 ExternalLink primitive (StoreBadge wraps it). Plan 03-02 CopyButton client island (per-app copy). Plan 03-03 StoreBadge primitive + sourced /badges/*.svg artwork (license-compliant). Plan 03-04 view+primitive CSS (.shipped-subhead, .shipped-list, .shipped-row, .shipped-row-index, .shipped-row-name, .shipped-row-summary, .shipped-row-affordances, .shipped-row-meta, .shipped-row-year, .shipped-row-status, .shipped-row-role, .copy-button, .copy-button--icon, .empty-state, .store-badge-link). Plan 03-05 vertical-slice template (page → view → smoke-test shape)."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title string for the shipped route ('shipped.app — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('ls -la shipped/'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getShipped returns Promise<ShippedApp[]>, falls back to SHIPPED seed when backend unreachable). lib/types.ts ShippedApp shape (name, platforms, appStoreUrl?, googlePlayUrl?, role, year, summary?). lib/routes.ts ROUTES[6] (description, pathname) — single source of truth for metadata description + canonical."

provides:
  - "ShippedView RSC at app/components/views/shipped-view.tsx — receives ShippedApp[] prop, renders empty-state line when length === 0 (LOCKED 'total 0 · (no apps shipped to stores yet)'), otherwise renders 32px/1fr/110px grid per app with name + summary + per-platform StoreBadge + per-app CopyButton + year/role/status."
  - "Async page wrapper at app/(terminal)/shipped/page.tsx — fetches via getShipped(), composes <PromptLine cmd='ls -la shipped/' /> + <ShippedView shipped={shipped} />, exports enriched static metadata (LOCKED title preserved + description from ROUTES[6].description + alternates.canonical: '/shipped')."
  - "TEST-05 smoke spec at app/(terminal)/shipped/page.test.tsx — three assertions: render-without-throw, locked-title export, locked-prompt-text in body. 3/3 passing."
  - "Live render today is the LOCKED empty-state line because lib/portfolio-data.ts ships SHIPPED = []. Phase 6 fills with real App Store / Google Play URLs; populated branch ready and tested via type system."

affects:
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — shipped metadata contract (template literal off ROUTES[6].label + description + alternates.canonical) is one of seven titles that 03-12's `Set(allTitles).size === 7` cross-view test enforces."
  - "Phase 5 (SEO-01..04) — extends per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-01..05) — fills SHIPPED array with real App Store / Google Play URLs; ShippedView renders array values verbatim, no view edits expected (populated branch already coded against typed shape)."
  - "Phase 6 / BACKEND-04 — will add zod URL host-allowlist validation pinning appStoreUrl to apps.apple.com and googlePlayUrl to play.google.com (T-03-36 mitigation deferred per threat model)."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page wrapper as async RSC, fetches data, passes typed props to view RSC (ARCHITECTURE.md Pattern 1 + Pattern 3 — same template as 03-05 about-view)."
    - "Static metadata: Metadata via template-literal off ROUTES[6].label so the LOCKED Phase 2 D-12 title is single-sourced and any future label edit cascades correctly."
    - "Per-view metadata.description sourced from ROUTES[6].description (single source of truth — no prose drift between sidebar/palette/sitemap/metadata)."
    - "Per-view metadata.alternates.canonical sourced from ROUTES[6].pathname (relative; resolves against Phase 1 metadataBase)."
    - "Non-mutating sort: `[...shipped].sort((a, b) => Number(b.year) - Number(a.year))` — never in-place per CONTEXT D-12."
    - "Per-app conditional StoreBadge rendering: ios badge renders iff `app.platforms.includes('ios') && !!app.appStoreUrl`; android badge renders iff `app.platforms.includes('android') && !!app.googlePlayUrl` — single-platform fallback per D-13."
    - "Per-app icon-only CopyButton with `idleLabel='⧉'` + `copiedLabel='✓'` to keep row compact; copies `app.appStoreUrl ?? app.googlePlayUrl` (App Store preferred) per D-14."
    - "Status field hardcoded to literal 'shipped' string per UI-SPEC §V7 / CONTEXT D-15 (ShippedApp type carries no `status` field; entry's existence implies it shipped)."
    - "External CTAs always route through <ExternalLink> via the StoreBadge primitive (SEO-05 — no raw target=_blank in view code)."
    - "Smoke test pattern: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is the locked string, (3) body contains the locked prompt-line text — replicates 03-05 contract."

key-files:
  created:
    - "app/components/views/shipped-view.tsx — RSC view (84 lines). Empty branch + populated branch with 32/1fr/110 grid per app. Per-platform StoreBadge composition + per-app icon-only CopyButton."
    - "app/(terminal)/shipped/page.test.tsx — TEST-05 smoke spec (24 lines). 3 assertions; uses globals: true (no vitest import); defensive next/navigation mock with shipped segment."
  modified:
    - "app/(terminal)/shipped/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (23 lines). Imports getShipped, ShippedView, ROUTES; metadata gains description + alternates; body composes <PromptLine /> + <ShippedView shipped={shipped} />; orphan <p className='stub-body'> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[6].label (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single (any future relabel cascades to title automatically). Identical pattern to 03-05."
  - "Per-app key uses `app.name` (not array index) — name is the natural unique identifier across SHIPPED (no two apps will share a name; backend / data layer enforces this implicitly via business rule). Stable across reorderings, satisfies React reconciler key uniqueness."
  - "CopyButton aria-label uses runtime template literal `Copy ${app.name} store link` — preserves the LOCKED contract (Plan invariant + UI-SPEC §V7) while binding to the actual app name for SR users."
  - "Status row renders literal 'shipped' string for any non-empty entry (UI-SPEC §V7 / D-15) — ShippedApp type has no `status` field; entry existence implies shipped. Alternative (omit row) would have broken the 110px right-column 3-line vertical rhythm shared with projects-row."
  - "Icon-only CopyButton variant (`⧉` / `✓`) per D-14 — keeps the affordances row compact so badges + copy don't crowd into the 110px right meta column."

patterns-established:
  - "Wave 4 view template confirmed for plans 03-06..03-11: 1 view RSC at app/components/views/<name>-view.tsx, 1 page rewrite at app/(terminal)/<route>/page.tsx (async + enriched metadata), 1 smoke spec at the page-test sibling."
  - "View prop shape: ({ <typed-data>: <Type>[] | <Type> }) — page fetches, view receives typed props. No data fetching inside view bodies."
  - "Per-app composition pattern for primitives: StoreBadge owns the SVG asset + ExternalLink wrapper + SR label; view supplies platform discriminator + URL + appName; view never inlines raw <img> or <a target='_blank'>."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-07, VIEW-08, SEO-05, TEST-05]

# Metrics
duration: 2m
completed: 2026-05-07
---

# Phase 3 Plan 11: Shipped View Vertical Slice Summary

**Shipped-view (the 7th view, added beyond the design handoff per PROJECT.md key decision) landed — RSC view component with empty + populated branches + per-platform StoreBadge composition + per-app icon-only CopyButton + async page wrapper with enriched metadata + TEST-05 smoke spec — completing Wave 4 of Phase 3.**

## Performance

- **Duration:** ~2 min (executor wall time)
- **Started:** 2026-05-07T00:22:47Z
- **Completed:** 2026-05-07T00:25:00Z
- **Tasks:** 2 / 2
- **Files created:** 2 (`app/components/views/shipped-view.tsx`, `app/(terminal)/shipped/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/shipped/page.tsx`)

## Accomplishments

- New RSC component `ShippedView` rendering the V7 shipped-view layout per UI-SPEC §V7:
  - **Empty branch** (live render today; `SHIPPED = []`): `<div class="empty-state">total 0 · (no apps shipped to stores yet)</div>` (LOCKED string per CONTEXT D-03 / D-15).
  - **Populated branch**: `<ul class="shipped-list">` with one `<li class="shipped-row">` per app. Each row is a 32px/1fr/110px grid (mirrors projects-row layout per D-12) containing:
    - Index `01.` `02.` … in the 32px column (`String(i + 1).padStart(2, "0") + "."`).
    - Name (accent 600) + optional summary (13px) + affordances row (StoreBadges + CopyButton) in the 1fr column.
    - Year + literal `shipped` status + role (right-aligned 11px muted) in the 110px column.
- **Per-platform StoreBadge conditional rendering** (CONTEXT D-13 single-platform fallback):
  - iOS badge renders iff `app.platforms.includes("ios") && !!app.appStoreUrl`.
  - Android badge renders iff `app.platforms.includes("android") && !!app.googlePlayUrl`.
  - Single-platform apps render only the relevant badge.
- **Per-app icon-only CopyButton** (CONTEXT D-14) with `idleLabel="⧉"` + `copiedLabel="✓"` and aria-label `Copy ${app.name} store link`. Copies `app.appStoreUrl ?? app.googlePlayUrl` (App Store URL preferred; falls back to Google Play if iOS missing).
- **Non-mutating sort by year desc** via `[...shipped].sort((a, b) => Number(b.year) - Number(a.year))` — preserves prop immutability per CONTEXT D-12.
- Shipped page (`app/(terminal)/shipped/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getShipped()`, composes `<PromptLine cmd="ls -la shipped/" />` + `<ShippedView shipped={shipped} />`. The Phase 2 stub `<p className="stub-body">` paragraph removed in the same commit (CLAUDE.md brownfield delete-and-replace).
- Static `metadata: Metadata` enriched with `description: route.description` (sourced from `ROUTES[6]`) and `alternates: { canonical: route.pathname }`. The LOCKED Phase 2 title `"shipped.app — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec passes 3 assertions: (1) ShippedPage renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `ls -la shipped/` prompt text.
- SEO-05 enforced: every external link in `shipped-view.tsx` flows through `<StoreBadge>` → `<ExternalLink showGlyph={false}>` (which bakes `target="_blank" rel="noopener noreferrer"`); zero raw `target="_blank"` in the view file (T-03-34 / T-03-35 mitigation verified).
- All gates green: `npm test` 3/3 passing on the new spec, `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with `/shipped` prerendered as static (602 B + 102 kB First Load JS — CopyButton client island contributes the per-route delta), postbuild INFRA-05 placeholder check clean.

## Task Commits

Each task was committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create ShippedView RSC component** — `4fa8fa4` (feat)
2. **Task 2: Rewrite shipped page wrapper to async RSC + add smoke spec** — `75c81cd` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/shipped-view.tsx` (created, +84) — RSC view; reads `ShippedApp[]` prop; empty branch returns `.content-block > .empty-state`; populated branch renders `.shipped-subhead` total + `.shipped-list` with per-row 32/1fr/110 grid; per-row affordances composition: optional `<StoreBadge platform="ios" />`, optional `<StoreBadge platform="android" />`, optional `<CopyButton ariaLabel="Copy {name} store link" className="copy-button--icon" idleLabel="⧉" copiedLabel="✓" />`; right-column meta: year, literal `shipped`, role.
- `app/(terminal)/shipped/page.tsx` (modified, +18 / -4) — Phase 2 stub replaced with async RSC; imports `getShipped`, `ShippedView`, `ROUTES`, `PromptLine`; static metadata gains `description` + `alternates`; body composes the prompt-line + view; orphan `<p className="stub-body">` removed.
- `app/(terminal)/shipped/page.test.tsx` (created, +24) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); defensively mocks `next/navigation` with `shipped` segment; awaits `ShippedPage()` and renders the result.

## Decisions Made

- **metadata.title via template literal off `ROUTES[6].label`.** Preserves the LOCKED Phase 2 D-12 string `"shipped.app — Bakytbek Tatibekov"` AND single-sources the file label — any future relabel cascades. The smoke test's `expect(metadata.title).toBe("shipped.app — Bakytbek Tatibekov")` confirms.
- **Per-app React key = `app.name`.** Names are unique across SHIPPED by data-layer convention (no two apps share a name); using the name instead of array index gives stable reconciler keys across Phase 6 re-rankings.
- **Status row renders literal `"shipped"` string.** ShippedApp type has no `status` field; UI-SPEC §V7 + CONTEXT D-15 specify that any present entry implies shipped status. Alternative (omit the row) would have broken the 3-line vertical rhythm shared with projects-row's right-column meta.
- **CopyButton uses icon-only variant (`⧉` / `✓`) per D-14.** The default `⧉ copy` / `copied ✓` labels would crowd the 1fr column when StoreBadge images are present; the icon-only variant + `.copy-button--icon` CSS class keeps the affordances row compact.

## Deviations from Plan

None — both tasks executed exactly as written in `03-11-PLAN.md`. No Rule 1/2/3 auto-fixes triggered; the plan was fully prescriptive (dependencies 03-01, 03-02, 03-03, 03-04, 03-05 had pre-shipped every primitive, CSS class, and template the view needed).

## Issues Encountered

**Worktree-vs-parent shell-cwd misroute for the initial Write of `shipped-view.tsx` (recovered cleanly).**

The first `Write` call placed `shipped-view.tsx` at the parent repo path (`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/app/components/views/shipped-view.tsx`) instead of the worktree path. The same artifact was already documented in 03-05-SUMMARY.md as a worktree-topology issue. Recovery: copied the file from the parent repo into the worktree via absolute paths, deleted the parent-repo copy, then committed normally in the worktree. The parent repo's working tree was returned to clean state (only unrelated changes from a sibling parallel executor remain).

Verification: `pwd` confirms worktree, `git status` shows the file under the worktree branch, and parent-repo `git status` shows no shipped-view artifact post-cleanup. All subsequent Write calls used absolute worktree paths and landed correctly.

This is a worktree-topology artifact, not a defect of the plan or the changes.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives. No environment variables, no external services, no manual config. The live render today is the empty-state line because `SHIPPED = []`; Phase 6 fills with real App Store / Google Play URLs and the populated branch becomes live with no view edits.

## Next Phase Readiness

- **Wave 4 of Phase 3 (the six parallel view plans 03-06..03-11) is now complete.** Plan 03-12 (cross-view metadata + title-uniqueness test) can immediately consume `metadata` exports from all 7 page modules.
- **Plan 03-12 unblocked.** The metadata contract landed here (template literal off `ROUTES[6].label` + `description: route.description` + `alternates: { canonical: route.pathname }`) is the shape 03-12's `Set(allTitles).size === 7` cross-view test enforces.
- **Phase 5 (SEO-01..04) unaffected.** Shipped page already exports static metadata with `description` + `alternates.canonical`; Phase 5 will extend with OG / Twitter / JSON-LD without touching this file's existing exports.
- **Phase 6 (CONTENT-06: shippedApps) unblocked.** ShippedView renders against typed `ShippedApp[]`; Phase 6 swaps the seed `SHIPPED = []` with real entries (App Store + Google Play URLs, names, years, summaries, roles) — no view edits needed. The populated branch is already coded against the typed shape.
- **Phase 6 / BACKEND-04 hook.** The threat model (T-03-36) defers App Store / Google Play URL host-allowlist validation to Phase 6's zod-at-the-api-boundary work in `lib/api.ts`; no view-side validation is required.

## Threat Mitigation Verification

- **T-03-34 (reverse tabnabbing on store badges):** mitigated. `grep -c 'target="_blank"' app/components/views/shipped-view.tsx` returns `0`; every store badge renders via `<StoreBadge>` → `<ExternalLink showGlyph={false}>` which bakes `target="_blank" rel="noopener noreferrer"` (verified in `app/components/primitives/external-link.tsx` line 27).
- **T-03-35 (referrer leak to store CDN):** mitigated. `noreferrer` baked into `<ExternalLink>` (verified in `app/components/primitives/external-link.tsx` line 28). No view-side override.
- **T-03-36 (license violation if SHIPPED data points to non-store URLs):** accepted per plan. `appStoreUrl` / `googlePlayUrl` are typed `string` from `lib/portfolio-data.ts` (developer-controlled, currently empty). Phase 6 / BACKEND-04 will add zod URL validation pinning to `apps.apple.com` / `play.google.com` host allowlists at the api boundary.
- **T-03-37 (XSS via app.summary):** accepted per plan. `summary` is typed `string`, React auto-escapes text content, data origin is developer-controlled `lib/portfolio-data.ts`. No defensive sanitization required.

## Self-Check: PASSED

- `app/components/views/shipped-view.tsx` — FOUND
- `app/(terminal)/shipped/page.tsx` — FOUND (modified)
- `app/(terminal)/shipped/page.test.tsx` — FOUND
- Commit `4fa8fa4` (`feat(03-11): add ShippedView RSC component`) — FOUND in `git log`
- Commit `75c81cd` (`feat(03-11): rewrite shipped page wrapper to async RSC + add smoke spec`) — FOUND in `git log`

---
*Phase: 03-views*
*Completed: 2026-05-07*
