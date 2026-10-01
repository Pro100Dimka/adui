import React, { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { assignRef, clamp, copyText, define, mark, useControllable, type CommonProps, type Variant } from "../../../core/base";
import { useTabShape } from "../../../core/motion";
import { Icon } from "../../layout";
import { Menu, Dialog, type MenuItemData } from "../../feedback";
import { buttonView, FieldContext, BooleanControl, type ButtonProps, type IconButtonProps, type ToggleButtonProps, type SplitButtonProps, type TabProps, type TabItem, type TabsProps, type FieldContextValue, type FieldProps, type TextFieldProps, type NumberFieldProps, type SelectOption, type SelectProps, type BooleanProps, type SliderProps, type FilePickerProps, type PathFieldProps } from "../shared";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { ToggleButton } from "../ToggleButton";
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

export const SplitButton = define<SplitButtonProps>("SplitButton", p => {
  const [open, setOpen] = useState(false); const anchor = useRef<HTMLButtonElement>(null);
  return <div {...mark("SplitButton", p, p.variant === "secondary" ? "glass" : "ruby")}>
    <Button variant="ghost" icon={p.icon ?? "save"} onClick={p.onClick}>{p.children ?? p.label ?? "Сохранить"}</Button>
    <IconButton ref={anchor} variant="ghost" icon="chevron" label="Другие действия" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)} />
    <Menu open={open} onOpenChange={setOpen} anchorRef={anchor} items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]} />
  </div>;
});
