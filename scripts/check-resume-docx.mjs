#!/usr/bin/env node
// scripts/check-resume-docx.mjs — Wave 8 Extension 1 (orchestrator-authorized).
// Verifies the resume DOCX (secondary recruiter download): existence + < 500KB +
// valid ZIP magic bytes (PK\x03\x04 = 0x504b0304) since DOCX is a ZIP container.
// Mirrors check-resume-pdf.mjs shape; complements (does not replace) the PDF gate.
//
// JSON-LD note: this script does NOT assert anything about structured data —
// json-ld.ts intentionally references only the PDF (DOCX is a convenience
// download, not a schema.org resource).
import { existsSync, statSync, readFileSync } from "node:fs";

const CANONICAL = "public/Bakytbek_Tatibekov_Resume.docx";
const MAX_BYTES = 500 * 1024; // DOCX commonly larger than PDF source; 500KB cap.

const failures = [];

if (!existsSync(CANONICAL)) {
  failures.push(`${CANONICAL} does not exist`);
} else {
  const { size } = statSync(CANONICAL);
  if (size > MAX_BYTES) {
    failures.push(`${CANONICAL} is ${size} bytes (max ${MAX_BYTES})`);
  }
  const bytes = readFileSync(CANONICAL);
  // DOCX is a ZIP container — magic bytes PK\x03\x04 (0x504b0304).
  const magic =
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;
  if (!magic) {
    const got = bytes.slice(0, 4).toString("hex");
    failures.push(`${CANONICAL} does not start with PK\\x03\\x04 ZIP magic (got: 0x${got})`);
  }
}

if (failures.length > 0) {
  console.error("\n✗ RESUME-DOCX: resume DOCX audit failed:\n");
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ RESUME-DOCX: ${CANONICAL} present, valid DOCX (ZIP magic), < 500KB`);
process.exit(0);
