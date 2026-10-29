"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// Plain chart view: only the price line, no axes or labels.
const MARGIN = 64; // px of empty space around the line
const LINE = "#111"; // colour of the line

export type Point = { time: number; close: number };

export default function Chart({ points }: { points: Point[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio;

    function draw() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Data range → screen. x: time, y: price (0 at the bottom).
      const first = points[0].time;
      const last = points[points.length - 1].time;
      const maxPrice = Math.max(...points.map((p) => p.close));
      const x = (time: number) => MARGIN + ((time - first) / (last - first)) * (width - MARGIN * 2);
      const y = (price: number) => height - MARGIN - (price / maxPrice) * (height - MARGIN * 2);

      context.strokeStyle = LINE;
      context.lineWidth = 1.25;
      context.beginPath();
      points.forEach((p, i) => (i === 0 ? context.moveTo(x(p.time), y(p.close)) : context.lineTo(x(p.time), y(p.close))));
      context.stroke();
    }
    draw();
    window.addEventListener("resize", draw);

    return () => window.removeEventListener("resize", draw);
  }, [points]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
