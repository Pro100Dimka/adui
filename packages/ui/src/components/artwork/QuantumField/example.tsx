import { useContext } from "react";
import { ExamplePreviewContext, Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function QuantumBackgroundExample() {
  const preview = useContext(ExamplePreviewContext);
  return (
    <Playground knobs={{}} code={() => jsx("QuantumBackground", {})}>
      {() => preview ? <U.QuantumField paused quality="low" /> : <U.QuantumBackground />}
    </Playground>
  );
}
