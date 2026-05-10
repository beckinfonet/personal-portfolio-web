import { describe, test, expect } from "vitest";
import { metadata, viewport } from "./layout";

describe("RootLayout metadata", () => {
  test("metadata.twitter.card is summary_large_image (SEO-01 / D-06)", () => {
    expect(metadata.twitter).toBeDefined();
    // The metadata.twitter type union is Twitter | null — narrow with object check
    expect((metadata.twitter as { card?: string }).card).toBe("summary_large_image");
  });

  test("metadata.twitter.title matches root title", () => {
    expect((metadata.twitter as { title?: string }).title).toBe(
      "Bakytbek Tatibekov — Sr. Software Engineer"
    );
  });

  test("metadata.twitter.description matches root description", () => {
    expect((metadata.twitter as { description?: string }).description).toBe(
      "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact."
    );
  });

  test("metadata.themeColor is NOT set (Pitfall 3 — must live in viewport)", () => {
    // Forbidden: themeColor in metadata is deprecated in Next 14+
    expect((metadata as { themeColor?: unknown }).themeColor).toBeUndefined();
  });
});

describe("RootLayout viewport (SEO-04 / D-15 corrected per Pitfall 3)", () => {
  test("viewport export exists (separate from metadata)", () => {
    expect(viewport).toBeDefined();
  });

  test("viewport.themeColor is an array of 2 per-scheme entries", () => {
    const themeColor = (viewport as { themeColor?: Array<{ media: string; color: string }> })
      .themeColor;
    expect(Array.isArray(themeColor)).toBe(true);
    expect(themeColor).toHaveLength(2);
  });

  test("viewport.themeColor dark scheme = #0a0c0b (matches --bg)", () => {
    const themeColor = (viewport as { themeColor?: Array<{ media: string; color: string }> })
      .themeColor!;
    const dark = themeColor.find((t) => t.media.includes("dark"));
    expect(dark?.color).toBe("#0a0c0b");
  });

  test("viewport.themeColor light scheme = #f4f2ea (matches --bg)", () => {
    const themeColor = (viewport as { themeColor?: Array<{ media: string; color: string }> })
      .themeColor!;
    const light = themeColor.find((t) => t.media.includes("light"));
    expect(light?.color).toBe("#f4f2ea");
  });
});
