# Mouse Follow

A chain of little white ghosts follows the mouse on a dusky blue screen. The first one chases the cursor, each next one chases the one before it, so they trail behind like ghosts and gather when the mouse stops.

- Route: /experiments/w1/mouse-follow
- Week: W1 · Tech: Canvas
- Inputs: mouse position
- Parameters: COUNT (12), EASE (0.15), SIZE (200 px), IMAGE

## How it works
- `mousemove` only stores the latest mouse position; the drawing happens in a `requestAnimationFrame` loop.
- Every frame each figure moves `EASE` of the way to its target: the mouse for the first, the previous figure for the rest.
- Each figure is `ghost.svg` (in `public/experiments/w1/mouse-follow/`), drawn with `drawImage`. It is a hand-drawn SVG: a round-topped sheet with a wavy hem, two eyes, a round mouth and pink cheeks.
- The image is placed so the face, not the middle of the image, sits on the mouse.
- Figures further down the chain are smaller and more transparent (`globalAlpha`). They are drawn tail first so the head sits on top. The cursor is hidden (`cursor: none`).

## Run
pnpm dev → http://localhost:3000/experiments/w1/mouse-follow

## Status / next
Works. Next: tilt each figure towards the direction it moves, or let the eyes look towards the mouse.
