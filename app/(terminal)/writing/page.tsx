// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getWriting } from "@/lib/api";
import { WritingView } from "@/app/components/views/writing-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[4]; // writing

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function WritingPage() {
  const writing = await getWriting();
  return (
    <>
      <PromptLine cmd="ls writing/ && cat *.md" />
      <WritingView writing={writing} />
    </>
  );
}
