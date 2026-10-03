import {
  Playground,
  U,
  buttonVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

const icons = {
  primary: "play",
  secondary: "settings",
  ghost: "more",
  danger: "trash",
};

export default function IconButtonExample() {
  return (
    <Playground
      knobs={{
        variant: { options: buttonVariants, value: "primary" },
        size: { options: sizes, value: "md" },
        round: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) =>
        jsx("IconButton", {
          icon: icons[v.variant as keyof typeof icons],
          label: "Воспроизвести",
          variant: v.variant === "secondary" ? undefined : v.variant,
          size: c.size,
          round: v.round,
          disabled: v.disabled,
        })
      }
    >
      {(v) => (
        <U.IconButton
          icon={icons[v.variant as keyof typeof icons]}
          label="Воспроизвести"
          variant={v.variant}
          size={v.size}
          round={v.round}
          disabled={v.disabled}
        />
      )}
    </Playground>
  );
}
