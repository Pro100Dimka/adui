import React, { useState } from "react";
import {
  U,
  ExampleShowcase,
  ExampleStateStrip,
  useExampleSize,
} from "../../../dev/exampleHelpers";

const items = [
  { value: "appearance", label: "View", icon: "palette" },
  { value: "audio", label: "Audio", icon: "audio" },
  { value: "env", label: "ENV", icon: "key" },
];
export default function TabsExample() {
  const [size, setSize] = useExampleSize();
  const [value, setValue] = useState("audio");
  return (
    <ExampleShowcase
      size={size}
      onSizeChange={setSize}
      states={
        <ExampleStateStrip label="Active">
          <span className="example-readout">{value}</span>
        </ExampleStateStrip>
      }
    >
      <div className="example-single-control">
        <U.Tabs
          size={size}
          value={value}
          onValueChange={setValue}
          items={items}
        />
      </div>
    </ExampleShowcase>
  );
}
