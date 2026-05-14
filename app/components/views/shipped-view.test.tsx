import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { ShippedView } from "./shipped-view";
import { SHIPPED } from "@/lib/portfolio-data";

describe("ShippedView", () => {
  test("groups App Store and Google Play badges into a dedicated store row", () => {
    const { container } = render(<ShippedView shipped={SHIPPED} />);
    const firstRow = container.querySelector(".shipped-row");
    const storeBadges = firstRow?.querySelector(".shipped-row-store-badges");

    expect(storeBadges).toBeInTheDocument();
    expect(storeBadges?.querySelectorAll(".store-badge-link")).toHaveLength(2);
    expect(storeBadges?.querySelector(".copy-button")).not.toBeInTheDocument();
    expect(firstRow?.querySelector(".copy-button")).toBeInTheDocument();
  });

  test("keeps the store badge row from wrapping on mobile", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toMatch(/\.shipped-row-store-badges\s*\{[^}]*flex-wrap:\s*nowrap;/s);
    expect(css).toMatch(/\.shipped-row-store-badges\s+\.store-badge-link\s*\{[^}]*flex:\s*0\s+0\s+auto;/s);
  });
});
