import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function ButtonGroupExample() {
  return (
    <Playground
      knobs={{ size: { options: sizes, value: "sm" } }}
      code={(_, c) =>
        jsx(
          "ButtonGroup",
          {},
          [
            jsx("Button", { size: c.size, icon: "back" }, "Назад"),
            jsx("Button", { size: c.size, icon: "eye" }, "Предпросмотр"),
            jsx(
              "Button",
              { size: c.size, variant: "primary", icon: "save" },
              "Сохранить",
            ),
          ].join("\n  "),
        )
      }
    >
      {(v) => (
        <U.ButtonGroup>
          <U.Button size={v.size} icon="back">
            Назад
          </U.Button>
          <U.Button size={v.size} icon="eye">
            Предпросмотр
          </U.Button>
          <U.Button size={v.size} variant="primary" icon="save">
            Сохранить
          </U.Button>
        </U.ButtonGroup>
      )}
    </Playground>
  );
}
