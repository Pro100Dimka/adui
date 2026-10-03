import { useEffect, useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const effects = ["rise", "fade", "zoom", "blur"] as const;
const titles = ["Вокал", "Минус", "Мелодия"];

export default function RevealExample() {
  const [run, setRun] = useState(0);
  // Replays on its own, so the arrival is always there to watch.
  useEffect(() => {
    const timer = setInterval(() => setRun((n) => n + 1), 4000);
    return () => clearInterval(timer);
  }, []);
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
