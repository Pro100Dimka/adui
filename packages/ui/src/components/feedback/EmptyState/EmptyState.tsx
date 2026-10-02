import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type EmptyStateProps } from "../shared";

export const EmptyState = (p: EmptyStateProps) => (
  <div {...mark("EmptyState", p)}>
    <Icon name={p.icon ?? "music"} size={44} />
    <h3>{p.title ?? "Пока нет записей"}</h3>
    <p>{p.description ?? "Добавьте запись, чтобы начать."}</p>
    {p.action}
  </div>
);
