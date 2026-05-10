---
phase: 5
slug: seo-accessibility-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Source: 05-RESEARCH.md §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 (existing — jsdom unit/component tests) + Playwright 1.59.x (NEW — real-browser tests) |
| **Config file** | `vitest.config.ts` (existing); `playwright.config.ts` (NEW — Wave 0) |
| **Quick run command** | `npm test` (Vitest, ~5s) |
| **Contrast suite** | `npm run test:contrast` (Playwright — 56 cells = 4 hues × 2 themes × 7 routes) |
| **Full suite command** | `npm test && npm run test:contrast && npm run check:mobile && npm run lint && npm run typecheck && npm run knip && npm run build` |
| **Estimated runtime** | ~5s Vitest; ~30s Playwright contrast; ~90s full suite |

---

## Sampling Rate

- **After every task commit:** `npm test` (Vitest only — fast feedback, ~5s)
- **After every plan wave:** `npm test && npm run check:mobile` for non-axe waves; full suite at end of axe-introducing wave
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds at task commit; 90 seconds at wave merge

---

## Per-Task Verification Map

> Filled by planner during PLAN.md authoring. Each task in every PLAN.md MUST map to a Requirement ID below and either an automated command from §Phase Requirements → Test Map (RESEARCH.md) or a manual gate documented in §Manual-Only Verifications.

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | ⬜ pending |

*Planner: populate this table from each PLAN.md `<verification>` block.*

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Files that MUST exist before Wave 1 commits begin:

- [ ] `tests/contrast.spec.ts` — Playwright contrast spec (A11Y-07; 4 hues × 2 themes × 7 routes)
- [ ] `playwright.config.ts` — Playwright runtime config; `webServer` boots `next dev`
- [ ] `app/components/shell/json-ld-person.test.tsx` — covers SEO-02a, SEO-02c (`<` escape)
- [ ] `lib/json-ld.test.ts` — covers SEO-02b (filterValidUrls)
- [ ] `app/components/shell/console-signature.test.tsx` — covers DEV-01
- [ ] `app/layout.test.tsx` — covers SEO-01 (twitter card), SEO-04b (viewport.themeColor per-scheme)
- [ ] `scripts/check-og-files.mjs` — smoke: all 8 OG files exist (root + 7 routes)
- [ ] `scripts/check-reduced-motion.mjs` — smoke: globals.css has the universal-selector reset block
- [ ] `scripts/check-head-comment.mjs` — smoke: 6-line HTML comment in `view-source` output
- [ ] `scripts/check-headers.mjs` — smoke: `x-built-with` header present (DEV-03)
- [ ] Devdep install: `npm install --save-dev @axe-core/playwright@^4.11.3 playwright@^1.59.1 && npx playwright install chromium`
- [ ] Asset addition: `assets/JetBrainsMono-Bold.ttf` + `assets/JetBrainsMono-Medium.ttf` (~150KB total) — see RESEARCH Pitfall 4 (next/font/google does NOT work in ImageResponse)
- [ ] Extend `app/components/views/about-view.test.tsx` — covers Phase 4 carry-forward (AboutSocials block renders 3 rows)
- [ ] `package.json` script addition: `"test:contrast": "playwright test"`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OS Reduce Motion toggle disables animations site-wide | A11Y-03 | Validates real OS preference media-query plumbing — automated `emulateMedia` is a proxy, not the actual user pathway | Tester enables Reduce Motion in macOS System Settings → Accessibility → Display, reloads each route, observes no `slideIn` body fade, no cursor blink, no drawer slide animation |
| Slack/LinkedIn unfurl visual fidelity | SEO-03c | OG image rendering depends on third-party scrapers; cannot be verified at localhost without tunneling. Defer-to-prod acceptable (Phase 7 covers final under DEPLOY-04) | OPTIONAL Phase 5: ngrok-tunnel localhost, post URL to private Slack channel, observe unfurl image renders the matrix-accent OG card with route label |
| `view-source:` shows 6-line HTML comment greeting in `<head>` | DEV-02 | Browser-rendered DOM strips comments; raw `view-source:` is the only authoritative check. Automated by `scripts/check-head-comment.mjs` (curl + grep) — keep dual-track (script + manual) | Open `view-source:http://localhost:3000` in Chrome/Firefox; confirm 6 consecutive `<!--` comment lines containing greeting + email + GitHub URL |
| `curl -I http://localhost:3000` shows `x-built-with: nextjs-15-react-19` | DEV-03 | Already shipped Phase 1 — Phase 5 only verifies. Automated by `scripts/check-headers.mjs` | `curl -I http://localhost:3000 \| grep -i x-built-with` returns the expected header |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (test files, scripts, fonts, devdeps)
- [ ] No watch-mode flags in CI commands
- [ ] Feedback latency < 5s at task commit; < 90s at wave merge
- [ ] `nyquist_compliant: true` set in frontmatter once planner has populated §Per-Task Verification Map
- [ ] All 9 phase requirements (SEO-01..04, A11Y-03, A11Y-07, DEV-01, DEV-02, DEV-03) covered + Phase 4 carry-forward (AboutSocials)

**Approval:** pending
