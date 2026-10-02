import { mark, type Tone } from "../../../core/base";
import type { StatusIndicatorProps } from "../shared";
export const StatusIndicator = ({
  status = "success",
  ...p
}: StatusIndicatorProps) => {
  const labels: Record<Tone, string> = {
    success: "Готово",
    error: "Ошибка",
    warning: "Внимание",
    processing: "Обработка",
    pending: "В очереди",
    offline: "Не подключено",
    info: "Информация",
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
