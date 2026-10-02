import { U } from "../../../dev/exampleHelpers";
export default function ButtonGroupExample() {
  return (
    <U.ButtonGroup>
      <U.Button size="sm">Назад</U.Button>
      <U.Button size="sm">Предпросмотр</U.Button>
      <U.Button size="sm" variant="primary">
        Сохранить
      </U.Button>
    </U.ButtonGroup>
  );
}
