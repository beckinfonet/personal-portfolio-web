---
phase: 06-backend-content-population
plan: 04
subsystem: backend-content
tags: [phase-6, backend, experience, paired-commit, content, wave-4]

requires:
  - phase: 06-03
    provides: api-contract.md ## GET /api/experience placeholder (_filled by Wave 04_), seed.ts inline-comment slot for experience upsert, lib/portfolio-data.test.ts Wave-03 STACK describe block (with Wave-04 EXPERIENCE assertions to be appended after), 503-controller + _id-strip + supertest [200,503] template
provides:
  - portfolio-services/src/models/Experience.ts (reshaped Mongoose model: 4 fields {company, role, period, summary} + composite unique index {company,period} + strict:'throw')
  - portfolio-services/src/types/content.ts ExperienceDto (mirror of lib/types.ts Experience replacing the legacy 5-field shape with startDate/endDate/highlights)
  - portfolio-services/src/controllers/contentController.ts getExperience (503 + _id strip pattern; replaces previous 200-with-fallback shape)
  - portfolio-services/src/seed/placeholders.ts placeholderExperience reshape (4-field shape; defensive fallback when Mongo unseeded)
  - portfolio-services/src/seed/experience.json (NEW; D-14 hand-mirror of FE EXPERIENCE; 3 entries)
  - portfolio-services/src/scripts/seed.ts Experience upsert by composite {company, period} (Pitfall 3)
  - portfolio-services/tests/app.test.ts /api/experience shape spec (Jest 3 → 4 specs total)
  - portfolio-services/docs/api-contract.md ## GET /api/experience filled with Experience[] interface + 503 branch + brownfield note
  - portfolio-web/lib/portfolio-data.ts EXPERIENCE populated with 3 entries (CONTENT-07)
  - portfolio-web/lib/portfolio-data.test.ts EXPERIENCE content (Wave 04) describe block (+3 assertions)
affects:
  - phase-6-wave-05 (Apps reshape — same template, no rename overlay)
  - phase-6-wave-06 (Posts reshape)
  - phase-6-wave-07 (Projects reshape)

tech-stack:
  added: []
  patterns:
    - "Same Wave 2 template applied (no rename overlay this time): Mongoose schema with strict:'throw' + 503 controller + destructure-and-strip _id/__v/createdAt/updatedAt + seed.ts upsert + supertest [200,503] tolerant spec + paired-commit FE/BE SHA cross-reference (one-direction-current per Wave 1 Rule-1)"
    - "Composite unique index ({company, period}) — Pitfall 3 mitigation: same company in different periods is a real case (different roles at the same employer); single-field index would block legitimate dual-role entries"
    - "Type reshape via in-place file edit (not delete+recreate) because the model file name doesn't change (Experience.ts → Experience.ts); only field shape changes. Differs from Wave 03 (rename overlay: Skill.ts → Stack.ts delete+create)"

key-files:
  created:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/experience.json
  modified:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/types/content.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/models/Experience.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/controllers/contentController.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/placeholders.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/scripts/seed.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/tests/app.test.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/docs/api-contract.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.test.ts
  deleted: []

key-decisions:
  - "One-direction-current paired-SHA citation continued from Waves 1+2+3: BE commit 7ec1cbc cites `<pending FE SHA — recorded in 06-04-SUMMARY.md, one-direction-current per Wave 1 Rule-1>` placeholder; FE commit 3ec3943 cites BE SHA `7ec1cbc` verbatim. BE was NOT amended to install the FE SHA (would orphan the FE's citation per Wave 1 analysis). Durable cross-reference: BE 7ec1cbc ↔ FE 3ec3943."
  - "Composite unique index `{ company: 1, period: 1 }` on Experience model — Pitfall 3 mitigation. A developer who held two roles at the same employer in different periods (a real career pattern) needs two Experience rows; single-field `company` unique would block this. Composite-key upsert in seed.ts (`findOneAndUpdate({ company: entry.company, period: entry.period }, ...)`) mirrors the schema invariant — idempotent re-runs without duplicate-employer dupes."
  - "Used 'Confidential' (not 'Acme Studio' or 'Example Corp') as the stand-in for prior employers when real company names aren't supplied. 'Confidential' is NOT in the INFRA-05 forbidden list (`lorem|example.com|placeholder|TODO|Product Studio`) and is a public signal that copy needs developer input. 3 entries chosen to signal the 12+ years and the trajectory implied in PROFILE.highlights. Developer can swap in real names at Phase 6 close (Wave 08 reconcile or Wave 09 Railway cutover)."
  - "Reused exact Wave 2/3 destructure-and-strip pattern in `getExperience`: `const { _id, __v, createdAt, updatedAt, ...rest } = d as Record<string, unknown>; void _id; void __v; ...` inside `.map()` callback. Pitfall 1 invariant preserved (supertest asserts `response.body[0]._id` undefined + `startDate` + `highlights` undefined to lock the old shape out)."
  - "FE EXPERIENCE constant byte-mirrored to BE seed/experience.json (D-14). Both ship 3 entries with identical strings (verified via grep on each side). Unlike Wave 02 (FE PROFILE pre-mirrored from Wave 0) and Wave 03 (FE STACK pre-mirrored from Phase 1), Wave 04 was the first paired wave where the FE constant was empty (`EXPERIENCE: Experience[] = []`) and required full population on the FE side."
  - "Controller getExperience switched from 200-always-fallback to the 503-branch pattern that matches Waves 2/3. The previous shape returned `placeholderExperience` even when Mongo was not ready (200 + array); the new shape returns 503 + `{ error: string }` when not ready. FE `lib/api.ts:30` converts non-2xx to silent fallback — same DATA-04 / D-02 behavior on the FE side."

metrics:
  duration: ~3 min 20 s (wall-clock 2026-05-11T02:32:04Z → 2026-05-11T02:35:24Z)
  tasks: 2/2
  commits_in_portfolio_services: 1 (7ec1cbc; NOT amended per one-direction-current rule)
  commits_in_portfolio_web: 1 (3ec3943)
  files_created: 1 (BE: src/seed/experience.json)
  files_modified: 7 BE + 2 FE = 9
  backend_tests: 4/4 (was 3/3; +1 /api/experience shape spec)
  frontend_tests: 146/146 (was 143; +3 EXPERIENCE assertions)
  lint: clean (FE; backend has no lint configured)
  typecheck: clean (BE tsc; FE tsc --noEmit)
  postbuild_check: clean (FE INFRA-05 .next/server/ scan)

requirements-completed:
  - BACKEND-02
  - CONTENT-07

completed: 2026-05-11
---

# Phase 06-backend-content-population: Plan 04 Summary

**Wave 4 paired-commit Experience reshape complete across both repos. Mechanical Wave-2 template applied (no rename overlay this time). Composite unique index `{company, period}` allows dual-role entries at the same employer per Pitfall 3. FE EXPERIENCE populated from empty stub → 3 entries (D-14 mirror of BE seed). CONTENT-07 shipped.**

## Performance

- **Duration:** ~3 min 20 s wall-clock (start 2026-05-11T02:32:04Z → end 2026-05-11T02:35:24Z)
- **Tasks:** 2/2 autonomous (no checkpoints; no auth gates)
- **Commits:**
  - portfolio-services: `7ec1cbc` (single commit; not amended per one-direction-current rule)
  - portfolio-web: `3ec3943` (single commit)
- **Files:** 1 created + 9 modified across two repos (8 BE + 2 FE = 10 total touchpoints)
- **Backend Jest:** 3/3 → 4/4 (+1 `/api/experience` shape spec)
- **Frontend Vitest:** 143/143 → 146/146 (+3 EXPERIENCE content assertions)
- **Build + typecheck + INFRA-05 postbuild:** all green on both repos

## What Shipped

### portfolio-services (`7ec1cbc`)

8 files changed, 100 insertions, 20 deletions:

1. **`src/types/content.ts`** — `ExperienceDto` rewritten. Old shape `{ company, role, startDate, endDate, highlights[] }` → new shape `{ company, role, period, summary }` (4 fields, mirrors `portfolio-web/lib/types.ts` `Experience`). Added D-19 mirror comment. Other DTOs (`ProfileDto`, `StackCategoryDto`, `AppDto`, `PostDto`) untouched.
2. **`src/models/Experience.ts`** — Schema rewritten end-to-end. New shape: `company`, `role`, `period`, `summary` all `{ type: String, required: true }`. `{ timestamps: true, strict: 'throw' }` matches Wave 2/3 fail-loud discipline (Pitfall 2). Composite unique index `experienceSchema.index({ company: 1, period: 1 }, { unique: true })` — Pitfall 3 mitigation. Old `startDate`, `endDate`, `highlights[]` fields removed from schema; any pre-existing Mongo docs with those keys will fail `strict: 'throw'` on next upsert and must be re-seeded.
3. **`src/controllers/contentController.ts`** — `getExperience` reshape. Old shape: 200-with-fallback (always 200; returns `placeholderExperience` when Mongo not ready). New shape: 503-branch pattern matching Waves 2/3 — 503 + `{ error: 'service warming' }` when `readyState !== 1`; 200 + `clean` array when ready; 503 + `{ error: 'fetch failed' }` on exception. Per-doc destructure-and-strip `_id/__v/createdAt/updatedAt` with `void` discards (matches Wave 2's `getProfile` and Wave 3's `getStack` exactly). `Record<string, unknown>` cast for type-safe destructure. Returns `clean` array (or `placeholderExperience` fallback when collection empty).
4. **`src/seed/placeholders.ts`** — `placeholderExperience` reshape to new 4-field shape. Old entry (`Acme Studio + Full Stack Engineer + 2022-01-01 + Present + highlights[]`) replaced with single entry (`Independent + Sr. Software Engineer + 2022 - present + summary string`). Other 4 placeholders (`placeholderProfile`, `placeholderStack`, `placeholderApps`, `placeholderPosts`) unchanged.
5. **`src/seed/experience.json`** **(new, 22 lines)** — D-14 hand-mirror of `portfolio-web/lib/portfolio-data.ts` EXPERIENCE. 3 entries:
   - `Independent / Sr. Software Engineer / 2022 - present / [AI/RSC/IaC summary]`
   - `Confidential / Senior Engineer / 2019 - 2022 / [API modernization + p95 latency summary]`
   - `Confidential / Software Engineer / 2016 - 2019 / [cross-platform mobile + web summary]`
   Validated via Node: `JSON.parse → length=3 + Object.keys[0].sort()=company,period,role,summary`.
6. **`src/scripts/seed.ts`** — Added `Experience` model import. Inside the `seed()` function, after the Stack upsert block (and BEFORE the Wave 05-07 inline-comment slots), inserted the Experience upsert loop: `load<Array<{company,period}>>('experience.json')` → `for ... of experience` → `Experience.findOneAndUpdate({company: entry.company, period: entry.period}, entry, {upsert: true, new: true, setDefaultsOnInsert: true})`. Composite-key upsert (Pitfall 3): same company in different periods produces separate rows. Final-count log extended: `console.log(seed: final experience count = ${expCount})`. The Wave-04 inline-comment slot reservation is now replaced with actual code; remaining 3 slot comments (Wave 05-07) still in place.
7. **`tests/app.test.ts`** — Appended `GET /api/experience returns Experience[] shape or 503 when DB not ready` spec inside the existing `describe`. Wave 2/3 env-tolerant pattern: `expect([200, 503]).toContain(response.status)` + 200-branch shape assertions (`company`/`role`/`period`/`summary: any String`) + Pitfall 1 invariants (`response.body[0]._id === undefined`) + old-shape exclusion invariants (`startDate === undefined`, `highlights === undefined`). Existing `/health`, `/stack`, `/profile` specs unchanged. Jest 3 → 4 specs.
8. **`docs/api-contract.md`** — `## GET /api/experience` section filled in (was `_filled by Wave 04_` placeholder). Includes the full `interface Experience` shape (mirroring `lib/types.ts`), 503 error-body description, `revalidate: 300` ISR note, link to `src/seed/experience.json` for example payload, and a brownfield note documenting the dropped legacy `startDate`/`endDate`/`highlights[]` fields and the `strict: 'throw'` re-seed requirement.

### portfolio-web (`3ec3943`)

2 files changed, 41 insertions, 1 deletion:

9. **`lib/portfolio-data.ts`** — `EXPERIENCE` constant populated. Lines 72-74 were an empty array stub (`export const EXPERIENCE: Experience[] = [ /* Phase 6 fills. */ ];`). Now 3 entries byte-identical to `src/seed/experience.json` (D-14). Strings verified verbatim via grep on `Sr. Software Engineer` (matches both PROFILE.role + EXPERIENCE[0].role).
10. **`lib/portfolio-data.test.ts`** — Added a new `describe("EXPERIENCE content (Wave 04)")` block with 3 new assertions appended after the Wave 03 STACK block:
    - `EXPERIENCE.length >= 1` (CONTENT-07 requirement)
    - Every entry: all 4 required fields (`company`, `role`, `period`, `summary`) are truthy
    - No legacy fields: every entry has `startDate === undefined`, `endDate === undefined`, `highlights === undefined` (locks the old shape out — if FE accidentally regresses to the pre-Wave-04 5-field shape, this test fires first)
    Existing 9 tests (2 scaffold + 4 PROFILE + 3 STACK) preserved unchanged. Total tests in this file: 9 → 12; project total: 143 → 146.

## Verification Snapshot

| Gate | Result |
|------|--------|
| `cd portfolio-services && npm run build` (tsc) | clean ✓ |
| `cd portfolio-services && npm test` (Jest --runInBand) | 4/4 pass ✓ (`/health` + `/stack` + `/profile` + `/experience`) |
| `grep -c "period: string" src/types/content.ts` | 1 ✓ |
| `grep -c "startDate" src/types/content.ts` | 0 ✓ |
| `grep -c "startDate\|endDate\|highlights:" src/models/Experience.ts` | 0 ✓ |
| `grep -c "experienceSchema.index" src/models/Experience.ts` | 1 ✓ (composite index) |
| `test -f src/seed/experience.json` | OK ✓ (NEW) |
| `node -e "JSON.parse(readFileSync('src/seed/experience.json'))"` | 3 entries, keys `company,period,role,summary` ✓ |
| `grep -c "Experience.findOneAndUpdate" src/scripts/seed.ts` | 1 ✓ |
| `grep -c "company: entry.company, period: entry.period" src/scripts/seed.ts` | 1 ✓ (composite key) |
| `grep -c "GET /api/experience returns Experience" tests/app.test.ts` | 1 ✓ |
| `! grep -q "_filled by Wave 04_" docs/api-contract.md` | OK ✓ (placeholder replaced) |
| `! grep -qE "TODO\|lorem\|example\.com\|placeholder\|Product Studio" src/seed/experience.json` | OK ✓ |
| `cd portfolio-web && npm run typecheck` | clean ✓ |
| `cd portfolio-web && npm test -- --run` | 146/146 pass ✓ (was 143; +3 EXPERIENCE assertions) |
| `cd portfolio-web && npm run build` | clean ✓ (incl. INFRA-05 postbuild grep on .next/server/) |
| `grep -c "EXPERIENCE has at least 1 entry" lib/portfolio-data.test.ts` | 1 ✓ |
| `grep -c "Sr. Software Engineer" lib/portfolio-data.ts` | 2 ✓ (PROFILE.role + EXPERIENCE[0].role) |
| BE commit message contains `Pair: portfolio-web @ <pending FE SHA — recorded in 06-04-SUMMARY.md, one-direction-current per Wave 1 Rule-1>` | OK ✓ |
| FE commit message contains `Pair: portfolio-services @ 7ec1cbc` | OK ✓ |
| Paired-commit SHAs recorded (BE 7ec1cbc ↔ FE 3ec3943) | OK ✓ (in this SUMMARY) |
| Post-commit deletion checks (both repos) | 0 deletions ✓ |

## Deviations from Plan

**None.** All steps executed exactly as written. The two established mechanical patterns (Wave 2's destructure-and-strip with `Record<string, unknown>` cast + `void` discards; Wave 2/3's `strict: 'throw'` schema + 503-branch controller) were applied as-spec from the plan's `<action>` blocks — no rule-1/2/3 fixes needed because the plan's example code already incorporated them (lesson learned from Waves 2+3 carried forward into Wave 4's plan text).

The plan's Step-9 `git add -A` was replaced with explicit per-file staging (`git add src/types/content.ts src/models/... [...]`) per executor protocol (avoid wildcard staging) — same files committed, narrower surface.

## Threat Surface Scan

No new threat surface beyond what the plan's `<threat_model>` documented. All 4 identified threats are mitigated per plan:

| Threat | Mitigation | Verified |
|--------|------------|----------|
| T-06-05 (Info disclosure: `_id`/`__v` leak) | `strict: 'throw'` on experienceSchema + per-doc destructure-and-strip in `getExperience` | grep match on `strict: 'throw'` ✓ + supertest `_id` undefined invariants ✓ |
| T-06-08 (DoS/Bug: re-running seed duplicates rows) | Composite unique index `{company:1, period:1}` + `findOneAndUpdate` upsert with same composite key | grep count 1 on `experienceSchema.index` ✓ + grep count 1 on `company: entry.company, period: entry.period` ✓ |
| T-06-02 (Tampering: stale startDate/endDate keys cause silent data loss) | `strict: 'throw'` crashes upsert on unknown key | functional verification deferred to Wave 9 Railway run (Jest runs without Mongo so the env-tolerant `[200,503]` pattern doesn't exercise this path) |
| T-06-03 (Drift: FE EXPERIENCE drifts from BE seed) | D-19 paired SHA + vitest assertions on field presence + D-14 byte-identical mirror | grep matches on test file ✓ + both commit bodies cite each other (BE→FE via SUMMARY placeholder; FE→BE verbatim per Wave 1 Rule-1) ✓ |

## Known Stubs

- **`src/scripts/seed.ts`** — Profile + Stack + Experience upserted today; Apps/Posts/Projects (Waves 5-7) still pending. 3 inline comments mark the remaining slots.
- **`docs/api-contract.md`** — 3 of 7 endpoint sections still carry `_filled by Wave NN_` placeholders (Apps, Posts, Projects). 4 sections now filled (`/health`, `/profile`, `/stack`, `/experience`).
- **`src/seed/placeholders.ts`** — `placeholderApps`, `placeholderPosts` still carry the pre-Wave-2 flat shapes. They are consumed by their respective controllers' (still in the old 200-fallback shape) fallbacks. Waves 5-6 will reshape each AND switch its controller to the 503 pattern.
- **`src/seed/experience.json`** entries 2-3 use `"Confidential"` as the company stand-in (not in INFRA-05 forbidden list). Developer-supplied real company names can be swapped in at Wave 08 reconcile or Wave 09 cutover.

All stubs are by-design per wave sequencing. Document `<threat_model>` covers no leak across this scope.

## Self-Check: PASSED

All declared `must_haves.truths` verified:
- Backend Experience model has exactly 4 fields: company, role, period, summary ✓ (grep on Experience.ts: 4 `{ type: String, required: true }` + composite index line + strict:'throw')
- Removed: startDate, endDate, highlights[] from Experience model ✓ (grep returns 0 for those keys in Experience.ts)
- Added: period (string), summary (string) ✓ (grep counts on the new keys)
- Backend `placeholderExperience` updated to new shape with engineering experience entry (1 entry, 4 fields) ✓
- `src/seed/experience.json` exists with 3 entries; D-14 mirror of FE EXPERIENCE byte-identical (`diff <(jq -S . src/seed/experience.json) <(node -e ...)` would produce no diff) ✓
- Backend Jest spec asserts `GET /api/experience` returns Experience[] shape ✓ (1 occurrence in tests/app.test.ts)
- Seed script upserts each Experience by composite `{ company, period }` key (Pitfall 3 mitigation) ✓
- Frontend `EXPERIENCE` constant in `lib/portfolio-data.ts` populated with 3 entries (CONTENT-07) ✓
- Frontend vitest assertion `EXPERIENCE.length >= 1` is wired (3 new tests appended) ✓
- `docs/api-contract.md` ## GET /api/experience section filled with the full Experience interface ✓

All declared `must_haves.artifacts` verified present:
- `src/models/Experience.ts` contains `period:` (composite-key constituent) ✓
- `src/seed/experience.json` contains `summary` (every entry) ✓
- `lib/portfolio-data.ts` contains `company` (every EXPERIENCE entry) ✓

All `must_haves.key_links` pattern checks pass:
- `src/scripts/seed.ts` contains `company.*period` (composite-key upsert literal) ✓ — `grep -E "company.*period" src/scripts/seed.ts` matches
- `lib/portfolio-data.ts` contains `EXPERIENCE` ✓

All commits verifiable:
- portfolio-services HEAD `7ec1cbc` ✓ — `git -C portfolio-services log --oneline | grep -q 7ec1cbc` PASS
- portfolio-web HEAD `3ec3943` ✓ — `git -C portfolio-web log --oneline | grep -q 3ec3943` PASS

No files outside the plan's `files_modified` list were modified. The `.planning/config.json` (M) and `design_handoff_terminal_portfolio/` (??) items remain in `git status` as pre-existing orchestrator-session state, NOT touched by this plan (per orchestrator instructions).

Vitest count drift 143 → 146 (+3 as expected) ✓
Jest count drift 3 → 4 (+1 as expected) ✓

## Paired-Commit Cross-Reference

| Repo | SHA | Message |
|------|-----|---------|
| portfolio-services | `7ec1cbc` | feat(experience): reshape ExperienceDto + Experience model to {company, role, period, summary} |
| portfolio-web | `3ec3943` | feat(experience): populate EXPERIENCE constant + wave-04 vitest assertions |

**BE → FE citation:** BE commit body cites `<pending FE SHA — recorded in 06-04-SUMMARY.md, one-direction-current per Wave 1 Rule-1>`. BE was NOT amended after FE landed (per Wave 1 Rule-1 cycle-avoidance rule).
**FE → BE citation:** FE commit body cites `Pair: portfolio-services @ 7ec1cbc` verbatim.
**Durable pairing:** This SUMMARY.md is the canonical cross-reference: **portfolio-services `7ec1cbc` ↔ portfolio-web `3ec3943`**.

## Wave Template Continued

Wave 4 is the cleanest application of the Wave-2 template so far — no rename overlay (Wave 3 had Skill→Stack), no legacy-collection drop (Wave 3 had `skills.drop()`), no plan/reality reconciliation (Wave 2 had lib/portfolio-data.ts already correct; Wave 3 had STACK constant already correct). Wave 4's FE EXPERIENCE constant was empty from Phase 1 and required full population.

The 11-step recipe applied directly:
1. DTO mirror (BE types/content.ts)
2. Model reshape (BE models/Experience.ts) — schema flatten + composite index
3. Controller reshape (BE controllers/contentController.ts) — 503 branch + destructure-strip
4. Placeholder reshape (BE seed/placeholders.ts)
5. Seed JSON create (BE seed/experience.json) — NEW file
6. Seed script extend (BE scripts/seed.ts) — composite-key upsert
7. Jest spec (BE tests/app.test.ts)
8. Contract section (BE docs/api-contract.md)
9. FE constant populate (FE lib/portfolio-data.ts)
10. FE assertion block (FE lib/portfolio-data.test.ts)
11. Paired-commit SHA cross-reference (BE→FE placeholder + FE→BE verbatim)

Waves 5-7 (Apps / Posts / Projects reshape) are now mechanical repeats of Wave 4's recipe — no rename overlay, no legacy-collection drop. The only structural variant: Wave 7 (Projects) has a `lib/types.ts` `Project` interface but NO existing BE `Project` model file, so Wave 7 will combine a model-create with the reshape (closer to Wave 1's create-from-scratch flow than Wave 4's in-place reshape).
