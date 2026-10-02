import React from "react";
import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function TextAreaExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Default" description="Multiline text">
          <U.TextArea
            size={size}
            label="Description"
            placeholder="Write something…"
          />
        </ExampleVariant>
        <ExampleVariant title="Filled" description="Existing value">
          <U.TextArea
            size={size}
            label="Notes"
            defaultValue="Multiple lines of text"
          />
        </ExampleVariant>
        <ExampleVariant
          title="Read only"
          description="Code or generated content"
        >
          <U.TextArea
            size={size}
            readOnly
            aria-label="Read only textarea"
            defaultValue={'{\n  "enabled": true\n}'}
            style={{ fontFamily: "var(--ad-font-family-mono)" }}
          />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.TextArea
            size={size}
            disabled
            aria-label="Disabled textarea"
            defaultValue="Locked"
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
