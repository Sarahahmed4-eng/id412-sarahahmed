"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The laptop receives the phone's camera and turns it into a slit-scan:
// every frame, only the middle column of the video is kept, and the picture
// moves one slice to the left. Time becomes the horizontal axis.
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const SLICE = 2; // px per frame: wider = faster scroll, shorter memory

export default function CameraSlitScanScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("waiting for the phone");
  const [phonePath, setPhonePath] = useState("");

  async function onMessage(type: string, data: unknown) {
    // 2. Answer the phone's offer: "ok, this is how to reach me".
    if (type === "offer") {
      peerRef.current?.close();
      const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerRef.current = peer;
      peer.ontrack = (event) => {
        videoRef.current!.srcObject = event.streams[0];
      };
      peer.onicecandidate = (event) => {
        if (event.candidate) send("candidate", event.candidate.toJSON());
      };
      peer.onconnectionstatechange = () => setStatus(peer.connectionState);
      await peer.setRemoteDescription(data as RTCSessionDescriptionInit);
      await peer.setLocalDescription(); // creates the answer
      send("answer", peer.localDescription!.toJSON());
    }
    if (type === "candidate") peerRef.current?.addIceCandidate(data as RTCIceCandidateInit).catch(() => {});
  }

  const { send, connected } = useSocket("camera-slit-scan", onMessage);

  // Tell a phone that is already filming to call this page.
  useEffect(() => {
    if (connected) send("ready");
  }, [connected, send]);

  useEffect(() => {
    setPhonePath(window.location.pathname.replace(/\/screen$/, "/mobile"));
    return () => peerRef.current?.close();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    let frame = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      const video = videoRef.current!;
      if (video.videoWidth > 0) {
        const { width, height } = canvas;
        // Move everything one slice to the left...
        context.drawImage(canvas, -SLICE, 0);
        // ...and paint the video's middle column into the gap on the right.
        context.drawImage(video, video.videoWidth / 2, 0, 1, video.videoHeight, width - SLICE, 0, SLICE, height);
      }
      frame = requestAnimationFrame(draw);
    }
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
      {/* The raw camera, small: compare it with what the canvas makes of it. */}
      <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
      <p className={styles.status}>
        socket {connected ? "connected" : "connecting…"} · video {status} · open{" "}
        <a href={phonePath} target="_blank" className={styles.link}>
          {phonePath}
        </a>
      </p>
    </main>
  );
}
