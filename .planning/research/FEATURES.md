# Feature Research

**Domain:** Personal portfolio for a Sr. Software Engineer with terminal/IDE aesthetic
**Researched:** 2026-05-06
**Confidence:** HIGH (table stakes anchored in 2026 web baseline + WCAG; differentiators surveyed across real-world terminal portfolios; anti-features grounded in HN feedback patterns)

## Scope Note (Read First)

This file covers features **beyond** the handoff. The handoff already pins:
- 7 views (about, projects, stack, experience, writing, contact, shipped)
- Terminal shell (top bar, sidebar, main column)
- ⌘K palette (open views, download résumé, toggle theme, open socials, type-to-filter)
- Light/dark theme + 4 accent hues + persistence
- Fully responsive (bottom sheet / hamburger below ~960px)
- Per-view App Router routes + sitemap entries
- Static fallback in `lib/portfolio-data.ts`
- Real `resume.pdf` in `public/`
- Recruiter-friendly resume CTA + contact link discoverable in <5s

What follows is everything that **isn't** in the handoff but the 2026 portfolio market and the dual recruiter/engineer audience expect or reward.

**Audience legend** used in tables:
- `both` — engineers + recruiters
- `engineer` — engineering peers / hiring managers / technical interviewers
- `recruiter` — non-technical recruiters

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these damages credibility. Recruiters bounce. Engineers judge.

| Feature | Why Expected | Audience | Complexity | Notes |
|---------|--------------|----------|------------|-------|
| **Dynamic OG image (per route)** | When the URL is shared in Slack/LinkedIn/iMessage, the unfurl shows name + role + accent — not a blank card. Single static OG today is the visible gap in `app/layout.tsx`. | both | M | Use `opengraph-image.tsx` file convention with `next/og` `ImageResponse`. One root + per-view variants showing the active "file name" (e.g. `~/portfolio/projects/`). Self-hosted JetBrains Mono via `@vercel/og`'s font option. |
| **Twitter card metadata** | LinkedIn renders OG; X/Bluesky/Mastodon all consume `twitter:card`. Currently absent from `metadata`. | both | S | Add `twitter: { card: "summary_large_image", ... }` to root metadata; per-route OG inherits. |
| **Per-route metadata (title, description, canonical)** | Each of the 7 routes needs unique `<title>` and `<meta description>` so Google indexes them as distinct pages. Sitemap parity isn't enough. | both | S | `generateMetadata` in each `page.tsx`; canonical via `metadataBase` + `alternates.canonical`. |
| **Favicon set + apple-touch-icon + theme-color** | Tab favicon, iOS bookmark, Android PWA install banner color. Default Next.js favicon = unprofessional. | both | S | Use Next.js metadata file convention: `app/icon.tsx` (generated terminal-prompt glyph), `app/apple-icon.png`, `app/manifest.ts`. `theme-color` per scheme via `<meta name="theme-color">`. |
| **JSON-LD `Person` schema** | Google's Knowledge Panel + rich results for personal-name searches. The portfolio's #1 SEO job is to rank #1 for the developer's name. | both | S | `<script type="application/ld+json">` in root layout with `@type: Person`, `jobTitle`, `url`, `sameAs: [github, linkedin, ...]`. |
| **Skip-link to main content** | WCAG 2.1 success criterion 2.4.1 (Bypass Blocks). Keyboard users with the sidebar between top bar and main need to jump past it. | both (a11y) | S | Visually hidden anchor `#main-content` revealed on `:focus` at top of body. Already-styled-friendly via existing `globals.css`. |
| **`prefers-reduced-motion` honored** | The slideIn (0.25s), cursor blink (1s), boot animation (350ms fade-in), and live clock tick all need to respect OS reduce-motion. WCAG 2.3.3. | both (a11y) | S | `@media (prefers-reduced-motion: reduce)` block disabling animations + dampening cursor blink. Live clock can keep updating but skip transitions. |
| **Visible focus rings** | Keyboard navigability requires `:focus-visible` on every interactive element (file rows, palette items, palette trigger, theme toggle, accent picker, links). Sidebar files are already supposed to be `<button>`s per handoff. | both | S | 2px accent outline + 2px offset on `:focus-visible`. Don't kill default outlines without replacement. |
| **Color contrast ≥ 4.5:1 for body, 3:1 for large text** | WCAG 2.1 AA. The `--muted` / `--bg` pair on light theme (`#6a7370` / `#f4f2ea`) sits near 4.5:1 — verify with axe; tweak `--muted-hi` for muted body text usage. | both | S | Audit with `@axe-core/playwright` once shell exists. Document any failing token pairs. |
| **No SSR theme flash (FOUC)** | Already partially handled by inline script in `layout.tsx`, but accent hue must be applied the same way or first paint shows the wrong color tint. | both | S | Extend the existing pre-hydration script to read `portfolio-accent` and set both `data-theme` and CSS custom prop (or `data-accent`) before paint. `next-themes` doesn't cover the accent — DIY it. |
| **Mobile viewport meta + touch target sizing** | 44×44px tap targets per WCAG 2.5.5 (AAA, but expected). Sidebar file rows at 6×16 padding may be too short on mobile — needs verification in the responsive layout. | recruiter | S | Already in Next default. Audit tap targets on the bottom-sheet file switcher specifically. |
| **Real 404 page** | Default Next.js 404 is utilitarian; this site sets a high aesthetic bar so a generic 404 reads as broken. | both | S | `app/not-found.tsx` rendering inside the shell with a `$ cat /tmp/missing` joke prompt and links to all 7 views. (This is table stakes for the *design system* even though it's also a tiny easter egg.) |
| **Print stylesheet for résumé page parity** | Recruiters often print the résumé link page. Terminal background prints terribly. | recruiter | S | `@media print` in `globals.css`: white bg, black text, hide sidebar/top bar/palette, force serif fallback. Trivial. |
| **404 doesn't return 200** | SEO; per-view dead URLs (e.g. typos in `/projects`) need correct status codes for crawlers. Next handles `not-found.tsx` correctly by default — verify. | engineer | S | Verify in deploy with `curl -I /not-a-route`. |
| **Robots.txt + sitemap.xml include the 7 routes** | Already in `app/robots.ts` + `app/sitemap.ts` — must be updated for the 7 new routes (currently single-page). | both | S | Append to existing files. Set `lastModified` to build time. |
| **Keyboard navigation throughout** | Tab order: top-bar palette button → theme toggle → sidebar files → main content → footer. ⌘K trap focus inside palette modal; Esc restores focus to trigger. | engineer | M | `cmdk` handles palette focus mgmt. Sidebar requires `<button>` (handoff already says this). Test with keyboard-only navigation. |
| **Semantic landmarks** | `<nav aria-label="File explorer">` for sidebar, `<main>` for content, `<header>` for top bar, `<footer>` for credits. Screen-reader rotor lists them. | both (a11y) | S | Pure markup discipline; no extra runtime cost. |
| **`aria-current="page"` on active sidebar file** | Already called out in handoff implementation notes — listing here so it doesn't get dropped. Screen readers announce which "file" is open. | both (a11y) | S | One line per file row. |
| **Live clock has `aria-live="off"` / hidden from SR** | A clock that announces every 30s is a nightmare for screen-reader users. | both (a11y) | S | `aria-hidden="true"` on the clock; it's decoration. |
| **Resume PDF is < 250 KB** | Mobile recruiter on cellular tapping "↓ resume.pdf" should not wait. Current `public/resume.pdf` size unknown — verify. | recruiter | S | `du -h public/resume.pdf`. If too big, re-export from source with embedded fonts subset. |
| **Resume PDF has correct filename + Title metadata** | `Bakytbek_Tatibekov_Resume.pdf` (handoff specifies download attr). PDF's internal `Title`/`Author` fields are what Acrobat/Preview show in window chrome. | recruiter | S | Set in source app (Pages, Word, LaTeX) before export. |
| **Email link uses `mailto:` and is copyable** | Recruiters frequently copy-paste the email rather than open mail client. Must be selectable text, not an image. Handoff `contact.sh` already implies this. | recruiter | S | `<a href="mailto:...">` with text matching the address. |
| **External links: `target="_blank"` + `rel="noopener noreferrer"`** | GitHub/LinkedIn/etc. opening in same tab loses the portfolio. Plus security baseline. | both | S | One helper `<ExternalLink>` component. |
| **LCP < 2.5s on mobile 4G** | Core Web Vitals 2026 threshold, measured at 75th percentile. JetBrains Mono is the largest contentful element risk. | both | M | `next/font/google` already self-hosts; ensure `display: 'swap'` and only load needed weights (400/500/600/700). Preload critical weight. |
| **CLS < 0.1** | Layout shift from font swap (mono ↔ fallback) is the most likely offender. | both | S | Use `font-display: swap` + a system mono fallback with similar metrics (`ui-monospace, "SF Mono", monospace`) and `sizeAdjust` overrides. |
| **INP < 200ms** | Theme toggle, accent change, palette open all run on main thread. `next-themes` flip is fine; accent change must avoid layout thrash. | engineer | S | Animate via CSS variable change on `:root` — cheap. Avoid re-rendering large trees on theme/accent swap (memoize view components). |
| **SSL + HSTS** | Vercel does this by default — list to confirm not regressed. | both | — | No work; verify after deploy. |

### Differentiators (Competitive Advantage)

Signature touches that elevate the portfolio from "another terminal portfolio" to "this person knows what they're doing." These compound the handoff aesthetic without adding gimmickry.

| Feature | Value Proposition | Audience | Complexity | Notes |
|---------|-------------------|----------|------------|-------|
| **Console.log signature on first paint** | The 70% of recruiters who never open DevTools won't see it. The 30% of engineers who do see a JetBrains-ASCII greeting + "Like the site? Source at github.com/..." + email. Cheap, on-brand. | engineer | S | One `useEffect` in root layout, conditional on `typeof window !== "undefined"`. ASCII art generated once with `figlet`. |
| **`view-source:` HTML comment** | A 6-line HTML comment in `<head>` greets developers who curl/right-click → view source. Different message from the console one (e.g. job preferences, current role, "want to talk?"). Yahoo and others have done this for ~15 years; still unexpectedly delightful. | engineer | S | Inject via root layout. Not visible in DevTools Elements panel — only raw view-source. |
| **Custom HTTP header `x-engineered-by`** | Tiny easter egg for the curious dev who runs `curl -I`. Set `x-portfolio-source: github.com/...` and `x-built-with: nextjs-15-react-19`. | engineer | S | `next.config.ts` `headers()` array. Costs ~80 bytes per response. |
| **Real ⌘K verbs, not just navigation** | Handoff lists open-view + open-social + theme-toggle + résumé download. Add: `copy email`, `copy github profile`, `view source on github`, `cycle accent hue`, `print this page`, `share this view (copy URL)`, `open palette help (?)`. Each verb has an alias (`mail` finds `copy email`). | both | M | Maps to `cmdk`'s grouped items. Verb count in palette is the differentiator: 6 items = nav menu; 18 items = command palette. |
| **`?` keyboard shortcut → cheatsheet view inside palette** | GitHub-style. Surfaces every shortcut in the app. Solves the "discoverability of ⌘K itself" problem. | engineer | S | Palette item + global `?` keydown listener (when no input focused). |
| **`g` then letter (`g a`, `g p`, `g s`...) → vim-style nav** | Engineers fluent in vim/GitHub will reach for this before ⌘K. Cheap to add once palette routing exists. | engineer | S | Two-step keydown handler with 1s timeout. Listed in cheatsheet. |
| **Per-view `$ command` is real and copyable** | The `$ ls -la projects/` prompt above each view should be copyable text (not an image / decorative pseudo). When a recruiter copies the whole view, the prompt comes with it — looks intentional. | engineer | S | Pure markup — a `<code>` element. Already implied by handoff but worth flagging as "not a `::before` pseudo-element." |
| **Live `now playing` / `currently building` line in sidebar status** | Below `● Available for hire`, add one editable line (`building: portfolio-web v2.0`, or `reading: Designing Data-Intensive Applications`). Pulled from a single string in `portfolio-data.ts`. Signals the developer is alive and active without committing to a real "now" page. | both | S | Hardcoded in static fallback. Editable via API later if desired. Avoids stale dates. |
| **`shipped.app` view shows real App Store / Play Store deep links** | The 7th view exists because mobile work matters to this developer's identity. Use real `https://apps.apple.com/...` URLs (not just GitHub) so recruiters can tap-through to install. App Store badges as inline SVG (not raster) keep with the typography-first aesthetic. | both | M | Per-app: name, platforms, App Store / Play link, screenshot URL, role, year. Schema in `lib/portfolio-data.ts`. |
| **`$ cat resume.pdf` in palette → triggers download** | Verb that mirrors how an engineer would actually fetch the file from a CLI. Reinforces theme. | engineer | S | Already in palette item list per handoff; phrasing is the differentiator. |
| **Animated cursor in `$ prompt` is the only animation that loops** | Resist the urge to add more animation. The single blinking cursor is the diegetic terminal element; everything else (slideIn, fade-in) plays once and stops. This restraint is what separates "tasteful" from "gimmicky" in HN comments on similar sites. | both | — | Design discipline, not a feature. Document in PITFALLS. |
| **Color-matched OG images per accent hue** | Less critical, but: when the user shares the page after switching to amber, the OG image generated server-side defaults to matrix green. Either accept (recommended — OG is per-URL not per-session) or generate with hue param. Recommendation: ship matrix-only OG, mention the option in PITFALLS. | both | — | Not building; flagging the decision. |
| **Stack view supports tab-to-copy of `stack.json`** | The `$ cat stack.json | jq` view is literally a JSON document. Add a small "copy" button (top-right of pre block) that copies the raw JSON for engineers who want to see the full structure or import elsewhere. | engineer | S | One `<button onClick={() => navigator.clipboard.writeText(JSON.stringify(stack, null, 2))}>`. Reinforces the "this is real data" feel. |
| **Sitemap includes per-project anchors (`/projects#project-name`)** | Each project in `projects/` view becomes deep-linkable. Recruiter sharing one specific project to hiring committee gets a precise URL. | both | S | Add anchor IDs in `ProjectsView`. Sitemap entry per anchor. |
| **404 page is on-brand** (counted as table stakes above; differentiator dimension is the *content*) | `$ cat /var/log/portfolio.log | grep "$pathname"` style fake error message + links to all 7 views. Engineers screenshot this; recruiters still find their way home. | both | S | Already covered above; called out twice because the *quality* of the 404 is a differentiator even though *having one* is table stakes. |
| **`hire-me.txt` view (or palette verb)** | An optional 8th view (or just a palette verb that copies a pre-formatted summary to clipboard) with a 3-paragraph "what I'm looking for" pitch. Not in handoff; high-leverage for recruiters in active job search. **Decision deferred to requirements.** | recruiter | M | If view: 8th sidebar entry, +1 route, +1 sitemap. If palette-only: trivial. |

### Anti-Features (Commonly Requested, Often Problematic)

Things that look fun in someone else's terminal portfolio but actively damage this site's credibility or accessibility.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real interactive REPL / xterm.js shell** | "It would be so cool if you could type `ls` and it actually worked." Existing terminal portfolios (satnaing's, etc.) commit to this fully. | (1) The handoff's *file-tree IDE* aesthetic is **not** a CLI — adding a typed prompt creates two competing mental models. (2) Recruiters cannot use it. (3) Doubles the test surface. (4) Every new view needs a corresponding fake `cat` command implementation. (5) HN feedback on terminal portfolios consistently splits — engineers love them, hiring managers can't find the resume. | The static `$ <command>` prompt above each view is *enough*. It signals "terminal" without forcing interaction. ⌘K is the real "command line." |
| **Typing animation on view content (text appears character-by-character)** | Looks dramatic on first paint. | (1) Delays LCP (content not "painted" until the typing finishes). (2) Annoying on every view switch — recruiters don't want to wait for `experience.log` to type itself out 7 times. (3) Hostile to `prefers-reduced-motion`. (4) Hostile to screen readers (re-announces). | The single 0.25s `slideIn` per view (already in handoff). Cursor blink stays on the prompt, not on body text. |
| **CRT scanlines / flicker / phosphor glow as default** | Tweaks panel exposes scanlines as a setting; aesthetic developers love it. | (1) Already in `Out of Scope` per PROJECT.md (tweaks panel = design tool). (2) Scanlines tank legibility for low-vision users. (3) Vestibular trigger for some users. | Theme + accent picker is the only customization shipped. If demand emerges post-launch, ship as a localStorage preference behind a settings palette verb — never default-on. |
| **Background ambient sound (mechanical keyboard clack on keystroke)** | Multi-sensory immersion. | (1) Recruiter opens portfolio in open-plan office, dies of embarrassment. (2) Autoplay audio is blocked by browsers; the implementation work is wasted. (3) Accessibility nightmare. | Don't. Sound has zero ROI for the audience. |
| **Konami code easter egg** | Standard novelty trope. | (1) Discoverability is zero — no recruiter and very few engineers will try it. (2) Whatever it triggers (matrix rain, secret game, color flip) has to be built and maintained. (3) Bug surface for an audience of approximately one. | Replace with the console.log signature + view-source comment + custom HTTP header — same "secret message for the curious" energy with broader reach and lower maintenance. |
| **Visitor count / page view counter** | Old-school feel; some terminal portfolios show fake `who | wc -l` counts. | (1) Real counts require analytics infra (already deferred per PROJECT.md). (2) Fake counts are cringe and dishonest. (3) Low traffic numbers signal failure to recruiters. | Skip entirely. The `STATUS` block (`uptime`, `tz`, `Available for hire`) carries the diegetic terminal-status feel without needing real data. |
| **"Now hiring" / "Looking for: ..." giant banner** | Job-search urgency. | (1) Top-bar real estate is precious. (2) Site already says "Available for hire" in sidebar — secondary placement is redundant. (3) When the user is *not* job hunting, this becomes a stale embarrassment. | The single `● Available for hire` indicator + résumé CTA is enough. Toggle the indicator color/text via `portfolio-data.ts` when status changes. |
| **Multiple themes beyond light/dark + the 4 accent hues** | satnaing/terminal-portfolio ships 6 named themes (espresso, ubuntu, etc.). | (1) Combinatorial test surface (4 accents × N themes × 7 views). (2) Token system is already hue-driven — anyone customizing has the levers. (3) Most users never change theme at all; the ones who do change it once. | The light/dark + 4-accent matrix in the handoff is the cap. Resist additions. |
| **In-app blog post writing/editing UI** | "It would be so cool to write posts in the terminal." | Already in `Out of Scope` (no CMS). | Posts come from `portfolio-data.ts` or sibling API. Edit in your IDE, ship in PR. |
| **AI chatbot ("Ask the portfolio anything")** | Trendy in 2026. | (1) Cost per session. (2) Liability for hallucinated bio facts. (3) Recruiter trust loss when bot says something the developer didn't say. (4) Heavyweight infra for a static-ish portfolio. | If demand emerges, ship a `?` palette verb that returns canned answers from `portfolio-data.ts` (FAQ-style). No LLM. |
| **Comments on writing posts** | Engagement signal. | Already in `Out of Scope`. | Link out to dev.to / Mastodon / wherever the post is mirrored. |
| **Login / authenticated areas / "private" projects gate** | NDA protection for confidential work. | (1) Recruiters won't create accounts to see your work. (2) The "click to request access" flow has a ~0% completion rate. | Describe NDA work in plain text in `projects/` or `experience.log` ("Built X for Y; details under NDA"). Use specifics where possible (tech, role, scale) without disclosing details. |
| **Dynamic loading spinners "compiling..." between view switches** | Reinforces the dev metaphor. | Adds latency for no value; views are static markup, transitions should be instant. The 0.25s slideIn is the only acknowledgment of switching. | Keep transitions instant + the slideIn. |
| **Right-click → custom context menu styled like a terminal menu** | Continues the IDE metaphor. | (1) Hijacking the browser context menu breaks "Open Image in New Tab", "Inspect", etc. — engineers *especially* hate this. (2) Mobile has no right-click. | Don't intercept. Let the browser do its job. |
| **Disabled text selection / right-click "to protect content"** | Pseudo-anti-piracy. | Universally read as user-hostile. The portfolio's content is *meant* to be copied (email, GitHub URL, project descriptions). | Allow selection everywhere. Encourage it. |
| **GIFs of project demos auto-playing in `projects/`** | Visual proof. | (1) Bandwidth on mobile. (2) Animation conflicts with `prefers-reduced-motion`. (3) Doesn't fit the typography-first terminal aesthetic. | Link to a live demo URL (`demo ↗`) and a GitHub repo (`source ↗`). One static screenshot inline at most, lazy-loaded. (Or, on the `shipped.app` view, App Store badges → tap-through.) |

## Feature Dependencies

```
[Per-route metadata] ──requires──> [Per-view App Router routes (handoff)]
        │
        └──enables──> [Dynamic OG image (per route)]
                            │
                            └──requires──> [JetBrains Mono available to @vercel/og]
                                                │
                                                └──shares with──> [next/font/google setup (handoff)]

[JSON-LD Person schema] ──requires──> [Final socials + bio in portfolio-data.ts]
                                            │
                                            └──blocks──> [Production deploy (per PROJECT.md "no placeholders")]

[Dynamic OG image] ──requires──> [Final headshot? OR pure-text generative OG]
                                       (Recommendation: pure-text with name/role/active "file" + accent block)

[Skip-link to main content]
[prefers-reduced-motion]
[Visible focus rings]
[Semantic landmarks]
[aria-current on active file]
        │
        └──all required by──> [Recruiter usability floor + WCAG AA + keyboard nav]
                                       │
                                       └──blocks──> [Production deploy quality gate]

[? cheatsheet view inside palette] ──requires──> [Palette verb taxonomy finalized]
                                                          │
                                                          └──depends on──> [g+letter vim nav decision]

[Console.log signature]
[view-source HTML comment]
[Custom HTTP header]
        │
        └──all independent──> [No dependencies — can ship in any phase]

[shipped.app App Store deep links] ──requires──> [Real app metadata in portfolio-data.ts]
                                                        │
                                                        └──blocks──> [shipped view ship]

[Print stylesheet] ──independent──> [Can ship anytime, very low risk]

[404 page on-brand] ──requires──> [Terminal shell layout component reusable in app/not-found.tsx]
                                          │
                                          └──depends on──> [Shell extraction phase]

[g+letter vim nav] ──conflicts with──> [Heavy text inputs in views]
                                              (Mitigation: only fire when no input focused — standard pattern)
```

### Dependency Notes

- **Dynamic OG requires the per-view routes:** Without `app/projects/page.tsx` etc., there's no per-route OG to generate. Both can land in the same phase.
- **JSON-LD requires final content:** Don't ship `Person` schema with placeholder bio — better to ship without JSON-LD than with stale data Google then caches.
- **Console signature + view-source comment + custom header are decoupled:** Three independent ~30-line additions. Bundle them in a single "developer easter eggs" commit.
- **`g`+letter vim nav conflicts with text inputs in views:** `writing/` and any future search input would break vim nav unless the keydown handler checks `document.activeElement.tagName !== "INPUT"`. Standard pattern, but document.
- **OG image generation needs the JetBrains Mono font available to `@vercel/og`:** Same Google font URL works; pass to `ImageResponse({ fonts: [...] })`. Same code, different runtime. Verify in deploy.
- **404 page reuses the shell:** If the terminal shell isn't extracted into a layout-friendly component, the 404 either renders bare or duplicates markup. Phase the shell extraction before the 404.

## MVP Definition

### Launch With (v1) — Required for the milestone

**Inherited from handoff (already non-negotiable):**
- All 7 views with handoff fidelity
- Terminal shell + sidebar + ⌘K palette + theme/accent + responsive

**Additions from this research that are also non-negotiable for v1:**

- [ ] **Per-route metadata + JSON-LD `Person` schema** — without these, the SEO baseline regresses, violating PROJECT.md constraint.
- [ ] **Dynamic OG image (at minimum a static branded one per route)** — current single OG is a visible gap; sharing any URL right now produces a generic unfurl.
- [ ] **Twitter card + favicon set + apple-touch-icon + theme-color** — table stakes for a 2026 portfolio; trivial cost.
- [ ] **Skip-link, focus rings, `prefers-reduced-motion`, semantic landmarks, `aria-current`, keyboard nav, contrast audit** — accessibility floor; without these, the recruiter usability commitment in PROJECT.md doesn't hold up under WCAG.
- [ ] **No-flash theme + accent on first paint** — extend existing inline script; partial implementation today.
- [ ] **Real 404 page rendering inside the shell** — the brand demands it; 1-day scope.
- [ ] **Print stylesheet** — recruiters print; trivial.
- [ ] **External link safety (`rel="noopener noreferrer"`) + `mailto:`** — table stakes.
- [ ] **Robots/sitemap updated for 7 routes** — required to fulfill the "per-view routes ship with sitemap entries" constraint.
- [ ] **Real `shipped.app` content with App Store / Play Store deep links** — the 7th view exists *because* mobile is part of identity; without real links it's dead weight.
- [ ] **Expanded ⌘K verb set (≥ 15 verbs incl. copy email, share URL, cycle accent, ?)** — without this, the palette is a glorified menu, not a differentiator.
- [ ] **Console.log signature + view-source HTML comment + custom HTTP header** — three small, high-leverage easter eggs that cost 1 hour total and pay back across the engineer audience for the lifetime of the site.
- [ ] **Lighthouse: LCP < 2.5s mobile, CLS < 0.1, INP < 200ms** — Core Web Vitals 2026 floor. Verify in deploy.

### Add After Validation (v1.x)

Ship after launch if early feedback supports it.

- [ ] **`?` cheatsheet view inside palette** — defer until palette verb set is finalized in v1; cheap addition once the canonical list exists.
- [ ] **`g`+letter vim navigation** — defer until at least one engineer reviewer asks for it; otherwise it's keyboard-shortcut bloat.
- [ ] **Per-project anchors in sitemap** — defer until projects content is stable (anchors will churn during initial content writing).
- [ ] **Live "currently building" / "currently reading" line in status** — defer until first content pass exposes whether the developer wants to maintain it.
- [ ] **Stack view tab-to-copy JSON** — small delight; ship in a follow-up if observed in palette analytics (when analytics arrive).
- [ ] **Analytics + "resume download" goal tracking** — already deferred per PROJECT.md; add once site has traffic.

### Future Consideration (v2+)

Only if portfolio purpose evolves.

- [ ] **`hire-me.txt` 8th view** — only relevant during active job search; otherwise stale. Add when the developer is actively interviewing; remove between cycles.
- [ ] **CMS for writing posts** — already out of scope; revisit only if writing cadence increases beyond what TS edit-and-PR comfortably supports.
- [ ] **i18n** — already out of scope per PROJECT.md.
- [ ] **Per-accent-hue OG image variants** — diminishing returns; the matrix-green default unfurl is fine.

## Feature Prioritization Matrix

Only listing **non-handoff additions**. Handoff items are P1 by definition.

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Per-route metadata + canonical | HIGH (SEO) | LOW | **P1** |
| Dynamic OG image (per route) | HIGH (every share) | MEDIUM | **P1** |
| Twitter card metadata | HIGH (X/Bluesky) | LOW | **P1** |
| Favicon set + apple-touch-icon + theme-color | MEDIUM (polish floor) | LOW | **P1** |
| JSON-LD `Person` schema | HIGH (name search ranking) | LOW | **P1** |
| Skip-link + focus rings + landmarks + `aria-current` + reduced-motion | HIGH (recruiter floor + WCAG) | LOW | **P1** |
| No-flash theme + accent on first paint | MEDIUM (polish) | LOW | **P1** |
| Real 404 page (terminal-styled) | MEDIUM (brand consistency) | LOW | **P1** |
| Print stylesheet | LOW–MEDIUM (recruiter edge case) | LOW | **P1** |
| External link safety + mailto | MEDIUM | LOW | **P1** |
| Robots + sitemap for 7 routes | HIGH (SEO) | LOW | **P1** |
| `shipped.app` real App Store links | HIGH (mobile identity) | MEDIUM | **P1** |
| Expanded ⌘K verb set (15+) | HIGH (differentiator core) | MEDIUM | **P1** |
| Console.log signature + view-source comment + custom HTTP header | MEDIUM (engineer delight) | LOW | **P1** |
| LCP/CLS/INP within 2026 thresholds | HIGH (CWV / SEO) | LOW–MEDIUM | **P1** |
| `?` cheatsheet view inside palette | MEDIUM (discoverability) | LOW | P2 |
| `g`+letter vim navigation | LOW–MEDIUM (engineer subset) | LOW | P2 |
| Per-project anchors in sitemap | LOW (SEO long tail) | LOW | P2 |
| Live "currently building" line | LOW–MEDIUM (signal alive) | LOW | P2 |
| Stack view copy-JSON button | LOW (delight) | LOW | P2 |
| Analytics + resume download goal | MEDIUM (post-launch) | MEDIUM | P3 |
| `hire-me.txt` 8th view | HIGH only during job search | MEDIUM | P3 |

**Priority key:**
- P1: Must have for milestone v1 launch
- P2: Should have, add in a v1.x follow-up
- P3: Nice to have, deferred to future or only when audience purpose shifts

## Competitor Feature Analysis

Real-world terminal/IDE portfolios surveyed: satnaing/terminal-portfolio, Kielx/terminal-portfolio, 42-v.com, khalidechchahid.me/blog/terminal-portfolio, dev.potatoes.rocks. Conventional engineer portfolios: Lee Robinson, Josh W. Comeau, Brittany Chiang, Cassidy Williams.

| Feature | Terminal portfolios (satnaing, 42-v, etc.) | Conventional eng portfolios (Lee Robinson, Josh Comeau) | Our Approach |
|---------|--------------------------------------------|--------------------------------------------------------|---------------|
| **Real CLI / typed commands** | YES (full xterm-style REPL with `help`, `ls`, `cat`) | NO | **NO** — file-tree IDE metaphor, not CLI; ⌘K is the command surface |
| **Multiple themes** | 6+ named themes (espresso, ubuntu, blue-matrix) | Light/dark only | **2 themes × 4 accent hues** — handoff cap; resist further |
| **Command palette (⌘K)** | RARE on terminal portfolios; standard on modern dev portfolios | YES (Lee Robinson, Vercel, Linear-influenced) | **YES + expanded verb set (15+)** — our core differentiator |
| **Recruiter-facing résumé CTA** | OFTEN BURIED (one of the most common HN complaints) | YES (above the fold) | **YES (sidebar `for recruiters` card + ⌘K verb)** — handoff already addresses |
| **Per-route URLs / SPA hash routing** | MOSTLY hash-based (`#about`, `#projects`) — bad for SEO | Per-route, indexable | **Per-route App Router** — handoff already addresses |
| **Dynamic OG image** | RARE | COMMON (Lee Robinson, Josh Comeau both ship it) | **YES** — adopt the modern-portfolio standard |
| **JSON-LD Person schema** | RARE | COMMON | **YES** — table stakes |
| **Easter eggs (Konami, ASCII)** | COMMON (often as gimmick) | UNCOMMON (single console.log signature) | **NO Konami; YES console + view-source + HTTP header** — quieter, broader-reach signals |
| **Writing / blog** | RARE | COMMON | **YES** — handoff `writing/` view, populated from API/static |
| **Mobile apps showcase** | RARE | RARE | **YES** — `shipped.app` 7th view is genuine differentiator |
| **CRT scanlines / phosphor** | COMMON (often default-on, hostile) | NEVER | **NEVER** — explicitly out of scope |
| **`view-source` / console messages for devs** | UNCOMMON | UNCOMMON | **YES** — small distinctive touch with low cost |
| **Real-time clock / status block** | COMMON | RARE | **YES** — handoff addresses |
| **In-page blog post comments** | NEVER | RARE | **NEVER** — out of scope |

**Synthesis:** The handoff already solves the #1 problem terminal portfolios share — they hide the résumé. Our differentiation comes from (1) treating the terminal as an IDE not a CLI, (2) treating ⌘K as the real command surface with a rich verb taxonomy, and (3) borrowing the SEO/a11y/OG discipline of conventional engineer portfolios that terminal portfolios usually skip. The combination is what's rare — most sites pick one tribe.

## Sources

- Real-world terminal portfolios surveyed:
  - [satnaing/terminal-portfolio (GitHub)](https://github.com/satnaing/terminal-portfolio)
  - [Sat Naing's terminal portfolio (live)](https://terminal.satnaing.dev/)
  - [Kielx/terminal-portfolio (GitHub)](https://github.com/Kielx/terminal-portfolio)
  - [42-v.com Interactive Terminal Portfolio](https://42-v.com/)
  - [Khalid Echchahid: Building My Terminal Portfolio](https://khalidechchahid.me/blog/terminal-portfolio)
  - [Few Amazing Terminal-Style Portfolio Websites (DEV)](https://dev.to/nahiancdx/few-amazing-terminal-style-portfolio-website-you-might-like-4pom)
  - [Show HN: Terminal-Style Portfolio (Hacker News)](https://news.ycombinator.com/item?id=47205127)
  - [Show HN: The Best Terminal-Inspired Portfolio (Hacker News)](https://news.ycombinator.com/item?id=44039481)
- Recruiter-facing portfolio guidance:
  - [Portfolio Link Section That Impresses Recruiters in Seconds (Resumly)](https://www.resumly.ai/blog/portfolio-link-section-that-impresses-recruiters-in-seconds)
  - [The Essential Guide to Including a Portfolio Link on Your Resume (Enhancv)](https://enhancv.com/blog/portfolio-on-resume/)
  - [Top 8 Developer Portfolio Websites to Inspire You in 2026 (Gola)](https://www.gola.supply/blog/developer-portfolio-websites)
  - [The Anthology of a Creative Developer: A 2026 Portfolio (DEV)](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- SEO + OG + JSON-LD:
  - [SEO Tips for Your Developer Portfolio (DEV)](https://dev.to/rossellafer/seo-tips-for-your-developer-portfolio-26fm)
  - [Next.js — ImageResponse function reference](https://nextjs.org/docs/app/api-reference/functions/image-response)
  - [Next.js — opengraph-image and twitter-image metadata files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
  - [Complete Guide to Dynamic OG Images in Next.js 15+ (Medium / Irvin)](https://medium.com/@uyiosazeeirvin/complete-guide-to-dynamic-og-images-in-next-js-15-5f69fd583dbe)
  - [How to Automatically Generate Unique OG Images for Every Page in Next.js 15.4+ (Build with Matija)](https://www.buildwithmatija.com/blog/complete-guide-dynamic-og-image-generation-for-next-js-15)
- Accessibility:
  - [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
  - [Josh W. Comeau — Accessible Animations in React with `prefers-reduced-motion`](https://www.joshwcomeau.com/react/prefers-reduced-motion/)
  - [W3C WAI — Understanding SC 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- Core Web Vitals 2026 thresholds:
  - [Core Web Vitals 2026: INP, LCP & CLS Optimization (Digital Applied)](https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide)
  - [What Are the Core Web Vitals? LCP, INP & CLS Explained (corewebvitals.io)](https://www.corewebvitals.io/core-web-vitals)
  - [web.dev — How the Core Web Vitals metrics thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds)
- Easter-egg techniques (console + view-source + HTTP headers):
  - [Bryan Braun — Several Ways to Hide Easter Eggs on your Website](https://www.bryanbraun.com/2018/04/01/several-ways-to-hide-easter-eggs-on-your-website/)
  - [Troy Hunt — Hiding Recruitment Messages in Source Code](https://www.troyhunt.com/deconstruct-websites-get-hired-hiding/)
  - [The Undercover Recruiter — Hidden Messages in Website Code](https://theundercoverrecruiter.com/hidden-messages-code/)
  - [Easter Egg Hunt: Add ASCII Art to console.log (DEV)](https://dev.to/deadlybyte/easter-egg-hunt-anyone-add-ascii-art-to-the-console-log-4emg)
- Command palette ecosystem:
  - [cmdk (paco.me)](https://cmdk.paco.me/)
  - [Awesome Command Palette implementations (GitHub)](https://github.com/stefanjudis/awesome-command-palette)
  - [Command Palette Navigation with cmdk (mySites.guru)](https://mysites.guru/blog/our-command-palette-navigation-with-cmdk/)

---
*Feature research for: terminal/IDE-themed personal portfolio (engineer + recruiter dual audience)*
*Researched: 2026-05-06*
