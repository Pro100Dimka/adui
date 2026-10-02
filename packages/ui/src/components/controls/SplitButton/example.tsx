import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
  useExampleState,
} from "../../../dev/exampleHelpers";

export default function SplitButtonExample() {
  const [size, setSize] = useExampleSize();
  const { items } = useExampleState();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid columns={4}>
        <ExampleVariant>
          <U.SplitButton
            size={size}
            variant="primary"
            icon="save"
            items={items}
          >
            Save
          </U.SplitButton>
        </ExampleVariant>
        <ExampleVariant>
          <U.SplitButton
            size={size}
            variant="secondary"
            icon="download"
            items={items}
          >
            Export
          </U.SplitButton>
        </ExampleVariant>
        <ExampleVariant>
          <U.SplitButton size={size} variant="ghost" icon="more" items={items}>
            More
          </U.SplitButton>
        </ExampleVariant>
        <ExampleVariant>
          <U.SplitButton
            size={size}
            variant="danger"
            icon="trash"
            items={items}
          >
            Delete
          </U.SplitButton>
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
