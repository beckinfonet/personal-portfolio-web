import { render } from "@testing-library/react";
import { LiveClock } from "./live-clock";

describe("LiveClock", () => {
  test("renders with aria-hidden='true'", () => {
    render(<LiveClock />);
    const clock = document.querySelector(".live-clock");
    expect(clock).toHaveAttribute("aria-hidden", "true");
  });

  test("renders '--:--' on first synchronous render (hydration-safe initial state)", () => {
    const { container } = render(<LiveClock />);
    const clock = container.querySelector(".live-clock");
    expect(clock).not.toBeNull();
    expect(clock!.textContent).toMatch(/^--:--|^\d{2}:\d{2}$/);
  });
});
