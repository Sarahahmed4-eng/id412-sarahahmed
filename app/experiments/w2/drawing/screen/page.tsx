"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The laptop draws where the phone's finger is: a dot and a fading trail.
const EASE = 0.25; // 0..1, how fast the dot catches up with the finger
const TRAIL = 40; // frames of trail kept behind the dot
const SIZE = 24; // px, dot and line thickness

export default function DrawingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: 0.5, y: 0.5 }); // last position from the phone, 0..1
  const touching = useRef(false);
  const [phonePath, setPhonePath] = useState("");

  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "down" || type === "move") {
      target.current = data as { x: number; y: number };
      touching.current = true;
    }
    if (type === "up") touching.current = false;
  }, []);

  const { connected } = useSocket("drawing", onMessage);

  useEffect(() => {
    // On the phone: the same address, with the computer's IP instead of localhost.
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio;
    const current = { x: 0.5, y: 0.5 }; // eased position, 0..1
    let trail: { x: number; y: number }[] = []; // past positions, oldest first
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // A new touch starts where the finger is, not where the last one ended.
      if (touching.current && trail.length === 0) Object.assign(current, target.current);

      // Messages arrive ~30 times a second; easing fills the frames in between.
      current.x += (target.current.x - current.x) * EASE;
      current.y += (target.current.y - current.y) * EASE;

      // While touching, add a point every frame. Otherwise the trail shrinks away.
      if (touching.current) trail.push({ x: current.x, y: current.y });
      trail = trail.slice(touching.current ? -TRAIL : 1);

      context.clearRect(0, 0, width, height);

      // Older segments are more transparent.
      context.lineWidth = SIZE;
      context.lineCap = "round";
      for (let i = 1; i < trail.length; i++) {
        context.strokeStyle = `rgba(255, 255, 255, ${i / trail.length})`;
        context.beginPath();
        context.moveTo(trail[i - 1].x * width, trail[i - 1].y * height);
        context.lineTo(trail[i].x * width, trail[i].y * height);
        context.stroke();
      }

      context.fillStyle = touching.current ? "white" : "#444";
      context.beginPath();
      context.arc(current.x * width, current.y * height, SIZE / 2, 0, Math.PI * 2);
      context.fill();

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.status}>
        {connected ? "connected" : "connecting…"} · open{" "}
        {/* A new tab with the mobile page: test both sides on one laptop. */}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
