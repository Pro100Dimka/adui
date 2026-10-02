import { Button, Stack, TextField } from "@ad-voice/ui";
import { Form, useForm } from "@ad-voice/ui/forms";

export default function FormExample() {
  const form = useForm({
    initialValues: { name: "" },
    validate: (values) => (values.name ? {} : { name: "Введите имя" }),
    onSubmit: (values) => alert(`Привет, ${values.name}!`),
  });
  const name = form.field("name");
  return (
    <Form form={form}>
      <Stack gap={3}>
        <TextField
          label="Имя в комнате"
          required
          value={String(name.value)}
          onValueChange={name.onValueChange}
          onBlur={name.onBlur}
          error={name.touched ? name.error : undefined}
        />
        <Button type="submit" variant="primary" loading={form.submitting}>
          Войти
        </Button>
      </Stack>
    </Form>
  );
}
