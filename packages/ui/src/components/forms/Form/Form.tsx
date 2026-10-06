import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
export type FormErrors<T> = Partial<Record<keyof T, string>> &
  Record<string, string | undefined>;
export interface FormApi<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  touched: Record<string, boolean>;
  submitting: boolean;
  setValue: (path: string, value: unknown) => void;
  setTouched: (path: string, touched?: boolean) => void;
  reset: (values?: T) => void;
  submit: () => Promise<boolean>;
  field: (path: string) => {
    value: unknown;
    error?: string;
    touched: boolean;
    onValueChange: (value: unknown) => void;
    onBlur: () => void;
  };
}
export interface UseFormOptions<T extends Record<string, unknown>> {
  initialValues: T;
  validate?: (values: T) => FormErrors<T> | Promise<FormErrors<T>>;
  onSubmit?: (values: T, form: FormApi<T>) => void | Promise<void>;
  reinitialize?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}
const getPath = (value: any, path: string) =>
    path.split(".").reduce((current, key) => current?.[key], value),
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
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>,
): FormApi<T> {
  const [values, setValues] = useState(options.initialValues),
    [errors, setErrors] = useState<FormErrors<T>>({}),
    [touched, setTouchedState] = useState<Record<string, boolean>>({}),
    [submitting, setSubmitting] = useState(false),
    // The latest values and options: several changes in one event all land, submit sees them at
    // once, and the methods below keep one identity for the life of the form (safe in effect deps).
    latest = useRef(values),
    validationId = useRef(0),
    submittingRef = useRef(false),
    settings = useRef(options),
    initialKey = JSON.stringify(options.initialValues);
  const previousInitialKey = useRef(initialKey);
  settings.current = options;
  useEffect(() => {
    if (previousInitialKey.current === initialKey) return;
    previousInitialKey.current = initialKey;
    if (settings.current.reinitialize !== false) {
      latest.current = settings.current.initialValues;
      setValues(settings.current.initialValues);
      setErrors({});
      setTouchedState({});
    }
  }, [initialKey]);
  const methods = useMemo(() => {
    const validate = async (next: T) => {
      const id = ++validationId.current;
      const result = (await settings.current.validate?.(next)) ?? {};
      if (id === validationId.current && next === latest.current) setErrors(result);
      return result;
    };
    const setValue = (path: string, value: unknown) => {
      if (Object.is(getPath(latest.current, path), value)) return;
      const next = setPath(latest.current, path, value);
      latest.current = next;
      setValues(next);
      if (settings.current.validateOnChange) void validate(next);
    };
    const setTouched = (path: string, state = true) => {
      setTouchedState((current) => ({ ...current, [path]: state }));
      if (state && settings.current.validateOnBlur !== false) void validate(latest.current);
    };
    const reset = (next = settings.current.initialValues) => {
      validationId.current += 1;
      latest.current = next;
      setValues(next);
      setErrors({});
      setTouchedState({});
    };
    return { validate, setValue, setTouched, reset };
  }, []);
  const api: FormApi<T> = useMemo(
    () => ({
      values,
      errors,
      touched,
      submitting,
      setValue: methods.setValue,
      setTouched: methods.setTouched,
      reset: methods.reset,
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
        }
      },
      field: (path: string) => ({
        value: getPath(values, path),
        error: getPath(errors, path),
        touched: !!touched[path],
        onValueChange: (value: unknown) => methods.setValue(path, value),
        onBlur: () => methods.setTouched(path),
      }),
    }),
    [values, errors, touched, submitting, methods],
  );
  return api;
}
export interface FormProps<T extends Record<string, unknown>> {
  form: FormApi<T>;
  children: ReactNode;
  className?: string;
}
const Context = createContext<FormApi<any> | null>(null);
export function Form<T extends Record<string, unknown>>({
  form,
  children,
  className,
}: FormProps<T>) {
  return (
    <Context.Provider value={form}>
      <form
        className={className}
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void form.submit();
        }}
      >
        {children}
      </form>
    </Context.Provider>
  );
}
export function useFormContext<T extends Record<string, unknown>>() {
  const value = useContext(Context);
  if (!value) throw new Error("useFormContext must be used inside <Form>");
  return value as FormApi<T>;
}
