"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Cars } from "./Cars";
import { City } from "./City";
import { Sky } from "./Sky";
import styles from "./page.module.css";

// A city that builds itself: buildings rise floor by floor, stand a while, get torn down and rebuilt.
export default function SelfBuildingCity() {
  return (
    <main className={styles.container}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 16, 20], fov: 45 }}>
        <Sky />
        <City />
        <Cars />
        <OrbitControls target={[0, 2, 0]} autoRotate autoRotateSpeed={0.4} maxPolarAngle={Math.PI * 0.45} minDistance={8} maxDistance={50} />
      </Canvas>
      <p className={styles.caption}>drag to orbit · scroll to zoom</p>
    </main>
  );
}
