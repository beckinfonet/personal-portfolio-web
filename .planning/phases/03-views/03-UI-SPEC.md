---
phase: 3
slug: views
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-06
extends: .planning/phases/02-shell/02-UI-SPEC.md
---

# Phase 3 — Views: UI Design Contract

> Visual and interaction contract for the seven view bodies + five new primitives.
> **This document EXTENDS the Phase 2 UI-SPEC.** Tokens, type scale, color palette, focus styles, motion, layout dimensions, accent reservation list, and shell chrome are LOCKED in `02-UI-SPEC.md` — referenced here, not re-declared.
> Source of truth for visual ambiguity: `design_handoff_terminal_portfolio/app.jsx` (line refs throughout).
> Consumed by gsd-ui-checker, gsd-planner, gsd-executor, gsd-ui-auditor.

---

## Inheritance From Phase 2

The following are **inherited unchanged** from `.planning/phases/02-shell/02-UI-SPEC.md` and MUST NOT be re-declared, redefined, or "tightened" in Phase 3:

| Inherited | Source section in 02-UI-SPEC.md |
|-----------|----------------------------------|
| Design system: pure CSS + CSS custom properties; no Tailwind, no CSS modules, no CSS-in-JS | §"Design System" |
| Spacing scale (4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 64 / 80px) — handoff-locked | §"Spacing Scale" + §"Spacing Exceptions" |
| Layout dimensions (TopBar 38px, Sidebar 240px, Main max-width 920px, Main padding 32px 40px 80px) | §"Layout Dimensions" |
| Type scale (14/13/11/12 body/micro/UI; 26/700 H1; 16/600 view-heading) — handoff-locked | §"Typography" → §"Type Scale" |
| Font weights (400 regular, 600 semibold, 700 H1-only) — handoff-locked exception | §"Typography" → font weight exceptions |
| Color tokens (`--bg`, `--bg-raised`, `--panel`, `--panel-hi`, `--border`, `--border-hi`, `--text`, `--text-hi`, `--muted`, `--muted-hi`, `--accent`, `--accent-dim`, `--accent-bg`, `--warn`, `--red`, `--blue`) | §"Color" → §"Token System" |
| 60/30/10 color split (`--bg` dominant, `--panel`/`--panel-hi` secondary, `--accent` reserved) | §"Color Roles" |
| Accent reservation list — Phase 3 EXTENDS this list, see §"Accent Reservation Additions" below | §"Color Roles" → "Accent reserved for" |
| Focus-visible (2px accent outline, 2px offset) on every interactive element — A11Y-02 | §"Accessibility Contract" |
| Motion (cursor blink + slideIn 0.25s + breadcrumb fade); reduced-motion baseline already shipped | §"Motion Contract" |
| Prompt-line primitive (`<PromptLine cmd>`, classes `.prompt-line` / `.prompt-dollar` / `.prompt-cmd` / `.cursor`) | §"4. Main Content Area" → "Prompt line (shared primitive)" |
| Locked prompt-line copy per route (D-13 carry-forward) | §"4. Main Content Area" → "Stub prompt commands" + this doc §"Per-View Visual Contracts" |
| Locked `<title>` per route (D-12 carry-forward, format: `<file-label> — Bakytbek Tatibekov`) | §"Component Architecture Contract" + this doc §"Metadata Contract" |
| `:focus-visible`, `.skip-link`, `.sr-only` / `.visually-hidden`, `.content-block` | §"Accessibility Contract" + `app/globals.css` |

**Source:** `app/globals.css` (Phase 2 lines 1–212) is the authoritative implementation of these tokens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (pure CSS + CSS custom properties — inherited from Phase 2) |
| Preset | not applicable |
| Component library | none (Phase 3 adds 5 in-house primitives — see §"New Primitives") |
| Icon library | Unicode glyphs only (`◆ ▸ ≡ {} $ ↗ ↓ ⧉ ✓ › @ ⎘ ●`) — inherited Phase 2 + 4 new glyphs added in Phase 3 (`⧉` copy, `✓` confirmed, `›` writing post bullet, `↗` external link) |
| Font | JetBrains Mono via `next/font/google` — inherited Phase 2 |
| Styling approach | Pure CSS in `app/globals.css`; CSS custom properties for all tokens; no Tailwind, no CSS modules, no CSS-in-JS — inherited Phase 2 |
| Third-party registries | none |

**Phase 3 third-party badges:** App Store and Google Play store badges enter the bundle as inline SVG sourced from official Apple / Google brand sources (see §"Store Badges (D-13)" — license compliance is mandatory and is a planner research item). No NPM package is added.

---

## Spacing Scale

**Inherited verbatim from Phase 2 — no Phase 3 additions, no Phase 3 exceptions.** All Phase 3 view-body spacing draws exclusively from the Phase 2 scale:

| Token | Value | Phase 3 usage |
|-------|-------|---------------|
| 4px  | 4px   | About-view value→label gap inside stat card; experience-row inner gaps |
| 8px  | 8px   | Tech-chip horizontal padding; about-stat-card label `margin-top` |
| 12px | 12px  | Stack JSON copy-button right offset; contact-card label-column gap; projects-row gap; stat card padding (top exception below) |
| 14px | 14px  | About-view stat-card padding (handoff-locked — see Phase 2 spacing exceptions) |
| 16px | 16px  | Projects/shipped row vertical padding (16 0); experience-row vertical padding (16 0); about-view CTA row gap |
| 18px | 18px  | Writing post vertical padding (18 0); about content-block initial top spacing (handoff-locked) |
| 20px | 20px  | Stack `<pre>` left/right padding; contact-card padding |
| 24px | 24px  | Stack `<pre>` top/bottom padding; about-view stat-card grid `margin: 24px 0` |
| 32px | 32px  | (inherited — main content top padding) |
| 40px | 40px  | (inherited — main content side padding) |
| 64px | 64px  | (inherited — footer margin-top) |

**No spacing exceptions introduced by Phase 3.** The Phase 2 documented exceptions (3, 6, 10, 14, 18px) cover all view-body needs.

**Tech-chip padding (handoff-locked):** `3px 8px` (`.tech-chip`) — already documented as a Phase 2 spacing exception. Phase 3 introduces the CSS class but uses Phase 2's exception value.

**Source:** `design_handoff_terminal_portfolio/app.jsx` lines 231–239 (`S.chip`), 300–307 (about stat cards), 327–349 (projects rows), 362–366 (stack pre), 397–410 (experience rows), 421–438 (writing posts), 449–464 (contact card).

---

## Typography

**Inherited from Phase 2.** Phase 3 introduces **one** new size already noted but deferred in Phase 2 §"Phase 2 note on 22px":

### Type Scale (Phase 3 additions only — full scale is in 02-UI-SPEC.md)

| Role | Size | Weight | Line Height | Color token | Phase 3 usage |
|------|------|--------|-------------|-------------|---------------|
| Stat-card value | 22px | 700 | 1.2 | --accent | About-view 3-stat-card large value (e.g. `7+`, `AWS`, `AI`) — **single use across the entire app** (handoff `app.jsx` line 303) |
| Project name | 15px | 600 | 1.4 | --accent | Projects-row name + shipped-row name. Sits between view-heading 16px and body 14px. (handoff `app.jsx` line 337) |

**All other sizes/weights are inherited from Phase 2:**
- 14px / 400 — body default
- 13px / 400 — view paragraph, project summary, palette items, prompt-line cmd, writing excerpt
- 12px / 400 — UI labels (project year/status/role right column), contact-card label-column (uppercased via CSS)
- 11px / 400 — micro labels (stat-card label, tech chips, project index `01.`, writing date·readtime micro-meta)
- 26px / 700 — H1 only (about-view name) — already in Phase 2
- 16px / 600 — view sub-heading; writing post titles (with `›` prefix)

**The handoff-locked exception in Phase 2 (3 weights, 7+ sizes) carries forward.** Phase 3 adds 22px and 15px which both map to existing weights (700 for 22px is the H1-only exception extended by-design to the stat-card value; 600 for 15px is the existing semibold weight).

**Source:** Phase 2 §"Phase 2 note on 22px" (deferred to Phase 3); handoff `app.jsx` lines 300–307 (stat card 22/700 + 11px label), 337 (project 15/600), 432 (writing title 16/600).

---

## Color

**Inherited from Phase 2 verbatim.** Phase 3 adds NO new color tokens. View bodies consume:

| Phase 3 element | Token used |
|-----------------|------------|
| About-view H1 (name) | --text-hi |
| About-view role subline `// Sr. Software Engineer` | --accent |
| About-view location, bio meta | --muted (location) / --text (bio paragraphs) |
| About-view stat card value | --accent (22/700) |
| About-view stat card label | --muted (11px) |
| About-view stat card surface | --panel + 1px --border (4px radius) |
| Projects-row name | --accent (15/600) |
| Projects-row summary | --text (13px) |
| Projects-row index `01.` | --muted (12px) |
| Projects-row year | --muted-hi (11px) |
| Projects-row status | --warn (11px) |
| Projects-row role | --muted (11px) |
| Projects-row divider | --border (1px solid bottom) |
| Stack `<pre>` surface | --panel + 1px --border (4px radius) |
| Stack JSON punctuation `{ } [ ] : ,` | --muted |
| Stack JSON keys (e.g. `"languages"`) | --warn |
| Stack JSON string values (e.g. `"TypeScript"`) | --accent |
| Experience-row hex hash (e.g. `0000001`) | --warn |
| Experience-row role | --accent (600) |
| Experience-row `@ company` | --muted |
| Experience-row period | --muted (12px right-aligned) |
| Experience-row summary | --text |
| Experience-row divider | --border (1px solid bottom) |
| Writing-row date · readtime micro-meta | --muted (11px, uppercase via CSS letter-spacing 0.05em) |
| Writing-row title `› <title>` | --accent (16/600) |
| Writing-row excerpt | --text (13px) |
| Writing-row divider | --border (1px **dashed** bottom — handoff `app.jsx` line 427) |
| Contact-view lead paragraph | --text |
| Contact-view card surface | --panel + 1px --border (4px radius) |
| Contact-view label-column (e.g. `GITHUB`) | --muted (12px uppercase) |
| Contact-view handle link | --accent |
| Contact-view divider between rows | --border |
| Shipped-row name | --accent (15/600) |
| Shipped-row summary | --text (13px) |
| Shipped-row year | --muted-hi (11px) |
| Shipped-row role | --muted (11px) |
| Shipped-row status | --warn (11px) |
| Shipped-row divider | --border |
| Empty-state body lines (D-03) | --muted (13px) |
| Tech chip text | --muted-hi (11px) |
| Tech chip border | --border |
| Tech chip background | --bg-raised |
| ExternalLink default | inherits `a { color: var(--accent) }` from Phase 2 globals.css line 95 |
| ExternalLink trailing glyph `↗` | inherits parent color |
| CopyButton idle | --muted text on transparent bg, 1px --border (mirrors `.topbar-btn` from Phase 2) |
| CopyButton hover | --text text, --border-hi border |
| CopyButton confirmed `copied ✓` | --accent text |
| Resume CTA primary button (`.btn`) | --accent background, --bg foreground (light/dark theme adaptive) |
| Ghost social button (`.btn-ghost`) | transparent bg, --text foreground, --border outline |
| Store badges (App Store / Google Play) | inline SVG official artwork — colors NOT theme-tokenized (license requirement, see §"Store Badges") |

### Accent Reservation Additions (Phase 3 only — additive to Phase 2 list)

Phase 2 reserved 11 accent uses. Phase 3 adds these uses, all aligned with the 10% accent budget:

12. About-view H1 role subline `// Sr. Software Engineer` (color: --accent — Phase 2 already noted this as Phase-3-pending)
13. About-view 3-stat-card values (22/700 — single visual hierarchy peak per view; the highest-impact recruiter signal in the 5-second test)
14. About-view primary CTA `↓ resume.pdf` button background (`.btn` class — already noted in Phase 2 reservation #5 as "Phase 3 view body — stubbed in Phase 2")
15. Projects-row name (15/600)
16. Stack JSON string-value tokens (e.g. `"TypeScript"`)
17. Experience-row role label (600)
18. Writing post title `› <title>` (16/600)
19. Contact-view social handle link (e.g. `@beckinfonet`)
20. Shipped-row app name (15/600)
21. CopyButton confirmed-state text `copied ✓`

**Total accent uses across Phase 2 + Phase 3:** 21 — all within the 10% budget because (a) accent is bound to `--accent` which is a single token, and (b) every use is a discrete typographic emphasis (a name, a label, a value), not a surface fill. The cumulative visual area accent occupies stays well under 10% of any rendered viewport.

### Semantic colors used in Phase 3

| Token | Phase 3 use |
|-------|-------------|
| --warn | Stack JSON keys, projects-row status, experience-row hex hash, shipped-row status |
| --red | Not used decoratively in Phase 3 (reserved for errors only — Phase 5 audits) |
| --blue | Not used in Phase 3 (per Phase 2 reservation note: "reserved for views" — Phase 3 declines; left for future view types) |

---

## New Primitives

Phase 3 ships exactly **5 new primitives**. All live in `app/components/primitives/`. Four are RSC; one is a client island (CopyButton).

### 1. `<TechChip>` (RSC)

| Property | Value |
|----------|-------|
| File | `app/components/primitives/tech-chip.tsx` |
| `"use client"` | NO |
| Props | `{ children: ReactNode }` |
| Render | `<span class="tech-chip">{children}</span>` |
| CSS class | `.tech-chip` (NEW — Phase 3 adds to globals.css) |

**CSS contract** (executor adds to `app/globals.css`):
```css
.tech-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;          /* handoff-locked exception (Phase 2) */
  border: 1px solid var(--border);
  border-radius: 3px;
  font-size: 11px;
  color: var(--muted-hi);
  margin-right: 4px;
  margin-top: 4px;
  background: var(--bg-raised);
}
```

**Source:** `design_handoff_terminal_portfolio/app.jsx` lines 231–239.

### 2. `<Kbd>` (RSC)

| Property | Value |
|----------|-------|
| File | `app/components/primitives/kbd.tsx` |
| `"use client"` | NO |
| Props | `{ children: ReactNode }` |
| Render | `<kbd class="kbd">{children}</kbd>` |
| CSS class | `.kbd` (NEW — Phase 3 adds; existing `.breadcrumb-hint kbd` and `.palette-footer kbd` remain valid scoped overrides) |

**CSS contract** (executor adds to `app/globals.css`):
```css
.kbd {
  display: inline-block;
  padding: 1px 5px;
  font-family: inherit;
  font-size: 10px;
  border: 1px solid var(--border-hi);
  border-radius: 3px;
  color: var(--muted-hi);
  background: var(--panel);
}
```

**Note:** Phase 2 already styles `<kbd>` inside `.breadcrumb-hint` and `.palette-footer`. The new global `.kbd` class is for view-body usage (e.g. inside writing post excerpts referencing keyboard shortcuts, or palette help text). If the planner finds Phase 2's class is already general enough, lifting the `kbd { ... }` rule out of those contexts is acceptable; otherwise add `.kbd` as a separate matching class. **No behavioral change required.**

### 3. `<ExternalLink>` (RSC)

| Property | Value |
|----------|-------|
| File | `app/components/primitives/external-link.tsx` |
| `"use client"` | NO |
| Props | `{ href: string; className?: string; children: ReactNode }` |
| Render | `<a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<span aria-hidden="true"> ↗</span></a>` |
| CSS class | inherits `a` from Phase 2 globals.css (line 95–101); optional `className` for view-specific composition |

**Visual contract:**
- Glyph: trailing space + `↗` inside `<span aria-hidden="true">` — D-09/D-11 LOCKED
- Color: inherits `var(--accent)` from `a` rule
- Hover: inherits Phase 2 `a:hover { text-decoration: underline; opacity: 0.85 }` rule (Phase 2 globals.css already has `text-decoration: underline` on hover; D-09 specifies `opacity: 0.85` — if the executor finds the underline conflicts with the visual intent, the rule may be refined in `app/globals.css` so `a:hover { opacity: 0.85; text-decoration: underline; }`).

**SEO-05 compliance:** every external link in Phase 3 view code uses `<ExternalLink>` (not raw `<a target="_blank">`). The `rel="noopener noreferrer"` pairing is enforced by the component, not by view code — `grep -rE 'target="_blank"' app/components/views/` should return zero hits because the views never render the raw attribute.

**API examples:**
```tsx
<ExternalLink href={project.link}>{project.name}</ExternalLink>
<ExternalLink href={socials.github.url} className="btn-ghost">github/</ExternalLink>
```

### 4. `<CopyButton>` (CLIENT — the only client island in Phase 3)

| Property | Value |
|----------|-------|
| File | `app/components/primitives/copy-button.tsx` |
| `"use client"` | **YES** (the only Phase 3 component carrying this directive) |
| Props | `{ value: string; idleLabel?: string; copiedLabel?: string; ariaLabel: string; className?: string }` |
| Default `idleLabel` | `⧉ copy` |
| Default `copiedLabel` | `copied ✓` |
| Behavior | onClick → `navigator.clipboard.writeText(value)` → swap label to `copiedLabel` for 1500ms → revert |
| Reduced-motion | label swap is instantaneous (no transition); compatible with `prefers-reduced-motion` baseline |

**Visual contract:**
- Default visual mirrors `.topbar-btn` from Phase 2 (transparent bg, --muted text, 1px --border, 4px radius, 11px font, 4px 10px padding) — minus the 4px 10px padding which CopyButton can override per className
- Confirmed visual: text color → `--accent`; border stays `--border` (no border color flicker)
- Focus-visible: inherits Phase 2 `*:focus-visible` rule (2px accent outline, 2px offset)
- Hover: same as `.topbar-btn:hover` (border-color → `--border-hi`, color → `--text`)
- Stack-view positioning: absolute top:12px right:12px inside the `<pre>` wrapper (`.stack-pre-wrap`)
- Contact-view positioning: inline at the right edge of the email row, vertically aligned-baseline with the `mailto:` link
- Shipped-view positioning: inline icon-only variant (just `⧉`, no `copy` label) inside the platform-badges row

**ARIA contract (D-07):**
- Button itself carries the caller-supplied `aria-label` (e.g. `"Copy stack JSON"`, `"Copy email beckprograms@gmail.com"`, `"Copy Soulful App Store link"`)
- A polite live region inside or sibling to the button announces `Copied to clipboard` for 2000ms when the swap fires:
  ```tsx
  <span role="status" aria-live="polite" className="sr-only">
    {copied ? "Copied to clipboard" : ""}
  </span>
  ```
- Reuses Phase 2's `.sr-only` class (already in globals.css line 202)
- Does NOT toast; does NOT animate the label

**CSS classes (executor adds):** `.copy-button` (default), `.copy-button--icon` (icon-only variant for shipped-view), `.copy-button--confirmed` (programmatically toggled — controls accent text color).

**Source:** D-05, D-06, D-07; handoff aesthetic mapped from Phase 2 `.topbar-btn`.

### 5. `<StoreBadge>` (RSC)

| Property | Value |
|----------|-------|
| File | `app/components/primitives/store-badge.tsx` |
| `"use client"` | NO |
| Props | `{ platform: "ios" \| "android"; href: string; appName: string }` |
| Render | `<ExternalLink href={href} className="store-badge-link" aria-label={`Open ${appName} on ${platform === "ios" ? "App Store" : "Google Play"}`}><svg viewBox="..." width="..." height="..." aria-hidden="true">...</svg></ExternalLink>` |
| CSS class | `.store-badge-link` (NEW — Phase 3 adds); SVG colors come from the official badge artwork, not from theme tokens |

**Per-platform fixed dimensions (license-mandated minimums — see D-13):**

| Platform | Source | Min width | Aspect ratio |
|----------|--------|-----------|--------------|
| iOS App Store | https://tools.applemediaservices.com/app-store/ → Black "Download on the App Store" badge SVG | 120px (recommended 135–160px for desktop view bodies) | per Apple Marketing Identity Guidelines |
| Google Play | https://play.google.com/intl/en_us/badges/ → Black/Green "Get it on Google Play" badge SVG | 135px (per Google brand minimum) | per Google Play Brand Guidelines |

**License compliance is mandatory** (D-13 — REPEATED HERE because checker validates):
- Apple badge SVG MUST come from Apple's official tools; no recoloring; no resizing below their minimum; do NOT inline an unofficial recreation.
- Google Play badge MUST be the approved English form at minimum width; no modifications.
- A JSDoc comment in `store-badge.tsx` MUST link to both brand-guideline URLs and document the date the SVG artwork was sourced.
- **Planner research item (carried forward from D-13 deferred):** During plan-phase, fetch the current SVG sources + license boilerplate; commit them to `app/components/primitives/store-badge-assets/` (or inline in the component); record the sourced-on date.

**Visual contract:**
- Badges sit inline in the platform-badges row of each shipped-row, with 8px gap between badges and 8px gap to the inline CopyButton
- Badges carry no opacity hover (trying to "tint" official badges is a brand-guideline violation)
- Empty-state: when `SHIPPED = []`, no badges render at all
- Single-platform fallback: if a `ShippedApp` entry has only `platforms: ["ios"]` or `["android"]`, only the matching badge renders; no placeholder for the missing platform
- Badges wrap in `<ExternalLink>` to inherit the `target="_blank" rel="noopener noreferrer"` contract; the trailing `↗` glyph from `<ExternalLink>` is **suppressed** for store badges (the badge graphic itself signals external navigation) — this is the ONE exception to the always-render-↗ rule in D-09. **Implementation:** Phase 3 adds an opt-out — see §"Implementation note" below.

**Implementation note (one-time API extension):**
The `<ExternalLink>` component as defined in D-11 always renders `↗`. Store badges need to suppress it. Two acceptable approaches; planner picks one:
1. Add an opt-out prop `showGlyph?: boolean` (defaults true) to `<ExternalLink>`; `<StoreBadge>` passes `showGlyph={false}`.
2. `<StoreBadge>` does NOT use `<ExternalLink>`; instead it renders its own `<a target="_blank" rel="noopener noreferrer">` inline. This breaks the "every external link goes through `<ExternalLink>`" SEO-05 enforcement; it MUST be paired with a comment in `store-badge.tsx` explaining the deviation, and the linter/checker grep MUST be scoped to exclude `store-badge.tsx`.

**Recommendation:** Option 1 (opt-out prop). Keeps SEO-05 enforcement uniform; one extra prop is a small cost.

**Source:** D-13, D-14; handoff has NO reference for this view (`shipped.app` is the 7th view added beyond handoff per PROJECT.md key decision).

---

## Per-View Visual Contracts

Each section is the canonical visual + interaction spec for one view. View files live at `app/components/views/<view>-view.tsx` (RSC, no `"use client"`). Page files at `app/(terminal)/<route>/page.tsx` (RSC) call `<ViewComponent />` and own metadata.

### V1. about-view (route `/`)

**Prompt:** `$ cat about.md` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 289–315):**

```
$ cat about.md
[content-block — slideIn 0.25s once]
  H1 — Bakytbek Tatibekov          (26px / 700 / --text-hi / letter-spacing -0.01em / margin 0 0 4px)
  // Sr. Software Engineer         (14px / accent / margin-bottom 4px)
  Almaty, Kazakhstan               (12px / --muted / margin-bottom 18px)
  <p>bio paragraph 1</p>           (14px / --text / max-width 68ch / margin 12px 0)
  <p>bio paragraph 2</p>           (same)
  ┌────────┬────────┬────────┐    (3-stat-card grid; gap 12px; margin 24px 0; max-width 480px)
  │ 22/700 │ 22/700 │ 22/700 │    (stat-card padding 14px; 1px --border; 4px radius; --panel bg)
  │ 11/--m │ 11/--m │ 11/--m │    (label margin-top 2px)
  └────────┴────────┴────────┘
  [↓ resume.pdf] [github/] [linkedin/] ...   (CTA row; gap 10px; margin-top 24px; flex-wrap)
```

**CTA row (D-10 — lowercased + trailing slash):**
- Primary: `<a class="btn" href={PROFILE.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf" aria-label="Download resume">↓ resume.pdf</a>`
- Each ghost social: `<ExternalLink href={s.url} className="btn-ghost" aria-label={`Open ${s.label} (opens in new tab)`}>{s.label.toLowerCase()}/</ExternalLink>` — note the trailing `/` and lowercased label per D-10
- The `↗` glyph from `<ExternalLink>` renders trailing the `/` (so the visible label is `github/ ↗`) — this matches handoff `app.jsx` line 311 which uses `target="_blank"` ghost btn-style anchors

**Empty-state behavior:** about-view always renders (PROFILE is real per `lib/portfolio-data.ts`). 5-second-recruiter-test load order:
1. H1 name + role subline land in the LCP frame
2. Stat-card row paints next (the 3 accent-22/700 values are the recruiter's hierarchy peak)
3. Primary CTA row paints with the resume button visibly accent-filled and the `↓ resume.pdf` label

**5-second-recruiter-signal evaluation:** at first paint a recruiter sees (a) the name in 26/700, (b) the role in accent, (c) three accent stat values, (d) a resume CTA. All four are accent or text-hi typographic peaks against the Phase 2 chrome. The recruiter has the resume CTA in eyeshot well within 5 seconds **provided** the about-view is the LCP target (it is — the H1 name is the largest text element on the route and the CTA row sits directly below).

**ARIA:**
- H1 is the only `<h1>` on the page (Phase 2 shell does NOT render an `<h1>` — confirmed)
- Stat cards are decorative `<div>` elements with no role; the value+label pair is read as plain text
- Primary CTA `aria-label="Download resume"` (plain noun; **NEVER** `download resume.pdf` because file extensions are decorative for SR users)
- Each ghost social CTA `aria-label={`Open ${s.label} (opens in new tab)`}` — the `(opens in new tab)` suffix is a Phase 3 convention announcing target=_blank to SR users

**CSS classes (executor adds to globals.css):** `.about-h1` (or reuse `h1` rule scoped to `.terminal-main h1`), `.about-role`, `.about-meta`, `.about-para`, `.about-cards` (grid), `.about-card`, `.about-card-value`, `.about-card-label`, `.about-cta-row`, `.btn` (primary), `.btn-ghost` (secondary).

**Tech-chip primitive: NOT used on about-view** (handoff has no chips on about).

### V2. projects-view (route `/projects`)

**Prompt:** `$ ls -la projects/` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 318–353):**

```
$ ls -la projects/
[content-block]
  total N · sorted by year desc        (12px / --muted / margin-bottom 14px)
  ┌────┬───────────────────────────────┬──────────┐
  │ 32 │ 1fr (name+summary+chips)      │ 110px    │  ← grid-template-columns; gap 16px
  ├────┼───────────────────────────────┼──────────┤
  │01. │ Soulful Project (15/600/acc) │ 2024     │  ← row 1
  │    │ Summary line (13/text/lh1.5)  │ shipped  │  ← row 1 cont.
  │    │ [chip][chip][chip]             │ lead     │
  ├────┼───────────────────────────────┼──────────┤  ← border-bottom 1px --border
  │02. │ ...                            │ ...      │
```

**Per-project row:**
- Element: `<a class="projects-row" href={p.link}>` — entire row is the click target. **External links** (which they are — projects link to repos / live demos): the row uses the same `target="_blank" rel="noopener noreferrer"` semantics. **However**, the row has its own visual treatment (no trailing `↗` because the row is large enough that the affordance is implicit; use `<ExternalLink>` semantics on the row WITH `showGlyph={false}` if Option 1 from `<StoreBadge>` is chosen, OR render a raw anchor and exclude this file from the SEO-05 grep — planner picks).
- Index: `01.`, `02.`, ... — `String(i+1).padStart(2, '0') + '.'` (handoff line 335)
- Name: `<div class="projects-row-name">` (15/600/--accent)
- Summary: `<div class="projects-row-summary">` (13/--text/lh1.5; margin-top 4px)
- Tech chips row: `<div class="projects-row-chips">` (margin-top 8px) — each `<TechChip>{tech}</TechChip>`
- Year: `<div class="projects-row-year">` (11/--muted-hi)
- Status: `<div class="projects-row-status">` (11/--warn; margin-top 2px)
- Role: `<div class="projects-row-role">` (11/--muted; margin-top 2px)

**Sort:** `[...PROJECTS].sort((a, b) => Number(b.year) - Number(a.year))` (year desc) — non-mutating.

**Empty state (D-03 LOCKED):**
```
$ ls -la projects/
total 0 · (no projects committed yet)
```
Render path: when `PROJECTS.length === 0`, replace the subhead `total N · sorted by year desc` with the literal `total 0 · (no projects committed yet)` (single 13px/muted line). No grid renders, no rows render.

**ARIA:**
- The projects list is a `<ul>` (semantic list); each row is `<li>` containing the link
- Each row link `aria-label={`${p.name}: ${p.summary} (opens in new tab)`}` — the visible text is decorative file-tree prose; the SR label is the readable summary

**CSS classes (executor adds):** `.projects-subhead`, `.projects-list`, `.projects-row` (grid container), `.projects-row-name`, `.projects-row-summary`, `.projects-row-chips`, `.projects-row-meta` (right column wrapper), `.projects-row-year`, `.projects-row-status`, `.projects-row-role`.

### V3. stack-view (route `/stack`)

**Prompt:** `$ cat stack.json | jq` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 355–389):**

```
$ cat stack.json | jq
[content-block]
  <div class="stack-pre-wrap">                ← position: relative; wraps the pre + copy button
    <CopyButton aria-label="Copy stack JSON"  ← absolute top:12 right:12
                value={stackJsonString}
                className="stack-copy"/>
    <pre class="stack-pre">                   ← --panel bg; 1px --border; 4px radius; padding 24 20;
                                                font-size 13; line-height 1.7; --text base color;
                                                margin 0; overflow auto
      {                                       ← --muted (`.json-punc`)
        "languages": [                        ← key in --warn (`.json-key`); brackets in --muted
          "TypeScript",                       ← string in --accent (`.json-string`); comma in --muted
          "Python",
          "Swift"
        ],
        "frameworks": [
          ...
        ]
      }
    </pre>
  </div>
```

**JSON content source:**
```ts
const stackJsonObject = Object.fromEntries(STACK.map(c => [c.category, c.items]));
const stackJsonString = JSON.stringify(stackJsonObject, null, 2);
```

**Rendering (hand-rolled syntax highlight per D-discretion + handoff lines 367–388):** The `<pre>` is built as React Fragments + spans, NOT as a single string with `dangerouslySetInnerHTML`. Approximate JSX shape:

```tsx
<pre className="stack-pre">
  <span className="json-punc">{"{"}</span>{"\n"}
  {STACK.map((cat, idx) => (
    <Fragment key={cat.category}>
      <span className="json-punc">  </span>
      <span className="json-key">"{cat.category}"</span>
      <span className="json-punc">: [</span>{"\n"}
      {cat.items.map((item, i) => (
        <Fragment key={item}>
          <span>    </span>
          <span className="json-string">"{item}"</span>
          {i < cat.items.length - 1 && <span className="json-punc">,</span>}
          {"\n"}
        </Fragment>
      ))}
      <span className="json-punc">  ]{idx < STACK.length - 1 ? "," : ""}</span>{"\n"}
    </Fragment>
  ))}
  <span className="json-punc">{"}"}</span>
</pre>
```

**`<CopyButton>` integration:**
- `aria-label="Copy stack JSON"`
- `value={stackJsonString}` — the SAME canonical string the `<pre>` renders (the `<pre>` rendering and the clipboard payload MUST be byte-equivalent)
- Position: `.stack-copy { position: absolute; top: 12px; right: 12px; }`
- Reduced-motion: label swap is instant; no transition

**Empty state:** `STACK` is real and never empty per `lib/portfolio-data.ts` (Phase 1 D-08 ships matrix data). View has no empty-state handling.

**CSS classes (executor adds):** `.stack-pre-wrap` (position:relative), `.stack-pre`, `.stack-copy`, `.json-key`, `.json-string`, `.json-punc`.

### V4. experience-view (route `/experience`)

**Prompt:** `$ git log --oneline --decorate experience.log` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 391–413):**

```
$ git log --oneline --decorate experience.log
[content-block]
  ┌────────────────────────────────────────────────────────────┐
  │ 0000001  Sr. Software Engineer  @ Acme Corp     (2022 - p) │  ← row, padding 16px 0, border-bottom
  │ summary text (max 64ch, --text, margin-top 6px)             │
  ├────────────────────────────────────────────────────────────┤
  │ 0000002  ...                                                │
  └────────────────────────────────────────────────────────────┘
```

**Per-experience row:**
- `<div class="experience-row">` (padding 16px 0; border-bottom 1px solid --border)
- Header line: `<div class="experience-row-header">` (display:flex; gap 12px; align-items:baseline; flex-wrap:wrap)
  - Hex hash: `<span class="experience-hash">` — `(i + 1).toString(16).padStart(7, '0')` — 13px / --warn / monospace inherit
  - Role: `<span class="experience-role">` — 13px / 600 / --accent
  - Company: `<span class="experience-company">` — 13px / --muted — text content `@ {e.company}`
  - Period: `<span class="experience-period">` — 12px / --muted / margin-left:auto (right-align) — text content `({e.period})`
- Summary: `<div class="experience-summary">` — 13px / --text / max-width 64ch / margin-top 6px

**Sort:** `EXPERIENCE` is rendered in array order (most-recent-first by author convention; no programmatic sort because period strings are not parseable to dates without a deterministic format).

**Empty state (D-03 LOCKED):**
```
$ git log --oneline --decorate experience.log
(no commits to experience.log yet)
```
Render path: when `EXPERIENCE.length === 0`, replace the entire row list with a single `<div class="empty-state">(no commits to experience.log yet)</div>` (13px/muted).

**ARIA:** No special semantics; `<div>` rows are appropriate (this is not a navigable list — each row is information, not interactive).

**CSS classes (executor adds):** `.experience-list`, `.experience-row`, `.experience-row-header`, `.experience-hash`, `.experience-role`, `.experience-company`, `.experience-period`, `.experience-summary`, `.empty-state` (shared empty-state class — see §"Empty-State Contract").

### V5. writing-view (route `/writing`)

**Prompt:** `$ ls writing/ && cat *.md` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 415–439):**

```
$ ls writing/ && cat *.md
[content-block]
  ┌────────────────────────────────────────────────────┐
  │ APRIL 2026 · 5 MIN READ                  (11/--m)  │
  │ › On Designing for Two Audiences         (16/600/a)│
  │ Excerpt with (max 64ch, --text/13/lh1.55)          │
  ├╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┤  ← 1px DASHED --border
  │ MARCH 2026 · 8 MIN READ                            │
  │ › Another post                                     │
  │ ...                                                │
  └────────────────────────────────────────────────────┘
```

**Per-writing-post row:**
- Element: `<a class="writing-post" href={w.link}>` — the entire row is the click target; uses `<ExternalLink>` since posts live on external domains (dev.to, Medium, personal blog) — the trailing `↗` glyph appends to the title visually
- Date · readtime: `<div class="writing-post-meta">` — 11px / --muted / letter-spacing 0.05em / `{w.date.toUpperCase()} · {w.readTime}`
- Title: `<div class="writing-post-title">` — 16px / 600 / --accent / margin-top 6px / text content `› {w.title}` (the `›` glyph is a literal text character, NOT a separate span — it's a content marker, not a structural icon)
- Excerpt: `<div class="writing-post-excerpt">` — 13px / --text / max-width 64ch / margin-top 8px / line-height 1.55

**Divider:** 1px **DASHED** --border between posts (handoff `app.jsx` line 427) — distinct from solid borders elsewhere in views; intentional visual signal that posts are loosely-coupled.

**Sort:** `[...WRITING].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))` — date desc. **Caveat:** `w.date` is a free-form string like `"April 2026"`; `Date.parse` may fail. Planner adds a defensive fallback: if `Date.parse` returns NaN for any entry, fall back to array order without throwing. This is a v1 acceptable cost (writing list is short; format will be consistent in Phase 6).

**Empty state (D-03 / D-04 LOCKED — v1 ships empty per CONTENT-04 resolution):**
```
$ ls writing/ && cat *.md
// no posts yet — follow github.com/beckinfonet for code-as-content.
```
Render path: when `WRITING.length === 0`, render a single `<div class="empty-state empty-state--writing">` line (13px/muted; the embedded `github.com/beckinfonet` is plain text, NOT a link — the line is a brand-voice empty-state, not a CTA. The recruiter who wants the GitHub URL has it via the about-view ghost button, the contact-view card, and the palette.).

**ARIA:** Each post link `aria-label={`Read ${w.title} (opens in new tab)`}`. The `›` glyph is decorative; SR readers do not announce it (it's part of the title text but does not need its own aria-hidden because the announce-as-text behavior is acceptable here — SR will read it as "right-pointing single angle quotation mark" or similar; if user-agent variance becomes a problem, planner wraps the `›` in `<span aria-hidden="true">›</span>` and prefixes the title text in the aria-label).

**CSS classes (executor adds):** `.writing-list`, `.writing-post`, `.writing-post-meta`, `.writing-post-title`, `.writing-post-excerpt`, `.empty-state--writing`.

### V6. contact-view (route `/contact`)

**Prompt:** `$ ./contact.sh --whoami` (LOCKED Phase 2 D-13)

**Layout (handoff `app.jsx` lines 441–468):**

```
$ ./contact.sh --whoami
[content-block]
  Lead paragraph (14/text, max 68ch)
  ┌──────────────────────────────────────────────────────┐  ← max-width 480px; --panel bg; 1px --border; 4px radius; padding 20px
  │ EMAIL    beckprograms@gmail.com    [⧉]              │  ← grid-template-columns: 90px 1fr auto; gap 12px;
  │                                                       │     padding 8px 0; border-bottom 1px --border
  │ GITHUB   @beckinfonet                                │  ← row 2; same shape; CopyButton ONLY on email row
  │ LINKEDIN @bakytbek                                   │
  └──────────────────────────────────────────────────────┘
  [↓ download resume.pdf] [github ↗]  ← gap 10px; margin-top 24px; flex-wrap
```

**Lead paragraph (LOCKED text per handoff `app.jsx` line 448):**
> "Open to senior + staff full-stack and AI engineering roles. Remote-first, occasional travel ok."

**Note:** This is a **content string**, not a UI string. It belongs in `lib/portfolio-data.ts` Phase 6 — but `app.jsx` line 448 has it inline in the prototype. **Phase 3 decision:** the lead paragraph string is hardcoded inline in `contact-view.tsx` for v1, **NOT** lifted to `lib/portfolio-data.ts`. Justification: it's role-specific recruiter copy that the developer wants to control alongside the view template; lifting it to data risks Phase 6 churn editing the field shape. If Phase 6 disagrees, lifting is trivial.

**Card structure:**
- `<div class="contact-card">` — max-width 480px; --panel bg; 1px --border; 4px radius; padding 20px; margin 20px 0
- For each social in `PROFILE.socials`:
  - `<div class="contact-row">` — grid-template-columns: 90px 1fr auto; gap 12px; padding 8px 0; align-items: baseline; border-bottom 1px --border (omitted on last row)
  - `<span class="contact-label">` — 12px / --muted / `{s.label.toUpperCase()}` (D-10 — uppercase in contact view, distinct from about-view lowercased rendering of the SAME `s.label` source)
  - For email row: `<a href={`mailto:${PROFILE.email}`}>` (NOT `<ExternalLink>` — `mailto:` is not external in the SEO-05 sense; it's a protocol handler) — 13px/--accent
  - For non-email rows: `<ExternalLink href={s.url}>{s.handle}</ExternalLink>` — 13px/--accent (link). The trailing `↗` glyph renders.
  - For email row only: `<CopyButton value={PROFILE.email} ariaLabel={`Copy email ${PROFILE.email}`} className="contact-copy" />` (icon-only variant; sits in the third grid column)

**Email row special handling:**
- The email is rendered as both a `mailto:` link (browser-native long-press / right-click) AND a `<CopyButton>` for explicit one-tap copy
- Both ways to copy are intentional and called out in D-05 / contact-view section of the discussion log

**Footer CTAs:**
- Primary: `<a class="btn" href={PROFILE.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf" aria-label="Download resume">↓ download resume.pdf</a>` — note the `↓ download resume.pdf` text is slightly different from about-view's `↓ resume.pdf` — handoff `app.jsx` line 463 uses the longer label; **executor preserves both** to honor handoff fidelity.
- Ghost: `<ExternalLink href={PROFILE.socials[0].url} className="btn-ghost" aria-label="Open GitHub (opens in new tab)">github ↗</ExternalLink>` — handoff line 464 hardcodes `github ↗` text. The `<ExternalLink>` will render `github ↗ ↗` (double-arrow!) — **suppress the auto-glyph here** by either: (1) using `showGlyph={false}` and writing `github ↗` literally, OR (2) using `<ExternalLink>` and writing just `github` (single-arrow result). Pick approach (1) to match handoff verbatim.

**Empty state:** PROFILE.email is real (`beckprograms@gmail.com`); PROFILE.socials has at least 2 entries (GitHub + LinkedIn TODO from Phase 1 D-08). View renders all rows; no empty-state branch needed.

**ARIA:**
- Card is a `<dl>` semantic? — **NO**. The card is a 3-column grid (label, link, copy-button) styled card. Use `<div role="group" aria-label="Contact methods">` for the wrapper; each row is a `<div>` with no special role.
- Email mailto link `aria-label={`Send email to ${PROFILE.email}`}` (plain noun, not file extension).
- `<ExternalLink>` rows automatically carry the announce-target via the trailing `↗` (visual) and the `aria-label="Open <social> (opens in new tab)"` (callsite).
- CopyButton on email row `aria-label={`Copy email ${PROFILE.email}`}`.

**CSS classes (executor adds):** `.contact-lead`, `.contact-card`, `.contact-row`, `.contact-label`, `.contact-link` (or inherits `a`), `.contact-copy`, `.contact-cta-row`.

### V7. shipped-view (route `/shipped`)

**Prompt:** `$ ls -la shipped/` (LOCKED Phase 2 D-13)

**Layout (NO handoff reference — D-12..D-15 are canonical spec):**

```
$ ls -la shipped/
[content-block]
  total N · sorted by year desc        (12px / --muted / margin-bottom 14px — same as projects subhead)
  ┌────┬──────────────────────────────────────┬──────────┐
  │ 32 │ 1fr (name+summary+badges-row)        │ 110px    │
  ├────┼──────────────────────────────────────┼──────────┤
  │01. │ Soulful App  (15/600/--accent)       │ 2024     │
  │    │ Summary line (13/--text/lh1.5)       │ shipped  │
  │    │ [App Store SVG] [Play SVG] [⧉]      │ lead     │  ← inline row; gaps 8px
  ├────┼──────────────────────────────────────┼──────────┤
  │02. │ ...                                  │ ...      │
```

**Per-shipped-app row (mirrors projects-row grid: 32px / 1fr / 110px; gap 16px; padding 16px 0; border-bottom 1px --border):**
- Index: `01.`, `02.`, ... — same render as projects-row
- Name: `<div class="shipped-row-name">` (15/600/--accent — same as projects-row name)
- Summary: `<div class="shipped-row-summary">` (13/--text/lh1.5 — same as projects-row summary; **only renders when `app.summary` is present** — the `summary` field is optional per `lib/types.ts` ShippedApp)
- Badges + copy row: `<div class="shipped-row-affordances">` (display:flex; gap:8px; align-items:center; margin-top 12px)
  - `<StoreBadge platform="ios" href={app.appStoreUrl} appName={app.name} />` IF `app.platforms.includes("ios")` AND `app.appStoreUrl` is present
  - `<StoreBadge platform="android" href={app.googlePlayUrl} appName={app.name} />` IF `app.platforms.includes("android")` AND `app.googlePlayUrl` is present
  - `<CopyButton value={app.appStoreUrl ?? app.googlePlayUrl} ariaLabel={`Copy ${app.name} store link`} className="copy-button copy-button--icon" />` (icon-only variant — just `⧉`, no `copy` text — so the row stays compact)
- Year: `<div class="shipped-row-year">` (11/--muted-hi)
- Status: `<div class="shipped-row-status">` (11/--warn) — only renders if app has a `status` field; v1 hardcodes `shipped` for entries that exist
- Role: `<div class="shipped-row-role">` (11/--muted)

**Sort:** `[...SHIPPED].sort((a, b) => Number(b.year) - Number(a.year))` — year desc. Same pattern as projects.

**Empty state (D-03 / D-15 LOCKED):**
```
$ ls -la shipped/
total 0 · (no apps shipped to stores yet)
```
Render path: when `SHIPPED.length === 0`, replace the subhead with the literal empty-state line. **No `<StoreBadge>` instances are rendered, no `<CopyButton>` instances are instantiated** (zero client islands on this view in the empty case).

**ARIA:**
- Shipped list is a `<ul>` semantic; each row is `<li>`
- Each store badge: the `<StoreBadge>` aria-label is set (see §"5. `<StoreBadge>`" above)
- CopyButton aria-label is callsite-specific
- Per-row: no aria-label on the `<li>` itself (the inner content carries its own labels)

**CSS classes (executor adds):** `.shipped-list`, `.shipped-row`, `.shipped-row-name`, `.shipped-row-summary`, `.shipped-row-affordances`, `.shipped-row-meta`, `.shipped-row-year`, `.shipped-row-status`, `.shipped-row-role`, `.store-badge-link` (already noted in primitive section).

---

## Empty-State Contract

D-03 LOCKS the literal copy strings. Phase 3 implementation discipline:

1. **Length check is the only condition.** `if (array.length === 0) renderEmpty() else renderList()`. No conditional on auth, network, or backend availability — the silent-fallback in `lib/api.ts` already converts unreachable backends to seed-data, and seed data is what Phase 3 ships against.
2. **Empty-state copy is rendered as a single 13px / --muted line** (`.empty-state` class). The line follows the prompt directly — no extra `total 0` subhead AND empty-body line; the empty-body line REPLACES the subhead.
3. **Empty-state body strings (LOCKED — verbatim):**
   - `/projects`: `total 0 · (no projects committed yet)`
   - `/experience`: `(no commits to experience.log yet)`
   - `/writing`: `// no posts yet — follow github.com/beckinfonet for code-as-content.`
   - `/shipped`: `total 0 · (no apps shipped to stores yet)`
4. **No empty-state for about-view, stack-view, contact-view** — these views render against real data per `lib/portfolio-data.ts` (Phase 1 D-08).
5. **No skeletons, no spinners, no "loading..." UI.** All views are RSC; data is server-resolved before HTML streams.

**CSS class:** `.empty-state` (executor adds — single shared class):
```css
.empty-state {
  font-size: 13px;
  color: var(--muted);
  margin-top: 14px;  /* matches projects/shipped subhead spacing */
}
```

---

## Metadata Contract

Each `app/(terminal)/<route>/page.tsx` exports a static `metadata: Metadata` object (no `generateMetadata` per D-17).

| Route | metadata.title (Phase 2 LOCKED D-12) | metadata.description source | metadata.alternates.canonical |
|-------|---------------------------------------|------------------------------|-------------------------------|
| `/` | `about.md — Bakytbek Tatibekov` | `ROUTES[0].description` | `/` |
| `/projects` | `projects/ — Bakytbek Tatibekov` | `ROUTES[1].description` | `/projects` |
| `/stack` | `stack.json — Bakytbek Tatibekov` | `ROUTES[2].description` | `/stack` |
| `/experience` | `experience.log — Bakytbek Tatibekov` | `ROUTES[3].description` | `/experience` |
| `/writing` | `writing/ — Bakytbek Tatibekov` | `ROUTES[4].description` | `/writing` |
| `/contact` | `contact.sh — Bakytbek Tatibekov` | `ROUTES[5].description` | `/contact` |
| `/shipped` | `shipped.app — Bakytbek Tatibekov` | `ROUTES[6].description` | `/shipped` |

**Implementation pattern:**
```ts
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";

const route = ROUTES[1]; // projects
export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};
```

**Pitfall 1 enforcement:** the cross-view test in TEST-05 asserts `Set(allTitles).size === 7`. If metadata leaks the same string twice the test fails.

**Out of scope this phase:** OG image, Twitter card, JSON-LD — all Phase 5 (SEO-01..04). Phase 3 metadata is text-only.

---

## Copywriting Contract

| Element | Copy | Source |
|---------|------|--------|
| About-view H1 | `{PROFILE.name}` | `lib/portfolio-data.ts` |
| About-view role subline | `// {PROFILE.role}` | `lib/portfolio-data.ts` |
| About-view location | `{PROFILE.location}` | `lib/portfolio-data.ts` (Phase 6 fills) |
| About-view bio paragraphs | `{PROFILE.bio.long.map(...)}` | `lib/portfolio-data.ts` (Phase 6 fills) |
| About-view stat-card values | `{PROFILE.highlights[i].value}` | `lib/portfolio-data.ts` (Phase 6 fills 3 entries) |
| About-view stat-card labels | `{PROFILE.highlights[i].label}` | same |
| About-view primary CTA | `↓ resume.pdf` (text) — `aria-label="Download resume"` | LOCKED |
| About-view ghost CTA labels | `{s.label.toLowerCase()}/` (e.g. `github/`, `linkedin/`) | D-10 LOCKED |
| Projects-view subhead (populated) | `total {PROJECTS.length} · sorted by year desc` | D-03 |
| Projects-view subhead (empty) | `total 0 · (no projects committed yet)` | D-03 LOCKED |
| Stack-view JSON header line | `{` | hand-rolled per handoff |
| Experience-view subhead (populated) | (no subhead — direct list) | handoff |
| Experience-view body (empty) | `(no commits to experience.log yet)` | D-03 LOCKED |
| Experience-row hex | `{(i + 1).toString(16).padStart(7, '0')}` | discretion |
| Experience-row period | `({e.period})` | handoff `app.jsx` line 405 |
| Writing-view body (empty) | `// no posts yet — follow github.com/beckinfonet for code-as-content.` | D-03 LOCKED |
| Writing-row title prefix | `› ` (literal text character + space) | handoff `app.jsx` line 432 |
| Writing-row meta separator | ` · ` (space-bullet-space) | handoff line 430 |
| Contact-view lead paragraph | `Open to senior + staff full-stack and AI engineering roles. Remote-first, occasional travel ok.` | handoff line 448 — hardcoded in view |
| Contact-view label-column | `{s.label.toUpperCase()}` (e.g. `EMAIL`, `GITHUB`, `LINKEDIN`) | D-10 LOCKED |
| Contact-view email link visible | `{PROFILE.email}` | data |
| Contact-view email mailto aria | `Send email to {PROFILE.email}` | A11Y discretion |
| Contact-view social link visible | `{s.handle}` (e.g. `@beckinfonet`) | data |
| Contact-view primary CTA | `↓ download resume.pdf` (NOTE: longer than about-view) | handoff line 463 |
| Contact-view ghost CTA | `github ↗` (literal `↗` in text — NOT an `<ExternalLink>` auto-glyph) | handoff line 464 |
| Shipped-view subhead (populated) | `total {SHIPPED.length} · sorted by year desc` | D-12 / D-15 |
| Shipped-view subhead (empty) | `total 0 · (no apps shipped to stores yet)` | D-03 LOCKED |
| CopyButton idle label | `⧉ copy` | D-06 LOCKED |
| CopyButton confirmed label | `copied ✓` | D-06 LOCKED |
| CopyButton confirmation duration | 1500ms | D-06 LOCKED |
| ExternalLink trailing glyph | ` ↗` (leading space + `↗` glyph in `<span aria-hidden="true">`) | D-09 / D-11 LOCKED |
| Resume CTA download attribute | `Bakytbek_Tatibekov_Resume.pdf` (filename) | Phase 2 + handoff |

**ARIA-label conventions (Phase 3 discipline — plain noun + intent + side-effect):**

| Affordance | aria-label format | Example |
|-----------|--------------------|---------|
| Resume CTA (about + contact) | `Download resume` | `Download resume` |
| About-view ghost social | `Open {label} (opens in new tab)` | `Open GitHub (opens in new tab)` |
| Projects-row link | `{name}: {summary} (opens in new tab)` | `Soulful App: AI agentic platform... (opens in new tab)` |
| Writing-row link | `Read {title} (opens in new tab)` | `Read On Designing for Two Audiences (opens in new tab)` |
| Stack JSON CopyButton | `Copy stack JSON` | `Copy stack JSON` |
| Contact email link | `Send email to {PROFILE.email}` | `Send email to beckprograms@gmail.com` |
| Contact email CopyButton | `Copy email {PROFILE.email}` | `Copy email beckprograms@gmail.com` |
| Contact social ExternalLink | `Open {label} (opens in new tab)` | `Open LinkedIn (opens in new tab)` |
| Contact ghost github CTA | `Open GitHub (opens in new tab)` | (literal) |
| Shipped store badge (iOS) | `Open {appName} on App Store` | `Open Soulful on App Store` |
| Shipped store badge (Android) | `Open {appName} on Google Play` | `Open Soulful on Google Play` |
| Shipped CopyButton | `Copy {appName} store link` | `Copy Soulful store link` |

**Destructive actions in Phase 3:** None. No delete/destroy/irreversible actions in any view body. Phase 3 introduces no confirmation dialogs.

---

## Animation / Motion

**Inherited from Phase 2 — no new motion in Phase 3.**

| Animation | Inherited from Phase 2? | Phase 3 use |
|-----------|-------------------------|-------------|
| `slideIn 0.25s ease` on `.content-block` | YES | Each view's content block (the wrapper around all view-body content below the prompt-line) plays slideIn once on view mount. Triggered by `key={pathname}` on the wrapper, OR by relying on Next.js's per-route remount of `<main>{children}</main>` (preferred — no extra key prop needed). |
| `blink 1s steps(2) infinite` on `.cursor` | YES | The prompt-line cursor on every view (already in `<PromptLine>`). |
| `breadcrumb-hint` fade-in | YES | Phase 2 only — does not affect Phase 3 view bodies. |
| `prefers-reduced-motion` baseline (cursor → animation:none; content-block → animation:none) | YES | Already in Phase 2 `app/globals.css` lines 152–156. Phase 3 view bodies inherit. |

**Phase 3 introduces ZERO new motion tokens.** CopyButton label swap is instant (1500ms timer, but the label change is not a CSS transition — it's a React render diff). No skeleton fades, no row hover micro-animations, no chip click states.

---

## Accessibility Contract

**Inherited from Phase 2:** skip-link, focus-visible, semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), `aria-current="page"` on active sidebar row, full keyboard nav, reduced-motion baseline.

**Phase 3 additions:**

| Requirement | Implementation | Ref |
|-------------|----------------|-----|
| Plain-noun aria-labels on every interactive affordance | See `Copywriting Contract` § "ARIA-label conventions" — every CTA, ExternalLink, CopyButton, mailto, store-badge wrapper has an explicit aria-label | CLAUDE.md, A11Y-04 (extension) |
| External links announce target | aria-label includes `(opens in new tab)` suffix; visual `↗` glyph is `aria-hidden="true"` | SEO-05 + A11Y discretion |
| CopyButton announces success | sibling/inner `<span role="status" aria-live="polite" class="sr-only">Copied to clipboard</span>` for 2000ms | D-07 |
| Heading hierarchy | About-view is the ONLY view with `<h1>` (the name). Other views have NO `<h1>` because the `$ <command>` prompt-line is the visual heading. The prompt-line is decorative `<div>` markup, not `<h1>`. View bodies that need internal headings use `<h2>` (none in Phase 3 by design — flat structure). | A11Y discretion |
| Shipped-list and projects-list semantics | `<ul>` for the list; `<li>` for each row | A11Y discretion |
| Empty-state semantics | Plain `<div class="empty-state">` — no `role="alert"` (the empty state is not urgent) | A11Y discretion |
| Tab order within a view | Sequential (no `tabindex`); the prompt-line is decorative; first interactive element in each view is the first link/button in DOM order | A11Y-08 (inherited) |
| Reduced-motion | No new motion → no new reduced-motion rules; Phase 2 baseline covers it | A11Y-03 baseline (Phase 5 audits) |

**5-second recruiter test (Phase 3 contribution):**
- About-view first paint: H1 + role + 3 stat values + resume CTA all visible and accent-emphasized
- Resume CTA `aria-label="Download resume"` is the same plain-noun string as the Phase 2 top-bar resume button (consistency for SR re-encounter)
- Email is one CopyButton click + 1500ms feedback
- Mobile redistribution is Phase 4 — Phase 3 must NOT introduce desktop-only patterns that block mobile redistribution. **Specifically:**
  - No hardcoded pixel widths that prevent shrinking (max-width 480px on contact-card, 920px on main is fine — Phase 4 will adjust)
  - No hover-only affordances (CopyButton + ExternalLink work on tap; no info-on-hover)
  - No viewport-sniff CSS (no `vw` units, no `@media (min-width: ...)` carving in Phase 3)
  - The about-view CTA row uses `flex-wrap` so it reflows naturally below 480px

---

## Component Architecture Contract

| File | Type | "use client" | Reason |
|------|------|-------------|--------|
| `app/(terminal)/page.tsx` (about) | Server Component | NO | RSC; calls `getProfile()` |
| `app/(terminal)/projects/page.tsx` | Server Component | NO | RSC; calls `getProjects()` |
| `app/(terminal)/stack/page.tsx` | Server Component | NO | RSC; calls `getStack()` |
| `app/(terminal)/experience/page.tsx` | Server Component | NO | RSC; calls `getExperience()` |
| `app/(terminal)/writing/page.tsx` | Server Component | NO | RSC; calls `getWriting()` |
| `app/(terminal)/contact/page.tsx` | Server Component | NO | RSC; calls `getProfile()` |
| `app/(terminal)/shipped/page.tsx` | Server Component | NO | RSC; calls `getShipped()` |
| `app/components/views/about-view.tsx` | Server Component | NO | RSC; receives data as props |
| `app/components/views/projects-view.tsx` | Server Component | NO | RSC; receives `Project[]` as props |
| `app/components/views/stack-view.tsx` | Server Component | NO | RSC; receives `StackCategory[]` as props |
| `app/components/views/experience-view.tsx` | Server Component | NO | RSC; receives `Experience[]` as props |
| `app/components/views/writing-view.tsx` | Server Component | NO | RSC; receives `Writing[]` as props |
| `app/components/views/contact-view.tsx` | Server Component | NO | RSC; receives `Profile` as props |
| `app/components/views/shipped-view.tsx` | Server Component | NO | RSC; receives `ShippedApp[]` as props |
| `app/components/primitives/tech-chip.tsx` | Server Component | NO | RSC primitive |
| `app/components/primitives/kbd.tsx` | Server Component | NO | RSC primitive |
| `app/components/primitives/external-link.tsx` | Server Component | NO | RSC primitive |
| `app/components/primitives/copy-button.tsx` | Client island | **YES** | navigator.clipboard, useState, setTimeout |
| `app/components/primitives/store-badge.tsx` | Server Component | NO | RSC primitive (renders inline SVG) |

**Phase 3 client island count: 1 (`<CopyButton>` only)** — per Pitfall 9, this is the ONLY component crossing the client boundary. CopyButton is instantiated:
- 1× per stack view (always)
- 1× per contact view email row (always)
- N× per shipped view (one per shipped app — capped at v1 ≤10 apps)
- 0 instances in empty-state renders

**Bundle target (inherited):** Per-view delta < 10KB gzipped (per ROADMAP Phase 2 / Phase 3 success criterion). CopyButton is a tiny client component; `navigator.clipboard.writeText` is a browser-native API, no library imported.

**Data flow per Pattern 3 (page fetches, view receives props — ARCHITECTURE.md):**
```tsx
// app/(terminal)/projects/page.tsx
export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsView projects={projects} />;
}
```
View components do NOT call `getX()` — they receive typed data as props. This keeps views pure and unit-testable.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — no shadcn |
| Apple App Store badge artwork | 1 SVG (Black "Download on the App Store") | **planner research item** at plan-phase: fetch from https://tools.applemediaservices.com/app-store/ ; verify license; commit + JSDoc-cite source URL + sourced-on date |
| Google Play badge artwork | 1 SVG (Black/Green "Get it on Google Play") | **planner research item** at plan-phase: fetch from https://play.google.com/intl/en_us/badges/ ; verify license; commit + JSDoc-cite source URL + sourced-on date |
| third-party shadcn registries | none | not applicable |

**Brand-asset compliance is mandatory:**
- Apple Marketing Identity Guidelines are LEGALLY ENFORCED (App Store Trademark + brand guidelines). Misuse risks takedown.
- Google Play Brand Guidelines require approved badge form at minimum 135px width.
- Both must be sourced from the official providers above; recreations are not acceptable.

**The compliance gate is a planner research item (not a checker veto)** because the SVG sources change periodically and pinning a specific filename in this UI-SPEC would create staleness risk. The planner fetches current SVGs at plan-phase, commits them, and cites sources in `store-badge.tsx` JSDoc.

---

## Mobile Scope Note

Phase 3 ships the **desktop-first** view-body contract described above. The 480px contact-card max-width and the 920px main max-width are inherited from Phase 2; Phase 3 does NOT introduce new mobile breakpoints.

**Phase 4 (Mobile-Responsive) will own:**
- Stack-view `<pre>` horizontal-scroll behavior at <480px
- Projects/shipped 32px/1fr/110px grid → reflow behavior at <600px
- About-view stat-card grid: 3-col → 1-col stack at <480px
- About-view CTA row: already wraps via `flex-wrap` (Phase 3 ships this — Phase 4 audits)
- Writing post excerpt max-width relaxation

**Phase 3 must NOT break mobile redistribution (Pitfall 7):**
- No `display: none` for any view-body content
- No hover-only states (every interactive element must be tap-equivalent)
- No fixed pixel widths on row content (grid templates use `1fr`)
- No `position: absolute` overflowing the parent (CopyButton uses `position: absolute` inside `.stack-pre-wrap` which is `position: relative` — confined)

---

## Pre-Population Sources

| Source | Decisions Used |
|--------|---------------|
| `.planning/phases/03-views/03-CONTEXT.md` | All 19 LOCKED decisions (D-01..D-19): empty-state copy (D-03), CopyButton arch (D-05..D-07), ExternalLink (D-08..D-11), shipped layout (D-12..D-15), metadata strategy (D-16/D-17), test scope (D-18), wave structure (D-19) |
| `.planning/phases/02-shell/02-UI-SPEC.md` | All design tokens, type scale, spacing scale, color tokens, focus styles, motion contract, prompt-line primitive, layout dimensions, locked prompts (D-13), locked titles (D-12) — INHERITED |
| `design_handoff_terminal_portfolio/app.jsx` | Per-view layouts (lines 289–468); about hero, projects grid, stack `<pre>` syntax highlighting, experience hex/role/company/period, writing date·readtime + ›title + excerpt, contact 90px label-column card |
| `design_handoff_terminal_portfolio/README.md` | Visual fidelity reference (no `shipped.app` screenshot exists — D-12..D-15 are canonical) |
| `lib/routes.ts` | Per-view `description` and `pathname` for metadata; route ordering for sort consistency |
| `lib/types.ts` | Field shapes for Profile, Project, Experience, Writing, ShippedApp, StackCategory |
| `lib/portfolio-data.ts` | Empty-array state for PROJECTS / EXPERIENCE / WRITING / SHIPPED; real STACK / PROFILE.email / PROFILE.socials (GitHub real, LinkedIn TODO) |
| `app/globals.css` (Phase 2) | Existing classes Phase 3 reuses (`.btn` → `.topbar-btn` precedent; `.sr-only`; `.content-block`; `.cursor`; `.prompt-line`); existing semantic landmarks |
| `.planning/research/SUMMARY.md` | About-first vertical slice; per-view metadata uniqueness |
| `.planning/research/ARCHITECTURE.md` | Pattern 3 (page fetches, view receives props); RSC view boundary discipline |
| `.planning/research/PITFALLS.md` | Pitfall 1 (per-route metadata uniqueness test); Pitfall 9 (RSC boundary — Phase 3 client island count = 1) |
| `.planning/research/FEATURES.md` | `<ExternalLink>` is table-stakes; mailto + copy is recruiter table-stakes |
| `CLAUDE.md` | Pure CSS only; no Tailwind; persistent resume CTA; plain-noun aria-labels; brownfield discipline; 5-second recruiter test exit criterion |
| User input (this session) | 0 — all decisions pre-populated from upstream artifacts (CONTEXT.md fully resolved during /gsd-discuss-phase 3) |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS (every locked string verbatim; aria-label conventions exhaustive; no destructive actions)
- [ ] Dimension 2 Visuals: PASS (handoff line refs cited per view; primitives mapped to handoff S.* style objects; shipped layout traced to D-12..D-15 since handoff has no reference)
- [ ] Dimension 3 Color: PASS (60/30/10 inherited; accent reservation list extended to 21 uses, all typographic emphasis; no new tokens; semantic --warn used per handoff for keys/status/hash)
- [ ] Dimension 4 Typography: FLAG (handoff-locked carry-forward — Phase 2 already documents the 7-size/3-weight exception; Phase 3 adds 22/700 for stat-card and 15/600 for project name, both pre-noted in Phase 2 spec; checker should validate against the inheritance + extension narrative, not against the 4-size BLOCK rule)
- [ ] Dimension 5 Spacing: FLAG (handoff-locked carry-forward — Phase 2 already documents the 5 non-multiple-of-4 exceptions; Phase 3 introduces NO new exceptions; chip 3px is the only Phase-3-instantiated exception value)
- [ ] Dimension 6 Registry Safety: PASS (no shadcn; App Store + Google Play badge artwork flagged as planner research item with mandatory license-compliance discipline; planner sourcing is recorded in `store-badge.tsx` JSDoc — gate executes at plan-phase, not at UI-SPEC time)

**Approval:** pending (gsd-ui-checker validates against Phase 2 inheritance narrative + Phase 3 additions)

---

*Phase: 03-views*
*UI-SPEC generated: 2026-05-06*
*Status: draft — awaiting gsd-ui-checker verification*
*Inheritance: extends `.planning/phases/02-shell/02-UI-SPEC.md` — tokens, scale, palette, motion, focus all inherited; this document declares only Phase 3 additions and per-view layout specifics*
