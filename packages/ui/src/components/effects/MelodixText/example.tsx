import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function MelodixTextExample() {
  return (
    <Playground
      stretch
      knobs={{
        finish: { options: ["silver", "theme", "ink"], value: "silver" },
        glow: { value: true },
      }}
      code={(v) =>
        jsx("MelodixText", { as: "h1", finish: v.finish === "silver" ? undefined : v.finish, glow: v.glow ? undefined : { expr: "false" } }, "MELODIX")
      }
    >
      {(v) => {
        const props = { finish: v.finish as "silver", glow: v.glow };
        return (
          <div style={{ display: "grid", gap: "0.75rem", justifyItems: "center", width: "100%", padding: "1rem 0" }}>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>MELODIX</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>АБВГДЕЁЖЗИЙКЛМНОП</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>РСТУФХЦЧШЩЪЫЬЭЮЯ</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>0123456789 ♪♫𝄞♥#</U.MelodixText>
            <U.MelodixText as="div" {...props} style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>Караоке «Небо» — Звери</U.MelodixText>
          </div>
        );
      }}
    </Playground>
  );
}
