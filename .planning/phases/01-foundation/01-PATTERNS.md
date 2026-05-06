# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-05-06
**Files analyzed:** 16 (12 created, 6 modified, 1 deleted; one file appears in both create+modify because `lib/types.ts` exists as a skeleton being rewritten)
**Analogs found:** 13 in-repo / 16 (3 files have no in-repo analog and reference RESEARCH.md drafts + cited external docs)

## File Classification

| New / Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|--------|------|-----------|----------------|---------------|
| `lib/types.ts` | REWRITE | model (type definitions) | static type contract | `lib/types.ts` (current skeleton, 7 interfaces) | exact — same file, preserves convention |
| `lib/portfolio-data.ts` | CREATE | model (typed seed data) | static export-only | `lib/fallback-data.ts` | exact — direct replacement |
| `lib/api.ts` | MODIFY | service (API client) | request-response w/ ISR + silent fallback | `lib/api.ts` (current) | exact — preserve `getJson` helper signature |
| `lib/routes.ts` | CREATE | config (route registry) | static `as const` array | `lib/types.ts` (typed const-export style); `app/sitemap.ts` (consumer pattern) | role-match — no existing registry but TS const-export pattern is clear |
| `next.config.ts` | REWRITE | config (Next.js framework config) | build-time + runtime headers | `next.config.ts` (current empty) | partial — file scaffold/import pattern only; `headers()` body has no in-repo analog (use RESEARCH.md §2) |
| `app/layout.tsx` | MODIFY (1-line) | controller (root layout RSC) | server-side metadata | `app/layout.tsx` (current) | exact — only `metadataBase` field added; rest preserved |
| `app/components/homepage.tsx` | MODIFY (shape adapter) | component (presentational RSC) | props-rendering | `app/components/homepage.tsx` (current) | exact — same file, minimal field renames |
| `app/components/homepage.test.tsx` | MODIFY (fixture import) | test | render + assertion | `app/components/homepage.test.tsx` (current) | exact — same file, swap import path + fixture names |
| `package.json` | MODIFY (deps + scripts) | config | npm scripts + deps | `package.json` (current) | exact — extend existing structure |
| `tsconfig.json` | MODIFY (1 field) | config | TS compiler config | `tsconfig.json` (current) | exact — single `target` field bump |
| `eslint.config.mjs` | CREATE | config (ESLint flat config) | static export array | `vitest.config.ts` (`.mjs`-style ESM `defineConfig` import) | role-match — no in-repo `eslint.config.mjs` analog; closest `defineConfig` ESM pattern is vitest |
| `.eslintrc.json` | DELETE | config | n/a | n/a (deleted in same commit as `eslint.config.mjs`) | n/a |
| `.gitignore` | MODIFY (append) | config | text | `.gitignore` (current) | exact — append-only |
| `.env.example` | UNCHANGED in Phase 1 | config | n/a | n/a | n/a |
| `.nvmrc` | CREATE | config (Node version pin) | text | none in-repo | no analog — single-line Node version string per RESEARCH.md §"Open Questions Q2" |
| `.github/workflows/ci.yml` | CREATE | config (CI pipeline) | YAML workflow | none in-repo | no analog — full draft in RESEARCH.md §"CI Workflow Spec" |
| `scripts/check-placeholders.mjs` | CREATE | utility (build-pipeline gate) | file-I/O (walk + grep) | none in-repo | no analog — Node ESM script per RESEARCH.md §"Code Examples §1" |
| `knip.json` | CREATE | config (Knip allowlist) | JSON | none in-repo | no analog — minimal `ignoreDependencies`/`ignore` config per RESEARCH.md §4 |
| `lib/fallback-data.ts` | DELETE | model (legacy seed data) | n/a | n/a (paired delete with `lib/portfolio-data.ts` introduction) | n/a |

## Pattern Assignments

### `lib/types.ts` (model, REWRITE)

**Analog:** `lib/types.ts` (current skeleton — same file, replacing all interface bodies)

**Type-export pattern** (`lib/types.ts:1-14`):
```ts
export interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  socials: SocialLink[];
  resumeUpdatedAt: string;
}

export interface SocialLink {
  label: string;
  href: string;
}
```

**Convention to preserve:**
- Top-level `export interface PascalCase { ... }` declarations
- Two-space indent
- Double quotes (not enforced here but consistent with rest of codebase per `.planning/codebase/CONVENTIONS.md`)
- Trailing comma omitted in multi-line literals (CONVENTIONS.md §"Code Style")
- One interface per concept; nested helpers (e.g. `SocialLink`) declared as siblings, not inline

**Deviation new file legitimately needs:**
- Add **JSDoc comments** on every interface and field (RESEARCH.md §5 explicitly drafts these — this is a deliberate departure from "no JSDoc anywhere" per CONVENTIONS.md §"Comments & Documentation"). Justification: this file is the contract between frontend and the sibling `portfolio-services/` backend per CLAUDE.md "Backend type changes ship as paired commits" and ARCHITECTURE.md hand-mirrored discipline. Doc comments document the contract.
- Use `ReadonlyArray<"ios" | "android">` for `ShippedApp.platforms` — first use of `ReadonlyArray` and string-literal union in this file. Acceptable; follows TypeScript best practices.

**See full draft:** RESEARCH.md §"Code Examples §5 — `lib/types.ts` rewrite" (lines 569–701)

---

### `lib/portfolio-data.ts` (model, CREATE — replaces `lib/fallback-data.ts`)

**Analog:** `lib/fallback-data.ts:1-53`

**Imports + type-only import pattern** (`lib/fallback-data.ts:1`):
```ts
import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";
```

**Typed const-export pattern** (`lib/fallback-data.ts:3-14`):
```ts
export const fallbackProfile: Profile = {
  name: "Beck Maldin",
  title: "Senior Mobile + Full-Stack Engineer",
  bio: "I build reliable product experiences across iOS, Android, and modern web stacks.",
  location: "Remote (US)",
  email: "beck@example.com",
  resumeUpdatedAt: "2026-05-05",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" }
  ]
};
```

**Conventions to preserve:**
- `import type { ... } from "./types"` (relative import to sibling — CONVENTIONS.md §"Path Aliases" — relative for siblings, `@/` for cross-dir)
- Multi-name imports sorted alphabetically (CONVENTIONS.md §"Import Organization")
- `export const NAME: TypeName = { ... }` shape — typed declaration with explicit type annotation
- One blank line between exports
- 2-space indent, double quotes, no trailing commas

**Deviation new file legitimately needs:**
- **Constant naming changes from `fallbackProfile` (camelCase + `fallback` prefix) to `PROFILE` (UPPERCASE)** per RESEARCH.md §6. Rationale: per the parent task description, dataset constants are "Pascal-or-UPPERCASE for type interfaces and dataset constants (e.g. `PROFILE`, `PROJECTS`)." This DEVIATES from the existing convention (`fallbackProfile` is camelCase per CONVENTIONS.md §"Naming Patterns" line 23). Planner should call this out as an intentional convention upgrade since the new dataset is the canonical seed (not a "fallback") — the name no longer carries the `fallback` semantic. UPPERCASE matches the "module-level constants" rule already in use for `STORAGE_KEY` (CONVENTIONS.md line 22).
- Add a JSDoc header comment explaining the "real-where-trivial / TODO-where-not" strategy (D-07..D-10).
- Include `TODO:` markers as **string values** (not comments) — these are the build-gate per D-10/INFRA-05.

**See full draft:** RESEARCH.md §"Code Examples §6 — `lib/portfolio-data.ts`" (lines 716–793)

---

### `lib/api.ts` (service, MODIFY)

**Analog:** `lib/api.ts:1-43` (same file — adapt imports + add new fetchers)

**Imports pattern** (`lib/api.ts:1-8`):
```ts
import {
  fallbackApps,
  fallbackExperience,
  fallbackPosts,
  fallbackProfile,
  fallbackSkills
} from "./fallback-data";
import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";
```

**Env-var with nullish-default pattern** (`lib/api.ts:10`):
```ts
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
```

**Core ISR + silent-fallback pattern** (`lib/api.ts:12-22`) — **PRESERVE EXACTLY** per DATA-04:
```ts
async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      next: { revalidate: 300 }
    });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
```

**Public fetcher pattern** (`lib/api.ts:24-30`):
```ts
export async function getProfile(): Promise<Profile> {
  return getJson<Profile>("/api/profile", fallbackProfile);
}

export async function getSkills(): Promise<Skill[]> {
  return getJson<Skill[]>("/api/skills", fallbackSkills);
}
```

**Conventions to preserve:**
- Two-section import order: value imports first (multiline), type imports second
- Multi-name imports alphabetized
- Double-quoted strings, semicolons, 2-space indent
- `try { ... } catch {}` swallow-and-fall-back — zero logging (CONVENTIONS.md §"Error Handling")
- One named `export async function get<X>(): Promise<T>` per API endpoint
- Generic type parameter on `getJson<T>` calls — explicit, not inferred
- API endpoint path stays as the second arg semantic; fallback as third

**Deviation new file legitimately needs:**
- Imports change from `fallbackProfile` etc. → `PROFILE` etc. (mirroring `lib/portfolio-data.ts` rename above)
- Add new fetcher `getProjects()` (BACKEND-01 endpoint)
- Rename `getSkills` → `getStack` (returns `StackCategory[]`)
- Rename `getApps` → `getShipped` (returns `ShippedApp[]`)
- Rename `getPosts(limit)` → `getWriting()` (drop limit param; backend will paginate later)
- Add a JSDoc comment block above `getJson` documenting the ISR + silent-fallback contract for Phase 6 reference (the silent catch will be the seam where Phase 6 / BACKEND-04 adds zod validation per D-16)

**See full draft:** RESEARCH.md §"Code Examples §7 — `lib/api.ts` adaptation" (lines 802–862)

---

### `lib/routes.ts` (config, CREATE)

**Analog:** No existing route registry. Closest TS const-export pattern: `lib/types.ts` (interface declarations) + `lib/fallback-data.ts:3-14` (typed const) + `app/sitemap.ts:1-13` (consumer that will iterate the registry).

**Typed const-export pattern (from `lib/fallback-data.ts:3` style):**
```ts
export const fallbackProfile: Profile = { ... };
```

**Plain-noun ariaLabel — current usage in JSX** (`app/components/homepage.tsx:55-61` — closest existing reference):
```tsx
<section aria-labelledby="resume-heading">
  <h2 id="resume-heading">Resume</h2>
```
This is `aria-labelledby` on sections; `lib/routes.ts` introduces `ariaLabel` as a data field for sidebar nav rows per A11Y-04 / Pitfall 5. **No in-repo file currently produces a plain-noun ARIA registry** — `lib/routes.ts` is the first.

**Sitemap consumer awareness** (`app/sitemap.ts:1-12`):
```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
```

This file currently hand-codes the single `/` entry. Phase 2 / ROUTE-04 will iterate `ROUTES` from `lib/routes.ts`. The new `lib/routes.ts` must export a shape compatible with this consumer.

**Conventions to apply:**
- Top-level `export interface Route { ... }` (mirrors `lib/types.ts` interface-export pattern)
- `export const ROUTES = [...] as const satisfies readonly Route[]` (UPPERCASE for top-level dataset constants — same rule applied to `lib/portfolio-data.ts`)
- `readonly` modifiers on every field of `Route` interface (RESEARCH.md §8 lines 888–899)
- `as const satisfies readonly Route[]` to give downstream consumers literal-typed `slug` values usable with `useSelectedLayoutSegment()`
- `export type RouteSegment = (typeof ROUTES)[number]["slug"]` derived alias (RESEARCH.md §8 line 954)

**Deviation new file legitimately needs:**
- Adds JSDoc comments per RESEARCH.md §8 (deliberate — this file is consumed by Sidebar, CommandPalette, sitemap; doc comments warranted)

**See full draft:** RESEARCH.md §"Code Examples §8 — `lib/routes.ts` registry" (lines 873–955)

---

### `next.config.ts` (config, REWRITE)

**Analog:** `next.config.ts:1-5` (current — empty config) is the file-scaffold analog. Body of `headers()` has **no in-repo analog**.

**File-scaffold pattern** (`next.config.ts:1-5`):
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Conventions to preserve:**
- `import type { NextConfig } from "next"` first
- `const nextConfig: NextConfig = { ... }` typed declaration
- `export default nextConfig` (default export — Next.js framework convention; CONVENTIONS.md §"Module Design" reserves default exports for framework entry points)
- 2-space indent, double quotes, semicolons, no trailing commas

**Deviation new file legitimately needs:**
- Body adds `async headers()` returning a route-matcher array. **No in-repo analog for this body.** Use RESEARCH.md §"Code Examples §2 — INFRA-04 `next.config.ts` headers" (lines 469–501) as the verbatim pattern source. External authority: [Next.js headers config docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).
- Module-level `const securityHeaders = [...]` and `engineerHeaders = [...]` arrays before the config (RESEARCH.md §2). This is a new pattern — readable and idiomatic for Next.js but not previously seen in this repo.
- D-13 revision: only `x-built-with` ships in Phase 1; `x-portfolio-source` deferred to Phase 7. RESEARCH.md §2 still includes `PORTFOLIO_SOURCE` const — planner must drop that before writing.

**See full draft:** RESEARCH.md §"Code Examples §2" (lines 466–501) — note the D-13 revision (omit `x-portfolio-source` for Phase 1).

---

### `app/layout.tsx` (controller, MODIFY 1-line)

**Analog:** `app/layout.tsx:1-39` (same file — single-field metadata addition)

**Imports + metadata + RSC-default-export pattern** (`app/layout.tsx:1-13`):
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beck Maldin | Mobile & Full-Stack Engineer",
  description:
    "Recruiter-friendly portfolio featuring mobile apps, experience timeline, skills, and technical writing.",
  openGraph: {
    title: "Beck Maldin Portfolio",
    description: "Mobile and full-stack engineering portfolio.",
    type: "website"
  }
};
```

**Server Component default-export pattern** (`app/layout.tsx:26-39`):
```tsx
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
```

**Conventions to preserve:**
- File is a **Server Component** (no `"use client"`) — CONVENTIONS.md §"Component Patterns"
- `export const metadata: Metadata = { ... }` shape unchanged — only `metadataBase` field added
- `Readonly<{ children: React.ReactNode }>` inline prop type for `RootLayout` (CONVENTIONS.md line 102)
- Inline theme bootstrap script preserved exactly — Phase 2 owns its replacement
- 2-space indent, no trailing commas

**Deviation new file legitimately needs:**
- Add a single line: `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),`
- **CRITICAL:** Use logical OR `||` (not `??`) per RESEARCH.md §"Pitfall D" (lines 351–356). Empty-string env vars bypass `??` and cause `Invalid URL` runtime errors. Existing code in the file uses `??` for similar defaults (`app/sitemap.ts:4`, `app/robots.ts:4`) — `app/layout.tsx` `metadataBase` is the **first place where `||` is required instead of `??`**. Planner must call this out explicitly so the executor doesn't pattern-match the wrong operator.

**See full draft:** RESEARCH.md §"Code Examples §9 — Root `app/layout.tsx` `metadataBase`" (lines 962–1009)

---

### `app/components/homepage.tsx` (component, MODIFY shape adapter)

**Analog:** `app/components/homepage.tsx:1-112` (same file — minimal field renames per D-17)

**Type-only imports + props interface pattern** (`app/components/homepage.tsx:1-10`):
```tsx
import type { BlogPost, Experience, MobileApp, Profile, Skill } from "@/lib/types";
import { ThemeToggle } from "./theme-toggle";

interface HomepageProps {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  apps: MobileApp[];
  posts: BlogPost[];
}

export function Homepage({ profile, skills, experience, apps, posts }: HomepageProps) {
```

**Conventions to preserve:**
- `import type { ... } from "@/lib/types"` — `@/` alias for cross-directory imports (CONVENTIONS.md §"Path Aliases")
- Relative `import { ThemeToggle } from "./theme-toggle"` for siblings
- `interface HomepageProps { ... }` co-located with component
- Named function export (no default), destructured props in signature
- Existing JSX preserved structurally — 5 `<section aria-labelledby=...>` blocks each with `<h2 id="...-heading">` (homepage.test.tsx asserts these 5 headings exist)

**Deviation new file legitimately needs:**
- Per D-17, this is a **minimal shape adapter** — change the imports and prop names to match `Profile`/`Project`/`Social`/`Experience`/`Writing`/`ShippedApp`/`StackCategory`. The 5 headings must still render so `homepage.test.tsx` passes:
  - `Skills & Tech Stack` heading → adapt the body to render `StackCategory[]` instead of `Skill[]`
  - `Mobile Apps` heading → adapt body to render `ShippedApp[]` (use `name`, conditional URLs)
  - `Experience Timeline` → render `Experience[]` with new fields (`role`, `company`, `period`, `summary`)
  - `Blog Preview` → render `Writing[]` (`title`, `excerpt`, `link`)
  - `Contact & Social` → render `Profile.socials: Social[]` (use `url` not `href`, `label` unchanged)
- Field renames in `Profile`: `title` → `role`, `bio: string` → `bio.short`/`bio.long[]` (use `bio.short` in homepage.tsx for minimal change), `resumeUpdatedAt` → drop (`resumeUrl` replaces; current homepage shows "Updated: {profile.resumeUpdatedAt}" — replace with "Resume" link only or leave label TBD per D-09).
- Field renames in `Social`: `href` → `url`. Component preserves `target="_blank" rel="noreferrer"` JSX.
- **No new behavior, no new sections.** Phase 2 deletes this file entirely.

---

### `app/components/homepage.test.tsx` (test, MODIFY fixture import)

**Analog:** `app/components/homepage.test.tsx:1-28` (same file — fixture-import swap)

**Test pattern** (`app/components/homepage.test.tsx:1-27`):
```tsx
import { render, screen } from "@testing-library/react";
import { Homepage } from "./homepage";
import {
  fallbackApps,
  fallbackExperience,
  fallbackPosts,
  fallbackProfile,
  fallbackSkills
} from "@/lib/fallback-data";

test("renders recruiter-facing homepage sections", () => {
  render(
    <Homepage
      profile={fallbackProfile}
      skills={fallbackSkills}
      experience={fallbackExperience}
      apps={fallbackApps}
      posts={fallbackPosts}
    />
  );

  expect(screen.getByRole("heading", { name: /skills & tech stack/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /mobile apps/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /experience timeline/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /blog preview/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /contact & social/i })).toBeInTheDocument();
});
```

**Conventions to preserve:**
- `import { render, screen } from "@testing-library/react"` (testing-library convention)
- Sibling import `from "./homepage"` (relative for same-directory)
- `@/lib/...` alias for cross-directory fixtures
- Top-level `test("description", () => { ... })` form (Vitest globals enabled per `vitest.config.ts:13`)
- `expect(screen.getByRole("heading", { name: /regex/i })).toBeInTheDocument()` — case-insensitive heading regex pattern
- 5 heading assertions (the assertion that survives the Phase 1 → Phase 2 transition is "5 headings exist")

**Deviation new file legitimately needs:**
- Imports rename: `from "@/lib/fallback-data"` → `from "@/lib/portfolio-data"`
- Fixture names: `fallbackApps` → `SHIPPED`, `fallbackExperience` → `EXPERIENCE`, `fallbackPosts` → `WRITING`, `fallbackProfile` → `PROFILE`, `fallbackSkills` → `STACK`
- Prop names on `<Homepage>` change to match `homepage.tsx` adapter (e.g. `apps={SHIPPED}` → if `homepage.tsx` keeps `apps` prop name internally, OR renamed props like `shipped={SHIPPED}`)
- 5 heading assertions remain unchanged textually — homepage.tsx headings must keep matching text per D-17

---

### `package.json` (config, MODIFY)

**Analog:** `package.json:1-31` (same file — extend scripts, deps, devDependencies, add `engines`)

**Existing scripts pattern** (`package.json:5-11`):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint . --ext .ts,.tsx",
  "test": "vitest run"
}
```

**Existing deps shape** (`package.json:12-29`):
```json
"dependencies": {
  "next": "15.3.2",
  "react": "19.1.0",
  "react-dom": "19.1.0"
},
"devDependencies": {
  ...
  "eslint": "8.57.0",
  "eslint-config-next": "15.3.2",
  ...
}
```

**Conventions to preserve:**
- Two-space indent (matches surrounding files)
- Double-quoted JSON keys and values
- Existing top-level keys: `name`, `version`, `private`, `scripts`, `dependencies`, `devDependencies` (unchanged)
- Pinned exact versions for existing deps (no `^`/`~`) — the new deps RESEARCH.md installs with `^X.Y.Z` ranges (RESEARCH.md §"Standard Stack" line 117); planner must reconcile with the existing exact-pin convention. Recommend: stay with exact pins for reproducibility unless RESEARCH explicitly requires the caret.
- Trailing comma at end of `devDependencies` block — current file omits trailing commas in JSON (which is correct — JSON doesn't allow them)

**Deviation new file legitimately needs:**
- Add `"engines": { "node": "22.x" }` block (D-04 revised; RESEARCH.md §9 "CRITICAL FINDING")
- Update `lint` script from `"eslint . --ext .ts,.tsx"` → `"eslint ."` (flat config infers extensions from `files` patterns — RESEARCH.md §3 line 531)
- Add `"typecheck": "tsc --noEmit"` script (D-02)
- Add `"postbuild": "node scripts/check-placeholders.mjs"` script (INFRA-05; RESEARCH.md §1 line 447)
- Add `"knip": "knip"` script (D-03; RESEARCH.md §"Code Examples" line 452)
- Bump `next` `15.3.2` → `^15.5.15` (or exact `15.5.15`)
- Bump `eslint-config-next` `15.3.2` → `^15.5.15`
- Bump `eslint` `8.57.0` → `^9.0.0`
- Add prod deps: `next-themes@^0.4.6`, `cmdk@^1.1.1`
- Add dev dep: `knip@^6.11.0`
- Regenerate `package-lock.json` (Pitfall A — RESEARCH.md lines 330–336)

**See full draft:** RESEARCH.md §"Code Examples §1" lines 442–455 (scripts only) + §"Standard Stack" lines 110–151 (deps).

---

### `tsconfig.json` (config, MODIFY 1 field)

**Analog:** `tsconfig.json:1-25` (same file — single-field bump)

**Current shape** (`tsconfig.json:1-25`):
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    ...
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Conventions to preserve:**
- All other compilerOptions unchanged (`strict: true`, `paths`, `module: esnext`, etc.)
- 2-space indent, double quotes
- `"types": ["vitest/globals", "@testing-library/jest-dom"]` — Vitest + jest-dom ambient types (preserve)

**Deviation new file legitimately needs:**
- `"target": "ES2017"` → `"target": "ES2022"` (per D-discretion §"Dev tooling hygiene" + RESEARCH.md §"State of the Art" line 1021)

---

### `eslint.config.mjs` (config, CREATE)

**Analog:** `vitest.config.ts:1-16` (closest in-repo `defineConfig`-based ESM config import pattern)

**ESM `defineConfig` import pattern** (`vitest.config.ts:1-16`):
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true
  }
});
```

**Conventions to preserve:**
- `import { defineConfig } from "<package>/config"` first
- Named imports for plugins/composers
- `export default defineConfig(...)` shape
- 2-space indent, double quotes, semicolons

**Deviation new file legitimately needs:**
- File extension is `.mjs` (not `.ts`) — Next.js docs explicitly recommend `.mjs` for the flat config (RESEARCH.md §3 line 526; Next.js [eslint config docs](https://nextjs.org/docs/app/api-reference/config/eslint))
- Import shape: `import { defineConfig, globalIgnores } from "eslint/config"` and `import nextVitals from "eslint-config-next/core-web-vitals"`
- Body: array form `defineConfig([...nextVitals, globalIgnores([...])])` — different shape from vitest's object form
- Path strings inside `globalIgnores`: `".next/**"`, `"out/**"`, `"build/**"`, `"next-env.d.ts"`, `"design_handoff_terminal_portfolio/**"` (the last per CLAUDE.md §"Stack constraints" — design folder is reference only)

**See full draft:** RESEARCH.md §"Code Examples §3 — ESLint 9 flat-config migration" (lines 509–524)

**Paired delete:** `.eslintrc.json` (`.eslintrc.json:1-3` shows the 2-line legacy config) — delete in same commit as `eslint.config.mjs` introduction (RESEARCH.md §3 step 1).

---

### `.gitignore` (config, MODIFY append)

**Analog:** `.gitignore:1-5` (current)

**Current content:**
```
node_modules
.next
.env.local
coverage
dist
```

**Conventions to preserve:**
- One pattern per line, no comments, no glob negation
- No trailing slash on directories (current style)

**Deviation new file legitimately needs:**
- Append (per D-discretion §"Dev tooling hygiene"):
  - `.env*.local` (broader local env file pattern — supersedes `.env.local`)
  - `.env` (defensive — secrets must never commit)
  - `.DS_Store` (macOS Finder metadata — known leak per CLAUDE.md presence and root listing showing `.DS_Store` exists)

---

### `.nvmrc` (config, CREATE)

**Analog:** None in-repo. Standard convention is a single line containing the Node version string.

**Pattern (Node convention):**
```
22
```

**Convention to apply:**
- Single line, no trailing newline issues
- Use `22` (major-only) — RESEARCH.md §"Open Questions Q2" line 1054 confirms major-only matches Vercel's `22.x` resolution

**Deviation new file legitimately needs:**
- None — file format is a single string per nvm/fnm convention

---

### `.github/workflows/ci.yml` (config, CREATE)

**Analog:** None in-repo (no `.github/` directory exists).

**Pattern source:** RESEARCH.md §"CI Workflow Spec" lines 1130–1183 (full draft) and verified action versions.

**Conventions to apply (project-wide):**
- 2-space YAML indent (consistent with TS/JSON files in repo)
- Double-quoted strings only when needed (YAML idiomatic)
- Job name `verify` (RESEARCH.md §"Branch protection" line 1218 uses this exact name)
- Sequential 5-step pipeline per D-02

**Deviation new file legitimately needs:**
- Action pins: `actions/checkout@v4`, `actions/setup-node@v4` (RESEARCH.md §"Action versions" line 1186)
- `node-version-file: .nvmrc` + `cache: npm` (RESEARCH.md line 1158)
- `concurrency` group: cancel-in-progress on stale PR runs (RESEARCH.md line 1140)
- Build step env: `NEXT_PUBLIC_SITE_URL: https://example.com`, `NEXT_PUBLIC_API_BASE_URL: ""` (RESEARCH.md lines 1180–1182)

**See full draft:** RESEARCH.md §"CI Workflow Spec" (lines 1132–1183).

---

### `scripts/check-placeholders.mjs` (utility, CREATE)

**Analog:** None in-repo (no `scripts/` directory exists).

**Pattern source:** RESEARCH.md §"Code Examples §1" lines 380–438 (full draft).

**Conventions to apply (project-wide):**
- ESM modules — `.mjs` extension (matches Knip recommendation + npm script chain)
- 2-space indent, double quotes, semicolons (matches rest of codebase)
- `node:fs`, `node:path` Node-prefixed standard library imports (modern Node ESM convention)
- Top-of-file shebang `#!/usr/bin/env node` + 4–10 line file-purpose comment (deviates from "no comments" CONVENTIONS.md §"Comments & Documentation" — justified because this is a build-pipeline script humans will rarely read)

**Deviation new file legitimately needs:**
- Console output (`console.error`, `console.log`) — first deliberate `console.*` usage in repo (CONVENTIONS.md §"Logging" notes "no `console.log`/`console.error` calls in source"). Justified because this is a build-time CLI tool, not application source.
- `process.exit(0|1)` — first explicit exit-code usage in repo. Justified because npm script chain depends on the exit code.
- Generator function `function* walk(dir)` — first generator pattern in repo. Idiomatic for filesystem walk.

**See full draft:** RESEARCH.md §"Code Examples §1" lines 380–438.

---

### `knip.json` (config, CREATE)

**Analog:** None in-repo.

**Pattern source:** RESEARCH.md §"Code Examples §4" lines 540–551 (full draft).

**Conventions to apply:**
- 2-space JSON indent, double-quoted keys/values (matches `tsconfig.json`, `package.json`)
- Top-level keys: `$schema`, `ignoreDependencies`, `ignore` (Knip 6.x schema)
- `$schema` URL: `https://unpkg.com/knip@6/schema.json`

**Deviation new file legitimately needs:**
- `ignoreDependencies: ["next-themes", "cmdk"]` (Phase 1 installs these; Phase 2 imports — Pitfall B mitigation, RESEARCH.md lines 338–342)
- `ignore: ["design_handoff_terminal_portfolio/**", "scripts/**"]` (handoff is documentation per CLAUDE.md; scripts/ runs from package.json `postbuild` and Knip can't auto-detect)

**See full draft:** RESEARCH.md §4 lines 540–551.

---

## Shared Patterns

### Path Aliasing (`@/`)
**Source:** `tsconfig.json:19-20` + `vitest.config.ts:7-9`
**Apply to:** All cross-directory TS imports in new code (`lib/api.ts`, `lib/portfolio-data.ts`, `lib/routes.ts`, `app/components/homepage.tsx`, `app/components/homepage.test.tsx`, `app/page.tsx`)
```ts
// tsconfig.json
"paths": {
  "@/*": ["./*"]
}
// vitest.config.ts
resolve: { alias: { "@": new URL(".", import.meta.url).pathname } }
```
**Rule:** Use `@/lib/...` for cross-directory imports; relative `./` only for same-directory siblings. Already established and unchanged in Phase 1.

### Type-only imports
**Source:** `lib/api.ts:8`, `app/components/homepage.tsx:1`, `app/sitemap.ts:1`, `app/robots.ts:1`
**Apply to:** All new files importing types only — `lib/portfolio-data.ts`, `lib/api.ts` (for type imports), `lib/routes.ts` (none in current draft), `next.config.ts`, `app/layout.tsx`
```ts
import type { Metadata } from "next";
import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";
```

### Env-var with safe default
**Source:** `lib/api.ts:10`, `app/sitemap.ts:4`, `app/robots.ts:4`
**Apply to:** New `lib/api.ts`. **Note:** `app/layout.tsx` `metadataBase` requires `||` not `??` (Pitfall D).
```ts
// Standard pattern (still correct for non-URL inputs):
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
// metadataBase exception (use ||):
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
```

### Silent-fallback error handling
**Source:** `lib/api.ts:12-22`
**Apply to:** Preserve verbatim in adapted `lib/api.ts`. No new error-handling patterns introduced in Phase 1.
```ts
try {
  const response = await fetch(`${baseUrl}${path}`, { next: { revalidate: 300 } });
  if (!response.ok) return fallback;
  return (await response.json()) as T;
} catch {
  return fallback;
}
```

### Server Component default
**Source:** `app/layout.tsx`, `app/page.tsx`, `app/components/homepage.tsx`, `app/sitemap.ts`, `app/robots.ts` — all RSC (no `"use client"`)
**Apply to:** `app/layout.tsx` (preserved). Phase 1 adds **no new components**, so RSC-vs-client pattern is not invoked. CLAUDE.md "thin client islands carry `use client`" applies in Phase 2.

### Named exports, default reserved for framework files
**Source:** CONVENTIONS.md §"Module Design" (lines 168–170); `lib/types.ts`, `lib/api.ts`, `lib/fallback-data.ts`, `app/components/homepage.tsx` use named exports; `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `next.config.ts` use default exports
**Apply to:**
- `lib/portfolio-data.ts` → named exports (`PROFILE`, `PROJECTS`, etc.)
- `lib/routes.ts` → named exports (`ROUTES`, `Route` interface, `RouteSegment`)
- `next.config.ts` → default export (framework convention preserved)
- `eslint.config.mjs` → default export (ESLint flat-config convention)
- `scripts/check-placeholders.mjs` → no exports (entry-point script)

### Trailing commas omitted (JS/TS multi-line literals)
**Source:** CONVENTIONS.md §"Code Style" (line 36); verified in `package.json`, `tsconfig.json`, `app/layout.tsx` `metadata` literal
**Apply to:** All new TS/JS source files. Note: RESEARCH.md drafts include trailing commas in places (e.g. `lib/portfolio-data.ts` §6 line 758 trailing comma after `socials: [...]`). Planner should normalize to "no trailing commas" matching existing style.

### UPPERCASE module-level constants (NEW convention upgrade)
**Source:** Existing code uses UPPERCASE for one constant: `STORAGE_KEY` (`app/components/theme-toggle.tsx:5`). Phase 1 expands the convention.
**Apply to:** Top-level dataset constants in `lib/portfolio-data.ts` (`PROFILE`, `PROJECTS`, `EXPERIENCE`, `WRITING`, `SHIPPED`, `STACK`) and `lib/routes.ts` (`ROUTES`).
**Rationale:** Per parent task description, "Pascal-or-UPPERCASE for type interfaces and dataset constants." Existing `fallbackProfile`-style camelCase reflected the "fallback" semantic; new constants are the canonical seed and adopt UPPERCASE matching the existing `STORAGE_KEY` precedent.
**Caution for planner:** This is an intentional convention upgrade — `lib/api.ts` import statements must reflect the rename (`fallbackProfile` → `PROFILE`).

---

## No Analog Found

Files with no close match in the codebase — planner should defer to RESEARCH.md drafts and external authority:

| File | Role | Data Flow | Reason | Authority |
|------|------|-----------|--------|-----------|
| `next.config.ts` (`headers()` body) | config | runtime middleware | Empty `next.config.ts` body — no in-repo `headers()` usage | RESEARCH.md §"Code Examples §2" + [Next.js headers docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) |
| `eslint.config.mjs` | config | flat-config export | First flat config in repo (current `.eslintrc.json` is legacy form) | RESEARCH.md §"Code Examples §3" + [Next.js ESLint docs](https://nextjs.org/docs/app/api-reference/config/eslint) |
| `.nvmrc` | config | text version file | First Node-version-pin file in repo | nvm/fnm convention (single-line major version `22`) |
| `.github/workflows/ci.yml` | config | YAML CI pipeline | First CI workflow in repo | RESEARCH.md §"CI Workflow Spec" lines 1132–1183 (verified action versions) |
| `scripts/check-placeholders.mjs` | utility | filesystem walk + grep | First `scripts/` entry — no in-repo `.mjs` Node script analog | RESEARCH.md §"Code Examples §1" lines 380–438 |
| `knip.json` | config | JSON config | First Knip config in repo | RESEARCH.md §"Code Examples §4" + [Knip Next.js plugin docs](https://knip.dev/reference/plugins/next) |
| `lib/routes.ts` (`Route` interface + `as const satisfies`) | config | typed const-array registry | No prior route registry in repo; the `as const satisfies readonly Route[]` pattern is novel here | RESEARCH.md §"Code Examples §8" lines 873–955 |

For all of these, RESEARCH.md provides verbatim drafts the planner can reference with line numbers.

---

## Naming Conventions Verified for Phase 1

| Convention | Status | Source / Notes |
|-----------|--------|----------------|
| **kebab-case file names** | Verified | All TS/TSX files: `homepage.tsx`, `theme-toggle.tsx`, `fallback-data.ts`. New files follow: `portfolio-data.ts`, `routes.ts`, `check-placeholders.mjs`, `eslint.config.mjs`. Single-word: `api.ts`, `types.ts`, `routes.ts` (no kebab needed). |
| **PascalCase exported components** | Verified | `Homepage`, `ThemeToggle`, `RootLayout`, `Home`. Phase 1 adds no new components. |
| **PascalCase type interfaces** | Verified | `Profile`, `SocialLink`, `Skill`, `Experience`, etc. All new types in `lib/types.ts` and `lib/routes.ts` use PascalCase. |
| **UPPERCASE for top-level dataset constants** | New convention upgrade — Phase 1 establishes | Existing precedent: `STORAGE_KEY`. New: `PROFILE`, `PROJECTS`, `EXPERIENCE`, `WRITING`, `SHIPPED`, `STACK`, `ROUTES`. Consciously deviates from `fallbackProfile` camelCase precedent because the data is no longer a "fallback" — it's the canonical seed. |
| **camelCase functions and helpers** | Verified | `getProfile`, `getJson`, `applyTheme`. New: `getProjects`, `getStack`, `getShipped`, `getWriting` follow this. |
| **camelCase local variables** | Verified | `baseUrl`, `nextTheme`, `stored`. |
| **`@/` import alias** | Verified | `tsconfig.json:19-20` and `vitest.config.ts:7-9`. New code uses `@/lib/...` for cross-directory imports; `./` for siblings. |
| **`"use client"` sparingly** | Verified | Only `app/components/theme-toggle.tsx` uses it. **Phase 1 adds no new client components** (per CLAUDE.md "thin client islands" rule and RESEARCH.md "no visual output in Phase 1"). |
| **Type-only imports** | Verified | `import type { ... } from "..."` consistently used in `lib/api.ts:8`, `app/components/homepage.tsx:1`, `app/sitemap.ts:1`. New files follow. |
| **Multi-name imports alphabetized** | Verified | `lib/api.ts:1-7`, `app/components/homepage.tsx:1`, `app/components/homepage.test.tsx:3-9`. New imports follow. |
| **Named exports preferred; default reserved for framework files** | Verified | `lib/portfolio-data.ts`, `lib/routes.ts` → named. `next.config.ts`, `eslint.config.mjs` → default (framework convention). |
| **2-space indent, double quotes, no trailing commas** | Verified | All TS/TSX/JSON files. New files must conform. RESEARCH.md drafts that include trailing commas should be normalized. |
| **JSDoc on type contracts** | New (Phase 1 establishes for `lib/types.ts` + `lib/routes.ts`) | CONVENTIONS.md notes "no JSDoc anywhere" but Phase 1 deliberately adds JSDoc to `lib/types.ts` (frontend↔backend contract per CLAUDE.md "Backend type changes ship as paired commits") and `lib/routes.ts` (multi-consumer registry). Application source files (`lib/api.ts`, `app/components/homepage.tsx`) remain JSDoc-free. |

---

## Metadata

**Analog search scope:**
- `lib/` (3 files: `api.ts`, `types.ts`, `fallback-data.ts`)
- `app/` (5 files: `layout.tsx`, `page.tsx`, `sitemap.ts`, `robots.ts`, `globals.css`)
- `app/components/` (3 files: `homepage.tsx`, `homepage.test.tsx`, `theme-toggle.tsx`)
- Root configs: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `.eslintrc.json`, `.gitignore`, `.env.example`, `next-env.d.ts`
- `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/STRUCTURE.md` for codified conventions

**Files scanned:** 18 source/config files in repo + 2 codebase-doc files

**Confirmed:**
- No `.github/` directory exists (CI is greenfield)
- No `scripts/` directory exists (placeholder-grep script is greenfield)
- No skills directories under `.claude/skills/`, `.agents/skills/`, or `.planning/skills/`

**Pattern extraction date:** 2026-05-06

---

## PATTERN MAPPING COMPLETE

**Phase:** 1 - Foundation
**Files classified:** 16 files (14 active changes; 2 deletions paired with replacements)
**Analogs found:** 13 in-repo / 16

### Coverage
- Files with exact analog (same file or direct replacement): 9 — `lib/types.ts`, `lib/portfolio-data.ts`, `lib/api.ts`, `app/layout.tsx`, `app/components/homepage.tsx`, `app/components/homepage.test.tsx`, `package.json`, `tsconfig.json`, `.gitignore`
- Files with role-match analog (closest convention pattern): 4 — `lib/routes.ts` (role: typed const-export), `next.config.ts` (role: framework-config import scaffold), `eslint.config.mjs` (role: ESM `defineConfig`), `lib/fallback-data.ts` deletion (paired)
- Files with no in-repo analog (use RESEARCH.md drafts + cited external docs): 5 — `.nvmrc`, `.github/workflows/ci.yml`, `scripts/check-placeholders.mjs`, `knip.json`, plus the `headers()` body inside `next.config.ts`

### Key Patterns Identified
- **All `lib/` modules use named exports + type-only imports + relative paths for siblings.** Preserve in `lib/portfolio-data.ts`, `lib/routes.ts`, adapted `lib/api.ts`.
- **`lib/api.ts` `getJson<T>(path, fallback)` ISR + silent-fallback helper is the load-bearing pattern for DATA-04.** Function body must be preserved verbatim — only consumers change shape.
- **Server Component default; `"use client"` only in `theme-toggle.tsx`.** Phase 1 adds no new components, so this rule is unchallenged. `app/layout.tsx` stays RSC after the `metadataBase` addition.
- **Path alias `@/` mirrored in `tsconfig.json` + `vitest.config.ts`.** Phase 1 doesn't change the alias; new test/component imports follow established `@/lib/...` form.
- **Convention upgrade for dataset constants:** `fallbackProfile` (camelCase) → `PROFILE` (UPPERCASE). One-time intentional rename matching the existing `STORAGE_KEY` precedent and the parent task description's "Pascal-or-UPPERCASE for dataset constants" rule.
- **Pitfall D operator-choice for `metadataBase`:** Use `||` not `??` because `NEXT_PUBLIC_SITE_URL=""` is empty-string-non-nullish and bypasses `??` to produce `Invalid URL`. This contradicts the rest of the codebase (`lib/api.ts:10`, `app/sitemap.ts:4`, `app/robots.ts:4` all use `??`) — planner must call out the deviation explicitly to the executor.
- **D-13 revision:** RESEARCH.md §2 includes `x-portfolio-source` in `next.config.ts` headers. Per CONTEXT.md D-13 (revised 2026-05-06), Phase 1 ships ONLY `x-built-with`. Planner must drop `x-portfolio-source` from the headers list.
- **Trailing-comma normalization:** RESEARCH.md drafts include trailing commas in some literals; project style omits them (CONVENTIONS.md). Normalize when writing.

### File Created
`.planning/phases/01-foundation/01-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can now reference analog patterns in PLAN.md files with concrete file paths, line numbers, and excerpts. Cross-cutting conventions (path alias, type-only imports, silent-fallback error handling, RSC default, named-export preference) apply uniformly across Phase 1's tasks.
