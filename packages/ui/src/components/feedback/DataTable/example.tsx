import { DataTable } from "@ad-voice/ui";

export default function DataTableExample() {
  return (
    <DataTable
      caption="История обработки"
      columns={["Время", "Событие", "Статус"]}
      rows={[
        ["13:24", "Анализ завершён", "Готово"],
        ["13:23", "Запись загружена", "Готово"],
        ["13:21", "Выступление начато", "Готово"],
      ]}
    />
  );
}
