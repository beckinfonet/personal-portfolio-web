import { render, screen } from "@testing-library/react";
import { AboutView } from "./about-view";
import { PROFILE } from "@/lib/portfolio-data";

/* AboutView is RSC — no provider wrapper required for smoke render */

describe("AboutView", () => {
  test("renders H1 with profile name", () => {
    render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  test("renders the resume download CTA (MOBILE-03 above-the-fold)", () => {
    render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    const resume = screen.getByRole("link", { name: /download resume/i });
    expect(resume).toBeInTheDocument();
    expect(resume).toHaveAttribute("download");
  });

  test("renders mobile STATUS wrapper .about-status-mobile (MOBILE-04 DOM presence)", () => {
    const { container } = render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    /* CSS visibility is jsdom-blind; only DOM presence is asserted at unit level.
       Visual visibility (display:block at <=960px) is verified manually in Wave 3. */
    expect(container.querySelector(".about-status-mobile")).toBeInTheDocument();
  });

  test("mobile STATUS wrapper contains 'Available for hire' via <StatusBlock />", () => {
    render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
  });

  test("mobile STATUS wrapper renders the uptime prop verbatim", () => {
    render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    expect(screen.getByText("8y 125d")).toBeInTheDocument();
  });
});
