# @ad-voice/ui

React + TypeScript UI kit for A&D Voice. It contains the shared visual system extracted from the approved A&D Voice screens: glass/ruby surfaces, animated neon borders, fields, tabs, dialogs, audio controls, composite cards and melody-editor primitives.

## Install

```bash
npm install @ad-voice/ui
```

React and ReactDOM are peer dependencies.

```bash
npm install react react-dom
```

## Styles

Import the shared stylesheet once in your app entry point:

```ts
import "@ad-voice/ui/styles.css";
```

## Basic usage

```tsx
import { Button, Card, Field, TextField, Switch } from "@ad-voice/ui";
import "@ad-voice/ui/styles.css";

export function SettingsCard() {
  return (
    <Card animatedBorder>
      <Field label="Имя в онлайн-комнате">
        <TextField defaultValue="BBB" clearable />
      </Field>

      <Switch label="Радио включено" defaultChecked />

      <Button variant="primary" icon="save">
        Сохранить
      </Button>
    </Card>
  );
}
```

## Entry points

```ts
import { Button, Card, Dialog, AudioPlayer } from "@ad-voice/ui";
import { PianoRollGrid, NoteBlock, PianoKeyboard } from "@ad-voice/ui/editor";
import { RecordingCard, ProcessingTaskCard } from "@ad-voice/ui/composites";
import { MotionProvider, ThemeProvider } from "@ad-voice/ui/core";
```

`@ad-voice/ui/editor` is separate so applications that only need settings/forms do not have to import editor components.

## Build locally

```bash
npm install
npm run typecheck
npm run build
npm run pack:check
```

The package emits ESM JavaScript, source maps and TypeScript declarations into `dist/`.

## Local development from your karaoke repository

You can install this folder without publishing it:

```json
{
  "dependencies": {
    "@ad-voice/ui": "file:../ad-voice-ui"
  }
}
```

Then:

```bash
npm install
```

For active development, npm workspaces or `npm link` also work.

## Publishing

The package is scoped. For a public npm publication:

```bash
npm login
npm publish --access public
```

Before publishing under `@ad-voice`, that npm scope must belong to your npm account/organization. If not, change the `name` in `package.json`, for example to `@your-scope/ad-voice-ui`.

## Design-system rule

Application-specific names such as `SaveButton` or `JoinButton` should normally not become primitives. Use a shared `Button` variant and compose application-specific components from it. The same rule applies to fields, cards and dialogs.

## CircularGauge и RotaryKnob

`CircularGauge` — read-only индикатор значения. `RotaryKnob` использует тот же визуальный face, но является интерактивным `role="slider"`.

```tsx
<CircularGauge value={72} label="Микрофон" icon="mic" />

<RotaryKnob
  value={volume}
  onValueChange={setVolume}
  onValueCommit={saveVolume}
  label="Громкость"
  icon="volume"
/>
```

`RotaryKnob` поддерживает drag по кругу, колесо мыши, стрелки, PageUp/PageDown, Home/End, Shift для точного шага и двойной клик для сброса.
