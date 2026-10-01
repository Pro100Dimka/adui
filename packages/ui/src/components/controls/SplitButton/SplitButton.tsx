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
import { FilePicker } from "../FilePicker/FilePicker";
import { PathField } from "../PathField/PathField";
import { CopyableField } from "../CopyableField/CopyableField";

export const SplitButton = define<SplitButtonProps>("SplitButton", p => {
  const [open, setOpen] = useState(false); const anchor = useRef<HTMLButtonElement>(null);
  return <div {...mark("SplitButton", p, p.variant === "secondary" ? "glass" : "ruby")}>
    <Button size={p.size} variant="ghost" icon={p.icon ?? "save"} onClick={p.onClick}>{p.children ?? p.label ?? "Сохранить"}</Button>
    <IconButton size={p.size} ref={anchor} variant="ghost" icon="chevron" label="Другие действия" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)} />
    <Menu open={open} onOpenChange={setOpen} anchorRef={anchor} items={p.items ?? [{ label: "Экспортировать JSON", icon: "download" }]} />
  </div>;
});
