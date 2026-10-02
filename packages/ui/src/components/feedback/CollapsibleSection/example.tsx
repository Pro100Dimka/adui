import React from "react";
import { U } from "../../../dev/exampleHelpers";
export default function CollapsibleSectionExample() {
  return (
    <U.CollapsibleSection title="JSON">
      <U.TextArea
        readOnly
        defaultValue={'{\n  "enabled": true\n}'}
        endAdornment={<U.IconButton size="xs" icon="copy" label="Копировать" />}
      />
    </U.CollapsibleSection>
  );
}
