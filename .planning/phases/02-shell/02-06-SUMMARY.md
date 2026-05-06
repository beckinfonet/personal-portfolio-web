---
phase: 02-shell
plan: "06"
subsystem: routing
tags: [routes, sitemap, 404, rsc, stubs]
dependency_graph:
  requires: [02-03]
  provides: [route-stubs, sitemap, not-found]
  affects: [app/(terminal), app/sitemap.ts, app/not-found.tsx]
tech_stack:
  added: []
  patterns:
    - RSC page stubs with metadata export per Next.js App Router convention
    - Tiny "use client" child component (NotFoundPathname) for pathname in RSC 404
    - ROUTES.map() sitemap pattern (Pattern 5 from 02-RESEARCH.md)
key_files:
  created:
    - app/(terminal)/page.tsx
    - app/(terminal)/projects/page.tsx
    - app/(terminal)/stack/page.tsx
    - app/(terminal)/experience/page.tsx
    - app/(terminal)/writing/page.tsx
    - app/(terminal)/contact/page.tsx
    - app/(terminal)/shipped/page.tsx
    - app/not-found.tsx
    - app/components/not-found-pathname.tsx
  modified:
    - app/sitemap.ts
    - app/globals.css
decisions:
  - Used tiny "use client" NotFoundPathname child component for pathname display in RSC 404 (D-17 option 2 — cleaner than headers() x-invoke-path approach)
  - Used ?? not || for sitemap baseUrl (sitemap string prefix, not new URL() argument per PATTERNS.md)
metrics:
  duration: "133s"
  completed: "2026-05-06"
  tasks_completed: 2
  files_modified: 11
---

# Phase 2 Plan 06: Route Stubs, Sitemap, and 404 Summary

**One-liner:** 7 RSC route stubs with per-route metadata + PromptLine cmds, ROUTES-driven sitemap (7 entries), and terminal-styled 404 with pathname display and route list.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create all 7 RSC route stubs in app/(terminal)/ | f0760c8 | app/(terminal)/page.tsx + 6 siblings, app/globals.css |
| 2 | Rewrite app/sitemap.ts and create app/not-found.tsx | 778d345 | app/sitemap.ts, app/not-found.tsx, app/components/not-found-pathname.tsx, app/globals.css |

## What Was Built

### Task 1: 7 RSC Route Stubs

All 7 routes under `app/(terminal)/` now resolve instead of 404ing, enabling palette navigation ("Open about.md" etc.) to work. Each stub:

- Is a pure RSC (no `"use client"` directive at file top)
- Exports `metadata: Metadata` with a unique `title` matching the D-13 table (e.g. `"about.md — Bakytbek Tatibekov"`)
- Renders `<PromptLine cmd="..." />` with the correct D-13 command
- Renders a `.stub-body` placeholder paragraph that Phase 3 will replace with real view content

Stub commands per route (D-13):
- `/` → `cat about.md`
- `/projects` → `ls -la projects/`
- `/stack` → `cat stack.json | jq`
- `/experience` → `git log --oneline --decorate experience.log`
- `/writing` → `ls writing/ && cat *.md`
- `/contact` → `./contact.sh --whoami`
- `/shipped` → `ls -la shipped/`

### Task 2: Sitemap + 404

**`app/sitemap.ts`** rewritten to map over `ROUTES` (7 entries), with `changeFrequency: "weekly"`, priority `1` for `/` and `0.8` for all other routes, and `lastModified: new Date()`. Uses `??` (not `||`) for the baseUrl default — correct for a string prefix (not a `new URL()` argument).

**`app/not-found.tsx`** renders a terminal-styled 404:
- Prompt line: `$ ls -la <pathname>` (pathname from `<NotFoundPathname />` client child)
- Error line: `ls: cannot access '<pathname>': No such file or directory`
- Available files section: all 7 ROUTES mapped as `<Link>` elements with label + description
- Next.js automatically returns HTTP 404 for requests matched to `not-found.tsx`

**`app/components/not-found-pathname.tsx`** is a 5-line `"use client"` component using `usePathname()` — the cleanest approach for getting the 404 path into an RSC page (D-17 decision).

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

All 7 route pages are intentional stubs per D-12. Each renders `// view body lands in Phase 3`. These are tracked and expected — Phase 3 replaces each stub body with real view content. The stubs fulfil the Phase 2 goal (routes resolve, palette navigation works, unique metadata titles exist) without prematurely pulling data-fetching into the shell phase.

## Threat Flags

None — no new security surface introduced. The `NotFoundPathname` client component renders `usePathname()` output (the URL the user navigated to) into a React text node which HTML-escapes automatically (T-2-11 accepted in threat model).

## Self-Check: PASSED

- app/(terminal)/page.tsx: FOUND
- app/(terminal)/projects/page.tsx: FOUND
- app/(terminal)/stack/page.tsx: FOUND
- app/(terminal)/experience/page.tsx: FOUND
- app/(terminal)/writing/page.tsx: FOUND
- app/(terminal)/contact/page.tsx: FOUND
- app/(terminal)/shipped/page.tsx: FOUND
- app/sitemap.ts: FOUND (ROUTES.map present)
- app/not-found.tsx: FOUND (ls -la present, ROUTES.map present)
- app/components/not-found-pathname.tsx: FOUND
- Commits f0760c8, 778d345: FOUND in git log
- npm run typecheck: PASSED
- npm test: PASSED (no test files yet — Phase 2 Plan 07 adds tests)
