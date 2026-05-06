# Coding Conventions

**Analysis Date:** 2026-05-06

## Naming Patterns

**Files:**
- All TypeScript/TSX source files use **kebab-case**: `homepage.tsx`, `theme-toggle.tsx`, `fallback-data.ts`
- Test files mirror source filename and append `.test.tsx`: `homepage.test.tsx` (located alongside the implementation in `app/components/`)
- Next.js convention files keep their framework-defined names: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/robots.ts`, `app/sitemap.ts`
- Library modules live in `lib/` with kebab-case: `lib/api.ts`, `lib/types.ts`, `lib/fallback-data.ts`

**Functions:**
- React component functions use **PascalCase** and are exported as named exports: `export function Homepage(...)`, `export function ThemeToggle()` in `app/components/homepage.tsx` and `app/components/theme-toggle.tsx`
- Page-level default exports remain **PascalCase**: `export default function Home()` in `app/page.tsx`, `export default function RootLayout(...)` in `app/layout.tsx`
- Next.js metadata route handlers are lowercase to match the framework's expected export shape: `export default function robots()` in `app/robots.ts`, `export default function sitemap()` in `app/sitemap.ts`
- Async data-fetching helpers use **camelCase** with a `get` prefix: `getProfile`, `getSkills`, `getExperience`, `getApps`, `getPosts` in `lib/api.ts`
- Internal helpers use **camelCase**: `getJson`, `applyTheme`, `toggleTheme`

**Variables:**
- Local and module-level variables are **camelCase**: `baseUrl`, `nextTheme`, `stored`
- Constants representing fixed string keys are **UPPER_SNAKE_CASE**: `STORAGE_KEY = "portfolio-theme"` in `app/components/theme-toggle.tsx`
- Fallback data exports are **camelCase** with `fallback` prefix: `fallbackProfile`, `fallbackSkills`, `fallbackExperience`, `fallbackApps`, `fallbackPosts` in `lib/fallback-data.ts`

**Types:**
- All types are **PascalCase** `interface` declarations in `lib/types.ts`: `Profile`, `SocialLink`, `Skill`, `Experience`, `MobileApp`, `BlogPost`
- Component prop types use the `<ComponentName>Props` suffix and are declared as `interface` in the same file as the component: `interface HomepageProps` in `app/components/homepage.tsx`

## Code Style

**Formatting:**
- No Prettier or Biome config detected in the repo. Style is enforced informally via the conventions visible in the source.
- Indentation: **2 spaces** throughout.
- Strings: **double quotes** for JS/TS string literals (e.g. `"./fallback-data"`, `"light"`, `"dark"`).
- Semicolons: **always present** at statement ends.
- Trailing commas: **omitted** in multi-line object literals (see `package.json` and `tsconfig.json`, plus the `metadata` object in `app/layout.tsx`).
- JSX uses double quotes for attributes.

**Linting:**
- Configured via `.eslintrc.json` extending only `next/core-web-vitals`:
  ```json
  { "extends": ["next/core-web-vitals"] }
  ```
- Lint command (defined in `package.json`): `npm run lint` → `eslint . --ext .ts,.tsx`
- No custom rules, plugins, or overrides — the project relies on Next.js defaults plus TypeScript's strict compiler.

**TypeScript Strictness (`tsconfig.json`):**
- `"strict": true` — all strict family checks enabled (noImplicitAny, strictNullChecks, etc.)
- `"allowJs": false` — TS/TSX only, no plain JavaScript files allowed
- `"isolatedModules": true` — every file must be independently transpilable
- `"noEmit": true` — TypeScript is used for type-checking only; Next.js handles emit
- `"target": "ES2017"`, `"module": "esnext"`, `"moduleResolution": "bundler"`
- `"jsx": "preserve"` — JSX is left for Next.js/SWC to compile
- Test globals are typed via `"types": ["vitest/globals", "@testing-library/jest-dom"]`

## Import Organization

**Order observed across `app/page.tsx`, `app/components/homepage.tsx`, and `lib/api.ts`:**
1. Type-only imports first when present, using `import type { ... }` (e.g. `import type { Metadata } from "next"`, `import type { BlogPost, Experience, MobileApp, Profile, Skill } from "@/lib/types"`)
2. External package imports (Next.js, React)
3. Internal aliased or relative module imports

**Type vs value imports:**
- Pure type imports always use `import type` to keep the runtime bundle clean. Example from `lib/api.ts`:
  ```ts
  import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";
  ```
- Multi-name imports are sorted alphabetically: `import { fallbackApps, fallbackExperience, fallbackPosts, fallbackProfile, fallbackSkills } from "./fallback-data";`

**Path Aliases (`tsconfig.json` + `vitest.config.ts`):**
- `@/*` maps to the project root: `"paths": { "@/*": ["./*"] }`
- Used as `@/lib/api`, `@/lib/types`, `@/lib/fallback-data`
- The alias is mirrored in `vitest.config.ts` so tests resolve identically:
  ```ts
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } }
  ```
- Relative imports (`./homepage`, `./fallback-data`) are used for siblings; aliased imports cross directory boundaries.

## Component Patterns (Server vs Client)

**Default to Server Components:**
- All Next.js App Router files (`app/layout.tsx`, `app/page.tsx`, `app/robots.ts`, `app/sitemap.ts`) and the `Homepage` presentational component (`app/components/homepage.tsx`) are **server components** — no `"use client"` directive.
- Async data fetching happens in server components via `Promise.all` in `app/page.tsx`:
  ```tsx
  const [profile, skills, experience, apps, posts] = await Promise.all([
    getProfile(), getSkills(), getExperience(), getApps(), getPosts(3)
  ]);
  ```

**Client Components are opt-in:**
- Use `"use client"` as the first line only when the component needs browser APIs, state, or effects.
- Example: `app/components/theme-toggle.tsx` uses `localStorage`, `useState`, and `useEffect`, so it begins with:
  ```tsx
  "use client";
  import { useEffect, useState } from "react";
  ```

**Component Authoring Style:**
- Use named function declarations (`export function Foo() {}`), not arrow functions assigned to consts.
- Default exports are reserved for Next.js convention files (`page.tsx`, `layout.tsx`, `robots.ts`, `sitemap.ts`).
- Props are destructured in the function signature and typed via a sibling `interface ...Props`.
- `RootLayout` props use `Readonly<{ children: React.ReactNode }>` rather than a named interface.

## CSS / Styling Approach

**Global stylesheet only:**
- A single global stylesheet at `app/globals.css` is imported once from `app/layout.tsx`: `import "./globals.css";`
- No CSS Modules, Tailwind, styled-components, or CSS-in-JS in use.

**CSS Custom Properties for theming:**
- Light theme values are defined on `:root`; dark theme values override on `html[data-theme="dark"]`. Variables: `--bg`, `--card`, `--text`, `--muted`, `--accent`.
- Components consume tokens through plain class names: `.container`, `.topbar`, `.card`, `.theme-toggle`, `.inline-links`, `.muted`.
- Theme switching is driven by a `data-theme` attribute on `<html>`, set by an inline blocking script in `app/layout.tsx` to avoid FOUC:
  ```tsx
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  ```

**Class naming:**
- Plain lowercase, hyphenated CSS class names. No BEM, no utility framework.
- JSX uses `className` with string literals; no `clsx`/`classnames` helpers in the codebase.

## Error Handling

**Fetch failures degrade silently to fallback data** (`lib/api.ts`):
```ts
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 300 } });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
```
- Pattern: every public `get*` helper has a matching fallback in `lib/fallback-data.ts` so the homepage always renders.
- `try { ... } catch {}` swallows browser/runtime errors — used both in API fetching and in the inline theme bootstrap script in `app/layout.tsx`.
- No central logger, error boundary, or `error.tsx` file is defined.

**Environment variables:**
- Read with nullish-coalescing defaults so missing config never throws: `process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"` (`lib/api.ts`), `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` (`app/robots.ts`, `app/sitemap.ts`).

## Logging

- No logging framework. No `console.log`/`console.error` calls in source.
- Errors are intentionally suppressed in favour of fallback rendering (see Error Handling above).

## Comments & Documentation

- Source files contain essentially no inline comments. The only comment is the framework-generated notice in `next-env.d.ts` (`// NOTE: This file should not be edited`).
- No JSDoc/TSDoc anywhere in the codebase.
- Code is expected to be self-documenting via descriptive names and small functions.

## Function Design

**Size:** All functions in the codebase are short — typically under 30 lines. The largest is the `Homepage` JSX in `app/components/homepage.tsx` (~100 lines of declarative markup).

**Parameters:**
- Object destructuring at the call site for component props (`{ profile, skills, experience, apps, posts }`).
- Default parameter values for optional config: `getPosts(limit = 3)` in `lib/api.ts`.

**Return Values:**
- All async helpers return strongly typed `Promise<T>` and provide a typed fallback so the return type is never `T | undefined`.
- `getJson` is generic over `T` and uses an `as T` cast on the parsed JSON — there is no runtime schema validation (no Zod/Yup).

## Module Design

**Exports:**
- Prefer **named exports** for components, helpers, types, and data: `export function Homepage`, `export const fallbackProfile`, `export interface Profile`.
- **Default exports** are reserved for Next.js framework entry points (`page.tsx`, `layout.tsx`, `robots.ts`, `sitemap.ts`).

**Barrel Files:**
- None. Imports always reach the concrete module (`@/lib/api`, `@/lib/types`, `./theme-toggle`).

**Module Boundaries:**
- `lib/` holds framework-agnostic data, types, and fetching logic.
- `app/` holds Next.js routes and React components.
- `app/components/` holds reusable UI building blocks consumed by routes.

---

*Convention analysis: 2026-05-06*
