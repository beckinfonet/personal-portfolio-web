# Phase 8: Project Schema Extension - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 8-Project Schema Extension
**Areas discussed:** Seed/fallback drift & phase scope, Repo field shape, Project repo URLs

---

## Seed/fallback drift & phase scope

Discovered during discussion: production Mongo serves 4 current projects
(Validation Ledger / Looper / MoveIn / CarEx) while the committed seed
(`portfolio-services/src/seed/projects.json`) and frontend fallback
(`lib/portfolio-data.ts`) both still hold the stale 3 (Terminal Portfolio /
Portfolio Services / GSD Workflow). SCHEMA-04's "3 existing project entries"
wording is factually wrong.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — fix it now | Reconcile the stale backup list to the real 4 live projects as part of Phase 8, alongside the schema field | ✓ |
| No — just add the field | Add `repoUrls` only; leave the stale backup for a separate follow-up task | |

**User's choice:** Yes — fix it now.
**Notes:** Initial four-option scoping question (reconcile / schema-only / two
commit pairs / reseed Mongo) was too jargon-heavy; user asked for plain
language. Re-asked as a simple yes/no after a plain-English explanation of the
backup-list drift.

---

## Repo field shape

Looper has two repos (LooperMobile + looper-agentic) but a single-string
`repoUrl` field can only hold one.

| Option | Description | Selected |
|--------|-------------|----------|
| List of repos, combined stats | Field becomes `repoUrls: string[]`; Phase 9 fetches each repo and sums the stats; ripples into Phase 9/10 roadmap | ✓ |
| Single repo per project | Field stays a single URL; multi-repo projects pick one repo, the other is not counted | |

**User's choice:** List of repos, combined stats.
**Notes:** User asked "can't we combine both?" when offered a single-repo
choice for Looper. Confirmed the list shape after the Phase 9/10 ripple was
explained.

---

## Project repo URLs

Free-text data gathering — user supplied the public GitHub repo URLs per
project.

**User's response:**
- Validation Ledger: `https://github.com/beckinfonet/validation-ledger-mobile`
- Looper: `https://github.com/beckinfonet/LooperMobile` (mobile) +
  `https://github.com/beckinfonet/looper-agentic` (services)
- MoveIn: `https://github.com/beckinfonet/jaytap-mobile`
- CarEx: `https://github.com/beckinfonet/CarEx`

**Notes:** Live `/api/projects` data fetched from Railway to confirm the
4-project list and existing polymorphic `link` values. User flagged
frustration with over-complicated multi-part questions mid-discussion; later
turns kept to plain, minimal phrasing.

---

## Claude's Discretion

- Schema-level URL validation on `repoUrls` — no Mongoose regex (matches the
  existing `Project.link` precedent).
- Whether `placeholderProjects` (the 503-warming fallback) also carries
  `repoUrls` — low-stakes shape choice left to the planner.
- Backend Jest assertion depth for SCHEMA-05 — planner picks minimal vs.
  targeted; targeted preferred.

## Deferred Ideas

- Sync ROADMAP.md / REQUIREMENTS.md wording from singular `repoUrl?: string`
  to plural `repoUrls?: string[]` (Phase 8 SC2, Phase 9 `getRepoStats`
  signature + GH-* text, Phase 10 LIST/DETAIL references). Documentation
  consistency task, not new scope.
- Pushing the new `repoUrls` field into production Mongo (re-seed or manual
  doc update) — a Phase 11 deploy concern.
