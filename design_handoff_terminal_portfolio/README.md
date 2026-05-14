# Handoff: Terminal Portfolio (Next.js merge)

## Overview
A polished single-page developer portfolio with a "terminal/IDE" aesthetic for Bakytbek Tatibekov, Sr. Software Engineer. The design uses a file-tree sidebar, command palette, monospace typography, and supports both light and dark themes.

This handoff documents the design so it can be implemented inside the existing Next.js project at:
`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web`

## About the Design Files
The files in this bundle are **design references created in HTML/JSX** — prototypes showing intended look and behavior, not production code to copy verbatim. The task is to **recreate the design inside your Next.js portfolio** using its established conventions (App Router or Pages Router, your existing styling solution — Tailwind / CSS modules / styled-components / etc.) — not to drop the HTML files in directly.

The reference uses inline-style React (Babel standalone). Translate the visual system (colors, type, layout, spacing, motion) into your project's idioms.

## Fidelity
**High fidelity.** Final colors, typography, spacing, and interactions are settled. Recreate pixel-faithfully.

## Recommended structure (Next.js App Router)

```
app/
  layout.tsx                 # fonts, theme provider, metadata
  page.tsx                   # hosts <TerminalPortfolio />
  globals.css                # CSS variables for theme tokens
components/
  terminal-portfolio.tsx     # top-level shell (top bar + layout)
  sidebar.tsx                # file tree + status block
  command-palette.tsx        # ⌘K modal
  views/
    AboutView.tsx
    ProjectsView.tsx
    StackView.tsx            # JSON-styled rendering
    ExperienceView.tsx
    WritingView.tsx
    ContactView.tsx
  tweaks/                    # OPTIONAL — only if you want the live tweak UI
    TweaksPanel.tsx
lib/
  portfolio-data.ts          # ports data.js — typed
  theme.ts                   # buildPalette(isDark, accentHue)
public/
  resume.pdf                 # the actual résumé file
```

State management: React Context (or Zustand) for `{ theme, accent, font, scanlines, activeFile, paletteOpen }`. Persist via `localStorage` (or `next-themes` for theme).

## Screens / Views

There is **one screen** with six switchable content panels. Layout is a sticky top bar + a 240px sidebar + a max-920px main content column.

### Top bar (sticky)
- Height: ~38px, padding `10px 16px`, `border-bottom: 1px solid var(--border)`, background `--panel-hi`, font-size 12px, color `--muted`.
- Left: three macOS-style traffic-light dots, 11px circles. Colors `#ff5f57`, `#febc2e`, `#28c840`.
- Path label: `~/portfolio — bakytbek@dev — zsh`
- Right: `⌘K` button, theme toggle button (`☼ light` / `☾ dark`), live HH:MM clock.

### Sidebar (240px)
- `border-right: 1px solid var(--border)`, background `--panel`, padding `20px 0`.
- Section header `EXPLORER` — 11px, uppercase, letter-spacing 0.1em, color `--muted`.
- Tree root row: `▾ portfolio/` (warning-yellow caret).
- File rows: 16px-wide icon + label, padding `6px 16px`. Hover background `--panel-hi`. Active file shows accent text, `--accent-bg` (8% accent), and 2px left border in accent.
- Files (in order): `about.md ◆`, `projects/ ▸`, `stack.json {}`, `experience.log ≡`, `writing/ ▸`, `contact.sh $`.
- "For recruiters" résumé download box: dashed-border card, accent button reading `↓ resume.pdf`, downloads `Bakytbek_Tatibekov_Resume.pdf`.
- STATUS block: `● Available for hire` (accent dot), `uptime: 7y 184d`, `tz: GMT+5 (flex)`.

### Main content
- Padding `32px 40px 80px`, `max-width: 920px`.
- Breadcrumb row: `~/portfolio / <activeFile>` left, `press ⌘K for commands` hint right (kbd-styled).
- Each view starts with a fake prompt line: `$ <command>`, then the rendered content with a subtle `slideIn` animation (`from {opacity:0; translateY(2px)}`, 0.25s).
- Footer: `© <year> <name>  ·  built with React  v1.0.0`.

### View 1 — about.md
- H1: name (26px, weight 700, color `--text-hi`).
- Subline: `// Sr. Software Engineer` in accent.
- Two paragraphs of bio (max-width 68ch).
- 3 stat cards in a 480px-wide row: `7+ Years shipping`, `AWS Cloud-native`, `AI Agentic systems`. Card padding 14px, border radius 4px, value 22px/700 in accent, label 11px in muted.
- CTA row: primary `↓ resume.pdf` button + ghost buttons for each social (lowercased label with trailing slash, e.g. `github/`).

### View 2 — projects/
- Prompt: `$ ls -la projects/`
- Subhead: `total 6 · sorted by year desc` in muted 12px.
- Grid: `32px 1fr 110px` columns, gap 16px, divider `border-bottom: 1px solid --border`.
  - Col 1: `01.`, `02.`… in muted 12px.
  - Col 2: project name (15px, weight 600, accent), summary (13px, line-height 1.5, max-width text), tech chips.
  - Col 3 (right-aligned, 11px): year, status (warn yellow), role.
- Tech chips: padding `3px 8px`, border `1px solid --border`, radius 3px, background `--bg-raised`.

### View 3 — stack.json
- Prompt: `$ cat stack.json | jq`
- Renders a syntax-highlighted JSON object inside a `<pre>` card (border, radius 4px, padding `20px 24px`).
- Color rules: punctuation `--muted`, keys (category names) `--warn`, string values `--accent`.

### View 4 — experience.log
- Prompt: `$ git log --oneline --decorate experience.log`
- Each row: 7-char hex hash (warn yellow), role (accent, 600), `@ company` (muted), period right-aligned in muted 12px. Below: summary text in `--text` (max-width 64ch).

### View 5 — writing/
- Prompt: `$ ls writing/ && cat *.md`
- Each post: `<DATE UPPERCASED · READTIME>` micro-meta, then `› <title>` (16px/600/accent), then excerpt (13px/--text/max 64ch). Dashed bottom border.

### View 6 — contact.sh
- Prompt: `$ ./contact.sh --whoami`
- Lead paragraph.
- Card (border, radius 4, padding 20, max-width 480px) with rows: 90px label column (uppercase, muted) + accent link.
- Footer CTAs: download résumé + `github ↗`.

## Interactions & Behavior

- **File switching:** clicking a sidebar file sets the active view. Resume row triggers a synthetic `<a download>` click instead of switching views.
- **Command palette (⌘K / Ctrl-K):** modal centered, 520px wide max, mounts at `15vh` from top. Items: open each file, download résumé, toggle theme, open each social. Type-to-filter against item label. `Esc` or backdrop click closes.
- **Theme toggle:** flips `--theme` token between `dark` and `light`. Persist in localStorage; respect `prefers-color-scheme` on first load if no stored value. Default = dark.
- **Boot animation:** breadcrumb hint fades in after 350ms.
- **Cursor blink:** 1s `steps(2)` infinite on prompt cursor (8×14px solid accent block).
- **Live clock:** updates every 30 seconds, formatted `HH:MM`.
- **Hover:** all anchors fade to opacity 0.85.

## Design Tokens

### Colors

The palette is derived dynamically from `(isDark, accentHue)`. Default accent hue is **145** (matrix green). Recommended approach: emit CSS variables from a `globals.css` `:root` and `[data-theme="dark"]` block.

#### Dark theme
```
--bg:         #0a0c0b
--bg-raised:  #101312
--panel:      #0d100f
--panel-hi:   #151918
--border:     #1c2120
--border-hi:  #2a302e
--text:       #d8d6cf
--text-hi:    #ebe9e2
--muted:      #6a7370
--muted-hi:   #8a938f
--accent:     oklch(0.78 0.18 145)
--accent-dim: oklch(0.45 0.12 145)
--accent-bg:  oklch(0.78 0.18 145 / 0.08)
--warn:       oklch(0.78 0.16 75)
--red:        oklch(0.7 0.18 25)
--blue:       oklch(0.72 0.14 230)
```

#### Light theme
```
--bg:         #f4f2ea
--bg-raised:  #fbf9f1
--panel:      #ffffff
--panel-hi:   #f4f2ea
--border:     #d8d4c4
--border-hi:  #bdb8a5
--text:       #1a1f1d
--text-hi:    #0a0c0b
--muted:      #6a7370
--muted-hi:   #3a4340
--accent:     oklch(0.42 0.16 145)
--accent-dim: oklch(0.55 0.13 145)
--accent-bg:  oklch(0.42 0.16 145 / 0.08)
--warn:       oklch(0.5 0.16 60)
```

#### Accent options (hue swap)
- matrix (green): hue 145
- amber: hue 75
- cyan: hue 200
- magenta: hue 340

### Typography
- Default mono: **JetBrains Mono** (weights 400/500/600/700)
- Optional alternates: **Geist Mono**, **IBM Plex Mono**
- Use `next/font/google` for self-hosting.
- Base font-size 14px, line-height 1.6.
- H1 26/700, view headings 16–22, body 13–14, micro 11–12.

### Spacing scale
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 64 / 80 px.

### Radii
3 (chips), 4 (cards/buttons), 8 (palette modal), 99 (status dots).

### Shadows
- Dark palette modal: `0 30px 80px rgba(0,0,0,0.5)`
- Backdrop: `rgba(0,0,0,0.5)` solid (no blur).

## Data Schema

Port `data.js` to TypeScript:

```ts
// lib/portfolio-data.ts
export type Project = {
  name: string; year: string; status: string;
  summary: string; tech: string[]; role: string; link: string;
};
export type Social = { label: string; handle: string; url: string };
export type Experience = { company: string; role: string; period: string; summary: string };
export type Writing = { title: string; date: string; readTime: string; excerpt: string };

export const PORTFOLIO_DATA = {
  name, shortName, initials, role, location, email, resumeUrl,
  socials: Social[],
  bio: { short: string; long: string[] },
  highlights: { value: string; label: string }[],
  projects: Project[],
  stack: Record<string, string[]>,
  experience: Experience[],
  writing: Writing[],
} as const;
```

## Assets
- **resume.pdf** — drop the real PDF in `public/resume.pdf` (the bundled file is a placeholder).
- No other images/icons. All glyphs are Unicode (▾▸◆≡↓↗↵●). If you prefer real icons, swap in `lucide-react` (e.g. `FolderIcon`, `FileTextIcon`, `DownloadIcon`, `TerminalIcon`) — keep them at 14–16px and `--muted` color to match.

## Implementation notes for Next.js

1. **Theme:** use `next-themes` with `attribute="data-theme"`. Avoid SSR flash by adding `suppressHydrationWarning` on `<html>` and rendering the theme-dependent shell only after mount, OR by inlining a tiny pre-hydration script that reads localStorage.
2. **Command palette:** consider `cmdk` (`pnpm add cmdk`) — its API maps cleanly to the items in the reference. Keep the visual styling but get focus management for free.
3. **Tweaks panel:** the live in-page tweak panel is a design tool, not a public feature. Skip it for the public site — keep the theme toggle only.
4. **Metadata:** in `app/layout.tsx`, set `metadata.title`, `description`, `openGraph` with name + role, and a default OG image.
5. **Accessibility:** ensure file rows are real `<button>` elements with `aria-current="page"` on the active one. The palette should trap focus and restore it on close. `kbd` elements are fine semantically.

## Screenshots
See `screenshots/` for reference renders:
- `01-about-dark.png` — about view, dark
- `02-projects-dark.png` — projects view
- `03-stack-dark.png` — stack.json view
- `04-experience-dark.png` — experience log
- `05-writing-dark.png` — writing list
- `06-contact-dark.png` — contact view
- `07-about-light.png` — about view, light theme
- `08-command-palette.png` — ⌘K palette open

## Files included in this bundle

- `index.html` — entry that mounts `<TerminalApp />`
- `app.jsx` — the full Terminal portfolio component (visual & behavioral source of truth)
- `data.js` — content (port to TS)
- `tweaks-panel.jsx` — design-tool only; do NOT ship to production site
- `resume.pdf` — placeholder; replace with real résumé
- This `README.md`

Open `app.jsx` for exact dimensions, colors, and inline behavior — that's the canonical reference for any ambiguity in this document.
