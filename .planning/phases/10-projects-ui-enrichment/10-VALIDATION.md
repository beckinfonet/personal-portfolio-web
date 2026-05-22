---
phase: 10
slug: projects-ui-enrichment
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-21
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run lint` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run lint`
- **Before `/gsd-verify-work`:** Full suite + `npx playwright test tests/contrast.spec.ts` must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

*Populated by the planner from RESEARCH.md Validation Architecture and the generated PLAN.md tasks.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | LIST-02/03/04, DETAIL-02/03/04/05 | — | N/A (pure helpers) | unit (RED) | `npx vitest run lib/project-stats.test.ts` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | LIST-02/03/04/07, DETAIL-02/03/04/05/07 | T-10-01 | No `node:` / `lib/github.ts` import in pure module | unit (GREEN) | `npx vitest run lib/project-stats.test.ts` | ✅ after 10-01-01 | ⬜ pending |
| 10-02-01 | 02 | 2 | LIST-01/02/05/06/07/09, DETAIL-01/02/05/06/07/09 | T-10-03, T-10-04, T-10-05 | Client island never imports `lib/github.ts`; CTAs via `ExternalLink` | component | `npx vitest run app/components/project-row.test.tsx` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | LIST-01/07, DETAIL-01/06 | T-10-03, T-10-06 | `getRepoStats` server-only; CTA href = original `repoUrls[0]` | component + smoke | `npx vitest run "app/(terminal)/projects/page.test.tsx"` | ✅ exists — extend | ⬜ pending |
| 10-02-03 | 02 | 2 | LIST-06/08 | — | N/A (CSS) | build | `npm run build` | ✅ exists — extend | ⬜ pending |
| 10-03-01 | 03 | 3 | DETAIL-08 | T-10-07 | Panel expanded before axe so `hidden` content is actually scanned | e2e (axe) | `npx playwright test tests/contrast.spec.ts` | ✅ exists — extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/project-stats.ts` + `lib/project-stats.test.ts` — created in Plan 01 (RED then GREEN)
- [ ] `app/components/project-row.tsx` + `app/components/project-row.test.tsx` — created in Plan 02
- [ ] `tests/contrast.spec.ts` — modified in Plan 03 (panel-visible path)
- [ ] Existing `vitest` + `playwright` + `axe` infrastructure covers all phase requirements — no framework install needed

*See RESEARCH.md Validation Architecture for the authoritative Wave 0 file gap list.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 480px mobile readability — no horizontal scroll on projects card row | LIST-06 | Visual layout assertion at a specific breakpoint | Open `/projects` at 480px width, confirm the strip wraps gracefully via `flex-wrap`, no horizontal scroll. The component test asserts the wrap-enabled container; the visual confirmation at 480px stays manual. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
