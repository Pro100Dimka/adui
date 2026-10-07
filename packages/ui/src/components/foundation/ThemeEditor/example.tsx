import { useMemo, useState } from "react";
import { Playground, U, jsx, useSiteTheme } from "../../../dev/exampleHelpers";
import type { ThemeConfig } from "@ad-voice/ui";

export default function ThemeEditorExample() {
  const site = useSiteTheme();
  const [draft, setDraft] = useState<ThemeConfig>();
  const siteConfig = useMemo<ThemeConfig>(() => ({
    version: 1, mode: "simple", theme: site.theme,
    primary: site.primary, secondary: site.secondary, autoSecondary: false,
  }), [site.theme, site.primary, site.secondary]);
  const config = draft ?? siteConfig;
  return (
    <Playground
      stretch
      knobs={{}}
      code={() =>
        `const [config, setConfig] = useState(${JSON.stringify(config, null, 2)});\n\n` +
        `<ThemeProvider {...themeProps(config)}>\n  ` +
        jsx("ThemeEditor", { value: { expr: "config" }, onValueChange: { expr: "setConfig" } }) +
        `\n</ThemeProvider>`
      }
    >
      {() => (
        <U.ThemeProvider {...(draft ? U.themeProps(config) : {})} style={{ display: "block", width: "100%" }}>
          <U.ThemeEditor value={config} onValueChange={setDraft} />
        </U.ThemeProvider>
      )}
    </Playground>
  );
}
