import { mark } from "../../../core/base";
import { type BadgeProps } from "../shared";

export const Badge = (p: BadgeProps) => (
  <span {...mark("Badge", p)}>{p.children ?? p.label ?? "GPU"}</span>
);
