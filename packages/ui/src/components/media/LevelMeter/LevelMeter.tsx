import { tr, useTr } from "../../../core/i18n";
import { useSvgId } from "../../../core/artwork";
import { useEffect, useRef } from "react";
import { clamp, mark } from "../../../core/base";
import { subscribeTick } from "../../../core/motion-engine.js";
import { type LevelMeterProps } from "../shared";

const SAMPLES = 64;
const WIDTH = 256;
const HEIGHT = 24;
const MID = HEIGHT / 2;
const STEP = WIDTH / (SAMPLES - 1);
/** A new sample enters every 28 ms; between samples the wave slides sub-pixel. */
const SAMPLE_MS = 28;

/** Mirrored outline of the samples around the midline; quiet parts keep a thin line. */
const wavePath = (samples: readonly number[]) => {
  const point = (i: number, level: number, side: 1 | -1) =>
    `${(i * STEP).toFixed(2)} ${(MID + side * (1 + level ** 0.68 * (MID - 3))).toFixed(2)}`;
  const upper = samples.map((level, i) => point(i, level, -1));
  const lower = samples.map((level, i) => point(i, level, 1)).reverse();
  return `M${upper.join("L")}L${lower.join("L")}Z`;
};

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

  useEffect(() => {
    target.current = active ? level : 0;
    if (active && level > 0) wake.current();
  }, [active, level]);

  useEffect(() => {
    const shape = path.current;
    if (!shape) return;
    const samples = Array.from({ length: SAMPLES + 1 }, () => 0);
    shape.setAttribute("d", wavePath(samples));
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

    let envelope = 0;
    let carry = 0;
    let last = performance.now();
    let stop: (() => void) | undefined;
    // Drawn on the shared motion clock, in step with every other animation.
    const draw = (now: number) => {
      carry += Math.min(250, now - last);
      last = now;
      const input = analyser ? loudness(analyser, buffer) : target.current;
      while (carry >= SAMPLE_MS) {
        carry -= SAMPLE_MS;
        // Fast attack, slow release, like a real meter's ballistics.
        envelope += (input - envelope) * (input > envelope ? 0.3 : 0.11);
        if (envelope < 0.001) envelope = 0;
        samples.shift();
        samples.push(envelope);
        shape.setAttribute("d", wavePath(samples));
      }
      if (!analyser && envelope === 0 && samples.every((sample) => sample === 0)) {
        shape.setAttribute("transform", "translate(0 0)");
        stop?.();
        stop = undefined;
        return;
      }
      shape.setAttribute(
        "transform",
        `translate(${(-(carry / SAMPLE_MS) * STEP).toFixed(3)} 0)`,
      );
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
      source?.disconnect();
      void context?.close();
    };
  }, [active, stream]);

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
    </div>
  );
}
