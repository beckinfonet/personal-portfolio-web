#!/usr/bin/env node
// scripts/check-headers.mjs
// DEV-03 smoke: next.config.ts engineerHeaders array contains x-built-with: nextjs-15-react-19.
// No running server required — we parse the source. Already shipped in Phase 1; this
// script verifies the slot still exists on every Phase 5 build.
import { readFileSync } from "node:fs";
const CONFIG = readFileSync("next.config.ts", "utf8");
const checks = [
  { pattern: /engineerHeaders/, label: "engineerHeaders array declared" },
  { pattern: /x-built-with/, label: "x-built-with header key present" },
  { pattern: /nextjs-15-react-19/, label: "x-built-with value 'nextjs-15-react-19' present" }
];
const failures = checks.filter(({ pattern }) => !pattern.test(CONFIG));
if (failures.length > 0) {
  console.error("✗ DEV-03: header audit failed:");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ DEV-03: x-built-with header slot intact in next.config.ts");
process.exit(0);
