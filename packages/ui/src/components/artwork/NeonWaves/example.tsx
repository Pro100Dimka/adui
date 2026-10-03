import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function NeonWavesExample() {
  return (
    <Playground
      stretch
      knobs={{
        strands: { options: ["12", "22", "34"], value: "22" },
        stars: { value: true },
      }}
      code={(v) =>
        jsx("NeonWaves", {
          strands: v.strands === "22" ? undefined : Number(v.strands),
          stars: v.stars ? undefined : { expr: "false" },
        })
      }
    >
      {(v) => <U.NeonWaves strands={Number(v.strands)} stars={v.stars} />}
    </Playground>
  );
}
