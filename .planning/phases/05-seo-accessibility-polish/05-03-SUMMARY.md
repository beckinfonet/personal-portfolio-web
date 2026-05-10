---
phase: 05-seo-accessibility-polish
plan: 03
subsystem: seo + a11y
tags: [seo, twitter-card, viewport, theme-color, reduced-motion, metadata, css, a11y]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-01 Wave 0 — app/layout.test.tsx scaffold with next/font/google mock; scripts/check-reduced-motion.mjs scaffold (fail-loud until this plan ships)"
  - phase: 02-shell
    provides: "app/layout.tsx with Metadata import + openGraph block; app/globals.css with --bg tokens + existing @media (prefers-reduced-motion: reduce) block at line 152"
provides:
  - "metadata.twitter on root: card 'summary_large_image', title + description matching root copy verbatim (SEO-01)"
  - "Separate viewport export with per-scheme themeColor — dark #0a0c0b + light #f4f2ea (SEO-04, D-15 corrected per Pitfall 3 to live in viewport NOT metadata)"
  - "Universal-selector reduced-motion reset *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important } appended INSIDE existing @media block — not a new block (A11Y-03, D-16, T-05-12 mitigation)"
  - "All 8 layout.test.tsx assertions green (4 metadata.twitter + 1 metadata.themeColor=undefined invariant + 3 viewport.themeColor)"
  - "scripts/check-reduced-motion.mjs flips from FAIL to PASS (Wave 0 fail-loud contract holds — 2nd of 3 smoke scripts to flip)"
affects: [05-05, 05-08]

# Tech tracking
tech-stack:
  added:
    - "next.Viewport TypeScript type (joins Metadata in app/layout.tsx import)"
  patterns:
    - "Pattern: Separate viewport export for theme-color (Next.js 14+ correct location). metadata.themeColor is the deprecated location and would log a build warning; this plan's threat model T-05-10 catches that with a vitest assertion plus a build-log scan."
    - "Pattern: Per-scheme theme-color array — { media: '(prefers-color-scheme: dark|light)', color: '#hex' } emits both <meta name=\"theme-color\" media=\"...\"> tags from a single export."
    - "Pattern: Reduced-motion belt-and-suspenders — universal selector reset at the top of the @media block, existing targeted rules below for documenting historical intent. Single @media block, no duplicates (T-05-12 mitigation)."
    - "Pattern: 0.01ms timings (NOT 0ms) — Pitfall 7. Some browsers treat 0 as falsy and drop the rule entirely; 0.01ms is effectively-instant but the rule applies."
    - "Pattern: Inline hex literals in viewport.themeColor (NOT var(--bg)) — Next.js metadata composition rejects CSS variables. Hex pulled verbatim from app/globals.css --bg tokens (dark line 12, light line 53)."

key-files:
  created: []
  modified:
    - "app/layout.tsx (+19 lines — Viewport type import, twitter metadata block, separate viewport export)"
    - "app/layout.test.tsx (-6 +51 lines — replace Wave 0 sentinel with 8 real assertions)"
    - "app/globals.css (+10 lines inside existing @media block — universal selector reset + comment)"

key-decisions:
  - "Reworded the viewport-export comment to avoid the literal string 'metadata.themeColor' — the plan's example block included 'metadata.themeColor is DEPRECATED' as a comment, but the acceptance criteria require BOTH `! grep -q 'metadata.themeColor' app/layout.tsx` AND `grep -c 'themeColor' app/layout.tsx == 1`. The original comment matched both forbidden checks. Reworded to 'The theme-color field is DEPRECATED on the metadata export in Next.js 14+; the correct location is here on viewport.' Intent identical (callout that this is the correct location, NOT metadata). Logged as Rule 3 self-correction."
  - "Disregarded the verify automated regex `! grep -q 'themeColor:.*\\['` — this regex forbids `themeColor: [` syntax, but that's exactly the required form for the viewport.themeColor array literal (the plan's own example uses it). Internal contradiction in the plan's verify block — likely an earlier draft pattern not updated when the example settled. Deferred to the explicit acceptance criteria (which are unambiguous: themeColor count == 1, no metadata.themeColor) and the threat model T-05-10 mitigation (which names the real concern: deprecated location). Build log and TypeScript check confirm correctness."
  - "Single @media (prefers-reduced-motion: reduce) block in globals.css — appended INSIDE the existing block (line 152), NOT a new block. Multiple matching media queries would produce duplicate rules and unpredictable cascade order (T-05-12)."

patterns-established:
  - "Pattern: Wave 0 fail-loud → Wave 1+ flips green — scripts/check-reduced-motion.mjs is the 2nd of 3 fail-loud smoke scripts to flip green this phase (after scripts/check-og-files.mjs in Plan 05-02). Plan 05-05 will flip scripts/check-head-comment.mjs."
  - "Pattern: TDD with metadata exports — vitest can import { metadata, viewport } from a Next.js layout file thanks to the next/font/google mock seeded in Plan 05-01's vitest.setup.ts. RED commit (test) → GREEN commit (feat) gate sequence enforced; refactor not needed for this plan."

requirements-completed: [SEO-01, SEO-04, A11Y-03]

# Metrics
duration: 3m 12s
completed: 2026-05-10
---

# Phase 5 Plan 03: Wave 1 Branch B — Twitter Card + Viewport.themeColor + Reduced-Motion Reset Summary

**Twitter card metadata on root + separate viewport export with per-scheme theme-color (corrects deprecated location per Pitfall 3) + universal-selector reduced-motion reset appended to existing @media block — three surgical edits to root files; 0 new files, 3 files modified, ~80 line-changes net (29 production + 51 test).**

## Performance

- **Duration:** ~3m 12s
- **Started:** 2026-05-10T16:14:02Z
- **Completed:** 2026-05-10T16:17:14Z
- **Tasks:** 2 (Task 1 TDD; Task 2 autonomous)
- **Files created:** 0
- **Files modified:** 3 (app/layout.tsx, app/layout.test.tsx, app/globals.css)

## Accomplishments

- Twitter card on root metadata — `card: "summary_large_image"`, title + description matching the existing openGraph block byte-identically (SEO-01 / D-06).
- Separate `viewport` export with `themeColor` array — dark `#0a0c0b` + light `#f4f2ea`, hex inlined verbatim from app/globals.css `--bg` tokens (SEO-04 / D-15).
- Universal-selector reduced-motion reset appended INSIDE the existing `@media (prefers-reduced-motion: reduce)` block at globals.css line 152 — `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }` — followed by the existing 6 targeted rules (D-17, all preserved). Single `@media` block; no duplicates (T-05-12 mitigation).
- 8 layout.test.tsx assertions all pass: 4 metadata.twitter coverage, 1 metadata.themeColor must-be-undefined invariant, 3 viewport.themeColor per-scheme assertions. RED → GREEN TDD gate sequence enforced.
- `npm run build` exits 0 with NO `themeColor in metadata is deprecated` warning in the log (Pitfall 3 / T-05-10 verification).
- `node scripts/check-reduced-motion.mjs` flips from FAIL (intentional fail-loud since Plan 05-01) to PASS — Wave 0 contract holds.
- Vitest now at 26 files / 108 tests green (was 26/101 — added 7 new layout assertions; the original Wave 0 sentinel was replaced).
- TypeScript clean (`npx tsc --noEmit` exits 0); `npm run check:mobile` clean (3 audit scripts unaffected).

## Task Commits

Each task was committed atomically; Task 1 followed the TDD RED → GREEN sequence:

1. **Task 1 RED: failing layout.test.tsx assertions** — `e9efd82` (test)
2. **Task 1 GREEN: Twitter card + viewport.themeColor in app/layout.tsx** — `3d7e0ea` (feat)
3. **Task 2: universal-selector reduced-motion reset in app/globals.css** — `0b559d3` (feat)

## Files Created/Modified

**Created:** None.

**Modified:**

- `app/layout.tsx` — extended `import type { Metadata }` to `import type { Metadata, Viewport }`; added `twitter: { card, title, description }` to the metadata object after `openGraph`; added a NEW `export const viewport: Viewport = { themeColor: [...] }` after the metadata object closing `};`. Net: +19 lines.
- `app/layout.test.tsx` — replaced the Wave 0 sentinel (1 assertion) with 8 real assertions (4 twitter + 1 metadata.themeColor=undefined + 3 viewport.themeColor). Net: -6 +51 lines.
- `app/globals.css` — appended the universal-selector reset at the TOP of the existing `@media (prefers-reduced-motion: reduce)` block (line 152), with comment explaining D-16 / Pitfall 7 rationale. Existing 6 targeted rules preserved below. Net: +10 lines inside the existing block.

## Decisions Made

- **Reworded the viewport-export comment to avoid `metadata.themeColor` literal.** The plan's example block contained `// metadata.themeColor is DEPRECATED in Next.js 14+; the correct location is here.` — but the same plan's acceptance criteria require BOTH `! grep -q 'metadata.themeColor' app/layout.tsx` AND `grep -c 'themeColor' app/layout.tsx == 1`. Following the example verbatim would have failed both checks. Reworded to "The theme-color field is DEPRECATED on the metadata export in Next.js 14+; the correct location is here on viewport." — same callout, no forbidden substring, themeColor count stays at 1 (the array key).
- **Disregarded the verify automated regex `! grep -q 'themeColor:.*\\['`.** This regex would forbid `themeColor: [` syntax — but that's exactly the required form for the viewport.themeColor array literal (the plan's own action block uses it). Internal contradiction in the verify block; deferred to the explicit acceptance criteria and threat model T-05-10 mitigation (which names the real concern: deprecated location, not array syntax). Build log + TypeScript + 8 vitest assertions confirm correctness.
- **Single `@media (prefers-reduced-motion: reduce)` block.** Appended INSIDE the existing block at line 152, NOT a new block elsewhere. Multiple matching media queries would produce duplicate rules and unpredictable cascade order (T-05-12). Verified: `grep -c '@media (prefers-reduced-motion: reduce)' app/globals.css` returns exactly 1.
- **Universal selector reset at the TOP of the block, existing rules below.** Order matters: the global reset executes first, the existing targeted rules execute afterward. Both end up with `animation: none` semantics, but keeping the original rules below preserves their documenting intent (D-17) and provides a safety net for any future browser quirk that might not honor `0.01ms` timing.
- **0.01ms not 0ms (Pitfall 7).** Hardcoded `0.01ms` for both `animation-duration` and `transition-duration` with `!important`. Some browsers treat `0ms` as falsy and drop the rule entirely; `0.01ms` is effectively-instant but the rule applies. Verified: `! grep -q 'animation-duration: 0ms' app/globals.css` returns 0 (clean).
- **Hex inlined NOT `var(--bg)`.** `viewport.themeColor` colors are literal hex strings (`#0a0c0b`, `#f4f2ea`) pulled verbatim from `app/globals.css` `--bg` tokens at lines 12 + 53. Next.js metadata composition rejects CSS variables — `var(--bg)` would produce malformed `<meta>` output. D-15 explicitly says "concrete hex pulled from app/globals.css --bg tokens (planner reads and inlines verbatim; do NOT re-derive)".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded viewport-export comment to avoid forbidden substring**
- **Found during:** Task 1 GREEN verification (initial grep round failed on `! grep -q 'metadata.themeColor'` because the plan's suggested comment included that exact string).
- **Issue:** The plan's `<action>` block on Task 1 included a comment `// metadata.themeColor is DEPRECATED in Next.js 14+; the correct location is here.` — but the same plan's `<acceptance_criteria>` forbid `metadata.themeColor` substring AND require `grep -c 'themeColor' == 1`. The literal example violated both gates.
- **Fix:** Reworded comment to "The theme-color field is DEPRECATED on the metadata export in Next.js 14+; the correct location is here on viewport." Intent identical, no forbidden substring, themeColor count stays at 1.
- **Files modified:** `app/layout.tsx` (comment text only, before commit `3d7e0ea`)
- **Verification:** `! grep -q 'metadata.themeColor' app/layout.tsx` clean; `grep -c 'themeColor' app/layout.tsx` returns 1.
- **Committed in:** `3d7e0ea` (Task 1 GREEN; the comment edit happened before the commit, no separate revision needed).

---

**Total deviations:** 1 auto-fixed (1 Rule 3 self-correction inside Task 1; the plan's own example contradicted its own acceptance criteria).

**Impact on plan:** None on contract. The wording change preserves the educational intent of the comment while clearing the regex gates the plan demands. Future readers who don't know Next.js metadata vs viewport semantics still get the callout. Same self-correction class as Plan 05-02's `service.worker` regex match in manifest.ts comment.

## Issues Encountered

- **None.** All gates green on the first iteration after the comment-rewording self-correction. Build, vitest, typecheck, smoke scripts, check:mobile, and manual grep audits all pass.

## Threat Flags

None — this plan operates entirely within the threat surface analyzed in 05-03-PLAN.md `<threat_model>`:

- **T-05-10 (Tampering — deprecated metadata.themeColor location):** MITIGATED. `! grep -q 'metadata.themeColor' app/layout.tsx` clean; vitest assertion `expect(metadata.themeColor).toBeUndefined()` green; `npm run build` log scanned for `themeColor in metadata is deprecated` — no match.
- **T-05-11 (Denial of Service — 0ms reduced-motion silent failure):** MITIGATED. `! grep -q 'animation-duration: 0ms' app/globals.css` clean; `! grep -q 'transition-duration: 0ms' app/globals.css` clean; `grep -q 'animation-duration: 0\.01ms !important'` and `grep -q 'transition-duration: 0\.01ms !important'` both green.
- **T-05-12 (Tampering — duplicate @media blocks):** MITIGATED. `grep -c '@media (prefers-reduced-motion: reduce)' app/globals.css` returns exactly 1.

No new public route surface, no new auth paths, no new schema changes. The metadata + viewport + CSS edits are all build-time-emitted static content; no runtime user input flows through them.

## User Setup Required

None — no external service configuration required. The Twitter card image is auto-inherited from the OG cards Plan 05-02 already shipped (Next.js metadata composition handles the image fallback). The theme-color values display when the page loads on mobile browsers (Safari iOS, Chrome Android) without any user action. The reduced-motion reset honors the OS preference automatically (macOS: System Settings → Accessibility → Display → Reduce motion; same toggle exists on iOS, Windows, Android).

Plan 05-08 will run a manual gate to verify reduced-motion at the OS level (macOS toggle ON → reload routes → no animation). That gate is queued; this plan ships the source-level guarantees.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `app/layout.tsx` (modified — twitter + viewport blocks present)
- FOUND: `app/layout.test.tsx` (modified — 8 real assertions)
- FOUND: `app/globals.css` (modified — universal-selector reset inside @media block)

Verified commits exist:

- FOUND: `e9efd82` test(05-03): add failing twitter + viewport.themeColor assertions to layout test
- FOUND: `3d7e0ea` feat(05-03): add Twitter card metadata + separate viewport.themeColor export
- FOUND: `0b559d3` feat(05-03): append universal-selector reduced-motion reset (A11Y-03)

Verified gates:

- `npm test` — 26 files / 108 tests passing (was 26/101 — added 7 new layout assertions)
- `npm run build` — exits 0; build log has NO `themeColor in metadata is deprecated` warning
- `node scripts/check-reduced-motion.mjs` — exits 0 (Wave 0 smoke flips green)
- `grep -c '@media (prefers-reduced-motion: reduce)' app/globals.css` — returns 1
- `grep -c 'themeColor' app/layout.tsx` — returns 1 (only inside the viewport export)
- `npx tsc --noEmit` — exits 0
- `npm run check:mobile` — exits 0 (3 audit scripts: sidebar-redistribution + print-rules + mobile-palette unaffected)

## TDD Gate Compliance

Plan 05-03 Task 1 declared `tdd="true"` and followed the RED → GREEN sequence:

- **RED gate:** commit `e9efd82` (`test(05-03): ...`) added 8 assertions; 7 of 8 failed against unmodified app/layout.tsx (only the metadata.themeColor=undefined invariant passed because the field was already absent).
- **GREEN gate:** commit `3d7e0ea` (`feat(05-03): ...`) added the Viewport import, twitter metadata block, and separate viewport export; all 8 assertions passed.
- **REFACTOR gate:** N/A — no cleanup needed for this small surface.

Gate sequence is intact; no warning needed.

## Next Phase Readiness

Wave 1 Branch B complete. Plan 05-04 (Wave 2 — about-socials carry-forward inline contact card on /about) is the next sequential task. Its dependencies (existing Phase 3 ExternalLink primitive + contact-view CSS classes) are unaffected by this plan; about-view.tsx is the only new file Plan 05-04 touches in `app/components/views/`, separate from this plan's lane (app/layout.tsx + app/globals.css + app/layout.test.tsx).

Plan 05-05 (Wave 2 — JSON-LD Person + HeadComment + mount in app/layout.tsx `<head>`) inherits a clean app/layout.tsx — only the metadata + viewport exports are new; the layout's `<head>` is untouched and ready for `<JsonLdPerson />` + `<HeadComment />` mounts as siblings to `<AccentBootstrapScript />`. The next/font/google mock from Plan 05-01's vitest.setup.ts means Plan 05-05's layout-level tests will work without additional infrastructure.

No blockers for Wave 2.

---
*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
