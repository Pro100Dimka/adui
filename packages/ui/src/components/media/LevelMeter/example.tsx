import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function LevelMeterExample() {
  return (
    <Playground
      stretch
      knobs={{
        value: { options: ["20", "55", "80", "100"], value: "55" },
        segmented: { value: false },
      }}
      code={(v) =>
        jsx("LevelMeter", {
          label: "Микрофон",
          value: Number(v.value),
          segmented: v.segmented,
        })
      }
    >
      {(v) => (
        <U.LevelMeter
          label="Микрофон"
          value={Number(v.value)}
          segmented={v.segmented}
        />
      )}
    </Playground>
  );
}
