import { tr, useTr } from "../../../core/i18n";
import { mark, type Tone } from "../../../core/base";
import type { StatusIndicatorProps } from "../shared";
export const StatusIndicator = ({
  status = "success",
  ...p
}: StatusIndicatorProps) => {
  const tr = useTr();
  const labels: Record<Tone, string> = {
    success: tr("Готово"),
    error: tr("Ошибка"),
    warning: tr("Внимание"),
    processing: tr("Обработка"),
    pending: tr("В очереди"),
    offline: tr("Не подключено"),
    info: tr("Информация"),
  };
  return (
    <span {...mark("StatusIndicator", { ...p, tone: status })}>
      <span className="ad-status-dot" aria-hidden>
        <i />
      </span>
      <span>{p.label ?? labels[status]}</span>
    </span>
  );
};
