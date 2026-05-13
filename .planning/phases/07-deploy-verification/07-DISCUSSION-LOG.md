# Phase 7: Deploy + Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 07-deploy-verification
**Areas discussed:** Public URL + domain, Analytics scope + event surfaces, Lighthouse + audit evidence, Real-device + recruiter test

---

## Public URL + domain

### Q1: Final public URL for v1 launch

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Vercel hostname | Ship v1 on personal-portfolio-web-orcin.vercel.app. Zero infra cost. Custom domain becomes v1.1 task. | |
| Buy + configure custom domain now | Buy domain, point DNS at Vercel, set NEXT_PUBLIC_SITE_URL, GSC via DNS TXT. | |
| Already own a domain — wire it up | User already owns a domain; wire it to Vercel this phase. | ✓ |

**User's choice:** Free-text — "tatibekov.com already works, I configured the DNS settings." User attached screenshot of Vercel Domains panel showing: `tatibekov.com` Valid Configuration → 307 → `www.tatibekov.com` Valid Configuration Production; `personal-portfolio-web-orcin.vercel.app` Valid Configuration Production.
**Notes:** Canonicalization already done in Vercel — apex 307s to www. No DNS work needed. Locks `NEXT_PUBLIC_SITE_URL = https://www.tatibekov.com`.

### Q2: x-portfolio-source HTTP header value (Phase 5 D-30 carry-forward)

Originally asked as a 3-option AskUserQuestion (GitHub repo URL / both repos / full site URL). User interrupted and asked: "x-portfolio-source — what purpose does it serve? Why do we need it?"

After explanation (engineer easter egg surface, paired with console signature + view-source comment + ⌘K palette aesthetic — useful when GitHub repo is public, not when private), reformulated options:

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub repo URL | github.com/beckinfonet/portfolio-web — engineers curl -I and click through to source | |
| Both repos comma-separated | FE + BE repos. More transparent for engineering peers. | |
| Drop the header entirely | Remove the slot from next.config.ts engineerHeaders. Repo not public makes the header pointless. | ✓ |

**User's choice:** "repo is not public - drop it"
**Notes:** Repo privacy is the load-bearing reason. Closes Phase 5 D-30 DEFERRED-PHASE-7 as RESOLVED-as-dropped (not "filled"). Update DEV-03 status in REQUIREMENTS.md to PASS-with-deviation (only `x-built-with` ships).

### Q3: Google Search Console verification method (DEPLOY-03)

| Option | Description | Selected |
|--------|-------------|----------|
| DNS TXT — Domain property | Add TXT record at tatibekov.com via DNS. Domain property covers apex + www + all subdomains. ~5 min one-time. | ✓ |
| HTML file — URL property | Drop public/google<hash>.html, commit, redeploy. Repo-native. URL property scope only. | |
| Meta tag — URL property | Add <meta name="google-site-verification" /> to layout metadata. URL property scope only. | |

**User's choice:** DNS TXT — Domain property (recommended)
**Notes:** Future-proof (covers blog.tatibekov.com, staging.tatibekov.com, etc. if added later). User has DNS panel access via Vercel.

### Continue / Next prompt

User selected "Next area". URL + domain decisions complete (3 locked); skipped deeper questions (apex→www redirect type, Vercel-hostname robots policy, sitemap apex+www behavior) — those deferred to v1.1 if GSC reports duplicate-content issues.

---

## Analytics scope + event surfaces

### Q1: Vercel telemetry package scope

| Option | Description | Selected |
|--------|-------------|----------|
| @vercel/analytics only | Single new prod dep. Page views + custom events. Cookieless. Matches DEPLOY-06 minimum exactly. | ✓ |
| @vercel/analytics + @vercel/speed-insights | Two new prod deps. Adds RUM Web Vitals from real visitors. Complements synthetic Lighthouse. ~2KB extra JS. | |
| Skip speed-insights, defer Lighthouse repeat | @vercel/analytics for event tracking only; rely on DEPLOY-02 Lighthouse for perf. | |

**User's choice:** @vercel/analytics only (recommended)
**Notes:** Single new prod dep; documented as exception to CLAUDE.md two-prod-deps rule.

### Q2: resume_download event surfaces (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| TopBar button only | Persistent on every viewport. Primary recruiter surface. Single instrumentation point. | ✓ |
| Palette download_resume verb | Engineer-flavored ⌘K path. Adds onSelect handler. | |
| About-view AboutSocials/CTA resume link | Captures recruiters who scroll past top bar. | |
| Sidebar recruiter resume card | Desktop-only surface. Secondary signal. | |

**User's choice:** TopBar button only (recommended)
**Notes:** Conservative single-surface choice. Future v2 (ANALY-V2-01) can fan out.

### Q3: resume_download event payload

| Option | Description | Selected |
|--------|-------------|----------|
| Bare event — no properties | track("resume_download"). Validates DEPLOY-06 exactly. | ✓ |
| Event with viewport property | track("resume_download", { viewport: "mobile" | "desktop" }). Dual-audience segmentation. | |
| Event with viewport + theme + accent | Full segmentation. Slight overkill for early portfolio volume. | |

**User's choice:** Bare event — no properties (recommended)
**Notes:** Minimum viable instrumentation. Segmentation deferred to v2.

### Q4: Pull v2-deferred analytics events forward?

| Option | Description | Selected |
|--------|-------------|----------|
| No — ship resume_download only | ANALY-V2-01 stays in v2. Phase 7 hits DEPLOY-06 exactly. | ✓ |
| Yes — also track palette opens | Adds track("palette_open") to cmdk Command.Dialog handler. | |
| Yes — also track theme + accent changes | Adds track("theme_change") + track("accent_change"). | |

**User's choice:** No — ship resume_download only (recommended)
**Notes:** Smallest diff to review; smaller blast radius for launch.

---

## Lighthouse + audit evidence

### Q1: Lighthouse run tool

| Option | Description | Selected |
|--------|-------------|----------|
| PageSpeed Insights web tool | https://pagespeed.web.dev/ run 7× (one per route). Zero install. Google's hosted Lighthouse. | ✓ |
| Local `npx lighthouse` | Local CLI, save HTML reports under .planning/phases/07-*/lighthouse/. More reproducible. | |
| Chrome DevTools Lighthouse panel | DevTools → Lighthouse → mobile. Fast iteration; less reproducible. | |

**User's choice:** PageSpeed Insights web tool (recommended)
**Notes:** Same scoring engine Google uses for Search Console CWV reporting. Zero install.

### Q2: Lighthouse route coverage

| Option | Description | Selected |
|--------|-------------|----------|
| All 7 routes | /, /projects, /stack, /experience, /writing, /contact, /shipped. Matches ROADMAP success criterion 1. | ✓ |
| Sample 3 routes | /, /projects, /writing as representative. Faster. | |
| Root route only | Just /. Smallest evidence set. | |

**User's choice:** All 7 routes (recommended)
**Notes:** Catches per-view regressions (stack JSON highlighter CSS, projects chip grid, etc.).

### Q3: Evidence persistence under .planning/phases/07-deploy-verification/

| Option | Description | Selected |
|--------|-------------|----------|
| Summary table in 07-VERIFICATION.md + screenshots dir | 7×6 score table + PSI screenshots under lighthouse/. Matches 05-VERIFICATION.md axe-matrix style. | ✓ |
| Summary table only | No screenshots. Smaller commit. Future readers can't see PSI dashboard. | |
| JSON dump per route | PSI export-as-JSON. Machine-readable; harder to skim. | |

**User's choice:** Summary table + screenshots dir (recommended)
**Notes:** Matches Phase 5 axe-matrix evidence style; auditable without rerun.

### Q4: Threshold-miss response policy

| Option | Description | Selected |
|--------|-------------|----------|
| Fix-in-place then re-audit | Phase 5 axe-matrix model. Ship smallest fix as paired plan. No phase close until 100% green. | ✓ |
| Document deviations, accept v1.1 carry | Document sub-threshold gaps as v1.1 carry. Pragmatic if root cause is third-party. | |
| Block phase until 100% green | Strictest. No DEFERRED-V1.1 allowed. | |

**User's choice:** Fix-in-place then re-audit (recommended)
**Notes:** Same model as Phase 5 contrast matrix (4 internal iterations until 56/56). Phase 7 closes when 42 cells (7 routes × 6 metrics) hit thresholds.

---

## Real-device + recruiter test

### Q1: Real-device verification execution

| Option | Description | Selected |
|--------|-------------|----------|
| Physical iPhone + Android self-test | Open on own iPhone Safari + Android Chrome. 15-20 min. Closes carry-forward properly. | |
| Chrome DevTools device emulation only | Emulate iPhone 14 / Pixel 7 in DevTools. Source-level confidence already strong (Phase 5 axe 56/56). | ✓ |
| BrowserStack / LambdaTest free tier | 30-min cross-browser session. Records video. | |
| Accept Phase 5 source-level pass as sufficient | Closes via "covered by other gates". Pragmatic but deviates from explicit deferral promise. | |

**User's choice:** Chrome DevTools device emulation only
**Notes:** Consciously-accepted limitation — Safari dvh/svh, soft-keyboard, address-bar overlap, -webkit-overflow-scrolling NOT physically validated. Document explicitly in 07-VERIFICATION.md "Known limitations" section. If v1.1 user reports Safari-specific issue, that's the carry.

### Q2: 5-second recruiter test execution

| Option | Description | Selected |
|--------|-------------|----------|
| Self-simulation + 1 non-engineer | Time yourself twice + send to non-engineer for genuine outsider perspective. | |
| Self-simulation only | Phase 4 Gate 9 model. Lacks genuine outsider perspective. | |
| 1-2 non-engineers only, no self-test | Most representative of recruiter audience. Lose self-baseline. | ✓ |

**User's choice:** 1-2 non-engineers only, no self-test
**Notes:** Maximum outsider rigor. Trade-off: if non-engineer hits a bug, harder to reproduce on the fly.

### Q3: Recruiter timing methodology

| Option | Description | Selected |
|--------|-------------|----------|
| Split: each non-engineer takes one device | Recruiter A on desktop, Recruiter B on 375px mobile (their phone). Fresh-eyes both. | |
| Same person, both devices | One non-engineer does desktop first, then 375px. Easier coordination; memory carryover. Phase 4 Gate 9 model. | ✓ |
| Video screen recording for both | Each non-engineer screen-records a fresh visit. Best forensic evidence; awkward to ask. | |

**User's choice:** Same person, both devices
**Notes:** Memory carryover (second test knows resume is in top bar) accepted as known limitation. Pass = under 5s on each device, both runs. Record name + time-to-resume + time-to-contact + one-line path narrative in 07-VERIFICATION.md DEPLOY-04 section.

---

## Claude's Discretion

Items where the user delegated detail to Claude / planner:

- Exact `<Analytics />` mount position in `app/layout.tsx` (top-of-body vs near HeadComment)
- Redeploy trigger for env-var activation (git commit --allow-empty vs Vercel UI Redeploy)
- Whether `lighthouse/` + `screenshots/375/` directories ship as committed evidence (recommended yes)
- Exact wording of CLAUDE.md update for `@vercel/analytics` prod-dep exception (two-line addition)
- Optional `scripts/check-canonical-url.mjs` defensive smoke gate for env-var drift

## Deferred Ideas

Captured during discussion, deferred to v1.1 or v2:

- `@vercel/speed-insights` (RUM signal) — v1.1 candidate if traffic warrants
- Theme / accent / palette-open analytics events (ANALY-V2-01) — stays v2
- Physical iPhone Safari + Android Chrome verification — v1.1 if Safari-specific bug surfaces
- Slack/LinkedIn unfurl preview manual test — recommend folding into Phase 7 close-out as a 5-min sub-task (carry from Phase 5 SEO-03c, not in main 4 areas but should not be lost)
- `scripts/check-canonical-url.mjs` defensive env-var smoke gate — v1.1 if env drift ever causes regression
- Resume download event property expansion (viewport / theme / accent) — revisit when dashboard volume justifies
- CMS / admin endpoint carve-out — still deferred (Phase 6 deferred indefinitely)
- Conditional noindex for `personal-portfolio-web-orcin.vercel.app` alias — v1.1 if GSC reports duplicate-content
- Sub-threshold or Vercel-hostname robots policy decisions skipped during "Next area" — v1.1 if needed
