# Camera Slit-Scan

The phone is just a camera; the laptop turns its live video into a slit-scan. Every frame keeps only the middle column of the picture, so time runs from right to left: pan the phone and the room unrolls into a panorama, move in front of it and you smear.

- Route: /experiments/w2/camera-slit-scan/mobile (phone) · /experiments/w2/camera-slit-scan/screen (laptop)
- Week: W2 · Tech: WebRTC (video) + Socket.io (signalling), Canvas
- Inputs: phone rear camera (continuous), start-camera tap (discrete) → screen
- Parameters: SLICE (2 px per frame, screen), camera size 1280×720 (mobile)

## How it works
- Video is too heavy for the socket. WebRTC sends it phone → laptop directly; the socket only carries the set-up messages, in the same room `camera-slit-scan`.
- The set-up: phone sends `offer`, screen replies `answer`, both send `candidate`s (possible network routes). After that the video flows on its own.
- Screen sends `ready` when it loads, so a phone that is already filming calls it again after a reload.
- One phone, one screen per room. With two /screen tabs open both answer; the phone keeps the first answer only.
- Screen draw loop: copy the canvas onto itself `SLICE` px to the left, then paint the video's middle column (1 px wide) into the gap at the right edge.
- The small video bottom-right is the raw feed, for comparison.

## Run
pnpm dev → open /screen, click the /mobile link (new tab, uses the laptop camera). With a phone: pnpm dev:mobile (the camera needs https), accept the warning at :4000 and :3000 on the phone, then /mobile on the phone and /screen on the laptop. Same Wi-Fi.

## Status / next
Works with one phone. Next: take a row instead of a column, or let a tap on the phone switch between them.
