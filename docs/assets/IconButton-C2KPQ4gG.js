const n=`import { buttonView, type IconButtonProps } from "../shared";\r
\r
export const IconButton = (p: IconButtonProps) =>\r
  buttonView(\r
    {\r
      ...p,\r
      icon: p.icon ?? "more",\r
      children: p.children ?? null,\r
      label: undefined,\r
      "aria-label": p.label,\r
      title: p.title ?? p.label,\r
    },\r
    "IconButton",\r
  );\r
`;export{n as default};
