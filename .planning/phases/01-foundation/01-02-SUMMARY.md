---
phase: 01-foundation
plan: "02"
subsystem: data-model
tags: [types, data, api, refactor, atomic]
dependency_graph:
  requires: ["01-foundation/01"]
  provides: ["lib/types.ts", "lib/portfolio-data.ts", "lib/api.ts"]
  affects: ["app/components/homepage.tsx", "app/components/homepage.test.tsx", "app/page.tsx"]
tech_stack:
  added: []
  patterns:
    - "UPPERCASE module-level dataset constants (PROFILE, PROJECTS, etc.)"
    - "import type { ... } from './types' (type-only imports)"
    - "TODO: string markers for Phase 6 content fill (build-gate via INFRA-05)"
key_files:
  created:
    - lib/portfolio-data.ts
  modified:
    - lib/types.ts
    - lib/api.ts
    - app/components/homepage.tsx
    - app/components/homepage.test.tsx
    - app/page.tsx
  deleted:
    - lib/fallback-data.ts
decisions:
  - "D-17: All 6 data-model files changed in one atomic commit — no partial state"
  - "D-08: Real identity (name, email, GitHub URL, STACK) shipped now; bio/projects/experience/writing/shipped use TODO: markers"
  - "D-10: TODO: markers are string values (not comments) so INFRA-05 postbuild grep catches them"
  - "Rule 3 auto-fix: app/page.tsx updated from old fetcher names (getSkills/getApps/getPosts) to new API (getStack/getShipped/getWriting)"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-06"
  tasks_completed: 6
  files_changed: 7
---

# Phase 1 Plan 02: Atomic Data Model Refactor Summary

Rewrote the terminal portfolio data model as a single atomic commit: 9-interface type system, typed seed data with real identity, adapted API fetchers, shape-adapted homepage component and test — all in one commit with `lib/fallback-data.ts` deletion paired atomically.

## File Operations (7 total — one commit: 7cb8d43)

| Operation | File | Description |
|-----------|------|-------------|
| Modified | `lib/types.ts` | Replaced 6 old interfaces with 9 terminal-data-model interfaces |
| Created | `lib/portfolio-data.ts` | Typed seed data — real identity + STACK; TODO: markers for Phase 6 |
| Modified | `lib/api.ts` | 6 renamed fetchers; getJson helper preserved verbatim |
| Modified | `app/components/homepage.tsx` | Minimal shape adapter; 5 headings preserved character-for-character |
| Modified | `app/components/homepage.test.tsx` | Imports from portfolio-data (UPPERCASE); 5 assertions unchanged |
| Deleted | `lib/fallback-data.ts` | Removed in same commit as portfolio-data.ts introduction (D-17) |
| Modified | `app/page.tsx` | Updated import/call sites from old API names to new (Rule 3 auto-fix) |

## Type Shape Changes

| Old Name | New Name | Key Differences |
|----------|----------|-----------------|
| `Profile` | `Profile` | Added `shortName`, `initials`, `role` (was `title`), `bio: Bio` (was `string`), `resumeUrl` (was `resumeUpdatedAt`), `highlights: Highlight[]`, `socials: Social[]` |
| `SocialLink` | `Social` | Added `handle`, `url` (was `href`), `kind` discriminator |
| `Skill` | `StackCategory` | Changed from individual skill to category+items grouping |
| `Experience` | `Experience` | Replaced `startDate`/`endDate`/`highlights[]` with `period: string` + `summary: string` |
| `MobileApp` | `ShippedApp` | Added `platforms: ReadonlyArray<"ios"\|"android">`, `role`, `year`; `summary` now optional; removed `description` |
| `BlogPost` | `Writing` | Added `date`, `readTime`, `link` (external), `slug`; removed `publishedAt`, `id` |
| (new) | `Project` | Entirely new type for projects/ view |
| (new) | `Highlight` | Stat card helper (value + label) |
| (new) | `Bio` | Bio helper (short: string, long: string[]) |

## API Surface Changes

| Old Fetcher | New Fetcher | Notes |
|-------------|-------------|-------|
| `getSkills(): Skill[]` | `getStack(): StackCategory[]` | Renamed; backend `/api/stack` endpoint (Phase 6) |
| `getApps(): MobileApp[]` | `getShipped(): ShippedApp[]` | Renamed |
| `getPosts(limit): BlogPost[]` | `getWriting(): Writing[]` | Renamed; `limit` param dropped |
| (new) | `getProjects(): Project[]` | Added for BACKEND-01 in Phase 6 |
| `getProfile()` | `getProfile()` | Unchanged name; updated fallback type |
| `getExperience()` | `getExperience()` | Unchanged name; updated fallback type |

`getJson<T>(path: string, fallback: T): Promise<T>` body preserved verbatim per DATA-04.

## Open TODO: Markers in lib/portfolio-data.ts

9 `TODO:` string markers await Phase 6 fill (D-09). These are **string values** (not comments) so INFRA-05 postbuild grep catches any deploy before they are filled:

1. `PROFILE.location` — `"TODO: location string"`
2. `PROFILE.bio.short` — `"TODO: short bio (one line, SEO meta-description)"`
3. `PROFILE.bio.long[0]` — `"TODO: bio paragraph 1"`
4. `PROFILE.bio.long[1]` — `"TODO: bio paragraph 2"`
5. `PROFILE.highlights[0].value` — `"TODO"`
6. `PROFILE.highlights[0].label` — `"TODO: stat label 1"`
7. `PROFILE.highlights[1].value` — `"TODO"`
8. `PROFILE.highlights[1].label` — `"TODO: stat label 2"`
9. `PROFILE.highlights[2].value` + label entries — `"TODO: stat label 3"`
10. `PROFILE.socials[1].handle` — `"TODO: handle"` (LinkedIn)
11. `PROFILE.socials[1].url` — `"TODO: real linkedin url"`

PROJECTS, EXPERIENCE, WRITING, SHIPPED arrays are empty (Phase 6 fills — empty arrays do not trigger the grep).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed app/page.tsx import/call sites**
- **Found during:** Task 6 verification (`npx tsc --noEmit`)
- **Issue:** `app/page.tsx` imported `getApps`, `getPosts`, `getSkills` from `@/lib/api` — all three names were removed in Task 3. TypeScript errors blocked compilation.
- **Fix:** Updated `app/page.tsx` to import `getStack`, `getShipped`, `getWriting` and updated the `Promise.all` call sites accordingly. Variable names (`skills`, `apps`, `posts`) preserved to match `<Homepage>` prop names.
- **Files modified:** `app/page.tsx`
- **Commit:** 7cb8d43 (included in the same atomic commit)

No other deviations — plan executed as written.

## Reminders for Downstream Plans

**Plan 05 / INFRA-05:** The postbuild grep MUST be case-sensitive on `TODO` (uppercase). Developers can safely write lowercase `todo` in prose comments without tripping the gate. The grep list per D-11: `lorem | example.com | placeholder | TODO | Product Studio`.

**Phase 2 first commit:** `app/components/homepage.tsx`, `app/components/homepage.test.tsx`, and `app/components/theme-toggle.tsx` are ALL deleted in the SAME commit that introduces the shell skeleton (D-17 closes the Phase 1/2 boundary cleanly). Do not delete them early.

**Plan 03 note:** `app/components/homepage.tsx` still exists and uses `<ThemeToggle />`. Plan 03 (`lib/routes.ts` + `app/layout.tsx` metadataBase) must NOT touch homepage files — the homepage test must remain green through Phase 1.

## Threat Mitigations Applied

| Threat | Status |
|--------|--------|
| T-DATA-02: `beck@example.com` + `Product Studio` leak strings | Mitigated — `lib/fallback-data.ts` deleted; replacement has real email `beckprograms@gmail.com`; no `Product Studio` anywhere |
| T-PITFALL-F: partial-state compilation break | Mitigated — atomic commit ordering (types→data→api→homepage→test→delete→fix-consumer); `tsc --noEmit` confirmed clean before commit |

## Self-Check

| Item | Result |
|------|--------|
| `lib/types.ts` exports 9 interfaces | PASSED (grep count = 9) |
| `lib/portfolio-data.ts` exports 6 UPPERCASE constants | PASSED |
| `lib/api.ts` exports 6 fetchers; getJson preserved | PASSED |
| `lib/fallback-data.ts` deleted | PASSED |
| `git grep fallback-data -- lib/ app/` = 0 hits | PASSED |
| `npx tsc --noEmit` exits 0 | PASSED |
| `npm test` exits 0 (1 passed) | PASSED |
| No leak strings (`beck@example.com`, `Product Studio`) | PASSED |
| Real identity (`beckprograms@gmail.com`, `github.com/beckinfonet`) | PASSED |
| >= 5 `TODO:` markers in portfolio-data.ts | PASSED (9 markers) |
| Commit hash recorded | 7cb8d43 |

## Self-Check: PASSED
