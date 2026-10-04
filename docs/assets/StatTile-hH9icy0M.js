const n=`import type { ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Typography } from "../../foundation/Typography/Typography";
import { Tilt } from "../../effects/Tilt/Tilt";
import { Card } from "../Card/Card";
import { Icon } from "../Icon/Icon";

export interface StatTileProps extends CommonProps {
  /** Icon in the glowing ring. */
  icon?: string;
  /** The headline number or short value. */
  value: ReactNode;
  /** What the value counts. */
  label: ReactNode;
  /** Makes the whole tile a button, e.g. to open the list behind the number. */
  onClick?: () => void;
  /** Lean toward the pointer with a glare. */
  tilt?: boolean;
  /** A count bubble on the corner, e.g. new requests waiting. */
  badge?: ReactNode;
  /** Name of the badge for screen readers. */
  badgeLabel?: string;
}

/** A headline number: an icon in a glowing ring with a spark, the value large, its label below. */
export function StatTile({ icon = "music", value, label, onClick, tilt = true, badge, badgeLabel, ...p }: StatTileProps) {
  const card = (
    <Card border padding="sm" className="ad-stat-tile-card">
      <span className="ad-stat-tile-icon" aria-hidden="true">
        <Icon name={icon} />
        <Icon name="sparkle" className="ad-stat-tile-spark" />
      </span>
      <span className="ad-stat-tile-text">
        <Typography as="strong" variant="h2">{value}</Typography>
        <Typography variant="body-sm" tone="muted">{label}</Typography>
      </span>
    </Card>
  );
  const body = (
    <>
      {tilt ? <Tilt max={8}>{card}</Tilt> : card}
      {badge !== undefined && badge !== null && <span className="ad-stat-tile-badge" aria-label={badgeLabel}>{badge}</span>}
    </>
  );
  return onClick ? (
    <button type="button" {...mark("StatTile", p)} onClick={onClick}>{body}</button>
  ) : (
    <div {...mark("StatTile", p)}>{body}</div>
  );
}
`;export{n as default};
