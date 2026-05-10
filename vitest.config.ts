import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
    passWithNoTests: true,
    // Exclude Playwright spec dir — Playwright owns tests/ via playwright.config.ts.
    // Without this, vitest picks up tests/*.spec.ts and fails on @playwright/test imports.
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "tests/**"]
  }
});
