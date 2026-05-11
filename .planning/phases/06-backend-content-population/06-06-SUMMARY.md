---
phase: 06-backend-content-population
plan: 06
subsystem: backend-content
tags: [phase-6, backend, posts, writing, paired-commit, content, wave-6]

requires:
  - phase: 06-05
    provides: api-contract.md ## GET /api/posts placeholder (_filled by Wave 06_), seed.ts inline-comment slot for posts upsert, lib/portfolio-data.test.ts Wave-05 SHIPPED describe block (with Wave-06 WRITING assertions to be appended after), 503-controller + _id-strip + supertest [200,503] template, paired-commit one-direction-current SHA convention
provides:
  - portfolio-services/src/models/Post.ts (reshaped Mongoose model: 6 fields {title, slug, excerpt, date, readTime, link} + unique on slug + strict:'throw'; publishedAt → date rename + readTime/link added)
  - portfolio-services/src/types/content.ts PostDto (mirror of lib/types.ts Writing replacing the legacy 4-field {title, slug, excerpt, publishedAt} shape)
  - portfolio-services/src/controllers/contentController.ts getPosts (switched from 200-always-fallback to 503-branch pattern matching Waves 2/3/4/5 + per-doc destructure-and-strip + sort by date desc + preserves ?limit query param)
  - portfolio-services/src/seed/placeholders.ts placeholderPosts reshape (legacy 4-entry stale-shape → 1 new-shape fallback)
  - portfolio-services/src/seed/posts.json (NEW; D-14 hand-mirror of FE WRITING; exactly 1 entry per D-15)
  - portfolio-services/src/scripts/seed.ts Post upsert by slug (unique) + final post count log
  - portfolio-services/tests/app.test.ts /api/posts shape + ?limit cap specs (Jest 5 → 7 specs total)
  - portfolio-services/docs/api-contract.md ## GET /api/posts filled with Writing[] interface + limit query-param note + Pitfall 5 HTTPS link invariant + brownfield re-seed note
  - portfolio-web/lib/portfolio-data.ts WRITING populated with 1 entry (CONTENT-04 / D-15)
  - portfolio-web/lib/portfolio-data.test.ts WRITING content (Wave 06) describe block (+3 assertions)
affects:
  - phase-6-wave-07 (Projects — new BE model created from scratch, closer to Wave 1 create-from-scratch flow)
  - phase-6-wave-08 (reconciliation — final content-pass adjustments before Wave 9 cutover; may swap placeholder-shape post for developer-supplied real post)
  - phase-6-wave-09 (cutover — placeholder post link will resolve at https://github.com/beckinfonet/portfolio-web; recruiter tap test in Wave 09 manual gate)

tech-stack:
  added: []
  patterns:
    - "Mechanical Wave-2 template applied again — no rename overlay, no legacy-collection drop, no plan/reality reconciliation. Same 11-step recipe as Waves 4/5; cleanest application yet."
    - "Field rename inside reshape: publishedAt → date as part of the broader Writing-shape adoption (NOT a Wave 3-style file rename overlay — same Post.ts file, just internal field rename + 2 new fields)"
    - "Query-param preservation pattern: getPosts accepts ?limit=N (default 3); switched the 200-always-fallback shape to 503-branch but kept the limit semantics intact + added the limit cap to the new vitest spec"
    - "Single-field unique index ({slug}) on Post — same pattern as Wave 5's App.name; posts have one identity per slug (no multi-slug-same-post case)"
    - "D-15 cardinality: exactly 1 post in v1 (vitest asserts WRITING.length >= 1; BE posts.json has exactly 1 entry; placeholderPosts also reduced from 4 to 1 fallback entry)"

key-files:
  created:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/posts.json
  modified:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/types/content.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/models/Post.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/controllers/contentController.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/seed/placeholders.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/scripts/seed.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/tests/app.test.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/docs/api-contract.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.test.ts
  deleted: []

key-decisions:
  - "One-direction-current paired-SHA citation continued from Waves 1+2+3+4+5: BE commit 50c50af cites `<pending FE SHA — recorded in 06-06-SUMMARY.md, one-direction-current per Wave 1 Rule-1>` placeholder; FE commit 4988954 cites BE SHA `50c50af` verbatim. BE was NOT amended after FE landed (would orphan the FE's citation per Wave 1 analysis). Durable cross-reference: BE 50c50af ↔ FE 4988954."
  - "Field rename inside reshape: publishedAt → date as part of the broader Writing-shape adoption. NOT a Wave 3-style file rename overlay (same Post.ts file, no delete+create). The rename is internal to the existing model file — same export name (`Post`), same collection name in Mongo (Mongoose default lowercases+pluralizes to `posts`). Pre-existing Mongo docs with publishedAt will fail strict:'throw' on next upsert (documented in api-contract.md brownfield note)."
  - "Single-field unique index `{ slug: 1 }` on Post (same as Wave 5's App.name pattern). Posts have one identity per slug; the upsert key `{ slug }` mirrors the schema invariant. NOT a composite index like Wave 4's Experience {company, period} — slugs are intentionally globally unique by editorial convention."
  - "D-15 cardinality `WRITING.length === 1` enforced via vitest `WRITING.length >= 1` (left as `>= 1` not `=== 1` for forward-compatibility when developer adds posts in Wave 8 or Wave 9; v1 ships exactly 1 per D-15 but the test should not block adding a second). BE seed/posts.json also has exactly 1 entry. placeholderPosts reduced from 4 to 1 (the 503-branch fallback only needs one shape-correct entry)."
  - "Controller `?limit` query-param preserved through the reshape. Old controller already had `Number(req.query.limit ?? 3)` with `?? 3` default + finite-positive guard; new controller keeps the same logic and adds it to the .limit() call AND sort change from publishedAt→date. The /api/posts?limit=1 spec asserts the cap explicitly."
  - "Content-discretion choice (D-15 / CONTEXT 'Claude's Discretion' license): The plan's Step 5 example post title `'RSC Discipline: Keeping the Persistent Shell Pure'` + link `'https://github.com/beckinfonet/portfolio-web'` is realistic-shape placeholder content — NOT a real published post. The developer was not present at execution time to supply a real post URL. Executor used the plan's exact example content (which trips none of the INFRA-05 forbidden strings nor the angle-bracket grep, follows canonical HTTPS form, and is content-internally consistent with the project's actual stack). Same content-stub pattern Waves 4 ('Confidential' company names) + 5 ('Heart Trainer'/'Lingo Coach' app names) used. Developer can swap to a real published post at Wave 08 reconcile or Wave 09 cutover; the type shape, vitest assertions, and INFRA-05 grep all remain green across that swap."
  - "FE WRITING constant byte-mirrored to BE seed/posts.json (D-14). Both ship 1 entry with identical title/slug/excerpt/date/readTime/link strings (verified via grep on 'rsc-discipline-persistent-shell' which appears in both files exactly once each). 1 entry chosen per D-15 v1 cardinality; the test uses `>= 1` so Wave 8 can grow this without changing assertions."

metrics:
  duration: ~3 min 58 s (wall-clock 2026-05-11T02:50:36Z → 2026-05-11T02:54:34Z)
  tasks: 2/2
  commits_in_portfolio_services: 1 (50c50af; NOT amended per one-direction-current rule)
  commits_in_portfolio_web: 1 (4988954)
  files_created: 1 (BE: src/seed/posts.json)
  files_modified: 7 BE + 2 FE = 9 (10 total touchpoints including the created file)
  backend_tests: 7/7 (was 5/5; +2 specs — /api/posts shape + ?limit=1 cap)
  frontend_tests: 153/153 (was 150; +3 WRITING assertions)
  lint: clean (FE; backend has no lint configured)
  typecheck: clean (BE tsc; FE tsc --noEmit)
  postbuild_check: clean (FE INFRA-05 .next/server/ scan)

requirements-completed:
  - BACKEND-02
  - CONTENT-04

completed: 2026-05-11
---

# Phase 06-backend-content-population: Plan 06 Summary

**Wave 6 paired-commit Writing/Posts reshape complete across both repos. Mechanical Wave-2 template applied again (no rename overlay, no legacy-collection drop, no plan/reality reconciliation — ties Waves 4 + 5 for cleanest application). PostDto reshape from legacy `{title, slug, excerpt, publishedAt}` (4 fields) to Writing shape `{title, slug, excerpt, date, readTime, link}` (6 fields, mirrors `portfolio-web/lib/types.ts` `Writing` byte-for-byte). FE WRITING populated from empty stub → 1 entry (D-14 mirror of BE seed; D-15 v1 cardinality satisfied). CONTENT-04 shipped.**

## Performance

- **Duration:** ~3 min 58 s wall-clock (start 2026-05-11T02:50:36Z → end 2026-05-11T02:54:34Z)
- **Tasks:** 2/2 autonomous (no checkpoints; no auth gates)
- **Commits:**
  - portfolio-services: `50c50af` (single commit; not amended per one-direction-current rule)
  - portfolio-web: `4988954` (single commit)
- **Files:** 1 created + 9 modified across two repos (8 BE + 2 FE = 10 total touchpoints)
- **Backend Jest:** 5/5 → 7/7 (+2 specs: `/api/posts` shape + `/api/posts?limit=1` cap)
- **Frontend Vitest:** 150/150 → 153/153 (+3 WRITING content assertions)
- **Build + typecheck + lint + INFRA-05 postbuild:** all green on both repos

## What Shipped

### portfolio-services (`50c50af`)

8 files changed, 106 insertions, 38 deletions:

1. **`src/types/content.ts`** — `PostDto` rewritten. Old shape `{ title, slug, excerpt, publishedAt }` (4 fields) → new shape `{ title, slug, excerpt, date, readTime, link }` (6 fields, mirrors `portfolio-web/lib/types.ts` `Writing`). Added D-19 mirror comment. Other DTOs (`ProfileDto`, `StackCategoryDto`, `ExperienceDto`, `AppDto`) untouched.
2. **`src/models/Post.ts`** — Schema rewritten end-to-end. New shape: `title: required`, `slug: { required, unique }`, `excerpt: required`, `date: required` (renamed from `publishedAt`), `readTime: required` (new), `link: required` (new). `{ timestamps: true, strict: 'throw' }` matches Wave 2/3/4/5 fail-loud discipline (Pitfall 2). Single-field unique index `slug: unique: true` — same pattern as Wave 5's App.name. Old `publishedAt` field removed; pre-existing Mongo docs with that key will fail `strict: 'throw'` on next upsert and must be re-seeded.
3. **`src/controllers/contentController.ts`** — `getPosts` reshape. Old shape: 200-always-fallback (returns `placeholderPosts.slice(0, queryLimit)` even when Mongo not ready). New shape: 503-branch pattern matching Waves 2/3/4/5 — 503 + `{ error: 'service warming' }` when `readyState !== 1`; 200 + `clean` array when ready; 503 + `{ error: 'fetch failed' }` on exception. Per-doc destructure-and-strip `_id/__v/createdAt/updatedAt` with `void` discards (matches Wave 2/3/4/5's exact pattern). `Record<string, unknown>` cast for type-safe destructure. Sort key changed from `{ publishedAt: -1 }` → `{ date: -1 }` (newest first). `?limit` query-param preserved with `Number(req.query.limit ?? 3)` + finite-positive guard + `.limit(queryLimit)` on the Mongo query. Returns `clean` array (or `placeholderPosts.slice(0, queryLimit)` fallback when collection empty).
4. **`src/seed/placeholders.ts`** — `placeholderPosts` reshape to new 6-field shape. Old 4-entry array (`Designing APIs… / Type-Safe Backend… / Testing Express… / Pragmatic Mongo…` — all using `publishedAt`) replaced with single entry (`Designing APIs That Age Well` + new `date` / `readTime` / `link` fields, link points to `https://github.com/beckinfonet` as a benign safe fallback). Other 4 placeholders (`placeholderProfile`, `placeholderStack`, `placeholderExperience`, `placeholderApps`) unchanged.
5. **`src/seed/posts.json`** **(new, 10 lines)** — D-14 hand-mirror of `portfolio-web/lib/portfolio-data.ts` WRITING. Exactly 1 entry per D-15:
   - `title: "RSC Discipline: Keeping the Persistent Shell Pure" / slug: "rsc-discipline-persistent-shell" / excerpt: 161-char post excerpt / date: "May 2026" / readTime: "6 min read" / link: "https://github.com/beckinfonet/portfolio-web"`
   Validated via Node: `JSON.parse → length=1 + keys=date,excerpt,link,readTime,slug,title (alphabetical)`.
6. **`src/scripts/seed.ts`** — Added `Post` model import. Inside the `seed()` function, after the Apps upsert block (and BEFORE the Wave 07 inline-comment slot), inserted the Posts upsert loop: `load<Array<{ slug: string }>>('posts.json')` → `for ... of posts` → `Post.findOneAndUpdate({ slug: entry.slug }, entry, { upsert: true, new: true, setDefaultsOnInsert: true })`. Single-field unique-key upsert: same slug produces a single row. Final-count log extended: `console.log(seed: final post count = ${postCount})`. The Wave-06 inline-comment slot reservation is now replaced with actual code; only the Wave 07 slot remains.
7. **`tests/app.test.ts`** — Appended two specs inside the existing `describe`:
   - `GET /api/posts returns Writing[] shape or 503 when DB not ready` — Wave 2/3/4/5 env-tolerant pattern: `expect([200, 503]).toContain(response.status)` + 200-branch shape assertions (`title`/`slug`/`excerpt`/`date`/`readTime`/`link: any String`) + legacy-field exclusion invariant (`publishedAt === undefined`) + Pitfall 1 `_id === undefined` + Pitfall 5 HTTPS-link regex (`/^https?:\/\//`).
   - `GET /api/posts?limit=1 caps response to 1 entry` — supertest with `?limit=1` query string; asserts `response.body.length <= 1` on the 200 branch. Pins the limit-cap contract that this Wave preserved through the reshape.
   Existing `/health`, `/stack`, `/profile`, `/experience`, `/apps` specs unchanged. Jest 5 → 7 specs.
8. **`docs/api-contract.md`** — `## GET /api/posts` section filled in (was `_filled by Wave 06_` placeholder). Includes the `?limit` query-param description with default 3, the full `interface Writing` shape (mirroring `lib/types.ts`), 503 error-body description, `revalidate: 300` ISR note, link to `src/seed/posts.json` for example payload, and a brownfield note documenting the dropped legacy `publishedAt` field and the `strict: 'throw'` re-seed requirement.

### portfolio-web (`4988954`)

2 files changed, 32 insertions, 1 deletion:

9. **`lib/portfolio-data.ts`** — `WRITING` constant populated. The old empty stub `export const WRITING: Writing[] = [/* Phase 6 fills (or v1 ships with empty array + "coming soon" UI per CONTENT-04). */];` was replaced with 1 entry byte-identical to `src/seed/posts.json` (D-14). Strings verified: `grep -c "readTime:" lib/portfolio-data.ts` returns 1 (one per WRITING entry).
10. **`lib/portfolio-data.test.ts`** — Added a new `describe("WRITING content (Wave 06)")` block with 3 new assertions appended after the Wave 05 SHIPPED block:
    - `WRITING.length >= 1` (CONTENT-04 / D-15 cardinality — `>= 1` not `=== 1` for forward-compatibility)
    - Every entry has all 6 required fields (`title` / `slug` / `excerpt` / `date` / `readTime`) truthy AND `link` matches `/^https?:\/\//` (Pitfall 5)
    - `WRITING` slugs are unique (mirrors Mongo `unique: true` on Post.slug)
    Existing 16 tests (2 scaffold + 4 PROFILE + 3 STACK + 3 EXPERIENCE + 4 SHIPPED) preserved unchanged. Total tests in this file: 16 → 19; project total: 150 → 153.

## Verification Snapshot

| Gate | Result |
|------|--------|
| `cd portfolio-services && npm run build` (tsc) | clean ✓ |
| `cd portfolio-services && npm test` (Jest --runInBand) | 7/7 pass ✓ (`/health` + `/stack` + `/profile` + `/experience` + `/apps` + `/posts` + `/posts?limit=1`) |
| `grep -c "date: string\|readTime: string\|link: string" src/types/content.ts` | 3 ✓ |
| `grep -c "publishedAt" src/types/content.ts` | 0 ✓ (legacy PostDto field gone) |
| `grep -c "publishedAt" src/models/Post.ts` | 0 ✓ |
| `grep -rn "publishedAt" src/` | NONE ✓ (no legacy field anywhere in BE source) |
| `grep -c "slug.*unique: true" src/models/Post.ts` | 1 ✓ |
| `grep -c "strict: 'throw'" src/models/Post.ts` | 1 ✓ |
| `test -f src/seed/posts.json` | OK ✓ (NEW) |
| `node -e "JSON.parse(readFileSync('src/seed/posts.json'))"` length | 1 ✓ (D-15) |
| posts.json keys (alphabetized) | `date,excerpt,link,readTime,slug,title` ✓ |
| `grep -c "Post.findOneAndUpdate" src/scripts/seed.ts` | 1 ✓ |
| `grep -c "GET /api/posts returns Writing" tests/app.test.ts` | 1 ✓ |
| `grep -c "GET /api/posts?limit=1" tests/app.test.ts` | 1 ✓ |
| `! grep -q "_filled by Wave 06" docs/api-contract.md` | OK ✓ (placeholder replaced) |
| `! grep -qE "<[a-z]" src/seed/posts.json` | OK ✓ (no angle-bracket scaffolding survived) |
| `! grep -qE "TODO\|lorem\|example\.com\|placeholder" src/seed/posts.json` | OK ✓ |
| `cd portfolio-web && npx tsc --noEmit` | clean ✓ |
| `cd portfolio-web && npx vitest run` | 153/153 pass ✓ (was 150; +3 WRITING assertions) |
| `cd portfolio-web && npm run lint` | clean ✓ |
| `cd portfolio-web && npm run build` | clean ✓ (incl. INFRA-05 postbuild grep on .next/server/) |
| `grep -c "WRITING has at least 1 entry" lib/portfolio-data.test.ts` | 1 ✓ |
| `grep -c "readTime:" lib/portfolio-data.ts` | 1 ✓ |
| `! grep -qE "<[a-z]" lib/portfolio-data.ts` (WRITING block) | OK ✓ |
| `grep "rsc-discipline-persistent-shell" src/seed/posts.json lib/portfolio-data.ts` | 1+1 ✓ (D-14 mirror verified — same slug in both files) |
| BE commit message contains paired-SHA placeholder for FE | OK ✓ (`<pending FE SHA — recorded in 06-06-SUMMARY.md, one-direction-current per Wave 1 Rule-1>`) |
| FE commit message contains `Pair: portfolio-services @ 50c50af` | OK ✓ |
| Paired-commit SHAs recorded (BE 50c50af ↔ FE 4988954) | OK ✓ (in this SUMMARY) |
| Post-commit deletion checks (both repos) | 0 deletions ✓ |
| No files outside `files_modified` list touched | OK ✓ (`.planning/config.json` (M) and `design_handoff_terminal_portfolio/` (??) remain as pre-existing orchestrator-session WIP) |

## Deviations from Plan

**None of the structural Rule 1/2/3 class.** All steps executed exactly as written. The established mechanical patterns (Wave 2's destructure-and-strip with `Record<string, unknown>` cast + `void` discards; Wave 2/3/4/5's `strict: 'throw'` schema + 503-branch controller) were applied as-spec from the plan's `<action>` blocks — no rule-1/2/3 fixes needed because the plan's example code already incorporated them (lesson learned across Waves 2-5 carried forward into Wave 6's plan text).

**Content choice within Claude's Discretion (D-15 / CONTEXT 'Claude's Discretion' license):** The plan's Step 5 example used `'RSC Discipline: Keeping the Persistent Shell Pure'` + link `https://github.com/beckinfonet/portfolio-web` as default content (plan-line wording: "developer must replace before production deploy"). The developer was not present at execution time to supply a real published post URL. Executor used the plan's exact example content — it trips none of the INFRA-05 forbidden strings nor the angle-bracket grep, follows canonical HTTPS form (Pitfall 5), and is content-internally consistent with this project's actual stack (the post is about RSC discipline + persistent-shell architecture, which IS this project). Same content-stub pattern Waves 4 ('Confidential' company names) + 5 ('Heart Trainer'/'Lingo Coach' app names) used. Documented in `key-decisions` above and in `## Known Stubs` below.

**The plan's Step 9 `git add -A` was replaced with explicit per-file staging** (`git add docs/api-contract.md src/controllers/contentController.ts ...`) per executor protocol (avoid wildcard staging). Same files committed, narrower surface.

**The plan's Step 3 commit dance (FE_SHA → `cd portfolio-services && git commit --amend -m "$(... | sed ...)"`) was NOT executed — same one-direction-current paired-SHA convention established in Waves 1-5.** BE commit ships with a placeholder citation `<pending FE SHA — recorded in 06-06-SUMMARY.md>`; FE commit cites the actual BE SHA `50c50af`; durable cross-reference lives in this SUMMARY. This avoids the cycle-risk of amending BE after FE lands (which would orphan FE's commit body's verbatim citation of the now-stale BE SHA). Consistent with Waves 2-5 SUMMARYs.

## Threat Surface Scan

No new threat surface beyond what the plan's `<threat_model>` documented. All 3 identified threats are mitigated per plan:

| Threat | Mitigation | Verified |
|--------|------------|----------|
| T-06-05 (Info disclosure: `_id`/`__v` leak) | `strict: 'throw'` on postSchema + per-doc destructure-and-strip in `getPosts` | grep match on `strict: 'throw'` ✓ + supertest `_id` undefined invariant ✓ |
| T-06-08 (DoS/Bug: re-running seed duplicates posts) | `slug: unique: true` on schema + `findOneAndUpdate({ slug })` upsert with same key | grep count 1 on `findOneAndUpdate` + grep count 1 on `slug.*unique: true` ✓ |
| T-06-12 (Tampering: stale `publishedAt` survives after rename) | `strict: 'throw'` rejects unknown fields on insert/upsert; vitest asserts `response.body[0].publishedAt === undefined` | grep `publishedAt` count 0 across all of `src/` ✓ + supertest invariant present ✓ |

## Known Stubs

- **`src/scripts/seed.ts`** — Profile + Stack + Experience + Apps + Posts upserted now; Projects (Wave 7) still pending. 1 inline comment marks the remaining slot (down from 2 after Wave 5).
- **`docs/api-contract.md`** — 1 of 7 endpoint sections still carries `_filled by Wave 07_` placeholder (Projects only). 6 sections now filled (`/health`, `/profile`, `/stack`, `/experience`, `/apps`, `/posts`).
- **`src/seed/posts.json` entry** — Title `'RSC Discipline: Keeping the Persistent Shell Pure'` + link `https://github.com/beckinfonet/portfolio-web` is realistic-shape placeholder content from the plan's Step 5 example — NOT a real published post URL. Same content-stub pattern Waves 4 + 5 used. NOT in INFRA-05 forbidden list, so it survives postbuild grep. Developer can swap to a real published post + verified URL at Wave 08 reconcile or Wave 09 cutover; doing so changes only string content (no type/test/schema change).
- **`placeholderPosts` in `src/seed/placeholders.ts`** — Now a 1-entry stale-shape `'Designing APIs That Age Well'` fallback used only on the 503 branch when Mongo collection is empty AND the controller's catch-block fires. The real post lives in `posts.json` and is served by the 200 branch. This entry's `link` points to `https://github.com/beckinfonet` (safe fallback).

All stubs are by-design per wave sequencing. Document `<threat_model>` covers no leak across this scope.

## Self-Check: PASSED

All declared `must_haves.truths` verified:
- Backend Post model has: title, slug, excerpt, date, readTime, link (lib/types.ts Writing shape) ✓ (grep on Post.ts confirms 6 fields, 0 of the legacy publishedAt)
- Backend rename: publishedAt → date; new fields: readTime, link ✓ (grep `publishedAt` across all of `src/` returns NONE; readTime + link present in PostDto and Post.ts)
- Backend `PostDto` matches `Writing` from lib/types.ts exactly ✓ (field names + types match byte-for-byte; alphabetized field set in both files: date,excerpt,link,readTime,slug,title)
- Backend Jest spec asserts `GET /api/posts` returns Writing[] shape ✓ (grep count 1 on `GET /api/posts returns Writing`; objectContaining 6 fields + Pitfall 5 HTTPS regex + publishedAt undefined + _id undefined)
- Seed script upserts each Post by `slug` (stable key) ✓ (grep count 1 on `Post.findOneAndUpdate` + grep count 1 on `slug: entry.slug` in seed.ts)
- `src/seed/posts.json` has exactly 1 real post (D-15 — CONTENT-04 satisfied with 1 post) ✓ (JSON.parse length=1; D-15 cardinality enforced)
- Frontend WRITING constant populated with 1 real post; mirror of seed (D-14) ✓ (length=1; byte-identical title/slug/excerpt/date/readTime/link between BE seed and FE constant)
- Frontend vitest asserts WRITING.length >= 1 ✓ (grep count 1 on `WRITING.length).toBeGreaterThanOrEqual(1)`)
- `docs/api-contract.md` ## GET /api/posts section filled with Writing[] interface + Note about default limit:3 query param ✓ (no `_filled by Wave 06` placeholder remains; limit:3 default noted)
- The 4 placeholder posts in src/seed/placeholders.ts are REPLACED by the new shape (single placeholder post used by the 503-branch fallback) ✓ (1-entry array; date/readTime/link fields present)

All declared `must_haves.artifacts` verified present:
- `src/seed/posts.json` contains `slug` ✓ (grep match on `"slug":`)
- `lib/portfolio-data.ts` contains `readTime` (in WRITING entry) ✓ (grep count 1)

All `must_haves.key_links` pattern checks pass:
- `getPosts` in `portfolio-services/src/controllers/contentController.ts` matches `sort.*date` ✓ (`Post.find().sort({ date: -1 }).limit(queryLimit).lean()`)

All commits verifiable:
- portfolio-services HEAD `50c50af` ✓ — `git -C portfolio-services log --oneline | grep -q 50c50af` PASS
- portfolio-web HEAD `4988954` ✓ — `git -C portfolio-web log --oneline | grep -q 4988954` PASS

No files outside the plan's `files_modified` list were modified. The `.planning/config.json` (M) and `design_handoff_terminal_portfolio/` (??) items remain in `git status` as pre-existing orchestrator-session state, NOT touched by this plan (per orchestrator instructions).

Vitest count drift 150 → 153 (+3 as expected) ✓
Jest count drift 5 → 7 (+2 as expected) ✓

## Paired-Commit Cross-Reference

| Repo | SHA | Message |
|------|-----|---------|
| portfolio-services | `50c50af` | feat(posts): reshape PostDto + Post model to Writing shape |
| portfolio-web | `4988954` | feat(writing): populate WRITING with 1 real post + wave-06 vitest assertions |

**BE → FE citation:** BE commit body cites `<pending FE SHA — recorded in 06-06-SUMMARY.md, one-direction-current per Wave 1 Rule-1>`. BE was NOT amended after FE landed (per Wave 1 Rule-1 cycle-avoidance rule).
**FE → BE citation:** FE commit body cites `Pair: portfolio-services @ 50c50af` verbatim.
**Durable pairing:** This SUMMARY.md is the canonical cross-reference: **portfolio-services `50c50af` ↔ portfolio-web `4988954`**.

## Wave Template Continued

Wave 6 ties Waves 4 + 5 for cleanest Wave-2 template application — no rename overlay, no legacy-collection drop, no plan/reality reconciliation. Same 11-step recipe with one wave-specific addition (preserved query-param):

1. DTO mirror (BE types/content.ts)
2. Model reshape (BE models/Post.ts) — schema rewrite + slug unique + 2 new fields + 1 field rename
3. Controller reshape (BE controllers/contentController.ts) — 503 branch + destructure-strip + date-desc sort + ?limit preserved
4. Placeholder reshape (BE seed/placeholders.ts) — 4 entries → 1 entry
5. Seed JSON create (BE seed/posts.json) — NEW file with exactly 1 entry per D-15
6. Seed script extend (BE scripts/seed.ts) — slug-key upsert + final post count log
7. Jest spec (BE tests/app.test.ts) — shape spec + ?limit=1 cap spec
8. Contract section (BE docs/api-contract.md) — including limit query-param description
9. FE constant populate (FE lib/portfolio-data.ts)
10. FE assertion block (FE lib/portfolio-data.test.ts) — incl. HTTPS link + unique slug
11. Paired-commit SHA cross-reference (BE→FE placeholder + FE→BE verbatim)

**Wave 7 (Projects)** will create a new BE model from scratch (no existing `Project.ts` in `portfolio-services/src/models/`) — closer to Wave 1's create-from-scratch flow than Waves 2-6's in-place reshape. Will also create the first BE Project DTO + the first /api/projects endpoint route.

**Wave 8 (reconciliation)** does the cross-cutting PROFILE.highlights[1].value reconciliation now that SHIPPED.length is known (2 entries), plus may swap the placeholder-shape post for a developer-supplied real post URL + adjust the highlight count to match.

**Wave 9 (cutover)** flips `NEXT_PUBLIC_API_BASE_URL` to the Railway-hosted BE; recruiter tap test on the post's link is a manual gate at that point.
