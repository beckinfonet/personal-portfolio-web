---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [deps, node-version, typescript, gitignore, lockfile]
dependency_graph:
  requires: []
  provides:
    - dep-baseline-next-15-5
    - engines-node-22x
    - nvmrc-22
    - tsconfig-es2022
    - gitignore-widened
  affects:
    - all subsequent plans (install against this dep set)
    - Plan 06 (engines pin + .nvmrc used by CI actions/setup-node)
    - Plan 02 (tsc --noEmit now cheapest gate after each file change)
tech_stack:
  added:
    - next@^15.5.15 (upgraded from 15.3.2)
    - next-themes@^0.4.6 (new prod dep, INFRA-02)
    - cmdk@^1.1.1 (new prod dep, INFRA-02)
    - eslint@^9.0.0 (upgraded from 8.57.0, flat-config support)
    - eslint-config-next@^15.5.15 (upgraded from 15.3.2)
    - knip@^6.11.0 (new dev dep, INFRA-03)
  patterns:
    - engines.node "22.x" for Vercel-compatible Node version pinning
    - tsconfig incremental build artifacts excluded via *.tsbuildinfo gitignore entry
key_files:
  created:
    - .nvmrc
  modified:
    - package.json
    - package-lock.json
    - tsconfig.json
    - .gitignore
decisions:
  - "engines.node set to exactly \"22.x\" (not \">=22\") per D-04 revised — Vercel rejects the >= form"
  - "next-themes and cmdk installed as prod deps but NOT imported yet — Plan 06 must add both to knip.json ignoreDependencies"
  - "*.tsbuildinfo added to .gitignore (Rule 2 deviation) — tsc --noEmit with incremental:true generates this file and it must not enter the repo"
  - "npm audit --omit=dev shows 2 moderate PostCSS advisories in next; zero high/critical; no fix path exists without downgrading next to 9.x"
metrics:
  duration: "~2m 13s"
  completed: "2026-05-06"
  tasks_completed: 2
  files_modified: 5
---

# Phase 1 Plan 01: Dependency Baseline and Config Hardening Summary

Upgraded the Next.js 15 dependency baseline to a clean, secure state: next 15.3.2 → ^15.5.15, added next-themes@^0.4.6 and cmdk@^1.1.1 (both React 19 peer-verified), upgraded ESLint to 9.x flat-config-ready, pinned Node 22 LTS via engines + .nvmrc, bumped tsconfig target to ES2022, and hardened .gitignore against secrets and OS metadata.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Upgrade deps, add engines pin, regenerate lockfile | 4db97b1 | package.json, package-lock.json |
| 2 | Add .nvmrc, bump tsconfig to ES2022, widen .gitignore | 7b14ae4 | .nvmrc, tsconfig.json, .gitignore |

## Final Dep Set

| Package | Before | After | Type |
|---------|--------|-------|------|
| next | 15.3.2 | ^15.5.15 | prod |
| next-themes | — | ^0.4.6 | prod (new) |
| cmdk | — | ^1.1.1 | prod (new) |
| react | 19.1.0 | 19.1.0 (unchanged) | prod |
| react-dom | 19.1.0 | 19.1.0 (unchanged) | prod |
| eslint | 8.57.0 | ^9.0.0 | dev |
| eslint-config-next | 15.3.2 | ^15.5.15 | dev |
| knip | — | ^6.11.0 | dev (new) |

## Lockfile Delta

- Lines before: ~4,800 (est)
- Lines after: 9,700
- Delta: ~4,900 lines added (expected — new deps + peer resolution tree)
- Largest single delta this project will ever take (per RESEARCH.md Pitfall A)

## Engine Pin

- `engines.node`: `"22.x"` (Vercel-compatible; rejects `>=22` format per D-04 revised)
- `.nvmrc`: `22` (major-only; matches Vercel's resolution of `22.x`)

## Security Audit

- `npm audit --omit=dev`: zero high/critical advisories
- 2 moderate advisories (PostCSS XSS in next's transitive dep) — no fix path without downgrading next to 9.x; accepted per project risk posture

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing gitignore entry] Added *.tsbuildinfo to .gitignore**
- **Found during:** Task 2 verification (`npx tsc --noEmit` created `tsconfig.tsbuildinfo`)
- **Issue:** TypeScript incremental compilation with `"incremental": true` generates `tsconfig.tsbuildinfo` at repo root. It appeared as an untracked file after running the verification command. The plan's `.gitignore` additions did not cover it.
- **Fix:** Appended `*.tsbuildinfo` to `.gitignore` in the same Task 2 commit.
- **Files modified:** `.gitignore`
- **Commit:** 7b14ae4

## Notes for Downstream Plans

### Note for Plan 06 (CI + Knip)

`next-themes` and `cmdk` are now installed as prod deps but NOT imported anywhere in the codebase until Phase 2. When Plan 06 wires `knip` as a CI step, these two deps MUST be added to `knip.json` `ignoreDependencies`:

```json
{
  "ignoreDependencies": ["next-themes", "cmdk"]
}
```

Failure to add this will cause Knip to report them as unused and fail the CI hard-fail gate on the first PR (RESEARCH.md Pitfall B).

### Note for Plan 02 (Data Refactor)

`npx tsc --noEmit` now exits 0 cleanly against the existing source with ES2022 target. This is the cheapest correctness gate — run it after every file change in the data-refactor sequence before attempting a full `npm run build`.

## Self-Check

- [x] `.nvmrc` exists and contains `22`
- [x] `package.json` engines.node = `"22.x"`
- [x] `package.json` dependencies: next `^15.5.15`, next-themes `^0.4.6`, cmdk `^1.1.1`
- [x] `package.json` devDependencies: eslint `^9.0.0`, eslint-config-next `^15.5.15`, knip `^6.11.0`
- [x] `package.json` scripts: lint = `"eslint ."`, no postbuild/typecheck/knip yet
- [x] `package-lock.json` regenerated (9,700 lines)
- [x] `tsconfig.json` target = `"ES2022"`, strict/paths preserved
- [x] `.gitignore` contains `.env`, `.env*.local`, `.DS_Store`, `*.tsbuildinfo`
- [x] `npm ls next next-themes cmdk` — no peer warnings
- [x] `npm audit --omit=dev` — zero high/critical
- [x] `npx tsc --noEmit` exits 0
- [x] Commits 4db97b1, 7b14ae4 exist in git log
- [x] No plan files, CONTEXT.md, PATTERNS.md, VALIDATION.md were modified

## Self-Check: PASSED
