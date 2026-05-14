import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/shell/theme-provider";
import { ShellStateProvider } from "@/app/components/shell/shell-state-provider";
import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script";
import { HeadComment } from "@/app/components/shell/head-comment";
import { JsonLdPerson } from "@/app/components/shell/json-ld-person";
import { getProfile } from "@/lib/api";

// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (Phase 1 D-Pitfall D — do not change.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tatibekov.com";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
  // adjustFontFallback defaults to true — do NOT pass it explicitly (causes TS error in some versions)
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Bakytbek Tatibekov — Sr. Software Engineer",
  description:
    "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
  openGraph: {
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Bakytbek Tatibekov — Sr. Software Engineer",
    description: "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact."
  }
};

// PHASE 5 — separate viewport export per Next 14+ (Pitfall 3 / Pattern 4).
// The theme-color field is DEPRECATED on the metadata export in Next.js 14+;
// the correct location is here on viewport. Per-scheme array emits both
// <meta name="theme-color" media="..."> tags automatically.
// Hex values match app/globals.css `--bg` tokens verbatim (D-15 — do NOT use var(--*),
// Next.js metadata composition rejects CSS variables).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ea" }
  ]
};

// NO "use client" — this file stays RSC (SHELL-02 / Pitfall 9).
// suppressHydrationWarning on <html> is REQUIRED by next-themes.
// Plan 07-10 (DATA-04): async RSC; fetches profile once via getProfile() so JsonLdPerson
// emits the live Mongo-sourced schema.org Person record. lib/api.ts ISR + graceful-fallback
// contract means a static fixture is returned when Railway/Mongo is unreachable.
export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        {/* AccentBootstrapScript runs before paint — reads localStorage["portfolio-accent"]
            and sets --accent-hue on <html>. next-themes auto-injects its own theme script;
            do NOT add a second manual theme script here. (D-08) */}
        <AccentBootstrapScript />
        {/* HeadComment: 6-line lowercase letter for view-source: viewers (DEV-02 / Phase 5). */}
        <HeadComment />
        {/* JsonLdPerson: schema.org Person on every route (SEO-02 / Phase 5). XSS-safe payload.
            Profile prop fed from getProfile() (Plan 07-10) — Mongo-sourced on ISR window. */}
        <JsonLdPerson profile={profile} />
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ShellStateProvider>{children}</ShellStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
