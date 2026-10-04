const e=`import {\r
  createContext,\r
  useContext,\r
  useEffect,\r
  useMemo,\r
  useRef,\r
  useState,\r
  type FormEvent,\r
  type ReactNode,\r
} from "react";\r
export type FormErrors<T> = Partial<Record<keyof T, string>> &\r
  Record<string, string | undefined>;\r
export interface FormApi<T extends Record<string, unknown>> {\r
  values: T;\r
  errors: FormErrors<T>;\r
  touched: Record<string, boolean>;\r
  submitting: boolean;\r
  setValue: (path: string, value: unknown) => void;\r
  setTouched: (path: string, touched?: boolean) => void;\r
  reset: (values?: T) => void;\r
  submit: () => Promise<boolean>;\r
  field: (path: string) => {\r
    value: unknown;\r
    error?: string;\r
    touched: boolean;\r
    onValueChange: (value: unknown) => void;\r
    onBlur: () => void;\r
  };\r
}\r
export interface UseFormOptions<T extends Record<string, unknown>> {\r
  initialValues: T;\r
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;\r
  onSubmit?: (values: T, form: FormApi<T>) => void | Promise<void>;\r
  reinitialize?: boolean;\r
  validateOnChange?: boolean;\r
  validateOnBlur?: boolean;\r
}\r
const getPath = (value: any, path: string) =>\r
    path.split(".").reduce((current, key) => current?.[key], value),\r
  setPath = (value: any, path: string, next: unknown) => {\r
    const root = structuredClone(value),\r
      keys = path.split(".");\r
    let cursor = root;\r
    keys.slice(0, -1).forEach((key) => (cursor = cursor[key] ??= {}));\r
    cursor[keys.at(-1)!] = next;\r
    return root;\r
  };\r
export function useForm<T extends Record<string, unknown>>(\r
  options: UseFormOptions<T>,\r
): FormApi<T> {\r
  const [values, setValues] = useState(options.initialValues),\r
    [errors, setErrors] = useState<FormErrors<T>>({}),\r
    [touched, setTouchedState] = useState<Record<string, boolean>>({}),\r
    [submitting, setSubmitting] = useState(false),\r
    // The latest values and options: several changes in one event all land, submit sees them at\r
    // once, and the methods below keep one identity for the life of the form (safe in effect deps).\r
    latest = useRef(values),\r
    settings = useRef(options),\r
    initialKey = JSON.stringify(options.initialValues);\r
  settings.current = options;\r
  useEffect(() => {\r
    if (settings.current.reinitialize !== false) {\r
      latest.current = settings.current.initialValues;\r
      setValues(settings.current.initialValues);\r
      setErrors({});\r
      setTouchedState({});\r
    }\r
  }, [initialKey]);\r
  const methods = useMemo(() => {\r
    const validate = async (next: T) => {\r
      const result = (await settings.current.validate?.(next)) ?? {};\r
      setErrors(result);\r
      return result;\r
    };\r
    const setValue = (path: string, value: unknown) => {\r
      const next = setPath(latest.current, path, value);\r
      latest.current = next;\r
      setValues(next);\r
      if (settings.current.validateOnChange) void validate(next);\r
    };\r
    const setTouched = (path: string, state = true) => {\r
      setTouchedState((current) => ({ ...current, [path]: state }));\r
      if (state && settings.current.validateOnBlur !== false) void validate(latest.current);\r
    };\r
    const reset = (next = settings.current.initialValues) => {\r
      latest.current = next;\r
      setValues(next);\r
      setErrors({});\r
      setTouchedState({});\r
    };\r
    return { validate, setValue, setTouched, reset };\r
  }, []);\r
  const api: FormApi<T> = useMemo(\r
    () => ({\r
      values,\r
      errors,\r
      touched,\r
      submitting,\r
      setValue: methods.setValue,\r
      setTouched: methods.setTouched,\r
      reset: methods.reset,\r
      submit: async () => {\r
        const result = await methods.validate(latest.current);\r
        if (Object.values(result).some(Boolean)) return false;\r
        setSubmitting(true);\r
        try {\r
          await settings.current.onSubmit?.(latest.current, api);\r
          return true;\r
        } finally {\r
          setSubmitting(false);\r
        }\r
      },\r
      field: (path: string) => ({\r
        value: getPath(values, path),\r
        error: getPath(errors, path),\r
        touched: !!touched[path],\r
        onValueChange: (value: unknown) => methods.setValue(path, value),\r
        onBlur: () => methods.setTouched(path),\r
      }),\r
    }),\r
    [values, errors, touched, submitting, methods],\r
  );\r
  return api;\r
}\r
export interface FormProps<T extends Record<string, unknown>> {\r
  form: FormApi<T>;\r
  children: ReactNode;\r
  className?: string;\r
}\r
const Context = createContext<FormApi<any> | null>(null);\r
export function Form<T extends Record<string, unknown>>({\r
  form,\r
  children,\r
  className,\r
}: FormProps<T>) {\r
  return (\r
    <Context.Provider value={form}>\r
      <form\r
        className={className}\r
        onSubmit={(event: FormEvent) => {\r
          event.preventDefault();\r
          void form.submit();\r
        }}\r
      >\r
        {children}\r
      </form>\r
    </Context.Provider>\r
  );\r
}\r
export function useFormContext<T extends Record<string, unknown>>() {\r
  const value = useContext(Context);\r
  if (!value) throw new Error("useFormContext must be used inside <Form>");\r
  return value as FormApi<T>;\r
}\r
`;export{e as default};
