import { forwardRef } from "react";
import { buttonView, type IconButtonProps } from "../shared";

export const IconButton = /* @__PURE__ */ forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(p, ref) {
  return buttonView(
    {
      ...p,
      ref,
      icon: p.icon ?? "more",
      children: p.children ?? null,
      label: undefined,
      "aria-label": p.label,
      title: p.title ?? p.label,
    },
    "IconButton",
  );
});
