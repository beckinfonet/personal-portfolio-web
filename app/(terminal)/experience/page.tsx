// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "experience.log — Bakytbek Tatibekov"
};

export default function ExperiencePage() {
  return (
    <>
      <PromptLine cmd="git log --oneline --decorate experience.log" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
