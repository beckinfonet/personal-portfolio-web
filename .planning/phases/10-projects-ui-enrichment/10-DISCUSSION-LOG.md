# Phase 10: Projects UI Enrichment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 10-projects-ui-enrichment
**Areas discussed:** Detail panel home, Card link structure, Language labels, Strip placement & glyph

---

## Detail panel home

### Q1 — Where should the Tech highlights panel live (no detail route exists)?

| Option | Description | Selected |
|--------|-------------|----------|
| New /projects/[slug] route | Dynamic route; closest to the seed's wording; biggest scope (route, slug gen, generateStaticParams, nav, OG image) | |
| Inline row expand | Accordion-style disclosure on the existing /projects list; no new route | ✓ |
| Always-shown on card | Panel always visible beneath each card; simplest but list gets long | |

**User's choice:** Inline row expand
**Notes:** The "detail page" becomes an expanded state of the existing card.

### Q2 — What triggers the panel and what happens to the external project.link?

| Option | Description | Selected |
|--------|-------------|----------|
| Chevron toggle, row stays a link | Dedicated [+]/chevron control toggles; rest of row keeps linking to project.link | |
| Row click expands | Row body click expands; project.link moves into the panel as a CTA; row no longer an external anchor | ✓ |
| Whole row toggles, link in panel | Entire row is the toggle button; both project.link and GitHub link as in-panel CTAs | |

**User's choice:** Row click expands
**Notes:** Side effect — resolves the nested-anchor problem in the "Card link structure" area.

### Q3 — What happens for projects with no repoUrls / null stats?

| Option | Description | Selected |
|--------|-------------|----------|
| Not expandable, links out | Repo-less projects keep external-link behavior; only repo-backed projects expand | |
| Expands to minimal panel | Every project expands; repo-less ones show summary + Visit project CTA, no Tech highlights | ✓ |
| Not expandable, no link | Repo-less projects render plain non-interactive; outbound link dropped/moved | |

**User's choice:** Expands to minimal panel
**Notes:** Uniform interaction; satisfies DETAIL-07 by omitting only the stats block.

### Q4 — Accordion behavior for multiple rows?

| Option | Description | Selected |
|--------|-------------|----------|
| Accordion — one at a time | Opening a row auto-closes others | |
| Independent — multiple open | Each row toggles independently; allows side-by-side comparison | ✓ |

**User's choice:** Independent — multiple open

---

## Card link structure

Resolved as a side effect of the Detail-panel-home Q2 decision: the project row
becomes a toggle button rather than an `<a>`, so the `gh:` strip token and the
in-panel CTAs ("View on GitHub", "Visit project") coexist without illegal
nested anchors. No dedicated questions were needed.

---

## Language labels

### Q1 — How to handle languages with no obvious short form?

| Option | Description | Selected |
|--------|-------------|----------|
| Curated map, fallback to full | Explicit name→abbrev map; unmapped languages render full GitHub name | ✓ |
| Curated map, fallback to clip | Same map; unmapped names clipped to a short form | |
| GitHub names verbatim | No abbreviation anywhere | |

**User's choice:** Curated map, fallback to full

### Q2 — Detail panel labels — abbreviations or full names?

| Option | Description | Selected |
|--------|-------------|----------|
| Full names in panel | Strip abbreviates; panel uses full GitHub names with percentages | ✓ |
| Abbreviations everywhere | Curated abbreviations in both strip and panel | |

**User's choice:** Full names in panel

### Q3 — Trace-language noise in the strip's top 1-3?

| Option | Description | Selected |
|--------|-------------|----------|
| Min % threshold | Include only languages >= ~5% of bytes | |
| Top 3 raw, no filter | Always take top 3 regardless of size | |
| Top 3, drop <1% | Take top 3 but drop anything under 1% | ✓ |

**User's choice:** Top 3, drop <1%

### Q4 — Does the <1% floor apply to the detail panel breakdown?

| Option | Description | Selected |
|--------|-------------|----------|
| No floor in panel | Panel shows true breakdown; trace languages summed into "other" | |
| Apply floor in panel too | Drop <1% everywhere before the top-5 + other breakdown | ✓ |

**User's choice:** Apply floor in panel too
**Notes:** Consequence — displayed percentages may not sum to exactly 100%.

---

## Strip placement & glyph

### Q1 — Where should the one-line stat strip sit?

| Option | Description | Selected |
|--------|-------------|----------|
| Body column, under chips | Inside the 1fr body column, below the tech-chip row | ✓ |
| Full-width below grid | Spans the full card width on its own row beneath the grid | |
| Body column, above chips | Inside body column, under the summary | |

**User's choice:** Body column, under chips

### Q2 — LIST-05 source marker form?

| Option | Description | Selected |
|--------|-------------|----------|
| 'gh:' text token | Monospace text token; no asset; terminal-native; CSS-themeable | ✓ |
| Octocat SVG glyph | Inline GitHub icon; more recognisable but adds an asset + sizing/color work | |

**User's choice:** 'gh:' text token

### Q3 — LIST-06 mobile behavior: wrap or truncate?

| Option | Description | Selected |
|--------|-------------|----------|
| Truncate langs to top-1 at 480px | CSS media query hides langs 2-3 | |
| Let the strip wrap | All languages kept; strip wraps to a second line on narrow screens | ✓ |
| Truncate the language list only | Keep commits + duration; only the language segment collapses | |

**User's choice:** Let the strip wrap

### Q4 — Reconcile CSS wrap with LIST-09/SC-5's named "truncation branch"?

| Option | Description | Selected |
|--------|-------------|----------|
| Wrap via CSS, retarget the test | LIST-09 truncation branch reinterpreted as a layout/rendering assertion; note as a requirement-wording deviation | ✓ |
| Keep a truncation helper anyway | Wrap via CSS but also implement a formatStripLanguages helper with a real truncation code path | |
| Reconsider — truncate after all | Reverse the prior answer; go back to CSS truncation | |

**User's choice:** Wrap via CSS, retarget the test
**Notes:** Flagged proactively as a conflict between the user's wrap choice and
the locked LIST-09 / SC-5 wording. Captured in CONTEXT.md as D-12/D-13 — the
planner and verifier must treat the truncation-branch requirement as amended.

---

## Claude's Discretion

- Exact membership of the curated language abbreviation map.
- How `getRepoStats()` is invoked across N projects (parallel vs. streaming).
- Expand-affordance markup and keyboard/a11y treatment (WCAG 2.1 AA, DETAIL-08).
- Whether the collapsed row shows a visible expand cue (chevron / `[+]`).
- Duration / relative-timestamp formatting helper decomposition.

## Deferred Ideas

- Per-project deep-linkable detail URLs (`/projects/[slug]`) — its own future phase.
- Test-coverage / CI-status / quality signals — deferred to v1.2 (per Phase 9 + seed).
