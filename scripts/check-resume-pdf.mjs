#!/usr/bin/env node
// scripts/check-resume-pdf.mjs — CONTENT-05 gate.
// Verifies the resume PDF: existence + < 250KB + valid %PDF- magic + non-empty Title + non-empty Author.
// Pitfall 6: assert non-empty metadata values, not just key presence.
// Pitfall 9 / D-18: canonical filename embedded in URL path so Content-Disposition
// save-as defaults to "Bakytbek_Tatibekov_Resume.pdf" without a custom header.
import { existsSync, statSync, readFileSync } from "node:fs";

const CANONICAL = "public/Bakytbek_Tatibekov_Resume.pdf";
const LEGACY = "public/resume.pdf"; // should NOT exist after Wave 8
const MAX_BYTES = 250 * 1024;

const failures = [];

// Pitfall 9 / D-18: prefer canonical filename; legacy must be absent.
if (existsSync(LEGACY)) {
  failures.push(`${LEGACY} should be deleted (Wave 8 brownfield discipline)`);
}
if (!existsSync(CANONICAL)) {
  failures.push(`${CANONICAL} does not exist`);
} else {
  const { size } = statSync(CANONICAL);
  if (size > MAX_BYTES) {
    failures.push(`${CANONICAL} is ${size} bytes (max ${MAX_BYTES})`);
  }
  const bytes = readFileSync(CANONICAL);
  const magic = bytes.slice(0, 5).toString("ascii");
  if (magic !== "%PDF-") {
    failures.push(`${CANONICAL} does not start with %PDF- magic (got: ${JSON.stringify(magic)})`);
  }

  // Title + Author check via pdf-lib (no prod dep — devDep allowed).
  try {
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes);
    const title = pdf.getTitle();
    const author = pdf.getAuthor();
    if (!title || title.trim().length === 0) {
      failures.push(`${CANONICAL}: Title metadata is empty (Pitfall 6)`);
    }
    if (!author || author.trim().length === 0) {
      failures.push(`${CANONICAL}: Author metadata is empty (Pitfall 6)`);
    }
  } catch (err) {
    failures.push(`${CANONICAL}: pdf-lib failed to parse — ${err.message}`);
  }
}

if (failures.length > 0) {
  console.error("\n✗ CONTENT-05: resume PDF audit failed:\n");
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ CONTENT-05: ${CANONICAL} present, valid PDF, < 250KB, Title + Author set`);
process.exit(0);
