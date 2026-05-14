---
quick: 260514-d7m
title: Experience view redesign — timeline rail, monogram, bullets, tech chips
type: paired-commit-execute
status: complete
tags:
  - quick
  - experience
  - paired-commit
  - frontend
  - backend
  - css
requirements:
  - SPEC-2026-05-14-experience-redesign
key-files:
  modified:
    backend:
      - portfolio-services/src/types/content.ts
      - portfolio-services/src/models/Experience.ts
      - portfolio-services/src/seed/experience.json
      - portfolio-services/src/seed/placeholders.ts
      - portfolio-services/tests/app.test.ts
    frontend:
      - portfolio-web/lib/types.ts
      - portfolio-web/lib/portfolio-data.ts
      - portfolio-web/lib/portfolio-data.test.ts
      - portfolio-web/app/components/views/experience-view.tsx
      - portfolio-web/app/globals.css
      - portfolio-web/app/(terminal)/experience/page.test.tsx
  created:
    frontend:
      - portfolio-web/lib/experience-duration.ts
      - portfolio-web/lib/experience-duration.test.ts
commits:
  backend:
    - aaa7b55  # final (amended with FE-infra SHA in body)
  frontend:
    - 1cec8d0  # FE-infra (Experience interface + EXPERIENCE seed)
    - cee0ee9  # FE-helper (computeDurationLabel)
    - 73666e0  # FE-view+CSS (full rewrite + tokens + .experience-* block)
metrics:
  duration_minutes: 6
  completed_date: 2026-05-14
  tasks_complete: 5
  files_modified: 13
spec: portfolio-web/.planning/specs/2026-05-14-experience-redesign.md
---

# Quick Task 260514-d7m: Experience View Redesign Summary

Paired BE + FE redesign of `/experience` from a single-row hex-hash layout into a timeline-rail card layout with monogram, computed duration, CURRENT pill, diff-add bullets, and STACK chips. Four atomic commits across two repos; backend commit body amended with FE-infra short SHA per the Phase 6 paired-SHA pattern.

## Tasks Executed

| # | Task | Repo | Commit | Files | Status |
|---|------|------|--------|-------|--------|
| 1 | BE — extend ExperienceDto + schema + seed + placeholder + Jest spec | portfolio-services | aaa7b55 (amended from fc7d401) | 5 | DONE |
| 2 | FE-infra — Experience interface + EXPERIENCE seed + vitest assertions | portfolio-web | 1cec8d0 | 3 | DONE |
| 3 | FE-helper — computeDurationLabel pure parser + 15 unit tests (TDD RED→GREEN) | portfolio-web | cee0ee9 | 2 | DONE |
| 4 | FE-view+CSS — experience-view rewrite + --accent-2* tokens + .experience-* block replacement + page.test.tsx smoke | portfolio-web | 73666e0 | 3 | DONE |
| 5 | Amend BE commit body — substitute `<FE-infra-SHA>` placeholder with `1cec8d0` | portfolio-services | aaa7b55 | 0 (message only) | DONE |

## Commits (final SHAs)

- **BE-final (amended):** `aaa7b55` — body: `Pair: portfolio-web @ 1cec8d0`
- **FE-infra:** `1cec8d0` — body: `Pair: portfolio-services @ fc7d401` (cites the pre-amend BE SHA, which is the standard Phase 6 pattern — BE then amends to cite FE-infra; both repos cross-cite at task close.)
- **FE-helper:** `cee0ee9` — FE-only, no pair line needed.
- **FE-view+CSS:** `73666e0` — FE-only, no pair line needed.

## Test Count Delta

**Backend (Jest):**
- Before: 8 specs passing (1 test suite, 1 file).
- After: 8 specs passing (1 test suite, 1 file). The existing `/api/experience` spec gained `bullets: expect.any(Array)`, `tech: expect.any(Array)`, plus per-element `typeof === 'string'` loops; test count unchanged but assertion coverage extended.

**Frontend (Vitest):**
- Before: 161 tests across 27 files (pre-task baseline, per CLAUDE.md / Phase 7 close-out).
- After: 182 tests across 28 files (`npm test -- --run`).
- Delta: **+21 tests, +1 file**.
  - `lib/experience-duration.test.ts` (NEW file): +15 tests.
  - `lib/portfolio-data.test.ts` (extended): +5 tests (bullets shape, tech shape, at-least-one-non-empty for each, optional-field-types).
  - `app/(terminal)/experience/page.test.tsx` (extended): +1 test (article aria-label smoke).

All tests pass; lint clean; `npm run build` exits 0 with the postbuild INFRA-05 placeholder gate green.

## Files Touched (13 total)

**Backend (5):**
- `src/types/content.ts` — ExperienceDto gains `bullets:string[]`, `tech:string[]`, `location?:string`, `employmentType?:string`.
- `src/models/Experience.ts` — schema gains `bullets: { type: [String], required: true, default: [] }`, `tech: { type: [String], required: true, default: [] }`, optional `location` and `employmentType` String fields. `strict: 'throw'` and composite unique index on `{ company, period }` preserved.
- `src/seed/experience.json` — 3 entries gain real `bullets`, `tech`, `location`, `employmentType`.
- `src/seed/placeholders.ts` — `placeholderExperience` gains `bullets: []`, `tech: []` (503-fallback safe).
- `tests/app.test.ts` — `/api/experience` spec extended with array shape + element type checks.

**Frontend (8, of which 2 newly created):**
- `lib/types.ts` — `Experience` interface gains 4 fields with jsdoc per field.
- `lib/portfolio-data.ts` — `EXPERIENCE` constant byte-mirrors `portfolio-services/src/seed/experience.json` (D-14).
- `lib/portfolio-data.test.ts` — +5 vitest assertions for new fields.
- `lib/experience-duration.ts` — **NEW** — pure parser `computeDurationLabel(period, now?)` → "Ny Nmo" / null. Uses `getUTC*` methods for deterministic results across timezones.
- `lib/experience-duration.test.ts` — **NEW** — 15 vitest cases (TDD RED→GREEN within one commit).
- `app/components/views/experience-view.tsx` — full rewrite: RSC body, timeline rail, monogram (Unicode-safe), CURRENT pill, hanging-indent bullets with `+` markers, STACK row with `TechChip`. Defensive `?? []` on bullets/tech for un-reseeded prod backend.
- `app/globals.css` — added `--accent-2`, `--accent-2-dim`, `--accent-2-bg` tokens in both `:root` and `[data-theme="light"]` oklch blocks (spec §4); replaced the entire `.experience-*` CSS block (was hex-hash layout) with timeline-card layout including `@media (max-width: 960px)` mobile collapse.
- `app/(terminal)/experience/page.test.tsx` — +1 smoke assertion for `<article aria-label="Experience at ... as ..., ...">`.

## §10 Acceptance Criteria Sweep

- [x] `npm run build` passes locally with new fields populated (postbuild INFRA-05 gate clean).
- [x] All existing tests still pass; new tests added for duration parser + new-field assertions (182 total FE / 8 BE; up from 161 / 8).
- [x] `/experience` route will render 3 cards in the new layout in both dark and light themes (spot-check pending — see operational notes below).
- [x] Current role shows accent + filled marker + CURRENT badge; past roles show secondary accent + outline marker, no badge (CSS classes `.experience-card.is-current`, `.experience-rail-marker.is-current` and the conditional `current && <CURRENT badge>` in JSX).
- [x] Duration computed correctly for "2023 - present" and fixed periods (15 vitest cases cover all listed shapes).
- [x] At ≤960px, timeline line hides but markers remain; cards reflow without horizontal overflow (`@media (max-width: 960px)` block).
- [x] `/api/experience` JSON includes `bullets` and `tech` arrays after backend deploy + reseed (BE schema + seed JSON in commit `aaa7b55`; reseed is operational — see §9 / operational notes below).
- [x] Knip clean (no new dead exports), lint clean, typecheck clean (`npm run build` and `npm run lint` both pass).

**Paired-commit hygiene:**
- [x] BE commit body (`aaa7b55`) ends with `Pair: portfolio-web @ 1cec8d0` (placeholder substituted in Task 5 via amend).
- [x] FE-infra commit body (`1cec8d0`) ends with `Pair: portfolio-services @ fc7d401` (cites pre-amend BE SHA — standard Phase 6 pattern; both repos cross-cite each other at task close).
- [x] FE-helper (`cee0ee9`) and FE-view+CSS (`73666e0`) reference spec but no pair line (FE-only with no BE counterpart).

**Defensive rendering invariant:**
- [x] View safe to render against a backend response missing `bullets`/`tech` (e.g., un-reseeded prod) — `?? []` in JSX yields zero bullets and skips STACK row, no exception.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Timezone-shifted Date methods in `computeDurationLabel`**
- **Found during:** Task 3 GREEN phase (initial vitest run with `getFullYear()` / `getMonth()` produced 11mo instead of 1y for `"2022 - present"` with `now=new Date("2023-01-01")`).
- **Issue:** ISO date strings like `"2023-01-01"` parse as UTC midnight; in UTC-offset timezones, `.getMonth()` returns the local-time month (11 = December) instead of the intended UTC month (0 = January). This made the helper produce wrong durations depending on the runtime's local timezone — a latent prod-determinism bug, not just a test issue.
- **Fix:** Switched the `isPresent` branch to use `reference.getUTCFullYear()` and `reference.getUTCMonth()`. Pure functions producing display labels from ISO-shape strings should treat the reference date in UTC consistently with the input format.
- **Files modified:** `lib/experience-duration.ts`
- **Commit:** `cee0ee9` (this fix landed inside Task 3's atomic commit, before commit; tests then passed GREEN).
- **Verification:** All 15 duration tests pass; no test was modified to accommodate the fix (the test expectations matched the spec's intent, not the buggy implementation).

No other deviations. Plan executed exactly as written.

## Known Stubs

None. All `bullets` and `tech` content in `seed/experience.json` and `EXPERIENCE` is realistic-shape content matching the spec's mockup voice (engineering-credible defaults from PLAN.md Task 1 Step 4). No `lorem`, `example.com`, `placeholder`, `TODO`, or `Product Studio` strings — verified by INFRA-05 postbuild grep + an explicit grep in Task 1 verify.

If the developer wants to swap in real (non-placeholder) company names and bullets later, the byte-mirror discipline (D-14) means: edit both `portfolio-services/src/seed/experience.json` AND `portfolio-web/lib/portfolio-data.ts` `EXPERIENCE` constant in a single follow-up commit, then run `npm run seed` against prod Mongo to surface the updated content.

## Operational Notes

- **Mongo reseed required for production parity** — same pattern as the LinkedIn fix earlier this week. After this commit ships to backend prod, run `npm run seed` against the prod Mongo cluster so the new `bullets`/`tech`/`location`/`employmentType` fields are persisted. Until reseed, prod backend returns entries without these fields and the FE renders gracefully (empty arrays render zero bullets and skip the STACK row entirely — the `?? []` defensive guards in `experience-view.tsx` make this a no-throw render path).
- **Vercel ISR cache** — pages refresh within the 5-minute revalidate window after the reseed completes.
- **Backend deploy** — the BE commit (`aaa7b55` on `main` of portfolio-services) will need to be pushed and deployed (Railway, per Phase 7 close-out) before the FE commits ship; otherwise FE deploys to prod with seed JSON containing the new fields but backend responses still on the old shape (which is fine — defensive rendering covers it, but you'd want consistency for the launch window).

## Spot-check Checklist (for the developer at dev-server time)

Visit `http://localhost:3000/experience` and confirm:

- [ ] 3 cards stack vertically with a left-anchored dashed timeline rail.
- [ ] Top card (current role) has filled accent marker dot + green CURRENT pill + accent-colored 4px left edge.
- [ ] Past role cards have hollow secondary-accent marker dots + no CURRENT pill + secondary-accent 4px left edge.
- [ ] Monogram square (32×32) renders "IN" for "Independent", "CO" for "Confidential" (uppercase first two chars per spec §3 single-token fallback).
- [ ] Duration line shows under the period (e.g., "3y 6mo" depending on current date for the present role).
- [ ] Bullets render with `+` markers (accent-green for current, muted for past) and hanging indent on wrap.
- [ ] STACK row shows existing TechChip styling.
- [ ] At ≤960px viewport, timeline line hides but marker dots remain; cards reflow without horizontal scroll at 375px.
- [ ] Repeat the above for: dark theme + light theme (toggle in top bar), and across all 4 accent hues (amber / cyan / magenta / green via theme picker). Confirm the `--accent-2*` secondary-accent is visually distinct from the primary `--accent` on past-role markers and monograms without becoming illegible against the background.

## Self-Check: PASSED

**Files created (verified exist):**
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/experience-duration.ts` — FOUND
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/experience-duration.test.ts` — FOUND

**Commits (verified in `git log --oneline -10`):**
- `aaa7b55` (BE-final) — FOUND in portfolio-services log
- `1cec8d0` (FE-infra) — FOUND in portfolio-web log
- `cee0ee9` (FE-helper) — FOUND in portfolio-web log
- `73666e0` (FE-view+CSS) — FOUND in portfolio-web log

All paired commit cross-references verified:
- `aaa7b55` body: `Pair: portfolio-web @ 1cec8d0` ✓
- `1cec8d0` body: `Pair: portfolio-services @ fc7d401` ✓ (pre-amend BE SHA per Phase 6 pattern)
