// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "about.md — Bakytbek Tatibekov"
};

export default function AboutPage() {
  return (
    <>
      <PromptLine cmd="cat about.md" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
