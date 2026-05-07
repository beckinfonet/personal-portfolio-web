# Phase 4: Mobile-Responsive — Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 19 (9 new + 10 modified)
**Analogs found:** 19 / 19

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/components/shell/explorer-drawer.tsx` | client island | request-response (navigation) | `app/components/shell/command-palette.tsx` | exact |
| `app/components/shell/explorer-drawer.test.tsx` | test | — | `app/components/shell/command-palette.test.tsx` | exact |
| `app/components/shell/status-block.tsx` | RSC primitive | transform (prop → render) | `app/components/primitives/external-link.tsx` | role-match |
| `app/components/shell/status-block.test.tsx` | test | — | `app/components/primitives/copy-button.test.tsx` | role-match |
| `app/components/print-footer.tsx` | RSC primitive | transform (env → render) | `app/components/primitives/external-link.tsx` | role-match |
| `app/components/print-footer.test.tsx` | test | — | `app/components/primitives/copy-button.test.tsx` | role-match |
| `scripts/check-sidebar-redistribution.mjs` | audit script | file-I/O (grep CSS) | `scripts/check-placeholders.mjs` | exact |
| `scripts/check-print-rules.mjs` | audit script | file-I/O (grep CSS) | `scripts/check-placeholders.mjs` | exact |
| `scripts/check-mobile-palette-css.mjs` | audit script | file-I/O (grep CSS) | `scripts/check-placeholders.mjs` | exact |
| `app/components/shell/top-bar.tsx` | client island (modify) | request-response | `app/components/shell/command-palette.tsx` (trigger pattern) | exact |
| `app/components/shell/shell-state-provider.tsx` | context provider (modify) | event-driven | self (add drawer slice following palette slice pattern) | exact |
| `app/components/shell/sidebar.tsx` | client island (modify) | request-response | self (extract STATUS to `<StatusBlock />`) | exact |
| `app/components/views/about-view.tsx` | RSC view (modify) | transform | self (append mobile STATUS mount) | exact |
| `app/(terminal)/layout.tsx` | RSC layout (modify) | transform | self (mount sibling components) | exact |
| `app/globals.css` | CSS (append) | — | self (follow existing `@media` block pattern at lines 152, 338, 343) | exact |
| `app/components/shell/sidebar.test.tsx` | test (modify) | — | self (update STATUS assertion to `<StatusBlock />`) | exact |
| `app/components/shell/top-bar.test.tsx` | test (modify) | — | `app/components/shell/top-bar.test.tsx` (self + palette test pattern) | exact |
| `app/components/shell/command-palette.test.tsx` | test (modify) | — | self (add mobile-toggle assertion) | exact |
| `app/components/views/about-view.test.tsx` | test (new) | — | `app/components/shell/sidebar.test.tsx` | role-match |

---

## Pattern Assignments

### `app/components/shell/explorer-drawer.tsx` (client island, navigation)

**Analog:** `app/components/shell/command-palette.tsx`

**Imports pattern** (command-palette.tsx lines 1–9):
```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDrawer } from "@/app/components/shell/shell-state-provider"; // NEW — mirror usePalette
import { ROUTES } from "@/lib/routes";
import { PROFILE } from "@/lib/portfolio-data";
```

**State + trigger capture pattern** (command-palette.tsx lines 17–44):
```typescript
const { open, setOpen } = useDrawer();       // mirror: const { open, setOpen } = usePalette();
const triggerRef = useRef<HTMLElement | null>(null);

// Capture focus origin when opening, restore on close (PALETTE-04 / A11Y-08)
// In ExplorerDrawer: triggerRef is pre-known (the hamburger button); use a stable ref
// instead of capturing from document.activeElement.
const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

useEffect(() => {
  if (!open && triggerButtonRef.current) {
    triggerButtonRef.current.focus();  // restore focus on close
  }
}, [open]);
```

**Esc key + focus-trap pattern** (adapt from command-palette.tsx lines 24–37):
```typescript
// Esc dismisses the drawer (A11Y-08 keyboard parity with palette)
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [open, setOpen]);

// Focus trap — hand-rolled, no new dep (~30 lines):
// On open: move focus into sheet (first file row)
// On Tab at last focusable: wrap to first
// On Shift+Tab at first focusable: wrap to last
useEffect(() => {
  if (!open) return;
  const sheet = sheetRef.current;
  if (!sheet) return;
  const focusable = sheet.querySelectorAll<HTMLElement>(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length > 0) focusable[0].focus();

  const onTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  window.addEventListener("keydown", onTab);
  return () => window.removeEventListener("keydown", onTab);
}, [open]);
```

**Active route derivation** (sidebar.tsx lines 23–29):
```typescript
import { useSelectedLayoutSegment } from "next/navigation";
const segment = useSelectedLayoutSegment();
const isActive = (slug: string | null) => segment === slug;
```

**File-row render pattern** (sidebar.tsx lines 57–71 — copy verbatim, change padding class):
```typescript
{ROUTES.map((route) => (
  <button
    key={route.pathname}
    className={`sb-item drawer-file-row${isActive(route.slug) ? " sb-item--active" : ""}`}
    aria-label={route.ariaLabel}
    aria-current={isActive(route.slug) ? "page" : undefined}
    onClick={() => {
      setOpen(false);          // close drawer before navigation (D-06)
      router.push(route.pathname);
    }}
  >
    <span className="sb-icon" aria-hidden="true">{ROUTE_ICONS[route.label] ?? "▸"}</span>
    <span className="sb-label">{route.label}</span>
  </button>
))}
```

**Recruiter card pattern** (sidebar.tsx lines 73–84 — copy verbatim):
```typescript
<div className="sb-download">
  <div className="sb-download-header">For recruiters</div>
  <a
    className="sb-download-btn"
    href={PROFILE.resumeUrl}
    download="Bakytbek_Tatibekov_Resume.pdf"
    aria-label="Download resume"
  >
    ↓ resume.pdf
  </a>
</div>
```

**Dialog / ARIA semantics** (04-UI-SPEC.md §Surfaces 1):
```tsx
// Sheet wrapper — dialog role per A11Y-04/05
<div
  ref={sheetRef}
  id="explorer-drawer-sheet"
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-title"
  className={`drawer-sheet${open ? " drawer-sheet--open" : ""}`}
  data-state={open ? "open" : "closed"}
>
  <h2 id="drawer-title" className="sr-only">File explorer</h2>
  {/* ... content ... */}
</div>

// Backdrop — aria-hidden, click closes
<div
  className="drawer-backdrop"
  aria-hidden="true"
  onClick={() => setOpen(false)}
/>
```

**Effect cleanup pattern** (copy-button.tsx lines 31–38 — for any timer/event cleanup):
```typescript
useEffect(() => {
  return () => {
    // cleanup: remove event listeners
  };
}, []);
```

---

### `app/components/shell/explorer-drawer.test.tsx` (test)

**Analog:** `app/components/shell/command-palette.test.tsx`

**Test file structure** (command-palette.test.tsx lines 1–16):
```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExplorerDrawer } from "./explorer-drawer";
import { ShellStateProvider } from "./shell-state-provider";

vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => null),
  useRouter: () => ({ push: vi.fn() })
}));

function Providers({ children }: { children: React.ReactNode }) {
  return <ShellStateProvider>{children}</ShellStateProvider>;
}
```

**Test cases to implement** (adapt from command-palette.test.tsx):
```typescript
describe("ExplorerDrawer", () => {
  // 1. Closed by default — no dialog in DOM
  //    Pattern: screen.queryByRole("dialog") → not.toBeInTheDocument()

  // 2. Opens on hamburger button click
  //    Pattern: await user.click(screen.getByRole("button", { name: /open file explorer/i }))
  //    → screen.getByRole("dialog") toBeInTheDocument()

  // 3. Closes on file-row click
  //    Pattern: click a sb-item button → screen.queryByRole("dialog") not.toBeInTheDocument()

  // 4. Esc key closes the drawer (mirror palette test lines 63–72)
  //    Pattern: open → user.keyboard("{Escape}") → queryByRole("dialog") not.toBeInTheDocument()

  // 5. Focus restores to ☰ trigger on close
  //    Pattern: open → close → expect(screen.getByRole("button", { name: /open file explorer/i })).toHaveFocus()

  // 6. aria-modal + role="dialog" present when open
  //    Pattern: screen.getByRole("dialog") → .toHaveAttribute("aria-modal", "true")

  // 7. aria-expanded toggles on trigger button
  //    Pattern: triggerBtn.getAttribute("aria-expanded") === "false" before open,
  //             "true" after open — mirrors palette trigger contract
});
```

---

### `app/components/shell/status-block.tsx` (RSC primitive)

**Analog:** `app/components/primitives/external-link.tsx`

**RSC primitive pattern** (external-link.tsx lines 1–36):
```typescript
// NO "use client" — RSC primitive (RSC-first per SHELL-02)
// Shared by app/components/shell/sidebar.tsx and app/components/views/about-view.tsx

interface StatusBlockProps {
  uptime: string;  // pre-computed by layout RSC via formatUptime()
  tz: string;      // computed client-side; pass as prop OR delegate to <StatusTz /> client child
}

export function StatusBlock({ uptime, tz }: StatusBlockProps) {
  return (
    <>
      <div className="sb-section-header sb-status-header">STATUS</div>
      <div className="sb-status">
        {/* ... 3 rows: availability, uptime, tz ... */}
      </div>
    </>
  );
}
```

**STATUS markup to extract** (sidebar.tsx lines 86–101 — copy verbatim into StatusBlock):
```tsx
<div className="sb-section-header sb-status-header">STATUS</div>
<div className="sb-status">
  <div className="sb-status-row">
    <span className="sb-status-dot" aria-hidden="true">●</span>
    <span>Available for hire</span>
  </div>
  <div className="sb-status-row">
    <span className="sb-status-key">uptime:</span>
    <span>{uptime}</span>
  </div>
  <div className="sb-status-row">
    <span className="sb-status-key">tz:</span>
    <span>{tz}</span>
  </div>
</div>
```

**tz computation** (sidebar.tsx lines 31–43 — for either a client child `<StatusTz />` or passing as prop from Sidebar):
```typescript
const tz = (() => {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!resolved) return "GMT+5 (flex)";
    const offset = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+5 (flex)";
    return `${offset} (flex)`;
  } catch {
    return "GMT+5 (flex)";
  }
})();
```

Note: If `StatusBlock` is RSC, `tz` must be a prop. Sidebar.tsx is already a client component and can compute `tz` inline before passing it. `AboutView` is RSC and cannot compute `tz` — it needs either a `<StatusTz />` client child or a wrapper. Recommendation from UI-SPEC: keep `StatusBlock` RSC, add a `<StatusTz />` 3-line client child that computes and renders the tz value in the third row.

---

### `app/components/shell/status-block.test.tsx` (test)

**Analog:** `app/components/primitives/copy-button.test.tsx` (simple, no provider needed)

**Test file structure** (copy-button.test.tsx lines 1–2):
```typescript
import { render, screen } from "@testing-library/react";
import { StatusBlock } from "./status-block";

describe("StatusBlock", () => {
  test("renders 'Available for hire' availability row", () => {
    render(<StatusBlock uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
  });

  test("renders uptime prop verbatim", () => {
    render(<StatusBlock uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByText("8y 125d")).toBeInTheDocument();
  });

  test("renders tz prop or GMT+5 fallback", () => {
    render(<StatusBlock uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByText("GMT+5 (flex)")).toBeInTheDocument();
  });

  test("renders STATUS section header", () => {
    render(<StatusBlock uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByText("STATUS")).toBeInTheDocument();
  });
});
```

---

### `app/components/print-footer.tsx` (RSC primitive)

**Analog:** `app/components/primitives/external-link.tsx`

**RSC primitive pattern** (external-link.tsx):
```typescript
// NO "use client" — RSC primitive (static content, no interactivity)
// Mounted in app/(terminal)/layout.tsx
// Visible ONLY via @media print rules in app/globals.css (display: none at screen)

interface PrintFooterProps {
  siteUrl: string;   // process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  email: string;     // PROFILE.email
}

export function PrintFooter({ siteUrl, email }: PrintFooterProps) {
  return (
    <aside className="print-footer" aria-hidden="true">
      {siteUrl} · {email}
    </aside>
  );
}
```

**Environment variable defensive pattern** (from `lib/api.ts` and `app/robots.ts`):
```typescript
// Read in the PARENT RSC (layout.tsx), not inside PrintFooter:
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Pass as prop to PrintFooter — keeps the component pure/testable
```

**Mount pattern in layout.tsx** (mirrors CommandPalette mount at layout.tsx line 52):
```tsx
{/* PrintFooter: always in DOM, visible only via @media print */}
<PrintFooter siteUrl={siteUrl} email={PROFILE.email} />
```

---

### `app/components/print-footer.test.tsx` (test)

**Analog:** `app/components/primitives/copy-button.test.tsx` (simple render test, no provider)

```typescript
import { render, screen } from "@testing-library/react";
import { PrintFooter } from "./print-footer";

describe("PrintFooter", () => {
  test("renders site URL and email separated by ·", () => {
    render(<PrintFooter siteUrl="https://bakytbek.dev" email="beckprograms@gmail.com" />);
    const aside = document.querySelector(".print-footer") as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(aside.textContent).toContain("https://bakytbek.dev");
    expect(aside.textContent).toContain("beckprograms@gmail.com");
    expect(aside.textContent).toContain("·");
  });

  test("falls back gracefully with provided localhost URL", () => {
    render(<PrintFooter siteUrl="http://localhost:3000" email="beckprograms@gmail.com" />);
    expect(document.querySelector(".print-footer")?.textContent)
      .toContain("http://localhost:3000");
  });
});
```

---

### `scripts/check-sidebar-redistribution.mjs` (audit script)

**Analog:** `scripts/check-placeholders.mjs`

**Script structure** (check-placeholders.mjs lines 1–59 — copy structure exactly):
```javascript
#!/usr/bin/env node
// scripts/check-sidebar-redistribution.mjs
// Pitfall 7 audit: every sidebar `display: none` in globals.css must be paired
// with a mobile-home rule (drawer or about-view). Implements ROADMAP Phase 4
// success criterion 4.
// Exits 0 on clean, 1 on violation.

import { readFileSync } from "node:fs";

const CSS_FILE = "app/globals.css";
const contents = readFileSync(CSS_FILE, "utf8");

// Assert: .sidebar display:none exists (paired hide rule)
// Assert: .drawer-sheet or .drawer-backdrop exists (rehome proof)
// Assert: .about-status-mobile display:block exists inside @media (max-width: 960px)

const checks = [
  { pattern: /\.sidebar\s*\{[^}]*display:\s*none/, label: "sidebar display:none present" },
  { pattern: /drawer-sheet/, label: "drawer-sheet class present (rehome proof)" },
  { pattern: /about-status-mobile/, label: "about-status-mobile class present (STATUS rehome proof)" }
];

// ... same walk/hits pattern as check-placeholders.mjs ...

console.log("✓ Pitfall 7: sidebar redistribution audit passed");
process.exit(0);
```

**Key pattern:** `readFileSync` on a single CSS source file, regex checks, `process.exit(1)` on failure with error message to `console.error`, `process.exit(0)` on success with `console.log`. No `walk()` needed (single file target).

**Wire into package.json** (follow postbuild pattern — add to `"postbuild"` or as a separate `"check"` script):
```json
"check:mobile": "node scripts/check-sidebar-redistribution.mjs && node scripts/check-print-rules.mjs && node scripts/check-mobile-palette-css.mjs"
```

---

### `scripts/check-print-rules.mjs` (audit script)

**Analog:** `scripts/check-placeholders.mjs`

```javascript
#!/usr/bin/env node
// scripts/check-print-rules.mjs
// A11Y-09 audit: @media print block exists in globals.css and hides required elements.

import { readFileSync } from "node:fs";
const contents = readFileSync("app/globals.css", "utf8");

// Required: @media print block with .topbar, .sidebar, [cmdk-overlay], .print-footer display rules
const checks = [
  { pattern: /@media print/,            label: "@media print block present" },
  { pattern: /\.topbar[^{]*\{[^}]*display:\s*none/, label: ".topbar hidden in print" },
  { pattern: /\.print-footer/,          label: ".print-footer class present" },
  { pattern: /font-family:\s*Georgia/,  label: "serif fallback for print" }
];
// ... same exit pattern ...
```

---

### `scripts/check-mobile-palette-css.mjs` (audit script)

**Analog:** `scripts/check-placeholders.mjs`

```javascript
#!/usr/bin/env node
// scripts/check-mobile-palette-css.mjs
// PALETTE-05 audit: @media (max-width: 960px) block overrides [cmdk-dialog] to bottom-sheet.

import { readFileSync } from "node:fs";
const contents = readFileSync("app/globals.css", "utf8");

const checks = [
  { pattern: /\[cmdk-dialog\][^{]*\{/, label: "[cmdk-dialog] selector present" },
  { pattern: /border-radius:\s*12px 12px 0 0/, label: "bottom-sheet border-radius present" },
  { pattern: /\[cmdk-item\][^{]*padding:\s*14px/, label: "44px touch-target padding on cmdk-item" }
];
// ...
```

---

### `app/components/shell/top-bar.tsx` (modify — insert hamburger trigger)

**Analog:** self (`app/components/shell/top-bar.tsx`)

**Imports to add** (top-bar.tsx line 4 — add drawer hook):
```typescript
import { usePalette, useDrawer } from "@/app/components/shell/shell-state-provider";
```

**Hook usage** (top-bar.tsx line 10 — add alongside usePalette):
```typescript
const { toggle } = usePalette();
const { open: drawerOpen, toggle: toggleDrawer } = useDrawer();
```

**Hamburger button insertion** (insert before traffic dots, leftmost position):
```tsx
{/* Hamburger — visible only at <=960px via CSS (display: none at desktop) */}
<button
  className="topbar-hamburger"
  aria-label="Open file explorer"
  aria-expanded={drawerOpen}
  aria-controls="explorer-drawer-sheet"
  onClick={toggleDrawer}
>
  ☰
</button>
```

**Existing button pattern for consistency** (top-bar.tsx lines 27–33):
```tsx
<button
  className="topbar-btn"
  onClick={toggle}
  aria-label="Open command palette"
>
  <span className="topbar-cmd-key" aria-hidden="true">⌘</span>K
</button>
```

---

### `app/components/shell/shell-state-provider.tsx` (modify — add drawer slice)

**Analog:** self (add `drawerOpen` state following exact palette slice pattern)

**State shape extension** (shell-state-provider.tsx lines 12–15):
```typescript
interface ShellState {
  paletteOpen: boolean;
  drawerOpen: boolean;          // NEW
  accentHue: string;
}
```

**Action types extension** (shell-state-provider.tsx lines 18–22):
```typescript
type ShellAction =
  | { type: "PALETTE_OPEN" }
  | { type: "PALETTE_CLOSE" }
  | { type: "PALETTE_TOGGLE" }
  | { type: "DRAWER_OPEN" }     // NEW
  | { type: "DRAWER_CLOSE" }    // NEW
  | { type: "DRAWER_TOGGLE" }   // NEW
  | { type: "SET_HUE"; hue: string };
```

**Reducer extension** (shell-state-provider.tsx lines 24–32 — add cases with mutual exclusion):
```typescript
case "DRAWER_OPEN":   return { ...state, drawerOpen: true,  paletteOpen: false }; // mutual exclusion
case "DRAWER_CLOSE":  return { ...state, drawerOpen: false };
case "DRAWER_TOGGLE": return { ...state, drawerOpen: !state.drawerOpen, paletteOpen: state.drawerOpen ? state.paletteOpen : false };
// Also add palette mutual exclusion:
case "PALETTE_OPEN":  return { ...state, paletteOpen: true,  drawerOpen: false }; // mutual exclusion
```

**Context value extension** (shell-state-provider.tsx lines 35–41):
```typescript
interface ShellContextValue {
  paletteOpen: boolean;
  drawerOpen: boolean;          // NEW
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setDrawerOpen: (v: boolean) => void;  // NEW
  toggleDrawer: () => void;             // NEW
  hue: string;
  setHue: (hue: string) => void;
}
```

**Hook export** (mirror usePalette pattern at shell-state-provider.tsx lines 83–86):
```typescript
/** Returns { open: boolean, setOpen: (v: boolean) => void, toggle: () => void } */
export function useDrawer() {
  const { drawerOpen, setDrawerOpen, toggleDrawer } = useShellState();
  return { open: drawerOpen, setOpen: setDrawerOpen, toggle: toggleDrawer };
}
```

---

### `app/components/shell/sidebar.tsx` (modify — extract STATUS to `<StatusBlock />`)

**Change:** Replace lines 86–101 (STATUS markup) with:
```tsx
import { StatusBlock } from "@/app/components/shell/status-block";

{/* Section E: STATUS block — extracted as shared primitive (D-14) */}
<StatusBlock uptime={uptime} tz={tz} />
```

The `tz` computation (lines 31–43) remains in Sidebar (client component) and is passed as a prop to `StatusBlock`. The `uptime` prop passes through unchanged.

---

### `app/components/views/about-view.tsx` (modify — append mobile STATUS)

**Analog:** self (append after `.about-cta-row` block at line 55)

**Props interface extension** (about-view.tsx line 10 — add uptime + tz):
```typescript
interface AboutViewProps {
  profile: Profile;
  uptime: string;  // NEW — passed from layout.tsx
  tz: string;      // NEW — computed in layout or passed via client wrapper
}
```

**Import to add:**
```typescript
import { StatusBlock } from "@/app/components/shell/status-block";
```

**Append after CTA row** (after about-view.tsx line 55, before closing `</div>`):
```tsx
{/* Mobile STATUS block — display:none at >=961px, display:block at <=960px via CSS (D-12/D-13) */}
<div className="about-status-mobile">
  <StatusBlock uptime={uptime} tz={tz} />
</div>
```

Note: `AboutView` is RSC. If `tz` requires client-side `Intl` computation, use a `<StatusTz />` client child within `StatusBlock` instead of passing `tz` as prop. If passing as prop, layout.tsx must compute `tz` server-side or pass a static fallback string. Planner decides — the simplest approach matching existing patterns is a `<StatusTz />` client leaf.

---

### `app/(terminal)/layout.tsx` (modify — mount ExplorerDrawer + PrintFooter)

**Analog:** self (follow CommandPalette mount pattern at layout.tsx line 52)

**Imports to add** (layout.tsx lines 5–11):
```typescript
import { ExplorerDrawer } from "@/app/components/shell/explorer-drawer";
import { PrintFooter } from "@/app/components/print-footer";
import { PROFILE, CAREER_START_DATE } from "@/lib/portfolio-data"; // PROFILE already imported
```

**ExplorerDrawer mount** (sibling of CommandPalette — layout.tsx after line 52):
```tsx
{/* ExplorerDrawer: mounted once outside terminal-body, overlays everything at <=960px */}
<ExplorerDrawer />

{/* CommandPalette: existing */}
<CommandPalette />
```

**PrintFooter mount** (inside terminal-main, after shell-footer — layout.tsx after line 47):
```tsx
<footer className="shell-footer">
  {/* ... existing footer ... */}
</footer>
{/* PrintFooter: always in DOM; visible only via @media print */}
<PrintFooter
  siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}
  email={PROFILE.email}
/>
```

---

### `app/globals.css` (modify — append mobile + print rules)

**Analog:** self (follow existing `@media` block pattern)

**Existing breakpoint placement pattern** (globals.css lines 338–346 — append AFTER these):
```css
/* Existing Phase 2 breakpoints (do not modify): */
@media (max-width: 600px) {
  .topbar-path { display: none; }
}
@media (max-width: 480px) {
  .traffic-dot { display: none; }
  .live-clock  { display: none; }
}

/* Phase 4 appends these blocks AT THE END OF FILE: */

/* ── Mobile (<=960px) ── */
@media (max-width: 960px) {
  /* ... drawer styles, sidebar hide, palette overrides, touch targets ... */
}

/* ── Print ── */
@media print {
  /* ... print rules ... */
}
```

**Reduced-motion extension** (globals.css line 152 — append new rules to existing block):
```css
/* Phase 2 block (already present): */
@media (prefers-reduced-motion: reduce) {
  .cursor { animation: none; }
  .content-block { animation: none; }
  .breadcrumb-hint { transition: none; opacity: 1; }

  /* Phase 4 additions: */
  .drawer-sheet[data-state="open"],
  .drawer-sheet[data-state="closed"] { animation: none; }
  .drawer-backdrop { transition: none; }
  [cmdk-dialog] { animation: none; }
}
```

---

### `app/components/shell/sidebar.test.tsx` (modify)

**Change:** Update `"STATUS block shows 'Available for hire'"` test (line 40) — after extraction to `<StatusBlock />`, the assertion remains valid (StatusBlock renders the same text). Test may need to confirm `<StatusBlock />` is in the tree rather than inline markup.

**Existing assertion that stays valid** (sidebar.test.tsx lines 40–43):
```typescript
test("STATUS block shows 'Available for hire'", () => {
  render(<Sidebar uptime="8y 125d" />);
  expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
});
```

No change needed if `StatusBlock` renders the same DOM text. If StatusBlock requires a `tz` prop and Sidebar passes it, the test still passes as-is.

---

### `app/components/shell/top-bar.test.tsx` (modify — add hamburger test)

**Analog:** self (follow existing button test pattern at top-bar.test.tsx lines 20–25)

**New test to append** (following pattern of lines 20–40):
```typescript
test("renders hamburger button with correct aria-label", () => {
  render(<TopBar />, { wrapper: Providers });
  expect(
    screen.getByRole("button", { name: /open file explorer/i })
  ).toBeInTheDocument();
});

test("hamburger button has aria-expanded=false when drawer is closed", () => {
  render(<TopBar />, { wrapper: Providers });
  const btn = screen.getByRole("button", { name: /open file explorer/i });
  expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("hamburger button toggles aria-expanded on click", async () => {
  const user = userEvent.setup();
  render(<TopBar />, { wrapper: Providers });
  const btn = screen.getByRole("button", { name: /open file explorer/i });
  await user.click(btn);
  expect(btn).toHaveAttribute("aria-expanded", "true");
});
```

Import to add: `import userEvent from "@testing-library/user-event";`

---

### `app/components/shell/command-palette.test.tsx` (modify — add mobile-toggle assertion)

**Analog:** self (append a test that verifies toggle still works — same `{Meta>}k` pattern):
```typescript
test("palette toggle still works (mobile state machine — ⌘K at any viewport)", async () => {
  // jsdom doesn't render bottom-sheet visually, but open/close state machine is unchanged
  const user = userEvent.setup();
  render(<CommandPalette />, { wrapper: Providers });
  await user.keyboard("{Meta>}k{/Meta}");
  await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  await user.keyboard("{Meta>}k{/Meta}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
```

---

### `app/components/views/about-view.test.tsx` (new test file)

**Analog:** `app/components/shell/sidebar.test.tsx` (RSC with props, no provider needed for render)

**Test file structure** (sidebar.test.tsx lines 1–8):
```typescript
import { render, screen } from "@testing-library/react";
import { AboutView } from "./about-view";
import { fallbackProfile } from "@/lib/fallback-data";

// AboutView is RSC — no "use client" — no provider wrapper needed

describe("AboutView", () => {
  test("renders H1 with profile name", () => {
    render(<AboutView profile={fallbackProfile} uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  test("mobile STATUS mount is in DOM (about-status-mobile wrapper present)", () => {
    const { container } = render(
      <AboutView profile={fallbackProfile} uptime="8y 125d" tz="GMT+5 (flex)" />
    );
    // CSS visibility is jsdom-blind; only assert DOM presence
    expect(container.querySelector(".about-status-mobile")).toBeInTheDocument();
  });

  test("mobile STATUS mount contains StatusBlock 'Available for hire' text", () => {
    render(<AboutView profile={fallbackProfile} uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
  });

  test("resume download CTA present", () => {
    render(<AboutView profile={fallbackProfile} uptime="8y 125d" tz="GMT+5 (flex)" />);
    expect(screen.getByRole("link", { name: /download resume/i })).toBeInTheDocument();
  });
});
```

---

## Shared Patterns

### "use client" Directive Placement
**Source:** `app/components/shell/command-palette.tsx` line 1; `app/components/shell/top-bar.tsx` line 1
**Apply to:** `explorer-drawer.tsx` only (all other new files are RSC — no directive)
```typescript
"use client";  // First line, before any imports
```

### Import Order Convention
**Source:** `app/components/shell/command-palette.tsx` lines 1–9; CONVENTIONS.md §"Import Organization"
**Apply to:** All new TypeScript files
```typescript
// Order: "use client" directive (if client) → type-only imports → external packages → internal @/ aliases → sibling ./
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePalette } from "@/app/components/shell/shell-state-provider";
import { ROUTES } from "@/lib/routes";
```

### Named Export Convention
**Source:** CONVENTIONS.md §"Module Design"; all existing shell components
**Apply to:** All new components and the new `useDrawer` hook
```typescript
// Named exports — no default exports on components
export function ExplorerDrawer() { ... }
export function useDrawer() { ... }
// Default exports ONLY for Next.js convention files (page.tsx, layout.tsx)
```

### Props Interface Naming
**Source:** CONVENTIONS.md §"Naming Patterns"; `external-link.tsx`, `sidebar.tsx`
**Apply to:** `StatusBlock`, `PrintFooter`, `ExplorerDrawer`
```typescript
// Props interface: <ComponentName>Props, declared in same file as component
interface StatusBlockProps {
  uptime: string;
  tz: string;
}
```

### Provider Wrapper in Tests
**Source:** `command-palette.test.tsx` lines 14–16; `top-bar.test.tsx` lines 11–13
**Apply to:** `explorer-drawer.test.tsx` (needs ShellStateProvider for useDrawer)
```typescript
function Providers({ children }: { children: React.ReactNode }) {
  return <ShellStateProvider>{children}</ShellStateProvider>;
}
// Pass to render: render(<Component />, { wrapper: Providers })
```

### Navigation Mock in Tests
**Source:** `sidebar.test.tsx` lines 5–8; `command-palette.test.tsx` lines 7–9
**Apply to:** `explorer-drawer.test.tsx` (uses useSelectedLayoutSegment + useRouter)
```typescript
vi.mock("next/navigation", () => ({
  useSelectedLayoutSegment: vi.fn(() => null),
  useRouter: () => ({ push: vi.fn() })
}));
```

### Environment Variable Defensive Read
**Source:** CONVENTIONS.md §"Error Handling" + `lib/api.ts` pattern
**Apply to:** `print-footer.tsx` parent (layout.tsx) and audit scripts
```typescript
process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
```

### Audit Script Exit Pattern
**Source:** `scripts/check-placeholders.mjs` lines 49–58
**Apply to:** All three new audit scripts
```javascript
if (hits.length > 0) {
  console.error("\n✗ [RULE-ID]: <description>\n");
  for (const { label } of hits) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ [RULE-ID]: audit passed");
process.exit(0);
```

### CSS Class Naming
**Source:** CONVENTIONS.md §"CSS / Styling Approach"; existing globals.css class names
**Apply to:** All new CSS classes in globals.css
```
Pattern: lowercase, hyphenated — e.g. drawer-sheet, drawer-backdrop, drawer-file-row,
topbar-hamburger, about-status-mobile, print-footer
No BEM, no utility framework, no CSS modules.
```

### RSC Comment Header
**Source:** `app/components/views/about-view.tsx` line 1; `app/(terminal)/layout.tsx` line 1
**Apply to:** `status-block.tsx`, `print-footer.tsx`
```typescript
// NO "use client" — RSC primitive (intent + Phase 2 RSC-first discipline)
```

---

## No Analog Found

All 19 files have direct analogs. No gaps.

| File | Role | Data Flow | Note |
|------|------|-----------|------|
| (none) | — | — | Every file maps to at least a role-match analog |

---

## Metadata

**Analog search scope:** `app/components/shell/`, `app/components/primitives/`, `app/components/views/`, `app/(terminal)/`, `scripts/`, `lib/`
**Files scanned:** 15 source files read directly
**Pattern extraction date:** 2026-05-07

---

## PATTERN MAPPING COMPLETE
