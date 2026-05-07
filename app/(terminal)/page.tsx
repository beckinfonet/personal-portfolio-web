// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProfile } from "@/lib/api";
import { AboutView } from "@/app/components/views/about-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[0]; // about

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function AboutPage() {
  const profile = await getProfile();
  return (
    <>
      <PromptLine cmd="cat about.md" />
      <AboutView profile={profile} />
    </>
  );
}
