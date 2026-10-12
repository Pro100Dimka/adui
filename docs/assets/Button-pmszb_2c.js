const t=`import { forwardRef } from "react";\r
import { buttonView, type ButtonProps } from "../shared";\r
\r
export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(p, ref) {\r
  return buttonView({ ...p, ref });\r
});\r
`;export{t as default};
