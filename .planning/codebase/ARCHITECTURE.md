# Architecture

**Analysis Date:** 2026-05-06

## Pattern Overview

**Overall:** Next.js 15 App Router (React Server Components by default) — single-page recruiter-facing portfolio that fetches content from an external HTTP API at request/build time and degrades gracefully to in-process fallback data.

**Key Characteristics:**
- React 19 + Next.js 15.3.2 with the **App Router** (`app/` directory, no `pages/`).
- **Server-first rendering**: `app/page.tsx` is an async Server Component; only the theme toggle opts into the client (`"use client"`).
- **ISR via `fetch`**: All API calls pass `next: { revalidate: 300 }`, so the homepage is incrementally regenerated every 5 minutes.
- **Content shape is typed end-to-end** via `lib/types.ts`; fallbacks in `lib/fallback-data.ts` satisfy the same interfaces.
- **No CSS framework** — global CSS variables in `app/globals.css` drive a `data-theme` attribute on `<html>`.

## Layers

**Routing & Page Layer (`app/`):**
- Purpose: Route definitions, metadata, and SEO file conventions.
- Location: `app/`
- Contains: `layout.tsx`, `page.tsx`, `globals.css`, `robots.ts`, `sitemap.ts`.
- Depends on: Component layer (`app/components/`) and data layer (`lib/`).
- Used by: Next.js runtime.

**Component Layer (`app/components/`):**
- Purpose: Presentational + interactive UI building blocks.
- Location: `app/components/`
- Contains: `homepage.tsx` (server-renderable presentational component), `theme-toggle.tsx` (client component), `homepage.test.tsx`.
- Depends on: `lib/types.ts` for prop typing.
- Used by: `app/page.tsx`.

**Data Access Layer (`lib/`):**
- Purpose: Typed API client with built-in fallback behavior.
- Location: `lib/`
- Contains: `api.ts` (HTTP fetchers), `types.ts` (domain interfaces), `fallback-data.ts` (offline defaults).
- Depends on: `process.env.NEXT_PUBLIC_API_BASE_URL`, native `fetch`.
- Used by: Server Components (`app/page.tsx`) and tests.

**Static Assets (`public/`):**
- Purpose: Files served verbatim at the site root.
- Location: `public/`
- Contains: `resume.pdf` (downloaded via `<a href="/resume.pdf" download>` in `app/components/homepage.tsx`).

## Data Flow

**Homepage request → render:**

1. Browser hits `/` → Next.js invokes `app/layout.tsx` (sets `<html lang="en">`, injects an inline theme bootstrap script that reads `localStorage["portfolio-theme"]`, sets `data-theme` to avoid FOUC).
2. `app/page.tsx` runs as a Server Component; in parallel via `Promise.all` it calls `getProfile`, `getSkills`, `getExperience`, `getApps`, `getPosts(3)` from `@/lib/api`.
3. Each `lib/api.ts` fetcher calls `getJson(path, fallback)` which performs `fetch(`${baseUrl}${path}`, { next: { revalidate: 300 } })`. If the response is not OK or throws, it returns the typed fallback from `lib/fallback-data.ts`.
4. Resolved data is passed as props to `<Homepage>` (`app/components/homepage.tsx`) which renders semantic `<section>` blocks (hero, skills, mobile apps, resume, experience timeline, blog preview, contact).
5. `<ThemeToggle>` (`app/components/theme-toggle.tsx`) hydrates on the client, syncing `data-theme` and `localStorage["portfolio-theme"]`.
6. Result is HTML streamed to the browser; the page revalidates after 300s on the next request (ISR).

**State Management:**
- Server-side: none — data is fetched per render and passed as props.
- Client-side: only the theme toggle uses local React state (`useState`) plus `localStorage` for persistence. No global store, no Context, no Redux.

## Key Abstractions

**`getJson<T>(path, fallback)`:**
- Purpose: Single fetch helper that enforces ISR caching and silent fallback on failure.
- Location: `lib/api.ts`
- Pattern: Generic typed wrapper around `fetch` with try/catch returning `T`.

**Domain interfaces (`Profile`, `Skill`, `Experience`, `MobileApp`, `BlogPost`, `SocialLink`):**
- Purpose: Contract between API responses, fallback data, and view components.
- Location: `lib/types.ts`
- Pattern: Plain TypeScript interfaces, no runtime validation.

**`Homepage` presentational component:**
- Purpose: Stateless renderer that accepts all five domain collections as props.
- Location: `app/components/homepage.tsx`
- Pattern: Pure function component; testable in isolation by feeding fallback fixtures (see `app/components/homepage.test.tsx`).

**Theme bootstrap script (inline, blocking):**
- Purpose: Apply persisted theme before first paint to avoid flash.
- Location: `app/layout.tsx` (constant `themeScript`, injected via `dangerouslySetInnerHTML`).
- Pattern: IIFE reading `localStorage` and setting `document.documentElement.dataset.theme`.

## Entry Points

**`app/layout.tsx`:**
- Triggers: Wraps every route.
- Responsibilities: Exports `metadata` (title, description, OpenGraph), renders `<html><body>`, injects the theme bootstrap script before children.

**`app/page.tsx`:**
- Triggers: GET `/`.
- Responsibilities: Async Server Component; fan-out fetches via `Promise.all`; passes data to `<Homepage>`; exports route-specific `metadata`.

**`app/robots.ts`:**
- Triggers: GET `/robots.txt` (Next.js file convention).
- Responsibilities: Returns `MetadataRoute.Robots` allowing all user agents and pointing to `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

**`app/sitemap.ts`:**
- Triggers: GET `/sitemap.xml` (Next.js file convention).
- Responsibilities: Returns `MetadataRoute.Sitemap` containing only the root URL with `weekly` change frequency.

## Rendering Strategy

- **Default:** Server Components rendered on the server.
- **ISR (Incremental Static Regeneration):** Active for the homepage because every upstream `fetch` sets `next: { revalidate: 300 }`. The page is cached and rebuilt at most every 5 minutes.
- **Client Components:** Only `app/components/theme-toggle.tsx` (marked `"use client"`).
- **No SSR-only routes, no CSR-only pages, no `getServerSideProps`** (the App Router does not use that API).

## Routing Model

- File-system routing under `app/`. There is exactly one route: `/` (`app/page.tsx`).
- No dynamic segments, no route groups, no parallel/intercepting routes.
- Blog post links in `app/components/homepage.tsx` (`<a href={`/blog/${post.slug}`}>`) point at routes that **do not yet exist** — they will currently 404.
- `robots.ts` and `sitemap.ts` are Next.js metadata file conventions, not user-facing routes.

## Error Handling

**Strategy:** Defensive defaults — never let upstream API failures break rendering.

**Patterns:**
- `lib/api.ts` wraps every call in `try/catch` and returns a typed fallback on either a thrown error or a non-OK response.
- No `error.tsx`, `not-found.tsx`, or `loading.tsx` boundary files defined under `app/` — relying on Next.js defaults.
- No client-side error boundary wrapping `<ThemeToggle>`.

## Cross-Cutting Concerns

**Logging:** None — failures in `getJson` are silently swallowed (`catch {}`).

**Validation:** None at runtime; TypeScript interfaces are the only contract. API responses are cast directly via `as T`.

**Authentication:** Not applicable — the site is fully public read-only.

**Theming:** CSS variables in `app/globals.css`, switched via `data-theme="dark|light"` attribute on `<html>`, persisted in `localStorage` under key `portfolio-theme`.

**SEO:** `metadata` exports in `app/layout.tsx` and `app/page.tsx`, plus `app/robots.ts` and `app/sitemap.ts`. Semantic HTML in `app/components/homepage.tsx` (`<main>`, `<section aria-labelledby=...>`, `<h1>`/`<h2>`/`<h3>` hierarchy).

**Testing:** Vitest + Testing Library smoke test in `app/components/homepage.test.tsx`; `vitest.config.ts` aliases `@/*` to project root and uses `jsdom`.

## External Boundaries

- **Backend API:** Configured via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`); endpoints `/api/profile`, `/api/skills`, `/api/experience`, `/api/apps`, `/api/posts?limit=N`.
- **Static asset:** `public/resume.pdf` served at `/resume.pdf`.
- **Outbound user clicks:** App Store, Google Play, GitHub, LinkedIn (data-driven from API/fallback).

---

*Architecture analysis: 2026-05-06*
