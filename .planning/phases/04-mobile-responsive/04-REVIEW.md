---
phase: 04-mobile-responsive
reviewed: 2026-05-07T00:00:00Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - app/(terminal)/layout.tsx
  - app/(terminal)/page.tsx
  - app/components/print-footer.test.tsx
  - app/components/print-footer.tsx
  - app/components/shell/command-palette.test.tsx
  - app/components/shell/explorer-drawer.test.tsx
  - app/components/shell/explorer-drawer.tsx
  - app/components/shell/shell-state-provider.tsx
  - app/components/shell/sidebar.test.tsx
  - app/components/shell/sidebar.tsx
  - app/components/shell/status-block.test.tsx
  - app/components/shell/status-block.tsx
  - app/components/shell/status-tz.tsx
  - app/components/shell/top-bar.test.tsx
  - app/components/shell/top-bar.tsx
  - app/components/views/about-view.test.tsx
  - app/components/views/about-view.tsx
  - app/globals.css
  - package.json
  - scripts/check-mobile-palette-css.mjs
  - scripts/check-print-rules.mjs
  - scripts/check-sidebar-redistribution.mjs
findings:
  critical: 0
  warning: 5
  info: 6
  total: 11
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-07
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Phase 4 ships a clean, principled mobile-responsive layer. Architecture choices are
sound: RSC-by-default boundaries are minimal and correct (`PrintFooter`, `StatusBlock`,
`(terminal)/layout.tsx` stay server; `StatusTz` is a tiny client leaf so that
`StatusBlock` itself can be consumed from the RSC `AboutView`). The mutual-exclusion
reducer in `shell-state-provider.tsx` is correctly modeled (open transitions clear
the sibling surface; close transitions do not), and CSS additions stay within the
pure-CSS-only constraint. No new prod deps were added (still `next-themes` +
`cmdk`). Tests are co-located, named clearly, and assert DOM/ARIA contracts rather
than visual layout (correctly avoiding jsdom @media blind-spots).

That said, several issues warrant attention before sign-off:

- A focus-restore effect in `explorer-drawer.tsx` fires on initial mount and steals
  focus from the page on first paint (Warning).
- `StatusTz` reads `Intl.DateTimeFormat().resolvedOptions().timeZone` in a render
  body, which produces server-vs-client hydration mismatches when SSR timezone
  differs from the user's browser (Warning).
- The `@media print` block contains a number of stale class selectors that no
  longer exist in any rendered component (`.exp-hash`, `.writing-title`,
  `.contact-link`, `.terminal-shell`, etc.) — dead CSS that was never updated when
  Phase 3 view classes were renamed (Warning).
- The `siteUrl` fallback in `(terminal)/layout.tsx` uses `??` while
  `app/layout.tsx` uses `||`, and the project's own pitfall guidance (Phase 1
  D-Pitfall D, see `app/layout.tsx:8-10`) is to use `||` because empty-string env
  vars bypass `??` and produce `Invalid URL` errors (Warning).
- `scripts/check-mobile-palette-css.mjs` uses `\Z` in a JS regex, which is not a
  valid JS anchor and is matched as a literal `Z`; the mobile-block extraction
  works only because the `@media` block happens to be followed by a `/* ──`
  comment header (Warning).

Info-level items below cover dead CSS (`.drawer-close-btn`), a tab-trap edge case
when only one focusable element exists, and a few minor robustness improvements.

## Warnings

### WR-01: `useEffect` focus-restore on drawer close fires on initial mount and steals focus

**File:** `app/components/shell/explorer-drawer.tsx:71-76`

**Issue:** The "restore focus to hamburger" effect has only `[open]` in its dependency
array and an `if (!open)` guard. On initial mount `open === false`, so this effect
runs once on every page load and immediately calls
`document.getElementById("topbar-hamburger-btn")?.focus()`. This means the
hamburger button gets keyboard focus on every fresh page load, regardless of where
the user's focus ought to be (typically nowhere — the body — or the skip-link if a
keyboard user just hit Tab). On desktop the hamburger is `display:none`, so
`.focus()` is a no-op visually, but on mobile this hijacks focus on every nav.

This pattern also conflicts with `CommandPalette`'s own focus-restore (which
captures `document.activeElement` at open time): if a user opens the palette and
the drawer is already closed, the drawer's effect can steal focus back to a
hidden trigger after a re-render.

**Fix:** Track the previous-open value with a ref so the restore only runs on a
genuine open→close transition:

```tsx
const wasOpenRef = useRef(false);
useEffect(() => {
  if (wasOpenRef.current && !open) {
    document.getElementById("topbar-hamburger-btn")?.focus();
  }
  wasOpenRef.current = open;
}, [open]);
```

The existing `closing restores focus to the ☰ trigger` test still passes because
the ref will have been set to `true` by the prior open transition.

---

### WR-02: `StatusTz` causes a server/client hydration mismatch

**File:** `app/components/shell/status-tz.tsx:8-19`

**Issue:** `Intl.DateTimeFormat().resolvedOptions().timeZone` and the
`timeZoneName` formatter are both invoked synchronously inside the render body.
Since `StatusTz` is a client component but is consumed by `StatusBlock` (RSC),
Next.js will run it during SSR and produce HTML reflecting the **server's**
timezone (e.g., `UTC` on Vercel, `America/Los_Angeles` on a US dev machine), then
re-run on the client during hydration where the user's browser resolves a
**different** timezone. React will warn with "Text content does not match
server-rendered HTML" and the visible string will flicker on first paint.

The server tests pass because Vitest runs in jsdom (same env as the rendered
output), so this never surfaces in the unit suite.

**Fix:** Compute the tz inside `useEffect` and store it in state, rendering an
empty string (or a stable placeholder) for the initial server pass:

```tsx
"use client";
import { useEffect, useState } from "react";

export function StatusTz() {
  const [tz, setTz] = useState("");
  useEffect(() => {
    try {
      const offset = new Intl.DateTimeFormat("en", { timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? "GMT+5";
      setTz(`${offset} (flex)`);
    } catch {
      setTz("GMT+5 (flex)");
    }
  }, []);
  return <span suppressHydrationWarning>{tz}</span>;
}
```

The unit test `renders a tz value (Intl resolved or GMT+5 fallback)` will need
to be updated to either `await waitFor(...)` for the post-effect value or assert
the tz row's structural presence (which `status-block.test.tsx:30-38` already
does via `rows.length === 3`).

---

### WR-03: Dead/stale class selectors in the `@media print` block

**File:** `app/globals.css:1438-1489`

**Issue:** Many class names in the print stylesheet do not exist in any rendered
component. Verified via `grep -rn` across `app/` and `lib/`:

| Selector in @media print | Actually rendered as |
|---|---|
| `.exp-hash` | `.experience-hash` |
| `.exp-period` | `.experience-period` |
| `.exp-role` | `.experience-role` |
| `.exp-row` | `.experience-row` |
| `.writing-title` | `.writing-post-title` |
| `.writing-meta` | `.writing-post-meta` |
| `.writing-row` | `.writing-post` (ish) |
| `.stack-key` | `.json-key` |
| `.stack-string` | `.json-string` |
| `.stack-punct` | `.json-punc` |
| `.contact-link` | (does not exist anywhere) |
| `.terminal-shell` | `.terminal-body` |

The print output therefore loses the intended b/w hierarchy normalization for
experience/writing/stack views and the "full-bleed" reset for the layout. The
print audit script (`scripts/check-print-rules.mjs`) does NOT catch this — it
only verifies that the @media print block exists and a few generic invariants
(font-family, page-break, color forcing). It does not verify that referenced
classes are actually emitted by components.

**Fix:** Update the print rules to use the real class names. Recommended diff:

```css
/* Color normalization — preserve hierarchy on b/w printers */
.about-card-value,
.json-string,
.experience-role,
.writing-post-title,
.btn,
.sb-status-dot {
  color: #000 !important;
}
.about-card-label,
.about-meta,
.json-punc,
.json-key,
.experience-hash,
.experience-period,
.writing-post-meta,
.contact-label,
.sb-status-key {
  color: #333 !important;
}
.stack-pre,
.about-card,
.contact-card,
.projects-row,
.experience-row,
.writing-post,
.shipped-row {
  border-color: #999 !important;
}

/* Layout: full-bleed */
.terminal-body {
  display: block !important;
}
```

Drop `.contact-link` (no such class) — the contact view uses `<a>` elements
directly under `.contact-row`, which inherits `color: #000` from the global
print rules already in force.

Also consider strengthening `scripts/check-print-rules.mjs` to assert that key
view classes (`.experience-row`, `.writing-post`, etc.) appear in the print
block so future renames are caught.

---

### WR-04: `siteUrl` env-var fallback uses `??` instead of project-required `||`

**File:** `app/(terminal)/layout.tsx:61`

**Issue:** The terminal layout passes
`process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` to `<PrintFooter>`.
The project's own root layout at `app/layout.tsx:8-10` documents this exact
pitfall:

```ts
// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (Phase 1 D-Pitfall D — do not change.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
```

If a deploy environment defines `NEXT_PUBLIC_SITE_URL=""` (common when an env var
is "set but empty" via misconfigured CI), `??` will return `""` and the print
footer will render "` · beckprograms@gmail.com`". `||` correctly falls back to
the localhost default. This is purely a print artifact (no runtime crash, since
PrintFooter just interpolates a string) but is a documented project pitfall and
trivial to fix.

**Fix:**

```tsx
<PrintFooter
  siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}
  email={PROFILE.email}
/>
```

Or — better — extract the same `siteUrl` const at module scope (matching
`app/layout.tsx`) so both layouts read from one place. Add a brief test to
`print-footer.test.tsx` covering the empty-string env case at the layout level.

---

### WR-05: `\Z` regex anchor is not valid JS in mobile-palette audit script

**File:** `scripts/check-mobile-palette-css.mjs:12`

**Issue:** The regex
`/@media \(max-width:\s*960px\)\s*\{[\s\S]*?(?=\n@media|\n\/\* ──|\Z)/`
uses `\Z`, which is a Perl/Ruby end-of-string anchor. In JavaScript regex syntax
`\Z` is just an escaped literal `Z`. So the third lookahead alternative reduces
to "a literal newline followed by capital Z", which essentially never matches.

The audit only works today because globals.css happens to place a `/* ──...`
section comment immediately after the `@media (max-width: 960px)` block (line
1399 — the print stylesheet header). If a future edit collapses that header or
adds another `@media` block before it, the lookahead silently fails; the lazy
`[\s\S]*?` then grabs nothing and the mobile-block scope falls back to the empty
string. The "scope: mobile" checks would then all silently pass against an empty
buffer (because `failures = checks.filter(...)` only flags `!pattern.test(target)`,
and `pattern.test("")` is `false`, so `!false` ... wait, no — empty string fails
any non-trivial pattern, so checks would FAIL loudly). So today the script is
safe-by-accident. The risk is a future failure mode where someone "fixes" the
regex to `[\s\S]*` (greedy) and accidentally extends the scope past the @media
block.

**Fix:** Use a simple non-greedy capture bounded by EOF, or anchor on an actual
sentinel. Since CSS @media blocks have balanced braces and the file is
hand-formatted with the outer `}` at column 0, the cleanest approach is:

```js
// Match "@media (max-width: 960px) { ... }" up to the matching column-0 brace.
const mobileBlockMatch = contents.match(
  /@media \(max-width:\s*960px\)\s*\{[\s\S]*?\n\}\s*\n/
);
```

This mirrors the technique already used in `check-sidebar-redistribution.mjs:14`
and removes the dependency on a downstream comment marker.

## Info

### IN-01: Focus-trap fails to contain Tab when only one focusable element exists

**File:** `app/components/shell/explorer-drawer.tsx:50-65`

**Issue:** The trap only intercepts Tab when `document.activeElement === first`
(Shift+Tab) or `=== last` (Tab). If the drawer ever renders with exactly one
focusable element, that element is both `first` and `last`, but neither branch
executes for normal Tab — focus moves out of the dialog into background page
content. Today the drawer always has 8+ focusable items (1 close-equivalent +
7 routes + 1 resume link), so this is theoretical. Worth hardening for
defense-in-depth.

**Fix:** Add the single-element guard:

```ts
if (list.length === 1) {
  e.preventDefault();
  return;
}
```

Place before the existing first/last checks.

---

### IN-02: `.drawer-close-btn` CSS exists but no component renders it

**File:** `app/globals.css:1272-1287`

**Issue:** `.drawer-close-btn` styling (44×44, focus-visible ring) is defined
but `ExplorerDrawer` has no close button — it relies on backdrop click, Esc, and
file-row navigation to dismiss. Either the close button was planned and dropped,
or the rule is dead code.

**Fix:** Either remove the `.drawer-close-btn` rules or, if a visible close
affordance is intended (recruiters who don't know to tap-outside), add the
button to `ExplorerDrawer`:

```tsx
<button
  className="drawer-close-btn"
  aria-label="Close file explorer"
  onClick={() => setOpen(false)}
>
  ×
</button>
```

Recommend the first option (remove CSS) since the existing keyboard/backdrop
dismiss is already covered by tests and matches modern bottom-sheet UX.

---

### IN-03: Drawer focusable-element selector misses `<a>` without `[href]` and skips `[tabindex="0"]` correctness

**File:** `app/components/shell/explorer-drawer.tsx:46, 53`

**Issue:** The selector
`'button, [href], input, [tabindex]:not([tabindex="-1"])'` is fine for the
current drawer DOM (7 `<button>`s + 1 `<a download href=...>`), but is brittle:
- It relies on `[href]` matching `<a>` (works) but would also match `<link>` if
  one ever appeared inside.
- It does not exclude disabled buttons (`button:not([disabled])`).
- `<select>` and `<textarea>` are missing.

This is fine for v1 since the drawer's contents are static. Note for future
hardening.

**Fix (when next touched):**

```ts
'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
```

---

### IN-04: `useSelectedLayoutSegment` mocked separately in each shell test — small duplication risk

**File:** `app/components/shell/sidebar.test.tsx:6-9`, `app/components/shell/explorer-drawer.test.tsx:7-10`

**Issue:** Two near-identical mocks of `next/navigation`. If a third surface
adds segment-derived active state (Phase 5+), the pattern will be repeated again.
Consider moving to a shared test helper `app/components/shell/__test-utils__.ts`
that exports `mockNavigation(segment)` for reuse.

This is purely DRY hygiene; not a correctness issue.

---

### IN-05: `print-footer.tsx` has no `key` warnings risk, but URL is rendered as plain text — no escaping needed but worth a comment

**File:** `app/components/print-footer.tsx:14-20`

**Issue:** `siteUrl` and `email` are interpolated directly into JSX text content,
which React auto-escapes — there is **no XSS surface**, even if a malicious env
var sets `siteUrl="<script>alert(1)</script>"`. The existing test
(`print-footer.test.tsx:33-41`) explicitly asserts this. Good.

The component is otherwise clean. One micro-suggestion: the comment block at
the top (`// CSS class .print-footer is defined in...`) already documents the
visibility contract; the `aria-hidden="true"` is correct because a print-only
footer is redundant for screen-reader users (the same data is on-screen).

**Fix:** None required; flag for completeness during this audit pass.

---

### IN-06: `aria-controls` references a sheet id that exists in DOM even when drawer is closed — fine, but document why

**File:** `app/components/shell/top-bar.tsx:22`, `app/components/shell/explorer-drawer.tsx:88`

**Issue:** `aria-controls="explorer-drawer-sheet"` always points to a real
element because the drawer DOM is always mounted (visibility is CSS-driven via
`data-state` + `display: none`). This is correct ARIA — `aria-controls` requires
the controlled element to exist. The data-state pattern means assistive tech can
inspect both states without DOM churn.

Worth a brief code comment in `explorer-drawer.tsx` (near the sheet `<div>`) to
record this design decision so a future contributor doesn't try to conditionally
unmount the drawer when closed (which would break `aria-controls`).

**Fix:**

```tsx
{/* Sheet stays mounted at all times — visibility is CSS-driven via data-state.
    Unmounting would break the TopBar's aria-controls reference. */}
<div ref={sheetRef} id="explorer-drawer-sheet" ...>
```

---

_Reviewed: 2026-05-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
