import { Steps } from "@neo-ui-kit/react";

export default function StepsExample() {
  return (
    <Steps
      steps={["Загрузка", "Анализ", "Модель", "Обработка", "Готово"]}
      current={2}
    />
  );
}
