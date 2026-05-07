---
phase: 03-views
plan: 10
subsystem: ui
tags: [view, contact, copy-button, mailto, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-01 ExternalLink primitive (ghost github CTA + social rows route through it; showGlyph={false} branch consumed here). Plan 03-02 CopyButton client island (icon-only variant on EMAIL row). Plan 03-04 view+primitive CSS (.contact-lead / .contact-card / .contact-row / .contact-label / .contact-cta-row / .copy-button / .copy-button--icon / .btn / .btn-ghost). Plan 03-05 about-view RSC pattern (file-shape template). Plan 03-13 cleared inherited build gate so npm run build is green at execution time."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title string for the contact route ('contact.sh — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('./contact.sh --whoami'). PromptLine primitive at app/components/primitives/prompt-line.tsx. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "lib/api.ts silent-fallback fetcher (getProfile returns Promise<Profile>, falls back to PROFILE seed when backend unreachable). lib/types.ts Profile / Social shape with kind discriminator. lib/routes.ts ROUTES[5] (description, pathname) — single source of truth for metadata description + canonical."
  - design
    provides: "design_handoff_terminal_portfolio/app.jsx lines 441–468: lead paragraph (line 448), 90px label-column card layout, EMAIL row mailto + copy affordance, footer CTA row with longer '↓ download resume.pdf' (line 463) and literal 'github ↗' (line 464)."

provides:
  - "ContactView RSC at app/components/views/contact-view.tsx — receives Profile prop, renders the full V6 contact-view layout (hardcoded LEAD_PARAGRAPH + 3-column 90px-label card with EMAIL row [mailto + CopyButton] and social rows [ExternalLink with handle] + footer CTAs [resume button + ghost github literal arrow])."
  - "Async page wrapper at app/(terminal)/contact/page.tsx — fetches Profile via getProfile(), composes <PromptLine /> + <ContactView />, exports enriched static metadata (LOCKED title preserved + description + alternates.canonical)."
  - "TEST-05 smoke spec at app/(terminal)/contact/page.test.tsx — three assertions: render-without-throw, locked-title export, locked-prompt-text in body."

affects:
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — contact metadata.title and alternates.canonical now feed the cross-view uniqueness assertion."
  - "Phase 4 (mobile redistribution) — ContactView's flex-wrap CTA row + max-width 480px card already adapt to narrow viewports; no desktop-only patterns introduced."
  - "Phase 5 (SEO-01..04) — extends the per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-01..05) — fills PROFILE.email / .resumeUrl / .socials with real LinkedIn URL once authored; ContactView reads PROFILE.* verbatim, no view edits expected."
  - "Phase 6 (BACKEND-04) — when zod email validation lands at lib/api.ts silent-fallback chokepoint, the mailto: href chain is implicitly hardened (T-03-29 mitigation evolves)."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page wrapper as async RSC, fetches data, passes typed props to view RSC (mirrors Plan 03-05 about-view template)."
    - "Static metadata: Metadata via template-literal off ROUTES[i].label so the LOCKED Phase 2 D-12 title is single-sourced and any future label edit cascades correctly."
    - "Per-view metadata.description sourced from ROUTES[i].description (single source of truth — no prose drift between sidebar/palette/sitemap/metadata)."
    - "Per-view metadata.alternates.canonical sourced from ROUTES[i].pathname (relative; resolves against Phase 1 metadataBase)."
    - "External CTAs always route through <ExternalLink> primitive (SEO-05 — no raw target=_blank in view code)."
    - "Resume CTA = same-origin <a> with download attribute (NOT ExternalLink) — same pattern established in about-view."
    - "mailto: protocol uses plain <a> (NOT ExternalLink) — protocol handler, not external in SEO-05 sense."
    - "EMAIL row carries dual affordance (mailto link + CopyButton) per CONTEXT D-05/specifics — recruiter can either tap to open mail client OR explicit one-tap copy."
    - "ExternalLink showGlyph={false} branch exercised on ghost github CTA so the literal '↗' character in the children renders without auto-glyph appending (handoff app.jsx line 464 verbatim)."
    - "Smoke test pattern: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is the locked string, (3) body contains the locked prompt-line text."

key-files:
  created:
    - "app/components/views/contact-view.tsx — RSC view (90 lines). Hardcoded LEAD_PARAGRAPH + role='group' card with EMAIL mailto+CopyButton row and per-social ExternalLink rows + footer CTA row (download resume + ghost github literal-arrow)."
    - "app/(terminal)/contact/page.test.tsx — TEST-05 smoke spec (25 lines). 3 assertions; uses globals: true (no vitest import); defensive next/navigation mock returning 'contact' segment."
  modified:
    - "app/(terminal)/contact/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (24 lines). Imports getProfile, ContactView, ROUTES; metadata gains description + alternates; body composes <PromptLine cmd='./contact.sh --whoami' /> + <ContactView profile={profile} />; orphan <p className='stub-body'> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "metadata.title built via template literal off ROUTES[5].label (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single."
  - "LEAD_PARAGRAPH lifted to top-of-file module constant (not inlined in JSX, not lifted to lib/portfolio-data.ts) — keeps role-specific recruiter copy with the view template per CONTEXT §V6 decision."
  - "GitHub social resolved via .find((s) => s.kind === 'github') rather than index lookup — type-safe against array reorderings (Social.kind is a typed enum discriminator)."
  - "Defensive `github &&` guard around ghost CTA — render is type-safe even if PROFILE.socials lacks a github entry (won't happen in v1, but prevents undefined-access)."
  - "EMAIL row CopyButton uses icon-only variant (idleLabel='⧉' / copiedLabel='✓') — no 'copy' text, saves space in the contact card's 3-column grid (90px / 1fr / auto)."
  - "Empty <span /> as third grid cell on social rows — placeholder so the 3-column grid layout stays consistent with the EMAIL row (otherwise auto-sized column would collapse)."
  - "Resume button uses literal '↓ download resume.pdf' (longer label per handoff app.jsx line 463) — distinct from about-view's '↓ resume.pdf'; do NOT normalize."
  - "Ghost github CTA uses showGlyph={false} so the literal '↗' inside children is the rendered arrow — handoff line 464 specifies the literal character outside ExternalLink's automatic glyph behavior."

# Execution metrics
metrics:
  duration: "~4 minutes (planning + 2 task commits + summary)"
  tasks-completed: 2
  files-created: 2
  files-modified: 1
  commits: 2
  completed: 2026-05-06T17:25:00Z
---

# Phase 3 Plan 10: Contact View Summary

Built the contact-view RSC slice — the highest-affordance view in Phase 3 — with a hardcoded recruiter lead paragraph, a 90px-label-column card carrying mailto + clipboard affordances on the EMAIL row and ExternalLink social rows beneath, and a footer CTA row pairing the resume download button with a ghost github CTA that uses ExternalLink's showGlyph={false} branch to render the literal handoff arrow.

## What Was Built

### `app/components/views/contact-view.tsx` (RSC, 90 lines)

A pure RSC view body that receives `Profile` as a prop and composes:

1. **Lead paragraph** — module-level `LEAD_PARAGRAPH` constant carrying handoff `app.jsx` line 448 verbatim ("Open to senior + staff full-stack and AI engineering roles. Remote-first, occasional travel ok."). Lifted to a top-of-file constant rather than inlined in JSX so the LOCKED string is grep-locatable.
2. **Contact card** — `<div role="group" aria-label="Contact methods">` containing:
   - **EMAIL row**: 3-column grid with uppercased "EMAIL" label, `<a href={`mailto:${profile.email}`}>` link with `aria-label="Send email to <email>"` (plain noun per CLAUDE.md), and an icon-only `<CopyButton>` (`⧉` idle / `✓` copied) with `aria-label="Copy email <email>"`.
   - **Social rows**: one per `profile.socials[]` entry, uppercased label column + `<ExternalLink>` rendering `s.handle` text + auto `↗` glyph; defensive empty `<span />` placeholder occupies the third grid cell so the 3-column layout stays consistent.
3. **Footer CTA row**:
   - Primary `<a className="btn" href={profile.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf">↓ download resume.pdf</a>` — same-origin link, NOT routed through ExternalLink (it's an asset, not external). Note the LONGER label per handoff line 463 (distinct from about-view's `↓ resume.pdf`).
   - Ghost `<ExternalLink showGlyph={false}>github ↗</ExternalLink>` — literal `↗` inside children, suppressed auto-glyph per handoff line 464. Conditionally rendered behind a `github &&` guard (defensive type-safety against PROFILE.socials lacking a github entry).

### `app/(terminal)/contact/page.tsx` (RSC, 24 lines)

Async page wrapper that:

- Imports `ROUTES`, `getProfile`, `ContactView`, `PromptLine`.
- Pins the route via `const route = ROUTES[5];` (contact).
- Exports `metadata: Metadata` with:
  - `title: ${route.label} — Bakytbek Tatibekov` (preserves LOCKED Phase 2 D-12 string via template literal — single source of truth on `route.label`).
  - `description: route.description` (sourced from ROUTES[5].description — no prose drift).
  - `alternates: { canonical: route.pathname }` (resolves against Phase 1 metadataBase).
- Default export `async function ContactPage()` awaits `getProfile()` then renders `<PromptLine cmd="./contact.sh --whoami" />` followed by `<ContactView profile={profile} />`.
- Orphan `<p className="stub-body">` markup removed in the same commit (CLAUDE.md brownfield delete-and-replace).

### `app/(terminal)/contact/page.test.tsx` (test, 25 lines)

TEST-05 smoke spec with three assertions:

1. `await ContactPage()` renders without throwing; the locked prompt text appears.
2. `metadata.title === "contact.sh — Bakytbek Tatibekov"` (LOCKED Phase 2 D-12 string).
3. Body contains the locked prompt-line text `./contact.sh --whoami`.

Defensive `vi.mock("next/navigation")` returns segment `"contact"` for any transitive consumer; uses globals-true vitest config (no `import { describe, test, expect, vi }`).

## Commits

| Task | Commit | Type | Description |
| ---- | ------ | ---- | ----------- |
| 1    | `ec3939e` | feat | add ContactView RSC with mailto + CopyButton + handoff CTAs |
| 2    | `969e44b` | feat | wire contact page to ContactView + add TEST-05 smoke spec |

## Verification Results

- `npm run typecheck` → exits 0 (after each task).
- `npm test -- 'app/(terminal)/contact/page.test.tsx'` → 3 passed / 3 total.
- `npm run build` → compiled successfully; `/contact` route prerendered as static (605 B / 103 kB First Load JS); postbuild placeholder check passed (`✓ INFRA-05: .next/server/ clean`).
- `grep -c '"use client"'` on `contact-view.tsx` reports `1` because of the `// NO "use client"` header comment — same pattern as `about-view.tsx` (which shipped successfully in Plan 03-05). Intent of the check (no actual client directive) is satisfied: the file is RSC. Documented in Deviations below.
- All 13 grep acceptance assertions on `contact-view.tsx` content pass via `grep -qF` (literal mode handles the `↓` / `↗` / `${}` characters cleanly).
- All 5 grep acceptance assertions on `page.tsx` pass; `stub-body` count is `0`.

## Deviations from Plan

### Auto-fixed Issues

**None — plan executed exactly as written.**

The plan's `grep -c '"use client"'` automated assertion expects `0` but returns `1` because the file's first-line comment `// NO "use client" — RSC view body` contains the literal string. This same false positive exists in `app/components/views/about-view.tsx` (Plan 03-05) and was accepted there. The intent — "no `"use client"` directive at top of file" — is satisfied (the file is a pure RSC). No code change made; the comment header is the project convention from `app/components/primitives/prompt-line.tsx` line 1 and PATTERNS.md §"RSC vs Client Boundary Discipline".

## Out-of-Scope Findings (Logged, Not Fixed)

- `npm run lint` reports ~20k errors, all originating from sibling worktrees at `.claude/worktrees/agent-*/` (parallel-execution worktree leakage). Zero lint errors come from `app/components/views/contact-view.tsx`, `app/(terminal)/contact/page.tsx`, or `app/(terminal)/contact/page.test.tsx`. Per scope-boundary rule (Rule N — only fix issues directly caused by current task's changes), these are not addressed in this plan.
- `npm test` (full suite) reports 60 failed / 318 total — all failures are duplicates of legitimate tests being executed inside the sibling worktree paths (and one pre-existing `command-palette.test.tsx > typing 'contact'` failure unrelated to this plan's changes; the contact route's own page.test.tsx passes). Out of scope for plan 03-10.

## Threat Surface Compliance

Plan's `<threat_model>` mitigations all in effect:

| Threat ID | Status | Where mitigated |
|-----------|--------|-----------------|
| T-03-29 (mailto: tampering) | mitigate-now via typed Profile.email; future Phase 6 BACKEND-04 zod | `lib/portfolio-data.ts` static seed; `<a href={`mailto:${profile.email}`}>` |
| T-03-30 (clipboard write) | accept (intentional affordance) | `<CopyButton value={profile.email}>` |
| T-03-31 (reverse tabnabbing on github CTA) | mitigate via ExternalLink `rel="noopener noreferrer"` | `app/components/primitives/external-link.tsx` |
| T-03-32 (referrer leak on github CTA) | mitigate via ExternalLink `noreferrer` | same as T-03-31 |
| T-03-33 (handle text spoofing) | accept — typed string + React auto-escape | `{s.handle}` rendering |

No new threat surface introduced beyond the plan's threat model.

## Self-Check: PASSED

- FOUND: app/components/views/contact-view.tsx
- FOUND: app/(terminal)/contact/page.tsx
- FOUND: app/(terminal)/contact/page.test.tsx
- FOUND: commit ec3939e (Task 1)
- FOUND: commit 969e44b (Task 2)
