/**
 * Terminal Portfolio domain types — single source of truth shared with sibling
 * portfolio-services backend (per ARCHITECTURE.md hand-mirrored discipline).
 *
 * Field shapes are derived from design_handoff_terminal_portfolio/app.jsx.
 * Backend changes ship as paired commits per CLAUDE.md Brownfield discipline.
 */

/** A single accent-block stat card on the about view (e.g. "7+ Years shipping"). */
export interface Highlight {
  /** Large accent-colored value text, 22px/700. e.g. "7+", "AWS", "AI". */
  value: string;
  /** Muted 11px label below the value. e.g. "Years shipping". */
  label: string;
}

/** Bio paragraphs split for short blurbs vs. full about-view body. */
export interface Bio {
  /** One-line short bio for SEO meta-description and JSON-LD `description` field. */
  short: string;
  /** Two-paragraph long bio rendered on about view (max 68ch). */
  long: string[];
}

/** A social/contact link rendered in palette + about + contact views. */
export interface Social {
  /** Display label, e.g. "GitHub", "LinkedIn", "Mastodon". Renders lowercased + "/" suffix in about. */
  label: string;
  /** Short handle for contact view, e.g. "@bakytbek". */
  handle: string;
  /** Full external URL, https only (validated in Phase 6 / BACKEND-04). */
  url: string;
  /** Discriminator for contact-view label column ordering / icons. */
  kind: "github" | "linkedin" | "mastodon" | "bluesky" | "x" | "email" | "other";
}

/** Top-level Profile — the about/contact-view payload. */
export interface Profile {
  /** Full name, e.g. "Bakytbek Tatibekov". */
  name: string;
  /** Short name for breadcrumb / palette, e.g. "Bakytbek". */
  shortName: string;
  /** Two-letter initials for avatar fallback, e.g. "BT". */
  initials: string;
  /** Job title rendered in `// Sr. Software Engineer` accent subline. */
  role: string;
  /** Plain location string, e.g. "Almaty, Kazakhstan" or "Remote (UTC+5)". */
  location: string;
  /** Real email address; rendered as mailto + copyable plain text. */
  email: string;
  /** Path to the resume PDF; defaults to "/Bakytbek_Tatibekov_Resume.pdf". */
  resumeUrl: string;
  /** Optional path to the DOCX (Word) version of the resume — recruiter convenience download. Empty/undefined hides the secondary link. */
  resumeDocxUrl?: string;
  /** Short and long bio. */
  bio: Bio;
  /** Highlight stat cards for about view (3 entries expected). */
  highlights: Highlight[];
  /** Ordered social links (sidebar-render order). */
  socials: Social[];
}

/** A single projects/ view entry. */
export interface Project {
  /** Project name, accent 15px/600. */
  name: string;
  /** Year string (e.g. "2024", "2023"). Sorted desc by view. */
  year: string;
  /** Status string (e.g. "shipped", "active", "archived"). Renders warn-yellow. */
  status: string;
  /** 1-2 line summary, 13px body. */
  summary: string;
  /** Tech chips list. e.g. ["TypeScript", "Next.js", "AWS"]. */
  tech: string[];
  /** Role on project, e.g. "lead", "ic". Right-column muted text. */
  role: string;
  /** External link to live site / repo / case study. https only. */
  link: string;
  /**
   * Optional public GitHub repo URLs for the v1.1 GitHub-stats fetch — Phase 9
   * combines stats (commits, languages, activity) across all entries. Distinct
   * from the polymorphic `link` field, which may point at a live site, App
   * Store page, or case study. Omitted when a project has no public repo.
   */
  repoUrls?: string[];
}

/** A single experience.log view entry. */
export interface Experience {
  /** Company name, muted "@ company" rendering. */
  company: string;
  /** Job title, accent 600. */
  role: string;
  /** Period string, e.g. "2022 - present", "2019 - 2022". Right-aligned muted 12px. */
  period: string;
  /** Lead-paragraph summary, max 68ch, repurposed as the 1-2 sentence intro above bullets (spec §1). */
  summary: string;
  /** Diff-add-style achievement bullets, rendered with "+" markers (spec §1). Empty array allowed. */
  bullets: string[];
  /** Tech chip row rendered after STACK label (spec §1). Empty array allowed. */
  tech: string[];
  /** Optional employment location, e.g. "Remote", "Hybrid", "Onsite — NYC". Renders as " · {location}" in sub-line (spec §1). */
  location?: string;
  /** Optional employment type, e.g. "Full-time", "Contract". Renders as " · {employmentType}" in sub-line (spec §1). */
  employmentType?: string;
}

/** A single writing/ view post. */
export interface Writing {
  /** Post title, accent 16px/600. Prefixed with "›". */
  title: string;
  /** Date string for micro-meta line, e.g. "April 2026". Uppercased on render. */
  date: string;
  /** Read-time string, e.g. "5 min read". Joined with date by " · ". */
  readTime: string;
  /** Excerpt, 13px body, max 64ch. */
  excerpt: string;
  /** External link to full post. https only. */
  link: string;
  /** URL slug for sitemap entries (Phase 6 — initial v1 may have empty list). */
  slug: string;
}

/** A single shipped.app view entry — the 7th view (added beyond handoff). */
export interface ShippedApp {
  /** App name, accent 600. */
  name: string;
  /** Platforms list — limited to two for v1. */
  platforms: ReadonlyArray<"ios" | "android">;
  /** App Store URL — required if platforms includes "ios". */
  appStoreUrl?: string;
  /** Google Play URL — required if platforms includes "android". */
  googlePlayUrl?: string;
  /** Role on app, e.g. "lead", "co-creator". */
  role: string;
  /** Year shipped or year of major release. */
  year: string;
  /** Short summary line. */
  summary?: string;
}

/** A category in stack.json view — rendered as `"key": ["item1", "item2"]`. */
export interface StackCategory {
  /** Category name, e.g. "languages", "frameworks", "cloud", "ai". Renders warn-yellow string. */
  category: string;
  /** Items list, e.g. ["TypeScript", "Python"]. Renders accent string array. */
  items: string[];
}
