---
phase: 1
slug: foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 1 has no new behavior to test (UI ships in Phase 2 / TEST-01 keeps `homepage.test.tsx` adapted but not replaced); validation is shell-based against build/typecheck/lint/audit outputs.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 (preserved per TEST-01) |
| **Config file** | `vitest.config.ts` (no edits in Phase 1) |
| **Quick run command** | `npm run typecheck` (≈3 s — fastest gate; catches type drift on shape changes) |
| **Full suite command** | `npm run lint && npm run typecheck && npm test && npx knip && npm run build` |
| **Estimated runtime** | quick ≈3 s; full ≈45–60 s (build is dominant) |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck`. For tasks that touch `lib/api.ts`, `lib/portfolio-data.ts`, or `app/components/homepage*`, also run `npm test`.
- **After every plan wave:** Run the full suite command above.
- **Before `/gsd-verify-work`:** Full suite must be green AND `npm audit --omit=dev` reports zero high/critical AND `npm ls next-themes cmdk` resolves clean AND `git grep -E "fallback-data" -- lib/ app/` returns zero hits AND `curl -I http://localhost:3000/` (after `npm run dev`) shows the security + `x-built-with` headers.
- **Max feedback latency:** ~5 s (typecheck) per task; ~60 s (full suite) per wave.

---

## Per-Task Verification Map

> Pre-seeded from RESEARCH.md §"Phase Requirements → Validation Map". The planner fills `Task ID`, `Plan`, and `Wave` columns once tasks are defined.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01-01 | 1 | INFRA-01 | — | `next` upgraded; advisories resolved | shell | `npm audit --omit=dev \| grep -E "high\|critical" \|\| echo OK` | n/a | ⬜ pending |
| 01-01-01 | 01-01 | 1 | INFRA-01 | — | `next` resolves to `^15.5.x` (target 15.5.15) | shell | `npm ls next \| grep -E "next@15\.5\."` | n/a | ⬜ pending |
| 01-01-01 | 01-01 | 1 | INFRA-02 | — | `next-themes`, `cmdk` installed; zero peer warnings | shell | `npm ls next-themes cmdk 2>&1 \| grep -E "ERR\|peer dep missing\|UNMET" \|\| echo OK` | n/a | ⬜ pending |
| 01-06-02 | 01-06 | 4 | INFRA-03 | — | CI workflow file present with all 5 steps | shell | `test -f .github/workflows/ci.yml && grep -cE "lint\|typecheck\|test\|knip\|build" .github/workflows/ci.yml \| awk '$1>=5{exit 0}{exit 1}'` | n/a | ⬜ pending |
| 01-06-02 | 01-06 | 4 | INFRA-03 | — | Knip hard-fails on orphan finding (no `--no-exit-code`) | shell | `grep -c "no-exit-code" .github/workflows/ci.yml` (must be 0) | n/a | ⬜ pending |
| 01-04-01 | 01-04 | 3 | INFRA-04 | T-INFRA-04 (clickjacking, MIME sniffing, sensor abuse) | Security + engineer headers present on response | shell | `npm run dev &; sleep 3; curl -sI http://localhost:3000/ \| grep -E "Strict-Transport-Security\|X-Content-Type-Options\|Referrer-Policy\|X-Frame-Options\|Permissions-Policy\|x-built-with"; kill %1` | n/a | ⬜ pending |
| 01-05-02 | 01-05 | 3 | INFRA-05 | T-INFRA-05 (placeholder leak to prod) | postbuild grep fails build on placeholder hit | shell | `cp lib/portfolio-data.ts /tmp/pd.bak; echo "TODO: leak" >> lib/portfolio-data.ts; npm run build; rc=$?; mv /tmp/pd.bak lib/portfolio-data.ts; [ $rc -ne 0 ]` | n/a | ⬜ pending |
| 01-05-01 + 01-05-02 | 01-05 | 3 | INFRA-05 | — | postbuild grep passes on clean build | shell | `npm run build 2>&1 \| grep -E "INFRA-05.*clean\|✓.*placeholder"` | n/a | ⬜ pending |
| 01-02-01 | 01-02 | 2 | DATA-01 | — | `lib/types.ts` exports the 7 expected interfaces | shell | `grep -cE "^export (interface\|type) (Profile\|Project\|Social\|Experience\|Writing\|ShippedApp\|StackCategory)" lib/types.ts` (≥ 7) | n/a | ⬜ pending |
| 01-02-01 | 01-02 | 2 | DATA-01 | — | TypeScript strict compiles with new shapes | shell | `npm run typecheck` (exit 0) | n/a | ⬜ pending |
| 01-02-02 | 01-02 | 2 | DATA-02 | — | `lib/portfolio-data.ts` exists and exports typed dataset | shell | `test -f lib/portfolio-data.ts && grep -cE "^export const (PROFILE\|PROJECTS\|SOCIALS\|EXPERIENCE\|WRITING\|SHIPPED\|STACK)" lib/portfolio-data.ts` | n/a | ⬜ pending |
| 01-02-02 | 01-02 | 2 | DATA-02 | T-DATA-02 (`beck@example.com`, `Product Studio` leak) | Real identity + socials + email; TBD only on bio/projects/writing/shipped/experience | shell | `grep -E "example\.com\|Product Studio" lib/portfolio-data.ts \|\| echo OK`; `grep -E "TODO:" lib/portfolio-data.ts \| wc -l` (must be > 0 to confirm TBD markers used) | n/a | ⬜ pending |
| 01-02-06 | 01-02 | 2 | DATA-03 | — | `lib/fallback-data.ts` deleted; no remaining imports | shell | `! test -f lib/fallback-data.ts && ! grep -rE "fallback-data" lib/ app/` | n/a | ⬜ pending |
| 01-02-03 | 01-02 | 2 | DATA-04 | — | `lib/api.ts` adapted; `getJson` ISR + silent-fallback preserved | shell | `grep "function getJson\|export async function getJson" lib/api.ts && grep -cE "getProfile\|getProjects\|getSocials\|getExperience\|getWriting\|getShipped\|getStack" lib/api.ts` (≥ 6) | n/a | ⬜ pending |
| 01-03-01 | 01-03 | 2 | DATA-05 | — | `lib/routes.ts` exports a 7-entry typed `as const` array (single source of truth for Sidebar / CommandPalette / sitemap) | shell | `grep -c "pathname:" lib/routes.ts \| awk '$1==7{exit 0}{exit 1}'`; `grep -E "as const\|export const ROUTES" lib/routes.ts` | n/a | ⬜ pending |
| 01-03-02 | 01-03 | 2 | ROUTE-03 (metadataBase) | — | `metadataBase` set in `app/layout.tsx` (uses `\|\|` operator per Pitfall D, not `??`) | shell | `grep -E "metadataBase: new URL\(" app/layout.tsx`; `grep -E "metadataBase.*\|\|" app/layout.tsx` | n/a | ⬜ pending |
| 01-03-02 | 01-03 | 2 | ROUTE-03 (build clean) | — | Build emits zero `metadataBase` warnings | shell | `npm run build 2>&1 \| grep -i "metadataBase warning" \|\| echo OK` (no warnings) | n/a | ⬜ pending |
| 01-02-04 + 01-02-05 | 01-02 | 2 | TEST-01 (D-17 homepage adapter) | T-DATA-02 | `app/components/homepage.tsx` + `homepage.test.tsx` adapted to new types in same atomic commit as data refactor; `lib/fallback-data.ts` import replaced with `lib/portfolio-data.ts`; existing test continues to pass | shell | `npm test` (exit 0); `npm run typecheck` (exit 0); `! grep -rE "fallback-data" app/components/` | yes (preserved + adapted) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Per RESEARCH.md §"Wave 0 Gaps": **Phase 1 introduces zero new test files.** The single existing test (`app/components/homepage.test.tsx`) is adapted in the same commit as the data refactor (D-17 / Wave 0 path "minimal homepage adapter") so it continues to pass after `lib/fallback-data.ts` is deleted.

- [x] No new framework install needed (Vitest 3.1.4 already in place)
- [x] No new test fixtures needed (adapter rewires existing fixture in-place)
- [ ] **Wave 0 task (in plan):** "Adapt `app/components/homepage.tsx` + `homepage.test.tsx` to new `lib/types.ts` shapes; replace `lib/fallback-data.ts` import with `lib/portfolio-data.ts`. Test must continue to pass." — same atomic commit as the data refactor (DATA-01 + DATA-02 + DATA-03 + DATA-04).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Branch protection on `main` (require CI green to merge, 0 reviewers) | INFRA-03 / D-06 | GitHub UI configuration; no programmatic check from this repo | After first PR lands, in GitHub UI: Settings → Branches → Add rule for `main` → Require status checks → select `CI`. Document in repo README or `.github/CODEOWNERS`. |
| Vercel deploy runtime accepts `engines.node: "22.x"` | INFRA-01 / D-04 | Cannot test until Phase 7 deploy lands; documented research finding gates this. | Phase 7 plan: first Vercel build must succeed without `Found invalid Node.js Version`. |
| `npm audit` zero high/critical | INFRA-01 (success criterion 1) | Audit DB drifts; need real-time check at phase gate | Run `npm audit --omit=dev` immediately before `/gsd-verify-work`. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify command or Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify (Phase 1 is verify-dense — every task ends in a shell check)
- [x] Wave 0 covers the homepage adapter dependency (D-17)
- [x] No watch-mode flags in commands (Vitest in `run` mode only)
- [x] Feedback latency < 60 s for full suite
- [x] `nyquist_compliant: true` set in frontmatter once planner fills task IDs

**Approval:** approved (revision pass 2026-05-06 — all task IDs bound)
