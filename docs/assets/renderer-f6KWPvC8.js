const n=`import type { QuantumAudioFrame, QuantumFieldMode } from "./QuantumField";

const TAU = Math.PI * 2;
const random = (seed: number) => {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
};

type Point = (u: number, v: number, w: number) => [number, number, number];
/** Original spatial grammars; only the mode-specific coordinates differ. */
const fields: Record<QuantumFieldMode, Point> = {
  orbit: (u, v, w) => {
    const z = v * 2 - 1, radius = Math.sqrt(1 - z * z) * (0.03 + 0.97 * Math.cbrt(w));
    return [Math.cos(u * TAU) * radius, Math.sin(u * TAU) * radius, z];
  },
  vortex: (u, v, w) => {
    const angle = u * TAU * 3.5 + v * TAU, radius = 0.12 + v * 0.9;
    return [Math.cos(angle) * radius, (u - 0.5) * 1.8 + Math.sin(angle) * 0.07, Math.sin(angle) * radius + (w - 0.5) * 0.3];
  },
  lattice: (u, v, w) => [
    (Math.floor(u * 18) / 8.5 - 1) + (w - 0.5) * 0.04,
    (Math.floor(v * 18) / 8.5 - 1) + (u - 0.5) * 0.04,
    (Math.floor(w * 18) / 8.5 - 1) + (v - 0.5) * 0.04,
  ],
  wave: (u, v, w) => {
    const x = u * 2.4 - 1.2, z = v * 2.2 - 1.1;
    return [x, Math.sin(x * 5 + z * 3) * 0.24 + (w - 0.5) * 0.08, z];
  },
  bloom: (u, v, w) => {
    const angle = u * TAU, petal = 0.18 + v * (0.44 + 0.4 * Math.abs(Math.cos(angle * 5)));
    return [Math.cos(angle) * petal, Math.sin(angle) * petal, (w * 2 - 1) * (0.4 + 0.5 * v)];
  },
  helix: (u, v, w) => {
    const angle = u * TAU * 4 + (v > 0.5 ? Math.PI : 0), radius = 0.5 + (w - 0.5) * 0.12;
    return [Math.cos(angle) * radius, u * 2 - 1, Math.sin(angle) * radius];
  },
  terrain: (u, v, w) => {
    const x = u * 2.5 - 1.25, z = v * 2.4 - 1.2;
    return [x, Math.sin(x * 6) * Math.cos(z * 5) * 0.25 + (w - 0.5) * 0.06, z];
  },
};

/** Four floats per particle: true x/y/z and a stable band/accent seed. */
export function quantumFieldGeometry(mode: QuantumFieldMode, count: number) {
  const next = random(0x50a21);
  const data = new Float32Array(Math.max(0, Math.floor(count)) * 4);
  const point = fields[mode];
  for (let i = 0; i < data.length; i += 4) {
    const u = next(), v = next(), w = next();
    const [x, y, z] = point(u, v, w);
    const seed = next();
    const radius = seed < 0.18 ? 1.12 + next() * 0.48 : 1;
    data[i] = x * radius;
    data[i + 1] = y * radius;
    data[i + 2] = z * radius;
    data[i + 3] = seed;
  }
  return data;
}

/** Short connected paths share the same 3D grammar as the points, but stay sparse at rest. */
export function quantumFieldFilaments(mode: QuantumFieldMode, strands: number, steps: number) {
  const next = random(0x7a9e1);
  const segments = Math.max(0, Math.floor(strands)) * Math.max(1, Math.floor(steps));
  const data = new Float32Array(segments * 2 * 4);
  const point = fields[mode];
  let offset = 0;
  for (let strand = 0; strand < Math.floor(strands); strand += 1) {
    const u = next(), v = next(), w = next();
    const sample = (t: number) => point(
      (u + t * 0.1) % 1,
      Math.max(0, Math.min(1, v + Math.sin(t * TAU + u * TAU) * 0.025)),
      w,
    );
    for (let step = 0; step < Math.floor(steps); step += 1) {
      for (const t of [step / steps, (step + 1) / steps]) {
        const [x, y, z] = sample(t);
        data.set([x, y, z, w], offset);
        offset += 4;
      }
    }
  }
  return data;
}

/** A tiny, deterministic proximity graph; only this small buffer changes every two seconds. */
export function quantumFieldNetwork(mode: QuantumFieldMode, nodes: number, epoch: number) {
  const points = quantumFieldGeometry(mode, Math.max(0, Math.floor(nodes)));
  const select = random(0x3ae91 + epoch * 911);
  const edges: number[] = [];
  for (let i = 0; i < points.length / 4 && edges.length < 320 * 8; i += 1) {
    let closest = -1, best = 0.55 ** 2;
    for (let j = i + 1; j < points.length / 4; j += 1) {
      if (select() > 0.45) continue;
      const dx = points[i * 4]! - points[j * 4]!;
      const dy = points[i * 4 + 1]! - points[j * 4 + 1]!;
      const dz = points[i * 4 + 2]! - points[j * 4 + 2]!;
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance < best) { best = distance; closest = j; }
    }
    if (closest >= 0) {
      edges.push(...points.slice(i * 4, i * 4 + 4), ...points.slice(closest * 4, closest * 4 + 4));
    }
  }
  return Float32Array.from(edges);
}

/** Exponential wheel response is independent of mouse notch size and safely bounded. */
export const quantumFieldZoom = (distance: number, deltaY: number) =>
  Math.max(0.06, Math.min(8, distance * Math.exp(Math.max(-500, Math.min(500, deltaY)) * 0.0012)));

const VERTEX = \`
precision mediump float;
attribute vec4 aPoint;
uniform float uTime, uZoom, uYaw, uPitch, uAspect, uPixelRatio, uHalo, uEnergy, uBeat;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uBands[7];
varying float vLight, vAccent, vMicro, vStar, vDepth, vSparkle;
vec3 fieldFlow(vec3 p, float t) {
  vec3 broad = vec3(
    sin(p.y * 3.7 + t) * cos(p.z * 2.9 - t * 0.61),
    sin(p.z * 3.4 - t * 0.73) * cos(p.x * 3.1 + t * 0.47),
    sin(p.x * 3.8 + t * 0.57) * cos(p.y * 2.7 - t * 0.53)
  );
  vec3 fine = vec3(
    sin(p.y * 8.1 - t * 0.8) * cos(p.z * 6.4 + t * 0.4),
    sin(p.z * 7.8 + t * 0.6) * cos(p.x * 6.8 - t * 0.3),
    sin(p.x * 8.3 - t * 0.5) * cos(p.y * 6.1 + t * 0.7)
  );
  return broad * 0.75 + fine * 0.25;
}
void main() {
  float band = uBands[int(floor(aPoint.w * 7.0))];
  vec3 p = aPoint.xyz;
  float shell = 1.0 - step(0.14, aPoint.w);
  float motion = (0.045 + band * 0.07 + uEnergy * 0.03) * (1.0 + (1.0 - smoothstep(0.45, 1.7, uZoom)) * 0.45);
  p += fieldFlow(p, uTime * mix(0.45, 0.2, shell)) * motion * mix(1.0, 0.65, shell);
  float cy = cos(uYaw), sy = sin(uYaw);
  p = vec3(p.x * cy - p.z * sy, p.y, p.x * sy + p.z * cy);
  float cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);
  float depth = uZoom - p.z;
  if (depth <= 0.06) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    gl_PointSize = 0.0;
    vLight = 0.0;
    vAccent = 0.0;
    vMicro = 0.0;
    vStar = 0.0;
    vDepth = 0.0;
    vSparkle = 0.0;
    return;
  }
  float micro = 1.0 - smoothstep(0.45, 1.7, uZoom);
  float perspective = 2.45 / depth;
  vec2 projected = vec2(p.x * perspective / max(1.0, uAspect * 0.7), p.y * perspective);
  vec2 away = projected - uPointer;
  float nearby = uPointerActive * exp(-dot(away, away) * 26.0);
  projected += nearby * (away * 0.035 + vec2(sin(aPoint.w * 31.0 + uTime), cos(aPoint.w * 27.0 + uTime)) * 0.006);
  gl_Position = vec4(projected, 0.0, 1.0);
  float star = step(0.976, aPoint.w);
  gl_PointSize = clamp((uHalo > 0.5 ? 16.0 : 3.5) * perspective * uPixelRatio * (0.85 + band * 0.55 + nearby * 0.2 + star * (0.55 + micro)), 1.25, uHalo > 0.5 ? 36.0 : 18.0);
  vDepth = smoothstep(0.15, 2.4, depth);
  vSparkle = star * (0.55 + 0.45 * sin(uTime * 3.4 + aPoint.w * 391.0));
  vLight = clamp(0.42 + perspective * 0.52 + band * 0.24 + uBeat * 0.25 + star * 0.25, 0.2, 1.0) * mix(1.0, 0.7, shell);
  vAccent = step(0.76, aPoint.w);
  vMicro = micro;
  vStar = star;
}\`;
const FRAGMENT = \`
precision mediump float;
uniform vec3 uPrimary, uSecondary;
uniform float uHalo, uLine;
varying float vLight, vAccent, vMicro, vStar, vDepth, vSparkle;
void main() {
  if (uLine > 0.5) {
    gl_FragColor = vec4(mix(uPrimary, uSecondary, vAccent), mix(0.18, 0.5, vMicro) * vLight);
    return;
  }
  if (uHalo > 0.5 && vStar < 0.5) discard;
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv) * 2.0;
  float flare = (exp(-abs(uv.x) * 25.0) * exp(-abs(uv.y) * 3.0) + exp(-abs(uv.y) * 25.0) * exp(-abs(uv.x) * 3.0)) * vSparkle * (0.25 + vMicro * 0.75) * 0.28;
  float envelope = uHalo > 0.5 ? exp(-r * r * 4.2) * (0.27 + vSparkle * 0.23) : smoothstep(0.95, 0.25, r) * 0.96 + exp(-r * r * 24.0) * 0.18 + flare;
  float alpha = envelope * vLight * mix(1.0, 0.42, vDepth);
  vec3 tone = mix(uPrimary, uSecondary, clamp(vAccent * 0.8 + vSparkle * 0.38, 0.0, 1.0));
  tone = mix(tone, vec3(1.0), vSparkle * (uHalo > 0.5 ? 0.2 : 0.72));
  gl_FragColor = vec4(tone, alpha);
}\`;

const compile = (gl: WebGLRenderingContext, kind: number, source: string) => {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const rgb = (color: string): [number, number, number] => {
  const hex = color.trim();
  if (/^#[\\da-f]{6}$/i.test(hex)) {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
  }
  const channels = hex.match(/[\\d.]+/g)?.slice(0, 3).map(Number);
  return channels?.length === 3 ? [channels[0]! / 255, channels[1]! / 255, channels[2]! / 255] : [1, 0.15, 0.3];
};

/** One static GPU buffer, two inexpensive point passes, no texture uploads or postprocessing. */
export function createQuantumFieldRenderer(canvas: HTMLCanvasElement, mode: QuantumFieldMode, count: number) {
  const gl = canvas.getContext("webgl", {
    alpha: true, antialias: false, depth: false, stencil: false,
    preserveDrawingBuffer: false, powerPreference: "low-power",
  });
  if (!gl || typeof gl.createShader !== "function") return null;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const lineBuffer = gl.createBuffer();
  const networkBuffer = gl.createBuffer();
  if (!program || !buffer || !lineBuffer || !networkBuffer) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const data = quantumFieldGeometry(mode, count);
  const lines = quantumFieldFilaments(mode, Math.min(240, Math.max(80, Math.round(count / 100))), 12);
  let network = quantumFieldNetwork(mode, 96, 0);
  let networkEpoch = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, networkBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, network, gl.DYNAMIC_DRAW);
  gl.useProgram(program);
  const attribute = gl.getAttribLocation(program, "aPoint");
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
  const uniform = Object.fromEntries([
    "uTime", "uZoom", "uYaw", "uPitch", "uAspect", "uPixelRatio", "uHalo", "uLine", "uEnergy", "uBeat", "uBands", "uPrimary", "uSecondary", "uPointer", "uPointerActive",
  ].map((name) => [name, gl.getUniformLocation(program, name === "uBands" ? "uBands[0]" : name)])) as Record<string, WebGLUniformLocation | null>;
  let primary = rgb("#ff244c"), secondary = rgb("#ff7c97");
  const bands = new Float32Array(7);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  return {
    setPalette(main: string, light: string) {
      primary = rgb(main);
      secondary = rgb(light);
    },
    resize(width: number, height: number) { gl.viewport(0, 0, width, height); },
    draw(time: number, camera: { zoom: number; yaw: number; pitch: number }, audio?: QuantumAudioFrame, pointer?: { x: number; y: number; active: boolean }) {
      if (gl.isContextLost()) return;
      const epoch = Math.floor(time / 2);
      if (epoch !== networkEpoch) {
        network = quantumFieldNetwork(mode, 96, epoch);
        gl.bindBuffer(gl.ARRAY_BUFFER, networkBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, network, gl.DYNAMIC_DRAW);
        networkEpoch = epoch;
      }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniform.uTime, time);
      gl.uniform1f(uniform.uZoom, camera.zoom);
      gl.uniform1f(uniform.uYaw, camera.yaw);
      gl.uniform1f(uniform.uPitch, camera.pitch);
      gl.uniform1f(uniform.uAspect, canvas.width / Math.max(1, canvas.height));
      gl.uniform1f(uniform.uPixelRatio, Math.min(1.5, canvas.width / Math.max(1, canvas.clientWidth)));
      gl.uniform1f(uniform.uEnergy, Math.max(0, Math.min(1, audio?.energy ?? 0)));
      gl.uniform1f(uniform.uBeat, Math.max(0, Math.min(1, audio?.beat ?? 0)));
      gl.uniform2f(uniform.uPointer, pointer?.x ?? 0, -(pointer?.y ?? 0));
      gl.uniform1f(uniform.uPointerActive, pointer?.active ? 1 : 0);
      for (let i = 0; i < 7; i += 1) bands[i] = Math.max(0, Math.min(1, audio?.bands[i] ?? 0));
      gl.uniform1fv(uniform.uBands, bands);
      gl.uniform3fv(uniform.uPrimary, primary);
      gl.uniform3fv(uniform.uSecondary, secondary);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(uniform.uLine, 1);
      gl.drawArrays(gl.LINES, 0, lines.length / 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, networkBuffer);
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.LINES, 0, network.length / 4);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniform.uLine, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.uniform1f(uniform.uHalo, 1);
      gl.drawArrays(gl.POINTS, 0, data.length / 4);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(uniform.uHalo, 0);
      gl.drawArrays(gl.POINTS, 0, data.length / 4);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteBuffer(lineBuffer);
      gl.deleteBuffer(networkBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}
`;export{n as default};
