"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// One large fish in a calm underwater scene.
// Move the mouse: the fish swims to the opposite side of the screen and turns to face where it goes.
// Click the fish: its fins flap. Scroll up / down: the fish grows / shrinks.
const SWIM_EASE = 1.6; // how quickly the fish catches up with its target (higher = faster)
const TURN_EASE = 5; // how quickly it turns around
const SIZE_EASE = 8; // how quickly it grows or shrinks
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const SCROLL_SPEED = 0.0015; // scale change per pixel of scrolling
const EDGE = 0.18; // the fish stays this fraction of the screen width away from the edges

// Rising bubbles in the background: left position (%), size (px), duration and delay (s).
// Fixed numbers (not Math.random) so the server and the browser draw the same thing.
const BUBBLES = [
  { left: 8, size: 10, duration: 14, delay: 0 },
  { left: 19, size: 6, duration: 11, delay: 4 },
  { left: 33, size: 14, duration: 17, delay: 2 },
  { left: 52, size: 8, duration: 13, delay: 7 },
  { left: 64, size: 12, duration: 16, delay: 1 },
  { left: 78, size: 7, duration: 12, delay: 5 },
  { left: 90, size: 11, duration: 15, delay: 9 },
];

export default function Fish() {
  const fishRef = useRef<HTMLDivElement>(null); // the whole fish: position, size, facing
  const bodyRef = useRef<SVGGElement>(null); // a slight wiggle while swimming
  const tailRef = useRef<SVGGElement>(null); // the tail beat

  // Counts clicks. Each click gives the fins a new key, which restarts their flap animation.
  const [flaps, setFlaps] = useState(0);

  useEffect(() => {
    const fish = fishRef.current!;
    const body = bodyRef.current!;
    const tail = tailRef.current!;

    let x = window.innerWidth / 2; // where the fish is, px from the left
    let targetX = x; // where it swims to
    let direction = 1; // 1 = facing right, -1 = facing left
    let facing = 1; // eases towards direction; passing through 0 looks like turning around
    let scale = 1;
    let targetScale = 1;
    let phase = 0; // tail beat
    let last = performance.now();
    let frame = 0;

    // Swim to the mirror point of the pointer: pointer on the left → fish goes right.
    function onPointer(event: PointerEvent) {
      targetX = window.innerWidth - event.clientX;
    }
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerdown", onPointer);

    // Scroll up (negative deltaY) → bigger, down → smaller.
    // passive: false lets preventDefault stop the page itself from scrolling.
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      targetScale *= Math.exp(-event.deltaY * SCROLL_SPEED);
      targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));
    }
    window.addEventListener("wheel", onWheel, { passive: false });

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1); // seconds since the last frame
      last = now;

      // Keep the target on screen, also after a resize.
      const width = window.innerWidth;
      targetX = Math.min(width * (1 - EDGE), Math.max(width * EDGE, targetX));

      // Move part of the way to the target every frame: fast when far, slow when close.
      const previousX = x;
      x += (targetX - x) * (1 - Math.exp(-dt * SWIM_EASE));
      const speed = Math.min(Math.abs(x - previousX) / dt / 400, 1); // 0 = resting, 1 = full speed

      if (targetX > x + 4) direction = 1;
      if (targetX < x - 4) direction = -1;
      facing += (direction - facing) * (1 - Math.exp(-dt * TURN_EASE));
      scale += (targetScale - scale) * (1 - Math.exp(-dt * SIZE_EASE));

      // The tail beats faster and wider the faster the fish swims; the body follows a little behind.
      phase += dt * (3 + speed * 9);
      tail.style.transform = `rotate(${Math.sin(phase) * (8 + speed * 22)}deg)`;
      body.style.transform = `rotate(${Math.sin(phase - 0.8) * (1 + speed * 3)}deg)`;

      const bob = Math.sin(now / 900) * 10; // a gentle up and down, px
      fish.style.transform = `translate(${x}px, ${bob}px) translate(-50%, -50%) scale(${scale}) scaleX(${facing})`;

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  // No flap class before the first click, so the fins rest when the page opens.
  const flap = flaps > 0 ? styles.flap : "";

  return (
    <main className={styles.container}>
      <div className={styles.light} />

      {BUBBLES.map((bubble, i) => (
        <span
          key={i}
          className={styles.bubble}
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Seaweed and sand along the bottom. */}
      <svg className={styles.floor} viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path className={styles.weed} d="M120 200 C 100 150, 150 120, 125 70 C 110 40, 135 20, 130 0 C 150 30, 140 60, 150 90 C 165 130, 130 160, 150 200 Z" />
        <path className={`${styles.weed} ${styles.weedSlow}`} d="M170 200 C 160 165, 190 140, 175 110 C 165 90, 185 70, 182 50 C 198 75, 190 100, 198 125 C 205 155, 185 175, 195 200 Z" />
        <path className={styles.weed} d="M820 200 C 800 160, 845 130, 825 90 C 812 60, 835 40, 830 20 C 852 50, 842 80, 852 110 C 862 145, 832 170, 850 200 Z" />
        <path className={styles.sand} d="M0 170 C 150 150, 300 185, 500 168 C 700 152, 850 180, 1000 165 L 1000 200 L 0 200 Z" />
      </svg>

      <div ref={fishRef} className={styles.fish}>
        {/* Drawn facing right, 400 × 240. scaleX(-1) in the loop mirrors it to face left. */}
        <svg viewBox="0 0 400 240" className={styles.svg}>
          <defs>
            <linearGradient id="fish-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1f4a66" />
              <stop offset="0.55" stopColor="#3a7f86" />
              <stop offset="1" stopColor="#8fc4bb" />
            </linearGradient>
            <linearGradient id="fish-fin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2f6f78" />
              <stop offset="1" stopColor="#7bb5ad" />
            </linearGradient>
          </defs>

          {/* Clicking anywhere on the fish (but not the empty space around it) flaps the fins. */}
          <g ref={bodyRef} className={styles.body} onClick={() => setFlaps((n) => n + 1)}>
            <g ref={tailRef} className={styles.tail}>
              <path d="M104 120 C 75 96, 48 62, 18 52 C 36 88, 36 152, 18 188 C 48 178, 75 144, 104 120 Z" fill="url(#fish-fin)" />
              <path d="M98 120 C 70 104, 50 84, 30 72 M98 120 L 34 120 M98 120 C 70 136, 50 156, 30 168" className={styles.line} />
            </g>

            <g key={`dorsal-${flaps}`} className={`${styles.dorsal} ${flap}`}>
              <path d="M165 74 C 185 26, 238 18, 272 64 C 238 60, 202 64, 165 74 Z" fill="url(#fish-fin)" />
            </g>
            <g key={`pelvic-${flaps}`} className={`${styles.pelvic} ${flap}`}>
              <path d="M178 166 C 186 196, 214 208, 236 190 C 220 182, 198 175, 178 166 Z" fill="url(#fish-fin)" />
            </g>

            <path d="M92 120 C 122 62, 230 46, 318 84 C 352 99, 370 114, 376 122 C 370 132, 352 146, 318 158 C 230 194, 122 178, 92 120 Z" fill="url(#fish-body)" />
            {/* Soft scale arcs and the gill. */}
            <path d="M160 100 q 12 14 0 28 M190 92 q 14 16 0 34 M220 88 q 15 18 0 38 M250 88 q 15 18 0 38 M175 132 q 12 14 0 28 M205 132 q 14 16 0 30 M235 134 q 14 15 0 28" className={styles.scales} />
            <path d="M292 90 C 276 110, 276 138, 294 156" className={styles.line} />
            <path d="M362 128 q -8 4 -16 2" className={styles.line} />

            <circle cx="330" cy="108" r="10" fill="#f4ecd8" />
            <circle cx="332" cy="108" r="5.5" fill="#132f42" />
            <circle cx="334" cy="105.5" r="1.8" fill="#f4ecd8" />

            <g key={`pectoral-${flaps}`} className={`${styles.pectoral} ${flap}`}>
              <path d="M272 134 C 252 148, 232 166, 220 182 C 246 180, 266 164, 276 142 Z" fill="url(#fish-fin)" opacity="0.9" />
            </g>
          </g>
        </svg>
      </div>

      <p className={styles.hint}>move · click the fish · scroll</p>
    </main>
  );
}
