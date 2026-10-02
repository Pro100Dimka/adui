import React from "react";
import { define, mark, type Tone } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import type { StatusIndicatorProps } from "../shared";
export const StatusIndicator = define<StatusIndicatorProps>(
  "StatusIndicator",
  ({ status = "success", ...p }) => {
    const names: Record<Tone, string> = {
      success: "check",
      error: "warning",
      warning: "warning",
      processing: "processing",
      pending: "clock",
      offline: "minus",
      info: "info",
    };
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
        <span className="ad-status-dot">
          <Icon name={names[status]} size="1.125rem" />
        </span>
        <span>{p.label ?? labels[status]}</span>
      </span>
    );
  },
);
