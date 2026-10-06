# @ad-voice/ui

Neo UI — React + TypeScript UI kit: glass/ruby surfaces, animated neon borders, fields, tabs, dialogs, audio controls and a melody editor.

## Install

Live docs: https://pro100dimka.github.io/adui/

The package is installed from its GitHub release; React and ReactDOM are peer dependencies.

```bash
npm install https://github.com/Pro100Dimka/adui/releases/download/v2.7.11/ad-voice-ui-2.7.11.tgz react react-dom
```

Import the stylesheet once in the app entry point:

```ts
import "@ad-voice/ui/styles.css";
```

## Theme

Two colours build the whole palette (a primary scale, a secondary scale and tinted neutrals):

```tsx
import { ThemeProvider } from "@ad-voice/ui";

<ThemeProvider theme="violet">…</ThemeProvider>            // a ready pair
<ThemeProvider primary="#2f7bff" secondary="#9cc4ff">…</ThemeProvider>
<ThemeProvider tokens={{ "primary-900": "#0a1430" }}>…</ThemeProvider> // any token by hand
```

## Usage

```tsx
import { Button, Card, Switch, TextField } from "@ad-voice/ui";

export function SettingsCard() {
  return (
    <Card title="Настройки" border>
      <TextField label="Имя в онлайн-комнате" defaultValue="BBB" clearable />
      <Switch label="Радио включено" defaultChecked />
      <Button variant="primary" icon="save">
        Сохранить
      </Button>
    </Card>
  );
}
```

Every stateful component works both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`).

## Entry points

```ts
import { Button, Card, Dialog, AudioPlayer } from "@ad-voice/ui";
import { PianoRollGrid } from "@ad-voice/ui/editor";
import { Router } from "@ad-voice/ui/router";
import { Form, FormFields, useForm } from "@ad-voice/ui/forms";
import { ThemeProvider, useMotion } from "@ad-voice/ui/core";
```

## RotaryKnob

Canvas-rendered volume knob. Drag near the edge to rotate, drag from the center to move linearly, click the outer scale to jump. Wheel and arrow keys change the value, Shift gives a fine step, PageUp/PageDown change by 10, Home/End set 0/100, Escape cancels a drag, double-click resets. `onValueChange` fires while adjusting, `onValueCommit` after the gesture. `readOnly` turns it into a gauge.
