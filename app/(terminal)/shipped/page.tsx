// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getShipped } from "@/lib/api";
import { ShippedView } from "@/app/components/views/shipped-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[6]; // shipped

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ShippedPage() {
  const shipped = await getShipped();
  return (
    <>
      <PromptLine cmd="ls -la shipped/" />
      <ShippedView shipped={shipped} />
    </>
  );
}
