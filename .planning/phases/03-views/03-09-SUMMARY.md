---
phase: 03-views
plan: 09
subsystem: ui
tags: [view, writing, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-01 ExternalLink primitive (post-as-link wrapper with target=_blank rel=noopener noreferrer baked in). Plan 03-04 view+primitive CSS (.writing-list / .writing-post / .writing-post:hover / .writing-post-meta / .writing-post-title / .writing-post-excerpt / .empty-state — all confirmed at app/globals.css lines 827, 1068–1107). Plan 03-05 vertical-slice template (page → view → smoke-test shape replicated verbatim). Plan 03-13 cleared the inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title string for the writing route ('writing/ — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('ls writing/ && cat *.md'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getWriting returns Promise<Writing[]>, falls back to WRITING seed when backend unreachable; WRITING is empty per CONTENT-04 / D-04). lib/types.ts Writing shape (title, date, readTime, excerpt, link, slug). lib/routes.ts ROUTES[4] (description='Writing — technical posts and notes', pathname='/writing') — single source of truth for metadata description + canonical."

provides:
  - "WritingView RSC at app/components/views/writing-view.tsx — receives Writing[] prop. Empty branch renders LOCKED brand-voice line per D-03/D-04 (`// no posts yet — follow github.com/beckinfonet for code-as-content.`); github.com/beckinfonet is plain text, NOT a link. Populated branch sorts by date desc with defensive Date.parse fallback (NaN → preserve array order, no throw); each post wraps in <ExternalLink> (showGlyph default true, trailing ↗ on title)."
  - "Async page wrapper at app/(terminal)/writing/page.tsx — fetches Writing[] via getWriting(), composes <PromptLine cmd='ls writing/ && cat *.md' /> + <WritingView writing={writing} />, exports enriched static metadata (LOCKED title preserved via template literal + description from ROUTES[4].description + alternates.canonical='/writing')."
  - "TEST-05 smoke spec at app/(terminal)/writing/page.test.tsx — 3 assertions: renders without throwing, metadata.title is the LOCKED Phase 2 D-12 string, body contains the LOCKED prompt-line text. Uses globals: true (no vitest import); defensively mocks next/navigation."

affects:
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — this plan's metadata contract (template literal off ROUTES[4].label + description + alternates.canonical) is the shape 03-12's Set(allTitles).size === 7 cross-view test enforces."
  - "Phase 5 (SEO-01..04) — extends the per-view metadata established here with OG / Twitter / JSON-LD; the WRITING type's `slug` field is reserved for /writing/[slug] dynamic post pages out of v1 scope."
  - "Phase 6 (CONTENT-04) — fills WRITING with real post entries; WritingView renders them with no view edits (defensive sort handles arbitrary date strings; populated branch already path-tested at the type level via Writing shape)."
  - "Phase 7 (recruiter 5-second test) — empty-state line stays in voice; no broken / coming-soon banner; recruiter sees the brand directive (`follow github.com/beckinfonet for code-as-content`) which doubles as a discovery breadcrumb."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Defensive sort: Date.parse + every(!Number.isNaN) short-circuit — if any post fails to parse, returns the original array (no partial sort, no throw). Mitigates T-03-28 by capping pathological inputs at O(n log n) with the every() short-circuit."
    - "Empty-state branch is the LIVE render today: WRITING = [] in lib/portfolio-data.ts per CONTENT-04 / D-04. Phase 6 swaps real content; v1 ships the locked brand-voice line."
    - "Post-as-link wrapper: each <li> contains a single <ExternalLink> wrapping all three rows (.writing-post-meta, .writing-post-title, .writing-post-excerpt). showGlyph default true so trailing ↗ appends after title text — matches handoff app.jsx line 432."
    - "Defensive React key: w.slug || w.title — slug field is typed `string` but may be empty in v1 (Phase 6 may populate); fallback to title (also typed `string`) ensures stable reconciler key."
    - "Date uppercased via JS w.date.toUpperCase() (not CSS text-transform) — matches handoff convention; CSS letter-spacing on .writing-post-meta applies the kerning."

key-files:
  created:
    - "app/components/views/writing-view.tsx — RSC view (51 lines). Empty branch (LOCKED brand-voice line) + populated branch (defensive sort + .map → ExternalLink-wrapped <li>)."
    - "app/(terminal)/writing/page.test.tsx — TEST-05 smoke spec (24 lines). 3 assertions; uses globals: true; defensively mocks next/navigation."
  modified:
    - "app/(terminal)/writing/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (24 lines). Imports getWriting, WritingView, ROUTES; metadata gains description + alternates; body composes <PromptLine /> + <WritingView writing={writing} />; orphan <p className=\"stub-body\"> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[4].label (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND single-sources the file label. Any future relabel cascades to the title automatically. The smoke test's `expect(metadata.title).toBe('writing/ — Bakytbek Tatibekov')` confirms runtime evaluation."
  - "Empty-state github.com/beckinfonet is plain text (not a link). Per UI-SPEC §V5: this is intentional brand voice — recruiter discovery is OPTIONAL; the directive reads as a comment, not a CTA. Wrapping it in <a> would change the read from 'directive' to 'follow this'."
  - "Defensive sort uses every(!isNaN) short-circuit BEFORE sorting — not a try/catch around the comparator. This is cheaper (single O(n) pass to validate, then either O(n log n) sort or the original array) and avoids partial-sort artifacts where some posts are reordered and others aren't."
  - "React key prefers w.slug || w.title (not array index). slug is typed `string` but may be empty in v1 per Writing.slug docstring (Phase 6 populates); falling back to title (also typed `string`) keeps keys stable across reorderings without resorting to index-key anti-pattern."

patterns-established:
  - "Wave 4 view-slice template (replicates 03-05): 1 RSC view at app/components/views/<name>-view.tsx, 1 page rewrite at app/(terminal)/<route>/page.tsx (async RSC, enriched metadata), 1 smoke spec at the page-test sibling. Header comment `// NO \"use client\" — RSC view body (Pitfall 9 / SHELL-02)` matches convention."
  - "Defensive Date.parse + every(!Number.isNaN) short-circuit pattern — reusable for any date-based sort across other views (e.g. shipped-view by year, experience-view by period start year)."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-05, VIEW-08, SEO-05, TEST-05]

# Metrics
duration: 2m
completed: 2026-05-07
---

# Phase 3 Plan 09: Writing View Slice Summary

**Writing-view slice landed — RSC view component (LOCKED empty-state brand-voice line live today + defensive Date.parse populated branch) + async page wrapper with enriched metadata + TEST-05 smoke spec — completing one of six parallel Wave 4 view plans.**

## Performance

- **Duration:** ~2 min (executor-side wall time)
- **Started:** 2026-05-07T00:22:20Z
- **Completed:** 2026-05-07T00:24:11Z
- **Tasks:** 2 / 2
- **Files created:** 2 (`app/components/views/writing-view.tsx`, `app/(terminal)/writing/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/writing/page.tsx`)

## Accomplishments

- New RSC component `WritingView` rendering V1 writing-view per UI-SPEC §V5 + CONTEXT D-03/D-04: empty branch renders the LOCKED brand-voice line `// no posts yet — follow github.com/beckinfonet for code-as-content.` (github.com/beckinfonet is plain text, NOT a link); populated branch sorts by date desc with a defensive `Date.parse + every(!Number.isNaN)` short-circuit fallback (preserves array order on parse failure, no throw); each post wraps in `<ExternalLink>` with `showGlyph={true}` so the trailing ↗ glyph appends to the title.
- Writing page (`app/(terminal)/writing/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getWriting()`, composes `<PromptLine cmd="ls writing/ && cat *.md" />` + `<WritingView writing={writing} />`. The Phase 2 stub `<p className="stub-body">` paragraph removed in the same commit (CLAUDE.md brownfield delete-and-replace discipline; `grep -c stub-body 'app/(terminal)/writing/page.tsx'` returns 0).
- Static `metadata: Metadata` enriched with `description: route.description` (sourced from `ROUTES[4]`) and `alternates: { canonical: route.pathname }` (= `/writing`). The LOCKED Phase 2 title `"writing/ — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec passes 3 assertions: (1) WritingPage renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `ls writing/ && cat *.md` prompt text.
- SEO-05 enforced: every external link in `writing-view.tsx` flows through `<ExternalLink>` (which bakes `target="_blank" rel="noopener noreferrer"`); zero raw `target="_blank"` in the view file (T-03-26 / T-03-27 mitigation).
- All gates green: `npm test` 48/48 passing across 12 files, `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with all 12 pages prerendered as static (`/writing` shows `5m` revalidate per ISR), postbuild INFRA-05 placeholder check clean.

## Task Commits

Each task was committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create WritingView RSC component** — `5407a92` (feat)
2. **Task 2: Rewrite writing page wrapper to async RSC + add smoke test** — `9ce8df5` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/writing-view.tsx` (created, +51) — RSC view; reads `Writing[]` prop; empty branch returns `<div className="content-block"><div className="empty-state">// no posts yet — follow github.com/beckinfonet for code-as-content.</div></div>`; populated branch sorts via `Date.parse + every(!Number.isNaN)` short-circuit (preserves array order on NaN), then maps each post to a `<li>` containing `<ExternalLink href={w.link} className="writing-post" aria-label={`Read ${w.title} (opens in new tab)`}>` wrapping `.writing-post-meta` (uppercased date · readTime), `.writing-post-title` (`› {title}`), and `.writing-post-excerpt` rows.
- `app/(terminal)/writing/page.tsx` (modified, +12 / -4) — Phase 2 stub replaced with async RSC; imports `getWriting`, `WritingView`, `ROUTES`, `PromptLine`; static metadata gains `description` + `alternates`; body composes the prompt-line + view; orphan `<p className="stub-body">` removed.
- `app/(terminal)/writing/page.test.tsx` (created, +24) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); defensively mocks `next/navigation` (`useSelectedLayoutSegment` returns `"writing"`); awaits `WritingPage()` and renders the result.

## Decisions Made

- **Empty-state line is plain text — `github.com/beckinfonet` is NOT a link.** Per UI-SPEC §V5 + CONTEXT D-03/D-04: the directive reads as a brand-voice comment, not a CTA. Wrapping `github.com/beckinfonet` in `<a>` would change the recruiter read from "directive in voice" to "click here to follow". The line is also not wrapped in `<ExternalLink>` for the same reason.
- **Defensive sort uses `every(!Number.isNaN)` short-circuit BEFORE sorting** (not a try/catch around the comparator). Cheaper (single O(n) validation pass, then either O(n log n) sort or the unmodified array) and avoids partial-sort artifacts where some posts get reordered while others don't. Mitigates T-03-28 (Date.parse on adversarial strings).
- **React key prefers `w.slug || w.title` (not array index).** `Writing.slug` is typed `string` but may be empty in v1 per the type docstring (Phase 6 populates for `/writing/[slug]` deferred to v2). Title is also typed `string` and unique within a sane WRITING array. Avoids index-key anti-pattern across reorderings.
- **`metadata.title` built via template literal off `ROUTES[4].label`.** Preserves the LOCKED Phase 2 D-12 string AND single-sources the file label — any future relabel cascades automatically. The smoke test's `expect(metadata.title).toBe("writing/ — Bakytbek Tatibekov")` confirms runtime evaluation matches the locked string.

## Deviations from Plan

None — both tasks executed exactly as written in `03-09-PLAN.md`. No Rule 1/2/3 auto-fixes triggered; the plan was fully prescriptive (Plans 03-01, 03-04, 03-05, 03-13 had pre-shipped every primitive, CSS class, build-gate, and template the slice needed). Plan 03-04's CSS append confirmed at `app/globals.css` lines 827 (`.empty-state`) and 1068–1107 (`.writing-list`, `.writing-post`, `.writing-post:hover`, `.writing-post-meta`, `.writing-post-title`, `.writing-post-excerpt`).

## Issues Encountered

**Worktree base-mismatch on startup (recovered cleanly).**

The worktree HEAD was at `41b62b3` (pre-Phase-3 state) when execution began; expected base is `379eddbf`. The merge-base self-equaled HEAD, indicating divergent history. Resolved per the `<worktree_branch_check>` protocol: `git reset --hard 379eddbfac7721c325adad81f9573de70e34526e` brought the worktree onto the correct base before any file work began. No commits were lost (the prior `41b62b3` commit is unrelated to this plan). All subsequent work landed cleanly on the corrected base.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives + already-empty WRITING seed array. No environment variables, no external services, no manual config. WRITING swap to real posts is a Phase 6 / CONTENT-04 deliverable that requires no view edits.

## Next Phase Readiness

- **Plan 03-12 (cross-view metadata + title-uniqueness test) ready to consume this plan's metadata.** Title `"writing/ — Bakytbek Tatibekov"` and canonical `"/writing"` are exported from `app/(terminal)/writing/page.tsx` and ready to participate in the cross-view `Set(allTitles).size === 7` assertion.
- **Phase 6 (CONTENT-04) unblocked at the view layer.** Filling `WRITING` in `lib/portfolio-data.ts` requires zero view edits; the populated branch + defensive sort handle arbitrary `Writing[]` shapes the type allows. The empty-state line is the LIVE render today.
- **Phase 5 (SEO-03) extension path clear.** `WRITING` already declares a `slug` field reserved for `/writing/[slug]` dynamic pages (out of v1 scope per CONTEXT deferred-ideas list). When v2 lights up dynamic pages, this plan's view code is forward-compatible (no slug consumption today).
- **Other Wave 4 view plans (03-06/07/08/10/11) unaffected.** Each plan's files are disjoint from this slice; the only shared artifact is the metadata-shape contract (already locked by Plan 03-05). Cross-plan integration happens at Plan 03-12.

## Threat Mitigation Verification

- **T-03-26 (reverse tabnabbing on writing post links):** mitigated. `grep -c 'target="_blank"' app/components/views/writing-view.tsx` returns `0`; every post link renders `<ExternalLink>` which bakes `target="_blank" rel="noopener noreferrer"` (confirmed at `app/components/primitives/external-link.tsx` line 27).
- **T-03-27 (referrer leak to blog hosts):** mitigated. `noreferrer` is baked into `<ExternalLink>` — same source as T-03-26 mitigation.
- **T-03-28 (Date.parse on huge / weird strings):** accepted per plan + reinforced via `every(!Number.isNaN)` short-circuit. The validation pass is single O(n); if any value fails to parse, the array is returned untouched (no sort, no throw, no partial mutation). v1 caps n at ~50 (currently 0 per CONTENT-04). Phase 6 / BACKEND-04 will add zod schema validation at the api boundary as a defense-in-depth layer.

## Self-Check: PASSED

- `app/components/views/writing-view.tsx` — FOUND
- `app/(terminal)/writing/page.tsx` — FOUND (modified)
- `app/(terminal)/writing/page.test.tsx` — FOUND
- Commit `5407a92` (`feat(03-09): add WritingView RSC component`) — FOUND in `git log`
- Commit `9ce8df5` (`feat(03-09): rewrite writing page wrapper to async RSC + smoke spec`) — FOUND in `git log`

---
*Phase: 03-views*
*Completed: 2026-05-07*
