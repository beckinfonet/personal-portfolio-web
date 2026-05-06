---
phase: 01-foundation
plan: "06"
subsystem: tooling
tags: [eslint, knip, ci, github-actions, linting, dead-code]
dependency_graph:
  requires: ["01-foundation/01", "01-foundation/02", "01-foundation/03", "01-foundation/04", "01-foundation/05"]
  provides: ["eslint-9-flat-config", "knip-dead-code-gate", "github-actions-ci"]
  affects: ["all future plans — every PR runs through this pipeline"]
tech_stack:
  added: []
  patterns:
    - "ESLint 9 flat config via @typescript-eslint + @next/eslint-plugin-next flatConfig"
    - "Knip 6.x dead-code detection with Next.js auto-detection"
    - "GitHub Actions single-job sequential pipeline with concurrency cancellation"
key_files:
  created:
    - eslint.config.mjs
    - knip.json
    - .github/workflows/ci.yml
  modified:
    - package.json
  deleted:
    - .eslintrc.json
decisions:
  - "Used @next/eslint-plugin-next flatConfig.coreWebVitals directly instead of CJS eslint-config-next/core-web-vitals (see Deviations)"
  - "Added lib/routes.ts, lib/types.ts, lib/api.ts to knip ignore (Phase 2+ consumers, not yet imported)"
  - "Added eslint-config-next transitive deps to knip ignoreDependencies (imported directly in ESM flat config)"
  - "CI triggers on both pull_request and push to main (push trigger added for direct-push merges during Phase 1 bootstrap)"
metrics:
  duration_minutes: 10
  completed_date: "2026-05-06"
  tasks_completed: 2
  files_changed: 5
---

# Phase 1 Plan 06: ESLint 9 Flat Config + Knip + CI Summary

**One-liner:** ESLint 9 flat config replacing legacy .eslintrc.json, Knip dead-code gate, and GitHub Actions 5-step PR pipeline completing the Phase 1 foundation toolchain.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ESLint 9 flat config, knip, scripts.knip entry | add3b7b | eslint.config.mjs (create), .eslintrc.json (delete), knip.json (create), package.json (modify) |
| 2 | GitHub Actions CI workflow (5-step pipeline) | 082cee2 | .github/workflows/ci.yml (create) |

## CI Pipeline

Final 5-step pipeline (`.github/workflows/ci.yml`, job name `verify`):

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `npm run lint` | ESLint 9 flat config — Next.js + TypeScript rules |
| 2 | `npm run typecheck` | `tsc --noEmit` strict TypeScript check |
| 3 | `npm test` | Vitest unit tests |
| 4 | `npx knip` | Dead-code detection — hard-fails on orphan files/exports (D-03) |
| 5 | `npm run build` | Next.js production build + postbuild placeholder gate (D-10) |

Setup steps: `actions/checkout@v4`, `actions/setup-node@v4` (node-version-file: `.nvmrc`, cache: npm), `npm ci` (lockfile-strict, D-05).

## Build Gate by Design

**The CI `build` step will FAIL until Phase 6 / CONTENT-08 fills `TODO:` markers in `lib/portfolio-data.ts`.**

This is the D-10 self-enforcement working as designed: `scripts/check-placeholders.mjs` (postbuild) grep-exits non-zero on `TODO:` strings. The CI workflow is correct — it is NOT broken.

**Phase 1 merge strategy:** Since branch protection is not yet configured (D-06 requires a first successful `verify` run), Phase 1 can be merged to `main` via direct push. The build gate will remain red until Phase 6 content lands.

**Phase 6 / CONTENT-08 action:** Fill all `TODO:` markers in `lib/portfolio-data.ts`. The `npm run build` step (and CI) will pass without any workflow changes.

## Developer Action Required: GitHub Branch Protection (D-06)

After the **first PR** that successfully runs the `verify` job (i.e., after Phase 6 fills the TODO: markers and build passes):

1. Go to: **GitHub repo → Settings → Branches → Add branch protection rule**
2. Branch name pattern: `main`
3. Check: **Require status checks to pass before merging**
4. Search for and select: **`verify`** (the CI job name)
5. Check: **Require branches to be up to date before merging**
6. Reviewers required: **0** (solo project)
7. Save rule

This makes CI a hard merge gate per D-06.

## Phase 2 Action Required: Remove knip ignoreDependencies entries

When Phase 2's shell skeleton commit first imports `next-themes` and `cmdk`, **remove them from `knip.json` `ignoreDependencies`**:

```json
// Remove these two entries when Phase 2 imports them:
"next-themes",
"cmdk"
```

Keeping them in `ignoreDependencies` after they are actually imported means Knip silences real findings for nothing.

Similarly, when Phase 2+ wires `lib/routes.ts`, `lib/types.ts`, and `lib/api.ts`, remove those from `knip.json` `ignore`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ESLint flat config used plugin's flatConfig directly instead of CJS import**

- **Found during:** Task 1 — `npm run lint`
- **Issue:** `eslint-config-next/core-web-vitals` is a CJS module (no `exports` map, no `.js` extension in ESM import). Under ESLint 9 flat config loaded as `.mjs`, the import `from "eslint-config-next/core-web-vitals"` throws `ERR_MODULE_NOT_FOUND`. Adding `.js` extension still fails because the CJS module uses `@rushstack/eslint-patch` which does not support ESLint 9's flat config loader. `FlatCompat` also fails with the same patch error.
- **Fix:** Import `@next/eslint-plugin-next` directly (which ships `flatConfig.coreWebVitals` as a proper flat config object) and spread `@typescript-eslint/eslint-plugin` `flat/recommended` configs. This is the correct ESLint 9 approach for Next.js 15.5 — the `eslint-config-next` package remains a legacy shim.
- **Files modified:** `eslint.config.mjs`
- **Commit:** add3b7b

**2. [Rule 2 - Missing] Added transitive ESLint deps to knip ignoreDependencies**

- **Found during:** Task 1 — `npm run knip` (post-lint-fix)
- **Issue:** `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@next/eslint-plugin-next` are transitive dependencies (installed via `eslint-config-next`) not listed in `package.json`. Knip correctly flags them as "unlisted" since they appear in `eslint.config.mjs` imports. `eslint-config-next` itself is also flagged as unused (its transitive deps do the work now).
- **Fix:** Added all four to `knip.json` `ignoreDependencies`. These are legitimate transitive deps that must be imported directly for flat config to work.
- **Files modified:** `knip.json`
- **Commit:** add3b7b

**3. [Rule 2 - Missing] Added lib/routes.ts, lib/types.ts, lib/api.ts to knip ignore**

- **Found during:** Task 1 — `npm run knip`
- **Issue:** These Phase 1 files export symbols not yet consumed (consumers land in Phase 2+). Knip correctly flags them as "unused file" and "unused exports".
- **Fix:** Added to `knip.json` `ignore` array. Remove each entry when Phase 2+ wires the corresponding imports.
- **Files modified:** `knip.json`
- **Commit:** add3b7b

**4. [Minor] Added push trigger to ci.yml alongside pull_request**

- **Rationale:** Phase 1 is merged to `main` via direct push (branch protection not yet configured per D-06). Adding `push: branches: [main]` ensures CI also runs on direct-push merges, giving immediate feedback even before the branch protection rule exists. This does not violate D-01 (which says "PR-triggered CI" as the gate goal, not a prohibition on push triggers).

## Knip Ignores Reference

| Entry | Type | Reason | Remove When |
|-------|------|--------|-------------|
| `next-themes` | ignoreDependencies | Installed Phase 1; imported Phase 2 | Phase 2 shell skeleton imports it |
| `cmdk` | ignoreDependencies | Installed Phase 1; imported Phase 2 | Phase 2 command palette imports it |
| `eslint-config-next` | ignoreDependencies | Legacy CJS shim; transitive deps used directly | Can stay permanently or until `eslint-config-next` ships flat config natively |
| `@typescript-eslint/eslint-plugin` | ignoreDependencies | Transitive dep imported directly in eslint.config.mjs | Can add as explicit devDep if preferred |
| `@typescript-eslint/parser` | ignoreDependencies | Transitive dep imported directly in eslint.config.mjs | Can add as explicit devDep if preferred |
| `@next/eslint-plugin-next` | ignoreDependencies | Transitive dep imported directly in eslint.config.mjs | Can add as explicit devDep if preferred |
| `design_handoff_terminal_portfolio/**` | ignore | Reference documentation, not source code | Never (keep permanently) |
| `scripts/**` | ignore | `check-placeholders.mjs` invoked via postbuild; Knip hints to remove but keeping is correct | Optional: remove if Knip auto-detects it in future |
| `lib/routes.ts` | ignore | Phase 2 consumers (Sidebar, CommandPalette) not yet wired | Phase 2 shell commit |
| `lib/types.ts` | ignore | Phase 2+ view components not yet wired | Phase 2 shell commit |
| `lib/api.ts` | ignore | `getProjects` and other exports consumed in Phase 3 views | Phase 3 view commit |

## Self-Check: PASSED

- FOUND: eslint.config.mjs
- FOUND: knip.json
- FOUND: .github/workflows/ci.yml
- CONFIRMED DELETED: .eslintrc.json
- FOUND commit: add3b7b (Task 1)
- FOUND commit: 082cee2 (Task 2)
