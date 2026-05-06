# Phase 2: Shell — Pattern Map

**Mapped:** 2026-05-06
**Files analyzed:** 30 (new + modified + deleted, per D-21 wave grouping)
**Analogs found:** 8 in-codebase / 30 total (most files are net-new; primary analog is `design_handoff_terminal_portfolio/app.jsx` + `02-RESEARCH.md` Code Examples)

---

## File Classification

| New / Modified / Deleted File | Action | Role | Data Flow | Closest Analog | Match Quality |
|-------------------------------|--------|------|-----------|----------------|---------------|
| `app/globals.css` | REWRITE | config (CSS token system) | static CSS custom properties | `app/globals.css` (current — Phase 1 stub) | partial — same file, full rewrite of token system |
| `app/layout.tsx` | REWRITE | controller (RSC root layout) | server-side providers + pre-paint scripts | `app/layout.tsx` lines 1–44 | exact — same file; rewrite body (providers + font); keep metadata shape |
| `app/sitemap.ts` | REWRITE | config (sitemap) | server static map over ROUTES | `app/sitemap.ts` lines 1–12 | exact — same file; iterator replaces hardcoded entry |
| `package.json` | MODIFY | config | npm devDep add | `package.json` (current) | exact — add one devDep |
| `vitest.setup.ts` | MODIFY | config (test setup) | static test env setup | `vitest.setup.ts` line 1 | exact — append `beforeEach` localStorage clear |
| `app/components/homepage.tsx` | DELETE | component (deleted) | n/a | n/a (paired deletion per D-16) | n/a |
| `app/components/homepage.test.tsx` | DELETE | test (deleted) | n/a | n/a (paired deletion per D-16) | n/a |
| `app/components/theme-toggle.tsx` | DELETE | component (deleted) | n/a | n/a (paired deletion per D-16) | n/a |
| `app/page.tsx` | DELETE | page (deleted) | n/a | n/a (paired deletion per D-16) | n/a |
| `app/(terminal)/layout.tsx` | CREATE | controller (RSC shell layout) | server-side shell chrome composition | `app.jsx` lines 501–552 (JSX structure); `app/layout.tsx` (RSC default export shape) | role-match — no existing route-group layout; app.jsx is the visual reference |
| `app/(terminal)/page.tsx` | CREATE | page (RSC stub) | server static render | `app.jsx` lines 289–316 (prompt-line render pattern); `app/sitemap.ts` (metadata export shape) | role-match — no existing stub page; app.jsx shows prompt-line + contentBlock pattern |
| `app/(terminal)/projects/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/(terminal)/stack/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/(terminal)/experience/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/(terminal)/writing/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/(terminal)/contact/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/(terminal)/shipped/page.tsx` | CREATE | page (RSC stub) | server static render | same as above | role-match |
| `app/components/shell/top-bar.tsx` | CREATE | component (client island) | request-response (theme hook, palette hook) | `app.jsx` lines 486–499 (TopBar JSX) | role-match — no existing TopBar; app.jsx is the reference |
| `app/components/shell/sidebar.tsx` | CREATE | component (client island) | request-response (useSelectedLayoutSegment) | `app.jsx` lines 503–532 (Sidebar JSX) | role-match — no existing Sidebar; app.jsx is the reference |
| `app/components/shell/command-palette.tsx` | CREATE | component (client island) | event-driven (cmdk Command.Dialog) | `app.jsx` lines 554–583 (palette JSX); `02-RESEARCH.md` Pattern 2 | role-match |
| `app/components/shell/breadcrumb.tsx` | CREATE | component (client island) | request-response (usePathname) | `app.jsx` lines 536–543 (breadcrumb section) | role-match |
| `app/components/shell/live-clock.tsx` | CREATE | component (client island) | event-driven (setInterval) | `app.jsx` lines 69/78–80/498 (time state + clock span) | role-match |
| `app/components/shell/theme-provider.tsx` | CREATE | component (client wrapper) | static provider wrapper | `02-RESEARCH.md` Pattern 1 (ThemeProvider config) | no in-repo analog — use RESEARCH Pattern 1 |
| `app/components/shell/shell-state-provider.tsx` | CREATE | component (client wrapper/Context) | event-driven (Context + useReducer) | `app.jsx` lines 67–68 (paletteOpen/paletteQuery state) | role-match — app.jsx co-locates state; Phase 2 extracts to Context |
| `app/components/shell/accent-bootstrap-script.tsx` | CREATE | component (RSC inline script) | static SSR emit | `app/layout.tsx` lines 20–29 (existing themeScript IIFE pattern); `02-RESEARCH.md` Pattern 1 | role-match — existing themeScript is the direct predecessor |
| `app/components/primitives/prompt-line.tsx` | CREATE | component (RSC primitive) | static render | `app.jsx` lines 191–199 (promptLine + blink styles) | role-match |
| `app/not-found.tsx` | CREATE | page (RSC 404) | server static render | `app.jsx` lines 441–468 (contact view prompt-line pattern); `app/sitemap.ts` (Next.js file-convention shape) | partial-match |
| `lib/palette-verbs.ts` | CREATE | lib helper (typed const) | static export | `lib/routes.ts` lines 1–79 (UPPERCASE typed const, `as const satisfies`) | role-match — same const-export convention |
| `lib/uptime.ts` | CREATE | lib helper (pure function) | transform (date arithmetic) | `lib/api.ts` lines 25–35 (typed helper function pattern) | role-match — same single-export helper shape |
| Test files (9 Vitest specs) | CREATE | test | render + assertion | `vitest.setup.ts` line 1 + `02-RESEARCH.md` Test Code Examples | role-match |

---

## Pattern Assignments

### `app/globals.css` (config, REWRITE)

**Analog:** `app/globals.css` lines 1–44 (current — same file, being fully replaced) + `02-RESEARCH.md` Pattern 4

**Current token shape** (`app/globals.css` lines 1–17 — to be replaced entirely):
```css
:root {
  --bg: #f8fafc;
  --text: #0f172a;
  --accent: #2563eb;
  color-scheme: light;
}
html[data-theme="dark"] { ... }
```

**Target pattern — oklch token + @supports structure** (`02-RESEARCH.md` Pattern 4, lines 517–587):
```css
/* Declare sRGB fallback FIRST, then @supports override AFTER (cascade order matters) */
:root {
  --accent-hue: 145; /* AccentBootstrapScript overrides before paint */
  color-scheme: dark light;

  /* Neutral tokens (dark default) */
  --bg: #0a0c0b;
  --bg-raised: #101312;
  --panel: #0d100f;
  --panel-hi: #151918;
  --border: #1c2120;
  --border-hi: #2a302e;
  --text: #d8d6cf;
  --text-hi: #ebe9e2;
  --muted: #6a7370;
  --muted-hi: #8a938f;

  /* sRGB fallback — hardcoded to matrix hue (v1 tradeoff) */
  --accent: #4ade80;
  --accent-dim: #16632a;
  --accent-bg: rgba(74, 222, 128, 0.08);
  --warn: #f5b431;
  --red: #f54e49;
  --blue: #59b1f0;
}

@supports (color: oklch(0 0 0)) {
  :root {
    --accent: oklch(0.78 0.18 var(--accent-hue));
    --accent-dim: oklch(0.45 0.12 var(--accent-hue));
    --accent-bg: oklch(0.78 0.18 var(--accent-hue) / 0.08);
    --warn: oklch(0.78 0.16 75);
    --red: oklch(0.7 0.18 25);
    --blue: oklch(0.72 0.14 230);
  }
}

html[data-theme="light"] {
  /* sRGB fallback first, then @supports override */
  --accent: #1f5a35;
  ...
}
@supports (color: oklch(0 0 0)) {
  html[data-theme="light"] {
    --accent: oklch(0.42 0.16 var(--accent-hue));
    --accent-dim: oklch(0.55 0.13 var(--accent-hue));
    --accent-bg: oklch(0.42 0.16 var(--accent-hue) / 0.08);
  }
}
```

**Font-family pattern** (`02-RESEARCH.md` Pattern 3):
```css
body {
  font-family: var(--font-mono); /* NEVER "JetBrains Mono" literal — Pitfall 10 */
}
```

**Animation keyframes** (`app.jsx` lines 478–479 + `02-UI-SPEC.md` Motion Contract):
```css
@keyframes blink { 50% { opacity: 0; } }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
  .content-block { animation: none; }
  .breadcrumb-hint { transition: none; opacity: 1; }
}
```

**Skip-link CSS** (`02-UI-SPEC.md` Accessibility Contract):
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
.skip-link:focus { top: 16px; }
```

**Focus-visible pattern** (`02-UI-SPEC.md` Accessibility Contract):
```css
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

---

### `app/layout.tsx` (controller, REWRITE)

**Analog:** `app/layout.tsx` lines 1–44 (current — same file) + `02-RESEARCH.md` Pattern 1

**Existing metadata export shape to preserve** (`app/layout.tsx` lines 8–18):
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),  // uses || not ?? (existing pattern locked)
  title: "...",
  description: "...",
  openGraph: { ... }
};
```

**Target imports pattern** (`02-RESEARCH.md` Pattern 1, lines 330–336):
```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/shell/theme-provider";
import { ShellStateProvider } from "@/app/components/shell/shell-state-provider";
import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script";
```

**Font config pattern** (`02-RESEARCH.md` Pattern 1, lines 337–344):
```tsx
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
  // adjustFontFallback defaults to true — DO NOT pass adjustFontFallback explicitly
});
```

**RSC root layout body pattern** (`02-RESEARCH.md` Pattern 1, lines 349–368):
```tsx
// NO "use client" — this file stays RSC (SHELL-02 / Pitfall 9)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <AccentBootstrapScript />
        {/* next-themes auto-injects its own script — do NOT add a second manual one */}
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Critical:** `suppressHydrationWarning` on `<html>` is required by next-themes. Delete the old `themeScript` const and `<script dangerouslySetInnerHTML>` mount in the same commit (D-16).

---

### `app/sitemap.ts` (config, REWRITE)

**Analog:** `app/sitemap.ts` lines 1–12 (same file — iterator replaces hardcoded entry)

**Current pattern** (`app/sitemap.ts` lines 1–12):
```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 }
  ];
}
```

**Target pattern — iterate ROUTES** (Pattern 5 from `02-RESEARCH.md` §"Architecture Patterns"):
```ts
import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ROUTES.map((r) => ({
    url: `${baseUrl}${r.pathname}`,
    changeFrequency: "weekly" as const,
    priority: r.slug === null ? 1 : 0.8,
    lastModified: new Date()
  }));
}
```

**Conventions preserved:** `import type` from "next", `??` for env default (not `||` — sitemap baseUrl is not a `new URL()` argument), default export (framework convention), no trailing commas.

---

### `package.json` (config, MODIFY)

**Analog:** `package.json` (current — extend devDependencies)

**Pattern:** Add one devDependency in `devDependencies` block. Follow existing exact-pin-or-caret convention (existing devDeps use `^`):
```json
"@testing-library/user-event": "^14.6.1"
```

No other changes to `package.json` in Phase 2. (All other Phase 2 files use already-installed deps.)

---

### `vitest.setup.ts` (config, MODIFY)

**Analog:** `vitest.setup.ts` line 1 (current — append `beforeEach`)

**Current content** (`vitest.setup.ts` line 1):
```ts
import "@testing-library/jest-dom/vitest";
```

**Target — append localStorage clear** (D-20 test isolation requirement):
```ts
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  localStorage.clear();
});
```

**Convention:** Vitest globals are enabled (`vitest.config.ts` line 14: `globals: true`), so `beforeEach` needs no import.

---

### `app/(terminal)/layout.tsx` (controller, RSC shell layout — CREATE)

**Analog:** `app.jsx` lines 501–552 (terminal body JSX structure); `app/layout.tsx` (RSC default export shape without `"use client"`)

**No in-repo analog for this file.** app.jsx provides the JSX shape; RESEARCH.md §"Architecture Patterns" provides the component responsibility map.

**Imports pattern** (follows `lib/routes.ts` pattern for `@/` alias cross-dir imports):
```tsx
// NO "use client" — RSC layout (SHELL-01/SHELL-02)
import type { ReactNode } from "react";
import { TopBar } from "@/app/components/shell/top-bar";
import { Sidebar } from "@/app/components/shell/sidebar";
import { CommandPalette } from "@/app/components/shell/command-palette";
import { Breadcrumb } from "@/app/components/shell/breadcrumb";
import { PROFILE } from "@/lib/portfolio-data";
import { formatUptime } from "@/lib/uptime";
```

**Shell chrome composition** (`app.jsx` lines 501–552 — adapted to RSC + semantic landmarks, `02-UI-SPEC.md` §Surfaces):
```tsx
export default function TerminalLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();
  const uptime = formatUptime(CAREER_START_DATE, new Date());
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <TopBar />
      <div className="terminal-body">
        <Sidebar uptime={uptime} />
        <main id="main-content" tabIndex={-1}>
          <Breadcrumb />
          {children}
          <footer>
            <span>© {currentYear} {PROFILE.name}</span>
            <span>·</span>
            <span>built with React</span>
            <span>v1.0.0</span>
          </footer>
        </main>
      </div>
      <CommandPalette />
    </>
  );
}
```

**CSS for terminal-body grid** (`app.jsx` lines 150–154 / `02-UI-SPEC.md` Layout Dimensions):
```css
.terminal-body {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: calc(100vh - 38px); /* 38px = TopBar height */
}
```

---

### `app/(terminal)/page.tsx` + 6 sibling stub pages (pages, RSC — CREATE)

**Analog:** `app/sitemap.ts` (metadata export shape) + `app.jsx` lines 289–296 (prompt-line + contentBlock pattern); `02-CONTEXT.md` D-12/D-13

**No in-repo page stub analog.** Pattern from app.jsx prompt-line section.

**Stub page shape** (same for all 7; cmd and title change per route):
```tsx
// NO "use client" — RSC stub
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "about.md — Bakytbek Tatibekov"  // varies per stub (D-12)
};

export default function AboutPage() {
  return (
    <>
      <PromptLine cmd="cat about.md" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
```

**Stub commands per route** (`02-CONTEXT.md` D-13):

| File | `cmd` prop | `title` |
|------|-----------|---------|
| `(terminal)/page.tsx` | `cat about.md` | `about.md — Bakytbek Tatibekov` |
| `(terminal)/projects/page.tsx` | `ls -la projects/` | `projects/ — Bakytbek Tatibekov` |
| `(terminal)/stack/page.tsx` | `cat stack.json \| jq` | `stack.json — Bakytbek Tatibekov` |
| `(terminal)/experience/page.tsx` | `git log --oneline --decorate experience.log` | `experience.log — Bakytbek Tatibekov` |
| `(terminal)/writing/page.tsx` | `ls writing/ && cat *.md` | `writing/ — Bakytbek Tatibekov` |
| `(terminal)/contact/page.tsx` | `./contact.sh --whoami` | `contact.sh — Bakytbek Tatibekov` |
| `(terminal)/shipped/page.tsx` | `ls -la shipped/` | `shipped.app — Bakytbek Tatibekov` |

---

### `app/components/shell/top-bar.tsx` (client island — CREATE)

**Analog:** `app.jsx` lines 486–499 (TopBar JSX) + `02-UI-SPEC.md` §"2. TopBar"

**No in-repo analog.** app.jsx lines 486–499 are the canonical reference.

**TopBar JSX structure** (`app.jsx` lines 486–499):
```jsx
// app.jsx lines 486–499 — translate to Next.js client island:
<div style={S.topbar}>
  <div style={S.dot('#ff5f57')}></div>     // red traffic light
  <div style={S.dot('#febc2e')}></div>     // yellow traffic light
  <div style={S.dot('#28c840')}></div>     // green traffic light
  <div style={S.topbarPath}>~/portfolio — bakytbek@dev — zsh</div>
  <div style={S.topbarSpacer}></div>
  <button onClick={() => setPaletteOpen(true)} style={S.topbarBtn}>
    <span style={{ color: c.muted }}>⌘</span>K
  </button>
  <button onClick={() => setTweak('theme', isDark ? 'light' : 'dark')} style={S.topbarBtn}>
    {isDark ? '☼ light' : '☾ dark'}
  </button>
  <span style={{ marginLeft: 4, fontSize: 11 }}>{timeStr}</span>
</div>
```

**Next.js adaptation** — replace inline styles with CSS classes, use hooks from project:
```tsx
"use client";
import { useTheme } from "next-themes";
import { usePalette } from "@/app/components/shell/shell-state-provider";
import { LiveClock } from "@/app/components/shell/live-clock";
import { PROFILE } from "@/lib/portfolio-data";

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { toggle } = usePalette();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="topbar">
      {/* traffic lights */}
      <span className="traffic-dot traffic-dot--red" aria-hidden="true" />
      <span className="traffic-dot traffic-dot--yellow" aria-hidden="true" />
      <span className="traffic-dot traffic-dot--green" aria-hidden="true" />
      <span className="topbar-path">~/portfolio — bakytbek@dev — zsh</span>
      <span className="topbar-spacer" />
      <button className="topbar-btn" onClick={toggle} aria-label="Open command palette">
        <span className="cmd-key">⌘</span>K
      </button>
      <button
        className="topbar-btn"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label="Toggle color theme"
      >
        {isDark ? "☼ light" : "☾ dark"}
      </button>
      <LiveClock />
      <a
        className="topbar-btn topbar-resume"
        href={PROFILE.resumeUrl}
        download="Bakytbek_Tatibekov_Resume.pdf"
        aria-label="Download resume"
      >
        ↓ resume.pdf
      </a>
    </header>
  );
}
```

**CSS classes** (`app.jsx` lines 133–149 → convert to CSS custom properties):
```css
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-hi);
  font-size: 12px;
  color: var(--muted);
  position: sticky;
  top: 0;
  z-index: 20;
}
.topbar-btn {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0; /* Pitfall 6 — never shrink CTA buttons */
}
.topbar-resume { min-height: 44px; } /* Pitfall 6 — touch target */
.topbar-spacer { flex: 1; }
.traffic-dot { width: 11px; height: 11px; border-radius: 99px; }
.traffic-dot--red    { background: #ff5f57; }
.traffic-dot--yellow { background: #febc2e; }
.traffic-dot--green  { background: #28c840; }
```

---

### `app/components/shell/sidebar.tsx` (client island — CREATE)

**Analog:** `app.jsx` lines 503–532 (Sidebar JSX) + `02-UI-SPEC.md` §"3. Sidebar" + `lib/routes.ts` lines 26–76

**No in-repo analog.** app.jsx sidebar section + lib/routes.ts are the canonical references.

**Sidebar JSX structure** (`app.jsx` lines 503–532 — adapted for Next.js):
```tsx
"use client";
import { useSelectedLayoutSegment } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { PROFILE } from "@/lib/portfolio-data";

interface SidebarProps {
  uptime: string;  // pre-computed RSC string from formatUptime()
}

export function Sidebar({ uptime }: SidebarProps) {
  const segment = useSelectedLayoutSegment();

  // Active derivation: null segment === index route (about.md)
  const isActive = (slug: string | null) => segment === slug;

  return (
    <nav className="sidebar" aria-label="File explorer">
      {/* Section A: EXPLORER header */}
      <div className="sb-header">EXPLORER</div>

      {/* Section B: Tree root row */}
      <div className="sb-tree-root">
        <span className="sb-tree-caret">▾</span> portfolio/
      </div>

      {/* Section C: 7 file rows from ROUTES */}
      {ROUTES.map((route) => (
        <button
          key={route.pathname}
          className={`sb-item${isActive(route.slug) ? " sb-item--active" : ""}`}
          aria-label={route.ariaLabel}
          aria-current={isActive(route.slug) ? "page" : undefined}
          onClick={() => { /* router.push(route.pathname) */ }}
        >
          <span className="sb-icon">{/* icon per route */}</span>
          <span>{route.label}</span>
        </button>
      ))}

      {/* Section D: Recruiter resume card */}
      <div className="sb-download">
        <div className="sb-download-header">For recruiters</div>
        <a
          className="btn"
          href={PROFILE.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ resume.pdf
        </a>
      </div>

      {/* Section E: STATUS block */}
      <div className="sb-header" style={{ marginTop: 24 }}>STATUS</div>
      <div className="sb-status">
        <div><span className="status-dot">●</span> Available for hire</div>
        <div>uptime: {uptime}</div>
        <div>tz: {/* Intl computed on client */}</div>
      </div>
    </nav>
  );
}
```

**Row active state pattern** (`app.jsx` line 511: `S.sbItem(activeFile === f.id)` + `02-UI-SPEC.md` §"Active row"):
```css
.sb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  cursor: pointer;
  color: var(--text);
  background: transparent;
  border-left: 2px solid transparent;
  transition: background 0.1s;
  width: 100%;
  text-align: left;
}
.sb-item:hover { background: var(--panel-hi); }
.sb-item--active {
  color: var(--accent);
  background: var(--accent-bg);
  border-left-color: var(--accent);
}
.sb-icon { width: 16px; color: var(--muted); font-size: 11px; text-align: center; flex: 0 0 auto; }
```

**Route-to-icon mapping** (`app.jsx` lines 97–103):
```
about.md     → ◆
projects/    → ▸
stack.json   → {}
experience.log → ≡
writing/     → ▸
contact.sh   → $
shipped.app  → ▸  (add in Phase 2; not in app.jsx prototype)
```

---

### `app/components/shell/command-palette.tsx` (client island — CREATE)

**Analog:** `app.jsx` lines 554–583 (palette JSX) + `02-RESEARCH.md` Pattern 2 (cmdk Command.Dialog with accessibility)

**No in-repo analog.** app.jsx shows the prototype shape; RESEARCH Pattern 2 shows the cmdk-specific API.

**Core cmdk pattern** (`02-RESEARCH.md` Pattern 2, lines 391–467):
```tsx
"use client";
import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePalette } from "@/app/components/shell/shell-state-provider";
import { PALETTE_VERBS } from "@/lib/palette-verbs";

export function CommandPalette() {
  const { open, setOpen } = usePalette();
  const router = useRouter();
  const triggerRef = useRef<HTMLElement | null>(null);
  const [count, setCount] = useState(PALETTE_VERBS.length);

  // Global ⌘K / Ctrl-K listener (app.jsx lines 83–93 shows the pattern)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        triggerRef.current = document.activeElement as HTMLElement;
        setOpen((p) => !p);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Restore focus on close (PALETTE-04 / Pitfall 6)
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command Palette">
      {/* Visually hidden Dialog.Title — Radix requirement (RESEARCH Pitfall 6) */}
      <span className="visually-hidden">Command Palette</span>

      <Command.Input placeholder="Type a command or file..." />

      {/* aria-live result count (PALETTE-03 / A11Y) */}
      <div role="status" aria-live="polite" className="sr-only">
        {count} {count === 1 ? "result" : "results"}
      </div>

      <Command.List>
        <Command.Empty>No matches.</Command.Empty>
        {PALETTE_VERBS.map((verb) => (
          <Command.Item
            key={verb.id}
            value={verb.label}        /* MUST be label, not icon — Pitfall 4 */
            keywords={verb.keywords}  /* alias array from lib/palette-verbs.ts */
            onSelect={() => {
              verb.action({ router, setOpen });
              setOpen(false);
            }}
          >
            <span className="verb-icon">{verb.icon}</span>
            <span>{verb.label}</span>
          </Command.Item>
        ))}
      </Command.List>

      {/* Footer hint (app.jsx lines 578–580) */}
      <div className="palette-footer">
        <span><kbd>↵</kbd> select</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </Command.Dialog>
  );
}
```

**Palette overlay CSS** (`app.jsx` lines 240–270):
```css
/* Palette overlay (Command.Dialog renders its own dialog; style the overlay via CSS) */
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5); /* NO backdrop-filter blur — app.jsx line 244 */
  padding-top: 15vh;
}
.palette-box {
  width: min(520px, 90vw);
  background: var(--panel);
  border: 1px solid var(--border-hi);
  border-radius: 8px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  font-family: inherit;
}
[cmdk-input] {
  width: 100%;
  padding: 14px 18px;
  background: transparent;
  color: var(--text);
  border: none;
  border-bottom: 1px solid var(--border);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
[cmdk-list] { max-height: 320px; overflow: auto; }
[cmdk-item] {
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
}
[cmdk-item][aria-selected="true"] {
  background: var(--accent-bg);
  color: var(--accent);
}
.palette-footer {
  padding: 8px 18px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--muted);
  display: flex;
  gap: 16px;
}
```

---

### `app/components/shell/breadcrumb.tsx` (client island — CREATE)

**Analog:** `app.jsx` lines 536–543 (breadcrumb section) + `02-UI-SPEC.md` §"4. Main Content Area — Breadcrumb"

**JSX pattern** (`app.jsx` lines 536–543):
```jsx
<div style={S.breadcrumb}>
  <span>~/portfolio</span>
  <span>/</span>
  <span style={{ color: c.text }}>{activeFile}</span>
  <span style={{ marginLeft: 'auto', opacity: bootDone ? 1 : 0, transition: 'opacity 0.5s' }}>
    press <kbd style={{...}}>⌘K</kbd> for commands
  </span>
</div>
```

**Next.js adaptation:**
```tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";

export function Breadcrumb() {
  const pathname = usePathname();
  const [bootDone, setBootDone] = useState(false);

  // Boot animation: fade-in hint at 350ms (app.jsx line 77: setTimeout 350ms)
  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Derive active label from pathname
  const activeRoute = ROUTES.find((r) => r.pathname === pathname) ?? ROUTES[0];

  return (
    <div className="breadcrumb">
      <span className="breadcrumb-path">~/portfolio</span>
      <span>/</span>
      <span className="breadcrumb-active">{activeRoute.label}</span>
      <span
        className={`breadcrumb-hint${bootDone ? " breadcrumb-hint--visible" : ""}`}
        style={{ marginLeft: "auto" }}
      >
        press <kbd>⌘K</kbd> for commands
      </span>
    </div>
  );
}
```

---

### `app/components/shell/live-clock.tsx` (client island — CREATE)

**Analog:** `app.jsx` lines 69/78–80/498 (time state + tick interval + clock span) + `02-RESEARCH.md` Pattern 5

**Hydration-safe pattern** (`02-RESEARCH.md` Pattern 5, lines 598–623):
```tsx
"use client";
import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setTime(`${hh}:${mm}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="live-clock" aria-hidden="true">
      {time ?? "--:--"}   {/* "--:--" server-side prevents hydration mismatch (D-14) */}
    </span>
  );
}
```

---

### `app/components/shell/theme-provider.tsx` (client wrapper — CREATE)

**Analog:** `02-RESEARCH.md` Pattern 1 (`ThemeProvider` config) — no in-repo analog

**Full content is minimal** (`02-RESEARCH.md` Pattern 1 / D-07):
```tsx
"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

The props are supplied by `app/layout.tsx` at call site: `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem`, `disableTransitionOnChange`.

---

### `app/components/shell/shell-state-provider.tsx` (client Context — CREATE)

**Analog:** `app.jsx` lines 67–68 (paletteOpen/accentHue useState) — app.jsx co-locates; Phase 2 extracts to Context. No in-repo Context analog.

**Context + useReducer pattern** (`02-CONTEXT.md` Claude's Discretion + `02-RESEARCH.md` §"Don't Hand-Roll"):
```tsx
"use client";
import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

interface ShellState {
  paletteOpen: boolean;
  accentHue: string;
}

// usePalette() → { open, setOpen, toggle }
// useAccent()  → { hue, setHue }  — setHue writes --accent-hue + localStorage["portfolio-accent"]

const ShellStateContext = createContext</* shape */>(...);

export function ShellStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shellReducer, {
    paletteOpen: false,
    accentHue: "145"   // default; overridden by AccentBootstrapScript before paint
  });

  // setHue writes through to CSS variable AND localStorage (D-09)
  const setHue = useCallback((hue: string) => {
    document.documentElement.style.setProperty("--accent-hue", hue);
    localStorage.setItem("portfolio-accent", hue);  // key: "portfolio-accent" (D-09)
    dispatch({ type: "SET_HUE", hue });
  }, []);

  return (
    <ShellStateContext.Provider value={{ ...state, setHue, /* palette actions */ }}>
      {children}
    </ShellStateContext.Provider>
  );
}
export function usePalette() { return useContext(ShellStateContext).palette; }
export function useAccent()  { return useContext(ShellStateContext).accent; }
```

---

### `app/components/shell/accent-bootstrap-script.tsx` (RSC inline script — CREATE)

**Analog:** `app/layout.tsx` lines 20–29 (existing `themeScript` IIFE — direct predecessor pattern) + `02-RESEARCH.md` Pattern 1

**Existing themeScript IIFE pattern** (`app/layout.tsx` lines 20–29 — the pattern this replaces):
```ts
const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("portfolio-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch {}
})();
`;
// Used as: <script dangerouslySetInnerHTML={{ __html: themeScript }} />
```

**Target pattern** (`02-RESEARCH.md` Pattern 1, lines 308–325):
```tsx
// RSC — NO "use client"
const ACCENT_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('portfolio-accent');
    var hue = (raw && /^\\d{1,3}$/.test(raw) && +raw >= 0 && +raw < 360) ? raw : '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) { /* localStorage unavailable; CSS default --accent-hue: 145 applies */ }
})();
`;

export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
```

**Key differences from predecessor:** Key changes from `"portfolio-theme"` → `"portfolio-accent"`; sets CSS variable instead of HTML attribute; adds hue validation regex; named export (not inline in layout).

---

### `app/components/primitives/prompt-line.tsx` (RSC primitive — CREATE)

**Analog:** `app.jsx` lines 191–199 (promptLine + blink styles); `02-UI-SPEC.md` §"4. Main Content Area — Prompt line"

**JSX shape** (`app.jsx` lines 292–294 — prompt-line render):
```jsx
<div style={S.promptLine}>          // display: flex; gap: 10; alignItems: baseline; flexWrap: wrap
  <span style={{ color: c.muted }}>$</span>
  <span style={S.cmdText}>cat about.md</span>
  // cursor blink: app.jsx S.blink — width 7, height 14, background accent, animation blink
</div>
```

**RSC component** (`02-CONTEXT.md` Claude's Discretion + `02-UI-SPEC.md` §"Prompt line"):
```tsx
// NO "use client" — RSC-friendly primitive
interface PromptLineProps {
  cmd: string;
}

export function PromptLine({ cmd }: PromptLineProps) {
  return (
    <div className="prompt-line">
      <span className="prompt-dollar">$</span>
      <span className="prompt-cmd">{cmd}</span>
      <span className="cursor" aria-hidden="true" />
    </div>
  );
}
```

**CSS** (`app.jsx` lines 191–199 / `02-UI-SPEC.md` cursor spec):
```css
.prompt-line {
  display: flex;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
  font-size: 13px;
}
.prompt-dollar { color: var(--muted); }
.prompt-cmd    { color: var(--text); }
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

---

### `app/not-found.tsx` (page, RSC 404 — CREATE)

**Analog:** Next.js `app/not-found.tsx` convention (auto-returns HTTP 404) + `app.jsx` lines 441–468 (contact.sh prompt-line pattern — closest JSX analog for terminal error output) + `lib/routes.ts` lines 26–76 (ROUTES for route list)

**Shape** (`02-CONTEXT.md` D-17 + `02-UI-SPEC.md` §"6. 404 Page"):
```tsx
// NO "use client" at root
// Pathname from a client child component using usePathname()
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { NotFoundPathname } from "./(not-found-client-child)"; // or headers() approach

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="prompt-line">
        <span className="prompt-dollar">$</span>
        <span className="prompt-cmd">ls -la <NotFoundPathname /></span>
      </div>
      <p className="not-found-error">
        ls: cannot access &lsquo;<NotFoundPathname />&rsquo;: No such file or directory
      </p>
      <p className="not-found-list-header">Available files:</p>
      <ul>
        {ROUTES.map((r) => (
          <li key={r.pathname}>
            <Link href={r.pathname} className="not-found-link">{r.ariaLabel}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Note for planner:** The `<pathname>` value — whether to use `headers()` (`x-invoke-path`) server-side or a small `usePathname()` client child — should be resolved at planning. The simplest clean approach is a tiny `"use client"` child component that calls `usePathname()` and renders the path string.

---

### `lib/palette-verbs.ts` (lib helper, typed const — CREATE)

**Analog:** `lib/routes.ts` lines 1–79 (UPPERCASE typed const array with `as const satisfies`, JSDoc, named exports)

**Pattern to copy from `lib/routes.ts`** (lines 26–76):
```ts
// Exact const-export + as const satisfies pattern from lib/routes.ts
export const ROUTES = [
  { slug: null, pathname: "/", label: "about.md", ariaLabel: "About me", description: "..." },
  ...
] as const satisfies readonly Route[];
```

**Apply same shape to palette verbs:**
```ts
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface PaletteVerb {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly keywords: readonly string[];
  readonly action: (ctx: { router: AppRouterInstance; setOpen: (v: boolean) => void }) => void;
}

export const PALETTE_VERBS: readonly PaletteVerb[] = [
  {
    id: "open-about",
    label: "Open about.md",
    icon: "◆",
    keywords: ["about", "home", "bio", "who", "name", "intro"],
    action: ({ router, setOpen }) => { router.push("/"); setOpen(false); }
  },
  // ... 18 more verbs per D-05 taxonomy
] as const;
```

**Conventions from `lib/routes.ts`:** UPPERCASE const name, `as const satisfies` for literal types, `readonly` on all fields, JSDoc above the export, `@/lib/...` for cross-dir imports, named exports only.

**All 19 verbs** per `02-CONTEXT.md` D-04 / `02-UI-SPEC.md` §"Verb Taxonomy":

| id | label | icon | keywords |
|----|-------|------|----------|
| open-about | Open about.md | ◆ | about, home, bio, who, name, intro |
| open-projects | Open projects/ | ▸ | work, builds, code, projects |
| open-stack | Open stack.json | {} | tech, skills, languages, tools, stack |
| open-experience | Open experience.log | ≡ | cv, history, jobs, work, experience |
| open-writing | Open writing/ | ▸ | blog, posts, articles, writing |
| open-contact | Open contact.sh | $ | contact, reach, email, social |
| open-shipped | Open shipped.app | ▸ | apps, mobile, ios, android, store, shipped |
| download-resume | Download resume.pdf | ↓ | cv, resume, pdf, download |
| toggle-theme | Toggle theme | ☼/☾ | dark, light, mode, theme |
| accent-matrix | Set accent: matrix | ● | green, default, accent, matrix |
| accent-amber | Set accent: amber | ● | yellow, warm, accent, amber |
| accent-cyan | Set accent: cyan | ● | blue, teal, accent, cyan |
| accent-magenta | Set accent: magenta | ● | pink, purple, accent, magenta |
| open-github | Open GitHub | ↗ | gh, github, code |
| open-linkedin | Open LinkedIn | ↗ | linkedin, professional |
| open-social-3 | Open <third social> | ↗ | (executor picks from PROFILE.socials) |
| copy-email | Copy email | @ | mail, @, address, email |
| copy-github-url | Copy GitHub URL | ⎘ | github, gh, link |
| share-view | Share this view | ↗ | copy url, link, share |

---

### `lib/uptime.ts` (lib helper, pure function — CREATE)

**Analog:** `lib/api.ts` lines 25–35 (typed named-export function pattern) + `lib/routes.ts` (UPPERCASE constant convention)

**Function shape** (`02-CONTEXT.md` D-15):
```ts
/**
 * Formats the duration from a career start date to now as "Yy DDDd".
 * Computed at build time (RSC caller) — no setInterval needed (daily drift acceptable).
 */
export function formatUptime(startDate: Date, now: Date): string {
  const ms = now.getTime() - startDate.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const remainder = days % 365;
  return `${years}y ${String(remainder).padStart(3, "0")}d`;
}
```

**Conventions from `lib/api.ts` pattern:** Named export, JSDoc comment, typed parameters, no default export, 2-space indent, double quotes, no trailing commas.

**Note:** `CAREER_START_DATE` constant (a `Date` object representing the developer's career start) should live in `lib/portfolio-data.ts` alongside `PROFILE` (per `02-CONTEXT.md` D-15: `CAREER_START_DATE` constant in `lib/portfolio-data.ts`).

---

### Test files (9 Vitest specs — CREATE)

**Analog:** `vitest.setup.ts` line 1 (test env baseline) + `02-RESEARCH.md` Vitest Code Examples (lines 785–848)

**No in-repo test analog after D-16 deletes `homepage.test.tsx`.** The following is the template drawn from RESEARCH.md.

**TEST-02: TopBar spec** (`02-CONTEXT.md` D-18 + RESEARCH pattern):
```tsx
// app/components/shell/top-bar.test.tsx
import { render, screen } from "@testing-library/react";
// Wrap with ShellStateProvider + mock next-themes + mock usePalette
test("renders traffic lights, path label, ⌘K trigger, theme toggle, resume button", () => {
  render(<TopBar />, { wrapper: Providers });
  expect(screen.getByRole("banner")).toBeInTheDocument(); // <header>
  expect(screen.getByRole("link", { name: /download resume/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /open command palette/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /toggle color theme/i })).toBeInTheDocument();
});
```

**TEST-02: Sidebar spec** (`02-CONTEXT.md` D-18):
```tsx
// app/components/shell/sidebar.test.tsx
import { render, screen } from "@testing-library/react";
import { ROUTES } from "@/lib/routes";
// Mock useSelectedLayoutSegment to return "projects"
vi.mock("next/navigation", () => ({ useSelectedLayoutSegment: () => "projects" }));

test("renders 7 rows from ROUTES with correct aria-label", () => {
  render(<Sidebar uptime="7y 000d" />);
  ROUTES.forEach((r) => {
    expect(screen.getByRole("button", { name: r.ariaLabel })).toBeInTheDocument();
  });
});
test("active row has aria-current=page", () => {
  render(<Sidebar uptime="7y 000d" />);
  expect(screen.getByRole("button", { name: "Projects" })).toHaveAttribute("aria-current", "page");
});
```

**TEST-03: Palette spec** (`02-CONTEXT.md` D-19 + RESEARCH Code Examples lines 785–822):
```tsx
// app/components/shell/command-palette.test.tsx
import userEvent from "@testing-library/user-event";
test("opens on ⌘K, closes on Esc, restores focus", async () => {
  const user = userEvent.setup();
  render(/* ShellStateProvider + trigger button + CommandPalette */);
  await user.click(screen.getByTestId("trigger"));
  await user.keyboard("{Meta>}k{/Meta}");
  expect(screen.getByRole("dialog", { name: /command palette/i })).toBeInTheDocument();
  await user.keyboard("contact");
  expect(screen.getByRole("option", { name: /open contact\.sh/i })).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByTestId("trigger")).toHaveFocus();
});
```

**TEST-04: AccentBootstrapScript + theme spec** (`02-CONTEXT.md` D-20 + RESEARCH Code Examples lines 826–848):
```tsx
// app/components/shell/accent-bootstrap-script.test.tsx
test("emits inline script containing portfolio-accent and --accent-hue", () => {
  const { container } = render(<AccentBootstrapScript />);
  const script = container.querySelector("script");
  expect(script?.innerHTML).toContain("portfolio-accent");
  expect(script?.innerHTML).toContain("--accent-hue");
});

test("script applies stored hue to documentElement", () => {
  localStorage.setItem("portfolio-accent", "75");
  // render into live document so JSDOM executes <script>
  expect(document.documentElement.style.getPropertyValue("--accent-hue")).toBe("75");
});
```

---

## Shared Patterns

### RSC Default (no `"use client"`)
**Source:** `app/layout.tsx` (current, no `"use client"`) + `app/sitemap.ts` + CLAUDE.md §"Architecture rules"
**Apply to:** `app/(terminal)/layout.tsx`, all 7 stub pages, `app/not-found.tsx`, `AccentBootstrapScript`, `PromptLine`, `lib/uptime.ts`, `lib/palette-verbs.ts`, `lib/routes.ts`, `app/sitemap.ts`
```tsx
// No "use client" — RSC default
export default function SomeLayout({ children }: { children: React.ReactNode }) { ... }
```

### `"use client"` at file top, named export
**Source:** (existing) `app/components/theme-toggle.tsx` line 1 (being deleted — but the pattern transfers) + CLAUDE.md §"Architecture rules"
**Apply to:** `TopBar`, `Sidebar`, `CommandPalette`, `LiveClock`, `Breadcrumb`, `ThemeProvider`, `ShellStateProvider`
```tsx
"use client";
// named export — not default
export function TopBar() { ... }
```

### `@/` import alias for cross-directory, relative for siblings
**Source:** `lib/api.ts` lines 1–8; `vitest.config.ts` lines 7–9; `lib/routes.ts` (imported with `@/lib/routes`)
**Apply to:** All new files importing from `lib/`, `app/components/`, etc.
```tsx
import { ROUTES } from "@/lib/routes";          // cross-directory: @/
import { LiveClock } from "./live-clock";        // same directory: ./
```

### UPPERCASE module-level typed constants
**Source:** `lib/routes.ts` lines 26–76 (`ROUTES`); `lib/portfolio-data.ts` lines 25–56 (`PROFILE`)
**Apply to:** `lib/palette-verbs.ts` (`PALETTE_VERBS`); `lib/portfolio-data.ts` addition of `CAREER_START_DATE`
```ts
export const PALETTE_VERBS: readonly PaletteVerb[] = [...] as const;
export const CAREER_START_DATE = new Date("2018-01-01"); // actual date developer-supplied
```

### Named exports; default reserved for framework entry points
**Source:** `lib/routes.ts` (named); `app/sitemap.ts` (default — framework); `app/layout.tsx` (default — framework)
**Apply to:** All lib helpers and components → named exports. `app/(terminal)/layout.tsx`, all stub pages, `app/not-found.tsx`, `app/sitemap.ts` → default export (Next.js file convention).

### `import type` for type-only imports
**Source:** `lib/api.ts` lines 9–16; `app/layout.tsx` line 1
**Apply to:** All new files importing types only (`Metadata`, `ReactNode`, `Route`, etc.)
```ts
import type { Metadata } from "next";
import type { ReactNode } from "react";
```

### 2-space indent, double quotes, no trailing commas
**Source:** All existing files (CONVENTIONS.md §"Code Style")
**Apply to:** All new Phase 2 files. Note: RESEARCH.md code examples occasionally show trailing commas — normalize before writing.

### Pre-paint inline script via `dangerouslySetInnerHTML` (RSC)
**Source:** `app/layout.tsx` lines 20–29/39 (existing `themeScript` — direct predecessor pattern)
**Apply to:** `AccentBootstrapScript` only (replacing the existing pattern)
```tsx
const SCRIPT = `(function () { ... })();`;
export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
```

### Brownfield delete-and-replace in same commit
**Source:** CLAUDE.md §"Brownfield discipline"; Phase 1 `01-PATTERNS.md` §"No Analog Found"
**Apply to:** Wave 2 commit must delete `homepage.tsx`, `homepage.test.tsx`, `theme-toggle.tsx`, `app/page.tsx`, and the `themeScript` block in `app/layout.tsx` in the SAME commit that introduces the rewritten `app/layout.tsx`.

---

## No Analog Found

Files with no close match in the codebase — executor should use `design_handoff_terminal_portfolio/app.jsx` + `02-RESEARCH.md` Code Examples as the primary reference:

| File | Role | Data Flow | Reason | Primary Authority |
|------|------|-----------|--------|-------------------|
| `app/(terminal)/layout.tsx` | controller (RSC shell) | server composition | First route-group persistent layout in repo | `app.jsx` lines 501–552 (JSX shape) + RESEARCH §"Recommended Project Structure" |
| `app/components/shell/command-palette.tsx` | client island | event-driven (cmdk) | First cmdk usage in repo | `02-RESEARCH.md` Pattern 2 (full cmdk API example) |
| `app/components/shell/theme-provider.tsx` | client wrapper | static provider | First next-themes wrapper in repo | `02-RESEARCH.md` Pattern 1 |
| `app/components/shell/shell-state-provider.tsx` | client Context | event-driven (React Context) | First Context/useReducer pattern in repo | `02-CONTEXT.md` Claude's Discretion §"ShellStateProvider API" |
| `lib/palette-verbs.ts` | lib helper (typed const) | static export | No command palette verb registry in repo | `lib/routes.ts` for const shape; `02-UI-SPEC.md` §"Verb Taxonomy" for content |
| `lib/uptime.ts` | lib helper (pure fn) | date arithmetic transform | No date-arithmetic helpers in repo | `02-CONTEXT.md` D-15 for spec; `lib/api.ts` for function shape |

---

## Metadata

**Analog search scope:**
- `app/` — `layout.tsx`, `globals.css`, `sitemap.ts`, `page.tsx`, `robots.ts`
- `app/components/` — `homepage.tsx` (deleted), `theme-toggle.tsx` (deleted), `homepage.test.tsx` (deleted)
- `lib/` — `routes.ts`, `api.ts`, `portfolio-data.ts`, `types.ts`
- Root configs — `vitest.config.ts`, `vitest.setup.ts`, `package.json`, `tsconfig.json`
- `design_handoff_terminal_portfolio/app.jsx` — 605-line prototype (canonical visual reference)
- `.planning/phases/01-foundation/01-PATTERNS.md` — Phase 1 conventions (carry-forward)
- `.planning/phases/02-shell/02-RESEARCH.md` — Pattern 1–5 code examples + test examples
- `.planning/phases/02-shell/02-CONTEXT.md` — 21 locked decisions
- `.planning/phases/02-shell/02-UI-SPEC.md` — visual + copy contracts

**Files scanned:** 16 source/config files in repo; `app.jsx` (605 lines, read in targeted sections); `02-RESEARCH.md` (read in 5 targeted sections); `02-CONTEXT.md` + `02-UI-SPEC.md` (full reads); `01-PATTERNS.md` (full read for carry-forward conventions)

**Pattern extraction date:** 2026-05-06
