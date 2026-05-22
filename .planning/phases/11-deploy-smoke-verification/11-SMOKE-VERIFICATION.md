# Phase 11 — Deploy + Smoke Verification

**Purpose:** record the production cutover of the v1.1 GitHub-stats feature and
prove it works live. This is a scaffold — Plan 02 fills in the empty result
slots after the owner provisions `GITHUB_TOKEN` (see
`11-PROVISIONING-GUIDE.md`).

**Security note:** this document records key names and observed numbers only.
The `GITHUB_TOKEN` value must **never** appear here.

**Status:** SCAFFOLD — awaiting Plan 02.

---

## 1. `GITHUB_TOKEN` presence confirmation (DEPLOY-V11-01 / D-03)

Confirm the token key is registered in the Vercel **Production** scope. Record
the **key name only** — never the value.

- Confirmation method (`vercel env ls` / Vercel dashboard): Vercel dashboard — Settings → Environment Variables
- `GITHUB_TOKEN` present in Production scope: yes
- Date confirmed: 2026-05-22

```
GITHUB_TOKEN            Sensitive   Production
```

Observed in the Vercel dashboard Environment Variables list: a `GITHUB_TOKEN`
row tagged `Sensitive` with the `Production` environment, alongside the
pre-existing `NEXT_PUBLIC_SITE_URL` (Production) and `NEXT_PUBLIC_API_BASE_URL`
(Production and Preview). Key name and scope only — no value shown or recorded.

---

## 2. Production deploy (DEPLOY-V11-02)

- Deploy trigger used (git-integration auto-deploy on push to `main` /
  `vercel --prod`): git-integration auto-deploy — `git push origin main` (68 commits, `3db7080..6cd4d15`)
- Production URL deployed: https://www.tatibekov.com
- Deployment ID / commit SHA deployed: `6cd4d15`
- Date / time of deploy: 2026-05-22
- Build succeeded (Vercel build log clean): yes — `/projects` returns HTTP 200

---

## 3. Smoke test — live project-card GitHub stats (DEPLOY-V11-04 / D-06, D-07)

Visit <https://www.tatibekov.com/projects> and inspect the project cards. At
least **one** card must show a real `gh:` stat strip
(`<commits> commits · <langs> · <duration>`).

**Likely public repo candidates** (most likely to render a non-null strip):
`validation-ledger-mobile`, `LooperMobile`, `jaytap-mobile`, `CarEx`. Repos
under `*-services` / `*-agentic` may be private — a private repo degrades to
**no strip** by design (graceful degradation, acceptable per D-07).

| Project name        | Observed commit count | Observed language(s) | Observed dev duration | Strip rendered? |
| ------------------- | --------------------- | -------------------- | --------------------- | --------------- |
| Validation Ledger   | 285 commits           | Swift                | 1mo                   | yes             |
| Looper              | 18 commits            | TS / Shell           | 1mo                   | yes             |
| MoveIn: Real Estate | 874 commits           | TS / JS              | 3mo                   | yes             |
| CarEx               | 426 commits           | TS / JS              | 4mo                   | yes             |

- At least one card shows real GitHub stats: **yes** — all 4 cards render a real
  `gh:` strip — DEPLOY-V11-04 satisfied
- Cards with no strip — confirmed private/unreachable repos (by design): none — all 7
  candidate repos are public (`HTTP 200` from the GitHub API)
- `curl` text evidence — `curl -s https://www.tatibekov.com/projects` (React
  comment markers stripped) shows 4 `gh-token` strip spans:

```
gh: 285 commits · Swift · 1mo
gh: 18 commits · TS / Shell · 1mo
gh: 874 commits · TS / JS · 3mo
gh: 426 commits · TS / JS · 4mo
```

- Notes / observations:

> **Resolved blocker — root cause was a stale production database (not a portfolio-web defect).**
>
> The first smoke-test attempt showed no strips. Investigation found the
> production backend `GET /api/projects` returned all 4 projects with HTTP 200
> but **no `repoUrls` key** — so `app/(terminal)/projects/page.tsx` never called
> `getRepoStats` and every card correctly degraded to no strip (LIST-07). The
> frontend code, the deploy, and the `GITHUB_TOKEN` provisioning were all
> correct; the production Railway MongoDB had simply never been re-seeded after
> Phase 8 added `repoUrls`.
>
> **Fix applied:** a surgical, projects-only backfill
> (`portfolio-services/scripts/backfill-project-repourls.mjs`) `$set` the
> `repoUrls` field on the 4 existing project documents — by name, no other field
> or collection touched. A full `npm run seed` was deliberately NOT used: its
> seed files have drifted behind hand-edited production values (`profile`
> highlights/shortName) and renamed apps, so a full seed would have clobbered
> real data.
>
> After the backfill, `GET /api/projects` serves `repoUrls` on all 4 projects,
> `getRepoStats` fires against the public repos with the provisioned token, and
> all 4 cards render a real `gh:` strip (confirmed live + via `curl`).

---

## 4. Daily-ISR confirmation (DEPLOY-V11-05 / D-08)

`/projects` uses a daily ISR cache (`revalidate: 86400` in `lib/github.ts`). A
page served from that cache makes **zero** GitHub API calls, so GitHub's
rate-limit `remaining` count must **not** decrement between two back-to-back
checks within the 86400s window.

The owner runs these with their token in the shell environment
(`export GITHUB_TOKEN=<TOKEN>` — never paste the token into this file). Only
the observed `remaining` numbers get pasted below, never the token.

**Check — read the GitHub rate-limit endpoint twice, a few seconds apart:**

```
# First read
curl -sI https://api.github.com/rate_limit -H "Authorization: Bearer <TOKEN>" \
  | grep -i x-ratelimit-remaining

# wait ~5 seconds, then second read
sleep 5
curl -sI https://api.github.com/rate_limit -H "Authorization: Bearer <TOKEN>" \
  | grep -i x-ratelimit-remaining
```

Alternative (JSON body instead of headers — compare `rate.remaining`):

```
curl -s https://api.github.com/rate_limit -H "Authorization: Bearer <TOKEN>" \
  | grep -o '"remaining":[0-9]*' | head -1
```

**Interpretation:** load `https://www.tatibekov.com/projects` once to warm the
ISR cache, then reload it. Because the second page load is served from the
86400s ISR cache, it issues **no** GitHub API calls — so the `remaining` value
observed before and after the second `/projects` load must be **identical**. A
decremented value would mean the page bypassed the cache and called GitHub
per-request (ISR not holding).

- First `x-ratelimit-remaining` observed: _<fill in — number only>_
- Second `x-ratelimit-remaining` observed: _<fill in — number only>_
- Values identical (ISR cache held, zero per-request GitHub calls): _<yes / no>_
- `/projects` reload served from ISR cache: _<yes / no>_
- Notes / observations: _<fill in>_

---

## 5. Verdict

- DEPLOY-V11-01 (`GITHUB_TOKEN` provisioned, Production scope): **pass** — confirmed in Vercel dashboard, Production scope (2026-05-22)
- DEPLOY-V11-02 (deploy docs in README, production deploy): **pass** — README env/deploy
  sections rewritten in Plan 01; production deploy live (commit `6cd4d15`)
- DEPLOY-V11-03 (local quality gates green): **pass** — `npm run lint`,
  `npm test`, and `npm run build` (with prebuild + postbuild placeholder grep)
  all verified exit 0 in Plan 01.
- DEPLOY-V11-04 (smoke test — ≥1 card with real stats): **pass** — all 4 production
  cards render a real `gh:` strip after the projects-only `repoUrls` backfill
- DEPLOY-V11-05 (daily-ISR confirmed): _<pass / fail>_

**Overall Phase 11 verdict:** _<fill in after Plan 02>_
