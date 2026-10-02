import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
    const root = structuredClone(value),
      keys = path.split(".");
    let cursor = root;
    keys.slice(0, -1).forEach((key) => (cursor = cursor[key] ??= {}));
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
    initialKey = JSON.stringify(options.initialValues);
  useEffect(() => {
    if (options.reinitialize !== false) {
      setValues(options.initialValues);
      setErrors({});
      setTouchedState({});
    }
  }, [initialKey, options.reinitialize]);
  const validate = async (next = values) => {
    const result = (await options.validate?.(next)) ?? {};
    setErrors(result);
    return result;
  };
  const api = useMemo(
    () =>
      ({
        values,
        errors,
        touched,
        submitting,
        setValue: (path: string, value: unknown) => {
          const next = setPath(values, path, value);
          setValues(next);
          if (options.validateOnChange) void validate(next);
        },
        setTouched: (path: string, state = true) => {
          setTouchedState((current) => ({ ...current, [path]: state }));
          if (state && options.validateOnBlur !== false) void validate();
        },
        reset: (next = options.initialValues) => {
          setValues(next);
          setErrors({});
          setTouchedState({});
        },
        submit: async () => {
          const result = await validate();
          if (Object.values(result).some(Boolean)) return false;
          setSubmitting(true);
          try {
            await options.onSubmit?.(values, api as FormApi<T>);
            return true;
          } finally {
            setSubmitting(false);
          }
        },
        field: (path: string) => ({
          value: getPath(values, path),
          error: getPath(errors, path),
          touched: !!touched[path],
          onValueChange: (value: unknown) => api.setValue(path, value),
          onBlur: () => api.setTouched(path),
        }),
      }) as FormApi<T>,
    [values, errors, touched, submitting, options],
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
