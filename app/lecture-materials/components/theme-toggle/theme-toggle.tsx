"use client";

import { useEffect, useState } from "react";
import styles from "./theme-toggle.module.css";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let saved: Theme | null = null;
    try {
      const value = localStorage.getItem("theme");
      if (value === "light" || value === "dark") saved = value;
    } catch {}
    setTheme(saved ?? systemTheme());
  }, []);

  const change = (next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <div className={styles.group} role="group" aria-label="Theme">
      {(["light", "dark"] as Theme[]).map((option) => (
        <button
          key={option}
          type="button"
          className={option === theme ? styles.active : styles.option}
          onClick={() => change(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
