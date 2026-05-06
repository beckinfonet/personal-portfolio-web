# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 01-foundation
**Areas discussed:** CI tooling, DATA-02 content strategy, INFRA-04 hardening scope

---

## Gray Area Selection

**Question:** Which areas do you want to discuss for Phase 1 (Foundation)?

| Option | Description | Selected |
|--------|-------------|----------|
| CI tooling choice (Recommended) | STATE.md flags this as open: GitHub Actions vs manual. Affects INFRA-03. | ✓ |
| Homepage deletion timing | TEST-01 says delete homepage.tsx in same commit as replacement shell skeleton — but the shell is Phase 2. Decide: stub/replace in Phase 1, or defer deletion to Phase 2's first commit? | |
| DATA-02 content strategy | Phase 1 needs typed data NOW; Phase 6 owns 'real content'. Skeleton with TBD markers? Partial-real? Real-now? | ✓ |
| INFRA-04 hardening scope | next.config.ts headers — engineer-discoverable only, or also security headers? | ✓ |

**User's choice:** CI tooling, DATA-02 content strategy, INFRA-04 hardening scope
**Notes:** Homepage deletion timing dropped to Claude's discretion — the requirement is clear (delete-in-same-commit-as-replacement), so it slips naturally to Phase 2's first commit.

---

## CI tooling choice

### Q: Which CI route for INFRA-03?

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions, PR-only (Recommended) | Workflow at .github/workflows/ci.yml runs on PRs. Required to merge. No push-to-main duplicate runs. | ✓ |
| GitHub Actions, PR + push to main | Same checks, but also runs on every push to main. ~2x CI minutes. | |
| Manual checklist | No CI infra. Pre-merge checklist in CONTRIBUTING/PR template. | |
| Vercel-only checks | Skip GitHub Actions; rely on Vercel preview build. Misses lint/test/knip. | |

**User's choice:** GitHub Actions, PR-only

### Q: Should CI block merge on Knip findings (orphan files/exports)?

| Option | Description | Selected |
|--------|-------------|----------|
| Hard fail on any Knip finding (Recommended) | Knip exits non-zero → CI red → merge blocked. Brownfield discipline guard from Pitfall 11. | ✓ |
| Warn only, don't block | Knip runs and prints findings, but exit code is 0. | |
| Run knip, but allow a documented allowlist | Knip blocks on net-new orphans, but knip.json ignore list lets known cases through. | |

**User's choice:** Hard fail on any Knip finding

### Q: Pin Node version for CI + local dev?

| Option | Description | Selected |
|--------|-------------|----------|
| Add .nvmrc + engines (Recommended) | Ship .nvmrc with Node 22 LTS and add 'engines.node': '>=22' to package.json. CI uses actions/setup-node@v4 with node-version-file. | ✓ |
| .nvmrc only, no engines field | Pin via .nvmrc but don't constrain installs via engines. | |
| Skip pinning | Use Node default in CI runner. | |

**User's choice:** Add .nvmrc + engines

### Q: Enable branch protection on main (require CI green to merge)?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, require CI green + 0 reviewers (Recommended) | Merge blocked until CI green. No reviewer requirement (solo dev). | ✓ |
| Yes, require CI green + 1 reviewer | Heavier process. Solo dev would self-review — performative. | |
| No branch protection in Phase 1 | Defer to a later milestone. | |
| Note in PROJECT.md, configure manually post-deploy | Phase 1 ships workflow file; configure protection in GitHub UI after first PR. | |

**User's choice:** Yes, require CI green + 0 reviewers

---

## DATA-02 content strategy

### Q: What goes into lib/portfolio-data.ts in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Real-where-trivial, TBD-where-not (Recommended) | Real values for stable items (name, role, github/linkedin URLs, location). TBD markers for content that needs writing. | ✓ |
| Pure skeleton with TBD markers everywhere | Every field is 'TODO: <field>' or empty array. | |
| Pull Phase 6 content forward into Phase 1 | Write real bio, project list, shipped apps now. Phase 6 collapses to backend wiring + resume PDF. | |
| Hybrid: real bio/socials + project/writing skeletons | Real personal info, skeleton arrays for projects/writing/shipped. | |

**User's choice:** Real-where-trivial, TBD-where-not

### Q: INFRA-05 prebuild grep — which placeholder strings to block? (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| lorem (Recommended) | Standard placeholder text. Roadmap success-criterion-5 lists this. | (initially missed) |
| example.com (Recommended) | Catches the existing fallback-data leak. Roadmap success-criterion-5 lists this. | ✓ |
| placeholder (Recommended) | Catches the 50-byte placeholder in public/resume.pdf and any 'placeholder' strings. | (initially missed) |
| TODO + Product Studio (Recommended) | Catches dev-time TODO markers and 'Product Studio' demo company name. | (initially missed) |

**User's first pick:** example.com only (apparent under-selection on multi-select)

### Q (follow-up): Confirm INFRA-05 grep list — just example.com, or the full set?

| Option | Description | Selected |
|--------|-------------|----------|
| Full list per roadmap INFRA-05 (Recommended) | Block on lorem, example.com, placeholder, TODO + 'Product Studio'. | ✓ |
| Just example.com (initial pick) | Minimal grep. Catches highest-risk known leak. | |
| example.com + TODO only | Middle ground: known leak + dev marker. | |

**User's choice:** Full list per roadmap INFRA-05
**Notes:** Reflected back the multi-select discrepancy and confirmed the full set was intended.

### Q: What counts as 'real-where-trivial' for the Phase 1 lib/portfolio-data.ts seed? (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| Real identity: name, role string, location (Recommended) | 'Bakytbek Tatibekov', 'Sr. Software Engineer', city/country. | ✓ |
| Real socials: github, linkedin URLs (Recommended) | GitHub + LinkedIn handles. Skips email. | ✓ |
| Real contact: email + any extra socials (Recommended) | Real email (replaces beck@example.com leak), plus other socials. | ✓ |
| Real tech-chip / stack categories (Recommended) | Stack list (languages, frameworks, cloud, AI). | ✓ |

**User's choice:** All four selected
**Notes:** TBD-marker convention falls out: use `TODO: <field>` since INFRA-05 grep already catches `TODO`. Self-enforcing — Phase 6 must replace every `TODO:` before build passes.

---

## INFRA-04 hardening scope

### Q: What goes into next.config.ts headers() in Phase 1?

| Option | Description | Selected |
|--------|-------------|----------|
| Engineer headers + standard security headers (Recommended) | x-portfolio-source + x-built-with + HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy. Skips CSP. | ✓ |
| Engineer headers only | Just x-portfolio-source + x-built-with. Defer security to v2. | |
| Full hardening including CSP nonce | Above + CSP nonce-based strategy. Pulls Pitfall 3 work into Phase 1. | |
| Security headers now, CSP report-only (no nonce yet) | Standard security + Content-Security-Policy-Report-Only logging without blocking. | |

**User's choice:** Engineer headers + standard security headers

### Q: URL/scheme validation for API-supplied hrefs (CONCERNS.md security risk — javascript: URL injection)?

| Option | Description | Selected |
|--------|-------------|----------|
| Add guard in lib/api.ts (Recommended) | lib/api.ts validates each social/app URL against an https-only allowlist. Single chokepoint. | |
| Add a sanitize helper in lib/, called by view components | Helper at lib/sanitize-url.ts; views call sanitizeUrl(href). Per-context rules but error-prone. | |
| Defer to Phase 6 (when real backend ships) | Skip in Phase 1 since data comes from developer-controlled lib/portfolio-data.ts. Add in Phase 6 alongside backend wiring. | ✓ |

**User's choice:** Defer to Phase 6
**Notes:** Phase 6 plan must include this — flagged in CONTEXT.md deferred ideas. The risk is dormant in Phase 1 because all rendered URLs come from the developer-controlled fallback file.

---

## Claude's Discretion

- Homepage deletion timing — defer to Phase 2's first commit (paired with shell skeleton). `lib/fallback-data.ts` is the exception: deleted in Phase 1 alongside `lib/portfolio-data.ts` introduction.
- Dev tooling hygiene scope (tsconfig target ES2017→ES2022, .gitignore widening, ESLint 9 flat-config migration if peer-compatible)
- `lib/types.ts` exact field shapes (informed by handoff `app.jsx` rendering needs at planning time)
- `lib/routes.ts` registry shape minimum fields (slug, pathname, label, ariaLabel)
- Prebuild vs postbuild script ordering for INFRA-05 grep
- `knip` configuration starting defaults
- CI workflow specifics (action versions, cache strategy, artifact upload)

## Deferred Ideas

- CSP (Content-Security-Policy) with nonce — needs Phase 2's inline accent script first; v2 hardening milestone
- URL/scheme validation for API hrefs — Phase 6 / BACKEND-04
- CSP-Report-Only header — Phase 2 end if observability wanted pre-emptively
- Dependabot / Renovate — post-Phase 7
- Sentry / observability — explicitly out of scope for v1 per PROJECT.md
- Per-endpoint revalidation tags / on-demand revalidation
- Real `public/resume.pdf` — Phase 6 / CONTENT-05
- Vercel Analytics + `resume_download` event — Phase 7 / DEPLOY-06
- Splitting CI into parallel jobs (perf optimization)
- A11y / contrast / reduced-motion — Phases 4/5
