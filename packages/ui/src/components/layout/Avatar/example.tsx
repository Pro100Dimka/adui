import { Playground, U, jsx, sizes } from "../../../dev/exampleHelpers";

export default function AvatarExample() {
  return (
    <Playground
      knobs={{
        variant: { options: ["initials", "host"] as const, value: "host" },
        size: { options: sizes, value: "md" },
      }}
      code={(v, c) =>
        jsx("Avatar", {
          name: "Дмитрий",
          variant: v.variant === "host" ? "host" : undefined,
          size: c.size,
        })
      }
    >
      {(v) => <U.Avatar name="Дмитрий" variant={v.variant} size={v.size} />}
    </Playground>
  );
}
