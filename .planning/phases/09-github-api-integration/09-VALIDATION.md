---
phase: 9
slug: github-api-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 + jsdom 26.1.0 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run lib/github.test.ts` |
| **Full suite command** | `npm test` (`vitest run`) |
| **Estimated runtime** | ~4 seconds (full suite); <1s for the single file |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/github.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite green + `npm run build` + `npm run lint` + `tsc --noEmit` clean
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 9-01-01 | 01 | 1 | GH-07 | — | `GitHubRepoStats` type exported with exact shape; no `any` | static | `tsc --noEmit` | ✅ (lib/types.ts exists) | ⬜ pending |
| 9-01-02 | 01 | 1 | GH-01, GH-04, GH-06 | T-9-V5 | `parseRepoUrl` host-allow-lists `github.com`; combine returns `null` only when all repos fail | unit | `npx vitest run lib/github.test.ts -t "combine"` | ❌ W0 | ⬜ pending |
| 9-01-03 | 01 | 1 | GH-03, GH-05, GH-08 | T-9-V2 | bearer auth only when token present; `revalidate: 86400` on every fetch; rate-limit headers logged dev-level | unit | `npx vitest run lib/github.test.ts -t "auth"` | ❌ W0 | ⬜ pending |
| 9-01-04 | 01 | 1 | GH-04, GH-10 | — | Link-header `rel=last` commit count; `/languages` byte-merge; byte-sort | unit | `npx vitest run lib/github.test.ts -t "endpoints"` | ❌ W0 | ⬜ pending |
| 9-01-05 | 01 | 1 | GH-09, GH-06 | T-9-V5 | transient fetch failure → per-repo disk-cache fallback; never throws | unit | `npx vitest run lib/github.test.ts -t "disk"` | ❌ W0 | ⬜ pending |
| 9-01-06 | 01 | 1 | GH-02 | — | native `fetch` only; `@octokit/rest` absent | static | `npm ls @octokit/rest` (expect "not found") | n/a (CI check) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs above are indicative — the planner sets the final task breakdown; every GH-NN requirement must map to at least one automated or static check.*

---

## Wave 0 Requirements

- [ ] `lib/github.test.ts` — co-located with `lib/github.ts` per CONVENTIONS.md; covers GH-01, GH-03, GH-04, GH-05, GH-06, GH-08, GH-09, GH-10. Created in the same plan as `lib/github.ts` (no separate scaffold wave needed — single-plan phase).
- [ ] No shared fixtures file — fixtures are inline `Response` objects per test (TESTING.md: no `__fixtures__/` directory; inline is the convention).
- [ ] Framework install: none — `vitest` already installed and configured.

*Existing infrastructure covers all phase requirements except the one new `lib/github.test.ts` file.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real GitHub API reachability with a live `GITHUB_TOKEN` | GH-03 | Unit tests stub `fetch`; a live call needs a real token + network | Deferred to Phase 11 smoke verification against the deployed `/projects` route |

*All Phase 9 module behaviors have automated unit verification via stubbed `fetch`; only the live-API path is manual and is owned by Phase 11.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (`lib/github.test.ts`)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
