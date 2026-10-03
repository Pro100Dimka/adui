import { classes, useControllable } from "../../../core/base";
import { Card } from "../../layout/Card/Card";
import { Stack } from "../../layout/Stack/Stack";
import { Typography } from "../../foundation/Typography/Typography";
import { ToggleButton } from "../../controls/ToggleButton/ToggleButton";
import { RotaryKnob } from "../../media/RotaryKnob/RotaryKnob";
import { LevelMeter } from "../../media/LevelMeter/LevelMeter";
import { RoleEmblem } from "../RoleEmblem/RoleEmblem";
import type { ParticipantCardProps } from "../shared";
export const ParticipantCard = (p: ParticipantCardProps) => {
  const [volume, setVolume] = useControllable(p.volume, 72, p.onVolumeChange),
    [muted, setMuted] = useControllable(p.muted, false, p.onMuteChange);
  return (
    <Card {...p} className={classes("ad-participant-card", p.className)}>
      <Stack
        direction="row"
        gap={3}
        align="center"
        wrap
        data-muted={muted || undefined}
      >
        <RoleEmblem role={p.role} />
        <Stack gap={1} className="ad-participant-card-info">
          <Typography variant="title" truncate>
            {p.name ?? "Release Host"}
          </Typography>
          <LevelMeter value={muted ? 0 : 72} />
        </Stack>
        <RotaryKnob
          size="sm"
          value={volume}
          onValueChange={setVolume}
          label="Громкость"
        />
        <ToggleButton
          checked={muted}
          onValueChange={setMuted}
          icon="volume"
          label="Mute"
        />
      </Stack>
    </Card>
  );
};
