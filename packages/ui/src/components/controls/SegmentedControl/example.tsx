import { useState } from "react";
import { Playground, U, expr, jsx, sizes } from "../../../dev/exampleHelpers";

const items = [
  { value: "list", label: "Список", icon: "list" },
  { value: "grid", label: "Плитка", icon: "grid" },
  { value: "wave", label: "Волна", icon: "wave" },
];

export default function SegmentedControlExample() {
  const [view, setView] = useState("list");
  return (
    <Playground
      knobs={{ size: { options: sizes, value: "md" } }}
      code={(_, c) =>
        `const items = ${JSON.stringify(items)};\n\n` +
        jsx("SegmentedControl", {
          label: "Вид",
          items: expr("items"),
          value: expr("view"),
          onValueChange: expr("setView"),
          size: c.size,
        })
      }
    >
      {(v) => (
        <U.SegmentedControl
          label="Вид"
          items={items}
          value={view}
          onValueChange={setView}
          size={v.size}
        />
      )}
    </Playground>
  );
}
