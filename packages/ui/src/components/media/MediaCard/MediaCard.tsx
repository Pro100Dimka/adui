import type { ReactNode } from "react";
import { mark, type CommonProps } from "../../../core/base";
import { Typography } from "../../foundation/Typography/Typography";
import { Equalizer } from "../../effects/Equalizer/Equalizer";
import { Tilt } from "../../effects/Tilt/Tilt";
import { Card } from "../../layout/Card/Card";

export interface MediaCardProps extends CommonProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Cover picture; without it an equalizer dances behind the card. */
  image?: string;
  /** Bar heights 0–1 from a live spectrum for the equalizer cover; without them it bounces on its own. */
  levels?: readonly number[];
  /** Shifts the equalizer's bounce so neighbouring cards do not move in step. */
  phase?: number;
  /** A status mark in the top corner. */
  badge?: ReactNode;
  /** Round buttons in the glass pill at the bottom. */
  actions?: ReactNode;
  /** Lean toward the pointer with a glossy glare; a number sets the largest lean in degrees. */
  tilt?: boolean | number;
}

/**
 * A song, album or take as a card: its cover (or a dancing equalizer) fills the card, the title and
 * a status sit on top, the actions ride in a glass pill at the bottom; children go into the pill
 * before the actions (e.g. a progress read-out).
 */
export function MediaCard({ title, subtitle, image, levels, phase = 0, badge, actions, tilt = true, children, ...p }: MediaCardProps) {
  const card = (
    <Card border padding="none" className="ad-media-card-card" data-image={image ? "" : undefined}>
      {image && <img className="ad-media-card-image" src={image} alt="" loading="lazy" />}
      <span className="ad-media-card-art" aria-hidden="true">
        <Equalizer bars={16} levels={levels} phase={phase} />
      </span>
      <div className="ad-media-card-content">
        <div className="ad-media-card-head">
          <div className="ad-media-card-title">
            <Typography as="strong" variant="title" truncate>{title}</Typography>
            {subtitle && <Typography variant="body-sm" tone="muted" truncate>{subtitle}</Typography>}
          </div>
          {badge}
        </div>
        {(children || actions) && <div className="ad-media-card-actions">{children}{actions}</div>}
      </div>
    </Card>
  );
  return <div {...mark("MediaCard", p)}>{tilt ? <Tilt max={typeof tilt === "number" ? tilt : 10}>{card}</Tilt> : card}</div>;
}
