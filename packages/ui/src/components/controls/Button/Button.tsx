import { forwardRef } from "react";
import { buttonView, type ButtonProps } from "../shared";

export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(p, ref) {
  return buttonView({ ...p, ref });
});
