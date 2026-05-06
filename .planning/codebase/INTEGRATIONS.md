# External Integrations

**Analysis Date:** 2026-05-06

## APIs & External Services

**Internal portfolio API (assumed self-hosted, not bundled):**
- Base URL configured via `NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8080` (`lib/api.ts` line 10)
- Called server-side from React Server Components (`app/page.tsx` lines 11-17)
- Endpoints invoked from `lib/api.ts`:
  - `GET /api/profile` → `Profile` (line 25)
  - `GET /api/skills` → `Skill[]` (line 29)
  - `GET /api/experience` → `Experience[]` (line 33)
  - `GET /api/apps` → `MobileApp[]` (line 37)
  - `GET /api/posts?limit=N` → `BlogPost[]` (line 41)
- Auth: None — all calls are unauthenticated
- SDK/Client: Native `fetch` (no axios, no generated client)
- Cache: Next.js ISR with `next: { revalidate: 300 }` (5-minute revalidation, `lib/api.ts` line 15)
- Failure mode: Any non-OK response or thrown error returns hardcoded fallbacks from `lib/fallback-data.ts` (`lib/api.ts` lines 17-21)

**Third-party services referenced (not integrated):**
- App Store / Google Play — Outbound `<a>` links rendered in `app/components/homepage.tsx` lines 44-49 from `MobileApp.appStoreUrl` / `googlePlayUrl` fields. No SDK, no API calls.
- GitHub / LinkedIn — Outbound social links from `Profile.socials` (defaults in `lib/fallback-data.ts` lines 11-12). Plain anchor tags, no OAuth or API integration.

## Data Storage

**Databases:**
- None embedded in this repo. Data is fetched at request-time from the external API documented above. No ORM, no client, no migrations.

**File Storage:**
- Local `public/` directory only.
  - `public/resume.pdf` served at `/resume.pdf` and linked via `app/components/homepage.tsx` lines 58-60.
- No S3, Supabase Storage, Cloudflare R2, etc.

**Caching:**
- Next.js Data Cache via `fetch(..., { next: { revalidate: 300 } })` (`lib/api.ts` line 15). No Redis, Memcached, or external cache.

**Client-side persistence:**
- `localStorage` key `portfolio-theme` (defined in `app/components/theme-toggle.tsx` line 5; read in inline boot script in `app/layout.tsx` lines 15-23). Stores `"light" | "dark"`. No remote sync.

## Authentication & Identity

- None. There is no auth provider (no NextAuth, Auth.js, Clerk, Supabase Auth, Firebase Auth). No login UI exists. The portfolio is fully public.

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, Bugsnag, Rollbar imports anywhere in `app/` or `lib/`).

**Logs:**
- None. No logging library; no `console.log` calls in source. Errors in `lib/api.ts` are silently swallowed and replaced with fallback data (line 19: bare `catch {}`).

**Analytics:**
- None (no `@vercel/analytics`, `next/script` for GA, Plausible, PostHog, etc.).

## CI/CD & Deployment

**Hosting:**
- Vercel is the documented target (`README.md` lines 49-51). No `vercel.json` checked in — uses framework auto-detection.
- Generic Node hosting also supported (`README.md` line 51: `npm run build && npm run start`).

**CI Pipeline:**
- None. No `.github/workflows/`, `.gitlab-ci.yml`, `circle.yml`, or other CI definitions in the repo.

## Environment Configuration

**`.env.example` contents (entire file, 2 lines):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Required env vars (both optional, both have defaults):**
- `NEXT_PUBLIC_API_BASE_URL` — Used by `lib/api.ts` line 10. Defaults to `http://localhost:8080`. Public (`NEXT_PUBLIC_` prefix) so it ships to the browser bundle.
- `NEXT_PUBLIC_SITE_URL` — Used by `app/sitemap.ts` line 4 and `app/robots.ts` line 4 to construct absolute URLs in the sitemap and robots output. Defaults to `http://localhost:3000`.

**Secrets location:**
- `.env.local` — Gitignored (see `.gitignore` line 3). Setup flow: `cp .env.example .env.local` (`README.md` line 25).
- No secret values exist in the repo. There are no API keys, OAuth client secrets, database URLs, or service tokens — consistent with the no-auth, public-API design.

## Webhooks & Callbacks

**Incoming:**
- None. There are no API route handlers in `app/` (no `app/**/route.ts` files). The Next.js app is purely a frontend for the external `/api/*` backend.

**Outgoing:**
- None. No webhook calls, no payment provider, no notification services.

## Email / Messaging

- No email service (no SendGrid, Resend, Postmark, AWS SES). The contact section renders a plain `mailto:` link from `Profile.email` (`app/components/homepage.tsx` line 98).

## Summary

This frontend has minimal external surface area:
- One backing HTTP API (`NEXT_PUBLIC_API_BASE_URL`) consumed read-only via 5 unauthenticated GET endpoints, with hard-coded fallbacks ensuring the site renders even when the API is offline.
- One configured site URL (`NEXT_PUBLIC_SITE_URL`) used only for SEO metadata generation.
- No databases, auth providers, payment processors, analytics, observability, or CI/CD integrations are wired into the codebase.

---

*Integration audit: 2026-05-06*
