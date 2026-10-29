# Hello Fragment Shader

The first shader: the whole screen is one gradient, red growing to the right and green growing to the top. Every pixel's colour comes from its own position (uv).

- Route: /experiments/w1/glsl/hello-fragment-shader
- Week: W1 · Tech: GLSL (WebGL2, no Three.js)
- Inputs: none (pixel position only)
- Parameters: the blue value (0.5), which uv axis drives which colour

## How it works
- `shader.ts` (GLSL), `renderer.ts` (WebGL2 setup), `page.tsx` (canvas and loop).
- The fragment shader divides `gl_FragCoord.xy` by `u_resolution` to get uv (0..1), then returns `vec4(uv.x, uv.y, 0.5, 1.0)`.
- The renderer also sends `u_mouse` and `u_time`; this shader simply does not declare them.

## Run
pnpm dev → http://localhost:3000/experiments/w1/glsl/hello-fragment-shader

## Status / next
Works. Next: declare `u_time` and `u_mouse` and use them.
