import { tr, useTr } from "../../../core/i18n";
import {
  canPaint,
  createResizeObserver,
  reducedMotionQuery,
} from "../../../core/environment";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clamp, mark, normalizeSize } from "../../../core/base";
import { type RotaryKnobProps, type RotaryKnobController } from "../shared";

export const RotaryKnob = (p: RotaryKnobProps) => {
  const tr = useTr();
  const rootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const feedbackRef = useRef<HTMLCanvasElement>(null);
  const rotorRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<RotaryKnobController | null>(null);
  const onChangeRef = useRef(p.onValueChange);
  const onCommitRef = useRef(p.onValueCommit);
  const disabledRef = useRef(!!p.disabled);
  const readOnlyRef = useRef(!!p.readOnly);
  const numberFormat = useMemo(
    () => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }),
    [],
  );
  // The knob turns through positions 0–100; values in [min, max] map onto them at the edges.
  const min = p.min ?? 0;
  const span = (p.max ?? 100) - min || 1;
  const toPosition = (value: number) => clamp(((value - min) / span) * 100);
  const toValue = (position: number) =>
    Math.round((min + (position / 100) * span) * 1e6) / 1e6;
  const displayScale = p.displayScale ?? 1;
  const format = (value: number) =>
    `${numberFormat.format(value * displayScale)}${p.suffix ?? "%"}`;
  const scale = useRef({ toValue, format });
  scale.current = { toValue, format };
  const stepRef = useRef(1);
  const fineStepRef = useRef(0.1);
  onChangeRef.current = p.onValueChange;
  onCommitRef.current = p.onValueCommit;
  disabledRef.current = !!p.disabled;
  readOnlyRef.current = !!p.readOnly;
  stepRef.current = Math.max(0.001, ((p.step ?? span / 100) / span) * 100);
  fineStepRef.current = Math.max(0.001, ((p.fineStep ?? span / 1000) / span) * 100);

  const initial = toPosition(p.defaultValue ?? p.value ?? min + span * 0.67);
  const initialRef = useRef(initial);
  const resetRef = useRef<number | undefined>(undefined);
  resetRef.current = p.resetValue === undefined ? undefined : toPosition(p.resetValue);
  const diameter =
    p.diameter ??
    { xs: 84, sm: 124, md: 220, lg: 320 }[normalizeSize(p.size) ?? "md"];

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const canvas = baseRef.current!;
    const rotor = rotorRef.current!;
    const feedback = feedbackRef.current!;
    const readout = readoutRef.current!;
    const control = controlRef.current!;
    if (!root || !canvas || !rotor || !feedback || !readout || !control) return;

    // Without a 2D canvas (tests, server rendering) only the painting is skipped; the value,
    // keys, wheel and typed input keep working.
    const paintable = canPaint();
    const rotorCtx = (paintable ? rotor.getContext("2d") : null)!;
    const feedbackCtx = (paintable ? feedback.getContext("2d") : null)!;
    const ctx = (paintable ? canvas.getContext("2d", { alpha: true }) : null)!;
    const painted = Boolean(rotorCtx && feedbackCtx && ctx);

    const TAU = Math.PI * 2;
    const localClamp = (value: number, min = 0, max = 1) =>
      Math.max(min, Math.min(max, value));
    const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
    const fract = (value: number) => value - Math.floor(value);
    const noise = (value: number) =>
      fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);
    const defaultValue = localClamp(Number(initialRef.current) || 0, 0, 100);
    const startAngle = -135;
    const sweepAngle = 270;
    const valueAngle = (value: number) =>
      startAngle + (value * sweepAngle) / 100;
    const initialAngle = valueAngle(defaultValue);
    const degrees = 180 / Math.PI;
    const reducedMotion = reducedMotionQuery();
    const listeners = new AbortController();
    let value = defaultValue;
    let visualValue = value;
    let drag: null | {
      id: number;
      x: number;
      y: number;
      center: { x: number; y: number; radius: number };
      angle: number | null;
      mode: "circular" | "linear";
      value: number;
      start: number;
      /** Set by a click on the scale: the knob glides to the spot instead of snapping. */
      glide: boolean;
      distance: number;
    } = null;
    let renderTimer = 0;
    let animationFrame = 0;
    let previousFrame = 0;
    let disposed = false;

    function render() {
      if (disposed || !painted) return;
      const cssSize = root.getBoundingClientRect().width;
      const size = Math.round(
        Math.min(
          1800,
          cssSize * Math.max(2, Math.min(devicePixelRatio || 1, 2.5)),
        ),
      );
      if (!size || (canvas.width === size && canvas.height === size)) return;
      canvas.width = canvas.height = size;
      const center = size / 2;
      const radius = size * 0.445;
      const pixels = ctx.createImageData(size, size);
      const data = pixels.data;
      const brush = new Float32Array(Math.ceil(radius * 5) + 8);
      for (let i = 0; i < brush.length; i++) brush[i] = noise(i + 17) - 0.5;

      for (let y = 0; y < size; y++) {
        const yy = (y + 0.5 - center) / radius;
        for (let x = 0; x < size; x++) {
          const xx = (x + 0.5 - center) / radius;
          const r = Math.hypot(xx, yy);
          if (r > 1.055) continue;
          const index = (y * size + x) * 4;
          if (r > 1) {
            const a = Math.exp(-(r - 1) * 135) * 0.09;
            data[index] = 130;
            data[index + 1] = 0;
            data[index + 2] = 9;
            data[index + 3] = a * 255;
            continue;
          }

          const angle = Math.atan2(yy, xx);
          const ringPosition = r * radius * 1.8;
          const bi = Math.floor(ringPosition);
          const grain = mix(
            brush[bi] ?? 0,
            brush[bi + 1] ?? 0,
            ringPosition - bi,
          );
          const grain2 = Math.sin(
            r * radius * 4.8 + Math.sin(angle * 17) * 0.3,
          );
          const directional = Math.pow(Math.abs(Math.cos(angle + 0.77)), 16);
          const broad = Math.pow(Math.abs(Math.cos(angle - 0.86)), 5);
          const edgeLight = 0.5 + 0.5 * Math.cos(angle + 2.15);
          const grainAmount = grain * 9.5 + grain2 * 2.2;
          let red = 0,
            green = 0,
            blue = 0,
            v = 0;

          if (r < 0.704) {
            const radialLight = 0.7 + 0.3 * Math.sqrt(r / 0.704);
            const satin =
              84 * Math.max(0, Math.cos(angle - 1.01)) ** 28 +
              76 * Math.max(0, Math.cos(angle - 2.23)) ** 27 +
              116 * Math.max(0, Math.cos(angle - 4.07)) ** 29 +
              108 * Math.max(0, Math.cos(angle - 5.31)) ** 30;
            v = 7 + radialLight * satin + 11 * Math.abs(Math.cos(angle)) ** 14;
            v += grainAmount * (0.48 + v / 55);
            v += 9 * Math.exp(-r * 90);
            v *= 1 - 0.35 * Math.exp(-Math.pow((r - 0.699) / 0.009, 2));
            red = v;
            green = v * 0.995;
            blue = v * 1.025;
          } else if (r < 0.709) {
            v = 8 + 17 * edgeLight;
            red = v;
            green = v;
            blue = v;
          } else if (r < 0.715) {
            v = 85 + 133 * edgeLight + 25 * directional;
            red = v;
            green = v * 0.96;
            blue = v * 0.93;
          } else if (r < 0.729) {
            const t = (r - 0.715) / 0.014;
            v =
              (21 + 111 * directional + 55 * broad) * (1 - t * 0.55) +
              grainAmount;
            red = v + 5;
            green = v;
            blue = v * 0.98;
          } else if (r < 0.735) {
            v = 100 + 106 * edgeLight;
            red = v;
            green = v * 0.96;
            blue = v * 0.94;
          } else if (r < 0.743) {
            v = 5 + 11 * edgeLight;
            red = v + 10;
            green = v;
            blue = v;
          } else if (r < 0.814) {
            v = 9 + 8 * edgeLight + grainAmount;
            red = v + 8;
            green = v;
            blue = v;
          } else if (r < 0.819) {
            v = 72 + 115 * directional + 49 * edgeLight;
            red = v;
            green = v * 0.87;
            blue = v * 0.85;
          } else if (r < 0.872) {
            const t = (r - 0.819) / 0.053;
            const arc = Math.exp(-Math.pow((t - 0.39) / 0.16, 2));
            const thin = Math.exp(-Math.pow((t - 0.39) / 0.025, 2));
            const outerRim = Math.exp(-Math.pow((t - 0.94) / 0.035, 2));
            const bright = 0.4 + 0.6 * Math.pow(Math.abs(Math.sin(angle)), 12);
            const side = Math.pow(Math.abs(Math.cos(angle)), 34) * 0.65;
            const reflection = localClamp(bright + side);
            red = 29 + arc * 197 * reflection + thin * 83 + outerRim * 148;
            green =
              1 + arc * 11 * reflection + thin * 95 * reflection + outerRim * 2;
            blue =
              4 + arc * 13 * reflection + thin * 94 * reflection + outerRim * 6;
          } else if (r < 0.882) {
            v = 2 + 8 * edgeLight;
            red = v + 8;
            green = v;
            blue = v;
          } else if (r < 0.988) {
            v = 12 + 22 * directional + 11 * broad + grainAmount * 0.7;
            const innerEdge = Math.exp(-Math.pow((r - 0.885) / 0.003, 2));
            red = v + 9 * innerEdge;
            green = v;
            blue = v * 1.035;
          } else if (r < 0.9965) {
            v = 12 + 24 * edgeLight + 22 * directional;
            red = v;
            green = v;
            blue = v;
          } else {
            const t = (r - 0.9965) / 0.0035;
            v = (50 + 140 * edgeLight) * (1 - t);
            red = v;
            green = v;
            blue = v;
          }

          data[index] = localClamp(red, 0, 255);
          data[index + 1] = localClamp(green, 0, 255);
          data[index + 2] = localClamp(blue, 0, 255);
          data[index + 3] = 255;
        }
      }
      ctx.putImageData(pixels, 0, 0);
      ctx.save();
      ctx.translate(center, center);
      ctx.scale(radius, radius);
      drawKnurl();
      drawReflections();
      drawTicks();
      ctx.restore();

      rotor.width = rotor.height = size;
      feedback.width = feedback.height = size;
      rotorCtx.save();
      rotorCtx.beginPath();
      rotorCtx.arc(center, center, radius * 0.819, 0, TAU);
      rotorCtx.clip();
      rotorCtx.drawImage(canvas, 0, 0);
      rotorCtx.restore();
      paintFeedback();
    }

    function drawKnurl() {
      const columns = 184;
      const rows = 6;
      const start = 0.744;
      const end = 0.813;
      const step = (end - start) / rows;
      const pitch = TAU / columns;
      const point = (radius: number, angle: number): [number, number] => [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      ];
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, end, 0, TAU);
      ctx.arc(0, 0, start, TAU, 0, true);
      ctx.clip("evenodd");
      for (let row = -1; row <= rows; row++) {
        const r = start + (row + 0.5) * step;
        for (let column = 0; column < columns; column++) {
          const a = (column + (row % 2 ? 0.5 : 0)) * pitch;
          const middle = point(r, a);
          const vertices = [
            point(r - step * 0.94, a),
            point(r, a + pitch * 0.47),
            point(r + step * 0.94, a),
            point(r, a - pitch * 0.47),
          ];
          const globalLight = 0.52 + 0.48 * Math.cos(a + 1.9);
          const variation = 0.88 + noise(column * 19 + row * 317) * 0.2;
          for (let side = 0; side < 4; side++) {
            const p1 = vertices[side];
            const p2 = vertices[(side + 1) % 4];
            const direction = a + [-2.36, -0.78, 0.78, 2.36][side];
            const light = Math.max(0, Math.cos(direction + 2.15));
            const metal = (6 + light ** 5 * 228 + globalLight * 10) * variation;
            const ruby = Math.pow(Math.max(0, Math.sin(a)), 3) * 27;
            ctx.fillStyle = `rgb(${metal + ruby},${metal * 0.96},${metal * 0.93})`;
            ctx.beginPath();
            ctx.moveTo(...middle);
            ctx.lineTo(...p1);
            ctx.lineTo(...p2);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    function drawReflections() {
      const r = 0.8395;
      const glow = ctx.createRadialGradient(0, 0, 0.809, 0, 0, 0.896);
      glow.addColorStop(0, "#ff001800");
      glow.addColorStop(0.3, "#f8002020");
      glow.addColorStop(0.47, "#ff123f55");
      glow.addColorStop(0.7, "#d900141d");
      glow.addColorStop(1, "#ff001800");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 0.896, 0, TAU);
      ctx.arc(0, 0, 0.809, TAU, 0, true);
      ctx.fill("evenodd");
      for (const angle of [-Math.PI / 2, Math.PI / 2, Math.PI, 0]) {
        const pointX = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        const halo = ctx.createRadialGradient(pointX, py, 0, pointX, py, 0.055);
        halo.addColorStop(0, "#fff1f1b8");
        halo.addColorStop(0.2, "#ff315b72");
        halo.addColorStop(1, "#ff001800");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pointX, py, 0.055, 0, TAU);
        ctx.fill();
      }
    }

    function roundRect(
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fill();
    }

    function drawTicks() {
      const scale = canvas.width * 0.445;
      for (let i = 0; i < 16; i++) {
        const major = i % 4 === 0;
        const width = major ? 0.012 : 0.01;
        const length = major ? 0.078 : 0.066;
        ctx.save();
        ctx.rotate((i * TAU) / 16);
        ctx.fillStyle = "#020101";
        roundRect(
          -width / 2 - 0.004,
          -0.933 - length / 2 - 0.004,
          width + 0.008,
          length + 0.008,
          0.006,
        );
        ctx.strokeStyle = "#71312c";
        ctx.lineWidth = 0.0017;
        ctx.stroke();
        ctx.shadowColor = major ? "#ff1029" : "#e9152470";
        ctx.shadowBlur = scale * (major ? 0.034 : 0.01);
        ctx.fillStyle = major ? "#ff2447" : "#ff6c7d";
        roundRect(-width / 2, -0.933 - length / 2, width, length, 0.003);
        ctx.shadowBlur = 0;
        const fill = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
        fill.addColorStop(0, "#ff2539");
        fill.addColorStop(0.38, major ? "#fff8eb" : "#ffa19c");
        fill.addColorStop(0.7, major ? "#fff6e9" : "#ff938d");
        fill.addColorStop(1, "#f82538");
        ctx.fillStyle = fill;
        roundRect(
          -width * 0.34,
          -0.933 - length * 0.47,
          width * 0.68,
          length * 0.94,
          0.002,
        );
        ctx.restore();
      }
    }

    function paintFeedback() {
      if (!painted || !feedback.width || disposed) return;
      const scale = feedback.width * 0.445;
      const start = (startAngle - 90) / degrees;
      const end = (valueAngle(visualValue) - 90) / degrees;
      feedbackCtx.clearRect(0, 0, feedback.width, feedback.height);
      feedbackCtx.save();
      feedbackCtx.translate(feedback.width / 2, feedback.height / 2);
      feedbackCtx.scale(scale, scale);
      feedbackCtx.beginPath();
      feedbackCtx.arc(0, 0, 0.846, end, start + TAU);
      feedbackCtx.strokeStyle = "rgba(0, 0, 0, 0.78)";
      feedbackCtx.lineWidth = 0.052;
      feedbackCtx.stroke();
      if (visualValue > 0) paintValue(start, end, scale);
      feedbackCtx.restore();
    }

    /**
     * The value as a neon tube: deep ruby at the start heating up to white at the end,
     * a comet head of light on its tip, and every scale tick it has passed lit up.
     */
    function paintValue(start: number, end: number, scale: number) {
      const sweep = Math.max(0.0001, (end - start) / TAU);
      const tube = feedbackCtx.createConicGradient(start, 0, 0);
      tube.addColorStop(0, "rgba(110, 0, 22, 0.9)");
      tube.addColorStop(sweep * 0.65, "rgba(255, 36, 72, 1)");
      tube.addColorStop(sweep, "rgba(255, 238, 242, 1)");
      tube.addColorStop(Math.min(1, sweep + 0.0001), "rgba(255, 238, 242, 0)");
      const stroke = (width: number, alpha: number, blur: number) => {
        feedbackCtx.beginPath();
        feedbackCtx.arc(0, 0, 0.8395, start, end);
        feedbackCtx.lineCap = "round";
        feedbackCtx.lineWidth = width;
        feedbackCtx.globalAlpha = alpha;
        feedbackCtx.shadowColor = "#ff163d";
        feedbackCtx.shadowBlur = scale * blur;
        feedbackCtx.strokeStyle = tube;
        feedbackCtx.stroke();
      };
      stroke(0.05, 0.35, 0.06);
      stroke(0.017, 0.95, 0.03);
      stroke(0.006, 1, 0.012);
      feedbackCtx.globalAlpha = 1;
      feedbackCtx.shadowBlur = 0;

      const tipX = Math.cos(end) * 0.8395;
      const tipY = Math.sin(end) * 0.8395;
      const head = feedbackCtx.createRadialGradient(
        tipX,
        tipY,
        0,
        tipX,
        tipY,
        0.12,
      );
      head.addColorStop(0, "rgba(255, 255, 255, 1)");
      head.addColorStop(0.12, "rgba(255, 220, 228, 0.9)");
      head.addColorStop(0.35, "rgba(255, 60, 100, 0.45)");
      head.addColorStop(1, "rgba(255, 0, 40, 0)");
      feedbackCtx.fillStyle = head;
      feedbackCtx.beginPath();
      feedbackCtx.arc(tipX, tipY, 0.12, 0, TAU);
      feedbackCtx.fill();

      const reached = valueAngle(visualValue);
      for (let i = 0; i < 16; i += 1) {
        const angle = normalizeAngle(i * 22.5);
        if (angle < startAngle || angle > -startAngle) continue;
        const x = Math.sin(angle / degrees) * 0.933;
        const y = -Math.cos(angle / degrees) * 0.933;
        // Ticks still ahead of the value are dimmed, so the passed ones read as lit.
        if (angle > reached - 0.5) {
          const shade = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.05);
          shade.addColorStop(0, "rgba(8, 3, 4, 0.72)");
          shade.addColorStop(0.55, "rgba(8, 3, 4, 0.55)");
          shade.addColorStop(1, "rgba(8, 3, 4, 0)");
          feedbackCtx.fillStyle = shade;
          feedbackCtx.beginPath();
          feedbackCtx.arc(x, y, 0.05, 0, TAU);
          feedbackCtx.fill();
          continue;
        }
        const heat = 0.5 + 0.5 * Math.exp(-(reached - angle) / 28);
        const glow = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.075);
        glow.addColorStop(0, `rgba(255, 255, 255, ${heat})`);
        glow.addColorStop(0.16, `rgba(255, 210, 220, ${0.85 * heat})`);
        glow.addColorStop(0.42, `rgba(255, 40, 76, ${0.55 * heat})`);
        glow.addColorStop(1, "rgba(255, 0, 40, 0)");
        feedbackCtx.fillStyle = glow;
        feedbackCtx.beginPath();
        feedbackCtx.arc(x, y, 0.075, 0, TAU);
        feedbackCtx.fill();
      }
    }

    function paint() {
      root.style.setProperty("--angle", `${valueAngle(visualValue)}deg`);
      root.style.setProperty(
        "--rotation",
        `${valueAngle(visualValue) - initialAngle}deg`,
      );
      paintFeedback();
    }

    function animate(timestamp: number) {
      animationFrame = 0;
      if (disposed) return;
      const elapsed = previousFrame
        ? Math.min(64, timestamp - previousFrame)
        : 16;
      previousFrame = timestamp;
      const immediate = (!!drag && !drag.glide) || reducedMotion.matches;
      visualValue = immediate
        ? value
        : visualValue + (value - visualValue) * (1 - Math.exp(-elapsed / 42));
      if (Math.abs(value - visualValue) < 0.005) visualValue = value;
      paint();
      if (visualValue !== value)
        animationFrame = requestAnimationFrame(animate);
      else previousFrame = 0;
    }

    function schedulePaint() {
      if (!animationFrame && !disposed)
        animationFrame = requestAnimationFrame(animate);
    }

    function setValue(next: number, notify = true) {
      if (disposed) return false;
      const numeric = Number(next);
      if (!Number.isFinite(numeric)) return false;
      const nextValue = Math.round(localClamp(numeric, 0, 100) * 1000) / 1000;
      const changed = nextValue !== value;
      value = nextValue;
      const shown = scale.current.toValue(value);
      const text = scale.current.format(shown);
      root.dataset.value = String(shown);
      control.setAttribute("aria-valuenow", String(shown));
      control.setAttribute("aria-valuetext", text);
      control.title = tr("{label}: {value} · ведите по кругу или тяните за центр", { label: p.label ?? tr("Громкость"), value: text });
      readout.textContent = text;
      schedulePaint();
      if (changed && notify) onChangeRef.current?.(shown);
      return changed;
    }

    function commit() {
      if (!disposed) onCommitRef.current?.(scale.current.toValue(value));
    }

    function geometry() {
      const rect = control.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: rect.width / 2,
      };
    }
    function polar(event: PointerEvent, center: ReturnType<typeof geometry>) {
      return (
        Math.atan2(event.clientY - center.y, event.clientX - center.x) * degrees
      );
    }
    function normalizeAngle(angle: number) {
      return ((((angle + 180) % 360) + 360) % 360) - 180;
    }

    function pointerDown(event: PointerEvent) {
      if (
        disabledRef.current ||
        readOnlyRef.current ||
        event.button !== 0 ||
        !event.isPrimary ||
        drag ||
        disposed
      )
        return;
      const center = geometry();
      const distance =
        Math.hypot(event.clientX - center.x, event.clientY - center.y) /
        center.radius;
      if (distance > 1.04) return;
      event.preventDefault();
      control.focus({ preventScroll: true });
      drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        center,
        angle: polar(event, center),
        mode: distance >= 0.36 ? "circular" : "linear",
        value,
        start: value,
        distance: localClamp(center.radius * 1.2, 160, 420),
        glide: false,
      };
      control.setPointerCapture(event.pointerId);
      root.classList.add("is-dragging");
      tilt(0, 0);
      // A press on the glowing scale ring or the ticks sets the value right there.
      if (distance >= 0.8) {
        drag.glide = true;
        let angle = normalizeAngle((drag.angle ?? 0) + 90);
        if (Math.abs(angle) > 179.99) angle = value >= 50 ? 180 : -180;
        drag.value = localClamp(
          ((angle - startAngle) / sweepAngle) * 100,
          0,
          100,
        );
        setValue(drag.value);
      }
    }

    /** The knob leans a little towards the pointer, like a real object under a light. */
    function tilt(x: number, y: number) {
      root.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
      root.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
    }
    function hover(event: PointerEvent) {
      if (
        drag ||
        disabledRef.current ||
        reducedMotion.matches ||
        document.documentElement.dataset.adMotion === "off"
      )
        return;
      const center = geometry();
      tilt(
        localClamp((event.clientX - center.x) / center.radius, -1, 1),
        localClamp((event.clientY - center.y) / center.radius, -1, 1),
      );
    }

    function pointerMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.id) return;
      drag.glide = false;
      event.preventDefault();
      const precision = event.shiftKey ? 0.1 : 1;
      const angle = polar(event, drag.center);
      const radius = Math.hypot(
        event.clientX - drag.center.x,
        event.clientY - drag.center.y,
      );
      let delta = 0;
      if (drag.mode === "circular") {
        if (radius > drag.center.radius * 0.12 && drag.angle !== null)
          delta = (normalizeAngle(angle - drag.angle) / sweepAngle) * 100;
        drag.angle = radius > drag.center.radius * 0.12 ? angle : null;
      } else {
        delta =
          ((event.clientX - drag.x - (event.clientY - drag.y)) /
            drag.distance) *
          100;
      }
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.value = localClamp(drag.value + delta * precision, 0, 100);
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;
      setValue(Math.round(drag.value / step) * step);
    }

    function finishDrag(cancelled = false) {
      if (!drag) return;
      const gesture = drag;
      drag = null;
      root.classList.remove("is-dragging");
      if (control.hasPointerCapture(gesture.id))
        control.releasePointerCapture(gesture.id);
      if (cancelled) setValue(gesture.start);
      else if (value !== gesture.start) commit();
    }

    function pointerEnd(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.id) return;
      finishDrag(event.type === "pointercancel");
    }

    function keyDown(event: KeyboardEvent) {
      if (disabledRef.current || readOnlyRef.current) return;
      if (event.key === "Escape" && drag) {
        event.preventDefault();
        finishDrag(true);
        return;
      }
      if (drag || event.ctrlKey || event.altKey || event.metaKey) return;
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;
      const keys: Record<string, number> = {
        ArrowUp: value + step,
        ArrowRight: value + step,
        ArrowDown: value - step,
        ArrowLeft: value - step,
        PageUp: value + 10,
        PageDown: value - 10,
        Home: 0,
        End: 100,
      };
      if (!Object.hasOwn(keys, event.key)) return;
      event.preventDefault();
      if (setValue(keys[event.key])) commit();
    }

    function wheel(event: WheelEvent) {
      if (
        disabledRef.current ||
        readOnlyRef.current ||
        event.ctrlKey ||
        event.metaKey ||
        event.deltaY === 0 ||
        drag ||
        disposed
      )
        return;
      event.preventDefault();
      control.focus({ preventScroll: true });
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;
      if (setValue(value - Math.sign(event.deltaY) * step)) commit();
    }

    function doubleClick(event: MouseEvent) {
      if (disabledRef.current || readOnlyRef.current) return;
      event.preventDefault();
      finishDrag();
      if (setValue(resetRef.current ?? defaultValue)) commit();
    }

    function scheduleRender() {
      clearTimeout(renderTimer);
      if (!disposed) renderTimer = window.setTimeout(render, 80);
    }

    const events: Record<string, EventListener> = {
      pointerdown: pointerDown as EventListener,
      pointermove: pointerMove as EventListener,
      pointerup: pointerEnd as EventListener,
      pointercancel: pointerEnd as EventListener,
      lostpointercapture: pointerEnd as EventListener,
      keydown: keyDown as EventListener,
      dblclick: doubleClick as EventListener,
    };
    for (const [event, handler] of Object.entries(events))
      control.addEventListener(event, handler, { signal: listeners.signal });
    control.addEventListener("wheel", wheel, {
      passive: false,
      signal: listeners.signal,
    });
    root.addEventListener("pointermove", hover as EventListener, {
      signal: listeners.signal,
    });
    root.addEventListener("pointerleave", () => tilt(0, 0), {
      signal: listeners.signal,
    });
    window.addEventListener("blur", () => finishDrag(true), {
      signal: listeners.signal,
    });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) finishDrag(true);
      },
      { signal: listeners.signal },
    );
    window.addEventListener("resize", scheduleRender, {
      signal: listeners.signal,
    });
    const observer = createResizeObserver(scheduleRender);
    observer.observe(root);

    controllerRef.current = {
      get value() {
        return value;
      },
      setValue(next: number, notify = false) {
        setValue(next, notify);
      },
      reset() {
        if (setValue(resetRef.current ?? defaultValue)) commit();
      },
    };
    setValue(value, false);
    render();
    paint();

    return () => {
      finishDrag();
      disposed = true;
      listeners.abort();
      observer.disconnect();
      clearTimeout(renderTimer);
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (p.value !== undefined)
      controllerRef.current?.setValue(toPosition(p.value), false);
    // The scale is read on every render; a new value or range moves the knob.
  }, [p.value, min, span]);

  // Typing a value, as in studio plug-ins: click the readout, Enter applies, Escape cancels.
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const editable = !p.disabled && !p.readOnly;
  const applyDraft = () => {
    if (cancelled.current) return;
    const next = Number(draft?.replace(",", ".").replace(/[^\d.+-]/g, ""));
    setDraft(null);
    const controller = controllerRef.current;
    if (!draft?.trim() || !controller || !Number.isFinite(next)) return;
    const before = controller.value;
    controller.setValue(toPosition(next / displayScale), true);
    if (controller.value !== before) p.onValueCommit?.(toValue(controller.value));
  };

  const rootProps = mark("RotaryKnob", p, undefined, "knob");
  return (
    <div
      {...rootProps}
      ref={rootRef}
      data-value={toValue(initial)}
      data-disabled={p.disabled || undefined}
      data-readonly={p.readOnly || undefined}
      data-labelled={p.showLabel || undefined}
      style={
        {
          ...p.style,
          "--size": `${diameter / 16}rem`,
          "--angle": `${-135 + initial * 2.7}deg`,
          "--rotation": "0deg",
        } as React.CSSProperties
      }
    >
      <canvas
        className="knob__surface knob__base"
        aria-hidden="true"
        ref={baseRef}
      />
      <canvas
        className="knob__surface knob__feedback"
        aria-hidden="true"
        ref={feedbackRef}
      />
      <canvas
        className="knob__surface knob__rotor"
        aria-hidden="true"
        ref={rotorRef}
      />
      <span className="knob__sheen" aria-hidden="true" />
      <div
        ref={controlRef}
        className="knob__control"
        role={p.readOnly ? "meter" : "slider"}
        tabIndex={p.disabled || p.readOnly ? -1 : 0}
        aria-disabled={p.disabled || undefined}
        aria-readonly={p.readOnly || undefined}
        aria-label={p.label ?? tr("Громкость")}
        aria-valuemin={min}
        aria-valuemax={min + span}
        aria-valuenow={toValue(initial)}
        aria-valuetext={format(toValue(initial))}
        aria-orientation={p.readOnly ? undefined : "vertical"}
      >
        <div className="knob__indicator" aria-hidden="true">
          <div className="knob__slot" />
        </div>
      </div>
      {p.showValue !== false && (
        <div
          ref={readoutRef}
          className="knob__value"
          data-editable={editable || undefined}
          data-editing={draft !== null || undefined}
          title={editable ? tr("Нажмите, чтобы ввести значение") : undefined}
          onClick={() => {
            if (!editable) return;
            cancelled.current = false;
            setDraft(
              numberFormat.format(toValue(controllerRef.current?.value ?? initial) * displayScale),
            );
          }}
        >
          {format(toValue(initial))}
        </div>
      )}
      {draft !== null && (
        <input
          className="knob__input"
          aria-label={tr("{label}, значение", { label: p.label ?? tr("Громкость") })}
          inputMode="decimal"
          autoFocus
          value={draft}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={applyDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") {
              cancelled.current = true;
              setDraft(null);
            }
          }}
        />
      )}
      {p.showLabel && p.label && (
        <span className="knob__label" aria-hidden="true">
          {p.label}
        </span>
      )}
      <span className="ad-sr-only">
        Зажмите ручку ближе к краю и ведите мышью по кругу. За центр можно
        тянуть вверх или вниз. Нажатие на внешнюю шкалу устанавливает значение.
        Колесо мыши и стрелки меняют громкость. Shift — точная регулировка.
        Двойной щелчок — исходное значение.
      </span>
    </div>
  );
};
