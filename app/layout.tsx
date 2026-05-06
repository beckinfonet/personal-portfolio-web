import type { Metadata } from "next";
import "./globals.css";

// Use logical OR (||) not nullish coalescing (??) — empty-string env vars bypass ??
// and produce `Invalid URL` runtime errors. (See RESEARCH.md Pitfall D.)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Beck Maldin | Mobile & Full-Stack Engineer",
  description:
    "Recruiter-friendly portfolio featuring mobile apps, experience timeline, skills, and technical writing.",
  openGraph: {
    title: "Beck Maldin Portfolio",
    description: "Mobile and full-stack engineering portfolio.",
    type: "website"
  }
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("portfolio-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch {}
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
