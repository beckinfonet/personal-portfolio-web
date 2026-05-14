#!/usr/bin/env node
// scripts/check-production-routes.mjs — DEPLOY-01 readiness gate.
// Verifies all 7 production routes return a non-error HTTP status against NEXT_PUBLIC_SITE_URL.
// Defaults BASE to http://localhost:3000 when the env var is unset (dev parity with sibling scripts).
// Exit 0 on full pass, 1 on any failure.

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Mirrors lib/routes.ts pathnames — keep in sync if ROUTES changes (.mjs cannot import .ts without a loader).
const ROUTES = ["/", "/projects", "/stack", "/experience", "/writing", "/contact", "/shipped"];

const failures = [];

for (const path of ROUTES) {
  try {
    const res = await fetch(BASE + path, { method: "HEAD", redirect: "manual" });
    if (res.status >= 400) {
      failures.push(path + ": HTTP " + res.status);
      continue;
    }
    console.log("✓ " + path + " → " + res.status);
  } catch (err) {
    failures.push(path + ": " + err.message);
  }
}

if (failures.length > 0) {
  console.error("\n✗ check-production-routes: " + failures.length + " failure(s):");
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}

console.log("\n✓ check-production-routes: all " + ROUTES.length + " routes green on " + BASE);
