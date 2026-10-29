"use client";

import { useRef, useState, type HTMLAttributes } from "react";
import styles from "./code-block.module.css";

/** Fenced code block with a copy button. Used for every <pre> in the notes. */
export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = ref.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className={styles.wrap}>
      <pre ref={ref} {...props}>
        {children}
      </pre>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
