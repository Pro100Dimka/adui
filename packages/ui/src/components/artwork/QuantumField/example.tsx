import { useContext } from "react";
import { ExamplePreviewContext, Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function QuantumFieldExample() {
  const preview = useContext(ExamplePreviewContext);
  return (
    <Playground knobs={{ mode: { options: U.quantumFieldModes, value: "orbit" }, paused: { value: false } }} code={(v) => jsx("QuantumField", { mode: v.mode, paused: v.paused })}>
      {(v) => <U.QuantumField mode={v.mode} paused={preview || v.paused} quality={preview ? "low" : "auto"} />}
    </Playground>
  );
}
