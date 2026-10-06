const n=`import { tr, useTr } from "../../../core/i18n";
import { mark } from "../../../core/base";
import { Icon } from "../../layout/Icon/Icon";
import { type StepsProps } from "../shared";

export const Steps = (p: StepsProps) => {
  const tr = useTr();
  const steps = p.steps ?? [
    tr("Подготовка"),
    tr("Анализ"),
    tr("Модель"),
    tr("Обработка"),
    tr("Проверка"),
  ];
  const current = p.current ?? 3;
  return (
    <ol {...mark("Steps", p)}>
      {steps.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li
            key={\`\${i}-\${label}\`}
            data-state={state}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="ad-step-node" aria-hidden>
              {state === "done" ? <Icon name="check" /> : i + 1}
            </span>
            <span className="ad-step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
};
`;export{n as default};
