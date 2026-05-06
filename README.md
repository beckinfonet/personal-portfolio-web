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
- Light theme by default + persisted dark mode toggle
- SEO baseline: metadata, semantic sections, `robots.ts`, `sitemap.ts`
- Vitest + Testing Library smoke test coverage

## Environment

Copy `.env.example` to `.env.local` and update values as needed:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8080` if unset.
- `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` if unset.

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

- Vercel: import the repo and set environment variables from `.env.example`.
- Other platforms: run `npm run build`, then `npm run start` in production.
