"use client";

import { useEffect, useState } from "react";
import styles from "./lang.module.css";

export type Lang = "en" | "ko";

export function getLang(): Lang {
  if (typeof document === "undefined") return "en";
  return document.documentElement.getAttribute("data-lang") === "ko" ? "ko" : "en";
}

export function setLang(lang: Lang) {
  document.documentElement.setAttribute("data-lang", lang);
  try {
    localStorage.setItem("lang", lang);
  } catch {}
  window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

/** EN / KO switch. The chosen language is an attribute on <html>; CSS shows one language's blocks. */
export function LangToggle() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getLang());
    const onChange = () => setLangState(getLang());
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  return (
    <div className={styles.group} role="group" aria-label="Language">
      {(["en", "ko"] as Lang[]).map((option) => (
        <button
          key={option}
          type="button"
          className={option === lang ? styles.active : styles.option}
          onClick={() => setLang(option)}
        >
          {option === "en" ? "EN" : "한국어"}
        </button>
      ))}
    </div>
  );
}
