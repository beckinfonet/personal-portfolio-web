import { render, screen } from "@testing-library/react";
import { Homepage } from "./homepage";
import {
  fallbackApps,
  fallbackExperience,
  fallbackPosts,
  fallbackProfile,
  fallbackSkills
} from "@/lib/fallback-data";

test("renders recruiter-facing homepage sections", () => {
  render(
    <Homepage
      profile={fallbackProfile}
      skills={fallbackSkills}
      experience={fallbackExperience}
      apps={fallbackApps}
      posts={fallbackPosts}
    />
  );

  expect(screen.getByRole("heading", { name: /skills & tech stack/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /mobile apps/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /experience timeline/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /blog preview/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /contact & social/i })).toBeInTheDocument();
});
