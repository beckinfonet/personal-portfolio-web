import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CopyButton } from "./copy-button";

describe("CopyButton", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    // jsdom 26 defines navigator.clipboard as a getter-only property, so plain
    // Object.assign cannot replace it. Use defineProperty to install a writable
    // mock per-test. (Rule 3 fix: blocking dependency for clipboard tests in
    // this jsdom version. fireEvent is preferred over userEvent here because
    // userEvent's setTimeout(0) scheduling does not interleave cleanly with
    // an async click handler awaiting navigator.clipboard.writeText.)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
      writable: true
    });
  });

  test("renders idle label inside a button with caller-supplied aria-label", () => {
    render(<CopyButton value="hello" ariaLabel="Copy greeting" />);
    const btn = screen.getByRole("button", { name: "Copy greeting" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("⧉ copy");
  });

  test("click writes value to navigator.clipboard.writeText", async () => {
    render(<CopyButton value="hello" ariaLabel="Copy greeting" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy greeting" }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("hello");
    });
  });

  test("label swaps to copied label after click and reverts after 1500ms", async () => {
    vi.useFakeTimers();
    try {
      render(<CopyButton value="x" ariaLabel="Copy x" />);
      const btn = screen.getByRole("button", { name: "Copy x" });

      // Fire click and flush both the microtask (clipboard.writeText resolution)
      // and the React state update inside act.
      await act(async () => {
        fireEvent.click(btn);
      });

      expect(btn).toHaveTextContent("copied ✓");

      await act(async () => {
        vi.advanceTimersByTime(1500);
      });

      expect(btn).toHaveTextContent("⧉ copy");
    } finally {
      vi.useRealTimers();
    }
  });

  test("aria-live region announces 'Copied to clipboard' on success", async () => {
    const { container } = render(
      <CopyButton value="x" ariaLabel="Copy x" />
    );
    const live = container.querySelector('[role="status"]') as HTMLElement;
    expect(live).toBeInTheDocument();
    expect(live.textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Copy x" }));

    await waitFor(() => {
      expect(live.textContent).toBe("Copied to clipboard");
    });
  });
});
