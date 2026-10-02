import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

export default function SwitchExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Off" description="Disabled state">
          <U.Switch size={size} label="Monitoring" />
        </ExampleVariant>
        <ExampleVariant title="On" description="Enabled state">
          <U.Switch size={size} defaultChecked label="Monitoring" />
        </ExampleVariant>
        <ExampleVariant title="Compact label" description="Short option">
          <U.Switch size={size} defaultChecked label="FX" />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.Switch size={size} disabled label="Monitoring" />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
