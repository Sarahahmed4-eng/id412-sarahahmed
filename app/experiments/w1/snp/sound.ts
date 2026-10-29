import * as Tone from "tone";

// The Counter's sound. One number drives everything: level = close / highest close, 0..1.
// Low level: a dark, quiet hum and a slow heartbeat. High level: a bright, loud, distorted roar with a racing pulse.
// Big one-day drops (1987, 2008, 2020...) hit like an impact.
const CRASH = -0.03; // a one-day change below -3% triggers an impact
const RAMP = 0.1; // seconds each change glides over, so nothing clicks

export function createSound() {
  // Signal path: sources → filter → distortion → reverb → limiter → speakers.
  const limiter = new Tone.Limiter(-2).toDestination();
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.4 }).connect(limiter);
  const distortion = new Tone.Distortion(0).connect(reverb);
  const filter = new Tone.Filter(80, "lowpass").connect(distortion);

  // Drone: a low detuned saw, plus a fifth above that fades in as the level rises.
  const drone = new Tone.FatOscillator({ type: "sawtooth", count: 3, spread: 20, frequency: 55, volume: -14 }).connect(filter);
  const fifth = new Tone.FatOscillator({ type: "sawtooth", count: 3, spread: 40, frequency: 82.5, volume: -60 }).connect(filter);

  // Wind: pink noise through a band that opens and rises with the level.
  const windFilter = new Tone.Filter(400, "bandpass").connect(reverb);
  const wind = new Tone.Noise({ type: "pink", volume: -60 }).connect(windFilter);

  // Heartbeat: a kick on every beat. The tempo follows the level.
  const kick = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 6, volume: -6 }).connect(distortion);
  const beat = new Tone.Loop((time) => kick.triggerAttackRelease("A0", "8n", time), "4n").start(0);

  // Impact for crash days: a burst of noise and a metallic clang.
  const boom = new Tone.NoiseSynth({ noise: { type: "brown" }, envelope: { attack: 0.005, decay: 1.5, sustain: 0 } }).connect(distortion);
  const clang = new Tone.MetalSynth({ envelope: { decay: 2 }, volume: -10 }).connect(reverb);
  let lastImpact = 0;

  drone.start();
  fifth.start();
  wind.start();
  Tone.getTransport().start();

  // Called every frame with the level (0..1) and, when a new day is reached, the one-day change (-0.2 = -20%).
  function update(level: number, change: number) {
    filter.frequency.rampTo(80 * Math.pow(100, level), RAMP); // 80 Hz → 8 kHz: from muffled to bright
    drone.frequency.rampTo(55 * Math.pow(2, level), RAMP); // A1 → A2: the pitch climbs an octave
    fifth.frequency.rampTo(82.5 * Math.pow(2, level), RAMP);
    fifth.volume.rampTo(-50 + 38 * level, RAMP);
    windFilter.frequency.rampTo(400 * Math.pow(10, level), RAMP); // 400 Hz → 4 kHz
    wind.volume.rampTo(-45 + 33 * level, RAMP);
    distortion.distortion = 0.9 * level;
    Tone.getTransport().bpm.rampTo(40 + 140 * level, RAMP); // 40 → 180 beats per minute
    Tone.getDestination().volume.rampTo(-24 + 24 * level, RAMP); // quiet → full

    // A crash day: an impact, louder for bigger drops. At most one every 0.2 s so they do not pile up.
    const now = Tone.now();
    if (change < CRASH && now - lastImpact > 0.2) {
      const strength = Math.min(1, -change * 8);
      boom.triggerAttackRelease(1, now, strength);
      clang.triggerAttackRelease("C2", 1, now, strength);
      lastImpact = now;
    }
  }

  function stop() {
    Tone.getTransport().stop();
    [beat, drone, fifth, wind, kick, boom, clang, windFilter, filter, distortion, reverb, limiter].forEach((node) => node.dispose());
  }

  return { update, stop };
}
