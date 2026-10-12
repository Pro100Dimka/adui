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
const getPath = (value: unknown, path: string): unknown =>\r
    path.split(".").reduce<unknown>((current, key) => current == null ? undefined : Reflect.get(Object(current), key), value),\r
  setPath = <T extends Record<string, unknown>>(value: T, path: string, next: unknown): T => {\r
    const keys = path.split(".");
    const root = { ...value };\r
    let cursor: object = root;\r
    let source: unknown = value;\r
    for (const key of keys.slice(0, -1)) {
      source = getPath(source, key);\r
      const branch: object = Array.isArray(source) ? [...source] : Object.assign({}, source);\r
      Reflect.set(cursor, key, branch);\r
      cursor = branch;\r
    }
    Reflect.set(cursor, keys[keys.length - 1], next);\r
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
      const result: FormErrors<T> = (await settings.current.validate?.(next)) ?? {};\r
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
      if ((Object.hasOwn(touchedRef.current, path) && Boolean(touchedRef.current[path])) !== state) {\r
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
          if (next !== latest.current) return false;\r
          const invalid = Object.keys(result).filter((path) => result[path]);\r
          if (invalid.length) {\r
            touchedRef.current = { ...touchedRef.current, ...Object.fromEntries(invalid.map((path) => [path, true])) };\r
            setTouchedState(touchedRef.current);\r
            return false;\r
          }\r
          await settings.current.onSubmit?.(latest.current, api);
          return true;
        } finally {
          submittingRef.current = false;
          setSubmitting(false);
        }\r
      },\r
      field: (path: string) => {\r
        const error = errors[path] ?? getPath(errors, path);\r
        return {\r
          value: getPath(values, path),\r
          error: typeof error === "string" ? error : undefined,\r
          touched: Object.hasOwn(touched, path) && !!touched[path],\r
          onValueChange: (value: unknown) => methods.setValue(path, value),\r
          onBlur: () => methods.setTouched(path),\r
        };\r
      },\r
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
// One context carries different form schemas. The provider/consumer generic restores the\r
// schema at this boundary; a single Record<string, unknown> would reject typed reset callbacks.\r
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
