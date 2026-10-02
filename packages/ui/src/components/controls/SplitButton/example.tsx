import {
  Playground,
  U,
  buttonVariants,
  expr,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

const items = [
  { label: "Сохранить как…", icon: "save" },
  { label: "Экспорт в WAV", icon: "download" },
  { label: "Экспорт в MP3", icon: "download" },
];

export default function SplitButtonExample() {
  return (
    <Playground
      knobs={{
        variant: { options: buttonVariants, value: "primary" },
        size: { options: sizes, value: "md" },
      }}
      code={(v, c) =>
        `const items = ${JSON.stringify(items)};\n\n` +
        jsx(
          "SplitButton",
          {
            icon: "save",
            items: expr("items"),
            variant: c.variant,
            size: c.size,
          },
          "Сохранить",
        )
      }
    >
      {(v) => (
        <U.SplitButton
          icon="save"
          items={items}
          variant={v.variant}
          size={v.size}
        >
          Сохранить
        </U.SplitButton>
      )}
    </Playground>
  );
}
