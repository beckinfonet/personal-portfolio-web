#!/usr/bin/env node
// scripts/check-mobile-palette-css.mjs
// PALETTE-05 audit: @media (max-width: 960px) overrides cmdk attribute selectors
// to render palette as bottom-sheet with 44px touch targets.

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

// Scope checks to the @media (max-width: 960px) block
const mobileBlockMatch = contents.match(/@media \(max-width:\s*960px\)\s*\{[\s\S]*?(?=\n@media|\n\/\* ──|\Z)/);
const mobileBlock = mobileBlockMatch ? mobileBlockMatch[0] : "";

const checks = [
  { pattern: /@media \(max-width:\s*960px\)/, label: "mobile breakpoint block present", scope: "file" },
  { pattern: /\[cmdk-dialog\]/, label: "[cmdk-dialog] override in mobile block", scope: "mobile" },
  { pattern: /\[cmdk-overlay\]/, label: "[cmdk-overlay] override in mobile block", scope: "mobile" },
  { pattern: /\[cmdk-input\]/, label: "[cmdk-input] sticky override in mobile block", scope: "mobile" },
  { pattern: /\[cmdk-item\][^{]*\{[^}]*padding:\s*14px/, label: "[cmdk-item] 14px padding (44px touch target)", scope: "mobile" },
  { pattern: /border-radius:\s*12px 12px 0 0/, label: "bottom-sheet border-radius on mobile palette", scope: "mobile" },
  { pattern: /max-height:\s*80vh/, label: "[cmdk-dialog] max-height 80vh", scope: "mobile" }
];

const failures = checks.filter(({ pattern, scope }) => {
  const target = scope === "mobile" ? mobileBlock : contents;
  return !pattern.test(target);
});

if (failures.length > 0) {
  console.error("\n✗ PALETTE-05: mobile palette CSS audit failed:\n");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}

console.log("✓ PALETTE-05: mobile palette CSS audit passed");
process.exit(0);
