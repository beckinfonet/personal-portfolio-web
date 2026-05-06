---
phase: 03-views
plan: 01
subsystem: ui
tags: [primitives, rsc, react-19, next-15, seo-05, accessibility]

# Dependency graph
requires:
  - phase: 02-shell
    provides: app/components/primitives/prompt-line.tsx (file-shape analog — header comment + interface-above-component + named export pattern that this plan mirrors verbatim)
provides:
  - "ExternalLink RSC primitive (SEO-05 enforcement: static target=_blank + rel=noopener noreferrer)"
  - "TechChip RSC primitive (<span class=\"tech-chip\">{children}</span>)"
  - "Kbd RSC primitive (<kbd class=\"kbd\">{children}</kbd>)"
affects: [03-02 view-css, 03-04 globals.css append, 03-05 through 03-11 view slices, 03-12 cross-view validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC primitive file shape: top-of-file `// NO \"use client\" — RSC-friendly primitive` header comment, interface declared above the component (named `<Component>Props`), named function declaration with named export, props destructured in signature"
    - "External link discipline: every external <a> in views must flow through <ExternalLink>; no raw target=_blank outside this primitive (grep-enforceable in Wave 4)"
    - "JSDoc on opt-in props (showGlyph) carries decision rationale (D-11) inline in source so future authors don't re-debate"

key-files:
  created:
    - app/components/primitives/external-link.tsx
    - app/components/primitives/tech-chip.tsx
    - app/components/primitives/kbd.tsx
  modified: []

key-decisions:
  - "ExternalLink baked target=_blank + rel=noopener noreferrer with NO opt-out (T-03-01, T-03-02 mitigations) — `rel` is not a forwardable prop"
  - "showGlyph opt-out (D-11) chosen over auto-detect to keep SEO-05 grep enforcement uniform across the codebase"
  - "Trailing ↗ glyph rendered via `<span aria-hidden=\"true\"> ↗</span>` — leading space is part of text content (per D-09)"
  - "Plan-level `grep -c '\"use client\"' = 0` acceptance criterion is satisfied semantically (no top-of-file directive); literally returns 1 because the RSC-discipline header comment contains the substring `\"use client\"` — same as the analog prompt-line.tsx"

patterns-established:
  - "Phase 3 primitives are zero-dependency RSC files (.tsx with no `\"use client\"` directive) under app/components/primitives/"
  - "JSDoc decision-anchors: when a prop encodes a locked decision (e.g. showGlyph defaulting to true per D-08/D-11), the JSDoc cites the decision ID and the opt-out rationale inline"
  - "CSS classes for primitives are appended in Plan 03-04; primitive files include a header comment naming the class(es) they consume so readers can locate the styles"

requirements-completed: [VIEW-08, SEO-05]

# Metrics
duration: ~3 min
completed: 2026-05-06
---

# Phase 03 Plan 01: View Primitives (ExternalLink, TechChip, Kbd) Summary

**Three zero-dependency RSC primitives shipped: ExternalLink (SEO-05 enforcement with static target=_blank + rel=noopener noreferrer + opt-out ↗ glyph), TechChip (.tech-chip span wrapper), and Kbd (.kbd kbd-element wrapper) — unblocking parallel view development in Wave 4.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-06T19:47Z (approx; first file write timestamp)
- **Completed:** 2026-05-06T19:50:20Z
- **Tasks:** 2
- **Files modified:** 3 (all created)

## Accomplishments
- ExternalLink RSC primitive establishes SEO-05 compliance baseline — static `target="_blank"` and `rel="noopener noreferrer"` are baked into the JSX (not props), so views cannot opt out of reverse-tabnabbing/referrer-leak mitigations (T-03-01, T-03-02)
- TechChip and Kbd primitives exist as the canonical spans/kbd wrappers so view code never reaches for raw `<span class="...">` markup, satisfying VIEW-08
- All three primitives are RSC (no `"use client"` directive), enabling them to be imported from the persistent shell at `app/(terminal)/layout.tsx` without forcing client boundaries
- File shape verbatim mirrors the existing `app/components/primitives/prompt-line.tsx` analog (header comment + interface-above-component + named function export), maintaining one-pattern discipline across the primitives layer
- Wave 4 view-slice plans (03-05 through 03-11) can now author rows-as-links, store badges, tech chips, and keyboard hints by importing these three components

## Task Commits

Each task was committed atomically (with `--no-verify` per parallel-executor protocol):

1. **Task 1: Create ExternalLink RSC primitive (SEO-05)** — `ad12261` (feat)
2. **Task 2: Create TechChip + Kbd RSC primitives** — `8e15da5` (feat)

## Files Created/Modified
- `app/components/primitives/external-link.tsx` (36 lines) — ExternalLink RSC primitive; static target=_blank + rel=noopener noreferrer; props: `href`, `className?`, `children`, `showGlyph?` (default true), `aria-label?`. Renders trailing aria-hidden ↗ glyph when showGlyph is true.
- `app/components/primitives/tech-chip.tsx` (12 lines) — TechChip RSC primitive; renders `<span className="tech-chip">{children}</span>`. Props: `children: ReactNode`.
- `app/components/primitives/kbd.tsx` (14 lines) — Kbd RSC primitive; renders `<kbd className="kbd">{children}</kbd>`. Props: `children: ReactNode`. Header comment notes that existing Phase 2 scoped rules (`.breadcrumb-hint kbd`, `.palette-footer kbd`) continue to apply because the underlying element is `<kbd>`.

## Verification Commands Run
- `npm run typecheck` (after each task) — exit 0
- `npm run lint` (after Task 2) — exit 0
- `grep -E '^"use client"' app/components/primitives/{external-link,tech-chip,kbd}.tsx` — no matches (no top-of-file directive on any of the three new primitives)
- `grep -q 'rel="noopener noreferrer"' app/components/primitives/external-link.tsx` — match
- `grep -q 'target="_blank"' app/components/primitives/external-link.tsx` — match
- `grep -q 'aria-hidden="true"' app/components/primitives/external-link.tsx` — match
- `grep -q 'export function ExternalLink' app/components/primitives/external-link.tsx` — match
- `grep -q '<span className="tech-chip">' app/components/primitives/tech-chip.tsx` — match
- `grep -q '<kbd className="kbd">' app/components/primitives/kbd.tsx` — match
- `grep -q 'export function TechChip' app/components/primitives/tech-chip.tsx` — match
- `grep -q 'export function Kbd' app/components/primitives/kbd.tsx` — match
- `grep -rE 'target="_blank"' app/components/primitives/` — only `external-link.tsx` (SEO-05 enforcement primitive owns the only target=_blank in the primitives layer)

## Decisions Made
- Followed plan as specified — no deviations from the locked decisions D-08/D-09/D-10/D-11 in 03-CONTEXT.md.
- Documented (in frontmatter `key-decisions`) the literal-vs-semantic interpretation of the RSC-discipline grep: the file-level `// NO "use client"` header comment that the canonical analog (`prompt-line.tsx`) prescribes literally contains the substring `"use client"`, so a naïve `grep -c '"use client"'` returns 1, not 0. The intent of the acceptance criterion is "no top-of-file `"use client"` directive" — verified via `grep -E '^"use client"'` which returns no matches on all three new files. Same behavior applies to `prompt-line.tsx` and is therefore consistent with project pattern, not a deviation.

## Deviations from Plan

None — plan executed exactly as written. The three primitives' source matches the plan's prescribed `<action>` blocks character-for-character (modulo trailing newline). No auto-fixes (Rule 1/2/3) triggered. No architectural questions (Rule 4) raised.

## Issues Encountered
- The literal `grep -c '"use client"' = 0` acceptance check returns 1 because the RSC-discipline header comment contains the literal substring `"use client"` (a quirk inherited from the established `prompt-line.tsx` pattern). Resolved by interpreting the criterion semantically — what matters is that no top-of-file `"use client"` *directive* exists. Verified via `grep -E '^"use client"'` (no matches) on all three files. Plan 03 reviewers may want to update the literal grep in future plans to anchor with `^` for clarity.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- **Wave 1 unblocks:** Plan 03-04 (globals.css append) can now reference `.tech-chip` and `.kbd` selectors knowing their consuming primitives exist; Plan 03-02 (view-css scaffolding) can begin in parallel.
- **Wave 4 unblocks (after 03-04 ships CSS):** All view-slice plans (03-05 contact, 03-06 projects, 03-07 writing, 03-08 store, 03-09 about, 03-10 dashboard, 03-11 home) can author their JSX importing these three primitives. SEO-05 grep enforcement (`grep -rE 'target="_blank"' app/(terminal)/` should match nothing — only `external-link.tsx` is allowed to emit the attribute) becomes operative.
- **No blockers introduced.**

## Self-Check: PASSED

- `app/components/primitives/external-link.tsx` — FOUND (36 lines, exports `ExternalLink`)
- `app/components/primitives/tech-chip.tsx` — FOUND (12 lines, exports `TechChip`)
- `app/components/primitives/kbd.tsx` — FOUND (14 lines, exports `Kbd`)
- Commit `ad12261` (Task 1) — FOUND in `git log`
- Commit `8e15da5` (Task 2) — FOUND in `git log`
- All three new primitive files: no `^"use client"` directive (verified via anchored regex)
- `npm run typecheck` exit 0, `npm run lint` exit 0

---
*Phase: 03-views*
*Plan: 01*
*Completed: 2026-05-06*
