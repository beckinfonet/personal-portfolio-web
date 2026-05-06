# Phase 3: Views — Research

**Researched:** 2026-05-06
**Domain:** Next.js 15 App Router RSC view bodies inside a persistent shell — seven per-view routes, shared primitives, per-route metadata, smoke tests.
**Confidence:** HIGH

---

## Summary

Phase 3 is **prescriptive, not exploratory.** Every architectural decision the planner needs is already locked in `03-CONTEXT.md` (D-01..D-19) and the layout/visual contract is fully specified in `03-UI-SPEC.md` with handoff line refs. The shell from Phase 2 is complete; the seven route stubs already exist with locked prompts and locked titles; `lib/api.ts` fetchers are wired with silent fallback to `lib/portfolio-data.ts`; the route registry, types, and CSS token system are all in place. The research scope is to verify, sequence, and de-risk — **not** to re-debate decisions.

The phase ships **5 new primitives** (`TechChip`, `Kbd`, `ExternalLink`, `CopyButton`, `StoreBadge`) and **7 view components** (`about-view`, `projects-view`, `stack-view`, `experience-view`, `writing-view`, `contact-view`, `shipped-view`). One client island only (`CopyButton`) — every other component is RSC. Per-view `metadata` exports add `description` (from `ROUTES[i].description`) and `alternates.canonical` to the existing locked `title`. One Vitest smoke spec per view + one cross-view title-uniqueness spec satisfies TEST-05.

The single planner-research-item that **must execute during plan-phase** is the App Store / Google Play badge SVG sourcing: fetch official assets, verify license boilerplate, commit + JSDoc-cite. Everything else is mechanical implementation against locked specs.

**Primary recommendation:** Wire the 5 primitives first (CSS classes + components in one wave), build about-view as a vertical slice to validate the page→view-component→primitives data flow against the existing shell, then parallelize the remaining six views, and close with the metadata enrichment + smoke-test waves. Reuse Phase 2's `aria-live` region pattern verbatim for `CopyButton`. Do not introduce new dependencies, new motion, or new color tokens. Wave 0 is empty — all required test infrastructure is already in place.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Empty-State Discipline:**
- **D-01: Always-ship + always-in-sitemap.** All 7 routes ship to production and appear in `app/sitemap.ts` regardless of data presence. Sitemap iteration over `ROUTES` (Phase 2 ROUTE-04) does not gain a content-existence filter.
- **D-02: Terminal-voice empty states.** When a content array is empty, the view still renders its prompt line + a muted `(no entries…)` line. Stays in voice; build never breaks; Phase 6 swaps real content without code edits.
- **D-03: Concrete empty-state copy LOCKED — verbatim, no improvisation:**
  | View | Empty body |
  |---|---|
  | `/projects` | `total 0 · (no projects committed yet)` |
  | `/experience` | `(no commits to experience.log yet)` |
  | `/writing` | `// no posts yet — follow github.com/beckinfonet for code-as-content.` |
  | `/shipped` | `total 0 · (no apps shipped to stores yet)` |

  Implementation: each view checks `array.length === 0` → renders the empty-body line; otherwise renders the populated body. No conditional metadata changes; same `<title>` either way.
- **D-04: CONTENT-04 v1 path = empty-with-coming-soon-state.** Writing view ships v1 with `WRITING = []` and the empty-state line from D-03. Phase 6 is NOT blocked on authoring at-least-one post.

**Copy-Button Architecture:**
- **D-05: Single shared `<CopyButton/>` client island** at `app/components/primitives/copy-button.tsx` with `"use client"`. Props: `{ value: string; idleLabel?: string; copiedLabel?: string; ariaLabel: string; className?: string }`. Uses `navigator.clipboard.writeText(value)`. View bodies stay RSC.
- **D-06: Top-right ghost button `⧉ copy` → `copied ✓` for 1.5s.** Stack: top-right of `<pre>` card via `position: absolute`. Contact: right-aligned on email row. Shipped: icon-only variant. Mirrors `.topbar-btn` styling smaller.
- **D-07: Confirmation feedback: inline label swap + `aria-live="polite"`.** Reuse the `aria-live` region pattern Phase 2 established for cmdk palette result-count. No toast infrastructure; no global state.

**`<ExternalLink>` Primitive (SEO-05):**
- **D-08: `<ExternalLink>` is always-external; no auto-detect.** Component at `app/components/primitives/external-link.tsx` (RSC). Renders `<a href={href} target="_blank" rel="noopener noreferrer">` always. No runtime URL parse, no `window` dependency.
- **D-09: Visual treatment: trailing `↗` glyph + hover opacity 0.85.** Renders `{children}<span aria-hidden="true"> ↗</span>`.
- **D-10: View-local social label conventions kept distinct (per handoff).**
  - About-view ghost CTA buttons: lowercased label + trailing `/` (e.g. `github/`, `linkedin/`). From `PROFILE.socials[i].label.toLowerCase()`.
  - Contact-view card row: 90px label column with `LABEL.toUpperCase()` (e.g. `GITHUB`) + accent-link to handle.
  - Both views import the same `<ExternalLink>` primitive; each view applies its own label transform.
- **D-11: Component API.** `<ExternalLink href={...} className?={...}>{children}</ExternalLink>`. The `↗` glyph is always rendered; opt-out (for `<StoreBadge>`) is added via a `showGlyph?: boolean` prop (Option 1 from UI-SPEC §"Implementation note").

**`shipped.app` View Layout:**
- **D-12: Per-app row layout mirroring projects/.** 32px / 1fr / 110px grid (same shape as projects-row). Index, name+summary+badges-row, year+role+status. Per-row `border-bottom: 1px solid var(--border)`.
- **D-13: Inline SVG official badges for App Store + Google Play.** `app/components/primitives/store-badge.tsx` (RSC). License compliance is mandatory:
  - Apple "Marketing Identity Guidelines" — badge SVG must come from Apple's official provider; no recoloring.
  - Google Play "Brand Guidelines" — badge must be in approved English form at minimum width (135px), no modifications.
  - **Planner research item:** During plan-phase, fetch the current SVG sources + license terms; document badge `viewBox`/`width`/`height` constants in `store-badge.tsx`; do NOT inline an unofficial recreation.
  - Badges wrap with `<ExternalLink>` to the actual store URL; trailing `↗` is suppressed via `showGlyph={false}` (the badge graphic itself signals external navigation).
  - Fallback: if a `ShippedApp` entry has only one platform, only that one badge renders.
- **D-14: Per-app `<CopyButton/>` for the share URL** (full VIEW-07 compliance). Each row gets one `<CopyButton/>` instance copying the canonical store URL. `aria-label="Copy <app-name> store link"`. Icon-only variant (no `copy` text label).
- **D-15: Empty state per D-02/D-03.** When `SHIPPED = []`, view renders prompt + `total 0 · (no apps shipped to stores yet)`. No badges, no copy buttons, no client islands instantiated.

**Per-View Metadata Strategy:**
- **D-16: Static `metadata: Metadata` object per `page.tsx`.** Phase 2 stubs already have `title` (D-12 carry-forward: `<file-label> — Bakytbek Tatibekov`). Phase 3 enriches with `description` (from `ROUTES[i].description`) + `alternates.canonical` (set to `ROUTES[i].pathname`).
- **D-17: No `generateMetadata` for v1.** Static metadata covers Phase 3 needs.

**Test Strategy:**
- **D-18: TEST-05 = 7 smoke specs at `app/(terminal)/<view>/page.test.tsx`.** Each spec asserts: (1) component renders without throwing, (2) `<title>` resolves to the locked Phase 2 D-12 string, (3) body contains the Phase 2 D-13 prompt-line text. Cross-view test asserts `Set(allTitles).size === 7`. **Out of scope:** affordance-presence assertions (resume CTA, copy buttons, mailto) — Phase 5/7 verification covers those.

**Wave Structure:**
- **D-19: Suggested 5-wave grouping** (planner can refine):
  - **Wave 1 (sequential):** Primitives — `tech-chip` (RSC), `kbd` (RSC), `external-link` (RSC), `copy-button` (client), `store-badge` (RSC) + new view-related CSS in `app/globals.css`
  - **Wave 2 (sequential):** About view — first vertical slice, validates the RSC-view pattern end-to-end
  - **Wave 3 (parallel, 6 plans):** Six remaining views — `projects-view`, `stack-view`, `experience-view`, `writing-view`, `contact-view`, `shipped-view`
  - **Wave 4 (sequential):** Per-view metadata enrichment (touch all 7 `page.tsx` for `description` + `alternates.canonical`)
  - **Wave 5 (parallel):** TEST-05 smoke specs (7 specs + 1 cross-view uniqueness spec) — one plan, parallelizable internally

  Total: ~10 plans.

### Claude's Discretion (locked with sensible defaults inline)

- **Experience.log hex-hash convention:** `(i + 1).toString(16).padStart(7, '0')` rendering `0000001`, `0000002`, etc. Stable, deterministic for tests, no real-git infrastructure needed.
- **Sort order:** projects/ year desc; experience.log most-recent-first (array order); writing/ date desc with defensive `Date.parse` fallback; shipped.app year desc. All sort at render time inside the view component (non-mutating spread + sort).
- **Resume CTA on about view:** `<a download="Bakytbek_Tatibekov_Resume.pdf" href={PROFILE.resumeUrl}>↓ resume.pdf</a>`. Same pattern on contact-view footer with longer label `↓ download resume.pdf`.
- **`mailto:` on contact view:** `<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>` PLUS `<CopyButton value={PROFILE.email}/>` for explicit one-tap copy.
- **Stack-view JSON content source:** `JSON.stringify(Object.fromEntries(STACK.map(c => [c.category, c.items])), null, 2)` — the SAME canonical string the `<pre>` renders and the `<CopyButton>` copies (byte-equivalent).
- **Stack-view syntax highlighting:** Hand-rolled per handoff `app.jsx` lines 367–388 using React Fragments + spans. No syntax-highlighter library (would violate "exactly two new prod deps" constraint).
- **Tech-chip primitive:** `<TechChip>{label}</TechChip>` renders `<span class="tech-chip">{children}</span>`.
- **Kbd primitive:** `<Kbd>⌘K</Kbd>` renders `<kbd class="kbd">{children}</kbd>`. Phase 2 already styles `<kbd>` inside `.breadcrumb-hint` and `.palette-footer` — Phase 3 formalizes the wrapper with a global `.kbd` class.

### Deferred Ideas (OUT OF SCOPE)

- **Per-project anchors (`/projects#project-name`)** — v1.x (PALETTE-V2-01 / SEO-V2-01).
- **Stack-view per-key copy buttons (copy individual category)** — v2. v1 ships single full-JSON copy button only.
- **Real git SHA-1 hashes for experience.log** — v2.
- **Dynamic OG images per route** — Phase 5 (SEO-03).
- **Twitter card metadata, JSON-LD Person schema, favicon set** — Phase 5 (SEO-01, SEO-02, SEO-04).
- **`@axe-core/playwright` 8-combination contrast audit** — Phase 5 (A11Y-07).
- **`prefers-reduced-motion` comprehensive pass** — Phase 5 (A11Y-03). Phase 3 inherits Phase 2's baseline; introduces no new motion.
- **Mobile bottom-sheet palette + sidebar drawer + STATUS rehoming** — Phase 4 (MOBILE-01..05, PALETTE-05).
- **Print stylesheet (`@media print`)** — Phase 4 (A11Y-09).
- **`/writing/[slug]` dynamic post pages** — out of v1.
- **Real bio / projects / writing / shipped / experience / location content** — Phase 6 (CONTENT-01..07).
- **`hire-me.txt` 8th view** — v3.
- **Real resume PDF (`Bakytbek_Tatibekov_Resume.pdf`)** — Phase 6 (CONTENT-05).
- **Vercel Analytics `resume_download` event** — Phase 7 (DEPLOY-06).
- **CSP nonce work for inline scripts** — Phase 1 D-15 deferred. Phase 3 introduces no new inline scripts.
- **Console signature easter egg + view-source HTML comment** — Phase 5 (DEV-01, DEV-02).
- **App Store / Google Play badge license review** — DO NOT defer; **planner research item at plan-phase time** per D-13. Captured in deferred only as a flag — actual work happens during plan-phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ROUTE-01 | Seven per-view App Router routes exist under the terminal-shell layout: `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` | All 7 route stubs exist post-Phase 2 (verified: see `app/(terminal)/<view>/page.tsx`). Phase 3 only replaces the body. |
| ROUTE-02 | Each `page.tsx` exports a unique `metadata` object with route-specific `title`, `description`, and `alternates.canonical` | Static `metadata: Metadata` pattern verified against [Next.js 15 metadata docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata); `metadataBase` already set in `app/layout.tsx` (Phase 1); `description` sourced from `ROUTES[i].description` (verified populated in `lib/routes.ts`); `alternates.canonical` resolves relative paths against `metadataBase` (verified). |
| VIEW-01 | `about.md` view: H1 + role subline + bio + 3 stat cards + resume CTA + ghost socials | UI-SPEC §V1 with handoff `app.jsx` lines 289–315 line refs. Phase 6 fills `PROFILE.highlights` (3 entries) / `PROFILE.bio.long` / `PROFILE.location` with real values; Phase 3 view code reads these AS-IS — Phase 6 swaps content without code edits. |
| VIEW-02 | `projects/` view: prompt + subhead + 3-col grid (32/1fr/110) per project: index, name+summary+chips, year+status+role | UI-SPEC §V2 with handoff `app.jsx` lines 318–353. Empty-state path D-03; sort year desc at render. |
| VIEW-03 | `stack.json` view: prompt + syntax-highlighted JSON `<pre>` card + top-right copy button | UI-SPEC §V3 with handoff `app.jsx` lines 355–389. Hand-rolled syntax highlighter (Fragments + spans). `STACK` is real data; no empty-state. |
| VIEW-04 | `experience.log` view: prompt + per-row hex-hash + role + `@ company` + period + summary | UI-SPEC §V4 with handoff `app.jsx` lines 391–413. Hex hash via `(i + 1).toString(16).padStart(7, '0')`. Empty-state D-03. |
| VIEW-05 | `writing/` view: prompt + per-post DATE · READTIME + `› title` + excerpt | UI-SPEC §V5 with handoff `app.jsx` lines 415–439. v1 ships empty per D-04 / CONTENT-04. Dashed border between posts. |
| VIEW-06 | `contact.sh` view: prompt + lead paragraph + 90px label-column card + footer CTAs (resume + github↗) | UI-SPEC §V6 with handoff `app.jsx` lines 441–468. `mailto:` link + `<CopyButton>` for email. Lead paragraph hardcoded inline (Phase 3 decision). |
| VIEW-07 | `shipped.app` view: per-app App Store + Play Store deep links, copyable share URLs | UI-SPEC §V7. **No handoff reference** — D-12..D-15 are canonical. **Planner research item:** fetch official Apple / Google badge SVGs at plan-phase. |
| VIEW-08 | Shared primitives extracted: `prompt-line.tsx`, `tech-chip.tsx`, `kbd.tsx` — RSC-friendly | `prompt-line.tsx` already exists from Phase 2 (RSC, verified). Phase 3 adds `tech-chip.tsx`, `kbd.tsx`, plus `external-link.tsx`, `copy-button.tsx`, `store-badge.tsx` (5 new primitives total). |
| SEO-05 | External links use shared `<ExternalLink>` component that sets `target="_blank"` and `rel="noopener noreferrer"` | D-08..D-11 LOCKED. Component is RSC; `target`/`rel` are static attributes. Verification: `grep -rE 'target="_blank"' app/components/views/` should return zero hits because views use the primitive, not raw `<a target="_blank">`. Three known exceptions handled explicitly: store-badge (suppresses glyph via `showGlyph={false}`), projects-row link (entire row is link), contact-view email mailto (mailto is not external SEO-wise). |
| TEST-05 | One Vitest smoke test per view: renders, has unique `<title>`, has prompt-line | D-18 LOCKED. 7 specs at `app/(terminal)/<view>/page.test.tsx` + 1 cross-view uniqueness spec. Existing patterns from Phase 2 (`sidebar.test.tsx`, `sitemap.test.tsx`) provide the template. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are **the same authority as locked decisions** and must NOT be contradicted by any plan:

| Constraint | Source | Phase 3 Implication |
|------------|--------|---------------------|
| Next.js 15 App Router + React 19 + TypeScript strict (no framework swap) | CLAUDE.md | View files are `.tsx`; no `.js`; no framework alternatives considered |
| Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules) | CLAUDE.md | All new view-body styling lands in `app/globals.css`; no per-component style files |
| Two new prod deps total: `next-themes@^0.4.6`, `cmdk@^1.1.1` | CLAUDE.md | **No new deps in Phase 3.** No syntax-highlighter library (hand-roll); no clipboard library (`navigator.clipboard.writeText`); no copy-to-clipboard library |
| Native `fetch` + `next: { revalidate }` for data — no SWR, no TanStack Query | CLAUDE.md | View `page.tsx` files call `getX()` from `lib/api.ts` (already wired with `next: { revalidate: 300 }`); silent fallback to seed data |
| Persistent shell at `app/(terminal)/layout.tsx` never unmounts on view switching | CLAUDE.md | View files (`app/components/views/<name>-view.tsx`) MUST be RSC; no `"use client"` at the view file level (Pitfall 9 / SHELL-02) |
| `app/layout.tsx` is a Server Component — only thin client islands carry `"use client"` | CLAUDE.md | Phase 3 adds exactly ONE client island: `<CopyButton/>` |
| Active view derived from `useSelectedLayoutSegment()` — never mirrored into Context or Zustand | CLAUDE.md | Views do NOT re-derive active state; the shell sidebar/breadcrumb already handles it (Phase 2) |
| `lib/routes.ts` is the single source of truth for the 7 routes | CLAUDE.md | Per-view metadata reads `description` + `pathname` from `ROUTES[i]`; no prose duplication |
| Brownfield discipline — same-commit delete-then-replace | CLAUDE.md | Phase 3 stubs in `app/(terminal)/<view>/page.tsx` get their bodies replaced in the same commit; the `.stub-body` CSS class becomes orphan and SHOULD be removed in `app/globals.css` (planner decision: clean up in metadata-enrichment wave) |
| Persistent resume download button in top bar at every viewport | CLAUDE.md | Already shipped Phase 2 (`top-bar.tsx`). Phase 3 adds about-view + contact-view CTAs that are **additional** to the top-bar button — they don't replace it |
| Sidebar file rows have plain-noun `aria-label` | CLAUDE.md | Already shipped Phase 2. Phase 3 extends this discipline to view-body affordances (see ARIA-label conventions table in UI-SPEC §"Copywriting Contract") |
| 5-second recruiter test is a real exit criterion | CLAUDE.md | About-view paint order matters: H1 + role + 3 stat cards + resume CTA must all be in the LCP frame |

## Architectural Responsibility Map

Phase 3 is single-tier (frontend RSC). The map confirms each capability stays inside the SSR/RSC tier without leaking to the client tier unnecessarily.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Per-view metadata (title/description/canonical) | Frontend Server (SSR) | — | Static `metadata` export resolves on the server before HTML streams; client never sees it as a runtime concern |
| View body rendering (about/projects/stack/etc.) | Frontend Server (SSR / RSC) | — | All view components are RSC; data resolved server-side via `getX()`; HTML is streamed |
| Data fetching (`getProfile`, `getProjects`, etc.) | Frontend Server (SSR / RSC) | API/Backend (silent fallback) | `lib/api.ts` calls fetch with `next: { revalidate: 300 }`; falls back to `lib/portfolio-data.ts` seed when backend unreachable |
| External link safety (`target="_blank" rel="noopener noreferrer"`) | Frontend Server (RSC) | — | Static HTML attribute; no client behavior. `<ExternalLink>` is RSC. |
| Inline SVG store badges | Frontend Server (RSC) | — | Static SVG markup; no runtime behavior. License-cited assets at build time. |
| Tech chips, kbd, prompt-line decoration | Frontend Server (RSC) | — | Static markup; no behavior |
| Copy-to-clipboard (Stack JSON, contact email, shipped store URLs) | Browser / Client | — | `navigator.clipboard.writeText` is a browser-only API; `useState` + `setTimeout` for label swap; the only Phase 3 client island |
| `aria-live` announcements for copy success | Browser / Client | — | DOM mutation triggers SR announcement; lives inside the `<CopyButton>` client island |
| `mailto:` protocol handler (contact view) | Browser / Client (UA) | — | Browser-native; no JS required; the `<a href="mailto:">` is RSC-rendered but the user-agent handles the protocol on click |
| Resume `download="..."` attribute | Frontend Server (RSC) → Browser | — | Static `<a download="...">` rendered RSC; browser handles the download on click |
| Sort logic (year desc / date desc) | Frontend Server (RSC) | — | Sort happens at render time inside view component (non-mutating spread + sort); no client-side sorting |
| Smoke tests (TEST-05) | Test environment (Vitest + jsdom) | — | Tests run in node + jsdom; views render synchronously when given props; data is fixture-shaped |

**Key insight:** Phase 3 has exactly **one** capability that crosses to the client tier: clipboard copy. Everything else is server-resolved, statically rendered, browser-handled, or test-environment. This validates the "one client island" budget and matches Pitfall 9's RSC-discipline requirement.

## Standard Stack

### Core (already installed — no new deps in Phase 3)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | ^15.5.15 (verified `package.json`) | App Router framework, RSC, metadata API, route groups | Locked Phase 1 (INFRA-01); no swap allowed [VERIFIED: package.json] |
| `react` | 19.1.0 (verified `package.json`) | RSC, fragments, useState (CopyButton only) | Locked Phase 1 [VERIFIED: package.json] |
| `react-dom` | 19.1.0 (verified `package.json`) | DOM rendering | Locked Phase 1 [VERIFIED: package.json] |
| `typescript` | 5.8.3 (verified `package.json`) | Strict mode types for views, primitives, props | Locked [VERIFIED: package.json] |
| `next-themes` | ^0.4.6 | Theme provider (NO Phase 3 use directly — already wired Phase 2) | Locked Phase 1 [VERIFIED: package.json] |
| `cmdk` | ^1.1.1 | Command palette (NO Phase 3 use directly — already wired Phase 2) | Locked Phase 1 [VERIFIED: package.json] |

### Testing (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vitest` | 3.1.4 | Test runner | [VERIFIED: package.json] |
| `@testing-library/react` | 16.2.0 | Component rendering for tests | [VERIFIED: package.json] |
| `@testing-library/jest-dom` | 6.6.3 | DOM matchers (`toBeInTheDocument`, `toHaveAttribute`) | [VERIFIED: package.json] |
| `@testing-library/user-event` | ^14.6.1 | User interaction simulation (e.g. CopyButton click — though TEST-05 may not need it) | [VERIFIED: package.json — added Phase 2 D-21] |
| `jsdom` | 26.1.0 | Browser-like DOM in tests | [VERIFIED: package.json] |

### Browser-native APIs (no library needed)

| API | Purpose | Phase 3 use |
|-----|---------|-------------|
| `navigator.clipboard.writeText(value)` | Copy-to-clipboard | `<CopyButton>` only [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText — D-05] |
| `mailto:` protocol | Email handler | Contact view email link |
| `<a download="...">` | Resume download | About view + contact view CTAs |
| `JSON.stringify(...)` | Stack JSON canonical string | Stack view content source |

### Alternatives Considered (and rejected)

| Instead of | Could Use | Verdict | Reason |
|------------|-----------|---------|--------|
| Hand-rolled JSON syntax highlight | `prismjs`, `shiki`, `react-syntax-highlighter` | **Rejected** | Violates "two new prod deps total" constraint (CLAUDE.md). Hand-rolled per handoff `app.jsx` lines 367–388 = ~25 lines of JSX with className + Fragment usage. |
| `navigator.clipboard.writeText` | `copy-to-clipboard`, `clipboard-polyfill` | **Rejected** | Browser-native API works in all modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+). Targets engineers + recruiters on modern devices — no need for legacy polyfill. [VERIFIED: MDN] |
| Per-route `generateMetadata` | Static `metadata` export | **Static `metadata` chosen** | D-17. No dynamic data needed for v1; static is faster (resolves at build time for SSG). Dynamic deferred to Phase 5 / SEO-03 (writing slug pages, OG images). |
| New CopyButton library | Hand-rolled component | **Hand-rolled** | One ~30-line component; library overhead unjustified. |
| `next/link` for project rows | Plain `<a>` (with `target="_blank"`) or `<ExternalLink>` | **`<ExternalLink>` (with discretionary `showGlyph={false}`)** | Project links are external (repos / live demos / case studies); SEO-05 enforced via primitive |

**Installation:** none — Phase 3 ships zero new deps.

**Version verification (per Nyquist):**
- `next ^15.5.15` — verified in `package.json` 2026-05-06; confirmed compatible with React 19 per Phase 1 research.
- All test deps verified in `package.json` 2026-05-06; setup file (`vitest.setup.ts`) registers jest-dom matchers.
- `Metadata` API and `alternates.canonical` resolution against `metadataBase` confirmed against [Next.js 15.5+ docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) (latest doc version 16.2.4 confirms behavior unchanged across 15.x).

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────── Client (Browser) ───────────────────────────┐
│                                                                          │
│  User navigates to /projects                                             │
│         │                                                                │
│         ▼                                                                │
│  Browser receives streamed HTML (no client-side data fetch)              │
│  +  Hydrates client islands: TopBar, Sidebar, CommandPalette,            │
│     LiveClock, Breadcrumb, Theme/Accent provider, CopyButton (per-view)  │
│         │                                                                │
│         ▼                                                                │
│  User clicks ⧉ copy button (stack view, contact view, or shipped row)    │
│         │                                                                │
│         ▼                                                                │
│  CopyButton (client) → navigator.clipboard.writeText(value)              │
│         │                                                                │
│         ▼                                                                │
│  Label swap to "copied ✓" for 1500ms; aria-live=polite announces         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────────── Server (Next.js App Router) ──────────────────────┐
│                                                                          │
│  Request /projects                                                       │
│         │                                                                │
│         ▼                                                                │
│  Resolve metadata (static export):                                       │
│    title: "projects/ — Bakytbek Tatibekov"                              │
│    description: ROUTES[1].description                                    │
│    alternates.canonical: "/projects" (resolved against metadataBase)     │
│         │                                                                │
│         ▼                                                                │
│  Render shell layout (PERSISTENT — already mounted from previous nav):   │
│    app/layout.tsx (root)                                                 │
│      └── app/(terminal)/layout.tsx (route group; never unmounts)         │
│            ├── TopBar (client island, hydrated)                          │
│            ├── Sidebar (client island, hydrated)                         │
│            ├── CommandPalette (client island, hydrated)                  │
│            └── <main>{children}</main>  ← only this segment changes      │
│                  │                                                       │
│                  ▼                                                       │
│           app/(terminal)/projects/page.tsx (RSC)                         │
│                  │                                                       │
│                  ├── export const metadata = {...}                       │
│                  │                                                       │
│                  └── async function ProjectsPage()                       │
│                        │                                                 │
│                        ▼                                                 │
│                  const projects = await getProjects()                    │
│                        │                                                 │
│                        ▼                                                 │
│                  return <ProjectsView projects={projects} />             │
│                        │                                                 │
│                        ▼                                                 │
│           app/components/views/projects-view.tsx (RSC)                   │
│                  │                                                       │
│                  ├── PromptLine (RSC primitive)                          │
│                  ├── If empty → empty-state line                         │
│                  └── Otherwise → list:                                   │
│                       <a className="projects-row" target="_blank"        │
│                          rel="noopener noreferrer">                      │
│                          ├── index "01."                                 │
│                          ├── name + summary                              │
│                          ├── TechChip[] (RSC primitive)                  │
│                          └── year/status/role                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌────────────────── Data Layer (lib/api.ts + portfolio-data.ts) ──────────┐
│                                                                          │
│  getProjects() → fetch(`${baseUrl}/api/projects`, {                      │
│                       next: { revalidate: 300 }                          │
│                  })                                                      │
│         │                                                                │
│         ├── 200 OK → return parsed Project[]                             │
│         ├── !ok → return PROJECTS (seed, empty array v1)                 │
│         └── throw → return PROJECTS (seed, empty array v1)               │
│                                                                          │
│  Seed data lives in lib/portfolio-data.ts:                               │
│    - PROFILE (real identity + email + 1 real social URL + 1 TODO)        │
│    - STACK (real, 4 categories)                                          │
│    - PROJECTS, EXPERIENCE, WRITING, SHIPPED (empty arrays v1)            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**Tracing the primary use case (recruiter loads `/`):**
1. Browser requests `/`.
2. Server renders root layout (RSC), terminal route-group layout (RSC; persistent shell).
3. Server resolves `app/(terminal)/page.tsx` metadata: `title: "about.md — Bakytbek Tatibekov"`, `description: "About — Sr. Software Engineer; bio, highlights, contact"`, `alternates.canonical: "/"`.
4. Server runs `await getProfile()` → silent fallback to seed `PROFILE`.
5. Server renders `<AboutView profile={PROFILE} />` (RSC) with H1 + role subline + bio paragraphs + 3 stat cards + resume CTA + ghost socials.
6. HTML streams to browser; LCP frame contains H1 + 3 accent stat values + resume CTA.
7. Client hydrates the persistent shell islands (TopBar resume button, Sidebar, CommandPalette).
8. Recruiter sees resume CTA + email at-a-glance within 5 seconds (constraint satisfied).

### Recommended Project Structure (Phase 3 additions)

```
app/
├── (terminal)/                       # route group (persistent shell)
│   ├── layout.tsx                    # Phase 2 — DO NOT MODIFY
│   ├── page.tsx                      # /  (about) — Phase 3: replace stub body
│   ├── page.test.tsx                 # NEW — TEST-05 smoke
│   ├── projects/
│   │   ├── page.tsx                  # Phase 3: replace stub body
│   │   └── page.test.tsx             # NEW — TEST-05 smoke
│   ├── stack/
│   │   ├── page.tsx                  # Phase 3: replace stub body
│   │   └── page.test.tsx             # NEW — TEST-05 smoke
│   ├── experience/
│   │   ├── page.tsx                  # Phase 3: replace stub body
│   │   └── page.test.tsx             # NEW — TEST-05 smoke
│   ├── writing/
│   │   ├── page.tsx                  # Phase 3: replace stub body
│   │   └── page.test.tsx             # NEW — TEST-05 smoke
│   ├── contact/
│   │   ├── page.tsx                  # Phase 3: replace stub body
│   │   └── page.test.tsx             # NEW — TEST-05 smoke
│   └── shipped/
│       ├── page.tsx                  # Phase 3: replace stub body
│       └── page.test.tsx             # NEW — TEST-05 smoke
├── components/
│   ├── primitives/
│   │   ├── prompt-line.tsx           # Phase 2 — DO NOT MODIFY
│   │   ├── tech-chip.tsx             # NEW — RSC
│   │   ├── kbd.tsx                   # NEW — RSC
│   │   ├── external-link.tsx         # NEW — RSC
│   │   ├── copy-button.tsx           # NEW — CLIENT (only Phase 3 client island)
│   │   ├── store-badge.tsx           # NEW — RSC (with planner-research SVG sourcing)
│   │   └── store-badge-assets/       # NEW — optional dir for separate SVG files
│   │       ├── app-store-badge.svg   # planner research item: source from Apple
│   │       └── google-play-badge.svg # planner research item: source from Google
│   ├── views/                        # NEW DIRECTORY
│   │   ├── about-view.tsx            # NEW — RSC
│   │   ├── projects-view.tsx         # NEW — RSC
│   │   ├── stack-view.tsx            # NEW — RSC
│   │   ├── experience-view.tsx       # NEW — RSC
│   │   ├── writing-view.tsx          # NEW — RSC
│   │   ├── contact-view.tsx          # NEW — RSC
│   │   └── shipped-view.tsx          # NEW — RSC
│   └── shell/                        # Phase 2 — DO NOT MODIFY
└── globals.css                       # EXTEND — add Phase 3 view + primitive classes
```

**Cross-view tests (TEST-05 cross-view spec):**
- Could live at `app/(terminal)/views.test.tsx` or `app/(terminal)/page-titles.test.tsx`. Planner picks; the requirement is one cross-view assertion exists.

### Pattern 1: Page fetches, View receives props (ARCHITECTURE.md Pattern 3)

**What:** `page.tsx` is responsible for data fetching; `<NameView/>` is a pure RSC that receives data as typed props.

**When to use:** Every Phase 3 view.

**Rationale:** Keeps view components unit-testable (pass fixture data, render). Aligns with ARCHITECTURE.md Pattern 3 ("page fetches, view receives props"). Single integration point per view between data layer and render layer.

**Example:**
```tsx
// app/(terminal)/projects/page.tsx (RSC)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { ProjectsView } from "@/app/components/views/projects-view";

const route = ROUTES[1]; // projects

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView projects={projects} />
    </>
  );
}
```

```tsx
// app/components/views/projects-view.tsx (RSC — no "use client")
import { TechChip } from "@/app/components/primitives/tech-chip";
import { ExternalLink } from "@/app/components/primitives/external-link";
import type { Project } from "@/lib/types";

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  if (projects.length === 0) {
    return <div className="empty-state">total 0 · (no projects committed yet)</div>;
  }
  const sorted = [...projects].sort((a, b) => Number(b.year) - Number(a.year));
  return (
    <>
      <div className="projects-subhead">
        total {sorted.length} · sorted by year desc
      </div>
      <ul className="projects-list">
        {sorted.map((p, i) => (
          <li key={p.name}>
            <ExternalLink
              href={p.link}
              className="projects-row"
              showGlyph={false}
              aria-label={`${p.name}: ${p.summary} (opens in new tab)`}
            >
              <span className="projects-row-index">{String(i + 1).padStart(2, "0")}.</span>
              {/* ... name, summary, chips, year, status, role */}
            </ExternalLink>
          </li>
        ))}
      </ul>
    </>
  );
}
```

[CITED: 03-UI-SPEC.md §V2; 03-CONTEXT.md D-19 wave 3; ARCHITECTURE.md Pattern 3]

### Pattern 2: Per-view metadata via static export (D-16, D-17)

**What:** Each `page.tsx` exports a `metadata: Metadata` object; reads `description` and `pathname` from `lib/routes.ts`.

**When to use:** Every Phase 3 page.tsx.

**Rationale:** Single source of truth for descriptions (no prose duplication between sidebar/palette/sitemap/metadata). Static is faster than dynamic (resolves at build-time for SSG). `metadataBase` is set at root (Phase 1 / ROUTE-03), so relative `pathname` like `/projects` resolves to absolute canonical URLs at build time.

**Example:**
```tsx
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";

const route = ROUTES[2]; // stack

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};
```

**Resolved output (from Next.js docs URL composition table):**
- `metadataBase = new URL("https://bakytbek.dev")` (set in `app/layout.tsx` Phase 1)
- `alternates.canonical = "/stack"` resolves to `https://bakytbek.dev/stack`
- HTML: `<link rel="canonical" href="https://bakytbek.dev/stack" />`

[CITED: https://nextjs.org/docs/app/api-reference/functions/generate-metadata — "URL Composition" section confirms `/payments` and `./payments` and `payments` all resolve to `https://acme.com/payments` against `metadataBase`]

**Alternative considered:** Use `./` (which auto-resolves to current pathname). Equivalent output. **Choice: explicit `route.pathname`** because (a) it ties to the single source of truth in `lib/routes.ts`, (b) survives a future refactor that decouples `route.pathname` from filesystem location, (c) reads naturally as "this route's canonical is its known pathname".

### Pattern 3: Shared primitive — RSC by default, client only when needed

**What:** Primitives in `app/components/primitives/` are RSC by default; `"use client"` is added only when the component depends on browser APIs, state, or effects.

**When to use:** All 5 new Phase 3 primitives.

**Phase 3 distribution:**

| Primitive | RSC or Client? | Reason |
|-----------|---------------|--------|
| `<TechChip>` | RSC | Static span wrapper |
| `<Kbd>` | RSC | Static `<kbd>` wrapper |
| `<ExternalLink>` | RSC | Renders `<a target="_blank" rel="noopener noreferrer">` — static attributes |
| `<StoreBadge>` | RSC | Renders inline SVG inside `<ExternalLink>` — static |
| `<CopyButton>` | **CLIENT** | Uses `navigator.clipboard`, `useState`, `setTimeout` |

**Pitfall avoided:** Adding `"use client"` to `<ExternalLink>` would force every consumer (the 7 view files) into the client bundle, evaporating RSC benefits across the app (Pitfall 9). Only `<CopyButton>` crosses the client boundary.

[CITED: PITFALLS.md Pitfall 9; SHELL-02; UI-SPEC §"Component Architecture Contract"]

### Pattern 4: Empty-state via length check (D-01, D-02, D-03)

**What:** Each view that consumes a potentially-empty array (`projects-view`, `experience-view`, `writing-view`, `shipped-view`) checks `array.length === 0` and renders the locked empty-body string when true.

**When to use:** All four views above. **Not** about-view, stack-view, contact-view (these always have real data per `lib/portfolio-data.ts`).

**Implementation:**
```tsx
if (writing.length === 0) {
  return <div className="empty-state">// no posts yet — follow github.com/beckinfonet for code-as-content.</div>;
}
```

**Empty-state body strings (LOCKED — verbatim, no improvisation):**
- `/projects`: `total 0 · (no projects committed yet)`
- `/experience`: `(no commits to experience.log yet)`
- `/writing`: `// no posts yet — follow github.com/beckinfonet for code-as-content.`
- `/shipped`: `total 0 · (no apps shipped to stores yet)`

**CSS:** Single shared `.empty-state` class (13px / `--muted` / `margin-top: 14px`). [CITED: 03-UI-SPEC.md §"Empty-State Contract"]

**No** branches on auth, network, or backend availability — `lib/api.ts` already silently falls back to seed data on any failure.

### Anti-Patterns to Avoid

- **`"use client"` at the top of any view file (`app/components/views/<name>-view.tsx`).** Forces the view + all imported primitives + all data props into the client bundle. Pitfall 9. Phase 3 client island count is exactly 1 (`<CopyButton>`).
- **`"use client"` at the top of any `app/(terminal)/<view>/page.tsx`.** Same as above; also breaks `metadata` export (only Server Components can export metadata) [CITED: Next.js metadata docs — "The `metadata` object and `generateMetadata` function exports are **only supported in Server Components**"].
- **Calling `getX()` from inside the view component instead of from the page.** Couples view to API and breaks unit testability. Pattern 1 (page fetches, view receives props) is the correct boundary [CITED: ARCHITECTURE.md Pattern 3].
- **Mutating `PROJECTS.sort(...)` / `EXPERIENCE.sort(...)` / etc.** These are module-level constants from `lib/portfolio-data.ts`; mutation in one view affects others. Use `[...arr].sort(...)` (non-mutating spread).
- **Re-deriving active route inside a view.** The shell already does this (Phase 2 sidebar via `useSelectedLayoutSegment()`). Views are stateless against navigation.
- **Using raw `<a target="_blank">` in view code.** Bypasses SEO-05 enforcement. Use `<ExternalLink>` which encapsulates `rel="noopener noreferrer"` [CITED: 03-CONTEXT.md D-08; SEO-05]. The grep `grep -rE 'target="_blank"' app/components/views/` should return zero hits.
- **Adding new prod dependencies.** CLAUDE.md cap is two: `next-themes` and `cmdk`. Phase 3 ships zero new deps. No syntax-highlighter library; no clipboard library.
- **Introducing new `TODO:` strings outside `lib/portfolio-data.ts`.** INFRA-05 prebuild grep includes `TODO`; new view code must be free of placeholder markers. Phase 6 fills the existing `lib/portfolio-data.ts` markers.
- **Hand-rolling `aria-live` regions inconsistently.** Reuse Phase 2's pattern: `<span role="status" aria-live="polite" className="sr-only">{copied ? "Copied to clipboard" : ""}</span>`. The `.sr-only` class already exists in `app/globals.css` (line 202) [CITED: app/globals.css line 202].
- **Inlining store-badge SVGs without official sourcing or JSDoc citation.** Apple Marketing Identity Guidelines and Google Play Brand Guidelines are legally binding for these assets. Brand misuse risks takedown.
- **Dynamic metadata (`generateMetadata`) for the seven views.** Static `metadata` is sufficient and faster (D-17). `generateMetadata` is for Phase 5 / SEO-03 (writing slug pages, OG images).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Per-route metadata uniqueness | Custom build-time string-de-dup script | Static `metadata.title` per `page.tsx` + cross-view Vitest test | Next.js 15 metadata API + a 5-line uniqueness assertion is the canonical pattern (Pitfall 1 mitigation) |
| External-link safety | Per-view inline `<a target="_blank" rel="noopener noreferrer">` | `<ExternalLink>` primitive | Drift across 7 views guarantees one will eventually miss `rel="noopener noreferrer"`. Single-point-of-truth primitive prevents this (D-08; SEO-05) |
| Copy-to-clipboard | Custom `document.execCommand('copy')` fallback or copy library | `navigator.clipboard.writeText` | Browser-native; supported in all modern browsers; D-05 [CITED: MDN Clipboard API] |
| Sitemap drift across views | Per-view sitemap entry edits | Phase 2 already iterates `lib/routes.ts` (`app/sitemap.ts`) | Already correct from Phase 2 (`app/sitemap.test.tsx` asserts length matches `ROUTES`); Phase 3 must NOT regress this. Adding an 8th view = single-line edit in `lib/routes.ts` |
| JSON syntax highlighting in `<pre>` | Importing `prismjs`, `shiki`, `highlight.js`, etc. | Hand-rolled per handoff `app.jsx` lines 367–388 | Three CSS classes (`.json-key`, `.json-string`, `.json-punc`) + `STACK.map(...)` + React Fragments = ~25 lines. Adding any of those libs violates "two new prod deps" cap |
| Active-route detection inside views | `usePathname()` in view components | Shell sidebar (Phase 2) already derives active state via `useSelectedLayoutSegment()` | Views are stateless against navigation. ARCHITECTURE.md Anti-Pattern: do not duplicate active-state derivation [CITED: CLAUDE.md "Active view derived from `useSelectedLayoutSegment()` — never mirrored"] |
| Loading skeletons / spinners between view switches | `<Suspense fallback>` with skeleton component | Nothing — all views are RSC; data is server-resolved before HTML streams | UI-SPEC §"Empty-State Contract" item 5: "No skeletons, no spinners, no 'loading...' UI" |
| Toast notifications for copy success | Toast library or custom toast infrastructure | `aria-live="polite"` region inside `<CopyButton>` (D-07) | Two consumers (Stack + contact + shipped); toast infra overkill |
| Custom data-fetching layer for views | Per-view `useEffect + fetch` | `await getX()` from `lib/api.ts` in `page.tsx` (RSC) | Already wired Phase 1 (DATA-04); silent fallback to `portfolio-data.ts` seed; ISR via `next: { revalidate: 300 }` |
| Custom focus-visible / focus restoration | Per-component focus styles | Inherited Phase 2 `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` | A11Y-02 already covers all interactive elements; CopyButton inherits |
| Inline app-store badge re-creation | Custom SVG paths approximating Apple/Google badges | **Official Apple + Google brand-asset SVGs** sourced at plan-phase | License-mandatory. Recreations are not acceptable per [Apple Marketing Identity Guidelines](https://developer.apple.com/app-store/marketing/guidelines/) and [Google Play Badge Guidelines](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/) |

**Key insight:** Phase 3 is a "wire existing pieces together" phase. Every component pattern, every CSS class, every test setup, every data-flow has a precedent in the existing codebase or in the Phase 2 deliverables. The temptation to custom-build is the highest risk: each "small" custom solution adds drift, surface area, and test debt.

## Common Pitfalls

### Pitfall 1: Per-route metadata uniqueness (Pitfall 1 in PITFALLS.md)

**What goes wrong:** Adding 7 routes with the same metadata title (or letting them inherit from `app/layout.tsx`). Google sees seven duplicate-title pages; LinkedIn unfurl shows "Bakytbek Tatibekov" for every route.

**Why it happens:** Convenience inheritance. Easy to forget per-route metadata when racing through 7 nearly-identical files.

**Phase 3 mitigation:** D-16 LOCKED. Each `page.tsx` exports a static `metadata` with unique `title` (already locked Phase 2 D-12 — verified in 7 stub files). Phase 3 enriches with `description` (from `ROUTES[i].description` — verified populated) and `alternates.canonical`. Cross-view test asserts `Set(allTitles).size === 7` (D-18).

**Warning signs:**
- `grep -l "export const metadata" app/(terminal)/*/page.tsx app/(terminal)/page.tsx | wc -l` ≠ 7
- Cross-view title uniqueness test fails
- Build log shows `metadataBase property in metadata export is not set` (already resolved Phase 1)

**How to avoid:** All 7 stubs already have `title`; the metadata-enrichment wave (Wave 4) just adds `description` + `alternates.canonical`. Cross-view spec catches regressions.

### Pitfall 2: Client-component boundary collapse on view files (Pitfall 9 in PITFALLS.md)

**What goes wrong:** Adding `"use client"` at the top of a view file (e.g. `app/components/views/stack-view.tsx`) because "the stack view has a copy button". This drags the view + all imported primitives into the client bundle, costing ~20-40 Lighthouse points.

**Why it happens:** Confusion about where to put the directive. The button needs to be client; developers wrongly extend that to the parent.

**Phase 3 mitigation:** D-05 LOCKED. CopyButton is the ONLY client island. View files import `<CopyButton>` and instantiate it inline; the directive lives ONLY in `app/components/primitives/copy-button.tsx`.

**Warning signs:**
- `grep -l '^"use client"' app/components/views/` returns ANY hits (it must return zero)
- Per-view bundle delta > 10KB gzipped
- React DevTools shows the entire view tree as client-rendered (not "Server Component" badge)

**How to avoid:** Code review check: every file under `app/components/views/` and every `app/(terminal)/**/page.tsx` MUST start without `"use client"`. The TEST-05 spec also indirectly catches this (rendering a client component as if RSC will throw at import time in some cases).

### Pitfall 3: Sort logic mutating shared module-level constants

**What goes wrong:** Calling `PROJECTS.sort(...)` or `EXPERIENCE.sort(...)` directly inside a view. The sort happens once at module load time; subsequent renders see the previously-sorted state. Worse, the next time the seed array is read elsewhere (e.g. the cross-view test, or the palette items), it carries the mutation.

**Why it happens:** Shorthand `.sort()` is mutating; developers reach for it without a spread.

**Phase 3 mitigation:** Locked discretion in 03-CONTEXT.md: "All sort at render time inside the view component — non-mutating: `[...PROJECTS].sort((a,b) => Number(b.year) - Number(a.year))`."

**Warning signs:** Test failures where re-rendering a view changes the order of items; failures in unrelated tests that depended on the original seed order.

**How to avoid:** Code review enforces `[...arr].sort(...)`. Eslint `no-param-reassign` does NOT cover this; manual review is the gate.

### Pitfall 4: Sitemap drift if a view 404s (or the route group breaks)

**What goes wrong:** A bug in a view (broken import, syntax error) makes that route 404. But `app/sitemap.ts` still lists the URL. Search Console flags "Submitted URL not found (404)".

**Why it happens:** Sitemap is hardcoded to `ROUTES`; route stability isn't verified.

**Phase 3 mitigation:** TEST-05 smoke spec per view asserts the page **renders without throwing**. If any view breaks, the corresponding spec fails before merge.

**How to avoid:** TEST-05 is the gate. CI runs `vitest run` on every PR (Phase 1 / INFRA-03).

### Pitfall 5: Stack JSON `<CopyButton>` value drifts from `<pre>` rendering

**What goes wrong:** The `<pre>` block renders one stringification of `STACK`; the `<CopyButton value={...}>` is given a different string. Recruiter copies, pastes, gets something visually different from what was on screen.

**Why it happens:** Two separate `JSON.stringify` calls or two separate hand-rolled stringifications.

**Phase 3 mitigation:** Locked discretion in 03-CONTEXT.md: derive a single canonical string ONCE at the top of `stack-view.tsx`, use it for both the visible `<pre>` AND the `<CopyButton value>`:
```tsx
const stackJsonString = JSON.stringify(
  Object.fromEntries(STACK.map(c => [c.category, c.items])),
  null,
  2
);
```
The hand-rolled syntax-highlighted JSX iterates over the same `STACK` array using the same shape, so the visible text matches `stackJsonString` byte-for-byte.

**How to avoid:** Single canonical string, shared by both consumers. Smoke test optional: `expect(stackJsonString).toContain('"languages"')` — not required for TEST-05 but a nice-to-have.

### Pitfall 6: Writing-view `Date.parse` returns `NaN` for free-form dates

**What goes wrong:** `WRITING[i].date` is a free-form string ("April 2026", "March 2026"). `Date.parse("April 2026")` returns `NaN` in some browsers / locales. Sorting against `NaN` throws or produces undefined order.

**Why it happens:** No constraint on the `date` field format in `lib/types.ts`.

**Phase 3 mitigation:** Locked discretion: defensive fallback. If any `Date.parse` returns `NaN`, fall back to array order without throwing:
```tsx
const sorted = WRITING.every(w => !Number.isNaN(Date.parse(w.date)))
  ? [...WRITING].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  : WRITING;
```
v1 ships empty per D-04, so this code path is dormant until Phase 6 fills.

**How to avoid:** Phase 6 should constrain the format (ISO-style or "Mon YYYY" parseable); for now, v1 protects itself.

### Pitfall 7: Store-badge license violation

**What goes wrong:** Inlining a hand-drawn approximation of the Apple "Download on the App Store" badge or Google "Get it on Google Play" badge. Both companies' brand guidelines prohibit recreations.

**Why it happens:** It's faster to draw a rectangle with text than to fetch the official SVG.

**Phase 3 mitigation:** D-13 LOCKED. **Planner research item:** at plan-phase time, fetch the current SVG sources from:
- Apple: [Apple App Store Marketing Resources](https://developer.apple.com/app-store/marketing/guidelines/) → "Download on the App Store" badge SVG (black variant, English)
- Google: [Google Play Partner Marketing Hub Badge Guidelines](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/) → "Get it on Google Play" badge SVG (English, minimum 135px width)

Commit the SVGs (either as separate `.svg` files in `app/components/primitives/store-badge-assets/` or inline in `store-badge.tsx`), and add a JSDoc block citing both source URLs and the date the SVG was sourced. License compliance includes:
- No recoloring (badges keep their official colors regardless of theme)
- No resizing below the minimum widths (App Store ≥120px recommended, Google Play ≥135px required)
- No modification of artwork; do not remove the gray border on Apple's black badge
- The "App Store" service mark always appears in English (Apple)

[CITED: Apple [licensing-trademarks](https://developer.apple.com/licensing-trademarks/) — "Apple grants you a limited, non-exclusive, non-transferable, royalty-free, worldwide license to use the App Store badge for Apple-branded products running iOS, watchOS, tvOS, or macOS only in connection with applications available on the App Store and only while you are a member of the Apple Developer Program."]

**How to avoid:** Plan-phase research is mandatory; checker validates JSDoc presence and SVG file presence before plan executes. If the planner cannot fetch the assets at plan time (network issue, account requirements), the planner MUST escalate; do NOT proceed with a recreation.

### Pitfall 8: External-link grep enforcement fails for projects-row / contact "github ↗" / store badges

**What goes wrong:** UI-SPEC SEO-05 enforcement is `grep -rE 'target="_blank"' app/components/views/` returns zero hits. But three views legitimately need exceptions:
1. **Projects-row** — entire row is the link (large click target). UI-SPEC says: use `<ExternalLink showGlyph={false}>` OR raw `<a>` with comment.
2. **Contact-view footer "github ↗"** — handoff hardcodes `↗` in the visible text. Using `<ExternalLink>` doubles the arrow (visible: `github ↗ ↗`). Solution: `<ExternalLink showGlyph={false}>github ↗</ExternalLink>`.
3. **Store badges** — official artwork already signals external; trailing `↗` clashes with brand. Solution: `<ExternalLink showGlyph={false}>` wrapping the SVG.

**Phase 3 mitigation:** D-11 + UI-SPEC §"Implementation note" — add `showGlyph?: boolean` (default `true`) to `<ExternalLink>`. Three callsites use `showGlyph={false}`. SEO-05 enforcement (grep `target="_blank"` in view code) returns zero hits because all three callsites use the primitive — `target="_blank"` lives in the primitive, not the view.

**Warning sign:** Grep returns hits — means a developer wrote raw `<a target="_blank">` in a view. Code review must flag.

### Pitfall 9: TEST-05 spec breaks because page is async (RSC)

**What goes wrong:** `app/(terminal)/projects/page.tsx` is an `async function ProjectsPage()` (RSC). The naive test `render(<ProjectsPage />)` doesn't await the async function; React rendering doesn't know how to render a Promise.

**Why it happens:** Vitest + React Testing Library don't natively render async server components. RSC support in test environments is still maturing.

**Phase 3 mitigation:** Two viable approaches:

**Option A (recommended): test the view component, mock the page's data fetch.** The view (`<ProjectsView projects={...}/>`) is synchronous RSC; render it directly with fixture props. Separately import the page module for its `metadata` export and assert the title.
```tsx
import { metadata } from "./page";
import { ProjectsView } from "@/app/components/views/projects-view";

test("projects page metadata title is locked string", () => {
  expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov");
});

test("projects view renders empty state when no projects", () => {
  render(<ProjectsView projects={[]} />);
  expect(screen.getByText(/no projects committed yet/i)).toBeInTheDocument();
});
```

**Option B: render the async page via `await` (some test environments support this).** Less standard; varies by Vitest version and React build flags.

**Phase 3 recommendation:** Option A. The TEST-05 spec asserts (a) `metadata.title` matches the locked Phase 2 D-12 string, and (b) the view component contains the prompt-line text. The render path uses the view component directly with empty arrays as props (matches v1's actual data state). [CITED: 03-UI-SPEC.md TEST-05 examples; D-18]

**Concrete spec template:**
```tsx
// app/(terminal)/projects/page.test.tsx
import { render, screen } from "@testing-library/react";
import { metadata } from "./page";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { ProjectsView } from "@/app/components/views/projects-view";

describe("/projects", () => {
  test("metadata title is locked string", () => {
    expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov");
  });

  test("renders prompt-line via PromptLine primitive", () => {
    render(<PromptLine cmd="ls -la projects/" />);
    expect(screen.getByText("ls -la projects/")).toBeInTheDocument();
  });

  test("view renders without throwing on empty data", () => {
    render(<ProjectsView projects={[]} />);
    expect(screen.getByText(/no projects committed yet/i)).toBeInTheDocument();
  });
});
```

### Pitfall 10: About-view stat cards expect 3 entries but Phase 3 ships against TODO-marker fallbacks

**What goes wrong:** `PROFILE.highlights` ships v1 with 3 entries `{ value: "TODO", label: "TODO: stat label N" }`. The view renders all 3 as stat cards with literal `"TODO"` text. INFRA-05 grep catches this on production builds.

**Why it happens:** Phase 6 fills the real values; Phase 3 ships against the placeholder.

**Phase 3 mitigation:** This is **expected** and intentional per D-09 / D-10 of Phase 1. Phase 3 view code reads `PROFILE.highlights` AS-IS without defensive logic. The build only fails when someone tries to deploy to production with TODO markers (INFRA-05). Local dev + tests pass freely.

**Warning sign:** A Phase 3 dev tries to "fix" the TODOs by writing real bio content. That content lives in Phase 6 (CONTENT-01..07). Phase 3 ships the structure; Phase 6 fills it.

### Pitfall 11: `text-decoration: underline` on hover collides with `<ExternalLink>` opacity hover

**What goes wrong:** Phase 2 `app/globals.css` line 99–101 sets `a:hover { text-decoration: underline; }`. UI-SPEC D-09 says `<ExternalLink>` has `hover opacity 0.85`. Without explicit override, both apply: links get underlined AND fade.

**Why it happens:** Cascading rules; the underline is global; Phase 3 wants opacity-only on the primitive.

**Phase 3 mitigation:** UI-SPEC §3 ExternalLink "Visual contract" notes: "if the executor finds the underline conflicts with the visual intent, the rule may be refined in `app/globals.css` so `a:hover { opacity: 0.85; text-decoration: underline; }`." Translation: the global rule may need amending, but **only if the visual conflict is observed** during executor build. Default is to keep both behaviors (they're not actually conflicting).

**How to avoid:** Build the primitives wave first (Wave 1), visually verify against handoff screenshots, decide. Document the decision in the wave's commit message.

## Code Examples

Verified patterns from official sources and existing Phase 2 code.

### Per-view static metadata (D-16)

```tsx
// app/(terminal)/<route>/page.tsx
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";

const route = ROUTES[N]; // pick the right index

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

// Source: Next.js metadata docs (verified 2026-05-06):
//   https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// metadataBase set in app/layout.tsx Phase 1 / ROUTE-03 → relative pathname
// resolves to absolute canonical URL at build time.
```

### Page → View pattern (Pattern 1)

```tsx
// app/(terminal)/projects/page.tsx (RSC; NO "use client")
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { ProjectsView } from "@/app/components/views/projects-view";

const route = ROUTES[1];

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView projects={projects} />
    </>
  );
}
```

### `<ExternalLink>` primitive (RSC, D-08..D-11)

```tsx
// app/components/primitives/external-link.tsx (NO "use client")
import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  /** Suppress the trailing ↗ glyph (used by StoreBadge, projects-row, contact "github ↗"). */
  showGlyph?: boolean;
  /** Optional ARIA label override. */
  "aria-label"?: string;
}

export function ExternalLink({
  href,
  className,
  children,
  showGlyph = true,
  "aria-label": ariaLabel
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
      {showGlyph && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}
```

### `<TechChip>` primitive (RSC)

```tsx
// app/components/primitives/tech-chip.tsx (NO "use client")
import type { ReactNode } from "react";

interface TechChipProps {
  children: ReactNode;
}

export function TechChip({ children }: TechChipProps) {
  return <span className="tech-chip">{children}</span>;
}
```

### `<Kbd>` primitive (RSC)

```tsx
// app/components/primitives/kbd.tsx (NO "use client")
import type { ReactNode } from "react";

interface KbdProps {
  children: ReactNode;
}

export function Kbd({ children }: KbdProps) {
  return <kbd className="kbd">{children}</kbd>;
}
```

### `<CopyButton>` primitive (CLIENT — only Phase 3 client island)

```tsx
// app/components/primitives/copy-button.tsx
"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  ariaLabel: string;
  idleLabel?: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyButton({
  value,
  ariaLabel,
  idleLabel = "⧉ copy",
  copiedLabel = "copied ✓",
  className
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent failure — clipboard API may be unavailable in some contexts
      // (e.g. insecure origins). v1 does not surface an error UI.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={ariaLabel}
        className={`copy-button${copied ? " copy-button--confirmed" : ""}${className ? " " + className : ""}`}
      >
        {copied ? copiedLabel : idleLabel}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
```

### `<StoreBadge>` primitive (RSC, with planner-research SVG)

```tsx
// app/components/primitives/store-badge.tsx (NO "use client")
import { ExternalLink } from "./external-link";

interface StoreBadgeProps {
  platform: "ios" | "android";
  href: string;
  appName: string;
}

/**
 * Inline SVG App Store / Google Play badges.
 *
 * SVG sources (sourced YYYY-MM-DD by planner research item — D-13):
 *   - Apple "Download on the App Store" (black, English):
 *     https://tools.applemediaservices.com/app-store/
 *   - Google "Get it on Google Play" (black/green, English, ≥135px):
 *     https://play.google.com/intl/en_us/badges/
 *
 * License compliance per:
 *   - Apple Marketing Identity Guidelines:
 *     https://developer.apple.com/app-store/marketing/guidelines/
 *   - Google Play Brand Guidelines:
 *     https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/
 *
 * No recoloring, no resizing below platform minimums, no modifications.
 */
export function StoreBadge({ platform, href, appName }: StoreBadgeProps) {
  const ariaLabel =
    platform === "ios"
      ? `Open ${appName} on App Store`
      : `Open ${appName} on Google Play`;
  return (
    <ExternalLink
      href={href}
      className="store-badge-link"
      showGlyph={false}
      aria-label={ariaLabel}
    >
      {platform === "ios" ? <AppStoreSVG /> : <GooglePlaySVG />}
    </ExternalLink>
  );
}

// Stub — planner replaces with official SVG path data sourced at plan-phase
function AppStoreSVG() {
  return (
    <svg
      role="img"
      aria-hidden="true"
      width="135"
      height="40"
      viewBox="0 0 135 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official Apple App Store badge SVG path data — sourced YYYY-MM-DD */}
    </svg>
  );
}

function GooglePlaySVG() {
  return (
    <svg
      role="img"
      aria-hidden="true"
      width="135"
      height="40"
      viewBox="0 0 135 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official Google Play badge SVG path data — sourced YYYY-MM-DD */}
    </svg>
  );
}
```

### TEST-05 smoke spec template

```tsx
// app/(terminal)/projects/page.test.tsx
import { render, screen } from "@testing-library/react";
import { metadata } from "./page";
import { ProjectsView } from "@/app/components/views/projects-view";

describe("/projects view", () => {
  test("page metadata title matches locked string", () => {
    expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov");
  });

  test("page metadata description sourced from ROUTES", () => {
    expect(metadata.description).toBeTruthy();
    expect(typeof metadata.description).toBe("string");
  });

  test("page metadata alternates.canonical is /projects", () => {
    expect((metadata.alternates as any)?.canonical).toBe("/projects");
  });

  test("view renders empty-state when no projects", () => {
    render(<ProjectsView projects={[]} />);
    expect(screen.getByText(/no projects committed yet/i)).toBeInTheDocument();
  });

  test("view renders project rows when projects array is populated", () => {
    const fixture = [{
      name: "Test Project",
      year: "2025",
      status: "shipped",
      summary: "A test project for smoke spec",
      tech: ["TypeScript"],
      role: "lead",
      link: "https://example.com"
    }];
    render(<ProjectsView projects={fixture} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });
});
```

### Cross-view title uniqueness spec

```tsx
// app/(terminal)/views.test.tsx (or app/(terminal)/page-titles.test.tsx)
import { metadata as aboutMeta } from "./page";
import { metadata as projectsMeta } from "./projects/page";
import { metadata as stackMeta } from "./stack/page";
import { metadata as experienceMeta } from "./experience/page";
import { metadata as writingMeta } from "./writing/page";
import { metadata as contactMeta } from "./contact/page";
import { metadata as shippedMeta } from "./shipped/page";

describe("Per-view metadata uniqueness (Pitfall 1 mitigation)", () => {
  test("all 7 view titles are unique", () => {
    const titles = [
      aboutMeta.title,
      projectsMeta.title,
      stackMeta.title,
      experienceMeta.title,
      writingMeta.title,
      contactMeta.title,
      shippedMeta.title
    ];
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).toHaveLength(7);
  });

  test("all 7 view canonical paths are unique", () => {
    const paths = [
      (aboutMeta.alternates as any)?.canonical,
      (projectsMeta.alternates as any)?.canonical,
      (stackMeta.alternates as any)?.canonical,
      (experienceMeta.alternates as any)?.canonical,
      (writingMeta.alternates as any)?.canonical,
      (contactMeta.alternates as any)?.canonical,
      (shippedMeta.alternates as any)?.canonical
    ];
    expect(new Set(paths).size).toBe(paths.length);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/_app.tsx`) | App Router with route groups + RSC default | Next.js 13.4 (2023-05) | Phase 3 uses App Router exclusively; route group `(terminal)` provides persistent shell |
| `getServerSideProps` / `getStaticProps` | RSC + native `fetch` with `next: { revalidate }` | Next.js 13.4 | `lib/api.ts` already uses this pattern (Phase 1) |
| `Head` from `next/head` | `metadata` export / `generateMetadata` | Next.js 13.2 | All Phase 3 metadata uses static export |
| `target="_blank"` without `rel` | `target="_blank" rel="noopener noreferrer"` (security) | OWASP standard, ~2017 | `<ExternalLink>` enforces |
| `document.execCommand('copy')` | `navigator.clipboard.writeText` (async, secure) | Clipboard API in all modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+) | Phase 3 uses clipboard API directly; no polyfill |
| Class components for state | Function components + hooks (`useState`, `useEffect`) | React 16.8 (2019) | `<CopyButton>` uses `useState` |

**Deprecated/outdated:**
- `themeColor` and `colorScheme` in `metadata` export — deprecated as of Next.js 14; use `viewport` configuration instead [CITED: Next.js metadata docs version history]. Phase 3 does not touch these.
- `next/link` for external URLs — no benefit over plain `<a>` for cross-origin links; `<ExternalLink>` uses `<a>` directly.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The cross-view metadata uniqueness test can co-locate at `app/(terminal)/views.test.tsx` (a sibling of `layout.tsx`) without Vitest treating it as a Next.js page | Code Examples → cross-view spec | LOW — if Vitest globs include `**/*.test.tsx` (verified default), the location is fine. Alternative: place at root `app/views.test.tsx`. Planner picks final location. |
| A2 | `Date.parse("April 2026")` returns `NaN` consistently across Node + Chromium + Firefox | Pitfall 6 | LOW — JavaScript `Date.parse` of a free-form month-year string is implementation-defined per ECMA-262; the defensive `Number.isNaN(...)` fallback handles both branches gracefully. v1 ships empty (D-04), so the code path is dormant. |
| A3 | The CSS `text-decoration: underline` on `a:hover` (Phase 2 globals.css line 100) does NOT visually conflict with the D-09 `opacity: 0.85` hover for `<ExternalLink>` | Pitfall 11 | LOW — UI-SPEC §3 explicitly notes the executor may refine the rule if needed during the primitives wave. Decision can be made at execution time. |
| A4 | Vitest + `@testing-library/react` 16 can render synchronous server components (the view component layer) without extra config | Code Examples → TEST-05 spec template | MEDIUM — if React 19 RSC behavior in jsdom diverges, the planner may need to add a Vitest config tweak. Phase 2 successfully tests `Sidebar` (a client component) and the sitemap (a synchronous function); the view-component layer (synchronous RSC pattern) should work identically. **Recommended mitigation:** Wave 2 (about-view first slice) validates this end-to-end; if it breaks, the entire test approach is reconsidered before scaling to 6 more views. |
| A5 | `metadata.alternates.canonical = "/projects"` resolves to absolute `https://<host>/projects` because `metadataBase` is set in root `app/layout.tsx` | Pattern 2 | LOW — verified against Next.js 15 docs URL Composition table; verified `metadataBase` was added Phase 1 / ROUTE-03 (per ROADMAP Phase 1 plan 01-03). |

**If this table grows, the discuss-phase / plan-phase has more confirmation work to do.** All A-rows above are LOW or MEDIUM risk and can be addressed at execute-time or by Wave 2 vertical-slice validation.

## Open Questions (RESOLVED)

1. **Cross-view title uniqueness spec location**
   - RESOLVED: Plan 12 places the spec at `app/(terminal)/views.test.tsx` (sibling of `layout.tsx`). Vitest picks it up via the default `**/*.test.tsx` glob; co-location signals it tests the route group as a whole.

2. **Should `app/globals.css` `.stub-body` class be removed in Phase 3?**
   - RESOLVED: Plan 04 deletes `.stub-body` in the Wave 2 globals.css append. Plan 05 also removes the `<p className="stub-body">` line from `app/(terminal)/page.tsx` when it rewrites the page body — same-commit replacement preserved.

3. **Apple / Google badge SVG sourcing during plan-phase: account-required or public?**
   - RESOLVED: Plan 03 is `autonomous: false`. Task 1 of Plan 03 has the user download official SVGs to `public/badges/`; Task 2 wraps them in the `StoreBadge` primitive. JSDoc citations record source URLs and sourcing date.

4. **`<ExternalLink>` `aria-label` propagation**
   - RESOLVED: Plan 01 defines `<ExternalLink>` with an explicit `aria-label?: string` prop (not `{...rest}` spread). Aligns with D-08's minimal API.

5. **`copy-button.tsx` `setTimeout` cleanup**
   - RESOLVED: Plan 02 implements `useRef` for the timer ID + `useEffect` cleanup. Avoids React unmount-warning during navigation mid-swap.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All build / test | ✓ | 22.x (per `package.json` `engines.node`) | — |
| `next` | Framework | ✓ | ^15.5.15 | — |
| `react` | UI | ✓ | 19.1.0 | — |
| `vitest` + jsdom + RTL + jest-dom + user-event | Tests | ✓ | per `package.json` | — |
| Backend `portfolio-services` at `localhost:8080` | Optional — `lib/api.ts` calls fetch with silent fallback | ✗ (per CLAUDE.md "optional") | — | Seed data in `lib/portfolio-data.ts` (verified — Phase 6 fills) |
| Apple App Store badge SVG (license-cited) | `<StoreBadge platform="ios">` | ✗ (must source at plan-phase) | — | **No fallback** — planner research item; cannot ship `shipped.app` without it |
| Google Play badge SVG (license-cited) | `<StoreBadge platform="android">` | ✗ (must source at plan-phase) | — | **No fallback** — planner research item |

**Missing dependencies with no fallback:**
- Apple App Store badge SVG — planner must fetch at plan-phase per D-13. If this is impossible (e.g. Apple developer account auth required), the user must manually commit the SVG before Phase 3 can complete. This is a **blocker for the shipped-view wave**, not for Wave 1-4.

**Missing dependencies with fallback:**
- Backend `portfolio-services` at `localhost:8080` — `lib/api.ts` already silently falls back to `lib/portfolio-data.ts`. No Phase 3 work depends on a live backend.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 + @testing-library/react 16.2.0 + jsdom 26.1.0 |
| Config file | `vitest.config.ts` (project root); setup `vitest.setup.ts` |
| Quick run command | `npm test` (runs `vitest run` — single-pass, no watch) |
| Full suite command | `npm test` (same — full suite is fast enough) |
| Test discovery | Default Vitest globs: `**/*.test.{ts,tsx}` and `**/*.spec.{ts,tsx}` |
| Type-check | `npm run typecheck` (`tsc --noEmit`) |
| Lint | `npm run lint` (ESLint flat config) |
| Knip | `npm run knip` (zero unused files/exports) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROUTE-01 | All 7 routes exist as `page.tsx` files under `app/(terminal)/` | Static / smoke | `find app/\\(terminal\\) -name "page.tsx" \| wc -l` returns 7 | ✅ (Phase 2) |
| ROUTE-02 | Each `page.tsx` exports unique `metadata` with `title`, `description`, `alternates.canonical` | unit | `npm test -- views.test.tsx` (cross-view uniqueness spec) | ❌ Wave 5 |
| VIEW-01 | About view renders H1 + role + 3 stat cards + resume CTA + ghost socials | smoke | `npm test -- 'page.test.tsx'` for `/` route | ❌ Wave 5 |
| VIEW-02 | Projects view renders prompt + subhead + grid (or empty-state) | smoke | `npm test -- projects/page.test.tsx` | ❌ Wave 5 |
| VIEW-03 | Stack view renders prompt + JSON `<pre>` + copy button | smoke | `npm test -- stack/page.test.tsx` | ❌ Wave 5 |
| VIEW-04 | Experience view renders prompt + per-row hex/role/company/period (or empty-state) | smoke | `npm test -- experience/page.test.tsx` | ❌ Wave 5 |
| VIEW-05 | Writing view renders prompt + per-post meta/title/excerpt (or empty-state) | smoke | `npm test -- writing/page.test.tsx` | ❌ Wave 5 |
| VIEW-06 | Contact view renders prompt + lead + card + CTAs | smoke | `npm test -- contact/page.test.tsx` | ❌ Wave 5 |
| VIEW-07 | Shipped view renders prompt + per-app row (or empty-state) | smoke | `npm test -- shipped/page.test.tsx` | ❌ Wave 5 |
| VIEW-08 | Shared primitives extracted: `prompt-line`, `tech-chip`, `kbd` are RSC | static | `grep -L '"use client"' app/components/primitives/{tech-chip,kbd,prompt-line}.tsx \| wc -l` returns 3 | ❌ Wave 1 |
| SEO-05 | All external links use `<ExternalLink>` (which sets `target="_blank" rel="noopener noreferrer"`) | static / smoke | `grep -rE 'target="_blank"' app/components/views/` returns zero hits; `<ExternalLink>` source contains `rel="noopener noreferrer"` | ❌ Wave 1 (primitive); Wave 3 (callsites) |
| TEST-05 | One smoke spec per view: renders, unique title, prompt-line | unit | `npm test` (7 specs at `app/(terminal)/<view>/page.test.tsx` + 1 cross-view spec) | ❌ Wave 5 |

### Sampling Rate

- **Per task commit:** `npm test` (full Vitest run is fast; entire suite < 5s on this codebase size)
- **Per wave merge:** `npm test && npm run typecheck && npm run lint && npm run knip`
- **Phase gate:** `npm run build && npm test && npm run typecheck && npm run lint && npm run knip` — all green; `gsd-verify-work` confirms requirement coverage.

### Wave 0 Gaps

**None — existing test infrastructure covers all phase requirements.**

- ✅ Vitest 3.1.4 already configured (`vitest.config.ts`) with jsdom + RTL + jest-dom matchers
- ✅ `vitest.setup.ts` registers jest-dom matchers globally
- ✅ `@testing-library/user-event` already installed (Phase 2 D-21) for any future click simulation (TEST-05 may not need it; cross-view spec is pure assertion)
- ✅ `@/` path alias resolves identically in tests and production (`vitest.config.ts` mirror)
- ✅ Test patterns established by Phase 2 (`sidebar.test.tsx`, `sitemap.test.tsx`, `breadcrumb.test.tsx`, etc.) — mock `next/navigation`, render with fixture props, assert via accessibility-first queries.

The 7 page.test.tsx files + 1 cross-view spec are deliverables of Wave 5; no Wave 0 setup work needed.

## Security Domain

> Security is a real concern for this phase because of the brand-asset license compliance and the always-external-link discipline. ASVS categories are evaluated against the actual phase scope.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 3 has no auth surface |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | All routes are public |
| V5 Input Validation | minimal | View props are typed `Profile`, `Project[]`, etc.; data flows from server-side `lib/api.ts` (already wired with seed-fallback discipline). No user input is collected in Phase 3. |
| V6 Cryptography | no | No crypto |
| V14.4 HTTP Headers | yes (inherited) | `next.config.ts` already declares HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (Phase 1 / INFRA-04) — inherited |
| V12.3 URL Validation | yes | External-link safety: `<ExternalLink>` sets `rel="noopener noreferrer"` (prevents reverse tabnabbing on `target="_blank"` links — OWASP standard) [CITED: SEO-05; D-08] |
| V13.4 OG / Open-Graph | partial (Phase 5 owns full) | Phase 3 lands `metadata.description` text only; OG images, JSON-LD, Twitter card — Phase 5 |

### Known Threat Patterns for Next.js 15 + RSC + view bodies

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing on `target="_blank"` external links | Tampering / Information Disclosure | `rel="noopener noreferrer"` on every external link — enforced by `<ExternalLink>` primitive (D-08) |
| XSS via dangerously-rendered HTML | Tampering | Phase 3 uses NO `dangerouslySetInnerHTML`. The hand-rolled JSON syntax highlighter renders Fragments + spans (UI-SPEC §V3) — XSS surface is zero |
| Clipboard write hijacking | Tampering | `navigator.clipboard.writeText` only writes (not reads); no clipboard read in Phase 3; no security exposure |
| Stored data reflection (e.g. `PROFILE.email` rendered without escape) | Tampering | React auto-escapes JSX text content; data is server-provided, not user-input. No reflection vector. |
| Brand-asset license violation (App Store / Play Store badges) | Reputation / Legal | Source SVGs from official providers ONLY (Apple Marketing Identity Guidelines; Google Play Brand Guidelines); JSDoc cite source URLs and sourcing date; no recoloring; no resizing below platform minimums [CITED: D-13] |
| Inline `<script>` injection (CSP) | Tampering / Code Injection | Phase 3 introduces NO new inline scripts. Phase 1 D-15 noted CSP nonce work is deferred; Phase 3 must NOT regress this. The only inline script in the app is the AccentBootstrapScript (Phase 2). |
| Metadata content injection | Tampering | All metadata strings come from `lib/routes.ts` (typed const) and `lib/portfolio-data.ts` (typed const). No user input flows into `metadata`. |

### License Compliance Gates

Two registries are touched in Phase 3 by reference:

| Registry | Asset | License Gate |
|----------|-------|--------------|
| Apple App Store badge artwork | "Download on the App Store" SVG (black, English) | Limited royalty-free use license per [Apple licensing-trademarks](https://developer.apple.com/licensing-trademarks/); requires Apple Developer Program membership; badge MUST be unmodified; planner research item at plan-phase fetches + JSDoc cites source + date [CITED: Apple App Store Marketing Identity Guidelines] |
| Google Play badge artwork | "Get it on Google Play" SVG (English, ≥135px) | Per Google Play Brand Guidelines; minimum width 135px; no modifications; English mandatory at v1 (i18n deferred); planner research item at plan-phase fetches + JSDoc cites source + date [CITED: Google Play Partner Marketing Hub Badge Guidelines] |

**Both gates execute during plan-phase, NOT at UI-SPEC time** — the planner fetches current SVGs (URLs change periodically; pinning a specific filename here would create staleness). The planner's commit message and `store-badge.tsx` JSDoc are the audit trail.

## Sources

### Primary (HIGH confidence)

- `.planning/phases/03-views/03-CONTEXT.md` — All 19 LOCKED decisions D-01..D-19 [VERIFIED: read in full]
- `.planning/phases/03-views/03-UI-SPEC.md` — Per-view layouts with handoff line refs, primitive APIs, copywriting + ARIA contract [VERIFIED: read in full]
- `.planning/phases/03-views/03-DISCUSSION-LOG.md` — Audit trail of alternatives considered [VERIFIED: read]
- `.planning/REQUIREMENTS.md` — 89 v1 requirements; Phase 3 owns 12 [VERIFIED: read]
- `.planning/ROADMAP.md` — Phase 3 goal, depends-on, success criteria, plans [VERIFIED: read Phase 3 section]
- `.planning/STATE.md` — Phase 2 complete; ready for `/gsd-plan-phase 3` [VERIFIED: read]
- `.planning/research/SUMMARY.md` — Convergent decisions, Phase 3 ordering [VERIFIED: read]
- `.planning/codebase/TESTING.md` — Vitest + RTL + jsdom + jest-dom setup; co-located test convention [VERIFIED: read]
- `.planning/codebase/CONVENTIONS.md` — kebab-case files, PascalCase components, `@/` alias, RSC default [VERIFIED: read]
- `.planning/research/PITFALLS.md` (1, 9) — per-route metadata uniqueness, RSC boundary discipline [VERIFIED: read]
- `CLAUDE.md` — Stack constraints, brownfield discipline, recruiter usability non-negotiables [VERIFIED: read]
- `lib/types.ts`, `lib/routes.ts`, `lib/api.ts`, `lib/portfolio-data.ts` — typed shapes, route registry, data fetchers, seed data [VERIFIED: read in full]
- `app/globals.css` — Phase 2 token system, primitives styles, view-area layout [VERIFIED: read]
- `app/(terminal)/layout.tsx` + 7 `page.tsx` stubs — current shell + stub state [VERIFIED: read all]
- `app/components/primitives/prompt-line.tsx` — existing primitive pattern [VERIFIED: read]
- `app/components/shell/sidebar.test.tsx`, `app/sitemap.test.tsx` — Phase 2 test patterns [VERIFIED: read]
- `design_handoff_terminal_portfolio/app.jsx` lines 230-468 — visual source of truth for views 1-6 [VERIFIED: read relevant sections]
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — `metadata` object, `alternates.canonical`, `metadataBase` URL composition, RSC-only restriction [VERIFIED: fetched 2026-05-06; doc version 16.2.4 confirms behavior unchanged across 15.x]

### Secondary (MEDIUM confidence)

- [Apple App Store Marketing Identity Guidelines](https://developer.apple.com/app-store/marketing/guidelines/) — Badge license terms, SVG availability [VERIFIED via WebSearch 2026-05-06]
- [Apple licensing-trademarks](https://developer.apple.com/licensing-trademarks/) — Limited royalty-free badge license terms [VERIFIED via WebSearch]
- [Google Play Partner Marketing Hub Badge Guidelines](https://partnermarketinghub.withgoogle.com/brands/google-play/visual-identity/badge-guidelines/) — Badge minimum width, brand requirements [VERIFIED via WebSearch]
- [MDN: navigator.clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — Browser-native clipboard API [CITED in 03-CONTEXT.md]
- [WAI-ARIA aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live) — `polite` for non-urgent announcements (CopyButton confirmation) [CITED in 03-CONTEXT.md]

### Tertiary (LOW confidence — none in this phase)

No LOW-confidence claims. All architectural decisions are upstream-locked (CONTEXT.md, UI-SPEC); all external references are verified against official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every dep verified in `package.json`; no new deps; pure CSS approach already established
- Architecture: HIGH — Pattern 1 (page fetches, view receives props) is established by ARCHITECTURE.md and validated in Phase 2; RSC discipline locked in SHELL-02
- Pitfalls: HIGH — every pitfall has a documented mitigation in CONTEXT.md or UI-SPEC; no new failure modes introduced
- Validation Architecture: HIGH — TEST-05 spec template verified against Phase 2 test patterns; cross-view uniqueness spec is a 5-line assertion
- Security: HIGH — limited surface (zero auth, zero user input, license-gated brand assets); known patterns (reverse tabnabbing) mitigated via primitive enforcement
- Open questions: 5 questions, all LOW or MEDIUM risk; recommendations included

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (30 days for stable Next.js 15.5.x line)

---

*Phase: 03-views*
*Research completed: 2026-05-06*
*Ready for planning: yes — `/gsd-plan-phase 3` can now create the plan files*
