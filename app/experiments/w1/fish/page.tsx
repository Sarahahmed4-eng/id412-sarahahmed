"use client";

import { useEffect, useRef, useState } from "react";
import {
  addBubble,
  addBurst,
  addSparkles,
  bubbleAt,
  drawBubbles,
  drawFading,
  drawFishGlow,
  drawSpecks,
  makeSpecks,
  updateBubbles,
  updateFading,
  updateSpecks,
  type Bubble,
  type Particle,
} from "./particles";
import { Reef } from "./Reef";
import styles from "./page.module.css";

// One large fish in an enchanted twilight reef.
// Move the mouse: the fish swims after it, leaving a trail of bubbles.
// Click the fish: its fins flap and it puffs out tiny glowing bubbles. Click a bubble: it pops.
// Scroll up / down: the fish grows / shrinks, and the reef comes closer / fades into the distance.
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const SCROLL_SPEED = 0.0015; // scale change per pixel of scrolling

const FOLLOW_SPEED = 340; // px/s, top speed when following the mouse
const FOLLOW_EASE = 2.2; // how quickly it changes speed and direction (lower = lazier, more delay)
const WANDER_SPEED = 90; // px/s, before the mouse has moved

const SPECKS = 90; // floating specks in the water
const CLICK_BUBBLES = 12; // tiny glowing bubbles per click on the fish
const TRAIL_BUBBLES = 35; // the most trail bubbles at once

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Soft coloured lights in the water: position (%), size (vmax), colour, drift duration (s).
const ORBS = [
  { left: 12, top: 58, size: 55, color: "rgba(140, 100, 255, 0.35)", duration: 34 },
  { left: 82, top: 50, size: 50, color: "rgba(255, 105, 170, 0.22)", duration: 41 },
  { left: 55, top: 85, size: 45, color: "rgba(255, 170, 90, 0.2)", duration: 29 },
  { left: 40, top: 25, size: 40, color: "rgba(120, 255, 230, 0.18)", duration: 37 },
];

export default function Fish() {
  const containerRef = useRef<HTMLElement>(null);
  const fishRef = useRef<HTMLDivElement>(null); // the whole fish: position, size, facing, tilt
  const bodyRef = useRef<SVGGElement>(null); // a slight wiggle while swimming; clicks land here
  const tailRef = useRef<SVGGElement>(null); // the tail beat
  const backRef = useRef<HTMLCanvasElement>(null); // specks, light, trail bubbles (behind the fish)
  const frontRef = useRef<HTMLCanvasElement>(null); // click and reef bubbles, sparkles (in front)
  const farRef = useRef<HTMLDivElement>(null); // reef layers, moved for parallax
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const hazeRef = useRef<HTMLDivElement>(null); // thicker when the fish is small (far away)

  // Counts clicks on the fish. Each click gives the fins a new key, which restarts their flap animation.
  const [flaps, setFlaps] = useState(0);

  useEffect(() => {
    const fish = fishRef.current!;
    const body = bodyRef.current!;
    const tail = tailRef.current!;
    const back = backRef.current!;
    const front = frontRef.current!;
    const backCtx = back.getContext("2d")!;
    const frontCtx = front.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const corals = Array.from(containerRef.current!.querySelectorAll<SVGSVGElement>("[data-coral]"));

    let width = 0;
    let height = 0;
    let baseWidth = 0; // fish width in px at scale 1
    function resize() {
      const dpr = window.devicePixelRatio;
      width = window.innerWidth;
      height = window.innerHeight;
      baseWidth = fish.offsetWidth;
      for (const canvas of [back, front]) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      backCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frontCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // The fish.
    const pos = { x: width / 2, y: height / 2 };
    const vel = { x: 0, y: 0 }; // px/s
    let direction = 1; // 1 = facing right, -1 = facing left
    let facing = 1; // eases towards direction; passing through 0 looks like turning around
    let tilt = 0; // deg, nose up or down
    let scale = 1;
    let targetScale = 1;
    let phase = 0; // tail beat
    let bob = 0; // gentle up and down, px
    let flapUntil = 0; // after a click: an extra happy wiggle until this time
    const wanderTarget = { x: pos.x, y: pos.y };
    let wanderNext = 0;

    // The mouse (or finger). Until it first moves, the fish wanders on its own.
    const pointer = { x: width / 2, y: height / 2, moved: false };

    // Everything small in the water (see particles.ts).
    const specks = makeSpecks(reduced ? 35 : SPECKS, width, height);
    const trail: Bubble[] = []; // behind the fish
    const bubbles: Bubble[] = []; // in front: clicks and the reef
    const sparks: Particle[] = [];
    let trailTimer = 0;
    let reefTimer = 1;

    const parallax = { x: 0, y: 0 };
    let frameCount = 0;
    let last = performance.now();
    let frame = 0;

    // Where the fish may go: inside the scene, and closer to the middle the bigger it is.
    function keepInside(target: { x: number; y: number }) {
      const w = baseWidth * scale;
      const minX = Math.max(width * 0.06, w * 0.5 + 8); // the whole fish, tail to nose, stays on screen
      const minY = Math.max(height * 0.14, w * 0.3 + 16);
      const maxY = Math.min(height * 0.8, height - w * 0.3 - 16);
      return {
        x: minX < width - minX ? clamp(target.x, minX, width - minX) : width / 2,
        y: minY < maxY ? clamp(target.y, minY, maxY) : height / 2,
      };
    }

    // A point on the fish: `along` its length (fraction of its width, + towards the head), turned with it.
    function onFish(along: number) {
      const offset = along * baseWidth * scale * facing;
      const angle = (tilt * facing * Math.PI) / 180;
      return { x: pos.x + offset * Math.cos(angle), y: pos.y + bob + offset * Math.sin(angle) };
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.moved = true;
    }
    window.addEventListener("pointermove", onPointerMove);

    // A click (or tap) pops a bubble if there is one under it; otherwise, on the fish, it flaps.
    // It also counts as a pointer position, so the fish keeps following.
    function onPointerDown(event: PointerEvent) {
      onPointerMove(event);
      const hit = bubbleAt(bubbles, event.clientX, event.clientY);
      if (hit >= 0) {
        addSparkles(sparks, bubbles[hit].x, bubbles[hit].y, reduced ? 5 : 12);
        bubbles.splice(hit, 1);
      } else if (body.contains(event.target as Node)) {
        setFlaps((n) => n + 1);
        flapUntil = performance.now() + 1400;
        const mouth = onFish(0.44);
        addBurst(bubbles, mouth.x, mouth.y, reduced ? 4 : CLICK_BUBBLES);
      }
    }
    window.addEventListener("pointerdown", onPointerDown);

    // Scroll up (negative deltaY) → bigger, down → smaller.
    // passive: false lets preventDefault stop the page itself from scrolling.
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      targetScale = clamp(targetScale * Math.exp(-event.deltaY * SCROLL_SPEED), MIN_SCALE, MAX_SCALE);
    }
    window.addEventListener("wheel", onWheel, { passive: false });

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1); // seconds since the last frame
      last = now;
      frameCount++;

      scale += (targetScale - scale) * (1 - Math.exp(-dt * 6));
      const w = baseWidth * scale;

      // 1. Target: the mouse, with the fish's mouth (not its middle) heading for it.
      //    Before the mouse has moved, a calm spot nearby.
      let target = wanderTarget;
      let maxSpeed = WANDER_SPEED;
      if (pointer.moved) {
        target = { x: pointer.x - direction * w * 0.32, y: pointer.y };
        maxSpeed = FOLLOW_SPEED;
      } else if (now > wanderNext) {
        Object.assign(wanderTarget, { x: width / 2 + random(-0.25, 0.25) * width, y: height * random(0.35, 0.55) });
        wanderNext = now + random(3000, 5000);
      }
      if (reduced) maxSpeed *= 0.6;
      target = keepInside(target);

      // 2. Steer: ease the velocity towards "straight at the target", slowing down on arrival.
      //    The easing is the slight delay that makes it feel like it is following your hand.
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const distance = Math.hypot(dx, dy) || 1;
      const wanted = Math.min(maxSpeed, distance * 2);
      const previousVx = vel.x;
      vel.x += ((dx / distance) * wanted - vel.x) * (1 - Math.exp(-dt * FOLLOW_EASE));
      vel.y += ((dy / distance) * wanted - vel.y) * (1 - Math.exp(-dt * FOLLOW_EASE));
      Object.assign(pos, keepInside({ x: pos.x + vel.x * dt, y: pos.y + vel.y * dt }));
      const speed = Math.hypot(vel.x, vel.y);
      const effort = Math.min(speed / 400, 1); // 0 = resting, 1 = full speed

      // 3. Face the way it swims (with a margin, so small mouse moves do not make it flip back and forth).
      if (vel.x > 40) direction = 1;
      else if (vel.x < -40) direction = -1;
      facing += (direction - facing) * (1 - Math.exp(-dt * 5));

      // Nose follows the vertical direction, and lifts a little when speeding up.
      const forwardAccel = ((vel.x - previousVx) / dt) * direction;
      const wantedTilt = clamp((Math.atan2(vel.y, Math.abs(vel.x) + 80) * 180) / Math.PI, -15, 15) - clamp(forwardAccel / 1500, -1, 1) * 4;
      tilt += (wantedTilt - tilt) * (1 - Math.exp(-dt * 4));

      // Tail beats faster and wider the faster it swims; the body follows a little behind.
      // After a click, an extra quick wiggle that fades out.
      const happy = Math.max(0, (flapUntil - now) / 1400);
      phase += dt * (3 + effort * 10 + happy * 8) * (reduced ? 0.6 : 1);
      tail.style.transform = `rotate(${Math.sin(phase) * (8 + effort * 22 + happy * 14)}deg)`;
      body.style.transform = `rotate(${Math.sin(phase - 0.8) * (1 + effort * 3 + happy * 3)}deg)`;
      bob = Math.sin(now / 900) * 8 * (1 - effort * 0.5);
      fish.style.transform = `translate(${pos.x}px, ${pos.y + bob}px) translate(-50%, -50%) scale(${scale}) rotate(${tilt * facing}deg) scaleX(${facing})`;

      // 4. The reef: parallax with the mouse, closer and clearer when the fish is big.
      const near = (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE); // 0 = far away, 1 = close up
      parallax.x += (pointer.x / width - 0.5 - parallax.x) * (1 - Math.exp(-dt * 2));
      parallax.y += (pointer.y / height - 0.5 - parallax.y) * (1 - Math.exp(-dt * 2));
      farRef.current!.style.transform = `translate(${-parallax.x * 10}px, ${-parallax.y * 5}px) scale(${1 + near * 0.04})`;
      midRef.current!.style.transform = `translate(${-parallax.x * 24}px, ${-parallax.y * 9}px) scale(${1 + near * 0.08})`;
      nearRef.current!.style.transform = `translate(${-parallax.x * 46}px, ${-parallax.y * 14}px) scale(${1 + near * 0.14})`;
      hazeRef.current!.style.opacity = String(0.85 - near * 0.55);

      // Front coral close to the fish lights up (checked every 6 frames; CSS fades it).
      if (frameCount % 6 === 0) {
        for (const coral of corals) {
          const box = coral.getBoundingClientRect();
          const close = Math.hypot(box.left + box.width / 2 - pos.x, box.top + box.height * 0.35 - pos.y) < w * 0.3 + box.width * 0.3;
          if (close !== coral.hasAttribute("data-lit")) coral.toggleAttribute("data-lit", close);
        }
      }

      // 5. Bubbles. The trail comes from behind the gills: more when swimming, a few when resting.
      trailTimer -= dt;
      if (trailTimer <= 0 && trail.length < TRAIL_BUBBLES) {
        const from = onFish(random(-0.1, 0.12));
        addBubble(trail, {
          x: from.x + random(-0.05, 0.05) * w,
          y: from.y + random(-0.06, 0.04) * w,
          r: random(2.5, 6.5) * Math.sqrt(scale),
          life: random(1.6, 3.2),
          vx: -vel.x * 0.25 + random(-12, 12),
          vy: -vel.y * 0.25 - random(5, 25),
        });
        trailTimer = (reduced ? 0.6 : 0.28 - effort * 0.2) * random(0.7, 1.3);
      }
      // Now and then, a small group of bubbles rises from the reef.
      reefTimer -= dt;
      if (reefTimer <= 0) {
        const x = random(0.08, 0.92) * width;
        const y = height * random(0.85, 0.95);
        const count = Math.floor(random(3, 7));
        for (let i = 0; i < count; i++) addBubble(bubbles, { x: x + random(-8, 8), y: y + i * random(10, 22), r: random(1.5, 4.5), life: random(9, 14) });
        reefTimer = random(2.5, 5) * (reduced ? 2 : 1);
      }

      const wake = { x: pos.x, y: pos.y, vx: vel.x, vy: vel.y, radius: w * 0.6 + 50 };
      updateSpecks(specks, dt, width, height, wake);
      updateBubbles(trail, dt, wake);
      updateBubbles(bubbles, dt, wake);
      updateFading(sparks, dt);

      backCtx.clearRect(0, 0, width, height);
      drawFishGlow(backCtx, pos.x, pos.y + bob, w * 0.9, 0.16 + effort * 0.1 + happy * 0.12, now / 1000);
      drawSpecks(backCtx, specks, -parallax.x * 30, -parallax.y * 12);
      drawBubbles(backCtx, trail, now / 1000);
      frontCtx.clearRect(0, 0, width, height);
      drawBubbles(frontCtx, bubbles, now / 1000);
      drawFading(frontCtx, sparks);

      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  // No flap class before the first click, so the fins rest when the page opens.
  const flap = flaps > 0 ? styles.flap : "";

  return (
    <main ref={containerRef} className={styles.container}>
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={styles.orb}
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: `${orb.size}vmax`,
            height: `${orb.size}vmax`,
            background: `radial-gradient(circle, ${orb.color}, transparent 65%)`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}

      {/* Sunbeams fanning down from the surface, and two slowly sliding layers of caustic light.
          The caustics are SVG noise turned into thin bright lines; they are drawn once and only moved. */}
      <div className={styles.beams} />
      <div className={`${styles.beams} ${styles.beamsSlow}`} />
      <svg className={styles.caustics} aria-hidden="true">
        <filter id="caustic-a" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.011 0.017" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.86  -7 0 0 0 1.25" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <rect width="100%" height="100%" filter="url(#caustic-a)" />
      </svg>
      <svg className={`${styles.caustics} ${styles.causticsSlow}`} aria-hidden="true">
        <filter id="caustic-b" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.008 0.013" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0.75  0 0 0 0 1  0 0 0 0 0.95  -7 0 0 0 1.2" />
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <rect width="100%" height="100%" filter="url(#caustic-b)" />
      </svg>

      <Reef farRef={farRef} midRef={midRef} frontRef={nearRef}>
        <div ref={hazeRef} className={styles.haze} />
        <canvas ref={backRef} className={`${styles.canvas} ${styles.light}`} />
      </Reef>

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

          {/* Clicks on the fish (but not the empty space around it) are handled in onPointerDown. */}
          <g ref={bodyRef} className={styles.body}>
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

      <canvas ref={frontRef} className={styles.canvas} />

      <p className={styles.hint}>move the mouse · click the fish · scroll</p>
    </main>
  );
}
