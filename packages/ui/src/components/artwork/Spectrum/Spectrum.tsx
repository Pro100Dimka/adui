import { useSvgId } from "../../../core/artwork";
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

/** Halo layers of a bar as [extra width on each side, opacity], widest first: a soft glow
 * without a filter, so moving bars never have to be re-blurred. */
const HALO = [[2, 0.12], [1, 0.3]] as const;

const columnHeight = (i: number, time: number) =>
  12 + (Math.abs(i - 13) / 13) * (37 + (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.59)) ** 1.7 * 142);

const barHeight = (i: number, time: number) => {
  const envelope = Math.exp(-(((i - 16) / 6) ** 2));
  const rhythm = 0.55 + 0.45 * Math.sin(time * 1.7 + i * 0.61);
  return 9 + 100 * envelope * (0.53 + 0.47 * rhythm) + 15 * Math.sin(i * 0.67 + time * 0.58) ** 2;
};

/** A living audio spectrum used as decoration behind level and monitoring panels. */
export function Spectrum({ variant = "segmented", ...p }: SpectrumProps) {
  return variant === "segmented" ? <Segmented {...p} /> : <Bars {...p} />;
}

/**
 * Level columns. Each column's rows are drawn once; a window slides up and down over them
 * (the window moves one way, the rows inside it the other way, so they stay in place).
 * Both are transforms of their own layers: a moving column costs no repaint.
 */
function Segmented(p: CommonProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    ref.current?.querySelectorAll<HTMLElement>(".ad-spectrum-column").forEach((column, i) => {
      const hidden = ((232 - columnHeight(i, time)) / 232) * 100;
      column.style.transform = `translateY(${hidden.toFixed(2)}%)`;
      (column.firstElementChild as HTMLElement | null)?.style.setProperty("transform", `translateY(${(-hidden).toFixed(2)}%)`);
    });
  });
  return (
    <div {...mark("Spectrum", p)} ref={ref} data-variant="segmented" aria-hidden="true">
      {Array.from({ length: COLUMNS }, (_, i) => (
        <span
          key={i}
          className="ad-spectrum-column"
          style={{ left: `${((i * 12 + 3) / 325) * 100}%`, width: `${(8 / 325) * 100}%` }}
        >
          <svg viewBox="0 0 8 232" preserveAspectRatio="none">
            {Array.from({ length: ROWS }, (__, row) => (
              <rect key={row} y={224 - row * 7} width="8" height="5" rx=".35" opacity={0.17 + row / 35} />
            ))}
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Smooth glowing bars in a bell shape; the glow is two faint wider bars behind each one. */
function Bars(p: CommonProps) {
  const ref = useRef<SVGSVGElement>(null);
  const id = useSvgId();
  usePauseOffscreen(ref);
  useDecoration(ref, (time) => {
    ref.current?.querySelectorAll<SVGGElement>("[data-bar]").forEach((bar, i) => {
      const height = barHeight(i, time);
      bar.querySelectorAll<SVGRectElement>("rect").forEach((rect) => {
        const grow = Number(rect.dataset.grow ?? 0);
        rect.setAttribute("y", (134 - height - grow).toFixed(2));
        rect.setAttribute("height", (height + grow).toFixed(2));
      });
    });
  });
  return (
    <svg
      {...mark("Spectrum", p)}
      ref={ref}
      data-variant="bars"
      viewBox="0 0 163 140"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bar`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="var(--ad-secondary-200)" />
          <stop offset=".24" stopColor="var(--ad-red)" />
          <stop offset="1" stopColor="var(--ad-primary-600)" stopOpacity="0" />
        </linearGradient>
        {/* The halo follows the bar's own fade, like the shadow of the bar did. */}
        <linearGradient id={`${id}-halo`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="var(--ad-red)" stopOpacity=".6" />
          <stop offset=".24" stopColor="var(--ad-red)" stopOpacity=".6" />
          <stop offset="1" stopColor="var(--ad-red)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: BARS }, (_, i) => {
        const x = 4 + i * 6.75;
        const opacity = 0.55 + i / 55;
        return (
          <g key={i} data-bar>
            {HALO.map(([grow, halo]) => (
              <rect
                key={grow}
                data-grow={grow}
                x={x - grow}
                y="40"
                width={2.8 + grow * 2}
                height="100"
                rx={1.3 + grow}
                fill={`url(#${id}-halo)`}
                opacity={halo * opacity}
              />
            ))}
            <rect x={x} y="40" width="2.8" height="100" rx="1.3" fill={`url(#${id}-bar)`} opacity={opacity} />
          </g>
        );
      })}
    </svg>
  );
}
