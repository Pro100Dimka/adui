import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function ThemePickerExample() {
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
      {(v) => <U.ThemePicker size={v.size} />}
    </Playground>
  );
}
