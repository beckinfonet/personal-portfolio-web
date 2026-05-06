import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/shell/theme-provider";
import { ShellStateProvider } from "@/app/components/shell/shell-state-provider";
import { AccentBootstrapScript } from "@/app/components/shell/accent-bootstrap-script";

// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (Phase 1 D-Pitfall D — do not change.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  }
};

// NO "use client" — this file stays RSC (SHELL-02 / Pitfall 9).
// suppressHydrationWarning on <html> is REQUIRED by next-themes.
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        {/* AccentBootstrapScript runs before paint — reads localStorage["portfolio-accent"]
            and sets --accent-hue on <html>. next-themes auto-injects its own theme script;
            do NOT add a second manual theme script here. (D-08) */}
        <AccentBootstrapScript />
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
