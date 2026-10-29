# Experiments — how student work is organised

Read by agents (via AGENTS.md) and by students. Applies to everything under `app/experiments/`.

Where in-class code and homework live. `/experiments` and `/experiments/<week>` list every experiment folder automatically (from its `README.md` first paragraph); the thin `page.tsx` in each week folder is that index, leave it. One folder per week (`w1/`, `w2/`, `w3/`), one folder per experiment inside it. The route is the path: `app/experiments/w1/time-interval/page.tsx` → `/experiments/w1/time-interval`.

## Creating an experiment

1. Folder: `app/experiments/<week>/<kebab-name>/`. Name it after what it does (`mouse-trail`, `tilt-particles`), not after the week or a number. Look in the week folder first: if a group folder for the same tech exists (`w1/glsl/`), put it inside: `app/experiments/w1/glsl/<kebab-name>/`.
2. Files inside, and only inside:
   - `page.tsx` — the route. `"use client"` on line 1 if it uses state, effects, refs, events or browser APIs.
   - `page.module.css` — its styles, if any.
   - helpers it alone uses (`shader.ts`, `useTilt.ts`, `Scene.tsx`), next to it.
   - `README.md` — see below. Create it with the experiment, update it when the experiment changes.
   - assets in `public/experiments/<week>/<kebab-name>/`, referenced as `/experiments/<week>/<kebab-name>/<file>`.
3. Multi-device (W2+): `mobile/page.tsx` and `screen/page.tsx` inside the folder, both `useSocket("<kebab-name>", onMessage)`. Messages are `{ type, data }`: small, serialisable, continuous inputs throttled to ~30 Hz before `send`.
4. Server code (W3): `app/api/<kebab-name>/route.ts`, named after the experiment. Keys from `.env.local` via `process.env`.
5. Variants: a second take on the same idea is `<kebab-name>-2/` or a sibling with a telling name, not an edit of the original. Experiments are a record; leave finished ones alone.

Nothing shared across experiments is created without asking. If two experiments need the same helper, copy it, or ask before making a shared folder.

## Commit when it works

The agent commits each working step (`git add` only that experiment's folder and its `public/` assets, `git commit -m "w1: <name>"`). Students then always have a point to come back to with `git restore` or `git log`. Pushing to GitHub stays a human action: `git push` when the student says so, or at the end of the session.

## README.md per experiment

Every experiment folder has a `README.md`. The agent writes it when it creates the experiment and keeps it current. It is for a student (or the next agent) opening the folder cold. Short: 10 to 25 lines. This shape:

```markdown
# <Name>

One or two sentences: what you see and what it reacts to.

- Route: /experiments/w1/<kebab-name>
- Week: W1 · Tech: Canvas (or GLSL / Three.js / Socket.io / Tone.js / API)
- Inputs: mouse position, time (or: phone tilt → screen)
- Parameters: speed, count, hue (the 3–5 values that shape the output)

## How it works
Three to six bullets. The loop, the data flow, where the parameters are, anything non-obvious.

## Run
pnpm dev → open the route. (Multi-device: pnpm dev:mobile, open /mobile on the phone and /screen on the laptop.)

## Status / next
What works, what is rough, one idea for the next step.
```

No code dumps, no installation guides, no restating the lecture notes. If it is longer than the code, it is too long.

## Conventions

- Canvas: `useRef` for the element, `useEffect` to start a `requestAnimationFrame` loop, cancel it in cleanup, size with `innerWidth/innerHeight` × `devicePixelRatio`.
- Three.js: `<Canvas>` + `useFrame` from `@react-three/fiber`, helpers from `@react-three/drei`. Sane particle counts and shader cost for a laptop GPU.
- GLSL: shader source as a template string in `shader.ts` next to `page.tsx`; uniforms for time, mouse, resolution. Raw WebGL2 as in `app/experiments/w1/glsl/hello-fragment-shader` (copy its `renderer.ts`), or `ShaderMaterial` inside a Three.js scene.
- Sound: `await Tone.start()` inside a user gesture handler before anything plays.
- Full-screen experiments: `position: fixed; inset: 0` on the root, no scroll, nothing from the lecture site's layout is assumed.
