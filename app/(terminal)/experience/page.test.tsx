import { render, screen } from "@testing-library/react";
import ExperiencePage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "experience"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/experience"
}));

describe("ExperiencePage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await ExperiencePage();
    render(ui);
    expect(
      screen.getByText("git log --oneline --decorate experience.log")
    ).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("experience.log — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text", async () => {
    const ui = await ExperiencePage();
    render(ui);
    expect(
      screen.getByText("git log --oneline --decorate experience.log")
    ).toBeInTheDocument();
  });

  test("body renders at least one experience card aria-label (spec 2026-05-14 §6)", async () => {
    const ui = await ExperiencePage();
    render(ui);
    // Every populated entry yields one article with aria-label="Experience at ... as ..., ..."
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards[0]).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/^Experience at .+ as .+, .+$/)
    );
  });
});
