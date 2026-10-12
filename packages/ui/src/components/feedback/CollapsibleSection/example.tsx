import { CollapsibleSection, KeyValueList } from "@neo-ui-kit/react";

export default function CollapsibleSectionExample() {
  return (
    <CollapsibleSection title="Технические детали" icon="braces">
      <KeyValueList
        items={[
          ["Частота", "48 kHz"],
          ["Буфер", "128 сэмплов"],
          ["Задержка", "6.7 мс"],
        ]}
      />
    </CollapsibleSection>
  );
}
