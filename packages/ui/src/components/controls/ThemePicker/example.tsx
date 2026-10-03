import {
  Playground,
  U,
  jsx,
  sizes,
  useSiteTheme,
} from "../../../dev/exampleHelpers";

/** On the docs site the picker switches the theme of the whole site. */
export default function ThemePickerExample() {
  const site = useSiteTheme();
  return (
    <Playground
      knobs={{ size: { options: sizes, value: "sm" } }}
      code={(_, c) =>
        jsx("ThemePicker", {
          value: { expr: "theme" },
          onValueChange: { expr: "setTheme" },
          size: c.size,
        })
      }
    >
      {(v) => (
        <U.ThemePicker
          size={v.size}
          value={site.theme}
          onValueChange={(theme) => site.set({ theme })}
        />
      )}
    </Playground>
  );
}
