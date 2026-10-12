const e=`import { useContext } from "react";
import { ExamplePreviewContext, Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function QuantumFieldExperienceExample() {
  const preview = useContext(ExamplePreviewContext);
  return (
    <Playground knobs={{}} code={() => jsx("QuantumFieldExperience", {})}>
      {() => preview ? <U.QuantumField paused quality="low" /> : <U.QuantumFieldExperience />}
    </Playground>
  );
}
`;export{e as default};
