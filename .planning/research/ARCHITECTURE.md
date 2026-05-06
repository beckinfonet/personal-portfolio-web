# Architecture Research

**Domain:** Personal portfolio (terminal/IDE aesthetic) — Next.js 15 App Router with persistent shell, 7 per-view routes, sibling-repo HTTP backend
**Researched:** 2026-05-06
**Confidence:** HIGH (Next.js layout/route-group behavior verified against official 16.2 docs; next-themes behavior verified against the README; sitemap behavior verified against official docs)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ Browser                                                              │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ <html data-theme="dark" style="--accent-hue:145">  (pre-paint) │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ Persistent Terminal Shell  (route-group layout, NEVER    │  │ │
│  │  │ unmounts on navigation between the 7 sibling routes)     │  │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │  │ │
│  │  │  │ TopBar (client)  · ⌘K btn · theme btn · clock      │ │  │ │
│  │  │  └─────────────────────────────────────────────────────┘ │  │ │
│  │  │  ┌──────────────────┐  ┌──────────────────────────────┐ │  │ │
│  │  │  │ Sidebar (client) │  │ <main>{children}</main>      │ │  │ │
│  │  │  │  - FileTree      │  │   ↑                          │ │  │ │
│  │  │  │  - StatusBlock   │  │   page.tsx for active route  │ │  │ │
│  │  │  │  - ResumeCard    │  │   (RSC, fetches its own data)│ │  │ │
│  │  │  └──────────────────┘  └──────────────────────────────┘ │  │ │
│  │  │  ┌─────────────────────────────────────────────────────┐ │  │ │
│  │  │  │ CommandPalette (client, mounted at shell root)      │ │  │ │
│  │  │  └─────────────────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────┬─────────────────────────────┘
                                         │ Next.js client navigation
                                         │ (only <main> children re-render)
                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Next.js server (Vercel)                                              │
│  RSC: per-route page.tsx → @/lib/api → fetch(... revalidate: 300)   │
└────────────────────────────────────────┬─────────────────────────────┘
                                         │ HTTP
                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│ portfolio-services/  (sibling repo, owned by same dev)               │
│   /api/profile  /api/skills  /api/experience  /api/posts            │
│   /api/apps     /api/projects  ← NEW                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Root layout (`app/layout.tsx`) | `<html>`/`<body>` element, font loading (`next/font/google` JetBrains Mono), root `<meta>`, two pre-hydration inline scripts (theme + accent), wraps everything in `ThemeProvider` and `ShellStateProvider` | Server component; the only place `<html>` exists |
| Shell layout (`app/(terminal)/layout.tsx`) | The persistent terminal chrome — TopBar, Sidebar, breadcrumb row, footer, mounts CommandPalette. Receives `{children}` and renders the active page inside `<main>` | Server component that imports client islands (TopBar, Sidebar, CommandPalette) |
| View pages (`app/(terminal)/.../page.tsx`) | One per terminal "file" — fetches its own data via `@/lib/api`, renders the prompt line + view body, exports per-route `metadata` | Async RSC, optionally wrapping slow children in `<Suspense>` |
| `TopBar` (client) | Active path label (from `usePathname`), ⌘K button (toggles palette via shell store), theme toggle (calls `useTheme()` from next-themes), live clock | `"use client"`, small, no data fetching |
| `Sidebar` (client) | File tree of the 7 routes, active highlight (from `useSelectedLayoutSegment`), resume download button, status block, mobile bottom-sheet variant | `"use client"`, uses `<Link>` for nav |
| `CommandPalette` (client) | ⌘K modal built on `cmdk`, items derived from a static route registry + theme/social actions, type-to-filter, focus-trap | `"use client"`, mounted once in the shell layout |
| `ThemeProvider` (client) | Wraps `next-themes` `ThemeProvider` with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem` | Tiny wrapper — see Pattern 2 |
| `ShellStateProvider` (client) | Holds transient UI state: `paletteOpen`, `accentHue` (with localStorage persistence), `mobileSidebarOpen` | React Context + `useReducer`; no Zustand needed |
| `lib/api.ts` | Typed fetchers with ISR (`revalidate: 300`) and silent fallback | Existing pattern, extended with `getProjects()` |
| `lib/portfolio-data.ts` | Typed seed/fallback data shaped to the new terminal data model | Replaces `lib/fallback-data.ts` |
| `lib/types.ts` | Shared domain interfaces — the canonical type source consumed by both lib/api.ts and the seed data; **manually mirrored** from `portfolio-services` (see Backend Contract below) | Plain TS interfaces, no runtime validation |
| `lib/routes.ts` (NEW) | Single registry of the 7 routes used by `Sidebar`, `CommandPalette`, and `app/sitemap.ts` so all three stay in sync | Const array with `{ path, label, icon, description }` |

## Recommended Project Structure

```
portfolio-web/
├── app/
│   ├── layout.tsx                          # ROOT — html/body, fonts, ThemeProvider,
│   │                                       #   ShellStateProvider, theme+accent inline scripts
│   ├── globals.css                         # CSS tokens (oklch palette + --accent-hue)
│   ├── robots.ts                           # unchanged
│   ├── sitemap.ts                          # NOW iterates lib/routes.ts
│   ├── (terminal)/                         # Route group — does NOT appear in URL
│   │   ├── layout.tsx                      # Persistent shell (TopBar/Sidebar/main/footer)
│   │   ├── page.tsx                        # / → about view (RSC; getProfile)
│   │   ├── projects/page.tsx               # /projects → ProjectsView (RSC; getProjects)
│   │   ├── stack/page.tsx                  # /stack → StackView (RSC; getSkills)
│   │   ├── experience/page.tsx             # /experience → ExperienceView (RSC; getExperience)
│   │   ├── writing/page.tsx                # /writing → WritingView (RSC; getPosts)
│   │   ├── contact/page.tsx                # /contact → ContactView (RSC; getProfile)
│   │   └── shipped/page.tsx                # /shipped → ShippedAppsView (RSC; getApps)
│   └── components/
│       ├── shell/                          # All terminal-shell pieces (client islands)
│       │   ├── top-bar.tsx                 # "use client" — clock, ⌘K btn, theme btn
│       │   ├── sidebar.tsx                 # "use client" — file tree + resume + status
│       │   ├── command-palette.tsx         # "use client" — cmdk integration
│       │   ├── breadcrumb.tsx              # "use client" — usePathname-driven
│       │   ├── theme-provider.tsx          # "use client" — next-themes wrapper
│       │   ├── shell-state-provider.tsx    # "use client" — palette/accent context
│       │   └── theme-bootstrap-script.tsx  # server — emits the inline pre-paint script
│       ├── views/                          # One file per view (RSC by default)
│       │   ├── about-view.tsx
│       │   ├── projects-view.tsx
│       │   ├── stack-view.tsx
│       │   ├── experience-view.tsx
│       │   ├── writing-view.tsx
│       │   ├── contact-view.tsx
│       │   └── shipped-view.tsx
│       └── primitives/                     # Tiny presentational helpers shared by views
│           ├── prompt-line.tsx             # `$ <command>` cursor block
│           ├── tech-chip.tsx
│           └── kbd.tsx
├── lib/
│   ├── api.ts                              # +getProjects(); existing pattern preserved
│   ├── portfolio-data.ts                   # NEW — typed seed/fallback (replaces fallback-data.ts)
│   ├── types.ts                            # Updated to terminal data model
│   ├── routes.ts                           # NEW — single source of truth for the 7 routes
│   └── theme-tokens.ts                     # NEW — accent hue list + token names (TS-side mirror)
├── public/
│   └── resume.pdf                          # Real PDF
└── (root unchanged: next.config.ts, tsconfig.json, vitest.config.ts, etc.)
```

### Structure Rationale

- **`(terminal)` route group:** This is the load-bearing decision. A folder named `(terminal)` does **not** appear in the URL path, but the `layout.tsx` inside it wraps every sibling page (`page.tsx`, `projects/page.tsx`, etc.). Per the Next.js 15 docs, layouts "do not rerender" on navigation between their children — the shell DOM, client component state (`paletteOpen`, `mobileSidebarOpen`), focus, and scroll all persist when the user clicks from `/` to `/projects`. Putting the shell at the root layout instead would force `<html>`/`<body>` and the shell into the same tree, making it harder to add a future "raw" route (e.g. `/og-image`) that doesn't want the chrome. The route-group split keeps options open without paying any cost today.

- **`app/components/shell/` vs `app/components/views/` vs `app/components/primitives/`:** The shell talks to the views only via the layout `{children}` slot — no imports between them. The views don't know the shell exists; the shell doesn't know which view is mounted. Primitives (`prompt-line`, `tech-chip`) are imported by views only. This boundary is what makes the views unit-testable in isolation.

- **`lib/routes.ts` as a single registry:** The 7 routes are referenced in three places — Sidebar file tree, Command Palette items, sitemap.ts. Without a registry these drift, and a new route silently fails to appear in the sitemap. Defining them once as `const ROUTES = [...] as const` makes adding view #8 a one-line change everywhere.

- **`lib/portfolio-data.ts` replacing `lib/fallback-data.ts`:** The terminal data model includes new entities (Project, Writing) and a richer `Profile` (highlights, bio.long[], stack object). The old fallback file is dropped wholesale rather than evolved — the existing `homepage.test.tsx` is being deleted with the old homepage anyway, so there's no consumer to keep happy.

- **Per-view `page.tsx` files (not a single `[view]/page.tsx` dynamic route):** Per-view files give per-view `metadata` exports for free — distinct titles, OG descriptions, structured data — which is the whole point of moving to per-view routes for SEO. A dynamic catch-all would force the metadata into a `generateMetadata` function and lose static type safety on the view list.

## Architectural Patterns

### Pattern 1: Persistent shell via route-group layout

**What:** Place the terminal chrome in `app/(terminal)/layout.tsx`. The 7 routes live as siblings inside `(terminal)/`. Next.js's App Router preserves layout DOM and client state across navigation between siblings; only `{children}` (the active page) re-renders.

**When to use:** Whenever you have a "shell + content area" UI where the shell carries significant state (open palette, accent picker, scroll position in a sidebar) that must survive route changes.

**Trade-offs:**
- ✅ Free state preservation — no Zustand needed for persistence-across-routes
- ✅ Sidebar/TopBar/CommandPalette mount once, hydrate once
- ✅ Faster route transitions (only the inner `<main>` re-renders)
- ⚠️ Layouts cannot read `pathname` or `searchParams` directly — must push that into a child client component (see Pattern 4)
- ⚠️ Can't pass props from layout → page; data shared between shell and views must come from a fetch in both places (deduped automatically by Next.js's fetch cache) or from a context

**Example:**
```tsx
// app/(terminal)/layout.tsx — server component
import { TopBar } from "@/app/components/shell/top-bar";
import { Sidebar } from "@/app/components/shell/sidebar";
import { CommandPalette } from "@/app/components/shell/command-palette";
import { Breadcrumb } from "@/app/components/shell/breadcrumb";

export default function TerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="terminal-shell">
      <TopBar />
      <div className="terminal-body">
        <Sidebar />
        <main className="terminal-main">
          <Breadcrumb />
          {children}
          <footer className="terminal-footer">
            © 2026 Bakytbek Tatibekov · built with React · v1.0.0
          </footer>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
```

### Pattern 2: Two-script SSR-flash-free theme + accent

**What:** `next-themes` only writes one HTML attribute (default `data-theme`) — it does **not** manage CSS variables. To also set `--accent-hue` before first paint without a flash, emit a **second** tiny inline script in the root layout that reads `localStorage["portfolio-accent"]` and sets `document.documentElement.style.setProperty('--accent-hue', value)` synchronously. CSS in `globals.css` then derives the full accent palette from that single custom property using `oklch(... var(--accent-hue) ...)`.

**When to use:** Any time you have BOTH a discrete theme setting (light/dark) AND a continuous setting (hue) and you need both to apply before paint.

**Trade-offs:**
- ✅ Zero flash on first paint (both scripts run blockingly before body)
- ✅ next-themes handles all the hard parts of theme (system pref, multi-tab sync, hydration mismatch suppression)
- ✅ One CSS variable per concern — palette generation stays in CSS
- ⚠️ Two localStorage keys to manage — easy to keep in sync but worth a comment
- ⚠️ The accent script runs OUTSIDE next-themes' provider, so accent state in React must hydrate from the same localStorage key on mount to avoid drift

**Example:**
```tsx
// app/components/shell/theme-bootstrap-script.tsx — server component, no "use client"
const script = `
(function() {
  try {
    var hue = localStorage.getItem('portfolio-accent') || '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) {}
})();
`;
export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
```

```tsx
// app/layout.tsx (sketch)
import { ThemeProvider } from "next-themes";
import { AccentBootstrapScript } from "@/app/components/shell/theme-bootstrap-script";
import { ShellStateProvider } from "@/app/components/shell/shell-state-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <AccentBootstrapScript />
        {/* next-themes injects its own theme script automatically */}
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```css
/* app/globals.css */
:root {
  --accent-hue: 145; /* default; the inline script overrides this before paint */
  --accent: oklch(0.78 0.18 var(--accent-hue));
  --accent-dim: oklch(0.45 0.12 var(--accent-hue));
  --accent-bg: oklch(0.78 0.18 var(--accent-hue) / 0.08);
}
[data-theme="light"] {
  --accent: oklch(0.42 0.16 var(--accent-hue));
  /* ... */
}
```

### Pattern 3: Per-route data fetching (NOT a top-level loader)

**What:** Each `page.tsx` fetches only the data it needs via `@/lib/api`. The existing `getJson<T>()` ISR-with-fallback pattern is preserved. The shell layout fetches **nothing**.

**When to use:** Always, for this project. Per-route fetches give per-route `revalidate` control, per-route streaming with `<Suspense>`, and prevent the homepage from blocking on `/projects` data.

**Trade-offs:**
- ✅ Each view ships only its own data → smaller initial payload per route
- ✅ A slow `/projects` API call doesn't slow `/about`
- ✅ Native fetch deduplication: if two views call `getProfile()` on the same request, Next.js dedupes
- ⚠️ Have to think about whether the Sidebar needs any data (it doesn't — file tree is static, status block is static, resume is a static asset)
- ⚠️ Resist the urge to make a "loader" abstraction — Next.js's per-component fetch IS the loader

**Example:**
```tsx
// app/(terminal)/projects/page.tsx
import { getProjects } from "@/lib/api";
import { ProjectsView } from "@/app/components/views/projects-view";

export const metadata = { title: "projects/ — Bakytbek Tatibekov" };

export default async function ProjectsPage() {
  const projects = await getProjects(); // ISR + fallback inherited
  return <ProjectsView projects={projects} />;
}
```

### Pattern 4: Active-view detection in client components — `useSelectedLayoutSegment`, not stored state

**What:** The Sidebar needs to highlight the active file. Use the Next.js client hook `useSelectedLayoutSegment()` (or `usePathname()`) inside the `Sidebar` client component. Do NOT mirror the active route into a Zustand/Context store — the URL IS the source of truth.

**When to use:** Anywhere the UI needs to know "which child route is active" — Sidebar highlight, breadcrumb label, palette current-item indicator.

**Trade-offs:**
- ✅ Zero risk of state desync between URL and UI
- ✅ Browser back/forward Just Works
- ✅ External links (e.g. shared `/projects` URL) hydrate to the right active state
- ⚠️ `usePathname()` and `useSelectedLayoutSegment()` are client-only — the consuming component must be `"use client"`
- ⚠️ Layouts themselves can't read pathname — must push the read into a child client component

**Example:**
```tsx
// app/components/shell/sidebar.tsx
"use client";
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export function Sidebar() {
  const segment = useSelectedLayoutSegment(); // null on "/", "projects" on "/projects", etc.
  return (
    <nav className="sidebar">
      {ROUTES.map((r) => (
        <Link
          key={r.path}
          href={r.path}
          aria-current={segmentMatches(segment, r) ? "page" : undefined}
        >
          {r.icon} {r.label}
        </Link>
      ))}
    </nav>
  );
}
```

### Pattern 5: Sitemap derived from a single route registry

**What:** `app/sitemap.ts` imports `ROUTES` from `lib/routes.ts` and maps over it to produce the sitemap entries. Adding a new route is a single edit (to `lib/routes.ts`), and the sitemap automatically syncs.

**When to use:** Whenever route additions and SEO discoverability must stay in lockstep — which is always for this project per the SEO-parity constraint in PROJECT.md.

**Trade-offs:**
- ✅ Adding a route updates the Sidebar, Command Palette, AND sitemap with one edit
- ✅ No third-party dependency (`next-sitemap`) — uses Next.js's native `sitemap.ts` convention
- ✅ Type-safe: a typo in a route path is a TS error
- ⚠️ Doesn't auto-discover dynamic blog post routes — those would still need to be appended manually OR enumerated by reading the writing data at build time (out of scope for v1; the writing list is a single `/writing` page, no per-post routes)

**Example:**
```ts
// lib/routes.ts
export const ROUTES = [
  { path: "/",           label: "about.md",       segment: null,         icon: "◆", priority: 1.0 },
  { path: "/projects",   label: "projects/",      segment: "projects",   icon: "▸", priority: 0.9 },
  { path: "/stack",      label: "stack.json",     segment: "stack",      icon: "{}", priority: 0.7 },
  { path: "/experience", label: "experience.log", segment: "experience", icon: "≡", priority: 0.8 },
  { path: "/writing",    label: "writing/",       segment: "writing",    icon: "▸", priority: 0.7 },
  { path: "/contact",    label: "contact.sh",     segment: "contact",    icon: "$", priority: 0.9 },
  { path: "/shipped",    label: "shipped.app",    segment: "shipped",    icon: "▸", priority: 0.7 },
] as const;
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ROUTES.map((r) => ({
    url: `${baseUrl}${r.path}`,
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
```

## Data Flow

### Request Flow (cold cache, first paint of `/projects`)

```
[GET /projects]
    ↓
[Next.js runtime]
    ↓
[app/layout.tsx]                  → emits <html>, runs <AccentBootstrapScript>
    ↓                                injects next-themes script
[app/(terminal)/layout.tsx]       → renders TopBar/Sidebar/CommandPalette shells
    ↓                                (server-side render of client component placeholders)
[app/(terminal)/projects/page.tsx] → await getProjects()
    ↓
[lib/api.ts → getJson<Project[]>]
    ↓
[fetch('http://.../api/projects', { next: { revalidate: 300 } })]
    ↓                                   ↓ (on failure)
[portfolio-services]              [fallback from lib/portfolio-data.ts]
    ↓                                   ↓
                  ←──── data ────
    ↓
[<ProjectsView projects={...} />]
    ↓
[stream HTML to browser]
    ↓
[client hydrates: next-themes confirms theme matches, ShellStateProvider boots,
 TopBar starts clock interval, Sidebar reads useSelectedLayoutSegment]
```

### Navigation Flow (warm — `/projects` → `/stack`)

```
[Click sidebar link to /stack]
    ↓
[Next.js client router intercepts <Link>]
    ↓
[Streams app/(terminal)/stack/page.tsx from server (or serves from cache)]
    ↓
[Shell layout DOM is REUSED — TopBar, Sidebar, CommandPalette all stay mounted]
    ↓
[Only <main>{children}</main> re-renders with the new view]
    ↓
[Sidebar's useSelectedLayoutSegment() returns "stack" → active highlight updates]
    ↓
[Breadcrumb's usePathname() returns "/stack" → label updates]
    ↓
[Browser URL is /stack; back/forward work natively]
```

### State Management

```
URL (Next.js router)              ──► useSelectedLayoutSegment / usePathname
                                       (Sidebar active highlight, Breadcrumb label)

next-themes ThemeProvider         ──► useTheme()
  (data-theme on <html>,                (TopBar theme button, palette "toggle theme")
   localStorage["theme"])

ShellStateProvider (Context)      ──► usePalette(), useAccent()
  (paletteOpen, accentHue,              (CommandPalette open/close, accent picker)
   mobileSidebarOpen,
   localStorage["portfolio-accent"])

Per-route fetched data            ──► passed as props from page.tsx → view component
  (RSC fetch, ISR 300s,                 (no client store; data is server-side prop)
   fallback from lib/portfolio-data.ts)
```

### Key Data Flows

1. **Theme change:** User clicks theme button → `setTheme("light")` from `useTheme()` → next-themes writes `data-theme="light"` on `<html>` and `localStorage["theme"] = "light"` → CSS `[data-theme="light"]` rules apply → if `disableTransitionOnChange` is set, no flash.

2. **Accent change:** User opens accent picker (in palette) → `setAccent(75)` from `useAccent()` → ShellStateProvider writes `document.documentElement.style.setProperty('--accent-hue', '75')` AND `localStorage["portfolio-accent"] = "75"` → all `oklch(... var(--accent-hue) ...)` rules in CSS recompute live.

3. **Route navigation:** User clicks `<Link href="/projects">` → Next.js router fetches the page chunk → only `<main>` re-renders with the new RSC tree → Sidebar's `useSelectedLayoutSegment()` returns `"projects"` → active highlight updates → Breadcrumb's `usePathname()` returns `"/projects"` → label updates.

4. **Command palette open:** User presses ⌘K → global `keydown` listener in `CommandPalette` calls `setPaletteOpen(true)` from `usePalette()` → modal mounts → focus is trapped by `cmdk` → user types "stack" → cmdk filters items → user hits Enter → palette dispatches a `<Link>` click via `router.push("/stack")` → palette closes → URL changes → flow #3 fires.

5. **API fetch failure:** Backend down → `fetch` rejects in `getJson<T>` → `catch` returns the typed fallback from `lib/portfolio-data.ts` → page renders with seed data → user sees no error, just slightly stale content. This is the existing pattern preserved.

## Backend Contract & Type Sharing

**Recommendation: hand-mirrored types in `lib/types.ts`, kept-in-sync via shared schema convention.**

Three options were considered; here's the matrix specific to the situation (two sibling repos, single developer, both repos in scope this milestone):

| Option | Setup cost | Drift risk | Verdict |
|--------|------------|------------|---------|
| **Hand-mirrored TS interfaces in `lib/types.ts`** (current pattern) | Zero | Medium — must remember to update both | ✅ **Recommended for v1.** Cheapest. Single developer = drift detected on next consumer use. Existing pattern. |
| **Shared types package via pnpm workspace** | High — restructure into a monorepo, configure workspaces, both repos must move | Low | ❌ Out of scope: PROJECT.md constrains "single repo per concern" and the two repos already exist separately with their own git histories. Restructuring is unrelated to the redesign. |
| **OpenAPI/Zod codegen from a schema spec** | Medium — author OpenAPI spec, configure codegen, add CI | Very low (schema is the source of truth) | ⚠️ Defer. Worth revisiting if the API surface grows beyond ~10 endpoints or if a third consumer (e.g. mobile app) appears. Adds runtime validation as a side benefit. |

**Recommended discipline for v1:**

1. **Author shapes in `portfolio-services` first** when changing an endpoint, then update `portfolio-web/lib/types.ts` to match in the same PR (or paired commits).
2. **Document the contract** in a `docs/api-contract.md` in `portfolio-services` listing each endpoint's response shape — single source the developer reviews when changing either side.
3. **Use `zod` (or hand-written narrowing functions) at the boundary in `lib/api.ts`** to validate responses *if* a type mismatch ever causes a render bug. Defer until that bug actually happens.
4. **Keep `lib/portfolio-data.ts` typed against `lib/types.ts`** — TypeScript will fail compilation if seed data drifts from the type, surfacing one half of the contract automatically.

**Why not ship Zod codegen now:** Adds a build-time dependency, a CI step, and a learning curve to a project where the developer owns both sides. The "free" runtime safety is real but not yet earned by a scale of pain.

## Build Order Implications

The component dependency graph constrains build order. Phases should follow this dependency chain:

```
Phase A: Foundation (NO views buildable until this is done)
    │
    ├── lib/types.ts             (terminal data model)
    ├── lib/portfolio-data.ts    (typed seed)
    ├── lib/routes.ts            (route registry)
    ├── lib/api.ts               (+getProjects)
    ├── app/globals.css          (oklch tokens, --accent-hue, theme variants)
    ├── app/layout.tsx           (root: ThemeProvider, AccentBootstrapScript, fonts)
    └── app/(terminal)/layout.tsx (shell skeleton with empty children slot)
            │
            ├── components/shell/theme-provider.tsx
            ├── components/shell/shell-state-provider.tsx
            ├── components/shell/top-bar.tsx
            ├── components/shell/sidebar.tsx
            ├── components/shell/breadcrumb.tsx
            └── components/shell/command-palette.tsx
    │
    ▼
Phase B: First vertical slice — about.md view
    │
    ├── app/(terminal)/page.tsx
    ├── components/views/about-view.tsx
    └── components/primitives/prompt-line.tsx
    │
    ▼ (Validates the entire pattern end-to-end with one route)
    │
Phase C: Remaining 6 views (parallelizable across views once primitives exist)
    │
    ├── projects-view + tech-chip primitive
    ├── stack-view (JSON syntax highlight)
    ├── experience-view
    ├── writing-view
    ├── contact-view
    └── shipped-view
    │
    ▼
Phase D: Cross-cutting polish
    │
    ├── Mobile responsive (bottom-sheet sidebar, touch ⌘K replacement)
    ├── app/sitemap.ts (now derives from lib/routes.ts)
    ├── Real content population
    └── Vitest coverage (shell, view switching, palette, theme, accent)
    │
    ▼
Phase E: Backend changes (PARALLELIZABLE with Phase C — different repo)
    │
    ├── portfolio-services: add /api/projects
    └── portfolio-services: adjust shapes to match lib/types.ts
```

### Critical dependencies

- **Nothing renders until `lib/types.ts` is finalized.** Block on this.
- **Nothing renders correctly until `globals.css` tokens are wired.** Block view work on theme tokens.
- **The shell layout must exist (even empty-children-slot stub) before any view can be visually validated** — views are designed to live inside the shell, so testing them in isolation with no shell gives false visuals.
- **Backend work (`portfolio-services` updates) is fully parallelizable** with frontend work, since `lib/portfolio-data.ts` provides fallbacks. Frontend can ship and validate against fallbacks; backend joins later.

### Why "first vertical slice" matters

Building the shell + ONE view first (Phase B) before the other six (Phase C) catches architectural mistakes — wrong context boundaries, missing primitives, palette/theme integration bugs — when they cost one view's worth of rework, not seven. It's worth the slight inefficiency vs. building all views in parallel.

## Anti-Patterns

### Anti-Pattern 1: Putting the shell in the root layout

**What people do:** Place `TopBar`/`Sidebar`/`CommandPalette` directly in `app/layout.tsx`.
**Why it's wrong:** Locks every future route into the shell — including potential `/og-image`, `/api-debug`, or any "raw" page. Mixing `<html>`/`<body>`/font setup with shell UI also makes the root layout harder to test and harder to swap.
**Do this instead:** Keep the root layout responsible only for `<html>`, `<body>`, fonts, providers, and pre-paint scripts. Put the shell in `app/(terminal)/layout.tsx`. Empty cost today, options preserved for tomorrow.

### Anti-Pattern 2: Mirroring the active route into client state

**What people do:** Add `activeFile: string` to a Zustand/Context store and update it in `<Link>` `onClick` handlers.
**Why it's wrong:** Two sources of truth (URL + store) inevitably desync. Browser back/forward bypasses the store. Shared URLs hydrate to the wrong state. Code grows to "fix" the desyncs.
**Do this instead:** Read the URL with `useSelectedLayoutSegment()` or `usePathname()`. The URL is the state; the store is for things the URL doesn't carry (palette open, accent hue).

### Anti-Pattern 3: Letting next-themes "manage" the accent hue

**What people do:** Define themes like `"dark-matrix"`, `"dark-amber"`, `"light-matrix"`, etc. in next-themes and use the attribute system for both axes.
**Why it's wrong:** Combinatorial explosion (2 themes × 4 hues = 8 combinations). Every CSS rule must list 8 selectors. Adding a 5th hue is now an 8-place edit.
**Do this instead:** Use next-themes for the discrete light/dark axis only. Apply accent hue as a single `--accent-hue` CSS variable and let `oklch(L C var(--accent-hue))` in CSS derive everything. One variable, infinite hues.

### Anti-Pattern 4: Fetching shell data in the layout

**What people do:** Add `await getProfile()` to `app/(terminal)/layout.tsx` so the Sidebar can show the user's name in the status block.
**Why it's wrong:** Per Next.js 15 docs, layout data fetches block navigation (without Cache Components) and `loading.js` cannot show a fallback for them. Worse, layouts can't pass data to children — every page would still need its own `getProfile()` call.
**Do this instead:** Either (a) hardcode shell-level content (name, status — they're effectively static for a personal portfolio) in `lib/portfolio-data.ts` exports and import them directly into the Sidebar, or (b) wrap any layout-side fetch in `<Suspense>` with a skeleton fallback.

### Anti-Pattern 5: Hand-maintaining sitemap entries

**What people do:** Hardcode the 7 URLs into `app/sitemap.ts`.
**Why it's wrong:** Adding a new view requires editing four files (Sidebar, CommandPalette, the new route, sitemap). The sitemap is the one most easily forgotten — and forgetting it directly violates the SEO-parity constraint in PROJECT.md.
**Do this instead:** Define the route list once in `lib/routes.ts`. Import it into Sidebar, CommandPalette, and sitemap.ts. Adding view #8 is one line in one file.

### Anti-Pattern 6: Using `usePathname()` inside the layout itself

**What people do:** Try to add `const pathname = usePathname()` to `app/(terminal)/layout.tsx` to derive the breadcrumb.
**Why it's wrong:** Layouts don't re-render on navigation — `usePathname` would return a stale value. Per official docs: "Layouts do not re-render on navigation, so they do not access pathname which would otherwise become stale."
**Do this instead:** Extract the breadcrumb into its own client component (`components/shell/breadcrumb.tsx` with `"use client"`) and render it inside the layout. Client components DO re-render on navigation.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| `portfolio-services` API (sibling repo) | HTTP fetch via `lib/api.ts` with `next: { revalidate: 300 }` ISR + typed fallback from `lib/portfolio-data.ts` | URL via `NEXT_PUBLIC_API_BASE_URL`. Existing pattern preserved. Add `getProjects()`. |
| Next.js `next/font/google` (JetBrains Mono) | Loaded once in root layout, exported as a CSS variable that `globals.css` consumes via `font-family` | Self-hosts the font at build time → no runtime CDN call → no FOIT |
| `localStorage` (browser) | Read pre-paint by inline scripts (one for theme via next-themes, one for accent); written from React via providers | Two keys: `theme` (next-themes default), `portfolio-accent` (custom) |
| `cmdk` library | Wrapped by `CommandPalette` client component, items derived from `lib/routes.ts` + theme/social actions | Provides focus management, keyboard nav, type-to-filter for free |
| `next-themes` library | `ThemeProvider` in root layout with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem` | Handles SSR-flash for the theme axis only |
| Vercel deployment | `npm run build` produces a Next.js standalone output; per-route ISR works out of the box | No config changes needed beyond existing setup |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Shell ↔ Views | One-way: layout `{children}` slot only. No imports between `components/shell/` and `components/views/`. | Enforces that views are URL-routable in isolation |
| View ↔ Primitives | Views import primitives. Primitives never import views. | Primitives are tiny and reusable |
| ShellStateProvider ↔ next-themes | Independent — both hang off the root layout. ShellStateProvider does NOT manage theme. | Single responsibility per provider |
| `lib/` ↔ `app/` | One-way: app imports lib. Lib never imports from app. | Keeps lib portable and testable in isolation |
| `lib/types.ts` ↔ `portfolio-services` | Hand-mirrored, manually kept in sync. Documented in `portfolio-services/docs/api-contract.md`. | See "Backend Contract & Type Sharing" above |
| `app/sitemap.ts` ↔ Sidebar ↔ CommandPalette | All three import from `lib/routes.ts`. Single source of truth. | Adding a route is one edit to `lib/routes.ts` |

## Sources

- [Next.js Layout API reference (v16.2)](https://nextjs.org/docs/app/api-reference/file-conventions/layout) — HIGH confidence: layouts do not re-render on navigation, do not access pathname/searchParams, cannot pass data to children
- [Next.js Route Groups reference](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — HIGH: `(folder)` excludes from URL, navigating between different root layouts triggers full reload
- [Next.js Sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — HIGH: native default-export pattern returning `MetadataRoute.Sitemap`
- [Next.js Streaming guide](https://nextjs.org/docs/app/guides/streaming) — HIGH: per-component data fetching with Suspense is the canonical pattern for App Router
- [next-themes README (pacocoursey/next-themes)](https://github.com/pacocoursey/next-themes) — HIGH: only manages HTML attributes, does not manage CSS variables, supports any `data-*` attribute
- [next-themes npm page](https://www.npmjs.com/package/next-themes) — HIGH: `attribute`, `value`, `forcedTheme`, `disableTransitionOnChange` semantics
- [cmdk on npm](https://www.npmjs.com/package/cmdk) — referenced in design handoff README as the recommended palette primitive
- Existing codebase: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `lib/api.ts`, `lib/types.ts`, `app/sitemap.ts` — HIGH confidence
- Design handoff: `design_handoff_terminal_portfolio/README.md` — recommended structure, theme/state notes, accent hue model

---
*Architecture research for: terminal-IDE personal portfolio with persistent shell, per-view App Router routes, theme + accent state, sibling-repo backend*
*Researched: 2026-05-06*
