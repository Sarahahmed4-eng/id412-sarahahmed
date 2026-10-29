"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

// A 5 × 5 grid of the same YouTube video, with as little YouTube UI as possible, played by screaming.
// Scream into the mic: the videos play, each one starting after its own random delay.
// Stay quiet for 3 seconds: they all pause. Scream again: they carry on.
const VIDEO_ID = "1SwA46-lSWk";
const START = 530; // seconds (8:50)
const GRID_SIZE = 5; // 5 × 5 videos
const MIN_DELAY = 100; // ms, the shortest wait before a video starts
const MAX_DELAY = 3000; // ms, the longest
const THRESHOLD = 0.2; // mic loudness (0 to 1) that counts as a scream; the meter shows it as a white mark
const QUIET_TIME = 3000; // ms of quiet before the videos pause
const ORIGIN = "https://www.youtube-nocookie.com"; // YouTube's embed without tracking cookies

// Embed options: start time, and no controls, related videos, annotations, keyboard or fullscreen button.
// enablejsapi lets the page play and pause it with postMessage.
const SRC = `${ORIGIN}/embed/${VIDEO_ID}?start=${START}&controls=0&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1`;

export default function Video() {
  const iframesRef = useRef<HTMLIFrameElement[]>([]); // all 25 players
  const timersRef = useRef<number[]>([]); // delayed starts still waiting
  const meterRef = useRef<HTMLDivElement>(null); // the level bar, set every frame without React
  const [listening, setListening] = useState(false); // has the mic been turned on?
  // Which cells are visible. Each one appears when its video starts, so YouTube's start screen never shows.
  const [shown, setShown] = useState<boolean[]>([]);

  // Tell one YouTube player to play or pause. It listens for these messages because of enablejsapi=1.
  function send(iframe: HTMLIFrameElement, command: "playVideo" | "pauseVideo") {
    iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), ORIGIN);
  }

  // Listen to the mic and play / pause the videos. Runs once the mic is on.
  useEffect(() => {
    if (!listening) return;
    let frame = 0;
    let stream: MediaStream | undefined;
    let audio: AudioContext | undefined;
    let cancelled = false; // set by the cleanup, in case it runs before the mic is open
    let started = false; // have the videos been started once?
    let playing = false;
    let lastLoud = 0; // time of the last scream, in ms
    let loudest = 0; // loudest level since the last log line
    let lastLog = 0;

    function play() {
      console.log(`[scream] SCREAM → play (${started ? "resume all" : "first start, random delays"})`);
      playing = true;
      if (!started) {
        // First scream: each video starts after its own random delay, so each one lags the others.
        started = true;
        timersRef.current = iframesRef.current.map((iframe, i) => {
          const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
          return window.setTimeout(() => {
            send(iframe, "playVideo");
            setShown((previous) => {
              const next = [...previous];
              next[i] = true;
              return next;
            });
          }, delay);
        });
      } else {
        // Later screams: resume all at once, so each one keeps its lag.
        // A video whose delayed start was cancelled by a pause starts now.
        iframesRef.current.forEach((iframe) => send(iframe, "playVideo"));
        setShown(iframesRef.current.map(() => true));
      }
    }

    function pause() {
      // Pause all at once (and cancel any delayed start that has not happened yet).
      console.log(`[scream] quiet for ${QUIET_TIME / 1000} s → pause`);
      playing = false;
      timersRef.current.forEach((timer) => clearTimeout(timer));
      iframesRef.current.forEach((iframe) => send(iframe, "pauseVideo"));
    }

    async function start() {
      // Raw loudness: no automatic gain or noise suppression, which would even out a scream.
      // Echo cancellation stays on, so the mic hears less of the videos.
      console.log("[scream] asking for the mic…");
      const settings = { echoCancellation: true, autoGainControl: false, noiseSuppression: false };
      stream = await navigator.mediaDevices.getUserMedia({ audio: settings });

      // The default input can be a virtual device (BlackHole, Loopback…) that passes sound between apps
      // and hears nothing in the room. If so, switch to the first real mic.
      const isVirtual = (label: string) => /virtual|blackhole|loopback|soundflower/i.test(label);
      const mics = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      console.log("[scream] mics found:", mics.map((mic) => mic.label));
      const realMic = mics.find((mic) => !isVirtual(mic.label));
      if (isVirtual(stream.getAudioTracks()[0].label) && realMic) {
        stream.getTracks().forEach((track) => track.stop());
        stream = await navigator.mediaDevices.getUserMedia({ audio: { ...settings, deviceId: { exact: realMic.deviceId } } });
      }

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const track = stream.getAudioTracks()[0];
      console.log(`[scream] mic on: "${track.label}"`, track.getSettings());
      audio = new AudioContext();
      await audio.resume(); // a context can start "suspended", and then it hears nothing
      console.log(`[scream] audio ${audio.state}, threshold ${THRESHOLD}`);
      const analyser = audio.createAnalyser();
      analyser.fftSize = 1024;
      audio.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);

      function loop() {
        // Loudness = RMS of the latest samples: 0 is silence, about 0.3 and up is a scream close to the mic.
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) sum += sample * sample;
        const level = Math.sqrt(sum / samples.length);
        const now = performance.now();

        if (level > THRESHOLD) {
          lastLoud = now;
          if (!playing) play();
        } else if (playing && now - lastLoud > QUIET_TIME) {
          pause();
        }

        // Debug: twice a second, the loudest level since the last line, and whether it was a scream.
        loudest = Math.max(loudest, level);
        if (now - lastLog > 500) {
          const verdict = loudest > THRESHOLD ? "SCREAM" : "quiet";
          console.log(`[scream] loudest ${loudest.toFixed(3)} / threshold ${THRESHOLD} → ${verdict}, ${playing ? "playing" : "paused"}`);
          loudest = 0;
          lastLog = now;
        }

        if (meterRef.current) meterRef.current.style.width = `${Math.min(1, level) * 100}%`;
        frame = requestAnimationFrame(loop);
      }
      frame = requestAnimationFrame(loop);
    }
    start().catch((error) => console.error("[scream] mic failed:", error));

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      timersRef.current.forEach((timer) => clearTimeout(timer));
      stream?.getTracks().forEach((track) => track.stop());
      audio?.close();
    };
  }, [listening]);

  return (
    <main className={styles.container}>
      {/* All loaded right away, each invisible until its video starts */}
      <div className={styles.grid}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => (
          <iframe
            key={i}
            ref={(iframe) => {
              if (iframe) iframesRef.current[i] = iframe;
            }}
            className={shown[i] ? styles.video : `${styles.video} ${styles.hidden}`}
            src={SRC}
            title={`YouTube video ${i + 1}`}
            allow="autoplay; encrypted-media"
          />
        ))}
      </div>

      {/* A transparent layer over the videos: it blocks YouTube's own hover UI.
          The one click turns the mic on (browsers need a click before using the mic and playing sound). */}
      <button className={styles.cover} onClick={() => setListening(true)} disabled={listening} aria-label="Turn on the mic">
        {!listening && <span className={styles.hint}>click, then scream</span>}
      </button>

      {/* Mic level, with a mark at THRESHOLD */}
      {listening && (
        <div className={styles.meter}>
          <div ref={meterRef} className={styles.level} />
          <div className={styles.threshold} style={{ left: `${THRESHOLD * 100}%` }} />
        </div>
      )}
    </main>
  );
}
