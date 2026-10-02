import { useRef } from "react";
import { assignRef } from "../../../core/base";
import { useTabShape } from "../../../core/motion/hooks";
import { buttonView, type TabProps } from "../shared";

export const Tab = ({
  selected = false,
  panelId,
  ref: externalRef,
  ...p
}: TabProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  useTabShape(ref);
  return buttonView(
    {
      ...p,
      className: `ad-button ad-tab ${p.className ?? ""}`,
      variant: "ghost",
      role: "tab",
      "aria-selected": selected,
      "aria-controls": panelId,
      tabIndex: selected ? 0 : -1,
      ref: (n) => {
        ref.current = n;
        assignRef(externalRef, n);
      },
    },
    "Tab",
  );
};
