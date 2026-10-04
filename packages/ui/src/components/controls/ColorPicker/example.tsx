import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ColorPickerExample() {
  const [color, setColor] = useState("#ff244c");
  return (
    <Playground
      stretch
      knobs={{ inline: { value: false } }}
      code={(v) => jsx("ColorPicker", { label: "Основной цвет", value: { expr: "color" }, onValueChange: { expr: "setColor" }, inline: v.inline })}
    >
      {(v) => (
        <div style={{ display: "grid", gap: "1rem", width: "min(100%, 22rem)" }}>
          <U.ColorPicker label="Основной цвет" value={color} onValueChange={setColor} inline={v.inline} />
          <U.Button variant="primary" icon="palette" style={{ background: color }}>Цвет {color}</U.Button>
        </div>
      )}
    </Playground>
  );
}
