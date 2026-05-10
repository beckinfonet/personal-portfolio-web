import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next/font/google — vitest cannot run Next.js's font loader transform, so importing
// app/layout.tsx (or any file that uses next/font/google) at module load throws
// "JetBrains_Mono is not a function". The mock returns a font object whose only
// observable surface in tests is `.variable` (CSS class name) and `.className`.
// (Rule 3 fix for Plan 05-01 Wave 0 — required by app/layout.test.tsx scaffold and
// extended by Plan 05-03 metadata assertions.)
vi.mock("next/font/google", () => ({
  JetBrains_Mono: () => ({ variable: "--font-mono", className: "font-mono" })
}));

// Polyfill ResizeObserver for jsdom — required by cmdk (Command.Dialog) which uses it
// internally via Radix UI. jsdom does not implement ResizeObserver natively.
// (Rule 3 fix: blocking dependency for command-palette.test.tsx)
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Polyfill Element.prototype.scrollIntoView for jsdom — cmdk calls this when
// highlighting items in the list. jsdom stubs it as undefined.
// (Rule 3 fix: blocking dependency for command-palette.test.tsx)
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = function () {};
}

// Polyfill window.matchMedia for jsdom — next-themes uses it when enableSystem
// is true (to read prefers-color-scheme). jsdom does not implement it.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Clear localStorage between tests to prevent cross-test contamination
// of "theme" and "portfolio-accent" keys. (D-20 — test isolation)
// NOTE: vitest.config.ts has globals: true, so beforeEach needs no import.
beforeEach(() => {
  localStorage.clear();
});
