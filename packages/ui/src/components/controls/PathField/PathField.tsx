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
import { FilePicker } from "../FilePicker";
import { CopyableField } from "../CopyableField";

export const PathField = define<PathFieldProps>("PathField", ({ onFiles, accept, value, defaultValue, onValueChange, ...p }) => {
  const [current, setCurrent] = useControllable(value, defaultValue ?? "Папка данных приложения", onValueChange); const file = useRef<HTMLInputElement>(null);
  return <><TextField {...p} className={`ad-path-field ${p.className ?? ""}`} value={current} readOnly icon="folder" end={<IconButton variant="ghost" icon="folder" label="Выбрать файл" onClick={() => file.current?.click()} />} />
    <input ref={file} type="file" accept={accept} hidden onChange={e => { const files = Array.from(e.currentTarget.files ?? []); if (files[0]) setCurrent(files[0].name); onFiles?.(files); e.currentTarget.value = ""; }} /></>;
});
