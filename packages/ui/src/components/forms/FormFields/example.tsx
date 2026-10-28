import { Button, Stack, TextField, type PickerPerson } from "@neo-ui-kit/react";
import {
  Form,
  FormFields,
  useForm,
  type FormFieldDefinition,
} from "@neo-ui-kit/react/forms";

type Values = {
  name: string;
  delay: number;
  driver: string;
  device: string;
  notes: string;
  color: string;
  date: string;
  photo: File[];
  people: PickerPerson[];
  volume: number;
  gain: number;
  tags: string[];
  confirmed: boolean;
  monitor: boolean;
  theme: string;
  pinned: boolean;
  view: string;
  section: string;
  nickname: string;
};

const column = { base: "full", sm: 6, lg: 4 } as const;
const team: PickerPerson[] = [
  { id: "anna", name: "Анна Ковальчук" },
  { id: "dmitry", name: "Дмитрий Андреев" },
];
const fields: FormFieldDefinition<Values>[] = [
  { name: "photo", kind: "file", label: "Изменить фото", span: { base: "full", sm: 2, lg: 2 },
    props: { variant: "avatar", name: "Дмитрий", accept: "image/*" } },
  { name: "name", label: "Имя", span: { base: "full", sm: 4, lg: 4 } },
  {
    name: "delay",
    kind: "number",
    label: "Задержка, мс",
    span: { base: "full", sm: 6, lg: 6 },
    props: { min: 0, max: 500, step: 10 },
  },
  {
    name: "driver",
    kind: "select",
    label: "Драйвер",
    span: column,
    props: { options: ["WASAPI", "ASIO", "DirectSound"] },
  },
  { name: "device", kind: "autocomplete", label: "Устройство", span: column,
    props: { options: ["Микрофон", "Гарнитура", "Линейный вход"] } },
  { name: "date", kind: "date", label: "Дата записи", span: column },
  { name: "color", kind: "color", label: "Цвет комнаты", span: column },
  { name: "volume", kind: "slider", label: "Громкость", span: column,
    props: { min: 0, max: 100 } },
  { name: "gain", kind: "rotary", label: "Усиление", span: column,
    props: { size: "xs", showLabel: true, suffix: "%" } },
  { name: "tags", kind: "tags", label: "Теги", span: column,
    props: { suggestions: ["Музыка", "Эфир", "Запись"] } },
  { name: "people", kind: "people", label: "Участники", span: column,
    props: { people: team } },
  { name: "confirmed", kind: "checkbox", label: "Настройки проверены", span: column },
  {
    name: "monitor",
    kind: "switch",
    label: "Мониторинг",
    span: column,
  },
  { name: "notes", kind: "textarea", label: "Заметки", span: "full" },
  { name: "theme", kind: "theme", label: "Тема", span: "full" },
  { name: "pinned", kind: "toggle", label: "Закрепить", span: column },
  { name: "view", kind: "segmented", label: "Вид", span: column,
    props: { items: [{ value: "list", label: "Список" }, { value: "grid", label: "Плитка" }] } },
  { name: "section", kind: "tabs", label: "Раздел", span: column,
    props: { items: [{ value: "profile", label: "Профиль" }, { value: "audio", label: "Аудио" }] } },
  { name: "nickname", kind: "custom", span: "full",
    render: (field, form) => <TextField label={`Позывной (${form.values.name})`}
      value={String(field.value ?? "")} onValueChange={field.onValueChange}
      onBlur={field.onBlur} error={field.touched ? field.error : undefined} /> },
];

export default function FormFieldsExample() {
  const form = useForm<Values>({
    initialValues: {
      name: "Дмитрий",
      delay: 120,
      driver: "ASIO",
      device: "Микрофон",
      notes: "",
      color: "#FF244C",
      date: "",
      photo: [],
      people: [],
      volume: 65,
      gain: 42,
      tags: [],
      confirmed: false,
      monitor: true,
      theme: "ruby",
      pinned: false,
      view: "list",
      section: "profile",
      nickname: "DJ",
    },
  });
  return (
    <Form form={form}>
      <Stack gap={4}>
        <FormFields fields={fields} />
        <Button type="submit" variant="primary" icon="save">
          Сохранить
        </Button>
      </Stack>
    </Form>
  );
}
