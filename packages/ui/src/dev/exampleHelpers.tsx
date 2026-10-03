import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as UI from "../index";
import * as Editor from "../editor";

export const U = { ...UI, ...Editor };

/** True inside overview tiles: a playground shows only its specimens, without controls. */
export const ExamplePreviewContext = createContext(false);

/** Knobs that pick a look rather than tune it: all of their options are shown side by side. */
const spreadKeys = ["variant", "tone", "status", "material", "effect"];

/** The docs page listens here to show the code of the current playground state. */
export const ExampleCodeContext = createContext<
  ((code: string) => void) | null
>(null);

/** A prop the reader can change: a list of options (segmented) or a flag (switch). */
export type Knob =
  { options: readonly string[]; value: string } | { value: boolean };
type KnobValue<K> = K extends { options: readonly (infer O)[] }
  ? O
  : K extends { value: infer V }
    ? V
    : never;
export type KnobValues<K extends Record<string, Knob>> = {
  [P in keyof K]: KnobValue<K[P]>;
};

/** Marks a prop value that is printed as an expression: `{...}` instead of `"..."`. */
export const expr = (code: string) => ({ expr: code });

/** Prints a JSX element; undefined/false props are left out, short elements stay on one line. */
export function jsx(
  name: string,
  props: Record<string, unknown>,
  children?: string,
): string {
  const attrs = Object.entries(props).flatMap(([key, value]) => {
    if (value === undefined || value === false) return [];
    if (value === true) return [key];
    if (typeof value === "string") return [`${key}="${value}"`];
    if (value && typeof value === "object" && "expr" in value)
      return [`${key}={${(value as { expr: string }).expr}}`];
    return [`${key}={${JSON.stringify(value)}}`];
  });
  const close = children ? `>${children}</${name}>` : " />";
  const inline = `<${name}${attrs.map((a) => " " + a).join("")}${close}`;
  if (inline.length <= 56) return inline;
  const body = attrs.map((a) => `\n  ${a}`).join("");
  if (!children) return `<${name}${body}\n/>`;
  const open = attrs.length ? `<${name}${body}\n>` : `<${name}>`;
  return `${open}\n  ${children}\n</${name}>`;
}

/** Values that differ from the knob defaults, so generated code shows only what was changed. */
function changed<K extends Record<string, Knob>>(
  knobs: K,
  values: KnobValues<K>,
): Partial<KnobValues<K>> {
  const out: Partial<KnobValues<K>> = {};
  for (const key in knobs)
    if (values[key] !== knobs[key].value) out[key] = values[key];
  return out;
}

const knobLabels: Record<string, string> = {
  size: "Размер",
  variant: "Вид",
  disabled: "Disabled",
  readOnly: "Read only",
  error: "Ошибка",
  required: "Обязательное",
  clearable: "Очистка",
  loading: "Загрузка",
  icon: "Иконка",
  description: "Подсказка",
  round: "Круглая",
  multiple: "Несколько файлов",
  selected: "Выбрана",
  tone: "Тон",
  status: "Статус",
  value: "Значение",
  indeterminate: "Без значения",
  material: "Материал",
  border: "Анимированная рамка",
  level: "Уровень",
  compact: "Компактный",
  surface: "Подложка",
  segmented: "Сегменты",
  role: "Роль",
  active: "Активен",
  bars: "Столбики",
  playing: "Играет",
  flicker: "Мерцание",
  lines: "Строки",
  circle: "Аватар",
  effect: "Эффект",
  max: "Наклон, °",
  glare: "Блик",
  floating: "Подпись внутри",
  strands: "Нити",
  stars: "Звёзды",
  upload: "Облако загрузки",
};

/**
 * One live specimen with its props as controls. Replaces grids of near-identical copies:
 * the reader changes a prop and sees the component and its code update together.
 */
export function Playground<K extends Record<string, Knob>>({
  knobs,
  code,
  children,
  stretch = false,
  extra,
}: {
  knobs: K;
  code: (values: KnobValues<K>, changes: Partial<KnobValues<K>>) => string;
  children: (values: KnobValues<K>) => ReactNode;
  /** Let the specimen take the stage width (fields) instead of its own size (buttons). */
  stretch?: boolean;
  /** Short comparison shown under the controls, e.g. all variants side by side. */
  extra?: ReactNode;
}) {
  const [values, setValues] = useState(
    () =>
      Object.fromEntries(
        Object.entries(knobs).map(([k, v]) => [k, v.value]),
      ) as KnobValues<K>,
  );
  const report = useContext(ExampleCodeContext);
  const preview = useContext(ExamplePreviewContext);
  const spread = Object.keys(knobs).find(
    (key) => spreadKeys.includes(key) && "options" in knobs[key],
  ) as keyof K | undefined;
  const looks = spread
    ? (knobs[spread] as { options: readonly string[] }).options.map(
        (option) => ({ option, values: { ...values, [spread]: option } }),
      )
    : [{ option: "", values }];
  const source = looks
    .map((look) => code(look.values, changed(knobs, look.values)))
    .join("\n\n");
  const reported = useRef("");
  useEffect(() => {
    if (report && reported.current !== source) {
      reported.current = source;
      report(source);
    }
  }, [report, source]);
  const set = (key: keyof K, value: string | boolean) =>
    setValues((old) => ({ ...old, [key]: value }));

  return (
    <div className="example-playground">
      <div
        className="example-stage"
        data-stretch={stretch || undefined}
        data-spread={spread ? true : undefined}
      >
        {spread
          ? looks.map((look) => (
              <figure key={look.option}>
                {children(look.values)}
                <figcaption>{look.option}</figcaption>
              </figure>
            ))
          : children(values)}
      </div>
      {!preview && (
        <div className="example-knobs">
          {Object.entries(knobs)
            .filter(([key]) => key !== spread)
            .map(([key, knob]) =>
              "options" in knob ? (
                <div className="example-knob" key={key}>
                  <span>{knobLabels[key] ?? key}</span>
                  <U.SegmentedControl
                    size="xs"
                    label={knobLabels[key] ?? key}
                    value={values[key] as string}
                    onValueChange={(v) => set(key, v)}
                    items={knob.options.map((o) => ({ value: o, label: o }))}
                  />
                </div>
              ) : (
                <U.Switch
                  key={key}
                  size="xs"
                  label={knobLabels[key] ?? key}
                  checked={values[key] as boolean}
                  onValueChange={(v) => set(key, v)}
                />
              ),
            )}
        </div>
      )}
      {extra && !preview && <div className="example-extra">{extra}</div>}
    </div>
  );
}

/** Captioned specimens in one row, for comparisons that are clearer side by side. */
export function Compare({
  items,
  captions = true,
}: {
  items: Array<{ label: string; node: ReactNode }>;
  /** Hide captions when the specimens already show their name. */
  captions?: boolean;
}) {
  return (
    <div className="example-compare">
      {items.map((item) => (
        <figure key={item.label}>
          {item.node}
          {captions && <figcaption>{item.label}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export const sizes = ["xs", "sm", "md", "lg"] as const;
export const buttonVariants = [
  "primary",
  "secondary",
  "ghost",
  "danger",
] as const;
export const inputVariants = ["outlined", "filled", "underlined"] as const;
