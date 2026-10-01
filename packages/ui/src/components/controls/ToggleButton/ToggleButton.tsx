import React, { createContext, useContext, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { assignRef, clamp, copyText, define, mark, useControllable, type CommonProps, type Variant } from "../../../core/base";
import { useTabShape } from "../../../core/motion";
import { Icon } from "../../layout";
import { Menu, Dialog, type MenuItemData } from "../../feedback";
import { buttonView, FieldContext, BooleanControl, type ButtonProps, type IconButtonProps, type ToggleButtonProps, type SplitButtonProps, type TabProps, type TabItem, type TabsProps, type FieldContextValue, type FieldProps, type TextFieldProps, type NumberFieldProps, type SelectOption, type SelectProps, type BooleanProps, type SliderProps, type FilePickerProps, type PathFieldProps } from "../shared";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
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
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

export const ToggleButton = define<ToggleButtonProps>("ToggleButton", ({ checked, defaultChecked = false, onValueChange, onClick, ...p }) => {
  const [value, setValue] = useControllable(checked, defaultChecked, onValueChange);
  return buttonView({ ...p, "aria-label": p["aria-label"] ?? (!p.children ? p.label : undefined), "aria-pressed": value, children: p.children ?? (p.icon ? null : p.label), label: undefined,
    onClick: e => { onClick?.(e); if (!e.defaultPrevented) setValue(!value); } }, "ToggleButton");
});
