# Codebase Structure

**Analysis Date:** 2026-05-06

## Directory Layout

```
portfolio-web/
├── app/                                    # Next.js App Router root
│   ├── components/                         # React components used by routes
│   │   ├── homepage.tsx                    # Presentational homepage shell
│   │   ├── homepage.test.tsx               # Vitest + Testing Library smoke test
│   │   └── theme-toggle.tsx                # Client component for theme switching
│   ├── globals.css                         # Theme tokens + global styles
│   ├── layout.tsx                          # Root layout, metadata, theme bootstrap
│   ├── page.tsx                            # Route: `/` (async Server Component)
│   ├── robots.ts                           # /robots.txt (Next metadata convention)
│   └── sitemap.ts                          # /sitemap.xml (Next metadata convention)
├── lib/                                    # Framework-agnostic data + types
│   ├── api.ts                              # Typed fetchers w/ ISR + fallbacks
│   ├── fallback-data.ts                    # Offline defaults matching `types.ts`
│   └── types.ts                            # Domain interfaces (Profile, Skill, ...)
├── public/                                 # Served at site root verbatim
│   └── resume.pdf                          # Downloadable resume
├── design_handoff_terminal_portfolio/      # Untracked design references (see below)
│   ├── README.md                           # Design spec / implementation guide
│   ├── app.jsx                             # React prototype (Babel standalone)
│   ├── data.js                             # Sample data for prototype
│   ├── tweaks-panel.jsx                    # Live design tweak UI prototype
│   ├── index.html                          # Standalone preview entry
│   ├── resume.pdf                          # Reference resume
│   └── screenshots/                        # 8 PNG mockups (light/dark/cmd palette)
├── .planning/                              # GSD planning artifacts
│   └── codebase/                           # Codebase maps (this directory)
├── .next/                                  # Build output (gitignored)
├── node_modules/                           # Dependencies (gitignored)
├── .env.example                            # Sample env vars
├── .eslintrc.json                          # Extends `next/core-web-vitals`
├── .gitignore                              # node_modules, .next, .env.local, coverage, dist
├── next-env.d.ts                           # Next.js TypeScript ambient types
├── next.config.ts                          # Empty NextConfig
├── package.json                            # Scripts + deps
├── package-lock.json
├── README.md                               # Setup + run instructions
├── tsconfig.json                           # `@/*` alias to project root, strict mode
├── vitest.config.ts                        # jsdom env, `@` alias, react plugin
└── vitest.setup.ts                         # Imports jest-dom matchers for Vitest
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router routes, layouts, and route-scoped components.
- Contains: `*.tsx` route files, `globals.css`, metadata file conventions (`robots.ts`, `sitemap.ts`).
- Key files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.

**`app/components/`:**
- Purpose: Reusable React components consumed by routes in `app/`.
- Contains: One server-renderable component (`homepage.tsx`), one client component (`theme-toggle.tsx`), co-located test (`homepage.test.tsx`).
- Key files: `app/components/homepage.tsx`, `app/components/theme-toggle.tsx`.

**`lib/`:**
- Purpose: Framework-agnostic data access and shared TypeScript types. Importable from anywhere via the `@/lib/...` alias.
- Contains: HTTP API client (`api.ts`), domain interfaces (`types.ts`), in-process fallback data (`fallback-data.ts`).
- Key files: `lib/api.ts`, `lib/types.ts`, `lib/fallback-data.ts`.

**`public/`:**
- Purpose: Static assets served at the site root by Next.js.
- Contains: `resume.pdf` (referenced by `app/components/homepage.tsx` as `/resume.pdf`).
- Generated: No. Committed: Yes.

**`design_handoff_terminal_portfolio/`:**
- Purpose: **Design references only — not source code.** A "terminal/IDE" aesthetic redesign spec from an external designer.
- Contains: A detailed `README.md` describing the proposed App Router structure, color tokens, and views; standalone HTML/JSX prototypes (`app.jsx`, `tweaks-panel.jsx`, `index.html`, `data.js`); 8 PNG screenshots under `screenshots/` covering all six views in light/dark plus the command palette.
- Tracked in git: **No** (currently untracked per `git status`).
- Role: Source of truth for a future visual overhaul. Implementers should translate its visual system into the existing Next.js conventions; do not import its `.jsx` files into the build.

**`.planning/codebase/`:**
- Purpose: Generated codebase maps consumed by `/gsd-plan-phase` and `/gsd-execute-phase`.
- Generated: Yes (by `/gsd-map-codebase`). Committed: Typically yes.

**`.next/`, `node_modules/`:** Build artifacts and installed dependencies. Both gitignored.

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root HTML shell, metadata, theme bootstrap script.
- `app/page.tsx`: Homepage route (`/`).

**Configuration:**
- `next.config.ts`: Currently an empty `NextConfig` object.
- `tsconfig.json`: `strict: true`, `paths: { "@/*": ["./*"] }`, includes Vitest + jest-dom types.
- `vitest.config.ts`: `jsdom`, globals, `@` alias, React plugin, `vitest.setup.ts`.
- `.eslintrc.json`: `extends: ["next/core-web-vitals"]`.
- `.env.example`: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`.

**Core Logic:**
- `lib/api.ts`: All outbound API calls.
- `lib/types.ts`: Domain model.
- `lib/fallback-data.ts`: Offline-safe defaults.
- `app/components/homepage.tsx`: Single page composition.

**SEO / Crawler Files:**
- `app/robots.ts` → `/robots.txt`
- `app/sitemap.ts` → `/sitemap.xml`
- `metadata` exports in `app/layout.tsx` and `app/page.tsx`.

**Testing:**
- `app/components/homepage.test.tsx` (only test in the project).
- `vitest.setup.ts` (jest-dom matchers).

## Naming Conventions

**Files:**
- React components and tests use **kebab-case** (`homepage.tsx`, `theme-toggle.tsx`, `homepage.test.tsx`).
- Library modules use **kebab-case** (`fallback-data.ts`).
- Single-word modules: lowercase (`api.ts`, `types.ts`, `page.tsx`).
- Tests are **co-located** beside the file under test as `<name>.test.tsx`.

**Directories:**
- Lowercase, single word where possible (`app`, `lib`, `public`, `components`).
- Multi-word uses snake_case only for the external `design_handoff_terminal_portfolio/` reference; otherwise no multi-word internal directories exist yet — prefer kebab-case if introducing one.

**Identifiers:**
- React components: `PascalCase` exported named functions (`Homepage`, `ThemeToggle`).
- Hooks/utilities/data: `camelCase` (`getProfile`, `applyTheme`, `fallbackProfile`).
- Types/interfaces: `PascalCase` (`Profile`, `MobileApp`, `BlogPost`).
- Constants: `SCREAMING_SNAKE_CASE` for module-level constants (`STORAGE_KEY` in `app/components/theme-toggle.tsx`).

**Imports:**
- Use the `@/` alias for cross-directory imports (e.g. `import { getProfile } from "@/lib/api"`).
- Use relative paths for siblings inside the same directory (e.g. `import { ThemeToggle } from "./theme-toggle"`).

## Where to Add New Code

**New page / route:**
- Create `app/<segment>/page.tsx` (and optional `layout.tsx`, `loading.tsx`, `error.tsx`).
- Example: a blog post page should live at `app/blog/[slug]/page.tsx` (the homepage already links to `/blog/${slug}`).

**New shared component:**
- Implementation: `app/components/<kebab-name>.tsx`.
- Co-locate test: `app/components/<kebab-name>.test.tsx`.
- Mark client components with `"use client"` at the very top (see `app/components/theme-toggle.tsx`).

**New domain type:**
- Add an `interface` to `lib/types.ts`.
- If the type is API-backed, add a matching fallback to `lib/fallback-data.ts` and a fetcher to `lib/api.ts` using the existing `getJson<T>(path, fallback)` helper.

**New API endpoint integration:**
- Add a typed fetcher in `lib/api.ts` that calls `getJson<T>("/api/<path>", fallback<T>)` so caching (`revalidate: 300`) and fallback behavior are inherited.

**New utility / pure helper:**
- Place under `lib/` as a new module (e.g. `lib/format.ts`); keep it framework-agnostic so it can be imported via `@/lib/...`.

**New static asset:**
- Drop into `public/` and reference with a root-relative path (e.g. `<a href="/resume.pdf">`).

**New environment variable:**
- Add it to `.env.example`. Public values (read in client components) **must** be prefixed `NEXT_PUBLIC_`. Read defensively with `??` defaults as in `lib/api.ts` and `app/sitemap.ts`.

**New global style or theme token:**
- Edit `app/globals.css`. Theme variables live under `:root` (light) and `html[data-theme="dark"]` (dark).

## Special Directories

**`design_handoff_terminal_portfolio/`:**
- Purpose: External design handoff bundle (HTML/JSX prototypes + screenshots + spec).
- Generated: No (authored by designer).
- Committed: **No** — currently untracked.
- Action: Treat as documentation; do not bundle its `.jsx` into the Next.js build.

**`.next/`:**
- Purpose: Next.js build cache and output.
- Generated: Yes (by `next dev` / `next build`).
- Committed: No (gitignored).

**`.planning/`:**
- Purpose: GSD workflow artifacts (codebase maps, phase plans).
- Generated: Yes (by `/gsd-*` commands).
- Committed: Typically yes.

---

*Structure analysis: 2026-05-06*
