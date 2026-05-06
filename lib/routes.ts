/**
 * Single source of truth for terminal-shell routes.
 * Consumed by:
 *   - app/components/shell/sidebar.tsx (Phase 2)
 *   - app/components/shell/command-palette.tsx (Phase 2)
 *   - app/sitemap.ts (Phase 2 — ROUTE-04 iterates)
 *
 * Order in this array is the sidebar render order.
 *
 * Adding an 8th view (e.g. hire-me.txt) is a one-line change here.
 */

export interface Route {
  /** Route segment (matches Next.js folder name). null for index `/`. */
  readonly slug: string | null;
  /** Pathname including leading slash. Always starts with "/". */
  readonly pathname: string;
  /** Visible sidebar label (file metaphor). */
  readonly label: string;
  /** Plain-noun ARIA label for screen readers (per A11Y-04). */
  readonly ariaLabel: string;
  /** Short description for OG meta + palette tooltip. */
  readonly description: string;
}

export const ROUTES = [
  {
    slug: null,
    pathname: "/",
    label: "about.md",
    ariaLabel: "About me",
    description: "About — Sr. Software Engineer; bio, highlights, contact"
  },
  {
    slug: "projects",
    pathname: "/projects",
    label: "projects/",
    ariaLabel: "Projects",
    description: "Projects — engineering work, sorted by year"
  },
  {
    slug: "stack",
    pathname: "/stack",
    label: "stack.json",
    ariaLabel: "Tech stack",
    description: "Tech stack — languages, frameworks, cloud, AI"
  },
  {
    slug: "experience",
    pathname: "/experience",
    label: "experience.log",
    ariaLabel: "Experience",
    description: "Experience — roles, companies, periods, highlights"
  },
  {
    slug: "writing",
    pathname: "/writing",
    label: "writing/",
    ariaLabel: "Writing",
    description: "Writing — technical posts and notes"
  },
  {
    slug: "contact",
    pathname: "/contact",
    label: "contact.sh",
    ariaLabel: "Contact information",
    description: "Contact — email, GitHub, LinkedIn, social profiles"
  },
  {
    slug: "shipped",
    pathname: "/shipped",
    label: "shipped.app",
    ariaLabel: "Shipped apps",
    description: "Shipped apps — App Store and Google Play releases"
  }
] as const satisfies readonly Route[];

/** Type alias for narrowed segment values used by useSelectedLayoutSegment. */
export type RouteSegment = (typeof ROUTES)[number]["slug"];
