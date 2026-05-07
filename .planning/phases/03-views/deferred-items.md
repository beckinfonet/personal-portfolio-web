# Phase 3 — Deferred Items

Out-of-scope discoveries logged during Wave 1 execution. These do NOT block Wave 1 plans; they are inherited Wave-1 conditions that Wave 4 (view wiring) resolves naturally.

## Knip "Unused files" warnings on Wave 1 primitives

**Discovered:** Plan 03-03 execution (2026-05-06)
**Files flagged by knip:**
- `app/components/primitives/external-link.tsx` (shipped 03-01)
- `app/components/primitives/kbd.tsx` (shipped 03-01)
- `app/components/primitives/tech-chip.tsx` (shipped 03-01)
- `app/components/primitives/store-badge.tsx` (shipped 03-03)

**Root cause:** Wave 1 ships primitives BEFORE their view consumers (per CONTEXT D-19). Until Wave 4 wires the views (about, projects, stack, experience, writing, contact, shipped), every newly shipped primitive will be flagged by knip.

**Resolution path:** Auto-resolves when Wave 4 plans (03-05 through 03-11) wire each primitive into its consuming view component. No code change to the primitives themselves is needed.

**Why not fixed in Plan 03-03:** Out-of-scope per the executor SCOPE BOUNDARY rule — the primitives in question are pre-existing or inherited; Plan 03-03's scope is the StoreBadge primitive itself. Trying to "fix" knip by adding a stub consumer would violate the wave-by-wave dependency ordering and create churn.

**Build impact:** None — `npm run build` does NOT run knip. CI runs `npx knip` as a gate; Wave 4 must clear it before merging the full Phase 3 branch.
