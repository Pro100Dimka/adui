import { mark } from "../../../core/base";
import { type DividerProps } from "../shared";

export const Divider = (p: DividerProps) => (
  <div
    {...mark("Divider", p)}
    role="separator"
    aria-orientation={p.vertical ? "vertical" : "horizontal"}
  />
);
