import { render, screen } from "@testing-library/react";
import StackPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "stack"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/stack"
}));

describe("StackPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await StackPage();
    render(ui);
    expect(screen.getByText("cat stack.json | jq")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("stack.json — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'cat stack.json | jq'", async () => {
    const ui = await StackPage();
    render(ui);
    expect(screen.getByText("cat stack.json | jq")).toBeInTheDocument();
  });
});
