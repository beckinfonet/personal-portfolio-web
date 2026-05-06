---
phase: 01-foundation
plan: 04
subsystem: infra
tags: [next.js, security-headers, http, hsts, csp-deferred, permissions-policy]

# Dependency graph
requires:
  - phase: 01-foundation/01
    provides: lockfile baseline committed (Wave 1)
provides:
  - HTTP security headers on every Next.js response (5 standard + 1 engineer-discoverability)
  - X-Frame-Options DENY (clickjacking guard)
  - X-Content-Type-Options nosniff (MIME sniffing guard)
  - Referrer-Policy strict-origin-when-cross-origin (referrer leakage guard)
  - Strict-Transport-Security 2-year HSTS with preload eligibility (downgrade attack guard)
  - Permissions-Policy deny-list for camera/microphone/geolocation (sensor API abuse guard)
  - x-built-with nextjs-15-react-19 (DEV-03 curl -I easter egg for engineers)
affects:
  - Phase 5 (DEV-03 engineer easter egg verification)
  - Phase 7 (x-portfolio-source header to be added when public deploy URL finalized)
  - v2 hardening milestone (CSP nonce strategy threaded through Phase 2 accent boot script)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next.config.ts async headers() function with source '/:path*' for all-route header injection"
    - "Module-level securityHeaders + engineerHeaders const arrays before NextConfig object"
    - "Spread merge [...securityHeaders, ...engineerHeaders] into single route matcher"

key-files:
  created: []
  modified:
    - next.config.ts

key-decisions:
  - "D-13 revised: x-portfolio-source deferred to Phase 7 — avoids placeholder URL strings and Plan 05 postbuild grep failures; slot reserved with comment in next.config.ts"
  - "D-15: CSP deferred — requires nonce-based strategy threaded through Phase 2 inline accent boot script; captured for v2 hardening milestone"
  - "Permissions-Policy uses modern deny-list syntax feature=() (empty allowlist = no origins permitted) per MDN 2026 / RESEARCH.md A5"
  - "HSTS max-age=63072000 (2 years) with includeSubDomains + preload for HTTPS preload list eligibility"

patterns-established:
  - "Security headers: module-level const arrays + spread merge pattern (idiomatic per Next.js docs)"
  - "All-route matcher: source '/:path*' applies headers to /, /api/*, static assets, error pages"

requirements-completed:
  - INFRA-04

# Metrics
duration: 2min
completed: 2026-05-06
---

# Phase 01 Plan 04: Security Headers Summary

**5 standard HTTP security headers + x-built-with engineer-discoverability header injected on every Next.js response via next.config.ts async headers(), closing T-INFRA-04a through T-INFRA-04e threat register items**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-06T13:55:00Z
- **Completed:** 2026-05-06T13:56:40Z
- **Tasks:** 1 of 1
- **Files modified:** 1

## Accomplishments

- Replaced empty `next.config.ts` body with `async headers()` function applying to `source: "/:path*"` (all routes)
- Shipped all 5 standard security headers with D-14 verbatim values (HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy)
- Shipped `x-built-with: nextjs-15-react-19` for DEV-03 engineer easter egg (curl -I discoverability)
- Correctly deferred `x-portfolio-source` (Phase 7) and CSP (v2 hardening) per D-13 revised and D-15
- Verified all 6 headers present in live `curl -sI http://localhost:3000/` against `npm run dev`
- `npx tsc --noEmit` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite next.config.ts with security + engineer-discoverability headers** - `2b0f829` (feat)

**Plan metadata:** (committed with SUMMARY — see docs commit)

## Headers Shipped

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `x-built-with` | `nextjs-15-react-19` |

## Files Created/Modified

- `next.config.ts` — Replaced empty config body with `securityHeaders` + `engineerHeaders` const arrays and `async headers()` method returning `source: "/:path*"` route matcher with all 6 headers

## Decisions Made

- **x-portfolio-source deferred to Phase 7** per D-13 revised: the public deploy URL is not yet finalized; shipping a placeholder would trigger Plan 05's postbuild grep and fail the build. A comment in `next.config.ts` reserves the slot.
- **CSP deferred per D-15**: Content-Security-Policy requires a nonce-based strategy threaded through the Phase 2 inline accent boot script. Captured for the v2 hardening milestone.
- **Permissions-Policy deny-list syntax** (`feature=()` with empty allowlist) used per RESEARCH.md A5 / MDN 2026 — the modern approach that denies all origins without needing an explicit blocklist.

## Deviations from Plan

None - plan executed exactly as written. The only "deviation" mentioned in the plan itself (dropping `x-portfolio-source` relative to RESEARCH.md §2) was already mandated by D-13 revised and PATTERNS.md lines 248-249 — not a runtime deviation.

## Issues Encountered

None.

## Phase 7 Note

`x-portfolio-source` header to be added to `engineerHeaders` in `next.config.ts` when the public deploy URL is finalized. The slot is reserved with a comment on line 12.

## v2 Hardening Milestone Note

CSP nonce-based strategy must be threaded through the Phase 2 inline accent boot script before Content-Security-Policy can be added. Blocking risk: any inline `<script>` tag (including `next-themes` or the accent hue pre-paint script) must have a nonce attribute matching the CSP nonce to avoid violating the policy.

## Phase 5 / DEV-03 Note

Engineer easter egg is live. `curl -I https://<deployed-url>/` will show `x-built-with: nextjs-15-react-19` in response headers, satisfying DEV-03 stack-signature discoverability requirement.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Security headers infrastructure complete, all 5 T-INFRA-04 threat register mitigations deployed
- `next.config.ts` ready for further additions (image domains, redirects, etc.) in later phases
- Phase 5 (DEV-03) and Phase 7 (x-portfolio-source) have clear extension points

## Self-Check

- [x] `next.config.ts` exists and has `async headers()` — FOUND
- [x] Commit `2b0f829` exists — FOUND
- [x] `npx tsc --noEmit` exits 0 — VERIFIED
- [x] All 6 headers present in live curl response — VERIFIED
- [x] `x-portfolio-source` absent from live response — VERIFIED
- [x] CSP absent from live response — VERIFIED

## Self-Check: PASSED

---
*Phase: 01-foundation*
*Completed: 2026-05-06*
