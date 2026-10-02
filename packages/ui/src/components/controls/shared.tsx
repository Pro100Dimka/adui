import React from "react";
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
/** Field appearance: boxed outline, tinted fill or a single bottom line. */
export type InputVariant = "outlined" | "filled" | "underlined";
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
}
export interface AutocompleteOption {
  value: string;
  label: string;
}
export interface AutocompleteProps extends TextFieldProps {
  options?: Array<string | AutocompleteOption>;
  onOptionSelect?: (value: string) => void;
}
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends CommonProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  options?: Array<string | SelectOption>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  variant?: InputVariant;
}
export interface BooleanProps extends CommonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  name?: string;
  required?: boolean;
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
  return (
    <label {...mark(kind, p)}>
      <input
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
}
