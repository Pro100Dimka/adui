# Neo UI

Библиотека React-компонентов `@ad-voice/ui` и документация к ней (playground).

Документация: https://pro100dimka.github.io/adui/

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

Установка в любой проект — из GitHub Release:

```bash
npm install https://github.com/Pro100Dimka/adui/releases/download/v2.7.11/ad-voice-ui-2.7.11.tgz
```

Новая версия:

```bash
npm run release:patch          # или release:minor / release:major — поднимает версию
git commit -am "v<версия>" && git tag v<версия> && git push origin main && git push origin v<версия>
```

По тегу GitHub Actions сам собирает `.tgz` и публикует релиз.

## Документация

```bash
npm run docs     # собирает сайт в docs/, его раздаёт GitHub Pages
```

Использование — в [packages/ui/README.md](packages/ui/README.md).
