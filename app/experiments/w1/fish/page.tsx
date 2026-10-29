"use client";

import { useEffect, useRef, useState } from "react";
import {
  addBubbles,
  addRipple,
  addSparkles,
  addTrail,
  bubbleAt,
  drawBubbles,
  drawFading,
  drawSpecks,
  makeSpecks,
  updateAndDrawRipples,
  updateBubbles,
  updateFading,
  updateSpecks,
  type Bubble,
  type Particle,
  type Ripple,
} from "./particles";
import { Reef } from "./Reef";
import styles from "./page.module.css";

// One large fish in a dreamy coral reef.
// Move the mouse slowly: the fish comes to look at it from a polite distance.
// Move it fast near the fish: it darts away. Stop: it slows down and explores on its own.
// Click the fish: fins flap and it blows bubbles. Click a bubble: it pops into sparkles.
// Scroll up / down: the fish grows / shrinks, and the reef comes closer / fades into the distance.
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.8;
const SCROLL_SPEED = 0.0015; // scale change per pixel of scrolling

const FOLLOW_SPEED = 260; // px/s, top speeds in each mood
const DART_SPEED = 720;
const CHASE_SPEED = 240;
const WANDER_SPEED = 110;
const FAST_MOUSE = 1600; // px/s: a mouse faster than this, close to the fish, makes it dart away
const IDLE_AFTER = 1400; // ms without mouse movement before the fish explores on its own

const SPECKS = 70; // floating specks in the water
const CLICK_BUBBLES = 9; // bubbles per click on the fish

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Light rays from the surface: left position (%), width (vw), tilt (deg), delay (s).
const RAYS = [
  { left: 8, width: 7, tilt: 16, delay: 0 },
  { left: 24, width: 12, tilt: 20, delay: 3 },
  { left: 45, width: 6, tilt: 14, delay: 6 },
  { left: 60, width: 10, tilt: 18, delay: 1.5 },
  { left: 80, width: 8, tilt: 22, delay: 4.5 },
];

export default function Fish() {
  const containerRef = useRef<HTMLElement>(null);
  const fishRef = useRef<HTMLDivElement>(null); // the whole fish: position, size, facing, tilt
  const bodyRef = useRef<SVGGElement>(null); // a slight wiggle while swimming; clicks land here
  const tailRef = useRef<SVGGElement>(null); // the tail beat
  const backRef = useRef<HTMLCanvasElement>(null); // specks, trail, ripples (behind the fish)
  const frontRef = useRef<HTMLCanvasElement>(null); // bubbles, sparkles (in front)
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

    // Its moods: darting away, chasing a bubble, wandering.
    let dartUntil = 0;
    let dartCooldown = 0;
    const dartTarget = { x: 0, y: 0 };
    let chase: Bubble | null = null;
    let chaseUntil = 0;
    let chaseCooldown = 0;
    const wanderTarget = { x: pos.x, y: pos.y };
    let wanderNext = 0;

    // The mouse (or finger). Its speed (px/s) is measured once per frame in draw().
    const pointer = { x: width / 2, y: height / 2, speed: 0, lastMove: -Infinity };
    const pointerBefore = { x: pointer.x, y: pointer.y }; // where it was on the previous frame

    // Everything small in the water (see particles.ts).
    const specks = makeSpecks(reduced ? 30 : SPECKS, width, height);
    const trail: Particle[] = [];
    const sparks: Particle[] = [];
    const bubbles: Bubble[] = [];
    const ripples: Ripple[] = [];
    let rippleTimer = 0;
    let ambientTimer = 0;

    const parallax = { x: 0, y: 0 };
    let frameCount = 0;
    let last = performance.now();
    let frame = 0;

    // Where the fish may go: away from the edges, and closer to the middle the bigger it is.
    function keepInside(target: { x: number; y: number }) {
      const w = baseWidth * scale;
      const minX = Math.max(width * 0.12, w * 0.4);
      const minY = Math.max(height * 0.22, w * 0.3 + 16);
      const maxY = Math.min(height * 0.66, height - w * 0.3 - 16);
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

    function pop(index: number) {
      const bubble = bubbles[index];
      addSparkles(sparks, bubble.x, bubble.y, reduced ? 5 : 12);
      bubbles.splice(index, 1);
      if (chase === bubble) chase = null;
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.lastMove = performance.now();
    }
    window.addEventListener("pointermove", onPointerMove);

    // A click (or tap) pops a bubble if there is one under it; otherwise, on the fish, it flaps and blows bubbles.
    function onPointerDown(event: PointerEvent) {
      pointer.x = pointerBefore.x = event.clientX; // a tap jumps there, it is not a fast movement
      pointer.y = pointerBefore.y = event.clientY;
      pointer.lastMove = performance.now();
      const hit = bubbleAt(bubbles, event.clientX, event.clientY);
      if (hit >= 0) {
        pop(hit);
      } else if (body.contains(event.target as Node)) {
        setFlaps((n) => n + 1);
        const mouth = onFish(0.42);
        addBubbles(bubbles, mouth.x, mouth.y, reduced ? 4 : CLICK_BUBBLES, true);
        addSparkles(sparks, mouth.x, mouth.y, reduced ? 3 : 8);
        chaseCooldown = performance.now() + 1500; // let the new bubbles rise a little before chasing them
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

      scale += (targetScale - scale) * (1 - Math.exp(-dt * 8));
      const w = baseWidth * scale;
      // Mouse speed: distance since the last frame, smoothed over a few frames.
      const pointerSpeed = Math.hypot(pointer.x - pointerBefore.x, pointer.y - pointerBefore.y) / Math.max(dt, 0.001);
      pointer.speed += (pointerSpeed - pointer.speed) * (1 - Math.exp(-dt * 12));
      Object.assign(pointerBefore, { x: pointer.x, y: pointer.y });
      const idle = now - pointer.lastMove > IDLE_AFTER;
      const toPointer = Math.hypot(pointer.x - pos.x, pointer.y - pos.y) || 1;

      // 1. Choose a target and a top speed, depending on the mood.
      let target = wanderTarget;
      let maxSpeed = WANDER_SPEED;
      let steer = 1.5; // how quickly the fish changes its speed and direction
      if (!idle && now > dartCooldown && pointer.speed > FAST_MOUSE && toPointer < 360 + w / 2) {
        // Startled: dart away from the mouse.
        const away = 240 + w * 0.4;
        Object.assign(dartTarget, keepInside({ x: pos.x + ((pos.x - pointer.x) / toPointer) * away, y: pos.y + ((pos.y - pointer.y) / toPointer) * away * 0.6 }));
        dartUntil = now + 900;
        dartCooldown = now + 2200;
        chase = null;
      }
      if (now < dartUntil) {
        target = dartTarget;
        maxSpeed = DART_SPEED;
        steer = 6;
      } else {
        // Playful: chase a bubble near its mouth, now and then.
        const mouth = onFish(0.42);
        if (!chase && now > chaseCooldown) {
          const near = bubbles.filter((b) => Math.hypot(b.x - mouth.x, b.y - mouth.y) < 260);
          if (near.length) {
            chase = near[Math.floor(Math.random() * near.length)];
            chaseUntil = now + 1600;
          }
        }
        if (chase && (now > chaseUntil || !bubbles.includes(chase))) {
          chase = null;
          chaseCooldown = now + 1500;
        }
        if (chase) {
          const side = Math.sign(chase.x - pos.x) || direction;
          target = { x: chase.x - side * w * 0.42, y: chase.y };
          maxSpeed = CHASE_SPEED;
          steer = 4;
          if (Math.hypot(mouth.x - chase.x, mouth.y - chase.y) < chase.r + 14 * scale) {
            pop(bubbles.indexOf(chase));
            chaseCooldown = now + 1500;
          }
        } else if (!idle) {
          // Curious: stay a comfortable distance from the mouse, on the side the fish is already on.
          const comfort = 120 + w * 0.55;
          target = { x: pointer.x + ((pos.x - pointer.x) / toPointer) * comfort, y: pointer.y + ((pos.y - pointer.y) / toPointer) * comfort };
          maxSpeed = FOLLOW_SPEED;
          steer = 2.5;
        } else if (now > wanderNext || Math.hypot(wanderTarget.x - pos.x, wanderTarget.y - pos.y) < 30) {
          // Idle: explore a spot nearby, drifting a little towards the middle so it stays easy to see.
          Object.assign(wanderTarget, keepInside({
            x: pos.x + (width / 2 - pos.x) * 0.3 + random(-200, 200),
            y: pos.y + (height / 2 - pos.y) * 0.3 + random(-70, 70),
          }));
          wanderNext = now + random(2500, 4500);
        }
      }
      if (reduced) maxSpeed *= 0.6;
      target = keepInside(target);

      // 2. Steer: ease the velocity towards "straight at the target", slowing down on arrival.
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const distance = Math.hypot(dx, dy) || 1;
      const wanted = Math.min(maxSpeed, distance * 2);
      const previousVx = vel.x;
      vel.x += ((dx / distance) * wanted - vel.x) * (1 - Math.exp(-dt * steer));
      vel.y += ((dy / distance) * wanted - vel.y) * (1 - Math.exp(-dt * steer));
      Object.assign(pos, keepInside({ x: pos.x + vel.x * dt, y: pos.y + vel.y * dt }));
      const speed = Math.hypot(vel.x, vel.y);
      const effort = Math.min(speed / 400, 1); // 0 = resting, 1 = full speed

      // 3. Face the way it swims; when hovering near the mouse, turn to look at it.
      if (vel.x > 30) direction = 1;
      else if (vel.x < -30) direction = -1;
      else if (!idle && !chase && speed < 40 && Math.abs(pointer.x - pos.x) > 20) direction = pointer.x > pos.x ? 1 : -1;
      facing += (direction - facing) * (1 - Math.exp(-dt * 5));

      // Nose follows the vertical direction, and lifts a little when speeding up.
      const forwardAccel = ((vel.x - previousVx) / dt) * direction;
      const wantedTilt = clamp((Math.atan2(vel.y, Math.abs(vel.x) + 80) * 180) / Math.PI, -15, 15) - clamp(forwardAccel / 1500, -1, 1) * 4;
      tilt += (wantedTilt - tilt) * (1 - Math.exp(-dt * 4));

      // The tail beats faster and wider the faster the fish swims; the body follows a little behind.
      phase += dt * (3 + effort * 10) * (reduced ? 0.6 : 1);
      tail.style.transform = `rotate(${Math.sin(phase) * (8 + effort * 22)}deg)`;
      body.style.transform = `rotate(${Math.sin(phase - 0.8) * (1 + effort * 3)}deg)`;
      bob = Math.sin(now / 900) * 8 * (1 - effort * 0.5);
      fish.style.transform = `translate(${pos.x}px, ${pos.y + bob}px) translate(-50%, -50%) scale(${scale}) rotate(${tilt * facing}deg) scaleX(${facing})`;

      // 4. The reef: parallax with the mouse, closer and clearer when the fish is big.
      const near = (scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE); // 0 = far away, 1 = close up
      parallax.x += (pointer.x / width - 0.5 - parallax.x) * (1 - Math.exp(-dt * 3));
      parallax.y += (pointer.y / height - 0.5 - parallax.y) * (1 - Math.exp(-dt * 3));
      farRef.current!.style.transform = `translate(${-parallax.x * 12}px, ${-parallax.y * 6}px) scale(${1 + near * 0.04})`;
      midRef.current!.style.transform = `translate(${-parallax.x * 26}px, ${-parallax.y * 10}px) scale(${1 + near * 0.08})`;
      nearRef.current!.style.transform = `translate(${-parallax.x * 48}px, ${-parallax.y * 14}px) scale(${1 + near * 0.14})`;
      hazeRef.current!.style.opacity = String(0.6 - near * 0.5);

      // Front coral close to the fish lights up (checked every 6 frames; CSS fades it).
      if (frameCount % 6 === 0) {
        for (const coral of corals) {
          const box = coral.getBoundingClientRect();
          const close = Math.hypot(box.left + box.width / 2 - pos.x, box.top + box.height * 0.35 - pos.y) < w * 0.3 + box.width * 0.3;
          if (close !== coral.hasAttribute("data-lit")) coral.toggleAttribute("data-lit", close);
        }
      }

      // 5. Particles: a bubble now and then from the reef, a trail and ripples behind the swimming fish.
      ambientTimer -= dt;
      if (ambientTimer <= 0) {
        addBubbles(bubbles, random(0.05, 0.95) * width, height + 10, 1, false);
        ambientTimer = random(1.2, 2.4) * (reduced ? 3 : 1);
      }
      if (!reduced && effort > 0.12) {
        const tailEnd = onFish(-0.42);
        addTrail(trail, tailEnd.x, tailEnd.y, vel.x, vel.y);
      }
      rippleTimer -= dt;
      if (!reduced && speed > 70 && rippleTimer <= 0) {
        addRipple(ripples, pos.x, pos.y + bob, w * 0.35);
        rippleTimer = 0.45;
      }
      updateSpecks(specks, dt, width, height, { x: pos.x, y: pos.y, vx: vel.x, vy: vel.y, radius: w * 0.6 + 60 });
      updateFading(trail, dt);
      updateFading(sparks, dt);
      updateBubbles(bubbles, dt);

      backCtx.clearRect(0, 0, width, height);
      drawSpecks(backCtx, specks);
      updateAndDrawRipples(backCtx, ripples, dt);
      drawFading(backCtx, trail);
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
      <div className={styles.rays}>
        {RAYS.map((ray, i) => (
          <span
            key={i}
            className={styles.ray}
            style={{ left: `${ray.left}%`, width: `${ray.width}vw`, rotate: `${ray.tilt}deg`, animationDelay: `${-ray.delay}s` }}
          />
        ))}
      </div>
      <div className={styles.caustics} />

      <Reef farRef={farRef} midRef={midRef} frontRef={nearRef}>
        <div ref={hazeRef} className={styles.haze} />
        <canvas ref={backRef} className={styles.canvas} />
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

      <p className={styles.hint}>move slowly or quickly · click the fish · click a bubble · scroll</p>
    </main>
  );
}
