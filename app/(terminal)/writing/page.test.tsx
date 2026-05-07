import { render, screen } from "@testing-library/react";
import WritingPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "writing"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/writing"
}));

describe("WritingPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await WritingPage();
    render(ui);
    expect(screen.getByText("ls writing/ && cat *.md")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("writing/ — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'ls writing/ && cat *.md'", async () => {
    const ui = await WritingPage();
    render(ui);
    expect(screen.getByText("ls writing/ && cat *.md")).toBeInTheDocument();
  });
});
