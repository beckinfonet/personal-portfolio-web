import { render, screen } from "@testing-library/react";
import ContactPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "contact"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/contact"
}));

describe("ContactPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await ContactPage();
    render(ui);
    expect(screen.getByText("./contact.sh --whoami")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("contact.sh — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text './contact.sh --whoami'", async () => {
    const ui = await ContactPage();
    render(ui);
    expect(screen.getByText("./contact.sh --whoami")).toBeInTheDocument();
  });
});
