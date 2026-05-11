import { describe, test, expect } from "vitest";
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
