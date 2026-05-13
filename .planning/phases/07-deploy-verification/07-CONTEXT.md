# Phase 7: Deploy + Verification - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

The production cutover is already complete (Phase 6 Plan 09 shipped Railway BE + flipped Vercel `NEXT_PUBLIC_API_BASE_URL`; site live at `https://personal-portfolio-web-orcin.vercel.app` and `https://personal-portfolio-services-production.up.railway.app`). Phase 7 finalizes the public surface and proves it works:

1. **Public URL finalization** — switch `NEXT_PUBLIC_SITE_URL` to the custom domain `https://www.tatibekov.com` (already wired in Vercel; apex 307s to www; Vercel hostname remains an alias). Update `app/layout.tsx` `metadataBase`, redeploy, verify all 7 routes return 200 on the custom domain (DEPLOY-01).
2. **Single instrumentation change** — install `@vercel/analytics` (3rd prod dep, exception documented), mount `<Analytics />` in `app/layout.tsx`, fire `track("resume_download")` from the TopBar resume button onClick (DEPLOY-06).
3. **`x-portfolio-source` deferral resolution** — DROP the header entirely from `next.config.ts` `engineerHeaders` (repo not public; the carry-forward closes as "removed", not "filled"). Keeps `x-built-with`. Updates DEV-03 carry status in Phase 5 D-30.
4. **Production-URL audit pass** — PageSpeed Insights on all 7 routes, mobile profile, must hit DEPLOY-02 thresholds (LCP <2.5s, CLS <0.1, INP <200ms, Perf ≥90, A11y ≥95, SEO ≥95); evidence persisted as scores table + screenshot directory; threshold misses get fixed in-place and re-audited.
5. **Search Console onboarding** — DNS TXT verification creating a Domain property at `tatibekov.com`; submit `sitemap.xml`; confirm all 7 routes show "Discovered" or "Indexed" status (DEPLOY-03).
6. **Manual verification gates** — `npm audit` zero high/critical + `npx knip` zero unused (DEPLOY-05); recruiter 5-second test on production by one non-engineer (both devices sequentially, Phase 4 Gate 9 model) (DEPLOY-04); 375px DevTools screenshot review (DEPLOY-07); real-device carry-forwards from Phase 4 Gates 7/8 + Phase 5 reduce-motion close via DevTools emulation (consciously-accepted limitation documented).

**Scope anchor:** production-URL verification + the one piece of analytics code DEPLOY-06 requires. No new features, no per-view code changes (unless a Lighthouse fix demands one), no admin endpoints, no chatbot work.

</domain>

<decisions>
## Implementation Decisions

### Public URL + canonical host

- **D-01:** **`NEXT_PUBLIC_SITE_URL = https://www.tatibekov.com`** as the canonical site URL. Apex `tatibekov.com` already 307s to `www.tatibekov.com` in Vercel (screenshot confirmed 2026-05-13). The Vercel hostname `personal-portfolio-web-orcin.vercel.app` stays as a Production alias (do NOT noindex it explicitly — let Google de-duplicate via canonical URLs from `app/sitemap.ts` once `metadataBase` is locked to www).
- **D-02:** Update `app/layout.tsx` `metadata.metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com")` and ensure `app/sitemap.ts` + `app/robots.ts` emit `www.tatibekov.com` URLs. OG image absolute URLs (8 sibling `opengraph-image.tsx` files from Phase 5) resolve against `metadataBase` — no per-file edit needed.
- **D-03:** **Set the env var in Vercel Project Settings → Environment Variables → Production** (NOT in `.env.local`, NOT committed to repo). After setting, redeploy via Vercel UI or `git commit --allow-empty -m "chore: redeploy with NEXT_PUBLIC_SITE_URL"`. `.env.example` gets updated to show the production value as a comment-style hint, NOT the active value.

### Engineer easter-egg headers

- **D-04:** **DROP `x-portfolio-source`** entirely from `next.config.ts` `engineerHeaders`. The repo is private, so pointing engineers at a GitHub URL they can't read serves no purpose. Removes the now-obsolete inline comment from `next.config.ts:11`. Closes Phase 5 D-30 DEFERRED-PHASE-7 as **RESOLVED-as-dropped** (not "filled"). Update REQUIREMENTS.md DEV-03 status to PASS-with-deviation (only `x-built-with` ships; `x-portfolio-source` removed by Phase 7 decision).
- **D-05:** **Keep `x-built-with: nextjs-15-react-19`** as the surviving engineer header. Discovery surface for engineers remains: console signature (Plan 05-06) + view-source HTML comment (Plan 05-05) + the actual GitHub URL inside `/contact` (when made public).

### Search Console + sitemap

- **D-06:** **Google Search Console verification via DNS TXT** creating a **Domain property** at `tatibekov.com`. One-time setup: GSC generates a TXT record, user adds it to Vercel DNS (or registrar DNS panel), GSC verifies. Domain property covers `www.tatibekov.com`, apex (which redirects), AND any future subdomains (e.g. `blog.tatibekov.com`, `staging.tatibekov.com`). Cleaner long-term than a URL property tied to one prefix.
- **D-07:** **Submit `https://www.tatibekov.com/sitemap.xml` in GSC** after verification completes. `app/sitemap.ts` iterates `lib/routes.ts` (7 entries) — submission triggers initial crawl. Index status check: ≥4 of 7 routes show "Discovered" / "Crawled" / "Indexed" within phase wall-clock window (Search Console indexing is async; we don't block on full indexing — DEPLOY-03 spec says "indexed or 'Discovered' status pending crawl").

### Analytics package + event surfaces

- **D-08:** **`@vercel/analytics` ONLY** (no `@vercel/speed-insights` in v1). Single new prod dep. Mount `<Analytics />` in `app/layout.tsx` server component (the package's `<Analytics />` is a thin client component internally — safe to nest under the RSC layout per package docs).
- **D-09:** **Prod-dep exception documented.** CLAUDE.md "two new prod deps total: next-themes, cmdk — do not introduce others without revisiting STACK.md" — `@vercel/analytics` is the documented exception for Phase 7 DEPLOY-06. Update CLAUDE.md to add it to the allowlist (or add a sentence: "Phase 7 added `@vercel/analytics` for resume-download tracking — third and final v1 prod dep").
- **D-10:** **`resume_download` event fires from TopBar resume button ONLY.** Single surface = single instrumentation point = single recurring signal. Palette `download_resume` verb, `/about` AboutSocials CTA, and sidebar recruiter card all keep their existing plain `<a href="/resume.pdf" download>` behavior — no `track()` call. Future v2 (ANALY-V2-01) can fan out.
- **D-11:** **Bare event payload** — `track("resume_download")` with no properties. Validates DEPLOY-06 exactly. Dashboard shows count over time. Viewport / theme / accent segmentation deferred to v2.
- **D-12:** **TopBar resume button becomes a thin client island wrapping the existing `<a>` link**, OR the existing `TopBar` (which is already `"use client"`) gains an onClick on the resume anchor that calls `track("resume_download")` without `preventDefault()`. Either way, the `<a href="/resume.pdf" download>` semantics are preserved — no nav interception, just a fire-and-forget event before the download proceeds.
- **D-13:** **No v2 pull-forward.** ANALY-V2-01 (theme change, accent change, palette open events) stays deferred per ROADMAP. Phase 7 hits DEPLOY-06 exactly and stops.

### Lighthouse audit methodology

- **D-14:** **PageSpeed Insights web tool** (`https://pagespeed.web.dev/?url=<route>`) as the canonical Lighthouse runner. Zero install. Same scoring engine Google uses for Core Web Vitals reporting in Search Console. Run mobile profile (DEPLOY-02 spec). Desktop profile is optional/informational.
- **D-15:** **All 7 routes audited** — `/`, `/projects`, `/stack`, `/experience`, `/writing`, `/contact`, `/shipped`. Matches ROADMAP success criterion 1 coverage. Catches per-view regressions (e.g. `/stack` JSON-highlight CSS, `/projects` chip grid, `/writing` post list).
- **D-16:** **Evidence shape** — `07-VERIFICATION.md` carries a 7-row × 6-column scores table (route × Perf/A11y/SEO/LCP/CLS/INP) modeled on `05-VERIFICATION.md`'s 56-cell axe matrix. Screenshots stored under `.planning/phases/07-deploy-verification/lighthouse/<route>-mobile.png` (PSI dashboard screenshot per route). One row per route; thresholds inline in column headers; cells = score or measurement; pass/fail marker per cell.
- **D-17:** **Threshold-miss policy = fix-in-place + re-audit** (Phase 5 axe-matrix model). If any cell misses DEPLOY-02 threshold, identify smallest fix (font preload, image format, defer script, dynamic-import), ship as paired plan within Phase 7, re-run PSI, repeat until green. No DEFERRED-V1.1 escape hatch. Phase 7 doesn't close until all 7 routes × 6 metrics = 42 cells pass.

### Real-device + recruiter verification

- **D-18:** **Real-device gates close via Chrome DevTools emulation only** — NOT physical iPhone Safari or Android Chrome. Phase 4 Gate 7 (iPhone Safari) + Gate 8 (Android Chrome) + Phase 5 Gate 3 (reduce-motion real-device) all close as **"covered by DevTools emulation + Phase 5 source-level axe matrix 56/56 + Phase 7 PSI mobile profile."** Consciously-accepted limitation: Safari-specific `dvh/svh` units, soft-keyboard behavior in palette, address-bar overlap at TopBar, and `-webkit-overflow-scrolling` are NOT physically validated. If a v1.1 user reports a Safari-only issue, that's the carry. Document this limitation explicitly in `07-VERIFICATION.md` "Known limitations" section.
- **D-19:** **5-second recruiter test** = **one non-engineer runs both devices sequentially** (Phase 4 Gate 9 model). Desktop first on their laptop, then 375px mobile (their own phone on `www.tatibekov.com`, since you're skipping a dedicated physical-device gate — this becomes the de-facto real-mobile test). Memory carryover is accepted as a known limitation. Record name, time-to-resume + time-to-contact, and a one-line path narrative ("clicked top-bar download immediately" vs "scrolled to about first") in `07-VERIFICATION.md` DEPLOY-04 section. **Pass = under 5s on each device, both runs.**
- **D-20:** **DEPLOY-07 (375px shell review)** runs via Chrome DevTools 375px viewport on all 7 routes. Screenshots saved under `.planning/phases/07-deploy-verification/screenshots/375/<route>.png`. Manual eyeball confirms: TopBar resume button visible above fold, no horizontal overflow, hamburger trigger accessible, no clipped text, theme + accent picker reachable. Same review on `www.tatibekov.com` (production), NOT localhost.

### Pre-deploy + close-out gates

- **D-21:** **`npm audit` + `npx knip` run as pre-close-out gates** in the FE repo and the sibling BE repo. Both must exit zero high/critical for FE; both must exit zero unused for FE (`knip` doesn't apply to BE in this milestone). Phase 6 Plan 1d9a295 already bumped next 15.5.15 → 15.5.18 (Vercel CVE warning resolved); these gates re-verify against the cut-over codebase. Run BEFORE recording the final scores in 07-VERIFICATION.md.
- **D-22:** **Backend-side smoke gate (D-11 from Phase 6) re-runs** as part of Phase 7 close-out — `scripts/check-backend.mjs` against `https://personal-portfolio-services-production.up.railway.app` must still exit 0 (7/7 endpoints green). Confirms BE didn't drift during Phase 7's frontend-only changes.

### Brownfield discipline (carried forward)

- **D-23:** Phase 7 has ONE potential backend touch — if `x-portfolio-source` removal in `next.config.ts` requires any sibling-repo coordination (it doesn't, this is FE-only). Otherwise no paired commits needed. Phase 6 D-19 paired-commit rule remains the discipline for any future BE touch.

### Claude's Discretion

- Exact `<Analytics />` mount position in `app/layout.tsx` — top-of-`<body>` vs inside the RSC tree near `<HeadComment />`. Both work; planner picks based on which keeps `app/layout.tsx` readable.
- Whether the redeploy that activates `NEXT_PUBLIC_SITE_URL` is triggered via `git commit --allow-empty` (visible in git log) or via Vercel UI "Redeploy" button (no git diff). Planner picks; recommend git-commit path for audit trail consistency with Phase 6 cutover.
- Whether `lighthouse/` and `screenshots/375/` directories ship as committed evidence or stay local-only `.planning/`-ignored. **Recommend committed** — matches the Phase 5 OG image evidence pattern + future reviewers can audit without rerun. Disk cost is negligible (<2MB).
- Exact wording of the CLAUDE.md update for D-09 (the `@vercel/analytics` prod-dep exception). Two-line addition under "Stack constraints" is enough.
- Whether to add a `scripts/check-canonical-url.mjs` smoke gate that asserts `process.env.NEXT_PUBLIC_SITE_URL` is set to a non-localhost value in production builds (defensive — catches accidental missing env var). Optional; the existing INFRA-05 placeholder grep doesn't catch this.

### Folded Todos

None — no pending todos matched Phase 7 scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project + roadmap
- `.planning/PROJECT.md` — "no content placeholders" + dual-audience constraint + Out of Scope list (admin UI, analytics dashboards stay v2)
- `.planning/ROADMAP.md` §Phase 7 — Goal, requirements list, 5 success criteria, depends on Phase 6
- `.planning/REQUIREMENTS.md` — DEPLOY-01..07 acceptance criteria; DEV-03 status update target (carry-forward from Phase 5 D-30)
- `.planning/STATE.md` §Deferred Items — Phase 4 → 7 carry-forwards (Gates 7+8 real-device), Phase 5 → 7 carry-forwards (reduce-motion, unfurl, Lighthouse, GSC, x-portfolio-source)

### Research (architectural context)
- `.planning/research/ARCHITECTURE.md` §"Persistent shell layout" — `app/(terminal)/layout.tsx` boundary; `<Analytics />` mounts in root `app/layout.tsx`, not the terminal sub-layout
- `.planning/research/STACK.md` — "two new prod deps total" constraint; Phase 7 documents `@vercel/analytics` as the exception

### Codebase intel
- `.planning/codebase/INTEGRATIONS.md` §Monitoring & Observability — confirms no prior analytics integration; documents the env var slots (`NEXT_PUBLIC_API_BASE_URL` already flipped Phase 6, `NEXT_PUBLIC_SITE_URL` flips Phase 7)
- `.planning/codebase/ARCHITECTURE.md` — RSC vs client island boundaries (TopBar is already `"use client"`; resume-button onClick lives there)

### Project conventions
- `CLAUDE.md` §Stack constraints — "two new prod deps total" rule + the Phase 7 update adding `@vercel/analytics`
- `CLAUDE.md` §Architecture rules — `app/layout.tsx` is RSC; `<Analytics />` is a thin client component package-internally so it's safe to mount

### Phase 5 + 6 close-out artifacts (carry-forwards)
- `.planning/phases/05-seo-accessibility-polish/05-CONTEXT.md` §D-30 — `x-portfolio-source` deferral; Phase 7 closes as **dropped**
- `.planning/phases/05-seo-accessibility-polish/05-VERIFICATION.md` §Carry-forwards to Phase 7 — full list of deferred gates
- `.planning/phases/04-mobile-responsive/04-VERIFICATION.md` §Gates 7+8 — iPhone Safari + Android Chrome real-device (closes via D-18 DevTools emulation)
- `.planning/phases/06-backend-content-population/06-CONTEXT.md` §D-11 — backend smoke gate pattern; Phase 7 re-runs it in close-out (D-22)

### Frontend source-of-truth files (touched in Phase 7)
- `next.config.ts` — remove `x-portfolio-source` slot from `engineerHeaders` (D-04); keep `x-built-with`
- `app/layout.tsx` — set `metadata.metadataBase = new URL(NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com")`; mount `<Analytics />`
- `app/components/top-bar.tsx` (or current path) — wire `onClick={() => track("resume_download")}` on the resume `<a>` (D-12)
- `app/sitemap.ts` + `app/robots.ts` — verify they read `NEXT_PUBLIC_SITE_URL` consistently; should already work since they were authored against the env var
- `.env.example` — update to show `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for dev, with a comment showing production value
- `CLAUDE.md` §Stack constraints — add the `@vercel/analytics` exception note

### Vercel project (out-of-repo)
- Vercel Dashboard → Settings → Domains — confirms `tatibekov.com` (307 → www), `www.tatibekov.com` (Production), `personal-portfolio-web-orcin.vercel.app` (Production alias)
- Vercel Dashboard → Settings → Environment Variables → Production — `NEXT_PUBLIC_SITE_URL` set here (D-03)

### External services
- Google Search Console — Domain property creation at `tatibekov.com` via DNS TXT (D-06); sitemap submission (D-07)
- PageSpeed Insights — `https://pagespeed.web.dev/?url=https://www.tatibekov.com/<route>` × 7 (D-14)
- Vercel Analytics dashboard — `resume_download` event count visible post-deploy + post-event-fire (D-10)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`app/layout.tsx` `metadata.metadataBase`** — Phase 1 wired this with `||` fallback per D-13. Phase 7 just sets the production env var; no code change beyond default-value alignment.
- **`app/sitemap.ts` + `app/robots.ts`** — already read `NEXT_PUBLIC_SITE_URL` (Phase 1). Switching the env value automatically rebuilds the sitemap against `www.tatibekov.com`.
- **`next.config.ts` `engineerHeaders` array** — Phase 1 declared this with one filled entry (`x-built-with`) and one comment-deferred slot (`x-portfolio-source`). Phase 7 deletes the deferred slot per D-04.
- **`TopBar` client island** (Phase 2 SHELL) — already `"use client"`. Resume download `<a>` lives inside it; adding `onClick={() => track("resume_download")}` is a 1-line surgical change.
- **8 sibling `opengraph-image.tsx` files** (Phase 5 Plan 05-02) — resolve absolute image URLs against `metadataBase` automatically. No per-file edit when the env var flips to www.
- **Phase 5 axe matrix** (`tests/contrast.spec.ts`, 56 cells) — already validates 4 hues × 2 themes against WCAG 2.1 AA at source-level. Phase 7 PSI A11y check is a separate gate but inherits confidence from this.
- **INFRA-05 prebuild grep** (`scripts/check-placeholders.mjs`) — already enforces no placeholders. Continues to gate Phase 7 redeploys.
- **`scripts/check-resume-pdf.mjs` + `scripts/check-resume-docx.mjs`** — Phase 6 Wave 8 wired these as prebuild gates. Continue to enforce the resume artifacts on every Phase 7 redeploy.

### Established Patterns

- **Smoke-script-as-gate** (Phases 1, 2, 4, 5, 6) — `scripts/check-*.mjs` files that exit non-zero when an invariant breaks. Phase 7 may add `scripts/check-canonical-url.mjs` (Claude's Discretion) but otherwise rides existing scripts.
- **Verification-as-evidence** (Phase 4 + 5 VERIFICATION.md model) — every manual gate gets a row with verdict (PASS / DEFERRED-V1.1 / FAIL), method, evidence pointer (screenshot path or curl snippet), notes. Phase 7 follows the same structure.
- **`track()` from `@vercel/analytics`** — package exports `track(name, props?)`. Standard pattern: import once in the client component that fires the event; no provider/wrapper needed (the root `<Analytics />` handles dispatching).
- **Vercel env var → Production scope → redeploy → effect** — Phase 6 Plan 09 already executed this for `NEXT_PUBLIC_API_BASE_URL`. Phase 7 repeats the dance for `NEXT_PUBLIC_SITE_URL`.

### Integration Points

- **`NEXT_PUBLIC_SITE_URL`** — Vercel Project Settings → Environment Variables → Production scope. Read by `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` (metadataBase), all 8 `opengraph-image.tsx` (transitively via metadataBase).
- **Vercel DNS panel** — D-06 DNS TXT record lives here. Already canonicalized apex → www.
- **Vercel Analytics dashboard** — post-`<Analytics />` mount, dashboard auto-populates page views; post-`track()` call, custom events tab populates.
- **Google Search Console** — Domain property at `tatibekov.com` after DNS TXT verification (D-06). Submits `https://www.tatibekov.com/sitemap.xml` (D-07).

</code_context>

<specifics>
## Specific Ideas

- Custom domain `tatibekov.com` already owned + DNS configured + 307 redirect from apex to www active in Vercel (screenshot confirmed 2026-05-13). Phase 7 only needs to set `NEXT_PUBLIC_SITE_URL` in the Vercel env panel and redeploy — no DNS work.
- Repo is **private**, which is the load-bearing reason to drop `x-portfolio-source` (D-04). If repo goes public in a future milestone, this decision flips and the header gets re-added with the GitHub URL value.
- The 5-second recruiter test will use one non-engineer who runs both devices in sequence (D-19) — accepts memory carryover as a known limitation in exchange for coordination simplicity.
- Real-device testing closes via DevTools emulation (D-18) — user consciously accepts the Safari `dvh/svh` + soft-keyboard + address-bar overlap won't be physically validated, in exchange for Phase 7 wall-clock speed.

</specifics>

<deferred>
## Deferred Ideas

These came up but belong in later phases / milestones. Don't lose them; don't act on them in Phase 7.

- **`@vercel/speed-insights` (Real User Monitoring)** — paired RUM signal alongside synthetic Lighthouse. Deferred from D-08; v1.1 candidate if production traffic warrants ongoing field measurements.
- **Theme / accent / palette-open analytics events** (ANALY-V2-01) — pulled forward considered + rejected (D-13). Stays in v2.
- **Physical iPhone Safari + Android Chrome verification** — Phase 4 Gates 7+8 + Phase 5 Gate 3 close via DevTools emulation in Phase 7 (D-18). If a v1.1 user reports a Safari-only `dvh/svh` or soft-keyboard issue, that triggers physical-device validation.
- **Slack/LinkedIn unfurl preview manual test** — Phase 5 SEO-03c carry. Recommend folding this into Phase 7 close-out (5-min manual: send the production URL to a private Slack channel + LinkedIn DM, screenshot the unfurl). Not in the 4 selected gray areas but the carry-forward is real; planner: include as a sub-task under DEPLOY-04 or as its own close-out gate.
- **`scripts/check-canonical-url.mjs`** smoke gate asserting `NEXT_PUBLIC_SITE_URL` is set to non-localhost in production builds (Claude's Discretion D-23). Optional v1.1 if env-var drift ever causes a regression.
- **Resume download event property expansion** — viewport / theme / accent segmentation. Deferred from D-11; revisit if dashboard volume justifies it.
- **CMS / admin endpoint carve-out** (`/api/admin/*` with static bearer token) — Phase 6 deferred; still deferred. Out of scope until content-velocity warrants it.
- **Robots policy for the Vercel-hostname alias** (`personal-portfolio-web-orcin.vercel.app`) — not explicitly noindex'd; relying on `<link rel="canonical">` from `metadataBase` to let Google de-duplicate. If GSC reports duplicate-content issues in the indexing pass, a v1.1 fix would conditionally noindex the Vercel hostname in `app/robots.ts`.

</deferred>

---

*Phase: 07-deploy-verification*
*Context gathered: 2026-05-13*
