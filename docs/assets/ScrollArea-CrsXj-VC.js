const r=`import { useRef } from "react";\r
import { mark } from "../../../core/base";\r
import { useSmoothWheel } from "../../../core/motion/hooks";\r
import { type ScrollAreaProps } from "../shared";\r
\r
const scrollHeight = (height: number | string | undefined) =>\r
  typeof height === "number"\r
    ? \`calc(var(--ad-fluid-unit) * \${height})\`\r
    : (height ?? "clamp(10rem, 32dvh, 18rem)");\r
\r
export function ScrollArea(p: ScrollAreaProps) {\r
  const ref = useRef<HTMLDivElement>(null);\r
  useSmoothWheel(ref);\r
  return (\r
    <div\r
      {...mark("ScrollArea", p)}\r
      ref={ref}\r
      tabIndex={0}\r
      aria-label={p.label}\r
      style={{ maxHeight: scrollHeight(p.height), ...p.style }}\r
    >\r
      {p.children}\r
    </div>\r
  );\r
}\r
`;export{r as default};
