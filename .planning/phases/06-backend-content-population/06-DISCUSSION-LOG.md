# Phase 6: Backend + Content Population - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 06-backend-content-population
**Areas discussed:** Cutover strategy, Backend shape adjustment, Backend deployment + storage, Content scope decisions

---

## Cutover strategy

### Q1: Cutover sequence

| Option | Description | Selected |
|--------|-------------|----------|
| Backend-first, then frontend env-flip | Backend ships to prod first; frontend env-flip after smoke-test passes. Roadmap success criterion 2 enforces. | ✓ |
| Parallel — frontend stays on static; backend ships independently | Frontend uses lib/portfolio-data.ts in prod; backend rollout becomes a separate task. | |
| Single atomic flip — paired PRs deploy both | Backend + frontend ship simultaneously. Cleanest contract view; higher deploy-time risk. | |

**User's choice:** Backend-first, then frontend env-flip (Recommended)

### Q2: Role of lib/portfolio-data.ts after cutover

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as permanent silent fallback | DATA-04 preserved. Backend outage → portfolio still renders. | ✓ |
| Keep but log loudly when fallback fires | Replace silent catch with console.warn + log. | |
| Remove once backend is live — single source of truth | Delete portfolio-data.ts; lib/api.ts throws on failure. | |

**User's choice:** Keep as permanent silent fallback (Recommended)

### Q3: Runtime validation in Phase 6

| Option | Description | Selected |
|--------|-------------|----------|
| Defer — ship without runtime validation | Per ARCHITECTURE.md. TypeScript + paired commits catch drift. | ✓ |
| Add hand-written narrowing helpers in lib/api.ts | Per-endpoint narrowing functions. Zero new deps. | |
| Add zod now — schemas at lib/api.ts boundary | Requires revisiting STACK.md two-dep budget. | |

**User's choice:** Defer (Recommended)

### Q4: Production origin model

| Option | Description | Selected |
|--------|-------------|----------|
| Separate origin via NEXT_PUBLIC_API_BASE_URL | Matches today's lib/api.ts pattern. No CORS (RSC fetch is server-side). | ✓ |
| Same origin via Next.js rewrites in next.config.ts | /api/:path* → backend. Hides backend host. | |
| Embed backend in same Vercel project (serverless adapter) | Port Express to Route Handlers. Major rework. | |

**User's choice:** Separate origin via NEXT_PUBLIC_API_BASE_URL (Recommended)

---

## Backend shape adjustment

### Q5: Strategy for 5 mis-shaped endpoints

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite shapes in place — clean break | No versioning. Single dev + single consumer. | ✓ |
| Add v2 endpoints alongside; deprecate old | Old shapes stay live during cutover. | |
| Add new endpoints with new names; keep old | e.g. /api/profile-v2. Worst of both worlds. | |

**User's choice:** Rewrite shapes in place (Recommended)

### Q6: Reconcile /api/skills vs /api/stack

| Option | Description | Selected |
|--------|-------------|----------|
| Rename /api/skills → /api/stack with new shape | Single endpoint, single concept. Drops "skills" term. | ✓ |
| Add /api/stack alongside /api/skills (drop skills later) | Two endpoints during transition. | |
| Keep /api/skills but reshape; update frontend to call /api/skills | Smaller backend change; bakes "skills" into vocab. | |

**User's choice:** Rename /api/skills → /api/stack (Recommended)

### Q7: Backing for /api/projects

| Option | Description | Selected |
|--------|-------------|----------|
| Mongoose model + DB-backed like the others | Adds models/Project.ts. Architectural consistency. | ✓ |
| Static array in the controller — no DB model | getProjects returns hardcoded Project[]. Faster ship. | |
| Reuse the App model if structurally similar | Different domains; no overlap. | |

**User's choice:** Mongoose model + DB-backed (Recommended)

### Q8: api-contract.md format

| Option | Description | Selected |
|--------|-------------|----------|
| Plain markdown at portfolio-services/docs/api-contract.md | Per BACKEND-03. Zero tooling. | ✓ |
| Generated from TS types via ts-to-zod or similar | Adds tool + CI. Overkill for 6 endpoints. | |
| Both: markdown + openapi.yaml | Belt-and-suspenders. Defer per ARCHITECTURE.md. | |

**User's choice:** Plain markdown (Recommended)

---

## Backend deployment + storage

### Q9: Deployment target

| Option | Description | Selected |
|--------|-------------|----------|
| Render | Free tier; spins down on idle; native Atlas integration. | |
| Fly.io | Always-on micro VMs (no cold starts); Docker-based. | |
| Railway | Polished DX; $5/mo+; managed Mongo co-located. | ✓ |
| Vercel — Express as serverless adapter | Single account; cold starts; Mongoose quirks. | |

**User's choice:** Railway
**Notes:** Managed Mongo provisioning aligns with the keep-Mongo decision below.

### Q10: Storage model

| Option | Description | Selected |
|--------|-------------|----------|
| Drop MongoDB — controllers return in-process consts | Simpler. Content lives in TS files. | |
| Keep MongoDB but seed-on-boot from src/seed/* (Hybrid) | DB layer stays; content authored in TS. | |
| Keep Mongo with manual content updates via shell/Atlas UI | Status quo. | |
| Keep Mongo, no drop (User-described) | Future chatbot reads from Mongo; posts stored in DB. | ✓ |

**User's choice:** "I want to add a chatbot later to this project, so I will need the backend to read from mongodb. There will be posts that I want to be stored somewhere, the best place for that I think is the DB. So, we should not drop mongo at all."
**Notes:** Drives D-10 (Mongo stays) and D-13 (seed-script + JSON authoring). Chatbot itself is captured in Deferred Ideas.

### Q11: BACKEND-04 readiness gate

| Option | Description | Selected |
|--------|-------------|----------|
| curl smoke script hitting 7 endpoints with shape grep | scripts/check-backend.mjs. Runs locally or CI. | ✓ |
| Manual checklist in 06-VERIFICATION.md | Reviewer hits each endpoint manually. | |
| Both: smoke script + manual one-time browser check | Belt-and-suspenders. | |

**User's choice:** curl smoke script (Recommended)

### Q12: Endpoint auth

| Option | Description | Selected |
|--------|-------------|----------|
| Fully public read-only, no auth | All endpoints serve data destined for public HTML anyway. | |
| Public reads + hidden /api/admin/* with bearer token (defer Phase 7) | Future admin endpoints. Out of Phase 6 scope. | ✓ |
| All endpoints behind shared NEXT_PUBLIC_API_KEY | Anti-pattern — key ends up in client bundle. | |

**User's choice:** Public reads + admin carve-out deferred to Phase 7
**Notes:** Phase 6 ships everything public read-only; the admin carve-out is captured in Deferred Ideas, not built now.

### Q13: How writing posts get into Mongo (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Seed script + posts.json in repo | npm run seed upserts by slug. Version-controlled. | ✓ |
| Author directly in Atlas UI | Manual DB writes. Loses git history. | |
| Seed-on-boot from a TS const (no JSON file) | TypeScript-typed at author time. | |

**User's choice:** Seed script + posts.json (Recommended)

---

## Content scope decisions

### Q14: Writing posts v1 count (Open Question #2)

| Option | Description | Selected |
|--------|-------------|----------|
| Ship one real post for v1 | CONTENT-04 satisfied. Empty-state branch stays defensive. | ✓ |
| Ship zero posts with explicit "coming soon" empty state | CONTENT-04 permits if chosen. Lower lift. | |
| Ship 2–3 real posts | Stronger signal; higher authoring lift. | |

**User's choice:** Ship one real post for v1

### Q15: Third social (Open Question #6)

| Option | Description | Selected |
|--------|-------------|----------|
| Bluesky | Engineering-culture-shift platform. | |
| Mastodon | Federated; terminal/IDE audience. | |
| X / Twitter | Largest reach; worst brand alignment. | |
| None — ship with GitHub + LinkedIn only | Drop the third slot. Cleanest if no third presence. | ✓ |

**User's choice:** None — GitHub + LinkedIn only

### Q16: Shipped apps count (Open Question #3)

| Option | Description | Selected |
|--------|-------------|----------|
| All 4 (matches PROFILE.highlights "4 apps shipped") | Aligns with existing highlight. Highest authoring lift. | |
| Top 2–3 — only apps with strongest signal | Curated. Requires reconciling PROFILE.highlights. | ✓ |
| Whatever's available — content-pass output | Pragmatic; planner enumerates during execution. | |

**User's choice:** Top 2–3 with strongest signal
**Notes:** PROFILE.highlights "4 apps shipped" needs reconciling — captured as a planner task (D-17).

### Q17: Resume PDF source

| Option | Description | Selected |
|--------|-------------|----------|
| Drop in existing PDF you already have | Verify <250KB + Title/Author. exiftool fixes metadata. | ✓ |
| Generate from LaTeX/Typst source committed to repo | Source-controlled + regenerable. Tool dep. | |
| Generate from Markdown → PDF pipeline (pandoc) | Source-controlled. Gentler toolchain. | |

**User's choice:** Drop in existing PDF (Recommended)

---

## Claude's Discretion

- Final wording of the single writing post (D-15) — picked by content-authoring task.
- Bio paragraphs final text (CONTENT-01) — planner may prompt or pull from existing resume.
- Specific project list with names + URLs (CONTENT-02) — planner prompts during execution.
- Specific shape-grep regexes in `scripts/check-backend.mjs` (D-11 names the keys).
- Whether `/health` shape is part of the smoke-script asserts.

## Deferred Ideas

- Chatbot that reads from Mongo — Phase 8+ or its own milestone.
- `/api/admin/*` carve-out with bearer-token auth — Phase 7.
- OpenAPI / zod codegen for the API contract — gated on third consumer or >10 endpoints.
- Runtime response validation in lib/api.ts — gated on a real render bug.
- Auto-generated lib/portfolio-data.ts from src/seed/*.json — gated on hand-drift pain.
- CMS / admin dashboard for content updates — out of scope per PROJECT.md.
