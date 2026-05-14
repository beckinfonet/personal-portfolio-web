---
phase: 07-deploy-verification
plan: 06
subsystem: deploy-verification
tags:
  - npm-audit
  - knip
  - dead-code
  - security
  - pre-close-out-gate
  - DEPLOY-05
dependency-graph:
  requires:
    - "07-03 — Plan 03 @vercel/analytics install (creates the post-install dep state that audit runs against)"
    - "Phase 6 commit 1d9a295 (next 15.5.15 → 15.5.18 Vercel CVE bump baseline)"
  provides:
    - "DEPLOY-05 PASS evidence — three exit-0 gate outputs + 07-VERIFICATION.md DEPLOY-05 section"
    - "Pre-close-out posture: zero high/critical CVEs in FE and BE prod deps; zero unused files/exports/deps in FE"
  affects:
    - ".planning/phases/07-deploy-verification/07-VERIFICATION.md (appended DEPLOY-05 section; DEPLOY-03 untouched)"
    - "Three new evidence text files under .planning/phases/07-deploy-verification/"
tech-stack:
  added: []
  patterns:
    - "Evidence text files with appended `EXIT_CODE=<n>` stamp — makes gate verdict auditable from the file alone without re-running the command"
    - "BE audit runs against absolute sibling-repo path (canonical FE-checkout location resolves only from main checkout, not worktree)"
key-files:
  created:
    - .planning/phases/07-deploy-verification/audit-fe.txt
    - .planning/phases/07-deploy-verification/audit-be.txt
    - .planning/phases/07-deploy-verification/knip-fe.txt
    - .planning/phases/07-deploy-verification/07-06-SUMMARY.md
  modified:
    - .planning/phases/07-deploy-verification/07-VERIFICATION.md
decisions:
  - "D-21 followed strictly: --audit-level=high is the gate threshold; moderate-severity findings are surfaced as evidence but do not block PASS"
  - "knip configuration hint about .claude/** ignore directive left unchanged: user explicitly added it to insulate workflow scaffolding from analysis; informational hint, not a gate failure"
  - "BE audit invoked via absolute path /Users/beckmaldinVL/development/personal-portfolio/portfolio-services (canonical layout); plan's `../portfolio-services` relative reference assumes the canonical FE-checkout location, which is the parent of the worktrees/ subtree"
metrics:
  duration: "~10 minutes (install + 3 gates + doc update)"
  completed-date: 2026-05-14
---

# Phase 07 Plan 06: npm audit FE + BE + npx knip pre-close-out gates Summary

DEPLOY-05 verdict PASS — three pre-close-out gates (`npm audit --omit=dev --audit-level=high` against FE and BE prod deps + `npx knip` against FE) all exit 0; evidence committed; 07-VERIFICATION.md DEPLOY-05 section populated.

## Gate Results

| Gate | Command | Exit | Findings | Evidence |
|------|---------|------|----------|----------|
| FE npm audit | `npm audit --omit=dev --audit-level=high` | 0 | 3 moderate-severity (postcss <8.5.10, transitive via next + @vercel/analytics) — below `--audit-level=high` gate | `audit-fe.txt` |
| BE npm audit | `(cd ../portfolio-services && npm audit --omit=dev --audit-level=high)` | 0 | `found 0 vulnerabilities` — clean | `audit-be.txt` |
| FE knip | `npx knip` | 0 | 0 unused files / exports / deps / types; 1 informational config hint (`.claude/**` ignore directive does not match — left as-is per user intent) | `knip-fe.txt` |

## Re-verifications

- **Phase 6 commit 1d9a295 (next 15.5.15 → 15.5.18 Vercel May 2026 CVE bump):** held. Zero high/critical advisories surfaced against the post-bump `next` version pin.
- **Plan 07-03 install of `@vercel/analytics@^2.0.1`:** introduced no new high/critical advisories. The dep transitively depends on a vulnerable postcss for the moderate finding, but that's surfaced via `next` already and is below the gate threshold per D-21.

## Tasks + Commits

| Task | Name | Commit |
|------|------|--------|
| 1 | Run FE npm audit gate; capture output to `audit-fe.txt` with `EXIT_CODE=0` stamp | `e2b18f6` |
| 2 | Run BE npm audit gate against sibling repo; capture output to `audit-be.txt` with `EXIT_CODE=0` stamp | `91e622f` |
| 3 | Run `npx knip` against FE; capture output to `knip-fe.txt` with `EXIT_CODE=0` stamp | `39f5b4d` |
| 4 | Append DEPLOY-05 section to 07-VERIFICATION.md + update frontmatter `sections:` list | `4f77c8c` |

## Notable Findings (Below Gate Threshold)

### FE: 3 moderate-severity postcss advisories

- **Advisory:** GHSA-qx2v-qp2m-jg93 — postcss has XSS via Unescaped `</style>` in its CSS Stringify Output. Affects `postcss <8.5.10`.
- **Path:** Transitive — `next` (current pin 15.5.18) and `@vercel/analytics` (current pin ^2.0.1) both depend on a vulnerable `postcss` version range.
- **Suggested fix per npm:** `npm audit fix --force` would downgrade `next` to `9.3.3` — breaking change. Refused.
- **Disposition per D-21:** Moderate severity is below the `--audit-level=high` gate threshold. Not blocking. Surfaced here for visibility — to be revisited when `next` upstream ships a patched-postcss release. No action required for DEPLOY-05.

### FE knip configuration hint

- knip suggested removing `.claude/**` from `knip.json` `ignore` list because the directive does not match files knip would otherwise analyze.
- User explicitly added `.claude/**` to `ignore` per recent commits to insulate workflow scaffolding from knip's analysis surface. Hint is informational, not a gate failure.
- Left unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] FE node_modules absent in worktree; installed deps to enable `npx knip`**

- **Found during:** Task 3 setup
- **Issue:** The worktree at `.claude/worktrees/agent-a429f60e1d12b2db2/` does not share `node_modules` with the main checkout. `npm audit` reads only the lockfile (no install needed), but `npx knip` requires installed deps to determine "used".
- **Fix:** Ran `npm install --legacy-peer-deps --no-audit --no-fund` in the worktree before invoking knip. The `--legacy-peer-deps` flag honors the Plan 03 ERESOLVE workaround documented in the plan's executor notes. Install added 506 packages cleanly with one EBADENGINE warning (node 20.19.1 vs `engines: node 22.x` — non-fatal, didn't affect audit/knip output).
- **Files modified:** None tracked (node_modules and any lockfile drift are gitignored)
- **Commit:** N/A (workspace-only setup; no committed artifacts)

**2. [Rule 3 - Blocking] BE relative path `../portfolio-services` resolves to non-existent location from worktree**

- **Found during:** Task 2 setup
- **Issue:** The plan's `(cd ../portfolio-services && …)` invocation assumes the canonical FE checkout location at `/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/`, where `../portfolio-services/` resolves to `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/` (the actual BE repo). From the worktree at `.claude/worktrees/agent-a429f60e1d12b2db2/`, the same relative path resolves to `.claude/worktrees/portfolio-services/` which does not exist.
- **Fix:** Invoked the BE audit via absolute path `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/`. Functionally identical; the audit output and exit semantics are independent of which path was used to reach the BE repo root.
- **Files modified:** None (this is a path-resolution adjustment, not a content change)
- **Commit:** Captured in Task 2 commit `91e622f`

### Architectural Changes

None.

### Authentication Gates

None.

## Deferred Issues

None blocking. The 3 moderate postcss advisories noted above are below the D-21 gate threshold and surfaced as evidence only; they wait for an upstream `next` postcss bump and are not Phase 7 close-out blockers.

## Known Stubs

None. No placeholder data, hardcoded empty values, or unwired components introduced by this plan. The plan only captures evidence and updates documentation.

## Threat Flags

None. This plan introduces no new network endpoints, auth paths, file-access patterns, or schema changes. Static-analysis gates only; no runtime surface added.

## Self-Check: PASSED

- FOUND: `.planning/phases/07-deploy-verification/audit-fe.txt` (EXIT_CODE=0)
- FOUND: `.planning/phases/07-deploy-verification/audit-be.txt` (EXIT_CODE=0)
- FOUND: `.planning/phases/07-deploy-verification/knip-fe.txt` (EXIT_CODE=0)
- FOUND: 07-VERIFICATION.md DEPLOY-05 section with FE audit / BE audit / FE knip sub-sections and verdict PASS
- FOUND: 07-VERIFICATION.md frontmatter `sections:` list updated to include DEPLOY-05
- FOUND: 07-VERIFICATION.md DEPLOY-03 section preserved (PARTIAL-PASS — DEFERRED-INDEXING-WAIT) — not overwritten
- FOUND: commit `e2b18f6` (Task 1 FE audit evidence)
- FOUND: commit `91e622f` (Task 2 BE audit evidence)
- FOUND: commit `39f5b4d` (Task 3 FE knip evidence)
- FOUND: commit `4f77c8c` (Task 4 DEPLOY-05 doc update)
