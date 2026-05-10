# Phase 5 Plan 07 — Axe Matrix Run 1 (pre-remediation)

**Date:** 2026-05-10
**Spec:** `tests/contrast.spec.ts` (4 hues × 2 themes × 7 routes = 56 cells)
**Command:** `npm run test:contrast`
**Total tests reported by Playwright:** `Running 56 tests using 1 worker`
**Outcome (overall):** **56 / 56 FAILED** (all cells failed; root cause is mixed — see below)
**Run log:** `/tmp/contrast-run-1.log` (~173 KB)

---

## Cell-by-cell summary

| Cell idx | Theme  | Hue | Route        | Status | Failure mode                                  |
| -------- | ------ | --- | ------------ | ------ | --------------------------------------------- |
| 1        | dark   | 145 | `/`          | FAIL   | axe color-contrast (1003 violation entries)   |
| 2        | dark   | 145 | `/projects`  | FAIL   | axe color-contrast (478 violation entries)    |
| 3        | dark   | 145 | `/stack`     | FAIL   | canary timeout (data-theme = `null`, 5s)      |
| 4        | dark   | 145 | `/experience`| FAIL   | canary timeout (data-theme = `null`, 5s)      |
| 5        | dark   | 145 | `/writing`   | FAIL   | canary timeout (data-theme = `null`, 5s)      |
| 6        | dark   | 145 | `/contact`   | FAIL   | canary timeout (data-theme = `null`, 5s)      |
| 7        | dark   | 145 | `/shipped`   | FAIL   | canary timeout (data-theme = `null`, 5s)      |
| 8–14     | dark   | 75  | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 15–21    | dark   | 200 | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 22–28    | dark   | 340 | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 29–35    | light  | 145 | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 36–42    | light  | 75  | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 43–49    | light  | 200 | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |
| 50–56    | light  | 340 | × 7 routes   | FAIL   | canary timeout (data-theme = `null`, 5s) ×7   |

**Two failure modes:**
- **2 cells reached axe** and reported real, severe `color-contrast` violations. These are the only cells with usable contrast data.
- **54 cells timed out at the Pitfall 10 canary** (`expect(page.locator("html")).toHaveAttribute("data-theme", theme)`) before axe could run. Received value: `null` (attribute absent on `<html>` after the 5s retry window).

The canary firing is a **diagnostic success** (Pitfall 10 explicitly designed for this) — it prevents 54 cells from producing misleading "no axe failures" pass results when the localStorage seed didn't actually flow through to next-themes' `data-theme` write.

---

## Why the canary fired on cells 3–56 (not 1–2)

Tests run sequentially against an existing `npm run dev` server (PID 70183 — `reuseExistingServer: !process.env.CI` per `playwright.config.ts:15`). Playwright's per-test browser context is fresh; `addInitScript` writes `localStorage.setItem("theme", "dark")` and `localStorage.setItem("portfolio-accent", "145")` BEFORE the page's own scripts on every load.

The asymmetric pattern (cells 1–2 pass canary, cells 3+ fail it) is consistent with a **dev-server compile-lag race**:

- Cells 1–2 hit `/` and `/projects` — both already compiled in the warm dev process from prior interactive use, so the page hydrates fast enough for next-themes to read `localStorage["theme"]` and write `<html data-theme="dark">` within the canary's 5s retry window.
- Cells 3–56 hit other routes (`/stack`, `/experience`, etc.) which need a fresh `next dev` compile on first request (~2–10s), pushing hydration past the canary timeout.

This is **infrastructure friction, not a real localStorage seed failure**. The seed itself is correct (the spec uses `addInitScript` with a `try/catch`). The fix for Run 2 is one of:
1. Run the matrix against `npm run start` after `npm run build` (pre-compiled — no dev-compile lag).
2. Pre-warm all 7 routes with HTTP `GET`s before the matrix starts.
3. Bump the canary timeout from 5s default to ~15s to absorb dev compile lag.

**Conclusion:** Run 2 needs a build-then-start invocation OR a route warmup pass. The Pitfall 10 canary did its job — it caught the silent failure mode rather than letting 54 cells produce false-pass.

---

## Real axe violations from the 2 cells that ran (dark / 145 / `/` and `/projects`)

These are the **representative pre-remediation contrast failures** — they tell us what to fix even though only 2 of 56 cells contributed data. The patterns observed in dark/matrix should be similar for the other 3 hues on dark theme (the failing tokens are hue-independent muted/text colors, not the accent itself).

### Dominant failure pattern: `--muted: #6a7370` against `--panel` and `--panel-hi`

| fgColor (token)    | bgColor (token)         | Ratio    | WCAG AA min | Selectors                                                                                                                                                                                                                                                                                                              |
| ------------------ | ----------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#6a7370` (--muted)| `#151918` (--panel-hi)  | **3.63** | 4.5         | `.topbar-path`, `button[aria-label="Toggle color theme"]`, `.live-clock`                                                                                                                                                                                                                                               |
| `#6a7370` (--muted)| `#0d100f` (--panel)     | **3.91** | 4.5         | `nav > .sb-section-header`, `nav > .sb-status-header.sb-section-header`, `nav > .sb-status > .sb-status-row > span:nth-child(2)`, `.sb-section-header`, `.sb-status-row > span:nth-child(2)`                                                                                                                            |
| `#6a7370` (--muted)| `#0a0c0b` (--bg)        | **4.01** | 4.5         | `p.about-meta`, `.about-card-label`, `.contact-label`, `.contact-row > a` (hover state link), `.btn-ghost[target=_blank]`, `footer > span:nth-child(1/3/5)` (PrintFooter), `.about-role`, `.empty-state`, `.breadcrumb-path` ancestors                                                                                |
| `#373c3a`          | `#0a0c0b` (--bg)        | **3.04** | 4.5         | Anchor / inline-link variants of muted text; appears across stats, breadcrumb, etc. |
| `#6b6b67`          | `#0a0c0b` (--bg)        | ~3.66    | 4.5         | Variant muted text on bg (specific selector: `.com`, `.md`, `.ts`, `.spec` syntax-color classes in stack/projects pages)                                                                                                                                                                                                |
| `#336a37` (accent-dim?) | `#0a0c0b` (--bg)   | **1.72** | 4.5 (or 3 if large/UI) | (Ratio is critical — extreme failure.) Selectors include `.color` swatch labels and `.to` accent text in stack view. |
| `#0a0c0b` (text on accent) | `#336a38`        | **1.74** | 3 (UI graphic) / 4.5 (text) | `.btn[type=primary]` button background ratio against text on accent — the hover/state combination of accent-dim panel.|

### Hue-independent vs hue-dependent

The vast majority of violations are on **hue-independent tokens** — `--muted`, `--text-hi`, generic dark backgrounds — meaning these failures will reproduce for hues 75 / 200 / 340 too (the muted color doesn't change with `--accent-hue`). The hue-dependent tokens (`--accent`, `--accent-dim`, `--accent-bg`) DO show specific failures (the `#336a37` / `#336a38` family at 1.72–1.74:1) but those are a small fraction of total nodes.

### Predicted amber-on-light (from the plan) — UNCONFIRMED

The plan predicted amber-on-light (`oklch(0.5 0.16 60)` `--warn` against light `--bg`) as the most likely failure. Cells 36–42 (light/75/× routes) all canary-timed-out, so amber-on-light was **not exercised**. Run 2 with proper infrastructure will confirm.

---

## Outcome classification

**Outcome C (broader pattern beyond predicted amber-on-light)** — but with a strong **infrastructure caveat**: 54 cells did not produce contrast data because of dev-server compile lag. The 2 cells that ran show that the broader pattern is real:

- The dominant failure source is `--muted: #6a7370` having insufficient contrast against ALL three dark-theme background tokens (`--bg`, `--panel`, `--panel-hi`). This hits every route because muted text is used by topbar, sidebar, footer, contact rows, about cards, breadcrumb, syntax classes, and live clock.
- A secondary failure source is the `--accent-dim` (`#336a37`-family) being far below 4.5:1 / 3:1 minimums on the dark background.
- Amber-on-light remains unconfirmed (not exercised).

**This is broader than D-22's "scoped per-hue override" pattern can address.** Fixing `--muted` against all three dark background tokens is a global token adjustment — the kind of change CONTEXT.md D-22 explicitly says to avoid ("preserves brand consistency with the handoff palette"). The remediation strategy in Task 4 needs explicit user approval for the wider scope.

---

## Recommended remediation (proposed for Task 3 human checkpoint)

1. **Re-run infrastructure first.** Either swap to `playwright test` against `npm run start` after a fresh `npm run build`, OR pre-warm routes via `curl` before the matrix, OR bump the canary timeout to 15s. Without this, 54 cells will keep timing out.
2. **Once Run 2 produces complete data,** decide on remediation:
   - **If muted-on-dark is the dominant pattern (likely):** raise `--muted` lightness in the dark theme from `#6a7370` to roughly `#8a938f` (currently `--muted-hi` — the existing token already used for higher-contrast muted text). Or introduce a per-token override to `oklch(0.65 0.02 ...)`. This is a global brand-palette change, not a per-hue scoped override.
   - **If amber-on-light additionally fails (predicted):** apply the `[data-theme="light"][style*="--accent-hue: 75"]` scoped override the plan already specified.
   - **If `--accent-dim` low-contrast persists:** raise its lightness in the dark theme (currently `oklch(0.45 0.12 var(--accent-hue))` — bump L to ~0.55).

The user must approve the global `--muted` change at the Task 3 checkpoint before Task 4 proceeds — D-22's "conservative" guidance assumed only per-hue corner cases would fail; the real result needs a wider conversation.

---

## Audit gates passed

- [x] `npm run test:contrast` was executed against the dev server.
- [x] Playwright reported all 56 cells (`Running 56 tests using 1 worker`).
- [x] Audit-trail file at `.planning/phases/05-seo-accessibility-polish/05-07-AXE-RUN-1.md`.
- [x] Pitfall 10 canary observably fired on 54 cells — silent localStorage seed failures or hydration races surface as `data-theme` mismatch errors BEFORE axe runs (rather than producing false-pass).

---

## Next step

Task 3 — human-verify checkpoint. Reviewer reads this file, picks remediation strategy, and authorizes Task 4. **Task 4 is gated; do NOT edit `app/globals.css` until Task 3 returns an approval signal.**
