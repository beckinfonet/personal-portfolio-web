# Testing Patterns

**Analysis Date:** 2026-05-06

## Test Framework

**Runner:**
- **Vitest 3.1.4** (`package.json` devDependency)
- Config: `vitest.config.ts` (project root)
- React plugin: `@vitejs/plugin-react` 4.4.1 enables JSX/TSX transformation for tests

**Assertion / DOM Library:**
- `@testing-library/react` 16.2.0 — renders React components into the test DOM
- `@testing-library/jest-dom` 6.6.3 — provides DOM-aware matchers like `toBeInTheDocument`
- `jsdom` 26.1.0 — browser-like environment for tests

**Run Commands** (`package.json` `scripts`):
```bash
npm test               # Runs `vitest run` (single-pass, no watch)
```
- No `test:watch`, `test:coverage`, or `test:ui` scripts are defined. Watch mode requires `npx vitest` directly.

## Vitest Configuration

`vitest.config.ts`:
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

Key settings:
- `environment: "jsdom"` — DOM APIs (`document`, `window`, `localStorage`) are available without explicit setup.
- `globals: true` — `test`, `expect`, `describe`, `it`, `vi`, etc. are available without imports. Mirrored in `tsconfig.json` via `"types": ["vitest/globals", "@testing-library/jest-dom"]`.
- `setupFiles: "./vitest.setup.ts"` — runs once before each test file.
- The `@` alias matches the `tsconfig.json` `paths` mapping so test imports resolve identically to production code.

**Setup file** (`vitest.setup.ts`):
```ts
import "@testing-library/jest-dom/vitest";
```
- Single line — registers jest-dom matchers (`toBeInTheDocument`, `toHaveAttribute`, etc.) on Vitest's `expect`.
- No global mocks, no DOM cleanup hooks (Testing Library 16 auto-cleans between tests).

## Test File Organization

**Location:**
- **Co-located** with implementation. The single existing test sits beside its component: `app/components/homepage.test.tsx` next to `app/components/homepage.tsx`.

**Naming:**
- Pattern: `<source-name>.test.tsx` (e.g. `homepage.test.tsx`).
- Vitest's default discovery picks up `*.test.{ts,tsx}` and `*.spec.{ts,tsx}` — only the `.test.tsx` form is used today.

**Structure:**
```
app/
└── components/
    ├── homepage.tsx
    ├── homepage.test.tsx      <-- co-located
    └── theme-toggle.tsx
lib/
├── api.ts                     <-- no tests
├── fallback-data.ts           <-- no tests
└── types.ts
```

## Test Structure

The single suite uses a flat top-level `test(...)` call (no `describe`):

`app/components/homepage.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { Homepage } from "./homepage";
import {
  fallbackApps, fallbackExperience, fallbackPosts,
  fallbackProfile, fallbackSkills
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

**Patterns observed:**
- **No imports** of `test`/`expect` — relies on `globals: true`.
- **Render-then-query** style using Testing Library: `render(<Component />)` followed by `screen.getBy*` queries.
- **Accessibility-first queries**: `getByRole("heading", { name: /.../i })` uses semantic roles + case-insensitive regexes rather than CSS selectors or test IDs.
- **No `beforeEach`/`afterEach`** — Testing Library auto-cleans the DOM between tests.
- **Test names** are sentence-style descriptions of user-facing behaviour ("renders recruiter-facing homepage sections").

## Mocking

**Framework:** Vitest's built-in `vi` (no test currently uses it).

**Patterns:**
- **No mocks exist in the codebase yet.** The only test renders a presentational component with real fallback data, so no fetch/network/timer mocking is required.
- Future mocking should follow Vitest conventions when needed:
  - `vi.mock("@/lib/api")` for module-level mocks of data fetchers.
  - `vi.spyOn(window.localStorage, "getItem")` for `theme-toggle.tsx`-style browser API tests.
  - `vi.useFakeTimers()` for time-sensitive logic.

**What to Mock (future guidance for this codebase):**
- Network fetches in `lib/api.ts` (currently untested) — mock `globalThis.fetch` or stub `getJson`.
- `localStorage` interactions in `app/components/theme-toggle.tsx` — JSDOM provides a working implementation, so prefer integration-style assertions over mocks.

**What NOT to Mock:**
- Pure data modules like `lib/fallback-data.ts` and `lib/types.ts` — import them directly.
- React itself or `@testing-library/react` internals.

## Fixtures and Factories

**Test Data:**
- Tests reuse the production-shipped fallback data from `lib/fallback-data.ts` (`fallbackProfile`, `fallbackSkills`, `fallbackExperience`, `fallbackApps`, `fallbackPosts`).
- This keeps the homepage rendering identical to its production fallback path and avoids a parallel set of fixture types.

**Location:**
- No dedicated `__fixtures__/`, `tests/fixtures/`, or `mocks/` directory exists. Fallback constants in `lib/fallback-data.ts` serve double duty as test fixtures.

## Coverage

- **No coverage threshold or reporter configured** in `vitest.config.ts`.
- No `--coverage` script is wired into `package.json`.
- View ad-hoc coverage with: `npx vitest run --coverage` (would require installing `@vitest/coverage-v8` first; not currently a dependency).
- `coverage/` is listed in `.gitignore`, suggesting coverage runs are anticipated but not yet automated.

## Test Types

**Unit Tests:**
- None at the module level. `lib/api.ts`, `lib/fallback-data.ts`, and `lib/types.ts` have no test coverage.

**Component / Integration Tests:**
- One smoke test (`app/components/homepage.test.tsx`) verifies that all major homepage sections render their headings.

**E2E Tests:**
- None. No Playwright, Cypress, or similar framework is installed.

## Current Coverage Honest Assessment

**Tests are sparse.** As of 2026-05-06 the project ships exactly **one** test file and **one** test case:

| Area | Coverage |
|------|----------|
| `app/page.tsx` (server route + Promise.all data loading) | None |
| `app/layout.tsx` (root layout, theme bootstrap script) | None |
| `app/robots.ts`, `app/sitemap.ts` (Next.js metadata routes) | None |
| `app/components/homepage.tsx` (presentational rendering) | One smoke test asserting 5 headings appear |
| `app/components/theme-toggle.tsx` (client component, localStorage, useState) | None |
| `lib/api.ts` (fetch wrapper, fallback path, error swallowing) | None |
| `lib/fallback-data.ts` (used by the one existing test as fixture) | Indirect |
| `lib/types.ts` (type-only) | N/A |

The infrastructure (Vitest + Testing Library + jsdom + jest-dom matchers) is fully wired and ready for additional tests, but assertion depth is currently limited to "headings exist" — no behaviour, interaction, error path, or data-fetching tests exist.

## Common Patterns (For Future Tests)

**Async Testing:**
```ts
test("loads data from api", async () => {
  const result = await getProfile();
  expect(result.name).toBeDefined();
});
```

**Error / Fallback Testing:**
```ts
import { vi } from "vitest";
test("returns fallback when fetch fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
  const result = await getProfile();
  expect(result).toEqual(fallbackProfile);
});
```

**Client Component Interaction:**
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
test("toggles theme on click", () => {
  render(<ThemeToggle />);
  fireEvent.click(screen.getByRole("button", { name: /switch to dark/i }));
  expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
});
```

---

*Testing analysis: 2026-05-06*
