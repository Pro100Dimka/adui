import React from "react";
import { U, useExampleState } from "../../../dev/exampleHelpers";
export default function FieldExample(){const {text,setText}=useExampleState();return <U.Field value={text} onValueChange={setText} placeholder="Input base" startAdornment={<U.Icon name="search"/>} endAdornment={<U.IconButton size="xs" icon="close" label="Очистить" onClick={()=>setText("")}/>}/>} 
