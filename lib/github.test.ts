import { describe, test, expect, vi, afterEach } from "vitest";
import { getRepoStats } from "./github";

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
