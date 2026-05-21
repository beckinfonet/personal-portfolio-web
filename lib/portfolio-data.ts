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
 * Real now (per D-08): identity, email, real GitHub/LinkedIn URLs, stack
 * categories.
 * Generic-temporary now (per D-09 — Phase 6 fills): location, bio, highlights,
 * projects, writing, shippedApps, experience.
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
  resumeUrl: "/Bakytbek_Tatibekov_Resume.pdf",
  resumeDocxUrl: "/Bakytbek_Tatibekov_Resume.docx",
  bio: {
    short: "Senior software engineer focused on developer tools, infrastructure, and TypeScript-first web apps.",
    long: [
      "I build pragmatic systems — clean data models, RSC-first frontends, and CI gates that catch regressions before they ship.",
      "Currently exploring agentic developer workflows and the seam between AI tooling and traditional engineering practice."
    ]
  },
  highlights: [
    { value: "12+", label: "years engineering" },
    { value: "2", label: "apps shipped" },
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
      handle: "/in/tatibekov/",
      url: "https://linkedin.com/in/tatibekov/",
      kind: "linkedin"
    }
  ]
};

export const PROJECTS: Project[] = [
  // D-14 mirror of portfolio-services/src/seed/projects.json — byte-identical content.
  // Phase 8 (SCHEMA-04): reconciled to the 4 live projects production Mongo serves;
  // each carries the new optional repoUrls?: string[] field (D-04/D-06).
  {
    name: "Validation Ledger",
    year: "2026",
    status: "shipped",
    summary: "Fight against freight fraud, chameleon carriers, cluster theft and identity continuity",
    tech: ["Swift", "NodeJS", "TypeScript", "Fastify", "Postgres", "Stripe"],
    role: "lead",
    link: "https://github.com/beckinfonet/validation-ledger-mobile",
    repoUrls: ["https://github.com/beckinfonet/validation-ledger-mobile"]
  },
  {
    name: "Looper",
    year: "2026",
    status: "shipped",
    summary: "Text based app for communicating with businesses. Automated reservations and auto-confirmations",
    tech: ["Express", "MongoDB", "TypeScript", "Jest", "Railway", "LangChain", "OpenAI", "Anthropic/Claude"],
    role: "lead",
    link: "https://github.com/beckinfonet/looper-agentic",
    repoUrls: ["https://github.com/beckinfonet/LooperMobile", "https://github.com/beckinfonet/looper-agentic"]
  },
  {
    name: "MoveIn: Real Estate",
    year: "2026",
    status: "shipped",
    summary: "3D virtual tours for real estate professionals and consumers",
    tech: ["React Native", "React", "TypeScript", "Vitest", "Playwright"],
    role: "lead",
    link: "https://apps.apple.com/us/app/movein-real-estate/id6758697464",
    repoUrls: ["https://github.com/beckinfonet/jaytap-mobile", "https://github.com/beckinfonet/JayTap-services"]
  },
  {
    name: "CarEx",
    year: "2025",
    status: "active",
    summary: "Buying and Selling cars. Marketplace in Central Asia",
    tech: ["Claude", "Anthropic SDK", "Bash", "TypeScript"],
    role: "lead",
    link: "https://github.com/beckinfonet",
    repoUrls: ["https://github.com/beckinfonet/CarEx", "https://github.com/beckinfonet/carEx-services"]
  }
];

export const EXPERIENCE: Experience[] = [
  // D-14 mirror of portfolio-services/src/seed/experience.json — byte-identical content.
  {
    company: "Independent",
    role: "Sr. Software Engineer",
    period: "2022 - present",
    location: "Remote",
    employmentType: "Full-time",
    summary: "Leading AI-native product work — agentic booking, identity verification, and MCP integration.",
    bullets: [
      "Designed and shipped the MCP integration layer connecting agentic flows to backend services and external APIs.",
      "Led a 4-engineer team building the agentic booking system end-to-end, from data model to chat-driven UX.",
      "Cut identity-fraud onboarding incidents ~60% by introducing a multi-signal verification pipeline."
    ],
    tech: ["TypeScript", "React", "Node.js", "LangChain", "Postgres", "AWS"]
  },
  {
    company: "Confidential",
    role: "Senior Engineer",
    period: "2019 - 2022",
    location: "Hybrid",
    employmentType: "Full-time",
    summary: "Led API modernization and CI reliability work on a high-throughput service.",
    bullets: [
      "Reduced p95 API latency by 40% via query plan tuning and a Node 18 runtime upgrade.",
      "Cut CI flake rate from ~12% to under 2% by isolating stateful test fixtures and parallelising the slow path.",
      "Mentored two junior engineers through their first production on-call rotations."
    ],
    tech: ["TypeScript", "Node.js", "Express", "Postgres", "GitHub Actions"]
  },
  {
    company: "Confidential",
    role: "Software Engineer",
    period: "2016 - 2019",
    location: "Onsite",
    employmentType: "Full-time",
    summary: "Shipped cross-platform mobile + web features in Swift, Kotlin, and React Native.",
    bullets: [
      "Built shared React Native modules consumed by both the iOS and Android store-published apps.",
      "Owned the in-app payments flow end-to-end, integrating Stripe SDKs on both platforms.",
      "Collaborated with design to implement the first dark-mode pass across all primary user flows."
    ],
    tech: ["Swift", "Kotlin", "React Native", "TypeScript"]
  }
];

export const WRITING: Writing[] = [
  // D-14 mirror of portfolio-services/src/seed/posts.json — byte-identical content.
  // D-15: v1 ships exactly 1 post. CONTENT-04 satisfied.
  {
    title: "RSC Discipline: Keeping the Persistent Shell Pure",
    slug: "rsc-discipline-persistent-shell",
    excerpt: "Building a terminal-aesthetic portfolio in Next.js 15 where only four client islands carry 'use client', and what that buys you when the rest is RSC.",
    date: "May 2026",
    readTime: "6 min read",
    link: "https://github.com/beckinfonet/portfolio-web"
  }
];

export const SHIPPED: ShippedApp[] = [
  // Entries mirrored from portfolio-services/src/seed/apps.json (D-14).
  // Wave 08 reconciliation: PROFILE.highlights[1].value matches SHIPPED.length=2 ("2 apps shipped").
  // Wave 08 content swap: developer-supplied real apps CarEx + MoveIn (orchestrator extension 2).
  {
    name: "CarEx",
    platforms: ["ios", "android"],
    appStoreUrl: "https://apps.apple.com/us/app/carex-marketplace/id6758438618",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.carex.market",
    role: "lead",
    year: "2025",
    summary: "Vehicle marketplace — iOS + Android consumer marketplace app for buying and selling vehicles."
  },
  {
    name: "MoveIn",
    platforms: ["ios", "android"],
    appStoreUrl: "https://apps.apple.com/us/app/movein-real-estate/id6758697464",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.movein",
    role: "lead",
    year: "2025",
    summary: "Real estate listings — iOS + Android app for browsing rental and for-sale property listings."
  }
];

export const STACK: StackCategory[] = [
  { category: "languages", items: ["TypeScript", "Python", "Swift"] },
  { category: "frameworks", items: ["Next.js", "React", "React Native"] },
  { category: "cloud", items: ["AWS"] },
  { category: "ai", items: ["LangChain", "agentic systems"] }
];
