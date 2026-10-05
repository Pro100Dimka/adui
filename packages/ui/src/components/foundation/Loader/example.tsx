import { Playground, U, jsx } from "../../../dev/exampleHelpers";

export default function LoaderExample() {
  return (
    <Playground
      knobs={{ animation: { options: [...U.loaderAnimations], value: "orbit" } }}
      code={(v) => jsx("Loader", { src: "/logo.png", animation: v.animation, size: "4rem" })}
    >
      {(v) => <U.Loader animation={v.animation as (typeof U.loaderAnimations)[number]} size="5rem" />}
    </Playground>
  );
}
