const r=`import { useSvgId } from "../../../core/artwork";\r
import { useRef } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";\r
\r
export interface SpectrumProps extends CommonProps {\r
  /** Segmented level columns, or smooth glowing bars in a bell shape. */\r
  variant?: "segmented" | "bars";\r
}\r
\r
const COLUMNS = 27;\r
const ROWS = 29;\r
const BARS = 23;\r
\r
/** Halo layers of a bar as [extra width on each side, opacity], widest first: a soft glow\r
 * without a filter, so moving bars never have to be re-blurred. */\r
const HALO = [[2, 0.12], [1, 0.3]] as const;\r
\r
const columnHeight = (i: number, time: number) =>\r
  12 + (Math.abs(i - 13) / 13) * (37 + (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.59)) ** 1.7 * 142);\r
\r
const barHeight = (i: number, time: number) => {\r
  const envelope = Math.exp(-(((i - 16) / 6) ** 2));\r
  const rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);\r
  return 9 + 100 * envelope * (0.53 + 0.47 * rhythm) + 15 * Math.sin(i * 0.67 + time * 0.58) ** 2;\r
};\r
\r
/** A living audio spectrum used as decoration behind level and monitoring panels. */\r
export function Spectrum({ variant = "segmented", ...p }: SpectrumProps) {\r
  return variant === "segmented" ? <Segmented {...p} /> : <Bars {...p} />;\r
}\r
\r
/**\r
 * Level columns. Each column's rows are drawn once; a window slides up and down over them\r
 * (the window moves one way, the rows inside it the other way, so they stay in place).\r
 * Both are transforms of their own layers: a moving column costs no repaint.\r
 */\r
function Segmented(p: CommonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const columns = useRef<HTMLElement[] | null>(null);
  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    if (!ref.current) return;
    columns.current ??= Array.from(ref.current.querySelectorAll<HTMLElement>(".ad-spectrum-column"));
    columns.current.forEach((column, i) => {
      const hidden = ((232 - columnHeight(i, time)) / 232) * 100;\r
      column.style.transform = \`translateY(\${hidden.toFixed(2)}%)\`;\r
      (column.firstElementChild as HTMLElement | null)?.style.setProperty("transform", \`translateY(\${(-hidden).toFixed(2)}%)\`);\r
    });\r
  });\r
  return (\r
    <div {...mark("Spectrum", p)} ref={ref} data-variant="segmented" aria-hidden="true">\r
      {Array.from({ length: COLUMNS }, (_, i) => (\r
        <span\r
          key={i}\r
          className="ad-spectrum-column"\r
          style={{ left: \`\${((i * 12 + 3) / 325) * 100}%\`, width: \`\${(8 / 325) * 100}%\` }}\r
        >\r
          <svg viewBox="0 0 8 232" preserveAspectRatio="none">\r
            {Array.from({ length: ROWS }, (__, row) => (\r
              <rect key={row} y={224 - row * 7} width="8" height="5" rx=".35" opacity={0.17 + row / 35} />\r
            ))}\r
          </svg>\r
        </span>\r
      ))}\r
    </div>\r
  );\r
}\r
\r
/** Smooth glowing bars in a bell shape; the glow is two faint wider bars behind each one. */\r
function Bars(p: CommonProps) {
  const ref = useRef<SVGSVGElement>(null);
  const layers = useRef<SVGRectElement[][] | null>(null);
  const id = useSvgId();
  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    if (!ref.current) return;
    layers.current ??= Array.from(ref.current.querySelectorAll<SVGGElement>("[data-bar]"),
      (bar) => Array.from(bar.querySelectorAll<SVGRectElement>("rect")));
    layers.current.forEach((rects, i) => {
      const height = barHeight(i, time);
      rects.forEach((rect) => {
        const grow = Number(rect.dataset.grow ?? 0);\r
        rect.setAttribute("y", (134 - height - grow).toFixed(2));\r
        rect.setAttribute("height", (height + grow).toFixed(2));\r
      });\r
    });\r
  });\r
  return (\r
    <svg\r
      {...mark("Spectrum", p)}\r
      ref={ref}\r
      data-variant="bars"\r
      viewBox="0 0 163 140"\r
      preserveAspectRatio="none"\r
      aria-hidden="true"\r
    >\r
      <defs>\r
        <linearGradient id={\`\${id}-bar\`} x1="0" x2="0" y1="0" y2="1">\r
          <stop stopColor="var(--ad-secondary-200)" />\r
          <stop offset=".24" stopColor="var(--ad-red)" />\r
          <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity="0" />\r
        </linearGradient>\r
        {/* The halo follows the bar's own fade, like the shadow of the bar did. */}\r
        <linearGradient id={\`\${id}-halo\`} x1="0" x2="0" y1="0" y2="1">\r
          <stop stopColor="var(--ad-red)" stopOpacity=".6" />\r
          <stop offset=".24" stopColor="var(--ad-red)" stopOpacity=".6" />\r
          <stop offset="1" stopColor="var(--ad-red)" stopOpacity="0" />\r
        </linearGradient>\r
      </defs>\r
      {Array.from({ length: BARS }, (_, i) => {\r
        const x = 4 + i * 6.75;\r
        const opacity = 0.55 + i / 55;\r
        return (\r
          <g key={i} data-bar>\r
            {HALO.map(([grow, halo]) => (\r
              <rect\r
                key={grow}\r
                data-grow={grow}\r
                x={x - grow}\r
                y="40"\r
                width={2.8 + grow * 2}\r
                height="100"\r
                rx={1.3 + grow}\r
                fill={\`url(#\${id}-halo)\`}\r
                opacity={halo * opacity}\r
              />\r
            ))}\r
            <rect x={x} y="40" width="2.8" height="100" rx="1.3" fill={\`url(#\${id}-bar)\`} opacity={opacity} />\r
          </g>\r
        );\r
      })}\r
    </svg>\r
  );\r
}\r
`;export{r as default};
