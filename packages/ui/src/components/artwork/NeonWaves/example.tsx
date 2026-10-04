import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function NeonWavesExample() {
  return (
    <Playground
      stretch
      knobs={{
        strands: { options: ["12", "22", "34"], value: "22" },
        stars: { value: true },
        shape: { options: ["twist", "ridge"], value: "twist" },
        comets: { options: ["0", "3", "6"], value: "3" },
      }}
      code={(v) =>
        jsx("NeonWaves", {
          strands: v.strands === "22" ? undefined : Number(v.strands),
          stars: v.stars ? undefined : { expr: "false" },
          shape: v.shape === "twist" ? undefined : v.shape,
          comets: v.comets === "0" ? undefined : Number(v.comets),
        })
      }
    >
      {(v) => <U.NeonWaves strands={Number(v.strands)} stars={v.stars} shape={v.shape as "twist" | "ridge"} comets={Number(v.comets)} />}
    </Playground>
  );
}
