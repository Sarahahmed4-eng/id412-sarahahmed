# Mango Image

One photo of a ripe mango, full screen on white, with the photographer's credit in the corner. A starting point for working with images.

- Route: /experiments/w1/mango-image
- Week: W1 · Tech: Next.js `Image`, CSS Modules
- Inputs: none
- Parameters: object-fit (contain), background (white)

## How it works
- The photo is `mango.jpg` in `public/experiments/w1/mango-image/`, so the page refers to it as `/experiments/w1/mango-image/mango.jpg`.
- `Image` from `next/image` with `fill` covers the whole screen; `object-fit: contain` keeps the full mango visible at any window shape.
- Photo: "Mango fruit Nam Dok Mai" by Ivar Leidus, Wikimedia Commons, CC BY-SA 4.0 (1920 px version). The licence asks for the credit, so keep the credit line on the page.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-image

## Status / next
Works. Next: make the mango react to the mouse (follow it, grow on hover) or draw it into a canvas.
