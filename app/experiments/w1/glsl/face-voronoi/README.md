# Face Voronoi

A moving Voronoi field. Every cell's feature point drifts with time, hues blend across cell borders, and the pointer warps the field around it. Six renderings of the same field: colour (hue), monochrome (distance), and four ways of filling the cells with portraits.

- Route: /experiments/w1/glsl/face-voronoi
- Week: W1 · Tech: GLSL (WebGL2, no Three.js), a canvas-built texture atlas
- Inputs: mouse position, time, mode buttons, face-core slider (mode 6)
- Parameters: u_scale (6, how many cells), u_warp (0.65, pointer lens), u_mode (0–5), u_faceCore (0–1), hue drift (time × 0.018)

## How it works
- `shader.ts` is the original GLSL, unchanged. `voronoi()` finds the nearest moving feature point (3×3) and the nearest border (5×5); `blendedHue()` is a circular mean of neighbour hues; the `portrait*` functions sample the atlas at the cell's feature point, blended, as a solid mesh, or aligned so eyes meet eyes.
- `portrait-atlas.ts` loads 56 portraits from `public/experiments/w1/glsl/face-voronoi/portraits/` and tiles them on a 2D canvas (8×7, 128 px each); `renderer.ts` uploads that canvas as one texture.
- `renderer.ts` compiles, links, draws one full-screen triangle and sets the uniforms every frame. `page.tsx` owns the canvas, the loop, the mouse and the mode buttons.
- The portraits are generated avatars (pravatar.cc); not real people.
- Original: experiments-jyc / scc / face-voronoi/3.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/face-voronoi

## Status / next
Works. Next: expose u_scale and u_warp as sliders, or feed a phone's tilt into u_mouse (W2).
