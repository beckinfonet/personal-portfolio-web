import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./breadcrumb";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects"
}));

describe("Breadcrumb", () => {
  test("renders ~/portfolio path prefix", () => {
    render(<Breadcrumb />);
    expect(screen.getByText("~/portfolio")).toBeInTheDocument();
  });

  test("renders the active route label from pathname", () => {
    render(<Breadcrumb />);
    /* /projects → ROUTES label "projects/" */
    expect(screen.getByText("projects/")).toBeInTheDocument();
  });

  test("renders the ⌘K hint element", () => {
    const { container } = render(<Breadcrumb />);
    /* The hint span contains "press ⌘K for commands" split across text nodes and a <kbd>.
       Query the containing element directly by class name. */
    const hint = container.querySelector(".breadcrumb-hint");
    expect(hint).not.toBeNull();
    expect(hint!.textContent).toMatch(/⌘K for commands/i);
  });
});
