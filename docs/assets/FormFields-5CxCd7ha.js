const e=`import { memo, type ComponentType, type ReactNode } from "react";
import { Grid, type GridResponsive } from "../../layout/Grid/Grid";\r
import { TextField } from "../../controls/TextField/TextField";\r
import { NumberField } from "../../controls/NumberField/NumberField";\r
import { TextArea } from "../../controls/TextArea/TextArea";\r
import { Select } from "../../controls/Select/Select";\r
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";\r
import { Checkbox } from "../../controls/Checkbox/Checkbox";\r
import { Switch } from "../../controls/Switch/Switch";
import { ColorPicker } from "../../controls/ColorPicker/ColorPicker";
import { DatePicker } from "../../controls/DatePicker/DatePicker";
import { FilePicker } from "../../controls/FilePicker/FilePicker";
import { PeoplePicker } from "../../controls/PeoplePicker/PeoplePicker";
import { Slider } from "../../controls/Slider/Slider";
import { TagInput } from "../../controls/TagInput/TagInput";
import { RotaryKnob } from "../../media/RotaryKnob/RotaryKnob";
import { useFormContext, type FormApi } from "../Form/Form";\r
export type FieldKind =\r
  | "text"\r
  | "number"\r
  | "textarea"\r
  | "select"\r
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
export interface FormFieldDefinition<\r
  T extends Record<string, unknown> = Record<string, unknown>,\r
> {\r
  name: string;\r
  kind?: FieldKind;\r
  label?: ReactNode;\r
  span?: GridResponsive<number | "full">;\r
  showWhen?: (values: T) => boolean;\r
  props?: Record<string, unknown>;\r
}\r
export type FieldRegistry = Record<string, ComponentType<any>>;\r
export const defaultFieldRegistry: FieldRegistry = {
  text: TextField,\r
  number: NumberField,\r
  textarea: TextArea,\r
  select: Select,\r
  autocomplete: Autocomplete,\r
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
const bindings: Record<"checked" | "file" | "rotary" | "value", (field: ReturnType<FormApi<Record<string, unknown>>["field"]>, kind: FieldKind) => object> = {
  checked: (field) => ({ checked: Boolean(field.value), onValueChange: field.onValueChange }),
  file: (field) => {
    let value = "";
    if (Array.isArray(field.value)) value = field.value.map((file: File) => file.name).join(", ");
    else if (typeof field.value === "string") value = field.value;
    return { value, onFiles: field.onValueChange };
  },
  rotary: (field) => ({ value: Number(field.value ?? 0), onValueChange: field.onValueChange }),
  value: (field, kind) => {
    const emptyValue: Partial<Record<FieldKind, unknown>> = { people: [], tags: [], slider: 0 };
    return {
      value: field.value ?? emptyValue[kind] ?? "",
      onValueChange: field.onValueChange,
      error: field.touched ? field.error : undefined,
      onBlur: field.onBlur,
    };
  },
};
const bindingKind: Partial<Record<FieldKind, keyof typeof bindings>> = {
  checkbox: "checked", switch: "checked", file: "file", rotary: "rotary",
};
export interface FormFieldsProps<T extends Record<string, unknown>> {\r
  fields: readonly FormFieldDefinition<T>[];\r
  registry?: FieldRegistry;\r
  columns?: number;\r
  gap?: number;\r
}\r
export function FormFields<T extends Record<string, unknown>>({\r
  fields,\r
  registry = defaultFieldRegistry,\r
  columns = 12,\r
  gap = 3,\r
}: FormFieldsProps<T>) {\r
  const form = useFormContext<T>();\r
  return (\r
    <Grid columns={columns} gap={gap} align="center" className="ad-form-fields">
      {fields\r
        .filter((field) => field.showWhen?.(form.values) ?? true)\r
        .map((field) => (\r
          <StableSlot
            key={field.name}\r
            field={field}\r
            form={form}\r
            registry={registry}\r
          />\r
        ))}\r
    </Grid>\r
  );\r
}\r
function Slot<T extends Record<string, unknown>>({
  field,\r
  form,\r
  registry,\r
}: {\r
  field: FormFieldDefinition<T>;\r
  form: FormApi<T>;\r
  registry: FieldRegistry;\r
}) {\r
  const kind = field.kind ?? "text",
    Component = registry[kind] ?? registry.text,
    props = bindings[bindingKind[kind] ?? "value"](form.field(field.name), kind);
  return (\r
    <Grid span={field.span ?? "full"} className="ad-form-field">
      <Component label={field.label} {...field.props} {...props} />\r
    </Grid>\r
  );
}
const StableSlot = memo(Slot, (previous, next) => {
  if (previous.field !== next.field || previous.registry !== next.registry) return false;
  const before = previous.form.field(previous.field.name);
  const after = next.form.field(next.field.name);
  return Object.is(before.value, after.value) && before.error === after.error && before.touched === after.touched;
}) as typeof Slot;
`;export{e as default};
