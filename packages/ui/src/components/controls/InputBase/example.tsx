import {
  Playground,
  U,
  expr,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

/** InputBase is the bare box behind every field: use it for custom controls. */
export default function InputBaseExample() {
  return (
    <Playground
      stretch
      knobs={{
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        error: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx(
          "InputBase",
          {
            startAdornment: expr('<Icon name="search" />'),
            variant: c.variant,
            size: c.size,
            error: v.error,
            disabled: v.disabled,
          },
          '<input placeholder="Своё поле" />',
        )
      }
    >
      {(v) => (
        <U.InputBase
          startAdornment={<U.Icon name="search" />}
          variant={v.variant}
          size={v.size}
          error={v.error}
          disabled={v.disabled}
        >
          <input
            aria-label="Своё поле"
            placeholder="Своё поле"
            disabled={v.disabled}
          />
        </U.InputBase>
      )}
    </Playground>
  );
}
