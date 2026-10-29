"use client";

import { useEffect, useState } from "react";
import type { Point } from "./Chart";
import { createSound } from "./sound";
import styles from "./page.module.css";

// Counter view: time runs from the first day to the last, and the value of that day is written in the middle.
const DAYS_PER_SECOND = 250; // trading days shown per second (~1 year per second), then it starts over
const CHAR_WIDTH = 0.6; // width of one monospace character, in em

// Write a price the same way everywhere: 7,623.68
function format(price: number) {
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Counter({ points }: { points: Point[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const maxClose = Math.max(...points.map((p) => p.close));
    const sound = createSound();
    let lastDay = 0;
    let frame = 0;

    function tick(now: number) {
      // Which day we are on, from the time since start. Wraps around to loop.
      // (The first frame's time can be a hair before start, hence Math.max.)
      const seconds = Math.max(0, now - start) / 1000;
      const day = Math.floor(seconds * DAYS_PER_SECOND) % points.length;

      // Several days pass in one frame: keep the worst one-day change among them, for the crash sound.
      let change = 0;
      for (let d = lastDay + 1; d <= day; d++) {
        change = Math.min(change, points[d].close / points[d - 1].close - 1);
      }
      lastDay = day;

      sound.update(points[day].close / maxClose, change);
      setIndex(day);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      sound.stop();
    };
  }, [points]);

  // Font size follows the value: the highest close fills the screen width, the rest are smaller in proportion.
  const maxClose = Math.max(...points.map((p) => p.close));
  const fullSize = 100 / (format(maxClose).length * CHAR_WIDTH); // vw, so the highest value is exactly 100vw wide
  const close = points[index].close;

  return (
    <div className={styles.value} style={{ fontSize: `${(close / maxClose) * fullSize}vw` }}>
      {format(close)}
    </div>
  );
}
