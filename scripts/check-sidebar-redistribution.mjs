#!/usr/bin/env node
// scripts/check-sidebar-redistribution.mjs
// Pitfall 7 audit (MOBILE-01): every sidebar `display: none` in globals.css must be
// paired with mobile-home rules (drawer + about-view STATUS rehome).
// Implements ROADMAP Phase 4 success criterion 4.

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

const checks = [
  { pattern: /\.sidebar\s*\{[^}]*display:\s*none/, label: "sidebar display:none present (paired hide rule)" },
  { pattern: /\.drawer-sheet/, label: "drawer-sheet class present (EXPLORER rehome)" },
  { pattern: /\.drawer-backdrop/, label: "drawer-backdrop class present (rehome chrome)" },
  { pattern: /\.about-status-mobile/, label: "about-status-mobile class present (STATUS rehome)" },
  { pattern: /\.topbar-hamburger/, label: "topbar-hamburger class present (drawer trigger)" }
];

const failures = checks.filter(({ pattern }) => !pattern.test(contents));

if (failures.length > 0) {
  console.error("\n✗ Pitfall 7 / MOBILE-01: sidebar redistribution audit failed:\n");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  console.error(`\nFAIL: ${failures.length} unmet invariant(s) in ${CSS_FILE}`);
  process.exit(1);
}

console.log("✓ Pitfall 7 / MOBILE-01: sidebar redistribution audit passed");
process.exit(0);
