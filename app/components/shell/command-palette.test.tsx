import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./command-palette";
import { ShellStateProvider } from "./shell-state-provider";

/* Mock dependencies */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark", setTheme: vi.fn() })
}));

function Providers({ children }: { children: React.ReactNode }) {
  return <ShellStateProvider>{children}</ShellStateProvider>;
}

describe("CommandPalette", () => {
  test("is closed by default (dialog not in DOM)", () => {
    render(<CommandPalette />, { wrapper: Providers });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("⌘K opens the palette dialog", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: Providers });
    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("palette has accessible name 'Command Palette'", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: Providers });
    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /command palette/i })
      ).toBeInTheDocument();
    });
  });

  test("typing 'contact' shows Open contact.sh in results", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: Providers });
    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await user.type(screen.getByRole("combobox"), "contact");
    await waitFor(() => {
      expect(screen.getByText("Open contact.sh")).toBeInTheDocument();
    });
  });

  test("palette has aria-live result count region", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: Providers });
    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("Esc key closes the palette", async () => {
    const user = userEvent.setup();
    render(<CommandPalette />, { wrapper: Providers });
    await user.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  test("PALETTE_VERBS length is at least 16 (≥16 floor per PALETTE-02)", async () => {
    const { PALETTE_VERBS } = await import("@/lib/palette-verbs");
    expect(PALETTE_VERBS.length).toBeGreaterThanOrEqual(16);
  });

  test("PALETTE_VERBS contains all four accent-setting verbs", async () => {
    const { PALETTE_VERBS } = await import("@/lib/palette-verbs");
    const accentIds = PALETTE_VERBS
      .filter((v) => v.id.startsWith("accent-"))
      .map((v) => v.id);
    expect(accentIds).toContain("accent-matrix");
    expect(accentIds).toContain("accent-amber");
    expect(accentIds).toContain("accent-cyan");
    expect(accentIds).toContain("accent-magenta");
  });
});
