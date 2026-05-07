import { render, screen } from "@testing-library/react";
import ShippedPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "shipped"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/shipped"
}));

describe("ShippedPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await ShippedPage();
    render(ui);
    expect(screen.getByText("ls -la shipped/")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("shipped.app — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'ls -la shipped/'", async () => {
    const ui = await ShippedPage();
    render(ui);
    expect(screen.getByText("ls -la shipped/")).toBeInTheDocument();
  });
});
