import { render, screen } from "@testing-library/react";
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
});
