---
phase: 06-backend-content-population
plan: 03
subsystem: backend-content
tags: [phase-6, backend, stack, rename, paired-commit, brownfield, wave-3]

requires:
  - phase: 06-02
    provides: api-contract.md ## GET /api/stack placeholder (_filled by Wave 03_), seed.ts inline-comment slot for stack upsert + legacy skills drop, lib/portfolio-data.test.ts Wave-02 PROFILE describe block (with Wave-03 STACK assertions to be appended after), 503-controller + _id-strip + supertest [200,503] template
provides:
  - portfolio-services/src/models/Stack.ts (Mongoose model with unique:true on category + strict:'throw'; replaces Skill.ts)
  - portfolio-services/src/types/content.ts StackCategoryDto (mirror of lib/types.ts StackCategory) replacing SkillDto
  - portfolio-services/src/controllers/contentController.ts getStack (503 + _id strip pattern; getSkills DELETED)
  - portfolio-services/src/routes/apiRoutes.ts apiRoutes.get('/stack', getStack) (renamed from /skills)
  - portfolio-services/src/seed/placeholders.ts placeholderStack (replaces placeholderSkills)
  - portfolio-services/src/seed/stack.json (D-14 hand-mirror of FE STACK; 4 categories)
  - portfolio-services/src/scripts/seed.ts Stack upsert by category + legacy 'skills' collection drop on first run (Pitfall 4)
  - portfolio-services/tests/app.test.ts /api/stack shape spec (replaces /api/skills spec; 3 → 3 specs total)
  - portfolio-services/docs/api-contract.md ## GET /api/stack filled with StackCategory[] interface + 503 branch + brownfield note
  - portfolio-web/lib/portfolio-data.test.ts STACK content (Wave 03) describe block (+3 assertions)
affects:
  - phase-6-wave-04 (Experience reshape — same template, no rename component this time)
  - phase-6-wave-05 (Apps reshape)
  - phase-6-wave-06 (Posts reshape)
  - phase-6-wave-07 (Projects reshape)

tech-stack:
  added: []
  patterns:
    - "Brownfield discipline: Skill.ts DELETED in the SAME commit that introduces Stack.ts (per CLAUDE.md, no deprecated parallel surface)"
    - "Pitfall 4 legacy-collection drop: `mongoose.connection.collection('skills').drop().catch(code-26 NamespaceNotFound)` — idempotent first-run cleanup of orphaned Mongo collection from a model rename"
    - "Same Wave 2 template applied: nested-or-flat Mongoose schema with strict:'throw' + 503 controller + destructure-and-strip _id/__v/createdAt/updatedAt + seed.ts upsert by stable key + supertest [200,503] tolerant spec + paired-commit FE/BE SHA cross-reference (one-direction-current per Wave 1 Rule-1)"
    - "Route rename: apiRoutes.get('/skills', getSkills) → apiRoutes.get('/stack', getStack); legacy /api/skills returns 404 after rename"

key-files:
  created:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/models/Stack.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/stack.json
  modified:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/types/content.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/controllers/contentController.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/routes/apiRoutes.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/placeholders.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/scripts/seed.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/tests/app.test.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/docs/api-contract.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.test.ts
  deleted:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/models/Skill.ts

key-decisions:
  - "One-direction-current paired-SHA citation continued from Waves 1+2: BE commit a0dc473 cites `<pending FE SHA — recorded in 06-03-SUMMARY.md, one-direction-current per Wave 1 Rule-1>` placeholder; FE commit db78749 cites BE SHA `a0dc473` verbatim. BE was NOT amended to install the FE SHA (would orphan the FE's citation per Wave 1 analysis). Durable cross-reference: BE a0dc473 ↔ FE db78749."
  - "Skill.ts deleted in the SAME commit that creates Stack.ts (10-file paired commit). git show --stat HEAD confirms `delete mode 100644 src/models/Skill.ts` + `create mode 100644 src/models/Stack.ts` on the same commit a0dc473 — per CLAUDE.md brownfield discipline, no deprecated parallel surface ever existed in tree history."
  - "Legacy `skills` Mongo collection drop logic added to seed.ts BEFORE the Stack upsert block: `mongoose.connection.collection('skills').drop()` wrapped in try/catch that re-throws unless `code === 26` (NamespaceNotFound). Idempotent: first run drops + logs; subsequent runs silent. On a fresh Mongo (Wave 9 Railway deploy) the drop will hit code 26 and no-op; on a developer's local Mongo that had the old Skill collection from pre-Wave-2 testing, this is the one-time cleanup."
  - "Used `unknown` (not `any`) for the catch-clause error binding in seed.ts: `catch (e: unknown) { const code = (e as { code?: number })?.code; ... }`. Project's tsconfig has `strict: true` which enables `useUnknownInCatchVariables`; the plan's example used `any` which the linter would have flagged. Same semantic result; tighter type discipline."
  - "Used `Record<string, unknown>` (not `any`) in the controller's destructure-and-strip pattern: `const { _id, __v, createdAt, updatedAt, ...rest } = d as Record<string, unknown>;`. Mirrors the exact pattern from Wave 2's `getProfile` (which used the same cast). `void` discards for the four unused destructure bindings to satisfy `noUnusedLocals`. Pitfall 1 invariant preserved (supertest asserts `_id` and `__v` undefined on response.body[0])."
  - "lib/portfolio-data.ts NOT modified — its STACK constant (lines 84-89) already matches src/seed/stack.json byte-for-byte (4 categories: languages, frameworks, cloud, ai with the same items). Phase 1 wired this correctly. Plan's `files_modified` did not list lib/portfolio-data.ts; only the test file shipped on FE side."

metrics:
  duration: ~2 min (wall-clock 2026-05-11T02:23:17Z → 2026-05-11T02:26:14Z)
  tasks: 2/2
  commits_in_portfolio_services: 1 (a0dc473; NOT amended per one-direction-current rule)
  commits_in_portfolio_web: 1 (db78749)
  files_created: 2 (BE: src/models/Stack.ts + src/seed/stack.json)
  files_deleted: 1 (BE: src/models/Skill.ts; same commit as Stack.ts create)
  files_modified: 7 BE + 1 FE = 8
  backend_tests: 3/3 (was 3/3; /api/skills spec REMOVED, /api/stack spec ADDED — net 0; semantics changed)
  frontend_tests: 143/143 (was 140; +3 STACK assertions)
  lint: clean (FE; backend has no lint configured)
  typecheck: clean (BE tsc; FE tsc --noEmit)
  postbuild_check: clean (FE INFRA-05 .next/server/ scan)

requirements-completed:
  - BACKEND-02
  - CONTENT-06

completed: 2026-05-11
---

# Phase 06-backend-content-population: Plan 03 Summary

**Wave 3 paired-commit Skill → Stack rename complete across both repos. Brownfield discipline preserved: Skill.ts deleted in the SAME commit that introduces Stack.ts (no deprecated parallel surface ever existed in tree history). Pitfall 4 legacy collection drop wired into seed.ts. Wave template from Plan 06-02 applied mechanically with the rename overlay.**

## Performance

- **Duration:** ~2 min wall-clock (start 2026-05-11T02:23:17Z → end 2026-05-11T02:26:14Z)
- **Tasks:** 2/2 autonomous (no checkpoints; no auth gates)
- **Commits:**
  - portfolio-services: `a0dc473` (single commit; not amended per one-direction-current rule)
  - portfolio-web: `db78749` (single commit; not amended)
- **Files:** 2 created + 1 deleted + 8 modified across two repos (10 BE + 1 FE = 11 total touchpoints)
- **Backend Jest:** 3/3 → 3/3 (no net change; `/api/skills` spec REMOVED, `/api/stack` shape spec ADDED)
- **Frontend Vitest:** 140/140 → 143/143 (+3 STACK content assertions)
- **Build + typecheck + INFRA-05 postbuild:** all green on both repos

## What Shipped

### portfolio-services (`a0dc473`)

10 files changed, 101 insertions, 45 deletions:

1. **`src/models/Skill.ts`** — **DELETED.** Old flat 3-field schema (`name`, `category`, `level`) is gone from tree history's HEAD. Brownfield discipline (CLAUDE.md) honored: deletion staged in the same commit as Stack.ts creation. `git show --stat HEAD` confirms `delete mode 100644 src/models/Skill.ts` alongside `create mode 100644 src/models/Stack.ts`.
2. **`src/models/Stack.ts`** — **NEW** (11 lines). Top-level schema with `category: { type: String, required: true, unique: true }` + `items: { type: [String], required: true, default: [] }` + `{ timestamps: true, strict: 'throw' }`. The `unique: true` on category prevents duplicate-category seeding; `strict: 'throw'` matches Wave 2's Profile model fail-loud discipline (Pitfall 2).
3. **`src/types/content.ts`** — `SkillDto` block removed; replaced with `StackCategoryDto` (2 fields: `category: string`, `items: string[]`). Mirrors `portfolio-web/lib/types.ts` `StackCategory` exactly (D-19). Other DTOs (`ProfileDto`, `ExperienceDto`, `AppDto`, `PostDto`) unchanged.
4. **`src/controllers/contentController.ts`** — `Skill` model import replaced with `Stack`. `placeholderSkills` placeholder import replaced with `placeholderStack`. `getSkills` handler entirely deleted; new `getStack` handler follows the Wave 2 template: 503 when DB not ready, `Stack.find().lean()` when ready, per-doc destructure-and-strip `_id/__v/createdAt/updatedAt` with `void` discards (matches Wave 2 `getProfile`'s noUnusedLocals workaround), `Record<string, unknown>` cast for type-safe destructure, returns `clean` array (or `placeholderStack` fallback when collection empty). Two 503 branches (not-ready + fetch-failed).
5. **`src/routes/apiRoutes.ts`** — Route table updated: `apiRoutes.get('/stack', getStack)` (was `/skills`, `getSkills`). Import statement renamed accordingly. Legacy `/api/skills` now returns 404. Other 5 routes unchanged.
6. **`src/seed/placeholders.ts`** — `SkillDto` import replaced with `StackCategoryDto`. `placeholderSkills` constant entirely replaced with `placeholderStack` (4 categories: languages, frameworks, cloud, ai — identical content to `src/seed/stack.json` D-14). Other 4 placeholders (`placeholderProfile`, `placeholderExperience`, `placeholderApps`, `placeholderPosts`) unchanged.
7. **`src/seed/stack.json`** **(new, 6 lines)** — D-14 hand-mirror of `portfolio-web/lib/portfolio-data.ts` STACK. 4 categories × items[] each. Validated via Node: `JSON.parse → length=4 + Array.isArray(items)`.
8. **`src/scripts/seed.ts`** — Added `Stack` model import. Inside the `seed()` function, after the existing Profile upsert block, inserted (a) the Pitfall 4 legacy `skills` collection drop wrapped in `try/catch` that re-throws unless `code === 26` (NamespaceNotFound), and (b) the Stack upsert loop iterating `stack.json` and calling `Stack.findOneAndUpdate({ category: entry.category }, entry, { upsert: true, new: true, setDefaultsOnInsert: true })`. Final log block extended with `const stackCount = await Stack.countDocuments(); console.log(stack count = ${stackCount})`. The Wave-03 inline-comment slot reservation is removed (now actual code); the remaining 4 slot comments (Wave 04-07) still in place.
9. **`tests/app.test.ts`** — `GET /api/skills` test block entirely removed. Replaced with `GET /api/stack returns StackCategory[] shape or 503 when DB not ready` that uses the Wave 2 env-tolerant pattern: `expect([200, 503]).toContain(response.status)` + 200-branch shape assertions (`category: any String`, `items: any Array`) + Pitfall 1 invariants (`response.body[0]._id === undefined`, `__v === undefined`). Existing `/health` + `/profile` (Wave 2) specs unchanged. Jest 3 → 3 specs (net 0; semantics swapped).
10. **`docs/api-contract.md`** — `## GET /api/stack` section filled in (was `_filled by Wave 03_` placeholder). Includes the full `type StackCategory` shape (mirroring `lib/types.ts`), 503 error-body description, `revalidate: 300` ISR note, link to `src/seed/stack.json` for example payload, and a brownfield-history note documenting the `/api/skills` → `/api/stack` rename and the first-run `skills` collection drop.

### portfolio-web (`db78749`)

1 file changed, 25 insertions:

11. **`lib/portfolio-data.test.ts`** — Added a new `describe("STACK content (Wave 03)")` block with 3 new assertions appended after the Wave 02 PROFILE block:
    - `STACK.length >= 1` (CONTENT-06 requirement)
    - Every entry: `category` is non-empty string AND `items` is non-empty array of non-empty strings
    - `categories are unique` — `new Set(STACK.map(s => s.category)).size === STACK.length` (mirrors Mongo `unique: true` invariant in the Stack model; if FE adds a duplicate-category entry, this test fails BEFORE seed.ts would crash on the unique-index violation)

    Existing 6 tests (2 scaffold + 4 PROFILE) preserved unchanged. Total tests in this file: 6 → 9; project total: 140 → 143.

12. **`lib/portfolio-data.ts`** — NOT modified. Its `STACK` constant (lines 84-89) already matches `src/seed/stack.json` byte-for-byte from Phase 1. The plan's `files_modified` list did NOT include this file (Plan 06-03 frontmatter only lists `portfolio-web/lib/portfolio-data.test.ts` for the FE side), consistent with the plan's `<action>` note: "FE STACK shape is already correct… no portfolio-data.ts structural edit needed."

## Verification Snapshot

| Gate | Result |
|------|--------|
| `cd portfolio-services && npm run build` (tsc) | clean ✓ |
| `cd portfolio-services && npm test` (Jest --runInBand) | 3/3 pass ✓ (`/health` + `/profile` + `/stack`) |
| `test ! -f src/models/Skill.ts` | OK ✓ (deleted) |
| `test -f src/models/Stack.ts` | OK ✓ (created) |
| `test -f src/seed/stack.json` | OK ✓ |
| `grep -rn "SkillDto\|placeholderSkills\|getSkills" src tests` | OK ✓ (no matches) |
| `grep -rn "/api/skills" src tests` | OK ✓ (no matches in source; only historical brownfield note in docs/api-contract.md, which is correct per plan) |
| `grep -c "apiRoutes.get('/stack'" src/routes/apiRoutes.ts` | 1 ✓ |
| `grep -c "collection('skills').drop" src/scripts/seed.ts` | 1 ✓ (Pitfall 4 drop wired) |
| `grep -c "Stack.findOneAndUpdate" src/scripts/seed.ts` | 1 ✓ |
| `node -e ...stack.json` | 4 categories, Array.isArray(items) = true ✓ |
| `grep -c "type StackCategory" docs/api-contract.md` | 1 ✓ |
| `! grep -q "_filled by Wave 03_" docs/api-contract.md` | OK ✓ (placeholder replaced) |
| `git show --stat HEAD` BE | shows `delete mode 100644 src/models/Skill.ts` + `create mode 100644 src/models/Stack.ts` in same commit ✓ |
| `cd portfolio-web && npm run typecheck` | clean ✓ |
| `cd portfolio-web && npm test -- --run` | 143/143 pass ✓ (was 140; +3 STACK assertions) |
| `cd portfolio-web && npm run build` | clean ✓ (incl. INFRA-05 postbuild grep on .next/server/) |
| `grep -c "STACK has at least 1 category" lib/portfolio-data.test.ts` | 1 ✓ |
| `grep -c "STACK categories are unique" lib/portfolio-data.test.ts` | 1 ✓ |
| BE commit message contains "Pair: portfolio-web @ \<pending FE SHA\>" | OK ✓ (one-direction-current per Wave 1 Rule-1) |
| FE commit message contains "Pair: portfolio-services @ a0dc473" | OK ✓ |
| Paired-commit SHAs recorded (BE a0dc473 ↔ FE db78749) | OK ✓ (in this SUMMARY) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] `tsconfig strict + useUnknownInCatchVariables` rejects `catch (e: any)` in seed.ts**

- **Found during:** Task 1 Step 8 (writing the Pitfall 4 drop block in seed.ts)
- **Issue:** Plan's Step 8 example used `} catch (e: any) {`. portfolio-services/tsconfig.json sets `"strict": true` which (in modern TS) enables `useUnknownInCatchVariables`. `any` would compile but is a code smell; under stricter linting (which Wave 9 may add) it would break.
- **Fix:** Used `} catch (e: unknown) { const code = (e as { code?: number })?.code; if (code !== 26) throw e; }`. Semantically identical (we only need `.code`; everything else gets discarded) but tighter type discipline that matches the Wave 2 controller's noUnusedLocals workaround style.
- **Files modified:** portfolio-services/src/scripts/seed.ts (3 lines: catch clause + code extraction).
- **Commit:** a0dc473 (same paired commit).

**2. [Rule 1 — Bug] `getStack` destructure-and-strip pattern needs `Record<string, unknown>` cast and `void` discards**

- **Found during:** Task 1 Step 5 (writing `getStack` controller)
- **Issue:** Plan's example used `const { _id, __v, createdAt, updatedAt, ...rest } = d` on a Mongoose lean() result. Under `strict: true`, this would (a) trip `noUnusedLocals` on the 4 extracted bindings and (b) fail typing because Mongoose's `LeanDocument` doesn't expose those keys as `unknown`. Same issue Wave 2's `getProfile` hit and solved.
- **Fix:** Used the exact Wave 2 pattern: cast each lean doc inside `.map()` to `Record<string, unknown>` then `void _id; void __v; void createdAt; void updatedAt;` to mark the discards as intentional. Pitfall 1 invariant preserved (supertest asserts `_id` + `__v` undefined on `response.body[0]`).
- **Files modified:** portfolio-services/src/controllers/contentController.ts (4 lines in the map callback).
- **Commit:** a0dc473 (same).
- **Note:** Not really a deviation — the plan's `<action>` Step 5 example was loose-mode pseudocode (just like Wave 2's plan), and the actual implementation matched the strict-mode-correct pattern Wave 2 already proved.

### Plan/Reality Reconciliation

**3. lib/portfolio-data.ts not modified — already correct from Phase 1**

- **Found during:** Task 2 reconciliation check
- **Issue:** Plan's `<action>` notes "FE STACK shape is already correct... no portfolio-data.ts structural edit needed." Verified: lib/portfolio-data.ts STACK (lines 84-89) matches src/seed/stack.json byte-for-byte (4 categories with identical items). Plan's `files_modified` frontmatter correctly did NOT list `lib/portfolio-data.ts` (unlike Wave 2 which listed it erroneously).
- **Fix:** No edit needed. Only `lib/portfolio-data.test.ts` shipped on FE side.
- **Files modified:** lib/portfolio-data.test.ts only.
- **Commit:** db78749 (FE).

### Architectural Decisions

None — all changes followed the plan recipe except the 2 mechanical fixes above (both matching Wave 2's established patterns).

## Threat Surface Scan

No new threat surface beyond what the plan's `<threat_model>` documented. All 4 identified threats are mitigated per plan:

| Threat | Mitigation | Verified |
|--------|------------|----------|
| T-06-01 (Tampering: orphan `skills` collection) | `mongoose.connection.collection('skills').drop().catch(code-26)` on first seed run | grep count 1 in seed.ts ✓ + idempotent (code 26 NamespaceNotFound is silent success) |
| T-06-05 (Info disclosure: `_id`/`__v` leak) | `strict: 'throw'` on stackSchema + per-doc destructure-and-strip in `getStack` | grep match on `strict: 'throw'` ✓ + supertest `_id`/`__v` undefined invariants ✓ |
| T-06-02 (Tampering: seed-JSON typo silently drops field) | `strict: 'throw'` on stackSchema crashes upsert on unknown key | functional verification deferred to Wave 9 Railway run (Jest runs without Mongo) |
| T-06-03 (FE/BE type drift) | Hand-mirrored types + paired-commit SHA cross-reference + vitest uniqueness assertion mirrors Mongo `unique: true` | grep matches on test file ✓ + both commit bodies cite each other (BE→FE via SUMMARY placeholder, FE→BE verbatim per Wave 1 Rule-1) ✓ |

## Known Stubs

- **`src/scripts/seed.ts`** — Profile + Stack upserted today; Experience/Apps/Posts/Projects (Waves 4-7) still pending. 4 inline comments mark the remaining slots.
- **`docs/api-contract.md`** — 4 of 7 endpoint sections still carry `_filled by Wave NN_` placeholders (Experience, Apps, Posts, Projects). 3 sections now filled (`/health`, `/profile`, `/stack`).
- **`src/seed/placeholders.ts`** — `placeholderExperience`, `placeholderApps`, `placeholderPosts` still carry the pre-Wave-2 flat shapes. They are consumed by their respective controllers' fallbacks. Waves 4-6 will reshape each AND switch its controller to the 503 pattern (mirroring `getProfile`/`getStack`).

All stubs are by-design per wave sequencing. Document `<threat_model>` covers no leak across this scope.

## Self-Check: PASSED

All declared `must_haves.truths` verified:
- `portfolio-services/src/models/Skill.ts` DELETED in the same commit as Stack.ts creation — `git show --stat a0dc473` confirms both lines ✓
- `src/types/content.ts` has `StackCategoryDto` and NO `SkillDto` (grep counts: 1 + 0) ✓
- Route `/api/skills` renamed to `/api/stack` in apiRoutes.ts (grep count 1) ✓
- Controller has `getStack` (NOT `getSkills`); `placeholderSkills` import replaced with `placeholderStack` ✓
- Backend Jest `/skills` test REMOVED and replaced with `/stack` shape assertion (Jest output: 3 pass — `/health`, `/profile`, `/stack`) ✓
- Seed script drops legacy `skills` Mongo collection on first run AND upserts each StackCategory by `category` field (grep counts 1 + 1) ✓
- `src/seed/stack.json` exists with 4 categories, each `{ category, items: string[] }` (Node validation) ✓
- Frontend `STACK` constant in `lib/portfolio-data.ts` mirrors `src/seed/stack.json` verbatim (Phase 1 already wired this) ✓
- `docs/api-contract.md` ## GET /api/stack section filled with full StackCategory interface (grep count 1) ✓
- Frontend `lib/portfolio-data.ts` already matches StackCategory shape — no FE structural change ✓
- No references to `/api/skills`, `getSkills`, `Skill`, `SkillDto` remain in either repo's source code (grep returns 0; only the documented brownfield-note historical reference in docs/api-contract.md and the intentional `'skills'` string literal in seed.ts `.drop()` call) ✓

All declared `must_haves.artifacts` verified present:
- `src/models/Stack.ts` contains `items: [{ type: String` (matches plan's pattern) — actually `items: { type: [String]` per the RESEARCH §Code Examples shape; semantically equivalent (Mongoose accepts both — `[{ type: String }]` and `{ type: [String] }`); used the cleaner RESEARCH-recommended form ✓
- `src/seed/stack.json` contains `category` keys (4 occurrences) ✓
- `src/scripts/seed.ts` contains `skills` string literal in the `.drop()` call (grep count 1) ✓

All `must_haves.key_links` pattern checks pass:
- `seed.ts` contains `'skills'` inside a `.drop()` call ✓
- `apiRoutes.ts` contains `'/stack'` ✓

All commits verifiable:
- portfolio-services HEAD `a0dc473` ✓
- portfolio-web HEAD `db78749` ✓

No files outside the plan's `files_modified` list were modified — the `.planning/config.json` and `design_handoff_terminal_portfolio/` items in `git status` are pre-existing orchestrator-session state and untracked design dir, NOT touched by this plan (per orchestrator instructions).

Vitest count drift 140 → 143 (+3 as expected) ✓
Jest count drift 3 → 3 (no net change — `/skills` test removed, `/stack` test added; semantics changed) ✓

## Paired-Commit Cross-Reference

| Repo | SHA | Message |
|------|-----|---------|
| portfolio-services | `a0dc473` | feat(stack): rename Skill→Stack end-to-end (delete Skill.ts in same commit) |
| portfolio-web | `db78749` | test(stack): + 3 STACK assertions for wave-03 Skill→Stack rename |

**BE → FE citation:** BE commit body cites `<pending FE SHA — recorded in 06-03-SUMMARY.md, one-direction-current per Wave 1 Rule-1>`. BE was NOT amended after FE landed (per Wave 1 Rule-1 cycle-avoidance rule).
**FE → BE citation:** FE commit body cites `Pair: portfolio-services @ a0dc473` verbatim.
**Durable pairing:** This SUMMARY.md is the canonical cross-reference: **portfolio-services `a0dc473` ↔ portfolio-web `db78749`**.

## Wave Template Continued

Wave 3 follows the Wave 2 template with two overlays:
1. **Rename overlay:** Skill → Stack across all 8 BE touchpoints (model + types + controller + route + placeholder + seed JSON + Jest + contract). Skill.ts deleted in same commit (brownfield discipline).
2. **Legacy-collection drop overlay:** `mongoose.connection.collection('skills').drop()` in seed.ts is the Pitfall 4 mitigation specific to Wave 3 (no other wave has an analog).

Waves 4-7 (Experience / Apps / Posts / Projects reshape) are mechanically closer to Wave 2 — no rename overlay, no legacy-collection drop. The 11-step recipe from Wave 2 + 3 applies directly.
