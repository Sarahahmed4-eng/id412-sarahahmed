# Self-Building City

A city that builds itself. Buildings rise floor by floor (the orange floor is the one being placed), stand for a while, get torn down and are rebuilt with a new height. Cars drive the roads, and the sun circles so the windows light up at night.

- Route: /experiments/w1/self-building-city
- Week: W1 · Tech: Three.js (@react-three/fiber + drei)
- Inputs: time; mouse drag to orbit, scroll to zoom
- Parameters: GRID, MAX_FLOORS, BUILD_SPEED, DAY_LENGTH, CAR_COUNT

## How it works
- `City.tsx`: every floor of every building is one instance of a single `InstancedMesh` (~16k floors, one draw call). Each lot loops build → stand → demolish → empty.
- Each frame `updateLot` moves a lot's `progress`; whole floors are drawn full size, the fractional floor drops in from above (build) or shrinks (demolish), unbuilt floors are scaled to 0.
- Height falls off from the centre (`randomTarget`), so a downtown appears by itself.
- Windows are a canvas texture; a second canvas marks the lit ones as `emissiveMap`, turned up at night. Floors are turned by 90° steps so the lit windows don't line up.
- `Cars.tsx`: one more `InstancedMesh`, cars wrap around along the roads. `Sky.tsx`: sun, sky colour and fog from `nightAmount` in `settings.ts`.

## Run
pnpm dev → http://localhost:3000/experiments/w1/self-building-city

## Status / next
Works. Next: click a lot to demolish it, or let the mouse decide where downtown is.
