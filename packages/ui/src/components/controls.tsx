import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import {
  assignRef,
  clamp,
  copyText,
  define,
  mark,
  useControllable,
  type CommonProps,
  type Variant,
} from "../core/base";
import { useTabShape } from "../core/motion";
import { Icon } from "./layout";
import { Menu, Dialog, type MenuItemData } from "./feedback";

export interface ButtonProps
  extends
    CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> {
  variant?: Variant;
  icon?: string;
  endIcon?: string;
  loading?: boolean;
  round?: boolean;
  label?: string;
  ref?: Ref<HTMLButtonElement>;
}
function buttonView(p: ButtonProps, name = "Button") {
  const {
    variant = "secondary",
    icon,
    endIcon,
    loading,
    round,
    label,
    children,
    ref,
    ...rest
  } = p;
  const { size: _size, tone: _tone, material: _material, ...dom } = rest;
  return (
    <button
      {...dom}
      {...mark(
        name,
        p,
        {
          primary: "ruby",
          secondary: "glass",
          danger: "danger",
          ghost: "ghost",
        }[variant] as "glass",
      )}
      ref={ref}
      type={p.type ?? "button"}
      disabled={p.disabled || loading}
      aria-busy={loading || undefined}
      data-ad-variant={variant}
      data-ad-round={round || undefined}
    >
      {loading && <span className="ad-spinner" aria-hidden="true" />}
      {icon && <Icon name={icon} size={name === "IconButton" ? 22 : 21} />}
      {children ?? label}
      {endIcon && <Icon name={endIcon} size={18} />}
    </button>
  );
}
export const Button = define<ButtonProps>("Button", (p) => buttonView(p));
export interface IconButtonProps extends ButtonProps {
  label: string;
}
export const IconButton = define<IconButtonProps>("IconButton", (p) =>
  buttonView(
    {
      ...p,
      icon: p.icon ?? "more",
      children: p.children ?? null,
      label: undefined,
      "aria-label": p.label,
      title: p.title ?? p.label,
    },
    "IconButton",
  ),
);
export interface ToggleButtonProps extends ButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
}
export const ToggleButton = define<ToggleButtonProps>(
  "ToggleButton",
  ({ checked, defaultChecked = false, onValueChange, onClick, ...p }) => {
    const [value, setValue] = useControllable(
      checked,
      defaultChecked,
      onValueChange,
    );
    return buttonView(
      {
        ...p,
        "aria-label": p["aria-label"] ?? (!p.children ? p.label : undefined),
        "aria-pressed": value,
        children: p.children ?? (p.icon ? null : p.label),
        label: undefined,
        onClick: (e) => {
          onClick?.(e);
          if (!e.defaultPrevented) setValue(!value);
        },
      },
      "ToggleButton",
    );
  },
);
export interface SplitButtonProps extends CommonProps {
  variant?: Variant;
  icon?: string;
  label?: string;
  items?: MenuItemData[];
  onClick?: () => void;
}
export const SplitButton = define<SplitButtonProps>("SplitButton", (p) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div
      {...mark("SplitButton", p, p.variant === "secondary" ? "glass" : "ruby")}
    >
      <Button variant="ghost" icon={p.icon ?? "save"} onClick={p.onClick}>
        {p.children ?? p.label ?? "Сохранить"}
      </Button>
      <IconButton
        ref={anchor}
        variant="ghost"
        icon="chevron"
        label="Другие действия"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      />
      <Menu
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]}
      />
    </div>
  );
});
export interface TabProps extends ButtonProps {
  selected?: boolean;
  panelId?: string;
}
export const Tab = define<TabProps>(
  "Tab",
  ({ selected = false, panelId, ref: externalRef, ...p }) => {
    const ref = useRef<HTMLButtonElement>(null);
    useTabShape(ref);
    return buttonView(
      {
        ...p,
        className: `ad-button ad-tab ${p.className ?? ""}`,
        variant: "ghost",
        role: "tab",
        "aria-selected": selected,
        "aria-controls": panelId,
        tabIndex: selected ? 0 : -1,
        ref: (n) => {
          ref.current = n;
          assignRef(externalRef, n);
        },
      },
      "Tab",
    );
  },
);
export interface TabItem {
  value: string;
  label: ReactNode;
  icon?: string;
  disabled?: boolean;
  panelId?: string;
  id?: string;
}
export interface TabsProps extends CommonProps {
  items?: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
}
export const Tabs = define<TabsProps>("Tabs", (p) => {
  const items = p.items ?? [
    { value: "appearance", label: "Внешний вид", icon: "palette" },
    { value: "audio", label: "Аудио", icon: "audio" },
    { value: "advanced", label: "Дополнительно", icon: "wrench" },
  ];
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? items[0]?.value ?? "",
    p.onValueChange,
  );
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <nav
      {...mark("Tabs", p, "glass")}
      role="tablist"
      aria-label={p.label ?? "Разделы"}
      onKeyDown={(e) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
        const available = items
          .map((item, index) => ({ item, index }))
          .filter((x) => !x.item.disabled);
        if (!available.length) return;
        e.preventDefault();
        const current = available.findIndex(
          (x) => buttons.current[x.index] === document.activeElement,
        );
        const next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? available.length - 1
              : (current +
                  (e.key === "ArrowRight" ? 1 : -1) +
                  available.length) %
                available.length;
        setValue(available[next].item.value);
        buttons.current[available[next].index]?.focus();
      }}
    >
      {items.map((item, index) => (
        <Tab
          key={item.value}
          id={item.id}
          ref={(n) => {
            buttons.current[index] = n;
          }}
          icon={item.icon}
          panelId={item.panelId}
          disabled={item.disabled}
          selected={item.value === value}
          onClick={() => setValue(item.value)}
        >
          {item.label}
        </Tab>
      ))}
    </nav>
  );
});
export const SegmentedControl = define<TabsProps>("SegmentedControl", (p) => (
  <div {...mark("SegmentedControl", p)}>
    <Tabs
      {...p}
      items={
        p.items ?? [
          { value: "list", label: "Список", icon: "list" },
          { value: "grid", label: "Плитка", icon: "grid" },
        ]
      }
    />
  </div>
));

interface FieldContextValue {
  id: string;
  required?: boolean;
  error?: boolean;
  describedBy?: string;
}
const FieldContext = createContext<FieldContextValue | null>(null);
export interface FieldProps extends CommonProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  info?: string;
  control?: ReactNode;
}
export const Field = define<FieldProps>("Field", (p) => {
  const uid = useId();
  const id = p.id ?? `field-${uid}`;
  const help = p.error || p.description;
  const [infoOpen, setInfoOpen] = useState(false);
  return (
    <FieldContext.Provider
      value={{
        id,
        required: p.required,
        error: !!p.error,
        describedBy: help ? `${id}-help` : undefined,
      }}
    >
      <div {...mark("Field", { ...p, id: undefined })}>
        <div className="ad-field-label">
          <label htmlFor={id}>
            {p.label ?? "Название поля"}
            {p.required ? " *" : ""}
          </label>
          {p.info && (
            <IconButton
              variant="ghost"
              size="small"
              icon="info"
              label={p.info}
              onClick={() => setInfoOpen(true)}
            />
          )}
        </div>
        {p.control ?? p.children}
        {help && (
          <small
            id={`${id}-help`}
            className={p.error ? "ad-field-error" : undefined}
          >
            {help}
          </small>
        )}
        {p.info && (
          <Dialog
            open={infoOpen}
            onOpenChange={setInfoOpen}
            title="Информация"
            description={p.info}
            cancelLabel={false}
          />
        )}
      </div>
    </FieldContext.Provider>
  );
});
export interface TextFieldProps
  extends
    CommonProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      | keyof CommonProps
      | "size"
      | "value"
      | "defaultValue"
      | "onChange"
      | "type"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  icon?: string;
  end?: ReactNode;
  clearable?: boolean;
  error?: boolean;
  label?: string;
  type?: "text" | "password" | "email" | "url" | "search" | "tel" | "number";
  ref?: Ref<HTMLInputElement>;
}
export const TextField = define<TextFieldProps>("TextField", (p) => {
  const field = useContext(FieldContext);
  const input = useRef<HTMLInputElement>(null);
  const {
    value,
    defaultValue = "",
    onValueChange,
    onChange,
    onInput,
    icon,
    end,
    clearable,
    error,
    label,
    ref,
    children: _children,
    size: _size,
    tone: _tone,
    material: _mat,
    className: _cls,
    style: _style,
    ...dom
  } = p;
  const [current, setCurrent] = useControllable(
    value,
    defaultValue,
    onValueChange,
  );
  return (
    <div
      {...mark("TextField", { ...p, id: undefined }, "input")}
      data-ad-invalid={error || field?.error || undefined}
    >
      {icon && <Icon name={icon} size={21} />}
      <input
        {...dom}
        id={p.id ?? field?.id}
        ref={(n) => {
          input.current = n;
          assignRef(ref, n);
        }}
        type={p.type ?? "text"}
        value={current}
        required={p.required ?? field?.required}
        aria-label={p["aria-label"] ?? label}
        aria-invalid={error || field?.error || undefined}
        aria-describedby={p["aria-describedby"] ?? field?.describedBy}
        onInput={onInput}
        onChange={(e) => {
          setCurrent(e.currentTarget.value);
          onChange?.(e);
        }}
      />
      {clearable && (
        <IconButton
          variant="ghost"
          size="small"
          icon="close"
          label="Очистить"
          disabled={p.disabled || p.readOnly}
          onClick={() => {
            setCurrent("");
            input.current?.focus();
          }}
        />
      )}
      {end}
    </div>
  );
});
export interface NumberFieldProps extends Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onValueChange" | "type"
> {
  value?: number | "";
  defaultValue?: number | "";
  onValueChange?: (value: number | "") => void;
}
export const NumberField = define<NumberFieldProps>(
  "NumberField",
  ({ value, defaultValue = 0, onValueChange, ...p }) => (
    <TextField
      {...p}
      type="number"
      value={value === undefined ? undefined : String(value)}
      defaultValue={String(defaultValue)}
      onValueChange={(v) => onValueChange?.(v === "" ? "" : Number(v))}
      className={`ad-number-field ${p.className ?? ""}`}
    />
  ),
);
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends CommonProps {
  options?: Array<string | SelectOption>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ref?: Ref<HTMLSelectElement>;
}
export const Select = define<SelectProps>("Select", (p) => {
  const field = useContext(FieldContext);
  const options = p.options ?? ["Первый вариант", "Второй вариант"];
  const first =
    typeof options[0] === "string" ? options[0] : (options[0]?.value ?? "");
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? first,
    p.onValueChange,
  );
  return (
    <div {...mark("Select", { ...p, id: undefined }, "glass")}>
      {p.icon && <Icon name={p.icon} size={20} />}
      <select
        ref={p.ref}
        id={p.id ?? field?.id}
        name={p.name}
        value={value}
        disabled={p.disabled}
        required={p.required ?? field?.required}
        aria-invalid={field?.error || undefined}
        aria-describedby={field?.describedBy}
        aria-label={p.label}
        onChange={(e) => setValue(e.currentTarget.value)}
      >
        {options.map((option) => {
          const o =
            typeof option === "string"
              ? { value: option, label: option }
              : option;
          return (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          );
        })}
      </select>
      <Icon name="chevron" size={16} />
    </div>
  );
});
export interface BooleanProps extends CommonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}
function BooleanControl({
  kind,
  ...p
}: BooleanProps & { kind: "Switch" | "Checkbox" }) {
  const field = useContext(FieldContext);
  const [checked, setChecked] = useControllable(
    p.checked,
    p.defaultChecked ?? false,
    p.onValueChange,
  );
  return (
    <label {...mark(kind, { ...p, id: undefined })}>
      <input
        id={p.id ?? field?.id}
        name={p.name}
        type="checkbox"
        role={kind === "Switch" ? "switch" : undefined}
        checked={checked}
        disabled={p.disabled}
        required={p.required ?? field?.required}
        aria-describedby={field?.describedBy}
        aria-label={typeof p.label === "string" ? p.label : kind}
        onChange={(e) => setChecked(e.currentTarget.checked)}
      />
      <span className="ad-toggle-track" aria-hidden="true">
        <i />
      </span>
      <span>{p.label}</span>
    </label>
  );
}
export const Switch = define<BooleanProps>("Switch", (p) => (
  <BooleanControl kind="Switch" {...p} />
));
export const Checkbox = define<BooleanProps>("Checkbox", (p) => (
  <BooleanControl kind="Checkbox" {...p} />
));
export interface SliderProps extends CommonProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
  ref?: Ref<HTMLInputElement>;
}
export const Slider = define<SliderProps>("Slider", (p) => {
  const field = useContext(FieldContext);
  const min = p.min ?? 0,
    max = Math.max(min, p.max ?? 100);
  const [value, setValue] = useControllable(
    p.value,
    p.defaultValue ?? 35,
    p.onValueChange,
  );
  const current = clamp(value, min, max);
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  return (
    <input
      {...mark("Slider", p)}
      ref={p.ref}
      id={p.id ?? field?.id}
      type="range"
      value={current}
      min={min}
      max={max}
      step={p.step ?? 1}
      disabled={p.disabled}
      aria-label={p.label ?? "Значение"}
      style={{ "--ad-level": `${percent}%`, ...p.style } as React.CSSProperties}
      onChange={(e) => setValue(Number(e.currentTarget.value))}
    />
  );
});
export interface FilePickerProps extends CommonProps {
  label?: string;
  description?: string;
  icon?: string;
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
}
export const FilePicker = define<FilePickerProps>("FilePicker", (p) => {
  const file = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState("");
  return (
    <div {...mark("FilePicker", p)}>
      <Button icon={p.icon ?? "folder"} onClick={() => file.current?.click()}>
        {p.label ?? "Выбрать файл"}
      </Button>
      <small>{names || p.description || "Файл не выбран"}</small>
      <input
        type="file"
        ref={file}
        hidden
        accept={p.accept}
        multiple={p.multiple}
        onChange={(e) => {
          const files = Array.from(e.currentTarget.files ?? []);
          setNames(files.map((f) => f.name).join(", "));
          p.onFiles?.(files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
});
export interface PathFieldProps extends TextFieldProps {
  accept?: string;
  onFiles?: (files: File[]) => void;
}
export const PathField = define<PathFieldProps>(
  "PathField",
  ({ onFiles, accept, value, defaultValue, onValueChange, ...p }) => {
    const [current, setCurrent] = useControllable(
      value,
      defaultValue ?? "Папка данных приложения",
      onValueChange,
    );
    const file = useRef<HTMLInputElement>(null);
    return (
      <>
        <TextField
          {...p}
          className={`ad-path-field ${p.className ?? ""}`}
          value={current}
          readOnly
          icon="folder"
          end={
            <IconButton
              variant="ghost"
              icon="folder"
              label="Выбрать файл"
              onClick={() => file.current?.click()}
            />
          }
        />
        <input
          ref={file}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            if (files[0]) setCurrent(files[0].name);
            onFiles?.(files);
            e.currentTarget.value = "";
          }}
        />
      </>
    );
  },
);
export const CopyableField = define<TextFieldProps>(
  "CopyableField",
  ({ value, defaultValue, onValueChange, ...p }) => {
    const [current, setCurrent] = useControllable(
      value,
      defaultValue ?? "AD-DEMO-ROOM-2026",
      onValueChange,
    );
    const [copied, setCopied] = useState(false);
    return (
      <TextField
        {...p}
        value={current}
        onValueChange={(v) => {
          setCurrent(v);
          setCopied(false);
        }}
        className={`ad-copyable-field ${p.className ?? ""}`}
        end={
          <IconButton
            variant="ghost"
            icon={copied ? "check" : "copy"}
            label={copied ? "Скопировано" : "Копировать"}
            onClick={async () => setCopied(await copyText(current))}
          />
        }
      />
    );
  },
);
