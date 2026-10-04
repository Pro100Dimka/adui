const a=`import { mark } from "../../../core/base";
import { type BadgeProps } from "../shared";

/** A tone adds a live status dot in front of the label. */
export const Badge = (p: BadgeProps) => (
  <span {...mark("Badge", p)}>
    {p.tone && <i className="ad-badge-dot" aria-hidden />}
    {p.children ?? p.label ?? "GPU"}
  </span>
);
`;export{a as default};
