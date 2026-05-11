---
phase: 6
slug: backend-content-population
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 6 — Validation Strategy

> Per-phase validation contract derived from 06-RESEARCH.md §"Validation Architecture".
> Phase 6 spans two repositories (`portfolio-web/` frontend + sibling `portfolio-services/` backend) — sampling rules apply per-repo.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (frontend)** | Vitest 3.1.4 + jsdom 26.1.0 |
| **Framework (backend)** | Jest 30.x + ts-jest 29.x + supertest 7.x |
| **Config (frontend)** | `portfolio-web/vitest.config.ts` |
| **Config (backend)** | `portfolio-services/jest.config.ts` |
| **Quick run (frontend)** | `npm test` in `portfolio-web/` |
| **Quick run (backend)** | `npm test` in `portfolio-services/` |
| **Full suite (frontend)** | `npm run lint && npm run typecheck && npm run test && npm run build` |
| **Full suite (backend)** | `npm test && npm run build` |
| **Smoke gate** | `node scripts/check-backend.mjs` (NEW in `portfolio-services/scripts/`) |
| **Placeholder gate** | `portfolio-web/scripts/check-placeholders.mjs` (existing postbuild) |
| **Resume PDF gate** | `portfolio-web/scripts/check-resume-pdf.mjs` (NEW) |
| **Estimated runtime (per-repo quick)** | ~10s frontend / ~5s backend |

---

## Sampling Rate

- **After every task commit:** Run the corresponding repo's quick command (`npm test`). Frontend ~10s, backend ~5s.
- **After every plan wave:** Run the full suite for the touched repo(s). Run smoke gate against locally-running backend.
- **Before `/gsd-verify-work`:** Full suite green on both repos; `npm run build` green on both; INFRA-05 prebuild grep green; `node scripts/check-backend.mjs` green against the **production** Railway URL.
- **Max feedback latency:** ~30s per task; ~90s per wave (both repos full suite).

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? | Status |
|--------|----------|-----------|-------------------|--------------|--------|
| BACKEND-01 | `/api/projects` returns `Project[]` with correct shape | integration (supertest) | `cd portfolio-services && npm test -- --testNamePattern="GET /api/projects"` | ❌ Wave 0 | ⬜ pending |
| BACKEND-02 | All 6 existing endpoints (profile/stack/experience/apps/posts + projects) return shapes matching `lib/types.ts` | integration (supertest) | `cd portfolio-services && npm test` | ❌ Wave 0 — replace `/skills` test, add 6 new | ⬜ pending |
| BACKEND-03 | Contract doc exists + has ≥7 endpoint sections | smoke (grep) | `grep -c '^## /api/' portfolio-services/docs/api-contract.md` ≥ 7 | ❌ Wave 0 | ⬜ pending |
| BACKEND-04 | Backend live on Railway before frontend cuts over | smoke (mjs) | `PROD_API_URL=https://<railway-url> node scripts/check-backend.mjs` | ❌ Wave 0 — create script | ⬜ pending |
| CONTENT-01 | `PROFILE` matches `Profile` type + bio.long has ≥2 paragraphs | unit (TypeScript + vitest) | `cd portfolio-web && npm run typecheck && npm test -- portfolio-data` | ✅ typecheck existing; ❌ new vitest assert | ⬜ pending |
| CONTENT-02 | `PROJECTS.length >= 3` | unit (vitest) | new `portfolio-data.test.ts` or extend | ❌ Wave 0 | ⬜ pending |
| CONTENT-03 | `SHIPPED` entries have valid `^https?:` URLs | unit (vitest) + manual curl | `expect(SHIPPED.every(...))` + `curl -sIL` on each URL | ❌ Wave 0 | ⬜ pending |
| CONTENT-04 | `WRITING.length >= 1` | unit (vitest) | `expect(WRITING.length).toBeGreaterThanOrEqual(1)` | ❌ Wave 0 | ⬜ pending |
| CONTENT-05 | `public/resume.pdf` exists, < 250KB, has Title + Author metadata | smoke (mjs) | `node scripts/check-resume-pdf.mjs` | ❌ Wave 0 — create script | ⬜ pending |
| CONTENT-06 | `STACK.length > 0` (real categories) | unit (vitest) | `expect(STACK.length).toBeGreaterThan(0)` | ❌ Wave 0 | ⬜ pending |
| CONTENT-07 | `EXPERIENCE.length > 0` (real entries) | unit (vitest) | `expect(EXPERIENCE.length).toBeGreaterThan(0)` | ❌ Wave 0 | ⬜ pending |
| CONTENT-08 | No forbidden strings in `.next/server/` | smoke (postbuild) | `npm run build` → triggers `scripts/check-placeholders.mjs` | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `portfolio-services/scripts/check-backend.mjs` — D-11 zero-dep smoke gate (BACKEND-04)
- [ ] `portfolio-services/src/scripts/seed.ts` — `npm run seed` entry point (D-13)
- [ ] `portfolio-services/src/seed/{profile,projects,stack,experience,apps,posts}.json` — six JSON seed files (D-13)
- [ ] `portfolio-services/docs/api-contract.md` — contract doc (BACKEND-03)
- [ ] `portfolio-services/tests/app.test.ts` — extend with 7 endpoint shape assertions (replaces `/skills` test)
- [ ] `portfolio-web/scripts/check-resume-pdf.mjs` — gate for CONTENT-05 (`wc -c < 250000`, `Title`, `Author`)
- [ ] `portfolio-web/lib/portfolio-data.test.ts` (new) OR extension of an existing spec — assertions for CONTENT-02, -04, -06, -07
- [ ] Manual content-eyeball gate — render every view in dev with `NEXT_PUBLIC_API_BASE_URL=<railway-url>`, confirm real content
- [ ] Paired-commit referential check — every backend type-change commit cites the matching FE SHA and vice versa (D-19)

*Backend test framework + supertest already installed; no new dev deps needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Every view renders real content end-to-end | CONTENT-01..07 | Eyeball check that no view is broken after seed runs and env-flip takes effect | `NEXT_PUBLIC_API_BASE_URL=https://<railway-url> npm run dev` → visit /, /projects, /stack, /experience, /writing, /contact, /shipped → confirm real names/projects/posts/etc |
| Shipped.app store URLs resolve | CONTENT-03 | Deep-link resolution against the actual App Store / Play Store requires a live device tap or a `curl -sIL` from a network with no regional/store blocks | `curl -sIL "https://apps.apple.com/..."` should return 200 or 30x; tap on iOS device for deep-link confirmation |
| Resume PDF renders correctly | CONTENT-05 | PDF rendering quality is subjective; metadata presence is the automated gate | Open `public/resume.pdf` in Preview/Acrobat; confirm Title + Author appear in document properties; confirm content is legible and the developer's actual resume |
| Backend deployed to Railway with Mongo connection green | BACKEND-04 | Cloud deploy outcomes can't be unit-tested | Visit Railway dashboard, confirm service is "Active", logs show "Portfolio services listening on …" + no Mongo errors; `node scripts/check-backend.mjs` against the public URL is green |
| Paired-commit discipline observed | D-19 | Cross-repo git references need human inspection (commit message cites SHA of the other repo's matching commit) | `git log --oneline` in both repos shows paired commit pattern; each backend type-change commit message includes the matching `portfolio-web` SHA |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (frontend or backend)
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s per task
- [ ] `nyquist_compliant: true` set in frontmatter (after planner+checker land Wave 0)

**Approval:** pending
