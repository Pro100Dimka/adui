import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type StepsProps } from "../shared";
import { StatusIndicator } from "../StatusIndicator/StatusIndicator";

export const Steps = (p: StepsProps) => {
  const steps = p.steps ?? [
    "Подготовка",
    "Анализ",
    "Модель",
    "Обработка",
    "Проверка",
  ];
  return (
    <ol {...mark("Steps", p)}>
      {steps.map((label, i) => (
        <li
          key={`${i}-${label}`}
          aria-current={i === (p.current ?? 3) ? "step" : undefined}
        >
          <StatusIndicator
            status={
              i < (p.current ?? 3)
                ? "success"
                : i === (p.current ?? 3)
                  ? "processing"
                  : "pending"
            }
            label={label}
          />
          {i < steps.length - 1 && <Icon name="chevron" size={12} />}
        </li>
      ))}
    </ol>
  );
};
