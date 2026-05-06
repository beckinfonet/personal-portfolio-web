// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "projects/ — Bakytbek Tatibekov"
};

export default function ProjectsPage() {
  return (
    <>
      <PromptLine cmd="ls -la projects/" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
