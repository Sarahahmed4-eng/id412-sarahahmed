# Time Interval

A 10 × 10 grid of numbers. Each one counts 1 to 9, goes blank (0 = nothing), and starts over, each at its own random speed. Neon blue on black. Two round icon buttons in the lower-right corner open menus: numerals (Arabic, Roman, or captcha images) and colour.

- Route: /experiments/w1/time-interval
- Week: W1 · Tech: React state + setInterval, Canvas (captcha digits), CSS Modules
- Inputs: time, numerals menu, colour menu (core colour, glow colour, glow size)
- Parameters: GRID_SIZE (10), MAX_COUNT (9), MIN_INTERVAL / MAX_INTERVAL (100–1000 ms), CAPTCHA_VARIANTS (6), coreColor, glowColor, glowSize

## How it works
- `Counter` is one cell: its own `count` state and its own `setInterval` at a random speed. Each tick adds 1 and wraps from 9 to 0; 0 renders as an empty cell.
- The bars icon opens the numerals menu: Arabic shows `count`, Roman shows `ROMAN[count]` in a narrower serif font so VIII fits, and Captcha shows a captcha image.
- `captcha.ts` makes each captcha digit on a canvas: the digit alone in a random font, tilt and stretch, wave-warped, centred on its measured outline. On load the page makes 6 different shapes per digit.
- The shapes are then painted in the core colour with the glow drawn into the canvas, and repainted 100 ms after a colour change (only in captcha mode). Each cell just copies one onto its own `<canvas>`: no CSS filters or masks, which keeps it at 60 fps.
- The grid uses `minmax(0, 1fr)` tracks so the captcha canvases (bigger than a cell, to fit the glow) cannot stretch it off-centre.
- The half-filled circle icon opens the colour menu. The colours reach the CSS as variables (`--core-color`, `--glow-color`, `--glow-size`).

## Run
pnpm dev → http://localhost:3000/experiments/w1/time-interval

## Status / next
Works, about 60 fps in every mode. Settings reset on reload. Next: redraw a fresh captcha on every tick, or give each cell a random start number.
