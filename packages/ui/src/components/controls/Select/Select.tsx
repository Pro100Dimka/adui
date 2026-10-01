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
import { TextField } from "../TextField";
import { NumberField } from "../NumberField";
import { Switch } from "../Switch";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { FilePicker } from "../FilePicker";
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

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
