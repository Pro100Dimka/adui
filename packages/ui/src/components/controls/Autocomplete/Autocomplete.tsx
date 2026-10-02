import React,{useId} from "react";
import { define } from "../../../core/base";
import { TextField } from "../TextField/TextField";
import type { AutocompleteProps } from "../shared";
export const Autocomplete=define<AutocompleteProps>("Autocomplete",({options=["WASAPI Shared","WASAPI Exclusive","ASIO"],onOptionSelect,onValueChange,...p})=>{const id=useId(),values=options.map(o=>typeof o==="string"?o:o.value);return <><TextField {...p} list={id} onValueChange={value=>{onValueChange?.(value);if(values.includes(value))onOptionSelect?.(value)}}/><datalist id={id}>{options.map(o=>{const item=typeof o==="string"?{value:o,label:o}:o;return <option key={item.value} value={item.value}>{item.label}</option>})}</datalist></>});
