import { render, screen } from "@testing-library/react";
import { Homepage } from "./homepage";
import {
  EXPERIENCE,
  PROFILE,
  SHIPPED,
  STACK,
  WRITING
} from "@/lib/portfolio-data";

test("renders recruiter-facing homepage sections", () => {
  render(
    <Homepage
      profile={PROFILE}
      skills={STACK}
      experience={EXPERIENCE}
      apps={SHIPPED}
      posts={WRITING}
    />
  );

  expect(screen.getByRole("heading", { name: /skills & tech stack/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /mobile apps/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /experience timeline/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /blog preview/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /contact & social/i })).toBeInTheDocument();
});
