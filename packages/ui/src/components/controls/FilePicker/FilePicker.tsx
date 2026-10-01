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
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

export const FilePicker = define<FilePickerProps>("FilePicker", p => {
  const file = useRef<HTMLInputElement>(null); const [names, setNames] = useState("");
  return <div {...mark("FilePicker", p)}><Button icon={p.icon ?? "folder"} onClick={() => file.current?.click()}>{p.label ?? "Выбрать файл"}</Button><small>{names || p.description || "Файл не выбран"}</small>
    <input type="file" ref={file} hidden accept={p.accept} multiple={p.multiple} onChange={e => { const files = Array.from(e.currentTarget.files ?? []); setNames(files.map(f => f.name).join(", ")); p.onFiles?.(files); e.currentTarget.value = ""; }} />
  </div>;
});
