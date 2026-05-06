import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";
import { ROUTES } from "@/lib/routes";

/* Mock the client pathname component used by not-found.tsx */
vi.mock("@/app/components/not-found-pathname", () => ({
  NotFoundPathname: () => "/this-does-not-exist"
}));

/* Mock next/link to render a plain <a> tag in jsdom */
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
}));

describe("NotFound", () => {
  test("renders the terminal ls error copy", () => {
    render(<NotFound />);
    expect(screen.getByText(/ls: cannot access/i)).toBeInTheDocument();
  });

  test("renders 7 route links matching each ROUTES label", () => {
    render(<NotFound />);
    ROUTES.forEach((route) => {
      expect(screen.getByRole("link", { name: route.label })).toBeInTheDocument();
    });
  });

  test("renders the prompt-line $ prefix", () => {
    render(<NotFound />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });
});
