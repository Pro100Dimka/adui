const e=`import { useEffect, useRef, useState } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { createResizeObserver } from "../../../core/environment";
import { useTick } from "../../../core/motion/hooks";
import { useMotion } from "../../../core/providers/context";
import { useThemePalette } from "../../foundation/ThemeProvider/ThemeProvider";
import { createQuantumFieldRenderer, quantumFieldZoom } from "./renderer";

/** Seven deliberately different three-dimensional compositions. */
export const quantumFieldModes = ["orbit", "vortex", "lattice", "wave", "bloom", "helix", "terrain"] as const;
export type QuantumFieldMode = (typeof quantumFieldModes)[number];
export type QuantumFieldQuality = "auto" | "low" | "high";
export interface QuantumAudioFrame {
  /** Seven normalized bands from bass to air, each 0–1. */
  bands: readonly number[];
  energy?: number;
  beat?: number;
}
type AudioInput = QuantumAudioFrame | Pick<AnalyserNode, "frequencyBinCount" | "getByteFrequencyData"> | (() => QuantumAudioFrame);
export interface QuantumFieldProps extends CommonProps {
  /** The field is visible on first paint; no start screen or keyboard gate. */
  mode?: QuantumFieldMode;
  quality?: QuantumFieldQuality;
  /** 0–1. Capped internally to keep third-party pages responsive. */
  density?: number;
  /** 0 pauses its drift, 1 is the normal cinematic pace. */
  speed?: number;
  /** Supply an AnalyserNode, seven-band frame, or a callback reading the latest frame. */
  audio?: AudioInput;
  /** Optional microphone/loopback stream obtained after an explicit user action. */
  stream?: MediaStream;
  /** Override just this instance; otherwise it follows the nearest ThemeProvider/CSS tokens. */
  palette?: readonly [string, string];
  interactive?: boolean;
  paused?: boolean;
}

const PIXEL_BUDGET = { low: 320_000, high: 960_000 } as const;
const POINT_BUDGET = { low: 1_400, high: 2_800 } as const;
const WEBGL_BUDGET = { low: 32_000, high: 64_000 } as const;
const FPS = { low: 24, high: 30 } as const;
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

/** Caps both backing-store size and DPR; large monitors never create huge canvases. */
export function quantumFieldResolution(width: number, height: number, dpr: number, quality: QuantumFieldQuality) {
  const budget = PIXEL_BUDGET[quality === "high" ? "high" : "low"];
  const scale = Math.min(Math.max(1, dpr), 1.5, Math.sqrt(budget / Math.max(1, width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)) };
}

/** Reads an analyser into a caller-owned scratch buffer, then reduces it to stable log-spaced bands. */
export function quantumFieldAudio(
  analyser: Pick<AnalyserNode, "frequencyBinCount" | "getByteFrequencyData">,
  scratch: Uint8Array,
  frame?: { bands: number[]; energy: number },
): QuantumAudioFrame {
  analyser.getByteFrequencyData(scratch as Uint8Array<ArrayBuffer>);
  const bands = frame?.bands ?? new Array<number>(7);
  let energy = 0;
  for (let band = 0; band < 7; band += 1) {
    const start = Math.floor((band / 7) ** 1.7 * scratch.length);
    const end = Math.max(start + 1, Math.floor(((band + 1) / 7) ** 1.7 * scratch.length));
    let total = 0;
    for (let i = start; i < end; i += 1) total += scratch[i] ?? 0;
    bands[band] = clamp(total / ((end - start) * 255));
    energy += bands[band]!;
  }
  if (frame) {
    frame.energy = energy / 7;
    return frame;
  }
  return { bands, energy: energy / 7 };
}

const isAnalyser = (audio: AudioInput): audio is Pick<AnalyserNode, "frequencyBinCount" | "getByteFrequencyData"> =>
  typeof audio === "object" && "getByteFrequencyData" in audio;

/** Each field has its own spatial grammar, while sharing a tiny deterministic particle pool. */
const positions: Record<QuantumFieldMode, (u: number, v: number, t: number, energy: number) => [number, number, number]> = {
  orbit: (u, v, t, e) => {
    const a = u * Math.PI * 2 + t * (0.18 + e * 0.12);
    const r = 0.18 + Math.sqrt(v) * 0.7;
    return [Math.cos(a) * r, Math.sin(a) * r * 0.58, 1 - v];
  },
  vortex: (u, v, t, e) => {
    const a = u * Math.PI * 8 + t * 0.28 + v * 3;
    const r = (0.08 + v * 0.82) * (1 + e * 0.14);
    return [Math.cos(a) * r, Math.sin(a) * r * 0.61, 1 - v];
  },
  lattice: (u, v, t, e) => {
    const x = ((Math.floor(u * 37) % 37) / 18 - 1) * 0.92;
    const y = ((Math.floor(v * 19) % 19) / 9 - 1) * 0.82;
    return [x + Math.sin(y * 6 + t) * 0.025, y + Math.sin(x * 7 + t * 0.8) * (0.035 + e * 0.08), 0.6];
  },
  wave: (u, v, t, e) => {
    const x = u * 2 - 1;
    return [x, (v - 0.5) * 0.75 + Math.sin(x * 10 - t * 1.2 + v * 5) * (0.08 + e * 0.17), 0.7 + v * 0.2];
  },
  bloom: (u, v, t, e) => {
    const a = u * Math.PI * 2;
    const petal = 0.27 + 0.55 * v * Math.abs(Math.cos(a * 5 + t * 0.18));
    return [Math.cos(a + t * 0.08) * petal, Math.sin(a + t * 0.08) * petal * 0.72, 0.6 + e * 0.4];
  },
  helix: (u, v, t, e) => {
    const x = u * 2 - 1;
    const a = x * 15 + t * 0.55 + Math.floor(v * 2) * Math.PI;
    return [x, Math.sin(a) * (0.2 + e * 0.12), 0.5 + Math.cos(a) * 0.4];
  },
  terrain: (u, v, t, e) => {
    const x = u * 2 - 1, depth = v * 1.5 - 0.5;
    return [x * (0.5 + v * 0.5), depth * 0.7 - Math.sin(x * 9 + t * 0.6) * Math.cos(v * 7) * (0.08 + e * 0.16), 1 - v * 0.7];
  },
};

const hash = (n: number) => {
  const value = Math.sin(n * 127.1 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
};

const color = (value: string, opacity: number) => {
  if (/^#[0-9a-f]{6}$/i.test(value)) {
    const number = Number.parseInt(value.slice(1), 16);
    return \`rgba(\${number >> 16},\${(number >> 8) & 255},\${number & 255},\${opacity})\`;
  }
  return value;
};

/** Theme-native, audio-reactive 3D field with a lightweight 2D fallback. */
export function QuantumField({
  mode = "orbit", quality = "auto", density = 0.6, speed = 1, audio,
  stream, palette, interactive = false, paused = false, ...p
}: QuantumFieldProps) {
  const theme = useThemePalette();
  const motion = useMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const paint = useRef<(now: number) => void>(() => undefined);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const camera = useRef({ zoom: 3.5, yaw: 0, pitch: 0.16 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const visible = useRef(false);
  const [onscreen, setOnscreen] = useState(typeof IntersectionObserver === "undefined");
  const frame = useRef({ last: 0, time: 0 });
  const connectedAudio = useRef<AnalyserNode | null>(null);
  const live = useRef({ speed, audio, palette, theme });
  const updatePalette = useRef<() => void>(() => undefined);
  const followsTheme = !palette?.[0] || !palette?.[1];
  live.current = { speed, audio, palette, theme };

  useEffect(() => {
    if (!stream) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);
    void context.resume().catch(() => undefined);
    connectedAudio.current = analyser;
    return () => {
      connectedAudio.current = null;
      source.disconnect();
      analyser.disconnect();
      void context.close();
    };
  }, [stream]);

  useEffect(() => {
    const element = canvas.current;
    const host = root.current;
    if (!element || !host) return;
    const device = typeof navigator === "undefined" ? null : navigator as Navigator & { deviceMemory?: number };
    const tier = quality === "high" || (quality === "auto" && (device?.hardwareConcurrency ?? 4) >= 12 && (device?.deviceMemory ?? 0) >= 8) ? "high" : "low";
    const renderer = createQuantumFieldRenderer(element, mode, Math.round(WEBGL_BUDGET[tier] * clamp(density)));
    const context = renderer ? null : element.getContext("2d", { alpha: true });
    if (!renderer && !context) return;
    let scratch: Uint8Array | null = null;
    const audioFrame = { bands: Array<number>(7).fill(0), energy: 0 };
    let ink = live.current.theme.primary, glint = live.current.theme.secondary;
    const readPalette = () => {
      const supplied = live.current.palette;
      const style = supplied?.[0] && supplied?.[1] ? null : getComputedStyle(host);
      ink = supplied?.[0] || style?.getPropertyValue("--ad-primary").trim() || live.current.theme.primary;
      glint = supplied?.[1] || style?.getPropertyValue("--ad-secondary").trim() || live.current.theme.secondary;
    };
    readPalette();
    renderer?.setPalette(ink, glint);
    const count = Math.round(POINT_BUDGET[tier] * clamp(density));
    const seeds = renderer ? null : new Float32Array(count * 2);
    if (seeds) for (let i = 0; i < count; i += 1) {
      seeds[i * 2] = hash(i * 2 + 3);
      seeds[i * 2 + 1] = hash(i * 2 + 7);
    }
    const sample = (): QuantumAudioFrame | undefined => {
      const input = live.current.audio ?? connectedAudio.current;
      if (!input) return undefined;
      if (typeof input === "function") return input();
      if (isAnalyser(input)) {
        if (!scratch || scratch.length !== input.frequencyBinCount) scratch = new Uint8Array(input.frequencyBinCount);
        return quantumFieldAudio(input, scratch, audioFrame);
      }
      return input;
    };
    const draw = (now: number) => {
      if (!visible.current && now !== 0) return;
      if (now && now - frame.current.last < 1000 / FPS[tier]) return;
      if (now) {
        const elapsed = frame.current.last ? Math.min(60, Math.max(0, now - frame.current.last)) : 0;
        frame.current.last = now;
        frame.current.time += elapsed * 0.001 * clamp(live.current.speed, 0, 3);
      }
      const sound = sample();
      if (renderer) {
        renderer.draw(frame.current.time, camera.current, sound, pointer.current);
        return;
      }
      if (!context) return;
      const w = element.width, h = element.height;
      context.clearRect(0, 0, w, h);
      if (!w || !h) return;
      const bands = sound?.bands ?? [];
      const energy = clamp(sound?.energy ?? bands.reduce((sum, level) => sum + clamp(level), 0) / 7);
      const beat = clamp(sound?.beat ?? 0);
      const time = frame.current.time;
      const place = positions[mode];
      context.globalCompositeOperation = "lighter";
      // A few spatial filaments give the cloud a legible form without a post-processing pass.
      // Their shared geometry follows the same audio field as the points.
      if (mode !== "lattice") {
        for (let strand = 0; strand < 6; strand += 1) {
          context.beginPath();
          for (let step = 0; step <= 72; step += 1) {
            const [x, y] = place(step / 72, (strand + 0.5) / 6, time, energy);
            const px = (x * 0.44 + 0.5) * w;
            const py = (y * 0.46 + 0.5) * h;
            if (step) context.lineTo(px, py);
            else context.moveTo(px, py);
          }
          context.strokeStyle = color(strand % 3 ? ink : glint, 0.09 + energy * 0.09);
          context.lineWidth = strand % 3 ? 0.7 : 1.2;
          context.stroke();
        }
      } else {
        for (let row = 0; row < 12; row += 1) {
          const y = (row / 11 * 0.78 + 0.11) * h;
          context.beginPath();
          context.moveTo(w * 0.08, y);
          context.lineTo(w * 0.92, y);
          context.strokeStyle = color(row % 4 ? ink : glint, 0.07 + energy * 0.07);
          context.lineWidth = 0.7;
          context.stroke();
        }
      }
      // Two passes avoid parsing/building a CSS colour for every particle on every frame.
      for (const accent of [false, true]) {
        context.fillStyle = accent ? glint : ink;
        for (let i = 0; i < count; i += 1) {
          if ((i % 9 === 0) !== accent) continue;
          const u = seeds![i * 2]!, v = seeds![i * 2 + 1]!;
          const [x, y, depth] = place(u, v, time, clamp(bands[i % 7] ?? energy));
          let px = (x * 0.44 + 0.5) * w;
          let py = (y * 0.46 + 0.5) * h;
          if (pointer.current.active) {
            const dx = px - (pointer.current.x + 1) * w * 0.5;
            const dy = py - (pointer.current.y + 1) * h * 0.5;
            const radius = Math.min(w, h) * 0.24;
            const influence = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
            px += dx * influence * 0.08;
            py += dy * influence * 0.08;
          }
          context.globalAlpha = Math.min(0.92, 0.3 + clamp(depth) * 0.53 + energy * 0.2 + beat * 0.09);
          context.beginPath();
          context.arc(px, py, (i % 11 === 0 ? 2.1 : 1.05) * (0.7 + depth * 0.65) * Math.max(0.8, Math.min(w, h) / 440), 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };
    paint.current = draw;
    let sized = false, painted = false;
    updatePalette.current = () => {
      const previousInk = ink, previousGlint = glint;
      readPalette();
      if (ink === previousInk && glint === previousGlint) return;
      renderer?.setPalette(ink, glint);
      if (visible.current) draw(0);
      else painted = false;
    };
    const resize = () => {
      const bounds = host.getBoundingClientRect();
      const size = quantumFieldResolution(bounds.width, bounds.height, window.devicePixelRatio || 1, tier);
      const changed = element.width !== size.width || element.height !== size.height;
      if (changed) {
        element.width = size.width;
        element.height = size.height;
        painted = false;
      }
      if (changed || !sized) renderer?.resize(size.width, size.height);
      sized = true;
      if (visible.current && !painted) {
        draw(0);
        painted = true;
      }
    };
    const observer = createResizeObserver(resize);
    observer.observe(host);
    const intersection = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          visible.current = !!entry?.isIntersecting;
          setOnscreen(visible.current);
          if (visible.current) resize();
        }, { rootMargin: "10% 0px" })
      : null;
    visible.current = !intersection;
    intersection?.observe(host);
    if (!intersection) resize();
    return () => {
      observer.disconnect();
      intersection?.disconnect();
      renderer?.dispose();
      paint.current = () => undefined;
      updatePalette.current = () => undefined;
    };
  }, [mode, quality, density]);

  useEffect(() => updatePalette.current(), [palette?.[0], palette?.[1], theme.primary, theme.secondary]);

  useEffect(() => {
    const host = root.current;
    if (!followsTheme || !host || typeof MutationObserver === "undefined") return;
    const tokens = new MutationObserver(() => updatePalette.current());
    for (let node: HTMLElement | null = host; node; node = node.parentElement)
      tokens.observe(node, { attributes: true, attributeFilter: ["style", "class", "data-ad-theme", "data-ad-color-scheme"] });
    return () => tokens.disconnect();
  }, [followsTheme]);

  useTick((now) => paint.current(now), motion && !paused && onscreen);

  useEffect(() => {
    const surface = canvas.current;
    const host = root.current;
    const doc = surface?.ownerDocument;
    if (!surface || !host || !doc || !interactive) return;
    const wheel = (event: WheelEvent) => {
      const bounds = surface.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX >= bounds.right || event.clientY < bounds.top || event.clientY >= bounds.bottom) return;
      event.preventDefault();
      camera.current.zoom = quantumFieldZoom(camera.current.zoom, event.deltaY);
      host.dataset.zoom = camera.current.zoom.toFixed(3);
      if (!motion || paused) paint.current(0);
    };
    doc.addEventListener("wheel", wheel, { passive: false, capture: true });
    return () => doc.removeEventListener("wheel", wheel, true);
  }, [interactive, motion, paused]);

  return (
    <div
      {...mark("QuantumField", p)} ref={root} data-mode={mode}
      data-interactive={interactive || undefined}
      onPointerDown={interactive ? (event) => {
        drag.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } : undefined}
      onPointerMove={interactive ? (event) => {
        const box = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: (event.clientX - box.left) / box.width * 2 - 1, y: (event.clientY - box.top) / box.height * 2 - 1, active: true };
        if (drag.current) {
          camera.current.yaw += (event.clientX - drag.current.x) * 0.0015;
          camera.current.pitch = Math.max(-1.2, Math.min(1.2, camera.current.pitch + (event.clientY - drag.current.y) * 0.0015));
          drag.current = { x: event.clientX, y: event.clientY };
          if (!motion || paused) paint.current(0);
          return;
        }
        if (!motion || paused) paint.current(0);
      } : undefined}
      onPointerUp={interactive ? () => { drag.current = null; } : undefined}
      onPointerCancel={interactive ? () => { drag.current = null; } : undefined}
      onPointerLeave={interactive ? () => { if (!drag.current) { pointer.current.active = false; if (!motion || paused) paint.current(0); } } : undefined}
    >
      <canvas ref={canvas} aria-hidden="true" />
      {p.children}
    </div>
  );
}
`;export{e as default};
