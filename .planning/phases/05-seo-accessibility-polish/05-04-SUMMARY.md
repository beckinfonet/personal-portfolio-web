---
phase: 05-seo-accessibility-polish
plan: 04
subsystem: about-view + a11y (recruiter discoverability)
tags: [accessibility, a11y-04, about-view, phase-4-carry-forward, recruiter, css, rsc]

# Dependency graph
requires:
  - phase: 05-seo-accessibility-polish
    provides: "Plan 05-01 Wave 0 — about-view.test.tsx exists with 5 existing assertions; Plan 05-03 globals.css universal-selector reduced-motion reset (untouched here)"
  - phase: 03-views
    provides: "app/components/primitives/external-link.tsx RSC primitive (target=_blank + rel=noopener + ↗ glyph); .contact-row CSS class with 90px 1fr auto grid (reused as-is)"
  - phase: 02-shell
    provides: "app/globals.css with --border + --muted tokens"
provides:
  - "app/components/views/about-socials.tsx RSC mini-contact-card (3 rows: EMAIL mailto / GITHUB ExternalLink / LINKEDIN ExternalLink) — D-33 D-34"
  - "<AboutSocials profile={profile} /> wired into about-view.tsx between bio paragraphs and .about-cards (D-31 recruiter scan path)"
  - ".about-socials-card + .contact-muted CSS in app/globals.css (D-32 always-visible no @media gating)"
  - "5 new about-view.test.tsx assertions covering wrapper + EMAIL row + GITHUB ExternalLink + LINKEDIN ExternalLink + DOM position invariant"
  - "TODO-uppercase clean in new file (Pitfall 9 / INFRA-05 postbuild grep stays green)"
affects: [05-05, 05-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern: Inline mini-contact-card on /about — reuses existing .contact-row class (90px 1fr auto grid) inside a .about-socials-card flex-column wrapper. No new design surface; just relocation of contact-view's row pattern onto /about for recruiter discoverability."
    - "Pattern: D-34 invalid-url guard via /^https?:\\/\\// regex. RSC component falls back to <span class=\"contact-muted\"> when the URL doesn't match http(s)://; INFRA-05 prebuild grep blocks TODO sentinels from reaching production builds."
    - "Pattern: Empty <span /> spacer at the end of .contact-row 3-column grid (LABEL + LINK + spacer) — without the spacer the grid collapses; this matches the contact-view convention verbatim."
    - "Pattern: Test scoping when multiple aria-labels overlap. AboutSocials and the existing .about-cta-row both expose ExternalLinks with aria-label /open github/i and /open linkedin/i; tests scope to .about-socials-card via container.querySelector to disambiguate. Top-level getByRole would match multiple elements and throw."

key-files:
  created:
    - "app/components/views/about-socials.tsx (RSC, ~75 lines — 3-row mini-contact-card with TODO-guard fallback)"
  modified:
    - "app/components/views/about-view.tsx (+2 lines — import + JSX insertion between bio paragraphs and .about-cards)"
    - "app/components/views/about-view.test.tsx (+44 lines — 5 new test cases under new describe block)"
    - "app/globals.css (+20 lines — .about-socials-card + .contact-muted block appended after .about-cta-row)"

key-decisions:
  - "Combined Task 1 GREEN + Task 2 wiring into the GREEN commit (9c40f4c). The plan's tests render <AboutView> and look for .about-socials-card — for the tests to pass, AboutView must render AboutSocials. Splitting the wire-in into Task 2 would have left Task 1 in a partial-green state. Cleaner sequence: RED (test) → GREEN (component + wire-in) → CSS append. Three commits, each atomic."
  - "Test-side scoping fix [Rule 3]: GITHUB and LINKEDIN row assertions originally used top-level getByRole, which matches multiple elements because the existing .about-cta-row also exposes ExternalLinks with aria-label /open github/i and /open linkedin/i. Scoped to container.querySelector('.about-socials-card') and querySelector('a[aria-label^=\"Open GitHub\"]') / 'Open LinkedIn' to assert the contract under test (the row inside the new block). Same plain-noun aria-label phrasing preserved for A11Y-04 — only the test-locator changed."
  - "Reused existing .contact-row class with its 90px 1fr auto 3-column grid as-is — the plan mentioned an 80px column from UI-SPEC, but redefining .contact-row would have cascaded onto contact-view. The 90px grid produces the same visual hierarchy (LABEL + LINK + spacer) and matches contact-view byte-identically. UI-SPEC's 80px figure was descriptive of the design system column, not a binding override."
  - "Comment wording uses 'D-34 invalid-url guard' (NOT 'D-34 TODO-guard') to keep the new file's grep clean against /^TODO/ — Pitfall 9 / INFRA-05. The plan's action block called this out explicitly and provided the rewritten comment; no mid-task self-correction needed."

patterns-established:
  - "Pattern: Inline contact-card within a content-block view body — first instance lives on /about; precedent for any future view that wants a 'fast contact lookup' affordance without leaving the route."
  - "Pattern: Container-scoped test queries when aria-labels collide across DOM regions — applied to GITHUB + LINKEDIN row assertions; precedent for any future test that needs to disambiguate same-aria-label links across new and existing UI."

requirements-completed: [A11Y-04]

# Metrics
duration: 3m 51s
completed: 2026-05-10
---

# Phase 5 Plan 04: Wave 2 — AboutSocials Inline Mini-Contact Card (Phase 4 → 5 Carry-Forward) Summary

**3-row inline mini-contact-card on /about (EMAIL mailto + GITHUB ExternalLink + LINKEDIN ExternalLink) inserted immediately after the bio paragraphs and before the highlights row, reusing the existing .contact-row pattern with a TODO-guard fallback. Resolves the explicit Phase 4 → Phase 5 carry-forward (Plan 04-05 Gate 9 friction): recruiter took 8–10s to find contact info on mobile because the hamburger menu wasn't discoverable; AboutSocials lifts the email/github/linkedin block into the recruiter scan path.**

## Performance

- **Duration:** ~3m 51s
- **Started:** 2026-05-10T16:22:09Z
- **Completed:** 2026-05-10T16:26:00Z
- **Tasks:** 2 (Task 1 TDD; Task 2 autonomous CSS append)
- **Files created:** 1 (`app/components/views/about-socials.tsx`)
- **Files modified:** 3 (`app/components/views/about-view.tsx`, `app/components/views/about-view.test.tsx`, `app/globals.css`)

## Accomplishments

- New `app/components/views/about-socials.tsx` RSC ships with 3 rows: EMAIL (`mailto:` to PROFILE.email), GITHUB (ExternalLink with TODO-guard), LINKEDIN (ExternalLink with TODO-guard). Wrapped in `<div className="about-socials-card" role="group" aria-label="Quick contact">` per D-33.
- `<AboutSocials profile={profile} />` wired into `about-view.tsx` immediately after `profile.bio.long.map(...)` and before `<div className="about-cards">` — D-31 recruiter scan path (name → bio → contact options → highlights/CTA).
- D-34 invalid-url guard implemented via `isRealUrl()` helper — `/^https?:\/\//.test(url)`. Falls back to `<span className="contact-muted">{handle}</span>` when URL fails the check; INFRA-05 prebuild grep blocks any `TODO:` sentinel from reaching production. Defense-in-depth against `javascript:alert(1)` style URLs (T-05-13 mitigation).
- Both GitHub and LinkedIn rows use the existing `<ExternalLink>` primitive from Phase 3 (target=_blank + rel=noopener + trailing ↗ glyph) — no edits to the primitive (read-only).
- `app/globals.css` gains `.about-socials-card` (max-width 480px, margin 24px 0 24px, padding-top 16px, border-top 1px solid var(--border), display flex column) + `.contact-muted` (13px, var(--muted)) appended after `.about-cta-row`. No new `--*` CSS custom properties (UI-SPEC §"Phase 5 does NOT add new tokens"). The wrapper is flex-column; the existing `.contact-row` 3-column grid is inherited per child.
- 5 new `about-view.test.tsx` assertions ship: wrapper presence + role=group + aria-label="Quick contact"; EMAIL mailto href; GITHUB target=_blank + rel=noopener; LINKEDIN target=_blank + rel=noopener; DOM position invariant (AboutSocials precedes .about-cards). Total about-view.test.tsx now at 10 passing assertions (was 5).
- Vitest 26 files / 113 tests green (was 26/108 — added 5 new about-view assertions).
- `npm run build` exits 0; 23 static pages render including the 8 OG cards from Plan 05-02.
- `npm run lint` clean; `npx tsc --noEmit` clean; `npm run check:mobile` clean (3 audit scripts unaffected).
- Postbuild `scripts/check-placeholders.mjs` clean — no uppercase `TODO` leaked into `.next/server/`.

## Task Commits

Each task was committed atomically; Task 1 followed the TDD RED → GREEN sequence (the GREEN commit also includes the AboutView wire-in because the new tests render `<AboutView>` and require AboutSocials to be wired — without the wire-in, the wrapper + EMAIL + DOM-position assertions can't pass):

1. **Task 1 RED: failing AboutSocials assertions** — `c7d0d16` (test)
2. **Task 1 GREEN: AboutSocials RSC + wire into AboutView + test-scoping fix** — `9c40f4c` (feat)
3. **Task 2: append .about-socials-card + .contact-muted CSS** — `951d988` (feat)

## Files Created/Modified

**Created:**

- `app/components/views/about-socials.tsx` — RSC, 76 lines. Single export `AboutSocials({ profile }: AboutSocialsProps)`. Internal helper `isRealUrl(url)` for D-34 guard. Imports `Profile` from `@/lib/types` and `ExternalLink` from `@/app/components/primitives/external-link`. NO `"use client"` (Pitfall 9 / SHELL-02). 3 rows always rendered (EMAIL unconditional; GITHUB + LINKEDIN conditional on `find((s) => s.kind === ...)` returning a Social). aria-labels match contact-view convention verbatim: `Send email to {email}`, `Open GitHub (opens in new tab)`, `Open LinkedIn (opens in new tab)`.

**Modified:**

- `app/components/views/about-view.tsx` — added `import { AboutSocials } from "./about-socials"` (alphabetical position not strictly maintained — placed last in the import block to keep the Phase 4 + Phase 5 imports visually grouped). Inserted `<AboutSocials profile={profile} />` between the bio paragraphs `.map(...)` closing parens and the `<div className="about-cards">` opening tag. Net: +2 lines.
- `app/components/views/about-view.test.tsx` — added a NEW `describe("AboutView — Phase 4 carry-forward inline socials (D-31..D-34)", ...)` block with 5 test cases. The original `describe("AboutView", ...)` block stays unchanged with its 5 tests. Net: +44 lines.
- `app/globals.css` — appended a 20-line CSS block after `.about-cta-row` and before the `Phase 3 — projects-view` section header. New block contains `.about-socials-card` (flex-column wrapper, 480px max-width, 24px vertical margins, 16px padding-top, 1px border-top in `var(--border)`) + `.contact-muted` (13px font, `var(--muted)` color). Net: +20 lines.

## Decisions Made

- **Combined Task 1 GREEN + AboutView wire-in into a single commit (`9c40f4c`).** The plan splits the AboutView wire-in across Task 1 ("create RSC + tests pass") and Task 2 ("wire into about-view.tsx + append CSS"). The new tests render `<AboutView>` and look for `.about-socials-card` — they cannot pass with a freestanding component that hasn't been wired in. Splitting the wire-in into Task 2 would have left Task 1's TDD GREEN gate in a partial-pass state (3 of 5 new assertions failing). Cleaner sequence: RED (test) → GREEN (component + wire-in) → CSS append. Three commits, each atomic; TDD gate intact (RED→GREEN visible in git log).
- **Test-side scoping fix [Rule 3 - Blocking].** The plan's GITHUB/LINKEDIN row assertions used top-level `screen.getByRole("link", { name: /open github/i })` — but the existing `.about-cta-row` (Phase 3) already exposes ExternalLinks with the same aria-label format (`Open ${s.label} (opens in new tab)`). After wiring AboutSocials, both blocks render matching links and `getByRole` throws "Found multiple elements". Resolved by scoping the lookup to `container.querySelector(".about-socials-card")` then `block.querySelector('a[aria-label^="Open GitHub"]')` (and LinkedIn). Asserts the same target/rel attributes; the contract under test is the row inside the new block, not the existing CTA row link. Plain-noun aria-label phrasing preserved for A11Y-04. Test count stays at 10 total.
- **Reused existing .contact-row class with its 90px 1fr auto 3-column grid as-is.** UI-SPEC mentions an 80px LABEL column; the existing `.contact-row` uses 90px. Redefining `.contact-row` would have cascaded onto contact-view (which has a working 90px column today). The 90px column produces the same visual hierarchy (LABEL + LINK + spacer); UI-SPEC's 80px figure was a design-system reference, not a binding override. Visual fidelity to contact-view is the design intent (D-33: "Borrows the existing app/components/views/contact-view.tsx row pattern").
- **Comment wording uses 'D-34 invalid-url guard' (NOT 'D-34 TODO-guard').** Pitfall 9 / INFRA-05 forbids uppercase `TODO` in any source file. The plan's action block called this out explicitly and provided the rewritten comment ("D-34 invalid-url guard: if a social URL fails the /^https?:\/\// check, render the row as muted plain text — no <a> tag — to avoid emitting a broken link."). Same intent — the regex is what enforces the guard, not the string `TODO`. No mid-task rewrite needed; followed the plan's pre-corrected wording verbatim.
- **Empty `<span />` spacer at end of each `.contact-row`.** The existing `.contact-row` is a 3-column grid (LABEL + LINK + spacer); without the trailing spacer, the row collapses and the grid resolves to 2 columns. Matches contact-view convention; follows the plan's explicit guidance.
- **Wrapper is `display: flex; flex-direction: column`, NOT `display: grid`.** The `.contact-row` children inherit their own 3-column grid from `.contact-row`'s rule; the wrapper just stacks rows vertically. UI-SPEC §"AboutSocials block visual" specifies this layout intent; following the plan's guidance verbatim.
- **No new `--*` CSS custom properties.** UI-SPEC §"AboutSocials block visual" + Phase 5 lock from CONTEXT.md: this phase explicitly does NOT add new tokens. Reused existing `var(--border)` and `var(--muted)`.
- **No `CopyButton` on the EMAIL row.** Contact-view has one for the email row; D-33 specifies the lighter inline-card variant without copy buttons (mini-contact-card character). Followed the plan's guidance verbatim — only `.contact-row` CSS reuse, not the contact-view CopyButton primitive.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test-side scoping fix to disambiguate GITHUB/LINKEDIN aria-labels**
- **Found during:** Task 1 GREEN verification (initial vitest run after wiring AboutSocials produced 2 failures: `getByRole("link", { name: /open github/i })` and `/open linkedin/i` matched multiple elements because the existing `.about-cta-row` ExternalLinks also use the same aria-label format).
- **Issue:** The plan's `<action>` block on Task 1 wrote the GITHUB/LINKEDIN assertions as `screen.getByRole("link", { name: /open github/i })` — but the existing `app/components/views/about-view.tsx:47-56` Phase 3 CTA row maps over `profile.socials` and produces ExternalLinks with `aria-label={`Open ${s.label} (opens in new tab)`}`. After wiring the new AboutSocials block, both regions match the same regex; `getByRole` throws "Found multiple elements" by design.
- **Fix:** Scoped the lookup to `container.querySelector(".about-socials-card")` then `block.querySelector('a[aria-label^="Open GitHub"]')` (and LinkedIn). Asserts the same target=_blank + rel=noopener attributes. The contract under test is the row inside the new block, not the existing CTA row link. Plain-noun aria-label phrasing preserved for A11Y-04 — only the test-locator changed (no production aria-label changes).
- **Files modified:** `app/components/views/about-view.test.tsx` (test-locator scoping; same commit as Task 1 GREEN — `9c40f4c`)
- **Verification:** All 10 about-view.test.tsx assertions pass after the fix.
- **Committed in:** `9c40f4c` (Task 1 GREEN; the test-locator fix landed in the same commit as the production code because they form one logical TDD GREEN unit).

---

**Total deviations:** 1 auto-fixed (1 Rule 3 self-correction inside Task 1; the plan's tests didn't account for aria-label collision with the existing Phase 3 CTA row).

**Impact on plan:** None on contract. The test-locator change preserves the recruiter discoverability contract (same plain-noun aria-labels, same target/rel attributes verified). The fix is a tightening of the assertion scope — exactly the contract the plan intends (row INSIDE the new block, not anywhere on the page).

## Issues Encountered

- **None blocking.** All gates green after the test-scoping fix. Build, vitest, typecheck, lint, check:mobile, and manual grep audits all pass on the first iteration after the self-correction.

## Threat Flags

None — this plan operates entirely within the threat surface analyzed in 05-04-PLAN.md `<threat_model>`:

- **T-05-13 (Spoofing — TODO string in build output):** MITIGATED. `! grep -E '\bTODO\b' app/components/views/about-socials.tsx` exits 0 (clean). Comment text uses "invalid-url guard" wording. Postbuild `scripts/check-placeholders.mjs` reports `INFRA-05: .next/server/ clean (no forbidden strings)`.
- **T-05-14 (Tampering — Tabnabbing via target=_blank):** MITIGATED. `<ExternalLink>` primitive sets `rel="noopener noreferrer"` (verified at `app/components/primitives/external-link.tsx:28`). about-view.test.tsx now asserts `expect(link).toHaveAttribute("rel", "noopener noreferrer")` for both GitHub and LinkedIn rows.
- **T-05-15 (Information Disclosure — Email harvesting via mailto):** ACCEPT (per plan). The email `beckprograms@gmail.com` is already public on /contact (Phase 3) and exposed via PROFILE.email in JSON-LD (Plan 05-05). Recruiter discoverability is the explicit goal; obfuscation contradicts the recruiter-test requirement.

No new public route surface, no new auth paths, no new schema changes. The new about-view inline socials block reads from existing `lib/portfolio-data.ts` PROFILE constants; no runtime user input flows through it.

## Authentication Gates

None. No external service auth, no API keys, no environment variables introduced. The component reads `PROFILE` from `lib/portfolio-data.ts` (in-tree static data); the build-time `INFRA-05` grep + `D-34` runtime regex together guarantee no broken/insecure URLs reach production.

## User Setup Required

None — the inline socials block is fully self-contained. Recruiters visiting `/about` will see the new block immediately after the bio paragraphs at every viewport (D-32 always-visible no @media gating). The 3 rows render against current `PROFILE.socials` values; if Phase 6 swaps in an updated LinkedIn URL or adds a 3rd social, the LinkedIn row updates automatically and the 3rd-social entry is silently ignored (AboutSocials hardcodes the github + linkedin tuple per D-34).

Plan 05-08 will run a manual gate to verify the recruiter scan path on mobile (5-second test from CLAUDE.md "Dual audience non-negotiables"). That gate is queued; this plan ships the source-level guarantees.

## Self-Check: PASSED

Verified files exist on disk:

- FOUND: `app/components/views/about-socials.tsx` (created — 76 lines, RSC with role=group + aria-label + isRealUrl guard)
- FOUND: `app/components/views/about-view.tsx` (modified — AboutSocials import + JSX between bio paragraphs and .about-cards)
- FOUND: `app/components/views/about-view.test.tsx` (modified — 10 total assertions in 2 describe blocks)
- FOUND: `app/globals.css` (modified — .about-socials-card + .contact-muted block appended after .about-cta-row)

Verified commits exist:

- FOUND: `c7d0d16` test(05-04): add failing AboutSocials assertions for D-31..D-34 contract
- FOUND: `9c40f4c` feat(05-04): add AboutSocials RSC + wire into AboutView (D-31..D-34, A11Y-04)
- FOUND: `951d988` feat(05-04): append .about-socials-card + .contact-muted CSS (D-31..D-34)

Verified gates:

- `npm test` — 26 files / 113 tests passing (was 26/108 — added 5 new about-view assertions)
- `npm run build` — exits 0; 23 static pages render
- `npm run lint` — exits 0
- `npx tsc --noEmit` — exits 0
- `npm run check:mobile` — exits 0 (3 audit scripts: sidebar-redistribution + print-rules + mobile-palette unaffected)
- Postbuild `scripts/check-placeholders.mjs` — clean (`INFRA-05: .next/server/ clean (no forbidden strings)`)
- `! grep -E '\bTODO\b' app/components/views/about-socials.tsx` — exits 0 (no uppercase TODO in new file)
- `grep -q '.about-socials-card' app/globals.css` — exits 0
- `grep -q '<AboutSocials profile={profile} />' app/components/views/about-view.tsx` — exits 0
- DOM position invariant test passes — `<AboutSocials />` renders BEFORE `.about-cards` (D-31 scan path locked)

## TDD Gate Compliance

Plan 05-04 Task 1 declared `tdd="true"` and followed the RED → GREEN sequence:

- **RED gate:** commit `c7d0d16` (`test(05-04): add failing AboutSocials assertions...`) added 5 new assertions; 3 of 5 failed against unmodified about-view.tsx (wrapper + EMAIL + DOM-position; the 2 that passed — GITHUB + LINKEDIN — were finding the existing .about-cta-row ExternalLinks via aria-label match, which is exactly the collision the GREEN-phase test-scoping fix resolved).
- **GREEN gate:** commit `9c40f4c` (`feat(05-04): add AboutSocials RSC + wire into AboutView...`) added the new component + wire-in + test-scoping fix; all 10 assertions passed.
- **REFACTOR gate:** N/A — no cleanup needed for this small surface; the test-scoping fix landed inside the GREEN commit because it's a Rule 3 blocking auto-fix, not a refactor.

Gate sequence is intact; no warning needed.

## Next Phase Readiness

Wave 2 partial complete (Plan 05-04 of Wave 2). Plan 05-05 (Wave 2 — JSON-LD Person + HeadComment + mount in app/layout.tsx `<head>`) is the next sequential task. Its dependencies are unaffected by this plan:

- `lib/json-ld.ts` (NEW in 05-05) — independent of about-view.tsx
- `app/components/shell/json-ld-person.tsx` (NEW in 05-05) — independent of about-view.tsx
- `app/components/shell/head-comment.tsx` (NEW in 05-05) — independent of about-view.tsx
- `app/layout.tsx` (UPDATED in 05-05) — independent of about-view.tsx; only adds `<JsonLdPerson />` + `<HeadComment />` mounts as siblings to `<AccentBootstrapScript />`

The about-view.tsx + globals.css edits in this plan touch lanes orthogonal to Plan 05-05's lane (app/layout.tsx + lib/json-ld.ts + new shell components). No blockers for Wave 2 continuation.

Plan 05-08 manual gates (recruiter 5-second test, view-source HTML comment check) will validate the recruiter discoverability outcome of this plan in the production-fidelity verification pass.

---
*Phase: 05-seo-accessibility-polish*
*Completed: 2026-05-10*
