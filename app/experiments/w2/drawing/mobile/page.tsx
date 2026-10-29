"use client";

import { useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone is a touch pad. Finger position goes to the screen as 0..1 values.
const SEND_INTERVAL = 33; // ms, about 30 messages per second

export default function DrawingMobile() {
  const { send, connected } = useSocket("drawing");
  const [finger, setFinger] = useState<{ x: number; y: number } | null>(null);
  const lastSent = useRef(0);

  // 0..1 across the pad, the same on every phone size
  function position(event: React.PointerEvent) {
    return { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
  }

  function handleDown(event: React.PointerEvent) {
    const point = position(event);
    setFinger(point);
    send("down", point); // discrete: finger touches
  }

  function handleMove(event: React.PointerEvent) {
    if (!finger) return;
    const point = position(event);
    setFinger(point);
    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    send("move", point); // continuous: finger draws
  }

  function handleUp() {
    setFinger(null);
    send("up"); // discrete: finger lifts
  }

  return (
    <main
      className={styles.pad}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    >
      <p className={styles.status}>{connected ? "connected · draw here" : "connecting…"}</p>
      {finger && (
        <div
          className={styles.dot}
          style={{ left: `${finger.x * 100}%`, top: `${finger.y * 100}%` }}
        />
      )}
    </main>
  );
}
