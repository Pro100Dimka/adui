const r=`import { createElement } from "react";\r
import { mark } from "../../../core/base";\r
import { type TextProps } from "../shared";\r
\r
export const Text = ({ as = "span", ...p }: TextProps) =>\r
  createElement(\r
    as,\r
    { ...mark("Text", p), "data-ad-variant": p.variant },\r
    p.children ?? p.text,\r
  );\r
`;export{r as default};
