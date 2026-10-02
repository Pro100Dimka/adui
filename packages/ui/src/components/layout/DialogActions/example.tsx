import { Button, DialogActions } from "@ad-voice/ui";

/** Footer row of a dialog; Dialog renders one for you, use it in custom dialogs. */
export default function DialogActionsExample() {
  return (
    <DialogActions>
      <Button>Отмена</Button>
      <Button variant="primary">Сохранить</Button>
    </DialogActions>
  );
}
