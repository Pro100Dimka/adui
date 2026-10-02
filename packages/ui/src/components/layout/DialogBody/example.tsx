import { DialogBody, TextField } from "@ad-voice/ui";

/** Content area of a dialog with the standard spacing. */
export default function DialogBodyExample() {
  return (
    <DialogBody>
      <TextField label="Название записи" defaultValue="Ночь горит огнями" />
    </DialogBody>
  );
}
