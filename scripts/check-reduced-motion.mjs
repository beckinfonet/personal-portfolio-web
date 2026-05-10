#!/usr/bin/env node
// scripts/check-reduced-motion.mjs
// A11Y-03 smoke: app/globals.css has the universal-selector reduced-motion reset
// inside the existing @media (prefers-reduced-motion: reduce) block.
// Plan 05-03 ships the reset; running this script before then SHOULD fail (as designed).
import { readFileSync } from "node:fs";
const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");
const blockMatch = contents.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/);
const block = blockMatch ? blockMatch[0] : "";
const checks = [
  { pattern: /@media\s*\(prefers-reduced-motion:\s*reduce\)/, label: "@media (prefers-reduced-motion: reduce) block present", scope: "file" },
  { pattern: /\*,\s*\*::before,\s*\*::after/, label: "universal selector *, *::before, *::after present", scope: "block" },
  { pattern: /animation-duration:\s*0\.01ms\s*!important/, label: "animation-duration: 0.01ms !important present (NOT 0ms — Pitfall 7)", scope: "block" },
  { pattern: /animation-iteration-count:\s*1\s*!important/, label: "animation-iteration-count: 1 !important present", scope: "block" },
  { pattern: /transition-duration:\s*0\.01ms\s*!important/, label: "transition-duration: 0.01ms !important present", scope: "block" }
];
const failures = checks.filter(({ pattern, scope }) => {
  const target = scope === "block" ? block : contents;
  return !pattern.test(target);
});
if (failures.length > 0) {
  console.error("✗ A11Y-03: reduced-motion audit failed:");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ A11Y-03: reduced-motion universal-selector reset present");
process.exit(0);
