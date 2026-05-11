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
 * Strategy: real-where-trivial (D-08), generic temporary stand-in copy elsewhere
 * until Phase 6 fills real content (D-09).
 *
 * Real now (per D-08): identity, email, real GitHub URL, stack categories.
 * Generic-temporary now (per D-09 — Phase 6 fills): location, bio, highlights,
 * projects, writing, shippedApps, experience, LinkedIn handle/url.
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
  location: "Remote — open globally",
  email: "beckprograms@gmail.com",
  resumeUrl: "/resume.pdf",
  bio: {
    short: "Senior software engineer focused on developer tools, infrastructure, and TypeScript-first web apps.",
    long: [
      "I build pragmatic systems — clean data models, RSC-first frontends, and CI gates that catch regressions before they ship.",
      "Currently exploring agentic developer workflows and the seam between AI tooling and traditional engineering practice."
    ]
  },
  highlights: [
    { value: "12+", label: "years engineering" },
    { value: "4", label: "apps shipped" },
    { value: "OSS", label: "open-source contributor" }
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
      handle: "in/bakytbek",
      url: "https://linkedin.com/in/bakytbek",
      kind: "linkedin"
    }
  ]
};

export const PROJECTS: Project[] = [
  // Phase 6 fills with >=3 real entries. Empty array is acceptable shape-wise;
  // postbuild grep does NOT fire on empty arrays.
];

export const EXPERIENCE: Experience[] = [
  {
    company: "Independent",
    role: "Sr. Software Engineer",
    period: "2022 - present",
    summary: "Building developer tools and AI-assisted engineering workflows; full-stack TypeScript with a focus on RSC, infrastructure-as-code, and agentic systems."
  },
  {
    company: "Confidential",
    role: "Senior Engineer",
    period: "2019 - 2022",
    summary: "Led API modernization and CI reliability work on a high-throughput service; reduced p95 latency by 40% via query plan tuning and Node 18 upgrade."
  },
  {
    company: "Confidential",
    role: "Software Engineer",
    period: "2016 - 2019",
    summary: "Shipped cross-platform mobile + web features in Swift, Kotlin, and React Native; collaborated on store-published apps."
  }
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
