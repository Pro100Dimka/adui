import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function SliderExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Low" description="25 percent">
          <U.Slider size={size} defaultValue={25} label="Low" />
        </ExampleVariant>
        <ExampleVariant title="Middle" description="50 percent">
          <U.Slider size={size} defaultValue={50} label="Middle" />
        </ExampleVariant>
        <ExampleVariant title="High" description="80 percent">
          <U.Slider size={size} defaultValue={80} label="High" />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.Slider size={size} disabled defaultValue={45} label="Disabled" />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
