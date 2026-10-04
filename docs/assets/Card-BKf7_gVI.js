const r=`import React, { createElement, useRef } from "react";\r
import { mark } from "../../../core/base";\r
import { useBorder } from "../../../core/motion/hooks";\r
import { Header } from "../Header/Header";\r
import type { CardProps } from "../shared";\r
export const Card = ({\r
  as = "section",\r
  border = false,\r
  shell = false,\r
  padding = "md",\r
  title,\r
  description,\r
  eyebrow,\r
  icon,\r
  actions,\r
  level = 3,\r
  children,\r
  ...p\r
}: CardProps) => {\r
  const ref = useRef<HTMLElement>(null);\r
  useBorder(ref, border, shell);\r
  return createElement(\r
    as,\r
    {\r
      ...mark(\r
        "Card",\r
        p,\r
        p.material ?? (shell ? "shell" : "card"),\r
        "ad-surface",\r
      ),\r
      ref,\r
      "data-ad-padding": padding,\r
      // A soft light follows the pointer across the surface.\r
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
    title && (\r
      <Header\r
        level={level as 1 | 2 | 3 | 4}\r
        title={title}\r
        description={description}\r
        eyebrow={eyebrow}\r
        icon={icon}\r
        actions={actions}\r
        compact={level > 2}\r
      />\r
    ),\r
    children,\r
  );\r
};\r
`;export{r as default};
