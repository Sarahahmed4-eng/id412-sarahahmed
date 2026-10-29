# Fish

One large teal fish in a dreamy coral reef of pink, peach, orange, lavender and gold. It follows a slow mouse from a polite distance, darts away from a fast one, explores when you stop, blows shimmering bubbles when clicked (click a bubble to pop it into sparkles), and grows or shrinks as you scroll, with the reef coming closer or fading into haze.

- Route: /experiments/w1/fish
- Week: W1 · Tech: SVG, Canvas, requestAnimationFrame, CSS Modules
- Inputs: mouse / touch position and speed, click on the fish or a bubble, scroll wheel
- Parameters: FOLLOW_SPEED / DART_SPEED / WANDER_SPEED, FAST_MOUSE (1600 px/s), IDLE_AFTER (1.4 s), MIN_SCALE / MAX_SCALE (0.5–1.8), SPECKS, CLICK_BUBBLES

## How it works
- `page.tsx`: one `requestAnimationFrame` loop picks the fish's mood each frame (dart away, chase a bubble, follow the mouse, wander), steers its velocity towards that target, then writes position, tilt, facing (`scaleX`) and tail beat straight to `style.transform`. React only re-renders on a click (the `flaps` key restarts the fin animation).
- Mouse speed is measured once per frame, so a single jumpy mouse event cannot startle the fish.
- `particles.ts`: specks, trail and ripples on a canvas behind the fish, bubbles and sparkles on a canvas in front. Every list has a maximum length. Clicks are checked against the bubbles first, then the fish.
- `Reef.tsx`: far, middle and front layers of SVG coral (sea fan, rib and dome patterns are generated with sin/cos). The loop shifts the layers for parallax, zooms them and thins the haze as the fish grows, and lights up front coral near the fish (`data-lit`).
- Light rays, light patterns and swaying coral are CSS animations; `prefers-reduced-motion` stops them and slows the fish.

## Run
pnpm dev → http://localhost:3000/experiments/w1/fish

## Status / next
Works on desktop and phone (touch moves the fish, tap it to flap); there is no resize gesture on phones. Next: pinch to resize, or a second, shy fish.
