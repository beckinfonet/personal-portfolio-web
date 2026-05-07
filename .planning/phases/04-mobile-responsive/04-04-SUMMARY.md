---
phase: 04-mobile-responsive
plan: 04
subsystem: ui
tags: [rsc-primitive, print, layout-mount, a11y-09, phase-4]

# Dependency graph
requires:
  - phase: 02-shell
    provides: app/(terminal)/layout.tsx route-group RSC layout, PROFILE + CAREER_START_DATE imports, .terminal-shell wrapping
  - phase: 04-mobile-responsive
    plan: 01
    provides: ".print-footer CSS class with default display:none and @media print display:block !important + margin-top 32px + border-top + page-break-inside:avoid + #333 color"
  - phase: 04-mobile-responsive
    plan: 02
    provides: "<ExplorerDrawer /> mount inside the same layout fragment that Plan 04-04 layers PrintFooter on top of (preserved untouched)"
provides:
  - "<PrintFooter /> RSC primitive — pure function with PrintFooterProps { siteUrl, email } rendering <aside class='print-footer' aria-hidden='true'>{siteUrl} · {email}</aside>"
  - "PrintFooter mount in app/(terminal)/layout.tsx as the LAST child of the layout fragment (after ExplorerDrawer + CommandPalette) so all 7 routes inherit it"
  - "Env-var fallback: layout reads process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000' and passes it as siteUrl prop"
  - "4 unit tests: aria-hidden + .print-footer class semantics, URL+email middle-dot composition, localhost fallback render, no-unsafe-HTML smoke check"
affects: [04-05 mobile-tests-and-verification (Wave 4 manual print preview review now has all components shipped), future Phase 7 deploy + recruiter test]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "RSC primitive with prop-based env resolution: parent (layout.tsx) resolves the env var with fallback; the component stays pure and testable. Mirrors the lib/api.ts ?? 'http://localhost:3000' defensive pattern Phase 1 established."
    - "TDD strict RED→GREEN: print-footer.test.tsx confirmed RED (Failed to resolve import './print-footer') before print-footer.tsx existed; GREEN landed all 4 tests in a single iteration."
    - "Co-located test pattern (test sits next to component, not in a separate __tests__ dir) — same convention as primitives/copy-button.test.tsx and primitives/external-link.tsx upstream"

key-files:
  created:
    - app/components/print-footer.tsx
    - app/components/print-footer.test.tsx
  modified:
    - app/(terminal)/layout.tsx

key-decisions:
  - "PrintFooter stays RSC (no 'use client') — content is fully static (props from build-time env + portfolio-data const); CSS visibility is shipped already from Plan 04-01. Build gate enforces RSC purity: any accidental client-only code in the component would surface as a Next.js boundary error."
  - "Env-var resolution lives in the parent (layout.tsx), NOT inside PrintFooter — keeps the component pure/testable and matches the same defensive pattern lib/api.ts uses for NEXT_PUBLIC_SITE_URL with localhost fallback. PrintFooter accepts siteUrl as a prop and renders it verbatim."
  - "PrintFooter mounts as the LAST child of the layout return fragment (after ExplorerDrawer + CommandPalette). Plan 04-01 print stylesheet's `margin-top: 32px` then naturally spaces it away from the preceding hidden chrome at print time. Each Wave 2 mount sits side-by-side: ExplorerDrawer (drawer affordance), CommandPalette (palette overlay), PrintFooter (always-DOM print footer)."
  - "aria-hidden='true' on the <aside> — on-screen rendering is display:none and screen-reader users read URL + email from the contact view directly, not from the print footer (which exists for paper output, not for AT)."
  - "PROFILE.email reused — does not introduce new email exposure (T-04-10 accept). Same email is already public on the contact view; print footer reuses the same value (per 04-RESEARCH.md §Security Domain)."

patterns-established:
  - "rsc-primitive-with-static-props: when an RSC primitive needs build-time environment values, the parent RSC resolves them with defensive fallback and passes as props — keeps the component pure, testable, and free of build-time/process.env coupling. PrintFooter is the exemplar."
  - "print-stylesheet-component: a component that exists only for print (default display:none + @media print display:block) lives in app/components/ as an RSC, gets mounted once in the route-group layout, and inherits CSS visibility from a single source (Plan 04-01)."

requirements-completed: [A11Y-09]

# Metrics
duration: 2m 14s
completed: 2026-05-07
---

# Phase 4 Plan 04: PrintFooter RSC Primitive + Layout Mount Summary

**Pure RSC `<PrintFooter />` primitive shipped as the print-only `{site URL} · {email}` line for all 7 routes — mounted once in `app/(terminal)/layout.tsx` after the existing ExplorerDrawer and CommandPalette mounts, with env-var fallback `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` + `PROFILE.email` props. CSS visibility (`.print-footer` display:none default, display:block !important under `@media print`) was already in place from Plan 04-01. Closes A11Y-09 at the component level — Wave 4 manual print-preview review on each of the 7 routes is now unblocked.**

## Performance

- **Duration:** 2m 14s
- **Started:** 2026-05-07T17:12:06Z
- **Completed:** 2026-05-07T17:14:20Z
- **Tasks:** 2 (Task 1 TDD with explicit RED + GREEN commits; Task 2 auto)
- **Commits:** 3 (1 RED + 1 GREEN + 1 wiring) — plan metadata commit will be the 4th
- **Files created:** 2 (print-footer.tsx, print-footer.test.tsx)
- **Files modified:** 1 (app/(terminal)/layout.tsx)
- **Lines added:** ~70 (20 in print-footer.tsx + 42 in print-footer.test.tsx + 8 net in layout.tsx)
- **New test cases shipped:** 4 (all PrintFooter)
- **Total vitest suite:** 22 files / 97 tests (up from 21 / 93)

## Accomplishments

- **PrintFooter RSC primitive shipped (A11Y-09 component-complete)** — `app/components/print-footer.tsx` is a 20-line pure function component with no `"use client"` directive, no React hooks, no env access. Renders `<aside class="print-footer" aria-hidden="true">{siteUrl} · {email}</aside>`. The PrintFooterProps interface documents both props. `aria-hidden` is intentional: on-screen render is display:none, and SR users read URL + email from the contact view directly.
- **Mount layered on top of existing ExplorerDrawer + CommandPalette** — `app/(terminal)/layout.tsx` was modified earlier in this wave by Plan 04-02 (which mounted ExplorerDrawer). Plan 04-04 reads the current file state, preserves the existing ExplorerDrawer + CommandPalette mounts unchanged, and adds PrintFooter as a sibling AFTER both — final order in the fragment is: skip-link → TopBar → terminal-body (Sidebar + main) → ExplorerDrawer → CommandPalette → **PrintFooter**.
- **Env-var fallback in the parent (testability win)** — layout.tsx resolves `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` and passes it as the `siteUrl` prop. PrintFooter itself is unaware of `process.env` — so unit tests construct it with any string and assert verbatim render. Same defensive pattern Phase 1 established in `lib/api.ts`.
- **4 unit tests shipped, all passing** — covers (1) `<aside class="print-footer">` with `aria-hidden="true"` semantics, (2) URL + email separated by " · " (middle dot, U+00B7), (3) localhost fallback URL renders correctly when passed in, (4) no `<script>` children + `aside.children.length === 0` smoke check (T-04-12 mitigation — confirms React's text-only escape path).
- **TDD strict RED→GREEN gate** — RED commit `a0e912e` confirmed failing with "Failed to resolve import './print-footer'" before any implementation. GREEN commit `489e2c0` shipped the 20-line component and all 4 tests passed in a single iteration.
- **All 7 routes will print the footer** — `npm run build` produces a clean route table (12 routes total: 7 views + robots + sitemap + not-found + others). PrintFooter is mounted at the route-group layout level so every route inherits it; CSS owns the print-only visibility from Plan 04-01.
- **No regressions across the full suite** — 97/97 vitest tests passing, lint clean, all 3 mobile audit scripts (`check-sidebar-redistribution`, `check-print-rules`, `check-mobile-palette-css`) passing, postbuild `check-placeholders.mjs` passing.

## Task Commits

Each task was committed atomically (single-repo, no sub_repos configured). Plan was TDD on Task 1; Task 2 was auto:

1. **Task 1 RED: Add failing test for PrintFooter RSC primitive** — `a0e912e` (test)
2. **Task 1 GREEN: Implement PrintFooter RSC primitive** — `489e2c0` (feat)
3. **Task 2: Mount PrintFooter in terminal layout with env-var fallback** — `38a8b0f` (feat)

**Plan metadata commit:** pending (final docs commit will include this SUMMARY + STATE + ROADMAP updates).

## TDD Gate Compliance

The plan declared `tdd="true"` on Task 1. Gate sequence verified in git log:

- **Task 1 (PrintFooter RSC primitive):** Strict RED→GREEN sequence — `a0e912e` test commit confirmed failing (module not found) before `489e2c0` implementation commit landed all 4 tests green.
- **Task 2 (layout mount):** Tagged `type="auto"` (not tdd). The mount itself has no test (it's a pure JSX edit covered by `npm run build` succeeding); the Vitest path covers it indirectly via the route page tests, which all 21 passed.

## Files Created/Modified

- `app/components/print-footer.tsx` — NEW. 20-line RSC primitive (no `"use client"` directive). PrintFooterProps interface with `{ siteUrl: string; email: string }`. Renders `<aside class="print-footer" aria-hidden="true">{siteUrl} · {email}</aside>`. Header comment documents the dual contract: (1) RSC primitive intent (no client directive), (2) CSS visibility shipped earlier in Plan 04-01 (default display:none, @media print display:block !important). Comment intentionally avoids the literal `"use client"` substring so the acceptance criterion `grep '"use client"' app/components/print-footer.tsx` returns 0 hits.
- `app/components/print-footer.test.tsx` — NEW. 42-line co-located unit test. 4 cases covering aria-hidden + .print-footer class semantics, URL+email composition with middle dot, localhost fallback render, and no-unsafe-HTML smoke check. Uses standard `@testing-library/react` `render` + `screen` + `container.querySelector` patterns; no provider wrapper needed (component is pure).
- `app/(terminal)/layout.tsx` — MODIFIED. Two precise edits: (1) added `import { PrintFooter } from "@/app/components/print-footer";` alongside the existing TopBar/Sidebar/CommandPalette/ExplorerDrawer/Breadcrumb imports, (2) appended `<PrintFooter siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"} email={PROFILE.email} />` as the LAST child of the layout return fragment, after both `<ExplorerDrawer />` (Plan 04-02) and `<CommandPalette />` (Phase 2). PROFILE was already imported on line 12; no re-import. ExplorerDrawer and CommandPalette mounts are preserved EXACTLY — Plan 04-04 layers on top, never replaces.

## Decisions Made

All decisions captured in the `key-decisions:` frontmatter list. Most relevant downstream:

1. **PrintFooter is RSC** — content is fully static; no need for client behavior. Build gate enforces the boundary (any accidental client-only code surfaces as a Next.js boundary error during `npm run build`). T-04-09 mitigated.
2. **Env-var resolution lives in the parent** — keeps PrintFooter pure/testable; mirrors the lib/api.ts NEXT_PUBLIC_SITE_URL pattern from Phase 1.
3. **Mount as the LAST sibling in the fragment** — preserves the layered Wave 2 mount order: ExplorerDrawer (Plan 04-02) → CommandPalette (Phase 2) → PrintFooter (Plan 04-04). Print stylesheet's `margin-top: 32px` from Plan 04-01 then naturally spaces the footer away from the (hidden-when-printing) preceding chrome.
4. **aria-hidden='true' on the <aside>** — print footer is for paper output, not AT consumption. SR users get URL + email from the contact view directly. Avoids redundant SR announcements during normal page navigation.

## Deviations from Plan

None - plan executed exactly as written.

**Minor edit-time clarification:** During Task 1 implementation, the file's header comment originally read `// NO "use client" — RSC primitive ...` which contained the literal `"use client"` substring. Acceptance criterion `grep '"use client"' app/components/print-footer.tsx returns 0 hits` then matched the comment (false positive). Reworded the comment to `// RSC primitive — no client directive ...` to satisfy the strict grep semantics; the meaning is preserved (file is RSC, no directive). This is a textual refinement of the comment, not a change to the component contract or behavior.

**The PreToolUse:Edit reminder hook fired three times** during execution (once per first Edit/Write to a file the harness perceived as "not yet read"); each time the underlying edit had already succeeded — verified by post-hook reads, greps, and test runs. No content was lost or rewritten as a result of the hook reminders.

## Issues Encountered

None during planned work. RED gate confirmed failing for the right reason (module not found). GREEN gate landed on first run — all 4 tests passed. Lint, typecheck, build (12 routes), all 3 audit scripts (`check:mobile`), postbuild placeholder check, and the full Vitest suite (22 files, 97 tests) all green at end of execution.

## User Setup Required

None — no external service configuration required. All work is local TypeScript + tests; no env vars added (`NEXT_PUBLIC_SITE_URL` is already wired from Phase 1 / ROUTE-03 with localhost fallback); no third-party services touched; no new prod deps. The print footer reads existing values via existing channels.

## Visual Note

This plan ships the wiring; the **PrintFooter is visually inert at every viewport at screen** because Plan 04-01 already wrote the CSS:
- Sets `.print-footer { display: none }` as the default — invisible across the entire site.
- Flips it to `display: block !important; margin-top: 32px; padding-top: 8px; border-top: 1px solid #999; font-size: 10pt; color: #333; page-break-inside: avoid; text-align: center;` inside `@media print` — visible only when the user prints (browser's Cmd+P → save as PDF, or actual paper print).

So the production behavior is: at every screen viewport (375 / 768 / 1024 / desktop), PrintFooter is in the DOM but invisible. When a recruiter saves the page as PDF or prints to paper, the footer appears at the bottom of the rendered output with the URL + email, giving them a way back to the live site and a direct contact channel.

Manual cross-viewport print preview review on each of the 7 routes is owned by Plan 04-05 (Wave 4 manual verification). Plan 04-04 verifies the wiring + behavior in jsdom only.

## Next Phase Readiness

**Wave 2 complete (all 3 plans landed).** With Plan 04-04 done, the Wave 2 mount sequence is:
- 04-02: ExplorerDrawer client island + ☰ trigger + useDrawer slice — DONE
- 04-03: StatusBlock RSC primitive + StatusTz client leaf + Sidebar refactor + AboutView mobile STATUS rehome — DONE
- 04-04: PrintFooter RSC primitive + layout mount — DONE (this plan)

Wave 3 (04-05 mobile tests + verification) is now fully unblocked. The component surface for Wave 3 is:
- `explorer-drawer.tsx` + `.test.tsx` (9 tests — Plan 04-02)
- `status-block.tsx` + `.test.tsx` (6 tests — Plan 04-03)
- `status-tz.tsx` (Plan 04-03)
- `about-view.tsx` + `.test.tsx` (5 tests — Plan 04-03)
- **`print-footer.tsx` + `.test.tsx` (4 tests — Plan 04-04)**
- `app/globals.css` (Plan 04-01: +279 lines mobile + print + reduced-motion)
- 3 audit scripts (Plan 04-01: check-sidebar-redistribution, check-print-rules, check-mobile-palette-css)

ROADMAP Phase 4 success criterion 5 ("print preview renders white background, black text, hidden chrome, serif fallback body") is now COMPONENT-COMPLETE. The visual gate (per-route print preview review on each of the 7 routes via Cmd+P) is owned by Wave 3 (Plan 04-05). At this point all CSS, all components, and all tests required for the manual review are in place.

ROADMAP Phase 4 success criterion 4 (sidebar redistribution audit) — already CSS-anchored from Plan 04-01 — continues to pass via `npm run check:mobile`.

The full suite at end of Wave 2 (post Plan 04-04): **22 vitest files, 97 tests, all green; lint clean; build clean across 12 routes; all 3 mobile audits pass; postbuild placeholder check passes.**

## Self-Check: PASSED

**Files exist:**
- FOUND: app/components/print-footer.tsx (20 lines)
- FOUND: app/components/print-footer.test.tsx (42 lines, 4 tests)
- FOUND: app/(terminal)/layout.tsx (modified, +8 lines net — PrintFooter import + mount)

**Commits exist (verified via `git log --oneline`):**
- FOUND: a0e912e — test(04-04): add failing test for PrintFooter RSC primitive
- FOUND: 489e2c0 — feat(04-04): implement PrintFooter RSC primitive
- FOUND: 38a8b0f — feat(04-04): mount PrintFooter in terminal layout with env-var fallback

**Build + tests + audits pass:**
- npm run lint: clean
- npm run build: succeeds across 12 routes; postbuild check-placeholders.mjs passes
- npx vitest run (full suite): 22 files / 97 tests all passing (up from 21 / 93)
- npm run check:mobile: all 3 audits passing (sidebar redistribution / Pitfall 7 / MOBILE-01, print rules / A11Y-09, mobile palette CSS / PALETTE-05)

**Acceptance criteria (per plan):**
- FOUND: `grep '"use client"' app/components/print-footer.tsx` returns 0 hits (RSC purity confirmed; no directive in source)
- FOUND: `grep "PrintFooterProps" app/components/print-footer.tsx` returns 2 hits (interface declaration + props destructure)
- FOUND: `grep 'aria-hidden="true"' app/components/print-footer.tsx` returns 1 hit
- FOUND: `grep "print-footer" app/components/print-footer.tsx` returns 2 hits (header comment reference + className)
- FOUND: `grep "dangerouslySetInnerHTML" app/components/print-footer.tsx` returns 0 hits (T-04-12 mitigated)
- FOUND: `grep "import { PrintFooter }" app/(terminal)/layout.tsx` returns 1 hit
- FOUND: `grep "<PrintFooter" app/(terminal)/layout.tsx` returns 1 hit
- FOUND: `grep "process.env.NEXT_PUBLIC_SITE_URL" app/(terminal)/layout.tsx` returns 1 hit
- FOUND: `grep '?? "http://localhost:3000"' app/(terminal)/layout.tsx` returns 1 hit
- FOUND: `grep "email={PROFILE.email}" app/(terminal)/layout.tsx` returns 1 hit

---
*Phase: 04-mobile-responsive*
*Completed: 2026-05-07*
