// Captcha-style digits, in two steps:
// 1. makeCaptchaShape(digit): the digit alone in a random font, tilted, stretched and wave-warped.
//    White on transparent. Made once per variant, when the page loads.
// 2. paintCaptcha(shape, ...): that shape in the neon colours with the glow drawn in.
//    Redone when the colour menu changes. The glow is part of the image, so the page needs no
//    CSS filters, which is what keeps 100 changing cells smooth. Kept as canvases (not image
//    files) so repainting is quick.

const SIZE = 240; // canvas px, shown at 12vmin: 20 px = 1vmin (about screen resolution on a laptop)
const FONT_SIZE = 80; // px, = 4vmin, the size of the Arabic numbers; the glow is measured in it
const FONTS = ["Georgia", "Times New Roman", "Arial", "Courier New", "Verdana"];

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function newCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  return canvas;
}

export function makeCaptchaShape(digit: number): HTMLCanvasElement {
  // The digit on its own canvas, centred: random font, tilt and stretch.
  const text = newCanvas();
  const t = text.getContext("2d")!;
  const font = FONTS[Math.floor(Math.random() * FONTS.length)];
  t.font = `${Math.random() < 0.4 ? "italic " : ""}bold ${random(72, 88)}px ${font}`;
  t.fillStyle = "white";
  t.translate(SIZE / 2, SIZE / 2);
  t.rotate(random(-0.4, 0.4));
  t.scale(random(0.8, 1.3), random(0.9, 1.15));
  // Centre the digit's actual outline (fonts leave uneven space around digits).
  const box = t.measureText(String(digit));
  const offsetX = (box.actualBoundingBoxLeft - box.actualBoundingBoxRight) / 2;
  const offsetY = (box.actualBoundingBoxAscent - box.actualBoundingBoxDescent) / 2;
  t.fillText(String(digit), offsetX, offsetY);

  // Warp: shift each 1px column up/down by a sine wave, then each row left/right.
  // The wave is zero at the centre line, so the digit stays centred.
  const columns = newCanvas();
  const c = columns.getContext("2d")!;
  const amplitudeY = random(3, 7);
  const frequencyY = random(0.05, 0.11);
  const phaseY = random(0, Math.PI * 2);
  for (let x = 0; x < SIZE; x++) {
    const shift = (Math.sin(x * frequencyY + phaseY) - Math.sin((SIZE / 2) * frequencyY + phaseY)) * amplitudeY;
    c.drawImage(text, x, 0, 1, SIZE, x, shift, 1, SIZE);
  }
  const shape = newCanvas();
  const s = shape.getContext("2d")!;
  const amplitudeX = random(2, 5);
  const frequencyX = random(0.06, 0.12);
  const phaseX = random(0, Math.PI * 2);
  for (let y = 0; y < SIZE; y++) {
    const shift = (Math.sin(y * frequencyX + phaseX) - Math.sin((SIZE / 2) * frequencyX + phaseX)) * amplitudeX;
    s.drawImage(columns, 0, y, SIZE, 1, shift, y, SIZE, 1);
  }
  return shape;
}

export function paintCaptcha(shape: HTMLCanvasElement, coreColor: string, glowColor: string, glowSize: number): HTMLCanvasElement {
  // Fill the white shape with the core colour ("source-in" keeps only where the shape is).
  const core = newCanvas();
  const c = core.getContext("2d")!;
  c.drawImage(shape, 0, 0);
  c.globalCompositeOperation = "source-in";
  c.fillStyle = coreColor;
  c.fillRect(0, 0, SIZE, SIZE);

  // Draw it three times with a glow, from wide to tight: the same layers as the text-shadow in CSS.
  const image = newCanvas();
  const ctx = image.getContext("2d")!;
  ctx.shadowColor = glowColor;
  for (const layer of [1, 0.4, 0.12]) {
    ctx.shadowBlur = glowSize * FONT_SIZE * layer;
    ctx.drawImage(core, 0, 0);
  }
  return image;
}
