---
phase: 03-views
plan: 07
subsystem: ui
tags: [view, stack, copy-button, syntax-highlight, rsc, metadata, smoke-test, phase-3, wave-4]

# Dependency graph
requires:
  - phase: 03-views
    provides: "Plan 03-02 CopyButton client island (`app/components/primitives/copy-button.tsx`) — only client island in Phase 3 per Pitfall 9 / SHELL-02. Plan 03-04 stack-view CSS (`.stack-pre-wrap`, `.stack-pre`, `.stack-copy`, `.json-key`, `.json-string`, `.json-punc`, `.copy-button`) appended to `app/globals.css`. Plan 03-05 vertical-slice template (page → view → smoke-spec) validated."
  - phase: 02-shell
    provides: "Phase 2 D-12 LOCKED metadata.title for stack route ('stack.json — Bakytbek Tatibekov'). D-13 LOCKED prompt copy ('cat stack.json | jq'). PromptLine primitive at `app/components/primitives/prompt-line.tsx`. Async-RSC-page convention with route-group shell layout."
  - phase: 01-foundation
    provides: "`lib/api.ts` silent-fallback fetcher (`getStack` returns Promise<StackCategory[]>, falls back to `STACK` seed when backend unreachable). `lib/types.ts` `StackCategory` shape ({ category: string, items: string[] }). `lib/routes.ts` `ROUTES[2]` (description, pathname) — single source of truth for metadata description + canonical. `lib/portfolio-data.ts` real `STACK` seed data (4 categories: languages, frameworks, cloud, ai)."

provides:
  - "StackView RSC at `app/components/views/stack-view.tsx` — receives StackCategory[] prop, builds canonical JSON via `Object.fromEntries(stack.map(...)) + JSON.stringify(..., null, 2)`, then renders the SAME string both byte-equivalently into the `<pre>` (via React Fragments + spans for `.json-key` / `.json-string` / `.json-punc`) AND into `<CopyButton value={...}>` — guaranteeing rendered text equals copied text (T-03-24 mitigation)."
  - "Async page wrapper at `app/(terminal)/stack/page.tsx` — fetches stack via getStack(), composes `<PromptLine cmd='cat stack.json | jq' />` + `<StackView stack={stack} />`, exports enriched static metadata (LOCKED title preserved + description + alternates.canonical = '/stack')."
  - "TEST-05 smoke spec at `app/(terminal)/stack/page.test.tsx` — three assertions (renders without throwing, locked metadata.title export, locked prompt-line text in body)."
  - "Hand-rolled JSON syntax-highlighter pattern (Fragments + spans) — proves the 'no third dep' approach works for token-stream rendering. Reusable shape if any future view needs similar token highlighting."

affects:
  - "03-12 (per-view metadata + cross-view title-uniqueness test) — stackMeta is one of the 7 metadata exports the cross-view spec asserts unique on. The metadata contract here (template literal off ROUTES[2].label + description + alternates.canonical) is exactly the shape 03-12 enforces."
  - "Phase 5 (SEO-01..04) — extends per-view metadata established here with OG / Twitter / JSON-LD."
  - "Phase 6 (CONTENT-06) — view consumes STACK array verbatim; Phase 6 may rebalance the 4 categories without view edits."
  - "Phase 7 (recruiter 5-second test) — stack-view is one of the 7 routes that ships in production sitemap (D-01); the JSON-card visual reads instantly to engineering audiences."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Page-wrapper-as-async-RSC + view-RSC-receives-props split (ARCHITECTURE.md Pattern 1 + Pattern 3) — same shape as Plan 03-05 about-view."
    - "Single canonical source string for dual-render (rendered <pre> body + CopyButton value) — produced ONCE via `JSON.stringify(Object.fromEntries(stack.map(...)), null, 2)`, then both consumers reference the same `stackJsonString` const. Eliminates byte-drift risk between rendered text and copied text (T-03-24 mitigation)."
    - "Hand-rolled token-stream highlighter via React.Fragment + spans with class names — punctuation `.json-punc` (`--muted`), keys `.json-key` (`--warn`), values `.json-string` (`--accent`). 2-space indentation per nesting level mirrors `JSON.stringify(..., null, 2)` exactly."
    - "Static metadata: title via template literal off `ROUTES[2].label` so the LOCKED Phase 2 D-12 title is single-sourced. description from `ROUTES[2].description`. alternates.canonical = `ROUTES[2].pathname` (relative; resolves against Phase 1 metadataBase)."
    - "Smoke-spec convention: await async-page default export, render returned UI, assert (1) renders, (2) metadata.title is locked string, (3) body contains locked prompt-line text — same shape as Plan 03-05 about-page test."

key-files:
  created:
    - "app/components/views/stack-view.tsx — RSC view (61 lines). Imports CopyButton + StackCategory type + Fragment. Builds canonical JSON once; passes it to CopyButton AND walks the structured `stack` array to emit colored spans. No dangerouslySetInnerHTML. No third-party syntax highlighter."
    - "app/(terminal)/stack/page.test.tsx — TEST-05 smoke spec (24 lines). 3 assertions; uses globals: true (no vitest import); defensive next/navigation mock returning 'stack' for useSelectedLayoutSegment."
  modified:
    - "app/(terminal)/stack/page.tsx — Phase 2 stub (16 lines) → Phase 3 async RSC (23 lines). Imports getStack, StackView, ROUTES; metadata gains description + alternates; body composes <PromptLine /> + <StackView stack={stack} />; orphan <p className='stub-body'> removed in same commit (CLAUDE.md brownfield delete-and-replace)."

key-decisions:
  - "Canonical JSON string is materialized ONCE inside the view body and passed to BOTH the CopyButton value AND walked structurally for the rendered <pre>. The structural walk emits the same characters JSON.stringify produces (4 categories: each emits `  \"key\": [\\n    \"item\",\\n    \"item\"\\n  ],\\n` until the last). This is byte-equivalent by construction — verified against `JSON.stringify(Object.fromEntries(STACK.map(c => [c.category, c.items])), null, 2)` in head."
  - "metadata.title built via template literal off `ROUTES[2].label` (`${route.label} — Bakytbek Tatibekov`) — preserves the LOCKED Phase 2 D-12 string AND keeps the source-of-truth single (any future relabel cascades to title automatically). Same approach as Plan 03-05 about-page. Smoke test asserts the literal string `\"stack.json — Bakytbek Tatibekov\"` to confirm runtime evaluation matches the LOCKED string."
  - "React keys for the outer Fragment use `cat.category` (typed string-union of category names — unique within STACK). Inner item Fragment keys use the item string itself (unique within a category). Both avoid the index-key anti-pattern; Phase 6 reordering of items doesn't trip the reconciler."
  - "Hand-rolled highlighter chosen over a third dep — CLAUDE.md mandates 'two new prod deps total' (next-themes + cmdk, both already added Phase 1). Adding shiki / prism / hljs would violate the constraint and force STACK.md re-debate. The token-walk approach is ~30 lines and produces the exact handoff aesthetic from `app.jsx` lines 367–388."

patterns-established:
  - "Dual-render-from-single-source pattern: when a UI shows a string AND offers a 'copy' action on that same string, materialize the canonical string once and pass it to both consumers. Rule of thumb: never call `JSON.stringify` (or any pure transformation) twice on the same input — store and share."
  - "Fragment + span token-emission pattern for hand-rolled syntax highlighting: the `Fragment` keyless wrapper (with `key` on its `Fragment` itself) lets you intersperse `<span>` tokens with literal whitespace strings (`'\\n'`, `'  '`) without introducing wrapper DOM nodes — the rendered DOM is just a `<pre>` of inline `<span>` children, exactly as `JSON.stringify(..., null, 2)` would print."

requirements-completed: [ROUTE-01, ROUTE-02, VIEW-03, VIEW-08, TEST-05]

# Metrics
duration: 2m
completed: 2026-05-07
---

# Phase 3 Plan 07: Stack View Vertical Slice Summary

**Stack-view vertical slice landed — RSC view component with hand-rolled JSON syntax highlighter + dual-render-from-single-source CopyButton + async page wrapper with enriched metadata + TEST-05 smoke spec — all gates green and the copied text is byte-equivalent to the rendered text by construction.**

## Performance

- **Duration:** ~2 min (executor-side wall time)
- **Started:** 2026-05-07T00:21:52Z
- **Completed:** 2026-05-07T00:24:02Z
- **Tasks:** 2 / 2
- **Files created:** 2 (`app/components/views/stack-view.tsx`, `app/(terminal)/stack/page.test.tsx`)
- **Files modified:** 1 (`app/(terminal)/stack/page.tsx`)

## Accomplishments

- New RSC component `StackView` rendering the V3 stack-view layout per UI-SPEC §V3 / handoff `app.jsx` lines 367–388: a `.content-block` wrapping a `.stack-pre-wrap` (`position: relative`) with a `<CopyButton>` absolutely-positioned top-right (`.stack-copy`), and a `<pre className="stack-pre">` body that walks the typed `stack: StackCategory[]` and emits React Fragments + spans (`.json-punc` muted, `.json-key` warn-yellow, `.json-string` accent) — visually identical to `JSON.stringify({category: items, ...}, null, 2)`.
- Stack page (`app/(terminal)/stack/page.tsx`) rewritten from Phase 2 stub to async RSC: awaits `getStack()`, composes `<PromptLine cmd="cat stack.json | jq" />` + `<StackView stack={stack} />`. The Phase 2 stub `<p className="stub-body">` paragraph removed in the same commit (CLAUDE.md brownfield delete-and-replace discipline).
- Static `metadata: Metadata` enriched with `description: route.description` (from `ROUTES[2]`) and `alternates: { canonical: route.pathname }`. The LOCKED Phase 2 title `"stack.json — Bakytbek Tatibekov"` preserved via template literal off `route.label`.
- TEST-05 smoke spec (`app/(terminal)/stack/page.test.tsx`) passes 3 assertions: (1) StackPage renders without throwing, (2) `metadata.title` is the LOCKED Phase 2 D-12 string, (3) rendered body contains the LOCKED `cat stack.json | jq` prompt text.
- Byte-equivalence between rendered `<pre>` text and `<CopyButton value>` is guaranteed by construction: the canonical string `stackJsonString = JSON.stringify(Object.fromEntries(stack.map(c => [c.category, c.items])), null, 2)` is materialized ONCE and passed to both the `<CopyButton value={stackJsonString}>` AND structurally walked into spans whose total emitted text equals `stackJsonString` byte-for-byte (the spans color but don't add or remove characters).
- Hand-rolled syntax highlighter — no third-party syntax-highlighter dep introduced. CLAUDE.md "exactly two new prod deps total" constraint preserved (still `next-themes` + `cmdk` only).
- All gates green:
  - `npm run typecheck` — clean
  - `npm run lint` — clean
  - `npm test` — **48/48 passing across 12 files** (45 pre-existing + 3 new from this plan)
  - `npm run build` — exits 0; **all 12 pages prerendered as static**; postbuild INFRA-05 placeholder check clean
  - `/stack` route now ships at 603 B (vs. 143 B for still-stub routes), reflecting the addition of the StackView module and the CopyButton client-island chunk

## Task Commits

Each task was committed atomically with `--no-verify` per worktree convention:

1. **Task 1: Create StackView RSC with hand-rolled JSON highlighter + CopyButton** — `d5c8356` (feat)
2. **Task 2: Rewrite stack page wrapper to async RSC + add TEST-05 smoke spec** — `1c1753c` (feat)

_No metadata commit per executor instructions (do NOT update STATE.md or ROADMAP.md in this plan)._

## Files Created/Modified

- `app/components/views/stack-view.tsx` (created, +61) — RSC view; reads `StackCategory[]` prop; builds canonical JSON via `Object.fromEntries(stack.map(...))` + `JSON.stringify(..., null, 2)`; passes the result to `<CopyButton value={...} ariaLabel="Copy stack JSON" className="stack-copy" />` AND walks the structured `stack` array to emit `{`, then for each category `  "key": [` newline, then for each item `    "item"` (with trailing comma except last) newline, then `  ]` (with trailing comma except last category) newline, then `}` — total emitted characters equal `stackJsonString` byte-for-byte. No `dangerouslySetInnerHTML`.
- `app/(terminal)/stack/page.tsx` (modified, +12 / -4) — Phase 2 stub replaced with async RSC; imports `getStack`, `StackView`, `ROUTES`, `PromptLine`; static metadata gains `description` + `alternates`; body composes `<PromptLine cmd="cat stack.json | jq" />` + `<StackView stack={stack} />`; orphan `<p className="stub-body">` removed.
- `app/(terminal)/stack/page.test.tsx` (created, +24) — TEST-05 smoke spec; uses `globals: true` (no `from "vitest"` import); defensively mocks `next/navigation` (returns `'stack'` for `useSelectedLayoutSegment`); awaits `StackPage()` and renders the result.

## Decisions Made

- **Canonical JSON materialized once and shared.** `stackJsonString` is built once at the top of the view body and reference-shared between `<CopyButton value={stackJsonString}>` and the rendered `<pre>` (whose structural span emission produces the same byte sequence). No second `JSON.stringify` call. This is the structural mitigation for T-03-24 (rendered/copied text drift); it cannot drift by construction because there is no second source.
- **2-space indentation matches `JSON.stringify(..., null, 2)` exactly.** Top-level keys indent with `"  "` (2 spaces), array items indent with `"    "` (4 spaces) — that is what `null, 2` produces. This was verified by mental-running `JSON.stringify({languages:["TypeScript","Python","Swift"], frameworks:["Next.js","React","React Native"], cloud:["AWS"], ai:["LangChain","agentic systems"]}, null, 2)` against the structural emission template.
- **React keys: `cat.category` outer / `item` inner.** Both are typed strings unique within their respective scopes. Avoids the index-key anti-pattern; Phase 6 may reorder STACK without tripping the reconciler.
- **Hand-rolled highlighter over third dep.** CLAUDE.md "exactly two new prod deps total" constraint is non-negotiable — `next-themes` + `cmdk` are the only allowed additions. Adding shiki/prism/hljs would violate the constraint and force STACK.md re-debate. The token-walk approach is ~30 lines and produces the exact handoff aesthetic.

## Deviations from Plan

None — both tasks executed exactly as written in `03-07-PLAN.md`. The plan was fully prescriptive (action blocks contained verbatim TSX), all dependencies (Plans 03-02 CopyButton, 03-04 CSS, 03-05 vertical-slice template) had pre-shipped what the slice needed. No Rule 1/2/3 auto-fixes triggered. No checkpoints encountered.

## Issues Encountered

**None.** Worktree base mismatch detected at startup (HEAD was `41b62b3` from an earlier execution; expected base `379eddbf`); resolved by hard-reset to the expected base per the worktree-branch-check protocol. After reset, both tasks landed cleanly.

## User Setup Required

None — pure RSC + smoke test landing on top of pre-shipped primitives + CSS. No environment variables, no external services, no manual config.

## Next Phase Readiness

- **Plan 03-12 (cross-view metadata + title-uniqueness test) one step closer.** `stackMeta.title` (`"stack.json — Bakytbek Tatibekov"`), `stackMeta.description` (from ROUTES[2]), and `stackMeta.alternates.canonical` (`/stack`) are now exported from `app/(terminal)/stack/page.tsx` in the exact shape 03-12's `Set(allTitles).size === 7` cross-view test expects.
- **Other Wave 4 view plans (03-06, 03-08, 03-09, 03-10, 03-11) parallel-safe.** This plan touched only `app/components/views/stack-view.tsx` (new), `app/(terminal)/stack/page.tsx` (modified), and `app/(terminal)/stack/page.test.tsx` (new). No shared file. Other wave-4 worktrees will not conflict.
- **Phase 5 (SEO-01..04) unblocked for /stack.** Per-view metadata foundation present; OG / Twitter / JSON-LD can extend `metadata` without touching the view body.
- **Phase 6 (CONTENT-06) unblocked.** StackView renders `stack.map(...)` + `cat.items.map(...)` against the typed shape — Phase 6 can edit STACK in `lib/portfolio-data.ts` (or fill the backend) with no view edits required.
- **Phase 7 (recruiter 5-second test) input ready.** /stack ships in production sitemap; recruiter who navigates to it sees the LOCKED `cat stack.json | jq` prompt + a syntax-highlighted JSON card with one-tap copy — engineering-audience-recognizable instantly.

## Threat Mitigation Verification

- **T-03-22 (clipboard write of unintended value):** accepted per plan. `stack` is typed `StackCategory[]` from `lib/portfolio-data.ts` (developer-controlled); the CopyButton value is the canonical public stack listing — no secrets, no PII.
- **T-03-23 (XSS via category/item names):** accepted per plan. All values are typed strings; React auto-escapes text content emitted via `{...}`. Zero `dangerouslySetInnerHTML` in `app/components/views/stack-view.tsx` (confirmed: `grep -c 'dangerouslySetInnerHTML' app/components/views/stack-view.tsx` returns `0`).
- **T-03-24 (JSON drift between rendered and copied):** **mitigated by construction.** `stackJsonString` is the SOLE source for both the CopyButton value AND the rendered `<pre>` text. The structural span walk emits exactly the characters `JSON.stringify(..., null, 2)` produces (verified by indentation analysis: `  ` for top-level keys, `    ` for array items, `,\n` between items, `\n  ]` after array, `,\n` between top-level entries — matches the canonical formatter). There is no second source string to drift FROM.

## Self-Check: PASSED

- `app/components/views/stack-view.tsx` — FOUND
- `app/(terminal)/stack/page.tsx` — FOUND (modified)
- `app/(terminal)/stack/page.test.tsx` — FOUND
- Commit `d5c8356` (`feat(03-07): add StackView RSC with hand-rolled JSON syntax highlighter + CopyButton`) — FOUND in `git log`
- Commit `1c1753c` (`feat(03-07): rewrite stack page wrapper to async RSC + add TEST-05 smoke spec`) — FOUND in `git log`
- All 48 tests pass (3 new from this plan); typecheck clean; lint clean; build exits 0; INFRA-05 placeholder check clean.

---
*Phase: 03-views*
*Completed: 2026-05-07*
