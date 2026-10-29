# Fish

One large teal fish in an enchanted twilight reef: golden light and sunbeams at the surface, deep indigo water below, glowing coral in pink, orange, magenta, lavender, blue and gold. The fish follows the mouse with a trail of bubbles, flaps its fins and puffs glowing bubbles when clicked, and grows or shrinks as you scroll.

- Route: /experiments/w1/fish
- Week: W1 · Tech: SVG, Canvas, requestAnimationFrame, CSS Modules
- Inputs: mouse / touch position, click on the fish or a bubble, scroll wheel
- Parameters: FOLLOW_SPEED (340 px/s), FOLLOW_EASE (2.2), MIN_SCALE / MAX_SCALE (0.5–1.8), TRAIL_BUBBLES (35), CLICK_BUBBLES (12), SPECKS (90)

## How it works
- `page.tsx`: one `requestAnimationFrame` loop steers the fish's mouth towards the mouse. Its velocity eases towards the target (that is the slight delay), and position, tilt, facing (`scaleX`) and tail beat go straight to `style.transform`. React only re-renders on a click (the `flaps` key restarts the fin animation, and the tail wiggles extra for 1.4 s).
- `particles.ts`: the trail bubbles, floating specks (at different depths) and a soft light around the fish are drawn on a canvas behind the fish with `mix-blend-mode: screen`, so they only add light. Click bubbles, groups of bubbles from the reef and pop sparkles are on a canvas in front. The fish's wake pushes bubbles and specks. Every list has a maximum length.
- `Reef.tsx`: far, middle and front layers of SVG coral (sea fans, branches, soft coral, domes, tube sponges, sea grass, plants, anemones, kelp). Colours come from shared gradients defined once in `<Defs>`; glowing dots twinkle with CSS. The loop shifts the layers for parallax, zooms them and thins the haze as the fish grows, and lights up front coral near the fish (`data-lit`).
- Sunbeams are a `conic-gradient` fan; caustics are SVG noise (`feTurbulence`) turned into thin lines, drawn once and slid slowly with CSS. `prefers-reduced-motion` stops the ambient animation and slows the fish.

## Run
pnpm dev → http://localhost:3000/experiments/w1/fish

## Status / next
Works on desktop and phone (a finger moves the fish, a tap flaps); there is no resize gesture on phones. Next: pinch to resize, or let the fish's light make nearby specks glow brighter.
