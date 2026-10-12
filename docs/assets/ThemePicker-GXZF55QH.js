const e=`import { useTr } from "../../../core/i18n";
import type { CSSProperties } from "react";
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
  const tr = useTr();
  const first = (p.options?.[0]?.value ?? "ruby") as V;
  const [value, setValue] = useControllable<V>(p.value, p.defaultValue ?? first, p.onValueChange);

  const options: readonly ThemePickerOption<V>[] = p.options ?? (Object.keys(builtIn) as ThemeName[]).map((key) => ({
    value: key as V, label: builtIn[key], color: themes[key][0],
  }));
  const active = Math.max(0, options.findIndex((option) => option.value === value));
  return (
    <div {...mark("ThemePicker", p)} data-gallery={p.options ? "" : undefined} role="radiogroup" aria-label={p.label ?? tr("Тема")}
      onKeyDown={(event) => {
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const moves: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -index, End: buttons.length - index - 1 };
        const move = moves[event.key];
        if (move === undefined || !buttons.length) return;
        event.preventDefault();
        const next = buttons[(index + move + buttons.length) % buttons.length];
        next.focus();
        next.click();
      }}>
      {options.map((option, index) => {
        const chosen = option.value === value;
        const radio = { role: "radio", "aria-checked": chosen, tabIndex: index === active ? 0 : -1, disabled: p.disabled, onClick: () => setValue(option.value) } as const;
        if (!p.options) return <Button key={option.value} size={p.size ?? "sm"} {...radio}>
          <span className="ad-theme-swatch" style={{ background: option.color }} />{option.label}
        </Button>;
        return (
          <button key={option.value} type="button" className="ad-theme-card" aria-label={option.label} {...radio}
            style={option.color ? ({ "--ad-theme-card": option.color } as CSSProperties) : undefined}>
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
