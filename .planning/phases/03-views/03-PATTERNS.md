# Phase 3: Views — Pattern Map

**Mapped:** 2026-05-06
**Files analyzed:** 24 (5 primitives, 7 view RSCs, 7 page wrappers, 8 tests, 1 CSS append)
**Analogs found:** 24 / 24 — every Phase 3 file has at least one role-match analog already in `app/`

The codebase is a small but tightly-conventioned greenfield Phase 2 baseline. Patterns below are concrete excerpts from real shipped files; planner should reference them directly rather than inventing structure.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/components/primitives/external-link.tsx` | primitive RSC | static-render | `app/components/primitives/prompt-line.tsx` | exact |
| `app/components/primitives/tech-chip.tsx` | primitive RSC | static-render | `app/components/primitives/prompt-line.tsx` | exact |
| `app/components/primitives/kbd.tsx` | primitive RSC | static-render | `app/components/primitives/prompt-line.tsx` | exact |
| `app/components/primitives/store-badge.tsx` | primitive RSC | static-render | `app/components/primitives/prompt-line.tsx` + `app/components/shell/accent-bootstrap-script.tsx` (inline-asset emit) | role-match |
| `app/components/primitives/copy-button.tsx` | primitive client island | event-driven (browser API) | `app/components/shell/live-clock.tsx` (smallest client island; useState + useEffect/setInterval timer) + `app/components/shell/top-bar.tsx` (`.topbar-btn` styling) | role-match |
| `app/components/views/about-view.tsx` | view RSC | request-response (RSC props) | `app/components/shell/sidebar.tsx` (RSC iterating typed data + ROUTES) — closest list-renderer in repo, though Sidebar is a client island; no existing pure-RSC view | partial — no exact analog yet |
| `app/components/views/projects-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` (RSC mapping `ROUTES.map(...)` to a list) | role-match |
| `app/components/views/stack-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` (RSC iterates typed array) | role-match |
| `app/components/views/experience-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` | role-match |
| `app/components/views/writing-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` | role-match |
| `app/components/views/contact-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` | role-match |
| `app/components/views/shipped-view.tsx` | view RSC | request-response (RSC props) | `app/not-found.tsx` | role-match |
| `app/(terminal)/page.tsx` (modify) | page (server thin wrapper) | request-response | `app/(terminal)/projects/page.tsx` (existing Phase 2 stub) | exact |
| `app/(terminal)/projects/page.tsx` (modify) | page (server thin wrapper) | request-response | itself (current stub) | exact |
| `app/(terminal)/stack/page.tsx` (modify) | page (server thin wrapper) | request-response | `app/(terminal)/projects/page.tsx` | exact |
| `app/(terminal)/experience/page.tsx` (modify) | page | request-response | `app/(terminal)/projects/page.tsx` | exact |
| `app/(terminal)/writing/page.tsx` (modify) | page | request-response | `app/(terminal)/projects/page.tsx` | exact |
| `app/(terminal)/contact/page.tsx` (modify) | page | request-response | `app/(terminal)/projects/page.tsx` | exact |
| `app/(terminal)/shipped/page.tsx` (modify) | page | request-response | `app/(terminal)/projects/page.tsx` | exact |
| `app/(terminal)/page.test.tsx` (NEW) | test spec | n/a | `app/sitemap.test.tsx` (tests a `default export` function, very close to "render this page module") + `app/components/shell/sidebar.test.tsx` (RTL + jest-dom + ROUTES iteration + mocking `next/navigation`) | exact |
| `app/(terminal)/projects/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/stack/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/experience/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/writing/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/contact/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/shipped/page.test.tsx` (NEW) | test spec | n/a | `app/components/shell/sidebar.test.tsx` | exact |
| `app/(terminal)/views.test.tsx` (NEW — cross-view) | test spec | n/a | `app/sitemap.test.tsx` (asserts properties across `ROUTES`-shaped iteration) | exact |
| `app/globals.css` (extend) | css | n/a | existing sections in same file (e.g. `.topbar-btn`, `.sidebar`, `.breadcrumb`) | exact |

---

## Pattern Assignments

### `app/components/primitives/external-link.tsx` (primitive RSC, static-render)

**Analog:** `app/components/primitives/prompt-line.tsx`

**File-shape pattern** (full file, lines 1–17):
```tsx
// NO "use client" — RSC-friendly primitive
// CSS classes (.prompt-line, .prompt-dollar, .prompt-cmd, .cursor) defined in app/globals.css

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

**Excerpts to copy:**
- Line 1: `// NO "use client"` comment header is a project convention — every RSC file in this codebase that *could* be mistaken for a client island carries the explicit comment. Copy verbatim, swapping "primitive" / "RSC stub" / "RSC view" as appropriate.
- Line 2: CSS-class JSDoc-style comment listing class names — every primitive file enumerates its CSS classes here; reduces grep cost when refactoring CSS.
- Lines 4–6: `interface <Name>Props { ... }` declared **above** the component, in the same file, named `<ComponentName>Props`. Per CONVENTIONS.md.
- Line 8: `export function PromptLine(...)` — **named function declaration** (not arrow function), **named export** (not default). Default exports are reserved for Next.js convention files only.
- Line 8 destructure: props are destructured in the function signature (`{ cmd }: PromptLineProps`), never `props.cmd`.
- Lines 9–15: single-element JSX return without parens for a single `<div>` works; this primitive uses `<div>` + spans. ExternalLink will wrap the `<a>` and an `<span aria-hidden="true">` glyph.

**Apply to ExternalLink:**
```tsx
// NO "use client" — RSC-friendly primitive (SEO-05)
// CSS: inherits `a { color: var(--accent) }` from app/globals.css line 95.
// Optional className composes with view-specific styles (.btn, .btn-ghost, .projects-row, etc.)

import type { ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  showGlyph?: boolean; // defaults true; pass false for store-badge wrapper, contact ghost CTA
  "aria-label"?: string; // forwarded to underlying <a>
}

export function ExternalLink({
  href,
  className,
  children,
  showGlyph = true,
  "aria-label": ariaLabel
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
      {showGlyph && <span aria-hidden="true"> ↗</span>}
    </a>
  );
}
```

---

### `app/components/primitives/tech-chip.tsx` (primitive RSC)

**Analog:** `app/components/primitives/prompt-line.tsx`

Same file-shape as ExternalLink. Single-prop primitive — children only. Copy `// NO "use client"` header + interface + named export pattern verbatim.

```tsx
import type { ReactNode } from "react";

interface TechChipProps {
  children: ReactNode;
}

export function TechChip({ children }: TechChipProps) {
  return <span className="tech-chip">{children}</span>;
}
```

CSS class `.tech-chip` is appended to `app/globals.css` per UI-SPEC §"1. `<TechChip>`".

---

### `app/components/primitives/kbd.tsx` (primitive RSC)

**Analog:** `app/components/primitives/prompt-line.tsx`

Same shape as TechChip. Renders `<kbd>` element (semantic HTML) wrapped with `.kbd` class.

**Note from UI-SPEC §"2. `<Kbd>`":** `app/globals.css` already has `.breadcrumb-hint kbd` (lines 526–535) and `.palette-footer kbd` rules. Lift the inner block to a top-level `.kbd { ... }` rule; existing scoped rules can either remain or be removed in favor of the global class.

---

### `app/components/primitives/store-badge.tsx` (primitive RSC)

**Analog:** `app/components/primitives/prompt-line.tsx` (file shape) + `app/components/shell/accent-bootstrap-script.tsx` (inline static asset emit pattern)

**accent-bootstrap-script.tsx shape excerpt** (lines 1–15):
```tsx
// NO "use client" — this is an RSC inline script emitter

const ACCENT_BOOTSTRAP_SCRIPT = `(function () {
  try {
    var raw = localStorage.getItem('portfolio-accent');
    var hue = (raw && /^\\d{1,3}$/.test(raw) && +raw >= 0 && +raw < 360) ? raw : '145';
    document.documentElement.style.setProperty('--accent-hue', hue);
  } catch (e) {
    /* localStorage unavailable — CSS default --accent-hue: 145 applies */
  }
})();`;

export function AccentBootstrapScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />;
}
```

**Apply to StoreBadge:**
- **Module-level constants** for the SVG markup or `viewBox`/`width`/`height` — mirrors the `ACCENT_BOOTSTRAP_SCRIPT` const-above-component layout. This keeps the JSX body short and pinned constants discoverable.
- **JSDoc header** linking to Apple + Google brand-guideline URLs and the date the SVG was sourced (D-13 mandatory).
- Composition: wrap inline `<svg>` inside `<ExternalLink href={href} showGlyph={false} aria-label={...}>` (UI-SPEC §"5. `<StoreBadge>`" Option 1).

```tsx
// NO "use client" — RSC primitive. Renders inline SVG official badge wrapped in <ExternalLink>.
// LICENSE: Apple Marketing Identity Guidelines (https://developer.apple.com/app-store/marketing/guidelines/);
//          Google Play Brand Guidelines (https://play.google.com/intl/en_us/badges/).
// SVG sourced YYYY-MM-DD; do NOT recolor or modify dimensions. Per Phase 3 D-13.

import { ExternalLink } from "@/app/components/primitives/external-link";

const APP_STORE_VIEWBOX = "0 0 ... ..."; // executor fills from official asset
const GOOGLE_PLAY_VIEWBOX = "0 0 ... ..."; // executor fills from official asset

interface StoreBadgeProps {
  platform: "ios" | "android";
  href: string;
  appName: string;
}

export function StoreBadge({ platform, href, appName }: StoreBadgeProps) {
  // ...
}
```

---

### `app/components/primitives/copy-button.tsx` (primitive **client island**, event-driven)

**Analog:** `app/components/shell/live-clock.tsx` (smallest client island in the repo — useState + useEffect timer) + `app/components/shell/top-bar.tsx` (visual styling reference: `.topbar-btn` mirrors the desired CopyButton chrome).

**live-clock.tsx file-shape pattern** (full file, lines 1–25):
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
    tick(); // set immediately on mount
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="live-clock" aria-hidden="true">
      {time ?? "--:--"}
    </span>
  );
}
```

**Excerpts to copy:**
- Line 1: `"use client";` is the **first line, no leading comment**, followed by a blank line. CONVENTIONS.md confirms this is the project pattern.
- Line 3: hooks imported on a dedicated import line (`import { useEffect, useState } from "react";`).
- Hook ordering: `useState` declared first, `useEffect` second; state initial value is hydration-safe (e.g. `null` → renders fallback `"--:--"` until client tick).
- Cleanup: returned function in `useEffect` clears the interval/timeout — copy this pattern exactly for CopyButton's setTimeout reset.

**top-bar.tsx visual styling reference** (lines 28–34):
```tsx
<button
  className="topbar-btn"
  onClick={toggle}
  aria-label="Open command palette"
>
  <span className="topbar-cmd-key" aria-hidden="true">⌘</span>K
</button>
```

`.topbar-btn` definition (`app/globals.css` lines 281–301):
```css
.topbar-btn {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.topbar-btn:hover {
  border-color: var(--border-hi);
  color: var(--text);
}
```

**Apply to CopyButton:**
- File header: `"use client";` blank-line then imports (mirrors live-clock).
- Hooks: `const [copied, setCopied] = useState(false);` + a `useEffect` cleanup-on-unmount for the timeout (or use a ref to clear on re-click).
- onClick handler: `await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500);`.
- Render `<button type="button">` (always include `type="button"` — there are forms nowhere on the page, but it's defensive against accidental form-submit semantics).
- ARIA live region: `<span role="status" aria-live="polite" className="sr-only">{copied ? "Copied to clipboard" : ""}</span>` — `.sr-only` is already defined `app/globals.css` lines 202–212; reuse the class verbatim.
- CSS: `.copy-button` mirrors `.topbar-btn`; add `.copy-button--icon` icon-only variant for shipped-view; `.copy-button--confirmed` for accent-text state.

---

### `app/components/views/about-view.tsx` (view RSC, request-response)

**Analog:** `app/components/shell/sidebar.tsx` (closest list-renderer with typed data + ROUTES iteration; note: it carries `"use client"` because it uses `useSelectedLayoutSegment`, but the iteration shape is the closest in repo) + `app/not-found.tsx` (pure RSC list-renderer).

**not-found.tsx RSC list-render pattern** (lines 1–35):
```tsx
// NO "use client" — RSC 404 (Next.js auto-returns HTTP 404 for this file)
// Pathname displayed via a tiny client child using usePathname() — see D-17
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { NotFoundPathname } from "@/app/components/not-found-pathname";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="prompt-line">
        <span className="prompt-dollar">$</span>
        <span className="prompt-cmd">
          ls -la <NotFoundPathname />
        </span>
      </div>

      <p className="not-found-error">
        ls: cannot access &apos;<NotFoundPathname />&apos;: No such file or directory
      </p>

      <p className="not-found-hint">Available files:</p>

      <ul className="not-found-routes">
        {ROUTES.map((r) => (
          <li key={r.pathname}>
            <Link href={r.pathname} className="not-found-link">
              {r.label}
            </Link>
            <span className="not-found-route-desc"> — {r.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Excerpts to copy:**
- Line 1: explicit `// NO "use client" — RSC <kind>` comment header. Reuse for every view file (kind = "view").
- Line 7: **named function** (`export function AboutView`), but views use **named exports** (not default exports — default is reserved for Next.js convention files like `page.tsx`).
- Lines 24–33: pattern for iterating a typed array with `.map((item) => (...))`, using `key={item.<stable-id>}`, and emitting `<li>` rows. Copy verbatim for projects-list, experience-list, writing-list, shipped-list.
- ARIA-friendly markup: semantic `<ul>`, plain `<p>` for prose, `&apos;` for HTML-escaped apostrophes.

**Apply to about-view (and all 7 views):**
```tsx
// NO "use client" — RSC view body (Pitfall 9 / SHELL-02)
// CSS: .about-h1, .about-role, .about-meta, .about-para, .about-cards, .about-card,
//      .about-card-value, .about-card-label, .about-cta-row (executor adds to globals.css)

import { ExternalLink } from "@/app/components/primitives/external-link";
import type { Profile } from "@/lib/types";

interface AboutViewProps {
  profile: Profile;
}

export function AboutView({ profile }: AboutViewProps) {
  return (
    <>
      <h1 className="about-h1">{profile.name}</h1>
      <div className="about-role">// {profile.role}</div>
      <div className="about-meta">{profile.location}</div>
      {profile.bio.long.map((para, i) => (
        <p key={i} className="about-para">{para}</p>
      ))}
      <div className="about-cards">
        {profile.highlights.map((h, i) => (
          <div key={i} className="about-card">
            <div className="about-card-value">{h.value}</div>
            <div className="about-card-label">{h.label}</div>
          </div>
        ))}
      </div>
      <div className="about-cta-row">
        <a
          className="btn"
          href={profile.resumeUrl}
          download="Bakytbek_Tatibekov_Resume.pdf"
          aria-label="Download resume"
        >
          ↓ resume.pdf
        </a>
        {profile.socials.map((s) => (
          <ExternalLink
            key={s.kind}
            href={s.url}
            className="btn-ghost"
            aria-label={`Open ${s.label} (opens in new tab)`}
          >
            {s.label.toLowerCase()}/
          </ExternalLink>
        ))}
      </div>
    </>
  );
}
```

---

### `app/components/views/projects-view.tsx` (view RSC)

**Analog:** `app/not-found.tsx` (list iteration) + UI-SPEC §V2.

**Empty-state branch** mirrors not-found's branch-then-list shape but with a length check:

```tsx
import { TechChip } from "@/app/components/primitives/tech-chip";
import { ExternalLink } from "@/app/components/primitives/external-link";
import type { Project } from "@/lib/types";

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  if (projects.length === 0) {
    return <div className="empty-state">total 0 · (no projects committed yet)</div>;
  }

  const sorted = [...projects].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <>
      <div className="projects-subhead">total {sorted.length} · sorted by year desc</div>
      <ul className="projects-list">
        {sorted.map((p, i) => (
          <li key={p.name}>
            <ExternalLink
              href={p.link}
              className="projects-row"
              showGlyph={false}
              aria-label={`${p.name}: ${p.summary} (opens in new tab)`}
            >
              <span className="projects-row-index">{String(i + 1).padStart(2, "0")}.</span>
              <div>
                <div className="projects-row-name">{p.name}</div>
                <div className="projects-row-summary">{p.summary}</div>
                <div className="projects-row-chips">
                  {p.tech.map((t) => <TechChip key={t}>{t}</TechChip>)}
                </div>
              </div>
              <div className="projects-row-meta">
                <div className="projects-row-year">{p.year}</div>
                <div className="projects-row-status">{p.status}</div>
                <div className="projects-row-role">{p.role}</div>
              </div>
            </ExternalLink>
          </li>
        ))}
      </ul>
    </>
  );
}
```

Same template applies (with view-specific class names and types) to `stack-view.tsx`, `experience-view.tsx`, `writing-view.tsx`, `contact-view.tsx`, `shipped-view.tsx`. Per-view nuances (JSON syntax-highlight, mailto, store-badge composition) are spelled out in UI-SPEC §V3..V7.

---

### `app/(terminal)/<route>/page.tsx` modifications (page server thin wrapper)

**Analog:** `app/(terminal)/projects/page.tsx` (current Phase 2 stub — file shape is identical to the target Phase 3 shape, only the body changes).

**Existing stub** (full file, lines 1–16):
```tsx
// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "projects/ — Bakytbek Tatibekov"
};

export default function ProjectsPage() {
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
```

**Apply (Phase 3 enriched shape — RESEARCH §"Pattern 1" + §"Pattern 2"):**
```tsx
// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { ProjectsView } from "@/app/components/views/projects-view";

const route = ROUTES[1]; // projects

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView projects={projects} />
    </>
  );
}
```

**Excerpts to copy across all 7 page files:**
- Line 1 comment header: `// NO "use client" — RSC route page (Phase 3)`.
- Import order (CONVENTIONS.md §"Import Organization"):
  1. Type-only imports first: `import type { Metadata } from "next";`
  2. External package imports (none after type imports here, since `next` already covered)
  3. Internal aliased imports via `@/`: `ROUTES`, `getX`, `PromptLine`, `<View>`. Multi-name imports sorted alphabetically.
- `const route = ROUTES[<index>]` — pin the route by index using the order locked in `lib/routes.ts` (about=0, projects=1, stack=2, experience=3, writing=4, contact=5, shipped=6).
- `metadata: Metadata` is **named export**; the page function is **default export** (Next.js framework convention — see CONVENTIONS.md §"Module Design").
- `export default async function <Name>Page()` — async because `await getX()` is the body. Existing stubs are sync; Phase 3 makes them async.
- Body shape: fragment `<>...</>` with `<PromptLine cmd="..." />` first, then `<View ... />`. Prompt strings are LOCKED (CONTEXT D-03 / Phase 2 D-13 carry-forward) — DO NOT change them.
- For about-view: `getProfile()` returns `Profile` (singular), not an array — pass as `<AboutView profile={profile} />`.
- For contact-view: also `getProfile()`.
- The `.stub-body` class definition can be deleted from `app/globals.css` (lines 665–674) in the same commit that removes its last consumer (Phase 2 brownfield-discipline rule from CLAUDE.md).

---

### `app/(terminal)/<route>/page.test.tsx` (NEW — TEST-05 smoke)

**Analog:** `app/components/shell/sidebar.test.tsx` (RTL + `vi.mock("next/navigation")` + ROUTES iteration + accessibility-first queries) + `app/sitemap.test.tsx` (asserts function-default-export properties — closest analog for "test page module exports").

**sidebar.test.tsx file-shape excerpt** (lines 1–32):
```tsx
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./sidebar";
import { ROUTES } from "@/lib/routes";

/* Mock next/navigation — inject "projects" as the active segment */
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "projects"),
  useRouter: () => ({ push: vi.fn() })
}));

describe("Sidebar", () => {
  test("renders <nav> with accessible label 'File explorer'", () => {
    render(<Sidebar uptime="8y 125d" />);
    expect(
      screen.getByRole("navigation", { name: /file explorer/i })
    ).toBeInTheDocument();
  });

  test("renders 7 file rows from ROUTES with correct aria-label", () => {
    render(<Sidebar uptime="8y 125d" />);
    ROUTES.forEach((route) => {
      expect(
        screen.getByRole("button", { name: route.ariaLabel })
      ).toBeInTheDocument();
    });
  });

  test("active row has aria-current='page' (segment='projects' → Projects row active)", () => {
    render(<Sidebar uptime="8y 125d" />);
    const activeBtn = screen.getByRole("button", { name: "Projects" });
    expect(activeBtn).toHaveAttribute("aria-current", "page");
  });
});
```

**sitemap.test.tsx export-assertion pattern** (lines 1–10):
```tsx
import sitemap from "./sitemap";
import { ROUTES } from "@/lib/routes";

describe("sitemap", () => {
  test("returns an array with the same length as ROUTES", () => {
    const result = sitemap();
    expect(result).toHaveLength(ROUTES.length);
  });
  // ...
});
```

**Excerpts to copy:**
- `import { render, screen } from "@testing-library/react";` — standard import for RTL tests.
- No `import { describe, test, expect, vi } from "vitest";` — `vitest.config.ts` sets `globals: true`, so these are ambient (verified: 0 of the existing test files import them).
- Import the page module's default export via plain `import Page from "./page";` (the test file lives next to the page).
- `vi.mock("next/navigation", () => ({ ... }))` is the standard mock pattern; for page tests that don't use navigation hooks, the mock can be omitted, but for views that use `useSelectedLayoutSegment` it is required.
- Accessibility-first queries: `screen.getByRole("...")` + `{ name: /.../i }` (regex case-insensitive). `getByText` for plain prose. `container.querySelector(".class")` only when role/text isn't accessible (see breadcrumb.test.tsx line 24 for the only legitimate use of `.class` queries — the prompt-line `$` token).
- Setup file: `vitest.setup.ts` already polyfills ResizeObserver, scrollIntoView, matchMedia, localStorage clear (no Phase 3 changes needed).

**Apply to per-view smoke specs (TEST-05, CONTEXT D-18):**

```tsx
import { render, screen } from "@testing-library/react";
import ProjectsPage, { metadata } from "./page";

/* Mock next/navigation — Phase 3 view rendering does not depend on navigation hooks,
   but page.tsx imports ProjectsView which (transitively) does not — so this mock is
   defensive for any future client-island that might leak in. */
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => "projects"),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects"
}));

describe("ProjectsPage", () => {
  test("renders without throwing", async () => {
    const ui = await ProjectsPage();
    render(ui);
  });

  test("metadata.title is the locked Phase 2 string", () => {
    expect(metadata.title).toBe("projects/ — Bakytbek Tatibekov");
  });

  test("body contains the locked prompt-line text 'ls -la projects/'", async () => {
    const ui = await ProjectsPage();
    render(ui);
    expect(screen.getByText("ls -la projects/")).toBeInTheDocument();
  });
});
```

**Note on async page modules:** Phase 3 page components are `async function` (RSC data-fetching). RTL renders the awaited result: `const ui = await ProjectsPage(); render(ui);`. This matches `await getX()` → `<View ... />` flow with the silent-fallback in `lib/api.ts` returning seed data when no backend is reachable in the test environment.

---

### `app/(terminal)/views.test.tsx` (NEW — cross-view title-uniqueness spec)

**Analog:** `app/sitemap.test.tsx` (asserts `result.length === ROUTES.length` — the closest existing cross-route assertion).

**Apply (one-of-N planner approaches):**
```tsx
import { metadata as aboutMeta } from "./page";
import { metadata as projectsMeta } from "./projects/page";
import { metadata as stackMeta } from "./stack/page";
import { metadata as experienceMeta } from "./experience/page";
import { metadata as writingMeta } from "./writing/page";
import { metadata as contactMeta } from "./contact/page";
import { metadata as shippedMeta } from "./shipped/page";

describe("Phase 3 per-view metadata uniqueness", () => {
  test("all 7 view titles are unique", () => {
    const titles = [
      aboutMeta.title,
      projectsMeta.title,
      stackMeta.title,
      experienceMeta.title,
      writingMeta.title,
      contactMeta.title,
      shippedMeta.title
    ];
    expect(new Set(titles).size).toBe(7);
  });

  test("all 7 canonical paths are unique", () => {
    const canonicals = [
      aboutMeta.alternates?.canonical,
      projectsMeta.alternates?.canonical,
      // ... etc
    ];
    expect(new Set(canonicals).size).toBe(7);
  });
});
```

This satisfies CONTEXT D-18 cross-view assertion (`Set(allTitles).size === 7`).

---

### `app/globals.css` extension (CSS append)

**Analog:** existing globals.css sections — every existing block uses the same dividing-comment pattern.

**Section divider pattern** (`app/globals.css` lines 214–217, 234–237, 247–250, 348–351, 489–492, 537–540, 665–668, 676–679):
```css
/* ─────────────────────────────────────────
   <Section name> (<requirement-id> — <plan-or-phase ref>)
   ───────────────────────────────────────── */

.section-class { ... }
```

**Excerpts to copy:**
- Section dividers use `/* ───── ... ───── */` U+2500 box-drawing horizontal lines (3 dashes wide on top + 3 dashes wide on bottom).
- Section titles include a parenthetical `(REQUIREMENT-ID — Plan NN)` reference; Phase 3 sections should reference `(VIEW-01 — Phase 3)` etc.
- Class naming: kebab-case, lowercase, hyphenated. BEM-lite is used for variants (e.g. `.sb-item--active`, `.traffic-dot--red`, `.breadcrumb-hint--visible`).
- Append-only convention: new sections go at the **bottom of the file** (after the most-recent existing section). Existing order is roughly *foundation → topbar → sidebar → breadcrumb → palette → stub-body → not-found*. Phase 3 appends after `.not-found-route-desc` (line 718).
- Order within each Phase 3 section follows the order primitives are declared in UI-SPEC: `tech-chip`, `kbd`, `external-link` (inherits `a`), `copy-button`, `store-badge` first; then per-view sections about → projects → stack → experience → writing → contact → shipped.
- Reuse Phase 2 token names verbatim — DO NOT introduce new color, spacing, or typography tokens (UI-SPEC §"Color" + §"Typography").

**Apply (skeleton — executor fills selectors per UI-SPEC):**
```css
/* ─────────────────────────────────────────
   View primitives (Phase 3 — VIEW-08, SEO-05)
   ───────────────────────────────────────── */

.tech-chip { ... }
.kbd { ... }
.copy-button { ... }
.copy-button--icon { ... }
.copy-button--confirmed { ... }
.store-badge-link { ... }

/* ─────────────────────────────────────────
   About view (Phase 3 — VIEW-01)
   ───────────────────────────────────────── */

.terminal-main h1 { ... }
.about-role { ... }
.about-meta { ... }
.about-para { ... }
.about-cards { ... }
.about-card { ... }
.about-card-value { ... }
.about-card-label { ... }
.about-cta-row { ... }
.btn { ... }
.btn-ghost { ... }

/* (repeat per view: projects, stack, experience, writing, contact, shipped) */

/* ─────────────────────────────────────────
   Empty state (shared — Phase 3 D-03)
   ───────────────────────────────────────── */

.empty-state { ... }
```

---

## Shared Patterns

### Authentication / Authorization
**Not applicable** — Phase 3 is an unauthenticated frontend; no guards, middleware, or auth boundaries exist. Skip section.

### RSC vs Client Boundary Discipline (Pitfall 9)
**Source:** every existing component file in `app/components/`.
**Apply to:** every Phase 3 file.

| Pattern | Where to copy from |
|---------|--------------------|
| `// NO "use client" — RSC <kind>` header comment | `app/components/primitives/prompt-line.tsx` line 1, `app/(terminal)/projects/page.tsx` line 1, `app/(terminal)/layout.tsx` line 1, `app/not-found.tsx` line 1 |
| `"use client";` first line + blank line + imports | `app/components/shell/live-clock.tsx` lines 1–3, `app/components/shell/top-bar.tsx` lines 1–6 |

Phase 3 introduces exactly **one** `"use client"` file: `copy-button.tsx`. Every other new file MUST carry the `// NO "use client" — RSC <kind>` header comment.

### Error Handling
**Source:** `lib/api.ts` lines 25–35.
**Apply to:** views are pure render — they do NOT handle errors directly. Data-fetcher silent-fallback is the chokepoint:
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
Phase 3 view components receive typed data as props; they do not wrap calls in try/catch. The `if (array.length === 0) return <div className="empty-state">...</div>;` early return (CONTEXT D-02 / D-03) replaces what a more defensive codebase would do with error boundaries.

### Validation
**Not applicable in Phase 3** — Phase 6 / BACKEND-04 will add zod schema validation to the silent-fallback chokepoint per the comment in `lib/api.ts` lines 21–24. Phase 3 trusts the typed `Profile`, `Project[]`, etc. shapes.

### Logging
**Not applicable** — CONVENTIONS.md §"Logging" confirms zero `console.*` calls in source. Phase 3 introduces none.

### Import Organization (CONVENTIONS.md §"Import Organization")
**Apply to:** every Phase 3 file.

```ts
// 1. Type-only imports first
import type { Metadata } from "next";
import type { Project } from "@/lib/types";

// 2. External package imports
import { Fragment } from "react";

// 3. Internal aliased imports (@/) — alphabetical within a group
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { ProjectsView } from "@/app/components/views/projects-view";
import { TechChip } from "@/app/components/primitives/tech-chip";
import { ExternalLink } from "@/app/components/primitives/external-link";

// 4. Sibling relative imports (./...) — only for primitives importing each other within the same dir
```

Source: `lib/api.ts` (type-only first), `app/(terminal)/layout.tsx` (alphabetical aliased). All new files MUST use `@/` aliases for cross-directory imports; **never use `../` parent-traversal** (verified: zero `../` imports in the entire codebase).

### Naming Conventions
**Source:** CONVENTIONS.md + STRUCTURE.md.
**Apply to:** every Phase 3 file.

| Identifier | Rule | Example |
|------------|------|---------|
| Filenames | kebab-case | `external-link.tsx`, `about-view.tsx`, `copy-button.tsx`, `views.test.tsx` |
| Test filenames | `<source>.test.tsx` co-located | `page.test.tsx` next to `page.tsx` |
| Component name | PascalCase | `ExternalLink`, `AboutView`, `CopyButton` |
| Prop interface | `<ComponentName>Props` | `ExternalLinkProps`, `CopyButtonProps` |
| Function declarations | `export function <Name>(...)` | named function, named export (NOT arrow assigned to const, NOT default export — except for Next.js convention files like page.tsx where default IS required) |
| Module-level constants | `UPPER_SNAKE_CASE` for primitives like `STORAGE_KEY`; **already-cased** for typed datasets like `ROUTES`, `PROFILE`, `STACK` (cf. `lib/portfolio-data.ts`) | Phase 3 introduces no new module-level constants per CONTEXT §"Established Patterns" |
| Local variables | camelCase | `route`, `projects`, `sorted`, `stackJsonString` |

### Test Patterns (TEST-05)
**Source:** `app/components/shell/sidebar.test.tsx`, `app/sitemap.test.tsx`, `app/components/shell/breadcrumb.test.tsx`, `app/components/shell/live-clock.test.tsx`, `app/components/shell/command-palette.test.tsx`.
**Apply to:** Phase 3 8 test files.

Cross-cutting test conventions verified across all existing test files:
- Globals enabled (`vitest.config.ts` line 14: `globals: true`); do NOT import `describe / test / expect / vi`.
- `import { render, screen } from "@testing-library/react";` at top.
- `vi.mock("next/navigation", () => ({...}))` at module level (above `describe`) for components that consume routing hooks.
- Tests use `screen.getByRole(role, { name: /pattern/i })` — accessibility-first queries.
- jest-dom matchers (`toBeInTheDocument`, `toHaveAttribute`) auto-loaded via `vitest.setup.ts` line 1.
- Async tests use `await user.keyboard(...)` / `waitFor(...)` from `@testing-library/user-event` (already a dep — `package.json` `^14.6.1`); CopyButton test for clipboard click can use `userEvent.setup()` + `await user.click(...)`.
- `localStorage.clear()` runs `beforeEach` automatically (`vitest.setup.ts` line 39); no per-test cleanup needed.

### Empty-State Discipline (CONTEXT D-02, D-03)
**Source:** new — Phase 3 introduces this convention; no existing analog.
**Apply to:** projects-view, experience-view, writing-view, shipped-view.

```tsx
if (items.length === 0) {
  return <div className="empty-state">{LOCKED_EMPTY_STRING}</div>;
}
```

LOCKED strings (CONTEXT D-03 — copy verbatim, no improvisation):
- `/projects` → `total 0 · (no projects committed yet)`
- `/experience` → `(no commits to experience.log yet)`
- `/writing` → `// no posts yet — follow github.com/beckinfonet for code-as-content.`
- `/shipped` → `total 0 · (no apps shipped to stores yet)`

About-view, stack-view, contact-view: no empty-state branch (PROFILE + STACK are real per `lib/portfolio-data.ts`).

### CSS Token Reuse
**Source:** `app/globals.css` lines 7–82 (token definitions).
**Apply to:** every new CSS rule.

Phase 3 introduces ZERO new tokens. Use only:
- Surfaces: `--bg`, `--bg-raised`, `--panel`, `--panel-hi`
- Borders: `--border`, `--border-hi`
- Text: `--text`, `--text-hi`, `--muted`, `--muted-hi`
- Accents: `--accent`, `--accent-dim`, `--accent-bg`
- Semantic: `--warn` (used by stack-view JSON keys, projects-row status, experience-row hex-hash, shipped-row status)
- `--red` and `--blue` are NOT used in Phase 3 (UI-SPEC §"Semantic colors used in Phase 3").

---

## No Analog Found

Files with no close existing match — the planner should reference UI-SPEC + RESEARCH patterns directly:

| File | Role | Reason |
|------|------|--------|
| `app/components/views/stack-view.tsx` (JSON syntax-highlight) | view RSC w/ inline `Fragment + spans` | No hand-rolled syntax-highlight precedent in repo; UI-SPEC §V3 lines 482–504 + handoff `app.jsx` lines 367–388 are canonical. |
| `app/components/primitives/store-badge.tsx` (inline SVG) | RSC w/ inline `<svg>` | No inline-SVG components in repo. The accent-bootstrap-script.tsx pattern is the closest (module-level constant + thin component) but the asset content is novel. SVG MUST come from official Apple + Google sources during plan-phase research per CONTEXT D-13. |

Both files should still follow all the cross-cutting patterns (RSC header comment, named function + named export, prop interface above component, kebab-case filename, etc.) — only the *body* is novel.

---

## Metadata

**Analog search scope:** `app/`, `lib/`, `app/components/primitives/`, `app/components/shell/`, `app/(terminal)/`.
**Files scanned:** 24 source files + 1 globals.css.
**Pattern extraction date:** 2026-05-06.

---

## PATTERN MAPPING COMPLETE

**Phase:** 3 — Views
**Files classified:** 24 (5 primitives, 7 view RSCs, 7 page modifications, 8 tests, 1 CSS append)
**Analogs found:** 24 / 24 (every file has a role-match analog already in the repo)

### Coverage
- Files with exact analog: 17 (all 7 page wrappers, all 8 tests, prompt-line-shaped primitives, globals.css append)
- Files with role-match analog: 7 (5 view RSCs, copy-button client island, store-badge SVG primitive)
- Files with no analog: 0 (every file has at least a partial analog; the *content* of stack-view's syntax highlight and store-badge's SVG is novel but the *file shape* mirrors existing primitives)

### Key Patterns Identified
- **RSC discipline is enforced via header comment.** Every existing RSC carries `// NO "use client" — RSC <kind>` line 1. Every existing client island starts with `"use client";` line 1, blank line, imports. Phase 3 introduces exactly **one** new client island (`copy-button.tsx`).
- **Page = thin async wrapper, View = pure RSC presentation, Data = `lib/api.ts` silent-fallback.** Pattern is already present in shape in the Phase 2 stubs (`app/(terminal)/<route>/page.tsx`); Phase 3 just enriches the body and adds `description` + `alternates.canonical` to the metadata export. `const route = ROUTES[<index>];` pins the route to `lib/routes.ts` as single source of truth.
- **Shared CSS append discipline.** All view styling lands in `app/globals.css` appended to the bottom, with `/* ──── ... ──── */` U+2500 dividers and `(REQUIREMENT-ID — Phase NN)` parenthetical refs. New BEM-lite variant classes use `.parent--variant` (e.g. `.copy-button--icon`).
- **Tests use accessibility-first queries + globals-enabled vitest.** No `import { describe ... } from "vitest"`; rely on `globals: true` in `vitest.config.ts`. `vi.mock("next/navigation", () => ({...}))` is the standard hook-mocking pattern. Smoke tests render the page module's default export (awaiting it for async pages) and assert `metadata.title` + prompt-line text.
- **Import grouping is consistent across files.** Type imports first (`import type { ... }`), external packages second (`import { ... } from "next" / "react"`), internal `@/`-aliased third (alphabetical), sibling relative last. Never `../` parent-traversal.
- **Empty-state handling is a single-line early return.** `if (items.length === 0) return <div className="empty-state">LOCKED_STRING</div>;` per CONTEXT D-03. Strings are LOCKED — copy verbatim.
- **`<ExternalLink>` is the SEO-05 enforcement primitive.** Direct `target="_blank"` in view files is forbidden; the planner must verify with `grep -rE 'target="_blank"' app/components/views/` returning zero matches.

### File Created
`/Users/beckmaldinVL/development/personal-portfolio/portfolio-web/.planning/phases/03-views/03-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can now reference these analog patterns + concrete excerpts in PLAN.md files for the 5 waves outlined in CONTEXT D-19. Wave 1 (primitives + CSS) and Wave 2 (about-view vertical slice) can start immediately; Wave 3 (parallel views) reuses the projects-view template; Wave 4 (metadata enrichment) is a 7-file mechanical edit; Wave 5 (TEST-05) reuses the `sidebar.test.tsx` + `sitemap.test.tsx` patterns.
