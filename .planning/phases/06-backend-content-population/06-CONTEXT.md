# Phase 6: Backend + Content Population - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Cut over the frontend from static fallback data to a live sibling backend, and populate every view with real content. Specifically:

1. Sibling `portfolio-services/` exposes a new `/api/projects` endpoint and adjusts the existing endpoints (`/api/profile`, `/api/skills` → `/api/stack`, `/api/experience`, `/api/apps`, `/api/posts`) to match `lib/types.ts`; contract documented at `portfolio-services/docs/api-contract.md`.
2. Backend deploys to production *before* the frontend cuts over via `NEXT_PUBLIC_API_BASE_URL`.
3. `lib/portfolio-data.ts` carries real bio, projects (≥3), writing (1 post), shipped apps (2–3), stack, experience.
4. `public/resume.pdf` is the real PDF with `Title`/`Author` metadata and `wc -c` < 250KB.
5. The INFRA-05 prebuild grep gate (`lorem|example.com|placeholder|TODO|Product Studio`) returns zero hits against `.next/server/`.

**Scope anchor:** content lifecycle + backend contract, not new capabilities. CMS, admin UI, chatbot, and analytics are deferred to later phases.

</domain>

<decisions>
## Implementation Decisions

### Cutover sequencing

- **D-01:** Backend-first deploy, then frontend env-flip. Step 1 — ship `portfolio-services` to Railway production with all corrected shapes + new `/api/projects` + renamed `/api/stack`. Step 2 — verify via smoke script (see D-11). Step 3 — deploy frontend with `NEXT_PUBLIC_API_BASE_URL=https://<railway-host>` pointing at production. Roadmap Success Criterion 2 enforces this ordering.
- **D-02:** Keep `lib/portfolio-data.ts` as a permanent silent fallback. The existing `try/catch` in `lib/api.ts:25-35` continues to swallow fetch failures and return the seed. DATA-04 resilience preserved; offline/CI builds and backend outages stay non-fatal.
- **D-03:** **No runtime response validation** in Phase 6. ARCHITECTURE.md §Backend Contract explicitly defers zod "until a type mismatch causes a render bug." Discipline: change shapes in `portfolio-services` first, update `lib/types.ts` in paired commit, TypeScript compilation catches drift in seed data + view consumers. Revisit only if a render bug surfaces.
- **D-04:** Production fetches use a **separate origin** via `NEXT_PUBLIC_API_BASE_URL`. No Next.js rewrites, no serverless adapter. RSC fetches are server-side so CORS is a non-issue. `lib/api.ts:18` already reads the env var with localhost fallback — no code change needed beyond setting the env in Vercel.

### Backend shape adjustment

- **D-05:** **Rewrite shapes in place** — clean break, no v2 versioning, no parallel endpoints. Single developer + single consumer = versioning overhead has no payoff. Pairs with CLAUDE.md brownfield discipline ("delete and replace in same commit"). Backend Mongoose models + controllers + DTOs get rewritten to match `lib/types.ts` directly.
- **D-06:** **Rename `/api/skills` → `/api/stack`** with the new `StackCategory[]` shape (`{ category: string, items: string[] }`). Backend `apiRoutes.ts` swaps the route, `contentController.ts` swaps the handler name, `Skill.ts` model becomes `Stack.ts` (or restructured to nested arrays). Eliminates the orphan "skills" term from the project vocabulary. Backend `SkillDto` deleted.
- **D-07:** `/api/projects` gets a **Mongoose model + DB backing** for consistency with the other endpoints. `models/Project.ts` mirrors the `Profile`/`Experience`/`App`/`Post` pattern. New `getProjects` controller method follows the existing controller shape. New route line in `apiRoutes.ts`. Symmetry > convenience; trivial to extend later.
- **D-08:** **API contract = hand-written markdown** at `portfolio-services/docs/api-contract.md`. One section per endpoint: HTTP method + path, response TypeScript shape (copy-paste from `lib/types.ts`), example payload, `revalidate` interval. Authored in the same paired commit as the shape change. Zero tooling (no codegen, no OpenAPI in v1 — explicitly deferred per ARCHITECTURE.md "OpenAPI worth revisiting if a third consumer appears").

### Backend deployment + storage

- **D-09:** **Railway** for backend hosting. Managed Mongo provisioning co-located with the service. No idle spin-down on paid tier (acceptable cost trade for chatbot-future readiness). Backend production URL feeds the `NEXT_PUBLIC_API_BASE_URL` env var.
- **D-10:** **Keep Mongoose + MongoDB** — do NOT shift to seeded constants. Driven by two user-stated needs that must outlast Phase 6: (1) a future chatbot will read from Mongo, (2) writing posts get stored in DB rather than authored as TS constants. Keeping Mongo now avoids a forklift later.
- **D-11:** **Readiness gate = `scripts/check-backend.mjs`** (lives in `portfolio-services/scripts/`) — curl smoke against `$PROD_API_URL`. Each of 7 endpoints (`/health`, `/profile`, `/projects`, `/stack`, `/experience`, `/apps`, `/posts`) returns HTTP 200, content-type `application/json`, and response body contains canonical keys (e.g. `/profile` body has `name` + `bio.short` + `socials`). Script also greps for `lorem|example.com|placeholder|Product Studio` and exits non-zero on any hit. Runs locally before flipping the env var; can be wired to CI later.
- **D-12:** **All Phase 6 endpoints are public read-only.** No auth, no API key, no bearer token. Matches the public-portfolio threat model (the data is destined to be rendered into public HTML). Phase 7 may carve out `/api/admin/*` behind a static bearer token if an admin UI lands; that's deferred.

### Content authoring discipline

- **D-13:** **Mongo content authored via seed-script + JSON files** checked into `portfolio-services/src/seed/`. One JSON per content type (`profile.json`, `projects.json`, `posts.json`, `experience.json`, `apps.json`, `stack.json`). `npm run seed` in `portfolio-services` upserts into Mongo by stable key (slug for posts, name for projects/apps, single doc for profile). Content stays version-controlled; chatbot reads the same Mongo docs later; same script extends to a future admin-write endpoint.
- **D-14:** **Frontend `lib/portfolio-data.ts` mirrors the seed JSON content** so the fallback path renders the same data the backend serves. Mirror is hand-maintained; if drift becomes painful, a future task can generate `portfolio-data.ts` from `portfolio-services/src/seed/*.json`. Phase 6 does it by hand.

### Content scope decisions (resolves Open Questions #2, #3, #6)

- **D-15:** **Writing posts v1 = exactly 1 real post.** Resolves Open Question #2. CONTENT-04 satisfied. `posts.json` ships with one entry; `lib/portfolio-data.ts` `WRITING` array carries the same entry. WritingView's empty-state branch becomes defensive code (covered by view smoke spec but not exercised in production).
- **D-16:** **Third social = NONE.** Resolves Open Question #6. v1 ships with **GitHub + LinkedIn only**. Palette `palette-verbs.ts` and AboutSocials/contact-view need a trim from 3 rows to 2 if any code currently anticipates a third slot. PROFILE.socials already has only 2 entries — no frontend change needed; just freeze the count at 2.
- **D-17:** **Shipped apps v1 = top 2 or 3** with the strongest engineering signal — only entries with currently-valid App Store and/or Play Store URLs that resolve. Resolves Open Question #3. **Reconcile PROFILE.highlights:** the current `"4 apps shipped"` highlight is stale — change the highlight value to match the final count (or replace with a different highlight if 2–3 feels small as a stat). Planner: include a content-pass task that pairs the SHIPPED entry count with the PROFILE.highlights value.

### Resume PDF (CONTENT-05)

- **D-18:** **Drop in the existing real PDF** at `public/resume.pdf` (renamed/saved as `Bakytbek_Tatibekov_Resume.pdf` for the `Content-Disposition` filename hint). Verify `file public/resume.pdf` confirms PDF, `wc -c public/resume.pdf` < 250KB, `pdfinfo` shows non-empty `Title` and `Author`. If metadata is absent, `exiftool -Title="Bakytbek Tatibekov Resume" -Author="Bakytbek Tatibekov" public/resume.pdf` fixes it in one command. No LaTeX/Typst/pandoc pipeline.

### Brownfield discipline (carried forward)

- **D-19:** Backend shape changes ship as **paired commits** — `portfolio-web` (`lib/types.ts` + `lib/portfolio-data.ts` shape updates) and `portfolio-services` (model + controller + route + contract doc updates) referenced by SHA in each commit message. Per CLAUDE.md.

### Claude's Discretion

- Final wording of the single writing post (D-15) — pick a topic that signals engineering craft (e.g. RSC discipline from the redesign, contrast-audit story from Phase 5, anything you've already drafted).
- Bio paragraphs final text (CONTENT-01) — current TS stand-ins are generic; planner can either ask during execution or pull from existing resume/LinkedIn.
- Specific project list (CONTENT-02) — ≥3 entries with real names, years, status, summary, tech, role, link. Planner can prompt during the content-authoring task.
- `scripts/check-backend.mjs` exact assertion list — D-11 names the canonical keys; specific shape-grep regexes are an executor concern.
- Whether to add a `/health` shape check to the smoke script (probably yes — useful for uptime monitoring).

### Folded Todos

None — no pending todos matched Phase 6 scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project + roadmap
- `.planning/PROJECT.md` — Out of Scope list, dual-audience constraint, "no content placeholders in production" definition of done
- `.planning/ROADMAP.md` §Phase 6 — Goal, requirements list, 5 success criteria
- `.planning/REQUIREMENTS.md` — BACKEND-01..04, CONTENT-01..08 acceptance criteria
- `.planning/STATE.md` §Blockers/Concerns — Open Questions #2 (writing), #3 (shipped), #6 (third social) all resolved here

### Research (architectural context)
- `.planning/research/ARCHITECTURE.md` §"Backend Contract & Type Sharing" — hand-mirrored types discipline, zod-defer rationale
- `.planning/research/STACK.md` §"API Client" — native fetch + ISR + fallback pattern (no SWR / React Query)

### Codebase intel
- `.planning/codebase/INTEGRATIONS.md` — how `lib/api.ts` and the sibling backend currently connect
- `.planning/codebase/ARCHITECTURE.md` — RSC fetch boundaries, per-view data flow
- `.planning/codebase/TESTING.md` — Vitest + smoke-script conventions used elsewhere

### Project conventions
- `CLAUDE.md` §Brownfield discipline — paired-commit rule for backend type changes (D-19)
- `CLAUDE.md` §Working Conventions — "no SWR / no TanStack Query" + "two prod deps" constraint (rules out adding zod or other libs in Phase 6)

### Frontend source-of-truth files
- `lib/types.ts` — canonical type definitions every backend endpoint must match
- `lib/api.ts:18-35` — `getJson<T>` fetch-with-fallback chokepoint; cutover happens via the env var on line 18
- `lib/portfolio-data.ts` — seed/fallback content authored in this phase

### Sibling backend (portfolio-services/)
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/routes/apiRoutes.ts` — 5 endpoints today; needs `/api/projects` + rename `/api/skills` → `/api/stack`
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/controllers/contentController.ts` — handler bodies rewritten to new shapes
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/types/content.ts` — DTOs rewritten to match `lib/types.ts`
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/src/models/*.ts` — Mongoose schemas reshaped + new `Project.ts` added
- `/Users/beckmaldinVL/development/personal-portfolio/portfolio-services/docs/api-contract.md` — **TO BE CREATED** in this phase (BACKEND-03)

### Prior phase artifacts (cross-cutting)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Foundation locked `lib/types.ts` shape Phase 6 must respect
- `.planning/phases/05-seo-accessibility-polish/05-CONTEXT.md` — content patterns (AboutSocials, JSON-LD) consume `PROFILE.socials`; trimming to 2 must not break Phase 5 components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets

- **`lib/api.ts` `getJson<T>(path, fallback)` pattern** — already does fetch + ISR + silent fallback. Phase 6 backend cutover happens by setting `NEXT_PUBLIC_API_BASE_URL` in the Vercel env; no code change in `lib/api.ts` itself unless a per-endpoint quirk surfaces.
- **`lib/portfolio-data.ts` UPPERCASE constants** — `PROFILE`, `PROJECTS`, `EXPERIENCE`, `WRITING`, `SHIPPED`, `STACK` are already exported with TypeScript types. Content pass populates the empty arrays + replaces stand-in strings; no new constants needed.
- **INFRA-05 prebuild grep** (`scripts/check-placeholders.mjs` + `package.json postbuild`) — already enforces `lorem|example.com|placeholder|TODO|Product Studio` against `.next/server/`. Phase 6 success criterion 5 is already wired; content tasks just need to avoid reintroducing matches.
- **Backend controller pattern** (`portfolio-services/src/controllers/contentController.ts`) — existing `getHealth/getProfile/getSkills/getExperience/getApps/getPosts` shape. New `getProjects` slots in cleanly; `getSkills` becomes `getStack`.
- **Backend Mongoose model pattern** (`Profile.ts`, `Experience.ts`, `App.ts`, `Post.ts`, `Skill.ts`) — new `Project.ts` mirrors the same schema-definition style. `Skill.ts` retired, replaced by `Stack.ts` (or restructured nested-array schema).
- **Seed-script convention** — D-13 establishes `src/seed/*.json` + `npm run seed` as the new authoring path; one-time setup that all future content edits use.

### Established patterns

- **Hand-mirrored types between repos** (no monorepo, no codegen) — per ARCHITECTURE.md. Sequence: change `portfolio-services` first, paired-commit `portfolio-web/lib/types.ts` mirror.
- **ISR revalidate: 300s** — set on every `getJson` call. Phase 6 doesn't touch this; backend response freshness is governed by the cache window.
- **Per-view RSC fetch** — each `app/(terminal)/<view>/page.tsx` calls exactly one `lib/api.ts` function. Phase 6 changes don't touch view code unless a shape change breaks a view (TypeScript catches it).
- **Smoke-script-as-gate** (Phases 1, 2, 4, 5) — `scripts/check-*.mjs` files that exit non-zero when an invariant breaks. D-11 extends this pattern to `check-backend.mjs` (lives in `portfolio-services/scripts/`, NOT `portfolio-web/scripts/`).

### Integration points

- **Env var: `NEXT_PUBLIC_API_BASE_URL`** — Vercel project settings, production scope. Locally `.env.local` keeps the existing `http://localhost:8080` (or unset → defaults).
- **Vercel deploy hooks** — frontend deploy must happen AFTER backend smoke script passes against the production backend URL. Planner: order this in the execution waves.
- **`portfolio-services/docs/api-contract.md` ↔ `portfolio-web/lib/types.ts`** — paired-commit discipline (D-19); contract doc copies type shapes verbatim.
- **`PROFILE.highlights` ↔ `SHIPPED.length`** — D-17 reconciliation needed: the "4 apps shipped" highlight string is stale once `SHIPPED` holds 2–3.

</code_context>

<specifics>
## Specific Ideas

- "Posts go in the DB because I want a chatbot later." Storage decision (D-10) explicitly accommodates the future chatbot. Don't drop Mongo even though current content volume doesn't require a database.
- Backend rewrite is a clean break — no version negotiation, no migration scripts. Single developer + single consumer model. Same energy as the Phase 1 `homepage.tsx` deletion-in-same-commit move.
- The frontend already silently falls back when the backend is down. That gives us room to deploy the backend, smoke-test it, and only flip the env var when confident.

</specifics>

<deferred>
## Deferred Ideas

These came up but belong in later phases. Don't lose them; don't act on them in Phase 6.

- **Chatbot that reads from Mongo** — drove the storage decision (D-10) but is not part of Phase 6 work. Likely Phase 8+ (post-v1 milestone) or its own milestone.
- **`/api/admin/*` carve-out with static bearer-token auth** — for a future admin UI to author content without DB-shell access. Deferred to Phase 7.
- **OpenAPI / zod codegen for the API contract** — ARCHITECTURE.md notes this becomes worth it "if the API surface grows beyond ~10 endpoints or if a third consumer appears." Defer until either trigger fires.
- **Runtime response validation in `lib/api.ts`** — D-03 explicit defer. Revisit only when a type mismatch causes a render bug.
- **Auto-generated `lib/portfolio-data.ts` from `portfolio-services/src/seed/*.json`** — D-14 mirrors by hand for now. If drift becomes painful, a future task can codegen it.
- **CMS or admin dashboard for content updates** — out of scope per PROJECT.md. Deferred indefinitely; admin endpoints (above) plus shell access cover the gap.

</deferred>

---

*Phase: 06-backend-content-population*
*Context gathered: 2026-05-10*
