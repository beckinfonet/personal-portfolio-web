---
phase: 03-views
plan: 05
subsystem: ui
tags: [view, about, vertical-slice, rsc, metadata, smoke-test, phase-3]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-01 ExternalLink primitive (ghost socials route through it). Plan 03-04 view+primitive CSS (.about-role / .about-meta / .about-para / .about-cards / .about-card / .about-card-value / .about-card-label / .about-cta-row / .btn / .btn-ghost / .terminal-main h1). Plan 03-13 cleared the inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title string for the about route ('about.md — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('cat about.md'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getProfile returns Promise<Profile>, falls back to PROFILE seed when backend unreachable). lib/types.ts Profile / Highlight / Bio / Social shape. lib/routes.ts ROUTES[0] (description, pathname) — single source of truth for metadata description + canonical."

provides:
  - "AboutView RSC at app/components/views/about-view.tsx — receives Profile prop, renders the full V1 about-view layout (H1 + role subline + location + bio paragraphs + 3 stat cards + resume CTA + ghost socials)."
  - "Async page wrapper at app/(terminal)/page.tsx — fetches Profile via getProfile(), composes <PromptLine /> + <AboutView />, exports enriched static metadata (title preserved + description + alternates.canonical)."
  - "TEST-05 smoke spec at app/(terminal)/page.test.tsx — three assertions: render-without-throw, locked-title export, locked-prompt-text in body."
  - "Validated end-to-end vertical-slice template (page → view → primitives → test) for the six remaining views in Plans 03-06..03-11."

affects:
  - "03-06 (projects-view), 03-07 (stack-view), 03-08 (experience-view), 03-09 (writing-view), 03-10 (contact-view), 03-11 (shipped-view) — each replicates this plan's page→view→smoke-test shape."
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — the metadata pattern landed here (template literal off ROUTES[i].label + description + alternates.canonical) is the contract 03-12's cross-view test enforces."
  - "Phase 5 (SEO-01..04) — extends the per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-01..05) — fills PROFILE.bio.long, .highlights, .location with real content; AboutView renders array values verbatim, no view edits expected."
  - "Phase 7 (recruiter 5-second test) — about-view is the LCP target; hierarchy peaks (H1 name, accent role, accent stat values, primary resume CTA) all paint at first frame."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page wrapper as async RSC, fetches data, passes typed props to view RSC (ARCHITECTURE.md Pattern 1 + Pattern 3)."
    - "Static metadata: Metadata via template-literal off ROUTES[i].label so the LOCKED Phase 2 D-12 title is single-sourced and any future label edit cascades correctly."
    - "Per-view metadata.description sourced from ROUTES[i].description (single source of truth — no prose drift between sidebar/palette/sitemap/metadata)."
    - "Per-view metadata.alternates.canonical sourced from ROUTES[i].pathname (relative; resolves against Phase 1 metadataBase)."
    - "External CTAs always route through <ExternalLink> primitive (SEO-05 — no raw target=_blank in view code)."
    - "Smoke test pattern: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is the locked string, (3) body contains the locked prompt-line text."
    - "Resume CTA = same-origin <a> with download attribute (NOT ExternalLink) — the `download` is a hint, not authority (T-03-18 mitigation)."

key-files:
  created:
    - "app/components/views/about-view.tsx — RSC view (58 lines). H1 + role + location + bio.long.map + highlights.map (3 stat cards) + resume CTA + socials.map (ghost ExternalLinks)."
    - "app/(terminal)/page.test.tsx — TEST-05 smoke spec (29 lines). 3 assertions; uses globals: true (no vitest import); defensive next/navigation mock."
  modified:
    - "app/(terminal)/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (23 lines). Imports getProfile, AboutView, ROUTES; metadata gains description + alternates; body composes <PromptLine /> + <AboutView profile={profile} />; orphan <p className=\"stub-body\"> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[0].label (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single (any future relabel cascades to title automatically)."
  - "ghost-social key uses s.kind (not array index) — typed enum, stable across reorderings, satisfies React reconciler key uniqueness without index-key anti-pattern."
  - "Resume CTA stays a same-origin <a> (not ExternalLink) because PROFILE.resumeUrl is /resume.pdf — wrapping in ExternalLink would force target=_blank for a same-origin file download, hurting recruiter UX (browser would lose the page context)."

patterns-established:
  - "Vertical-slice template for the six remaining views: 1 view file at app/components/views/<name>-view.tsx (RSC), 1 page rewrite at app/(terminal)/<route>/page.tsx (async RSC, enriched metadata), 1 smoke spec at the page-test sibling."
  - "View prop shape: ({ <typed-data>: <Type> }) — page fetches, view receives. No data fetching inside view bodies."
  - "RSC-discipline header comment: `// NO \"use client\" — RSC view body (Pitfall 9 / SHELL-02)` — matches the convention already used in app/not-found.tsx and primitives."
  - "Smoke-spec convention: await the async-page default export inside the test, render the returned UI, assert against the locked title string + locked prompt text."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-01, VIEW-08, SEO-05, TEST-05]

# Metrics
duration: 4m
completed: 2026-05-06
---

# Phase 3 Plan 05: About View Vertical Slice Summary

**About-view vertical slice landed — RSC view component + async page wrapper with enriched metadata + TEST-05 smoke spec — validating the page→view→primitives→test template for the six remaining Wave 4 view plans.**

## Performance

- **Duration:** ~4 min (executor-side; counts wall time across cherry-pick recovery)
- **Started:** 2026-05-06T17:12:00Z
- **Completed:** 2026-05-06T17:16:00Z
- **Tasks:** 3 / 3
- **Files created:** 2 (`app/components/views/about-view.tsx`, `app/(terminal)/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/page.tsx`)

## Accomplishments

- New RSC component `AboutView` rendering the V1 about-view layout per UI-SPEC §V1: H1 name + `// {role}` accent subline + muted location + N bio paragraphs + 3 stat cards + primary resume CTA + ghost social CTAs.
- About page (`app/(terminal)/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getProfile()`, composes `<PromptLine cmd="cat about.md" />` + `<AboutView profile={profile} />`. The Phase 2 stub `<p className="stub-body">` paragraph removed in the same commit (CLAUDE.md brownfield delete-and-replace discipline).
- Static `metadata: Metadata` enriched with `description: route.description` (sourced from `ROUTES[0]`) and `alternates: { canonical: route.pathname }`. The LOCKED Phase 2 title `"about.md — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec passes 3 assertions: (1) AboutPage renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `cat about.md` prompt text.
- SEO-05 enforced: every external link in `about-view.tsx` flows through `<ExternalLink>` (which bakes `target="_blank" rel="noopener noreferrer"`); zero raw `target="_blank"` in either view or page (T-03-15 / T-03-16 mitigation).
- All gates green: `npm test` 45/45 passing across 11 files, `npm run typecheck` clean, `npm run lint` clean, `npm run build` exits 0 with all 12 pages prerendered as static, postbuild INFRA-05 placeholder check clean.

## Task Commits

Each task was committed atomically (`--no-verify` per worktree convention):

1. **Task 1: Create AboutView RSC component** — `992d3ad` (feat)
2. **Task 2: Rewrite about page wrapper to async RSC + enriched metadata** — `9de4a4e` (feat)
3. **Task 3: Add about-page TEST-05 smoke spec (3 assertions)** — `a10a2b3` (test)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/about-view.tsx` (created, +58) — RSC view; reads `Profile` prop; renders `.content-block` wrapper, single `<h1>{name}</h1>`, `.about-role` (`// {role}`), `.about-meta` (location), N `.about-para` paragraphs from `bio.long`, `.about-cards` grid (3 `.about-card` children with `.about-card-value` + `.about-card-label`), `.about-cta-row` containing primary resume `<a class="btn" download="Bakytbek_Tatibekov_Resume.pdf">↓ resume.pdf</a>` and ghost `<ExternalLink class="btn-ghost">{label.toLowerCase()}/</ExternalLink>` per social.
- `app/(terminal)/page.tsx` (modified, +12 / -4) — Phase 2 stub replaced with async RSC; imports `getProfile`, `AboutView`, `ROUTES`, `PromptLine`; static metadata gains `description` + `alternates`; body composes the prompt-line + view; orphan `<p className="stub-body">` removed.
- `app/(terminal)/page.test.tsx` (created, +29) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); defensively mocks `next/navigation`; awaits `AboutPage()` and renders the result.

## Decisions Made

- **Resume CTA stays same-origin `<a>` (not `<ExternalLink>`).** `PROFILE.resumeUrl` resolves to `/resume.pdf` (same-origin); using `<ExternalLink>` would force `target="_blank"` for a file the recruiter expects to download in-page. The handoff and UI-SPEC §V1 spec the primary CTA as `<a class="btn" download="..." href="...">` — preserved exactly.
- **Ghost-social React key = `s.kind`.** `Social.kind` is a typed string-union enum and is unique across `PROFILE.socials`; using it instead of array index gives stable reconciler keys across reorderings (Phase 6 may re-rank socials; the keys remain valid).
- **Static metadata title built via template literal off `ROUTES[0].label`.** Preserves the LOCKED Phase 2 D-12 string AND single-sources the file label — any future relabel of `ROUTES[0].label` cascades to the title automatically. The template-literal approach satisfies the LOCKED-string acceptance criterion via runtime evaluation; the smoke test's `expect(metadata.title).toBe("about.md — Bakytbek Tatibekov")` confirms.

## Deviations from Plan

None — all three tasks executed exactly as written in `03-05-PLAN.md`. No Rule 1/2/3 auto-fixes triggered; the plan was fully prescriptive (dependencies 03-01, 03-04, 03-13 had pre-shipped every primitive, CSS class, and build-gate the view needed).

## Issues Encountered

**Worktree-vs-parent shell-cwd mismatch (recovered cleanly).**

The shell tool's per-call cwd reset, combined with absolute-path `cd` commands targeting the parent repo, caused Task 1's and Task 2's initial commits to land on the parent repo's `main` branch (commits `407d9cd` and `014f6cc`) instead of this worktree branch. Recovery: cherry-picked both commits onto the worktree branch (yielding `992d3ad` and `9de4a4e`), then hard-reset parent `main` back to its prior `90a80bd` HEAD. The parent repo working tree was restored to its pre-execution state (the temporary `app/(terminal)/page.test.tsx` left untracked there was deleted before re-writing in the worktree).

Verification of recovery: `git worktree list` shows worktree at `9de4a4e` → `a10a2b3` (Task 3) and parent `main` back at `90a80bd` (untouched). All three Task commits are now on the worktree branch and reachable; nothing was lost.

This is a worktree-topology artifact, not a defect of the plan or the changes. Future executors operating in nested worktrees should anchor every Bash call to `pwd` rather than `cd <absolute-parent-path>`.

**Acceptance-criterion grep vs. project-convention comment (documented, no change).**

Task 1's acceptance criterion `grep -c '"use client"' app/components/views/about-view.tsx | grep -qx 0` literally returns `1` because the file's first line is the project-convention comment `// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)` — the same comment used in `app/not-found.tsx`, `app/components/primitives/prompt-line.tsx`, `app/components/primitives/external-link.tsx`. The plan's `<action>` block prescribes that comment verbatim (line 152 of `03-05-PLAN.md`), so the file is consistent with the established convention. The acceptance criterion's intent — "no actual `'use client'` directive at the top of the file" — is satisfied: `grep -nE '^"use client";?\s*$'` returns nothing in either `about-view.tsx` or `page.tsx`. No code change applied; documenting here so the verifier and Plan 03-12 are aware of the literal-vs-intent gap.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives. No environment variables, no external services, no manual config.

## Next Phase Readiness

- **Wave 4 (Plans 03-06..03-11) unblocked.** Each replicates this plan's three-task shape: (1) create RSC view, (2) rewrite page wrapper to async RSC + enriched metadata, (3) add smoke spec. Six views in parallel; this slice validated the template end-to-end.
- **Plan 03-12 (cross-view metadata + title-uniqueness test) unblocked.** The metadata contract landed here (template literal off `ROUTES[i].label` + `description: route.description` + `alternates: { canonical: route.pathname }`) is the shape 03-12's `Set(allTitles).size === 7` cross-view test enforces.
- **Phase 4 (mobile redistribution) unaffected.** No desktop-only patterns introduced; CSS classes consumed are already responsive-ready (Plan 03-04 sized the about-cards grid in a mobile-friendly way).
- **Phase 6 (CONTENT-01..05) unblocked.** AboutView renders `bio.long.map(...)`, `highlights.map(...)`, and `socials.map(...)` against typed array shapes — Phase 6 swaps the seed values in `lib/portfolio-data.ts` with no view edits required.

## Threat Mitigation Verification

- **T-03-15 (reverse tabnabbing on social CTAs):** mitigated. `grep -c 'target="_blank"' app/components/views/about-view.tsx` returns `0`; every social CTA renders `<ExternalLink>` which bakes `target="_blank" rel="noopener noreferrer"`.
- **T-03-16 (referrer leak on social CTAs):** mitigated. `noreferrer` is baked into `<ExternalLink>` — confirmed in `app/components/primitives/external-link.tsx` line 28.
- **T-03-17 (untyped Profile fields rendering as elements):** accepted per plan; `bio.long: string[]`, React auto-escapes string text content, data origin is developer-controlled `lib/portfolio-data.ts` (Phase 6 / BACKEND-04 will add zod validation at the api boundary).
- **T-03-18 (URL injection in resumeUrl):** mitigated by typing (Profile.resumeUrl is `string`, hardcoded `/resume.pdf` in `lib/portfolio-data.ts`) and by the `download` attribute being a hint, not authority. Phase 6 / BACKEND-04 will add URL/scheme validation at the api boundary.

## Self-Check: PASSED

- `app/components/views/about-view.tsx` — FOUND
- `app/(terminal)/page.tsx` — FOUND (modified)
- `app/(terminal)/page.test.tsx` — FOUND
- Commit `992d3ad` (`feat(03-05): add AboutView RSC component`) — FOUND in `git log`
- Commit `9de4a4e` (`feat(03-05): rewrite about page wrapper to async RSC + enriched metadata`) — FOUND in `git log`
- Commit `a10a2b3` (`test(03-05): add about-page TEST-05 smoke spec (3 assertions)`) — FOUND in `git log`

---
*Phase: 03-views*
*Completed: 2026-05-06*
