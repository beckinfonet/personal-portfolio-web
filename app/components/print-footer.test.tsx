import { render, screen } from "@testing-library/react";
import { PrintFooter } from "./print-footer";

describe("PrintFooter", () => {
  test("renders an <aside class='print-footer'> with aria-hidden", () => {
    const { container } = render(
      <PrintFooter siteUrl="https://bakytbek.dev" email="beckprograms@gmail.com" />
    );
    const aside = container.querySelector("aside.print-footer") as HTMLElement | null;
    expect(aside).not.toBeNull();
    expect(aside).toHaveAttribute("aria-hidden", "true");
  });

  test("renders site URL and email separated by ' · '", () => {
    const { container } = render(
      <PrintFooter siteUrl="https://bakytbek.dev" email="beckprograms@gmail.com" />
    );
    const aside = container.querySelector("aside.print-footer") as HTMLElement;
    expect(aside.textContent).toContain("https://bakytbek.dev");
    expect(aside.textContent).toContain("beckprograms@gmail.com");
    expect(aside.textContent).toContain("·");
  });

  test("falls back gracefully — accepts a localhost URL when NEXT_PUBLIC_SITE_URL is unset", () => {
    /* The fallback is the parent's responsibility (layout.tsx uses ?? "http://localhost:3000").
       This test asserts the component faithfully renders whatever URL is passed. */
    render(<PrintFooter siteUrl="http://localhost:3000" email="beckprograms@gmail.com" />);
    expect(
      screen.getByText(/http:\/\/localhost:3000.*·.*beckprograms@gmail\.com/)
    ).toBeInTheDocument();
  });

  test("does not render any unsafe HTML (no dangerouslySetInnerHTML, all content is text)", () => {
    const { container } = render(
      <PrintFooter siteUrl="https://example.dev" email="test@example.com" />
    );
    const aside = container.querySelector("aside.print-footer") as HTMLElement;
    /* Confirm only text nodes — no child <script>, no innerHTML markers. */
    expect(aside.querySelector("script")).toBeNull();
    expect(aside.children.length).toBe(0);
  });
});
