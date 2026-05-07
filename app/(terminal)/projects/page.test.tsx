import { render, screen } from "@testing-library/react";
import ProjectsPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "projects"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects"
}));

describe("ProjectsPage (TEST-05 smoke)", () => {
  test("renders without throwing", async () => {
    const ui = await ProjectsPage();
    render(ui);
    expect(screen.getByText("ls -la projects/")).toBeInTheDocument();
  });

  test("metadata.title is the locked Phase 2 D-12 string", () => {
    expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'ls -la projects/'", async () => {
    const ui = await ProjectsPage();
    render(ui);
    expect(screen.getByText("ls -la projects/")).toBeInTheDocument();
  });
});
