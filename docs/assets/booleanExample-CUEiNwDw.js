const e=`import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function BooleanControlExample() {
  return (
    <Playground knobs={{ kind: { options: ["Checkbox", "Switch"] as const, value: "Checkbox" }, size: { options: sizes, value: "md" }, disabled: { value: false } }}
      code={(v, c) => jsx("BooleanControl", { kind: v.kind, label: "Включить уведомления", defaultChecked: true, size: c.size, disabled: v.disabled })}>
      {(v) => <U.BooleanControl kind={v.kind} size={v.size} disabled={v.disabled} label="Включить уведомления" defaultChecked />}
    </Playground>
  );
}
`;export{e as default};
