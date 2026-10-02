import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function ToggleButtonExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid columns={3}>
        <ExampleVariant>
          <U.ToggleButton size={size} icon="volume">
            Off
          </U.ToggleButton>
        </ExampleVariant>
        <ExampleVariant>
          <U.ToggleButton size={size} defaultChecked icon="wave">
            On
          </U.ToggleButton>
        </ExampleVariant>
        <ExampleVariant>
          <U.ToggleButton size={size} disabled icon="wave">
            Disabled
          </U.ToggleButton>
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
