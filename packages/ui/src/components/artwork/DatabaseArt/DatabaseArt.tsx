import { useSvgId } from "../../../core/artwork";
import { type CSSProperties } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface DatabaseArtProps extends CommonProps {
  label?: string;
}

const SPARKS = [
  [42, 84, 1, -1],
  [44, 111, 1, -2.7],
  [132, 143, 1, -0.6],
  [15, 135, 0.75, -2],
  [64, 151, 0.8, -3],
  [156, 147, 0.75, -1.5],
];

/** Neon database cylinder: light orbits run along its rings, sparks twinkle around it. */
export function DatabaseArt({ label, ...p }: DatabaseArtProps) {
  const id = useSvgId();
  const ref = (name: string) => `url(#${id}-${name})`;
  const rings =
    "M39 83C39 106 134 106 134 83M39 108C39 132 134 132 134 108M39 133C39 155 134 155 134 133";
  return (
    <svg
      {...mark("DatabaseArt", p)}
      viewBox="0 0 170 179"
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <defs>
        <filter id={`${id}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id={`${id}-body`}>
          <stop stopColor="var(--ad-primary-600)" />
          <stop offset=".12" stopColor="var(--ad-primary-800)" />
          <stop offset=".3" stopColor="var(--ad-primary-900)" />
          <stop offset=".72" stopColor="var(--ad-neutral-950)" />
          <stop offset="1" stopColor="var(--ad-primary-800)" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx=".3" cy=".27" r=".9">
          <stop stopColor="var(--ad-primary-600)" />
          <stop offset=".23" stopColor="var(--ad-primary-800)" />
          <stop offset=".66" stopColor="var(--ad-neutral-900)" />
          <stop offset="1" stopColor="var(--ad-primary-900)" />
        </radialGradient>
        <linearGradient id={`${id}-edge`}>
          <stop stopColor="var(--ad-neutral-200)" />
          <stop offset=".16" stopColor="var(--ad-secondary)" />
          <stop offset=".47" stopColor="var(--ad-primary-700)" />
          <stop offset=".8" stopColor="var(--ad-primary)" />
          <stop offset="1" stopColor="var(--ad-secondary-200)" />
        </linearGradient>
        <radialGradient id={`${id}-aura`}>
          <stop stopColor="var(--ad-primary)" stopOpacity=".3" />
          <stop offset=".5" stopColor="var(--ad-primary)" stopOpacity=".12" />
          <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />
        </radialGradient>
        <g id={`${id}-spark`}>
          <path d="M-7 0H7M0-8V8" stroke="var(--ad-secondary-200)" strokeWidth=".7" />
          <circle r="3.4" fill="var(--ad-primary)" filter={ref("bloom")} />
          <circle r="1.4" fill="var(--ad-neutral-200)" />
        </g>
      </defs>
      <ellipse
        cx="85"
        cy="120"
        rx="83"
        ry="71"
        fill={ref("aura")}
        className="ad-art-aura"
      />
      <g transform="translate(0 2)">
        <path
          d="M39 57V133C39 156 134 156 134 133V57Z"
          fill={ref("body")}
          stroke="var(--ad-primary)"
          strokeWidth=".75"
        />
        <path
          d={rings}
          stroke="var(--ad-primary)"
          strokeWidth="3.5"
          opacity=".7"
          filter={ref("bloom")}
        />
        <path d={rings} stroke={ref("edge")} strokeWidth="1.4" />
        <ellipse
          cx="86.5"
          cy="57"
          rx="47.5"
          ry="17"
          fill={ref("top")}
          stroke="var(--ad-primary)"
          strokeWidth="1.1"
        />
        <ellipse
          cx="86.5"
          cy="57"
          rx="47.5"
          ry="17"
          stroke="var(--ad-primary)"
          strokeWidth="5"
          opacity=".75"
          filter={ref("bloom")}
        />
        <ellipse
          cx="86.5"
          cy="57"
          rx="42"
          ry="13.8"
          stroke={ref("edge")}
          strokeWidth=".5"
          opacity=".8"
        />
        {[81, 106, 132].map((cy) => (
          <ellipse
            key={cy}
            cx="86.5"
            cy={cy}
            rx="47.5"
            ry="17"
            stroke="var(--ad-primary)"
            strokeWidth=".7"
            opacity=".75"
          />
        ))}
        <g stroke="var(--ad-neutral-200)" strokeWidth="1.45">
          {[57, 106, 132].map((cy, i) => (
            <ellipse
              key={cy}
              className="ad-art-orbit"
              cx="86.5"
              cy={cy}
              rx="47.5"
              ry="17"
              pathLength="100"
              style={{ animationDelay: `${-i * 1.3}s` }}
            />
          ))}
        </g>
        <ellipse
          cx="86.5"
          cy="53.5"
          rx="5"
          ry="1.6"
          fill="var(--ad-primary)"
          filter={ref("bloom")}
        />
        <ellipse cx="86.5" cy="53.5" rx="3.4" ry=".8" fill="var(--ad-secondary-200)" />
      </g>
      {SPARKS.map(([x, y, scale, delay]) => (
        <g
          key={`${x}-${y}`}
          className="ad-art-spark"
          style={{ "--ad-delay": `${delay}s` } as CSSProperties}
        >
          <use
            href={`#${id}-spark`}
            transform={`translate(${x} ${y}) scale(${scale})`}
          />
        </g>
      ))}
    </svg>
  );
}
