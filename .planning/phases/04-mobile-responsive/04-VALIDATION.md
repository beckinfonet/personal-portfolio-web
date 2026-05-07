---
phase: 4
slug: mobile-responsive
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **Source-of-truth detail:** see `04-RESEARCH.md` §"Validation Architecture" (lines 1098–1188) — that section enumerates 21 automated checks and 9 manual gates with falsifiable assertions per requirement. This file is the orchestrator-friendly summary plus per-task table that the planner will fill.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 + @testing-library/react 16.2.0 + jsdom 26.1.0 + @testing-library/user-event 14.6.1 |
| **Config file** | `vitest.config.ts` (existing — jsdom env, `@/*` alias, setup at `vitest.setup.ts`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run lint && npm run typecheck && node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs` |
| **Estimated runtime** | <10 seconds (Vitest suite + audit scripts) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run the full suite command above
- **Before `/gsd-verify-work`:** Full suite must be green AND manual gates documented in 04-VERIFICATION.md
- **Max feedback latency:** ~10 seconds for the automated battery

---

## Per-Task Verification Map

> Filled by gsd-planner (each task in PLAN.md gets a row). Until plans land, this section captures the requirement-level mapping from RESEARCH.md §"Phase Requirements → Test Map".

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _TBD_   | _TBD_ | _TBD_ | _TBD_       | _TBD_      | _TBD_           | _TBD_     | _TBD_             | _TBD_       | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

> New test files / scripts that must exist before Phase 4 implementation can be feedback-sampled. Pulled from `04-RESEARCH.md` §"Validation Architecture > Wave 0 Gaps".

- [ ] `app/components/shell/explorer-drawer.test.tsx` — covers MOBILE-02 (drawer behavior, focus trap, Esc, backdrop, auto-close-on-nav, 7 routes)
- [ ] `app/components/shell/status-block.test.tsx` — covers MOBILE-04 (3-row render with uptime + tz)
- [ ] `app/components/print-footer.test.tsx` — covers A11Y-09 (URL + email + fallback)
- [ ] `app/components/views/about-view.test.tsx` extension — covers MOBILE-04 (mobile-status DOM presence)
- [ ] `app/components/shell/top-bar.test.tsx` extension — covers MOBILE-02 (hamburger present in DOM, aria-expanded toggles)
- [ ] `app/components/shell/command-palette.test.tsx` extension — covers PALETTE-05 (toggle still fires; component state machine intact)
- [ ] `app/components/shell/sidebar.test.tsx` update — STATUS extraction may shift assertion from inline markup to `<StatusBlock />` presence
- [ ] `scripts/check-sidebar-redistribution.mjs` — Pitfall 7 audit (paired rehome rules for every sidebar element)
- [ ] `scripts/check-print-rules.mjs` — A11Y-09 audit (hide rules + serif body + mono carve-outs + page-break)
- [ ] `scripts/check-mobile-palette-css.mjs` — PALETTE-05 audit (`[cmdk-*]` selectors inside `@media (max-width: 960px)`)

Framework install: not needed — Vitest, jsdom, testing-library, and user-event are already configured.

The planner may consolidate the three audit scripts into one `scripts/check-phase-4-css.mjs` with three independent sections; a failing redistribution check must NOT mask a failing print-rules or palette check.

---

## Manual-Only Verifications

> Items that cannot be automated in jsdom or via static grep. VALIDATION sign-off requires these are exercised in Wave 4 manual review and recorded in 04-VERIFICATION.md.

| # | Behavior | Requirement | Why Manual | Test Instructions |
|---|----------|-------------|------------|-------------------|
| 1 | Resume CTA above the fold at 375×667 on `/` (no scroll) | MOBILE-03 | Layout-pixel measurement — jsdom doesn't lay out | DevTools device toolbar → iPhone SE 375×667 → load `/` → confirm `↓ resume.pdf` button visible without scrolling |
| 2 | Drawer slides up from bottom at <=960px | MOBILE-02 | `@media` queries don't fire in jsdom | DevTools device toolbar → 375px → tap `☰` → confirm slide-in animation, backdrop dim, sheet anchored to bottom |
| 3 | Mobile palette opens as bottom-sheet anchored to viewport bottom; sticky input | PALETTE-05 | `@media` doesn't fire in jsdom | 375px → ⌘K (or tap palette button) → confirm bottom-anchored sheet with sticky search input |
| 4 | STATUS visible only on `/` at <=960px AND only in sidebar at >=961px (no double-render) | MOBILE-04 | CSS visibility-driven | 375 / 768 / 1024 viewports across `/` and other 6 routes → confirm STATUS render rules |
| 5 | Print preview legibility on all 7 routes (white bg, black text, serif body, URL+email footer, no chrome) | A11Y-09 | Print rendering is browser-controlled | Cmd+P preview on `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` |
| 6 | `prefers-reduced-motion` honored — drawer + palette open without slide | A11Y-09 (motion baseline) | OS-level setting | macOS System Settings → Reduce Motion ON → reload → open drawer + palette → confirm no slide |
| 7 | iOS Safari real-device validation: `dvh`/`svh` clipping, soft keyboard, address bar | MOBILE-02 / PALETTE-05 | Real device only | Test on iPhone (Safari): drawer + palette open, soft keyboard appears (palette only), no clipping at sheet bottom |
| 8 | Android Chrome real-device validation | MOBILE-02 / PALETTE-05 | Real device only | Same flow on Android Chrome — confirm parity |
| 9 | 5-second recruiter dry-run on 375px localhost | MOBILE-01..05 / SHELL-03 | Human-time signal, not measurable in code | Hand 375px localhost URL to a non-engineer (or simulate); time-to-resume + time-to-contact discovery; record in 04-VERIFICATION.md |

---

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command OR are listed under Manual-Only Verifications
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Wave 0 covers all `❌ Wave 0` references in `04-RESEARCH.md` §"Validation Architecture"
- [ ] No watch-mode flags in any verify command (`vitest run` not `vitest`)
- [ ] Feedback latency < 10s for the full automated battery
- [ ] Manual gates 1–9 above are scheduled into Wave 4 (manual review) plan
- [ ] `nyquist_compliant: true` set in frontmatter once gsd-planner finishes the per-task table

**Approval:** pending
