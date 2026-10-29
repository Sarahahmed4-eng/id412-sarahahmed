"use client";

import { useEffect, useState } from "react";
import styles from "./image-row.module.css";

type Item = { src: string; alt: string; caption?: string; href?: string };

/**
 * A row of captioned images for the lecture pages. Click an image to see it
 * large; Esc or a click closes it. `wide` for one large image, `logos` for
 * a row of small logos (those link out instead of enlarging).
 */
export function ImageRow({ items, wide = false, logos = false }: { items: Item[]; wide?: boolean; logos?: boolean }) {
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className={logos ? styles.logoRow : styles.row}>
        {items.map((item) => (
          <figure key={item.src} className={logos ? styles.logo : wide ? styles.wide : styles.figure}>
            {logos && item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                <img src={item.src} alt={item.alt} className={styles.image} loading="lazy" />
              </a>
            ) : (
              <button type="button" className={styles.zoom} onClick={() => setOpen(item)} aria-label={`Enlarge: ${item.alt}`}>
                <img src={item.src} alt={item.alt} className={styles.image} loading="lazy" />
              </button>
            )}
            {item.caption ? (
              <figcaption className={styles.caption}>
                {item.href && !logos ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {item.caption}
                  </a>
                ) : (
                  item.caption
                )}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {open ? (
        <div className={styles.lightbox} onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <img src={open.src} alt={open.alt} className={styles.lightboxImage} />
          {open.caption ? <div className={styles.lightboxCaption}>{open.caption}</div> : null}
          <button type="button" className={styles.close} aria-label="Close">
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
