---
status: partial
phase: 01-foundation
source: [01-VERIFICATION.md]
started: 2026-05-06T07:35:00Z
updated: 2026-05-06T07:35:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Live HTTP header curl test
expected: `curl -sI http://localhost:3000/` (against `npm run dev`) returns all 6 headers — `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `x-built-with: nextjs-15-react-19`. `x-portfolio-source` MUST be absent (deferred to Phase 7).
result: [pending]

### 2. GitHub branch protection on `main`
expected: After the first PR opens this repo's CI workflow and the `verify` job runs successfully (which will happen once Phase 6 fills the `TODO:` markers and the build step passes), configure: GitHub repo → Settings → Branches → Add rule → Branch name pattern `main` → Require status checks → select `verify` → Require branches up to date → 0 reviewers (per D-06). After setup, direct pushes to `main` are blocked; CI green becomes a hard merge gate.
result: [pending]

### 3. Vercel runtime accepts `engines.node: "22.x"` at Phase 7 deploy
expected: First Vercel build in Phase 7 succeeds without a `Found invalid Node.js Version` error. RESEARCH.md §9 confirms the `22.x` format is what Vercel resolves to the latest 22.x patch; this test confirms it in production.
result: [pending — Phase 7]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
