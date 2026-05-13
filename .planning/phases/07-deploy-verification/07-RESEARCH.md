# Phase 7: Deploy + Verification — Research

**Researched:** 2026-05-13
**Domain:** Production cutover + analytics integration + external-tool verification (Lighthouse / GSC / npm audit / knip)
**Confidence:** HIGH (every load-bearing claim verified against official Vercel/Google docs or npm registry as of 2026-05-13)

## Summary

This is a **verification + single-line-instrumentation phase**, not a feature build. The production cutover already shipped in Phase 6 Plan 09 (Railway BE + Vercel FE with `NEXT_PUBLIC_API_BASE_URL` flipped); the custom domain `www.tatibekov.com` is already wired and 307-redirecting from apex. Phase 7 has exactly one new dependency (`@vercel/analytics`), one env-var flip (`NEXT_PUBLIC_SITE_URL`), one header deletion (`x-portfolio-source` slot in `next.config.ts`), one event-tracking line (`track("resume_download")` in TopBar), and a battery of external-tool verifications (PageSpeed Insights × 7 routes, Search Console DNS TXT + sitemap, `npm audit`, `npx knip`, 5-second recruiter test, 375px shell screenshot review).

The architectural risk surface is tiny — almost everything is "configure external service, capture evidence, paste into VERIFICATION.md." The real risk is **verification methodology**: getting Lighthouse scores that are stable enough to claim "Perf ≥ 90", reading Search Console index statuses correctly, distinguishing real `npm audit` issues from transitive-dep noise, and handling the `<a download>` + `track()` timing case correctly so events actually land before the browser starts the download.

**Primary recommendation:** Install `@vercel/analytics@^2.0.1` (verified npm latest), import `<Analytics />` from `@vercel/analytics/next` (the App-Router-aware entry point — NOT `/react`), mount it inside `<body>` in root `app/layout.tsx`, import `track` from bare `@vercel/analytics` in `top-bar.tsx`, and fire `track("resume_download")` from a non-preventDefault `onClick` on the existing `<a href={PROFILE.resumeUrl} download>` — the SDK uses `navigator.sendBeacon` (with `fetch keepalive` fallback) which is specifically designed for this fire-and-forget pre-navigation case. Run PSI **3 times per route** and record the median (Google's own variability guidance), `npm audit --omit=dev --audit-level=high` as the gate command, and DNS-TXT-verify a **Domain property** in GSC (covers apex + www + future subdomains; cleaner than a URL property).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Public URL + canonical host:**
- **D-01:** `NEXT_PUBLIC_SITE_URL = https://www.tatibekov.com` as canonical site URL. Apex `tatibekov.com` already 307s to `www.tatibekov.com` in Vercel (screenshot confirmed 2026-05-13). Vercel hostname `personal-portfolio-web-orcin.vercel.app` stays as a Production alias (do NOT noindex explicitly — let Google de-duplicate via canonical URLs from `app/sitemap.ts` once `metadataBase` is locked to www).
- **D-02:** Update `app/layout.tsx` `metadata.metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com")` and ensure `app/sitemap.ts` + `app/robots.ts` emit `www.tatibekov.com` URLs. OG image absolute URLs (8 sibling `opengraph-image.tsx` files from Phase 5) resolve against `metadataBase` — no per-file edit needed.
- **D-03:** Set the env var in **Vercel Project Settings → Environment Variables → Production** (NOT in `.env.local`, NOT committed to repo). After setting, redeploy via Vercel UI or `git commit --allow-empty -m "chore: redeploy with NEXT_PUBLIC_SITE_URL"`. `.env.example` gets updated to show the production value as a comment-style hint, NOT the active value.

**Engineer easter-egg headers:**
- **D-04:** DROP `x-portfolio-source` entirely from `next.config.ts` `engineerHeaders`. The repo is private. Removes the now-obsolete inline comment from `next.config.ts:11`. Closes Phase 5 D-30 DEFERRED-PHASE-7 as **RESOLVED-as-dropped** (not "filled"). Update REQUIREMENTS.md DEV-03 status to PASS-with-deviation (only `x-built-with` ships).
- **D-05:** Keep `x-built-with: nextjs-15-react-19` as the surviving engineer header.

**Search Console + sitemap:**
- **D-06:** GSC verification via **DNS TXT** creating a **Domain property** at `tatibekov.com`. Covers `www.tatibekov.com`, apex (which redirects), AND any future subdomains.
- **D-07:** Submit `https://www.tatibekov.com/sitemap.xml` in GSC. ≥4 of 7 routes show "Discovered" / "Crawled" / "Indexed" within phase wall-clock window.

**Analytics package + event surfaces:**
- **D-08:** **`@vercel/analytics` ONLY** (no `@vercel/speed-insights` in v1). Single new prod dep. Mount `<Analytics />` in `app/layout.tsx` server component.
- **D-09:** Prod-dep exception documented in CLAUDE.md. Three prod deps total: `next-themes`, `cmdk`, `@vercel/analytics`.
- **D-10:** `resume_download` event fires from TopBar resume button ONLY. Palette/AboutSocials/sidebar resume rows keep plain `<a href download>` behavior (no `track()` call).
- **D-11:** Bare event payload — `track("resume_download")` with no properties.
- **D-12:** TopBar resume button gets `onClick={() => track("resume_download")}` on the existing `<a>` (no `preventDefault()`). Fire-and-forget — SDK handles pre-navigation timing.
- **D-13:** No v2 pull-forward. ANALY-V2-01 (theme / accent / palette events) stays deferred.

**Lighthouse audit methodology:**
- **D-14:** **PageSpeed Insights web tool** (`https://pagespeed.web.dev/?url=<route>`) as the canonical Lighthouse runner. Zero install. Mobile profile. Desktop optional/informational.
- **D-15:** All 7 routes audited — `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`.
- **D-16:** Evidence shape — 7-row × 6-column scores table (route × Perf/A11y/SEO/LCP/CLS/INP). Screenshots under `.planning/phases/07-deploy-verification/lighthouse/<route>-mobile.png`.
- **D-17:** Threshold-miss policy = **fix-in-place + re-audit** (Phase 5 axe-matrix model). No DEFERRED-V1.1 escape hatch. Phase 7 doesn't close until 7 routes × 6 metrics = 42 cells pass.

**Real-device + recruiter verification:**
- **D-18:** Real-device gates close via **Chrome DevTools emulation only** — NOT physical iPhone Safari or Android Chrome. Consciously-accepted limitation documented in "Known limitations" section of VERIFICATION.md.
- **D-19:** 5-second recruiter test = **one non-engineer runs both devices sequentially**. Desktop first on their laptop, then 375px mobile (their own phone on `www.tatibekov.com`). Pass = under 5s on each device, both runs.
- **D-20:** DEPLOY-07 (375px shell review) runs via Chrome DevTools 375px viewport on all 7 routes. Screenshots saved under `.planning/phases/07-deploy-verification/screenshots/375/<route>.png`. Production URL, NOT localhost.

**Pre-deploy + close-out gates:**
- **D-21:** `npm audit` + `npx knip` run as pre-close-out gates. Both must exit zero high/critical for FE; both must exit zero unused for FE. Run BEFORE recording final scores.
- **D-22:** **Backend-side smoke gate (Phase 6 D-11) re-runs** as part of close-out — `scripts/check-backend.mjs` against Railway must still exit 0 (7/7 endpoints green).

**Brownfield discipline:**
- **D-23:** Phase 7 has no backend touches; no paired commits needed.

### Claude's Discretion

- Exact `<Analytics />` mount position in `app/layout.tsx` — top-of-`<body>` vs inside the RSC tree near `<HeadComment />`. Both work; planner picks based on readability.
- Whether redeploy that activates `NEXT_PUBLIC_SITE_URL` is triggered via `git commit --allow-empty` (visible in git log) or via Vercel UI "Redeploy" button. **Recommend git-commit path for audit trail consistency with Phase 6 cutover.**
- Whether `lighthouse/` and `screenshots/375/` directories ship as committed evidence or stay local-only `.planning/`-ignored. **Recommend committed** — matches Phase 5 OG image evidence pattern. Disk cost is negligible (<2MB).
- Exact wording of CLAUDE.md update for D-09 (the `@vercel/analytics` prod-dep exception). Two-line addition under "Stack constraints" is enough.
- Whether to add `scripts/check-canonical-url.mjs` smoke gate that asserts `process.env.NEXT_PUBLIC_SITE_URL` is set to a non-localhost value in production builds. Optional defensive measure.

### Deferred Ideas (OUT OF SCOPE)

- `@vercel/speed-insights` (Real User Monitoring) — paired RUM signal; v1.1 candidate.
- Theme/accent/palette-open analytics events (ANALY-V2-01) — stays v2.
- Physical iPhone Safari + Android Chrome verification — DevTools emulation only in Phase 7.
- Resume download event property expansion (viewport / theme / accent segmentation).
- `scripts/check-canonical-url.mjs` smoke gate — Optional v1.1.
- CMS / admin endpoint carve-out (`/api/admin/*`) — still deferred.
- Robots policy explicitly noindex'ing the Vercel-hostname alias — relying on canonical URLs for de-dup.
- Slack/LinkedIn unfurl preview manual test (Phase 5 SEO-03c carry) — **NOT in 4 selected gray areas but the carry is real**; planner should include as sub-task under DEPLOY-04 or as its own close-out gate.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | Production deploy on Vercel with `NEXT_PUBLIC_SITE_URL` set to production origin; all 7 routes return HTTP 200 | §"Vercel env-var → redeploy flow"; §"Code Examples — production env var flip"; existing `metadataBase` reads from this var via `app/layout.tsx:12` |
| DEPLOY-02 | Lighthouse mobile: LCP < 2.5s, CLS < 0.1, INP < 200ms, Perf ≥ 90, A11y ≥ 95, SEO ≥ 95 | §"PageSpeed Insights methodology"; §"Validation Architecture / Evidence-capture gates"; PSI=Lighthouse engine confirmed; mobile=Moto G4 + slow-4G; **3-run median** is Google's own variability guidance |
| DEPLOY-03 | Search Console sitemap submitted + all 7 routes indexed (or "Discovered" pending crawl); `npm audit` zero high/critical; `npx knip` zero unused | §"Google Search Console DNS TXT + sitemap submission"; §"Common Pitfalls — index status semantics for new domains"; §"npm audit + knip behavior" |
| DEPLOY-04 | 5-second recruiter test passes on desktop + 375px mobile — non-engineer finds resume + contact in under 5 seconds, twice | §"Validation Architecture / Manual-attestation gates"; Phase 4 Gate 9 self-simulation model already validated localhost — D-19 extends to one non-engineer × two devices on prod |
| DEPLOY-05 | `npm audit` zero high/critical; `npx knip` zero unused | §"npm audit + knip behavior" with exit-code semantics and CI-gating commands |
| DEPLOY-06 | Vercel Analytics enabled + `resume_download` custom event fires on resume button click | §"`@vercel/analytics` integration"; §"Code Examples — Analytics mount + track() call"; **`/next` entry point** + bare `@vercel/analytics` for `track` import + `sendBeacon`/`keepalive` SDK pattern |
| DEPLOY-07 | All shell elements verified at 375px mobile viewport (manual screenshot review — every shell element accessible, no overflow) | §"Validation Architecture / Manual-attestation gates"; D-20 prescribes Chrome DevTools 375px × 7 routes against production URL |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These directives carry the same authority as locked decisions and must be honored by every plan/task in Phase 7:

- **Stack constraints:** Next.js 15 App Router + React 19 + TypeScript strict (no framework swap). Pure CSS + CSS custom properties (no Tailwind, no CSS-in-JS, no CSS modules). Native `fetch` + `next: { revalidate }` (no SWR, no TanStack Query).
- **Two new prod deps "total" rule:** CLAUDE.md currently says `next-themes` + `cmdk`. **Phase 7 introduces a documented exception:** `@vercel/analytics` becomes the third (and final v1) prod dep. CLAUDE.md must be updated in the same wave that adds the dep (D-09 requirement).
- **Architecture rules:**
  - `app/layout.tsx` is a Server Component — only thin client islands carry `"use client"`. **`<Analytics />` from `@vercel/analytics/next` is itself a thin client component package-internally, so it is safe to nest under the RSC root layout** (the consuming server component does NOT need `"use client"`).
  - Active view is derived from `useSelectedLayoutSegment()` — never mirror into Context or Zustand.
  - `lib/routes.ts` is single source of truth for 7 routes — Sidebar, CommandPalette, `app/sitemap.ts` all import from it. Phase 7 does NOT touch routes.ts.
- **Brownfield discipline:** When deleting `x-portfolio-source` header slot, do it in the same commit that ships the replacement state (which is: nothing, per D-04 — RESOLVED-as-dropped). The commit message must reference DEV-03 status update and Phase 5 D-30.
- **Backend type changes ship as paired commits** — Phase 7 has NO backend changes (D-23), so this rule is dormant but worth restating so it isn't accidentally violated.
- **Dual audience non-negotiables:** Persistent resume button on every viewport (preserved by D-12 — onClick added, semantics unchanged); plain-noun `aria-label` on sidebar rows (untouched); mobile sidebar redistributes (untouched); **5-second recruiter test is a real exit criterion** (DEPLOY-04).
- **Build/test commands:** `npm run dev`, `npm run build` (INFRA-05 prebuild grep + PDF + DOCX magic-byte gates run BEFORE next build), `npm run lint`, `npm test` (Vitest). Backing API at `http://localhost:8080` is optional. Phase 7 must not break any of these.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Production URL canonicalization (`NEXT_PUBLIC_SITE_URL`) | Vercel Platform (env var, build-time) | Frontend Server (RSC reads at build) | `NEXT_PUBLIC_*` is **inlined into the JS bundle at `next build`** — change requires redeploy. Set at Vercel Project Settings → Production scope; the value is consumed by `app/layout.tsx` `metadataBase`, `app/sitemap.ts`, `app/robots.ts` at build time. |
| `metadataBase` propagation | Frontend Server (RSC) | — | Root `app/layout.tsx` exports `metadata.metadataBase`. All OG image absolute URLs (8 `opengraph-image.tsx` from Phase 5) resolve against it automatically. No per-file edit needed. |
| HTTP response headers (`x-built-with`, security) | Edge/Vercel (next.config.ts `headers()`) | — | Declared in `next.config.ts`. Phase 7 removes the `x-portfolio-source` slot from `engineerHeaders`. |
| Analytics auto-page-view tracking | Browser / Client (thin client island) | Edge (Vercel collects via `/_vercel/insights/*`) | `<Analytics />` from `@vercel/analytics/next` is a client component that registers route-change listeners and POSTs page-view beacons. Mounts in root layout; RSC layout itself stays server. |
| `resume_download` custom event | Browser / Client (TopBar `onClick`) | Edge (Vercel `/_vercel/insights/event`) | `track()` runs in the browser only. TopBar is already `"use client"`. SDK uses `navigator.sendBeacon` (with `fetch keepalive` fallback) — designed for fire-and-forget pre-navigation. |
| Search Console verification | External (DNS provider — Vercel DNS panel) | — | DNS TXT record at the apex domain. Verification is one-time; the record stays in DNS forever (do not delete). |
| Search Console sitemap submission | External (GSC web UI) | Frontend Server (`app/sitemap.ts` serves the file) | One-time UI action after verification. Re-crawl is async; we don't block on full indexing. |
| Lighthouse/PSI audit | External (`pagespeed.web.dev` runs Lighthouse remotely) | — | Zero install. PSI's lab data engine **is Lighthouse**, same scoring. We capture screenshots as evidence. |
| `npm audit` / `npx knip` | Local CLI | CI (already wired in `.github/workflows/ci.yml` from Phase 1 INFRA-03) | Pre-close-out gate, run locally and recorded. CI continues to run on every PR. |
| 5-second recruiter test | Manual (one non-engineer) | — | Human attestation. Time-to-resume + time-to-contact recorded as evidence. |
| 375px shell screenshot review | Manual (Chrome DevTools emulation) | — | Per D-18, no physical device. DevTools 375px viewport across 7 routes; screenshots committed as evidence. |

## Standard Stack

### Core (new for Phase 7)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@vercel/analytics` | `^2.0.1` | Page-view tracking + `track()` custom events on Vercel-hosted apps | Vercel's first-party SDK. The `<Analytics />` component is a thin client wrapper that uses `navigator.sendBeacon()` (with `fetch keepalive` fallback) — the exact primitive engineered for fire-and-forget pre-navigation tracking (e.g. `<a download>` clicks). v2.0.x is current as of 2026-04-17. Peer deps: `react: ^18 \|\| ^19 \|\| ^19.0.0-rc` and `next: >= 13` — **fully compatible with this repo's React 19.1.0 + Next 15.5.18**. [VERIFIED: npm view @vercel/analytics version → 2.0.1, time.modified 2026-04-17] [CITED: Vercel docs `/docs/analytics/quickstart`] |

### Supporting (existing, no version change)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next` | `^15.5.18` | Framework — provides RSC, metadata API, `headers()` config, `sitemap.ts` convention, `<Link>` prefetch | Already in place. Phase 6 1d9a295 bumped 15.5.15 → 15.5.18 for Vercel May 2026 CVE — re-verify in D-21. [VERIFIED: package.json] |
| `next-themes` | `^0.4.6` | Theme management | Existing; untouched in Phase 7. [VERIFIED: package.json] |
| `cmdk` | `^1.1.1` | Command palette | Existing; untouched in Phase 7. [VERIFIED: package.json] |
| `knip` | `^6.11.0` | Dead-code/unused-export detection | Already a devDep; Phase 7 runs `npx knip` as a gate. v6.x is current line (6.13.1 latest 2026-05-12). [VERIFIED: npm view knip version → 6.13.1] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@vercel/analytics` `<Analytics />` from `/next` | `<Analytics />` from `/react` (CRA pattern) | **DON'T.** The `/next` entry point includes route-change detection for the App Router (uses `usePathname`/`useSelectedLayoutSegment` internally to fire SPA-style page views on client-side navigation). The `/react` entry point is for plain React apps with no router awareness — using it in Next.js means missing client-nav page views (only the initial hard-load registers). [CITED: vercel.com/docs/analytics/quickstart — nextjs-app code example uses `import { Analytics } from '@vercel/analytics/next'`] |
| `@vercel/analytics` | Plausible / Umami / PostHog / Google Analytics | Plausible/Umami/PostHog would all work but require account setup, script tag config, and an extra DNS lookup. Vercel Analytics is zero-config when the project is already on Vercel (which this is) and the dashboard is already visible in the same UI as deploys. Privacy-friendly (no cookies, GDPR-compliant out of the box). Locked by D-08. |
| `@vercel/speed-insights` (RUM, paired with Analytics) | Defer | D-08 explicitly defers RUM/Speed Insights to v1.1. Lighthouse on production URL covers DEPLOY-02; field metrics are nice-to-have. |
| PSI web UI | `lighthouse` CLI / `npx lighthouse <url>` | CLI gives JSON export but adds install friction. PSI web UI is **the same Lighthouse engine** with zero install — captured via screenshot. D-14 picks web UI. |
| PSI web UI | DebugBear / Calibre / SpeedCurve (commercial) | Continuous monitoring is overkill for v1; PSI is the one-shot canonical check. |
| `npm audit` | `socket.dev` / Snyk / `npm-check-updates` | npm audit is the standard CI gate; the others have their place but D-21 locks `npm audit` as the gate. |

**Installation (Phase 7 plan-wave-1 command):**

```bash
npm install @vercel/analytics@^2.0.1
```

**Version verification (verify on the day of execution):**

```bash
npm view @vercel/analytics version  # Confirm still ^2.0.x
npm view knip version               # Confirm 6.x line still current
```

[VERIFIED 2026-05-13: `npm view @vercel/analytics version` → `2.0.1`, `time.modified` → `2026-04-17T21:50:20.922Z`; `npm view knip version` → `6.13.1`, `time.modified` → `2026-05-12T15:13:42.795Z`]

## Architecture Patterns

### System Architecture Diagram

```
                          ┌──────────────────────────────┐
                          │ External Verification Surface │
                          │                              │
            ┌─────────────┤  PageSpeed Insights (PSI)    │
            │             │   - Lighthouse engine        │
            │             │   - Mobile profile           │
            │             │   - 3-run median methodology │
            │             │                              │
            │             │  Google Search Console (GSC) │
            │             │   - DNS TXT verification     │◄────┐
            │             │   - Domain property          │     │
            │             │   - Sitemap submission       │     │ DNS panel
            │             │                              │     │
            │             │  Vercel Analytics Dashboard  │     │
            │             │   - Page views (auto)        │     │
            │             │   - resume_download events   │     │
            │             └──────────────────────────────┘     │
            │                                                   │
            ▼                                                   │
  ┌──────────────────────────────────────────────────────────┐ │
  │ Production: https://www.tatibekov.com                    │ │
  │                                                          │ │
  │  ┌────────────────────────────────────────────────────┐  │ │
  │  │ Vercel Edge (CDN + middleware + headers)           │  │ │
  │  │  - Strict-Transport-Security                       │  │ │
  │  │  - X-Frame-Options: DENY                           │  │ │
  │  │  - x-built-with: nextjs-15-react-19                │  │ │
  │  │  - (x-portfolio-source removed — Phase 7 D-04)     │  │ │
  │  └─────────────────────┬──────────────────────────────┘  │ │
  │                        │                                 │ │
  │  ┌─────────────────────▼──────────────────────────────┐  │ │
  │  │ Next.js 15.5.18 (Vercel serverless)                │  │ │
  │  │                                                    │  │ │
  │  │  app/layout.tsx (RSC)                              │  │ │
  │  │   ├── metadataBase = new URL(NEXT_PUBLIC_SITE_URL) │  │ │
  │  │   ├── <HeadComment /> + <JsonLdPerson />           │  │ │
  │  │   └── <Analytics /> (NEW — thin client island)     │  │ │
  │  │                                                    │  │ │
  │  │  app/(terminal)/layout.tsx (RSC)                   │  │ │
  │  │   └── <TopBar />  (client)                         │  │ │
  │  │        └── <a href={resumeUrl} download            │  │ │
  │  │              onClick={() => track("resume_         │  │ │
  │  │              download")}>                          │  │ │
  │  │                                                    │  │ │
  │  │  app/sitemap.ts  → 7 entries × www.tatibekov.com   │  │ │
  │  │  app/robots.ts   → sitemap pointer                 │  │ │
  │  └─────────────────────┬──────────────────────────────┘  │ │
  │                        │                                 │ │
  │                        │ fetch ISR                       │ │
  └────────────────────────┼─────────────────────────────────┘ │
                           │                                   │
                           ▼                                   │
  ┌──────────────────────────────────────────────────────────┐ │
  │ Railway: portfolio-services (unchanged in Phase 7)       │ │
  │  https://personal-portfolio-services-production...       │ │
  │   7 endpoints, Mongo-backed, D-22 smoke gate re-runs     │ │
  └──────────────────────────────────────────────────────────┘ │
                                                                │
  ┌──────────────────────────────────────────────────────────┐ │
  │ Vercel Project Settings (out-of-repo control surface)    │ │
  │  - Environment Variables → Production scope              │ │
  │     NEXT_PUBLIC_SITE_URL = https://www.tatibekov.com     │ │
  │     NEXT_PUBLIC_API_BASE_URL = <Railway URL>             │ │
  │  - Domains → tatibekov.com (307 → www) + www (Primary)   │ │
  │  - DNS → TXT record for GSC verification ────────────────┼─┘
  │  - Analytics → toggle ON (one-time enable)               │
  └──────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (Phase 7 additions/changes)

```
portfolio-web/
├── .planning/phases/07-deploy-verification/
│   ├── 07-CONTEXT.md                      # exists
│   ├── 07-RESEARCH.md                     # THIS FILE
│   ├── 07-PLAN.md (TBD)                   # planner output
│   ├── 07-VALIDATION.md (TBD)             # planner output (from this RESEARCH)
│   ├── 07-VERIFICATION.md (TBD)           # close-out evidence
│   ├── lighthouse/                        # NEW — committed PSI screenshots
│   │   ├── about-mobile.png
│   │   ├── projects-mobile.png
│   │   ├── stack-mobile.png
│   │   ├── experience-mobile.png
│   │   ├── writing-mobile.png
│   │   ├── contact-mobile.png
│   │   └── shipped-mobile.png
│   └── screenshots/375/                   # NEW — committed 375px shell review
│       ├── about-375.png
│       ├── projects-375.png
│       ├── stack-375.png
│       ├── experience-375.png
│       ├── writing-375.png
│       ├── contact-375.png
│       └── shipped-375.png
├── app/
│   ├── layout.tsx                         # MODIFIED — mount <Analytics />
│   └── components/shell/
│       └── top-bar.tsx                    # MODIFIED — onClick={() => track("resume_download")}
├── next.config.ts                         # MODIFIED — drop x-portfolio-source slot from engineerHeaders
├── .env.example                           # MODIFIED — production-URL hint comment
├── CLAUDE.md                              # MODIFIED — third-prod-dep exception note
├── package.json                           # MODIFIED — @vercel/analytics added
└── (Vercel Project Settings — out of repo)
    └── NEXT_PUBLIC_SITE_URL = https://www.tatibekov.com   (Production scope)
```

### Pattern 1: Vercel Analytics in Next.js App Router

**What:** Mount `<Analytics />` from `@vercel/analytics/next` inside `<body>` of the root layout. The component is a thin client wrapper that auto-collects page views (including client-side route changes via `usePathname`).

**When to use:** Any Next.js App Router project hosted on Vercel that wants Vercel-native analytics.

**Why the `/next` entry point matters:** [CITED: vercel.com/docs/analytics/quickstart]
- `from '@vercel/analytics/next'` → App-Router-aware (handles `usePathname` route-change events)
- `from '@vercel/analytics/react'` → plain React (CRA-style, no router awareness)
- `from '@vercel/analytics'` (bare) → exports `track()` and `inject()` only, not `<Analytics />`

**Example:**

```tsx
// Source: vercel.com/docs/analytics/quickstart (nextjs-app)
// app/layout.tsx
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Adapted for this repo (preserving existing structure):**

```tsx
// app/layout.tsx (Phase 7 delta — see existing file at lines 60-83)
import { Analytics } from "@vercel/analytics/next";
// ... existing imports ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <AccentBootstrapScript />
        <HeadComment />
        <JsonLdPerson />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
        <Analytics />  {/* NEW — last child of <body>, after providers */}
      </body>
    </html>
  );
}
```

**Trade-offs:**
- ✅ Zero config beyond `npm install` + `<Analytics />` + Vercel UI "Enable" toggle
- ✅ Auto-tracks SPA route changes (handles the persistent-shell click-from-`/`-to-`/projects` case)
- ✅ No cookies, GDPR-compliant
- ⚠️ Free tier has limits (2.5K events/month then sampled)
- ⚠️ Dashboard data appears after the first real visit + 5-10 min lag

### Pattern 2: `track()` from a client component for download buttons

**What:** Import `{ track }` from bare `@vercel/analytics` (NOT from `/next` — that's only for the `<Analytics />` component). Fire it from an existing `onClick` on the `<a href={resumeUrl} download>` anchor. **Do not call `preventDefault()`** — let the browser's native download proceed in parallel. The SDK uses `navigator.sendBeacon()` (with `fetch({keepalive: true})` fallback) which is engineered for exactly this pre-navigation case.

**When to use:** Any user-action tracking where the action itself causes a navigation/download/window-close.

**Trade-offs:**
- ✅ `sendBeacon`/`keepalive` delivers the event even if the browser starts the download immediately
- ✅ Type-safe — `track(name: string, props?: Record<string, AllowedValue>)` exported
- ✅ Bundle cost: <2KB gzipped per import (track is a function reference, not a component)
- ⚠️ Cannot use top-level `track()` in a Server Component — must be inside a `"use client"` component (TopBar is already client)
- ⚠️ If `<Analytics />` isn't mounted at the layout level, `track()` calls are no-ops but don't error

**Example (canonical pattern from Vercel docs):**

```tsx
// Source: vercel.com/docs/analytics/custom-events (nextjs-app)
import { track } from "@vercel/analytics";

function SignupButton() {
  return (
    <button onClick={() => {
      track("Signup");
    }}>
      Sign Up
    </button>
  );
}
```

**Adapted for this repo (TopBar `<a download>`):**

```tsx
// app/components/shell/top-bar.tsx (Phase 7 delta — existing file at lines 1-70)
"use client";

import { useTheme } from "next-themes";
import { track } from "@vercel/analytics";  // NEW
import { usePalette, useDrawer } from "@/app/components/shell/shell-state-provider";
import { LiveClock } from "@/app/components/shell/live-clock";
import { PROFILE } from "@/lib/portfolio-data";

export function TopBar() {
  // ... existing hooks ...

  return (
    <header className="topbar">
      {/* ... existing affordances ... */}

      {/* Persistent resume download — NEVER hidden at any viewport (SHELL-03 / Risk 3) */}
      <a
        className="topbar-btn topbar-resume"
        href={PROFILE.resumeUrl}
        download="Bakytbek_Tatibekov_Resume.pdf"
        aria-label="Download resume"
        onClick={() => track("resume_download")}  /* NEW — no preventDefault; fire-and-forget */
      >
        ↓ resume.pdf
      </a>
    </header>
  );
}
```

### Pattern 3: Vercel env-var → Production scope → redeploy → effect

**What:** `NEXT_PUBLIC_*` env vars are **inlined into the JS bundle at `next build` time**. Setting the var in Vercel without redeploying will NOT change the value the browser sees. The flow is: (1) Vercel Dashboard → Project Settings → Environment Variables → "Add New" with Production scope checked, (2) trigger a redeploy. [CITED: vercel.com/docs/environment-variables; nextjs.org/docs/pages/building-your-application/configuring/environment-variables]

**Two redeploy options:**
1. **Vercel UI:** Deployments tab → menu on latest deployment → "Redeploy" → uncheck "Use existing Build Cache" (optional but safer)
2. **Empty git commit:** `git commit --allow-empty -m "chore: redeploy with NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com"` then `git push`

D-22 (Claude's Discretion) **recommends git-commit path** for audit trail consistency with Phase 6 Plan 09's cutover commit (FE 2610cae).

**Verification after redeploy:**

```bash
# Inspect the build's emitted HTML to confirm metadataBase is www
curl -s https://www.tatibekov.com/ | grep -i 'og:url\|canonical' | head -5

# Inspect sitemap
curl -s https://www.tatibekov.com/sitemap.xml | grep -c '<loc>'  # → 7

# Inspect that all 7 routes serve 200
for path in / /projects /stack /experience /writing /contact /shipped; do
  echo -n "$path → "
  curl -sI "https://www.tatibekov.com$path" | head -1
done
```

### Pattern 4: PageSpeed Insights 3-run median methodology

**What:** PSI is the same Lighthouse engine Google uses for Core Web Vitals reporting [CITED: developers.google.com/speed/docs/insights/v5/about]. **Single runs are noisy.** Google's own variability guidance recommends running Lighthouse 3-5 times and using the median (specifically `computeMedianRun` finds the run closest to median FCP + TTI). [VERIFIED: GoogleChrome/lighthouse repo `docs/variability.md`]

**Why a single PSI run isn't enough:**
- Network availability and hardware contention introduce variance
- First-run includes Lighthouse's own warm-up cost (DNS, font subset, asset hydration)
- Performance score is calculated from weighted metric percentiles → small metric variance → large score swings near threshold boundaries

**Phase 7 protocol (per D-14 + D-16 + D-17):**
1. Open `https://pagespeed.web.dev/?url=https://www.tatibekov.com/<route>` for each of 7 routes
2. Run mobile profile **3 times per route**, waiting ~30 seconds between runs
3. Record the **median run's** values into the 7×6 scores table
4. Capture the median run's PSI dashboard as PNG → `.planning/phases/07-deploy-verification/lighthouse/<route>-mobile.png`
5. If median misses any threshold → identify smallest fix → ship as paired plan within Phase 7 → re-run 3× → repeat until 42/42 cells pass

**What PSI reports:**
- **Field data (CrUX, 28-day rolling window):** "Not enough data" expected for a brand-new domain — this is normal, not a failure. The lab data (Lighthouse) is the gate.
- **Lab data (Lighthouse synthetic):**
  - Performance score (0-100, threshold ≥ 90 = green)
  - Accessibility score (threshold ≥ 95)
  - SEO score (threshold ≥ 95)
  - Best Practices (informational)
  - Core Web Vitals lab measurements: LCP (≤ 2.5s), CLS (≤ 0.1), INP (≤ 200ms)
  - Plus FCP, TTI, TBT, Speed Index (informational)
- **Throttling profile (mobile):** Moto G4 device, slow 4G network simulation [CITED: developers.google.com/speed/docs/insights/v5/about]

### Pattern 5: Google Search Console DNS TXT Domain property

**What:** A **Domain property** covers `tatibekov.com` + `www.tatibekov.com` + all subdomains under one verification. Verification is DNS-only (no HTML file, no meta tag). [CITED: support.google.com/webmasters/answer/9008080]

**Step-by-step flow:**
1. **GSC web UI:** `https://search.google.com/search-console` → Add property → choose "Domain" → enter `tatibekov.com` (apex, no `www.`, no protocol)
2. GSC generates a TXT record like `google-site-verification=AbCdEf1234567890`
3. **Vercel DNS panel** (since DNS is delegated to Vercel for this domain): Dashboard → `tatibekov.com` → DNS tab → Add Record → Type: TXT, Name: `@` (root), Value: paste the verification string, TTL: 60 (or default)
4. Wait for propagation (typically minutes, can take "a day or two" per Google's own docs)
5. Click "Verify" in GSC. The TXT record stays in DNS forever — do not delete it after verification.
6. After verification: GSC sidebar → Sitemaps → enter `sitemap.xml` (relative path) → Submit

**Index status semantics for a brand-new domain:** [CITED: support.google.com/webmasters/answer/7440203 + multiple SEO sources verified 2026-05-13]

| Status | Meaning |
|--------|---------|
| **Discovered – currently not indexed** | Google knows the URL exists (from sitemap or links) but **has not yet crawled** it. For new domains, 7-21 days is normal. |
| **Crawled – currently not indexed** | Google fetched the page but **chose not to add** to the index (quality/value signal). May resolve naturally as the domain accrues trust. |
| **Indexed** | Page is in Google's search index. Discoverable via `site:www.tatibekov.com <path>` query. |

**For a brand-new domain submitted on Phase 7 close-out day:**
- Submitting the sitemap → status "Success" within a few hours (GSC parsed the XML)
- Per-page status: likely **all 7 in "Discovered – currently not indexed"** within the phase wall-clock window
- D-07 explicitly accepts this: spec says "indexed or 'Discovered' status pending crawl" with ≥4 of 7 routes showing any of the three statuses

**Don't:** Use the URL Inspection tool to "Request Indexing" for each of 7 routes — it's rate-limited, slow, and doesn't change the outcome materially.

### Pattern 6: `npm audit` for CI gating

**What:** `npm audit` reports known vulnerabilities in installed dependencies (direct + transitive). Default exit code is non-zero if ANY vulnerability is found at any severity. **For CI gating, use `--audit-level` to set the minimum severity that fails the command.** [CITED: docs.npmjs.com/cli/v9/commands/npm-audit]

**Recommended Phase 7 command:**

```bash
npm audit --omit=dev --audit-level=high
```

- `--omit=dev`: excludes devDependencies from the audit (Playwright/Vitest CVEs don't ship to users)
- `--audit-level=high`: exit non-zero only on high or critical (matches DEPLOY-05 spec "zero high/critical")

**For evidence-capture (full report):**

```bash
npm audit --omit=dev > .planning/phases/07-deploy-verification/audit-fe.txt
# Then also for the sibling repo
(cd ../portfolio-services && npm audit --omit=dev) > .planning/phases/07-deploy-verification/audit-be.txt
```

**Known transitive-dep noise (current ecosystem 2026):** Typical Next.js projects show 10-30 transitive "vulnerabilities" most without exploit paths. The `--audit-level=high` filter is what makes the gate meaningful. If a real high/critical surfaces, the fix is `npm audit fix` or upgrading the dep manually.

**Phase 6 precedent:** 1d9a295 bumped `next` 15.5.15 → 15.5.18 specifically to clear a Vercel CVE warning. Phase 7 re-running `npm audit` validates that fix held.

### Pattern 7: `npx knip` for unused-code detection

**What:** Knip finds unused files, exports, dependencies, and types. v6.x is current line (6.13.1 latest 2026-05-12). Already configured in this repo via `knip.json` (Phase 1 INFRA-03). [CITED: knip.dev]

**Phase 7 command:**

```bash
npx knip
```

Default exit code: non-zero on ANY issue (unused files, unused exports, unused deps). DEPLOY-05 spec requires zero issues.

**Known Next.js App Router behavior:** Knip's built-in Next.js plugin auto-recognizes `layout.tsx`, `page.tsx`, `route.ts`, `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx`, `apple-icon.tsx`, `not-found.tsx`, `error.tsx`, `loading.tsx` as entry points. **This repo's 8 `opengraph-image.tsx` files (Phase 5) + `sitemap.ts` + `robots.ts` + `app/icon.tsx` + `app/apple-icon.tsx` + `app/manifest.ts` + 7 `page.tsx` + 2 layouts + `not-found.tsx` are all auto-detected — no manual entry config needed.**

**Test files:** Knip's Next.js plugin recognizes `*.test.tsx` and `*.spec.ts` via the Vitest plugin (auto-enabled when vitest is in devDeps).

**If Phase 7 introduces false positives** (e.g., new `<Analytics />` import in `app/layout.tsx` looks "unused" — it won't, but if): the fix is to add a `// knip-ignore` directive or update `knip.json` ignore patterns. **Don't expect this; knip handles Next.js components fine.**

### Anti-Patterns to Avoid

- **Mounting `<Analytics />` in the wrong entry point:** Using `@vercel/analytics/react` instead of `@vercel/analytics/next` means client-nav page views are missed. Use `/next`.
- **Calling `track()` from a Server Component:** Will fail with a "track is not defined in this environment" error. Must be inside a `"use client"` component.
- **Using `preventDefault()` on the resume button after `track()`:** Defeats the purpose — would block the download. The `sendBeacon` pattern is specifically what avoids needing `preventDefault`.
- **Setting `NEXT_PUBLIC_SITE_URL` and expecting it to take effect without a redeploy:** `NEXT_PUBLIC_*` is build-time inlined; a redeploy is mandatory.
- **Running PSI once and claiming "Perf = 87":** Variance is significant; the median of 3-5 runs is the canonical signal.
- **"Request Indexing" loop for each of 7 routes in GSC:** Rate-limited, slow, and Discovered → Indexed conversion is async/quality-gated; submitting the sitemap is enough.
- **Deleting the GSC TXT verification record after verification succeeds:** The record must stay in DNS forever (or GSC re-verifies and may un-verify the property). Treat it as permanent.
- **Trusting `npm audit` exit code with default settings in CI:** A single moderate-severity dev-dep CVE will fail the build. Use `--audit-level=high --omit=dev` for the gate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Page-view tracking on App Router | Hand-rolled `useEffect` + `usePathname` + `fetch('/api/track')` to a custom endpoint | `<Analytics />` from `@vercel/analytics/next` | The SDK handles client-side route detection, `sendBeacon`, error swallowing, ad-blocker resilience, dev-mode no-op, and respects DNT signals. Plus it's already wired into the Vercel dashboard. |
| Fire-and-forget event tracking on a download click | `fetch('/api/event', { method: 'POST' })` with manual `keepalive: true` | `track("resume_download")` from `@vercel/analytics` | SDK already implements `navigator.sendBeacon()` with `fetch keepalive` fallback. Hand-rolling means re-implementing the timing edge cases. |
| Lighthouse runner | `npx lighthouse <url> --output=json` then parsing JSON | PageSpeed Insights web UI + 3-run median + screenshot | PSI is the same Lighthouse engine; UI is zero-install and matches what Google's own Core Web Vitals reporting uses. |
| Site verification | Custom HTML meta tag in `<head>` (also offered by GSC) | DNS TXT Domain property | Domain property covers all subdomains + apex + www in one verification. HTML tag is per-prefix only and survives only as long as the HTML stays unchanged. |
| Sitemap generation | `next-sitemap` package or manual XML in `public/` | `app/sitemap.ts` (existing, native Next.js convention) | Already shipped Phase 2; iterates `lib/routes.ts`. No new dep needed. |
| Vulnerability scanner | Custom shell script grepping `package-lock.json` for known-bad versions | `npm audit --omit=dev --audit-level=high` | Standard tool, maintained by npm, integrates with CI exit codes. |
| Dead-code detector | Custom grep for unused exports | `npx knip` (already configured) | Already wired in Phase 1 with `knip.json`. |

**Key insight:** Phase 7 is "verify with standard tools, capture standard evidence." Hand-rolled equivalents add risk and don't earn anything because the standard tools are already integrated.

## Runtime State Inventory

> Phase 7 includes one rename-shaped operation (deleting `x-portfolio-source` slot). State inventory follows.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Phase 7 introduces no new persistent state. `@vercel/analytics` collects in Vercel's edge infra (out of repo); no DB writes. | None |
| Live service config | **Vercel Project Settings — Environment Variables (Production scope):** Add `NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com` (currently absent or set to Vercel-hostname). **Vercel Analytics toggle:** Dashboard → Analytics tab → "Enable" (one-time UI action). **Vercel DNS panel:** Add TXT record for GSC verification. | All three are Vercel UI edits (not git-tracked). Plan must include explicit tasks for each. |
| OS-registered state | None — no Task Scheduler, launchd, pm2, systemd registrations. Local dev only via `npm run dev`. | None |
| Secrets/env vars | `NEXT_PUBLIC_SITE_URL` is a public var (inlined into client bundle), not a secret. No secrets created or rotated in Phase 7. | None — verify `.env.example` updated with the new production-URL hint comment. |
| Build artifacts | **The previous Vercel build still has `NEXT_PUBLIC_SITE_URL=http://localhost:3000`** (or whatever the Phase 6 deploy used) **baked into its emitted JS**. A redeploy is REQUIRED to bake the new value. | After env var is set in Vercel UI, trigger redeploy (D-22 Claude's Discretion recommends `git commit --allow-empty`). Verify `metadataBase` in served HTML reflects new value. |

**The canonical question (applied):** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?* → **One thing: the existing Vercel build's emitted JS bundle.** A redeploy clears it. Without redeploy, the FE will continue claiming `metadataBase` is `http://localhost:3000` (or whichever value the last build saw), and the canonical URLs/OG image URLs will be wrong.

## Common Pitfalls

### Pitfall 1: PSI mobile score variance near thresholds

**What goes wrong:** First run shows Performance 87. Run again → 92. Run again → 89. Which one do you record?
**Why it happens:** Lab data variability (network simulation, Lighthouse warm-up, browser thread contention). Google's own docs acknowledge this and recommend median of 3-5 runs.
**How to avoid:** Run 3 times per route, record median (the middle value). Don't cherry-pick the highest run — that bias falls apart at the next regression.
**Warning signs:** Performance score within ±3 of the 90 threshold across runs → high variance route; consider running 5× for that route specifically.

### Pitfall 2: GSC sitemap submitted but no pages indexed after a day

**What goes wrong:** Brand-new domain, sitemap shows "Success" status, but URL Inspection on each page shows "Discovered – currently not indexed."
**Why it happens:** Brand-new domains have zero crawl trust signal. Google de-prioritizes them in crawl queue. 7-21 days is typical for first-page indexing.
**How to avoid:** This isn't a defect — D-07 explicitly accepts "Discovered" status as a passing condition. Don't burn time trying to force indexing.
**Warning signs:** If a page is "Crawled – currently not indexed" (not Discovered), that's a quality signal; may resolve naturally but worth flagging in `07-VERIFICATION.md`.

### Pitfall 3: `<Analytics />` mount looks like it works in dev but emits no events

**What goes wrong:** `npm run dev` → click resume button → check Vercel dashboard → no event.
**Why it happens:** The SDK explicitly **no-ops in development** (checks `process.env.NODE_ENV !== 'production'`). Also no-ops on non-Vercel hosts.
**How to avoid:** Verify the integration on the production URL (`https://www.tatibekov.com`), not localhost. The Vercel dashboard events panel updates ~5-10 minutes after first event fire.
**Warning signs:** No network request to `/_vercel/insights/*` in DevTools on prod → check `<Analytics />` is actually mounted (View Source for the script tag).

### Pitfall 4: `track()` import path confusion

**What goes wrong:** Developer imports `{ track }` from `@vercel/analytics/next` thinking it matches the `<Analytics />` import. TypeScript may or may not error depending on version.
**Why it happens:** `<Analytics />` lives at `@vercel/analytics/next`; `track` lives at bare `@vercel/analytics`. Easy to conflate.
**How to avoid:** Always use:
```ts
import { Analytics } from "@vercel/analytics/next";  // The component (App Router-aware)
import { track } from "@vercel/analytics";           // The function (universal)
```
**Warning signs:** TS error "Module '@vercel/analytics/next' has no exported member 'track'" → wrong import path.

### Pitfall 5: `NEXT_PUBLIC_SITE_URL` set but not redeployed

**What goes wrong:** Updated env var in Vercel UI. Visit `https://www.tatibekov.com/sitemap.xml` → URLs still show old value.
**Why it happens:** `NEXT_PUBLIC_*` is **build-time inlined** — the existing build still has the old value baked into emitted JS. Env var changes only apply to new deployments.
**How to avoid:** Always trigger a redeploy after changing a `NEXT_PUBLIC_*` var. Use empty commit (`git commit --allow-empty`) for git-log visibility, or Vercel UI "Redeploy" button.
**Warning signs:** Sitemap or canonical URLs show old origin → did you redeploy?

### Pitfall 6: GSC verification TXT record accidentally deleted

**What goes wrong:** Months later, GSC reports "Property unverified" because someone cleaned up "old" TXT records in DNS.
**Why it happens:** Verification TXT records are checked periodically by Google; deleting them un-verifies the property.
**How to avoid:** Add a comment when committing DNS changes elsewhere. Add a note in `07-VERIFICATION.md` documenting which TXT record is the GSC verification (not safe to remove).
**Warning signs:** GSC unverified email → check DNS panel for the TXT record presence.

### Pitfall 7: `npm audit` default exit code blocks the build on noise

**What goes wrong:** CI fails with `npm audit found 12 vulnerabilities (8 moderate, 3 high, 1 critical)`.
**Why it happens:** Default `npm audit` fails on ANY severity; transitive devDeps generate moderate-severity noise constantly.
**How to avoid:** Use `npm audit --omit=dev --audit-level=high` in the gate; that filters out devDep noise AND moderate-severity noise.
**Warning signs:** A high/critical surfaces in prod deps → that's a real signal; investigate, don't filter.

### Pitfall 8: PSI INP missing in lab data

**What goes wrong:** PSI report shows LCP and CLS but INP shows "—" or "N/A".
**Why it happens:** INP is a field metric — measured from real user interactions in CrUX. For a brand-new domain with no field data, INP **does not appear** in the field section. The lab section reports a "Total Blocking Time" surrogate but not INP.
**How to avoid:** This is expected for new domains. For DEPLOY-02 INP < 200ms verification, accept the lab TBT proxy as the gate signal for v1 (TBT < 200ms is a strong correlate of INP < 200ms). Document the substitution in `07-VERIFICATION.md`.
**Warning signs:** Reviewer expects field INP numbers; explain the new-domain field-data delay.

## Code Examples

### Production env var flip + redeploy

```bash
# Source: vercel.com/docs/environment-variables (verified flow)

# Step 1: Vercel Dashboard (manual, UI-only):
#   Project Settings → Environment Variables → Add New
#     Key:    NEXT_PUBLIC_SITE_URL
#     Value:  https://www.tatibekov.com
#     Scope:  ☑ Production  (uncheck Preview + Development)
#   Save

# Step 2: Trigger redeploy (D-22 recommends empty commit for audit trail)
git commit --allow-empty -m "chore(deploy): activate NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com (DEPLOY-01)"
git push

# Step 3: Verify (after Vercel deploy completes, ~60-90s)
curl -s https://www.tatibekov.com/sitemap.xml | grep -c '<loc>'
# Expected: 7

curl -s https://www.tatibekov.com/sitemap.xml | head -20
# Expected: <loc>https://www.tatibekov.com/...</loc> (NOT localhost or vercel.app)

for path in / /projects /stack /experience /writing /contact /shipped; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://www.tatibekov.com$path")
  echo "$path → $status"
done
# Expected: all 7 → 200
```

### `<Analytics />` mount + `track()` call

```tsx
// Source: vercel.com/docs/analytics/quickstart + custom-events (nextjs-app)

// app/layout.tsx — add to existing root layout
import { Analytics } from "@vercel/analytics/next";
// ... (existing imports unchanged) ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <AccentBootstrapScript />
        <HeadComment />
        <JsonLdPerson />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
```

```tsx
// app/components/shell/top-bar.tsx — single-line delta
"use client";

import { track } from "@vercel/analytics";  // NEW import
// ... (existing imports unchanged) ...

export function TopBar() {
  // ... (existing hooks/JSX unchanged) ...

  return (
    <header className="topbar">
      {/* ... existing affordances ... */}
      <a
        className="topbar-btn topbar-resume"
        href={PROFILE.resumeUrl}
        download="Bakytbek_Tatibekov_Resume.pdf"
        aria-label="Download resume"
        onClick={() => track("resume_download")}  // NEW — fire-and-forget
      >
        ↓ resume.pdf
      </a>
    </header>
  );
}
```

### `next.config.ts` — drop `x-portfolio-source` slot

```ts
// next.config.ts — Phase 7 D-04 delta
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

// Phase 7 D-04: x-portfolio-source slot DROPPED (repo is private). Keeps x-built-with.
const engineerHeaders = [
  { key: "x-built-with", value: "nextjs-15-react-19" }
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...engineerHeaders]
      }
    ];
  }
};

export default nextConfig;
```

### PSI mobile audit + screenshot capture (manual)

```
# For each of 7 routes, open:
https://pagespeed.web.dev/?url=https://www.tatibekov.com/
https://pagespeed.web.dev/?url=https://www.tatibekov.com/projects
https://pagespeed.web.dev/?url=https://www.tatibekov.com/stack
https://pagespeed.web.dev/?url=https://www.tatibekov.com/experience
https://pagespeed.web.dev/?url=https://www.tatibekov.com/writing
https://pagespeed.web.dev/?url=https://www.tatibekov.com/contact
https://pagespeed.web.dev/?url=https://www.tatibekov.com/shipped

# Per route:
# 1. Click "Analyze"
# 2. Wait ~30 seconds for first run
# 3. Note scores in scratch notes
# 4. Click "Analyze" again (run 2)
# 5. Click "Analyze" again (run 3)
# 6. Identify median values (middle of 3 runs per metric)
# 7. Screenshot the median run's mobile profile dashboard:
#    macOS: Cmd+Shift+4 → drag selection → save to
#    .planning/phases/07-deploy-verification/lighthouse/<route>-mobile.png
# 8. Record into 07-VERIFICATION.md scores table
```

### GSC sitemap submission

```
# Step 1: Add Domain property
#   https://search.google.com/search-console → Add Property → Domain
#   Enter: tatibekov.com
#   GSC generates: google-site-verification=<random-string>

# Step 2: Add TXT record in Vercel DNS
#   Vercel Dashboard → tatibekov.com → DNS → Add Record
#   Type: TXT, Name: @, Value: google-site-verification=<random-string>
#   Save (TTL default 60s or 5min)

# Step 3: Verify in GSC
#   Click "Verify" — typically succeeds within seconds-to-minutes

# Step 4: Submit sitemap
#   GSC sidebar → Sitemaps → Add a new sitemap
#   Enter: sitemap.xml  (relative; GSC fills www.tatibekov.com/ prefix)
#   Click Submit

# Step 5: Verify status (within hours)
#   GSC → Sitemaps → status should read "Success"
#   "Discovered URLs" should read 7

# Step 6: Per-route index status (within hours to weeks)
#   GSC → URL Inspection → enter each URL → record status
#   Acceptable for Phase 7 close: any of Discovered/Crawled/Indexed
#   Goal: ≥4 of 7 in any of those states (per D-07)
```

### `npm audit` + `npx knip` gates

```bash
# Frontend repo (this repo)
cd /Users/beckmaldinVL/development/personal-portfolio/portfolio-web
npm audit --omit=dev --audit-level=high
echo "FE audit exit: $?"   # Expected: 0

npx knip
echo "FE knip exit: $?"    # Expected: 0

# Backend repo (sibling, per D-21)
cd /Users/beckmaldinVL/development/personal-portfolio/portfolio-services
npm audit --omit=dev --audit-level=high
echo "BE audit exit: $?"   # Expected: 0
# (D-21: knip doesn't apply to BE in this milestone)

# Capture full output as evidence
cd /Users/beckmaldinVL/development/personal-portfolio/portfolio-web
npm audit --omit=dev > .planning/phases/07-deploy-verification/audit-fe.txt 2>&1
npx knip > .planning/phases/07-deploy-verification/knip-fe.txt 2>&1
```

### Backend smoke gate (D-22)

```bash
# Phase 6 D-11 pattern re-run against production Railway URL
cd /Users/beckmaldinVL/development/personal-portfolio/portfolio-services
PROD_API_URL=https://personal-portfolio-services-production.up.railway.app npm run smoke
echo "BE smoke exit: $?"  # Expected: 0  (7/7 endpoints green)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Analytics (gtag.js, cookies, ~50KB) | `@vercel/analytics` (no cookies, ~8KB, native to Vercel deploys) | Industry shift 2023-2024; Vercel ecosystem | Phase 7 picks the lighter, integrated option. No cookie banner needed. |
| HTML meta tag GSC verification | DNS TXT Domain property | Available since GSC v3 launch; promoted as preferred since 2019 | Phase 7 D-06 uses Domain property — covers all subdomains + survives HTML changes |
| Lighthouse CLI as the canonical runner | PageSpeed Insights web UI (same engine, zero install) | PSI v5 (2018) onwards — runs Lighthouse 10.x as of 2026 | Phase 7 D-14 picks PSI web UI; D-16 captures screenshots as evidence |
| `@vercel/analytics` v1.x | v2.x | v2.0.0 released 2026 | v2.x has improved track() typing + tighter App Router integration. Use latest 2.0.1. |
| `next-sitemap` package | Native `app/sitemap.ts` | Next.js 13.3+ added `sitemap.ts` as a built-in convention | Already in place since Phase 1/2 — Phase 7 does not regress to a package |

**Deprecated/outdated:**
- `@vercel/analytics/react` for Next.js projects: **not technically deprecated** but produces incorrect behavior in App Router (no client-nav page views). Always use `/next` for Next.js.
- Lighthouse v9 and older performance scoring weights: superseded by v10/v11. PSI uses the current weights automatically.
- GSC URL-prefix property (e.g. `https://www.tatibekov.com`): still works but Domain property is recommended for any multi-subdomain or apex+www scenario.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@vercel/analytics` v2.0.1 SDK uses `navigator.sendBeacon` with `fetch keepalive` fallback for `track()` calls (so `<a download>` clicks land before navigation without `preventDefault`) | Pattern 2 + Code Examples | LOW — confirmed in WebSearch results from Vercel changelog/changeset references; if wrong, the worst case is one missed event per ~100 clicks, which is acceptable. Plan can include a manual verification: click resume button on prod, check Vercel dashboard events tab 5-10 min later for the event count to increment. |
| A2 | Vercel DNS for `tatibekov.com` is hosted on Vercel (allowing direct TXT record addition via Vercel UI panel) | Pattern 5 | MEDIUM — if DNS is delegated elsewhere (e.g., Cloudflare, registrar's panel), the TXT record must be added there instead. Recommend planner add an explicit "discover DNS host" task before the GSC verification task. |
| A3 | The Phase 6 production deployment currently has `NEXT_PUBLIC_SITE_URL` either unset or set to the Vercel hostname `personal-portfolio-web-orcin.vercel.app` (so Phase 7 flip is a meaningful change) | Pattern 3 + Runtime State Inventory | LOW — confirmable by visiting `https://personal-portfolio-web-orcin.vercel.app/sitemap.xml` and inspecting `<loc>` values, or by reading Vercel env-var UI. Plan should include a "current state read" task as Task 0 of the redeploy plan. |
| A4 | PSI v5 in 2026 still uses Moto G4 device + slow-4G throttling for the mobile profile (some references suggest a newer device may have replaced it) | Pattern 4 | LOW — the threshold definitions (Perf ≥ 90, LCP < 2.5s, etc.) are device-independent; throttling profile change doesn't affect the gate. The "Moto G4" specifics in this doc are descriptive, not load-bearing. |
| A5 | Brand-new domain indexing typically settles to "Discovered" status within hours of sitemap submission (per multiple SEO sources, not Google's own docs verbatim) | Pattern 5 + Pitfall 2 | LOW — D-07 already accepts "Discovered" as passing, so even if first crawl takes longer the gate doesn't fail. If 0/7 are even "Discovered" within phase wall-clock, planner should flag for follow-up. |
| A6 | `npx knip` with the existing `knip.json` will pass clean on the post-Phase-7 codebase (adding `<Analytics />` + `track()` import doesn't introduce a false-positive flag) | Pattern 7 | LOW — Knip's Next.js plugin recognizes `app/layout.tsx` as an entry point; the new imports are reachable from it. Verify by running `npx knip` after each commit in the implementation plan, not just at close-out. |
| A7 | Vercel Web Analytics free tier still includes 2.5K events/month before sampling kicks in (specific quota may have changed) | Pattern 1 | LOW — for a personal portfolio with low traffic, even 100 events/month would be ample. If quota changed, the impact is sampling (not failure). Document in CONTEXT-style notes if exact quota matters for v1.1. |

**If this table is empty:** It is not empty — 7 assumptions logged. None are load-bearing enough to block the phase. A2 (DNS host) is the only one with non-trivial risk and is easy to resolve with a 30-second DNS lookup at plan time.

## Open Questions

1. **Is the GSC verification user `beckprograms@gmail.com` or a different account?**
   - What we know: User's email is `beckprograms@gmail.com` (from environment context).
   - What's unclear: Whether GSC will be set up under this account or a separate Google Workspace account.
   - Recommendation: Default to `beckprograms@gmail.com` in the plan; if the user wants a different account, that's a simple Vercel-side surface decision.

2. **Should the `personal-portfolio-web-orcin.vercel.app` alias be explicitly `noindex`'d?**
   - What we know: D-01 explicitly says NOT to noindex it — let Google de-duplicate via canonical URLs.
   - What's unclear: If GSC reports duplicate-content issues post-indexing, the v1.1 fix would conditionally `noindex` the Vercel hostname in `app/robots.ts`.
   - Recommendation: Accept the deferred decision; revisit only if duplicate-content surfaces in GSC's Coverage report.

3. **Slack/LinkedIn unfurl preview — fold into DEPLOY-04 or its own gate?**
   - What we know: Deferred from Phase 5 SEO-03c. CONTEXT.md `<deferred>` says "fold into Phase 7 close-out (5-min manual: send the production URL to a private Slack channel + LinkedIn DM, screenshot the unfurl)."
   - What's unclear: Whether it lives under DEPLOY-04 (recruiter test) or stands alone.
   - Recommendation: **Add as a sub-task under DEPLOY-04** — it's a "production-URL smoke test" in spirit. Evidence: 2 screenshots (Slack unfurl + LinkedIn unfurl) committed under `.planning/phases/07-deploy-verification/unfurl/`.

4. **Should the planner include a "rollback" plan in case Phase 7 breaks production?**
   - What we know: All Phase 7 changes are additive (env var flip, header deletion, dep add, analytics mount, event call). Vercel preserves deploy history; one-click revert is the rollback.
   - What's unclear: Whether to document this explicitly.
   - Recommendation: Add a one-paragraph "Rollback" note in `07-VERIFICATION.md` referring to Vercel deploy history. No code-level rollback plan needed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local dev + `npm` commands | ✓ | 22.x (per `package.json` engines) | — |
| npm (CLI) | `npm install`, `npm audit`, `npm run *` | ✓ | bundled with Node 22 | — |
| `git` | empty-commit redeploy + commits | ✓ | (Darwin 25.4.0) | — |
| `curl` | route-200 verification + sitemap check | ✓ | macOS bundled | — |
| Vercel Dashboard access | Env var flip, Analytics enable, DNS panel | Assumed ✓ | — | If revoked: ask user to re-authenticate |
| Google account for GSC | Domain property creation | Assumed ✓ | — | beckprograms@gmail.com per user context |
| Chrome browser (DevTools 375px emulation) | DEPLOY-07 screenshots | Assumed ✓ | recent | Firefox responsive design mode acceptable |
| Non-engineer human for 5-second recruiter test | DEPLOY-04 | **Coordination dependency** | — | If unavailable in phase wall-clock: defer to v1.1 (last resort) or mark "self-simulation only" with limitation note |
| `@vercel/analytics` npm package | DEPLOY-06 | Will install via npm during plan | 2.0.1 verified available | — |
| Railway production endpoint reachable | D-22 backend smoke gate | Confirmed live as of Phase 6 close | — | If down: D-22 fails; investigate per Railway dashboard |

**Missing dependencies with no fallback:**
- None blocking. The only soft dependency is the non-engineer human for DEPLOY-04 (Q5 in Open Questions).

**Missing dependencies with fallback:**
- Slack/LinkedIn account for unfurl preview (Open Q3) — if account isn't available, capture via cards.dev / opengraph.dev (third-party renderers) and note in evidence.

## Validation Architecture

Phase 7 is a **verification-heavy phase**. The validation architecture below maps the 7 DEPLOY requirements to the minimum set of gates that prove them without redundant work. Gates are grouped by category per the user instructions: (A) automated, (B) evidence-capture, (C) manual-attestation.

### Test Framework

| Property | Value |
|----------|-------|
| Test framework (unit/component) | Vitest 3.1.4 + @testing-library/react 16.2.0 + jsdom 26.1.0 |
| Test framework (E2E / contrast) | Playwright 1.59.1 (existing axe matrix, not regressed by Phase 7) |
| Config files | `vitest.config.ts`, `playwright.config.ts` |
| Quick run command | `npm test` (Vitest) |
| Full suite command | `npm run lint && npm run typecheck && npm test && npm run build && npx knip && npm audit --omit=dev --audit-level=high` |
| External tools (manual-runner) | PageSpeed Insights (`pagespeed.web.dev`), Google Search Console (`search.google.com/search-console`), Vercel Dashboard (`vercel.com`), Chrome DevTools (built into browser) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DEPLOY-01 | Production URL serves all 7 routes as HTTP 200 | smoke | `for p in / /projects /stack /experience /writing /contact /shipped; do curl -s -o /dev/null -w "%{http_code}\n" https://www.tatibekov.com$p; done \| sort -u` | ❌ Wave 0 (add as `scripts/check-routes-200.mjs`) |
| DEPLOY-01 | `metadataBase` reflects `www.tatibekov.com` | smoke | `curl -s https://www.tatibekov.com/sitemap.xml \| grep -c 'www.tatibekov.com'` (expect ≥ 7) | reuses existing `app/sitemap.ts` output |
| DEPLOY-02 | PSI mobile thresholds met across 7 routes × 6 metrics | manual + evidence | n/a (PSI web UI 3-run median) | ❌ Wave-N (PSI dashboard screenshots × 7 → `.planning/phases/07-deploy-verification/lighthouse/`) |
| DEPLOY-03 | Sitemap submitted to GSC | manual + evidence | n/a (GSC UI submission) | ❌ Wave-N (GSC submission screenshot → evidence) |
| DEPLOY-03 | npm audit: zero high/critical | automated | `npm audit --omit=dev --audit-level=high` | ✅ npm built-in |
| DEPLOY-03 | knip: zero unused | automated | `npx knip` | ✅ existing `knip.json` (Phase 1) |
| DEPLOY-04 | 5-second recruiter test passes on desktop + 375px mobile | manual attestation | n/a (human runs test) | ❌ Wave-N (recorded in `07-VERIFICATION.md`) |
| DEPLOY-04 | Slack/LinkedIn unfurl preview (Phase 5 carry) | manual + evidence | n/a (paste URL → screenshot) | ❌ Wave-N (Slack unfurl + LinkedIn unfurl screenshots → evidence) |
| DEPLOY-05 | (duplicated from DEPLOY-03; same automated commands) | automated | (see above) | ✅ |
| DEPLOY-06 | Vercel Analytics enabled (UI toggle) | manual + evidence | n/a (Vercel Dashboard screenshot) | ❌ Wave-N (Vercel Analytics tab screenshot → evidence) |
| DEPLOY-06 | `resume_download` event fires on production click | manual + evidence | n/a (click button on prod → wait 5-10 min → Vercel Events tab screenshot) | ❌ Wave-N (Vercel Events tab screenshot → evidence) |
| DEPLOY-06 | Existing TopBar tests still pass after `track()` addition | automated (regression) | `npm test -- top-bar.test.tsx` | ✅ existing `app/components/shell/top-bar.test.tsx` |
| DEPLOY-06 | `<Analytics />` mount tested at the layout level | automated (regression) | `npm test -- layout` (extend existing `app/layout.test.tsx` if present) | ⚠️ Verify existing layout test coverage; add 1 assertion if absent |
| DEPLOY-07 | All 7 routes verified at 375px Chrome DevTools | manual + evidence | n/a (DevTools 375px screenshots × 7) | ❌ Wave-N (`.planning/phases/07-deploy-verification/screenshots/375/` × 7) |
| DEPLOY-07 (D-22) | Backend smoke gate exits 0 (carry from Phase 6 D-11) | smoke | `PROD_API_URL=https://...railway.app npm run smoke` (in sibling repo) | ✅ existing `scripts/check-backend.mjs` (sibling) |
| Cross-cutting (D-04 / DEV-03) | `x-portfolio-source` no longer in response headers | smoke | `curl -sI https://www.tatibekov.com/ \| grep -c 'x-portfolio-source'` (expect 0) | ❌ Wave 0 (extend `scripts/check-headers.mjs` to assert absence) |
| Cross-cutting (D-04 / DEV-03) | `x-built-with` still present across 7 routes | smoke | `for p in <7 routes>; do curl -sI https://www.tatibekov.com$p \| grep -c 'x-built-with'; done` (each → 1) | ✅ existing `scripts/check-headers.mjs` (Phase 1) |

### Gate Inventory by Category

#### (A) Automated Gates — run on every commit + close-out

| Gate | Command | Covers | Exit Behavior |
|------|---------|--------|---------------|
| A1 | `npm test` | Existing 156 vitest assertions + new TopBar `track()` assertion + new layout `<Analytics />` mount assertion | exit 1 on any failure |
| A2 | `npm run lint` | ESLint flat config | exit 1 on any error |
| A3 | `npm run typecheck` | `tsc --noEmit` | exit 1 on any TS error |
| A4 | `npm run build` | Next.js production build + INFRA-05 placeholder grep + PDF/DOCX magic-byte gates | exit 1 on build/placeholder failure |
| A5 | `npx knip` | Zero unused files/exports/deps (DEPLOY-05) | exit 1 on any issue |
| A6 | `npm audit --omit=dev --audit-level=high` | Zero high/critical prod CVEs (DEPLOY-05) | exit 1 on any high/critical |
| A7 | `scripts/check-routes-200.mjs` (new Wave 0 script) | All 7 routes serve 200 on production (DEPLOY-01) | exit 1 on any non-200 |
| A8 | `scripts/check-headers.mjs` (extended) | `x-built-with` present + `x-portfolio-source` absent (DEV-03 + D-04) | exit 1 on header mismatch |
| A9 | `PROD_API_URL=<railway> npm run smoke` (sibling repo) | Backend 7/7 endpoints green (D-22) | exit 1 on any endpoint fail |

#### (B) Evidence-Capture Gates — run once at close-out, persisted to repo

| Gate | Method | Evidence File | Covers |
|------|--------|---------------|--------|
| B1 | PSI mobile 3-run median × 7 routes | `lighthouse/<route>-mobile.png` × 7 + scores table in `07-VERIFICATION.md` (7 rows × 6 cols = 42 cells) | DEPLOY-02 |
| B2 | GSC sitemap submission screenshot | `gsc/sitemap-submitted.png` | DEPLOY-03 |
| B3 | GSC per-route status table (URL Inspection results) | Table in `07-VERIFICATION.md` (7 rows: route, status, last-crawled, evidence pointer) | DEPLOY-03 |
| B4 | Vercel Analytics UI toggle ON | `vercel-analytics/enabled.png` | DEPLOY-06 |
| B5 | Vercel Events panel shows `resume_download` event after manual click | `vercel-analytics/event-fired.png` | DEPLOY-06 |
| B6 | DevTools 375px screenshots × 7 routes on production | `screenshots/375/<route>.png` × 7 + table in `07-VERIFICATION.md` (route, TopBar visible, no overflow, hamburger reachable, theme/accent reachable) | DEPLOY-07 |
| B7 | Slack + LinkedIn unfurl screenshots (Open Q3 — fold under DEPLOY-04) | `unfurl/slack.png` + `unfurl/linkedin.png` | DEPLOY-04 (carry from SEO-03c) |
| B8 | npm audit + knip full output | `audit-fe.txt` + `audit-be.txt` + `knip-fe.txt` | DEPLOY-05 (paired with A5/A6 exit codes) |

#### (C) Manual-Attestation Gates — human runs once, records verdict

| Gate | Method | Evidence | Covers |
|------|--------|----------|--------|
| C1 | Non-engineer × 2 devices: 5-sec recruiter test on production URL | Name, time-to-resume, time-to-contact, one-line path narrative, both devices, both runs (Phase 4 Gate 9 model) | DEPLOY-04 |
| C2 | Manual 375px shell review verdict per route (visual eyeball, paired with B6 screenshots) | PASS/FAIL per route in `07-VERIFICATION.md` shell-review table | DEPLOY-07 |
| C3 | Known-limitations declaration (DevTools-only real-device, no physical Safari/Chrome) | "Known limitations" section in `07-VERIFICATION.md` (D-18 wording) | DEPLOY-04 / DEPLOY-07 (consciously-accepted limitation) |

### Sampling Rate

- **Per task commit:** Wave-internal automated gates only (A1–A4) — fast iteration; `npm test` + `npm run lint` + `npm run typecheck`.
- **Per wave merge:** All automated gates (A1–A9 where applicable).
- **Phase gate (before `/gsd-verify-work`):** ALL gates green:
  - A1–A9: all exit 0
  - B1–B8: all evidence files present and committed
  - C1–C3: all verdicts recorded in `07-VERIFICATION.md`

### Wave 0 Gaps

The following test infrastructure must be created in Wave 0 (or Wave 1) before the verification waves run:

- [ ] `scripts/check-routes-200.mjs` — covers DEPLOY-01 (curl loop across 7 routes on production URL; configurable via `PROD_URL` env var; exit 1 on any non-200)
- [ ] `scripts/check-headers.mjs` extension — covers D-04 + DEV-03 (assert `x-built-with` present AND `x-portfolio-source` absent; works against `PROD_URL` env var)
- [ ] `app/layout.test.tsx` assertion — covers DEPLOY-06 mount (assert `<Analytics />` is rendered as a child of `<body>` — use `renderToStaticMarkup` or `react-dom/server` per Phase 5's precedent at Plan 05-05)
- [ ] `app/components/shell/top-bar.test.tsx` extension — covers DEPLOY-06 event firing (mock `@vercel/analytics` `track` function, assert it's called with `"resume_download"` on resume-button click — no `preventDefault` assertion needed since the test environment doesn't navigate)
- [ ] Directory scaffolding: `.planning/phases/07-deploy-verification/{lighthouse,screenshots/375,gsc,vercel-analytics,unfurl}/` — create empty `.gitkeep` files so the directory structure is committable before screenshots land

**Framework install:** None — all required test infrastructure is already present.

## Security Domain

`security_enforcement` is absent from `.planning/config.json` → treat as enabled. Phase 7's security surface is small (single new client-side dep, env-var flip, header deletion) but worth explicit review.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Static portfolio; no auth |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No protected resources |
| V5 Input Validation | partial | Phase 7 has no new user input. The single `track("resume_download")` event has no user-supplied data — it's a static event name. **No validation needed.** |
| V6 Cryptography | no | No new crypto; HTTPS preserved via Vercel + HSTS header |
| V7 Error Handling & Logging | minimal | `track()` is fire-and-forget; SDK swallows network errors silently (preferred behavior — analytics failures must not break the page) |
| V8 Data Protection | minimal | Vercel Analytics is privacy-first (no cookies, no PII, anonymous hashed visitor IDs). Compliant out of the box. |
| V9 Communication | yes | HSTS already enforced via `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in `next.config.ts`. **Unchanged in Phase 7.** |
| V10 Malicious Code | yes | `@vercel/analytics` is Vercel-owned, 2.0.1 from npm registry. Supply-chain risk assessed: official package, used by millions of Vercel deploys. Verify by inspecting `package-lock.json` integrity hash after install. |
| V11 Business Logic | no | No new logic |
| V12 Files and Resources | no | No new file handling |
| V13 API and Web Service | no | No new API endpoints |
| V14 Configuration | yes | Env var flip is configuration. Vercel scopes prevent leakage to Preview/Development. No secrets handled. |

### Known Threat Patterns for `Next.js + Vercel + @vercel/analytics`

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Analytics endpoint exfiltration (someone reads page-view data) | Information Disclosure | Vercel Analytics endpoint is per-project + auth-gated in Vercel Dashboard. No mitigation needed at app level. |
| Custom event name injection / log injection via `track()` | Tampering | `track("resume_download")` is a static string literal — no injection vector. If future events take user input, sanitize event names to alphanumerics + underscores. |
| CSRF on `/_vercel/insights/*` | Tampering | Vercel-managed endpoint; not addressable from app. POST requests are scoped to the project domain. |
| Mixed-content warnings if `NEXT_PUBLIC_SITE_URL` is `http://` | Information Disclosure / MITM | D-01 locks `https://www.tatibekov.com` (TLS-enforced). HSTS header enforces HTTPS for repeat visitors. |
| Subresource integrity for `@vercel/analytics` script | Tampering / Supply-Chain | npm `package-lock.json` integrity hash is the gate. Vercel doesn't serve the analytics script from its own CDN to the client — it's bundled into the app's Next.js build, so SRI is moot. |
| Removal of `x-portfolio-source` accidentally removes `x-built-with` | (process risk, not security) | `scripts/check-headers.mjs` (Wave 0 extension) assertion: `x-built-with` present + `x-portfolio-source` absent → exit 1 on either mismatch. |
| GSC verification TXT record exfiltration | Information Disclosure | The TXT record is publicly visible in DNS; that's not a leak — it only proves to Google that the domain owner placed it. No mitigation needed. |

**Net security posture:** Phase 7 does not regress security. The single addition (`@vercel/analytics`) is a Vercel-owned, privacy-first SDK. The deletion (`x-portfolio-source` slot) does not affect any security-relevant header. HSTS, X-Frame-Options, CSP-equivalents via `Referrer-Policy` and `Permissions-Policy` all remain in place via `next.config.ts` `securityHeaders` array (untouched).

## Sources

### Primary (HIGH confidence)

- **Vercel docs — `/docs/analytics/quickstart`** [CITED 2026-05-13] — App-Router-aware import path `@vercel/analytics/next`, mount-in-`<body>` pattern, dev-mode no-op behavior
- **Vercel docs — `/docs/analytics/custom-events`** [CITED 2026-05-13] — `import { track } from '@vercel/analytics'` (bare), function signature, custom-data limits (255 char max, no nested objects), Deployment Protection note
- **Vercel docs — `/docs/environment-variables`** [CITED 2026-05-13] — `NEXT_PUBLIC_*` build-time inlining, Production/Preview/Development scopes, redeploy requirement
- **Next.js docs — `/docs/pages/building-your-application/configuring/environment-variables`** [CITED 2026-05-13] — `NEXT_PUBLIC_*` inlined into JS bundle at `next build`
- **Google Developers — `/speed/docs/insights/v5/about`** [CITED 2026-05-13] — PSI = Lighthouse engine; mobile profile = Moto G4 + slow 4G; lab + field (CrUX 28-day rolling); Performance ≥ 90 / 50-89 / < 50 thresholds
- **GoogleChrome/lighthouse `docs/variability.md`** [CITED 2026-05-13 via WebSearch summary] — median of 5 runs is 2× more stable than 1; recommend 3-5 runs + median
- **Google Search Console Help — `/webmasters/answer/9008080`** [CITED 2026-05-13] — DNS TXT verification flow, Domain property covers apex + subdomains, propagation timeline minutes-to-days
- **Google Search Console Help — `/webmasters/answer/7440203`** [CITED 2026-05-13 via WebSearch summary] — Discovered/Crawled/Indexed status semantics
- **Google Search Console Help — `/webmasters/answer/7451001`** [CITED 2026-05-13 via WebSearch summary] — Sitemap submission flow + status interpretation
- **docs.npmjs.com — `/cli/v9/commands/npm-audit`** [CITED 2026-05-13] — Exit code semantics, `--audit-level`, `--omit=dev`, CI gating recommendations
- **knip.dev — `/reference/plugins/next`** [CITED 2026-05-13] — Auto-detects Next.js App Router entry points (layout/page/route/sitemap/robots/manifest/icon/og-image)
- **npm registry — `@vercel/analytics`** [VERIFIED 2026-05-13: `npm view @vercel/analytics version` → `2.0.1`, `time.modified` → `2026-04-17T21:50:20.922Z`, peer deps include `react: ^18 || ^19 || ^19.0.0-rc` and `next: >= 13`]
- **npm registry — `knip`** [VERIFIED 2026-05-13: `npm view knip version` → `6.13.1`, `time.modified` → `2026-05-12T15:13:42.795Z`]

### Secondary (MEDIUM confidence)

- WebSearch consolidated SEO sources (Onely, Yoast, SearchEngineLand) on "Discovered – currently not indexed" timelines for new domains: 7-21 days typical. Cross-referenced with Google's own docs (which acknowledge async crawl but don't give a specific number).
- WebSearch consolidated `@vercel/analytics` source-code references confirming `navigator.sendBeacon` + `fetch keepalive` fallback. Backed by Vercel's own changelog and Speed Insights documentation showing the same pattern.

### Tertiary (LOW confidence — none load-bearing)

- Pre-Phase-7 assumption that the `personal-portfolio-web-orcin.vercel.app` build was deployed with default `NEXT_PUBLIC_SITE_URL` — confirmable at plan time by reading Vercel Project Settings or `curl`'ing the current `/sitemap.xml`.

### Internal docs (this repo)

- `.planning/phases/07-deploy-verification/07-CONTEXT.md` — 23 locked decisions + Claude's Discretion + Deferred items
- `.planning/REQUIREMENTS.md` — DEPLOY-01..07 acceptance criteria
- `.planning/ROADMAP.md` §Phase 7 — Goal, dependencies, success criteria
- `.planning/research/STACK.md` — two-new-prod-deps rule (Phase 7 documents the exception)
- `.planning/research/ARCHITECTURE.md` — Persistent shell pattern, RSC boundary discipline, `<Analytics />` mount target
- `.planning/codebase/INTEGRATIONS.md` §Monitoring — env var slots
- `.planning/codebase/ARCHITECTURE.md` — RSC vs client island boundaries; TopBar already `"use client"`
- `.planning/phases/05-seo-accessibility-polish/05-VERIFICATION.md` — Carry-forwards to Phase 7
- `.planning/phases/04-mobile-responsive/04-VERIFICATION.md` — Gates 7+8 DEFERRED-PHASE-7
- `.planning/phases/06-backend-content-population/06-09-SUMMARY.md` — Phase 6 D-11 backend smoke gate pattern + cutover commit precedent

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH — `@vercel/analytics@2.0.1` peer-dep + entry-point + import-path all verified against current Vercel docs + npm registry. `knip@6.13.1` verified current.
- **Architecture (Analytics mount + track() pattern):** HIGH — App Router code example is directly from Vercel docs, adapted minimally for this repo's existing structure (which is already conventional).
- **PSI methodology:** HIGH — engine identity (Lighthouse) and mobile profile (Moto G4 + slow 4G) verified at Google Developers; 3-5 run median is canonical Lighthouse team guidance from `docs/variability.md`.
- **GSC DNS TXT + sitemap flow:** HIGH — flow verified against support.google.com docs; index-status semantics consistent across Google docs + multiple SEO authority sources; "Discovered for 7-21 days on new domains" is widely-cited but MEDIUM confidence on the exact range (treat as guidance, not contract — D-07 already accepts any of Discovered/Crawled/Indexed).
- **Vercel env-var → redeploy flow:** HIGH — `NEXT_PUBLIC_*` build-time inlining verified against both Vercel and Next.js docs.
- **npm audit + knip behavior:** HIGH for npm audit (official docs); HIGH for knip Next.js plugin entry-point auto-detection (knip.dev docs).
- **Pitfalls:** HIGH — each pitfall has a documented cause or precedent (Phase 6 cutover dynamics, Phase 5 axe-matrix variability handling).

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (30 days; `@vercel/analytics` is stable; PSI/GSC flows are slow-moving). If Phase 7 doesn't execute within 30 days, re-verify the two `npm view` checks at the top of "Standard Stack" and re-skim Vercel docs for any changes to `/docs/analytics/quickstart`.

---

*Phase: 07-deploy-verification*
*Research completed: 2026-05-13*
