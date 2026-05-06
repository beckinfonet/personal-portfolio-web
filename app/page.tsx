import type { Metadata } from "next";
import { Homepage } from "./components/homepage";
import { getApps, getExperience, getPosts, getProfile, getSkills } from "@/lib/api";

export const metadata: Metadata = {
  title: "Beck Maldin | Portfolio Home",
  description: "Portfolio highlights, apps, experience, and recent blog posts."
};

export default async function Home() {
  const [profile, skills, experience, apps, posts] = await Promise.all([
    getProfile(),
    getSkills(),
    getExperience(),
    getApps(),
    getPosts(3)
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
