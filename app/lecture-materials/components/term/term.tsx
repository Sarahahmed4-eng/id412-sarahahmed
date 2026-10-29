"use client";

import { useRef, useState } from "react";
import { terms, type TermEntry, type TermId } from "./glossary";
import styles from "./term.module.css";

/**
 * A keyword from the glossary. Click to expand "What is X?" underneath:
 * what it is, how this workshop uses it, official docs, where to learn,
 * and where it appears in the lecture notes. Both languages are rendered;
 * the page's language switch decides which one is visible.
 */
export function Term({ id, children }: { id: TermId; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [here, setHere] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const term: TermEntry = terms[id];

  // The section this term sits in, as "/path#section-id", so the panel does
  // not link back to where the reader already is.
  function locate() {
    const button = buttonRef.current;
    if (!button) return null;
    let heading: Element | null = null;
    for (const h2 of document.querySelectorAll("h2")) {
      if (h2.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING) heading = h2;
    }
    return `${location.pathname}#${heading?.id ?? ""}`;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={open ? styles.wordOpen : styles.word}
        aria-expanded={open}
        onClick={() => {
          setHere(locate());
          setOpen((value) => !value);
        }}
      >
        {children ?? term.name}
      </button>
      {open ? (
        <div className={styles.panel}>
          {(["en", "ko"] as const).map((lang) => {
            const text = term[lang];
            return (
              <div key={lang} data-lang-block={lang}>
                <div className={styles.heading}>
                  {lang === "en" ? `What is ${term.name}?` : `${term.name}란?`}
                </div>
                <p>{text.what}</p>
                <div className={styles.label}>{lang === "en" ? "In this workshop" : "이 워크숍에서는"}</div>
                <p>{text.use}</p>
                <div className={styles.label}>{lang === "en" ? "Links" : "링크"}</div>
                <ul className={styles.links}>
                  <li>
                    <a href={term.official.url} target="_blank" rel="noopener noreferrer">
                      {term.official.label}
                    </a>{" "}
                    <span className={styles.muted}>{lang === "en" ? "official" : "공식"}</span>
                  </li>
                  {term.learn.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>{" "}
                      <span className={styles.muted}>{lang === "en" ? "learn" : "배우기"}</span>
                    </li>
                  ))}
                  {term.related?.filter((link) => link.href !== here).map((link) => (
                    <li key={link.href}>
                      <a href={link.href}>{lang === "en" ? link.en : link.ko}</a>{" "}
                      <span className={styles.muted}>{lang === "en" ? "in these notes" : "강의 노트"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
