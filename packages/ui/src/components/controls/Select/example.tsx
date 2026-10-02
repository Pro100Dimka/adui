import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

const options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO"];
export default function SelectExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Default" description="Nothing selected">
          <U.Select
            size={size}
            label="Driver"
            placeholder="Choose driver"
            options={options}
          />
        </ExampleVariant>
        <ExampleVariant title="Selected" description="Current value">
          <U.Select
            size={size}
            label="Driver"
            defaultValue="WASAPI Shared"
            options={options}
          />
        </ExampleVariant>
        <ExampleVariant title="With icon" description="Context adornment">
          <U.Select
            size={size}
            label="Audio"
            icon="audio"
            defaultValue="ASIO"
            options={options}
          />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.Select
            size={size}
            disabled
            value="WASAPI Shared"
            options={options}
            aria-label="Disabled select"
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
