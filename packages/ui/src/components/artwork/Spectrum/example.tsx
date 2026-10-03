import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function SpectrumExample() {
  return (
    <Playground
      knobs={{
        variant: {
          options: ["segmented", "bars"] as const,
          value: "segmented",
        },
      }}
      code={(_, c) => jsx("Spectrum", { variant: c.variant })}
    >
      {(v) => <U.Spectrum variant={v.variant} />}
    </Playground>
  );
}
