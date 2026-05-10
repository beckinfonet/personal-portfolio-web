// tests/contrast.spec.ts
// SCAFFOLD: Wave 0 stub. Real 4-hue x 2-theme x 7-route matrix lands in Plan 05-07
// (per RESEARCH Pattern 7). This stub keeps `npm run test:contrast` green so
// package.json wiring is verified end-to-end before Wave 1 implementation begins.

import { test, expect } from "@playwright/test";

test("scaffold: dev server boots and serves homepage HTTP 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
});
