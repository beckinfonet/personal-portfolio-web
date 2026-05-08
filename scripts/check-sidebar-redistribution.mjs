#!/usr/bin/env node
// scripts/check-sidebar-redistribution.mjs
// Pitfall 7 audit (MOBILE-01): every sidebar `display: none` in globals.css must be
// paired with mobile-home rules (drawer + about-view STATUS rehome).
// Implements ROADMAP Phase 4 success criterion 4.

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

// Slice out the @media (max-width: 960px) block so the orphan-grid-track check
// can grep inside it specifically (not anywhere in the file).
const mobileBlockMatch = contents.match(/@media\s*\(max-width:\s*960px\)\s*\{([\s\S]*?)\n\}\s*\n/);
const mobileBlock = mobileBlockMatch ? mobileBlockMatch[1] : "";

const checks = [
  { source: contents, pattern: /\.sidebar\s*\{[^}]*display:\s*none/, label: "sidebar display:none present (paired hide rule)" },
  { source: contents, pattern: /\.drawer-sheet/, label: "drawer-sheet class present (EXPLORER rehome)" },
  { source: contents, pattern: /\.drawer-backdrop/, label: "drawer-backdrop class present (rehome chrome)" },
  { source: contents, pattern: /\.about-status-mobile/, label: "about-status-mobile class present (STATUS rehome)" },
  { source: contents, pattern: /\.topbar-hamburger/, label: "topbar-hamburger class present (drawer trigger)" },
  // Collapse the 240px sidebar grid track on mobile. Without this, hiding the sidebar
  // with display:none leaves terminal-body's 1fr column starting 240px from the left,
  // producing dead whitespace at the right edge of every page on phone/tablet widths.
  { source: mobileBlock, pattern: /\.terminal-body\s*\{[^}]*grid-template-columns\s*:\s*1fr/, label: "terminal-body collapses to a single grid column inside @media (max-width: 960px) (no orphan sidebar track)" }
];

const failures = checks.filter(({ source, pattern }) => !pattern.test(source));

if (failures.length > 0) {
  console.error("\n✗ Pitfall 7 / MOBILE-01: sidebar redistribution audit failed:\n");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  console.error(`\nFAIL: ${failures.length} unmet invariant(s) in ${CSS_FILE}`);
  process.exit(1);
}

console.log("✓ Pitfall 7 / MOBILE-01: sidebar redistribution audit passed");
process.exit(0);
