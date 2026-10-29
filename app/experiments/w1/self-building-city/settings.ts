// Numbers shared by the buildings, the cars and the sky: the grid and the day/night clock.
export const GRID = 29; // cells per side
export const ROAD_EVERY = 4; // every 4th row and column is a road
export const LOT = 1; // size of one cell in world units
export const DAY_LENGTH = 40; // seconds for one full day and night

export const isRoad = (i: number) => i % ROAD_EVERY === 0;
export const cellToWorld = (i: number) => (i - (GRID - 1) / 2) * LOT;

// Angle of the sun around the city. It starts in the afternoon.
export const sunAngle = (time: number) => (time / DAY_LENGTH + 0.3) * Math.PI * 2;

// 0 in daylight, 1 at night, a short fade around sunset and sunrise.
export function nightAmount(time: number) {
  const sunHeight = Math.sin(sunAngle(time));
  return Math.min(1, Math.max(0, 0.5 - sunHeight * 2.5));
}
