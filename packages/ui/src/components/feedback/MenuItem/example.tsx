import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function MenuItemExample() {
  const { alert } = useExampleState();
  return (
    <div
      className="ad-menu"
      role="menu"
      style={{
        position: "relative",
        inset: "auto",
        minWidth: "min(100%,20rem)",
      }}
    >
      <U.MenuItem
        label="Переименовать"
        icon="pencil"
        endIcon="chevron"
        onSelect={() => alert("Переименовать")}
      />
      <U.Divider />
      <U.MenuItem
        label="Копировать"
        icon="copy"
        onSelect={() => alert("Копировать")}
      />
      <U.Divider />
      <U.MenuItem
        label="Удалить"
        icon="trash"
        danger
        onSelect={() => alert("Удалить")}
      />
    </div>
  );
}
