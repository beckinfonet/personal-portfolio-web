# Phase 5: SEO + Accessibility Polish - Pattern Map

**Mapped:** 2026-05-10
**Files analyzed:** 30 (24 NEW + 6 UPDATED)
**Analogs found:** 21 / 24 NEW (3 are Next.js file-conventions with no in-repo analog; closest stylistic precedent cited)

---

## File Classification

### NEW files

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `app/opengraph-image.tsx` (root) | metadata-file (RSC) | request-response (PNG bytes) | `app/sitemap.ts` (file-convention RSC) + `app/components/shell/accent-bootstrap-script.tsx` (RSC pattern) | partial — no precedent for `next/og`; closest stylistic siblings |
| `app/(terminal)/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same as root OG | partial |
| `app/(terminal)/projects/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/(terminal)/stack/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/(terminal)/experience/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/(terminal)/writing/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/(terminal)/contact/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/(terminal)/shipped/opengraph-image.tsx` | metadata-file (RSC) | request-response (PNG) | same | partial |
| `app/icon.tsx` | metadata-file (RSC) | request-response (PNG) | `app/sitemap.ts` (file-convention) | partial |
| `app/apple-icon.tsx` | metadata-file (RSC) | request-response (PNG) | `app/sitemap.ts` + `app/icon.tsx` (sibling) | partial |
| `app/manifest.ts` | metadata-file (RSC) | static-data | `app/sitemap.ts` + `app/robots.ts` | exact — same file-convention shape |
| `app/components/shell/json-ld-person.tsx` | shell component (RSC) | static-render (inline `<script>`) | `app/components/shell/accent-bootstrap-script.tsx` | exact — same `dangerouslySetInnerHTML` model |
| `app/components/shell/head-comment.tsx` | shell component (RSC) | static-render (inline comment) | `app/components/shell/accent-bootstrap-script.tsx` | role-match — `dangerouslySetInnerHTML` reused on `<noscript>` host |
| `app/components/shell/console-signature.tsx` | shell component (client island) | event-driven (useEffect on mount) | `app/components/shell/live-clock.tsx` | exact — same `'use client'` + `useEffect` shape |
| `app/components/views/about-socials.tsx` | view component (RSC) | static-render (props → JSX) | `app/components/views/contact-view.tsx` | exact — reuses same row pattern + `<ExternalLink>` |
| `lib/json-ld.ts` | lib helper (pure) | transform | `lib/uptime.ts` (small pure helper) | role-match |
| `tests/contrast.spec.ts` | test (Playwright) | event-driven (browser automation) | `app/sitemap.test.tsx` (closest test in repo) | partial — first Playwright test in repo; no analog |
| `playwright.config.ts` | config | static-config | `vitest.config.ts` | role-match — same config-file shape, different runner |
| `app/components/shell/json-ld-person.test.tsx` | test (Vitest + RTL) | request-response | `app/components/shell/accent-bootstrap-script.test.tsx` | exact — same script-emitting RSC test pattern |
| `lib/json-ld.test.ts` | test (Vitest, pure) | transform | `app/sitemap.test.tsx` (pure-function test of RSC export) | role-match |
| `app/components/shell/console-signature.test.tsx` | test (Vitest + RTL) | event-driven | `app/components/shell/live-clock.test.tsx` | exact |
| `app/layout.test.tsx` | test (Vitest + RTL) | request-response | `app/components/shell/accent-bootstrap-script.test.tsx` (closest sibling) | partial — no existing layout-level test |
| `scripts/check-og-files.mjs` | build-script (Node ESM) | file-I/O | `scripts/check-print-rules.mjs` | exact — same readFileSync + grep pattern |
| `scripts/check-reduced-motion.mjs` | build-script (Node ESM) | file-I/O | `scripts/check-print-rules.mjs` | exact |
| `scripts/check-head-comment.mjs` | build-script (Node ESM) | file-I/O | `scripts/check-print-rules.mjs` | exact |
| `scripts/check-headers.mjs` | build-script (Node ESM) | file-I/O (`curl` or `next.config.ts` parse) | `scripts/check-placeholders.mjs` | role-match |
| `assets/JetBrainsMono-Bold.ttf` | binary asset | content | none | none (binary; no analog needed) |
| `assets/JetBrainsMono-Medium.ttf` | binary asset | content | none | none |

### UPDATED files

| Updated File | Role | What's Added | Pattern Source |
|--------------|------|--------------|----------------|
| `app/layout.tsx` | layout (RSC) | `metadata.twitter`, separate `viewport` export, `<JsonLdPerson />`, `<HeadComment />` | extends current `app/layout.tsx` (Phase 1+2 wired `metadata.openGraph` and mounts `<AccentBootstrapScript />`) |
| `app/(terminal)/layout.tsx` | layout (RSC) | mount `<ConsoleSignature />` | extends current sibling-of-CommandPalette pattern |
| `app/components/views/about-view.tsx` | view (RSC) | insert `<AboutSocials />` between bio and `.about-cards` | extends current view structure |
| `app/globals.css` | CSS | append universal-selector reduced-motion reset; possibly per-hue `--warn` overrides | extends existing `@media (prefers-reduced-motion: reduce)` block at line 152 |
| `package.json` | config | devDeps + `test:contrast` script | extends current `scripts` + `devDependencies` |
| `app/components/views/about-view.test.tsx` | test | extend with AboutSocials assertions | extends existing test file |

---

## Pattern Assignments

### `app/components/shell/json-ld-person.tsx` (RSC, static-render)

**Analog:** `app/components/shell/accent-bootstrap-script.tsx` — exact match. Both are RSC inline-script emitters using `dangerouslySetInnerHTML`. The CONTEXT.md D-11 explicitly says "parallels Phase 2 AccentBootstrapScript pattern."

**Imports + RSC banner pattern** (`app/components/shell/accent-bootstrap-script.tsx:1`):
```tsx
// NO "use client" — this is an RSC inline script emitter
```

**Inline-script via `dangerouslySetInnerHTML` pattern** (`app/components/shell/accent-bootstrap-script.tsx:13-15`):
```tsx
export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
```

**Apply for JSON-LD** (per RESEARCH Pattern 5):
- Same `<script>` element, swap to `type="application/ld+json"`
- Build payload via `lib/json-ld.ts` `buildPersonSchema(PROFILE, siteUrl)`
- **CRITICAL XSS escape (RESEARCH Pitfall 6):** `JSON.stringify(schema).replace(/</g, "\\u003c")` before placing in `__html`

**Module-constant convention** (`app/components/shell/accent-bootstrap-script.tsx:3`):
```tsx
const ACCENT_BOOTSTRAP_SCRIPT = `(function () { ... })();`;
```
UPPERCASE module-level constants — applies to any local constants in `json-ld-person.tsx`.

---

### `app/components/shell/head-comment.tsx` (RSC, static-render)

**Analog:** `app/components/shell/accent-bootstrap-script.tsx` — same `dangerouslySetInnerHTML` model, hosted on `<noscript>` instead of `<script>` (RESEARCH Pattern 9 / Assumption A1).

**Pattern excerpt** (`app/components/shell/accent-bootstrap-script.tsx:13-15`):
```tsx
export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
```

**Apply for HeadComment** (per RESEARCH Pattern 9 §Option B):
- Replace `<script>` with `<noscript>` (or inert `<script type="text/x-html-comment">`)
- `__html` payload is the literal `<!-- ... -->` string with the 6-line lowercase letter from CONTEXT.md D-27 / UI-SPEC §Copywriting Contract
- All-lowercase content (Pitfall 9 — `TODO` is forbidden by `scripts/check-placeholders.mjs:25`)

---

### `app/components/shell/console-signature.tsx` (client island, event-driven)

**Analog:** `app/components/shell/live-clock.tsx` — exact match. Both are minimal client islands using `'use client'` + `useEffect` on mount.

**Client banner + imports** (`app/components/shell/live-clock.tsx:1-3`):
```tsx
"use client";

import { useEffect, useState } from "react";
```

**`useEffect` on-mount pattern** (`app/components/shell/live-clock.tsx:8-18`):
```tsx
useEffect(() => {
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setTime(`${hh}:${mm}`);
  };
  tick(); // set immediately on mount
  const id = setInterval(tick, 30_000);
  return () => clearInterval(id);
}, []);
```

**Apply for ConsoleSignature** (per RESEARCH Pattern 8):
- Drop the `useState` (no DOM render needed); `return null;` instead of returning a span
- Single `console.log("%c<art>%c<lines>", ART_STYLE, TEXT_STYLE)` inside `useEffect(() => { ... }, [])`
- ART_STYLE = `"color: #16a34a; font-family: monospace;"` (matrix accent sRGB hex; see UI-SPEC §Color §Typography)
- Read `PROFILE.email` from `lib/portfolio-data.ts` for the second plain line

**Mount location** (`app/(terminal)/layout.tsx:53-57`):
```tsx
{/* ExplorerDrawer: 6th client island; visible only at <=960px via CSS */}
<ExplorerDrawer />

{/* CommandPalette: mounted once outside terminal-body so its z-index overlay covers everything */}
<CommandPalette />
```
ConsoleSignature mounts as sibling here (Pitfall 8: NEVER mount in root `app/layout.tsx`).

---

### `app/components/views/about-socials.tsx` (RSC, static-render)

**Analog:** `app/components/views/contact-view.tsx` — exact match. CONTEXT.md D-33 explicitly says "Borrows the existing `app/components/views/contact-view.tsx` row pattern."

**RSC banner + imports** (`app/components/views/contact-view.tsx:1-8`):
```tsx
// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS classes (.contact-lead, .contact-card, .contact-row, .contact-label, ...) defined
//   in app/globals.css.

import type { Profile } from "@/lib/types";
import { ExternalLink } from "@/app/components/primitives/external-link";
```

**Row pattern — EMAIL row** (`app/components/views/contact-view.tsx:36-51`):
```tsx
<div className="contact-row">
  <span className="contact-label">EMAIL</span>
  <a
    href={`mailto:${profile.email}`}
    aria-label={`Send email to ${profile.email}`}
  >
    {profile.email}
  </a>
  ...
</div>
```

**Row pattern — social rows with ExternalLink** (`app/components/views/contact-view.tsx:54-65`):
```tsx
{profile.socials.map((s) => (
  <div key={s.kind} className="contact-row">
    <span className="contact-label">{s.label.toUpperCase()}</span>
    <ExternalLink
      href={s.url}
      aria-label={`Open ${s.label} (opens in new tab)`}
    >
      {s.handle}
    </ExternalLink>
    <span />
  </div>
))}
```

**Find by `kind` for type-safety** (`app/components/views/contact-view.tsx:23-24`):
```tsx
// GitHub social is the first entry by convention (lib/portfolio-data.ts D-08); use kind for safety.
const github = profile.socials.find((s) => s.kind === "github");
```

**Apply for AboutSocials** (per RESEARCH Pattern 10):
- 3 rows: `find((s) => s.kind === "github")` and `find((s) => s.kind === "linkedin")` (NOT `.map(socials)`)
- TODO-guard via `/^https?:\/\//.test(url)` — fall back to `<span className="contact-muted">` if URL is `TODO:` sentinel (D-34)
- Wrap in `<div className="about-socials-card" role="group" aria-label="Quick contact">`
- New CSS `.about-socials-card` + `.contact-muted` appended to `app/globals.css` (RESEARCH Pattern 10 §"CSS additions")

---

### `app/components/views/about-view.tsx` (UPDATED — insert `<AboutSocials />`)

**Current insertion site** (`app/components/views/about-view.tsx:23-29`):
```tsx
{profile.bio.long.map((para, i) => (
  <p key={i} className="about-para">
    {para}
  </p>
))}

<div className="about-cards">
```

**Apply** (per RESEARCH Pattern 10): inject `<AboutSocials profile={profile} />` between the closing `})` of the `bio.long.map` and the opening `<div className="about-cards">`.

---

### `lib/json-ld.ts` (lib helper, transform)

**Analog:** `lib/uptime.ts` — closest existing pure helper module (small, pure, exports named functions; no `lib/json-ld.ts` precedent).

**Apply** (RESEARCH Pattern 5):
- Two named exports: `filterValidUrls(profile)` and `buildPersonSchema(profile, siteUrl)`
- TypeScript interface `PersonSchema` exported alongside
- No top-level side effects, no environment access (siteUrl passed as arg)
- Sanitization helper applied at the call site in `json-ld-person.tsx`, not here (separation of concerns: builder produces typed object; emitter handles HTML escape)

---

### `app/manifest.ts` (metadata-file, static-data)

**Analog:** `app/sitemap.ts` + `app/robots.ts` — exact match. Same Next.js file-convention shape.

**Pattern excerpt** (`app/sitemap.ts:1-12`):
```tsx
import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ROUTES.map((r) => ({ ... }));
}
```

**Pattern excerpt** (`app/robots.ts:1-3`):
```tsx
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
```

**Apply for manifest.ts** (RESEARCH Pattern 3):
- Same shape: `import type { MetadataRoute } from "next"` → `export default function manifest(): MetadataRoute.Manifest`
- Empty `icons: []` in v1 (Pitfall 12 — Next.js auto-includes `app/icon.tsx` and `app/apple-icon.tsx`; manual entries duplicate)
- `display: "browser"` per CONTEXT.md D-14 (no PWA push)
- Inline dark `--bg` hex for `theme_color` and `background_color`

---

### `app/icon.tsx`, `app/apple-icon.tsx` (metadata-file, request-response)

**Analog:** none in repo for `next/og` — this phase introduces the first `ImageResponse` use. Closest stylistic precedent: `app/sitemap.ts` (file-convention RSC).

**Apply** (RESEARCH Pattern 2):
- `import { ImageResponse } from "next/og"` + `import { readFile } from "node:fs/promises"` + `import { join } from "node:path"`
- Module-level constants: `export const size = { width: 32, height: 32 }`, `export const contentType = "image/png"`
- Inline hex constants: `const PANEL = "#0d100f"; const ACCENT_MATRIX = "#22c55e";` (Pitfall 1 — no CSS variables in Satori)
- Default async function loads font binary via `await readFile(join(process.cwd(), "assets/JetBrainsMono-Bold.ttf"))` (Pitfall 4)
- `apple-icon.tsx` differs only by `size = { width: 180, height: 180 }` and proportional `fontSize`

---

### `app/opengraph-image.tsx` × 8 (metadata-file, request-response)

**Analog:** none in repo. Closest stylistic precedent for the `ROUTES`-keyed pattern: `app/sitemap.ts:6` (`return ROUTES.map((r) => ({ url: ${baseUrl}${r.pathname}, ... }))`).

**Apply** (RESEARCH Pattern 1):
- All 8 OG files share the same template; differ only by `const route = ROUTES[i]` (or hard-coded label string for crystal clarity)
- Per UI-SPEC table: top half name (60/700) + role (28/500), bottom-left 8×24px matrix-accent block + `~/portfolio/{route.label}` (32/500 accent)
- Inline hex from UI-SPEC §"OG image color tokens" (Pitfall 1)
- `display: "flex"` explicit on every container (Pitfall 2)
- `fonts: [{ name: "JetBrains Mono", data: <Buffer>, weight: 700, style: "normal" }, { ..., weight: 500, ... }]` — load Bold + Medium TTFs (Pitfall 4)
- `export const alt = ...; export const size = { width: 1200, height: 630 }; export const contentType = "image/png";`

**Decision deferred to planner (per RESEARCH Open Question 1):** whether to share a helper across the 8 files or duplicate. Default for v1: duplicate inline (clarity > DRY for first iteration; FWIW `app/sitemap.ts` handles the per-route iteration via `ROUTES.map` and that pattern is already established for ROUTES-keyed metadata).

---

### `app/layout.tsx` (UPDATED — Twitter, viewport, JsonLdPerson, HeadComment)

**Existing imports + metadata pattern** (`app/layout.tsx:1-31`):
```tsx
import type { Metadata } from "next";
...
import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
...
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bakytbek Tatibekov — Sr. Software Engineer",
  description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
  openGraph: {
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
    type: "website"
  }
};
```

**Existing `<head>` mount pattern** (`app/layout.tsx:42-47`):
```tsx
<head>
  {/* AccentBootstrapScript runs before paint — reads localStorage["portfolio-accent"]
      and sets --accent-hue on <html>. next-themes auto-injects its own theme script;
      do NOT add a second manual theme script here. (D-08) */}
  <AccentBootstrapScript />
</head>
```

**Apply** (per RESEARCH Pattern 4 + Pitfall 3):
1. Extend `import type { Metadata }` → `import type { Metadata, Viewport }`
2. Add to `metadata`: `twitter: { card: "summary_large_image", title: ..., description: ... }` (UI-SPEC §"Twitter card copy" specifies verbatim text)
3. Add NEW separate export `export const viewport: Viewport = { themeColor: [...] }` — **NOT** `metadata.themeColor` (CONTEXT.md D-15 deprecated location)
4. Mount in `<head>`:
   ```tsx
   <AccentBootstrapScript />
   <HeadComment />
   <JsonLdPerson />
   ```
   HeadComment placement just after `<meta charSet>` (which Next.js auto-emits) per UI-SPEC §Visuals. JSON-LD placement is order-independent.

---

### `app/(terminal)/layout.tsx` (UPDATED — mount ConsoleSignature)

**Existing sibling-of-CommandPalette pattern** (`app/(terminal)/layout.tsx:53-57`):
```tsx
{/* ExplorerDrawer: 6th client island; visible only at <=960px via CSS */}
<ExplorerDrawer />

{/* CommandPalette: mounted once outside terminal-body so its z-index overlay covers everything */}
<CommandPalette />
```

**Apply:** Insert `<ConsoleSignature />` as sibling to `<CommandPalette />` (per CONTEXT.md D-25 / Pitfall 8). Pure import + JSX, no other layout changes.

---

### `app/globals.css` (UPDATED — reduced-motion + possible per-hue overrides)

**Existing block** (`app/globals.css:152-162`):
```css
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
  .content-block { animation: none; }
  .breadcrumb-hint { transition: none; opacity: 1; }

  /* Phase 4 additions */
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] { animation: none; }
  .drawer-backdrop { transition: none; }
  [cmdk-dialog] { animation: none; }
}
```

**Apply** (RESEARCH Pattern 6, Pitfall 7):
- Append `*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }` INSIDE the existing block (NOT a new block)
- **CRITICAL:** `0.01ms` not `0ms` (some browsers treat 0 as falsy)
- Keep existing targeted rules (D-17 — documents intent)
- Conditionally append per-hue `--warn` overrides under `[data-theme="light"][style*="--accent-hue: 75"] { --warn: oklch(0.42 0.18 75); }` ONLY if axe fails (D-22 — measure first, fix only what fails)

---

### `tests/contrast.spec.ts` + `playwright.config.ts` (NEW — first Playwright in repo)

**Analog:** none for Playwright runtime. Closest config-shape precedent: `vitest.config.ts` (single `defineConfig({...})` default export).

**Apply** (RESEARCH Pattern 7):
- Iterate `HUES = [145, 75, 200, 340]` × `THEMES = ["dark", "light"]` × `ROUTES` (imported from `lib/routes.ts` — single source of truth per CLAUDE.md)
- `page.addInitScript(([t, h]) => { localStorage.setItem("theme", t); localStorage.setItem("portfolio-accent", String(h)); }, [theme, hue])` — Pitfall 10
- Sanity check: `await expect(page.locator("html")).toHaveAttribute("data-theme", theme)` BEFORE running axe
- `new AxeBuilder({ page }).withTags(["wcag2aa", "wcag21aa"]).analyze()` — filter to `id === "color-contrast"`, assert empty
- `playwright.config.ts`: `webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI }`

---

### Test files (Vitest + RTL)

#### `app/components/shell/json-ld-person.test.tsx`

**Analog:** `app/components/shell/accent-bootstrap-script.test.tsx` — exact match (script-emitting RSC).

**Render + script lookup pattern** (`app/components/shell/accent-bootstrap-script.test.tsx:5-9`):
```tsx
test("renders a <script> element (inline script emitter)", () => {
  const { container } = render(<AccentBootstrapScript />);
  const script = container.querySelector("script");
  expect(script).not.toBeNull();
});
```

**Content assertion** (`app/components/shell/accent-bootstrap-script.test.tsx:11-15`):
```tsx
test("inline script contains 'portfolio-accent' key reference", () => {
  const { container } = render(<AccentBootstrapScript />);
  const script = container.querySelector("script");
  expect(script?.innerHTML).toContain("portfolio-accent");
});
```

**Apply for json-ld-person.test.tsx:**
- Renders a `<script type="application/ld+json">` element
- `innerHTML` is valid JSON
- Parsed JSON contains `"@type": "Person"`, `"name"`, `"jobTitle"`, `"sameAs"`
- `innerHTML` does NOT contain a literal `<` (XSS escape applied — Pitfall 6)

#### `app/components/shell/console-signature.test.tsx`

**Analog:** `app/components/shell/live-clock.test.tsx` — exact match (client island).

**Pattern excerpt** (`app/components/shell/live-clock.test.tsx:1-9`):
```tsx
import { render } from "@testing-library/react";
import { LiveClock } from "./live-clock";

describe("LiveClock", () => {
  test("renders with aria-hidden='true'", () => {
    render(<LiveClock />);
    const clock = document.querySelector(".live-clock");
    expect(clock).toHaveAttribute("aria-hidden", "true");
  });
```

**Apply:** Spy on `console.log` via `vi.spyOn(console, "log")`, render `<ConsoleSignature />`, assert spy was called once and the message contains `PROFILE.email` and `github.com/beckinfonet`.

#### `lib/json-ld.test.ts`

**Analog:** `app/sitemap.test.tsx` — pure-function test of an RSC default export.

**Pattern excerpt** (`app/sitemap.test.tsx:4-7`):
```tsx
describe("sitemap", () => {
  test("returns an array with the same length as ROUTES", () => {
    const result = sitemap();
    expect(result).toHaveLength(ROUTES.length);
  });
```

**Apply:** Import `buildPersonSchema` and `filterValidUrls`, test with mock Profile fixtures (TODO sentinels filtered, real URLs kept, schema shape stable).

#### `app/layout.test.tsx`

**Analog:** none directly — closest is `app/components/shell/accent-bootstrap-script.test.tsx` (testing inline-script emission). Layout-level rendering is jsdom-friendly when wrapped via RTL.

**Apply:** Render `<RootLayout><div>child</div></RootLayout>`, assert `<script type="application/ld+json">` and `<noscript>` (or equivalent comment-host) present in `document.head`. Note: Next.js metadata exports cannot be unit-tested via RTL — those are smoke-checked by build-script greps (see `scripts/check-og-files.mjs` etc.).

---

### Build-script greps (`scripts/check-*.mjs`)

**Analog:** `scripts/check-print-rules.mjs` — exact match (CSS-block greps); `scripts/check-placeholders.mjs` for the `.next/server/` build-output scan style.

**Pattern excerpt — block-scoped grep** (`scripts/check-print-rules.mjs:1-13`):
```mjs
#!/usr/bin/env node
// scripts/check-print-rules.mjs
// A11Y-09 audit: @media print block exists ...

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

// Extract the @media print block to scope sub-grep checks
const printBlockMatch = contents.match(/@media print\s*\{[\s\S]*$/);
const printBlock = printBlockMatch ? printBlockMatch[0] : "";
```

**Pattern excerpt — checks array + failure loop** (`scripts/check-print-rules.mjs:16-37`):
```mjs
const checks = [
  { pattern: /@media print\s*\{/, label: "@media print block present", scope: "file" },
  { pattern: /font-family:\s*Georgia/, label: "serif body (Georgia) in print", scope: "print" },
  ...
];

const failures = checks.filter(({ pattern, scope }) => {
  const target = scope === "print" ? printBlock : contents;
  return !pattern.test(target);
});

if (failures.length > 0) {
  console.error("\n✗ A11Y-09: print stylesheet audit failed:\n");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ A11Y-09: print stylesheet audit passed");
process.exit(0);
```

**Apply across all 4 new scripts:**
- `check-og-files.mjs` — verify the 8 `opengraph-image.tsx` files exist (`existsSync`); each contains `import { ImageResponse } from "next/og"` and `route.label` substitution
- `check-reduced-motion.mjs` — scope the existing `@media (prefers-reduced-motion: reduce)` block; assert `*, *::before, *::after`, `animation-duration: 0.01ms`, `transition-duration: 0.01ms` all present
- `check-head-comment.mjs` — scan the rendered `view-source:` body during build via fetch against `localhost:3000` OR grep the source TSX for the literal `hello, you found the source` string; planner picks (RESEARCH Assumption A1 leaves this open)
- `check-headers.mjs` — parse `next.config.ts` for `engineerHeaders` array containing `x-built-with`; verifies slot existence (DEV-29) without hitting a running server

---

### `package.json` (UPDATED — devDeps + script)

**Existing scripts pattern** (`package.json:8-18`):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "postbuild": "node scripts/check-placeholders.mjs",
  ...
  "check:mobile": "node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs"
}
```

**Apply:**
- Add to `devDependencies`: `"@axe-core/playwright": "^4.11.3"`, `"playwright": "^1.59.1"`
- Add to `scripts`: `"test:contrast": "playwright test"`, `"check:phase5": "node scripts/check-og-files.mjs && node scripts/check-reduced-motion.mjs && node scripts/check-head-comment.mjs && node scripts/check-headers.mjs"` (or fold these into `postbuild` per CI integration plan)

---

## Shared Patterns

### A. RSC by default; client islands at the leaf

**Source:** `app/components/shell/accent-bootstrap-script.tsx:1` (RSC) and `app/components/shell/live-clock.tsx:1` (client).

**Apply to:** All Phase 5 components. RSC banner (`// NO "use client" — RSC ...`) on:
- `json-ld-person.tsx`, `head-comment.tsx`, `about-socials.tsx`, all 8 OG files, `icon.tsx`, `apple-icon.tsx`, `manifest.ts`, `lib/json-ld.ts`

**Apply `'use client'` ONLY to:** `console-signature.tsx`. Any other client banner introduced in this phase is a Pitfall 8 violation.

```tsx
// NO "use client" — this is an RSC inline script emitter
```
vs.
```tsx
"use client";

import { useEffect, useState } from "react";
```

### B. Inline-script via `dangerouslySetInnerHTML` on RSC

**Source:** `app/components/shell/accent-bootstrap-script.tsx:13-15`

**Apply to:** `json-ld-person.tsx`, `head-comment.tsx`. Same shape; different host element + payload.

```tsx
return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
```

### C. UPPERCASE module-level constants

**Source:** `app/components/shell/accent-bootstrap-script.tsx:3` (`const ACCENT_BOOTSTRAP_SCRIPT = ...`); `lib/portfolio-data.ts:31` (`export const PROFILE: Profile = { ... }`); `lib/routes.ts:26` (`export const ROUTES = [...]`).

**Apply to:** All Phase 5 modules. Inline hex constants in OG/icon files (`BG_DARK`, `PANEL`, `TEXT_HI`, `MUTED`, `ACCENT_MATRIX`); `HEAD_COMMENT` string; `ASCII_ART`, `ART_STYLE`, `TEXT_STYLE` in console-signature; `HUES`, `THEMES` in contrast spec.

### D. `lib/routes.ts` `ROUTES` as single source of truth

**Source:** `app/sitemap.ts:6` (`return ROUTES.map((r) => ({ url: \`${baseUrl}${r.pathname}\`, ... }))`).

**Apply to:** `tests/contrast.spec.ts` (iterate routes), each `opengraph-image.tsx` (substitute `route.label`), any build script that needs to verify all 7 view paths.

```tsx
import { ROUTES } from "@/lib/routes";
```

### E. `PROFILE` as single source of truth for identity

**Source:** `app/components/views/contact-view.tsx:23-24`, `app/(terminal)/layout.tsx:12-14`.

**Apply to:** `lib/json-ld.ts` (read `name`, `role`, `email`, `socials`); `console-signature.tsx` (read `email`); `manifest.ts` (read `name`); each `opengraph-image.tsx` (read `name`, `role`).

```tsx
import { PROFILE } from "@/lib/portfolio-data";
```

### F. `process.env.NEXT_PUBLIC_SITE_URL` with `||` fallback

**Source:** `app/layout.tsx:10` — explicit comment locks the convention.

```tsx
// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (Phase 1 D-Pitfall D — do not change.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
```

**Apply to:** `lib/json-ld.ts` consumer (the call site in `json-ld-person.tsx`); `manifest.ts` if needed; `tests/contrast.spec.ts` `baseURL`.

### G. `aria-label` plain-noun convention (CLAUDE.md non-negotiable)

**Source:** `app/components/views/contact-view.tsx:39-43`:
```tsx
<a
  href={`mailto:${profile.email}`}
  aria-label={`Send email to ${profile.email}`}
>
```

**Apply to:** Every interactive element introduced by Phase 5. AboutSocials rows (`Send email to ...`, `Open GitHub (opens in new tab)`, `Open LinkedIn (opens in new tab)` — verbatim from contact-view); group `aria-label="Quick contact"` on the wrapper.

### H. Postbuild grep enforcement (no `TODO` strings)

**Source:** `scripts/check-placeholders.mjs:21-27`:
```mjs
const FORBIDDEN = [
  /lorem/i,
  /example\.com/i,
  /placeholder (text|content|string|image|name)/i,
  /TODO/,
  /Product Studio/
];
```

**Apply to:** Every new file (Pitfall 9). HTML comment uses lowercase `todo` if needed in prose; AboutSocials TODO-guard tests `/^https?:\/\//` regex against the URL value, never embeds the literal string "TODO".

---

## No Analog Found

| File | Role | Reason / Closest Stylistic Precedent |
|------|------|--------------------------------------|
| `app/opengraph-image.tsx` (and 7 sibling per-route variants) | RSC `next/og` `ImageResponse` | First `next/og` use in repo. Closest: `app/sitemap.ts` (file-convention + `ROUTES` iteration). RESEARCH Pattern 1 is the canonical Next.js example to follow. |
| `app/icon.tsx`, `app/apple-icon.tsx` | RSC `next/og` `ImageResponse` | First favicon-from-JSX in repo. Same as OG: RESEARCH Pattern 2 from the Vercel/Next.js docs. |
| `tests/contrast.spec.ts` + `playwright.config.ts` | Playwright spec + config | First Playwright test in repo (Vitest is jsdom-only). RESEARCH Pattern 7 from the official `@axe-core/playwright` README. |
| `assets/JetBrainsMono-Bold.ttf`, `assets/JetBrainsMono-Medium.ttf` | binary asset | No analog needed — content. Commit verbatim TTFs from JetBrains/JetBrainsMono GitHub release per RESEARCH Pitfall 4. |

For all four "no analog" cases the **canonical Next.js / Vercel pattern from RESEARCH.md is the substitute** — the planner cites RESEARCH Pattern 1/2/7 in the corresponding plan actions rather than a codebase file path.

---

## Metadata

**Analog search scope:** `app/components/shell/`, `app/components/views/`, `app/components/primitives/`, `app/`, `lib/`, `scripts/`
**Files scanned:** 30 (full read of: `app/layout.tsx`, `app/(terminal)/layout.tsx`, `app/globals.css:148-162`, `app/sitemap.ts`, `app/robots.ts`, `app/sitemap.test.tsx`, `app/components/shell/accent-bootstrap-script.tsx`, `app/components/shell/accent-bootstrap-script.test.tsx`, `app/components/shell/live-clock.tsx`, `app/components/shell/live-clock.test.tsx`, `app/components/shell/status-block.tsx`, `app/components/shell/command-palette.tsx`:1-60, `app/components/views/contact-view.tsx`, `app/components/views/about-view.tsx`, `app/components/views/about-view.test.tsx`, `app/components/primitives/external-link.tsx`, `lib/routes.ts`, `lib/portfolio-data.ts`, `package.json`, `scripts/check-placeholders.mjs`, `scripts/check-print-rules.mjs`, `scripts/check-mobile-palette-css.mjs`)
**Pattern extraction date:** 2026-05-10
