import { ThemePicker, themes, loaderDefaultImage, type ThemeName, type ThemePickerOption } from "@neo-ui-kit/react";
import {
  Playground,
  jsx,
  sizes,
  useSiteTheme,
} from "../../../dev/exampleHelpers";

const options: ThemePickerOption<ThemeName>[] = (Object.keys(themes) as ThemeName[]).map((value) => ({
  value,
  label: value,
  color: themes[value][0],
  image: loaderDefaultImage,
  background: "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400"><defs><radialGradient id="g"><stop stop-color="${themes[value][0]}" stop-opacity=".55"/><stop offset="1" stop-color="#080a12"/></radialGradient></defs><path fill="url(#g)" d="M0 0h500v400H0z"/><circle cx="250" cy="175" r="135" fill="none" stroke="${themes[value][1]}" opacity=".25"/></svg>`,
  ),
}));

/** On the docs site the picker switches the theme of the whole site. */
export default function ThemePickerExample() {
  const site = useSiteTheme();
  return (
    <Playground
      knobs={{ gallery: { value: true }, size: { options: sizes, value: "sm" } }}
      code={(_, c) =>
        jsx("ThemePicker", {
          value: { expr: "theme" },
          onValueChange: { expr: "setTheme" },
          size: c.size,
          options: c.gallery ? { expr: JSON.stringify(options, null, 2) } : undefined,
        })
      }
    >
      {(v) => (
        <ThemePicker
          size={v.size}
          value={site.theme}
          onValueChange={(theme) => site.set({ theme })}
          options={v.gallery ? options : undefined}
        />
      )}
    </Playground>
  );
}
