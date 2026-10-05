import { Playground, U } from "../../../dev/exampleHelpers";

export default function LoaderGeneratorExample() {
  return (
    <Playground stretch knobs={{}} code={() => `<LoaderGenerator onValueChange={(settings) => save(settings)} />`}>
      {() => <U.LoaderGenerator style={{ width: "100%" }} />}
    </Playground>
  );
}
