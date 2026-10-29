# Mango Grid

The whole screen tiled with the same mango photo as a decalcomanie: every other column is flipped left/right and every other row top/bottom, so each mango mirrors its neighbours. The mangos grow as the mouse moves away from the centre, from 100 % in the middle to 300 % in a corner, so they overlap and blend into a kaleidoscope. An options button in the lower-right corner changes the settings live.

- Route: /experiments/w1/mango-grid
- Week: W1 · Tech: React state, CSS grid, CSS transform, mix-blend-mode, Next.js `Image`
- Inputs: mouse position (distance from the centre), window size, options panel
- Parameters: N (columns, 10–40, default 10), Mouse (scale follows the mouse, default on), Scale (100–300 %, when Mouse is off), Blend (normal, difference, exclusion, multiply, screen, overlay, color-burn; default difference)

## How it works
- N is the number of columns. Rows = window height / tile height, rounded, so tiles keep the photo's shape. Both go into `repeat(n, 1fr)`, so the grid fills the screen exactly. Recomputed on `resize` and when N changes.
- Each tile's column is `i = index % N` and its row `j = floor(index / N)`, both from 0. Odd `i` flips left/right, odd `j` flips top/bottom. The flips are CSS variables per tile; `.cell` multiplies them by `--scale` in its `transform`.
- Mouse on: radius = distance from the mouse to the screen centre, divided by the centre-to-corner distance (0 to 1), mapped to 1 to 3. Mouse off: the Scale slider.
- `--scale` is set straight on the grid element with `style.setProperty`, not with React state: the mouse changes it many times a second, and re-rendering 1000+ tiles each time would be slow.
- Scale grows each mango around the middle of its tile, so it stays in place and covers its neighbours.
- Blend is each tile's `mix-blend-mode`. difference / exclusion subtract colours, multiply / color-burn darken, screen lightens, overlay adds contrast. `isolation: isolate` on the grid keeps the blending among the mangos.
- The options panel (sliders icon) is the same look as `time-interval`: a round toggle button, a panel of labelled controls above it.
- The photo is a copy of the one in `mango-image` (Ivar Leidus, Wikimedia Commons, CC BY-SA 4.0); keep the credit line.

## Run
pnpm dev → http://localhost:3000/experiments/w1/mango-grid

## Status / next
Works at any window size; N = 40 is about 1200 blended images (frame rate not measured). Settings reset on reload. Next: map the mouse angle to something too (rotation, or N), or animate the scale when the mouse is still.
