import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function ShimmerExample() {
  return (
    <Playground
      stretch
      knobs={{
        lines: { value: 3, min: 1, max: 4 },
        circle: { value: true },
      }}
      code={(v) =>
        jsx("Shimmer", {
          lines: v.lines === 3 ? undefined : v.lines,
          circle: v.circle,
        })
      }
    >
      {(v) => <U.Shimmer lines={v.lines} circle={v.circle} />}
    </Playground>
  );
}
