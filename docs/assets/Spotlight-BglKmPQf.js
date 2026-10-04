const r=`import { createElement, type ElementType } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface SpotlightProps extends CommonProps {\r
  as?: ElementType;\r
  /** Light colour; defaults to the theme accent. */\r
  color?: string;\r
  /** Radius of the light circle, any CSS length. */\r
  radius?: string;\r
}\r
\r
/** A light that follows the pointer across the surface and lights the edge nearest to it. */\r
export function Spotlight({\r
  as = "div",\r
  color,\r
  radius,\r
  style,\r
  children,\r
  ...p\r
}: SpotlightProps) {\r
  return createElement(\r
    as,\r
    {\r
      ...mark("Spotlight", p),\r
      style: { ...style, "--ad-spot-color": color, "--ad-spot-r": radius },\r
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {\r
        const box = event.currentTarget.getBoundingClientRect();\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-x",\r
          \`\${event.clientX - box.left}px\`,\r
        );\r
        event.currentTarget.style.setProperty(\r
          "--ad-spot-y",\r
          \`\${event.clientY - box.top}px\`,\r
        );\r
      },\r
    },\r
    children,\r
  );\r
}\r
`;export{r as default};
