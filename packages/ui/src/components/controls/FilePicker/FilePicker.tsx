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
import { Select } from "../Select/Select";
import { Switch } from "../Switch/Switch";
import { Checkbox } from "../Checkbox/Checkbox";
import { Slider } from "../Slider/Slider";
import { PathField } from "../PathField/PathField";
import { CopyableField } from "../CopyableField/CopyableField";

export const FilePicker = define<FilePickerProps>("FilePicker", p => {
  const file = useRef<HTMLInputElement>(null); const [names, setNames] = useState("");
  return <div {...mark("FilePicker", p)}><Button icon={p.icon ?? "folder"} onClick={() => file.current?.click()}>{p.label ?? "Выбрать файл"}</Button><small>{names || p.description || "Файл не выбран"}</small>
    <input type="file" ref={file} hidden accept={p.accept} multiple={p.multiple} onChange={e => { const files = Array.from(e.currentTarget.files ?? []); setNames(files.map(f => f.name).join(", ")); p.onFiles?.(files); e.currentTarget.value = ""; }} />
  </div>;
});
