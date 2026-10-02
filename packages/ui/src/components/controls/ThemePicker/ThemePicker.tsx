import React from "react";
import {
  define,
  mark,
  useControllable,
  type CommonProps,
} from "../../../core/base";
import { Button } from "../Button/Button";
export type ThemeName = "ruby" | "light" | "green" | "violet";
export interface ThemePickerProps extends CommonProps {
  value?: ThemeName;
  defaultValue?: ThemeName;
  onValueChange?: (value: ThemeName) => void;
}
export const ThemePicker = define<ThemePickerProps>("ThemePicker", (p) => {
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? "ruby",
    p.onValueChange,
  );
  const themes: Array<[ThemeName, string, string]> = [
    ["ruby", "Ruby", "#ff244c"],
    ["light", "Light", "#e6c98d"],
    ["green", "Green", "#10deae"],
    ["violet", "Violet", "#b680ff"],
  ];
  return (
    <div {...mark("ThemePicker", p)}>
      {themes.map(([key, name, color]) => (
        <Button
          key={key}
          size="sm"
          aria-pressed={key === value}
          onClick={() => setValue(key)}
        >
          <span className="ad-theme-swatch" style={{ background: color }} />
          {name}
        </Button>
      ))}
    </div>
  );
});
