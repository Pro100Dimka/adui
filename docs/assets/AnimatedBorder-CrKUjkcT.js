const r=`import { createElement, useRef } from "react";\r
import type { ElementType, ReactNode } from "react";\r
import { mark, type CommonProps } from "../../../core/base";\r
import { useBorder } from "../../../core/motion/hooks";\r
\r
export interface AnimatedBorderProps extends CommonProps {\r
  as?: ElementType;\r
  children?: ReactNode;\r
  shell?: boolean;\r
  round?: boolean;\r
}\r
\r
export function AnimatedBorder({\r
  as = "div",\r
  shell = false,\r
  round = false,\r
  children,\r
  ...props\r
}: AnimatedBorderProps) {\r
  const ref = useRef<HTMLElement>(null);\r
  useBorder(ref, true, shell, round);\r
\r
  return createElement(\r
    as,\r
    {\r
      ...mark("AnimatedBorder", props),\r
      ref,\r
    },\r
    children,\r
  );\r
}\r
`;export{r as default};
