---
phase: 5
slug: seo-accessibility-polish
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-10
updated: 2026-05-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Source: 05-RESEARCH.md §Validation Architecture. Per-task map populated by the planner from the 8 PLAN.md files.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 (existing — jsdom unit/component tests) + Playwright 1.59.x (NEW — real-browser tests) |
| **Config file** | `vitest.config.ts` (existing); `playwright.config.ts` (NEW — Plan 05-01) |
| **Quick run command** | `npm test` (Vitest, ~5s) |
| **Contrast suite** | `npm run test:contrast` (Playwright — 56 cells = 4 hues × 2 themes × 7 routes) |
| **Full suite command** | `npm test && npm run test:contrast && npm run check:mobile && npm run lint && npm run typecheck && npm run knip && npm run build` |
| **Estimated runtime** | ~5s Vitest; ~30s Playwright contrast; ~90s full suite |

---

## Sampling Rate

- **After every task commit:** `npm test` (Vitest only — fast feedback, ~5s)
- **After every plan wave:** `npm test && npm run check:mobile` for non-axe waves; full suite at end of Wave 4 (Plan 05-07 axe-introducing)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds at task commit; 90 seconds at wave merge

---

## Per-Task Verification Map

> Populated by the planner from the 8 PLAN.md `<verify>` and `<acceptance_criteria>` blocks.

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------|-------------------|-------------|--------|
| 05-01.1 | 05-01 | 0 | SEO-03 (font deps) | T-05-01 / T-05-02 | infra | `node -e "const p=require('./package.json'); ..."` + `test -f assets/JetBrainsMono-Bold.ttf` | ✅ (created in task) | ⬜ pending |
| 05-01.2 | 05-01 | 0 | A11Y-07 (playwright config) | T-05-04 | infra | `test -f playwright.config.ts && npm run test:contrast` (scaffold passes) | ✅ (created in task) | ⬜ pending |
| 05-01.3 | 05-01 | 0 | All Phase 5 reqs (test scaffolds) | T-05-04 | scaffold | `npm test` (4 new test files green) + `node scripts/check-headers.mjs` exits 0 | ✅ (created in task) | ⬜ pending |
| 05-02.1 | 05-02 | 1 | SEO-04 (favicon) | T-05-05 / T-05-06 | smoke | `grep -q '">_"' app/icon.tsx app/apple-icon.tsx && npx tsc --noEmit` | ❌ (NEW: app/icon.tsx, app/apple-icon.tsx) | ⬜ pending |
| 05-02.2 | 05-02 | 1 | SEO-04 (manifest) | T-05-09 | smoke | `grep -q '"browser"' app/manifest.ts && ! grep -q 'standalone' app/manifest.ts` | ❌ (NEW: app/manifest.ts) | ⬜ pending |
| 05-02.3 | 05-02 | 1 | SEO-03 (8 OG cards) | T-05-05 / T-05-06 | smoke | `node scripts/check-og-files.mjs` exits 0 | ❌ (NEW: 8 opengraph-image.tsx files) | ⬜ pending |
| 05-03.1 | 05-03 | 1 | SEO-01, SEO-04 | T-05-10 | unit (TDD) | `npx vitest run app/layout.test.tsx --reporter=verbose` (8 assertions) + `npm run build` no themeColor-deprecated warning | ✅ (extends Wave 0 scaffold) | ⬜ pending |
| 05-03.2 | 05-03 | 1 | A11Y-03 | T-05-11 / T-05-12 | smoke | `node scripts/check-reduced-motion.mjs` exits 0 + `grep -c '@media (prefers-reduced-motion: reduce)' app/globals.css` returns 1 | ✅ (modifies globals.css) | ⬜ pending |
| 05-04.1 | 05-04 | 2 | A11Y-04 (carry-forward) | T-05-13 / T-05-14 | unit (TDD) | `npx vitest run app/components/views/about-view.test.tsx` (10 assertions) | ❌ (NEW: about-socials.tsx) + ✅ (extends about-view.test.tsx) | ⬜ pending |
| 05-04.2 | 05-04 | 2 | A11Y-04 | T-05-13 | smoke + build | `npm run build` exits 0 + `grep -q '<AboutSocials' app/components/views/about-view.tsx` | ✅ (modifies about-view.tsx + globals.css) | ⬜ pending |
| 05-05.1 | 05-05 | 2 | SEO-02 (lib helper) | T-05-17 | unit (TDD) | `npx vitest run lib/json-ld.test.ts --reporter=verbose` (10 assertions) | ❌ (NEW: lib/json-ld.ts) + ✅ (extends Wave 0 scaffold) | ⬜ pending |
| 05-05.2 | 05-05 | 2 | SEO-02 (RSC + XSS escape) | T-05-16 | unit (TDD) | `npx vitest run app/components/shell/json-ld-person.test.tsx` (6 assertions including `< escape`) | ❌ (NEW: json-ld-person.tsx) + ✅ (extends Wave 0 scaffold) | ⬜ pending |
| 05-05.3 | 05-05 | 2 | DEV-02 | T-05-20 | smoke | `node scripts/check-head-comment.mjs` exits 0 | ❌ (NEW: head-comment.tsx) | ⬜ pending |
| 05-05.4 | 05-05 | 2 | SEO-02, DEV-02 (mount) | T-05-16 / T-05-20 | unit + build | `npx vitest run app/layout.test.tsx` (10 total assertions) + `npm run build` | ✅ (modifies app/layout.tsx) | ⬜ pending |
| 05-06.1 | 05-06 | 3 | DEV-01 | T-05-21 / T-05-22 | unit (TDD) | `npx vitest run app/components/shell/console-signature.test.tsx` (6 assertions) | ❌ (NEW: console-signature.tsx) + ✅ (extends Wave 0 scaffold) | ⬜ pending |
| 05-06.2 | 05-06 | 3 | DEV-01 | T-05-21 | smoke | `grep -q '<ConsoleSignature />' 'app/(terminal)/layout.tsx' && ! grep -q '<ConsoleSignature />' app/layout.tsx` | ✅ (modifies (terminal)/layout.tsx) | ⬜ pending |
| 05-07.1 | 05-07 | 4 | A11Y-07 | T-05-24 | smoke | `grep -q 'AxeBuilder' tests/contrast.spec.ts && grep -q 'data-theme' tests/contrast.spec.ts && npx tsc --noEmit` | ✅ (rewrites Wave 0 scaffold) | ⬜ pending |
| 05-07.2 | 05-07 | 4 | A11Y-07 | T-05-24 | integration (run) | `npm run test:contrast` — Run 1 (capture failures to 05-07-AXE-RUN-1.md) | ✅ (consumes Task 1 spec) | ⬜ pending |
| 05-07.3 | 05-07 | 4 | A11Y-07 | T-05-25 | manual checkpoint | Human reviews 05-07-AXE-RUN-1.md and authorizes outcome-a / outcome-b / outcome-c remediation strategy | ✅ (audit trail) | ⬜ pending |
| 05-07.4 | 05-07 | 4 | A11Y-07 | T-05-25 | integration (final) | `npm run test:contrast` — final run; all 56 cells PASS | ✅ (conditional globals.css overrides) | ⬜ pending |
| 05-08.1 | 05-08 | 5 | DEV-03 | (manual) | manual checkpoint | `for path in / /projects /stack /experience /writing /contact /shipped; do curl -sI "http://localhost:3000$path" \| grep -i 'x-built-with'; done` returns 7 lines | ✅ (curl + reviewer judgment) | ⬜ pending |
| 05-08.2 | 05-08 | 5 | DEV-02 | T-05-20 | manual checkpoint | view-source: in Chrome + Firefox shows 6-line greeting; `curl -s http://localhost:3000 \| grep -c "hello, you found the source"` returns 1 | ✅ (cross-browser reviewer judgment) | ⬜ pending |
| 05-08.3 | 05-08 | 5 | A11Y-03 | T-05-11 | manual checkpoint | macOS Reduce Motion toggle ON → reload all 7 routes → no slideIn / no cursor blink / no drawer slide; toggle OFF → animations resume | ✅ (OS preference reviewer judgment) | ⬜ pending |
| 05-08.4 | 05-08 | 5 | SEO-03c | T-05-29 | optional manual | ngrok tunnel + LinkedIn Post Inspector OR DEFERRED-PHASE-7 (default per `<deferred>` allowance) | ✅ (optional reviewer judgment) | ⬜ pending |
| 05-08.5 | 05-08 | 5 | All manual gates | T-05-28 | audit | `test -f .planning/phases/05-seo-accessibility-polish/05-VERIFICATION.md && grep -q 'verdict:' 05-VERIFICATION.md` | ✅ (audit-trail file) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Coverage check:** Each Phase 5 requirement appears in at least one task row above:
- SEO-01: 05-03.1
- SEO-02: 05-05.1, 05-05.2, 05-05.4
- SEO-03: 05-01.1, 05-02.3, (manual 05-08.4)
- SEO-04: 05-02.1, 05-02.2, 05-03.1
- A11Y-03: 05-03.2, (manual 05-08.3)
- A11Y-07: 05-01.2, 05-07.1, 05-07.2, 05-07.3, 05-07.4
- DEV-01: 05-06.1, 05-06.2
- DEV-02: 05-05.3, 05-05.4, (manual 05-08.2)
- DEV-03: 05-01.3 (source-level smoke), (manual 05-08.1 runtime curl)
- Phase 4 carry-forward (A11Y-04 inline socials): 05-04.1, 05-04.2

---

## Wave 0 Requirements

Files that MUST exist before Wave 1 commits begin (delivered by Plan 05-01):

- [x] `tests/contrast.spec.ts` — Playwright contrast spec scaffold (real matrix in Plan 05-07)
- [x] `playwright.config.ts` — Playwright runtime config; `webServer` boots `next dev`
- [x] `app/components/shell/json-ld-person.test.tsx` — covers SEO-02a, SEO-02c (extended in Plan 05-05)
- [x] `lib/json-ld.test.ts` — covers SEO-02b (extended in Plan 05-05)
- [x] `app/components/shell/console-signature.test.tsx` — covers DEV-01 (extended in Plan 05-06)
- [x] `app/layout.test.tsx` — covers SEO-01 (twitter card), SEO-04b (viewport.themeColor) (extended in Plan 05-03)
- [x] `scripts/check-og-files.mjs` — smoke: all 8 OG files exist (real check passes after Plan 05-02)
- [x] `scripts/check-reduced-motion.mjs` — smoke: globals.css has the universal-selector reset (passes after Plan 05-03)
- [x] `scripts/check-head-comment.mjs` — smoke: 6-line HTML comment in source (passes after Plan 05-05)
- [x] `scripts/check-headers.mjs` — smoke: `x-built-with` header present (passes today; verifies slot intact)
- [x] Devdep install: `npm install --save-dev @axe-core/playwright@^4.11.3 playwright@^1.59.1 && npx playwright install chromium`
- [x] Asset addition: `assets/JetBrainsMono-Bold.ttf` + `assets/JetBrainsMono-Medium.ttf` + `assets/JETBRAINS-MONO-LICENSE.txt` (~150KB total)
- [x] Extend `app/components/views/about-view.test.tsx` — covers Phase 4 carry-forward (extended in Plan 05-04)
- [x] `package.json` script addition: `"test:contrast": "playwright test"`

(Checkmarks indicate Plan 05-01 plans the file; the actual file creation happens during execute-phase.)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Plan | Test Instructions |
|----------|-------------|------------|------|-------------------|
| OS Reduce Motion toggle disables animations site-wide | A11Y-03 | Real OS preference media-query plumbing — `emulateMedia` is a proxy, not the actual user pathway | 05-08 Task 3 | macOS System Settings → Accessibility → Display → Reduce motion ON; reload each route; observe |
| Slack/LinkedIn unfurl visual fidelity | SEO-03c | OG image rendering depends on third-party scrapers; cannot be verified at localhost without tunneling | 05-08 Task 4 (optional) | ngrok tunnel + LinkedIn Post Inspector OR DEFERRED-PHASE-7 |
| `view-source:` shows 6-line HTML comment in `<head>` | DEV-02 | Browser-rendered DOM strips comments; raw view-source is the only authoritative check; cross-browser preservation per RESEARCH Assumption A1 | 05-08 Task 2 | `view-source:http://localhost:3000` in Chrome + Firefox; search for `hello, you found` |
| `curl -I http://localhost:3000` shows `x-built-with: nextjs-15-react-19` | DEV-03 | Already shipped Phase 1 — Phase 5 verifies on every route | 05-08 Task 1 | `for path in / /projects ...; do curl -sI ...; done` |
| Per-hue chroma override authorization (D-22) | A11Y-07 | If Outcome C surfaces in Plan 05-07, the override list requires user input on remediation aggressiveness | 05-07 Task 3 | Human reviews 05-07-AXE-RUN-1.md and authorizes outcome-a / outcome-b / outcome-c |

---

## Validation Sign-Off

- [x] All tasks have `<verify>` block with `<automated>` command (or are flagged checkpoint:human-verify with explicit `<resume-signal>`)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (manual gates are isolated to Plan 05-08; automated gates blanket Plans 05-01 through 05-07)
- [x] Wave 0 covers all MISSING references (test files, scripts, fonts, devdeps) — Plan 05-01 scaffolds all of them
- [x] No watch-mode flags in CI commands (`npm test` is `vitest run`, NOT `vitest watch`; `npm run test:contrast` is `playwright test`)
- [x] Feedback latency < 5s at task commit (Vitest); < 90s at wave merge (full suite ~90s)
- [x] `nyquist_compliant: true` set in frontmatter (this update — planner has populated §Per-Task Verification Map)
- [x] All 9 phase requirements (SEO-01..04, A11Y-03, A11Y-07, DEV-01, DEV-02, DEV-03) covered + Phase 4 carry-forward (AboutSocials)

**Approval:** planner — 2026-05-10
