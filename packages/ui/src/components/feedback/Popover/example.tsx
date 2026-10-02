import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function PopoverExample() {
  const { value, setValue, open, setOpen, anchor } = useExampleState();
  return (
    <>
      <U.Button ref={anchor} icon="sliders" onClick={() => setOpen((v) => !v)}>
        Открыть параметры
      </U.Button>
      <U.Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        label="Громкость"
      >
        <U.Stack gap={2}>
          <U.Slider value={value} onValueChange={setValue} label="Громкость" />
          <U.Typography variant="caption">{value}%</U.Typography>
        </U.Stack>
      </U.Popover>
    </>
  );
}
