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
import { SplitButton } from "../SplitButton";
import { Tab } from "../Tab";
import { Tabs } from "../Tabs";
import { SegmentedControl } from "../SegmentedControl";
import { TextField } from "../TextField";
import { NumberField } from "../NumberField";
import { Select } from "../Select";
import { Switch } from "../Switch";
import { Checkbox } from "../Checkbox";
import { Slider } from "../Slider";
import { FilePicker } from "../FilePicker";
import { PathField } from "../PathField";
import { CopyableField } from "../CopyableField";

export const Field = define<FieldProps>("Field", p => {
  const uid = useId(); const id = p.id ?? `field-${uid}`; const help = p.error || p.description;
  const [infoOpen, setInfoOpen] = useState(false);
  return <FieldContext.Provider value={{ id, required: p.required, error: !!p.error, describedBy: help ? `${id}-help` : undefined }}>
    <div {...mark("Field", { ...p, id: undefined })}>
      <div className="ad-field-label"><label htmlFor={id}>{p.label ?? "Название поля"}{p.required ? " *" : ""}</label>{p.info && <IconButton variant="ghost" size="small" icon="info" label={p.info} onClick={() => setInfoOpen(true)} />}</div>
      {p.control ?? p.children}
      {help && <small id={`${id}-help`} className={p.error ? "ad-field-error" : undefined}>{help}</small>}
      {p.info && <Dialog open={infoOpen} onOpenChange={setInfoOpen} title="Информация" description={p.info} cancelLabel={false} />}
    </div>
  </FieldContext.Provider>;
});
