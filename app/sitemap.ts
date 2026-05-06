import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return ROUTES.map((r) => ({
    url: `${baseUrl}${r.pathname}`,
    changeFrequency: "weekly" as const,
    priority: r.slug === null ? 1 : 0.8,
    lastModified: new Date()
  }));
}
