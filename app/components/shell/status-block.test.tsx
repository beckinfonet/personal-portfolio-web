import { render, screen } from "@testing-library/react";
import { StatusBlock } from "./status-block";

describe("StatusBlock", () => {
  test("renders STATUS section header", () => {
    render(<StatusBlock uptime="8y 125d" />);
    expect(screen.getByText("STATUS")).toBeInTheDocument();
  });

  test("renders 'Available for hire' availability row", () => {
    render(<StatusBlock uptime="8y 125d" />);
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
  });

  test("renders uptime prop verbatim", () => {
    render(<StatusBlock uptime="8y 125d" />);
    expect(screen.getByText("8y 125d")).toBeInTheDocument();
  });

  test("renders uptime: key label", () => {
    render(<StatusBlock uptime="8y 125d" />);
    expect(screen.getByText("uptime:")).toBeInTheDocument();
  });

  test("renders tz: key label", () => {
    render(<StatusBlock uptime="8y 125d" />);
    expect(screen.getByText("tz:")).toBeInTheDocument();
  });

  test("renders a tz value (Intl resolved or GMT+5 fallback)", () => {
    const { container } = render(<StatusBlock uptime="8y 125d" />);
    /* StatusTz produces some span with text content; smoke-assert non-empty tz row */
    const rows = container.querySelectorAll(".sb-status-row");
    expect(rows.length).toBe(3);
    /* Third row is the tz row — its second <span> child is StatusTz output */
    const tzRow = rows[2];
    expect(tzRow.textContent?.trim().length).toBeGreaterThan("tz:".length);
  });
});
