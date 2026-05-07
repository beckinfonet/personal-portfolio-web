import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopBar } from "./top-bar";
import { ShellStateProvider } from "./shell-state-provider";

/* Mock next-themes */
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() })
}));

function Providers({ children }: { children: React.ReactNode }) {
  return <ShellStateProvider>{children}</ShellStateProvider>;
}

describe("TopBar", () => {
  test("renders as <header> landmark", () => {
    render(<TopBar />, { wrapper: Providers });
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  test("renders ⌘K trigger button with correct aria-label", () => {
    render(<TopBar />, { wrapper: Providers });
    expect(
      screen.getByRole("button", { name: /open command palette/i })
    ).toBeInTheDocument();
  });

  test("renders theme toggle button with correct aria-label", () => {
    render(<TopBar />, { wrapper: Providers });
    expect(
      screen.getByRole("button", { name: /toggle color theme/i })
    ).toBeInTheDocument();
  });

  test("renders persistent resume download link", () => {
    render(<TopBar />, { wrapper: Providers });
    const resumeLink = screen.getByRole("link", { name: /download resume/i });
    expect(resumeLink).toBeInTheDocument();
    expect(resumeLink).toHaveAttribute("download");
  });

  test("renders hamburger button with correct aria-label", () => {
    render(<TopBar />, { wrapper: Providers });
    expect(
      screen.getByRole("button", { name: /open file explorer/i })
    ).toBeInTheDocument();
  });

  test("hamburger button has aria-expanded='false' when drawer is closed", () => {
    render(<TopBar />, { wrapper: Providers });
    const btn = screen.getByRole("button", { name: /open file explorer/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("hamburger button has aria-controls referencing the drawer sheet id", () => {
    render(<TopBar />, { wrapper: Providers });
    const btn = screen.getByRole("button", { name: /open file explorer/i });
    expect(btn).toHaveAttribute("aria-controls", "explorer-drawer-sheet");
  });

  test("hamburger click toggles aria-expanded to 'true'", async () => {
    const user = userEvent.setup();
    render(<TopBar />, { wrapper: Providers });
    const btn = screen.getByRole("button", { name: /open file explorer/i });
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});
