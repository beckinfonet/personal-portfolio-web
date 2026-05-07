---
phase: 03-views
plan: 08
subsystem: ui
tags: [view, experience, vertical-slice, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-04 view+primitive CSS (.experience-list / .experience-row / .experience-row-header / .experience-hash / .experience-role / .experience-company / .experience-period / .experience-summary / .empty-state). Plan 03-05 vertical-slice template (page → view → smoke-test pattern). Plan 03-13 cleared the inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title string for the experience route ('experience.log — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('git log --oneline --decorate experience.log'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getExperience returns Promise<Experience[]>, falls back to EXPERIENCE seed when backend unreachable). lib/types.ts Experience shape ({ company, role, period, summary }). lib/routes.ts ROUTES[3] (description, pathname) — single source of truth for metadata description + canonical."

provides:
  - "ExperienceView RSC at app/components/views/experience-view.tsx — receives Experience[] prop, branches on length===0 to render LOCKED empty-state line, otherwise emits per-row hex-hash + role + @ company + (period) header + summary."
  - "Async page wrapper at app/(terminal)/experience/page.tsx — fetches Experience[] via getExperience(), composes <PromptLine /> + <ExperienceView />, exports enriched static metadata (title preserved + description + alternates.canonical = '/experience')."
  - "TEST-05 smoke spec at app/(terminal)/experience/page.test.tsx — three assertions: render-without-throw, locked-title export, locked-prompt-text in body."

affects:
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — the metadata contract landed here (template-literal title off ROUTES[3].label + description from ROUTES[3].description + alternates.canonical) feeds 03-12's cross-view Set(allTitles).size === 7 assertion."
  - "Phase 5 (SEO-01..04) — will extend the per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-06) — fills EXPERIENCE seed in lib/portfolio-data.ts with real role rows; the populated branch renders without view edits (typed map over Experience[])."
  - "v2 (deferred) — real SHA-1 hex-hash generator could replace the toy `(i+1).toString(16).padStart(7,'0')` formula without touching consumers (only the formula site changes)."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page wrapper as async RSC, fetches data, passes typed props to view RSC (ARCHITECTURE.md Pattern 1 + Pattern 3)."
    - "Static metadata: Metadata via template-literal off ROUTES[3].label so the LOCKED Phase 2 D-12 title is single-sourced and any future label edit cascades correctly."
    - "Per-view metadata.description sourced from ROUTES[3].description (single source of truth — no prose drift between sidebar/palette/sitemap/metadata)."
    - "Per-view metadata.alternates.canonical sourced from ROUTES[3].pathname (relative; resolves against Phase 1 metadataBase)."
    - "Empty-state discipline (CONTEXT D-02 / D-03): array.length === 0 branch returns LOCKED `(no commits to experience.log yet)` line; otherwise the populated branch maps the typed array."
    - "Hex-hash deterministic formula: `(i + 1).toString(16).padStart(7, '0')` — handoff toy form from CONTEXT 'Claude's Discretion' lock; first row renders `0000001`."
    - "Smoke test pattern: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is the locked string, (3) body contains the locked prompt-line text."

key-files:
  created:
    - "app/components/views/experience-view.tsx — RSC view (40 lines). Branches on length===0 → empty-state line; otherwise renders <ul.experience-list> with per-row <li.experience-row> containing header (.experience-row-header with hash + role + @ company + (period)) and summary on second line. Stable React key composed of `${company}-${role}-${period}`."
    - "app/(terminal)/experience/page.test.tsx — TEST-05 smoke spec (28 lines). 3 assertions; uses globals: true (no vitest import); defensive next/navigation mock returning 'experience' segment + '/experience' pathname."
  modified:
    - "app/(terminal)/experience/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (24 lines). Imports getExperience, ExperienceView, ROUTES; metadata gains description + alternates.canonical; body composes <PromptLine cmd=\"git log --oneline --decorate experience.log\" /> + <ExperienceView experience={experience} />; orphan <p className=\"stub-body\"> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[3].label (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single (any future relabel cascades to title automatically)."
  - "Per-row React key composed of `${e.company}-${e.role}-${e.period}` (not array index) — gives stable reconciler identity if Phase 6 reorders or interpolates entries; index-key would force re-mounts on reorder."
  - "No programmatic sort applied — array order is the render order (CONTEXT 'Claude's Discretion'). Period strings ('2022 - present', '2019 - 2022') are not Date.parse-able reliably; author convention puts the most-recent role first in EXPERIENCE."
  - "Hex hash kept at the toy `(i+1).toString(16).padStart(7,'0')` form — deterministic, test-stable, no build-time generator needed. Real SHA-1 hashes deferred to v2 (would need company+role+period crc32 generator)."

patterns-established:
  - "Wave 4 view template confirmed (replicates 03-05 template with empty-state branch added): 1 view file at app/components/views/<name>-view.tsx (RSC), 1 page rewrite at app/(terminal)/<route>/page.tsx (async RSC, enriched metadata), 1 smoke spec at the page-test sibling."
  - "Empty-state branch pattern: `if (items.length === 0) return <div className=\"content-block\"><div className=\"empty-state\">{LOCKED_STRING}</div></div>;` — wraps in .content-block to match populated branch's container."
  - "Locked-string verbatim copy: empty-state body strings (CONTEXT D-03) and prompt strings (Phase 2 D-13) are copied character-for-character; smoke specs assert the literal."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-04, VIEW-08, TEST-05]

# Metrics
duration: ~3m
completed: 2026-05-07
---

# Phase 3 Plan 08: Experience View Slice Summary

**Experience-view vertical slice landed — RSC view component with empty/populated branches + async page wrapper with enriched metadata + TEST-05 smoke spec — replicating the 03-05 template for the experience.log route.**

## Performance

- **Duration:** ~3 min wall time (worktree-side)
- **Started:** 2026-05-07T00:21:42Z
- **Completed:** 2026-05-07T00:24:21Z
- **Tasks:** 2 / 2
- **Files created:** 2 (`app/components/views/experience-view.tsx`, `app/(terminal)/experience/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/experience/page.tsx`)

## Accomplishments

- New RSC component `ExperienceView` rendering the V4 experience.log layout per UI-SPEC §V4: empty branch emits LOCKED `(no commits to experience.log yet)` muted line; populated branch maps `Experience[]` → `<ul.experience-list>` with per-row hex hash + accent role + muted `@ company` + right-aligned `(period)` + summary on second line.
- Hex-hash deterministic via `(i + 1).toString(16).padStart(7, "0")` — confirmed `0000001` for first row, `000000f` for 15th, `0000100` for 256th.
- Experience page (`app/(terminal)/experience/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getExperience()`, composes `<PromptLine cmd="git log --oneline --decorate experience.log" />` + `<ExperienceView experience={experience} />`. The Phase 2 stub `<p className="stub-body">` paragraph removed in the same commit (CLAUDE.md brownfield delete-and-replace discipline).
- Static `metadata: Metadata` enriched with `description: route.description` (from `ROUTES[3]`) and `alternates: { canonical: route.pathname }` (= `/experience`). The LOCKED Phase 2 title `"experience.log — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec passes 3 assertions: (1) ExperiencePage renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `git log --oneline --decorate experience.log` prompt text.
- SEO-05 enforced trivially: zero external links exist in `experience-view.tsx` (UI-SPEC §V4 specifies pure data display — no `<ExternalLink>` needed; T-03-25 mitigation: React auto-escapes `e.summary` string content).
- All gates green: `npm test` 48/48 passing across 12 files (was 45/45 before this plan; +3 new), `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with `/experience` static-prerendered (146 B) with `revalidate=5m`, postbuild INFRA-05 placeholder check clean.

## Task Commits

Each task committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create ExperienceView RSC component** — `88b6d82` (feat)
2. **Task 2: Rewrite experience page wrapper to async RSC + add smoke spec** — `bdc8ec1` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/experience-view.tsx` (created, +40) — RSC view; reads `Experience[]` prop; branches on `experience.length === 0` → `<div className="content-block"><div className="empty-state">(no commits to experience.log yet)</div></div>`; otherwise emits `<div className="content-block"><ul className="experience-list">{...rows}</ul></div>` where each row is `<li className="experience-row" key={`${e.company}-${e.role}-${e.period}`}>` containing `<div className="experience-row-header">` (hash + role + `@ company` + `(period)` spans) and `<div className="experience-summary">{e.summary}</div>`.
- `app/(terminal)/experience/page.tsx` (modified, +20 / -4) — Phase 2 stub replaced with async RSC; imports `getExperience`, `ExperienceView`, `ROUTES`, `PromptLine`; static metadata gains `description` + `alternates.canonical`; body composes the prompt-line + view; orphan `<p className="stub-body">` removed.
- `app/(terminal)/experience/page.test.tsx` (created, +28) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); defensively mocks `next/navigation`; awaits `ExperiencePage()` and renders the result.

## Decisions Made

- **No programmatic sort applied to `Experience[]`.** CONTEXT 'Claude's Discretion' notes period strings ('2022 - present', '2019 - 2022') are not reliably `Date.parse`-able. Array order from `lib/portfolio-data.ts` IS the render order; author convention places the most-recent role first. Phase 6 will populate EXPERIENCE in that order; v1 ships against `EXPERIENCE = []` so the empty branch is the live render today.
- **Per-row React key = `${e.company}-${e.role}-${e.period}` (not array index).** Composite-string keys give stable reconciler identity across Phase 6 reorderings (e.g. inserting an older role into the middle for completeness); index-keys would force re-mounts of every row below the insertion point. The triple is unique within the dataset by author convention (a person doesn't hold two simultaneous roles at the same company over the same period).
- **Hex hash kept at toy form `(i+1).toString(16).padStart(7,'0')`.** CONTEXT 'Claude's Discretion' lock. Output is deterministic across builds (`0000001`, `0000002`, ...), test-stable (smoke test could assert it without flakiness), needs no build-time generator. Real SHA-1 hashes deferred to v2 per CONTEXT 'Deferred Ideas' (would need a `crc32(company+role+period)` build-time helper).
- **metadata.title via template literal off `ROUTES[3].label`.** Same pattern as 03-05/03-06/03-07: preserves the LOCKED Phase 2 D-12 string AND single-sources the file label — any future relabel of `ROUTES[3].label` cascades to the title automatically. Smoke test asserts the literal `"experience.log — Bakytbek Tatibekov"` to lock the contract.

## Deviations from Plan

None — both tasks executed exactly as written in `03-08-PLAN.md`. No Rule 1/2/3 auto-fixes triggered; the plan was fully prescriptive (dependencies 03-04, 03-05, 03-13 had pre-shipped every CSS class, view template, and build-gate the experience view needed).

## Issues Encountered

**Worktree-vs-parent shell-cwd mismatch (recovered cleanly).**

The shell tool's per-call cwd reset combined with the `Write` tool resolving the absolute path `/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/app/components/views/experience-view.tsx` (parent repo path) instead of the worktree path caused Task 1's initial file write to land in the parent repo's working tree (uncommitted, untracked). Recovery: moved the file from the parent path to the worktree-anchored path `/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.claude/worktrees/agent-a215bb22a61b579d5/app/components/views/experience-view.tsx` via `mv`, verified parent repo working tree was clean afterward, then committed in the worktree as `88b6d82`. No data lost; nothing leaked into the parent's git history. Task 2's `Write` calls used worktree-anchored absolute paths from the start.

This is the same worktree-topology artifact documented in `03-05-SUMMARY.md` "Issues Encountered" — future executors operating in nested worktrees should always use the full worktree-anchored absolute path in `Write` tool calls.

**Acceptance-criterion grep vs. project-convention comment (documented, no change).**

Task 1's acceptance criterion `[ "$(grep -c \"\\\"use client\\\"\" app/components/views/experience-view.tsx)" = "0" ]` literally returns `1` because the file's first line is the project-convention comment `// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)` — the same comment used in `app/components/views/about-view.tsx` (Plan 03-05) and other RSC files. The `<action>` block of the plan prescribes that comment verbatim, so the file is consistent with the established convention. The acceptance criterion's intent — "no actual `'use client'` directive at the top of the file" — is satisfied: `grep -nE '^"use client";?\s*$' app/components/views/experience-view.tsx` returns nothing. Same documented gap as in `03-05-SUMMARY.md`. No code change applied; flagged for the verifier and Plan 03-12.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives + CSS. No environment variables, no external services, no manual config.

## Next Phase Readiness

- **Wave 4 sibling plans (03-06 / 03-07 / 03-09 / 03-10 / 03-11) unblocked or unaffected.** Each replicates the same two-task shape; this slice adds another reference for the empty-state branch pattern.
- **Plan 03-12 (cross-view metadata + title-uniqueness test) unblocked further.** The metadata contract landed here (`title` template literal off `ROUTES[3].label` + `description: route.description` + `alternates.canonical: route.pathname`) is the shape 03-12's `Set(allTitles).size === 7` cross-view test enforces. After all six Wave 4 view plans land, 03-12 can run.
- **Phase 4 (mobile redistribution) unaffected.** No desktop-only patterns introduced; CSS classes consumed are already responsive-ready (Plan 03-04 sized the experience-row layout in a mobile-friendly way with right-aligned period via `margin-left: auto`).
- **Phase 6 (CONTENT-06) unblocked.** ExperienceView renders `experience.map(...)` against the typed `Experience[]` array — Phase 6 swaps the seed `EXPERIENCE = []` in `lib/portfolio-data.ts` with real entries; no view edits required. The empty-branch path automatically deactivates as soon as the array gains a single entry.

## Threat Mitigation Verification

- **T-03-25 (Tampering / XSS via summary text):** mitigated. `Experience.summary` is typed `string`; rendered as React text-content `<div className="experience-summary">{e.summary}</div>`. React auto-escapes string children. No `dangerouslySetInnerHTML`. Source is `lib/portfolio-data.ts` (developer-controlled, currently empty). Phase 6 / BACKEND-04 will add zod validation at the api boundary as defense-in-depth.

## Self-Check: PASSED

- `app/components/views/experience-view.tsx` — FOUND (`88b6d82`)
- `app/(terminal)/experience/page.tsx` — FOUND modified (`bdc8ec1`)
- `app/(terminal)/experience/page.test.tsx` — FOUND (`bdc8ec1`)
- Commit `88b6d82` (`feat(03-08): add ExperienceView RSC component`) — FOUND in `git log`
- Commit `bdc8ec1` (`feat(03-08): rewrite experience page wrapper to async RSC + smoke spec`) — FOUND in `git log`
- Hex-hash output verified: `(1).toString(16).padStart(7, "0") = "0000001"` (i.e. first row hash is `0000001`, satisfying project_invariants)
- `npm test` — 48/48 passing
- `npm run typecheck` — exits 0
- `npm run lint` — exits 0
- `npm run build` — exits 0; `/experience` static-prerendered

---
*Phase: 03-views*
*Completed: 2026-05-07*
