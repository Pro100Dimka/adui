const r=`import { mark } from "../../../core/base";\r
import { type DividerProps } from "../shared";\r
\r
export const Divider = (p: DividerProps) => (\r
  <div\r
    {...mark("Divider", p)}\r
    role="separator"\r
    aria-orientation={p.vertical ? "vertical" : "horizontal"}\r
  />\r
);\r
`;export{r as default};
