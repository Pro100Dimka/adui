import { Playground, U, jsx } from "../../../dev/exampleHelpers";

const tones = ["warning", "error", "success", "info"] as const;
const text = {
  warning: "Осталось меньше 1 ГБ свободного места",
  error: "Не удалось сохранить запись",
  success: "Все параметры сохранены",
  info: "Новая версия модели доступна",
};

export default function MessageBarExample() {
  return (
    <Playground
      stretch
      knobs={{ tone: { options: tones, value: "warning" } }}
      code={(v) => jsx("MessageBar", { tone: v.tone }, text[v.tone])}
    >
      {(v) => <U.MessageBar tone={v.tone}>{text[v.tone]}</U.MessageBar>}
    </Playground>
  );
}
