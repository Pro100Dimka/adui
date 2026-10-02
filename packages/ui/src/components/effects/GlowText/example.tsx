import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function GlowTextExample() {
  return (
    <Playground
      knobs={{ flicker: { value: true } }}
      code={(v) =>
        jsx("GlowText", { as: "h2", flicker: v.flicker }, "Karaoke Night")
      }
    >
      {(v) => (
        <U.GlowText
          as="h2"
          flicker={v.flicker}
          style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
        >
          Karaoke Night
        </U.GlowText>
      )}
    </Playground>
  );
}
