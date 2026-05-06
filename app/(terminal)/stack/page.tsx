// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "stack.json — Bakytbek Tatibekov"
};

export default function StackPage() {
  return (
    <>
      <PromptLine cmd="cat stack.json | jq" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
