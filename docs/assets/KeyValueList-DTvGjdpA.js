const e=`import { tr, useTr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { type KeyValueListProps } from "../shared";

export const KeyValueList = (p: KeyValueListProps) => { const tr = useTr(); return ((
  <dl {...mark("KeyValueList", p)}>
    {(
      p.items ?? [
        ["Python Backend", "Ready"],
        ["AudioService", "Running"],
        [tr("База данных"), tr("Исправно")],
      ]
    ).map(([key, value], i) => (
      <div key={i}>
        <dt>{key}</dt>
        <dd>{value}</dd>
      </div>
    ))}
  </dl>
)); };
`;export{e as default};
