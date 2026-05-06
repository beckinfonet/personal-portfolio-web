#!/usr/bin/env node
// scripts/check-placeholders.mjs
// Postbuild gate: fails build if .next/server/ contains forbidden strings.
// Implements INFRA-05 / D-10 / D-11.
//
// Forbidden strings:
//   lorem                              (case-insensitive)
//   example.com                        (case-insensitive)
//   placeholder + (text|content|string|image|name)  (case-insensitive — phrase-based to avoid the
//                                       legitimate HTML "placeholder" attribute)
//   TODO                               (CASE-SENSITIVE — D-10 grammar; lowercase "todo" in prose passes)
//   Product Studio                     (CASE-SENSITIVE — exact demo company name leak from CONCERNS.md)
//
// Exits 0 on clean, 1 on any hit. Chained automatically as `npm run build`
// runs build then postbuild; failure here = failed build = no Vercel deploy.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const BUILD_DIR = ".next/server";
const FORBIDDEN = [
  /lorem/i,
  /example\.com/i,
  /placeholder (text|content|string|image|name)/i,
  /TODO/,
  /Product Studio/
];
const SCAN_EXTENSIONS = new Set([".js", ".html", ".json", ".rsc", ".txt"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (SCAN_EXTENSIONS.has(extname(p))) yield p;
  }
}

const hits = [];
for (const file of walk(BUILD_DIR)) {
  const contents = readFileSync(file, "utf8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(contents)) {
      hits.push({ file, pattern: pattern.source });
    }
  }
}

if (hits.length > 0) {
  console.error("\n✗ INFRA-05: Forbidden strings found in build output:\n");
  for (const { file, pattern } of hits) {
    console.error(`  ${file}: matched /${pattern}/`);
  }
  console.error(`\nFAIL: ${hits.length} hit(s) across ${BUILD_DIR}/`);
  process.exit(1);
}

console.log(`✓ INFRA-05: ${BUILD_DIR}/ clean (no forbidden strings)`);
process.exit(0);
