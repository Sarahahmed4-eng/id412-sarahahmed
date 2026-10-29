# Drawing

Draw with a finger on the phone; the same line appears on the laptop and fades out behind a white dot. The W2 starting point: copy this folder and change what the screen does.

- Route: /experiments/w2/drawing/mobile (phone) · /experiments/w2/drawing/screen (laptop)
- Week: W2 · Tech: Socket.io, Canvas
- Inputs: phone touch position (continuous), touch down / up (discrete) → screen
- Parameters: SEND_INTERVAL (33 ms, mobile), EASE (0.25), TRAIL (40 frames), SIZE (24 px) (screen)

## How it works
- Both pages call `useSocket("drawing", …)`, so they meet in the same room on the relay.
- Mobile: pointer events on a full-screen pad. Position is divided by the window size → 0..1, so any phone maps to any screen.
- Mobile sends `down` and `up` once, and `move` at most every `SEND_INTERVAL` ms (~30 Hz).
- Screen: `onMessage` only stores the latest position in a ref. The `requestAnimationFrame` loop eases toward it and draws.
- Trail: the last `TRAIL` eased positions, cleared and redrawn every frame, older segments more transparent. After `up` it shrinks one point per frame.

## Run
pnpm dev (starts Next + the relay) → open /screen and click the /mobile link in its corner (new tab) to test on one laptop. With a phone: pnpm dev:mobile, open the `phone:` URL it prints at :4000 once on the phone and accept the warning, then /mobile on the phone and /screen on the laptop. Same Wi-Fi.

## Status / next
Works with one phone. Next: map x/y to colour or size, or give each phone its own dot (send an id with every message).
