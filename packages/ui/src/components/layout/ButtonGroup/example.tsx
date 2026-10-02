import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function ButtonGroupExample() {
  return (
    <U.ButtonGroup>
      <U.Button>Назад</U.Button>
      <U.Button>Предпросмотр</U.Button>
      <U.Button variant="primary">Сохранить</U.Button>
    </U.ButtonGroup>
  );
}
