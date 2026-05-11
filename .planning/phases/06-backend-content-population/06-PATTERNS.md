# Phase 6: Backend + Content Population - Pattern Map

**Mapped:** 2026-05-10
**Files analyzed:** 18 (12 backend, 6 frontend)
**Analogs found:** 17 / 18

---

## File Classification

| New/Modified File | Repo | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|------|-----------|----------------|---------------|
| `src/models/Stack.ts` | services | model | writes-to-DB | `src/models/Skill.ts` | exact |
| `src/models/Project.ts` | services | model | writes-to-DB | `src/models/App.ts` | exact |
| `src/models/Profile.ts` | services | model | writes-to-DB | itself (`src/models/Profile.ts`) | exact (reshape) |
| `src/models/Experience.ts` | services | model | writes-to-DB | itself | exact (reshape) |
| `src/models/App.ts` | services | model | writes-to-DB | itself | exact (reshape) |
| `src/models/Post.ts` | services | model | writes-to-DB | itself | exact (reshape) |
| `src/types/content.ts` | services | types | transform | itself | exact (rewrite) |
| `src/controllers/contentController.ts` | services | controller | request-response | itself | exact (extend) |
| `src/routes/apiRoutes.ts` | services | route | request-response | itself | exact (extend) |
| `src/scripts/seed.ts` | services | script | batch/writes-to-DB | `src/seed/placeholders.ts` (import pattern) | partial |
| `src/seed/*.json` | services | seed | data | `src/seed/placeholders.ts` (data shape) | role-match |
| `scripts/check-backend.mjs` | services | script | request-response | `portfolio-web/scripts/check-placeholders.mjs` | role-match |
| `docs/api-contract.md` | services | docs | n/a | NONE | no analog |
| `tests/app.test.ts` | services | test | request-response | itself | exact (extend) |
| `package.json` | services | config | n/a | itself | exact (extend) |
| `lib/portfolio-data.ts` | web | data-fallback | transform | itself | exact (populate) |
| `lib/portfolio-data.test.ts` | web | test | transform | `lib/json-ld.test.ts` | role-match |
| `scripts/check-resume-pdf.mjs` | web | script | file-I/O | `scripts/check-placeholders.mjs` | exact |

---

## Pattern Assignments

### `src/models/Stack.ts` (model, writes-to-DB)

**Analog:** `portfolio-services/src/models/Skill.ts` (retire this file; Stack.ts replaces it)
**Secondary analog for nested-array shape:** `portfolio-services/src/models/Experience.ts` (shows `[{ type: String }]` array field pattern)

**Full analog — Skill.ts (lines 1-13):**
```typescript
import { Schema, model } from 'mongoose';

const skillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true }
  },
  { timestamps: true }
);

export const Skill = model('Skill', skillSchema);
```

**Target shape to implement** (derived from `lib/types.ts` `StackCategory`):
```typescript
// Stack.ts must produce documents matching: { category: string, items: string[] }
// One document per category; fetch returns the full collection as StackCategory[].
const stackSchema = new Schema(
  {
    category: { type: String, required: true },
    items: [{ type: String, required: true }]
  },
  { timestamps: true }
);
export const Stack = model('Stack', stackSchema);
```

**Array-field precedent** from `src/models/Experience.ts` (line 9):
```typescript
highlights: [{ type: String, required: true }]
```

---

### `src/models/Project.ts` (model, writes-to-DB)

**Analog:** `portfolio-services/src/models/App.ts` (same role, same data flow — closest shape match)

**Full analog — App.ts (lines 1-13):**
```typescript
import { Schema, model } from 'mongoose';

const appSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    stack: [{ type: String, required: true }],
    url: { type: String, required: true }
  },
  { timestamps: true }
);

export const App = model('App', appSchema);
```

**Target shape** (from `lib/types.ts` `Project`):
```typescript
// Project must produce: { name, year, status, summary, tech: string[], role, link }
const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    year: { type: String, required: true },
    status: { type: String, required: true },
    summary: { type: String, required: true },
    tech: [{ type: String, required: true }],
    role: { type: String, required: true },
    link: { type: String, required: true }
  },
  { timestamps: true }
);
export const Project = model('Project', projectSchema);
```

---

### `src/models/Profile.ts` (model, writes-to-DB — reshape)

**Analog:** itself — the existing flat schema must be reshaped to the `lib/types.ts` `Profile` nested structure.

**Current shape (lines 1-14) — to be replaced:**
```typescript
import { Schema, model } from 'mongoose';

const profileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    title: { type: String, required: true },
    bio: { type: String, required: true },
    location: { type: String, required: true },
    email: { type: String, required: true }
  },
  { timestamps: true }
);

export const Profile = model('Profile', profileSchema);
```

**Target shape** (must match `lib/types.ts` Profile — nested Bio + Highlight[] + Social[]):
```typescript
// New nested fields: bio.short, bio.long[], highlights[]{value,label},
// socials[]{label,handle,url,kind}, plus: name, shortName, initials, role,
// location, email, resumeUrl
// Use nested Schema objects for bio, highlights, socials.
// Single-document collection: Profile.findOne().lean()
```

**Nested object precedent** — use inline schema objects (same repo convention):
```typescript
// Pattern: nest with { type: ..., required: ... } per field
highlights: [{ value: { type: String }, label: { type: String } }]
```

---

### `src/models/Experience.ts` (model, writes-to-DB — reshape)

**Analog:** itself — flatten from `{ startDate, endDate, highlights[] }` to `{ role, company, period, summary }`.

**Current shape (lines 1-14):**
```typescript
import { Schema, model } from 'mongoose';

const experienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    highlights: [{ type: String, required: true }]
  },
  { timestamps: true }
);

export const Experience = model('Experience', experienceSchema);
```

**Target shape** (from `lib/types.ts` `Experience`):
```typescript
// Remove: startDate, endDate, highlights[]
// Add: period (string), summary (string)
// Keep: company, role
```

---

### `src/models/App.ts` (model, writes-to-DB — reshape)

**Analog:** itself — add `platforms[]`, `appStoreUrl?`, `googlePlayUrl?`, `role`, `year`, `summary?`; remove generic `url`.

**Current shape (lines 1-13):**
```typescript
import { Schema, model } from 'mongoose';

const appSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    stack: [{ type: String, required: true }],
    url: { type: String, required: true }
  },
  { timestamps: true }
);

export const App = model('App', appSchema);
```

**Target shape** (from `lib/types.ts` `ShippedApp`):
```typescript
// Remove: description, stack, url
// Add: platforms[], appStoreUrl?, googlePlayUrl?, role, year, summary?
// platforms is array of "ios"|"android" literals — store as String[]
```

---

### `src/models/Post.ts` (model, writes-to-DB — reshape)

**Analog:** itself — add `readTime`, `link` fields to match `lib/types.ts` `Writing`.

**Current shape (lines 1-13):**
```typescript
import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, required: true },
    publishedAt: { type: String, required: true }
  },
  { timestamps: true }
);

export const Post = model('Post', postSchema);
```

**Target shape** (from `lib/types.ts` `Writing`):
```typescript
// Rename: publishedAt → date (Writing.date is "April 2026" formatted string)
// Add: readTime (string), link (string)
// Keep: title, slug, excerpt
```

---

### `src/types/content.ts` (types, transform — rewrite)

**Analog:** itself — DTOs rewritten to mirror `lib/types.ts` exports verbatim. `SkillDto` is deleted.

**Current shape (lines 1-35):**
```typescript
export type ProfileDto = {
  fullName: string;
  title: string;
  bio: string;
  location: string;
  email: string;
};

export type SkillDto = {   // DELETE THIS
  name: string;
  category: string;
  level: string;
};

export type ExperienceDto = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  highlights: string[];
};

export type AppDto = {
  name: string;
  description: string;
  stack: string[];
  url: string;
};

export type PostDto = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
};
```

**Target:** Replace each `*Dto` type body with the exact field set from the corresponding `lib/types.ts` interface. Add `StackCategoryDto` and `ProjectDto`. The convention is `type` (not `interface`) to match existing style.

---

### `src/controllers/contentController.ts` (controller, request-response — extend)

**Analog:** itself — add `getProjects`, rename `getSkills` → `getStack`, update model imports.

**Full current file (lines 1-97) — core handler pattern to copy:**
```typescript
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { App } from '../models/App';
// ... other model imports ...
import { placeholderApps, /* ... */ } from '../seed/placeholders';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' });
};

export const getProfile = async (_req: Request, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(200).json(placeholderProfile);
    return;
  }
  try {
    const profile = await Profile.findOne().lean();
    res.status(200).json(profile ?? placeholderProfile);
  } catch {
    res.status(200).json(placeholderProfile);
  }
};

// Collection handlers follow the array-find pattern:
export const getApps = async (_req: Request, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(200).json(placeholderApps);
    return;
  }
  try {
    const apps = await App.find().lean();
    res.status(200).json(apps.length > 0 ? apps : placeholderApps);
  } catch {
    res.status(200).json(placeholderApps);
  }
};
```

**New `getProjects` follows the `getApps` array-find pattern exactly.** New `getStack` follows the same pattern (replaces `getSkills`). Placeholder data for both is provided by JSON seed files or an inline fallback constant added to `src/seed/placeholders.ts`.

---

### `src/routes/apiRoutes.ts` (route, request-response — extend)

**Analog:** itself — add `/projects`, rename `/skills` → `/stack`.

**Full current file (lines 1-13):**
```typescript
import { Router } from 'express';
import { getApps, getExperience, getHealth, getPosts, getProfile, getSkills } from '../controllers/contentController';

const apiRoutes = Router();

apiRoutes.get('/health', getHealth);
apiRoutes.get('/profile', getProfile);
apiRoutes.get('/skills', getSkills);       // rename to /stack, getStack
apiRoutes.get('/experience', getExperience);
apiRoutes.get('/apps', getApps);
apiRoutes.get('/posts', getPosts);

export default apiRoutes;
```

**Target diff:** replace `getSkills` → `getStack`, `'/skills'` → `'/stack'`; add `apiRoutes.get('/projects', getProjects);`. Import list updated accordingly.

---

### `src/scripts/seed.ts` (script, batch/writes-to-DB)

**Analog:** `src/seed/placeholders.ts` (import pattern for type-safe data objects); no existing seed-runner script exists in either repo — this is a new file.

**Import pattern from `src/seed/placeholders.ts` (line 1):**
```typescript
import { AppDto, ExperienceDto, PostDto, ProfileDto, SkillDto } from '../types/content';
```

**Reference pattern from RESEARCH.md for Mongoose upsert by stable key:**
```typescript
// Mongoose upsert idiom (D-13 — upsert by stable key)
await Model.updateOne(
  { slug: doc.slug },       // stable key for posts
  { $set: doc },
  { upsert: true }
);
// For single-document collections (profile):
await Profile.replaceOne({}, profileData, { upsert: true });
```

**Script entry-point pattern** (follow `src/server.ts` for DB connection setup):
```typescript
// Connect to Mongo, run upserts, disconnect.
// Load JSON seed files with import assertions or fs.readFileSync + JSON.parse.
// Exit 0 on success, non-zero on error.
```

---

### `src/seed/*.json` (seed, data)

**Analog:** `src/seed/placeholders.ts` — provides the exact data shapes currently used; seed JSON files replace the same content but as version-controlled JSON.

**Data shape reference from `placeholders.ts` (lines 1-61):**
```typescript
// These shapes are the exact per-endpoint data contracts.
// Each *.json mirrors one placeholder constant:
//   profile.json     ← placeholderProfile  (ProfileDto → now nested Profile shape)
//   stack.json       ← placeholderSkills   (array of StackCategoryDto)
//   experience.json  ← placeholderExperience
//   apps.json        ← placeholderApps
//   posts.json       ← placeholderPosts
//   projects.json    ← (NEW — no placeholder exists yet)
```

**JSON file structure convention** (one array of objects or a single object):
```json
// profile.json — single object matching ProfileDto (nested)
{ "name": "...", "bio": { "short": "...", "long": ["...", "..."] }, ... }

// projects.json — array of ProjectDto objects
[{ "name": "...", "year": "2024", "status": "shipped", ... }]
```

---

### `scripts/check-backend.mjs` (script, request-response) — lives in `portfolio-services/scripts/`

**Analog:** `portfolio-web/scripts/check-placeholders.mjs` (closest match: zero-dep mjs + `process.exit` + scan loop)

**Secondary analog:** `portfolio-web/scripts/check-og-files.mjs` (fetch-style existence checks)

**Core structural pattern from `check-placeholders.mjs` (lines 1-59):**
```javascript
#!/usr/bin/env node
// scripts/check-placeholders.mjs
// Postbuild gate: fails build if .next/server/ contains forbidden strings.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const FORBIDDEN = [ /lorem/i, /example\.com/i, /* ... */ ];

const hits = [];
for (const file of walk(BUILD_DIR)) {
  const contents = readFileSync(file, "utf8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(contents)) hits.push({ file, pattern: pattern.source });
  }
}

if (hits.length > 0) {
  console.error("\n✗ INFRA-05: Forbidden strings found in build output:\n");
  process.exit(1);
}
console.log(`✓ INFRA-05: ${BUILD_DIR}/ clean (no forbidden strings)`);
process.exit(0);
```

**Adaptation for `check-backend.mjs`** — replace file-scan loop with HTTP fetch loop:
```javascript
#!/usr/bin/env node
// scripts/check-backend.mjs
// Smoke gate: verifies all 7 endpoints return HTTP 200 + application/json
// + canonical keys + no placeholder strings. Runs against $PROD_API_URL.

const BASE = process.env.PROD_API_URL ?? 'http://localhost:8080';
const FORBIDDEN = /lorem|example\.com|placeholder|Product Studio/i;

const ENDPOINTS = [
  { path: '/api/health',     keys: ['status'] },
  { path: '/api/profile',    keys: ['name', 'bio', 'socials'] },
  { path: '/api/projects',   keys: ['name', 'year', 'status'] },     // first element
  { path: '/api/stack',      keys: ['category', 'items'] },           // first element
  { path: '/api/experience', keys: ['role', 'company', 'period'] },   // first element
  { path: '/api/apps',       keys: ['name', 'platforms'] },           // first element
  { path: '/api/posts',      keys: ['title', 'slug', 'excerpt'] },    // first element
];

// For each endpoint:
// 1. fetch(BASE + path)
// 2. assert response.status === 200
// 3. assert response.headers.get('content-type').includes('application/json')
// 4. assert canonical keys present in body (or body[0] for arrays)
// 5. FORBIDDEN.test(JSON.stringify(body)) must be false
// Exit 0 on all pass, 1 on any failure.
```

---

### `tests/app.test.ts` (test, request-response — extend)

**Analog:** itself — add 6 new endpoint shape assertions; replace the `/api/skills` assertion with `/api/stack`.

**Full current file (lines 1-26):**
```typescript
import request from 'supertest';
import app from '../src/app';

describe('API routes', () => {
  it('GET /api/health returns ok status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /api/skills returns array with expected shape', async () => {
    const response = await request(app).get('/api/skills');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        category: expect.any(String),
        level: expect.any(String)
      })
    );
  });
});
```

**Pattern to follow for each new endpoint test:**
```typescript
it('GET /api/stack returns StackCategory[] shape', async () => {
  const response = await request(app).get('/api/stack');
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
  expect(response.body[0]).toEqual(
    expect.objectContaining({
      category: expect.any(String),
      items: expect.any(Array)
    })
  );
});
// Repeat for /api/profile (single object, not array), /api/projects,
// /api/experience, /api/apps, /api/posts — each with canonical keys.
```

---

### `package.json` (config — extend)

**Analog:** itself — add `seed` and `smoke` script entries.

**Current scripts block (lines 5-10):**
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc -p tsconfig.json",
  "start": "node dist/src/server.js",
  "test": "jest --runInBand --watchman=false"
}
```

**Target additions:**
```json
"seed": "ts-node-dev --transpile-only src/scripts/seed.ts",
"smoke": "node scripts/check-backend.mjs"
```

---

### `lib/portfolio-data.ts` (data-fallback, transform — populate)

**Analog:** itself — UPPERCASE constant structure is already correct; Phase 6 fills the empty arrays and updates stand-in strings with real content.

**Full current structure (lines 1-89) — the shell to populate:**
```typescript
import type { Profile, Project, Experience, Writing, ShippedApp, StackCategory } from "./types";

export const CAREER_START_DATE = new Date("2018-01-01");

export const PROFILE: Profile = {
  name: "Bakytbek Tatibekov",
  // ... bio, highlights, socials all present but bio text is stand-in
};

export const PROJECTS: Project[] = [];        // Phase 6 fills >=3
export const EXPERIENCE: Experience[] = [];   // Phase 6 fills
export const WRITING: Writing[] = [];         // Phase 6 fills 1 post
export const SHIPPED: ShippedApp[] = [];      // Phase 6 fills 2-3

export const STACK: StackCategory[] = [
  { category: "languages", items: ["TypeScript", "Python", "Swift"] },
  // ... already has real data; update to match stack.json
];
```

**Type contract to satisfy** (from `lib/types.ts`):
- `PROJECTS` entries must have: `name`, `year`, `status`, `summary`, `tech[]`, `role`, `link`
- `EXPERIENCE` entries must have: `company`, `role`, `period`, `summary`
- `WRITING` entries must have: `title`, `date`, `readTime`, `excerpt`, `link`, `slug`
- `SHIPPED` entries must have: `name`, `platforms`, `appStoreUrl?`, `googlePlayUrl?`, `role`, `year`, `summary?`
- `PROFILE.highlights[1].value` must reconcile with `SHIPPED.length` (D-17: "4 apps shipped" → update to real count)

---

### `lib/portfolio-data.test.ts` (test, transform — new file)

**Analog:** `lib/json-ld.test.ts` — colocated lib test, imports from `./types`, uses `describe`/`test`/`expect` (Vitest), fixture-function pattern.

**Full pattern from `lib/json-ld.test.ts` (lines 1-30):**
```typescript
import { describe, test, expect } from "vitest";
import { buildPersonSchema, filterValidUrls } from "./json-ld";
import type { Profile, Social } from "./types";

function fixtureProfile(overrides: Partial<Profile> = {}): Profile {
  const base: Profile = {
    name: "Test Name",
    shortName: "Test",
    initials: "TN",
    role: "Engineer",
    location: "Remote",
    email: "test@example.test",
    resumeUrl: "/resume.pdf",
    bio: { short: "", long: [] },
    highlights: [],
    socials: []
  };
  return { ...base, ...overrides };
}

describe("filterValidUrls", () => {
  test("includes URLs matching /^https?:\\/\\//", () => {
    // ...
    expect(filterValidUrls(p)).toEqual(["https://github.com/foo"]);
  });
});
```

**Adaptation for `lib/portfolio-data.test.ts`:**
```typescript
import { describe, test, expect } from "vitest";
import { PROFILE, PROJECTS, EXPERIENCE, WRITING, SHIPPED, STACK } from "./portfolio-data";

// Test assertions to include:
// - PROFILE.name is non-empty, non-placeholder string
// - PROFILE.socials has exactly 2 entries (D-16)
// - PROFILE.highlights.length === 3
// - PROJECTS.length >= 3 (CONTENT-02)
// - EXPERIENCE.length >= 1
// - WRITING.length >= 1 (CONTENT-04, D-15)
// - SHIPPED.length >= 2 (D-17)
// - STACK.length >= 1, every entry has category + items[]
// - No FORBIDDEN strings in JSON.stringify of any constant
// Note: use "test@example.test" pattern (not example.com) to avoid INFRA-05 grep
```

---

### `scripts/check-resume-pdf.mjs` (script, file-I/O — new file)

**Analog:** `scripts/check-og-files.mjs` (existsSync pattern) + `scripts/check-headers.mjs` (readFileSync + pattern matching)

**`check-og-files.mjs` pattern (lines 1-22):**
```javascript
#!/usr/bin/env node
// scripts/check-og-files.mjs
import { existsSync } from "node:fs";
const REQUIRED = [ "app/opengraph-image.tsx", /* ... */ ];
const missing = REQUIRED.filter((p) => !existsSync(p));
if (missing.length > 0) {
  console.error("✗ SEO-03: missing OG files:");
  for (const p of missing) console.error(`  FAIL: ${p}`);
  process.exit(1);
}
console.log(`✓ SEO-03: all ${REQUIRED.length} OG files present`);
process.exit(0);
```

**`check-headers.mjs` pattern (lines 1-19) — source-parse check:**
```javascript
#!/usr/bin/env node
import { readFileSync } from "node:fs";
const CONFIG = readFileSync("next.config.ts", "utf8");
const checks = [
  { pattern: /engineerHeaders/, label: "engineerHeaders array declared" },
];
const failures = checks.filter(({ pattern }) => !pattern.test(CONFIG));
if (failures.length > 0) {
  console.error("✗ DEV-03: header audit failed:");
  for (const { label } of failures) console.error(`  FAIL: ${label}`);
  process.exit(1);
}
console.log("✓ DEV-03: x-built-with header slot intact in next.config.ts");
process.exit(0);
```

**Adaptation for `check-resume-pdf.mjs`:**
```javascript
#!/usr/bin/env node
// scripts/check-resume-pdf.mjs
// CONTENT-05 gate: verifies public/resume.pdf exists and is a valid PDF
// (starts with %PDF magic bytes) and is under 250KB.
import { existsSync, statSync, readFileSync } from "node:fs";

const PDF_PATH = "public/resume.pdf";
const MAX_BYTES = 250 * 1024;

const failures = [];
if (!existsSync(PDF_PATH)) {
  failures.push(`${PDF_PATH} does not exist`);
} else {
  const { size } = statSync(PDF_PATH);
  if (size > MAX_BYTES) failures.push(`${PDF_PATH} is ${size} bytes (max ${MAX_BYTES})`);
  const magic = readFileSync(PDF_PATH).slice(0, 5).toString("ascii");
  if (magic !== "%PDF-") failures.push(`${PDF_PATH} does not start with %PDF- magic bytes`);
}

if (failures.length > 0) {
  console.error("\n✗ CONTENT-05: resume PDF audit failed:\n");
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ CONTENT-05: ${PDF_PATH} present, valid PDF, under 250KB`);
process.exit(0);
```

---

## Shared Patterns

### Mongoose Model Declaration
**Source:** `portfolio-services/src/models/App.ts`, `Post.ts`, `Skill.ts`, `Experience.ts`, `Profile.ts`
**Apply to:** `Stack.ts`, `Project.ts`, all reshaped model files
```typescript
import { Schema, model } from 'mongoose';

const fooSchema = new Schema(
  { /* fields */ },
  { timestamps: true }          // always include — used by all 5 existing models
);

export const Foo = model('Foo', fooSchema);
```

### Controller Handler Pattern (DB-or-fallback)
**Source:** `portfolio-services/src/controllers/contentController.ts` (lines 20-46)
**Apply to:** Every handler in `contentController.ts` — existing reshaped handlers + new `getStack`, `getProjects`
```typescript
export const getApps = async (_req: Request, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(200).json(placeholderApps);    // fallback: DB not connected
    return;
  }
  try {
    const apps = await App.find().lean();
    res.status(200).json(apps.length > 0 ? apps : placeholderApps);
  } catch {
    res.status(200).json(placeholderApps);    // fallback: query error
  }
};
```
Note: `getProfile` uses `findOne()` + `?? fallback`; collection handlers use `find()` + `length > 0` guard. `getPosts` adds `sort + limit`. New handlers follow the appropriate sub-pattern.

### Zero-dep mjs Smoke Script Structure
**Source:** `portfolio-web/scripts/check-placeholders.mjs` (lines 1-59)
**Apply to:** `portfolio-services/scripts/check-backend.mjs`, `portfolio-web/scripts/check-resume-pdf.mjs`
```javascript
#!/usr/bin/env node
// scripts/check-XYZ.mjs
// One-line description. Exits 0 on pass, 1 on any failure.
import { ... } from "node:fs";   // stdlib only — no npm deps

const failures = [];
// ... checks populate failures[] ...

if (failures.length > 0) {
  console.error("\n✗ GATE-ID: audit failed:\n");
  for (const msg of failures) console.error(`  FAIL: ${msg}`);
  process.exit(1);
}
console.log(`✓ GATE-ID: audit passed`);
process.exit(0);
```

### Vitest Lib Test Structure
**Source:** `portfolio-web/lib/json-ld.test.ts` (lines 1-30)
**Apply to:** `portfolio-web/lib/portfolio-data.test.ts`
```typescript
import { describe, test, expect } from "vitest";
import { exportedThing } from "./module-under-test";

describe("module-under-test", () => {
  test("invariant description", () => {
    expect(exportedThing).toBe(expectedValue);
  });
});
// Use fixture functions (fixtureProfile pattern) for complex input objects.
// Never use "example.com" in test strings — use "example.test" to avoid INFRA-05.
```

### Supertest Backend Test Structure
**Source:** `portfolio-services/tests/app.test.ts` (lines 1-26)
**Apply to:** `tests/app.test.ts` extended assertions for all 7 endpoints
```typescript
import request from 'supertest';
import app from '../src/app';

describe('API routes', () => {
  it('GET /api/X returns Y shape', async () => {
    const response = await request(app).get('/api/X');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);   // for collections
    expect(response.body[0]).toEqual(
      expect.objectContaining({ field: expect.any(String) })
    );
  });
});
```

### Hand-mirrored Type Pairing
**Source:** `portfolio-web/lib/types.ts` ↔ `portfolio-services/src/types/content.ts`
**Apply to:** Every new/reshaped DTO in `content.ts`
- Frontend `lib/types.ts` is the source of truth (ARCHITECTURE.md §Backend Contract)
- Backend `content.ts` copies field names and scalar types verbatim using `type` (not `interface`)
- Paired-commit SHA cross-reference in commit message per D-19

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `portfolio-services/docs/api-contract.md` | docs | n/a | No documentation files exist in either repo; structure is described in RESEARCH.md §D-08: 7 sections (one per endpoint), method+path, TS shape copied from `lib/types.ts`, example payload, `revalidate` interval |

---

## Metadata

**Analog search scope:**
- `portfolio-services/src/models/`, `src/controllers/`, `src/routes/`, `src/types/`, `src/seed/`, `tests/`
- `portfolio-web/scripts/`, `lib/`, `lib/*.test.ts`

**Files read (source analogs):**
- `portfolio-services/src/models/` — all 5 existing model files
- `portfolio-services/src/controllers/contentController.ts`
- `portfolio-services/src/routes/apiRoutes.ts`
- `portfolio-services/src/types/content.ts`
- `portfolio-services/src/seed/placeholders.ts`
- `portfolio-services/tests/app.test.ts`
- `portfolio-services/package.json`
- `portfolio-web/lib/types.ts`
- `portfolio-web/lib/api.ts`
- `portfolio-web/lib/portfolio-data.ts`
- `portfolio-web/lib/json-ld.test.ts`
- `portfolio-web/scripts/check-placeholders.mjs`
- `portfolio-web/scripts/check-headers.mjs`
- `portfolio-web/scripts/check-og-files.mjs`
- `portfolio-web/scripts/check-print-rules.mjs`

**Pattern extraction date:** 2026-05-10
