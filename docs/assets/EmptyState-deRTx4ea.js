const t=`import { tr, useTr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type EmptyStateProps } from "../shared";

export const EmptyState = (p: EmptyStateProps) => { const tr = useTr(); return ((
  <div {...mark("EmptyState", p)}>
    <Icon name={p.icon ?? "music"} size={44} />
    <h3>{p.title ?? tr("Пока нет записей")}</h3>
    <p>{p.description ?? tr("Добавьте запись, чтобы начать.")}</p>
    {p.action}
  </div>
)); };
`;export{t as default};
