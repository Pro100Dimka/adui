import { useId } from "react";
import { mark, type CommonProps } from "../../../core/base";

export interface ServerArtProps extends CommonProps {
  /** Show an upload cloud above the rack (deployment scenes). */
  upload?: boolean;
  label?: string;
}

/** Neon server rack: LEDs blink, a light runs along its edge, a spark twinkles above. */
export function ServerArt({ upload = false, label, ...p }: ServerArtProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const url = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      {...mark("ServerArt", p)}
      viewBox="0 0 180 170"
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
    >
      <defs>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#592034" />
          <stop offset=".22" stopColor="#1b0611" />
          <stop offset=".72" stopColor="#0d040b" />
          <stop offset="1" stopColor="#360a1d" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2=".9" y2="1">
          <stop stopColor="#481023" />
          <stop offset=".27" stopColor="#14040d" />
          <stop offset="1" stopColor="#020208" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor="#ffa0c2" />
          <stop offset=".23" stopColor="#b1375f" />
          <stop offset=".57" stopColor="#481029" />
          <stop offset="1" stopColor="#16060f" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffb0d3" />
          <stop offset=".29" stopColor="#c94367" />
          <stop offset=".52" stopColor="#6d1530" />
          <stop offset=".8" stopColor="#fc2451" />
          <stop offset="1" stopColor="#79213a" />
        </linearGradient>
        <radialGradient id={`${id}-aura`}>
          <stop stopColor="#ff234d" stopOpacity=".28" />
          <stop offset=".6" stopColor="#ff1238" stopOpacity=".06" />
          <stop offset="1" stopColor="#ff1238" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-bloom`} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      {upload && (
        <g className="ad-server-cloud">
          <path
            d="M57 40C37 42 40 16 58 20 63-5 96-4 102 18 120 13 132 32 117 42Z"
            fill="#260815"
            stroke="#ff7a9b"
            strokeOpacity=".65"
            strokeWidth=".7"
          />
          <path d="M80 37V18m-7 7 7-7 7 7" stroke="#ed6b91" strokeWidth="1.5" />
        </g>
      )}
      <g transform={upload ? "translate(0 15)" : undefined}>
        <ellipse
          cx="89"
          cy="124"
          rx="76"
          ry="22"
          fill={url("aura")}
          className="ad-art-aura"
        />
        <path
          d="M26 43 98 29 150 45 75 61Z"
          fill={url("top")}
          stroke={url("edge")}
          strokeWidth=".75"
        />
        <path
          d="M98 29 150 45 150 119 98 107Z"
          fill={url("side")}
          stroke="#741932"
          strokeWidth=".7"
        />
        <path
          d="M26 43 98 29 98 107 26 121Z"
          fill={url("front")}
          stroke={url("edge")}
          strokeWidth="1"
        />
        <path
          d="M29 46 94 33 94 105 29 117Z"
          fill="#0d050d"
          stroke="#9d3654"
          strokeOpacity=".45"
          strokeWidth=".65"
        />
        {Array.from({ length: 15 }, (_, row) => (
          <g key={row}>
            <path
              d={`M33 ${50 + row * 3.35} 90 ${38.8 + row * 3.35}`}
              stroke="#7e2844"
              strokeOpacity=".58"
            />
            {Array.from({ length: 9 }, (__, col) => (
              <path
                key={col}
                d={`M${34 + col * 6.15} ${49.8 + row * 3.35 - col * 1.205}l2.6-.51`}
                stroke="#01040a"
                strokeWidth="1.65"
              />
            ))}
          </g>
        ))}
        <path
          d="M27 44 98 30 147 45"
          stroke="#ffc0d5"
          strokeWidth="3"
          opacity=".35"
          filter={url("bloom")}
        />
        <path d="M27 44 98 30 147 45" stroke="#ffc0d5" strokeWidth=".75" />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <path
              d={`M107 ${52 + i * 7.5}l34 9v4l-34-9Z`}
              fill="#040309"
              stroke="#34101f"
              strokeWidth=".55"
            />
            <path
              d={`M109 ${54 + i * 7.5}l3 .8`}
              className="ad-server-led"
              strokeWidth="1.4"
              style={{ animationDelay: `${-i * 0.34}s` }}
            />
          </g>
        ))}
        <path
          d="M31 108 93 96v8l-62 12Z"
          fill="#17050e"
          stroke="#5b1a2b"
          strokeWidth=".55"
        />
        <path d="M35 110l20-4" className="ad-server-glow" strokeWidth="1.1" />
        <circle cx="85" cy="103.5" r="1.5" className="ad-server-dot" />
        <path
          d="M27 43 98 29 98 107 27 121Z"
          pathLength="100"
          className="ad-server-orbit"
        />
        <path
          d="M26 125 98 112 150 126v14l-73 10-51-10Z"
          fill={url("side")}
          stroke="#65142f"
          strokeWidth=".6"
        />
        <path
          d="M26 125 98 112v15l-72 13Z"
          fill={url("front")}
          stroke="#9d2f4a"
          strokeWidth=".65"
        />
        <path
          d="M33 130 83 121m-50 13 41-7"
          stroke="#78273f"
          strokeWidth=".8"
        />
        <circle
          cx="91"
          cy="121.5"
          r="1.3"
          className="ad-server-dot"
          style={{ animationDelay: "-1.7s" }}
        />
      </g>
      <g className="ad-art-spark">
        <path d="M114 27h14m-7-10v20" stroke="#ffc6d5" strokeWidth=".65" />
        <circle cx="121" cy="27" r="2.6" fill="#fff6eb" />
      </g>
    </svg>
  );
}
