import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Button } from "../Button/Button";
import {
  themes,
  type ThemeName,
} from "../../foundation/ThemeProvider/ThemeProvider";
export type { ThemeName };
export interface ThemePickerProps extends CommonProps {
  value?: ThemeName;
  defaultValue?: ThemeName;
  onValueChange?: (value: ThemeName) => void;
}
export const ThemePicker = (p: ThemePickerProps) => {
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? "ruby",
    p.onValueChange,
  );
  const names: Record<ThemeName, string> = {
    ruby: "Ruby",
    light: "Light",
    green: "Green",
    violet: "Violet",
  };
  return (
    <div {...mark("ThemePicker", p)}>
      {(Object.keys(names) as ThemeName[]).map((key) => (
        <Button
          key={key}
          size={p.size ?? "sm"}
          aria-pressed={key === value}
          onClick={() => setValue(key)}
        >
          <span
            className="ad-theme-swatch"
            style={{ background: themes[key][0] }}
          />
          {names[key]}
        </Button>
      ))}
    </div>
  );
};
