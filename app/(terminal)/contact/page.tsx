// NO "use client" — RSC route page (Phase 3)
import type { Metadata } from "next";
import { ROUTES } from "@/lib/routes";
import { getProfile } from "@/lib/api";
import { ContactView } from "@/app/components/views/contact-view";
import { PromptLine } from "@/app/components/primitives/prompt-line";

const route = ROUTES[5]; // contact

export const metadata: Metadata = {
  title: `${route.label} — Bakytbek Tatibekov`,
  description: route.description,
  alternates: { canonical: route.pathname }
};

export default async function ContactPage() {
  const profile = await getProfile();
  return (
    <>
      <PromptLine cmd="./contact.sh --whoami" />
      <ContactView profile={profile} />
    </>
  );
}
