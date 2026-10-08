const r=`import { useSvgId } from "../../../core/artwork";\r
import { type CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { ArtLayer } from "../layers";\r
\r
export interface DatabaseArtProps extends CommonProps {\r
  label?: string;\r
}\r
\r
const SPARKS = [\r
  [42, 84, 1, -1],\r
  [44, 111, 1, -2.7],\r
  [132, 143, 1, -0.6],\r
  [15, 135, 0.75, -2],\r
  [64, 151, 0.8, -3],\r
  [156, 147, 0.75, -1.5],\r
];\r
\r
/** Neon database cylinder: light orbits run along its rings, sparks twinkle around it. */\r
export function DatabaseArt({ label, ...p }: DatabaseArtProps) {\r
  const id = useSvgId();\r
  const ref = (name: string) => \`url(#\${id}-\${name})\`;\r
  const rings =\r
    "M39 83C39 106 134 106 134 83M39 108C39 132 134 132 134 108M39 133C39 155 134 155 134 133";\r
  const box = "0 0 170 179";\r
  // Paint order: aura, the cylinder (all of its blooms), the orbits, the hot spot on the lid,\r
  // then the sparks. Only the orbits repaint (three thin dashes); the rest is moved or faded.\r
  return (\r
    <div\r
      {...mark("DatabaseArt", p)}\r
      role={label ? "img" : undefined}\r
      aria-label={label}\r
      aria-hidden={!label}\r
    >\r
      <ArtLayer viewBox={box}>\r
        <defs>\r
          <filter id={\`\${id}-bloom\`} x="-50%" y="-50%" width="200%" height="200%">\r
            <feGaussianBlur stdDeviation="3" />\r
          </filter>\r
          <linearGradient id={\`\${id}-body\`}>\r
            <stop stopColor="var(--ad-primary-600)" />\r
            <stop offset=".12" stopColor="var(--ad-primary-800)" />\r
            <stop offset=".3" stopColor="var(--ad-primary-900)" />\r
            <stop offset=".72" stopColor="var(--ad-neutral-950)" />\r
            <stop offset="1" stopColor="var(--ad-primary-800)" />\r
          </linearGradient>\r
          <radialGradient id={\`\${id}-top\`} cx=".3" cy=".27" r=".9">\r
            <stop stopColor="var(--ad-primary-600)" />\r
            <stop offset=".23" stopColor="var(--ad-primary-800)" />\r
            <stop offset=".66" stopColor="var(--ad-neutral-900)" />\r
            <stop offset="1" stopColor="var(--ad-primary-900)" />\r
          </radialGradient>\r
          <linearGradient id={\`\${id}-edge\`}>\r
            <stop stopColor="var(--ad-neutral-200)" />\r
            <stop offset=".16" stopColor="var(--ad-secondary)" />\r
            <stop offset=".47" stopColor="var(--ad-primary-700)" />\r
            <stop offset=".8" stopColor="var(--ad-primary)" />\r
            <stop offset="1" stopColor="var(--ad-secondary-200)" />\r
          </linearGradient>\r
          <radialGradient id={\`\${id}-aura\`}>\r
            <stop stopColor="var(--ad-primary)" stopOpacity=".3" />\r
            <stop offset=".5" stopColor="var(--ad-primary)" stopOpacity=".12" />\r
            <stop offset="1" stopColor="var(--ad-primary)" stopOpacity="0" />\r
          </radialGradient>\r
          <g id={\`\${id}-spark\`}>\r
            <path d="M-7 0H7M0-8V8" stroke="var(--ad-secondary-200)" strokeWidth=".7" />\r
            <circle r="3.4" fill="var(--ad-primary)" filter={ref("bloom")} />\r
            <circle r="1.4" fill="var(--ad-neutral-200)" />\r
          </g>\r
        </defs>\r
      </ArtLayer>\r
      <ArtLayer viewBox={box} className="ad-art-aura-layer" origin={[85, 120]}>\r
        <ellipse cx="85" cy="120" rx="83" ry="71" fill={ref("aura")} />\r
      </ArtLayer>\r
      <ArtLayer viewBox={box}>\r
        <g transform="translate(0 2)">\r
          <path\r
            d="M39 57V133C39 156 134 156 134 133V57Z"\r
            fill={ref("body")}\r
            stroke="var(--ad-primary)"\r
            strokeWidth=".75"\r
          />\r
          <path\r
            d={rings}\r
            stroke="var(--ad-primary)"\r
            strokeWidth="3.5"\r
            opacity=".7"\r
            filter={ref("bloom")}\r
          />\r
          <path d={rings} stroke={ref("edge")} strokeWidth="1.4" />\r
          <ellipse\r
            cx="86.5"\r
            cy="57"\r
            rx="47.5"\r
            ry="17"\r
            fill={ref("top")}\r
            stroke="var(--ad-primary)"\r
            strokeWidth="1.1"\r
          />\r
          <ellipse\r
            cx="86.5"\r
            cy="57"\r
            rx="47.5"\r
            ry="17"\r
            stroke="var(--ad-primary)"\r
            strokeWidth="5"\r
            opacity=".75"\r
            filter={ref("bloom")}\r
          />\r
          <ellipse\r
            cx="86.5"\r
            cy="57"\r
            rx="42"\r
            ry="13.8"\r
            stroke={ref("edge")}\r
            strokeWidth=".5"\r
            opacity=".8"\r
          />\r
          {[81, 106, 132].map((cy) => (\r
            <ellipse\r
              key={cy}\r
              cx="86.5"\r
              cy={cy}\r
              rx="47.5"\r
              ry="17"\r
              stroke="var(--ad-primary)"\r
              strokeWidth=".7"\r
              opacity=".75"\r
            />\r
          ))}\r
        </g>\r
      </ArtLayer>\r
      <ArtLayer viewBox={box} className="ad-art-orbits">\r
        <g transform="translate(0 2)" stroke="var(--ad-neutral-200)" strokeWidth="1.45">\r
          {[57, 106, 132].map((cy, i) => (\r
            <ellipse\r
              key={cy}\r
              className="ad-art-orbit"\r
              cx="86.5"\r
              cy={cy}\r
              rx="47.5"\r
              ry="17"\r
              pathLength="100"\r
              style={{ animationDelay: \`\${-i * 1.3}s\` }}\r
            />\r
          ))}\r
        </g>\r
      </ArtLayer>\r
      <ArtLayer viewBox={box}>\r
        <g transform="translate(0 2)">\r
          <ellipse\r
            cx="86.5"\r
            cy="53.5"\r
            rx="5"\r
            ry="1.6"\r
            fill="var(--ad-primary)"\r
            filter={ref("bloom")}\r
          />\r
          <ellipse cx="86.5" cy="53.5" rx="3.4" ry=".8" fill="var(--ad-secondary-200)" />\r
        </g>\r
      </ArtLayer>\r
      {SPARKS.map(([x, y, scale, delay]) => (\r
        <ArtLayer\r
          key={\`\${x}-\${y}\`}\r
          viewBox={box}\r
          className="ad-art-spark-layer"\r
          origin={[x!, y!]}\r
          style={{ "--ad-delay": \`\${delay}s\` } as CSSProperties}\r
        >\r
          <use href={\`#\${id}-spark\`} transform={\`translate(\${x} \${y}) scale(\${scale})\`} />\r
        </ArtLayer>\r
      ))}\r
    </div>\r
  );\r
}\r
`;export{r as default};
