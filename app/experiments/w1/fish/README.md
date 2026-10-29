# Fish

One large teal fish drifts in a pale aqua and cream underwater scene. It swims to the side of the screen opposite the mouse, flaps its fins when clicked, and grows or shrinks when you scroll.

- Route: /experiments/w1/fish
- Week: W1 · Tech: SVG, requestAnimationFrame, CSS Modules
- Inputs: mouse / touch position, click on the fish, scroll wheel
- Parameters: SWIM_EASE (1.6), TURN_EASE (5), MIN_SCALE / MAX_SCALE (0.5–1.8), SCROLL_SPEED, EDGE (0.18)

## How it works
- The fish is an inline SVG drawn facing right: tail, fins, body, scale arcs, gill and eye.
- A `requestAnimationFrame` loop in `useEffect` moves the fish towards `innerWidth - mouseX`, so it always heads away from the pointer. Position, facing and size live in plain variables and are written straight to `style.transform`, so React does not re-render 60 times a second.
- Turning: `facing` eases from 1 to -1 and is used as `scaleX`, so the fish narrows and flips to face where it is going. The tail beats faster and wider the faster it swims.
- Clicking adds 1 to the `flaps` state. That number is the fins' `key`, so they remount and the CSS flap animation (4 flaps) starts again.
- Scroll uses a `wheel` listener with `passive: false` and `preventDefault()`, so the page never scrolls; the size is clamped between MIN_SCALE and MAX_SCALE.
- Bubbles and seaweed are pure CSS animations.

## Run
pnpm dev → http://localhost:3000/experiments/w1/fish

## Status / next
Works with mouse, click and scroll; on phones, touch moves the fish but there is no resize gesture. Next: pinch to resize, or a burst of bubbles on click.
