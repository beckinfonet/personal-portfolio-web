import { render } from "@testing-library/react";
import { AccentBootstrapScript } from "./accent-bootstrap-script";

describe("AccentBootstrapScript", () => {
  test("renders a <script> element (inline script emitter)", () => {
    const { container } = render(<AccentBootstrapScript />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
  });

  test("inline script contains 'portfolio-accent' key reference", () => {
    const { container } = render(<AccentBootstrapScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("portfolio-accent");
  });

  test("inline script contains '--accent-hue' CSS variable reference", () => {
    const { container } = render(<AccentBootstrapScript />);
    const script = container.querySelector("script");
    expect(script?.innerHTML).toContain("--accent-hue");
  });

  test("inline script contains hue validation regex fragment", () => {
    const { container } = render(<AccentBootstrapScript />);
    const script = container.querySelector("script");
    /* Script must validate with /^\d{1,3}$/ before applying hue (D-08) */
    expect(script?.innerHTML).toMatch(/\\d\{1,3\}/);
  });
});
