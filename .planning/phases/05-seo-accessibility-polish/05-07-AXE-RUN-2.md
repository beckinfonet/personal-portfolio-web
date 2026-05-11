# Phase 5 Plan 07 — Axe Matrix Run 2 (post-remediation)

**Date:** 2026-05-10
**Spec:** `tests/contrast.spec.ts` (4 hues × 2 themes × 7 routes = 56 cells)
**Command:** `npm run test:contrast` (Playwright drives `npm run build && npm run start` via `playwright.config.ts`)
**Total tests reported by Playwright:** `Running 56 tests using 1 worker`
**Final outcome:** **56 / 56 PASS** (33.3s wall-clock)
**Strategy authorized:** `outcome-c — build-then-start + global-muted-bump + global-accent-dim-bump + predicted-amber-scoped-override` (with two infrastructure deviations applied during iteration; see below)

---

## Iteration history

This single document covers four executions: one infrastructure-fix iteration, two CSS-fix iterations, and the final clean pass. Each iteration produced new evidence; the failures surfaced in iteration N were unaddressable until iteration N-1 succeeded.

| Iteration | Command | Pass | Fail | Root cause | Action committed |
|-----------|---------|------|------|-----------|------------------|
| Run 2 (a) | dev-server (Run 1 infrastructure) | 2 | 54 | 54 cells canary-timed-out (dev compile lag) | Run 1 captured the data → switched `webServer.command` to `npm run build && npm run start` (commit `9a2f7af`) and bumped timeout to 120s |
| Run 2 (b) | build+start, no reduced-motion | 0 | 56 | `.content-block` `slideIn` animation in-flight when axe runs; axe composites foreground with parent opacity ≈ 0.14 → reports impossibly dark colors (e.g. `oklch(0.62 …)` rendered as `#343736`) | Set Playwright `contextOptions.reducedMotion: "reduce"` so the Plan 05-03 universal `*` animation reset fires (commits `56dad99` + `0034e21`) |
| Run 2 (c) | build+start, reduced-motion | 28 | 28 | Dark cells passed; light cells all failed because the new `:root` override (specificity 0,1,0) won source-order over `[data-theme="light"]` (also 0,1,0) and bled into light theme | Scoped the override to `[data-theme="dark"]` (commit `ed573cd`) |
| Run 2 (d) | build+start, reduced-motion, dark-scoped | 28 | 28 | Dark cells still passed; light cells exposed a hue-INDEPENDENT failure not visible in Run 1: light `--muted: #6a7370` on light `--bg: #f4f2ea` scored 4.35:1 (need 4.5:1) | Added `@supports :root [data-theme="light"] { --muted: oklch(0.46 0.005 175); }` (commit `76df6fa`) |
| **Run 2 (e) — final** | build+start, reduced-motion, both themes bumped | **56** | **0** | — | none |

The final Run 2 (e) is the result captured in this file. Earlier iterations are documented for the audit trail but not re-run separately.

---

## Final remediation: applied changes

Three CSS changes in `app/globals.css` (all gated by `@supports (color: oklch(0 0 0))` to preserve the sRGB-fallback path):

```css
/* Dark theme: lift muted text + dim accent (hue-independent failures) */
[data-theme="dark"] {
  --muted:      oklch(0.62 0.005 175);          /* was ~oklch(0.49 0.005 175) ≈ #6a7370 */
  --accent-dim: oklch(0.70 0.12 var(--accent-hue));   /* was oklch(0.45 0.12 var(--accent-hue)) */
}

/* Light theme: darken muted text (hue-independent failure, Run 3 discovery) */
[data-theme="light"] {
  --muted: oklch(0.46 0.005 175);   /* was #6a7370 sRGB at 4.35:1 on #f4f2ea */
}

/* Amber accent on light theme (Pitfall 5 predicted; applied pre-emptively) */
[data-theme="light"][style*="--accent-hue: 75"] {
  --warn: oklch(0.42 0.18 75);   /* was oklch(0.5 0.16 60) at light theme */
}
```

Plus two infrastructure changes in `playwright.config.ts`:

```ts
use: {
  contextOptions: { reducedMotion: "reduce" },   // see iteration (b) above
},
webServer: {
  command: "npm run build && npm run start",     // see iteration (a) above
  timeout: 120_000,
},
```

The existing `:root` and `[data-theme="light"]` token blocks at lines 7-82 (sRGB fallbacks + base oklch palette) were not modified. The reduced-motion universal-selector reset from Plan 05-03 (lines 152-172) was not modified. Per D-22, the overrides are theme-scoped, not global.

---

## Cell-by-cell summary (final Run 2 (e))

All 56 cells PASS axe `color-contrast` at WCAG 2.1 AA (≥4.5:1 body, ≥3:1 large/UI).

| Cell idx | Theme  | Hue (label)   | Route        | Status | Duration |
| -------- | ------ | ------------- | ------------ | ------ | -------- |
| 1        | dark   | 145 (matrix)  | `/`          | PASS   | 561ms    |
| 2        | dark   | 145 (matrix)  | `/projects`  | PASS   | 365ms    |
| 3        | dark   | 145 (matrix)  | `/stack`     | PASS   | 389ms    |
| 4        | dark   | 145 (matrix)  | `/experience`| PASS   | 362ms    |
| 5        | dark   | 145 (matrix)  | `/writing`   | PASS   | 368ms    |
| 6        | dark   | 145 (matrix)  | `/contact`   | PASS   | 373ms    |
| 7        | dark   | 145 (matrix)  | `/shipped`   | PASS   | 355ms    |
| 8–14     | dark   | 75 (amber)    | × 7 routes   | PASS   | ~370ms ea |
| 15–21    | dark   | 200 (cyan)    | × 7 routes   | PASS   | ~370ms ea |
| 22–28    | dark   | 340 (magenta) | × 7 routes   | PASS   | ~360ms ea |
| 29–35    | light  | 145 (matrix)  | × 7 routes   | PASS   | ~400ms ea |
| 36–42    | light  | 75 (amber)    | × 7 routes   | PASS   | ~410ms ea |
| 43–49    | light  | 200 (cyan)    | × 7 routes   | PASS   | ~410ms ea |
| 50–56    | light  | 340 (magenta) | × 7 routes   | PASS   | ~410ms ea |

Total: **56 passed, 0 failed** in 33.3s on 1 worker.

---

## Contrast ratios achieved (representative selectors)

These were the dominant failure modes from Run 1 + the iterations; spot-checking the final paint state confirms each cleared the WCAG 2.1 AA threshold.

### Dark theme (--bg = #0a0c0b)

| Token (final value)                          | Selectors                                                | Old ratio | New ratio | Threshold | Pass |
| -------------------------------------------- | -------------------------------------------------------- | --------- | --------- | --------- | ---- |
| `--muted: oklch(0.62 0.005 175)`             | `.topbar-path`, `.about-meta`, `.contact-label`, `.sb-section-header`, `.breadcrumb-path`, PrintFooter spans | 4.01      | ~5.6      | 4.5       | ✓    |
| `--accent-dim: oklch(0.70 0.12 145)` (matrix) | `.color`, `.to` accent text, low-emphasis accent UI       | 1.72      | ~6.2      | 4.5       | ✓    |
| `--accent: oklch(0.78 0.18 145)` (unchanged)  | `.about-role`, `.projects-row-name`                       | (passes)  | (passes)  | 4.5       | ✓    |

### Light theme (--bg = #f4f2ea)

| Token (final value)                          | Selectors                                                | Old ratio | New ratio | Threshold | Pass |
| -------------------------------------------- | -------------------------------------------------------- | --------- | --------- | --------- | ---- |
| `--muted: oklch(0.46 0.005 175)`             | same set as dark theme (cascade applies on light bg)      | 4.35      | ~5.0      | 4.5       | ✓    |
| `--warn: oklch(0.42 0.18 75)` (amber-on-light) | (verifies the pre-emptive amber override never triggered axe failure in any cell — the predicted Pitfall 5 was successfully pre-empted) | — | (passes) | 4.5 / 3.0 | ✓ |

The amber-on-light override at `[data-theme="light"][style*="--accent-hue: 75"]` did not cause regressions and was sufficient on its own for that cell (i.e. once the muted token was fixed, no amber-specific surfaces remained in violation).

---

## Architectural notes

1. **Why scope to `[data-theme="dark"]` and `[data-theme="light"]` instead of `:root`.** Iteration (c) → (d) showed that an unscoped `:root` override at end-of-file wins source-order against the earlier `[data-theme="light"]` block (both have specificity 0,1,0). Per-theme scoping is the only correct cascade pattern for this brownfield CSS structure.

2. **Why `[data-theme="light"][style*="--accent-hue: 75"]` for the amber override.** The `style*=` attribute selector matches the inline-style attribute that `AccentBootstrapScript` writes on `<html>` before first paint. This gives us a hue-scoped override without introducing a new HTML attribute or class. Specificity (0,2,0) beats the base `[data-theme="light"]` block.

3. **Why `oklch(0.46 0.005 175)` (lower L) on light theme but `oklch(0.62 0.005 175)` (higher L) on dark theme.** Contrast against the LIGHT bg needs DARKER text; against the DARK bg needs LIGHTER text. The chroma and hue stay at 0.005 / 175 in both directions so the muted feel is preserved across themes (a subtle cool-leaning gray).

4. **Why `npm run build && npm run start` instead of `npm run dev`.** Run 1 showed dev mode's lazy per-route compile (~2–10s per first request) overruns the 5s `data-theme` canary timeout in 54/56 cells. `next start` serves pre-compiled bundles; canary fires in ~50–100ms.

5. **Why `reducedMotion: "reduce"` in Playwright context.** Iteration (b) showed that without it, the `.content-block` `slideIn` animation (200ms opacity 0→1) is mid-flight when axe runs, and axe composites all foreground colors with the parent's mid-animation opacity ~0.14 → reports impossibly dark colors. Enabling reduced-motion fires the universal-selector reset in `globals.css:152-172` (Plan 05-03), collapsing animation-duration to 0.01ms so axe sees the final paint. This is also the most semantically correct state for a contrast audit (the design must pass at the steady-state paint that reduced-motion users always experience).

---

## Audit gates passed

- [x] `npm run test:contrast` exits 0 with all 56 cells passing axe `color-contrast` (WCAG 2.1 AA — 4.5:1 body / 3:1 large + UI graphics)
- [x] The Pitfall 10 canary assertion is exercised in every cell (no silent localStorage failures observed; `data-theme="dark"` and `data-theme="light"` confirmed before axe ran in all 56 cells)
- [x] Every override in `app/globals.css` is scoped per `[data-theme=...]` selector (D-22 conservative; no `:root` global mutation; preserves passing cells)
- [x] Existing oklch token blocks at globals.css lines 39-82 are unchanged
- [x] Reduced-motion universal-selector reset (Plan 05-03) is unchanged
- [x] `npx tsc --noEmit` exits 0
- [x] `npm run lint` exits 0
- [x] `npm test` (Vitest) exits 0 — 134/134 tests pass, no regressions

---

## Commits in this remediation pass

| Commit  | Subject                                                                |
| ------- | ---------------------------------------------------------------------- |
| 9a2f7af | test(05-07): switch contrast matrix to build+start for deterministic compile |
| 113b6e7 | feat(05-07): bump --muted and --accent-dim L on dark theme (A11Y-07) (pre-scope fix) |
| 62aa039 | feat(05-07): scope amber-on-light --warn override (Pitfall 5)          |
| 56dad99 | fix(05-07): emulate reduced-motion so axe sees final paint (Rule-3)    |
| 0034e21 | fix(05-07): nest reducedMotion under contextOptions per Playwright types |
| ed573cd | fix(05-07): scope dark-theme token bumps to [data-theme="dark"] (Rule-1) |
| 76df6fa | fix(05-07): bump light-theme --muted L down to clear 4.5:1 (Rule-2)    |

Plus the prior Run-1 commits:

| Commit  | Subject                                                                |
| ------- | ---------------------------------------------------------------------- |
| 0418724 | test(05-07): rewrite contrast spec as 4×2×7 axe matrix (A11Y-07)       |
| dbfacc6 | docs(05-07): capture pre-remediation axe matrix run (A11Y-07)          |

---

## Next step

Plan 05-07 success criteria achieved: 56/56 cells pass at WCAG 2.1 AA. Proceeding to plan-completion deliverables (05-07-SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md updates) and the final metadata commit.
