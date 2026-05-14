import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExplorerDrawer } from "./explorer-drawer";
import { ShellStateProvider, useDrawer } from "./shell-state-provider";
import { ROUTES } from "@/lib/routes";
import { PROFILE } from "@/lib/portfolio-data";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => null),
  useRouter: () => ({ push: vi.fn() })
}));

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-scroll-lock");
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
});

function Providers({ children }: { children: React.ReactNode }) {
  return <ShellStateProvider>{children}</ShellStateProvider>;
}

/* Tiny helper to drive the drawer state from the test (since the trigger lives in TopBar) */
function DrawerHarness() {
  const { toggle } = useDrawer();
  return (
    <>
      <button id="topbar-hamburger-btn" aria-label="Open file explorer" onClick={toggle}>
        ☰
      </button>
      <ExplorerDrawer profile={PROFILE} />
    </>
  );
}

describe("ExplorerDrawer", () => {
  test("dialog has data-state='closed' by default", () => {
    render(<DrawerHarness />, { wrapper: Providers });
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).toHaveAttribute("data-state", "closed");
  });

  test("opens when ☰ trigger is clicked (data-state='open')", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");
    });
  });

  test("locks page scrolling while drawer is open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-scroll-lock", "drawer");
    });
    expect(document.documentElement.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.documentElement).not.toHaveAttribute("data-scroll-lock");
    });
    expect(document.documentElement.style.overflow).toBe("");
  });

  test("renders dialog with role + aria-modal + aria-labelledby", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "drawer-title");
    expect(screen.getByText("File explorer")).toBeInTheDocument(); // sr-only h2
  });

  test("renders 7 file rows from ROUTES with plain-noun aria-labels", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    ROUTES.forEach((route) => {
      expect(screen.getByRole("button", { name: route.ariaLabel })).toBeInTheDocument();
    });
  });

  test("renders recruiter resume card with Download resume link", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    const links = screen.getAllByRole("link", { name: /download resume/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("download");
  });

  test("Esc key closes the drawer", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open"));
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("data-state", "closed");
    });
  });

  test("file-row click closes the drawer", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open"));
    await user.click(screen.getByRole("button", { name: /contact information/i }));
    await waitFor(() => {
      expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("data-state", "closed");
    });
  });

  test("backdrop click closes the drawer", async () => {
    const user = userEvent.setup();
    const { container } = render(<DrawerHarness />, { wrapper: Providers });
    await user.click(screen.getByRole("button", { name: /open file explorer/i }));
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open"));
    const backdrop = container.querySelector(".drawer-backdrop") as HTMLElement;
    await user.click(backdrop);
    await waitFor(() => {
      expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("data-state", "closed");
    });
  });

  test("closing restores focus to the ☰ trigger", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />, { wrapper: Providers });
    const trigger = screen.getByRole("button", { name: /open file explorer/i });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open"));
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
