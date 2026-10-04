const n=`import {\r
  canPaint,\r
  createResizeObserver,\r
  reducedMotionQuery,\r
} from "../../../core/environment";\r
import React, {\r
  useEffect,\r
  useLayoutEffect,\r
  useMemo,\r
  useRef,\r
  useState,\r
} from "react";\r
import { clamp, mark, normalizeSize } from "../../../core/base";\r
import { type RotaryKnobProps, type RotaryKnobController } from "../shared";\r
\r
export const RotaryKnob = (p: RotaryKnobProps) => {\r
  const rootRef = useRef<HTMLDivElement>(null);\r
  const baseRef = useRef<HTMLCanvasElement>(null);\r
  const feedbackRef = useRef<HTMLCanvasElement>(null);\r
  const rotorRef = useRef<HTMLCanvasElement>(null);\r
  const controlRef = useRef<HTMLDivElement>(null);\r
  const readoutRef = useRef<HTMLDivElement>(null);\r
  const controllerRef = useRef<RotaryKnobController | null>(null);\r
  const onChangeRef = useRef(p.onValueChange);\r
  const onCommitRef = useRef(p.onValueCommit);\r
  const disabledRef = useRef(!!p.disabled);\r
  const readOnlyRef = useRef(!!p.readOnly);\r
  const numberFormat = useMemo(\r
    () => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }),\r
    [],\r
  );\r
  // The knob turns through positions 0–100; values in [min, max] map onto them at the edges.\r
  const min = p.min ?? 0;\r
  const span = (p.max ?? 100) - min || 1;\r
  const toPosition = (value: number) => clamp(((value - min) / span) * 100);\r
  const toValue = (position: number) =>\r
    Math.round((min + (position / 100) * span) * 1e6) / 1e6;\r
  const displayScale = p.displayScale ?? 1;\r
  const format = (value: number) =>\r
    \`\${numberFormat.format(value * displayScale)}\${p.suffix ?? "%"}\`;\r
  const scale = useRef({ toValue, format });\r
  scale.current = { toValue, format };\r
  const stepRef = useRef(1);\r
  const fineStepRef = useRef(0.1);\r
  onChangeRef.current = p.onValueChange;\r
  onCommitRef.current = p.onValueCommit;\r
  disabledRef.current = !!p.disabled;\r
  readOnlyRef.current = !!p.readOnly;\r
  stepRef.current = Math.max(0.001, ((p.step ?? span / 100) / span) * 100);\r
  fineStepRef.current = Math.max(0.001, ((p.fineStep ?? span / 1000) / span) * 100);\r
\r
  const initial = toPosition(p.defaultValue ?? p.value ?? min + span * 0.67);\r
  const initialRef = useRef(initial);\r
  const resetRef = useRef<number | undefined>(undefined);\r
  resetRef.current = p.resetValue === undefined ? undefined : toPosition(p.resetValue);\r
  const diameter =\r
    p.diameter ??\r
    { xs: 84, sm: 124, md: 220, lg: 320 }[normalizeSize(p.size) ?? "md"];\r
\r
  useLayoutEffect(() => {\r
    const root = rootRef.current!;\r
    const canvas = baseRef.current!;\r
    const rotor = rotorRef.current!;\r
    const feedback = feedbackRef.current!;\r
    const readout = readoutRef.current!;\r
    const control = controlRef.current!;\r
    if (!root || !canvas || !rotor || !feedback || !readout || !control) return;\r
\r
    // Without a 2D canvas (tests, server rendering) only the painting is skipped; the value,\r
    // keys, wheel and typed input keep working.\r
    const paintable = canPaint();\r
    const rotorCtx = (paintable ? rotor.getContext("2d") : null)!;\r
    const feedbackCtx = (paintable ? feedback.getContext("2d") : null)!;\r
    const ctx = (paintable ? canvas.getContext("2d", { alpha: true }) : null)!;\r
    const painted = Boolean(rotorCtx && feedbackCtx && ctx);\r
\r
    const TAU = Math.PI * 2;\r
    const localClamp = (value: number, min = 0, max = 1) =>\r
      Math.max(min, Math.min(max, value));\r
    const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;\r
    const fract = (value: number) => value - Math.floor(value);\r
    const noise = (value: number) =>\r
      fract(Math.sin(value * 127.1 + 311.7) * 43758.5453123);\r
    const defaultValue = localClamp(Number(initialRef.current) || 0, 0, 100);\r
    const startAngle = -135;\r
    const sweepAngle = 270;\r
    const valueAngle = (value: number) =>\r
      startAngle + (value * sweepAngle) / 100;\r
    const initialAngle = valueAngle(defaultValue);\r
    const degrees = 180 / Math.PI;\r
    const reducedMotion = reducedMotionQuery();\r
    const listeners = new AbortController();\r
    let value = defaultValue;\r
    let visualValue = value;\r
    let drag: null | {\r
      id: number;\r
      x: number;\r
      y: number;\r
      center: { x: number; y: number; radius: number };\r
      angle: number | null;\r
      mode: "circular" | "linear";\r
      value: number;\r
      start: number;\r
      /** Set by a click on the scale: the knob glides to the spot instead of snapping. */\r
      glide: boolean;\r
      distance: number;\r
    } = null;\r
    let renderTimer = 0;\r
    let animationFrame = 0;\r
    let previousFrame = 0;\r
    let disposed = false;\r
\r
    function render() {\r
      if (disposed || !painted) return;\r
      const cssSize = root.getBoundingClientRect().width;\r
      const size = Math.round(\r
        Math.min(\r
          1800,\r
          cssSize * Math.max(2, Math.min(devicePixelRatio || 1, 2.5)),\r
        ),\r
      );\r
      if (!size || (canvas.width === size && canvas.height === size)) return;\r
      canvas.width = canvas.height = size;\r
      const center = size / 2;\r
      const radius = size * 0.445;\r
      const pixels = ctx.createImageData(size, size);\r
      const data = pixels.data;\r
      const brush = new Float32Array(Math.ceil(radius * 5) + 8);\r
      for (let i = 0; i < brush.length; i++) brush[i] = noise(i + 17) - 0.5;\r
\r
      for (let y = 0; y < size; y++) {\r
        const yy = (y + 0.5 - center) / radius;\r
        for (let x = 0; x < size; x++) {\r
          const xx = (x + 0.5 - center) / radius;\r
          const r = Math.hypot(xx, yy);\r
          if (r > 1.055) continue;\r
          const index = (y * size + x) * 4;\r
          if (r > 1) {\r
            const a = Math.exp(-(r - 1) * 135) * 0.09;\r
            data[index] = 130;\r
            data[index + 1] = 0;\r
            data[index + 2] = 9;\r
            data[index + 3] = a * 255;\r
            continue;\r
          }\r
\r
          const angle = Math.atan2(yy, xx);\r
          const ringPosition = r * radius * 1.8;\r
          const bi = Math.floor(ringPosition);\r
          const grain = mix(\r
            brush[bi] ?? 0,\r
            brush[bi + 1] ?? 0,\r
            ringPosition - bi,\r
          );\r
          const grain2 = Math.sin(\r
            r * radius * 4.8 + Math.sin(angle * 17) * 0.3,\r
          );\r
          const directional = Math.pow(Math.abs(Math.cos(angle + 0.77)), 16);\r
          const broad = Math.pow(Math.abs(Math.cos(angle - 0.86)), 5);\r
          const edgeLight = 0.5 + 0.5 * Math.cos(angle + 2.15);\r
          const grainAmount = grain * 9.5 + grain2 * 2.2;\r
          let red = 0,\r
            green = 0,\r
            blue = 0,\r
            v = 0;\r
\r
          if (r < 0.704) {\r
            const radialLight = 0.7 + 0.3 * Math.sqrt(r / 0.704);\r
            const satin =\r
              84 * Math.max(0, Math.cos(angle - 1.01)) ** 28 +\r
              76 * Math.max(0, Math.cos(angle - 2.23)) ** 27 +\r
              116 * Math.max(0, Math.cos(angle - 4.07)) ** 29 +\r
              108 * Math.max(0, Math.cos(angle - 5.31)) ** 30;\r
            v = 7 + radialLight * satin + 11 * Math.abs(Math.cos(angle)) ** 14;\r
            v += grainAmount * (0.48 + v / 55);\r
            v += 9 * Math.exp(-r * 90);\r
            v *= 1 - 0.35 * Math.exp(-Math.pow((r - 0.699) / 0.009, 2));\r
            red = v;\r
            green = v * 0.995;\r
            blue = v * 1.025;\r
          } else if (r < 0.709) {\r
            v = 8 + 17 * edgeLight;\r
            red = v;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.715) {\r
            v = 85 + 133 * edgeLight + 25 * directional;\r
            red = v;\r
            green = v * 0.96;\r
            blue = v * 0.93;\r
          } else if (r < 0.729) {\r
            const t = (r - 0.715) / 0.014;\r
            v =\r
              (21 + 111 * directional + 55 * broad) * (1 - t * 0.55) +\r
              grainAmount;\r
            red = v + 5;\r
            green = v;\r
            blue = v * 0.98;\r
          } else if (r < 0.735) {\r
            v = 100 + 106 * edgeLight;\r
            red = v;\r
            green = v * 0.96;\r
            blue = v * 0.94;\r
          } else if (r < 0.743) {\r
            v = 5 + 11 * edgeLight;\r
            red = v + 10;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.814) {\r
            v = 9 + 8 * edgeLight + grainAmount;\r
            red = v + 8;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.819) {\r
            v = 72 + 115 * directional + 49 * edgeLight;\r
            red = v;\r
            green = v * 0.87;\r
            blue = v * 0.85;\r
          } else if (r < 0.872) {\r
            const t = (r - 0.819) / 0.053;\r
            const arc = Math.exp(-Math.pow((t - 0.39) / 0.16, 2));\r
            const thin = Math.exp(-Math.pow((t - 0.39) / 0.025, 2));\r
            const outerRim = Math.exp(-Math.pow((t - 0.94) / 0.035, 2));\r
            const bright = 0.4 + 0.6 * Math.pow(Math.abs(Math.sin(angle)), 12);\r
            const side = Math.pow(Math.abs(Math.cos(angle)), 34) * 0.65;\r
            const reflection = localClamp(bright + side);\r
            red = 29 + arc * 197 * reflection + thin * 83 + outerRim * 148;\r
            green =\r
              1 + arc * 11 * reflection + thin * 95 * reflection + outerRim * 2;\r
            blue =\r
              4 + arc * 13 * reflection + thin * 94 * reflection + outerRim * 6;\r
          } else if (r < 0.882) {\r
            v = 2 + 8 * edgeLight;\r
            red = v + 8;\r
            green = v;\r
            blue = v;\r
          } else if (r < 0.988) {\r
            v = 12 + 22 * directional + 11 * broad + grainAmount * 0.7;\r
            const innerEdge = Math.exp(-Math.pow((r - 0.885) / 0.003, 2));\r
            red = v + 9 * innerEdge;\r
            green = v;\r
            blue = v * 1.035;\r
          } else if (r < 0.9965) {\r
            v = 12 + 24 * edgeLight + 22 * directional;\r
            red = v;\r
            green = v;\r
            blue = v;\r
          } else {\r
            const t = (r - 0.9965) / 0.0035;\r
            v = (50 + 140 * edgeLight) * (1 - t);\r
            red = v;\r
            green = v;\r
            blue = v;\r
          }\r
\r
          data[index] = localClamp(red, 0, 255);\r
          data[index + 1] = localClamp(green, 0, 255);\r
          data[index + 2] = localClamp(blue, 0, 255);\r
          data[index + 3] = 255;\r
        }\r
      }\r
      ctx.putImageData(pixels, 0, 0);\r
      ctx.save();\r
      ctx.translate(center, center);\r
      ctx.scale(radius, radius);\r
      drawKnurl();\r
      drawReflections();\r
      drawTicks();\r
      ctx.restore();\r
\r
      rotor.width = rotor.height = size;\r
      feedback.width = feedback.height = size;\r
      rotorCtx.save();\r
      rotorCtx.beginPath();\r
      rotorCtx.arc(center, center, radius * 0.819, 0, TAU);\r
      rotorCtx.clip();\r
      rotorCtx.drawImage(canvas, 0, 0);\r
      rotorCtx.restore();\r
      paintFeedback();\r
    }\r
\r
    function drawKnurl() {\r
      const columns = 184;\r
      const rows = 6;\r
      const start = 0.744;\r
      const end = 0.813;\r
      const step = (end - start) / rows;\r
      const pitch = TAU / columns;\r
      const point = (radius: number, angle: number): [number, number] => [\r
        Math.cos(angle) * radius,\r
        Math.sin(angle) * radius,\r
      ];\r
      ctx.save();\r
      ctx.beginPath();\r
      ctx.arc(0, 0, end, 0, TAU);\r
      ctx.arc(0, 0, start, TAU, 0, true);\r
      ctx.clip("evenodd");\r
      for (let row = -1; row <= rows; row++) {\r
        const r = start + (row + 0.5) * step;\r
        for (let column = 0; column < columns; column++) {\r
          const a = (column + (row % 2 ? 0.5 : 0)) * pitch;\r
          const middle = point(r, a);\r
          const vertices = [\r
            point(r - step * 0.94, a),\r
            point(r, a + pitch * 0.47),\r
            point(r + step * 0.94, a),\r
            point(r, a - pitch * 0.47),\r
          ];\r
          const globalLight = 0.52 + 0.48 * Math.cos(a + 1.9);\r
          const variation = 0.88 + noise(column * 19 + row * 317) * 0.2;\r
          for (let side = 0; side < 4; side++) {\r
            const p1 = vertices[side];\r
            const p2 = vertices[(side + 1) % 4];\r
            const direction = a + [-2.36, -0.78, 0.78, 2.36][side];\r
            const light = Math.max(0, Math.cos(direction + 2.15));\r
            const metal = (6 + light ** 5 * 228 + globalLight * 10) * variation;\r
            const ruby = Math.pow(Math.max(0, Math.sin(a)), 3) * 27;\r
            ctx.fillStyle = \`rgb(\${metal + ruby},\${metal * 0.96},\${metal * 0.93})\`;\r
            ctx.beginPath();\r
            ctx.moveTo(...middle);\r
            ctx.lineTo(...p1);\r
            ctx.lineTo(...p2);\r
            ctx.closePath();\r
            ctx.fill();\r
          }\r
        }\r
      }\r
      ctx.restore();\r
    }\r
\r
    function drawReflections() {\r
      const r = 0.8395;\r
      const glow = ctx.createRadialGradient(0, 0, 0.809, 0, 0, 0.896);\r
      glow.addColorStop(0, "#ff001800");\r
      glow.addColorStop(0.3, "#f8002020");\r
      glow.addColorStop(0.47, "#ff123f55");\r
      glow.addColorStop(0.7, "#d900141d");\r
      glow.addColorStop(1, "#ff001800");\r
      ctx.fillStyle = glow;\r
      ctx.beginPath();\r
      ctx.arc(0, 0, 0.896, 0, TAU);\r
      ctx.arc(0, 0, 0.809, TAU, 0, true);\r
      ctx.fill("evenodd");\r
      for (const angle of [-Math.PI / 2, Math.PI / 2, Math.PI, 0]) {\r
        const pointX = Math.cos(angle) * r;\r
        const py = Math.sin(angle) * r;\r
        const halo = ctx.createRadialGradient(pointX, py, 0, pointX, py, 0.055);\r
        halo.addColorStop(0, "#fff1f1b8");\r
        halo.addColorStop(0.2, "#ff315b72");\r
        halo.addColorStop(1, "#ff001800");\r
        ctx.fillStyle = halo;\r
        ctx.beginPath();\r
        ctx.arc(pointX, py, 0.055, 0, TAU);\r
        ctx.fill();\r
      }\r
    }\r
\r
    function roundRect(\r
      x: number,\r
      y: number,\r
      width: number,\r
      height: number,\r
      radius: number,\r
    ) {\r
      ctx.beginPath();\r
      ctx.roundRect(x, y, width, height, radius);\r
      ctx.fill();\r
    }\r
\r
    function drawTicks() {\r
      const scale = canvas.width * 0.445;\r
      for (let i = 0; i < 16; i++) {\r
        const major = i % 4 === 0;\r
        const width = major ? 0.012 : 0.01;\r
        const length = major ? 0.078 : 0.066;\r
        ctx.save();\r
        ctx.rotate((i * TAU) / 16);\r
        ctx.fillStyle = "#020101";\r
        roundRect(\r
          -width / 2 - 0.004,\r
          -0.933 - length / 2 - 0.004,\r
          width + 0.008,\r
          length + 0.008,\r
          0.006,\r
        );\r
        ctx.strokeStyle = "#71312c";\r
        ctx.lineWidth = 0.0017;\r
        ctx.stroke();\r
        ctx.shadowColor = major ? "#ff1029" : "#e9152470";\r
        ctx.shadowBlur = scale * (major ? 0.034 : 0.01);\r
        ctx.fillStyle = major ? "#ff2447" : "#ff6c7d";\r
        roundRect(-width / 2, -0.933 - length / 2, width, length, 0.003);\r
        ctx.shadowBlur = 0;\r
        const fill = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);\r
        fill.addColorStop(0, "#ff2539");\r
        fill.addColorStop(0.38, major ? "#fff8eb" : "#ffa19c");\r
        fill.addColorStop(0.7, major ? "#fff6e9" : "#ff938d");\r
        fill.addColorStop(1, "#f82538");\r
        ctx.fillStyle = fill;\r
        roundRect(\r
          -width * 0.34,\r
          -0.933 - length * 0.47,\r
          width * 0.68,\r
          length * 0.94,\r
          0.002,\r
        );\r
        ctx.restore();\r
      }\r
    }\r
\r
    function paintFeedback() {\r
      if (!painted || !feedback.width || disposed) return;\r
      const scale = feedback.width * 0.445;\r
      const start = (startAngle - 90) / degrees;\r
      const end = (valueAngle(visualValue) - 90) / degrees;\r
      feedbackCtx.clearRect(0, 0, feedback.width, feedback.height);\r
      feedbackCtx.save();\r
      feedbackCtx.translate(feedback.width / 2, feedback.height / 2);\r
      feedbackCtx.scale(scale, scale);\r
      feedbackCtx.beginPath();\r
      feedbackCtx.arc(0, 0, 0.846, end, start + TAU);\r
      feedbackCtx.strokeStyle = "rgba(0, 0, 0, 0.78)";\r
      feedbackCtx.lineWidth = 0.052;\r
      feedbackCtx.stroke();\r
      if (visualValue > 0) paintValue(start, end, scale);\r
      feedbackCtx.restore();\r
    }\r
\r
    /**\r
     * The value as a neon tube: deep ruby at the start heating up to white at the end,\r
     * a comet head of light on its tip, and every scale tick it has passed lit up.\r
     */\r
    function paintValue(start: number, end: number, scale: number) {\r
      const sweep = Math.max(0.0001, (end - start) / TAU);\r
      const tube = feedbackCtx.createConicGradient(start, 0, 0);\r
      tube.addColorStop(0, "rgba(110, 0, 22, 0.9)");\r
      tube.addColorStop(sweep * 0.65, "rgba(255, 36, 72, 1)");\r
      tube.addColorStop(sweep, "rgba(255, 238, 242, 1)");\r
      tube.addColorStop(Math.min(1, sweep + 0.0001), "rgba(255, 238, 242, 0)");\r
      const stroke = (width: number, alpha: number, blur: number) => {\r
        feedbackCtx.beginPath();\r
        feedbackCtx.arc(0, 0, 0.8395, start, end);\r
        feedbackCtx.lineCap = "round";\r
        feedbackCtx.lineWidth = width;\r
        feedbackCtx.globalAlpha = alpha;\r
        feedbackCtx.shadowColor = "#ff163d";\r
        feedbackCtx.shadowBlur = scale * blur;\r
        feedbackCtx.strokeStyle = tube;\r
        feedbackCtx.stroke();\r
      };\r
      stroke(0.05, 0.35, 0.06);\r
      stroke(0.017, 0.95, 0.03);\r
      stroke(0.006, 1, 0.012);\r
      feedbackCtx.globalAlpha = 1;\r
      feedbackCtx.shadowBlur = 0;\r
\r
      const tipX = Math.cos(end) * 0.8395;\r
      const tipY = Math.sin(end) * 0.8395;\r
      const head = feedbackCtx.createRadialGradient(\r
        tipX,\r
        tipY,\r
        0,\r
        tipX,\r
        tipY,\r
        0.12,\r
      );\r
      head.addColorStop(0, "rgba(255, 255, 255, 1)");\r
      head.addColorStop(0.12, "rgba(255, 220, 228, 0.9)");\r
      head.addColorStop(0.35, "rgba(255, 60, 100, 0.45)");\r
      head.addColorStop(1, "rgba(255, 0, 40, 0)");\r
      feedbackCtx.fillStyle = head;\r
      feedbackCtx.beginPath();\r
      feedbackCtx.arc(tipX, tipY, 0.12, 0, TAU);\r
      feedbackCtx.fill();\r
\r
      const reached = valueAngle(visualValue);\r
      for (let i = 0; i < 16; i += 1) {\r
        const angle = normalizeAngle(i * 22.5);\r
        if (angle < startAngle || angle > -startAngle) continue;\r
        const x = Math.sin(angle / degrees) * 0.933;\r
        const y = -Math.cos(angle / degrees) * 0.933;\r
        // Ticks still ahead of the value are dimmed, so the passed ones read as lit.\r
        if (angle > reached - 0.5) {\r
          const shade = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.05);\r
          shade.addColorStop(0, "rgba(8, 3, 4, 0.72)");\r
          shade.addColorStop(0.55, "rgba(8, 3, 4, 0.55)");\r
          shade.addColorStop(1, "rgba(8, 3, 4, 0)");\r
          feedbackCtx.fillStyle = shade;\r
          feedbackCtx.beginPath();\r
          feedbackCtx.arc(x, y, 0.05, 0, TAU);\r
          feedbackCtx.fill();\r
          continue;\r
        }\r
        const heat = 0.5 + 0.5 * Math.exp(-(reached - angle) / 28);\r
        const glow = feedbackCtx.createRadialGradient(x, y, 0, x, y, 0.075);\r
        glow.addColorStop(0, \`rgba(255, 255, 255, \${heat})\`);\r
        glow.addColorStop(0.16, \`rgba(255, 210, 220, \${0.85 * heat})\`);\r
        glow.addColorStop(0.42, \`rgba(255, 40, 76, \${0.55 * heat})\`);\r
        glow.addColorStop(1, "rgba(255, 0, 40, 0)");\r
        feedbackCtx.fillStyle = glow;\r
        feedbackCtx.beginPath();\r
        feedbackCtx.arc(x, y, 0.075, 0, TAU);\r
        feedbackCtx.fill();\r
      }\r
    }\r
\r
    function paint() {\r
      root.style.setProperty("--angle", \`\${valueAngle(visualValue)}deg\`);\r
      root.style.setProperty(\r
        "--rotation",\r
        \`\${valueAngle(visualValue) - initialAngle}deg\`,\r
      );\r
      paintFeedback();\r
    }\r
\r
    function animate(timestamp: number) {\r
      animationFrame = 0;\r
      if (disposed) return;\r
      const elapsed = previousFrame\r
        ? Math.min(64, timestamp - previousFrame)\r
        : 16;\r
      previousFrame = timestamp;\r
      const immediate = (!!drag && !drag.glide) || reducedMotion.matches;\r
      visualValue = immediate\r
        ? value\r
        : visualValue + (value - visualValue) * (1 - Math.exp(-elapsed / 42));\r
      if (Math.abs(value - visualValue) < 0.005) visualValue = value;\r
      paint();\r
      if (visualValue !== value)\r
        animationFrame = requestAnimationFrame(animate);\r
      else previousFrame = 0;\r
    }\r
\r
    function schedulePaint() {\r
      if (!animationFrame && !disposed)\r
        animationFrame = requestAnimationFrame(animate);\r
    }\r
\r
    function setValue(next: number, notify = true) {\r
      if (disposed) return false;\r
      const numeric = Number(next);\r
      if (!Number.isFinite(numeric)) return false;\r
      const nextValue = Math.round(localClamp(numeric, 0, 100) * 1000) / 1000;\r
      const changed = nextValue !== value;\r
      value = nextValue;\r
      const shown = scale.current.toValue(value);\r
      const text = scale.current.format(shown);\r
      root.dataset.value = String(shown);\r
      control.setAttribute("aria-valuenow", String(shown));\r
      control.setAttribute("aria-valuetext", text);\r
      control.title = \`\${p.label ?? "Громкость"}: \${text} · ведите по кругу или тяните за центр\`;\r
      readout.textContent = text;\r
      schedulePaint();\r
      if (changed && notify) onChangeRef.current?.(shown);\r
      return changed;\r
    }\r
\r
    function commit() {\r
      if (!disposed) onCommitRef.current?.(scale.current.toValue(value));\r
    }\r
\r
    function geometry() {\r
      const rect = control.getBoundingClientRect();\r
      return {\r
        x: rect.left + rect.width / 2,\r
        y: rect.top + rect.height / 2,\r
        radius: rect.width / 2,\r
      };\r
    }\r
    function polar(event: PointerEvent, center: ReturnType<typeof geometry>) {\r
      return (\r
        Math.atan2(event.clientY - center.y, event.clientX - center.x) * degrees\r
      );\r
    }\r
    function normalizeAngle(angle: number) {\r
      return ((((angle + 180) % 360) + 360) % 360) - 180;\r
    }\r
\r
    function pointerDown(event: PointerEvent) {\r
      if (\r
        disabledRef.current ||\r
        readOnlyRef.current ||\r
        event.button !== 0 ||\r
        !event.isPrimary ||\r
        drag ||\r
        disposed\r
      )\r
        return;\r
      const center = geometry();\r
      const distance =\r
        Math.hypot(event.clientX - center.x, event.clientY - center.y) /\r
        center.radius;\r
      if (distance > 1.04) return;\r
      event.preventDefault();\r
      control.focus({ preventScroll: true });\r
      drag = {\r
        id: event.pointerId,\r
        x: event.clientX,\r
        y: event.clientY,\r
        center,\r
        angle: polar(event, center),\r
        mode: distance >= 0.36 ? "circular" : "linear",\r
        value,\r
        start: value,\r
        distance: localClamp(center.radius * 1.2, 160, 420),\r
        glide: false,\r
      };\r
      control.setPointerCapture(event.pointerId);\r
      root.classList.add("is-dragging");\r
      tilt(0, 0);\r
      // A press on the glowing scale ring or the ticks sets the value right there.\r
      if (distance >= 0.8) {\r
        drag.glide = true;\r
        let angle = normalizeAngle((drag.angle ?? 0) + 90);\r
        if (Math.abs(angle) > 179.99) angle = value >= 50 ? 180 : -180;\r
        drag.value = localClamp(\r
          ((angle - startAngle) / sweepAngle) * 100,\r
          0,\r
          100,\r
        );\r
        setValue(drag.value);\r
      }\r
    }\r
\r
    /** The knob leans a little towards the pointer, like a real object under a light. */\r
    function tilt(x: number, y: number) {\r
      root.style.setProperty("--tilt-x", \`\${(-y * 7).toFixed(2)}deg\`);\r
      root.style.setProperty("--tilt-y", \`\${(x * 7).toFixed(2)}deg\`);\r
    }\r
    function hover(event: PointerEvent) {\r
      if (\r
        drag ||\r
        disabledRef.current ||\r
        reducedMotion.matches ||\r
        document.documentElement.dataset.adMotion === "off"\r
      )\r
        return;\r
      const center = geometry();\r
      tilt(\r
        localClamp((event.clientX - center.x) / center.radius, -1, 1),\r
        localClamp((event.clientY - center.y) / center.radius, -1, 1),\r
      );\r
    }\r
\r
    function pointerMove(event: PointerEvent) {\r
      if (!drag || event.pointerId !== drag.id) return;\r
      drag.glide = false;\r
      event.preventDefault();\r
      const precision = event.shiftKey ? 0.1 : 1;\r
      const angle = polar(event, drag.center);\r
      const radius = Math.hypot(\r
        event.clientX - drag.center.x,\r
        event.clientY - drag.center.y,\r
      );\r
      let delta = 0;\r
      if (drag.mode === "circular") {\r
        if (radius > drag.center.radius * 0.12 && drag.angle !== null)\r
          delta = (normalizeAngle(angle - drag.angle) / sweepAngle) * 100;\r
        drag.angle = radius > drag.center.radius * 0.12 ? angle : null;\r
      } else {\r
        delta =\r
          ((event.clientX - drag.x - (event.clientY - drag.y)) /\r
            drag.distance) *\r
          100;\r
      }\r
      drag.x = event.clientX;\r
      drag.y = event.clientY;\r
      drag.value = localClamp(drag.value + delta * precision, 0, 100);\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      setValue(Math.round(drag.value / step) * step);\r
    }\r
\r
    function finishDrag(cancelled = false) {\r
      if (!drag) return;\r
      const gesture = drag;\r
      drag = null;\r
      root.classList.remove("is-dragging");\r
      if (control.hasPointerCapture(gesture.id))\r
        control.releasePointerCapture(gesture.id);\r
      if (cancelled) setValue(gesture.start);\r
      else if (value !== gesture.start) commit();\r
    }\r
\r
    function pointerEnd(event: PointerEvent) {\r
      if (!drag || event.pointerId !== drag.id) return;\r
      finishDrag(event.type === "pointercancel");\r
    }\r
\r
    function keyDown(event: KeyboardEvent) {\r
      if (disabledRef.current || readOnlyRef.current) return;\r
      if (event.key === "Escape" && drag) {\r
        event.preventDefault();\r
        finishDrag(true);\r
        return;\r
      }\r
      if (drag || event.ctrlKey || event.altKey || event.metaKey) return;\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      const keys: Record<string, number> = {\r
        ArrowUp: value + step,\r
        ArrowRight: value + step,\r
        ArrowDown: value - step,\r
        ArrowLeft: value - step,\r
        PageUp: value + 10,\r
        PageDown: value - 10,\r
        Home: 0,\r
        End: 100,\r
      };\r
      if (!Object.hasOwn(keys, event.key)) return;\r
      event.preventDefault();\r
      if (setValue(keys[event.key])) commit();\r
    }\r
\r
    function wheel(event: WheelEvent) {\r
      if (\r
        disabledRef.current ||\r
        readOnlyRef.current ||\r
        event.ctrlKey ||\r
        event.metaKey ||\r
        event.deltaY === 0 ||\r
        drag ||\r
        disposed\r
      )\r
        return;\r
      event.preventDefault();\r
      control.focus({ preventScroll: true });\r
      const step = event.shiftKey ? fineStepRef.current : stepRef.current;\r
      if (setValue(value - Math.sign(event.deltaY) * step)) commit();\r
    }\r
\r
    function doubleClick(event: MouseEvent) {\r
      if (disabledRef.current || readOnlyRef.current) return;\r
      event.preventDefault();\r
      finishDrag();\r
      if (setValue(resetRef.current ?? defaultValue)) commit();\r
    }\r
\r
    function scheduleRender() {\r
      clearTimeout(renderTimer);\r
      if (!disposed) renderTimer = window.setTimeout(render, 80);\r
    }\r
\r
    const events: Record<string, EventListener> = {\r
      pointerdown: pointerDown as EventListener,\r
      pointermove: pointerMove as EventListener,\r
      pointerup: pointerEnd as EventListener,\r
      pointercancel: pointerEnd as EventListener,\r
      lostpointercapture: pointerEnd as EventListener,\r
      keydown: keyDown as EventListener,\r
      dblclick: doubleClick as EventListener,\r
    };\r
    for (const [event, handler] of Object.entries(events))\r
      control.addEventListener(event, handler, { signal: listeners.signal });\r
    control.addEventListener("wheel", wheel, {\r
      passive: false,\r
      signal: listeners.signal,\r
    });\r
    root.addEventListener("pointermove", hover as EventListener, {\r
      signal: listeners.signal,\r
    });\r
    root.addEventListener("pointerleave", () => tilt(0, 0), {\r
      signal: listeners.signal,\r
    });\r
    window.addEventListener("blur", () => finishDrag(true), {\r
      signal: listeners.signal,\r
    });\r
    document.addEventListener(\r
      "visibilitychange",\r
      () => {\r
        if (document.hidden) finishDrag(true);\r
      },\r
      { signal: listeners.signal },\r
    );\r
    window.addEventListener("resize", scheduleRender, {\r
      signal: listeners.signal,\r
    });\r
    const observer = createResizeObserver(scheduleRender);\r
    observer.observe(root);\r
\r
    controllerRef.current = {\r
      get value() {\r
        return value;\r
      },\r
      setValue(next: number, notify = false) {\r
        setValue(next, notify);\r
      },\r
      reset() {\r
        if (setValue(resetRef.current ?? defaultValue)) commit();\r
      },\r
    };\r
    setValue(value, false);\r
    render();\r
    paint();\r
\r
    return () => {\r
      finishDrag();\r
      disposed = true;\r
      listeners.abort();\r
      observer.disconnect();\r
      clearTimeout(renderTimer);\r
      cancelAnimationFrame(animationFrame);\r
      animationFrame = 0;\r
      controllerRef.current = null;\r
    };\r
  }, []);\r
\r
  useEffect(() => {\r
    if (p.value !== undefined)\r
      controllerRef.current?.setValue(toPosition(p.value), false);\r
    // The scale is read on every render; a new value or range moves the knob.\r
  }, [p.value, min, span]);\r
\r
  // Typing a value, as in studio plug-ins: click the readout, Enter applies, Escape cancels.\r
  const [draft, setDraft] = useState<string | null>(null);\r
  const cancelled = useRef(false);\r
  const editable = !p.disabled && !p.readOnly;\r
  const applyDraft = () => {\r
    if (cancelled.current) return;\r
    const next = Number(draft?.replace(",", ".").replace(/[^\\d.+-]/g, ""));\r
    setDraft(null);\r
    const controller = controllerRef.current;\r
    if (!draft?.trim() || !controller || !Number.isFinite(next)) return;\r
    const before = controller.value;\r
    controller.setValue(toPosition(next / displayScale), true);\r
    if (controller.value !== before) p.onValueCommit?.(toValue(controller.value));\r
  };\r
\r
  const rootProps = mark("RotaryKnob", p, undefined, "knob");\r
  return (\r
    <div\r
      {...rootProps}\r
      ref={rootRef}\r
      data-value={toValue(initial)}\r
      data-disabled={p.disabled || undefined}\r
      data-readonly={p.readOnly || undefined}\r
      data-labelled={p.showLabel || undefined}\r
      style={\r
        {\r
          ...p.style,\r
          "--size": \`\${diameter / 16}rem\`,\r
          "--angle": \`\${-135 + initial * 2.7}deg\`,\r
          "--rotation": "0deg",\r
        } as React.CSSProperties\r
      }\r
    >\r
      <canvas\r
        className="knob__surface knob__base"\r
        aria-hidden="true"\r
        ref={baseRef}\r
      />\r
      <canvas\r
        className="knob__surface knob__feedback"\r
        aria-hidden="true"\r
        ref={feedbackRef}\r
      />\r
      <canvas\r
        className="knob__surface knob__rotor"\r
        aria-hidden="true"\r
        ref={rotorRef}\r
      />\r
      <span className="knob__sheen" aria-hidden="true" />\r
      <div\r
        ref={controlRef}\r
        className="knob__control"\r
        role={p.readOnly ? "meter" : "slider"}\r
        tabIndex={p.disabled || p.readOnly ? -1 : 0}\r
        aria-disabled={p.disabled || undefined}\r
        aria-readonly={p.readOnly || undefined}\r
        aria-label={p.label ?? "Громкость"}\r
        aria-valuemin={min}\r
        aria-valuemax={min + span}\r
        aria-valuenow={toValue(initial)}\r
        aria-valuetext={format(toValue(initial))}\r
        aria-orientation={p.readOnly ? undefined : "vertical"}\r
      >\r
        <div className="knob__indicator" aria-hidden="true">\r
          <div className="knob__slot" />\r
        </div>\r
      </div>\r
      {p.showValue !== false && (\r
        <div\r
          ref={readoutRef}\r
          className="knob__value"\r
          data-editable={editable || undefined}\r
          data-editing={draft !== null || undefined}\r
          title={editable ? "Нажмите, чтобы ввести значение" : undefined}\r
          onClick={() => {\r
            if (!editable) return;\r
            cancelled.current = false;\r
            setDraft(\r
              numberFormat.format(toValue(controllerRef.current?.value ?? initial) * displayScale),\r
            );\r
          }}\r
        >\r
          {format(toValue(initial))}\r
        </div>\r
      )}\r
      {draft !== null && (\r
        <input\r
          className="knob__input"\r
          aria-label={\`\${p.label ?? "Громкость"}, значение\`}\r
          inputMode="decimal"\r
          autoFocus\r
          value={draft}\r
          onFocus={(event) => event.currentTarget.select()}\r
          onChange={(event) => setDraft(event.currentTarget.value)}\r
          onBlur={applyDraft}\r
          onKeyDown={(event) => {\r
            if (event.key === "Enter") event.currentTarget.blur();\r
            if (event.key === "Escape") {\r
              cancelled.current = true;\r
              setDraft(null);\r
            }\r
          }}\r
        />\r
      )}\r
      {p.showLabel && p.label && (\r
        <span className="knob__label" aria-hidden="true">\r
          {p.label}\r
        </span>\r
      )}\r
      <span className="ad-sr-only">\r
        Зажмите ручку ближе к краю и ведите мышью по кругу. За центр можно\r
        тянуть вверх или вниз. Нажатие на внешнюю шкалу устанавливает значение.\r
        Колесо мыши и стрелки меняют громкость. Shift — точная регулировка.\r
        Двойной щелчок — исходное значение.\r
      </span>\r
    </div>\r
  );\r
};\r
`;export{n as default};
