import { U } from "../../../dev/exampleHelpers";

export default function StackExample() {
  return (
    <U.Stack gap={4}>
      <U.Typography variant="title">Stack</U.Typography>
      <U.Typography variant="body" tone="muted">
        Один layout-компонент вместо ручного flex + gap + align-items.
      </U.Typography>

      <U.Stack
        direction={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 4 }}
        align={{ base: "stretch", md: "center" }}
      >
        <U.Button variant="primary">Сохранить</U.Button>
        <U.Button>Предпросмотр</U.Button>
        <U.Button>Отмена</U.Button>
      </U.Stack>
    </U.Stack>
  );
}
