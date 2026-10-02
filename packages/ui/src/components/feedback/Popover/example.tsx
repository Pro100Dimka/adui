import { useRef, useState } from "react";
import { Button, Popover, Slider, Stack, Typography } from "@ad-voice/ui";

export default function PopoverExample() {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(65);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={anchor} icon="volume" onClick={() => setOpen((v) => !v)}>
        Громкость {volume}%
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        label="Громкость"
      >
        <Stack gap={2}>
          <Typography variant="label">Громкость</Typography>
          <Slider value={volume} onValueChange={setVolume} label="Громкость" />
        </Stack>
      </Popover>
    </>
  );
}
