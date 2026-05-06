"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "portfolio-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {theme === "light" ? "Switch to Dark" : "Switch to Light"}
    </button>
  );
}
