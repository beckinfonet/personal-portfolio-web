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

| Project name      | Observed commit count | Observed language(s) | Observed dev duration | Strip rendered? |
| ----------------- | --------------------- | -------------------- | --------------------- | --------------- |
| Validation Ledger | —                     | —                    | —                     | no              |
| Looper            | —                     | —                    | —                     | no              |
| MoveIn: Real Estate | —                   | —                    | —                     | no              |
| CarEx             | —                     | —                    | —                     | no              |

- At least one card shows real GitHub stats: **no** — DEPLOY-V11-04 BLOCKED
- Cards with no strip — confirmed private/unreachable repos (by design): none — all 7
  candidate repos are public (`HTTP 200` from the unauthenticated GitHub API)
- Notes / observations:

> **BLOCKER — root cause: stale production database (not a portfolio-web defect).**
>
> The frontend code, the deploy, and the `GITHUB_TOKEN` provisioning are all
> correct. No strip renders because the production backend never serves the
> `repoUrls` field:
>
> - `GET https://personal-portfolio-services-production.up.railway.app/api/projects`
>   returns all 4 projects with HTTP 200 but **no `repoUrls` key** on any project.
> - In `app/(terminal)/projects/page.tsx`, `getRepoStats` is only called when
>   `p.repoUrls?.length` is truthy. With `repoUrls` absent, it is never called,
>   `buildStripModel(null)` returns `null`, and every card correctly renders no
>   strip (graceful degradation, LIST-07).
> - The seed file `portfolio-services/src/seed/projects.json` **does** carry
>   `repoUrls` for all 4 projects, and the backend model `src/models/Project.ts`
>   declares `repoUrls: { type: [String] }`. The schema and seed data are correct.
> - The production Railway MongoDB was last seeded **before** Phase 8 added
>   `repoUrls`, so the live documents lack the field.
>
> **Fix (owner action — backend, not portfolio-web):** re-seed the production
> database. From `portfolio-services/`, with the production `MONGO_URI` in the
> environment (e.g. `railway run npm run seed`). The seed script upserts projects
> by name — non-destructive; it just adds `repoUrls` to the 4 existing documents.
> After re-seeding, the `/projects` `getProjects` fetch (`revalidate: 300`) picks
> up `repoUrls` within ~5 min (or immediately on a redeploy), `getRepoStats` then
> fires against the public repos with the provisioned token, and the strips render.

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
- DEPLOY-V11-02 (deploy docs in README, production deploy): _<pass / fail>_
- DEPLOY-V11-03 (local quality gates green): **pass** — `npm run lint`,
  `npm test`, and `npm run build` (with prebuild + postbuild placeholder grep)
  all verified exit 0 in Plan 01.
- DEPLOY-V11-04 (smoke test — ≥1 card with real stats): _<pass / fail>_
- DEPLOY-V11-05 (daily-ISR confirmed): _<pass / fail>_

**Overall Phase 11 verdict:** _<fill in after Plan 02>_
