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
import { TextField } from "../TextField/TextField";
import { NumberField } from "../NumberField/NumberField";
import { Switch } from "../Switch/Switch";
import { Checkbox } from "../Checkbox/Checkbox";
import { Slider } from "../Slider/Slider";
import { FilePicker } from "../FilePicker/FilePicker";
import { PathField } from "../PathField/PathField";
import { CopyableField } from "../CopyableField/CopyableField";

export const Select = define<SelectProps>("Select", p => {
  const field = useContext(FieldContext); const options = p.options ?? ["Первый вариант", "Второй вариант"];
  const first = typeof options[0] === "string" ? options[0] : options[0]?.value ?? "";
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? first, p.onValueChange);
  return <div {...mark("Select", { ...p, id: undefined }, "glass")}>
    {p.icon && <Icon name={p.icon} size={20} />}
    <select ref={p.ref} id={p.id ?? field?.id} name={p.name} value={value} disabled={p.disabled} required={p.required ?? field?.required} aria-invalid={field?.error || undefined} aria-describedby={field?.describedBy} aria-label={p.label} onChange={e => setValue(e.currentTarget.value)}>
      {options.map(option => { const o = typeof option === "string" ? { value: option, label: option } : option; return <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>; })}
    </select><Icon name="chevron" size={16} />
  </div>;
});
