#!/usr/bin/env node
// scripts/check-head-comment.mjs
// DEV-02 smoke: 6-line lowercase HTML comment is emitted by the head-comment RSC.
// We grep the source TSX for the canonical opening line because the rendered output
// depends on a running dev server. Plan 05-05 ships the comment; running this
// script before then SHOULD fail (as designed).
import { existsSync, readFileSync } from "node:fs";
const candidates = [
  "app/components/shell/head-comment.tsx",
  "app/layout.tsx"
];
const present = candidates.find((p) => existsSync(p));
if (!present) {
  console.error("✗ DEV-02: head-comment source file not found");
  process.exit(1);
}
const contents = readFileSync(present, "utf8");
const checks = [
  { pattern: /hello, you found the source/, label: "line 1: 'hello, you found the source'" },
  { pattern: /reach: beckprograms@gmail\.com/, label: "line 4: 'reach: beckprograms@gmail.com'" },
  { pattern: /github: beckinfonet/, label: "line 5: 'github: beckinfonet'" },
  { pattern: /thanks for looking\. — bakytbek/, label: "line 6: 'thanks for looking. — bakytbek'" }
];
const failures = checks.filter(({ pattern }) => !pattern.test(contents));
if (failures.length > 0) {
  console.error("✗ DEV-02: head-comment audit failed:");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ DEV-02: head-comment 6-line greeting present");
process.exit(0);
