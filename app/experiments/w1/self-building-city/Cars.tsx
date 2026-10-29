"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GRID, LOT, cellToWorld, isRoad } from "./settings";

// Small glowing boxes driving up and down every road. White one way (headlights), red the other (tail lights).
const CAR_COUNT = 160;
const LANE_OFFSET = 0.18;
const ROAD_LENGTH = GRID * LOT;

type Car = { road: number; alongX: boolean; lane: 1 | -1; start: number; speed: number };

function createCars(): Car[] {
  const roads: number[] = [];
  for (let i = 0; i < GRID; i++) if (isRoad(i)) roads.push(cellToWorld(i));
  return Array.from({ length: CAR_COUNT }, () => ({
    road: roads[Math.floor(Math.random() * roads.length)],
    alongX: Math.random() < 0.5,
    lane: Math.random() < 0.5 ? 1 : -1,
    start: Math.random() * ROAD_LENGTH,
    speed: 1.5 + Math.random() * 1.5,
  }));
}

export function Cars() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const cars = useMemo(createCars, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    const white = new THREE.Color("#fff1c9");
    const red = new THREE.Color("#ff3b3b");
    cars.forEach((car, i) => mesh.current!.setColorAt(i, car.lane === 1 ? white : red));
    mesh.current!.instanceColor!.needsUpdate = true;
  }, [cars]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    cars.forEach((car, i) => {
      // Distance along the road, wrapped so the car comes back on the other side.
      const travelled = car.start + time * car.speed * car.lane;
      const s = (((travelled % ROAD_LENGTH) + ROAD_LENGTH) % ROAD_LENGTH) - ROAD_LENGTH / 2;
      const side = car.road + car.lane * LANE_OFFSET;
      if (car.alongX) dummy.position.set(s, 0.05, side);
      else dummy.position.set(side, 0.05, s);
      dummy.rotation.set(0, car.alongX ? 0 : Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CAR_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.24, 0.07, 0.11]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
