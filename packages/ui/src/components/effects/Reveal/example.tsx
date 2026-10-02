import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const effects = ["rise", "fade", "zoom", "blur"] as const;
const titles = ["Вокал", "Минус", "Мелодия"];

export default function RevealExample() {
  const [run, setRun] = useState(0);
  return (
    <Playground
      stretch
      knobs={{ effect: { options: effects, value: "rise" } }}
      code={(v) =>
        jsx(
          "Reveal",
          { effect: v.effect === "rise" ? undefined : v.effect },
          titles.map((t) => `<Card title="${t}" />`).join("\n  "),
        )
      }
      extra={
        <U.Button size="sm" icon="refresh" onClick={() => setRun((n) => n + 1)}>
          Показать ещё раз
        </U.Button>
      }
    >
      {(v) => (
        <U.Reveal key={`${v.effect}-${run}`} effect={v.effect}>
          {titles.map((title) => (
            <U.Card key={title} title={title} icon="audio" padding="sm" />
          ))}
        </U.Reveal>
      )}
    </Playground>
  );
}
