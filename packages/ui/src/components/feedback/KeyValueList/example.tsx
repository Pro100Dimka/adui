import { KeyValueList, StatusIndicator } from "@ad-voice/ui";

export default function KeyValueListExample() {
  return (
    <KeyValueList
      items={[
        [
          "Python backend",
          <StatusIndicator status="success" label="Работает" />,
        ],
        ["Аудиосервис", <StatusIndicator status="processing" label="Запуск" />],
        ["База данных", <StatusIndicator status="success" label="Исправна" />],
      ]}
    />
  );
}
