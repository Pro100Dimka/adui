# A&D Voice UI — development workspace

This workspace is designed for the exact workflow:

**edit a React component → instantly inspect it in the catalogue/screens → run checks → create the npm package.**

## First run on Windows

1. Install Node.js 20+ (Node 22 is recommended).
2. Extract this archive.
3. Double-click **`START_DEV.cmd`**.

The first run executes `npm install`, then opens the Vite playground in the browser.

## Normal development workflow

```bash
npm install        # first time only
npm run dev        # catalogue + all application screens with HMR
```

Edit components in:

```text
packages/ui/src/
├─ components/
├─ core/
├─ tokens.css
├─ components.css
└─ styles.css
```

The playground imports those source files directly, so **you do not need to rebuild the npm package after every edit**. Save the file and Vite refreshes the browser immediately.

The visual development app is in `apps/playground/`. It contains the component catalogue and approved application screens.

## Before creating a package

```bash
npm run typecheck
npm run build
```

Or double-click **`CHECK_ALL.cmd`**.

## Create the npm package

```bash
npm run package
```

Or double-click **`CREATE_NPM_PACKAGE.cmd`**.

The command:

1. builds `@ad-voice/ui`;
2. runs `npm pack --dry-run`;
3. creates the installable `.tgz` inside `release/`.

Example result:

```text
release/ad-voice-ui-0.1.0.tgz
```

Install it in the karaoke application:

```bash
npm install ../ad-voice-ui-workspace/release/ad-voice-ui-0.1.0.tgz
```

Then:

```tsx
import { Button, Card, TextField } from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";
```

## Version bump + package

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

`CREATE_PATCH_RELEASE.cmd` performs the common patch release (`0.1.0 → 0.1.1`) and creates the `.tgz`.

## Structure

```text
ad-voice-ui-workspace/
├─ packages/
│  └─ ui/                  # the actual @ad-voice/ui npm package
│     └─ src/              # EDIT COMPONENTS HERE
├─ apps/
│  └─ playground/          # live catalogue + all screens
├─ release/                # generated npm .tgz files
├─ scripts/
├─ START_DEV.cmd
├─ CHECK_ALL.cmd
├─ CREATE_NPM_PACKAGE.cmd
└─ package.json
```

## Important architectural detail

During `npm run dev`, Vite aliases `@ad-voice/ui` directly to `packages/ui/src`. That gives immediate HMR while developing the library.

During `npm run package`, only `packages/ui` is compiled and packed. The playground/catalogue is **not** published to consumers of `@ad-voice/ui`.

## Код примеров в каталоге

Код под каждым live-примером теперь строится **автоматически из того же JSX**, который реально рендерит этот пример в `apps/playground/src/catalog/examples.tsx`. Поэтому после изменения примера документация не должна расходиться с тем, что видно сверху.

Например, если `Surface` содержит заголовок и описание, каталог покажет `Surface` вместе с этими дочерними элементами, а не сокращённое `<Surface />`. Кнопка **«Копировать весь пример»** копирует полный пример с импортами и нужным React state.

`npm run check:catalog` проверяет, что у всех 86 компонентов есть живой пример. `CHECK_ALL.cmd` запускает эту проверку автоматически. Классы `sample-*` относятся только к расположению элементов внутри playground и не являются частью `@ad-voice/ui`.

### RotaryKnob

`RotaryKnob` — премиальный процедурный регулятор без картинок. Поддерживает круговое и линейное перетаскивание, внешнюю шкалу, колесо, клавиатуру, точный режим с Shift и двойной щелчок для сброса. См. `packages/ui/docs/ROTARY_KNOB.md`.

## RotaryKnob 0.1.2

`RotaryKnob` is now a direct React port of the supplied `premium-knob-interactive-neon(1).html`; its visual geometry is not restyled by the library.
