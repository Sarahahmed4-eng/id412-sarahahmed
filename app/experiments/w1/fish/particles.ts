// Everything small that moves in the water, drawn on two canvases by the loop in page.tsx:
// behind the fish: floating specks, the soft light around the fish and its trail of bubbles;
// in front of the fish: bubbles from clicks and from the reef, and the sparkles they pop into.
// Every list has a maximum length, so the page never fills up with particles.

export const MAX_BUBBLES = 45;
export const MAX_SPARKS = 120;

// Tints for glowing bubbles and sparkles: aqua, lavender, coral pink, gold.
const HUES = [185, 265, 335, 45];

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomHue() {
  return HUES[Math.floor(Math.random() * HUES.length)];
}

// The fish, as the particles see it: where it is, how it moves, how far its wake reaches.
export type FishWake = { x: number; y: number; vx: number; vy: number; radius: number };

// --- Floating specks, at different depths ---

// depth: 0.3 = far (small, faint, slow) … 1 = near (bigger, brighter, faster, more parallax).
export type Speck = { x: number; y: number; vx: number; vy: number; depth: number; hue: number; phase: number };

export function makeSpecks(count: number, width: number, height: number): Speck[] {
  return Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    vx: 0,
    vy: 0,
    depth: random(0.3, 1),
    hue: Math.random() < 0.3 ? 175 : 48, // a few glow cyan, most are warm motes
    phase: random(0, 100),
  }));
}

// Specks drift on a slow current; near ones move faster. The fish pushes them along and swirls them.
export function updateSpecks(specks: Speck[], dt: number, width: number, height: number, fish: FishWake) {
  for (const s of specks) {
    const dx = s.x - fish.x;
    const dy = s.y - fish.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < fish.radius) {
      const strength = (1 - distance / fish.radius) * dt * 3;
      s.vx += (fish.vx * 0.5 - (dy / distance) * 30) * strength;
      s.vy += (fish.vy * 0.5 + (dx / distance) * 30) * strength;
    }
    s.vx += (4 + s.depth * 8 - s.vx) * dt * 0.8;
    s.vy += (-2 - s.depth * 4 - s.vy) * dt * 0.8;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.phase += dt;
    if (s.x < -20) s.x = width + 20;
    if (s.x > width + 20) s.x = -20;
    if (s.y < -20) s.y = height + 20;
    if (s.y > height + 20) s.y = -20;
  }
}

// shiftX/Y: parallax offset for the nearest specks; far ones move less.
export function drawSpecks(ctx: CanvasRenderingContext2D, specks: Speck[], shiftX: number, shiftY: number) {
  for (const s of specks) {
    const x = s.x + shiftX * s.depth;
    const y = s.y + shiftY * s.depth;
    const alpha = (0.2 + 0.5 * s.depth) * (0.6 + 0.4 * Math.sin(s.phase * 1.3));
    const size = 0.5 + s.depth * 1.6;
    if (s.hue === 175) {
      // Bioluminescent: a faint halo around the dot.
      ctx.fillStyle = `hsla(175, 100%, 75%, ${alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = `hsla(${s.hue}, 100%, 88%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Soft light that travels with the fish ---

export function drawFishGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, strength: number, time: number) {
  const hue = 175 + Math.sin(time / 3) * 20; // slowly shifts between aqua and teal-green
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, `hsla(${hue}, 90%, 72%, ${strength})`);
  light.addColorStop(0.5, `hsla(${hue + 20}, 90%, 65%, ${strength * 0.35})`);
  light.addColorStop(1, "hsla(190, 90%, 60%, 0)");
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// --- Bubbles ---

// life counts down in seconds; the bubble fades in, then fades out over its last second.
// hue: a tinted, glowing bubble; null: a clear one.
export type Bubble = { x: number; y: number; r: number; vx: number; vy: number; phase: number; life: number; maxLife: number; hue: number | null };

export function addBubble(
  bubbles: Bubble[],
  b: { x: number; y: number; r: number; life: number; vx?: number; vy?: number; hue?: number | null },
) {
  if (bubbles.length >= MAX_BUBBLES) bubbles.shift();
  bubbles.push({ vx: 0, vy: 0, hue: null, ...b, phase: random(0, Math.PI * 2), maxLife: b.life });
}

// A small burst of tiny glowing bubbles (for a click on the fish).
export function addBurst(bubbles: Bubble[], x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = random(-Math.PI, 0); // upwards, fanning out
    const speed = random(30, 110);
    addBubble(bubbles, { x, y, r: random(2.5, 6.5), life: random(2.5, 4.5), vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, hue: randomHue() });
  }
}

// Bubbles float up (big ones faster), wobble a little, and get pushed by the fish's wake.
export function updateBubbles(bubbles: Bubble[], dt: number, fish: FishWake) {
  for (const b of bubbles) {
    const dx = b.x - fish.x;
    const dy = b.y - fish.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < fish.radius) {
      const strength = (1 - distance / fish.radius) * dt * 2;
      b.vx += (fish.vx * 0.4 + (dx / distance) * 40) * strength;
      b.vy += (fish.vy * 0.4 + (dy / distance) * 40) * strength;
    }
    b.vx += (0 - b.vx) * dt * 1.5;
    b.vy += (-(18 + b.r * 7) - b.vy) * dt * 1.5;
    b.phase += dt * 2.5;
    b.x += (b.vx + Math.sin(b.phase) * 10) * dt;
    b.y += b.vy * dt;
    b.life -= dt;
  }
  for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].life <= 0 || bubbles[i].y < -20) bubbles.splice(i, 1);
}

export function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[], time: number) {
  for (const b of bubbles) {
    const alpha = Math.min(1, b.life, (b.maxLife - b.life) * 5);
    if (alpha <= 0) continue;
    const hue = b.hue === null ? 185 : b.hue + Math.sin(time * 1.5 + b.phase) * 25;
    const saturation = b.hue === null ? 60 : 95;

    // Glow around it.
    const glow = ctx.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r * 2.6);
    glow.addColorStop(0, `hsla(${hue}, ${saturation}%, 80%, ${0.3 * alpha})`);
    glow.addColorStop(1, `hsla(${hue}, ${saturation}%, 80%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // The bubble: clear in the middle, brighter towards the rim.
    const body = ctx.createRadialGradient(b.x - b.r * 0.2, b.y - b.r * 0.2, b.r * 0.1, b.x, b.y, b.r);
    body.addColorStop(0, `hsla(${hue}, ${saturation}%, 90%, ${0.05 * alpha})`);
    body.addColorStop(0.8, `hsla(${hue}, ${saturation}%, 88%, ${0.25 * alpha})`);
    body.addColorStop(1, `hsla(${hue}, ${saturation}%, 95%, ${0.7 * alpha})`);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Highlight, top left.
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.38, Math.max(0.6, b.r * 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
}

// Index of the bubble under (x, y), or -1. Checked from the newest, which is drawn on top.
export function bubbleAt(bubbles: Bubble[], x: number, y: number) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (Math.hypot(bubbles[i].x - x, bubbles[i].y - y) < bubbles[i].r + 10) return i;
  }
  return -1;
}

// --- Sparkles (a popped bubble) ---

export type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number };

export function addSparkles(sparks: Particle[], x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    if (sparks.length >= MAX_SPARKS) sparks.shift();
    const angle = random(0, Math.PI * 2);
    const speed = random(50, 150);
    const life = random(0.45, 0.8);
    sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, size: random(1.5, 3), hue: randomHue() });
  }
}

// Moves, slows and ages each sparkle; removes the ones that have faded out.
export function updateFading(list: Particle[], dt: number) {
  for (const p of list) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - dt * 2.5;
    p.vy *= 1 - dt * 2.5;
    p.life -= dt;
  }
  for (let i = list.length - 1; i >= 0; i--) if (list[i].life <= 0) list.splice(i, 1);
}

// A soft coloured halo with a bright centre; it shrinks and fades as it ages.
export function drawFading(ctx: CanvasRenderingContext2D, list: Particle[]) {
  for (const p of list) {
    const t = p.life / p.maxLife; // 1 = new, 0 = gone
    ctx.fillStyle = `hsla(${p.hue}, 90%, 78%, ${t * 0.35})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 2.6 * (0.5 + t * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 96%, ${t})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
  }
}
