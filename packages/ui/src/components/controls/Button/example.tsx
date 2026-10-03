import {
  Playground,
  U,
  buttonVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

export default function ButtonExample() {
  return (
    <Playground
      knobs={{
        variant: { options: buttonVariants, value: "primary" },
        size: { options: sizes, value: "md" },
        icon: { value: true },
        loading: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx(
          "Button",
          {
            variant: v.variant === "secondary" ? undefined : v.variant,
            size: c.size,
            icon: v.icon ? "save" : undefined,
            loading: v.loading,
            disabled: v.disabled,
          },
          "Сохранить",
        )
      }
    >
      {(v) => (
        <U.Button
          variant={v.variant}
          size={v.size}
          icon={v.icon ? "save" : undefined}
          loading={v.loading}
          disabled={v.disabled}
        >
          Сохранить
        </U.Button>
      )}
    </Playground>
  );
}
