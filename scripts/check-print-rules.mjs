#!/usr/bin/env node
// scripts/check-print-rules.mjs
// A11Y-09 audit: @media print block exists and hides required chrome,
// forces serif body, keeps mono carve-outs, page-break safety on footer.
// Implements ROADMAP Phase 4 success criterion 5.

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

// Extract the @media print block to scope sub-grep checks
const printBlockMatch = contents.match(/@media print\s*\{[\s\S]*$/);
const printBlock = printBlockMatch ? printBlockMatch[0] : "";

const checks = [
  { pattern: /@media print\s*\{/, label: "@media print block present", scope: "file" },
  { pattern: /font-family:\s*Georgia/, label: "serif body (Georgia) in print", scope: "print" },
  { pattern: /var\(--font-mono\)/, label: "monospace carve-outs in print", scope: "print" },
  { pattern: /\.topbar[^{]*\{[^}]*display:\s*none/, label: ".topbar hidden in print", scope: "print" },
  { pattern: /\.sidebar[^{]*\{[^}]*display:\s*none/, label: ".sidebar hidden in print", scope: "print" },
  { pattern: /\.print-footer/, label: ".print-footer class referenced in print", scope: "print" },
  { pattern: /page-break-inside:\s*avoid/, label: "page-break-inside: avoid present in print", scope: "print" },
  { pattern: /background:\s*#fff/, label: "white background forced in print", scope: "print" },
  { pattern: /color:\s*#000/, label: "black text forced in print", scope: "print" }
];

const failures = checks.filter(({ pattern, scope }) => {
  const target = scope === "print" ? printBlock : contents;
  return !pattern.test(target);
});

// Security check: print-color-adjust: exact must NOT appear (RESEARCH §Security Domain)
if (/print-color-adjust:\s*exact/.test(contents)) {
  failures.push({ label: "print-color-adjust: exact is forbidden (information disclosure risk)" });
}

if (failures.length > 0) {
  console.error("\n✗ A11Y-09: print stylesheet audit failed:\n");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}

console.log("✓ A11Y-09: print stylesheet audit passed");
process.exit(0);
