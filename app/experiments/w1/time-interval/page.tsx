"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { makeCaptchaShape, paintCaptcha } from "./captcha";
import styles from "./page.module.css";

// A 10 × 10 grid of counters. Each one counts 1 → 9, then shows nothing (0), then starts over.
// Every counter gets its own random speed.
const GRID_SIZE = 10;
const MAX_COUNT = 9;
const MIN_INTERVAL = 100; // ms
const MAX_INTERVAL = 1000; // ms

// Roman numerals for 1 to 9. Index 0 is empty: 0 means "nothing here".
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

// How many different captcha images are made for each digit.
const CAPTCHA_VARIANTS = 6;

type Numerals = "arabic" | "roman" | "captcha";

// One captcha image, copied onto this cell's canvas. Its colours and glow are already drawn in (see captcha.ts).
function Captcha({ image }: { image: HTMLCanvasElement }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current!.getContext("2d")!;
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.drawImage(image, 0, 0);
  }, [image]);

  return <canvas ref={ref} className={styles.captcha} width={image.width} height={image.height} />;
}

type CounterProps = { index: number; numerals: Numerals; captchas: HTMLCanvasElement[][] };

function Counter({ index, numerals, captchas }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    const id = setInterval(() => {
      setCount((previous) => (previous >= MAX_COUNT ? 0 : previous + 1));
    }, interval);
    return () => clearInterval(id);
  }, []);

  // 0 means "nothing here": show an empty cell.
  if (count === 0) return <div className={styles.cell} />;

  if (numerals === "captcha") {
    // captchas is empty until the images are made; pick a variant that differs per cell and per count.
    const image = captchas[count]?.[(index * 7 + count) % CAPTCHA_VARIANTS];
    return <div className={styles.cell}>{image && <Captcha image={image} />}</div>;
  }

  return <div className={styles.cell}>{numerals === "roman" ? ROMAN[count] : count}</div>;
}

export default function TimeInterval() {
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE });

  // Which menu is open in the lower-right corner: numerals, colour, or none.
  const [openMenu, setOpenMenu] = useState<"numerals" | "colour" | null>(null);

  // Numeral style, chosen in the numerals menu.
  const [numerals, setNumerals] = useState<Numerals>("arabic");

  // Neon colour settings, chosen in the colour menu.
  const [coreColor, setCoreColor] = useState("#c8f0ff"); // the number itself
  const [glowColor, setGlowColor] = useState("#1fa8ff"); // the light around it
  const [glowSize, setGlowSize] = useState(0.8); // how far the glow reaches, in em

  // Captcha shapes, made once in the browser: shapes[digit][variant]. Index 0 stays empty.
  const [shapes, setShapes] = useState<HTMLCanvasElement[][]>([]);
  useEffect(() => {
    setShapes(
      Array.from({ length: MAX_COUNT + 1 }, (_, digit) =>
        digit === 0 ? [] : Array.from({ length: CAPTCHA_VARIANTS }, () => makeCaptchaShape(digit)),
      ),
    );
  }, []);

  // Captcha images: the shapes painted in the current colours. Repainted only in captcha mode,
  // 100 ms after the last colour change, so dragging a slider does not repaint on every step.
  const [captchas, setCaptchas] = useState<HTMLCanvasElement[][]>([]);
  useEffect(() => {
    if (numerals !== "captcha") return;
    const id = setTimeout(() => {
      setCaptchas(shapes.map((variants) => variants.map((shape) => paintCaptcha(shape, coreColor, glowColor, glowSize))));
    }, 100);
    return () => clearTimeout(id);
  }, [numerals, shapes, coreColor, glowColor, glowSize]);

  // Passed to CSS as variables; page.module.css uses them in .cell and .captcha.
  const neonStyle = {
    "--core-color": coreColor,
    "--glow-color": glowColor,
    "--glow-size": `${glowSize}em`,
  } as CSSProperties;

  function toggleMenu(menu: "numerals" | "colour") {
    setOpenMenu(openMenu === menu ? null : menu);
  }

  const options: { value: Numerals; label: string; sample: ReactNode }[] = [
    { value: "arabic", label: "Arabic", sample: "1 2 3" },
    { value: "roman", label: "Roman", sample: "I II III" },
    { value: "captcha", label: "Captcha", sample: captchas[7] && <Captcha image={captchas[7][0]} /> },
  ];

  return (
    <main className={styles.container} style={neonStyle}>
      <div className={numerals === "roman" ? `${styles.grid} ${styles.roman}` : styles.grid}>
        {cells.map((_, i) => (
          <Counter key={i} index={i} numerals={numerals} captchas={captchas} />
        ))}
      </div>

      <div className={styles.panel}>
        {openMenu === "numerals" && (
          <div className={styles.controls}>
            {options.map((option) => (
              <button
                key={option.value}
                className={numerals === option.value ? `${styles.option} ${styles.selected}` : styles.option}
                onClick={() => setNumerals(option.value)}
              >
                <span>{option.label}</span>
                <span className={styles.sample}>{option.sample}</span>
              </button>
            ))}
          </div>
        )}

        {openMenu === "colour" && (
          <div className={styles.controls}>
            <label>
              Core
              <input type="color" value={coreColor} onChange={(e) => setCoreColor(e.target.value)} />
              <span>{coreColor}</span>
            </label>
            <label>
              Glow
              <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} />
              <span>{glowColor}</span>
            </label>
            <label>
              Size
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={glowSize}
                onChange={(e) => setGlowSize(Number(e.target.value))}
              />
              <span>{glowSize.toFixed(2)}</span>
            </label>
          </div>
        )}

        <div className={styles.buttons}>
          {/* Numerals: three bars with serifs, like a Roman III. Lit while its menu is open. */}
          <button
            className={openMenu === "numerals" ? `${styles.toggle} ${styles.active}` : styles.toggle}
            onClick={() => toggleMenu("numerals")}
            aria-label="Numerals"
            title="Numerals"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5h14M5 19h14M8 5v14M12 5v14M16 5v14" />
            </svg>
          </button>

          {/* Colour: a ring, half filled. Lit while its menu is open. */}
          <button
            className={openMenu === "colour" ? `${styles.toggle} ${styles.active}` : styles.toggle}
            onClick={() => toggleMenu("colour")}
            aria-label="Colour"
            title="Colour"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="7" />
              <path d="M12 5a7 7 0 0 0 0 14z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
