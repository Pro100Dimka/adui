import {
  Playground,
  U,
  expr,
  inputVariants,
  jsx,
  sizes,
} from "../../../dev/exampleHelpers";

const drivers = ["WASAPI Shared", "WASAPI Exclusive", "ASIO", "DirectSound"];

const devices = [
  { value: { id: 1, kind: "usb" }, label: "Focusrite Scarlett 2i2", icon: "mic", description: "USB · 48 кГц · 2 входа", group: "Внешние" },
  { value: { id: 2, kind: "usb" }, label: "Shure MV7", icon: "mic", description: "USB · 44.1 кГц", group: "Внешние" },
  { value: { id: 3, kind: "built-in" }, label: "Встроенный микрофон", icon: "audio", description: "Realtek · 48 кГц", group: "Встроенные" },
  { value: { id: 4, kind: "bluetooth" }, label: "AirPods Pro", icon: "headphones", description: "Bluetooth · только 16 кГц", group: "Беспроводные", disabled: true },
];

const people = [
  { value: "anna", label: "Анна Ковальчук", avatar: { name: "Анна Ковальчук" }, description: "Солистка · в сети" },
  { value: "dima", label: "Дмитрий Андреев", avatar: { name: "Дмитрий Андреев" }, description: "Хост комнаты" },
  { value: "olga", label: "Ольга Мельник", avatar: { name: "Ольга Мельник" }, description: "Бэк-вокал" },
  { value: "max", label: "Максим Шевчук", avatar: { name: "Максим Шевчук" }, description: "Гитара · не в сети" },
  { value: "ira", label: "Ирина Бондарь", avatar: { name: "Ирина Бондарь" }, description: "Клавиши" },
];

const sets = {
  strings: { options: drivers, label: "Аудиодрайвер", placeholder: "Выберите драйвер", icon: "audio" },
  rich: { options: devices, label: "Микрофон", placeholder: "Выберите устройство", icon: "mic" },
  people: { options: people, label: "Солист", placeholder: "Кто поёт?", icon: "person" },
} as const;

export default function SelectExample() {
  return (
    <Playground
      stretch
      knobs={{
        content: { options: ["strings", "rich", "people"], value: "rich" },
        searchable: { value: false },
        variant: { options: inputVariants, value: "outlined" },
        size: { options: sizes, value: "md" },
        floating: { value: true },
        error: { value: false },
        disabled: { value: false },
      }}
      code={(v, c) => {
        const set = sets[v.content as keyof typeof sets];
        return (
          `const options = ${JSON.stringify(set.options, null, 2)};\n\n` +
          jsx("Select", {
            label: set.label,
            placeholder: set.placeholder,
            options: expr("options"),
            icon: set.icon,
            searchable: v.searchable,
            variant: c.variant,
            size: c.size,
            labelPlacement: v.floating ? "floating" : undefined,
            error: v.error ? "Устройство недоступно" : undefined,
            disabled: v.disabled,
          })
        );
      }}
    >
      {(v) => {
        const set = sets[v.content as keyof typeof sets];
        return (
          <U.Select<unknown>
            key={v.content}
            label={set.label}
            placeholder={set.placeholder}
            options={set.options as never}
            icon={set.icon}
            searchable={v.searchable}
            variant={v.variant}
            size={v.size}
            labelPlacement={v.floating ? "floating" : "top"}
            error={v.error ? "Устройство недоступно" : undefined}
            disabled={v.disabled}
          />
        );
      }}
    </Playground>
  );
}
