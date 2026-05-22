---
phase: 10
slug: projects-ui-enrichment
status: draft
nyquist_compliant: false
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
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

*Populated by the planner from RESEARCH.md Validation Architecture and the generated PLAN.md tasks.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | LIST-* / DETAIL-* | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Strip + panel rendering test files — stubs for LIST-01..09 / DETAIL-01..09
- [ ] Existing `vitest` infrastructure covers all phase requirements (no framework install needed)

*See RESEARCH.md Validation Architecture for the authoritative Wave 0 file gap list.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 480px mobile readability — no horizontal scroll on projects card row | LIST-06 | Visual layout assertion at a specific breakpoint | Open `/projects` at 480px width, confirm strip wraps gracefully, no horizontal scroll |
| WCAG 2.1 AA color-contrast on Tech-highlights panel | DETAIL-08 | axe skips `hidden` content; panel is hidden by default | Extend `tests/contrast.spec.ts` with a panel-visible path scanning panel selectors across 4 accent hues × 2 themes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
