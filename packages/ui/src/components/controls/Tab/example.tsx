import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function TabExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Selected" description="Active tab">
          <div role="tablist">
            <U.Tab size={size} selected icon="palette">
              View
            </U.Tab>
          </div>
        </ExampleVariant>
        <ExampleVariant title="Idle" description="Inactive tab">
          <div role="tablist">
            <U.Tab size={size} icon="audio">
              Audio
            </U.Tab>
          </div>
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
