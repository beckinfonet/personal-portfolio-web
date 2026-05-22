/**
 * Pure formatter module — converts a `GitHubRepoStats` object (Phase 9) into the
 * two view-models the Phase 10 projects UI renders:
 *
 *   - `StripModel` — the collapsed `/projects` card stat strip
 *     (`gh: <commits> commits · <langs> · <duration>`).
 *   - `PanelModel` — the expanded "Tech highlights" panel
 *     (full language byte-breakdown, dev duration, last-active line).
 *
 * Every export is PURE: no I/O, no React, no `node:` imports. The only import is
 * `import type { GitHubRepoStats } from "./types"`. This keeps the module
 * server-and-client-safe so Plan 02's client island can consume the computed
 * view-models without ever pulling `lib/github.ts` (and its `GITHUB_TOKEN` /
 * `node:fs` surface) into the client bundle.
 *
 * Date injection seam: every date-dependent helper accepts an optional `now`
 * parameter (defaulting to `new Date()`) so behaviour is deterministic under
 * test. UTC date methods are used throughout for timezone-stable output.
 *
 * Used by app/(terminal)/projects/page.tsx + app/components/project-row.tsx
 */
import type { GitHubRepoStats } from "./types";

/**
 * Curated GitHub-language → short-abbreviation map for the collapsed strip only.
 *
 * D-06: membership is derived from the long language names GitHub actually
 * returns for the portfolio's repos. Languages that are already short
 * (`Swift`, `CSS`, `HTML`, `Shell`, `Go`) are intentionally absent — any
 * language NOT in this map renders its full GitHub name verbatim, with no
 * clipping and no guessed abbreviation.
 *
 * D-07: this map is strip-only. `buildPanelModel`'s byte breakdown uses the
 * full GitHub language names and never consults this map.
 */
export const LANG_ABBREV: Record<string, string> = {
  TypeScript: "TS",
  JavaScript: "JS",
  Python: "Py"
};

/** A collapsed-row stat strip view-model. */
export interface StripModel {
  /** Summed commit count across the project's repos. */
  commitCount: number;
  /** 1-3 abbreviated (or verbatim) language names, post-<1%-floor. */
  languages: string[];
  /** Formatted dev duration, e.g. "4mo" / "1y 2mo". */
  duration: string;
}

/** An expanded "Tech highlights" panel view-model. */
export interface PanelModel {
  /** Summed commit count across the project's repos. */
  commitCount: number;
  /** Top-5 languages with FULL GitHub names and rounded integer percentages. */
  breakdown: { name: string; pct: number }[];
  /** Rounded sum of the percentages of surviving ranks 6+. */
  otherPct: number;
  /** e.g. "In development since Jan 2026 — 4mo". */
  durationLine: string;
  /** e.g. "Last active 3 days ago". */
  lastActive: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

/**
 * Top-N languages by byte count, dropping any language under 1% of total bytes
 * (the D-08 / D-09 floor).
 *
 * Percentages are computed from the raw total BEFORE the floor is applied — so
 * after dropping <1% languages the surviving percentages may not sum to 100.
 * That is intentional (Pitfall 6); callers must not re-normalize.
 *
 * Returns `[]` when the total is 0.
 */
export function topLanguages(
  languages: Record<string, number>,
  limit: number
): { name: string; bytes: number; pct: number }[] {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / total) * 100 }))
    .filter((l) => l.pct >= 1) // <1% floor — D-08 / D-09
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}

/**
 * Whole-month duration from `createdAtISO` to `now`, formatted as `Nmo` under a
 * year and `Ny Nmo` at a year or above. A negative or sub-month result is
 * guarded to `"0mo"`. UTC date methods keep the output timezone-stable.
 */
export function formatDuration(createdAtISO: string, now = new Date()): string {
  const start = new Date(createdAtISO);
  let months =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - start.getUTCMonth());
  if (months < 1) months = 0; // guard negative / sub-month ranges
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return years > 0 ? `${years}y ${rem}mo` : `${months}mo`;
}

/**
 * Relative-time label from an ISO timestamp to `now`:
 * `today` / `N day(s) ago` / `N month(s) ago` / `N year(s) ago`.
 */
export function relativeTime(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Short month name + 4-digit year for an ISO date, e.g. `"Jan 2026"`. Uses UTC
 * methods so a late-day timestamp stays in the correct month.
 */
export function monthYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Build the collapsed-row strip view-model. Returns `null` when `stats` is null
 * (LIST-07) so a project with no stats renders no strip.
 *
 * Strip languages are the top 3 post-floor, abbreviated via `LANG_ABBREV` or
 * rendered verbatim when absent from the map (D-06 / D-08).
 */
export function buildStripModel(
  stats: GitHubRepoStats | null,
  now = new Date()
): StripModel | null {
  if (!stats) return null; // LIST-07 — render nothing
  const languages = topLanguages(stats.languages, 3).map(
    (l) => LANG_ABBREV[l.name] ?? l.name
  );
  return {
    commitCount: stats.commitCount,
    languages,
    duration: formatDuration(stats.createdAt, now)
  };
}

/**
 * Build the expanded "Tech highlights" panel view-model. Returns `null` when
 * `stats` is null (DETAIL-07) so the Tech highlights block is omitted.
 *
 * The breakdown holds the top-5 surviving (post-<1%-floor) languages with FULL
 * GitHub names (D-07 — never abbreviated in the panel) and rounded integer
 * percentages; `otherPct` is the rounded sum of surviving ranks 6+.
 */
export function buildPanelModel(
  stats: GitHubRepoStats | null,
  now = new Date()
): PanelModel | null {
  if (!stats) return null; // DETAIL-07 — omit the Tech highlights block
  const surviving = topLanguages(stats.languages, Infinity); // <1% floor applied
  const top5 = surviving.slice(0, 5); // full names — D-07
  const otherPct = surviving.slice(5).reduce((a, l) => a + l.pct, 0);
  return {
    commitCount: stats.commitCount,
    breakdown: top5.map((l) => ({ name: l.name, pct: Math.round(l.pct) })),
    otherPct: Math.round(otherPct),
    durationLine: `In development since ${monthYear(stats.createdAt)} — ${formatDuration(
      stats.createdAt,
      now
    )}`,
    lastActive: `Last active ${relativeTime(stats.pushedAt, now)}`
  };
}
