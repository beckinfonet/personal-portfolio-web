import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("TerminalLayout footer palette treatment", () => {
  test("renders each footer motto phrase as an individually colorable span", () => {
    const source = readFileSync(join(process.cwd(), "app/(terminal)/layout.tsx"), "utf8");

    expect(source).toContain('className="shell-footer-phrase shell-footer-phrase--care"');
    expect(source).toContain('className="shell-footer-phrase shell-footer-phrase--intent"');
    expect(source).toContain('className="shell-footer-phrase shell-footer-phrase--terminal"');
  });

  test("uses existing palette tokens for the three footer phrase colors", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toMatch(/\.shell-footer-phrase--care\s*\{[^}]*color:\s*var\(--accent\);/s);
    expect(css).toMatch(/\.shell-footer-phrase--intent\s*\{[^}]*color:\s*var\(--warn\);/s);
    expect(css).toMatch(/\.shell-footer-phrase--terminal\s*\{[^}]*color:\s*var\(--blue\);/s);
  });
});
