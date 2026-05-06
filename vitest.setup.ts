import "@testing-library/jest-dom/vitest";

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

// Clear localStorage between tests to prevent cross-test contamination
// of "theme" and "portfolio-accent" keys. (D-20 — test isolation)
// NOTE: vitest.config.ts has globals: true, so beforeEach needs no import.
beforeEach(() => {
  localStorage.clear();
});
