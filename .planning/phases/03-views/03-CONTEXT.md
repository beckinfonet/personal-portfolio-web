# Phase 3: Views - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 fills the seven `// view body lands in Phase 3` placeholders in the route stubs Phase 2 shipped, and lands the shared primitives + per-view metadata + view smoke tests:

- Replace stub bodies in `app/(terminal)/page.tsx` (about), `/projects/page.tsx`, `/stack/page.tsx`, `/experience/page.tsx`, `/writing/page.tsx`, `/contact/page.tsx`, `/shipped/page.tsx` with real RSC view components
- Each view body lives in `app/components/views/<name>-view.tsx` (RSC, **no `"use client"`** — per Pitfall 9 / SHELL-02)
- Per-view metadata enriched: each `page.tsx` exports unique `title` (Phase 2 stubs already have these), plus new `description` and `alternates.canonical` (ROUTE-02)
- Shared primitives land: `app/components/primitives/tech-chip.tsx` (RSC), `kbd.tsx` (RSC), `external-link.tsx` (RSC), `copy-button.tsx` (client island)
- One Vitest smoke test per view (TEST-05): renders, exports unique `<title>`, contains `$ <command>` prompt line
- All external links go through `<ExternalLink>` with `target="_blank" rel="noopener noreferrer"` (SEO-05)

**Out of scope this phase (carrying forward, do NOT touch):**
- Shell layout, top bar, sidebar, palette, theme/accent system — locked Phase 2
- OG images, JSON-LD, favicon, Twitter card — Phase 5 (SEO-01..04)
- Mobile redistribution, mobile palette bottom-sheet — Phase 4
- Real bio / projects / writing / shipped / experience / location content — Phase 6 (CONTENT-01..07); Phase 3 ships against the empty arrays + `TODO:` markers in `lib/portfolio-data.ts`
- `prefers-reduced-motion` comprehensive pass + 8-combination contrast audit — Phase 5
- Deploy, Lighthouse, recruiter test — Phase 7

**Phase 3 owns these requirements (per ROADMAP.md):** ROUTE-01, ROUTE-02, VIEW-01..VIEW-08, SEO-05, TEST-05.

**Empty-array discipline:** `lib/portfolio-data.ts` ships with `PROJECTS`, `EXPERIENCE`, `WRITING`, `SHIPPED` as empty arrays; only `STACK` has real entries (Phase 1 D-08). Phase 3 view code MUST render gracefully against the empty case — Phase 6 fills, but Phase 3 builds and tests must pass cleanly today against empty data (per D-01 below).

</domain>

<decisions>
## Implementation Decisions

### Empty-State Discipline

- **D-01: Always-ship + always-in-sitemap.** All 7 routes ship to production and appear in `app/sitemap.ts` regardless of data presence. Sitemap iteration over `ROUTES` (locked Phase 2 / ROUTE-04) does not gain a content-existence filter. SEO baseline preserved. Recruiter never lands on a 404 from the sidebar.

- **D-02: Terminal-voice empty states.** When a content array is empty, the view still renders its prompt line + a muted `(no entries…)` line below. Stays in voice; build-without-content never breaks; Phase 6 swaps real content in without code edits.

- **D-03: Concrete empty-state copy locked.** Executor uses these strings verbatim — no improvisation:
  | View | Prompt (already locked Phase 2 D-13) | Empty body |
  |---|---|---|
  | `/projects` | `$ ls -la projects/` | `total 0 · (no projects committed yet)` |
  | `/experience` | `$ git log --oneline --decorate experience.log` | `(no commits to experience.log yet)` |
  | `/writing` | `$ ls writing/ && cat *.md` | `// no posts yet — follow github.com/beckinfonet for code-as-content.` |
  | `/shipped` | `$ ls -la shipped/` | `total 0 · (no apps shipped to stores yet)` |

  Implementation: each view checks `array.length === 0` → renders the empty-body line; otherwise renders the populated body. No conditional metadata changes; same `<title>` either way.

- **D-04: CONTENT-04 v1 path = empty-with-coming-soon-state.** Writing view ships v1 with `WRITING = []` and the empty-state line from D-03. Phase 6 is NOT blocked on authoring at-least-one post. Removes a Phase 6 dependency; brand voice preserved through the empty-state line. CONTENT-04 in REQUIREMENTS.md should be treated as resolved-via-empty-state in this milestone.

### Copy-Button Architecture (Stack JSON + Contact Email)

- **D-05: Single shared `<CopyButton/>` client island.** Lives at `app/components/primitives/copy-button.tsx` with `"use client"`. Props: `{ value: string; label?: string; ariaLabel: string; }`. Uses `navigator.clipboard.writeText(value)`. Stack-view passes `JSON.stringify({ <category>: items, ... }, null, 2)`; contact-view passes the email address. View bodies stay RSC — only the button itself crosses the client boundary (per Pitfall 9 / SHELL-02). Reusable; smallest client surface; future copy-needs (e.g. share-this-view fallback) can reuse it.

- **D-06: Visual: top-right ghost button `⧉ copy` → `copied ✓` for 1.5s.** Matches handoff terminal aesthetic. On stack view, positioned top-right of the `<pre>` card via CSS (e.g. `.stack-pre { position: relative; }` + `.stack-copy { position: absolute; top: 12px; right: 12px; }`). On contact card, positioned right-aligned on the email row. Button is itself an `<button type="button">` styled like `.topbar-btn` (existing class) but smaller; planner picks final class name and any new styles in `app/globals.css`.

- **D-07: Confirmation feedback: inline label swap + `aria-live="polite"`.** Button text swaps from `⧉ copy` to `copied ✓` for 1500ms then reverts. Reuse the `aria-live` region pattern Phase 2 established for the cmdk palette result-count (assertive vs polite — Phase 3 uses `polite` since copy success is non-urgent). No toast infrastructure; no global state.

### `<ExternalLink>` Primitive (SEO-05)

- **D-08: `<ExternalLink>` is always-external; no auto-detect.** Component at `app/components/primitives/external-link.tsx` (RSC). Renders `<a href={href} target="_blank" rel="noopener noreferrer">` always. Same-origin links use plain `<a>` or `<Link>` — caller's choice. Explicit at call site: `<ExternalLink>` in JSX = always opens external in a new tab. No runtime URL parse, no `window` dependency, no client component.

- **D-09: Visual treatment: trailing `↗` glyph + hover opacity 0.85.** Component renders `{children}<span aria-hidden="true"> ↗</span>` and inherits the existing `a:hover { opacity: 0.85 }` rule. Visible signal that the link leaves the site. Recruiter-friendly tab-loss preview. Matches handoff `github ↗` footer treatment.

- **D-10: View-local social label conventions kept distinct (per handoff).**
  - About-view ghost CTA buttons: lowercased label + trailing `/` (e.g. `github/`, `linkedin/`). Reads the label from `PROFILE.socials[i].label` and renders `{label.toLowerCase()}/`.
  - Contact-view card row: 90px label column with `LABEL.toUpperCase()` (e.g. `GITHUB`) + accent-link to handle. Reads same `PROFILE.socials[i]` source — different render in each view.

  Both views import the same `<ExternalLink>` primitive; each view applies its own label transform. PROFILE.socials is the single source of truth.

- **D-11: Component API.** `<ExternalLink href={...} className?={...}>{children}</ExternalLink>`. Accepts optional `className` so views can compose with their own styling (`btn`, `btn-ghost`, `contact-link`). The `↗` glyph is always rendered; if a view needs to suppress it (none planned in Phase 3), add an opt-out prop in a future phase, not now.

### `shipped.app` View Layout (No Handoff Reference)

- **D-12: Per-app row layout mirroring projects/.** 32px / 1fr / 110px grid (same shape as projects/ — VIEW-02). Visual rhythm with projects/ keeps the file-tree mental model. Columns:
  1. **32px** — index `01.` `02.` … in muted 12px
  2. **1fr** — app name (accent 15px/600), summary (13px), platform-store badges row, copyable share URL row
  3. **110px** — year, role, optional `shipped` status — right-aligned 11px/muted

  Per-row divider: `border-bottom: 1px solid var(--border)` (matches projects/).

- **D-13: Inline SVG official badges for App Store + Google Play.** Apple "Download on the App Store" + Google "Get it on Google Play" badges shipped as inline SVG components (`app/components/primitives/store-badge.tsx`, RSC, returns one `<svg>` per platform). Justification: recruiters who evaluate mobile app work recognize the official badges instantly; the trade-off vs. terminal aesthetic is worth it for VIEW-07's audience signal.

  **License compliance is mandatory:**
  - Apple "Marketing Identity Guidelines" — badge SVG must come from Apple's official provider (https://tools.applemediaservices.com/app-store/) at the correct size; no recoloring.
  - Google Play "Brand Guidelines" — badge must be in approved English form at minimum width (e.g. 135px), no modifications.
  - **Planner research item:** During plan-phase, fetch the current SVG sources + license terms; document badge `viewBox`/`width`/`height` constants in `store-badge.tsx`; do NOT inline an unofficial recreation.

  Badges wrap with `<ExternalLink>` to the actual store URL (`appStoreUrl` / `googlePlayUrl` from `ShippedApp` type — already typed in `lib/types.ts`).

  Fallback: if a `ShippedApp` entry has only one platform (`platforms: ["ios"]` or `["android"]`), only that one badge renders.

- **D-14: Per-app `<CopyButton/>` for the share URL (full VIEW-07 compliance).** Each row gets one `<CopyButton/>` instance copying the canonical store URL (App Store URL by default; Google Play URL if iOS missing). `aria-label="Copy <app-name> store link"`. Adds one client island per app row; v1 has ≤10 apps, so client-bundle scale impact is bounded.

  Layout: copy button sits inline with the platform badges row (small `⧉` icon-only variant; no `copy` text label) so it doesn't crowd the right-column 110px.

- **D-15: Empty state per D-02/D-03.** When `SHIPPED = []`, view renders the prompt + `total 0 · (no apps shipped to stores yet)`. No badges, no copy buttons, no client islands instantiated.

### Per-View Metadata Strategy (Claude's Discretion — locked with defaults)

- **D-16: Static `metadata: Metadata` object per `page.tsx`.** Phase 2 stubs already use this pattern (D-12 carry-forward). Phase 3 enriches with `description` + `alternates.canonical`:
  - `description` sourced from `ROUTES[i].description` (already typed and populated in `lib/routes.ts`) — single source of truth, no prose drift between sidebar/palette/metadata
  - `alternates.canonical` set to `ROUTES[i].pathname` (relative path) — Next.js resolves against `metadataBase` from Phase 1 / ROUTE-03
  - `title` stays as Phase 2 stub locked in D-12: `<file-label> — Bakytbek Tatibekov`
- **D-17: No `generateMetadata` for v1.** Static metadata covers Phase 3 needs. Dynamic metadata (writing slug pages, OG images) lands in Phase 5 / SEO-03.

### Test Strategy (Claude's Discretion)

- **D-18: TEST-05 = 7 smoke specs at `app/(terminal)/<view>/page.test.tsx`.** Each spec asserts:
  1. Component renders without throwing
  2. `<title>` resolves to the locked Phase 2 D-12 string (e.g. `about.md — Bakytbek Tatibekov`)
  3. Body contains the Phase 2 D-13 prompt-line text (e.g. `cat about.md`)

  Cross-view test asserts uniqueness: `expect(new Set(allTitles).size).toBe(allTitles.length)` (per ROADMAP.md success-criterion-1 wording).

  **Out-of-scope for TEST-05:** affordance-presence assertions (resume CTA, copy buttons, mailto). Those are integration/manual tests; Phase 5 / Phase 7 verification covers them. TEST-05 is a smoke test, not a visual regression suite.

### Wave Structure (Claude's Discretion)

- **D-19: Suggested 5-wave grouping.** Planner can refine; about-view-first-slice is research-validated (ARCHITECTURE.md):
  - **Wave 1 (sequential):** Primitives — `tech-chip.tsx` (RSC), `kbd.tsx` (RSC), `external-link.tsx` (RSC), `copy-button.tsx` (client), `store-badge.tsx` (RSC) + new view-related CSS in `app/globals.css`
  - **Wave 2 (sequential):** About view — first vertical slice, validates the RSC-view pattern end-to-end before scaling
  - **Wave 3 (parallel, 6 plans):** Six remaining views — `projects-view`, `stack-view`, `experience-view`, `writing-view`, `contact-view`, `shipped-view`. Each view = one plan. Per `config.json` `parallelization: true`.
  - **Wave 4 (sequential):** Per-view metadata enrichment (touch all 7 `page.tsx` files for `description` + `alternates.canonical`) — small enough for one plan
  - **Wave 5 (parallel):** TEST-05 smoke specs (7 specs) — one plan, parallelizable internally

  Total: ~10 plans. Wave 2 lands first vertical slice; if any structural issue surfaces (RSC boundary, primitives API), it costs one view's rework not seven.

### Claude's Discretion

- **Experience.log hex-hash convention:** Use the handoff toy form `(i + 1).toString(16).padStart(7, '0')` rendering `0000001`, `0000002`, etc. Stable across builds, deterministic for tests, no real-git infrastructure needed. Real SHA-1 hashes deferred to v2 (would need a build-time generator from company+role+period).
- **Sort order:** projects/ year desc; experience.log most-recent-first; writing/ date desc; shipped.app year desc. All sort at render time inside the view component (not at fetch time) — keeps `lib/portfolio-data.ts` author-friendly.
- **Resume CTA on about view:** `<a download="Bakytbek_Tatibekov_Resume.pdf" href={PROFILE.resumeUrl}>↓ resume.pdf</a>` (Phase 2 specifics carry-forward). Same pattern on contact-view footer CTA.
- **`mailto:` on contact view:** `<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>` — copyable plain text via browser-native long-press / right-click. Plus the `<CopyButton value={PROFILE.email}/>` (D-05) for explicit one-tap copy.
- **Stack-view JSON content source:** `JSON.stringify(Object.fromEntries(STACK.map(c => [c.category, c.items])), null, 2)` — translates the typed `StackCategory[]` into the JSON shape the syntax highlighter renders. Both `<pre>` rendering and `<CopyButton value>` use the same canonical string.
- **Stack-view syntax highlighting:** Hand-rolled per handoff `app.jsx` lines 355–389 — punctuation muted, keys warn-yellow, values accent. No syntax-highlighter library (would violate "exactly two new prod deps" constraint).
- **Tech-chip primitive:** `<TechChip>{label}</TechChip>` renders `<span class="tech-chip">{children}</span>`. Stylesheet handles the `border 1px solid --border, radius 3, padding 3px 8px, fontSize 11, color --muted-hi, background --bg-raised`.
- **Kbd primitive:** `<Kbd>⌘K</Kbd>` renders `<kbd class="kbd">{children}</kbd>`. Already implicitly used in Phase 2 breadcrumb-hint via `.breadcrumb-hint kbd` class — Phase 3 formalizes the wrapper. Idempotent if planner finds breadcrumb-hint already covers the styling needs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and locked decisions

- `.planning/PROJECT.md` — Out-of-scope items (no tweaks panel, no REPL, no auto-playing GIFs); per-view route + sitemap parity is a key decision; `shipped.app` 7th view added beyond handoff is also a key decision
- `.planning/REQUIREMENTS.md` — 89 v1 requirements; **Phase 3 owns:** ROUTE-01, ROUTE-02, VIEW-01..VIEW-08, SEO-05, TEST-05
- `.planning/ROADMAP.md` §"Phase 3: Views" — Goal, depends-on (Phase 2), 5 success criteria
- `CLAUDE.md` — Pure CSS only, no Tailwind / no CSS-in-JS / no CSS modules; native `fetch + next: { revalidate }` only; exactly two new prod deps total (already added Phase 1); RSC root layout discipline; brownfield delete-and-replace in same commit; plain-noun `aria-label` requirement; recruiter 5-second test as exit criterion

### Prior phase carry-forwards (locked decisions in effect)

- `.planning/phases/01-foundation/01-CONTEXT.md` — D-04 (Node 22.x), D-10 (`TODO:` marker convention — INFRA-05 grep includes `TODO`; Phase 3 view code must NOT introduce new `TODO:` strings outside `lib/portfolio-data.ts`), D-11 (full INFRA-05 grep list)
- `.planning/phases/02-shell/02-CONTEXT.md` — D-01..D-05 (palette verb taxonomy — Phase 3 must not break palette-to-view navigation), D-12/D-13 (route stub pattern + locked prompt copy per view; Phase 3 keeps these prompt strings exact), D-15 (PROFILE.socials includes 3rd-social pick deferred to planning — same data source feeds about + contact + palette)
- `lib/routes.ts` — 7-entry `ROUTES as const` array with `{ slug, pathname, label, ariaLabel, description }`. Phase 3 metadata reads `description` from this. Adding an 8th view = single-file edit.
- `lib/types.ts` — `Profile`, `Project`, `Social`, `Experience`, `Writing`, `ShippedApp`, `StackCategory`. Phase 3 view components consume these typed shapes.
- `lib/portfolio-data.ts` — Real STACK, real PROFILE.socials (GitHub + LinkedIn TODO), empty PROJECTS/EXPERIENCE/WRITING/SHIPPED. Phase 3 ships against this state.
- `lib/api.ts` — `getProfile`, `getProjects`, `getExperience`, `getWriting`, `getShipped`, `getStack` already wired to fallback to seed data. Phase 3 view `page.tsx` files call these.

### Research convergence (settled, do not re-debate)

- `.planning/research/SUMMARY.md` §"Phase 3: Views" — about-first vertical-slice pattern; "Per view, required: unique metadata export; external links with rel='noopener noreferrer'; aria-current='page' on active sidebar file"; CI uniqueness test for metadata
- `.planning/research/ARCHITECTURE.md` §Pattern 1, §Pattern 3 (per-route data fetching, layout fetches nothing), §"Structure rationale" — `app/components/views/` vs `app/components/shell/` vs `app/components/primitives/` boundary, "shell talks to views only via {children} slot — no imports between them"
- `.planning/research/PITFALLS.md` — Pitfall 1 (per-route metadata required + uniqueness test), Pitfall 2 (sitemap drift; iterate ROUTES — already mitigated Phase 2), Pitfall 7 (mobile redistribution — Phase 4 concern but Phase 3 must not introduce desktop-only patterns that block Phase 4), Pitfall 9 (RSC boundary collapse — Phase 3 client islands are CopyButton ONLY)
- `.planning/research/FEATURES.md` — `<ExternalLink>` is "table-stakes shared component"; mailto + copyable email is recruiter table-stakes; stack tab-to-copy is in v1 per VIEW-03 (overrides FEATURES.md "deferred" note)

### Codebase intel (existing state at 2026-05-06 / Phase 2 complete)

- `.planning/codebase/STRUCTURE.md` — Directory layout; Phase 3 adds `app/components/views/` (new) and extends `app/components/primitives/` (already has `prompt-line.tsx`)
- `.planning/codebase/CONVENTIONS.md` — kebab-case files, PascalCase components, `@/` alias, RSC default with `"use client"` only when needed, UPPERCASE module-level constants
- `.planning/codebase/CONCERNS.md` — Inline-script CSP nuance still deferred (Phase 1 D-15); Phase 3 introduces no new inline scripts
- `.planning/codebase/TESTING.md` — Vitest + jsdom + Testing Library setup; Phase 2 added `@testing-library/user-event` (Phase 2 D-21 wave-2); Phase 3 reuses both for TEST-05 specs
- `.planning/STATE.md` — Phase 2 complete (4 human-UAT items pending in 02-HUMAN-UAT.md); Phase 3 enters as next active phase

### Design reference (canonical for visual ambiguity)

- `design_handoff_terminal_portfolio/README.md` — High-fidelity design spec; per-view layouts under §"Screens / Views" (about, projects/, stack.json, experience.log, writing/, contact.sh — but **NOT shipped.app**, which is added beyond the handoff per PROJECT.md key decision and locked here in D-12..D-15)
- `design_handoff_terminal_portfolio/app.jsx` — 605-line React prototype; **canonical for any visual ambiguity** per CLAUDE.md. Specific Phase 3 reads:
  - About view: lines 289–316 (h1, role, location, bio, highlights grid, CTA row)
  - Projects view: lines 318–353 (32px/1fr/110px grid, tech chips, year/status/role right-column)
  - Stack view: lines 355–389 (`<pre>` card with hand-rolled JSON syntax highlighting — punctuation muted, keys warn-yellow, values accent)
  - Experience view: lines 391–413 (hex-hash + role + @company + period + summary row)
  - Writing view: lines 415–439 (date · readtime micro-meta + `› title` + excerpt)
  - Contact view: lines 441–468 (lead paragraph + 90px label column card + footer CTA row with resume + `github ↗`)
- `design_handoff_terminal_portfolio/screenshots/` — `01-about-dark.png` through `06-contact-dark.png` + `07-about-light.png`; pixel reference for spacing/colors/affordance placement. **No screenshot exists for `shipped.app`** — D-12..D-15 are the canonical spec.

### External docs (referenced — read on demand)

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — static `metadata` vs `generateMetadata`; `alternates.canonical` resolution against `metadataBase`
- [Next.js Sitemap file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — Phase 2 already implemented; Phase 3 keeps it correct
- [MDN: navigator.clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) — used in `<CopyButton/>` (D-05)
- [Apple App Store Marketing Identity Guidelines](https://developer.apple.com/app-store/marketing/guidelines/) — D-13 mandatory read at plan-phase before SVG inlining
- [Google Play Brand Guidelines](https://play.google.com/intl/en_us/badges/) — D-13 mandatory read at plan-phase before SVG inlining
- [WAI-ARIA aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live) — `polite` for D-07 copy confirmation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`lib/routes.ts` `ROUTES`** — already has `description` field per route. Phase 3 per-view `metadata.description` reads from this. Single source of truth, zero drift between sidebar/palette/sitemap/metadata.
- **`lib/portfolio-data.ts`** — `STACK` is real now (matrix, languages/frameworks/cloud/ai); `PROFILE` is real for identity/email/socials except handful of `TODO:` markers (location, LinkedIn URL, bio, highlights). Phase 3 wires views to consume these AS-IS without adding new `TODO:` markers (would trip INFRA-05 grep).
- **`lib/api.ts`** — All 6 fetcher functions ready (`getProfile`, `getProjects`, `getExperience`, `getWriting`, `getShipped`, `getStack`). View `page.tsx` files call these in async RSCs; the silent-fallback pattern means views render against seed data when backend is unreachable.
- **`app/components/primitives/prompt-line.tsx`** — already shipped Phase 2. Each view component imports `{ PromptLine }` and renders the locked prompt copy from D-13. Tests can `expect(getByText("$"))` + `expect(getByText("cat about.md"))`.
- **`app/(terminal)/<view>/page.tsx` stubs** — already shipped Phase 2 with `metadata.title` + a placeholder body. Phase 3 replaces the body and adds `metadata.description` + `metadata.alternates.canonical`.
- **`app/components/shell/command-palette.tsx`** — already implements an `aria-live` region for the result count. Phase 3 `<CopyButton/>` should reuse the SAME region pattern (D-07) — extract to a shared `<LiveRegion/>` primitive if planner sees a clean abstraction; otherwise duplicate the markup minimally.
- **`app/globals.css`** — has `.prompt-line`, `.terminal-main`, `.content-block`, `.shell-footer`, `.kbd`, `.tech-chip` (?), `.btn`, `.btn-ghost`, etc. **Planner must grep before adding new classes** — many handoff-spec classes likely already exist from Phase 2 stub work. Phase 3 adds: per-view-specific layouts (`.about-hero`, `.about-cards`, `.projects-grid`, `.stack-pre`, `.experience-row`, `.writing-post`, `.contact-card`, `.shipped-row`, `.store-badge`, `.copy-button`, `.external-link`).

### Established Patterns

- **RSC default; `"use client"` only at the leaf** — Phase 3 client island count: 1 (`<CopyButton/>`). All views, all primitives except CopyButton, all `page.tsx` files: RSC.
- **Pure CSS + CSS custom properties in `app/globals.css`** — Phase 3 extends with view-specific layout selectors. No Tailwind, no CSS modules, no CSS-in-JS.
- **Native `fetch` + `next: { revalidate: 300 }`** — view `page.tsx` files call `getProjects()` / `getExperience()` / etc. (silent-fallback pattern); ISR caches at 5min.
- **Kebab-case filenames; PascalCase exported components; `@/` alias imports** — preserved.
- **UPPERCASE module-level constants** — `ROUTES`, `PROFILE`, `STACK`, etc. (existing). Phase 3 introduces no new module-level constants — view content lives in `lib/portfolio-data.ts`.

### Integration Points

- **Each `app/(terminal)/<view>/page.tsx`** — replace the stub `<p className="stub-body">` with `<{View}View />`. Add `metadata.description` and `metadata.alternates.canonical`. The view component does the data fetch (or accepts data as props from `page.tsx` — planner picks; ARCHITECTURE.md Pattern 3 says page fetches, view receives props).
- **`app/components/views/`** — new directory. 7 view files: `about-view.tsx`, `projects-view.tsx`, `stack-view.tsx`, `experience-view.tsx`, `writing-view.tsx`, `contact-view.tsx`, `shipped-view.tsx`. All RSC.
- **`app/components/primitives/`** — extends Phase 2's `prompt-line.tsx` with: `tech-chip.tsx`, `kbd.tsx`, `external-link.tsx`, `copy-button.tsx`, `store-badge.tsx`. All RSC except `copy-button.tsx`.
- **`app/globals.css`** — extended with view + primitive selectors (see "Reusable Assets" above for the new-class list).
- **`vitest.config.ts` jsdom + setup** — TEST-05 reuses Phase 2's setup. May need `@testing-library/user-event` (already added Phase 2) for `<CopyButton/>` clipboard mock.
- **`lib/portfolio-data.ts`** — Phase 3 does NOT modify this file. Empty arrays stay empty until Phase 6.
- **`lib/api.ts`** — Phase 3 does NOT modify this file. Existing 6 fetchers are sufficient.

</code_context>

<specifics>
## Specific Ideas

- **`<CopyButton/>` props shape:** `{ value: string; idleLabel?: string; copiedLabel?: string; ariaLabel: string; className?: string; }`. Defaults: `idleLabel = "⧉ copy"`, `copiedLabel = "copied ✓"`. The `aria-label` is required (caller-supplied) so SR users always know what's being copied (e.g. `Copy stack JSON`, `Copy email address beckprograms@gmail.com`, `Copy Soulful App Store link`).
- **Stack JSON `<pre>` content:** The hand-rolled syntax highlighter from `app.jsx` lines 367–388 — port verbatim into `stack-view.tsx`. Use React Fragments + spans with class names (e.g. `.json-key`, `.json-string`, `.json-punc`); colors come from `--warn`, `--accent`, `--muted` CSS vars.
- **Stack view CopyButton positioning:** Wrap `<pre>` in a `<div class="stack-pre-wrap" style="position: relative">` (or use a CSS class) and absolutely-position the `<CopyButton class="stack-copy">` top-right. Ensures the button doesn't push the JSON body downward.
- **Contact email row:** `<div class="contact-row contact-row--email">` with three children: 90px `EMAIL` label (uppercase muted), `<a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>` accent link, and `<CopyButton value={PROFILE.email} ariaLabel={`Copy email ${PROFILE.email}`}/>` right-aligned. The mailto link is the primary affordance; CopyButton is the secondary.
- **About view three-stat-card source:** `PROFILE.highlights` array (3 entries expected). v1 ships with `TODO: stat label N` markers — Phase 6 fills. Phase 3 view code reads the array length-3 with no defensive logic; if Phase 6 ships ≠ 3 entries, it's a Phase 6 bug.
- **`<ExternalLink>` glyph styling:** the `↗` is wrapped in `<span aria-hidden="true">` so SR users don't hear "northeast arrow". Visual-only signal.
- **shipped.app row order within row:** Index | (name + summary + platform-badges-row + copy-button) | (year + role + status). The copy-button is INLINE with the badges row, NOT stacked separately — keeps the row compact.
- **Per-view metadata description fallback:** if `ROUTES[i].description` is empty for any reason (it shouldn't be — it's a typed required field), the metadata description simply omits — `description: ROUTES[i].description ?? undefined`. Don't introduce new placeholder strings in Phase 3.
- **Sort vs render-order:** `[...PROJECTS].sort((a,b) => Number(b.year) - Number(a.year))` inside the view — non-mutating. Same pattern for experience (most-recent), writing (date desc), shipped (year desc).
- **TEST-05 setup:** Each `<view>/page.test.tsx` imports the actual `page.tsx` default export as a component, renders it inside `<TerminalLayout>`-mock or in isolation (jsdom + RTL). Asserts:
  ```ts
  it("renders prompt line", () => { render(<AboutPage/>); expect(screen.getByText("cat about.md")).toBeInTheDocument(); });
  it("exposes unique metadata title", () => { expect((AboutPage.metadata as any).title).toBe("about.md — Bakytbek Tatibekov"); });
  ```
  Plus one cross-view spec asserting `Set(allTitles).size === 7`.
- **License-aware store badges:** SVG sources should be downloaded at plan-phase time and committed to `app/components/primitives/store-badge-assets/` (or inlined in `store-badge.tsx`). Add a JSDoc comment in `store-badge.tsx` linking to Apple + Google brand guideline URLs and the date the SVG was sourced — future maintenance signal.
- **Resume CTA on contact view:** mirrors handoff `app.jsx` line 463 — `<a href={PROFILE.resumeUrl} download="Bakytbek_Tatibekov_Resume.pdf" class="btn">↓ download resume.pdf</a>`. Note the `download` filename is a hard-coded user-facing string — keep it consistent across about + contact views.

</specifics>

<deferred>
## Deferred Ideas

- **Per-project anchors (`/projects#project-name`)** — v1.x (PALETTE-V2-01 / SEO-V2-01). Phase 3 ships project rows without `id={slug(p.name)}` anchors; deferred until project list is stable per FEATURES.md.
- **Stack-view per-key copy buttons (copy individual category)** — v2. v1 ships single full-JSON copy button only.
- **Real git SHA-1 hashes for experience.log** — v2. v1 uses handoff toy hex from index. Real hashes would need a build-time deterministic hash function (e.g. `crc32(company + role + period)`).
- **Dynamic OG images per route** — Phase 5 (SEO-03). Phase 3 lands per-view `description` + `canonical` only.
- **Twitter card metadata, JSON-LD Person schema, favicon set** — Phase 5 (SEO-01, SEO-02, SEO-04).
- **`@axe-core/playwright` 8-combination contrast audit** — Phase 5 (A11Y-07).
- **`prefers-reduced-motion` comprehensive pass** — Phase 5 (A11Y-03). Phase 3 uses the `slideIn` animation Phase 2 already wrapped in `@media (prefers-reduced-motion: reduce)` defensive baseline; no new motion introduced.
- **Mobile bottom-sheet palette + sidebar drawer + STATUS rehoming** — Phase 4 (MOBILE-01..05, PALETTE-05).
- **Print stylesheet (`@media print`)** — Phase 4 (A11Y-09).
- **`/writing/[slug]` dynamic post pages** — out of v1. v1 ships writing-list-view only (per WRITING type — `slug` field exists for future use, not consumed in Phase 3).
- **Real bio / projects / writing / shipped / experience / location content** — Phase 6 (CONTENT-01..07). Phase 3 ships against empty arrays + TODO markers.
- **`hire-me.txt` 8th view** — v3 (VIEW-V3-01). Only relevant during active job search.
- **Real resume PDF (`Bakytbek_Tatibekov_Resume.pdf`)** — Phase 6 (CONTENT-05). Phase 3 links to `/resume.pdf` via `PROFILE.resumeUrl`; the placeholder file from Phase 1 is what gets downloaded until Phase 6.
- **Vercel Analytics `resume_download` event** — Phase 7 (DEPLOY-06).
- **CSP nonce work for inline scripts** — Phase 1 D-15 deferred. Phase 3 introduces no new inline scripts.
- **Console signature easter egg + view-source HTML comment** — Phase 5 (DEV-01, DEV-02).
- **App Store / Google Play badge license review** — DO NOT defer; **planner research item at plan-phase time** (per D-13). The badge SVG sources + license boilerplate must be locked before plan-phase exits, otherwise Phase 3 ships shipped.app with a license risk. Captured in deferred only as a flag — actual work happens during plan-phase research.

### Reviewed Todos (not folded)

None — `gsd-tools list-todos` returned 0 pending todos at discuss time.

</deferred>

---

*Phase: 03-views*
*Context gathered: 2026-05-06*
