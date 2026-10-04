const e=`import { createElement, type ElementType } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
\r
export interface TiltProps extends CommonProps {\r
  as?: ElementType;\r
  /** Largest tilt in degrees. */\r
  max?: number;\r
  /** Show a glare that follows the pointer. */\r
  glare?: boolean;\r
}\r
\r
/** Leans toward the pointer in 3D, with a glossy glare, and springs back when left. */\r
export function Tilt({\r
  as = "div",\r
  max = 14,\r
  glare = true,\r
  children,\r
  ...p\r
}: TiltProps) {\r
  const set = (el: HTMLElement, x: number, y: number) => {\r
    el.style.setProperty("--ad-tilt-x", \`\${(-y * max).toFixed(2)}deg\`);\r
    el.style.setProperty("--ad-tilt-y", \`\${(x * max).toFixed(2)}deg\`);\r
    el.style.setProperty("--ad-glare-x", \`\${(x + 0.5) * 100}%\`);\r
    el.style.setProperty("--ad-glare-y", \`\${(y + 0.5) * 100}%\`);\r
  };\r
  return createElement(\r
    as,\r
    {\r
      ...mark("Tilt", p),\r
      "data-glare": glare || undefined,\r
      onPointerMove: (event: React.PointerEvent<HTMLElement>) => {\r
        const box = event.currentTarget.getBoundingClientRect();\r
        set(\r
          event.currentTarget,\r
          (event.clientX - box.left) / box.width - 0.5,\r
          (event.clientY - box.top) / box.height - 0.5,\r
        );\r
      },\r
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) =>\r
        set(event.currentTarget, 0, 0),\r
    },\r
    children,\r
  );\r
}\r
`;export{e as default};
