import {
  Compare,
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
      extra={
        <Compare
          captions={false}
          items={buttonVariants.map((variant) => ({
            label: variant,
            node: (
              <U.Button variant={variant} size="sm">
                {variant[0].toUpperCase() + variant.slice(1)}
              </U.Button>
            ),
          }))}
        />
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
