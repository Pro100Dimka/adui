const r=`import { type ComponentType, type ReactNode } from "react";\r
import { Grid, type GridResponsive } from "../../layout/Grid/Grid";\r
import { TextField } from "../../controls/TextField/TextField";\r
import { NumberField } from "../../controls/NumberField/NumberField";\r
import { TextArea } from "../../controls/TextArea/TextArea";\r
import { Select } from "../../controls/Select/Select";\r
import { Autocomplete } from "../../controls/Autocomplete/Autocomplete";\r
import { Checkbox } from "../../controls/Checkbox/Checkbox";\r
import { Switch } from "../../controls/Switch/Switch";\r
import { useFormContext, type FormApi } from "../Form/Form";\r
export type FieldKind =\r
  | "text"\r
  | "number"\r
  | "textarea"\r
  | "select"\r
  | "autocomplete"\r
  | "checkbox"\r
  | "switch";\r
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
export const defaultFieldRegistry: FieldRegistry = {\r
  text: TextField,\r
  number: NumberField,\r
  textarea: TextArea,\r
  select: Select,\r
  autocomplete: Autocomplete,\r
  checkbox: Checkbox,\r
  switch: Switch,\r
};\r
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
    <Grid columns={columns} gap={gap}>\r
      {fields\r
        .filter((field) => field.showWhen?.(form.values) ?? true)\r
        .map((field) => (\r
          <Slot\r
            key={field.name}\r
            field={field}\r
            form={form}\r
            registry={registry}\r
          />\r
        ))}\r
    </Grid>\r
  );\r
}\r
function Slot<T extends Record<string, unknown>>({\r
  field,\r
  form,\r
  registry,\r
}: {\r
  field: FormFieldDefinition<T>;\r
  form: FormApi<T>;\r
  registry: FieldRegistry;\r
}) {\r
  const Component = registry[field.kind ?? "text"] ?? registry.text,\r
    b = form.field(field.name),\r
    boolean = field.kind === "checkbox" || field.kind === "switch",\r
    props = boolean\r
      ? { checked: !!b.value, onValueChange: b.onValueChange }\r
      : {\r
          value: b.value ?? "",\r
          onValueChange: b.onValueChange,\r
          error: b.touched ? b.error : undefined,\r
          onBlur: b.onBlur,\r
        };\r
  return (\r
    <Grid span={field.span ?? "full"}>\r
      <Component label={field.label} {...field.props} {...props} />\r
    </Grid>\r
  );\r
}\r
`;export{r as default};
