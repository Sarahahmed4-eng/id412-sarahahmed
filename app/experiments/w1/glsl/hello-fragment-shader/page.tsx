"use client";

import { useEffect, useRef } from "react";
import { createRenderer, type Renderer } from "./renderer";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import styles from "./page.module.css";

// Hello Fragment Shader: one full-screen triangle, colour from uv. No time, no mouse.
export default function HelloFragmentShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    let renderer: Renderer;
    try {
      renderer = createRenderer(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    } catch (error) {
      console.error(error);
      return;
    }

    const resize = () => {
      renderer.resize(innerWidth, innerHeight, Math.min(devicePixelRatio || 1, 2));
    };
    let frame = 0;
    const render = (now: number) => {
      renderer.render(now / 1000, { x: 0.5, y: 0.5 });
      frame = requestAnimationFrame(render);
    };

    addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
      renderer.destroy();
    };
  }, []);

  return (
    <main className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </main>
  );
}
