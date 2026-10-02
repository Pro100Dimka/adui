import { Playground, U, expr, jsx } from "../../../dev/exampleHelpers";

export default function EqualizerExample() {
  return (
    <Playground
      knobs={{
        bars: { options: ["3", "5", "8"], value: "5" },
        playing: { value: true },
      }}
      code={(v) =>
        jsx("Equalizer", {
          bars: v.bars === "5" ? undefined : Number(v.bars),
          playing: v.playing ? undefined : expr("false"),
        })
      }
    >
      {(v) => (
        <U.Stack direction="row" gap={3} align="center">
          <U.Equalizer
            bars={Number(v.bars)}
            playing={v.playing}
            style={{ fontSize: "2rem" }}
          />
          <U.Stack gap={0}>
            <U.Typography variant="title">Ночь горит огнями</U.Typography>
            <U.Typography variant="caption" tone="muted">
              Release Host · 02:41
            </U.Typography>
          </U.Stack>
        </U.Stack>
      )}
    </Playground>
  );
}
