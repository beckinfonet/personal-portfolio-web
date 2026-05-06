---
phase: 2
slug: shell
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-06
---

# Phase 2 — Shell: UI Design Contract

> Visual and interaction contract for the persistent terminal shell.
> Source of truth: design_handoff_terminal_portfolio/README.md + app.jsx (pixel-faithful).
> Consumed by gsd-ui-checker, gsd-planner, gsd-executor, gsd-ui-auditor.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (pure CSS + CSS custom properties) |
| Preset | not applicable |
| Component library | none |
| Icon library | Unicode glyphs only (▾ ▸ ◆ ≡ ↓ ↗ ● $ {}) |
| Font | JetBrains Mono — weights 400/500/600/700, loaded via next/font/google |
| Styling approach | Pure CSS in app/globals.css; CSS custom properties for all tokens; no Tailwind, no CSS modules, no CSS-in-JS |

Source: CLAUDE.md ("pure CSS + CSS custom properties only"), 02-CONTEXT.md D-07, SUMMARY.md convergent decisions.

---

## Spacing Scale

Exact values from the handoff (handoff README §"Spacing scale"):

| Token | Value | Usage |
|-------|-------|-------|
| 3px  | 3px   | Tech chip top/bottom padding |
| 4px  | 4px   | Minimal inline gap |
| 6px  | 6px   | Sidebar file row top/bottom padding |
| 8px  | 8px   | Tech chip left/right padding |
| 10px | 10px  | TopBar padding-top/bottom; palette input padding-top/bottom; sidebar icon gap |
| 11px | 11px  | TopBar/sidebar micro text, traffic-light dot diameter, clock font size |
| 12px | 12px  | Sidebar download card label; projects subhead; period right-aligned |
| 14px | 14px  | Palette input padding-top/bottom; stat card padding; base font size |
| 16px | 16px  | TopBar padding-left/right; sidebar file row left/right padding; sidebar icon slot width; md element spacing |
| 18px | 18px  | Palette input/row left/right padding |
| 20px | 20px  | Sidebar top/bottom padding; sidebar download margin-top; stack pre-card left/right padding |
| 24px | 24px  | Breadcrumb margin-bottom; stack pre-card top/bottom padding |
| 32px | 32px  | Main content padding-top/left-right (top) |
| 40px | 40px  | Main content padding-left-right |
| 64px | 64px  | Footer margin-top |
| 80px | 80px  | Main content padding-bottom |

Exceptions:
- TopBar height: ~38px (derived from 10px top + 10px bottom + 18px content)
- Sidebar width: 240px (fixed, not a scale multiple — handoff-locked)
- Main max-width: 920px
- Palette modal max-width: 520px (or 90vw, whichever is smaller)
- Palette modal top offset: 15vh from top
- Palette list max-height: 320px
- Focus outline: 2px with 2px offset (A11Y-02)
- Touch targets: ≥44px (WCAG 2.5.5 — Phase 4 enforces on mobile; Phase 2 desktop does not constrain)

Source: handoff README §"Spacing scale", app.jsx S.topbar/S.sidebar/S.main/S.palette/S.paletteBox styles.

---

## Typography

Font family: JetBrains Mono, ui-monospace, "SF Mono", "Cascadia Mono", monospace (fallback chain).
`next/font/google` emits --font-mono CSS variable; applied via `font-family: var(--font-mono)` on body.
`adjustFontFallback: true` keeps CLS < 0.1 (THEME-06 / Pitfall 10).

| Role | Size | Weight | Line Height | Color token | Usage |
|------|------|--------|-------------|-------------|-------|
| Base body | 14px | 400 | 1.6 | --text | Default prose, view body text |
| Body small | 13px | 400 | 1.5 | --text | View content paragraphs, project summary, palette items |
| Micro | 11px | 400 | 1.4 | --muted | TopBar labels, sidebar header EXPLORER, sidebar status block, tech chips, project index numbers, project year/status/role |
| UI label | 12px | 400 | 1.5 | --muted | Sidebar file tree labels, TopBar clock, breadcrumb, footer, palette footer hint, projects subhead |
| Heading H1 | 26px | 700 | 1.2 | --text-hi | View H1 (about.md name) — letter-spacing: -0.01em |
| View heading | 16–22px | 600 | 1.3 | --accent | View sub-headings; writing post titles (16px/600/accent); stat card values (22px/700/accent) |
| Palette input | 14px | 400 | 1.6 | --text | cmdk input field |

Weights used: 400 (regular) and 600 (semibold), with 700 reserved strictly for H1 only.

Source: handoff README §"Typography", app.jsx S.h1/S.para/S.chip/S.sidebar styles, 02-CONTEXT.md additional_context §"Type scale".

---

## Color

### Token System

Phase 2 replaces app/globals.css entirely. Tokens defined in `:root` (dark default) and `[data-theme="light"]`. Accent tokens derived from `--accent-hue` via oklch().

#### Dark theme tokens (verbatim from handoff README + app.jsx buildPalette)

```css
:root {
  /* Layout surfaces */
  --bg:         #0a0c0b;
  --bg-raised:  #101312;
  --panel:      #0d100f;
  --panel-hi:   #151918;

  /* Borders */
  --border:     #1c2120;
  --border-hi:  #2a302e;

  /* Text */
  --text:       #d8d6cf;
  --text-hi:    #ebe9e2;
  --muted:      #6a7370;
  --muted-hi:   #8a938f;

  /* Accent — derived from --accent-hue */
  --accent-hue: 145;  /* default: matrix green; overridden by pre-paint inline script */
  --accent:     oklch(0.78 0.18 var(--accent-hue));
  --accent-dim: oklch(0.45 0.12 var(--accent-hue));
  --accent-bg:  oklch(0.78 0.18 var(--accent-hue) / 0.08);

  /* Semantic */
  --warn:  oklch(0.78 0.16 75);
  --red:   oklch(0.7 0.18 25);
  --blue:  oklch(0.72 0.14 230);
}
```

#### Light theme tokens

```css
[data-theme="light"] {
  --bg:         #f4f2ea;
  --bg-raised:  #fbf9f1;
  --panel:      #ffffff;
  --panel-hi:   #f4f2ea;
  --border:     #d8d4c4;
  --border-hi:  #bdb8a5;
  --text:       #1a1f1d;
  --text-hi:    #0a0c0b;
  --muted:      #6a7370;
  --muted-hi:   #3a4340;
  --accent:     oklch(0.42 0.16 var(--accent-hue));
  --accent-dim: oklch(0.55 0.13 var(--accent-hue));
  --accent-bg:  oklch(0.42 0.16 var(--accent-hue) / 0.08);
  --warn:       oklch(0.5 0.16 60);
  --red:        oklch(0.5 0.18 25);
  --blue:       oklch(0.5 0.16 230);
}
```

#### @supports sRGB fallbacks (THEME-04)

Every accent token must carry `@supports (color: oklch(0 0 0))` guards. For browsers without oklch support, sRGB fallbacks per hue:

| Hue | --accent sRGB fallback (dark) | --accent sRGB fallback (light) |
|-----|-------------------------------|-------------------------------|
| 145 (matrix) | #22c55e | #16a34a |
| 75  (amber)  | #f59e0b | #d97706 |
| 200 (cyan)   | #06b6d4 | #0891b2 |
| 340 (magenta)| #ec4899 | #db2777 |

Pattern: emit fallback BEFORE oklch declaration for each token. Example:
```css
--accent: #22c55e;  /* sRGB fallback — matrix */
--accent: oklch(0.78 0.18 var(--accent-hue));  /* oklch override */
```

Phase 2 ships fallbacks for all four hues as static classes or per-hue data attributes on `<html>`. Implementation detail for executor: simplest approach is four `[data-accent="matrix"]` etc. selectors that override the fallback before the @supports block.

### Color Roles

| Role | Token | Usage (60/30/10 split) |
|------|-------|------------------------|
| Dominant 60% | --bg | Page background, app root |
| Secondary 30% | --panel, --panel-hi | Sidebar, TopBar, palette modal box, stat cards |
| Accent 10% | --accent | Reserved-for list below |
| Semantic | --warn | Experience.log hex hash, project status, sidebar tree root caret |
| Semantic | --red | Errors, destructive state (not used as decorative) |
| Semantic | --blue | Not used in Phase 2 shell; reserved for views (Phase 3) |

**Accent reserved for (exhaustive list — Phase 2 scope):**

1. Active sidebar file row: text color + 2px left border
2. Active sidebar file row: --accent-bg background tint (8% opacity)
3. STATUS block availability dot (●)
4. Sidebar resume card download button background
5. Main content area resume/primary CTA button background (Phase 3 view body — stubbed in Phase 2)
6. TopBar ⌘ glyph in palette trigger button
7. Cursor blink block (8×14px)
8. Palette item hover: text color + --accent-bg row background
9. Prompt line user@ prefix (color: --accent, weight 600) — from handoff app.jsx S.user
10. View H1 subline `// Sr. Software Engineer` (color: --accent) — Phase 3 view body; Phase 2 stub shows it
11. Focus-visible outline on all interactive elements (2px, 2px offset) — A11Y-02

Source: handoff README §"Colors", app.jsx buildPalette + S.sbItem/S.blink/S.btn/S.paletteRow styles, 02-CONTEXT.md D-03/D-06.

---

## Surfaces

### 1. Root Document Chrome

**File:** app/globals.css (full replacement), app/layout.tsx

- `<html>` element: `lang="en"`, `suppressHydrationWarning`, `className={jetbrainsMono.variable}`, no data-theme at render time (next-themes injects it synchronously via script)
- `<body>`: `margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-mono); font-size: 14px; line-height: 1.6`
- Font loading: `next/font/google` JetBrains Mono, weights: [400, 500, 600, 700], `display: 'swap'`, `variable: '--font-mono'`, `adjustFontFallback: true`, subsets: ['latin']
- Monospace fallback chain in font-family: `var(--font-mono), ui-monospace, "SF Mono", "Cascadia Mono", monospace`
- Two pre-paint inline scripts in `<head>`:
  1. next-themes' built-in script (automatic — writes `data-theme` attribute)
  2. `AccentBootstrapScript` (Server Component, emits IIFE reading `localStorage["portfolio-accent"]` defaulting to `"145"`, sets `document.documentElement.style.setProperty('--accent-hue', hue)`)
- localStorage keys: `theme` (next-themes default), `portfolio-accent` (custom)
- Default theme: dark. Default accent hue: 145 (matrix green)
- `ThemeProvider` config: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`

### 2. TopBar (client island)

**File:** app/components/shell/top-bar.tsx

**Dimensions:** height ~38px; padding 10px 16px; border-bottom 1px solid var(--border); background var(--panel-hi); font-size 12px; color var(--muted); position sticky; top 0; z-index 20.

**Left zone (left to right):**
1. Traffic-light dots — three circles, 11px diameter, border-radius 99px, gap ~6px between:
   - Red: `#ff5f57`
   - Yellow: `#febc2e`
   - Green: `#28c840`
   - Decorative only; no interactive behavior in Phase 2
2. Path label: `~/portfolio — bakytbek@dev — zsh` — color var(--muted); margin-left 8px
   - Compress: hide path label below ~600px viewport width (per 02-CONTEXT.md Claude's Discretion)
   - Hide traffic-light dots below ~480px viewport width
3. Spacer: `flex: 1`

**Right zone (left to right):**
1. ⌘K trigger button: background transparent; color var(--muted); border 1px solid var(--border); padding 4px 10px; border-radius 4px; font-family inherit; font-size 11px; cursor pointer
   - Label: `⌘K` (where ⌘ renders as var(--muted) and K as default button text color)
   - onClick: opens CommandPalette (via usePalette().toggle())
   - Always visible at every viewport (SHELL-03, Risk 3)
   - aria-label: "Open command palette"
   - focus-visible: 2px accent outline, 2px offset
2. Theme toggle button: same visual style as ⌘K button
   - Label when dark: `☼ light` (clicking switches TO light)
   - Label when light: `☾ dark` (clicking switches TO dark)
   - onClick: calls useTheme().setTheme(isDark ? 'light' : 'dark')
   - aria-label: "Toggle color theme" (dynamic)
   - Always visible at every viewport
3. LiveClock: font-family inherit; font-size 11px; margin-left 4px; color var(--muted)
   - Format: HH:MM (24-hour, user's local time); updates every 30s
   - Server render: `--:--` (prevents hydration mismatch)
   - aria-hidden="true" (A11Y-06)
   - Hide below ~480px viewport width
4. Resume download button: **NEVER hidden at any viewport** (SHELL-03, Risk 3, Pitfall 4)
   - Element: `<a>` with `download="Bakytbek_Tatibekov_Resume.pdf"` href="/resume.pdf"
   - Styled as a button: same visual as ⌘K button; OR minimal text link — executor choice; must be visually distinct from path label
   - Label: `↓ resume.pdf`
   - aria-label: "Download resume" (plain noun, not file extension)
   - Always visible and clickable at 375px through desktop

**Semantic landmark:** `<header>` element wraps the entire TopBar (A11Y-05).

**Tab order within TopBar:** ⌘K trigger → theme toggle → resume download button (LiveClock is aria-hidden, not in tab order).

### 3. Sidebar (client island)

**File:** app/components/shell/sidebar.tsx

**Dimensions:** width 240px; border-right 1px solid var(--border); background var(--panel); padding 20px 0; font-size 13px.

**Semantic landmark:** `<nav aria-label="File explorer">` wraps the entire sidebar (A11Y-05).

**Sections (top to bottom):**

**Section A — EXPLORER header:**
- Label: `EXPLORER`
- Style: font-size 11px; text-transform uppercase; letter-spacing 0.1em; color var(--muted); padding 0 16px 8px

**Section B — Tree root row:**
- Content: `▾ portfolio/`
- Style: padding 0 16px 8px; color var(--muted-hi); font-size 12px; `▾` caret in var(--warn) (warning yellow)
- Not interactive in Phase 2

**Section C — File rows (7 entries from ROUTES):**

Each row maps to one ROUTES entry. Order is ROUTES array order:

| Label | Icon | Route | aria-label (from lib/routes.ts) |
|-------|------|-------|--------------------------------|
| about.md | ◆ | / | "About me" |
| projects/ | ▸ | /projects | "Projects" |
| stack.json | {} | /stack | "Tech stack" |
| experience.log | ≡ | /experience | "Experience" |
| writing/ | ▸ | /writing | "Writing" |
| contact.sh | $ | /contact | "Contact information" |
| shipped.app | ▸ | /shipped | "Shipped apps" |

Row structure: `<button>` element (A11Y-04) with padding 6px 16px; display flex; align-items center; gap 10px; cursor pointer; border-left 2px solid transparent.

Row icon: width 16px; color var(--muted); font-size 11px; text-align center; flex 0 0 auto.

**Inactive row:** color var(--text); background transparent; border-left 2px solid transparent; hover background var(--panel-hi) (transition 0.1s).

**Active row:** color var(--accent); background var(--accent-bg); border-left 2px solid var(--accent); aria-current="page"; derived from useSelectedLayoutSegment() — null maps to about.md, "projects" maps to projects/, etc. (A11Y-04, SHELL-05).

**Active state derivation:** `segment === route.slug` (null === null for index route).

**Focus-visible:** 2px accent outline, 2px offset on every button row (A11Y-02).

**Section D — Recruiter resume card:**

Position: margin 20px 16px 0; padding 12px; border 1px dashed var(--border); border-radius 4px; font-size 11px; color var(--muted).

Header text: `For recruiters` — color var(--muted-hi); margin-bottom 6px; font-size 12px.

Download button: `<a download="Bakytbek_Tatibekov_Resume.pdf" href="/resume.pdf">↓ resume.pdf</a>`
- Styled as primary button: background var(--accent); color var(--bg) (dark theme) / var(--bg) (light theme); border none; padding 8px 12px; border-radius 4px; font-family inherit; font-size 12px; font-weight 600; width 100%; text-align center; cursor pointer
- aria-label: "Download resume"
- This is the sidebar resume CTA — in addition to the persistent TopBar button

**Section E — STATUS block:**

Position: margin-top 24px.

Header: `STATUS` — same style as EXPLORER header (11px, uppercase, letter-spacing 0.1em, var(--muted)).

Status lines (padding 0 16px; font-size 11px; color var(--muted); line-height 1.8):
- `● Available for hire` — ● in var(--accent); "Available for hire" in var(--muted)
- `uptime: <Yy DDDd>` — computed from CAREER_START_DATE constant via formatUptime(start, now) RSC helper in lib/uptime.ts; computed at build (RSC), not client interval
- `tz: GMT+5 (flex)` — computed via Intl.DateTimeFormat().resolvedOptions().timeZone in Sidebar client island on first render; fallback: "GMT+5 (flex)"

Source: handoff app.jsx sidebar section, 02-CONTEXT.md D-14/D-15.

### 4. Main Content Area

**Wrapper:** `<main id="main-content">` — semantic landmark (A11Y-05). Padding 32px 40px 80px; max-width 920px.

**Breadcrumb row:**
- Element: client island (app/components/shell/breadcrumb.tsx) using usePathname()
- Layout: display flex; align-items baseline; gap 8px; font-size 12px; color var(--muted); margin-bottom 24px
- Left: `~/portfolio / <activeFile>` where `<activeFile>` is var(--text) (one shade brighter than muted)
- Right: `press ⌘K for commands` — margin-left auto; color var(--muted); opacity transitions from 0 to 1 at 350ms after first mount (bootDone flag)
  - `⌘K` rendered as `<kbd>` element: background var(--panel); border 1px solid var(--border); padding 1px 6px; border-radius 3px; font-size 11px

**Prompt line (shared primitive):**
- Component: app/components/primitives/prompt-line.tsx (RSC)
- Structure: `<div class="prompt-line"><span class="prompt-user">$</span> <span class="prompt-cmd">{cmd}</span><span class="cursor" /></div>`
- Layout: display flex; gap 10px; align-items baseline; flex-wrap wrap; font-size 13px
- `$` glyph: color var(--muted)
- cmd text: color var(--text)
- cursor block: display inline-block; width 7px (or 8px per additional_context); height 14px; background var(--accent); vertical-align text-bottom; margin-left 2px; animation: blink 1s steps(2) infinite

**Cursor animation:**
```css
@keyframes blink {
  50% { opacity: 0; }
}
.cursor {
  display: inline-block;
  width: 8px;
  height: 14px;
  background: var(--accent);
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: blink 1s steps(2, start) infinite;
}
```
Only looping animation in v1 (SHELL-09). Dampen under prefers-reduced-motion (see below).

**SlideIn animation:**
```css
@keyframes slideIn {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: none; }
}
.content-block {
  margin-top: 18px;
  animation: slideIn 0.25s ease;
}
```
Single play per view mount; use `animation-fill-mode: both`. Trigger only on first paint (key prop on the view component changes per route).

**Reduced-motion (defensive baseline — Phase 2 ships this; full audit is Phase 5):**
```css
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
  .content-block { animation: none; }
  .breadcrumb-hint { transition: none; opacity: 1; } /* skip fade-in */
}
```

**Footer:**
- Element: `<footer>` landmark (A11Y-05)
- Position: inside `<main>`, below view content
- Structure: margin-top 64px; padding-top 20px; border-top 1px solid var(--border); color var(--muted); font-size 11px; display flex; gap 16px
- Content: `© <year> <name> · built with React · v1.0.0`
  - Year: `new Date().getFullYear()` (RSC)
  - Name: from PROFILE.name

**View stub body (Phase 2 only — Phase 3 replaces):**
Each of the 7 route stubs renders:
1. `<PromptLine cmd="<cmd from 02-CONTEXT D-13>" />`
2. `<p className="stub-body">// view body lands in Phase 3</p>` — color var(--muted); font-size 13px; margin-top 18px

**Stub prompt commands (locked in 02-CONTEXT.md D-13):**

| Route | Command |
|-------|---------|
| / (about.md) | `cat about.md` |
| /projects | `ls -la projects/` |
| /stack | `cat stack.json \| jq` |
| /experience | `git log --oneline --decorate experience.log` |
| /writing | `ls writing/ && cat *.md` |
| /contact | `./contact.sh --whoami` |
| /shipped | `ls -la shipped/` |

### 5. CommandPalette (client island)

**File:** app/components/shell/command-palette.tsx

**Technology:** cmdk@^1.1.1, cmdk `Command` + `Command.Dialog` + `Command.Input` + `Command.List` + `Command.Item` + `Command.Empty`.

**Trigger:** ⌘K (metaKey+K) or Ctrl+K anywhere; also the TopBar ⌘K button onClick.

**Open/close behavior:**
- Open: ⌘K keydown, TopBar button click
- Close: Esc key, backdrop click
- Focus on open: auto-focused into `Command.Input`
- Focus on close: restored to the element that triggered open (A11Y-08, PALETTE-04)

**Overlay:**
- Position fixed; inset 0; z-index 100
- Display flex; align-items flex-start; justify-content center
- Background rgba(0,0,0,0.5) solid — NO blur (handoff app.jsx S.palette)
- padding-top 15vh

**Modal box:**
- Width min(520px, 90vw); background var(--panel); border 1px solid var(--border-hi); border-radius 8px; overflow hidden; font-family inherit
- Dark shadow: box-shadow 0 30px 80px rgba(0,0,0,0.5)
- Light shadow: box-shadow 0 8px 32px rgba(0,0,0,0.15)
- `Dialog.Title`: visually hidden (sr-only) — "Command palette" for screen readers

**Input row:**
- width 100%; padding 14px 18px; background transparent; color var(--text)
- border none; border-bottom 1px solid var(--border); font-family inherit; font-size 14px; outline none; box-sizing border-box
- placeholder: "Type a command or file..."

**Item list:**
- Layout: flat list, no group headings (02-CONTEXT.md D-02)
- max-height 320px; overflow auto

**Each palette item:**
- padding 10px 18px; display flex; align-items center; gap 10px; cursor pointer; font-size 13px
- Default: background transparent; color var(--text)
- Selected/hover: background var(--accent-bg); color var(--accent) (cmdk handles selection via `[aria-selected="true"]`)
- Icon slot: width 18px; color var(--muted); font-size 12px

**Empty state (no matches):**
- padding 20px; color var(--muted); font-size 13px; text-align center
- Copy: `No matches.`

**Footer hint row:**
- padding 8px 18px; border-top 1px solid var(--border); font-size 11px; color var(--muted); display flex; gap 16px
- Content: `↵ select` and `esc close` with `<kbd>` styling

**Result count (aria-live region — PALETTE-03, A11Y):**
- `<div role="status" aria-live="polite" className="sr-only">` below the list
- Content: "{n} results" (updates as type-to-filter narrows)
- sr-only class: position absolute; width 1px; height 1px; overflow hidden; clip rect(0,0,0,0); white-space nowrap

**Focus trap:** cmdk's Command.Dialog handles focus trapping natively. On Esc or backdrop click, focus is restored to the element stored in a ref at open time.

**Keyboard navigation:** Arrow keys navigate items (cmdk built-in); Enter activates selected item; Tab does NOT navigate items (trap stays within modal).

#### Verb Taxonomy (19 verbs — locked in 02-CONTEXT.md D-01..D-05)

| # | Verb | Icon | Action | Keywords (cmdk `keywords` prop) |
|---|------|------|--------|---------------------------------|
| 1 | Open about.md | ◆ | router.push("/") | about, home, bio, who, name, intro |
| 2 | Open projects/ | ▸ | router.push("/projects") | work, builds, code, projects |
| 3 | Open stack.json | {} | router.push("/stack") | tech, skills, languages, tools, stack |
| 4 | Open experience.log | ≡ | router.push("/experience") | cv, history, jobs, work, experience |
| 5 | Open writing/ | ▸ | router.push("/writing") | blog, posts, articles, writing |
| 6 | Open contact.sh | $ | router.push("/contact") | contact, reach, email, social |
| 7 | Open shipped.app | ▸ | router.push("/shipped") | apps, mobile, ios, android, store, shipped |
| 8 | Download resume.pdf | ↓ | synthetic `<a download>` click on PROFILE.resumeUrl | cv, resume, pdf, download |
| 9 | Toggle theme | ☼/☾ | useTheme().setTheme(isDark ? 'light' : 'dark') | dark, light, mode, theme |
| 10 | Set accent: matrix | ● | setAccent("145") | green, default, accent, matrix |
| 11 | Set accent: amber | ● | setAccent("75") | yellow, warm, accent, amber |
| 12 | Set accent: cyan | ● | setAccent("200") | blue, teal, accent, cyan |
| 13 | Set accent: magenta | ● | setAccent("340") | pink, purple, accent, magenta |
| 14 | Open GitHub | ↗ | window.open(url, "_blank", "noopener,noreferrer") | gh, github, code |
| 15 | Open LinkedIn | ↗ | window.open(url, "_blank", "noopener,noreferrer") | linkedin, professional |
| 16 | Open <third social> | ↗ | window.open(url, "_blank", "noopener,noreferrer") | (data-driven from PROFILE.socials — executor picks at planning) |
| 17 | Copy email | @ | navigator.clipboard.writeText(PROFILE.email) | mail, @, address, email |
| 18 | Copy GitHub URL | ⎘ | navigator.clipboard.writeText(PROFILE.socials[github].url) | github, gh, link |
| 19 | Share this view | ↗ | navigator.clipboard.writeText(window.location.href) | copy url, link, share |

Note: Verbs 14–16 are driven from PROFILE.socials at runtime. If fewer than 3 social entries exist in PROFILE.socials, total verb count falls to 18, which is still ≥16 (PALETTE-02 floor). Third social pick is a data decision in lib/portfolio-data.ts (02-CONTEXT.md D-05).

Accent dot icon for "Set accent:" verbs: render a 10px solid circle in the corresponding hue color (not var(--accent) — use the static hue value so each option is visually distinct). Colors:
- matrix: oklch(0.78 0.18 145) / sRGB #22c55e
- amber: oklch(0.78 0.16 75) / sRGB #f59e0b
- cyan: oklch(0.78 0.18 200) / sRGB #06b6d4
- magenta: oklch(0.78 0.18 340) / sRGB #ec4899

Copy confirmation for clipboard actions: announce via the existing `aria-live="polite"` result-count region ("Copied to clipboard") replacing the count for 2 seconds, then restoring.

### 6. 404 Page

**File:** app/not-found.tsx

**Rendering:** Inside the (terminal) shell composition (imports same layout structure per 02-CONTEXT.md D-17). Returns HTTP 404 automatically via Next.js convention.

**Content:**
- Prompt line: `$ ls -la <pathname>` where `<pathname>` is the attempted URL path
  - `<pathname>` sourced from a client component using usePathname() (or headers() x-invoke-path if available server-side — executor picks the cleanest approach)
- Error message block (margin-top 18px; color var(--red)):
  ```
  ls: cannot access '<pathname>': No such file or directory
  ```
- List of all 7 routes (from ROUTES): `<ul>` with one `<li>` per route as a `<Link>` — styled as accent-colored links; plain-noun text (using route.ariaLabel, not route.label)

**Copy contract:**
- Error line: `ls: cannot access '{path}': No such file or directory`
- List header: `Available files:` — color var(--muted); font-size 12px; margin-bottom 8px
- Each link: route.ariaLabel — color var(--accent); text-decoration none; hover opacity 0.85

### 7. Sitemap + Robots

**app/sitemap.ts:** Maps over ROUTES, emits 7 `<loc>` entries. Sets `lastModified` to build time.

**app/robots.ts:** References sitemap URL. Allow all crawlers.

**Both files:** import ROUTES from lib/routes.ts (ROUTE-04, Pattern 5).

---

## Theme + Accent System

### localStorage Keys

| Key | Managed by | Default | Values |
|-----|-----------|---------|--------|
| `theme` | next-themes | "dark" | "dark" \| "light" |
| `portfolio-accent` | ShellStateProvider + AccentBootstrapScript | "145" | "145" \| "75" \| "200" \| "340" |

### SSR Flash Prevention (two-script approach — THEME-02, Risk 1)

Script 1: next-themes' built-in script (automatic — injected in `<head>` when ThemeProvider renders server-side).

Script 2: AccentBootstrapScript (Server Component emitting an inline `<script dangerouslySetInnerHTML>`):
```js
(function() {
  try {
    var hue = localStorage.getItem('portfolio-accent') || '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) {}
})();
```

Both scripts run synchronously before `<body>` paint. No CSP nonce in Phase 2 (deferred per 01-CONTEXT.md D-15).

### Accent Hue Options

| Name | Hue | CSS default |
|------|-----|-------------|
| matrix | 145 | default |
| amber | 75 | — |
| cyan | 200 | — |
| magenta | 340 | — |

User-facing accent picker: CommandPalette only (02-CONTEXT.md D-06). No top-bar swatches, no sidebar swatches.

---

## Accessibility Contract

| Requirement | Implementation | A11Y ref |
|-------------|----------------|----------|
| Skip-link | `<a href="#main-content" className="skip-link">Skip to content</a>` at top of `<body>`; visually hidden until :focus; reveals with background var(--panel-hi) and 2px accent outline | A11Y-01 |
| Focus-visible | `*:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` — never killed without replacement | A11Y-02 |
| Sidebar file rows | `<button>` elements with aria-label from ROUTES.ariaLabel (plain noun); aria-current="page" on active row | A11Y-04 |
| Landmarks | `<header>` TopBar, `<nav aria-label="File explorer">` Sidebar, `<main id="main-content">` content area, `<footer>` credits | A11Y-05 |
| LiveClock | `aria-hidden="true"` on the clock span | A11Y-06 |
| Full keyboard nav | Tab order: skip-link → TopBar (⌘K → theme → resume) → Sidebar file rows (top to bottom) → Breadcrumb → main content → footer; ⌘K trap; Esc restores focus | A11Y-08 |
| Reduced motion | `.cursor { animation: none }` and `.content-block { animation: none }` under `@media (prefers-reduced-motion: reduce)` — shipped as defensive baseline in Phase 2 | Baseline for A11Y-03 |

**Skip-link CSS:**
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 8px 16px;
  background: var(--panel-hi);
  color: var(--accent);
  border: 2px solid var(--accent);
  border-radius: 4px;
  font-size: 13px;
  text-decoration: none;
  z-index: 200;
}
.skip-link:focus {
  top: 16px;
}
```

---

## Copywriting Contract

| Element | Copy | Notes |
|---------|------|-------|
| Primary CTA (TopBar resume) | `↓ resume.pdf` | aria-label: "Download resume" |
| Primary CTA (sidebar resume card) | `↓ resume.pdf` | aria-label: "Download resume" |
| Resume download filename | `Bakytbek_Tatibekov_Resume.pdf` | download attribute value |
| Palette placeholder | `Type a command or file...` | handoff app.jsx line 559 |
| Palette empty state | `No matches.` | handoff app.jsx line 575 |
| Palette footer hint | `↵ select · esc close` | handoff app.jsx lines 579–580 |
| TopBar path label | `~/portfolio — bakytbek@dev — zsh` | handoff README verbatim |
| Theme toggle (dark active) | `☼ light` | label = what you'll switch TO |
| Theme toggle (light active) | `☾ dark` | label = what you'll switch TO |
| Breadcrumb hint | `press ⌘K for commands` | fades in at 350ms; kbd-styled ⌘K |
| Sidebar EXPLORER header | `EXPLORER` | uppercase via CSS |
| Sidebar STATUS header | `STATUS` | uppercase via CSS |
| Sidebar status line 1 | `● Available for hire` | ● in accent color |
| Sidebar status uptime | `uptime: <Yy DDDd>` | computed from CAREER_START_DATE |
| Sidebar status timezone | `tz: GMT+5 (flex)` | computed; falls back to literal |
| Sidebar recruiter card header | `For recruiters` | sentence case; not uppercase |
| Footer | `© <year> <name> · built with React · v1.0.0` | year computed; name from PROFILE.name |
| 404 error line | `ls: cannot access '<path>': No such file or directory` | terminal-style; path is dynamic |
| 404 list header | `Available files:` | muted, 12px |
| Stub view body placeholder | `// view body lands in Phase 3` | muted; Phase 3 replaces |
| CommandPalette aria title | `Command palette` | sr-only; Dialog.Title |
| Skip-link | `Skip to content` | revealed on focus |

**Destructive actions in Phase 2:** None. No delete/destroy/irreversible actions in the shell surface. Confirmation dialogs not needed for Phase 2.

---

## Motion Contract

| Animation | CSS | Trigger | Reduced-motion |
|-----------|-----|---------|----------------|
| Cursor blink | `blink 1s steps(2, start) infinite` on `.cursor` | Always present on prompt-line elements | `animation: none` |
| SlideIn content | `slideIn 0.25s ease` on `.content-block` | Once per view mount (key prop triggers remount) | `animation: none` |
| Breadcrumb fade-in | `opacity: 0 → 1; transition: opacity 0.5s` on `.breadcrumb-hint` at 350ms | Once on shell first mount (bootDone flag) | `transition: none; opacity: 1` |
| Theme swap | `disableTransitionOnChange` in ThemeProvider | User toggle | n/a — suppressed by next-themes |
| Hover anchor opacity | `a:hover { opacity: 0.85 }` | Hover | No reduction needed (not animation) |

---

## Component Architecture Contract

(For executor reference — boundaries that must NOT be violated)

| File | Type | "use client" | Reason |
|------|------|-------------|--------|
| app/layout.tsx | Server Component | NO | Root layout stays RSC (SHELL-02, Pitfall 9) |
| app/(terminal)/layout.tsx | Server Component | NO | Shell layout stays RSC |
| app/components/shell/top-bar.tsx | Client island | YES | useTheme, usePalette |
| app/components/shell/sidebar.tsx | Client island | YES | useSelectedLayoutSegment |
| app/components/shell/command-palette.tsx | Client island | YES | cmdk, keyboard listener |
| app/components/shell/live-clock.tsx | Client island | YES | setInterval (isolated to prevent TopBar bundle bloat) |
| app/components/shell/breadcrumb.tsx | Client island | YES | usePathname |
| app/components/shell/theme-bootstrap-script.tsx | Server Component | NO | Emits inline script via dangerouslySetInnerHTML |
| app/components/shell/theme-provider.tsx | Client wrapper | YES | next-themes ThemeProvider |
| app/components/shell/shell-state-provider.tsx | Client wrapper | YES | palette+accent Context |
| app/components/primitives/prompt-line.tsx | Server Component | NO | RSC-friendly primitive |
| app/(terminal)/page.tsx + 6 stubs | Server Component | NO | RSC stubs |
| app/not-found.tsx | Mixed (client child for pathname) | NO at root | pathname from client child or headers() |
| app/sitemap.ts | Server | n/a | — |

**RSC bundle target:** First Load JS for shared shell < 50KB gzipped. Per-view delta < 10KB (ROADMAP Phase 2 success criterion 1).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — no shadcn |
| third-party | none | not applicable |

No component registries in use. Pure CSS + Unicode glyphs only. cmdk and next-themes are production deps installed in Phase 1; no new prod deps introduced in Phase 2.

---

## Mobile Scope Note

Phase 2 ships the desktop-first contract described above. The sidebar is 240px wide at all viewports in Phase 2. The CommandPalette opens as a centered 520px modal at all viewports in Phase 2 (including mobile — functional but not ideal).

Phase 4 owns:
- Sidebar collapse at ~960px breakpoint + bottom-sheet drawer (MOBILE-01/02)
- CommandPalette mobile bottom-sheet variant (PALETTE-05)
- STATUS block rehoming to about-view footer on mobile (MOBILE-04)
- Print stylesheet (A11Y-09)

The Phase 2 UI-SPEC does not define these breakpoints. Phase 4's UI-SPEC will extend this contract.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## Pre-Population Sources

| Source | Decisions Used |
|--------|---------------|
| design_handoff_terminal_portfolio/README.md | All color tokens, typography scale, spacing values, radii, shadow, layout dimensions, component copy |
| design_handoff_terminal_portfolio/app.jsx | Exact pixel values for TopBar/Sidebar/palette/prompt-line styles, verb list structure, motion keyframes, hover patterns |
| .planning/phases/02-shell/02-CONTEXT.md | 21 locked decisions: verb taxonomy (D-01..D-05), accent picker placement (D-06), theme wiring (D-07..D-09), mobile scope (D-10), RSC boundaries (D-11), route stubs (D-12..D-13), clock format (D-14), status defaults (D-15), deletions (D-16), 404 approach (D-17), test strategy (D-18..D-20), wave sequencing (D-21) |
| lib/routes.ts | 7-entry ROUTES array with ariaLabel per route |
| lib/portfolio-data.ts | PROFILE.email, PROFILE.socials, resume filename |
| .planning/research/ARCHITECTURE.md | RSC boundaries, Pattern 2 two-script approach, component responsibilities |
| .planning/REQUIREMENTS.md | SHELL-01..09, THEME-01..06, PALETTE-01..04, A11Y-01..06/08 requirement text |
| CLAUDE.md | Pure CSS constraint, persistent resume CTA constraint, plain-noun aria-labels, no display:none for mobile elements |
| User input | 0 (all decisions pre-populated from upstream artifacts — auto mode) |

---

*Phase: 02-shell*
*UI-SPEC generated: 2026-05-06*
*Status: draft — awaiting gsd-ui-checker verification*
