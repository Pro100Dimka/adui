import React, { type ComponentType, type ReactNode } from "react";
import { Grid, type GridResponsive } from "../../layout/Grid/Grid";
import { TextField } from "../../controls/TextField/TextField";
import { NumberField } from "../../controls/NumberField/NumberField";
import { TextArea } from "../../controls/TextArea/TextArea";
import { Select } from "../../controls/Select/Select";
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";
import { Checkbox } from "../../controls/Checkbox/Checkbox";
import { Switch } from "../../controls/Switch/Switch";
import { useFormContext, type FormApi } from "../Form/Form";
export type FieldKind =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "autocomplete"
  | "checkbox"
  | "switch";
export interface FormFieldDefinition<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  name: string;
  kind?: FieldKind;
  label?: ReactNode;
  span?: GridResponsive<number | "full">;
  showWhen?: (values: T) => boolean;
  props?: Record<string, unknown>;
}
export type FieldRegistry = Record<string, ComponentType<any>>;
export const defaultFieldRegistry: FieldRegistry = {
  text: TextField,
  number: NumberField,
  textarea: TextArea,
  select: Select,
  autocomplete: Autocomplete,
  checkbox: Checkbox,
  switch: Switch,
};
export interface FormFieldsProps<T extends Record<string, unknown>> {
  fields: readonly FormFieldDefinition<T>[];
  registry?: FieldRegistry;
  columns?: number;
  gap?: number;
}
export function FormFields<T extends Record<string, unknown>>({
  fields,
  registry = defaultFieldRegistry,
  columns = 12,
  gap = 3,
}: FormFieldsProps<T>) {
  const form = useFormContext<T>();
  return (
    <Grid columns={columns} gap={gap}>
      {fields
        .filter((field) => field.showWhen?.(form.values) ?? true)
        .map((field) => (
          <Slot
            key={field.name}
            field={field}
            form={form}
            registry={registry}
          />
        ))}
    </Grid>
  );
}
function Slot<T extends Record<string, unknown>>({
  field,
  form,
  registry,
}: {
  field: FormFieldDefinition<T>;
  form: FormApi<T>;
  registry: FieldRegistry;
}) {
  const Component = registry[field.kind ?? "text"] ?? registry.text,
    b = form.field(field.name),
    boolean = field.kind === "checkbox" || field.kind === "switch",
    props = boolean
      ? { checked: !!b.value, onValueChange: b.onValueChange }
      : {
          value: b.value ?? "",
          onValueChange: b.onValueChange,
          error: b.touched ? b.error : undefined,
          onBlur: b.onBlur,
        };
  return (
    <Grid span={field.span ?? "full"}>
      <Component label={field.label} {...field.props} {...props} />
    </Grid>
  );
}
