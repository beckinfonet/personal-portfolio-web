import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PROFILE } from "@/lib/portfolio-data";

/**
 * Context passed to every palette verb's action function at runtime.
 * Provided by CommandPalette component when user selects an item.
 */
export interface PaletteActionContext {
  router: AppRouterInstance;
  setOpen: (v: boolean) => void;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  setHue: (hue: string) => void;
}

export interface PaletteVerb {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly keywords: readonly string[];
  readonly action: (ctx: PaletteActionContext) => void;
}

/**
 * All command palette verbs (18 total — PALETTE-02 requires ≥16).
 *
 * Composition:
 *   - 7 navigation   (Open <file-label>)
 *   - 1 download resume
 *   - 1 toggle theme
 *   - 4 set-accent   (matrix, amber, cyan, magenta)
 *   - 2 social opens (GitHub, LinkedIn)
 *   - 1 copy email
 *   - 1 copy GitHub URL
 *   - 1 share view
 *
 * Third social slot is reserved. Add an entry with id "open-social-3" once the developer
 * picks a third public profile (Mastodon / Bluesky / X). Also add the social to
 * PROFILE.socials in lib/portfolio-data.ts at the same time. (Phase 6 content pass.)
 *
 * Alias arrays power the cmdk keyword filter (D-04).
 * Social URLs come from PROFILE.socials so they stay in sync with lib/portfolio-data.ts.
 */
export const PALETTE_VERBS: readonly PaletteVerb[] = [
  {
    id: "open-about",
    label: "Open about.md",
    icon: "◆",
    keywords: ["about", "home", "bio", "who", "name", "intro"],
    action: ({ router, setOpen }) => { router.push("/"); setOpen(false); }
  },
  {
    id: "open-projects",
    label: "Open projects/",
    icon: "▸",
    keywords: ["work", "builds", "code", "projects"],
    action: ({ router, setOpen }) => { router.push("/projects"); setOpen(false); }
  },
  {
    id: "open-stack",
    label: "Open stack.json",
    icon: "{}",
    keywords: ["tech", "skills", "languages", "tools", "stack"],
    action: ({ router, setOpen }) => { router.push("/stack"); setOpen(false); }
  },
  {
    id: "open-experience",
    label: "Open experience.log",
    icon: "≡",
    keywords: ["cv", "history", "jobs", "work", "experience"],
    action: ({ router, setOpen }) => { router.push("/experience"); setOpen(false); }
  },
  {
    id: "open-writing",
    label: "Open writing/",
    icon: "▸",
    keywords: ["blog", "posts", "articles", "writing"],
    action: ({ router, setOpen }) => { router.push("/writing"); setOpen(false); }
  },
  {
    id: "open-contact",
    label: "Open contact.sh",
    icon: "$",
    keywords: ["contact", "reach", "email", "social"],
    action: ({ router, setOpen }) => { router.push("/contact"); setOpen(false); }
  },
  {
    id: "open-shipped",
    label: "Open shipped.app",
    icon: "▸",
    keywords: ["apps", "mobile", "ios", "android", "store", "shipped"],
    action: ({ router, setOpen }) => { router.push("/shipped"); setOpen(false); }
  },
  {
    id: "download-resume",
    label: "Download resume.pdf",
    icon: "↓",
    keywords: ["cv", "resume", "pdf", "download"],
    action: ({ setOpen }) => {
      const a = document.createElement("a");
      a.href = PROFILE.resumeUrl;
      a.download = "Bakytbek_Tatibekov_Resume.pdf";
      a.click();
      setOpen(false);
    }
  },
  {
    id: "toggle-theme",
    label: "Toggle theme",
    icon: "☼",
    keywords: ["dark", "light", "mode", "theme"],
    action: ({ resolvedTheme, setTheme, setOpen }) => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      setOpen(false);
    }
  },
  {
    id: "accent-matrix",
    label: "Set accent: matrix",
    icon: "●",
    keywords: ["green", "default", "accent", "matrix"],
    action: ({ setHue, setOpen }) => { setHue("145"); setOpen(false); }
  },
  {
    id: "accent-amber",
    label: "Set accent: amber",
    icon: "●",
    keywords: ["yellow", "warm", "accent", "amber"],
    action: ({ setHue, setOpen }) => { setHue("75"); setOpen(false); }
  },
  {
    id: "accent-cyan",
    label: "Set accent: cyan",
    icon: "●",
    keywords: ["blue", "teal", "accent", "cyan"],
    action: ({ setHue, setOpen }) => { setHue("200"); setOpen(false); }
  },
  {
    id: "accent-magenta",
    label: "Set accent: magenta",
    icon: "●",
    keywords: ["pink", "purple", "accent", "magenta"],
    action: ({ setHue, setOpen }) => { setHue("340"); setOpen(false); }
  },
  {
    id: "open-github",
    label: "Open GitHub",
    icon: "↗",
    keywords: ["gh", "github", "code"],
    action: ({ setOpen }) => {
      window.open(
        PROFILE.socials.find((s) => s.kind === "github")?.url ?? "https://github.com/beckinfonet",
        "_blank",
        "noopener,noreferrer"
      );
      setOpen(false);
    }
  },
  {
    id: "open-linkedin",
    label: "Open LinkedIn",
    icon: "↗",
    keywords: ["linkedin", "professional"],
    action: ({ setOpen }) => {
      window.open(
        PROFILE.socials.find((s) => s.kind === "linkedin")?.url ?? "https://linkedin.com",
        "_blank",
        "noopener,noreferrer"
      );
      setOpen(false);
    }
  },
  {
    id: "copy-email",
    label: "Copy email",
    icon: "@",
    keywords: ["mail", "address", "email"],
    action: ({ setOpen }) => {
      navigator.clipboard.writeText(PROFILE.email).catch(() => {});
      setOpen(false);
    }
  },
  {
    id: "copy-github-url",
    label: "Copy GitHub URL",
    icon: "⎘",
    keywords: ["github", "gh", "link"],
    action: ({ setOpen }) => {
      const url = PROFILE.socials.find((s) => s.kind === "github")?.url ?? "https://github.com/beckinfonet";
      navigator.clipboard.writeText(url).catch(() => {});
      setOpen(false);
    }
  },
  {
    id: "share-view",
    label: "Share this view",
    icon: "↗",
    keywords: ["copy url", "link", "share"],
    action: ({ setOpen }) => {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
      setOpen(false);
    }
  }
] satisfies readonly PaletteVerb[];
