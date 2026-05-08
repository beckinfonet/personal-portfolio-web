# Phase 5: SEO + Accessibility Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 05-seo-accessibility-polish
**Areas discussed:** OG + favicon visual identity, JSON-LD scope + timing, DEV easter eggs + reduced-motion specifics, Phase 4 carry-forward fold

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| OG + favicon visual identity | SEO-03 + SEO-04 visual decisions | ✓ |
| JSON-LD scope + timing | SEO-02 phase coordination | ✓ |
| Contrast audit + remediation | A11Y-07 tooling + per-hue overrides | |
| DEV easter eggs + reduced-motion specifics | DEV-01/02 + A11Y-03 | ✓ |

**Phase 4 carry-forward fold:** Recommended (Fold into Phase 5) ✓

---

## OG + favicon visual identity

### OG image visual approach for next/og ImageResponse?

| Option | Description | Selected |
|--------|-------------|----------|
| Pure-text card | Name + role + active "file name" + accent block. Most defensible in next/og. | ✓ |
| Prompt-line styled | `$ cat <file>` with cursor block + body below. More layout risk. | |
| Faux-terminal screenshot frame | Mock chrome (traffic dots + path label). Most distinctive but expensive. | |

**User's choice:** Pure-text card

### Accent hue handling for OG images?

| Option | Description | Selected |
|--------|-------------|----------|
| Matrix-only (default brand) | One PNG per route. SEO-V2-02 defers per-hue variants to v2. | ✓ |
| All 4 hues × 7 routes (28 OGs) | Combinatorial test surface; premature for v1. | |
| No accent block, text-only neutral | Loses brand-color signal; goes against success criterion 1. | |

**User's choice:** Matrix-only (default brand)

### OG background — dark theme, light theme, or both?

| Option | Description | Selected |
|--------|-------------|----------|
| Dark only (matches default theme) | Default theme is dark per PROJECT.md. Single rendering pipeline. | ✓ |
| Match user's current theme cookie | Doesn't actually work — unfurl bots don't carry user state. | |
| Light bg for SEO unfurl readability | Trades brand signal for negligible legibility win on Outlook. | |

**User's choice:** Dark only (matches default theme)

### Favicon glyph for app/icon.tsx?

| Option | Description | Selected |
|--------|-------------|----------|
| `>_` | Universal terminal-prompt signal; reads at 16px. | ✓ |
| `$` | POSIX prompt; risk of being read as "money". | |
| Path-style `~/` | Home-directory motif; unclear at 16px. | |
| Pure prompt-block square | Distinctive but loses terminal read. | |

**User's choice:** `>_`

### app/manifest.ts scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal | name + short_name + icons + theme-color + bg + display: 'browser'. | ✓ |
| PWA-lite (installable) | Adds `display: 'standalone'` for iOS/Android home-screen. Not warranted. | |
| Skip manifest.ts | SEO-04 explicitly lists manifest.ts. Reject. | |

**User's choice:** Minimal

### Per-route OG image copy template?

| Option | Description | Selected |
|--------|-------------|----------|
| Route label + role line | Top: name + role. Bottom: `~/portfolio/<route.label>` with accent block. | ✓ |
| Route label only, larger | Drops the role; loses "who is this" signal for hiring managers. | |
| Custom copy per route | Most expressive but ~7x maintenance churn. | |

**User's choice:** Route label + role line

### apple-icon.png (180px) approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Rasterize app/icon.tsx output at 180px | Same `>_` glyph at 180×180 via `app/apple-icon.tsx`. One source of truth. | ✓ |
| Hand-design distinct 180px PNG | Risk of drift; doubles maintenance. | |
| Reuse existing app/icon.tsx without 180px variant | iOS upscaling looks bad. SEO-04 lists apple-icon explicitly. | |

**User's choice:** Rasterize app/icon.tsx output at 180px

### theme-color meta values per scheme?

| Option | Description | Selected |
|--------|-------------|----------|
| Match terminal panel bg per scheme | Dark `--bg` for dark, light `--bg` for light. Invisible top-bar boundary. | ✓ |
| Accent-tinted | Accent is user-swappable; theme-color isn't — they desync. | |
| Pure neutrals (#000 / #fff) | Doesn't blend with the actual `--bg` token. Visible seam. | |

**User's choice:** Match terminal panel bg per scheme

---

## JSON-LD scope + timing

### When does the JSON-LD Person script actually go live?

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 5 with available fields | Ship name + jobTitle + url + sameAs (filtered) + email now. Description/image join Phase 6. | ✓ |
| Phase 5 builds slot, Phase 6 flips on | Env-flag gated; risk of forgetting flip. | |
| Defer JSON-LD entirely to Phase 6 | Puts SEO-02 outside its mapped phase. | |

**User's choice:** Phase 5 with available fields

### How are PROFILE.socials filtered into the JSON-LD `sameAs` array?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-filter to non-TODO entries | Helper iterates PROFILE.socials, includes only valid http(s) URLs. | ✓ |
| Hard-code GitHub + LinkedIn + 3rd at JSON-LD callsite | Drift risk — same data in 2 places. | |
| Include all socials regardless of state | Ships TODO sentinels to crawlers. Reject. | |

**User's choice:** Auto-filter to non-TODO entries

### Schema.org Person field set to ship in Phase 5?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimum useful + email | `@context, @type: Person, name, jobTitle, url, sameAs, email`. | ✓ |
| Minimum without email | Trades Knowledge Panel signal for negligible scraper reduction. | |
| Richer set + address + image | Both fields require Phase 6 content; effectively pushes ship to Phase 6. | |

**User's choice:** Minimum useful + email

---

## DEV easter eggs + reduced-motion specifics

### console.log signature (DEV-01) content and tone?

| Option | Description | Selected |
|--------|-------------|----------|
| ASCII name + invitation + contact | JetBrains-style ASCII art name + "Source at github.com/...", "Available for hire — email". | ✓ |
| Prompt-line ASCII (`> hello, engineer.`) | Smaller, no name art — just prompt + invitation rows. | |
| Verbose engineer note (5+ lines, technical) | Tech-stack mention, build hash, version. Closer to debug header. | |

**User's choice:** ASCII name + invitation + contact

### Where to inject the console.log signature?

| Option | Description | Selected |
|--------|-------------|----------|
| useEffect in a tiny client island | New `app/components/shell/console-signature.tsx`. ~15 lines. | ✓ |
| Inline `<script>` in `<head>` via dangerouslySetInnerHTML | Fires before hydration but adds CSP/inline-script surface. | |
| Add to an existing client island (e.g., TopBar) | Mixes concerns; harder to grep. | |

**User's choice:** useEffect in a tiny client island

### view-source HTML comment (DEV-02) content?

| Option | Description | Selected |
|--------|-------------|----------|
| Job-preference invitation | 6-line lowercase letter (greeting + tech stack + open to + contact + thanks). | ✓ |
| Same content as console signature | Spec explicitly says "different message from console". Reject. | |
| Brief one-line greeting only | Loses the 6-line spec wording from DEV-02 / FEATURES.md. | |

**User's choice:** Job-preference invitation

### How should `prefers-reduced-motion: reduce` handle cursor blink + animations?

| Option | Description | Selected |
|--------|-------------|----------|
| Belt-and-suspenders global reset + targeted overrides | Global `*, *::before, *::after` animation/transition reset + retain existing targeted rules. | ✓ |
| Targeted only — audit + fill gaps | Per-selector approach; future regressions could leak. | |
| Slow-but-visible cursor blink (~4s) | Some prefer for "liveness"; current `animation: none` is the safer default. | |

**User's choice:** Belt-and-suspenders global reset + targeted overrides

---

## Phase 4 carry-forward fold (inline socials on /about)

### Where on /about does the inline socials block land?

| Option | Description | Selected |
|--------|-------------|----------|
| Beneath lead paragraph (per Plan 04-05) | New block immediately after bio, before highlights/stat-cards. | ✓ |
| Inside the existing CTA row | Overlaps with VIEW-01 D-10 ghost-button socials. | |
| After the highlights/stat-cards row | Lowest visibility; defeats discoverability goal. | |

**User's choice:** Beneath lead paragraph

### Visibility at desktop vs mobile?

| Option | Description | Selected |
|--------|-------------|----------|
| Always visible (desktop + mobile) | Belt-and-suspenders against recruiter friction at all viewports. | ✓ |
| Mobile-only (<=960px), mirrors STATUS pattern | Doesn't change desktop /about layout but unmeasured friction risk. | |
| Mobile-first — desktop hidden behind disclosure | Adds complexity with no clear win. | |

**User's choice:** Always visible (desktop + mobile)

### Visual treatment for the inline socials block?

| Option | Description | Selected |
|--------|-------------|----------|
| Mini contact-card pattern | 80–90px LABEL column + accent link rows. Borrows contact-view design. | ✓ |
| Compact inline pipe-separated list | Lowest visual weight; risk of wrapping at 375px. | |
| Reuse existing about-view ghost-button row pattern | Duplicates CTA row content; redundancy not clarity. | |

**User's choice:** Mini contact-card pattern

### Socials data source for the inline block?

| Option | Description | Selected |
|--------|-------------|----------|
| Hard 3-tuple: email + github + linkedin | PROFILE.email + PROFILE.socials filtered by name match. Build-time guard for TODO URLs. | ✓ |
| Read from PROFILE.socials filtered to non-TODO + email | Row count flips from 3 to 2 pre-Phase-6 — visual jitter. | |
| All PROFILE.socials regardless of state | Breaks INFRA-05 grep on TODO sentinels. Reject. | |

**User's choice:** Hard 3-tuple: email + github + linkedin

---

## Claude's Discretion

The user did NOT select these areas for live discussion; CONTEXT.md captures the recommended defaults under planner discretion:

- **Contrast audit + remediation (A11Y-07)** — `@axe-core/playwright` 8-combination matrix; CI vs local-only choice and per-hue chroma override aggressiveness deferred to plan-phase. Documented in CONTEXT.md D-20..D-23.

## Deferred Ideas

Tracked in CONTEXT.md `<deferred>` section:
- Per-hue OG image variants (v2 / SEO-V2-02)
- `twitter:creator` handle (Phase 6 with 3rd-social pick)
- JSON-LD `description`, `image`, `address` (Phase 6 with content)
- `x-portfolio-source` HTTP header value (Phase 7 with public URL)
- PWA installable manifest (out of scope; v3 candidate)
- 3rd-social pick decision (Phase 6 content)
- CSP nonce work for inline scripts (Phase 1 D-15 deferred; revisit if security audit requires)

---

*Discussion log generated 2026-05-07.*
