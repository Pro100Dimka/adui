import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function LoaderExample() {
  return (
    <Playground
      knobs={{ animation: { options: U.loaderAnimations, value: "orbit" }, size: { options: sizes, value: "md" } }}
      code={(v) => jsx("Loader", { animation: v.animation, size: v.size })}
    >
      {(v) => <U.Loader animation={v.animation} size={v.size} />}
    </Playground>
  );
}
