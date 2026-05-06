---
phase: 01-foundation
plan: 03
subsystem: infra
tags: [nextjs, typescript, routes, metadata, seo]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: baseline deps and Node version pin established

provides:
  - lib/routes.ts typed registry with 7 routes in sidebar render order
  - RouteSegment type alias for useSelectedLayoutSegment() consumers
  - app/layout.tsx metadataBase resolved (zero build warnings)
  - Pitfall D operator guard (|| not ??) for empty-string NEXT_PUBLIC_SITE_URL

affects:
  - Phase 2 (Sidebar, CommandPalette, shell layout — import ROUTES from lib/routes.ts)
  - Phase 2 (ROUTE-04 sitemap.ts iterates ROUTES)
  - Phase 5 (OG image generation reads description field from ROUTES entries)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "as const satisfies readonly Route[] — literal types with interface shape enforcement"
    - "RouteSegment derived type alias from (typeof ROUTES)[number]['slug']"
    - "|| operator (not ??) for metadataBase env var to guard empty-string falsy bypass"

key-files:
  created:
    - lib/routes.ts
  modified:
    - app/layout.tsx

key-decisions:
  - "Use || not ?? for siteUrl assignment — empty-string NEXT_PUBLIC_SITE_URL bypasses ?? and crashes new URL() with TypeError (Pitfall D mitigation)"
  - "about route maps slug: null, pathname: '/' — index route per ROUTE-01 (NOT /about)"
  - "description field included beyond CONTEXT.md minimums — Phase 5 OG images and Phase 2 palette tooltips both consume it"
  - "Phase 1 boundary: only add metadataBase to layout.tsx — title/description/openGraph/themeScript all preserved for Phase 2 rewrite"

patterns-established:
  - "Route interface with readonly fields + as const satisfies readonly Route[] for downstream literal-type safety"
  - "RouteSegment type alias pattern: (typeof ROUTES)[number]['slug'] for useSelectedLayoutSegment() union"
  - "metadataBase pattern: const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallback (|| not ??)"

requirements-completed:
  - ROUTE-03
  - DATA-05

# Metrics
duration: 8min
completed: 2026-05-06
---

# Phase 01 Plan 03: Route Registry and metadataBase Summary

**Typed 7-entry Route registry at lib/routes.ts (as const satisfies readonly Route[]) and metadataBase added to app/layout.tsx using || guard (Pitfall D) — zero build warnings, tsc clean**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-06T00:00:00Z
- **Completed:** 2026-05-06T00:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `lib/routes.ts` as the single source of truth for terminal-shell routes — 7 entries in sidebar render order with all 5 required fields (slug, pathname, label, ariaLabel, description)
- First entry correctly maps `about` to `pathname: "/"` (not `/about`) per ROUTE-01
- `as const satisfies readonly Route[]` preserves literal types for Phase 2 Sidebar/CommandPalette consumers
- Added `metadataBase: new URL(siteUrl)` to `app/layout.tsx` using `||` operator — build emits zero metadataBase warnings
- `RouteSegment` type alias derived for `useSelectedLayoutSegment()` discrimination in Phase 2

## Route Registry

| # | slug | pathname | label | ariaLabel |
|---|------|----------|-------|-----------|
| 1 | null | / | about.md | About |
| 2 | projects | /projects | projects/ | Projects |
| 3 | stack | /stack | stack.json | Tech stack |
| 4 | experience | /experience | experience.log | Experience |
| 5 | writing | /writing | writing/ | Writing |
| 6 | contact | /contact | contact.sh | Contact information |
| 7 | shipped | /shipped | shipped.app | Shipped apps |

Note: `ariaLabel: "Contact information"` on contact.sh satisfies A11Y-04 plain-noun requirement from CLAUDE.md.

## Task Commits

Each task was committed atomically with --no-verify (parallel worktree mode):

1. **Task 1: Create lib/routes.ts with 7-entry typed Route registry** - `74051ed` (feat)
2. **Task 2: Add metadataBase to app/layout.tsx using || (Pitfall D)** - `895912a` (feat)

**Plan metadata:** (committed with this SUMMARY)

## Files Created/Modified

- `lib/routes.ts` — New file. Typed Route registry with 7 entries, exports Route interface, ROUTES const, RouteSegment type alias
- `app/layout.tsx` — Added siteUrl const (|| guard) and metadataBase field. All other content preserved for Phase 2

## Decisions Made

- Used `||` not `??` for siteUrl — this is the only file in the repo where `||` is correct. An empty-string `NEXT_PUBLIC_SITE_URL` (possible in CI) is falsy but not nullish, so `??` would let it through and crash `new URL("")`. Other files (`lib/api.ts`, `app/sitemap.ts`, `app/robots.ts`) correctly use `??` for their inputs where empty-string behavior doesn't apply to URL construction.
- `description` field included in Route entries beyond CONTEXT.md minimums — Phase 5 OG image generation and Phase 2 command palette tooltips both consume it. No retrofit needed.
- Phase 1 boundary strictly enforced: only `metadataBase` added to `app/layout.tsx`. Title/description rewrite, ThemeProvider wiring, accent boot script are all Phase 2 territory.

## Deviations from Plan

None — plan executed exactly as written. Both tasks follow the plan spec verbatim.

## Issues Encountered

None. Build completed cleanly, TypeScript passes with zero errors.

## Consumer Notes for Phase 2

**Import pattern for all consumers:**
```ts
import { ROUTES, type Route, type RouteSegment } from "@/lib/routes";
```

**Phase 2 / ROUTE-04 sitemap.ts pattern:**
```ts
import { ROUTES } from "@/lib/routes";
// In generateSitemaps or the MetadataRoute.Sitemap return:
ROUTES.map(r => ({ url: `${baseUrl}${r.pathname}`, lastModified: new Date() }))
```

**Phase 5 OG image pattern:**
```ts
import { ROUTES } from "@/lib/routes";
const route = ROUTES.find(r => r.slug === segment);
// route.description is ready — no retrofit needed
```

**useSelectedLayoutSegment() pattern (Phase 2 Sidebar):**
```ts
import type { RouteSegment } from "@/lib/routes";
const segment = useSelectedLayoutSegment() as RouteSegment;
// segment is now narrowed to the literal union of all slug values
```

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `lib/routes.ts` is ready for Phase 2 Sidebar, CommandPalette, and sitemap consumers
- `app/layout.tsx` metadataBase resolved — no more build warning blocking Phase 2 work
- `RouteSegment` type alias available for Phase 2 `useSelectedLayoutSegment()` usage
- No blockers for Phase 2 execution

---
*Phase: 01-foundation*
*Completed: 2026-05-06*
