const r=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface SparklesProps extends CommonProps {\r
  /** Number of sparks. */\r
  count?: number;\r
  /** Spark colour; defaults to a warm white. */\r
  color?: string;\r
}\r
\r
/** Twinkling four-point stars scattered around the content. */\r
export function Sparkles({\r
  count = 10,\r
  color,\r
  style,\r
  children,\r
  ...p\r
}: SparklesProps) {\r
  return (\r
    <span\r
      {...mark("Sparkles", p)}\r
      style={{ ...style, "--ad-sparkle": color } as CSSProperties}\r
    >\r
      {children}\r
      {Array.from({ length: count }, (_, i) => {\r
        // Golden-angle spread gives an even but irregular scatter without randomness.\r
        const angle = i * 137.5;\r
        const reach = 55 + ((i * 29) % 40);\r
        return (\r
          <svg\r
            key={i}\r
            className="ad-sparkle"\r
            viewBox="0 0 10 10"\r
            aria-hidden\r
            style={{\r
              left: \`\${50 + Math.cos((angle * Math.PI) / 180) * reach}%\`,\r
              top: \`\${50 + Math.sin((angle * Math.PI) / 180) * reach * 0.8}%\`,\r
              width: \`\${0.45 + ((i * 7) % 5) / 10}em\`,\r
              animationDelay: \`\${((i * 0.37) % 2.4).toFixed(2)}s\`,\r
            }}\r
          >\r
            <path d="M5 0C5.6 3.6 6.4 4.4 10 5C6.4 5.6 5.6 6.4 5 10C4.4 6.4 3.6 5.6 0 5C3.6 4.4 4.4 3.6 5 0Z" />\r
          </svg>\r
        );\r
      })}\r
    </span>\r
  );\r
}\r
`;export{r as default};
