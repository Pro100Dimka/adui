import { Compare, Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

const names = ["mic", "headphones", "music", "wave", "settings", "trash"];

export default function IconExample() {
  return (
    <Playground
      knobs={{
        surface: { options: ["none", "tile"], value: "none" },
        size: { options: sizes, value: "md" },
      }}
      code={(v) =>
        jsx("Icon", {
          name: "mic",
          surface: v.surface === "none" ? undefined : v.surface,
          size: v.size,
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
