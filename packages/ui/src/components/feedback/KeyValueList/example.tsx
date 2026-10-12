import { KeyValueList, StatusIndicator } from "@neo-ui-kit/react";

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
