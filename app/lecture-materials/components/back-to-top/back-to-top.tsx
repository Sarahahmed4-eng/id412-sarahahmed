"use client";

import { useEffect, useState } from "react";
import styles from "./back-to-top.module.css";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  ///

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      ↑ Top
    </button>
  );
}
