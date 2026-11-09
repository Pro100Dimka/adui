import { useTr } from "../../../core/i18n";
import { useSvgId } from "../../../core/artwork";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { clamp, mark } from "../../../core/base";
import { subscribeTick } from "../../../core/motion-engine.js";
import { createResizeObserver } from "../../../core/environment";
import { type LevelMeterProps } from "../shared";

const SAMPLES = 64;
const WIDTH = 256;
const HEIGHT = 24;
const MID = HEIGHT / 2;
const STEP = WIDTH / (SAMPLES - 1);
const X = Array.from({ length: SAMPLES + 1 }, (_, i) => (i * STEP).toFixed(2));
/** A new sample enters every 28 ms; between samples the wave slides sub-pixel. */
const SAMPLE_MS = 28;

const waveSample = (level: number) => {
  const height = 1 + level ** 0.68 * (MID - 3);
  return { level, upper: (MID - height).toFixed(2), lower: (MID + height).toFixed(2) };
};

/** Mirrored outline of the samples around the midline; quiet parts keep a thin line. */
const wavePath = (samples: readonly ReturnType<typeof waveSample>[]) => {
  const upper = samples.map((sample, i) => `${X[i]} ${sample.upper}`);
  const lower = samples.map((sample, i) => `${X[i]} ${sample.lower}`).reverse();
  return `M${upper.join("L")}L${lower.join("L")}Z`;
};

type WaveStyle = {
  width: number; height: number; stroke: string; lineWidth: number; lineAlpha: number;
  fillAlpha: number; fill: string; stops: { at: number; color: string }[];
};
type WaveFrame = { id: number; revision: number; d?: string; offset: number; style?: WaveStyle; canvas?: OffscreenCanvas };

function renderMeters() {
  const scenes = new Map<number, { canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D; style: WaveStyle; fill: string | CanvasGradient; path: Path2D; revision: number }>();
  onmessage = ({ data }: MessageEvent<{ frames?: WaveFrame[]; remove?: number }>) => {
    if (data.remove !== undefined) { scenes.delete(data.remove); return; }
    const completed: { id: number; revision: number }[] = [], failed: number[] = [];
    for (const frame of data.frames ?? []) {
      try {
        let scene = scenes.get(frame.id);
        if (frame.canvas) {
          const ctx = frame.canvas.getContext("2d");
          if (!ctx || !frame.style) throw new Error("Canvas unavailable");
          scene = { canvas: frame.canvas, ctx, style: frame.style, fill: "", path: new Path2D(), revision: frame.revision };
          scenes.set(frame.id, scene);
          frame.canvas.addEventListener("contextlost", () => { scenes.delete(frame.id); postMessage({ failed: [frame.id] }); });
        }
        if (!scene) continue;
        const { canvas, ctx } = scene;
        if (frame.style) {
          scene.style = frame.style; scene.revision = frame.revision;
          canvas.width = frame.style.width; canvas.height = frame.style.height;
          scene.fill = frame.style.fill;
          if (frame.style.stops.length) {
            const gradient = ctx.createLinearGradient(0, 0, 260.06, 0);
            for (const stop of frame.style.stops) gradient.addColorStop(stop.at, stop.color);
            scene.fill = gradient;
          }
        }
        if (frame.d !== undefined) scene.path = new Path2D(frame.d);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(canvas.width / 256, canvas.height / 24);
        ctx.globalAlpha = scene.style.lineAlpha; ctx.strokeStyle = scene.style.stroke; ctx.lineWidth = scene.style.lineWidth;
        ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(256, 12); ctx.stroke();
        ctx.translate(frame.offset, 0);
        ctx.globalAlpha = scene.style.fillAlpha; ctx.fillStyle = scene.fill; ctx.fill(scene.path);
        completed.push({ id: frame.id, revision: scene.revision });
      } catch { scenes.delete(frame.id); failed.push(frame.id); }
    }
    postMessage({ ack: true, completed, failed });
  };
}

let meterWorker: Worker | undefined, meterUrl: string | undefined, meterSerial = 0, meterBusy = false, meterQueued = false;
const meterClients = new Map<number, { ready: (revision: number) => void; dispose: () => void }>();
const meterFrames = new Map<number, WaveFrame>();
function stopMeters() {
  meterWorker?.terminate();
  if (meterUrl) URL.revokeObjectURL(meterUrl);
  meterWorker = undefined; meterUrl = undefined; meterBusy = false;
  meterFrames.clear();
}
function failMeters() { for (const client of [...meterClients.values()]) client.dispose(); stopMeters(); }
function sendMeter(frame?: WaveFrame) {
  if (frame) {
    const pending = meterFrames.get(frame.id);
    if (pending) Object.assign(pending, frame);
    else meterFrames.set(frame.id, frame);
  }
  if (meterQueued || meterBusy || !meterWorker || !meterFrames.size) return;
  meterQueued = true;
  queueMicrotask(() => {
    meterQueued = false;
    if (!meterWorker || meterBusy || !meterFrames.size) return;
    const frames = [...meterFrames.values()]; meterFrames.clear(); meterBusy = true;
    try { meterWorker.postMessage({ frames }, frames.flatMap(frame => frame.canvas ? [frame.canvas] : [])); }
    catch { failMeters(); }
  });
}
function startMeters() {
  if (meterWorker) return meterWorker;
  try {
    meterUrl = URL.createObjectURL(new Blob([`(${renderMeters.toString()})()`], { type: "text/javascript" }));
    const worker = new Worker(meterUrl);
    meterWorker = worker;
    worker.onerror = () => { if (meterWorker === worker) failMeters(); };
    worker.onmessage = ({ data }) => {
      if (meterWorker !== worker) return;
      if (data.ack) meterBusy = false;
      for (const id of data.failed ?? []) meterClients.get(id)?.dispose();
      for (const item of data.completed ?? []) meterClients.get(item.id)?.ready(item.revision);
      sendMeter();
    };
    return worker;
  } catch { stopMeters(); return undefined; }
}

/** Keep SVG styling as the source of truth; unsupported styling retains the native path. */
function waveCanvas(shape: SVGPathElement, initial: string) {
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined" || typeof Path2D === "undefined" || typeof MutationObserver === "undefined" || typeof HTMLCanvasElement === "undefined" || !HTMLCanvasElement.prototype.transferControlToOffscreen) return null;
  const svg = shape.ownerSVGElement, root = svg?.parentElement;
  const axis = svg?.querySelector("line");
  if (!svg || !root || !axis) return null;
  const canvas = document.createElement("canvas");
  const worker = startMeters();
  if (!worker) return null;
  const id = ++meterSerial;
  canvas.className = "ad-level-meter-canvas";
  canvas.setAttribute("aria-hidden", "true");
  root.append(canvas);
  const ancestors: Element[] = [];
  for (let node: Element | null = root; node; node = node.parentElement) ancestors.push(node);
  let disposed = false, enabled = false, queued = false, ready = false, transferred = false, revision = 0;
  let current = initial, offset = 0, sent = "";
  const native = () => {
    root.removeAttribute("data-ad-canvas");
    canvas.hidden = true;
    shape.setAttribute("d", current);
    shape.setAttribute("transform", `translate(${offset} 0)`);
  };
  const draw = (d: string, shift: number) => {
    current = d; offset = shift;
    if (!enabled || disposed) return false;
    sendMeter({ id, revision, offset, ...(sent !== d ? { d } : {}) });
    sent = d;
    return ready;
  };
  function update() {
    if (disposed) return;
    const surface = getComputedStyle(svg!), wave = getComputedStyle(shape), line = getComputedStyle(axis!);
    const host = getComputedStyle(root!);
    const gradient = svg!.querySelector("linearGradient");
    const width = parseFloat(surface.width), height = parseFloat(surface.height);
    const unsupported = [surface.transform, surface.backgroundImage, wave.stroke, wave.filter, wave.clipPath, wave.maskImage, line.strokeDasharray].some(value => value !== "none")
      || line.strokeLinecap !== "butt"
      || (wave.fill.startsWith("url(") && (!gradient || wave.fill.match(/#([^"')]+)["']?\)$/)?.[1] !== gradient.id || ["gradientUnits", "gradientTransform", "x1", "x2", "y1", "y2"].some(name => gradient.hasAttribute(name))))
      || [surface, host].some(style => ["Top", "Right", "Bottom", "Left"].some(side => parseFloat(style.getPropertyValue(`padding-${side.toLowerCase()}`)) > 0 || parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0))
      || [svg!, ...ancestors].some(node => node.getAnimations?.({ subtree: node === svg }).some(animation => animation.playState === "running"));
    enabled = width > 0 && height > 0 && !unsupported;
    if (!enabled) { native(); return; }
    const ratio = devicePixelRatio || 1;
    canvas.style.filter = surface.filter; canvas.style.opacity = surface.opacity;
    canvas.style.backgroundColor = surface.backgroundColor;
    const stops = wave.fill.startsWith("url(") ? [...svg!.querySelectorAll("stop")].map(stop => {
      const style = getComputedStyle(stop);
      return { at: stop.offset.baseVal, color: `color-mix(in srgb, ${style.stopColor} ${Number(style.stopOpacity) * 100}%, transparent)` };
    }) : [];
    try {
      const surface = transferred ? undefined : canvas.transferControlToOffscreen();
      transferred = true; ready = false; revision++;
      native(); sent = current;
      sendMeter({ id, revision, d: current, offset, ...(surface ? { canvas: surface } : {}), style: {
        width: Math.ceil(width * ratio), height: Math.ceil(height * ratio), stroke: line.stroke, lineWidth: parseFloat(line.strokeWidth),
        lineAlpha: Number(line.opacity) * Number(line.strokeOpacity), fillAlpha: Number(wave.opacity) * Number(wave.fillOpacity), fill: wave.fill, stops,
      } });
    } catch { dispose(); }
  }
  function queue() {
    if (queued || disposed) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (!disposed) update(); });
  }
  const resized = createResizeObserver(queue);
  resized.observe(svg);
  const styles = new MutationObserver(queue);
  for (const node of ancestors) styles.observe(node, { attributes: true, attributeFilter: ["style", "class", "data-ad-theme", "data-ad-color-scheme"] });
  styles.observe(svg, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class", "fill", "stroke", "stop-color", "stop-opacity", "offset"] });
  styles.observe(document.head, { subtree: true, childList: true, characterData: true });
  const transition = (event: Event) => { if (event.target instanceof Element && (event.target.contains(svg) || svg.contains(event.target))) queue(); };
  const events = ["transitionrun", "transitionend", "transitioncancel", "animationstart", "animationend", "animationcancel"];
  for (const event of events) document.addEventListener(event, transition);
  window.addEventListener("resize", queue);
  canvas.addEventListener("contextlost", dispose);
  function dispose() {
    if (disposed) return;
    disposed = true; enabled = false;
    resized.disconnect(); styles.disconnect();
    window.removeEventListener("resize", queue);
    canvas.removeEventListener("contextlost", dispose);
    for (const event of events) document.removeEventListener(event, transition);
    meterFrames.delete(id); meterClients.delete(id);
    if (meterWorker === worker) worker?.postMessage({ remove: id });
    if (!meterClients.size) stopMeters();
    native(); canvas.remove();
  }
  meterClients.set(id, { dispose, ready(next) {
    if (disposed || !enabled || next !== revision || ready) return;
    ready = true; canvas.hidden = false; root!.setAttribute("data-ad-canvas", "");
  } });
  update();
  return { draw, dispose };
}

/** Root-mean-square loudness of an analyser's current window, scaled to 0..1. */
const loudness = (
  analyser: AnalyserNode,
  buffer: Float32Array<ArrayBuffer>,
) => {
  analyser.getFloatTimeDomainData(buffer);
  let sum = 0;
  for (const sample of buffer) sum += sample * sample;
  return Math.min(1, Math.sqrt(sum / buffer.length) * 4);
};

/**
 * Live input level as a scrolling mirrored wave. Feed it a changing `value` (0–100) or hand
 * it a `stream` (e.g. from getUserMedia) and it listens by itself. The wave is redrawn
 * outside React on every display refresh, so it never re-renders at the animation rate.
 */
export function LevelMeter({
  value = 0,
  stream,
  active = true,
  compact = false,
  label,
  ...p
}: LevelMeterProps) {
  const tr = useTr();
  const id = useSvgId();
  const path = useRef<SVGPathElement>(null);
  const target = useRef(0);
  const wake = useRef<() => void>(() => undefined);
  const level = clamp(value) / 100;

  useLayoutEffect(() => {
    target.current = active ? level : 0;
    if (active && level > 0) wake.current();
  }, [active, level]);

  useEffect(() => {
    const shape = path.current;
    if (!shape) return;
    const samples = Array.from({ length: SAMPLES + 1 }, () => waveSample(0));
    let drawnPath = wavePath(samples);
    shape.setAttribute("d", drawnPath);
    wake.current = () => undefined;
    if (!active) return;

    let context: AudioContext | undefined;
    let analyser: AnalyserNode | undefined;
    let source: MediaStreamAudioSourceNode | undefined;
    if (stream) {
      context = new AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      source = context.createMediaStreamSource(stream);
      source.connect(analyser);
    }
    const buffer = new Float32Array(analyser?.fftSize ?? 0);
    const painter = waveCanvas(shape, drawnPath);
    let nativePath = drawnPath;

    let envelope = 0;
    let carry = 0;
    let last = performance.now();
    let stop: (() => void) | undefined;
    // Drawn on the shared motion clock, in step with every other animation.
    const draw = (now: number) => {
      carry += Math.min(250, now - last);
      last = now;
      const input = analyser ? loudness(analyser, buffer) : target.current;
      const sampled = carry >= SAMPLE_MS;
      while (carry >= SAMPLE_MS) {
        carry -= SAMPLE_MS;
        // Fast attack, slow release, like a real meter's ballistics.
        envelope += (input - envelope) * (input > envelope ? 0.3 : 0.11);
        if (envelope < 0.001) envelope = 0;
        samples.shift();
        samples.push(waveSample(envelope));
      }
      // Retain every sample, but only paint the final, changed contour for this frame.
      if (sampled) {
        const nextPath = wavePath(samples);
        drawnPath = nextPath;
      }
      const quiet = !analyser && input === 0 && envelope === 0 && samples.every((sample) => sample.level === 0);
      const shift = quiet ? 0 : Number((-(carry / SAMPLE_MS) * STEP).toFixed(3));
      if (!painter?.draw(drawnPath, shift)) {
        if (nativePath !== drawnPath) { shape.setAttribute("d", drawnPath); nativePath = drawnPath; }
        shape.setAttribute("transform", `translate(${shift} 0)`);
      }
      if (quiet) {
        stop?.();
        stop = undefined;
        return;
      }
    };
    wake.current = () => {
      if (stop) return;
      carry = 0;
      last = performance.now();
      stop = subscribeTick(draw);
    };
    if (analyser || target.current > 0) wake.current();
    return () => {
      wake.current = () => undefined;
      stop?.();
      painter?.dispose();
      source?.disconnect();
      void context?.close();
    };
  }, [active, stream]);

  const waveform = useMemo(() => (
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-wave`}>
            <stop stopColor="var(--ad-primary-700)" />
            <stop offset="0.52" stopColor="var(--ad-red)" />
            <stop offset="1" stopColor="var(--ad-secondary-100)" />
          </linearGradient>
        </defs>
        <line className="ad-level-meter-axis" x2={WIDTH} y1={MID} y2={MID} />
        <path
          ref={path}
          className="ad-level-meter-wave"
          fill={`url(#${id}-wave)`}
        />
      </svg>
  ), [id]);

  return (
    <div
      {...mark("LevelMeter", p)}
      role="meter"
      aria-label={label ?? tr("Уровень сигнала")}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={stream ? undefined : Math.round(active ? level * 100 : 0)}
      data-active={active}
      data-compact={compact || undefined}
    >
      {waveform}
    </div>
  );
}
