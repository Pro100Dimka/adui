const e=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface MarqueeProps extends CommonProps {\r
  /** Seconds for one full loop. */\r
  duration?: number;\r
  /** Scroll to the right instead of the left. */\r
  reverse?: boolean;\r
}\r
\r
/** Endless ticker with faded edges; pauses while hovered so it can be read. */\r
export function Marquee({\r
  duration = 20,\r
  reverse = false,\r
  style,\r
  children,\r
  ...p\r
}: MarqueeProps) {\r
  return (\r
    <div\r
      {...mark("Marquee", p)}\r
      style={{ ...style, "--ad-marquee-time": \`\${duration}s\` } as CSSProperties}\r
      data-reverse={reverse || undefined}\r
    >\r
      {/* Two copies make the loop seamless; the second one is hidden from assistive tech. */}\r
      <div className="ad-marquee-track">\r
        <div className="ad-marquee-group">{children}</div>\r
        <div className="ad-marquee-group" aria-hidden>\r
          {children}\r
        </div>\r
      </div>\r
    </div>\r
  );\r
}\r
`;export{e as default};
