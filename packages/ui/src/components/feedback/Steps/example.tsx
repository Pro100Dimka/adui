import { Steps } from "@ad-voice/ui";

export default function StepsExample() {
  return (
    <Steps
      steps={["Загрузка", "Анализ", "Модель", "Обработка", "Готово"]}
      current={2}
    />
  );
}
