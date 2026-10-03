import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

const tones = ["none", "success", "warning", "error", "info"] as const;

export default function BadgeExample() {
  return (
    <Playground
      knobs={{
        tone: { options: tones, value: "success" },
        size: { options: sizes, value: "md" },
      }}
      code={(v, c) =>
        jsx(
          "Badge",
          { tone: v.tone === "none" ? undefined : v.tone, size: c.size },
          "Готово",
        )
      }
    >
      {(v) => (
        <U.Badge tone={v.tone === "none" ? undefined : v.tone} size={v.size}>
          Готово
        </U.Badge>
      )}
    </Playground>
  );
}
