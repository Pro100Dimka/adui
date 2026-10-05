const n=`import { useSvgId } from "../../../core/artwork";
import { useRef } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { useDecoration, usePauseOffscreen } from "../../../core/motion/hooks";

export interface SpectrumProps extends CommonProps {
  /** Segmented level columns, or smooth glowing bars in a bell shape. */
  variant?: "segmented" | "bars";
}

const COLUMNS = 27;
const ROWS = 29;
const BARS = 23;

/** A living audio spectrum used as decoration behind level and monitoring panels. */
export function Spectrum({ variant = "segmented", ...p }: SpectrumProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useSvgId();

  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    const svg = ref.current;
    if (!svg) return;
    if (variant === "segmented") {
      // Columns rise more towards the edges, each on its own beat.
      svg.querySelectorAll<SVGRectElement>("[data-mask]").forEach((mask, i) => {
        const edge = Math.abs(i - 13) / 13;
        const height =
          12 +
          edge *
            (37 + (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.59)) ** 1.7 * 142);
        mask.setAttribute("y", (232 - height).toFixed(1));
        mask.setAttribute("height", height.toFixed(1));
      });
      return;
    }
    svg.querySelectorAll<SVGRectElement>("[data-bar]").forEach((bar, i) => {
      const envelope = Math.exp(-(((i - 16) / 6) ** 2));
      const rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);
      const height =
        9 +
        100 * envelope * (0.53 + 0.47 * rhythm) +
        15 * Math.sin(i * 0.67 + time * 0.58) ** 2;
      bar.setAttribute("y", (134 - height).toFixed(2));
      bar.setAttribute("height", height.toFixed(2));
    });
  });

  return (
    <svg
      {...mark("Spectrum", p)}
      ref={ref}
      data-variant={variant}
      viewBox={variant === "segmented" ? "0 0 325 232" : "0 0 163 140"}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {variant === "segmented" ? (
        <>
          <defs>
            {Array.from({ length: COLUMNS }, (_, i) => (
              <clipPath key={i} id={\`\${id}-c\${i}\`}>
                <rect data-mask x={i * 12 + 3} y="232" width="8" height="0" />
              </clipPath>
            ))}
          </defs>
          {Array.from({ length: COLUMNS }, (_, i) => (
            <g key={i} clipPath={\`url(#\${id}-c\${i})\`}>
              {Array.from({ length: ROWS }, (__, row) => (
                <rect
                  key={row}
                  x={i * 12 + 3}
                  y={224 - row * 7}
                  width="8"
                  height="5"
                  rx=".35"
                  opacity={0.17 + row / 35}
                />
              ))}
            </g>
          ))}
        </>
      ) : (
        <>
          <defs>
            <linearGradient id={\`\${id}-bar\`} x1="0" x2="0" y1="0" y2="1">
              <stop stopColor="var(--ad-secondary-200)" />
              <stop offset=".24" stopColor="var(--ad-red)" />
              <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: BARS }, (_, i) => (
            <rect
              key={i}
              data-bar
              x={4 + i * 6.75}
              y="40"
              width="2.8"
              height="100"
              rx="1.3"
              fill={\`url(#\${id}-bar)\`}
              opacity={0.55 + i / 55}
            />
          ))}
        </>
      )}
    </svg>
  );
}
`;export{n as default};
