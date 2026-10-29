// Original: experiments-jyc / scc / face-voronoi/3. WebGL2 setup: compile, link,
// one full-screen triangle, the portrait atlas as a texture, uniforms per frame.
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";

export type VisualMode =
  | "colour"
  | "monochrome"
  | "face"
  | "face-gradient-1"
  | "face-gradient-2"
  | "face-gradient-3";

export type ShaderRenderer = {
  render: (
    time: number,
    mouse: { x: number; y: number },
    mode: VisualMode,
    faceCore: number,
  ) => void;
  resize: (width: number, height: number, pixelRatio: number) => void;
  setPortraitAtlas: (source: HTMLCanvasElement) => void;
  destroy: () => void;
};

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL could not create a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

export function createShaderRenderer(gl: WebGL2RenderingContext): ShaderRenderer {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("WebGL could not create a program.");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }

  const positionBuffer = gl.createBuffer();
  if (!positionBuffer) {
    gl.deleteProgram(program);
    throw new Error("WebGL could not create a vertex buffer.");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );

  const portraitTexture = gl.createTexture();
  if (!portraitTexture) {
    gl.deleteBuffer(positionBuffer);
    gl.deleteProgram(program);
    throw new Error("WebGL could not create a portrait texture.");
  }
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, portraitTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([11, 9, 9, 255]),
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const mouseLocation = gl.getUniformLocation(program, "u_mouse");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const warpLocation = gl.getUniformLocation(program, "u_warp");
  const scaleLocation = gl.getUniformLocation(program, "u_scale");
  const modeLocation = gl.getUniformLocation(program, "u_mode");
  const faceCoreLocation = gl.getUniformLocation(program, "u_faceCore");
  const portraitAtlasLocation = gl.getUniformLocation(program, "u_portraitAtlas");

  return {
    resize(width, height, pixelRatio) {
      gl.canvas.width = Math.round(width * pixelRatio);
      gl.canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    },
    render(time, mouse, mode, faceCore) {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(timeLocation, time);
      gl.uniform1f(warpLocation, 0.65);
      gl.uniform1f(scaleLocation, 6.0);
      const shaderMode =
        mode === "face-gradient-3"
          ? 5
          : mode === "face-gradient-2"
          ? 4
          : mode === "face-gradient-1"
            ? 3
            : mode === "face"
              ? 2
              : mode === "monochrome"
                ? 1
                : 0;
      gl.uniform1f(modeLocation, shaderMode);
      gl.uniform1f(faceCoreLocation, faceCore);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, portraitTexture);
      gl.uniform1i(portraitAtlasLocation, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    setPortraitAtlas(source) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, portraitTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    },
    destroy() {
      gl.deleteTexture(portraitTexture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    },
  };
}

