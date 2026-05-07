// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { ProjectsView } from "@/app/components/views/projects-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[1]; // projects

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView projects={projects} />
    </>
  );
}
