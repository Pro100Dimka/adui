import { Button, Stack, TextField } from "../../../index";
import { Form, useForm } from "./Form";
export default function FormExample() {
  const form = useForm({
      initialValues: { name: "A&D Voice" },
      validate: (v) => (!v.name ? { name: "Required" } : {}),
    }),
    name = form.field("name");
  return (
    <Form form={form}>
      <Stack gap={3}>
        <TextField
          label="Name"
          value={String(name.value ?? "")}
          onValueChange={name.onValueChange}
          error={name.touched ? name.error : undefined}
          onBlur={name.onBlur}
        />
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Stack>
    </Form>
  );
}
