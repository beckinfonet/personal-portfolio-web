#!/usr/bin/env node
// scripts/check-og-files.mjs
// SEO-03 smoke: 8 OG files exist (root + 7 routes). Real check ships in this scaffold —
// Plan 05-02 creates the OG files; running this script before then SHOULD fail (as designed).
import { existsSync } from "node:fs";
const REQUIRED = [
  "app/opengraph-image.tsx",
  "app/(terminal)/opengraph-image.tsx",
  "app/(terminal)/projects/opengraph-image.tsx",
  "app/(terminal)/stack/opengraph-image.tsx",
  "app/(terminal)/experience/opengraph-image.tsx",
  "app/(terminal)/writing/opengraph-image.tsx",
  "app/(terminal)/contact/opengraph-image.tsx",
  "app/(terminal)/shipped/opengraph-image.tsx"
];
const missing = REQUIRED.filter((p) => !existsSync(p));
if (missing.length > 0) {
  console.error("✗ SEO-03: missing OG files:");
  for (const p of missing) console.error(`  FAIL: ${p}`);
  process.exit(1);
}
console.log(`✓ SEO-03: all ${REQUIRED.length} OG files present`);
process.exit(0);
