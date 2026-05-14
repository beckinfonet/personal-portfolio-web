import { render, screen } from "@testing-library/react";
import { Sidebar } from "./sidebar";
import { ROUTES } from "@/lib/routes";
import { PROFILE } from "@/lib/portfolio-data";

/* Mock next/navigation — inject "projects" as the active segment */
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "projects"),
  useRouter: () => ({ push: vi.fn() })
}));

describe("Sidebar", () => {
  test("renders <nav> with accessible label 'File explorer'", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    expect(
      screen.getByRole("navigation", { name: /file explorer/i })
    ).toBeInTheDocument();
  });

  test("renders 7 file rows from ROUTES with correct aria-label", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    ROUTES.forEach((route) => {
      expect(
        screen.getByRole("button", { name: route.ariaLabel })
      ).toBeInTheDocument();
    });
  });

  test("active row has aria-current='page' (segment='projects' → Projects row active)", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    const activeBtn = screen.getByRole("button", { name: "Projects" });
    expect(activeBtn).toHaveAttribute("aria-current", "page");
  });

  test("non-active rows do NOT have aria-current", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    const inactiveBtn = screen.getByRole("button", { name: "About me" });
    expect(inactiveBtn).not.toHaveAttribute("aria-current");
  });

  test("STATUS block shows 'Available for hire'", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
  });

  test("displays uptime prop value", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    expect(screen.getByText("8y 125d")).toBeInTheDocument();
  });

  test("recruiter resume download link is present", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    const links = screen.getAllByRole("link", { name: /download resume/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  test("STATUS block renders via <StatusBlock /> with 'STATUS' header", () => {
    render(<Sidebar uptime="8y 125d" profile={PROFILE} />);
    expect(screen.getByText("STATUS")).toBeInTheDocument();
  });
});
