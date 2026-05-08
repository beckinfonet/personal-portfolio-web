# Phase 4 — Manual Verification Log

**Phase:** 4 — Mobile-Responsive
**Reviewer:** {your initials}
**Date:** 2026-05-07
**Build:** 1c2231f

## Automated Battery

Executed by Claude as Plan 04-05 Task 1 on 2026-05-07. All 7 commands exited 0.

- npm run lint: PASS
- npm run typecheck: PASS
- npm test: PASS (97 tests / 22 files)
- node scripts/check-sidebar-redistribution.mjs: PASS
- node scripts/check-print-rules.mjs: PASS
- node scripts/check-mobile-palette-css.mjs: PASS
- npm run build: PASS (postbuild check-placeholders also clean)

## Manual Gates

### How to set up your browser

1. Run `npm run dev` in a separate terminal. Open http://localhost:3000.
2. Open DevTools (right-click → Inspect, or `Cmd+Option+I`).
3. Click the device-toolbar icon (phone+tablet icon at the top-left of DevTools, or `Cmd+Shift+M`).
4. Use the dropdown at the top of the page area to switch sizes. The three sizes you'll need:
   - **Phone size** — pick "iPhone SE" or set the width to **375** pixels.
   - **Tablet size** — pick "iPad Mini" or set the width to **768** pixels.
   - **Desktop size** — set the width to **1024** pixels (or close DevTools to use your full screen).

For each gate below, write **PASS** or **FAIL** in the Result column and a one-line note in Notes. Screenshots are optional — drop them in `.planning/phases/04-mobile-responsive/screenshots/` and reference the filename in Notes.

### Gate-by-gate walkthrough

#### Phone size (width 375)

**Gate 1 — Can you see "↓ resume.pdf" without scrolling?**
On the home page (`/`), look at the very top of the page. There should be a button labelled `↓ resume.pdf`. It should be visible the moment the page loads — no scrolling needed.
*Pass if:* the resume button is visible at first glance.

**Gate 2 — Does the menu open as a panel from the bottom?**
At the top of the page there's a `☰` (three-line menu) button. Tap it.
*Pass if:* a panel slides up from the bottom of the screen, the area behind it darkens, and the panel shows a list of pages (about, projects, stack, etc.) plus a `↓ resume.pdf` card. Tap outside the panel — it should close. Open it again, tap "Contact information" — the panel should close and the page should switch to contact.

**Gate 3 — Does the search palette open as a panel from the bottom?**
Click the `⌘K` button at the top right (or press `Cmd+K`).
*Pass if:* a search panel slides up from the bottom, with a search box stuck at its top. Type "contact" — the list should filter to show contact-related results.

**Gate 4a — Is the "Available for hire" status block visible at the bottom of the about page?**
On the home page (`/`), scroll all the way down.
*Pass if:* near the bottom of the page you see three lines: a green dot with `● Available for hire`, an `uptime: ...` line, and a `tz: ...` line.

**Gate 4b — Is the status block hidden on the other six pages?**
Visit each of these pages: `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`. On each page, scroll to the bottom.
*Pass if:* the green "Available for hire" status block does **not** appear on any of these six pages.

#### Tablet size (width 768)

**Gate 2 + 3 + 4a (repeat at tablet size)**
Switch the width to 768. The behavior should be the same as phone size: hamburger menu opens as a bottom panel, palette opens as a bottom panel, "Available for hire" block visible only on the home page.
*Pass if:* tablet size behaves the same as phone size.

#### Desktop size (width 1024)

**Gate 4c — At desktop size, is "Available for hire" only in the left sidebar?**
Switch the width to 1024 (or close DevTools to use full screen).
*Pass if:* the left sidebar (240px wide, on the left of the page) shows the "Available for hire" status block. The status block should **not** also appear at the bottom of the home page body. (If you see it twice — once in the sidebar AND once in the page body — that's a FAIL.)

Also confirm: the `☰` hamburger button at top is hidden, the `⌘K` search opens as a centered popup (not a bottom panel).

#### Reduced-motion preference

**Gate 6 — When "Reduce Motion" is on, do menus appear instantly without sliding?**
On macOS: System Settings → Accessibility → Display → turn **Reduce Motion ON**. Reload the page at width 375. Open the hamburger menu and the search palette.
*Pass if:* both panels appear immediately with no sliding animation. Turn Reduce Motion OFF when done.

(On Windows: Settings → Accessibility → Visual effects → "Animation effects" OFF.)

#### Print preview

**Gate 5 — On every page, does the print preview look like a clean printable document?**
Visit each of the 7 pages and press `Cmd+P` (or `Ctrl+P`) to open the print preview. For each page, check the per-route detail table further down.

For every page:
- Background should be **white** (no dark theme).
- Body text should be **black** in a **serif font** (looks like a book or newspaper, with little feet on the letters — Georgia or Times). It should not look like the monospace code-style font you see on screen.
- The top bar, sidebar, search panel, hamburger menu, and breadcrumb crumbs should **not** appear.
- At the very bottom of the page there should be a single line like `http://localhost:3000 · beckprograms@gmail.com`.

For pages with code-style content, those parts should stay in the monospace font:
- `/stack` — the JSON block should still look like code (monospace, with grey/black tonal hierarchy).
- `/experience` — the colour hex codes should stay monospace, but the role and summary should be serif.
- `/projects` — the tech-tag chips should stay monospace.
- All pages — the `$ <command>` prompt line should stay monospace.

Fill in the per-route table below as you go.

#### Recruiter dry-run

**Gate 9 — In a 5-second test, can someone find the resume?**
At width 375 on `npm run dev`:
- Either show the page to a non-engineer friend, or simulate it yourself: imagine you've never seen this site before, and time how long it takes you to find "the resume" and "how to contact this person."
- Write down the time-to-resume (target: < 5 seconds; the `↓ resume.pdf` button at top should be tap-instant) and time-to-contact (target: < 10 seconds; via the menu or by scrolling to socials/email on the home page).
- Note any moment of confusion ("I had to look around to figure out where the menu was…" etc.).

#### Real-device validation (optional for now)

**Gates 7 + 8 — Does it work on a real phone?**
If you have a physical iPhone (Safari) and/or Android phone (Chrome), open http://your-laptop-ip:3000 on the device and run through Gates 2 + 3 again. Confirm the bottom panel doesn't get clipped, the on-screen keyboard doesn't cover the search box, and the browser address bar doesn't overlap the top bar.

If you don't have devices on hand, mark these as **DEFERRED-PHASE-7** — that's acceptable here. The full recruiter test happens after deployment in Phase 7.

---

### Results table

| Gate | What it checks | Requirement | Viewport | Result | Notes |
|------|----------------|-------------|----------|--------|-------|
| 1 | Resume button visible without scrolling on the home page | MOBILE-03 | 375 | PASS | Reviewer-confirmed at iPhone SE 375×667; `↓ resume.pdf` button visible above the fold. |
| 2 | Hamburger menu opens as a bottom panel | MOBILE-02 | 375 / 768 | PASS | Reviewer-confirmed at 375 and 768; drawer slides up from bottom, backdrop dims, file-row tap closes drawer + navigates. |
| 3 | `⌘K` search opens as a bottom panel | PALETTE-05 | 375 / 768 | PASS | Reviewer-confirmed at 375 and 768; bottom-sheet anchored to viewport bottom, sticky search input, type-to-filter works. |
| 4a | "Available for hire" block visible at bottom of home page | MOBILE-04 | 375 / 768 | PASS | Reviewer-confirmed `.about-status-mobile` renders at bottom of `/about` after `bf38cf3` grid-track fix. |
| 4b | "Available for hire" block hidden on the other 6 pages | MOBILE-04 | 375 (×6) | PASS | Reviewer-confirmed STATUS not rendered on `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped` at phone width. |
| 4c | At desktop size, "Available for hire" block only in left sidebar (not duplicated in page body) | MOBILE-04 | 1024 | PASS | Reviewer-confirmed at 1024; sidebar STATUS visible, no double-render in about-view body. |
| 5 | Print preview is clean on all 7 pages | A11Y-09 | Cmd+P per page | PASS | Reviewer-confirmed all 7 routes via Cmd+P preview — see per-route table below. |
| 6 | With Reduce Motion ON, menus open instantly with no slide | A11Y-09 (motion) | 375 + Reduce Motion | PASS | Reviewer-confirmed; drawer + palette appear without slide animation when Reduce Motion is ON. |
| 7 | iPhone Safari real-device behaves correctly | MOBILE-02 / PALETTE-05 | iPhone Safari | DEFERRED-PHASE-7 | No physical device available during Phase 4 review; defer to Phase 7 production recruiter test (per 04-CONTEXT `<deferred>`). |
| 8 | Android Chrome real-device behaves correctly | MOBILE-02 / PALETTE-05 | Android Chrome | DEFERRED-PHASE-7 | No physical device available during Phase 4 review; defer to Phase 7. |
| 9 | 5-second recruiter dry-run finds resume + contact quickly | MOBILE-01..05 / SHELL-03 | 375 localhost | PENDING | Awaiting reviewer dry-run + numbers. |

### Gate 5 — Print Preview Per-Route Detail

For each page, after pressing `Cmd+P`, mark `y` or `n` for each column:
- **White bg** — Is the background pure white (not dark theme)?
- **Serif body** — Is the body text in a serif font (like a book / Georgia / Times)?
- **Code stays mono** — Are code-style parts still in the monospace code font (where applicable)?
- **Chrome hidden** — Are the top bar, sidebar, hamburger menu, search panel, and breadcrumb all hidden?
- **Footer present** — Does the very bottom show one line like `http://localhost:3000 · beckprograms@gmail.com`?

| Page | White bg | Serif body | Code stays mono | Chrome hidden | Footer present | Result |
|------|----------|------------|-----------------|---------------|----------------|--------|
| /            (home / about) | y | y | y | y | y | PASS |
| /projects                   | y | y | y (tech chips) | y | y | PASS |
| /stack                      | y | y | y (JSON block) | y | y | PASS |
| /experience                 | y | y | y (hex codes)  | y | y | PASS |
| /writing                    | y | y | y | y | y | PASS |
| /contact                    | y | y | y | y | y | PASS |
| /shipped                    | y | y | y | y | y | PASS |

## Phase 4 Verdict

- All Phase 4 success criteria from ROADMAP §"Phase 4: Mobile-Responsive" satisfied: PENDING
- Carry-forward items for Phase 5: {list — e.g. axe-core 8-combination contrast audit}
- Carry-forward items for Phase 7: {list — e.g. real-device gates 7-8 if deferred, production recruiter test}

**Date closed:** {ISO date}
**Reviewer signature:** {initials}
