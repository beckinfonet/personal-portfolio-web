import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
