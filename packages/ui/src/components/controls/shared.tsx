import React, { useEffect, useRef } from "react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";
import {
  mark,
  ripple,
  useControllable,
  type CommonProps,
  type Variant,
} from "../../core/base";
import { Icon } from "../layout/Icon/Icon";
import { variantMaterial } from "./internal";

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
export function buttonView(p: ButtonProps, name = "Button") {
  const {
    variant = "secondary",
    icon,
    endIcon,
    loading,
    round,
    label,
    children,
    ref,
    onPointerMove,
    onPointerDown,
    onPointerLeave,
    ...rest
  } = p;
  const { size: _s, tone: _t, material: _m, ...dom } = rest;
  const trackLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--ad-button-x",
      `${((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      "--ad-button-y",
      `${((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100}%`,
    );
    onPointerMove?.(event);
  };
  const resetLight: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    event.currentTarget.style.removeProperty("--ad-button-x");
    event.currentTarget.style.removeProperty("--ad-button-y");
    onPointerLeave?.(event);
  };
  const content = children ?? label;
  return (
    <button
      {...dom}
      {...mark(name, p, variantMaterial[variant])}
      ref={ref}
      type={p.type ?? "button"}
      disabled={p.disabled || loading}
      aria-busy={loading || undefined}
      data-ad-variant={variant}
      data-ad-round={round || undefined}
      onPointerDown={(event) => {
        ripple(event.currentTarget, event.clientX, event.clientY);
        onPointerDown?.(event);
      }}
      onPointerMove={trackLight}
      onPointerLeave={resetLight}
    >
      <span className="ad-button-fx" aria-hidden="true" />
      <span className="ad-button-orbit" aria-hidden="true" />
      {loading && <span className="ad-spinner" aria-hidden="true" />}
      {icon && <Icon name={icon} />}{" "}
      {content != null && <span className="ad-button-label">{content}</span>}
      {endIcon && <Icon name={endIcon} />}
    </button>
  );
}
export interface IconButtonProps extends ButtonProps {
  label: string;
}
export interface ToggleButtonProps extends ButtonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
}
export interface SplitButtonProps extends CommonProps {
  variant?: Variant;
  icon?: string;
  label?: string;
  items?: any[];
  onClick?: () => void;
  children?: ReactNode;
}
export interface TabProps extends ButtonProps {
  selected?: boolean;
  panelId?: string;
}
export interface TabItem<V extends string = string> {
  value: V;
  label: ReactNode;
  icon?: string;
  disabled?: boolean;
  panelId?: string;
  id?: string;
}
/** `V` narrows the values, e.g. `Tabs<"audio" | "video">`, so handlers get the exact type. */
export interface TabsProps<V extends string = string> extends CommonProps {
  items?: TabItem<V>[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  label?: string;
}
/** Field appearance: boxed outline, tinted fill or a single bottom line. */
export type InputVariant = "outlined" | "filled" | "underlined";
/** Label above the field, or inside it rising on focus like Material inputs. */
export type LabelPlacement = "top" | "floating";
export interface FieldProps
  extends
    CommonProps,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      keyof CommonProps | "size" | "value" | "defaultValue" | "onChange"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
}
export interface TextFieldProps extends FieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  clearable?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
}
export interface NumberFieldProps extends Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onValueChange" | "type"
> {
  value?: number | "";
  defaultValue?: number | "";
  onValueChange?: (value: number | "") => void;
  /** The − and + buttons; off for values applied only when typing ends. */
  controls?: boolean;
}
export interface TextAreaProps
  extends
    Omit<CommonProps, "children">,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      keyof CommonProps | "value" | "defaultValue" | "onChange"
    > {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
  /** Which way the reader may drag the corner; `both` lets the field follow the width too. */
  resize?: "vertical" | "both" | "none";
}
export interface AutocompleteOption {
  value: string;
  label: string;
}
export interface AutocompleteProps extends TextFieldProps {
  options?: Array<string | AutocompleteOption>;
  onOptionSelect?: (value: string) => void;
}
/** One choice of a Select: any value, shown with rich content. */
export interface SelectOption<V = string> {
  value: V;
  /** What the option shows; any content (text, badges, markup). */
  label: ReactNode;
  /** Plain text of the option for search, screen readers and the form value; defaults to the label when it is text. */
  text?: string;
  /** Icon before the label. */
  icon?: string;
  /** A person or item picture before the label: initials from `name`, or a photo. */
  avatar?: { name: string; src?: string };
  /** A second, quieter line under the label. */
  description?: ReactNode;
  /** Options with the same group are listed together under its name. */
  group?: string;
  disabled?: boolean;
}
/**
 * `V` is the type of the values: strings, numbers or whole objects, e.g. `Select<User>`;
 * the handler gets that exact type back.
 */
export interface SelectProps<V = string> extends CommonProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  /** Plain strings or numbers, or options with labels, icons, avatars, descriptions and groups. */
  options?: Array<(V & (string | number)) | SelectOption<V>>;
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  /** Identity of a value, for values that are objects (default: the value itself, or its JSON). */
  getKey?: (value: V) => string;
  /** Your own content for an option in the list. */
  renderOption?: (option: SelectOption<V>, state: { selected: boolean }) => ReactNode;
  /** Your own content for the chosen value in the field. */
  renderValue?: (option: SelectOption<V>) => ReactNode;
  /** A search box above the list, for long lists. */
  searchable?: boolean;
  /** Placeholder of the search box. */
  searchPlaceholder?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  variant?: InputVariant;
  labelPlacement?: LabelPlacement;
}
export interface BooleanProps extends CommonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  /** Checkbox only: neither on nor off, e.g. "select all" when some rows are chosen. */
  indeterminate?: boolean;
}
export function BooleanControl({
  kind,
  ...p
}: BooleanProps & { kind: "Switch" | "Checkbox" }) {
  const [checked, setChecked] = useControllable(
    p.checked,
    p.defaultChecked ?? false,
    p.onValueChange,
  );
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (input.current) input.current.indeterminate = !!p.indeterminate;
  }, [p.indeterminate]);
  return (
    <label {...mark(kind, p)}>
      <input
        ref={input}
        name={p.name}
        type="checkbox"
        role={kind === "Switch" ? "switch" : undefined}
        checked={checked}
        disabled={p.disabled}
        required={p.required}
        onChange={(e) => setChecked(e.currentTarget.checked)}
      />
      <span className="ad-toggle-track" aria-hidden="true">
        <i />
      </span>
      <span>{p.label}</span>
    </label>
  );
}
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
export interface FilePickerProps extends CommonProps {
  label?: string;
  description?: string;
  icon?: string;
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** "zone" is a large drop area: icon, title, the picked name or hint; files can be dropped on it. */
  variant?: "button" | "zone";
  /** Your own chooser instead of the browser's file input (e.g. a native dialog of a desktop app). */
  onPick?: () => void;
  /** Name of the chosen file, when the choice is kept outside (with `onPick`). */
  value?: string;
  disabled?: boolean;
}
