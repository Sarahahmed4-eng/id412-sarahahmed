// 56 portraits tiled into one 8×7 texture, built on a canvas at load time.
// The images are generated avatars from pravatar.cc (sourceUrl), copied to
// public/experiments/w1/glsl/face-voronoi/portraits/. Original: experiments-jyc / scc.

export const PORTRAIT_ATLAS_COLUMNS = 8;
export const PORTRAIT_ATLAS_ROWS = 7;

const SOURCE_INDICES = [
  2, 3, 4, 5, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47,
  49, 51, 52, 53, 56, 57, 58, 59, 60, 63, 64, 65, 66, 67, 68, 69, 70,
] as const;

export const FACE_PORTRAITS = SOURCE_INDICES.map((sourceIndex, index) => {
  const fileName = String(index + 1).padStart(3, "0");
  return {
    src: `/experiments/w1/glsl/face-voronoi/portraits/${fileName}.jpg`,
    sourceUrl: `https://i.pravatar.cc/720?img=${sourceIndex}`,
  };
});

function loadPortrait(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // A successfully loaded image can still be drawn.
      }
      resolve(image);
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function createPortraitAtlas() {
  const tileSize = 128;
  const canvas = document.createElement("canvas");
  canvas.width = PORTRAIT_ATLAS_COLUMNS * tileSize;
  canvas.height = PORTRAIT_ATLAS_ROWS * tileSize;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#0b0909";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const images = await Promise.all(FACE_PORTRAITS.map((portrait) => loadPortrait(portrait.src)));

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (!image) continue;
    const column = index % PORTRAIT_ATLAS_COLUMNS;
    const row = Math.floor(index / PORTRAIT_ATLAS_COLUMNS);
    context.drawImage(image, column * tileSize, row * tileSize, tileSize, tileSize);
  }

  return canvas;
}
