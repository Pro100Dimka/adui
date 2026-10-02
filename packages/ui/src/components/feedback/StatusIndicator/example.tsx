import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const statuses = [
  "success",
  "processing",
  "pending",
  "warning",
  "error",
  "offline",
  "info",
] as const;

export default function StatusIndicatorExample() {
  return (
    <Playground
      knobs={{ status: { options: statuses, value: "processing" } }}
      code={(v) => jsx("StatusIndicator", { status: v.status })}
    >
      {(v) => <U.StatusIndicator status={v.status} />}
    </Playground>
  );
}
