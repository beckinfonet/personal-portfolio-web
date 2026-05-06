import type {
  Profile,
  Project,
  Experience,
  Writing,
  ShippedApp,
  StackCategory
} from "./types";

/**
 * Static seed/fallback data for the terminal portfolio.
 *
 * Strategy: real-where-trivial (D-08), "TODO:" markers where Phase 6 fills (D-09).
 * INFRA-05 postbuild grep includes "TODO" — any deploy attempted before Phase 6
 * fills the markers fails the build (D-10 self-enforcement).
 *
 * Real now (per D-08): identity, location, email, real GitHub URL, stack categories.
 * TBD now (per D-09 — Phase 6 fills): bio, highlights, projects, writing, shippedApps, experience.
 *
 * Naming convention: UPPERCASE module-level dataset constants per PATTERNS.md
 * §"UPPERCASE module-level constants" (matches existing STORAGE_KEY precedent;
 * no longer "fallback*" because this is the canonical seed).
 */

/**
 * Career start date for the uptime computation in the shell STATUS block.
 * Update to the actual career start date before Phase 7 deploy. (Phase 6 content pass.)
 */
export const CAREER_START_DATE = new Date("2018-01-01");

export const PROFILE: Profile = {
  name: "Bakytbek Tatibekov",
  shortName: "Bakytbek",
  initials: "BT",
  role: "Sr. Software Engineer",
  location: "TODO: location string",
  email: "beckprograms@gmail.com",
  resumeUrl: "/resume.pdf",
  bio: {
    short: "TODO: short bio (one line, SEO meta-description)",
    long: ["TODO: bio paragraph 1", "TODO: bio paragraph 2"]
  },
  highlights: [
    { value: "TODO", label: "TODO: stat label 1" },
    { value: "TODO", label: "TODO: stat label 2" },
    { value: "TODO", label: "TODO: stat label 3" }
  ],
  socials: [
    {
      label: "GitHub",
      handle: "@beckinfonet",
      url: "https://github.com/beckinfonet",
      kind: "github"
    },
    {
      label: "LinkedIn",
      handle: "TODO: handle",
      url: "TODO: real linkedin url",
      kind: "linkedin"
    }
  ]
};

export const PROJECTS: Project[] = [
  // Phase 6 fills with >=3 real entries. Empty array is acceptable shape-wise;
  // postbuild grep does NOT fire on empty arrays.
];

export const EXPERIENCE: Experience[] = [
  // Phase 6 fills.
];

export const WRITING: Writing[] = [
  // Phase 6 fills (or v1 ships with empty array + "coming soon" UI per CONTENT-04).
];

export const SHIPPED: ShippedApp[] = [
  // Phase 6 fills with real App Store / Play Store URLs.
];

export const STACK: StackCategory[] = [
  { category: "languages", items: ["TypeScript", "Python", "Swift"] },
  { category: "frameworks", items: ["Next.js", "React", "React Native"] },
  { category: "cloud", items: ["AWS"] },
  { category: "ai", items: ["LangChain", "agentic systems"] }
];
