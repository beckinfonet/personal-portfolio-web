import "@testing-library/jest-dom/vitest";

// Clear localStorage between tests to prevent cross-test contamination
// of "theme" and "portfolio-accent" keys. (D-20 — test isolation)
// NOTE: vitest.config.ts has globals: true, so beforeEach needs no import.
beforeEach(() => {
  localStorage.clear();
});
