import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function InputBaseExample() {
  return (
    <U.InputBase
      startAdornment={<U.Icon name="search" />}
      endAdornment={<U.Icon name="chevron" />}
    >
      <input aria-label="InputBase" placeholder="Низкоуровневое поле" />
    </U.InputBase>
  );
}
