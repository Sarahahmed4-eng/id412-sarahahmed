"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./collapsible.module.css";

// Makes every section of the notes collapsible. A section is an h2 and
// everything up to the next h2; a subsection is a bold run-in paragraph
// (**Title**) or an h3/h4 and everything up to the next heading of the same
// or higher level. Nothing is moved in the DOM: siblings are only hidden, so
// React components inside the notes keep working. One delegated click
// listener handles every toggle.

function isRunIn(node: Element) {
  // Ignore the toggle button once it has been inserted.
  const content = Array.from(node.childNodes).filter(
    (child) => !(child instanceof HTMLElement && child.dataset.toggle !== undefined),
  );
  return node.tagName === "P" && content.length === 1 && (content[0] as Element).tagName === "STRONG";
}

function level(node: Element): number | null {
  const stored = (node as HTMLElement).dataset.level;
  if (stored) return Number(stored);
  if (node.tagName === "H2") return 2;
  if (node.tagName === "H3") return 3;
  if (node.tagName === "H4") return 4;
  if (isRunIn(node)) return 5;
  return null;
}

function bodyOf(head: Element): HTMLElement[] {
  const own = level(head)!;
  const out: HTMLElement[] = [];
  let node = head.nextElementSibling;
  while (node) {
    const l = level(node);
    if (l !== null && l <= own) break;
    out.push(node as HTMLElement);
    node = node.nextElementSibling;
  }
  return out;
}

function decorate(head: HTMLElement) {
  if (head.dataset.collapsible !== undefined) return;
  if (bodyOf(head).length === 0) return;
  head.dataset.collapsible = "open";
  head.dataset.level = String(level(head));
  const button = document.createElement("button");
  button.type = "button";
  button.className = styles.toggle;
  button.dataset.toggle = "";
  button.setAttribute("aria-label", "Toggle section");
  button.setAttribute("aria-expanded", "true");
  button.textContent = "▼";
  head.classList.add(styles.head);
  head.insertBefore(button, head.firstChild);
}

function toggle(head: HTMLElement) {
  const open = head.dataset.collapsible === "open";
  head.dataset.collapsible = open ? "closed" : "open";
  head.classList.toggle(styles.collapsed, open);
  const button = head.querySelector<HTMLButtonElement>("[data-toggle]");
  if (button) {
    button.setAttribute("aria-expanded", open ? "false" : "true");
    button.textContent = open ? "▶" : "▼";
  }
  // Inline display beats any stylesheet display (flex, grid), unlike the hidden attribute.
  for (const node of bodyOf(head)) node.style.display = open ? "none" : "";
}

export function Collapsible() {
  const pathname = usePathname();

  useEffect(() => {
    for (const root of document.querySelectorAll<HTMLElement>("[data-lang-block]")) {
      for (const node of root.querySelectorAll<HTMLElement>("h2, h3, h4, p")) {
        if (level(node) !== null) decorate(node);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-toggle]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const head = button.parentElement;
      if (head) toggle(head);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
