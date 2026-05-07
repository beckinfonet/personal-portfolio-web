// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProfile } from "@/lib/api";
import { AboutView } from "@/app/components/views/about-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";
import { CAREER_START_DATE } from "@/lib/portfolio-data";
import { formatUptime } from "@/lib/uptime";

const route = ROUTES[0]; // about

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function AboutPage() {
  const profile = await getProfile();
  const uptime = formatUptime(CAREER_START_DATE, new Date());
  return (
    <>
      <PromptLine cmd="cat about.md" />
      <AboutView profile={profile} uptime={uptime} />
    </>
  );
}
