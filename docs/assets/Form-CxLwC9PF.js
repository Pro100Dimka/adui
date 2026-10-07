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
  setPath = (value: any, path: string, next: unknown) => {
    const keys = path.split(".");
    const copy = (item: any) => Array.isArray(item) ? [...item] : { ...item };
    const root = copy(value);
    let cursor = root;
    let source = value;
    for (const key of keys.slice(0, -1)) {
      source = source?.[key] ?? {};
      cursor = cursor[key] = copy(source);
    }
    cursor[keys.at(-1)!] = next;
    return root;
  };
export function useForm<T extends Record<string, unknown>>(\r
  options: UseFormOptions<T>,\r
): FormApi<T> {\r
  const [values, setValues] = useState(options.initialValues),\r
    [errors, setErrors] = useState<FormErrors<T>>({}),\r
    [touched, setTouchedState] = useState<Record<string, boolean>>({}),\r
    [submitting, setSubmitting] = useState(false),\r
    // The latest values and options: several changes in one event all land, submit sees them at\r
    // once, and the methods below keep one identity for the life of the form (safe in effect deps).\r
    latest = useRef(values),
    touchedRef = useRef(touched),
    validationId = useRef(0),
    submittingRef = useRef(false),
    settings = useRef(options),
    initialKey = useMemo(() => JSON.stringify(options.initialValues), [options.initialValues]);
  const previousInitialKey = useRef(initialKey);
  settings.current = options;
  useEffect(() => {
    if (previousInitialKey.current === initialKey) return;
    previousInitialKey.current = initialKey;
    if (settings.current.reinitialize !== false) {
      latest.current = settings.current.initialValues;\r
      setValues(settings.current.initialValues);\r
      setErrors({});
      touchedRef.current = {};
      setTouchedState(touchedRef.current);
    }\r
  }, [initialKey]);\r
  const methods = useMemo(() => {\r
    const validate = async (next: T) => {
      const id = ++validationId.current;
      const result = (await settings.current.validate?.(next)) ?? {};
      if (id === validationId.current && next === latest.current) setErrors(result);
      return result;
    };
    const setValue = (path: string, value: unknown) => {
      if (Object.is(getPath(latest.current, path), value)) return;
      const next = setPath(latest.current, path, value);
      latest.current = next;\r
      setValues(next);\r
      if (settings.current.validateOnChange) void validate(next);\r
    };\r
    const setTouched = (path: string, state = true) => {
      if (Boolean(touchedRef.current[path]) !== state) {
        touchedRef.current = { ...touchedRef.current, [path]: state };
        setTouchedState(touchedRef.current);
      }
      if (state && settings.current.validateOnBlur !== false) void validate(latest.current);\r
    };\r
    const reset = (next = settings.current.initialValues) => {
      validationId.current += 1;
      latest.current = next;
      setValues(next);\r
      setErrors({});\r
      touchedRef.current = {};
      setTouchedState(touchedRef.current);
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
      submit: async () => {
        if (submittingRef.current) return false;
        submittingRef.current = true;
        setSubmitting(true);
        try {
          const next = latest.current;
          const result = await methods.validate(next);
          if (next !== latest.current || Object.values(result).some(Boolean)) return false;
          await settings.current.onSubmit?.(latest.current, api);
          return true;
        } finally {
          submittingRef.current = false;
          setSubmitting(false);
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
