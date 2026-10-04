const e=`import type { CSSProperties } from "react";
import { mark, useControllable, type CommonProps } from "../../../core/base";
import { Button } from "../Button/Button";
import { Icon } from "../../layout/Icon/Icon";
import { ImageShine } from "../../effects/ImageShine/ImageShine";
import {
  themes,
  type ThemeName,
} from "../../foundation/ThemeProvider/ThemeProvider";
export type { ThemeName };

/** A theme shown as a card: its picture, name, a line about it and its own colour. */
export interface ThemePickerOption<V extends string = string> {
  value: V;
  label: string;
  description?: string;
  /** Picture of the theme (with transparency); the chosen one gets a moving shine. */
  image?: string;
  /** The theme's own colour for the card's edge and glow. */
  color?: string;
}

export interface ThemePickerProps<V extends string = ThemeName> extends CommonProps {
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Own themes as picture cards; without them the built-in themes are offered as swatches. */
  options?: readonly ThemePickerOption<V>[];
  disabled?: boolean;
  label?: string;
}

const builtIn: Record<ThemeName, string> = {
  ruby: "Ruby",
  light: "Light",
  green: "Green",
  violet: "Violet",
};

/** Choosing a theme: compact swatches for the built-in themes, or a gallery of picture cards. */
export function ThemePicker<V extends string = ThemeName>(p: ThemePickerProps<V>) {
  const first = (p.options?.[0]?.value ?? "ruby") as V;
  const [value, setValue] = useControllable<V>(p.value, p.defaultValue ?? first, p.onValueChange);

  if (!p.options)
    return (
      <div {...mark("ThemePicker", p)} role="radiogroup" aria-label={p.label ?? "Тема"}>
        {(Object.keys(builtIn) as ThemeName[]).map((key) => (
          <Button key={key} size={p.size ?? "sm"} aria-pressed={key === value} disabled={p.disabled}
            onClick={() => setValue(key as unknown as V)}>
            <span className="ad-theme-swatch" style={{ background: themes[key][0] }} />
            {builtIn[key]}
          </Button>
        ))}
      </div>
    );

  return (
    <div {...mark("ThemePicker", p)} data-gallery="" role="radiogroup" aria-label={p.label ?? "Тема"}>
      {p.options.map((option) => {
        const chosen = option.value === value;
        return (
          <button key={option.value} type="button" className="ad-theme-card" aria-pressed={chosen} aria-label={option.label}
            disabled={p.disabled} style={option.color ? ({ "--ad-theme-card": option.color } as CSSProperties) : undefined}
            onClick={() => setValue(option.value)}>
            <span className="ad-theme-card-preview">
              {option.image && (chosen
                ? <ImageShine src={option.image} glow={false} />
                : <img src={option.image} alt="" loading="lazy" />)}
            </span>
            <span className="ad-theme-card-caption">
              <strong>{option.label}</strong>
              {option.description && <span aria-hidden="true">{option.description}</span>}
            </span>
            {chosen && <span className="ad-theme-card-check" aria-hidden="true"><Icon name="check" /></span>}
          </button>
        );
      })}
    </div>
  );
}
`;export{e as default};
