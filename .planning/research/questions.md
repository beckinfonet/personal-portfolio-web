# Open Research Questions

Open questions surfaced during exploration that need investigation before
planning can begin. Each entry: question, why it matters, where to look.

---

## Q1 — Is the Project schema's `link` field always a GitHub repo URL?

**Surfaced:** 2026-05-21 via `/gsd-explore` (GitHub repo stats seed)
**Related:** [[github-repo-stats]] · [[github-repo-stats-exploration]]

**Question:** The existing Project model in `portfolio-services` ships with
a single `link: string` field per the Phase 6 Plan 07 wave. Is that field
always a GitHub repository URL, or is it polymorphic — sometimes a live
deployed site, sometimes a repo, depending on the project?

**Why it matters:** Determines the scope of the GitHub repo stats feature.

- If `link` is always a repo URL → feature is FE-only. New `lib/github.ts`
  module + two new components. No backend changes. Single commit.
- If `link` is polymorphic → schema needs an additional `repoUrl?: string`
  field. Per CLAUDE.md brownfield discipline, that's a paired FE+BE commit
  (model update + DTO + seed JSON + lib/types.ts + Project type) and
  ProjectsView needs to handle both fields.

**Where to look:**

- `portfolio-services/src/models/Project.ts` — current schema and any
  comments on field semantics.
- `portfolio-services/src/seed/projects.json` — the 3 seed entries.
  Inspecting their URLs reveals what `link` is used for today.
- `portfolio-web/lib/types.ts` — frontend Project type and any JSDoc.
- `portfolio-web/app/components/views/projects-view.tsx` (or equivalent)
  — how the field is rendered (label text often reveals semantic intent).

**Resolution path:**

- Read the four files above and the original `06-07-SUMMARY.md`.
- If polymorphic, decide: add `repoUrl?: string`, or repurpose `link` as
  repo-only and add `liveUrl?: string` for live sites.

**Status:** **Resolved 2026-05-21** — `link` is polymorphic per JSDoc ("External link to live site / repo / case study. https only."). All 3 current seed entries happen to be GitHub URLs but the contract intentionally allows mixed destinations. v1.1 milestone adds a separate optional `repoUrl?: string` field rather than repurposing `link`. See PROJECT.md v1.1 milestone start evolution note for full decision context.
