// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getExperience } from "@/lib/api";
import { ExperienceView } from "@/app/components/views/experience-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[3]; // experience

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ExperiencePage() {
  const experience = await getExperience();
  return (
    <>
      <PromptLine cmd="git log --oneline --decorate experience.log" />
      <ExperienceView experience={experience} />
    </>
  );
}
