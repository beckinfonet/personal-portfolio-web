import { render } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { ConsoleSignature } from "./console-signature";
import { PROFILE } from "@/lib/portfolio-data";

describe("ConsoleSignature (DEV-01)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test("calls console.log exactly once on mount", () => {
    render(<ConsoleSignature />);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  test("first arg contains the ASCII box-drawing art", () => {
    render(<ConsoleSignature />);
    const firstArg = logSpy.mock.calls[0][0] as string;
    // Check for at least one box-drawing char that distinguishes ASCII art
    expect(firstArg).toMatch(/[╔╗╝╚═║╠╬]/);
  });

  test("first arg contains the github invitation line", () => {
    render(<ConsoleSignature />);
    const firstArg = logSpy.mock.calls[0][0] as string;
    expect(firstArg).toContain("Like the site? Source at github.com/beckinfonet");
  });

  test("first arg contains the email invitation line with PROFILE.email", () => {
    render(<ConsoleSignature />);
    const firstArg = logSpy.mock.calls[0][0] as string;
    expect(firstArg).toContain("Available for hire");
    expect(firstArg).toContain(PROFILE.email);
  });

  test("calls console.log with at least 2 args (message + %c style)", () => {
    render(<ConsoleSignature />);
    expect(logSpy.mock.calls[0].length).toBeGreaterThanOrEqual(2);
  });

  test("renders nothing into the DOM (returns null)", () => {
    const { container } = render(<ConsoleSignature />);
    expect(container.firstChild).toBeNull();
  });
});
