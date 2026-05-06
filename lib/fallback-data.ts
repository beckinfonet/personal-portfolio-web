import type { BlogPost, Experience, MobileApp, Profile, Skill } from "./types";

export const fallbackProfile: Profile = {
  name: "Beck Maldin",
  title: "Senior Mobile + Full-Stack Engineer",
  bio: "I build reliable product experiences across iOS, Android, and modern web stacks.",
  location: "Remote (US)",
  email: "beck@example.com",
  resumeUpdatedAt: "2026-05-05",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" }
  ]
};

export const fallbackSkills: Skill[] = [
  { id: "1", name: "TypeScript", category: "Frontend" },
  { id: "2", name: "Next.js", category: "Frontend" },
  { id: "3", name: "React Native", category: "Mobile" },
  { id: "4", name: "Node.js", category: "Backend" }
];

export const fallbackExperience: Experience[] = [
  {
    id: "1",
    role: "Senior Software Engineer",
    company: "Product Studio",
    startDate: "2022-01",
    endDate: null,
    highlights: ["Led mobile architecture", "Improved release velocity by 35%"]
  }
];

export const fallbackApps: MobileApp[] = [
  {
    id: "1",
    name: "Focus Tracker",
    description: "Habit tracking app with analytics and reminders.",
    appStoreUrl: "https://apps.apple.com/",
    googlePlayUrl: "https://play.google.com/store"
  }
];

export const fallbackPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building resilient mobile features",
    slug: "resilient-mobile-features",
    excerpt: "A practical playbook for building and shipping robust mobile features.",
    publishedAt: "2026-04-15"
  }
];
