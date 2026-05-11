---
phase: 06-backend-content-population
plan: 01
subsystem: backend-infra
tags: [phase-6, backend, infrastructure, wave-0, paired-commit]

requires:
  - phase: 05-08
    provides: Phase 5 close-out verdict PASS; clean working tree on both repos
provides:
  - portfolio-services/scripts/check-backend.mjs (D-11 smoke gate)
  - portfolio-services/src/scripts/seed.ts (D-13 stub; waves 02-07 extend)
  - portfolio-services/docs/api-contract.md (BACKEND-03 skeleton; 7 H2 endpoint headers)
  - portfolio-services/package.json (+ npm run seed + npm run smoke)
  - portfolio-services/src/config/database.ts (mongoose connection.on('error') log surface)
  - portfolio-web/scripts/check-resume-pdf.mjs (CONTENT-05 gate — fail-loud until Wave 8)
  - portfolio-web/lib/portfolio-data.test.ts (Vitest scaffold; waves 02-07 extend)
affects:
  - phase-6-wave-02 (consumes seed.ts upsert slot, api-contract.md profile section)
  - phase-6-wave-03 (consumes seed.ts skills-drop slot, api-contract.md stack section)
  - phase-6-wave-04 (consumes seed.ts, api-contract.md experience section)
  - phase-6-wave-05 (consumes seed.ts, api-contract.md apps section)
  - phase-6-wave-06 (consumes seed.ts, api-contract.md posts section)
  - phase-6-wave-07 (consumes seed.ts, api-contract.md projects section)
  - phase-6-wave-08 (flips check-resume-pdf.mjs from FAIL→PASS)
  - phase-6-wave-09 (runs check-backend.mjs against Railway production URL)

tech-stack:
  added: []
  patterns:
    - "Zero-dep .mjs smoke script idiom (stdlib only — fs, node:fs, fetch) for both repos"
    - "Wave 0 fail-loud gate convention: scaffold scripts that intentionally exit non-zero until later waves ship their backing artifact"
    - "Paired-commit cross-reference via 'Pair: <repo> @ <SHA>' commit-body trailer (D-19)"
    - "Mongoose connection.on('error') log surface for Railway-side observability"
    - "Vitest scaffold pattern: minimum 2 always-green assertions seeded; later waves add per-type assertions to the same file"

key-files:
  created:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/scripts/check-backend.mjs
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/scripts/seed.ts
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/docs/api-contract.md
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/scripts/check-resume-pdf.mjs
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-web/lib/portfolio-data.test.ts
  modified:
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/package.json
    - /Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/config/database.ts

key-decisions:
  - "Wave 0 ships the scaffolding only — BACKEND-03 / BACKEND-04 / CONTENT-05 are NOT marked complete in REQUIREMENTS.md; later waves (02-09) fully satisfy them. check-resume-pdf.mjs and check-backend.mjs intentionally exit non-zero today and flip green automatically as later waves ship."
  - "Paired-commit cross-reference is one-direction-current: BE commit cites the CURRENT FE SHA (verified by acceptance gate); FE commit cites the original (pre-amend) BE SHA. Perfect bidirectional citation is impossible with git's content-addressable hashing — every BE amend rotates the hash, which would force a corresponding FE amend, which rotates the FE hash, ad infinitum. The plan's acceptance gate only checks BE→FE; that direction is current."
  - "Used `_filled by Wave NN_` (markdown italic) as the placeholder convention in api-contract.md instead of literal `TODO`. INFRA-05 prebuild grep enforces no-uppercase-TODO; even though the doc file is not part of the .next/server/ build output, keeping the convention consistent avoids accidental future regression."
  - "scripts/check-resume-pdf.mjs checks BOTH canonical filename (public/Bakytbek_Tatibekov_Resume.pdf) AND legacy filename (public/resume.pdf) so Wave 8 can rename without coordinating a script update."
  - "Mongoose connection.on('error') log surface uses `console.error('mongo:', err.message)` — single-line, prefixed so Railway log filters can grep cleanly. No structured logger pulled in (eslint-disable inline because the codebase uses console.error in tests too)."

metrics:
  duration: ~10 min (wall-clock; including baseline test runs, three commits, two amends, full verification block)
  tasks: 2/2
  commits_in_portfolio_services: 1 (final SHA e50aea5, amended twice from 0043616 → 6f3e735 → e50aea5)
  commits_in_portfolio_web: 1 (final SHA 1b0020d, amended once from 5bc9fbf → 1b0020d)
  files_created: 5
  files_modified: 2
  tests_added: 2 (Vitest count drift 134 → 136)
  backend_tests: 2/2 (unchanged — existing /health + /skills specs)
  frontend_tests: 136/136
  lint: clean (FE only — backend has no lint configured)
  typecheck: clean (FE; tsc --noEmit)

requirements-completed: []
# Intentionally empty — Wave 0 lays the scaffolding for BACKEND-03 / BACKEND-04 / CONTENT-05 but
# does not fully satisfy them. Wave 02-09 will mark them complete as the artifacts materialize.

completed: 2026-05-11
---

# Phase 06-backend-content-population: Plan 01 Summary

**Wave 0 infrastructure scaffolding: 5 new files + 2 modified across both repos. Three gate scripts intentionally fail-loud today and flip green automatically as later waves ship their backing artifacts. No production code paths touched.**

## Performance

- **Duration:** ~10 min (start 2026-05-11T02:01Z baseline → end 2026-05-11T02:11Z)
- **Tasks:** 2/2 autonomous
- **Commits:**
  - portfolio-services: `e50aea5` (amended twice; original `0043616` → `6f3e735` → `e50aea5`)
  - portfolio-web: `1b0020d` (amended once; original `5bc9fbf` → `1b0020d`)
- **Files:** 5 created + 2 modified
- **Vitest count drift:** 134 → 136 (+2)
- **Backend Jest:** 2/2 (unchanged)

## What Shipped

### portfolio-services (`e50aea5`)

5 files changed, 114 insertions, 1 deletion:

1. **`scripts/check-backend.mjs` (new, 41 lines)** — Zero-dep D-11 readiness gate. Curls 7 endpoints against `$PROD_API_URL` (defaults to `http://localhost:8080`). Per endpoint: asserts HTTP 200 + `application/json` content-type + per-endpoint shape predicate + FORBIDDEN substring scan (`/lorem|example\.com|placeholder|Product Studio/i`). Wave 9 runs this against Railway production URL. Today exits non-zero (no server listening).
2. **`src/scripts/seed.ts` (new, 22 lines)** — D-13 idempotent upsert runner stub. Imports `connectToDatabase`, connects to Mongo, logs the host, disconnects. Inline comments mark the slots Waves 02-07 each extend with one upsert block (profile, stack + legacy `skills` drop, experience, apps, posts, projects).
3. **`docs/api-contract.md` (new, 35 lines)** — BACKEND-03 skeleton. 7 H2 endpoint section headers (`## GET /api/{health,profile,stack,experience,apps,posts,projects}`). `/api/health` section body is the only filled section (`{ status: "ok" }`); the other 6 carry `_filled by Wave NN_` markdown italic placeholders. CORS-absent + read-only-public + paired-mirror frontmatter explained at the top.
4. **`package.json`** — `+ "seed": "ts-node-dev --transpile-only src/scripts/seed.ts"` and `+ "smoke": "node scripts/check-backend.mjs"`. Existing 4 entries (dev/build/start/test) unchanged.
5. **`src/config/database.ts`** — Added `mongoose.connection.on('error', (err) => console.error('mongo:', err.message))` at module scope (RESEARCH Open Question #2). Surfaces driver-level reconnect/drop events in Railway logs. The `connectToDatabase()` function body untouched.

### portfolio-web (`1b0020d`)

2 new files, 64 insertions:

6. **`scripts/check-resume-pdf.mjs` (new, 36 lines)** — CONTENT-05 gate. Checks for the resume PDF at the canonical filename (`public/Bakytbek_Tatibekov_Resume.pdf` per D-18 + Pitfall 9) OR the legacy stub path (`public/resume.pdf`). Verifies (a) existsSync, (b) size < 250KB, (c) first 5 bytes equal `%PDF-` magic. Today exits 1 with `FAIL: public/resume.pdf does not start with %PDF- magic (got: "Place")` because the public/resume.pdf file is the 50-byte ASCII stub from Phase 1. Wave 8 flips this green.
7. **`lib/portfolio-data.test.ts` (new, 28 lines)** — Vitest scaffold. 2 always-green assertions today: (a) `PROFILE.name` is non-empty, (b) all 5 dataset exports (`PROJECTS, EXPERIENCE, WRITING, SHIPPED, STACK`) are arrays. Inline comments list the per-wave extension plan (Wave 02 adds bio assertions, Wave 03 stack, Wave 04 experience, Wave 05 apps, Wave 06 posts, Wave 07 projects, Wave 08 reconciles highlights ↔ SHIPPED.length).

## Verification Snapshot

| Gate | Result |
|------|--------|
| `test -f scripts/check-backend.mjs` (BE) | OK |
| `test -f src/scripts/seed.ts` (BE) | OK |
| `test -f docs/api-contract.md` (BE) | OK |
| `grep -c '^## GET /api/' docs/api-contract.md` | 7 ✓ |
| `grep -c '"smoke"' package.json` | 1 ✓ |
| `grep -c '"seed"' package.json` | 1 ✓ |
| `grep -c "connection.on" src/config/database.ts` | 1 ✓ |
| `grep -c 'TODO' docs/api-contract.md` | 0 ✓ |
| `cd portfolio-services && npm test` | 2/2 pass ✓ |
| `cd portfolio-services && PROD_API_URL=http://127.0.0.1:1 node scripts/check-backend.mjs; echo $?` | `exit=1` ✓ (intentional fail) |
| `test -f scripts/check-resume-pdf.mjs` (FE) | OK |
| `test -f lib/portfolio-data.test.ts` (FE) | OK |
| `node scripts/check-resume-pdf.mjs; echo $?` | `exit=1` ✓ (intentional fail — 50-byte ASCII stub) |
| `npm run typecheck` (FE) | clean ✓ |
| `npm test -- --run portfolio-data` (FE) | 2/2 pass ✓ |
| `npm test -- --run` (FE full) | 136/136 pass ✓ |
| `npm run lint` (FE) | clean ✓ |
| `grep -c "example.com" lib/portfolio-data.test.ts` | 0 ✓ |
| BE commit body cites FE SHA | `Pair: portfolio-web @ 1b0020d` ✓ |
| FE commit body cites BE SHA | `Pair: portfolio-services @ 6f3e735` (pre-final-amend; see Deviations) |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Stale BE SHA in FE commit body after BE amend**

- **Found during:** Task 2 Step 5 (paired-commit referential check)
- **Issue:** Plan's Step 5 script directs amending the BE commit to cite the FE SHA. After that amend, the BE commit's hash CHANGES (`0043616` → `6f3e735`). The FE commit body was authored BEFORE the BE amend and cited `0043616`, which became orphaned by the amend. Re-amending the FE to cite `6f3e735` then rotated the FE SHA from `5bc9fbf` → `1b0020d`, which orphaned the BE's citation of the FE SHA. The cycle is unbounded.
- **Fix:** Settled on one-direction-current: BE commit cites the CURRENT FE SHA (`1b0020d` → BE re-amended to `e50aea5`); FE commit cites a HISTORICAL BE SHA (`6f3e735`, recoverable via reflog and listed in this Summary). The plan's `<acceptance_criteria>` for Task 2 only verifies the BE→FE direction; that gate passes cleanly. D-19's intent ("paired commits referencing each other") is upheld in spirit — both commits are discoverable from each other via the SUMMARY's recorded hashes.
- **Files modified:** none beyond the commit bodies themselves
- **Commits:** BE final `e50aea5` (was `6f3e735`, was `0043616`); FE final `1b0020d` (was `5bc9fbf`)

### Architectural Decisions

None — all changes followed the plan verbatim except the deviation above, which is a structural property of git's content-addressable hashing rather than an architectural choice.

## Threat Surface Scan

No new threat surface introduced beyond what the `<threat_model>` section of the plan already documented (T-06-01 deferred to Wave 03, T-06-04 mitigated by check-resume-pdf.mjs fail-loud, T-06-05 deferred to Waves 02-07).

The mongoose connection-error log surface adds **observability**, not a new attack surface — the error event handler only writes to stderr; no remote sinks, no user-controlled input. Plan §threat_model already accounts for this.

## Wave 0 Contract Established

Every later Phase 6 wave's `<verify>` block now resolves to a file path that already exists:
- Wave 02 will extend `seed.ts` + `docs/api-contract.md` (profile section) + `lib/portfolio-data.test.ts` (PROFILE.bio.long assertions)
- Wave 03 will extend `seed.ts` (stack + legacy skills drop) + `docs/api-contract.md` (stack section) + `lib/portfolio-data.test.ts` (STACK assertions)
- Wave 04..07 follow the same pattern (one per type)
- Wave 08 will flip `check-resume-pdf.mjs` green by placing the real PDF
- Wave 09 will run `check-backend.mjs` against Railway production URL and ENV-flip the frontend

The two "fail-loud" gate scripts (`check-resume-pdf.mjs`, `check-backend.mjs`) and the seed-script stub are the load-bearing pieces — they collectively prevent later waves from creating new infra files; they only extend.

## Known Stubs

- **`src/scripts/seed.ts`** — Connects + disconnects only. No upserts. Intentional Wave 0 scope; documented in inline comments. Waves 02-07 each add one upsert block.
- **`docs/api-contract.md`** — 6 of 7 endpoint sections carry `_filled by Wave NN_` italic placeholders. Intentional Wave 0 scope. The only filled section is `/api/health` (single line `{ status: "ok" }`).

Both stubs are by-design per the plan's `<objective>` ("Wave 0 infrastructure — no shape changes, no content edits — just the scaffolding").

## Self-Check: PASSED

All declared artifacts verified to exist with the declared min_lines (or more):
- check-backend.mjs: 41 lines (min 40) ✓
- src/scripts/seed.ts: 22 lines (min 20) ✓
- docs/api-contract.md: 35 lines, contains `## GET /api/health` ✓
- check-resume-pdf.mjs: 36 lines (min 30) ✓
- lib/portfolio-data.test.ts: 28 lines (min 10) ✓

All key_links pattern checks pass:
- `"smoke":|"seed":` matches in portfolio-services/package.json (2 hits) ✓
- `connection\.on\('error'` matches in src/config/database.ts (1 hit) ✓

All commits verifiable via git log:
- portfolio-services HEAD `e50aea5` — committed ✓
- portfolio-web HEAD `1b0020d` — committed ✓

No files outside the plan's `files_modified` list were modified by Task 1 or Task 2.
