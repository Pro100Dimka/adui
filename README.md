# NEO UI

Библиотека React-компонентов `@neo-ui-kit/react` и документация к ней (playground).

Документация: https://pro100dimka.github.io/adui/#/components/overview

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

Запускает typecheck, сборку библиотеки и playground, затем весь набор автоматических тестов.

## npm-пакет

Установить библиотеку в приложение:

```bash
npm install @neo-ui-kit/react
```

Публичный пакет: [@neo-ui-kit/react на npm](https://www.npmjs.com/package/@neo-ui-kit/react).

Пакет содержит ESM, декларации типов и CSS; React 18.2–19 устанавливает приложение. Стили нужно подключить один раз: `import "@neo-ui-kit/react/styles.css"`.

Для проверки изменений до публикации соберите текущие исходники в локальный пакет:

```bash
npm run package
```

Установить полученный архив в отдельное приложение (путь задаётся относительно приложения):

```bash
npm install /path/to/adui/release/neo-ui-kit-react-1.3.0.tgz react react-dom
```

Подготовка новой версии:

```bash
npm run release:patch          # или release:minor / release:major — поднимает версию
npm run check
npm run package
```

Закоммитьте изменения, включая `packages/ui/package.json` и `package-lock.json`, и отправьте коммит в `Pro100Dimka/adui`. Затем создайте и отправьте тег `v<version>`, где `<version>` точно совпадает с версией пакета. Например, после перехода с 1.0.0 на 1.0.1 — `v1.0.1`. Локальные команды выше ничего не публикуют; отправка тега запускает `.github/workflows/release.yml`.

Workflow выполняет `npm run check`, собирает архив и устанавливает его в отдельное тестовое приложение. Затем задача публикации использует environment `npm-publication`, публикует проверенный архив в npm с provenance и прикладывает его к GitHub Release. GitHub Actions авторизуется через OIDC; секрет `NPM_TOKEN` не нужен.

В настройках пакета на npm Trusted Publisher должен соответствовать этому workflow:

| Настройка | Значение |
| --- | --- |
| Provider | GitHub Actions |
| Organization or user | `Pro100Dimka` |
| Repository | `adui` |
| Workflow filename | `release.yml` |
| Environment name | `npm-publication` |

Если настройка npm предлагает выбор разрешённых действий, разрешите `npm publish`. Имя workflow указывается без пути `.github/workflows/`. Для OIDC нужны GitHub-hosted runner, Node.js не ниже 22.14.0, npm не ниже 11.5.1 и `id-token: write` у задачи публикации. [Документация npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/).

Опубликованную версию `1.0.0` нельзя перезаписать. Для исправлений кода или README в npm выпускайте новую версию; изменение README в GitHub само по себе не меняет опубликованный архив. Workflow останавливается, если такая версия уже существует в registry.

Код библиотеки распространяется по лицензии [MIT](packages/ui/LICENSE). Для включённых сторонних материалов сохраняются их лицензии и уведомления: `OFL-PlayfairDisplay.txt` для шрифта и `UPSTREAM-LICENSE.txt` для Quantum Fields.

## Документация

```bash
npm run docs     # собирает сайт в docs/, его раздаёт GitHub Pages
```

Использование — в [packages/ui/README.md](packages/ui/README.md).

## Доказательства проверки текущего checkout

[Итоговый отчёт](evidence/release-report.json) содержит идентификатор и SHA-256 проверенного архива, результаты проверок, измерения до/после и ограничения доступных окружений. [Реестр библиотеки](evidence/library-inventory.json) связывает публичные компоненты, props, экспорты и токены с матрицами сценариев. Файлы `*-audit.json`, исходные `*-red.json`, итоговые `*-green.json` и снимки в `evidence/` сохраняют ход исправлений.

Браузерные проверки используют установленный Playwright и Chrome; задайте `PLAYWRIGHT_PATH` как путь к модулю Playwright, если он не доступен по указанному в скриптах локальному пути. Для проверки production-документации запустите `npm run preview`, задайте `UI_BASE_URL` с её адресом и выполните `node evidence/check-docs.mjs --sweep`. Проверка доступности — `node evidence/check-accessibility.mjs`; ей нужен `axe-core` в `release/consumer-react19/node_modules`.

`evidence/consumer.tsx` — минимальный потребитель только публичных импортов. `check-consumer.mjs <каталог приложения> <имя прогона>` проверяет установленный `.tgz` в браузере; `BROWSER_CHANNEL=msedge` выбирает Edge. `check-package.mjs <каталог приложения>` проверяет entry points, серверную разметку и исключение постороннего кода из bundle Button. Зависимости тестовых приложений находятся в `release/consumer-react18` и `release/consumer-react19` и не входят в Git или npm-пакет.

Ограничения проверки названия NEO UI для международного использования, включая ЕС и США, записаны в [name-screening.json](evidence/name-screening.json). Пакет переименован в `@neo-ui-kit/react`; локальная подготовка артефактов не публикует библиотеку или сайт.
