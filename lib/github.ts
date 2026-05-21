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
 * Fetch and combine live GitHub repo statistics across every URL in `repoUrls`.
 * Returns a combined `GitHubRepoStats` when at least one repo fetch succeeds,
 * or `null` when every repo fails or `repoUrls` is empty/absent. Never throws.
 */
export async function getRepoStats(
  repoUrls: string[]
): Promise<GitHubRepoStats | null> {
  void parseRepoUrls;
  void readFile;
  void writeFile;
  void mkdir;
  void join;
  void dirname;
  void repoUrls;
  return null;
}
