import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function NeonWavesExample() {
  return (
    <Playground
      stretch
      knobs={{
        strands: { value: 22, min: 12, max: 34 },
        stars: { value: true },
        shape: { options: ["twist", "ridge"], value: "twist" },
        comets: { value: 3, min: 0, max: 6 },
      }}
      code={(v) =>
        jsx("NeonWaves", {
          strands: v.strands === 22 ? undefined : v.strands,
          stars: v.stars ? undefined : { expr: "false" },
          shape: v.shape === "twist" ? undefined : v.shape,
          comets: v.comets === 0 ? undefined : v.comets,
        })
      }
    >
      {(v) => <U.NeonWaves strands={v.strands} stars={v.stars} shape={v.shape as "twist" | "ridge"} comets={v.comets} />}
    </Playground>
  );
}
