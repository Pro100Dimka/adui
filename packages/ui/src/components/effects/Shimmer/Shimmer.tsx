import { tr } from "../../../core/i18n";
import { mark, type CommonProps } from "../../../core/base";

export interface ShimmerProps extends CommonProps {
  /** Text lines to imitate. */
  lines?: number;
  /** Add a round placeholder, e.g. for an avatar. */
  circle?: boolean;
  label?: string;
}

/** Loading placeholder: the shape of the coming content with a light running over it. */
export function Shimmer({
  lines = 3,
  circle = false,
  label = tr("Загрузка"),
  ...p
}: ShimmerProps) {
  return (
    <div
      {...mark("Shimmer", p)}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      {circle && <i className="ad-shimmer-circle" />}
      <span className="ad-shimmer-lines">
        {Array.from({ length: lines }, (_, i) => (
          <i
            key={i}
            style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
          />
        ))}
      </span>
    </div>
  );
}
