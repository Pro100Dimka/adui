const r=`import { useSvgId } from "../../../core/artwork";\r
import { useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";\r
\r
/** Samples per strand. The waves are long and smooth, so 23 points joined by Catmull-Rom curves\r
 * trace the waves closer than 66 straight segments did, with a third of the work to draw it. */\r
const POINTS = 23;\r
const STEP = 65 / (POINTS - 1);\r
const X = Array.from({ length: POINTS }, (_, k) => (k * STEP / 65) * 600);\r
\r
/** One strand at time t: two travelling sines, the slow swell and a counter-ripple. */\r
const strand = (j: number, t: number) => {\r
  // One extra sample beyond each end, so the curve keeps the wave's true slope at the edges.\r
  const ys = Array.from({ length: POINTS + 2 }, (_, k) => {\r
    const i = (k - 1) * STEP;\r
    return 65 + (j - 11) * 2.5 + Math.sin(i * 0.115 + t * 0.6 + j * 0.08) * 24 + Math.sin(i * 0.19 - t * 0.31) * 9;\r
  });\r
  let d = \`M0 \${ys[1]!.toFixed(2)}\`;\r
  for (let k = 1; k < POINTS; k += 1) {\r
    const y0 = ys[k - 1]!, y1 = ys[k]!, y2 = ys[k + 1]!, y3 = ys[k + 2]!;\r
    const x1 = X[k - 1]!, x2 = X[k]!, third = (x2 - x1) / 3;\r
    d += \`C\${(x1 + third).toFixed(2)} \${(y1 + (y2 - y0) / 6).toFixed(2)} \${(x2 - third).toFixed(2)} \${(y2 - (y3 - y1) / 6).toFixed(2)} \${x2.toFixed(2)} \${y2.toFixed(2)}\`;\r
  }\r
  return d;\r
};\r
\r
export const WaveDecoration = (p: CommonProps) => {\r
  const ref = useRef<SVGSVGElement>(null);\r
  const uid = useSvgId();\r
  const paint = (t: number) =>\r
    ref.current?.querySelectorAll("path").forEach((path, j) => path.setAttribute("d", strand(j, t)));\r
  usePauseOffscreen(ref);\r
  useDecoration(ref, paint);\r
  return (\r
    <svg\r
      {...mark("WaveDecoration", p)}\r
      ref={ref}\r
      viewBox="0 0 600 130"\r
      aria-hidden="true"\r
    >\r
      <defs>\r
        <linearGradient id={\`wave-\${uid}\`}>\r
          {[\r
            [0, 0],\r
            [0.2, 0.3],\r
            [0.7, 1],\r
            [1, 0.35],\r
          ].map(([offset, opacity]) => (\r
            <stop\r
              key={offset}\r
              offset={offset}\r
              stopColor="var(--ad-primary)"\r
              stopOpacity={opacity}\r
            />\r
          ))}\r
        </linearGradient>\r
      </defs>\r
      {Array.from({ length: 22 }, (_, j) => (\r
        <path\r
          key={j}\r
          d="M0 65H600"\r
          fill="none"\r
          stroke={\`url(#wave-\${uid})\`}\r
          strokeWidth={j % 7 === 0 ? 1.2 : 0.65}\r
          opacity={0.5 + (j % 4) * 0.13}\r
        />\r
      ))}\r
    </svg>\r
  );\r
};\r
`;export{r as default};
