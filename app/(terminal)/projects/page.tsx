// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProjects } from "@/lib/api";
import { getRepoStats } from "@/lib/github";
import { buildStripModel, buildPanelModel } from "@/lib/project-stats";
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

  // Resolve GitHub repo stats for every project in parallel — Promise.all over
  // .map, never sequential awaiting, so one slow repo cannot serialize the page
  // (Pitfall 1). getRepoStats never throws, so no try/catch is needed.
  const stats = await Promise.all(
    projects.map((p) =>
      p.repoUrls?.length ? getRepoStats(p.repoUrls) : Promise.resolve(null)
    )
  );

  const rows = projects.map((project, i) => ({
    project,
    strip: buildStripModel(stats[i]),
    panel: buildPanelModel(stats[i])
  }));

  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <ProjectsView rows={rows} />
    </>
  );
}
