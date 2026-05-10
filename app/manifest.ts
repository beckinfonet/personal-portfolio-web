// app/manifest.ts
// NO "use client" — Next.js metadata file convention RSC.
// Minimal Web App Manifest per D-14: no PWA install push, no offline runtime.
// icons: [] is intentional — Next.js auto-includes app/icon.tsx and app/apple-icon.tsx
// when those files exist (Pitfall 12). Manual entries would duplicate.
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bakytbek Tatibekov — Sr. Software Engineer",
    short_name: "bakytbek.dev",
    description:
      "Terminal-styled portfolio — engineering work, shipped apps, tech stack, and contact.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0c0b",
    theme_color: "#0a0c0b",
    icons: []
  };
}
