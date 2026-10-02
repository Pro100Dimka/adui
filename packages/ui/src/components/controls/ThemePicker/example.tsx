import React, { useState } from "react";
import { U } from "../../../dev/exampleHelpers";
export default function ThemePickerExample() {
  const [theme, setTheme] = useState<"ruby" | "light" | "green" | "violet">(
    "ruby",
  );
  return (
    <U.Stack gap={2}>
      <U.ThemePicker value={theme} onValueChange={setTheme} />
      <U.Typography variant="caption" tone="muted">
        Выбрано: {theme}
      </U.Typography>
    </U.Stack>
  );
}
