---
phase: 3
slug: views
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 + @testing-library/react 16.2.0 + jsdom 26.1.0 |
| **Config file** | `vitest.config.ts` (project root); setup `vitest.setup.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run typecheck && npm run lint && npm run knip` |
| **Estimated runtime** | ~5 seconds (Vitest single-pass) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run typecheck && npm run lint && npm run knip`
- **Before `/gsd-verify-work`:** Full suite must be green plus `npm run build`
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Populated by planner in step 8 — one row per task across all PLAN.md files.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements (per RESEARCH.md §Validation Architecture / Wave 0 Gaps):

- ✅ Vitest 3.1.4 already configured (`vitest.config.ts`) with jsdom + RTL + jest-dom matchers
- ✅ `vitest.setup.ts` registers jest-dom matchers globally
- ✅ `@testing-library/user-event` installed (Phase 2 D-21)
- ✅ `@/` path alias resolves identically in tests and production
- ✅ Test patterns established by Phase 2 (`sidebar.test.tsx`, `sitemap.test.tsx`, `breadcrumb.test.tsx`)

No Wave 0 install/setup tasks required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Brand-asset license compliance for App Store / Play Store badges | VIEW-07 (shipped view) | License compliance is legal/visual, not test-automatable | Confirm `app/components/primitives/store-badge.tsx` JSDoc cites the official source URL and sourcing date; SVGs are unmodified copies of the official artwork; minimum-size constraints met (Play Store ≥135px) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none required)
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
