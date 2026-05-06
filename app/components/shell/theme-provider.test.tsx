import { render, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { ThemeProvider } from "./theme-provider";

function ThemeToggleProbe() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <button
      data-testid="probe"
      data-theme={theme ?? ""}
      data-resolved={resolvedTheme ?? ""}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      toggle
    </button>
  );
}

describe("ThemeProvider", () => {
  test("renders children inside next-themes provider", () => {
    const { getByTestId } = render(
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ThemeToggleProbe />
      </ThemeProvider>
    );
    expect(getByTestId("probe")).toBeInTheDocument();
  });

  test("setTheme persists to localStorage['theme'] and updates data-theme attribute", async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <ThemeToggleProbe />
      </ThemeProvider>
    );

    // next-themes hydrates asynchronously; flush effects so initial theme settles
    await act(async () => {
      await Promise.resolve();
    });

    await user.click(getByTestId("probe"));

    // localStorage["theme"] is the next-themes default key
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    await user.click(getByTestId("probe"));
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
