"use client";

import { useEffect, useState } from "react";
import * as Tone from "tone";
import Chart, { type Point } from "./Chart";
import Counter from "./Counter";
import styles from "./page.module.css";

// The S&P 500 over the last 50 years, in two views picked from the lower-right corner:
// a plain line chart, or the value counting through time on a black screen, with sound.
const DATA = "/experiments/w1/snp/sp500.csv"; // daily closes, "date,close" per line

type View = "chart" | "counter";

export default function Snp() {
  const [points, setPoints] = useState<Point[]>([]);
  const [view, setView] = useState<View>("chart");
  const [menuOpen, setMenuOpen] = useState(false);

  // Load the CSV once and split it into { time, close } points.
  useEffect(() => {
    fetch(DATA)
      .then((response) => response.text())
      .then((text) => {
        setPoints(
          text
            .trim()
            .split("\n")
            .slice(1) // skip the header
            .map((line) => {
              const [date, close] = line.split(",");
              return { time: new Date(date).getTime(), close: Number(close) };
            }),
        );
      });
  }, []);

  const options: { value: View; label: string }[] = [
    { value: "chart", label: "Chart" },
    { value: "counter", label: "Counter" },
  ];

  return (
    <main className={view === "chart" ? styles.container : `${styles.container} ${styles.dark}`}>
      {points.length > 0 && (view === "chart" ? <Chart points={points} /> : <Counter points={points} />)}

      <div className={styles.panel}>
        {menuOpen && (
          <div className={styles.controls}>
            {options.map((option) => (
              <button
                key={option.value}
                className={view === option.value ? `${styles.option} ${styles.selected}` : styles.option}
                onClick={async () => {
                  // Sound needs a click before it can play: start it here, on the way into the Counter.
                  if (option.value === "counter") await Tone.start();
                  setView(option.value);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Views: two stacked squares. Lit while the menu is open. */}
        <button
          className={menuOpen ? `${styles.toggle} ${styles.active}` : styles.toggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Views"
          title="Views"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="11" height="11" />
            <path d="M9 19h11V8" />
          </svg>
        </button>
      </div>
    </main>
  );
}
