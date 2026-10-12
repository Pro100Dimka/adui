const n=`import { forwardRef } from "react";\r
import { buttonView, type IconButtonProps } from "../shared";\r
\r
export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(p, ref) {\r
  return buttonView(\r
    {\r
      ...p,\r
      ref,\r
      icon: p.icon ?? "more",\r
      children: p.children ?? null,\r
      label: undefined,\r
      "aria-label": p.label,\r
      title: p.title ?? p.label,\r
    },\r
    "IconButton",\r
  );\r
});\r
`;export{n as default};
