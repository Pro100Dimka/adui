# A&D UI 1.1.0 — UI-primitives documentation release

## Главное

- Весь видимый интерфейс документации и playground-shell переведён на публичные компоненты `@ad-voice/ui`.
- `Typography` используется для всей текстовой иерархии документации.
- `Stack` и `Grid` отвечают за раскладку вместо ручных flex/grid-обёрток в TSX.
- `Card`, `Header`, `Divider`, `ScrollArea`, `Badge`, `Button`, `ToggleButton`, `TextField`, `Select` и другие primitives используются непосредственно в документации.
- Добавлен настоящий `Link` primitive и документация к нему.
- ScreenHost больше не перерисовывает button-material локальным CSS: библиотека остаётся единственным источником визуального стиля.
- `Header` теперь сам использует `Typography` для заголовков.
- Добавлена проверка `npm run check:ui-primitives`, запрещающая возврат raw visual HTML в playground-страницы.

## Техническое исключение

`ScreenHost.tsx` сохраняет два технических `<div>`: shadow-root host и imperative legacy-body. Это инфраструктурные DOM-узлы, а не визуальные UI-компоненты.
