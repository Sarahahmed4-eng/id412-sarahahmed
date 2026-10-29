"use client";

import { useState } from "react";
import styles from "./capability-chart.module.css";

// METR Time Horizon 1.1 (metr.org/time-horizons), 50% success, frontier
// models. Mythos Preview is a lower bound: METR says measurements above 16 hr
// are unreliable with its current task suite.
const points = [
  { date: "2023-03", label: "GPT-4", minutes: 4 },
  { date: "2024-05", label: "GPT-4o", minutes: 6 },
  { date: "2024-10", label: "Claude 3.5 Sonnet", minutes: 20 },
  { date: "2024-12", label: "o1", minutes: 38 },
  { date: "2025-02", label: "Claude 3.7 Sonnet", minutes: 60 },
  { date: "2025-04", label: "o3", minutes: 121 },
  { date: "2025-08", label: "GPT-5", minutes: 214 },
  { date: "2025-11", label: "Claude Opus 4.5", minutes: 320 },
  { date: "2025-12", label: "GPT-5.2", minutes: 394 },
  { date: "2026-02", label: "Claude Opus 4.6", minutes: 719 },
  { date: "2026-04", label: "Claude Mythos Preview", minutes: 960, floor: true },
];

const width = 720;
const height = 360;
const pad = { top: 24, right: 24, bottom: 44, left: 56 };
const x0 = 2023 + 2 / 12;
const x1 = 2026 + 7 / 12;
const yTicks = [
  { minutes: 1, label: "1 min" },
  { minutes: 10, label: "10 min" },
  { minutes: 60, label: "1 hr" },
  { minutes: 480, label: "8 hr" },
  { minutes: 2400, label: "1 week" },
];
const yMin = Math.log10(1);
const yMax = Math.log10(2400);

function toYear(date: string) {
  const [y, m] = date.split("-").map(Number);
  return y + (m - 0.5) / 12;
}

// Rounded so server and client render identical attribute strings.
function round(value: number) {
  return Math.round(value * 100) / 100;
}

function sx(year: number) {
  return round(pad.left + ((year - x0) / (x1 - x0)) * (width - pad.left - pad.right));
}

function sy(minutes: number) {
  const t = (Math.log10(minutes) - yMin) / (yMax - yMin);
  return round(height - pad.bottom - t * (height - pad.top - pad.bottom));
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hr`;
}

export function CapabilityChart() {
  const [hover, setHover] = useState<number | null>(null);
  const path = points.map((p, i) => `${i ? "L" : "M"}${sx(toYear(p.date))},${sy(p.minutes)}`).join(" ");
  const active = hover === null ? null : points[hover];

  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg} role="img" aria-label="Line chart">
        {yTicks.map((t) => (
          <g key={t.minutes}>
            <line x1={pad.left} x2={width - pad.right} y1={sy(t.minutes)} y2={sy(t.minutes)} className={styles.grid} />
            <text x={pad.left - 8} y={sy(t.minutes)} className={styles.tickY}>
              {t.label}
            </text>
          </g>
        ))}
        {[2023, 2024, 2025, 2026].map((year) => (
          <text key={year} x={sx(year + 0.5)} y={height - pad.bottom + 20} className={styles.tickX}>
            {year}
          </text>
        ))}
        <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} className={styles.axis} />
        <path d={path} className={styles.line} />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={sx(toYear(p.date))} cy={sy(p.minutes)} r={hover === i ? 6 : 4} className={styles.dot} />
            <circle
              cx={sx(toYear(p.date))}
              cy={sy(p.minutes)}
              r={14}
              className={styles.hit}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
            />
          </g>
        ))}
        {active ? (
          <g transform={`translate(${Math.min(sx(toYear(active.date)) + 10, width - 190)}, ${Math.max(sy(active.minutes) - 44, pad.top)})`}>
            <rect width={180} height={38} rx={4} className={styles.tipBox} />
            <text x={8} y={16} className={styles.tipTitle}>
              {active.label}
            </text>
            <text x={8} y={31} className={styles.tipText}>
              {active.date} · {active.floor ? "≥ " : ""}
              {formatMinutes(active.minutes)}
            </text>
          </g>
        ) : null}
      </svg>
      <p className={styles.source}>
        Source:{" "}
        <a href="https://metr.org/time-horizons/" target="_blank" rel="noopener noreferrer">
          METR, Time Horizon 1.1
        </a>

      </p>
    </figure>
  );
}
