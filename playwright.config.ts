import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  use: {
    baseURL: "http://localhost:3000",
    // Emulate `prefers-reduced-motion: reduce` so the universal-selector
    // animation reset added in Plan 05-03 (globals.css line ~152) fires and
    // collapses all transitions/animations to 0.01ms. Without this, the
    // `.content-block` slideIn (200ms opacity 0→1) is mid-animation when axe
    // runs against pre-compiled pages — Run 2 surfaced this as DOZENS of
    // false-positive contrast failures where axe composites the painted color
    // with `.content-block { opacity: 0.14 }` and reports the WAY-darker
    // composite. Reduced-motion is also the most semantically correct state
    // for a contrast audit: the design must pass at the FINAL paint state,
    // which reduced-motion users always see. WCAG 2.1 AA testing convention.
    reducedMotion: "reduce",
  },
  // Phase 5 A11Y-07 Run 2 (Outcome C remediation): switch from `npm run dev` to
  // `npm run build && npm run start` so the matrix runs against a pre-compiled
  // production server. The Run 1 audit (.planning/phases/05-seo-accessibility-polish/
  // 05-07-AXE-RUN-1.md) showed 54/56 cells canary-timed-out because Next.js dev
  // mode compiled routes lazily on first request (~2–10s per route), pushing
  // hydration past the 5s `data-theme` canary window. `next start` serves the
  // already-compiled bundles, so the canary fires inside the default Playwright
  // expect timeout. `reuseExistingServer` lets the developer keep a long-running
  // `npm run start` warm between local re-runs.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
