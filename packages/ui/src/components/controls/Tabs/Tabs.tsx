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

export const Tabs = define<TabsProps>("Tabs", p => {
  const items = p.items ?? [{ value: "appearance", label: "Внешний вид", icon: "palette" }, { value: "audio", label: "Аудио", icon: "audio" }, { value: "advanced", label: "Дополнительно", icon: "wrench" }];
  const [value, setValue] = useControllable(p.value, p.defaultValue ?? items[0]?.value ?? "", p.onValueChange);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return <nav {...mark("Tabs", p, "glass")} role="tablist" aria-label={p.label ?? "Разделы"} onKeyDown={e => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const available = items.map((item, index) => ({ item, index })).filter(x => !x.item.disabled);
    if (!available.length) return;
    e.preventDefault(); const current = available.findIndex(x => buttons.current[x.index] === document.activeElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? available.length - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + available.length) % available.length;
    setValue(available[next].item.value); buttons.current[available[next].index]?.focus();
  }}>{items.map((item, index) => <Tab key={item.value} id={item.id} ref={n => { buttons.current[index] = n; }} icon={item.icon} panelId={item.panelId} disabled={item.disabled} selected={item.value === value} onClick={() => setValue(item.value)}>{item.label}</Tab>)}</nav>;
});
