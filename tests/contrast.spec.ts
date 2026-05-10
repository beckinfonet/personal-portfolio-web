// tests/contrast.spec.ts
// Phase 5 A11Y-07: 4 hues × 2 themes × 7 routes = 56 cells.
// Each cell seeds localStorage BEFORE first paint so AccentBootstrapScript +
// next-themes pick up the values synchronously. AxeBuilder filters to color-contrast
// violations and asserts the array is empty.
//
// Failure threshold: any serious/critical color-contrast violation fails the build.
// Predicted failure (RESEARCH Pitfall 5): amber-on-light at oklch(0.5 0.16 60).
// Remediation: per-hue chroma overrides ONLY for cells that actually fail (D-22).
//
// Pitfall 10 (CRITICAL): the `data-theme` canary assertion runs BEFORE axe in every
// cell. Without it, a silent localStorage seed failure or a future
// AccentBootstrapScript regression would produce 56 identical axe results against
// the same default theme — false-pass. The canary surfaces seed failures as a
// `data-theme` mismatch error BEFORE axe runs.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES } from "@/lib/routes";

const HUES = [145, 75, 200, 340] as const; // matrix, amber, cyan, magenta
const THEMES = ["dark", "light"] as const;

for (const theme of THEMES) {
  for (const hue of HUES) {
    for (const route of ROUTES) {
      test(`contrast: theme=${theme} accent=${hue} route=${route.pathname}`, async ({ page }) => {
        // Seed localStorage BEFORE first paint so:
        //   - AccentBootstrapScript reads "portfolio-accent" and sets --accent-hue
        //   - next-themes reads "theme" (default storageKey) and sets <html data-theme="...">
        // Both are pre-paint so the rendered page has the right tokens by the time
        // axe runs.
        await page.addInitScript(
          ([t, h]) => {
            try {
              window.localStorage.setItem("theme", t);
              window.localStorage.setItem("portfolio-accent", String(h));
            } catch {
              /* localStorage unavailable — skip; CSS defaults will apply */
            }
          },
          [theme, hue] as const,
        );

        await page.goto(route.pathname);

        // SANITY (Pitfall 10): verify the seed actually applied. Without this,
        // a silent localStorage failure or a future AccentBootstrapScript regression
        // would produce 56 identical axe results. The assertion catches the failure
        // mode before axe runs.
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2aa", "wcag21aa"])
          .analyze();

        const contrastViolations = results.violations.filter(
          (v) => v.id === "color-contrast",
        );

        // Print full violation details on failure for fast remediation.
        if (contrastViolations.length > 0) {
          console.error(
            `Contrast failures @ ${theme}/${hue}/${route.pathname}:`,
            JSON.stringify(
              contrastViolations.map((v) => ({
                id: v.id,
                impact: v.impact,
                nodes: v.nodes.map((n) => ({
                  target: n.target,
                  summary: n.failureSummary,
                })),
              })),
              null,
              2,
            ),
          );
        }

        expect(contrastViolations).toEqual([]);
      });
    }
  }
}
