import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function NumberFieldExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Default" description="Numeric value">
          <U.NumberField
            size={size}
            label="Port"
            defaultValue={8000}
            min={1}
            max={65535}
          />
        </ExampleVariant>
        <ExampleVariant title="Minimum" description="Lower bound">
          <U.NumberField
            size={size}
            label="Gain"
            defaultValue={0}
            min={0}
            max={100}
          />
        </ExampleVariant>
        <ExampleVariant title="Maximum" description="Upper bound">
          <U.NumberField
            size={size}
            label="Latency"
            defaultValue={100}
            min={0}
            max={100}
          />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.NumberField
            size={size}
            label="Buffer"
            defaultValue={256}
            disabled
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
