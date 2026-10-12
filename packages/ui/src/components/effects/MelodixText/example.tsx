import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function MelodixTextExample() {
  return (
    <Playground
      stretch
      knobs={{
        finish: { options: ["silver", "theme", "ink"], value: "silver" },
        glow: { value: true },
        weight: { value: 400, min: 100, max: 900, step: 100 },
      }}
      code={(v) =>
        jsx("MelodixText", { as: "h1", finish: v.finish === "silver" ? undefined : v.finish, glow: v.glow ? undefined : { expr: "false" }, style: { fontWeight: v.weight } }, "MELODIX")
      }
    >
      {(v) => {
        const props = { finish: v.finish as "silver", glow: v.glow };
        const weight = v.weight;
        return (
          <U.Stack align="center" gap={3} style={{ width: "100%", padding: "1rem 0" }}>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: weight }}>MELODIX</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: weight }}>АБВГҐДЕЄЁЖЗИІЇЙКЛМН</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: weight }}>ОПРСТУФХЦЧШЩЪЫЬЭЮЯ</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: weight }}>0123456789 ♪♫𝄞♥#</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: weight }}>Караоке «Небо» — Звери</U.MelodixText>
          </U.Stack>
        );
      }}
    </Playground>
  );
}
