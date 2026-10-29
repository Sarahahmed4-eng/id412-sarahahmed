"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./sidebar.module.css";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { LangToggle } from "../lang/lang";
import { L } from "../lang/lang-block";

const pages = [
  { href: "/", label: "Index", ko: "인덱스", meta: "" },
  { href: "/lecture-materials/prelim", label: "Prelim", ko: "사전 준비", meta: "before 10/26" },
  { href: "/lecture-materials/w1", label: "Web 1", ko: "Web 1", meta: "10/26" },
  { href: "/lecture-materials/w2", label: "Web 2", ko: "Web 2", meta: "11/2" },
  { href: "/lecture-materials/w3", label: "Web 3", ko: "Web 3", meta: "11/16" },
  { href: "/experiments", label: "Experiments", ko: "실험", meta: "" },
  { href: "/final", label: "Final", ko: "기말", meta: "" },
];

type Heading = { id: string; text: string };

export function Sidebar() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  const [langTick, setLangTick] = useState(0);

  useEffect(() => {
    const onLang = () => setLangTick((value) => value + 1);
    window.addEventListener("langchange", onLang);
    return () => window.removeEventListener("langchange", onLang);
  }, []);

  useEffect(() => {
    setOpen(false);
    // Only the headings of the visible language.
    const nodes = Array.from(document.querySelectorAll<HTMLHeadingElement>("main h2[id]")).filter(
      (node) => node.offsetParent !== null,
    );
    const textOf = (node: HTMLElement) =>
      Array.from(node.childNodes)
        .filter((child) => !(child instanceof HTMLElement && child.dataset.toggle !== undefined))
        .map((child) => child.textContent ?? "")
        .join("")
        .trim();
    setHeadings(nodes.map((node) => ({ id: node.id, text: textOf(node) })));
    if (nodes.length === 0) {
      setActive("");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 120;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname, langTick]);

  return (
    <>
      <div className={styles.bar}>
        <Link href="/" className={styles.barTitle}>
          ID412 Web
        </Link>
        <button
          type="button"
          className={styles.barButton}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Contents"}
        </button>
      </div>

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <Link href="/" className={styles.title}>
          ID412 Interactive Space
          <span className={styles.subtitle}>Web Workshop 2026</span>
        </Link>

        <nav aria-label="Pages">
          <ol className={styles.pages}>
            {pages.map((page) => {
              const isActive = pathname === page.href || (page.href !== "/" && pathname.startsWith(page.href + "/"));
              return (
                <li key={page.href} className={isActive ? styles.pageActive : styles.page}>
                  <Link href={page.href}>
                    <span>
                      <L en={page.label} ko={page.ko} />
                    </span>
                    {page.meta ? <span className={styles.meta}>{page.meta}</span> : null}
                  </Link>
                  {isActive && headings.length > 0 ? (
                    <ol className={styles.sections}>
                      {headings.map((heading) => (
                        <li
                          key={heading.id}
                          className={heading.id === active ? styles.sectionActive : styles.section}
                        >
                          <a href={`#${heading.id}`} onClick={() => setOpen(false)}>
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={styles.footer}>
          <div className={styles.toggles}>
            <LangToggle />
            <ThemeToggle />
          </div>
          <a href="https://github.com/jeanyoon-choi/id412-2026" target="_blank" rel="noopener noreferrer">
            github.com/jeanyoon-choi/id412-2026
          </a>
        </div>
      </aside>
    </>
  );
}
