# Technology Stack

**Analysis Date:** 2026-05-06

## Languages

**Primary:**
- TypeScript 5.8.3 — All application code under `app/` and `lib/`
- TSX/JSX — React component files such as `app/components/homepage.tsx`, `app/components/theme-toggle.tsx`

**Secondary:**
- CSS — Single global stylesheet at `app/globals.css` (CSS custom properties for theming, no preprocessor)
- JSON — Configuration files (`package.json`, `tsconfig.json`, `.eslintrc.json`)

## Runtime

**Environment:**
- Node.js — Version not pinned (no `.nvmrc`, no `engines` field in `package.json`)
- `@types/node` 22.15.17 in devDependencies suggests Node 22 development target
- Browser runtime: Modern (TS target `ES2017`, lib `dom`, `dom.iterable`, `esnext` per `tsconfig.json` line 3-4)

**Package Manager:**
- npm — `package-lock.json` present (lockfile version 3, ~287KB)
- No `pnpm-lock.yaml` or `yarn.lock`
- `README.md` line 34 instructs `npm install` / `npm run dev`

## Frameworks

**Core:**
- Next.js 15.3.2 — App Router (see `app/layout.tsx`, `app/page.tsx`)
  - Built-in metadata API (`Metadata` export in `app/layout.tsx` line 4)
  - Built-in `MetadataRoute` for `app/robots.ts` and `app/sitemap.ts`
  - ISR via `next: { revalidate: 300 }` in `lib/api.ts` line 15
- React 19.1.0 / React DOM 19.1.0 — Server and client components
  - Client components marked with `"use client"` (e.g. `app/components/theme-toggle.tsx` line 1)

**Testing:**
- Vitest 3.1.4 — Test runner configured in `vitest.config.ts`
- @testing-library/react 16.2.0 — Component rendering / queries
- @testing-library/jest-dom 6.6.3 — DOM matchers (registered in `vitest.setup.ts` line 1)
- jsdom 26.1.0 — Browser environment for tests (`vitest.config.ts` line 12: `environment: "jsdom"`)
- @vitejs/plugin-react 4.4.1 — JSX/TSX transformation for Vitest

**Build/Dev:**
- Next.js CLI — `next dev`, `next build`, `next start` (see `package.json` lines 6-8)
- TypeScript compiler — `noEmit: true` (`tsconfig.json` line 8); Next.js handles emission
- ESLint 8.57.0 with `eslint-config-next` 15.3.2 — Lint via `eslint . --ext .ts,.tsx` (`package.json` line 9)

## Key Dependencies

**Critical (production):**
- `next` 15.3.2 — Application framework
- `react` 19.1.0 — UI library
- `react-dom` 19.1.0 — React renderer

**Infrastructure (devDependencies):**
- `typescript` 5.8.3 — Type system
- `@types/node` 22.15.17 — Node type definitions
- `@types/react` 19.1.3, `@types/react-dom` 19.1.3 — React type definitions
- `vitest` 3.1.4 / `@vitejs/plugin-react` 4.4.1 / `jsdom` 26.1.0 — Test stack
- `@testing-library/react` 16.2.0, `@testing-library/jest-dom` 6.6.3 — Test utilities
- `eslint` 8.57.0, `eslint-config-next` 15.3.2 — Linting

**Notable absence:**
- No CSS framework (Tailwind, CSS Modules, styled-components, etc.) — pure CSS in `app/globals.css`
- No state management library (Redux, Zustand, etc.) — local state via React hooks
- No data-fetching library (SWR, React Query) — direct `fetch` in `lib/api.ts`
- No form library, no animation library, no UI component library
- No HTTP client (no axios) — uses native `fetch`

## Configuration

**TypeScript (`tsconfig.json`):**
- `strict: true` (line 7)
- `target: ES2017` (line 3)
- `module: esnext`, `moduleResolution: bundler` (lines 10-11)
- `jsx: preserve` (line 14) — Next.js handles JSX transform
- Path alias: `"@/*": ["./*"]` rooted at project base (lines 19-21)
- Test types: `["vitest/globals", "@testing-library/jest-dom"]` (line 17)
- Includes `next-env.d.ts` and `.next/types/**/*.ts` (line 23)

**Next.js (`next.config.ts`):**
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```
Empty config — pure defaults, no custom rewrites/redirects/images config.

**Vitest (`vitest.config.ts`):**
- `environment: "jsdom"`, `globals: true`, setup file `./vitest.setup.ts`
- Mirrors `@/*` path alias (`vitest.config.ts` lines 6-9)

**ESLint (`.eslintrc.json`):**
```json
{ "extends": ["next/core-web-vitals"] }
```

**Git ignore (`.gitignore`):**
- `node_modules`, `.next`, `.env.local`, `coverage`, `dist`

## Platform Requirements

**Development:**
- Node.js + npm
- `npm install` then `npm run dev` (serves at `http://localhost:3000`)
- Optional: backing API at `http://localhost:8080` (gracefully falls back via `lib/api.ts` lines 17-21 if unreachable)

**Production:**
- `README.md` lines 49-51 describes Vercel as the primary deploy target
- Alternative: `npm run build` → `npm run start` on any Node host
- Build artifacts emitted to `.next/` (gitignored)

## Scripts (`package.json`)

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "test": "vitest run"
}
```

---

*Stack analysis: 2026-05-06*
