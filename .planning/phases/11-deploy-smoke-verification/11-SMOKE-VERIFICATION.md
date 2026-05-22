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

- Confirmation method (`vercel env ls` / Vercel dashboard): _<fill in>_
- `GITHUB_TOKEN` present in Production scope: _<yes / no>_
- Date confirmed: _<fill in>_

```
<paste the vercel env ls output line showing the GITHUB_TOKEN key — key name and
 scope only, no value>
```

---

## 2. Production deploy (DEPLOY-V11-02)

- Deploy trigger used (git-integration auto-deploy on push to `main` /
  `vercel --prod`): _<fill in>_
- Production URL deployed: _<fill in — expected https://www.tatibekov.com>_
- Deployment ID / commit SHA deployed: _<fill in>_
- Date / time of deploy: _<fill in>_
- Build succeeded (Vercel build log clean): _<yes / no>_

---

## 3. Smoke test — live project-card GitHub stats (DEPLOY-V11-04 / D-06, D-07)

Visit <https://www.tatibekov.com/projects> and inspect the project cards. At
least **one** card must show a real `gh:` stat strip
(`<commits> commits · <langs> · <duration>`).

**Likely public repo candidates** (most likely to render a non-null strip):
`validation-ledger-mobile`, `LooperMobile`, `jaytap-mobile`, `CarEx`. Repos
under `*-services` / `*-agentic` may be private — a private repo degrades to
**no strip** by design (graceful degradation, acceptable per D-07).

| Project name | Observed commit count | Observed language(s) | Observed dev duration | Strip rendered? |
| ------------ | --------------------- | -------------------- | --------------------- | --------------- |
| _<fill in>_  | _<fill in>_           | _<fill in>_          | _<fill in>_           | _<yes / no>_    |
| _<fill in>_  | _<fill in>_           | _<fill in>_          | _<fill in>_           | _<yes / no>_    |
| _<fill in>_  | _<fill in>_           | _<fill in>_          | _<fill in>_           | _<yes / no>_    |
| _<fill in>_  | _<fill in>_           | _<fill in>_          | _<fill in>_           | _<yes / no>_    |

- At least one card shows real GitHub stats: _<yes / no>_
- Cards with no strip — confirmed private/unreachable repos (by design): _<list>_
- Notes / observations: _<fill in>_

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

- DEPLOY-V11-01 (`GITHUB_TOKEN` provisioned, Production scope): _<pass / fail>_
- DEPLOY-V11-02 (deploy docs in README, production deploy): _<pass / fail>_
- DEPLOY-V11-03 (local quality gates green): **pass** — `npm run lint`,
  `npm test`, and `npm run build` (with prebuild + postbuild placeholder grep)
  all verified exit 0 in Plan 01.
- DEPLOY-V11-04 (smoke test — ≥1 card with real stats): _<pass / fail>_
- DEPLOY-V11-05 (daily-ISR confirmed): _<pass / fail>_

**Overall Phase 11 verdict:** _<fill in after Plan 02>_
