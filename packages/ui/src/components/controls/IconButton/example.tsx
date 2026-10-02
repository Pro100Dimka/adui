import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function IconButtonExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid columns={4}>
        <ExampleVariant>
          <U.IconButton
            size={size}
            variant="primary"
            icon="play"
            label="Primary"
          />
        </ExampleVariant>
        <ExampleVariant>
          <U.IconButton
            size={size}
            variant="secondary"
            icon="settings"
            label="Secondary"
          />
        </ExampleVariant>
        <ExampleVariant>
          <U.IconButton size={size} variant="ghost" icon="more" label="Ghost" />
        </ExampleVariant>
        <ExampleVariant>
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
