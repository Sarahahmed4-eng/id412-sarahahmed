"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

// A chain of little ghosts follows the mouse. The first chases the mouse, each next one chases the one before it.
const COUNT = 12; // number of ghosts
const EASE = 0.15; // 0..1, how fast each one catches up with the one ahead
const SIZE = 200; // px, height of the first one; the rest get smaller
const IMAGE = "/experiments/w1/mouse-follow/ghost.svg"; // 100 × 160, face centre at 39% of the height

export default function MouseFollow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio;
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const figures = Array.from({ length: COUNT }, () => ({ x: mouse.x, y: mouse.y }));
    const image = new Image();
    image.src = IMAGE;
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(event: MouseEvent) {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    }
    window.addEventListener("mousemove", onMouseMove);

    function draw() {
      // Each one moves a bit towards its target: the mouse for the first, the previous one for the rest.
      figures.forEach((figure, i) => {
        const target = i === 0 ? mouse : figures[i - 1];
        figure.x += (target.x - figure.x) * EASE;
        figure.y += (target.y - figure.y) * EASE;
      });

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw from the tail to the head, so the first one sits on top.
      for (let i = COUNT - 1; i >= 0 && image.complete; i--) {
        const t = i / COUNT; // 0 at the head, near 1 at the tail
        const height = SIZE * (1 - t * 0.7);
        const width = height * (100 / 160);
        context.globalAlpha = 1 - t;
        // The face, not the middle of the image, sits on the mouse.
        context.drawImage(image, figures[i].x - width / 2, figures[i].y - height * 0.39, width, height);
      }
      context.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
