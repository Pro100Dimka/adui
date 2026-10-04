import { useState } from "react";
import { Playground, U, jsx } from "../../../dev/exampleHelpers";
import type { PickerPerson } from "@ad-voice/ui";

const team: PickerPerson[] = [
  { id: "1", name: "Анна Ковальчук", description: "Солистка", presence: "online" },
  { id: "2", name: "Дмитрий Андреев", description: "Хост комнаты", presence: "online" },
  { id: "3", name: "Ольга Мельник", description: "Бэк-вокал", presence: "busy" },
  { id: "4", name: "Максим Шевчук", description: "Гитара", presence: "offline" },
  { id: "5", name: "Ирина Бондарь", description: "Клавиши", presence: "online" },
  { id: "6", name: "Тарас Гнатюк", description: "Барабаны", presence: "offline" },
];

/** Pretends to ask a server. */
const searchServer = (query: string) =>
  new Promise<PickerPerson[]>((resolve) =>
    setTimeout(() => resolve(team.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))), 500),
  );

export default function PeoplePickerExample() {
  const [people, setPeople] = useState<PickerPerson[]>([team[0]!]);
  return (
    <Playground
      stretch
      knobs={{ async: { value: false }, single: { value: false } }}
      code={(v) =>
        jsx("PeoplePicker", {
          label: "Участники",
          ...(v.async ? { onSearch: { expr: "searchServer" } } : { people: { expr: "team" } }),
          single: v.single,
          value: { expr: "people" },
          onValueChange: { expr: "setPeople" },
        })
      }
    >
      {(v) => (
        <U.PeoplePicker key={String(v.single)} label="Участники" description="Кого пригласить в комнату"
          people={v.async ? undefined : team} onSearch={v.async ? searchServer : undefined} single={v.single}
          value={v.single ? people.slice(0, 1) : people} onValueChange={setPeople} />
      )}
    </Playground>
  );
}
