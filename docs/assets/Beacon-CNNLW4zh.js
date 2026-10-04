const r=`import type { CSSProperties } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface BeaconProps extends CommonProps {\r
  /** Rings run only while active. */\r
  active?: boolean;\r
  /** Ring colour; defaults to the theme accent. */\r
  color?: string;\r
}\r
\r
/** Radar rings spreading from behind the content, to draw attention to it. */\r
export function Beacon({\r
  active = true,\r
  color,\r
  style,\r
  children,\r
  ...p\r
}: BeaconProps) {\r
  return (\r
    <span\r
      {...mark("Beacon", p)}\r
      style={{ ...style, "--ad-beacon": color } as CSSProperties}\r
      data-active={active || undefined}\r
    >\r
      <i aria-hidden />\r
      <i aria-hidden />\r
      <i aria-hidden />\r
      {children}\r
    </span>\r
  );\r
}\r
`;export{r as default};
