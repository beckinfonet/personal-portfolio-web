import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";

/**
 * Mock node:fs/promises so the disk-cache layer never touches the real
 * filesystem. `diskStore` is the in-memory stand-in for github-stats.json —
 * tests seed it to exercise the D-06 outage-fallback path.
 */
let diskStore: Record<string, unknown> = {};

vi.mock("node:fs/promises", () => {
  const readFile = vi.fn(async () => JSON.stringify(diskStore));
  const writeFile = vi.fn(async (_path: string, data: string) => {
    diskStore = JSON.parse(data) as Record<string, unknown>;
  });
  const mkdir = vi.fn(async () => undefined);
  return { readFile, writeFile, mkdir, default: { readFile, writeFile, mkdir } };
});

import { getRepoStats } from "./github";

beforeEach(() => {
  diskStore = {};
});

afterEach(() => vi.unstubAllGlobals());

describe("getRepoStats — URL parsing", () => {
  test("empty input returns null", async () => {
    expect(await getRepoStats([])).toBeNull();
  });

  test("an all-non-github.com list returns null", async () => {
    expect(
      await getRepoStats([
        "https://gitlab.com/owner/repo",
        "https://bitbucket.org/owner/repo"
      ])
    ).toBeNull();
  });

  test("a malformed (non-URL) entry is skipped and never throws", async () => {
    expect(await getRepoStats(["not a url", "::::"])).toBeNull();
  });

  test("an entry with no repo segment is skipped and never throws", async () => {
    expect(await getRepoStats(["https://github.com/owner"])).toBeNull();
  });
});

/** Build an OK fetch mock for a single repo with the given fixture values. */
function okFetch(opts: {
  createdAt?: string;
  pushedAt?: string;
  languages?: Record<string, number>;
  commits?: unknown[];
  link?: string | null;
}) {
  return vi.fn(async (url: string, _init?: RequestInit) => {
    void _init;
    if (url.endsWith("/commits?per_page=1")) {
      const headers: Record<string, string> = {
        "content-type": "application/json"
      };
      if (opts.link) headers.link = opts.link;
      return new Response(JSON.stringify(opts.commits ?? [{}]), {
        status: 200,
        headers
      });
    }
    if (url.endsWith("/languages")) {
      return new Response(JSON.stringify(opts.languages ?? { TypeScript: 100 }), {
        status: 200
      });
    }
    return new Response(
      JSON.stringify({
        created_at: opts.createdAt ?? "2026-01-01T00:00:00Z",
        pushed_at: opts.pushedAt ?? "2026-05-01T00:00:00Z"
      }),
      { status: 200 }
    );
  });
}

describe("getRepoStats — auth", () => {
  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  test("sends a bearer Authorization header when GITHUB_TOKEN is set", async () => {
    process.env.GITHUB_TOKEN = "ghp_testtoken";
    const fetchMock = okFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await getRepoStats(["https://github.com/owner/repo"]);

    const headers = fetchMock.mock.calls[0][1]!.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer ghp_testtoken");
  });

  test("sends no Authorization header when GITHUB_TOKEN is absent", async () => {
    delete process.env.GITHUB_TOKEN;
    const fetchMock = okFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await getRepoStats(["https://github.com/owner/repo"]);

    const headers = fetchMock.mock.calls[0][1]!.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers["X-GitHub-Api-Version"]).toBe("2022-11-28");
  });
});

describe("getRepoStats — endpoints", () => {
  test("calls all three repo endpoints with revalidate 86400", async () => {
    const fetchMock = okFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await getRepoStats(["https://github.com/owner/repo"]);

    const urls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(urls.some((u) => u === "https://api.github.com/repos/owner/repo")).toBe(
      true
    );
    expect(urls.some((u) => u.endsWith("/languages"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/commits?per_page=1"))).toBe(true);
    for (const call of fetchMock.mock.calls) {
      expect(call[1]!.next).toEqual({ revalidate: 86400 });
    }
  });

  test("dedupes case-variant repo URLs to one fetch set per owner/repo", async () => {
    const fetchMock = okFetch({});
    vi.stubGlobal("fetch", fetchMock);

    await getRepoStats([
      "https://github.com/Owner/Repo",
      "https://github.com/owner/repo"
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe("getRepoStats — Link-header commit count", () => {
  test("commit count comes from the Link header rel=last page", async () => {
    const link =
      '<https://api.github.com/repositories/1/commits?per_page=1&page=2>; rel="next", ' +
      '<https://api.github.com/repositories/1/commits?per_page=1&page=247>; rel="last"';
    vi.stubGlobal("fetch", okFetch({ link, commits: [{}] }));

    const stats = await getRepoStats(["https://github.com/owner/repo"]);
    expect(stats?.commitCount).toBe(247);
  });

  test("commit count falls back to the array length when no Link header", async () => {
    vi.stubGlobal("fetch", okFetch({ link: null, commits: [{}] }));

    const stats = await getRepoStats(["https://github.com/owner/repo"]);
    expect(stats?.commitCount).toBe(1);
  });

  test("an empty repo with no Link header yields commitCount 0", async () => {
    vi.stubGlobal("fetch", okFetch({ link: null, commits: [] }));

    const stats = await getRepoStats(["https://github.com/owner/repo"]);
    expect(stats?.commitCount).toBe(0);
  });
});

describe("getRepoStats — combine", () => {
  test("merges language byte maps across two repos, summing shared keys", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const repoB = url.includes("/owner/repo-b");
        if (url.endsWith("/commits?per_page=1")) {
          return new Response(JSON.stringify([{}]), { status: 200 });
        }
        if (url.endsWith("/languages")) {
          return new Response(
            JSON.stringify(
              repoB ? { TypeScript: 500, CSS: 100 } : { TypeScript: 1000 }
            ),
            { status: 200 }
          );
        }
        return new Response(
          JSON.stringify(
            repoB
              ? { created_at: "2024-06-01T00:00:00Z", pushed_at: "2026-02-01T00:00:00Z" }
              : { created_at: "2025-01-01T00:00:00Z", pushed_at: "2026-05-01T00:00:00Z" }
          ),
          { status: 200 }
        );
      })
    );

    const stats = await getRepoStats([
      "https://github.com/owner/repo-a",
      "https://github.com/owner/repo-b"
    ]);
    expect(stats?.languages).toEqual({ TypeScript: 1500, CSS: 100 });
    expect(stats?.createdAt).toBe("2024-06-01T00:00:00Z");
    expect(stats?.pushedAt).toBe("2026-05-01T00:00:00Z");
    expect(stats?.commitCount).toBe(2);
  });

  test("returns a combined object when at least one repo succeeds", async () => {
    vi.stubGlobal("fetch", okFetch({ languages: { Go: 42 } }));

    const stats = await getRepoStats(["https://github.com/owner/repo"]);
    expect(stats).not.toBeNull();
    expect(stats?.languages).toEqual({ Go: 42 });
  });
});

describe("getRepoStats — null paths", () => {
  test("returns null when every repo 404s", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 }))
    );
    expect(
      await getRepoStats(["https://github.com/owner/private"])
    ).toBeNull();
  });

  test("returns null when every repo 5xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Server Error", { status: 503 }))
    );
    expect(await getRepoStats(["https://github.com/owner/repo"])).toBeNull();
  });

  test("returns null (never throws) when every fetch network-errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getRepoStats(["https://github.com/owner/repo"])).toBeNull();
  });

  test("logs rate-limit headers on a 403 and treats the repo as failed", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("rate limited", {
            status: 403,
            headers: {
              "x-ratelimit-remaining": "0",
              "x-ratelimit-reset": "1779407450"
            }
          })
      )
    );

    const stats = await getRepoStats(["https://github.com/owner/repo"]);
    expect(stats).toBeNull();
    const logged = warnSpy.mock.calls.flat().join(" ");
    expect(logged).toContain("0");
    expect(logged).toContain("1779407450");
    warnSpy.mockRestore();
  });
});
