import { Compare, Playground, U, jsx } from "../../../dev/exampleHelpers";

const names = ["mic", "headphones", "music", "wave", "settings", "trash"];

export default function IconExample() {
  return (
    <Playground
      knobs={{
        surface: { options: ["none", "tile"], value: "none" },
        size: { options: ["1rem", "1.5rem", "2rem"], value: "1.5rem" },
      }}
      code={(v) =>
        jsx("Icon", {
          name: "mic",
          surface: v.surface === "none" ? undefined : v.surface,
          size: v.size === "1.5rem" ? undefined : v.size,
        })
      }
      extra={
        <Compare
          items={names.map((name) => ({
            label: name,
            node: <U.Icon name={name} />,
          }))}
        />
      }
    >
      {(v) => (
        <U.Icon
          name="mic"
          surface={v.surface as "none" | "tile"}
          size={v.size}
        />
      )}
    </Playground>
  );
}
