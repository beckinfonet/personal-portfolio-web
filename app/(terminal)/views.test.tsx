import { ROUTES } from "@/lib/routes";

import { metadata as aboutMeta } from "./page";
import { metadata as projectsMeta } from "./projects/page";
import { metadata as stackMeta } from "./stack/page";
import { metadata as experienceMeta } from "./experience/page";
import { metadata as writingMeta } from "./writing/page";
import { metadata as contactMeta } from "./contact/page";
import { metadata as shippedMeta } from "./shipped/page";

/* Cross-view metadata audit — closes RESEARCH §Pitfall 1 mitigation
   and ROUTE-02 / Phase-3 success criterion (set-deduplication test). */

const VIEWS = [
  { route: ROUTES[0], metadata: aboutMeta },
  { route: ROUTES[1], metadata: projectsMeta },
  { route: ROUTES[2], metadata: stackMeta },
  { route: ROUTES[3], metadata: experienceMeta },
  { route: ROUTES[4], metadata: writingMeta },
  { route: ROUTES[5], metadata: contactMeta },
  { route: ROUTES[6], metadata: shippedMeta }
] as const;

describe("Cross-view metadata audit (TEST-05 / ROUTE-02)", () => {
  test("all 7 view metadata.title strings are unique", () => {
    const titles = VIEWS.map((v) => v.metadata.title);
    expect(new Set(titles).size).toBe(7);
  });

  test("every view exports a non-empty metadata.description", () => {
    for (const { route, metadata } of VIEWS) {
      expect(
        typeof metadata.description === "string" && metadata.description.length > 0,
        `expected metadata.description on ${route.pathname}`
      ).toBe(true);
    }
  });

  test("every view exports alternates.canonical equal to its route pathname", () => {
    for (const { route, metadata } of VIEWS) {
      expect(metadata.alternates?.canonical).toBe(route.pathname);
    }
  });

  test("count of audited views equals ROUTES length (drift guard)", () => {
    expect(VIEWS.length).toBe(ROUTES.length);
    expect(ROUTES.length).toBe(7);
  });
});
