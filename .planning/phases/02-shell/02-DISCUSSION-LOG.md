# Phase 2: Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `02-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 2-shell
**Areas discussed:** ⌘K palette verb taxonomy; Accent picker UI placement; Mobile palette scope in Phase 2 vs Phase 4

---

## Gray Area Selection

User multi-select picked these for discussion:

| Gray Area | Selected | Notes |
|-----------|----------|-------|
| ⌘K palette verb taxonomy | ✓ | STATE.md flagged this as the Phase 2 blocker |
| Accent picker UI placement | ✓ | THEME-05 doesn't say WHERE the picker lives |
| Mobile palette scope (Phase 2 vs Phase 4) | ✓ | PALETTE-05 is mapped to Phase 4 but JSX is shared |
| Stub-page strategy for non-about routes | — | User skipped; Claude defaulted to 7 thin stubs (D-12) |

---

## Area 1 — ⌘K palette verb taxonomy

### Q1.1: Verb naming convention for the 7 route entries

| Option | Description | Selected |
|--------|-------------|----------|
| Open <file-label> (Recommended) | `Open about.md`, `Open projects/`, etc. — file labels match sidebar exactly. Aliases handle recruiter discoverability. | ✓ |
| Go to <plain-noun> | `Go to about`, `Go to projects`. Plainer for recruiters; breaks IDE metaphor inside palette. | |
| Hybrid — file labels for routes, plain verbs for actions | Same as option 1 in practice. | |

**User's choice:** Open <file-label>
**Notes:** Recommended option. Captured as D-01 in CONTEXT.md.

### Q1.2: Palette layout — flat or grouped?

| Option | Description | Selected |
|--------|-------------|----------|
| Flat with alias keywords (Recommended) | No headings; cmdk default; aliases handle filter forgiveness. | ✓ |
| Grouped: Navigate / Actions / Theme & accent / Socials | More discoverable when opened blind; more pixels; slower scan. | |
| Two groups: Navigate + Actions | Theme/accent/socials under Actions. Middle ground. | |

**User's choice:** Flat with alias keywords
**Notes:** Recommended option. Captured as D-02 in CONTEXT.md.

### Q1.3: Accent hue — one cycle verb, four explicit verbs, or sub-page?

| Option | Description | Selected |
|--------|-------------|----------|
| Four explicit `Set accent: <hue>` verbs (Recommended) | Type-filterable per hue, discoverable, names the hues. | ✓ |
| Single `Cycle accent hue` verb | Rotates through 4 hues; one item; doesn't surface hue names. | |
| `Open accent picker` cmdk sub-page | Most discoverable; deepest interaction; requires cmdk's Pages pattern. | |

**User's choice:** Four explicit verbs
**Notes:** Recommended option. Captured as D-03 in CONTEXT.md. Drives final verb count to ~19 (D-05).

---

## Area 2 — Accent picker UI placement

### Q2.1: Where does the picker live as a visible UI affordance (in addition to the four palette verbs)?

| Option | Description | Selected |
|--------|-------------|----------|
| Palette-only — no extra UI (Recommended) | The four palette verbs are the entire UI. Cleanest top bar; zero extra responsive surface. | ✓ |
| Sidebar STATUS-block swatches | Four 8×8px dots in STATUS section; on-canvas; invisible on mobile (sidebar collapses). | |
| Top-bar swatches (4 tiny dots between ⌘K and theme toggle) | Most discoverable; risks crowding resume button at narrow viewports. | |
| Both palette + tiny top-bar trigger | Trigger opens ⌘K with `accent` pre-typed; one affordance, two entry points. | |

**User's choice:** Palette-only — no extra UI
**Notes:** Recommended option. Captured as D-06 in CONTEXT.md. Rationale: keeps top-bar room for the persistent resume button (Risk 3 / SHELL-03 — non-negotiable).

---

## Area 3 — Mobile palette scope in Phase 2 vs Phase 4

### Q3.1: What palette behavior ships in Phase 2 vs Phase 4?

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 2 ships desktop modal at every viewport; Phase 4 adds bottom-sheet (Recommended) | ⌘K trigger exists in top-bar at all viewports; on mobile, opens centered 520px modal. Phase 4 wraps with bottom-sheet styling. Keeps Phase 4 mobile-holistic. | ✓ |
| Phase 2 ships fully responsive palette (desktop modal + mobile bottom-sheet) | Pulls PALETTE-05 forward; palette finished in one place; adds mobile palette tests to Phase 2 TEST-03. | |
| Phase 2 hides ⌘K trigger on mobile (<960px); Phase 4 reveals + ships bottom-sheet | Conservative; violates SHELL-03's "every viewport" framing; ⌘K keyboard shortcut without visible trigger is confusing on iPad-with-keyboard. | |

**User's choice:** Phase 2 ships desktop modal at every viewport; Phase 4 adds bottom-sheet
**Notes:** Recommended option. Captured as D-10 in CONTEXT.md. PALETTE-05 stays mapped to Phase 4 in REQUIREMENTS.md.

---

## Wrap-up question

| Option | Description | Selected |
|--------|-------------|----------|
| Ready for context (Recommended) | Write CONTEXT.md, DISCUSSION-LOG.md, commit, auto-advance to plan-phase. | ✓ |
| Explore more gray areas | Surface 2-4 more (TopBar precedence, STATUS dynamics, 404 copy, theme-toggle micro-animation). | |
| Stub-page strategy needs explicit confirmation | Re-open: 7 stubs vs only `/`? | |

**User's choice:** Ready for context

---

## Claude's Discretion

Areas not surfaced as user questions but locked in CONTEXT.md `<decisions>` as Claude's discretion:

- Stub-page strategy → 7 thin route stubs in Phase 2 (D-12) so Phase 2 success criterion 4 (`⌘K opens each of 7 views`) is verifiable on day one.
- next-themes config → `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange` (D-07).
- Existing `app/layout.tsx` `themeScript` block (which reads `portfolio-theme` — wrong key for next-themes default) is deleted in the same commit as the Phase 2 first wave (D-08, D-15).
- LiveClock format: 24h HH:MM, user's local time, `aria-hidden="true"`, render `--:--` server-side to prevent hydration mismatch (D-14).
- STATUS block: static "Available for hire", `Intl.DateTimeFormat` for tz, `formatUptime(start, now)` from a `CAREER_START_DATE` constant (D-15).
- 404 page renders inside the (terminal) shell, copy = `$ ls -la <pathname>` style (D-17).
- TopBar narrow-viewport precedence: resume button + theme toggle + ⌘K trigger always visible; traffic-lights and path label compress first; LiveClock hides below ~480px.
- Test approach (TEST-02/03/04) — D-18, D-19, D-20.
- Wave sequencing — D-21 (5 waves: tokens → providers + brownfield deletes → shell + islands → route stubs + sitemap + 404 → tests).

---

## Deferred Ideas

Recorded in CONTEXT.md `<deferred>` section. Highlights:

- Mobile palette bottom-sheet → Phase 4 (PALETTE-05)
- Sidebar mobile drawer + STATUS rehoming → Phase 4 (MOBILE-01..04)
- Per-view metadata enrichment → Phase 3 (ROUTE-02)
- `<ExternalLink>` shared component → Phase 3 (SEO-05)
- OG images / JSON-LD / Twitter card / favicon → Phase 5 (SEO-01..04)
- 8-combination axe-core contrast audit → Phase 5 (A11Y-07)
- CSP nonce for inline scripts → still deferred per Phase 1 D-15
- Console signature + view-source comment → Phase 5 (DEV-01/02)
- `?` cheatsheet + `g`+letter vim nav → v1.x (PALETTE-V2-01/02)

No scope creep emerged during discussion — the user picked from the offered options without proposing new capabilities.
