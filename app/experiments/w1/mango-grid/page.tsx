"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import styles from "./page.module.css";

// The screen filled with mangos, mirrored like a decalcomanie.
// N columns; the number of rows follows the window shape so every tile keeps the photo's shape.
const RATIO = 1920 / 1280; // width / height of the photo
const MIN_SCALE = 1; // 100 %: mouse in the centre
const MAX_SCALE = 3; // 300 %: mouse in a corner

// How overlapping mangos mix. normal = no blending.
const BLENDS = ["normal", "difference", "exclusion", "multiply", "screen", "overlay", "color-burn"] as const;
type Blend = (typeof BLENDS)[number];

export default function MangoGrid() {
  // Visual settings, changed in the options panel (lower-right corner).
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [columns, setColumns] = useState(10); // N, 10 to 40
  const [scale, setScale] = useState(2); // used when the mouse does not drive the scale
  const [mouseScale, setMouseScale] = useState(true); // scale follows the mouse's distance from the centre
  const [blend, setBlend] = useState<Blend>("difference");

  // Rows: how many tiles of the photo's shape fit the window height. Updated on resize.
  const [rows, setRows] = useState(0);
  useEffect(() => {
    function resize() {
      const tileHeight = window.innerWidth / columns / RATIO;
      setRows(Math.max(1, Math.round(window.innerHeight / tileHeight)));
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [columns]);

  // The scale is a CSS variable (--scale) on the grid, set directly, not through React state:
  // the mouse changes it many times a second, and re-rendering 1000+ tiles each time would be slow.
  const gridRef = useRef<HTMLDivElement>(null);
  const scaleLabelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    function applyScale(value: number) {
      gridRef.current!.style.setProperty("--scale", String(value));
      if (scaleLabelRef.current) scaleLabelRef.current.textContent = `${Math.round(value * 100)}%`;
    }

    if (!mouseScale) {
      applyScale(scale);
      return;
    }

    // Mouse mode: distance from the centre, 0 in the middle, 1 in a corner → MIN_SCALE to MAX_SCALE.
    function onPointerMove(event: PointerEvent) {
      const dx = event.clientX - window.innerWidth / 2;
      const dy = event.clientY - window.innerHeight / 2;
      const radius = Math.hypot(dx, dy);
      const maxRadius = Math.hypot(window.innerWidth / 2, window.innerHeight / 2); // centre to corner
      applyScale(MIN_SCALE + (MAX_SCALE - MIN_SCALE) * Math.min(1, radius / maxRadius));
    }
    applyScale(MIN_SCALE);
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [mouseScale, scale, optionsOpen]); // optionsOpen: fill in the label again when the panel opens

  const count = columns * rows;

  return (
    <main className={styles.container}>
      <div
        ref={gridRef}
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          // Decalcomanie: every other column and row is mirrored, so each mango mirrors its neighbours.
          const i = index % columns; // column, from 0
          const j = Math.floor(index / columns); // row, from 0
          const flipX = i % 2 === 1 ? -1 : 1; // odd column: flip left/right
          const flipY = j % 2 === 1 ? -1 : 1; // odd row: flip top/bottom
          // The flips go to CSS as variables; .cell in page.module.css multiplies them by --scale.
          const cellStyle = { "--flip-x": flipX, "--flip-y": flipY, mixBlendMode: blend } as CSSProperties;
          return (
            <div key={index} className={styles.cell} style={cellStyle}>
              {/* eager: every tile is on screen, so there is nothing to lazy-load */}
              <Image
                src="/experiments/w1/mango-grid/mango.jpg"
                alt=""
                fill
                sizes={`${(100 * MAX_SCALE) / columns}vw`}
                loading="eager"
                className={styles.image}
              />
            </div>
          );
        })}
      </div>

      <p className={styles.credit}>
        {count} mangos · Photo:{" "}
        <a href="https://commons.wikimedia.org/wiki/File:Mango_fruit_Nam_Dok_Mai.jpg">Ivar Leidus</a>,{" "}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
      </p>

      <div className={styles.panel}>
        {optionsOpen && (
          <div className={styles.controls}>
            <label>
              N
              <input type="range" min={10} max={40} step={1} value={columns} onChange={(e) => setColumns(Number(e.target.value))} />
              <span>{columns}</span>
            </label>
            <label>
              Mouse
              <input type="checkbox" checked={mouseScale} onChange={(e) => setMouseScale(e.target.checked)} />
              <span>{mouseScale ? "→ scale" : "off"}</span>
            </label>
            <label>
              Scale
              <input
                type="range"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={0.05}
                value={scale}
                disabled={mouseScale}
                onChange={(e) => setScale(Number(e.target.value))}
              />
              {/* Filled in by applyScale, so it follows the mouse too */}
              <span ref={scaleLabelRef} />
            </label>
            <label>
              Blend
              <select value={blend} onChange={(e) => setBlend(e.target.value as Blend)}>
                {BLENDS.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <span />
            </label>
          </div>
        )}

        {/* Options: three sliders. Lit while the panel is open. */}
        <button
          className={optionsOpen ? `${styles.toggle} ${styles.active}` : styles.toggle}
          onClick={() => setOptionsOpen(!optionsOpen)}
          aria-label="Options"
          title="Options"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h16M4 12h16M4 17h16" />
            <circle cx="9" cy="7" r="2" fill="currentColor" />
            <circle cx="15" cy="12" r="2" fill="currentColor" />
            <circle cx="7" cy="17" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>
    </main>
  );
}
