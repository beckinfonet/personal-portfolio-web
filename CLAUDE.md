# Terminal Portfolio — Claude Project Guide

This is the `portfolio-web/` Next.js 15 frontend, undergoing a terminal/IDE-themed redesign. A sibling backend lives at `../portfolio-services/`.

## Where to Find Things First

Always read these before answering questions or making changes:

- `.planning/PROJECT.md` — what we're building, who for, key decisions, out-of-scope items
- `.planning/ROADMAP.md` — 7-phase plan and current position
- `.planning/STATE.md` — current phase, recent decisions, open blockers
- `.planning/REQUIREMENTS.md` — 89 v1 requirements with phase mapping
- `.planning/research/SUMMARY.md` — convergent decisions, cross-cutting risks
- `.planning/codebase/` — 7 docs mapping the existing codebase
- `design_handoff_terminal_portfolio/README.md` — high-fidelity design spec (the canonical visual reference)
- `design_handoff_terminal_portfolio/app.jsx` — design source of truth for any visual ambiguity

## Working Conventions for This Project

**Stack constraints (do not violate):**
- Next.js 15 App Router + React 19 + TypeScript strict (no framework swap)
- Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules)
- Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1` — do not introduce others without revisiting `.planning/research/STACK.md`
- Phase 7 exception: `@vercel/analytics@^2.0.1` added for `resume_download` event tracking (DEPLOY-06). Third and final v1 prod dep — same "no new prod deps" rule applies going forward.
- Native `fetch` + `next: { revalidate }` for data — no SWR, no TanStack Query

**Architecture rules (from `.planning/research/ARCHITECTURE.md`):**
- Persistent shell lives at `app/(terminal)/layout.tsx` (route group); never unmounts on view switching
- `app/layout.tsx` is a Server Component — only thin client islands carry `"use client"` (`TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`)
- Active view is derived from `useSelectedLayoutSegment()` — never mirror it into Context or Zustand
- Theme uses `next-themes`; **accent hue is a separate axis** managed by an inline pre-paint script that sets `--accent-hue` on `<html>`
- `lib/routes.ts` is the single source of truth for the 7 routes — Sidebar, CommandPalette, and `app/sitemap.ts` all import from it

**Brownfield discipline:**
- When deleting `app/components/homepage.tsx`, `homepage.test.tsx`, `lib/fallback-data.ts`, `app/components/theme-toggle.tsx`, do it in the same commit that introduces the replacement — never delete-then-replace
- Backend type changes ship as paired commits (frontend `lib/types.ts` + sibling `portfolio-services/` endpoint) referencing each other

**Dual audience non-negotiables:**
- Persistent resume download button visible in the top bar at every viewport
- Sidebar file rows have plain-noun `aria-label` (e.g. `aria-label="Contact information"` on `contact.sh`)
- Mobile sidebar redistributes to bottom-sheet drawer + top-bar — never `display: none` with no replacement
- 5-second recruiter test is a real exit criterion

## GSD Workflow

This project uses the GSD workflow. Common commands:

- `/gsd-progress` — see current position and what's next
- `/gsd-plan-phase N` — create the plan for phase N (next: `/gsd-plan-phase 1`)
- `/gsd-execute-phase N` — execute the plan for phase N
- `/gsd-discuss-phase N` — gather context before planning
- `/gsd-ui-phase N` — generate the UI design contract for a frontend phase
- `/gsd-verify-work` — validate built features against requirements

YOLO mode is configured (auto-approve). Quality model profile (Opus for research/roadmap, Sonnet elsewhere).

## Build and Test

```bash
npm run dev      # local dev at http://localhost:3000
npm run build    # production build (will fail if INFRA-05 prebuild grep finds placeholders)
npm run lint     # ESLint
npm test         # Vitest
```

Backing API at `http://localhost:8080` is optional — `lib/api.ts` falls back to static data when unreachable.
