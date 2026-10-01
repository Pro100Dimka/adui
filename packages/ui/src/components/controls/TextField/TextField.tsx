import React, { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { assignRef, clamp, copyText, define, mark, useControllable, type CommonProps, type Variant } from "../../../core/base";
import { useTabShape } from "../../../core/motion/hooks";
import { Icon } from "../../layout/Icon/Icon";
import { Menu } from "../../feedback/Menu/Menu";
import { Dialog } from "../../feedback/Dialog/Dialog";
import { type MenuItemData } from "../../feedback/shared";
import { buttonView, FieldContext, BooleanControl, type ButtonProps, type IconButtonProps, type ToggleButtonProps, type SplitButtonProps, type TabProps, type TabItem, type TabsProps, type FieldContextValue, type FieldProps, type TextFieldProps, type NumberFieldProps, type SelectOption, type SelectProps, type BooleanProps, type SliderProps, type FilePickerProps, type PathFieldProps } from "../shared";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import { SplitButton } from "../SplitButton/SplitButton";
import { Tab } from "../Tab/Tab";
import { Tabs } from "../Tabs/Tabs";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { Field } from "../Field/Field";
import { NumberField } from "../NumberField/NumberField";
import { Select } from "../Select/Select";
import { Switch } from "../Switch/Switch";
import { Checkbox } from "../Checkbox/Checkbox";
import { Slider } from "../Slider/Slider";
import { FilePicker } from "../FilePicker/FilePicker";
import { PathField } from "../PathField/PathField";
import { CopyableField } from "../CopyableField/CopyableField";

export const TextField = define<TextFieldProps>("TextField", p => {
  const field = useContext(FieldContext); const input = useRef<HTMLInputElement>(null);
  const { value, defaultValue = "", onValueChange, onChange, onInput, icon, end, clearable, error, label, ref, children: _children, size: _size, tone: _tone, material: _mat, className: _cls, style: _style, ...dom } = p;
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange);
  return <div {...mark("TextField", { ...p, id: undefined }, "input")} data-ad-invalid={error || field?.error || undefined}>
    {icon && <Icon name={icon} size={21} />}
    <input {...dom} id={p.id ?? field?.id} ref={n => { input.current = n; assignRef(ref, n); }} type={p.type ?? "text"} value={current}
      required={p.required ?? field?.required} aria-label={p["aria-label"] ?? label} aria-invalid={error || field?.error || undefined} aria-describedby={p["aria-describedby"] ?? field?.describedBy}
      onInput={onInput} onChange={e => { setCurrent(e.currentTarget.value); onChange?.(e); }} />
    {clearable && <IconButton variant="ghost" size={p.size ?? "sm"} icon="close" label="Очистить" disabled={p.disabled || p.readOnly} onClick={() => { setCurrent(""); input.current?.focus(); }} />}{end}
  </div>;
});
