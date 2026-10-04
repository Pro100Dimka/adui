const e=`import { mark } from "../../../core/base";
import { type KeyValueListProps } from "../shared";

export const KeyValueList = (p: KeyValueListProps) => (
  <dl {...mark("KeyValueList", p)}>
    {(
      p.items ?? [
        ["Python Backend", "Ready"],
        ["AudioService", "Running"],
        ["База данных", "Исправно"],
      ]
    ).map(([key, value], i) => (
      <div key={i}>
        <dt>{key}</dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
);
`;export{e as default};
