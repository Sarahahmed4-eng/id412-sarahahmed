// Original: experiments-jyc / scc / face-voronoi/3 (Jeanyoon Choi, 2026). Unchanged.
import { PORTRAIT_ATLAS_COLUMNS, PORTRAIT_ATLAS_ROWS } from "./portrait-atlas";

export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_mode;
uniform float u_faceCore;
uniform sampler2D u_portraitAtlas;

out vec4 outputColor;

const float TAU = 6.28318530718;

vec2 random2(vec2 point) {
  return fract(sin(vec2(
    dot(point, vec2(127.1, 311.7)),
    dot(point, vec2(269.5, 183.3))
  )) * 43758.5453);
}

float random1(vec2 point) {
  return fract(sin(dot(point, vec2(19.27, 43.17))) * 43758.5453);
}

// Fixed HSL saturation and lightness preserve a pure colour transition.
vec3 hueToRgb(float hue) {
  vec3 color = clamp(
    abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
    0.0,
    1.0
  );
  return color;
}

// A hue belongs to a moving feature point, never to a screen coordinate.
float cellHue(vec2 cell, float time) {
  return fract(random1(cell) + time * 0.018);
}

// A circular hue mean keeps full HSL chroma while feature territories overlap.
float blendedHue(vec2 point, float time) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 hueVector = vec2(0.0);

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 feature = random2(cell + offset);
      feature = 0.5 + 0.5 * sin(time + TAU * feature);
      vec2 vector = offset + feature - local;
      float weight = exp(-3.25 * dot(vector, vector));
      float hue = cellHue(cell + offset, time) * TAU;
      hueVector += vec2(cos(hue), sin(hue)) * weight;
    }
  }

  return fract(atan(hueVector.y, hueVector.x) / TAU);
}

vec3 portraitAtUv(vec2 cellId, vec2 portraitUv) {
  float portraitIndex = floor(
    random1(cellId + vec2(53.17, 19.71)) * 56.0
  );
  vec2 portraitCell = vec2(
    mod(portraitIndex, ${PORTRAIT_ATLAS_COLUMNS}.0),
    floor(portraitIndex / ${PORTRAIT_ATLAS_COLUMNS}.0)
  );
  vec2 boundedUv = clamp(
    portraitUv,
    vec2(0.02),
    vec2(0.98)
  );
  vec2 atlasUv = (
    portraitCell + boundedUv
  ) / vec2(${PORTRAIT_ATLAS_COLUMNS}.0, ${PORTRAIT_ATLAS_ROWS}.0);
  return texture(u_portraitAtlas, atlasUv).rgb;
}

vec3 portraitAtWarped(
  vec2 cellId,
  vec2 featureVector,
  vec2 uvWarp
) {
  return portraitAtUv(
    cellId,
    vec2(0.5 - featureVector.x, 0.5 - featureVector.y) + uvWarp
  );
}

vec3 portraitAt(vec2 cellId, vec2 featureVector) {
  return portraitAtWarped(cellId, featureVector, vec2(0.0));
}

// This is the portrait equivalent of blendedHue: the same five-by-five
// moving-feature field supplies a continuous material rather than cell seams.
vec3 blendedPortrait(vec2 point, float time) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec3 linearPortrait = vec3(0.0);
  float totalWeight = 0.0;

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 cellId = cell + offset;
      vec2 feature = random2(cellId);
      feature = 0.5 + 0.5 * sin(time + TAU * feature);
      vec2 featureVector = offset + feature - local;
      float weight = exp(-3.25 * dot(featureVector, featureVector));
      linearPortrait += pow(
        portraitAt(cellId, featureVector),
        vec3(2.2)
      ) * weight;
      totalWeight += weight;
    }
  }

  return pow(
    linearPortrait / max(totalWeight, 0.0001),
    vec3(1.0 / 2.2)
  );
}

// Features first agree on one continuous face coordinate. Portraits are then
// combined at that same coordinate, so eyes meet eyes and mouths meet mouths.
vec3 alignedPortraitGradient(vec2 point, float time) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 coordinateSum = vec2(0.0);
  float totalWeight = 0.0;
  float coreFalloff = mix(3.25, 9.5, u_faceCore);

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 cellId = cell + offset;
      vec2 feature = random2(cellId);
      feature = 0.5 + 0.5 * sin(time + TAU * feature);
      vec2 featureVector = offset + feature - local;
      float weight = exp(-coreFalloff * dot(featureVector, featureVector));
      vec2 sourceCoordinate = vec2(
        0.5 - featureVector.x * 0.86,
        0.5 - featureVector.y * 0.86
      );
      coordinateSum += sourceCoordinate * weight;
      totalWeight += weight;
    }
  }

  vec2 sharedCoordinate = clamp(
    coordinateSum / max(totalWeight, 0.0001),
    vec2(0.04),
    vec2(0.96)
  );
  vec3 linearPortrait = vec3(0.0);

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 cellId = cell + offset;
      vec2 feature = random2(cellId);
      feature = 0.5 + 0.5 * sin(time + TAU * feature);
      vec2 featureVector = offset + feature - local;
      float weight = exp(-coreFalloff * dot(featureVector, featureVector));
      linearPortrait += pow(
        portraitAtUv(cellId, sharedCoordinate),
        vec3(2.2)
      ) * weight;
    }
  }

  return pow(
    linearPortrait / max(totalWeight, 0.0001),
    vec3(1.0 / 2.2)
  );
}

// Each portrait is a compact body. Nearby bodies form a smooth union, while
// separated bodies fall back to the dark field instead of becoming a blur.
vec3 solidPortraitMesh(vec2 point, float time) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  float unionWeight = 0.0;
  float firstWeight = 0.0;
  float secondWeight = 0.0;
  vec2 firstCell = vec2(0.0);
  vec2 secondCell = vec2(0.0);
  vec2 firstVector = vec2(0.0);
  vec2 secondVector = vec2(0.0);

  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 cellId = cell + offset;
      vec2 feature = random2(cellId);
      feature = 0.5 + 0.5 * sin(time + TAU * feature);
      vec2 featureVector = offset + feature - local;
      vec2 headSpace = featureVector * vec2(1.10, 0.80);
      float support = max(1.0 - 1.4 * dot(headSpace, headSpace), 0.0);
      float bodyWeight = support * support;
      unionWeight += bodyWeight;

      if (bodyWeight > firstWeight) {
        secondWeight = firstWeight;
        secondCell = firstCell;
        secondVector = firstVector;
        firstWeight = bodyWeight;
        firstCell = cellId;
        firstVector = featureVector;
      } else if (bodyWeight > secondWeight) {
        secondWeight = bodyWeight;
        secondCell = cellId;
        secondVector = featureVector;
      }
    }
  }

  float overlap = secondWeight / max(firstWeight + secondWeight, 0.0001);
  float contact = smoothstep(0.18, 0.46, overlap);
  vec2 join = secondVector - firstVector;
  vec2 joinAxis = join / max(length(join), 0.0001);
  vec2 firstLocal = -firstVector;
  vec2 secondLocal = -secondVector;
  vec2 firstWarp = joinAxis * (
    -dot(firstLocal, joinAxis) * contact * 0.52 + contact * 0.10
  );
  vec2 secondWarp = joinAxis * (
    -dot(secondLocal, joinAxis) * contact * 0.52 - contact * 0.10
  );
  vec3 firstPortrait = pow(
    portraitAtWarped(firstCell, firstVector, firstWarp),
    vec3(2.2)
  );
  vec3 secondPortrait = pow(
    portraitAtWarped(secondCell, secondVector, secondWarp),
    vec3(2.2)
  );
  vec3 material = pow(
    mix(firstPortrait, secondPortrait, overlap),
    vec3(1.0 / 2.2)
  );
  float solid = smoothstep(0.24, 0.38, unionWeight);
  return mix(vec3(0.018), material, solid);
}

void voronoi(
  vec2 point,
  float time,
  out float borderDistance,
  out vec2 nearestVector,
  out vec2 nearestCellId,
  out vec2 borderCellId
) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 nearestCell = vec2(0.0);
  nearestVector = vec2(0.0);
  float nearestDistance = 8.0;

  for (int row = -1; row <= 1; row++) {
    for (int column = -1; column <= 1; column++) {
      vec2 offset = vec2(float(column), float(row));
      vec2 feature = random2(cell + offset);
      feature = 0.5 + 0.5 * sin(time + 6.2831 * feature);
      vec2 vector = offset + feature - local;
      float distanceSquared = dot(vector, vector);
      if (distanceSquared < nearestDistance) {
        nearestDistance = distanceSquared;
        nearestVector = vector;
        nearestCell = offset;
      }
    }
  }

  nearestCellId = cell + nearestCell;
  borderCellId = nearestCellId;
  borderDistance = 8.0;
  for (int row = -2; row <= 2; row++) {
    for (int column = -2; column <= 2; column++) {
      vec2 offset = nearestCell + vec2(float(column), float(row));
      vec2 feature = random2(cell + offset);
      feature = 0.5 + 0.5 * sin(time + 6.2831 * feature);
      vec2 vector = offset + feature - local;
      vec2 difference = vector - nearestVector;
      if (dot(difference, difference) > 0.00001) {
        float candidate = dot(
          0.5 * (nearestVector + vector),
          normalize(difference)
        );
        if (candidate < borderDistance) {
          borderDistance = candidate;
          borderCellId = cell + offset;
        }
      }
    }
  }
}

void main() {
  vec2 point = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  point.x *= aspect;

  vec2 mouse = u_mouse;
  mouse.x *= aspect;
  vec2 fromMouse = point - mouse;
  float lens = exp(-length(fromMouse) * 6.0);
  point += u_warp * lens * vec2(fromMouse.y, -fromMouse.x) * 0.35;
  point *= u_scale;

  float borderDistance;
  vec2 nearestVector;
  vec2 nearestCellId;
  vec2 borderCellId;
  voronoi(
    point,
    u_time,
    borderDistance,
    nearestVector,
    nearestCellId,
    borderCellId
  );

  if (u_mode > 4.5) {
    outputColor = vec4(alignedPortraitGradient(point, u_time), 1.0);
    return;
  }

  if (u_mode > 3.5) {
    outputColor = vec4(solidPortraitMesh(point, u_time), 1.0);
    return;
  }

  if (u_mode > 2.5) {
    outputColor = vec4(blendedPortrait(point, u_time), 1.0);
    return;
  }

  if (u_mode > 1.5) {
    outputColor = vec4(portraitAt(nearestCellId, nearestVector), 1.0);
    return;
  }

  if (u_mode > 0.5) {
    float border = 1.0 - smoothstep(0.008, 0.02, borderDistance);
    float feature = 1.0 - smoothstep(0.0, 0.038, length(nearestVector));
    outputColor = vec4(mix(vec3(0.965), vec3(0.055), max(border, feature)), 1.0);
    return;
  }

  outputColor = vec4(hueToRgb(blendedHue(point, u_time)), 1.0);
}
`;
