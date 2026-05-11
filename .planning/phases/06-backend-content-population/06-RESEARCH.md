# Phase 6: Backend + Content Population - Research

**Researched:** 2026-05-10
**Domain:** Express+Mongoose backend reshape, Railway deploy, hand-mirrored type contract, content authoring, resume PDF gates
**Confidence:** HIGH for backend mechanics + frontend cutover; MEDIUM for Railway specifics; LOW for resume PDF tooling (no PDF utilities installed locally — `pdfinfo`/`qpdf`/`gs`/`exiftool` all missing per Environment Availability)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Cutover sequencing**
- **D-01:** Backend-first deploy, then frontend env-flip. Step 1 — ship `portfolio-services` to Railway production with all corrected shapes + new `/api/projects` + renamed `/api/stack`. Step 2 — verify via smoke script (D-11). Step 3 — deploy frontend with `NEXT_PUBLIC_API_BASE_URL=https://<railway-host>`. Roadmap Success Criterion 2 enforces this ordering.
- **D-02:** Keep `lib/portfolio-data.ts` as a permanent silent fallback. Existing `try/catch` in `lib/api.ts:25-35` continues to swallow fetch failures. DATA-04 resilience preserved.
- **D-03:** **No runtime response validation** in Phase 6. zod deferred until a type mismatch causes a render bug. TypeScript compilation catches drift in seed data + view consumers.
- **D-04:** Production fetches use a **separate origin** via `NEXT_PUBLIC_API_BASE_URL`. No rewrites. RSC fetches are server-side so CORS is a non-issue. `lib/api.ts:18` already reads the env var with localhost fallback.

**Backend shape adjustment**
- **D-05:** **Rewrite shapes in place** — clean break, no v2 versioning, no parallel endpoints. Backend Mongoose models + controllers + DTOs rewritten to match `lib/types.ts` directly.
- **D-06:** **Rename `/api/skills` → `/api/stack`** with the new `StackCategory[]` shape (`{ category, items: string[] }`). `Skill.ts` model retired; `Stack.ts` (or restructured) replaces it. Backend `SkillDto` deleted.
- **D-07:** `/api/projects` gets a **Mongoose model + DB backing** for consistency. `models/Project.ts` mirrors `Profile`/`Experience`/`App`/`Post` pattern. New `getProjects` controller method.
- **D-08:** **API contract = hand-written markdown** at `portfolio-services/docs/api-contract.md`. One section per endpoint: method+path, response TS shape (copy-pasted from `lib/types.ts`), example payload, `revalidate` interval. Zero tooling.

**Backend deployment + storage**
- **D-09:** **Railway** for backend hosting. Managed Mongo provisioning co-located. No idle spin-down on paid tier.
- **D-10:** **Keep Mongoose + MongoDB** — do NOT shift to seeded constants. Future chatbot will read from Mongo; writing posts get stored in DB rather than authored as TS constants.
- **D-11:** **Readiness gate = `scripts/check-backend.mjs`** (lives in `portfolio-services/scripts/`) — curl smoke against `$PROD_API_URL`. 7 endpoints (`/health`, `/profile`, `/projects`, `/stack`, `/experience`, `/apps`, `/posts`): HTTP 200 + `application/json` + canonical key presence + placeholder grep (`lorem|example.com|placeholder|Product Studio`). Exit non-zero on any hit.
- **D-12:** **All Phase 6 endpoints are public read-only.** No auth, no API key. Admin/auth deferred to Phase 7.

**Content authoring discipline**
- **D-13:** **Mongo content authored via seed-script + JSON files** in `portfolio-services/src/seed/`. One JSON per content type. `npm run seed` upserts via stable key (slug for posts, name for projects/apps, single doc for profile).
- **D-14:** **Frontend `lib/portfolio-data.ts` mirrors the seed JSON content** so the fallback path renders identical data. Hand-maintained; codegen deferred.

**Content scope decisions**
- **D-15:** **Writing posts v1 = exactly 1 real post.** CONTENT-04 satisfied. WritingView's empty-state branch is defensive.
- **D-16:** **Third social = NONE.** GitHub + LinkedIn only. PROFILE.socials already has 2 entries — freeze the count.
- **D-17:** **Shipped apps v1 = top 2 or 3** with currently-valid App Store / Play Store URLs. **Reconcile PROFILE.highlights "4 apps shipped":** change to match final count or replace with a different highlight. Planner: pair the SHIPPED entry count with the PROFILE.highlights value.

**Resume PDF (CONTENT-05)**
- **D-18:** **Drop in the existing real PDF** at `public/resume.pdf` (filename `Bakytbek_Tatibekov_Resume.pdf` for `Content-Disposition`). Verify `file public/resume.pdf` confirms PDF, `wc -c public/resume.pdf` < 250KB, `pdfinfo` shows non-empty `Title` and `Author`. If metadata absent, `exiftool -Title="..." -Author="..." public/resume.pdf` fixes it.

**Brownfield discipline**
- **D-19:** Backend shape changes ship as **paired commits** — `portfolio-web` (`lib/types.ts` + `lib/portfolio-data.ts`) and `portfolio-services` (model + controller + route + contract doc) referenced by SHA in each commit message.

### Claude's Discretion
- Final wording of the single writing post (D-15) — pick a topic that signals engineering craft.
- Bio paragraphs final text (CONTENT-01).
- Specific project list (CONTENT-02) — ≥3 entries.
- `scripts/check-backend.mjs` exact assertion list.
- Whether to add a `/health` shape check to the smoke script (probably yes).

### Deferred Ideas (OUT OF SCOPE)
- Chatbot that reads from Mongo (Phase 8+).
- `/api/admin/*` carve-out with static bearer-token auth (Phase 7).
- OpenAPI / zod codegen for the API contract.
- Runtime response validation in `lib/api.ts`.
- Auto-generated `lib/portfolio-data.ts` from `portfolio-services/src/seed/*.json`.
- CMS or admin dashboard.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BACKEND-01 | New `/api/projects` endpoint returning `Project[]` matching `lib/types.ts` | §"Backend Rewrite Mechanics" — new `Project.ts` model + `getProjects` controller + route entry, mirrors existing 4-model pattern (Profile/Experience/App/Post) |
| BACKEND-02 | Adjust `/api/profile`, `/api/skills`→`/api/stack`, `/api/experience`, `/api/apps`, `/api/posts` to match `lib/types.ts` | §"Standard Stack" + §"Backend Rewrite Mechanics" — 5 DTOs in `src/types/content.ts` rewritten verbatim from `lib/types.ts` exports; 5 Mongoose schemas reshaped (nested Bio + Social[] + Highlight[] on Profile; flatten Experience to `{role, company, period, summary}`; ShippedApp gets `platforms: string[]`, `appStoreUrl?`, `googlePlayUrl?`) |
| BACKEND-03 | Hand-written contract doc at `portfolio-services/docs/api-contract.md` | §"Don't Hand-Roll" + §"Code Examples" — markdown template with 7 sections (one per endpoint) copying TS shapes verbatim; paired-commit SHA reference convention |
| BACKEND-04 | Sibling backend deployed before frontend cuts over | §"Standard Stack" Railway row + §"Architecture Patterns" Pattern 1 (deploy ordering); `lib/api.ts` graceful-fallback gives free deploy-anytime safety |
| CONTENT-01 | Real bio (short+long), highlights, role, location, email, socials in `lib/portfolio-data.ts` + matching `profile.json` seed | §"Code Examples" — profile.json/Profile schema with nested Bio + Highlight[] + Social[]; PROFILE.location currently "Remote — open globally" (stand-in per Plan 03-13); user fills real city or keeps Remote |
| CONTENT-02 | ≥3 real projects with name/year/status/summary/tech/role/link | §"Code Examples" projects.json shape; PROJECTS array currently empty in `lib/portfolio-data.ts:67-70` |
| CONTENT-03 | Real shipped apps with valid App Store / Play Store URLs | §"Common Pitfalls" Pitfall 4 (deep-link verification); §"Validation Architecture" — manual eyeball gate to tap-test on iOS device or `curl -I` to confirm 200 / 301 |
| CONTENT-04 | ≥1 real writing post | D-15: exactly 1 post; WritingView.tsx:13-21 empty-state branch becomes defensive code |
| CONTENT-05 | Real `Bakytbek_Tatibekov_Resume.pdf` < 250KB with Title/Author metadata | §"Resume PDF Tooling" — `pdf-lib` (zero-dep npm) is the Node-only fallback since pdfinfo/qpdf/gs/exiftool are all unavailable locally |
| CONTENT-06 | Final stack categories + entries for `stack.json` view | §"Code Examples" stack.json shape; current STACK has 4 entries (languages/frameworks/cloud/ai) — user adds/removes to taste |
| CONTENT-07 | Final experience.log entries (role, company, period, summary) | §"Code Examples" experience.json shape; EXPERIENCE array currently empty |
| CONTENT-08 | All placeholder strings absent from production build | INFRA-05 prebuild grep already wired in `scripts/check-placeholders.mjs`; §"Validation Architecture" lists the chain |
</phase_requirements>

## Summary

Phase 6 is two coupled workstreams that converge on a single env-var flip:

1. **Backend cutover** — Reshape `portfolio-services` (Express 5.2.1 + Mongoose 9.6.1 [VERIFIED: npm view mongoose version → 9.6.2]) so all 6 endpoints match `lib/types.ts` exactly, add `/api/projects` as a 7th, rename `/api/skills` → `/api/stack`, document the contract in `portfolio-services/docs/api-contract.md`, ship a JSON-seed authoring loop, deploy to Railway, smoke the production URL.
2. **Content population** — Replace stand-in copy in `lib/portfolio-data.ts` with real bio/highlights/projects/experience/writing (1 post)/shipped apps (2–3)/stack; mirror identical content into `portfolio-services/src/seed/*.json`; place the real `Bakytbek_Tatibekov_Resume.pdf` in `public/`.

The frontend already silently falls back when the backend is down (`lib/api.ts:25-35`), which makes ordering easy: deploy backend → smoke it → flip `NEXT_PUBLIC_API_BASE_URL` in Vercel → frontend deploy automatically picks up. No "big bang" cutover needed.

**Primary recommendation:** Author the backend in **paired-commit waves** keyed off `lib/types.ts`. Each wave touches exactly one type (Profile / Stack / Experience / App / Post / Project) end-to-end across both repos in one logical change: model + DTO + controller + route line + contract-md section + seed JSON + (where needed) `lib/portfolio-data.ts` mirror. This keeps the contract self-consistent at every commit and produces a clean paired-SHA reference trail per D-19.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Domain type definitions (single source of truth) | Frontend (`lib/types.ts`) | Backend (`src/types/content.ts` mirrors) | ARCHITECTURE.md §"Backend Contract" locks this. Frontend rendering shape is authoritative because views own UX. |
| Persistent storage of content | Backend (Mongoose / MongoDB) | Frontend (`lib/portfolio-data.ts` fallback) | D-10: future chatbot reads from Mongo. Fallback is silent insurance, not primary data path. |
| Content authoring | Backend (`src/seed/*.json` + `npm run seed`) | Frontend (manual mirror to `lib/portfolio-data.ts`) | D-13: version-controlled JSON authored once; seed script upserts. Frontend constant authored by hand to mirror, no codegen (D-14). |
| Public read access | Backend (`GET /api/*`) | — | All endpoints public read-only (D-12). No middleware, no auth headers. |
| Request caching | Frontend (`next: { revalidate: 300 }` on every `getJson`) | — | STACK.md §"API Client" — 5-min ISR window at Next.js Data Cache; backend is just an upstream of truth. |
| Resilience to backend outage | Frontend (`try/catch` silent fallback in `lib/api.ts:25-35`) | — | DATA-04 / D-02 — preserved as-is. |
| Resume PDF delivery | Frontend (`public/resume.pdf` → CDN) | — | Static asset; never goes through backend. |
| Deploy ordering enforcement | Operations (Railway → smoke → Vercel) | — | `scripts/check-backend.mjs` smoke gate (D-11) makes ordering self-enforcing — runs against `$PROD_API_URL` before the human flips the Vercel env var. |
| Type drift detection | Frontend TypeScript compiler | Backend TypeScript compiler | D-03 + ARCHITECTURE.md — `tsc --noEmit` on both sides catches one half of the contract; runtime drift caught only when a view renders incorrectly (acceptable risk for v1). |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mongoose` | ^9.6.1 (installed) → 9.6.2 latest | MongoDB ODM, schema/model/Mongoose docs | [VERIFIED: npm view mongoose version → 9.6.2] Already in `portfolio-services/package.json` line 18. Engines require Node `>=20.19.0` [CITED: npm view mongoose@latest engines]; project runs Node 22.x (frontend pin) — compatible. |
| `express` | ^5.2.1 (installed) | HTTP framework | [VERIFIED: npm view express version → 5.2.1] Already in deps. Express 5 is stable as of 2024-Q4; project is on the latest patch. |
| `dotenv` | ^17.4.2 | Local `.env` loading | Already wired in `src/config/env.ts`. On Railway, env vars come from the platform — `dotenv.config()` is a no-op in production but harmless. |
| Railway managed MongoDB | latest plugin (D-09) | Production database | [CITED: docs.railway.com/guides/mongodb] Railway auto-provisions Mongo via the plugin; the connection string is injected as an env var (defaults to `MONGO_URL`). Co-located private networking → low latency from the Express service. |
| Railway Express service | n/a | Backend hosting | [CITED: docs.railway.com/guides/express] Auto-detects Node, runs `npm install` + `npm start` by default; build command `npm run build` (tsc) → run `npm start` (`node dist/src/server.js`) matches current `package.json`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jest` + `ts-jest` + `supertest` | 30.x / 29.x / 7.x | Backend test framework | Already wired in `portfolio-services/`. New endpoint tests slot in next to `tests/app.test.ts`. |
| `pdf-lib` | latest (^1.17.x [ASSUMED]) | Node-only PDF metadata setter | [CITED: github.com/Hopding/pdf-lib/issues/55] Pure-JS, zero native deps. Used **only if** the source PDF lacks Title/Author and exiftool isn't installable on the developer machine. Not a project dependency — invoke via `npx pdf-lib` shim or a small one-shot Node script in `scripts/`. |
| Node `node:test` or zero-dep `node` script | n/a | `scripts/check-backend.mjs` | Existing `portfolio-web/scripts/check-*.mjs` are zero-dep mjs files using `node:fs`, `fetch`, `process.exit`. Same idiom for `portfolio-services/scripts/check-backend.mjs`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Railway managed MongoDB | MongoDB Atlas free tier | Atlas has a generous free tier, but D-09 explicitly chose Railway for co-location. Atlas adds a cross-cloud network hop + a separate auth surface. Stick with Railway. |
| `pdf-lib` for resume metadata | Install `exiftool` via brew + run once | exiftool is the one-command-fix recommended in D-18; pdf-lib is the fallback if the developer can't or won't install exiftool. Both work; D-18's exiftool path is the explicit user preference. |
| zod boundary validation | TypeScript only | D-03 explicit defer. Don't add. |
| Per-endpoint smoke spec in Jest | Single zero-dep `check-backend.mjs` | D-11 locks the mjs smoke as the readiness gate. Jest specs (BACKEND-02 acceptance criteria) live separately as paired-commit deliverables for each endpoint. Both exist. |

**Installation (backend, if needed):**
```bash
# In portfolio-services/
# No new prod deps required by Phase 6 — Mongoose + Express already cover it.
# Optional dev tooling:
npm install --save-dev tsx        # cleaner ts-node alternative for the seed script (or reuse ts-node-dev)
```

**Version verification (run before locking the plan):**
```bash
cd portfolio-services
npm view mongoose version          # → 9.6.2 (2026-05-10 confirmed)
npm view express version           # → 5.2.1
npm outdated                       # surface any other drift before reshape
```

## Architecture Patterns

### System Architecture Diagram

```
                  ┌─────────────────────────────────────────────────────────┐
                  │            Vercel: portfolio-web (Next.js 15)           │
                  │  ┌────────────────────────────────────────────────────┐ │
                  │  │  Per-view RSC page.tsx                             │ │
                  │  │    └─ awaits lib/api.ts getProfile/getProjects/... │ │
                  │  │         └─ fetch(`${baseUrl}${path}`,              │ │
                  │  │                   { next: { revalidate: 300 } })   │ │
                  │  │         └─ on !ok or throw → return fallback       │ │
                  │  │              from lib/portfolio-data.ts            │ │
                  │  └────────────────────────────────────────────────────┘ │
                  │             │ baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL │
                  └─────────────┼───────────────────────────────────────────┘
                                │ (server-side fetch — NO CORS)
                                ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │   Railway: portfolio-services (Express 5 + Mongoose)    │
                  │   process.env.PORT  process.env.MONGO_URI (= MONGO_URL) │
                  │  ┌────────────────────────────────────────────────────┐ │
                  │  │  app.use('/api', apiRoutes)                        │ │
                  │  │    /health → 200 {status:'ok'}                     │ │
                  │  │    /profile → Profile.findOne().lean()             │ │
                  │  │    /projects → Project.find().lean()    (NEW)      │ │
                  │  │    /stack → Stack.find().lean()         (RENAMED)  │ │
                  │  │    /experience → Experience.find().lean()          │ │
                  │  │    /apps → App.find().lean()                       │ │
                  │  │    /posts → Post.find().sort({date:-1}).lean()     │ │
                  │  └────────────────────────────────────────────────────┘ │
                  │             │ Mongoose connection                        │
                  └─────────────┼───────────────────────────────────────────┘
                                ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │  Railway plugin: MongoDB (co-located private network)   │
                  │     7 collections: profiles, projects, stacks,          │
                  │                    experiences, apps, posts             │
                  └─────────────────────────────────────────────────────────┘
                                ▲
                                │ npm run seed (one-shot, idempotent)
                                │
                  ┌─────────────────────────────────────────────────────────┐
                  │  portfolio-services/src/seed/                            │
                  │   profile.json  projects.json  stack.json                │
                  │   experience.json  apps.json  posts.json                 │
                  │   (git-tracked; mirrored by hand into                    │
                  │    portfolio-web/lib/portfolio-data.ts)                  │
                  └─────────────────────────────────────────────────────────┘
```

**Data flow walk-through (typical request, post-cutover):**
1. User navigates to `https://bakytbek.dev/projects`.
2. Vercel serves the RSC-rendered HTML; the underlying RSC ran on Vercel's Node runtime when the page was last revalidated.
3. That RSC called `getProjects()` → `getJson<Project[]>("/api/projects", PROJECTS)`.
4. `fetch("https://<railway>.up.railway.app/api/projects", { next: { revalidate: 300 } })` hit the Express service.
5. Express handler `getProjects` called `Project.find().lean()` on Mongoose → MongoDB returned the docs.
6. Express returned `Project[]` JSON; Next.js Data Cache stored it for 300s.
7. If the backend was down or returned non-2xx, step 4's `try/catch` returned `PROJECTS` from `lib/portfolio-data.ts` — page rendered identically because the constant mirrors the seed.

**Component Responsibilities:**

| File | Tier | Responsibility |
|------|------|----------------|
| `portfolio-services/src/types/content.ts` | Backend types | TS interfaces that **mirror `portfolio-web/lib/types.ts` exactly**. Currently has wrong shapes (`fullName`, `title`, `bio: string`, `SkillDto`) — rewrite verbatim in Phase 6. |
| `portfolio-services/src/models/Profile.ts` | Backend model | Mongoose schema; needs reshape from flat `{fullName, title, bio: string, location, email}` to nested `{name, shortName, initials, role, location, email, resumeUrl, bio: {short, long: [String]}, highlights: [{value, label}], socials: [{label, handle, url, kind}]}`. |
| `portfolio-services/src/models/Project.ts` | Backend model | **NEW.** Schema mirrors `Project` interface — `{name, year, status, summary, tech: [String], role, link}` |
| `portfolio-services/src/models/Stack.ts` | Backend model | **NEW (renamed from Skill.ts).** `{category, items: [String]}`. Skill.ts deleted in same commit. |
| `portfolio-services/src/models/Experience.ts` | Backend model | Reshape from `{startDate, endDate, highlights: [String]}` to `{company, role, period, summary}`. |
| `portfolio-services/src/models/App.ts` | Backend model | Reshape from `{name, description, stack: [String], url}` to `{name, platforms: [String], appStoreUrl?, googlePlayUrl?, role, year, summary?}`. |
| `portfolio-services/src/models/Post.ts` | Backend model | Reshape from `{title, slug, excerpt, publishedAt}` to `{title, date, readTime, excerpt, link, slug}`. |
| `portfolio-services/src/controllers/contentController.ts` | Backend controller | 7 handlers (was 6). Rename `getSkills` → `getStack`. Add `getProjects`. Reshape every `.json(...)` response to new DTO. Drop `placeholderSkills` etc. — `placeholders.ts` deleted as part of cleanup (D-13: real seed JSON files replace it). |
| `portfolio-services/src/routes/apiRoutes.ts` | Backend routing | 7 lines (was 6): swap `/skills` → `/stack`, add `/projects`. |
| `portfolio-services/src/seed/*.json` | Authoring | 6 JSON files (profile.json, projects.json, stack.json, experience.json, apps.json, posts.json) — single source for both Mongo seed and `lib/portfolio-data.ts` mirror. Replaces `src/seed/placeholders.ts`. |
| `portfolio-services/src/scripts/seed.ts` | Authoring | **NEW.** Reads JSON files, upserts via `findOneAndUpdate({filter}, doc, {upsert: true, new: true, setDefaultsOnInsert: true})`. Wired as `"seed"` script in package.json. |
| `portfolio-services/scripts/check-backend.mjs` | Smoke gate | **NEW.** Zero-dep mjs (mirrors `portfolio-web/scripts/check-*.mjs` style). Reads `$PROD_API_URL` env, curls 7 endpoints, asserts shape + grep-out forbidden strings. |
| `portfolio-services/docs/api-contract.md` | Contract doc | **NEW.** One section per endpoint. |
| `portfolio-web/lib/types.ts` | Frontend types | Single source of truth. Unchanged in shape (already correct from Phase 1); referenced by every backend type in paired commits. |
| `portfolio-web/lib/portfolio-data.ts` | Frontend fallback | Content populated from same JSON values; UPPERCASE constants. |
| `portfolio-web/lib/api.ts` | Frontend client | **No code change required** — `NEXT_PUBLIC_API_BASE_URL` already wired (line 18). |
| `portfolio-web/public/resume.pdf` | Static asset | Replaced with real `Bakytbek_Tatibekov_Resume.pdf`; current file is 50 bytes ASCII placeholder per `wc -c` + `file`. |

### Recommended Project Structure

```
portfolio-services/
├── docs/
│   └── api-contract.md           # NEW (BACKEND-03)
├── scripts/
│   └── check-backend.mjs         # NEW (D-11 readiness gate)
├── src/
│   ├── app.ts                    # unchanged
│   ├── server.ts                 # unchanged
│   ├── config/
│   │   ├── database.ts           # mostly unchanged; see "Mongo connection retry" below
│   │   └── env.ts                # add MONGO_URL fallback (Railway plugin var name)
│   ├── controllers/
│   │   └── contentController.ts  # rewritten: 7 handlers
│   ├── models/
│   │   ├── App.ts                # reshape
│   │   ├── Experience.ts         # reshape
│   │   ├── Post.ts               # reshape
│   │   ├── Profile.ts            # reshape (nested Bio + Social[] + Highlight[])
│   │   ├── Project.ts            # NEW (BACKEND-01)
│   │   └── Stack.ts              # NEW (renames Skill.ts in same commit per D-19)
│   ├── routes/
│   │   └── apiRoutes.ts          # 7 lines (was 6)
│   ├── scripts/
│   │   └── seed.ts               # NEW (npm run seed)
│   ├── seed/
│   │   ├── apps.json             # NEW
│   │   ├── experience.json       # NEW
│   │   ├── posts.json            # NEW (1 entry, per D-15)
│   │   ├── profile.json          # NEW
│   │   ├── projects.json         # NEW
│   │   └── stack.json            # NEW
│   │   # placeholders.ts DELETED in same commit
│   └── types/
│       └── content.ts            # rewritten verbatim from lib/types.ts
└── tests/
    └── app.test.ts               # extend with 7-endpoint shape assertions (replaces /skills test)
```

### Pattern 1: Paired-commit waves

**What:** Each backend shape change ships as a logical unit across both repos. One wave = one type end-to-end.

**When to use:** Every reshape in Phase 6. Six waves for Profile / Stack / Experience / App / Post / Project (the last is greenfield, simpler).

**Example wave sequence (Profile):**

```
Wave step                                Repo                Files touched
─────────────────────────────────────────────────────────────────────────────────
1. Update Mongoose schema                portfolio-services  src/models/Profile.ts
2. Update DTO type                       portfolio-services  src/types/content.ts (ProfileDto block)
3. Update controller response shape      portfolio-services  src/controllers/contentController.ts (getProfile)
4. Update Jest spec                      portfolio-services  tests/app.test.ts (new shape assertion)
5. Author seed JSON                      portfolio-services  src/seed/profile.json
6. Add contract section                  portfolio-services  docs/api-contract.md (## /api/profile)
                                          ─── COMMIT A in portfolio-services ───
7. Mirror seed content into FE constant  portfolio-web       lib/portfolio-data.ts (PROFILE)
8. (optional) tweak any consuming view   portfolio-web       app/components/views/about-view.tsx etc.
                                          ─── COMMIT B in portfolio-web, body cites Commit A SHA ───
9. Amend Commit A body to cite Commit B SHA (or follow-up commit linking back; D-19)
```

**Commit message convention (per CLAUDE.md / D-19):**

```
feat(profile): reshape ProfileDto + Profile model to match terminal data model

Pair: portfolio-web @ <sha-of-commit-B>
- Profile schema gains nested Bio + Highlight[] + Social[]
- Seed migration: src/seed/profile.json upserts on email
- API contract section added at docs/api-contract.md#api-profile
```

### Pattern 2: Mongoose subdocument design for nested shapes

[CITED: mongoosejs.com/docs/subdocs.html — "Subdocuments are documents embedded in other documents... Mongoose has two distinct notions of subdocuments: arrays of subdocuments and single nested subdocuments."]

The Profile shape needs three sub-structures: a single nested Bio object, an array of Highlight objects, an array of Social objects.

**Recommended schema (Profile.ts):**

```ts
// Source: mongoose 9.x docs (subdocs.html) + lib/types.ts canonical shape
import { Schema, model } from 'mongoose';

const bioSchema = new Schema(
  {
    short: { type: String, required: true },
    long:  { type: [String], required: true }
  },
  { _id: false }  // Pitfall 1 — don't add _id to embedded singletons
);

const highlightSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const socialSchema = new Schema(
  {
    label:  { type: String, required: true },
    handle: { type: String, required: true },
    url:    { type: String, required: true },
    kind:   {
      type: String,
      enum: ['github','linkedin','mastodon','bluesky','x','email','other'],
      required: true
    }
  },
  { _id: false }
);

const profileSchema = new Schema(
  {
    name:      { type: String, required: true },
    shortName: { type: String, required: true },
    initials:  { type: String, required: true },
    role:      { type: String, required: true },
    location:  { type: String, required: true },
    email:     { type: String, required: true },
    resumeUrl: { type: String, required: true },
    bio:        { type: bioSchema, required: true },
    highlights: { type: [highlightSchema], default: [] },
    socials:    { type: [socialSchema], default: [] }
  },
  {
    timestamps: true,
    strict: 'throw'  // Pitfall 2 — fail loud on stray keys instead of silently dropping
  }
);

export const Profile = model('Profile', profileSchema);
```

[CITED: mongoosejs.com/docs/subdocs.html — "Each subdocument has an _id by default... can be disabled by setting the _id option to false in sub-document definition."] Subdoc `_id` is noise on view payloads — disable for embedded singletons + array subdocs that aren't independently referenced. Saves bytes and avoids leaking ObjectIds into the public API.

**Reading them back with `.lean()`** strips Mongoose internals (good for API responses). Current controller already uses `.lean()` — keep it.

### Pattern 3: Seed script — idempotent upserts

[CITED: mongoosejs.com/docs/tutorials/findoneandupdate.html — "An upsert behaves like a normal findOneAndUpdate() if it finds a document that matches the filter. But, if no document matches the filter, MongoDB will insert one by combining filter and update."]

```ts
// src/scripts/seed.ts — invoked via `npm run seed`
// Source: mongoose docs (findoneandupdate.html) + project pattern
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectToDatabase } from '../config/database';
import { Profile } from '../models/Profile';
import { Project } from '../models/Project';
import { Stack } from '../models/Stack';
import { Experience } from '../models/Experience';
import { App } from '../models/App';
import { Post } from '../models/Post';
import mongoose from 'mongoose';

const SEED_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'seed');

async function load<T = unknown>(name: string): Promise<T> {
  const raw = await readFile(join(SEED_DIR, name), 'utf8');
  return JSON.parse(raw) as T;
}

async function seed(): Promise<void> {
  await connectToDatabase();
  console.log('seed: connected to', mongoose.connection.host);

  // Single-doc collection — upsert by email (stable identity)
  const profile = await load<{ email: string }>('profile.json');
  await Profile.findOneAndUpdate(
    { email: profile.email },
    profile,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('seed: profile upserted');

  // Array collections — upsert by stable key
  const projects = await load<Array<{ name: string }>>('projects.json');
  for (const p of projects) {
    await Project.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`seed: ${projects.length} projects upserted`);

  // ... repeat for stack (category), experience (company+period), apps (name), posts (slug)

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('seed failed:', err);
  process.exit(1);
});
```

**Add to `portfolio-services/package.json`:**
```json
"scripts": {
  "seed": "ts-node-dev --transpile-only src/scripts/seed.ts"
}
```

(`ts-node-dev --transpile-only` reuses the existing dev runtime; no new deps needed. `tsx` is a cleaner modern alternative but not required.)

**Idempotency contract:** Run `npm run seed` 1, 2, or 10 times in a row — final DB state is identical. Each upsert is keyed by a domain-unique field (email for profile; name for projects/apps/stack-category; slug for posts; company+period composite for experience — see Pitfall 3).

### Pattern 4: Smoke script (`check-backend.mjs`)

Zero-dep mjs, matching the `portfolio-web/scripts/check-*.mjs` idiom:

```js
#!/usr/bin/env node
// scripts/check-backend.mjs — D-11 readiness gate.
// Hit 7 endpoints against $PROD_API_URL; assert HTTP 200 + JSON shape + no placeholders.
// Exit 0 on full pass, 1 on any miss.

const BASE = process.env.PROD_API_URL ?? 'http://localhost:8080';
const FORBIDDEN = /lorem|example\.com|placeholder|Product Studio/i;

const ENDPOINTS = [
  { path: '/api/health',     shape: (b) => b && typeof b.status === 'string' },
  { path: '/api/profile',    shape: (b) => b && typeof b.name === 'string'
                                          && b.bio && typeof b.bio.short === 'string'
                                          && Array.isArray(b.socials) },
  { path: '/api/projects',   shape: (b) => Array.isArray(b)
                                          && (b.length === 0 || (typeof b[0].name === 'string' && Array.isArray(b[0].tech))) },
  { path: '/api/stack',      shape: (b) => Array.isArray(b)
                                          && (b.length === 0 || (typeof b[0].category === 'string' && Array.isArray(b[0].items))) },
  { path: '/api/experience', shape: (b) => Array.isArray(b)
                                          && (b.length === 0 || typeof b[0].company === 'string') },
  { path: '/api/apps',       shape: (b) => Array.isArray(b)
                                          && (b.length === 0 || (typeof b[0].name === 'string' && Array.isArray(b[0].platforms))) },
  { path: '/api/posts',      shape: (b) => Array.isArray(b)
                                          && (b.length === 0 || typeof b[0].title === 'string') }
];

const fails = [];
for (const e of ENDPOINTS) {
  try {
    const res  = await fetch(`${BASE}${e.path}`);
    const txt  = await res.text();
    if (res.status !== 200) { fails.push(`${e.path}: HTTP ${res.status}`); continue; }
    if (!res.headers.get('content-type')?.includes('application/json'))
      { fails.push(`${e.path}: content-type ${res.headers.get('content-type')}`); continue; }
    const json = JSON.parse(txt);
    if (!e.shape(json)) { fails.push(`${e.path}: shape check failed`); continue; }
    if (FORBIDDEN.test(txt)) { fails.push(`${e.path}: forbidden string match`); continue; }
    console.log(`✓ ${e.path}`);
  } catch (err) {
    fails.push(`${e.path}: ${err.message}`);
  }
}

if (fails.length > 0) {
  console.error(`\n✗ check-backend: ${fails.length} failure(s):`);
  for (const f of fails) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`\n✓ check-backend: all ${ENDPOINTS.length} endpoints green`);
```

**Add to `portfolio-services/package.json`:**
```json
"scripts": {
  "smoke": "node scripts/check-backend.mjs"
}
```

**Usage:**
```bash
PROD_API_URL=https://<railway>.up.railway.app npm run smoke
# Exit 0 → safe to flip NEXT_PUBLIC_API_BASE_URL in Vercel.
```

### Pattern 5: Express on Railway — deploy, env vars, build/run

[CITED: docs.railway.com/guides/express] Railway auto-detects Node from `package.json`. Default behavior:
- **Build:** `npm install` then `npm run build` if a `build` script exists.
- **Run:** `npm start`.

Current `package.json` already has `"build": "tsc -p tsconfig.json"` and `"start": "node dist/src/server.js"` — zero-config compatible. **Tested locally during planning, not on Railway.**

**Env vars to set in Railway dashboard for the Express service:**

| Var | Source | Notes |
|-----|--------|-------|
| `PORT` | Auto-injected by Railway | `src/config/env.ts` already reads `process.env.PORT ?? 4000`. No change needed. |
| `MONGO_URI` | Reference variable from Mongo plugin | [CITED: docs.railway.com/guides/mongodb] Railway exposes the connection string as `MONGO_URL` from the plugin. In the Express service, set `MONGO_URI` = `${{Mongo.MONGO_URL}}` via reference variable (Railway syntax). Alternatively rename `env.ts` to read `MONGO_URL` directly — match whichever name the Railway plugin produces. |
| `NODE_ENV` | Set to `production` manually | Mongoose adjusts certain warnings under production. |

**Build/run summary:**
- Local dev: `npm run dev` (ts-node-dev hot reload) — unchanged.
- Production: `npm run build` → emits `dist/`; `npm start` runs `node dist/src/server.js` — unchanged. Railway runs both for you.

**Cold start:** Hobby/free tier sleeps when idle (D-09 explicitly opts into paid to avoid this). On the paid Developer/Pro tier, services stay warm — RSC fetches with `revalidate: 300` won't pay a cold-start tax on every revalidation.

### Pattern 6: Next.js 15 NEXT_PUBLIC env var injection on Vercel

[CITED: nextjs.org/docs/pages/guides/environment-variables] — "Next.js inlines `NEXT_PUBLIC_*` values at build time. After being built, your app will no longer respond to changes to these environment variables."

**Implication for Phase 6:** When `NEXT_PUBLIC_API_BASE_URL` is set in Vercel and a deploy fires, the value is baked into the JS bundle and into RSC build output. Changing the env var without a redeploy does nothing.

[CITED: nextjs.org docs] — "NEXT_PUBLIC_ variables are available to all server components, server actions and route handlers." → RSC fetches in `lib/api.ts` running on Vercel's Node runtime see the value at request time only because Vercel injects it into the running server env; for client bundles it's inlined at build.

**For Phase 6, `lib/api.ts` is consumed by RSCs (server-side), so the var reads at request time on the Vercel server, which means changes to the var **do** take effect on the next ISR revalidation — BUT only if the Vercel project is redeployed first. Without a redeploy, the value stays whatever was inlined at last build.**

**Practical workflow:**
1. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel project → Settings → Environment Variables → Production (and Preview if you want preview deploys to also hit prod backend). Use the Railway production URL (e.g. `https://portfolio-services-production.up.railway.app`).
2. Trigger a Vercel redeploy (push to main, or "Redeploy" in dashboard).
3. New build picks up the var; all subsequent requests + ISR revalidations use the new value.

**Preview vs Production scope:** Vercel lets you set different values per environment. For Phase 6, set the same Railway URL for both Production and Preview unless a staging backend exists (none planned).

**`.env.local` for local dev:** Continue pointing at `http://localhost:8080` (or omit — `lib/api.ts:18` defaults to localhost).

### Anti-Patterns to Avoid

- **Adding zod to lib/api.ts in Phase 6:** D-03 explicit defer. TypeScript catches one half; tests catch the other half. Don't introduce a third validation layer.
- **Renaming Mongoose collections in production:** Mongoose derives collection names from the model name (`Skill` → `skills`). Renaming model `Skill` → `Stack` creates a `stacks` collection. The old `skills` collection still exists in Mongo until manually dropped. **Drop `skills` explicitly during seed-script run-first time** (`mongoose.connection.collection('skills').drop().catch(() => {})`) or accept a stale collection. Recommend: drop explicitly.
- **Hardcoding the Railway URL into source:** Always read from `NEXT_PUBLIC_API_BASE_URL`. The URL changes if Railway is reconfigured; baking it into source means an emergency requires a code commit + redeploy.
- **Skipping the smoke gate to save time:** D-11 is the only thing that catches "backend deployed but returns the wrong shape." Without it, the cutover risk is silent → front-end falls back forever → user sees seed data thinking they see live data.
- **Letting `lib/portfolio-data.ts` drift from seed JSON:** D-14 makes the mirror manual. Document the convention in `lib/portfolio-data.ts` header comment + add it to PR review checklist. (Codegen path is deferred — don't preemptively wire it.)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MongoDB connection retry/reconnect | Custom retry loop | Mongoose built-in reconnect | Mongoose 9 has `autoReconnect`-by-default behavior at the driver level; surface errors via `mongoose.connection.on('error', cb)` if you want logging. Current `config/database.ts` is fine as-is for v1. |
| JSON shape validation in views | View-level guards | TypeScript at compile time + smoke gate at deploy time | Both layers exist; per D-03, runtime validation is deferred. |
| PDF Title/Author injection (when exiftool available) | A pure-JS PDF parser | `exiftool -Title=... -Author=...` (one command) | exiftool is the de-facto standard; install via brew on macOS. |
| PDF Title/Author injection (no exiftool, Node-only fallback) | Hand-edit PDF bytes | `pdf-lib` (`PDFDocument.load(bytes).setTitle(...).setAuthor(...)`) | [CITED: github.com/Hopding/pdf-lib/issues/55] Pure JS; one-shot script in `scripts/`. Don't add as a prod dep. |
| Reading env vars on Railway | Custom env loader | Process.env + Railway reference variables | [CITED: docs.railway.com/guides/mongodb] Reference variable syntax `${{ServiceName.VAR_NAME}}` injects cross-service values; no custom loader needed. |
| Sitemap of API endpoints | OpenAPI spec | Hand-written `docs/api-contract.md` | D-08 explicit; OpenAPI deferred per ARCHITECTURE.md. |
| CORS handling | Express cors middleware | Nothing — RSC fetches are server-side | D-04: RSC fetches don't trigger CORS preflight. If the API is ever called from a browser (admin UI in Phase 7?), add `cors` at that time. |

**Key insight:** The two-prod-dep frontend budget (`next-themes` + `cmdk`) is already consumed. Phase 6 must add **zero new prod deps to portfolio-web**. Backend can add minor tooling (`tsx` for the seed script) but doesn't need to.

## Runtime State Inventory

This is a rename + reshape phase. The following runtime state needs explicit handling beyond grep:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | MongoDB collections: `skills` (orphaned by Skill → Stack rename), old-shape `profiles` / `experiences` / `apps` / `posts` documents written by current placeholder controllers if anyone ever ran the placeholder controller against a live DB | **Data migration:** during seed.ts execution, explicitly `db.collection('skills').drop()` first run; the new `findOneAndUpdate` upserts replace old-shape docs by stable key (email/name/slug). Document this in the seed.ts header. For a brand-new Railway Mongo instance, the issue doesn't arise — the recommended sequence is provision fresh DB → `npm run seed`. |
| Live service config | None — no n8n, no Datadog, no Cloudflare Tunnel, no Tailscale ACLs in this project | None — verified by checking `.env.example` (2 vars), package.json deps, and project skills directory (empty). |
| OS-registered state | None — no Task Scheduler / launchd / systemd / pm2 entries | None — verified by checking `.planning/codebase/INTEGRATIONS.md` ("No CI Pipeline" + "no auth, no monitoring"). |
| Secrets / env vars | `NEXT_PUBLIC_API_BASE_URL` (Vercel, currently default to localhost in absence of value), `MONGO_URI` (Railway, new), `PORT` (Railway, auto), `NEXT_PUBLIC_SITE_URL` (unchanged) | **Code edit + ops:** `NEXT_PUBLIC_API_BASE_URL` must be set in Vercel Production scope to the Railway URL. `MONGO_URI` set in Railway Express service via Mongo plugin reference variable. No code change to lib/api.ts. |
| Build artifacts / installed packages | `portfolio-services/dist/` (current build output of pre-reshape code) | **Action:** `rm -rf dist && npm run build` after every reshape commit. Railway rebuilds on every push, so production is unaffected; local-dev hygiene only. |

**Nothing found** in `Live service config` and `OS-registered state` — verified above.

## Common Pitfalls

### Pitfall 1: Mongoose subdocument `_id` leakage

**What goes wrong:** By default Mongoose adds an `_id: ObjectId` to every subdocument. The Profile response over `/api/profile` ends up containing `bio._id`, `highlights[*]._id`, `socials[*]._id` — values that have no domain meaning and bloat the payload.

**Why it happens:** Mongoose defaults — [CITED: mongoosejs.com/docs/subdocs.html] — "Each subdocument has an _id by default."

**How to avoid:** Pass `{ _id: false }` as the second arg to every embedded Schema constructor (see Code Examples). The top-level Profile/Project/etc. schemas keep their _id (they're real documents); only embedded sub-schemas opt out.

**Warning signs:** Smoke script (`check-backend.mjs`) returns a body with `_id` inside `bio` or `socials[*]`. Add a negative assertion if paranoid.

### Pitfall 2: Mongoose silent key drop without `strict: 'throw'`

**What goes wrong:** Schema says `{name, year, ...}` but the JSON seed has a typo `{naem, year, ...}`. Mongoose silently drops `naem` and inserts `{year}` only. The DB ends up with broken data; no error.

**Why it happens:** Mongoose `strict: true` (the default) silently strips unknown fields.

**How to avoid:** Set `strict: 'throw'` on every top-level schema. Seeds with typos crash loud at upsert time instead of corrupting silently.

**Warning signs:** Jest spec asserts a field is present but it's missing. Always test "shape includes key X" not just "shape is object."

### Pitfall 3: Non-unique upsert keys creating duplicates

**What goes wrong:** Experience upserts by `company` alone. User worked at the same company twice (different roles). Second seed run creates duplicate; third overwrites first.

**Why it happens:** No unique constraint; upsert filter doesn't capture identity.

**How to avoid:** Use composite keys for non-trivially-unique collections. Experience → upsert on `{company, period}`. Apps → upsert on `name` (real apps don't collide). Profile → upsert on `email` (single doc anyway).

**Warning signs:** `Profile.find().count()` returns 2 instead of 1 after second seed. Add this as an assertion in the seed script's tail: log final count of each collection.

### Pitfall 4: Stale Mongoose model when collection structure changed

**What goes wrong:** Phase 5 had `Skill` model. Phase 6 introduces `Stack` model + drops `Skill`. The collection `skills` lingers in Mongo, queries against the wrong collection return nothing, devs assume bug.

**Why it happens:** Renaming a Mongoose model doesn't drop the underlying collection.

**How to avoid:** In `src/scripts/seed.ts`, before upserting Stack, drop the orphaned `skills` collection on first run: `await mongoose.connection.collection('skills').drop().catch((e) => { if (e.code !== 26) throw e; });` (code 26 = NamespaceNotFound, which is fine).

**Warning signs:** `db.skills.count()` > 0 on the production DB after seed. Add to smoke script as `/api/stack` shape check (no `skills`-keyed payload structure ever).

### Pitfall 5: App Store / Play Store URL formats that don't survive sharing

**What goes wrong:** A `https://apps.apple.com/us/app/myapp/id123456` URL works on iOS Safari but breaks on Android (404). A `market://details?id=...` works on Android but is unintelligible elsewhere.

**Why it happens:** Store deep links have OS conventions; "tap from mobile" varies.

**How to avoid:** Use HTTPS canonical URLs (`https://apps.apple.com/...` for App Store, `https://play.google.com/store/apps/details?id=...` for Play Store). These open the right app on each OS via universal/app links and gracefully fall back to web on desktop.

**Warning signs:** `curl -sIL https://apps.apple.com/.../id123456 | grep -E '^HTTP|^location'` should report 200 (or 301→200). Run as a manual gate in the content-population task.

### Pitfall 6: PDF Title/Author absent but `pdfinfo` reports them as empty strings

**What goes wrong:** D-18's gate "shows non-empty `Title` and `Author`" passes a PDF that has `Title: ` (empty string) because the field exists but is blank. The recruiter's "Saved As..." dialog still defaults to `resume.pdf` filename.

**Why it happens:** A `Title` key with empty value is structurally present.

**How to avoid:** Smoke check should grep for `Title:\s+\w` not just `Title:`. If using exiftool: `exiftool -Title -Author public/resume.pdf | grep -E ':\s+\S+' | wc -l` should equal 2.

**Warning signs:** Save-as filename in Chrome doesn't change after metadata "fix."

### Pitfall 7: NEXT_PUBLIC_API_BASE_URL env-flip without Vercel redeploy

**What goes wrong:** User changes the env var in Vercel dashboard; expects RSC fetches to switch backends; nothing changes; user assumes Railway is broken.

**Why it happens:** [CITED: nextjs.org/docs/pages/guides/environment-variables] NEXT_PUBLIC_ vars are inlined at build time into client bundles; server bundles see them at runtime BUT only after the next deploy rebuilds the env snapshot.

**How to avoid:** Always trigger a Vercel redeploy after changing the env var. Document this in the runbook (or DEPLOY-01 acceptance steps).

**Warning signs:** Smoke script (`check-backend.mjs`) passes against Railway URL; viewing the site still shows fallback data.

### Pitfall 8: Mongoose connection state race in serverless / cold-start contexts

**What goes wrong:** On Railway hobby/free tier (cold start), the first request after sleep can fire while `mongoose.connect()` is still pending. Current controllers guard with `if (mongoose.connection.readyState !== 1)` then return placeholders — but Phase 6 D-13 removes the placeholders, so the guard now returns the *typed default* (empty array or, for `getProfile`, the seed-mirror — which D-13 doesn't provide because seeds live in JSON files, not in the controller). The controller would return `undefined`.

**Why it happens:** Existing controller pattern has placeholders as a fallback for `readyState !== 1`. Removing placeholders (per D-13) without replacing the branch leaves a hole.

**How to avoid:** Two options for the controller's "DB not ready" branch:
- (a) Return HTTP 503 with a JSON body (`{ error: 'service warming' }`). Frontend `lib/api.ts:30` already converts non-2xx to fallback — works seamlessly. **Recommended.**
- (b) Block on connection: `await mongoose.connection.asPromise()`. Adds a small first-request delay but no 503s.

**Phase 6 chose D-09 paid tier** (no idle spin-down), so this is a low-probability edge case — but the controller still needs *some* branch. Recommend option (a) for safety.

**Warning signs:** Cold-start first request returns 200 but with body `undefined` or `{}`. The smoke script's shape check would catch this if run during cold start.

### Pitfall 9: Resume PDF served from `public/` doesn't respect `Content-Disposition` filename hint

**What goes wrong:** D-18 wants the saved-as filename to be `Bakytbek_Tatibekov_Resume.pdf`. Just placing the file at `public/resume.pdf` makes the served URL `/resume.pdf` and the browser default filename `resume.pdf`.

**Why it happens:** Without a `Content-Disposition: attachment; filename="..."` header, the filename comes from the URL path. Next.js serves `public/` as static — no per-file header customization without a route handler.

**How to avoid:** Either (a) name the file in the URL: `public/Bakytbek_Tatibekov_Resume.pdf` and update `PROFILE.resumeUrl` → `"/Bakytbek_Tatibekov_Resume.pdf"`. Or (b) add a `next.config.ts` `headers()` entry for `/resume.pdf` returning `Content-Disposition: attachment; filename="Bakytbek_Tatibekov_Resume.pdf"`. **Option (a) is simpler and matches D-18's filename literal.**

**Warning signs:** `curl -sI https://bakytbek.dev/resume.pdf | grep -i content-disposition` returns empty; browser's "Save As" dialog defaults to `resume.pdf`.

### Pitfall 10: AboutSocials/JSON-LD breaking on 2-social profile

**What goes wrong:** D-16 freezes socials at 2 (GitHub + LinkedIn). Phase 5 Plan 05-04's `AboutSocials` and Plan 05-05's `JsonLdPerson` were written against `PROFILE.socials.length === 2` already, so no breakage — but if any code path iterated with a hardcoded index of 2 it would break.

**Why it happens:** Off-by-one bugs in array indexing.

**How to avoid:** Grep for `socials\[2\]` or `socials\[\d\]` literals before merging. `grep -rn "socials\[" app lib` should show only `.map()` or `.filter()` usage — no hardcoded indices.

**Warning signs:** Test fails on Phase 6 content pass even though shape didn't change.

## Code Examples

Verified patterns from official sources + project conventions.

### Mongoose Project schema (BACKEND-01, NEW model)

```ts
// portfolio-services/src/models/Project.ts
// Source: lib/types.ts Project interface + mongoose docs
import { Schema, model } from 'mongoose';

const projectSchema = new Schema(
  {
    name:    { type: String, required: true, unique: true },
    year:    { type: String, required: true },
    status:  { type: String, required: true },
    summary: { type: String, required: true },
    tech:    { type: [String], required: true, default: [] },
    role:    { type: String, required: true },
    link:    { type: String, required: true }
  },
  { timestamps: true, strict: 'throw' }
);

export const Project = model('Project', projectSchema);
```

### Mongoose Stack schema (BACKEND-02, renamed from Skill)

```ts
// portfolio-services/src/models/Stack.ts
// Source: lib/types.ts StackCategory interface
import { Schema, model } from 'mongoose';

const stackSchema = new Schema(
  {
    category: { type: String, required: true, unique: true },
    items:    { type: [String], required: true, default: [] }
  },
  { timestamps: true, strict: 'throw' }
);

export const Stack = model('Stack', stackSchema);
// Note: collection auto-named "stacks". Skill.ts deleted in same commit.
```

### Mongoose ShippedApp schema (BACKEND-02, reshape App.ts)

```ts
// portfolio-services/src/models/App.ts
// Source: lib/types.ts ShippedApp interface
import { Schema, model } from 'mongoose';

const appSchema = new Schema(
  {
    name:         { type: String, required: true, unique: true },
    platforms:    {
      type: [String],
      enum: ['ios','android'],
      required: true,
      validate: { validator: (v: string[]) => v.length > 0, message: 'platforms must be non-empty' }
    },
    appStoreUrl:  { type: String },
    googlePlayUrl:{ type: String },
    role:         { type: String, required: true },
    year:         { type: String, required: true },
    summary:      { type: String }
  },
  { timestamps: true, strict: 'throw' }
);

export const App = model('App', appSchema);
```

### apiRoutes.ts (7 endpoints)

```ts
// portfolio-services/src/routes/apiRoutes.ts
import { Router } from 'express';
import {
  getApps, getExperience, getHealth, getPosts,
  getProfile, getProjects, getStack
} from '../controllers/contentController';

const apiRoutes = Router();

apiRoutes.get('/health', getHealth);
apiRoutes.get('/profile', getProfile);
apiRoutes.get('/projects', getProjects);   // NEW
apiRoutes.get('/stack', getStack);          // RENAMED from /skills
apiRoutes.get('/experience', getExperience);
apiRoutes.get('/apps', getApps);
apiRoutes.get('/posts', getPosts);

export default apiRoutes;
```

### Controller handler (`getProjects` example)

```ts
// portfolio-services/src/controllers/contentController.ts (excerpt)
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';

export const getProjects = async (_req: Request, res: Response): Promise<void> => {
  // Pitfall 8: handle DB-not-ready cleanly. 503 + JSON body — frontend lib/api.ts
  // converts non-2xx to silent fallback (DATA-04 / D-02).
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: 'service warming' });
    return;
  }
  try {
    const docs = await Project.find().sort({ year: -1 }).lean();
    // Strip Mongoose-injected fields (_id, __v) for clean public API.
    const clean = docs.map(({ _id, __v, createdAt, updatedAt, ...rest }) => rest);
    res.status(200).json(clean);
  } catch {
    res.status(503).json({ error: 'fetch failed' });
  }
};
```

### Seed JSON file (`profile.json`)

```json
// portfolio-services/src/seed/profile.json
// Mirrors lib/portfolio-data.ts PROFILE shape exactly (D-14 hand-mirror)
{
  "name": "Bakytbek Tatibekov",
  "shortName": "Bakytbek",
  "initials": "BT",
  "role": "Sr. Software Engineer",
  "location": "Remote — open globally",
  "email": "beckprograms@gmail.com",
  "resumeUrl": "/Bakytbek_Tatibekov_Resume.pdf",
  "bio": {
    "short": "Senior software engineer focused on developer tools, infrastructure, and TypeScript-first web apps.",
    "long": [
      "<final paragraph 1 — Claude's discretion per D-15>",
      "<final paragraph 2 — Claude's discretion per D-15>"
    ]
  },
  "highlights": [
    { "value": "12+", "label": "years engineering" },
    { "value": "<reconciled count from D-17>", "label": "apps shipped" },
    { "value": "OSS", "label": "open-source contributor" }
  ],
  "socials": [
    { "label": "GitHub", "handle": "@beckinfonet", "url": "https://github.com/beckinfonet", "kind": "github" },
    { "label": "LinkedIn", "handle": "in/bakytbek", "url": "https://linkedin.com/in/bakytbek", "kind": "linkedin" }
  ]
}
```

### api-contract.md skeleton (BACKEND-03)

```markdown
# Portfolio Services — API Contract

**Single consumer:** portfolio-web (Next.js 15 RSC fetches via lib/api.ts)
**Mirror:** portfolio-web/lib/types.ts is the canonical type source. Update both sides in paired commits.

## GET /api/health

**Response 200:**
\```ts
{ status: "ok" }
\```

## GET /api/profile

**Response 200 — type from lib/types.ts Profile:**
\```ts
interface Profile {
  name: string;
  shortName: string;
  initials: string;
  role: string;
  location: string;
  email: string;
  resumeUrl: string;
  bio: { short: string; long: string[] };
  highlights: Array<{ value: string; label: string }>;
  socials: Array<{ label: string; handle: string; url: string; kind: "github" | "linkedin" | "mastodon" | "bluesky" | "x" | "email" | "other" }>;
}
\```

**Frontend cache:** `next: { revalidate: 300 }` (5-min ISR).

**Example payload:** see portfolio-services/src/seed/profile.json

## GET /api/projects … etc (7 sections total)
```

### Frontend `lib/portfolio-data.ts` mirror (after reshape)

```ts
// Excerpt — content populated to match src/seed/profile.json verbatim
export const PROFILE: Profile = {
  name: "Bakytbek Tatibekov",
  shortName: "Bakytbek",
  initials: "BT",
  role: "Sr. Software Engineer",
  location: "Remote — open globally",
  email: "beckprograms@gmail.com",
  resumeUrl: "/Bakytbek_Tatibekov_Resume.pdf",  // Pitfall 9 — renamed file
  bio: {
    short: "Senior software engineer focused on developer tools, infrastructure, and TypeScript-first web apps.",
    long: [
      "<final paragraph 1>",
      "<final paragraph 2>"
    ]
  },
  highlights: [
    { value: "12+", label: "years engineering" },
    { value: "2", label: "apps shipped" },  // Reconciled per D-17 (assuming 2 apps)
    { value: "OSS", label: "open-source contributor" }
  ],
  socials: [
    { label: "GitHub", handle: "@beckinfonet", url: "https://github.com/beckinfonet", kind: "github" },
    { label: "LinkedIn", handle: "in/bakytbek", url: "https://linkedin.com/in/bakytbek", kind: "linkedin" }
  ]
};
```

### exiftool one-liner (D-18) and pdf-lib fallback

```bash
# If exiftool installed (brew install exiftool):
exiftool -Title="Bakytbek Tatibekov — Resume" \
         -Author="Bakytbek Tatibekov" \
         -overwrite_original \
         public/Bakytbek_Tatibekov_Resume.pdf

# Verify:
exiftool public/Bakytbek_Tatibekov_Resume.pdf | grep -E 'Title|Author'
wc -c public/Bakytbek_Tatibekov_Resume.pdf   # must be < 256000

# If exiftool NOT installed (Node-only fallback, one-shot script):
# scripts/set-pdf-metadata.mjs (run once, then delete or leave):
node --experimental-modules - <<'EOF'
import { readFile, writeFile } from 'node:fs/promises';
// Requires `npm i -D pdf-lib` temporarily, or `npx`:
const { PDFDocument } = await import('pdf-lib');
const bytes = await readFile('public/Bakytbek_Tatibekov_Resume.pdf');
const pdf = await PDFDocument.load(bytes);
pdf.setTitle('Bakytbek Tatibekov — Resume');
pdf.setAuthor('Bakytbek Tatibekov');
const out = await pdf.save();
await writeFile('public/Bakytbek_Tatibekov_Resume.pdf', out);
console.log('done');
EOF
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `mongoose.connect` with custom retry loop | Built-in driver retry + connection events | Mongoose 6+ | Existing `config/database.ts` already uses the modern pattern — no change needed |
| Mongoose subdocuments via `Schema.Types.Mixed` | Typed sub-schemas with `_id: false` opt-out | Mongoose 5+ stable | Use typed sub-schemas; Mixed is escape hatch for genuinely-untyped blobs |
| OpenAPI codegen | Hand-mirrored TS interfaces | ARCHITECTURE.md decision for this project | Single source of truth lives in `lib/types.ts`; contract doc is markdown |
| ExifTool / Ghostscript for PDF metadata | `pdf-lib` (npm) for Node-only contexts | 2020+ | Both viable; project preference (D-18) is exiftool; pdf-lib is fallback |
| Vercel-only env vars (build-time) | Hybrid build/runtime via Vercel | Next.js 13+ App Router | `NEXT_PUBLIC_` is build-time-only; non-public vars on server are runtime — but for this project D-04 chose `NEXT_PUBLIC_` for simplicity |

**Deprecated / outdated:**
- Storing seed data as TS constants in `src/seed/placeholders.ts` — replaced by JSON files + idempotent seed script per D-13.
- The `SkillDto` type and `Skill` model — deleted in same commit as the Stack replacement per D-19.
- Express 4.x patterns (e.g. `app.use(bodyParser.json())`) — Express 5 has `express.json()` built-in (current code already uses this).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Both repos | ✓ | v20.19.1 | — (frontend pins 22.x in `engines`; backend works on 20+) |
| npm | Both repos | ✓ | 10.8.2 | — |
| curl | `scripts/check-backend.mjs`, manual store URL checks | ✓ | 8.7.1 | Use `node` built-in `fetch` (already done in the mjs script) |
| MongoDB local | `npm run seed` against local Mongo | ✗ | — | Run seed only against Railway Mongo (acceptable for v1 since seed is one-shot per content edit). Or `brew install mongodb-community` for local dev. |
| `mongosh` CLI | Manual DB inspection | ✗ | — | Use Railway's data view in dashboard, or the mongo URL via any Mongo GUI (Compass) |
| `pdfinfo` (poppler) | D-18 metadata verification | ✗ | — | `pdf-lib` Node script (read-back via `pdf.getTitle()` / `pdf.getAuthor()`) |
| `qpdf` | D-18 minification | ✗ | — | `pdf-lib` re-save (often shrinks; sometimes grows — measure with `wc -c`) |
| `gs` (Ghostscript) | D-18 minification | ✗ | — | Same as qpdf |
| `exiftool` | D-18 metadata write | ✗ | — | `pdf-lib` one-shot script (Code Examples above) |

**Missing dependencies with no fallback:** None — every missing item has a workable alternative (Node-only pdf-lib for PDF tooling; Railway Mongo replaces local Mongo for seed runs).

**Missing dependencies with fallback:**
- `pdfinfo` / `qpdf` / `gs` / `exiftool` — all PDF tools missing. Fallback: install via `brew install exiftool poppler qpdf ghostscript` (one command), OR use the Node-only `pdf-lib` path. **Recommendation:** install exiftool (`brew install exiftool`) — it's the one-shot tool D-18 names; the rest can be skipped. If the source PDF already has Title/Author and is < 250KB, no install needed; just verify with `head -c 200 public/...pdf | strings` or open in any PDF viewer.

## Validation Architecture

> Including this section per `nyquist_validation: true` in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework (frontend) | Vitest 3.1.4 + jsdom 26.1.0 |
| Framework (backend) | Jest 30.x + ts-jest 29.x + supertest 7.x |
| Config files | `portfolio-web/vitest.config.ts`, `portfolio-services/jest.config.ts` |
| Quick run (frontend) | `npm test` (Vitest run) in `portfolio-web/` |
| Quick run (backend) | `npm test` in `portfolio-services/` (`jest --runInBand --watchman=false`) |
| Full suite (frontend) | `npm run lint && npm run typecheck && npm run test && npm run build` |
| Full suite (backend) | `npm test && npm run build` |
| Smoke gate | `node scripts/check-backend.mjs` (NEW; lives in `portfolio-services/scripts/`) |
| Cross-cutting placeholder grep | `portfolio-web/scripts/check-placeholders.mjs` (already wired as postbuild) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BACKEND-01 | `/api/projects` returns `Project[]` with correct shape | integration (supertest) | `cd portfolio-services && npm test -- --testNamePattern="GET /api/projects"` | ❌ Wave 0 — extend `tests/app.test.ts` |
| BACKEND-02 | All 6 existing endpoints return new shape | integration (supertest) | `cd portfolio-services && npm test` | ❌ Wave 0 — extend `tests/app.test.ts` with one assertion per endpoint |
| BACKEND-03 | Contract doc exists + has 7 sections | smoke (grep) | `grep -c '^## /api/' portfolio-services/docs/api-contract.md` should equal 7 | ❌ Wave 0 — script optional; manual is fine |
| BACKEND-04 | Backend live before frontend cuts over | smoke (mjs) | `PROD_API_URL=https://... npm run smoke` in portfolio-services | ❌ Wave 0 — create `scripts/check-backend.mjs` |
| CONTENT-01 | `lib/portfolio-data.ts` PROFILE matches `lib/types.ts` shape | unit (TypeScript) | `cd portfolio-web && npm run typecheck` | ✅ existing |
| CONTENT-01 | AboutView renders bio paragraphs from PROFILE | unit (vitest) | `cd portfolio-web && npm test -- about-view` | ✅ existing (134 tests green) |
| CONTENT-02 | PROJECTS array has ≥3 entries | unit (vitest) — new assertion | `expect(PROJECTS.length).toBeGreaterThanOrEqual(3)` | ❌ Wave 0 — add to a new `portfolio-data.test.ts` or extend existing |
| CONTENT-03 | SHIPPED entries have valid http(s) store URLs | unit (vitest) — new assertion + manual curl gate | `expect(SHIPPED.every(s => /^https?:/.test(s.appStoreUrl ?? s.googlePlayUrl ?? '')))` + manual `curl -sIL` | ❌ Wave 0 — add lib-level test |
| CONTENT-04 | WRITING.length ≥ 1 | unit (vitest) — new assertion | `expect(WRITING.length).toBeGreaterThanOrEqual(1)` | ❌ Wave 0 |
| CONTENT-05 | Resume PDF exists, < 250KB, has Title + Author | smoke (mjs) | new `scripts/check-resume-pdf.mjs` reads `wc -c`, parses metadata via `pdf-lib` | ❌ Wave 0 — create script |
| CONTENT-06 | STACK has ≥1 category | unit (vitest) | `expect(STACK.length).toBeGreaterThan(0)` | ❌ Wave 0 |
| CONTENT-07 | EXPERIENCE has ≥1 entry | unit (vitest) | `expect(EXPERIENCE.length).toBeGreaterThan(0)` | ❌ Wave 0 |
| CONTENT-08 | No forbidden strings in `.next/server/` | smoke (postbuild) | `npm run build` (chains to `scripts/check-placeholders.mjs` postbuild) | ✅ existing |

### Sampling Rate

- **Per task commit:** Frontend — `npm test` (~10s for 134 tests, jsdom). Backend — `npm test` (~5s for 2 tests today, will grow).
- **Per wave merge:** Full suite: `npm run lint && npm run typecheck && npm run test && npm run build` (both repos). Plus `npm run check:mobile` on frontend.
- **Phase gate:** `npm run build` green on both repos, INFRA-05 prebuild grep passes, `node scripts/check-backend.mjs` green against production URL, manual eyeball pass: every view renders real content in dev with `NEXT_PUBLIC_API_BASE_URL=<railway-url>`, `pdfinfo`/equivalent confirms PDF metadata, `wc -c < 250KB`.

### Wave 0 Gaps

- [ ] `portfolio-services/scripts/check-backend.mjs` — D-11 smoke gate (BACKEND-04)
- [ ] `portfolio-services/src/scripts/seed.ts` — npm run seed entry point (D-13)
- [ ] `portfolio-services/src/seed/{profile,projects,stack,experience,apps,posts}.json` — 6 JSON files (D-13)
- [ ] `portfolio-services/docs/api-contract.md` — contract doc (BACKEND-03)
- [ ] `portfolio-services/tests/app.test.ts` — extend with 7 endpoint shape assertions (replaces /skills test)
- [ ] `portfolio-web/scripts/check-resume-pdf.mjs` — gate for CONTENT-05 (< 250KB, Title, Author)
- [ ] `portfolio-web/lib/portfolio-data.test.ts` (new) OR extended existing — assertions for CONTENT-02, -04, -06, -07 ("array length ≥ N")
- [ ] Optional: framework install for backend smoke — already in deps; no install needed
- [ ] Manual content-eyeball gate: dev server with `NEXT_PUBLIC_API_BASE_URL` set to Railway URL; render all 7 views; verify real content (Phase 7-style manual review, scoped to content)
- [ ] Paired-commit referential check: each backend commit body cites the matching FE SHA and vice versa (D-19) — verified by reviewer at PR/merge time

## Project Constraints (from CLAUDE.md)

| Constraint | Phase 6 Implication |
|-----------|---------------------|
| Stack constraints: Next.js 15 / React 19 / TS strict / pure CSS | No frontend changes that introduce CSS frameworks or React swaps. Phase 6 touches only `lib/portfolio-data.ts` + (renamed) PDF file; no `.tsx` or `.css` edits expected. |
| Two-prod-dep budget (next-themes + cmdk) | **No new prod deps to portfolio-web.** Backend can add minor tooling (`tsx` for seed script is optional; existing `ts-node-dev` works). |
| Native fetch + `next: { revalidate }` | Preserved. `lib/api.ts` unchanged. |
| Persistent shell at `app/(terminal)/layout.tsx` | Untouched. |
| RSC discipline — only thin client islands carry `"use client"` | Untouched — no new components in Phase 6. |
| Brownfield: delete + replace in same commit | `Skill.ts` → `Stack.ts` rename: delete + introduce in one commit. `placeholders.ts` deletion: delete + introduce `seed/*.json` in one commit. PROFILE.highlights `"4 apps shipped"`: update in same commit as SHIPPED population. |
| Backend type changes ship as paired commits | D-19. Six paired commits (one per type) per Pattern 1. |
| Resume button visible at every viewport | Untouched — Phase 4 ships this. Just verify the renamed PDF path doesn't break the link. |
| Mobile sidebar redistribution: never `display: none` w/o replacement | Untouched. |
| 5-second recruiter test as a real exit criterion | Phase 7 owns this; Phase 6 just needs to make sure content isn't `<TODO>` placeholders. |
| `npm run build` will fail if INFRA-05 grep finds placeholders | Hard gate. Phase 6 success criterion 5 directly references this. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `pdf-lib` is currently at ^1.17.x | Standard Stack → Supporting | Low — used only as one-shot tooling; `npx` resolves latest. Verify with `npm view pdf-lib version` before use. |
| A2 | Railway Mongo plugin still injects connection string as `MONGO_URL` env var | Pattern 5 + Pitfall 7 | Medium — if Railway changed the var name, the runbook step "set `MONGO_URI = ${{Mongo.MONGO_URL}}`" needs the new name. Mitigation: check Railway dashboard at deploy time and update env.ts to read whichever name shows up. |
| A3 | Railway paid Developer tier truly has no idle spin-down | Standard Stack + Pitfall 8 | Low — if the service still cold-starts occasionally, Pitfall 8's HTTP 503 fallback handles it gracefully. |
| A4 | Existing Jest config + supertest still works after dep upgrades (jest 30, ts-jest 29) | Standard Stack | Low — verifiable in 5s by running `npm test` in portfolio-services before any shape changes; if broken, fix is upstream of Phase 6. |
| A5 | The PROFILE seed value `"4 apps shipped"` will resolve to either "2" or "3" per D-17, not "0" or "1" | Pitfall 10 + Code Examples | Low — D-17 says "top 2 or 3"; if user has only 1 valid store URL, replace highlight wording entirely (e.g. "iOS + Android shipped"). |
| A6 | The current `public/resume.pdf` is a 50-byte ASCII placeholder, not a real PDF | Environment Availability + Validation Architecture | None — verified by `file public/resume.pdf` → "ASCII text" and `wc -c` → 50. |
| A7 | The author wants the resume filename literally `Bakytbek_Tatibekov_Resume.pdf` in the URL (not just in the Content-Disposition header) | Pitfall 9 | Low — D-18 says "renamed/saved as" the filename for the Content-Disposition hint; Pitfall 9 recommends putting the literal in the URL path. Confirm at execute time. |
| A8 | The Jest test `tests/app.test.ts:12` ("GET /api/skills returns array with expected shape") will be replaced wholesale to test `/api/stack`, not kept as a deprecated check | Validation Architecture Wave 0 | None — D-05 is "clean break, no v2 versioning", so removing the /skills assertion is correct. |
| A9 | The seed script's `setDefaultsOnInsert: true` will apply Mongoose schema defaults to *upserts*, not just inserts | Pattern 3 + Pitfall 3 | Low — official docs confirm this; only matters if a schema has `default: ...` on a non-required field, which Profile/Project/etc. mostly don't. |
| A10 | `NEXT_PUBLIC_API_BASE_URL` set to a production URL with HTTPS will work for RSC fetches from Vercel's serverless runtime | Pattern 6 | Very low — this is the standard pattern; Vercel allows outbound HTTPS to arbitrary origins. |

## Open Questions

1. **Should `/api/health` return shape info or just `{status: "ok"}`?**
   - What we know: D-11 names `/health` as one of 7 endpoints in the smoke gate; current handler returns `{status: 'ok'}`.
   - What's unclear: Whether to extend it to return version/build-time/git-sha for uptime-monitoring observability (mentioned in CONTEXT.md Claude's Discretion bullet 5).
   - Recommendation: Keep `{status: 'ok'}` for v1. Add a `/api/version` if Phase 7's uptime monitoring wants it. **Resolve at plan time.**

2. **Where does Mongoose connection retry / error handling live during a Railway flap?**
   - What we know: Current `config/database.ts` calls `mongoose.connect(uri)` once; Mongoose driver retries internally.
   - What's unclear: Whether to add an explicit `mongoose.connection.on('error', err => console.error(...))` to surface drops in Railway logs, or rely on driver's silent retry.
   - Recommendation: Add a one-line `mongoose.connection.on('error', err => console.error('mongo:', err.message))` to `connectToDatabase()` for log visibility. Zero-risk add.

3. **CORS — needed anywhere?**
   - What we know: RSC fetches are server-side (no CORS). Frontend has no client-side fetches.
   - What's unclear: Phase 7 (or 8) might add a future admin UI that calls from a browser → CORS needed then.
   - Recommendation: Not in Phase 6. Document in api-contract.md that CORS is intentionally absent.

4. **Backend test depth — every endpoint should have a Jest spec, or just smoke?**
   - What we know: Existing `tests/app.test.ts` covers `/health` and `/skills` (the latter dies once renamed). BACKEND-02 acceptance ("shapes adjusted to match the terminal data model") is best verified by Jest.
   - What's unclear: Whether to require one Jest spec per endpoint vs. trust the smoke mjs script + TypeScript at boundary.
   - Recommendation: Minimum: one supertest assertion per endpoint covering shape (7 total). Use `expect.objectContaining({...keys})` style. Smoke mjs is for production; Jest is for local CI / pre-merge confidence.

5. **Does the seed script need to handle "first deploy where collection is empty" differently from "subsequent run where docs exist"?**
   - What we know: `findOneAndUpdate({filter}, doc, {upsert: true})` is idempotent — handles both cases atomically.
   - What's unclear: Whether to print "created N / updated M" summary, and whether to log the diff if existing doc differs.
   - Recommendation: Tail the seed script with `await Profile.countDocuments()` etc. and log each collection's final count. Skip diff-logging — overkill for v1.

6. **What happens to the old `/api/skills` consumers (the smoke spec, possibly external links)?**
   - What we know: The frontend's `lib/api.ts` already calls `/api/stack` (line 58) — the rename was anticipated in Phase 1. Backend just needs to catch up.
   - What's unclear: Whether anything outside the codebase pointed at `/api/skills` (unlikely — no public docs, no Postman collection in the repo).
   - Recommendation: Hard-rename. If someone has it bookmarked, 404 is the right answer.

7. **Should the seed script drop the old `skills` collection automatically, or fail loudly if it exists?**
   - What we know: Pitfall 4 names this. The naïve approach leaves an orphan collection.
   - What's unclear: Whether to drop silently (cleaner DB) or warn loudly (auditable migration).
   - Recommendation: Drop with try-catch on first run (idempotent). Log "dropped legacy `skills` collection" when it happens; silent when it doesn't. This is one line; the audit trail is in git via the commit that lands the seed script.

## Sources

### Primary (HIGH confidence)
- `lib/types.ts` (verified inline) — canonical shape source
- `lib/api.ts:18,25-35` (verified inline) — env var + fallback pattern
- `lib/portfolio-data.ts` (verified inline) — current seed/fallback state
- `portfolio-services/src/{routes,controllers,models,types,config,seed,middleware}/*.ts` (all read directly) — current backend state
- `portfolio-services/package.json` (verified inline) — dep versions
- `portfolio-services/tests/app.test.ts` (verified inline) — existing test pattern
- `.planning/research/ARCHITECTURE.md:429-448` (verified inline) — hand-mirrored types decision
- `.planning/research/STACK.md:42-46` (verified inline) — API client pattern
- `.planning/codebase/INTEGRATIONS.md` (verified inline) — env var inventory
- `.planning/phases/06-backend-content-population/06-CONTEXT.md` (verified inline) — D-01 through D-19
- npm registry: `mongoose@9.6.2`, `express@5.2.1` (verified via `npm view ... version`)

### Secondary (MEDIUM confidence)
- [Mongoose v9 Subdocuments docs](https://mongoosejs.com/docs/subdocs.html) — verified `_id: false` pattern, strict mode behavior
- [Mongoose findOneAndUpdate tutorial](https://mongoosejs.com/docs/tutorials/findoneandupdate.html) — verified upsert idempotency
- [Next.js Environment Variables guide](https://nextjs.org/docs/pages/guides/environment-variables) — verified NEXT_PUBLIC_ build-time inlining
- [Railway Express deploy guide](https://docs.railway.com/guides/express) — auto-detect + npm start convention
- [Railway MongoDB plugin docs](https://docs.railway.com/guides/mongodb) — connection string env injection

### Tertiary (LOW confidence — verify before relying on)
- [pdf-lib GitHub issue #55](https://github.com/Hopding/pdf-lib/issues/55) — metadata setters exist; specific API shape (`setTitle`, `setAuthor`) confirmed in issue thread but version-pinning untested in this session
- "Railway paid tier has zero idle spin-down" — based on Railway's stated tier docs (A3); not verified in this session

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every dep version verified against `npm view` and existing `package.json`
- Architecture: HIGH — mirrors existing patterns documented in `.planning/research/ARCHITECTURE.md` + `STACK.md`
- Backend mechanics (Mongoose, Express): HIGH — cited official docs for subdocs + upserts
- Railway deployment: MEDIUM — cited Railway docs but no live verification in this session; A2 (env var name) flagged for execute-time check
- Resume PDF tooling: LOW — `pdfinfo`/`qpdf`/`gs`/`exiftool` all missing locally; user must install one (recommend exiftool) or fall back to `pdf-lib`
- Validation architecture: HIGH — every gate cited to existing scripts/specs or named as Wave 0 deliverable
- Pitfalls: HIGH — every pitfall has a concrete grep/test signature

**Research date:** 2026-05-10
**Valid until:** ~2026-06-10 (30 days — Mongoose 9.x and Express 5.x are stable; Railway docs page versions surface in URL changes)
