import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function TextFieldExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Default" description="Standard text input">
          <U.TextField size={size} label="Name" placeholder="Enter text" />
        </ExampleVariant>
        <ExampleVariant title="Adornments" description="Start and end content">
          <U.TextField
            size={size}
            label="Search"
            placeholder="Search…"
            startAdornment={<U.Icon name="search" />}
            endAdornment={<U.Icon name="copy" />}
          />
        </ExampleVariant>
        <ExampleVariant title="Read only" description="Visible but immutable">
          <U.TextField
            size={size}
            label="Path"
            readOnly
            value="D:/Music/song.wav"
          />
        </ExampleVariant>
        <ExampleVariant title="Error" description="Validation state">
          <U.TextField
            size={size}
            label="Email"
            error="Invalid value"
            defaultValue="wrong@"
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
