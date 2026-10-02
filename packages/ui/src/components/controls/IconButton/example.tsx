import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleStateStrip,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function IconButtonExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase
      size={size}
      onSizeChange={setSize}
      states={
        <ExampleStateStrip label="Shape">
          <U.IconButton
            size={size}
            round
            variant="primary"
            icon="play"
            label="Round"
          />
        </ExampleStateStrip>
      }
    >
      <ExampleVariantGrid>
        <ExampleVariant title="Primary" description="Main icon action">
          <U.IconButton
            size={size}
            variant="primary"
            icon="play"
            label="Primary"
          />
        </ExampleVariant>
        <ExampleVariant title="Secondary" description="Standard icon action">
          <U.IconButton
            size={size}
            variant="secondary"
            icon="settings"
            label="Secondary"
          />
        </ExampleVariant>
        <ExampleVariant title="Ghost" description="Low emphasis">
          <U.IconButton size={size} variant="ghost" icon="more" label="Ghost" />
        </ExampleVariant>
        <ExampleVariant title="Danger" description="Destructive action">
          <U.IconButton
            size={size}
            variant="danger"
            icon="trash"
            label="Danger"
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
