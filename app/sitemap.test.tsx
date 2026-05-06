import sitemap from "./sitemap";
import { ROUTES } from "@/lib/routes";

describe("sitemap", () => {
  test("returns an array with the same length as ROUTES", () => {
    const result = sitemap();
    expect(result).toHaveLength(ROUTES.length);
  });

  test("returns exactly 7 entries", () => {
    const result = sitemap();
    expect(result).toHaveLength(7);
  });

  test("each entry has a url, changeFrequency, and priority", () => {
    const result = sitemap();
    result.forEach((entry) => {
      expect(entry).toHaveProperty("url");
      expect(entry).toHaveProperty("changeFrequency");
      expect(entry).toHaveProperty("priority");
    });
  });

  test("root route (slug null) has priority 1", () => {
    const result = sitemap();
    const rootEntry = result.find((e) => e.url.endsWith("/") && !e.url.endsWith("/projects") && !e.url.endsWith("/stack") && !e.url.endsWith("/experience") && !e.url.endsWith("/writing") && !e.url.endsWith("/contact") && !e.url.endsWith("/shipped"));
    expect(rootEntry?.priority).toBe(1);
  });

  test("non-root routes have priority 0.8", () => {
    const result = sitemap();
    const nonRoot = result.filter((e) => e.priority !== 1);
    nonRoot.forEach((entry) => {
      expect(entry.priority).toBe(0.8);
    });
  });
});
