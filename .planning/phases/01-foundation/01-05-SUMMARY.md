---
phase: 01-foundation
plan: "05"
subsystem: build-pipeline
tags: [infra, placeholder-gate, postbuild, ci]
dependency_graph:
  requires: ["01-foundation/01", "01-foundation/02"]
  provides: ["INFRA-05 postbuild placeholder gate", "typecheck script for CI"]
  affects: ["package.json scripts", "npm run build chain"]
tech_stack:
  added: ["scripts/check-placeholders.mjs (Node ESM, no new deps)"]
  patterns: ["postbuild lifecycle hook", "generator-based directory walk"]
key_files:
  created: ["scripts/check-placeholders.mjs"]
  modified: ["package.json"]
decisions:
  - "postbuild (not prebuild) so grep targets emitted .next/server/ bundles that only exist after next build"
  - "TODO and Product Studio are case-sensitive (D-10 grammar — lowercase prose does not trip the gate)"
  - "lorem, example.com, placeholder are case-insensitive (placeholder in any casing is clearly wrong)"
  - "npm run build exits 1 while TODO: markers remain in lib/portfolio-data.ts — this is the intended D-10 self-enforcement gate"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-06"
  tasks_completed: 2
  tasks_total: 2
  files_changed: 2
---

# Phase 01 Plan 05: Postbuild Placeholder Gate Summary

Postbuild grep gate (INFRA-05) using `scripts/check-placeholders.mjs` wired into `npm run build` via the `postbuild` lifecycle hook. Also adds `typecheck` script for Plan 06's CI workflow.

## What Was Built

### scripts/check-placeholders.mjs

Node ESM script that walks `.next/server/` after `next build`, greps each scanned file for 5 forbidden patterns, and exits 1 on any hit.

**Forbidden patterns and case-sensitivity:**

| Pattern | Regex | Case |
|---------|-------|------|
| lorem | `/lorem/i` | case-insensitive |
| example.com | `/example\.com/i` | case-insensitive |
| placeholder | `/placeholder/i` | case-insensitive |
| TODO | `/TODO/` | CASE-SENSITIVE (D-10 grammar) |
| Product Studio | `/Product Studio/` | CASE-SENSITIVE (D-10 grammar) |

Case-sensitivity rationale for `TODO` and `Product Studio`: developers writing lowercase prose comments (e.g. `// todo: clean this up later`) do not trip the gate. Only the canonical build-gate marker `TODO:` (uppercase) fails the build. This is the D-10 grammar decision from CONTEXT.md.

**Scanned extensions:** `.js`, `.html`, `.json`, `.rsc`, `.txt` — covers Next.js server bundles, RSC payloads, and static text output.

**Implementation:** Generator function `walk(dir)` for depth-first traversal using `node:fs` and `node:path` (no external deps). All console output goes to stderr on failure; clean runs emit a single stdout confirmation line.

### package.json scripts additions

```json
"postbuild": "node scripts/check-placeholders.mjs",
"typecheck": "tsc --noEmit"
```

`postbuild` chains automatically after `next build` per npm lifecycle semantics — no `&&` needed. `typecheck` is referenced by Plan 06's CI workflow (`tsc --noEmit` run as a separate CI step).

## Build Gate Verification

`npm run build` (with `NEXT_PUBLIC_SITE_URL=https://example.com`) was run and confirmed to exit non-zero with the following output:

```
✗ INFRA-05: Forbidden strings found in build output:

  .next/server/app/_not-found/page.js: matched /example\.com/
  .next/server/app/index.html: matched /TODO/
  .next/server/app/index.rsc: matched /TODO/
  .next/server/app/page.js: matched /example\.com/
  .next/server/app/page.js: matched /TODO/
  .next/server/app/robots.txt/route.js: matched /example\.com/
  .next/server/app/sitemap.xml/route.js: matched /example\.com/
  .next/server/chunks/405.js: matched /placeholder/

FAIL: 8 hit(s) across .next/server/
build exit code: 1
```

**This failure is the correct and intended D-10 self-enforcement behavior.** The 9 `TODO:` markers in `lib/portfolio-data.ts` (from Plan 02) are deliberately present as build-gate placeholders. `npm run build` MUST fail until Phase 6 / CONTENT-08 fills them with real content. Do not remove the markers to make the build pass — the failure IS the gate working.

The `example.com` hits are from `NEXT_PUBLIC_SITE_URL=https://example.com` injected via the env var (used in robots.txt/sitemap routes) and from existing code referencing the env var. This is also expected — production deployments will set a real domain.

The `placeholder` hit in `chunks/405.js` is from existing UI code and will be resolved in later phases.

## Reminders

### For Phase 6 / CONTENT-08 (filling real content)
When replacing `TODO:` markers in `lib/portfolio-data.ts` with real bio, stats, social handles, and LinkedIn URL, the next `npm run build` will automatically verify no placeholder strings leaked into the emitted bundles. No extra checking needed — the gate runs on every build.

### For Plan 06 (CI workflow)
The CI "Build" step MUST run `npm run build` (NOT `next build` directly). Running `next build` bypasses the postbuild chain; running `npm run build` ensures the placeholder gate executes in CI exactly as it does locally. The `typecheck` script (`tsc --noEmit`) is available as a separate CI step.

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | 9f18378 | feat(01-05-foundation): create scripts/check-placeholders.mjs postbuild gate |
| Task 2 | ae7e961 | chore(01-05-foundation): add postbuild + typecheck scripts to package.json |

## Self-Check

- [x] `scripts/check-placeholders.mjs` exists with shebang, 5 forbidden patterns, walk generator, exit(0|1)
- [x] `package.json` has `postbuild` and `typecheck` scripts; all existing scripts preserved
- [x] `npm run build` exits 1 on TODO: markers (D-10 gate verified)
- [x] `lib/portfolio-data.ts` unchanged (9 TODO: markers present)
- [x] Commits 9f18378 and ae7e961 exist in git log
- [x] No modifications outside `scripts/check-placeholders.mjs`, `package.json`, and this SUMMARY
