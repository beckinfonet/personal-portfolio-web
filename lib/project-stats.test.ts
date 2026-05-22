import { describe, test, expect } from "vitest";
import {
  topLanguages,
  formatDuration,
  relativeTime,
  monthYear,
  buildStripModel,
  buildPanelModel,
  LANG_ABBREV
} from "./project-stats";
import type { GitHubRepoStats } from "./types";

describe("topLanguages", () => {
  test("total of 0 bytes returns an empty array", () => {
    expect(topLanguages({}, 3)).toEqual([]);
  });

  test("a language at exactly 1% is kept", () => {
    // 99 bytes + 1 byte = 100 total; the 1-byte language is exactly 1%.
    const result = topLanguages({ TypeScript: 99, CSS: 1 }, Infinity);
    expect(result.map((l) => l.name)).toEqual(["TypeScript", "CSS"]);
  });

  test("a language under 1% is dropped", () => {
    // 996 + 4 = 1000 total; CSS is 0.4% → dropped below the floor.
    const result = topLanguages({ TypeScript: 996, CSS: 4 }, Infinity);
    expect(result.map((l) => l.name)).toEqual(["TypeScript"]);
  });

  test("result is sorted by bytes descending", () => {
    const result = topLanguages(
      { CSS: 100, TypeScript: 500, JavaScript: 300 },
      Infinity
    );
    expect(result.map((l) => l.name)).toEqual([
      "TypeScript",
      "JavaScript",
      "CSS"
    ]);
  });

  test("limit of 3 slices to the top 3", () => {
    const result = topLanguages(
      { A: 500, B: 400, C: 300, D: 200, E: 100 },
      3
    );
    expect(result.map((l) => l.name)).toEqual(["A", "B", "C"]);
  });

  test("limit of Infinity returns every surviving language", () => {
    const result = topLanguages(
      { A: 500, B: 400, C: 300, D: 200, E: 100 },
      Infinity
    );
    expect(result.map((l) => l.name)).toEqual(["A", "B", "C", "D", "E"]);
  });

  test("each entry exposes name, bytes, and pct", () => {
    const result = topLanguages({ TypeScript: 750, CSS: 250 }, Infinity);
    expect(result[0]).toEqual({ name: "TypeScript", bytes: 750, pct: 75 });
    expect(result[1]).toEqual({ name: "CSS", bytes: 250, pct: 25 });
  });
});

describe("formatDuration", () => {
  test("under one year produces 'Nmo'", () => {
    // createdAt 4 months before now → "4mo"
    expect(
      formatDuration("2026-01-15T00:00:00Z", new Date("2026-05-15T00:00:00Z"))
    ).toBe("4mo");
  });

  test("a year or above produces 'Ny Nmo'", () => {
    // 14 months → "1y 2mo"
    expect(
      formatDuration("2025-01-15T00:00:00Z", new Date("2026-03-15T00:00:00Z"))
    ).toBe("1y 2mo");
  });

  test("exactly one year produces '1y 0mo'", () => {
    expect(
      formatDuration("2025-05-15T00:00:00Z", new Date("2026-05-15T00:00:00Z"))
    ).toBe("1y 0mo");
  });

  test("a sub-month range is guarded to '0mo'", () => {
    expect(
      formatDuration("2026-05-10T00:00:00Z", new Date("2026-05-20T00:00:00Z"))
    ).toBe("0mo");
  });

  test("a negative range is guarded to '0mo'", () => {
    expect(
      formatDuration("2026-06-10T00:00:00Z", new Date("2026-05-20T00:00:00Z"))
    ).toBe("0mo");
  });
});

describe("relativeTime", () => {
  test("same day produces 'today'", () => {
    expect(
      relativeTime("2026-05-21T02:00:00Z", new Date("2026-05-21T20:00:00Z"))
    ).toBe("today");
  });

  test("one day ago produces '1 day ago'", () => {
    expect(
      relativeTime("2026-05-20T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("1 day ago");
  });

  test("under 30 days produces 'N days ago'", () => {
    expect(
      relativeTime("2026-05-01T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("20 days ago");
  });

  test("one month ago produces '1 month ago'", () => {
    expect(
      relativeTime("2026-04-16T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("1 month ago");
  });

  test("under 12 months produces 'N months ago'", () => {
    expect(
      relativeTime("2026-01-01T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("4 months ago");
  });

  test("one year ago produces '1 year ago'", () => {
    expect(
      relativeTime("2025-05-01T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("1 year ago");
  });

  test("multiple years ago produces 'N years ago'", () => {
    expect(
      relativeTime("2023-01-01T00:00:00Z", new Date("2026-05-21T00:00:00Z"))
    ).toBe("3 years ago");
  });
});

describe("monthYear", () => {
  test("a January 2026 ISO date renders 'Jan 2026'", () => {
    expect(monthYear("2026-01-15T00:00:00Z")).toBe("Jan 2026");
  });

  test("uses UTC so a late-day ISO date stays in the same month", () => {
    expect(monthYear("2026-03-31T23:00:00Z")).toBe("Mar 2026");
  });
});

const SAMPLE_STATS: GitHubRepoStats = {
  createdAt: "2026-01-15T00:00:00Z",
  pushedAt: "2026-05-18T00:00:00Z",
  languages: {
    TypeScript: 6800,
    JavaScript: 1500,
    CSS: 1200,
    Swift: 400,
    Python: 90,
    Shell: 10
  },
  commitCount: 247
};
// Total = 10000 bytes. pct: TS 68, JS 15, CSS 12, Swift 4, Python 0.9, Shell 0.1.
// Python (0.9%) and Shell (0.1%) fall below the 1% floor and are dropped.

describe("buildStripModel", () => {
  test("null stats return null so no strip renders", () => {
    expect(buildStripModel(null, new Date("2026-05-21T00:00:00Z"))).toBeNull();
  });

  test("valid stats produce a StripModel with the top 3 abbreviated languages", () => {
    const model = buildStripModel(
      SAMPLE_STATS,
      new Date("2026-05-15T00:00:00Z")
    );
    expect(model).not.toBeNull();
    // top 3 by bytes post-floor: TypeScript, JavaScript, CSS
    // TypeScript → TS, JavaScript → JS via LANG_ABBREV; CSS stays CSS verbatim.
    expect(model!.languages).toEqual(["TS", "JS", "CSS"]);
  });

  test("commitCount passes through unchanged", () => {
    const model = buildStripModel(
      SAMPLE_STATS,
      new Date("2026-05-15T00:00:00Z")
    );
    expect(model!.commitCount).toBe(247);
  });

  test("duration is the formatted createdAt-to-now string", () => {
    const model = buildStripModel(
      SAMPLE_STATS,
      new Date("2026-05-15T00:00:00Z")
    );
    expect(model!.duration).toBe("4mo");
  });

  test("a language absent from LANG_ABBREV renders its full GitHub name (D-06)", () => {
    // Swift is intentionally NOT in the map — renders verbatim, no clipping.
    const swiftStats: GitHubRepoStats = {
      createdAt: "2026-01-15T00:00:00Z",
      pushedAt: "2026-05-18T00:00:00Z",
      languages: { Swift: 9000, TypeScript: 1000 },
      commitCount: 10
    };
    const model = buildStripModel(
      swiftStats,
      new Date("2026-05-15T00:00:00Z")
    );
    expect(model!.languages).toEqual(["Swift", "TS"]);
  });
});

describe("buildPanelModel", () => {
  test("null stats return null so the Tech highlights block is omitted", () => {
    expect(buildPanelModel(null, new Date("2026-05-21T00:00:00Z"))).toBeNull();
  });

  test("breakdown holds up to 5 entries with FULL GitHub names and rounded pct (D-07)", () => {
    const model = buildPanelModel(
      SAMPLE_STATS,
      new Date("2026-05-21T00:00:00Z")
    );
    expect(model).not.toBeNull();
    // post-floor survivors: TS 68, JS 15, CSS 12, Swift 4 (Python/Shell dropped)
    expect(model!.breakdown).toEqual([
      { name: "TypeScript", pct: 68 },
      { name: "JavaScript", pct: 15 },
      { name: "CSS", pct: 12 },
      { name: "Swift", pct: 4 }
    ]);
  });

  test("breakdown caps at 5 entries and otherPct absorbs ranks 6+", () => {
    const sixLangStats: GitHubRepoStats = {
      createdAt: "2026-01-15T00:00:00Z",
      pushedAt: "2026-05-18T00:00:00Z",
      languages: {
        A: 4000,
        B: 2500,
        C: 1500,
        D: 1000,
        E: 700,
        F: 300
      },
      commitCount: 5
    };
    // Total 10000. F is 3% → survives the floor; rank 6 → other bucket.
    const model = buildPanelModel(
      sixLangStats,
      new Date("2026-05-21T00:00:00Z")
    );
    expect(model!.breakdown.map((b) => b.name)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E"
    ]);
    expect(model!.otherPct).toBe(3);
  });

  test("commitCount passes through unchanged", () => {
    const model = buildPanelModel(
      SAMPLE_STATS,
      new Date("2026-05-21T00:00:00Z")
    );
    expect(model!.commitCount).toBe(247);
  });

  test("durationLine starts with 'In development since '", () => {
    const model = buildPanelModel(
      SAMPLE_STATS,
      new Date("2026-05-21T00:00:00Z")
    );
    expect(model!.durationLine).toMatch(/^In development since /);
    expect(model!.durationLine).toBe("In development since Jan 2026 — 4mo");
  });

  test("lastActive starts with 'Last active '", () => {
    const model = buildPanelModel(
      SAMPLE_STATS,
      new Date("2026-05-21T00:00:00Z")
    );
    expect(model!.lastActive).toMatch(/^Last active /);
    expect(model!.lastActive).toBe("Last active 3 days ago");
  });
});

describe("LANG_ABBREV", () => {
  test("contains the curated TypeScript / JavaScript / Python entries", () => {
    expect(LANG_ABBREV.TypeScript).toBe("TS");
    expect(LANG_ABBREV.JavaScript).toBe("JS");
    expect(LANG_ABBREV.Python).toBe("Py");
  });
});
