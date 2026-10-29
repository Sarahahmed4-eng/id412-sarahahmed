# S&P 500

The last 50 years of the S&P 500 (Oct 1976 – Oct 2026) in two views, picked from the button in the lower-right corner: a bare line chart on white (no axes, no labels), or the value counting through time in white numbers on black, whose size follows the value: the all-time high fills the screen width, 1976 is a speck. The Counter also has sound that gets more intense as the value climbs, with an impact on every crash day.

- Route: /experiments/w1/snp
- Week: W1 · Tech: Canvas, Tone.js
- Inputs: a CSV of daily closes, time, window size, the view menu
- Parameters: MARGIN (64 px) and LINE in `Chart.tsx`, DAYS_PER_SECOND (250) and CHAR_WIDTH (0.6 em) in `Counter.tsx`; CRASH (-3%) and RAMP in `sound.ts`

## How it works
- The data is a static file, `public/experiments/w1/snp/sp500.csv` (12,602 daily closes of ^GSPC, downloaded once from Yahoo Finance). `page.tsx` `fetch`es it once and splits it into `{ time, close }` points.
- `page.tsx` holds the current view and the lower-right menu (same pattern as `time-interval`), and shows `Chart` or `Counter`.
- `Chart.tsx`: `x()` maps a date to the width, `y()` maps a price to the height (0 at the bottom), and one canvas path draws the line. Redrawn only on `resize`.
- `Counter.tsx`: a `requestAnimationFrame` loop turns the time since start into a day (~1 year per second) and shows that day's close. It loops after the last day (~50 s).
- Font size = close / highest close × the size at which the highest close is exactly 100vw wide (characters × CHAR_WIDTH).
- `sound.ts`: level = close / highest close (0..1) drives a detuned saw drone (pitch up an octave, lowpass 80 Hz → 8 kHz), a fifth and pink-noise wind that fade in, distortion, a kick whose tempo goes 40 → 180 bpm, and overall volume. A one-day drop worse than -3% fires a noise boom and a metal clang, louder for bigger drops.
- `Tone.start()` runs in the click on "Counter" (sound needs a click); the sound stops when you leave the view.
- `tabular-nums` keeps every digit the same width, so the number does not jitter.

## Run
pnpm dev → http://localhost:3000/experiments/w1/snp

## Status / next
Both views work; sound checked for errors, tune by ear. Next: flash the screen on crash days, or show the year faintly under the counter.
