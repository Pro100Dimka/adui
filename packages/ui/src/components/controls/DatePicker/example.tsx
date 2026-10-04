import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function DatePickerExample() {
  const [date, setDate] = useState("2026-10-04");
  return (
    <Playground
      stretch
      knobs={{ limited: { value: false } }}
      code={(v) =>
        jsx("DatePicker", { label: "Дата выступления", value: { expr: "date" }, onValueChange: { expr: "setDate" }, min: v.limited ? "2026-10-01" : undefined, max: v.limited ? "2026-10-31" : undefined })
      }
    >
      {(v) => (
        <div style={{ width: "min(100%, 20rem)" }}>
          <U.DatePicker label="Дата выступления" value={date} onValueChange={setDate}
            min={v.limited ? "2026-10-01" : undefined} max={v.limited ? "2026-10-31" : undefined}
            description={v.limited ? "Только в октябре" : undefined} />
        </div>
      )}
    </Playground>
  );
}
