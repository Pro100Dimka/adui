import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ShimmerExample() {
  return (
    <Playground
      stretch
      knobs={{
        lines: { options: ["1", "2", "3", "4"], value: "3" },
        circle: { value: true },
      }}
      code={(v) =>
        jsx("Shimmer", {
          lines: v.lines === "3" ? undefined : Number(v.lines),
          circle: v.circle,
        })
      }
    >
      {(v) => <U.Shimmer lines={Number(v.lines)} circle={v.circle} />}
    </Playground>
  );
}
