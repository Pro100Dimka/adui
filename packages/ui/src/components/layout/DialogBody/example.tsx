import { DialogBody, TextField } from "@neo-ui-kit/react";

/** Content area of a dialog with the standard spacing. */
export default function DialogBodyExample() {
  return (
    <DialogBody>
      <TextField label="Название записи" defaultValue="Ночь горит огнями" />
    </DialogBody>
  );
}
