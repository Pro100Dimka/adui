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
          <stop stopColor="#9a1636" />
          <stop offset=".12" stopColor="#3b0313" />
          <stop offset=".3" stopColor="#19050d" />
          <stop offset=".72" stopColor="#090408" />
          <stop offset="1" stopColor="#5e071e" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx=".3" cy=".27" r=".9">
          <stop stopColor="#a72649" />
          <stop offset=".23" stopColor="#38111d" />
          <stop offset=".66" stopColor="#10040a" />
          <stop offset="1" stopColor="#290610" />
        </radialGradient>
        <linearGradient id={`${id}-edge`}>
          <stop stopColor="#fff1e9" />
          <stop offset=".16" stopColor="#ff6388" />
          <stop offset=".47" stopColor="#8b0730" />
          <stop offset=".8" stopColor="#ff285f" />
          <stop offset="1" stopColor="#ffabbc" />
        </linearGradient>
        <radialGradient id={`${id}-aura`}>
          <stop stopColor="#fd1746" stopOpacity=".3" />
          <stop offset=".5" stopColor="#ff083c" stopOpacity=".12" />
          <stop offset="1" stopColor="#ff083c" stopOpacity="0" />
        </radialGradient>
        <g id={`${id}-spark`}>
          <path d="M-7 0H7M0-8V8" stroke="#ffafbc" strokeWidth=".7" />
          <circle r="3.4" fill="#ff4264" filter={ref("bloom")} />
          <circle r="1.4" fill="#fff1eb" />
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
          stroke="#ff345b"
          strokeWidth=".75"
        />
        <path
          d={rings}
          stroke="#ff335d"
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
          stroke="#ff426b"
          strokeWidth="1.1"
        />
        <ellipse
          cx="86.5"
          cy="57"
          rx="47.5"
          ry="17"
          stroke="#ff2b57"
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
            stroke="#e4264f"
            strokeWidth=".7"
            opacity=".75"
          />
        ))}
        <g stroke="#ffe7ed" strokeWidth="1.45">
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
          fill="#ff577b"
          filter={ref("bloom")}
        />
        <ellipse cx="86.5" cy="53.5" rx="3.4" ry=".8" fill="#ffb5c3" />
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
