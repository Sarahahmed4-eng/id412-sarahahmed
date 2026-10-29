"use client";

import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import styles from "./page.module.css";

// The phone is a camera. Its video goes straight to the screen over WebRTC;
// the socket only carries the short messages that set the call up.
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export default function CameraSlitScanMobile() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("");

  function onMessage(type: string, data: unknown) {
    const peer = peerRef.current;
    if (type === "ready") call(); // the screen (re)loaded: call it again
    // Only the first answer counts. A second open /screen also answers; ignore it.
    if (type === "answer" && peer?.signalingState === "have-local-offer") {
      peer.setRemoteDescription(data as RTCSessionDescriptionInit);
    }
    // Candidates from an ignored screen do not fit this call: skip them quietly.
    if (type === "candidate" && peer) peer.addIceCandidate(data as RTCIceCandidateInit).catch(() => {});
  }

  const { send, connected } = useSocket("camera-slit-scan", onMessage);

  // 1. Offer: "here is my video, this is how to reach me".
  async function call() {
    const stream = streamRef.current;
    if (!stream) return;
    peerRef.current?.close();
    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerRef.current = peer;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate) send("candidate", event.candidate.toJSON());
    };
    peer.onconnectionstatechange = () => setStatus(peer.connectionState);
    await peer.setLocalDescription(); // creates the offer
    send("offer", peer.localDescription!.toJSON());
    setStatus("calling the screen…");
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current!.srcObject = stream;
      setStarted(true);
      call();
    } catch {
      // On a phone, the camera only works over https: use pnpm dev:mobile.
      setStatus(window.isSecureContext ? "camera blocked" : "camera needs https (pnpm dev:mobile)");
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      peerRef.current?.close();
    };
  }, []);

  return (
    <main className={styles.container}>
      <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
      <p className={styles.status}>
        socket {connected ? "connected" : "connecting…"} {status && `· video ${status}`}
      </p>
      {!started && (
        <button className={styles.button} onClick={start}>
          start camera
        </button>
      )}
    </main>
  );
}
