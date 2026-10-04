import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";
import type { ThemeConfig } from "@ad-voice/ui";

export default function ThemeEditorExample() {
  const [config, setConfig] = useState<ThemeConfig>(U.defaultThemeConfig);
  return (
    <Playground
      stretch
      knobs={{}}
      code={() =>
        `const [config, setConfig] = useState(defaultThemeConfig);\n\n` +
        `<ThemeProvider {...themeProps(config)}>\n  ` +
        jsx("ThemeEditor", { value: { expr: "config" }, onValueChange: { expr: "setConfig" } }) +
        `\n</ThemeProvider>`
      }
    >
      {() => (
        <U.ThemeProvider {...U.themeProps(config)} style={{ display: "block", width: "100%" }}>
          <U.ThemeEditor value={config} onValueChange={setConfig} />
        </U.ThemeProvider>
      )}
    </Playground>
  );
}
