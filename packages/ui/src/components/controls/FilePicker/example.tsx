import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function FilePickerExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Audio" description="Single audio file">
          <U.FilePicker size={size} label="Choose audio" accept="audio/*" />
        </ExampleVariant>
        <ExampleVariant title="Multiple" description="Several files">
          <U.FilePicker size={size} label="Choose files" multiple />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
