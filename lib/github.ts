/**
 * Server-only GitHub repo-stats data module — Phase 9 / GitHub API integration.
 *
 * Fetches live GitHub repo statistics for every URL in a project's `repoUrls`,
 * combines them into a single typed `GitHubRepoStats` value, and never throws
 * to callers. Mirrors the `lib/api.ts` ISR-cached fetch + silent-fallback
 * pattern (daily revalidate), adds `GITHUB_TOKEN` conditional bearer auth, a
 * Link-header commit-count parser, and a per-repo disk-cache outage fallback.
 *
 * MUST NOT be imported into a client island — `GITHUB_TOKEN` is a server secret.
 */
import type { GitHubRepoStats } from "./types";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

/** A parsed GitHub owner/repo reference, lowercased and validated. */
interface RepoRef {
  owner: string;
  repo: string;
}

/** Per-repo stats — the GitHubRepoStats-equivalent shape before combining. */
interface RepoStat {
  createdAt: string;
  pushedAt: string;
  languages: Record<string, number>;
  commitCount: number;
}

const API_VERSION = "2022-11-28";

/** Fires the no-token dev warning once per module load (D-07 / Open Question 1). */
let warned = false;

/**
 * Parse a single repoUrls entry as `https://github.com/{owner}/{repo}`.
 * Tolerates a trailing slash and an optional `.git` suffix; returns null for a
 * non-github.com host, a malformed URL, or owner/repo segments that fail the
 * `/^[\w.-]+$/` SSRF path-injection guard. Owner/repo are lowercased (D-02).
 */
function parseRepoUrl(raw: string): RepoRef | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hostname !== "github.com") return null;
  const parts = url.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, repo] = parts;
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
  return { owner: owner.toLowerCase(), repo: repo.toLowerCase() };
}

/**
 * Parse every repoUrls entry, drop the unparseable ones, and dedupe on the
 * lowercase `owner/repo` key (resolves the Phase 8 IN-03 casing inconsistency).
 */
function parseRepoUrls(repoUrls: string[]): RepoRef[] {
  const seen = new Set<string>();
  const out: RepoRef[] = [];
  for (const raw of repoUrls) {
    const ref = parseRepoUrl(raw);
    if (!ref) continue;
    const key = `${ref.owner}/${ref.repo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

/**
 * Build the GitHub request headers. Includes `Authorization: Bearer <token>`
 * only when `GITHUB_TOKEN` is set (server-only secret, no NEXT_PUBLIC_ prefix).
 */
function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Derive the total commit count from a `GET /commits?per_page=1` response —
 * the Link header's `rel="last"` page number (D-04). When no Link header is
 * present the repo has 0 or 1 commits, so fall back to the array length.
 */
function commitCountFromLink(
  linkHeader: string | null,
  arrayLength: number
): number {
  if (!linkHeader) return arrayLength;
  const match = linkHeader.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/);
  return match ? Number(match[1]) : arrayLength;
}

/** Log GitHub rate-limit headers at dev level (GH-08); never the token. */
function logRateLimit(res: Response): void {
  if (process.env.NODE_ENV === "production") return;
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  console.warn(
    `[lib/github] GitHub rate limit hit — x-ratelimit-remaining: ${remaining}, x-ratelimit-reset: ${reset}`
  );
}

/**
 * Disk cache — strictly a deploy-time outage fallback (D-05), never the primary
 * read path. Keyed by the normalized lowercase `owner/repo` (D-06). Every disk
 * op swallows errors so a read-only FS at runtime never breaks getRepoStats.
 */
const CACHE_PATH = join(process.cwd(), ".next", "cache", "github-stats.json");

/** Read the disk cache; returns {} when the file is absent or unparseable. */
async function readDiskCache(): Promise<Record<string, RepoStat>> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8")) as Record<
      string,
      RepoStat
    >;
  } catch {
    return {};
  }
}

/** Write one entry back to the disk cache; swallows every error (Pitfall 4). */
async function writeDiskCacheEntry(key: string, stat: RepoStat): Promise<void> {
  try {
    const current = await readDiskCache();
    current[key] = stat;
    await mkdir(dirname(CACHE_PATH), { recursive: true });
    await writeFile(CACHE_PATH, JSON.stringify(current), "utf8");
  } catch {
    /* read-only FS at runtime (Pitfall 4) — cache is best-effort, swallow */
  }
}

/**
 * Fetch stats for one repo via the three GitHub REST endpoints. Returns a
 * `RepoStat` on success (and writes it to the disk cache), or the last-known
 * disk-cached entry on any failure, or `null` when neither is available.
 * Never throws (GH-06).
 */
async function fetchRepoStats(
  owner: string,
  repo: string
): Promise<RepoStat | null> {
  const key = `${owner}/${repo}`;
  try {
    const base = `https://api.github.com/repos/${owner}/${repo}`;
    const init = {
      headers: ghHeaders(),
      next: { revalidate: 86400 } // GH-05 — daily ISR cache
    };
    const [repoRes, langRes, commitsRes] = await Promise.all([
      fetch(base, init),
      fetch(`${base}/languages`, init),
      fetch(`${base}/commits?per_page=1`, init)
    ]);

    for (const res of [repoRes, langRes, commitsRes]) {
      if (!res.ok) {
        if (res.status === 403 || res.status === 429) logRateLimit(res);
        return (await readDiskCache())[key] ?? null;
      }
    }

    const repoJson = (await repoRes.json()) as {
      created_at: string;
      pushed_at: string;
    };
    const languagesJson = (await langRes.json()) as unknown;
    const commits = (await commitsRes.json()) as unknown[];

    // GH-06 — a HTTP 200 with a non-object `languages` body (GitHub breaking
    // its own API contract) would otherwise reach `Object.entries` in
    // combineStats, which runs outside any try/catch and would throw to the
    // caller. Treat a structurally-invalid body as a fetch failure.
    if (
      languagesJson === null ||
      typeof languagesJson !== "object" ||
      Array.isArray(languagesJson)
    ) {
      return (await readDiskCache())[key] ?? null;
    }

    const stat: RepoStat = {
      createdAt: repoJson.created_at,
      pushedAt: repoJson.pushed_at,
      languages: languagesJson as Record<string, number>,
      commitCount: commitCountFromLink(
        commitsRes.headers.get("link"),
        commits.length
      )
    };
    await writeDiskCacheEntry(key, stat);
    return stat;
  } catch {
    return (await readDiskCache())[key] ?? null;
  }
}

/**
 * Combine per-repo stats into a single `GitHubRepoStats` — sum commitCount,
 * merge language byte maps (bytes added per key), earliest createdAt, latest
 * pushedAt. ISO 8601 timestamps sort lexically, so no Date parsing is needed.
 */
function combineStats(stats: RepoStat[]): GitHubRepoStats {
  const languages: Record<string, number> = {};
  for (const stat of stats) {
    for (const [lang, bytes] of Object.entries(stat.languages)) {
      languages[lang] = (languages[lang] ?? 0) + bytes;
    }
  }
  return {
    commitCount: stats.reduce((n, s) => n + s.commitCount, 0),
    languages,
    createdAt: stats.map((s) => s.createdAt).sort()[0],
    pushedAt: stats.map((s) => s.pushedAt).sort().at(-1) as string
  };
}

/**
 * Fetch and combine live GitHub repo statistics across every URL in `repoUrls`.
 * Returns a combined `GitHubRepoStats` when at least one repo fetch succeeds,
 * or `null` when every repo fails or `repoUrls` is empty/absent. Never throws.
 */
export async function getRepoStats(
  repoUrls: string[]
): Promise<GitHubRepoStats | null> {
  const refs = parseRepoUrls(repoUrls);
  if (refs.length === 0) return null;

  if (!process.env.GITHUB_TOKEN && !warned) {
    warned = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[lib/github] GITHUB_TOKEN not set — using unauthenticated GitHub requests (60/hr ceiling)."
      );
    }
  }

  const settled = await Promise.allSettled(
    refs.map(({ owner, repo }) => fetchRepoStats(owner, repo))
  );
  const stats = settled
    .filter(
      (s): s is PromiseFulfilledResult<RepoStat> =>
        s.status === "fulfilled" && s.value !== null
    )
    .map((s) => s.value);

  if (stats.length === 0) return null;
  return combineStats(stats);
}
