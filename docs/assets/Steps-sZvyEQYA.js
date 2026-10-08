const r=`import { tr, useTr } from "../../../core/i18n";\r
import { mark } from "../../../core/base";\r
import { Icon } from "../../layout/Icon/Icon";\r
import { type StepsProps } from "../shared";\r
\r
export const Steps = (p: StepsProps) => {\r
  const tr = useTr();\r
  const steps = p.steps ?? [\r
    tr("Подготовка"),\r
    tr("Анализ"),\r
    tr("Модель"),\r
    tr("Обработка"),\r
    tr("Проверка"),\r
  ];\r
  const current = p.current ?? 3;\r
  return (\r
    <ol {...mark("Steps", p)}>\r
      {steps.map((label, i) => {\r
        const state = i < current ? "done" : i === current ? "current" : "todo";\r
        return (\r
          <li\r
            key={\`\${i}-\${label}\`}\r
            data-state={state}\r
            aria-current={state === "current" ? "step" : undefined}\r
          >\r
            <span className="ad-step-node" aria-hidden>\r
              {state === "done" ? <Icon name="check" /> : i + 1}\r
            </span>\r
            <span className="ad-step-label">{label}</span>\r
            {state === "current" && i > 0 && <span className="ad-steps-glint" aria-hidden />}\r
          </li>\r
        );\r
      })}\r
    </ol>\r
  );\r
};\r
`;export{r as default};
