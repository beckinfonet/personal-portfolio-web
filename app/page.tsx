import type { Metadata } from "next";
import { Homepage } from "./components/homepage";
import { getExperience, getProfile, getShipped, getStack, getWriting } from "@/lib/api";

export const metadata: Metadata = {
  title: "Beck Maldin | Portfolio Home",
  description: "Portfolio highlights, apps, experience, and recent blog posts."
};

export default async function Home() {
  const [profile, skills, experience, apps, posts] = await Promise.all([
    getProfile(),
    getStack(),
    getExperience(),
    getShipped(),
    getWriting()
  ]);

  return (
    <Homepage
      profile={profile}
      skills={skills}
      experience={experience}
      apps={apps}
      posts={posts}
    />
  );
}
