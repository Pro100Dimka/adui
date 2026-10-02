import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function CheckboxExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Unchecked" description="Default">
          <U.Checkbox size={size} label="Option" />
        </ExampleVariant>
        <ExampleVariant title="Checked" description="Selected">
          <U.Checkbox size={size} defaultChecked label="Option" />
        </ExampleVariant>
        <ExampleVariant title="Required" description="Form requirement">
          <U.Checkbox size={size} required label="Accept" />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.Checkbox size={size} disabled label="Option" />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
