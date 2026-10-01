import React, { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { assignRef, clamp, copyText, define, mark, useControllable, type CommonProps, type Variant } from "../../../core/base";
import { useTabShape } from "../../../core/motion";
import { Icon } from "../../layout";
import { Menu, Dialog, type MenuItemData } from "../../feedback";

import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { ToggleButton } from "../ToggleButton";
import { SplitButton } from "../SplitButton";
import { Tab } from "../Tab";
import { Tabs } from "../Tabs";
import { SegmentedControl } from "../SegmentedControl";
import { Field } from "../Field";
import { TextField } from "../TextField";
import { NumberField } from "../NumberField";
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { FilePicker } from "../FilePicker";
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

export interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> {
  variant?: Variant; icon?: string; endIcon?: string; loading?: boolean; round?: boolean; label?: string; ref?: Ref<HTMLButtonElement>;
}

export function buttonView(p: ButtonProps, name = "Button") {
  const { variant = "secondary", icon, endIcon, loading, round, label, children, ref, ...rest } = p;
  const { size: _size, tone: _tone, material: _material, ...dom } = rest;
  return <button {...dom} {...mark(name, p, { primary: "ruby", secondary: "glass", danger: "danger", ghost: "ghost" }[variant] as "glass")}
    ref={ref} type={p.type ?? "button"} disabled={p.disabled || loading} aria-busy={loading || undefined} data-ad-variant={variant} data-ad-round={round || undefined}>
    {loading && <span className="ad-spinner" aria-hidden="true" />}
    {icon && <Icon name={icon} size={name === "IconButton" ? 22 : 21} />}{children ?? label}
    {endIcon && <Icon name={endIcon} size={18} />}
  </button>;
}

export interface IconButtonProps extends ButtonProps { label: string }

export interface ToggleButtonProps extends ButtonProps { checked?: boolean; defaultChecked?: boolean; onValueChange?: (value: boolean) => void }

export interface SplitButtonProps extends CommonProps { variant?: Variant; icon?: string; label?: string; items?: MenuItemData[]; onClick?: () => void }

export interface TabProps extends ButtonProps { selected?: boolean; panelId?: string }

export interface TabItem { value: string; label: ReactNode; icon?: string; disabled?: boolean; panelId?: string; id?: string }

export interface TabsProps extends CommonProps { items?: TabItem[]; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; label?: string }

export interface FieldContextValue { id: string; required?: boolean; error?: boolean; describedBy?: string }

export const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps extends CommonProps { label?: ReactNode; description?: ReactNode; error?: ReactNode; required?: boolean; info?: string; control?: ReactNode }

export interface TextFieldProps extends CommonProps, Omit<InputHTMLAttributes<HTMLInputElement>, keyof CommonProps | "size" | "value" | "defaultValue" | "onChange" | "type"> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void; onChange?: React.ChangeEventHandler<HTMLInputElement>;
  icon?: string; end?: ReactNode; clearable?: boolean; error?: boolean; label?: string; type?: "text" | "password" | "email" | "url" | "search" | "tel" | "number"; ref?: Ref<HTMLInputElement>;
}

export interface NumberFieldProps extends Omit<TextFieldProps, "value" | "defaultValue" | "onValueChange" | "type"> { value?: number | ""; defaultValue?: number | ""; onValueChange?: (value: number | "") => void }

export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps extends CommonProps { options?: Array<string | SelectOption>; value?: string; defaultValue?: string; onValueChange?: (value: string) => void; label?: string; icon?: string; disabled?: boolean; required?: boolean; name?: string; ref?: Ref<HTMLSelectElement> }

export interface BooleanProps extends CommonProps { checked?: boolean; defaultChecked?: boolean; onValueChange?: (value: boolean) => void; label?: ReactNode; disabled?: boolean; name?: string; required?: boolean }

export function BooleanControl({ kind, ...p }: BooleanProps & { kind: "Switch" | "Checkbox" }) {
  const field = useContext(FieldContext); const [checked, setChecked] = useControllable(p.checked, p.defaultChecked ?? false, p.onValueChange);
  return <label {...mark(kind, { ...p, id: undefined })}>
    <input id={p.id ?? field?.id} name={p.name} type="checkbox" role={kind === "Switch" ? "switch" : undefined} checked={checked} disabled={p.disabled} required={p.required ?? field?.required} aria-describedby={field?.describedBy} aria-label={typeof p.label === "string" ? p.label : kind} onChange={e => setChecked(e.currentTarget.checked)} />
    <span className="ad-toggle-track" aria-hidden="true"><i /></span><span>{p.label}</span>
  </label>;
}

export interface SliderProps extends CommonProps { value?: number; defaultValue?: number; min?: number; max?: number; step?: number; label?: string; disabled?: boolean; onValueChange?: (value: number) => void; ref?: Ref<HTMLInputElement> }

export interface FilePickerProps extends CommonProps { label?: string; description?: string; icon?: string; accept?: string; multiple?: boolean; onFiles?: (files: File[]) => void }

export interface PathFieldProps extends TextFieldProps { accept?: string; onFiles?: (files: File[]) => void }
