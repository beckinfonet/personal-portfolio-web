#!/usr/bin/env node
// scripts/check-resume-pdf.mjs — CONTENT-05 gate.
// Verifies the resume PDF exists at the canonical path, is a real PDF
// (starts with %PDF- magic bytes), and is under 250KB.
// Wave 8 ships the real PDF; this script exits 1 until then.
import { existsSync, statSync, readFileSync } from "node:fs";

// D-18 / Pitfall 9: canonical filename embedded in the URL path so Content-Disposition
// save-as defaults to "Bakytbek_Tatibekov_Resume.pdf" without a custom header.
const CANONICAL = "public/Bakytbek_Tatibekov_Resume.pdf";
const LEGACY = "public/resume.pdf"; // pre-Wave-8 stub location

const PDF_PATH = existsSync(CANONICAL) ? CANONICAL : LEGACY;
const MAX_BYTES = 250 * 1024;

const failures = [];
if (!existsSync(PDF_PATH)) {
  failures.push(`${PDF_PATH} does not exist`);
} else {
  const { size } = statSync(PDF_PATH);
  if (size > MAX_BYTES) {
    failures.push(`${PDF_PATH} is ${size} bytes (max ${MAX_BYTES})`);
  }
  const magic = readFileSync(PDF_PATH).slice(0, 5).toString("ascii");
  if (magic !== "%PDF-") {
    failures.push(`${PDF_PATH} does not start with %PDF- magic (got: ${JSON.stringify(magic)})`);
  }
  // Wave 8 also wires Title/Author verification via pdf-lib in a follow-up step;
  // this Wave 0 script intentionally only enforces existence + size + magic.
}

if (failures.length > 0) {
  console.error("\n✗ CONTENT-05: resume PDF audit failed:\n");
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ CONTENT-05: ${PDF_PATH} present, valid PDF, under 250KB`);
process.exit(0);
