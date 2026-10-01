import React from "react";
import { U } from "../../../dev/exampleHelpers";

export default function TabExample() {
  return (
    <div role="tablist" style={{ width: "100%" }}>
      <U.Tab selected icon="palette">Внешний вид</U.Tab>
    </div>
  );
}
