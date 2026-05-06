export interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  socials: SocialLink[];
  resumeUpdatedAt: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  highlights: string[];
}

export interface MobileApp {
  id: string;
  name: string;
  description: string;
  appStoreUrl: string;
  googlePlayUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
}
