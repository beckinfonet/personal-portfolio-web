# Phase 11 — `GITHUB_TOKEN` Provisioning Guide

**Audience:** the repo owner (Bakytbek Tatibekov).
**Why this exists:** Claude cannot perform GitHub or Vercel dashboard
authentication, so the owner must create the token and add it to Vercel by
hand. This guide is the precise step-by-step. Claude has already done
everything scriptable (README rewrite, `.env.example` removal, local quality
gates).

**Status:** Owner action required before Plan 02 deploy + smoke test.

---

## Security ground rules (read first)

- The `GITHUB_TOKEN` value is a **secret**. It must **never** be written into
  this repo — not into `README.md`, not into any verification document, not
  into a commit message, not into `.planning/`.
- The token value lives in exactly **two** places: the **Vercel Production
  environment scope**, and the owner's **local git-ignored `.env.local`** file.
  Nowhere else.
- `.gitignore` already excludes `.env`, `.env.local`, and `.env*.local`, so a
  local `.env.local` holding the token can never be committed by accident.
- The verification document (`11-SMOKE-VERIFICATION.md`) records only the
  **key name** `GITHUB_TOKEN` and observed **numbers** (rate-limit counts) —
  never the token value itself.

---

## Step 1 — Create a GitHub fine-grained Personal Access Token

1. Sign in to GitHub as the repo owner and go to
   <https://github.com/settings/personal-access-tokens> →
   **Fine-grained tokens** → **Generate new token**.
2. **Token name:** something identifiable, e.g. `portfolio-web-vercel-prod`.
3. **Resource owner:** the owner's personal account (the account that owns the
   public portfolio repositories).
4. **Expiration:** a short-to-moderate expiry (e.g. 90 days). A non-expiring
   token is discouraged — note the expiry date so the token can be rotated
   before the projects view silently drops back to the unauthenticated ceiling.
5. **Repository access:** select **Public Repositories (read-only)**. Do **not**
   grant access to private repositories.
6. **Permissions:** under **Repository permissions**, grant **Metadata:
   Read-only** only. This is the single permission `lib/github.ts` needs
   (it reads repo metadata, languages, and commit counts). Grant **no write
   permissions** and **no other scopes** — this is the least-privilege surface
   that still lifts the rate-limit ceiling from 60/hr to 5,000/hr (D-01).
7. Click **Generate token**.

## Step 2 — Copy the token value once

GitHub displays the token value **exactly once**, immediately after creation.
Copy it now and keep it somewhere safe and temporary (a password manager entry,
not a file in this repo). If you lose it you must regenerate — there is no way
to view it again later.

## Step 3 — Add `GITHUB_TOKEN` in the Vercel dashboard (Production scope)

Per D-02, the token is added through the **Vercel dashboard**, not the CLI:

1. Go to <https://vercel.com> → the `portfolio-web` project →
   **Settings** → **Environment Variables**.
2. Click **Add New** (or **Add Another**).
3. **Key:** `GITHUB_TOKEN` (exact name, no `NEXT_PUBLIC_` prefix — it is a
   server-only secret and must never reach the client bundle).
4. **Value:** paste the token value copied in Step 2.
5. **Environments:** select **Production** only.
6. Click **Save**.

## Step 4 — Confirm the token is present

Per D-03, confirm the key is registered without ever revealing the value.

Option A — CLI (`vercel env ls`):

```
vercel env ls
```

This lists environment variable **keys** per scope. Confirm that `GITHUB_TOKEN`
appears in the **Production** column. `vercel env ls` shows key names and
scopes only — it does not print secret values.

Option B — Dashboard: on the same **Settings → Environment Variables** page,
confirm a `GITHUB_TOKEN` row exists with the **Production** environment tag.

Record the confirmation (key name + scope, never the value) in
`11-SMOKE-VERIFICATION.md`.

## Step 5 — (Optional) set the token locally for the ISR check

The Plan 02 ISR verification (`11-SMOKE-VERIFICATION.md`) runs `curl` against
the GitHub rate-limit endpoint with the token in the shell environment:

```
export GITHUB_TOKEN=<paste-token-here>
```

Set this in the shell session only, or in the local git-ignored `.env.local`.
Never paste it into a tracked file.

---

## After provisioning — what unblocks

Once `GITHUB_TOKEN` is present in the Vercel Production scope, Plan 02 can:

1. Trigger the production deploy (Vercel git-integration auto-deploy on push to
   `main`, or `vercel --prod`).
2. Smoke-test `https://www.tatibekov.com/projects` for a real GitHub stat strip.
3. Run the back-to-back `curl` ISR check.

All three are recorded in `11-SMOKE-VERIFICATION.md`.
