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
      <ExampleVariantGrid>
        <ExampleVariant title="Off" description="Unselected">
          <U.ToggleButton size={size} icon="volume">
            Monitoring
          </U.ToggleButton>
        </ExampleVariant>
        <ExampleVariant title="On" description="Selected">
          <U.ToggleButton size={size} defaultChecked icon="wave">
            Monitoring
          </U.ToggleButton>
        </ExampleVariant>
        <ExampleVariant title="Icon only" description="Compact toggle">
          <U.ToggleButton
            size={size}
            defaultChecked
            icon="volume"
            label="Monitor"
          />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.ToggleButton size={size} disabled icon="wave">
            Monitoring
          </U.ToggleButton>
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
