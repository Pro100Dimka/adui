import React, { useRef } from "react";
import { assignRef, define, mark, useControllable } from "../../../core/base";
import type { FieldProps } from "../shared";
export const Field = define<FieldProps>("Field", p => {
  const { value, defaultValue="", onValueChange, startAdornment, endAdornment, inputRef, children:_children, size:_size, tone:_tone, material:_material, ...dom }=p;
  const [current,setCurrent]=useControllable(value,defaultValue,onValueChange); const ref=useRef<HTMLInputElement>(null);
  return <div {...mark("Field",{...p,id:undefined},"input")}>
    {startAdornment&&<span className="ad-field-adornment" data-position="start">{startAdornment}</span>}
    <input {...dom} className={undefined} style={undefined} ref={n=>{ref.current=n;assignRef(inputRef,n)}} value={current} onChange={e=>setCurrent(e.currentTarget.value)} />
    {endAdornment&&<span className="ad-field-adornment" data-position="end">{endAdornment}</span>}
  </div>;
});
