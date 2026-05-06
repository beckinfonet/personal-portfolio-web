// NO "use client" — RSC stub (D-12)
import type { Metadata } from "next";
import { PromptLine } from "@/app/components/primitives/prompt-line";

export const metadata: Metadata = {
  title: "contact.sh — Bakytbek Tatibekov"
};

export default function ContactPage() {
  return (
    <>
      <PromptLine cmd="./contact.sh --whoami" />
      <p className="stub-body">// view body lands in Phase 3</p>
    </>
  );
}
