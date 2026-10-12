import { Button, DialogActions } from "@neo-ui-kit/react";

/** Footer row of a dialog; Dialog renders one for you, use it in custom dialogs. */
export default function DialogActionsExample() {
  return (
    <DialogActions>
      <Button>Отмена</Button>
      <Button variant="primary">Сохранить</Button>
    </DialogActions>
  );
}
