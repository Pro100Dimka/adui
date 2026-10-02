import { useState } from "react";
import { U } from "../../../dev/exampleHelpers";
export default function ThemeProviderExample() {
  const [theme, setTheme] = useState<"ruby" | "green" | "violet" | "light">(
      "ruby",
    ),
    [accent, setAccent] = useState("#ff244c");
  return (
    <U.ThemeProvider theme={theme} accent={accent}>
      <U.Stack gap={3}>
        <U.ThemePicker value={theme} onValueChange={setTheme} />
        <label>
          Свой accent{" "}
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </label>
        <U.Card material="glass" title="Theme preview">
          <U.Stack direction="row" gap={2}>
            <U.Button variant="primary">Primary</U.Button>
            <U.TextField defaultValue="Text field" />
          </U.Stack>
        </U.Card>
      </U.Stack>
    </U.ThemeProvider>
  );
}
