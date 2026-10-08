const r=`import { useSvgId } from "../../../core/artwork";\r
\r
import { mark, type CommonProps } from "../../../core/base";\r
import { ArtLayer } from "../layers";\r
\r
export interface ServerArtProps extends CommonProps {\r
  /** Show an upload cloud above the rack (deployment scenes). */\r
  upload?: boolean;\r
  label?: string;\r
}\r
\r
/** Neon server rack: LEDs blink, a light runs along its edge, a spark twinkles above. */\r
export function ServerArt({ upload = false, label, ...p }: ServerArtProps) {\r
  const id = useSvgId();\r
  const url = (name: string) => \`url(#\${id}-\${name})\`;\r
  const box = "0 0 180 170";\r
  const lift = upload ? "translate(0 15)" : undefined;\r
  const dy = upload ? 15 : 0;\r
  // Paint order: cloud, aura, the rack (all of its blooms), the LEDs and the running light,\r
  // the two status dots, the spark. Only the LEDs and the running light repaint (thin lines,\r
  // no filter); everything else is moved or faded as a layer of its own.\r
  return (\r
    <div\r
      {...mark("ServerArt", p)}\r
      role={label ? "img" : undefined}\r
      aria-label={label}\r
      aria-hidden={!label}\r
    >\r
      <ArtLayer viewBox={box}>\r
        <defs>\r
          <linearGradient id={\`\${id}-front\`} x1="0" y1="0" x2="1" y2="1">\r
            <stop stopColor="var(--ad-primary-700)" />\r
            <stop offset=".22" stopColor="var(--ad-primary-900)" />\r
            <stop offset=".72" stopColor="var(--ad-neutral-900)" />\r
            <stop offset="1" stopColor="var(--ad-primary-800)" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-side\`} x1="0" y1="0" x2=".9" y2="1">\r
            <stop stopColor="var(--ad-primary-800)" />\r
            <stop offset=".27" stopColor="var(--ad-primary-900)" />\r
            <stop offset="1" stopColor="var(--ad-neutral-950)" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-top\`} x1="0" y1="0" x2=".7" y2="1">\r
            <stop stopColor="var(--ad-secondary-200)" />\r
            <stop offset=".23" stopColor="var(--ad-primary-600)" />\r
            <stop offset=".57" stopColor="var(--ad-primary-800)" />\r
            <stop offset="1" stopColor="var(--ad-neutral-900)" />\r
          </linearGradient>\r
          <linearGradient id={\`\${id}-edge\`} x1="0" y1="0" x2="1" y2="1">\r
            <stop stopColor="var(--ad-secondary-200)" />\r
            <stop offset=".29" stopColor="var(--ad-primary)" />\r
            <stop offset=".52" stopColor="var(--ad-primary-700)" />\r
            <stop offset=".8" stopColor="var(--ad-primary)" />\r
            <stop offset="1" stopColor="var(--ad-primary-700)" />\r
          </linearGradient>\r
          <radialGradient id={\`\${id}-aura\`}>\r
            <stop stopColor="var(--ad-primary)" stopOpacity=".28" />\r
            <stop offset=".6" stopColor="var(--ad-primary)" stopOpacity=".06" />\r
            <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />\r
          </radialGradient>\r
          <filter id={\`\${id}-bloom\`} x="-35%" y="-35%" width="170%" height="170%">\r
            <feGaussianBlur stdDeviation="2.4" />\r
          </filter>\r
        </defs>\r
      </ArtLayer>\r
      {upload && (\r
        <ArtLayer viewBox={box} className="ad-server-cloud">\r
          <path\r
            d="M57 40C37 42 40 16 58 20 63-5 96-4 102 18 120 13 132 32 117 42Z"\r
            fill="var(--ad-primary-900)"\r
            stroke="var(--ad-secondary)"\r
            strokeOpacity=".65"\r
            strokeWidth=".7"\r
          />\r
          <path d="M80 37V18m-7 7 7-7 7 7" stroke="var(--ad-secondary)" strokeWidth="1.5" />\r
        </ArtLayer>\r
      )}\r
      <ArtLayer viewBox={box} className="ad-art-aura-layer" origin={[89, 124 + dy]}>\r
        <ellipse cx="89" cy={124 + dy} rx="76" ry="22" fill={url("aura")} />\r
      </ArtLayer>\r
      <ArtLayer viewBox={box}>\r
        <g transform={lift}>\r
          <path\r
            d="M26 43 98 29 150 45 75 61Z"\r
            fill={url("top")}\r
            stroke={url("edge")}\r
            strokeWidth=".75"\r
          />\r
          <path\r
            d="M98 29 150 45 150 119 98 107Z"\r
            fill={url("side")}\r
            stroke="var(--ad-primary-700)"\r
            strokeWidth=".7"\r
          />\r
          <path\r
            d="M26 43 98 29 98 107 26 121Z"\r
            fill={url("front")}\r
            stroke={url("edge")}\r
            strokeWidth="1"\r
          />\r
          <path\r
            d="M29 46 94 33 94 105 29 117Z"\r
            fill="var(--ad-neutral-900)"\r
            stroke="var(--ad-primary-600)"\r
            strokeOpacity=".45"\r
            strokeWidth=".65"\r
          />\r
          {Array.from({ length: 15 }, (_, row) => (\r
            <g key={row}>\r
              <path\r
                d={\`M33 \${50 + row * 3.35} 90 \${38.8 + row * 3.35}\`}\r
                stroke="var(--ad-primary-700)"\r
                strokeOpacity=".58"\r
              />\r
              {Array.from({ length: 9 }, (__, col) => (\r
                <path\r
                  key={col}\r
                  d={\`M\${34 + col * 6.15} \${49.8 + row * 3.35 - col * 1.205}l2.6-.51\`}\r
                  stroke="var(--ad-neutral-950)"\r
                  strokeWidth="1.65"\r
                />\r
              ))}\r
            </g>\r
          ))}\r
          <path\r
            d="M27 44 98 30 147 45"\r
            stroke="var(--ad-secondary-200)"\r
            strokeWidth="3"\r
            opacity=".35"\r
            filter={url("bloom")}\r
          />\r
          <path d="M27 44 98 30 147 45" stroke="var(--ad-secondary-200)" strokeWidth=".75" />\r
          {Array.from({ length: 8 }, (_, i) => (\r
            <path\r
              key={i}\r
              d={\`M107 \${52 + i * 7.5}l34 9v4l-34-9Z\`}\r
              fill="var(--ad-neutral-950)"\r
              stroke="var(--ad-primary-800)"\r
              strokeWidth=".55"\r
            />\r
          ))}\r
          <path\r
            d="M31 108 93 96v8l-62 12Z"\r
            fill="var(--ad-primary-900)"\r
            stroke="var(--ad-primary-700)"\r
            strokeWidth=".55"\r
          />\r
          <path\r
            d="M26 125 98 112 150 126v14l-73 10-51-10Z"\r
            fill={url("side")}\r
            stroke="var(--ad-primary-700)"\r
            strokeWidth=".6"\r
          />\r
          <path\r
            d="M26 125 98 112v15l-72 13Z"\r
            fill={url("front")}\r
            stroke="var(--ad-primary-600)"\r
            strokeWidth=".65"\r
          />\r
          <path\r
            d="M33 130 83 121m-50 13 41-7"\r
            stroke="var(--ad-primary-700)"\r
            strokeWidth=".8"\r
          />\r
        </g>\r
      </ArtLayer>\r
      <ArtLayer viewBox={box}>\r
        <g transform={lift}>\r
          {Array.from({ length: 8 }, (_, i) => (\r
            <path\r
              key={i}\r
              d={\`M109 \${54 + i * 7.5}l3 .8\`}\r
              className="ad-server-led"\r
              strokeWidth="1.4"\r
              style={{ animationDelay: \`\${-i * 0.34}s\` }}\r
            />\r
          ))}\r
          <path d="M35 110l20-4" className="ad-server-glow" strokeWidth="1.1" />\r
          <path\r
            d="M27 43 98 29 98 107 27 121Z"\r
            pathLength="100"\r
            className="ad-server-orbit"\r
          />\r
        </g>\r
      </ArtLayer>\r
      {[[85, 103.5, 1.5, 0], [91, 121.5, 1.3, -1.7]].map(([cx, cy, r, delay]) => (\r
        <ArtLayer key={cx} viewBox={box} className="ad-server-dot" style={{ animationDelay: \`\${delay}s\` }}>\r
          <circle cx={cx} cy={cy! + dy} r={r} />\r
        </ArtLayer>\r
      ))}\r
      <ArtLayer viewBox={box} className="ad-art-spark-layer" origin={[121, 27]}>\r
        <path d="M114 27h14m-7-10v20" stroke="var(--ad-secondary-100)" strokeWidth=".65" />\r
        <circle cx="121" cy="27" r="2.6" fill="var(--ad-neutral-200)" />\r
      </ArtLayer>\r
    </div>\r
  );\r
}\r
`;export{r as default};
