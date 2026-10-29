# Video

A 5 × 5 grid of the same YouTube video, played by screaming. Click once to turn on the mic. Scream: the 25 videos start from 8:50, each after its own random delay (0.1–3 s), all with sound, so you get 25 screams back, each at its own moment. Stay quiet for 3 s and they all pause; scream again and they carry on.

- Route: /experiments/w1/video
- Week: W1 · Tech: Web Audio (mic loudness), iframe (YouTube embed), CSS grid
- Inputs: mic loudness, one click to start
- Parameters: THRESHOLD (0.2, loudness that counts as a scream), QUIET_TIME (3000 ms), MIN_DELAY / MAX_DELAY (100–3000 ms), GRID_SIZE (5), VIDEO_ID, START (530 s)

## How it works
- The click sets `listening`; an effect then opens the mic with `getUserMedia` (browsers need a click before using the mic and playing sound). Auto gain and noise suppression are off, so a scream stays loud; echo cancellation stays on.
- If the default input is a virtual device (BlackHole, Loopback…), which hears nothing in the room, it switches to the first real mic from `enumerateDevices`.
- Every frame an `AnalyserNode` gives the latest samples; their RMS is the loudness (0 = silence). Above THRESHOLD = scream.
- Scream while paused → play. The first time, each video gets a random delay and a `setTimeout` that plays it; later times, all resume at once so each keeps its lag. No scream for QUIET_TIME while playing → pause all, and cancel delayed starts not yet run.
- Play / pause = `postMessage` of `{ event: "command", func: "playVideo" | "pauseVideo" }` to each iframe (`enablejsapi=1` in the embed URL).
- Each cell stays invisible until its video starts, so YouTube's start screen never shows. A transparent layer over the grid blocks YouTube's hover UI.
- The red bar in the lower-left is the mic level, the white mark is THRESHOLD. If normal talking already crosses the mark, raise THRESHOLD; if a scream does not reach it, lower it.
- Console (`[scream]` lines): which mic is used, then twice a second the loudest level vs THRESHOLD, and every play / pause.

## Run
pnpm dev → http://localhost:3000/experiments/w1/video → click, allow the mic, scream. Use headphones: through speakers, the mic hears the 25 screams and they never pause.

## Status / next
Tested with a real voice on a USB mic: room ≈ 0.10–0.12, screams 0.25–0.78, so THRESHOLD is 0.2. Scream → plays, 3 s quiet → pauses. While paused YouTube still shows its title, a play icon and its logo in every cell. Next: a pitch check, so only screams count and not claps or bangs.
