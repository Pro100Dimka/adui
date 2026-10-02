import React, { useRef } from "react";
import { define, useControllable } from "../../../core/base";
import { Field } from "../Field/Field";
import { IconButton } from "../IconButton/IconButton";
import type { TextFieldProps } from "../shared";
export const TextField = define<TextFieldProps>("TextField", p => {
  const {label,description,error,clearable,startAdornment,endAdornment,value,defaultValue="",onValueChange,...input}=p;
  const [current,setCurrent]=useControllable(value,defaultValue,onValueChange); const id=p.id;
  const end=<>{clearable&&<IconButton size="xs" variant="ghost" icon="close" label="Очистить" disabled={p.disabled||p.readOnly} onClick={()=>setCurrent("")}/>} {endAdornment}</>;
  return <label className={`ad-text-field-shell ${p.className??""}`} data-ad-invalid={!!error||undefined}>
    {label&&<span className="ad-field-label">{label}{p.required?" *":""}</span>}
    <Field {...input} id={id} value={current} onValueChange={setCurrent} startAdornment={startAdornment} endAdornment={end} aria-invalid={!!error||undefined}/>
    {(description||error)&&<small className={error?"ad-field-error":""}>{error||description}</small>}
  </label>;
});
