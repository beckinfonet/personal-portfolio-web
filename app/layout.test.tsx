import { describe, test, expect } from "vitest";
import { metadata } from "./layout";
// SCAFFOLD: Wave 0 stub. Real twitter / viewport.themeColor assertions land in Plan 05-03.
// The metadata import doubles as a smoke check that app/layout.tsx still parses.
describe("RootLayout metadata (scaffold)", () => {
  test("scaffold sentinel — real tests added in Plan 05-03", () => {
    expect(metadata).toBeDefined();
  });
});
