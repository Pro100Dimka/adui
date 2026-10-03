# Neo UI

Библиотека React-компонентов `@ad-voice/ui` и документация к ней (playground).

```text
packages/ui/       — библиотека (публикуется как npm-пакет)
apps/playground/   — сайт документации: по странице на компонент
```

## Разработка

Нужен Node.js 20+.

```bash
npm install
npm run dev
```

На Windows можно дважды щёлкнуть `START_DEV.cmd`.

Playground подключает исходники `packages/ui/src` напрямую, поэтому изменения видны сразу, без пересборки пакета.

## Компонент

Один компонент — одна папка:

```text
packages/ui/src/components/<категория>/<Component>/
├─ <Component>.tsx   реализация
├─ styles.css        стили (подключить в src/components.css)
├─ example.tsx       живой пример для документации
└─ meta.ts           название, описание, категория навигации
```

Новый публичный компонент нужно экспортировать из `packages/ui/src/index.ts`. Поле `category` в `meta.ts` — это id раздела из `apps/playground/src/catalog/catalogNavigation.ts`.

## Проверка

```bash
npm run check
```

Запускает typecheck и сборку библиотеки и playground.

## npm-пакет

```bash
npm run package          # release/ad-voice-ui-<версия>.tgz
npm run release:patch    # поднять patch-версию и собрать .tgz
```

Установка в другой проект:

```bash
npm install ../adui/release/ad-voice-ui-1.2.0.tgz
```

Использование — в [packages/ui/README.md](packages/ui/README.md).
