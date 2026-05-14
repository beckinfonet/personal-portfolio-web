# Experience View Redesign — Design Spec

**Date:** 2026-05-14
**Trigger:** `/experience` currently renders a single hex-hash row + dense summary paragraph per role — "too much to read." User wants a project-row-style layout with bullets and tech chips, plus the polish elements from the provided reference mockups (timeline rail, monogram, current-role badge, computed duration).
**Scope:** Paired FE + BE change (per CLAUDE.md brownfield discipline). Production parity requires a Mongo reseed after deploy.

---

## 1. Visual Design

Per-role card on a left-anchored timeline rail. Cards stack vertically, newest first.

```
│
●─────────────────────────────────────────────────────────────────╮
│  [L&]  Sr. Software Engineer   ● CURRENT       2023 — Present   │
│        @ Logistics & AI Co. · Remote · Full-time      2y 5mo    │
│                                                                  │
│        Leading AI-native product work — agentic booking,         │
│        identity verification, and MCP integration.               │
│                                                                  │
│        +  Designed and shipped the MCP integration layer …      │
│        +  Led a 4-engineer team building the agentic …          │
│        +  Cut identity-fraud onboarding incidents ~60% …        │
│        - - - - - - - - - - - - - - - - - - - - - - - - - - - - │
│        STACK  [TypeScript] [React] [Node.js] [LangChain] …      │
╰─────────────────────────────────────────────────────────────────╯
│
○────  Software Engineer → Senior              2020 — 2023
│  [PT]  @ Previous Tech Co. · Hybrid · Full-time         3y 2mo
│  …
```

**Elements:**
- **Timeline rail** — a vertical dashed/solid line on the far left of the view region. Each card has a marker on the rail aligned to its top edge: filled accent ring for the current role, hollow ring for past roles.
- **Card** — subtle border (`var(--border)`), 4px left-edge stripe (primary accent for current, secondary accent for past), `var(--bg-raised)` background.
- **Header row** — three columns: monogram square (32×32, accent-bordered, 11px bold initials derived from company name) · title block · period block (right-aligned).
- **Title block** — role (15px/700 `var(--text-hi)`) inline with optional `● CURRENT` pill (11px, accent text, accent-tinted bg, accent-dim border, 999px radius). Sub-line: `@ Company · Location · EmploymentType` in `var(--muted-hi)`, 12px. Location and EmploymentType are optional — render the `·` separator only when present.
- **Period block** — `2023 — Present` (12px `var(--muted-hi)`) above computed duration `2y 5mo` (11px `var(--muted)`).
- **Lead paragraph** — 13px `var(--text)`, max 68ch, the existing `summary` field reused as a 1-2 sentence intro.
- **Bullets** — `+` marker (accent for current role, `var(--muted-hi)` for past) followed by 13px bullet text. Hanging indent on wrap. 8px gap between bullets.
- **Separator** — dashed border-top (`1px dashed var(--border)`), 14px margin above STACK row.
- **STACK row** — `STACK` label (11px `var(--muted)`, letter-spacing 0.05em) + existing `<TechChip>` chips inline.

---

## 2. Data Shape Changes

`Experience` grows by four fields. `bullets` and `tech` are required at the TypeScript level (empty array allowed); `location` and `employmentType` are optional. The view treats `undefined` defensively (renders as if empty) so a stale backend response missing these fields does not crash render:

```ts
export interface Experience {
  company: string;
  role: string;
  period: string;              // unchanged — e.g. "2023 - present"
  summary: string;             // unchanged — repurposed as lead paragraph
  bullets: string[];           // NEW — diff-add-style achievement list; [] allowed
  tech: string[];              // NEW — chip row; [] allowed
  location?: string;           // NEW optional — e.g. "Remote", "Hybrid", "Onsite — NYC"
  employmentType?: string;     // NEW optional — e.g. "Full-time", "Contract"
}
```

**Backend changes (paired commit):**
- `portfolio-services/src/types/content.ts` — ExperienceDto mirrors the shape above.
- `portfolio-services/src/models/Experience.ts` — Mongoose schema gains `bullets: [String]`, `tech: [String]`, `location?: String`, `employmentType?: String`. `strict: 'throw'` is preserved.
- `portfolio-services/src/seed/experience.json` — entries gain new fields with real content.
- `portfolio-services/src/seed/placeholders.ts` — `placeholderExperience` fallback gains the new fields (empty arrays / undefined optionals).
- `portfolio-services/tests/app.test.ts` — `/api/experience` shape spec gains `bullets` array-of-string + `tech` array-of-string invariants.

**Frontend changes:**
- `lib/types.ts` — Experience interface extended (jsdoc on each new field).
- `lib/portfolio-data.ts` — `EXPERIENCE` constant entries get real bullets + tech (per project's content-stub pattern, byte-mirrored to backend seed).
- `lib/portfolio-data.test.ts` — assertions for new fields on each EXPERIENCE entry.

---

## 3. Derived Display Logic (Frontend Only)

Compute in the view, do not persist:

- **`current` flag** — true when `/\bpresent\b/i.test(period)`.
- **Monogram initials** — split `company` on whitespace, drop stopword tokens (`["the", "and", "&"]`, case-insensitive), take the first letter of each remaining token, join, uppercase, then trim to 2 chars. If the result is only 1 char (single-word company), use the first 2 chars of the company string instead. Unicode-safe via `Array.from`.
- **Duration label** — parse start/end years (and months if present like `Jan 2023`) from `period`; render `Ny Nmo` (e.g. `2y 5mo`). For "present", use today's date. Fall back to hiding the duration line if parsing fails. Implementation lives in a new `lib/experience-duration.ts` helper with unit tests.
- **Accent variant** — current role uses `var(--accent)`. Past roles use a secondary accent derived from `--accent-hue` with a fixed +40° hue rotation and reduced chroma. Implemented as new tokens `--accent-2`, `--accent-2-dim`, `--accent-2-bg` in `:root` and `[data-theme="light"]` blocks.

---

## 4. Theme Tokens (CSS)

Add to `:root` block in `app/globals.css`:

```css
--accent-2:     oklch(0.78 0.12 calc(var(--accent-hue) + 40));
--accent-2-dim: oklch(0.45 0.08 calc(var(--accent-hue) + 40));
--accent-2-bg:  oklch(0.78 0.12 calc(var(--accent-hue) + 40) / 0.08);
```

Same pattern under `[data-theme="light"]` with light-mode lightness. Tested across all 4 accent-hue presets to ensure adequate contrast (≥4.5:1 against bg, per Phase 5 contrast invariants).

---

## 5. Mobile Considerations (≤960px)

- Timeline rail collapses: vertical line hidden, marker dots stay anchored to card top-left corner.
- Card padding reduces from 20px to 14px.
- Header row wraps: period block drops below title block.
- Monogram stays (anchors the card visually).
- Tech chips wrap naturally (already supported by existing `.tech-chip` styles).

Below 375px (project's minimum supported viewport): same as above; no further collapse needed.

---

## 6. Accessibility

- Cards are NOT links (unlike `/projects` rows) — a role is not a clickable destination. Keep cards as plain `<li>` elements with `<article>` semantics inside.
- Each card gets `aria-label="Experience at {company} as {role}, {period}"` on its inner `<article>`.
- `● CURRENT` badge uses `aria-label="Current role"` on the dot, plain text `CURRENT` is the visible label.
- `+` markers are decorative — wrap in `aria-hidden="true"` `<span>` so screen readers read only the bullet text.
- Existing skip-link + `<main id="main-content">` discipline unchanged.

---

## 7. Files Touched (Summary)

**Frontend (this repo):**
- `lib/types.ts` — Experience interface
- `lib/portfolio-data.ts` — EXPERIENCE entries with new fields
- `lib/portfolio-data.test.ts` — new-field assertions
- `lib/experience-duration.ts` — NEW helper
- `lib/experience-duration.test.ts` — NEW unit tests
- `app/components/views/experience-view.tsx` — full rewrite
- `app/(terminal)/experience/page.test.tsx` — update assertions
- `app/globals.css` — replace `.experience-*` block (lines ~1050-1098), add `--accent-2*` tokens

**Backend (`../portfolio-services/`):**
- `src/types/content.ts` — ExperienceDto
- `src/models/Experience.ts` — Mongoose schema
- `src/seed/experience.json` — content
- `src/seed/placeholders.ts` — placeholderExperience
- `tests/app.test.ts` — `/api/experience` shape spec

---

## 8. Out of Scope

- No new prod dependencies (date math is trivial; no date-fns needed).
- No changes to other views (`/projects`, `/about`, `/stack`, `/writing`, `/shipped`, `/contact`).
- No backend route changes — only the response shape grows. Old clients reading just `summary` continue to work.
- No design-system overhaul — only `--accent-2*` tokens added.
- The Mongo reseed itself is operational, not part of this code change. Spec acknowledges it as a deploy dependency (see §9).

---

## 9. Risks & Operational Notes

- **Mongo reseed required for production** — same pattern as the pending LinkedIn fix. After the paired commit ships, `npm run seed` against prod Mongo writes the new fields. Until then, prod backend returns entries without `bullets`/`tech` — frontend renders gracefully (empty arrays render zero bullets + no STACK row). No prod regression risk.
- **Vercel ISR cache** — pages will refresh within the 5-min revalidate window after reseed.
- **Cross-repo coordination** — paired commit message references the sibling SHA in both directions per project convention.
- **INFRA-05 placeholder grep** — new bullet/tech content must avoid forbidden strings (`example.com`, `TODO:`, etc.). Existing prebuild gate catches violations.

---

## 10. Acceptance Criteria

- [ ] `npm run build` passes locally with new fields populated.
- [ ] All 161 existing tests still pass; new tests added for duration parser + new-field assertions.
- [ ] `/experience` route renders 3 cards in the new layout in both dark and light themes.
- [ ] Current role shows green accent + filled marker + CURRENT badge; past roles show secondary accent + outline marker, no badge.
- [ ] Duration computed correctly for "2023 - present" (renders `2y Xmo`) and for fixed periods like "2019 - 2022" (renders `3y` or similar).
- [ ] At ≤960px, timeline line hides but markers remain; cards reflow without horizontal overflow at 375px.
- [ ] `/api/experience` JSON includes `bullets` and `tech` arrays after backend deploy + reseed.
- [ ] Knip clean, lint clean, typecheck clean.
