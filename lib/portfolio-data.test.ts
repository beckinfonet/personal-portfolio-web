import { describe, test, expect } from "vitest";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PROFILE, PROJECTS, EXPERIENCE, WRITING, SHIPPED, STACK } from "./portfolio-data";

// Phase 6 Wave 0 scaffold. Waves 02-07 extend with per-type content assertions:
// - Wave 02 (profile reshape): PROFILE.bio.long.length >= 2, socials.length === 2
// - Wave 03 (stack rename):    STACK.length >= 1, every entry has category + items[]
// - Wave 04 (experience):       EXPERIENCE.length >= 1 (CONTENT-07)
// - Wave 05 (apps):             SHIPPED.length >= 2, store URLs match /^https?:/ (CONTENT-03)
// - Wave 06 (posts):            WRITING.length >= 1 (CONTENT-04, D-15)
// - Wave 07 (projects):         PROJECTS.length >= 3 (CONTENT-02)
// - Wave 08 (reconcile):        PROFILE.highlights[1].value reconciles SHIPPED.length

describe("portfolio-data shape", () => {
  test("PROFILE has non-empty name", () => {
    expect(PROFILE.name).toBeTruthy();
    expect(PROFILE.name.length).toBeGreaterThan(0);
  });

  test("all dataset exports are arrays where expected", () => {
    expect(Array.isArray(PROJECTS)).toBe(true);
    expect(Array.isArray(EXPERIENCE)).toBe(true);
    expect(Array.isArray(WRITING)).toBe(true);
    expect(Array.isArray(SHIPPED)).toBe(true);
    expect(Array.isArray(STACK)).toBe(true);
  });
});

describe("PROFILE content (Wave 02)", () => {
  test("PROFILE.bio.long has at least 2 paragraphs", () => {
    expect(PROFILE.bio.long.length).toBeGreaterThanOrEqual(2);
    for (const para of PROFILE.bio.long) {
      expect(typeof para).toBe("string");
      expect(para.length).toBeGreaterThan(20);
    }
  });

  test("PROFILE.socials has exactly 2 entries (D-16 freeze: github + linkedin)", () => {
    expect(PROFILE.socials.length).toBe(2);
    const kinds = PROFILE.socials.map((s) => s.kind);
    expect(kinds).toContain("github");
    expect(kinds).toContain("linkedin");
  });

  test("PROFILE.linkedin uses the canonical /in/tatibekov/ handle", () => {
    const linkedin = PROFILE.socials.find((s) => s.kind === "linkedin");
    expect(linkedin).toEqual(
      expect.objectContaining({
        handle: "/in/tatibekov/",
        url: "https://linkedin.com/in/tatibekov/"
      })
    );
  });

  test("PROFILE.highlights has 3 stat cards", () => {
    expect(PROFILE.highlights.length).toBe(3);
    for (const h of PROFILE.highlights) {
      expect(h.value).toBeTruthy();
      expect(h.label).toBeTruthy();
    }
  });

  test("PROFILE has no INFRA-05 forbidden strings", () => {
    const forbidden = /lorem|example\.com|placeholder|Product Studio/i;
    const serialized = JSON.stringify(PROFILE);
    expect(serialized).not.toMatch(forbidden);
    // Also: lowercase 'todo' is allowed in bio prose, but uppercase TODO is not.
    expect(serialized).not.toMatch(/TODO/);
  });
});

describe("STACK content (Wave 03)", () => {
  test("STACK has at least 1 category (CONTENT-06)", () => {
    expect(STACK.length).toBeGreaterThanOrEqual(1);
  });

  test("every STACK entry has non-empty category + non-empty items[]", () => {
    for (const entry of STACK) {
      expect(typeof entry.category).toBe("string");
      expect(entry.category.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.items)).toBe(true);
      expect(entry.items.length).toBeGreaterThan(0);
      for (const item of entry.items) {
        expect(typeof item).toBe("string");
        expect(item.length).toBeGreaterThan(0);
      }
    }
  });

  test("STACK categories are unique (matches Mongo `unique: true` on Stack model)", () => {
    const categories = STACK.map((s) => s.category);
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });
});

describe("EXPERIENCE content (Wave 04)", () => {
  test("EXPERIENCE has at least 1 entry (CONTENT-07)", () => {
    expect(EXPERIENCE.length).toBeGreaterThanOrEqual(1);
  });

  test("every EXPERIENCE entry has all 4 required fields", () => {
    for (const entry of EXPERIENCE) {
      expect(entry.company).toBeTruthy();
      expect(entry.role).toBeTruthy();
      expect(entry.period).toBeTruthy();
      expect(entry.summary).toBeTruthy();
    }
  });

  test("EXPERIENCE has no legacy startDate/endDate/highlights fields", () => {
    for (const entry of EXPERIENCE as unknown as Record<string, unknown>[]) {
      expect(entry.startDate).toBeUndefined();
      expect(entry.endDate).toBeUndefined();
      expect(entry.highlights).toBeUndefined();
    }
  });
});

describe("SHIPPED content (Wave 05)", () => {
  test("SHIPPED has 2 or 3 entries (D-17)", () => {
    expect(SHIPPED.length).toBeGreaterThanOrEqual(2);
    expect(SHIPPED.length).toBeLessThanOrEqual(3);
  });

  test("every SHIPPED entry has non-empty platforms array (CONTENT-03)", () => {
    for (const app of SHIPPED) {
      expect(Array.isArray(app.platforms)).toBe(true);
      expect(app.platforms.length).toBeGreaterThan(0);
      for (const p of app.platforms) {
        expect(["ios", "android"]).toContain(p);
      }
    }
  });

  test("every SHIPPED entry has at least one valid HTTPS store URL (Pitfall 5)", () => {
    const httpsRegex = /^https?:\/\//;
    for (const app of SHIPPED) {
      const hasIos = app.platforms.includes("ios");
      const hasAndroid = app.platforms.includes("android");
      if (hasIos) {
        expect(app.appStoreUrl).toBeTruthy();
        expect(app.appStoreUrl!).toMatch(httpsRegex);
      }
      if (hasAndroid) {
        expect(app.googlePlayUrl).toBeTruthy();
        expect(app.googlePlayUrl!).toMatch(httpsRegex);
      }
    }
  });

  test("SHIPPED has no INFRA-05 forbidden strings or placeholder angle brackets", () => {
    const serialized = JSON.stringify(SHIPPED);
    expect(serialized).not.toMatch(/lorem|example\.com|placeholder|Product Studio/i);
    expect(serialized).not.toMatch(/TODO/);
    expect(serialized).not.toMatch(/<[a-z]/);   // catches "<from", "<app-", etc.
  });
});

describe("WRITING content (Wave 06)", () => {
  test("WRITING has at least 1 entry (CONTENT-04, D-15)", () => {
    expect(WRITING.length).toBeGreaterThanOrEqual(1);
  });

  test("every WRITING entry has all 6 required fields with HTTPS link", () => {
    for (const post of WRITING) {
      expect(post.title).toBeTruthy();
      expect(post.slug).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.readTime).toBeTruthy();
      expect(post.link).toMatch(/^https?:\/\//);
    }
  });

  test("WRITING slugs are unique (mirror of Mongo `unique: true` on slug)", () => {
    const slugs = WRITING.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("PROJECTS content (Wave 07)", () => {
  test("PROJECTS has at least 3 entries (CONTENT-02)", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(3);
  });

  test("every PROJECTS entry has all 7 required fields + HTTPS link", () => {
    for (const p of PROJECTS) {
      expect(p.name).toBeTruthy();
      expect(p.year).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.summary).toBeTruthy();
      expect(Array.isArray(p.tech)).toBe(true);
      expect(p.tech.length).toBeGreaterThan(0);
      expect(p.role).toBeTruthy();
      expect(p.link).toMatch(/^https?:\/\//);
    }
  });

  test("PROJECTS names are unique (mirrors Mongo `unique: true` on name)", () => {
    const names = PROJECTS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("PROFILE.highlights reconciliation (Wave 08, D-17)", () => {
  test("PROFILE.highlights[1].value matches SHIPPED.length OR is a non-apps-count highlight", () => {
    const second = PROFILE.highlights[1];
    if (!second) {
      // Case C: highlights trimmed to 2 — this assertion is moot. Confirm trim.
      expect(PROFILE.highlights.length).toBeLessThanOrEqual(2);
      return;
    }
    if (second.label === "apps shipped") {
      // Case A: numeric reconciliation — value must equal SHIPPED.length
      expect(second.value).toBe(String(SHIPPED.length));
    } else {
      // Case B: replaced with a different highlight — only assert it's non-empty
      expect(second.value).toBeTruthy();
      expect(second.label).toBeTruthy();
    }
  });
});

describe("PROFILE.resumeUrl + resumeDocxUrl (Wave 08)", () => {
  // PROJECT_ROOT relative to this test file (lib/) — vitest cwd is portfolio-web/.
  const PUBLIC_DIR = join(process.cwd(), "public");

  test("PROFILE.resumeUrl is the canonical filename (Pitfall 9)", () => {
    expect(PROFILE.resumeUrl).toBe("/Bakytbek_Tatibekov_Resume.pdf");
  });

  test("PROFILE.resumeUrl resolves to a real %PDF- file in public/", () => {
    const path = join(PUBLIC_DIR, PROFILE.resumeUrl.replace(/^\//, ""));
    expect(existsSync(path)).toBe(true);
    const bytes = readFileSync(path);
    expect(bytes.slice(0, 5).toString("ascii")).toBe("%PDF-");
    // Sanity-bound — same 250KB cap as scripts/check-resume-pdf.mjs.
    expect(statSync(path).size).toBeLessThan(250 * 1024);
  });

  test("PROFILE.resumeDocxUrl (if set) points to a real DOCX (PK\\x03\\x04 magic) in public/", () => {
    if (!PROFILE.resumeDocxUrl) {
      // Empty/undefined → DOCX feature intentionally disabled; nothing to assert.
      return;
    }
    expect(PROFILE.resumeDocxUrl.startsWith("/")).toBe(true);
    const path = join(PUBLIC_DIR, PROFILE.resumeDocxUrl.replace(/^\//, ""));
    expect(existsSync(path)).toBe(true);
    const bytes = readFileSync(path);
    // DOCX is a ZIP container — PK\x03\x04 = 0x504b0304.
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });
});
