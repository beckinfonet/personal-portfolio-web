import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "./page";

/* Mock next/navigation for any transitive consumer (defensive — AboutPage itself
   does not use navigation hooks, but the import surface might). */
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => null),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/"
}));

describe("AboutPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await AboutPage();
    render(ui);
    // Any successful render means the RSC composition resolved.
    expect(screen.getByText("cat about.md")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("about.md — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'cat about.md'", async () => {
    const ui = await AboutPage();
    render(ui);
    expect(screen.getByText("cat about.md")).toBeInTheDocument();
  });
});
