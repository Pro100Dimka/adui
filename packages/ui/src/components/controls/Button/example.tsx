import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleStateStrip,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function ButtonExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase
      size={size}
      onSizeChange={setSize}
      states={
        <ExampleStateStrip>
          <U.Button size={size} disabled>
            Disabled
          </U.Button>
          <U.Button size={size} loading>
            Loading
          </U.Button>
        </ExampleStateStrip>
      }
    >
      <ExampleVariantGrid>
        <ExampleVariant title="Primary" description="Main action">
          <U.Button size={size} variant="primary">
            Primary
          </U.Button>
        </ExampleVariant>
        <ExampleVariant title="Secondary" description="Alternative action">
          <U.Button size={size} variant="secondary">
            Secondary
          </U.Button>
        </ExampleVariant>
        <ExampleVariant title="Ghost" description="Minimal emphasis">
          <U.Button size={size} variant="ghost">
            Ghost
          </U.Button>
        </ExampleVariant>
        <ExampleVariant title="Danger" description="Destructive action">
          <U.Button size={size} variant="danger">
            Danger
          </U.Button>
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
