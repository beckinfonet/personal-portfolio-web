# Phase 3: Views - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 03-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 03-views
**Areas discussed:** Empty-state UX, Copy-button architecture, <ExternalLink> primitive, shipped.app layout

---

## Empty-state UX

### Q1 — When a view has zero entries, what does it render?

| Option | Description | Selected |
|--------|-------------|----------|
| Terminal-style 'no entries' | Render the prompt + a muted line like 'total 0 · (no entries yet)' or '// nothing here yet'. Stays in voice. Build never breaks if Phase 6 slips. | ✓ |
| Coming-soon teaser | Friendly 'Coming soon — last updated 2026-05-06' block with a date. Implies activity but bigger lie if Phase 6 is delayed. | |
| Hidden body | Prompt line only; nothing below. Smallest visual surface but looks broken / gives recruiters nothing. | |

**User's choice:** Terminal-style 'no entries'
**Notes:** Aligned with terminal-voice brand discipline; avoids implying Phase 6 dates.

### Q2 — When the array is empty, should the view still ship to production / sitemap?

| Option | Description | Selected |
|--------|-------------|----------|
| Always ship + sitemap | All 7 routes always exist + always in sitemap; SEO baseline never regresses. Empty-state UX (Q1) carries the weight. | ✓ |
| Ship route, exclude from sitemap if empty | Sitemap iterates ROUTES but filters out content-empty ones. Risk: sitemap drift; ROUTE-04 already locked sitemap to enumerate ROUTES (Phase 2). | |
| 404 if empty | Empty view returns notFound(). Hostile — a recruiter clicking 'projects/' from sidebar gets 404 mid-journey. | |

**User's choice:** Always ship + sitemap
**Notes:** Preserves SEO baseline; empty-state UX from Q1 carries the weight.

### Q3 — Concrete empty-state copy per view — lock the strings now or defer?

| Option | Description | Selected |
|--------|-------------|----------|
| Lock per-view copy now | I'll lock concrete copy in CONTEXT.md so executor doesn't improvise. | ✓ |
| Defer to executor | Note 'terminal-voice empty states' in CONTEXT.md and let executor write the strings during Phase 3 build. | |

**User's choice:** Lock per-view copy now
**Notes:** Locked in 03-CONTEXT.md D-03 (table per view).

### Q4 — CONTENT-04 path for v1?

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit 'coming soon' empty state | Writing view ships with empty WRITING[] + 'no posts yet' empty state per Q3. Phase 6 doesn't have to author a post. Removes a Phase 6 blocker. | ✓ |
| Block on at-least-one post | WRITING[] gets a real entry in Phase 6 before /writing can ship to production. Tighter brand but adds a Phase 6 dependency. | |

**User's choice:** Explicit 'coming soon' empty state
**Notes:** CONTENT-04 effectively resolved-via-empty-state.

---

## Copy-button architecture

### Q1 — Where does 'use client' go for the copy widgets?

| Option | Description | Selected |
|--------|-------------|----------|
| Tiny shared <CopyButton/> island | Single client component at app/components/primitives/copy-button.tsx. View bodies stay RSC. Smallest client surface; reusable. | ✓ |
| Two purpose-built islands | <CopyJsonButton/> + <CopyEmail/>. More specific aria-labels, slightly larger client surface. | |
| Whole stack-view + contact-view as 'use client' | Slap 'use client' at view file top. Violates Pitfall 9 / SHELL-02. | |

**User's choice:** Tiny shared <CopyButton/> island

### Q2 — What does the copy button look like?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-right ghost button '⧉ copy' | Small ghost-style button with ⧉ icon + 'copy' text in muted, top-right of <pre>; right-aligned on contact email row. Switches to 'copied ✓' for 1.5s. | ✓ |
| Inline '⧉' icon-only | No text label; pure icon button. Smallest; needs aria-label. | |
| Right-side text-only 'copy' | No icon, just 'copy' link styled as muted hover-accent text. | |

**User's choice:** Top-right ghost button '⧉ copy'

### Q3 — Confirmation feedback after click?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline label swap + aria-live | Button text swaps to 'copied ✓' for 1.5s; reuse cmdk palette aria-live region pattern. | ✓ |
| Inline only, no aria-live | Visual swap only. SR users get nothing. Sub-WCAG. | |
| Toast notification | Floating toast 'Copied to clipboard'. Adds toast infra for two consumers. Overkill in v1. | |

**User's choice:** Inline label swap + aria-live

---

## <ExternalLink> primitive

### Q1 — <ExternalLink> behavior — explicit external prop or auto-detect?

| Option | Description | Selected |
|--------|-------------|----------|
| Always external (no auto-detect) | <ExternalLink href={...}> always emits target='_blank' rel='noopener noreferrer'. Same-origin uses plain <a>. Simpler, explicit. | ✓ |
| Auto-detect via URL parse | Component parses href — if origin !== window.location.origin, applies external. RSC has no window. | |
| Explicit override prop | Default external, accept `internal` prop to opt out. Two ways = drift. | |

**User's choice:** Always external (no auto-detect)

### Q2 — Visual treatment for external links?

| Option | Description | Selected |
|--------|-------------|----------|
| Trailing '↗' glyph + hover fade | Renders children + ' ↗' icon. Hover opacity 0.85. Matches handoff `github ↗`. | ✓ |
| No visual indicator | Plain <a> styled like internal links. | |
| Underlined + '↗' | Adds underline. Heavier; clashes with terminal aesthetic. | |

**User's choice:** Trailing '↗' glyph + hover fade

### Q3 — Ghost-button label conventions for socials?

| Option | Description | Selected |
|--------|-------------|----------|
| About uses lowercased + '/' (handoff); contact uses uppercase label column | Both views render PROFILE.socials; about: `github/`, `linkedin/`. Contact: 90px label column with `GITHUB` uppercase + handle as accent link. | ✓ |
| Both views use the same convention | Pick one. Loses handoff fidelity. | |

**User's choice:** About uses lowercased + '/' (handoff); contact uses uppercase label column

### Q4 — File location for <ExternalLink>?

| Option | Description | Selected |
|--------|-------------|----------|
| app/components/primitives/external-link.tsx (RSC) | Lives with prompt-line, tech-chip, kbd. RSC since target/rel are static attrs. | ✓ |
| app/components/views/external-link.tsx | Co-located with views. But it's not a view. | |

**User's choice:** app/components/primitives/external-link.tsx (RSC)

---

## shipped.app layout

### Q1 — Per-app rendering shape?

| Option | Description | Selected |
|--------|-------------|----------|
| Row with year-right column (mirrors projects/) | 32px / 1fr / 110px grid same as projects/. Visual consistency. | ✓ |
| Card grid (2-col on desktop) | Per-app card with App Store + Play Store badges side-by-side. Diverges from terminal-row aesthetic. | |
| JSON-styled like stack | Render shipped[] as a JSON pretty-print. Buries store links inside JSON syntax. | |

**User's choice:** Row with year-right column (mirrors projects/)

### Q2 — App Store / Play Store badge style?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain text links 'app store ↗ / google play ↗' | <ExternalLink> with handoff-style lowercase labels. No images. Smallest bundle. | |
| Inline SVG official badges | Apple + Google's official branded badges as inline SVG. Recruiter-recognizable. License boilerplate required. | ✓ |
| Custom terminal-styled badges | Custom-drawn 'iOS' / 'android' chip-style buttons. Loses Apple/Google instant-recognition. | |

**User's choice:** Inline SVG official badges
**Notes:** Diverged from recommendation. Recruiter-recognition value > terminal-aesthetic purity for VIEW-07 audience. License compliance flagged in 03-CONTEXT.md D-13 as planner research item.

### Q3 — Copyable share URL per app (per VIEW-07)?

| Option | Description | Selected |
|--------|-------------|----------|
| Defer to v1.x — omit for now | Per-app share URL = a copy-link button per row. Recruiter value low. Removes a per-row CopyButton instance. | |
| Per-app copy-link button | Each row gets a <CopyButton value={appStoreUrl}/>. Honors VIEW-07 verbatim. | ✓ |
| Anchor IDs only | Each app gets id={slug(app.name)}; users right-click 'copy link to this section'. | |

**User's choice:** Per-app copy-link button
**Notes:** Diverged from recommendation. Full VIEW-07 compliance preferred. Bundle scale acceptable (≤10 apps in v1).

### Q4 — Empty-state copy when SHIPPED[] is empty?

| Option | Description | Selected |
|--------|-------------|----------|
| '$ ls -la shipped/' + 'total 0 · (no apps shipped to stores yet)' | Consistent with projects empty-state pattern. Plain noun 'apps' — recruiter-readable. | ✓ |
| '// shipping in progress.' | Cuter, less informative. | |

**User's choice:** '$ ls -la shipped/' + 'total 0 · (no apps shipped to stores yet)'

---

## Claude's Discretion

Areas locked with sensible defaults inline (in 03-CONTEXT.md `<decisions>` and Claude's Discretion sub-section), without surfacing as live questions:

- Per-view metadata depth (D-16): static `metadata: Metadata` object; description from `ROUTES[i].description`; `alternates.canonical` relative path.
- No `generateMetadata` in v1 (D-17).
- TEST-05 = 7 smoke specs at `app/(terminal)/<view>/page.test.tsx`; assert render + locked title + locked prompt-line copy; cross-view uniqueness assertion (D-18).
- 5-wave plan structure: primitives → about-first-slice → 6 parallel views → metadata enrichment → tests (D-19).
- Experience.log hex-hash convention: handoff toy form `(i+1).toString(16).padStart(7, '0')`.
- Sort orders: projects/experience/writing/shipped all sort at render time inside the view component.
- Stack JSON syntax highlighting: hand-rolled (no library — would violate two-new-deps cap).

## Deferred Ideas

Captured in 03-CONTEXT.md `<deferred>` section. Highlights:

- Per-project anchors → v1.x.
- Stack per-key copy → v2.
- Real git SHA-1 hashes for experience → v2.
- `/writing/[slug]` dynamic post pages → out of v1.
- App Store / Google Play badge license review → planner research item at plan-phase time (NOT deferred — flagged for action during plan-phase).
