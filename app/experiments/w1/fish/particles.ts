// Everything small that moves in the water, drawn on two canvases by the loop in page.tsx:
// behind the fish: floating specks, the fish's trail and the ripples around it;
// in front of the fish: bubbles and the sparkles they pop into.
// All lists have a maximum length, so the page never fills up with particles.

export const MAX_BUBBLES = 40;
export const MAX_SPARKS = 160;
export const MAX_TRAIL = 90;
export const MAX_RIPPLES = 6;

// Pastel hues: coral pink, peach, orange, golden yellow, lavender, aqua.
const HUES = [350, 18, 32, 48, 270, 185];

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomHue() {
  return HUES[Math.floor(Math.random() * HUES.length)];
}

// A speck, a trail dot or a sparkle: they all move, fade out and disappear.
export type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number };
export type Bubble = { x: number; y: number; r: number; vy: number; phase: number; hue: number; shimmer: boolean };
export type Ripple = { x: number; y: number; r: number; life: number };

// --- Floating specks (always there, wrap around the screen) ---

export function makeSpecks(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    vx: 0,
    vy: 0,
    life: random(0, 100), // used as a twinkle phase
    maxLife: 1,
    size: random(0.8, 2.2),
    hue: 50,
  }));
}

// Specks drift on a slow current. Near the fish they are pushed along and swirl around it.
export function updateSpecks(specks: Particle[], dt: number, width: number, height: number, fish: { x: number; y: number; vx: number; vy: number; radius: number }) {
  for (const s of specks) {
    const dx = s.x - fish.x;
    const dy = s.y - fish.y;
    const distance = Math.hypot(dx, dy) || 1;
    if (distance < fish.radius) {
      const strength = (1 - distance / fish.radius) * dt * 3;
      s.vx += (fish.vx * 0.6 - (dy / distance) * 40) * strength;
      s.vy += (fish.vy * 0.6 + (dx / distance) * 40) * strength;
    }
    // Ease back to the slow current: a little to the right and up.
    s.vx += (8 - s.vx) * dt * 0.8;
    s.vy += (-4 - s.vy) * dt * 0.8;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life += dt;
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;
    if (s.y < -10) s.y = height + 10;
    if (s.y > height + 10) s.y = -10;
  }
}

export function drawSpecks(ctx: CanvasRenderingContext2D, specks: Particle[]) {
  for (const s of specks) {
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(s.life * 1.5);
    ctx.fillStyle = "#fffbea";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// --- Trail and sparkles (both fade out) ---

export function addTrail(trail: Particle[], x: number, y: number, vx: number, vy: number) {
  if (trail.length >= MAX_TRAIL) trail.shift();
  const life = random(0.8, 1.4);
  trail.push({ x: x + random(-6, 6), y: y + random(-6, 6), vx: -vx * 0.08 + random(-10, 10), vy: -vy * 0.08 + random(-14, 4), life, maxLife: life, size: random(2, 4.5), hue: randomHue() });
}

export function addSparkles(sparks: Particle[], x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    if (sparks.length >= MAX_SPARKS) sparks.shift();
    const angle = random(0, Math.PI * 2);
    const speed = random(50, 150);
    const life = random(0.45, 0.8);
    sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, size: random(1.5, 3), hue: randomHue() });
  }
}

// Moves, slows and ages each particle; removes the ones that have faded out.
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

// --- Bubbles ---

export function addBubbles(bubbles: Bubble[], x: number, y: number, count: number, shimmer: boolean) {
  for (let i = 0; i < count; i++) {
    if (bubbles.length >= MAX_BUBBLES) bubbles.shift();
    bubbles.push({
      x: x + random(-14, 14),
      y: y + random(-10, 10),
      r: shimmer ? random(5, 13) : random(3, 7),
      vy: random(35, 80),
      phase: random(0, Math.PI * 2),
      hue: randomHue(),
      shimmer: shimmer && Math.random() < 0.7, // most of a click's bubbles shimmer, a few stay clear
    });
  }
}

// Rise and wobble from side to side. Bubbles that leave the top are removed.
export function updateBubbles(bubbles: Bubble[], dt: number) {
  for (const b of bubbles) {
    b.phase += dt * 2.2;
    b.x += Math.sin(b.phase) * 18 * dt;
    b.y -= b.vy * dt;
  }
  for (let i = bubbles.length - 1; i >= 0; i--) if (bubbles[i].y < -20) bubbles.splice(i, 1);
}

export function drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[], time: number) {
  for (const b of bubbles) {
    // Shimmering bubbles slowly change colour; plain ones are white.
    const hue = b.hue + Math.sin(time * 1.5 + b.phase) * 40;
    const rim = b.shimmer ? `hsla(${hue}, 85%, 82%, 0.9)` : "rgba(255, 255, 255, 0.75)";
    const fill = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
    fill.addColorStop(0, "rgba(255, 255, 255, 0.04)");
    fill.addColorStop(1, b.shimmer ? `hsla(${hue}, 90%, 88%, 0.4)` : "rgba(255, 255, 255, 0.25)");
    ctx.fillStyle = fill;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Little highlight, top left.
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.2, 0, Math.PI * 2);
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

// --- Ripples: faint rings that spread around the swimming fish ---

export function addRipple(ripples: Ripple[], x: number, y: number, r: number) {
  if (ripples.length >= MAX_RIPPLES) ripples.shift();
  ripples.push({ x, y, r, life: 1 });
}

export function updateAndDrawRipples(ctx: CanvasRenderingContext2D, ripples: Ripple[], dt: number) {
  for (const ripple of ripples) {
    ripple.life -= dt * 0.9;
    ripple.r += dt * 60;
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(ripple.life, 0) * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(ripple.x, ripple.y, ripple.r, ripple.r * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].life <= 0) ripples.splice(i, 1);
}
