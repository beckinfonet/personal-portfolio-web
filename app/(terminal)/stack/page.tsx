// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getStack } from "@/lib/api";
import { StackView } from "@/app/components/views/stack-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[2]; // stack

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function StackPage() {
  const stack = await getStack();
  return (
    <>
      <PromptLine cmd="cat stack.json | jq" />
      <StackView stack={stack} />
    </>
  );
}
