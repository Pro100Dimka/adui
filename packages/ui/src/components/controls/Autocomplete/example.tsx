import {
  U,
  ExampleShowcase,
  ExampleVariant,
  ExampleVariantGrid,
  useExampleSize,
} from "../../../dev/exampleHelpers";

const options = ["WASAPI Shared", "WASAPI Exclusive", "ASIO", "DirectSound"];
export default function AutocompleteExample() {
  const [size, setSize] = useExampleSize();
  return (
    <ExampleShowcase size={size} onSizeChange={setSize}>
      <ExampleVariantGrid>
        <ExampleVariant title="Default" description="Search and select">
          <U.Autocomplete
            size={size}
            label="Driver"
            options={options}
            placeholder="Start typing…"
          />
        </ExampleVariant>
        <ExampleVariant title="Clearable" description="Reset current value">
          <U.Autocomplete
            size={size}
            label="Driver"
            options={options}
            defaultValue="ASIO"
            clearable
          />
        </ExampleVariant>
        <ExampleVariant title="Filtered" description="Typed query">
          <U.Autocomplete
            size={size}
            label="Driver"
            options={options}
            defaultValue="WASAPI"
          />
        </ExampleVariant>
        <ExampleVariant title="Disabled" description="Unavailable">
          <U.Autocomplete
            size={size}
            disabled
            label="Driver"
            options={options}
            defaultValue="ASIO"
          />
        </ExampleVariant>
      </ExampleVariantGrid>
    </ExampleShowcase>
  );
}
