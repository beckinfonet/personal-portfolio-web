# Portfolio Web

Next.js (App Router) TypeScript frontend for the personal portfolio site.

## Features

- Recruiter-friendly homepage with:
  - Hero
  - Skills / Tech Stack
  - Mobile apps section with App Store and Google Play links
  - Resume download + updated date
  - Experience timeline
  - Blog preview
  - Contact / social links
- API-driven content with graceful fallback when API is unavailable
- Live GitHub repo stats on the projects view (commit count, languages, dev duration)
- Light theme by default + persisted dark mode toggle
- SEO baseline: metadata, semantic sections, `robots.ts`, `sitemap.ts`
- Vitest + Testing Library smoke test coverage

## Environment

Create a git-ignored `.env.local` file in the project root and set the
following variables. All three are optional for local development — the app
runs without them — but each changes behavior as noted.

- `NEXT_PUBLIC_API_BASE_URL`
  - **Purpose:** base URL of the `portfolio-services` backend that serves
    portfolio content.
  - **Default:** `http://localhost:8080` if unset.
  - **Absence consequence:** when the backend is unreachable, `lib/api.ts`
    falls back to the static data in `lib/portfolio-data.ts` — no crash.

- `NEXT_PUBLIC_SITE_URL`
  - **Purpose:** canonical site URL used for metadata and `sitemap.ts`.
  - **Default:** `http://localhost:3000` if unset.
  - **In Production:** set to `https://www.tatibekov.com`.

- `GITHUB_TOKEN`
  - **Purpose:** authenticates the GitHub REST API calls made by
    `lib/github.ts` so the projects view can show live repo stats.
  - **Scope:** a GitHub **fine-grained Personal Access Token**, **read-only**,
    public-repo **metadata only** — no write permissions, no private-repo
    access. See the owner provisioning guide at
    `.planning/phases/11-deploy-smoke-verification/11-PROVISIONING-GUIDE.md`.
  - **Server-only:** this is a server secret. It has **no** `NEXT_PUBLIC_`
    prefix and must never reach the client bundle.
  - **Absence consequence:** GitHub stats degrade gracefully — `lib/github.ts`
    falls back to unauthenticated GitHub requests at the 60-requests/hour
    rate-limit ceiling and logs a one-line dev warning. When stats are `null`,
    the projects-card stat strip and the Tech-highlights panel simply omit;
    nothing crashes.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Deploy

- Vercel: import the repo. Configure the three environment variables above in
  Vercel Project Settings -> Environment Variables -> Production scope
  (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL=https://www.tatibekov.com`,
  and `GITHUB_TOKEN`). `GITHUB_TOKEN` specifically is added through the Vercel
  dashboard following the owner provisioning guide at
  `.planning/phases/11-deploy-smoke-verification/11-PROVISIONING-GUIDE.md` —
  never commit the token value to the repo.
- Other platforms: run `npm run build`, then `npm run start` in production.
