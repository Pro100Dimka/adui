import React, { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { assignRef, clamp, copyText, define, mark, useControllable, type CommonProps, type Variant } from "../../../core/base";
import { useTabShape } from "../../../core/motion";
import { Icon } from "../../layout";
import { Menu, Dialog, type MenuItemData } from "../../feedback";
import { buttonView, FieldContext, BooleanControl, type ButtonProps, type IconButtonProps, type ToggleButtonProps, type SplitButtonProps, type TabProps, type TabItem, type TabsProps, type FieldContextValue, type FieldProps, type TextFieldProps, type NumberFieldProps, type SelectOption, type SelectProps, type BooleanProps, type SliderProps, type FilePickerProps, type PathFieldProps } from "../_shared";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { ToggleButton } from "../ToggleButton";
import { SplitButton } from "../SplitButton";
import { Tab } from "../Tab";
import { Tabs } from "../Tabs";
import { SegmentedControl } from "../SegmentedControl";
import { Field } from "../Field";
import { NumberField } from "../NumberField";
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { FilePicker } from "../FilePicker";
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

export const TextField = define<TextFieldProps>("TextField", p => {
  const field = useContext(FieldContext); const input = useRef<HTMLInputElement>(null);
  const { value, defaultValue = "", onValueChange, onChange, onInput, icon, end, clearable, error, label, ref, children: _children, size: _size, tone: _tone, material: _mat, className: _cls, style: _style, ...dom } = p;
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange);
  return <div {...mark("TextField", { ...p, id: undefined }, "input")} data-ad-invalid={error || field?.error || undefined}>
    {icon && <Icon name={icon} size={21} />}
    <input {...dom} id={p.id ?? field?.id} ref={n => { input.current = n; assignRef(ref, n); }} type={p.type ?? "text"} value={current}
      required={p.required ?? field?.required} aria-label={p["aria-label"] ?? label} aria-invalid={error || field?.error || undefined} aria-describedby={p["aria-describedby"] ?? field?.describedBy}
      onInput={onInput} onChange={e => { setCurrent(e.currentTarget.value); onChange?.(e); }} />
    {clearable && <IconButton variant="ghost" size="small" icon="close" label="Очистить" disabled={p.disabled || p.readOnly} onClick={() => { setCurrent(""); input.current?.focus(); }} />}{end}
  </div>;
});
