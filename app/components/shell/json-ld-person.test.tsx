import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { JsonLdPerson } from "./json-ld-person";

describe("JsonLdPerson", () => {
  test("renders a <script> element", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
  });

  test("script carries type='application/ld+json'", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    expect(script).toHaveAttribute("type", "application/ld+json");
  });

  test("script innerHTML is valid JSON", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    expect(() => JSON.parse(script!.innerHTML)).not.toThrow();
  });

  test("parsed JSON has @type: Person (SEO-02)", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    const parsed = JSON.parse(script!.innerHTML);
    expect(parsed["@type"]).toBe("Person");
    expect(parsed["@context"]).toBe("https://schema.org");
  });

  test("parsed JSON has name, jobTitle, url, email, sameAs keys (D-08)", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    const parsed = JSON.parse(script!.innerHTML);
    expect(parsed).toHaveProperty("name");
    expect(parsed).toHaveProperty("jobTitle");
    expect(parsed).toHaveProperty("url");
    expect(parsed).toHaveProperty("email");
    expect(parsed).toHaveProperty("sameAs");
    expect(Array.isArray(parsed.sameAs)).toBe(true);
  });

  test("script innerHTML escapes < to \\u003c (Pitfall 6 — XSS prevention)", () => {
    const { container } = render(<JsonLdPerson />);
    const script = container.querySelector("script");
    // The rendered innerHTML should NOT contain a literal `<` character —
    // every `<` (none in current PROFILE, but future-proofing) is encoded.
    expect(script!.innerHTML).not.toMatch(/</);
  });
});
