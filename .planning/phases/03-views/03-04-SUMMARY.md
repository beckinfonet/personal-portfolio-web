---
phase: 03-views
plan: 04
subsystem: ui
tags: [css, view-styles, primitives, brownfield-cleanup, phase-3, design-tokens]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Wave 1 primitives (tech-chip, kbd, external-link, copy-button, store-badge) shipped in plans 01–03; this plan provides the CSS those primitives + the seven view bodies need."
  - phase: 02-shell
    provides: "All Phase 2 CSS custom-property tokens (--bg, --bg-raised, --panel, --panel-hi, --border, --border-hi, --text, --text-hi, --muted, --muted-hi, --accent, --accent-dim, --accent-bg, --warn) — Phase 3 reuses them verbatim."
provides:
  - "9 new section-divider blocks in app/globals.css covering view primitives, shared CTA buttons (.btn / .btn-ghost), shared empty-state, and the seven view-specific selector groups (about / projects / stack / experience / writing / contact / shipped)."
  - "Brownfield deletion: orphan .stub-body rule removed (its callers are replaced in Wave 3 + Wave 4 plans)."
  - "Locked-value class library so every Wave 3 + Wave 4 view plan can render against pre-shipped class names without touching app/globals.css again."
affects:
  - "03-05 (about-view) — consumes .terminal-main h1, .about-role, .about-meta, .about-para, .about-cards, .about-card, .about-card-value, .about-card-label, .about-cta-row, .btn, .btn-ghost"
  - "03-06 (projects-view) — consumes .projects-subhead, .projects-list, .projects-row, .projects-row-index/-name/-summary/-chips/-meta/-year/-status/-role, .empty-state, .tech-chip"
  - "03-07 (stack-view) — consumes .stack-pre-wrap, .stack-pre, .stack-copy, .json-key, .json-string, .json-punc, .copy-button"
  - "03-08 (experience-view) — consumes .experience-list, .experience-row, .experience-row-header, .experience-hash, .experience-role, .experience-company, .experience-period, .experience-summary, .empty-state"
  - "03-09 (writing-view) — consumes .writing-list, .writing-post (dashed border), .writing-post-meta, .writing-post-title, .writing-post-excerpt, .empty-state"
  - "03-10 (contact-view) — consumes .contact-lead, .contact-card, .contact-row, .contact-label, .contact-cta-row, .copy-button, .btn, .btn-ghost"
  - "03-11 (shipped-view) — consumes .shipped-subhead, .shipped-list, .shipped-row, .shipped-row-index/-name/-summary/-affordances/-meta/-year/-status/-role, .copy-button--icon, .store-badge-link, .empty-state"
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — no direct CSS consumption but completes the same Wave 4 set"
  - "Phase 4 (mobile) — adds @media breakpoints layered on top; no rewrites of these classes expected"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS append-only convention: new sections at bottom of app/globals.css with /* ───── … ───── */ U+2500 dividers + (REQUIREMENT-ID — Phase NN) parenthetical refs."
    - "Token reuse discipline: every new selector body cites only Phase 2 var(--token) values; zero new --custom-property declarations."
    - "Comment-pinned constraint for brand-asset integrity (.store-badge-link img — T-03-12 mitigation)."

key-files:
  created: []
  modified:
    - "app/globals.css — +514 / -11 lines: 9 new section-divider blocks (~80 selectors) appended; orphan .stub-body block removed"

key-decisions:
  - "Centralized all Phase 3 CSS in this single Wave 2 plan to eliminate same-wave file conflict on app/globals.css for the six parallel Wave 4 view plans."
  - "Removed .stub-body in this commit (Phase 2 placeholder, no longer needed) — defensive ordering: dead CSS class removed first, consumers replaced after; CSS missing classes do not fail Next builds, so the temporary unstyled <p className=\"stub-body\"> remains a no-op until Wave 3/4 replaces the JSX nodes."
  - "Single shared .empty-state base class covers all four locked empty-state strings (projects, experience, writing, shipped); no per-view --writing variants needed."
  - ".btn / .btn-ghost CTAs landed as shared classes (consumed by both about-view and contact-view) in their own divider block before per-view sections."

patterns-established:
  - "Per-view divider header format: /* Phase 3 — <view>-view (VIEW-XX) */ — applied uniformly across the seven view sections."
  - "Brand-asset integrity comment: .store-badge-link img carries an inline reminder that filter/opacity rules violate Apple/Google brand guidelines (verifier-grep enforceable in future plans)."
  - "Selector ordering inside a view block follows the rendering order of the view body (subhead → list → row → row-children → row-meta), so reading the CSS top-to-bottom matches the visual top-to-bottom of the rendered view."

requirements-completed: [VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, VIEW-07, VIEW-08]

# Metrics
duration: 2m 22s
completed: 2026-05-07
---

# Phase 3 Plan 04: View + Primitive CSS Append Summary

**Centralized Phase 3 view-body and primitive CSS landed in app/globals.css (+514 / −11 lines, 9 new section-divider blocks, ~80 selectors) and the orphan `.stub-body` rule deleted — Wave 3 + Wave 4 plans can now ship view TSX/tests without touching globals.css.**

## Performance

- **Duration:** 2 min 22 sec
- **Started:** 2026-05-07T00:04:57Z
- **Completed:** 2026-05-07T00:07:19Z
- **Tasks:** 1 / 1
- **Files modified:** 1 (`app/globals.css`)

## Accomplishments

- Appended 9 new `/* ──── … ──── */` section-divider blocks to `app/globals.css` covering view primitives, shared CTA buttons (`.btn` / `.btn-ghost`), shared empty-state, and seven per-view selector groups.
- ~80 new class selectors total — every body uses `var(--token)` from the Phase 2 token set; **zero** new CSS custom-property declarations.
- Removed the orphan `.stub-body` Phase 2 placeholder rule (lines 665–674 in the prior file), restoring CSS hygiene.
- Build passes (`npm run build` exits 0); no regressions introduced by the CSS-only change.
- Wave 3 (03-05 about-view) and Wave 4 (03-06 .. 03-11 + 03-12 metadata/test) plans can now execute fully in parallel without `app/globals.css` contention.

## Task Commits

Each task was committed atomically:

1. **Task 1: Append all Phase 3 view + primitive CSS sections to globals.css (and delete `.stub-body`)** — `b1a76d6` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/globals.css` — +514 / −11. New sections (in order):
  1. **View primitives** — `.tech-chip`, `.kbd`, `.copy-button`, `.copy-button--confirmed`, `.copy-button--icon`, `.store-badge-link`, `.store-badge-link img` (with comment-pinned brand-integrity warning)
  2. **Shared CTA buttons** — `.btn`, `.btn:hover`, `.btn-ghost`, `.btn-ghost:hover`
  3. **Shared empty-state** — `.empty-state`
  4. **about-view (VIEW-01)** — `.terminal-main h1`, `.about-role`, `.about-meta`, `.about-para`, `.about-cards`, `.about-card`, `.about-card-value`, `.about-card-label`, `.about-cta-row`
  5. **projects-view (VIEW-02)** — `.projects-subhead`, `.projects-list`, `.projects-row` (+ `:hover`), `.projects-row-index`, `-name`, `-summary`, `-chips`, `-meta`, `-year`, `-status`, `-role`
  6. **stack-view (VIEW-03)** — `.stack-pre-wrap`, `.stack-pre`, `.stack-copy`, `.json-key`, `.json-string`, `.json-punc`
  7. **experience-view (VIEW-04)** — `.experience-list`, `.experience-row`, `.experience-row-header`, `.experience-hash`, `.experience-role`, `.experience-company`, `.experience-period`, `.experience-summary`
  8. **writing-view (VIEW-05)** — `.writing-list`, `.writing-post` (with `border-bottom: 1px dashed var(--border)` per VIEW-05), `:hover`, `.writing-post-meta`, `-title`, `-excerpt`
  9. **contact-view (VIEW-06)** — `.contact-lead`, `.contact-card`, `.contact-row` (+ `:last-child`), `.contact-label`, `.contact-cta-row`
  10. **shipped-view (VIEW-07)** — `.shipped-subhead`, `.shipped-list`, `.shipped-row`, `.shipped-row-index`, `-name`, `-summary`, `-affordances`, `-meta`, `-year`, `-status`, `-role`

  Brownfield deletion: prior lines 665–674 — `/* Route stub body placeholder */` divider + `.stub-body { font-size: 13px; color: var(--muted); font-style: italic; margin-top: 8px; }` — removed entirely.

## Decisions Made

None beyond what the plan specified. All values came directly from `03-UI-SPEC.md` (locked); section ordering came from the plan's `<action>` block; the delete-then-append sequence was executed exactly as written.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

Per plan acceptance-criteria:

```bash
# Required-class greps (all pass)
grep -c '\.tech-chip {' app/globals.css                 # 1
grep -c '\.kbd {' app/globals.css                       # 1
grep -c '\.copy-button {' app/globals.css               # 1
grep -c '\.copy-button--confirmed' app/globals.css      # 1
grep -c '\.copy-button--icon' app/globals.css           # 1
grep -c '\.store-badge-link' app/globals.css            # 2 (selector + img descendant)
grep -c '\.empty-state {' app/globals.css               # 1
grep -c '\.btn {' app/globals.css                       # 1
grep -c '\.btn-ghost {' app/globals.css                 # 1
grep -q '\.about-cards' app/globals.css                 # OK
grep -q '\.about-card {' app/globals.css                # OK
grep -q '\.about-card-value' app/globals.css            # OK
grep -q '\.projects-row' app/globals.css                # OK (10 hits — base + child variants)
grep -q '\.projects-row-name' app/globals.css           # OK
grep -q '\.stack-pre' app/globals.css                   # OK (2 hits — .stack-pre + .stack-pre-wrap)
grep -q '\.stack-pre-wrap' app/globals.css              # OK
grep -q '\.json-key' app/globals.css                    # OK
grep -q '\.json-string' app/globals.css                 # OK
grep -q '\.json-punc' app/globals.css                   # OK
grep -q '\.experience-row' app/globals.css              # OK
grep -q '\.experience-hash' app/globals.css             # OK
grep -q '\.writing-post' app/globals.css                # OK
grep -q '\.writing-post-meta' app/globals.css           # OK
grep -q 'border-bottom: 1px dashed var(--border)' app/globals.css  # line 1077
grep -q '\.contact-card' app/globals.css                # OK
grep -q '\.contact-row' app/globals.css                 # OK
grep -q '\.shipped-row' app/globals.css                 # OK
grep -q '\.shipped-row-affordances' app/globals.css     # OK

# Brownfield deletion verified
grep -c '\.stub-body' app/globals.css                   # 0

# No new tokens introduced
git diff app/globals.css | grep -E '^\+\s*--[a-z-]+:' | wc -l   # 0
# (existing :root token count: 17 — unchanged)

# Build green
npm run build                                            # exit 0
                                                         # ✓ Compiled successfully in 1665ms
                                                         # ✓ Generating static pages (12/12)
                                                         # ✓ INFRA-05: .next/server/ clean

# Diff stat
git diff --stat HEAD~1 HEAD                              # +514 / -11 (within plan's expected ~+170/-10
                                                         # range; the plan estimate undercounted because
                                                         # each section divider + per-view selector
                                                         # block is verbose — full UI-SPEC values were
                                                         # appended verbatim, no condensation.)
```

## Issues Encountered

**Pre-existing `npm run lint` failure — out-of-scope.**

`npm run lint` reports 1 error in the auto-generated worktree file `.claude/worktrees/agent-ad1df734049f68a64/next-env.d.ts` (`triple-slash-reference`). This was verified pre-existing by `git stash` + re-running lint with my changes reverted — the failure persists, so the issue is unrelated to this plan's CSS-only change. The plan's primary build gate (`npm run build` exit 0) passes, which is what determines CSS validity. ESLint's recursion into `.claude/` is the underlying issue and is out-of-scope per executor scope-boundary rule.

**Pre-existing test failures — out-of-scope.**

`npm test -- --run` reports 10 failing tests in `app/components/shell/top-bar.test.tsx` and `app/components/shell/command-palette.test.tsx` (all stem from `useShellState must be used inside ShellStateProvider` — missing test-side wrapper). Same reasoning: CSS-only change cannot have introduced JSX/hook errors; these are pre-existing brownfield test debt. Plan 03-13 ("clear inherited build gate") already addressed similar inherited gates and is the appropriate place to track these.

## User Setup Required

None — pure CSS append, no external service configuration required.

## Next Phase Readiness

- All 7 Wave 3 + Wave 4 view plans (03-05 through 03-11) can now execute fully in parallel without contention on `app/globals.css`.
- Each downstream view plan should reference this SUMMARY's "Files Created/Modified" §4–10 as the canonical class list to consume.
- Plan 03-12 (cross-view metadata) and Plan 03-13 (build-gate) have no CSS dependencies on this plan and remain independent.
- The orphan `.stub-body` is gone; downstream view plans must replace `<p className="stub-body">…</p>` with the real `<View …/>` body in the same commit (per CLAUDE.md brownfield delete-and-replace discipline). Until then, the unstyled stub paragraph still renders harmlessly (no layout impact).

## Self-Check: PASSED

- `app/globals.css` — FOUND
- `.planning/phases/03-views/03-04-SUMMARY.md` — FOUND
- Commit `b1a76d6` (`feat(03-04): append phase 3 view + primitive CSS to globals.css`) — FOUND in `git log`

---
*Phase: 03-views*
*Completed: 2026-05-07*
