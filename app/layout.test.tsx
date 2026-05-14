import { describe, test, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { metadata, viewport } from "./layout";
import RootLayout from "./layout";

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

describe("RootLayout <head> mount points (Phase 5 SEO-02 + DEV-02)", () => {
  // RootLayout renders <html><head>...</head><body>...</body></html>. RTL refuses
  // to mount that into a <div> container ("<html> cannot be a child of <div>"), so
  // we serialize the JSX tree to an HTML string via react-dom/server and grep the
  // markup. Same contract — "<JsonLdPerson /> + <HeadComment /> are mounted in
  // <head>" — different inspection surface (string vs DOM).
  //
  // Plan 07-10: RootLayout is now async (calls await getProfile()) — invoke the layout
  // function directly to obtain the JSX tree, then serialize via renderToStaticMarkup.
  async function renderLayoutMarkup(): Promise<string> {
    const tree = await RootLayout({ children: <div>child</div> });
    return renderToStaticMarkup(tree);
  }

  test("renders <JsonLdPerson /> as a child of <head>", async () => {
    const html = await renderLayoutMarkup();
    // <script type="application/ld+json"> is unique to JsonLdPerson in this layout
    expect(html).toMatch(
      /<head>[\s\S]*<script type="application\/ld\+json"[\s\S]*<\/head>/
    );
  });

  test("renders <HeadComment /> noscript host as a child of <head>", async () => {
    const html = await renderLayoutMarkup();
    // <noscript> is unique to HeadComment in this layout; its payload is the
    // 6-line lowercase greeting (rendered as raw HTML inside the <noscript>).
    expect(html).toMatch(/<head>[\s\S]*<noscript>[\s\S]*<\/head>/);
    expect(html).toContain("hello, you found the source");
  });
});
