"use client";

import { useEffect, useRef, useState } from "react";
import { createPortraitAtlas } from "./portrait-atlas";
import { createShaderRenderer, type ShaderRenderer, type VisualMode } from "./renderer";
import styles from "./page.module.css";

// Original: experiments-jyc / scc / face-voronoi/3 (Jeanyoon Choi, 2026).
// A moving Voronoi field. Every cell's feature point drifts, the pointer warps
// the field. Six renderings of the same field: hue, distance, and four ways
// of filling cells with portraits.
export default function FaceVoronoi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const modeRef = useRef<VisualMode>("colour");
  const faceCoreRef = useRef(0);
  const [mode, setMode] = useState<VisualMode>("colour");
  const [faceCore, setFaceCore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    let renderer: ShaderRenderer;
    try {
      renderer = createShaderRenderer(gl);
    } catch {
      return;
    }

    let mounted = true;
    void createPortraitAtlas().then((atlas) => {
      if (mounted && atlas) renderer.setPortraitAtlas(atlas);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stillTime = 0;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      renderer.resize(
        Math.max(1, bounds.width),
        Math.max(1, bounds.height),
        Math.min(window.devicePixelRatio || 1, 2),
      );
    };
    const render = (now: number) => {
      if (!reducedMotion.matches) stillTime = now / 1_000;
      renderer.render(
        stillTime,
        mouseRef.current,
        modeRef.current,
        faceCoreRef.current,
      );
      frameRef.current = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frameRef.current = requestAnimationFrame(render);

    return () => {
      mounted = false;
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      renderer.destroy();
    };
  }, []);

  const setMouse = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (clientX - bounds.left) / bounds.width,
      y: 1 - (clientY - bounds.top) / bounds.height,
    };
  };

  const selectMode = (nextMode: VisualMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  };

  const updateFaceCore = (nextFaceCore: number) => {
    faceCoreRef.current = nextFaceCore;
    setFaceCore(nextFaceCore);
  };

  return (
    <main className={styles.root}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="A moving Voronoi distance field. Each cell's feature point moves continuously, and the pointer locally warps the field."
        onPointerMove={(event) => setMouse(event.clientX, event.clientY)}
        onPointerDown={(event) => setMouse(event.clientX, event.clientY)}
      />
      <section className={styles.controls} aria-label="Voronoi display mode">
        <p className={styles.readout}>
          {mode === "colour"
            ? "h 0–360 · s 100 · l 50"
            : mode === "monochrome"
              ? "distance field"
              : mode === "face"
                ? "portrait field"
                : mode === "face-gradient-1"
                  ? "portrait gradient 1"
                  : mode === "face-gradient-2"
                    ? "solid portrait mesh"
                    : "aligned portrait gradient"}
        </p>
        <div className={styles.modeControls}>
          {mode === "face-gradient-3" ? (
            <label className={styles.gradientControl}>
              <span>face core</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={faceCore}
                onChange={(event) => updateFaceCore(Number(event.target.value))}
              />
              <output>{Math.round(faceCore * 100)}</output>
            </label>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              aria-pressed={mode === "colour"}
              onClick={() => selectMode("colour")}
            >
              colour
            </button>
            <button
              type="button"
              aria-pressed={mode === "monochrome"}
              onClick={() => selectMode("monochrome")}
            >
              monochrome
            </button>
            <button
              type="button"
              aria-pressed={mode === "face"}
              onClick={() => selectMode("face")}
            >
              face
            </button>
            <button
              type="button"
              aria-pressed={mode === "face-gradient-1"}
              onClick={() => selectMode("face-gradient-1")}
            >
              face-gradient 1
            </button>
            <button
              type="button"
              aria-pressed={mode === "face-gradient-2"}
              onClick={() => selectMode("face-gradient-2")}
            >
              face-gradient 2
            </button>
            <button
              type="button"
              aria-pressed={mode === "face-gradient-3"}
              onClick={() => selectMode("face-gradient-3")}
            >
              face-gradient 3
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
