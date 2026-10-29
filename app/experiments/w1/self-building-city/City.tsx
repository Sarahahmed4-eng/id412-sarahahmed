"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GRID, LOT, cellToWorld, isRoad, nightAmount } from "./settings";

// Every building is a stack of floors. One InstancedMesh draws every floor of every building.
const MAX_FLOORS = 36;
const FLOOR_HEIGHT = 0.22;
const BUILD_SPEED = 3; // floors per second
const DEMOLISH_SPEED = 12; // floors per second
const PALETTE = ["#e8e4dc", "#c9d3dc", "#d8c8b8", "#b8c0c8", "#efe6d0"];
const CRANE_COLOR = new THREE.Color("#ff8a3d"); // the floor that is being placed

type Lot = {
  x: number;
  z: number;
  width: number;
  target: number; // floors this building will have
  progress: number; // floors built so far, with a fraction for the floor in progress
  mode: "build" | "stand" | "demolish" | "empty";
  timer: number; // seconds left to stand, or to wait on an empty lot
  color: THREE.Color;
};

// Tall in the middle (downtown), low at the edges, with some randomness.
function randomTarget(x: number, z: number) {
  const d = Math.hypot(x, z) / (GRID / 2);
  const downtown = Math.exp(-d * d * 3);
  const floors = MAX_FLOORS * downtown * (0.4 + Math.random() * 0.6) + Math.random() * 4;
  return Math.min(MAX_FLOORS, Math.max(2, Math.round(floors)));
}

function newBuilding(lot: Lot) {
  lot.target = randomTarget(lot.x, lot.z);
  lot.width = LOT * (0.55 + Math.random() * 0.35);
  lot.color = new THREE.Color(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
}

function createLots(): Lot[] {
  const lots: Lot[] = [];
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      if (isRoad(i) || isRoad(j)) continue;
      const lot: Lot = { x: cellToWorld(i), z: cellToWorld(j), width: 0, target: 0, progress: 0, mode: "build", timer: 0, color: new THREE.Color() };
      newBuilding(lot);
      // Start with a city already half built.
      if (Math.random() < 0.6) {
        lot.progress = lot.target;
        lot.mode = "stand";
        lot.timer = Math.random() * 30;
      } else {
        lot.progress = Math.random() * lot.target;
      }
      lots.push(lot);
    }
  }
  return lots;
}

// The life of one lot: build → stand → demolish → empty → build a new one.
function updateLot(lot: Lot, dt: number) {
  if (lot.mode === "build") {
    lot.progress += BUILD_SPEED * dt;
    if (lot.progress >= lot.target) {
      lot.progress = lot.target;
      lot.mode = "stand";
      lot.timer = 8 + Math.random() * 30;
    }
  } else if (lot.mode === "stand") {
    lot.timer -= dt;
    if (lot.timer <= 0) lot.mode = "demolish";
  } else if (lot.mode === "demolish") {
    lot.progress -= DEMOLISH_SPEED * dt;
    if (lot.progress <= 0) {
      lot.progress = 0;
      lot.mode = "empty";
      lot.timer = 1 + Math.random() * 3;
    }
  } else {
    lot.timer -= dt;
    if (lot.timer <= 0) {
      newBuilding(lot);
      lot.mode = "build";
    }
  }
}

// One floor's facade drawn on a canvas: walls and windows (map), and which windows are lit (emissiveMap).
function makeFacadeTextures() {
  const [w, h, windows] = [96, 32, 6];
  const wall = document.createElement("canvas");
  const lights = document.createElement("canvas");
  wall.width = lights.width = w;
  wall.height = lights.height = h;
  const wallCtx = wall.getContext("2d")!;
  const lightCtx = lights.getContext("2d")!;
  wallCtx.fillStyle = "#ffffff";
  wallCtx.fillRect(0, 0, w, h);
  wallCtx.fillStyle = "#9a9a9a"; // floor slab
  wallCtx.fillRect(0, h - 4, w, 4);
  lightCtx.fillStyle = "#000000";
  lightCtx.fillRect(0, 0, w, h);
  for (let k = 0; k < windows; k++) {
    const x = k * (w / windows) + 3;
    wallCtx.fillStyle = "#3a4250";
    wallCtx.fillRect(x, 7, w / windows - 6, 18);
    if (Math.random() < 0.45) {
      lightCtx.fillStyle = ["#ffd27a", "#ffe9b0", "#fff4dd"][k % 3];
      lightCtx.fillRect(x, 7, w / windows - 6, 18);
    }
  }
  const map = new THREE.CanvasTexture(wall);
  const emissiveMap = new THREE.CanvasTexture(lights);
  map.colorSpace = emissiveMap.colorSpace = THREE.SRGBColorSpace;
  return { map, emissiveMap };
}

export function City() {
  const floors = useRef<THREE.InstancedMesh>(null);
  const pads = useRef<THREE.InstancedMesh>(null);
  const lots = useMemo(createLots, []);
  const count = lots.length * MAX_FLOORS;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // A 1×1×1 box with its bottom at y = 0, so scaling it makes it grow upwards.
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const facade = useMemo(() => {
    const { map, emissiveMap } = makeFacadeTextures();
    return new THREE.MeshStandardMaterial({ map, emissiveMap, emissive: "#ffffff", emissiveIntensity: 0, roughness: 0.8 });
  }, []);
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a8f96", roughness: 0.9 }), []);
  // Box faces in order: +x, -x, top, bottom, +z, -z. Windows on the sides, plain roof on top.
  const materials = useMemo(() => [facade, facade, roof, roof, facade, facade], [facade, roof]);

  // Concrete pads under every lot. They never move, so they are placed once.
  useLayoutEffect(() => {
    lots.forEach((lot, i) => {
      dummy.position.set(lot.x, 0, lot.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(LOT * 0.96, 0.03, LOT * 0.96);
      dummy.updateMatrix();
      pads.current!.setMatrixAt(i, dummy.matrix);
    });
    pads.current!.instanceMatrix.needsUpdate = true;
  }, [lots, dummy]);

  useFrame((state, delta) => {
    const mesh = floors.current!;
    const dt = Math.min(delta, 0.1); // a hidden tab should not build a whole city in one frame
    facade.emissiveIntensity = nightAmount(state.clock.elapsedTime) * 1.6;

    lots.forEach((lot, l) => {
      updateLot(lot, dt);
      const built = Math.floor(lot.progress);
      const fraction = lot.progress - built;

      for (let f = 0; f < MAX_FLOORS; f++) {
        let y = f * FLOOR_HEIGHT;
        let height = FLOOR_HEIGHT;
        let color = lot.color;
        if (f === built && fraction > 0) {
          if (lot.mode === "build") {
            y += (1 - fraction) * 4 * FLOOR_HEIGHT; // the new floor drops in from above
            color = CRANE_COLOR;
          } else {
            height *= fraction; // the top floor shrinks away
          }
        } else if (f >= built) {
          height = 0; // not built: hide it
        }
        dummy.position.set(lot.x, y, lot.z);
        // Turn each floor by a multiple of 90° so the lit windows do not line up.
        dummy.rotation.set(0, ((l * 7 + f * 3) % 4) * (Math.PI / 2), 0);
        dummy.scale.set(height ? lot.width : 0, height, height ? lot.width : 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(l * MAX_FLOORS + f, dummy.matrix);
        mesh.setColorAt(l * MAX_FLOORS + f, color);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={floors} args={[geometry, materials, count]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={pads} args={[geometry, undefined, lots.length]} receiveShadow>
        <meshStandardMaterial color="#3a3f47" roughness={1} />
      </instancedMesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[GRID * LOT, GRID * LOT]} />
        <meshStandardMaterial color="#1c1f24" roughness={1} />
      </mesh>
    </>
  );
}
