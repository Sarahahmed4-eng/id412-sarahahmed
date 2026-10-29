// The vertex shader places the full-screen triangle. It never changes.
export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// The fragment shader runs once per pixel and returns one colour.
// The only input it uses is the screen size, to turn the pixel into uv.
export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;

out vec4 outputColor;

void main() {
  // uv: this pixel's position, 0..1 on both axes (0,0 is bottom-left)
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // Colour from position: red follows x, green follows y, blue stays at 0.5
  outputColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
`;
