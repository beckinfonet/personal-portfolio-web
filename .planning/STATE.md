---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: "Plan 05-04 complete (Wave 2 — AboutSocials inline mini-contact card on /about; Phase 4 → Phase 5 carry-forward (Plan 04-05 Gate 9 friction) RESOLVED; A11Y-04 shipped; 26/113 vitest green; build OK; lint clean; 3 task commits c7d0d16/9c40f4c/951d988)"
last_updated: "2026-05-10T16:28:51.897Z"
last_activity: 2026-05-10
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 39
  completed_plans: 35
  percent: 90
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-06)

**Core value:** A distinctive personal portfolio that signals engineering craft through a terminal/IDE aesthetic — without making non-technical recruiters work to find the resume and contact info.
**Current focus:** Phase 05 — seo-accessibility-polish

## Current Position

Phase: 05 (seo-accessibility-polish) — EXECUTING
Plan: 5 of 8
Status: Ready to execute
Last activity: 2026-05-10

Progress: [█████████░] 90% · Phase 1 ✓ · Phase 2 ✓ · Phase 3 ✓ · Phase 4 ✓ · Phase 5 (4/8)

## Performance Metrics

**Velocity:**

- Total plans completed: 7 (this milestone — execute-phase metrics)
- Average duration: ~3m 25s (excluding 04-05 reviewer wall-clock)
- Total execution time: ~24m agent-side + ~30m reviewer wall-clock for Plan 04-05 manual verification

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 04    | 5     | 14m 0s agent + 30m reviewer | n/a (mixed agent/manual) |
| 05    | 4     | ~17m agent | ~4m (Wave 0 + Wave 1A + Wave 1B + Wave 2A) |

**Recent Trend:**

- Last plan: 05-04 (3m 51s) — 2 tasks (Task 1 TDD; Task 2 autonomous), 3 task commits (c7d0d16 RED + 9c40f4c GREEN + 951d988 CSS), 1 file created (about-socials.tsx ~76 lines RSC) + 3 modified (about-view.tsx +2 lines wire-in; about-view.test.tsx +44 lines for 5 new assertions; globals.css +20 lines for .about-socials-card + .contact-muted), 5 new test cases (wrapper + EMAIL mailto + GITHUB ExternalLink + LINKEDIN ExternalLink + DOM-position invariant), vitest now 26/113 (was 26/108), 1 Rule-3 deviation (test-locator scoping fix to disambiguate aria-label collision with existing .about-cta-row), Phase 4 → Phase 5 carry-forward (Plan 04-05 Gate 9 recruiter friction) RESOLVED, A11Y-04 requirement shipped
- Previous: 05-02 (~4m) — 3 tasks (all autonomous), 3 task commits + final-metadata commit, 11 files created (2 favicon RSCs + 1 manifest + 8 OG image RSCs) + 0 modified, scripts/check-og-files.mjs flips green (was fail-loud since 05-01), npm run build emits 23 static pages including all OG/icon/manifest endpoints, vitest stays at 26/26 / 101 green, no deviations from plan (only adjustment was a self-correcting rewording of a comment in manifest.ts to avoid a regex self-match against `! grep -q 'service.worker'`)
- Previous: 05-01 (~6m) — 3 tasks (all autonomous), 3 task commits + final-metadata commit, 13 files created (3 fonts/license + 1 playwright config + 1 contrast spec + 4 vitest scaffolds + 4 smoke scripts) + 5 modified (package.json, package-lock.json, .gitignore, vitest.config.ts, vitest.setup.ts), 4 new vitest scaffold files (101 tests passing up from 97), 4 smoke scripts wired (1 passes today, 3 fail-loud by design until Wave 1+ ships), 3 Rule-3 deviations (added @playwright/test devdep, excluded tests/ from vitest, mocked next/font/google) — all tooling/test-pipeline unblocks, no production-code changes
- Previous: 04-05 (~30m reviewer wall-clock; agent-side <2min) — 4 tasks (1 automated battery + 3 manual checkpoints), 6 commits, 1 file created (SUMMARY) + 4 modified (VERIFICATION + STATE + ROADMAP + REQUIREMENTS) + 2 mid-plan amendment files (globals.css + check-sidebar-redistribution.mjs in commit bf38cf3), Phase 4 verdict PASS, 9 manual gates resolved (7 PASS / 2 DEFERRED-PHASE-7)
- Previous: 04-04 (2m 14s) — 2 tasks (1 TDD), 3 commits, 2 files created + 1 modified, +70 lines (20 component + 42 test + 8 layout net), 4 new test cases (PrintFooter), 97 vitest tests passing (up from 93)
- Earlier: 04-03 (3m 29s) — 3 tasks (2 TDD), 5 commits, 4 files created + 4 modified, net +84 lines (+125 created, -41 sidebar shrink), 12 new test cases (6 status-block + 5 about-view + 1 sidebar STATUS lock), 93 vitest tests passing (up from 81)
- Earlier: 04-02 (3m 54s) — 3 tasks (1 TDD), 4 commits, 2 files created + 5 modified, +354 lines, 14 new test cases, 81 vitest tests passing
- Earliest: 04-01 (4m 23s) — 3 tasks, 5 files modified, +279 lines on globals.css, 3 new audit scripts
- Trend: clean execution, all gates green (lint + build 12 routes + 97 vitest + 3 audit scripts + check:mobile + check-placeholders); Plan 04-05 surfaced one mid-plan CSS bug (orphan grid track) caught by Gate 4 visual review and fixed inline (commit bf38cf3) with audit-script invariant added — Phase 4 contract strengthened, not expanded

*Updated after each plan completion*
| Phase 5 P3 | 3m 12s | 2 tasks | 3 files |
| Phase 5 P4 | 3m 51s | 2 tasks | 4 files (1 created + 3 modified) |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: 7-phase structure derived from research dependency graph (Foundation → Shell → Views → Mobile → Polish → Backend+Content → Deploy)
- Roadmap: Backend work in Phase 6 is parallelizable with Phases 3–5 because the frontend renders against `lib/portfolio-data.ts` fallbacks until cutover
- Roadmap: Recruiter usability requirements (top-bar resume button, plain-noun aria-labels, mobile bottom-sheet) bundled into the Shell phase — non-deferrable
- Roadmap: Brownfield deletions (homepage.tsx, fallback-data.ts, theme-toggle.tsx, homepage.test.tsx) live in the same phase that introduces their replacements (Phase 1 + Phase 2)
- Phase 4 Plan 01: No `print-color-adjust:exact` anywhere in globals.css (threat T-04-01 — default `economy` keeps printer from rendering theme-specific oklch values; `check-print-rules.mjs` enforces this as a CI gate)
- Phase 4 Plan 01: Single mobile breakpoint at 960px (D-01); existing top-bar internal breakpoints (600/480) preserved unchanged — they predate Phase 4 and serve a different concern
- Phase 4 Plan 01: Drawer slide-in 200ms ease-out keyframes shared with mobile palette (one keyframe def — `drawerSlideIn` — two consumers: `.drawer-sheet[data-state="open"]` and `[cmdk-dialog]` at <=960px)
- Phase 4 Plan 01: Per-token print color normalization to #000 / #333 / #999 borders preserves tonal hierarchy on b/w printers without leaking accent colors (16+ selectors mapped)
- Phase 4 Plan 02: Mutual exclusion lives in the ShellStateProvider reducer (PALETTE_OPEN sets drawerOpen:false; DRAWER_OPEN sets paletteOpen:false; toggles only force the other closed when transitioning closed→open) — components calling setOpen don't need to know about the other overlay
- Phase 4 Plan 02: ExplorerDrawer always mounts; data-state attribute drives CSS show/hide (display:none at desktop, slideIn at <=960px) — keeps the dialog in the accessibility tree across open/close, prevents re-mount glitches, lets Plan 04-01 CSS own visibility semantics
- Phase 4 Plan 02: Focus restore uses document.getElementById('topbar-hamburger-btn') instead of capturing document.activeElement at open-time — the trigger lives in TopBar (different component) and is stable across renders, so id-lookup is cleaner than threading a ref through Context
- Phase 4 Plan 03: <StatusBlock /> stays RSC; tz computation isolates into a 3-line <StatusTz /> client leaf that StatusBlock embeds — preserves RSC-first discipline (SHELL-02) while letting Sidebar (client) and AboutView (RSC) both consume the primitive cleanly. The build gate enforces the boundary — if StatusBlock accidentally became a client component, npm run build would fail when AboutView (RSC) imports it (T-04-09 mitigated)
- Phase 4 Plan 03: Sidebar refactor is structural-only — the 16-line inline STATUS markup + 13-line tz IIFE collapse to a single one-line <StatusBlock uptime={uptime} /> render; sidebar.tsx shrinks 105 → 77 lines (-28 net) preserving DOM/CSS/uptime contract exactly at desktop. Phase 2 sidebar tests pass unchanged because rendered DOM text is identical
- Phase 4 Plan 03: AboutView gains exactly one new prop (uptime: string); the new mobile STATUS wrapper is the LAST child of .content-block after the existing CTA row, preserving Phase 3 reading order. Visibility CSS-controlled by Plan 04-01 (display:none default; display:block at <=960px) so STATUS is invisible at desktop and surfaces only on / at mobile widths — exactly the recruiter-trust placement specified in 04-CONTEXT.md D-12/D-13
- Phase 4 Plan 04: PrintFooter stays RSC (no "use client") — content is fully static (props from build-time env + portfolio-data const); CSS visibility was shipped in Plan 04-01. Build gate enforces RSC purity (any accidental client-only code in the component would surface as a Next.js boundary error). T-04-09 mitigated.
- Phase 4 Plan 04: Env-var resolution lives in the parent (layout.tsx), NOT inside PrintFooter — keeps the component pure/testable and matches the same defensive pattern lib/api.ts uses for NEXT_PUBLIC_SITE_URL with localhost fallback. PrintFooter accepts siteUrl as a prop and renders it verbatim; unit tests can construct it with any string and assert exact output.
- Phase 4 Plan 04: PrintFooter mounts as the LAST child of the layout return fragment (after ExplorerDrawer + CommandPalette). Plan 04-01 print stylesheet's `margin-top: 32px` then naturally spaces it away from the (hidden-when-printing) preceding chrome. The Wave 2 mount sequence is now: skip-link → TopBar → terminal-body → ExplorerDrawer (Plan 04-02) → CommandPalette (Phase 2) → PrintFooter (Plan 04-04).
- Phase 4 Plan 05: Phase 4 verdict is PASS even though Gate 9 surfaced friction (recruiter self-simulation took 8–10s to find contact info because the hamburger menu was not discoverable on first glance). The 8–10s number is within the < 10s target — the friction is Phase 5 fuel, not a Phase 4 fail. Lightest fix: lift the 3-row socials block (email + github + linkedin) inline onto /about beneath the lead paragraph; pattern already exists in app/components/views/contact-view.tsx. Defer to Phase 5 to avoid Phase 4 scope creep.
- Phase 4 Plan 05: Real-device gates 7 (iPhone Safari) + 8 (Android Chrome) deferred to Phase 7 production recruiter test (DEPLOY-04) — no physical devices during Phase 4 close, and DEPLOY-04 against the production URL is the stronger validation. Pre-authorized by 04-CONTEXT.md `<deferred>`.
- Phase 4 Plan 05: Mid-plan CSS amendment (commit bf38cf3) caught an orphan-grid-track whitespace bug at phone widths via Gate 4 visual review — `.terminal-body` retained its desktop `grid-template-columns: 240px 1fr` after `.sidebar` was hidden via display:none in `@media (max-width: 960px)`, leaking a 240px empty column onto the mobile layout. Fixed by adding `.terminal-body { grid-template-columns: 1fr; }` inside the existing mobile @media block; check-sidebar-redistribution.mjs gained a 6th invariant scoped to that block to lock the fix. Strengthens the Phase 4 contract — same regression cannot recur silently.
- Phase 5 Plan 01: `@playwright/test` devdep is required alongside `playwright` — the plan's research called for `playwright` only, but the test-runner CLI (`playwright test`) and the `defineConfig` / `test` / `expect` API live in the sibling `@playwright/test` package. Both pin to ^1.59.1; npm dedupes the underlying `playwright@1.59.1`. Logged as Rule-3 blocking auto-fix.
- Phase 5 Plan 01: Vitest excludes `tests/` (Playwright's directory) — added `exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "tests/**"]` to vitest.config.ts. Without this, vitest's default glob picks up `tests/contrast.spec.ts` and fails on `@playwright/test` imports under jsdom. Playwright owns `tests/`; vitest owns `*.test.{ts,tsx}` colocated with source.
- Phase 5 Plan 01: vitest.setup.ts mocks `next/font/google` — module-load-time `JetBrains_Mono({...})` in app/layout.tsx is a Next.js compiler primitive (transformed at build time, not a real runtime function). Without the mock, any test that imports `metadata` from app/layout.tsx throws `JetBrains_Mono is not a function`. Mock returns `{ variable: "--font-mono", className: "font-mono" }` — drop-in replacement for the layout's destructure.
- Phase 5 Plan 01: JetBrains Mono OG fonts live in `assets/`, NOT `public/` (T-05-01 information-disclosure mitigation). RSC code (`opengraph-image.tsx`, `app/icon.tsx`, etc.) reads them at build time via `readFile(join(process.cwd(), "assets/..."))`; the binaries never appear in `.next/static/` route surface. `assets/JetBrainsMono-{Bold,Medium}.ttf` (v2.304) + `assets/JETBRAINS-MONO-LICENSE.txt` (OFL-1.1) committed.
- Phase 5 Plan 01: Wave 0 contract — every later plan's `<verify>` block resolves to a file path that already exists. 4 vitest scaffolds + 4 smoke scripts seeded; 3 of 4 smoke scripts intentionally exit 1 with FAIL output until Wave 1+ ships their source. The moment a Wave 1+ task ships its source, the corresponding smoke script flips green automatically (no script edits needed).
- Phase 5 Plan 02: 8 sibling opengraph-image.tsx files (no shared helper) — RESEARCH Open Question 1 disposition. Per-route diff is one ROUTE_LABEL constant + one alt suffix; ~75 lines × 8 = ~600 lines duplicated. Clarity > DRY in v1; consolidation is a v1.1 candidate if the template diverges per route. Root + (terminal)/ both render about.md (homepage default + about-route landing) — Next.js metadata composition picks the most-specific match.
- Phase 5 Plan 02: First next/og use in repo. All 11 RSCs (8 OG + 2 icon + 1 manifest) inline-style with hardcoded hex constants — Satori does NOT consume external CSS or var(--*). display:flex on every container (Pitfall 2). Font binaries loaded via readFile(join(process.cwd(), "assets/JetBrainsMono-{Bold,Medium}.ttf")) — assets/ vs public/ separation enforces T-05-05 (no public exposure of font binaries). manifest.ts ships icons:[] empty per Pitfall 12 (Next.js auto-includes from app/icon.tsx + app/apple-icon.tsx); display:browser locks T-05-09 (no PWA install push).
- [Phase ?]: Phase 5 Plan 03: Reworded viewport-export comment to avoid literal 'metadata.themeColor' substring — plan's example violated its own acceptance criteria gates (forbid metadata.themeColor + require grep -c themeColor == 1). Rewording preserves intent without forbidden substring. Same self-correction class as Plan 05-02's manifest.ts service-worker comment edit.
- [Phase ?]: Phase 5 Plan 03: Single @media (prefers-reduced-motion: reduce) block — universal-selector reset *, *::before, *::after appended INSIDE existing block at globals.css line 152, NOT a new block. Multiple matching media queries produce duplicate rules and unpredictable cascade order (T-05-12 mitigation). 0.01ms timings (NOT 0ms — Pitfall 7); some browsers treat 0 as falsy. All 6 existing targeted rules preserved (D-17).
- [Phase ?]: Phase 5 Plan 03: viewport.themeColor uses inlined hex literals (#0a0c0b dark, #f4f2ea light) NOT var(--bg) — Next.js metadata composition rejects CSS variables at build time. Hex pulled verbatim from app/globals.css --bg tokens (D-15: 'do NOT re-derive'). themeColor MUST live in separate viewport export, NOT metadata — Pitfall 3 / T-05-10. Build-log scan confirms no 'themeColor in metadata is deprecated' warning. CONTEXT.md D-15 originally said 'metadata.themeColor' (deprecated location); this plan corrected to viewport per RESEARCH Pitfall 3.
- Phase 5 Plan 04: Combined Task 1 GREEN + AboutView wire-in into a single commit. The plan splits wire-in across Task 1 ('create RSC + tests pass') and Task 2 ('wire into about-view.tsx + append CSS') — but the new tests render <AboutView> and look for .about-socials-card; they cannot pass without the wire-in. Cleaner sequence: RED (test) → GREEN (component + wire-in) → CSS append. Three commits, each atomic; TDD gate intact (RED→GREEN visible in git log).
- Phase 5 Plan 04: Test-side scoping fix [Rule 3]: GITHUB and LINKEDIN row assertions originally used top-level getByRole, which matches multiple elements because the existing .about-cta-row (Phase 3) also exposes ExternalLinks with aria-label /open github/i and /open linkedin/i. Scoped to container.querySelector('.about-socials-card') then querySelector('a[aria-label^="Open GitHub"]') / 'Open LinkedIn' to assert the contract under test (the row inside the new block). Plain-noun aria-label phrasing preserved for A11Y-04 — only the test-locator changed (no production aria-label changes). Same self-correction class as Plan 05-02 / 05-03 mid-task adjustments.
- Phase 5 Plan 04: Reused existing .contact-row class with its 90px 1fr auto 3-column grid as-is. UI-SPEC mentions an 80px LABEL column; the existing .contact-row uses 90px. Redefining .contact-row would have cascaded onto contact-view (which has a working 90px column today). The 90px column produces the same visual hierarchy (LABEL + LINK + spacer); UI-SPEC's 80px figure was a design-system reference, not a binding override. Visual fidelity to contact-view is the design intent (D-33: 'Borrows the existing app/components/views/contact-view.tsx row pattern').
- Phase 5 Plan 04: D-34 invalid-url guard via /^https?:\/\// regex — RSC component falls back to <span class="contact-muted"> when URL fails the check; INFRA-05 prebuild grep blocks TODO sentinels from reaching production builds. Defense-in-depth against javascript: protocol URLs (T-05-13 mitigation). Comment wording uses 'invalid-url guard' (NOT 'TODO-guard') to keep new file's grep clean — the regex enforces the guard, not the string TODO.

### Pending Todos

None yet.

### Blockers/Concerns

Open questions surfaced during research synthesis (status updated 2026-05-06 after Phase 2 discuss):

1. ✓ Exact ⌘K verb list copy — RESOLVED in 02-CONTEXT.md D-01..D-05 (~19 verbs, `Open <file-label>` convention, four `Set accent:` verbs, alias index seeded)
2. Writing-posts v1 count (zero with "coming soon" state, or N real posts) — still open; needed for Phase 6 content scope
3. `shipped.app` final app list with valid App Store / Play Store URLs — still open; needed before Phase 3 view work
4. ✓ CI choice — RESOLVED in 01-CONTEXT.md D-01..D-06 (GitHub Actions, PR-only, knip hard-fail)
5. Per-hue chroma/lightness overrides for WCAG compliance — still open; discovered during Phase 5 axe-core audit; potential rework loop into `app/globals.css` tokens
6. Third social pick (Mastodon vs Bluesky vs X) for palette / about / contact — surfaced in 02-CONTEXT.md; data-only decision, deferred to planning or Phase 6 content pass

## Deferred Items

Items acknowledged and carried forward to later phases:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Phase 4 → Phase 5 | Gate 9 friction: recruiter self-simulation took 8–10s to find contact info because the hamburger menu was not discoverable on first glance. Lightest fix: lift the 3-row socials block (email + github + linkedin) inline onto /about beneath the lead paragraph. Pattern already exists in app/components/views/contact-view.tsx. | RESOLVED — Plan 05-04 (2026-05-10) | 2026-05-07 (Plan 04-05) |
| Phase 4 → Phase 7 | Real-device gates 7 (iPhone Safari) + 8 (Android Chrome): confirm dvh/svh handling on actual devices, soft-keyboard behavior in palette, address-bar overlap at top bar. | Bundled with DEPLOY-04 production recruiter test | 2026-05-07 (Plan 04-05) |

## Session Continuity

Last session: 2026-05-10T16:28:51.894Z
Stopped at: Plan 05-04 complete (Wave 2 — AboutSocials inline mini-contact card on /about; Phase 4 → Phase 5 carry-forward (Plan 04-05 Gate 9 friction) RESOLVED; A11Y-04 shipped; 26/113 vitest green; build OK; lint clean; 3 task commits c7d0d16/9c40f4c/951d988)
Resume file: None
