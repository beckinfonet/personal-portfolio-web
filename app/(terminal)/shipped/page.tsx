// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "shipped.app — Bakytbek Tatibekov"
};

export default function ShippedPage() {
  return (
    <>
      <PromptLine cmd="ls -la shipped/" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
