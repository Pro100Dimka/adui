import { mark } from "../../../core/base";
import { type DataTableProps } from "../shared";

export const DataTable = (p: DataTableProps) => (
  <table {...mark("DataTable", p)}>
    {p.caption && <caption>{p.caption}</caption>}
    <thead>
      <tr>
        {(p.columns ?? ["Дата", "Событие", "Статус"]).map((name, i) => (
          <th key={i} scope="col">
            {name}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {(
        p.rows ?? [
          ["30.09.2026, 13:24", "AnalysisCompleted", "Готово"],
          ["30.09.2026, 13:23", "RecordingRegistered", "Готово"],
        ]
      ).map((row, i) => (
        <tr key={i}>
          {row.map((v, j) => (
            <td key={j}>{v}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
