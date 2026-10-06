import { memo, type ComponentType, type ReactNode } from "react";
import { Grid, type GridResponsive } from "../../layout/Grid/Grid";
import { TextField } from "../../controls/TextField/TextField";
import { NumberField } from "../../controls/NumberField/NumberField";
import { TextArea } from "../../controls/TextArea/TextArea";
import { Select } from "../../controls/Select/Select";
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";
import { Checkbox } from "../../controls/Checkbox/Checkbox";
import { Switch } from "../../controls/Switch/Switch";
import { ColorPicker } from "../../controls/ColorPicker/ColorPicker";
import { DatePicker } from "../../controls/DatePicker/DatePicker";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { PeoplePicker } from "../../controls/PeoplePicker/PeoplePicker";
import { Slider } from "../../controls/Slider/Slider";
import { TagInput } from "../../controls/TagInput/TagInput";
import { RotaryKnob } from "../../media/RotaryKnob/RotaryKnob";
import { useFormContext, type FormApi } from "../Form/Form";
export type FieldKind =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "autocomplete"
  | "checkbox"
  | "switch"
  | "color"
  | "date"
  | "file"
  | "people"
  | "slider"
  | "rotary"
  | "tags";
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
  color: ColorPicker,
  date: DatePicker,
  file: FilePicker,
  people: PeoplePicker,
  slider: Slider,
  rotary: RotaryKnob,
  tags: TagInput,
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
    <Grid columns={columns} gap={gap} align="center">
      {fields
        .filter((field) => field.showWhen?.(form.values) ?? true)
        .map((field) => (
          <StableSlot
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
  const kind = field.kind ?? "text",
    Component = registry[kind] ?? registry.text,
    b = form.field(field.name),
    emptyValue: Partial<Record<FieldKind, unknown>> = { people: [], tags: [], slider: 0 },
    props = kind === "checkbox" || kind === "switch"
      ? { checked: !!b.value, onValueChange: b.onValueChange }
      : kind === "file"
        ? {
            value: Array.isArray(b.value)
              ? b.value.map((file: File) => file.name).join(", ")
              : typeof b.value === "string" ? b.value : "",
            onFiles: b.onValueChange,
          }
      : kind === "rotary"
        ? { value: Number(b.value ?? 0), onValueChange: b.onValueChange }
      : {
          value: b.value ?? emptyValue[kind] ?? "",
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
const StableSlot = memo(Slot, (previous, next) => {
  if (previous.field !== next.field || previous.registry !== next.registry) return false;
  const before = previous.form.field(previous.field.name);
  const after = next.form.field(next.field.name);
  return Object.is(before.value, after.value) && before.error === after.error && before.touched === after.touched;
}) as typeof Slot;
