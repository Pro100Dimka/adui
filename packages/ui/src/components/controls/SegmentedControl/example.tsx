import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function SegmentedControlExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariant title="Default" description="Switch between views" wide>
        <U.SegmentedControl size={size} />
      </ExampleVariant>
    </ExampleShowcase>
  );
}
