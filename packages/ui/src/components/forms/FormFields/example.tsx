import React from "react";
import { Button, Stack } from "../../../index";
import { Form, useForm } from "../Form/Form";
import { FormFields, type FormFieldDefinition } from "./FormFields";
type Values = { name: string; age: number; role: string; enabled: boolean };
const fields: FormFieldDefinition<Values>[] = [
  { name: "name", label: "Name", span: 6 },
  { name: "age", kind: "number", label: "Age", span: 6 },
  {
    name: "role",
    kind: "select",
    label: "Role",
    props: { options: ["Singer", "Host", "Guest"] },
    span: 6,
  },
  { name: "enabled", kind: "switch", label: "Enabled", span: 6 },
];
export default function FormFieldsExample() {
  const form = useForm<Values>({
    initialValues: {
      name: "A&D Voice",
      age: 18,
      role: "Singer",
      enabled: true,
    },
  });
  return (
    <Form form={form}>
      <Stack gap={3}>
        <FormFields fields={fields} />
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Stack>
    </Form>
  );
}
