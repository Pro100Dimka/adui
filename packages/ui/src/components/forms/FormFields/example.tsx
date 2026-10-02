import { Button, Stack } from "@ad-voice/ui";
import {
  Form,
  FormFields,
  useForm,
  type FormFieldDefinition,
} from "@ad-voice/ui/forms";

type Values = { name: string; delay: number; driver: string; monitor: boolean };

const fields: FormFieldDefinition<Values>[] = [
  { name: "name", label: "Имя", span: { base: "full", sm: 6 } },
  {
    name: "delay",
    kind: "number",
    label: "Задержка, мс",
    span: { base: "full", sm: 6 },
    props: { min: 0, max: 500, step: 10 },
  },
  {
    name: "driver",
    kind: "select",
    label: "Драйвер",
    span: { base: "full", sm: 6 },
    props: { options: ["WASAPI", "ASIO", "DirectSound"] },
  },
  {
    name: "monitor",
    kind: "switch",
    label: "Мониторинг",
    span: { base: "full", sm: 6 },
  },
];

export default function FormFieldsExample() {
  const form = useForm<Values>({
    initialValues: {
      name: "Дмитрий",
      delay: 120,
      driver: "ASIO",
      monitor: true,
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
