"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { nightAmount, sunAngle } from "./settings";

// The sun circles the city; sky, fog and light fade between day and night.
const DAY_SKY = new THREE.Color("#a9c9e8");
const NIGHT_SKY = new THREE.Color("#0a0e1c");

export function Sky() {
  const background = useRef<THREE.Color>(null);
  const fog = useRef<THREE.Fog>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.HemisphereLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const night = nightAmount(time);
    const angle = sunAngle(time);

    background.current!.lerpColors(DAY_SKY, NIGHT_SKY, night);
    fog.current!.color.copy(background.current!);
    sun.current!.position.set(Math.cos(angle) * 30, Math.sin(angle) * 30, 12);
    sun.current!.intensity = Math.max(0, Math.sin(angle)) * 3;
    ambient.current!.intensity = 0.25 + (1 - night) * 0.8;
  });

  return (
    <>
      <color ref={background} attach="background" args={[DAY_SKY]} />
      <fog ref={fog} attach="fog" args={[DAY_SKY, 25, 65]} />
      <hemisphereLight ref={ambient} args={["#c8dcff", "#2a2420", 1]} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />
    </>
  );
}
