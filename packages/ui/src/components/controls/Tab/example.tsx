import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function TabExample() {
  return <U.Stack gap={3}>
    <div role="tablist" style={{ width: "100%" }}><U.Tab appearance="settings" selected icon="palette">Внешний вид</U.Tab></div>
    <div role="tablist" style={{ width: "100%" }}><U.Tab appearance="flush" selected icon="palette">Внешний вид</U.Tab></div>
    <div role="tablist" style={{ width: "100%" }}><U.Tab appearance="premium" selected icon="palette">Внешний вид</U.Tab></div>
  </U.Stack>;
}
