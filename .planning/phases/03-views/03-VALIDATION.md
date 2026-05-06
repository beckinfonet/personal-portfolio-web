---
phase: 3
slug: views
status: ready
nyquist_compliant: true
wave_0_complete: true
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
| 03-01-01 | 01 | 1 | SEO-05, VIEW-08 | T-03-15 (reverse tabnabbing) | `<a target="_blank" rel="noopener noreferrer">` enforced via primitive | unit | `npm test && npm run typecheck` | ❌ Wave 1 | ⬜ pending |
| 03-01-02 | 01 | 1 | VIEW-08 | — | RSC discipline (no use client) | static | `grep -L '"use client"' app/components/primitives/{tech-chip,kbd}.tsx \| wc -l` returns 2 | ❌ Wave 1 | ⬜ pending |
| 03-02-01 | 02 | 1 | VIEW-08, VIEW-03, VIEW-06, VIEW-07 | — | client island budget = 1 (only CopyButton) | static | `grep -l '"use client"' app/components/primitives/copy-button.tsx` exists | ❌ Wave 1 | ⬜ pending |
| 03-02-02 | 02 | 1 | VIEW-08, TEST-05 | — | Click → label swap behavior | unit (RTL) | `npm test -- copy-button.test.tsx` | ❌ Wave 1 | ⬜ pending |
| 03-03-01 | 03 | 1 | VIEW-07 | T-03-license (brand-asset compliance) | Official-source SVGs committed unchanged | manual | Manual: confirm `public/badges/*.svg` checksums match official sources; JSDoc cites URL+date | ❌ Wave 1 | ⬜ pending |
| 03-03-02 | 03 | 1 | VIEW-07, VIEW-08, SEO-05 | T-03-15 | StoreBadge composes ExternalLink (rel=noopener noreferrer) | static + unit | `grep -L '"use client"' app/components/primitives/store-badge.tsx \| wc -l` returns 1; `npm test` | ❌ Wave 1 | ⬜ pending |
| 03-04-01 | 04 | 2 | VIEW-01..08 | — | View body styling matches UI-SPEC | static | `grep '\.about-view\|\.projects-grid\|\.stack-pre\|\.experience-row\|\.writing-list\|\.contact-card\|\.shipped-row' app/globals.css` returns hits for all view sections | ❌ Wave 2 | ⬜ pending |
| 03-05-01 | 05 | 3 | VIEW-01, VIEW-08, SEO-05 | T-03-15, T-03-16 | RSC + ExternalLink for socials | static | `grep -c '"use client"' app/components/views/about-view.tsx` returns 0; `grep -c 'target="_blank"' ...` returns 0 | ❌ Wave 3 | ⬜ pending |
| 03-05-02 | 05 | 3 | ROUTE-01, ROUTE-02 | T-03-18 | Async RSC; LOCKED title; canonical | static + build | `grep "alternates" app/(terminal)/page.tsx`; `npm run build` exits 0 | ❌ Wave 3 | ⬜ pending |
| 03-05-03 | 05 | 3 | TEST-05 | — | Smoke: render + title + prompt-line | unit | `npm test -- 'app/(terminal)/page.test.tsx'` | ❌ Wave 3 | ⬜ pending |
| 03-06-01 | 06 | 4 | VIEW-02, VIEW-08 | T-03-15 | RSC; ExternalLink for project external links | static | `grep -c '"use client"' app/components/views/projects-view.tsx` returns 0 | ❌ Wave 4 | ⬜ pending |
| 03-06-02 | 06 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Async RSC + smoke spec | unit | `npm test -- 'app/(terminal)/projects/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-07-01 | 07 | 4 | VIEW-03, VIEW-08 | — | RSC view + hand-rolled JSON highlighter; CopyButton composed | static | `grep -c '"use client"' app/components/views/stack-view.tsx` returns 0; `grep -q 'CopyButton' app/components/views/stack-view.tsx` | ❌ Wave 4 | ⬜ pending |
| 03-07-02 | 07 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Stack page + smoke spec | unit | `npm test -- 'app/(terminal)/stack/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-08-01 | 08 | 4 | VIEW-04, VIEW-08 | — | RSC; hex-hash decorated rows | static | `grep -c '"use client"' app/components/views/experience-view.tsx` returns 0 | ❌ Wave 4 | ⬜ pending |
| 03-08-02 | 08 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Experience page + smoke spec | unit | `npm test -- 'app/(terminal)/experience/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-09-01 | 09 | 4 | VIEW-05, VIEW-08, SEO-05 | T-03-15, T-03-16 | RSC; ExternalLink for post links | static | `grep -c '"use client"' app/components/views/writing-view.tsx` returns 0; `grep -c 'target="_blank"' ...` returns 0 | ❌ Wave 4 | ⬜ pending |
| 03-09-02 | 09 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Writing page + smoke spec | unit | `npm test -- 'app/(terminal)/writing/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-10-01 | 10 | 4 | VIEW-06, VIEW-08, SEO-05 | T-03-15, T-03-16 | RSC; CopyButton for email; mailto safe | static | `grep -c '"use client"' app/components/views/contact-view.tsx` returns 0; `grep -q 'CopyButton' ...` | ❌ Wave 4 | ⬜ pending |
| 03-10-02 | 10 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Contact page + smoke spec | unit | `npm test -- 'app/(terminal)/contact/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-11-01 | 11 | 4 | VIEW-07, VIEW-08, SEO-05 | T-03-15, T-03-license | RSC; StoreBadge composed; deep links via ExternalLink | static | `grep -c '"use client"' app/components/views/shipped-view.tsx` returns 0; `grep -q 'StoreBadge' ...` | ❌ Wave 4 | ⬜ pending |
| 03-11-02 | 11 | 4 | ROUTE-01, ROUTE-02, TEST-05 | — | Shipped page + smoke spec | unit | `npm test -- 'app/(terminal)/shipped/page.test.tsx'` | ❌ Wave 4 | ⬜ pending |
| 03-12-01 | 12 | 5 | ROUTE-02, TEST-05 | T-03-19, T-03-20 | Cross-view title-uniqueness; canonical; drift guard | unit | `npm test -- 'app/(terminal)/views.test.tsx'` (4 tests) | ❌ Wave 5 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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

- [x] All tasks have `<automated>` verify or are Wave 0 / manual-only with documented justification (03-03-01 license compliance is manual-only by design)
- [x] Sampling continuity: every task has either an automated `npm test`/`grep`/`npm run build` check or is Wave 1 manual (single task)
- [x] Wave 0 covers all MISSING references (none required — Phase 2 left infra ready)
- [x] No watch-mode flags
- [x] Feedback latency < 10s (Vitest single-pass ~5s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-06
