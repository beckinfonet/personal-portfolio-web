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

describe("AboutView — Phase 4 carry-forward inline socials (D-31..D-34)", () => {
  test("renders <AboutSocials /> wrapper with role=group + aria-label", () => {
    const { container } = render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    const block = container.querySelector(".about-socials-card");
    expect(block).not.toBeNull();
    expect(block).toHaveAttribute("role", "group");
    expect(block).toHaveAttribute("aria-label", "Quick contact");
  });

  test("renders EMAIL row with mailto: href to PROFILE.email", () => {
    render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    const link = screen.getByRole("link", { name: /send email to/i });
    expect(link).toHaveAttribute("href", `mailto:${PROFILE.email}`);
  });

  test("renders GITHUB row as ExternalLink with target=_blank when URL is real", () => {
    const { container } = render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    /* Scope to the AboutSocials block — the existing about-cta-row also exposes
       an ExternalLink with aria-label /open github/i, so a top-level getByRole
       would match multiple elements. The AboutSocials contract is the row-link
       inside .about-socials-card. */
    const block = container.querySelector(".about-socials-card");
    expect(block).not.toBeNull();
    const link = block!.querySelector('a[aria-label^="Open GitHub"]');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders LINKEDIN row as ExternalLink when URL is real (current PROFILE.socials)", () => {
    const { container } = render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    /* Same scoping as the GITHUB row — see comment above. */
    const block = container.querySelector(".about-socials-card");
    expect(block).not.toBeNull();
    const link = block!.querySelector('a[aria-label^="Open LinkedIn"]');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("AboutSocials renders BEFORE .about-cards in the DOM (D-31 scan path)", () => {
    const { container } = render(<AboutView profile={PROFILE} uptime="8y 125d" />);
    const block = container.querySelector(".about-socials-card");
    const cards = container.querySelector(".about-cards");
    expect(block).not.toBeNull();
    expect(cards).not.toBeNull();
    // compareDocumentPosition bitmask 4 means "block precedes cards"
    const position = block!.compareDocumentPosition(cards!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
